#!/usr/bin/env node
// Verifica salute sensori dati — retry REST + contatore giri-ciechi.
// 🟢 Sola lettura: NON scrive sul DB marketplace, aggiorna solo sensori-cecita.json nel vault.
//
// Risolve AR-001 / AR-003: quando Supabase/Stripe MCP cadono (es. "permission stream closed"),
// il giro usa il fallback REST (MARKETPLACE_SUPABASE_*) con retry esplicito e tiene traccia
// da quanti giri ogni sensore è cieco (non più silenzioso).
//
// Uso:
//   node cervello/verifica-sensori.mjs            -> report leggibile
//   node cervello/verifica-sensori.mjs --json     -> output JSON (per giro.sh / sentinelle)
//   node cervello/verifica-sensori.mjs --mcp-supabase=ok|cieco  -> aggiorna contatore MCP da sessione AD
//
// Exit: 0 = almeno un sensore d'AMBIENTE misurato e ok · 1 = tutti ciechi O nessun sensore
//       d'ambiente misurabile da qui (esito "non_misurato": lavora su memoria + Gap) — AR-587

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { scriviStatoSensore } from "./stato-sensori.mjs";
import { eSpentoPerDecisione, istruzioniGiro, sintesiSensori, verdettoSensori } from "./lib-sensori-verdetto.mjs";

const JSON_MODE = process.argv.includes("--json");
const RETRIES = 3;
const RETRY_MS = 2000;
const FETCH_TIMEOUT_MS = 8000;

/** fetch con timeout — un endpoint appeso degrada il sensore, non affonda il giro. */
function fetchSensore(url, init = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
// Sovrascrivibile SOLO per provare il sensore su un file finto (AR-284: la cecità sospetta va
// dimostrata facendola accadere, e non si può farla accadere sullo stato vero della macchina).
const CECITA_PATH = process.env.SENSORI_CECITA_FILE || join(VAULT, "sensori-cecita.json");

/** Classe sensore per max_giri_ciechi_dati (sentinella M2) vs infrastruttura/mani. */
const SENSOR_CLASSE = {
  supabase_rest: "dati",
  stripe_api: "dati",
  resend_api: "dati",
  supabase_memoria: "dati",
  n8n_health: "mani",
  mcp_supabase: "mcp",
  mcp_stripe: "mcp",
  sito_uptime: "uptime",
  pannello_uptime: "uptime",
  posthog_api: "optional",
  telegram_bot: "optional",
};

/** Valori .env ancora segnaposto documentazione → non_configurato, non cecità infinita. */
function isPlaceholderEnvValue(val) {
  if (!val || typeof val !== "string") return false;
  const v = val.trim().toLowerCase();
  if (!v) return false;
  return /tuo-n8n|il-tuo-n8n|your-n8n|example\.com|changeme|placeholder|insersci|<[^>]+>|\bxxx+\b|\[.*\]/.test(v);
}

/** @param {number} ms */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {() => Promise<{ok: boolean, dettaglio?: string}>} fn
 * @param {string} nome
 */
async function conRetry(fn, nome) {
  let last = "";
  for (let i = 1; i <= RETRIES; i++) {
    try {
      const r = await fn();
      // AR-284: si porta dietro anche `conteggio` — il campo che permette al giro dopo di distinguere
      // «zero ordini» da «non vedo gli ordini». Prima il ritorno veniva ricostruito e il numero cadeva.
      if (r.ok) return { ok: true, dettaglio: r.dettaglio || "ok", tentativi: i, ...(Number.isFinite(r.conteggio) ? { conteggio: r.conteggio } : {}) };
      last = r.dettaglio || "fallito";
    } catch (e) {
      last = e.message || String(e);
    }
    if (i < RETRIES) await sleep(RETRY_MS);
  }
  return { ok: false, dettaglio: `${last} (dopo ${RETRIES} tentativi)`, tentativi: RETRIES };
}

function parseMcpFlag(name) {
  const pref = `--mcp-${name}=`;
  const arg = process.argv.find((a) => a.startsWith(pref));
  if (!arg) return null;
  const v = arg.slice(pref.length).trim();
  return v === "ok" || v === "cieco" ? v : null;
}

/** AR-590: i motivi degli spenti (cervello/sensori-motivi.json) — motivo "decisione" = spento apposta. */
function leggiMotiviSensori() {
  try {
    return JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "sensori-motivi.json"), "utf8"));
  } catch {
    return null;
  }
}

