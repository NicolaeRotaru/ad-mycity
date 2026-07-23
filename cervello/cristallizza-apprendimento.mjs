#!/usr/bin/env node
// 🧬 CRISTALLIZZA-APPRENDIMENTO — l'esecutore che manca: da LEZIONE MATURA a PRINCIPIO, e accende il
// DECADIMENTO. È il passo che il guardiano (apprendimento-guardiano.mjs) misura ma che nessuno faceva.
//
// IL PROBLEMA (sonda «apprendimento», 2026-07-24): 75 lezioni MATURE (conf≥0.8 & evidenze≥3) mai
// promosse a principio, solo 4 principi su 466, 0 decadute. La spec (apprendimento.md) affidava la
// promozione e il decadimento alla prosa del venerdì → non succedeva mai. Questo script li ESEGUE,
// in modo meccanico e limitato (poche promozioni per giro, così converge senza floodare).
//
// COSA FA (scrive apprendimento.json solo con --applica; default = anteprima):
//   1) PROMOZIONE: prende le lezioni mature (conf≥0.8 & evidenze≥3, non già principio/decadute),
//      ne promuove le TOP-N per evidenze a `stato:"principio"` con `promosso_il`. La cristallizzazione
//      "in comportamento" avviene perché contesto-lezioni.mjs inietta i principi in OGNI contesto —
//      cioè `cristallizzato_in:"memoria-persistente"`.
//   2) RICONCILIA il top-level `principi[]` con TUTTE le lezioni-principio (la sonda ha trovato 3≠4).
//   3) DECADIMENTO: le lezioni ATTIVE non riconfermate da > DECAY_DAYS perdono confidenza; sotto 0.3
//      diventano `decaduta` (restano archiviate, non si applicano). Così l'archivio smette di crescere
//      all'infinito (era 0 decadute).
//   4) Aggiorna `meta` (lezioni_attive, promosse_a_principio, decadute, cristallizzazione_ultima).
//
// USO:
//   node cervello/cristallizza-apprendimento.mjs            -> ANTEPRIMA (non scrive), report + exit 0
//   node cervello/cristallizza-apprendimento.mjs --applica   -> scrive apprendimento.json
//   node cervello/cristallizza-apprendimento.mjs --max 5     -> quante promozioni per esecuzione (default 5)
//   node cervello/cristallizza-apprendimento.mjs --json       -> output macchina
//
// Sola scrittura su apprendimento.json (memoria AI, area della macchina). Fail-safe: se il file manca
// o è rotto, non fa nulla ed esce 0 (non deve mai rompere un giro).

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APPR = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza", "apprendimento.json");

const args = process.argv.slice(2);
const APPLICA = args.includes("--applica");
const JSON_OUT = args.includes("--json");
const maxIdx = args.indexOf("--max");
const MAX_PROMOZIONI = maxIdx >= 0 && args[maxIdx + 1] ? Math.max(1, Number(args[maxIdx + 1]) || 5) : 5;

const CONF_PRINCIPIO = 0.8;
const EVIDENZE_PRINCIPIO = 3;
const DECAY_DAYS = 28; // ~4 settimane senza riconferma → inizia a decadere
const DECAY_STEP = 0.15; // quanto scende la confidenza a ogni decadimento
const CONF_MORTE = 0.3; // sotto = decaduta

function oraRoma() {
  // formato AAAA-MM-GG HH:MM, fuso Europe/Rome
  const d = new Date();
  const p = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(d);
  return p.replace("T", " ").slice(0, 16);
}

function giorniDa(iso) {
  if (!iso) return Infinity;
  const t = Date.parse(String(iso).replace(" ", "T"));
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 86400000;
}

function fine(payload, exit = 0) {
  if (JSON_OUT) process.stdout.write(JSON.stringify(payload, null, 2));
  process.exit(exit);
}

if (!existsSync(APPR)) fine({ esito: "assente" });

let dati;
try {
  dati = JSON.parse(readFileSync(APPR, "utf8"));
} catch {
  fine({ esito: "illeggibile" });
}

