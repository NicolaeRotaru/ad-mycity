#!/usr/bin/env node
// Capacità #4 — LA MACCHINA DEL TEMPO. Ricostruisce la GIORNATA della macchina: mette in fila,
// nel tempo, i giri (briefing) e le decisioni con il loro "perché" e la fonte da cui vengono. È la
// "macchina di vetro" portata al massimo — ogni mossa risalibile fino al file che l'ha generata.
//
// 🟢 Sola lettura: legge i briefing in 90-Memoria-AI/Briefing/ e il registro DECISIONI.md.
// NON scrive, NON tocca il mondo. Nessun numero inventato: elenca solo ciò che è scritto.
//
// Uso:
//   node cervello/macchina-del-tempo.mjs                 -> la giornata di oggi (o l'ultima con tracce)
//   node cervello/macchina-del-tempo.mjs --data 2026-07-03
//   node cervello/macchina-del-tempo.mjs --json
// Exit: 0 sempre (è un visore); 1 solo se le fonti mancano del tutto.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const iData = process.argv.indexOf("--data");
const DATA_ARG = iData >= 0 ? process.argv[iData + 1] : null;

const BRIEF_DIR = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/Briefing");
const DECISIONI = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/DECISIONI.md");

function primoTitolo(testo) {
  for (const l of testo.split("\n")) {
    const m = l.match(/^#\s+(.*)/);
    if (m) return m[1].replace(/[#*]/g, "").trim();
  }
  const t = testo.match(/titolo:\s*(.*)/);
  return t ? t[1].trim() : "(senza titolo)";
}

function raccogliBriefing() {
  if (!existsSync(BRIEF_DIR)) return [];
  const out = [];
  for (const f of readdirSync(BRIEF_DIR)) {
    if (!f.endsWith(".md")) continue;
    const m = f.match(/(\d{4}-\d{2}-\d{2})/);
    if (!m) continue;
    const testo = readFileSync(join(BRIEF_DIR, f), "utf8");
    const ora = (testo.match(/data:\s*\d{4}-\d{2}-\d{2}[ T](\d{2}:\d{2})/) || [])[1] || "";
    out.push({ tipo: "giro", data: m[1], ora, cosa: primoTitolo(testo), fonte: `Briefing/${f}` });
  }
  return out;
}

function raccogliDecisioni() {
  if (!existsSync(DECISIONI)) return [];
  const out = [];
  for (const line of readFileSync(DECISIONI, "utf8").split("\n")) {
    const m = line.match(/^-\s*(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})\s*·\s*(\S+)\s*·\s*(\[[^\]]*\])?\s*·?\s*(.*)/);
    if (!m) continue;
    const cosa = (m[5] || "").split(" · ")[0].replace(/\*/g, "").trim();
    out.push({ tipo: "decisione", data: m[1], ora: m[2], colore: m[3], reparto: (m[4] || "").replace(/[\[\]]/g, ""), cosa, fonte: "DECISIONI.md" });
  }
  return out;
}

function main() {
  const quando = nowPiacenza();
  const eventi = [...raccogliBriefing(), ...raccogliDecisioni()];
  if (!eventi.length) {
    const out = { ok: false, quando, errore: "nessuna fonte (Briefing/ e DECISIONI.md vuoti o assenti)" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ nessuna traccia da ricostruire");
    process.exit(1);
  }

  const oggi = quando.slice(0, 10);
  const date = [...new Set(eventi.map((e) => e.data))].sort();
  let target = DATA_ARG || oggi;
  if (!eventi.some((e) => e.data === target)) target = date[date.length - 1]; // fallback: ultimo giorno con tracce

  const giorno = eventi
    .filter((e) => e.data === target)
    .sort((a, b) => (a.ora || "").localeCompare(b.ora || ""));

  const out = {
    ok: true,
    quando,
    fonte: "Briefing/*.md + DECISIONI.md",
    giorno_ricostruito: target,
    giorni_disponibili: date,
    eventi: giorno,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  }

  console.log(`⏪ La Macchina del Tempo — replay del ${target}   (${giorno.length} tracce)\n`);
  for (const e of giorno) {
    if (e.tipo === "giro") {
      console.log(`   ${(e.ora || "  ").padEnd(5)} 🔭 GIRO   ${e.cosa}`);
    } else {
      console.log(`   ${(e.ora || "  ").padEnd(5)} ${e.colore} DECIDE ${e.reparto} — ${e.cosa.slice(0, 90)}`);
    }
    console.log(`         └ fonte: ${e.fonte}`);
  }
  console.log(`\n   Giorni ricostruibili: ${date[0]} → ${date[date.length - 1]} (${date.length}).`);
  console.log(`   Rivedi un altro giorno:  node cervello/macchina-del-tempo.mjs --data AAAA-MM-GG`);
  process.exit(0);
}

main();
