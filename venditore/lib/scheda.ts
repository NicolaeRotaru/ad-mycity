// LA SCHEDA DEL CLIENTE — la stessa forma della scheda che scrive cervello/scheda-cliente.mjs
// (consegne/clienti/<cartella>/scheda.html), costruita in due tempi:
//   1. la PRIMA SCHEDA, in 2-4 secondi, dal programma: link, OpenStreetMap, misura del sito, le parti fisse;
//   2. la SCHEDA INTERA, quando l'AD ha cercato e giudicato (routine «Chiedi all'AD», piano Max).
// La risposta dell'AD passa sempre da `pulisci`: quello che non rispetta le regole si scarta e si dice.

import { CONDIZIONI, PAGAMENTO, eFascia, type IdFascia } from './fasce.ts';
import type { LettoDalLink } from './link.ts';
import type { DatiOsm } from './osm.ts';
import type { MisuraSito, LivelloSito } from './sito.ts';

export type Stato = 'confermato' | 'da_confermare' | 'frammento' | 'non_trovato';
export const STATI: Record<Stato, string> = { confermato: 'Confermato', da_confermare: 'Da confermare', frammento: 'Solo un indizio', non_trovato: 'Non trovato' };
const FORZA: Record<Stato, number> = { confermato: 3, da_confermare: 2, frammento: 1, non_trovato: 0 };

export type Campo = { voce: string; valore: string | null; stato: Stato; fonte: string | null };
export type Social = { canale: string; stato: 'trovato' | 'non_trovato'; livello: string | null; giudizio: string | null; fonte: string | null };
export type Concorrente = { nome: string; tipo: string | null; distanza: number; fonte: string };

export type Scheda = {
  nome: string;
  tipo: string | null;
  citta: string;
  indirizzo: string | null;
  data: string;
  linkMaps: string | null;
  consigliato: IdFascia | null;
  perche_consigliato: string | null;
  in_30_secondi: string[];
  gancio: string | null;
  campi: Campo[];
  ha: string[];
  non_ha: string[];
  migliorare: string[];
  reputazione: { sintesi: string | null; positivi: string[]; negativi: string[] };
  sito: { livello: LivelloSito | 'non visto'; giudizio: string | null; fonte: string | null; misura: MisuraSito | null; daChi: 'AD' | 'programma' | null };
  social: Social[];
  concorrenti: Concorrente[];
  concorrentiContati: number;
  potenziale: string[];
  offerta: { servizio: string; perche: string }[];
  domande: string[];
  obiezioni: { obiezione: string; risposta: string }[];
  attenzione: string[];
  fonti: { titolo: string; url: string }[];
  avvisi: string[];
  completa: boolean;
};

// ———————————————————————————————— attrezzi

export const httpsValido = (u: unknown): u is string => typeof u === 'string' && u.length <= 600 && /^https:\/\/[^\s"'<>]+$/.test(u);
const frase = (v: unknown, max = 400): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.replace(/\s+/g, ' ').trim();
  return t ? (t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t) : null;
};
const elenco = (v: unknown, max: number, lung = 320): string[] =>
  (Array.isArray(v) ? v : []).map((x) => frase(x, lung)).filter((x): x is string => !!x).slice(0, max);
const dominio = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

