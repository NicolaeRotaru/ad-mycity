import { NextResponse } from "next/server";
import { readVaultFile, listVaultDir } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// La data scritta sul piano da `cervello/piani-data.mjs`: `corpo` = l'ultima volta che è cambiato
// il TESTO del piano, `nota` = l'ultima volta che l'AD ha rigenerato il suo blocco in fondo.
// Si legge qui, e non nel componente, perché il Pannello possa mostrare «fermo da N giorni» nella
// riga del piano — cioè senza doverli aprire uno per uno per scoprire quali sono fermi.
function dataDelPiano(testo: string): { aggiornato: string | null; nota: string | null } {
  const m = testo.match(/<!--\s*🗓️ AD-DATA (\{.*?\}) -->/);
  if (!m) return { aggiornato: null, nota: null };
  try {
    const d = JSON.parse(m[1]) as { corpo?: string; nota?: string | null };
    return { aggiornato: d.corpo ?? null, nota: d.nota ?? null };
  } catch {
    // Riga manomessa a mano: meglio nessuna data che una data inventata.
    return { aggiornato: null, nota: null };
  }
}

// Piani: i piani del vault (cartella 06-Piani), saltando i file "Prompt - ...".
export async function GET() {
  // I "Prompt - ..." sono ausiliari, non piani.
  const nomi = (await listVaultDir("06-Piani")).filter((n) => !/^prompt/i.test(n));
  // Letture in PARALLELO (era un for sequenziale: 10 file = 10 round-trip GitHub in fila, ~2-6s).
  // Ora un solo batch ≈ 1× latenza. Ordine preservato dal map su `nomi`.
  const testi = await Promise.all(nomi.map((nome) => readVaultFile(`06-Piani/${nome}`)));
  const piani = nomi
    .map((nome, i) => ({ nome, testo: testi[i] }))
    .filter((p) => p.testo)
    .map((p) => ({ nome: p.nome.replace(/\.md$/, ""), testo: p.testo!, ...dataDelPiano(p.testo!) }));
  return NextResponse.json({ collegato: piani.length > 0, piani });
}
