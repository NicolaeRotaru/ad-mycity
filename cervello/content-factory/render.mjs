// ============================================================================
// Content Factory — render.mjs
// Motore di rendering: data una "voce" del calendario produce un PNG brandizzato.
// Sceglie il template giusto in base al pilastro editoriale, inietta i colori del
// brand e i testi, renderizza con Playwright/Chromium.
//
// 🟢 Locale, reversibile. Non tocca mycity-live, non chiama servizi esterni.
//
// Formati supportati:
//   feed      1080x1080  (quadrato — IG/FB feed)
//   portrait  1080x1350  (4:5 — IG feed verticale)
//   story     1080x1920  (9:16 — storie / cover reel)
//
// Pilastri -> template:
//   storia-bottega     LUN  -> templates/storia-bottega.html
//   consiglio-mercoledi MER -> templates/consiglio-mercoledi.html
//   ordina-weekend     VEN  -> templates/ordina-weekend.html
//   prova-sociale      DOM  -> templates/prova-sociale.html
// ============================================================================

import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND } from "../../creativi/brand.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const FORMATI = {
  feed: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export const PILASTRI = {
  "storia-bottega": "storia-bottega.html",
  "consiglio-mercoledi": "consiglio-mercoledi.html",
  "ordina-weekend": "ordina-weekend.html",
  "prova-sociale": "prova-sociale.html",
  // — categorie aggiunte (5 stili distinti) —
  "manifesto-causa": "manifesto-causa.html",
  "carosello-edu": "carosello-edu.html",
  "prodotto-dop": "prodotto-dop.html",
  "pov-relatable": "pov-relatable.html",
  "prova-sociale-quote": "prova-sociale-quote.html",
  // — contenuti modellati sui vincenti dei competitor —
  "manifesto-anti-blackfriday": "manifesto-anti-blackfriday.html",
  "ritratto-bottega": "ritratto-bottega.html",
  "contatore-civico": "contatore-civico.html",
};

// Sostituisce i {{segnaposto}} (escape HTML dei valori per sicurezza).
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applica(html, dati) {
  let out = html;
  for (const [k, v] of Object.entries(dati)) {
    out = out.replaceAll(`{{${k}}}`, escapeHtml(v));
  }
  // svuota eventuali segnaposto rimasti
  out = out.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "");
  // inietta i colori reali del brand nel :root (sovrascrive i fallback)
  const rootVars = `:root{--terracotta:${BRAND.colori.terracotta};--senape:${BRAND.colori.senape};--oliva:${BRAND.colori.oliva};--bordeaux:${BRAND.colori.bordeaux};--inchiostro:${BRAND.colori.inchiostro};--panna:${BRAND.colori.panna};--bianco:${BRAND.colori.bianco};}`;
  out = out.replace(/:root\{[^}]*\}/, rootVars);
  return out;
}

/**
 * Renderizza una singola voce in PNG.
 * @param {object} voce  { pilastro, formato, kicker, titolo, testo, cta, handle }
 * @param {string} outPath  percorso del PNG di output
 * @param {object} [browser]  istanza Chromium opzionale (per riuso in batch)
 * @returns {Promise<string>} outPath
 */
export async function renderVoce(voce, outPath, browser = null) {
  const pilastro = voce.pilastro || "storia-bottega";
  const tplFile = PILASTRI[pilastro];
  if (!tplFile) throw new Error(`Pilastro sconosciuto: ${pilastro} (validi: ${Object.keys(PILASTRI).join(", ")})`);

  const formato = FORMATI[voce.formato] || FORMATI.portrait;
  const tplPath = join(__dirname, "templates", tplFile);
  let html;
  try {
    html = readFileSync(tplPath, "utf8");
  } catch (e) {
    throw new Error(`Template non leggibile: ${tplPath} — ${e.message}`);
  }

  const dati = {
    kicker: voce.kicker || "",
    titolo: voce.titolo || "",
    testo: voce.testo || "",
    cta: voce.cta || "",
    handle: voce.handle || "@mycity.piacenza",
  };
  const finalHtml = applica(html, dati);

  mkdirSync(dirname(outPath), { recursive: true });

  const ownBrowser = !browser;
  const b = browser || (await chromium.launch());
  try {
    const page = await b.newPage({ viewport: formato, deviceScaleFactor: 1 });
    await page.setContent(finalHtml, { waitUntil: "networkidle" });
    await page.screenshot({ path: outPath, type: "png" });
    await page.close();
    return outPath;
  } finally {
    if (ownBrowser) await b.close();
  }
}

// Uso da CLI per un test rapido:
//   node render.mjs <pilastro> <formato> <outPath>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , pilastro = "storia-bottega", formato = "portrait", out = "test.png"] = process.argv;
  renderVoce(
    {
      pilastro,
      formato,
      kicker: "Storia di bottega",
      titolo: "Titolo di prova",
      testo: "Riga uno.\nRiga due del testo di prova per il render.",
      cta: "Iscriviti: primi 50 = consegna gratis",
      handle: "@mycity.piacenza",
    },
    out
  )
    .then((p) => console.log("PNG creato:", p))
    .catch((e) => {
      console.error("Errore render:", e.message);
      process.exit(1);
    });
}
