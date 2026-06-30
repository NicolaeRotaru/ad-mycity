// Lettura SOLA-LETTURA del repo del marketplace (mycity).
// Nessuna scrittura: l'assistente puo' analizzare il codice, non modificarlo.

const API = "https://api.github.com";

type RepoConfig = { token: string; owner: string; repo: string; branch: string };

function getConfig(): RepoConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_DEFAULT_BRANCH || "main";
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, branch };
}

export function isMarketplaceConnected(): boolean {
  return getConfig() !== null;
}

/** Config GitHub del codice marketplace per diagnosi/UI. */
export function marketplaceGithubInfo(): { collegato: boolean; ramo: string; repo: string | null } {
  const cfg = getConfig();
  return {
    collegato: cfg !== null,
    ramo: cfg?.branch ?? "main",
    repo: cfg ? `${cfg.owner}/${cfg.repo}` : null,
  };
}

async function gh<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "mycity-assistant",
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${data.message || "errore"}`);
  return data as T;
}

const NOT_CONNECTED =
  "GitHub non collegato. Per analizzare il marketplace servono GITHUB_TOKEN (sola lettura), GITHUB_OWNER e GITHUB_REPO nelle variabili d'ambiente.";

/** Elenco percorsi file (JSON strutturato per le API). */
export async function listMarketplaceFilePaths(): Promise<
  { ok: true; file: string[] } | { ok: false; errore: string }
> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, errore: NOT_CONNECTED };
  try {
    const ref = await gh<{ object: { sha: string } }>(
      cfg.token,
      `/repos/${cfg.owner}/${cfg.repo}/git/ref/heads/${cfg.branch}`
    );
    const commit = await gh<{ tree: { sha: string } }>(
      cfg.token,
      `/repos/${cfg.owner}/${cfg.repo}/git/commits/${ref.object.sha}`
    );
    const tree = await gh<{ tree: { path: string; type: string }[]; truncated?: boolean }>(
      cfg.token,
      `/repos/${cfg.owner}/${cfg.repo}/git/trees/${commit.tree.sha}?recursive=1`
    );
    const file = tree.tree
      .filter((t) => t.type === "blob" && t.path)
      .map((t) => t.path);
    if (tree.truncated) {
      return { ok: false, errore: "Albero repo troppo grande: GitHub ha troncato l'elenco. Usa ?path= su una cartella." };
    }
    return { ok: true, file };
  } catch (e: any) {
    return { ok: false, errore: e.message || "Errore GitHub" };
  }
}

const MAX_FILE_CHARS = 12000;

/** Contenuto di un file (JSON strutturato per le API). */
export async function readMarketplaceFileContent(
  path: string
): Promise<
  | { ok: true; path: string; contenuto: string; troncato: boolean; lunghezza: number }
  | { ok: false; errore: string }
> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, errore: NOT_CONNECTED };
  if (!path) return { ok: false, errore: "Indica il percorso del file da leggere." };
  try {
    const file = await gh<{ content?: string; encoding?: string; message?: string }>(
      cfg.token,
      `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURIComponent(path)}?ref=${cfg.branch}`
    );
    if (!file.content) return { ok: false, errore: `File non trovato: ${path}` };
    const text = Buffer.from(file.content, "base64").toString("utf-8");
    const troncato = text.length > MAX_FILE_CHARS;
    return {
      ok: true,
      path,
      contenuto: troncato ? text.slice(0, MAX_FILE_CHARS) : text,
      troncato,
      lunghezza: text.length,
    };
  } catch (e: any) {
    return { ok: false, errore: e.message || "Errore GitHub" };
  }
}

/** Verifica che il token GitHub legga davvero il repo (per diagnosi). */
export async function testMarketplaceGithub(): Promise<{ ok: boolean; dettaglio: string }> {
  const cfg = getConfig();
  if (!cfg) {
    return {
      ok: false,
      dettaglio: "mancano GITHUB_TOKEN, GITHUB_OWNER o GITHUB_REPO — il codice del sito non è leggibile",
    };
  }
  try {
    const repo = await gh<{ full_name: string; default_branch: string; private: boolean }>(
      cfg.token,
      `/repos/${cfg.owner}/${cfg.repo}`
    );
    return {
      ok: true,
      dettaglio: `${repo.full_name} (ramo ${cfg.branch})${repo.private ? " · privato" : ""} — accesso OK`,
    };
  } catch (e: any) {
    return { ok: false, dettaglio: e.message || "token o permessi insufficienti" };
  }
}

/** Elenco dei file del marketplace (testo, per chat/worker). */
export async function listMarketplaceFiles(): Promise<string> {
  const res = await listMarketplaceFilePaths();
  if (!res.ok) return res.errore.startsWith("GitHub non collegato") ? res.errore : `Errore leggendo il marketplace: ${res.errore}`;
  return res.file.length
    ? `File nel marketplace (${res.file.length}):\n${res.file.join("\n")}`
    : "Il repo del marketplace risulta vuoto.";
}

/** Contenuto di un file del marketplace (testo, per chat/worker). */
export async function readMarketplaceFile(path: string): Promise<string> {
  const res = await readMarketplaceFileContent(path);
  if (!res.ok) return res.errore;
  return res.troncato
    ? res.contenuto + `\n\n[...troncato, file lungo ${res.lunghezza} caratteri]`
    : res.contenuto;
}
