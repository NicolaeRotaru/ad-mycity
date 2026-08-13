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
// LETARGO_AC_DIR: SOLO per i test — punta la lettura a una cartella finta, così la decisione si
// prova su dati iniettati senza toccare la memoria vera (stesso schema di SENSORI_CECITA_FILE).
const AC_DIR = process.env.LETARGO_AC_DIR || join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");

function leggi(nome) {
  try {
    return JSON.parse(readFileSync(join(AC_DIR, nome), "utf8"));
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

/**
 * AR-589 — La decisione del livello, PURA e testabile. La cecità che fa scattare il letargo è
 * quella dei DATI (`max_giri_ciechi_dati`: fonti-di-verità REST/Stripe/Resend/memoria), NON il
 * max su tutti i sensori: il sito giù (uptime) è un guasto vero ma non rende ciechi i dati —
 * prima 103 giri di solo `sito_uptime` cieco votavano SOPRAVVIVENZA con cecità-dati a 0.
 *
 * @param {{quotaPct: number|null, runway: number|null, runwaySoglia: number,
 *          cecitaDati: number, salute: number|null}} assi
 * @returns {{livello: "NORMALE"|"RISPARMIO"|"SOPRAVVIVENZA", motivi: string[]}}
 */
export function livelloLetargo({ quotaPct, runway, runwaySoglia, cecitaDati, salute }) {
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
  if (cecitaDati >= 5) bump("SOPRAVVIVENZA", `${cecitaDati} giri ciechi sulle fonti dati`);
  else if (cecitaDati >= 3) bump("RISPARMIO", `${cecitaDati} giri ciechi sulle fonti dati`);
  if (salute != null && salute < 40) bump("RISPARMIO", `salute macchina ${salute} (<40)`);
  return { livello, motivi };
}

function main() {
  const quando = nowPiacenza();
  const costo = leggi("costo-ai.json");
  const cassa = leggi("cassa-runway.json");
  const sensori = leggi("sensori-cecita.json");
  const sent = leggi("sentinella-dati.json");

  // --- I 4 assi vitali, dai dati reali ---
  const soglia = costo?.soglia_giornaliera_token || 0;
  // AR-196: il numero-su-cui-si-frena è `token_per_gate`, non `token_totali` (che è 0 per costruzione).
  // Se il campo manca la quota è SCONOSCIUTA, non zero: `null` non fa scattare nessun livello, ma
  // nemmeno finge un 0% rassicurante.
  const _tokGate = costo?.oggi?.token_per_gate;
  const quotaPct = soglia && typeof _tokGate === "number" ? +((_tokGate / soglia) * 100).toFixed(3) : null;
  const runway = cassa?.runway_mesi ?? null; // può essere null (non calcolabile) → non si escala su un ignoto
  const runwaySoglia = cassa?.soglia_allerta_mesi ?? 3;
  // AR-589: il contatore che conta è quello dei DATI. max_giri_ciechi (tutti i sensori, uptime
  // incluso) resta visibile ma NON fa scattare il livello: il sito giù è un allarme suo (AR-588).
  const cecitaDati = sensori?.meta?.max_giri_ciechi_dati ?? 0;
  const cecitaTotale = sensori?.meta?.max_giri_ciechi ?? 0;
  const salute = sent?.ultimo_stato?.salute_voto ?? null;

  // --- Livello = il peggiore fra gli assi valutabili (decisione pura, testabile) ---
  const { livello, motivi } = livelloLetargo({ quotaPct, runway, runwaySoglia, cecitaDati, salute });

  const cautele = [];
  if (runway == null) cautele.push(`runway non calcolabile (${cassa?.note || "burn/cassa non impostati"}) — asse non valutato, non escalo su un ignoto`);
  if ((cassa?.cassa_disponibile_eur ?? null) === 0) cautele.push("cassa disponibile €0 (Stripe balance): tienilo d'occhio");
  if (cecitaTotale >= 3 && cecitaDati < 3) {
    cautele.push(
      `sensori non-dati (uptime/mani) ciechi da ${cecitaTotale} giri — guasto vero ma NON cecità dei dati: non fa scattare il letargo (AR-589; il sito giù ha il suo allarme, AR-588)`
    );
  }

  const out = {
    ok: livello === "NORMALE",
    quando,
    fonte: "costo-ai + cassa-runway + sensori-cecita + sentinella-dati (auto-coscienza)",
    assi: {
      quota_ai_pct: quotaPct,
      runway_mesi: runway,
      sensori_giri_ciechi: cecitaDati,           // AR-589: solo fonti DATI (era il max su tutti)
      sensori_giri_ciechi_totale: cecitaTotale,  // informativo: include uptime/mani (non vota)
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
  console.log(`     • Sensori ciechi:${cecitaDati} giri (fonti dati; totale con uptime/mani: ${cecitaTotale})`);
  console.log(`     • Salute:        ${salute ?? "n/d"}`);
  console.log(`\n   ➤ LIVELLO ATTUALE: ${livello}`);
  console.log(`     ${out.cosa_resta_acceso}`);
  if (motivi.length) console.log(`     Motivi: ${motivi.join(" · ")}`);
  if (cautele.length) console.log(`     ⚠️ Cautele: ${cautele.join(" · ")}`);
  console.log(`\n   La scala (si firma una volta, poi scatta da sola nei limiti):`);
  for (const [l, d] of Object.entries(SCALA)) console.log(`     ${l === livello ? "▶" : " "} ${l}: ${d}`);
  process.exit(out.ok ? 0 : 1);
}

// Main-guard: eseguito come script parte; importato dai test (per livelloLetargo) NO.
// Cura la malattia «programma-che-parte-importando»: prima `main()` girava anche all'import.
if (process.argv[1] && process.argv[1].endsWith("letargo.mjs")) main();
