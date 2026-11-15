// I conti che arrivavano tardi (officina minima del 15/11, pezzo 5):
//  · applica è rosso se sessioni.json dà un collaudatore per finito e il suo collaudo dice ancora finita:false
//    (K08.json fermo dal 13/11 16:50 mentre K08 terzo aveva finito il 14/11 alle 09:38: 18 voci senza collaudo);
//  · conti è rosso se una PR dell'onda è unita e il registro non è scritto (la mycity#290, unita il 15/11 alle 03:07);
//  · conti --preventivo fa la stima solo da misure.json: l'onda 2 era stimata 376 $ con 1,45 $ a voce, reale ~1.627 $.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { kFinitiMaAperti, prUniteSenzaRegistro, preventivoDa } from "../riparazione-sessioni.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const PROGRAMMA = join(QUI, "..", "riparazione-sessioni.mjs");
const MISURE = JSON.parse(readFileSync(join(QUI, "..", "riparazione", "misure.json"), "utf8"));

function campagna() {
  const t = mkdtempSync(join(tmpdir(), "conti-"));
  const C = join(t, "consegne/riparazioni/2026-11-15-prova");
  const scrivi = (p, x) => { mkdirSync(dirname(join(C, p)), { recursive: true }); writeFileSync(join(C, p), typeof x === "string" ? x : JSON.stringify(x)); };
  scrivi("perimetro.json", { casa: "macchina", profilo: "tutto", lavorabili: [{ chiave: "AR-1", file: ["cervello/a.mjs"] }] });
  scrivi("piano.json", { casa: "macchina", onde: [{ onda: 1, candidate: ["AR-1"], sessioni: { R01: { voci: [{ id: "R01-001", chiave: "AR-1", gravita: "minore", file: ["cervello/a.mjs"] }], file: ["cervello/a.mjs"] } } }], cucitura: [], eccedenza: [] });
  const registro = join(t, "registro.json");
  writeFileSync(registro, JSON.stringify({ difetti: [{ id: "AR-1", stato: "aperto" }] }));
  const lancia = (...a) => spawnSync(process.execPath, [PROGRAMMA, ...a, "--cartella", C, "--radice", t, "--registro", registro], { encoding: "utf8" });
  return { t, C, scrivi, registro, lancia };
}

test("AR-1180 · kFinitiMaAperti: il giro dopo («K08 terzo», finito con una data) col collaudo ancora finita:false", () => {
  const sess = { collaudatori: { K08: { ramo: "k08" }, K05: { finita: true } }, giro: { k08_terzo: { titolo: "K08 terzo", finita: "2026-11-14 09:38" }, r17: { titolo: "R17 secondo", finita: "fermo al tetto" } } };
  assert.deepEqual(kFinitiMaAperti(sess, { K08: { finita: false }, K05: { finita: false } }), ["K05", "K08"]);
  assert.deepEqual(kFinitiMaAperti(sess, { K08: { finita: true }, K05: { finita: true } }), []);
  assert.deepEqual(kFinitiMaAperti({ collaudatori: { K09: { finita: "fermo al tetto" } } }, { K09: { finita: false } }), [], "«fermo al tetto» non è finito");
});

