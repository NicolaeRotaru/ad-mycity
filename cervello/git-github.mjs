// Utilità condivise per git-pr.mjs e git-merge.mjs — GitHub API + risoluzione repo.
// Token: GIT_PUSH_TOKEN (ad-mycity) o MARKETPLACE_GIT_TOKEN / GIT_PUSH_TOKEN (mycity).

import { execFileSync } from "node:child_process";
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
    // AR-328 — il token non è più un requisito d'ingresso, è UNO dei canali. Prima si moriva qui,
    // prima ancora di guardare se un altro canale esisteva: in una sessione cloud il repo è già
    // clonato da un proxy autenticato e `origin` funziona, ma nessuno arrivava a provarlo.
    // Si muore solo se NON C'È NESSUN CANALE — e il messaggio dice quali ha guardato.
    const origin = remoteOrigin(AD_ROOT);
    if (!token && !origin)
      throw new Error(
        "Nessun canale verso GitHub per ad-mycity: manca GIT_PUSH_TOKEN (PAT con Contents + Pull requests write) " +
          "e non esiste nemmeno un remote origin da cui ereditare l'autenticazione."
      );
    return {
      key,
      owner,
      repo,
      slug,
      cwd: AD_ROOT,
      token,
      origin,
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
  // AR-328 — se il canale disponibile è `origin` (nessun token), l'API di GitHub non è raggiungibile:
  // meglio dirlo qui, per nome, che ricevere un 401 che sembra un token sbagliato. Il push funziona
  // lo stesso: sono due canali diversi e vanno distinti in chiaro.
  if (!String(token ?? "").trim())
    throw new Error(
      `Chiamata a GitHub senza token (${path}): da qui si può pubblicare via remote origin, ma per creare o leggere una PR serve GIT_PUSH_TOKEN.`
    );
  const res = await fetch(`${API}${path}`, {
    ...init,
    // AR-439 — un'attesa senza fine dentro un cancello è un cancello che si può bloccare tenendo
    // aperta una connessione. Il chiamante può passare il suo `signal`: qui si mette solo il tetto
    // quando non c'è (additivo — chi passava un segnale continua a comandare lui).
    signal: init.signal ?? AbortSignal.timeout(Number(process.env.GIT_HTTP_TIMEOUT_MS || 30_000)),
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

// ─────────────────────────────────────────────────────────────────────────────
// AR-327 / AR-328 — COME SI PARLA A GIT, E CON QUALE CHIAVE
// ─────────────────────────────────────────────────────────────────────────────
// AR-327: ogni comando git del cervello nasce da `execFileSync` senza `maxBuffer`, quindi eredita
// il limite di 1 MB di Node sullo stdout. Un rebase o un diff che stampa di più muore con ENOBUFS —
// cioè lo strumento che pubblica il lavoro si rompe PROPRIO quando il lavoro è grosso. I giri
// ordinari sono piccoli e non ci arrivano mai: il difetto è invisibile finché non conta.
// Qui il tetto è dichiarato una volta e chi legge git da questo modulo lo eredita.
export const MAX_BUFFER_GIT = 64 * 1024 * 1024;

/**
 * L'UNICO punto in cui il cervello esegue git. Chi vuole leggere passa di qui, quindi il tetto di
 * `maxBuffer` è dichiarato una volta sola: non esiste una seconda porta che possa nascere senza.
 *
 * Era la seconda metà di AR-327, e la parte che il difetto non nominava: il tetto era stato messo
 * su `gitLetto` mentre `git-pr.mjs` aveva la sua copia dell'esecuzione, senza. La prova restava
 * verde perché misurava la porta riparata. Curare il punto e lasciare in piedi il modo in cui si è
 * rotto è la definizione di lavoro da rifare — quindi qui la copia sparisce, non si allinea.
 *
 * Alza l'eccezione: chi la vuole tollerante usa `gitLetto`.
 */
export function gitEsegui(args, cwd, env = {}) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER_GIT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...env },
  }).trim();
}

/** Legge da git senza il tetto di 1 MB. `null` se il comando fallisce (non si indovina un valore). */
export function gitLetto(args, cwd) {
  try {
    return gitEsegui(args, cwd);
  } catch {
    return null;
  }
}

/** L'URL del remote `origin`, se c'è. È l'altro canale possibile verso GitHub. */
export function remoteOrigin(cwd) {
  const u = gitLetto(["remote", "get-url", "origin"], cwd);
  return u || null;
}

/** Nasconde la parte segreta di un URL nei messaggi: un errore non deve stampare il token. */
export function urlSenzaSegreti(url) {
  return String(url ?? "").replace(/(:\/\/)[^@/]*@/, "$1***@");
}

