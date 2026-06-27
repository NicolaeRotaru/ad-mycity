import { NextResponse } from "next/server";
import { getMetriche } from "@/lib/marketplace-db";
import { getPostHog } from "@/lib/posthog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Le metriche del cruscotto: dati del marketplace (mycity) + traffico (PostHog).
export async function GET() {
  const m: any = await getMetriche();
  // 🧪 In demo i numeri (traffico incluso) sono già pronti e marchiati: niente DB/PostHog.
  if (m.demo) return NextResponse.json(m);
  const ph = await getPostHog();
  const marketplaceCollegato = Boolean(m.connected); // stato reale del DB negozi
  if (ph.connected) {
    m.visite_7g = ph.visite_7g;
    // la conversione ha senso solo se ci sono ANCHE gli ordini (marketplace su)
    if (marketplaceCollegato) {
      const ordini7 = Number(m.ordini_7g) || 0;
      m.conversione = ph.visitatori_7g ? Math.round((ordini7 / ph.visitatori_7g) * 1000) / 10 : 0;
    }
  }
  // Flag onesti su cosa è davvero collegato. `connected` = "abbiamo qualche dato reale".
  m.marketplace_collegato = marketplaceCollegato;
  m.traffico_collegato = Boolean(ph.connected);
  m.connected = marketplaceCollegato || Boolean(ph.connected);
  return NextResponse.json(m);
}
