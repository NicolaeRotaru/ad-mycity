import { NextResponse } from "next/server";
import { getAcquisizione, getRetention, getMetriche } from "@/lib/marketplace-db";
import { getImpostazione } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Acquisizione · CAC · LTV:CAC (Ondata 2.1).
// Reale dal DB: nuovi clienti e attribuzione referral vs diretto + LTV.
// Config: la spesa di acquisizione (non è nel DB) → CAC = spesa / nuovi clienti,
// poi LTV:CAC e payback in ordini. Il CAC per CANALE arriva quando colleghiamo
// le UTM/spesa per canale (ads).
export async function GET() {
  const acq = await getAcquisizione();
  if (!acq.connected) return NextResponse.json({ collegato: false });

  const ret = await getRetention().catch(() => ({ connected: false }) as any);
  const ltv = ret?.connected ? Number(ret.ltv_medio) || 0 : 0;

  const spesaMese = Number((await getImpostazione("spesa_acquisizione_mese")) || "0"); // €/mese, default 0
  const commissione = Number((await getImpostazione("commissione")) || "12");
  const m = await getMetriche();
  const scontrino = m.connected ? Number(m.scontrino_medio) || 0 : 0;
  const cmStima = (scontrino * commissione) / 100; // margine commissione per ordine (stima)

  const cac = spesaMese > 0 && acq.nuovi_30g > 0 ? Math.round((spesaMese / acq.nuovi_30g) * 100) / 100 : null;
  const ltvCac = cac && cac > 0 ? Math.round((ltv / cac) * 10) / 10 : null;
  const paybackOrdini = cac && cmStima > 0 ? Math.ceil(cac / cmStima) : null;

  return NextResponse.json({
    collegato: true,
    ...acq,
    ltv_medio: Math.round(ltv * 100) / 100,
    spesa_acquisizione_mese: spesaMese,
    cac,
    ltv_cac: ltvCac,
    payback_ordini: paybackOrdini,
    nota: spesaMese > 0 ? null : "Imposta `spesa_acquisizione_mese` per calcolare CAC e LTV:CAC. L'attribuzione referral/diretto è già reale dai dati.",
  });
}
