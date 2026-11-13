// La prova del programma della riparazione in sessioni (cervello/riparazione-sessioni.mjs).
//
// Ogni caso sbagliato qui sotto è un modo VERO in cui una campagna passata ha mentito o si è rotta: i file
// toccati fuori territorio del 5/11 (99 nel replay), i file temporanei nei rami, le prove vecchie riscritte
// da chi non ne possedeva il codice, le schede indicate per indice, le riparazioni senza una prova che
// torni rossa, il campione di collaudo dichiarato buono quando non lo era. Ogni caso giusto è il lavoro di
// tutti i giorni, che il programma non deve fermare. I casi di git girano su un deposito finto in una
// cartella temporanea: mai sui rami veri (scorciatoia #35).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, existsSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { symlinkSync } from "node:fs";
import {
  fileDaCampoSito, fileDaSchedaMacchina, assegnaOnda, controllaOnda, giudicaPercorso, importDi, percorsiNominati,
  regoleReferto, regoleCollaudo, campioneDi, decidi, chiaviDoppie, classifica, CONDIVISI_MACCHINA, RE_SPENTA, contaAsserzioni,
} from "../riparazione-sessioni.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const PROGRAMMA = join(QUI, "..", "riparazione-sessioni.mjs");

// ── i file di una voce ─────────────────────────────────────────────────────────────────────────────
test("il campo file del sito: i percorsi si cercano anche dentro la prosa, il privato e Vercel restano fuori", () => {
  const r = fileDaCampoSito("app/api/contact/route.ts:15-21 e :36-38 (schema con .max(120)) · produzione: profiles.store_description · Vercel → progetto mycity → variabile X · app/(shop)/carrello/page.tsx:4 · middleware.ts:274-307 · (lib/cassa/quadratura.ts:58)");
  assert.deepEqual(r.file.sort(), ["app/(shop)/carrello/page.tsx", "app/api/contact/route.ts", "lib/cassa/quadratura.ts", "middleware.ts"]);
  assert.equal(r.privato, false);
  assert.equal(fileDaCampoSito("(nel referto privato)").privato, true);
});

test("una scheda della macchina: i nomi nudi non indirizzano, i percorsi sì", () => {
  const f = fileDaSchedaMacchina({ dove: "cervello/salute.mjs:12 e page.tsx:40", fix_proposto: "toccare pannello/src/lib/moduli.ts" });
  assert.deepEqual(f.sort(), ["cervello/salute.mjs", "pannello/src/lib/moduli.ts"]);
});

test("il perimetro: riservata, domanda, senza percorso e lavorabile sono quattro posti diversi", () => {
  const elenco = [
    { dimensione: "a", titolo: "t1", stato: "aperto", severita: "grave", file: "lib/x.ts:1" },
    { dimensione: "a", titolo: "t2", stato: "aperto", severita: "minore", file: "(nel referto privato)" },
    { dimensione: "a", titolo: "t3", stato: "aperto", severita: "minore", file: "lib/y.ts:2", domanda_per_nicola: "quanto?" },
    { dimensione: "a", titolo: "t4", stato: "aperto", severita: "minore", file: "Vercel → variabile" },
    { dimensione: "a", titolo: "t5", stato: "riparato", severita: "minore", file: "lib/z.ts:1" },
  ];
  const r = classifica("sito", elenco, {});
  assert.equal(r.aperti, 4);
  assert.deepEqual(r.lavorabili.map((v) => v.titolo), ["t1"]);
  assert.equal(r.fuori.riservate.length, 1);
  assert.equal(r.fuori.domande.length, 1);
  assert.equal(r.fuori.senza_percorso.length, 1);
});

// ── dividi ───────────────────────────────────────────────────────────────────────────────────────────
const voce = (chiave, gravita, file, dimensione = "pagamenti") => ({ chiave, gravita, file, dimensione, titolo: chiave });

test("AR-1163 · dividi: nella stessa onda un file ha un padrone solo; chi si scontra con due sessioni passa all'onda dopo", () => {
  const r = assegnaOnda([
    voce("a", "grave", ["lib/a.ts"], "x"),
    voce("b", "grave", ["lib/b.ts"], "y"),
    voce("ponte", "minore", ["lib/a.ts", "lib/b.ts"], "z"),
    voce("c", "minore", ["lib/a.ts", "tests/unit/vecchia.test.ts", "migrations/100_x.sql"], "x"),
  ], { sessioni: 2 });
  const padroni = new Map();
  for (const [n, s] of Object.entries(r.sessioni)) for (const f of s.file) { assert.ok(!padroni.has(f), `${f} ha due padroni`); padroni.set(f, n); }
  assert.deepEqual(r.rimandate, ["ponte"]);
  const c = Object.values(r.sessioni).flatMap((s) => s.voci).find((v) => v.chiave === "c");
  assert.ok(c, "la voce che cita una prova e una migrazione vecchie non viene bloccata da quei file");
  assert.ok(!padroni.has("migrations/100_x.sql") && !padroni.has("tests/unit/vecchia.test.ts"));
});

test("dividi: i gravi passano per primi e un file condiviso della macchina va alla regia", () => {
  const r = assegnaOnda([
    voce("minore1", "minore", ["lib/a.ts"]),
    voce("grave1", "grave", ["lib/a.ts"]),
    voce("registro", "grave", [CONDIVISI_MACCHINA[0]]),
  ], { sessioni: 1, perSessione: 1, vietati: new Set(CONDIVISI_MACCHINA) });
  assert.deepEqual(Object.values(r.sessioni)[0].voci.map((v) => v.chiave), ["grave1"]);
  assert.deepEqual(r.rimandate, ["minore1"]);
  assert.deepEqual(r.regia, ["registro"]);
});

