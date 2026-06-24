import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";

// Storico decisioni: parsa DECISIONI.md (righe "data · colore · [reparto] · cosa · perché · stato · firma").
export type Decisione = {
  data: string;
  colore: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  reparto: string;
  cosa: string;
  perche: string;
  stato: string;
  firma: string;
};

function livelloDi(c: string): Decisione["livello"] {
  if (c.includes("🟢")) return "verde";
  if (c.includes("🟡")) return "giallo";
  if (c.includes("🔴")) return "rosso";
  return "?";
}

function parse(md: string): Decisione[] {
  const out: Decisione[] = [];
  const pulito = md.replace(/<!--[\s\S]*?-->/g, "");
  for (const raw of pulito.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("- ")) continue;
    const parts = line.slice(2).split("·").map((s) => s.trim());
    if (parts.length < 4) continue;
    if (!/^\d{4}-\d{2}-\d{2}/.test(parts[0])) continue;
    out.push({
      data: parts[0],
      colore: parts[1] || "",
      livello: livelloDi(parts[1] || ""),
      reparto: (parts[2] || "").replace(/^\[|\]$/g, ""),
      cosa: parts[3] || "",
      perche: parts[4] || "",
      stato: parts[5] || "",
      firma: parts[6] || "",
    });
  }
  return out.reverse(); // più recenti in cima
}

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/DECISIONI.md");
  if (md == null) return NextResponse.json({ collegato: false, decisioni: [] });
  return NextResponse.json({ collegato: true, decisioni: parse(md) });
}
