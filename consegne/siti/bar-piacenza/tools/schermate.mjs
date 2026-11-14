// Schermate e controlli nel browser vero (Chromium di Playwright).
// Uso: node tools/schermate.mjs [larghezze...]   → tools/out/schermate/*.png + riepilogo a video
// Controlla: errori e avvisi in console, richieste fallite, scroll orizzontale (anche a 320 px),
// apertura da file:// (doppio clic) e da un server statico.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const out = path.join(dir, 'out/schermate');
fs.mkdirSync(out, { recursive: true });

const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404, { 'content-type': TIPI['.html'] }); res.end(fs.readFileSync(path.join(root, '404.html'))); return;
  }
  res.writeHead(200, { 'content-type': TIPI[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const larghezze = process.argv.slice(2).map(Number).filter(Boolean);
const LARG = larghezze.length ? larghezze : [375, 768, 1280, 1920];
const browser = await chromium.launch();
const problemi = [];

async function visita(url, w, nome, scatta = true) {
  const ctx = await browser.newContext({ viewport: { width: w, height: Math.round(w < 600 ? w * 2.1 : w * 0.62) }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const note = [];
  page.on('console', (m) => {
    // Sulla pagina 404 il documento stesso risponde 404 apposta: quell'avviso è atteso.
    if (nome === '404' && /status of 404/.test(m.text())) return;
    if (['error', 'warning'].includes(m.type())) note.push(`console ${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => note.push(`errore JS: ${e.message}`));
  page.on('requestfailed', (r) => note.push(`richiesta fallita: ${r.url()} (${r.failure() && r.failure().errorText})`));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/pagina-che-non-esiste')) note.push(`HTTP ${r.status()}: ${r.url()}`); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const misure = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, vista: window.innerWidth, h1: document.querySelectorAll('h1').length }));
  if (misure.scroll > misure.vista) note.push(`scroll orizzontale: ${misure.scroll}px su ${misure.vista}px`);
  if (scatta) {
    // carica tutte le immagini lazy prima della schermata intera
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `${nome}-${w}.png`), fullPage: true });
  }
  await ctx.close();
  note.forEach((n) => problemi.push(`${nome} @${w}: ${n}`));
  return note;
}

for (const w of LARG) {
  await visita(`${base}/index.html`, w, 'home');
  await visita(`${base}/menu.html`, w, 'menu');
}
await visita(`${base}/privacy.html`, 375, 'privacy');
await visita(`${base}/cartella/pagina-che-non-esiste`, 375, '404');
await visita(`${base}/index.html?anteprima=eventi`, 375, 'home-eventi');
for (const w of [320, 1440, 2560]) { await visita(`${base}/index.html`, w, 'home', false); await visita(`${base}/menu.html`, w, 'menu', false); }
// Doppio clic: file://
await visita(pathToFileURL(path.join(root, 'index.html')).href, 375, 'file-home', false);
await visita(pathToFileURL(path.join(root, 'menu.html')).href, 1280, 'file-menu', false);

await browser.close();
server.close();
console.log(problemi.length ? problemi.join('\n') : 'Nessun errore in console, nessuna richiesta fallita, nessuno scroll orizzontale.');
console.log(`Schermate in ${path.relative(root, out)}/`);
