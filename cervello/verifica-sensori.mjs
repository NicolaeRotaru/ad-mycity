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
//   node cervello/verifica-sensori.mjs --sola-lettura  -> stampa il verdetto e NON scrive niente
//       (AR-568: è il modo giusto di diagnosticare i sensori da una sessione che non deve lasciare
//        impronte nella memoria condivisa)
//
// Exit (contratto AR-322, tre codici — AR-662):
//   0 = almeno un sensore d'AMBIENTE misurato e ok
//   1 = i sensori d'ambiente c'erano e NESSUNO risponde (esito "cieco": guasto vero, misurato)
//   2 = da qui non c'era niente da misurare, nessuna chiave (esito "non_misurato": lavora su
//       memoria + Gap). NON è un guasto della macchina: è un buco nel punto d'osservazione.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { scriviStatoSensore } from "./stato-sensori.mjs";
import { pathToFileURL } from "node:url";
import { fileMemoriaDaLeggere, decidiDestinazione } from "./casa-memoria.mjs";
// AR-568 · AR-446 — la penna condivisa. `stato-sensori.mjs` è la porta della guardia d'AMBIENTE
// (AR-281), ma la sua penna di default è un `writeFileSync` crudo: il freno della memoria
// (`cervello/casa-memoria.mjs`) non lo attraversa, e una prova che lancia questo comando riscrive la
// memoria dei sensori VERA anche quando ha deviato tutto il resto. Passandogli la penna, la scrittura
// dei sensori torna dentro l'unico punto che sa se questa corsa deve scrivere e dove.
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { decadiAutoDichiarato, eSpentoPerDecisione, istruzioniGiro, sintesiSensori, verdettoSensori } from "./lib-sensori-verdetto.mjs";
import { codiceUscitaSensori, misuraScaduta } from "./misura-o-cieco.mjs";
// AR-568 (b): la decisione «questa misura può prendere il posto di quella che c'è?» sta in un modulo
// puro, dove un test la esegue senza chiavi e senza sensori.
import { affiancaMisura, decidiScrittura, origineCorrente } from "./scrittura-misura.mjs";

/**
 * AR-364 — dopo quanto un «ok» che si è dato la macchina da sola smette di valere.
 *
 * Default 12 ore = sei giri del battito da 2h. Non è una punizione: è la differenza fra «l'ho provato
 * stamattina» e «l'ho provato undici giorni fa e da allora nessuno ci ha più guardato».
 */
const MCP_DECADENZA_MIN = Number(process.env.MCP_DECADENZA_MIN || 720);
const scadutaMcp = (quando) => misuraScaduta(quando, MCP_DECADENZA_MIN);

const JSON_MODE = process.argv.includes("--json");

/**
 * AR-568 (c) — «guarda ma non toccare».
 *
 * Il modo giusto di diagnosticare i sensori da fuori: stampa il verdetto e NON scrive niente nella
 * memoria condivisa. Serve perché il gesto che ha causato il difetto era innocente — un comando di
 * sola lettura lanciato da una sessione senza chiavi — e non aveva un modo di essere innocuo.
 * La guardia d'ambiente (AR-035/573) protegge già dal caso comune; questo dà a chi indaga un
 * interruttore esplicito che vale anche dal VPS, dove la guardia si aprirebbe.
 */
const SOLA_LETTURA = process.argv.includes("--sola-lettura");
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
const CECITA_NOMINALE = process.env.SENSORI_CECITA_FILE || join(VAULT, "sensori-cecita.json");
// ⚠️ SI LEGGE DA DOVE SI SCRIVERÀ, non dal nome del file. La guardia «cieco non sovrascrive vedente»
// confronta la misura nuova con quella che sta per sostituire: se la scrittura è deviata in una
// sabbiera e il confronto resta sul file VERO, la guardia giudica un file che non toccherà — e
// rifiuta la scrittura per colpa di una misura che nessuno stava per perdere. Il 16/8 è successo:
// il server aveva scritto una misura più ricca, e due prove sono diventate rosse senza che una riga
// di codice fosse cambiata. Il lettore che conosce la deviazione esiste già ed è di casa.
const CECITA_PATH = fileMemoriaDaLeggere(CECITA_NOMINALE, { env: process.env, esiste: existsSync });
// E la DESTINAZIONE, che è un'altra domanda. Per LEGGERE il dato di partenza il ripiego sul file
// vero è giusto (una sabbiera senza copia deve poter partire dai numeri veri). Per decidere se
// SOVRASCRIVERE no: lì si difende il file che si sta per toccare, e se la scrittura è deviata quel
// file è la copia in sabbiera. Confondere le due fa rifiutare una scrittura per proteggere una
// misura che nessuno stava per perdere — ed è il rosso comparso il 16/8.
const CECITA_DESTINAZIONE = decidiDestinazione(CECITA_NOMINALE, { env: process.env }).percorso;

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

