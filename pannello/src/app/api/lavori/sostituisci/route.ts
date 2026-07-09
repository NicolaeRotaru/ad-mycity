import { NextRequest, NextResponse } from "next/server";
import { getLavoroById, annullaLavoroSeStato } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ⏩ CHAT MULTIPLA (stile Claude): quando Nicola scrive un nuovo messaggio mentre l'AD sta ancora
// pensando al precedente, il turno vecchio viene chiuso come "sostituito" e il turno nuovo — che
// contiene TUTTA la conversazione, messaggio vecchio incluso — risponde a tutto insieme.
//
// Diversamente da /api/lavori/annulla (che per prudenza rifiuta gli in_corso), qui interrompere un
// lavoro GIÀ in lavorazione è sicuro per costruzione: vale SOLO per tipo=chat, e una chat non tocca
// mai il mondo reale da sola (le azioni vere sono lavori "esegui-azione", che restano intoccabili).
// Il worker se ne accorge durante la generazione (poll dello stato ogni ~1,5s) e ferma Claude.
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const lavoroId = String(id || "").trim();
    if (!lavoroId) return NextResponse.json({ ok: false, error: "Manca l'id del lavoro." }, { status: 400 });

    const lv = await getLavoroById(lavoroId);
    if (!lv) return NextResponse.json({ ok: false, error: "Lavoro non trovato." }, { status: 404 });
    if (lv.tipo !== "chat")
      return NextResponse.json(
        { ok: false, error: "Si può sostituire solo un messaggio di chat, mai un'azione o un giro." },
        { status: 400 }
      );

    // Già finito o già annullato: nulla da fare (il chiamante ha comunque scartato la sua risposta).
    if (lv.stato === "fatto" || lv.stato === "annullato")
      return NextResponse.json({ ok: true, giaChiuso: true, stato: lv.stato });

    const nota =
      "⏩ Sostituito dal messaggio successivo di Nicola: la risposta arriva nel turno nuovo, che legge tutta la conversazione.";
    const agg = await annullaLavoroSeStato(lavoroId, ["in_attesa", "in_corso", "errore"], nota);
    if (!agg) {
      // Race: è finito tra la lettura e la scrittura. Va bene lo stesso: il turno nuovo copre tutto.
      const dopo = await getLavoroById(lavoroId);
      return NextResponse.json({ ok: true, giaChiuso: true, stato: dopo?.stato || "sconosciuto" });
    }
    return NextResponse.json({ ok: true, stato: "annullato" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
