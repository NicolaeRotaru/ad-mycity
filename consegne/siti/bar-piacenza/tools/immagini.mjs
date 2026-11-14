// Prepara tutte le immagini del sito in AVIF, WebP e JPG a 480, 960 e 1600 px di larghezza.
// Sorgente: la foto vera in materiale/<nome>.jpg|png|webp|tif, se c'è; altrimenti la tavola
// segnaposto tools/segnaposto/<nome>.svg. Il taglio rispetta il rapporto di ogni spazio.
// Uso: node tools/immagini.mjs            → tutte
//      node tools/immagini.mjs sala tazzine → solo quelle
// Serve sharp (cd tools && npm install).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const destinazione = path.join(root, 'assets/img');
fs.mkdirSync(destinazione, { recursive: true });

// nome → rapporto larghezza/altezza dello spazio nel sito (vedi SHOTLIST.md)
export const SPAZI = {
  'bancone-mattino': 4 / 5, sala: 3 / 2, tazzine: 4 / 5,
  'cappuccino-brioche': 1, bortellina: 1, tagliere: 1, spritz: 1, gutturnio: 1,
  'insegna-sera': 4 / 5, 'bicchieri-aperitivo': 1, 'palazzo-gotico': 1, 'caffe-zucchero': 1,
  'macchina-espresso': 4 / 5, listino: 4 / 5
};
const LARGHEZZE = [480, 960, 1600];

function sorgente(nome) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff']) {
    const p = path.join(root, 'materiale', `${nome}.${ext}`);
    if (fs.existsSync(p)) return { p, foto: true };
  }
  return { p: path.join(dir, 'segnaposto', `${nome}.svg`), foto: false };
}

async function prepara(nome, rapporto) {
  const { p, foto } = sorgente(nome);
  if (!fs.existsSync(p)) { console.log(`manca la sorgente di ${nome}`); return; }
  const base = foto ? sharp(p).rotate() : sharp(p, { density: 144 });
  const intera = await base.resize({ width: 1600, height: Math.round(1600 / rapporto), fit: 'cover', position: foto ? sharp.strategy.attention : 'centre' }).toBuffer();
  for (const w of LARGHEZZE) {
    const h = Math.round(w / rapporto), img = sharp(intera).resize(w, h);
    await img.clone().avif({ quality: 52, effort: 5 }).toFile(path.join(destinazione, `${nome}-${w}.avif`));
    await img.clone().webp({ quality: 74 }).toFile(path.join(destinazione, `${nome}-${w}.webp`));
    await img.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(path.join(destinazione, `${nome}-${w}.jpg`));
  }
  console.log(`${foto ? 'foto ' : 'tavola'} ${nome} (${p.replace(root + '/', '')})`);
}

const scelti = process.argv.slice(2);
for (const [nome, rapporto] of Object.entries(SPAZI)) if (!scelti.length || scelti.includes(nome)) await prepara(nome, rapporto);
// Trama del marmo per lo sfondo: rumore periodico (la piastrella si ripete senza giunte per costruzione).
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function rumore(size, celle, r) {
  const g = Array.from({ length: celle * celle }, () => r()), m = (i) => ((i % celle) + celle) % celle, s = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = (x / size) * celle, fy = (y / size) * celle, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = s(fx - x0), ty = s(fy - y0);
    const v = (i, j) => g[m(j) * celle + m(i)], a = v(x0, y0), b = v(x0 + 1, y0), c = v(x0, y0 + 1), d = v(x0 + 1, y0 + 1);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
}
async function trama(size = 600) {
  const r = rng(3), ott = [4, 8, 16, 32, 64].map((c) => rumore(size, c, r)), px = Buffer.alloc(size * size * 3);
  const base = [0xEE, 0xF1, 0xEC], vena = [0x9A, 0xA8, 0x9F];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let t = 0, a = 0.5; for (const o of ott) { t += o(x, y) * a; a /= 2; }
    const onda = Math.sin(((x + 2 * y) / size) * 2 * Math.PI + t * 11), fine = Math.sin(((3 * x - y) / size) * 2 * Math.PI + t * 16);
    const k = Math.min(1, Math.pow(1 - Math.abs(onda), 16) * 0.5 + Math.pow(1 - Math.abs(fine), 34) * 0.22) * 0.3;
    for (let c = 0; c < 3; c++) px[(y * size + x) * 3 + c] = Math.round(base[c] + (vena[c] - base[c]) * k);
  }
  await sharp(px, { raw: { width: size, height: size, channels: 3 } }).webp({ quality: 82 }).toFile(path.join(destinazione, 'marmo.webp'));
}
if (!scelti.length || scelti.includes('trama')) { await trama(); console.log('trama del marmo'); }
