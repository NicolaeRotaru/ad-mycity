import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";

// Separa il frontmatter YAML (--- ... ---) dal corpo. Ritorna i campi e il corpo "pulito".
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

// Stato & numeri: il cruscotto STATO.md. Il frontmatter viene tolto dal corpo
// (niente YAML grezzo a schermo) e "aggiornato" è esposto a parte, così il
// pannello lo mostra con data + ora.
export async function GET() {
  const testo = await readVaultFile("90-Memoria-AI/STATO.md");
  if (testo == null) return NextResponse.json({ collegato: false, testo: "", aggiornato: "" });
  const { meta, body } = separaFrontmatter(testo);
  return NextResponse.json({ collegato: true, testo: body, aggiornato: meta.aggiornato || "" });
}
