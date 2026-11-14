// Genera gli SVG del marchio (insegna larga, insegna impilata, wordmark piccolo, favicon)
// dai contorni veri di Bodoni Moda. Uso: node tools/insegna.mjs  → scrive tools/out/*.svg
// Serve solo a chi ridisegna il marchio: il sito usa gli SVG già incollati nell'HTML.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
const dir = path.dirname(fileURLToPath(import.meta.url));
const font = fontkit.openSync(path.join(dir, '../assets/fonts/bodoni-moda-latin-var.woff2'));
const r = (n) => Math.round(n * 100) / 100;

// Contorni di una parola: ritorna path e misure, con l'origine sulla linea di base a sinistra.
function parola(testo, vars, size, spazio = 0) {
  const f = font.getVariation(vars);
  const run = f.layout(testo);
  const sc = size / f.unitsPerEm;
  let x = 0; const pezzi = [];
  run.glyphs.forEach((g, i) => {
    pezzi.push({ g, x });
    x += run.positions[i].xAdvance * sc + spazio;
  });
  const larg = x - spazio;
  const cap = f.capHeight * sc;
  return {
    larg, cap,
    d: (x0, y0) => pezzi.map(({ g, x }) => g.path.scale(sc, -sc).translate(x0 + x, y0).toSVG()).join('')
      .replace(/-?\d+\.\d+/g, (n) => String(r(+n)))
  };
}
const OTT = '#B5894B', OTT_C = '#D9B77A', VERDE = '#12372A', ROSSO = '#B3152B';
const R1 = (str) => str.replace(/-?\d+\.\d+/g, (n) => String(Math.round(+n * 10) / 10));

// Le quattro parole disegnate una volta sola, a corpo 100, con l'origine sulla linea di base.
const P = parola('Piacenza', { opsz: 96, wght: 500 }, 100);
const B = parola('BAR', { opsz: 96, wght: 800 }, 100, 7);
const Ps = parola('Piacenza', { opsz: 24, wght: 600 }, 100);
const Bs = parola('BAR', { opsz: 24, wght: 800 }, 100, 7);
const sprite = `<svg class="sprite" aria-hidden="true" focusable="false"><defs>` +
  `<path id="bp-p" d="${R1(P.d(0, 0))}"/><path id="bp-b" d="${R1(B.d(0, 0))}"/>` +
  `<path id="bp-ps" d="${R1(Ps.d(0, 0))}"/><path id="bp-bs" d="${R1(Bs.d(0, 0))}"/>` +
  `<radialGradient id="bp-vite" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#F1D9A6"/><stop offset=".6" stop-color="${OTT}"/><stop offset="1" stop-color="#7A5A2C"/></radialGradient>` +
  `<radialGradient id="bp-luce" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".7" stop-color="#FBF3E0"/><stop offset="1" stop-color="#F0E2C2"/></radialGradient>` +
  `<filter id="bp-bagliore" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>` +
  `</defs></svg>`;
const usa = (id, x, y, size, attr = '') => `<use href="#${id}" transform="translate(${r(x)} ${r(y)}) scale(${r(size / 100)})"${attr}/>`;

function viti(pos) {
  return pos.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><circle r="5.5" fill="url(#bp-vite)"/><rect x="-4" y="-.7" width="8" height="1.4" rx=".7" fill="#6E5229"/></g>`).join('');
}

function cassonetto(x, y, w, h, size) {
  const larg = B.larg * size / 100, cap = B.cap * size / 100;
  const bx = x + (w - larg) / 2, by = y + h / 2 + cap / 2;
  return `<g class="insegna__cassonetto">` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#BFC5BC"/>` +
    usa('bp-b', bx, by, size, ' fill="#7C3038"') +
    `<g class="insegna__luce"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#bp-luce)"/>` +
    usa('bp-b', bx, by, size, ` fill="${ROSSO}" filter="url(#bp-bagliore)" opacity=".55"`) + usa('bp-b', bx, by, size, ` fill="${ROSSO}"`) + `</g>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="${OTT}" stroke-width="2.5"/></g>`;
}

function insegna(classe, W, H, cass, pz) {
  const larg = P.larg * pz.size / 100;
  const px = pz.x ?? (W - larg) / 2;
  return `<svg class="insegna__svg ${classe}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">` +
    `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="${VERDE}"/>` +
    `<rect x="30" y="30" width="${W - 60}" height="${H - 60}" rx="8" fill="none" stroke="${OTT}" stroke-width="2.2"/>` +
    `<rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="5" fill="none" stroke="${OTT}" stroke-width=".9" opacity=".6"/>` +
    viti([[17, 17, 20], [W - 17, 17, -35], [17, H - 17, 70], [W - 17, H - 17, 5]]) +
    cassonetto(...cass) + usa('bp-p', px, pz.y, pz.size, ` fill="${OTT_C}"`) + `</svg>`;
}

const larga = insegna('insegna__svg--larga', 680, 200, [58, 54, 168, 92, 54], { size: 92, x: 252, y: 135 });
const stretta = insegna('insegna__svg--stretta', 400, 262, [128, 48, 144, 74, 46], { size: 73, y: 205 });

// Wordmark piccolo per header e piè di pagina: cassonetto acceso + «Piacenza» nel colore del testo.
function mini() {
  const bsz = 17, psz = 30, bw = 50, bh = 28, by = 7;
  const bl = Bs.larg * bsz / 100, bc = Bs.cap * bsz / 100;
  const W = Math.ceil(bw + 10 + Ps.larg * psz / 100 + 2);
  return `<svg class="marchio" viewBox="0 0 ${W} 42" aria-hidden="true" focusable="false"><rect x="1" y="${by}" width="${bw - 2}" height="${bh}" rx="3" fill="#FBF6EA" stroke="${OTT}" stroke-width="2"/>` +
    usa('bp-bs', (bw - bl) / 2, by + bh / 2 + bc / 2, bsz, ` fill="${ROSSO}"`) + usa('bp-ps', bw + 10, 31, psz, ' fill="currentColor"') + `</svg>`;
}

function favicon() {
  const b = parola('B', { opsz: 96, wght: 800 }, 46);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${VERDE}"/><rect x="9" y="9" width="46" height="46" rx="5" fill="#FBF6EA" stroke="${OTT}" stroke-width="3"/><path d="${b.d(32 - b.larg / 2, 32 + b.cap / 2)}" fill="${ROSSO}"/></svg>`;
}

const out = path.join(dir, 'out');
fs.mkdirSync(out, { recursive: true });
const snippet = { sprite, larga, stretta, marchio: mini() };
fs.writeFileSync(path.join(out, 'marchio.json'), JSON.stringify(snippet, null, 1));
// Anteprime autonome (sprite incluso) per controllare il disegno.
const solo = (svg) => svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ').replace(/(<svg[^>]*>)/, `$1${sprite.replace(/^<svg[^>]*>|<\/svg>$/g, '')}`);
fs.writeFileSync(path.join(out, 'insegna-larga.svg'), solo(larga));
fs.writeFileSync(path.join(out, 'insegna-stretta.svg'), solo(stretta));
fs.writeFileSync(path.join(out, 'marchio.svg'), solo(mini()).replace('currentColor', VERDE));
fs.writeFileSync(path.join(dir, '../favicon.svg'), favicon());
console.log('ok', Object.fromEntries(Object.entries(snippet).map(([k, v]) => [k, v.length])));
