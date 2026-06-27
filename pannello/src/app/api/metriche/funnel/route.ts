import { NextResponse } from "next/server";
import { marketplaceSelect, marketplaceDbConnected } from "@/lib/marketplace-db";
import { getPostHog } from "@/lib/posthog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🫗 FUNNEL DI CONVERSIONE (Ondata 2.2) — macro-funnel a 7 giorni con i dati certi:
// Visitatori (PostHog) → Ordini avviati (DB) → Ordini pagati (DB), con il calo per
// passo. Mostra anche i carrelli abbandonati come "perdita". Il funnel granulare
// (vista prodotto, add-to-cart) vive negli eventi PostHog: si aggancia quando la
// tassonomia eventi del marketplace è confermata.
type Step = { nome: string; valore: number; conv?: number };

export async function GET() {
  const ph = await getPostHog().catch(() => ({ connected: false }) as any);
  if (!marketplaceDbConnected() && !ph?.connected) return NextResponse.json({ collegato: false, steps: [] });

  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [orders, carts] = await Promise.all([
    marketplaceDbConnected() ? marketplaceSelect("orders", `select=payment_status,created_at&created_at=gte.${since}&limit=10000`) : Promise.resolve([]),
    marketplaceDbConnected() ? marketplaceSelect("abandoned_carts", `select=created_at&created_at=gte.${since}&limit=10000`) : Promise.resolve([]),
  ]);

  const ordiniAvviati = orders.filter((o) => o.payment_status !== "FAILED").length;
  const ordiniPagati = orders.filter((o) => o.payment_status === "PAID").length;
  const visitatori = ph?.connected ? Number(ph.visitatori_7g) || 0 : null;
  const carrelliAbbandonati = carts.length;

  const steps: Step[] = [];
  if (visitatori != null) steps.push({ nome: "Visitatori (7g)", valore: visitatori });
  steps.push({ nome: "Ordini avviati", valore: ordiniAvviati });
  steps.push({ nome: "Ordini pagati", valore: ordiniPagati });
  // Conversione di ogni passo rispetto al precedente.
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1].valore;
    steps[i].conv = prev > 0 ? Math.round((steps[i].valore / prev) * 1000) / 10 : 0;
  }

  return NextResponse.json({
    collegato: true,
    steps,
    carrelli_abbandonati_7g: carrelliAbbandonati,
    traffico_collegato: Boolean(ph?.connected),
    nota: visitatori == null ? "Collega PostHog per il passo Visitatori e il tasso di conversione dal traffico." : null,
  });
}
