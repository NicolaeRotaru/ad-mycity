#!/usr/bin/env node
// 👁️ SENTINELLA DATI — gli OCCHI a costo zero della macchina (upgrade "veglia in tempo reale").
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
// COSA FA A OGNI TICK (deterministico, sola lettura):
//   1) Kill-switch: se il Pannello è in PAUSA (impostazioni.pausa=on) o la sentinella è spenta
//      (sentinella-dati:pausa=on) → no-op. Zero rumore.
//   2) Legge lo stato reale via REST (ordini, payout, sensori ciechi, runway…) — best-effort:
//      una tabella non leggibile → quella regola si salta, MAI numeri inventati.
//   3) Valuta le REGOLE (soglie di sentinelle.md) in modo deterministico.
//   4) DEDUP + COOLDOWN: un evento già segnalato NON riaccende l'AI ogni 2 minuti. Riscatta solo
//      se è nuovo o è passato il cooldown (default 6h) ed è ancora attivo. Doppio controllo anche
//      a livello DB (non accoda se c'è già un job identico in coda) → resiste al checkout pulito.
//   5) TETTO DI SPESA: max N job auto-accodati per giorno/ora (default 6/gg, 2/h). Oltre il tetto
//      NON accoda: alza solo un segnale (sotto budget: taglia il volume, MAI i controlli).
//   6) Accoda in `lavori` un lavoro di ANALISI/PROPOSTA mirato (tipo=analisi) col reparto giusto.
//      ⛔ MAI tipo=esegui-azione: la sentinella NON fa partire azioni reali 🔴 da sola. Prepara
//         un'analisi/proposta che Nicola poi firma. Zero doppio-invio, zero sorprese.
//   7) Battito + (opz.) ping Telegram sui 🔴 nuovi. Aggiorna la propria memoria e il Pannello.
//
// COLORE 🟢: sola lettura sui dati + accoda solo lavori di ANALISI (reversibili) nella coda e scrive
//            solo la propria memoria. Non tocca il mondo reale. (Attivare il timer sul VPS = 🔴 Nicola.)
//
// USO:
//   node cervello/sentinella-dati.mjs            -> DRY-RUN: mostra cosa accoderebbe, NON accoda
//   node cervello/sentinella-dati.mjs --live     -> accoda davvero (è la modalità del timer)
//   node cervello/sentinella-dati.mjs --json     -> output JSON
//   SENTINELLA_DATI_LIVE=1 ...                    -> come --live (per il .service)
//
// ENV:
//   SUPABASE_URL + SUPABASE_SERVICE_KEY          (progetto MEMORIA: legge impostazioni, accoda lavori)
//   MARKETPLACE_SUPABASE_URL + MARKETPLACE_SUPABASE_KEY  (marketplace, SOLA LETTURA: ordini…)
//   Opz: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID   (ping sui 🔴 nuovi)
//   Tuning: SENTINELLA_DATI_COOLDOWN_ORE=6 · SENTINELLA_DATI_MAX_GIORNO=6 · SENTINELLA_DATI_MAX_ORA=2
//           SENTINELLA_DATI_CALO_MIN_BASE=3  (ordini/gg minimi prima di poter segnalare un calo)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const LIVE = process.argv.includes("--live") || process.env.SENTINELLA_DATI_LIVE === "1";
const JSON_MODE = process.argv.includes("--json");

const MEM_URL = process.env.SUPABASE_URL?.trim();
const MEM_KEY = process.env.SUPABASE_SERVICE_KEY?.trim();
const MK_URL = process.env.MARKETPLACE_SUPABASE_URL?.trim();
const MK_KEY = process.env.MARKETPLACE_SUPABASE_KEY?.trim();

const COOLDOWN_ORE = Number(process.env.SENTINELLA_DATI_COOLDOWN_ORE || 6);
const MAX_GIORNO = Number(process.env.SENTINELLA_DATI_MAX_GIORNO || 6);
const MAX_ORA = Number(process.env.SENTINELLA_DATI_MAX_ORA || 2);
const CALO_MIN_BASE = Number(process.env.SENTINELLA_DATI_CALO_MIN_BASE || 3);

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const STATE_PATH = join(VAULT, "sentinella-dati.json");
const CECITA_PATH = join(VAULT, "sensori-cecita.json");
const RUNWAY_PATH = join(VAULT, "cassa-runway.json");

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

