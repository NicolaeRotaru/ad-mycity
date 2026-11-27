#!/usr/bin/env node
/**
 * IL SITO DEL CAFFÈ DI PIACENZA, VERSIONE BUSINESS — 27/11/2026, rifatto la sera sullo stile vero del locale.
 *
 * Nicola, 27/11 ~17:05: «crea la versione business di questo sito». Il Business dice «Un sito completo di
 * più pagine, col tuo nome» (FASCE in mycity lib/agenzia/preventivo.ts).
 * Nicola, 27/11 ~17:50 e ~18:10: «segui i dati che hai su Caffè Piacenza… segui proprio il loro stile»,
 * «hai guardato com'è fatto davvero questo bar?». Quindi lo stile viene dal locale e dal suo sito di oggi
 * (sites.google.com/view/bardipiacenza): il logo a mano dentro l'alone della tazzina, i disegni a un tratto
 * su fondo crema, il marrone del logo, il cotto del pavimento a esagoni, il legno, il verde delle piante.
 * Le foto in ../foto vengono dal loro sito (niente foto con persone riconoscibili: servono i permessi).
 * SDG nei prossimi giorni aggiunge le foto nuove: si cambiano in FOTO qui sotto.
 *
 * Regole: niente prezzi, niente dati inventati. Orari e menu sono quelli del loro sito, da confermare col
 * titolare. Finché non dice sì il sito resta nascosto a Google (noindex) e porta la riga «Anteprima»:
 * per toglierle metti CONFERMATO = true e rilancia.
 *
 * Uso:  node consegne/clienti/caffe-di-piacenza/costruisci-sito.mjs
 *       SITO_URL=https://indirizzo-vero node …   (l'indirizzo per anteprime e sitemap)
 * Scrive la cartella sito/ accanto a questo file: è quella che va su Vercel così com'è.
 */
import { mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));
const OUT = join(QUI, 'sito');
const BASE = (process.env.SITO_URL || 'https://caffe-di-piacenza.vercel.app').replace(/\/+$/, '');
const CONFERMATO = false; // il titolare ha confermato testi, orari e menu?

/* ───────────────────────── i dati del locale (dal loro sito, 27/11) ───────────────────────── */
const L = {
  nome: 'Caffè di Piacenza',
  via: 'Piazza Duomo 8', cap: '29121', citta: 'Piacenza',
  telefono: '0523 693283', telefonoLink: '+390523693283',
  email: 'caffedipiacenza@gmail.com',
  instagram: 'https://www.instagram.com/caffedipiacenza/',
  facebook: 'https://www.facebook.com/people/Caff%C3%A8-di-Piacenza/100086982527914/',
  lat: 45.0510, lon: 9.6977,
  vetrina: 'https://mycity-marketplace.com/store/429d0e22-4b3f-40db-8f81-ab331701fb81',
  tripadvisor: 'https://www.tripadvisor.it/Restaurant_Review-g187805-d13484948-Reviews-Caffe_di_Piacenza-Piacenza_Province_of_Piacenza_Emilia_Romagna.html',
  sdg: process.env.SDG_URL || '',
};
// Orari in minuti, domenica = 0. Dal loro sito: lunedì-sabato 07:30-20:00, domenica 08:30-13:00.
const ORARI = [[510, 780], [450, 1200], [450, 1200], [450, 1200], [450, 1200], [450, 1200], [450, 1200]];
const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const GIORNI_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDINE = [1, 2, 3, 4, 5, 6, 0];
const ORARI_BREVI = 'Lunedì–sabato 7:30–20:00 · domenica 8:30–13:00';

