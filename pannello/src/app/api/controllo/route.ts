import { NextRequest, NextResponse } from "next/server";
import { getImpostazioni, setImpostazione, memoryConnected } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Kill-switch & budget AI: legge/scrive flag in tabella `impostazioni`.
// Chiavi usate: "pausa" (on/off), "tetto_spesa" (€), "spesa_attuale" (€, opzionale).
export async function GET() {
  const { tabella, valori } = await getImpostazioni();
  return NextResponse.json({
    collegato: memoryConnected() && tabella,
    pausa: valori["pausa"] === "on",
    tetto_spesa: valori["tetto_spesa"] ?? "",
    spesa_attuale: valori["spesa_attuale"] ?? "",
  });
}

export async function POST(req: NextRequest) {
  try {
    const { chiave, valore } = await req.json();
    if (!chiave) return NextResponse.json({ ok: false, error: "Manca la chiave." }, { status: 400 });
    const ok = await setImpostazione(String(chiave), String(valore ?? ""));
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Memoria non collegata o tabella 'impostazioni' mancante." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
