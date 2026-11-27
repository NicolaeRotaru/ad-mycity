#!/usr/bin/env node
/**
 * IL SITO DEL CAFFÈ DI PIACENZA, VERSIONE BUSINESS — 27/11/2026.
 *
 * Nicola, 27/11 ~17:05: «crea la versione business di questo sito» (la bozza è l'artifact
 * «Caffè di Piacenza», claude.ai/artifact/6aP9N3PwL727d2acTcPLBT). Il Business dice
 * «Un sito completo di più pagine, col tuo nome» (FASCE in mycity lib/agenzia/preventivo.ts).
 * Rispetto alla bozza, una pagina vera per ogni voce (indirizzo, titolo e descrizione suoi),
 * i dati per Google, l'anteprima per WhatsApp, la barra «Chiama / Indicazioni» sul telefono,
 * la mappa, il collegamento alla vetrina MyCity.
 *
 * Regole: niente prezzi e niente dati inventati; i testi vengono dalla bozza dell'AD già nel
 * pannello del negozio (tabella bozze_sito, scritta il 27/11 alle 17:30) e dalle sue fonti.
 * Finché il titolare non dice sì il sito resta nascosto a Google (noindex) e porta la riga
 * «Anteprima»: per toglierle metti CONFERMATO = true e rilancia.
 *
 * Uso:  node consegne/clienti/caffe-di-piacenza/costruisci-sito.mjs
 *       SITO_URL=https://indirizzo-vero node …   (l'indirizzo per anteprime e sitemap)
 * Scrive la cartella sito/ accanto a questo file: è quella che va su Vercel così com'è.
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));
const OUT = join(QUI, 'sito');
const BASE = (process.env.SITO_URL || 'https://caffe-di-piacenza.vercel.app').replace(/\/+$/, '');
const CONFERMATO = false; // il titolare ha confermato testi, orari e menu?

/* ───────────────────────── i dati del locale ───────────────────────── */
const L = {
  nome: 'Caffè di Piacenza',
  sottotitolo: 'Caffetteria, pasticceria, pranzi e aperitivi sotto i portici di Piazza Duomo',
  via: 'Piazza Duomo 8', cap: '29121', citta: 'Piacenza',
  telefono: '0523 693283', telefonoLink: '+390523693283',
  email: 'caffedipiacenza@gmail.com',
  lat: 45.0510, lon: 9.6977,
  vetrina: 'https://mycity-marketplace.com/store/429d0e22-4b3f-40db-8f81-ab331701fb81',
  tripadvisor: 'https://www.tripadvisor.it/Restaurant_Review-g187805-d13484948-Reviews-Caffe_di_Piacenza-Piacenza_Province_of_Piacenza_Emilia_Romagna.html',
  sdg: process.env.SDG_URL || '',
};
// Orari in minuti, domenica = 0. Fonte: bozza dell'AD (lun-sab 7:30-19:30, domenica chiuso), da confermare.
const ORARI = [null, [450, 1170], [450, 1170], [450, 1170], [450, 1170], [450, 1170], [450, 1170]];
const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const GIORNI_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDINE = [1, 2, 3, 4, 5, 6, 0];
// Natale a Piacenza 2026, dal programma del Comune (fonte già citata nella bozza). [giorno, settimana, titolo, testo, in Piazza Duomo]
const DICEMBRE = [
  ['2026-12-01', 'martedì', 'Calendario dell’Avvento al Kronos', 'Al museo della Cattedrale, dalle 15:30 alle 17:30.', true],
  ['2026-12-06', 'domenica', 'Mercati di Natale in Piazza Duomo', 'I Mercanti di Qualità in piazza dalle 8 alle 19:30.', true],
  ['2026-12-08', 'martedì', 'Immacolata', 'Babbo Natale e spettacolo di bolle giganti alle 17 in Piazza Cavalli.', false],
  ['2026-12-13', 'domenica', 'Manufatto in Piazza Duomo', 'Il mercato di chi crea con le proprie mani, dalle 8 alle 20. In Piazza Cavalli l’A/mano Market sotto Palazzo Gotico.', true],
  ['2026-12-20', 'domenica', 'Babbo Running', 'La corsa con il cappello di Babbo Natale, dalle 10:30 da Piazza Cavalli.', false],
  ['2026-12-24', 'giovedì', 'Vigilia', 'Ultimo giorno del Mercatino di Natale di Piazza Cavalli, dalle 10 alle 19.', false],
  ['2026-12-26', 'sabato', 'Santo Stefano in Cupola', 'In Cattedrale alle 17:30.', true],
  ['2026-12-31', 'giovedì', 'San Silvestro', 'Concerto al Teatro Municipale alle 18:30.', false],
];
const MENU = [
  ['Caffetteria', ['Caffè e cappuccino', 'Cioccolata calda', 'Tè', 'Affogato al caffè']],
  ['Pasticceria', ['Brioche alla crema pasticciera', 'Cannoli', 'Torte e dolci della vetrina']],
  ['Pranzo', ['Panini con coppa piacentina', 'Altre proposte del giorno']],
  ['Aperitivo', ['Vini al calice', 'Salumi del territorio', 'Spritz e gin tonic', 'Patatine e olive con il drink']],
];

