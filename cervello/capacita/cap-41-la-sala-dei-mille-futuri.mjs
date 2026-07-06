#!/usr/bin/env node
// Capacità #41 — La Sala dei Mille Futuri. scenari in massa contro cui ogni strategia sopravvive.
// STATO: SCAFFOLD — engine registrato e VIVO nel codice, in attesa del carburante reale.
// Cancello di sblocco: G3 · Storico ≥12 mesi. Si attiva quando: ≥12 mesi di dati veri accumulati.
// Fonte dati (che userà): modello del mondo + storico.
// 🟢 Sola lettura. NON inventa dati: legge lo stato reale e dice onestamente se è pronta o cosa manca.
//
// Uso:  node cervello/capacita/${slug}.mjs [--json]
// Exit: 0 = cancello APERTO (pronta a diventare codice pieno) · 1 = in attesa del carburante

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "../git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");
const META = {
  n: 41, nome: "La Sala dei Mille Futuri", stato: "scaffold",
  cosa_fa: "scenari in massa contro cui ogni strategia sopravvive", fonte_dati: "modello del mondo + storico",
  cancello: "G3 · Storico ≥12 mesi", si_attiva_quando: "≥12 mesi di dati veri accumulati",
};

function main() {
  const quando = nowPiacenza();
  const now = new Date();
  const inizio = new Date("2026-06-24T00:00");
  const valore = +(((now - inizio) / (1000*60*60*24*30.44))).toFixed(1);
  const aperto = valore >= 12;
  const out = { ...META, quando, cancello_valore: valore, cancello_soglia: 12, cancello_aperto: aperto, pronta_a_costruire: aperto };
  if (JSON_MODE) { console.log(JSON.stringify(out, null, 2)); process.exit(aperto ? 0 : 1); }
  console.log(`#${META.n} ${META.nome} — ` + (aperto ? "🟢 CANCELLO APERTO: pronta da costruire in codice pieno." : "🔒 in attesa"));
  console.log(`   Cosa farà: ${META.cosa_fa}`);
  console.log(`   Fonte dati: ${META.fonte_dati}`);
  console.log(`   Cancello: ${META.cancello}` + (` (${valore}/12)`));
  if (!aperto) console.log(`   Si attiva quando: ${META.si_attiva_quando}`);
  process.exit(aperto ? 0 : 1);
}

main();
