import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readRepoFile } from "@/lib/vault";
import { obsidianConnected } from "@/lib/obsidian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

// Anteprima grafica in Diretta contenuti — asset in consegne/content/assets/.
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file")?.replace(/^\/+/, "") || "";
  if (!file.startsWith("consegne/content/assets/") || file.includes("..") || !/\.(png|jpe?g|webp|svg)$/i.test(file)) {
    return NextResponse.json({ errore: "percorso non valido" }, { status: 400 });
  }

  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return NextResponse.json({ errore: "tipo non supportato" }, { status: 400 });

  // SVG: leggibile come testo anche da GitHub (produzione).
  if (ext === ".svg" && obsidianConnected()) {
    const txt = await readRepoFile(file);
    if (txt) {
      return new NextResponse(txt, {
        headers: { "Content-Type": mime, "Cache-Control": "public, max-age=300" },
      });
    }
  }

  for (const base of [process.cwd(), path.join(process.cwd(), "..")]) {
    try {
      const buf = await fs.readFile(path.join(base, file));
      return new NextResponse(buf, {
        headers: { "Content-Type": mime, "Cache-Control": "public, max-age=300" },
      });
    } catch {
      /* prova radice successiva */
    }
  }

  return NextResponse.json({ errore: "asset non trovato", file }, { status: 404 });
}
