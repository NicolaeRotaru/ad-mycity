#!/usr/bin/env node
// AR-027 — Guardiano "owner unico per keyword" (AR-008) sulle DESCRIPTION degli agenti.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge `.claude/agents/*.md`, estrae le
// keyword di instradamento dalle description (la stringa che il Task-router usa davvero) e
// FALLISCE se una keyword ha ≥2 owner SENZA un deferral esplicito ("→ ...").
//
// Perché (AR-027): la deconfliction "un mandato = un owner" vive nel roster di CLAUDE.md ma NON
// nelle description. Il router instrada sulle description, quindi keyword duplicate senza deferral
// (es. marketing↔crm-lifecycle, trust-safety↔dispute) creano doppioni invisibili. Questo check
// misura il drift a ogni giro, come agent-registry-check per il registro agenti.
//
// Uso:
//   node cervello/keyword-owner-check.mjs           -> report leggibile
//   node cervello/keyword-owner-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = nessun conflitto · 1 = keyword con ≥2 owner senza deferral (fa da gate nel giro)

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");

// Estrae il valore del campo `description:` dal frontmatter YAML di un mansionario.
function estraiDescription(testo) {
  const m = testo.match(/^---\s*[\r\n]([\s\S]*?)[\r\n]---/);
  const fm = m ? m[1] : testo;
  const d = fm.match(/description:\s*([\s\S]*?)(?:[\r\n]\w[\w-]*:\s|$)/);
  return d ? d[1].replace(/\s+/g, " ").trim() : "";
}

// Estrae le KEYWORD di instradamento (owning) da una description:
// - prende i frammenti dopo "Delega qui per" (o l'intera description come fallback);
// - RIMUOVE i blocchi-deferral tra parentesi che contengono la freccia "→" (quello è un rimando,
//   non una rivendicazione di ownership — AR-027);
// - normalizza e spezza su virgole/slash/virgolette.
function estraiKeyword(desc) {
  // 1. isola la parte "Delega qui per ..." se presente
  const idx = desc.toLowerCase().indexOf("delega qui per");
  let parte = idx >= 0 ? desc.slice(idx + "delega qui per".length) : desc;
  // 2. togli i blocchi-deferral "(→ ...)" e le frecce (sono rimandi, non ownership)
  parte = parte.replace(/\([^)]*→[^)]*\)/g, " ");
  // 3. tieni solo il contenuto tra virgolette se c'è (è l'elenco keyword del router)
  const q = parte.match(/[""«»"]([^""«»"]+)[""«»"]/g);
  if (q) parte = q.map((s) => s.replace(/[""«»"]/g, "")).join(" / ");
  // 4. spezza e normalizza
  return parte
    .split(/[\/,;]|\s-\s/)
    .map((k) => k.toLowerCase().replace(/[?!.]+/g, "").replace(/\s+/g, " ").trim())
    .filter((k) => k.length >= 4 && k.length <= 60 && /[a-zàèéìòù]/.test(k));
}

// Vero se la description contiene un deferral esplicito ("→ altro-agente") per quella keyword.
function haDeferral(desc, keyword) {
  // deferral generico presente nella description (blocco con freccia che cita la keyword)
  const blocchi = desc.match(/\([^)]*→[^)]*\)/g) || [];
  return blocchi.some((b) => b.toLowerCase().includes(keyword.split(" ")[0]));
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(AGENTS_DIR)) {
    const out = { ok: false, errore: "cartella agenti mancante", quando };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ .claude/agents/ non trovata");
    process.exit(1);
  }

  const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"));
  const mappa = new Map(); // keyword -> { owners:Set, deferrers:Set }

  for (const f of files) {
    const nome = f.replace(/\.md$/, "");
    const desc = estraiDescription(readFileSync(join(AGENTS_DIR, f), "utf8"));
    for (const kw of estraiKeyword(desc)) {
      if (!mappa.has(kw)) mappa.set(kw, { owners: new Set(), deferrers: new Set() });
      const rec = mappa.get(kw);
      if (haDeferral(desc, kw)) rec.deferrers.add(nome);
      else rec.owners.add(nome);
    }
  }

  // Conflitto = una keyword con ≥2 owner e NESSUN deferral che la disambigui.
  const conflitti = [];
  for (const [kw, rec] of mappa) {
    if (rec.owners.size >= 2 && rec.deferrers.size === 0) {
      conflitti.push({ keyword: kw, owners: [...rec.owners].sort() });
    }
  }
  conflitti.sort((a, b) => b.owners.length - a.owners.length || a.keyword.localeCompare(b.keyword));

  const out = {
    ok: conflitti.length === 0,
    quando,
    agenti: files.length,
    keyword_totali: mappa.size,
    conflitti,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (out.ok) {
    console.log(`✅ keyword-owner: nessun conflitto (${mappa.size} keyword, ${files.length} agenti) — ${quando}`);
  } else {
    console.log(`❌ keyword-owner: ${conflitti.length} keyword con ≥2 owner senza deferral — ${quando}`);
    for (const c of conflitti) console.log(`  · "${c.keyword}" → ${c.owners.join(", ")}`);
  }
  process.exit(out.ok ? 0 : 1);
}

main();
