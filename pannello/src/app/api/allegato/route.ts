import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📎 Upload degli allegati della chat (foto + file) su Supabase Storage (progetto MEMORIA).
// Il file resta nel bucket privato `chat-allegati`; la chat manda al cervello solo il PERCORSO,
// e il worker sul VPS lo riscarica con la service key per farlo leggere a Claude (Read).
// Nessuna scrittura sul marketplace: è lo stesso DB memoria dei "lavori".

const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = "chat-allegati";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file

// Tipi ammessi: foto che Claude sa GUARDARE + documenti che sa LEGGERE (PDF, testo).
const MIME_OK = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
]);

function stHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY}`,
    ...extra,
  };
}

// Crea il bucket privato se non esiste (idempotente: se c'è già, l'errore si ignora).
// Così la funzione parte da sola senza passaggi manuali sul database.
async function assicuraBucket(): Promise<void> {
  await fetch(`${URL_BASE}/storage/v1/bucket`, {
    method: "POST",
    headers: stHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: false,
      file_size_limit: MAX_BYTES,
    }),
  }).catch(() => {});
}

// Nome file pulito e sicuro (niente path traversal, niente caratteri strani nel percorso storage).
function nomePulito(nome: string): string {
  const base = (nome || "file").split(/[\\/]/).pop() || "file";
  return base.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80) || "file";
}

// iPhone a volte manda file senza MIME: lo deduciamo dall'estensione.
function tipoDaFile(f: File): string {
  const t = f.type?.trim();
  if (t && t !== "application/octet-stream") return t;
  const ext = (f.name.split(".").pop() || "").toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    pdf: "application/pdf",
    txt: "text/plain",
    csv: "text/csv",
    md: "text/markdown",
  };
  return map[ext] || t || "application/octet-stream";
}

export async function POST(req: NextRequest) {
  if (!URL_BASE || !KEY) {
    return NextResponse.json(
      { ok: false, error: "Storage non collegato (mancano SUPABASE_URL / SUPABASE_SERVICE_KEY)." },
      { status: 503 }
    );
  }
  try {
    const form = await req.formData();
    const gruppoId = String(form.get("gruppo_id") || "chat").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 60) || "chat";
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: "Nessun file ricevuto." }, { status: 400 });
    }
    if (files.length > 6) {
      return NextResponse.json({ ok: false, error: "Massimo 6 allegati per messaggio." }, { status: 400 });
    }

    await assicuraBucket();

    const stamp = Date.now();
    const caricati: Array<{ nome: string; tipo: string; percorso: string; dimensione: number }> = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const tipo = tipoDaFile(f);
      if (!MIME_OK.has(tipo)) {
        return NextResponse.json(
          { ok: false, error: `Tipo non ammesso: ${f.name} (${tipo}). Ammessi: foto, PDF, testo.` },
          { status: 415 }
        );
      }
      if (f.size > MAX_BYTES) {
        return NextResponse.json(
          { ok: false, error: `${f.name} supera i 25 MB.` },
          { status: 413 }
        );
      }
      const nome = nomePulito(f.name);
      const percorso = `${BUCKET}/${gruppoId}/${stamp}-${i}-${nome}`;
      const buf = Buffer.from(await f.arrayBuffer());
      const up = await fetch(`${URL_BASE}/storage/v1/object/${percorso}`, {
        method: "POST",
        headers: stHeaders({ "Content-Type": tipo, "x-upsert": "true" }),
        body: buf,
      });
      if (!up.ok) {
        const dettaglio = await up.text().catch(() => "");
        return NextResponse.json(
          { ok: false, error: `Caricamento fallito per ${f.name}. ${dettaglio}`.trim() },
          { status: 502 }
        );
      }
      caricati.push({ nome, tipo, percorso, dimensione: f.size });
    }

    return NextResponse.json({ ok: true, allegati: caricati });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Errore upload." }, { status: 500 });
  }
}
