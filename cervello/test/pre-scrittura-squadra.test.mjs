#!/usr/bin/env node
// 🧪 Il freno sui lanci di SQUADRA (regola ⑱ del manuale dell'AD) e l'ancora del senior su «Agent».
//
// COME GIRA, ed è la scelta che rende questa prova una prova: lancia l'hook VERO come processo
// (`node cervello/pre-scrittura.mjs --hook`, l'evento sullo stdin, la busta sullo stdout), esattamente
// come lo lancia Claude Code. Non chiama funzioni interne: così gira identica sul codice di prima
// (dove su Workflow la guardia si apriva e taceva, e su Agent non piantava l'ancora) e su quello di
// adesso. Sul codice vecchio i casi del freno diventano rossi per il motivo vero — nessuna busta —
// non perché manca un nome da importare.
//
// DOVE GIRA: su una COPIA dei file di `cervello/` dentro un repo finto in /tmp. Lanciata sul repo
// vero, scriverebbe nel libro mastro vero «pre-scrittura ha visto Workflow» in un turno dove non l'ha
// visto nessuno, e la mappa della copertura lo leggerebbe come lavoro vero.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VERO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let finto = "";

before(() => {
  finto = mkdtempSync(join(tmpdir(), "freno-squadra-"));
  mkdirSync(join(finto, "cervello"), { recursive: true });
  // Solo i file in cima a cervello/: sono quelli che la guardia importa. Le sottocartelle (prove,
  // referti) non servono e pesano.
  for (const f of readdirSync(join(VERO, "cervello"), { withFileTypes: true })) {
    if (f.isFile() && /\.(mjs|json)$/.test(f.name) && !f.name.startsWith("_tmp_")) {
      cpSync(join(VERO, "cervello", f.name), join(finto, "cervello", f.name));
    }
  }
  mkdirSync(join(finto, ".claude", "workflows"), { recursive: true });
  writeFileSync(join(finto, "cervello", "_tmp_sorvegliante-battito.json"), JSON.stringify({ scatto: 7, viste: {} }));
  const git = (...a) => execFileSync("git", a, { cwd: finto, stdio: "ignore" });
  git("init", "-q", ".");
  git("-c", "commit.gpgsign=false", "-c", "user.email=prova@prova", "-c", "user.name=prova", "commit", "-q", "--allow-empty", "-m", "zero");
});

after(() => {
  if (finto) rmSync(finto, { recursive: true, force: true });
});

/** Lancia l'hook vero con un evento PreToolUse; torna la busta letta (o null) e cosa è successo. */
function hook(tool_name, tool_input = {}) {
  const r = spawnSync(process.execPath, [join(finto, "cervello", "pre-scrittura.mjs"), "--hook"], {
    cwd: finto,
    input: JSON.stringify({ hook_event_name: "PreToolUse", tool_name, tool_input, cwd: finto }),
    encoding: "utf8",
    timeout: 20000,
  });
  assert.equal(r.status, 0, `l'hook deve uscire 0 (la decisione viaggia nel JSON): ${r.stderr}`);
  const riga = r.stdout.split("\n").find((l) => l.trim().startsWith("{"));
  const busta = riga ? JSON.parse(riga).hookSpecificOutput : null;
  return { busta, stderr: r.stderr };
}

const SCRIPT_BASE = `export const meta = { name: 'prova', description: 'prova' }\n`;
const conPreventivo = (riga, corpo = "await agent('uno')\n") => `// ${riga}\n${SCRIPT_BASE}${corpo}`;

// ── Workflow: il preventivo ──────────────────────────────────────────────────

test("uno script SENZA preventivo chiede a Nicola, e gli dice cosa manca", () => {
  const { busta } = hook("Workflow", { script: `${SCRIPT_BASE}await agent('uno')\nawait agent('due')\n` });
  assert.ok(busta, "senza preventivo la guardia deve parlare: prima del 15/11 taceva");
  assert.equal(busta.permissionDecision, "ask", "la guardia chiede, non nega mai da sola");
  assert.match(busta.permissionDecisionReason, /senza preventivo/);
  assert.match(busta.permissionDecisionReason, /almeno 2/, "e conta le chiamate scritte nel codice");
});

test("un preventivo SOTTO il tetto passa in silenzio: il freno non deve insegnare a cliccare «sì»", () => {
  const { busta } = hook("Workflow", { script: conPreventivo("Preventivo: 3 agenti, circa 1,5 milioni di token") });
  assert.equal(busta, null);
});

test("13 agenti dichiarati chiedono: il tetto del manuale è 12", () => {
  const { busta } = hook("Workflow", { script: conPreventivo("Preventivo: 13 agenti, circa 1 milione di token") });
  assert.equal(busta?.permissionDecision, "ask");
  assert.match(busta.permissionDecisionReason, /13 agenti \(il tetto è 12\)/);
});

