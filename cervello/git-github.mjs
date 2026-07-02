// Utilità condivise per git-pr.mjs e git-merge.mjs — GitHub API + risoluzione repo.
// Token: GIT_PUSH_TOKEN (ad-mycity) o MARKETPLACE_GIT_TOKEN / GIT_PUSH_TOKEN (mycity).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CHECKOUT,
  MARKETPLACE_BRANCH,
  MARKETPLACE_GIT_REPO,
  resolveMarketplaceRepo,
} from "./marketplace-repo.mjs";

export const AD_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.github.com";

// Carica cervello/vps/.env se presente, così i comandi lanciati A MANO (fuori da
// worker/systemd, che il .env lo iniettano già) trovano comunque i segreti.
// Le variabili GIÀ presenti nell'ambiente vincono: `AZIONI_LIVE=1 node ...` resta rispettato.
function loadVpsEnv() {
  const envPath = join(AD_ROOT, "cervello", "vps", ".env");
  let raw;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    return; // nessun .env: ambiente già configurato altrove (Cloud Agent, CI, dev)
  }
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadVpsEnv();

/** @typedef {'ad-mycity' | 'mycity'} RepoKey */

/** @typedef {{ key: RepoKey, owner: string, repo: string, slug: string, cwd: string, token: string, defaultBranch: string }} RepoConfig */

function tokenFromEnv(...keys) {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return "";
}

/** @param {RepoKey} key */
export function resolveRepoConfig(key) {
  if (key === "ad-mycity") {
    const slug = process.env.GIT_REPO?.trim() || "NicolaeRotaru/ad-mycity";
    const [owner, repo] = slug.split("/");
    if (!owner || !repo) throw new Error(`GIT_REPO non valido: ${slug}`);
    const token = tokenFromEnv("GIT_PUSH_TOKEN", "GIT_TOKEN", "GITHUB_TOKEN");
    if (!token) throw new Error("Manca GIT_PUSH_TOKEN (PAT con Contents + Pull requests write su ad-mycity).");
    return {
      key,
      owner,
      repo,
      slug,
      cwd: AD_ROOT,
      token,
      defaultBranch: process.env.GIT_DEFAULT_BRANCH?.trim() || "main",
    };
  }

  if (key === "mycity") {
    const slug = MARKETPLACE_GIT_REPO;
    const [owner, repo] = slug.split("/");
    if (!owner || !repo) throw new Error(`MARKETPLACE_GIT_REPO non valido: ${slug}`);
    const token = tokenFromEnv("MARKETPLACE_GIT_TOKEN", "GIT_PUSH_TOKEN", "GIT_TOKEN", "GITHUB_TOKEN");
    const cwd = resolveMarketplaceRepo();
    if (!existsSync(join(cwd, ".git"))) {
      throw new Error(
        `Clone marketplace assente in ${cwd}. Esegui: node cervello/collega-marketplace.mjs`
      );
    }
    return {
      key,
      owner,
      repo,
      slug,
      cwd,
      token,
      defaultBranch: MARKETPLACE_BRANCH,
    };
  }

  throw new Error(`Repo sconosciuto: ${key}. Usa ad-mycity o mycity.`);
}

/** @param {string} token @param {string} path @param {RequestInit} [init] */
export async function githubRequest(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "mycity-ad-git",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text.slice(0, 300) };
  }
  if (!res.ok) {
    const msg = data.message || data.errors?.[0]?.message || `HTTP ${res.status}`;
    throw new Error(`GitHub ${res.status}: ${msg}`);
  }
  return data;
}

/** @param {RepoConfig} cfg @param {string} branch */
export async function findOpenPrForBranch(cfg, branch) {
  const head = `${cfg.owner}:${branch}`;
  const pulls = await githubRequest(
    cfg.token,
    `/repos/${cfg.owner}/${cfg.repo}/pulls?state=open&head=${encodeURIComponent(head)}&per_page=5`
  );
  return Array.isArray(pulls) && pulls.length > 0 ? pulls[0] : null;
}

/** @param {RepoConfig} cfg @param {number} prNumber */
export async function getPullRequest(cfg, prNumber) {
  return githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls/${prNumber}`);
}

/** @param {RepoConfig} cfg */
export function gitAuthUrl(cfg) {
  return `https://x-access-token:${cfg.token}@github.com/${cfg.slug}.git`;
}

// --- Segnali per il Pannello (tabella impostazioni del Supabase MEMORIA) ---
// Ogni operazione dell'automazione lascia un battito: chiave = "automazione:<nome>",
// valore = "ok|errore · dettaglio · AAAA-MM-GG HH:MM". Il Pannello li mostra e
// l'AD li controlla a ogni giro (sentinella). Se Supabase non è configurato, no-op.

export async function stampSegnale(nome, esito, dettaglio = "") {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return false;
  const valore = `${esito} · ${dettaglio}`.slice(0, 500);
  try {
    const res = await fetch(`${url}/rest/v1/impostazioni?on_conflict=chiave`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        chiave: `automazione:${nome}`,
        valore,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function nowPiacenza() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(" ", " ");
}

/** Percorso checkout marketplace (per messaggi d'errore). */
export { DEFAULT_CHECKOUT };
