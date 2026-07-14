#!/usr/bin/env node
// 👁️ SENTINELLA DATI — gli OCCHI a costo zero della macchina (veglia in tempo reale).
//
// L'IDEA (vincolo di Nicola): la macchina deve guardare TUTTO ogni 1-5 minuti SENZA bruciare token,
// e accendere il cervello (il motore AI del worker) SOLO quando trova davvero qualcosa da fare.
//
//   OCCHI (questo script)  = Node puro su REST → 0 token. Gira ogni 1-5 min via systemd timer.
//   CERVELLO (worker.sh)   = motore AI premium → brucia token. È già acceso (Restart=always) ma
//                            dorme a 5s finché la coda `lavori` è vuota. Si sveglia SOLO quando
//                            questa sentinella gli ACCODA un lavoro perché una soglia è scattata.
//
// Così la macchina è "sveglia" 24/7 a costo ~0, e il modello premium parte solo sull'evento reale.
//
// 10 SENTINELLE, due gruppi (scelta di Nicola: 5 per la MACCHINA + 5 per le AZIONI):
//   🧠 MACCHINA (auto-analisi di sé):   worker morto · sensori ciechi · salute architettura bassa ·
//                                       radiografia di sé vecchia · volano dell'apprendimento fermo
//   💼 AZIONI (business/marketplace):    ordine pagato senza payout (🔴) · calo ordini · recensione ≤2★ ·
//                                       negozio LIVE fermo 14g · carrello abbandonato da recuperare
//
// COSA FA A OGNI TICK (deterministico, sola lettura):
//   1) Kill-switch (PAUSA Pannello o pausa propria) → no-op.
//   2) Legge lo stato reale via REST + i JSON di auto-coscienza — best-effort: dato non leggibile →
//      la regola si salta, MAI numeri inventati né falsi allarmi.
//   3) Valuta le 10 soglie in modo deterministico.
//   4) DEDUP + COOLDOWN (per-regola): un evento già segnalato NON riaccende l'AI ogni minuto. Doppio
//      dedup lato DB (non accoda se un lavoro identico è già in coda) → resiste al riavvio/checkout.
//   5) TETTO DI SPESA (default 8/giorno, 3/ora) sul VOLUME. I 🔴 lo bypassano: sono CONTROLLI, non
//      volume («sotto budget si taglia il volume, mai i controlli»).
//   6) Accoda in `lavori` un lavoro di ANALISI/PROPOSTA mirato (tipo=analisi). ⛔ MAI esegui-azione:
//      la sentinella NON fa partire azioni reali 🔴 da sola. Nicola firma le azioni reali.
//      Alcuni segnali (es. worker morto) sono SOLO-ALLERTA: avvisano e basta, non accodano nulla.
//   7) Battito + (opz.) ping Telegram sui 🔴 nuovi. Aggiorna la propria memoria e il Pannello.
//
// COLORE 🟢: sola lettura + accoda solo lavori di ANALISI (reversibili) + scrive solo la propria
//            memoria. (Attivare il timer sul VPS = 🔴 Nicola.)
//
// USO:
//   node cervello/sentinella-dati.mjs            -> DRY-RUN: mostra cosa accoderebbe, NON accoda
//   node cervello/sentinella-dati.mjs --live     -> accoda davvero (è la modalità del timer)
//   node cervello/sentinella-dati.mjs --json     -> output JSON
//   SENTINELLA_DATI_LIVE=1 ...                    -> come --live (per il .service)
//
// ENV: SUPABASE_URL + SUPABASE_SERVICE_KEY (MEMORIA: legge impostazioni/lavori, accoda) ·
//      MARKETPLACE_SUPABASE_URL + MARKETPLACE_SUPABASE_KEY (marketplace, SOLA LETTURA) ·
//      opz TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID · tuning SENTINELLA_DATI_* (vedi sotto).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const LIVE = process.argv.includes("--live") || process.env.SENTINELLA_DATI_LIVE === "1";
const JSON_MODE = process.argv.includes("--json");

const MEM_URL = process.env.SUPABASE_URL?.trim();
const MEM_KEY = process.env.SUPABASE_SERVICE_KEY?.trim();
const MK_URL = process.env.MARKETPLACE_SUPABASE_URL?.trim();
const MK_KEY = process.env.MARKETPLACE_SUPABASE_KEY?.trim();

const COOLDOWN_ORE = Number(process.env.SENTINELLA_DATI_COOLDOWN_ORE || 6);
const MAX_GIORNO = Number(process.env.SENTINELLA_DATI_MAX_GIORNO || 8);
const MAX_ORA = Number(process.env.SENTINELLA_DATI_MAX_ORA || 3);
const CALO_MIN_BASE = Number(process.env.SENTINELLA_DATI_CALO_MIN_BASE || 3);
const WORKER_MORTO_MIN = Number(process.env.SENTINELLA_DATI_WORKER_MORTO_MIN || 3);
const SALUTE_MIN = Number(process.env.SENTINELLA_DATI_SALUTE_MIN || 60);
const RADIOGRAFIA_MAX_GG = Number(process.env.SENTINELLA_DATI_RADIOGRAFIA_MAX_GG || 10);
const VOLANO_MIN = Number(process.env.SENTINELLA_DATI_VOLANO_MIN || 0.3);

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const STATE_PATH = join(VAULT, "sentinella-dati.json");
const CECITA_PATH = join(VAULT, "sensori-cecita.json");
const STORICO_PATH = join(VAULT, "storico-salute.json");
const RADIOGRAFIA_PATH = join(VAULT, "auto-radiografia.json");
const APPRENDIMENTO_PATH = join(VAULT, "apprendimento.json");
const CASSA_RUNWAY_PATH = join(VAULT, "cassa-runway.json"); // AR-035: la sentinella M6 LEGGE il file del sensore-cassa
const FONTI_SALUTE_PATH = join(AD_ROOT, "cervello/fonti-salute.json"); // AR-036: consumatore fonti web
const CASSA_SCONOSCIUTO_GIRI = Number(process.env.SENTINELLA_DATI_CASSA_SCONOSCIUTO_GIRI || 5);

