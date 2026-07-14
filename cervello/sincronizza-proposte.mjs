#!/usr/bin/env node
// Sincronizza proposte_auto_riscrittura con lo stato reale del cantiere (AR-055).
// 🟢 Sola lettura del codice + aggiornamento auto-miglioramento.json.
//
// Problema: le proposte restano senza stato valido anche quando il difetto omonimo è già chiuso.
//
// Uso:
//   node cervello/sincronizza-proposte.mjs
//   node cervello/sincronizza-proposte.mjs --json

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const MIG = join(VAULT, "auto-miglioramento.json");
const CANTIERE = join(VAULT, "cantiere-difetti.json");

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function statoValido(s) {
  return s === "proposta" || s === "firmata" || s === "implementata" || s === "rifiutata";
}

async function main() {
  const quando = nowPiacenza();
  const mig = readJson(MIG, { proposte_auto_riscrittura: [] });
  const cantiere = readJson(CANTIERE, { difetti: [] });
  const byId = Object.fromEntries(
    (cantiere.difetti || []).filter((d) => d.id).map((d) => [d.id, d])
  );

  const proposte = Array.isArray(mig.proposte_auto_riscrittura) ? mig.proposte_auto_riscrittura : [];
  let aggiornate = 0;

  for (const p of proposte) {
    const prev = p.stato;
    if (!statoValido(prev)) {
      const d = p.finding_id ? byId[p.finding_id] : null;
      if (d?.stato === "chiuso") {
        p.stato = "implementata";
        p.sincronizzato_il = quando;
      } else if (d?.stato === "in-corso") {
        p.stato = "firmata";
        p.sincronizzato_il = quando;
      } else {
        p.stato = "proposta";
      }
      if (p.stato !== prev) aggiornate++;
    }
  }

  mig.aggiornato = quando;
  mig.proposte_sync = { aggiornato: quando, totale: proposte.length, aggiornate };
  writeJson(MIG, mig);

  const sintesi = `${proposte.length} proposte · ${aggiornate} allineate al cantiere`;
  await stampSegnale("sincronizza-proposte", "ok", `${sintesi} · ${quando}`);

  const out = { quando, sintesi, aggiornate, totale: proposte.length };
  if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
  else console.log(`🔄 sincronizza-proposte — ${sintesi}`);
}

main().catch(async (e) => {
  await stampSegnale("sincronizza-proposte", "errore", (e.message || e).toString().slice(0, 160));
  console.error("ERRORE sincronizza-proposte:", e.message || e);
  process.exit(1);
});
