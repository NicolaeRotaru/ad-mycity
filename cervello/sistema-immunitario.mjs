#!/usr/bin/env node
// Capacità #12 — IL SISTEMA IMMUNITARIO. Fa un passaggio di "red team" su sé stessa: legge il
// cantiere dei difetti reali, verifica che le difese di base siano in piedi (perimetro segreti,
// pre-commit, scanner) e riporta le falle ANCORA APERTE per gravità. È l'organo che tiene la
// macchina onesta con la propria sicurezza invece di scoprirla rotta troppo tardi.
//
// 🟢 Sola lettura: legge cantiere-difetti.json e controlla la presenza di file di difesa. NON
// modifica nulla, NON revoca chiavi, NON tocca il mondo (quelle restano 🔴, mani di Nicola).
//
// Uso:  node cervello/sistema-immunitario.mjs [--json]
// Exit: 0 = nessun bloccante di sicurezza aperto · 1 = c'è una falla bloccante aperta

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");

function difesa(rel, test, descr) {
  const p = join(AD_ROOT, rel);
  let ok = false;
  try {
    ok = test(existsSync(p) ? readFileSync(p, "utf8") : null);
  } catch {
    ok = false;
  }
  return { difesa: descr, file: rel, attiva: ok };
}

/** Verifica core.hooksPath=.githooks (non basta che esista il file hook). */
function difesaPreCommit() {
  const fileOk = existsSync(join(AD_ROOT, ".githooks/pre-commit"));
  let configOk = false;
  try {
    const v = execFileSync("git", ["config", "core.hooksPath"], { cwd: AD_ROOT, encoding: "utf8" }).trim();
    configOk = v === ".githooks" || v.endsWith("/.githooks");
  } catch {
    configOk = false;
  }
  return {
    difesa: "Pre-commit hook ATTIVO (core.hooksPath=.githooks → scan-segreti al commit)",
    file: ".githooks/pre-commit",
    attiva: fileOk && configOk,
  };
}

function main() {
  const quando = nowPiacenza();

  // --- 1. Le difese di base (controllo statico dei file reali) ---
  const difese = [
    difesa(".gitignore", (t) => !!t && /\.env\*|\*\.save/.test(t), "Il perimetro segreti copre .env* e *.save"),
    difesaPreCommit(),
    difesa("cervello/scan-segreti.mjs", (t) => t != null, "Scanner segreti presente"),
  ];
  const difeseGiu = difese.filter((d) => !d.attiva);

  // --- 2. Il cantiere dei difetti reali ---
  let difetti = [];
  if (existsSync(CANTIERE)) {
    try {
      difetti = JSON.parse(readFileSync(CANTIERE, "utf8")).difetti || [];
    } catch {
      difetti = [];
    }
  }
  const aperti = difetti.filter((d) => d.stato !== "chiuso");
  const bloccantiAperti = aperti.filter((d) => d.gravita === "bloccante");
  const perGravita = {};
  for (const d of aperti) perGravita[d.gravita || "?"] = (perGravita[d.gravita || "?"] || 0) + 1;

  const compromesso = bloccantiAperti.length > 0 || difeseGiu.length > 0;
  const out = {
    ok: !compromesso,
    quando,
    fonte: "cantiere-difetti.json + controllo statico dei file di difesa",
    difese,
    difese_giu: difeseGiu.map((d) => d.difesa),
    difetti_aperti_totali: aperti.length,
    per_gravita: perGravita,
    bloccanti_aperti: bloccantiAperti.map((d) => ({ id: d.id, titolo: d.titolo, colore: d.colore, stato: d.stato })),
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`🦠 Il Sistema Immunitario — ${quando}   (red team su sé stessa)\n`);
  console.log(`   Difese di base:`);
  for (const d of difese) console.log(`     ${d.attiva ? "✅" : "❌"} ${d.difesa}`);
  console.log(`\n   Difetti aperti nel cantiere: ${aperti.length}  (${Object.entries(perGravita).map(([k, v]) => `${k}: ${v}`).join(" · ") || "nessuno"})`);
  if (bloccantiAperti.length) {
    console.log(`   🔴 Bloccanti ANCORA aperti:`);
    for (const d of bloccantiAperti) console.log(`     • ${d.id} — ${d.titolo.slice(0, 90)}  [${d.stato}]`);
  }
  console.log("");
  if (compromesso) {
    console.log(`   🔴 SISTEMA ESPOSTO: ${bloccantiAperti.length} bloccante/i + ${difeseGiu.length} difesa/e giù.`);
    console.log(`      Le chiusure che toccano chiavi/produzione restano 🔴 (mani di Nicola).`);
  } else {
    console.log(`   ✅ Nessun bloccante di sicurezza aperto e difese di base in piedi.`);
  }
  process.exit(out.ok ? 0 : 1);
}

main();
