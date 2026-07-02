#!/usr/bin/env node
// Guardiano deterministico delle CAPACITÀ — confronta i workflow reali `.claude/workflows/*.js`
// (e le skill `.claude/skills/*`) con gli elenchi umani (COMANDI.md, CLAUDE.md) e segnala il DRIFT.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge e stampa un report (+ opzionale --json).
//
// Perché esiste: `agent-registry-check.mjs` copre i 42 AGENTI, ma NON i WORKFLOW. Una capacità potente
// (es. il workflow `audit-pannello`) può esistere sul disco senza NESSUN comando che la evochi: è come
// avere un senior che nessuno sa chiamare. Nicola non la troverà mai, e la macchina non è "cosciente" di
// avercela. Questo guardiano rende quel drift misurabile a ogni giro, invece di scoprirlo a mano.
//
// Cosa controlla:
//   1) ORFANI: workflow reali (`.claude/workflows/X.js`) NON citati né in COMANDI.md né in CLAUDE.md
//      → capacità senza porta d'ingresso (l'utente non la può invocare).
//   2) SKILL ORFANE: cartelle skill `.claude/skills/*` non citate in COMANDI.md/CLAUDE.md (best-effort:
//      se la cartella skills non esiste, il controllo si spegne da solo).
//   3) COMANDI ROTTI: riferimenti `.claude/workflows/NOME.js` scritti nei doc che NON esistono sul disco
//      (il contrario: un comando che punta a un workflow cancellato/rinominato).
//
// Uso:
//   node cervello/guardiano-capacita.mjs           -> report leggibile
//   node cervello/guardiano-capacita.mjs --json      -> output JSON (per gate / sentinelle)
//
// Exit: 0 = nessun drift · 1 = drift presente (così può fare da gate nel giro, come agent-registry-check).

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");

const WORKFLOWS_DIR = join(AD_ROOT, ".claude/workflows");
const SKILLS_DIR = join(AD_ROOT, ".claude/skills");

/** Legge un file registro relativo alla radice AD; se manca torna "" (→ il drift emerge, non crasha). */
function leggiTesto(rel) {
  const p = join(AD_ROOT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

/** Elenca i nomi (basename senza estensione) dei file `.js`/`.mjs` in una cartella, o [] se assente. */
function elencaWorkflow(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".js") || f.endsWith(".mjs"))
    .map((f) => f.replace(/\.(js|mjs)$/, ""))
    .sort();
}

/** Elenca le sottocartelle (una skill = una cartella con SKILL.md), o [] se `.claude/skills` non esiste. */
function elencaSkill(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => {
      try {
        return statSync(join(dir, f)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

async function main() {
  const quando = nowPiacenza();

  const workflowReali = elencaWorkflow(WORKFLOWS_DIR);
  const skillReali = elencaSkill(SKILLS_DIR);

  const comandi = leggiTesto("COMANDI.md");
  const claude = leggiTesto("CLAUDE.md");
  const doc = comandi + "\n" + claude;

  // 1) Workflow ORFANI: né il nome (`audit-pannello`) né il file (`audit-pannello.js`) compaiono nei doc.
  const workflowOrfani = workflowReali.filter(
    (n) => !doc.includes(n) && !doc.includes(`${n}.js`)
  );

  // 2) Skill orfane (best-effort: solo se la cartella skills esiste).
  const skillOrfane = skillReali.filter((n) => !doc.includes(n));

  // 3) Comandi rotti: riferimenti `.claude/workflows/NOME.js` nei doc che NON esistono sul disco.
  const riferiti = new Set();
  for (const m of doc.matchAll(/\.claude\/workflows\/([\w-]+)\.js/g)) riferiti.add(m[1]);
  const setReali = new Set(workflowReali);
  const comandiRotti = [...riferiti].filter((n) => !setReali.has(n)).sort();

  const driftTotale = workflowOrfani.length + skillOrfane.length + comandiRotti.length;

  await stampSegnale(
    "guardiano-capacita",
    driftTotale > 0 ? "warn" : "ok",
    `${workflowOrfani.length} workflow orfani · ${comandiRotti.length} comandi rotti · ${quando}`
  );

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          quando,
          n_workflow: workflowReali.length,
          n_skill: skillReali.length,
          workflow_orfani: workflowOrfani,
          skill_orfane: skillOrfane,
          comandi_rotti: comandiRotti,
          drift_totale: driftTotale,
        },
        null,
        2
      )
    );
  } else {
    console.log(`\n🧭 GUARDIANO CAPACITÀ (workflow ↔ comandi) — ${quando}\n`);
    console.log(`Workflow reali (.claude/workflows/*.js): ${workflowReali.length}`);
    if (skillReali.length) console.log(`Skill reali (.claude/skills/*):          ${skillReali.length}`);

    if (driftTotale === 0) {
      console.log(`\n✅ nessun drift: ogni capacità ha un comando, ogni comando punta a un workflow reale.`);
    } else {
      if (workflowOrfani.length) {
        console.log(`\n❌ ${workflowOrfani.length} WORKFLOW ORFANI (nessun comando in COMANDI.md/CLAUDE.md li evoca):`);
        for (const n of workflowOrfani) console.log(`  • ${n}  → aggiungi un comando in COMANDI.md`);
      }
      if (skillOrfane.length) {
        console.log(`\n⚠️  ${skillOrfane.length} skill non citate nei doc:`);
        for (const n of skillOrfane) console.log(`  • ${n}`);
      }
      if (comandiRotti.length) {
        console.log(`\n🔗 ${comandiRotti.length} COMANDI ROTTI (puntano a un workflow che non esiste più):`);
        for (const n of comandiRotti) console.log(`  • .claude/workflows/${n}.js`);
      }
    }
    console.log(`\nDrift totale: ${driftTotale}`);
  }

  process.exit(driftTotale > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERRORE guardiano-capacita:", e.message || e);
  await stampSegnale(
    "guardiano-capacita",
    "errore",
    `crash: ${(e.message || e).toString().slice(0, 200)}`
  );
  process.exit(1);
});
