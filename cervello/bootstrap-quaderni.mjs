#!/usr/bin/env node
// Bootstrap quaderni memoria-squadra mancanti per ogni agente in .claude/agents/.
// 🟢 Crea solo stub vuoti (placeholder) — non inventa ESITI.
//
// Uso: node cervello/bootstrap-quaderni.mjs [--dry-run]

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const DRY = process.argv.includes("--dry-run");
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");
const SQUADRA_DIR = join(AD_ROOT, "memoria-squadra");

const agenti = readdirSync(AGENTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => basename(f, ".md"))
  .sort();

let creati = 0;
for (const nome of agenti) {
  const path = join(SQUADRA_DIR, `${nome}.md`);
  if (existsSync(path)) continue;
  const testo = `---
tipo: quaderno-memoria
reparto: ${nome}
bootstrap: ${nowPiacenza()}
---

# 🧠 Quaderno di ${nome}
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro 🟡/🔴.
> Formato: AAAA-MM-GG · contesto · scorecard 6 assi · atteso→reale · #tag

## Esiti
- (ancora vuoto — il primo ESITO si registra con: node cervello/chiusura-loop.mjs registra ${nome} "…" "…" "…" "…")
`;
  if (!DRY) {
    mkdirSync(SQUADRA_DIR, { recursive: true });
    writeFileSync(path, testo, "utf8");
  }
  creati++;
  console.log(`${DRY ? "[dry-run] " : ""}+ quaderno @${nome}`);
}

console.log(`\n✅ ${creati} quaderni ${DRY ? "da creare" : "creati"} (${agenti.length - creati} già esistenti).`);