/* ───────────────────────── piccoli attrezzi ───────────────────────── */
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hh = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const giornoDic = (iso) => Number(iso.slice(8, 10));
const MAPPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${L.nome}, ${L.via}, ${L.citta}`)}`;
const EST = ' target="_blank" rel="noopener"'; // dentro il pannello MyCity il sito sta in un riquadro: i siti esterni si aprono a parte
const OSM = `https://www.openstreetmap.org/export/embed.html?bbox=${L.lon - 0.003}%2C${L.lat - 0.0015}%2C${L.lon + 0.003}%2C${L.lat + 0.0015}&layer=mapnik&marker=${L.lat}%2C${L.lon}`;

const PAGINE = [
  { id: 'home', href: '/', voce: 'Home', titolo: `${L.nome} · Bar storico in Piazza Duomo a Piacenza`, descr: 'Colazione, pranzo e aperitivo ai tavolini sotto i portici di Piazza Duomo, con la cattedrale davanti. Piazza Duomo 8, Piacenza.' },
  { id: 'bar', href: '/il-bar/', voce: 'Il bar', titolo: `Il bar · ${L.nome}`, descr: 'Un bar storico di Piacenza sotto i portici di Piazza Duomo, con una nuova gestione dal 2021 e la vista sul Duomo.' },
  { id: 'menu', href: '/menu/', voce: 'Menu', titolo: `Menu · ${L.nome}`, descr: 'Caffetteria, pasticceria, panini con la coppa piacentina e aperitivo con vini e salumi del territorio.' },
  { id: 'dicembre', href: '/dicembre/', voce: 'Dicembre', titolo: `Dicembre in Piazza Duomo · ${L.nome}`, descr: 'Gli appuntamenti di Natale 2026 in Piazza Duomo e a due passi dal bar: mercati, Manufatto, Santo Stefano in Cupola.' },
  { id: 'contatti', href: '/contatti/', voce: 'Contatti', titolo: `Orari e contatti · ${L.nome}`, descr: `${L.via}, ${L.citta}. Telefono ${L.telefono}. Orari, mappa e indicazioni per arrivare.` },
];

/* ───────────────────────── la scena del Duomo (SVG) ───────────────────────── */
function scena() {
  let raggi = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    raggi += `<line x1="230" y1="170" x2="${(230 + 44 * Math.cos(a)).toFixed(1)}" y2="${(170 + 44 * Math.sin(a)).toFixed(1)}"/>`;
  }
  let portico = 'M0 0H1200V440H0Z';
  for (const [x, x2] of [[80, 400], [440, 760], [800, 1120]]) {
    const w = x2 - x;
    portico += `M${x} 440V200Q${x} 64 ${x + w / 2} 64Q${x2} 64 ${x2} 200V440Z`;
  }
  return `<svg class="scene" viewBox="0 0 1200 440" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Il Duomo di Piacenza visto dai tavolini sotto i portici del ${esc(L.nome)}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d7fb8"/><stop offset=".7" stop-color="#e9b9a0"/><stop offset="1" stop-color="#f3d2bd"/></linearGradient>
<linearGradient id="stoneG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8ad92"/><stop offset="1" stop-color="#c79579"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98468"/><stop offset="1" stop-color="#a87257"/></linearGradient>
<g id="tbl"><ellipse cx="0" cy="48" rx="34" ry="6" fill="#000" opacity=".25"/><rect x="-3" y="8" width="6" height="40" fill="#1c110b"/><ellipse cx="0" cy="8" rx="30" ry="6" fill="#f2e6dc"/></g>
<g id="chr"><rect x="-11" y="18" width="22" height="5" fill="#1c110b"/><rect x="-11" y="-8" width="4" height="56" fill="#1c110b"/><rect x="7" y="20" width="4" height="28" fill="#1c110b"/></g>
</defs>
<rect width="1200" height="440" fill="url(#sky)"/>
<g transform="translate(860 0)">
<rect x="0" y="70" width="70" height="300" fill="url(#shade)"/><rect x="0" y="70" width="10" height="300" fill="#c99a7e"/>
<g fill="#7a4a35"><rect x="18" y="110" width="12" height="28" rx="6"/><rect x="40" y="110" width="12" height="28" rx="6"/><rect x="18" y="190" width="12" height="28" rx="6"/><rect x="40" y="190" width="12" height="28" rx="6"/></g>
<path d="M-6 70h82l-41-50z" fill="#a46a50"/><path d="M35 20v-14" stroke="#7a4a35" stroke-width="3"/><path d="M27 8q8-10 16 0l-8 6z" fill="#c9893f"/>
<g stroke="#2a1a11" stroke-width="2" fill="none"><rect x="74" y="150" width="18" height="26"/><path d="M80 150v26M86 150v26"/><path d="M70 150h26"/></g>
</g>
<g transform="translate(370 0)">
<path d="M0 370V170L230 60 460 170V370z" fill="url(#stoneG)"/><path d="M230 60 460 170V370H230z" fill="#000" opacity=".06"/>
<path d="M0 170 230 60 460 170" fill="none" stroke="#f0d6c3" stroke-width="5"/>
<g fill="none" stroke="#b07d63" stroke-width="2"><path d="M40 160l20-10 20-10 20-10 20-10 20-10 20-10 20-10 20-10 20-10"/><path d="M420 160l-20-10-20-10-20-10-20-10-20-10-20-10-20-10-20-10-20-10"/></g>
<circle cx="230" cy="170" r="54" fill="#a87257"/><circle cx="230" cy="170" r="46" fill="#5a3527"/>
<g stroke="#e8c3a8" stroke-width="3">${raggi}</g><circle cx="230" cy="170" r="10" fill="#e8c3a8"/>
<rect x="0" y="250" width="460" height="10" fill="#f0d6c3" opacity=".7"/>
<g fill="#4a2b1f"><path d="M80 370v-70q30-34 60 0v70z"/><path d="M190 370v-90q40-44 80 0v90z"/><path d="M320 370v-70q30-34 60 0v70z"/></g>
<path d="M180 290h100l-50-40z" fill="#c99a7e"/>
</g>
<rect x="0" y="370" width="1200" height="70" fill="#d9b49b"/><rect x="0" y="370" width="1200" height="4" fill="#c49b80"/>
<path fill-rule="evenodd" fill="#2c1a11" d="${portico}"/>
<use href="#chr" x="96" y="378"/><use href="#tbl" x="140" y="370"/>
<use href="#tbl" x="1060" y="370"/><use href="#chr" x="1104" y="378" transform="scale(-1 1) translate(-2208 0)"/>
<g transform="translate(128 368)"><path d="M0 0h14l-2 9H2z" fill="#fff"/><path d="M14 2q5 0 4 4t-5 2" fill="none" stroke="#fff" stroke-width="2"/><ellipse cx="7" cy="9" rx="11" ry="2.4" fill="#2453c9"/><path class="steam" d="M5-6q-3-6 1-12M10-6q3-6-1-12" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></g>
<g transform="translate(1048 360)"><path d="M0 0h18v6q0 10-9 10t-9-10z" fill="#fff"/><path d="M2 0q7-8 14 0" fill="#e9a35f"/></g>
</svg>`;
}