function leggiCecita() {
  if (!existsSync(CECITA_PATH)) {
    return {
      _cosa_e:
        "Contatore giri-ciechi per ogni sensore dati. Aggiornato da verifica-sensori.mjs a ogni giro. Alimenta la sonda e le sentinelle.",
      // AR-287 — un verde va letto per quello che vale, non per quello che sembra.
      _cosa_NON_prova:
        "Non prova che i DATI siano giusti: prova che il canale risponde e che CONTA le righe (AR-284: da 28/7 il sensore ordini conta con Prefer:count=exact e un crollo a zero da un valore non-zero viene chiamato cecità sospetta, non notizia). Restano fuori: la correttezza dei valori e le tabelle che nessuno interroga.",
      aggiornato: nowPiacenza(),
      sensori: {},
      meta: { giri_totali: 0 },
    };
  }
  try {
    return JSON.parse(readFileSync(CECITA_PATH, "utf8"));
  } catch {
    return { aggiornato: nowPiacenza(), sensori: {}, meta: { giri_totali: 0 } };
  }
}

/**
 * @param {Record<string, {stato?: string, giri_ciechi?: number, ultimo_ok?: string, ultimo_errore?: string, canale?: string}>} prev
 * @param {string} key
 * @param {boolean} ok
 * @param {string} dettaglio
 * @param {string} canale
 */
function aggiornaSensore(prev, key, ok, dettaglio, canale, configurato = true) {
  const old = prev[key] || { giri_ciechi: 0 };
  const quando = nowPiacenza();
  // Sensore senza chiave = "non_configurato": NON è una cecità, il contatore resta a 0 così non
  // gonfia max_giri_ciechi né fa scattare la sentinella (fix del "sensore fantasma" tipo Stripe).
  if (!configurato) {
    return {
      ...old,
      stato: "non_configurato",
      giri_ciechi: 0,
      canale,
      dettaglio: dettaglio.slice(0, 200),
    };
  }
  if (ok) {
    return {
      ...old,
      stato: "ok",
      giri_ciechi: 0,
      ultimo_ok: quando,
      ultimo_errore: "",
      canale,
      dettaglio: dettaglio.slice(0, 200),
    };
  }
  return {
    ...old,
    stato: "cieco",
    giri_ciechi: (old.giri_ciechi || 0) + 1,
    ultimo_errore: dettaglio.slice(0, 200),
    canale,
    dettaglio: dettaglio.slice(0, 200),
  };
}

