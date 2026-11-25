import { NextResponse } from "next/server";
import { listVaultDir, readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

// Il file vivo tiene solo il mese in corso; i mesi chiusi stanno in Archivio/DECISIONI/AAAA-MM.md
// (cervello/archivio-decisioni.mjs, 25/11). Lo storico li legge tutti: archivio in ordine di mese,
// poi il file vivo, così «più recenti in cima» resta vero dopo il reverse.
const ARCHIVIO = "90-Memoria-AI/Archivio/DECISIONI";

export async function GET() {
  const [md, mesi] = await Promise.all([
    readVaultFile("90-Memoria-AI/DECISIONI.md"),
    listVaultDir(ARCHIVIO).catch(() => [] as string[]),
  ]);
  if (md == null) return NextResponse.json({ collegato: false, decisioni: [] });
  const archivio = await Promise.all(
    mesi.filter((f) => /^\d{4}-\d{2}\.md$/.test(f)).sort().map((f) => readVaultFile(`${ARCHIVIO}/${f}`))
  );
  const tutto = [...archivio.filter((t): t is string => t != null), md].join("\n");
  return NextResponse.json({ collegato: true, decisioni: parse(tutto) });
}
