#!/usr/bin/env node
// Dal link Google Maps alla proposta, in meno di un minuto.
//
// Nicola, 26/11/2026 17:00: «noi ti mandiamo solamente il link Google dell'attività … prepararcele il più
// velocemente possibile, in meno di un minuto, e darci già la presentazione». Prima ci volevano una decina di
// ricerche sul web e una sessione che scriveva a mano tutto dati.json: diversi minuti per cliente.
//
// Cosa fa:
//   ① apre il link (anche quello corto maps.app.goo.gl) e legge la scheda Google così come la vede chiunque:
//     nome, categorie, indirizzo, telefono, orari, sito, voto, numero e testi delle recensioni, descrizione,
//     attributi, se la scheda è rivendicata, se la copertina è Street View. Dei recensori NON legge i nomi.
//   ② con --lampo scrive consegne/clienti/AAAA-MM-GG-<nome>/google.json e un dati.json completo, coi testi
//     scritti da regole su quei fatti, e chiama scheda-cliente.mjs: scheda, proposta e bozza del sito escono
//     subito, coi controlli di sempre. Poi la sessione arricchisce (social, omonimi, stampa) e ripubblica.
//   Se dati.json c'è già, --lampo non lo tocca: aggiorna solo google.json.
//
// Uso:
//   node cervello/da-link-maps.mjs <link Google Maps | "nome, città">            (stampa i dati, pochi secondi)
//   node cervello/da-link-maps.mjs <link> --lampo                                (cartella + pagine)
//   node cervello/da-link-maps.mjs <link> --json                                 (i dati in JSON)
//   node cervello/da-link-maps.mjs <link> --da-file risposta.txt [--lampo]       (senza rete, da una risposta salvata)
//
// La rete: l'ambiente «Default» lascia passare google.com (provato il 26/11/2026 17:05), non Facebook né gli
// elenchi. Le chiamate usano curl perché curl segue il proxy dell'ambiente.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FASCE } from './scheda-cliente.mjs';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const RADICE = path.resolve(QUI, '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

// ———————————————————————————————————————————————— lettura della scheda Google

