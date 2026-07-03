// Collega l'assistente alle note Obsidian tramite un vault sincronizzato su un
// repository GitHub (plugin "Obsidian Git"). Legge e scrive le note .md via API.

const API = "https://api.github.com";
const OWNER = process.env.OBSIDIAN_REPO_OWNER;
const REPO = process.env.OBSIDIAN_REPO;
const TOKEN = process.env.OBSIDIAN_TOKEN || process.env.GITHUB_TOKEN;
// Il giro scrive il vault sul ramo 'memoria-ad' (cervello/giro.sh, GIT_BRANCH:-memoria-ad), MAI su 'main'.
// Quindi il default deve essere 'memoria-ad': con default 'main' la Cabina leggerebbe un vault congelato.
const BRANCH = process.env.OBSIDIAN_BRANCH || "memoria-ad";
if (!process.env.OBSIDIAN_BRANCH && OWNER && REPO && TOKEN) {
  console.warn("[obsidian] OBSIDIAN_BRANCH non impostato: uso 'memoria-ad'. Impostalo esplicitamente su Vercel.");
}

// Ramo di RIPIEGO in sola lettura. La memoria vera vive su BRANCH (memoria-ad): il giro
// pubblica SOLO lì e il Pannello scrive SOLO lì. Ma se un file/una cartella non esiste su
// quel ramo (branch assente, giro che ha pubblicato su main per sbaglio, propagazione in
// corso) la lettura tornava `null` e il dato SPARIVA dallo schermo in silenzio: è la causa
// radice dei ripetuti "il Pannello non vede i dati". Rete di sicurezza: se BRANCH non ha il
// file, riprova su OVERRIDE (default 'main') così NON si mostra mai schermo vuoto per un
// disallineamento di ramo. Ogni lettura registra il ramo che l'ha servita (ramoUltimaLettura)
// → la deriva diventa VISIBILE invece che nascosta. NB: vale solo in LETTURA; le scritture
// restano ancorate a BRANCH.
const RAMO_RIPIEGO = process.env.OBSIDIAN_BRANCH_FALLBACK || "main";

// Ordine di tentativo in lettura: prima la memoria fresca, poi il ripiego (se diverso).
function ramiLettura(): string[] {
  return BRANCH === RAMO_RIPIEGO ? [BRANCH] : [BRANCH, RAMO_RIPIEGO];
}

// Diagnostica: da quale ramo è arrivato l'ULTIMO dato letto, e se è stato usato il ripiego.
let _ramoUltimaLettura: string | null = null;
let _ripiegoUsato = false;

/** Ramo che ha effettivamente servito l'ultima lettura (null se nessuna lettura riuscita). */
export function ramoUltimaLettura(): { ramo: string | null; ripiego: boolean } {
  return { ramo: _ramoUltimaLettura, ripiego: _ripiegoUsato };
}

export function obsidianConnected(): boolean {
  return Boolean(OWNER && REPO && TOKEN);
}

/** Ramo GitHub da cui il Pannello legge il vault (default: memoria-ad). */
export function obsidianBranch(): string {
  return BRANCH;
}

/**
 * GET resiliente sulla Contents API: prova i rami [BRANCH, ripiego] e ritorna la PRIMA
 * risposta ok, annotando quale ramo l'ha servita. Ritorna null solo se il path manca su
 * TUTTI i rami (allora sì, il dato non esiste davvero da nessuna parte). Un errore di rete
 * su un ramo non fa sparire il dato: si prova il successivo.
 */
