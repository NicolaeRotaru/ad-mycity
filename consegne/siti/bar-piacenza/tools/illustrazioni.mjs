// Tavole illustrate SEGNAPOSTO, nel sistema di design del sito (vista frontale o dall'alto,
// palette del bar, marmo vero con le venature, grana leggera). Restano finché non arrivano le
// foto vere della SHOTLIST. Uso: node tools/illustrazioni.mjs → scrive tools/segnaposto/*.svg
// Poi: node tools/immagini.mjs → AVIF, WebP, JPG a 480/960/1600 px in assets/img/.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'segnaposto');
fs.mkdirSync(out, { recursive: true });

const C = {
  verde: '#12372A', notte: '#0C2A1F', marmo: '#ECEFEA', marmo2: '#DDE3DC', ottone: '#B5894B', ottoneC: '#D9B77A',
  ottoneS: '#8A6A37', rosso: '#B3152B', crema: '#FBF6EA', bianco: '#FAFBF8', caffe: '#3A2216', creC: '#B97B45',
  oro: '#D9A257', oroS: '#A9682A', arancia: '#E8862A', vino: '#5E0F1E', legno: '#B88752', legnoS: '#8E6136'
};
const marchio = JSON.parse(fs.readFileSync(path.join(dir, 'parti/marchio.json'), 'utf8'));
const atk = fontkit.openSync(path.join(dir, '../assets/fonts/atkinson-hyperlegible-next-latin-var.woff2'));
const bod = fontkit.openSync(path.join(dir, '../assets/fonts/bodoni-moda-latin-var.woff2'));

// Testo convertito in tracciati (il rasterizzatore non ha i nostri font installati).
function scritta(str, { font = atk, wght = 750, opsz, size = 30, x = 0, y = 0, fill = '#fff', spazio = 0, centro = false }) {
  const f = font.getVariation(opsz ? { wght, opsz } : { wght });
  const run = f.layout(str), sc = size / f.unitsPerEm;
  const larg = run.positions.reduce((s, p) => s + p.xAdvance * sc + spazio, -spazio);
  let cx = centro ? x - larg / 2 : x, d = '';
  run.glyphs.forEach((g, i) => { d += g.path.scale(sc, -sc).translate(cx, y).toSVG(); cx += run.positions[i].xAdvance * sc + spazio; });
  return `<path d="${d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(+n * 10) / 10))}" fill="${fill}"/>`;
}

