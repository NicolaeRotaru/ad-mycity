#!/usr/bin/env node
// IL PIANO EDITORIALE PER ABBONAMENTO — 26/11/2026.
//
// Nicola: «il piano editoriale va non solo personalizzato in base al cliente, ma va anche adattato in
// base all'abbonamento … questo è il modello che verrà usato, migliorato, perfezionato nel tempo».
//
// Come lavora. Le quantità di ogni fascia vivono in UN posto: cervello/modelli/piano-editoriale-fasce.json.
// Il piano del mese di un cliente è un file di dati scritto dall'AD (le idee le scrive lei, è giudizio):
// ogni contenuto porta la fascia più bassa in cui compare. Le fasce sono a matrioska: il Business contiene
// tutto il Base, il Premium tutto il Business. Questo programma fa la parte meccanica:
//   ① espande il piano per ogni fascia (e nel Premium aggiunge le storie delle sere che non ne hanno una);
//   ② conta e confronta con la promessa della fascia: un contenuto in più o in meno è un errore;
//   ③ controlla i giorni di chiusura, le parole vietate dal tono del cliente e i prezzi (solo dal menu);
//   ④ scrive le righe per il Calendario «Social Clienti» (stato «idea», mai pubblicate da qui) e la pagina.
//
// Uso:
//   node cervello/piano-editoriale.mjs --piano consegne/clienti/<cliente>/piano-editoriale-AAAA-MM.json
//        [--righe base|business|premium]   stampa le righe nuove per il Calendario (JSON)
//        [--pagina <modello.html> <uscita.html>]   scrive la pagina coi dati dentro
//        [--json <uscita.json>]   il piano espanso, fascia per fascia
// Esce con 1 se un controllo fallisce.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const QUI = dirname(fileURLToPath(import.meta.url));
export const MODELLO_PREDEFINITO = join(QUI, 'modelli', 'piano-editoriale-fasce.json');
export const FASCE = ['base', 'business', 'premium'];

const FEED = new Set(['post', 'carosello', 'reel']);
/** Tipi che si possono fare anche nel giorno di chiusura: non chiamano gente nel locale quella sera. */
const OK_A_LOCALE_CHIUSO = new Set(['google_post', 'google_foto', 'sito', 'schede', 'lavoro', 'ads', 'aziende', 'email', 'whatsapp', 'stampa']);
const TIPI = new Set([...FEED, 'storia', 'google_post', 'google_foto', 'whatsapp', 'email', 'mossa', 'evento', 'creator', 'ads', 'stampa', 'aziende', 'sito', 'schede', 'lavoro']);
const PAROLE_SEMPRE_VIETATE = ['il migliore', 'il più buono', 'garantit'];
/** I testi che legge il pubblico: lì un prezzo deve stare nel menu. Nelle schede di lavoro (budget, proposte) no. */
const PUBBLICI = new Set([...FEED, 'storia', 'google_post', 'whatsapp', 'email', 'sito']);

const rango = (f) => FASCE.indexOf(f);
const leggi = (p) => JSON.parse(readFileSync(p, 'utf8'));
const normale = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'");

/** I giorni del mese (AAAA-MM) con il giorno della settimana: 0 domenica … 6 sabato. */
export function giorniDelMese(mese) {
  const [a, m] = mese.split('-').map(Number);
  const quanti = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return Array.from({ length: quanti }, (_, i) => {
    const data = `${mese}-${String(i + 1).padStart(2, '0')}`;
    return { data, settimana: new Date(`${data}T12:00:00Z`).getUTCDay() };
  });
}

/** Le sere in cui il locale è aperto: tolti i giorni di chiusura della settimana e quelli in più. */
export function sereAperte(piano) {
  const chiusi = new Set(piano.giorni_chiusura_settimana ?? []);
  const extra = new Set((piano.chiusure_extra ?? []).map((c) => c.data));
  return giorniDelMese(piano.mese).filter((g) => !chiusi.has(g.settimana) && !extra.has(g.data)).map((g) => g.data);
}

/** Il piano di una fascia: i contenuti fino a quella fascia, meno quelli sostituiti, più le storie di rubrica. */
export function espandi(piano, modello, fascia) {
  const r = rango(fascia);
  if (r < 0) throw new Error(`fascia sconosciuta: ${fascia}`);
  const dentro = piano.contenuti.filter((c) => rango(c.fascia) <= r);
  const sostituiti = new Set(dentro.map((c) => c.sostituisce).filter(Boolean));
  const voci = dentro.filter((c) => !sostituiti.has(c.id)).map((c) => ({ ...c, piattaforme: piattaforme(c, modello, fascia) }));
  if (modello.fasce[fascia].quantita.storie === 'ogni_sera_di_apertura') {
    const conStoria = new Set(voci.filter((c) => c.tipo === 'storia').map((c) => c.data));
    const rub = piano.rubriche_storie ?? { giorni: {}, date_speciali: {} };
    for (const data of sereAperte(piano)) {
      if (conStoria.has(data)) continue;
      const g = new Date(`${data}T12:00:00Z`).getUTCDay();
      const base = rub.date_speciali?.[data] ?? rub.giorni?.[String(g)];
      if (!base) continue; // il conto delle storie se ne accorge
      voci.push({ id: `r-${data.slice(5)}`, fascia, data, ora: '20:00', tipo: 'storia', materiale: 'foto o clip della sera', cta: 'Link WhatsApp', rubrica: true, ...base, piattaforme: ['instagram', 'facebook'] });
    }
  }
  return voci.sort((a, b) => `${a.data} ${a.ora}`.localeCompare(`${b.data} ${b.ora}`));
}

