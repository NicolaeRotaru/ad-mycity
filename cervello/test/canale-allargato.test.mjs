// AR-714 — una prova che si allarga il canale di osservazione lo deve DIRE.
//
// LA STORIA. AR-698 ha mostrato che una prova può restare verde col fix disfatto se osserva il
// difetto dal canale comodo invece che da quello vero: il troncamento a 64 KB si vede solo da una
// pipe di shell. AR-714 ne ha visto il secondo verso, addosso a `segreti-file-grosso.test.mjs`: un
// tetto di trentadue megabyte sul canale di osservazione, cioè trentadue volte quello che Node dà a
// chiunque, per guardare un comando che nel giro scrive dentro una pipe.
//
// MISURATO, non dedotto (15/8): l'uscita di quello scanner è ~200 byte, quindi in quel punto il
// margine non nascondeva niente — la scheda parlava di un SOSPETTO e il sospetto era infondato lì.
// Ma il gesto resta la forma di AR-698, e finora nessuno lo contava: adesso c'è un numero, e chi
// vuole il canale largo lo dichiara in una riga.
//
// COSA PROVA QUESTO FILE, eseguendo:
//   ① un canale oltre il megabyte senza spiegazione viene trovato, con riga e byte;
//   ② un canale dichiarato («canale largo: …») non viene accusato — la regola chiede il perché,
//      non l'austerità;
//   ③ un commento qualsiasi NON basta: sarebbe il silenzio con un cappello;
//   ④ sotto il canale vero non si dice niente, e ciò che non so leggere non lo accuso;
//   ⑤ sul repo vero: `segreti-file-grosso` — l'istanza che la scheda nomina — non allarga più
//      niente, e il debito che resta è un numero che esce dal referto del banco.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CANALE_VERO, canaleAllargato } from "../contratto-prova.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));

// La chiave si compone a pezzi: scritta per intero, questo file accuserebbe se stesso.
const K = ["max", "Buffer"].join("");

// ── ① Trovare ───────────────────────────────────────────────────────────────

test("un canale oltre il megabyte senza spiegazione viene trovato, con riga e byte", () => {
  const src = `const r = spawnSync("node", [X], {\n  ${K}: 32 * 1024 * 1024,\n});`;
  const v = canaleAllargato(src);
  assert.equal(v.length, 1);
  assert.equal(v[0].riga, 2);
  assert.equal(v[0].byte, 33554432);
});

test("conta anche quando sta in mezzo agli altri argomenti, sulla stessa riga", () => {
  const src = `const r = spawnSync("git", a, { cwd: REPO, encoding: "utf8", ${K}: 64 * 1024 * 1024 });`;
  assert.equal(canaleAllargato(src).length, 1);
});

// ── ② e ③ La via d'uscita è dichiarata, e costa una frase ───────────────────

test("un canale dichiarato con il perché non viene accusato", () => {
  const src = `  ${K}: 64 * 1024 * 1024, // canale largo: qui il chiamante vero usa lo stesso tetto`;
  assert.deepEqual(canaleAllargato(src), []);
});

test("la dichiarazione vale anche sulla riga sopra", () => {
  const src = `  // canale largo: il referto di questo comando arriva a qualche megabyte\n  ${K}: 64 * 1024 * 1024,`;
  assert.deepEqual(canaleAllargato(src), []);
});

test("un commento qualsiasi NON basta: sarebbe il silenzio con un cappello", () => {
  const src = `  ${K}: 64 * 1024 * 1024, // non ricordo perché`;
  assert.equal(canaleAllargato(src).length, 1, "la formula esatta esiste apposta: «canale largo: <perché>»");
});

test("e nemmeno la formula senza il perché scritto dietro", () => {
  const src = `  ${K}: 64 * 1024 * 1024, // canale largo:`;
  assert.equal(canaleAllargato(src).length, 1);
});

// ── ④ Il confine, e ciò che non so leggere ──────────────────────────────────

test("il canale vero è quello che Node dà a chi non chiede niente, e lì non si dice niente", () => {
  assert.equal(CANALE_VERO, 1024 * 1024);
  assert.deepEqual(canaleAllargato(`  ${K}: 1024 * 1024,`), [], "esattamente il canale vero non è un allargamento");
  assert.deepEqual(canaleAllargato(`  ${K}: 500000,`), []);
});

test("un valore che non so leggere non lo accuso: è un ⚪, non un rosso inventato", () => {
  assert.deepEqual(canaleAllargato(`  ${K}: TETTO_CONFIGURABILE,`), []);
  assert.deepEqual(canaleAllargato(`  ${K}: Number(process.env.X),`), []);
});

test("una prova senza nessun canale dichiarato non produce niente", () => {
  assert.deepEqual(canaleAllargato("import assert from 'node:assert';\nassert.ok(true);"), []);
});

// ── ⑤ Il repo vero ──────────────────────────────────────────────────────────

test("l'istanza che la scheda nomina non allarga più il canale", () => {
  const src = readFileSync(join(QUI, "segreti-file-grosso.test.mjs"), "utf8");
  assert.deepEqual(
    canaleAllargato(src),
    [],
    "è la prova di AR-441: adesso guarda lo scanner dal canale che gli dà il giro, non da uno trentadue volte più largo",
  );
});

test("il banco porta il conto del debito nel suo referto: da oggi il numero esiste", () => {
  // Il debito ereditato NON ha il tetto qui dentro, ed è una scelta: un tetto scritto in un file di
  // prova mentre altre mani stanno aggiungendo prove diventa rosso per colpa di chi non c'entra —
  // è AR-695, «tutti i tetti a margine zero». Il cricchetto è dei tetti del lotto; qui si pretende
  // solo che il numero venga MISURATO e arrivi fuori, perché un debito che nessuno conta non cala.
  const r = spawnSync("node", [join(QUI, "..", "test-cervello.mjs"), "--json", "--solo", "canale-allargato"], {
    cwd: join(QUI, "..", ".."),
    encoding: "utf8",
  });
  const j = JSON.parse(r.stdout);
  assert.ok(Array.isArray(j.canali_allargati), "il referto del banco deve portare `canali_allargati`, o il debito resta invisibile");
  // E questo file non deve accusare se stesso mentre spiega la regola: se ci cascasse, il conto
  // sarebbe gonfiato dal guardiano che lo tiene.
  assert.deepEqual(
    canaleAllargato(readFileSync(join(QUI, "canale-allargato.test.mjs"), "utf8")),
    [],
    "la prova del rilevatore compone il nome a pezzi apposta: se si accusa, il numero mente",
  );
});
