import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📈 SALUTE ONESTA — «sto migliorando nel tempo?» come RISPOSTA, non come plateau.
// Porta fedele di cervello/salute-onesta.mjs (stesso calcolo, stesse fonti): legge dal vault
// storico-salute.json (voto_pieno ONESTO, non quello creditato) + cantiere-difetti.json (burn-down)
// e serve la serie onesta all'area Cervello. €0: sola lettura del vault. Spec: cervello/salute-onesta.mjs.

const BASE = "90-Memoria-AI/auto-coscienza";

async function leggiJson(rel: string): Promise<any | null> {
  const raw = await readVaultFile(rel);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function giorno(iso: unknown): number | null {
  const t = Date.parse(String(iso || "").slice(0, 10));
  return Number.isNaN(t) ? null : t;
}

export async function GET() {
  const [sj, cj] = await Promise.all([
    leggiJson(`${BASE}/storico-salute.json`),
    leggiJson(`${BASE}/cantiere-difetti.json`),
  ]);
  if (!sj && !cj) {
    return NextResponse.json({
      collegato: false,
      messaggio: "Ancora nessuno storico di salute: la serie onesta cresce a ogni radiografia completa.",
    });
  }

  // (1) SERIE ONESTA (voto_pieno) — identica a salute-onesta.mjs
  const serie: any[] = sj && Array.isArray(sj.serie) ? sj.serie : Array.isArray(sj) ? sj : [];
  const conPieno = serie.filter((s) => s && s.voto_pieno != null);
  const ultimoPieno = conPieno.length ? Number(conPieno[conPieno.length - 1].voto_pieno) : null;
  const primoPieno = conPieno.length ? Number(conPieno[0].voto_pieno) : null;
  const ultimi = conPieno.slice(-10);
  const fermiAZero = ultimi.filter((s) => Number(s.voto_pieno) === 0).length;
  let trend = "n/d";
  if (ultimoPieno != null && primoPieno != null) {
    trend = ultimoPieno > primoPieno ? "in salita" : ultimoPieno < primoPieno ? "in discesa" : "PIATTO";
  }

  // (2) BURN-DOWN CANTIERE — identico a salute-onesta.mjs (ancorato all'ultima data del cantiere)
  const difetti: any[] = cj && Array.isArray(cj.difetti) ? cj.difetti : [];
  const apertiAllaData = (tMs: number) =>
    difetti.filter((d) => {
      const nato = giorno(d.nato);
      if (nato == null || nato > tMs) return false;
      const chiuso = giorno(d.chiuso_il);
      return chiuso == null || chiuso > tMs;
    }).length;
  const dateNote = difetti
    .map((d) => giorno(d.chiuso_il) || giorno(d.nato))
    .filter((x): x is number => x != null);
  const oraMs = dateNote.length ? Math.max(...dateNote) : null;
  const settimanaFaMs = oraMs != null ? oraMs - 7 * 86400000 : null;
  const apertiOra = oraMs != null ? apertiAllaData(oraMs) : (cj?.meta?.aperti ?? null);
  const apertiSettimanaFa = settimanaFaMs != null ? apertiAllaData(settimanaFaMs) : null;
  const burnDown =
    apertiOra != null && apertiSettimanaFa != null ? apertiSettimanaFa - apertiOra : null; // >0 = migliora

  // Sparkline onesto: una voce voto_pieno per giorno (l'ultima), ultime 3 settimane.
  const perGiorno = new Map<string, number>();
  for (const s of conPieno) {
    const g = String(s?.data || "").slice(0, 10);
    if (g) perGiorno.set(g, Number(s.voto_pieno));
  }
  const serieOnesta = [...perGiorno.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-21)
    .map(([data, voto]) => ({ data, voto }));

  return NextResponse.json({
    collegato: true,
    voto_onesto_ultimo: ultimoPieno,
    voto_onesto_trend: trend,
    rilevazioni_con_voto_pieno: conPieno.length,
    su_totale_snapshot: serie.length,
    ultimi10_fermi_a_zero: fermiAZero,
    cantiere_aperti_ora: apertiOra,
    cantiere_aperti_settimana_fa: apertiSettimanaFa,
    burn_down_settimana: burnDown,
    cantiere_meta: cj?.meta ?? null,
    serie_onesta: serieOnesta,
  });
}