// ---------- util ----------
function readJson(path, fallback = {}) {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fallback; }
}
function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}
const isoFa = (ms) => new Date(Date.now() - ms).toISOString();
const oreMs = (h) => h * 3600 * 1000;

// ore trascorse da una data "AAAA-MM-DD HH:MM" (fuso Piacenza) o ISO.
function oreDa(dataStr) {
  if (!dataStr) return Infinity;
  const m = String(dataStr).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return Infinity;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  const t = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`).getTime();
  return Number.isNaN(t) ? Infinity : (Date.now() - t) / 3600000;
}

function memHeaders() {
  return { apikey: MEM_KEY, Authorization: `Bearer ${MEM_KEY}`, "Content-Type": "application/json" };
}

// Conteggio esatto via PostgREST (Prefer count=exact + Range 0-0 → Content-Range "0-0/N").
async function conta(url, key, tableAndQuery) {
  try {
    const sep = tableAndQuery.includes("?") ? "&" : "?";
    const res = await fetch(`${url}/rest/v1/${tableAndQuery}${sep}select=id`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" },
    });
    if (!res.ok) return null;
    const cr = res.headers.get("content-range"); // "0-0/123"
    const tot = cr && cr.includes("/") ? Number(cr.split("/")[1]) : null;
    return Number.isFinite(tot) ? tot : null;
  } catch { return null; }
}

async function fetchRows(url, key, tableAndQuery) {
  try {
    const res = await fetch(`${url}/rest/v1/${tableAndQuery}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function ultimoTs(url, key, table, col = "created_at") {
  const arr = await fetchRows(url, key, `${table}?select=${col}&order=${col}.desc&limit=1`);
  return arr?.[0]?.[col] || null;
}

async function leggiImpostazione(chiave) {
  if (!MEM_URL || !MEM_KEY) return null;
  const arr = await fetchRows(MEM_URL, MEM_KEY, `impostazioni?select=valore&chiave=eq.${encodeURIComponent(chiave)}&limit=1`);
  return arr?.[0]?.valore ?? null;
}

// ---------- lettura stato reale (0 token) ----------
async function leggiStatoReale(state) {
  const s = {
    // business
    ordini_tot: null, ultimo_ordine: null, ordini_24h: null, ordini_prev7d: null,
    pagati_senza_payout: null, recensioni_basse: null, recensione_ultima: null,
    negozi_fermi: null, carrelli_da_recuperare: null,
    ordini_slot_scaduto: null, // AR-071: ordini oltre lo slot promesso (expected_delivery scaduto, delivered_at nullo)
    dati_leggibili: false,
    // macchina
    worker_ultimo: null, worker_eta_min: null, lavori_in_corso: null,
    sensori_max_ciechi: 0, salute_voto: null, radiografia_ore: null, volano_tasso: null,
    // AR-035: cassa/runway (rischio esistenziale n.1) — la sentinella deve LEGGERE cassa-runway.json
    runway_mesi: null, runway_stato: null, runway_soglia: null, giri_sconosciuto: null,
    // AR-036: fonti web (sentinella-fonti.mjs → fonti-salute.json)
    fonti_allerta_critico: null,
  };

  // ===== BUSINESS (marketplace, sola lettura) =====
  if (MK_URL && MK_KEY) {
    s.ordini_tot = await conta(MK_URL, MK_KEY, "orders");
    s.ultimo_ordine = await ultimoTs(MK_URL, MK_KEY, "orders");
    s.ordini_24h = await conta(MK_URL, MK_KEY, `orders?created_at=gte.${isoFa(oreMs(24))}`);
    s.ordini_prev7d = await conta(MK_URL, MK_KEY, `orders?created_at=gte.${isoFa(oreMs(24 * 8))}&created_at=lt.${isoFa(oreMs(24))}`);
    s.dati_leggibili = s.ordini_tot !== null;

    // Ordine pagato (carta) ma senza payout dopo 24h: money stuck. COD escluso (flusso diverso:
    // il payout avviene dopo la rimessa del contante, "AWAITING_REMITTANCE" è NORMALE, non un errore).
    // Uso payout_at IS NULL (colonna definitiva) invece dell'enum payout_status → zero falsi allarmi.
    s.pagati_senza_payout = await conta(
      MK_URL, MK_KEY,
      `orders?payment_status=eq.PAID&payment_method=neq.cod&payout_at=is.null&created_at=lt.${isoFa(oreMs(24))}`
    );

    // Recensioni ≤2★ nuove (product reviews + store reviews), solo dopo l'ultima vista.
    const dopo = state.ultima_recensione_vista;
    if (dopo) {
      const filtro = `&created_at=gt.${encodeURIComponent(dopo)}`;
      const r1 = await conta(MK_URL, MK_KEY, `reviews?rating=lte.2${filtro}`);
      const r2 = await conta(MK_URL, MK_KEY, `store_reviews?rating=lte.2${filtro}`);
      s.recensioni_basse = (r1 || 0) + (r2 || 0);
    } else {
      s.recensioni_basse = 0; // primo giro: fisso la baseline (sotto), non sparo sullo storico
    }
    // timestamp dell'ultima recensione bassa in assoluto (per avanzare la baseline)
    const ultimaLow = await fetchRows(MK_URL, MK_KEY, `reviews?rating=lte.2&select=created_at&order=created_at.desc&limit=1`);
    const ultimaLowStore = await fetchRows(MK_URL, MK_KEY, `store_reviews?rating=lte.2&select=created_at&order=created_at.desc&limit=1`);
    s.recensione_ultima = [ultimaLow?.[0]?.created_at, ultimaLowStore?.[0]?.created_at].filter(Boolean).sort().pop() || null;

    // Negozio LIVE fermo da 14g: seller approvati (>14g fa) con 0 ordini negli ultimi 14 giorni.
    const sellers = await fetchRows(MK_URL, MK_KEY, `profiles?role=eq.seller&approval_status=eq.approved&select=id,store_name,created_at`);
    if (Array.isArray(sellers)) {
      const recenti = await fetchRows(MK_URL, MK_KEY, `orders?created_at=gte.${isoFa(oreMs(24 * 14))}&select=seller_id`);
      const attivi = new Set((recenti || []).map((o) => o.seller_id).filter(Boolean));
      s.negozi_fermi = sellers
        .filter((v) => oreDa(v.created_at) > 24 * 14)   // approvato da più di 14g
        .filter((v) => !attivi.has(v.id))
        .map((v) => ({ id: v.id, nome: v.store_name || v.id }));
    }

    // Carrelli abbandonati da recuperare: non recuperati, email non ancora inviata, fermi da >4h.
    s.carrelli_da_recuperare = await conta(
      MK_URL, MK_KEY,
      `abandoned_carts?recovered=is.false&recovery_email_sent_at=is.null&last_activity=lt.${isoFa(oreMs(4))}`
    );

    // AR-071 — Puntualità consegne (promessa core del modello Glovo): ordini con lo slot promesso
    // già scaduto (expected_delivery superato) ma non ancora consegnati (delivered_at nullo). È lo
    // stato OPERATIVO/temporale dell'ordine, non quello contabile: prima invisibile ai sensori.
    s.ordini_slot_scaduto = await conta(
      MK_URL, MK_KEY,
      `orders?expected_delivery=lt.${new Date().toISOString()}&delivered_at=is.null`
    );
  }

  // ===== MACCHINA (auto-coscienza: sola lettura di ciò che il cervello già scrive) =====
  // worker morto: battito worker:ultimo troppo vecchio E nessun lavoro in_corso (se ne ha uno, è vivo ma occupato).
  s.worker_ultimo = await leggiImpostazione("worker:ultimo");
  if (s.worker_ultimo) {
    const t = new Date(s.worker_ultimo).getTime();
    s.worker_eta_min = Number.isNaN(t) ? null : Math.round((Date.now() - t) / 60000);
  }
  s.lavori_in_corso = await conta(MEM_URL, MEM_KEY, "lavori?stato=eq.in_corso");

  const cecita = readJson(CECITA_PATH, {});
  s.sensori_max_ciechi = Number(cecita.meta?.max_giri_ciechi ?? 0);

  const storico = readJson(STORICO_PATH, {});
  const serie = Array.isArray(storico.serie) ? storico.serie : [];
  const ultimoSnap = serie.length ? serie[serie.length - 1] : null;
  s.salute_voto = ultimoSnap ? Number(ultimoSnap.voto_salute ?? null) : null;

  const rad = readJson(RADIOGRAFIA_PATH, {});
  s.radiografia_ore = rad.data ? oreDa(rad.data) : null;

  const sonda = rad.sonda || {};
  // Firma dello stato DECIDIBILE (ID dei difetti 'aperti-davvero', scritta dalla sonda): serve
  // a svegliare salute_bassa SOLO quando c'è qualcosa di NUOVO da decidere, non a ogni giro su
  // pending-merge/bloccanti-umani già in coda. Preferisci l'ultimo snapshot storico (durevole sul
  // ramo della memoria, main), poi la sonda in radiografia; null se nessuna delle due l'ha ancora scritta.
  const firmaSnap = ultimoSnap && ultimoSnap.firma != null ? ultimoSnap.firma : sonda.salute_firma;
  s.salute_firma = firmaSnap != null ? String(firmaSnap) : null;
  s.salute_provvisorio = typeof sonda.voto_provvisorio === "number" ? sonda.voto_provvisorio : null;
  s.salute_pending_merge = typeof sonda.pending_merge === "number" ? sonda.pending_merge : null;
  s.salute_aperti_davvero = typeof sonda.aperti_davvero === "number" ? sonda.aperti_davvero : null;
  s.salute_bloccanti_umani = typeof sonda.bloccanti_umani === "number" ? sonda.bloccanti_umani : null;
  const appr = readJson(APPRENDIMENTO_PATH, {});
  // AR-051: meta.tasso_applicazione è calcolato da tasso-lezioni.mjs (fonte deterministica).
  // sonda.tasso_applicazione è una COPIA in auto-radiografia.json — può restare stantia se il giro
  // non ha ancora ricalcolato. Preferiamo meta per evitare falsi allarmi "volano fermo".
  const tasso = typeof appr.meta?.tasso_applicazione === "number"
    ? appr.meta.tasso_applicazione
    : (typeof sonda.tasso_applicazione === "number" ? sonda.tasso_applicazione : null);
  s.volano_tasso = tasso;

  // AR-035 — cassa/runway: leggo cassa-runway.json (scritto da sensore-cassa.mjs). Chiude il buco
  // "sensore senza consumatore": il file esiste da tempo ma nessuna sentinella lo leggeva.
  const cassa = readJson(CASSA_RUNWAY_PATH, {});
  s.runway_mesi = typeof cassa.runway_mesi === "number" ? cassa.runway_mesi : null;
  s.runway_stato = typeof cassa.stato === "string" ? cassa.stato : null;
  s.runway_soglia = typeof cassa.soglia_allerta_mesi === "number" ? cassa.soglia_allerta_mesi : null;
  s.giri_sconosciuto = typeof cassa.giri_sconosciuto === "number" ? cassa.giri_sconosciuto : null;

  const fonti = readJson(FONTI_SALUTE_PATH, {});
  s.fonti_allerta_critico = Array.isArray(fonti.allerta_peso_critico) && fonti.allerta_peso_critico.length
    ? fonti.allerta_peso_critico
    : null;

  return s;
}

// ---------- le REGOLE (soglie deterministiche → evento per il cervello) ----------
// evento: { ambito, chiave, colore, reparto, titolo, firma, prompt, cooldownOre?, soloAllerta? }
function valutaRegole(s, state) {
  const eventi = [];

  // ══════════ 🧠 MACCHINA (5) ══════════

  // M1 — Worker morto: il cervello non batte da troppo e non sta lavorando. SOLO-ALLERTA (accodare
  //      sarebbe inutile: nessuno eseguirebbe il job). systemd lo riavvia; l'allerta avvisa Nicola.
  if (s.worker_eta_min !== null && s.worker_eta_min > WORKER_MORTO_MIN && (s.lavori_in_corso || 0) === 0) {
    eventi.push({
      ambito: "macchina", chiave: "worker_morto", colore: "🔴", reparto: "devops-sre", soloAllerta: true,
      cooldownOre: 0.25,
      titolo: `Worker fermo da ${s.worker_eta_min} min (nessun lavoro in corso)`,
      firma: String(s.worker_ultimo),
      prompt: `Il worker AD non batte da ${s.worker_eta_min} minuti e non ha lavori in corso: il cervello è probabilmente giù. systemd dovrebbe riavviarlo (Restart=always) — se non torna, controlla mycity-worker.service sul VPS.`,
    });
  }

  // M2 — Sensori dati ciechi ≥3 giri.
  if (s.sensori_max_ciechi >= 3) {
    eventi.push({
      ambito: "macchina", chiave: "sensori_ciechi", colore: "🟡", reparto: "AD",
      titolo: `Sensore dati cieco da ${s.sensori_max_ciechi} giri`,
      firma: String(s.sensori_max_ciechi),
      prompt: `Sentinella macchina 🧠 — SENSORE CIECO: almeno un sensore dati è cieco da ${s.sensori_max_ciechi} giri (sensori-cecita.json). Controlla il .env sul VPS e riprova la connessione. Finché è cieco NON scrivere numeri nuovi come fatti: usa la baseline di STATO + la sezione Gap.`,
    });
  }

  // M3 — Salute architettura bassa (voto < 60). Dedup su firma di STATO DECIDIBILE per curare
  //      l'alert-fatigue: la sonda distingue i difetti (a) aperti-davvero da (b) chiusi-in-codice-
  //      in-attesa-di-merge e (c) bloccanti umani già in AZIONI-IN-ATTESA. Se resta bassa SOLO per
  //      (b)+(c) — firma vuota — NON c'è nulla di NUOVO da decidere: non svegliare il cervello.
  //      Altrimenti sveglia UNA volta e ripeti solo se la firma cambia (dedupPersistente = niente
  //      re-fire a ogni giro/scadenza cooldown su condizione invariata e già accodata).
  if (typeof s.salute_voto === "number" && s.salute_voto < SALUTE_MIN) {
    const firmaNota = s.salute_firma != null;               // la sonda ha già scritto la firma?
    const nienteDaDecidere = firmaNota && s.salute_firma.length === 0;
    if (!nienteDaDecidere) {
      const ctx = s.salute_provvisorio != null
        ? ` Provvisorio 'pending-merge' ${s.salute_provvisorio}/100: ${s.salute_aperti_davvero ?? "?"} difetti aperti-davvero (da lavorare), ${s.salute_pending_merge ?? "?"} già chiusi-in-codice in attesa di merge+deploy, ${s.salute_bloccanti_umani ?? "?"} bloccanti che dipendono da Nicola (già in AZIONI-IN-ATTESA).`
        : "";
      eventi.push({
        ambito: "macchina", chiave: "salute_bassa", colore: "🟡", reparto: "AD",
        cooldownOre: 24, dedupPersistente: true,
        titolo: `Voto salute architettura ${s.salute_voto} (< ${SALUTE_MIN})`,
        // firma = stato decidibile (ID dei difetti (a)), NON il voto: il merge dei pending non ri-sveglia.
        firma: firmaNota ? s.salute_firma : String(s.salute_voto),
        prompt: `Sentinella macchina 🧠 — SALUTE BASSA: il voto salute dell'architettura è ${s.salute_voto} (< ${SALUTE_MIN}).${ctx} Concentrati sui difetti aperti-davvero: portali alla radice nel cantiere (o esegui la radiografia completa, .claude/workflows/auto-radiografia.js) e mostra a Nicola i bloccanti per impatto sulla crescita. I fix già in codice si accreditano al merge+deploy: non serve rifare l'analisi finché lo stato non cambia.`,
      });
    }
  }

  // M4 — Radiografia di sé vecchia (> 10 giorni).
  if (typeof s.radiografia_ore === "number" && s.radiografia_ore > RADIOGRAFIA_MAX_GG * 24) {
    const gg = Math.round(s.radiografia_ore / 24);
    eventi.push({
      ambito: "macchina", chiave: "radiografia_vecchia", colore: "🟡", reparto: "AD", cooldownOre: 24,
      titolo: `Ultima radiografia di sé ${gg} giorni fa (> ${RADIOGRAFIA_MAX_GG})`,
      firma: `${gg}`,
      prompt: `Sentinella macchina 🧠 — AUTO-RADIOGRAFIA SCADUTA: sono passati ${gg} giorni dall'ultima radiografia completa di te stessa. Eseguila (.claude/workflows/auto-radiografia.js) e aggiorna cantiere + storico salute + lettera a Nicola.`,
    });
  }

  // M5 — Volano dell'apprendimento fermo (tasso_applicazione lezioni < 0.3).
  if (typeof s.volano_tasso === "number" && s.volano_tasso < VOLANO_MIN) {
    eventi.push({
      ambito: "macchina", chiave: "volano_fermo", colore: "🟡", reparto: "AD", cooldownOre: 24,
      titolo: `Volano fermo: tasso applicazione lezioni ${s.volano_tasso} (< ${VOLANO_MIN})`,
      firma: String(s.volano_tasso),
      prompt: `Sentinella macchina 🧠 — VOLANO FERMO: il tasso di applicazione delle lezioni è ${s.volano_tasso} (< ${VOLANO_MIN}): il loop impara ma non applica. Radiografati per capire perché le lezioni non diventano azioni e rimetti in moto la chiusura del loop.`,
    });
  }

  // M6 — Cassa/runway critico (AR-035): rischio esistenziale n.1. Legge cassa-runway.json (sensore-cassa).
  //      🔴 finanza quando lo stato è "critico" (runway < soglia di allerta) → soldi, esistenza dell'azienda.
  if (s.runway_stato === "critico" && typeof s.runway_mesi === "number") {
    const soglia = s.runway_soglia ?? 3;
    eventi.push({
      ambito: "macchina", chiave: "cassa_runway_critico", colore: "🔴", reparto: "finanza", cooldownOre: 12,
      titolo: `Runway cassa ${s.runway_mesi} mesi (< ${soglia}): rischio esistenziale`,
      firma: String(s.runway_mesi),
      prompt: `Sentinella macchina 🧠 — CASSA/RUNWAY CRITICO: il runway è ${s.runway_mesi} mesi, sotto la soglia di allerta (${soglia} mesi) — dato da cassa-runway.json (sensore-cassa). È il rischio esistenziale n.1. Rivedi con finanza cassa disponibile e burn mensile, prepara il piano (taglio burn / incasso / fundraising) e porta a Nicola le opzioni con la raccomandazione. NON muovere denaro da solo.`,
    });
  }

  // M6b — Sensore-cassa cieco da N giri (runway 'sconosciuto', AR-039): replica M2 sul sensore-cassa.
  if (
    s.runway_stato === "sconosciuto"
    && typeof s.giri_sconosciuto === "number"
    && s.giri_sconosciuto >= CASSA_SCONOSCIUTO_GIRI
  ) {
    eventi.push({
      ambito: "macchina", chiave: "cassa_sconosciuta", colore: "🟡", reparto: "finanza", cooldownOre: 24,
      dedupPersistente: true,
      titolo: `Sensore-cassa cieco da ${s.giri_sconosciuto} giri (runway sconosciuto)`,
      firma: String(s.giri_sconosciuto),
      prompt: `Sentinella macchina 🧠 — SENSORE-CASSA CIECO: runway 'sconosciuto' da ${s.giri_sconosciuto} giri (cassa-runway.json). Verifica: Stripe spesso GIÀ ok (cassa letta); blocco tipico = BURN_MENSILE_EUR mancante nel .env VPS. Prepara diagnosi per Nicola (consegne/finanza/) — NON muovere denaro da solo.`,
    });
  }

  // M8 — Fonte web peso≥4 morta (AR-036): legge fonti-salute.json (sentinella-fonti.mjs).
  if (Array.isArray(s.fonti_allerta_critico) && s.fonti_allerta_critico.length > 0) {
    const ids = s.fonti_allerta_critico.map((x) => x.id).join(",");
    eventi.push({
      ambito: "macchina", chiave: "fonti_web_morte", colore: "🟡", reparto: "intelligence", cooldownOre: 12,
      dedupPersistente: true,
      titolo: `${s.fonti_allerta_critico.length} fonte/i web critica/e morta/e`,
      firma: ids,
      prompt: `Sentinella macchina 🧠 — FONTI WEB MORTE: fonti-salute.json segnala ${s.fonti_allerta_critico.length} fonte/i peso≥4 morte da ≥3 controlli (${ids}). Verifica URL/DNS, aggiorna radar-fonti.json se la fonte è cambiata, e prepara un piano per non spendere token su intelligence a vuoto.`,
    });
  }

  // M7 — REST cieco ORA (AR-037): MK_URL/KEY sono CONFIGURATE ma le letture REST del marketplace
  //      falliscono in tempo reale (s.dati_leggibili === false). Gli "occhi" ogni minuto vedono il REST
  //      giù: non restano muti né aspettano il giro (timer lento) — allertano SUBITO. SOLO-ALLERTA con
  //      cooldown corto: avvisa e basta, non ha senso accodare un'analisi se i dati non si leggono.
  if (MK_URL && MK_KEY && s.dati_leggibili === false) {
    eventi.push({
      ambito: "macchina", chiave: "rest_cieco", colore: "🔴", reparto: "AD", soloAllerta: true, cooldownOre: 0.5,
      titolo: "REST marketplace cieco ORA (credenziali presenti, letture fallite)",
      firma: giornoDa(new Date().toISOString()) + "H" + new Date().getHours(),
      prompt: `Sentinella macchina 🧠 — REST CIECO ORA: MARKETPLACE_SUPABASE_URL/KEY sono configurate ma le letture REST del marketplace falliscono in questo momento (dati_leggibili=false). Gli occhi sono ciechi sul business proprio ora. Controlla subito connettività/credenziali/rate-limit del Supabase marketplace. Finché è cieco NON scrivere numeri nuovi come fatti (usa baseline STATO + Gap).`,
    });
  }

  // ══════════ 💼 AZIONI (5) ══════════

  // A1 — Ordine pagato (carta) senza payout dopo 24h → 🔴 soldi fermi.
  if (s.pagati_senza_payout !== null && s.pagati_senza_payout > 0) {
    eventi.push({
      ambito: "azioni", chiave: "ordini_senza_payout", colore: "🔴", reparto: "finanza",
      titolo: `${s.pagati_senza_payout} ordini pagati (carta) senza payout da >24h`,
      firma: String(s.pagati_senza_payout),
      prompt: `Sentinella azioni 💼 — PAYOUT FERMO: ci sono ${s.pagati_senza_payout} ordini pagati con carta (payment_status=PAID) senza payout al negozio da oltre 24h (payout_at nullo). Verifica su Stripe/DB quali negozi e importi. Prepara la proposta di payout (negozio, importo, riferimento) e accodala in AZIONI-IN-ATTESA per la firma di Nicola. NON eseguire il pagamento.`,
    });
  }

  // A2 — Calo ordini −30% vs media 7g (con guardia anti-falso-positivo allo start-up).
  if (s.ordini_24h !== null && s.ordini_prev7d !== null) {
    const mediaGiorno = s.ordini_prev7d / 7;
    if (mediaGiorno >= CALO_MIN_BASE && s.ordini_24h < 0.7 * mediaGiorno) {
      const pct = Math.round((1 - s.ordini_24h / mediaGiorno) * 100);
      eventi.push({
        ambito: "azioni", chiave: "calo_ordini", colore: "🟢", reparto: "analista",
        titolo: `Ordini 24h ${s.ordini_24h} vs media 7g ${mediaGiorno.toFixed(1)}/gg (−${pct}%)`,
        firma: `${s.ordini_24h}/${mediaGiorno.toFixed(1)}`,
        prompt: `Sentinella azioni 💼 — CALO ORDINI: ultime 24h ${s.ordini_24h} ordini vs media ${mediaGiorno.toFixed(1)}/giorno negli ultimi 7g (−${pct}%). Indaga la causa sui dati reali (categorie/negozi/ore, meteo/eventi, funnel) e scrivi un mini-briefing con la mossa n.1. Se serve un'azione 🔴, preparala e accodala in AZIONI-IN-ATTESA — non eseguirla.`,
      });
    }
  }

  // A3 — Recensione ≤2★ nuova.
  if (s.recensioni_basse !== null && s.recensioni_basse > 0) {
    eventi.push({
      ambito: "azioni", chiave: "recensione_bassa", colore: "🟡", reparto: "customer-success",
      titolo: `${s.recensioni_basse} recensioni ≤2★ nuove`,
      firma: `${s.recensioni_basse}@${s.recensione_ultima || "?"}`,
      prompt: `Sentinella azioni 💼 — RECENSIONE BASSA: sono arrivate ${s.recensioni_basse} recensioni ≤2★. Leggi cosa dicono, prepara la bozza di risposta pubblica + il recupero del cliente e accoda l'invio in AZIONI-IN-ATTESA (non inviare da solo). Avvisa l'AD se emerge un problema ricorrente su prodotto/negozio.`,
    });
  }

  // A4 — Negozio LIVE fermo da 14 giorni.
  if (Array.isArray(s.negozi_fermi) && s.negozi_fermi.length > 0) {
    const nomi = s.negozi_fermi.map((n) => n.nome).slice(0, 5).join(", ");
    eventi.push({
      ambito: "azioni", chiave: "negozio_fermo", colore: "🟡", reparto: "account-negozi", cooldownOre: 24,
      titolo: `${s.negozi_fermi.length} negozi LIVE fermi da 14g: ${nomi}`,
      firma: s.negozi_fermi.map((n) => n.id).sort().join(","),
      prompt: `Sentinella azioni 💼 — NEGOZIO FERMO: ${s.negozi_fermi.length} negozi LIVE con 0 ordini negli ultimi 14 giorni (${nomi}). Prepara un check-in personalizzato anti-churn per ciascuno (health score, cosa manca, upsell catalogo) e accodalo. Se serve contattarli, prepara il messaggio pronto in AZIONI-IN-ATTESA.`,
    });
  }

  // A5 — Carrelli abbandonati da recuperare (>4h, email non ancora inviata).
  if (s.carrelli_da_recuperare !== null && s.carrelli_da_recuperare > 0) {
    eventi.push({
      ambito: "azioni", chiave: "carrello_abbandonato", colore: "🟡", reparto: "crm-lifecycle", cooldownOre: 12,
      titolo: `${s.carrelli_da_recuperare} carrelli abbandonati da recuperare (>4h)`,
      firma: String(s.carrelli_da_recuperare),
      prompt: `Sentinella azioni 💼 — CARRELLI ABBANDONATI: ${s.carrelli_da_recuperare} carrelli fermi da oltre 4h, email di recupero non ancora inviata. Prepara l'email di recupero (con l'incentivo giusto) e accodala in AZIONI-IN-ATTESA per la firma — non inviarla da solo (tocca clienti reali).`,
    });
  }

  // A6 — Puntualità consegne (AR-071): ordini oltre lo slot promesso (expected_delivery scaduto) non
  //      ancora consegnati (delivered_at nullo) → è la promessa core del modello Glovo che si sta
  //      rompendo. 🟡 operations: avvisa prima che il cliente si accorga del ritardo.
  if (s.ordini_slot_scaduto !== null && s.ordini_slot_scaduto > 0) {
    eventi.push({
      ambito: "azioni", chiave: "consegne_in_ritardo", colore: "🟡", reparto: "operations", cooldownOre: 6,
      titolo: `${s.ordini_slot_scaduto} ordini oltre lo slot promesso (in ritardo, non consegnati)`,
      firma: String(s.ordini_slot_scaduto),
      prompt: `Sentinella azioni 💼 — CONSEGNE IN RITARDO: ci sono ${s.ordini_slot_scaduto} ordini con lo slot di consegna scaduto (expected_delivery superato) e delivered_at ancora nullo: la puntualità — la promessa core del modello Glovo — si sta rompendo. Verifica con operations lo stato di ritiro/consegna di ciascun ordine, avvisa subito il cliente e recupera il ritardo. Alimenta il KPI puntualità. Se serve un rimborso/gesto commerciale, preparalo e accodalo in AZIONI-IN-ATTESA per la firma — non eseguirlo da solo.`,
    });
  }

  return eventi;
}

// ---------- dedup / cooldown / tetto ----------
function giornoDa(quando) { return String(quando).slice(0, 10); }

function valutaCooldown(ev, state) {
  const r = state.regole[ev.chiave] || {};
  const cd = typeof ev.cooldownOre === "number" ? ev.cooldownOre : COOLDOWN_ORE;
  if (r.ultima_firma === ev.firma) {
    // dedupPersistente: stessa firma = stesso stato → NON ri-scattare MAI finché lo stato non
    // cambia (nessun re-fire alla scadenza del cooldown). È la cura all'alert-fatigue su una
    // condizione invariata e già interamente in coda (es. salute_bassa da soli pending-merge).
    if (ev.dedupPersistente) return { ok: false, motivo: "stato invariato (dedup su firma)" };
    if (r.ultimo_accodato_iso) {
      const dt = Date.now() - new Date(r.ultimo_accodato_iso).getTime();
      if (dt < oreMs(cd)) return { ok: false, motivo: `cooldown (${cd}h, stessa firma)` };
    }
  }
  return { ok: true };
}

function sottoTetto(state, quando) {
  const oggi = giornoDa(quando);
  const g = state.accodati_giorno || { giorno: oggi, n: 0 };
  const nGiorno = g.giorno === oggi ? g.n : 0;
  const unOraFa = Date.now() - oreMs(1);
  const nOra = (state.accodati_ts || []).filter((t) => new Date(t).getTime() >= unOraFa).length;
  if (nGiorno >= MAX_GIORNO) return { ok: false, motivo: `tetto giorno raggiunto (${MAX_GIORNO})` };
  if (nOra >= MAX_ORA) return { ok: false, motivo: `tetto ora raggiunto (${MAX_ORA})` };
  return { ok: true };
}

// Non accodare se un lavoro identico (stessa chiave) è già in coda/in corso (dedup lato DB).
async function giaInCoda(chiave) {
  if (!MEM_URL || !MEM_KEY) return false;
  const marker = encodeURIComponent(`key=${chiave}`);
  const arr = await fetchRows(MEM_URL, MEM_KEY, `lavori?select=id&stato=in.(in_attesa,in_corso)&richiesta=like.*${marker}*&limit=1`);
  return Array.isArray(arr) && arr.length > 0;
}

async function accodaLavoro(ev) {
  const richiesta = `${ev.prompt}\n\n[sentinella-dati key=${ev.chiave} firma=${ev.firma}]`;
  const res = await fetch(`${MEM_URL}/rest/v1/lavori`, {
    method: "POST",
    headers: { ...memHeaders(), Prefer: "return=representation" },
    body: JSON.stringify({ stato: "in_attesa", tipo: "analisi", richiesta, esperto: ev.reparto || "" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const arr = await res.json().catch(() => []);
  return arr?.[0]?.id || "?";
}

async function pingTelegram(testo) {
  const tok = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chat = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!tok || !chat) return;
  await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: testo.slice(0, 3500) }),
  }).catch(() => {});
}

