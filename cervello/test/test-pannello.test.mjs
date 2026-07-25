// AR-156 — test del guardiano dei test del Pannello (node --test, nessun I/O, nessuna esecuzione).
//
// Il difetto che sorveglia: `pannello/src/lib/*.test.mts` esisteva da settimane e nessuno li
// lanciava. Un test che non gira non è una rete. E uno di loro non partiva nemmeno.

import { test } from "node:test";
import assert from "node:assert/strict";
import { trovaTest, verdetto } from "../test-pannello.mjs";

test("trovaTest(): prende i .test.mts e ignora il resto", () => {
  const dentro = trovaTest([
    "store.sanitize.test.mts",
    "chat-unificata.ts",
    "chat-unificata.test.mts",
    "note.md",
    "vecchio.test.ts",
  ]);
  assert.deepEqual(dentro, ["chat-unificata.test.mts", "store.sanitize.test.mts"]);
});

test("trovaTest(): li SCOPRE, non li elenca — un test nuovo entra da solo", () => {
  // È il punto del guardiano: con un elenco scritto a mano, un test aggiunto domani resterebbe
  // fuori e nessuno se ne accorgerebbe. Esattamente come è successo per settimane.
  assert.deepEqual(trovaTest(["nuovissimo.test.mts"]), ["nuovissimo.test.mts"]);
  assert.deepEqual(trovaTest([]), []);
});

test("verdetto(): exit 0 è ok", () => {
  assert.equal(verdetto(0, "# pass 4").esito, "ok");
});

test("verdetto(): distingue «non parte» da «passa male» — sono due difetti diversi", () => {
  // Un test che fallisce dice qualcosa sul codice. Un test che non PARTE non dice niente su
  // niente, e va chiamato col suo nome invece di finire nel mucchio dei rossi.
  const nonParte = verdetto(1, "Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/x/chat-thread-merge' imported from ...");
  assert.equal(nonParte.esito, "ineseguibile");
  assert.match(nonParte.motivo, /estensione/);
  assert.match(nonParte.motivo, /chat-thread-merge/);

  const rosso = verdetto(1, "not ok 1 - qualcosa\n# fail 1");
  assert.equal(rosso.esito, "rosso");
  assert.equal(rosso.motivo, "asserzioni fallite");
});