/* ───────────────────────── pezzi comuni ───────────────────────── */
const tabellaOrari = () => `<table class="hours"><caption class="sr">Orari di apertura</caption><tbody>${ORDINE.map((d) => `<tr data-giorno="${d}"><th scope="row">${GIORNI[d]}</th><td>${ORARI[d] ? `${hh(ORARI[d][0])}–${hh(ORARI[d][1])}` : 'Chiuso'}</td></tr>`).join('')}</tbody></table>`;

const datiGoogle = () => {
  const giorniAperti = ORDINE.filter((d) => ORARI[d]);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: L.nome,
    description: L.sottotitolo,
    url: `${BASE}/`,
    image: `${BASE}/og.png`,
    telephone: '+39 0523 693283',
    email: L.email,
    address: { '@type': 'PostalAddress', streetAddress: L.via, postalCode: L.cap, addressLocality: L.citta, addressRegion: 'PC', addressCountry: 'IT' },
    geo: { '@type': 'GeoCoordinates', latitude: L.lat, longitude: L.lon },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: giorniAperti.map((d) => GIORNI_EN[d]), opens: hh(ORARI[1][0]), closes: hh(ORARI[1][1]) }],
    servesCuisine: ['Caffetteria', 'Pasticceria', 'Aperitivo'],
    sameAs: [L.tripadvisor],
  }).replace(/</g, '\\u003c');
};

