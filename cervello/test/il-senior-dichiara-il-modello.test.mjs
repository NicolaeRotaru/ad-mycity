#!/usr/bin/env node
// 🧪 Ogni senior dichiara il suo modello (5/11/2026, firmato da Nicola).
//
// Senza `model:` nel frontmatter un senior gira sul modello della sessione, cioè sempre il più
// grande. La regola «modello piccolo per i lavori semplici» c'era (registro-fatti, ad.uso-e-crediti),
// ma niente la faceva rispettare: 0 schede su 120 avevano il campo. Queste prove diventano rosse se
// un senior perde il modello, se ne scrive uno che non esiste, o se chi collauda e chi tocca soldi,
// sicurezza e diritto scende sul modello piccolo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { analizzaModelli, estraiModel, MODELLI_AMMESSI } from "../agent-registry-check.mjs";

const REPO = resolve(import.meta.dirname, "..", "..");
const AGENTI = join(REPO, ".claude/agents");

const scheda = (righe) => `---\n${righe.join("\n")}\n---\n\nSei un senior.\n`;

test("una scheda senza model è un problema", () => {
  const r = analizzaModelli([{ file: "senza", testo: scheda(["name: senza", "description: prova"]) }]);
  assert.deepEqual(r.senzaModel, ["senza"]);
  assert.equal(r.problemi, 1);
});

test("un modello che non esiste è un problema", () => {
  const r = analizzaModelli([{ file: "strano", testo: scheda(["name: strano", "model: gpt-qualcosa"]) }]);
  assert.deepEqual(r.modelSconosciuto, [{ file: "strano", model: "gpt-qualcosa" }]);
  assert.equal(r.problemi, 1);
});

test("model fuori dal frontmatter non vale: il router legge solo il frontmatter", () => {
  const testo = "---\nname: furbo\n---\n\nmodel: opus\n";
  assert.equal(estraiModel(testo), "");
  assert.equal(analizzaModelli([{ file: "furbo", testo }]).problemi, 1);
});

test("piccolo e grande ammessi, contati per modello", () => {
  const r = analizzaModelli([
    { file: "a", testo: scheda(["name: a", "model: sonnet"]) },
    { file: "b", testo: scheda(["name: b", "model: opus"]) },
  ]);
  assert.equal(r.problemi, 0);
  assert.deepEqual(r.conteggio, { sonnet: 1, opus: 1 });
});

const reali = () =>
  readdirSync(AGENTI)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ file: f.replace(/\.md$/, ""), testo: readFileSync(join(AGENTI, f), "utf8") }));

test("nel repo vero ogni senior dichiara un modello ammesso", () => {
  const schede = reali();
  assert.ok(schede.length >= 100, `attesi i 120 senior, trovati ${schede.length}`);
  const r = analizzaModelli(schede);
  assert.deepEqual(r.senzaModel, [], "senior senza modello: girerebbero sempre sul più grande");
  assert.deepEqual(r.modelSconosciuto, []);
  for (const m of Object.keys(r.conteggio)) assert.ok(MODELLI_AMMESSI.includes(m));
});

test("chi collauda e chi tocca soldi, sicurezza e diritto resta sul modello grande", () => {
  const perNome = new Map(reali().map((s) => [s.file, estraiModel(s.testo)]));
  for (const nome of ["qa", "tech", "security", "backend-dev", "finanza", "contabilita", "legale-privacy", "dpo", "prompt-engineer"]) {
    assert.equal(perNome.get(nome), "opus", `${nome} deve reggere senza un secondo controllo: modello grande`);
  }
});

test("chi produce testi e grafiche sta sul modello piccolo", () => {
  const perNome = new Map(reali().map((s) => [s.file, estraiModel(s.testo)]));
  for (const nome of ["ai-copywriter", "content-social", "designer", "ai-designer"]) {
    assert.equal(perNome.get(nome), "sonnet", `${nome}: il suo lavoro passa da un cancello, basta il modello piccolo`);
  }
});
