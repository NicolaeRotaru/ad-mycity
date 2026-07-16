import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🔴 TEMPO REALE (metà "display"): canale PUSH verso il browser (Server-Sent Events).
// Invece di far chiedere al Pannello "c'è qualcosa di nuovo?" ogni 400ms, il server tiene una
// linea aperta e SPINGE un "ping" nell'istante in cui un lavoro in corso cambia (il worker sta
// scrivendo la risposta parola per parola). Il client, al ping, ricarica subito → streaming liscio.
// SICURO PER COSTRUZIONE: usa la service key SOLO lato server (nessuna chiave nel browser, nessun
// cambio RLS). Se il canale non parte, il Pannello continua col sondaggio di prima (fallback).

const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

const CADENZA_MS = 250; // ogni quanto il server controlla il DB (solo mentre una risposta scorre)
const VITA_MAX_MS = 45_000; // dopo 45s chiudiamo: il client (EventSource) si riaggancia da solo
const GRAZIA_VUOTO = 8; // cicli senza lavori in corso prima di chiudere (≈2s)

function headers() {
  return { apikey: KEY as string, Authorization: `Bearer ${KEY}` };
}

// Firma economica dei lavori in corso: id·stato·lunghezza-risultato. Se cambia → c'è testo nuovo.
async function firmaInCorso(): Promise<{ firma: string; quanti: number }> {
  try {
    const r = await fetch(
      `${URL_BASE}/rest/v1/lavori?stato=eq.in_corso&select=id,stato,risultato&limit=50`,
      { headers: headers(), cache: "no-store" }
    );
    if (!r.ok) return { firma: "err", quanti: -1 };
    const rows: any[] = await r.json();
    const firma = rows
      .map((l) => `${l.id}:${l.stato}:${(l.risultato || "").length}`)
      .sort()
      .join("|");
    return { firma, quanti: rows.length };
  } catch {
    return { firma: "err", quanti: -1 };
  }
}

export async function GET(_req: NextRequest) {
  if (!URL_BASE || !KEY) {
    return new Response("event: end\ndata: {\"motivo\":\"db-non-collegato\"}\n\n", {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const encoder = new TextEncoder();
  let chiuso = false;

  const stream = new ReadableStream({
    async start(controller) {
      const invia = (evento: string, dati: unknown) => {
        if (chiuso) return;
        try {
          controller.enqueue(encoder.encode(`event: ${evento}\ndata: ${JSON.stringify(dati)}\n\n`));
        } catch {
          chiuso = true;
        }
      };

      invia("open", { ok: true });
      const scadenza = Date.now() + VITA_MAX_MS;
      let ultimaFirma = "";
      let vuotoDaCicli = 0;

      while (!chiuso && Date.now() < scadenza) {
        const { firma, quanti } = await firmaInCorso();
        if (firma !== ultimaFirma) {
          ultimaFirma = firma;
          invia("ping", { t: Date.now() }); // il client ricarica: mostra il testo cresciuto
        }
        if (quanti === 0) {
          vuotoDaCicli++;
          if (vuotoDaCicli >= GRAZIA_VUOTO) break; // nessuna risposta in corso: chiudiamo
        } else {
          vuotoDaCicli = 0;
        }
        await new Promise((r) => setTimeout(r, CADENZA_MS));
      }

      invia("end", { motivo: "riaggancia" });
      chiuso = true;
      try {
        controller.close();
      } catch {
        /* già chiuso */
      }
    },
    cancel() {
      chiuso = true; // il browser ha chiuso la linea → fermiamo il loop
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
