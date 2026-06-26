// ============================================================================
// Content Factory — reel.mjs
// Genera un reel .webm animato (9:16, ~15-20s) via registrazione Playwright:
// una sequenza di "schede" con testo che entra (fade/slide), brandizzate MyCity.
//
// 🟢 Locale. NON serve ffmpeg: il video reale prodotto oggi e' un .webm
//    (codec VP8/VP9) registrato da Chromium. Lo dichiariamo nel doc.
//
// Best-effort: se la registrazione video fallisce, ripiega su PNG-storyboard
// (una frame per scheda) cosi' qualcosa di usabile esce sempre.
// ============================================================================

import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { BRAND } from "../../creativi/brand.mjs";

const C = BRAND.colori;

// HTML di una scena reel: schede a tutto schermo con animazione CSS sequenziale.
function buildReelHtml(schede, perSchedaMs) {
  const totale = schede.length * perSchedaMs;
  const slides = schede
    .map((s, i) => {
      const start = (i * perSchedaMs) / totale;
      const dur = perSchedaMs / totale;
      // ogni scheda visibile nella sua finestra temporale
      return `
      <section class="slide" style="
        animation: vis ${totale}ms linear infinite;
        animation-delay: -${0}ms;
        --start:${start}; --dur:${dur};">
        <div class="kick">${esc(s.kicker || "")}</div>
        <div class="big">${esc(s.titolo || "")}</div>
        <div class="sub">${esc(s.testo || "")}</div>
      </section>`;
    })
    .join("");

  // keyframes per-scheda generati: usiamo n animazioni distinte
  const perSlideAnim = schede
    .map((s, i) => {
      const a = ((i * perSchedaMs) / totale) * 100;
      const inEnd = a + 6;
      const outStart = a + (perSchedaMs / totale) * 100 - 6;
      const outEnd = a + (perSchedaMs / totale) * 100;
      return `
      .slide:nth-of-type(${i + 1}){ animation-name: s${i}; }
      @keyframes s${i}{
        0%, ${a.toFixed(2)}% { opacity:0; transform:translateY(40px); }
        ${inEnd.toFixed(2)}% { opacity:1; transform:translateY(0); }
        ${outStart.toFixed(2)}% { opacity:1; transform:translateY(0); }
        ${outEnd.toFixed(2)}% { opacity:0; transform:translateY(-40px); }
        100% { opacity:0; }
      }`;
    })
    .join("\n");

  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden}
  body{background:${C.terracotta};font-family:Georgia,serif;color:${C.panna};position:relative}
  .stage{position:absolute;inset:0}
  .slide{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;
    align-items:center;text-align:center;padding:110px 80px;opacity:0;
    animation-duration:${totale}ms;animation-iteration-count:infinite;animation-timing-function:ease-in-out;}
  .kick{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;text-transform:uppercase;
    letter-spacing:8px;font-size:34px;background:${C.senape};color:${C.inchiostro};
    padding:18px 34px;border-radius:14px;margin-bottom:56px}
  .big{font-size:100px;line-height:1.05;font-weight:700;margin-bottom:48px}
  .sub{font-size:50px;line-height:1.4;opacity:.96;white-space:pre-line}
  .brand{position:absolute;bottom:90px;left:0;right:0;text-align:center}
  .brand .b{font-size:60px;font-weight:700}
  .brand .t{font-style:italic;font-size:36px;opacity:.9;margin-top:10px}
  ${perSlideAnim}
  </style></head><body>
  <div class="stage">${slides}</div>
  <div class="brand"><div class="b">MyCity 🐎</div><div class="t">La spesa che tiene viva la città.</div></div>
  </body></html>`;
}

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Genera un reel .webm dalle schede.
 * @param {Array} schede  [{kicker,titolo,testo}, ...]
 * @param {string} outDir cartella di output
 * @param {string} nomeBase nome base file (senza estensione)
 * @param {object} opt { perSchedaMs=4000, giri=1 }
 * @returns {Promise<{ok:boolean, path?:string, fallback?:string[], errore?:string}>}
 */
export async function generaReel(schede, outDir, nomeBase = "reel", opt = {}) {
  const perSchedaMs = opt.perSchedaMs || 4000;
  const giri = opt.giri || 1; // quante volte ripetere la sequenza
  const durataTot = schede.length * perSchedaMs * giri;
  mkdirSync(outDir, { recursive: true });
  const size = { width: 1080, height: 1920 };
  const html = buildReelHtml(schede, perSchedaMs);

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: size,
      recordVideo: { dir: outDir, size },
    });
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    // lascia girare l'animazione per la durata totale
    await page.waitForTimeout(durataTot + 400);
    await context.close(); // qui Playwright salva il .webm
    await browser.close();
    browser = null;

    // Playwright dà un nome casuale al .webm: lo rinominiamo.
    const webms = readdirSync(outDir).filter((f) => f.endsWith(".webm"));
    if (webms.length === 0) throw new Error("nessun .webm prodotto");
    // prendi il più recente
    const ultimo = webms
      .map((f) => ({ f, t: statTime(join(outDir, f)) }))
      .sort((a, b) => b.t - a.t)[0].f;
    const dest = join(outDir, `${nomeBase}.webm`);
    if (join(outDir, ultimo) !== dest) renameSync(join(outDir, ultimo), dest);
    return { ok: true, path: dest };
  } catch (e) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    console.error("[reel] registrazione video fallita:", e.message, "— ripiego su storyboard PNG");
    // FALLBACK: una frame PNG per scheda (storyboard)
    try {
      const frames = await storyboardFrames(schede, outDir, nomeBase);
      return { ok: false, fallback: frames, errore: e.message };
    } catch (e2) {
      return { ok: false, errore: `${e.message}; storyboard fallito: ${e2.message}` };
    }
  }
}

import { statSync } from "node:fs";
function statTime(p) {
  try { return statSync(p).mtimeMs; } catch { return 0; }
}

// Produce una PNG per ogni scheda (storyboard del reel).
async function storyboardFrames(schede, outDir, nomeBase) {
  const size = { width: 1080, height: 1920 };
  const browser = await chromium.launch();
  const out = [];
  try {
    for (let i = 0; i < schede.length; i++) {
      const html = buildReelHtml([schede[i]], 4000).replace(/opacity:0;/g, "opacity:1;");
      const page = await browser.newPage({ viewport: size });
      await page.setContent(html, { waitUntil: "networkidle" });
      const p = join(outDir, `${nomeBase}-frame-${i + 1}.png`);
      await page.screenshot({ path: p, type: "png" });
      await page.close();
      out.push(p);
    }
  } finally {
    await browser.close();
  }
  return out;
}

// CLI di prova: node reel.mjs <outDir>
if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] || "creativi/output/social";
  generaReel(
    [
      { kicker: "MyCity", titolo: "Le botteghe del centro", testo: "stanno sparendo.\n−22% in 12 anni." },
      { kicker: "Ma", titolo: "La spesa vera", testo: "a casa tua.\nSenza ZTL, senza coda." },
      { kicker: "Insieme", titolo: "Le salviamo", testo: "Iscriviti alla lista.\nPrimi 50 = consegna gratis." },
    ],
    outDir,
    "reel-test"
  ).then((r) => console.log("Reel:", JSON.stringify(r, null, 2)));
}