// Natale a Piacenza 2026, dal programma del Comune. [giorno, settimana, titolo, testo, in Piazza Duomo]
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
// Il menu del loro sito (pagine Menu, Caffetteria, Aperitivo), senza prezzi.
const MENU = [
  { titolo: 'Caffetteria', disegno: null, voci: ['Caffè', 'Decaffeinato', 'Cappuccino', 'Orzo', 'Ginseng', 'Spremuta d’arancia', 'Succo di frutta'] },
  { titolo: 'Pasticceria', disegno: 'disegno-cornetto', voci: ['Brioches', 'Krapfen', 'Cannoncini', 'Bignè alla chantilly', 'Zeppole', 'Eclair', 'Biscotti di pasticceria', 'Baci di dama', 'Torte'] },
  { titolo: 'Pranzo e salato', disegno: 'disegno-panino', voci: ['Pizzetta', 'Focaccia farcita piccola', 'Quadrato di focaccia farcita', 'Focaccia grande', 'Brioche salata', 'Tramezzino', 'Panino tondo piccolo', 'Panino farcito', 'Piadina', 'Insalatona', 'Bresaola', 'Fesa di tacchino', 'Crudo e mozzarella'] },
  { titolo: 'Aperitivo', disegno: 'disegno-cocktail', voci: ['Crodino', 'Campari soda', 'San Bitter', 'Aperol soda', 'Aperol o Campari spritz', 'Spritz tropical', 'Hugo', 'Americano', 'Negroni', 'Negroni sbagliato', 'Gin tonic', 'Cocktail'] },
  { titolo: 'Vini', disegno: null, voci: ['Prosecco', 'Franciacorta', 'Ortrugo', 'Gutturnio', 'Bianco fermo', 'Rosso fermo'] },
];
// «Dicono di noi», come le pubblica il loro sito.
const RECENSIONI = [
  ['Ottima posizione con vista sul Duomo e la relativa piazza. Tavoli interni ed esterni sotto il porticato. Offre dolci e salati molto buoni, così come la caffetteria. Il servizio è cortese e disponibile.', 'Mario'],
  ['Provate la brioche con la crema pasticciera, è favolosa! Cappuccino molto cremoso, direi eccezionale.', 'Alex'],
  ['Uno dei caffè migliori della città, gustabile dai tavolini sotto i portici con la compagnia degli uccellini che frequentano le piantine vicine.', 'Alessandro'],
  ['Che bel caffè! Molto conveniente e nel pieno centro di Piacenza.', 'Lucas'],
];
// Le immagini (cartella ../foto): [larghezza, altezza, testo alternativo].
const FOTO = {
  logo: [399, 352, 'Caffè di Piacenza'],
  cappuccino: [1200, 1382, 'Un cappuccino con la foglia disegnata nella schiuma, sul banco di granito'],
  cornetti: [1200, 668, 'Brioches appena sfornate'],
  'vetrina-portici': [768, 1024, 'La vetrina dei dolci, con gli archi dei portici sulla piazza'],
  'vetrina-dolci': [1200, 1200, 'Il banco della pasticceria illuminato'],
  bomboloni: [630, 1400, 'Bomboloni e krapfen in vetrina'],
  bancone: [1050, 1400, 'Il bancone di legno con le piante'],
  sala: [1050, 1400, 'La sala col pavimento a esagoni e le sedie di velluto'],
  'sala-corridoio': [1050, 1400, 'Il corridoio della sala, con i quadri e le piante'],
  tavolini: [1050, 1400, 'Tavolini con le sedie senape e grigie'],
  'banco-bottiglie': [1200, 900, 'Il banco degli aperitivi con le bottiglie'],
  aperitivo: [768, 1024, 'Due cocktail all’arancia'],
  'spritz-granito': [1200, 1200, 'Due drink rossi sul banco di granito'],
  'cappuccino-brioche': [648, 648, 'Cappuccino e brioche'],
  'sala-luce': [1050, 1400, 'La sala luminosa verso la piazza'],
  'disegno-cornetto': [600, 297, ''],
  'disegno-cocktail': [600, 452, ''],
  'disegno-panino': [600, 226, ''],
};

/* ───────────────────────── piccoli attrezzi ───────────────────────── */
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hh = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const giornoDic = (iso) => Number(iso.slice(8, 10));
const EST = ' target="_blank" rel="noopener"'; // dentro il pannello MyCity il sito sta in un riquadro: i siti esterni si aprono a parte
const MAPPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${L.nome}, ${L.via}, ${L.citta}`)}`;
const OSM = `https://www.openstreetmap.org/export/embed.html?bbox=${L.lon - 0.003}%2C${L.lat - 0.0015}%2C${L.lon + 0.003}%2C${L.lat + 0.0015}&layer=mapnik&marker=${L.lat}%2C${L.lon}`;
const img = (n, cls = '', pigra = true, alt = null) => {
  const [w, h, a] = FOTO[n];
  return `<img src="/assets/foto/${n}${n === 'logo' || n.startsWith('disegno') ? '.png' : '.jpg'}" width="${w}" height="${h}" alt="${esc(alt ?? a)}"${cls ? ` class="${cls}"` : ''}${pigra ? ' loading="lazy" decoding="async"' : ''}>`;
};

