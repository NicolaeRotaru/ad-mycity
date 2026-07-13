// Utility condivise per le azioni «Merge PR #N» nella coda Da approvare.
// Il Pannello interroga GitHub: se la PR è già mergiata, la card sparisce da sola.

export type RepoMerge = "ad-mycity" | "mycity";

export type MergePrRef = { repo: RepoMerge; pr: number };

/** Canale GitHub (merge PR): stessa euristica di mani.ts, senza dipendenze server. */
export function isCanaleGithub(canale: string): boolean {
  return /github|\bmerge\b|\bpr\s*#?\d/i.test(canale || "");
}

/** Estrae repo + numero PR dal titolo/contenuto di un'azione merge. */
export function estraiMergePr(titolo: string, testo: string): MergePrRef | null {
  const blob = `${titolo || ""} ${testo || ""}`;
  const esplicito = blob.match(/merge\s+pr\s*#?(\d+)\s+(ad-mycity|mycity)/i);
  if (esplicito) {
    const pr = Number(esplicito[1]);
    const repo = esplicito[2].toLowerCase() as RepoMerge;
    if (Number.isFinite(pr) && pr > 0) return { repo, pr };
  }

  const url = blob.match(/github\.com\/([^/]+)\/([^/\s]+)\/pull\/(\d+)/i);
  if (url) {
    const pr = Number(url[3]);
    const slug = `${url[1]}/${url[2]}`.toLowerCase();
    if (!Number.isFinite(pr) || pr < 1) return null;
    if (slug.includes("ad-mycity")) return { repo: "ad-mycity", pr };
    if (slug.includes("mycity")) return { repo: "mycity", pr };
  }

  if (/\bad-mycity\b/i.test(blob)) {
    const m = blob.match(/pr\s*#?(\d+)/i);
    if (m) {
      const pr = Number(m[1]);
      if (Number.isFinite(pr) && pr > 0) return { repo: "ad-mycity", pr };
    }
  }
  if (/\bmycity\b/i.test(blob) && !/\bad-mycity\b/i.test(blob)) {
    const m = blob.match(/pr\s*#?(\d+)/i);
    if (m) {
      const pr = Number(m[1]);
      if (Number.isFinite(pr) && pr > 0) return { repo: "mycity", pr };
    }
  }
  return null;
}

type GhRepoCfg = { owner: string; repo: string; token: string };

function cfgRepo(repo: RepoMerge): GhRepoCfg | null {
  if (repo === "ad-mycity") {
    const owner = process.env.OBSIDIAN_REPO_OWNER?.trim();
    const name = process.env.OBSIDIAN_REPO?.trim();
    const token = (process.env.OBSIDIAN_TOKEN || process.env.GITHUB_TOKEN || "").trim();
    return owner && name && token ? { owner, repo: name, token } : null;
  }
  const owner = process.env.GITHUB_OWNER?.trim();
  const name = process.env.GITHUB_REPO?.trim();
  const token = (process.env.GITHUB_TOKEN || "").trim();
  return owner && name && token ? { owner, repo: name, token } : null;
}

const TIMEOUT_MS = 5000;

/** true se la PR risulta mergiata (o chiusa senza possibilità di merge). */
export async function prGiaMergiata(ref: MergePrRef): Promise<boolean> {
  const cfg = cfgRepo(ref.repo);
  if (!cfg) return false;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/pulls/${ref.pr}`,
      {
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "mycity-pannello",
        },
        cache: "no-store",
        signal: ac.signal,
      }
    );
    if (!res.ok) return false;
    const pr = (await res.json()) as { merged?: boolean; state?: string };
    if (pr.merged === true) return true;
    if (pr.state === "closed") return true;
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/** Chiude automaticamente le azioni merge la cui PR non è più aperta su GitHub. */
export async function chiudiAzioniMergeCompletate<
  T extends { id: string; titolo: string; canale: string; perche?: string; testo?: string; reparto: string; livello: string },
>(
  azioni: T[],
  valori: Record<string, string>,
  persist: (id: string, esito: string) => Promise<void>
): Promise<(T & { stato: string; esito: string })[]> {
  const cache = new Map<string, boolean>();
  const out: (T & { stato: string; esito: string })[] = [];

  for (const a of azioni) {
    let stato = valori[`azione:${a.id}`] || "";
    let esito = valori[`azione:${a.id}:nota`] || "";

    if (isCanaleGithub(a.canale) && stato !== "fatta" && stato !== "rifiutata") {
      const ref = estraiMergePr(a.titolo, a.testo || a.perche || "");
      if (ref) {
        const key = `${ref.repo}#${ref.pr}`;
        let mergiata = cache.get(key);
        if (mergiata === undefined) {
          mergiata = await prGiaMergiata(ref);
          cache.set(key, mergiata);
        }
        if (mergiata) {
          const nota = `✓ PR #${ref.pr} mergiata — tolta dalla coda automaticamente`;
          if (stato !== "fatta") {
            stato = "fatta";
            esito = nota;
            await persist(a.id, nota);
          } else if (!esito) {
            esito = nota;
          }
        }
      }
    }

    out.push({ ...a, stato, esito });
  }
  return out;
}
