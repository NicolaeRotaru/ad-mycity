// AR-1180 · I collaudi guardati insieme (officina minima del 15/11, aggiunte dell'AD dopo il collaudo K10):
//  (a) il giudizio pieno si guarda sull'UNIONE dei collaudi finiti. Il caso vero: K07 aveva un campione rosso su R18;
//      K10 ha poi giudicato in pieno R18-009, R18-018 e R18-020, tutte «regge» con rimessa 0, e applica le teneva
//      aperte perché guardava ogni collaudo da solo. Un giudizio non pieno non batte mai un pieno; fra due pieni
//      vince il peggiore; i gravi restano come sono.
//  (b) un collaudo può dichiararsi parziale («parziale: true»): valida-collaudo guarda solo le voci che elenca, le
//      altre restano senza collaudo, e un collaudo parziale non dichiara un campione accettato. K10 aveva dovuto
//      ricopiare 79 righe da K02, K07 e K08 solo per passare.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { decidi, regoleCollaudo, pieniAltrove, fileHub } from "../riparazione-sessioni.mjs";

const PROGRAMMA = join(dirname(fileURLToPath(import.meta.url)), "..", "riparazione-sessioni.mjs");
const SHA = "abcdef1234567";
const VOCI = ["R18-009", "R18-018", "R18-020"].map((id, i) => ({ id, chiave: `AR-${900 + i}`, gravita: "minore", file: [`cervello/m${i}.mjs`] }));
const riparata = (v, i) => ({ id: v.id, chiave: v.chiave, esito: "riparato", commit: `abcdef${i}234567`, file_toccati: v.file, prova_comando: "node --test cervello/test/x.test.mjs", prova_tipo: "comando", prova_eseguita: true,
  rimessa: { esito: "regge", uscita: 0, comando: "node cervello/prova-rimessa.mjs" }, copre_tutta_la_voce: true, verificato_da: "prova-rimessa" });