const PAGINE = [
  { id: 'home', href: '/', voce: 'Home', titolo: `${L.nome} · Bar storico in Piazza Duomo a Piacenza`, descr: 'Colazioni, pasticceria, pranzi e aperitivi ai tavolini sotto i portici di Piazza Duomo, con la cattedrale davanti. Nuova gestione dal 2021.' },
  { id: 'bar', href: '/il-bar/', voce: 'Il bar', titolo: `Il bar · ${L.nome}`, descr: 'Il bar storico di Piazza Duomo: la sala col pavimento a esagoni, il bancone di legno, i tavolini sotto il porticato.' },
  { id: 'menu', href: '/menu/', voce: 'Menu', titolo: `Menu · ${L.nome}`, descr: 'Caffetteria, pasticceria, pranzo e salato, aperitivi e vini al Caffè di Piacenza, in Piazza Duomo.' },
  { id: 'dicembre', href: '/dicembre/', voce: 'Dicembre', titolo: `Dicembre in Piazza Duomo · ${L.nome}`, descr: 'Gli appuntamenti di Natale 2026 in Piazza Duomo e a due passi dal bar: mercati, Manufatto, Santo Stefano in Cupola.' },
  { id: 'contatti', href: '/contatti/', voce: 'Contatti', titolo: `Orari e contatti · ${L.nome}`, descr: `${L.via}, ${L.citta}. Telefono ${L.telefono}. Aperti tutti i giorni: orari, mappa e indicazioni.` },
];

/* ───────────────────────── pezzi comuni ───────────────────────── */
const tabellaOrari = () => `<table class="hours"><caption class="sr">Orari di apertura</caption><tbody>${ORDINE.map((d) => `<tr data-giorno="${d}"><th scope="row">${GIORNI[d]}</th><td>${ORARI[d] ? `${hh(ORARI[d][0])}–${hh(ORARI[d][1])}` : 'Chiuso'}</td></tr>`).join('')}</tbody></table>`;

const datiGoogle = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
  name: L.nome,
  description: 'Bar storico di Piacenza in Piazza Duomo: caffetteria, pasticceria, pranzi e aperitivi.',
  url: `${BASE}/`,
  image: `${BASE}/og.png`,
  logo: `${BASE}/assets/foto/logo.png`,
  telephone: '+39 0523 693283',
  email: L.email,
  address: { '@type': 'PostalAddress', streetAddress: L.via, postalCode: L.cap, addressLocality: L.citta, addressRegion: 'PC', addressCountry: 'IT' },
  geo: { '@type': 'GeoCoordinates', latitude: L.lat, longitude: L.lon },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: [1, 2, 3, 4, 5, 6].map((d) => GIORNI_EN[d]), opens: hh(ORARI[1][0]), closes: hh(ORARI[1][1]) },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: hh(ORARI[0][0]), closes: hh(ORARI[0][1]) },
  ],
  servesCuisine: ['Caffetteria', 'Pasticceria', 'Aperitivo'],
  sameAs: [L.instagram, L.facebook, L.tripadvisor],
}).replace(/</g, '\\u003c');

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
<meta name="theme-color" content="#faf3e7">
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
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fondamento&family=Playfair+Display:wght@500;600&family=Figtree:wght@400;600;700&display=swap">
<link rel="stylesheet" href="/assets/stile.css">
${p.id === 'home' || p.id === 'contatti' ? `<script type="application/ld+json">${datiGoogle()}</script>\n` : ''}<script src="/assets/sito.js" defer></script>
</head>
<body>
<a class="salta" href="#contenuto">Vai al contenuto</a>
${CONFERMATO ? '' : '<div class="note">Anteprima del sito: testi, orari e menu sono in verifica con il titolare.</div>\n'}<header class="top">
<nav class="nav" aria-label="Pagine del sito">
<a class="logo" href="/" aria-label="${esc(L.nome)}, torna alla home">${img('logo', '', false, L.nome)}</a>
<div class="voci">${nav}</div>
<a class="btn small chiama" href="tel:${L.telefonoLink}">Chiama</a>
</nav>
</header>
<main id="contenuto">
${corpo}
</main>
<footer class="band piede">
<div class="wrap cols">
<div><p class="piede-nome">${esc(L.nome)}</p><p class="small">Bar storico di Piazza Duomo, nuova gestione dal 2021</p><p class="small" data-stato>${ORARI_BREVI}</p></div>
<div><p>${esc(L.via)}, ${L.cap} ${esc(L.citta)}</p><p><a href="tel:${L.telefonoLink}">${esc(L.telefono)}</a></p><p><a href="mailto:${L.email}">${esc(L.email)}</a></p><p class="social"><a href="${L.instagram}"${EST}>Instagram</a> · <a href="${L.facebook}"${EST}>Facebook</a></p></div>
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

