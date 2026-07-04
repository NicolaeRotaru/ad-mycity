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
// disallineamento di ramo. Ogni lettura riporta nel valore di ritorno il ramo che l'ha servita
// (niente più stato globale condiviso) → la deriva diventa VISIBILE invece che nascosta.
// NB: vale solo in LETTURA; le scritture restano ancorate a BRANCH.
const RAMO_RIPIEGO = process.env.OBSIDIAN_BRANCH_FALLBACK || "main";

// Ordine di tentativo in lettura: prima la memoria fresca, poi il ripiego (se diverso).
function ramiLettura(): string[] {
  return BRANCH === RAMO_RIPIEGO ? [BRANCH] : [BRANCH, RAMO_RIPIEGO];
}

export function obsidianConnected(): boolean {
  return Boolean(OWNER && REPO && TOKEN);
}

/** Ramo GitHub da cui il Pannello legge il vault (default: memoria-ad). */
export function obsidianBranch(): string {
  return BRANCH;
}

// ── Fetch con timeout (fix osservabilità) ─────────────────────────────────
// Una richiesta GitHub appesa NON deve bloccare la route fino al 504 di Vercel:
// un AbortController la taglia dopo TIMEOUT_MS e la trattiamo come "github-giu".
const TIMEOUT_MS = 5000;
function isAbort(e: any): boolean {
  return e?.name === "AbortError" || /abort/i.test(String(e?.message || ""));
}
async function fetchTimeout(url: string, opts: RequestInit = {}): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

// ── Esito tipizzato di una lettura (fix verità) ───────────────────────────
// Prima ogni fallimento collassava in `null` → impossibile distinguere "il file
// non c'è" da "GitHub è giù / token morto". Ora l'esito è discriminato:
//  ok        → dato presente (con il ramo che l'ha servito)
//  assente   → 404 su TUTTI i rami: il file non esiste davvero
//  auth      → 401/403 (token morto, permessi, rate limit): NON sappiamo se esiste
//  github-giu→ rete/timeout/5xx: NON sappiamo se esiste
export type StatoLettura = "ok" | "assente" | "github-giu" | "auth";
export type EsitoContents =
  | { stato: "ok"; dati: any; ramo: string }
  | { stato: "assente" }
  | { stato: "github-giu"; dettaglio?: string }
  | { stato: "auth"; dettaglio?: string };

// Priorità nel decidere l'esito aggregato tra più rami: un errore "duro"
// (auth / github-giu) pesa più di "assente", perché su errore non possiamo
// affermare che il file manchi.
function peggiore(a: EsitoContents, b: EsitoContents): EsitoContents {
  const rank: Record<StatoLettura, number> = { ok: 0, assente: 1, "github-giu": 2, auth: 3 };
  return rank[b.stato] > rank[a.stato] ? b : a;
}

/**
 * GET resiliente sulla Contents API: prova i rami [BRANCH, ripiego] e ritorna la PRIMA
 * risposta ok, annotando quale ramo l'ha servita. Se nessun ramo dà ok, ritorna l'esito
 * più "grave" incontrato: 'assente' solo se ogni ramo ha risposto 404 (il dato non c'è
 * davvero); 'auth'/'github-giu' se GitHub ha rifiutato o non era raggiungibile — così il
 * dato non "sparisce in silenzio" e i chiamanti sanno perché.
 */
async function contentsGet(pathRepo: string): Promise<EsitoContents> {
  const enc = encodeURIComponent(pathRepo);
  let acc: EsitoContents = { stato: "assente" };
  for (const ramo of ramiLettura()) {
    try {
      const r = await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/contents/${enc}?ref=${ramo}`, {
        headers: h(),
        cache: "no-store",
      });
      if (r.ok) {
        const dati = await r.json();
        return { stato: "ok", dati, ramo };
      }
      if (r.status === 404) {
        // il file non è su QUESTO ramo: provo il prossimo, l'accumulatore resta 'assente'
        continue;
      }
      if (r.status === 401 || r.status === 403) {
        // token morto / permessi insufficienti / rate limit: gli altri rami risponderebbero
        // uguale → inutile insistere, è un problema di accesso, non del singolo ramo.
        return { stato: "auth", dettaglio: `GitHub ${r.status}` };
      }
      // 5xx o altri codici: GitHub instabile
      acc = peggiore(acc, { stato: "github-giu", dettaglio: `GitHub ${r.status}` });
    } catch (e: any) {
      acc = peggiore(acc, { stato: "github-giu", dettaglio: isAbort(e) ? "timeout" : "rete" });
    }
  }
  return acc;
}

/**
 * Verifica REALE dell'accesso al vault su GitHub (per la diagnosi, non solo "env presenti"):
 * una GET su /repos/{owner}/{repo} prova che il token legge davvero il repo, e una GET su
 * /git/ref/heads/{BRANCH} prova che il ramo da cui il Pannello legge esiste. ROSSO su 401/403
 * o se il ramo manca — così la diagnosi non mente dicendo "verde" con un token scaduto.
 */
export async function testVaultGithub(): Promise<{ ok: boolean; ramoEsiste: boolean; dettaglio: string }> {
  if (!obsidianConnected()) {
    return { ok: false, ramoEsiste: false, dettaglio: "mancano OBSIDIAN_REPO_OWNER, OBSIDIAN_REPO o OBSIDIAN_TOKEN" };
  }
  try {
    const r = await fetchTimeout(`${API}/repos/${OWNER}/${REPO}`, { headers: h(), cache: "no-store" });
    if (!r.ok) {
      const d: any = await r.json().catch(() => ({}));
      return { ok: false, ramoEsiste: false, dettaglio: `GitHub ${r.status}: ${d.message || "accesso negato al repo del vault"}` };
    }
    const repo: any = await r.json();
    const rr = await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`, { headers: h(), cache: "no-store" });
    if (!rr.ok) {
      if (rr.status === 401 || rr.status === 403) {
        return { ok: false, ramoEsiste: false, dettaglio: `GitHub ${rr.status}: token senza permesso sui rami` };
      }
      return { ok: false, ramoEsiste: false, dettaglio: `token OK ma il ramo «${BRANCH}» non esiste su ${repo.full_name} — il Pannello leggerebbe a vuoto` };
    }
    return {
      ok: true,
      ramoEsiste: true,
      dettaglio: `${repo.full_name} · ramo «${BRANCH}» OK${repo.private ? " · privato" : ""}`,
    };
  } catch (e: any) {
    return { ok: false, ramoEsiste: false, dettaglio: isAbort(e) ? "timeout GitHub (>5s)" : e.message || "GitHub non raggiungibile" };
  }
}

