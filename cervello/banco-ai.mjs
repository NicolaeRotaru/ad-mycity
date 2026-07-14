#!/usr/bin/env node
// 🤖 BANCO AI — routing costo/modello eseguibile (upgrade U19).
// 🟢 Sola lettura + log su cervello/routing.json. Non chiama le AI: DECIDE quale usare e lo misura.
//
// Rende operativo cervello/banco-ai.md: dato un compito, restituisce l'AI più economica capace,
// il tier di costo, la chiave che serve e se è collegata (variabile d'ambiente presente).
// Regola d'oro: Claude (forfait) SOLO per il ragionamento; il volume alla mano economica.
//
// Uso (CLI):
//   node cervello/banco-ai.mjs <compito|descrizione>     # es: "scrivi 50 descrizioni prodotto"
//   node cervello/banco-ai.mjs --lista                   # mostra tutte le regole
//   node cervello/banco-ai.mjs <compito> --log           # registra la scelta nel log (misura d'uso)
//
// Import (da altri script):
//   import { scegliModello } from "./banco-ai.mjs";
//   const r = scegliModello("foto prodotto della bottega");  // → {compito, modello, tier, collegato, ...}

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const PATH = join(AD_ROOT, "cervello/routing.json");

// Decisione Nicola #59: niente API a consumo (Groq/Gemini). Il router suggerisce ma l'esecuzione
// resta sempre sul motore premium (Claude/Cursor). Evita il «misura-teatro» in routing.json.
export const ROUTER_SOLO_CONSIGLIO = true;

function leggiRouting() {
  try {
    return JSON.parse(readFileSync(PATH, "utf8"));
  } catch {
    return { regole: [], log: [] };
  }
}

// Parole-chiave → compito. La prima corrispondenza vince; se nulla combacia → ragionamento (Claude).
const INDIZI = [
  { compito: "vision-prodotto", kw: ["foto prodotto", "foto della", "vision", "immagine del prodotto", "catalogo da foto", "scansiona"] },
  { compito: "immagini", kw: ["genera immagine", "grafica", "locandina", "volantino", "mockup", "visual", "banner"] },
  { compito: "trascrizione", kw: ["trascrivi", "nota vocale", "audio in testo", "trascrizione"] },
  { compito: "voce", kw: ["voce", "vocale", "tts", "audio", "leggi ad alta voce"] },
  { compito: "traduzione", kw: ["traduci", "traduzione", "multilingua", "in inglese", "in francese"] },
  { compito: "ricerca-web", kw: ["cerca sul web", "ricerca", "intelligence", "concorrenti", "trend", "notizie"] },
  { compito: "classificazione", kw: ["classifica", "smista", "router", "tag", "categorizza", "sentiment", "dedup", "instrada"] },
  { compito: "testi-volume", kw: ["50 ", "100 ", "descrizioni", "di massa", "bozze", "varianti", "riassumi", "riassunto", "sforna", "popola il catalogo", "caption"] },
  { compito: "ragionamento", kw: ["decidi", "strategia", "analizza", "coordina", "priorità", "piano", "giudica", "sintetizza"] },
];

function classificaCompito(testo) {
  const t = (testo || "").toLowerCase();
  for (const ind of INDIZI) {
    if (ind.kw.some((k) => t.includes(k))) return ind.compito;
  }
  return "ragionamento";
}

/**
 * Sceglie l'AI più economica capace per un compito (testo libero o chiave-compito).
 * @param {string} testo
 * @returns {{compito:string, modello:string, tier:string, perche:string, chiave:string|null, collegato:boolean, fallback:string|null}}
 */
export function scegliModello(testo) {
  const routing = leggiRouting();
  const regole = routing.regole || [];
  // Match diretto sulla chiave-compito, altrimenti classifica dal testo.
  const compito = regole.some((r) => r.compito === testo) ? testo : classificaCompito(testo);
  const regola = regole.find((r) => r.compito === compito) || regole.find((r) => r.compito === "ragionamento");
  if (!regola) {
    return { compito: "ragionamento", modello: "claude", tier: "forfait", perche: "default", chiave: null, collegato: true, fallback: null };
  }
  const chiave = regola.chiave || null;
  const collegato = !chiave || !!process.env[chiave]?.trim();
  return {
    compito: regola.compito,
    modello: regola.modello,
    tier: regola.tier,
    perche: regola.perche,
    chiave,
    collegato,
    fallback: regola.fallback || null,
    router_solo_consiglio: ROUTER_SOLO_CONSIGLIO,
    modello_eseguito: "claude",
  };
}

function registraLog(testo, scelta) {
  const routing = leggiRouting();
  routing.log = routing.log || [];
  routing.log.push({
    quando: nowPiacenza(),
    compito: scelta.compito,
    modello: scelta.modello,
    modello_eseguito: scelta.modello_eseguito || "claude",
    router_solo_consiglio: ROUTER_SOLO_CONSIGLIO,
    tier: scelta.tier,
    richiesta: (testo || "").slice(0, 120),
  });
  if (routing.log.length > 500) routing.log = routing.log.slice(-500);
  // Sommario d'uso: conta ciò che gira DAVVERO (premium), non la scelta teorica economica.
  const conteggio = {};
  for (const l of routing.log) {
    const k = l.modello_eseguito || l.modello;
    conteggio[k] = (conteggio[k] || 0) + 1;
  }
  routing.uso = conteggio;
  routing.router_solo_consiglio = ROUTER_SOLO_CONSIGLIO;
  routing.aggiornato = nowPiacenza();
  writeFileSync(PATH, JSON.stringify(routing, null, 2) + "\n", "utf8");
}

function main() {
  if (process.argv.includes("--lista")) {
    const routing = leggiRouting();
    console.log(`\n🤖 BANCO AI — regole di routing (${(routing.regole || []).length}) — ${routing.aggiornato}\n`);
    for (const r of routing.regole || []) {
      const collegato = !r.chiave || !!process.env[r.chiave]?.trim();
      console.log(`${r.compito.padEnd(18)} → ${String(r.modello).padEnd(18)} [${r.tier}] ${collegato ? "🔌 collegato" : r.chiave ? `serve ${r.chiave}` : ""}`);
    }
    return;
  }
  const testo = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ");
  if (!testo) {
    console.error('Uso: node cervello/banco-ai.mjs "<compito>"   |   --lista');
    process.exit(2);
  }
  const s = scegliModello(testo);
  console.log(`\n🤖 Compito: ${s.compito}`);
  console.log(`   → Suggerisce: ${s.modello} [${s.tier}] — ${s.perche}`);
  if (ROUTER_SOLO_CONSIGLIO) {
    console.log("   ⚠️  ROUTER_SOLO_CONSIGLIO: l'esecuzione resta sempre sul motore premium (niente API a consumo).");
  } else if (s.modello === "claude") {
    console.log("   (ragionamento: è giusto usare Claude, costo fisso.)");
  } else {
    console.log(`   Chiave: ${s.chiave || "—"} ${s.collegato ? "✅ collegata" : "❌ NON collegata → per ora fallback su Claude o coda"}${s.fallback ? ` · fallback: ${s.fallback}` : ""}`);
  }
  if (process.argv.includes("--log")) {
    registraLog(testo, s);
    console.log("   📊 Scelta registrata nel log (misura d'uso in routing.json).");
  }
}

// Esegui il CLI solo se lanciato direttamente (non su import).
if (process.argv[1] && process.argv[1].endsWith("banco-ai.mjs")) main();
