import { NextResponse } from "next/server";
import { getMargineReale } from "@/lib/marketplace-db";
import { getImpostazione } from "@/lib/store";
import { calcolaRunway } from "@/lib/economia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 💶 CASSA / RUNWAY / BURN — quanti mesi di autonomia.
// Config (impostazioni): cassa_attuale (€) + burn_mensile (€/mese, costi fissi).
// Ricavo commissioni 30g: da UNA sola fonte, getMargineReale — la STESSA che alimenta
// /api/metriche. Prima questo endpoint ricalcolava il ricavo con una query propria
// (scansione ordini duplicata + possibile divergenza dal cruscotto): ora non più.
export async function GET() {
  const [cassaStr, burnStr, margine] = await Promise.all([
    getImpostazione("cassa_attuale"),
    getImpostazione("burn_mensile"),
    getMargineReale().catch(() => ({ connected: false }) as any),
  ]);

  const ricavo30 = Number((margine as any).ricavo_commissione_30g || 0);
  const rw = calcolaRunway(Number(cassaStr || "0"), Number(burnStr || "0"), ricavo30);

  return NextResponse.json({
    collegato: rw.collegato,
    cassa_attuale: rw.cassa_attuale,
    burn_lordo: rw.burn_lordo,
    ricavo_commissioni_30g: rw.ricavo_commissioni_30g,
    burn_netto: rw.burn_netto,
    runway_mesi: rw.runway_mesi,
    sostenibile: rw.sostenibile,
    nota:
      rw.cassa_attuale > 0 || rw.burn_lordo > 0
        ? null
        : "Imposta `cassa_attuale` e `burn_mensile` nelle impostazioni per vedere il runway. Il ricavo commissioni arriva già dai dati reali.",
  });
}