async function checkSupabaseMarketplace() {
  const url = process.env.MARKETPLACE_SUPABASE_URL?.trim();
  const key = process.env.MARKETPLACE_SUPABASE_KEY?.trim();
  if (!url || !key) {
    // AR-035: chiavi assenti = ambiente NON configurato (es. sessione cloud senza .env), NON una cecità
    // del VPS. Prima tornava una "cecità" secca che, scritta nel file condiviso, sovrascriveva lo stato
    // reale del VPS con una FALSA cecità. Coerente con Stripe/Resend/Sito (tutti configurato:false).
    return { ok: false, configurato: false, dettaglio: "MARKETPLACE_SUPABASE_URL/KEY assenti nel .env (ambiente non configurato)" };
  }
  // AR-284 — CONTROLLO DI LEGGIBILITÀ, non di raggiungibilità.
  // Prima bastava un HTTP 200 per dichiarare la tabella ordini leggibile: ma PostgREST con una chiave
  // che le policy RLS non autorizzano risponde 200 con una lista VUOTA. Il sensore diceva «vedo», il
  // giro leggeva zero ordini e scriveva «0 ordini» come se fosse un fatto del mondo — mentre il fatto
  // era che la chiave era cambiata. Un sensore che non distingue «non c'è niente» da «non vedo niente»
  // è peggio di un sensore spento, perché lo zero rassicura.
  //
  // Ora si conta davvero (Prefer: count=exact) e si confronta col conteggio dell'ultimo giro: un
  // crollo a zero da un valore non-zero è una CECITÀ SOSPETTA — alza il vincolo «niente numeri nuovi»
  // invece di far scrivere uno zero.
  const prima = leggiCecita().sensori?.supabase_rest || {};
  const ultimoConteggio = Number.isFinite(Number(prima.ultimo_conteggio)) ? Number(prima.ultimo_conteggio) : null;
  return conRetry(async () => {
    const res = await fetchSensore(`${url}/rest/v1/orders?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    // Content-Range: "0-0/37" → 37. Se l'header manca, non possiamo contare: lo diciamo.
    const range = res.headers?.get?.("content-range") || "";
    const m = range.match(/\/(\d+)\s*$/);
    if (!m) {
      return { ok: true, dettaglio: `orders raggiungibili, conteggio non disponibile (content-range: ${range || "assente"})` };
    }
    const conteggio = Number(m[1]);
    if (conteggio === 0 && ultimoConteggio !== null && ultimoConteggio > 0) {
      return {
        ok: false,
        dettaglio: `CECITÀ SOSPETTA: orders risponde 200 ma conta 0 righe (l'ultimo giro ne contava ${ultimoConteggio}). Chiave o policy RLS cambiate? NON scrivere zero: verifica MARKETPLACE_SUPABASE_KEY.`,
      };
    }
    return { ok: true, conteggio, dettaglio: `orders CONTATI via REST: ${conteggio} righe visibili con questa chiave` };
  }, "supabase_rest");
}

async function checkStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  // AR-003b/salute-sensori: un sensore SENZA chiave è "non configurato", NON "cieco". Contarlo come cieco
  // gonfiava max_giri_ciechi all'infinito e faceva scattare la sentinella a vuoto (Stripe mai collegato).
  if (!key) {
    return { ok: false, configurato: false, dettaglio: "STRIPE_SECRET_KEY assente — Stripe non collegato (non è una cecità, è un sensore spento)" };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true, dettaglio: "balance API ok" };
  }, "stripe_api");
  return { ...r, configurato: true };
}

async function checkPostHog() {
  // Decisione Nicola 2026-07-05 (chat "togli PostHog"): sensore SPENTO finché non lo riattiva lui.
  // POSTHOG_OFF=1 (o chiave assente) → non_configurato: niente check, niente rumore, niente card.
  if (process.env.POSTHOG_OFF === "1") {
    // AR-590: `spento: true` = spento per DECISIONE (non «chiave che da qui non vedo»): lo stato
    // scritto deve dire "non_configurato", non conservare un vecchio "ok" di quando era acceso.
    return { ok: false, configurato: false, spento: true, dettaglio: "PostHog SPENTO su decisione di Nicola (5/7) — riattivare solo su suo ok (POSTHOG_OFF=0 + Personal API key)" };
  }
  const key = process.env.POSTHOG_API_KEY?.trim() || process.env.POSTHOG_PERSONAL_API_KEY?.trim();
  const host = (process.env.POSTHOG_HOST?.trim() || "https://eu.posthog.com").replace(/\/$/, "");
  // AR-022: PostHog era dichiarato sensore nella spec ma senza health-check. Se assente → non configurato.
  if (!key) {
    return { ok: false, configurato: false, dettaglio: "POSTHOG_API_KEY assente — sensore spento (decisione Nicola 5/7: non usarlo per ora), nessuna azione da accodare" };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore(`${host}/api/projects/@current`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true, dettaglio: "projects API ok" };
  }, "posthog_api");
  return { ...r, configurato: true };
}

async function checkResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  // AR-022: Resend sono le "mani" email reali. Se muore, le email approvate falliscono in silenzio.
  if (!key) {
    return { ok: false, configurato: false, dettaglio: "RESEND_API_KEY assente — invio email non monitorato" };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true, dettaglio: "domains API ok" };
  }, "resend_api");
  return { ...r, configurato: true };
}