/**
 * Lettura tipizzata di una nota: come readNote ma restituisce l'esito discriminato e il ramo
 * che l'ha servita, senza appoggiarsi a stato globale. Usata da /api/stato per sapere da quale
 * ramo arriva il dato (ripiego = deriva del giro) e da chi vuole distinguere assente/giù.
 */
export async function leggiNota(
  path: string
): Promise<{ stato: StatoLettura; testo: string | null; ramo: string | null; dettaglio?: string }> {
  if (!obsidianConnected()) return { stato: "auth", testo: null, ramo: null, dettaglio: "non collegato" };
  if (!path) return { stato: "assente", testo: null, ramo: null };
  const esito = await contentsGet(path);
  if (esito.stato !== "ok") {
    return { stato: esito.stato, testo: null, ramo: null, dettaglio: "dettaglio" in esito ? esito.dettaglio : undefined };
  }
  const d: any = esito.dati;
  if (!d || !d.content) return { stato: "assente", testo: null, ramo: esito.ramo };
  const text = Buffer.from(d.content, "base64").toString("utf-8");
  const MAX = 200000;
  return { stato: "ok", testo: text.length > MAX ? text.slice(0, MAX) + "\n[...troncato]" : text, ramo: esito.ramo };
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
      const ref: any = await (await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/ref/heads/${ramo}`, { headers: h(), cache: "no-store" })).json();
      if (!ref.object) continue;
      const commit: any = await (await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/commits/${ref.object.sha}`, { headers: h(), cache: "no-store" })).json();
      const tree: any = await (await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/trees/${commit.tree.sha}?recursive=1`, { headers: h(), cache: "no-store" })).json();
      let note: string[] = (tree.tree || []).filter((t: any) => t.type === "blob" && t.path.endsWith(".md")).map((t: any) => t.path);
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
  if (got.stato !== "ok" || !Array.isArray(got.dati)) return null;
  return got.dati
    .filter((x: any) => x?.type === "file" && typeof x.name === "string" && x.name.endsWith(".md"))
    .map((x: any) => x.name as string)
    .sort();
}

/** Voci di una cartella (file .md E sottocartelle), per camminare l'albero in modo ricorsivo. */
export async function listDirEntries(dir: string): Promise<{ name: string; type: "file" | "dir" }[] | null> {
  if (!obsidianConnected()) return null;
  const got = await contentsGet(dir);
  if (got.stato !== "ok" || !Array.isArray(got.dati)) return null;
  return got.dati
    .filter((x: any) => x?.type === "dir" || (x?.type === "file" && typeof x.name === "string" && x.name.endsWith(".md")))
    .map((x: any) => ({ name: x.name as string, type: x.type as "file" | "dir" }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Contenuto di una nota. Restituisce testo, oppure una stringa d'errore (prefissi in ERR_PREFIXES di vault.ts). */
export async function readNote(path: string): Promise<string> {
  if (!obsidianConnected()) return NON_COLLEGATO;
  if (!path) return "Indica il percorso della nota.";
  const got = await contentsGet(path);
  if (got.stato !== "ok") {
    // Distinzione onesta: 'assente' = file non c'è; 'auth'/'github-giu' = NON lo sappiamo,
    // GitHub ha rifiutato o era irraggiungibile → parola "Errore" così i chiamanti (isErr)
    // non confondono un buco di rete con un file cancellato.
    if (got.stato === "assente") return `Nota non trovata: ${path}`;
    if (got.stato === "auth") return `Errore: GitHub ha rifiutato l'accesso (${got.dettaglio || "token/permessi"}).`;
    return `Errore: GitHub non raggiungibile (${got.dettaglio || "rete"}).`;
  }
  const d: any = got.dati;
  if (!d || !d.content) return `Nota non trovata: ${path}`;
  const text = Buffer.from(d.content, "base64").toString("utf-8");
  // Rete di sicurezza contro file patologici. NON tagliare i file del vault (piani/briefing
  // arrivano a decine di KB): un cap basso (era 12000) buttava la CODA dei file, dove sta il
  // blocco "Aggiornamento dell'AD" dei Piani e la fine dei briefing. Le route limitano da sole
  // (codaTesto) quando serve, quindi qui restituiamo praticamente sempre il file INTERO.
  const MAX = 200000;
  return text.length > MAX ? text.slice(0, MAX) + "\n[...troncato]" : text;
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
    if (got.stato !== "ok") {
      const perche =
        got.stato === "assente"
          ? `percorso non trovato su ${ramiLettura().join(" né ")}`
          : got.stato === "auth"
            ? `GitHub ha rifiutato l'accesso (${got.dettaglio || "token/permessi"})`
            : `GitHub non raggiungibile (${got.dettaglio || "rete"})`;
      return { tipo: "errore", errore: perche };
    }
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
    const cur = await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`, { headers: h(), cache: "no-store" });
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
    const put = await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`, {
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
