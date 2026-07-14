#!/usr/bin/env node
// coerenza-rischi.mjs — una casa sola per i rischi (gemello di coerenza-fatti, AR-102 esteso).
//
// CANONICO: MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json (N/B, owner, sentinelle).
// PUNTATORE: MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-rischi.json (RSK legacy → citare il canonico).
//
// Uso:
//   node cervello/coerenza-rischi.mjs           -> controlla (exit 0 ok · 1 divergenze)
//   node cervello/coerenza-rischi.mjs --json

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nowPiacenza, stampSegnale } from "./git-github.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = join(QUI, "..");
const CANONICO = join(ROOT, "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json");
const PUNTATORE = join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-rischi.json");
const REPORT = join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-rischi.json");

const JSON_MODE = process.argv.includes("--json");

function leggiJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function check() {
  const problemi = [];
  const canonico = leggiJson(CANONICO, null);
  const puntatore = leggiJson(PUNTATORE, null);

  if (!canonico || !Array.isArray(canonico.rischi)) {
    problemi.push({ tipo: "canonico_assente", dettaglio: "REGISTRO-RISCHI.json mancante o senza rischi[]" });
  }

  if (!puntatore) {
    problemi.push({ tipo: "puntatore_assente", dettaglio: "auto-coscienza/registro-rischi.json assente" });
  } else if (!puntatore._canonico && !puntatore._puntatore) {
    problemi.push({
      tipo: "puntatore_mancante",
      dettaglio: "registro-rischi auto-coscienza non dichiara _canonico verso 05-Soldi-Rischi/REGISTRO-RISCHI.json",
    });
  }

  const rischiCanonici = (canonico?.rischi || []).filter((r) => r.id);
  const altaSenzaOwner = rischiCanonici.filter(
    (r) => (r.gravita === "alta" || r.gravita === "media-alta") && !(r.owner || "").trim()
  );
  if (altaSenzaOwner.length) {
    problemi.push({
      tipo: "alta_senza_owner",
      dettaglio: `${altaSenzaOwner.length} rischi ALTA senza owner nel registro canonico`,
      ids: altaSenzaOwner.map((r) => r.id),
    });
  }

  const rskAttivi = (puntatore?.rischi || []).filter((r) => r.stato !== "archiviato" && r.stato !== "chiuso");
  if (rskAttivi.length && !puntatore?._canonico) {
    problemi.push({
      tipo: "doppio_registro",
      dettaglio: `${rskAttivi.length} rischi RSK ancora attivi nel puntatore senza delega al canonico`,
      ids: rskAttivi.map((r) => r.id),
    });
  }

  const ok = problemi.length === 0;
  const report = {
    aggiornato: nowPiacenza(),
    ok,
    canonico: "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json",
    puntatore: "MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-rischi.json",
    n_rischi_canonico: rischiCanonici.length,
    problemi,
  };

  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

  return report;
}

async function main() {
  const report = check();
  await stampSegnale(
    "coerenza-rischi",
    report.ok ? "ok" : "warn",
    report.ok
      ? `${report.n_rischi_canonico} rischi · canonico ok`
      : `${report.problemi.length} divergenze registro-rischi`
  );

  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n🛡️ COERENZA RISCHI — ${report.aggiornato}\n`);
    console.log(`Canonico: ${report.canonico} (${report.n_rischi_canonico} rischi)`);
    if (report.ok) {
      console.log("✅ Registro rischi coerente (una casa sola).");
    } else {
      for (const p of report.problemi) {
        console.log(`❌ ${p.tipo}: ${p.dettaglio}`);
      }
    }
  }

  process.exit(report.ok ? 0 : 1);
}

main().catch(async (e) => {
  console.error("ERRORE coerenza-rischi:", e.message || e);
  await stampSegnale("coerenza-rischi", "errore", (e.message || e).toString().slice(0, 160));
  process.exit(1);
});
