import { NextResponse } from "next/server";
import { leggiJsonVault } from "@/lib/vault";
import { messaggioSenzaDato } from "@/lib/esito-lettura";
import { oreDaDataVault } from "@/lib/format";
import { contoMarketplace, dimensioniDaDisegnare } from "@/lib/radiografia-marketplace-conti";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🏪 RADIOGRAFIA MARKETPLACE — l'audit profondo del SITO (13 dimensioni, ogni problema verificato).
// Legge il digest canonico che cervello/radiografia-marketplace-digest.mjs scrive nel vault a
// partire dal raw del workflow `radiografia` (consegne/audit/). €0: solo lettura del vault.

/** Le chiavi di primo livello che la scheda LEGGE. Il resto non attraversa la rete. */
const CAMPI_SCHEDA = ["data", "fonte_raw", "report", "sintesi", "meta", "confronto_precedente"] as const;

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

  // ── IL CONTO SI DERIVA DALLA LISTA, NON SI LEGGE DAL FILE ──────────────────────────────────────
  // Qui c'era `digest.sync_scan?.findings_aperti ?? digest.meta?.findings`, cioè due numeri SCRITTI,
  // e i numeri scritti invecchiano. Misurato il 20/8/2026: `meta` diceva 245 problemi e 12 bloccanti
  // — la fotografia del 18/8, prima di 216 riparazioni — mentre gli aperti veri erano 29 e il
  // bloccante uno solo. In più `sync_scan.findings_aperti` stava per diventare `0` (il riallineatore
  // del giro cercava i problemi nel posto che il referto ha svuotato il 18/8), e `0` non è nullish:
  // avrebbe vinto sul 245 e la Cabina avrebbe detto «nessun problema».
  const conto = contoMarketplace(digest);
  const dimensioni = dimensioniDaDisegnare(digest);

  const scheda: Record<string, unknown> = {};
  for (const k of CAMPI_SCHEDA) if (digest?.[k] != null) scheda[k] = digest[k];

  return NextResponse.json({
    collegato: true,
    ...scheda,
    // Le dimensioni escono coi soli problemi APERTI: i 216 chiusi la scheda li filtrerebbe via
    // all'arrivo, e l'elenco intero pesa ~600 KB riscaricati ogni 30 secondi.
    dimensioni: dimensioni ?? [],
    conto,
    live: {
      data_scan: digest.data || null,
      scan_ore_fa,
      scan_stale: scan_ore_fa != null && scan_ore_fa > 48,
      // `null` quando non ho potuto contare: la scheda mostra «non l'ho potuto vedere», non uno zero.
      findings_aperti: conto.aperti,
      findings_letto: conto.letto,
      findings_motivo: conto.motivo,
      sync_aggiornato: digest.sync_scan?.aggiornato || null,
    },
  });
}
