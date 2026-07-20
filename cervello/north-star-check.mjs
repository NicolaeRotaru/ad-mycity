#!/usr/bin/env node
// AR-082 / AR-113 — Guardiano della NORTH STAR: misura in modo deterministico le metriche-faro
// (ORDINI pagati · NEGOZI live · MARGINE) da STATO.md e segnala stallo prolungato sul 1° ordine.
//
// 🟢 Sola lettura: NON scrive nel vault, NON fa git.
//
// Uso:
//   node cervello/north-star-check.mjs              -> report (exit 1 se stallo o numeri orfani)
//   node cervello/north-star-check.mjs --gate       -> exit 1 solo se stallo ≥ N giorni (vincolo giro)
//   node cervello/north-star-check.mjs --json       -> output JSON
//
// Exit --gate: 0 = ok o stallo breve · 1 = stallo ≥ NORTH_STAR_GIORNI_GATE (default 3) → vincolo HARD

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const GATE_MODE = process.argv.includes("--gate");
const GIORNI_SOGLIA = Number(process.env.NORTH_STAR_GIORNI_GATE || 3);
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");

function numeroDaRiga(testo, etichetta) {
  const re = new RegExp("\\|\\s*" + etichetta + "[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  return m ? { valore: Number(m[1]), fonte: "STATO.md · tabella 7 numeri" } : { valore: null, fonte: null };
}

/** Primo riferimento a stallo ~Nh in STATO (fonte dichiarata, non inventato). */
function stalloDaStato(testo) {
  const m = testo.match(/stallo[^~]*~?\s*(\d+)\s*h/i);
  if (!m) return { ore: null, giorni: null, fonte: null };
  const ore = Number(m[1]);
  return { ore, giorni: Math.round((ore / 24) * 10) / 10, fonte: "STATO.md · stallo ~h" };
}

async function main() {
  const quando = nowPiacenza();
  if (!existsSync(STATO)) {
    const out = { ok: false, quando, errore: "STATO.md non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ STATO.md non trovato");
    await stampSegnale("north-star", "errore", `STATO.md assente · ${quando}`);
    process.exit(1);
  }
  const testo = readFileSync(STATO, "utf8");

  const negozi = numeroDaRiga(testo, "Negozi REALI");
  const ordiniCreati = numeroDaRiga(testo, "Ordini creati");
  const ordiniPagati = numeroDaRiga(testo, "Ordini pagati");
  const ordiniConsegnati = numeroDaRiga(testo, "Ordini consegnati");
  const margine = { valore: null, fonte: null };

  const northStar = {
    negozi_live: negozi,
    ordini_creati: ordiniCreati,
    ordini_pagati: ordiniPagati,
    ordini_consegnati: ordiniConsegnati,
    margine,
  };

  const orfani = Object.entries(northStar)
    .filter(([k, v]) => v.valore === null && k !== "margine")
    .map(([k]) => k);

  const stallo = (ordiniPagati.valore ?? 0) === 0;
  const { ore: oreStallo, giorni: giorniStallo, fonte: fonteStallo } = stalloDaStato(testo);
  const stalloProlungato =
    stallo && (giorniStallo == null ? true : giorniStallo >= GIORNI_SOGLIA);

  const gateFail = orfani.length > 0 || (GATE_MODE ? stalloProlungato : stallo);
  const out = {
    ok: !gateFail,
    quando,
    fonte: "STATO.md (baseline; i sensori live restano prioritari quando disponibili)",
    north_star: northStar,
    stallo,
    stallo_ore: oreStallo,
    stallo_giorni: giorniStallo,
    stallo_fonte: fonteStallo,
    soglia_giorni_gate: GIORNI_SOGLIA,
    stallo_prolungato: stalloProlungato,
    gate_mode: GATE_MODE,
    numeri_senza_fonte: orfani,
  };

  const msgSegnale = stalloProlungato
    ? `stallo ${giorniStallo ?? "?"}gg (soglia ${GIORNI_SOGLIA}) · 0 pagati · ${quando}`
    : stallo
      ? `stallo breve ${giorniStallo ?? "?"}gg (<${GIORNI_SOGLIA}) · ${quando}`
      : `north star ok · pagati=${ordiniPagati.valore ?? 0} · ${quando}`;
  await stampSegnale("north-star", gateFail ? "warn" : "ok", msgSegnale);

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`⭐ North Star — ${quando}`);
    console.log(`  Negozi live:      ${negozi.valore ?? "n/d"}`);
    console.log(`  Ordini creati:    ${ordiniCreati.valore ?? "n/d"}`);
    console.log(`  Ordini pagati:    ${ordiniPagati.valore ?? "n/d"}  ← stella polare`);
    console.log(`  Ordini consegnati:${ordiniConsegnati.valore ?? "n/d"}`);
    console.log(`  Margine:          ${margine.valore ?? "n/d (nessuna fonte deterministica)"}`);
    if (oreStallo != null) {
      console.log(`  Stallo:           ~${oreStallo}h (~${giorniStallo} gg) · fonte ${fonteStallo}`);
    }
    if (stallo) {
      console.log(
        stalloProlungato
          ? `  🔴 STALLO PROLUNGATO (≥${GIORNI_SOGLIA} gg): vincolo allocazione al giro.`
          : `  🟡 STALLO breve (<${GIORNI_SOGLIA} gg): monitoraggio, nessun vincolo gate.`
      );
    }
    if (orfani.length) console.log(`  ❌ numeri senza fonte: ${orfani.join(", ")}`);
    if (!stallo && orfani.length === 0) console.log("  ✅ la north star si muove.");
  }
  process.exit(gateFail ? 1 : 0);
}

main().catch((e) => {
  console.error("ERRORE north-star-check:", e?.message || e);
  process.exit(1);
});