async function contentsGet(pathRepo: string): Promise<{ dati: any; ramo: string } | null> {
  const enc = encodeURIComponent(pathRepo);
  for (const ramo of ramiLettura()) {
    try {
      const r = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${enc}?ref=${ramo}`, {
        headers: h(),
        cache: "no-store",
      });
      if (!r.ok) continue;
      const dati = await r.json();
      _ramoUltimaLettura = ramo;
      _ripiegoUsato = ramo !== BRANCH;
      return { dati, ramo };
    } catch {
      /* rete/parse fallita su questo ramo: provo il successivo */
    }
  }
  return null;
}

/** Config vault per diagnosi/UI: il Pannello legge qui, non da main. */
export function vaultGithubInfo(): { collegato: boolean; ramo: string; repo: string | null } {
  return {
    collegato: obsidianConnected(),
    ramo: BRANCH,
    repo: OWNER && REPO ? `${OWNER}/${REPO}` : null,
  };
}

const NON_COLLEGATO =
  "Obsidian non collegato. Servono OBSIDIAN_REPO_OWNER, OBSIDIAN_REPO e un token (OBSIDIAN_TOKEN) con accesso al repo del vault.";

function h(extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "mycity-assistant",
    ...(extra || {}),
  };
}

/** Elenco delle note (.md), con filtro opzionale sul percorso. */
export async function listNotes(filtro?: string): Promise<string> {
  if (!obsidianConnected()) return NON_COLLEGATO;
  // Prova BRANCH e, se il ramo non risponde, il ripiego: come per le letture di file,
  // meglio l'elenco da 'main' che nessun elenco per un disallineamento di ramo.
  for (const ramo of ramiLettura()) {
    try {
      const ref: any = await (await fetch(`${API}/repos/${OWNER}/${REPO}/git/ref/heads/${ramo}`, { headers: h(), cache: "no-store" })).json();
      if (!ref.object) continue;
      const commit: any = await (await fetch(`${API}/repos/${OWNER}/${REPO}/git/commits/${ref.object.sha}`, { headers: h(), cache: "no-store" })).json();
      const tree: any = await (await fetch(`${API}/repos/${OWNER}/${REPO}/git/trees/${commit.tree.sha}?recursive=1`, { headers: h(), cache: "no-store" })).json();
      let note: string[] = (tree.tree || []).filter((t: any) => t.type === "blob" && t.path.endsWith(".md")).map((t: any) => t.path);
      _ramoUltimaLettura = ramo;
      _ripiegoUsato = ramo !== BRANCH;
      if (filtro) {
        const f = filtro.toLowerCase();
        note = note.filter((p) => p.toLowerCase().includes(f));
      }
      return note.length ? `Note Obsidian (${note.length}):\n${note.join("\n")}` : "Nessuna nota trovata.";
    } catch {
      /* provo il ramo successivo */
    }
  }
  return "Errore: nessun ramo leggibile per il vault.";
}

/**
 * Elenco dei file .md DIRETTI in una cartella, via Contents API (sempre attuale,
 * niente albero git ricorsivo che con repo grandi può essere troncato e perdere file nuovi).
 * Torna i nomi-file ordinati, o null se non collegato/errore.
 */
export async function listDir(dir: string): Promise<string[] | null> {
  if (!obsidianConnected()) return null;
  const got = await contentsGet(dir);
  if (!got || !Array.isArray(got.dati)) return null;
  return got.dati
    .filter((x: any) => x?.type === "file" && typeof x.name === "string" && x.name.endsWith(".md"))
    .map((x: any) => x.name as string)
    .sort();
}

/** Voci di una cartella (file .md E sottocartelle), per camminare l'albero in modo ricorsivo. */
export async function listDirEntries(dir: string): Promise<{ name: string; type: "file" | "dir" }[] | null> {
  if (!obsidianConnected()) return null;
  const got = await contentsGet(dir);
  if (!got || !Array.isArray(got.dati)) return null;
  return got.dati
    .filter((x: any) => x?.type === "dir" || (x?.type === "file" && typeof x.name === "string" && x.name.endsWith(".md")))
    .map((x: any) => ({ name: x.name as string, type: x.type as "file" | "dir" }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Contenuto di una nota. */
export async function readNote(path: string): Promise<string> {
  if (!obsidianConnected()) return NON_COLLEGATO;
  if (!path) return "Indica il percorso della nota.";
  try {
    const got = await contentsGet(path);
    const d: any = got?.dati;
    if (!d || !d.content) return `Nota non trovata: ${path}`;
    const text = Buffer.from(d.content, "base64").toString("utf-8");
    // Rete di sicurezza contro file patologici. NON tagliare i file del vault (piani/briefing
    // arrivano a decine di KB): un cap basso (era 12000) buttava la CODA dei file, dove sta il
    // blocco "Aggiornamento dell'AD" dei Piani e la fine dei briefing. Le route limitano da sole
    // (codaTesto) quando serve, quindi qui restituiamo praticamente sempre il file INTERO.
    const MAX = 200000;
    return text.length > MAX ? text.slice(0, MAX) + "\n[...troncato]" : text;
  } catch (e: any) {
    return `Errore: ${e.message}`;
  }
}

/**
 * Esplora un percorso QUALSIASI del repo sul ramo del Pannello (memoria-ad).
 * Cartella → elenco voci (file + sottocartelle, ogni tipo, non solo .md); file → contenuto decodificato.
 * Serve all'area "Esplora GitHub": garantisce che OGNI file su GitHub sia raggiungibile dal Pannello,
 * senza dover cablare a mano una route per ogni nuovo tipo di artefatto (audit, design, intelligence…).
 */
export async function esploraPath(p: string): Promise<
  | { tipo: "dir"; path: string; voci: { name: string; type: "file" | "dir"; size?: number; path: string }[] }
  | { tipo: "file"; path: string; contenuto: string; troppoLungo: boolean }
  | { tipo: "errore"; errore: string }
> {
  if (!obsidianConnected()) return { tipo: "errore", errore: NON_COLLEGATO };
  const clean = (p || "").replace(/^\/+|\/+$/g, "");
  try {
    const got = await contentsGet(clean);
    if (!got) return { tipo: "errore", errore: `percorso non trovato su ${ramiLettura().join(" né ")}` };
    const d: any = got.dati;
    if (Array.isArray(d)) {
      const voci = d
        .filter((x: any) => x?.type === "file" || x?.type === "dir")
        .map((x: any) => ({ name: x.name as string, type: x.type as "file" | "dir", size: x.size as number, path: x.path as string }))
        // cartelle prima, poi file; ordine alfabetico dentro ciascun gruppo.
        .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));
      return { tipo: "dir", path: clean, voci };
    }
    if (d?.content) {
      const MAXB = 400000;
      const buf = Buffer.from(d.content, "base64");
      const troppoLungo = buf.length > MAXB;
      return { tipo: "file", path: clean, contenuto: buf.subarray(0, MAXB).toString("utf-8"), troppoLungo };
    }
    return { tipo: "errore", errore: "percorso non leggibile (né cartella né file di testo)" };
  } catch (e: any) {
    return { tipo: "errore", errore: e.message || "errore GitHub" };
  }
}

/** Crea o aggiorna/aggiunge a una nota. */
export async function writeNote(path: string, content: string, aggiungi = false): Promise<string> {
  if (!obsidianConnected()) return NON_COLLEGATO;
  if (!path || content == null) return "Servono percorso e contenuto.";
  if (!path.endsWith(".md")) path = path + ".md";
  try {
    let sha: string | undefined;
    let esistente = "";
    const cur = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`, { headers: h(), cache: "no-store" });
    if (cur.ok) {
      const d: any = await cur.json();
      sha = d.sha;
      if (aggiungi && d.content) esistente = Buffer.from(d.content, "base64").toString("utf-8") + "\n\n";
    }
    const finale = aggiungi ? esistente + content : content;
    const body: any = {
      message: `assistente: ${sha ? "aggiorna" : "crea"} ${path}`,
      content: Buffer.from(finale, "utf-8").toString("base64"),
      branch: BRANCH,
    };
    if (sha) body.sha = sha;
    const put = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`, {
      method: "PUT",
      headers: h({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
    const pd: any = await put.json();
    if (!put.ok) return `Errore scrittura: ${pd.message || put.status}`;
    return `Nota salvata: ${path}`;
  } catch (e: any) {
    return `Errore: ${e.message}`;
  }
}
