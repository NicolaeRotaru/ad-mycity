import { NextRequest, NextResponse } from "next/server";
import { listRepoDir, readRepoFile } from "@/lib/vault";
import { vaultGithubInfo } from "@/lib/obsidian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CARTELLA = "memoria-squadra";

export type Esito = { data: string; testo: string };

export type Quaderno = {
  senior: string;
  reparto: string;
  ultimoEsito: Esito | null;
  totaleEsiti: number;
  esiti: Esito[];
};

function repartoDaFrontmatter(md: string, fallback: string): string {
  const m = md.match(/^---[\s\S]*?reparto:\s*(\S+)[\s\S]*?---/m);
  return m?.[1]?.trim() || fallback;
}

function parseEsiti(md: string): Esito[] {
  const out: Esito[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("- ")) continue;
    const corpo = line.slice(2);
    const m = corpo.match(/^(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?)\s*·\s*(.+)$/);
    if (!m) continue;
    out.push({ data: m[1], testo: m[2].trim() });
  }
  return out.sort((a, b) => b.data.localeCompare(a.data));
}

export async function GET(req: NextRequest) {
  const senior = (new URL(req.url).searchParams.get("senior") || "").trim().replace(/\.md$/, "");
  const gh = vaultGithubInfo();

  if (senior) {
    const testo = await readRepoFile(`${CARTELLA}/${senior}.md`);
    if (testo == null) {
      return NextResponse.json({ collegato: gh.collegato, ramo: gh.ramo, repo: gh.repo, quaderno: null }, { status: 404 });
    }
    const esiti = parseEsiti(testo);
    return NextResponse.json({
      collegato: true,
      ramo: gh.ramo,
      repo: gh.repo,
      quaderno: {
        senior,
        reparto: repartoDaFrontmatter(testo, senior),
        ultimoEsito: esiti[0] || null,
        totaleEsiti: esiti.length,
        esiti,
        testo,
      },
    });
  }

  const files = (await listRepoDir(CARTELLA)).filter((f) => f !== "README.md");

  // ⚡ I quaderni sono ~120 file: leggerli UNO A UNO (await in un for) faceva ~120 round-trip
  // GitHub SEQUENZIALI → la lista ci metteva decine di secondi a caricarsi. Li leggiamo in
  // PARALLELO a lotti (pool da 12): stessa quantità di richieste, ma concorrenti → carica in
  // pochi secondi, senza sfondare i limiti secondari di GitHub. (fix «quaderni lentissimi»)
  const LOTTO = 12;
  const quaderni: Quaderno[] = [];
  for (let i = 0; i < files.length; i += LOTTO) {
    const parti = await Promise.all(
      files.slice(i, i + LOTTO).map(async (file): Promise<Quaderno | null> => {
        const nome = file.replace(/\.md$/, "");
        const testo = await readRepoFile(`${CARTELLA}/${file}`);
        if (!testo) return null;
        const esiti = parseEsiti(testo);
        return {
          senior: nome,
          reparto: repartoDaFrontmatter(testo, nome),
          ultimoEsito: esiti[0] || null,
          totaleEsiti: esiti.length,
          esiti: esiti.slice(0, 8),
        };
      }),
    );
    for (const q of parti) if (q) quaderni.push(q);
  }

  quaderni.sort((a, b) => {
    const da = a.ultimoEsito?.data || "";
    const db = b.ultimoEsito?.data || "";
    if (da !== db) return db.localeCompare(da);
    return a.senior.localeCompare(b.senior);
  });

  return NextResponse.json({
    collegato: gh.collegato || quaderni.length > 0,
    ramo: gh.ramo,
    repo: gh.repo,
    quaderni,
  });
}