// AR-084 (cantiere AR-067): sensore di raggiungibilità/uptime della storefront. Se il marketplace è
// giù la macchina è cieca sugli ordini e nessun sensore lo diceva. GET su MARKETPLACE_SITE_URL (Node
// puro, 0 token). Senza URL → non configurato (non è una cecità). Resta 🟡 (firma Nicola).
async function checkSito() {
  const url = process.env.MARKETPLACE_SITE_URL?.trim();
  if (!url) {
    return { ok: false, configurato: false, dettaglio: "MARKETPLACE_SITE_URL assente — uptime storefront non monitorato" };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore(url, { method: "GET", redirect: "follow" });
    if (!res.ok) {
      return { ok: false, dettaglio: `HTTP ${res.status} su ${url}` };
    }
    return { ok: true, dettaglio: `storefront raggiungibile (HTTP ${res.status})` };
  }, "sito_uptime");
  return { ...r, configurato: true };
}

async function checkSupabaseMemoria() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, configurato: false, dettaglio: "SUPABASE_URL/SERVICE_KEY assenti — DB memoria non monitorato" };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore(`${url}/rest/v1/impostazioni?select=chiave&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true, dettaglio: "impostazioni leggibili via REST (DB memoria)" };
  }, "supabase_memoria");
  return { ...r, configurato: true };
}

async function checkPannello() {
  const url = (process.env.PANNELLO_URL || process.env.CABINA_URL)?.trim();
  if (!url) {
    return { ok: false, configurato: false, dettaglio: "PANNELLO_URL/CABINA_URL assente — uptime Cabina non monitorato" };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore(url, { method: "GET", redirect: "follow" });
    if (!res.ok) {
      return { ok: false, dettaglio: `HTTP ${res.status} su ${url}` };
    }
    return { ok: true, dettaglio: `Pannello raggiungibile (HTTP ${res.status})` };
  }, "pannello_uptime");
  return { ...r, configurato: true };
}

async function checkTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return { ok: false, configurato: false, dettaglio: "TELEGRAM_BOT_TOKEN assente — notifiche approvazione non monitorate" };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore(`https://api.telegram.org/bot${token}/getMe`);
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    const data = await res.json();
    if (!data.ok) return { ok: false, dettaglio: data.description || "getMe fallito" };
    return { ok: true, dettaglio: `bot @${data.result?.username || "ok"}` };
  }, "telegram_bot");
  return { ...r, configurato: true };
}

/**
 * Il guardiano che vive FUORI dalla macchina è ancora al suo posto? (AR-371)
 *
 * Serve perché finora quell'anello non esisteva come sensore, e quindi non poteva nemmeno risultare
 * «spento»: si poteva cancellare il workflow senza che niente lo reclamasse. Un guardiano che si può
 * spegnere in silenzio è come non averlo — e questo in particolare è l'unico che parla quando è il
 * VPS a tacere, quindi il suo silenzio non lo noterebbe nessun altro.
 *
 * Non fa rete: guarda il file. È l'unico modo onesto di misurarlo da entrambe le case.
 */
async function checkWatchdogEsterno() {
  const p = join(AD_ROOT, ".github/workflows/battito-esterno.yml");
  if (!existsSync(p)) {
    return { ok: false, configurato: true, dettaglio: "battito-esterno.yml assente — nessun guardiano gira fuori dal VPS: se la macchina si ferma non lo dice nessuno" };
  }
  const yml = readFileSync(p, "utf8");
  if (!/^\s*schedule:/m.test(yml) || !/cron:/.test(yml)) {
    return { ok: false, configurato: true, dettaglio: "battito-esterno.yml esiste ma non ha uno schedule: non parte da solo, quindi non sorveglia niente" };
  }
  if (!/node cervello\/battito-esterno\.mjs/.test(yml)) {
    return { ok: false, configurato: true, dettaglio: "battito-esterno.yml non chiama più il controllo: il guardiano gira a vuoto" };
  }
  return { ok: true, configurato: true, dettaglio: "guardiano esterno presente e schedulato (GitHub Actions, indipendente dal VPS)" };
}

