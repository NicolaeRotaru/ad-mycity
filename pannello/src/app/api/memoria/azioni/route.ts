import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { parseAzioniAttesa, type AzioneAttesa } from "@/lib/azioni-attesa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Coda da approvare: legge e parsa AZIONI-IN-ATTESA.md (tabella a 8 colonne + sezioni ##/###).
export type { AzioneAttesa };

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/AZIONI-IN-ATTESA.md");
  if (md == null) return NextResponse.json({ collegato: false, azioni: [] });
  return NextResponse.json({ collegato: true, azioni: parseAzioniAttesa(md) });
}
