#!/usr/bin/env node
// 🧪 Le prove del FRENO CHE PARLA PRIMA (cervello/pre-scrittura.mjs).
//
// Metà di queste prove difendono i SÌ, non i NO: un freno che chiede su lavoro legittimo insegna a
// cliccare «vai» senza leggere, e da quel momento non frena più niente. I falsi positivi qui costano
// più dei falsi negativi, e le prove devono dirlo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { decidi, bustaDecisione, apriSenior, comandoDi, VERBI_DI_SCRITTURA } from "../pre-scrittura.mjs";

const difese = new Map([["cervello/test/sorvegliante.test.mjs", "è il freno della lezione L-2026-0730-531"]]);

// ── ① il bypass dei cancelli del pre-commit ──────────────────────────────────

test("«git commit --no-verify» chiede: salta i quattro cancelli, segreti compresi", () => {
  const d = decidi({ strumento: "Bash", comando: 'git commit --no-verify -m "x"' });
  assert.equal(d.chiedi, true);
  assert.equal(d.classe, "cancelli-saltati");
  assert.match(d.motivo, /segreti/, "il motivo deve dire cosa si perde, non solo che è vietato");
});

test("anche la forma corta «-n» viene vista: è lo stesso bypass scritto in due lettere", () => {
  assert.equal(decidi({ strumento: "Bash", comando: "git commit -n -m x" }).chiedi, true);
});

test("un commit normale NON chiede niente: è il gesto più frequente che faccio", () => {
  assert.equal(decidi({ strumento: "Bash", comando: 'git commit -m "AR-519: la terza strada"' }).chiedi, false);
});

// ── ② la difesa cancellata ───────────────────────────────────────────────────

test("cancellare un file che i registri dichiarano difesa chiede, e dice PERCHÉ lo è", () => {
  const d = decidi({ strumento: "Bash", comando: "rm cervello/test/sorvegliante.test.mjs", difese });
  assert.equal(d.chiedi, true);
  assert.equal(d.classe, "difesa-cancellata");
  assert.match(d.motivo, /freno della lezione/, "il perché arriva dal registro, non da un elenco scritto qui");
});

test("cancellare un file qualunque NON chiede: il perimetro è misurato, non dedotto", () => {
  assert.equal(decidi({ strumento: "Bash", comando: "rm /tmp/scratch.txt", difese }).chiedi, false);
});

// ── ③ la storia riscritta ────────────────────────────────────────────────────

test("«git push --force» su main chiede: riscrive commit che altre copie hanno già letto", () => {
  assert.equal(decidi({ strumento: "Bash", comando: "git push --force origin main" }).classe, "storia-riscritta");
});

test("un force-push su un ramo di lavoro NON chiede: lì riscrivere è normale", () => {
  assert.equal(decidi({ strumento: "Bash", comando: "git push --force origin claude/lavoro-x" }).chiedi, false);
});

test("un push normale su main NON chiede: è come si consegna", () => {
  assert.equal(decidi({ strumento: "Bash", comando: "git push -u origin main" }).chiedi, false);
});

// ── ④ le scritture che nessuna guardia vede ──────────────────────────────────

test("uno strumento MCP che SCRIVE chiede: non passa né dal sorvegliante né dal pre-commit", () => {
  const d = decidi({ strumento: "mcp__github__create_or_update_file" });
  assert.equal(d.chiedi, true);
  assert.equal(d.classe, "scrittura-senza-guardia");
});

test("uno strumento MCP che LEGGE non chiede niente: leggere non lascia niente per terra", () => {
  assert.equal(decidi({ strumento: "mcp__github__get_file_contents" }).chiedi, false);
  assert.equal(decidi({ strumento: "mcp__github__list_pull_requests" }).chiedi, false);
});

test("il riconoscimento è per FORMA del verbo, non per elenco: uno strumento nuovo è coperto dal giorno zero", () => {
  // Un elenco di nomi esatti sarebbe il perimetro dedotto di AR-347: resterebbe indietro al primo
  // strumento nuovo, cioè proprio nel caso in cui restare indietro non si vede.
  assert.equal(decidi({ strumento: "mcp__qualcosa__push_files" }).chiedi, true);
  assert.ok(VERBI_DI_SCRITTURA.test("apply_migration"));
});

// ── la busta e l'ancora dei senior ───────────────────────────────────────────

test("la busta è «ask», mai «deny»: il potere di dire di no resta di Nicola", () => {
  const b = JSON.parse(bustaDecisione(decidi({ strumento: "mcp__github__push_files" })));
  assert.equal(b.hookSpecificOutput.permissionDecision, "ask");
  assert.equal(b.hookSpecificOutput.hookEventName, "PreToolUse");
});

test("niente da chiedere, niente busta: il silenzio è la norma", () => {
  assert.equal(bustaDecisione({ chiedi: false }), null);
});

test("due senior in volo contano due, e il perimetro resta quello del primo", () => {
  const uno = apriSenior(null, { commit: "aaa", scatto: 3, quando: "t0" });
  assert.equal(uno.aperti, 1);
  const due = apriSenior(uno, { commit: "bbb", scatto: 9, quando: "t1" });
  assert.equal(due.aperti, 2);
  assert.equal(due.commit, "aaa", "il perimetro parte da quando è partito il PRIMO ancora aperto");
  assert.equal(due.scatto, 3);
});

test("il comando si legge solo dove esiste: uno strumento senza `command` non ne inventa uno", () => {
  assert.equal(comandoDi({ command: "ls" }), "ls");
  assert.equal(comandoDi({ file_path: "a.md" }), "");
  assert.equal(comandoDi(undefined), "");
});
