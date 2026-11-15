// AR-962 — «Nessun controllo confronta i numeri che il codice chiama KPI con le definizioni del glossario.»
//
// La lista dei documenti di governo dava al glossario dei KPI un'attesa datata invece di un guardiano.
// È scaduta il 30/9, poi il 15/11: dalle 01:00 la CI era rossa per tutti. Nicola ha scelto di costruire
// il controllo. Il fix_proposto aveva tre clausole: ① un registro dei KPI usati dal codice (nome, file,
// funzione); ② un guardiano che fallisce se un KPI del registro non ha la sua riga nel glossario, o se il
// codice ne espone uno fuori registro; ③ cablarlo nel giro e nella lista, togliendo l'attesa.
//
// COSA PROVA, in quest'ordine:
//   · la funzione pura (`verificaGlossarioKpi`, in glossario-kpi.mjs) su dati finti: verde quando tutto torna, rossa per ogni
//     modo in cui un numero può uscire senza definizione, cieca quando una vetrina non si misura;
//   · il guardiano vero sul registro vero: esce 0, e legge il glossario che la lista dichiara;
//   · la variante SCOMODA, quella che capita da sola: il codice del Pannello comincia a consegnare un
//     numero nuovo e nessuno tocca il registro. Si prova su una COPIA di pannello/src (scorciatoia 35:
//     mai mutare i file veri da una prova), e il guardiano deve dire quale campo è fuori registro;
//   · il guardiano FALLISCE su un KPI del codice la cui riga sparisce dal glossario;
//   · il cablaggio: la lista lo nomina come guardiano senza attesa, il giro lo esegue e conta il vincolo.
//
// NON-VACUITÀ: undici mutazioni in cervello/mutanti.json (difetto AR-962), eseguite il 15/11/2026: ognuna
// rompe un pezzo del fix e questa prova diventa rossa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { NATURE, terminiDelGlossario, verificaGlossarioKpi } from "../glossario-kpi.mjs";
import { DOCUMENTI } from "../documenti-di-governo.mjs";
import { guardianiDiGiro } from "../censimento-guardiani.mjs";

const CERVELLO = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(CERVELLO, "..");
const GUARDIANO = join(CERVELLO, "glossario-kpi-check.mjs");
const REGISTRO_VERO = join(CERVELLO, "kpi-registro.json");
const ROTTA = "pannello/src/app/api/metriche/route.ts";

/** Il guardiano vero, lanciato pulito: nessuna delle porte per le prove resta aperta per sbaglio. */
function lancia(env = {}, argomenti = ["--json"], script = GUARDIANO) {
  const base = { ...process.env };
  for (const k of ["KPI_REGISTRO_FILE", "GLOSSARIO_KPI_FILE", "KPI_PANNELLO_SRC"]) delete base[k];
  const r = spawnSync(process.execPath, [script, ...argomenti], { encoding: "utf8", env: { ...base, ...env }, timeout: 120_000 });
  let j = null;
  try {
    j = JSON.parse(r.stdout);
  } catch {}
  return { ...r, j };
}

// ── La funzione pura, su un registro finto ───────────────────────────────────────────────────────

const registroFinto = () => ({
  esposizioni: [{ id: "vetrina", non_kpi: [{ campo: "collegato", natura: "flag", perche: "interruttore" }] }],
  kpi: [{ id: "ordini", nome: "Ordini", glossario: "ordini", file: "x.ts", funzione: "f", esposizioni: ["vetrina"], campi: ["ordini_oggi", "ordini_7g"] }],
});
const terminiFinti = () => new Map([["ordini", "ordini non falliti nella finestra"]]);
const espostiFinti = () => ({ vetrina: { ok: true, campi: { collegato: true, ordini_oggi: 3, ordini_7g: 9 } } });
const tipi = (r) => r.problemi.map((p) => p.tipo);

test("AR-962 — il glossario si legge per righe di tabella: il termine è il grassetto in testa, la definizione la seconda colonna", () => {
  const t = terminiDelGlossario(
    [
      "| Termine | Definizione | Stato |",
      "|---|---|---|",
      "| **Cliente attivo** | ha fatto ≥1 ordine | ok |",
      "| **incasso / GMV** (oggi/7g/30g) | somma `total_price` dei PAID | solo PAID |",
      "| D1 | **Cliente dormiente** | 90g | 30g | quale? |",
      "testo con **ordini** fuori da una tabella",
    ].join("\n")
  );
  assert.deepEqual([...t.keys()], ["Cliente attivo", "incasso / GMV"]);
  assert.equal(t.get("incasso / GMV"), "somma `total_price` dei PAID");
});

