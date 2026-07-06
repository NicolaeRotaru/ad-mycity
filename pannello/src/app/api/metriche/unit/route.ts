import { NextResponse } from "next/server";
import { getMetriche, getMargineReale } from "@/lib/marketplace-db";
import { getImpostazione } from "@/lib/store";
import { calcolaUnitEconomics } from "@/lib/economia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Unit economics: margini, ricavo piattaforma e break-even a partire dai dati reali
// + le assunzioni (commissione %, costo fisso) configurabili nella tabella impostazioni.
export async function GET() {
  const m = await getMetriche();
  if (!m.connected) return NextResponse.json({ collegato: false });

  const commissione = Number((await getImpostazione("commissione")) || "12"); // % default 12
  const costoFisso = Number((await getImpostazione("costo_fisso")) || "0"); // €/mese, default 0
  // Margine di CONTRIBUZIONE per ordine (Ondata 2.3): oltre alla commissione conta la fee di
  // consegna incassata dal cliente meno il costo reale della consegna. Config nella tabella impostazioni.
  const feeCliente = Number((await getImpostazione("fee_consegna_cliente")) || "0"); // € incassati per ordine
  const costoConsegna = Number((await getImpostazione("costo_consegna")) || "0"); // € costo reale per consegna

  const scontrino = Number(m.scontrino_medio || 0);
  const gmv7 = Number(m.incasso_7g || 0);
  const ordini7 = Number(m.ordini_7g || 0);

  const ricavoPiattaforma7 = (gmv7 * commissione) / 100;
  // Margini per ordine + break-even: una sola verità (lib/economia), condivisa con /api/metriche.
  const ue = calcolaUnitEconomics({ scontrino, commissione, costoFisso, feeCliente, costoConsegna });
  const marginePerOrdine = ue.margine_per_ordine;
  const cmPerOrdine = ue.cm_per_ordine;
  const breakEvenOrdiniMese = ue.break_even_ordini_mese;

  // Margine REALE dai campi in centesimi degli ordini (commissione e fee davvero incassate).
  const reale = await getMargineReale(costoConsegna).catch(() => ({ connected: false }));

  return NextResponse.json({
    collegato: true,
    commissione,
    costo_fisso: costoFisso,
    fee_consegna_cliente: feeCliente,
    costo_consegna: costoConsegna,
    gmv_7g: Math.round(gmv7 * 100) / 100,
    ordini_7g: ordini7,
    scontrino_medio: Math.round(scontrino * 100) / 100,
    ricavo_piattaforma_7g: Math.round(ricavoPiattaforma7 * 100) / 100,
    margine_per_ordine: Math.round(marginePerOrdine * 100) / 100,
    cm_per_ordine: Math.round(cmPerOrdine * 100) / 100,
    break_even_ordini_mese: breakEvenOrdiniMese,
    reale,
  });
}
