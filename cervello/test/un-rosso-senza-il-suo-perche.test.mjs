// 📣 UN ROSSO SENZA IL SUO PERCHÉ — AR-945.
//
// IL FATTO, corsa 34017868367 del 6/9. Il cancello si è fermato su un rosso della suite, e tutto
// quello che ha scritto è stato:
//     ❌ cervello/test/due-case.test.mjs
// Il perché lo sapeva: `test-cervello.mjs --json` mette il messaggio nel campo `motivo` di ogni
// riga. `testRossi` lo buttava via e teneva il nome del file, perché era nato per CONTARE (i tetti
// hanno bisogno di un numero e dei nomi) e nessuno gli ha mai chiesto di raccontare.
//
// COSA È COSTATO. La stessa prova era verde nel flusso separato sullo stesso commit e verde in
// locale. Col solo nome del file, l'unica strada era indovinare fra ambiente, tempi e codice — e
// ogni ipotesi costa una corsa da mezz'ora.
//
// LA REGOLA: chi ferma la consegna deve dire perché. Un verdetto senza il suo perché non è un
// verdetto, è un allarme.

import { test } from "node:test";
import assert from "node:assert/strict";
import { MOTIVO_MAX, motiviDeiRossi, testRossi } from "../tetto-guardiano.mjs";

const SUITE = JSON.stringify({
  test: [
    { file: "cervello/test/verde.test.mjs", esito: "ok", motivo: "", passati: 12, falliti: 0 },
    { file: "cervello/test/due-case.test.mjs", esito: "rosso", motivo: "il caso «CURA ①» è caduto: atteso 0, ricevuto 2", passati: 31, falliti: 1 },
    { file: "cervello/test/mai-partito.test.mjs", esito: "non-eseguito", motivo: "", passati: 0, falliti: 0 },
  ],
  bats: [{ file: "cervello/prova.bats", esito: "rosso", motivo: "not ok 3 il lock non si rilascia", passati: 2, falliti: 1 }],
});

test("il perché del rosso arriva a chi legge, non solo il nome del file", () => {
  const r = motiviDeiRossi(SUITE);
  assert.equal(r.length, 1, "un rosso solo fra i test in node");
  assert.equal(r[0].file, "cervello/test/due-case.test.mjs");
  assert.match(r[0].motivo, /CURA ①/, `il messaggio della suite deve arrivare intero: ${r[0].motivo}`);
  assert.equal(r[0].falliti, 1);
  assert.equal(r[0].passati, 31);
});

test("«tutte» tiene dentro anche bash: un rosso in .bats ferma la consegna come gli altri", () => {
  const r = motiviDeiRossi(SUITE, "tutte");
  assert.deepEqual(r.map((x) => x.file).sort(), ["cervello/prova.bats", "cervello/test/due-case.test.mjs"]);
});

test("un file MAI ESEGUITO non è un rosso: non ha misurato, non ha accusato nessuno", () => {
  assert.equal(
    motiviDeiRossi(SUITE).some((x) => x.file.includes("mai-partito")),
    false,
    "«non-eseguito» resta fuori, esattamente come lo tiene fuori `testRossi`",
  );
});

test("l'elenco combacia con quello che i tetti contano: due letture della stessa misura, mai due misure", () => {
  assert.deepEqual(motiviDeiRossi(SUITE, "tutte").map((x) => x.file).sort(), [...testRossi(SUITE, "tutte")].sort());
});

test("un rosso senza motivo scritto lo DICE, invece di lasciare una riga muta", () => {
  const senza = JSON.stringify({ test: [{ file: "x.test.mjs", esito: "rosso", motivo: "", passati: 0, falliti: 1 }] });
  assert.match(motiviDeiRossi(senza)[0].motivo, /nessun motivo/, "una riga vuota rimetterebbe chi legge dove stava");
});

test("un JSON illeggibile torna null, mai un elenco vuoto: «non ho saputo leggere» non è «non c'erano rossi»", () => {
  assert.equal(motiviDeiRossi("questo non è json"), null);
  assert.equal(motiviDeiRossi(""), null);
});

test("un messaggio enorme viene tagliato, e il taglio si DICHIARA", () => {
  // Il motivo non lo scrivo io: e' quello che un'asserzione ha stampato. Puo' essere uno stack
  // intero o il diff di due oggetti grossi. Un referto sotterrato da un rosso solo e' un referto
  // che si impara a scorrere — cioe' il difetto di partenza con una faccia diversa.
  const muro = "x".repeat(MOTIVO_MAX * 4);
  const j = JSON.stringify({ test: [{ file: "y.test.mjs", esito: "rosso", motivo: muro, passati: 0, falliti: 1 }] });
  const m = motiviDeiRossi(j)[0].motivo;
  assert.ok(m.length < muro.length, `un muro di ${muro.length} caratteri non deve entrare intero nel referto: ne sono entrati ${m.length}`);
  assert.match(m, /tagliato a 300 caratteri/, `e il taglio va detto, se no chi legge crede che il messaggio finisse li': ${m.slice(-80)}`);
});

test("un messaggio corto NON viene toccato: il taglio e' una rete, non una potatura", () => {
  const corto = "atteso 0, ricevuto 2";
  const j = JSON.stringify({ test: [{ file: "y.test.mjs", esito: "rosso", motivo: corto, passati: 0, falliti: 1 }] });
  assert.equal(motiviDeiRossi(j)[0].motivo, corto);
});
