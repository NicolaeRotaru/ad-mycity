// 🧪 UNA PROVA CHE NON PARTE NON È UNA PROVA CHE PASSA — AR-906.
//
// PERCHÉ ESISTE. Il collaudo di sicurezza del 31/8 ha misurato che `ambientePulito()` uccideva git
// nel processo figlio: il filtro dei segreti toglie ogni nome che contiene «KEY», e fra questi
// c'era `GIT_CONFIG_KEY_0`, mentre `GIT_CONFIG_COUNT=3` restava. Git riceve una terna incoerente,
// muore con uscita 128 — e `verdettoCorsa` legge ogni uscita ≠ 0 come «la prova è diventata rossa
// per colpa della mutazione», cioè ✅ verificata. Un cadavere comprava un verde.
//
// 395 delle 970 mutazioni hanno una prova che tocca git: non è un caso di laboratorio.
//
// Le due difese sono separate apposta e vanno provate separate:
//   ① `ambientePulito` non deve mutilare un gruppo di variabili (la causa);
//   ② `avvioFallito` deve riconoscere un git morto (la rete, per il prossimo modo di ucciderlo).
// Provare solo la ① lascerebbe verde il giorno che il gruppo cambia forma; provare solo la ②
// lascerebbe la macchina a rompere git a ogni corsa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { ambientePulito, trascinatiDalGruppo } from "../non-vacuita.mjs";
import { avvioFallito } from "../esecuzione-prova.mjs";

const AMBIENTE_FINTO = {
  PATH: "/usr/bin",
  HOME: "/root",
  GIT_CONFIG_COUNT: "2",
  GIT_CONFIG_KEY_0: "credential.interactive",
  GIT_CONFIG_VALUE_0: "never",
  GIT_CONFIG_KEY_1: "url.https://github.com/.insteadOf",
  GIT_CONFIG_VALUE_1: "git@github.com:",
  STRIPE_SECRET_KEY: "un-segreto",
};

test("① il gruppo di git non resta mutilato: o c'è tutto, o non c'è niente", () => {
  const pulito = ambientePulito(AMBIENTE_FINTO);
  const superstiti = Object.keys(pulito).filter((k) => k.startsWith("GIT_CONFIG"));
  assert.deepEqual(superstiti, [], `GIT_CONFIG superstiti: ${superstiti.join(",")} — una terna incoerente uccide git`);
});

test("① il resto dell'ambiente non viene toccato, e il segreto se ne va comunque", () => {
  const pulito = ambientePulito(AMBIENTE_FINTO);
  assert.equal(pulito.PATH, "/usr/bin");
  assert.equal(pulito.HOME, "/root");
  assert.equal("STRIPE_SECRET_KEY" in pulito, false);
});

test("① la regola è sul GRUPPO, non su git: cade un membro, cadono tutti", () => {
  const nomi = Object.keys(AMBIENTE_FINTO);
  const trascinati = trascinatiDalGruppo(["GIT_CONFIG_KEY_0"], nomi);
  assert.equal(trascinati.has("GIT_CONFIG_COUNT"), true);
  assert.equal(trascinati.has("GIT_CONFIG_VALUE_1"), true);
  assert.equal(trascinati.has("PATH"), false, "un gruppo non deve trascinarsi dietro mezzo ambiente");
});

test("① se non cade nessun membro, non si trascina niente", () => {
  const trascinati = trascinatiDalGruppo(["ALTRO"], Object.keys(AMBIENTE_FINTO));
  assert.equal(trascinati.size, 0);
});

test("① git parte davvero con l'ambiente ripulito — misurato, non ragionato", () => {
  const pulito = ambientePulito();
  const r = spawnSync("git", ["--version"], { env: pulito, encoding: "utf8" });
  if (r.error) return; // ⚪ git non c'è su questa macchina: non ho misurato, non dichiaro verde
  assert.equal(r.status, 0, `git non parte con l'ambiente ripulito: ${String(r.stderr || "").trim()}`);
});

