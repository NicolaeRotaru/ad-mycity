#!/usr/bin/env node
// 🧪 Le prove del LATO SOTTRAZIONE DEL CANTIERE (cervello/cantiere-integrita.mjs).
//
// Su stati finti e non sul cantiere vero: se misurassero com'è il file adesso, diventerebbero verdi
// o rossi per motivi che non c'entrano con la regola che difendono — e il file vero lo controlla già
// il guardiano quando gira.
//
// Il primo caso è misurato sul VERO: è la perdita del 4/7, ricostruita con gli id che sparirono.

import { test } from "node:test";
import assert from "node:assert/strict";
import { idsSpariti, idsDoppi, citatiNonRegistrati, difettiDi, verdetto, ID_CANONICO } from "../cantiere-integrita.mjs";

const d = (id, stato = "aperto") => ({ id, stato, titolo: `finto ${id}` });

// ── ① niente sparisce ─────────────────────────────────────────────────────────

test("IL CASO VERO: il cutover che riscrive il file intero e perde i difetti viene visto", () => {
  // 78 → 24 il 4/7: qui in piccolo, con tre degli id che se ne andarono davvero.
  const prima = { difetti: [d("AR-045"), d("AR-051"), d("AR-092"), d("AR-004")] };
  const dopo = { difetti: [d("AR-004")] };
  assert.deepEqual(idsSpariti(prima, dopo), ["AR-045", "AR-051", "AR-092"]);
  const v = verdetto({ spariti: idsSpariti(prima, dopo) });
  assert.equal(v.esce, 1);
  assert.match(v.righe.join("\n"), /si CHIUDE cambiando stato, non sparendo/);
});

test("chiudere un difetto NON è farlo sparire: cambia lo stato e resta nel file", () => {
  const prima = { difetti: [d("AR-010", "aperto")] };
  const dopo = { difetti: [d("AR-010", "chiuso")] };
  assert.deepEqual(idsSpariti(prima, dopo), [], "un difetto chiuso è ancora nel cantiere: non è una perdita");
});

test("aggiungere difetti non è una perdita: il guardiano guarda solo il lato sottrazione", () => {
  const prima = { difetti: [d("AR-010")] };
  const dopo = { difetti: [d("AR-010"), d("AR-011"), d("AR-012")] };
  assert.deepEqual(idsSpariti(prima, dopo), []);
});

test("se non riesco a leggere il cantiere di prima dico «non ho misurato», non «niente è sparito»", () => {
  assert.equal(idsSpariti(null, { difetti: [d("AR-010")] }), null, "null = cieco, e cieco non è mai un verde");
  const v = verdetto({ spariti: null, cecita: ["il riferimento non si legge"] });
  assert.equal(v.esce, 2, "exit 2 = ⚪ non ho potuto misurare");
});

// ── ② nessun id doppio (AR-447) ───────────────────────────────────────────────

test("due sessioni che prendono lo stesso numero: il secondo difetto sarebbe invisibile", () => {
  const doppi = idsDoppi({ difetti: [d("AR-020"), d("AR-021"), d("AR-020")] });
  assert.deepEqual(doppi, [{ id: "AR-020", volte: 2 }]);
  assert.equal(verdetto({ doppi }).esce, 1);
});

test("id tutti diversi: nessun doppione", () => {
  assert.deepEqual(idsDoppi({ difetti: [d("AR-020"), d("AR-021")] }), []);
});

// ── ③ nessun AR citato e mai registrato ───────────────────────────────────────

test("IL CASO VERO: un difetto riparato con PR e mutazione ma mai iscritto viene trovato", () => {
  // AR-451: fix in git-pr.mjs, test dedicato, voce in mutanti.json, PR #635 mergiata — zero schede.
  const cantiere = { difetti: [d("AR-004")] };
  const file = ["cervello/git-pr.mjs", "cervello/mutanti.json"];
  const finti = { "cervello/git-pr.mjs": "// il lease di AR-451 dopo il rebase", "cervello/mutanti.json": '"difetto": "AR-451"' };
  const orfani = citatiNonRegistrati(cantiere, file, (f) => finti[f]);
  assert.deepEqual(orfani, [{ id: "AR-451", dove: ["cervello/git-pr.mjs", "cervello/mutanti.json"] }]);
  assert.match(verdetto({ citati: orfani }).righe.join("\n"), /non ha nascita/);
});

test("un AR già registrato non viene segnalato, anche se citato in dieci file", () => {
  const cantiere = { difetti: [d("AR-451")] };
  const orfani = citatiNonRegistrati(cantiere, ["a.mjs", "b.mjs"], () => "AR-451 e ancora AR-451");
  assert.deepEqual(orfani, []);
});

test("un file illeggibile non diventa una citazione mancante: si salta, non si inventa", () => {
  const orfani = citatiNonRegistrati({ difetti: [] }, ["rotto.mjs"], () => {
    throw new Error("EACCES");
  });
  assert.deepEqual(orfani, []);
});

// ── la forma canonica dell'id ─────────────────────────────────────────────────

test("solo AR- più TRE cifre è un id: le abbreviazioni a mano non fanno gridare al lupo", () => {
  const trovati = (s) => [...String(s).matchAll(ID_CANONICO)].map((m) => m[0]);
  assert.deepEqual(trovati("AR-9 e AR-12 e AR-99"), [], "abbreviazioni scritte a mano nei quaderni");
  assert.deepEqual(trovati("AR-009 e AR-451"), ["AR-009", "AR-451"]);
  assert.deepEqual(trovati("AR-1234"), [], "quattro cifre non è la forma del cantiere");
});

// ── l'involucro ───────────────────────────────────────────────────────────────

test("i difetti si trovano sia in un array puro sia sotto la chiave `difetti`", () => {
  assert.equal(difettiDi([d("AR-001")]).length, 1);
  assert.equal(difettiDi({ difetti: [d("AR-001")] }).length, 1);
  assert.equal(difettiDi(null), null);
});

// ── il verdetto ───────────────────────────────────────────────────────────────

test("un rosso misurato batte una cecità parziale: non lo schiaccio a «non ho misurato»", () => {
  const v = verdetto({ spariti: ["AR-045"], cecita: ["repo shallow"] });
  assert.equal(v.esce, 1, "so per certo che manca un difetto: quello è il verdetto più informativo");
});

test("tutto a posto: exit 0 e una riga sola che dice con cosa mi sono confrontato", () => {
  const v = verdetto({ spariti: [], doppi: [], citati: [], base: "antenato comune con origin/main" });
  assert.equal(v.esce, 0);
  assert.equal(v.righe.length, 1);
  assert.match(v.righe[0], /antenato comune/);
});
