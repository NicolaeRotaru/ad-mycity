import { NextResponse } from "next/server";
import { getPatternOrari } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Pattern temporali (Ondata 1.4): quando si ordina (ora del giorno + giorno della
// settimana), per pianificare copertura rider e orario di push/post.
export async function GET() {
  const p = await getPatternOrari();
  if (!p.connected) return NextResponse.json({ collegato: false });
  return NextResponse.json({ collegato: true, ...p });
}
