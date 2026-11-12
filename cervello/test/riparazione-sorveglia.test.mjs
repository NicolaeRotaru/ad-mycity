// La sorveglianza della riparazione in sessioni (cervello/riparazione/sorveglia.sh) non dice «nessun rosso» quando
// non ha guardato. Radiografia del 12/11 notte: lo script indovinava il deposito dei rami (../mycity) e su una
// campagna della macchina, o col sito in <radice>/marketplace, stampava «✅ nessun rosso» con la guardia rossa;
// un fetch fallito veniva buttato via e si giudicava il ramo vecchio. AR-1163 (la riparazione in sessioni).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const SERVONO = ["riparazione-sessioni.mjs", "scrivi-json.mjs", "memoria-senza-perdite.mjs", "scrittura-misura.mjs", "casa-memoria.mjs", "ora-piacenza.mjs", "referti-sito.mjs", "git-github.mjs", "marketplace-repo.mjs", "riparazione/sorveglia.sh"];

function casaFinta() {
  const t = mkdtempSync(join(tmpdir(), "sorveglia-"));
  const radice = join(t, "ad"), remoto = join(t, "remoto.git");
  const env = { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
  delete env.MARKETPLACE_REPO;
  const g = (...a) => execFileSync("git", ["-C", radice, ...a], { env }).toString().trim();
  const scrivi = (p, s) => { mkdirSync(dirname(join(radice, p)), { recursive: true }); writeFileSync(join(radice, p), s); };
  mkdirSync(radice, { recursive: true });
  for (const f of SERVONO) { mkdirSync(dirname(join(radice, "cervello", f)), { recursive: true }); copyFileSync(join(CERVELLO, f), join(radice, "cervello", f)); }
  scrivi("cervello/zz-foo.mjs", "export const foo = 1;\n");
  scrivi("cervello/zz-bar.mjs", "export const bar = 1;\n");
  execFileSync("git", ["init", "-q", "--bare", remoto]);
  g("init", "-q", "-b", "main"); g("add", "-A"); g("commit", "-qm", "base"); g("remote", "add", "origin", remoto); g("push", "-q", "origin", "main");
  const base = g("rev-parse", "HEAD");
  const C = "consegne/riparazioni/2026-11-13-macchina-prova";
  scrivi(`${C}/perimetro.json`, JSON.stringify({ casa: "macchina", profilo: "tutto", lavorabili: [] }));
  scrivi(`${C}/piano.json`, JSON.stringify({ casa: "macchina", onde: [{ onda: 1, base, candidate: [], rimandate: [], regia: [], sessioni: {
    R01: { tema: "x", voci: [{ id: "R01-001", chiave: "x|a", gravita: "minore", file: ["cervello/zz-foo.mjs"] }], file: ["cervello/zz-foo.mjs"] },
    R02: { tema: "y", voci: [{ id: "R02-001", chiave: "y|b", gravita: "minore", file: ["cervello/zz-bar.mjs"] }], file: ["cervello/zz-bar.mjs"] },
  } }], cucitura: [], eccedenza: [] }));
  scrivi(`${C}/sessioni.json`, JSON.stringify({ sessioni: { R01: { onda: 1, ramo: "rip-r01" }, R02: { onda: 1, ramo: "rip-r02" } } }));
  // Il ramo di R01 tocca anche il file di R02: la guardia è rossa.
  g("checkout", "-q", "-b", "rip-r01", base);
  scrivi("cervello/zz-foo.mjs", "export const foo = 2;\n"); scrivi("cervello/zz-bar.mjs", "export const bar = 9;\n");
  g("commit", "-qam", "R01-001 la riparazione, e il file di R02"); g("push", "-q", "origin", "rip-r01"); g("checkout", "-q", "main");
  const sorveglia = () => spawnSync("bash", [join(radice, "cervello/riparazione/sorveglia.sh"), C, "1"], { cwd: radice, env, encoding: "utf8" });
  return { t, radice, remoto, g, sorveglia };
}

test("AR-1163 · su una campagna della macchina la sorveglianza vede la guardia rossa (prima diceva «nessun rosso»)", () => {
  const { t, sorveglia } = casaFinta();
  try {
    const r = sorveglia();
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /🔴 R01 guardia-ramo/);
    assert.match(r.stdout, /cervello\/zz-bar\.mjs: è un file di un'altra sessione/);
    assert.doesNotMatch(r.stdout, /nessun rosso/);
    assert.match(r.stdout, /⏳ R02: il ramo rip-r02 non è ancora spinto/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1163 · se il fetch fallisce il giro è cieco (uscita 2) e non giudica il ramo vecchio", () => {
  const { t, g, sorveglia } = casaFinta();
  try {
    g("fetch", "-q", "origin", "+refs/heads/rip-r01:refs/remotes/origin/rip-r01");
    g("remote", "set-url", "origin", join(t, "non-c-e.git"));
    const r = sorveglia();
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /⚪ R01: fetch di rip-r01 fallito/);
    assert.match(r.stdout, /Non è un verde/);
    assert.doesNotMatch(r.stdout, /✅ giro/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1163 · senza un deposito git la sorveglianza esce 2, mai «nessun rosso»", () => {
  const { t, radice, sorveglia } = casaFinta();
  try {
    rmSync(join(radice, ".git"), { recursive: true, force: true });
    const r = sorveglia();
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /giro cieco: non trovo il deposito/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1163 · un ramo spinto ma ancora senza commit è un'attesa della guardia, non un rosso", () => {
  const { t, g, sorveglia } = casaFinta();
  try {
    g("push", "-q", "origin", "--delete", "rip-r01");
    g("branch", "-q", "rip-r02", g("rev-list", "--max-parents=0", "HEAD"));
    g("push", "-q", "origin", "rip-r02");
    const r = sorveglia();
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.doesNotMatch(r.stdout, /🔴/);
    assert.match(r.stdout, /✅ giro .*1 guardate su 2/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});