/* ───────────────────────── le pagine ───────────────────────── */
const calendario = (soloPiazza = false) => DICEMBRE.filter((r) => !soloPiazza || r[4]).map((r) => `<li data-data="${r[0]}"${r[4] ? ' class="here"' : ''}><div class="d">${giornoDic(r[0])} dic<small>${r[1]}</small></div><div><h3>${esc(r[2])}${r[4] ? '<span class="tag">in Piazza Duomo</span>' : ''}</h3><p>${esc(r[3])}</p></div></li>`).join('');
const intestazione = (occhiello, titolo, sotto = '') => `<section class="band intestazione"><div class="wrap"><p class="mano">${occhiello}</p><h1>${titolo}</h1>${sotto ? `<p class="lead">${sotto}</p>` : ''}</div></section>`;

const HOME = `<section class="band hero">
<div class="wrap hero-grid">
<div class="hero-testo">
<p class="mano">colazioni · pasticceria · pranzi · aperitivi</p>
<h1>Il bar storico di Piazza Duomo</h1>
<p class="lead">Nuova gestione dal 2021. Il cappuccino cremoso, la brioche alla crema e i tavolini sotto i portici, con la cattedrale davanti.</p>
<p class="status"><span class="dot" aria-hidden="true"></span><span data-stato>${ORARI_BREVI}</span></p>
<div class="row"><a class="btn" href="/menu/">Guarda il menu</a><a class="btn ghost" href="/contatti/">Orari e indirizzo</a></div>
</div>
<div class="hero-foto">
${img('cappuccino', 'f-grande', false)}
${img('cornetti', 'f-piccola uno')}
${img('vetrina-portici', 'f-piccola due')}
</div>
</div>
</section>
<section class="band">
<div class="wrap">
<h2>Dalla colazione all'aperitivo</h2>
<p class="lead">Dalle 7:30 del mattino, sotto il porticato che ripara dal sole e dalla pioggia.</p>
<div class="grid3">
<article class="card disegnata">${img('disegno-cornetto', 'disegno')}<h3>Colazione e pasticceria</h3><p class="muted">Cappuccino, brioches, krapfen, cannoncini, bignè alla chantilly e i dolci della vetrina.</p></article>
<article class="card disegnata">${img('disegno-panino', 'disegno')}<h3>Pranzo</h3><p class="muted">Focacce farcite, panini, piadine, tramezzini e insalatone, per una pausa in centro.</p></article>
<article class="card disegnata">${img('disegno-cocktail', 'disegno')}<h3>Aperitivo</h3><p class="muted">Spritz, Hugo, Negroni, gin tonic e i vini del territorio, come Ortrugo e Gutturnio.</p></article>
</div>
</div>
</section>
<section class="striscia" aria-label="Dalla nostra vetrina">
${img('vetrina-dolci')}${img('bomboloni')}${img('cappuccino-brioche')}${img('spritz-granito')}
</section>
<section class="band">
<div class="wrap">
<p class="mano centro">dicono di noi</p>
<div class="recensioni">
${RECENSIONI.map(([t, chi]) => `<figure class="recensione"><blockquote>«${esc(t)}»</blockquote><figcaption>— ${esc(chi)}</figcaption></figure>`).join('\n')}
</div>
<p class="centro fine"><a href="${L.tripadvisor}"${EST}>Leggi le altre recensioni su Tripadvisor</a></p>
</div>
</section>
<section class="band tinta">
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
<div class="card orari"><h3>Orari</h3>${tabellaOrari()}</div>
<div class="row"><a class="btn" href="tel:${L.telefonoLink}">Chiama lo ${esc(L.telefono)}</a><a class="btn ghost" href="${MAPPA}"${EST}>Indicazioni</a></div>
</div>
<div class="foto-alta">${img('bancone')}</div>
</div>
</section>`;