function pagina(p, corpo) {
  const url = `${BASE}${p.href}`;
  const nav = PAGINE.map((q) => `<a class="p" href="${q.href}"${q.id === p.id ? ' aria-current="page"' : ''}>${q.voce}</a>`).join('');
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.titolo)}</title>
<meta name="description" content="${esc(p.descr)}">
${CONFERMATO ? '' : '<meta name="robots" content="noindex, nofollow">\n'}<link rel="canonical" href="${url}">
<meta name="theme-color" content="#2c1a11">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="${esc(L.nome)}">
<meta property="og:title" content="${esc(p.titolo)}">
<meta property="og:description" content="${esc(p.descr)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=Figtree:wght@400;600;700&display=swap">
<link rel="stylesheet" href="/assets/stile.css">
${p.id === 'home' || p.id === 'contatti' ? `<script type="application/ld+json">${datiGoogle()}</script>\n` : ''}<script src="/assets/sito.js" defer></script>
</head>
<body>
<a class="salta" href="#contenuto">Vai al contenuto</a>
${CONFERMATO ? '' : '<div class="note">Anteprima del sito: testi, orari e menu sono in verifica con il titolare.</div>\n'}<header class="top">
<nav class="nav" aria-label="Pagine del sito">
<a class="logo" href="/">${esc(L.nome)}</a>
${nav}
<a class="btn small chiama" href="tel:${L.telefonoLink}">Chiama</a>
</nav>
</header>
<main id="contenuto">
${corpo}
</main>
<footer class="band piede">
<div class="wrap cols">
<div><p class="piede-nome">${esc(L.nome)}</p><p class="small">Bar storico di Piazza Duomo</p><p class="small"><span class="stato-mini" data-stato>Orari: lunedì–sabato 7:30–19:30</span></p></div>
<div><p>${esc(L.via)}, ${L.cap} ${esc(L.citta)}</p><p><a href="tel:${L.telefonoLink}">${esc(L.telefono)}</a></p><p><a href="mailto:${L.email}">${esc(L.email)}</a></p></div>
<div><nav aria-label="Pagine del sito, in fondo" class="piede-nav">${PAGINE.map((q) => `<a href="${q.href}">${q.voce}</a>`).join('')}</nav>
<p class="small">Ci trovi anche su <a href="${L.vetrina}"${EST}>MyCity</a>, il marketplace dei negozi di Piacenza.</p>
<p class="small">Sito realizzato da ${L.sdg ? `<a href="${L.sdg}"${EST}>SDG Agenzia</a>` : 'SDG Agenzia'} per MyCity.</p></div>
</div>
</footer>
<div class="azioni" aria-label="Azioni rapide">
<a href="tel:${L.telefonoLink}">Chiama</a>
<a href="${MAPPA}"${EST}>Indicazioni</a>
</div>
</body>
</html>
`;
}

/* ───────────────────────── le cinque pagine ───────────────────────── */
const calendario = (soloPiazza = false) => DICEMBRE.filter((r) => !soloPiazza || r[4]).map((r) => `<li data-data="${r[0]}"${r[4] ? ' class="here"' : ''}><div class="d">${giornoDic(r[0])} dic<small>${r[1]}</small></div><div><h3>${esc(r[2])}${r[4] ? '<span class="tag">in Piazza Duomo</span>' : ''}</h3><p>${esc(r[3])}</p></div></li>`).join('');

const HOME = `<section class="hero">
<div class="wrap">
<h1>${esc(L.nome)}</h1>
<div class="sub">
<p>Il bar storico di Piazza Duomo. Colazione, pranzo e aperitivo ai tavolini sotto i portici, con la cattedrale davanti.</p>
<span class="status"><span class="dot off" aria-hidden="true"></span><span data-stato>Lunedì–sabato 7:30–19:30</span></span>
</div>
</div>
${scena()}
</section>
<section class="band">
<div class="wrap">
<h2>Dalla colazione all'aperitivo</h2>
<p class="lead">Sotto i portici di Piazza Duomo, con il porticato che ripara dal sole e dalla pioggia.</p>
<div class="grid3">
<article class="card"><div class="when">Colazione</div><h3>Caffè e pasticceria</h3><p class="muted">Cappuccino, brioche alla crema pasticciera, cannoli e dolci della vetrina, dalle 7:30.</p></article>
<article class="card"><div class="when">Pranzo</div><h3>Una pausa in centro</h3><p class="muted">Panini, anche con la coppa piacentina, e proposte per chi lavora o visita la città.</p></article>
<article class="card"><div class="when">Aperitivo</div><h3>Vini e salumi</h3><p class="muted">Un calice e i salumi del territorio, con la facciata del Duomo davanti.</p></article>
</div>
<div class="row"><a class="btn" href="/menu/">Guarda il menu</a><a class="btn ghost" href="/contatti/">Orari e indirizzo</a></div>
</div>
</section>
<section class="band stoneband">
<div class="wrap split">
<div>
<h2>Dicembre in Piazza Duomo</h2>
<p class="lead">Due domeniche di mercato proprio davanti ai nostri tavolini, il 6 e il 13 dicembre, e il mercatino di Natale a due passi in Piazza Cavalli.</p>
<div class="row"><a class="btn" href="/dicembre/">Il calendario di dicembre</a></div>
</div>
<div>
<h3 class="prossimi-titolo">I prossimi in piazza</h3>
<ul class="cal compatto" data-prossimi>${calendario(true)}</ul>
</div>
</div>
</section>
<section class="band">
<div class="wrap split">
<div>
<h2>Ti aspettiamo in piazza</h2>
<p class="lead">${esc(L.via)}, sotto i portici, di fronte al Duomo. Il mercoledì e il sabato mattina la piazza si riempie con il mercato cittadino.</p>
<div class="row"><a class="btn" href="tel:${L.telefonoLink}">Chiama lo ${esc(L.telefono)}</a><a class="btn ghost" href="${MAPPA}"${EST}>Indicazioni</a></div>
</div>
<div class="card"><h3>Orari</h3>${tabellaOrari()}<p class="muted fine">Orari in verifica con il titolare.</p></div>
</div>
</section>`;

const BAR = `<section class="band intestazione"><div class="wrap"><p class="occhiello">Il bar</p><h1>Il caffè di piazza, dal mattino</h1></div></section>
<section class="band">
<div class="wrap split">
<div>
<p class="lead">${esc(L.nome)} è un bar storico della città, in Piazza Duomo, sotto i portici e di fronte alla cattedrale.</p>
<p>Dal 2021 ha una nuova gestione, che ha tenuto lo spirito del caffè di piazza: servizio cortese, tavolini all'aperto riparati dal porticato e la vista sul Duomo dalla colazione al tardo pomeriggio.</p>
<p>Il mercoledì e il sabato mattina la piazza si riempie con il mercato cittadino: è il momento giusto per un cappuccino al tavolo.</p>
<div class="row"><a class="btn ghost" href="${L.tripadvisor}"${EST}>Leggi le recensioni su Tripadvisor</a></div>
</div>
<div class="card">
<h3>Da sapere</h3>
<ul class="facts uno">
<li>Tavoli interni</li>
<li>Tavolini sotto i portici</li>
<li>Vista sul Duomo</li>
<li>Nel cuore del centro storico</li>
<li>Mercato in piazza il mercoledì e il sabato mattina</li>
</ul>
</div>
</div>
</section>
<section class="band stoneband">
<div class="wrap">
<h2>La piazza della cattedrale</h2>
<p class="lead">Il Duomo di Piacenza, romanico, del XII secolo, con il campanile e la sua gabbia di ferro. Da qui Piazza Cavalli e Palazzo Farnese sono a pochi minuti a piedi.</p>
<div class="row"><a class="btn" href="/dicembre/">Cosa succede in piazza a dicembre</a></div>
</div>
</section>`;

const MENU_P = `<section class="band intestazione"><div class="wrap"><p class="occhiello">Menu</p><h1>Dalla colazione all'aperitivo</h1></div></section>
<section class="band">
<div class="wrap">
<p class="lead">Quello che si trova al bar, dalla colazione all'aperitivo.</p>
<p class="muted fine">Voci raccolte dal sito del bar e dalle recensioni degli ospiti: il menu completo, con i prezzi, arriva dal titolare.</p>
<div class="menu">
${MENU.map(([t, voci]) => `<section><h2 class="h3">${t}</h2><ul>${voci.map((v) => `<li><span>${esc(v)}</span></li>`).join('')}</ul></section>`).join('\n')}
</div>
<div class="row"><a class="btn" href="tel:${L.telefonoLink}">Chiedi le proposte del giorno</a></div>
</div>
</section>`;

const DIC = `<section class="band intestazione"><div class="wrap"><p class="occhiello">Dicembre</p><h1>Natale in piazza</h1></div></section>
<section class="band">
<div class="wrap">
<p class="lead">Gli appuntamenti di Natale a Piacenza in Piazza Duomo e a due passi da noi. Le date sono quelle del Comune per il 2026.</p>
<ul class="cal" data-calendario>${calendario()}</ul>
<p class="muted fine">Fonte: programma «Natale a Piacenza» del Comune di Piacenza. Gli orari del bar per le feste sono in arrivo.</p>
</div>
</section>`;

const CONTATTI = `<section class="band intestazione"><div class="wrap"><p class="occhiello">Contatti</p><h1>Orari e indirizzo</h1></div></section>
<section class="band">
<div class="wrap split">
<div>
<p class="lead">${esc(L.via)}, sotto i portici<br>${L.cap} ${esc(L.citta)}</p>
<p class="grande"><a href="tel:${L.telefonoLink}">${esc(L.telefono)}</a></p>
<p><a href="mailto:${L.email}">${esc(L.email)}</a></p>
<div class="row">
<a class="btn" href="tel:${L.telefonoLink}">Chiama</a>
<a class="btn ghost" href="mailto:${L.email}">Scrivi una email</a>
<a class="btn ghost" href="${MAPPA}"${EST}>Indicazioni</a>
</div>
</div>
<div class="card">
<h2 class="h3">Orari</h2>
<p class="status chiaro"><span class="dot off" aria-hidden="true"></span><span data-stato>Lunedì–sabato 7:30–19:30</span></p>
${tabellaOrari()}
<p class="muted fine">Orari in verifica con il titolare.</p>
</div>
</div>
</section>
<section class="band mappa-band">
<div class="wrap">
<iframe class="mappa" title="Mappa: ${esc(L.nome)}, ${esc(L.via)}, ${esc(L.citta)}" src="${OSM}" loading="lazy" referrerpolicy="no-referrer"></iframe>
<p class="muted fine"><a href="${MAPPA}"${EST}>Apri in Google Maps</a> · mappa © OpenStreetMap</p>
</div>
</section>`;

const NON_TROVATA = `<section class="band intestazione"><div class="wrap"><p class="occhiello">Pagina non trovata</p><h1>Questa pagina non c'è</h1></div></section>
<section class="band"><div class="wrap"><p class="lead">Forse l'indirizzo è cambiato. Riparti dalla home, oppure chiamaci.</p><div class="row"><a class="btn" href="/">Torna alla home</a><a class="btn ghost" href="tel:${L.telefonoLink}">Chiama</a></div></div></section>`;