test("AR-962 — quando ogni campo ha il suo KPI e ogni KPI la sua riga, è verde", () => {
  const r = verificaGlossarioKpi({ registro: registroFinto(), termini: terminiFinti(), esposti: espostiFinti(), puntatori: { "x.ts#f": { ok: true, esiste: true } } });
  assert.deepEqual(r.problemi, []);
  assert.equal(r.esito, 0);
});

test("AR-962 — un KPI senza la sua riga nel glossario è ROSSO, e lo è anche con la riga vuota", () => {
  const senza = verificaGlossarioKpi({ registro: registroFinto(), termini: new Map(), esposti: espostiFinti() });
  assert.equal(senza.esito, 1);
  assert.deepEqual(tipi(senza), ["senza-glossario"]);
  assert.equal(senza.problemi[0].kpi, "ordini");
  assert.match(senza.problemi[0].messaggio, /nel glossario non c'è/, "una riga che manca va detta come mancante, non come vuota");
  const vuota = verificaGlossarioKpi({ registro: registroFinto(), termini: new Map([["ordini", " — "]]), esposti: espostiFinti() });
  assert.deepEqual(tipi(vuota), ["senza-glossario"]);
  assert.match(vuota.problemi[0].messaggio, /definizione è vuota/);
});

test("AR-962 — un numero che il codice consegna fuori registro è ROSSO, e il messaggio dice quale", () => {
  const esposti = espostiFinti();
  esposti.vetrina.campi.margine_nuovo = 4.2;
  const r = verificaGlossarioKpi({ registro: registroFinto(), termini: terminiFinti(), esposti });
  assert.equal(r.esito, 1);
  assert.deepEqual(tipi(r), ["fuori-registro"]);
  assert.equal(r.problemi[0].campo, "margine_nuovo");
});

test("AR-962 — un campo del registro che il codice non consegna più è un fantasma, ed è rosso", () => {
  const esposti = espostiFinti();
  delete esposti.vetrina.campi.ordini_7g;
  const r = verificaGlossarioKpi({ registro: registroFinto(), termini: terminiFinti(), esposti });
  assert.deepEqual(tipi(r), ["fantasma"]);
  assert.equal(r.problemi[0].campo, "ordini_7g");
});

test("AR-962 — un numero non si nasconde fra i non-KPI dichiarandolo flag: la natura si misura sul valore", () => {
  const esposti = espostiFinti();
  esposti.vetrina.campi.collegato = 12;
  const r = verificaGlossarioKpi({ registro: registroFinto(), termini: terminiFinti(), esposti });
  assert.deepEqual(tipi(r), ["natura"]);
  // Una natura dichiarata numerica, col perché, invece passa: è una scelta scritta, non un travestimento.
  const reg = registroFinto();
  reg.esposizioni[0].non_kpi[0].natura = "soglia";
  assert.equal(verificaGlossarioKpi({ registro: reg, termini: terminiFinti(), esposti }).esito, 0);
  assert.ok(Object.hasOwn(NATURE, "soglia"));
});

test("AR-962 — una vetrina che non si è potuta eseguire è CIECA, non verde", () => {
  const r = verificaGlossarioKpi({ registro: registroFinto(), termini: terminiFinti(), esposti: { vetrina: { ok: false, perche: "node vecchio" } } });
  assert.equal(r.esito, 2);
  assert.deepEqual(r.problemi, []);
  assert.match(r.ciechi[0].perche, /node vecchio/);
});

test("AR-962 — togliere una vetrina dal registro, insieme ai suoi KPI, non la toglie dal controllo", () => {
  const reg = { esposizioni: [], kpi: [] };
  const r = verificaGlossarioKpi({ registro: reg, termini: terminiFinti(), esposti: {}, vetrineNote: ["vetrina"] });
  assert.equal(r.esito, 1);
  assert.ok(r.problemi.some((p) => p.esposizione === "vetrina" && /sa eseguire/.test(p.messaggio)), JSON.stringify(r.problemi));
  // E un registro vuoto, anche senza vetrine note, non è un verde: zero controllati è un verde muto.
  assert.equal(verificaGlossarioKpi({ registro: reg, termini: terminiFinti(), esposti: {} }).esito, 1);
});

test("AR-962 — il puntatore di un KPI deve portare a una funzione esportata che esiste", () => {
  const rotto = verificaGlossarioKpi({ registro: registroFinto(), termini: terminiFinti(), esposti: espostiFinti(), puntatori: { "x.ts#f": { ok: true, esiste: false } } });
  assert.deepEqual(tipi(rotto), ["puntatore"]);
  const cieco = verificaGlossarioKpi({ registro: registroFinto(), termini: terminiFinti(), esposti: espostiFinti(), puntatori: { "x.ts#f": { ok: false, perche: "non si importa" } } });
  assert.equal(cieco.esito, 2);
});

// ── Il guardiano vero ─────────────────────────────────────────────────────────────────────────────

test("AR-962 — sul registro vero il guardiano esce VERDE, e legge il glossario che la lista dei documenti di governo dichiara", () => {
  const r = lancia();
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  const voce = DOCUMENTI.find((d) => d.id === "glossario-kpi");
  assert.equal(r.j.glossario, voce.documento, "un guardiano vero che sorveglia un altro file è lo stesso buco di prima (AR-960)");
  assert.equal(r.j.registro, "cervello/kpi-registro.json");
  const registro = JSON.parse(readFileSync(REGISTRO_VERO, "utf8"));
  assert.equal(r.j.conti.vetrine_misurate, registro.esposizioni.length, "ogni vetrina del registro deve essere stata eseguita");
  assert.ok(r.j.conti.kpi >= 40 && r.j.campi_consegnati.cruscotto.length >= 70, JSON.stringify(r.j.conti));
});

test("AR-962 — LA VARIANTE SCOMODA: il codice del Pannello consegna un numero nuovo, il registro resta com'è, e il guardiano lo dice", () => {
  const copia = join(mkdtempSync(join(tmpdir(), "glossario-kpi-")), "src");
  cpSync(join(REPO, "pannello/src"), copia, { recursive: true });
  const rotta = join(copia, "app/api/metriche/route.ts");
  const ancora = "  // --- Flag ---";
  const testo = readFileSync(rotta, "utf8");
  assert.ok(testo.includes(ancora), "la rotta è cambiata: la prova va riancorata, non saltata");
  writeFileSync(rotta, testo.replace(ancora, `  m.margine_inventato_30g = 12.5;\n${ancora}`));
  const r = lancia({ KPI_PANNELLO_SRC: copia });
  assert.equal(r.status, 1, `${r.stdout}\n${r.stderr}`);
  const fuori = r.j.problemi.filter((p) => p.tipo === "fuori-registro");
  assert.deepEqual(fuori.map((p) => `${p.esposizione}:${p.campo}`), ["cruscotto:margine_inventato_30g"]);
  assert.equal(readFileSync(join(REPO, ROTTA), "utf8").includes("margine_inventato_30g"), false, "la prova non deve toccare la rotta vera");
});

test("AR-962 — un KPI che il codice consegna, tolto dal registro, esce fuori registro con tutti i suoi campi", () => {
  const registro = JSON.parse(readFileSync(REGISTRO_VERO, "utf8"));
  registro.kpi = registro.kpi.filter((k) => k.id !== "ordini");
  const file = join(mkdtempSync(join(tmpdir(), "glossario-kpi-")), "registro.json");
  writeFileSync(file, JSON.stringify(registro));
  const r = lancia({ KPI_REGISTRO_FILE: file });
  assert.equal(r.status, 1, `${r.stdout}\n${r.stderr}`);
  const fuori = r.j.problemi.filter((p) => p.tipo === "fuori-registro").map((p) => `${p.esposizione}:${p.campo}`).sort();
  assert.deepEqual(fuori, ["cruscotto-demo:ordini_30g", "cruscotto-demo:ordini_7g", "cruscotto-demo:ordini_oggi", "cruscotto:ordini_30g", "cruscotto:ordini_7g", "cruscotto:ordini_oggi"]);
});

test("AR-962 — il guardiano FALLISCE quando un KPI del codice perde la sua riga nel glossario", () => {
  const voce = DOCUMENTI.find((d) => d.id === "glossario-kpi");
  const vero = readFileSync(join(REPO, voce.documento), "utf8");
  const righe = vero.split("\n");
  const senza = righe.filter((r) => !r.startsWith("| **clienti totali** |"));
  assert.equal(senza.length, righe.length - 1, "il glossario vero deve avere la riga dei clienti totali, una volta sola");
  const file = join(mkdtempSync(join(tmpdir(), "glossario-kpi-")), "GLOSSARIO-KPI.md");
  writeFileSync(file, senza.join("\n"));
  const r = lancia({ GLOSSARIO_KPI_FILE: file });
  assert.equal(r.status, 1, `${r.stdout}\n${r.stderr}`);
  assert.deepEqual(r.j.problemi.map((p) => `${p.tipo}:${p.kpi}`), ["senza-glossario:clienti-totali"]);
});

test("AR-962 — togliere dal registro la vetrina del cruscotto, e i suoi KPI, non spegne il controllo", () => {
  const registro = JSON.parse(readFileSync(REGISTRO_VERO, "utf8"));
  registro.esposizioni = registro.esposizioni.filter((e) => e.id !== "cruscotto");
  registro.kpi = registro.kpi.map((k) => ({ ...k, esposizioni: k.esposizioni.filter((e) => e !== "cruscotto") })).filter((k) => k.esposizioni.length);
  const file = join(mkdtempSync(join(tmpdir(), "glossario-kpi-")), "registro.json");
  writeFileSync(file, JSON.stringify(registro));
  const r = lancia({ KPI_REGISTRO_FILE: file });
  assert.equal(r.status, 1, `${r.stdout}\n${r.stderr}`);
  assert.ok(r.j.problemi.some((p) => p.esposizione === "cruscotto" && /sa eseguire/.test(p.messaggio)), JSON.stringify(r.j.problemi));
});

test("AR-962 — un errore imprevisto del guardiano esce 2 (cieco), non 1: il giro non deve leggerlo come un KPI senza definizione", () => {
  const file = join(mkdtempSync(join(tmpdir(), "glossario-kpi-")), "registro.json");
  writeFileSync(file, "null"); // si legge, ma non è un registro: la misura si rompe a metà
  const r = lancia({ KPI_REGISTRO_FILE: file }, []);
  assert.equal(r.status, 2, `${r.stdout}\n${r.stderr}`);
  assert.match(r.stderr, /cieco e non rosso/);
});

test("AR-962 — importarlo non lo fa girare, e da un collegamento simbolico gira lo stesso", () => {
  const dir = mkdtempSync(join(tmpdir(), "glossario-kpi-"));
  const importatore = join(dir, "importatore.mjs");
  writeFileSync(importatore, `await import(${JSON.stringify(pathToFileURL(GUARDIANO).href)});\nconsole.log("importato");\n`);
  const imp = spawnSync(process.execPath, [importatore], { encoding: "utf8", timeout: 60_000 });
  assert.equal(imp.status, 0, imp.stderr);
  assert.equal(imp.stdout.trim(), "importato");
  const collegamento = join(dir, "repo");
  symlinkSync(REPO, collegamento, "dir");
  const r = lancia({}, ["--json"], join(collegamento, "cervello/glossario-kpi-check.mjs"));
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  assert.equal(r.j?.esito, 0);
});

// ── Il cablaggio: la lista e il giro ──────────────────────────────────────────────────────────────

test("AR-962 — la lista dei documenti di governo nomina questo guardiano per il glossario, e non ha più un'attesa", () => {
  const voce = DOCUMENTI.find((d) => d.id === "glossario-kpi");
  assert.equal(voce.guardiano, "cervello/glossario-kpi-check.mjs");
  assert.ok(existsSync(join(REPO, voce.guardiano)));
  assert.equal(voce.attesa, undefined, "un'attesa rimasta accanto al guardiano è una data che può ancora far rossa la CI");
});

test("AR-962 — il giro lo esegue, ne prende l'esito, e il suo vincolo è contato", () => {
  const giro = readFileSync(join(CERVELLO, "giro.sh"), "utf8");
  const g = guardianiDiGiro(giro).find((x) => x.nome === "glossario-kpi-check");
  assert.ok(g, "il giro non esegue il guardiano del glossario");
  assert.equal(g.esitoPreso, true, "un guardiano con l'esito ingoiato parla, non ferma");
  assert.equal(g.vincolo, "GLOSSARIO_KPI_VINCOLO");
  assert.equal(g.vincoloContato, true);
});
