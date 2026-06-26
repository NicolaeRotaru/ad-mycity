import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";

// OKR / pagella squadra: parsa la tabella di 05-Soldi-Rischi/OKR-Squadra.md
// (Senior | KPI che possiede | Target | Budget) + la North Star dalle righe ">".
export type Okr = { senior: string; kpi: string; target: string; budget: string };

function parse(md: string): { northStar: string; righe: Okr[] } {
  const pulito = md.replace(/<!--[\s\S]*?-->/g, "");
  const righe: Okr[] = [];
  let northStar = "";
  for (const raw of pulito.split("\n")) {
    const line = raw.trim();
    if (!northStar && /north star/i.test(line)) {
      northStar = line.replace(/^>\s*/, "").replace(/\*\*/g, "").trim();
    }
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    if (/^-+$/.test(cells[0])) continue; // separatore ---
    if (/^senior$/i.test(cells[0])) continue; // intestazione
    righe.push({ senior: cells[0], kpi: cells[1], target: cells[2], budget: cells[3] });
  }
  return { northStar, righe };
}

export async function GET() {
  const md = await readVaultFile("05-Soldi-Rischi/OKR-Squadra.md");
  if (md == null) return NextResponse.json({ collegato: false, northStar: "", righe: [] });
  return NextResponse.json({ collegato: true, ...parse(md) });
}
