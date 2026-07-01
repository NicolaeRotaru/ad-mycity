// Utilità condivise per git-pr.mjs e git-merge.mjs — GitHub API + risoluzione repo.
// Token: GIT_PUSH_TOKEN (ad-mycity) o MARKETPLACE_GIT_TOKEN / GIT_PUSH_TOKEN (mycity).

import { existsSync } from "node:fs";
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
