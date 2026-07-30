// Collega l'assistente alle note Obsidian tramite un vault sincronizzato su un
// repository GitHub (plugin "Obsidian Git"). Legge e scrive le note .md via API.

import { comeLeggere, comeServire } from "./esito-lettura"; // AR-254/AR-449: la regola sta in UN posto, per entrambe le copie

const API = "https://api.github.com";
// Tetto di lettura: quanto testo questa funzione accetta di tenere in memoria e servire.
// Prima era 1.000.000 tondo: un numero scelto a occhio, 48.576 byte SOTTO il vincolo reale — e
// apprendimento.json ci finiva in mezzo. Un tetto arbitrario più basso del vincolo vero non protegge
// da niente: aggiunge solo un modo di rompersi che nessuno si aspetta.
//
// AR-449 — poi è diventato 1 MiB esatto, cioè il tetto INLINE di GitHub, e per un po' è stato giusto:
// oltre quello il file non arrivava e non c'era niente da troncare. Da quando esiste la seconda strada
// (`testoDaBlob`, Blobs API fino a 100 MB) quel vincolo non c'è più, e tenere il tetto lì avrebbe
// rifiutato in casa nostra proprio i file che eravamo appena riusciti a scaricare —
// `cantiere-difetti.json` a 1.081.370 byte sarebbe tornato «troppo grande» dopo essere arrivato.
// Adesso il tetto protegge da ciò che protegge davvero (memoria e payload della funzione), non da un
// limite che abbiamo imparato ad aggirare. 8 MiB: dieci volte il file più grosso che leggiamo oggi.
const MAX_LETTURA = 8 * 1_048_576;
const OWNER = process.env.OBSIDIAN_REPO_OWNER;
const REPO = process.env.OBSIDIAN_REPO;
const TOKEN = process.env.OBSIDIAN_TOKEN || process.env.GITHUB_TOKEN;
// RAMO UNICO (Fase 2, cervello/giro.md): codice E memoria vivono insieme su 'main' — il giro
// (giro.sh, GIT_BRANCH:-main) e il worker scrivono lì, il Pannello legge lì. Il vecchio ramo
// separato 'memoria-ad' è in pensione: con default 'memoria-ad' la Cabina leggerebbe un vault
// congelato al giorno del trasloco (è il "il Pannello non legge da main").
const BRANCH = process.env.OBSIDIAN_BRANCH || "main";
if (!process.env.OBSIDIAN_BRANCH && OWNER && REPO && TOKEN) {
  console.warn("[obsidian] OBSIDIAN_BRANCH non impostato: uso 'main' (ramo unico). Impostalo esplicitamente su Vercel.");
}

// Ramo di RIPIEGO in sola lettura. La memoria vera vive su BRANCH (main): il giro pubblica
// lì e il Pannello scrive SOLO lì. Ma se un file/una cartella non esiste su quel ramo
// (scrittura rimasta sul vecchio 'memoria-ad' durante la transizione, propagazione in corso)
// la lettura tornava `null` e il dato SPARIVA dallo schermo in silenzio: è la causa radice
// dei ripetuti "il Pannello non vede i dati". Rete di sicurezza: se BRANCH non ha il file,
// riprova sul ripiego (default 'memoria-ad' finché la transizione non è chiusa) così NON si
// mostra mai schermo vuoto per un disallineamento di ramo. Ogni lettura riporta nel valore di
// ritorno il ramo che l'ha servita → la deriva diventa VISIBILE invece che nascosta.
// NB: vale solo in LETTURA; le scritture restano ancorate a BRANCH.
const RAMO_RIPIEGO = process.env.OBSIDIAN_BRANCH_FALLBACK || "memoria-ad";

// Ordine di tentativo in lettura: prima la memoria fresca, poi il ripiego (se diverso).
function ramiLettura(): string[] {
  return BRANCH === RAMO_RIPIEGO ? [BRANCH] : [BRANCH, RAMO_RIPIEGO];
}

export function obsidianConnected(): boolean {
  return Boolean(OWNER && REPO && TOKEN);
}

