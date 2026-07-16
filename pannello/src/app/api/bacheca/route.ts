import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { vaultToIso } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// La Bacheca della home: avvisi che l'AD appunta in 90-Memoria-AI/BACHECA.md.
// Ogni avviso è un blocco `## <titolo> · AAAA-MM-GG[ HH:MM]` + corpo markdown.

type Avviso = { titolo: string; data: string; testo: string };

const RE_TITOLO = /^##\s+(.+?)\s+·\s+(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)\s*$/;

function parseAvvisi(md: string): Avviso[] {
  const avvisi: Avviso[] = [];
  let cur: Avviso | null = null;
  for (const raw of md.split("\n")) {
    const m = raw.match(RE_TITOLO);
    if (m) {
      if (cur) avvisi.push({ ...cur, testo: cur.testo.trim() });
      cur = { titolo: m[1].trim(), data: m[2].trim(), testo: "" };
      continue;
    }
    if (cur) cur.testo += (cur.testo ? "\n" : "") + raw;
  }
  if (cur) avvisi.push({ ...cur, testo: cur.testo.trim() });
  return avvisi.sort(
    (a, b) => (Date.parse(vaultToIso(b.data)) || 0) - (Date.parse(vaultToIso(a.data)) || 0)
  );
}

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/BACHECA.md");
  if (md == null) return NextResponse.json({ collegato: false, avvisi: [] });
  return NextResponse.json({ collegato: true, avvisi: parseAvvisi(md) });
}
