#!/usr/bin/env node
// 🧪 Le prove del FRENO CHE PARLA PRIMA (cervello/pre-scrittura.mjs).
//
// Metà di queste prove difendono i SÌ, non i NO: un freno che chiede su lavoro legittimo insegna a
// cliccare «vai» senza leggere, e da quel momento non frena più niente. I falsi positivi qui costano
// più dei falsi negativi, e le prove devono dirlo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { decidi, bustaDecisione, apriSenior, comandoDi, suMossa, ANCORA_SENIOR, STRUMENTI_DI_DELEGA, VERBI_DI_SCRITTURA } from "../pre-scrittura.mjs";
import { BATTITO } from "../sorvegliante.mjs";

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
  // Il messaggio del commit è volutamente senza numeri di difetto: se ne portasse uno, una
  // rinumerazione altrove toccherebbe questa prova e sembrerebbe un caso tolto (successo il 4/8).
  assert.equal(decidi({ strumento: "Bash", comando: 'git commit -m "la terza strada"' }).chiedi, false);
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

// ── l'ancora si pianta col nome di OGGI dello strumento di delega (AR-1009) ───
// Fino al 25/10 l'ancora nasceva solo se lo strumento si chiamava esattamente «Task». Oggi si chiama
// «Agent»: l'ancora non nasceva mai, e il cancello dei senior giudicava ogni delega come «nessuna
// ancora», cioè raccontava e non bloccava nessuno. Queste prove fanno girare la mossa intera (la
// stessa strada dell'hook, senza stdin) su un repo finto, e guardano il file che nasce davvero.

/** Un repo finto con un commit e il battito del sorvegliante allo scatto 7; torna l'ancora scritta. */
function giraLaMossa(tool_name, tool_input = {}) {
  const dir = mkdtempSync(join(tmpdir(), "pre-scrittura-"));
  try {
    execFileSync("git", ["init", "-q", "."], { cwd: dir });
    execFileSync("git", ["-c", "commit.gpgsign=false", "-c", "user.email=prova@prova", "-c", "user.name=prova", "commit", "-q", "--allow-empty", "-m", "zero"], { cwd: dir });
    const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).trim();
    mkdirSync(join(dir, "cervello"), { recursive: true });
    writeFileSync(join(dir, BATTITO), JSON.stringify({ scatto: 7, viste: {} }));
    const mastro = { aperte: 0, chiuse: [], annota() { this.aperte++; return "id-prova"; }, chiudi(id, verdetto) { this.chiuse.push(verdetto); } };
    const r = suMossa({ tool_name, tool_input }, { repo: dir, difese: () => new Map(), mastro });
    const p = join(dir, ANCORA_SENIOR);
    return { ...r, head, mastro, scritta: existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("IL NOME DI OGGI: un senior che parte con lo strumento «Agent» pianta l'ancora sul disco", () => {
  const r = giraLaMossa("Agent", { subagent_type: "qa", prompt: "leggi STATO.md" });
  assert.ok(r.scritta, "con «Agent» l'ancora deve nascere: senza, il cancello dei senior non blocca più nessuno");
  assert.equal(r.scritta.aperti, 1);
  assert.equal(r.scritta.scatto, 7, "lo scatto viene dal battito del repo dove lavoro, non da zero");
  assert.equal(r.scritta.commit, r.head, "il commit è quello del repo dove lavoro, non di un altro");
  assert.equal(r.busta, null, "far partire un senior non chiede niente");
  assert.deepEqual([r.mastro.aperte, r.mastro.chiuse], [1, ["ok"]], "la riga del libro mastro si apre e si chiude");
});

test("il nome delle versioni vecchie, «Task», pianta l'ancora come prima", () => {
  const r = giraLaMossa("Task", { subagent_type: "qa", prompt: "x" });
  assert.ok(r.scritta);
  assert.equal(r.scritta.aperti, 1);
});

test("un comando di shell NON pianta l'ancora: un'ancora finta farebbe giudicare un senior che non è partito", () => {
  const r = giraLaMossa("Bash", { command: "ls" });
  assert.equal(r.scritta, null);
  assert.equal(r.busta, null);
  assert.deepEqual(r.mastro.chiuse, ["ok"]);
});

test("un nome che CONTIENE «Agent» non pianta niente: il confronto è sul nome intero", () => {
  assert.equal(giraLaMossa("ListAgents").scritta, null);
});

// ── il filtro di OGGI porta la delega a pre-scrittura (AR-1009) ──────────────
// Il primo giro di questo fix scriveva il contrario, come fatto verificato: «senza Agent nel filtro,
// pre-scrittura non parte». Il libro mastro del 25/10 lo smentisce. Col filtro «Bash|Monitor|Task|mcp__.*»,
// fermo dal 26/08, pre-scrittura ha visto «Agent» alle 12:01:20: Claude Code 2.1.310 tratta «Task» come
// altro nome di Agent. Questa prova legge il filtro VERO e guarda due cose. Deve prendere almeno uno
// dei nomi della delega, sennò l'ancora non nasce. E non deve prendere Skill, sennò non filtra niente.
// Cosa NON vede: se una versione nuova togliesse l'alias, qui resterebbe verde. Lo direbbe il libro mastro.

const RADICE = fileURLToPath(new URL("../../", import.meta.url));

/** I filtri dei gruppi PreToolUse che lanciano pre-scrittura, letti da `.claude/settings.json`. */
function filtriDiPreScrittura() {
  const cfg = JSON.parse(readFileSync(join(RADICE, ".claude/settings.json"), "utf8"));
  return (cfg.hooks?.PreToolUse || [])
    .filter((g) => (g.hooks || []).some((h) => /cervello\/pre-scrittura\.mjs\b/.test(h.command || "")))
    .map((g) => g.matcher ?? "");
}

/** Il filtro prende questo nome? Lettura prudente: espressione regolare sul nome intero. */
function prende(filtro, nome) {
  if (filtro === "" || filtro === "*") return true;
  return new RegExp(`^(?:${filtro})$`).test(nome);
}

test("IL FILTRO DI OGGI porta la delega a pre-scrittura: prende un nome della delega, e Skill no", () => {
  const filtri = filtriDiPreScrittura();
  assert.equal(filtri.length, 1, "un hook solo deve lanciare pre-scrittura prima di ogni mossa");
  const [filtro] = filtri;
  const nomi = [...STRUMENTI_DI_DELEGA];
  assert.ok(
    nomi.some((n) => prende(filtro, n)),
    `il filtro «${filtro}» non prende nessun nome della delega (${nomi.join(", ")}): pre-scrittura non parte e l'ancora non nasce`,
  );
  assert.equal(prende(filtro, "Skill"), false, "controprova: un filtro che prende tutto non filtra niente");
});
