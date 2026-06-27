import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Il "ritmo" del giorno: l'ultimo Piano del mattino e l'ultimo Report della sera,
// dal vault (90-Memoria-AI/RITMO.md). Blocchi "## Piano del mattino · AAAA-MM-GG".
type Voce = { data: string; testo: string };

function ultimoBlocco(md: string, etichetta: string): Voce | null {
  // Data con ora opzionale: "AAAA-MM-GG" oppure "AAAA-MM-GG HH:MM".
  const re = new RegExp(`^##\\s+${etichetta}\\s+·\\s+(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)\\s*$`);
  const righe = md.split("\n");
  let trovato: Voce | null = null;
  let cur: Voce | null = null;
  for (const raw of righe) {
    const m = raw.match(re);
    if (m) {
      cur = { data: m[1], testo: "" };
      trovato = cur; // l'ultimo blocco con questa etichetta vince
      continue;
    }
    // chiude il blocco corrente quando incontra un'altra intestazione
    if (cur && /^##\s+/.test(raw)) cur = null;
    if (cur) cur.testo += (cur.testo ? "\n" : "") + raw;
  }
  if (trovato) trovato.testo = trovato.testo.trim();
  return trovato;
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
