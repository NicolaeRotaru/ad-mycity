import { NextRequest, NextResponse } from "next/server";
import { creaLavoro } from "@/lib/store";

export const runtime = "nodejs";

// Approvazione di un'azione della coda: crea un lavoro "esegui-azione" che il
// worker dell'AD (cervello/worker.ps1) prende ed esegue con le "mani" reali.
export async function POST(req: NextRequest) {
  try {
    const { numero, azione } = await req.json();
    const n = String(numero ?? "").trim();
    if (!n) return NextResponse.json({ ok: false, error: "Manca il numero dell'azione." }, { status: 400 });

    const richiesta =
      `È stata APPROVATA l'azione #${n} della coda ` +
      `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md` +
      (azione ? ` ("${String(azione).slice(0, 300)}")` : "") +
      `. Eseguila ORA usando le "mani" (cervello/esegui-azione.mjs) sul canale indicato, ` +
      `poi segna la riga come ✅ FATTO nel file e appendi la traccia in DECISIONI.md. ` +
      `Rispetta il colore 🟡/🔴 e riferisci a Nicola cosa è partito.`;

    const lavoro = await creaLavoro(richiesta, "esegui-azione");
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
