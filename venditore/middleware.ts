import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_SESSIONE, leggi } from './lib/sessione.ts';

// Tutto il sito chiede l'account del venditore, tranne la pagina per entrare o iscriversi.
const LIBERE = new Set(['/accesso', '/api/entra', '/api/iscriviti', '/api/esci']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LIBERE.has(pathname)) return NextResponse.next();
  if (await leggi(req.cookies.get(COOKIE_SESSIONE)?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ errore: 'Entra col tuo account.' }, { status: 401 });
  const dove = req.nextUrl.clone();
  dove.pathname = '/accesso';
  dove.search = req.nextUrl.search ? `?torna=${encodeURIComponent(pathname + req.nextUrl.search)}` : '';
  return NextResponse.redirect(dove);
}

export const config = { matcher: ['/((?!_next/|favicon|icon|robots.txt).*)'] };
