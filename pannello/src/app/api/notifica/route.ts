import { NextRequest, NextResponse } from "next/server";
import { creaLavoro } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Avviso a Nicola tramite le "mani" dell'AD (Telegram/email): accoda un lavoro
// "notifica" che il worker invia con cervello/esegui-azione.mjs. 🟡 — parte solo
// col worker attivo e le chiavi configurate.
export async function POST(req: NextRequest) {
  try {
    const { testo } = await req.json();
    const t = String(testo || "").trim();
    if (!t) return NextResponse.json({ ok: false, error: "Testo dell'avviso mancante." }, { status: 400 });
    const lavoro = await creaLavoro(
      `Invia questo AVVISO a Nicola tramite la "mano" disponibile (Telegram o email, via cervello/esegui-azione.mjs): "${t.slice(0, 600)}".`,
      "notifica"
    );
    if (!lavoro) {
      return NextResponse.json({ ok: false, error: "Memoria non collegata (tabella 'lavori')." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, lavoro });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