const BAR = `${intestazione('il bar', 'Il caffè di piazza, dal mattino')}
<section class="band">
<div class="wrap split">
<div>
<p class="lead">${esc(L.nome)} è un bar storico della città, in Piazza Duomo, sotto i portici e di fronte alla cattedrale.</p>
<p>Dal 2021 ha una nuova gestione, che ha tenuto lo spirito del caffè di piazza: servizio cortese, tavolini all'aperto riparati dal porticato e la vista sul Duomo dalla colazione alla sera.</p>
<p>Dentro ci sono il bancone di legno, il banco dei dolci sempre pieno, la sala col pavimento a esagoni e le sedie di velluto. Il mercoledì e il sabato mattina la piazza si riempie con il mercato cittadino: è il momento giusto per un cappuccino al tavolo.</p>
<div class="row"><a class="btn ghost" href="${L.instagram}"${EST}>Seguici su Instagram</a></div>
</div>
<div class="card">
<h3>Da sapere</h3>
<ul class="facts">
<li>Tavoli interni e sala</li>
<li>Tavolini sotto il porticato</li>
<li>Vista sul Duomo</li>
<li>Aperti anche la domenica mattina</li>
<li>Mercato in piazza il mercoledì e il sabato</li>
</ul>
</div>
</div>
</section>
<section class="band galleria-band" aria-label="Il locale">
<div class="wrap galleria">
${['sala', 'bancone', 'tavolini', 'vetrina-dolci', 'banco-bottiglie', 'sala-corridoio', 'vetrina-portici', 'sala-luce'].map((n) => `<figure>${img(n)}</figure>`).join('\n')}
</div>
</section>
<section class="band tinta">
<div class="wrap">
<h2>La piazza della cattedrale</h2>
<p class="lead">Il Duomo di Piacenza, romanico, del XII secolo, con il campanile e la sua gabbia di ferro. Da qui Piazza Cavalli e Palazzo Farnese sono a pochi minuti a piedi.</p>
<div class="row"><a class="btn" href="/dicembre/">Cosa succede in piazza a dicembre</a></div>
</div>
</section>`;

const MENU_P = `${intestazione('il menu', 'Dalla colazione all’aperitivo', 'Quello che trovi al banco, dalla mattina alla sera.')}
<section class="band">
<div class="wrap">
<div class="menu">
${MENU.map((s) => `<section class="menu-sez">${s.disegno ? img(s.disegno, 'disegno piccolo') : ''}<h2 class="h3">${s.titolo}</h2><ul>${s.voci.map((v) => `<li>${esc(v)}</li>`).join('')}</ul></section>`).join('\n')}
</div>
<p class="muted fine">Il menu è quello del nostro sito di sempre: prezzi e proposte del giorno li confermiamo al banco.</p>
<div class="row"><a class="btn" href="tel:${L.telefonoLink}">Chiedi le proposte del giorno</a></div>
</div>
</section>`;

const DIC = `${intestazione('dicembre', 'Natale in piazza', 'Gli appuntamenti di Natale a Piacenza in Piazza Duomo e a due passi da noi. Le date sono quelle del Comune per il 2026.')}
<section class="band">
<div class="wrap">
<ul class="cal" data-calendario>${calendario()}</ul>
<p class="muted fine">Fonte: programma «Natale a Piacenza» del Comune di Piacenza. Gli orari del bar per le feste sono in arrivo.</p>
</div>
</section>`;

