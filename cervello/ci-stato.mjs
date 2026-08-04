#!/usr/bin/env node
// 🚦 LO STATO DELLA CI SULLE PR APERTE — la macchina legge i propri controlli.
//
// PERCHÉ ESISTE (Nicola, 4/8: «ho tutte queste PR aperte… vorrei che potesse leggere la CI»).
// Questa macchina apre PR da sola a ogni lavoro (`flusso.pr-sempre`) e non ha mai guardato come
// finivano i controlli. La sera del 4/8, misurato con questo strumento appena scritto: sei PR
// aperte, cinque rosse, una senza nemmeno un controllo partito. Zero segnali, zero card, zero
// tracce in memoria. Il colore delle PR viveva solo negli occhi di Nicola.
//
// COSA FA. Legge (sola lettura, nessuna scrittura su GitHub): per ogni PR aperta prende i controlli
// del commit in testa, e quando trova rosso scarica i log dei job falliti, ne estrae le righe che
// dicono il perché, e le CONFRONTA con gli stessi controlli sul ramo di partenza. Da lì esce
// l'unica risposta che serve davvero: **questo rosso l'ho causato io, o era già lì?**
//
// COSA NON FA, apposta: non mergia, non chiude PR, non pusha, non riesegue workflow. Il verdetto
// arriva a due posti che frenano — il gate di `git-merge.mjs` (non si unisce un rosso) e la sonda
// del giro — e a Nicola come riga leggibile. Riparare resta un lavoro con la sua PR.
//
// Uso:
//   node cervello/ci-stato.mjs                       # tutte le PR aperte di ad-mycity
//   node cervello/ci-stato.mjs --pr 680              # una sola
//   node cervello/ci-stato.mjs --repo mycity         # il marketplace
//   node cervello/ci-stato.mjs --pr 680 --attendi 300  # aspetta che i controlli finiscano (max N sec)
//   node cervello/ci-stato.mjs --json                # per gli script
//   node cervello/ci-stato.mjs --sonda               # riga sola per il giro
//   node cervello/ci-stato.mjs --senza-log           # non scaricare i log (più veloce, colpa ignota)
//
// Uscita (contratto guardiani, AR-322): 0 = niente da riparare · 1 = c'è una PR rossa per colpa sua
// (o mai provata) · 2 = NON HO POTUTO MISURARE (token assente, GitHub muto)

import {
  colpaDi,
  COLPA,
  codiceUscita,
  daRiparare,
  guastiEreditati,
  impronta,
  prossimaMossa,
  righeSignificative,
  STATO,
  verdetto,
} from "./ci-lettura.mjs";
import { githubRequest, nowPiacenza, resolveRepoConfig, stampSegnale } from "./git-github.mjs";
import { redigiTesto } from "./segreti-pattern.mjs";

const argv = process.argv.slice(2);
const JSON_MODE = argv.includes("--json");
const SONDA = argv.includes("--sonda");
const SENZA_LOG = argv.includes("--senza-log");
const REPO_KEY = valore("--repo") || "ad-mycity";
const PR_SOLA = Number(valore("--pr")) || 0;
const ATTENDI = Number(valore("--attendi")) || 0;

function valore(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : "";
}

/**
 * Nessuna chiamata di rete senza un limite di tempo — trovato rileggendo il lavoro, non provandolo.
 *
 * Questo strumento gira DENTRO `giro.sh`, che non mette un timeout attorno ai suoi passi. Un `fetch`
 * senza scadenza contro un GitHub che non risponde non è un errore: è un giro fermo per sempre, e
 * fermare il giro è il difetto più costoso di questa casa (il VPS fermo quaranta ore, AR-430). Venti
 * secondi bastano per ogni singola chiamata; scaduti, si esce dichiarandosi ciechi — che è il
 * verdetto vero, non un verde.
 */
const LIMITE_MS = 20_000;
const conScadenza = () => ({ signal: AbortSignal.timeout(LIMITE_MS) });

// ─────────────────────────────────────────────────────────────────────────────
// Le porte verso GitHub. Poche, e tutte in lettura.
// ─────────────────────────────────────────────────────────────────────────────

async function prAperte(cfg) {
  if (PR_SOLA) return [await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls/${PR_SOLA}`, conScadenza())];
  return githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls?state=open&per_page=50`, conScadenza());
}

/**
 * I controlli su un commit — le due specie insieme.
 *
 * GitHub ne tiene due elenchi separati e non intercambiabili: i *check run* (le Actions) e gli
 * *status* (quello che pubblicano i servizi esterni, tipo il deploy). Leggerne uno solo è il modo
 * classico di dire «verde» mentre l'altro elenco è rosso, quindi qui si prendono entrambi e si
 * riducono alla stessa forma.
 */