/* ───────────────────────── stile e script ───────────────────────── */
const CSS = `:root{color-scheme:light dark;--bg:light-dark(#ffffff,#140d09);--ink:light-dark(#22160f,#f4ebe4);--soft:light-dark(#6e5a4e,#c8b5a8);--esp:light-dark(#3b2418,#2a1a11);--esp2:light-dark(#2c1a11,#1d120c);--stone:light-dark(#e9c9b2,#5c4033);--line:light-dark(#efe1d7,#3a2a20);--tint:light-dark(#fbf5f1,#1f150f);--accent:light-dark(#2453c9,#7ea2ff);--on:#fff}
*{box-sizing:border-box;min-width:0}
html{scroll-padding-top:80px;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 Figtree,system-ui,-apple-system,"Segoe UI",sans-serif;overflow-x:clip}
a{color:inherit}
p a,.piede a{text-underline-offset:3px}
svg,iframe{max-width:100%}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.salta{position:absolute;left:12px;top:-60px;z-index:20;background:var(--accent);color:#fff;padding:10px 14px;border-radius:8px;font-weight:700}
.salta:focus{top:10px}
.band{padding-block:clamp(32px,4.5vw,72px);padding-left:max(5vw,16px,env(safe-area-inset-left,0px));padding-right:max(5vw,16px,env(safe-area-inset-right,0px))}
.wrap{max-width:1240px;margin:0 auto}
.note{background:var(--tint);color:var(--soft);font-size:14px;padding:8px max(5vw,16px);text-align:center}
header.top{position:sticky;top:0;z-index:10;background:var(--esp2);color:var(--on)}
.nav{display:flex;flex-wrap:wrap;align-items:center;gap:4px 18px;max-width:1240px;margin:0 auto;padding:8px max(5vw,16px)}
.logo{font:400 22px/1 Gloock,Georgia,serif;text-decoration:none;margin-right:auto}
.nav a.p{text-decoration:none;padding:10px 4px;font-weight:600;font-size:16px;border-bottom:2px solid transparent;min-height:44px;display:inline-flex;align-items:center}
.nav a.p:hover{border-color:rgba(255,255,255,.35)}
.nav a.p[aria-current=page]{border-color:var(--stone)}
a:focus-visible,.btn:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
header a:focus-visible{outline-color:#9db8ff}
.hero{background:var(--esp);color:var(--on);padding:clamp(28px,4vw,56px) 0 0}
.hero .wrap{padding:0 max(5vw,16px);max-width:calc(1240px + 2*max(5vw,16px))}
.hero h1{font:400 clamp(50px,8.5vw,104px)/1 Gloock,Georgia,serif;letter-spacing:-.02em;margin:0}
.hero .sub{display:flex;flex-wrap:wrap;gap:10px 28px;align-items:baseline;justify-content:space-between;margin-top:14px}
.hero .sub p{margin:0;font-size:clamp(17px,2vw,21px);max-width:40ch;color:#f3e3d7}
.status{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);padding:10px 16px;border-radius:999px;font-weight:600}
.status.chiaro{background:var(--tint);margin:0 0 10px}
.dot{width:10px;height:10px;border-radius:50%;background:#2fa84a;flex:none}
.hero .dot{background:#7ee08a}
.dot.off,.hero .dot.off{background:#d9725f}
.scene{display:block;width:100%;height:clamp(250px,36vw,440px);margin-top:26px}
.intestazione{background:var(--esp);color:var(--on);padding-block:clamp(28px,4vw,56px)}
.intestazione h1{font:400 clamp(40px,6vw,72px)/1.02 Gloock,Georgia,serif;letter-spacing:-.015em;margin:0;text-wrap:balance}
.occhiello{margin:0 0 8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:13px;color:var(--stone)}
h2{font:400 clamp(32px,4.4vw,48px)/1.05 Gloock,Georgia,serif;letter-spacing:-.01em;margin:0 0 12px;text-wrap:balance}
h3,.h3{font:700 21px/1.25 Figtree,sans-serif;margin:0 0 6px}
.lead{font-size:19px;max-width:62ch;margin:0 0 10px}
.muted{color:var(--soft)}
.fine{font-size:14px;margin:12px 0 0}
.grande{font-size:24px;font-weight:700;margin:12px 0 2px}
.grande a{text-decoration:none}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:24px}
.card{border:1px solid var(--line);border-radius:14px;padding:22px;background:var(--bg)}
.card .when{font:400 30px/1 Gloock,Georgia,serif;color:var(--esp);margin-bottom:10px}
.split{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(20px,4vw,56px);align-items:start}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 22px;border-radius:999px;background:var(--accent);color:#fff;font-weight:700;text-decoration:none;border:0;font-size:16px;text-align:center}
.btn:hover{filter:brightness(1.08)}
.btn.ghost{background:transparent;color:inherit;border:2px solid currentColor}
.btn.small{min-height:40px;padding:0 16px;font-size:15px}
.row{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.facts{list-style:none;padding:0;margin:16px 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px}
.facts.uno{grid-template-columns:minmax(0,1fr)}
.facts li{padding-left:22px;position:relative}
.facts li::before{content:"";position:absolute;left:0;top:.55em;width:11px;height:11px;border-radius:50% 50% 0 0;background:var(--esp)}
.stoneband{background:var(--stone);color:var(--ink)}
.hours{width:100%;border-collapse:collapse;font-size:17px}
.hours th,.hours td{padding:10px 0;border-bottom:1px solid var(--line);text-align:left;font-weight:400}
.hours td{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.hours tr.today th,.hours tr.today td{font-weight:700;color:var(--accent)}
.menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 40px;margin-top:24px}
.menu section{border-top:3px solid var(--ink);padding-top:14px}
.menu ul{list-style:none;margin:0;padding:0}
.menu li{padding:9px 0;border-bottom:1px dotted var(--line)}
.cal{list-style:none;margin:20px 0 0;padding:0}
.cal li{display:grid;grid-template-columns:7.5em minmax(0,1fr);gap:18px;padding:16px 0;border-bottom:1px solid var(--line)}
.cal .d{font:400 30px/1 Gloock,Georgia,serif;color:var(--esp);white-space:nowrap}
.cal .d small{display:block;font:600 14px/1.4 Figtree,sans-serif;color:var(--soft);margin-top:4px}
.cal p{margin:2px 0 0;color:var(--soft)}
.cal li.here .d{color:var(--accent)}
.cal li.passato{opacity:.55}
.cal li.passato h3::after{content:" · passato";font-weight:600;font-size:14px;color:var(--soft)}
.cal.compatto{margin-top:8px}
.cal.compatto li{padding:12px 0;grid-template-columns:5.5em minmax(0,1fr);border-color:rgba(0,0,0,.12)}
.cal.compatto .d{font-size:24px}
.cal.compatto p{color:inherit;opacity:.85}
.stoneband .cal .d,.stoneband .cal li.here .d{color:var(--esp)}
.prossimi-titolo{margin-top:6px}
.tag{display:inline-block;font-size:13px;font-weight:700;color:var(--accent);margin-left:6px}
.stoneband .tag{color:var(--esp)}
.mappa-band{padding-top:0}
.mappa{display:block;width:100%;height:clamp(260px,40vw,420px);border:1px solid var(--line);border-radius:14px}
.piede{background:var(--esp2);color:var(--on)}
.piede .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.piede p{margin:4px 0}
.piede-nome{font:400 26px/1.1 Gloock,Georgia,serif}
.piede .small{font-size:14px;color:#e2cfc2}
.piede-nav{display:flex;flex-wrap:wrap;gap:4px 16px;margin-bottom:8px}
.piede-nav a{text-decoration:none;font-weight:600;min-height:32px;display:inline-flex;align-items:center}
.azioni{display:none}
@media(prefers-color-scheme:dark){.card .when,.cal .d{color:var(--stone)}.stoneband{color:#f4ebe4}.stoneband .cal .d,.stoneband .cal li.here .d,.stoneband .tag{color:#f3dccb}.facts li::before{background:var(--stone)}.btn{color:#0d1530}.cal.compatto li{border-color:rgba(255,255,255,.15)}.azioni a:first-child,.salta{color:#0d1530}}
@media(max-width:860px){.grid3,.split,.menu,.piede .cols{grid-template-columns:minmax(0,1fr)}}
@media(max-width:760px){
.chiama{display:none}
.azioni{display:grid;grid-template-columns:1fr 1fr;gap:8px;position:fixed;left:0;right:0;bottom:0;z-index:15;padding:8px max(12px,env(safe-area-inset-left,0px)) calc(8px + env(safe-area-inset-bottom,0px));background:var(--esp2);box-shadow:0 -4px 16px rgba(0,0,0,.25)}
.azioni a{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:999px;font-weight:700;text-decoration:none;background:var(--accent);color:#fff}
.azioni a+a{background:transparent;color:#fff;border:2px solid #fff}
body{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))}
}
@media(max-width:600px){.facts{grid-template-columns:minmax(0,1fr)}.cal li{grid-template-columns:minmax(0,1fr);gap:4px}.cal.compatto li{grid-template-columns:4.6em minmax(0,1fr);gap:10px}.nav{gap:0 14px}.logo{width:100%;padding:6px 0 2px}.status{white-space:normal}}
@media(prefers-reduced-motion:no-preference){.steam{animation:rise 3.2s ease-in-out infinite}}
@keyframes rise{0%{opacity:0;transform:translateY(6px)}40%{opacity:.8}100%{opacity:0;transform:translateY(-14px)}}
`;

