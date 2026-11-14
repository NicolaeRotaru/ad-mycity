// Riscrive le parti statiche delle pagine partendo da site-data.js e da tools/parti/:
// marchio e icone (sprite), insegna, piè di pagina, barra azioni, <noscript>, link e testi
// con data-bp / data-bp-testo, orari statici, dominio in canonical/OG/sitemap/robots.
// Uso: node tools/sincronizza.mjs            → scrive i file
//      node tools/sincronizza.mjs --controlla → non scrive; esce con 1 se qualcosa è disallineato
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const soloControllo = process.argv.includes('--controlla');

const ctx = { Intl, Date, Math, JSON, String, Number, Object, Array, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['site-data.js', 'app.js']) vm.runInContext(fs.readFileSync(path.join(root, 'assets/js', f), 'utf8'), ctx, { filename: f });
const { data: D, orari: O, util: U } = ctx.BP;
const L = D.locale;
const URL_ = U.link(L);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const leggi = (f) => fs.readFileSync(path.join(dir, 'parti', f), 'utf8').trim();
const marchio = JSON.parse(leggi('marchio.json'));
const sprite = marchio.sprite.replace('</defs></svg>', `${leggi('icone.svg').replace(/\n/g, '')}</defs></svg>`);
const ico = (id) => `<svg class="icona" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;

const i = L.indirizzo;
const testi = {
  telefono: L.telefono.testo, email: L.email, via: i.via, 'cap-citta': `${i.cap} ${i.citta} ${i.provincia}`,
  'indirizzo-breve': `${i.via}, ${i.zona}`, zona: i.zona.charAt(0).toUpperCase() + i.zona.slice(1) + '.',
  instagram: L.social.instagram ? L.social.instagram.nome : '', ragione: L.ragioneSociale, piva: L.partitaIva,
  agenzia: L.agenzia.nome, anno: String(new Date().getFullYear()), parcheggio: L.parcheggio, mezzi: L.mezzi
};
const sintesi = O.sintesiOrari(D.orari.settimana);
const H = ctx.BP.html;

const noscript = `<noscript><div class="contenitore noscript"><p><strong>${esc(L.nome)}</strong>, ${esc(U.indirizzoCompleto(L))}. ` +
  `Telefono <a href="${esc(URL_.tel)}">${esc(L.telefono.testo)}</a>. Orari: ${esc(sintesi.join('; '))}. ` +
  `<a href="menu.html">Apri il menu</a>.</p></div></noscript>`;

function blocco(html, nome, contenuto) {
  return html.replace(new RegExp(`<!-- bp:${nome} -->[\\s\\S]*?<!-- /bp:${nome} -->`, 'g'), `<!-- bp:${nome} -->${contenuto}<!-- /bp:${nome} -->`);
}
function sistema(html) {
  html = blocco(html, 'piede', `\n${leggi('piede.html')}\n`);
  html = blocco(html, 'barra', `\n${leggi('barra.html')}\n`);
  html = blocco(html, 'marchio', marchio.marchio);
  html = blocco(html, 'sprite', sprite);
  html = blocco(html, 'insegna', marchio.stretta + marchio.larga);
  html = blocco(html, 'noscript', noscript);
  // Link: href dal dato; se il dato manca, l'elemento resta nascosto.
  html = html.replace(/<a\b[^>]*\bdata-bp="([a-z]+)"[^>]*>/g, (tag, k) => {
    const u = URL_[k];
    if (!u) return /\shidden\b/.test(tag) ? tag : tag.replace(/>$/, ' hidden>');
    return tag.replace(/href="[^"]*"/, `href="${esc(u)}"`);
  });
  html = html.replace(/(<(\w+)\b[^>]*\bdata-bp-testo="([a-z-]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, ap, _t, k, _v, ch) => (k in testi ? `${ap}${esc(testi[k])}${ch}` : m));
  // Blocchi resi dagli stessi modelli che usa il browser (BP.html in app.js).
  const resi = {
    sintesi: H.sintesi(D.orari.settimana), social: H.social(L.social), orari: H.orari(D.orari.settimana),
    cartello: `<span class="cartello__titolo">Orari</span>${esc(sintesi.join('; '))}`,
    giornata: H.giornata(D), prodotti: H.prodotti(D), galleria: H.galleria(D),
    menu: H.menu(D), categorie: H.categorie(D), allergeni: H.allergeni(D)
  };
  for (const [nome, contenuto] of Object.entries(resi)) html = blocco(html, nome, contenuto);
  // Dominio: tutte le occorrenze del dominio attuale (letto dal canonical) diventano quello dei dati.
  const attuale = (/<link rel="canonical" href="(https?:\/\/[^/"]+)/.exec(html) || [])[1];
  if (attuale && attuale !== L.dominio) html = html.split(attuale).join(L.dominio);
  return html;
}

let diversi = 0;
const pagine = ['index.html', 'menu.html', 'privacy.html', '404.html'];
for (const f of pagine) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  const prima = fs.readFileSync(p, 'utf8'), dopo = sistema(prima);
  if (prima !== dopo) { diversi++; console.log((soloControllo ? 'DISALLINEATO ' : 'aggiornato ') + f); if (!soloControllo) fs.writeFileSync(p, dopo); }
}
for (const f of ['sitemap.xml', 'robots.txt', 'site.webmanifest']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  const prima = fs.readFileSync(p, 'utf8'), dopo = prima.replace(/https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?=\/)/g, (m) => (m.includes('schemas') || m.includes('sitemaps.org') || m.includes('w3.org') ? m : L.dominio));
  if (prima !== dopo) { diversi++; console.log((soloControllo ? 'DISALLINEATO ' : 'aggiornato ') + f); if (!soloControllo) fs.writeFileSync(p, dopo); }
}
console.log(diversi ? `${diversi} file ${soloControllo ? 'da sincronizzare: lancia node tools/sincronizza.mjs' : 'aggiornati'}.` : 'Tutto allineato a site-data.js.');
process.exit(soloControllo && diversi ? 1 : 0);
