// Le prove del programma della radiografia in sessioni (cervello/radiografia-sessioni.mjs).
// Ogni regola che deve reggere ha qui una prova che diventa rossa senza di lei; le mutazioni che lo dimostrano
// stanno in cervello/mutanti.json (difetto `radiografia-in-sessioni`).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { esegui, regoleReferto, trovaDoppioni, applicaAlRegistro, calcolaPreventivo, lottiDiFile, spezza } from "../radiografia-sessioni.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE_VERA = join(QUI, "..", "..");
const TEMI = join(RADICE_VERA, "cervello/radiografia/temi.json");
const DIM = join(RADICE_VERA, "cervello/dimensioni-radiografia.json");
const sh = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } }).trim();
const righe = (n, testo = "x") => Array.from({ length: n }, (_, i) => `// ${testo} ${i + 1}`).join("\n") + "\n";

function silenzio(fn) {
  const log = console.log, err = console.error;
  const out = [];
  console.log = (...a) => out.push(a.join(" "));
  console.error = (...a) => out.push(a.join(" "));
  try { return { codice: fn(), out: out.join("\n") }; } finally { console.log = log; console.error = err; }
}

// ── il banco: un sito finto, un registro finto, una casa finta con i rami ─────────────────────────
function banco({ minori = 101 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "rad-sess-"));
  const sito = join(dir, "sito"), ad = join(dir, "ad");
  mkdirSync(sito); mkdirSync(ad);
  sh(sito, "init", "-q");
  const file = {
    "app/api/orders/cod/route.ts": righe(50), "lib/cassa/riquadro.ts": righe(120), "lib/stripe/addebito.ts": righe(30),
    "app/page.tsx": righe(20), "components/Bottone.tsx": righe(20), "lib/auth/sessione.ts": righe(40),
    "supabase/migrations/001_base.sql": righe(10), "lib/email/templates.ts": righe(30), "app/seller/page.tsx": righe(25),
    "tests/unit/cassa.test.ts": righe(10), "README.md": "# sito\n", "package.json": "{}\n", "public/logo.png": "png\n",
  };
  for (const [p, t] of Object.entries(file)) { mkdirSync(join(sito, dirname(p)), { recursive: true }); writeFileSync(join(sito, p), t); }
  sh(sito, "add", "-A"); sh(sito, "commit", "-q", "-m", "base");
  const base = sh(sito, "rev-parse", "HEAD");
  const problemi = [
    ...Array.from({ length: minori }, (_, i) => ({ dimensione: "frontend-ux", titolo: `Minore aperto numero ${i}`, severita: "minore", file: "app/page.tsx:3", stato: "aperto" })),
    { dimensione: "pagamenti-stripe", titolo: "La cassa perde un centesimo negli arrotondamenti", severita: "grave", file: "lib/cassa/riquadro.ts:10-12", stato: "aperto" },
    { dimensione: "qa-flussi", titolo: "Il riepilogo ordine mostra lo stato sbagliato dopo annullamento", severita: "grave", file: "app/api/orders/cod/route.ts:30", stato: "riparato" },
    { dimensione: "sicurezza-auth", titolo: "Falla di sicurezza R300 da chiudere (accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa", severita: "grave", file: "(nel referto privato)", stato: "aperto" },
  ];
  const registro = join(dir, "registro.json");
  writeFileSync(registro, JSON.stringify({ problemi }, null, 2));
  sh(ad, "init", "-q"); writeFileSync(join(ad, "LEGGIMI.txt"), "casa\n"); sh(ad, "add", "-A"); sh(ad, "commit", "-q", "-m", "casa");
  const cartella = join(ad, "consegne/radiografia/prova");
  const comuni = ["--radice", ad, "--sito", sito, "--registro", registro, "--temi-file", TEMI, "--dimensioni", DIM, "--cartella", cartella];
  const lancia = (cmd, ...a) => silenzio(() => esegui([cmd, ...a, ...comuni]));
  return { dir, sito, ad, base, registro, cartella, lancia, pulisci: () => rmSync(dir, { recursive: true, force: true }) };
}

function prontoConSchede(b, profilo = "lancio") {
  assert.equal(b.lancia("prepara", "--profilo", profilo, "--base", b.base).codice, 0);
  assert.equal(b.lancia("schede", "--ramo", "claude/prova", "--regista", "session_REGISTA").codice, 0);
  return JSON.parse(readFileSync(join(b.cartella, "piano.json"), "utf8"));
}

