// Osservazione a RUNTIME della corsia «cieco letto come verde» (AR-401 · AR-406 · AR-237).
// Non è un test unitario: apre il Pannello VERO in Chromium e legge i pixel — cioè quello che
// vedrebbe Nicola — su un ambiente senza chiavi del marketplace, dove /api/alert risponde
// `{collegato:false, alert:[]}` e /api/azioni-pronte risponde 401: esattamente le due letture che
// prima producevano «Nessun allarme. Tutto ok.» e «Niente da firmare. 👍».
//
// Uso: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/test/pw-corsia-cieco.mjs [url]
import { createRequire } from "module";
import { mkdirSync } from "fs";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:3939/";
const SC = process.env.SC || "/tmp/pw";
mkdirSync(SC, { recursive: true });

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
p.on("console", (m) => { if (m.type() === "error") errori.push(m.text()); });
p.on("pageerror", (e) => errori.push("PAGEERROR: " + e.message));

await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(12000); // in dev ogni route si compila al primo colpo: si aspetta che le sei letture tornino

const testo = (await p.textContent("body")) || "";
const esiti = [];
const dice = (nome, atteso, vietato) => {
  const ok = testo.includes(atteso) && !testo.includes(vietato);
  esiti.push({ nome, ok, atteso_trovato: testo.includes(atteso), vietato_trovato: testo.includes(vietato) });
};

// AR-401 — le due schede che mentivano
dice("Allarmi: dice «non lo so» invece di «Tutto ok»", "Non lo so", "Nessun allarme. Tutto ok.");
dice("Da firmare: niente pollice in su su una coda non letta", "Non lo so", "Niente da firmare");

// AR-237 — la targhetta non dice più «aggiornato · <ora di adesso>» come età del dato
const esiti2 = [];
esiti2.push({ nome: "La targhetta parla del dato (o dichiara di non saperlo)", ok: /dati del|non so di quando/.test(testo) });

// Le card della home vanno lette PRIMA di cambiare area.
const cardHome = await p.evaluate(() => Array.from(document.querySelectorAll(".card-priorita")).map((e) => e.textContent.trim()).slice(0, 4));
await p.screenshot({ path: `${SC}/corsia-cieco-home.png`, fullPage: true });

// AR-406 — gli otto organi vivono nell'area «Cervello» (RadiografiaMacchinaArea), non in home.
await p.evaluate(() => window.dispatchEvent(new CustomEvent("mycity:vai", { detail: { vista: "cervello" } })));
await p.waitForTimeout(12000);
const testoOrgani = (await p.textContent("body")) || "";
esiti2.push({ nome: "Organi: compare il grigio «non misurato»", ok: /non misurato/.test(testoOrgani) });
esiti2.push({ nome: "Freni non è più «attivi» per dichiarazione", ok: !/Freni[\s\S]{0,120}>attivi</.test(testoOrgani) });
esiti2.push({ nome: "Nessun ✅ su un organo mai misurato", ok: !/Apprendimento[\s\S]{0,120}lezioni attive/.test(testoOrgani) });
await p.screenshot({ path: `${SC}/corsia-cieco-organi.png`, fullPage: true });

const organiVisti = await p.evaluate(() => Array.from(document.querySelectorAll(".kpi-tile")).map((e) => e.textContent.trim()).slice(0, 8));
console.log(JSON.stringify({ url, esiti: [...esiti, ...esiti2], card: cardHome, organi: organiVisti, errori_console: errori.slice(0, 8) }, null, 1));
await b.close();
const rossi = [...esiti, ...esiti2].filter((e) => !e.ok);
process.exit(rossi.length ? 1 : 0);
