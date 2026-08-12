import { NextRequest, NextResponse } from "next/server";
import { getRigheNome, memoryConnected } from "@/lib/store";
import { nomeLavoro } from "@/lib/nome-lavoro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * I NOMI delle caselle, per la lista dei Lavori.
 *
 * Perché una rotta a parte e non un campo in più nel poll: il nome si ricava dalla `richiesta`,
 * che nel poll non c'è perché pesa (9,8 KB di media sulle chat, e il poll gira ogni 8 secondi).
 * Qui la richiesta si legge una volta sola, per le righe che il Pannello sta mostrando, e quel che
 * torna al browser sono poche decine di caratteri per casella — il nome e basta.
 *
 * POST { ids: string[] } → { ok, nomi: { [id]: nome } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids.map(String) : [];
    if (!memoryConnected()) {
      return NextResponse.json({ ok: false, memoria: false, nomi: {} }, { status: 503 });
    }
    const { letto, righe } = await getRigheNome(ids);
    // Lettura fallita ≠ nessun nome. Se rispondessi «ok, nessun nome» il Pannello ci crederebbe e
    // non li chiederebbe più: le caselle resterebbero senza nome fino al prossimo caricamento.
    if (!letto) {
      return NextResponse.json({ ok: false, letto: false, nomi: {} }, { status: 502 });
    }
    const nomi: Record<string, string> = {};
    for (const r of righe) nomi[r.id] = nomeLavoro(r);
    return NextResponse.json({ ok: true, letto: true, nomi });
  } catch (e: any) {
    return NextResponse.json({ ok: false, nomi: {}, error: e.message }, { status: 500 });
  }
}