// ── prepara: la regola dei minori (⑳) e i lotti ──────────────────────────────────────────────────
test("⑳ con più di 100 minori aperti il piano non ammette minori nuovi, nemmeno nel profilo «tutto»", () => {
  const b = banco({ minori: 101 });
  try {
    const piano = prontoConSchede(b, "tutto");
    assert.equal(piano.minori_aperti, 101);
    assert.equal(piano.minori_ammessi, false);
    assert.deepEqual(piano.gravita_cercate, ["bloccante", "grave"]);
  } finally { b.pulisci(); }
});
test("⑳ con 100 minori aperti o meno il profilo «tutto» li ammette", () => {
  const b = banco({ minori: 100 });
  try {
    const piano = prontoConSchede(b, "tutto");
    assert.equal(piano.minori_ammessi, true);
    assert.ok(piano.gravita_cercate.includes("minore"));
  } finally { b.pulisci(); }
});
test("il profilo lancio lascia fuori l'aspetto e lo dichiara: le lenti fuori si dicono, non spariscono", () => {
  const b = banco();
  try {
    const piano = prontoConSchede(b, "lancio");
    assert.ok(!Object.values(piano.sessioni).some((s) => s.tema === "S10"));
    assert.ok(piano.lenti_fuori.includes("tipografia"));
    assert.equal(piano.voci_da_ricontrollare, 1, "S01 ricontrolla solo il grave aperto non riservato");
    assert.equal(b.lancia("copertura-prima").codice, 0);
    assert.equal(b.lancia("segnaposti").codice, 0);
  } finally { b.pulisci(); }
});
test("lotti e spezzatura: un tema oltre gli otto lotti diventa S06 e S06b", () => {
  const file = Array.from({ length: 20 }, (_, i) => ({ f: `lib/x/${i}.ts`, byte: 100 * 1024 }));
  const lotti = lottiDiFile(file, 300);
  assert.equal(lotti.length, 7);
  assert.deepEqual(spezza("S06", Array.from({ length: 10 }, () => ({})), 8).map((x) => x.id), ["S06", "S06b"]);
});

// ── copertura-prima: le schede non si ritoccano, ogni file sta in un lotto ───────────────────────
test("copertura-prima è rossa se una scheda è ritoccata a mano (una lente tolta)", () => {
  const b = banco();
  try {
    prontoConSchede(b);
    const p = join(b.cartella, "schede/S02.md");
    writeFileSync(p, readFileSync(p, "utf8").replace("- `qa-flussi`\n", ""));
    const { codice, out } = b.lancia("copertura-prima");
    assert.equal(codice, 1);
    assert.match(out, /ritocca a mano/);
  } finally { b.pulisci(); }
});
test("copertura-prima è rossa se un file del tema manca dal suo lotto", () => {
  const b = banco();
  try {
    prontoConSchede(b);
    const p = join(b.cartella, "lotti/S02.txt");
    writeFileSync(p, readFileSync(p, "utf8").split("\n").filter((r) => !r.endsWith("lib/cassa/riquadro.ts")).join("\n"));
    const { codice, out } = b.lancia("copertura-prima");
    assert.equal(codice, 1);
    assert.match(out, /lib\/cassa\/riquadro\.ts: è del tema S02, ma non sta in nessun suo lotto/);
  } finally { b.pulisci(); }
});

