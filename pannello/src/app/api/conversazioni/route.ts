import { NextRequest, NextResponse } from "next/server";
import {
  getConversazioni,
  upsertConversazione,
  deleteConversazione,
  clearConversazioni,
  memoryConnected,
} from "@/lib/store";

export const runtime = "nodejs";

// GET: elenco conversazioni. tabella:false => la dashboard usa il salvataggio
// locale (su questo dispositivo), finche' la tabella non viene creata.
export async function GET() {
  const { tabella, righe } = await getConversazioni();
  return NextResponse.json({ memoria: memoryConnected(), tabella, conversazioni: righe });
}

// POST: crea o aggiorna una conversazione { id?, titolo, messaggi } -> { ok, id }.
export async function POST(req: NextRequest) {
  try {
    const { id, titolo, messaggi } = await req.json();
    const nuovoId = await upsertConversazione({
      id: id || null,
      titolo: String(titolo || "Conversazione"),
      messaggi: messaggi ?? [],
    });
    return NextResponse.json({ ok: Boolean(nuovoId), id: nuovoId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// DELETE: { id } per eliminarne una, oppure { tutte: true } per svuotare.
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.tutte) await clearConversazioni();
    else if (body?.id) await deleteConversazione(String(body.id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
