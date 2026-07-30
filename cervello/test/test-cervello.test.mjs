// Il guardiano dei test del cervello, provato con le sue stesse armi (node --test).
//
// Il pezzo che conta è verdetto(): la prima versione classificava «rosso» un file che non si
// CARICAVA nemmeno, perché `node --test` riporta anche quello in TAP come «1 fallito». Mandava a
// cercare un bug inesistente mentre il guasto era l'import — proprio la confusione per cui esiste
// AR-156. La controprova sul campo l'ha smascherata; questi test la tengono chiusa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { trovaTest, leggiTap, verdetto, righeRosse } from "../test-cervello.mjs";

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

test("leggiTap(): fra i DUE conteggi prende quello delle asserzioni, non quello dei file", () => {
  // Output vero di `node --test` su un test che stampa il proprio TAP: il suo conteggio arriva
  // ri-emesso come commento («# \# pass 8»), quello di node dice 1 perché conta il FILE.
  // Leggere il secondo faceva dichiarare alla suite 276 asserzioni quando ne girava molte di più.
  const reale = ["TAP version 13", "#   ok - primo", "# \\# pass 8", "# \\# fail 0", "# tests 1", "# pass 1", "# fail 0"].join("\n");
  assert.deepEqual(leggiTap(reale), { passati: 8, falliti: 0 }, "8 asserzioni, non 1 file");

  // E quando il file NON stampa un TAP proprio (test scritti con node:test puro), vale quello di node.
  assert.deepEqual(leggiTap("# tests 4\n# pass 4\n# fail 0\n"), { passati: 4, falliti: 0 });

  // Un file rotto resta rosso comunque: è la proprietà che non deve regredire.
  assert.equal(leggiTap("# \\# pass 6\n# \\# fail 2\n# pass 0\n# fail 1\n").falliti, 2);
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

// ⬇️ AR-450 — il rosso che non diceva cosa era rosso.
test("righeRosse(): dice QUALE caso è caduto, col suo perché", () => {
  // La forma vera: i test di questa casa stampano il proprio TAP, e `node --test` lo ri-emette
  // come commento col cancelletto davanti.
  const out = [
    "# ok - un caso che passa",
    "# not ok - il referto si risolve tenendo la base",
    "#       Expected values to be strictly equal: 'RAMO' !== 'MAIN'",
    "# \\# pass 10",
    "# \\# fail 1",
  ].join("\n");
  const rosse = righeRosse(out);
  assert.equal(rosse.length, 1, "una sola rossa, non anche quella verde");
  assert.match(rosse[0], /il referto si risolve tenendo la base/, "il NOME del caso, non il file");
  assert.match(rosse[0], /RAMO' !== 'MAIN'/, "e il messaggio dell'asserzione, che è il perché");
});

test("righeRosse(): il riassunto per-file di node non è un'asserzione", () => {
  // `not ok 1 - percorso/del/file.mjs` è la riga che node stampa PER FILE: ripeterla direbbe solo
  // il nome del file, che si sa già, e nasconderebbe che il dettaglio vero non c'era.
  assert.deepEqual(righeRosse("not ok 1 - cervello/test/x.test.mjs\n"), []);
});

test("righeRosse(): un file verde non ha righe rosse, e non se ne inventano", () => {
  assert.deepEqual(righeRosse("# ok - tutto bene\n# \\# pass 3\n# \\# fail 0\n"), []);
  assert.deepEqual(righeRosse(""), []);
});

test("verdetto(): un rosso porta con sé le righe rosse, non solo il conteggio", () => {
  const v = verdetto(1, "# not ok - caso caduto\n#       dettaglio\n# pass 1\n# fail 1\n");
  assert.equal(v.esito, "rosso");
  assert.deepEqual(v.rosse, ["caso caduto → dettaglio"], "senza questo, in CI il rosso è indiagnosticabile");
});
