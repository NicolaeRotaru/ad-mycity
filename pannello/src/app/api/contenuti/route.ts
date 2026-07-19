import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readRepoFile, readVaultFile } from "@/lib/vault";
import { obsidianConnected, listDir, listDirEntries } from "@/lib/obsidian";
import { vaultToIso } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📡 DIRETTA CONTENUTI — l'unico posto dove Nicola vede, in tempo reale e ordinati al
// minuto, i CONTENUTI che il worker sforna: post, bozze, dossier, audit, piani (consegne/*)
// insieme ai briefing/report/intelligence del vault. Il "Lavori" mostra la coda dei compiti;
// il "Feed" mostra le righe di attività; qui invece si vede il PRODOTTO finito man mano che
// appare, con titolo, reparto, colore 🟢🟡🔴, orario preciso ed estratto — clicca e leggi tutto.
// Legge da disco in locale e da GitHub (ramo unico main) in produzione, come il resto del Pannello.

// Quante schede leggere davvero (frontmatter + estratto) a ogni giro: le più fresche per
// nome/data-file. Tetto per non martellare la GitHub API in produzione a ogni poll.
const MAX_LETTURE = 30;

const ROOT_CONSEGNE = "consegne";

// Sorgenti del vault (memoria AI) che contengono contenuti prodotti dal worker.
const SORGENTI_VAULT: { dir: string; cat: string }[] = [
  { dir: "90-Memoria-AI/Briefing", cat: "briefing" },
  { dir: "90-Memoria-AI/Report", cat: "report" },
  { dir: "90-Memoria-AI/Intelligence", cat: "intelligence-vault" },
];

// Etichetta + emoji per categoria (sottocartella di consegne/ o sorgente vault).
const ETICHETTE: Record<string, { emoji: string; label: string }> = {
  "": { emoji: "📄", label: "Radice" },
  audit: { emoji: "🔬", label: "Audit & radiografie" },
  bonifica: { emoji: "🛠️", label: "Bonifica" },
  design: { emoji: "🎨", label: "Design" },
  marketing: { emoji: "📣", label: "Marketing" },
  intelligence: { emoji: "🔎", label: "Intelligence" },
  "intelligence-vault": { emoji: "🔎", label: "Intelligence" },
  content: { emoji: "✍️", label: "Contenuti" },
  collaudo: { emoji: "🧪", label: "Collaudo" },
  strategia: { emoji: "🧭", label: "Strategia" },
  marketplace: { emoji: "🏪", label: "Marketplace" },
  vendite: { emoji: "🤝", label: "Vendite" },
  onboarding: { emoji: "🏬", label: "Onboarding" },
  finanza: { emoji: "💶", label: "Finanza" },
  legale: { emoji: "⚖️", label: "Legale" },
  seo: { emoji: "🔍", label: "SEO" },
  crm: { emoji: "🔁", label: "CRM" },
  operations: { emoji: "🛵", label: "Operazioni" },
  video: { emoji: "🎬", label: "Video" },
  pr: { emoji: "📰", label: "PR & stampa" },
  "customer-success": { emoji: "🤗", label: "Customer success" },
  "account-negozi": { emoji: "💚", label: "Account negozi" },
  "relazioni-istituzionali": { emoji: "🏛️", label: "Relazioni istituzionali" },
  automazioni: { emoji: "🧰", label: "Automazioni" },
  decisioni: { emoji: "🗂️", label: "Decisioni" },
  growth: { emoji: "🚀", label: "Growth" },
  analista: { emoji: "📊", label: "Analista" },
  devops: { emoji: "🚢", label: "DevOps" },
  qa: { emoji: "✅", label: "QA" },
  supervisione: { emoji: "🛡️", label: "Supervisione negozi" },
  briefing: { emoji: "🔭", label: "Giro / Briefing" },
  report: { emoji: "🧾", label: "Report" },
};

function etichetta(cat: string): { emoji: string; label: string } {
  return ETICHETTE[cat] || { emoji: "📁", label: cat };
}