const JS = `// Aperto o chiuso adesso (ora di Piacenza), il giorno di oggi negli orari, gli appuntamenti già passati.
(function () {
  var H = ${JSON.stringify(ORARI)};
  var NOMI = ${JSON.stringify(GIORNI)};
  function hh(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function ora() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var v = function (t) { return (p.find(function (x) { return x.type === t; }) || {}).value; };
    return { g: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[v('weekday')], m: (+v('hour') % 24) * 60 + (+v('minute')), data: v('year') + '-' + v('month') + '-' + v('day') };
  }
  function stato(o) {
    var x = H[o.g];
    if (x && o.m >= x[0] && o.m < x[1]) return { aperto: true, testo: 'Aperto ora · chiude alle ' + hh(x[1]) };
    if (x && o.m < x[0]) return { aperto: false, testo: 'Chiuso · apre alle ' + hh(x[0]) };
    for (var i = 1; i < 8; i++) { var d = (o.g + i) % 7; if (H[d]) return { aperto: false, testo: 'Chiuso · apre ' + (i === 1 ? 'domani' : NOMI[d].toLowerCase()) + ' alle ' + hh(H[d][0]) }; }
    return { aperto: false, testo: 'Orari in verifica' };
  }
  function via() {
    var o = ora(), s = stato(o);
    document.querySelectorAll('[data-stato]').forEach(function (el) { el.textContent = s.testo; });
    document.querySelectorAll('.dot').forEach(function (el) { el.classList.toggle('off', !s.aperto); });
    document.querySelectorAll('.hours tr[data-giorno]').forEach(function (tr) {
      var oggi = +tr.getAttribute('data-giorno') === o.g;
      tr.classList.toggle('today', oggi);
      var th = tr.querySelector('th');
      if (oggi && th && th.textContent.indexOf('(oggi)') < 0) th.textContent += ' (oggi)';
    });
    document.querySelectorAll('[data-calendario] li[data-data]').forEach(function (li) { if (li.getAttribute('data-data') < o.data) li.classList.add('passato'); });
    var pr = document.querySelector('[data-prossimi]');
    if (pr) {
      var n = 0;
      pr.querySelectorAll('li[data-data]').forEach(function (li) { var tieni = li.getAttribute('data-data') >= o.data && n < 3; if (tieni) n++; li.hidden = !tieni; });
      if (!n) { pr.parentNode.hidden = true; }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', via); else via();
})();
`;

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2c1a11"/><path d="M14 26h30v6a15 15 0 0 1-30 0z" fill="#fff"/><path d="M44 29h3a6 6 0 0 1 0 12h-4" fill="none" stroke="#fff" stroke-width="4"/><ellipse cx="29" cy="49" rx="19" ry="4" fill="#2453c9"/><path d="M24 20q-3-5 1-10M33 20q3-5-1-10" fill="none" stroke="#e9c9b2" stroke-width="3" stroke-linecap="round"/></svg>`;

