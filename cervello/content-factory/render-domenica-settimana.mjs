// Render post domenica sera PQ — feed 1080×1350 + storia 1080×1920.
// 🟢 locale. Uso: node cervello/content-factory/render-domenica-settimana.mjs
import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tpl = readFileSync(join(__dirname, "templates", "domenica-settimana.html"), "utf8");

const dati = {
  kicker: "Il turno della domenica",
  hook: "Domenica sera:",
  sottotitolo: "Fai il turno per la settimana.",
  bottega: "Pane Quotidiano · Via Calzolai · bio dal 1976",
  badge: "Ordina stasera · Ricevi lunedì",
  handle: "@mycity.piacenza",
};

let html = tpl;
for (const [k, v] of Object.entries(dati)) html = html.replaceAll(`{{${k}}}`, v);
html = html.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "");

const OUT_DIR = join(__dirname, "..", "..", "consegne", "content", "assets");
mkdirSync(OUT_DIR, { recursive: true });

const outputs = [
  { path: join(OUT_DIR, "domenica-settimana-1907-feed.png"), width: 1080, height: 1350 },
  { path: join(OUT_DIR, "domenica-settimana-1907-story.png"), width: 1080, height: 1920 },
];

const b = await chromium.launch();
for (const { path: outPath, width, height } of outputs) {
  const p = await b.newPage({ viewport: { width, height } });
  await p.setContent(html, { waitUntil: "networkidle" });
  try { await p.evaluate(() => document.fonts.ready); } catch {}
  await p.waitForTimeout(300);
  await p.screenshot({ path: outPath });
  await p.close();
  console.log("OK ->", outPath);
}
await b.close();
