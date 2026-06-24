import { NextResponse } from "next/server";
import { readVaultFile, listVaultDir, codaTesto } from "@/lib/vault";

export const runtime = "nodejs";

// Piani: i piani del vault (cartella 06-Piani), saltando i file "Prompt - ...".
export async function GET() {
  const files = await listVaultDir("06-Piani");
  const piani: { nome: string; testo: string }[] = [];
  for (const nome of files) {
    if (/^prompt/i.test(nome)) continue; // i "Prompt - ..." sono ausiliari, non piani
    const testo = await readVaultFile(`06-Piani/${nome}`);
    if (testo) piani.push({ nome: nome.replace(/\.md$/, ""), testo: codaTesto(testo, 12000) });
  }
  return NextResponse.json({ collegato: piani.length > 0, piani });
}
