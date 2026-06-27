import { NextRequest, NextResponse } from "next/server";
import { readRepoFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📄 Scheda completa di un'azione: legge il documento VERO che il senior eseguirà
// (di solito in consegne/...), così Nicola vede con precisione cosa contiene l'azione
// prima di approvarla. Sola lettura, e SOLO dentro consegne/ o creativi/ (niente path traversal).
export async function GET(req: NextRequest) {
  const raw = (new URL(req.url).searchParams.get("path") || "").trim();
  // Sicurezza: solo file .md dentro consegne/ o creativi/, niente ".." né path assoluti.
  if (!/^(consegne|creativi)\/[A-Za-z0-9 _./-]+\.md$/.test(raw) || raw.includes("..")) {
    return NextResponse.json({ ok: false, error: "Percorso non valido." }, { status: 400 });
  }
  const testo = await readRepoFile(raw);
  if (testo == null) return NextResponse.json({ ok: false, error: "Documento non trovato.", path: raw });
  return NextResponse.json({ ok: true, path: raw, testo });
}
