#!/usr/bin/env node
// Guardiano AR-103: ogni prospect `scelta_ragionata` documentato in consegne/vendite
// DEVE comparire in registro-realta.json — altrimenti il Pannello mostra una lista incompleta.
// 🟢 Sola lettura. Exit 0 = ok · 1 = mancano entità nel registro.
//
// Uso: node cervello/registro-scelte-check.mjs [--json]

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");

/** Dossier/scout che dichiarano prospect scelta_ragionata — estrazione deterministica. */
const FONTI_VENDITE = [
  {
    rel: "consegne/vendite/2026-07-06-dossier-6-botteghe-visita-13-7.md",
    estrai: (txt) => [...txt.matchAll(/^# \d+\.[^#\n]*?—\s*(.+?)\s*—/gm)].map((m) => m[1].trim()),
  },
  {
    rel: "consegne/vendite/2026-07-06-scout-negozi-categorie-mancanti.md",
    estrai: (txt) => [...txt.matchAll(/^### [^—\n]+—\s*\*\*(.+?)\*\*/gm)].map((m) => m[1].trim()),
  },
];

function leggiJson(rel) {
  const p = join(AD_ROOT, rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Normalizza per confronto: minuscolo, spazi collassati, senza punteggiatura finale. */
function norm(n) {
  return String(n || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function titoloDaMaiuscolo(s) {
  return s
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

/** Cerca altri .md in consegne/vendite con gate_AR006 / scelta_ragionata nel frontmatter. */
function fontiDinamicheVendite() {
  const dir = join(AD_ROOT, "consegne/vendite");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const rel = `consegne/vendite/${f}`;
    if (FONTI_VENDITE.some((x) => x.rel === rel)) continue;
    const txt = readFileSync(join(AD_ROOT, rel), "utf8");
    const head = txt.slice(0, 800);
    if (!/gate_AR006|scelta_ragionata/i.test(head)) continue;
    out.push({
      rel,
      estrai: (body) => {
        const names = new Set();
        for (const m of body.matchAll(/^## 🎴 \d+ — (.+?) ·/gm)) {
          names.add(titoloDaMaiuscolo(m[1].trim()));
        }
        return [...names];
      },
    });
  }
  return out;
}

function main() {
  const registro = leggiJson("MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json");
  if (!registro?.entita) {
    const msg = "registro-realta.json mancante o senza entità.";
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: msg }));
    else console.error(`❌ ${msg}`);
    process.exit(1);
  }

  const inRegistro = new Set(
    registro.entita
      .filter((e) => e.stato === "scelta_ragionata")
      .map((e) => norm(e.nome)),
  );

  const attese = [];
  const mancanti = [];
  const fonti = [...FONTI_VENDITE, ...fontiDinamicheVendite()];

  for (const fonte of fonti) {
    const p = join(AD_ROOT, fonte.rel);
    if (!existsSync(p)) continue;
    const txt = readFileSync(p, "utf8");
    for (const nome of fonte.estrai(txt)) {
      if (!nome) continue;
      attese.push({ nome, fonte: fonte.rel });
      if (!inRegistro.has(norm(nome))) mancanti.push({ nome, fonte: fonte.rel });
    }
  }

  const ok = mancanti.length === 0;
  const report = {
    ok,
    ora: nowPiacenza(),
    attese: attese.length,
    in_registro_scelte: inRegistro.size,
    mancanti,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n🧠 Registro scelte ragionate (AR-103) — ${report.ora}`);
    console.log(`   Prospect attesi da dossier vendite: ${report.attese}`);
    console.log(`   Voci scelta_ragionata nel registro: ${report.in_registro_scelte}`);
    if (ok) {
      console.log("   ✅ Tutte le scelte documentate sono nel registro-realta.json");
    } else {
      console.log(`   ❌ MANCANO ${mancanti.length} entità nel registro:`);
      for (const m of mancanti) console.log(`      · ${m.nome} (da ${m.fonte})`);
      console.log(
        "\n→ Aggiorna MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json nello STESSO giro in cui produci/aggiorni un dossier scelta_ragionata.",
      );
    }
  }

  process.exit(ok ? 0 : 1);
}

main();
