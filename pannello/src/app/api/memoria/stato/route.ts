import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";

// Stato & numeri: il cruscotto STATO.md (markdown grezzo, reso lato pannello).
export async function GET() {
  const testo = await readVaultFile("90-Memoria-AI/STATO.md");
  return NextResponse.json({ collegato: testo != null, testo: testo ?? "" });
}
