import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Coda da approvare: legge e parsa la tabella di AZIONI-IN-ATTESA.md.
export type AzioneAttesa = {
  numero: string;
  data: string;
  reparto: string;
  azione: string;
  colore: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  contenuto: string;
  canale: string;
  stato: string;
  inAttesa: boolean;
};

function livelloDi(c: string): AzioneAttesa["livello"] {
  if (c.includes("🟢")) return "verde";
  if (c.includes("🟡")) return "giallo";
  if (c.includes("🔴")) return "rosso";
  return "?";
}

function parseAzioni(md: string): AzioneAttesa[] {
  const out: AzioneAttesa[] = [];
  // Via i commenti HTML (contengono righe-esempio che non sono azioni vere).
  const pulito = md.replace(/<!--[\s\S]*?-->/g, "");
  for (const raw of pulito.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 8) continue;
    const numero = cells[0];
    if (!/^\d+$/.test(numero)) continue; // salta intestazione e separatori
    const stato = cells[7];
    out.push({
      numero,
      data: cells[1],
      reparto: cells[2],
      azione: cells[3],
      colore: cells[4],
      livello: livelloDi(cells[4]),
      contenuto: cells[5],
      canale: cells[6],
      stato,
      inAttesa: /attesa/i.test(stato),
    });
  }
  return out;
}

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/AZIONI-IN-ATTESA.md");
  if (md == null) return NextResponse.json({ collegato: false, azioni: [] });
  return NextResponse.json({ collegato: true, azioni: parseAzioni(md) });
}
