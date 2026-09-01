#!/usr/bin/env node
// 🏷️ AR-905 — DUE FAMIGLIE DI ROSSI, UN NOME SOLO, E UN REFERTO CHE SEMBRA CONTRADDIRSI
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// `applicaTetto` viene chiamata DUE VOLTE sullo stesso passo del cancello: una per i rossi in Node
// (`test-del-cervello`) e una per quelli in bash (`test-in-bash`). Hanno tetti diversi apposta —
// il debito ereditato in bash ha un numero suo, e metterlo nel tetto dei test Node (che è zero)
// renderebbe il cancello rosso per sempre proprio quando si è smesso di essere ciechi.
//
// Ma l'avviso portava solo `passo.nome`, che è «test del cervello» per tutt'e due. Il referto del
// 31/8 diceva, a due righe di distanza:
//     ❌ test-del-cervello: 2 rossi contro un tetto di 0
//     ⚠️ test del cervello — 1 rosso/i ereditati, nessuno di questo lotto (sotto il tetto)
// Non è una contraddizione: sono due famiglie diverse con lo stesso nome addosso. Ma chi legge non
// ha modo di saperlo, e ci ho perso mezz'ora a cercare la contraddizione prima di capirlo.
//
// È la malattia AR-880 — un'accusa col nome sbagliato — dentro il REFERTO invece che nel verdetto.
// Il verdetto era giusto tutt'e due le volte; era il nome a mentire.

import test from "node:test";
import assert from "node:assert/strict";
import { applicaTetto } from "../cancello-lotto.mjs";

/** Un passo finto, nella forma che `esegui()` produce. */
const passo = () => ({ nome: "test del cervello", codice: 1, fallito: true, coda: [] });

test("AR-905 · l'avviso del debito dice DI QUALE famiglia parla", () => {
  const avvisi = [];
  const p = passo();
  applicaTetto(p, { regola: "test-in-bash", quanti: 1, delLotto: [], tetto: 1, avvisi, violazioni: [] });
  assert.equal(avvisi.length, 1);
  assert.match(avvisi[0], /test-in-bash/,
    `l'avviso non dice di quale famiglia parla: «${avvisi[0]}» — accanto a un ❌ dell'altra famiglia sembra una contraddizione`);
});

test("AR-905 · e la violazione anche, che è la riga che blocca", () => {
  const violazioni = [];
  const p = passo();
  applicaTetto(p, { regola: "test-del-cervello", quanti: 2, delLotto: ["cervello/test/x.test.mjs"], tetto: 0, avvisi: [], violazioni });
  assert.equal(violazioni.length, 1);
  assert.match(violazioni[0].motivo, /test-del-cervello/,
    "chi legge il motivo del blocco deve sapere quale tetto ha sfondato");
});

test("AR-905 · le due famiglie sullo STESSO passo restano distinguibili", () => {
  // Il caso vero: due chiamate di fila sullo stesso oggetto, com'è nel cancello.
  const avvisi = [];
  const violazioni = [];
  const p = passo();
  applicaTetto(p, { regola: "test-del-cervello", quanti: 2, delLotto: ["cervello/test/mio.test.mjs"], tetto: 0, avvisi, violazioni });
  applicaTetto(p, { regola: "test-in-bash", quanti: 1, delLotto: [], tetto: 1, avvisi, violazioni });
  const testi = [...avvisi, ...violazioni.map((v) => v.motivo)];
  assert.equal(testi.filter((t) => /test-del-cervello/.test(t)).length, 1);
  assert.equal(testi.filter((t) => /test-in-bash/.test(t)).length, 1);
});

test("AR-905 · il nome del passo non sparisce: serve a sapere QUALE guardiano l'ha detto", () => {
  const avvisi = [];
  applicaTetto(passo(), { regola: "test-in-bash", quanti: 1, delLotto: [], tetto: 1, avvisi, violazioni: [] });
  assert.match(avvisi[0], /test del cervello/, "togliere il nome del passo sarebbe l'errore opposto");
});

test("AR-905 · sotto il tetto il passo smette di bloccare, e resta dichiarato", () => {
  // La proprietà che non va persa mentre si sistemano i nomi: il debito ereditato non blocca, ma
  // nemmeno sparisce. Sparire sarebbe barare, bloccare sarebbe il cancello sempre rosso.
  const p = passo();
  const avvisi = [];
  applicaTetto(p, { regola: "test-in-bash", quanti: 1, delLotto: [], tetto: 1, avvisi, violazioni: [] });
  assert.equal(p.fallito, false, "il debito ereditato non deve bloccare");
  assert.equal(p.debito, true);
  assert.equal(avvisi.length, 1, "…e non deve nemmeno sparire dal referto");
});
