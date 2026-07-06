#!/usr/bin/env node
// Capacità #14 — Il Tuo Doppio. modella come decide Nicola per pre-ordinare la coda.
// STATO: SCAFFOLD — engine registrato e VIVO nel codice, in attesa del carburante reale.
// Cancello di sblocco: G1 · Prima consegna reale. Si attiva quando: il primo ordine chiuso end-to-end su Pane Quotidiano (mani di Nicola).
// Fonte dati (che userà): DECISIONI.md + taste-file.
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
  n: 14, nome: "Il Tuo Doppio", stato: "scaffold",
  cosa_fa: "modella come decide Nicola per pre-ordinare la coda", fonte_dati: "DECISIONI.md + taste-file",
  cancello: "G1 · Prima consegna reale", si_attiva_quando: "il primo ordine chiuso end-to-end su Pane Quotidiano (mani di Nicola)",
};

function main() {
  const quando = nowPiacenza();
  const testo = existsSync(STATO) ? readFileSync(STATO, "utf8") : "";
  const re = new RegExp("\\|\\s*Ordini consegnati[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  const valore = m ? Number(m[1]) : 0;
  const aperto = valore >= 1;
  const out = { ...META, quando, cancello_valore: valore, cancello_soglia: 1, cancello_aperto: aperto, pronta_a_costruire: aperto };
  if (JSON_MODE) { console.log(JSON.stringify(out, null, 2)); process.exit(aperto ? 0 : 1); }
  console.log(`#${META.n} ${META.nome} — ` + (aperto ? "🟢 CANCELLO APERTO: pronta da costruire in codice pieno." : "🔒 in attesa"));
  console.log(`   Cosa farà: ${META.cosa_fa}`);
  console.log(`   Fonte dati: ${META.fonte_dati}`);
  console.log(`   Cancello: ${META.cancello}` + (` (${valore}/1)`));
  if (!aperto) console.log(`   Si attiva quando: ${META.si_attiva_quando}`);
  process.exit(aperto ? 0 : 1);
}

main();
