import { NextRequest, NextResponse } from "next/server";
import { getLavoroById, memoryConnected } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Dettaglio completo di un lavoro (richiesta + risultato) — on-demand, non nel poll lista. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id?.trim()) return NextResponse.json({ ok: false, error: "id mancante" }, { status: 400 });
    if (!memoryConnected()) {
      return NextResponse.json({ ok: false, memoria: false, error: "Memoria non collegata." }, { status: 503 });
    }
    const lavoro = await getLavoroById(id.trim());
    if (!lavoro) return NextResponse.json({ ok: false, error: "Lavoro non trovato." }, { status: 404 });
    return NextResponse.json({ ok: true, lavoro });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
