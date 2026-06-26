import { NextResponse } from "next/server";
import { getAzioniLog } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Registro & risultati: la storia delle azioni decise/eseguite + conteggi.
// Serve a "imparare e misurare": cosa è stato fatto, quanto, da chi.
export async function GET() {
  const voci = await getAzioniLog();
  const per = (s: string) => voci.filter((v) => v.stato === s).length;

  const perReparto: Record<string, number> = {};
  for (const v of voci) {
    const k = v.reparto || "?";
    perReparto[k] = (perReparto[k] || 0) + 1;
  }
  let repartoTop = "";
  let max = 0;
  for (const [k, n] of Object.entries(perReparto)) {
    if (n > max) {
      max = n;
      repartoTop = k;
    }
  }

  const stat = {
    totale: voci.length,
    fatte: per("fatta"),
    simulate: per("simulata"),
    coda: per("coda"),
    rifiutate: per("rifiutata"),
    auto: voci.filter((v) => v.auto).length,
    repartoTop,
  };
  return NextResponse.json({ voci: voci.slice(0, 50), stat });
}
