// I buchi trovati dal collaudo indipendente del 12/11 sera sulle due regole firmate da Nicola: ognuno era rosso
// prima della correzione. Scritti dal collaudatore, non da chi ha costruito.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const PROGRAMMA = join(dirname(fileURLToPath(import.meta.url)), "..", "riparazione-sessioni.mjs");
function depositoFinto(extra = {}) {
  const dir = mkdtempSync(join(tmpdir(), "coll-"));
  const g = (...a) => execFileSync("git", ["-C", dir, ...a], { env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } }).toString().trim();
  const scrivi = (p, t) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), t); };
  g("init", "-q", "-b", "main");
  scrivi("lib/a.ts", "export const a = 1;\n"); scrivi("lib/b.ts", "export const b = 1;\n");
  for (const [p, t] of Object.entries(extra)) scrivi(p, t);
  g("add", "-A"); g("commit", "-q", "-m", "base");
  return { dir, g, scrivi, base: g("rev-parse", "HEAD") };
}
function campagna(base, fileR02 = ["lib/b.ts"]) {
  const c = mkdtempSync(join(tmpdir(), "camp-"));
  writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", profilo: "tutto", lavorabili: [] }));
  writeFileSync(join(c, "piano.json"), JSON.stringify({ casa: "sito", onde: [{ onda: 1, base, candidate: [], rimandate: [], regia: [], sessioni: {
    R01: { tema: "x", voci: [{ id: "R01-001", chiave: "x|a", gravita: "minore", file: ["lib/a.ts"] }], file: ["lib/a.ts"], migrazioni: [250, 259] },
    R02: { tema: "y", voci: [{ id: "R02-001", chiave: "y|b", gravita: "minore", file: fileR02 }], file: fileR02, migrazioni: [260, 269] } } }], cucitura: [], eccedenza: [] }));
  return c;
}
const lancia = (...a) => spawnSync(process.execPath, [PROGRAMMA, ...a], { encoding: "utf8" });

test("HOLE1: file altrui con nome non-ASCII modificato -> deve essere rosso", () => {
  const { dir, g, scrivi, base } = depositoFinto({ "lib/caffè.ts": "export const c = 1;\n" });
  const c = campagna(base, ["lib/b.ts", "lib/caffè.ts"]);
  g("checkout", "-q", "-b", "r01", base);
  scrivi("lib/a.ts", "export const a = 2;\n"); scrivi("lib/caffè.ts", "export const c = 666;\n");
  g("commit", "-qam", "R01-001 riparo");
  const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
  console.log(r.stdout.slice(0, 600));
  assert.equal(r.status, 1, "file di R02 modificato ma verde");
});
test("HOLE2: prova esistente con nome non-ASCII cancellata -> deve essere rossa", () => {
  const { dir, g, scrivi, base } = depositoFinto({ "tests/unit/prezzò.test.ts": "import {a} from '../../lib/a';\nit('x',()=>{expect(a).toBe(1)});\n" });
  const c = campagna(base);
  g("checkout", "-q", "-b", "r01", base);
  scrivi("lib/a.ts", "export const a = 2;\n"); g("rm", "-q", "tests/unit/prezzò.test.ts");
  g("commit", "-qam", "R01-001 riparo");
  const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
  console.log(r.stdout.slice(0, 600));
  assert.equal(r.status, 1);
});
test("VERDE MUTO: commit che toccano e rimettono, diff netto vuoto", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = campagna(base);
  g("checkout", "-q", "-b", "r01", base);
  scrivi("lib/a.ts", "export const a = 2;\n"); g("commit", "-qam", "R01-001 riparo");
  scrivi("lib/a.ts", "export const a = 1;\n"); g("commit", "-qam", "R01-001 annullo");
  const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
  console.log("status", r.status, r.stdout.slice(0, 400));
  assert.notEqual(r.status, 0, "verde senza aver guardato niente");
});
test("SHARED: prova comune che nomina file di R01 e R02; R01 toglie dal giro il file di R02 -> deve essere rosso", () => {
  const t0 = "import { readFileSync } from 'node:fs';\nfor (const f of ['lib/a.ts', 'lib/b.ts']) it(f, () => { expect(readFileSync(f, 'utf8')).not.toMatch(/eval/); });\n";
  const { dir, g, scrivi, base } = depositoFinto({ "tests/unit/sicurezza.test.ts": t0 });
  const c = campagna(base);
  g("checkout", "-q", "-b", "r01", base);
  scrivi("lib/a.ts", "export const a = 2;\n");
  scrivi("tests/unit/sicurezza.test.ts", t0.replace("'lib/a.ts', 'lib/b.ts'", "'lib/a.ts'"));
  g("commit", "-qam", "R01-001 riparo");
  const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
  assert.equal(r.status, 1, "R01 ha tolto lib/b.ts (di R02) da una prova di sicurezza ed e' verde");
});
