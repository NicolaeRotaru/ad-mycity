// Collega l'assistente alle note Obsidian tramite un vault sincronizzato su un
// repository GitHub (plugin "Obsidian Git"). Legge e scrive le note .md via API.

const API = "https://api.github.com";
const OWNER = process.env.OBSIDIAN_REPO_OWNER;
const REPO = process.env.OBSIDIAN_REPO;
const TOKEN = process.env.OBSIDIAN_TOKEN || process.env.GITHUB_TOKEN;
const BRANCH = process.env.OBSIDIAN_BRANCH || "main";

export function obsidianConnected(): boolean {
  return Boolean(OWNER && REPO && TOKEN);
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
  try {
    const ref: any = await (await fetch(`${API}/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`, { headers: h(), cache: "no-store" })).json();
    if (!ref.object) return `Errore: ${ref.message || "branch non trovato"}`;
    const commit: any = await (await fetch(`${API}/repos/${OWNER}/${REPO}/git/commits/${ref.object.sha}`, { headers: h(), cache: "no-store" })).json();
    const tree: any = await (await fetch(`${API}/repos/${OWNER}/${REPO}/git/trees/${commit.tree.sha}?recursive=1`, { headers: h(), cache: "no-store" })).json();
    let note: string[] = (tree.tree || []).filter((t: any) => t.type === "blob" && t.path.endsWith(".md")).map((t: any) => t.path);
    if (filtro) {
      const f = filtro.toLowerCase();
      note = note.filter((p) => p.toLowerCase().includes(f));
    }
    return note.length ? `Note Obsidian (${note.length}):\n${note.join("\n")}` : "Nessuna nota trovata.";
  } catch (e: any) {
    return `Errore: ${e.message}`;
  }
}

/** Contenuto di una nota. */
export async function readNote(path: string): Promise<string> {
  if (!obsidianConnected()) return NON_COLLEGATO;
  if (!path) return "Indica il percorso della nota.";
  try {
    const r = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`, { headers: h(), cache: "no-store" });
    const d: any = await r.json();
    if (!r.ok || !d.content) return `Nota non trovata: ${path}`;
    const text = Buffer.from(d.content, "base64").toString("utf-8");
    return text.length > 12000 ? text.slice(0, 12000) + "\n[...troncato]" : text;
  } catch (e: any) {
    return `Errore: ${e.message}`;
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
