import { NextRequest, NextResponse } from "next/server";
import { listVaultDirEntries, readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Ricerca globale nel vault (memoria + conoscenza). Cerca la query nelle cartelle chiave — RICORSIVAMENTE,
// così trova anche i file nelle sottocartelle (Briefing, Intelligence, Report, memoria-squadra: l'output più
// importante del giro). Cap PER-CARTELLA così ogni radice viene comunque toccata, anche con vault in crescita.
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
const MAX_FILE_PER_CARTELLA = 60;
const MAX_PROFONDITA = 3;
const MAX_RISULTATI = 50;

export async function GET(req: NextRequest) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ q, risultati: [] });

  const risultati: { file: string; riga: string }[] = [];

  // Cammina una cartella e le sue sottocartelle, leggendo i .md e cercando la query.
  async function cammina(dir: string, restanti: { n: number }, prof: number): Promise<void> {
    if (prof > MAX_PROFONDITA || restanti.n <= 0 || risultati.length >= MAX_RISULTATI) return;
    const entries = await listVaultDirEntries(dir);
    // Prima i file, poi scendi nelle sottocartelle.
    for (const e of entries) {
      if (e.type !== "file") continue;
      if (restanti.n <= 0 || risultati.length >= MAX_RISULTATI) return;
      const testo = await readVaultFile(`${dir}/${e.name}`);
      restanti.n--;
      if (!testo) continue;
      const lc = testo.toLowerCase();
      if (!lc.includes(q)) continue;
      const riga = testo.split("\n").find((l) => l.toLowerCase().includes(q)) || "";
      risultati.push({ file: `${dir}/${e.name}`, riga: riga.trim().slice(0, 200) });
    }
    for (const e of entries) {
      if (e.type !== "dir") continue;
      if (restanti.n <= 0 || risultati.length >= MAX_RISULTATI) return;
      await cammina(`${dir}/${e.name}`, restanti, prof + 1);
    }
  }

  for (const dir of CARTELLE) {
    if (risultati.length >= MAX_RISULTATI) break;
    await cammina(dir, { n: MAX_FILE_PER_CARTELLA }, 0);
  }

  return NextResponse.json({ q, risultati });
}
