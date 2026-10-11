// AR-431 — «La mappa dei rischi dell'azienda è ferma al due luglio e nessuno controlla che sia
// fresca, mentre per la checklist e gli obiettivi il controllo c'è.»
//
// Il guardiano dei rischi c'è dal lotto 41 e gira nel giro. Ma il `fix_proposto` aveva un'ultima
// clausola — quella che salta sempre, perché arriva quando il lavoro sembra finito:
//
//   «E rendere la regola generale: ogni documento di governo (rischi, OKR, checklist, scadenzario,
//    glossario KPI) ha un guardiano di freschezza, e la lista sta in un posto solo.»
//
// È esattamente il quinto perché della scheda: «quando qui nasce una FAMIGLIA di controlli nessuno
// passa in rassegna tutti i documenti che dovrebbero entrarci — le famiglie crescono per incidenti,
// non per copertura». Senza la rassegna si aspetta il prossimo incidente per scoprire il prossimo
// documento scoperto.
//
// NON-VACUITÀ (eseguita): togliendo il guardiano allo scadenzario in documenti-di-governo.mjs
// (`guardiano: null`, senza un'attesa), il caso «la lista vera è coperta» diventa rosso, e con lui
// il caso AR-960 (mutazione registrata in cervello/mutanti.json, rilanciata l'11/10).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { DOCUMENTI, copertura, scoperti } from "../documenti-di-governo.mjs";
import { esenzioniMorte } from "../porte-gemelle.mjs";
import { dateGoverno, datePorte, problemiScadenze } from "../scadenze-del-cancello.mjs";

const CERVELLO = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(CERVELLO, "..");
const OGGI = Date.now();

/** I guardiani che esistono DAVVERO sul disco: dichiarare non è essere. */
const guardianiVeri = new Set(
  DOCUMENTI.map((d) => d.guardiano)
    .filter(Boolean)
    .filter((g) => existsSync(join(REPO, g)))
);

// ── ① Il guardiano dei rischi, quello del difetto, funziona e frena ─────────────────────────────

