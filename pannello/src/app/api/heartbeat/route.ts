import { NextRequest, NextResponse } from "next/server";
import { getLatestBriefing, creaLavoro, memoryConnected } from "@/lib/store";

export const runtime = "nodejs";

// "Aggiorna ora" / il cron giornaliero.
// IMPORTANTE: questo endpoint NON usa le API di Claude (nessun costo a token).
// Il "cervello" gira su Claude Code (piano Max) tramite cervello/giro.ps1 (programmato)
// o tramite il worker della coda lavori (cervello/worker.ps1). Qui ci limitiamo a:
//   1) se la memoria e' collegata, ACCODARE un "giro" che il cervello-Max eseguira';
//   2) restituire l'ULTIMO briefing gia' salvato in memoria, cosi' la dashboard lo mostra.
// Sicurezza cron: se CRON_SECRET e' impostato e arriva un token, deve combaciare.
async function handle(req: NextRequest, accodaGiro: boolean) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // 1) Chiedi al cervello-Max un nuovo giro (best-effort, solo se c'e' la memoria).
  if (accodaGiro && memoryConnected()) {
    await creaLavoro(
      "Fai un GIRO DI PERLUSTRAZIONE come AD di MyCity (vedi cervello/giro.md): leggi i dati reali, " +
        "sintetizza un briefing (situazione + opportunita' + azioni 🟢🟡🔴) e SALVALO in memoria (tabella briefings) " +
        "cosi' compare nel Pannello.",
      "giro"
    ).catch(() => {});
  }

  // 2) Mostra l'ultimo briefing che il cervello-Max ha gia' salvato.
  const rec = await getLatestBriefing();
  if (!rec) {
    return NextResponse.json({
      ok: false,
      error: memoryConnected()
        ? "Il cervello sul Max non ha ancora salvato un briefing. Lancia un giro (cervello/giro.ps1) o aspetta quello programmato."
        : "Memoria non collegata: i giri non si salvano. Collega la memoria (SUPABASE_URL + SUPABASE_SERVICE_KEY) per vedere qui i briefing del cervello-Max.",
    });
  }
  return NextResponse.json({ ok: true, briefing: rec.data, created_at: rec.created_at });
}

// GET (cron Vercel): rilegge l'ultimo briefing e accoda un giro.
export async function GET(req: NextRequest) {
  return handle(req, true);
}
// POST (pulsante "Aggiorna ora"): idem.
export async function POST(req: NextRequest) {
  return handle(req, true);
}
