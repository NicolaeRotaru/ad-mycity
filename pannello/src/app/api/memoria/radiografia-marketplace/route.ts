import { NextResponse } from "next/server";
import { leggiJsonVault } from "@/lib/vault";
import { messaggioSenzaDato } from "@/lib/esito-lettura";
import { oreDaDataVault } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🏪 RADIOGRAFIA MARKETPLACE — l'audit profondo del SITO (13 dimensioni, ogni problema verificato).
// Legge il digest canonico che cervello/radiografia-marketplace-digest.mjs scrive nel vault a
// partire dal raw del workflow `radiografia` (consegne/audit/). €0: solo lettura del vault.

export async function GET() {
  // AR-415 — la lettura porta con sé il MOTIVO. Prima un `null` valeva insieme «la radiografia non
  // è mai stata fatta» e «l'archivio non l'ho potuto leggere», e a schermo usciva sempre la prima:
  // un invito a rifare un lavoro che magari era già stato fatto.
  const l = await leggiJsonVault<any>("90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");
  const digest = l.dati;
  if (!digest) {
    return NextResponse.json({
      collegato: false,
      ...messaggioSenzaDato(
        l,
        "Nessuna radiografia del marketplace nel vault. Lancia «radiografia» (workflow radiografia, 13 dimensioni) e poi `node cervello/radiografia-marketplace-digest.mjs` per allineare i dati.",
      ),
    });
  }
  // AR-414 — l'età si calcola con la funzione condivisa, che chiede a Europe/Rome il fuso di QUELLA
  // data. Qui c'era `+02:00` scritto a mano: d'inverno faceva sembrare lo scan vecchio di un'ora in più
  // del vero, e `scan_stale` (48 ore) scattava un'ora prima.
  const ore = oreDaDataVault(digest.data);
  const scan_ore_fa: number | null = ore == null ? null : Math.round(ore);
  return NextResponse.json({
    collegato: true,
    ...digest,
    live: {
      data_scan: digest.data || null,
      scan_ore_fa,
      scan_stale: scan_ore_fa != null && scan_ore_fa > 48,
      findings_aperti: digest.sync_scan?.findings_aperti ?? digest.meta?.findings ?? null,
      sync_aggiornato: digest.sync_scan?.aggiornato || null,
    },
  });
}