function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Ogni tavola raccoglie i suoi <defs>.
function tavola(w, h) {
  const defs = new Set();
  const banda = (n, picco, a) => Array.from({ length: n }, (_, i) => (i === a ? picco : Math.abs(i - a) === 1 ? picco * 0.35 : 0)).join(' ');
  const t = {
    w, h, defs,
    def: (s) => { defs.add(s); },
    lin: (id, stops, x2 = 1, y2 = 0) => { defs.add(`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`); return `url(#${id})`; },
    rad: (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => { defs.add(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`); return `url(#${id})`; },
    // Marmo con venature (rumore frattale + una banda sottile = linee di vena).
    marmo(x, y, ww, hh, seed = 7, { base = C.marmo, vena = [0.4, 0.47, 0.43], forza = 0.7, freq = '0.003 0.008', ruota = 0 } = {}) {
      const id = `vene${seed}`;
      defs.add(`<filter id="${id}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="6" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${vena[0]} 0 0 0 0 ${vena[1]} 0 0 0 0 ${vena[2]} 1 0 0 0 0"/><feComponentTransfer><feFuncA type="table" tableValues="${banda(24, forza, 12)}"/></feComponentTransfer></filter>`);
      const clip = `cm${seed}`;
      defs.add(`<clipPath id="${clip}"><rect x="${x}" y="${y}" width="${ww}" height="${hh}"/></clipPath>`);
      return `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="${base}"/><g clip-path="url(#${clip})"><g transform="rotate(${ruota} ${x + ww / 2} ${y + hh / 2})"><rect x="${x - ww * 0.3}" y="${y - hh * 0.3}" width="${ww * 1.6}" height="${hh * 1.6}" filter="url(#${id})"/></g></g>`;
    },
    ombra(cx, cy, rx, ry, op = 0.25, blur = 10) {
      defs.add(`<filter id="sf${blur}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>`);
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.notte}" opacity="${op}" filter="url(#sf${blur})"/>`;
    },
    sfoca: (s, blur = 3) => { defs.add(`<filter id="bl${blur}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${blur}"/></filter>`); return `<g filter="url(#bl${blur})">${s}</g>`; },
    luce(cx, cy, r, colore = '#FFD9A0', op = 0.2) { const id = `lu${Math.round(cx)}${Math.round(cy)}`; return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.rad(id, [[0, colore, op], [1, colore, 0]])}"/>`; },
    fine(corpo) {
      defs.add(`<filter id="grana" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 .05 0 0 0 0 .12 0 0 0 0 .09 0 0 0 -1.4 .78"/></filter>`);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${[...defs].join('')}</defs>${corpo}<rect width="${w}" height="${h}" filter="url(#grana)" opacity=".16"/></svg>`;
    }
  };
  return t;
}

const CROMO = [[0, '#6F7A76'], [0.12, '#E9EEEC'], [0.3, '#A9B2AE'], [0.5, '#F7F9F8'], [0.72, '#8E9894'], [0.9, '#D8DEDB'], [1, '#7D8783']];

// ── Pezzi riusabili ──
function tazzinaLato(t, cx, base, { w = 120, h = 82, crema = true, id = 'tz' } = {}) {
  const g = t.lin(`${id}c`, [[0, '#FFFFFF'], [0.55, '#F1F2EE'], [1, '#C9CEC9']]);
  const top = base - h, a = w / 2, b = w * 0.36;
  return `<path d="M${cx + a - 4} ${top + 18} q20 4 20 26 q0 22 -26 26" fill="none" stroke="#E3E6E2" stroke-width="11" stroke-linecap="round"/>` +
    `<path d="M${cx - a} ${top} L${cx + a} ${top} C${cx + a} ${top + h * 0.7} ${cx + b + 8} ${base} ${cx + b} ${base} L${cx - b} ${base} C${cx - b - 8} ${base} ${cx - a} ${top + h * 0.7} ${cx - a} ${top} Z" fill="${g}"/>` +
    `<ellipse cx="${cx}" cy="${top}" rx="${a}" ry="${w * 0.1}" fill="#F7F8F5" stroke="#D5DAD5" stroke-width="1.5"/>` +
    (crema ? `<ellipse cx="${cx}" cy="${top + 1.5}" rx="${a - 7}" ry="${w * 0.075}" fill="${t.rad(`${id}k`, [[0, '#C98E57'], [0.7, '#A8693A'], [1, '#6E3E1E']])}"/>` : '');
}
function piattinoLato(t, cx, y, rx = 92) {
  return `<ellipse cx="${cx}" cy="${y + 6}" rx="${rx * 0.78}" ry="9" fill="#C5CBC6"/><ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="15" fill="#F8F9F6" stroke="#D5DAD5" stroke-width="1.5"/>`;
}
function tazzinaCapovolta(t, cx, base, w = 120, h = 88, mano = 1) {
  const a = w / 2, b = w * 0.33, top = base - h, g = t.lin('capo', [[0, '#FFFFFF'], [0.5, '#EEF0EC'], [1, '#B9C0BA']]);
  return `<path d="M${cx + mano * (b + 4)} ${top + 26} q${mano * 26} 6 ${mano * 22} 30 q-4 18 ${-mano * 24} 18" fill="none" stroke="#DCE0DB" stroke-width="10" stroke-linecap="round"/>` +
    `<path d="M${cx - b} ${top} L${cx + b} ${top} C${cx + b + 8} ${top} ${cx + a} ${top + h * 0.3} ${cx + a} ${base} L${cx - a} ${base} C${cx - a} ${top + h * 0.3} ${cx - b - 8} ${top} ${cx - b} ${top} Z" fill="${g}"/>` +
    `<rect x="${cx - b + 4}" y="${top - 7}" width="${2 * b - 8}" height="9" rx="3" fill="#E8EBE6"/><rect x="${cx - a}" y="${base - 4}" width="${w}" height="4" fill="#C5CBC6"/>`;
}
function tazzaAlto(t, cx, cy, r, { tipo = 'cappuccino', mano = 30, id = 'ta' } = {}) {
  // Tazza vista dall'alto con il manico; tipo: cappuccino | espresso
  const ang = (mano * Math.PI) / 180, hx = cx + Math.cos(ang) * (r + 18), hy = cy + Math.sin(ang) * (r + 18);
  let dentro;
  if (tipo === 'cappuccino') {
    dentro = `<circle cx="${cx}" cy="${cy}" r="${r * 0.84}" fill="${t.rad(`${id}f`, [[0, '#F7EEDF'], [0.62, '#EBD7B9'], [0.86, '#C58A55'], [1, '#8E5A30']])}"/>` +
      `<path d="M${cx} ${cy + r * 0.42} C${cx - r * 0.62} ${cy - r * 0.02} ${cx - r * 0.42} ${cy - r * 0.5} ${cx} ${cy - r * 0.2} C${cx + r * 0.42} ${cy - r * 0.5} ${cx + r * 0.62} ${cy - r * 0.02} ${cx} ${cy + r * 0.42} Z" fill="#FBF6EC" stroke="#D9B48A" stroke-width="2"/>`;
  } else {
    dentro = `<circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="${t.rad(`${id}e`, [[0, '#7E441F'], [0.35, '#A9652F'], [0.85, '#D49A5C'], [1, '#6B3A1A']])}"/>` +
      `<circle cx="${cx - r * 0.15}" cy="${cy - r * 0.12}" r="${r * 0.22}" fill="#E2B27A" opacity=".45"/>`;
  }
  return t.ombra(cx + 12, cy + 16, r + 10, r + 8, 0.22, 9) +
    `<g transform="rotate(${mano} ${hx} ${hy})"><rect x="${hx - r * 0.42}" y="${hy - r * 0.16}" width="${r * 0.84}" height="${r * 0.32}" rx="${r * 0.16}" fill="#F3F4F1" stroke="#D7DBD6" stroke-width="1.5"/></g>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.rad(`${id}b`, [[0.7, '#FFFFFF'], [1, '#DADFD9']])}" stroke="#D3D8D2" stroke-width="1.5"/>` + dentro +
    `<path d="M${cx - r * 0.7} ${cy - r * 0.7} A${r} ${r} 0 0 1 ${cx + r * 0.2} ${cy - r * 0.98}" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>`;
}
function piattinoAlto(t, cx, cy, r) {
  return t.ombra(cx + 14, cy + 18, r + 6, r + 4, 0.2, 12) + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.rad(`pa${cx}`, [[0.55, '#F2F3F0'], [0.62, '#FFFFFF'], [1, '#E2E6E1']])}" stroke="#D5DAD4" stroke-width="2"/>`;
}
function cucchiaino(t, x, y, rot = -30, l = 120) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${t.ombra(6, 8, l * 0.5, 9, 0.18, 4)}<ellipse cx="0" cy="0" rx="17" ry="11" fill="${t.lin('cu', [[0, '#F4F6F5'], [0.5, '#A7B0AC'], [1, '#E5E9E7']], 0, 1)}"/><rect x="14" y="-3.5" width="${l - 20}" height="7" rx="3.5" fill="#BFC6C2"/></g>`;
}
function fettaCoppa(t, cx, cy, rx, ry, rot, r) {
  let s = `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#F0DAD2"/><ellipse cx="${cx}" cy="${cy}" rx="${rx - 6}" ry="${ry - 6}" fill="#8E2F36"/>`;
  for (let i = 0; i < 9; i++) s += `<ellipse cx="${cx + (r() - 0.5) * rx * 1.2}" cy="${cy + (r() - 0.5) * ry * 1.1}" rx="${4 + r() * 12}" ry="${2 + r() * 5}" fill="#EBC9C0" opacity="${0.55 + r() * 0.4}" transform="rotate(${r() * 180} ${cx} ${cy})"/>`;
  return s + `<ellipse cx="${cx - rx * 0.3}" cy="${cy - ry * 0.35}" rx="${rx * 0.35}" ry="${ry * 0.18}" fill="#fff" opacity=".12"/></g>`;
}
function fettaSalame(t, cx, cy, rr, r) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="#A2363F" stroke="#7C5A4B" stroke-width="3"/>`;
  for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * (rr - 6); s += `<circle cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d}" r="${1.5 + r() * 3.6}" fill="#F4DCD2"/>`; }
  for (let i = 0; i < 6; i++) { const a = r() * 6.28, d = r() * (rr - 8); s += `<circle cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d}" r="1.6" fill="#2A1A14"/>`; }
  return s;
}
function pancetta(t, cx, cy, rr) {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<circle cx="${cx}" cy="${cy}" r="${rr - i * (rr / 5)}" fill="${i % 2 ? '#F6E2DA' : '#D6837F'}"/>`;
  return s;
}
function bicchiereAlto(t, cx, cy, r, liquido, { id, ghiaccio = 3, fetta = true, buccia = false, rocks = false, seed = 1 } = {}) {
  const ri = r * (rocks ? 0.86 : 0.9), rr = rng(seed);
  let s = t.ombra(cx + 16, cy + 20, r + 12, r + 10, 0.2, 12) +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" fill-opacity=".25" stroke="#ffffff" stroke-opacity=".85" stroke-width="${rocks ? 6 : 3}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="${t.rad(`${id}l`, [[0, liquido[0]], [1, liquido[1]]])}" opacity=".93"/>`;
  for (let i = 0; i < ghiaccio; i++) {
    const a = rr() * 6.28, d = rr() * ri * 0.45, q = rocks ? ri * 0.95 : 26 + rr() * 10;
    s += `<rect x="${cx + Math.cos(a) * d - q / 2}" y="${cy + Math.sin(a) * d - q / 2}" width="${q}" height="${q}" rx="${q * 0.22}" fill="#ffffff" fill-opacity=".3" stroke="#ffffff" stroke-opacity=".7" stroke-width="2" transform="rotate(${rr() * 90} ${cx + Math.cos(a) * d} ${cy + Math.sin(a) * d})"/>`;
    if (rocks) break;
  }
  if (fetta) {
    const fx = cx + ri * 0.28, fy = cy - ri * 0.22, fr = ri * 0.45;
    s += `<circle cx="${fx}" cy="${fy}" r="${fr}" fill="${C.arancia}"/><circle cx="${fx}" cy="${fy}" r="${fr - 5}" fill="#F7E3B5"/>`;
    for (let k = 0; k < 9; k++) { const a0 = (k / 9) * 6.283, a1 = ((k + 0.86) / 9) * 6.283, q = fr - 9; s += `<path d="M${fx} ${fy}L${fx + Math.cos(a0) * q} ${fy + Math.sin(a0) * q}A${q} ${q} 0 0 1 ${fx + Math.cos(a1) * q} ${fy + Math.sin(a1) * q}Z" fill="#F39A3A" opacity=".95"/>`; }
  }
  if (buccia) s += `<path d="M${cx - ri * 0.5} ${cy + ri * 0.2} q${ri * 0.4} ${-ri * 0.5} ${ri * 0.95} ${-ri * 0.15}" fill="none" stroke="${C.arancia}" stroke-width="12" stroke-linecap="round"/>`;
  for (let i = 0; i < 10; i++) { const a = rr() * 6.28, d = rr() * ri * 0.85; s += `<circle cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d}" r="${1 + rr() * 2}" fill="#fff" opacity=".55"/>`; }
  return s + `<path d="M${cx - r * 0.75} ${cy - r * 0.62} A${r} ${r} 0 0 1 ${cx + r * 0.1} ${cy - r * 0.99}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>`;
}
function cornetto(t, cx, cy, sc = 1, rot = 0, seed = 3) {
  const r = rng(seed); let s = `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc})">` + t.ombra(14, 22, 150, 70, 0.22, 12);
  const seg = [[-118, 26, 30, 22], [-66, -4, 44, 34], [0, -16, 58, 44], [66, -4, 44, 34], [118, 26, 30, 22]];
  const g = t.rad('corn', [[0, '#F0C27A'], [0.6, '#D79A4D'], [1, '#9E5E25']]);
  seg.forEach(([x, y, rx, ry], i) => { s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${g}" transform="rotate(${(i - 2) * 22} ${x} ${y})" stroke="#9A5B24" stroke-width="2"/>`; });
  for (let i = 0; i < 40; i++) s += `<circle cx="${(r() - 0.5) * 220}" cy="${(r() - 0.6) * 60}" r="${1 + r() * 1.8}" fill="#FFF8E8" opacity=".85"/>`;
  return `${s}<ellipse cx="-10" cy="-38" rx="60" ry="10" fill="#fff" opacity=".18"/></g>`;
}
function insegnaMini(t, x, y, w, accesa = true) {
  // L'insegna del sito, ridotta, con i tracciati veri del marchio.
  const p = /<path id="bp-p" d="([^"]+)"/.exec(marchio.sprite)[1], b = /<path id="bp-b" d="([^"]+)"/.exec(marchio.sprite)[1];
  const sc = w / 680, h = 200 * sc;
  t.def(`<filter id="alone" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>`);
  return `<g transform="translate(${x} ${y}) scale(${sc})">` +
    (accesa ? `<rect x="40" y="20" width="200" height="160" fill="#FFE3B0" opacity=".55" filter="url(#alone)"/>` : '') +
    `<rect x="2" y="2" width="676" height="196" rx="16" fill="${C.verde}"/><rect x="30" y="30" width="620" height="140" rx="8" fill="none" stroke="${C.ottone}" stroke-width="2.2"/>` +
    `<rect x="58" y="54" width="168" height="92" rx="4" fill="${accesa ? '#FFF8EA' : '#BFC5BC'}" stroke="${C.ottone}" stroke-width="2.5"/>` +
    `<path transform="translate(77.4 120) scale(.54)" d="${b}" fill="${C.rosso}"/>` +
    `<path transform="translate(252 135) scale(.92)" d="${p}" fill="${C.ottoneC}"/></g>`;
  void h;
}

// ── Le tavole ──
const T = {};

T['bancone-mattino'] = () => {
  const t = tavola(800, 1000), r = rng(11);
  let s = `<rect width="800" height="660" fill="${t.lin('muro', [[0, '#0E2E23'], [1, '#174334']], 0, 1)}"/>`;
  // mensola sfocata con le bottiglie
  let bott = `<rect x="0" y="236" width="800" height="10" fill="${C.ottoneS}"/>`;
  for (let i = 0; i < 14; i++) { const x = 20 + i * 56 + r() * 10, hh = 90 + r() * 60, col = ['#2E5546', '#6A3A2A', '#8A6A37', '#3E2A22', '#A33A2E', '#5C6E4A'][i % 6]; bott += `<rect x="${x}" y="${236 - hh}" width="34" height="${hh}" rx="9" fill="${col}"/><rect x="${x + 11}" y="${236 - hh - 30}" width="12" height="36" rx="4" fill="${col}"/>`; }
  s += t.sfoca(bott, 5) + t.luce(170, 120, 620, '#FFD9A0', 0.2);
  // macchina dell'espresso
  const cromo = t.lin('cromo', CROMO);
  s += `<rect x="318" y="326" width="454" height="8" rx="4" fill="${cromo}"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${330 + i * 86}" y="326" width="6" height="40" fill="${cromo}"/>`;
  for (let i = 0; i < 5; i++) s += tazzinaCapovolta(t, 380 + i * 82, 366, 62, 40, i % 2 ? 1 : -1);
  s += `<rect x="320" y="364" width="450" height="22" rx="6" fill="${cromo}"/><rect x="330" y="384" width="430" height="256" rx="18" fill="${cromo}"/>` +
    `<rect x="345" y="404" width="400" height="66" rx="10" fill="#26302C"/><rect x="485" y="424" width="120" height="26" rx="3" fill="${C.ottone}"/>` +
    `<circle cx="680" cy="437" r="24" fill="#F6F7F4" stroke="${C.ottone}" stroke-width="5"/><path d="M680 437 l12 -12" stroke="${C.rosso}" stroke-width="3"/>`;
  for (const gx of [430, 640]) {
    s += `<rect x="${gx - 38}" y="482" width="76" height="30" rx="7" fill="${cromo}"/><rect x="${gx - 44}" y="510" width="88" height="24" rx="11" fill="#59625E"/>` +
      `<path d="M${gx + 40} 520 l70 18" stroke="#16191A" stroke-width="16" stroke-linecap="round"/><rect x="${gx - 10}" y="532" width="20" height="14" rx="3" fill="#59625E"/>`;
  }
  s += `<path d="M352 470 q-10 70 6 128" fill="none" stroke="${cromo}" stroke-width="9" stroke-linecap="round"/>` +
    `<rect x="345" y="598" width="400" height="34" rx="5" fill="#252B29"/>`;
  for (let i = 0; i < 26; i++) s += `<rect x="${356 + i * 15}" y="604" width="6" height="22" rx="2" fill="#3D4643"/>`;
  // bancone in marmo
  s += t.marmo(0, 640, 800, 68, 21, { forza: 0.6 }) + `<rect x="0" y="640" width="800" height="26" fill="#ffffff" opacity=".35"/><rect x="0" y="664" width="800" height="3" fill="#C7CEC8"/>` +
    `<rect x="0" y="706" width="800" height="8" fill="#0C2A1F" opacity=".35"/>`;
  s += `<rect x="0" y="708" width="800" height="292" fill="#133A2C"/>`;
  for (let i = 0; i < 32; i++) s += `<rect x="${i * 26}" y="708" width="13" height="292" fill="#0F3125"/>`;
  s += `<rect x="0" y="918" width="800" height="18" rx="9" fill="${t.lin('tubo', [[0, '#F1D9A6'], [0.4, C.ottone], [1, '#6E5229']], 0, 1)}"/>`;
  // in primo piano: espresso, acqua, brioche
  s += t.ombra(214, 664, 110, 12, 0.35, 6) + piattinoLato(t, 210, 650) + tazzinaLato(t, 210, 642, { id: 'hero' });
  s += `<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".22">${t.sfoca('<path d="M196 548 q-14 -30 4 -60 q16 -28 -2 -58"/><path d="M226 552 q12 -26 -4 -52 q-14 -24 4 -48"/>', 4)}</g>`;
  s += `<rect x="252" y="642" width="58" height="7" rx="3.5" fill="#BFC6C2" transform="rotate(-8 280 645)"/>`;
  s += t.ombra(338, 664, 40, 8, 0.3, 5) + `<rect x="306" y="540" width="62" height="114" rx="7" fill="#ffffff" fill-opacity=".14" stroke="#ffffff" stroke-opacity=".6" stroke-width="3"/>` +
    `<rect x="309" y="576" width="56" height="75" rx="5" fill="#CFE3DC" fill-opacity=".35"/><rect x="316" y="548" width="8" height="98" rx="4" fill="#fff" opacity=".45"/>`;
  s += t.ombra(604, 664, 126, 12, 0.3, 6) + piattinoLato(t, 600, 652, 112);
  s += `<g transform="translate(600 640)"><path d="M-92 4 C-96 -26 -60 -60 -24 -58 C-8 -74 30 -72 44 -54 C78 -58 100 -26 94 4 Z" fill="${t.rad('broch', [[0, '#F2C47B'], [0.6, '#D5964A'], [1, '#9E5E25']], 0.45, 0.35, 0.7)}" stroke="#985A24" stroke-width="2"/>` +
    `<path d="M-40 -50 q8 26 4 52 M18 -60 q6 30 2 62" stroke="#A8692C" stroke-width="3" fill="none" opacity=".7"/>`;
  for (let i = 0; i < 26; i++) s += `<circle cx="${(r() - 0.5) * 160}" cy="${-r() * 52}" r="${1.2 + r() * 1.6}" fill="#FFF7E4" opacity=".9"/>`;
  s += `<ellipse cx="-20" cy="-48" rx="38" ry="8" fill="#fff" opacity=".2"/></g>`;
  return t.fine(s);
};

T.sala = () => {
  const t = tavola(900, 600), r = rng(5);
  let s = `<rect width="900" height="600" fill="#E6E2D7"/>` + t.luce(300, 40, 700, '#FFE1B0', 0.25);
  s += `<rect x="62" y="52" width="476" height="252" rx="4" fill="${C.ottone}"/><rect x="70" y="60" width="460" height="236" fill="${t.lin('spec', [[0, '#C6D2CB'], [1, '#9FB2A8']], 1, 1)}"/>`;
  for (const y of [138, 214, 290]) {
    s += `<rect x="70" y="${y}" width="460" height="6" fill="${C.ottoneS}"/>`;
    for (let i = 0; i < 11; i++) { const x = 84 + i * 40 + r() * 8, hh = 46 + r() * 22, col = ['#2E5546', '#7B3A2A', '#B5894B', '#3E2A22', '#B3152B', '#5C6E4A', '#D8CFAE'][(i + y) % 7]; s += `<rect x="${x}" y="${y - hh}" width="24" height="${hh}" rx="6" fill="${col}"/><rect x="${x + 8}" y="${y - hh - 18}" width="8" height="22" rx="3" fill="${col}"/>`; }
  }
  // il listino
  s += `<rect x="604" y="64" width="232" height="198" rx="4" fill="${C.ottone}"/><rect x="612" y="72" width="216" height="182" fill="#163E30"/>`;
  ['CAFFÈ', 'CAPPUCCINO', 'BRIOCHE', 'SPRITZ', 'GUTTURNIO'].forEach((w, i) => { s += scritta(w, { size: 17, x: 628, y: 106 + i * 32, fill: '#F2F2EC', spazio: 1.5 }) + `<rect x="760" y="${94 + i * 32}" width="52" height="12" rx="2" fill="#F2F2EC" opacity=".9"/>`; });
  // lampade
  for (const x of [200, 450, 700]) s += `<rect x="${x - 1}" y="0" width="2" height="34" fill="#3B3B36"/><path d="M${x - 28} 62 L${x - 10} 34 L${x + 10} 34 L${x + 28} 62 Z" fill="${C.ottone}"/>` + t.luce(x, 70, 140, '#FFE2A8', 0.55);
  // macchina sul retro
  s += `<rect x="560" y="268" width="170" height="66" rx="10" fill="${t.lin('cr2', CROMO)}"/><rect x="574" y="282" width="142" height="20" rx="4" fill="#26302C"/>`;
  s += t.marmo(0, 330, 900, 24, 31, { forza: 0.55 }) + `<rect x="0" y="352" width="900" height="168" fill="#133A2C"/>`;
  for (let i = 0; i < 36; i++) s += `<rect x="${i * 26}" y="352" width="13" height="168" fill="#0F3125"/>`;
  s += `<rect x="0" y="486" width="900" height="12" rx="6" fill="${t.lin('tb2', [[0, '#F1D9A6'], [0.4, C.ottone], [1, '#6E5229']], 0, 1)}"/>`;
  // pavimento in graniglia
  s += `<rect x="0" y="520" width="900" height="80" fill="#E2DCCD"/><rect x="0" y="520" width="900" height="6" fill="#B9B19D"/>`;
  for (let i = 0; i < 520; i++) s += `<circle cx="${r() * 900}" cy="${528 + r() * 72}" r="${0.8 + r() * 2.6}" fill="${['#12372A', '#B3152B', '#5E665F', '#B5894B', '#2B2B28', '#FFFFFF', '#8A8F86'][Math.floor(r() * 7)]}" opacity=".8"/>`;
  // sgabelli
  for (const x of [150, 340, 530, 720]) {
    s += t.ombra(x, 586, 64, 8, 0.3, 5) + `<rect x="${x - 4}" y="430" width="8" height="150" fill="${t.lin(`gm${x}`, [[0, '#7C8682'], [0.5, '#EEF2F0'], [1, '#7C8682']])}"/>` +
      `<ellipse cx="${x}" cy="585" rx="52" ry="7" fill="#9AA39F"/><ellipse cx="${x}" cy="500" rx="40" ry="5" fill="none" stroke="${C.ottone}" stroke-width="4"/>` +
      `<rect x="${x - 48}" y="412" width="96" height="22" rx="10" fill="#1F4B3A"/><rect x="${x - 48}" y="430" width="96" height="5" rx="2" fill="${C.ottone}"/>`;
  }
  return t.fine(s);
};

T.tazzine = () => {
  const t = tavola(800, 1000), r = rng(8);
  let s = `<rect width="800" height="1000" fill="${t.lin('muro2', [[0, '#0D2C22'], [1, '#1A4637']], 0, 1)}"/>` + t.luce(200, 160, 700, '#FFD9A0', 0.22);
  let bok = '';
  for (let i = 0; i < 9; i++) bok += `<circle cx="${r() * 800}" cy="${60 + r() * 360}" r="${18 + r() * 40}" fill="#FFE2B0" opacity="${0.06 + r() * 0.1}"/>`;
  s += t.sfoca(bok, 6);
  const cromo = t.lin('cromo3', CROMO);
  s += `<rect x="40" y="470" width="720" height="10" rx="5" fill="${cromo}"/>`;
  for (let i = 0; i < 7; i++) s += `<rect x="${48 + i * 116}" y="470" width="8" height="380" fill="${cromo}"/>`;
  const file = [[5, 820, 128], [4, 724, 128], [3, 628, 128], [2, 532, 128]];
  file.forEach(([n, base, w], k) => { const x0 = 400 - ((n - 1) * w) / 2; for (let i = 0; i < n; i++) s += tazzinaCapovolta(t, x0 + i * w, base, 112, 92, (i + k) % 2 ? 1 : -1); });
  s += `<rect x="20" y="820" width="760" height="40" rx="8" fill="${cromo}"/>`;
  for (let i = 0; i < 46; i++) s += `<circle cx="${44 + i * 16}" cy="840" r="3.2" fill="#3E4744"/>`;
  s += `<rect x="20" y="860" width="760" height="140" fill="${t.lin('corpo3', [[0, '#C9D0CD'], [0.3, '#F2F5F4'], [1, '#8F9995']], 0, 1)}"/>`;
  return t.fine(s);
};

function sfondoMarmo(t, seed, rot = -20) { return t.marmo(0, 0, t.w, t.h, seed, { forza: 0.62, ruota: rot }) + t.luce(150, 120, 700, '#FFFFFF', 0.35); }

T['cappuccino-brioche'] = () => {
  const t = tavola(800, 800);
  let s = sfondoMarmo(t, 41);
  s += `<g transform="rotate(-10 560 560)">${t.ombra(574, 576, 160, 160, 0.16, 14)}<rect x="400" y="400" width="320" height="320" rx="3" fill="#F8F6F0"/><path d="M400 560 H720 M560 400 V720" stroke="#E6E2D6" stroke-width="2"/></g>`;
  s += piattinoAlto(t, 300, 310, 170) + tazzaAlto(t, 300, 310, 112, { id: 'cap', mano: 35 }) + cucchiaino(t, 210, 430, -35, 110);
  s += cornetto(t, 570, 585, 1.15, -28, 4);
  return t.fine(s);
};

T.bortellina = () => {
  const t = tavola(800, 800), r = rng(12);
  let s = sfondoMarmo(t, 43, 15) + t.ombra(418, 428, 292, 292, 0.2, 14) +
    `<circle cx="400" cy="410" r="285" fill="${t.rad('piatto', [[0.78, '#FFFFFF'], [0.82, '#F0F2EE'], [1, '#DDE2DC']])}" stroke="#D4D9D3" stroke-width="2"/>`;
  const crepe = (cx, cy, rot, rr) => {
    let q = `<g transform="rotate(${rot} ${cx} ${cy})">${t.ombra(cx + 8, cy - rr * 0.35, rr * 0.9, rr * 0.5, 0.16, 8)}<path d="M${cx - rr} ${cy} A${rr} ${rr} 0 0 1 ${cx + rr} ${cy} Q${cx} ${cy + 14} ${cx - rr} ${cy} Z" fill="${t.rad('crep', [[0, '#F6E6BF'], [0.8, '#EBCB8C'], [1, '#D7A95E']], 0.5, 0.95, 0.95)}" stroke="#C99A52" stroke-width="2"/>`;
    for (let i = 0; i < 34; i++) { const a = Math.PI + r() * Math.PI, d = r() * rr * 0.92; q += `<ellipse cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d}" rx="${2 + r() * 8}" ry="${1.5 + r() * 4}" fill="#B97F38" opacity="${0.18 + r() * 0.25}"/>`; }
    return q + `<path d="M${cx - rr + 10} ${cy - 4} Q${cx} ${cy + 8} ${cx + rr - 10} ${cy - 4}" fill="none" stroke="#FFF6DE" stroke-width="5" opacity=".7"/></g>`;
  };
  s += crepe(330, 420, 205, 150) + crepe(360, 380, 10, 140);
  s += fettaCoppa(t, 520, 300, 78, 52, 20, r) + fettaCoppa(t, 560, 400, 74, 50, -10, r) + fettaCoppa(t, 520, 500, 72, 48, 15, r);
  s += fettaSalame(t, 280, 560, 40, r) + fettaSalame(t, 360, 590, 40, r) + fettaSalame(t, 440, 580, 38, r);
  return t.fine(s);
};

T.tagliere = () => {
  const t = tavola(800, 800), r = rng(21);
  let s = sfondoMarmo(t, 45, -35);
  s += `<g transform="rotate(-8 400 400)">${t.ombra(420, 424, 330, 210, 0.25, 14)}<rect x="80" y="200" width="560" height="400" rx="26" fill="${t.lin('legno', [[0, '#C69661'], [0.5, '#B6844F'], [1, '#9E6E3D']], 1, 1)}"/>` +
    `<path d="M640 340 h80 a40 40 0 0 1 0 120 h-80 Z" fill="#B07E49"/><circle cx="700" cy="400" r="16" fill="#E8EBE6"/>`;
  for (let i = 0; i < 16; i++) s += `<path d="M90 ${222 + i * 24} q140 ${(r() - 0.5) * 18} 270 0 t270 0" fill="none" stroke="#8E6136" stroke-width="1.6" opacity=".35"/>`;
  s += `<rect x="80" y="200" width="560" height="400" rx="26" fill="none" stroke="#E2B98A" stroke-width="3" opacity=".6"/></g>`;
  s += fettaCoppa(t, 220, 300, 70, 46, -20, r) + fettaCoppa(t, 250, 380, 66, 44, 10, r) + fettaCoppa(t, 210, 460, 68, 46, -5, r);
  for (const [x, y] of [[380, 290], [440, 330], [400, 390], [470, 410], [420, 460]]) s += fettaSalame(t, x, y, 36, r);
  for (const [x, y] of [[560, 300], [590, 380]]) s += pancetta(t, x, y, 34);
  for (const [x, y, rot] of [[330, 540, -12], [440, 545, 8]]) s += `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 58}" y="${y - 34}" width="116" height="68" rx="22" fill="#D9A867"/><rect x="${x - 50}" y="${y - 26}" width="100" height="52" rx="18" fill="#F1DDB4"/></g>`;
  for (const [x, y] of [[560, 480], [600, 540], [530, 560]]) s += `<rect x="${x - 26}" y="${y - 26}" width="52" height="52" rx="16" fill="${t.rad('chis', [[0, '#F3CF8E'], [1, '#C98A3E']])}" transform="rotate(30 ${x} ${y})"/><circle cx="${x - 6}" cy="${y - 6}" r="6" fill="#F8E2B6" opacity=".8"/>`;
  return t.fine(s);
};

T.spritz = () => {
  const t = tavola(800, 800), r = rng(31);
  let s = sfondoMarmo(t, 47, 25) + t.ombra(398, 418, 168, 168, 0.2, 12) + `<circle cx="380" cy="400" r="165" fill="#C9A57A"/>`;
  for (let i = 0; i < 90; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 160; s += `<circle cx="${380 + Math.cos(a) * d}" cy="${400 + Math.sin(a) * d}" r="${1 + r() * 2}" fill="#A8834F" opacity=".6"/>`; }
  s += bicchiereAlto(t, 380, 400, 132, ['#F57E3E', '#CF3F1E'], { id: 'sp', ghiaccio: 4, seed: 4 });
  s += t.ombra(662, 196, 86, 86, 0.18, 10) + `<circle cx="650" cy="180" r="82" fill="#FFFFFF" stroke="#D7DBD6" stroke-width="2"/><circle cx="650" cy="180" r="66" fill="#F1F2EE"/>`;
  for (let i = 0; i < 8; i++) { const a = r() * 6.28, d = r() * 40; s += `<ellipse cx="${650 + Math.cos(a) * d}" cy="${180 + Math.sin(a) * d}" rx="17" ry="13" fill="#7A8A30" transform="rotate(${r() * 180} ${650 + Math.cos(a) * d} ${180 + Math.sin(a) * d})"/><circle cx="${646 + Math.cos(a) * d}" cy="${176 + Math.sin(a) * d}" r="4" fill="#B9C66A" opacity=".7"/>`; }
  s += t.ombra(662, 652, 96, 96, 0.18, 10) + `<circle cx="650" cy="636" r="92" fill="#FFFFFF" stroke="#D7DBD6" stroke-width="2"/>`;
  for (let i = 0; i < 12; i++) { const a = r() * 6.28, d = r() * 52, x = 650 + Math.cos(a) * d, y = 636 + Math.sin(a) * d; s += `<path d="M${x - 24} ${y} q12 -16 24 -4 t24 -2 q-6 18 -24 16 t-24 -10Z" fill="#F0D27E" stroke="#D9AE4E" stroke-width="1.5" transform="rotate(${r() * 180} ${x} ${y})"/>`; }
  return t.fine(s);
};

T.gutturnio = () => {
  const t = tavola(800, 800);
  let s = sfondoMarmo(t, 49, -10);
  s += `<g transform="rotate(-28 360 420)">${t.ombra(380, 450, 330, 70, 0.28, 12)}` +
    `<rect x="60" y="360" width="460" height="128" rx="40" fill="${t.lin('vetro', [[0, '#17241C'], [0.3, '#2E4438'], [0.5, '#1A281F'], [1, '#0D1611']], 0, 1)}"/>` +
    `<path d="M520 368 C580 372 600 402 640 404 L640 444 C600 446 580 476 520 480 Z" fill="#1A281F"/><rect x="636" y="398" width="130" height="52" rx="10" fill="#22342A"/>` +
    `<rect x="700" y="394" width="76" height="60" rx="8" fill="#6E1424"/><rect x="80" y="372" width="440" height="14" rx="7" fill="#7C9487" opacity=".45"/>` +
    `<rect x="200" y="368" width="200" height="112" rx="4" fill="#F1EAD9"/><rect x="210" y="378" width="180" height="92" fill="none" stroke="${C.vino}" stroke-width="2"/>` +
    scritta('GUTTURNIO', { font: bod, wght: 600, opsz: 40, size: 28, x: 300, y: 428, fill: C.vino, centro: true, spazio: 1 }) +
    scritta('COLLI PIACENTINI', { size: 11, x: 300, y: 450, fill: '#5E665F', centro: true, spazio: 1.4 }) + `</g>`;
  s += t.ombra(588, 618, 128, 128, 0.2, 12) + `<circle cx="570" cy="600" r="122" fill="#ffffff" fill-opacity=".2" stroke="#fff" stroke-opacity=".85" stroke-width="3"/>` +
    `<circle cx="570" cy="600" r="104" fill="${t.rad('rosso', [[0, '#A3243C'], [0.6, '#6E1424'], [1, '#3E0711']])}"/><path d="M490 540 A104 104 0 0 1 560 497" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>` +
    `<g transform="rotate(35 230 650)">${t.ombra(236, 660, 50, 20, 0.2, 5)}<rect x="185" y="628" width="96" height="40" rx="14" fill="#C9A57A"/><rect x="185" y="628" width="22" height="40" rx="10" fill="#7A1C2C" opacity=".8"/></g>`;
  return t.fine(s);
};

T['insegna-sera'] = () => {
  const t = tavola(800, 1000), r = rng(17);
  let s = `<rect width="800" height="1000" fill="${t.lin('cielo', [[0, '#0C2A1F'], [1, '#2A4A40']], 0, 1)}"/>`;
  s += `<rect x="0" y="110" width="800" height="830" fill="#B9A585"/><rect x="0" y="110" width="800" height="830" fill="#0C2A1F" opacity=".38"/>`;
  for (const x of [130, 470]) {
    s += `<rect x="${x}" y="170" width="200" height="170" fill="#5A4A36"/>`;
    if (x === 470) s += `<rect x="${x + 10}" y="180" width="180" height="150" fill="${t.lin('fin', [[0, '#F4C986'], [1, '#D99A4E']], 0, 1)}"/>`;
    for (const k of x === 470 ? [-1, 1] : [0, 1]) {
      const sx = x === 470 ? (k < 0 ? x - 90 : x + 200) : x + k * 100;
      s += `<rect x="${sx}" y="170" width="${x === 470 ? 90 : 100}" height="170" fill="#2F5A45"/>`;
      for (let i = 0; i < 13; i++) s += `<rect x="${sx + 6}" y="${178 + i * 12}" width="${(x === 470 ? 90 : 100) - 12}" height="5" fill="#244A38"/>`;
    }
  }
  s += t.luce(570, 250, 260, '#FFD9A0', 0.18);
  s += insegnaMini(t, 70, 390, 660, true);
  // vetrina
  s += `<rect x="96" y="560" width="470" height="350" fill="#1C3D30"/><rect x="112" y="576" width="438" height="318" fill="${t.lin('vetr', [[0, '#F6D59B'], [1, '#E3A055']], 0, 1)}"/>`;
  s += `<rect x="112" y="770" width="438" height="20" fill="#E9E0CF" opacity=".8"/><rect x="112" y="790" width="438" height="104" fill="#264A3B" opacity=".75"/>`;
  for (const x of [200, 330, 460]) s += `<rect x="${x}" y="576" width="2" height="40" fill="#5A4024"/><circle cx="${x + 1}" cy="626" r="14" fill="#FFF3D6"/>` + t.luce(x, 640, 90, '#FFF3D6', 0.6);
  for (let i = 0; i < 9; i++) s += `<rect x="${130 + i * 46}" y="${700 - r() * 20}" width="18" height="${50 + r() * 20}" rx="5" fill="#7A5230" opacity=".55"/>`;
  s += `<rect x="96" y="560" width="470" height="350" fill="none" stroke="${C.ottone}" stroke-width="4"/>`;
  // porta con il cartello
  s += `<rect x="596" y="560" width="128" height="380" fill="#1C3D30"/><rect x="612" y="576" width="96" height="170" fill="${t.lin('porta', [[0, '#F6D59B'], [1, '#E3A055']], 0, 1)}"/>` +
    `<rect x="612" y="770" width="96" height="150" fill="#244A38"/><circle cx="700" cy="760" r="6" fill="${C.ottone}"/>`;
  s += `<path d="M640 600 L660 584 L680 600" fill="none" stroke="${C.ottoneS}" stroke-width="2"/><rect x="622" y="600" width="76" height="40" rx="3" fill="${C.crema}"/>` +
    scritta('APERTO', { size: 15, x: 660, y: 626, fill: C.rosso, centro: true, spazio: 1 });
  // marciapiede
  s += `<rect x="0" y="940" width="800" height="60" fill="#5F625C"/>` + t.luce(330, 960, 380, '#FFD08A', 0.35);
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 100}" y="940" width="2" height="60" fill="#4B4E48"/>`;
  return t.fine(s);
};

T['bicchieri-aperitivo'] = () => {
  const t = tavola(800, 800);
  let s = sfondoMarmo(t, 51, 40) + t.ombra(420, 424, 330, 330, 0.25, 14) +
    `<circle cx="400" cy="400" r="330" fill="${t.lin('vass', [[0, '#F1D9A6'], [0.45, C.ottone], [1, '#7A5A2C']], 1, 1)}"/><circle cx="400" cy="400" r="306" fill="${t.rad('vass2', [[0, '#D9B77A'], [1, '#B08345']])}"/>`;
  s += bicchiereAlto(t, 280, 300, 112, ['#F57E3E', '#CF3F1E'], { id: 'a1', ghiaccio: 3, seed: 7 });
  s += bicchiereAlto(t, 520, 330, 100, ['#D2283A', '#8E1424'], { id: 'a2', ghiaccio: 3, seed: 9 });
  s += bicchiereAlto(t, 400, 540, 104, ['#A61B30', '#5E0F1E'], { id: 'a3', rocks: true, fetta: false, buccia: true, seed: 11 });
  return t.fine(s);
};

T['palazzo-gotico'] = () => {
  const t = tavola(800, 800), r = rng(23);
  let s = `<rect width="800" height="800" fill="${t.lin('cielo2', [[0, '#C8D6D1'], [1, '#EEF1EC']], 0, 1)}"/>`;
  // merli a coda di rondine
  for (let i = 0; i < 17; i++) { const x = 40 + i * 42.5; s += `<path d="M${x + 4} 230 V178 L${x + 19} 194 L${x + 34} 178 V230 Z" fill="#9C3F2A"/>`; }
  s += `<rect x="40" y="226" width="720" height="250" fill="#A9472F"/>`;
  for (let y = 232; y < 476; y += 10) for (let x = 40 + ((y / 10) % 2) * 12; x < 760; x += 24) s += `<rect x="${x}" y="${y}" width="22" height="8" fill="${r() > 0.5 ? '#B04E34' : '#9E412B'}"/>`;
  for (const x of [110, 270, 430, 590]) {
    s += `<path d="M${x} 430 V330 Q${x + 50} 262 ${x + 100} 330 V430 Z" fill="#EFE8DC"/><path d="M${x + 12} 424 V334 Q${x + 50} 280 ${x + 88} 334 V424 Z" fill="#26362F"/>` +
      `<rect x="${x + 46}" y="300" width="8" height="124" fill="#EFE8DC"/><circle cx="${x + 50}" cy="318" r="14" fill="#EFE8DC"/>`;
  }
  // portico in marmo
  s += `<rect x="40" y="476" width="720" height="290" fill="#E8E1D4"/>`;
  for (let i = 0; i < 5; i++) {
    const x = 62 + i * 140;
    s += `<path d="M${x} 766 V600 Q${x + 60} 480 ${x + 120} 600 V766 Z" fill="${t.lin(`arco${i}`, [[0, '#2E3F37'], [1, '#18241F']], 0, 1)}"/>` +
      `<path d="M${x} 600 Q${x + 60} 480 ${x + 120} 600" fill="none" stroke="#C9A79A" stroke-width="10"/>`;
  }
  s += `<rect x="40" y="476" width="720" height="10" fill="#CFC5B4"/><rect x="0" y="766" width="800" height="34" fill="#9C9A90"/>`;
  return t.fine(s);
};

T['caffe-zucchero'] = () => {
  const t = tavola(800, 800), r = rng(27);
  let s = sfondoMarmo(t, 53, -5);
  s += piattinoAlto(t, 270, 300, 128) + tazzaAlto(t, 270, 300, 74, { tipo: 'espresso', id: 'e1', mano: 20 }) + cucchiaino(t, 190, 390, -20, 96);
  s += piattinoAlto(t, 540, 520, 128) + tazzaAlto(t, 540, 520, 74, { tipo: 'espresso', id: 'e2', mano: 200 }) + cucchiaino(t, 620, 420, 160, 96);
  for (const [x, y, rot] of [[560, 210, 25], [610, 280, -10], [230, 600, -30]]) {
    s += `<g transform="rotate(${rot} ${x} ${y})">${t.ombra(x + 6, y + 8, 70, 24, 0.16, 5)}<rect x="${x - 68}" y="${y - 23}" width="136" height="46" rx="3" fill="#FAF8F2"/><rect x="${x - 68}" y="${y - 23}" width="22" height="46" fill="${C.verde}"/>` +
      scritta('ZUCCHERO', { size: 14, x: x + 10, y: y + 5, fill: C.verde, centro: true, spazio: 1.5 }) + `</g>`;
  }
  for (let i = 0; i < 40; i++) s += `<rect x="${380 + r() * 120}" y="${330 + r() * 80}" width="2.4" height="2.4" fill="#fff" transform="rotate(${r() * 90} 440 370)"/>`;
  return t.fine(s);
};

T['macchina-espresso'] = () => {
  const t = tavola(800, 1000);
  let s = `<rect width="800" height="1000" fill="${t.lin('muro3', [[0, '#0E2E23'], [1, '#174334']], 0, 1)}"/>` + t.luce(240, 200, 700, '#FFD9A0', 0.22);
  const cromo = t.lin('cromo4', CROMO);
  s += `<rect x="0" y="0" width="800" height="120" fill="${cromo}"/><rect x="230" y="110" width="340" height="210" rx="34" fill="${cromo}"/>`;
  for (const x of [262, 538]) s += `<circle cx="${x}" cy="200" r="12" fill="#8E9894" stroke="#F4F6F5" stroke-width="3"/>`;
  s += `<rect x="250" y="318" width="300" height="74" rx="22" fill="#5C6662"/><rect x="250" y="318" width="300" height="18" rx="9" fill="#9AA39F"/>` +
    `<path d="M252 355 L40 330" stroke="#121516" stroke-width="44" stroke-linecap="round"/><path d="M200 340 L60 322" stroke="#3B4140" stroke-width="6" stroke-linecap="round"/>`;
  for (const x of [360, 440]) s += `<path d="M${x - 16} 392 h32 l-8 40 h-16 Z" fill="#7E8884"/>`;
  s += `<path d="M360 432 C356 520 368 600 362 688" stroke="${t.lin('flusso', [[0, '#5B3216'], [1, '#C8894F']], 0, 1)}" stroke-width="9" fill="none" stroke-linecap="round"/>` +
    `<path d="M440 432 C446 520 434 600 440 688" stroke="url(#flusso)" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  s += t.ombra(400, 846, 140, 12, 0.35, 6) + piattinoLato(t, 400, 834, 120) + tazzinaLato(t, 400, 826, { w: 160, h: 112, id: 'mac' });
  s += `<rect x="60" y="848" width="680" height="60" rx="6" fill="#232927"/>`;
  for (let i = 0; i < 40; i++) s += `<rect x="${76 + i * 16.4}" y="858" width="7" height="40" rx="2" fill="#3A4340"/>`;
  s += `<rect x="40" y="908" width="720" height="92" fill="${t.lin('corpo4', [[0, '#C9D0CD'], [0.3, '#F2F5F4'], [1, '#8F9995']], 0, 1)}"/>`;
  return t.fine(s);
};

T.listino = () => {
  const t = tavola(800, 1000);
  let s = `<rect width="800" height="1000" fill="#EFF0EC"/>`;
  for (let y = 0; y < 1000; y += 40) { s += `<rect x="0" y="${y}" width="800" height="2" fill="#D3D7D1"/>`; for (let x = ((y / 40) % 2) * 60; x < 800; x += 120) s += `<rect x="${x}" y="${y}" width="2" height="40" fill="#D3D7D1"/>`; }
  s += t.luce(400, 100, 700, '#FFE1B0', 0.25) + t.ombra(412, 520, 330, 380, 0.3, 18);
  s += `<rect x="100" y="140" width="600" height="720" rx="6" fill="${t.lin('cornice', [[0, '#F1D9A6'], [0.5, C.ottone], [1, '#7A5A2C']], 1, 1)}"/><rect x="118" y="158" width="564" height="684" fill="#163E30"/>`;
  for (let y = 176; y < 842; y += 30) s += `<rect x="118" y="${y}" width="564" height="2" fill="#0F2F23"/>`;
  const righe = [['BAR PIACENZA', 30, true], ['', 0], ['CAFFETTERIA', 20], ['ESPRESSO', 24], ['CAPPUCCINO', 24], ['BRIOCHE', 24], ['', 0], ['APERITIVO', 20], ['SPRITZ', 24], ['GUTTURNIO', 24], ['TAGLIERE', 24]];
  let y = 236;
  for (const [w, sz, centro] of righe) {
    if (w) s += scritta(w, { size: sz, x: centro ? 400 : 160, y, fill: sz === 20 ? '#D9B77A' : '#F4F4EF', spazio: 3, centro });
    y += w ? (sz === 30 ? 62 : 52) : 26;
  }
  for (const [x, yy] of [[112, 152], [688, 152], [112, 848], [688, 848]]) s += `<circle cx="${x}" cy="${yy}" r="7" fill="url(#vite)"/>`;
  t.def(`<radialGradient id="vite" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#F1D9A6"/><stop offset=".6" stop-color="${C.ottone}"/><stop offset="1" stop-color="#7A5A2C"/></radialGradient>`);
  return t.fine(s);
};

const solo = process.argv.slice(2);
for (const [nome, f] of Object.entries(T)) {
  if (solo.length && !solo.includes(nome)) continue;
  fs.writeFileSync(path.join(out, `${nome}.svg`), f());
}
console.log('ok', fs.readdirSync(out).length, 'tavole in', out);
