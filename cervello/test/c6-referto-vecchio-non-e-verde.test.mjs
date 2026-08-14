#!/usr/bin/env node
// 🧪 AR-215 — UN REFERTO VECCHIO NON È UN REFERTO VERDE.
//
// Le «Mosse di Nicola» (intenzioni-nicola.json) sono rimaste ferme al 23 luglio e nessun guardiano
// se n'è accorto: lo spec autorizzava a lasciare il file com'è quando «non c'è niente di nuovo», e a
// business fermo non c'è mai niente di nuovo — quel permesso rende «niente di nuovo» indistinguibile
// da «nessuno l'ha guardato». La causa di sistema è più larga: la freschezza era cablata come toppa
// per-file (una per la checklist, una per gli OKR, una per l'intelligence), quindi ogni file NUOVO
// nasceva scoperto e si scopriva stantio solo per incidente.
//
// Qui si prova il registro unico e le tre risposte. Il caso che conta è il terzo: ⚪ «non l'ho
// potuto vedere» non deve MAI valere come verde — con due soli esiti cadrebbe nel primo, ed è
// esattamente così che questo difetto è sopravvissuto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
const S = await import(join(REPO, "cervello/salute.mjs"));

const ADESSO = Date.parse("2026-07-26T11:00:00+02:00"); // tre giorni dopo l'ultimo aggiornamento vero

test("un referto dentro la sua scadenza è fresco, e solo lui è verde", () => {
  const r = M.etaReferto({ dato: { aggiornato: "2026-07-26 09:00" }, scadenzaOre: 48, adessoMs: ADESSO, nome: "Le mosse di Nicola" });
  assert.equal(r.stato, M.FRESCO);
  assert.equal(r.verde, true);
});

test("le Mosse di Nicola ferme da tre giorni sono STANTIE, non a posto", () => {
  const r = M.etaReferto({ dato: { data: "2026-07-23 11:35" }, scadenzaOre: 48, adessoMs: ADESSO, nome: "Le mosse di Nicola" });
  assert.equal(r.stato, M.STANTIO);
  assert.equal(r.verde, false, "il file che risponde a «cosa sto per fare» era di tre giorni prima e passava per buono");
  assert.match(r.perche, /di allora/);
});

test("⚪ NON È MAI UN VERDE: file assente, senza timbro, o senza scadenza dichiarata", () => {
  const assente = M.etaReferto({ dato: null, scadenzaOre: 48, adessoMs: ADESSO, nome: "X" });
  const senzaTimbro = M.etaReferto({ dato: { roba: 1 }, scadenzaOre: 48, adessoMs: ADESSO, nome: "X" });
  const senzaScadenza = M.etaReferto({ dato: { aggiornato: "2026-07-26 09:00" }, scadenzaOre: null, adessoMs: ADESSO, nome: "X" });
  for (const r of [assente, senzaTimbro, senzaScadenza]) {
    assert.equal(r.stato, M.NON_VISTO);
    assert.equal(r.verde, false, "un buco dichiarato non può comprare il verde");
  }
});

test("la scadenza sta ACCANTO AL DATO e vince sul registro di chi legge", () => {
  const dato = { timbro: { quando: "2026-07-26 09:00", scade_dopo_ore: 1 } };
  const r = M.etaReferto({ dato, scadenzaOre: 999, adessoMs: ADESSO, nome: "X" });
  assert.equal(r.stato, M.STANTIO, "il file dice che vale un'ora: chi lo legge non può allungargliela");
  assert.equal(r.scadenza_ore, 1);
});

test("l'età si misura sul timbro DENTRO il dato, non sulla data del file", () => {
  // Un git checkout riscrive la data di modifica di tutto il repo: se l'età venisse da lì, dopo un
  // clone ogni referto risulterebbe scritto adesso e la macchina si dichiarerebbe fresca in blocco.
  const r = M.etaReferto({ dato: { data: "2026-07-23 11:35" }, scadenzaOre: 48, adessoMs: ADESSO, nome: "X" });
  assert.equal(r.quando, "2026-07-23 11:35", "il verdetto deve citare il timbro che ha letto");
  assert.ok(r.eta_ore > 48);
});

test("il registro unico copre le Mosse di Nicola e dice chi le rigenera", () => {
  const mosse = M.REGISTRO_FRESCHEZZA.find((r) => r.percorso === "intenzioni-nicola.json");
  assert.ok(mosse, "il file che il Pannello mostra deve stare nella tabella: chi non c'è nasce scoperto");
  assert.ok(mosse.scadenzaOre > 0 && mosse.rigenera, "età massima e chi lo rigenera, non solo il nome");
  assert.ok(M.REGISTRO_FRESCHEZZA.length >= 5, "una tabella sola per tutti i file, non una toppa per file");
});

test("il gruppo: uno stantio fa rosso, un ⚪ non fa verde, il vuoto nemmeno", () => {
  const fresco = M.etaReferto({ dato: { aggiornato: "2026-07-26 09:00" }, scadenzaOre: 48, adessoMs: ADESSO, nome: "A" });
  const stantio = M.etaReferto({ dato: { aggiornato: "2026-07-23 09:00" }, scadenzaOre: 48, adessoMs: ADESSO, nome: "B" });
  const cieco = M.etaReferto({ dato: null, scadenzaOre: 48, adessoMs: ADESSO, nome: "C" });
  assert.equal(M.verdettoReferti([fresco, fresco]).verde, true);
  assert.equal(M.verdettoReferti([fresco, stantio]).stato, M.STANTIO);
  assert.equal(M.verdettoReferti([fresco, cieco]).verde, false);
  assert.equal(M.verdettoReferti([]).verde, false, "«non ho guardato niente» non è «va tutto bene»");
});

test("la VISITA adesso ha un controllo che se ne accorge, e legge i file veri", () => {
  // Non un pattern nel sorgente: si esegue il controllo vero sul vault vero, con l'orologio fermato
  // al futuro — così qualunque referto risulta oltre la sua scadenza e il verdetto DEVE essere rosso.
  const fraUnAnno = Date.parse("2027-08-14T10:00:00+02:00");
  const esito = S.giudicaFreschezza(S.leggiReferti(REPO, fraUnAnno));
  assert.equal(esito.esito, "rotto", "con tutti i referti scaduti la visita non può dire che va bene");
  assert.ok(esito.dati.stantii.length >= 3);

  const controllo = S.CONTROLLI.find((c) => c.id === "cervello.freschezza");
  assert.ok(controllo, "il controllo deve stare nell'elenco della visita, o non gira mai");
  assert.equal(controllo.impatto, 2, "un file vecchio mostrato al presente fa mentire il Pannello a Nicola");
});