test("AR-431 — freschezza-rischi gira sul registro vero e sa dire di no", () => {
  const r = spawnSync(process.execPath, [join(CERVELLO, "freschezza-rischi.mjs"), "--json"], { encoding: "utf8", timeout: 60_000 });
  assert.notEqual(r.status, 2, `guardiano CIECO: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  assert.ok(j.controllati > 0, "zero rischi controllati sarebbe un verde per assenza di lavoro");
  assert.equal(j.ok, r.status === 0, "il verdetto stampato e il codice di uscita devono dire la stessa cosa");
});

test("AR-431 — e FRENA davvero: un registro fermo da un anno lo fa uscire rosso", () => {
  const dir = mkdtempSync(join(tmpdir(), "c9-rischi-"));
  const file = join(dir, "REGISTRO-RISCHI.json");
  writeFileSync(
    file,
    JSON.stringify({ aggiornato: "2025-08-15", rischi: [{ id: "R1", rischio: "cassa", gravita: "alta", owner: "finanza", ultima_revisione: "2025-08-15" }] })
  );
  const r = spawnSync(process.execPath, [join(CERVELLO, "freschezza-rischi.mjs")], { encoding: "utf8", env: { ...process.env, RISCHI_FILE: file }, timeout: 60_000 });
  assert.equal(r.status, 1, "un tetto mai superato è indistinguibile da un tetto scollegato: qui lo si supera apposta");
});

// ── ② L'ULTIMA CLAUSOLA: la lista sta in un posto solo, e la copertura si misura ────────────────

test("AR-431 — la lista dei documenti di governo esiste ed è quella nominata dalla scheda", () => {
  assert.deepEqual(
    DOCUMENTI.map((d) => d.id).sort(),
    ["checklist", "glossario-kpi", "okr", "rischi", "scadenzario"],
    "la scheda ne nomina cinque: se la lista ne perde uno, quella è di nuovo la famiglia che cresce per incidenti"
  );
});

// AR-960 — fino all'11/10 la voce scadenzario diceva «guardiano: null» e aspettava un controllo sulle
// scadenze scadute «da scrivere apposta». Esisteva dal 28/7: scadenzario-check.mjs. La lista
// guardava una copia nel Vault che nessuno legge. Qui non basta che il file del guardiano esista:
// lo si esegue, deve leggere proprio il documento che la lista dichiara, e deve fermarsi davanti a
// una scadenza aperta già passata.
test("AR-960 — il guardiano dichiarato legge il documento dichiarato, e FRENA su una scadenza aperta già passata", () => {
  const voce = DOCUMENTI.find((d) => d.id === "scadenzario");
  assert.ok(voce?.guardiano, "la voce scadenzario deve avere un guardiano, non un'attesa");
  assert.ok(existsSync(join(REPO, voce.guardiano)), `il guardiano dichiarato non esiste: ${voce.guardiano}`);
  assert.ok(existsSync(join(REPO, voce.documento)), `il documento dichiarato non esiste: ${voce.documento}`);

  // Il collaudo dell'11/10: un guardiano vero che sorveglia un ALTRO file è lo stesso buco di prima,
  // con un nome giusto sopra. Lo si chiede al guardiano, senza nessun registro iniettato.
  const envVero = { ...process.env };
  delete envVero.SCADENZARIO_REGISTRO;
  const vero = spawnSync(process.execPath, [join(REPO, voce.guardiano), "--json"], { encoding: "utf8", env: envVero, timeout: 60_000 });
  assert.notEqual(vero.status, 2, `il guardiano è cieco sul registro vero:\n${vero.stdout}${vero.stderr}`);
  assert.equal(JSON.parse(vero.stdout).registro, voce.documento, "il guardiano deve leggere il documento che la lista dichiara, non una sua copia");

  const dir = mkdtempSync(join(tmpdir(), "c9-scadenze-"));
  const registro = join(dir, "scadenzario.json");
  writeFileSync(
    registro,
    JSON.stringify({ aggiornato: "2026-01-01 09:00", scadenze: [{ id: "prova", titolo: "domanda di prova", scade: "2026-01-02T12:00:00+01:00", fonte: "prova" }], chiuse: [] })
  );
  const env = { ...process.env, SCADENZARIO_REGISTRO: registro, SCADENZARIO_FILE_VIVI: join(dir, "nessun-file.md") };
  const r = spawnSync(process.execPath, [join(REPO, voce.guardiano)], { encoding: "utf8", env, timeout: 60_000 });
  assert.equal(r.status, 1, `una scadenza aperta già passata deve far uscire 1 il guardiano dichiarato:\n${r.stdout}${r.stderr}`);

  // Il secondo collaudo dell'11/10: il campo `registro` deve dire il file letto DAVVERO, non
  // un'etichetta scritta fissa. Col registro iniettato deve nominare quello, non lo scadenzario vero.
  const letto = spawnSync(process.execPath, [join(REPO, voce.guardiano), "--json"], { encoding: "utf8", env, timeout: 60_000 });
  assert.equal(JSON.parse(letto.stdout).registro, relative(REPO, registro).split(sep).join("/"), "il guardiano deve dire quale file ha letto davvero");

  // E lanciato attraverso un collegamento simbolico alla cartella del repo deve frenare lo stesso: con
  // la guardia dell'entrypoint scritta sui nomi invece che sui percorsi veri usciva 0, muto.
  const collegamento = join(dir, "repo-collegato");
  symlinkSync(REPO, collegamento, "dir");
  const daCollegamento = spawnSync(process.execPath, [join(collegamento, voce.guardiano)], { encoding: "utf8", env, timeout: 60_000 });
  assert.equal(daCollegamento.status, 1, `dal collegamento il guardiano deve girare e frenare:\n${daCollegamento.stdout}${daCollegamento.stderr}`);

  // E chi lo IMPORTA non lo fa girare (AR-445). Col registro iniettato c'è una scadenza passata: se la
  // guardia d'avvio dicesse sempre «sì», il programma partirebbe dentro l'import e chiuderebbe chi lo
  // ha importato col suo process.exit(1). Il terzo collaudo l'ha visto: nessun'altra prova se ne accorge.
  const importatore = join(dir, "importatore.mjs");
  writeFileSync(importatore, `await import(${JSON.stringify(pathToFileURL(join(REPO, voce.guardiano)).href)});\nconsole.log("importato");\n`);
  const importato = spawnSync(process.execPath, [importatore], { encoding: "utf8", env, timeout: 60_000 });
  assert.equal(importato.status, 0, `importare il guardiano non deve farlo girare:\n${importato.stdout}${importato.stderr}`);
  assert.equal(importato.stdout.trim(), "importato", "chi importa il modulo deve restare vivo, e senza il rapporto del guardiano in mezzo");

  // E il contrario: chiusa, la stessa scadenza non è più un allarme. Un guardiano sempre rosso non frena niente.
  writeFileSync(registro, JSON.stringify({ aggiornato: "2026-01-01 09:00", scadenze: [], chiuse: [{ id: "prova", scade: "2026-01-02T12:00:00+01:00" }] }));
  const chiusa = spawnSync(process.execPath, [join(REPO, voce.guardiano)], { encoding: "utf8", env, timeout: 60_000 });
  assert.equal(chiusa.status, 0, `una scadenza chiusa non deve far uscire rosso il guardiano:\n${chiusa.stdout}${chiusa.stderr}`);
});

// AR-966 — il secondo collaudo dell'11/10: un'attesa che scade rende rossa la CI di tutti (è IL PUNTO,
// qui sotto), e prima nessuno avvisava: la data stava solo in questa lista, che il giro non legge. Così
// la CI è diventata rossa il 30/9 senza preavviso. Adesso ogni data che può far rosso un passo del
// cancello ha la sua voce nello scadenzario, che il giro sorveglia: l'avviso arriva tre giorni prima.
// Il sesto collaudo ha trovato la stessa trappola nel registro delle porte (un'esenzione fino al 15/10,
// porte-gemelle rosso per tutti dal 16): rinnovata, con la sua voce. Le date devono restare uguali, nei
// due versi — una copia che diverge è peggio di nessuna copia.
//
// L'ottavo collaudo ha mostrato che il collegamento per prefisso dell'id e per frase della fonte faceva
// rossa la CI per una scadenza del mondo che si chiamasse «esenzione-…», e lasciava passare un doppione
// con un altro nome. Adesso il collegamento è il campo `cancello`, confrontato per uguaglianza, e la
// regola sta in un modulo puro (`scadenze-del-cancello.mjs`) che qui si prova su dati finti e sui veri.
const scadenzarioVero = () => JSON.parse(readFileSync(join(REPO, "cervello/scadenzario.json"), "utf8"));
const portaFinta = (fino_al = "2026-11-14", file = "cervello/finto.mjs") => ({
  atti: [{ esenti: [{ file, perche: "uno script usa-e-getta già applicato", fino_al, natura: "temporanea", si_toglie_quando: "quando il file viene tolto dal repo" }] }],
});
const voce = (id, registro, chiave, scade) => ({ id, scade, ...(registro ? { cancello: { registro, chiave } } : {}) });

test("AR-966 — sui registri veri ogni data che fa rosso il cancello ha una voce sola nello scadenzario, con la stessa data", () => {
  const porte = JSON.parse(readFileSync(join(REPO, "cervello/atti-con-porte.json"), "utf8"));
  const date = [...dateGoverno(DOCUMENTI), ...datePorte(porte)];
  assert.deepEqual(problemiScadenze({ date, voci: scadenzarioVero().scadenze || [] }), []);
});

test("AR-966 — i confini sono quelli dei guardiani veri: un attimo prima verde, un attimo dopo rosso", () => {
  // Le porte: il confine di datePorte contro esenzioniMorte di porte-gemelle.
  const reg = portaFinta("2026-11-14");
  const [p] = datePorte(reg);
  assert.equal(p.confine, Date.UTC(2026, 10, 15), "un'esenzione fino al 14/11 cambia colore alla mezzanotte di Greenwich del 15");
  const porta = [{ file: "cervello/finto.mjs", stato: "scoperta" }];
  assert.deepEqual(esenzioniMorte(reg.atti[0], porta, new Date(p.confine - 1)), [], "un attimo prima del confine l'esenzione deve valere ancora");
  assert.equal(esenzioniMorte(reg.atti[0], porta, new Date(p.confine + 1)).length, 1, "un attimo dopo il confine porte-gemelle deve darla per scaduta");
  // Il governo: il confine di dateGoverno contro scoperti della lista.
  const doc = [{ id: "finto", documento: "x.json", guardiano: null, attesa: { fino: "2026-11-15", perche: "un controllo da costruire" } }];
  const [g] = dateGoverno(doc);
  assert.equal(g.confine, Date.UTC(2026, 10, 15));
  assert.deepEqual(scoperti(g.confine - 1, new Set(), doc), [], "un attimo prima del confine l'attesa deve valere ancora");
  assert.equal(scoperti(g.confine + 1, new Set(), doc).length, 1, "un attimo dopo il confine l'attesa deve essere un buco");
});

test("AR-966 — una scadenza del mondo senza `cancello` non c'entra, qualunque nome abbia", () => {
  const date = datePorte(portaFinta());
  const voci = [
    voce("esenzione-finto", "porte", "cervello/finto.mjs", "2026-11-15T01:00:00+01:00"),
    { id: "esenzione-imu-2027", scade: "2027-06-16T23:59:00+02:00", fonte: "una tassa, non il cancello: cervello/finto.mjs nominato per caso" },
    { id: "attesa-esito-bando-rifiuti", scade: "2026-12-01T12:00:00+01:00" },
  ];
  assert.deepEqual(problemiScadenze({ date, voci }), []);
});

test("AR-966 — il doppione si vede, con un altro id o con lo stesso, prima o dopo quella giusta", () => {
  const date = datePorte(portaFinta());
  const giusta = voce("esenzione-finto", "porte", "cervello/finto.mjs", "2026-11-15T01:00:00+01:00");
  const bis = voce("promemoria-finto", "porte", "cervello/finto.mjs", "2027-03-01T01:00:00+01:00");
  for (const voci of [[giusta, bis], [bis, giusta]]) {
    const pr = problemiScadenze({ date, voci });
    assert.equal(pr.length, 1, JSON.stringify(pr));
    assert.match(pr[0], /ne serve una sola/);
  }
  const stessoId = problemiScadenze({ date, voci: [giusta, { ...giusta }] });
  assert.ok(stessoId.some((x) => /stesso id/.test(x)), JSON.stringify(stessoId));
});

test("AR-966 — la voce orfana, la data che diverge e la data scritta male si vedono", () => {
  const orfana = problemiScadenze({ date: [], voci: [voce("esenzione-finto", "porte", "cervello/finto.mjs", "2026-11-15T01:00:00+01:00")] });
  assert.equal(orfana.length, 1);
  assert.match(orfana[0], /non c'è più/);
  const unOraDopo = problemiScadenze({ date: datePorte(portaFinta()), voci: [voce("esenzione-finto", "porte", "cervello/finto.mjs", "2026-11-15T02:00:00+01:00")] });
  assert.equal(unOraDopo.length, 1);
  assert.match(unOraDopo[0], /cambia colore/);
  const manca = problemiScadenze({ date: datePorte(portaFinta()), voci: [] });
  assert.equal(manca.length, 1);
  assert.match(manca[0], /senza preavviso/);
  const scrittaMale = problemiScadenze({ date: datePorte(portaFinta("2026-11-14T10:00")), voci: [] });
  assert.equal(scrittaMale.length, 1);
  assert.match(scrittaMale[0], /AAAA-MM-GG/);
});

test("AR-431 — IL PUNTO: sulla lista vera nessun documento di governo è scoperto in silenzio", () => {
  const c = copertura(OGGI, guardianiVeri);
  assert.deepEqual(
    c.buchi.map((b) => `${b.id}: ${b.motivo}`),
    [],
    "un documento senza guardiano e senza un'attesa datata col perché è un'omissione, e nessuno la vede"
  );
});

test("AR-431 — un documento senza guardiano e senza attesa è un BUCO", () => {
  const b = scoperti(OGGI, new Set(), [{ id: "x", documento: "y.json", guardiano: null }]);
  assert.equal(b.length, 1);
  assert.match(b[0].motivo, /omissione/);
});

test("AR-431 — un'attesa con la data ma senza il perché non vale: un'etichetta non è una ragione", () => {
  const b = scoperti(OGGI, new Set(), [{ id: "x", documento: "y.json", guardiano: null, attesa: { fino: "2099-01-01", perche: "" } }]);
  assert.equal(b.length, 1);
  assert.match(b[0].motivo, /perché/);
});

test("AR-431 — LA REGOLA CHE CONTA: passata la data, l'attesa torna a essere un buco", () => {
  const doc = [{ id: "x", documento: "y.json", guardiano: null, attesa: { fino: "2026-01-01", perche: "arriva col lotto dopo" } }];
  assert.equal(scoperti(Date.UTC(2025, 11, 1), new Set(), doc).length, 0, "prima della scadenza l'attesa è legittima");
  assert.equal(scoperti(Date.UTC(2026, 5, 1), new Set(), doc).length, 1, "un'attesa senza fine è un'esenzione travestita");
});

test("AR-431 — dichiarare un guardiano che non esiste non salva nessuno", () => {
  const b = scoperti(OGGI, new Set(), [{ id: "x", documento: "y.json", guardiano: "cervello/mai-nato.mjs" }]);
  assert.equal(b.length, 1);
  assert.match(b[0].motivo, /non esiste/);
});
