#!/usr/bin/env node
// AR-082 / AR-113 / AR-279 — Guardiano della NORTH STAR: misura le metriche-faro (ORDINI pagati ·
// NEGOZI live · MARGINE) e segnala lo stallo prolungato sul 1° ordine pagato.
//
// AR-279 — fino al 27/7 questo guardiano leggeva i giorni di stallo da una FRASE di STATO.md, con una
// regex (`/stallo[^~]*~?\s*(\d+)\s*h/i`). Misurato il 28/7 alle 01:06: pescava «9 ore» → 0,4 giorni →
// sotto la soglia di 3 → **usciva 0, via libera**, mentre la riga più in alto dello stesso file diceva
// «stallo 33 giorni». Nei sette giorni con 107 merge sul Pannello e zero ordini ha dato luce verde ogni
// volta. Era un giudizio circolare: la macchina si valutava su un numero che aveva scritto lei.
//
// Ora lo stallo si misura da un CONTEGGIO e da un TIMESTAMP, mai da una frase — e la provenienza del
// numero è un campo dichiarato (`fonte_numero`), non un sottinteso.
//
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge il marketplace in sola lettura via REST.
//
// Uso:
//   node cervello/north-star-check.mjs              -> report (exit 1 se stallo o numeri orfani)
//   node cervello/north-star-check.mjs --gate       -> exit 1 solo se stallo ≥ N giorni (vincolo giro)
//   node cervello/north-star-check.mjs --json       -> output JSON
//
// Exit --gate (contratto AR-322): 0 = la north star si muove · 1 = stallo (vincolo HARD) · 2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { FONTI, codiceUscita, decidiStallo } from "./fonte-numero.mjs";

const JSON_MODE = process.argv.includes("--json");
const GATE_MODE = process.argv.includes("--gate");
const GIORNI_SOGLIA = Number(process.env.NORTH_STAR_GIORNI_GATE || 3);
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");
const TIMEOUT_MS = Number(process.env.NORTH_STAR_TIMEOUT_MS || 8000);