function piattaforme(c, modello, fascia) {
  if (FEED.has(c.tipo) || c.tipo === 'storia') {
    const extra = c.tipo === 'reel' ? modello.fasce[fascia].reel_anche_su ?? [] : [];
    return ['instagram', 'facebook', ...extra];
  }
  if (c.tipo.startsWith('google')) return ['google'];
  return [];
}

/** Quanti contenuti di ogni voce ha il piano di una fascia, con le stesse chiavi del modello. */
export function conta(voci) {
  const n = (f) => voci.filter(f).length;
  return {
    feed: n((c) => FEED.has(c.tipo)),
    reel: n((c) => c.tipo === 'reel'),
    reel_da_riprese: n((c) => c.tipo === 'reel' && /ripres/i.test(c.materiale ?? '')),
    storie: n((c) => c.tipo === 'storia'),
    google_post: n((c) => c.tipo === 'google_post'),
    google_foto: voci.filter((c) => c.tipo === 'google_foto').reduce((s, c) => s + (Number(c.quante) || 0), 0),
    ...Object.fromEntries(['whatsapp', 'email', 'mossa', 'evento', 'creator', 'ads', 'stampa', 'aziende', 'sito', 'schede'].map((t) => [t, n((c) => c.tipo === t)])),
  };
}

/** Gli errori di una fascia: conti diversi dalla promessa, giorni chiusi, parole vietate, prezzi fuori menu. */
export function controlla(piano, modello, fascia) {
  const errori = [];
  const f = modello.fasce[fascia];
  const voci = espandi(piano, modello, fascia);
  const conti = conta(voci);
  const aperte = sereAperte(piano);
  for (const [voce, promessa] of Object.entries(f.quantita)) {
    const fatto = conti[voce];
    if (promessa === 'ogni_sera_di_apertura') {
      if (fatto !== aperte.length) errori.push(`${fascia}: ${fatto} storie, ma le sere di apertura sono ${aperte.length}`);
    } else if (voce === 'reel_da_riprese') {
      if (fatto < promessa) errori.push(`${fascia}: ${fatto} reel girati nel locale, la fascia ne promette almeno ${promessa}`);
    } else if ((voce === 'creator' && f.creator_ogni) || (voce === 'stampa' && f.stampa_ogni)) {
      if (fatto > promessa) errori.push(`${fascia}: ${fatto} ${voce} nel mese, la fascia ne dà ${promessa} ogni ${f[`${voce}_ogni`]}`);
    } else if (fatto !== promessa) {
      errori.push(`${fascia}: ${voce} ${fatto}, la fascia ne promette ${promessa}`);
    }
  }
  const visti = new Map();
  for (const c of piano.contenuti) {
    if (visti.has(c.id)) errori.push(`${fascia}: due contenuti con lo stesso id «${c.id}»`);
    visti.set(c.id, true);
  }
  const allOra = new Map();
  for (const c of voci.filter((v) => FEED.has(v.tipo) || v.tipo === 'storia')) {
    const chiave = `${c.data} ${c.ora}`;
    if (allOra.has(chiave)) errori.push(`${fascia}/${c.id}: esce alla stessa ora di ${allOra.get(chiave)} (${chiave})`);
    allOra.set(chiave, c.id);
  }
  const chiusoIl = new Set(giorniDelMese(piano.mese).map((g) => g.data).filter((d) => !aperte.includes(d)));
  const vietate = [...PAROLE_SEMPRE_VIETATE, ...(piano.parole_vietate ?? [])].map(normale);
  const menu = normale(piano.menu_testo);
  for (const c of voci) {
    const dove = `${fascia}/${c.id}`;
    if (!TIPI.has(c.tipo)) errori.push(`${dove}: tipo sconosciuto «${c.tipo}»`);
    if (!c.data?.startsWith(piano.mese)) errori.push(`${dove}: la data ${c.data} è fuori da ${piano.mese}`);
    if (c.tipo !== 'lavoro' && !(piano.pilastri ?? []).some((p) => p.id === c.pilastro)) errori.push(`${dove}: pilastro «${c.pilastro}» che il piano non ha`);
    const testo = normale(`${c.titolo} ${c.idea} ${c.cta ?? ''}`);
    if (chiusoIl.has(c.data)) {
      if (!OK_A_LOCALE_CHIUSO.has(c.tipo)) errori.push(`${dove}: ${c.tipo} il ${c.data}, giorno di chiusura`);
      else if (/\bstasera\b/.test(testo)) errori.push(`${dove}: dice «stasera» il ${c.data}, giorno di chiusura`);
    }
    for (const p of vietate) if (testo.includes(p)) errori.push(`${dove}: parola vietata dal tono del cliente «${p}»`);
    for (const m of PUBBLICI.has(c.tipo) ? testo.matchAll(/(\d{1,3})(?:,(\d{2}))?\s?€/g) : []) {
      const prezzo = `${m[1]},${m[2] ?? '00'}`;
      if (!menu.includes(prezzo)) errori.push(`${dove}: il prezzo ${prezzo} € non è nel menu del cliente`);
    }
  }
  return { errori, voci, conti };
}

