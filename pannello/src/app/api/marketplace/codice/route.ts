import { NextResponse } from "next/server";
import {
  marketplaceGithubInfo,
  listMarketplaceFilePaths,
  readMarketplaceFileContent,
  testMarketplaceGithub,
} from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lettura SOLA-LETTURA del codice del marketplace (repo NicolaeRotaru/mycity) via GitHub API.
//
//   GET /api/marketplace/codice              → stato collegamento + test token
//   GET /api/marketplace/codice?azione=lista → elenco percorsi file
//   GET /api/marketplace/codice?path=src/... → contenuto di un file

export async function GET(req: Request) {
  const url = new URL(req.url);
  const azione = url.searchParams.get("azione");
  const path = url.searchParams.get("path")?.trim() || "";
  const info = marketplaceGithubInfo();

  if (path) {
    if (!info.collegato) {
      return NextResponse.json({
        collegato: false,
        ramo: info.ramo,
        repo: info.repo,
        errore: "GitHub non configurato (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)",
      });
    }
    const file = await readMarketplaceFileContent(path);
    if (!file.ok) {
      return NextResponse.json(
        { ...info, collegato: true, errore: file.errore },
        { status: file.errore.includes("non trovato") ? 404 : 502 }
      );
    }
    return NextResponse.json({ ...info, collegato: true, ...file });
  }

  if (azione === "lista") {
    if (!info.collegato) {
      return NextResponse.json({ ...info, collegato: false, file: [] });
    }
    const lista = await listMarketplaceFilePaths();
    if (!lista.ok) {
      return NextResponse.json(
        { ...info, collegato: true, file: [], errore: lista.errore },
        { status: 502 }
      );
    }
    return NextResponse.json({ ...info, collegato: true, totale: lista.file.length, file: lista.file });
  }

  const test = info.collegato ? await testMarketplaceGithub() : null;
  return NextResponse.json({
    ...info,
    collegato: Boolean(info.collegato && test?.ok),
    configurato: info.collegato,
    accesso: test?.ok ?? false,
    dettaglio: test?.dettaglio ?? "mancano GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO",
  });
}
