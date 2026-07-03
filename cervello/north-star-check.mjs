#!/usr/bin/env node
// AR-082 — Guardiano della NORTH STAR: misura in modo deterministico le 3 metriche-faro
// dell'azienda (ORDINI reali · NEGOZI live · MARGINE) leggendo la baseline in STATO.md, e
// segnala se la stella polare è ferma (stallo) o se manca la fonte del numero.
//
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Estrae i numeri dalla tabella "I 7 numeri"
// di STATO.md (fonte-di-verità della sessione quando i sensori live sono ciechi) — nessun numero
// inventato: se un valore non è nel testo, resta "n/d" con la fonte dichiarata.
//
// Uso:
//   node cervello/north-star-check.mjs           -> report leggibile
//   node cervello/north-star-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = la north star si muove (≥1 ordine pagato) · 1 = stallo o numero senza fonte

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");

// Estrae il primo intero dalla riga-tabella la cui prima colonna combacia con `etichetta`.
function numeroDaRiga(testo, etichetta) {
  const re = new RegExp("\\|\\s*" + etichetta + "[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  return m ? { valore: Number(m[1]), fonte: "STATO.md · tabella 7 numeri" } : { valore: null, fonte: null };
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(STATO)) {
    const out = { ok: false, quando, errore: "STATO.md non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ STATO.md non trovato");
    process.exit(1);
  }
  const testo = readFileSync(STATO, "utf8");

  // Le 3 metriche-faro (north star). Il margine non è nella tabella baseline → resta n/d con fonte.
  const negozi = numeroDaRiga(testo, "Negozi REALI");
  const ordiniCreati = numeroDaRiga(testo, "Ordini creati");
  const ordiniPagati = numeroDaRiga(testo, "Ordini pagati");
  const ordiniConsegnati = numeroDaRiga(testo, "Ordini consegnati");
  const margine = { valore: null, fonte: null }; // manca una fonte deterministica → NON inventiamo

  const northStar = {
    negozi_live: negozi,
    ordini_creati: ordiniCreati,
    ordini_pagati: ordiniPagati, // ← la vera stella polare: soldi incassati end-to-end
    ordini_consegnati: ordiniConsegnati,
    margine,
  };

  // Numeri senza fonte = violazione del cancello "nessun numero orfano" (ma il margine è per-design n/d).
  const orfani = Object.entries(northStar)
    .filter(([k, v]) => v.valore === null && k !== "margine")
    .map(([k]) => k);

  const stallo = (ordiniPagati.valore ?? 0) === 0;
  const out = {
    ok: !stallo && orfani.length === 0,
    quando,
    fonte: "STATO.md (baseline; i sensori live restano prioritari quando disponibili)",
    north_star: northStar,
    stallo,
    numeri_senza_fonte: orfani,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`⭐ North Star — ${quando}`);
    console.log(`  Negozi live:      ${negozi.valore ?? "n/d"}`);
    console.log(`  Ordini creati:    ${ordiniCreati.valore ?? "n/d"}`);
    console.log(`  Ordini pagati:    ${ordiniPagati.valore ?? "n/d"}  ← stella polare`);
    console.log(`  Ordini consegnati:${ordiniConsegnati.valore ?? "n/d"}`);
    console.log(`  Margine:          ${margine.valore ?? "n/d (nessuna fonte deterministica)"}`);
    if (stallo) console.log("  🔴 STALLO: 0 ordini pagati — la north star è ferma.");
    if (orfani.length) console.log(`  ❌ numeri senza fonte: ${orfani.join(", ")}`);
    if (out.ok) console.log("  ✅ la north star si muove.");
  }
  process.exit(out.ok ? 0 : 1);
}

main();
