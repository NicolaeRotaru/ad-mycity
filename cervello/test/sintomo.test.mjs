#!/usr/bin/env node
// 🩺 IL SINTOMO — la prova che «non ha girato» non diventa mai «guarito».
//
// Nicola, 16/8: «trova il modo per sapere se i 138 difetti sono ancora rotti».
//
// Questo banco esegue la decisione vera di `cervello/sintomo.mjs` — non cerca parole in un file, che
// è la malattia che quel modulo cura. Ogni caso qui sotto è un modo in cui la macchina si è già
// comprata un verde, oppure se lo comprerebbe se nessuno guardasse:
//
//   · il comando esplode e l'errore diventa uno zero rassicurante  (malattia `cieco-che-torna-una-misura`)
//   · la misura cerca la parola della CURA dentro un .md            (AR-128: la parola si scrive, il sensore no)
//   · `grep -c` esce in codice 1 perché ha contato zero, e la guarigione vera finisce fra i buchi
//   · un sintomo dichiarato che alla nascita non era nemmeno rotto: misura un'altra cosa
//
// Si esegue con: node --test cervello/test/sintomo.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const {
  DEBOLE,
  FORTE,
  NON_MISURATO,
  ROTTO,
  SANO,
  contaEsiti,
  forzaSintomo,
  verdettoDelDifetto,
  misuraLaMalattia,
  numeroDa,
  sintomoValido,
  soddisfa,
  verdettoSintomo,
} = await import(join(QUI, "..", "sintomo.mjs"));

/** Un sintomo ben formato, usato come base dai casi che ne cambiano un pezzo solo. */
const SANO_DI_FORMA = {
  misura: "node cervello/sensori-che-mancano.mjs --conta",
  rotto_se: { ">=": 1 },
  alla_nascita: 3,
};

// ─────────────────────────── ① i tre esiti, davvero tre ───────────────────────────

test("il sintomo che si riproduce dice ROTTO, col numero che l'ha detto", () => {
  const v = verdettoSintomo({ sintomo: SANO_DI_FORMA, uscita: "2", codice: 0 });
  assert.equal(v.esito, ROTTO);
  assert.equal(v.valore, 2);
});

test("il sintomo che non si riproduce più dice SANO, e cita quanto valeva alla nascita", () => {
  const v = verdettoSintomo({ sintomo: SANO_DI_FORMA, uscita: "0", codice: 0 });
  assert.equal(v.esito, SANO);
  assert.equal(v.valore, 0);
  assert.match(v.perche, /alla nascita era 3/);
});

test("il comando che esplode NON diventa guarito: è un buco dichiarato", () => {
  const v = verdettoSintomo({ sintomo: SANO_DI_FORMA, errore: "command not found", codice: 127 });
  assert.equal(v.esito, NON_MISURATO, "un errore che diventa una misura è la malattia cieco-che-torna-una-misura");
  assert.notEqual(v.esito, SANO);
  assert.equal(v.valore, null);
});

test("l'uscita che non è un numero non si interpreta: NON MISURATO", () => {
  const v = verdettoSintomo({ sintomo: SANO_DI_FORMA, uscita: "tutto a posto ✅", codice: 0 });
  assert.equal(v.esito, NON_MISURATO);
  assert.notEqual(v.esito, SANO);
});

// ─────────────────── ② il codice d'uscita non compra e non toglie il verdetto ───────────────────

test("grep -c che conta zero esce in codice 1: resta una guarigione, non un buco", () => {
  // Questo è il caso che, letto male, cancella OGNI guarigione vera dal conto: `grep -c` esce 1
  // proprio quando la malattia è sparita del tutto.
  const v = verdettoSintomo({ sintomo: SANO_DI_FORMA, uscita: "0", codice: 1 });
  assert.equal(v.esito, SANO);
  assert.equal(v.valore, 0);
});

test("nessun numero E codice diverso da zero: allora sì che è esploso davvero", () => {
  const v = verdettoSintomo({ sintomo: SANO_DI_FORMA, uscita: "", codice: 2 });
  assert.equal(v.esito, NON_MISURATO);
  assert.match(v.perche, /codice 2/);
});

// ─────────────────── ③ la regola anti-compiacenza: il metro non si compra ───────────────────

test("cercare la parola della cura dentro un .md non è un sintomo: è AR-128 rifatto", () => {
  const esito = misuraLaMalattia("grep -c chargeback cervello/sentinelle.md");
  assert.equal(esito.ok, false);
  assert.match(esito.motivo, /AR-128/);
});

test("e il verdetto lo rifiuta a monte, senza nemmeno guardare il numero", () => {
  const v = verdettoSintomo({
    sintomo: { misura: "grep -c chargeback cervello/sentinelle.md", rotto_se: { "<=": 0 }, alla_nascita: 0 },
    uscita: "0",
    codice: 0,
  });
  assert.equal(v.esito, NON_MISURATO, "un metro comprabile non produce un verdetto, nemmeno rosso");
});

test("contare dentro il CODICE resta ammesso: per cambiare il conto bisogna cambiare il codice", () => {
  assert.equal(misuraLaMalattia("grep -c 'catch' cervello/costo-ai.mjs").ok, true);
  assert.equal(misuraLaMalattia("node cervello/salute.mjs --conta-rossi").ok, true);
});

