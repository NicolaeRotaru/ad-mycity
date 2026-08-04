#!/usr/bin/env node
// 🧪 Le prove dell'INTENTO DEL TURNO (cervello/intento-turno.mjs).
//
// Su stati finti: la regola che difendono non deve dipendere da com'è il repo adesso, altrimenti
// diventano verdi o rosse per motivi che non c'entrano.
//
// La prima è quella che conta, e non è teorica: è la difesa che impedisce a questo file di
// scavalcare il freno del cancello dello Stop.

import { test } from "node:test";
import assert from "node:assert/strict";
import { siSemina, riduci, bustaApertura, ANCORA, MAX_INTENTO } from "../intento-turno.mjs";
import { ANCORA as ANCORA_STOP } from "../cancello-stop.mjs";

// ── ① il seme non sposta mai un'ancora viva ──────────────────────────────────

test("LA REGOLA CHE CONTA: un'ancora viva NON si sposta, o il cancello si scavalca da solo", () => {
  // Il cancello dello Stop si rifiuta di spostare l'ancora quando ha appena bloccato: senza quella
  // regola il lavoro per cui ha bloccato uscirebbe dal perimetro al turno dopo. Se il seme ripiantasse
  // a ogni messaggio, quella difesa morirebbe in silenzio.
  assert.equal(siSemina({ ancora: "abc123", ancoraUsabile: true, head: "def456" }), false);
});

test("dove è vuoto si semina: è il primo turno di una copia nuova, il caso per cui esiste", () => {
  assert.equal(siSemina({ ancora: null, ancoraUsabile: false, head: "def456" }), true);
});

test("un'ancora non più antenata di HEAD (rebase) si può riseminare: non racconta più questo ramo", () => {
  assert.equal(siSemina({ ancora: "vecchio", ancoraUsabile: false, head: "def456" }), true);
});

test("senza HEAD non si inventa un'ancora: un repo senza commit non ha un «da dove»", () => {
  assert.equal(siSemina({ ancora: null, ancoraUsabile: false, head: null }), false);
});

// ── ② una casa sola per lo stesso fatto ──────────────────────────────────────

test("l'ancora è LO STESSO file del cancello dello Stop: due case dello stesso fatto divergono sempre", () => {
  assert.equal(ANCORA, ANCORA_STOP, "se questi due nomi divergono, il perimetro seminato non lo legge nessuno");
});

// ── ③ l'intento ridotto ──────────────────────────────────────────────────────

test("l'intento si riduce a una riga sola: serve a riconoscerlo, non a riprodurlo", () => {
  assert.equal(riduci("  crea   i hook\nche mancano  "), "crea i hook che mancano");
  const lungo = riduci("x".repeat(MAX_INTENTO + 50));
  assert.equal(lungo.length, MAX_INTENTO + 1, "troncato, col segno che dice che continua");
  assert.ok(lungo.endsWith("…"));
});

// ── ④ la busta: parla solo quando ha qualcosa da dire ────────────────────────

test("niente da dire, niente busta: all'avvio di ogni messaggio il rumore è il costo più alto", () => {
  assert.equal(bustaApertura({ insistenti: [], consegna: null }), null);
});

test("una voce ripetuta e ancora viva arriva al modello, col numero delle volte", () => {
  const b = bustaApertura({ insistenti: [{ file: "cervello/x.mjs", cosa: "malattia y", n: 4 }] });
  const testo = JSON.parse(b).hookSpecificOutput.additionalContext;
  assert.match(testo, /cervello\/x\.mjs/);
  assert.match(testo, /4 volte/, "senza il conteggio la quarta volta è indistinguibile dalla prima");
  assert.equal(JSON.parse(b).hookSpecificOutput.hookEventName, "UserPromptSubmit");
});

test("la consegna di una compressione torna a galla: è quello che il contesto ha appena dimenticato", () => {
  const b = bustaApertura({ insistenti: [], consegna: { intento: "riparare il worker", file: ["a.mjs"] } });
  assert.match(JSON.parse(b).hookSpecificOutput.additionalContext, /riparare il worker/);
});

// ── ⑤ il guasto che non muore nel `catch` ────────────────────────────────────
//
// Trovato dalla spazzata dei fratelli su queste stesse righe, mentre le scrivevo: `scrivi()`
// tornava `false` e nessuno lo guardava. «Non sono riuscito a piantare l'ancora» diventava
// indistinguibile da «è andata bene», e il turno dopo il perimetro sarebbe stato quello largo
// senza che nessuno sapesse perché.

test("un guasto di scrittura ARRIVA al verdetto invece di sparire nel catch", () => {
  const b = bustaApertura({ insistenti: [], guasti: ["cervello/_tmp_stop-ancora.json: EACCES"] });
  const testo = JSON.parse(b).hookSpecificOutput.additionalContext;
  assert.match(testo, /EACCES/);
  assert.match(testo, /perimetro/, "chi legge deve capire COSA sarà sbagliato dopo, non solo che una scrittura è fallita");
});

test("nessun guasto, nessuna riga di guasto: non si inventa un allarme dove non c'è", () => {
  assert.equal(bustaApertura({ insistenti: [], guasti: [] }), null);
});
