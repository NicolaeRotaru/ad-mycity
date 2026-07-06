#!/usr/bin/env node
// Capacità #35 — La Rete di Mutuo Soccorso. negozio in difficoltà → la rete lo solleva.
// STATO: SCAFFOLD — engine registrato e VIVO nel codice, in attesa del carburante reale.
// Cancello di sblocco: G2 · Rete di botteghe. Si attiva quando: ≥5 negozi reali a bordo (onboarding dal 9/7).
// Fonte dati (che userà): health score negozi (account-negozi).
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
  n: 35, nome: "La Rete di Mutuo Soccorso", stato: "scaffold",
  cosa_fa: "negozio in difficoltà → la rete lo solleva", fonte_dati: "health score negozi (account-negozi)",
  cancello: "G2 · Rete di botteghe", si_attiva_quando: "≥5 negozi reali a bordo (onboarding dal 9/7)",
};

function main() {
  const quando = nowPiacenza();
  const testo = existsSync(STATO) ? readFileSync(STATO, "utf8") : "";
  const re = new RegExp("\\|\\s*Negozi REALI[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  const valore = m ? Number(m[1]) : 0;
  const aperto = valore >= 5;
  const out = { ...META, quando, cancello_valore: valore, cancello_soglia: 5, cancello_aperto: aperto, pronta_a_costruire: aperto };
  if (JSON_MODE) { console.log(JSON.stringify(out, null, 2)); process.exit(aperto ? 0 : 1); }
  console.log(`#${META.n} ${META.nome} — ` + (aperto ? "🟢 CANCELLO APERTO: pronta da costruire in codice pieno." : "🔒 in attesa"));
  console.log(`   Cosa farà: ${META.cosa_fa}`);
  console.log(`   Fonte dati: ${META.fonte_dati}`);
  console.log(`   Cancello: ${META.cancello}` + (` (${valore}/5)`));
  if (!aperto) console.log(`   Si attiva quando: ${META.si_attiva_quando}`);
  process.exit(aperto ? 0 : 1);
}

main();
