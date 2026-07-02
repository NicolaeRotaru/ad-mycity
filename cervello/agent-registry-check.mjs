#!/usr/bin/env node
// Guardiano deterministico del registro agenti — confronta i file reali `.claude/agents/*.md`
// con gli elenchi umani (CLAUDE.md, COMANDI.md, AGENTI.md) e segnala il DRIFT.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge e stampa un report (+ opzionale --json).
//
// Risolve AR-007 / AR-008: il registro degli agenti è mantenuto A MANO in più file che divergono a
// ogni nuovo agente — agenti "orfani" invisibili al router principale e conteggi dichiarati incoerenti
// (es. "40 senior" contro 42 file reali). Questo guardiano rende il drift misurabile a ogni giro,
// non più affidato alla memoria umana o alla sola radiografia LLM su comando.
//
// Uso:
//   node cervello/agent-registry-check.mjs           -> report leggibile
//   node cervello/agent-registry-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = nessun drift · 1 = drift presente (così può fare da gate in CI o nel giro)

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");

// Cartella dei mansionari operativi (fonte di verità) e i tre file "registro" mantenuti a mano.
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");

/**
 * Legge un file registro relativo alla radice AD; se manca torna stringa vuota — un file
 * assente equivale a "non cita nessun agente", così il drift emerge invece di far crashare.
 * @param {string} rel
 */
function leggiTesto(rel) {
  const p = join(AD_ROOT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

async function main() {
  const quando = nowPiacenza();

  // 1. Nomi-agente reali = basename (senza .md) di ogni file in `.claude/agents/`.
  const agentiReali = readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();

  // 2. Contenuto dei file "registro" tenuti a mano (match semplice della stringa esatta del nome).
  const claude = leggiTesto("CLAUDE.md");
  const comandi = leggiTesto("COMANDI.md");
  const agentiMd = leggiTesto("MyCity-Vault/07-Agenti/AGENTI.md");

  // 3. Orfani = agenti reali con 0 occorrenze SIA in CLAUDE.md SIA in COMANDI.md:
  //    il router principale (mansionario dell'AD + menù comandi) non li vede affatto.
  const orfani = agentiReali.filter((n) => !claude.includes(n) && !comandi.includes(n));

  // 4. Assenti da AGENTI.md = agenti reali non citati nella mappa-organigramma leggibile del vault.
  const assentiDaAgentiMd = agentiReali.filter((n) => !agentiMd.includes(n));

  // 5. Conteggio: numero reale di file vs numero dichiarato in AGENTI.md ("N senior").
  //    Tolleranza +1: la mappa può contare anche l'AD, che NON è un file in `.claude/agents/`.
  const nReali = agentiReali.length;
  const mNum = agentiMd.match(/(\d+)\s+senior/i);
  const nDichiaratoAgentiMd = mNum ? Number(mNum[1]) : null;
  const conteggioIncoerente =
    nDichiaratoAgentiMd != null &&
    nDichiaratoAgentiMd !== nReali &&
    nDichiaratoAgentiMd !== nReali + 1;

  // Drift totale = somma dei difetti (orfani + assenti da AGENTI.md + eventuale conteggio incoerente).
  const driftTotale =
    orfani.length + assentiDaAgentiMd.length + (conteggioIncoerente ? 1 : 0);

  await stampSegnale(
    "agent-registry",
    driftTotale > 0 ? "warn" : "ok",
    `${orfani.length} orfani · ${quando}`
  );

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          quando,
          n_reali: nReali,
          orfani,
          assenti_da_agenti_md: assentiDaAgentiMd,
          n_dichiarato_agenti_md: nDichiaratoAgentiMd,
          conteggio_incoerente: conteggioIncoerente,
          drift_totale: driftTotale,
        },
        null,
        2
      )
    );
  } else {
    console.log(`\n🧭 AGENT REGISTRY DRIFT — ${quando}\n`);
    console.log(`Agenti reali (.claude/agents/*.md): ${nReali}`);
    if (nDichiaratoAgentiMd != null) {
      console.log(
        `Dichiarati in AGENTI.md: ${nDichiaratoAgentiMd}${conteggioIncoerente ? "  ⚠️  INCOERENTE" : "  ✅"}`
      );
    }

    if (driftTotale === 0) {
      console.log(`\n✅ nessun drift`);
    } else {
      console.log(
        `\n❌ ${orfani.length} ORFANI (0 occorrenze in CLAUDE.md e COMANDI.md — il router non li vede):`
      );
      for (const n of orfani) console.log(`  • ${n}`);

      if (assentiDaAgentiMd.length) {
        console.log(`\n⚠️  ${assentiDaAgentiMd.length} assenti dall'organigramma AGENTI.md:`);
        for (const n of assentiDaAgentiMd) console.log(`  • ${n}`);
      }

      if (conteggioIncoerente) {
        console.log(
          `\n🔢 Conteggio incoerente: AGENTI.md dichiara ${nDichiaratoAgentiMd} senior, i file reali sono ${nReali}.`
        );
      }
    }
    console.log(`\nDrift totale: ${driftTotale}`);
  }

  process.exit(driftTotale > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERRORE agent-registry-check:", e.message || e);
  await stampSegnale(
    "agent-registry",
    "errore",
    `crash: ${(e.message || e).toString().slice(0, 200)}`
  );
  process.exit(1);
});
