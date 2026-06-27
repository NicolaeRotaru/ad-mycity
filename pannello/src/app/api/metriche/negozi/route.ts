import { NextResponse } from "next/server";
import { getHealthNegozi } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Health per negozio (Ondata 1.3): la salute di ogni bottega (ordini 30g, GMV,
// giorni dall'ultimo ordine, recensioni, trend) con i peggiori in cima.
export async function GET() {
  const h = await getHealthNegozi();
  if (!h.connected) return NextResponse.json({ collegato: false, negozi: [] });
  return NextResponse.json({ collegato: true, ...h });
}