// ── valida-referto: le regole del referto, sul piano vero del banco ─────────────────────────────
const LENTI = new Set(JSON.parse(readFileSync(DIM, "utf8")).case.marketplace.dimensioni);
function ctxDi(piano, nome, extra = {}) {
  return { piano, nome, sessione: piano.sessioni[nome], lenti: LENTI, registro: null, daRicontrollare: null, righeDi: (p) => (p.startsWith("lib/") || p.startsWith("app/") ? 200 : null), ...extra };
}
const pianoFinto = (minori_ammessi = false) => ({
  base: "a".repeat(40), minori_ammessi, minori_aperti: 726, soglia_minori: 100,
  gravita_cercate: minori_ammessi ? ["bloccante", "grave", "minore"] : ["bloccante", "grave"],
  sessioni: { S02: { tema: "S02", lenti: ["pagamenti-stripe"], prefissi: [], tetto: 12, lotti: [{ id: "L01" }, { id: "L02" }] } },
});
const grave = (o = {}) => ({
  id: "S02-001", trovato_da: "L01", dimensione: "pagamenti-stripe", titolo: "Il riquadro conta due volte il reso", severita: "grave",
  file: "lib/cassa/riquadro.ts:10-12", descrizione: "d", impatto: "i", fix: "f", causa_radice: "c", prova: "npx vitest run x",
  prova_tipo: "comando", prova_eseguita: true, esito_prova: "rosso", perche_umano: null, verificato: true,
  verificato_da: "qa nuovo: rilanciata, rossa", gia_noto: null, perimetro_altrui: null, riservato: false, ...o,
});
const referto = (o = {}) => ({
  sessione: "S02", base_sito: "a".repeat(40), aggiornato: "2026-11-20 10:40", finita: true,
  lotti: [{ id: "L01", esito: "fatto", perche: null }, { id: "L02", esito: "fatto", perche: null }],
  copertura: { file_letti_interi: ["lib/cassa/riquadro.ts"], file_letti_in_parte: [], file_eseguiti: [], non_guardato: [] },
  difetti: [grave()], scartati: [], regressioni: [], ricontrolli: [], prove_per_la_palestra: [], domande_per_nicola: [],
  conto: { agenti: 3, permesso_regista: null }, ...o,
});
const rossiDi = (r, piano = pianoFinto()) => regoleReferto(r, ctxDi(piano, "S02"));

test("un referto finito in regola è verde", () => {
  const { rossi, attese } = rossiDi(referto());
  assert.deepEqual(rossi, []);
  assert.deepEqual(attese, []);
});
test("⑳ un minore nuovo è rosso quando la radiografia non ammette minori", () => {
  const min = grave({ id: "S02-002", severita: "minore", prova_tipo: "lettura-codice", verificato: false, verificato_da: null });
  const { rossi } = rossiDi(referto({ difetti: [grave(), min] }));
  assert.ok(rossi.some((x) => x.includes("regola ⑳")), rossi.join("\n"));
});
test("⑳ una falla riservata entra anche se minore", () => {
  const ris = { id: "S02-002", trovato_da: "L02", riservato: true, titolo: "Falla di sicurezza da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa", file: "(nel referto privato)", severita: "minore", dimensione: "pagamenti-stripe", prova_tipo: "comando", prova_eseguita: true, verificato: true, verificato_da: "(nel referto privato)" };
  const { rossi } = rossiDi(referto({ difetti: [grave(), ris] }));
  assert.deepEqual(rossi, []);
});
test("⑲ un minore verificato da un secondo agente è rosso (quando i minori sono ammessi)", () => {
  const min = grave({ id: "S02-002", severita: "minore", prova_tipo: "lettura-codice", verificato: true });
  const { rossi } = rossiDi(referto({ difetti: [grave(), min] }), pianoFinto(true));
  assert.ok(rossi.some((x) => x.includes("regola ⑲")), rossi.join("\n"));
  const ok = grave({ id: "S02-002", severita: "minore", prova_tipo: "lettura-codice", verificato: false, verificato_da: null });
  assert.deepEqual(rossiDi(referto({ difetti: [grave(), ok] }), pianoFinto(true)).rossi, []);
});
test("⑲ a referto finito un grave senza verificatore è rosso, e chi trova non conferma", () => {
  assert.ok(rossiDi(referto({ difetti: [grave({ verificato: false })] })).rossi.some((x) => x.includes("verificato da un altro agente")));
  assert.ok(rossiDi(referto({ difetti: [grave({ verificato_da: "L01 ha riguardato" })] })).rossi.some((x) => x.includes("chi trova non conferma")));
});
test("l'asticella: un grave a sola lettura del codice è rosso a referto finito, in attesa su un parziale", () => {
  const g = grave({ prova_tipo: "lettura-codice", prova_eseguita: false });
  assert.ok(rossiDi(referto({ difetti: [g] })).rossi.some((x) => x.includes("prova a comando")));
  const parz = rossiDi(referto({ finita: false, difetti: [g] }));
  assert.ok(!parz.rossi.some((x) => x.includes("prova a comando")));
  assert.ok(parz.attese.some((x) => x.includes("prova a comando")));
});
test("nessun difetto sparito: un buco negli id è rosso, uno scartato col perché lo chiude", () => {
  const r = referto({ difetti: [grave(), grave({ id: "S02-003", titolo: "Un altro" })] });
  assert.ok(rossiDi(r).rossi.some((x) => x.startsWith("id spariti") && x.includes("S02-002")));
  r.scartati = [{ id: "S02-002", perche: "smentito: il reso si sottrae alla riga 120" }];
  assert.deepEqual(rossiDi(r).rossi, []);
});
test("⑱ oltre il tetto dei subagenti senza il permesso della regista è rosso", () => {
  assert.ok(rossiDi(referto({ conto: { agenti: 13, permesso_regista: null } })).rossi.some((x) => x.includes("regola ⑱")));
  assert.deepEqual(rossiDi(referto({ conto: { agenti: 13, permesso_regista: "sì della regista alle 11:02" } })).rossi, []);
});
test("a referto finito ogni lotto è dichiarato: un lotto saltato in silenzio è rosso", () => {
  const { rossi } = rossiDi(referto({ lotti: [{ id: "L01", esito: "fatto", perche: null }] }));
  assert.ok(rossi.some((x) => x.includes("lotti non ancora dichiarati: L02")));
});
test("una riservata con un campo in più o col titolo fuori forma è rossa", () => {
  const base = { id: "S02-001", trovato_da: "L01", riservato: true, titolo: "Falla di sicurezza da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa", file: "(nel referto privato)", severita: "grave", dimensione: "pagamenti-stripe", prova_tipo: "comando", prova_eseguita: true, verificato: true, verificato_da: "(nel referto privato)" };
  assert.deepEqual(rossiDi(referto({ difetti: [base] })).rossi, []);
  assert.ok(rossiDi(referto({ difetti: [{ ...base, descrizione: "la rotta /api/x si apre a tutti" }] })).rossi.some((x) => x.includes("campi in più")));
  assert.ok(rossiDi(referto({ difetti: [{ ...base, titolo: "Falla di sicurezza da chiudere (webhook senza firma): i dettagli restano fuori dal deposito pubblico finché non è chiusa" }] })).rossi.some((x) => x.includes("titolo di una riservata")));
});
test("un prefisso non ammesso dal tema è rosso (live: in S02)", () => {
  const g = grave({ file: "live:https://www.mycity-marketplace.com/" });
  assert.ok(rossiDi(referto({ difetti: [g] })).rossi.some((x) => x.includes("«live:» non è ammesso in S02")));
});