async function checkN8n() {
  const url = process.env.N8N_WEBHOOK_URL?.trim() || process.env.N8N_HEALTH_URL?.trim();
  if (!url) {
    return { ok: false, configurato: false, dettaglio: "N8N_WEBHOOK_URL/HEALTH_URL assente — hub mani non monitorato" };
  }
  if (isPlaceholderEnvValue(url)) {
    return {
      ok: false,
      configurato: false,
      dettaglio: `N8N URL segnaposto (${url.slice(0, 80)}) — hub mani non collegato`,
    };
  }
  const healthUrl = process.env.N8N_HEALTH_URL?.trim() || url.replace(/\/webhook.*$/i, "/healthz");
  if (isPlaceholderEnvValue(healthUrl)) {
    return {
      ok: false,
      configurato: false,
      dettaglio: `N8N_HEALTH_URL segnaposto (${healthUrl.slice(0, 80)}) — hub mani non collegato`,
    };
  }
  const r = await conRetry(async () => {
    const res = await fetchSensore(healthUrl, { method: "GET" });
    if (!res.ok) {
      return { ok: false, dettaglio: `HTTP ${res.status} su ${healthUrl}` };
    }
    return { ok: true, dettaglio: "n8n health ok" };
  }, "n8n_health");
  return { ...r, configurato: true };
}