// Nome leggibile da un filename: toglie il prefisso data e l'estensione, spazia i separatori.
function titoloDaFile(name: string): string {
  let s = name.replace(/\.md$/i, "");
  s = s.replace(/^\d{4}-\d{2}-\d{2}(?:[-_ ]\d{2}[:.]?\d{2})?[-_]?/, ""); // togli prefisso data (+ora)
  s = s.replace(/[-_]+/g, " ").trim();
  if (!s) return name.replace(/\.md$/i, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Data da un filename (prefisso AAAA-MM-GG, eventualmente con -HHMM) o "".
function dataDaFile(name: string): string {
  const m = name.match(/(\d{4}-\d{2}-\d{2})(?:[-_ ](\d{2})[:.]?(\d{2}))?/);
  if (!m) return "";
  return m[2] ? `${m[1]} ${m[2]}:${m[3]}` : m[1];
}

// Frontmatter YAML piatto (chiave: valore) → mappa. Solo il primo blocco --- … ---.
function frontmatter(md: string): Record<string, string> {
  const fm = md.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fm) return {};
  const out: Record<string, string> = {};
  for (const riga of fm[1].split("\n")) {
    const m = riga.match(/^\s*([a-zA-Z_][\w-]*):\s*(.*?)\s*$/);
    if (m) out[m[1].toLowerCase()] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

// Colore 🟢🟡🔴 da una stringa (campo colore del frontmatter). "" se assente.
function coloreDa(s: string): string {
  if (/🔴/.test(s)) return "🔴";
  if (/🟡/.test(s)) return "🟡";
  if (/🟢/.test(s)) return "🟢";
  return "";
}

// Corpo senza frontmatter, senza heading iniziali, ridotto a un estratto pulito di ~220 caratteri.
function estratto(md: string): string {
  let body = md.replace(/^---\s*\n[\s\S]*?\n---\s*/, "");
  const righe = body
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r && !/^#{1,6}\s/.test(r) && !/^[-=]{3,}$/.test(r) && !/^>?\s*<!--/.test(r));
  const testo = righe.join(" ").replace(/\s+/g, " ").replace(/[*_`>#]/g, "").trim();
  return testo.length > 220 ? testo.slice(0, 220).trimEnd() + "…" : testo;
}

// Primo titolo vero: frontmatter (titolo/oggetto/tipo) → primo heading # → nome file umanizzato.
function titolo(md: string, fm: Record<string, string>, name: string): string {
  if (fm.titolo) return fm.titolo;
  if (fm.oggetto) return fm.oggetto;
  const h = md.replace(/^---\s*\n[\s\S]*?\n---\s*/, "").match(/^#{1,3}\s+(.+)$/m);
  if (h) return h[1].replace(/[*_`#]/g, "").trim();
  if (fm.tipo) return fm.tipo.replace(/[-_]+/g, " ");
  return titoloDaFile(name);
}

type Candidato = { path: string; cat: string; nome: string; dataFile: string };

// Raccoglie tutti i file .md (consegne/* + sorgenti vault) come candidati, senza leggerne il corpo.
async function raccogliCandidati(): Promise<Candidato[]> {
  const out: Candidato[] = [];

  // — consegne/* —
  if (obsidianConnected()) {
    const entries = (await listDirEntries(ROOT_CONSEGNE)) || [];
    const dirs = entries.filter((e) => e.type === "dir").map((e) => e.name);
    const [subResults, rootFiles] = await Promise.all([
      Promise.all(
        dirs.map(async (d) => ({ cat: d, files: (await listDir(`${ROOT_CONSEGNE}/${d}`)) || [] }))
      ),
      listDir(ROOT_CONSEGNE),
    ]);
    for (const { cat, files } of subResults) {
      for (const nome of files) out.push({ path: `${ROOT_CONSEGNE}/${cat}/${nome}`, cat, nome, dataFile: dataDaFile(nome) });
    }
    for (const nome of rootFiles || []) out.push({ path: `${ROOT_CONSEGNE}/${nome}`, cat: "", nome, dataFile: dataDaFile(nome) });
  } else {
    for (const base of [process.cwd(), path.join(process.cwd(), "..")]) {
      const dir = path.join(base, ROOT_CONSEGNE);
      let trovato = false;
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const e of entries.filter((x) => x.isFile() && x.name.endsWith(".md"))) {
          out.push({ path: `${ROOT_CONSEGNE}/${e.name}`, cat: "", nome: e.name, dataFile: dataDaFile(e.name) });
          trovato = true;
        }
        for (const e of entries.filter((x) => x.isDirectory())) {
          try {
            const files = (await fs.readdir(path.join(dir, e.name))).filter((n) => n.endsWith(".md"));
            for (const nome of files) {
              out.push({ path: `${ROOT_CONSEGNE}/${e.name}/${nome}`, cat: e.name, nome, dataFile: dataDaFile(nome) });
              trovato = true;
            }
          } catch {
            /* salto sottocartella */
          }
        }
      } catch {
        /* provo la radice successiva */
      }
      if (trovato) break;
    }
  }

  // — sorgenti del vault (Briefing / Report / Intelligence) —
  await Promise.all(
    SORGENTI_VAULT.map(async ({ dir, cat }) => {
      let files: string[] = [];
      if (obsidianConnected()) {
        files = (await listDir(`MyCity-Vault/${dir}`)) || [];
      } else {
        for (const base of [process.cwd(), path.join(process.cwd(), "..")]) {
          try {
            const names = await fs.readdir(path.join(base, "MyCity-Vault", dir));
            const md = names.filter((n) => n.endsWith(".md"));
            if (md.length) { files = md; break; }
          } catch {
            /* provo la radice successiva */
          }
        }
      }
      for (const nome of files) {
        if (nome.startsWith("_")) continue; // _README e simili: non sono contenuti
        out.push({ path: `MyCity-Vault/${dir}/${nome}`, cat, nome, dataFile: dataDaFile(nome) });
      }
    })
  );

  return out;
}

// Legge un file: da consegne/ (repo) o da MyCity-Vault/ (vault).
async function leggi(p: string): Promise<string | null> {
  if (p.startsWith("MyCity-Vault/")) return readVaultFile(p.slice("MyCity-Vault/".length));
  return readRepoFile(p);
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");

  // Dettaglio: contenuto markdown completo di un contenuto (per l'anteprima inline).
  if (file) {
    const rel = file.replace(/^\/+/, "");
    const consentito = rel.startsWith(`${ROOT_CONSEGNE}/`) || rel.startsWith("MyCity-Vault/90-Memoria-AI/");
    if (rel.includes("..") || !/\.md$/i.test(rel) || !consentito) {
      return NextResponse.json({ errore: "percorso non valido" }, { status: 400 });
    }
    const contenuto = await leggi(rel);
    if (contenuto == null) return NextResponse.json({ errore: "contenuto non trovato", file: rel }, { status: 404 });
    return NextResponse.json({ file: rel, contenuto });
  }

  // Lista: i contenuti più recenti, arricchiti (titolo/reparto/colore/estratto), ordinati al minuto.
  const candidati = await raccogliCandidati();
  // Pre-ordina per data-file (poi nome) e leggi solo i più freschi: risparmia chiamate GitHub.
  candidati.sort((a, b) => (b.dataFile || "").localeCompare(a.dataFile || "") || b.nome.localeCompare(a.nome));
  const daLeggere = candidati.slice(0, MAX_LETTURE);

  const letti = await Promise.all(
    daLeggere.map(async (c) => {
      const md = (await leggi(c.path)) || "";
      const fm = frontmatter(md);
      const et = etichetta(c.cat);
      const quando = (fm.data || c.dataFile || "").trim();
      return {
        path: c.path,
        categoria: c.cat,
        emoji: et.emoji,
        etichetta: et.label,
        reparto: (fm.reparto || "").replace(/\s*\(.*$/, "").trim(),
        titolo: titolo(md, fm, c.nome),
        estratto: estratto(md),
        colore: coloreDa(fm.colore || fm.allocazione || ""),
        tipo: fm.tipo || "",
        anteprima: (fm.anteprima || "").trim(),
        anteprimaStoria: (fm.anteprima_storia || fm.anteprimastoria || "").trim(),
        quando, // stringa grezza (vault-Piacenza o data-file); il client la formatta con faRelativo
        quandoIso: quando ? vaultToIso(quando) : "",
        vuoto: md.length === 0,
      };
    })
  );

  // Ordine finale sull'ISTANTE reale (minuto): i frontmatter con HH:MM battono le date secche.
  letti.sort((a, b) => (Date.parse(b.quandoIso) || 0) - (Date.parse(a.quandoIso) || 0));

  return NextResponse.json({
    collegato: letti.length > 0,
    totale: candidati.length,
    fonte: obsidianConnected() ? "github" : "disco",
    contenuti: letti,
  });
}
