#!/usr/bin/env node
// 🧪 Le prove del CANCELLO DEI SENIOR (cervello/cancello-senior.mjs).
//
// La prova più importante è quella che difende il NON blocco: con più senior in volo il perimetro è
// condiviso, e punire il senior sbagliato è peggio che non punire nessuno — insegna che il verdetto
// non c'entra con quello che hai fatto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { chiudiSenior, allarmiDelSenior, verdettoSenior } from "../cancello-senior.mjs";

const grave = { file: "cervello/x.mjs", cosa: "malattia nuova", gravita: "grave" };

// ── il conteggio dei senior in volo ──────────────────────────────────────────

test("l'ultimo senior che chiude toglie l'ancora: il prossimo non eredita il perimetro di chi c'era prima", () => {
  const r = chiudiSenior({ commit: "aaa", aperti: 1 });
  assert.equal(r.ancora, null);
  assert.equal(r.ultimo, true);
  assert.equal(r.condiviso, false);
});

test("con due in volo, chi chiude per primo lascia l'ancora al secondo e dichiara il perimetro condiviso", () => {
  const r = chiudiSenior({ commit: "aaa", aperti: 2 });
  assert.equal(r.ancora.aperti, 1);
  assert.equal(r.ultimo, false);
  assert.equal(r.condiviso, true);
});

test("senza ancora non si va sotto zero: un evento in più non deve inventare un perimetro", () => {
  const r = chiudiSenior(null);
  assert.equal(r.ancora, null);
  assert.equal(r.ultimo, true);
});

// ── gli allarmi non accodati ─────────────────────────────────────────────────

test("un 🔴 in una consegna senza niente nella coda viene preso", () => {
  const a = allarmiDelSenior([{ file: "consegne/x.md", testo: "🔴 il sito è giù" }], false);
  assert.deepEqual(a, ["consegne/x.md"]);
});

test("se la coda È stata toccata non si accusa nessuno: l'allarme ha già il suo lettore", () => {
  assert.deepEqual(allarmiDelSenior([{ file: "consegne/x.md", testo: "🔴 grave" }], true), []);
});

test("una consegna senza marcatori d'allarme non è un allarme", () => {
  assert.deepEqual(allarmiDelSenior([{ file: "consegne/x.md", testo: "tutto liscio" }], false), []);
});

// ── il verdetto ──────────────────────────────────────────────────────────────

test("una voce grave del senior BLOCCA: torna indietro e la sistema prima che si impasti col resto", () => {
  const v = verdettoSenior({ voci: [grave] });
  assert.equal(v.blocca, true);
  assert.match(v.righe.join("\n"), /voce grave/);
});

test("LA REGOLA CHE CONTA: con più senior in volo NON si blocca, perché non so a chi attribuire", () => {
  const v = verdettoSenior({ voci: [grave], condiviso: true });
  assert.equal(v.blocca, false, "punire il senior sbagliato insegna che il verdetto non c'entra col lavoro");
  assert.ok(v.righe.length, "ma si dice lo stesso: non attribuire non vuol dire tacere");
});

test("la valvola anti-cappio: se il senior sta già ripartendo per colpa mia, non lo blocco di nuovo", () => {
  assert.equal(verdettoSenior({ voci: [grave], giaBloccato: true }).blocca, false);
});

test("una voce MEDIA si dice e non blocca: il freno serve sul grave, il resto è un avviso", () => {
  const v = verdettoSenior({ voci: [{ ...grave, gravita: "media" }] });
  assert.equal(v.blocca, false);
  assert.equal(v.righe.length, 1);
});

test("il quadro dei file toccati c'è anche quando è tutto pulito: è l'unica riga che dice cosa ha fatto davvero", () => {
  const v = verdettoSenior({ voci: [], fileToccati: ["a.mjs", "b.md"] });
  assert.equal(v.blocca, false);
  assert.match(v.righe.join("\n"), /a\.mjs/);
});

test("niente di niente: nessuna riga, e il senior chiude senza rumore", () => {
  assert.deepEqual(verdettoSenior({}).righe, []);
});

test("un allarme non accodato blocca quanto una voce grave: un 🔴 senza lettore è un verdetto perso", () => {
  assert.equal(verdettoSenior({ allarmi: ["consegne/x.md"] }).blocca, true);
});
