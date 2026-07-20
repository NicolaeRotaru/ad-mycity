import { NextRequest, NextResponse } from "next/server";
import { preparaLavoro } from "@/lib/comandi";
import { assembleRichiestaCasella, type ParlaMsg } from "@/lib/parla";
import { formattaBloccoMemoriaChat } from "@/lib/memoria-chat";
import { creaLavoroEsito, getConversazioni } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 20;

// Accoda un lavoro «Parla con questa casella» costruendo la richiesta lato server
// (payload compatto dal browser → niente JSON gigante/fragile verso Supabase).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const titolo = String(body?.titolo || "Casella").trim();
    const contesto = String(body?.contesto || "");
    const messaggio = String(body?.messaggio || "").trim() || "(nessun testo — vedi allegati)";
    const bloccoAllegati = String(body?.bloccoAllegati || "");
    const gruppoId = body?.gruppo_id ? String(body.gruppo_id).trim() : undefined;
    const storia: ParlaMsg[] = Array.isArray(body?.storia) ? body.storia : [];
    const prep = preparaLavoro(messaggio, body?.tipo ? String(body.tipo) : "chat");

    const { righe } = await getConversazioni(20);
    const memoria = formattaBloccoMemoriaChat(righe, gruppoId || null);
    const richiesta = assembleRichiestaCasella(titolo, contesto, storia, messaggio, memoria, bloccoAllegati);

    const esito = await creaLavoroEsito(richiesta, prep.tipo, gruppoId || undefined);
    if (!esito.ok) {
      const suffissoStato = esito.status ? ` (HTTP ${esito.status})` : "";
      const messaggi: Record<typeof esito.motivo, { status: number; error: string }> = {
        config: { status: 503, error: `Memoria non collegata: ${esito.dettaglio}. Il messaggio non è partito.` },
        timeout: { status: 504, error: `Il database di memoria non ha risposto in tempo (${esito.dettaglio}). Il messaggio non è partito: riprova.` },
        rete: { status: 502, error: `Non sono riuscito a raggiungere il database di memoria (${esito.dettaglio}). Il messaggio non è partito: riprova.` },
        rifiuto: { status: 502, error: `Il database di memoria ha rifiutato la scrittura${suffissoStato}: ${esito.dettaglio}. Non è un intoppo passeggero: va sistemato.` },
      };
      const m = messaggi[esito.motivo];
      return NextResponse.json({ ok: false, motivo: `memoria_${esito.motivo}`, error: m.error }, { status: m.status });
    }
    return NextResponse.json({ ok: true, lavoro: esito.lavoro });
  } catch (e: any) {
    if (e?.message === "payload-lavoro-vuoto") {
      return NextResponse.json({ ok: false, error: "Richiesta vuota dopo la normalizzazione." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
