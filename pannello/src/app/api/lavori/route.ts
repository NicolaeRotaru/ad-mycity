import { NextRequest, NextResponse } from "next/server";
import { creaLavoro, getLavoriPannello, clearLavori, memoryConnected, MemoriaNonCollegata } from "@/lib/store";
import { preparaLavoro } from "@/lib/comandi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    let lavoro;
    try {
      lavoro = await creaLavoro(prep.richiesta, prep.tipo, gruppoId || undefined);
    } catch (e: any) {
      // Config: mancano le chiavi Supabase → problema stabile, va sistemato negli env.
      if (e instanceof MemoriaNonCollegata) {
        return NextResponse.json(
          { ok: false, motivo: "memoria_non_collegata", error: "Memoria non collegata: mancano le chiavi del database (SUPABASE_URL / SUPABASE_SERVICE_KEY negli env)." },
          { status: 503 }
        );
      }
      throw e;
    }
    if (!lavoro) {
      // La tabella C'È: il DB non ha risposto dopo i ritentativi → intoppo passeggero di connessione.
      return NextResponse.json(
        { ok: false, motivo: "memoria_non_raggiungibile", error: "Il database di memoria non ha risposto (intoppo temporaneo di connessione). Il messaggio non è partito: riprova tra poco." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, lavoro });
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
