// La sorveglianza muta (officina minima del 15/11, pezzo 2): `sorveglia.sh --attendi` resta zitta finché non c'è un
// segnale che la regista non ha ancora visto, e `stato` riassume la campagna in 40 righe al massimo. Regia dell'onda
// 2: 407,68 $ con 12 registe, giri a vuoto da circa 0,73 $ l'uno e giri con nessuna figlia viva (14/11, 12:32 e 13:34).
// Tutto su una casa finta: una campagna della macchina con un deposito git e un remoto nudo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { testoStato, segnaliDa, nuoviSegnali, RIGHE_STATO } from "../riparazione-sessioni.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const SERVONO = ["riparazione-sessioni.mjs", "scrivi-json.mjs", "memoria-senza-perdite.mjs", "scrittura-misura.mjs", "casa-memoria.mjs", "ora-piacenza.mjs", "referti-sito.mjs", "git-github.mjs", "marketplace-repo.mjs", "riparazione/sorveglia.sh"];
const C = "consegne/riparazioni/2026-11-15-macchina-muta";

function casaFinta() {
  const t = mkdtempSync(join(tmpdir(), "muta-"));
  const radice = join(t, "ad"), remoto = join(t, "remoto.git");
  const env = { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t", SORVEGLIA_INTERVALLO: "1", SORVEGLIA_BATTITO: "4" };
  delete env.MARKETPLACE_REPO;
  const g = (...a) => execFileSync("git", ["-C", radice, ...a], { env }).toString().trim();
  const scrivi = (p, s) => { mkdirSync(dirname(join(radice, p)), { recursive: true }); writeFileSync(join(radice, p), s); };
  mkdirSync(radice, { recursive: true });
  for (const f of SERVONO) { mkdirSync(dirname(join(radice, "cervello", f)), { recursive: true }); copyFileSync(join(CERVELLO, f), join(radice, "cervello", f)); }
  scrivi("cervello/zz-foo.mjs", "export const foo = 1;\n");
  execFileSync("git", ["init", "-q", "--bare", remoto]);
  g("init", "-q", "-b", "main"); g("add", "-A"); g("commit", "-qm", "base"); g("remote", "add", "origin", remoto); g("push", "-q", "origin", "main");
  // R01 ha spinto il ramo con un referto parziale; R02 non ha ancora spinto.
  g("checkout", "-q", "-b", "rip-r01");
  scrivi(".riparazione/referto-R01.json", JSON.stringify({ sessione: "R01", finita: false, voci: [{ id: "R01-001", esito: "riparato" }] }));
  g("add", "-A"); g("commit", "-qm", "referto parziale"); g("push", "-q", "origin", "rip-r01"); g("checkout", "-q", "main");
  // La cartella della campagna resta fuori dai rami (come nella casa vera, dove la scrive la regista).
  scrivi(`${C}/perimetro.json`, JSON.stringify({ casa: "macchina", profilo: "tutto", lavorabili: [] }));
  scrivi(`${C}/sessioni.json`, JSON.stringify({ sessioni: { R01: { onda: 1, ramo: "rip-r01" }, R02: { onda: 1, ramo: "rip-r02" } } }));
  const finisci = () => {
    g("checkout", "-q", "rip-r01");
    scrivi(".riparazione/referto-R01.json", JSON.stringify({ sessione: "R01", finita: true, voci: [{ id: "R01-001", esito: "riparato" }] }));
    g("commit", "-qam", "referto finito"); g("push", "-q", "origin", "rip-r01"); g("checkout", "-q", "main");
  };
  const noti = (...righe) => scrivi(`${C}/rossi-noti.txt`, ["# segnali già visti", ...righe].join("\n") + "\n");
  const attendi = () => spawnSync("bash", [join(radice, "cervello/riparazione/sorveglia.sh"), "--attendi", C, "1"], { cwd: radice, env, encoding: "utf8", timeout: 30000 });
  const prog = (...a) => spawnSync(process.execPath, [join(radice, "cervello/riparazione-sessioni.mjs"), ...a, "--cartella", join(radice, C), "--radice", radice], { cwd: radice, env, encoding: "utf8" });
  return { t, radice, scrivi, finisci, noti, attendi, prog };
}

test("AR-1180 · senza cambiamenti --attendi resta zitta per tre intervalli e esce solo al battito (4)", () => {
  const { t, noti, attendi } = casaFinta();
  try {
    noti("ramo R01 rip-r01");
    const inizio = Date.now();
    const r = attendi();
    assert.equal(r.status, 4, r.stdout + r.stderr);
    assert.ok(Date.now() - inizio >= 3000, "è rimasta sveglia almeno tre intervalli");
    assert.match(r.stdout, /💓 battito/);
    assert.doesNotMatch(r.stdout, /🔔|finita|ramo R01/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · un referto finito sveglia la regista entro un intervallo (uscita 1, e dice chi)", () => {
  const { t, noti, finisci, attendi } = casaFinta();
  try {
    noti("ramo R01 rip-r01");
    finisci();
    const r = attendi();
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /^finita R01$/m);
    assert.match(r.stdout, /rossi-noti\.txt/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · se il remoto non risponde --attendi si dice cieca (uscita 2), non zitta fino al battito", () => {
  const { t, radice, noti, attendi } = casaFinta();
  try {
    noti("ramo R01 rip-r01");
    execFileSync("git", ["-C", radice, "remote", "set-url", "origin", join(t, "non-c-e.git")]);
    const r = attendi();
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /cieca: il remoto non risponde/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · un rosso già noto non sveglia nessuno", () => {
  const { t, noti, finisci, attendi } = casaFinta();
  try {
    noti("ramo R01 rip-r01", "finita R01");
    finisci();
    const r = attendi();
    assert.equal(r.status, 4, r.stdout + r.stderr);
    assert.doesNotMatch(r.stdout, /🔔/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · da stato-sessioni.json: figlia in attesa, spesa oltre il 70% e quota in avviso sono segnali nuovi", () => {
  const { t, scrivi, noti, prog } = casaFinta();
  try {
    noti("ramo R01 rip-r01");
    scrivi(`${C}/stato-sessioni.json`, JSON.stringify({ aggiornato: "2026-11-15 07:00", spesa_usd: 75, quota: { status: "allowed_warning", isUsingOverage: false }, sessioni: { R02: { stato: "REQUIRES_ACTION" } } }));
    scrivi(`${C}/preventivo.json`, JSON.stringify({ stima_usd: 100 }));
    const r = prog("segnali");
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.deepEqual(r.stdout.trim().split("\n"), ["attesa R02", "spesa oltre il 70% del preventivo", "quota allowed_warning"]);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · un ramo fermo da più di 20 minuti è un segnale con la sua testa: si muove e torna nuovo", () => {
  const ora = Date.parse("2026-11-15T07:00:00Z");
  const s = (sha, minuti) => [{ nome: "R03", ramo: "r3", sulRemoto: true, finita: false, testa: { sha, quando: ora - minuti * 60000 } }];
  assert.deepEqual(segnaliDa({ sessioni: s("aaaaaaa111", 10), ora }), ["ramo R03 r3"]);
  assert.deepEqual(segnaliDa({ sessioni: s("aaaaaaa111", 25), ora }), ["ramo R03 r3", "ferma R03 aaaaaaa"]);
  const noti = "ramo R03 r3\nferma R03 aaaaaaa\n";
  assert.deepEqual(nuoviSegnali(segnaliDa({ sessioni: s("aaaaaaa111", 25), ora }), noti), []);
  assert.deepEqual(nuoviSegnali(segnaliDa({ sessioni: s("bbbbbbb222", 30), ora }), noti), ["ferma R03 bbbbbbb"]);
});

test("AR-1180 · stato non supera mai 40 righe, anche con 30 sessioni e 60 segnali nuovi", () => {
  const sessioni = Array.from({ length: 30 }, (_, i) => ({ nome: `${i % 3 === 0 ? "K" : "R"}${String(i + 1).padStart(2, "0")}`, tipo: i % 3 === 0 ? "K" : "R", finita: i % 2 === 0 }));
  const nuovi = Array.from({ length: 60 }, (_, i) => `ferma R${i} abcdef${i}`);
  const righe = testoStato({ campagna: "prova", ora: "2026-11-15 07:00", sessioni, nuovi, esiti: { riparato: 12, parziale: 3 } });
  assert.ok(righe.length <= RIGHE_STATO, `${righe.length} righe`);
  assert.equal(RIGHE_STATO, 40);
  assert.match(righe.at(-1), /^prossima azione:/);
  assert.match(righe.join("\n"), /e altre \d+ righe/);
});

test("AR-1180 · stato sulla casa finta: figlie, esiti e prossima azione in poche righe", () => {
  const { t, noti, prog } = casaFinta();
  try {
    noti("ramo R01 rip-r01");
    const r = prog("stato");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const righe = r.stdout.trim().split("\n");
    assert.ok(righe.length <= 40);
    assert.match(r.stdout, /riparatori: 2 in lavoro \(R01 R02\), 0 finiti/);
    assert.match(r.stdout, /esiti nei referti: riparato 1/);
    assert.match(r.stdout, /segnali nuovi: nessuno/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});