const CONTATTI = `${intestazione('contatti', 'Orari e indirizzo')}
<section class="band">
<div class="wrap split">
<div>
<p class="lead">${esc(L.via)}, sotto i portici<br>${L.cap} ${esc(L.citta)}</p>
<p class="grande"><a href="tel:${L.telefonoLink}">${esc(L.telefono)}</a></p>
<p><a href="mailto:${L.email}">${esc(L.email)}</a></p>
<p class="social"><a href="${L.instagram}"${EST}>Instagram</a> · <a href="${L.facebook}"${EST}>Facebook</a></p>
<div class="row">
<a class="btn" href="tel:${L.telefonoLink}">Chiama</a>
<a class="btn ghost" href="mailto:${L.email}">Scrivi una email</a>
<a class="btn ghost" href="${MAPPA}"${EST}>Indicazioni</a>
</div>
</div>
<div class="card">
<h2 class="h3">Orari</h2>
<p class="status chiaro"><span class="dot" aria-hidden="true"></span><span data-stato>${ORARI_BREVI}</span></p>
${tabellaOrari()}
<p class="muted fine">Orari dal nostro sito, in verifica per le feste.</p>
</div>
</div>
</section>
<section class="band mappa-band">
<div class="wrap">
<iframe class="mappa" title="Mappa: ${esc(L.nome)}, ${esc(L.via)}, ${esc(L.citta)}" src="${OSM}" loading="lazy" referrerpolicy="no-referrer"></iframe>
<p class="muted fine"><a href="${MAPPA}"${EST}>Apri in Google Maps</a> · mappa © OpenStreetMap</p>
</div>
</section>`;

const NON_TROVATA = `${intestazione('ops', 'Questa pagina non c’è', 'Forse l’indirizzo è cambiato. Riparti dalla home, oppure chiamaci.')}
<section class="band"><div class="wrap"><div class="row"><a class="btn" href="/">Torna alla home</a><a class="btn ghost" href="tel:${L.telefonoLink}">Chiama</a></div></div></section>`;

