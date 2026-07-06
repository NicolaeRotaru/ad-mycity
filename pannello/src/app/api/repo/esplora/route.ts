import { NextResponse } from "next/server";
import { esploraPath } from "@/lib/obsidian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Esplora QUALSIASI percorso del repo sul ramo che il Pannello legge (main, ramo unico).
// ?path=  vuoto → radice · cartella → elenco voci · file → contenuto.
// È la "vista specchio" del repo: ciò che c'è su GitHub è raggiungibile dal Pannello.
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get("path") || "";
  const res = await esploraPath(path);
  return NextResponse.json(res);
}
