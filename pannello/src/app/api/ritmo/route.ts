import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { vaultToIso } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Voce = { data: string; testo: string };

function tsVoce(s: string): number {
  return Date.parse(vaultToIso(s.trim())) || 0;
}

/** Estrae tutti i blocchi con una certa etichetta e restituisce il più recente per data/ora (Piacenza). */
function ultimoBlocco(md: string, etichetta: string): Voce | null {
  const re = new RegExp(`^##\\s+${etichetta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+·\\s+(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)\\s*$`, "m");
  const righe = md.split("\n");
  const blocchi: Voce[] = [];
  let cur: Voce | null = null;

  for (const raw of righe) {
    const m = raw.match(re);
    if (m) {
      if (cur) blocchi.push(cur);
      cur = { data: m[1], testo: "" };
      continue;
    }
    if (cur && /^##\s+/.test(raw)) {
      blocchi.push(cur);
      cur = null;
      continue;
    }
    if (cur) cur.testo += (cur.testo ? "\n" : "") + raw;
  }
  if (cur) blocchi.push(cur);

  if (!blocchi.length) return null;
  for (const b of blocchi) b.testo = b.testo.trim();

  return blocchi.sort((a, b) => tsVoce(b.data) - tsVoce(a.data))[0];
}

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/RITMO.md");
  if (md == null) return NextResponse.json({ collegato: false, pianoMattino: null, reportSera: null });
  return NextResponse.json({
    collegato: true,
    pianoMattino: ultimoBlocco(md, "Piano del mattino"),
    reportSera: ultimoBlocco(md, "Report della sera"),
  });
}
