import { NextResponse } from "next/server";
import { marketplaceSelect, marketplaceDbConnected } from "@/lib/marketplace-db";

export const runtime = "nodejs";

// Trend storici: ordini e incasso per giorno negli ultimi 30 giorni + proiezione
// del mese (media degli ultimi 7 giorni × 30). Solo letture aggregate.
export async function GET() {
  if (!marketplaceDbConnected()) return NextResponse.json({ collegato: false, serie: [] });

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const orders = await marketplaceSelect(
    "orders",
    `select=created_at,total_price,payment_status&created_at=gte.${since}&limit=10000`
  );

  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }); // YYYY-MM-DD
  const giorni: Record<string, { ordini: number; incasso: number }> = {};
  for (let i = 29; i >= 0; i--) {
    giorni[fmt.format(new Date(Date.now() - i * 86400000))] = { ordini: 0, incasso: 0 };
  }
  for (const o of orders) {
    const g = fmt.format(new Date(o.created_at));
    if (!giorni[g]) continue;
    if (o.payment_status !== "FAILED") giorni[g].ordini++;
    if (o.payment_status === "PAID") giorni[g].incasso += Number(o.total_price) || 0;
  }

  const serie = Object.entries(giorni).map(([giorno, v]) => ({
    giorno,
    ordini: v.ordini,
    incasso: Math.round(v.incasso * 100) / 100,
  }));
  const last7 = serie.slice(-7);
  const mediaOrdini = last7.reduce((s, d) => s + d.ordini, 0) / 7;
  const mediaIncasso = last7.reduce((s, d) => s + d.incasso, 0) / 7;

  return NextResponse.json({
    collegato: true,
    serie,
    proiezione: { ordini_mese: Math.round(mediaOrdini * 30), incasso_mese: Math.round(mediaIncasso * 30) },
  });
}