/**
 * AR-328 — LA SCELTA DEL CANALE, PURA E DICHIARATA.
 *
 * `gitAuthUrl` costruiva SEMPRE `https://x-access-token:TOKEN@github.com/SLUG.git`, senza nessun
 * ripiego. In una sessione cloud il repo è già clonato da un proxy git autenticato e
 * `GIT_PUSH_TOKEN` non esiste: il push falliva con «Invalid username or token» mentre `origin`
 * avrebbe funzionato benissimo. Il comando `radiografia` è previsto anche da cloud (CLAUDE.md,
 * «DOVE PUBBLICARE»), quindi esisteva un modo documentato di far girare la macchina che era
 * strutturalmente incapace di consegnare il proprio risultato.
 *
 * ⚠️ Differenza dichiarata rispetto alla scheda, che diceva «provare origin per primo». Sul VPS
 * `origin` è un URL https NUDO, senza credenziali: preferirlo romperebbe l'unico canale che lì
 * funziona. L'ordine giusto è quindi: il token se c'è (è la chiave esplicita di chi l'ha
 * configurata), ALTRIMENTI origin — che nel cloud porta con sé la propria autenticazione. La
 * differenza rispetto a prima non è l'ordine, è che un ripiego ADESSO ESISTE.
 *
 * @returns {{canale: "token"|"origin"|null, url: string|null, motivo: string, provati: string[]}}
 */
export function scegliCanalePush({ token = "", origin = null, slug = "" } = {}) {
  const t = String(token ?? "").trim();
  const o = String(origin ?? "").trim();
  const provati = [];
  if (t) {
    provati.push("token");
    return { canale: "token", url: `https://x-access-token:${t}@github.com/${slug}.git`, motivo: "token di push configurato: si usa quello", provati };
  }
  provati.push("token (assente)");
  if (o) {
    provati.push("origin");
    return { canale: "origin", url: "origin", motivo: `nessun token, ma il remote origin risponde (${urlSenzaSegreti(o)}): si pubblica da lì`, provati };
  }
  provati.push("origin (assente)");
  return {
    canale: null,
    url: null,
    motivo:
      "nessun canale per pubblicare: non c'è un token (GIT_PUSH_TOKEN / GIT_TOKEN / GITHUB_TOKEN) e non c'è nemmeno un remote origin da cui ereditare l'autenticazione",
    provati,
  };
}

/** @param {RepoConfig} cfg */
export function gitAuthUrl(cfg) {
  const scelta = scegliCanalePush({
    token: cfg.token,
    origin: cfg.origin !== undefined ? cfg.origin : remoteOrigin(cfg.cwd),
    slug: cfg.slug,
  });
  // Il messaggio dice QUALI canali ha provato e perché ha smesso, invece del generico
  // «Authentication failed» che non fa capire nemmeno da dove ripartire.
  if (!scelta.url) throw new Error(`Non posso pubblicare su ${cfg.slug}: ${scelta.motivo}. Canali provati: ${scelta.provati.join(" → ")}.`);
  return scelta.url;
}

// --- Segnali per il Pannello (tabella impostazioni del Supabase MEMORIA) ---
// Ogni operazione dell'automazione lascia un battito: chiave = "automazione:<nome>",
// valore = "ok|errore · dettaglio · AAAA-MM-GG HH:MM". Il Pannello li mostra e
// l'AD li controlla a ogni giro (sentinella). Se Supabase non è configurato, no-op.

// AR-119 — il confine della firma. Questa è l'UNICA scrittura del cervello su `impostazioni` che
// passa da qui, e tocca solo il prefisso dichiarato sotto. La chiave di servizio potrebbe scrivere
// qualunque riga, `azione:<id>:firma` compresa: il confine non è nei permessi, è qui. Il guardiano
// `cervello/firma-check.mjs` legge questa riga e fallisce se compare una chiave di firma.
export const CHIAVI_SCRITTE = ["automazione:"];

export async function stampSegnale(nome, esito, dettaglio = "") {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return false;
  const valore = `${esito} · ${dettaglio}`.slice(0, 500);
  try {
    const res = await fetch(`${url}/rest/v1/impostazioni?on_conflict=chiave`, {
      method: "POST",
      // ═══════════════════════════════════════════════════════════════════════════════════════
      // AR-439 — IL BATTITO CHE NON AVEVA UN TEMPO MASSIMO
      //
      // Questo `fetch` era senza `signal`. Se la memoria risponde lenta (o non risponde e tiene
      // la connessione aperta) il processo resta appeso QUI: e l'errore che produce non è un
      // rosso, è un'ATTESA — un processo fermo somiglia moltissimo a un processo che lavora.
      // Il giro che stava mandando il suo battito non finisce mai, e quel turno di macchina non
      // produce niente: niente briefing, niente code, niente proposte.
      //
      // Gli altri fetch della casa il timeout ce l'avevano già (`freschezza-segnali.mjs` usa
      // `AbortSignal.timeout(8000)`): la protezione era stata messa dove qualcuno si era
      // scottato, e mai portata nelle copie accanto. È la stessa «la regola vive in N posti e
      // N-1 restano indietro», applicata al timeout di rete — per questo, insieme al timeout,
      // nasce il contatore che li conta tutti (`cervello/attesa-senza-fine.mjs`).
      //
      // Conservativo: 8 secondi come il fratello che funziona, e un'env per cambiarlo. Un
      // battito perso non ferma niente — è già dentro un `try` che torna `false`.
      // ═══════════════════════════════════════════════════════════════════════════════════════
      signal: AbortSignal.timeout(Number(process.env.SEGNALE_TIMEOUT_MS || 8000)),
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
