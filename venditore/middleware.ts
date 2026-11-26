import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, accessoValido } from './lib/accesso.ts';

// Tutto il sito chiede il codice del venditore, tranne la pagina per inserirlo.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/accesso' || pathname === '/api/accesso') return NextResponse.next();
  if (await accessoValido(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ errore: 'Serve il codice del venditore.' }, { status: 401 });
  const dove = req.nextUrl.clone();
  dove.pathname = '/accesso';
  dove.search = req.nextUrl.search ? `?torna=${encodeURIComponent(pathname + req.nextUrl.search)}` : '';
  return NextResponse.redirect(dove);
}

export const config = { matcher: ['/((?!_next/|favicon|icon|robots.txt).*)'] };