async function main() {
  const quando = nowPiacenza();
  const cecita = leggiCecita();
  // Una copia di com'era PRIMA: `cecita` viene riscritto sensore per sensore mentre i
  // controlli girano, quindi a fine giro il vecchio valore non c'è più. Serve per non
  // calpestare i sensori che questa esecuzione non ha potuto misurare (AR-573).
  const esistente = structuredClone(cecita);
  cecita.meta = cecita.meta || {};
  cecita.meta.giri_totali = (cecita.meta.giri_totali || 0) + 1;

  const checks = [];

  const sb = await checkSupabaseMarketplace();
  checks.push({ nome: "supabase_rest", ...sb, canale: "MARKETPLACE_SUPABASE_*" });
  cecita.sensori = cecita.sensori || {};
  cecita.sensori.supabase_rest = aggiornaSensore(
    cecita.sensori,
    "supabase_rest",
    sb.ok,
    sb.dettaglio,
    "REST marketplace",
    sb.configurato   // AR-035: se le chiavi mancano, non è cecità → non gonfia i giri_ciechi
  );
  // AR-284: il conteggio serve al giro DOPO — è il metro con cui si riconosce un crollo a zero come
  // cecità sospetta invece che come notizia. Si aggiorna solo quando abbiamo davvero contato.
  if (Number.isFinite(sb.conteggio)) cecita.sensori.supabase_rest.ultimo_conteggio = sb.conteggio;

  const st = await checkStripe();
  checks.push({ nome: "stripe_api", ...st, canale: "STRIPE_SECRET_KEY" });
  cecita.sensori.stripe_api = aggiornaSensore(
    cecita.sensori,
    "stripe_api",
    st.ok,
    st.dettaglio,
    "Stripe API",
    st.configurato
  );

  const ph = await checkPostHog();
  checks.push({ nome: "posthog_api", ...ph, canale: "POSTHOG_API_KEY" });
  cecita.sensori.posthog_api = aggiornaSensore(
    cecita.sensori,
    "posthog_api",
    ph.ok,
    ph.dettaglio,
    "PostHog API",
    ph.configurato
  );

  const rs = await checkResend();
  checks.push({ nome: "resend_api", ...rs, canale: "RESEND_API_KEY" });
  cecita.sensori.resend_api = aggiornaSensore(
    cecita.sensori,
    "resend_api",
    rs.ok,
    rs.dettaglio,
    "Resend API",
    rs.configurato
  );

  // AR-084 (cantiere AR-067): storefront reachability come sensore attivo.
  const sito = await checkSito();
  checks.push({ nome: "sito_uptime", ...sito, canale: "MARKETPLACE_SITE_URL" });
  cecita.sensori.sito_uptime = aggiornaSensore(
    cecita.sensori,
    "sito_uptime",
    sito.ok,
    sito.dettaglio,
    "storefront GET",
    sito.configurato
  );

  const sbMem = await checkSupabaseMemoria();
  checks.push({ nome: "supabase_memoria", ...sbMem, canale: "SUPABASE_URL" });
  cecita.sensori.supabase_memoria = aggiornaSensore(
    cecita.sensori,
    "supabase_memoria",
    sbMem.ok,
    sbMem.dettaglio,
    "REST memoria",
    sbMem.configurato
  );

  const pannello = await checkPannello();
  checks.push({ nome: "pannello_uptime", ...pannello, canale: "PANNELLO_URL" });
  cecita.sensori.pannello_uptime = aggiornaSensore(
    cecita.sensori,
    "pannello_uptime",
    pannello.ok,
    pannello.dettaglio,
    "Cabina GET",
    pannello.configurato
  );

  const tg = await checkTelegram();
  checks.push({ nome: "telegram_bot", ...tg, canale: "TELEGRAM_BOT_TOKEN" });
  cecita.sensori.telegram_bot = aggiornaSensore(
    cecita.sensori,
    "telegram_bot",
    tg.ok,
    tg.dettaglio,
    "Telegram getMe",
    tg.configurato
  );

  const wd = await checkWatchdogEsterno();
  // `dipende_da_env: false` — questo controllo guarda un file nel repo, non una chiave.
  // Dice sempre «configurato», ed è giusto per lui. Ma il suo sì NON deve far parte del
  // voto che apre la porta di scrittura: da una sessione senza chiavi bastava lui a far
  // passare per «misurati» tutti gli altri, che invece erano solo invisibili da qui.
  checks.push({ nome: "watchdog_esterno", ...wd, canale: "GitHub Actions", dipende_da_env: false });
  cecita.sensori.watchdog_esterno = aggiornaSensore(
    cecita.sensori,
    "watchdog_esterno",
    wd.ok,
    wd.dettaglio,
    "battito-esterno.yml",
    wd.configurato
  );

  const n8n = await checkN8n();
  checks.push({ nome: "n8n_health", ...n8n, canale: "N8N_WEBHOOK_URL" });
  cecita.sensori.n8n_health = aggiornaSensore(
    cecita.sensori,
    "n8n_health",
    n8n.ok,
    n8n.dettaglio,
    "n8n healthz",
    n8n.configurato
  );

  const mcpSb = parseMcpFlag("supabase");
  if (mcpSb) {
    const ok = mcpSb === "ok";
    cecita.sensori.mcp_supabase = aggiornaSensore(
      cecita.sensori,
      "mcp_supabase",
      ok,
      ok ? "MCP Supabase raggiungibile in sessione" : "MCP Supabase cieco (permission stream closed / needsAuth)",
      "MCP Cursor/Claude"
    );
    checks.push({
      nome: "mcp_supabase",
      ok,
      dettaglio: cecita.sensori.mcp_supabase.dettaglio,
      canale: "MCP",
    });
  } else if (!cecita.sensori.mcp_supabase) {
    cecita.sensori.mcp_supabase = {
      stato: "non_verificato",
      giri_ciechi: 0,
      canale: "MCP Cursor/Claude",
      dettaglio: "Non testabile da script: l'AD aggiorna con --mcp-supabase=ok|cieco in auto-analisi",
    };
  }

  const mcpStripe = parseMcpFlag("stripe");
  if (mcpStripe) {
    const ok = mcpStripe === "ok";
    cecita.sensori.mcp_stripe = aggiornaSensore(
      cecita.sensori,
      "mcp_stripe",
      ok,
      ok ? "MCP Stripe raggiungibile" : "MCP Stripe cieco",
      "MCP Cursor/Claude"
    );
  }

  // AR-587: il verdetto passa dalla funzione pura. «ok» solo se almeno un sensore d'AMBIENTE
  // (chiavi/rete) è stato misurato e risponde: il guardiano esterno — che legge un file nel repo
  // ed è verde anche da una sessione cloud senza chiavi — non può più far uscire "ok" da solo.
  // Se NESSUN sensore d'ambiente era misurabile, l'esito è "non_misurato": cecità dichiarata,
  // non un verde finto. I sensori spenti (senza chiave) restano fuori dal conto dei ciechi.
  const verdetto = verdettoSensori(checks);
  const esito = verdetto.esito;
  // FIX gate-verità (AR-011): il freno "niente numeri inventati" NON deve dipendere da "almeno un sensore
  // qualsiasi vivo" (uptime/stripe/posthog possono essere ok mentre supabase_rest è cieco → ordini/clienti
  // sarebbero comunque ciechi). Esponiamo un segnale SPECIFICO sulla fonte-di-verità dei dati: se
  // supabase_rest non è 'ok', i numeri ordini/clienti sono ciechi. giro.sh legge questo flag per il vincolo HARD.
  const datiOrdiniCiechi = !sb.ok;
  // max cecità SOLO sui sensori realmente "cieco" (esclude i "non_configurato").
  const maxCecita = Math.max(
    0,
    ...Object.values(cecita.sensori)
      .filter((s) => s.stato === "cieco")
      .map((s) => s.giri_ciechi || 0)
  );
  // M2 sentinella: solo fonti-di-verità dati (REST/Stripe/Resend/memoria), non mani/uptime/MCP.
  const maxCecitaDati = Math.max(
    0,
    ...Object.entries(cecita.sensori)
      .filter(([key, s]) => s.stato === "cieco" && SENSOR_CLASSE[key] === "dati")
      .map(([, s]) => s.giri_ciechi || 0)
  );

  cecita.aggiornato = quando;
  // AR-587: le istruzioni non affermano cose non misurate (il vecchio «Stripe ok ma Supabase
  // REST cieco» usciva anche quando Stripe non era stato misurato affatto).
  cecita.istruzioni_giro = istruzioniGiro(esito, sb.ok);

  cecita.meta.sensori_ok = verdetto.ok_configurati;
  cecita.meta.sensori_totali = verdetto.configurati;
  cecita.meta.sensori_non_configurati = verdetto.non_configurati;
  cecita.meta.sensori_ambiente_misurati = verdetto.misurati_ambiente;   // AR-587: 0 = cecità dichiarata
  cecita.meta.max_giri_ciechi = maxCecita;
  cecita.meta.max_giri_ciechi_dati = maxCecitaDati;
  cecita.meta.almeno_un_dato = esito === "ok";
  cecita.meta.dati_ordini_ciechi = datiOrdiniCiechi;   // FIX gate-verità: fonte-di-verità (supabase_rest) cieca?

  // AR-035: scrivi lo stato condiviso (quello che il Pannello mostra a Nicola) SOLO se questo è un vero
  // ambiente-sensori (almeno una chiave presente) o è un aggiornamento MCP esplicito. Da una sessione
  // cloud senza chiavi NON tocchiamo il file: altrimenti una falsa cecità sovrascrive lo stato reale del VPS.
  // AR-573: il voto conta SOLO i sensori che dipendono davvero dall'ambiente. Prima era
  // `checks.some(...)` su tutti, e il guardiano esterno — che non legge chiavi e risponde
  // sempre «configurato» — da solo apriva la porta. Risultato misurato l'11/8 alle 02:30:
  // da una sessione senza chiavi, 10 sensori a posto su 12 diventavano 3, con data fresca.
  const dipendentiDaEnv = checks.filter((c) => c.dipende_da_env !== false);
  const ambienteConfigurato = dipendentiDaEnv.some((c) => c.configurato !== false);
  const aggiornamentoMcp = mcpSb !== null || mcpStripe !== null;
  const scriviStato = ambienteConfigurato || aggiornamentoMcp;

  // AR-573, seconda mossa: la porta si chiude sul SINGOLO sensore, non sul file intero.
  // Anche quando si scrive, un sensore che questa esecuzione non ha potuto misurare non
  // si tocca: tiene il valore di chi l'aveva misurato davvero. Senza questo, bastava una
  // sola chiave presente per riscrivere a «non configurato» tutti gli altri.
  // AR-590: la protezione qui sotto è per i sensori che QUESTA sessione non poteva vedere
  // (chiave assente da qui, magari presente sul VPS). Un sensore spento per DECISIONE del
  // proprietario (POSTHOG_OFF=1, o motivo "decisione" in sensori-motivi.json) non è in quella
  // famiglia: il suo stato vero È "non_configurato", e ripristinare il vecchio "ok" lo faceva
  // risultare acceso per sempre.
  const motiviSensori = leggiMotiviSensori();
  if (scriviStato && esistente?.sensori) {
    for (const c of checks) {
      if (c.configurato !== false || c.dipende_da_env === false) continue;
      if (eSpentoPerDecisione(c, motiviSensori)) continue;   // AR-590: spento apposta → resta "non_configurato"
      const prima = esistente.sensori[c.nome];
      if (!prima) continue;
      cecita.sensori[c.nome] = { ...prima, non_misurato_qui: `${quando}: ${c.dettaglio}` };
    }
  }
  // AR-281: la guardia non vive più qui dentro come variabile locale — passa dalla porta condivisa,
  // la stessa che usano cassa, delta-gate e sentinella-fonti. Una regola di classe, un punto solo.
  const esitoScrittura = scriviStatoSensore(CECITA_PATH, cecita, {
    ambienteConfigurato: scriviStato,
    motivo: "nessuna chiave sensore nell'ambiente e nessun aggiornamento MCP",
  });

  // AR-591: il denominatore sono i sensori CONFIGURATI, gli spenti si dichiarano a parte —
  // «7/11 ok» con 4 spenti faceva sembrare rotti 4 sensori che erano spenti apposta.
  const sintesi = sintesiSensori(verdetto, maxCecita);

  if (scriviStato) {
    await stampSegnale("sensori", esito === "ok" ? "ok" : "errore", `${sintesi} · ${quando}`);
  }

  const out = {
    esito,   // AR-587: "ok" | "cieco" | "non_misurato" (prima "non_misurato" usciva come "ok")
    quando,
    sintesi,
    checks,
    istruzioni_giro: cecita.istruzioni_giro,
    sensori: cecita.sensori,
    max_giri_ciechi: maxCecita,
    max_giri_ciechi_dati: maxCecitaDati,
    // FIX gate-verità: giro.sh legge questo flag (grep nel JSON) per il vincolo HARD indipendentemente
    // dall'exit-code (che è 0 se un QUALSIASI sensore configurato è vivo, anche solo l'uptime).
    datiOrdiniCiechi,
    sensori_ambiente_misurati: verdetto.misurati_ambiente,   // AR-587: 0 = nessuna misura vera da qui
    stato_persistito: scriviStato,   // AR-035: false = ambiente non configurato, file del VPS preservato
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n📡 VERIFICA SENSORI — ${quando}\n`);
    for (const c of checks) {
      console.log(`${c.ok ? "✅" : "❌"} ${c.nome.padEnd(18)} ${c.dettaglio}`);
    }
    console.log(`\n${cecita.istruzioni_giro}`);
    console.log(`\n${esitoScrittura.spiegazione}`);
    if (maxCecitaDati >= 3) {
      console.log(`\n⚠️  Sentinella: fonte dati cieca da ${maxCecitaDati} giri consecutivi.`);
    } else if (maxCecita >= 3) {
      console.log(`\nℹ️  Infrastruttura cieca (max ${maxCecita} giri) ma fonti dati ok — niente vincolo numeri.`);
    }
  }

  // AR-587: exit 0 SOLO se almeno un sensore d'ambiente è stato misurato ed è ok. Un giro senza
  // chiavi esce 1 ("non_misurato"): giro.sh applica il vincolo baseline invece di fidarsi di un
  // verde che non ha misurato niente.
  process.exit(esito === "ok" ? 0 : 1);
}

main().catch(async (e) => {
  console.error("ERRORE verifica-sensori:", e.message || e);
  await stampSegnale("sensori", "errore", `crash: ${(e.message || e).toString().slice(0, 200)}`);
  process.exit(1);
});
