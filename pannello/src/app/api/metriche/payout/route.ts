import { NextResponse } from "next/server";
import { getRiconciliazionePayout } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Riconciliazione payout (Ondata 0.3): i soldi dei negozi, chi è stato pagato e
// chi no, dai campi reali degli ordini. Senza Stripe MCP.
export async function GET() {
  const p = await getRiconciliazionePayout();
  if (!p.connected) return NextResponse.json({ collegato: false });
  return NextResponse.json({ collegato: true, ...p });
}
