import { NextResponse } from "next/server";
import { marketplaceSelect, marketplaceDbConnected } from "@/lib/marketplace-db";

export const runtime = "nodejs";

// Liste REALI dal marketplace (SOLA LETTURA), per i moduli del pannello:
//   /api/marketplace/lista?tipo=negozi|clienti|ordini|consegne
// Difensivo sui nomi colonna: seleziona "*" e normalizza scegliendo il primo
// campo "nome-like" disponibile, così funziona a prescindere dallo schema esatto.

type Riga = { titolo: string; sottotitolo?: string; meta?: string; colore?: "verde" | "giallo" | "rosso" };

const CAMPI_NOME = ["shop_name", "store_name", "business_name", "ragione_sociale", "nome", "name", "full_name", "display_name", "username", "email"];
const CAMPI_ORDINE_ID = ["order_number", "numero", "codice", "code", "ref", "id"];

function nomeDa(r: any, fallback: string): string {
  for (const f of CAMPI_NOME) if (r[f]) return String(r[f]);
  const id = r.id != null ? String(r.id).slice(0, 6) : "";
  return fallback + (id ? ` ${id}` : "");
}
function idOrdine(r: any): string {
  for (const f of CAMPI_ORDINE_ID) if (r[f]) return f === "id" ? "#" + String(r[f]).slice(0, 8) : String(r[f]);
  return "ordine";
}
function dataBreve(iso?: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
}
function eur(v: any): string {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? "€ " + n.toLocaleString("it-IT", { maximumFractionDigits: 2 }) : "";
}
function coloreOrdine(o: any): Riga["colore"] {
  if (o.delivery_status === "CANCELED" || o.payment_status === "FAILED") return "rosso";
  if (o.delivery_status === "DELIVERED" || o.payment_status === "PAID") return "verde";
  return "giallo";
}

export async function GET(req: Request) {
  const tipo = new URL(req.url).searchParams.get("tipo") || "";
  if (!marketplaceDbConnected()) return NextResponse.json({ collegato: false, righe: [] });

  let righe: Riga[] = [];

  if (tipo === "negozi") {
    const rows = await marketplaceSelect("profiles", "role=eq.seller&select=*&order=created_at.desc&limit=60");
    righe = rows.map((r) => ({ titolo: nomeDa(r, "Negozio"), sottotitolo: r.created_at ? `iscritto ${dataBreve(r.created_at)}` : undefined }));
  } else if (tipo === "clienti") {
    const rows = await marketplaceSelect("profiles", "role=eq.buyer&select=*&order=created_at.desc&limit=60");
    righe = rows.map((r) => ({ titolo: nomeDa(r, "Cliente"), sottotitolo: r.created_at ? `iscritto ${dataBreve(r.created_at)}` : undefined }));
  } else if (tipo === "ordini") {
    const rows = await marketplaceSelect("orders", "select=*&order=created_at.desc&limit=60");
    righe = rows.map((o) => ({
      titolo: `Ordine ${idOrdine(o)}`,
      sottotitolo: [eur(o.total_price), dataBreve(o.created_at)].filter(Boolean).join(" · "),
      meta: o.delivery_status || o.payment_status || "",
      colore: coloreOrdine(o),
    }));
  } else if (tipo === "consegne") {
    const rows = await marketplaceSelect(
      "orders",
      "select=*&payment_status=neq.FAILED&delivery_status=not.in.(DELIVERED,CANCELED)&order=created_at.desc&limit=60"
    );
    righe = rows.map((o) => ({
      titolo: `Ordine ${idOrdine(o)}`,
      sottotitolo: [eur(o.total_price), dataBreve(o.created_at)].filter(Boolean).join(" · "),
      meta: o.delivery_status || "in corso",
      colore: "giallo",
    }));
  } else {
    return NextResponse.json({ collegato: true, righe: [], error: "tipo non valido" });
  }

  return NextResponse.json({ collegato: true, righe });
}
