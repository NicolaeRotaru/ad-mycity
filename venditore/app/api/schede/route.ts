// GET /api/schede — chi sono e le mie ultime schede (al massimo 20), per riaprirle.
import { NextResponse } from 'next/server';
import { venditoreDa } from '../../../lib/chi.ts';
import { chiediVenditori } from '../../../lib/n8n.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const email = await venditoreDa(req);
  if (!email) return NextResponse.json({ errore: 'Entra col tuo account.' }, { status: 401 });
  const r = await chiediVenditori('elenco', { email });
  const schede = Array.isArray(r?.corpo?.schede) ? r.corpo.schede : [];
  return NextResponse.json({ email, schede });
}
