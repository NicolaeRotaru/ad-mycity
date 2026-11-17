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
// La campagna del 12/11 FERMA a main del 16/11 (#968, 13fe89c): queste prove parlano dei collaudi veri di quei giorni.
// Prima leggevano la cartella viva, e il 17/11 lo stato dell'onda 4 (referti R27-R29 con la verifica rossa, K14 che dà
// il giudizio pieno a R16-014/015/016) le ha fatte diventare rosse senza che le regole di applica fossero cambiate.
// La copia si prende da git: se il commit manca (clone superficiale), la prova cade e lo dice, non salta.
const CAMPAGNA_FERMA = "13fe89c0a4ad16fe05dd9a08e604361b454343ce";
const CAMPAGNA = mkdtempSync(join(tmpdir(), "campagna-12-11-ferma-"));
// Si cancella solo una cartella temporanea: se qualcuno rimette qui il percorso vivo, la campagna vera non sparisce.
process.on("exit", () => { if (CAMPAGNA.startsWith(join(tmpdir(), "campagna-12-11-ferma-"))) rmSync(CAMPAGNA, { recursive: true, force: true }); });
{
  const tar = spawnSync("git", ["archive", "--format=tar", `${CAMPAGNA_FERMA}:consegne/riparazioni/2026-11-12-sito-tutto`], { cwd: RADICE, maxBuffer: 1 << 30 });
  if (tar.status !== 0) throw new Error(`la campagna ferma (${CAMPAGNA_FERMA}) non c'è in git: ${tar.stderr}`);
  const x = spawnSync("tar", ["-x", "-C", CAMPAGNA], { input: tar.stdout });
  if (x.status !== 0) throw new Error(`tar non ha estratto la campagna ferma: ${x.stderr}`);
}
const K10_VERO = join(dirname(fileURLToPath(import.meta.url)), "campagna-12-11-K10.json");
const GIA_CHIUSE = ["R08-010", "R08-018", "R08-020", "R08-023", "R16-014", "R16-015", "R16-016"];
const CHIUDE_K10 = ["R07-010", "R07-014", "R07-017", "R15-014", "R18-009", "R18-018", "R18-020"];
function applicaSulla12_11(conK10) {
  const t = mkdtempSync(join(tmpdir(), "campagna-12-11-"));
  try {
    const C = join(t, "campagna");
    spawnSync("cp", ["-r", CAMPAGNA, C]);
    // Dal 15/11 K10 sta anche nella cartella vera della campagna: «senza K10» lo toglie dalla copia.
    if (conK10) writeFileSync(join(C, "collaudi/K10.json"), readFileSync(K10_VERO));
    else rmSync(join(C, "collaudi/K10.json"), { force: true });
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

// ── AR-1184 · la regola dei 40 anche in applica e pronte, dall'onda scritta nel piano ────────────────────────────────
// Nicola, carta #256 risposta 5a (15/11 23:35): la strada «a». Il caso vero: K08 ha guardato a campione R15 e R16 (19 e
// 21 voci, onda 2). valida-collaudo dà 6 rossi, ma applica chiudeva lo stesso R16-014, R16-015 e R16-016.
const K08_SU_R16 = ["R16-014", "R16-015", "R16-016"];
/** Copia la campagna vera, mette (o toglie: undefined) il campo nel piano della copia, lancia il comando. */
function sulla12_11ConCampo(campo, comando = "applica") {
  const t = mkdtempSync(join(tmpdir(), "campagna-12-11-campo-"));
  try {
    const C = join(t, "campagna");
    spawnSync("cp", ["-r", CAMPAGNA, C]);
    writeFileSync(join(C, "collaudi/K10.json"), readFileSync(K10_VERO));
    const p = JSON.parse(readFileSync(join(C, "piano.json"), "utf8"));
    // La regista dell'onda 3 scriverà il campo nel piano vero: la prova lo decide da sé, sulla copia.
    if (campo === undefined) delete p.campione_fino_a_40_dall_onda;
    else p.campione_fino_a_40_dall_onda = campo;
    writeFileSync(join(C, "piano.json"), JSON.stringify(p));
    const r = spawnSync(process.execPath, [PROGRAMMA, comando, "--cartella", C], { encoding: "utf8", cwd: RADICE });
    const leggi = (rel) => { try { return readFileSync(join(C, rel), "utf8"); } catch { return null; } };
    const dec = (() => { try { return JSON.parse(leggi("decisioni.json")).decisioni; } catch { return []; } })();
    return { r, dec, aDaRicollaudare: leggi("pronte/A-da-ricollaudare.txt") ?? "" };
  } finally { rmSync(t, { recursive: true, force: true }); }
}
const chiaveDiVoce = (id) => {
  const p = JSON.parse(readFileSync(join(CAMPAGNA, "piano.json"), "utf8"));
  for (const o of p.onde) for (const s of Object.values(o.sessioni)) { const v = s.voci.find((x) => x.id === id); if (v) return v.chiave; }
  return null;
};

test("AR-1184 · applica dall'onda del campo: K08 a campione su R16 (21 voci) non chiude R16-014, -015, -016", () => {
  const { r, dec } = sulla12_11ConCampo(2);
  assert.notEqual(r.status, 1, r.stdout.slice(-3000));
  assert.notEqual(r.status, 2, r.stdout.slice(-3000));
  assert.ok(dec.length > 0, "applica non ha scritto decisioni.json");
  for (const id of K08_SU_R16) {
    const d = dec.find((x) => x.id === id);
    assert.equal(d?.decisione, "resta_aperta", `${id}: ${d?.decisione} (${d?.come ?? d?.perche})`);
    assert.match(d.perche, /in un lotto di 21 voci il campione non esiste/);
  }
  // Le voci di R16 col giudizio pieno si chiudono lo stesso: la regola tocca solo il campione.
  assert.equal(dec.find((x) => x.id === "R16-005")?.decisione, "si_chiude");
});

test("AR-1184 · sotto il campo, o senza il campo, applica resta com'era: la campagna del 12/11 non riapre niente", () => {
  const senza = sulla12_11ConCampo(undefined);
  const sopra = sulla12_11ConCampo(3);
  for (const { r, dec } of [senza, sopra]) {
    assert.notEqual(r.status, 1, r.stdout.slice(-3000));
    for (const id of K08_SU_R16) assert.equal(dec.find((x) => x.id === id)?.decisione, "si_chiude", `${id}: ${dec.find((x) => x.id === id)?.perche}`);
  }
  const chiuse = (dec) => dec.filter((x) => x.decisione === "si_chiude").map((x) => x.id).sort();
  assert.deepEqual(chiuse(sopra.dec), chiuse(senza.dec), "un campo sopra l'onda 2 non cambia nessuna decisione");
  // Con il campo all'onda 2 cambiano solo minori chiusi a campione in lotti fino a 40 voci, R16-014/015/016 compresi.
  const due = chiuse(sulla12_11ConCampo(2).dec);
  const riaperte = chiuse(senza.dec).filter((id) => !due.includes(id));
  for (const id of K08_SU_R16) assert.ok(riaperte.includes(id), `${id} non è fra quelle che la regola tiene aperte`);
  for (const id of riaperte) assert.equal(senza.dec.find((x) => x.id === id).come, "campione", `${id} era chiusa col giudizio pieno, non col campione`);
  assert.equal(due.length + riaperte.length, chiuse(senza.dec).length, "il campo ha chiuso una voce in più");
});

test("AR-1184 · pronte dall'onda del campo manda R16-014, -015, -016 a ricollaudare (elenco A); senza il campo no", () => {
  const chiavi = K08_SU_R16.map(chiaveDiVoce);
  assert.ok(chiavi.every(Boolean), "le tre voci non sono più nel piano della campagna");
  const con = sulla12_11ConCampo(2, "pronte").aDaRicollaudare.split("\n");
  const senza = sulla12_11ConCampo(undefined, "pronte").aDaRicollaudare.split("\n");
  for (const k of chiavi) {
    assert.ok(con.includes(k), `con il campo, «${k}» manca dall'elenco A`);
    assert.ok(!senza.includes(k), `senza il campo, «${k}» è finita nell'elenco A`);
  }
});

test("AR-1184 · il campo si legge come un numero d'onda; un valore storto ferma (cieco), non spegne la regola in silenzio", async () => {
  const { campioneFinoA40DallOnda } = await import("../riparazione-sessioni.mjs");
  assert.equal(campioneFinoA40DallOnda({}), null);
  assert.equal(campioneFinoA40DallOnda({ campione_fino_a_40_dall_onda: 3 }), 3);
  for (const storto of ["3", 0, -1, 2.5, true]) assert.throws(() => campioneFinoA40DallOnda({ campione_fino_a_40_dall_onda: storto }), /numero dell'onda/);
  // In decidi la regola vale dall'onda del campo in su, e non sotto.
  const conCampione = { ...K07, voci: VOCI.map((v, i) => giudizio(v, i === 0 ? PIENO : {})) };
  const d = (misuraDallOnda) => decidi({ piano, referti: { R18: REFERTO }, collaudi: [conCampione], hub: new Set(), misuraDallOnda })[1];
  assert.match(d(1).perche, /il campione non esiste/);
  assert.doesNotMatch(d(2).perche, /il campione non esiste/);
  assert.doesNotMatch(d(null).perche, /il campione non esiste/);
  const { r } = sulla12_11ConCampo("2");
  assert.equal(r.status, 2, r.stdout.slice(-2000));
  assert.match(r.stdout, /campione_fino_a_40_dall_onda "2": serve il numero dell'onda/);
});
