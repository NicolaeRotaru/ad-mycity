#!/usr/bin/env node
// 🚦 DELTA-GATE DEL GIRO (AR-019) — "niente di nuovo → salta il giro pesante".
// 🟢 Sola lettura sui dati esterni; scrive solo auto-coscienza/delta-gate.json nel vault.
//
// Problema (AR-019): il giro parte a orario fisso (~9 volte/giorno) e ogni volta accende il
// motore AI premium anche quando FUORI non è cambiato NULLA — spreco di token/Max. La lezione
// "non moltiplicare i giri a sensori ciechi/stato fermo" era in memoria ma non era un gate
// DETERMINISTICO nel runner. Questo script È quel gate.
//
// Come funziona:
//   1) Calcola una FIRMA dello stato reale MISURABILE via REST (le stesse cose che il giro analizza):
//      - ordini: conteggio totale + timestamp dell'ultimo ordine (nuovi ordini = nuovi incassi/attività)
//      - clienti: conteggio (best-effort; null se la tabella non è leggibile → non blocca)
//      - sentinelle/sensori: firma della cecità (quali sensori ciechi + max giri ciechi) + coda falliti
//   2) Confronta la firma con quella dell'ULTIMO GIRO PIENO (non l'ultimo giro: così si salta
//      finché non cambia davvero qualcosa rispetto all'ultima analisi completa).
//   3) Decide:
//      - `esegui_pieno = true`  → qualcosa è cambiato, o è passato troppo tempo (heartbeat), o è il
//        primo giro, o è forzato → ACCENDI il motore AI pesante.
//      - `esegui_pieno = false` → tutto invariato → SALTA la parte AI, gira solo la sonda leggera.
//
// Fail-safe: se i sensori sono ciechi ORA ma prima vedevano (o viceversa), la firma cambia →
// il giro parte (la VISIBILITÀ è cambiata, va rianalizzata). Se erano ciechi prima e ora → firma
// uguale → si salta (ed è giusto: al buio non c'è nuova analisi da fare, come dice la lezione).
//
// Uso:
//   node cervello/delta-gate.mjs [--json]        -> valuta e decide (exit 0 = pieno · 20 = salta)
//   node cervello/delta-gate.mjs --segna-pieno   -> registra che un giro PIENO è appena girato
//                                                   (promuove la firma corrente a "ultimo pieno")
//
// Override: DELTA_GATE_FORCE=1 (o --force) → esegui_pieno sempre true (giri manuali / "fai un giro").
//           DELTA_GATE_MAX_ORE (default 12) → heartbeat: dopo N ore SENZA giro pieno, esegui comunque.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const SEGNA_PIENO = process.argv.includes("--segna-pieno");
const FORCE = process.argv.includes("--force") || process.env.DELTA_GATE_FORCE === "1";
const MAX_ORE = Number(process.env.DELTA_GATE_MAX_ORE || 12);

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const STATE_PATH = join(VAULT, "delta-gate.json");
const CECITA_PATH = join(VAULT, "sensori-cecita.json");

function readJson(path, fallback = {}) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** @param {string} dataStr "AAAA-MM-DD HH:MM" (fuso Piacenza) */
function oreFa(dataStr) {
  if (!dataStr) return Infinity;
  const m = String(dataStr).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return Infinity;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  const t = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`).getTime();
  return Number.isNaN(t) ? Infinity : (Date.now() - t) / 3600000;
}

// Conteggio esatto via PostgREST (header Prefer: count=exact + Range 0-0 → Content-Range "0-0/N").
async function contaTabella(url, key, table) {
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=id`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
    });
    if (!res.ok) return null;
    const cr = res.headers.get("content-range"); // es. "0-0/123"
    const tot = cr && cr.includes("/") ? Number(cr.split("/")[1]) : null;
    return Number.isFinite(tot) ? tot : null;
  } catch {
    return null;
  }
}

async function ultimoTimestamp(url, key, table, col = "created_at") {
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=${col}&order=${col}.desc&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    const arr = await res.json();
    return arr?.[0]?.[col] || null;
  } catch {
    return null;
  }
}

// Firma della cecità/sentinelle dai dati DETERMINISTICI già scritti da verifica-sensori.mjs.
function firmaSensori() {
  const cecita = readJson(CECITA_PATH, {});
  const sensori = cecita.sensori || {};
  // Solo lo STATO per sensore (ok/cieco/non_configurato): un cambio di visibilità sposta la firma.
  const stati = Object.keys(sensori)
    .sort()
    .map((k) => `${k}:${sensori[k]?.stato || "?"}`)
    .join(",");
  return {
    stati,
    max_giri_ciechi: Number(cecita.meta?.max_giri_ciechi ?? 0),
    almeno_un_dato: cecita.meta?.almeno_un_dato !== false,
  };
}

async function calcolaFirma() {
  const url = process.env.MARKETPLACE_SUPABASE_URL?.trim();
  const key = process.env.MARKETPLACE_SUPABASE_KEY?.trim();
  const sensori = firmaSensori();

  if (!url || !key) {
    // Nessun canale dati: la firma dipende solo dallo stato sensori (che qui è "spento").
    return { ordini: null, ultimo_ordine: null, clienti: null, sensori, dati_leggibili: false };
  }

  // Le 3 leve che il giro analizza: ordini (incassi/attività), clienti, e — via sensori — sentinelle.
  const ordini = await contaTabella(url, key, "orders");
  const ultimoOrdine = await ultimoTimestamp(url, key, "orders");
  // Clienti: best-effort su tabelle plausibili; il primo conteggio non-null vince, altrimenti null.
  let clienti = null;
  for (const t of ["customers", "profiles", "users"]) {
    const n = await contaTabella(url, key, t);
    if (n !== null) {
      clienti = n;
      break;
    }
  }

  return {
    ordini,
    ultimo_ordine: ultimoOrdine,
    clienti,
    sensori,
    dati_leggibili: ordini !== null,
  };
}