/** Ramo GitHub da cui il Pannello legge il vault (default: main, ramo unico). */
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
// AR-254: «troppo-grande» è uno stato a sé. Prima un file oltre il tetto finiva in due bugie diverse —
// troncato a metà (JSON invalido → il chiamante legge `null` = «non c'è niente») oppure, sopra 1 MiB,
// servito vuoto dalla Contents API e letto come «assente». Un file troppo grosso che risulta
// inesistente è la stessa malattia di tutto questo cantiere: il buio che si traveste da buona notizia.
export type StatoLettura = "ok" | "assente" | "github-giu" | "auth" | "troppo-grande";
export type EsitoContents =
  | { stato: "ok"; dati: any; ramo: string }
  | { stato: "assente" }
  | { stato: "github-giu"; dettaglio?: string }
  | { stato: "auth"; dettaglio?: string };

// Priorità nel decidere l'esito aggregato tra più rami: un errore "duro"
// (auth / github-giu) pesa più di "assente", perché su errore non possiamo
// affermare che il file manchi.
function peggiore(a: EsitoContents, b: EsitoContents): EsitoContents {
  // AR-254: «troppo-grande» pesa più di «assente» — il file c'è, ed è la ragione per cui non lo
  // leggiamo: dire «non esiste» sarebbe la bugia. Pesa meno di auth/github-giu perché quelli sono
  // guasti del canale, e su un guasto non si può affermare NIENTE del file.
  const rank: Record<StatoLettura, number> = { ok: 0, assente: 1, "troppo-grande": 2, "github-giu": 3, auth: 4 };
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
/**
 * LA SECONDA STRADA (AR-449). La Contents API non serve inline i file oltre 1 MiB: torna `content`
 * vuoto con `size` valorizzato. La Blobs API invece li serve fino a 100 MB, con lo stesso token e
 * lo stesso `sha` che la Contents API ci ha appena dato.
 *
 * Perché serve, con la data: il 2026-07-30 alle 02:03 `cantiere-difetti.json` ha passato il MiB
 * (1.049.775 byte) e da quel momento la Cabina ha mostrato «Nessun difetto aperto 👍» con 162
 * difetti aperti — per dodici ore. Il caso era già RICONOSCIUTO nel codice (AR-254) ma non aveva
 * una via d'uscita: sapere di non sapere, senza poterci fare niente, resta un buco.
 *
 * Torna `null` se la seconda strada non porta niente: il chiamante allora dichiara «troppo-grande»,
 * che è un'informazione, non un silenzio.
 */
async function testoDaBlob(sha: string): Promise<string | null> {
  if (!sha) return null;
  try {
    const r = await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/blobs/${sha}`, {
      headers: { ...h(), Accept: "application/vnd.github.raw" },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const t = await r.text();
    return t.length ? t : null;
  } catch {
    return null;
  }
}

/**
 * Da payload della Contents API al TESTO, con la seconda strada inclusa. Esiste per non avere due
 * copie della stessa regola: `leggiNota` e `readNote` erano già una la fotocopia dell'altra, e il
 * commento di AR-254 avvisava che curarne una sola è la malattia di questo cantiere. Qui la regola
 * è una, e la attraversano entrambe.
 */
export async function testoDaContents(
  d: any,
  percorso: string
): Promise<{ ok: true; testo: string; via: "inline" | "blob" } | { ok: false; stato: "assente" | "troppo-grande"; dettaglio?: string }> {
  if (!d) return { ok: false, stato: "assente" };
  // La decisione è pura e vive in esito-lettura.ts (provabile senza rete); qui resta solo l'I/O.
  const scelta = comeLeggere({ content: d.content, size: d.size, sha: d.sha });
  if (scelta.via === "assente") return { ok: false, stato: "assente" };
  if (scelta.via === "troppo-grande") return { ok: false, stato: "troppo-grande", dettaglio: scelta.motivo };
  let text: string | null = null;
  const via: "inline" | "blob" = scelta.via;
  if (scelta.via === "inline") {
    text = Buffer.from(d.content, "base64").toString("utf-8");
  } else {
    text = await testoDaBlob(scelta.sha);
    if (text == null) {
      return {
        ok: false,
        stato: "troppo-grande",
        dettaglio: `${Number(d.size).toLocaleString("it")} byte: oltre il tetto inline di GitHub (1.048.576) e nemmeno la Blobs API l'ha servito`,
      };
    }
  }
  const v = comeServire({ percorso, lunghezza: text.length, tetto: MAX_LETTURA });
  if (v.azione === "troppo-grande") return { ok: false, stato: "troppo-grande", dettaglio: v.motivo };
  return { ok: true, testo: v.azione === "tronca" ? text.slice(0, MAX_LETTURA) + "\n[...troncato]" : text, via };
}

