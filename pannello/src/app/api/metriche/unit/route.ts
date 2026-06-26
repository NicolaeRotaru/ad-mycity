import { NextResponse } from "next/server";
import { getMetriche } from "@/lib/marketplace-db";
import { getImpostazione } from "@/lib/store";

export const runtime = "nodejs";

// Unit economics: margini, ricavo piattaforma e break-even a partire dai dati reali
// + le assunzioni (commissione %, costo fisso) configurabili nella tabella impostazioni.
export async function GET() {
  const m = await getMetriche();
  if (!m.connected) return NextResponse.json({ collegato: false });

  const commissione = Number((await getImpostazione("commissione")) || "12"); // % default 12
  const costoFisso = Number((await getImpostazione("costo_fisso")) || "0"); // €/mese, default 0

  const scontrino = Number(m.scontrino_medio || 0);
  const gmv7 = Number(m.incasso_7g || 0);
  const ordini7 = Number(m.ordini_7g || 0);

  const ricavoPiattaforma7 = (gmv7 * commissione) / 100;
  const marginePerOrdine = (scontrino * commissione) / 100;
  const breakEvenOrdiniMese = costoFisso > 0 && marginePerOrdine > 0 ? Math.ceil(costoFisso / marginePerOrdine) : null;

  return NextResponse.json({
    collegato: true,
    commissione,
    costo_fisso: costoFisso,
    gmv_7g: Math.round(gmv7 * 100) / 100,
    ordini_7g: ordini7,
    scontrino_medio: Math.round(scontrino * 100) / 100,
    ricavo_piattaforma_7g: Math.round(ricavoPiattaforma7 * 100) / 100,
    margine_per_ordine: Math.round(marginePerOrdine * 100) / 100,
    break_even_ordini_mese: breakEvenOrdiniMese,
  });
}
