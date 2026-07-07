import { NextResponse } from "next/server";
import { readVaultFile, listVaultDir, codaTesto } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    .map((p) => ({ nome: p.nome.replace(/\.md$/, ""), testo: codaTesto(p.testo!, 12000) }));
  return NextResponse.json({ collegato: piani.length > 0, piani });
}
