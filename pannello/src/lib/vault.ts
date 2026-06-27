// Lettura della memoria del vault (MyCity-Vault/) per il Pannello di Controllo.
// In locale (monorepo) legge i file da disco; in produzione (Vercel, root=pannello/)
// ripiega sulla GitHub API tramite gli strumenti obsidian.* (variabili OBSIDIAN_*).
import { promises as fs } from "fs";
import path from "path";
import { readNote, listDir, obsidianConnected } from "./obsidian";

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

/** Tiene solo la coda di un testo lungo (le righe più recenti), con un cappello. */
export function codaTesto(s: string, max = 6000): string {
  return s.length > max ? "…(troncato, mostro la parte più recente)\n" + s.slice(-max) : s;
}
