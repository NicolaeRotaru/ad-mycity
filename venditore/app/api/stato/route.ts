// GET /api/stato?lavoro=<uuid> — a che punto è l'AD. Ognuno vede solo le sue schede.
// Quando l'AD ha finito, unisce la sua risposta (ripulita) alla prima scheda; se l'AD ha trovato un sito che
// il programma non conosceva, lo misura adesso.

import { NextResponse } from 'next/server';
import { leggiLavoro } from '../../../lib/n8n.ts';
import { pulisci, unisci, fontiDi, normalizza } from '../../../lib/scheda.ts';
import { misuraSito, NON_E_UN_SITO } from '../../../lib/sito.ts';
import { venditoreDa } from '../../../lib/chi.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 20;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const venditore = await venditoreDa(req);
  if (!venditore) return NextResponse.json({ errore: 'Entra col tuo account.' }, { status: 401 });
  const lavoro = new URL(req.url).searchParams.get('lavoro') ?? '';
  if (!UUID.test(lavoro)) return NextResponse.json({ stato: 'sconosciuto', errore: 'Codice del lavoro non valido.' }, { status: 400 });
  const r = await leggiLavoro(lavoro);
  if (r.stato === 'sconosciuto') return NextResponse.json({ stato: 'sconosciuto', errore: r.errore ?? 'lavoro non trovato' }, { status: 404 });
  if (r.venditore !== venditore) return NextResponse.json({ stato: 'sconosciuto', errore: 'Questa scheda non è tua.' }, { status: 404 });
  const prima = normalizza(r.prima);
  if (!prima) return NextResponse.json({ stato: 'errore', errore: 'La prima scheda di questo lavoro non si legge.' }, { status: 500 });
  if (r.stato === 'in_corso') return NextResponse.json({ stato: 'in_corso', scheda: prima });
  if (r.stato === 'errore') return NextResponse.json({ stato: 'errore', errore: r.errore || 'l’AD non ha potuto fare il lavoro', scheda: prima });
  const ad = pulisci(r.risultato);
  const scheda = unisci(prima, ad, r.avvisi ?? []);
  if (r.secondi) scheda.avvisi.unshift(`L’AD ha risposto in ${r.secondi} secondi.`);
  // Il sito trovato dall'AD, misurato dal programma (se la prima scheda non l'aveva).
  if (!prima.sito.misura?.aperto && ad.sito?.url && !NON_E_UN_SITO.test(ad.sito.url)) {
    const m = await misuraSito(ad.sito.url);
    if (m.aperto) {
      scheda.sito.misura = m;
      scheda.campi.push({ voce: 'Misura del sito', valore: `${m.pagine} ${m.pagine === 1 ? 'pagina' : 'pagine'} collegate dalla home · ${m.https === false ? 'non protetto (solo http)' : 'protetto (https)'} · ${m.telefonino ? 'pensato per il telefono' : 'non pensato per il telefono'}${m.piattaforma ? ` · fatto con ${m.piattaforma}` : ''}${m.funzioni.length ? ` · ${m.funzioni.join(', ')}` : ''}`, stato: 'confermato', fonte: m.url });
      scheda.fonti = fontiDi(scheda);
    }
  }
  return NextResponse.json({ stato: 'pronta', scheda });
}