// ---------- main ----------
async function main() {
  const quando = nowPiacenza();

  if (!MEM_URL || !MEM_KEY) {
    const msg = "SUPABASE_URL/SERVICE_KEY (memoria) assenti: sentinella-dati no-op.";
    if (JSON_MODE) console.log(JSON.stringify({ esito: "skip", motivo: msg, quando }));
    else console.log(`⏭️  ${msg}`);
    process.exit(0);
  }

  const pausa = await leggiImpostazione("pausa");
  const pausaSent = await leggiImpostazione("sentinella-dati:pausa");
  if (pausa === "on" || pausaSent === "on") {
    await stampSegnale("sentinella-dati", "ok", `in pausa (${pausa === "on" ? "AD" : "sentinella"}) · ${quando}`);
    if (JSON_MODE) console.log(JSON.stringify({ esito: "pausa", quando }));
    else console.log(`⏸️  Sentinella dati in pausa (${quando}).`);
    process.exit(0);
  }

  const state = readJson(STATE_PATH, {
    _cosa_e: "👁️ SENTINELLA DATI: stato per dedup/cooldown/tetto delle 10 sentinelle (5 macchina + 5 azioni) che svegliano il cervello. Scritto da cervello/sentinella-dati.mjs.",
    aggiornato: quando, regole: {},
    accodati_giorno: { giorno: giornoDa(quando), n: 0 }, accodati_ts: [],
    ultima_recensione_vista: null, tick: 0, storia: [],
  });
  state.regole = state.regole || {};

  // AR-051: ricalcola meta.tasso_applicazione PRIMA di leggere lo stato — altrimenti volano_fermo
  // scatta su un tasso stantio (il tick girava solo DOPO valutaRegole, troppo tardi).
  try {
    execFileSync("node", [join(AD_ROOT, "cervello/tick-auto-coscienza-leggero.mjs")], {
      cwd: AD_ROOT,
      stdio: "ignore",
    });
  } catch {
    /* non bloccare la sentinella */
  }

  const s = await leggiStatoReale(state);
  const eventi = valutaRegole(s, state);

  const accodati = [], allertati = [], saltati = [];
  const nowIso = new Date().toISOString();

  for (const ev of eventi) {
    // 1) dedup/cooldown (per-regola). Vale anche per i 🔴: niente spam sullo stesso identico stato.
    const c = valutaCooldown(ev, state);
    if (!c.ok) { saltati.push({ chiave: ev.chiave, motivo: c.motivo }); continue; }

    // 2) SOLO-ALLERTA (es. worker morto): non accoda nulla, avvisa e registra il dedup.
    if (ev.soloAllerta) {
      if (LIVE) {
        await pingTelegram(`🔴 MyCity — ${ev.titolo}\n${ev.prompt}`);
        state.regole[ev.chiave] = { ultima_firma: ev.firma, ultimo_accodato: quando, ultimo_accodato_iso: nowIso, colore: ev.colore, soloAllerta: true };
      }
      allertati.push(ev);
      continue;
    }

    // 3) tetto di spesa — solo sul VOLUME (eventi non-🔴). I 🔴 sono CONTROLLI: passano sempre.
    if (ev.colore !== "🔴") {
      const t = sottoTetto(state, quando);
      if (!t.ok) { saltati.push({ chiave: ev.chiave, motivo: t.motivo }); continue; }
    }

    // 4) dedup lato DB (resiste al riavvio/checkout pulito)
    if (await giaInCoda(ev.chiave)) { saltati.push({ chiave: ev.chiave, motivo: "già in coda" }); continue; }

    if (!LIVE) { accodati.push({ ...ev, job: "(dry-run)" }); continue; }

    try {
      const jobId = await accodaLavoro(ev);
      state.regole[ev.chiave] = { ultima_firma: ev.firma, ultimo_accodato: quando, ultimo_accodato_iso: nowIso, ultimo_job: jobId, colore: ev.colore, ambito: ev.ambito };
      const oggi = giornoDa(quando);
      const g = state.accodati_giorno || { giorno: oggi, n: 0 };
      state.accodati_giorno = g.giorno === oggi ? { giorno: oggi, n: g.n + 1 } : { giorno: oggi, n: 1 };
      state.accodati_ts = [...(state.accodati_ts || []), nowIso].slice(-50);
      accodati.push({ ...ev, job: jobId });
    } catch (e) {
      saltati.push({ chiave: ev.chiave, motivo: `accodamento fallito: ${(e.message || e).toString().slice(0, 120)}` });
    }
  }

  // memoria del tick
  if (s.recensione_ultima) state.ultima_recensione_vista = s.recensione_ultima;
  else if (!state.ultima_recensione_vista) state.ultima_recensione_vista = nowIso; // baseline primo giro
  state.tick = (state.tick || 0) + 1;
  state.aggiornato = quando;
  state.ultimo_stato = {
    quando, dati_leggibili: s.dati_leggibili,
    ordini_tot: s.ordini_tot, ordini_24h: s.ordini_24h, pagati_senza_payout: s.pagati_senza_payout,
    recensioni_basse: s.recensioni_basse, negozi_fermi: (s.negozi_fermi || []).length, carrelli: s.carrelli_da_recuperare,
    worker_eta_min: s.worker_eta_min, sensori_max_ciechi: s.sensori_max_ciechi, salute_voto: s.salute_voto,
    radiografia_gg: s.radiografia_ore != null ? Math.round(s.radiografia_ore / 24) : null, volano_tasso: s.volano_tasso,
  };
  state.storia = (state.storia || []).slice(-99);
  const nAccodati = accodati.filter((a) => a.job && a.job !== "(dry-run)").length;
  state.storia.push({ quando, eventi: eventi.length, accodati: nAccodati, allertati: allertati.length });
  writeJson(STATE_PATH, state);

  // battito per il Pannello (gli occhi sono svegli anche quando non accodano nulla)
  const rossi = [...accodati, ...allertati].some((a) => a.colore === "🔴");
  await stampSegnale("sentinella-dati", rossi ? "warn" : "ok",
    `${eventi.length} eventi · ${nAccodati} accodati · ${allertati.length} allerte · ${saltati.length} saltati${s.dati_leggibili ? "" : " · dati ciechi"} · ${quando}`);
  await fetch(`${MEM_URL}/rest/v1/impostazioni?on_conflict=chiave`, {
    method: "POST",
    headers: { ...memHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ chiave: "sentinella-dati:ultimo", valore: quando, updated_at: nowIso }),
  }).catch(() => {});

  // ping Telegram sui 🔴 appena ACCODATI (le allerte solo-allerta hanno già pingato sopra)
  const rossiNuovi = accodati.filter((a) => a.colore === "🔴" && a.job && a.job !== "(dry-run)");
  if (rossiNuovi.length) {
    await pingTelegram(`🔴 MyCity — la sentinella ha trovato ${rossiNuovi.length} cose da decidere:\n` +
      rossiNuovi.map((a) => `• ${a.titolo}`).join("\n") + `\nL'AD sta preparando la proposta nel Pannello.`);
  }

  const out = {
    esito: "ok", quando, live: LIVE, dati_leggibili: s.dati_leggibili,
    eventi: eventi.length, accodati, allertati, saltati,
    tetto: { max_giorno: MAX_GIORNO, max_ora: MAX_ORA, oggi: state.accodati_giorno },
    stato_reale: s,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n👁️  SENTINELLA DATI — ${quando} ${LIVE ? "(LIVE)" : "(DRY-RUN)"}`);
    console.log(`   🧠 macchina: worker ${s.worker_eta_min ?? "?"}min · sensori ciechi ${s.sensori_max_ciechi} · salute ${s.salute_voto ?? "?"} · radiografia ${s.radiografia_ore != null ? Math.round(s.radiografia_ore / 24) + "gg" : "?"} · volano ${s.volano_tasso ?? "?"}`);
    console.log(`   💼 azioni: ${s.dati_leggibili ? `ordini ${s.ordini_tot} · payout-fermi ${s.pagati_senza_payout} · rec≤2★ ${s.recensioni_basse} · negozi-fermi ${(s.negozi_fermi || []).length} · carrelli ${s.carrelli_da_recuperare}` : "⛔ dati non leggibili (REST cieco)"}`);
    if (!eventi.length) console.log(`   ✅ Nessun evento oltre soglia. Cervello a riposo (0 token).`);
    for (const a of accodati) console.log(`   ${a.colore} ${a.ambito === "macchina" ? "🧠" : "💼"} ACCODATO [${a.reparto}] ${a.titolo} → job ${a.job}`);
    for (const a of allertati) console.log(`   ${a.colore} 🚨 ALLERTA (solo avviso) ${a.titolo}`);
    for (const sk of saltati) console.log(`   ⏭️  saltato ${sk.chiave}: ${sk.motivo}`);
  }

  process.exit(0);
}

main().catch(async (e) => {
  console.error("ERRORE sentinella-dati:", e.message || e);
  await stampSegnale("sentinella-dati", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  process.exit(1);
});
