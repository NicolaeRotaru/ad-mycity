// Lettura della memoria del vault (MyCity-Vault/) per il Pannello di Controllo.
// In locale (monorepo) legge i file da disco; in produzione (Vercel, root=pannello/)
// ripiega sulla GitHub API tramite gli strumenti obsidian.* (variabili OBSIDIAN_*).
import { promises as fs } from "fs";
import path from "path";
import { leggiNota, listDir, listDirEntries, obsidianConnected, type StatoLettura } from "./obsidian";
import { daEsitoJson, motivoLettura, type LetturaJson } from "./esito-lettura";

// Esito tipizzato di una lettura del vault: oltre al testo porta lo STATO (ok/assente/
// github-giu/auth) e il RAMO che l'ha servita, così i chiamanti (es. /api/stato) distinguono
// "il dato non c'è" da "GitHub è giù / token morto" senza indovinare da un `null`. In locale
// (disco) lo stato è ok/assente e ramo="disco".
export type EsitoVault = { stato: StatoLettura; testo: string | null; ramo: string | null; dettaglio?: string };

// Possibili radici del vault su disco, a seconda di dove gira `npm`.
function vaultRoots(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "MyCity-Vault"), // cwd = radice della repo
    path.join(cwd, "..", "MyCity-Vault"), // cwd = pannello/
  ];
}

/**
 * AR-415 — **UNA SOLA STRADA PER LEGGERE.**
 *
 * `readVaultFile` aveva una strada sua: chiamava `readNote`, che risponde con una STRINGA anche
 * quando fallisce, e riconosceva i guasti dal prefisso del messaggio (`ERR_PREFIXES`). Due difetti in
 * uno: il motivo veniva buttato via (tornava `null` sia per «non c'è» sia per «GitHub è giù» sia per
 * «l'archivio ha passato il muro»), e il riconoscimento per prefisso si rompe da solo il giorno che
 * qualcuno riscrive un messaggio d'errore.
 *
 * La riparazione di AR-254 aveva aggiunto `readVaultFileEsito` ACCANTO invece di curare questa: le 26
 * rotte che chiamano `readVaultFile` hanno continuato a ricevere `null`. Adesso la strada è una sola
 * — questa passa da lì e butta via il motivo solo all'ultimo istante, dove il chiamante ha davvero
 * chiesto «solo il testo».
 */
export async function readVaultFile(relPath: string): Promise<string | null> {
  const e = await readVaultFileEsito(relPath);
  return e.stato === "ok" ? e.testo : null;
}

/**
 * Come readVaultFile ma con ESITO tipizzato: dice se il dato c'è (ok), se manca davvero
 * (assente) o se non lo sappiamo perché GitHub ha rifiutato/era giù (auth/github-giu/troppo-grande),
 * e da quale ramo è arrivato. Serve a /api/stato per mostrare il ramo servito (deriva del giro)
 * senza stato globale, e per non spacciare un buco di rete per "nessun dato".
 *
 * PRODUZIONE (OBSIDIAN_* configurate): legge SEMPRE da GitHub (ramo OBSIDIAN_BRANCH, oggi main),
 * MAI dal disco: il clone di build di Vercel è fermo al deploy — leggendo da disco i briefing nuovi
 * (pushati su main DOPO il deploy) non si vedrebbero fino al redeploy.
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
 * AR-415 — il lettore JSON del vault, con la ragione attaccata al dato.
 *
 * Ogni rotta della memoria si era scritta il suo `leggiJson` privato: `readVaultFile` → `try
 * JSON.parse` → `catch { return null }`. Tre appiattimenti in fila, e in fondo la schermata dice
 * «non è mai stato fatto» a un archivio che invece c'è ed è troppo grosso per passare. Qui la
 * lettura è una sola e l'esito viaggia col dato:
 *
 *   `{dati, letto: true}`          → letto, valido
 *   `{dati: null, letto: true}`    → guardato, non c'era (fatto vero: si può invitare a lanciare il giro)
 *   `{dati: null, letto: false, motivo}` → non l'ho potuto leggere (non si può dire NIENTE sul contenuto)
 *
 * La decisione sta in `esito-lettura.ts` (pura, provabile senza rete e senza disco); qui c'è solo l'I/O.
 */
export async function leggiJsonVault<T = unknown>(relPath: string): Promise<LetturaJson<T>> {
  return daEsitoJson<T>(await readVaultFileEsito(relPath));
}

/** Perché una lettura non ha portato il dato, in italiano. `null` quando non c'è niente da spiegare. */
export function motivoEsitoVault(e: EsitoVault): string | null {
  return motivoLettura(e);
}

/**
 * Legge un file dalla RADICE del repo (non solo dal vault), es. "consegne/vendite/pitch-garetti.md".
 * Serve per la "scheda completa" delle azioni (il contenuto vero vive in consegne/, ramo unico main).
 * Stessa logica di readVaultFile ma senza il prefisso MyCity-Vault/.
 */
export async function readRepoFile(relPath: string): Promise<string | null> {
  const e = await readRepoFileEsito(relPath);
  return e.stato === "ok" ? e.testo : null;
}

/** Come readRepoFile ma con l'esito tipizzato: stessa cura di AR-415, stessa strada sola. */
export async function readRepoFileEsito(relPath: string): Promise<EsitoVault> {
  if (obsidianConnected()) {
    return await leggiNota(relPath);
  }
  // LOCALE: la radice del repo è cwd (radice) o cwd/.. (se gira da pannello/).
  for (const root of [process.cwd(), path.join(process.cwd(), "..")]) {
    try {
      const txt = await fs.readFile(path.join(root, relPath), "utf-8");
      if (txt != null) return { stato: "ok", testo: txt, ramo: "disco" };
    } catch {
      /* provo la radice successiva */
    }
  }
  return { stato: "assente", testo: null, ramo: null };
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
  // PRODUZIONE (OBSIDIAN_*): elenca SEMPRE da GitHub (Contents API, ramo unico main), MAI dal disco
  // (il clone di build è fermo al deploy → cartelle coi file vecchi). Disco solo in locale.
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

/** Tiene solo la coda di un testo lungo (le righe più recenti), con un cappello.
 * L'avviso è markdown corsivo + riga separatrice: reso da ReactMarkdown, appare come
 * una nota a sé — non incollato al primo rigo del contenuto vero (che confondeva chi legge,
 * facendo sembrare l'avviso parte del testo invece che una spiegazione). */
export function codaTesto(s: string, max = 6000): string {
  return s.length > max
    ? `*…(troncato, mostro la parte più recente)*\n\n---\n\n${s.slice(-max)}`
    : s;
}
