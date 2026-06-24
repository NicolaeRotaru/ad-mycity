import { NextRequest, NextResponse } from "next/server";
import { creaLavoro } from "@/lib/store";

export const runtime = "nodejs";

// Approva o rifiuta un'azione della coda: crea un lavoro che il worker dell'AD
// (cervello/worker.ps1) prende ed esegue (con le "mani" se approvata).
export async function POST(req: NextRequest) {
  try {
    const { numero, azione, decisione } = await req.json();
    const n = String(numero ?? "").trim();
    if (!n) return NextResponse.json({ ok: false, error: "Manca il numero dell'azione." }, { status: 400 });
    const rifiuto = String(decisione || "approva") === "rifiuta";

    const ctx =
      `l'azione #${n} della coda MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md` +
      (azione ? ` ("${String(azione).slice(0, 300)}")` : "");

    const richiesta = rifiuto
      ? `È stata RIFIUTATA ${ctx}. NON eseguirla. Segna la riga come ❌ RIFIUTATA nel file ` +
        `e appendi la traccia in DECISIONI.md (motivo: scelta di Nicola dal Pannello).`
      : `È stata APPROVATA ${ctx}. Eseguila ORA usando le "mani" (cervello/esegui-azione.mjs) ` +
        `sul canale indicato, poi segna la riga come ✅ FATTO nel file e appendi la traccia in ` +
        `DECISIONI.md. Rispetta il colore 🟡/🔴 e riferisci a Nicola cosa è partito.`;

    const lavoro = await creaLavoro(richiesta, rifiuto ? "rifiuta-azione" : "esegui-azione");
    if (!lavoro) {
      return NextResponse.json(
        { ok: false, error: "Memoria non collegata (manca la tabella 'lavori' o le chiavi Supabase)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, lavoro });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
