// Controllo automatico prima di consegnare. Uso: node tools/controlla.mjs  (esce con 1 se qualcosa non va)
// 1) pagine allineate a site-data.js  2) ogni file locale citato esiste  3) immagini con width/height/alt
// 4) un solo h1 per pagina  5) parole vietate e lorem ipsum  6) peso del JS e della pagina iniziale
// 7) validatore HTML (html-validate, se installato)  8) prove degli orari
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const pagine = ['index.html', 'menu.html', 'privacy.html', '404.html'];
let errori = 0;
const ko = (m) => { errori++; console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);
const corri = (args) => { try { return { ok: true, out: execFileSync('node', args, { cwd: root, encoding: 'utf8' }) }; } catch (e) { return { ok: false, out: (e.stdout || '') + (e.stderr || '') }; } };

console.log('1. Allineamento con site-data.js');
const sinc = corri([path.join(dir, 'sincronizza.mjs'), '--controlla']);
sinc.ok ? ok('pagine, noscript e link statici allineati') : ko(sinc.out.trim());

console.log('2. File locali citati');
const mancanti = new Set();
const citati = (testo, base) => {
  const refs = [];
  for (const m of testo.matchAll(/\s(?:src|href|poster)="([^"#?]+)[^"]*"/g)) refs.push(m[1]);
  for (const m of testo.matchAll(/srcset="([^"]+)"/g)) m[1].split(',').forEach((x) => refs.push(x.trim().split(/\s+/)[0]));
  for (const m of testo.matchAll(/url\(['"]?([^'")#]+)['"]?\)/g)) refs.push(m[1]);
  for (const r of refs) {
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(r) || r === '') continue;
    if (!fs.existsSync(path.join(base, r))) mancanti.add(`${r} (citato da ${path.relative(root, base) || '.'})`);
  }
};
for (const p of pagine) citati(fs.readFileSync(path.join(root, p), 'utf8'), root);
citati(fs.readFileSync(path.join(root, 'assets/css/styles.css'), 'utf8'), path.join(root, 'assets/css'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest'), 'utf8'));
manifest.icons.forEach((i) => { if (!fs.existsSync(path.join(root, i.src))) mancanti.add(`${i.src} (manifest)`); });
const dati = fs.readFileSync(path.join(root, 'assets/js/site-data.js'), 'utf8');
for (const m of dati.matchAll(/img: '([^']+)'/g)) for (const w of [480, 960, 1600]) for (const e of ['avif', 'webp', 'jpg']) if (!fs.existsSync(path.join(root, `assets/img/${m[1]}-${w}.${e}`))) mancanti.add(`assets/img/${m[1]}-${w}.${e} (site-data.js)`);
for (const f of ['og-image.jpg', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml']) if (!fs.existsSync(path.join(root, f))) mancanti.add(f);
mancanti.size ? [...mancanti].forEach((m) => ko('manca ' + m)) : ok('nessun file mancante');

console.log('3–5. Immagini, titoli, testi');
const vietate = ['benvenuti nel nostro bar', 'passione', 'eccellenza', 'qualità superiore', 'esperienza unica', 'a 360 gradi', 'lorem', 'ipsum'];
for (const p of pagine) {
  const html = fs.readFileSync(path.join(root, p), 'utf8');
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const senza = imgs.filter((t) => !/\swidth="\d+"/.test(t) || !/\sheight="\d+"/.test(t) || !/\salt="/.test(t));
  senza.length ? ko(`${p}: ${senza.length} immagini senza width/height/alt`) : ok(`${p}: ${imgs.length} immagini con width, height e alt`);
  const h1 = (html.match(/<h1\b/g) || []).length;
  h1 === 1 ? ok(`${p}: un solo h1`) : ko(`${p}: ${h1} h1`);
  const testo = html.replace(/<[^>]+>/g, ' ').toLowerCase();
  const trovate = vietate.filter((v) => testo.includes(v));
  trovate.length ? ko(`${p}: parole vietate ${trovate.join(', ')}`) : ok(`${p}: nessuna parola vietata`);
}
const trovateDati = vietate.filter((v) => dati.toLowerCase().includes(v));
trovateDati.length ? ko(`site-data.js: parole vietate ${trovateDati.join(', ')}`) : ok('site-data.js: nessuna parola vietata');

console.log('6. Peso');
const kb = (f) => fs.statSync(path.join(root, f)).size / 1024;
const js = kb('assets/js/app.js') + kb('assets/js/site-data.js');
js < 50 ? ok(`JavaScript ${js.toFixed(1)} KB (limite 50)`) : ko(`JavaScript ${js.toFixed(1)} KB oltre il limite di 50`);
// Pagina iniziale nel caso peggiore realistico (telefono 2x): HTML, CSS, JS, font, trama,
// hero a 960 px e tutte le immagini lazy della home a 960 px in AVIF.
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let peso = kb('index.html') + kb('assets/css/styles.css') + js + kb('assets/fonts/bodoni-moda-latin-var.woff2') + kb('assets/fonts/atkinson-hyperlegible-next-latin-var.woff2') + kb('assets/img/marmo.webp');
const nomi = new Set([...home.matchAll(/assets\/img\/([a-z-]+)-960\.avif/g)].map((m) => m[1]));
for (const m of dati.matchAll(/img: '([^']+)'/g)) nomi.add(m[1]);
for (const n of nomi) peso += kb(`assets/img/${n}-960.avif`);
peso < 1024 ? ok(`home, caso peggiore senza video: ${peso.toFixed(0)} KB (limite 1024), ${nomi.size} immagini`) : ko(`home ${peso.toFixed(0)} KB oltre 1 MB`);

console.log('7. Validatore HTML');
const hv = path.join(dir, 'node_modules/html-validate/bin/html-validate.mjs');
if (fs.existsSync(hv)) {
  const r = corri([hv, '--config', path.join(dir, 'htmlvalidate.json'), ...pagine]);
  r.ok ? ok('html-validate: nessun errore') : ko('html-validate:\n' + r.out.trim().split('\n').slice(0, 40).join('\n'));
} else console.log('  · html-validate non installato (cd tools && npm install): controllo saltato');

console.log('8. Prove degli orari');
const t = corri([path.join(dir, 'test-orari.mjs')]);
const riga = t.out.trim().split('\n').pop();
t.ok ? ok(riga) : ko(riga);

console.log(errori ? `\n${errori} problemi da sistemare.` : '\nTutto in ordine.');
process.exit(errori ? 1 : 0);