const VERCEL = {
  cleanUrls: true,
  trailingSlash: true,
  headers: [
    {
      source: '/(.*)',
      headers: [
        ...(CONFERMATO ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        // Il sito si vede anche dentro il pannello MyCity del negozio (voce «Sito web»): solo lì e qui.
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; frame-src https://www.openstreetmap.org; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://mycity-marketplace.com https://*.mycity-marketplace.com" },
      ],
    },
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }] },
  ],
};

/* ───────────────────────── scrivi ───────────────────────── */
rmSync(OUT, { recursive: true, force: true });
const scrivi = (rel, testo) => { const f = join(OUT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, testo); };
const corpi = { home: HOME, bar: BAR, menu: MENU_P, dicembre: DIC, contatti: CONTATTI };
for (const p of PAGINE) scrivi(p.href === '/' ? 'index.html' : `${p.href.slice(1)}index.html`, pagina(p, corpi[p.id]));
scrivi('404.html', pagina({ id: '404', href: '/404', titolo: `Pagina non trovata · ${L.nome}`, descr: 'Questa pagina non c’è.' }, NON_TROVATA));
scrivi('assets/stile.css', CSS);
scrivi('assets/sito.js', JS);
scrivi('favicon.svg', FAVICON);
scrivi('robots.txt', CONFERMATO ? `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n# Anteprima: le pagine portano noindex finché il titolare non conferma.\n');
scrivi('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGINE.map((p) => `  <url><loc>${BASE}${p.href}</loc><lastmod>2026-11-27</lastmod></url>`).join('\n')}\n</urlset>\n`);
scrivi('vercel.json', `${JSON.stringify(VERCEL, null, 2)}\n`);
console.log(`Sito scritto in ${OUT} (indirizzo ${BASE}, ${CONFERMATO ? 'confermato' : 'anteprima noindex'})`);
