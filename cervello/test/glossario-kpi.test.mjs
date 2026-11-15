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
//   · il cablaggio: la lista lo nomina come guardiano senza attesa, il giro lo esegue e conta il vincolo;
//   · COME SUL SERVER (il grave del collaudo del 15/11): con un cervello/vps/.env pieno di chiavi e un
//     database finto in ascolto, il guardiano esce verde senza scrivere niente, senza chiamare nessuno e
//     senza vedere una chiave. La prima versione lanciava il sensore della cassa, che col .env del server
//     riscriveva cassa-runway.json con una cassa finta e mandava una POST al database del Pannello;
//   · nel giro: il log tiene la riga del verdetto, e da cieco il titolo del vincolo dice «cieco».
//
// NON-VACUITÀ: ventiquattro mutazioni in cervello/mutanti.json (difetto AR-962): undici del 15/11 alle 04:20,
// tredici della correzione dopo il collaudo. Ognuna rompe un pezzo del fix e questa prova diventa rossa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
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

test("AR-962 — un puntatore cieco di più KPI si dice una volta: è un modulo che non si importa, non due", () => {
  const reg = registroFinto();
  reg.kpi.push({ ...reg.kpi[0], id: "ordini-mese", campi: ["ordini_30g"] });
  const esposti = espostiFinti();
  esposti.vetrina.campi.ordini_30g = 20;
  const r = verificaGlossarioKpi({ registro: reg, termini: terminiFinti(), esposti, puntatori: { "x.ts#f": { ok: false, perche: "non si importa" } } });
  assert.equal(r.esito, 2);
  assert.deepEqual(r.ciechi.map((c) => c.dove), ["x.ts#f"], "da cieco erano 40 righe uguali, una per KPI");
});