function scarica(url) {
  try {
    return execFileSync('curl', ['-sSL', '--compressed', '--max-time', '20', '-A', UA, '-H', 'Accept-Language: it-IT,it;q=0.9', url],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch { throw new Error(`la pagina non risponde (${new URL(url).hostname})`); }
}
/** Google a volte manda una risposta illeggibile (collaudo 26/11: 2 letture su 13): si riprova una volta. */
function leggiJson(url) {
  try { return json(scarica(url)); } catch { return json(scarica(url)); }
}
const GOOGLE = /(^|\.)google\.[a-z.]+$|^maps\.app\.goo\.gl$|^goo\.gl$/;
const html = (s) => s.replace(/&amp;/g, '&');
const json = (t) => JSON.parse(t.replace(/^\)\]\}'\s*/, ''));
const g = (o, ...p) => p.reduce((a, k) => (a == null ? undefined : a[k]), o);

/** La scheda grezza: dal link (pagina del luogo → dati del luogo) o, se serve, dalla ricerca per nome. */
export function scaricaScheda(input) {
  let nome = input;
  if (/^https?:\/\//.test(input)) {
    if (!GOOGLE.test(new URL(input).hostname)) throw new Error('non è un link di Google Maps: manda il link della scheda Google, oppure il nome con la via');
    const pagina = scarica(input);
    const m = pagina.match(/preview\/place\?authuser=0[^"]*/);
    if (m) {
      const r = g(leggiJson('https://www.google.com/maps/' + html(m[0])), 6);
      if (r?.[11]) return r;
    }
    const daUrl = (pagina.match(/\/maps\/place\/([^/"?]+)/) ?? [])[1];
    if (!daUrl) throw new Error('dal link non riesco a leggere il nome del luogo');
    nome = decodeURIComponent(daUrl.replace(/\+/g, ' '));
  }
  const ricerca = scarica('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(nome));
  const m = ricerca.match(/search\?tbm=map[^"]*/);
  if (!m) throw new Error(`Google Maps non risponde alla ricerca di «${nome}»`);
  const risultati = g(leggiJson('https://www.google.com/' + html(m[0])), 0, 1) ?? [];
  const r = risultati.map((x) => g(x, 14)).find((x) => x?.[11]);
  if (!r) throw new Error(`nessuna attività trovata per «${nome}»: manda il link della scheda Google, oppure il nome con la via`);
  return r;
}

const SOCIAL = /facebook\.com|instagram\.com|tiktok\.com|linktr\.ee/i;
const ETA = (q) => {
  const s = String(q ?? '').replace(/^Ultima modifica:\s*/i, '');
  const n = /^un[ao]?\b/i.test(s) ? 1 : parseInt(s, 10) || 0;
  const giorni = /giorn/i.test(s) ? 1 : /settiman/i.test(s) ? 7 : /mes/i.test(s) ? 30 : /ann/i.test(s) ? 365 : 0;
  return { testo: s, giorni: n * giorni };
};

/** I fatti leggibili, con nomi italiani. Mai i nomi o le foto dei recensori. */
export function estrai(r) {
  const sitoGrezzo = g(r, 7, 0);
  const sito = sitoGrezzo?.startsWith('/url?q=') ? decodeURIComponent(sitoGrezzo.slice(7).split('&')[0]) : sitoGrezzo ?? null;
  const placeId = (String(g(r, 4, 3, 0) ?? '').match(/placeid=([\w-]+)/) ?? [])[1] ?? null;
  const orari = (g(r, 203, 0) ?? [])
    .map((d) => ({ n: d?.[1], giorno: d?.[0], ore: (d?.[3] ?? []).map((x) => x?.[0]).filter(Boolean).join(', ') }))
    .filter((d) => d.giorno && d.ore).sort((a, b) => a.n - b.n).map(({ giorno, ore }) => ({ giorno, ore }));
  const testo = JSON.stringify(r);
  // Google segna il locale chiuso in r[88][0] («CHIUSO»): le schede aperte lì hanno null o un servizio
  // («Cani ammessi»). Il collaudo del 26/11 l'ha trovato su un'osteria chiusa che passava per aperta.
  const stato = String(g(r, 88, 0) ?? '');
  const recensioni = (g(r, 175, 9, 0, 0) ?? []).map((x) => ({ voto: g(x, 0, 2, 0, 0) ?? null, quando: ETA(g(x, 0, 1, 6)).testo, giorni: ETA(g(x, 0, 1, 6)).giorni, testo: (g(x, 0, 2, 15, 0, 0) ?? '').replace(/\s+/g, ' ').trim() }));
  const eta = recensioni.map((x) => x.giorni).filter((d) => d > 0);
  return {
    nome: r[11],
    categorie: (g(r, 13) ?? []).filter((x) => typeof x === 'string'),
    indirizzo: (g(r, 39) ?? (g(r, 2) ?? []).join(', ')).replace(/, Italia$/, ''),
    via: g(r, 2, 0) ?? null,
    citta: g(r, 183, 1, 3) ?? g(r, 82, 3) ?? null,
    cap: g(r, 183, 1, 4) ?? null,
    telefono: g(r, 178, 0, 1, 0, 0) ?? g(r, 178, 0, 0) ?? null,
    orari,
    sito,
    sito_tipo: !sito ? 'nessuno' : SOCIAL.test(sito) ? 'social' : 'proprio',
    voto: g(r, 4, 7) ?? null,
    recensioni_n: g(r, 4, 8) ?? (parseInt(g(r, 4, 3, 1), 10) || 0),
    recensioni,
    recensione_piu_recente_giorni: eta.length ? Math.min(...eta) : null,
    descrizione: g(r, 154, 0, 0) ?? null,
    attributi: (g(r, 100, 1) ?? []).flatMap((gr) => (gr?.[2] ?? []).map((a) => a?.[1])).filter((x) => typeof x === 'string'),
    non_rivendicata: /Rivendica/i.test(String(g(r, 49, 1) ?? '')),
    copertina_street_view: /streetviewpixels|cbk\?/.test(String(g(r, 37, 0, 0, 6, 0) ?? '')),
    chiusa: /^CHIUSO/i.test(stato) ? (/TEMPORANE/i.test(stato) ? 'temporaneamente' : 'definitivamente')
      : /Chiuso definitivamente/.test(testo) ? 'definitivamente' : /Chiuso temporaneamente/.test(testo) ? 'temporaneamente' : null,
    coordinate: [g(r, 9, 2) ?? null, g(r, 9, 3) ?? null],
    plus_code: g(r, 183, 2, 1, 0) ?? null,
    place_id: placeId,
    cid: g(r, 10) ?? null,
  };
}

// ———————————————————————————————————————————————— la versione lampo

const FAMIGLIE = [
  { id: 'bar', re: /\bbar\b|caff|pasticc|gelat|panific|panett|forno|colazion|tabacc|cornett/i, schema: 'CafeOrCoffeeShop',
    cosa: 'il caffè e la colazione', banco: 'il banco', uno: 'una colazione', apertura: 'luci che si accendono, il primo caffè, la vetrina che si riempie',
    domanda: '«cappuccino o espresso?»', mycity: 'colazioni e dolci da ordinare e ritirare, se li fanno', al_locale: 'al bar',
    claim: 'Il buongiorno, come piace a te.', palette: { fondo: '#F3ECE2', testo: '#24170F', accento: '#9A4F12', tenue: '#6F5F52', carta: '#FFFFFF' }, eroe: '#3B2416' },
  { id: 'ristorante', re: /ristor|pizz|trattor|osteria|\bpub\b|sushi|bracer|enotec|bistrot|kebab|piadin|gastronom|rosticc|tavola calda/i, schema: 'Restaurant',
    cosa: 'la cucina', banco: 'la cucina', uno: 'un piatto della casa', apertura: 'la sala che si prepara, il primo piatto che esce',
    domanda: '«il vostro piatto preferito?»', mycity: 'piatti da ordinare e ritirare, o da farsi portare a casa', al_locale: 'al locale',
    claim: 'Si mangia bene, come a casa.', palette: { fondo: '#F6F0E6', testo: '#2A1B14', accento: '#8E2F1C', tenue: '#6E5D52', carta: '#FFFFFF' }, eroe: '#3A1E15' },
  { id: 'bellezza', re: /parrucch|barbier|estetic|unghie|nail|\bspa\b|benessere|massagg/i, schema: 'BeautySalon',
    cosa: 'i trattamenti', banco: 'il salone', uno: 'un trattamento', apertura: 'il salone pronto, gli strumenti in ordine, il primo cliente',
    domanda: '«cosa vi piacerebbe provare?»', mycity: 'prodotti da comprare e ritirare, e buoni regalo', al_locale: 'in salone',
    claim: 'Il tuo momento, curato da noi.', palette: { fondo: '#F5EFEC', testo: '#2B1F22', accento: '#8A3B55', tenue: '#6F6266', carta: '#FFFFFF' }, eroe: '#3A2329' },
  { id: 'negozio', re: /./, schema: 'Store',
    cosa: 'i prodotti', banco: 'il negozio', uno: 'un prodotto scelto da voi', apertura: 'la serranda che si alza, la vetrina pronta',
    domanda: '«cosa cercate di solito?»', mycity: 'i prodotti da ordinare in rete e ritirare, o da farsi portare a casa', al_locale: 'in negozio',
    claim: 'Le cose buone, a due passi da casa.', palette: { fondo: '#F2EFE8', testo: '#1F2220', accento: '#2F5D50', tenue: '#5F6763', carta: '#FFFFFF' }, eroe: '#1F3A33' },
];

// 16 temi senza video e 4 video: il piano prende i primi N della fascia consigliata.
const TEMI = (v, f) => ({
  foto: [
    ['Post', 'Chi siamo', `Presentiamo ${f.nome}: chi c'è dietro ${v.banco}, da quando, cosa vi piace fare. Si parte dalle persone.`],
    ['Carosello', 'Le cose che facciamo meglio', `Cinque foto, una per cosa: ${v.cosa}. L'elenco lo scegliamo con voi.`],
    ['Post', 'Dove siamo e quando', 'Indirizzo, orari e come arrivare in una grafica semplice. Gli orari li confermiamo con voi.'],
    ['Post', 'Una recensione, un grazie', 'Una vostra recensione in grafica, con un invito: «Sei passato da noi? Raccontalo su Google.»'],
    ['Carosello', 'Dietro le quinte', `Come nasce ${v.uno}: i gesti di tutti i giorni, con il permesso di chi compare.`],
    ['Post', 'La novità del mese', 'Una cosa nuova o di stagione, raccontata in due righe.'],
    ['Post', 'Il calendario del mese', 'Aperture, chiusure e appuntamenti del mese, in un\'immagine sola. Date confermate con voi.'],
    ['Carosello', 'Il locale', 'Gli spazi, la luce, i dettagli: per farsi riconoscere da chi passa.'],
    ['Post', 'La domanda della settimana', `Una domanda semplice ai follower, come ${v.domanda}, per farli rispondere.`],
    ['Post', 'Il cliente di sempre', 'La storia breve di un cliente abituale, con il suo permesso.'],
    ['Carosello', 'Le domande che ci fanno', 'Le tre domande che i clienti fanno più spesso, con le risposte.'],
    ['Post', 'In primo piano', `Una foto sola, ben fatta: ${v.uno}.`],
    ['Post', 'Il consiglio', 'Un consiglio pratico del mestiere, detto da voi.'],
    ['Carosello', 'Dall\'inizio alla fine', `${v.uno[0].toUpperCase()}${v.uno.slice(1)}, in quattro foto.`],
    ['Post', 'Grazie a chi passa', 'Un grazie a chi vi sceglie ogni settimana, con una foto del locale.'],
    ['Post', 'Il saluto del mese', 'Cosa è successo nel mese e cosa arriva nel prossimo.'],
  ],
  video: [
    ['Reel', 'L\'apertura', `Video breve dell'apertura: ${v.apertura}.`],
    ['Reel', 'In 30 secondi', `Video della preparazione di ${v.uno}, dall'inizio alla fine.`],
    ['Reel', 'Un giorno da noi', 'Le ore di una giornata tipo, raccontate in 30 secondi.'],
    ['Reel', 'Le persone', 'Chi lavora con voi si presenta in una frase, con il suo permesso.'],
  ],
});
const GIORNI = { base: [2, 5], business: [2, 4, 6], premium: [1, 2, 3, 4, 5] };
// Nei giorni in cui quasi tutti sono chiusi non si pubblica (collaudo 26/11: un post il 25/12).
const FESTE = new Set(['1/1', '1/5', '15/8', '25/12', '26/12']);
const SETT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

function piano(fascia, v, fatti, oggi) {
  const f = FASCE[fascia];
  const anno = oggi.getMonth() === 11 ? oggi.getFullYear() + 1 : oggi.getFullYear();
  const mese = (oggi.getMonth() + 1) % 12;
  const giorni = [];
  for (let d = 1; d <= 31; d++) {
    const x = new Date(Date.UTC(anno, mese, d));
    if (x.getUTCMonth() !== mese) break;
    if (x.getUTCDay() !== 0 && !FESTE.has(`${d}/${mese + 1}`)) giorni.push({ d, dow: x.getUTCDay() });
  }
  const scelti = giorni.filter((x) => GIORNI[fascia].includes(x.dow));
  for (const x of giorni) if (scelti.length < f.post && !scelti.includes(x)) scelti.push(x);
  const date = scelti.sort((a, b) => a.d - b.d).slice(0, f.post).map((x) => `${SETT[x.dow]} ${x.d}/${mese + 1}`);
  const t = TEMI(v, fatti);
  const foto = t.foto.slice(0, f.post - f.video);
  const video = t.video.slice(0, f.video);
  const passo = f.video ? Math.floor(f.post / f.video) : Infinity;
  const righe = [];
  for (let i = 0; i < f.post; i++) {
    const [formato, tema, testo] = i % passo === 0 && video.length ? video.shift() : foto.shift() ?? video.shift();
    righe.push({ data: date[i] ?? `${i + 1}ª uscita`, formato, tema, testo });
  }
  const ritmo = f.post === 8 ? '2 a settimana' : f.post === 12 ? '3 a settimana' : '5 a settimana';
  return {
    mese: `${MESI[mese]} ${anno}`,
    nota: `${f.post} contenuti, ${ritmo}${f.video ? `, con ${f.video} video brevi` : ''}, come prevede il ${f.nome}. I temi partono da quello che si vede su Google: prodotti, orari e persone li confermiamo con voi prima di pubblicare.`,
    righe,
  };
}

const corta = (s, n = 150) => { const t = String(s).replace(/[.!;,\s]+$/, ''); return t.length > n ? t.slice(0, t.lastIndexOf(' ', n - 1)) + '…' : t; };
const orariTesto = (o) => o.map((d) => `${d.giorno} ${d.ore}`).join(' · ');

/** dati.json completo dai soli fatti Google: ogni testo viene da una regola su un fatto letto. */
export function lampo(x, link, adesso = new Date()) {
  const v = FAMIGLIE.find((f) => f.re.test(x.categorie.join(' ') || x.nome));
  const cat = x.categorie[0] ?? 'Attività';
  const fonte = /^https:\/\//.test(link) ? link : x.place_id ? `https://www.google.com/maps/place/?q=place_id:${x.place_id}` : null;
  const recFonte = x.place_id ? `https://search.google.com/local/reviews?placeid=${x.place_id}` : fonte;
  const socialNome = x.sito_tipo === 'social' ? (/instagram/i.test(x.sito) ? 'Instagram' : /tiktok/i.test(x.sito) ? 'TikTok' : 'Facebook') : null;
  const consigliato = x.sito_tipo === 'proprio' ? 'business' : 'base';
  const F = FASCE[consigliato];
  const n = x.recensioni_n;
  const voto = x.voto != null ? String(x.voto).replace('.', ',') : null;
  const tutteViste = n > 0 && x.recensioni.length >= n;
  const anni = x.recensione_piu_recente_giorni >= 730 ? Math.floor(x.recensione_piu_recente_giorni / 365) : 0;
  const vecchie = anni ? `Le recensioni più recenti che Google mostra sono di circa ${anni} anni fa: prima di entrare controlla che sia ancora aperta.` : null;
  const ultima = tutteViste ? x.recensioni.reduce((a, b) => (b.giorni && b.giorni < a.giorni ? b : a)) : null;
  const via = (x.via ?? x.indirizzo).replace(/,\s*\d+\w*$/, '');
  const ora = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(adesso);

  const buchi = [x.non_rivendicata && 'non è rivendicata', !x.orari.length && 'non ha orari', !x.telefono && 'non ha telefono',
    x.copertina_street_view && 'la copertina è un\'immagine di Street View',
    x.sito_tipo === 'social' && `il «sito» è la pagina ${socialNome}`, x.sito_tipo === 'nessuno' && 'non indica un sito'].filter(Boolean);
  const mancaPerChi = [!x.orari.length && 'gli orari', !x.telefono && 'un numero da chiamare'].filter(Boolean);
  const positive = x.recensioni.filter((r) => r.testo && (r.voto ?? 5) >= 4);
  const negative = x.recensioni.filter((r) => r.testo && r.voto != null && r.voto <= 3);
  // Le recensioni entrano solo come temi, e un tema vale solo se lo citano almeno 3 recensioni: mai testi né
  // nomi (parere legale del 26/11, punto GDPR, fatto agenzia.rapporto-imprenditore). I testi restano in memoria.
  const persone = positive.filter((r) => /gentil|titolar|personale|staff|simpatic|cordial|accoglien/i.test(r.testo)).length >= 3;
  const tabacchi = /tabacc|sisal|lotto|scommess|ricevitor/i.test(x.categorie.join(' '));

  const campo = (voce, valore, stato, f = fonte) => ({ voce, valore: valore ?? null, stato: valore ? stato : 'non_trovato', fonte: valore ? f : null });
  const campi = [
    campo('Nome', x.nome, 'confermato'),
    campo('Tipo', x.categorie.join(', ') || null, 'confermato'),
    campo('Indirizzo', x.indirizzo, 'confermato'),
    campo('Telefono dell\'attività', x.telefono, 'confermato'),
    campo('Orari', x.orari.length ? orariTesto(x.orari) : null, 'confermato'),
    campo('Sito', x.sito ? (x.sito_tipo === 'social' ? `Nessun sito: Google rimanda alla pagina ${socialNome} (${x.sito})` : x.sito) : null, 'confermato'),
    campo('Scheda Google', buchi.length ? `Da sistemare: ${buchi.join('; ')}` : 'Completa: rivendicata, con orari, telefono e sito', 'confermato'),
    campo('Recensioni Google', n ? `${voto} su 5, da ${n} recensioni` : null, 'confermato', recFonte),
    ...(x.descrizione ? [campo('Descrizione su Google', x.descrizione, 'confermato')] : []),
    ...(x.attributi.length ? [campo('Servizi segnati su Google', x.attributi.slice(0, 6).join(', '), 'confermato')] : []),
    ...(x.chiusa ? [campo('Stato', `Google la segna chiusa ${x.chiusa}`, 'confermato')] : []),
  ];

  const ha = [
    n && x.voto >= 4.5 && `Un voto alto su Google: ${voto} su 5${n < 10 ? `, anche se da sole ${n} recensioni` : ` da ${n} recensioni`}.`,
    n && x.voto >= 4 && x.voto < 4.5 && `Un voto buono su Google: ${voto} su 5 da ${n} recensioni.`,
    n >= 50 && `Tante recensioni: ${n}, un pubblico che parla di loro.`,
    x.telefono && 'Il telefono sulla scheda Google.',
    x.orari.length && 'Gli orari sulla scheda Google.',
    x.sito_tipo === 'proprio' && `Un sito suo: ${x.sito.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}.`,
    x.sito_tipo === 'social' && `Una pagina ${socialNome}, che Google mostra come sito.`,
    x.descrizione && 'Una descrizione su Google scritta da loro.',
    ...x.attributi.slice(0, 2).map((a) => `${a}, segnato su Google.`),
  ].filter(Boolean);
  const nonHa = [
    x.sito_tipo === 'nessuno' && 'Un sito: su Google il campo è vuoto.',
    x.sito_tipo === 'social' && `Un sito: Google rimanda alla pagina ${socialNome}.`,
    x.non_rivendicata && 'Una scheda Google rivendicata: oggi chiunque può proporre modifiche al posto del titolare.',
    !x.orari.length && 'Gli orari sulla scheda Google.',
    !x.telefono && 'Un numero di telefono sulla scheda Google.',
    x.copertina_street_view && 'Foto vere come copertina: c\'è un\'immagine di Street View.',
    !x.descrizione && 'Una descrizione dell\'attività su Google.',
    `Un modo per ordinare o prenotare senza venire ${v.al_locale}.`,
  ].filter(Boolean);
  const migliorare = [
    n < 10 && `Le recensioni: ${n} in tutto${ultima ? `, l'ultima di circa ${ultima.quando}` : ''}. Vanno chieste ai clienti abituali.`,
    n >= 5 && x.voto < 4.2 && `Il voto: ${voto} su 5. Rispondere alle recensioni con garbo lo fa salire.`,
    negative.length && `Le critiche: ${negative.length} delle recensioni che Google mostra per prime sono da 3 stelle o meno.`,
    x.categorie.length === 1 && `Le categorie su Google: oggi solo «${cat}»; se fanno altro va aggiunto.`,
    x.sito_tipo === 'proprio' && 'Il sito: da misurare con Google PageSpeed (velocità e ricerca) prima di entrare.',
    'I social: questa prima versione legge solo la scheda Google; profili e frequenza dei post sono da guardare.',
  ].filter(Boolean);

  const sintesi = n
    ? `${voto} su 5 su Google da ${n} recensioni.${n < 10 ? ' Sono poche per convincere chi non li conosce.' : ''} I testi non si riportano: solo i temi citati da almeno 3 recensioni.`
    : 'Nessuna recensione su Google: è il primo lavoro da fare.';
  // (i testi non si riportano: vedi sopra)

  const social = [{ canale: 'Scheda Google Maps', stato: 'trovato', livello: buchi.length ? 'Da sistemare' : 'Completa',
    giudizio: `${n ? `${voto} su 5 da ${n} recensioni. ` : 'Nessuna recensione. '}${buchi.length ? `La scheda ${buchi.join(', ')}.` : 'Orari, telefono e sito ci sono.'}`, fonte }];
  if (x.sito_tipo === 'social') social.push({ canale: socialNome, stato: 'trovato', livello: 'C\'è, da vedere', giudizio: 'È il «sito» indicato su Google. Quanto pubblica non l\'ho guardato.', fonte: x.sito.replace(/^https:\/\/m\./, 'https://www.') });

  const gancio = mancaPerChi.length || x.non_rivendicata
    ? `Su Google ${n ? `avete ${voto} su 5` : 'ci siete'}, ma chi vi cerca ${mancaPerChi.length ? `non trova ${mancaPerChi.join(' né ')}` : 'trova una scheda che non è a vostro nome'}. In una settimana la mettiamo a posto, con le foto vere ${v.banco === 'il banco' ? 'del vostro banco' : 'del vostro locale'}: così chi passa in ${via} sa che siete aperti.`
    : x.sito_tipo !== 'proprio'
      ? `Chi vi cerca su Google trova ${x.sito_tipo === 'social' ? `la pagina ${socialNome}` : 'solo la scheda'}, non un sito vostro. Ve lo facciamo noi, con quello che i clienti già dicono di voi.`
      : `Su Google avete ${voto} su 5 da ${n} recensioni: il pubblico c'è. Vi aiutiamo a farlo tornare ogni settimana, con contenuti costanti e un sito che lavora.`;

  const piaVenduto = F.post === 8 ? '2 a settimana' : '3 a settimana';
  const offerta = [
    { servizio: 'La scheda Google rimessa a posto', perche: `${x.non_rivendicata ? 'Rivendicata a nome del titolare, con' : 'Con'} orari, telefono, foto vere e le categorie giuste. È la cosa che porta clienti nuovi più in fretta.` },
    { servizio: consigliato === 'base' ? 'Un sito di una pagina' : 'Un sito di più pagine', perche: x.sito_tipo === 'proprio' ? 'Il sito di oggi si misura prima di entrare; se è semplice si rifà, se è curato si tiene e si collega alla vetrina.' : `Oggi ${x.sito_tipo === 'social' ? `il «sito» è ${socialNome}` : 'non c\'è un sito'}. Una pagina veloce dal telefono, col nome, ${v.cosa}, gli orari e come arrivare.` },
    { servizio: `${F.post} contenuti al mese`, perche: `${piaVenduto}${F.video ? `, con ${F.video} video brevi` : ''}. Testi e foto li prepariamo noi, il titolare approva l'anteprima su WhatsApp.` },
    { servizio: 'Foto con scattiDG', perche: `${consigliato === 'base' ? 'Una sessione all\'avvio' : 'Una sessione all\'avvio e una ogni tre mesi, più un video al mese'}: ${v.banco}, ${v.cosa}, il locale.${x.copertina_street_view ? ' Prendono il posto dell\'immagine di Street View che oggi fa da copertina.' : ''}` },
    { servizio: 'Vetrina su MyCity', perche: `${v.mycity[0].toUpperCase()}${v.mycity.slice(1)}. Su questi ordini MyCity prende il 10%, che paga consegna e servizio; sulle vendite al banco niente.` },
  ];

  const piu = (s) => s[0].toUpperCase() + s.slice(1);
  const forti = [
    n && x.voto >= 4 && `Su Google avete ${voto} su 5${n >= 20 ? `, da ${n} recensioni` : ''}.`,
    x.telefono && x.orari.length && 'Chi vi cerca trova già orari e telefono.',
    x.descrizione && `Vi presentate così: «${corta(x.descrizione, 120)}».`,
    ...x.attributi.slice(0, 1).map((a) => `${a}: Google lo mostra a chi cerca.`),
  ].filter(Boolean);
  const deboli = [
    !x.orari.length && 'Su Google non ci sono orari: chi vuole passare non sa se vi trova aperti.',
    !x.telefono && 'Su Google non c\'è un numero da chiamare.',
    x.non_rivendicata && 'La scheda Google non è a vostro nome: chiunque può proporre modifiche.',
    n < 10 && `Le recensioni sono ${n}: poche per farsi scegliere da chi non vi conosce.`,
    x.copertina_street_view && 'Al posto delle vostre foto, su Google c\'è un\'immagine di Street View.',
    x.sito_tipo === 'nessuno' && 'Non avete un sito: su Google il campo è vuoto.',
    x.sito_tipo === 'social' && `Non avete un sito: Google manda a ${socialNome}, che non tutti aprono.`,
    negative.length && 'Alcune recensioni fanno critiche: conviene rispondere, con garbo.',
  ].filter(Boolean);

  return {
    nome: x.nome, tipo: cat, citta: x.citta ?? 'Piacenza', indirizzo: x.indirizzo, data: ora, foto: null, link_google: fonte,
    versione: 'lampo: solo la scheda Google, letta da cervello/da-link-maps.mjs',
    stato_mycity: 'Da controllare su MyCity', consigliato,
    in_30_secondi: [
      `${cat} in ${x.indirizzo}.`,
      n ? `Su Google ha ${voto} su 5 da ${n} recensioni${ultima ? `: l'ultima è di circa ${ultima.quando}` : ''}.` : 'Su Google non ha ancora recensioni.',
      buchi.length ? `La scheda Google ${buchi.join(', ')}.` : 'La scheda Google è completa: orari, telefono e sito ci sono.',
      x.descrizione ? `Si presenta così: «${corta(x.descrizione, 120)}».` : persone ? 'Le recensioni lodano le persone: è il punto forte da cui partire.' : null,
      x.chiusa ? `Attenzione: Google la segna chiusa ${x.chiusa}.` : vecchie ?? 'Versione lampo: solo la scheda Google. Social, omonimi e stampa sono ancora da guardare.',
    ].filter(Boolean),
    gancio,
    perche_consigliato: consigliato === 'base'
      ? `Non c'è un sito vero (${x.sito_tipo === 'social' ? `Google rimanda a ${socialNome}` : 'il campo è vuoto'}): per la tabella firmata, nessun sito vuol dire bozza dal Base. Il Base copre quello che manca: sito di una pagina, scheda Google sistemata all'avvio, 8 contenuti al mese, una sessione di foto. Il Business ha senso dopo, quando ci sono recensioni a cui rispondere e voglia di video.`
      : 'Il sito c\'è: prima di entrare va misurato (Google PageSpeed) e guardato. Per la tabella firmata, se è semplice si rifà già dal Base; se è curato, il Business lo rifà di più pagine e dà 12 contenuti con 2 video. Consiglio provvisorio, da rivedere dopo la misura.',
    perche_consigliato_cliente: consigliato === 'base'
      ? 'Per voi consigliamo il Base: vi mette su Google con orari, telefono e foto vere, vi dà un sito vostro e 2 contenuti a settimana. Quando vorrete i video, si sale al Business.'
      : 'Per voi consigliamo il Business: un sito di più pagine, 3 contenuti a settimana con 2 video, le risposte alle recensioni e un\'analisi ogni mese. Potete partire dal Base e salire quando volete.',
    campi, ha, non_ha: nonHa, migliorare,
    reputazione: {
      sintesi,
      positivi: [persone ? 'Tema che torna in almeno 3 recensioni: le persone, gentili e accoglienti.' : 'Nessun tema citato da almeno 3 recensioni: i testi non si riportano (regola privacy del 26/11).'],
      negativi: [negative.length ? `${negative.length} delle recensioni che Google mostra per prime sono da 3 stelle o meno: leggile dal telefono prima di entrare.` : 'Nessuna recensione negativa tra quelle che Google mostra per prime.'],
    },
    sito: x.sito_tipo === 'proprio'
      ? { livello: 'da misurare', numeri: [], giudizio: `Il sito c'è (${x.sito}). Velocità e ricerca si misurano con Google PageSpeed; aspetto, pagine e funzioni li guarda la sessione.`, fonte: x.sito.startsWith('https://') ? x.sito : fonte }
      : { livello: 'nessuno', numeri: [], giudizio: `Non c'è un sito: ${x.sito_tipo === 'social' ? `nella scheda Google il campo «sito web» porta alla pagina ${socialNome}` : 'nella scheda Google il campo «sito web» è vuoto'}. Per la tabella firmata da Nicola la bozza parte dal Base.`, fonte },
    social,
    potenziale: [
      buchi.length && `La scheda Google è il primo cliente da conquistare: ${x.non_rivendicata ? 'rivendicata e ' : ''}completa (orari, telefono, foto vere, categorie giuste) si vede nelle ricerche «vicino a me» in una o due settimane.`,
      n < 20 && `Le recensioni: con i clienti abituali si può passare da ${n} a qualche decina in pochi mesi, se le si chiede (stima, da misurare).`,
      persone && 'Le persone sono il punto forte che i clienti citano: i contenuti possono partire da loro, se lo vogliono.',
      `Su MyCity: ${v.mycity}. Sugli ordini fatti da MyCity c'è il 10%; quello che vendono al banco resta tutto loro.`,
    ].filter(Boolean),
    offerta,
    domande: [
      !x.orari.length ? 'Quali sono gli orari veri, giorno per giorno, festivi compresi?' : 'Gli orari su Google sono giusti, anche nei festivi?',
      !x.telefono && 'C\'è un numero dell\'attività da mettere su Google?',
      x.non_rivendicata && 'La scheda Google l\'avete mai gestita voi? Google la mostra come non rivendicata.',
      `Cosa vi chiedono di più i clienti, e cosa vorreste far conoscere?`,
      'Chi gestisce oggi i social, e ogni quanto pubblica?',
      `Cosa vendereste anche fuori: ${v.mycity}?`,
    ].filter(Boolean),
    obiezioni: [
      { obiezione: 'Ho già i social, mi bastano.', risposta: 'I social li vede chi vi segue già. Chi vi cerca su Google oggi trova la scheda così com\'è: noi sistemiamo la strada da cui arrivano i clienti nuovi.' },
      { obiezione: 'Non ho tempo per i social.', risposta: 'Non vi serve: le foto le fa scattiDG, i testi li scriviamo noi, voi approvate l\'anteprima su WhatsApp.' },
      { obiezione: `${F.centesimi / 100} euro al mese sono tanti.`, risposta: `Il primo mese costa la metà e non c'è vincolo: si disdice con 30 giorni di preavviso.${consigliato !== 'base' ? ` Il Base parte da ${FASCE.base.centesimi / 100} euro, e si sale quando si vuole.` : ''}` },
      { obiezione: 'Poi mi prendete una percentuale.', risposta: 'Su quello che vendete al banco, niente. Sui prodotti venduti tramite MyCity c\'è il 10%, anche con l\'abbonamento: paga la consegna e il servizio.' },
    ],
    attenzione: [
      'Il 10% sui prodotti venduti tramite MyCity resta anche con l\'abbonamento (regola del 26/11): dillo subito, mai «nessuna percentuale».',
      vecchie,
      tabacchi && 'Nei contenuti mai gioco né tabacco: in Italia la pubblicità è vietata.',
      (!x.orari.length || !x.telefono) && 'Orari e telefono non vanno scritti da nessuna parte finché il titolare non li dà.',
      'Versione lampo: i dati vengono solo dalla scheda Google, letta direttamente. Social, omonimi e stampa non sono ancora stati cercati.',
    ].filter(Boolean),
    fonti: [
      { titolo: 'Scheda Google Maps', url: fonte },
      ...(recFonte && recFonte !== fonte ? [{ titolo: 'Recensioni Google', url: recFonte }] : []),
      ...(x.sito?.startsWith('https://') ? [{ titolo: x.sito_tipo === 'social' ? `Pagina ${socialNome}` : 'Sito dell\'attività', url: x.sito }] : []),
    ].filter((f) => f.url),
    proposta: {
      saluto: `Abbiamo guardato ${x.nome} come la vede chi vi cerca dal telefono.${n && x.voto >= 4 ? ` Chi vi conosce vi dà ${voto} su 5.` : ''} ${mancaPerChi.length ? `Chi non vi conosce, oggi, su Google non trova ${mancaPerChi.join(' né ')}.` : 'Vi manca un racconto costante, ogni settimana, che porti al banco chi non vi conosce ancora.'}`,
      forti: forti.length ? forti : [`Siete in ${via}, dove chi passa vi vede ogni giorno.`],
      deboli: deboli.length ? deboli : ['Il racconto in rete è poco costante: chi non vi conosce non ha motivi per scegliervi.'],
      cosa_facciamo: [
        { tema: 'Google Maps', oggi: buchi.length ? piu(buchi.slice(0, 2).join(', ')) : 'Scheda completa', con_noi: `Scheda ${x.non_rivendicata ? 'a vostro nome, ' : ''}con orari, telefono, foto vere e le categorie giuste` },
        { tema: 'Sito', oggi: x.sito_tipo === 'proprio' ? 'Un sito c\'è, da misurare' : x.sito_tipo === 'social' ? `Nessun sito: Google manda a ${socialNome}` : 'Nessun sito', con_noi: consigliato === 'base' ? 'Un sito di una pagina col vostro nome, veloce dal telefono' : 'Un sito di più pagine col vostro nome, veloce dal telefono' },
        { tema: 'Social', oggi: x.sito_tipo === 'social' ? `${socialNome} c'è` : 'Da vedere con voi', con_noi: `${F.post} contenuti al mese, ${piaVenduto}${F.video ? `, con ${F.video} video brevi` : ''}; voi approvate l'anteprima su WhatsApp` },
        { tema: 'Foto', oggi: x.copertina_street_view ? 'La copertina è un\'immagine di Street View' : 'Le foto di oggi', con_noi: consigliato === 'base' ? 'Una sessione con scattiDG all\'avvio' : 'Una sessione con scattiDG all\'avvio e una ogni tre mesi, più un video al mese' },
        { tema: 'Vendite', oggi: 'Solo al banco', con_noi: 'Vetrina su MyCity per ordinare e ritirare; il 10% solo sugli ordini fatti da MyCity' },
      ],
      standard_sito: [
        'Si apre in meno di 3 secondi dal telefono (la misura di Google per i siti veloci).',
        'Nome, indirizzo e telefono identici a quelli della scheda Google.',
        'Dati per Google in formato schema.org: orari e indirizzo li leggono anche i motori di ricerca.',
        'Leggibile da tutti: contrasto dei testi e descrizione delle immagini secondo le regole WCAG 2.1.',
        'Pensato prima per il telefono, poi per il computer.',
        'Nessun cookie di profilazione, quindi nessun banner da chiudere.',
      ],
      piano: piano(consigliato, v, x, adesso),
      primi_30_giorni: [
        { quando: 'Settimana 1', cosa: `Mezz'ora con voi: orari, telefono, cosa vendete di più, accessi ai social.${x.non_rivendicata ? ' Rivendichiamo insieme la scheda Google.' : ''} Sessione di foto con scattiDG.` },
        { quando: 'Settimana 2', cosa: 'La scheda Google è completa. Il sito va online. Vi consegniamo l\'analisi d\'avvio ed escono i primi contenuti.' },
        { quando: 'Settimana 3', cosa: 'I social prendono il ritmo; la vetrina MyCity con quello che si può ordinare e ritirare, se la volete.' },
        { quando: 'Settimana 4', cosa: 'Il piano del mese dopo preparato con voi, da approvare su WhatsApp.' },
      ],
      su_misura: {
        base: `Un sito di una pagina con ${v.cosa}, gli orari giusti e come arrivare in ${via}; 8 contenuti al mese su Facebook e Instagram; la scheda Google ${x.non_rivendicata ? 'rivendicata e ' : ''}sistemata all'avvio.`,
        business: `Un sito di più pagine col nome ${x.nome}; 3 contenuti a settimana con 2 video di ${v.banco}; le risposte alle recensioni Google scritte da noi, e un'analisi ogni mese.`,
        premium: `Foto e video di ${v.banco} ogni mese, anche le storie, la scheda Google curata ogni mese e un incontro al mese per leggere i numeri insieme.`,
      },
    },
    sito_bozza: {
      schema_tipo: v.schema, palette: v.palette, sfondo_eroe: v.eroe, testo_eroe: v.palette.fondo,
      font: { titoli: 'Lora', testo: 'Nunito Sans' },
      sopra_titolo: x.categorie.slice(0, 2).join(' · ') || cat,
      claim: v.claim,
      azione: x.telefono ? 'Chiama' : 'Come arrivare',
      lingue: ['it'],
      chi_siamo: x.descrizione ?? `Siamo ${x.nome}, in ${via}. Qui raccontiamo chi siamo e cosa facciamo: i testi li scriviamo insieme al titolare.`,
      cosa_offriamo: (x.categorie.length > 1 ? x.categorie.slice(0, 4) : [cat, 'Il locale', 'Le persone']).map((c, i) => ({
        titolo: c, testo: i === 0 ? `${piu(v.cosa)}, come li facciamo noi.` : 'Da raccontare con il titolare.' })),
      extra: [],
      dove_siamo: `${x.indirizzo}.`,
      orari: x.orari.length ? `${orariTesto(x.orari)} (da confermare con il titolare).` : 'Orari da confermare con il titolare: oggi non sono scritti da nessuna parte.',
      contatti: { indirizzo: x.indirizzo, telefono: x.telefono, altro: x.sito_tipo === 'social' ? `${socialNome}: ${x.nome}` : null },
      foto_segnaposto: `Qui la foto di ${v.banco}, scattata da scattiDG`,
    },
  };
}

// ———————————————————————————————————————————————— uso da riga di comando

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'attivita';

/**
 * La cartella del cliente si sceglie dal codice del luogo Google (place_id o cid) scritto nel google.json delle
 * cartelle che ci sono già: mai dal nome, che due attività possono avere uguale o simile (collaudo 26/11: un
 * «Salone Regina» finiva nella cartella di un altro cliente e ne sovrascriveva i dati).
 */
export function scegliCartella(base, x, giorno) {
  const cartelle = fs.existsSync(base) ? fs.readdirSync(base) : [];
  const stessa = cartelle.find((d) => {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(base, d, 'google.json'), 'utf8'));
      return (x.place_id && j.place_id === x.place_id) || (x.cid && j.cid === x.cid);
    } catch { return false; }
  });
  if (stessa) return path.join(base, stessa);
  let nome = `${giorno}-${slug(x.nome)}`;
  for (let k = 2; fs.existsSync(path.join(base, nome)); k++) nome = `${giorno}-${slug(x.nome)}-${k}`;
  return path.join(base, nome);
}

function stampa(x) {
  const r = [];
  r.push(`${x.nome} · ${x.categorie.join(', ') || 'categoria non indicata'}`);
  r.push(`  ${x.indirizzo}${x.plus_code ? ` (${x.plus_code})` : ''}`);
  r.push(`  Voto ${x.voto ?? '—'} su 5 · ${x.recensioni_n} recensioni · telefono ${x.telefono ?? 'NO'} · orari ${x.orari.length ? 'sì' : 'NO'} · sito ${x.sito ?? 'NO'}${x.sito_tipo === 'social' ? ' (è un social)' : ''}`);
  r.push(`  Scheda ${x.non_rivendicata ? 'NON rivendicata' : 'rivendicata'}${x.copertina_street_view ? ' · copertina Street View' : ''}${x.chiusa ? ` · CHIUSA ${x.chiusa}` : ''}`);
  if (x.descrizione) r.push(`  Descrizione: ${x.descrizione}`);
  for (const rc of x.recensioni.slice(0, 5)) r.push(`  ${rc.voto ?? '?'}★ ${rc.quando}${rc.testo ? '' : ' (senza testo)'}`);
  return r.join('\n');
}

function principale(argv) {
  const input = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--da-file');
  const daFile = argv.includes('--da-file') ? argv[argv.indexOf('--da-file') + 1] : null;
  if (!input && !daFile) { console.error('Uso: node cervello/da-link-maps.mjs <link Google Maps | "nome, città"> [--lampo] [--json] [--da-file risposta.txt]'); return 2; }
  const t0 = Date.now();
  let r;
  try {
    r = daFile ? (() => { const j = json(fs.readFileSync(daFile, 'utf8')); return g(j, 6)?.[11] ? g(j, 6) : g(j, 0, 1)?.map((y) => g(y, 14)).find((y) => y?.[11]); })() : scaricaScheda(input);
  } catch (e) { console.error(`✗ ${e.message}`); return 1; }
  if (!r) { console.error('✗ nella risposta non c\'è una scheda Google leggibile'); return 1; }
  const x = estrai(r);
  if (argv.includes('--json')) { console.log(JSON.stringify({ ...x, recensioni: x.recensioni.map(({ testo, ...resto }) => resto) }, null, 2)); return 0; }
  console.log(stampa(x));
  if (!argv.includes('--lampo')) { console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)} s)`); return 0; }

  if (x.chiusa) { console.error(`✗ Google segna «${x.nome}» chiusa ${x.chiusa}: niente proposta.`); return 1; }
  const giorno = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
  const cartella = scegliCartella(path.join(RADICE, 'consegne/clienti'), x, giorno);
  fs.mkdirSync(cartella, { recursive: true });
  const gj = path.join(cartella, 'google.json');
  // Non si cancella niente: la lettura di prima resta accanto, col suo orario.
  if (fs.existsSync(gj)) fs.renameSync(gj, path.join(cartella, `google.${new Date().toISOString().replace(/[:.]/g, '-')}.json`));
  // Da Google si salva solo l'identificativo della scheda (parere legale del 26/11): niente voti, recensioni,
  // orari, nomi o indirizzi presi da lì. Serve a ritrovare la cartella giusta la prossima volta.
  fs.writeFileSync(gj, JSON.stringify({ letto: new Date().toISOString(), place_id: x.place_id, cid: x.cid }, null, 2) + '\n');
  const dati = path.join(cartella, 'dati.json');
  if (fs.existsSync(dati)) console.log(`  dati.json c'è già in ${path.relative(RADICE, cartella)}: non lo tocco (aggiornato solo google.json).`);
  else fs.writeFileSync(dati, JSON.stringify(lampo(x, input ?? ''), null, 2) + '\n');
  try {
    process.stdout.write(execFileSync(process.execPath, [path.join(QUI, 'scheda-cliente.mjs'), cartella], { encoding: 'utf8' }));
  } catch (e) { process.stdout.write(e.stdout ?? ''); process.stderr.write(e.stderr ?? ''); return 1; }
  console.log(`  pronto in ${((Date.now() - t0) / 1000).toFixed(1)} s · cartella ${path.relative(RADICE, cartella)}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(principale(process.argv.slice(2)));
