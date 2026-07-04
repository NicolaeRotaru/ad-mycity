// Lettura della memoria del vault (MyCity-Vault/) per il Pannello di Controllo.
// In locale (monorepo) legge i file da disco; in produzione (Vercel, root=pannello/)
// ripiega sulla GitHub API tramite gli strumenti obsidian.* (variabili OBSIDIAN_*).
import { promises as fs } from "fs";
import path from "path";
import { readNote, leggiNota, listDir, listDirEntries, obsidianConnected, type StatoLettura } from "./obsidian";

// Esito tipizzato di una lettura del vault: oltre al testo porta lo STATO (ok/assente/
// github-giu/auth) e il RAMO che l'ha servita, così i chiamanti (es. /api/stato) distinguono
// "il dato non c'è" da "GitHub è giù / token morto" senza indovinare da un `null`. In locale
// (disco) lo stato è ok/assente e ramo="disco".
export type EsitoVault = { stato: StatoLettura; testo: string | null; ramo: string | null; dettaglio?: string };

const ERR_PREFIXES = [
  "Obsidian non collegato",
  "Errore",
  "Nota non trovata",
  "Indica il percorso",
  "Nessuna nota",
];
function isErr(s: string): boolean {
  return ERR_PREFIXES.some((p) => s.startsWith(p));
}

// Possibili radici del vault su disco, a seconda di dove gira `npm`.
function vaultRoots(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "MyCity-Vault"), // cwd = radice della repo
    path.join(cwd, "..", "MyCity-Vault"), // cwd = pannello/
  ];
}

/** Legge un file del vault (percorso relativo a MyCity-Vault/, es. "90-Memoria-AI/STATO.md"). */
export async function readVaultFile(relPath: string): Promise<string | null> {
  // PRODUZIONE (OBSIDIAN_* configurate): leggi SEMPRE da GitHub (ramo OBSIDIAN_BRANCH, es. memoria-ad),
  // MAI dal disco. Su Vercel il repo è clonato da `main`, che ha MyCity-Vault/ coi file VECCHI (i briefing
  // del giro stanno su memoria-ad): se leggessimo dal disco prenderemmo main e non vedremmo gli aggiornamenti.
  if (obsidianConnected()) {
    const res = await readNote(`MyCity-Vault/${relPath}`);
    return res && !isErr(res) ? res : null;
  }
  // LOCALE (monorepo senza OBSIDIAN_*): leggi da disco.
  for (const root of vaultRoots()) {
    try {
      const txt = await fs.readFile(path.join(root, relPath), "utf-8");
      if (txt != null) return txt;
    } catch {
      /* provo la radice successiva */
    }
  }
  return null;
}

/**
 * Come readVaultFile ma con ESITO tipizzato: dice se il dato c'è (ok), se manca davvero
 * (assente) o se non lo sappiamo perché GitHub ha rifiutato/era giù (auth/github-giu), e da
 * quale ramo è arrivato. Serve a /api/stato per mostrare il ramo servito (deriva del giro)
 * senza stato globale, e per non spacciare un buco di rete per "nessun dato".
 */
export async function readVaultFileEsito(relPath: string): Promise<EsitoVault> {
  if (obsidianConnected()) {
    return await leggiNota(`MyCity-Vault/${relPath}`);
  }
  // LOCALE (monorepo senza OBSIDIAN_*): leggi da disco.
  for (const root of vaultRoots()) {
    try {
      const txt = await fs.readFile(path.join(root, relPath), "utf-8");
      if (txt != null) return { stato: "ok", testo: txt, ramo: "disco" };
    } catch {
      /* provo la radice successiva */
    }
  }
  return { stato: "assente", testo: null, ramo: null };
}

/**
 * Legge un file dalla RADICE del repo (non solo dal vault), es. "consegne/vendite/pitch-garetti.md".
 * Serve per la "scheda completa" delle azioni (il contenuto vero vive in consegne/, ramo memoria-ad).
 * Stessa logica di readVaultFile ma senza il prefisso MyCity-Vault/.
 */
export async function readRepoFile(relPath: string): Promise<string | null> {
  if (obsidianConnected()) {
    const res = await readNote(relPath);
    return res && !isErr(res) ? res : null;
  }
  // LOCALE: la radice del repo è cwd (radice) o cwd/.. (se gira da pannello/).
  for (const root of [process.cwd(), path.join(process.cwd(), "..")]) {
    try {
      const txt = await fs.readFile(path.join(root, relPath), "utf-8");
      if (txt != null) return txt;
    } catch {
      /* provo la radice successiva */
    }
  }
  return null;
}

/** Elenco dei file .md in una cartella alla radice del repo (es. "memoria-squadra", "consegne"). */
export async function listRepoDir(relDir: string): Promise<string[]> {
  if (obsidianConnected()) {
    return (await listDir(relDir)) || [];
  }
  for (const root of [process.cwd(), path.join(process.cwd(), "..")]) {
    try {
      const names = await fs.readdir(path.join(root, relDir));
      const md = names.filter((n) => n.endsWith(".md"));
      if (md.length) return md.sort();
    } catch {
      /* provo la radice successiva */
    }
  }
  return [];
}

/** Elenco dei file .md in una cartella del vault (es. "90-Memoria-AI/Briefing"). */
export async function listVaultDir(relDir: string): Promise<string[]> {
  // PRODUZIONE (OBSIDIAN_*): elenca SEMPRE da GitHub (Contents API, ramo memoria-ad), MAI dal disco
  // (il clone di build è di `main` → cartelle coi file vecchi). Disco solo in locale.
  if (obsidianConnected()) {
    return (await listDir(`MyCity-Vault/${relDir}`)) || [];
  }
  // LOCALE (monorepo senza OBSIDIAN_*): leggi da disco.
  for (const root of vaultRoots()) {
    try {
      const names = await fs.readdir(path.join(root, relDir));
      const md = names.filter((n) => n.endsWith(".md"));
      if (md.length) return md.sort();
    } catch {
      /* provo la radice successiva */
    }
  }
  return [];
}

/** Voci (file .md + sottocartelle) di una cartella del vault, per camminare l'albero. */
export async function listVaultDirEntries(relDir: string): Promise<{ name: string; type: "file" | "dir" }[]> {
  if (obsidianConnected()) {
    return (await listDirEntries(`MyCity-Vault/${relDir}`)) || [];
  }
  for (const root of vaultRoots()) {
    try {
      const ents = await fs.readdir(path.join(root, relDir), { withFileTypes: true });
      const out = ents
        .filter((e) => e.isDirectory() || (e.isFile() && e.name.endsWith(".md")))
        .map((e) => ({ name: e.name, type: e.isDirectory() ? ("dir" as const) : ("file" as const) }));
      if (out.length) return out.sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      /* provo la radice successiva */
    }
  }
  return [];
}

/** Tiene solo la coda di un testo lungo (le righe più recenti), con un cappello. */
export function codaTesto(s: string, max = 6000): string {
  return s.length > max ? "…(troncato, mostro la parte più recente)\n" + s.slice(-max) : s;
}