test("2,5 milioni di token chiedono: il tetto del manuale è 2 milioni", () => {
  const { busta } = hook("Workflow", { script: conPreventivo("Preventivo: 3 agenti, 2,5 milioni di token") });
  assert.equal(busta?.permissionDecision, "ask");
  assert.match(busta.permissionDecisionReason, /2,5 milioni di token/);
});

test("il preventivo smentito dal codice chiede: dice 1 agente, lo script ne chiama 3", () => {
  const { busta } = hook("Workflow", {
    script: conPreventivo("Preventivo: 1 agente, 200 mila token", "await agent('a')\nawait agent('b')\nawait agent('c')\n"),
  });
  assert.equal(busta?.permissionDecision, "ask");
  assert.match(busta.permissionDecisionReason, /almeno 3/);
});

test("con più cifre vale la più alta: «3 per territorio, con 5 territori 15 agenti» supera il tetto", () => {
  const { busta } = hook("Workflow", { script: conPreventivo("Preventivo: 3 agenti per territorio, con 5 territori 15 agenti, 1,8 milioni di token") });
  assert.equal(busta?.permissionDecision, "ask", "il tetto si confronta col caso peggiore dichiarato, non col primo numero");
});

test("la parola «agent(» dentro un commento non conta come chiamata", () => {
  const { busta } = hook("Workflow", {
    script: conPreventivo("Preventivo: 1 agente, 100 mila token", "// qui una volta c'era agent('vecchio')\nawait agent('uno')\n"),
  });
  assert.equal(busta, null);
});

// ── Workflow: da dove arriva lo script ───────────────────────────────────────

test("scriptPath: legge il file e ci trova il preventivo sopra il tetto", () => {
  const p = join(finto, "squadra-grossa.js");
  writeFileSync(p, conPreventivo("Preventivo: 20 agenti, circa 3 milioni di token"));
  const { busta } = hook("Workflow", { scriptPath: "squadra-grossa.js" });
  assert.equal(busta?.permissionDecision, "ask");
  assert.match(busta.permissionDecisionReason, /20 agenti/);
});

test("scriptPath con preventivo sotto il tetto passa", () => {
  writeFileSync(join(finto, "squadra-piccola.js"), conPreventivo("Preventivo: 2 agenti, 300k token"));
  assert.equal(hook("Workflow", { scriptPath: join(finto, "squadra-piccola.js") }).busta, null);
});

test("un workflow salvato si legge da .claude/workflows/ col suo nome", () => {
  writeFileSync(join(finto, ".claude", "workflows", "salvato.js"), `${SCRIPT_BASE}await agent('uno')\n`);
  const { busta } = hook("Workflow", { name: "salvato" });
  assert.match(busta?.permissionDecisionReason || "", /senza preventivo/);
});

test("uno script che non si legge chiede invece di passare: non so quanto costa", () => {
  const { busta } = hook("Workflow", { scriptPath: "non-esiste.js" });
  assert.equal(busta?.permissionDecision, "ask");
  assert.match(busta.permissionDecisionReason, /non riesco a leggerne lo script/);
});

// ── Agent: l'ancora del senior ───────────────────────────────────────────────

test("Agent pianta l'ancora del senior e non chiede niente", () => {
  const ancora = join(finto, "cervello", "_tmp_senior-ancora.json");
  rmSync(ancora, { force: true });
  const { busta } = hook("Agent", { subagent_type: "qa", prompt: "leggi STATO.md" });
  assert.equal(busta, null, "far partire un senior non chiede niente");
  assert.ok(existsSync(ancora), "con «Agent» l'ancora deve nascere: prima nasceva solo con «Task»");
  assert.equal(JSON.parse(readFileSync(ancora, "utf8")).scatto, 7);
});

// ── Monitor: stessi controlli di Bash ─────────────────────────────────────────

test("Monitor con un commit che salta i cancelli chiede come Bash", () => {
  const { busta } = hook("Monitor", { command: "git commit --no-verify -m x", description: "x", timeout_ms: 1000 });
  assert.match(busta?.permissionDecisionReason || "", /cancelli-saltati/);
});

test("il libro mastro della copia registra la squadra: la riga resta anche quando passa", () => {
  hook("Workflow", { script: conPreventivo("Preventivo: 2 agenti, 300 mila token") });
  const righe = readFileSync(join(finto, "cervello", "_tmp_libro-mastro.jsonl"), "utf8").trim().split("\n").map((r) => JSON.parse(r));
  // Il libro mastro scrive due righe per mossa: l'apertura (con lo strumento) e la chiusura (con l'esito).
  const aperta = righe.filter((r) => r.strumento === "Workflow").pop();
  assert.ok(aperta, "nessuna riga Workflow nel libro mastro");
  const chiusa = righe.find((r) => r !== aperta && r.id === aperta.id);
  assert.match(JSON.stringify(chiusa || {}), /sotto tetto/, "la chiusura deve dire cosa ha misurato");
});