// ─────────────────── ③bis la forza: un grep sul codice conta la parola, non la cosa ───────────────────

test("contare una parola nel codice è un metro DEBOLE, e va detto", () => {
  // Misurato davvero il 16/8: `grep -l chargeback cervello/*.mjs` dà 7, e sembra dire «ci sono 7
  // sensori». Dice che 7 file nominano la parola, spesso nel commento che spiega perché manca.
  assert.equal(forzaSintomo("grep -rl 'chargeback' cervello/*.mjs"), DEBOLE);
});

test("leggere il dato che la macchina produce, o farla rispondere di sé, è un metro FORTE", () => {
  assert.equal(forzaSintomo("node cervello/salute.mjs --conta-rossi"), FORTE);
  assert.equal(forzaSintomo("node -e \"…auto-coscienza/cassa-runway.json…\""), FORTE);
  assert.equal(forzaSintomo("find . -type d -name memoria-squadra | wc -l"), FORTE);
});

// ─────────────────── ④ il contratto: un sintomo dichiarato male non passa ───────────────────

test("un sintomo che alla nascita non era rotto misura un'altra cosa", () => {
  const esito = sintomoValido({ ...SANO_DI_FORMA, alla_nascita: 0 });
  assert.equal(esito.valido, false);
  assert.match(esito.motivo, /non misura questo difetto/);
});

test("senza `alla_nascita` un «sano» non si distingue da un «non l'ho mai visto rotto»", () => {
  const { alla_nascita, ...senza } = SANO_DI_FORMA;
  assert.equal(sintomoValido(senza).valido, false);
});

test("nessun sintomo dichiarato è NON MISURATO, non «a posto»", () => {
  assert.equal(verdettoSintomo({ sintomo: undefined, uscita: "0" }).esito, NON_MISURATO);
  assert.equal(verdettoSintomo({}).esito, NON_MISURATO);
});

test("un operatore fuori contratto non passa per buono", () => {
  assert.equal(sintomoValido({ ...SANO_DI_FORMA, rotto_se: { "~": 1 } }).valido, false);
  assert.equal(sintomoValido({ ...SANO_DI_FORMA, rotto_se: { ">=": 1, "<=": 9 } }).valido, false);
});

// ────── ④bis le clausole: il caso vero in cui questo strumento si è comprato un verde ──────

test("una clausola rotta basta: il difetto è rotto anche se le altre tacciono", () => {
  // AR-216, 16/8. Clausola (a): la cartella doppia è sparita → tace. Clausola (b): la ricerca del
  // Pannello legge ancora solo dentro il vault, e i quaderni vivi stanno alla radice → parla.
  // Col sintomo singolo lo strumento aveva stampato «non si riproduce più»: un falso guarito.
  const v = verdettoDelDifetto([
    { esito: SANO, perche: "le cartelle sono tornate una" },
    { esito: ROTTO, perche: "la ricerca non guarda fuori dal vault" },
  ]);
  assert.equal(v.esito, ROTTO);
  assert.match(v.perche, /1 clausole su 2/);
});

test("una clausola cieca non si arrotonda a guarita: nessuno sa cosa dica", () => {
  const v = verdettoDelDifetto([{ esito: SANO, perche: "tace" }, { esito: NON_MISURATO, perche: "non è girata" }]);
  assert.equal(v.esito, NON_MISURATO);
  assert.notEqual(v.esito, SANO);
});

test("solo quando TUTTE tacciono il difetto è sano, e lo dice quante erano", () => {
  const v = verdettoDelDifetto([{ esito: SANO, perche: "tace" }, { esito: SANO, perche: "tace pure" }]);
  assert.equal(v.esito, SANO);
  assert.match(v.perche, /tutte e 2/);
});

test("nessuna clausola osservata non è un verde", () => {
  assert.equal(verdettoDelDifetto([]).esito, NON_MISURATO);
});

// ─────────────────── ⑤ i pezzi che il verdetto usa ───────────────────

test("il numero è l'ULTIMO stampato: gli script della casa chiudono col conto", () => {
  assert.equal(numeroDa("🔎 controllo del 2026-08-16\ntrovati: 4\n4"), 4);
  assert.equal(numeroDa("nessun numero qui"), null);
  assert.equal(numeroDa(7), 7);
});

test("gli operatori confrontano davvero", () => {
  assert.equal(soddisfa(3, { ">=": 1 }), true);
  assert.equal(soddisfa(0, { ">=": 1 }), false);
  assert.equal(soddisfa(0, { "==": 0 }), true);
  assert.equal(soddisfa(null, { ">=": 1 }), false, "un valore che non c'è non soddisfa niente");
});

test("il conto tiene i non misurati in una colonna sua, e dichiara la copertura", () => {
  const c = contaEsiti([{ esito: ROTTO }, { esito: SANO }, { esito: NON_MISURATO }, { esito: NON_MISURATO }]);
  assert.deepEqual({ rotti: c.rotti, sani: c.sani, non_misurati: c.non_misurati, totale: c.totale }, {
    rotti: 1,
    sani: 1,
    non_misurati: 2,
    totale: 4,
  });
  assert.equal(c.copertura, 0.5, "metà di ciò che chiamiamo difetti aperti sarebbe ignoto: va detto");
});
