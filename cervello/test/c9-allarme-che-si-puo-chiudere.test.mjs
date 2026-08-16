// AR-285 — «La sentinella della cassa suona da duecentocinquantasei giri e nessuno la può spegnere.»
//
// La radice, al quinto perché: la macchina sa RILEVARE un blocco ma non sa CHIUDERE l'escalation —
// non ha il concetto di «richiesta pendente a un umano», quindi ripete la diagnosi al posto di
// custodire la domanda. Costo: un lavoro AI e una card al giorno bruciati su una domanda già fatta,
// mentre la coda è satura. E il danno peggiore: la sentinella grida al lupo sullo stesso lupo tutti
// i giorni, quindi il giorno in cui griderà per un motivo NUOVO nessuno la starà più ascoltando.
//
// La cura non è un tasto «silenzia» — quello è una lampadina svitata. È una presa in carico CON
// SCADENZA, e un ripescaggio automatico quando la scadenza passa.
//
// NON-VACUITÀ (eseguita): togliendo da `verdettoAllarme` il ramo che rifiuta una presa in carico
// senza `fino` leggibile, il caso «senza scadenza» smette di suonare e il test diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { GIRI_PER_CRONICO, STATO_ALLARME, firmaCausa, verdettoAllarme } from "../presa-in-carico.mjs";

const GIORNO = 86_400_000;
const OGGI = Date.UTC(2026, 7, 15);

test("AR-285 — senza nessuna presa in carico l'allarme suona, e dopo N giri è CRONICO", () => {
  const v = verdettoAllarme({ acceso: true, giriConsecutivi: 256, adessoMs: OGGI });
  assert.equal(v.suona, true);
  assert.equal(v.stato, STATO_ALLARME.CRONICO);
  assert.match(v.motivo, /256 giri/, "il numero di giri va detto: «acceso da un minuto» e «acceso da settimane» non si leggono uguale");
});

test("AR-285 — al primo giro non è ancora cronico: un allarme nuovo è una notizia", () => {
  assert.equal(verdettoAllarme({ acceso: true, giriConsecutivi: 1, adessoMs: OGGI }).stato, STATO_ALLARME.NUOVO);
  assert.equal(verdettoAllarme({ acceso: true, giriConsecutivi: GIRI_PER_CRONICO, adessoMs: OGGI }).stato, STATO_ALLARME.CRONICO);
});

test("AR-285 — IL PUNTO: preso in carico con una scadenza, l'allarme sta zitto", () => {
  const v = verdettoAllarme({
    acceso: true,
    giriConsecutivi: 256,
    presaInCarico: { da: "2026-08-10", motivo: "chiedo il saldo in banca a Nicola", fino: "2026-09-15" },
    adessoMs: OGGI,
  });
  assert.equal(v.suona, false, "la domanda è già stata fatta: rifarla ogni giro è il difetto");
  assert.equal(v.stato, STATO_ALLARME.IN_CARICO);
  assert.equal(v.giorni_in_attesa, 5);
  assert.equal(v.giorni_alla_scadenza, 31);
});

test("AR-285 — IL PALETTO: una presa in carico SENZA scadenza non vale, e l'allarme resta acceso", () => {
  const v = verdettoAllarme({
    acceso: true,
    giriConsecutivi: 256,
    presaInCarico: { da: "2026-08-10", motivo: "ci penso", fino: "" },
    adessoMs: OGGI,
  });
  assert.equal(v.suona, true, "un allarme spento senza data è una lampadina svitata: nessuno se ne ricorda più");
  assert.match(v.motivo, /interruttore/);
});

test("AR-285 — scaduta la presa in carico l'allarme TORNA, e torna più in alto", () => {
  const zitto = verdettoAllarme({ acceso: true, giriConsecutivi: 256, presaInCarico: { da: "2026-06-01", motivo: "x", fino: "2026-09-15" }, adessoMs: OGGI });
  const dopo = verdettoAllarme({ acceso: true, giriConsecutivi: 256, presaInCarico: { da: "2026-06-01", motivo: "x", fino: "2026-08-01" }, adessoMs: OGGI });
  assert.equal(dopo.suona, true);
  assert.equal(dopo.stato, STATO_ALLARME.SCADUTA);
  assert.ok(dopo.priorita > zitto.priorita, "l'escalation è per ANZIANITÀ, non per ripetizione: la card sale invece di duplicarsi");
  assert.match(dopo.motivo, /scaduta il 2026-08-01/);
});

test("AR-285 — più giorni passano dalla scadenza, più la priorità sale", () => {
  const p = (giorniOltre) =>
    verdettoAllarme({
      acceso: true,
      giriConsecutivi: 10,
      presaInCarico: { da: "2026-06-01", motivo: "x", fino: new Date(OGGI - giorniOltre * GIORNO).toISOString().slice(0, 10) },
      adessoMs: OGGI,
    }).priorita;
  assert.ok(p(10) > p(2), "una domanda vecchia deve salire in cima, non restare dov'è");
});

test("AR-285 — se la condizione si risolve tutto si azzera: se torna, è nuova di nuovo", () => {
  const v = verdettoAllarme({ acceso: false, giriConsecutivi: 256, presaInCarico: { da: "2026-06-01", motivo: "x", fino: "2026-09-15" }, adessoMs: OGGI });
  assert.equal(v.stato, STATO_ALLARME.SPENTO);
  assert.equal(v.suona, false);
});

// ── La quarta clausola del fix, quella che salta sempre ─────────────────────────────────────────

test("AR-285 — il CONTATORE DEI GIRI esce dalla firma di dedup: era il motivo per cui non agganciava", () => {
  const a = firmaCausa({ sensore: "cassa-runway", causa: "sensore cieco da 255 giri" });
  const b = firmaCausa({ sensore: "cassa-runway", causa: "sensore cieco da 256 giri" });
  assert.equal(a, b, "con il contatore dentro la firma cambiava a ogni giro, quindi il dedup non agganciava mai");
});

test("AR-285 — due cause DIVERSE restano due firme diverse: il dedup non deve inghiottire tutto", () => {
  const a = firmaCausa({ sensore: "cassa-runway", causa: "manca la banca" });
  const b = firmaCausa({ sensore: "cassa-runway", causa: "manca il burn" });
  assert.notEqual(a, b);
});
