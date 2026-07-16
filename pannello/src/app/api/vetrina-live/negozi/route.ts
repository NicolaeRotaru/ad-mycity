import { NextResponse } from "next/server";
import { marketplaceSelect, marketplaceDbConnected } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🏪 Lista negozi (SOLA LETTURA) per la Vetrina live: id + nome, per scegliere in quale
// negozio caricare i prodotti. Nessuna scrittura. Difensivo sul nome (schema può variare).
const CAMPI_NOME = ["store_name", "shop_name", "business_name", "ragione_sociale", "nome", "name", "full_name"];

function nomeDa(r: any): string {
  for (const f of CAMPI_NOME) if (r[f]) return String(r[f]);
  const id = r.id != null ? String(r.id).slice(0, 6) : "";
  return "Negozio" + (id ? ` ${id}` : "");
}

export async function GET() {
  if (!marketplaceDbConnected()) {
    return NextResponse.json({ collegato: false, negozi: [] });
  }
  try {
    const rows = await marketplaceSelect("profiles", "role=eq.seller&select=*&order=created_at.desc&limit=200");
    const negozi = rows.map((r) => ({ id: String(r.id), nome: nomeDa(r) }));
    return NextResponse.json({ collegato: true, negozi });
  } catch (e: any) {
    return NextResponse.json({ collegato: true, negozi: [], errore: e?.message || "Errore lettura negozi." }, { status: 502 });
  }
}
