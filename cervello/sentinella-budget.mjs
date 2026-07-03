#!/usr/bin/env node
// AR-077 — SENTINELLA DI BUDGET per reparto, con STOP a soglia (rende REALE il freno solo prosa).
// 🟡 Sola lettura + accoda uno STOP 🔴 in AZIONI-IN-ATTESA quando un reparto sfora. Firma Nicola per cablarlo.
//
// Problema (AR-077): "STOP automatico se un reparto brucia budget" era solo prosa nel mansionario: nessun
// sensore di spesa, nessun blocco reale. Un gap capacità-dichiarata / sensore-mancante non segnalato
// onestamente → il freno sembra attivo ma non c'è.
//
// Fix (onesto sullo stato): finché ads / Stripe-write sono scollegati la lettura-spesa NON è automatica.
// Questo pezzo rende la capacità VERA e machine-checkable appena esistono spese:
//   - legge un budget per reparto (MyCity-Vault/05-Soldi-Rischi/budget-reparti.json, o quello che gli passi);
//   - somma lo SPESO per reparto;
//   - se speso ≥ soglia*budget (default 100%) → segnala STOP e (senza --dry) accoda l'azione 🔴 in coda.
// Se non c'è nessuna spesa collegata, lo dice esplicitamente ("sensore spesa: non attivo") invece di fingere
// un freno attivo — è l'onestà-di-capacità che AR-077 chiede.
//
// Formato budget-reparti.json:
//   { "soglia_stop": 1.0,
//     "reparti": { "ads-performance": { "budget": 300, "speso": 0, "kpi_reso": 0 },
//                  "marketing":       { "budget": 150, "speso": 0 } } }
//
// Uso:
//   node cervello/sentinella-budget.mjs                 -> report + accoda STOP per chi sfora
//   node cervello/sentinella-budget.mjs --dry           -> report, NON accoda
//   node cervello/sentinella-budget.mjs --json          -> output JSON (per giro / sentinelle)
//   node cervello/sentinella-budget.mjs --file <path>   -> usa un altro file budget
//
// Exit: 0 = tutti sotto soglia (o sensore non attivo) · 1 = almeno un reparto in STOP.

import { existsSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const JSON_MODE = args.includes("--json");
const fileArg = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;

const BUDGET_PATH = fileArg || join(AD_ROOT, "MyCity-Vault/05-Soldi-Rischi/budget-reparti.json");
const CODA_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function main() {
  const cfg = readJson(BUDGET_PATH);
  const soglia = cfg && typeof cfg.soglia_stop === "number" ? cfg.soglia_stop : 1.0;
  const reparti = cfg && cfg.reparti && typeof cfg.reparti === "object" ? cfg.reparti : {};
  const nomi = Object.keys(reparti);

  // Somma totale spesa: se 0 (o file assente), il sensore spesa è "non attivo" → dillo onestamente.
  const spesaTotale = nomi.reduce((s, n) => s + (Number(reparti[n].speso) || 0), 0);
  const sensoreAttivo = existsSync(BUDGET_PATH) && spesaTotale > 0;

  const righe = nomi.map((n) => {
    const r = reparti[n];
    const budget = Number(r.budget) || 0;
    const speso = Number(r.speso) || 0;
    const kpi = Number(r.kpi_reso ?? r.reso ?? 0) || 0;
    const usato = budget > 0 ? speso / budget : speso > 0 ? Infinity : 0;
    const stop = usato >= soglia && speso > 0;
    return { reparto: n, budget, speso, kpi_reso: kpi, percentuale: budget > 0 ? Math.round(usato * 100) : null, stop };
  });

  const inStop = righe.filter((r) => r.stop);

  // Accoda uno STOP 🔴 in coda per ogni reparto che sfora (append-only, non riscrive).
  if (!DRY && inStop.length && existsSync(CODA_PATH)) {
    const ts = nowPiacenza();
    let blocco = `\n<!-- sentinella-budget AR-077 @ ${ts} -->\n`;
    for (const r of inStop) {
      blocco +=
        `## 🔴 STOP budget — ${r.reparto} (${ts})\n` +
        `- Reparto: **${r.reparto}** · Speso: **${r.speso}€** su budget **${r.budget}€**` +
        (r.percentuale != null ? ` (${r.percentuale}%)` : "") +
        ` · KPI reso: ${r.kpi_reso}\n` +
        `- Cosa cambia: il reparto ha raggiunto/superato il tetto di spesa senza rendere abbastanza → sospendere la spesa finché Nicola non rivede.\n` +
        `- Se va bene: Nicola conferma STOP o alza il budget con motivazione.\n`;
    }
    appendFileSync(CODA_PATH, blocco, "utf8");
  }

  const report = {
    ok: inStop.length === 0,
    sensore_spesa: sensoreAttivo ? "attivo" : "non attivo (nessuna spesa collegata: ads/Stripe-write scollegati)",
    soglia_stop: soglia,
    reparti: righe,
    in_stop: inStop.map((r) => r.reparto),
    accodato: !DRY && inStop.length > 0,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`💶 Sentinella budget — sensore spesa: ${report.sensore_spesa}`);
    if (!nomi.length) {
      console.log(`   (nessun reparto in ${BUDGET_PATH}: crea il file per attivare il freno)`);
    }
    for (const r of righe) {
      const pct = r.percentuale != null ? `${r.percentuale}%` : "budget 0";
      console.log(`   ${r.stop ? "🔴 STOP" : "🟢 ok  "} ${r.reparto}: speso ${r.speso}€ / ${r.budget}€ (${pct}) · KPI reso ${r.kpi_reso}`);
    }
    if (inStop.length) {
      console.log(`\n🔴 ${inStop.length} reparto/i oltre soglia (${Math.round(soglia * 100)}%): STOP ${DRY ? "(dry: non accodato)" : "accodato in AZIONI-IN-ATTESA 🔴"}.`);
    } else {
      console.log(`\n🟢 Nessun reparto oltre soglia.`);
    }
  }

  process.exit(inStop.length ? 1 : 0);
}

main();
