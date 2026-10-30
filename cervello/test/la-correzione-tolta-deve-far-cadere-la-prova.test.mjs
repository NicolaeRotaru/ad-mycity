// La prova della macchina del metodo snello (cervello/prova-rimessa.mjs), su repo git veri e piccoli.
//
// Ogni caso costruisce un repo in una cartella temporanea: un commit di base col difetto, poi la
// correzione (committata o no) e una prova. Le prove girano con `node --test`, cosi' non serve il sito.
// Dentro ci sono i nove modi di romperlo trovati dal collaudo del 30/10 (falsi «regge», file non rimessi).
// Cio' che questa prova NON vede: vitest vero del sito (qui il sito non ha le sue librerie).

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync, rmSync, chmodSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tipoDiRosso, passate, nomiNuoviUsati } from "../prova-rimessa.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ATTREZZO = join(QUI, "..", "prova-rimessa.mjs");
const COMANDO = "node --test {prove}";
const DA_TOGLIERE = [];
after(() => { for (const d of DA_TOGLIERE) rmSync(d, { recursive: true, force: true }); });

function repo(fileBase, fileDopo, { committa = true, attributi = "" } = {}) {
  const d = mkdtempSync(join(tmpdir(), "rimessa-"));
  DA_TOGLIERE.push(d);
  const g = (...a) => execFileSync("git", ["-C", d, "-c", "user.email=t@t", "-c", "user.name=t", ...a], { stdio: "pipe" }).toString().trim();
  const scrivi = (file) => { for (const [k, v] of Object.entries(file)) { mkdirSync(dirname(join(d, k)), { recursive: true }); writeFileSync(join(d, k), v); } };
  g("init", "-q");
  if (attributi) scrivi({ ".gitattributes": attributi });
  scrivi(fileBase);
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const base = g("rev-parse", "HEAD");
  scrivi(fileDopo);
  if (committa) { g("add", "-A"); g("commit", "-q", "-m", "correzione"); }
  return { d, base };
}

const ambiente = (extra) => { const { NODE_TEST_CONTEXT, ...e } = process.env; return { ...e, ...extra }; };
function lancia(r, file, prove, env = {}, comando = COMANDO) {
  const p = spawnSync("node", [ATTREZZO, "--repo", r.d, "--base", r.base, "--file", file, "--prove", prove, "--comando", comando, "--json"],
    { encoding: "utf8", env: ambiente(env), timeout: 60000 });
  let j = null;
  try { j = JSON.parse(p.stdout.trim().split("\n").pop()); } catch (e) { j = null; }
  if (j && j.log) DA_TOGLIERE.push(j.log);
  return { uscita: p.status, j, err: p.stderr };
}
const leggi = (r, f) => readFileSync(join(r.d, f), "utf8");

const SBAGLIATA = "export const somma = (a, b) => a - b;\n";
const GIUSTA = "export const somma = (a, b) => a + b;\n";
const testa = "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n";
const PROVA = testa + "import { somma } from '../lib/somma.mjs';\ntest('somma', () => assert.equal(somma(2, 2), 4));\n";
const CON_DOPPIO = GIUSTA + "export const doppio = (a) => a * 2;\nexport const radice = (a) => { if (a < 0) throw new Error('negativo'); return Math.sqrt(a); };\n";

test("regge: rossa senza la correzione, verde con, e il file torna identico", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 0, JSON.stringify(o.j) + o.err);
  assert.equal(o.j.esito, "regge");
  assert.equal(leggi(r, "lib/somma.mjs"), GIUSTA);
});

test("una correzione NON committata si ferma prima di toccare niente (2): la correzione vera deve stare nel commit", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA }, { committa: false });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 2);
  assert.match(o.j.motivo, /non committate/);
  assert.equal(leggi(r, "lib/somma.mjs"), GIUSTA);
});

test("non morde: la prova resta verde con la correzione tolta", () => {
  const vuota = testa + "import { somma } from '../lib/somma.mjs';\ntest('c', () => assert.equal(typeof somma, 'function'));\n";
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": vuota });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 1);
  assert.equal(o.j.esito, "non_morde");
});