async function ultimoTs(url, key, table, col = "created_at") {
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=${col}&order=${col}.desc&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    const arr = await res.json();
    return arr?.[0]?.[col] || null;
  } catch { return null; }
}

async function leggiImpostazione(chiave) {
  if (!MEM_URL || !MEM_KEY) return null;
  try {
    const res = await fetch(`${MEM_URL}/rest/v1/impostazioni?select=valore&chiave=eq.${encodeURIComponent(chiave)}&limit=1`, {
      headers: memHeaders(),
    });
    if (!res.ok) return null;
    const arr = await res.json();
    return arr?.[0]?.valore ?? null;
  } catch { return null; }
}

// ---------- lettura stato reale (0 token) ----------
async function leggiStatoReale() {
  const s = {
    ordini_tot: null, ultimo_ordine: null, ordini_24h: null, ordini_prev7d: null,
    ordini_pagati_senza_payout: null,
    sensori_max_ciechi: 0, sensori_tutti_ciechi: false,
    runway_mesi: null,
    dati_leggibili: false,
  };

  if (MK_URL && MK_KEY) {
    s.ordini_tot = await conta(MK_URL, MK_KEY, "orders");
    s.ultimo_ordine = await ultimoTs(MK_URL, MK_KEY, "orders");
    s.ordini_24h = await conta(MK_URL, MK_KEY, `orders?created_at=gte.${isoFa(oreMs(24))}`);
    // finestra dei 7 giorni PRIMA delle ultime 24h → media giornaliera di riferimento
    s.ordini_prev7d = await conta(
      MK_URL, MK_KEY,
      `orders?created_at=gte.${isoFa(oreMs(24 * 8))}&created_at=lt.${isoFa(oreMs(24))}`
    );
    s.dati_leggibili = s.ordini_tot !== null;
    // best-effort: ordini pagati senza payout (colonne incerte → null se lo schema non combacia)
    s.ordini_pagati_senza_payout = await contaPagatiSenzaPayout();
  }

  // sensori ciechi: dal file già scritto da verifica-sensori.mjs (deterministico)
  const cecita = readJson(CECITA_PATH, {});
  s.sensori_max_ciechi = Number(cecita.meta?.max_giri_ciechi ?? 0);
  s.sensori_tutti_ciechi = cecita.meta?.almeno_un_dato === false;

  // runway cassa: dal file se esiste (best-effort, oggi non ancora prodotto)
  const rw = readJson(RUNWAY_PATH, {});
  if (typeof rw.mesi === "number") s.runway_mesi = rw.mesi;
  else if (typeof rw.runway_mesi === "number") s.runway_mesi = rw.runway_mesi;

  return s;
}

// Ordini pagati ma senza payout: proviamo combinazioni di colonne plausibili, saltiamo se lo schema
// non combacia (una tabella/colonna assente NON deve produrre un falso allarme né un numero inventato).
async function contaPagatiSenzaPayout() {
  const tentativi = [
    "orders?stato=eq.paid&payout_id=is.null",
    "orders?status=eq.paid&payout_id=is.null",
    "orders?payment_status=eq.paid&payout_id=is.null",
    "orders?stato_pagamento=eq.pagato&payout_id=is.null",
  ];
  for (const q of tentativi) {
    const n = await conta(MK_URL, MK_KEY, q);
    if (n !== null) return n; // schema combacia → valore reale (anche 0)
  }
  return null; // nessuno schema combacia → non misurabile, la regola si salterà
}