/** Le frasi che rompono un paletto: si scartano prima di arrivare al venditore. */
export const NESSUNA_PERCENTUALE = /nessuna\s+(percentuale|commissione)|senza\s+(percentual|commission)|zero\s+commission|non\s+(prendiamo|c'è|ce)\s+(nessuna|alcuna)\s+(percentuale|commissione)|niente\s+percentual/i;
export const GIOCO_TABACCO = /\b(sisal|scommess\w*|gratta\s*e\s*vinci|superenalotto|lotto|slot|tabacc\w*|sigarett\w*|svap\w*|e-?cig\w*)\b/i;

// ———————————————————————————————— le parti fisse (valgono per tutti, scritte dalle regole firmate)

export const OBIEZIONI_FISSE: { chiave: RegExp; obiezione: string; risposta: string }[] = [
  { chiave: /percentual|10\s*%|commission/i, obiezione: 'Poi mi prendete una percentuale.', risposta: 'Su quello che vendete al banco, niente. Sui prodotti venduti tramite MyCity c’è il 10%, anche con l’abbonamento: paga la consegna e il servizio.' },
  { chiave: /cost|prezz|car[oi]|tant[io]\s+soldi|euro|spes/i, obiezione: 'Costa troppo.', risposta: 'Il primo mese costa la metà e non c’è vincolo: si disdice con 30 giorni di preavviso. Si può partire dal Base a 300 euro al mese e salire quando si vede il risultato.' },
  { chiave: /tempo|social.*(non|mai)|non so usare/i, obiezione: 'Non ho tempo per i social.', risposta: 'Non serve: foto e testi li prepariamo noi, voi approvate l’anteprima su WhatsApp. Nessuna app nuova da imparare.' },
];

export const ATTENZIONE_FISSE = [
  'Il 10% sui prodotti venduti tramite MyCity resta anche con l’abbonamento: dillo subito, mai «nessuna percentuale». Sulle vendite al banco non si prende niente.',
  'Questa scheda è solo per te: non mostrarla e non mandarla al titolare.',
];

// ———————————————————————————————— 1. la prima scheda, dal programma

export function primaScheda({ letto, osm, misura, citta, data }: { letto: LettoDalLink; osm: DatiOsm | null; misura: MisuraSito | null; citta: string; data: string }): Scheda {
  const nome = letto.nome || osm?.luogo?.nome || 'Attività senza nome';
  const campi: Campo[] = [];
  const linkMaps = httpsValido(letto.link) ? letto.link : null;
  campi.push({ voce: 'Nome', valore: nome, stato: letto.nome ? 'da_confermare' : osm?.luogo ? 'da_confermare' : 'frammento', fonte: letto.nome ? linkMaps : osm?.luogo?.fonte ?? null });
  const indirizzo = letto.indirizzo || osm?.indirizzo?.testo || null;
  if (letto.indirizzo) campi.push({ voce: 'Indirizzo', valore: letto.indirizzo, stato: 'da_confermare', fonte: linkMaps });
  else if (osm?.indirizzo) campi.push({ voce: 'Indirizzo', valore: osm.indirizzo.testo, stato: 'da_confermare', fonte: osm.indirizzo.fonte });
  const l = osm?.luogo;
  if (l?.tipo) campi.push({ voce: 'Tipo (sulla mappa libera)', valore: l.tipo, stato: 'da_confermare', fonte: l.fonte });
  if (l?.telefono) campi.push({ voce: 'Telefono dell’attività', valore: l.telefono, stato: 'da_confermare', fonte: l.fonte });
  if (l?.orari) campi.push({ voce: 'Orari (sulla mappa libera)', valore: l.orari, stato: 'frammento', fonte: l.fonte });
  const social: Social[] = [];
  if (misura?.aperto) {
    const fatti = [`${misura.pagine} ${misura.pagine === 1 ? 'pagina' : 'pagine'} collegate dalla home`, misura.https === false ? 'non protetto (solo http)' : misura.https ? 'protetto (https)' : null,
      misura.telefonino ? 'pensato per il telefono' : 'non pensato per il telefono', misura.piattaforma ? `fatto con ${misura.piattaforma}` : null,
      misura.anno ? `anno in fondo alla pagina: ${misura.anno}` : null].filter(Boolean).join(' · ');
    campi.push({ voce: 'Sito', valore: `${dominio(misura.url)} — ${fatti}`, stato: 'confermato', fonte: httpsValido(misura.url) ? misura.url : null });
    if (misura.funzioni.length) campi.push({ voce: 'Sul sito si trova', valore: misura.funzioni.join(', '), stato: 'confermato', fonte: httpsValido(misura.url) ? misura.url : null });
    if (misura.titolo) campi.push({ voce: 'Titolo del sito su Google', valore: `«${misura.titolo}»`, stato: 'confermato', fonte: httpsValido(misura.url) ? misura.url : null });
  } else if (l?.sito) {
    campi.push({ voce: 'Sito', valore: `${l.sito} (scritto sulla mappa libera; non si apre da qui${misura?.errore ? `: ${misura.errore}` : ''})`, stato: 'frammento', fonte: l.fonte });
  }
  // I profili: prima quelli collegati dal sito stesso (confermati), poi quelli della mappa libera.
  const profilo = (canale: string, daSito?: string, daOsm?: string | null) => {
    if (daSito && misura && httpsValido(misura.url)) social.push({ canale, stato: 'trovato', livello: 'da vedere', giudizio: 'Il sito dell’attività porta a questo profilo. Ritmo e video li guarda l’AD.', fonte: daSito });
    else if (daOsm && httpsValido(daOsm)) social.push({ canale, stato: 'trovato', livello: 'da vedere', giudizio: 'Profilo scritto sulla mappa libera: da controllare.', fonte: daOsm });
  };
  profilo('Instagram', misura?.social.instagram, l?.instagram);
  profilo('Facebook', misura?.social.facebook, l?.facebook);
  profilo('TikTok', misura?.social.tiktok, null);
  social.push({ canale: 'Scheda Google Maps', stato: 'trovato', livello: 'da vedere',
    giudizio: 'C’è: è il link che hai incollato. Voto, numero di recensioni, foto e orari guardali dal telefono prima di entrare.', fonte: linkMaps });
  const tipo = l?.tipo ?? null;
  const gioco = GIOCO_TABACCO.test(`${tipo ?? ''} ${nome}`);
  return {
    nome, tipo, citta, indirizzo, data, linkMaps,
    consigliato: null, perche_consigliato: null, in_30_secondi: [], gancio: null,
    campi, ha: [], non_ha: [], migliorare: [],
    reputazione: { sintesi: null, positivi: [], negativi: [] },
    sito: misura?.aperto
      ? { livello: misura.stima, giudizio: null, fonte: httpsValido(misura.url) ? misura.url : null, misura, daChi: 'programma' }
      : { livello: 'non visto', giudizio: null, fonte: null, misura, daChi: null },
    social,
    concorrenti: osm?.concorrenti ?? [], concorrentiContati: osm?.concorrentiContati ?? 0,
    potenziale: [], offerta: [], domande: [],
    obiezioni: OBIEZIONI_FISSE.map(({ obiezione, risposta }) => ({ obiezione, risposta })),
    attenzione: [...ATTENZIONE_FISSE, ...(gioco ? ['Niente gioco (Sisal, scommesse, gratta e vinci) né tabacco nei contenuti proposti: in Italia la pubblicità è vietata.'] : [])],
    fonti: [], avvisi: [...(osm?.avvisi ?? [])],
    completa: false,
  };
}

// ———————————————————————————————— 2. la risposta dell'AD, ripulita

const STATI_AMMESSI = new Set<Stato>(['confermato', 'da_confermare', 'frammento', 'non_trovato']);
const LIVELLI_SITO = new Set(['nessuno', 'semplice', 'medio', 'pregio']);
const CANALI = new Set(['Instagram', 'Facebook', 'TikTok']);

export type RispostaPulita = Partial<Omit<Scheda, 'sito'>> & { sito?: { livello?: LivelloSito; giudizio?: string | null; fonte?: string | null; url?: string | null }; scartati: string[] };

export function pulisci(grezza: unknown): RispostaPulita {
  const r = (grezza && typeof grezza === 'object' ? grezza : {}) as Record<string, unknown>;
  const scartati: string[] = [];
  const senzaPaletti = (xs: string[], dove: string, vietaGioco = false) => xs.filter((x) => {
    if (NESSUNA_PERCENTUALE.test(x)) { scartati.push(`${dove}: una frase diceva «nessuna percentuale», ma il 10% resta`); return false; }
    if (vietaGioco && GIOCO_TABACCO.test(x)) { scartati.push(`${dove}: una proposta parlava di gioco o tabacco, che non si pubblicizzano`); return false; }
    return true;
  });
  const campi: Campo[] = [];
  for (const c of Array.isArray(r.campi) ? r.campi.slice(0, 16) : []) {
    const x = (c ?? {}) as Record<string, unknown>;
    const voce = frase(x.voce, 60);
    const stato = STATI_AMMESSI.has(x.stato as Stato) ? (x.stato as Stato) : null;
    if (!voce || !stato) { scartati.push(`un dato senza voce o con uno stato non ammesso («${String(x.stato ?? '')}»)`); continue; }
    if (stato === 'non_trovato') { campi.push({ voce, valore: null, stato, fonte: null }); continue; }
    if (!httpsValido(x.fonte)) { scartati.push(`«${voce}»: dato senza una fonte https`); continue; }
    const valore = frase(x.valore, 300);
    if (!valore) { scartati.push(`«${voce}»: dato vuoto`); continue; }
    campi.push({ voce, valore, stato, fonte: x.fonte });
  }
  const social: Social[] = [];
  for (const s of Array.isArray(r.social) ? r.social.slice(0, 6) : []) {
    const x = (s ?? {}) as Record<string, unknown>;
    const canale = frase(x.canale, 30);
    if (!canale || !CANALI.has(canale)) continue; // la scheda Google la scrive il programma
    const trovato = x.stato === 'trovato';
    if (trovato && !httpsValido(x.fonte)) { scartati.push(`${canale}: profilo senza una fonte https`); continue; }
    const extra = [typeof x.post_al_mese === 'number' && x.post_al_mese >= 0 ? `circa ${Math.round(x.post_al_mese)} post al mese` : null,
      x.video === true ? 'con video' : x.video === false ? 'senza video' : null].filter(Boolean).join(', ');
    const giudizio = [frase(x.giudizio, 280), extra ? `(${extra})` : null].filter(Boolean).join(' ') || null;
    social.push({ canale, stato: trovato ? 'trovato' : 'non_trovato', livello: frase(x.livello, 30), giudizio, fonte: trovato ? (x.fonte as string) : null });
  }
  const sitoR = (r.sito && typeof r.sito === 'object' ? r.sito : {}) as Record<string, unknown>;
  const sito = {
    livello: LIVELLI_SITO.has(String(sitoR.livello)) ? (sitoR.livello as LivelloSito) : undefined,
    giudizio: frase(sitoR.giudizio, 400),
    fonte: httpsValido(sitoR.fonte) ? sitoR.fonte : null,
    url: httpsValido(sitoR.url) ? sitoR.url : null,
  };
  const rep = (r.reputazione && typeof r.reputazione === 'object' ? r.reputazione : {}) as Record<string, unknown>;
  let consigliato: IdFascia | null = eFascia(r.consigliato) ? r.consigliato : null;
  if (r.consigliato != null && !consigliato) scartati.push(`abbonamento consigliato sconosciuto («${String(r.consigliato)}»)`);
  const offerta = (Array.isArray(r.offerta) ? r.offerta.slice(0, 5) : [])
    .map((o) => { const x = (o ?? {}) as Record<string, unknown>; return { servizio: frase(x.servizio, 60), perche: frase(x.perche, 320) }; })
    .filter((o): o is { servizio: string; perche: string } => !!o.servizio && !!o.perche)
    .filter((o) => senzaPaletti([`${o.servizio} ${o.perche}`], 'offerta', true).length === 1);
  const obiezioni = (Array.isArray(r.obiezioni) ? r.obiezioni.slice(0, 4) : [])
    .map((o) => { const x = (o ?? {}) as Record<string, unknown>; return { obiezione: frase(x.obiezione, 160), risposta: frase(x.risposta, 360) }; })
    .filter((o): o is { obiezione: string; risposta: string } => !!o.obiezione && !!o.risposta)
    .filter((o) => senzaPaletti([o.risposta], 'obiezioni').length === 1);
  let gancio = frase(r.gancio, 360);
  if (gancio && (NESSUNA_PERCENTUALE.test(gancio) || GIOCO_TABACCO.test(gancio))) { scartati.push('il gancio rompeva un paletto'); gancio = null; }
  let perche = frase(r.perche_consigliato, 600);
  if (perche && NESSUNA_PERCENTUALE.test(perche)) { scartati.push('il perché dell’abbonamento diceva «nessuna percentuale»'); perche = null; }
  if (!consigliato) perche = perche ?? null;
  return {
    tipo: frase(r.tipo, 120) ?? undefined,
    consigliato, perche_consigliato: perche,
    in_30_secondi: senzaPaletti(elenco(r.in_30_secondi, 5), 'in 30 secondi'),
    gancio, campi, social,
    ha: senzaPaletti(elenco(r.ha, 6), 'ha'),
    non_ha: senzaPaletti(elenco(r.non_ha, 6), 'non ha'),
    migliorare: senzaPaletti(elenco(r.migliorare, 5), 'da migliorare'),
    reputazione: { sintesi: frase(rep.sintesi, 500), positivi: elenco(rep.positivi, 4), negativi: elenco(rep.negativi, 4) },
    sito,
    potenziale: senzaPaletti(elenco(r.potenziale, 5), 'potenziale', true),
    offerta, obiezioni,
    domande: elenco(r.domande, 7),
    attenzione: senzaPaletti(elenco(r.attenzione, 5), 'attenzione'),
    scartati,
  };
}

// ———————————————————————————————— 3. l'unione: la prima scheda più la risposta dell'AD

export function unisci(prima: Scheda, adGrezzo: RispostaPulita, avvisiAd: string[] = []): Scheda {
  const s: Scheda = structuredClone(prima);
  let ad = adGrezzo;
  if (ad.tipo) s.tipo = ad.tipo;
  s.consigliato = ad.consigliato ?? null;
  s.perche_consigliato = ad.perche_consigliato ?? null;
  s.in_30_secondi = ad.in_30_secondi ?? [];
  s.gancio = ad.gancio ?? null;
  // I dati: quelli del programma restano; un dato dell'AD con la stessa voce vince solo se è più sicuro.
  const chiave = (v: string) => v.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-zà-ú]+/g, ' ').trim();
  for (const c of ad.campi ?? []) {
    const i = s.campi.findIndex((x) => chiave(x.voce) === chiave(c.voce));
    if (i < 0) s.campi.push(c);
    else if (FORZA[c.stato] > FORZA[s.campi[i].stato]) s.campi[i] = c;
  }
  // I profili: un profilo trovato dal sito resta; l'AD aggiunge il ritmo e quelli che mancano.
  for (const p of ad.social ?? []) {
    const i = s.social.findIndex((x) => x.canale === p.canale);
    if (i < 0) s.social.splice(Math.max(0, s.social.length - 1), 0, p);
    else if (p.stato === 'trovato') s.social[i] = { ...p, fonte: p.fonte ?? s.social[i].fonte };
    // «non trovato» dall'AD non cancella un profilo che il sito stesso collega.
  }
  // Il programma ha aperto il sito: se l'AD dice che non c'è, ha visto solo gli estratti della ricerca.
  const sitoVisto = !!prima.sito.misura?.aperto;
  if (sitoVisto && ad.sito?.livello === 'nessuno') {
    s.avvisi.push('L’AD non aveva visto il sito che il programma ha aperto: vale la misura del programma.');
    ad = { ...ad, sito: { ...ad.sito, livello: undefined, giudizio: null } };
  }
  const profiliVisti = prima.social.filter((p) => p.stato === 'trovato' && p.canale !== 'Scheda Google Maps').map((p) => p.canale.toLowerCase());
  const nonHa = (ad.non_ha ?? []).filter((x) => {
    if (profiliVisti.length && (/social|profil/i.test(x) || profiliVisti.some((c) => x.toLowerCase().includes(c)))) { s.avvisi.push(`Tolto da «Non ha»: «${x}» (il sito dell’attività collega i suoi profili).`); return false; }
    if (sitoVisto && /\bsito\b/i.test(x) && /(trovat|in rete|nessun|non ha)/i.test(x)) { s.avvisi.push(`Tolto da «Non ha»: «${x}» (il programma ha aperto il sito).`); return false; }
    return true;
  });
  ad = { ...ad, non_ha: nonHa };
  s.ha = ad.ha ?? []; s.non_ha = ad.non_ha ?? []; s.migliorare = ad.migliorare ?? [];
  if (ad.reputazione) s.reputazione = ad.reputazione as Scheda['reputazione'];
  if (ad.sito) {
    if (ad.sito.livello) { s.sito.livello = ad.sito.livello; s.sito.daChi = 'AD'; }
    s.sito.giudizio = ad.sito.giudizio ?? s.sito.giudizio;
    s.sito.fonte = ad.sito.fonte ?? s.sito.fonte;
  }
  if (s.sito.livello === 'non visto' && !ad.sito?.livello) s.sito.livello = 'medio'; // tabella firmata: sito non guardato = medio
  s.potenziale = ad.potenziale ?? [];
  s.offerta = ad.offerta ?? [];
  s.domande = ad.domande ?? [];
  // Le obiezioni: prima quelle su misura dell'AD, poi le fisse che l'AD non ha già coperto.
  const suMisura = ad.obiezioni ?? [];
  s.obiezioni = [...suMisura, ...OBIEZIONI_FISSE.filter((f) => !suMisura.some((o) => f.chiave.test(o.obiezione))).map(({ obiezione, risposta }) => ({ obiezione, risposta }))];
  s.attenzione = [...new Set([...prima.attenzione, ...(ad.attenzione ?? [])])];
  s.avvisi = [...s.avvisi, ...avvisiAd.slice(0, 5).map((a) => `L’AD avvisa: ${frase(a, 240)}`), ...(ad.scartati ?? []).map((x) => `Scartato: ${x}.`)];
  s.fonti = fontiDi(s);
  s.completa = true;
  return s;
}

/** Le fonti in fondo alla scheda: tutte quelle citate, una volta sola. */
export function fontiDi(s: Scheda): { titolo: string; url: string }[] {
  const viste = new Map<string, string>();
  const metti = (url: string | null | undefined, titolo: string) => { if (httpsValido(url) && !viste.has(url)) viste.set(url, titolo); };
  for (const c of s.campi) metti(c.fonte, c.voce);
  for (const p of s.social) metti(p.fonte, p.canale);
  metti(s.sito.fonte, 'Sito');
  for (const c of s.concorrenti) metti(c.fonte, `${c.nome} (concorrente)`);
  return [...viste].map(([url, titolo]) => ({ titolo, url })).slice(0, 30);
}

export { CONDIZIONI, PAGAMENTO };
