import { NextResponse } from 'next/server';
import { cookieSessione } from '../../../lib/chi.ts';

export const runtime = 'nodejs';

export async function POST() {
  const r = NextResponse.json({ ok: true });
  r.headers.append('set-cookie', (await cookieSessione(null)) as string);
  return r;
}
