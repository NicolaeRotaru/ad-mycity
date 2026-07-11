import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🏪 RADIOGRAFIA MARKETPLACE — l'audit profondo del SITO (13 dimensioni, ogni problema verificato).
// Legge il digest canonico che cervello/radiografia-marketplace-digest.mjs scrive nel vault a
// partire dal raw del workflow `radiografia` (consegne/audit/). €0: solo lettura del vault.

export async function GET() {
  const raw = await readVaultFile("90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");
  let digest: any = null;
  try {
    digest = raw ? JSON.parse(raw) : null;
  } catch {
    digest = null;
  }
  if (!digest) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "Nessuna radiografia del marketplace nel vault. Lancia «radiografia» (workflow radiografia, 13 dimensioni) e poi `node cervello/radiografia-marketplace-digest.mjs` per allineare i dati.",
    });
  }
  return NextResponse.json({ collegato: true, ...digest });
}
