// POST /api/analizza { testo } — il pulsante «Analizza».
// In 2-6 secondi: legge il link, chiede a OpenStreetMap, misura il sito se è noto, compone la prima scheda e
// manda il lavoro all'AD (n8n → «Chiedi all'AD»). Risponde con la prima scheda e il codice del lavoro.

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { risolviLink, cittaDa } from '../../../lib/link.ts';
import { cercaOsm } from '../../../lib/osm.ts';
import { misuraSito, indovinaSito, NON_E_UN_SITO } from '../../../lib/sito.ts';
import { primaScheda } from '../../../lib/scheda.ts';
import { COMPITO, SCHEMA, FLUSSO, datiPerAd } from '../../../lib/compito.ts';
import { avviaLavoro, chiediVenditori } from '../../../lib/n8n.ts';
import { venditoreDa } from '../../../lib/chi.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const adesso = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { giorno: `${p.year}-${p.month}-${p.day}`, data: `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}` };
};

export async function POST(req: Request) {
  const inizio = Date.now();
  const venditore = await venditoreDa(req);
  if (!venditore) return NextResponse.json({ errore: 'Entra col tuo account.' }, { status: 401 });
  let testo = '';
  try { testo = String((await req.json())?.testo ?? ''); } catch { /* vuoto */ }
  // L'account sospeso da Nicola non fa partire l'AD: lo si controlla mentre si legge il link.
  const [letto, account] = await Promise.all([risolviLink(testo), chiediVenditori('leggi', { email: venditore })]);
  const stato = account?.corpo?.trovato ? String(account.corpo.stato || 'attivo') : 'sconosciuto';
  if (stato !== 'attivo') return NextResponse.json({ errore: stato === 'sconosciuto' ? 'Non riesco a controllare il tuo account: riprova fra un minuto.' : 'Il tuo account è sospeso: chiedi a Nicola.' }, { status: 403 });
  if (letto.errore && !letto.nome && letto.lat === null) return NextResponse.json({ errore: letto.errore }, { status: 422 });
  const citta = cittaDa(letto.indirizzo);
  // La mappa libera e la ricerca del sito (gli indirizzi più probabili) partono insieme: 3-4 secondi in tutto.
  const [osm, indovinato] = await Promise.all([
    cercaOsm({ lat: letto.lat, lon: letto.lon, nome: letto.nome, citta, attesaMs: 3500 }),
    indovinaSito(letto.nome, citta),
  ]);
  const sitoNoto = osm.luogo?.sito && !NON_E_UN_SITO.test(osm.luogo.sito) ? osm.luogo.sito : null;
  let misura = sitoNoto ? await misuraSito(sitoNoto) : null;
  if (!misura?.aperto && indovinato) misura = indovinato;
  else if (!misura?.aperto && !letto.nome && osm.luogo?.nome) misura = (await indovinaSito(osm.luogo.nome, citta)) ?? misura;
  const { giorno, data } = adesso();
  const prima = primaScheda({ letto, osm, misura, citta, data });
  if (letto.errore) prima.avvisi.push(letto.errore);
  const lavoro = randomUUID();
  const job = { flusso: FLUSSO, compito: COMPITO, schema: SCHEMA, dati: datiPerAd({ prima, osm, misura, giorno }) };
  const partito = await avviaLavoro(lavoro, venditore, prima.nome, prima, job);
  if (!partito.ok) prima.avvisi.push(`L’AD non è partito: ${partito.errore}. Hai solo la prima scheda; riprova fra poco.`);
  return NextResponse.json({ lavoro: partito.ok ? lavoro : null, scheda: prima, ms: Date.now() - inizio });
}
