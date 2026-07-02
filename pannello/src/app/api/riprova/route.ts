import { NextRequest, NextResponse } from "next/server";
import { creaLavoro, getLavoroById, patchLavoro } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Riprova un'azione APPROVATA che era FALLITA (stato=errore) — es. worker giù al momento.
// Sicurezza (scelta di Nicola): la riesecuzione parte SOLO da qui, cioè da un clic esplicito
// di Nicola nel Pannello. La sentinella (cervello/sentinella-lavori.mjs) si limita a segnalarle.
// Crea un NUOVO lavoro in_attesa con la stessa richiesta+tipo; il vecchio resta come storico.
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const jobId = String(id ?? "").trim();
    if (!jobId) return NextResponse.json({ ok: false, error: "Manca l'id del lavoro." }, { status: 400 });

    const vecchio = await getLavoroById(jobId);
    if (!vecchio) {
      return NextResponse.json({ ok: false, error: "Lavoro non trovato (o memoria non collegata)." }, { status: 404 });
    }
    if (vecchio.stato !== "errore") {
      return NextResponse.json({ ok: false, error: `Si può riprovare solo un lavoro in errore (stato attuale: ${vecchio.stato}).` }, { status: 400 });
    }
    // Idempotenza: se è GIÀ stato rimesso in coda (marcato "[riproposto ...]"), non riaccodarlo di
    // nuovo — dopo un refresh la card resta in errore e il tasto Riprova ricomparirebbe, creando doppioni.
    if ((vecchio.risultato || "").includes("[riproposto")) {
      return NextResponse.json(
        { ok: false, error: "Questa azione è già stata rimessa in coda. Controlla i lavori in attesa prima di riprovare.", giaRiproposto: true },
        { status: 409 }
      );
    }

    const nota = `RIPROVA (riapprovata da Nicola dal Pannello il ${new Date().toISOString()}). Azione originale fallita:\n\n`;
    const nuovo = await creaLavoro(nota + vecchio.richiesta, vecchio.tipo, vecchio.gruppo_id ?? null);
    if (!nuovo) {
      return NextResponse.json({ ok: false, error: "Memoria non collegata: impossibile rimettere in coda." }, { status: 503 });
    }

    // Marca il vecchio come riproposto (resta 'errore' nello storico, ma non più "da riapprovare").
    await patchLavoro(jobId, {
      risultato: `${(vecchio.risultato || "").slice(0, 1500)}\n[riproposto come ${nuovo.id} il ${new Date().toISOString()}]`,
    });

    return NextResponse.json({ ok: true, nuovo });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
