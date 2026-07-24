#!/usr/bin/env node
// 📊 UTILIZZO-SENIOR — il roster dei 120 agenti come NUMERO, non come elenco (Mossa 7).
//
// IL PROBLEMA (sonda «orchestrazione», 2026-07-24): 120 agenti ma ~26% davvero usati (vivi 31,
// fermi 89, mai-un-esito 73); i 78 «nuovi senior» quasi tutti dormienti. Nicola non vede mai questo
// numero: il Pannello mostra «clienti dormienti», non «agenti dormienti». Questo script rende
// l'utilizzo un dato misurato — così l'overhead diventa una decisione (congelare/ritirare i dormienti),
// non un elenco che cresce.
//
// COSA FA (sola lettura di chiusura-loop.json, la sonda che la macchina già scrive a ogni giro):
//   utilizzo reale (quaderni con ≥1 ESITO), top-consumatori, dormienti, e la lista dei fermi.
//
// USO:
//   node cervello/utilizzo-senior.mjs           -> report umano
//   node cervello/utilizzo-senior.mjs --json     -> output macchina (per il Pannello)
//
// Sola lettura. Non fallisce mai (exit 0): è un cruscotto, non un gate.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CL = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza", "chiusura-loop.json");

const JSON_OUT = process.argv.includes("--json");

function fine(payload) {
  if (JSON_OUT) process.stdout.write(JSON.stringify(payload, null, 2));
  process.exit(0);
}

if (!existsSync(CL)) fine({ esito: "assente" });

let j;
try {
  j = JSON.parse(readFileSync(CL, "utf8"));
} catch {
  fine({ esito: "illeggibile" });
}

const quaderni = Array.isArray(j.quaderni) ? j.quaderni : [];
const totale = Number(j.totale) || quaderni.length || 0;
// vivo = ha prodotto almeno un ESITO (righe_esito > 0) e non è fermo
const vivi = quaderni.filter((q) => Number(q.righe_esito) > 0 && !q.fermo);
const conEsito = quaderni.filter((q) => Number(q.righe_esito) > 0);
const maiEsito = quaderni.filter((q) => !(Number(q.righe_esito) > 0));
const fermi = quaderni.filter((q) => q.fermo);
const utilizzo = totale ? conEsito.length / totale : 0;

const top = quaderni
  .filter((q) => Number(q.righe_esito) > 0)
  .sort((a, b) => Number(b.righe_esito) - Number(a.righe_esito))
  .slice(0, 10)
  .map((q) => ({ reparto: q.reparto, esiti: Number(q.righe_esito), giorni_fa: q.giorni_fa ?? null }));

const report = {
  esito: "ok",
  aggiornato: j.aggiornato || null,
  totale_agenti: totale,
  con_almeno_un_esito: conEsito.length,
  vivi: vivi.length,
  fermi: fermi.length,
  mai_un_esito: maiEsito.length,
  utilizzo_reale: Number(utilizzo.toFixed(3)),
  top_consumatori: top,
  dormienti_mai_usati: maiEsito.map((q) => q.reparto),
};

if (JSON_OUT) fine(report);

console.log("📊 UTILIZZO SENIOR (roster come numero)");
console.log(`   agenti totali: ${totale}`);
console.log(`   con almeno un ESITO: ${conEsito.length} (${(utilizzo * 100).toFixed(0)}% del roster)`);
console.log(`   mai un ESITO (dormienti): ${maiEsito.length}`);
console.log(`   fermi (nessun esito recente): ${fermi.length}`);
console.log("");
console.log("🏆 Top consumatori (chi lavora davvero):");
for (const t of top) console.log(`   ${String(t.esiti).padStart(4)} esiti  ${t.reparto}`);
console.log("");
if (utilizzo < 0.4) {
  console.log(`⚠️  Utilizzo ${(utilizzo * 100).toFixed(0)}% < 40%: il roster è per lo più overhead.`);
  console.log("   → Decisione da portare a Nicola: congelare i dormienti in una «panchina» dichiarata");
  console.log("     (nucleo operativo ~30-40), ogni riattivazione richiede un mandato reale. Meno");
  console.log("     contesto, meno drift dei guardiani, stesso valore.");
} else {
  console.log(`✅ Utilizzo ${(utilizzo * 100).toFixed(0)}%.`);
}
process.exit(0);
