import { NextRequest, NextResponse } from "next/server";
import { getLatestBriefing, creaLavoro, memoryConnected, setImpostazione, getImpostazione } from "@/lib/store";
import { eseguiAutopilota } from "@/lib/autopilota";
import { accodaPlaybookDelGiorno } from "@/lib/playbook";
import { aiConfigurato, pensa } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // 1-bis) BATTITO GRATIS (€0, nessuna API): esegue da solo le azioni SICURE 🟢
    // ancora non decise. Se l'autopilota è spento o non c'è nulla, non fa niente.
    const auto = await eseguiAutopilota().catch(() => ({ eseguite: 0 }));

    // 1-ter) ARSENALE (€0): accoda al cervello i playbook "dovuti" oggi (dedup giornaliero).
    await accodaPlaybookDelGiorno().catch(() => {});

    // 1-quater) Registra il battito (per la card "Cuore" nella Cabina).
    await setImpostazione("cuore:ultimo", new Date().toISOString()).catch(() => {});
    await setImpostazione("cuore:eseguite", String(auto.eseguite || 0)).catch(() => {});

    // 1-quinquies) PENSIERO DEL GIORNO (a pagamento ma a contagocce): solo se c'è la
    // chiave AI e il budget regge, e UNA volta al giorno (dedup). Senza chiave: €0, salta.
    if (aiConfigurato()) {
      const oggi = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
      const fattoOggi = await getImpostazione("cuore:pensiero:data").catch(() => null);
      if (fattoOggi !== oggi) {
        // Prenoto la data PRIMA di chiamare: due esecuzioni ravvicinate (cron + click)
        // non spendono due volte. Se la chiamata fallisce, oggi niente pensiero (€0).
        await setImpostazione("cuore:pensiero:data", oggi).catch(() => {});
        const pensiero = await pensa({
          prompt:
            "Sei l'AD di MyCity (marketplace negozi di Piacenza, fase 0→1). In massimo 3 righe: le 3 priorità di OGGI verso la North Star (ordini consegnati). Concreto, niente numeri inventati.",
          maxToken: 300,
        }).catch(() => null);
        if (pensiero) await setImpostazione("cuore:pensiero", pensiero).catch(() => {});
      }
    }
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