async function controlliDi(cfg, sha) {
  const out = [];
  const checks = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/commits/${sha}/check-runs?per_page=100`, conScadenza());
  for (const c of checks?.check_runs || []) {
    out.push({ name: c.name, status: c.status, conclusion: c.conclusion, started_at: c.started_at, url: c.html_url, job: idJob(c) });
  }
  const stato = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/commits/${sha}/status`, conScadenza());
  for (const s of stato?.statuses || []) {
    out.push({
      name: s.context,
      status: s.state === "pending" ? "in_progress" : "completed",
      conclusion: s.state === "success" ? "success" : s.state === "pending" ? null : "failure",
      started_at: s.created_at,
      url: s.target_url,
      job: 0,
    });
  }
  return out;
}

/** L'id del job sta nell'URL del check run (`…/runs/123/job/456`); l'id del check spesso coincide, ma non è garantito. */
function idJob(check) {
  const m = String(check?.html_url || check?.details_url || "").match(/\/job\/(\d+)/);
  return m ? Number(m[1]) : Number(check?.id) || 0;
}

/**
 * Il log di un job fallito, ridotto alle righe che dicono il perché.
 *
 * Passa dal redattore dei segreti prima di uscire da questa funzione. Non è formalità: un log di CI
 * contiene tutto quello che il runner ha stampato, e questa uscita finisce in un referto JSON, in una
 * riga di chat e — se il giro la raccoglie — in memoria. Un token stampato per sbaglio da uno script
 * si propagherebbe in tre posti a lettura pubblica prima che qualcuno lo veda.
 */
async function guastiDelJob(cfg, jobId) {
  if (!jobId || SENZA_LOG) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/actions/jobs/${jobId}/logs`, {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "mycity-ad-ci",
      },
      ...conScadenza(),
    });
    if (!res.ok) return null;
    const testo = await res.text();
    return righeSignificative(redigiTesto(testo)).map((r) => r.slice(0, 300));
  } catch {
    return null; // rete muta: colpa `ignota`, non «non c'era niente»
  }
}

/** Le righe di guasto di un commit intero: tutti i suoi controlli rossi messi insieme. */
async function guastiDi(cfg, controlli) {
  const righe = [];
  let lette = false;
  for (const c of controlli) {
    if (String(c.status) !== "completed" || !["failure", "timed_out", "startup_failure"].includes(String(c.conclusion))) continue;
    const r = await guastiDelJob(cfg, c.job);
    if (r === null) continue;
    lette = true;
    righe.push(...r);
  }
  return { righe, lette };
}

// ─────────────────────────────────────────────────────────────────────────────
// Il giro di lettura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Il ramo di partenza, letto UNA volta sola e riusato.
 *
 * Tutte le PR di questo repo partono da `main`: rileggerlo per ognuna vorrebbe dire moltiplicare per
 * sei le chiamate e i log scaricati, per avere sei volte la stessa risposta.
 */
async function baseDi(cfg, cache, ramo) {
  if (cache.has(ramo)) return cache.get(ramo);
  let dato = { misurata: false, impronte: new Set(), haCi: null, sha: "" };
  try {
    const commit = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/commits/${encodeURIComponent(ramo)}`, conScadenza());
    const controlli = await controlliDi(cfg, commit.sha);
    const { righe, lette } = await guastiDi(cfg, controlli);
    dato = { misurata: lette || controlli.length > 0, impronte: impronta(righe), haCi: controlli.length > 0, sha: commit.sha, righe };
  } catch {
    // La base non letta resta dichiarata così: chi legge il referto vede `base_misurata: false` e sa
    // che ogni colpa qui dentro è `ignota` per mia cecità, non perché il guasto sia nuovo.
  }
  cache.set(ramo, dato);
  return dato;
}

async function leggiPr(cfg, pr, cache) {
  const base = await baseDi(cfg, cache, pr.base?.ref || cfg.defaultBranch);
  const controlli = await controlliDi(cfg, pr.head.sha);
  const v = verdetto(controlli, base.haCi);

  let colpa = { classe: COLPA.IGNOTA, nuove: [], gia: [], perche: "nessun rosso da attribuire" };
  let righe = [];
  if (v.stato === STATO.ROSSO) {
    const g = await guastiDi(cfg, controlli);
    righe = g.righe;
    colpa = colpaDi(impronta(g.righe), base.impronte, base.misurata && g.lette);
  }

  const dato = {
    numero: pr.number,
    titolo: pr.title,
    ramo: pr.head.ref,
    base: pr.base?.ref || cfg.defaultBranch,
    sha: pr.head.sha.slice(0, 9),
    url: pr.html_url,
    verdetto: v,
    colpa,
    guasti: righe.slice(-8),
    base_misurata: base.misurata,
  };
  dato.mossa = prossimaMossa(dato);
  return dato;
}

