// Render del "Contatore Civico" (W5). Riempie il template con l'ESEMPIO marcato e produce il PNG.
// 🟢 locale. Uso: node cervello/content-factory/render-contatore.mjs
import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tpl = readFileSync(join(__dirname, "templates", "contatore-civico.html"), "utf8");

// ESEMPIO dimostrativo — il numero reale arriva dal DB (SUM(seller_payout_cents)/100) dopo i primi ordini.
const dati = { importo: "€1.240", mese: "giugno 2026", badge_esempio: "ESEMPIO" };
let html = tpl;
for (const [k, v] of Object.entries(dati)) html = html.replaceAll(`{{${k}}}`, v);
html = html.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "");

const OUT = join(__dirname, "..", "..", "creativi", "output", "social", "W5-contatore-civico.png");
mkdirSync(dirname(OUT), { recursive: true });

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.setContent(html, { waitUntil: "networkidle" });
try { await p.evaluate(() => document.fonts.ready); } catch {}
await p.waitForTimeout(400);
await p.screenshot({ path: OUT });
await b.close();
console.log("OK ->", OUT);
