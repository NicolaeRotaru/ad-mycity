import { NextResponse } from 'next/server';
import { COOKIE, impronta, uguali } from '../../../lib/accesso.ts';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const codice = process.env.CODICE_ACCESSO || '';
  if (codice.length < 6) return NextResponse.json({ errore: 'Il sito non è ancora acceso: su Vercel manca il codice dei venditori.' }, { status: 503 });
  let dato = '';
  try { dato = String((await req.json())?.codice ?? '').trim(); } catch { /* vuoto */ }
  if (!dato || !uguali(await impronta(dato), await impronta(codice))) {
    await new Promise((r) => setTimeout(r, 700)); // frena chi prova i codici a caso
    return NextResponse.json({ errore: 'Codice sbagliato.' }, { status: 401 });
  }
  const r = NextResponse.json({ ok: true });
  r.cookies.set(COOKIE, await impronta(codice), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 60 });
  return r;
}
