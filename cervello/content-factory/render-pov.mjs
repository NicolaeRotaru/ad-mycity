// ============================================================================
// render-pov.mjs — render del visual categoria NUOVA "POV / UTILITÀ ZTL".
// Il dolore quotidiano del piacentino (ZTL 8-19, multa 83€, parcheggio, sabato e
// devi prendere la coppa) reso relatable → fa dire "raga è veroo" e taggare.
// Script DEDICATO: NON tocca render.mjs.
// 🟢 Locale, reversibile. Non chiama servizi esterni, non tocca mycity-live.
// Stessa ricetta degli altri render: Playwright/Chromium, networkidle + fonts.ready,
// colori brand iniettati nel :root. Formato PORTRAIT 1080x1350.
// ============================================================================
import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND } from "../../creativi/brand.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TPL = join(__dirname, "templates", "pov-relatable.html");
const OUT = "/home/user/ad-mycity/creativi/output/social/C4-pov-ztl.png";

// Le righe del dolore: pungenti, reali, una verità per riga.
const RIGHE = [
  'sono le <b>8:01</b> e la ZTL è già chiusa fino alle 19',
  'giri <b>3 volte</b> l\'isolato per un parcheggio che non c\'è',
  'la macchina è sempre nel posto sbagliato (e il vigile lo sa)',
  'cinque negozi diversi, tutti <b>a piedi</b>, sotto il sole',
];

// Testi del post (categoria NUOVA POV/ZTL)
const DATI = {
  kicker: "POV: sei di Piacenza",
  // \n = a capo voluto, <b>/<acc> = accento voluto → non si escapano
  titolo: 'Sabato mattina.\nE ti tocca\n<span class="acc">prendere la coppa.</span>',
  soluzione: 'O <b>ordini su MyCity</b> e la coppa arriva a casa.\n(la macchina resta dov\'è.)',
  cta: "Provala stavolta →",
};

function buildRighe(righe) {
  return righe
    .map((t, i) => `<li><span class="bullet">${i + 1}</span><span>${t}</span></li>`)
    .join("");
}

function applica(html, dati) {
  let out = html;
  // inietta la lista già montata
  out = out.replaceAll("{{righe}}", buildRighe(RIGHE));
  for (const [k, v] of Object.entries(dati)) {
    // valori nostri: contengono <b>/<span> e \n voluti → NON escape
    out = out.replaceAll(`{{${k}}}`, String(v).replace(/\n/g, "<br>"));
  }
  out = out.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "");
  const c = BRAND.colori;
  const rootVars = `:root{--terracotta:${c.terracotta};--senape:${c.senape};--oliva:${c.oliva};--bordeaux:${c.bordeaux};--inchiostro:${c.inchiostro};--panna:${c.panna};}`;
  out = out.replace(/:root\{[^}]*\}/, rootVars);
  return out;
}

async function main() {
  const html = applica(readFileSync(TPL, "utf8"), DATI);
  mkdirSync(dirname(OUT), { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle" });
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT, clipMode: "css" });
  await browser.close();
  console.log("OK ->", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
