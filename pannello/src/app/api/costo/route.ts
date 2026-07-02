import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🪙 COSTO AI — quanto "sforzo" (token/durata) consuma la macchina, per non essere cieca sul proprio
// consumo del piano Max (AR-020). Leggiamo il log che cervello/costo-ai.mjs scrive a fine di ogni run
// (giro, ritmo, monitora) + i giri SALTATI dal delta-gate (AR-019, token 0) per rendere visibile il
// risparmio. €0: nessuna API Claude, solo lettura del vault. Fonte: cervello/costo-ai.mjs.

const REL = "90-Memoria-AI/auto-coscienza/costo-ai.json";

type Voce = { quando?: string; tipo?: string; durata_sec?: number; token?: number | null; modello?: string | null };
type Giorno = { data?: string; runs?: number; token_totali?: number; durata_sec_totale?: number };

export async function GET() {
  const raw = await readVaultFile(REL);
  if (raw == null) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "La macchina non ha ancora registrato il suo consumo. Al primo giro/ritmo dopo l'aggiornamento, cervello/costo-ai.mjs scrive costo-ai.json (token e durata per run).",
    });
  }

  let d: any;
  try {
    d = JSON.parse(raw);
  } catch {
    return NextResponse.json({ collegato: false, messaggio: "Log costo presente ma illeggibile (JSON non valido)." });
  }

  const oggi = d.oggi || { data: "", runs: 0, token_totali: 0, durata_sec_totale: 0, voci: [] };
  const voci: Voce[] = Array.isArray(oggi.voci) ? oggi.voci : [];
  const soglia = Number(d.soglia_giornaliera_token || 0);

  // Sintesi: distingui i giri PIENI (motore acceso) dai giri SALTATI dal delta-gate (0 token).
  const saltati = voci.filter((v) => v?.tipo === "giro-saltato").length;
  const giriPieni = voci.filter((v) => v?.tipo === "giro").length;
  const giriTot = saltati + giriPieni;
  const risparmioGiriPct = giriTot > 0 ? Math.round((saltati / giriTot) * 100) : null;

  // Token per tipo di run oggi (dove va lo sforzo).
  const perTipo: Record<string, { runs: number; token: number; durata_sec: number }> = {};
  for (const v of voci) {
    const k = v?.tipo || "?";
    perTipo[k] = perTipo[k] || { runs: 0, token: 0, durata_sec: 0 };
    perTipo[k].runs += 1;
    perTipo[k].token += Number(v?.token || 0);
    perTipo[k].durata_sec += Number(v?.durata_sec || 0);
  }

  const tokenOggi = Number(oggi.token_totali || 0);
  const sogliaSuperata = soglia > 0 && tokenOggi > soglia;
  const sogliaPct = soglia > 0 ? Math.round((tokenOggi / soglia) * 100) : null;

  return NextResponse.json({
    collegato: true,
    aggiornato: d.aggiornato || null,
    soglia_giornaliera_token: soglia,
    oggi: {
      data: oggi.data || "",
      runs: Number(oggi.runs || 0),
      token_totali: tokenOggi,
      durata_sec_totale: Number(oggi.durata_sec_totale || 0),
      soglia_pct: sogliaPct,
      soglia_superata: sogliaSuperata,
      giri_pieni: giriPieni,
      giri_saltati: saltati,
      risparmio_giri_pct: risparmioGiriPct, // % di giri evitati dal delta-gate (AR-019)
      per_tipo: perTipo,
    },
    storico_giorni: (Array.isArray(d.storico_giorni) ? d.storico_giorni : []).slice(0, 30) as Giorno[],
  });
}
