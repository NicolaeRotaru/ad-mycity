// Icone del sito e anteprima per i social, generate dal marchio.
// Uso: node tools/icone.mjs
//  - favicon.ico (16, 32, 48), apple-touch-icon.png (180), icon-192.png, icon-512.png (anche maskable)
//  - og-image.jpg 1200×630: pagina disegnata con i font veri e fotografata con Playwright
// Servono sharp (cd tools && npm install), ImageMagick (convert) e Playwright con Chromium.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const tmp = fs.mkdtempSync(path.join(dir, 'out-icone-'));

// Icona a tutto campo (senza angoli arrotondati): iOS e Android li arrotondano da soli,
// e il disegno sta dentro la zona sicura delle icone «maskable» (80% centrale).
const svg = fs.readFileSync(path.join(root, 'favicon.svg'), 'utf8');
const piena = svg.replace('<rect width="64" height="64" rx="12"', '<rect width="64" height="64"')
  .replace('<rect x="9" y="9" width="46" height="46"', '<rect x="13" y="13" width="38" height="38"')
  .replace(/<path d="([^"]+)" fill="#B3152B"\/>/, '<path transform="translate(32 32) scale(.82) translate(-32 -32)" d="$1" fill="#B3152B"/>');
const png = (s, size, file) => sharp(Buffer.from(s), { density: 72 * (size / 64) * 1.01 }).resize(size, size).png().toFile(file);
await png(piena, 180, path.join(root, 'apple-touch-icon.png'));
await png(piena, 192, path.join(root, 'icon-192.png'));
await png(piena, 512, path.join(root, 'icon-512.png'));
const ico = [];
for (const n of [16, 32, 48]) { const f = path.join(tmp, `ico-${n}.png`); await png(svg, n, f); ico.push(f); }
execFileSync('convert', [...ico, path.join(root, 'favicon.ico')]);

// og-image: una pagina 1200×630 con l'insegna accesa, la frase e l'illustrazione del bancone.
const marchio = JSON.parse(fs.readFileSync(path.join(dir, 'parti/marchio.json'), 'utf8'));
const css = pathToFileURL(path.join(root, 'assets/css/styles.css')).href;
const img = pathToFileURL(path.join(root, 'assets/img/bancone-mattino-960.jpg')).href;
const pagina = `<!doctype html><html lang="it"><head><meta charset="utf-8"><link rel="stylesheet" href="${css}"><style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; padding: 0; }
  .og { display: grid; grid-template-columns: 1fr 380px; gap: 56px; align-items: center; height: 630px; padding: 0 64px; box-sizing: border-box; }
  .og .insegna { max-width: none; width: 640px; }
  .og p { font-size: 34px; line-height: 1.25; margin-top: 36px; max-width: 18ch; color: #12372A; }
  .og small { display: block; font-size: 22px; color: #5E665F; margin-top: 18px; }
  .og figure { margin: 0; height: 475px; border-radius: 2px; overflow: hidden; position: relative; }
  .og figure img { width: 100%; height: 100%; object-fit: cover; }
  .og figure::after { content: ''; position: absolute; inset: 10px; border: 1px solid rgb(217 183 122 / .75); }
</style></head><body class="js">${marchio.sprite}<div class="og"><div><div class="insegna" data-luce="accesa">${marchio.larga}</div>
<p>Caffè al banco, pranzo veloce e aperitivo in centro a Piacenza.</p><small>Guarda se siamo aperti, apri il menu, prenota su WhatsApp.</small></div>
<figure><img src="${img}" alt=""></figure></div></body></html>`;
const file = path.join(tmp, 'og.html');
fs.writeFileSync(file, pagina);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await p.goto(pathToFileURL(file).href);
await p.evaluate(() => document.fonts.ready);
const shot = await p.screenshot({ type: 'png' });
await browser.close();
await sharp(shot).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, 'og-image.jpg'));
fs.rmSync(tmp, { recursive: true, force: true });
console.log('icone e og-image pronte');