const REFERTO = { sessione: "R18", aggiornato: "2026-11-14 10:00", finita: true, testa: SHA, verifica: { esito: "verde", testa: SHA }, voci: VOCI.map(riparata) };
const giudizio = (v, extra = {}) => ({ id: v.id, chiave: v.chiave, verdetto: "regge", giudizio: "nessuno", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs --file x" }, ...extra });
const PIENO = { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"] };
const K07 = { collaudatore: "K07", riparatori: ["R18"], aggiornato: "2026-11-14 11:00", finita: true, voci: VOCI.map((v) => giudizio(v)) };
const K10 = { collaudatore: "K10", riparatori: ["R18"], aggiornato: "2026-11-15 06:00", finita: true, voci: VOCI.map((v) => giudizio(v, PIENO)) };
const piano = { onde: [{ onda: 1, sessioni: { R18: { voci: VOCI, file: VOCI.flatMap((v) => v.file) } } }] };

test("AR-1180 · (a) applica: il pieno di K10 chiude le tre voci di R18 anche col collaudo di K07 senza giudizio", () => {
  const t = mkdtempSync(join(tmpdir(), "insieme-"));
  try {
    const C = join(t, "consegne/riparazioni/2026-11-15-prova");
    const scrivi = (p, x) => { mkdirSync(dirname(join(C, p)), { recursive: true }); writeFileSync(join(C, p), JSON.stringify(x)); };
    scrivi("perimetro.json", { casa: "macchina", profilo: "tutto", lavorabili: VOCI.map((v) => ({ chiave: v.chiave, file: v.file })) });
    scrivi("piano.json", { casa: "macchina", ...piano, cucitura: [], eccedenza: [] });
    scrivi("referti/R18.json", REFERTO);
    scrivi("collaudi/K07.json", K07);
    scrivi("collaudi/K10.json", K10);
    const registro = join(t, "registro.json");
    writeFileSync(registro, JSON.stringify({ difetti: VOCI.map((v) => ({ id: v.chiave, stato: "aperto" })) }));
    const r = spawnSync(process.execPath, [PROGRAMMA, "applica", "--cartella", C, "--radice", t, "--registro", registro], { encoding: "utf8" });
    assert.notEqual(r.status, 1, r.stdout + r.stderr);
    const dec = JSON.parse(readFileSync(join(C, "decisioni.json"), "utf8")).decisioni;
    for (const v of VOCI) {
      const d = dec.find((x) => x.id === v.id);
      assert.equal(d.decisione, "si_chiude", `${v.id}: ${d.perche}`);
      assert.match(d.come, /collaudo pieno/);
      assert.equal(d.collaudatore, "K10");
    }
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · (a) valida-collaudo di K07: il minore senza pieno non è rosso se ha un pieno in un altro collaudo finito", () => {
  const ctx = (altrui) => ({ nome: "K07", riparatori: { R18: { voci: VOCI, referto: REFERTO } }, hub: new Set(), altrui, misura: true });
  assert.match(regoleCollaudo(JSON.stringify(K07), ctx(new Map())).rossi.join("\n"), /R18-009: minore riparato senza giudizio pieno/);
  assert.deepEqual(regoleCollaudo(JSON.stringify(K07), ctx(pieniAltrove([K07, K10], "K07"))).rossi, []);
  assert.equal(pieniAltrove([K07, { ...K10, finita: false }], "K07").size, 0, "un collaudo non finito non presta il suo pieno");
});

test("AR-1180 · (a) decidi: un non pieno non batte mai un pieno; fra due pieni vince il peggiore; i gravi restano come sono", () => {
  const nonReggeSenzaPieno = { ...K07, voci: VOCI.map((v) => giudizio(v, { verdetto: "non_regge" })) };
  const d = decidi({ piano, referti: { R18: REFERTO }, collaudi: [nonReggeSenzaPieno, K10], hub: new Set() });
  assert.deepEqual(d.map((x) => x.decisione), ["si_chiude", "si_chiude", "si_chiude"]);
  const pienoRotto = { ...K07, voci: VOCI.map((v) => giudizio(v, { ...PIENO, verdetto: "rompe_altro" })) };
  assert.deepEqual(decidi({ piano, referti: { R18: REFERTO }, collaudi: [K10, pienoRotto], hub: new Set() }).map((x) => x.decisione), ["resta_aperta", "resta_aperta", "resta_aperta"]);
  const gravi = { onde: [{ onda: 1, sessioni: { R18: { voci: VOCI.map((v) => ({ ...v, gravita: "grave" })) } } }] };
  assert.equal(decidi({ piano: gravi, referti: { R18: REFERTO }, collaudi: [K07], hub: new Set() })[0].decisione, "resta_aperta", "un grave senza pieno resta aperto");
});

test("AR-1180 · (b) un collaudo parziale guarda solo le voci che elenca, e non dichiara un campione accettato", () => {
  const ctx = { nome: "K10", riparatori: { R18: { voci: VOCI, referto: REFERTO } }, hub: new Set() };
  const solo = { ...K10, voci: [K10.voci[0]] };
  assert.match(regoleCollaudo(JSON.stringify(solo), ctx).rossi.join("\n"), /R18-018: riparato nel referto di R18, manca nel collaudo/);
  assert.deepEqual(regoleCollaudo(JSON.stringify({ ...solo, parziale: true }), ctx).rossi, []);
  assert.match(regoleCollaudo(JSON.stringify({ ...solo, parziale: true, campione: { R18: { accettato: true } } }), ctx).rossi.join("\n"), /un collaudo parziale non dichiara un campione accettato/);
  const d = decidi({ piano, referti: { R18: REFERTO }, collaudi: [{ ...solo, parziale: true }], hub: new Set() });
  assert.deepEqual(d.map((x) => x.decisione), ["si_chiude", "resta_aperta", "resta_aperta"]);
  assert.equal(d[1].perche, "nessun collaudo", "una voce che il collaudo parziale non elenca non si chiude da sola");
});

// ── Collaudo dell'officina minima (15/11): un bloccante e due minori ─────────────────────────────────────────────
const RADICE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CAMPAGNA = join(RADICE, "consegne/riparazioni/2026-11-12-sito-tutto");
const K10_VERO = join(dirname(fileURLToPath(import.meta.url)), "campagna-12-11-K10.json");
const GIA_CHIUSE = ["R08-010", "R08-018", "R08-020", "R08-023", "R16-014", "R16-015", "R16-016"];
const CHIUDE_K10 = ["R07-010", "R07-014", "R07-017", "R15-014", "R18-009", "R18-018", "R18-020"];
function applicaSulla12_11(conK10) {
  const t = mkdtempSync(join(tmpdir(), "campagna-12-11-"));
  try {
    const C = join(t, "campagna");
    spawnSync("cp", ["-r", CAMPAGNA, C]);
    if (conK10) writeFileSync(join(C, "collaudi/K10.json"), readFileSync(K10_VERO));
    const r = spawnSync(process.execPath, [PROGRAMMA, "applica", "--cartella", C], { encoding: "utf8", cwd: RADICE });
    let dec = [];
    try { dec = JSON.parse(readFileSync(join(C, "decisioni.json"), "utf8")).decisioni; } catch { /* applica fermo: niente decisioni */ }
    return { r, dec };
  } finally { rmSync(t, { recursive: true, force: true }); }
}

test("AR-1180 · bloccante: sui collaudi veri del 12/11 la regola dei 40 non riapre le 7 voci chiuse a campione", () => {
  const { r } = applicaSulla12_11(false);
  assert.doesNotMatch(r.stdout, /il campione non esiste/, "la regola nuova si applica a un collaudo scritto prima");
  // Senza K10 applica resta fermo per un motivo solo, vecchio e vero: il campione di K07 su R18 (è il motivo di K10).
  assert.match(r.stdout, /applica: rosso \(1 problemi\)/, r.stdout.slice(-3000));
  assert.match(r.stdout, /collaudi\/K07\.json: R18: campione troppo piccolo/);
  // Le decisioni sui collaudi veri, calcolate come le calcola applica.
  const leggi = (p) => JSON.parse(readFileSync(join(CAMPAGNA, p), "utf8"));
  const pianoVero = leggi("piano.json");
  const referti = Object.fromEntries(pianoVero.onde.flatMap((o) => Object.keys(o.sessioni)).filter((n) => { try { leggi(`referti/${n}.json`); return true; } catch { return false; } }).map((n) => [n, leggi(`referti/${n}.json`)]));
  const collaudi = ["K01", "K02", "K03", "K04", "K05", "K06", "K07", "K08", "K09"].map((k) => leggi(`collaudi/${k}.json`));
  const dec = decidi({ piano: pianoVero, referti, collaudi, hub: fileHub(leggi("perimetro.json").lavorabili ?? []) });
  for (const id of GIA_CHIUSE) assert.equal(dec.find((d) => d.id === id)?.decisione, "si_chiude", `${id}: ${dec.find((d) => d.id === id)?.perche}`);
});

test("AR-1180 · bloccante: con K10 dentro applica non si ferma, e le 7 chiusure di K10 passano", () => {
  const { r, dec } = applicaSulla12_11(true);
  assert.doesNotMatch(r.stdout, /il campione non esiste/);
  assert.notEqual(r.status, 1, r.stdout.slice(-3000));
  for (const id of [...CHIUDE_K10, ...GIA_CHIUSE]) assert.equal(dec.find((d) => d.id === id)?.decisione, "si_chiude", `${id}: ${dec.find((d) => d.id === id)?.perche}`);
});

test("AR-1180 · bloccante: la regola dei 40 resta per i collaudi nuovi (valida-collaudo, decidi con misura)", () => {
  const ctx = { nome: "K07", riparatori: { R18: { voci: VOCI, referto: REFERTO } }, hub: new Set(), altrui: new Map() };
  assert.match(regoleCollaudo(JSON.stringify(K07), { ...ctx, misura: true }).rossi.join("\n"), /R18-009: minore riparato senza giudizio pieno: in un lotto di 3 voci/);
  assert.doesNotMatch(regoleCollaudo(JSON.stringify(K07), ctx).rossi.join("\n"), /il campione non esiste/);
  const conCampione = { ...K07, voci: VOCI.map((v, i) => giudizio(v, i === 0 ? PIENO : {})) };
  assert.match(decidi({ piano, referti: { R18: REFERTO }, collaudi: [conCampione], hub: new Set(), misura: true })[1].perche, /il campione non esiste/);
});

test("AR-1180 · minore 4: un «rompe_altro» senza pieno battuto da un «regge» pieno resta come avviso, in qualunque ordine", () => {
  const rotto = { ...K07, voci: VOCI.map((v) => giudizio(v, { verdetto: "rompe_altro" })) };
  for (const ordine of [[rotto, K10], [K10, rotto]]) {
    const d = decidi({ piano, referti: { R18: REFERTO }, collaudi: ordine, hub: new Set() });
    assert.deepEqual(d.map((x) => x.decisione), ["si_chiude", "si_chiude", "si_chiude"]);
    for (const x of d) assert.match(x.avviso ?? "", /K07 dice «rompe_altro» senza giudizio pieno/);
  }
  assert.equal(decidi({ piano, referti: { R18: REFERTO }, collaudi: [K07, K10], hub: new Set() })[0].avviso, undefined, "due «regge» non fanno avviso");
  // E applica lo stampa.
  const t = mkdtempSync(join(tmpdir(), "avviso-"));
  try {
    const C = join(t, "consegne/riparazioni/2026-11-15-prova");
    const scrivi = (p, x) => { mkdirSync(dirname(join(C, p)), { recursive: true }); writeFileSync(join(C, p), JSON.stringify(x)); };
    scrivi("perimetro.json", { casa: "macchina", profilo: "tutto", lavorabili: VOCI.map((v) => ({ chiave: v.chiave, file: v.file })) });
    scrivi("piano.json", { casa: "macchina", ...piano, cucitura: [], eccedenza: [] });
    scrivi("referti/R18.json", REFERTO);
    scrivi("collaudi/K07.json", rotto);
    scrivi("collaudi/K10.json", K10);
    const registro = join(t, "registro.json");
    writeFileSync(registro, JSON.stringify({ difetti: VOCI.map((v) => ({ id: v.chiave, stato: "aperto" })) }));
    const r = spawnSync(process.execPath, [PROGRAMMA, "applica", "--cartella", C, "--radice", t, "--registro", registro], { encoding: "utf8" });
    assert.match(r.stdout, /⚠️ {2}R18-009: K07 dice «rompe_altro» senza giudizio pieno; vince il «regge» pieno di K10/);
    assert.equal(JSON.parse(readFileSync(join(C, "decisioni.json"), "utf8")).avvisi.length, 3);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test("AR-1180 · minore 5: un collaudo non finito non presta il suo giudizio pieno a decidi (né a pronte)", () => {
  const nonFinito = { ...K10, finita: false };
  const d = decidi({ piano, referti: { R18: REFERTO }, collaudi: [K07, nonFinito], hub: new Set() });
  assert.deepEqual(d.map((x) => x.decisione), ["resta_aperta", "resta_aperta", "resta_aperta"], d.map((x) => x.perche).join(" | "));
  assert.deepEqual(decidi({ piano, referti: { R18: REFERTO }, collaudi: [nonFinito], hub: new Set() }).map((x) => x.decisione), ["resta_aperta", "resta_aperta", "resta_aperta"]);
  assert.deepEqual(decidi({ piano, referti: { R18: REFERTO }, collaudi: [K07, K10], hub: new Set() }).map((x) => x.decisione), ["si_chiude", "si_chiude", "si_chiude"], "finito, il pieno chiude");
});
