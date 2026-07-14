#!/usr/bin/env node
// Guardiano dello stampo senior (dimensione vettori-installati / «Come pensa l'AD»).
// Verifica che ogni agente abbia Scheda, hook rubrica, scorecard, kit non-stub, quaderno memoria-squadra.
// 🟢 Sola lettura + scrittura opzionale su auto-coscienza/stampo-check.json
//
// Uso:
//   node cervello/stampo-check.mjs           -> report leggibile
//   node cervello/stampo-check.mjs --json    -> output JSON (gate / sentinelle)
//
// Exit: 0 = tutto ok · 1 = difetti strutturali (senior a metà)

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");
const KIT_DIR = join(AD_ROOT, "MyCity-Vault/07-Agenti/kit");
const SQUADRA_DIR = join(AD_ROOT, "memoria-squadra");
const STATE_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/stampo-check.json");

/** Kit «non stub»: almeno 5,2 KB e sezione E (strato sapere completo). Soglia sotto content-social (~15 KB) ma sopra scheletri 3 KB. */
const KIT_MIN_BYTES = 5200;

function agenti() {
  if (!existsSync(AGENTS_DIR)) return [];
  return readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => basename(f, ".md"))
    .sort();
}

function analizzaAgente(nome) {
  const path = join(AGENTS_DIR, `${nome}.md`);
  const testo = readFileSync(path, "utf8");
  const difetti = [];

  if (!/##\s*🎓\s*SCHEDA MESTIERE/i.test(testo)) difetti.push("scheda_mestiere_assente");
  if (!/RUBRICA-LIVELLI/i.test(testo)) difetti.push("hook_rubrica_assente");
  if (!/scorecard/i.test(testo)) difetti.push("scorecard_assente");
  if (!/RITUALE DI FINE/i.test(testo)) difetti.push("rituale_fine_assente");

  const kitPath = join(KIT_DIR, `${nome}-KIT.md`);
  if (!existsSync(kitPath)) {
    difetti.push("kit_assente");
  } else {
    const kit = readFileSync(kitPath, "utf8");
    const bytes = statSync(kitPath).size;
    if (bytes < KIT_MIN_BYTES) difetti.push(`kit_stub_${bytes}B`);
    if (!/\n## E\./.test(kit)) difetti.push("kit_senza_sezione_E");
  }

  const quaderno = join(SQUADRA_DIR, `${nome}.md`);
  if (!existsSync(quaderno)) difetti.push("quaderno_assente");

  return { nome, difetti };
}

async function main() {
  const quando = nowPiacenza();
  const roster = agenti();
  const risultati = roster.map(analizzaAgente);
  const conDifetti = risultati.filter((r) => r.difetti.length);
  const perTipo = {};
  for (const r of conDifetti) {
    for (const d of r.difetti) perTipo[d] = (perTipo[d] || 0) + 1;
  }

  const state = {
    _cosa_e:
      "Guardiano stampo senior (vettori-installati): verifica Scheda + rubrica + scorecard + kit + quaderno per ogni agente.",
    aggiornato: quando,
    totale_agenti: roster.length,
    ok: roster.length - conDifetti.length,
    con_difetti: conDifetti.length,
    per_tipo: perTipo,
    senior_a_meta: conDifetti.map((r) => ({ reparto: r.nome, difetti: r.difetti })),
  };

  mkdirSync(join(STATE_PATH, ".."), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf8");

  const sintesi = `${state.ok}/${roster.length} senior completi · ${conDifetti.length} a metà`;
  await stampSegnale("stampo-check", conDifetti.length ? "warn" : "ok", `${sintesi} · ${quando}`);

  if (JSON_MODE) {
    console.log(JSON.stringify(state, null, 2));
  } else {
    console.log(`\n🏗️ STAMPO-CHECK — ${quando}`);
    console.log(`   ${sintesi}`);
    if (conDifetti.length) {
      console.log(`\n   Tipi di difetto:`);
      for (const [k, v] of Object.entries(perTipo).sort((a, b) => b[1] - a[1])) {
        console.log(`   • ${k}: ${v}`);
      }
      console.log(`\n   Senior a metà (primi 30):`);
      for (const r of conDifetti.slice(0, 30)) {
        console.log(`   • @${r.nome.padEnd(24)} ${r.difetti.join(", ")}`);
      }
    } else {
      console.log("   ✅ Tutti i senior hanno lo stampo installato.");
    }
  }

  process.exit(conDifetti.length ? 1 : 0);
}

await main();
