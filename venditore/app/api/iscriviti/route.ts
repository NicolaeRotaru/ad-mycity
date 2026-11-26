// POST /api/iscriviti { email, password, codice } — il venditore crea il suo account.
// Serve il codice d'invito di Nicola. La password diventa un'impronta scrypt qui; a n8n arriva solo quella.

import { NextResponse } from 'next/server';
import { impronta, passwordValida, PASSWORD_MIN } from '../../../lib/password.ts';
import { emailValida, invitoGiusto, normaleEmail } from '../../../lib/venditori.ts';
import { chiediVenditori, adCollegato } from '../../../lib/n8n.ts';
import { cookieSessione } from '../../../lib/chi.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const piano = () => new Promise((r) => setTimeout(r, 600));

export async function POST(req: Request) {
  if (!adCollegato() || String(process.env.CODICE_INVITO || '').trim().length < 6) {
    return NextResponse.json({ errore: 'Il sito non è ancora acceso: su Vercel mancano il segreto o il codice d’invito.' }, { status: 503 });
  }
  let b: Record<string, unknown> = {};
  try { b = (await req.json()) ?? {}; } catch { /* vuoto */ }
  const email = normaleEmail(b.email);
  if (!emailValida(email)) return NextResponse.json({ errore: 'Scrivi un’email valida.' }, { status: 400 });
  if (!passwordValida(b.password)) return NextResponse.json({ errore: `La password deve avere almeno ${PASSWORD_MIN} caratteri.` }, { status: 400 });
  if (!invitoGiusto(b.codice)) { await piano(); return NextResponse.json({ errore: 'Il codice d’invito non è giusto. Te lo dà Nicola.' }, { status: 403 }); }
  const r = await chiediVenditori('iscrivi', { email, hash: await impronta(b.password) });
  if (!r) return NextResponse.json({ errore: 'Il servizio degli account non risponde. Riprova fra un minuto.' }, { status: 502 });
  if (r.codice === 409) return NextResponse.json({ errore: 'Questa email è già iscritta: entra con la tua password.' }, { status: 409 });
  if (r.corpo?.ok !== true) return NextResponse.json({ errore: 'Iscrizione non riuscita. Riprova.' }, { status: 502 });
  const cookie = await cookieSessione(email);
  const risposta = NextResponse.json({ ok: true, email });
  if (cookie) risposta.headers.append('set-cookie', cookie);
  return risposta;
}
