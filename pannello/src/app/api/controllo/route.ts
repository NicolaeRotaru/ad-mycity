import { NextRequest, NextResponse } from "next/server";
import { getImpostazioni, setImpostazione, memoryConnected } from "@/lib/store";
import { scrivibileDaControllo } from "@/lib/chiavi-scrivibili";

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
    // AR-333 — questa rotta nasce per due interruttori e il commento sopra li nomina, ma il codice
    // scriveva QUALUNQUE chiave: compresa `azione:<id>:firma`, cioè la firma con cui Nicola autorizza
    // un invio reale. Il lotto 25 ha chiuso lo stesso confine dal lato del cervello; questa era la
    // porta di servizio che lo scavalcava dal lato del Pannello.
    const permesso = scrivibileDaControllo(chiave);
    if (!permesso.ok) return NextResponse.json({ ok: false, error: permesso.motivo }, { status: 400 });
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
