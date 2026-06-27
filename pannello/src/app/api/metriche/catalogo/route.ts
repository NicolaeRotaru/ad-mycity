import { NextResponse } from "next/server";
import { getCatalogo } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Catalogo / prodotti (Ondata 2.4): best-seller, mai-venduti, copertura per
// categoria e stock a zero. Dice a vendite quali categorie/botteghe servono.
export async function GET() {
  const c = await getCatalogo();
  if (!c.connected) return NextResponse.json({ collegato: false });
  return NextResponse.json({ collegato: true, ...c });
}