/** Il JSON di un percorso, o `null` se non c'è o non si legge. Serve a guardare la DESTINAZIONE. */
function leggiJsonSeC(percorso) {
  try {
    return existsSync(percorso) ? JSON.parse(readFileSync(percorso, "utf8")) : null;
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
    // Un errore di lettura NON diventa una misura: si dichiara qui e la scrittura lo tratta come
    // riparazione, non come «non c'era niente prima» (che sarebbe un errore travestito da confronto).
    cecitaLeggibile = false;
    return { aggiornato: nowPiacenza(), sensori: {}, meta: { giri_totali: 0 } };
  }
}

/** Il file c'era già? E si è potuto leggere? Due domande diverse, e servono ENTRAMBE per decidere. */
const esisteva = existsSync(CECITA_DESTINAZIONE);
let cecitaLeggibile = true;

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

async function checkPostHog(motivi = null) {
  // Decisione Nicola 2026-07-05 (chat "togli PostHog"): sensore SPENTO finché non lo riattiva lui.
  // POSTHOG_OFF=1 (o chiave assente) → non_configurato: niente check, niente rumore, niente card.
  //
  // AR-653 — LA DECISIONE VIVEVA IN UN SOLO COMPUTER. Fino al lotto 42 l'unico modo di spegnerlo era
  // `POSTHOG_OFF=1` nel `.env`, e sul VPS quella riga non c'era: lì la chiave era presente, il check
  // partiva davvero e il sensore risultava verde (ultimo_ok 13/8 14:14) mentre la decisione del
  // proprietario diceva l'opposto. Una decisione che vive in un file di ambiente non versionato non
  // esiste per nessuna altra macchina — e infatti la stessa macchina dava due risposte diverse a
  // seconda di dove la si interrogava. Adesso la decisione sta nel REGISTRO dei motivi
  // (`cervello/sensori-motivi.json`, motivo "decisione"), che viaggia col repo ed è la stessa
  // ovunque; l'env resta valido come scorciatoia locale.
  const perDecisione = motivi?.motivi?.posthog_api?.motivo === "decisione";
  if (process.env.POSTHOG_OFF === "1" || perDecisione) {
    // AR-590: `spento: true` = spento per DECISIONE (non «chiave che da qui non vedo»): lo stato
    // scritto deve dire "non_configurato", non conservare un vecchio "ok" di quando era acceso.
    const dove = perDecisione ? "registro dei motivi (cervello/sensori-motivi.json)" : "POSTHOG_OFF=1 nell'ambiente";
    return { ok: false, configurato: false, spento: true, dettaglio: `PostHog SPENTO su decisione di Nicola (5/7), dichiarata nel ${dove} — riattivare solo su suo ok (togliere la riga «decisione» + Personal API key)` };
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

  // AR-653: la decisione «PostHog spento» arriva dal registro dei motivi, non solo dal .env di una
  // macchina. Va letta PRIMA del check, o il check parte lo stesso e il sensore torna verde.
  const motiviSensori = leggiMotiviSensori();
  const ph = await checkPostHog(motiviSensori);
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
  } else {
    // AR-364 — il ramo di ripiego guarda l'ETÀ, non l'assenza.
    //
    // Prima era `else if (!cecita.sensori.mcp_supabase)`: una dichiarazione fatta una volta diventava
    // un fatto permanente del registro, e quel registro è la base su cui si conta quanti occhi sono
    // aperti. Misurato: due sensori «accesi» da undici giorni, mai più provati da nessuno.
    const d = decadiAutoDichiarato(cecita.sensori.mcp_supabase, scadutaMcp, "--mcp-supabase=ok|cieco");
    cecita.sensori.mcp_supabase = d.voce;
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
  } else {
    // Il ramo che a mcp_stripe mancava del tutto: senza, la sua voce non decadeva mai e nemmeno
    // nasceva. Un sensore che non compare nel registro è più invisibile di uno dichiarato cieco.
    const d = decadiAutoDichiarato(cecita.sensori.mcp_stripe, scadutaMcp, "--mcp-stripe=ok|cieco");
    cecita.sensori.mcp_stripe = d.voce;
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
  // AR-568 (a) — DA DOVE viene questa misura, e QUANTO ha visto.
  //
  // Il difetto: i file di misura si scrivono come fatti della MACCHINA, senza registrare il punto
  // d'osservazione. Così la misura di una sessione cloud — che è cieca per costruzione — prendeva il
  // posto di quella del VPS, e nessuno poteva accorgersene guardando il file: una misura anonima non
  // si può confrontare con nessun'altra. Il timbro non ferma niente da solo; è la riga senza la
  // quale (b) «cieco non sovrascrive vedente» e (d) il cancello di pubblicazione non sono
  // scrivibili, perché non c'è il numero da confrontare.
  cecita.origine = origineCorrente(process.env);
  cecita.copertura = verdetto.misurati_ambiente;
  // AR-286: chi ha scritto questa riga. `origine` dice da quale computer, questo dice da quale
  // programma — e sono due domande diverse quando quattro script scrivono nella stessa cartella.
  cecita.scritto_da = "verifica-sensori.mjs";
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

  // AR-568 (b) — CIECO NON SOVRASCRIVE VEDENTE, ed è la clausola che mancava.
  //
  // (a) e (c) erano già in casa: il file porta `origine` e `copertura`, e `--sola-lettura` esiste. Ma
  // nessuno CONFRONTAVA la copertura nuova con quella della misura che stava sostituendo: una misura
  // più povera vinceva solo perché era più recente. La guardia d'ambiente (AR-035/573) copre il caso
  // «nessuna chiave»; non copre quello più insidioso — una sessione con UNA chiave su dieci che
  // riscrive il quadro di chi le aveva tutte. E il caso peggiore non è il rosso, che si vede: è il
  // voto che MIGLIORA perché si è misurato di meno.
  //
  // La decisione sta in `scrittura-misura.mjs`, dove un test la esegue senza far girare i sensori.
  // Qui NON le si passa `solaLettura`: quel freno è la riga `!SOLA_LETTURA` più sotto, che ha già la
  // sua mutazione e la sua prova. Spostarlo qui la spegnerebbe in silenzio — una prova disinnescata
  // è peggio di una prova assente, perché resta verde.
  // Il ramo «nulla è cambiato oltre l'ora» qui non può scattare: `meta.giri_totali` cresce a ogni
  // esecuzione. È voluto — questo file è anche un contatore, e per un contatore l'esecuzione è il dato.
  const copertura = decidiScrittura({
    solaLettura: false,
    misuraNuova: cecita,
    // `esistente` è ciò che si è LETTO (può venire dal file vero); qui serve ciò che si sta per
    // sostituire, e se là non c'è niente non c'è niente da difendere.
    misuraVecchia: esisteva ? leggiJsonSeC(CECITA_DESTINAZIONE) ?? esistente : null,
    vecchiaLeggibile: cecitaLeggibile,
  });
  const scriviStato = (ambienteConfigurato || aggiornamentoMcp) && copertura.scrivi;

  // AR-573, seconda mossa: la porta si chiude sul SINGOLO sensore, non sul file intero.
  // Anche quando si scrive, un sensore che questa esecuzione non ha potuto misurare non
  // si tocca: tiene il valore di chi l'aveva misurato davvero. Senza questo, bastava una
  // sola chiave presente per riscrivere a «non configurato» tutti gli altri.
  // AR-590: la protezione qui sotto è per i sensori che QUESTA sessione non poteva vedere
  // (chiave assente da qui, magari presente sul VPS). Un sensore spento per DECISIONE del
  // proprietario (POSTHOG_OFF=1, o motivo "decisione" in sensori-motivi.json) non è in quella
  // famiglia: il suo stato vero È "non_configurato", e ripristinare il vecchio "ok" lo faceva
  // risultare acceso per sempre.
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
  // AR-568 (c): `--sola-lettura` chiude la porta prima della guardia d'ambiente, non dopo. Chi
  // diagnostica da fuori vede tutto il verdetto e non lascia impronte, anche là dove le chiavi ci sono.
  const esitoScrittura = scriviStatoSensore(CECITA_PATH, cecita, {
    ambienteConfigurato: scriviStato && !SOLA_LETTURA,
    motivo: SOLA_LETTURA
      ? "--sola-lettura: guardo e non scrivo (AR-568)"
      : !copertura.scrivi
        ? copertura.motivo
        : "nessuna chiave sensore nell'ambiente e nessun aggiornamento MCP",
  });

  // AR-749 — la promessa mantenuta. Quando la decisione dice «la metto accanto, non al posto», fin
  // qui non la metteva accanto nessuno: si guardava solo `scrivi`. Da una sessione con meno chiavi
  // la misura non entrava da nessuna parte, e il metro non sapeva più dire di sì. Adesso la misura
  // povera va in `misure_affiancate`, sotto il nome della sua provenienza; il quadro autorevole
  // resta intatto, che è il punto di AR-568. In `--sola-lettura` non si scrive nemmeno questo.
  if (copertura.affianca && !SOLA_LETTURA && ambienteConfigurato) {
    const conAccanto = affiancaMisura(leggiJsonSeC(CECITA_DESTINAZIONE), cecita, {
      origine: cecita.origine,
      quando,
    });
    if (conAccanto) scriviJsonAtomico(CECITA_DESTINAZIONE, conAccanto);
  }

  // AR-591: il denominatore sono i sensori CONFIGURATI, gli spenti si dichiarano a parte —
  // «7/11 ok» con 4 spenti faceva sembrare rotti 4 sensori che erano spenti apposta.
  const sintesi = sintesiSensori(verdetto, maxCecita);

  // Il segnale è una scrittura come le altre: in sola lettura non parte, o il «guardo e non tocco»
  // sarebbe vero solo per il file e falso per la memoria.
  if (scriviStato && !SOLA_LETTURA) {
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

  // AR-587 + AR-662 — il contratto di casa ha TRE codici, non due (AR-322):
  //   0 = ho misurato e va bene · 1 = ho misurato e ho trovato il guasto · 2 = NON HO POTUTO MISURARE.
  // Prima erano due (`esito === "ok" ? 0 : 1`), e da una sessione senza chiavi questo comando usciva
  // 1: stava dicendo «i sensori sono rotti» dove la verità era «da qui non li ho potuti guardare».
  // Il verso dell'errore era prudente, ma un allarme falso si impara a zittire — e chi lo zittisce
  // zittisce anche il rosso vero.
  //
  // Il codice lo decide una funzione pura (misura-o-cieco.mjs), non un ternario qui dentro: è la
  // stessa mappa che il test può eseguire senza far partire tutto il programma.
  //
  // VERIFICATO PRIMA DI CAMBIARLO, perché il rischio era di spegnere un freno che funziona:
  //   · `cervello/giro.sh:244` accende il vincolo «niente numeri nuovi» con `[ "$_sens_rc" -ne 0 ]`
  //     → il 2 lo accende esattamente come l'1. Il freno resta acceso (prova: cieco-non-compra-il-verde);
  //   · `cervello/salute.mjs` giudica questo comando con `rossoSe: (c) => c === 1` e senza `ciecoSe`
  //     → per questo `cieco` (chiavi presenti, nessun sensore risponde) RESTA 1: è un guasto vero e
  //     lassù deve continuare a diventare rosso. Solo `non_misurato` diventa 2.
  process.exit(codiceUscitaSensori(esito));
}

// 🚪 Importare questo file NON deve interrogare i sensori. Senza questa riga bastava un `import`
// per far partire il giro dei sensori e riscrivere la loro memoria — ed è la malattia che questo
// stesso lotto cura altrove. Il file girava così da prima; toccandolo, il tetto non lo assolve più.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (e) => {
    console.error("ERRORE verifica-sensori:", e.message || e);
    await stampSegnale("sensori", "errore", `crash: ${(e.message || e).toString().slice(0, 200)}`);
    process.exit(1);
  });
}
