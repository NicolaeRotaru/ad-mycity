// Trasforma le impaginazioni in file finiti, con il Chromium di Playwright già presente sulla macchina.
// node render.mjs reel <cartella>  → 450 fotogrammi JPEG (15 s a 30 al secondo)
// node render.mjs post <file.png> → il post 1080×1350
// Per fare tutto in un colpo: bash crea.sh
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const DIR = dirname(fileURLToPath(import.meta.url));
const [mode, out, times] = process.argv.slice(2);
const browser = await chromium.launch();
if (mode === "post") {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto("file://" + join(DIR, "post.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out });
} else {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + join(DIR, "reel.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  mkdirSync(out, { recursive: true });
  const FPS = 30, T = 15.0;
  const list = times ? times.split(",").map(Number) : Array.from({ length: Math.round(T * FPS) }, (_, i) => i / FPS);
  let n = 0;
  for (const t of list) {
    await page.evaluate((t) => window.render(t), t);
    const name = times ? `t${t.toFixed(2)}.jpg` : `f${String(n).padStart(4, "0")}.jpg`;
    await page.screenshot({ path: join(out, name), type: "jpeg", quality: 92 });
    n++;
  }
  console.log("fotogrammi:", n);
}
await browser.close();