test("copertura-prima: un file con due padroni, una voce in due posti, un indice e fasce sovrapposte sono rossi", () => {
  const onda = {
    onda: 1, candidate: ["k1", "k2", "k3"],
    sessioni: {
      R01: { voci: [{ id: "R01-001", chiave: "k1", file: ["lib/a.ts"] }, { id: "R01-002", chiave: "12", file: ["lib/a.ts"] }], file: ["lib/a.ts"], migrazioni: [250, 259] },
      R02: { voci: [{ id: "R02-001", chiave: "k1", file: ["lib/a.ts"] }], file: ["lib/a.ts"], migrazioni: [255, 264] },
    },
    rimandate: ["k2"], regia: [],
  };
  const rossi = controllaOnda(onda, { candidate: onda.candidate, casa: "sito", maxMigrazione: 252 }).join("\n");
  assert.match(rossi, /lib\/a\.ts ha due padroni/);
  assert.match(rossi, /«k1» sta in 2 posti/);
  assert.match(rossi, /è un indice, non una chiave/);
  assert.match(rossi, /si sovrappone/);
  assert.match(rossi, /non parte sopra l'ultima migrazione/);
  assert.match(rossi, /«k3» dell'onda non è assegnata/);
});

test("copertura-prima: un'onda pulita è verde", () => {
  const onda = {
    onda: 1, candidate: ["k1", "k2"],
    sessioni: { R01: { voci: [{ id: "R01-001", chiave: "k1", file: ["lib/a.ts", "tests/unit/x.test.ts"] }], file: ["lib/a.ts"], migrazioni: [250, 259] } },
    rimandate: ["k2"], regia: [],
  };
  assert.deepEqual(controllaOnda(onda, { candidate: onda.candidate, casa: "sito", maxMigrazione: 245 }), []);
});

// ── guardia-ramo: il giudizio su un percorso ─────────────────────────────────────────────────────────
const ctxBase = (extra = {}) => ({
  nome: "R03", casa: "sito", suoi: new Set(["lib/a.ts", ".husky/pre-commit"]), fascia: [270, 279],
  esisteAllaBase: (p) => ["lib/a.ts", "lib/altrui.ts", "tests/unit/importa.test.ts", "tests/unit/estranea.test.ts", "migrations/100_vecchia.sql", ".husky/pre-commit", CONDIVISI_MACCHINA[2]].includes(p),
  importaDaSuoi: (p) => p === "tests/unit/importa.test.ts",
  ...extra,
});

test("guardia: i percorsi ammessi passano", () => {
  const ctx = ctxBase();
  for (const p of [".riparazione/referto-R03.json", "lib/a.ts", ".husky/pre-commit", "tests/unit/riparazione-r03-cassa.test.ts", "tests/unit/importa.test.ts", "migrations/271_nuova.sql", "lib/nuovo-aiutante.ts"]) {
    assert.equal(giudicaPercorso(p, ctx), null, p);
  }
});

test("AR-1163 · guardia: i percorsi vietati si fermano, ognuno col suo perché", () => {
  const ctx = ctxBase();
  const casi = {
    "lib/altrui.ts": /altra sessione o di nessuno/,
    "tests/unit/.montati/1/x.mjs": /temporaneo/,
    ".prova-colonna-sparita/tsconfig.json": /temporaneo/,
    "tests/unit/minori-s03-x.test.ts": /porta il nome della sessione/,
    "tests/unit/estranea.test.ts": /non importa e non nomina nessuno dei file/,
    "migrations/100_vecchia.sql": /già esistente non si modifica/,
    "migrations/290_fuori.sql": /fuori dalla fascia/,
    ".riparazione/appunti.txt": /solo il proprio referto/,
    ".riparazione/referto-R04.json": /solo il proprio referto/,
  };
  for (const [p, re] of Object.entries(casi)) assert.match(String(giudicaPercorso(p, ctx)), re, p);
  assert.match(String(giudicaPercorso(CONDIVISI_MACCHINA[2], ctxBase({ casa: "macchina" }))), /scrive solo la regista/);
});

test("importDi: l'alias @/ e i relativi diventano percorsi del deposito", () => {
  const imp = importDi("tests/unit/x.test.ts", "import { a } from '@/lib/a';\nconst b = await import('../../lib/b');\nvi.mock('@/lib/c')");
  for (const p of ["lib/a.ts", "lib/b.ts", "lib/c.ts"]) assert.ok(imp.has(p), p);
});

// ── valida-referto ───────────────────────────────────────────────────────────────────────────────────
const vociScheda = [
  { id: "R03-001", chiave: "pagamenti|il payout salta", gravita: "grave" },
  { id: "R03-002", chiave: "frontend|testo sbagliato", gravita: "minore" },
];
const riparata = (extra = {}) => ({
  id: "R03-001", chiave: "pagamenti|il payout salta", esito: "riparato", commit: "abc1234", file_toccati: ["lib/a.ts"],
  prova_comando: "npx vitest run tests/unit/riparazione-r03-payout.test.ts", prova_tipo: "comando", prova_eseguita: true,
  rimessa: { esito: "regge", uscita: 0, comando: "node cervello/prova-rimessa.mjs --repo . --base abc1234^ --file lib/a.ts --prove tests/unit/riparazione-r03-payout.test.ts" },
  copre_tutta_la_voce: true, cosa_ho_fatto: "il payout aspetta il giorno giusto", verificato_da: "qa: provato a smentirla, regge", ...extra,
});
const referto = (voci, extra = {}) => JSON.stringify({
  sessione: "R03", aggiornato: "2026-11-08 10:30", finita: true, testa: "fff0000", verifica: { comando: "npm run verify", esito: "verde" },
  voci, nuovi_difetti_visti: [], ...extra,
}, null, 2);
const ctxReferto = { nome: "R03", voci: vociScheda, chiaviDelRegistro: new Set(vociScheda.map((v) => v.chiave)), commitDelRamo: null, testaDelRamo: null };
const nonFatta = { id: "R03-002", chiave: "frontend|testo sbagliato", esito: "non_fatto", nota: "il testo dipende da una scelta sul nome" };

test("referto: un referto finito e onesto è verde", () => {
  const { rossi } = regoleReferto(referto([riparata(), nonFatta]), ctxReferto);
  assert.deepEqual(rossi, []);
});

test("AR-1163 · referto: riparato senza la prova rimessa che regge è rosso", () => {
  const { rossi } = regoleReferto(referto([riparata({ rimessa: { esito: "non_decide", uscita: 3, comando: "x" } }), nonFatta]), ctxReferto);
  assert.match(rossi.join("\n"), /prova rimessa che regge/);
});

test("referto: un grave con una prova a lettura del codice è rosso (l'asticella)", () => {
  const { rossi } = regoleReferto(referto([riparata({ prova_tipo: "lettura-codice" }), nonFatta]), ctxReferto);
  assert.match(rossi.join("\n"), /l'asticella/);
});

test("referto: una chiave sbagliata, un indice, una voce mancante a referto finito sono rossi", () => {
  const { rossi } = regoleReferto(referto([riparata({ chiave: "412" })]), ctxReferto);
  const t = rossi.join("\n");
  assert.match(t, /non è quella della scheda/);
  assert.match(t, /è un indice/);
  assert.match(t, /R03-002: a referto finito ogni voce/);
});

test("referto: una chiave JSON doppia e un segnaposto rimasto sono rossi", () => {
  const testo = referto([riparata({ commit: "<sha>" }), nonFatta]).replace('"finita": true,', '"finita": true,\n  "finita": true,');
  const { rossi } = regoleReferto(testo, ctxReferto);
  assert.match(rossi.join("\n"), /«finita» è scritta due volte/);
  assert.match(rossi.join("\n"), /segnaposto «<sha>»/);
  assert.deepEqual(chiaviDoppie('{"a":1,"b":{"a":2},"a":3}'), ["a"]);
});

test("referto: un difetto nuovo riservato con i dettagli in chiaro è rosso", () => {
  const { rossi } = regoleReferto(referto([riparata(), nonFatta], {
    nuovi_difetti_visti: [{ riservato: true, titolo: "Falla di sicurezza da chiudere (API): i dettagli restano fuori", file: "app/api/admin/x/route.ts:12", descrizione: "chiunque può chiamare la rotta senza login", severita: "grave" }],
  }), ctxReferto);
  assert.match(rossi.join("\n"), /riservato ha il file in chiaro/);
  assert.match(rossi.join("\n"), /campi in più \(descrizione\)/);
  assert.match(rossi.join("\n"), /titolo fuori forma/);
});

test("referto: due voci nello stesso commit senza «insieme_a» sono rosse", () => {
  const due = [riparata(), { ...riparata(), id: "R03-002", chiave: "frontend|testo sbagliato" }];
  assert.match(regoleReferto(referto(due), ctxReferto).rossi.join("\n"), /una voce per commit/);
  const dichiarate = [riparata({ insieme_a: ["R03-002"] }), { ...riparata({ insieme_a: ["R03-001"] }), id: "R03-002", chiave: "frontend|testo sbagliato" }];
  assert.doesNotMatch(regoleReferto(referto(dichiarate), ctxReferto).rossi.join("\n"), /una voce per commit/);
});

test("referto: il commit deve stare nella storia del ramo e citare la voce", () => {
  const ctx = { ...ctxReferto, commitDelRamo: new Map([["abc1234000000000000000000000000000000000", "R03-002 un'altra cosa"]]) };
  assert.match(regoleReferto(referto([riparata(), nonFatta]), ctx).rossi.join("\n"), /non cita R03-001/);
});

// ── valida-collaudo e la regola del campione ─────────────────────────────────────────────────────────
const schedaMinori = Array.from({ length: 10 }, (_, i) => ({ id: `R03-${String(i + 1).padStart(3, "0")}`, chiave: `k|${i}`, gravita: "minore", file: [`lib/m${i}.ts`] }));
const refertoMinori = { sessione: "R03", finita: true, voci: schedaMinori.map((v) => ({ id: v.id, chiave: v.chiave, esito: "riparato", rimessa: { uscita: 0, comando: "x" } })) };
const voceCollaudo = (v, extra = {}) => ({ id: v.id, chiave: v.chiave, verdetto: "regge", giudizio: "nessuno", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs …" }, ...extra });
const collaudo = (voci, extra = {}) => JSON.stringify({ collaudatore: "K01", riparatori: ["R03"], aggiornato: "2026-11-08 12:00", finita: true, voci, ...extra });
const ctxCollaudo = { nome: "K01", riparatori: { R03: { voci: schedaMinori, referto: refertoMinori } }, hub: new Set() };

test("collaudo: cinque minori su dieci guardati che reggono, campione accettato e verde", () => {
  const voci = schedaMinori.map((v, i) => voceCollaudo(v, i < 5 ? { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"] } : {}));
  const { rossi, campioni } = regoleCollaudo(collaudo(voci, { campione: { R03: { accettato: true } } }), ctxCollaudo);
  assert.deepEqual(rossi, []);
  assert.equal(campioni.R03.accettato, true);
});

test("AR-1163 · collaudo: il campione dichiarato accettato sotto il 90% è rosso", () => {
  const voci = schedaMinori.map((v, i) => voceCollaudo(v, i < 5 ? { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], verdetto: i === 0 ? "non_regge" : "regge" } : {}));
  const { rossi } = regoleCollaudo(collaudo(voci, { campione: { R03: { accettato: true } } }), ctxCollaudo);
  assert.match(rossi.join("\n"), /dichiarato accettato ma non lo è/);
});

test("collaudo: un campione troppo piccolo a collaudo finito è rosso", () => {
  const voci = schedaMinori.map((v, i) => voceCollaudo(v, i < 2 ? { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"] } : {}));
  assert.match(regoleCollaudo(collaudo(voci), ctxCollaudo).rossi.join("\n"), /campione troppo piccolo/);
});

test("collaudo: «regge» senza il comando della prova rimessa, o con l'uscita sbagliata, è rosso", () => {
  const voci = schedaMinori.map((v, i) => voceCollaudo(v, { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], ...(i === 0 ? { rimessa: { uscita: 0 } } : i === 1 ? { rimessa: { uscita: 1, comando: "x" } } : {}) }));
  const t = regoleCollaudo(collaudo(voci), ctxCollaudo).rossi.join("\n");
  assert.match(t, /R03-001: manca la prova rimessa/);
  assert.match(t, /R03-002: «regge» con la prova rimessa uscita 1/);
});

test("collaudo: un grave regge solo con un giudizio pieno", () => {
  const scheda = [{ id: "R03-001", chiave: "g|1", gravita: "grave", file: ["lib/g.ts"] }];
  const ctx = { nome: "K01", riparatori: { R03: { voci: scheda, referto: { finita: true, voci: [{ id: "R03-001", chiave: "g|1", esito: "riparato", rimessa: { uscita: 0, comando: "x" } }] } } }, hub: new Set() };
  assert.match(regoleCollaudo(collaudo([voceCollaudo(scheda[0])]), ctx).rossi.join("\n"), /regge solo con un giudizio pieno/);
});

test("campione: un minore su un file che lega va sempre guardato", () => {
  const minori = [{ id: "a", file: ["lib/hub.ts"] }, ...Array.from({ length: 5 }, (_, i) => ({ id: `b${i}`, file: [`lib/b${i}.ts`] }))];
  const perId = new Map(minori.slice(1).map((m) => [m.id, { giudizio: "pieno", verdetto: "regge" }]));
  const c = campioneDi(minori, perId, new Set(["lib/hub.ts"]));
  assert.equal(c.accettato, false);
  assert.deepEqual(c.hub_mancanti, ["a"]);
});

// ── applica: chi si chiude ───────────────────────────────────────────────────────────────────────────
test("applica: un minore fuori campione si chiude solo se il campione è accettato; un grave solo col giudizio pieno", () => {
  const piano = { onde: [{ sessioni: { R03: { voci: [...schedaMinori, { id: "R03-011", chiave: "g|1", gravita: "grave", file: ["lib/g.ts"] }] } } }] };
  const referti = { R03: { voci: [...refertoMinori.voci.map((v) => ({ ...v, prova_comando: "npx vitest run x" })), { id: "R03-011", chiave: "g|1", esito: "riparato", prova_comando: "x", rimessa: { uscita: 0, comando: "x" } }] } };
  const pieni = (quanti, regge = () => true) => schedaMinori.map((v, i) => voceCollaudo(v, i < quanti ? { giudizio: "pieno", verdetto: regge(i) ? "regge" : "non_regge" } : {}));
  const conGrave = (voci, giudizioGrave) => ({ collaudatore: "K01", riparatori: ["R03"], voci: [...voci, { id: "R03-011", chiave: "g|1", verdetto: "regge", giudizio: giudizioGrave, rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] });
  let d = decidi({ piano, referti, collaudi: [conGrave(pieni(5), "nessuno")], hub: new Set() });
  assert.equal(d.find((x) => x.id === "R03-010").decisione, "si_chiude");
  assert.equal(d.find((x) => x.id === "R03-011").decisione, "resta_aperta");
  d = decidi({ piano, referti, collaudi: [conGrave(pieni(5, (i) => i !== 0), "pieno")], hub: new Set() });
  assert.equal(d.find((x) => x.id === "R03-010").decisione, "resta_aperta", "campione sotto il 90%: i minori fuori campione restano aperti");
  assert.equal(d.find((x) => x.id === "R03-011").decisione, "si_chiude");
});

// ── i casi di git, su un deposito finto ──────────────────────────────────────────────────────────────
function depositoFinto() {
  const dir = mkdtempSync(join(tmpdir(), "riparazione-sessioni-"));
  const g = (...a) => execFileSync("git", ["-C", dir, ...a], { env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } }).toString().trim();
  const scrivi = (p, t) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), t); };
  g("init", "-q", "-b", "main");
  scrivi("lib/a.ts", "export const a = 1;\n");
  scrivi("lib/b.ts", "export const b = 1;\n");
  scrivi("migrations/245_x.sql", "select 1;\n");
  g("add", "-A"); g("commit", "-q", "-m", "base");
  const base = g("rev-parse", "HEAD");
  return { dir, g, scrivi, base };
}
function cartellaCampagna(base) {
  const c = mkdtempSync(join(tmpdir(), "riparazione-campagna-"));
  writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", profilo: "tutto", lavorabili: [] }));
  writeFileSync(join(c, "piano.json"), JSON.stringify({
    casa: "sito", onde: [{ onda: 1, base, candidate: [], rimandate: [], regia: [], sessioni: {
      R01: { tema: "x", voci: [{ id: "R01-001", chiave: "x|a", gravita: "minore", file: ["lib/a.ts"] }], file: ["lib/a.ts"], migrazioni: [250, 259] },
      R02: { tema: "y", voci: [{ id: "R02-001", chiave: "y|b", gravita: "minore", file: ["lib/b.ts"] }], file: ["lib/b.ts"], migrazioni: [260, 269] },
    } }], cucitura: [], eccedenza: [],
  }));
  return c;
}
const lancia = (...args) => spawnSync(process.execPath, [PROGRAMMA, ...args], { encoding: "utf8" });

test("regola del 12/11 sera · guardia-ramo: un file altrui toccato e poi rimesso non è un rosso, e la guardia lo elenca", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/b.ts", "export const b = 2;\n"); g("commit", "-qam", "R01-001 tocco il file di R02");
    scrivi("lib/b.ts", "export const b = 1;\n"); g("commit", "-qam", "R01-001 lo rimetto com'era");
    scrivi("lib/a.ts", "export const a = 2;\n"); g("commit", "-qam", "R01-001 la riparazione");
    assert.equal(g("diff", "--name-only", base, "r01"), "lib/a.ts", "nel diff netto il file altrui non c'è più");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir, "--json");
    assert.equal(r.status, 0, r.stdout);
    assert.match(r.stdout, /rimessi com'erano.*lib\/b\.ts/);
    assert.deepEqual(JSON.parse(r.stdout.trim().split("\n").pop()).toccati_e_rimessi_com_erano, ["lib/b.ts"]);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("regola del 12/11 sera · guardia-ramo: un file altrui cambiato davvero resta rosso anche se un commit dopo lo tocca di nuovo", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/b.ts", "export const b = 2;\n"); g("commit", "-qam", "R01-001 tocco il file di R02");
    scrivi("lib/b.ts", "export const b = 3;\n"); g("commit", "-qam", "R01-001 lo ritocco");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /lib\/b\.ts: è un file di un'altra sessione/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("regola del 12/11 sera · guardia-ramo: una prova esistente che LEGGE per nome un file della sessione è sua; una che lo nomina solo in un commento no", () => {
  const { dir, g, scrivi, base: base0 } = depositoFinto();
  scrivi("tests/unit/legge.test.ts", "import { readFileSync } from 'node:fs';\nimport { join } from 'node:path';\nconst t = readFileSync(join(process.cwd(), 'lib', 'a.ts'), 'utf8');\nit('x', () => { expect(t).toContain('a'); });\n");
  scrivi("tests/unit/commento.test.ts", "// readFileSync('lib/a.ts')\nit('x', () => { expect(1).toBe(1); });\n");
  g("add", "-A"); g("commit", "-qm", "prove esistenti");
  const base = g("rev-parse", "HEAD");
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/a.ts", "export const a = 2;\n");
    scrivi("tests/unit/legge.test.ts", "import { readFileSync } from 'node:fs';\nimport { join } from 'node:path';\nconst t = readFileSync(join(process.cwd(), 'lib', 'a.ts'), 'utf8');\nit('x', () => { expect(t).toContain('a = 2'); });\n");
    g("add", "-A"); g("commit", "-qm", "R01-001 la riparazione e la prova che legge il file");
    let r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 0, r.stdout);
    scrivi("tests/unit/commento.test.ts", "// readFileSync('lib/a.ts')\nit('x', () => { expect(2).toBe(2); });\n");
    g("add", "-A"); g("commit", "-qm", "R01-001 tocco una prova che non è mia");
    r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /commento\.test\.ts: è una prova esistente che non importa e non nomina/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("percorsiNominati: stringhe, join e resolve sì; commenti e frasi no", () => {
  const t = `// readFileSync("lib/commento.ts")
const a = readFileSync(join(process.cwd(), "app", "negozio", "page.tsx"), "utf8");
const b = readFileSync("components/Card.tsx");
const c = resolve(__dirname, "../../lib/soldi.ts");
it("controlla app/frase nel nome", () => {});`;
  const s = percorsiNominati("tests/unit/x.test.ts", t);
  for (const k of ["app/negozio/page.tsx", "components/Card.tsx", "lib/soldi.ts"]) assert.ok(s.has(k), k);
  for (const k of ["lib/commento.ts", "app/frase.ts"]) assert.ok(!s.has(k), k);
});

test("guardia-ramo: un ramo pulito, col referto e la voce nel messaggio, è verde; un ramo vuoto è in attesa", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    assert.equal(lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir).status, 3);
    scrivi("lib/a.ts", "export const a = 2;\n");
    scrivi("tests/unit/riparazione-r01-a.test.ts", "import { a } from '@/lib/a';\n");
    scrivi("migrations/251_nuova.sql", "select 2;\n");
    g("add", "-A"); g("commit", "-qm", "R01-001 la riparazione con la sua prova");
    scrivi(".riparazione/referto-R01.json", "{}\n"); g("add", "-A"); g("commit", "-qm", "il referto");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 0, r.stdout);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("guardia-ramo: un commit di codice senza l'id della voce è rosso", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/a.ts", "export const a = 3;\n"); g("commit", "-qam", "sistemo un po' di cose");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /non comincia con l'id di una voce di R01/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("AR-1163 · prova-unione: due rami sullo stesso file sono rossi, e l'unione che litiga lo dice; rami disgiunti verdi", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base); scrivi("lib/a.ts", "export const a = 10;\n"); g("commit", "-qam", "R01-001 a");
    g("checkout", "-q", "-b", "r02", base); scrivi("lib/b.ts", "export const b = 10;\n"); g("commit", "-qam", "R02-001 b");
    let r = lancia("prova-unione", "--cartella", c, "--git", dir, "--onda", "1", "--refs", "R01=r01,R02=r02");
    assert.equal(r.status, 0, r.stdout);
    g("checkout", "-q", "r02"); scrivi("lib/a.ts", "export const a = 20;\n"); g("commit", "-qam", "R02-001 sconfino");
    r = lancia("prova-unione", "--cartella", c, "--git", dir, "--onda", "1", "--refs", "R01=r01,R02=r02");
    assert.equal(r.status, 1);
    assert.match(r.stdout, /lib\/a\.ts: toccato da 2 rami/);
    assert.match(r.stdout, /R02: l'unione litiga su lib\/a\.ts/);
    assert.equal(g("status", "--porcelain"), "", "la prova dell'unione non tocca l'albero di lavoro");
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("segnaposti: le schede attese vengono dal piano, e un file estraneo nella cartella delle schede è rosso", () => {
  const c = cartellaCampagna("0".repeat(40));
  try {
    mkdirSync(join(c, "schede"));
    writeFileSync(join(c, "schede", "R01.md"), "# scheda pulita\n");
    assert.equal(lancia("segnaposti", "--cartella", c).status, 3, "manca R02.md: in attesa, non verde");
    writeFileSync(join(c, "schede", "R02.md"), "- ramo: <ramo>\n");
    assert.equal(lancia("segnaposti", "--cartella", c).status, 1, "un segnaposto rimasto è rosso");
    writeFileSync(join(c, "schede", "R02.md"), "# pulita\n");
    assert.equal(lancia("segnaposti", "--cartella", c).status, 0);
    writeFileSync(join(c, "schede", "R03.txt"), "{{BASE}}\n");
    const r = lancia("segnaposti", "--cartella", c);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /R03\.txt: non è la scheda di nessuna sessione/);
  } finally { rmSync(c, { recursive: true, force: true }); }
});

test("un comando senza niente da esaminare non è mai un verde muto", () => {
  const c = mkdtempSync(join(tmpdir(), "riparazione-vuota-"));
  try {
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", lavorabili: [] }));
    writeFileSync(join(c, "piano.json"), JSON.stringify({ casa: "sito", onde: [] }));
    assert.equal(lancia("segnaposti", "--cartella", c).status, 3);
    assert.equal(lancia("applica", "--cartella", c).status, 3);
    assert.equal(lancia("comando-che-non-esiste").status, 2);
  } finally { rmSync(c, { recursive: true, force: true }); }
});

// ── i buchi trovati dal collaudo del 7/11 (lente A), uno per uno ─────────────────────────────────────
test("AR-1163 · collaudo A #1: il «regge» di un collaudatore che non guarda quel riparatore non chiude niente; fra due vince il più severo", () => {
  const piano = { onde: [{ sessioni: { R01: { voci: [{ id: "R01-001", chiave: "g|1", gravita: "grave", file: ["lib/g.ts"] }] } } }] };
  const referti = { R01: { voci: [{ id: "R01-001", chiave: "g|1", esito: "riparato", prova_comando: "x", rimessa: { uscita: 0, comando: "x" } }] } };
  const giusto = { collaudatore: "K01", riparatori: ["R01"], voci: [{ id: "R01-001", chiave: "g|1", verdetto: "non_regge", giudizio: "pieno", rimessa: { uscita: 0, comando: "x" } }] };
  const intruso = { collaudatore: "K02", riparatori: ["R02"], voci: [{ id: "R01-001", chiave: "g|1", verdetto: "regge", giudizio: "pieno", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] };
  assert.equal(decidi({ piano, referti, collaudi: [giusto, intruso], hub: new Set() })[0].decisione, "resta_aperta");
  assert.equal(decidi({ piano, referti, collaudi: [intruso], hub: new Set() })[0].decisione, "resta_aperta", "senza il collaudatore giusto non si chiude");
  const indulgente = { ...intruso, collaudatore: "K03", riparatori: ["R01"] };
  assert.equal(decidi({ piano, referti, collaudi: [indulgente, giusto], hub: new Set() })[0].verdetto, "non_regge", "vince il verdetto più severo, in qualunque ordine");
  assert.equal(decidi({ piano, referti, collaudi: [giusto, indulgente], hub: new Set() })[0].verdetto, "non_regge", "anche quando il più indulgente arriva per ultimo");
  const t = regoleCollaudo(JSON.stringify({ collaudatore: "K02", riparatori: ["R02"], aggiornato: "2026-11-08 12:00", finita: true, voci: intruso.voci }), { nome: "K02", riparatori: { R02: { voci: [], referto: { finita: true, voci: [] } } }, hub: new Set() }).rossi.join("\n");
  assert.match(t, /riparatore che questo collaudo non elenca/);
});

test("collaudo A #3: due cadute scritte «giudizio: nessuno» restano nel conto del campione", () => {
  const minori = Array.from({ length: 7 }, (_, i) => ({ id: `m${i}`, file: [`lib/m${i}.ts`] }));
  const perId = new Map(minori.map((m, i) => [m.id, i < 5 ? { giudizio: "pieno", verdetto: "regge" } : { giudizio: "nessuno", verdetto: "non_regge" }]));
  const c = campioneDi(minori, perId, new Set());
  assert.equal(c.nel_campione, 7);
  assert.equal(c.reggono, 5);
  assert.equal(c.accettato, false, "5 su 7 è il 71%: sotto il 90%");
});

test("collaudo A #4: una falla si scrive solo nella forma riservata, senza campi in più e senza dettagli nel titolo", () => {
  const ok = { riservato: true, titolo: "Falla di sicurezza da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa", file: "(nel referto privato)", severita: "grave" };
  assert.deepEqual(regoleReferto(referto([riparata(), nonFatta], { nuovi_difetti_visti: [ok] }), ctxReferto).rossi, []);
  const casi = [
    [{ ...ok, titolo: "Falla di sicurezza: app/api/stripe/webhook/route.ts:42 accetta eventi senza firma" }, /titolo fuori forma/],
    [{ ...ok, dettagli: { "app/api/x:42 senza firma": "si" } }, /campi in più \(dettagli\)/],
    [{ ...ok, titolo: "Falla di sicurezza da chiudere (webhook_stripe_riga_42): i dettagli restano fuori dal deposito pubblico finché non è chiusa" }, /titolo fuori forma/],
    [{ titolo: "Falla di sicurezza nel webhook", file: "app/api/x.ts:3", severita: "grave" }, /mai in chiaro/],
  ];
  for (const [n, re] of casi) assert.match(regoleReferto(referto([riparata(), nonFatta], { nuovi_difetti_visti: [n] }), ctxReferto).rossi.join("\n"), re);
});

test("collaudo A #5: sulla macchina «.json» resta «.json», e un registro condiviso va alla regia", () => {
  assert.deepEqual(fileDaSchedaMacchina({ dove: "cervello/mutanti.json e cervello/registro-x.json" }).sort(), ["cervello/mutanti.json", "cervello/registro-x.json"]);
  const r = assegnaOnda([voce("AR-903", "grave", fileDaSchedaMacchina({ dove: "cervello/mutanti.json:4" }))], { sessioni: 1, vietati: new Set(CONDIVISI_MACCHINA) });
  assert.deepEqual(r.regia, ["AR-903"]);
});

test("collaudo A #7: un import scritto in un commento non conta", () => {
  const imp = importDi("tests/unit/x.test.ts", "// prima era: import { a } from \"@/lib/a\"\n/* import { c } from '@/lib/c' */\nimport { b } from \"@/lib/b\";\nconst url = 'http://x.it/y';");
  assert.ok(!imp.has("lib/a.ts") && !imp.has("lib/c.ts"));
  assert.ok(imp.has("lib/b.ts"));
});

test("collaudo A #9: «./lib/a.ts» e «lib/a.ts» sono lo stesso file e lo stesso padrone", () => {
  const r = assegnaOnda([voce("a", "grave", ["./lib/a.ts"], "x"), voce("b", "grave", ["marketplace/lib/a.ts"], "y")], { sessioni: 2 });
  const s = Object.values(r.sessioni);
  assert.equal(s.length, 1, "le due voci finiscono nella stessa sessione");
  assert.deepEqual(s[0].file, ["lib/a.ts"]);
});

test("collaudo A #6 e #8: una prova esistente cancellata o spenta è rossa, e l'id sta sul primo rigo ed è della sessione", () => {
  const { dir, g, scrivi, base: _ } = depositoFinto();
  scrivi("tests/unit/vecchia.test.ts", "import { a } from '@/lib/a';\nit('a', () => {});\n");
  g("add", "-A"); g("commit", "-qm", "una prova vecchia");
  const base = g("rev-parse", "HEAD");
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("tests/unit/vecchia.test.ts", "import { a } from '@/lib/a';\nit.skip('a', () => {});\n"); g("commit", "-qam", "R01-001 la spengo");
    let r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /prova spenta/);
    g("checkout", "-q", "-B", "r01", base);
    g("rm", "-q", "tests/unit/vecchia.test.ts"); g("commit", "-qm", "R01-001 la tolgo");
    r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.match(r.stdout, /una prova esistente non si cancella/);
    g("checkout", "-q", "-B", "r01", base);
    scrivi("lib/a.ts", "export const a = 5;\n"); g("commit", "-qam", "R02-varie lint");
    scrivi("lib/a.ts", "export const a = 6;\n"); g("commit", "-qam", "aggiusto\n\nZ99-varie");
    r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal((r.stdout.match(/non comincia con l'id di una voce di R01/g) || []).length, 2, r.stdout);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("collaudo A #10 e #11: rami senza file toccati non sono un verde; il nome del referto e i commit devono tornare", () => {
  const { dir, g, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("branch", "r01", base); g("branch", "r02", base);
    assert.equal(lancia("prova-unione", "--cartella", c, "--git", dir, "--onda", "1", "--refs", "R01=r01,R02=r02").status, 3);
    const corto = { ...JSON.parse(referto([riparata({ commit: "a" }), nonFatta], { testa: "f" })) };
    const t = regoleReferto(JSON.stringify(corto), ctxReferto).rossi.join("\n");
    assert.match(t, /«a» non è un commit/);
    assert.match(t, /«testa» «f» non è un commit/);
    writeFileSync(join(c, "referto-R02.json"), JSON.stringify({ sessione: "R01", aggiornato: "2026-11-08 10:00", finita: false, voci: [] }));
    const r = lancia("valida-referto", join(c, "referto-R02.json"), "--cartella", c);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /dice una sessione, il referto un'altra/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("AR-1163 · collaudo A #2: applica rilancia i controlli su referti e collaudi, e un referto non finito ferma tutto senza scrivere", () => {
  const c = mkdtempSync(join(tmpdir(), "riparazione-applica-"));
  try {
    const voci = [{ id: "R01-001", chiave: "pagamenti|il payout salta", gravita: "grave", file: ["lib/a.ts"] }];
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", lavorabili: voci.map((v) => ({ ...v })) }));
    writeFileSync(join(c, "piano.json"), JSON.stringify({ casa: "sito", onde: [{ onda: 1, base: "0".repeat(40), candidate: [voci[0].chiave], sessioni: { R01: { voci, file: ["lib/a.ts"] } }, rimandate: [], regia: [] }] }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "pagamenti", titolo: "il payout salta", stato: "aperto", severita: "grave", file: "lib/a.ts:1" }] }));
    mkdirSync(join(c, "referti")); mkdirSync(join(c, "collaudi"));
    const rip = riparata({ id: "R01-001", prova_tipo: "lettura-codice", prova_eseguita: false });
    writeFileSync(join(c, "referti", "R01.json"), JSON.stringify({ sessione: "R01", aggiornato: "2026-11-08 10:00", finita: false, voci: [rip] }));
    writeFileSync(join(c, "collaudi", "K01.json"), JSON.stringify({ collaudatore: "K01", riparatori: ["R01"], aggiornato: "2026-11-08 12:00", finita: true, voci: [{ id: "R01-001", chiave: rip.chiave, verdetto: "regge", giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] }));
    writeFileSync(join(c, "collaudi", "appunti.json"), "{}");
    const prima = readFileSync(registro, "utf8");
    const r = lancia("applica", "--cartella", c, "--registro", registro, "--scrivi");
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /l'asticella/);
    assert.match(r.stdout, /il referto non è finito/);
    assert.match(r.stdout, /appunti\.json: il nome non è quello di una sessione/);
    assert.equal(readFileSync(registro, "utf8"), prima, "il registro non si tocca");
    assert.ok(!existsSync(join(c, "decisioni.json")) && !existsSync(join(c, "frammenti")), "e non nasce niente");
  } finally { rmSync(c, { recursive: true, force: true }); }
});

// ── i buchi trovati dal collaudo del 7/11 (lente B) ──────────────────────────────────────────────────
test("collaudo B #1: la testa del referto resta vera se dopo di lei ci sono solo commit del referto", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/a.ts", "export const a = 7;\n"); g("commit", "-qam", "R01-001 la riparazione");
    const testa = g("rev-parse", "HEAD");
    const ref = { sessione: "R01", aggiornato: "2026-11-08 10:00", finita: true, testa, verifica: { esito: "verde" }, voci: [{ id: "R01-001", chiave: "x|a", esito: "non_fatto", nota: "prova" }] };
    scrivi(".riparazione/referto-R01.json", JSON.stringify(ref)); g("add", "-A"); g("commit", "-qm", "il referto");
    let r = lancia("valida-referto", join(dir, ".riparazione/referto-R01.json"), "--cartella", c, "--git", dir, "--ramo", "r01");
    assert.doesNotMatch(r.stdout, /non è la testa del ramo/, r.stdout);
    scrivi("lib/a.ts", "export const a = 8;\n"); g("commit", "-qam", "R01-001 un ritocco dopo la testa");
    r = lancia("valida-referto", join(dir, ".riparazione/referto-R01.json"), "--cartella", c, "--git", dir, "--ramo", "r01");
    assert.match(r.stdout, /non è la testa del ramo/, "un commit di codice dopo la testa la rende falsa");
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("collaudo B #3: sulla macchina CLAUDE.md e COMANDI.md si leggono se esistono nella radice, e vanno alla regia", () => {
  const radice = new Set(["CLAUDE.md", "COMANDI.md"]);
  const f = fileDaSchedaMacchina({ dove: "CLAUDE.md riga 40 · page.tsx:3 · cervello/x.mjs" }, "", radice);
  assert.deepEqual(f.sort(), ["CLAUDE.md", "cervello/x.mjs"]);
  const r = classifica("macchina", [{ id: "AR-142", stato: "aperto", gravita: "bloccante", dimensione: "d", dove: "CLAUDE.md:12" }], { fileDelDeposito: new Set(["CLAUDE.md"]) });
  assert.deepEqual(assegnaOnda(r.lavorabili, { sessioni: 1, vietati: new Set(CONDIVISI_MACCHINA) }).regia, ["AR-142"]);
});

test("collaudo B #10: una voce che rimanda al referto privato in una riverifica è riservata", () => {
  const r = classifica("sito", [{ dimensione: "a", titolo: "il portiere aspetta tre secondi", stato: "aperto", severita: "grave", file: "middleware.ts:12", riverifica_6_11: { nota: "dettagli nel referto privato: la falla è ancora aperta" } }], {});
  assert.equal(r.fuori.riservate.length, 1);
  assert.equal(r.lavorabili.length, 0);
});

test("collaudo B #6: lanciato da un collegamento simbolico il programma parte davvero", () => {
  const d = mkdtempSync(join(tmpdir(), "riparazione-link-"));
  try {
    symlinkSync(PROGRAMMA, join(d, "collegamento.mjs"));
    const r = spawnSync(process.execPath, [join(d, "collegamento.mjs")], { encoding: "utf8" });
    assert.equal(r.status, 2, "senza comando deve dire l'uso, non uscire 0 in silenzio");
    assert.match(r.stderr, /uso:/);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test("collaudo B #7 e #8: la base si scrive come SHA completo; un ramo con unioni ha un rosso solo, chiaro", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = mkdtempSync(join(tmpdir(), "riparazione-base-"));
  try {
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", profilo: "tutto", lavorabili: [{ chiave: "x|a", gravita: "minore", dimensione: "x", titolo: "a", file: ["lib/a.ts"] }] }));
    const r = lancia("dividi", "--cartella", c, "--repo", dir, "--base", "HEAD");
    assert.equal(r.status, 0, r.stdout);
    assert.equal(JSON.parse(readFileSync(join(c, "piano.json"), "utf8")).onde[0].base, base);
    g("checkout", "-q", "-b", "laterale", base); scrivi("lib/b.ts", "export const b = 3;\n"); g("commit", "-qam", "altro");
    g("checkout", "-q", "-b", "r01", base); scrivi("lib/a.ts", "export const a = 9;\n"); g("commit", "-qam", "R01-001 a");
    g("merge", "-q", "--no-ff", "-m", "unisco", "laterale");
    const r2 = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r2.status, 1);
    assert.match(r2.stdout, /il ramo ha 1 unioni/);
    assert.doesNotMatch(r2.stdout, /lib\/b\.ts/, "i file portati dall'unione non si elencano uno per uno");
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("collaudo B #4: il collaudatore trova i referti con --referti o dal ramo scritto in sessioni.json", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    const rif = { sessione: "R01", aggiornato: "2026-11-08 10:00", finita: true, voci: [{ id: "R01-001", chiave: "x|a", esito: "riparato", rimessa: { uscita: 0, comando: "x" } }] };
    const col = { collaudatore: "K01", riparatori: ["R01"], aggiornato: "2026-11-08 12:00", finita: true, voci: [{ id: "R01-001", chiave: "x|a", verdetto: "regge", giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] };
    mkdirSync(join(c, "collaudi")); writeFileSync(join(c, "collaudi", "K01.json"), JSON.stringify(col));
    assert.equal(lancia("valida-collaudo", join(c, "collaudi", "K01.json"), "--cartella", c).status, 3, "senza referti: in attesa");
    const mia = mkdtempSync(join(tmpdir(), "referti-")); writeFileSync(join(mia, "R01.json"), JSON.stringify(rif));
    assert.equal(lancia("valida-collaudo", join(c, "collaudi", "K01.json"), "--cartella", c, "--referti", mia).status, 0);
    g("checkout", "-q", "-b", "r01", base); scrivi(".riparazione/referto-R01.json", JSON.stringify(rif)); g("add", "-A"); g("commit", "-qm", "referto");
    writeFileSync(join(c, "sessioni.json"), JSON.stringify({ sessioni: { R01: { ramo: "r01" } } }));
    assert.equal(lancia("valida-collaudo", join(c, "collaudi", "K01.json"), "--cartella", c, "--git", dir).status, 0);
    rmSync(mia, { recursive: true, force: true });
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

// ── i buchi trovati dal secondo collaudo del 7/11 ────────────────────────────────────────────────────
test("secondo collaudo #1: si collauda solo un referto finito", () => {
  const ctx = { nome: "K01", riparatori: { R03: { voci: schedaMinori, referto: { ...refertoMinori, finita: false } } }, hub: new Set() };
  const voci = schedaMinori.map((v) => voceCollaudo(v, { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"] }));
  assert.match(regoleCollaudo(collaudo(voci), ctx).rossi.join("\n"), /il referto del riparatore non è finito/);
});

test("secondo collaudo #2: le prove spente in ogni forma, e una prova svuotata, sono rosse", () => {
  for (const riga of ["it.skipIf(true)('a', () => {})", "it('a', { skip: true }, () => {})", "it.fails('a', () => {})", "it.concurrent.skip('a', () => {})", "t.skip('dopo')", "test.only('a', () => {})"]) assert.ok(RE_SPENTA.test(riga), riga);
  for (const riga of ["it('salta il controllo', () => {})", "const skip = 1;", "expect(skipped).toBe(0)"]) assert.ok(!RE_SPENTA.test(riga), riga);
  const { dir, g, scrivi, base: _ } = depositoFinto();
  scrivi("tests/unit/vecchia.test.ts", "import { a } from '@/lib/a';\nit('a', () => { expect(a).toBe(1); expect(a).not.toBe(2); });\n");
  g("add", "-A"); g("commit", "-qm", "prova vecchia");
  const base = g("rev-parse", "HEAD");
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("tests/unit/vecchia.test.ts", "import { a } from '@/lib/a';\nit('a', () => { expect(a).toBe(1); });\n"); g("commit", "-qam", "R01-001 tolgo un'asserzione");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /1 asserzioni in meno di prima \(2 → 1\)/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("secondo collaudo #3 e #4: area e gravità della riservata da elenchi chiusi, «riservato» solo booleano", () => {
  const ok = { riservato: true, titolo: "Falla di sicurezza da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa", file: "(nel referto privato)", severita: "grave" };
  const casi = [
    [{ ...ok, titolo: "Falla di sicurezza da chiudere (webhook Stripe senza firma): i dettagli restano fuori dal deposito pubblico finché non è chiusa" }, /titolo fuori forma/],
    [{ ...ok, severita: "bloccante: app/api/orders/route.ts:42 non filtra store_id" }, /gravità fuori elenco/],
    [{ ...ok, riservato: "true" }, /deve essere true o false/],
    [{ titolo: "un difetto normale", file: "lib/a.ts:1", severita: "minore", riservato: "false" }, /deve essere true o false/],
  ];
  for (const [n, re] of casi) assert.match(regoleReferto(referto([riparata(), nonFatta], { nuovi_difetti_visti: [n] }), ctxReferto).rossi.join("\n"), re);
});

test("secondo collaudo #5: «fuori dal deposito pubblico» e «falla riservata» rendono riservata una voce", () => {
  const voci = [
    { dimensione: "a", titolo: "t1", stato: "aperto", severita: "minore", file: "lib/a.ts:1", nota_6_11: "il resto del dettaglio resta fuori dal deposito pubblico" },
    { dimensione: "a", titolo: "t2", stato: "aperto", severita: "minore", file: "lib/b.ts:1", nota: "tocca una falla riservata" },
  ];
  assert.equal(classifica("sito", voci, {}).fuori.riservate.length, 2);
});

test("secondo collaudo #8: la forma unica del percorso viene prima del controllo dei file alla base", () => {
  const r = classifica("sito", [{ dimensione: "a", titolo: "t", stato: "aperto", severita: "minore", file: "lib/x/../a.ts:3" }], { fileDelDeposito: new Set(["lib/a.ts"]) });
  assert.deepEqual(r.lavorabili.map((v) => v.file), [["lib/a.ts"]]);
});

test("secondo collaudo #8: fra due «regge» vince quello col giudizio pieno", () => {
  const piano = { onde: [{ sessioni: { R01: { voci: [{ id: "R01-001", chiave: "g|1", gravita: "grave", file: ["lib/g.ts"] }] } } }] };
  const referti = { R01: { voci: [{ id: "R01-001", chiave: "g|1", esito: "riparato", prova_comando: "x", rimessa: { uscita: 0, comando: "x" } }] } };
  const rapido = { collaudatore: "K01", riparatori: ["R01"], voci: [{ id: "R01-001", chiave: "g|1", verdetto: "regge", giudizio: "nessuno", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] };
  const pieno = { collaudatore: "K02", riparatori: ["R01"], voci: [{ id: "R01-001", chiave: "g|1", verdetto: "regge", giudizio: "pieno", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] };
  assert.equal(decidi({ piano, referti, collaudi: [rapido, pieno], hub: new Set() })[0].decisione, "si_chiude");
});

test("secondo collaudo #6 e A11: commit inventati e commit troppo corti non passano, e --scrivi pretende la storia del ramo", () => {
  assert.match(regoleReferto(referto([riparata({ commit: "abcdef" }), nonFatta]), ctxReferto).rossi.join("\n"), /«abcdef» non è un commit/);
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base); scrivi("lib/a.ts", "export const a = 4;\n"); g("commit", "-qam", "R01-001 a");
    const testa = g("rev-parse", "HEAD");
    const voce = { id: "R01-001", chiave: "x|a", esito: "riparato", commit: "abcdef1", file_toccati: ["lib/a.ts"], prova_comando: "x", prova_tipo: "comando", prova_eseguita: true, rimessa: { esito: "regge", uscita: 0, comando: "x" }, copre_tutta_la_voce: true, verificato_da: "qa" };
    mkdirSync(join(c, "referti"));
    writeFileSync(join(c, "referti", "R01.json"), JSON.stringify({ sessione: "R01", aggiornato: "2026-11-08 10:00", finita: true, testa, verifica: { esito: "verde" }, voci: [voce] }));
    writeFileSync(join(c, "sessioni.json"), JSON.stringify({ sessioni: { R01: { ramo: "r01" } } }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "x", titolo: "a", stato: "aperto", severita: "minore", file: "lib/a.ts:1" }, { dimensione: "y", titolo: "b", stato: "aperto", severita: "minore", file: "lib/b.ts:1" }] }));
    let r = lancia("applica", "--cartella", c, "--registro", registro, "--scrivi");
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /con --scrivi servono --git/);
    r = lancia("applica", "--cartella", c, "--registro", registro, "--scrivi", "--git", dir);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /il commit abcdef1 non è nella storia del ramo/);
    // Un percorso che non sta né nel vault né in una cartella temporanea, dovunque sia clonato il deposito:
    // dentro il deposito non andava bene, perché un deposito clonato in /tmp sta già in una cartella temporanea.
    r = lancia("applica", "--cartella", c, "--registro", "/registro-fuori-posto/un-registro-qualunque.json", "--scrivi", "--git", dir);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /il registro deve stare in MyCity-Vault/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("secondo collaudo #8: prova-unione mette da parte un ramo con unioni, con un rosso solo", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "laterale", base); scrivi("lib/c.ts", "export const c = 1;\n"); g("add", "-A"); g("commit", "-qm", "altro");
    g("checkout", "-q", "-b", "r01", base); scrivi("lib/a.ts", "export const a = 11;\n"); g("commit", "-qam", "R01-001 a");
    g("merge", "-q", "--no-ff", "-m", "unisco", "laterale");
    g("checkout", "-q", "-b", "r02", base); scrivi("lib/b.ts", "export const b = 11;\n"); g("commit", "-qam", "R02-001 b");
    const r = lancia("prova-unione", "--cartella", c, "--git", dir, "--onda", "1", "--refs", "R01=r01,R02=r02");
    assert.equal(r.status, 1);
    assert.equal((r.stdout.match(/^🔴/gm) || []).length, 2, r.stdout);
    assert.match(r.stdout, /R01: il ramo ha 1 unioni/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("secondo collaudo #7: applica rilancia anche i controlli del collaudo (un giudizio pieno senza lenti la ferma)", () => {
  const c = mkdtempSync(join(tmpdir(), "riparazione-applica-k-"));
  try {
    const voci = [{ id: "R01-001", chiave: "pagamenti|il payout salta", gravita: "grave", file: ["lib/a.ts"] }];
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", lavorabili: voci }));
    writeFileSync(join(c, "piano.json"), JSON.stringify({ casa: "sito", onde: [{ onda: 1, base: "0".repeat(40), candidate: [voci[0].chiave], sessioni: { R01: { voci, file: ["lib/a.ts"] } }, rimandate: [], regia: [] }] }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "pagamenti", titolo: "il payout salta", stato: "aperto", severita: "grave", file: "lib/a.ts:1" }] }));
    mkdirSync(join(c, "referti")); mkdirSync(join(c, "collaudi"));
    const rip = riparata({ id: "R01-001" });
    writeFileSync(join(c, "referti", "R01.json"), JSON.stringify({ sessione: "R01", aggiornato: "2026-11-08 10:00", finita: true, testa: "fff0000", verifica: { esito: "verde", testa: "fff0000" }, voci: [rip] }));
    const k = (lenti) => JSON.stringify({ collaudatore: "K01", riparatori: ["R01"], aggiornato: "2026-11-08 12:00", finita: true, voci: [{ id: "R01-001", chiave: rip.chiave, verdetto: "regge", giudizio: "pieno", ...(lenti ? { lenti } : {}), rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] });
    writeFileSync(join(c, "collaudi", "K01.json"), k(["chiude_tutta", "nata_rotta"]));
    let r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 3, r.stdout);
    assert.match(r.stdout, /1 si chiudono/);
    writeFileSync(join(c, "collaudi", "K01.json"), k(null));
    r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /collaudi\/K01\.json: R01-001: un giudizio pieno porta tutte e due le lenti/);
  } finally { rmSync(c, { recursive: true, force: true }); }
});

// ── il controllore sul ramo unito (Nicola, 12/11: «ci deve essere un controllore») ──────────────────────
test("il controllore: una voce che trova rossa sul ramo unito non si chiude, e i difetti che vede nascono nel registro", () => {
  const c = mkdtempSync(join(tmpdir(), "riparazione-applica-c-"));
  try {
    const voci = [{ id: "R01-001", chiave: "pagamenti|il payout salta", gravita: "grave", file: ["lib/a.ts"] }];
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", lavorabili: voci }));
    writeFileSync(join(c, "piano.json"), JSON.stringify({ casa: "sito", onde: [{ onda: 1, base: "0".repeat(40), candidate: [voci[0].chiave], sessioni: { R01: { voci, file: ["lib/a.ts"] } }, rimandate: [], regia: [] }] }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "pagamenti", titolo: "il payout salta", stato: "aperto", severita: "grave", file: "lib/a.ts:1" }] }));
    mkdirSync(join(c, "referti")); mkdirSync(join(c, "collaudi")); mkdirSync(join(c, "controlli"));
    const rip = riparata({ id: "R01-001" });
    writeFileSync(join(c, "referti", "R01.json"), JSON.stringify({ sessione: "R01", aggiornato: "2026-11-08 10:00", finita: true, testa: "fff0000", verifica: { esito: "verde", testa: "fff0000" }, voci: [rip] }));
    writeFileSync(join(c, "collaudi", "K01.json"), JSON.stringify({ collaudatore: "K01", riparatori: ["R01"], aggiornato: "2026-11-08 12:00", finita: true, voci: [{ id: "R01-001", chiave: rip.chiave, verdetto: "regge", giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] }));
    const controllo = (extra) => JSON.stringify({ controllore: "C01", onda: 1, finita: true, testa: "abc1234", verify: { comando: "npm run verify", esito: "verde" }, voci_rosse: [], nuovi_difetti_visti: [], ...extra });
    // senza controllo, o con un controllo che non trova niente, la voce si chiude
    writeFileSync(join(c, "controlli", "C01.json"), controllo({}));
    let r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 3, r.stdout);
    assert.match(r.stdout, /1 si chiudono/);
    // il controllore la trova rossa sul ramo unito: resta aperta, col perché
    writeFileSync(join(c, "controlli", "C01.json"), controllo({
      verify: { comando: "npm run verify", esito: "rosso" },
      voci_rosse: [{ chiave: rip.chiave, perche: "tests/unit/riparazione-r03-payout.test.ts rosso dopo l'unione con R02" }],
      nuovi_difetti_visti: [{ titolo: "Il bonifico parte due volte se si preme due volte", dimensione: "pagamenti-stripe", severita: "grave", file: "lib/a.ts:9", descrizione: "nato dall'unione" }],
    }));
    r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 3, r.stdout);
    assert.match(r.stdout, /0 si chiudono/);
    assert.match(r.stdout, /1 difetti nati/);
    const d = JSON.parse(readFileSync(join(c, "decisioni.json"), "utf8")).decisioni[0];
    assert.equal(d.decisione, "resta_aperta");
    assert.match(d.perche, /C01: tests\/unit\/riparazione-r03-payout/);
    // un controllo fuori forma, o un file con un nome di nessuno, fermano tutto
    writeFileSync(join(c, "controlli", "C01.json"), controllo({ verify: undefined, voci_rosse: [{ chiave: "inventata|mai vista", perche: "x" }] }));
    writeFileSync(join(c, "controlli", "note.json"), "{}");
    r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /controlli\/C01\.json: manca la prova sull'albero unito/);
    assert.match(r.stdout, /controlli\/C01\.json: la voce rossa «inventata\|mai vista» non è nel registro/);
    assert.match(r.stdout, /controlli\/note\.json: il nome non è quello di una sessione/);
  } finally { rmSync(c, { recursive: true, force: true }); }
});

test("il controllore: anche un «già riparato prima» rosso sul ramo unito resta aperto, e una voce rossa d'altri si dice", async () => {
  const { conIControlli, rosseFuoriCampagna } = await import("../riparazione-sessioni.mjs");
  const decisioni = [
    { chiave: "a|uno", decisione: "si_chiude" },
    { chiave: "b|due", decisione: "gia_riparato_prima" },
    { chiave: "c|tre", decisione: "resta_aperta", perche: "parziale" },
  ];
  const controlli = [{ controllore: "CF", voci_rosse: [{ chiave: "b|due", perche: "la riga 12 c'è ancora" }, { chiave: "z|altrui", perche: "x" }] }];
  const dopo = conIControlli(decisioni, controlli);
  assert.equal(dopo[0].decisione, "si_chiude");
  assert.equal(dopo[1].decisione, "resta_aperta");
  assert.match(dopo[1].perche, /CF: la riga 12/);
  assert.equal(dopo[2].perche, "parziale", "una voce già aperta resta col suo perché");
  assert.deepEqual(rosseFuoriCampagna(decisioni, controlli), ["z|altrui"]);
});

test("il controllore ha le stesse regole del riparatore sui difetti nuovi, e non chiude niente su un controllo dubbio", async () => {
  const { regoleControllo, PER_SESSIONE } = await import("../riparazione-sessioni.mjs");
  const buono = { controllore: "C01", finita: true, testa: "abc1234", verify: { comando: "npm run verify", esito: "verde" }, voci_rosse: [], nuovi_difetti_visti: [] };
  assert.deepEqual(regoleControllo(buono, { nome: "C01" }), []);
  const rossiDi = (extra, testo = null) => regoleControllo({ ...buono, ...extra }, { nome: "C01", testo });
  assert.match(rossiDi({ finita: false }).join(" "), /non è finito/);
  assert.match(rossiDi({ testa: undefined }).join(" "), /manca «testa»/);
  assert.match(rossiDi({ voci_rosse: "nessuna" }).join(" "), /manca «voci_rosse»/);
  assert.match(rossiDi({ verify: { comando: "npm run verify", esito: "rosso" } }).join(" "), /di chi è il rosso/);
  // una riservata con il dettaglio in un campo in più, o scritta come stringa, non passa nel deposito pubblico
  const titolo = "Falla di sicurezza da chiudere (accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa.";
  assert.match(rossiDi({ nuovi_difetti_visti: [{ riservato: true, titolo, file: "(nel referto privato)", severita: "bloccante", descrizione: "app/api/admin/route.ts:42" }] }).join(" "), /campi in più/);
  assert.match(rossiDi({ nuovi_difetti_visti: [{ riservato: "true", titolo: "Il token passa nella query", file: "app/api/admin/route.ts:42", severita: "bloccante" }] }).join(" "), /deve essere true o false/);
  assert.match(rossiDi({ nuovi_difetti_visti: [{ titolo: "x", file: "a.ts:1", severita: "altissima" }] }).join(" "), /gravità valida/);
  // una chiave scritta due volte: «voci_rosse» pieno non sparisce sotto uno vuoto
  const testo = '{"controllore":"C01","voci_rosse":[{"chiave":"a|b","perche":"x"}],"voci_rosse":[]}';
  assert.match(rossiDi({}, testo).join(" "), /«voci_rosse» è scritta due volte/);
  // 25 voci a riparatore (Nicola, 12/11): 30 voci senza numero di sessioni sono due riparatori, il più carico a 25
  assert.equal(PER_SESSIONE, 25);
  const voci = Array.from({ length: 30 }, (_, i) => ({ chiave: `x|v${i}`, gravita: "minore", dimensione: "d", file: [`lib/f${i}.ts`] }));
  const o = assegnaOnda(voci, {});
  assert.equal(Object.keys(o.sessioni).length, 2);
  assert.equal(Math.max(...Object.values(o.sessioni).map((s) => s.voci.length)), 25);
});

test("12/11 notte: la verifica finale si lega alla testa (R07 ha spinto 8 commit con un verify mai aspettato)", () => {
  const conVerifica = (verifica) => regoleReferto(referto([riparata(), nonFatta], { verifica }), ctxReferto);
  // senza lo SHA il referto non è rosso ma resta in attesa: non passa al collaudo
  let r = conVerifica({ comando: "npm run verify", esito: "verde" });
  assert.deepEqual(r.rossi, []);
  assert.match(r.attese.join(" "), /verifica\.testa/);
  // girata su un commit vecchio: rosso
  r = conVerifica({ comando: "npm run verify", esito: "verde", testa: "abc1234" });
  assert.match(r.rossi.join(" "), /la verifica è girata su abc1234, non sulla testa fff0000/);
  // sulla testa: niente da dire
  r = conVerifica({ comando: "npm run verify", esito: "verde", testa: "fff0000" });
  assert.deepEqual(r.rossi, []);
  assert.ok(!r.attese.some((a) => /verifica/.test(a)));
});

test("12/11 notte, collaudo: la verifica su un commit del solo referto vale, uno SHA simile ma diverso no", async () => {
  const { verificaSullaTesta } = await import("../riparazione-sessioni.mjs");
  const C = "c0de" + "1".repeat(36), P = "f00d" + "2".repeat(36);
  // con la storia del ramo: la testa di codice, o un commit dopo di lei che tocca solo il referto
  assert.equal(verificaSullaTesta(C.slice(0, 7), C.slice(0, 7), { testaDelRamo: C, soloRefertoDopo: [P] }), true);
  assert.equal(verificaSullaTesta(P.slice(0, 9), C.slice(0, 7), { testaDelRamo: C, soloRefertoDopo: [P] }), true);
  // stesso prefisso della testa dichiarata, ma non è il commit vero: rosso
  assert.equal(verificaSullaTesta("c0de111bbbb", "c0de111", { testaDelRamo: C, soloRefertoDopo: [] }), false);
  // senza storia: a prefisso, nei due versi, mai su una testa troppo corta
  assert.equal(verificaSullaTesta("abc1234", "abc1234def", {}), true);
  assert.equal(verificaSullaTesta("abc1234def", "abc1234", {}), true);
  assert.equal(verificaSullaTesta("abc1234", "abc9999", {}), false);
  assert.equal(verificaSullaTesta("abc1234", "", {}), false);
  // un numero o un elenco al posto dello SHA: rosso
  const r = regoleReferto(referto([riparata(), nonFatta], { verifica: { comando: "npm run verify", esito: "verde", testa: ["fff0000"] } }), ctxReferto);
  assert.match(r.rossi.join(" "), /«verifica\.testa» \["fff0000"\] non è un commit/);
});

test("12/11 notte, collaudo: applica ferma un referto finito senza verifica.testa (dall'onda scritta nel piano)", () => {
  const c = mkdtempSync(join(tmpdir(), "riparazione-applica-o2-"));
  try {
    const v1 = [{ id: "R01-001", chiave: "pagamenti|il payout salta", gravita: "grave", file: ["lib/a.ts"] }];
    const v2 = [{ id: "R02-001", chiave: "pagamenti|il payout salta", gravita: "grave", file: ["lib/a.ts"] }];
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", lavorabili: v1 }));
    writeFileSync(join(c, "piano.json"), JSON.stringify({ casa: "sito", onde: [
      { onda: 1, base: "0".repeat(40), candidate: [], sessioni: {}, rimandate: [v1[0].chiave], regia: [] },
      { onda: 2, base: "1".repeat(40), candidate: [v2[0].chiave], sessioni: { R02: { voci: v2, file: ["lib/a.ts"] } }, rimandate: [], regia: [] },
    ] }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "pagamenti", titolo: "il payout salta", stato: "aperto", severita: "grave", file: "lib/a.ts:1" }] }));
    mkdirSync(join(c, "referti")); mkdirSync(join(c, "collaudi"));
    const rip = riparata({ id: "R02-001" });
    const ref = (verifica) => JSON.stringify({ sessione: "R02", aggiornato: "2026-11-13 10:00", finita: true, testa: "fff0000", verifica, voci: [rip] });
    writeFileSync(join(c, "collaudi", "K01.json"), JSON.stringify({ collaudatore: "K01", riparatori: ["R02"], aggiornato: "2026-11-13 12:00", finita: true, voci: [{ id: "R02-001", chiave: rip.chiave, verdetto: "regge", giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] }));
    writeFileSync(join(c, "referti", "R02.json"), ref({ comando: "npm run verify", esito: "verde" }));
    let r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /un referto finito dice su quale commit è girata la verifica/);
    writeFileSync(join(c, "referti", "R02.json"), ref({ comando: "npm run verify", esito: "verde", testa: "fff0000" }));
    r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 3, r.stdout);
    assert.match(r.stdout, /1 si chiudono/);
  } finally { rmSync(c, { recursive: true, force: true }); }
});

test("AR-1172 · radiografia 12/11 notte · la verifica legata al commit vale anche nell'onda 1 di una campagna nuova; la campagna del 12/11 la esenta col piano", () => {
  const c = mkdtempSync(join(tmpdir(), "riparazione-applica-o1-"));
  try {
    const v1 = [{ id: "R01-001", chiave: "pagamenti|il payout salta", gravita: "grave", file: ["lib/a.ts"] }];
    const piano = (extra) => JSON.stringify({ casa: "sito", ...extra, onde: [{ onda: 1, base: "0".repeat(40), candidate: [v1[0].chiave], sessioni: { R01: { voci: v1, file: ["lib/a.ts"] } }, rimandate: [], regia: [] }] });
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", lavorabili: v1 }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "pagamenti", titolo: "il payout salta", stato: "aperto", severita: "grave", file: "lib/a.ts:1" }] }));
    mkdirSync(join(c, "referti")); mkdirSync(join(c, "collaudi"));
    const rip = riparata({ id: "R01-001" });
    writeFileSync(join(c, "referti", "R01.json"), JSON.stringify({ sessione: "R01", aggiornato: "2026-11-13 10:00", finita: true, testa: "fff0000", verifica: { comando: "npm run verify", esito: "verde" }, voci: [rip] }));
    writeFileSync(join(c, "collaudi", "K01.json"), JSON.stringify({ collaudatore: "K01", riparatori: ["R01"], aggiornato: "2026-11-13 12:00", finita: true, voci: [{ id: "R01-001", chiave: rip.chiave, verdetto: "regge", giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" } }] }));
    writeFileSync(join(c, "piano.json"), piano({}));
    let r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /un referto finito dice su quale commit è girata la verifica/);
    writeFileSync(join(c, "piano.json"), piano({ verifica_testa_dall_onda: 2 }));
    r = lancia("applica", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 3, r.stdout);
  } finally { rmSync(c, { recursive: true, force: true }); }
});

test("AR-1172 · radiografia 12/11 notte · il collaudo che dice «regge» deve aver tolto la correzione con prova-rimessa, e con --sql se il riparatore l'ha usato", () => {
  const scheda = [{ id: "R03-001", chiave: "g|1", gravita: "grave", file: ["migrations/251_x.sql"] }];
  const ctxSql = (comandoRiparatore) => ({ nome: "K01", riparatori: { R03: { voci: scheda, referto: { finita: true, voci: [{ id: "R03-001", chiave: "g|1", esito: "riparato", rimessa: { uscita: 0, comando: comandoRiparatore } }] } } }, hub: new Set() });
  const col = (comando) => collaudo([voceCollaudo(scheda[0], { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], rimessa: { uscita: 0, comando } })]);
  assert.match(regoleCollaudo(col("bash tests/sql/harness/apply.sh && bash tests/sql/harness/run.sh"), ctxSql("node cervello/prova-rimessa.mjs --sql db")).rossi.join("\n"), /non è prova-rimessa\.mjs/);
  assert.match(regoleCollaudo(col("node cervello/prova-rimessa.mjs --comando 'x {prove}'"), ctxSql("node cervello/prova-rimessa.mjs --sql db")).rossi.join("\n"), /provata con --sql e il collaudo no/);
  assert.doesNotMatch(regoleCollaudo(col("node cervello/prova-rimessa.mjs --sql k01_rimessa"), ctxSql("node cervello/prova-rimessa.mjs --sql db")).rossi.join("\n"), /prova-rimessa|--sql/);
});

test("il controllo finale non dimentica nulla: conti è rosso per una voce senza decisione o aperta senza perché", () => {
  const c = mkdtempSync(join(tmpdir(), "riparazione-conti-"));
  try {
    const voci = [{ id: "R01-001", chiave: "a|uno", gravita: "minore", file: ["lib/a.ts"] }, { id: "R01-002", chiave: "a|due", gravita: "minore", file: ["lib/b.ts"] }];
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "sito", lavorabili: voci }));
    writeFileSync(join(c, "piano.json"), JSON.stringify({ casa: "sito", onde: [{ onda: 1, base: "0".repeat(40), candidate: voci.map((v) => v.chiave), sessioni: { R01: { voci, file: ["lib/a.ts", "lib/b.ts"] } }, rimandate: [], regia: [] }] }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "a", titolo: "uno", stato: "aperto", severita: "minore", file: "lib/a.ts" }, { dimensione: "a", titolo: "due", stato: "aperto", severita: "minore", file: "lib/b.ts" }] }));
    writeFileSync(join(c, "decisioni.json"), JSON.stringify({ decisioni: [{ id: "R01-001", chiave: "a|uno", esito: "parziale", decisione: "resta_aperta", perche: "" }] }));
    let r = lancia("conti", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /R01-002 \(R01, onda 1\): nessuna decisione/);
    assert.match(r.stdout, /R01-001: resta aperta senza il perché/);
    writeFileSync(join(c, "decisioni.json"), JSON.stringify({ decisioni: [
      { id: "R01-001", chiave: "a|uno", esito: "parziale", decisione: "resta_aperta", perche: "parziale: manca la carta" },
      { id: "R01-002", chiave: "a|due", esito: "riparato", decisione: "si_chiude", perche: "regge" },
    ] }));
    r = lancia("conti", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 0, r.stdout);
    // radiografia 12/11 notte: senza decisioni.json il controllo non è fatto, e conti non è verde
    rmSync(join(c, "decisioni.json"));
    r = lancia("conti", "--cartella", c, "--registro", registro);
    assert.equal(r.status, 3, r.stdout);
    assert.match(r.stdout, /decisioni\.json non c'è o è vuoto/);
  } finally { rmSync(c, { recursive: true, force: true }); }
});

// ── radiografia del 12/11 notte: i buchi trovati sulla guardia, sull'unione di prova e su applica ──────────
test("AR-1172 · radiografia 12/11 notte · una prova che passa al setaccio una cartella non è di chi possiede un file nominato", () => {
  const { dir, g, scrivi } = depositoFinto();
  scrivi("tests/unit/setaccio.test.ts", "import { readdirSync, readFileSync } from 'node:fs';\nconst tipi = readFileSync('lib/a.ts', 'utf8');\nfor (const f of readdirSync('lib')) it(f, () => { expect(tipi).toBeTruthy(); });\n");
  g("add", "-A"); g("commit", "-qm", "prova che setaccia");
  const base = g("rev-parse", "HEAD");
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/a.ts", "export const a = 2;\n");
    scrivi("tests/unit/setaccio.test.ts", "import { readdirSync, readFileSync } from 'node:fs';\nconst tipi = readFileSync('lib/a.ts', 'utf8');\nfor (const f of readdirSync('lib').filter((x) => x !== 'b.ts')) it(f, () => { expect(tipi).toBeTruthy(); });\n");
    g("add", "-A"); g("commit", "-qm", "R01-001 tolgo dal giro il file di R02");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /setaccio\.test\.ts: è una prova esistente che usa anche file di altre sessioni/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("AR-1172 · radiografia 12/11 notte · un aiutante delle prove importato da altre prove è comune, anche se nomina solo un file della sessione", () => {
  const { dir, g, scrivi } = depositoFinto();
  scrivi("tests/unit/aiuti/tavolozza.ts", "import { readFileSync } from 'node:fs';\nexport const contrastoOk = () => readFileSync('lib/a.ts', 'utf8').length > 0;\n");
  scrivi("tests/unit/usa-tavolozza.test.ts", "import { contrastoOk } from './aiuti/tavolozza';\nimport { b } from '../../lib/b';\nit('b', () => { expect(contrastoOk() && b).toBeTruthy(); });\n");
  g("add", "-A"); g("commit", "-qm", "aiutante e prova di R02");
  const base = g("rev-parse", "HEAD");
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/a.ts", "export const a = 2;\n");
    scrivi("tests/unit/aiuti/tavolozza.ts", "export const contrastoOk = () => true;\n");
    g("add", "-A"); g("commit", "-qm", "R01-001 svuoto l'aiutante");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /tavolozza\.ts: è una prova esistente che usa anche file di altre sessioni/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("AR-1172 · radiografia 12/11 notte · una prova SQL nuova che non finisce in .test.sql è rossa: run.sh e la CI non la lanciano", () => {
  const ctx = ctxBase();
  assert.match(String(giudicaPercorso("tests/sql/rls/riparazione-r03-tetto.sql", ctx)), /finisce in \.test\.sql/);
  assert.equal(giudicaPercorso("tests/sql/rls/riparazione-r03-tetto.test.sql", ctx), null);
});

test("AR-1172 · radiografia 12/11 notte · le prove spente con .skip.each, describe.skip.each e ctx.skip() si vedono", () => {
  for (const r of ["it.skip.each([[1]])('x', () => {})", "describe.skip.each`a`('x', () => {})", "test.only.each([1])('x', () => {})", "it('x', (ctx) => { ctx.skip(); })", "it('x', (context) => { context.skip() })"]) assert.ok(RE_SPENTA.test(r), r);
  for (const r of ["it.each([[1]])('x', () => {})", "skipList.push(1)"]) assert.ok(!RE_SPENTA.test(r), r);
});

test("AR-1172 · radiografia 12/11 notte · un'asserzione commentata non si conta: la prova svuotata così resta rossa", () => {
  assert.equal(contaAsserzioni("expect(a).toBe(1);\n// expect(b).toBe(2);\n/* assert.equal(c, 3) */\nconst u = 'http://x'; expect(u).toBeTruthy();"), 2);
});

test("AR-1172 · radiografia 12/11 notte · prova-unione guarda il diff netto: un file toccato e rimesso non fa rosso per due rami", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/b.ts", "export const b = 9;\n"); g("commit", "-qam", "R01-001 tocco b per sbaglio");
    scrivi("lib/b.ts", "export const b = 1;\n"); g("commit", "-qam", "R01-001 lo rimetto");
    scrivi("lib/a.ts", "export const a = 2;\n"); g("commit", "-qam", "R01-001 la riparazione");
    g("checkout", "-q", "-b", "r02", base);
    scrivi("lib/b.ts", "export const b = 2;\n"); g("commit", "-qam", "R02-001 la riparazione");
    const r = lancia("prova-unione", "--cartella", c, "--git", dir, "--onda", "1", "--refs", "R01=r01,R02=r02");
    assert.equal(r.status, 0, r.stdout);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("AR-1172 · radiografia 12/11 notte · applica rilancia la guardia del ramo: un ramo che tocca il file di un'altra sessione ferma tutto", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/a.ts", "export const a = 2;\n"); scrivi("lib/b.ts", "export const b = 7;\n");
    g("add", "-A"); g("commit", "-qm", "R01-001 la riparazione, e il file di R02");
    const testa = g("rev-parse", "HEAD");
    writeFileSync(join(c, "sessioni.json"), JSON.stringify({ sessioni: { R01: { onda: 1, ramo: "r01" } } }));
    const registro = join(c, "registro.json");
    writeFileSync(registro, JSON.stringify({ problemi: [{ dimensione: "x", titolo: "a", stato: "aperto", severita: "minore", file: "lib/a.ts:1" }] }));
    mkdirSync(join(c, "referti"));
    writeFileSync(join(c, "referti", "R01.json"), JSON.stringify({ sessione: "R01", aggiornato: "2026-11-13 10:00", finita: true, testa, verifica: { esito: "verde", testa }, voci: [{ id: "R01-001", chiave: "x|a", esito: "non_fatto", nota: "prova" }] }));
    const r = lancia("applica", "--cartella", c, "--git", dir, "--registro", registro);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /guardia-ramo: lib\/b\.ts: è un file di un'altra sessione/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("AR-1172 · radiografia 12/11 notte · deposito stampa il deposito giusto per la casa, ed esce 2 se non c'è", () => {
  const { dir, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    let r = lancia("deposito", "--cartella", c, "--git", dir);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), realpathSync(dir));
    r = lancia("deposito", "--cartella", c, "--git", join(dir, "non-c-e"));
    assert.equal(r.status, 2);
    writeFileSync(join(c, "perimetro.json"), JSON.stringify({ casa: "macchina", profilo: "tutto", lavorabili: [] }));
    r = lancia("deposito", "--cartella", c, "--radice", dir);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), realpathSync(dir));
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});