/** L'attesa: i controlli partono in ritardo di qualche secondo e durano un minuto scarso. */
async function conAttesa(fn) {
  const scadenza = Date.now() + ATTENDI * 1000;
  for (;;) {
    const prs = await fn();
    const aspetta = prs.some((p) => p.verdetto.stato === STATO.IN_CORSO || (p.verdetto.stato === STATO.NON_MISURATO && p.verdetto.quanti === 0));
    if (!ATTENDI || !aspetta || Date.now() >= scadenza) return prs;
    await new Promise((r) => setTimeout(r, 15_000));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Come lo racconto
// ─────────────────────────────────────────────────────────────────────────────

const SEGNO = {
  [STATO.VERDE]: "✅",
  [STATO.ROSSO]: "❌",
  [STATO.IN_CORSO]: "⏳",
  [STATO.NON_MISURATO]: "⚪",
};

function stampa(prs) {
  console.log(`🚦 LA CI DELLE PR APERTE — ${nowPiacenza()}\n`);
  if (!prs.length) {
    console.log("   Nessuna PR aperta.");
    return;
  }
  for (const p of prs) {
    console.log(`   ${SEGNO[p.verdetto.stato] || "·"} PR #${p.numero} — ${p.titolo}`);
    console.log(`      ${p.ramo} → ${p.base} · ${p.verdetto.motivo}`);
    if (p.verdetto.stato === STATO.ROSSO) {
      console.log(`      colpa: ${p.colpa.classe} — ${p.colpa.perche}`);
      for (const g of (p.colpa.classe === COLPA.EREDITATA ? p.colpa.gia : p.colpa.nuove).slice(0, 3)) {
        console.log(`        · ${g}`);
      }
    }
    console.log(`      → ${p.mossa}`);
    console.log(`      ${p.url}\n`);
  }

  const riparare = daRiparare(prs);
  const ereditati = guastiEreditati(prs);
  console.log("   ── Il riassunto ──");
  console.log(`   Da riparare adesso: ${riparare.length}${riparare.length ? ` (PR ${riparare.map((p) => `#${p.numero}`).join(", ")})` : ""}`);
  if (ereditati.length) {
    console.log(`   Rossi che vengono dal ramo di partenza: ${ereditati.length} — si riparano LÀ, una volta sola:`);
    for (const e of ereditati.slice(0, 3)) console.log(`     · ${e.guasto}  (se lo trascinano ${e.pr.length} PR)`);
  }
  const mai = prs.filter((p) => p.verdetto.stato === STATO.NON_MISURATO);
  if (mai.length) console.log(`   ⚪ Mai provate da nessun controllo: ${mai.map((p) => `#${p.numero}`).join(", ")} — ⚪ non è un verde`);
}

function rigaSonda(prs) {
  const riparare = daRiparare(prs).length;
  const rosse = prs.filter((p) => p.verdetto.stato === STATO.ROSSO).length;
  const mai = prs.filter((p) => p.verdetto.stato === STATO.NON_MISURATO).length;
  return `🚦 CI: ${prs.length} PR aperte · ${rosse} rosse (${riparare} per colpa loro, ${rosse - riparare} ereditate) · ${mai} mai provate`;
}

async function main() {
  let cfg;
  try {
    cfg = resolveRepoConfig(REPO_KEY === "mycity" ? "mycity" : "ad-mycity");
  } catch (e) {
    console.error(`⚠️  CIECO: ${e.message}`);
    console.error("   Senza token non leggo i controlli — e «non ho potuto guardare» non è «è tutto verde».");
    process.exit(2);
  }

  const cache = new Map();
  let prs;
  try {
    prs = await conAttesa(async () => {
      const aperte = await prAperte(cfg);
      const fuori = [];
      for (const pr of aperte) fuori.push(await leggiPr(cfg, pr, cache));
      return fuori;
    });
  } catch (e) {
    console.error(`⚠️  CIECO: GitHub non risponde (${e.message}).`);
    process.exit(2);
  }

  const rc = codiceUscita({
    daRiparare: daRiparare(prs).length,
    nonMisurate: prs.filter((p) => p.verdetto.stato === STATO.NON_MISURATO).length,
  });

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: rc === 0, quando: nowPiacenza(), repo: cfg.slug, pr: prs }, null, 2));
  } else if (SONDA) {
    console.log(rigaSonda(prs));
    for (const p of daRiparare(prs)) console.log(`   ❌ PR #${p.numero} — ${p.mossa}`);
  } else {
    stampa(prs);
  }

  // Il battito per la Cabina: il Pannello mostra i segnali `automazione:*`, quindi da qui in avanti
  // «le PR sono rosse» è una cosa che Nicola può VEDERE senza aprire GitHub.
  await stampSegnale("ci", rc === 0 ? "ok" : "errore", rigaSonda(prs).replace(/^🚦 /, ""));
  process.exit(rc);
}

main().catch(async (e) => {
  console.error("⚠️  CIECO:", e?.message || e);
  process.exit(2);
});