test("AR-962 — il burn del sensore lo calcola la funzione che il registro nomina, e il documento della cassa lo usa", async () => {
  const registro = JSON.parse(readFileSync(REGISTRO_VERO, "utf8"));
  const k = registro.kpi.find((x) => x.id === "burn-sensore");
  const sensore = await import(pathToFileURL(join(REPO, k.file)).href);
  assert.equal(typeof sensore[k.funzione], "function");
  for (const grezzo of ["750", " 300 ", "abc", "", undefined]) {
    const { doc } = sensore.documentoCassa({ burnRaw: grezzo });
    assert.deepEqual(sensore[k.funzione](grezzo), doc.burn_mensile_eur, `burn «${grezzo}»: il registro dice che lo calcola ${k.funzione}, e non è così`);
  }
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

test("AR-962 — da cieco l'uscita è corta e comincia col verdetto: lo stesso perché si dice una volta", () => {
  const preload = join(mkdtempSync(join(tmpdir(), "glossario-kpi-")), "node-vecchio.cjs");
  writeFileSync(preload, 'const m = require("node:module");\nm.registerHooks = undefined;\nm.syncBuiltinESMExports();\n');
  const base = { ...process.env };
  for (const k of ["KPI_REGISTRO_FILE", "GLOSSARIO_KPI_FILE", "KPI_PANNELLO_SRC"]) delete base[k];
  const r = spawnSync(process.execPath, ["--require", preload, GUARDIANO], { encoding: "utf8", env: base, timeout: 120_000 });
  assert.equal(r.status, 2, `${r.stdout}\n${r.stderr}`);
  const righe = r.stdout.trim().split("\n");
  assert.match(righe[0], /^⚪ GLOSSARIO DEI KPI: cieco/);
  assert.ok(righe.length <= 4, `da cieco ${righe.length} righe, e nel log del giro le ultime coprono il verdetto:\n${r.stdout}`);
});

// ── Il guardiano non ha effetti, nemmeno sul server (il grave del collaudo del 15/11) ─────────────

const CASSA_VIVA = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cassa-runway.json";
const SEGNO_CHIAVE = /finta_dal_(padre|file_env)/;

/** Ogni file sotto `dir` con la sua impronta: serve a vedere se il guardiano ha scritto qualcosa. */
function impronte(dir) {
  const m = new Map();
  const visita = (d) => {
    for (const n of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, n.name);
      if (n.isDirectory()) visita(p);
      else m.set(p.slice(dir.length + 1), createHash("sha1").update(readFileSync(p)).digest("hex"));
    }
  };
  visita(dir);
  return m;
}
const cambiati = (prima, dopo) => [...new Set([...prima.keys(), ...dopo.keys()])].filter((f) => prima.get(f) !== dopo.get(f)).sort();

/**
 * Il server vero, in piccolo. Una copia del cervello con un cervello/vps/.env che contiene chiavi (finte,
 * puntate a un database finto in ascolto qui), il file vivo della cassa, e un ambiente di partenza con
 * altre chiavi, come quello che systemd dà al giro. Il .env vero non si tocca mai (scorciatoia 35):
 * tutto vive in una cartella temporanea. Il guardiano si lancia senza bloccare questo processo, perché
 * il database finto possa rispondere.
 */
async function comeSulServer() {
  const richieste = [];
  const db = createServer((req, res) => {
    let corpo = "";
    req.on("data", (d) => (corpo += d));
    req.on("end", () => {
      richieste.push(`${req.method} ${req.url} ${corpo}`.slice(0, 200));
      res.writeHead(201, { "content-type": "application/json" });
      res.end("[]");
    });
  });
  await new Promise((ok) => db.listen(0, "127.0.0.1", ok));
  const indirizzo = `http://127.0.0.1:${db.address().port}`;

  const radice = mkdtempSync(join(tmpdir(), "glossario-kpi-server-"));
  mkdirSync(join(radice, "cervello/vps"), { recursive: true });
  for (const nome of readdirSync(CERVELLO)) {
    if (statSync(join(CERVELLO, nome)).isFile()) cpSync(join(CERVELLO, nome), join(radice, "cervello", nome));
  }
  const voce = DOCUMENTI.find((d) => d.id === "glossario-kpi");
  for (const f of [voce.documento, CASSA_VIVA]) mkdirSync(dirname(join(radice, f)), { recursive: true });
  cpSync(join(REPO, voce.documento), join(radice, voce.documento));
  writeFileSync(join(radice, CASSA_VIVA), JSON.stringify({ stato: "sconosciuto", cassa_disponibile_eur: 0, giri_sconosciuto: 436 }, null, 2));
  writeFileSync(
    join(radice, "cervello/vps/.env"),
    [`STRIPE_SECRET_KEY=sk_finta_dal_file_env`, `SUPABASE_URL=${indirizzo}`, `SUPABASE_SERVICE_KEY=chiave_finta_dal_file_env`, `MARKETPLACE_SUPABASE_URL=${indirizzo}`, `MARKETPLACE_SUPABASE_KEY=chiave_finta_dal_file_env`].join("\n") + "\n"
  );

  // La spia guarda DENTRO il processo del guardiano, all'uscita: quali chiavi finte ci sono finite, e se
  // è stato caricato git-github.mjs, il modulo che appena caricato legge cervello/vps/.env.
  const spia = join(mkdtempSync(join(tmpdir(), "glossario-kpi-spia-")), "spia.mjs");
  writeFileSync(
    spia,
    [
      'import { registerHooks } from "node:module";',
      "const caricati = [];",
      "registerHooks({ load(url, ctx, next) { caricati.push(url); return next(url, ctx); } });",
      'process.on("exit", () => {',
      `  const chiavi = Object.keys(process.env).filter((k) => ${SEGNO_CHIAVE}.test(process.env[k] || "")).sort();`,
      '  process.stderr.write(`\\nSPIA ${JSON.stringify({ chiavi, gitGithub: caricati.some((u) => u.endsWith("/cervello/git-github.mjs")) })}\\n`);',
      "});",
    ].join("\n")
  );

  const lancia = (env = {}) =>
    new Promise((ok) => {
      const figlio = spawn(process.execPath, ["--import", pathToFileURL(spia).href, join(radice, "cervello/glossario-kpi-check.mjs"), "--json"], {
        cwd: radice,
        env: {
          PATH: process.env.PATH || "",
          HOME: process.env.HOME || "",
          KPI_PANNELLO_SRC: join(REPO, "pannello/src"),
          // Le chiavi che systemd mette nell'ambiente del giro sul server.
          STRIPE_SECRET_KEY: "sk_finta_dal_padre",
          GITHUB_TOKEN: "token_finta_dal_padre",
          OBSIDIAN_TOKEN: "token_finta_dal_padre",
          RESEND_API_KEY: "re_finta_dal_padre",
          ANTHROPIC_API_KEY: "chiave_finta_dal_padre",
          SUPABASE_URL: indirizzo,
          SUPABASE_SERVICE_KEY: "chiave_finta_dal_padre",
          ...env,
        },
      });
      let stdout = "";
      let stderr = "";
      figlio.stdout.on("data", (d) => (stdout += d));
      figlio.stderr.on("data", (d) => (stderr += d));
      const scadenza = setTimeout(() => figlio.kill("SIGKILL"), 120_000);
      figlio.on("close", (status) => {
        clearTimeout(scadenza);
        let j = null;
        try {
          j = JSON.parse(stdout);
        } catch {}
        const m = /^SPIA (.+)$/m.exec(stderr);
        ok({ status, stdout, stderr, j, spia: m ? JSON.parse(m[1]) : null });
      });
    });
  const chiudi = async () => {
    db.closeAllConnections?.();
    await new Promise((ok) => db.close(() => ok()));
    rmSync(radice, { recursive: true, force: true });
  };
  return { radice, indirizzo, richieste, lancia, chiudi };
}

test("AR-962 — COME SUL SERVER: con un .env pieno di chiavi e un database in ascolto, il guardiano esce verde senza scrivere, senza chiamare nessuno, senza vedere una chiave", async () => {
  const s = await comeSulServer();
  try {
    const prima = impronte(s.radice);
    const r = await s.lancia();
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.deepEqual(s.richieste, [], "il guardiano ha chiamato il database: sul server è il segnale della cassa finta che arriva al Pannello");
    assert.deepEqual(cambiati(prima, impronte(s.radice)), [], "il guardiano ha scritto: sul server è cassa-runway.json riscritto con la cassa finta");
    assert.ok(r.spia, `la spia non ha parlato:\n${r.stderr}`);
    assert.deepEqual(r.spia.chiavi, [], "nel processo del guardiano sono rimaste delle chiavi, e il codice del Pannello le legge");
    assert.equal(r.spia.gitGithub, false, "il guardiano ha caricato git-github.mjs, che appena caricato legge le chiavi del server");
    const cassa = r.j.campi_consegnati["cassa-runway"];
    for (const c of ["cassa_disponibile_eur", "burn_mensile_eur", "runway_mesi"]) assert.ok(cassa.includes(c), `la vetrina della cassa non consegna più ${c}`);
  } finally {
    await s.chiudi();
  }
});

test("AR-962 — un KPI il cui modulo legge le chiavi appena caricato: il guardiano lo carica, e le chiavi restano fuori", async () => {
  const s = await comeSulServer();
  try {
    const registro = JSON.parse(readFileSync(REGISTRO_VERO, "utf8"));
    Object.assign(registro.kpi.find((x) => x.id === "burn-sensore"), { file: "cervello/git-github.mjs", funzione: "nowPiacenza" });
    const file = join(s.radice, "registro-con-git-github.json");
    writeFileSync(file, JSON.stringify(registro));
    const prima = impronte(s.radice);
    const r = await s.lancia({ KPI_REGISTRO_FILE: file });
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.equal(r.spia?.gitGithub, true, "la prova non mette più in scena il modulo che legge le chiavi: va riancorata, non saltata");
    assert.deepEqual(r.spia.chiavi, [], "git-github.mjs ha letto cervello/vps/.env dentro il guardiano");
    assert.deepEqual(s.richieste, []);
    assert.deepEqual(cambiati(prima, impronte(s.radice)), []);
  } finally {
    await s.chiudi();
  }
});

test("AR-962 — una vetrina del Pannello che prova a leggere il .env, a scrivere, a lanciare un programma o ad andare in rete non ci riesce", async () => {
  const s = await comeSulServer();
  try {
    const copia = join(mkdtempSync(join(tmpdir(), "glossario-kpi-")), "src");
    cpSync(join(REPO, "pannello/src"), copia, { recursive: true });
    const rotta = join(copia, "app/api/metriche/route.ts");
    const ancora = "  // --- Flag ---";
    const testo = readFileSync(rotta, "utf8");
    assert.ok(testo.includes(ancora), "la rotta è cambiata: la prova va riancorata, non saltata");
    const dallaRotta = join(s.radice, "scritto-dalla-rotta.txt");
    const dalFiglio = join(s.radice, "scritto-dal-figlio.txt");
    // Codice distratto: ogni errore lo ingoia, così la rotta risponde lo stesso e il guardiano esce 0.
    const intruso = [
      `  try { process.loadEnvFile(${JSON.stringify(join(s.radice, "cervello/vps/.env"))}); } catch {}`,
      `  try { (await import("node:fs")).writeFileSync(${JSON.stringify(dallaRotta)}, "x"); } catch {}`,
      `  try { (await import("node:child_process")).spawnSync(process.execPath, ["-e", ${JSON.stringify(`require("fs").writeFileSync(${JSON.stringify(dalFiglio)}, "x")`)}]); } catch {}`,
      `  try { const http = await import("node:http"); await new Promise((ok) => { try { http.get(${JSON.stringify(`${s.indirizzo}/dalla-rotta`)}, (q) => { q.resume(); q.on("end", ok); }).on("error", ok); } catch { ok(); } }); } catch {}`,
    ].join("\n");
    writeFileSync(rotta, testo.replace(ancora, `${intruso}\n${ancora}`));
    const prima = impronte(s.radice);
    const r = await s.lancia({ KPI_PANNELLO_SRC: copia });
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.equal(existsSync(dallaRotta), false, "la rotta ha scritto su disco dentro il guardiano");
    assert.equal(existsSync(dalFiglio), false, "la rotta ha lanciato un programma dentro il guardiano, e il programma ha scritto");
    assert.deepEqual(s.richieste, [], "la rotta è andata in rete dentro il guardiano");
    assert.deepEqual(r.spia?.chiavi, [], "la rotta ha letto cervello/vps/.env con process.loadEnvFile, senza passare da fs");
    assert.deepEqual(cambiati(prima, impronte(s.radice)), []);
  } finally {
    await s.chiudi();
  }
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

test("AR-962 — nel giro: il log tiene la riga del verdetto, e da cieco il titolo del vincolo dice «cieco», non HARD", () => {
  const giro = readFileSync(join(CERVELLO, "giro.sh"), "utf8").split("\n");
  const da = giro.findIndex((r) => r.includes('_glossario_out="$(node "$SCRIPT_DIR/glossario-kpi-check.mjs" 2>&1)"'));
  const a = giro.findIndex((r, i) => i > da && r.includes('[ -n "$GLOSSARIO_KPI_VINCOLO" ] && echo'));
  const da2 = giro.findIndex((r) => r.startsWith('if [ -n "${GLOSSARIO_KPI_VINCOLO:-}" ]; then'));
  const a2 = giro.findIndex((r, i) => i > da2 && r === "fi");
  assert.ok(da > 0 && a > da && da2 > a && a2 > da2, "il giro è cambiato: la prova va riancorata, non saltata");
  const dir = mkdtempSync(join(tmpdir(), "glossario-kpi-giro-"));
  const esegui = (rc) => {
    // Un guardiano finto: la prima riga è il verdetto, poi quaranta righe, come da cieco prima della cura.
    writeFileSync(join(dir, "glossario-kpi-check.mjs"), `console.log("VERDETTO rc=${rc}"); for (let i = 0; i < 40; i++) console.log("   riga " + i); process.exit(${rc});\n`);
    const script = [
      "set -uo pipefail",
      "ts(){ date +%H:%M; }",
      `source ${JSON.stringify(join(CERVELLO, "giro-esito.sh"))}`,
      `SCRIPT_DIR=${JSON.stringify(dir)}`,
      'GLOSSARIO_KPI_VINCOLO=""; GLOSSARIO_KPI_TITOLO=""; PROMPT="base"',
      ...giro.slice(da, a + 1),
      'echo "=== PROMPT"',
      ...giro.slice(da2, a2 + 1),
      'printf "%s\\n" "$PROMPT"',
    ].join("\n");
    const r = spawnSync("bash", ["-c", script], { encoding: "utf8", timeout: 60_000 });
    const [log, prompt = ""] = r.stdout.split("=== PROMPT");
    return { log, prompt, r };
  };
  const cieco = esegui(2);
  assert.match(cieco.log, /VERDETTO rc=2/, `il log del giro ha perso la riga del verdetto:\n${cieco.log}`);
  assert.match(cieco.prompt, /## Vincolo glossario dei KPI \(GUARDIANO CIECO/, cieco.prompt);
  assert.doesNotMatch(cieco.prompt, /## Vincolo glossario dei KPI \(HARD/, "da cieco il titolo dice che c'è un numero senza definizione, e il testo dice il contrario");
  const rosso = esegui(1);
  assert.match(rosso.log, /VERDETTO rc=1/, rosso.log);
  assert.match(rosso.prompt, /## Vincolo glossario dei KPI \(HARD — AR-962/, rosso.prompt);
  assert.doesNotMatch(esegui(0).prompt, /Vincolo glossario dei KPI/, "da verde nessun vincolo");
});
