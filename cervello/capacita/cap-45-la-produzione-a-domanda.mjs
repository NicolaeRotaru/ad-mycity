#!/usr/bin/env node
// Capacità #45 — La Produzione a Domanda. la domanda di domani detta stasera quanto produrre.
// STATO: SCAFFOLD — engine registrato e VIVO nel codice, in attesa del carburante reale.
// Cancello di sblocco: G5 · Città densa + via libera legale. Si attiva quando: ≥50% del centro sulla rete + parere legale.
// Fonte dati (che userà): anticipo predittivo + capacità produttive.
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
  n: 45, nome: "La Produzione a Domanda", stato: "scaffold",
  cosa_fa: "la domanda di domani detta stasera quanto produrre", fonte_dati: "anticipo predittivo + capacità produttive",
  cancello: "G5 · Città densa + via libera legale", si_attiva_quando: "≥50% del centro sulla rete + parere legale",
};

function main() {
  const quando = nowPiacenza();
  const testo = existsSync(STATO) ? readFileSync(STATO, "utf8") : "";
  const re = new RegExp("\\|\\s*Negozi REALI[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  const valore = m ? Number(m[1]) : 0;
  const aperto = valore >= 30;
  const out = { ...META, quando, cancello_valore: valore, cancello_soglia: 30, cancello_aperto: aperto, pronta_a_costruire: aperto };
  if (JSON_MODE) { console.log(JSON.stringify(out, null, 2)); process.exit(aperto ? 0 : 1); }
  console.log(`#${META.n} ${META.nome} — ` + (aperto ? "🟢 CANCELLO APERTO: pronta da costruire in codice pieno." : "🔒 in attesa"));
  console.log(`   Cosa farà: ${META.cosa_fa}`);
  console.log(`   Fonte dati: ${META.fonte_dati}`);
  console.log(`   Cancello: ${META.cancello}` + (` (${valore}/30)`));
  if (!aperto) console.log(`   Si attiva quando: ${META.si_attiva_quando}`);
  process.exit(aperto ? 0 : 1);
}

main();
