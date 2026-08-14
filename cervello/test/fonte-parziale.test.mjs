// AR-427 e AR-424 — la porzione di fonte che NON abbiamo letto deve arrivare al verdetto.
//
// Stessa malattia di AR-419/429, vista sulle fonti che non sono git: un guardiano legge una parte
// della sua fonte, e della parte mancante non resta traccia. Il verdetto esce rassicurante perché
// è calcolato solo su ciò che si è riusciti a guardare.
//
//   · AR-427 — `scan-segreti` saltava con un `continue` muto ogni file oltre i 2 MB e continuava a
//     dire «nessun segreto in N file». I JSON che la macchina genera crescono a ogni giro
//     (cantiere-difetti e auto-radiografia sono già oltre il mezzo mega): il giorno in cui il primo
//     supera il tetto, la difesa si spegne proprio sul file più grosso — e non lo dice.
//   · AR-424 — `freno-costi` leggeva il blocco `oggi` di costo-ai.json senza guardarne la data.
//     Misurato il 29/7: `oggi.data` era 2026-07-28 con `token_totali: 0`, e il freno rispondeva
//     «lascia, 0 token sotto la soglia di 2.000.000» — via libera alla spesa sulla base di un
//     giorno già finito. Uno zero vecchio non è un consumo basso: è nessuna informazione.

import { test } from "node:test";
import * as fsMod from "node:fs";
import assert from "node:assert/strict";
import { classificaPerDimensione, verdetto } from "../scan-segreti.mjs";
import { decidiFrenoCosto, FONTI, gateAmmesso, tokenPerGate } from "../fonte-numero.mjs";

// ── AR-427: lo scanner dei segreti ──────────────────────────────────────────

test("AR-427: il CASO REALE — un file oltre il tetto viene LETTO A BLOCCHI, non ignorato", () => {
  // Il cuore del fix, eseguito. Prima questo caso spariva in un `continue` muto insieme alle
  // cartelle: due cose diverse trattate uguale, e una delle due era un buco nella difesa.
  //
  // **Aggiornato dal lotto 40 (AR-441).** Fino a ieri la risposta giusta era `non-letto`: il file
  // grosso finiva fra i non raggiunti e il verdetto diventava CIECO. Era onesto ma non era la cura —
  // e AR-441 ha misurato dove stava andando a finire: `cantiere-difetti.json` è a 1,70 MB, l'85% del
  // tetto, e cresce a ogni giro. Il giorno in cui lo superava, lo scanner avrebbe smesso di guardare
  // proprio il file più grosso, suonando a ogni giro finché qualcuno non lo zittiva. Ora si legge
  // per davvero, a blocchi, con una coda che tiene intera una chiave spezzata a cavallo del taglio.
  //
  // Ciò che AR-427 difendeva resta intatto ed è quello che conta: un file oltre il tetto non può
  // MAI essere spacciato per pulito. Prima lo si diceva col ⚪, ora lo si risolve leggendolo.
  const grosso = classificaPerDimensione({ isFile: true, size: 3_000_000 });
  assert.equal(grosso.azione, "leggi-a-blocchi");
  assert.notEqual(grosso.azione, "ignora", "un file grosso non torna mai a sparire in un continue muto");
  assert.match(grosso.motivo, /3000 kB/, "deve dire QUANTO era grande, non solo che era grande");

  // Un file normale si legge, come sempre: il fix non ha reso lo scanner cieco.
  assert.equal(classificaPerDimensione({ isFile: true, size: 1200 }).azione, "leggi");
  // Una cartella non è un file «saltato»: non c'era niente da leggere, e non va nei non raggiunti.
  assert.equal(classificaPerDimensione({ isFile: false, size: 0 }).azione, "ignora");
  // Esattamente sul tetto si legge ancora: la soglia è «oltre», non «da».
  assert.equal(classificaPerDimensione({ isFile: true, size: 2_000_000 }).azione, "leggi");
});

test("AR-427: classificaPerDimensione accetta anche un vero statSync", () => {
  // La forma che usa il ciclo davvero: se accettasse solo l'oggetto delle prove, il test sarebbe
  // verde su un ingresso che nel codice non passa mai di lì.
  const { statSync } = require_fs();
  const st = statSync(new URL("../scan-segreti.mjs", import.meta.url));
  assert.equal(classificaPerDimensione(st).azione, "leggi");
  assert.equal(classificaPerDimensione(st, 10).azione, "leggi-a-blocchi", "con un tetto di 10 byte si passa alla lettura a blocchi (AR-441), non si rinuncia");
});

test("AR-427: un file non letto rende il verdetto CIECO, non «pulito»", () => {
  const v = verdetto({
    letti: 2105,
    nonRaggiunti: ["MyCity-Vault/.../cantiere-difetti.json (2400 kB: oltre il tetto di lettura)"],
    trovati: [],
  });
  assert.equal(v.esito, "cieco");
  assert.equal(v.codice, 2, "il contratto AR-322: 2 = non ho potuto misurare, e 2 non è 0");
  assert.notEqual(v.esito, "pulito");
});