// Collaudo del 30/10, difetto 1: quattro falsi «regge» quando la prova cade solo perche' manca un nome nuovo.
for (const [nome, prova] of [
  ["TypeError dentro assert.throws", "import * as m from '../lib/somma.mjs';\ntest('x', () => assert.throws(() => m.radice(-1), /negativo/));\n"],
  ["typeof su un nome nuovo, senza nessun TypeError", "import * as m from '../lib/somma.mjs';\ntest('x', () => assert.equal(typeof m.doppio, 'function'));\n"],
  ["il nome del test dice «expected … to be»", "import * as m from '../lib/somma.mjs';\ntest('expected doppio(2) to be 4', () => assert.equal(m.doppio(2), 4));\n"],
  ["la riga stampata dice «expected … to be»", "import * as m from '../lib/somma.mjs';\nconst r = m.doppio(2); // expected r to be 4\ntest('x', () => assert.equal(r, 4));\n"],
]) {
  test("un nome nuovo non fa un «regge»: " + nome, () => {
    const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": CON_DOPPIO, "tests/somma.test.mjs": testa + prova });
    const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
    assert.equal(o.uscita, 3, JSON.stringify(o.j));
    assert.equal(o.j.esito, "rosso_strutturale");
  });
}

test("due file corretti e una prova che ne guarda uno solo: non morde, e dice quale", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA, "lib/sconto.mjs": "export const sconto = (p) => p;\n" },
    { "lib/somma.mjs": GIUSTA, "lib/sconto.mjs": "export const sconto = (p) => p * 0.9;\n", "tests/somma.test.mjs": PROVA });
  const o = lancia(r, "lib/somma.mjs,lib/sconto.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 1, JSON.stringify(o.j));
  assert.equal(o.j.esito, "non_morde");
  assert.match(o.j.motivo, /lib\/sconto\.mjs/);
  assert.doesNotMatch(o.j.motivo, /lib\/somma\.mjs/);
});

test("un file nuovo della correzione: tolto al passo ②, rimesso alla fine", () => {
  const prova = testa + "import { uno } from '../lib/nuovo.mjs';\ntest('uno', () => assert.equal(uno(), 1));\n";
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/nuovo.mjs": "export const uno = () => 1;\n", "tests/nuovo.test.mjs": prova });
  assert.equal(lancia(r, "lib/nuovo.mjs", "tests/nuovo.test.mjs").uscita, 3);
  assert.ok(existsSync(join(r.d, "lib/nuovo.mjs")));
});

test("i permessi tornano com'erano: un file eseguibile resta eseguibile", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA, "lib/run.sh": "echo 1\n" }, { "lib/somma.mjs": GIUSTA, "lib/run.sh": "echo 2\n", "tests/somma.test.mjs": PROVA }, { committa: false });
  chmodSync(join(r.d, "lib/run.sh"), 0o755);
  execFileSync("git", ["-C", r.d, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-am", "correzione"], { stdio: "pipe" });
  execFileSync("git", ["-C", r.d, "-c", "user.email=t@t", "-c", "user.name=t", "add", "-A"], { stdio: "pipe" });
  execFileSync("git", ["-C", r.d, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "prova", "--allow-empty"], { stdio: "pipe" });
  lancia(r, "lib/somma.mjs,lib/run.sh", "tests/somma.test.mjs");
  assert.equal(statSync(join(r.d, "lib/run.sh")).mode & 0o777, 0o755);
  assert.equal(leggi(r, "lib/run.sh"), "echo 2\n");
});

test("con gli a capo convertiti da .gitattributes, un file non toccato resta «uguale alla base» (2)", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA, "lib/altro.mjs": "export const x = 1;\n" }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA }, { attributi: "* text eol=crlf\n" });
  assert.equal(lancia(r, "lib/altro.mjs", "tests/somma.test.mjs").uscita, 2);
});

test("non verde: la prova e' rossa gia' sul codice di oggi", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": "export const somma = (a, b) => a * b + 1;\n", "tests/somma.test.mjs": PROVA });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 1);
  assert.equal(o.j.esito, "non_verde");
});