const lezioni = Array.isArray(dati.lezioni) ? dati.lezioni : [];
const ora = oraRoma();

// --- 1) PROMOZIONE: le mature (non principio/decadute) → principio, top-N per evidenze ---
const mature = lezioni
  .filter(
    (l) =>
      l &&
      Number(l.confidenza) >= CONF_PRINCIPIO &&
      Number(l.evidenze) >= EVIDENZE_PRINCIPIO &&
      l.stato !== "principio" &&
      l.stato !== "decaduta",
  )
  .sort((a, b) => (Number(b.evidenze) || 0) - (Number(a.evidenze) || 0));

const daPromuovere = mature.slice(0, MAX_PROMOZIONI);
const promosse = [];
for (const l of daPromuovere) {
  l.stato = "principio";
  l.promosso_il = ora;
  l.cristallizzato_in = "memoria-persistente"; // iniettato in ogni contesto da contesto-lezioni.mjs
  promosse.push({ id: l.id, testo: String(l.testo || "").slice(0, 90), evidenze: l.evidenze });
}

// --- 2) RICONCILIA il top-level principi[] con TUTTE le lezioni-principio ---
const tuttiPrincipi = lezioni.filter((l) => l && l.stato === "principio");
dati.principi = tuttiPrincipi.map((l) => ({
  id: l.id,
  testo: l.testo,
  tag: l.tag,
  reparto: l.reparto,
  promosso_il: l.promosso_il || l.ultima_conferma || ora,
}));

// --- 3) DECADIMENTO: attive non riconfermate da > DECAY_DAYS ---
const decadute = [];
for (const l of lezioni) {
  if (!l || l.stato !== "attiva") continue;
  if (giorniDa(l.ultima_conferma || l.nato) > DECAY_DAYS) {
    l.confidenza = Math.max(0, Number(l.confidenza || 0) - DECAY_STEP);
    if (l.confidenza < CONF_MORTE) {
      l.stato = "decaduta";
      l.decaduta_il = ora;
      decadute.push({ id: l.id, testo: String(l.testo || "").slice(0, 70) });
    }
  }
}

// --- 4) meta ---
const nAttive = lezioni.filter((l) => l && l.stato === "attiva").length;
const nPrincipi = lezioni.filter((l) => l && l.stato === "principio").length;
const nDecadute = lezioni.filter((l) => l && l.stato === "decaduta").length;
dati.meta = dati.meta || {};
dati.meta.lezioni_attive = nAttive;
dati.meta.promosse_a_principio = nPrincipi;
dati.meta.decadute = nDecadute;
dati.meta.cristallizzazione_ultima = ora;

const report = {
  esito: "ok",
  applicato: APPLICA,
  promosse_ora: promosse.length,
  promosse,
  arretrato_restante: Math.max(0, mature.length - promosse.length),
  decadute_ora: decadute.length,
  totali: { attive: nAttive, principi: nPrincipi, decadute: nDecadute },
};

if (APPLICA && (promosse.length || decadute.length || true)) {
  try {
    copyFileSync(APPR, APPR + ".bak"); // backup reversibile
    writeFileSync(APPR, JSON.stringify(dati, null, 2));
    report.scritto = true;
    report.backup = APPR + ".bak";
  } catch (e) {
    report.esito = "errore-scrittura";
    report.errore = String(e.message || e);
    fine(report, 0);
  }
}

if (JSON_OUT) fine(report);

// report umano
console.log("🧬 CRISTALLIZZAZIONE APPRENDIMENTO" + (APPLICA ? " (APPLICATA)" : " (anteprima — usa --applica per scrivere)"));
console.log(`   promosse a principio ORA: ${promosse.length} (arretrato restante: ${report.arretrato_restante})`);
for (const p of promosse) console.log(`     ⬆︎ [${p.evidenze} ev] ${p.testo}…`);
console.log(`   decadute ORA: ${decadute.length}`);
console.log(`   totali → attive: ${nAttive} · principi: ${nPrincipi} · decadute: ${nDecadute}`);
if (!APPLICA) console.log("   (nulla scritto: anteprima)");
process.exit(0);
