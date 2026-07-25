// Lo script che modifica giro.sh, provato prima di lasciarglielo toccare.
//
// giro.sh è il ciclo principale della macchina: 914 righe, e se ci finisce dentro un errore la
// macchina non «degrada», si ferma. Per questo le modifiche passano da uno script con tre ancore
// invece che da una ritrascrizione a mano — e per questo lo script stesso ha una rete.
//
// Le due proprietà che contano davvero sono le ultime due: se non riconosce il file, NON scrive.

import { test } from "node:test";
import assert from "node:assert/strict";
import { applica } from "../round6-giro.mjs";

const modFinte = [
  { nome: "uno", gia: "@@GIA-UNO@@", ancora: "ANCORA-UNO", dopo: (a) => `${a}\n@@GIA-UNO@@` },
  { nome: "due", gia: "@@GIA-DUE@@", ancora: "ANCORA-DUE", dopo: (a) => `${a}\n@@GIA-DUE@@` },
];

test("applica le modifiche che mancano", () => {
  const r = applica("prima\nANCORA-UNO\nin mezzo\nANCORA-DUE\ndopo", modFinte);
  assert.equal(r.ok, true);
  assert.ok(r.out.includes("@@GIA-UNO@@"));
  assert.ok(r.out.includes("@@GIA-DUE@@"));
  assert.deepEqual(r.esiti.map((e) => e.esito), ["applicata", "applicata"]);
});

test("è idempotente: rilanciarlo non raddoppia niente", () => {
  // Nicola può rilanciarlo senza guardare se l'aveva già fatto. È il requisito di ogni comando
  // che gli passo: deve poter essere ripetuto senza pensarci.
  const uno = applica("ANCORA-UNO\nANCORA-DUE", modFinte).out;
  const due = applica(uno, modFinte);
  assert.equal(due.out, uno, "il secondo giro non cambia niente");
  assert.deepEqual(due.esiti.map((e) => e.esito), ["già presente", "già presente"]);
});

// ⬇️ Le due proprietà di sicurezza. Senza queste, lo script scriverebbe nel punto sbagliato.
test("ancora NON trovata: si ferma e lascia il file INTATTO", () => {
  const originale = "un file che non riconosco";
  const r = applica(originale, modFinte);
  assert.equal(r.ok, false);
  assert.equal(r.out, originale, "meglio non fare niente che scrivere alla cieca");
});

test("ancora AMBIGUA (compare due volte): si ferma — non sa DOVE mettere la modifica", () => {
  const originale = "ANCORA-UNO ... ANCORA-UNO";
  const r = applica(originale, modFinte);
  assert.equal(r.ok, false);
  assert.match(r.esiti[0].esito, /AMBIGUA/);
  assert.equal(r.out, originale);
});

test("se la prima modifica fallisce, la seconda NON viene applicata a metà", () => {
  // Un'applicazione parziale su giro.sh sarebbe peggio di nessuna: un file mezzo modificato.
  const originale = "niente ancore qui, ma ANCORA-DUE sì";
  const r = applica(originale, modFinte);
  assert.equal(r.ok, false);
  assert.equal(r.out, originale, "o tutte o nessuna");
});
