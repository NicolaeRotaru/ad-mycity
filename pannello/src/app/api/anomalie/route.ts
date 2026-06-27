import { NextResponse } from "next/server";
import { marketplaceSelect, marketplaceDbConnected } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📉 Anomaly detection STATISTICO (Ondata 0.4): invece di soglie fisse scritte a
// mano, impara il "normale" di una metrica (media + deviazione standard sugli
// ultimi 30 giorni) e segnala i giorni che se ne discostano di oltre 2 sigma.
// Vale per ordini e incasso. Tutto in sola lettura, aggregazione lato app.
type Anomalia = { giorno: string; metrica: "ordini" | "incasso"; valore: number; media: number; z: number; direzione: "sopra" | "sotto" };

function media(v: number[]) {
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}
function devStd(v: number[], m: number) {
  if (v.length < 2) return 0;
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1));
}

export async function GET() {
  if (!marketplaceDbConnected()) return NextResponse.json({ collegato: false, anomalie: [] });

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const orders = await marketplaceSelect("orders", `select=created_at,total_price,payment_status&created_at=gte.${since}&limit=10000`);

  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }); // YYYY-MM-DD
  const giorni: Record<string, { ordini: number; incasso: number }> = {};
  for (let i = 29; i >= 0; i--) giorni[fmt.format(new Date(Date.now() - i * 86400000))] = { ordini: 0, incasso: 0 };
  for (const o of orders) {
    const g = fmt.format(new Date(o.created_at));
    if (!giorni[g]) continue;
    if (o.payment_status !== "FAILED") giorni[g].ordini++;
    if (o.payment_status === "PAID") giorni[g].incasso += Number(o.total_price) || 0;
  }
  const serie = Object.entries(giorni).map(([giorno, v]) => ({ giorno, ...v }));

  const anomalie: Anomalia[] = [];
  for (const metrica of ["ordini", "incasso"] as const) {
    const vals = serie.map((d) => d[metrica]);
    const m = media(vals);
    const sd = devStd(vals, m);
    if (sd <= 0) continue; // tutto piatto: nessuna anomalia statistica
    for (const d of serie) {
      const z = (d[metrica] - m) / sd;
      if (Math.abs(z) >= 2) {
        anomalie.push({
          giorno: d.giorno,
          metrica,
          valore: Math.round(d[metrica] * 100) / 100,
          media: Math.round(m * 100) / 100,
          z: Math.round(z * 10) / 10,
          direzione: z > 0 ? "sopra" : "sotto",
        });
      }
    }
  }
  // I piu recenti per primi (l'anomalia di ieri conta piu di quella di 3 settimane fa).
  anomalie.sort((a, b) => b.giorno.localeCompare(a.giorno));
  return NextResponse.json({ collegato: true, anomalie, finestra_giorni: 30, soglia_sigma: 2 });
}
