import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readRepoFile } from "@/lib/vault";
import { obsidianConnected, listDir, listDirEntries } from "@/lib/obsidian";

// 📄 I documenti dell'AD (cartella consegne/): radiografie, piani, audit, report.
// Il Pannello finora leggeva solo il vault (MyCity-Vault/) e il DB del marketplace:
// tutto ciò che l'AD PRODUCE (consegne/*) restava invisibile qui. Questa API li rende
// leggibili nel Pannello — così quando l'AD dice "vedi il §6 del piano" hai dove aprirlo.
// Legge da disco in locale e da GitHub (ramo memoria-ad) in produzione, come il resto.

export const dynamic = "force-dynamic";

// Nome leggibile da un filename: toglie il prefisso data e l'estensione, spazia i separatori.
function titoloDaFile(name: string): string {
  let s = name.replace(/\.md$/i, "");
  s = s.replace(/^\d{4}-\d{2}-\d{2}[-_]?/, ""); // togli prefisso data AAAA-MM-GG
  s = s.replace(/[-_]+/g, " ").trim();
  if (!s) return name.replace(/\.md$/i, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Data da un filename (prefisso AAAA-MM-GG) o null.
function dataDaFile(name: string): string | null {
  const m = name.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

// Etichetta leggibile per la categoria (sottocartella di consegne/).
const ETICHETTE: Record<string, string> = {
  audit: "🔬 Audit & radiografie",
  bonifica: "🛠️ Piani di bonifica",
  design: "🎨 Design",
  marketing: "📣 Marketing",
  intelligence: "🔎 Intelligence",
  content: "✍️ Contenuti",
  collaudo: "🧪 Collaudo",
  strategia: "🧭 Strategia",
  marketplace: "🏪 Marketplace",
  vendite: "🤝 Vendite",
  onboarding: "🏬 Onboarding",
  finanza: "💶 Finanza",
  legale: "⚖️ Legale",
  seo: "🔍 SEO",
  crm: "🔁 CRM",
  operations: "🛵 Operazioni",
  video: "🎬 Video",
  pr: "📰 PR & stampa",
  "customer-success": "🤗 Customer success",
  "relazioni-istituzionali": "🏛️ Relazioni istituzionali",
  automazioni: "🧰 Automazioni",
  decisioni: "🗂️ Decisioni",
};

const ROOT_CONSEGNE = "consegne";

// Elenca le sottocartelle di consegne/ e i file .md dentro ciascuna.
async function elencaCategorie(): Promise<{ cat: string; files: string[] }[]> {
  // PRODUZIONE (GitHub): scopri le sottocartelle con listDirEntries, poi i .md con listDir.
  if (obsidianConnected()) {
    const entries = (await listDirEntries(ROOT_CONSEGNE)) || [];
    const dirs = entries.filter((e) => e.type === "dir").map((e) => e.name);
    const out: { cat: string; files: string[] }[] = [];
    for (const d of dirs) {
      const files = (await listDir(`${ROOT_CONSEGNE}/${d}`)) || [];
      if (files.length) out.push({ cat: d, files });
    }
    // File .md direttamente in consegne/ (senza sottocartella)
    const rootFiles = (await listDir(ROOT_CONSEGNE)) || [];
    if (rootFiles.length) out.push({ cat: "", files: rootFiles });
    return out;
  }
  // LOCALE (monorepo): cammina consegne/ da disco (cwd = radice o pannello/).
  for (const base of [process.cwd(), path.join(process.cwd(), "..")]) {
    const dir = path.join(base, ROOT_CONSEGNE);
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const out: { cat: string; files: string[] }[] = [];
      const rootMd = entries.filter((e) => e.isFile() && e.name.endsWith(".md")).map((e) => e.name).sort();
      for (const e of entries.filter((x) => x.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
        try {
          const files = (await fs.readdir(path.join(dir, e.name))).filter((n) => n.endsWith(".md")).sort();
          if (files.length) out.push({ cat: e.name, files });
        } catch {
          /* salto */
        }
      }
      if (rootMd.length) out.push({ cat: "", files: rootMd });
      if (out.length) return out;
    } catch {
      /* provo la radice successiva */
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");

  // Dettaglio: contenuto markdown di un documento.
  if (file) {
    // sicurezza: solo dentro consegne/, niente traversal
    const rel = file.replace(/^\/+/, "");
    if (rel.includes("..") || !/\.md$/i.test(rel)) {
      return NextResponse.json({ errore: "percorso non valido" }, { status: 400 });
    }
    const full = rel.startsWith(`${ROOT_CONSEGNE}/`) ? rel : `${ROOT_CONSEGNE}/${rel}`;
    const contenuto = await readRepoFile(full);
    if (contenuto == null) {
      return NextResponse.json({ errore: "documento non trovato", file: full }, { status: 404 });
    }
    return NextResponse.json({ file: full, contenuto });
  }

  // Lista: tutti i documenti raggruppati per categoria, più recenti in cima.
  const cats = await elencaCategorie();
  const gruppi = cats.map(({ cat, files }) => ({
    categoria: cat,
    etichetta: cat ? ETICHETTE[cat] || `📁 ${cat}` : "📄 Radice",
    documenti: files
      .map((name) => ({
        file: cat ? `${cat}/${name}` : name,
        nome: name,
        titolo: titoloDaFile(name),
        data: dataDaFile(name),
      }))
      .sort((a, b) => (b.data || "").localeCompare(a.data || "") || a.nome.localeCompare(b.nome)),
  }));

  // Ordina i gruppi: prima quelli con documenti più recenti.
  gruppi.sort((a, b) => {
    const da = a.documenti[0]?.data || "";
    const db = b.documenti[0]?.data || "";
    return db.localeCompare(da);
  });

  // Elenco piatto "più recenti" per la Plancia.
  const tutti = gruppi.flatMap((g) =>
    g.documenti.map((d) => ({ ...d, categoria: g.categoria, etichetta: g.etichetta }))
  );
  const recenti = [...tutti].sort((a, b) => (b.data || "").localeCompare(a.data || "")).slice(0, 6);

  return NextResponse.json({
    gruppi,
    recenti,
    totale: tutti.length,
    fonte: obsidianConnected() ? "github" : "disco",
  });
}