test("argomenti sbagliati escono 2 e non toccano niente", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA, "lib/altro.mjs": "x\n" }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA });
  assert.equal(lancia(r, "lib/altro.mjs", "tests/somma.test.mjs").uscita, 2, "file uguale alla base");
  assert.equal(lancia(r, "tests/somma.test.mjs", "tests/somma.test.mjs").uscita, 2, "file e prova insieme");
  assert.equal(lancia(r, "lib/somma.mjs,./tests/somma.test.mjs", "tests/somma.test.mjs").uscita, 2, "file e prova insieme, scritti diversi");
  assert.equal(lancia(r, "../fuori.mjs", "tests/somma.test.mjs").uscita, 2, "fuori dal repo");
  assert.equal(lancia(r, "lib/somma.mjs", "tests").uscita, 2, "una cartella al posto della prova");
  assert.equal(lancia(r, "lib/somma.mjs", "tests/somma.test.mjs", {}, "node --test").uscita, 2, "comando senza {prove}");
  assert.equal(leggi(r, "lib/somma.mjs"), GIUSTA);
  assert.ok(existsSync(join(r.d, "tests/somma.test.mjs")));
});

// Alla base la somma sbagliata fa girare la prova per sempre: il passo ② scade coi file alla base.
const PROVA_CHE_SI_BLOCCA = "import { test } from 'node:test';\nimport { somma } from '../lib/somma.mjs';\ntest('somma', () => { while (somma(1, 1) !== 2) {} });\n";

test("tempo scaduto al passo ②, anche se il comando non fa exec («…; true»): esce 2 e la correzione torna", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA_CHE_SI_BLOCCA });
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs", { PROVA_RIMESSA_TIMEOUT_MS: "3000" }, "node --test {prove}; true");
  assert.equal(o.uscita, 2, JSON.stringify(o.j) + o.err);
  assert.equal(leggi(r, "lib/somma.mjs"), GIUSTA);
});

async function fermaAMeta(r, segnale) {
  const p = spawn("node", [ATTREZZO, "--repo", r.d, "--base", r.base, "--file", "lib/somma.mjs", "--prove", "tests/somma.test.mjs", "--comando", COMANDO],
    { env: ambiente({ PROVA_RIMESSA_TIMEOUT_MS: "60000" }), stdio: "ignore" });
  for (let i = 0; i < 100 && leggi(r, "lib/somma.mjs") !== SBAGLIATA; i++) await new Promise((ok) => setTimeout(ok, 100));
  assert.equal(leggi(r, "lib/somma.mjs"), SBAGLIATA, "il passo ② non e' partito");
  p.kill(segnale);
  return new Promise((ok) => p.on("close", ok));
}

test("fermata da SIGTERM a meta' del passo ②: la correzione torna subito", async () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA_CHE_SI_BLOCCA });
  assert.equal(await fermaAMeta(r, "SIGTERM"), 2);
  assert.equal(leggi(r, "lib/somma.mjs"), GIUSTA);
});

test("uccisa con kill -9 a meta' del passo ②: la corsa dopo si ferma e dice come rimettere il file dal commit", async () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA_CHE_SI_BLOCCA });
  await fermaAMeta(r, "SIGKILL");
  assert.equal(leggi(r, "lib/somma.mjs"), SBAGLIATA, "kill -9: niente puo' rimettere subito");
  const o = lancia(r, "lib/somma.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 2);
  assert.match(o.j.motivo, /checkout HEAD -- lib\/somma\.mjs/);
  execFileSync("git", ["-C", r.d, "checkout", "HEAD", "--", "lib/somma.mjs"], { stdio: "pipe" });
  assert.equal(leggi(r, "lib/somma.mjs"), GIUSTA, "la correzione e' nel commit: non si e' persa");
});

test("il rosso si legge dal messaggio; la struttura vince sull'asserzione", () => {
  assert.equal(tipoDiRosso("AssertionError: expected 0 to be 4"), "comportamento");
  assert.equal(tipoDiRosso("AssertionError: Got unwanted exception. TypeError: m.radice is not a function"), "strutturale");
  assert.equal(tipoDiRosso("Error: boom"), "sconosciuto");
  assert.deepEqual(nomiNuoviUsati("export const a = 1;", "export const a = 1;\nexport function b() {}\nexport { c as d };", "m.b(); d()"), ["b", "d"]);
  assert.equal(passate(" Test Files  1 passed (1)\n      Tests  3 passed (3)"), 3);
  assert.equal(passate("Tests  1 failed | 2 passed (3)"), 2);
  assert.equal(passate("# pass 0\n# fail 0"), 0);
  assert.equal(passate("niente"), null);
});

