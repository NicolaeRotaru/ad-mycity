import { NextRequest, NextResponse } from "next/server";
import { decisioniDaImpostazioni } from "@/lib/scelta-ab";
import { leggiDecisioneScelta, registraSceltaAB } from "@/lib/scelta-ab-actions";
import { getImpostazioni, memoryConnected } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  if (!memoryConnected()) return NextResponse.json({ collegato: false, decisione: null, decisioni: {} });
  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    return NextResponse.json({ collegato: true, decisione: await leggiDecisioneScelta(id) });
  }
  const { valori } = await getImpostazioni();
  return NextResponse.json({ collegato: true, decisioni: decisioniDaImpostazioni(valori) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scelta = String(body?.scelta || "").trim().toUpperCase();
    const result = await registraSceltaAB({
      scelta: scelta as "A" | "B",
      titolo: body?.titolo,
      motivo: body?.motivo,
      tipo: body?.tipo,
      id: body?.id,
      scelta_id: body?.scelta_id,
      opzione_a: body?.opzione_a,
      opzione_b: body?.opzione_b,
      contesto: body?.contesto,
      istruzioni: body?.istruzioni,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, decisione: result.decisione, giaRegistrata: result.giaRegistrata });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Errore";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