/* ───────────────────────── stile: i colori e i segni del locale ───────────────────────── */
const CSS = `:root{color-scheme:light;--crema:#faf3e7;--crema2:#f3e7d3;--carta:#fffdf8;--ink:#2e1f16;--soft:#6b5646;--caffe:#794721;--cotto:#a8472f;--cotto2:#8f3a25;--legno:#2b1b12;--salvia:#4f7a5c;--line:#e6d6bf}
*{box-sizing:border-box;min-width:0}
html{scroll-padding-top:96px;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--crema);color:var(--ink);font:17px/1.65 Figtree,system-ui,-apple-system,"Segoe UI",sans-serif;overflow-x:clip}
img{max-width:100%;height:auto;display:block}
a{color:inherit;text-underline-offset:3px}
iframe{max-width:100%}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.salta{position:absolute;left:12px;top:-60px;z-index:20;background:var(--cotto);color:#fff;padding:10px 14px;border-radius:8px;font-weight:700}
.salta:focus{top:10px}
.band{padding-block:clamp(36px,5vw,80px);padding-left:max(5vw,16px,env(safe-area-inset-left,0px));padding-right:max(5vw,16px,env(safe-area-inset-right,0px))}
.wrap{max-width:1200px;margin:0 auto}
.note{background:var(--legno);color:#f3e7d3;font-size:14px;padding:7px max(5vw,16px);text-align:center}
header.top{position:sticky;top:0;z-index:10;background:rgba(250,243,231,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;gap:10px 22px;max-width:1200px;margin:0 auto;padding:6px max(5vw,16px)}
.logo{display:block;flex:none}
.logo img{height:70px;width:auto}
.voci{display:flex;flex-wrap:wrap;gap:2px 20px;margin-left:auto}
.nav a.p{text-decoration:none;padding:10px 2px;font-weight:600;font-size:16px;color:var(--ink);border-bottom:2px solid transparent;min-height:44px;display:inline-flex;align-items:center}
.nav a.p:hover{border-color:var(--line)}
.nav a.p[aria-current=page]{border-color:var(--cotto);color:var(--cotto2)}
a:focus-visible,.btn:focus-visible{outline:3px solid var(--salvia);outline-offset:2px}
.mano{font:400 clamp(22px,2.6vw,28px)/1.2 Fondamento,Georgia,serif;color:var(--caffe);margin:0 0 6px}
.centro{text-align:center}
h1{font:600 clamp(40px,6vw,74px)/1.04 "Playfair Display",Georgia,serif;letter-spacing:-.015em;margin:0 0 14px;color:var(--ink);text-wrap:balance}
h2{font:600 clamp(30px,4vw,46px)/1.08 "Playfair Display",Georgia,serif;letter-spacing:-.01em;margin:0 0 12px;text-wrap:balance}
h3,.h3{font:700 20px/1.3 Figtree,sans-serif;margin:0 0 6px}
.lead{font-size:clamp(18px,1.6vw,20px);max-width:58ch;margin:0 0 12px;color:#3d2a1e}
.muted{color:var(--soft)}
.fine{font-size:14px;margin:14px 0 0}
.grande{font-size:26px;font-weight:700;margin:12px 0 2px}
.grande a{text-decoration:none}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border-radius:999px;background:var(--cotto);color:#fff;font-weight:700;text-decoration:none;border:0;font-size:16px;text-align:center}
.btn:hover{background:var(--cotto2)}
.btn.ghost{background:transparent;color:var(--ink);border:2px solid var(--ink)}
.btn.ghost:hover{background:var(--ink);color:var(--crema)}
.btn.small{min-height:40px;padding:0 18px;font-size:15px}
.row{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
.status{display:inline-flex;align-items:center;gap:10px;background:var(--carta);border:1px solid var(--line);padding:9px 16px;border-radius:999px;font-weight:600;margin:6px 0 0}
.status.chiaro{margin:0 0 10px}
.dot{width:10px;height:10px;border-radius:50%;background:var(--salvia);flex:none}
.dot.off{background:var(--cotto)}
/* hero: testo e tre foto del locale */
.hero{padding-top:clamp(28px,4vw,64px)}
.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,5vw,72px);align-items:center}
.hero-foto{position:relative;padding:0 0 18% 12%}
.hero-foto .f-grande{width:100%;aspect-ratio:4/4.4;object-fit:cover;border-radius:18px;box-shadow:0 18px 40px rgba(60,35,20,.18)}
.hero-foto .f-piccola{position:absolute;width:44%;object-fit:cover;border-radius:14px;border:6px solid var(--crema);box-shadow:0 12px 28px rgba(60,35,20,.18)}
.hero-foto .uno{left:0;bottom:0;aspect-ratio:4/3}
.hero-foto .due{right:-4%;bottom:-6%;width:32%;aspect-ratio:3/4}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:26px}
.card{background:var(--carta);border:1px solid var(--line);border-radius:18px;padding:24px}
.card.disegnata{background:var(--crema);text-align:center;padding-top:8px}
.disegno{width:auto;max-width:min(220px,80%);max-height:150px;margin:8px auto 12px}
.disegno.piccolo{max-width:130px;max-height:90px;margin:0 0 6px}
.card.orari{margin-top:18px}
.split{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(24px,4vw,64px);align-items:start}
.foto-alta img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:18px}
.striscia{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:0 6px}
.striscia img{width:100%;aspect-ratio:1/1;object-fit:cover}
.recensioni{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-top:22px}
.recensione{margin:0;background:var(--carta);border:1px solid var(--line);border-radius:18px;padding:24px 26px}
.recensione blockquote{margin:0;font:500 19px/1.5 "Playfair Display",Georgia,serif;color:var(--ink)}
.recensione figcaption{margin-top:10px;color:var(--caffe);font-weight:700}
.tinta{background:var(--crema2)}
.intestazione{padding-block:clamp(30px,4vw,60px) clamp(10px,2vw,20px)}
.facts{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:10px}
.facts li{padding-left:26px;position:relative}
.facts li::before{content:"";position:absolute;left:0;top:.45em;width:14px;height:14px;border-radius:50%;border:3px solid var(--caffe);opacity:.75}
.galleria-band{padding-top:0}
.galleria{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.galleria figure{margin:0}
.galleria img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:14px}
.hours{width:100%;border-collapse:collapse;font-size:17px}
.hours th,.hours td{padding:9px 0;border-bottom:1px solid var(--line);text-align:left;font-weight:400}
.hours td{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.hours tr.today th,.hours tr.today td{font-weight:700;color:var(--cotto2)}
.menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 48px}
.menu-sez{border-top:2px solid var(--caffe);padding-top:16px}
.menu-sez .h3{font:600 28px/1.1 "Playfair Display",Georgia,serif;margin:0 0 8px}
.menu ul{list-style:none;margin:0;padding:0;columns:2;column-gap:28px}
.menu li{padding:7px 0;border-bottom:1px dotted var(--line);break-inside:avoid}
.cal{list-style:none;margin:20px 0 0;padding:0}
.cal li{display:grid;grid-template-columns:7.5em minmax(0,1fr);gap:18px;padding:16px 0;border-bottom:1px solid var(--line)}
.cal .d{font:600 30px/1 "Playfair Display",Georgia,serif;color:var(--caffe);white-space:nowrap}
.cal .d small{display:block;font:600 14px/1.4 Figtree,sans-serif;color:var(--soft);margin-top:4px}
.cal p{margin:2px 0 0;color:var(--soft)}
.cal li.here .d{color:var(--cotto2)}
.cal li.passato{opacity:.55}
.cal li.passato h3::after{content:" · passato";font-weight:600;font-size:14px;color:var(--soft)}
.cal.compatto{margin-top:8px}
.cal.compatto li{padding:12px 0;grid-template-columns:5.5em minmax(0,1fr);border-color:#e2d0b4}
.cal.compatto .d{font-size:24px}
.prossimi-titolo{margin-top:6px}
.tag{display:inline-block;font-size:13px;font-weight:700;color:var(--cotto2);margin-left:6px}
.mappa-band{padding-top:0}
.mappa{display:block;width:100%;height:clamp(260px,40vw,420px);border:1px solid var(--line);border-radius:18px}
.social a{font-weight:700}
.piede{background:var(--legno);color:#f3e7d3}
.piede .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px}
.piede p{margin:4px 0}
.piede-nome{font:400 30px/1.1 Fondamento,Georgia,serif;color:#e9c9a3}
.piede .small{font-size:14px;color:#dcc8b0}
.piede-nav{display:flex;flex-wrap:wrap;gap:4px 16px;margin-bottom:8px}
.piede-nav a{text-decoration:none;font-weight:600;min-height:32px;display:inline-flex;align-items:center}
.piede a:focus-visible{outline-color:#e9c9a3}
.azioni{display:none}
@media(max-width:900px){.hero-grid,.split,.grid3,.recensioni,.menu,.piede .cols{grid-template-columns:minmax(0,1fr)}.galleria{grid-template-columns:repeat(2,minmax(0,1fr))}.hero-foto{max-width:520px}}
@media(max-width:760px){
.chiama{display:none}
.nav{flex-wrap:wrap;gap:0 16px;padding-bottom:0}
.logo img{height:58px}
.voci{margin-left:0;width:100%;gap:0 16px}
.striscia{grid-template-columns:repeat(2,minmax(0,1fr))}
.azioni{display:grid;grid-template-columns:1fr 1fr;gap:8px;position:fixed;left:0;right:0;bottom:0;z-index:15;padding:8px max(12px,env(safe-area-inset-left,0px)) calc(8px + env(safe-area-inset-bottom,0px));background:var(--legno);box-shadow:0 -4px 16px rgba(0,0,0,.25)}
.azioni a{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:999px;font-weight:700;text-decoration:none;background:var(--cotto);color:#fff}
.azioni a+a{background:transparent;color:#fff;border:2px solid #fff}
body{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))}
}
@media(max-width:600px){.hero-foto .due{right:0}.cal li{grid-template-columns:minmax(0,1fr);gap:4px}.cal.compatto li{grid-template-columns:4.6em minmax(0,1fr);gap:10px}.menu ul{columns:1}.status{white-space:normal}.hero-foto{padding:0 0 22% 8%}}
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
cpSync(join(QUI, 'foto'), join(OUT, 'assets', 'foto'), { recursive: true });
cpSync(join(QUI, 'foto', 'favicon.png'), join(OUT, 'favicon.png'));
cpSync(join(QUI, 'foto', 'og.png'), join(OUT, 'og.png'));
scrivi('robots.txt', CONFERMATO ? `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n# Anteprima: le pagine portano noindex finché il titolare non conferma.\n');
scrivi('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGINE.map((p) => `  <url><loc>${BASE}${p.href}</loc><lastmod>2026-11-27</lastmod></url>`).join('\n')}\n</urlset>\n`);
scrivi('vercel.json', `${JSON.stringify(VERCEL, null, 2)}\n`);
console.log(`Sito scritto in ${OUT} (indirizzo ${BASE}, ${CONFERMATO ? 'confermato' : 'anteprima noindex'})`);