export async function leggiNota(
  path: string
): Promise<{ stato: StatoLettura; testo: string | null; ramo: string | null; dettaglio?: string }> {
  if (!obsidianConnected()) return { stato: "auth", testo: null, ramo: null, dettaglio: "non collegato" };
  if (!path) return { stato: "assente", testo: null, ramo: null };
  const esito = await contentsGet(path);
  if (esito.stato !== "ok") {
    return { stato: esito.stato, testo: null, ramo: null, dettaglio: "dettaglio" in esito ? esito.dettaglio : undefined };
  }
  const r = await testoDaContents(esito.dati, path);
  if (!r.ok) return { stato: r.stato, testo: null, ramo: esito.ramo, dettaglio: r.dettaglio };
  return { stato: "ok", testo: r.testo, ramo: esito.ramo };
}

/** Config vault per diagnosi/UI: il ramo da cui il Pannello legge davvero. */
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

/** Elenco path `.md` sotto prefissi dati — 1 albero git (~3 call), non N listDir. */
export async function listMarkdownPaths(
  prefissi: string[]
): Promise<{ paths: string[]; parziale: boolean; ramo: string | null }> {
  if (!obsidianConnected()) return { paths: [], parziale: false, ramo: null };
  const want = prefissi.map((p) => `${p.replace(/\/+$/, "")}/`);
  for (const ramo of ramiLettura()) {
    try {
      const ref: any = await (await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/ref/heads/${ramo}`, { headers: h(), cache: "no-store" })).json();
      if (!ref.object) continue;
      const commit: any = await (await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/commits/${ref.object.sha}`, { headers: h(), cache: "no-store" })).json();
      const tree: any = await (await fetchTimeout(`${API}/repos/${OWNER}/${REPO}/git/trees/${commit.tree.sha}?recursive=1`, { headers: h(), cache: "no-store" })).json();
      const paths = (tree.tree || [])
        .filter((t: any) => t.type === "blob" && typeof t.path === "string" && t.path.endsWith(".md"))
        .map((t: any) => t.path as string)
        .filter((p: string) => want.some((pre) => p.startsWith(pre)));
      return { paths, parziale: Boolean(tree.truncated), ramo };
    } catch {
      /* provo il ramo successivo */
    }
  }
  return { paths: [], parziale: true, ramo: null };
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
  // AR-254/AR-449 — le due copie di questa logica adesso attraversano la STESSA funzione,
  // `testoDaContents`: stessa regola su cosa servire, stessa seconda strada quando il file supera
  // il tetto inline. Curarne una sola sarebbe la malattia che questo cantiere insegue da undici
  // lotti («il fix applicato a una copia sola»).
  const r = await testoDaContents(got.dati, path);
  if (!r.ok) {
    if (r.stato === "assente") return `Nota non trovata: ${path}`;
    return `Errore: ${path} non è leggibile — ${r.dettaglio || "troppo grande"}`;
  }
  return r.testo;
}

/**
 * Esplora un percorso QUALSIASI del repo sul ramo del Pannello (main, ramo unico).
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

/** Bytes grezzi di un file in repo (PNG, SVG, …) via GitHub Contents API. */
export async function readRepoBytes(pathRepo: string): Promise<Buffer | null> {
  if (!obsidianConnected()) return null;
  const got = await contentsGet(pathRepo);
  if (got.stato !== "ok") return null;
  const d: any = got.dati;
  if (!d?.content) return null;
  return Buffer.from(d.content, "base64");
}
