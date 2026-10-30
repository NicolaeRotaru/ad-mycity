// La prova della macchina del metodo snello (cervello/prova-rimessa.mjs), su repo git veri e piccoli.
//
// Ogni caso costruisce un repo in una cartella temporanea: un commit di base col difetto, poi la
// correzione (committata o no) e una prova. Le prove girano con `node --test`, cosi' non serve il sito.
// Cio' che questa prova NON vede: vitest vero del sito (qui il sito non ha le sue librerie).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tipoDiRosso, passate } from "../prova-rimessa.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ATTREZZO = join(QUI, "..", "prova-rimessa.mjs");
const COMANDO = "node --test {prove}";

function repo(fileBase, fileDopo, { committa = true } = {}) {
  const d = mkdtempSync(join(tmpdir(), "rimessa-"));
  const g = (...a) => execFileSync("git", ["-C", d, "-c", "user.email=t@t", "-c", "user.name=t", ...a], { stdio: "pipe" }).toString().trim();
  const scrivi = (file) => { for (const [k, v] of Object.entries(file)) { mkdirSync(dirname(join(d, k)), { recursive: true }); writeFileSync(join(d, k), v); } };
  g("init", "-q");
  scrivi(fileBase);
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const base = g("rev-parse", "HEAD");
  scrivi(fileDopo);
  if (committa) { g("add", "-A"); g("commit", "-q", "-m", "correzione"); }
  return { d, base };
}

function lancia(r, file, prove, env = {}) {
  const p = spawnSync("node", [ATTREZZO, "--repo", r.d, "--base", r.base, "--file", file, "--prove", prove, "--comando", COMANDO, "--json"],
    { encoding: "utf8", env: { ...process.env, ...env } });
  let j = null;
  try { j = JSON.parse(p.stdout.trim().split("\n").pop()); } catch (e) { j = null; }
  return { uscita: p.status, j, err: p.stderr };
}

const SBAGLIATA = "export const somma = (a, b) => a - b;\n";
const GIUSTA = "export const somma = (a, b) => a + b;\n";
const PROVA = "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { somma } from '../lib/somma.mjs';\ntest('somma', () => assert.equal(somma(2, 2), 4));\n";

test("regge: rossa senza la correzione, verde con, e il file torna identico", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 0, JSON.stringify(o.j) + o.err);
  assert.equal(o.j.esito, "regge");
  assert.equal(readFileSync(join(r.d, "lib/somma.mjs"), "utf8"), GIUSTA);
});

test("regge anche con la correzione NON committata, e la correzione non si perde", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA }, { committa: false });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 0, JSON.stringify(o.j));
  assert.equal(readFileSync(join(r.d, "lib/somma.mjs"), "utf8"), GIUSTA);
});

test("non morde: la prova resta verde con la correzione tolta", () => {
  const vuota = "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { somma } from '../lib/somma.mjs';\ntest('c\\'e', () => assert.equal(typeof somma, 'function'));\n";
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": vuota });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 1);
  assert.equal(o.j.esito, "non_morde");
  assert.equal(readFileSync(join(r.d, "lib/somma.mjs"), "utf8"), GIUSTA);
});

test("rosso solo di struttura: la prova usa un nome che la base non ha, la macchina non decide (3)", () => {
  const prova = "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport * as m from '../lib/somma.mjs';\ntest('doppio', () => assert.equal(m.doppio(2), 4));\n";
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA + "export const doppio = (a) => a * 2;\n", "tests/somma.test.mjs": prova });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 3, JSON.stringify(o.j));
  assert.equal(o.j.esito, "rosso_strutturale");
});

test("un file nuovo della correzione: tolto al passo ②, rimesso alla fine", () => {
  const prova = "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { uno } from '../lib/nuovo.mjs';\ntest('uno', () => assert.equal(uno(), 1));\n";
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/nuovo.mjs": "export const uno = () => 1;\n", "tests/nuovo.test.mjs": prova });
  const o = lancia(r, "lib/nuovo.mjs", "tests/nuovo.test.mjs");
  assert.equal(o.uscita, 3, JSON.stringify(o.j));
  assert.ok(existsSync(join(r.d, "lib/nuovo.mjs")));
});

test("non verde: la prova e' rossa gia' sul codice di oggi", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": "export const somma = (a, b) => a * b + 1;\n", "tests/somma.test.mjs": PROVA });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 1);
  assert.equal(o.j.esito, "non_verde");
});

test("argomenti sbagliati: file uguale alla base, file e prova insieme, percorso fuori dal repo → 2", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA, "lib/altro.mjs": "x\n" }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA });
  assert.equal(lancia(r, "lib/altro.mjs", "tests/somma.test.mjs").uscita, 2);
  assert.equal(lancia(r, "tests/somma.test.mjs", "tests/somma.test.mjs").uscita, 2);
  assert.equal(lancia(r, "../fuori.mjs", "tests/somma.test.mjs").uscita, 2);
  assert.equal(readFileSync(join(r.d, "lib/somma.mjs"), "utf8"), GIUSTA);
});

// Alla base la somma sbagliata fa girare la prova per sempre: il passo ② scade coi file alla base.
const PROVA_CHE_SI_BLOCCA = "import { test } from 'node:test';\nimport { somma } from '../lib/somma.mjs';\ntest('somma', () => { while (somma(1, 1) !== 2) {} });\n";

test("tempo scaduto al passo ②: esce 2 e la correzione torna al suo posto", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA_CHE_SI_BLOCCA });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs", { PROVA_RIMESSA_TIMEOUT_MS: "3000" });
  assert.equal(o.uscita, 2, JSON.stringify(o.j));
  assert.equal(readFileSync(join(r.d, "lib/somma.mjs"), "utf8"), GIUSTA);
});

test("fermata da SIGTERM a meta' del passo ②: la correzione torna al suo posto", async () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA_CHE_SI_BLOCCA });
  const p = spawn("node", [ATTREZZO, "--repo", r.d, "--base", r.base, "--file", "lib/somma.mjs", "--prove", "tests/somma.test.mjs", "--comando", COMANDO],
    { env: { ...process.env, PROVA_RIMESSA_TIMEOUT_MS: "60000" }, stdio: "ignore" });
  // aspetto che il passo ② abbia messo la base sul disco, poi fermo l'attrezzo
  for (let i = 0; i < 100 && readFileSync(join(r.d, "lib/somma.mjs"), "utf8") !== SBAGLIATA; i++) await new Promise((ok) => setTimeout(ok, 100));
  assert.equal(readFileSync(join(r.d, "lib/somma.mjs"), "utf8"), SBAGLIATA, "il passo ② non e' partito");
  p.kill("SIGTERM");
  const codice = await new Promise((ok) => p.on("close", ok));
  assert.equal(codice, 2);
  assert.equal(readFileSync(join(r.d, "lib/somma.mjs"), "utf8"), GIUSTA);
});

test("il rosso si legge dal messaggio, non dal codice della prova stampato", () => {
  assert.equal(tipoDiRosso("AssertionError: expected 0 to be 4"), "comportamento");
  assert.equal(tipoDiRosso("TypeError: m.doppio is not a function\n  > expect(m.doppio(2)).toBe(4)"), "strutturale");
  assert.equal(tipoDiRosso("Error: boom"), "sconosciuto");
  assert.equal(passate(" Test Files  1 passed (1)\n      Tests  3 passed (3)"), 3);
  assert.equal(passate("Tests  1 failed | 2 passed (3)"), 2);
  assert.equal(passate("# pass 0\n# fail 0"), 0);
  assert.equal(passate("niente"), null);
});
