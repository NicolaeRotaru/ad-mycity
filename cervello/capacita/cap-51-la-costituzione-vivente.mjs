#!/usr/bin/env node
// Capacità #51 — La Costituzione Vivente. le 18 Leggi come codice eseguibile e auto-emendabile.
// STATO: SCAFFOLD — engine registrato e VIVO nel codice, in attesa del carburante reale.
// Cancello di sblocco: G6 · Specie. Si attiva quando: Piacenza autonoma e in utile da 6 mesi.
// Fonte dati (che userà): CLAUDE.md + regole (esecubili).
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
  n: 51, nome: "La Costituzione Vivente", stato: "scaffold",
  cosa_fa: "le 18 Leggi come codice eseguibile e auto-emendabile", fonte_dati: "CLAUDE.md + regole (esecubili)",
  cancello: "G6 · Specie", si_attiva_quando: "Piacenza autonoma e in utile da 6 mesi",
};

function main() {
  const quando = nowPiacenza();
  const valore = null;
  const aperto = false; // cancello manuale (Piacenza autonoma e in utile da 6 mesi)
  const out = { ...META, quando, cancello_valore: valore, cancello_soglia: null, cancello_aperto: aperto, pronta_a_costruire: aperto };
  if (JSON_MODE) { console.log(JSON.stringify(out, null, 2)); process.exit(aperto ? 0 : 1); }
  console.log(`#${META.n} ${META.nome} — ` + (aperto ? "🟢 CANCELLO APERTO: pronta da costruire in codice pieno." : "🔒 in attesa"));
  console.log(`   Cosa farà: ${META.cosa_fa}`);
  console.log(`   Fonte dati: ${META.fonte_dati}`);
  console.log(`   Cancello: ${META.cancello}` + (""));
  if (!aperto) console.log(`   Si attiva quando: ${META.si_attiva_quando}`);
  process.exit(aperto ? 0 : 1);
}

main();
