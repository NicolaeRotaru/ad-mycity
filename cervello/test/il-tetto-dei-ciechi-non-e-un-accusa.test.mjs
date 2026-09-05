#!/usr/bin/env node
// 🕯️ AR-878 — IL TETTO SUI ⚪ MISURA UNA CRESCITA, NON INVENTA UN PUNTO DI PARTENZA.
//
// IL DIFETTO ORIGINALE. `puntatori-scollegati.mjs` aveva un tetto che scende per gli ancoraggi
// SCOLLEGATI, e nessuno per i ⚪ — cioè per i puntatori che non ha potuto guardare perché il file di
// prova non esiste più. Un solo file di prova rinominato — che è ESATTAMENTE l'evento che questo
// guardiano sorveglia — portava il passo da «capace di dire no» a «non ho potuto misurare», e il
// numero poteva salire senza che nessuno se ne accorgesse.
//
// LA CURA, E LA SUA CORREZIONE, e la seconda vale più della prima.
// La prima stesura faceva diventare VIOLAZIONE un ⚪ sopra il tetto, e trattava la chiave assente
// come uno zero — «il metro più stretto». Sembra la scelta prudente. Sono due errori dentro uno:
//
//   ① Superare un tetto che nessuno ha mai dichiarato non è una regressione MISURATA: è il freno che
//      si inventa un punto di partenza e poi accusa chi non l'ha rispettato. Questa casa la lezione
//      ce l'ha già scritta, ed è una delle mutazioni di AR-840 — «senza tetto il verdetto diventa
//      verde invece di ⚪»: in mancanza di un riferimento si dichiara di NON AVER MISURATO, non si
//      emette un verdetto. Qui valeva nell'altro verso.
//   ② Rendeva ROSSO un ⚪, contro la regola di casa per cui il 2 non è mai un verde e non è mai un
//      rosso. Il conto: due prove nate apposta per difendere quel contratto (il rinomino e il file
//      illeggibile, in `puntatori-scollegati.test.mjs`) sono diventate rosse, e la verifica
//      automatica è passata da 10 rossi a 13.
//
// COSA NON SI È PERSO. L'intenzione della corsia era giusta e resta intera: mancava l'altra metà del
// lavoro, cioè DICHIARARE il punto di partenza. Misurato sul repo vero il 29/8 — zero ⚪ — e scritto
// in `cervello/tetti-lotto.json` come `puntatori_ciechi`. Con la chiave presente il ⚪ che cresce è
// una violazione, ed è quello che AR-878 chiedeva.
//
// PERCHÉ QUESTA PROVA ESISTE. Perché non ne esisteva NESSUNA: `tettoDeiCiechi` era stata costruita e
// non era provata da niente. Un fix che nessuna prova può veder rompere non è un difetto chiuso — è
// un difetto che ha smesso di farsi vedere.

import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { tettoDeiCiechi, verdettoPuntatori } = await import(join(REPO, "cervello", "puntatori-scollegati.mjs"));

// ─────────────────────────────────────────────────────────────────────────────
// ① SENZA UN RIFERIMENTO NON SI GIUDICA — il cuore della correzione
// ─────────────────────────────────────────────────────────────────────────────

test("AR-878: senza un tetto dichiarato il confronto NON giudica, e lo dice", () => {
  for (const tetto of [null, undefined]) {
    const v = tettoDeiCiechi({ ciechi: 7, tetto });
    assert.equal(v.esito, "non-giudicabile", `con tetto ${tetto} non c'è niente con cui confrontare`);
    assert.match(v.motivo, /non me lo invento/i, "e il motivo lo dice invece di far finta");
  }
});

test("AR-878: sette ⚪ senza tetto NON diventano una violazione — un'accusa senza riferimento non è una misura", () => {
  // È il caso preciso che rendeva rosse due prove del contratto. Sette ⚪ sono tanti, e resta ⚪.
  assert.notEqual(tettoDeiCiechi({ ciechi: 7, tetto: null }).esito, "salito");
});

// ─────────────────────────────────────────────────────────────────────────────
// ② CON UN RIFERIMENTO, LA CRESCITA È UNA VIOLAZIONE — l'intenzione di AR-878, intera
// ─────────────────────────────────────────────────────────────────────────────

test("AR-878: col tetto dichiarato, un ⚪ in più è una violazione", () => {
  const v = tettoDeiCiechi({ ciechi: 1, tetto: 0 });
  assert.equal(v.esito, "salito", "il ⚪ è cresciuto sopra un limite dichiarato: è una regressione misurata");
  assert.match(v.motivo, /riaggancia il puntatore/i, "e dice cosa fare, non solo che è rotto");
  assert.doesNotMatch(v.motivo, /^abbassa/i, "e NON invita ad abbassare il tetto su un conto che è salito");
});

test("AR-878: il tetto scende e non risale — quando il ⚪ cala, il freno chiede di abbassarlo", () => {
  assert.equal(tettoDeiCiechi({ ciechi: 0, tetto: 3 }).esito, "sceso");
  assert.match(tettoDeiCiechi({ ciechi: 0, tetto: 3 }).motivo, /abbassa/i);
  assert.equal(tettoDeiCiechi({ ciechi: 2, tetto: 2 }).esito, "pari");
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL VERDETTO INTERO: il ⚪ resta ⚪, e non diventa mai un rosso per un tetto assente
// ─────────────────────────────────────────────────────────────────────────────

test("AR-878 (il perno): senza tetto dichiarato un puntatore cieco esce ⚪, non violazione", () => {
  const v = verdettoPuntatori({ quanti: 0, tetto: 0, ciechi: 1, ciechiSorvegliati: 1, tettoCiechi: null, controllati: 10 });
  assert.equal(v.esito, "cieco", `un cieco senza riferimento resta un cieco, non un rosso: ${JSON.stringify(v)}`);
});

test("AR-878: col tetto dichiarato lo stesso identico caso diventa violazione — la differenza è il riferimento, non il fatto", () => {
  const v = verdettoPuntatori({ quanti: 0, tetto: 0, ciechi: 1, ciechiSorvegliati: 1, tettoCiechi: 0, controllati: 10 });
  assert.equal(v.esito, "violazione", `col riferimento dichiarato la crescita si vede: ${JSON.stringify(v)}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// ④ E IL RIFERIMENTO C'È DAVVERO SUL REPO VERO — la metà che mancava
// ─────────────────────────────────────────────────────────────────────────────

test("AR-878: il punto di partenza è DICHIARATO nel file dei tetti, o il freno non giudica niente", async () => {
  const { readFileSync } = await import("node:fs");
  const t = JSON.parse(readFileSync(join(REPO, "cervello", "tetti-lotto.json"), "utf8"));
  assert.ok(
    Object.hasOwn(t, "puntatori_ciechi"),
    "senza questa chiave il confronto è 'non-giudicabile' e il guardiano resta muto proprio sul repo che deve sorvegliare: è la metà del lavoro che mancava",
  );
  assert.ok(Number.isInteger(t.puntatori_ciechi) && t.puntatori_ciechi >= 0, "e dev'essere un numero intero non negativo");
});
