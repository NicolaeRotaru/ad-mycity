#!/usr/bin/env node
// CRUSCOTTO DELLE 53 CAPACITÀ — la vista unica: quali sono VIVE (codice pieno che gira sui dati reali),
// quali sono SCAFFOLD (engine registrato, in attesa del carburante), e per queste quale cancello di
// realtà le sblocca. Legge cervello/capacita/_indice.json + lo stato reale. Nessun numero inventato.
//
// 🟢 Sola lettura.  Uso:  node cervello/capacita.mjs [--json]
// Exit: 0 sempre (è un cruscotto).

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");
const INDICE = join(AD_ROOT, "cervello/capacita/_indice.json");

const COSTRUITE = [
  { n: 4, nome: "La Macchina del Tempo", file: "cervello/macchina-del-tempo.mjs" },
  { n: 12, nome: "Il Sistema Immunitario", file: "cervello/sistema-immunitario.mjs" },
  { n: 13, nome: "Il Bilancio Vivo", file: "cervello/bilancio-vivo.mjs" },
  { n: 23, nome: "Il Midollo Spinale", file: "cervello/midollo-spinale.mjs" },
  { n: 30, nome: "Il Metabolismo", file: "cervello/metabolismo.mjs" },
  { n: 37, nome: "Il Letargo", file: "cervello/letargo.mjs" },
  { n: 38, nome: "Il Guardiano del Tuo Tempo", file: "cervello/guardiano-tempo.mjs" },
];

function numeroDaRiga(testo, etichetta) {
  const re = new RegExp("\\|\\s*" + etichetta + "[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  return m ? Number(m[1]) : 0;
}

function main() {
  const quando = nowPiacenza();
  const testo = existsSync(STATO) ? readFileSync(STATO, "utf8") : "";
  const consegnati = numeroDaRiga(testo, "Ordini consegnati");
  const negozi = numeroDaRiga(testo, "Negozi REALI");
  const mesi = +(((new Date() - new Date("2026-06-24T00:00")) / (1000 * 60 * 60 * 24 * 30.44))).toFixed(1);
  const gateAperto = {
    G1: consegnati >= 1, G2: negozi >= 5, G2b: negozi >= 10,
    G3: mesi >= 12, G5: negozi >= 30, G6: false,
  };

  let scaffold = [];
  if (existsSync(INDICE)) scaffold = JSON.parse(readFileSync(INDICE, "utf8")).capacita || [];
  scaffold = scaffold.map((c) => ({ ...c, pronta: !!gateAperto[c.gate] }));

  const pronte = scaffold.filter((c) => c.pronta);
  const attesa = scaffold.filter((c) => !c.pronta);

  const out = {
    quando,
    totale: COSTRUITE.length + scaffold.length,
    vive: COSTRUITE.length,
    scaffold: scaffold.length,
    scaffold_pronti_a_costruire: pronte.length,
    scaffold_in_attesa: attesa.length,
    stato_reale: { consegne: consegnati, negozi_reali: negozi, mesi_storico: mesi },
    costruite: COSTRUITE,
    da_costruire: scaffold,
  };
  if (JSON_MODE) { console.log(JSON.stringify(out, null, 2)); process.exit(0); }

  console.log(`🧬 Le 53 Capacità — cruscotto ${quando}`);
  console.log(`   Stato reale: ${consegnati} consegne · ${negozi} negozi · ${mesi} mesi storico\n`);
  console.log(`   ✅ VIVE (codice pieno, girano nel giro): ${COSTRUITE.length}`);
  for (const c of COSTRUITE) console.log(`      #${String(c.n).padStart(2)} ${c.nome}`);
  console.log(`\n   🧱 SCAFFOLD (engine registrato, esiste come codice): ${scaffold.length}`);
  console.log(`      🟢 pronti a diventare codice pieno (cancello aperto): ${pronte.length}`);
  for (const c of pronte) console.log(`         #${String(c.n).padStart(2)} ${c.nome}  [${c.gate}]`);
  console.log(`      🔒 in attesa del carburante: ${attesa.length}`);
  const perGate = {};
  for (const c of attesa) (perGate[c.gate] = perGate[c.gate] || []).push(c.n);
  for (const [g, ns] of Object.entries(perGate)) console.log(`         ${g}: ${ns.length} capacità (#${ns.join(" #")})`);
  console.log(`\n   TOTALE: ${out.totale}/53 esistono come codice · ${out.vive} vive · ${out.scaffold} scaffold.`);
  console.log(`   Il prossimo cancello che apre capacità è G1 (prima consegna) — mani di Nicola.`);
  process.exit(0);
}

main();
