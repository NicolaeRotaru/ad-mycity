#!/usr/bin/env node
// 🔒 AR-903 — SU MAIN CI VA SOLO LA MEMORIA, E ADESSO SI PROVA ESEGUENDOLO
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// `cervello/test/permessi-guardrail.bats` aveva un caso intitolato «niente codice non revisionato
// su main», e per difenderlo chiedeva che `.claude/settings.json` contenesse `Bash(git push:*)`
// fra i divieti. Quella riga l'ha tolta NICOLA il 27/7 (commit 1b5d0d1c8), e si vede perché: il
// manuale di questa casa pretende che io spinga sul ramo di lavoro, e un divieto secco su OGNI push
// rende impossibile il lavoro che lo stesso manuale ordina. Il caso è rimasto rosso più di un mese,
// accusando la macchina di una decisione del proprietario — e un cancello sempre rosso si impara ad
// aggirare.
//
// La proprietà però è vera e va difesa. Solo che non la difende quella riga: la difende il
// guardiano-integrità di `giro.sh` (AR-044), che al momento di pubblicare mette in stage SOLO le
// quattro cartelle di memoria e poi toglie di lì qualunque file di codice ci sia finito.
//
// ⚠️ E non si difende con un `grep`. Cercare le righe in un file dice che sono scritte, non che
// funzionano — è la «prova debole» che l'asticella di questa casa vieta sui difetti gravi. Qui le
// righe VERE vengono ritagliate da `giro.sh` ed ESEGUITE in un repo git usa-e-getta, con un file di
// codice sporco: se finisce in stage, il caso è rosso.
//
// Uscita: 0 = solo memoria in stage · 1 = del codice è passato · 2 = non ho potuto ritagliare.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");

/** Le righe vere del guardiano-integrità, da `git add` fino alla chiusura dell'`if`. */
function ritaglia() {
  const righe = giro.split("\n");
  const inizio = righe.findIndex((r) => r.includes('# AR-044: guardiano-integrità'));
  if (inizio < 0) return null;
  const fine = righe.findIndex((r, i) => i > inizio && r.trim() === "fi");
  if (fine < 0) return null;
  return righe.slice(inizio, fine + 1).join("\n");
}

const BLOCCO = ritaglia();

/** Un repo git vero, con memoria e codice dentro, e lo stato che il giro troverebbe. */
function repoFinto() {
  const casa = mkdtempSync(join(tmpdir(), "ar903-"));
  const git = (...a) => spawnSync("git", a, { cwd: casa, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "prova@esempio.invalid");
  git("config", "user.name", "prova");
  for (const d of ["MyCity-Vault", "consegne", "creativi", "memoria-squadra", "cervello", "pannello"]) {
    mkdirSync(join(casa, d), { recursive: true });
    writeFileSync(join(casa, d, "gia-c-era.txt"), "prima\n");
  }
  git("add", "-A");
  git("commit", "-qm", "primo");
  return { casa, git };
}

/** Esegue le righe vere nel repo finto e torna cosa è finito in stage. */
function cosaVaInStage(casa) {
  const script = [
    "set -uo pipefail",
    'ts() { echo "00:00"; }',
    "MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)",
    BLOCCO,
    "git diff --cached --name-only",
  ].join("\n");
  const r = spawnSync("bash", ["-c", script], { cwd: casa, encoding: "utf8" });
  return { staged: `${r.stdout}`.trim().split("\n").filter(Boolean), tutto: `${r.stdout}${r.stderr}` };
}

test("AR-903 · le righe vere si lasciano ritagliare da giro.sh", () => {
  assert.ok(BLOCCO, "il guardiano-integrità non si trova più in giro.sh: questa prova girerebbe a vuoto (⚪)");
});

test("AR-903 · la memoria modificata va in stage: il giro deve poter pubblicare", () => {
  const { casa } = repoFinto();
  writeFileSync(join(casa, "MyCity-Vault", "STATO.md"), "aggiornato\n");
  const { staged, tutto } = cosaVaInStage(casa);
  assert.deepEqual(staged, ["MyCity-Vault/STATO.md"], `stage inatteso:\n${tutto}`);
  rmSync(casa, { recursive: true, force: true });
});

test("AR-903 · un file di CODICE sporco NON arriva in stage, nemmeno se è l'unica modifica", () => {
  const { casa } = repoFinto();
  writeFileSync(join(casa, "cervello", "giro.sh"), "# riscritto da qualcuno\n");
  const { staged, tutto } = cosaVaInStage(casa);
  assert.deepEqual(staged, [], `del codice è finito in stage e da lì andrebbe su main: ${staged.join(", ")}\n${tutto}`);
  rmSync(casa, { recursive: true, force: true });
});

test("AR-903 · e nemmeno insieme alla memoria: il codice si toglie, la memoria resta", () => {
  const { casa } = repoFinto();
  writeFileSync(join(casa, "MyCity-Vault", "STATO.md"), "aggiornato\n");
  writeFileSync(join(casa, "pannello", "route.ts"), "// codice non revisionato\n");
  const { staged, tutto } = cosaVaInStage(casa);
  assert.equal(staged.includes("pannello/route.ts"), false, `codice non revisionato in stage:\n${tutto}`);
  assert.equal(staged.includes("MyCity-Vault/STATO.md"), true,
    "togliendo il codice si è portata via anche la memoria: il giro non pubblicherebbe più niente");
  rmSync(casa, { recursive: true, force: true });
});

test("AR-903 · un file di codice GIÀ messo in stage da qualcun altro viene tolto", () => {
  // Il caso che la seconda rete esiste per prendere: qualcuno ha già fatto `git add` prima di qui.
  const { casa, git } = repoFinto();
  writeFileSync(join(casa, "cervello", "intruso.mjs"), "// non revisionato\n");
  git("add", "cervello/intruso.mjs");
  const { staged, tutto } = cosaVaInStage(casa);
  assert.equal(staged.includes("cervello/intruso.mjs"), false,
    `un file di codice messo in stage prima del guardiano ci è rimasto:\n${tutto}`);
  rmSync(casa, { recursive: true, force: true });
});