// Firma → stringa stabile per il confronto (ordine delle chiavi fisso).
function firmaStringa(f) {
  if (!f) return "";
  return JSON.stringify({
    ordini: f.ordini,
    ultimo_ordine: f.ultimo_ordine,
    clienti: f.clienti,
    sensori: f.sensori,
  });
}

async function main() {
  const quando = nowPiacenza();
  const state = readJson(STATE_PATH, {
    _cosa_e:
      "🚦 DELTA-GATE (AR-019): firma dello stato reale per saltare i giri pesanti quando NULLA è cambiato dall'ultimo giro pieno. Scritto da cervello/delta-gate.mjs.",
    aggiornato: quando,
    ultimo_pieno: null, // { firma, firma_str, quando }
    corrente: null,
    giri_saltati_consecutivi: 0,
    giri_valutati: 0,
    storia: [],
  });

  // Modalità --segna-pieno: promuove la firma corrente a "ultimo pieno" (dopo che l'AI ha girato davvero).
  if (SEGNA_PIENO) {
    const corrente = state.corrente || (await calcolaFirma());
    state.ultimo_pieno = {
      firma: corrente,
      firma_str: firmaStringa(corrente),
      quando,
    };
    state.giri_saltati_consecutivi = 0;
    state.aggiornato = quando;
    writeJson(STATE_PATH, state);
    if (JSON_MODE) console.log(JSON.stringify({ esito: "segnato-pieno", quando }, null, 2));
    else console.log(`🚦 Delta-gate: giro PIENO registrato (${quando}).`);
    process.exit(0);
  }

  const firma = await calcolaFirma();
  const firmaStr = firmaStringa(firma);
  const prev = state.ultimo_pieno;
  const oreDaPieno = prev ? oreFa(prev.quando) : Infinity;

  const cambiato = !prev || prev.firma_str !== firmaStr;
  const heartbeat = oreDaPieno > MAX_ORE;
  const esegui_pieno = FORCE || cambiato || heartbeat || !prev;

  // Motivo leggibile (per log + Cabina).
  let motivo;
  if (FORCE) motivo = "forzato (giro manuale/override)";
  else if (!prev) motivo = "primo giro: nessuna firma di riferimento";
  else if (cambiato) motivo = spiegaCambio(prev.firma, firma);
  else if (heartbeat) motivo = `heartbeat: ${Math.round(oreDaPieno)}h dall'ultimo giro pieno (>${MAX_ORE}h)`;
  else motivo = "nulla di nuovo: stato invariato dall'ultimo giro pieno";

  state.corrente = firma;
  state.giri_valutati = (state.giri_valutati || 0) + 1;
  state.giri_saltati_consecutivi = esegui_pieno ? 0 : (state.giri_saltati_consecutivi || 0) + 1;
  state.ultima_decisione = { quando, esegui_pieno, motivo, ore_da_pieno: Math.round(oreDaPieno) };
  state.storia = (state.storia || []).slice(-49);
  state.storia.push({ quando, esegui_pieno, motivo });
  state.aggiornato = quando;
  writeJson(STATE_PATH, state);

  await stampSegnale(
    "delta-gate",
    "ok",
    `${esegui_pieno ? "PIENO" : "SALTA"} · ${motivo} · saltati ${state.giri_saltati_consecutivi} · ${quando}`
  );

  const out = {
    esito: esegui_pieno ? "pieno" : "salta",
    esegui_pieno,
    motivo,
    ore_da_pieno: Math.round(oreDaPieno),
    giri_saltati_consecutivi: state.giri_saltati_consecutivi,
    firma,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n🚦 DELTA-GATE — ${quando}`);
    console.log(`   Decisione: ${esegui_pieno ? "✅ GIRO PIENO (accendi AI)" : "⏭️  SALTA (solo sonda leggera)"}`);
    console.log(`   Motivo:    ${motivo}`);
    if (!esegui_pieno) console.log(`   Giri saltati di fila: ${state.giri_saltati_consecutivi}`);
  }

  // Exit code per giro.sh: 0 = accendi il motore · 20 = salta la parte pesante.
  process.exit(esegui_pieno ? 0 : 20);
}

// Confronto leggibile fra due firme (cosa esattamente è cambiato).
function spiegaCambio(a, b) {
  const diff = [];
  if (a.ordini !== b.ordini) diff.push(`ordini ${a.ordini ?? "?"}→${b.ordini ?? "?"}`);
  if (a.ultimo_ordine !== b.ultimo_ordine) diff.push("nuovo ordine");
  if (a.clienti !== b.clienti) diff.push(`clienti ${a.clienti ?? "?"}→${b.clienti ?? "?"}`);
  if (JSON.stringify(a.sensori) !== JSON.stringify(b.sensori)) diff.push("stato sensori/sentinelle");
  return diff.length ? `cambiato: ${diff.join(", ")}` : "cambiato (firma diversa)";
}

main().catch(async (e) => {
  console.error("ERRORE delta-gate:", e.message || e);
  await stampSegnale("delta-gate", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  // Fail-safe: in caso di errore NON saltiamo mai il giro (meglio un giro in più che perdere segnali).
  process.exit(0);
});