// ── guardia-ramo ─────────────────────────────────────────────────────────────────────────────────
test("guardia-ramo: verde col solo referto, rossa con un file in più", () => {
  const b = banco();
  try {
    prontoConSchede(b);
    sh(b.ad, "add", "-A"); sh(b.ad, "commit", "-q", "-m", "regista");
    const partenza = sh(b.ad, "rev-parse", "HEAD");
    writeFileSync(join(b.cartella, "sessioni.json"), JSON.stringify({ regista: "x", sessioni: { S02: { ramo: "claude/prova-s02", onda: 1, partenza } } }));
    sh(b.ad, "checkout", "-q", "-b", "claude/prova-s02", partenza);
    mkdirSync(join(b.cartella, "referti"), { recursive: true });
    writeFileSync(join(b.cartella, "referti/S02.json"), "{}\n");
    sh(b.ad, "add", join(b.cartella, "referti/S02.json")); sh(b.ad, "commit", "-q", "-m", "referto");
    sh(b.ad, "update-ref", "refs/remotes/origin/claude/prova-s02", sh(b.ad, "rev-parse", "HEAD"));
    assert.equal(b.lancia("guardia-ramo", "claude/prova-s02", "S02").codice, 0);
    writeFileSync(join(b.ad, "appunti.tmp"), "x\n");
    sh(b.ad, "add", "appunti.tmp"); sh(b.ad, "commit", "-q", "-m", "appunti");
    sh(b.ad, "update-ref", "refs/remotes/origin/claude/prova-s02", sh(b.ad, "rev-parse", "HEAD"));
    const { codice, out } = b.lancia("guardia-ramo", "claude/prova-s02", "S02");
    assert.equal(codice, 1);
    assert.match(out, /appunti\.tmp/);
  } finally { b.pulisci(); }
});