/** Le righe nuove per il Calendario «Social Clienti»: solo social, solo quelle che non ci sono già, stato «idea». */
export function righeCalendario(piano, modello, fascia) {
  return espandi(piano, modello, fascia)
    .filter((c) => (FEED.has(c.tipo) || c.tipo === 'storia') && !c.esiste)
    .map((c) => ({
      // Il suffisso col nome della voce: le righe del Calendario si aggiornano per id, e una riga già
      // pubblicata può avere lo stesso giorno e la stessa ora nell'id (es. quelle spostate al 26/11).
      id: `${piano.cliente}-${c.data.replaceAll('-', '')}-${c.ora.replace(':', '')}-pe-${c.id}`,
      cliente: piano.cliente,
      tipo: c.tipo,
      piattaforme: c.piattaforme.join(','),
      data_ora: `${c.data} ${c.ora}`,
      didascalia: '',
      brief: `${c.titolo}${/[.?!]$/.test(c.titolo) ? '' : '.'} ${c.idea}`,
      stato: 'idea',
      // Lo strato è la fascia più bassa in cui il contenuto compare: serve alla prova (fatto clienti.tropico-premium).
      note: [`piano editoriale ${fascia}`, `strato ${c.fascia}`, c.condizione ? `solo se: ${c.condizione}` : ''].filter(Boolean).join(' · '),
    }));
}

function principale(argv) {
  const arg = (nome) => { const i = argv.indexOf(nome); return i >= 0 ? argv[i + 1] : undefined; };
  const percorso = arg('--piano');
  if (!percorso) { console.error('Manca --piano <file del piano>'); process.exit(2); }
  const modello = leggi(arg('--modello') ?? MODELLO_PREDEFINITO);
  const piano = leggi(percorso);
  const esito = Object.fromEntries(FASCE.map((f) => [f, controlla(piano, modello, f)]));
  const errori = FASCE.flatMap((f) => esito[f].errori);

  if (argv.includes('--righe')) {
    console.log(JSON.stringify(righeCalendario(piano, modello, arg('--righe')), null, 2));
    process.exit(errori.length ? 1 : 0);
  }
  console.log(`Piano editoriale di ${piano.nome}, ${piano.mese} (modello ${modello.versione})`);
  console.log(`Sere di apertura: ${sereAperte(piano).length}`);
  const voci = ['feed', 'reel', 'reel_da_riprese', 'storie', 'google_post', 'google_foto', 'whatsapp', 'email', 'mossa', 'evento', 'creator', 'ads', 'stampa', 'aziende', 'sito', 'schede'];
  console.log(['voce'.padEnd(16), ...FASCE.map((f) => f.padStart(9))].join(''));
  for (const v of voci) console.log([v.padEnd(16), ...FASCE.map((f) => String(esito[f].conti[v]).padStart(9))].join(''));
  const condizionati = esito.premium.voci.filter((c) => c.condizione).length;
  const pronti = esito.premium.voci.filter((c) => c.esiste).length;
  console.log(`Già nel Calendario: ${pronti} · dipendono da un sì del titolare: ${condizionati} (nel Premium)`);
  if (arg('--json')) writeFileSync(arg('--json'), JSON.stringify(Object.fromEntries(FASCE.map((f) => [f, esito[f].voci])), null, 2));
  const iPag = argv.indexOf('--pagina');
  if (iPag >= 0) {
    const [modelloHtml, uscita] = [argv[iPag + 1], argv[iPag + 2]];
    const dati = { modello, piano, fasce: Object.fromEntries(FASCE.map((f) => [f, { voci: esito[f].voci, conti: esito[f].conti }])), sere: sereAperte(piano).length };
    const html = readFileSync(modelloHtml, 'utf8');
    if (!html.includes('/*__DATI__*/null')) { console.error('Nel modello della pagina manca /*__DATI__*/null'); process.exit(2); }
    const nome = String(piano.nome_breve ?? piano.nome).replace(/[<>&"]/g, '');
    // Sostituzione con una funzione: con una stringa, un «$'» o un «$&» dentro i testi del piano verrebbe letto come comando di replace.
    const json = JSON.stringify(dati).replace(/</g, '\\u003c');
    writeFileSync(uscita, html.replace('__NOME__', () => nome).replace('/*__DATI__*/null', () => json));
    console.log(`Pagina scritta: ${uscita}`);
  }
  if (errori.length) { console.log(`\n${errori.length} controlli falliti:`); for (const e of errori) console.log(` - ${e}`); process.exit(1); }
  console.log('Tutti i controlli passano.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) principale(process.argv.slice(2));
