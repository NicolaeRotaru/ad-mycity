// Il guardo «metro nuovo» della pagella (node --test, nessun I/O).
//
// Il 25/7 la voce 1 ha cambiato domanda: da «quante lezioni ho citato» a «quante correzioni di
// Nicola sono diventate una regola». Il numero è passato da 18% a 12%, e senza un guardo il gate
// avrebbe gridato «PEGGIORATA» — punendo chi ha sistemato uno strumento rotto.
//
// Ma il guardo è pericoloso quanto utile: se bastasse cambiare il nome del metro per far sparire
// un peggioramento, sarebbe una scappatoia perfetta. Qui si prova che copre SOLO il caso vero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { confronta } from "../pagella-intelligenza.mjs";

const voce = (p = {}) => ({ id: "lezioni", valore: 0.12, metrica: "nuova@1", ...p });
const prima = (p = {}) => ({ voci: [{ id: "lezioni", valore: 0.18, metrica: "vecchia@1", ...p }] });

test("metro cambiato: non è «peggiorata», e non conta nel gate", () => {
  const voci = [voce()];
  const r = confronta(voci, prima());
  assert.equal(voci[0].movimento, "misura cambiata");
  assert.equal(r.peggiorate, 0, "il gate non deve bloccare perché è cambiata la domanda");
  assert.equal(r.migliorate, 0);
});

// ⬇️ Il test che rende il guardo onesto invece che comodo.
test("stesso metro: un calo resta PEGGIORATA — il guardo non è una scappatoia", () => {
  const voci = [voce({ valore: 0.05, metrica: "vecchia@1" })];
  const r = confronta(voci, prima());
  assert.equal(voci[0].movimento, "peggiorata");
  assert.equal(r.peggiorate, 1);
});

test("stesso metro: un rialzo resta MIGLIORATA", () => {
  const voci = [voce({ valore: 0.4, metrica: "vecchia@1" })];
  const r = confronta(voci, prima());
  assert.equal(voci[0].movimento, "migliorata");
  assert.equal(r.migliorate, 1);
});

test("metro cambiato non si spaccia nemmeno per MIGLIORATA (vale nei due sensi)", () => {
  const voci = [voce({ valore: 0.95 })];
  const r = confronta(voci, prima());
  assert.equal(voci[0].movimento, "misura cambiata");
  assert.equal(r.migliorate, 0, "un numero più alto con un altro metro non è un miglioramento");
});

test("il numero vecchio resta scritto accanto: il confronto si può sempre rifare a mano", () => {
  const voci = [voce()];
  confronta(voci, prima());
  assert.equal(voci[0].precedente, 0.18);
  assert.equal(voci[0].precedente_metrica, "vecchia@1");
});

test("voci senza metro (le altre quattro) si confrontano come prima", () => {
  const voci = [{ id: "freni", valore: 2, inverso: true }];
  const r = confronta(voci, { voci: [{ id: "freni", valore: 4 }] });
  assert.equal(voci[0].movimento, "migliorata", "meno freni rotti = meglio, anche senza campo metrica");
  assert.equal(r.migliorate, 1);
});

test("prima misura in assoluto: nessun verdetto inventato", () => {
  const voci = [voce()];
  const r = confronta(voci, null);
  assert.equal(voci[0].movimento, "prima misura");
  assert.equal(r.peggiorate, 0);
});
