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
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  fileDaCampoSito, fileDaSchedaMacchina, assegnaOnda, controllaOnda, giudicaPercorso, importDi,
  regoleReferto, regoleCollaudo, campioneDi, decidi, chiaviDoppie, classifica, CONDIVISI_MACCHINA,
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

test("dividi: nella stessa onda un file ha un padrone solo; chi si scontra con due sessioni passa all'onda dopo", () => {
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

test("guardia: i percorsi vietati si fermano, ognuno col suo perché", () => {
  const ctx = ctxBase();
  const casi = {
    "lib/altrui.ts": /altra sessione o di nessuno/,
    "tests/unit/.montati/1/x.mjs": /temporaneo/,
    ".prova-colonna-sparita/tsconfig.json": /temporaneo/,
    "tests/unit/minori-s03-x.test.ts": /porta il nome della sessione/,
    "tests/unit/estranea.test.ts": /non importa nessuno dei file/,
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

test("referto: riparato senza la prova rimessa che regge è rosso", () => {
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
  assert.match(rossi.join("\n"), /dettagli in chiaro/);
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
const refertoMinori = { sessione: "R03", voci: schedaMinori.map((v) => ({ id: v.id, chiave: v.chiave, esito: "riparato", rimessa: { uscita: 0, comando: "x" } })) };
const voceCollaudo = (v, extra = {}) => ({ id: v.id, chiave: v.chiave, verdetto: "regge", giudizio: "nessuno", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs …" }, ...extra });
const collaudo = (voci, extra = {}) => JSON.stringify({ collaudatore: "K01", riparatori: ["R03"], aggiornato: "2026-11-08 12:00", finita: true, voci, ...extra });
const ctxCollaudo = { nome: "K01", riparatori: { R03: { voci: schedaMinori, referto: refertoMinori } }, hub: new Set() };

test("collaudo: cinque minori su dieci guardati che reggono, campione accettato e verde", () => {
  const voci = schedaMinori.map((v, i) => voceCollaudo(v, i < 5 ? { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"] } : {}));
  const { rossi, campioni } = regoleCollaudo(collaudo(voci, { campione: { R03: { accettato: true } } }), ctxCollaudo);
  assert.deepEqual(rossi, []);
  assert.equal(campioni.R03.accettato, true);
});

test("collaudo: il campione dichiarato accettato sotto il 90% è rosso", () => {
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
  const ctx = { nome: "K01", riparatori: { R03: { voci: scheda, referto: { voci: [{ id: "R03-001", chiave: "g|1", esito: "riparato", rimessa: { uscita: 0, comando: "x" } }] } } }, hub: new Set() };
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
  const conGrave = (voci, giudizioGrave) => ({ collaudatore: "K01", voci: [...voci, { id: "R03-011", chiave: "g|1", verdetto: "regge", giudizio: giudizioGrave, rimessa: { uscita: 0, comando: "x" } }] });
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

test("guardia-ramo: un file altrui toccato e poi rimesso resta nella STORIA, e la guardia lo vede", () => {
  const { dir, g, scrivi, base } = depositoFinto();
  const c = cartellaCampagna(base);
  try {
    g("checkout", "-q", "-b", "r01", base);
    scrivi("lib/b.ts", "export const b = 2;\n"); g("commit", "-qam", "R01-001 tocco il file di R02");
    scrivi("lib/b.ts", "export const b = 1;\n"); g("commit", "-qam", "R01-001 lo rimetto com'era");
    scrivi("lib/a.ts", "export const a = 2;\n"); g("commit", "-qam", "R01-001 la riparazione");
    assert.equal(g("diff", "--name-only", base, "r01"), "lib/a.ts", "nel diff netto il file altrui non c'è più");
    const r = lancia("guardia-ramo", "r01", "R01", "--cartella", c, "--git", dir);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stdout, /lib\/b\.ts: è un file di un'altra sessione/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
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
    assert.match(r.stdout, /senza l'id della voce/);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(c, { recursive: true, force: true }); }
});

test("prova-unione: due rami sullo stesso file sono rossi, e l'unione che litiga lo dice; rami disgiunti verdi", () => {
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