// ---------- le REGOLE (soglie deterministiche → evento per il cervello) ----------
// Ogni regola torna null (non scattata / non misurabile) o un evento:
//   { chiave, colore, reparto, titolo, firma, prompt }
// chiave = identità stabile per dedup · firma = "impronta" del valore corrente (per riscattare a valore nuovo)
function valutaRegole(s, state) {
  const eventi = [];

  // R1 — Calo ordini −30% vs media 7g (con guardia anti-falso-positivo allo start-up).
  if (s.ordini_24h !== null && s.ordini_prev7d !== null) {
    const mediaGiorno = s.ordini_prev7d / 7;
    if (mediaGiorno >= CALO_MIN_BASE && s.ordini_24h < 0.7 * mediaGiorno) {
      eventi.push({
        chiave: "calo_ordini_24h",
        colore: "🟢",
        reparto: "analista",
        titolo: `Ordini ultime 24h ${s.ordini_24h} vs media 7g ${mediaGiorno.toFixed(1)}/gg (−${Math.round((1 - s.ordini_24h / mediaGiorno) * 100)}%)`,
        firma: `${s.ordini_24h}/${mediaGiorno.toFixed(1)}`,
        prompt:
          `Sentinella dati 👁️ — CALO ORDINI: nelle ultime 24h ci sono ${s.ordini_24h} ordini contro una media di ${mediaGiorno.toFixed(1)}/giorno negli ultimi 7 giorni (−${Math.round((1 - s.ordini_24h / mediaGiorno) * 100)}%). ` +
          `Indaga la causa sui dati REALI (categorie/negozi/ore, meteo/eventi, funnel). Scrivi un mini-briefing con la mossa n.1. ` +
          `Se serve un'azione 🔴 (es. push/campagna), PREPARALA e accodala in AZIONI-IN-ATTESA — non eseguirla.`,
      });
    }
  }

  // R2 — Ordine pagato senza payout (soldi veri fermi) → 🔴 preparazione, mai esecuzione.
  if (s.ordini_pagati_senza_payout !== null && s.ordini_pagati_senza_payout > 0) {
    eventi.push({
      chiave: "ordini_senza_payout",
      colore: "🔴",
      reparto: "finanza",
      titolo: `${s.ordini_pagati_senza_payout} ordini pagati senza payout al negozio`,
      firma: String(s.ordini_pagati_senza_payout),
      prompt:
        `Sentinella dati 👁️ — PAYOUT MANCANTE: ci sono ${s.ordini_pagati_senza_payout} ordini pagati per cui il payout al negozio non risulta. ` +
        `Verifica su Stripe/DB quali negozi e importi. Prepara la proposta di payout (importo, negozio, riferimento) e accodala in AZIONI-IN-ATTESA per la firma di Nicola. NON eseguire il pagamento.`,
    });
  }

  // R3 — Nuovi ordini dall'ultimo tick (reattività: verifica payout+consegna). Cooldown generoso.
  if (s.ultimo_ordine && state.ultimo_ordine_visto && s.ultimo_ordine > state.ultimo_ordine_visto) {
    const nuovi = s.ordini_24h != null ? `~${s.ordini_24h} nelle ultime 24h` : "nuovi";
    eventi.push({
      chiave: "nuovo_ordine",
      colore: "🟢",
      reparto: "operations",
      titolo: `Nuovo/i ordine/i (${nuovi})`,
      firma: s.ultimo_ordine,
      prompt:
        `Sentinella dati 👁️ — NUOVO ORDINE: è arrivato almeno un nuovo ordine (ultimo: ${s.ultimo_ordine}). ` +
        `Verifica sui dati reali che il pagamento sia ok, che il payout sia previsto e che la consegna sia assegnata. ` +
        `Se qualcosa manca, prepara la proposta e accodala in AZIONI-IN-ATTESA (non eseguire azioni reali).`,
    });
  }

  // R4 — Sensori dati ciechi da ≥3 giri (la macchina rischia di lavorare al buio).
  if (s.sensori_max_ciechi >= 3) {
    eventi.push({
      chiave: "sensori_ciechi",
      colore: "🟡",
      reparto: "AD",
      titolo: `Sensore dati cieco da ${s.sensori_max_ciechi} giri`,
      firma: String(s.sensori_max_ciechi),
      prompt:
        `Sentinella dati 👁️ — SENSORE CIECO: almeno un sensore dati è cieco da ${s.sensori_max_ciechi} giri (vedi sensori-cecita.json). ` +
        `Controlla il .env sul VPS e riprova la connessione. Finché è cieco, NON scrivere numeri nuovi come fatti: usa la baseline di STATO + la sezione Gap.`,
    });
  }

  // R5 — Runway di cassa < 3 mesi (se misurato).
  if (typeof s.runway_mesi === "number" && s.runway_mesi < 3) {
    eventi.push({
      chiave: "runway_basso",
      colore: "🔴",
      reparto: "finanza",
      titolo: `Runway di cassa ${s.runway_mesi.toFixed(1)} mesi (< 3)`,
      firma: s.runway_mesi.toFixed(1),
      prompt:
        `Sentinella dati 👁️ — RUNWAY BASSO: la cassa copre ${s.runway_mesi.toFixed(1)} mesi (< 3). ` +
        `Prepara un piano di priorità su incasso e riduzione burn e accodalo per la firma di Nicola.`,
    });
  }

  return eventi;
}

