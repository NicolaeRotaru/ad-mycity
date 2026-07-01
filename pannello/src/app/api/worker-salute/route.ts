import { NextResponse } from "next/server";
import { getImpostazione, getLavori, memoryConnected } from "@/lib/store";
import { etaOre, oreDaQuando, raccogliSegnaliBattito } from "@/lib/battito";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Diagnostica operativa coda chat — cosa vede il Pannello (stesso Supabase del worker). */
export async function GET() {
  const memoria = memoryConnected();
  const supabaseHost = process.env.SUPABASE_URL?.replace(/^https?:\/\//, "").split("/")[0] ?? null;

  if (!memoria) {
    return NextResponse.json({
      memoria: false,
      problema: "Memoria Supabase non collegata su Vercel (SUPABASE_URL + SUPABASE_SERVICE_KEY).",
      azioni: ["Vercel → Environment Variables → aggiungi SUPABASE_* del progetto MEMORIA → Redeploy"],
    });
  }

  const [segnali, pausa, pipeline, codiceRev, lavori] = await Promise.all([
    raccogliSegnaliBattito(),
    getImpostazione("pausa").catch(() => null),
    getImpostazione("worker:pipeline").catch(() => null),
    getImpostazione("worker:codice_rev").catch(() => null),
    getLavori(80),
  ]);

  const oreWorker = oreDaQuando(segnali.worker?.quando);
  const workerVivo = oreWorker != null && oreWorker <= 0.1;
  const adInPausa = pausa === "on";

  const conteggi = { in_attesa: 0, in_corso: 0, fatto: 0, errore: 0 };
  let attesaPiuVecchiaMin: number | null = null;
  let corsoPiuVecchioMin: number | null = null;
  const now = Date.now();

  for (const l of lavori) {
    conteggi[l.stato as keyof typeof conteggi] = (conteggi[l.stato as keyof typeof conteggi] || 0) + 1;
    const t = new Date(l.updated_at || l.created_at).getTime();
    if (isNaN(t)) continue;
    const min = (now - t) / 60000;
    if (l.stato === "in_attesa") {
      if (attesaPiuVecchiaMin == null || min > attesaPiuVecchiaMin) attesaPiuVecchiaMin = min;
    }
    if (l.stato === "in_corso") {
      if (corsoPiuVecchioMin == null || min > corsoPiuVecchioMin) corsoPiuVecchioMin = min;
    }
  }

  const azioni: string[] = [];
  let problema: string | null = null;

  if (adInPausa) {
    problema = "L'AD è in pausa: il worker gira ma non esegue lavori.";
    azioni.push("Pannello → Azioni → Governo → «Riattiva l'AD»");
  } else if (oreWorker == null) {
    problema = "Il worker sul VPS non ha mai inviato un battito a Supabase.";
    azioni.push("SSH sul VPS → sudo systemctl start mycity-worker");
    azioni.push("Se crasha: sudo bash /opt/mycity/ad-mycity/cervello/vps/diagnostica-completa.sh");
    azioni.push("Quasi sempre: CURSOR_API_KEY mancante o agent non installato per utente mycity");
  } else if (!workerVivo) {
    problema = `Worker spento da ${etaOre(oreWorker)} — systemd potrebbe essere fermo o in crash loop.`;
    azioni.push("SSH → journalctl -u mycity-worker -n 30 --no-pager");
    azioni.push("SSH → sudo bash /opt/mycity/ad-mycity/cervello/vps/diagnostica-completa.sh");
    azioni.push("Se NRestarts alto: sudo -u mycity -H bash .../cervello/vps/test-agent.sh");
  } else if ((conteggi.in_corso ?? 0) > 0 && (corsoPiuVecchioMin ?? 0) > 10) {
    problema = `${conteggi.in_corso} lavoro/i bloccati «In corso» da oltre 10 minuti.`;
    azioni.push("Usa il pulsante «Sblocca coda» qui sotto");
    azioni.push("Oppure VPS: sudo -u mycity -H bash .../recupera-lavori-orfani.sh");
  } else if ((conteggi.in_attesa ?? 0) > 0 && (attesaPiuVecchiaMin ?? 0) > 3 && workerVivo) {
    problema = "Worker vivo ma la coda non si muove — motore AI impallato sul lavoro corrente o .env VPS ≠ Vercel.";
    azioni.push("Verifica che SUPABASE_URL sul VPS sia lo stesso host mostrato qui sotto");
    azioni.push("journalctl -u mycity-worker -f (guarda se compare «Lavoro … in_corso»)");
  } else if (pipeline === "legacy-agent-direct") {
    problema = "Worker con pipeline vecchia — i giri non pushano memoria-ad.";
    azioni.push("VPS: sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh");
  }

  return NextResponse.json({
    memoria: true,
    supabaseHost,
    workerVivo,
    workerUltimo: segnali.worker?.quando ?? null,
    workerUltimoFa: oreWorker != null ? etaOre(oreWorker) : "mai",
    adInPausa,
    pipeline: pipeline ?? null,
    codiceRev: codiceRev ?? null,
    conteggi,
    attesaPiuVecchiaMin: attesaPiuVecchiaMin != null ? Math.round(attesaPiuVecchiaMin) : null,
    corsoPiuVecchioMin: corsoPiuVecchioMin != null ? Math.round(corsoPiuVecchioMin) : null,
    problema,
    azioni,
    ok: !problema && workerVivo,
  });
}
