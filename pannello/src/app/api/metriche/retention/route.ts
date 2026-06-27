import { NextResponse } from "next/server";
import { getRetention } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Retention / coorti / LTV (Ondata 1.2): la verita della crescita.
// Quanti clienti riordinano, ogni quanto, quanto valgono, e la curva per coorte.
export async function GET() {
  const r = await getRetention();
  if (!r.connected) return NextResponse.json({ collegato: false });
  return NextResponse.json({ collegato: true, ...r });
}