// ── dal ricollaudo del 30/10: niente deve mai scrivere sopra lavoro piu' nuovo ─────────────────────
test("dopo un kill -9, lavoro nuovo scritto sul file non viene toccato: la corsa dopo si ferma", async () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA_CHE_SI_BLOCCA });
  await fermaAMeta(r, "SIGKILL");
  const V2 = "export const somma = (a, b) => a + b; // v2\n";
  writeFileSync(join(r.d, "lib/somma.mjs"), V2);
  assert.equal(lancia(r, "lib/somma.mjs", "tests/somma.test.mjs").uscita, 2);
  assert.equal(leggi(r, "lib/somma.mjs"), V2);
});

test("dopo un kill -9, un worktree rifatto allo stesso percorso parte pulito, e i suoi file non si toccano", async () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "lib/somma.mjs": GIUSTA, "tests/somma.test.mjs": PROVA_CHE_SI_BLOCCA });
  await fermaAMeta(r, "SIGKILL");
  rmSync(r.d, { recursive: true, force: true });
  mkdirSync(r.d);
  const g = (...a) => execFileSync("git", ["-C", r.d, "-c", "user.email=t@t", "-c", "user.name=t", ...a], { stdio: "pipe" }).toString().trim();
  g("init", "-q");
  mkdirSync(join(r.d, "lib")); mkdirSync(join(r.d, "tests"));
  writeFileSync(join(r.d, "lib/somma.mjs"), SBAGLIATA); writeFileSync(join(r.d, "lib/k.mjs"), "export const k = 1;\n"); g("add", "-A"); g("commit", "-q", "-m", "base");
  const nuova = { d: r.d, base: g("rev-parse", "HEAD") };
  writeFileSync(join(r.d, "lib/k.mjs"), "export const k = 2;\n"); writeFileSync(join(r.d, "tests/somma.test.mjs"), PROVA); g("add", "-A"); g("commit", "-q", "-m", "k");
  const o = lancia(nuova, "lib/k.mjs", "tests/somma.test.mjs");
  assert.notEqual(o.uscita, 4);
  assert.equal(leggi(r, "lib/somma.mjs"), SBAGLIATA, "un file fuori da --file non si tocca mai");
  assert.equal(o.j.esito, "non_verde", "nel repo nuovo la somma e' quella sbagliata: la prova e' rossa gia' oggi, e lo dice");
});

test("due corse insieme: la seconda si ferma (2) anche se parte durante il passo ① della prima", async () => {
  const lenta = testa + "import { somma } from '../lib/somma.mjs';\ntest('somma', async () => { await new Promise((ok) => setTimeout(ok, 1500)); assert.equal(somma(2, 2), 4); });\n";
  const r = repo({ "lib/somma.mjs": SBAGLIATA, "lib/k.mjs": "export const k = 1;\n" }, { "lib/somma.mjs": GIUSTA, "lib/k.mjs": "export const k = 2;\n", "tests/somma.test.mjs": lenta });
  const prima = spawn("node", [ATTREZZO, "--repo", r.d, "--base", r.base, "--file", "lib/somma.mjs,lib/k.mjs", "--prove", "tests/somma.test.mjs", "--comando", COMANDO], { env: ambiente({}), stdio: "ignore" });
  await new Promise((ok) => setTimeout(ok, 400));
  const o = lancia(r, "lib/k.mjs", "tests/somma.test.mjs");
  assert.equal(o.uscita, 2, JSON.stringify(o.j));
  await new Promise((ok) => prima.on("close", ok));
  assert.equal(leggi(r, "lib/somma.mjs"), GIUSTA);
});

test("un file nuovo della correzione NON committato si ferma (2) e resta dov'e'", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA }, { "tests/somma.test.mjs": PROVA });
  writeFileSync(join(r.d, "lib/nuovo.mjs"), "export const uno = () => 1;\n");
  assert.equal(lancia(r, "lib/nuovo.mjs", "tests/somma.test.mjs").uscita, 2);
  assert.ok(existsSync(join(r.d, "lib/nuovo.mjs")));
});

test("i percorsi si leggono alla lettera: le quadre di app/[id] non sono caratteri jolly", () => {
  const r = repo({ "lib/somma.mjs": SBAGLIATA, "app/[id]/p.mjs": "export const p = 1;\n", "app/i/p.mjs": "export const p = 1;\n" },
    { "lib/somma.mjs": GIUSTA, "app/i/p.mjs": "export const p = 2;\n", "tests/somma.test.mjs": PROVA });
  assert.equal(lancia(r, "app/[id]/p.mjs", "tests/somma.test.mjs").uscita, 2);
});