// ── doppioni, grezzo, conti ──────────────────────────────────────────────────────────────────────
test("doppioni: stessa chiave del registro esce, due sessioni sullo stesso punto diventano un gruppo", () => {
  const registro = [{ chiave: "pagamenti-stripe|la cassa perde un centesimo negli arrotondamenti", stato: "aperto", titolo: "La cassa perde un centesimo negli arrotondamenti", file: "lib/cassa/riquadro.ts:10-12" }];
  const difetti = [
    { sessione: "S02", d: grave({ id: "S02-001", titolo: "La cassa perde un centesimo negli arrotondamenti" }) },
    { sessione: "S02", d: grave({ id: "S02-002", titolo: "Il reso parziale viene contato due volte nel riquadro", file: "lib/cassa/riquadro.ts:80-90" }) },
    { sessione: "S06", d: grave({ id: "S06-001", titolo: "Reso parziale contato due volte nel riquadro della cassa", file: "lib/cassa/riquadro.ts:85", prova_tipo: "lettura-codice" }) },
  ];
  const e = trovaDoppioni(difetti, registro);
  assert.deepEqual(e.nel_registro.map((x) => x.id), ["S02-001"]);
  assert.equal(e.gruppi.length, 1);
  assert.equal(e.gruppi[0].tenuto, "S02-002", "si tiene la prova più forte");
  assert.deepEqual(e.gruppi[0].uniti, ["S06-001"]);
});
test("conti: verde quando ogni difetto è nel grezzo o fra i doppioni, rosso se uno sparisce", () => {
  const b = banco();
  try {
    prontoConSchede(b);
    mkdirSync(join(b.cartella, "referti"), { recursive: true });
    const r2 = referto({ base_sito: b.base, difetti: [grave(), grave({ id: "S02-002", titolo: "La cassa perde un centesimo negli arrotondamenti" })] });
    writeFileSync(join(b.cartella, "referti/S02.json"), JSON.stringify(r2));
    assert.equal(b.lancia("doppioni").codice, 0);
    assert.equal(b.lancia("grezzo", "--data", "2026-11-20").codice, 0);
    const c1 = b.lancia("conti");
    assert.ok(!/sparito/.test(c1.out), c1.out);
    const gp = join(b.cartella, "grezzo.json");
    const g = JSON.parse(readFileSync(gp, "utf8"));
    g.dimensioni.forEach((d) => { d.findings = d.findings.filter((f) => f.id_sessione !== "S02-001"); });
    writeFileSync(gp, JSON.stringify(g));
    const c2 = b.lancia("conti");
    assert.equal(c2.codice, 1);
    assert.match(c2.out, /S02-001: trovato, ma non è né nel grezzo/);
  } finally { b.pulisci(); }
});

// ── applica e preventivo ─────────────────────────────────────────────────────────────────────────
test("applica: chiudere un grave vuole il verificatore; la chiave che non aggancia è rossa", () => {
  const problemi = [{ dimensione: "pagamenti-stripe", titolo: "La cassa perde un centesimo", severita: "grave", stato: "aperto" }];
  const k = { chiave: "pagamenti-stripe|la cassa perde un centesimo", esito: "non_piu_vero", prova: "npx vitest run x", prova_tipo: "comando", prova_eseguita: true, esito_prova: "verde" };
  const senza = applicaAlRegistro(problemi, [{ nome: "S01", r: { ricontrolli: [k] } }], { data: "2026-11-20", base: "b", ora: "2026-11-20 10:00" });
  assert.equal(senza.problemi[0].stato, "aperto");
  const con = applicaAlRegistro(problemi, [{ nome: "S01", r: { ricontrolli: [{ ...k, verificato: true, verificato_da: "qa nuovo" }] } }], { data: "2026-11-20", base: "b", ora: "2026-11-20 10:00" });
  assert.equal(con.problemi[0].stato, "gia_riparato_prima");
  assert.ok(con.problemi[0].riverifica_20_11);
  const storta = applicaAlRegistro(problemi, [{ nome: "S01", r: { ricontrolli: [{ ...k, chiave: "x|y" }] } }], { data: "2026-11-20", base: "b", ora: "2026-11-20 10:00" });
  assert.ok(storta.rossi.some((x) => x.includes("aggancia 0 voci")));
});
test("preventivo: oltre 2 milioni di token serve la firma", () => {
  const T = JSON.parse(readFileSync(TEMI, "utf8"));
  const piano = { onde: [["S02"]], sessioni: { S02: { lotti: [{}, {}, {}] } } };
  const p = calcolaPreventivo(piano, T.stima);
  assert.equal(p.lotti, 3);
  assert.equal(p.serve_firma, p.token > 2000000);
  assert.ok(p.usd > 0);
});