/** Numero dalla tabella dei 7 numeri di STATO.md. È un dato tabellare, non una frase. */
function numeroDaRiga(testo, etichetta) {
  const re = new RegExp("\\|\\s*" + etichetta + "[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  return m ? { valore: Number(m[1]), fonte: "STATO.md · tabella 7 numeri" } : { valore: null, fonte: null };
}

async function rest(url, key, query) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${url}/rest/v1/${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Le due misure che contano, dalla fonte-di-verità. `null` = non ho potuto guardare. */
async function daRest() {
  const url = process.env.MARKETPLACE_SUPABASE_URL?.trim();
  const key = process.env.MARKETPLACE_SUPABASE_KEY?.trim();
  if (!url || !key) return { pagati: null, ultimoPagato: null, motivo: "MARKETPLACE_SUPABASE_* non configurate" };

  const conteggio = await rest(url, key, "orders?select=id&payment_status=eq.PAID");
  if (!conteggio) return { pagati: null, ultimoPagato: null, motivo: "REST non risponde (o tabella orders non leggibile)" };
  const cr = conteggio.headers.get("content-range"); // "0-0/123"
  const pagati = cr && cr.includes("/") ? Number(cr.split("/")[1]) : null;
  if (!Number.isFinite(pagati)) return { pagati: null, ultimoPagato: null, motivo: "conteggio ordini pagati non interpretabile" };

  // Il timestamp serve SOLO se almeno un ordine è stato pagato: a zero, lo stallo è totale per
  // definizione e non ha bisogno di nessuna data (è il caso reale dal 24/6).
  let ultimoPagato = null;
  if (pagati > 0) {
    const r = await rest(url, key, "orders?select=created_at&payment_status=eq.PAID&order=created_at.desc&limit=1");
    if (r) {
      try {
        const arr = await r.json();
        ultimoPagato = arr?.[0]?.created_at || null;
      } catch {
        ultimoPagato = null;
      }
    }
  }
  return { pagati, ultimoPagato, motivo: null };
}

async function main() {
  const quando = nowPiacenza();
  const testo = existsSync(STATO) ? readFileSync(STATO, "utf8") : null;

  // ① La fonte-di-verità.
  const live = await daRest();
  // ② La baseline dichiarata: la TABELLA di STATO.md — mai la prosa.
  const negozi = testo ? numeroDaRiga(testo, "Negozi REALI") : { valore: null, fonte: null };
  const ordiniCreati = testo ? numeroDaRiga(testo, "Ordini creati") : { valore: null, fonte: null };
  const ordiniPagatiFile = testo ? numeroDaRiga(testo, "Ordini pagati") : { valore: null, fonte: null };
  const ordiniConsegnati = testo ? numeroDaRiga(testo, "Ordini consegnati") : { valore: null, fonte: null };

  let pagati, fonteNumero, fonteTesto;
  if (live.pagati != null) {
    pagati = live.pagati;
    fonteNumero = FONTI.REST;
    fonteTesto = "marketplace REST · orders payment_status=PAID";
  } else if (ordiniPagatiFile.valore != null) {
    pagati = ordiniPagatiFile.valore;
    fonteNumero = FONTI.BASELINE;
    fonteTesto = `baseline STATO.md, sensori ciechi (${live.motivo})`;
  } else {
    pagati = null;
    fonteNumero = FONTI.ASSENTE;
    fonteTesto = `nessuna fonte leggibile (${live.motivo})`;
  }

  const esito = decidiStallo({
    ordiniPagati: pagati,
    ultimoPagatoIso: live.ultimoPagato,
    adessoMs: Date.now(),
    sogliaGiorni: GIORNI_SOGLIA,
    fonte: fonteNumero,
  });

  const northStar = {
    negozi_live: negozi,
    ordini_creati: ordiniCreati,
    ordini_pagati: { valore: pagati, fonte: fonteTesto },
    ordini_consegnati: ordiniConsegnati,
    // AR-420 — IL MARGINE È UNA DELLE TRE STELLE POLARI E NON LO MISURA NESSUNO.
    // Il campo era cablato a `null` E tolto a mano dall'elenco dei numeri senza fonte
    // (`k !== "margine"`): l'esenzione trasformava un buco in un verde, che è esattamente il gesto
    // che ha tenuto in piedi per settimane «0 token spesi» (AR-144/AR-196).
    // La cura onesta NON è inventare un numero — una query sulle righe ordine non si può scrivere
    // alla cieca, e un valore sbagliato sarebbe peggio del buco. È DICHIARARE la stella cieca, qui
    // e nel report, finché la fonte non esiste. Un buco dichiarato si può chiudere; un buco esentato
    // no, perché nessuno sa che c'è.
    margine: {
      valore: null,
      fonte: null,
      cieco: true,
      serve:
        "una fonte vera: dalle righe ordine via REST (importo, commissione, fee di consegna) o da un sensore " +
        "dedicato. Finché non c'è, questa stella NON è misurata — e il guardiano lo dice invece di uscire verde.",
    },
  };
  // AR-420 (a): l'esenzione è tolta. Un faro senza fonte è un numero orfano come tutti gli altri.
  const orfani = Object.entries(northStar)
    .filter(([, v]) => v.valore === null)
    .map(([k]) => k);
  const stelleCieche = Object.entries(northStar)
    .filter(([, v]) => v.cieco === true)
    .map(([k]) => k);

  // In modalità gate comanda il verdetto sullo stallo (il vincolo di allocazione, AR-113).
  // Fuori dal gate un numero orfano resta un rosso: è il report che deve dirlo.
  const rc = GATE_MODE ? codiceUscita(esito.gate) : orfani.length > 0 || esito.stallo ? 1 : 0;

  const out = {
    ok: rc === 0,
    quando,
    fonte: fonteTesto,
    fonte_numero: fonteNumero, // AR-279 ④: da dove viene il numero su cui questo gate giudica
    north_star: northStar,
    stallo: esito.stallo,
    stallo_giorni: esito.giorni,
    stallo_motivo: esito.motivo,
    soglia_giorni_gate: GIORNI_SOGLIA,
    stallo_prolungato: esito.gate === "chiuso",
    gate: esito.gate,
    gate_mode: GATE_MODE,
    numeri_senza_fonte: orfani,
    stelle_cieche: stelleCieche, // AR-420: quali fari NON sono misurati da nessuno, detto sempre
  };

  const msgSegnale =
    esito.gate === "cieco"
      ? `CIECO: ${esito.motivo} · ${quando}`
      : esito.stallo
        ? `stallo (${esito.motivo}) · fonte ${fonteNumero} · ${quando}`
        : `north star ok · pagati=${pagati} · fonte ${fonteNumero} · ${quando}`;
  await stampSegnale("north-star", rc === 0 ? "ok" : "warn", msgSegnale);

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`⭐ North Star — ${quando}`);
    console.log(`  Fonte del numero: ${fonteNumero} (${fonteTesto})`);
    console.log(`  Negozi live:      ${negozi.valore ?? "n/d"}`);
    console.log(`  Ordini creati:    ${ordiniCreati.valore ?? "n/d"}`);
    console.log(`  Ordini pagati:    ${pagati ?? "n/d"}  ← stella polare`);
    console.log(`  Ordini consegnati:${ordiniConsegnati.valore ?? "n/d"}`);
    // AR-420 — la riga che prima non esisteva: la stella cieca si vede SEMPRE, anche quando tutto
    // il resto è verde. Un buco che non compare a schermo non verrà chiuso da nessuno.
    if (stelleCieche.length)
      console.log(`  ⚪ NON MISURATE (${stelleCieche.length} su 3 stelle polari): ${stelleCieche.join(", ")} — ${northStar.margine.serve}`);
    console.log(`  Stallo:           ${esito.motivo}`);
    if (esito.gate === "cieco") console.log("  ⚠️  GUARDIANO CIECO (AR-322): non ho potuto misurare. Non è un verde.");
    else if (esito.gate === "chiuso") console.log(`  🔴 STALLO: vincolo di allocazione al giro.`);
    if (orfani.length) console.log(`  ❌ numeri senza fonte: ${orfani.join(", ")}`);
    if (rc === 0) console.log("  ✅ la north star si muove.");
  }
  process.exit(rc);
}

// Il programma parte SOLO se qualcuno lancia questo file. Importarlo per usarne una funzione non
// deve farlo girare: un modulo che si esegue all'import non è provabile — chi scrive il test si
// ritrova il guardiano intero addosso invece della funzione che voleva misurare.
const lanciatoDaRigaDiComando = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanciatoDaRigaDiComando) {
  main().catch((e) => {
    console.error("ERRORE north-star-check:", e?.message || e);
    process.exit(2); // AR-322: un guardiano che esplode è CIECO, non «bocciato»
  });
}
