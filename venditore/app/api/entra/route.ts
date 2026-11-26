// POST /api/entra { email, password } — il venditore entra col suo account.
// Otto errori di fila bloccano l'account per 15 minuti. Il messaggio non dice se l'email esiste.

import { NextResponse } from 'next/server';
import { verifica } from '../../../lib/password.ts';
import { dopoLaProva, emailValida, normaleEmail, puoProvare, type Riga } from '../../../lib/venditori.ts';
import { chiediVenditori, adCollegato } from '../../../lib/n8n.ts';
import { cookieSessione } from '../../../lib/chi.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SBAGLIATE = 'Email o password sbagliate.';
const piano = () => new Promise((r) => setTimeout(r, 600));

export async function POST(req: Request) {
  if (!adCollegato()) return NextResponse.json({ errore: 'Il sito non è ancora acceso: su Vercel manca il segreto.' }, { status: 503 });
  let b: Record<string, unknown> = {};
  try { b = (await req.json()) ?? {}; } catch { /* vuoto */ }
  const email = normaleEmail(b.email);
  const password = typeof b.password === 'string' ? b.password : '';
  if (!emailValida(email) || !password || password.length > 200) { await piano(); return NextResponse.json({ errore: SBAGLIATE }, { status: 401 }); }
  const r = await chiediVenditori('leggi', { email });
  if (!r) return NextResponse.json({ errore: 'Il servizio degli account non risponde. Riprova fra un minuto.' }, { status: 502 });
  const riga = (r.corpo ?? { trovato: false }) as Riga;
  const prova = puoProvare(riga);
  if (!prova.ok) {
    await piano();
    if (prova.motivo === 'sospeso') return NextResponse.json({ errore: 'Account sospeso o da rifare: chiedi a Nicola.' }, { status: 403 });
    if (prova.motivo === 'bloccato') return NextResponse.json({ errore: `Troppi tentativi sbagliati: riprova fra ${prova.minuti} minuti.` }, { status: 429 });
    return NextResponse.json({ errore: SBAGLIATE }, { status: 401 });
  }
  const giusta = await verifica(password, riga.hash ?? '');
  await chiediVenditori('segna', { email, ...dopoLaProva(riga, giusta) });
  if (!giusta) { await piano(); return NextResponse.json({ errore: SBAGLIATE }, { status: 401 }); }
  const cookie = await cookieSessione(email);
  const risposta = NextResponse.json({ ok: true, email });
  if (cookie) risposta.headers.append('set-cookie', cookie);
  return risposta;
}
