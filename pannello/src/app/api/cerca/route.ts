import { NextRequest, NextResponse } from "next/server";
import { listVaultDir, readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";

// Ricerca globale nel vault (memoria + conoscenza). Cerca la query nelle cartelle
// chiave e restituisce, per ogni file che la contiene, la prima riga che combacia.
// Cap sui file letti per non sovraccaricare la GitHub API in produzione.
const CARTELLE = [
  "90-Memoria-AI",
  "06-Piani",
  "01-Strategia",
  "02-Mercato",
  "03-Clienti",
  "04-Prodotto-Ops",
  "05-Soldi-Rischi",
  "07-Agenti",
];
const MAX_FILE = 40;
const MAX_RISULTATI = 40;

export async function GET(req: NextRequest) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ q, risultati: [] });

  const risultati: { file: string; riga: string }[] = [];
  let lettiTot = 0;

  for (const dir of CARTELLE) {
    if (lettiTot >= MAX_FILE || risultati.length >= MAX_RISULTATI) break;
    const files = await listVaultDir(dir);
    for (const f of files) {
      if (lettiTot >= MAX_FILE || risultati.length >= MAX_RISULTATI) break;
      const testo = await readVaultFile(`${dir}/${f}`);
      lettiTot++;
      if (!testo) continue;
      const lc = testo.toLowerCase();
      if (!lc.includes(q)) continue;
      const riga = testo.split("\n").find((l) => l.toLowerCase().includes(q)) || "";
      risultati.push({ file: `${dir}/${f}`, riga: riga.trim().slice(0, 200) });
    }
  }

  return NextResponse.json({ q, risultati });
}
