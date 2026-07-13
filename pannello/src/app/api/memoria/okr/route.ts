import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// OKR / pagella squadra: parsa la tabella di 05-Soldi-Rischi/OKR-Squadra.md
// (Senior | KPI che possiede | Target | Budget) + la North Star dalle righe ">".
export type Okr = { senior: string; kpi: string; target: string; budget: string };

function separaFrontmatter(md: string): { meta: Record<string, string>; body: string } {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: md };
  const meta: Record<string, string> = {};
  for (const riga of m[1].split("\n")) {
    const kv = riga.match(/^\s*([\w-]+):\s*(.+?)\s*$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2] };
}

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
  if (md == null) return NextResponse.json({ collegato: false, northStar: "", righe: [], aggiornato: "" });
  const { meta, body } = separaFrontmatter(md);
  return NextResponse.json({ collegato: true, aggiornato: meta.aggiornato || "", ...parse(body) });
}