// ⚠️ LE FRASI DI GIT SI COMPONGONO A RUNTIME, e non è un vezzo: node, quando un `assert` fallisce,
// RISTAMPA LA RIGA DI SORGENTE che l'ha fatto fallire. Scritte per esteso qui dentro, quelle frasi
// finivano nell'uscita del test ogni volta che il test diventava rosso — e il banco delle mutazioni
// legge l'uscita cercando proprio quelle impronte. Risultato misurato il 31/8: la mutazione che
// toglie la difesa non poteva essere provata, perché il rosso che produceva veniva letto come ⚪.
// Una prova che parla di un'impronta non deve PORTARLA scritta.
const frase = (...pezzi) => pezzi.join("");
const CHIAVE_MANCANTE = frase("error: mis", "sing con", "fig key GIT_CONFIG_KEY_0");
const NON_SA_LEGGERE = frase("fatal: unable to ", "parse com", "mand-line config");
const VALORE_MANCANTE = frase("error: mis", "sing con", "fig value GIT_CONFIG_VALUE_2");

test("② un git morto per configurazione incoerente è ⚪, mai una prova diventata rossa", () => {
  const motivo = avvioFallito({ uscita: `${CHIAVE_MANCANTE}\n${NON_SA_LEGGERE}` });
  assert.ok(motivo, "uscita 128 di un git mai partito letta come «la mutazione morde»");
  assert.match(motivo, /non è partita/);
});

test("② basta la riga del valore mancante, senza la seconda riga", () => {
  assert.ok(avvioFallito({ uscita: VALORE_MANCANTE }), "la sola riga del valore mancante non basta a dichiarare ⚪");
});

test("② un git che è partito e ha detto di no resta una prova diventata rossa", () => {
  assert.equal(avvioFallito({ uscita: "fatal: not a git repository" }), null);
  assert.equal(avvioFallito({ uscita: "error: pathspec 'ramo' did not match any file(s)" }), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL ROVESCIO — AR-893: una prova VIVA non deve essere scambiata per morta.
//
// Le due metà sopra impediscono che un cadavere compri un verde. Questa impedisce l'errore
// opposto, scoperto lo stesso giorno e dallo stesso banco: una prova che gira, misura e diventa
// rossa, ma che nella sua uscita porta la frase di un avvio fallito — perché node ristampa la riga
// di sorgente che ha fatto fallire l'`assert`, e quella riga è il pezzo che la prova sta provando.
// Veniva letta come ⚪. Dieci file su 436 sono in quella condizione, e sono i dieci che difendono
// il terzo esito: cioè le uniche prove che il banco non poteva misurare erano quelle sulla cecità.
// ─────────────────────────────────────────────────────────────────────────────

import { unaProvaHaGirato } from "../esecuzione-prova.mjs";

const IMPRONTA = frase("npx can", "celed due to mis", "sing packages");

test("③ se almeno un test è passato, l'impronta nell'uscita è roba stampata, non un avvio mancato", () => {
  assert.equal(avvioFallito({ uscita: `${IMPRONTA}\n# pass 6\n# fail 2` }), null);
});

test("③ ma con zero test passati l'impronta vale ancora: lì non ha misurato nessuno", () => {
  assert.ok(avvioFallito({ uscita: `${IMPRONTA}\n# pass 0\n# fail 1` }));
});

test("③ senza riepilogo basta una riga TAP «ok N» — bats non scrive «# pass»", () => {
  assert.equal(unaProvaHaGirato("ok 1 - il primo caso\nok 2 - il secondo"), true);
  assert.equal(unaProvaHaGirato("not ok 1 - il file non si carica"), false);
  assert.equal(unaProvaHaGirato(""), false);
});

test("③ un file che non si carica resta ⚪: node conta «# pass 0» anche col «not ok 1»", () => {
  const uscita = "not ok 1 - x.test.mjs\n# tests 1\n# pass 0\n# fail 1\n" + frase("Cannot find ", "package 'tizio'");
  assert.ok(avvioFallito({ uscita }), "un file mai caricato non deve diventare una prova diventata rossa");
});

test("③ la prova positiva NON scavalca l'errore di chi lancia: lì non c'è uscita da leggere", () => {
  const motivo = avvioFallito({ errore: { code: "ENOENT" }, uscita: "# pass 99" });
  assert.ok(motivo, "un processo che non è mai nato non si smentisce con l'uscita di un altro");
});
