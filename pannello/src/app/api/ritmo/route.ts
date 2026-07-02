import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { giornoRoma, vaultToIso } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Voce = { data: string; testo: string; oggi: boolean };

function tsVoce(s: string): number {
  return Date.parse(vaultToIso(s.trim())) || 0;
}

function estraiData(riga: string, etichetta: string): string | null {
  const esc = etichetta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^##\\s+${esc}\\s+·\\s+(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)\\s*$`);
  const m = riga.match(re);
  return m ? m[1].trim() : null;
}

/** Tutti i blocchi per etichetta; preferisce il più recente di OGGI (Piacenza), altrimenti l'ultimo assoluto. */
function scegliBlocco(md: string, etichetta: string): Voce | null {
  const righe = md.split("\n");
  const blocchi: Voce[] = [];
  let cur: { data: string; testo: string } | null = null;

  for (const raw of righe) {
    const data = estraiData(raw, etichetta);
    if (data) {
      if (cur) blocchi.push({ ...cur, oggi: cur.data.slice(0, 10) === giornoRoma() });
      cur = { data, testo: "" };
      continue;
    }
    if (cur && /^##\s+/.test(raw)) {
      blocchi.push({ ...cur, oggi: cur.data.slice(0, 10) === giornoRoma() });
      cur = null;
      continue;
    }
    if (cur) cur.testo += (cur.testo ? "\n" : "") + raw;
  }
  if (cur) blocchi.push({ ...cur, oggi: cur.data.slice(0, 10) === giornoRoma() });

  if (!blocchi.length) return null;
  for (const b of blocchi) b.testo = b.testo.trim();

  const oggi = giornoRoma();
  const diOggi = blocchi.filter((b) => b.data.slice(0, 10) === oggi);
  const pool = diOggi.length ? diOggi : blocchi;
  const scelto = pool.sort((a, b) => tsVoce(b.data) - tsVoce(a.data))[0];
  return { ...scelto, oggi: scelto.data.slice(0, 10) === oggi };
}

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/RITMO.md");
  if (md == null) return NextResponse.json({ collegato: false, pianoMattino: null, reportSera: null });
  return NextResponse.json({
    collegato: true,
    pianoMattino: scegliBlocco(md, "Piano del mattino"),
    reportSera: scegliBlocco(md, "Report della sera"),
  });
}