test("AR-1180 · applica esce 1 quando sessioni.json dice K01 finito e collaudi/K01.json no", () => {
  const { t, scrivi, lancia } = campagna();
  try {
    scrivi("referti/R01.json", { sessione: "R01", aggiornato: "2026-11-15 06:00", finita: true, voci: [] });
    scrivi("collaudi/K01.json", { collaudatore: "K01", riparatori: ["R01"], aggiornato: "2026-11-15 06:00", finita: false, voci: [] });
    scrivi("sessioni.json", { sessioni: { R01: { onda: 1, ramo: "r1" } }, collaudatori: { K01: { ramo: "k1", finita: "2026-11-15 05:40" } } });
    const r = lancia("applica");
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /collaudi\/K01\.json: sessioni\.json dice che K01 ha finito, ma il collaudo ha ancora finita:false/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · conti: la PR dell'onda unita e il registro non scritto è rosso; scritto il registro, il rosso se ne va", () => {
  const { t, scrivi, registro, lancia } = campagna();
  try {
    const repo = join(t, "sito");
    const env = { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
    const g = (...a) => execFileSync("git", ["-C", repo, ...a], { env }).toString().trim();
    mkdirSync(repo); g("init", "-q", "-b", "main"); writeFileSync(join(repo, "a"), "1"); g("add", "-A"); g("commit", "-qm", "unione della #290");
    const testa = g("rev-parse", "HEAD");
    g("update-ref", "refs/remotes/origin/main", testa);
    scrivi("sessioni.json", { sessioni: { R01: { onda: 1, ramo: "r1" } }, pr_sito_onda1: { numero: 290, testa: testa.slice(0, 8) } });
    let r = lancia("conti", "--git", repo);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /#290 unita, onda 1 non scritta nel registro/);
    writeFileSync(registro, JSON.stringify({ difetti: [{ id: "AR-1", stato: "aperto", riparazione_15_11: { esito: "riparato", sessione: "R01" } }] }));
    r = lancia("conti", "--git", repo);
    assert.doesNotMatch(r.stdout, /#290 unita/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · prUniteSenzaRegistro: una PR non unita non è rossa, e se non lo so è un'attesa", () => {
  const sess = { pr_sito_onda2: { numero: 300, testa: "abc12345" } };
  const piano = { onde: [{}, { sessioni: { R13: {} } }] };
  assert.deepEqual(prUniteSenzaRegistro({ sess, piano, elenco: [], unita: () => false }).rossi, []);
  assert.match(prUniteSenzaRegistro({ sess, piano, elenco: [], unita: () => null }).attese.join(""), /non so se è unita/);
  assert.match(prUniteSenzaRegistro({ sess, piano, elenco: [], unita: () => true }).rossi.join(""), /#300 unita, onda 2/);
});

test("AR-1180 · preventivo: 259 voci con le misure dell'onda 2 fanno almeno 1.600 $, mai 1,45 $ a voce", () => {
  const p = preventivoDa(MISURE, 259);
  assert.ok(p.stima_usd >= 1600, `stima ${p.stima_usd}`);
  assert.ok(p.per_voce_usd > 6, `per voce ${p.per_voce_usd}`);
  assert.notEqual(Math.round(p.stima_usd / 259 * 100) / 100, 1.45);
  assert.ok(p.tetto_usd > p.stima_usd && p.massimo_usd >= p.stima_usd);
  assert.equal(Math.round(p.quote_usd.collaudo / p.stima_usd * 100), 15);
  assert.equal(preventivoDa(null, 259), null, "senza misure niente preventivo");
});

test("AR-1180 · conti --preventivo: senza misure.json esce 2; con le misure scrive preventivo.json e REGIA.md, ed è rosso al 70%", () => {
  const { t, C, scrivi, lancia } = campagna();
  try {
    assert.equal(lancia("conti", "--preventivo", "--voci", "259", "--misure", join(t, "non-c-e.json")).status, 2);
    const fileMisure = join(QUI, "..", "riparazione", "misure.json");
    let r = lancia("conti", "--preventivo", "--voci", "259", "--misure", fileMisure);
    assert.equal(r.status, 3, r.stdout + r.stderr);
    const p = JSON.parse(readFileSync(join(C, "preventivo.json"), "utf8"));
    assert.ok(p.stima_usd >= 1600);
    assert.match(readFileSync(join(C, "REGIA.md"), "utf8"), /preventivo \(conti --preventivo\): 259 voci/);
    scrivi("stato-sessioni.json", { spesa_usd: Math.ceil(p.stima_usd * 0.75) });
    r = lancia("conti", "--preventivo", "--voci", "259", "--misure", fileMisure);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /oltre il 70% della stima/);
    scrivi("stato-sessioni.json", { spesa_usd: Math.ceil(p.stima_usd * 1.01) });
    assert.match(lancia("conti", "--preventivo", "--voci", "259", "--misure", fileMisure).stdout, /oltre il 100% della stima/);
  } finally { rmSync(t, { recursive: true, force: true }); }
});
