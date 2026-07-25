// Il guardiano dei test del cervello, provato con le sue stesse armi (node --test).
//
// Il pezzo che conta è verdetto(): la prima versione classificava «rosso» un file che non si
// CARICAVA nemmeno, perché `node --test` riporta anche quello in TAP come «1 fallito». Mandava a
// cercare un bug inesistente mentre il guasto era l'import — proprio la confusione per cui esiste
// AR-156. La controprova sul campo l'ha smascherata; questi test la tengono chiusa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { trovaTest, leggiTap, verdetto } from "../test-cervello.mjs";

test("trovaTest(): prende i .test.mjs e ignora tutto il resto", () => {
  const dentro = trovaTest(["b.test.mjs", "a.test.mjs", "aiuto.mjs", "note.md", "x.test.mts"]);
  assert.deepEqual(dentro, ["a.test.mjs", "b.test.mjs"], "ordinati, e solo i test di Node");
});

test("trovaTest(): una cartella vuota non inventa test", () => {
  assert.deepEqual(trovaTest([]), []);
});

test("leggiTap(): legge i conteggi, e non inventa quando il TAP non c'è", () => {
  assert.deepEqual(leggiTap("# pass 17\n# fail 0\n"), { passati: 17, falliti: 0 });
  assert.deepEqual(leggiTap("boom, nessun TAP"), { passati: null, falliti: null });
});

test("verdetto(): tutto verde = ok", () => {
  const v = verdetto(0, "# pass 12\n# fail 0\n");
  assert.equal(v.esito, "ok");
  assert.equal(v.passati, 12);
});

test("verdetto(): asserzioni rosse = «rosso», e dice quante", () => {
  const v = verdetto(1, "# pass 3\n# fail 2\n");
  assert.equal(v.esito, "rosso");
  assert.match(v.motivo, /2 asserzioni/);
});

// ⬇️ Il difetto che la controprova ha trovato addosso al guardiano stesso.
test("verdetto(): un file che non si CARICA è «ineseguibile», non «rosso»", () => {
  // Node riporta anche questo caso come 1 test fallito: il conteggio c'è, ma non è un bug di
  // logica — è un import rotto. Chiamarlo «rosso» manda a cercare la cosa sbagliata.
  const out = "# pass 0\n# fail 1\nError: Cannot find module '/x/modulo-che-non-esiste.mjs'\n";
  const v = verdetto(1, out);
  assert.equal(v.esito, "ineseguibile");
  assert.match(v.motivo, /modulo-che-non-esiste/);
});

test("verdetto(): niente TAP affatto = ineseguibile, non un verde per distrazione", () => {
  const v = verdetto(1, "SyntaxError: Unexpected token\n");
  assert.equal(v.esito, "ineseguibile");
});

test("verdetto(): exit 0 senza TAP non passa per buono", () => {
  // Se un giorno il reporter cambia e smette di stampare i conteggi, il guardiano deve accorgersene
  // invece di dichiarare «tutto a posto» su un output che non ha letto.
  assert.notEqual(verdetto(0, "").esito, "ok");
});
