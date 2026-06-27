import { NextResponse } from "next/server";
import { marketplaceSelect, marketplaceDbConnected } from "@/lib/marketplace-db";
import { getImpostazione } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 💶 CASSA / RUNWAY / BURN (Ondata 2.5) — quanti mesi di autonomia.
// Config (impostazioni): cassa_attuale (€) + burn_mensile (€, costi fissi).
// Reale dal DB: ricavo commissioni ultimi 30g (application_fee_cents sugli ordini
// PAID) = l'entrata che riduce il burn. Runway = cassa / burn netto.
export async function GET() {
  const cassa = Number((await getImpostazione("cassa_attuale")) || "0"); // €
  const burnLordo = Number((await getImpostazione("burn_mensile")) || "0"); // €/mese costi fissi

  let ricavo30 = 0;
  if (marketplaceDbConnected()) {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const orders = await marketplaceSelect("orders", `select=payment_status,application_fee_cents,created_at&created_at=gte.${since}&limit=10000`);
    ricavo30 = orders.filter((o) => o.payment_status === "PAID").reduce((s, o) => s + (Number(o.application_fee_cents) || 0), 0) / 100;
  }

  const burnNetto = burnLordo - ricavo30; // quanto bruciamo davvero al mese, al netto dei ricavi
  // Runway in mesi: se il burn netto è ≤0 siamo già sostenibili (runway "infinito").
  const runwayMesi = burnNetto > 0 && cassa > 0 ? Math.round((cassa / burnNetto) * 10) / 10 : null;
  const sostenibile = burnNetto <= 0 && (burnLordo > 0 || ricavo30 > 0);

  return NextResponse.json({
    collegato: cassa > 0 || burnLordo > 0 || ricavo30 > 0,
    cassa_attuale: Math.round(cassa * 100) / 100,
    burn_lordo: Math.round(burnLordo * 100) / 100,
    ricavo_commissioni_30g: Math.round(ricavo30 * 100) / 100,
    burn_netto: Math.round(burnNetto * 100) / 100,
    runway_mesi: runwayMesi,
    sostenibile,
    nota:
      cassa > 0 || burnLordo > 0
        ? null
        : "Imposta `cassa_attuale` e `burn_mensile` nelle impostazioni per vedere il runway. Il ricavo commissioni arriva già dai dati reali.",
  });
}