test("AR-427: il verdetto NOMINA il motivo per cui non ha letto", () => {
  // Senza il motivo, «cieco» costringe chi legge a indovinare se è un percorso rotto o una scelta
  // nostra — e sono due azioni diverse (aggiustare la porta, oppure scansionare a blocchi).
  const v = verdetto({ letti: 10, nonRaggiunti: ["grosso.json (2400 kB: oltre il tetto di lettura)"], trovati: [] });
  assert.match(v.sintesi, /NON sono riuscito ad aprire/);
  assert.match(v.sintesi, /oltre il tetto/);
});

test("AR-427: un segreto TROVATO resta il problema più urgente", () => {
  // L'ordine di precedenza non deve essersi invertito col fix: un file non letto non può nascondere
  // un segreto che invece abbiamo visto.
  const v = verdetto({
    letti: 5,
    nonRaggiunti: ["grosso.json (2400 kB: oltre il tetto di lettura)"],
    trovati: [{ file: "a.mjs", regola: "stripe", campione: "sk_live_…" }],
  });
  assert.equal(v.esito, "trovato");
  assert.equal(v.codice, 1);
});

test("AR-427: senza niente di saltato il verdetto resta «pulito»", () => {
  // La prova che il fix non ha reso lo scanner cieco per sempre: un cancello sempre rosso viene
  // aggirato al secondo giro.
  const v = verdetto({ letti: 2106, nonRaggiunti: [], trovati: [] });
  assert.equal(v.esito, "pulito");
  assert.equal(v.codice, 0);
});

// ── AR-424: il freno sulla spesa ────────────────────────────────────────────

test("AR-424: un contatore di IERI non autorizza la spesa di oggi", () => {
  // Il caso reale del 29/7, eseguito: prima dava «lascia», ora deve dare «cieco».
  const misura = tokenPerGate({ data: "2026-07-28", runs: 11, token_totali: 0, token_stimati: 0 }, "2026-07-29");
  assert.equal(misura.fonte, FONTI.SCADUTA);
  assert.equal(misura.valore, null);

  const v = decidiFrenoCosto({ valore: misura.valore, fonte: misura.fonte, soglia: 2_000_000 });
  assert.equal(v.azione, "cieco");
  assert.notEqual(v.azione, "lascia", "un giorno finito non è un consumo basso");
  assert.match(v.motivo, /giorno già finito/);
});

test("AR-424: lo stesso giorno si misura eccome", () => {
  const misura = tokenPerGate({ data: "2026-07-29", runs: 3, token_totali: 120_000 }, "2026-07-29");
  assert.equal(misura.fonte, FONTI.MISURA);
  assert.equal(misura.valore, 120_000);
  assert.equal(decidiFrenoCosto({ ...misura, soglia: 2_000_000 }).azione, "lascia");
});

test("AR-424: lo stesso giorno, oltre soglia, FRENA ancora", () => {
  // La prova che il fix non ha smontato il freno: se il consumo di oggi supera il tetto, frena.
  const misura = tokenPerGate({ data: "2026-07-29", runs: 9, token_totali: 3_000_000 }, "2026-07-29");
  const v = decidiFrenoCosto({ valore: misura.valore, fonte: misura.fonte, soglia: 2_000_000 });
  assert.equal(v.azione, "frena");
});

test("AR-424 (d): un giorno con ZERO run è un foglio bianco, non un consumo basso", () => {
  // `runs: 0` significa che la macchina non ha ancora girato oggi. Dedurne «si può spendere» è
  // dare il permesso in base al fatto che non si è ancora speso.
  const misura = tokenPerGate({ data: "2026-07-29", runs: 0, token_totali: 0, token_stimati: 0 }, "2026-07-29");
  assert.equal(misura.fonte, FONTI.ASSENTE);
  assert.equal(decidiFrenoCosto({ valore: misura.valore, fonte: misura.fonte, soglia: 2_000_000 }).azione, "cieco");
});

test("AR-424: uno ZERO misurato con run veri resta uno zero valido", () => {
  // La differenza che regge tutto AR-196: 0 misurato ≠ campo assente. Undici run che hanno
  // consumato zero token reali sono una misura, e non devono diventare «cieco».
  const misura = tokenPerGate({ data: "2026-07-29", runs: 11, token_totali: 0, token_stimati: 385_000 }, "2026-07-29");
  assert.equal(misura.fonte, FONTI.MISURA);
  assert.equal(misura.valore, 385_000, "vince il più alto fra reali e stimati");
});

test("AR-424: senza la data di oggi la funzione resta pura e non inventa un verdetto", () => {
  // Chi non dichiara «che giorno è oggi» non può ottenere il controllo di scadenza: la funzione non
  // legge l'orologio da sé, così i test la mettono in entrambe le condizioni senza spostare il tempo.
  const misura = tokenPerGate({ data: "2026-07-28", runs: 11, token_stimati: 385_000 });
  assert.equal(misura.fonte, FONTI.MISURA);
});

test("AR-424: «scaduta» è vietata a un gate, come «assente» e «prosa»", () => {
  // La cura sta nel canale già esistente: la fonte dichiara se stessa inutilizzabile, invece di un
  // caso speciale bullonato sul chiamante.
  assert.equal(gateAmmesso(FONTI.SCADUTA).ammesso, false);
  assert.equal(gateAmmesso(FONTI.MISURA).ammesso, true);
});

function require_fs() {
  return fsMod;
}
