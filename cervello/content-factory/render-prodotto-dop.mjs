// ============================================================================
// render-prodotto-dop.mjs — render del visual categoria NUOVA "PRODOTTO-EROE DOP"
// (box-regalo 3 salumi DOP spedito). Script DEDICATO: NON tocca render.mjs.
// 🟢 Locale, reversibile. Non chiama servizi esterni, non tocca mycity-live.
// Stessa ricetta degli altri render: Playwright/Chromium, viewport 1080x1080,
// waitUntil networkidle + fonts.ready, colori brand iniettati nel :root.
// ============================================================================
import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND } from "../../creativi/brand.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TPL = join(__dirname, "templates", "prodotto-dop.html");
const OUT = "/home/user/ad-mycity/creativi/output/social/C3-prodotto-dop.png";

// Testi del post (categoria NUOVA prodotto-eroe DOP)
const DATI = {
  titolo: "Una valigia di\nPiacenza. <b>A casa di\nchi ti manca.</b>",
  sub: "Il sapore di casa, spedito a chi è lontano.\nIl regalo che sa di dove sei nato.",
  cta: "Spediscilo →",
  prezzo: "39€",
};

function applica(html, dati) {
  let out = html;
  for (const [k, v] of Object.entries(dati)) {
    // qui NON facciamo escape: i valori sono nostri e contengono <b> e \n voluti
    out = out.replaceAll(`{{${k}}}`, String(v).replace(/\n/g, "<br>"));
  }
  out = out.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "");
  const c = BRAND.colori;
  const rootVars = `:root{--terracotta:${c.terracotta};--senape:${c.senape};--oliva:${c.oliva};--bordeaux:${c.bordeaux};--inchiostro:${c.inchiostro};--panna:${c.panna};--bianco:${c.bianco};}`;
  out = out.replace(/:root\{[^}]*\}/, rootVars);
  return out;
}

async function main() {
  const html = applica(readFileSync(TPL, "utf8"), DATI);
  mkdirSync(dirname(OUT), { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT, clipMode: "css" });
  await browser.close();
  console.log("OK ->", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
