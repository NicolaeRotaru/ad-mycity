// I buchi trovati dai due giri di collaudo indipendente del 12/11 sera sulle due regole firmate da Nicola:
// ognuno era rosso prima della sua correzione. Scritti dal collaudatore, non da chi ha costruito.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const ATTREZZO = join(dirname(fileURLToPath(import.meta.url)), "..", "prova-rimessa.mjs");
const COMANDO = "node --test {prove}";
function repo(fileBase, fileDopo) {
  const d = mkdtempSync(join(tmpdir(), "rim-"));
  const g = (...a) => execFileSync("git", ["-C", d, "-c", "user.email=t@t", "-c", "user.name=t", ...a], { stdio: "pipe" }).toString().trim();
  const scrivi = (f) => { for (const [k, v] of Object.entries(f)) { mkdirSync(dirname(join(d, k)), { recursive: true }); writeFileSync(join(d, k), v); } };
  g("init", "-q"); scrivi(fileBase); g("add", "-A"); g("commit", "-q", "-m", "base");
  const base = g("rev-parse", "HEAD"); scrivi(fileDopo); g("add", "-A"); g("commit", "-q", "-m", "fix");
  return { d, base };
}
function lancia(r, file, prove) {
  const { NODE_TEST_CONTEXT, ...env } = process.env;
  const p = spawnSync("node", [ATTREZZO, "--repo", r.d, "--base", r.base, "--file", file, "--prove", prove, "--comando", COMANDO, "--json"], { encoding: "utf8", env, timeout: 60000 });
  return JSON.parse(p.stdout.trim().split("\n").pop());
}
const testa = "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n";
test("A: file nuovo estraneo (migrazione pericolosa) accanto a un fix vero -> non deve dare regge sul file nuovo", () => {
  const r = repo({ "lib/somma.mjs": "export const somma=(a,b)=>a-b;\n" },
    { "lib/somma.mjs": "export const somma=(a,b)=>a+b;\n", "migrations/250_apri.sql": "alter table orders disable row level security;\n",
      "tests/somma.test.mjs": testa + "import { somma } from '../lib/somma.mjs';\ntest('s',()=>assert.equal(somma(2,2),4));\n" });
  const j = lancia(r, "lib/somma.mjs,migrations/250_apri.sql", "tests/somma.test.mjs");
  console.log(JSON.stringify(j.passi));
  assert.notEqual(j.esito, "regge", "la migrazione nuova non e' provata da nessuna prova, ma l'esito e' regge");
});
// A2 (13/11): la A non basta più da sola. Dalla radiografia del 12/11 notte ogni migrazione senza --sql è «strutturale»,
// quindi la A resta verde anche se si torna a togliere gli esistenti insieme ai nuovi. Qui il file estraneo non è
// né SQL né codice né nominato dalle prove: lo ferma solo la regola «si tolgono i nuovi, gli esistenti restano corretti».
test("A2: file nuovo estraneo di dati accanto a un fix vero -> non_morde, non regge", () => {
  const r = repo({ "lib/somma.mjs": "export const somma=(a,b)=>a-b;\n" },
    { "lib/somma.mjs": "export const somma=(a,b)=>a+b;\n", "config/apri.json": "{\"rls\": false}\n",
      "tests/somma.test.mjs": testa + "import { somma } from '../lib/somma.mjs';\ntest('s',()=>assert.equal(somma(2,2),4));\n" });
  const j = lancia(r, "lib/somma.mjs,config/apri.json", "tests/somma.test.mjs");
  assert.equal(j.esito, "non_morde", "il file di dati nuovo non e' provato da nessuna prova, ma l'esito e' " + j.esito + " " + JSON.stringify(j.passi));
});
test("H: aiutante nuovo NON collegato al sito, prova che lo carica con import(new URL) -> non deve dare regge", () => {
  const r = repo({ "lib/x.mjs": "export const x=1;\n" },
    { "lib/aiuto.mjs": "export const aiuto=(a,b)=>a+b;\n",
      "tests/aiuto.test.mjs": testa + "test('a', async ()=>{ let m={}; try { m = await import(new URL('../lib/aiuto.mjs', import.meta.url)); } catch {} assert.equal(m.aiuto?.(2,2), 4); });\n" });
  const j = lancia(r, "lib/aiuto.mjs", "tests/aiuto.test.mjs");
  console.log(JSON.stringify(j.passi));
  assert.notEqual(j.esito, "regge", "il sito non e' cambiato di un byte (aiutante orfano) ma l'esito e' regge");
});
test("H2: aiutante orfano, nome spezzato in due stringhe -> non deve dare regge", () => {
  const r = repo({ "lib/x.mjs": "export const x=1;\n" },
    { "lib/aiuto.mjs": "export const aiuto=(a,b)=>a+b;\n",
      "tests/aiuto.test.mjs": testa + "test('a', async ()=>{ let m={}; try { m = await import(new URL('../lib/aiu'+'to.mjs', import.meta.url)); } catch {} assert.equal(m.aiuto?.(2,2), 4); });\n" });
  const j = lancia(r, "lib/aiuto.mjs", "tests/aiuto.test.mjs");
  assert.notEqual(j.esito, "regge");
});
test("REGR: migrazione onesta citata nel commento di testa della prova -> deve poter reggere", () => {
  const r = repo({ "regole/base.txt": "x\n" },
    { "regole/limite.txt": "10\n",
      "tests/regole.test.mjs": "// prova della regola limite.txt (migrazione 250)\n" + testa + "import { readdirSync } from 'node:fs';\ntest('r',()=>assert.ok(readdirSync('regole').length===2,'expected regole to include 2'));\n" });
  const j = lancia(r, "regole/limite.txt", "tests/regole.test.mjs");
  console.log("REGR", j.esito, JSON.stringify(j.passi));
});
