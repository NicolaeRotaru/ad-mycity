#!/usr/bin/env node
// Capacità #37 — IL LETARGO. Degradazione con grazia: se quota AI, cassa o sensori calano, la
// macchina spegne il superfluo in ordine inverso d'importanza e tiene il NUCLEO VITALE (ordini,
// consegne, firma, sicurezza). Legge lo stato reale su 4 assi e dichiara in che LIVELLO sta e cosa
// spegnerebbe scendendo di livello. È la rete di sicurezza antifragile: non si blocca mai del tutto.
//
// 🟢 Sola lettura: legge costo-ai.json, cassa-runway.json, sensori-cecita.json, sentinella-dati.json.
// NON spegne niente da sola: le regole di letargo si firmano una volta (🟡). Nessun numero inventato.
//
// Uso:  node cervello/letargo.mjs [--json]
// Exit: 0 = livello NORMALE · 1 = RISPARMIO o SOPRAVVIVENZA (la macchina va sorvegliata)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const AC = "MyCity-Vault/90-Memoria-AI/auto-coscienza";

function leggi(rel) {
  const p = join(AD_ROOT, rel);
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// La scala del letargo: cosa resta ACCESO a ogni livello (il resto si spegne).
const SCALA = {
  NORMALE: "tutto acceso: giri pieni, contenuti, esperimenti, capacità introspettive, + nucleo vitale.",
  RISPARMIO: "SPEGNE il superfluo (contenuti pesanti/reel, esperimenti non essenziali, processi notturni; giri ridotti a 1/giorno, AI solo su ciò che rende). TIENE: ordini, consegne, firme, sicurezza, sensori critici, memoria.",
  SOPRAVVIVENZA: "solo NUCLEO VITALE: ordini + consegne + coda firme + sicurezza + allerta a Nicola. Tutto il resto spento.",
};

function main() {
  const quando = nowPiacenza();
  const costo = leggi(`${AC}/costo-ai.json`);
  const cassa = leggi(`${AC}/cassa-runway.json`);
  const sensori = leggi(`${AC}/sensori-cecita.json`);
  const sent = leggi(`${AC}/sentinella-dati.json`);

  // --- I 4 assi vitali, dai dati reali ---
  const soglia = costo?.soglia_giornaliera_token || 0;
  const quotaPct = soglia ? +((costo?.oggi?.token_totali || 0) / soglia * 100).toFixed(3) : null;
  const runway = cassa?.runway_mesi ?? null; // può essere null (non calcolabile) → non si escala su un ignoto
  const runwaySoglia = cassa?.soglia_allerta_mesi ?? 3;
  const sensoriCiechi = sensori?.meta?.max_giri_ciechi ?? 0;
  const salute = sent?.ultimo_stato?.salute_voto ?? null;

  // --- Livello = il peggiore fra gli assi valutabili ---
  let livello = "NORMALE";
  const motivi = [];
  const bump = (l, perche) => {
    motivi.push(perche);
    const ord = { NORMALE: 0, RISPARMIO: 1, SOPRAVVIVENZA: 2 };
    if (ord[l] > ord[livello]) livello = l;
  };
  if (quotaPct != null && quotaPct > 90) bump("SOPRAVVIVENZA", `quota AI al ${quotaPct}% della soglia`);
  else if (quotaPct != null && quotaPct > 50) bump("RISPARMIO", `quota AI al ${quotaPct}% della soglia`);
  if (runway != null && runway < 1) bump("SOPRAVVIVENZA", `runway ${runway} mesi (<1)`);
  else if (runway != null && runway < runwaySoglia) bump("RISPARMIO", `runway ${runway} mesi (<${runwaySoglia})`);
  if (sensoriCiechi >= 5) bump("SOPRAVVIVENZA", `${sensoriCiechi} giri ciechi sui sensori`);
  else if (sensoriCiechi >= 3) bump("RISPARMIO", `${sensoriCiechi} giri ciechi sui sensori`);
  if (salute != null && salute < 40) bump("RISPARMIO", `salute macchina ${salute} (<40)`);

  const cautele = [];
  if (runway == null) cautele.push(`runway non calcolabile (${cassa?.note || "burn/cassa non impostati"}) — asse non valutato, non escalo su un ignoto`);
  if ((cassa?.cassa_disponibile_eur ?? null) === 0) cautele.push("cassa disponibile €0 (Stripe balance): tienilo d'occhio");

  const out = {
    ok: livello === "NORMALE",
    quando,
    fonte: "costo-ai + cassa-runway + sensori-cecita + sentinella-dati (auto-coscienza)",
    assi: {
      quota_ai_pct: quotaPct,
      runway_mesi: runway,
      sensori_giri_ciechi: sensoriCiechi,
      salute_macchina: salute,
    },
    livello,
    motivi,
    cautele,
    cosa_resta_acceso: SCALA[livello],
    scala: SCALA,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`🛌 Il Letargo — ${quando}   (degradazione con grazia)\n`);
  console.log(`   Assi vitali (dati reali):`);
  console.log(`     • Quota AI:      ${quotaPct != null ? quotaPct + "% della soglia" : "n/d"}`);
  console.log(`     • Runway:        ${runway != null ? runway + " mesi" : "non calcolabile"}`);
  console.log(`     • Sensori ciechi:${sensoriCiechi} giri`);
  console.log(`     • Salute:        ${salute ?? "n/d"}`);
  console.log(`\n   ➤ LIVELLO ATTUALE: ${livello}`);
  console.log(`     ${out.cosa_resta_acceso}`);
  if (motivi.length) console.log(`     Motivi: ${motivi.join(" · ")}`);
  if (cautele.length) console.log(`     ⚠️ Cautele: ${cautele.join(" · ")}`);
  console.log(`\n   La scala (si firma una volta, poi scatta da sola nei limiti):`);
  for (const [l, d] of Object.entries(SCALA)) console.log(`     ${l === livello ? "▶" : " "} ${l}: ${d}`);
  process.exit(out.ok ? 0 : 1);
}

main();
