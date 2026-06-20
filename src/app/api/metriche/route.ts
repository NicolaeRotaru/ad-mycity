import { NextResponse } from "next/server";
import { getMetriche } from "@/lib/marketplace-db";

export const runtime = "nodejs";

// Restituisce le 16 metriche del cruscotto leggendo (sola lettura) il database
// del marketplace. Se non e' collegato, restituisce connected:false.
export async function GET() {
  const m = await getMetriche();
  return NextResponse.json(m);
}