// ---------- dedup / cooldown / tetto ----------
function giornoDa(quando) { return String(quando).slice(0, 10); }

function valutaCooldown(ev, state) {
  const r = state.regole[ev.chiave] || {};
  // già accodato di recente con lo STESSO valore, entro cooldown → salta
  if (r.ultimo_accodato && r.ultima_firma === ev.firma) {
    const dt = Date.now() - new Date(r.ultimo_accodato_iso || 0).getTime();
    if (dt < oreMs(COOLDOWN_ORE)) return { ok: false, motivo: `cooldown (${COOLDOWN_ORE}h, stessa firma)` };
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
  return { ok: true, nGiorno, nOra };
}

// Non accodare se un lavoro identico (stessa chiave) è già in coda o in corso (dedup lato DB).
async function giaInCoda(chiave) {
  if (!MEM_URL || !MEM_KEY) return false;
  try {
    const marker = encodeURIComponent(`key=${chiave}`);
    const res = await fetch(
      `${MEM_URL}/rest/v1/lavori?select=id&stato=in.(in_attesa,in_corso)&richiesta=like.*${marker}*&limit=1`,
      { headers: memHeaders() }
    );
    if (!res.ok) return false;
    const arr = await res.json();
    return Array.isArray(arr) && arr.length > 0;
  } catch { return false; }
}

async function accodaLavoro(ev) {
  const richiesta =
    `${ev.prompt}\n\n[sentinella-dati key=${ev.chiave} firma=${ev.firma}]`;
  const body = JSON.stringify({
    stato: "in_attesa",
    tipo: "analisi",           // ⛔ MAI esegui-azione: solo analisi/proposta, Nicola firma le azioni reali
    richiesta,
    esperto: ev.reparto || "",
  });
  const res = await fetch(`${MEM_URL}/rest/v1/lavori`, {
    method: "POST",
    headers: { ...memHeaders(), Prefer: "return=representation" },
    body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const arr = await res.json().catch(() => []);
  return arr?.[0]?.id || "?";
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

  // Kill-switch: PAUSA globale del Pannello o pausa specifica della sentinella.
  const pausa = await leggiImpostazione("pausa");
  const pausaSent = await leggiImpostazione("sentinella-dati:pausa");
  if (pausa === "on" || pausaSent === "on") {
    await stampSegnale("sentinella-dati", "ok", `in pausa (${pausa === "on" ? "AD" : "sentinella"}) · ${quando}`);
    if (JSON_MODE) console.log(JSON.stringify({ esito: "pausa", quando }));
    else console.log(`⏸️  Sentinella dati in pausa (${quando}).`);
    process.exit(0);
  }

  const state = readJson(STATE_PATH, {
    _cosa_e:
      "👁️ SENTINELLA DATI: stato per il dedup/cooldown/tetto degli eventi che svegliano il cervello AI. Scritto da cervello/sentinella-dati.mjs.",
    aggiornato: quando,
    regole: {},              // { chiave: { ultima_firma, ultimo_accodato, ultimo_accodato_iso, ultimo_job } }
    accodati_giorno: { giorno: giornoDa(quando), n: 0 },
    accodati_ts: [],         // timestamp ISO degli ultimi accodamenti (per il tetto/ora)
    ultimo_ordine_visto: null,
    tick: 0,
    storia: [],
  });
  state.regole = state.regole || {};

  const s = await leggiStatoReale();
  const eventi = valutaRegole(s, state);

  const accodati = [];
  const saltati = [];
  const nowIso = new Date().toISOString();

  for (const ev of eventi) {
    // 1) dedup/cooldown locale (vale per TUTTI, anche i 🔴: niente spam sullo stesso identico stato)
    const c = valutaCooldown(ev, state);
    if (!c.ok) { saltati.push({ chiave: ev.chiave, motivo: c.motivo }); continue; }
    // 2) tetto di spesa — solo sul VOLUME (eventi non-🔴). I 🔴 sono CONTROLLI: passano sempre.
    //    "Sotto budget scarso: taglia il volume, MAI i controlli" (CLAUDE.md).
    if (ev.colore !== "🔴") {
      const t = sottoTetto(state, quando);
      if (!t.ok) { saltati.push({ chiave: ev.chiave, motivo: t.motivo }); continue; }
    }
    // 3) dedup lato DB (resiste al riavvio/checkout pulito)
    if (await giaInCoda(ev.chiave)) { saltati.push({ chiave: ev.chiave, motivo: "già in coda" }); continue; }

    if (!LIVE) {
      accodati.push({ ...ev, job: "(dry-run: non accodato)" });
      continue;
    }

    try {
      const jobId = await accodaLavoro(ev);
      // aggiorna lo stato di dedup/tetto
      state.regole[ev.chiave] = {
        ultima_firma: ev.firma,
        ultimo_accodato: quando,
        ultimo_accodato_iso: nowIso,
        ultimo_job: jobId,
        colore: ev.colore,
      };
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
  state.ultimo_ordine_visto = s.ultimo_ordine || state.ultimo_ordine_visto;
  state.tick = (state.tick || 0) + 1;
  state.aggiornato = quando;
  state.ultimo_stato = {
    quando, ordini_tot: s.ordini_tot, ordini_24h: s.ordini_24h,
    ordini_prev7d: s.ordini_prev7d, sensori_max_ciechi: s.sensori_max_ciechi,
    dati_leggibili: s.dati_leggibili,
  };
  state.storia = (state.storia || []).slice(-99);
  state.storia.push({ quando, eventi: eventi.length, accodati: accodati.filter((a) => a.job && a.job !== "(dry-run: non accodato)").length });
  writeJson(STATE_PATH, state);

  // battito per il Pannello (gli occhi sono svegli anche quando non accodano nulla)
  await stampSegnale(
    "sentinella-dati",
    accodati.some((a) => a.colore === "🔴") ? "warn" : "ok",
    `${eventi.length} eventi · ${accodati.length} accodati · ${saltati.length} saltati${s.dati_leggibili ? "" : " · dati ciechi"} · ${quando}`
  );
  // chiave leggibile dedicata: il Pannello può mostrare "occhi svegli, ultimo tick"
  await fetch(`${MEM_URL}/rest/v1/impostazioni?on_conflict=chiave`, {
    method: "POST",
    headers: { ...memHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ chiave: "sentinella-dati:ultimo", valore: quando, updated_at: nowIso }),
  }).catch(() => {});

  // ping Telegram sui 🔴 appena accodati
  const rossiNuovi = accodati.filter((a) => a.colore === "🔴" && a.job && a.job !== "(dry-run: non accodato)");
  const tgTok = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const tgChat = process.env.TELEGRAM_CHAT_ID?.trim();
  if (rossiNuovi.length && tgTok && tgChat) {
    const testo = `🔴 MyCity — la sentinella ha trovato ${rossiNuovi.length} cose da decidere:\n` +
      rossiNuovi.map((a) => `• ${a.titolo}`).join("\n") +
      `\nAprile nel Pannello: l'AD sta preparando la proposta.`;
    await fetch(`https://api.telegram.org/bot${tgTok}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tgChat, text: testo.slice(0, 3500) }),
    }).catch(() => {});
  }

  const out = {
    esito: "ok", quando, live: LIVE, dati_leggibili: s.dati_leggibili,
    eventi: eventi.length, accodati, saltati,
    tetto: { max_giorno: MAX_GIORNO, max_ora: MAX_ORA, oggi: state.accodati_giorno },
    stato_reale: s,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n👁️  SENTINELLA DATI — ${quando} ${LIVE ? "(LIVE)" : "(DRY-RUN)"}`);
    console.log(`   Dati: ${s.dati_leggibili ? `ordini tot ${s.ordini_tot}, 24h ${s.ordini_24h}, prev7d ${s.ordini_prev7d}` : "⛔ non leggibili (REST cieco)"} · sensori ciechi max ${s.sensori_max_ciechi}`);
    if (!eventi.length) console.log(`   ✅ Nessun evento oltre soglia. Cervello a riposo (0 token).`);
    for (const a of accodati) console.log(`   ${a.colore} ACCODATO [${a.reparto}] ${a.titolo} → job ${a.job}`);
    for (const sk of saltati) console.log(`   ⏭️  saltato ${sk.chiave}: ${sk.motivo}`);
  }
  process.exit(0);
}

main().catch(async (e) => {
  console.error("ERRORE sentinella-dati:", e.message || e);
  await stampSegnale("sentinella-dati", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  process.exit(1);
});
