import { NextRequest, NextResponse } from "next/server";
import { creaLavoroEsito, getLavoriPannello, clearLavori, memoryConnected } from "@/lib/store";
import { preparaLavoro } from "@/lib/comandi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
// Tempo massimo della funzione: headroom sopra il budget interno (~8s) così la
// funzione RITORNA sempre l'errore vero invece di essere uccisa a metà.
export const maxDuration = 20;

// Il "ponte" tra l'app web e il cervello (Claude Code sul Max).
// GET: elenco lavori (polling). Query: offset/limit = pagina archivio (default 100).
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const archivioLimit = Number(sp.get("limit")) || 100;
    const archivioOffset = Number(sp.get("offset")) || 0;
    const data = await getLavoriPannello(archivioLimit, archivioOffset);
    return NextResponse.json({ memoria: memoryConnected(), ...data });
  } catch (e: any) {
    return NextResponse.json({ memoria: false, lavori: [], error: e.message });
  }
}

// POST: crea un lavoro da far eseguire al cervello.
export async function POST(req: NextRequest) {
  try {
    const { richiesta, tipo, gruppo_id } = await req.json();
    const prep = preparaLavoro(String(richiesta || ""), tipo ? String(tipo) : undefined);
    if (!prep.richiesta.trim()) return NextResponse.json({ ok: false, error: "Richiesta vuota." }, { status: 400 });
    const gruppoId = gruppo_id ? String(gruppo_id).trim() : undefined;
    const esito = await creaLavoroEsito(prep.richiesta, prep.tipo, gruppoId || undefined);
    if (!esito.ok) {
      // Ogni causa ha il SUO messaggio: niente più "riprova tra poco" per tutto.
      // - config  → mancano le chiavi negli env di Vercel (va sistemato)
      // - timeout → il DB non ha risposto in tempo (passeggero: riprovare ha senso)
      // - rete    → non ho raggiunto il DB (DNS/connessione)
      // - rifiuto → il DB ha RIFIUTATO la scrittura (RLS/schema/permessi): stabile, va indagato
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
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// DELETE: svuota i lavori.
export async function DELETE() {
  try {
    await clearLavori();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
