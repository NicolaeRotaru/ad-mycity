#!/usr/bin/env node
// AR-043 — Validatore di CONTRATTO dei file auto-coscienza/*.json.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Verifica che i JSON di memoria-macchina
// rispettino lo schema canonico ("una sola verità" dei campi) e FALLISCE se un file ha campi
// fuori contratto o manca un campo obbligatorio.
//
// Perché (AR-043): il contratto viveva come prosa in un .md, non come schema eseguibile. Così
// auto-analisi.json poteva scrivere `supabase_marketplace/supabase_memoria` mentre il Pannello
// legge `salute_macchina.supabase` / `.stripe` → i due tile restavano sempre spenti. Questo
// validatore rende il contratto CODICE, cablabile in giro.sh come gate prima del commit.
//
// Uso:
//   node cervello/valida-contratti.mjs           -> report leggibile
//   node cervello/valida-contratti.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = tutti i file conformi · 1 = almeno una violazione di contratto

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const DIR = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");

// CONTRATTO: per ogni file, i campi obbligatori e i campi VIETATI (alias non canonici).
// `salute` descrive lo schema canonico del blocco salute_macchina letto dal Pannello.
const CONTRATTO = {
  "auto-analisi.json": {
    obbligatori: ["data"],
    // il blocco salute_macchina, se presente, deve usare i nomi canonici del Pannello
    salute_macchina: {
      canonici: ["supabase", "stripe", "dati_freschi", "sensori_attivi"],
      vietati: ["supabase_marketplace", "supabase_memoria"], // AR-043: alias che spengono i tile
    },
  },
  "storico-salute.json": { obbligatori: ["serie"] },
  "cantiere-difetti.json": { obbligatori: [] },
};

function valida(nomeFile, dati, regola) {
  const problemi = [];
  for (const req of regola.obbligatori || []) {
    if (!(req in dati)) problemi.push(`campo obbligatorio mancante: "${req}"`);
  }
  if (regola.salute_macchina && dati.salute_macchina && typeof dati.salute_macchina === "object") {
    const sm = dati.salute_macchina;
    for (const vietato of regola.salute_macchina.vietati) {
      if (vietato in sm)
        problemi.push(`salute_macchina."${vietato}" è un alias non canonico (usa "supabase"/"stripe")`);
    }
    const chiaviCanoniche = regola.salute_macchina.canonici;
    for (const k of Object.keys(sm)) {
      if (!chiaviCanoniche.includes(k))
        problemi.push(`salute_macchina."${k}" fuori contratto (ammessi: ${chiaviCanoniche.join(", ")})`);
    }
  }
  return problemi;
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(DIR)) {
    const out = { ok: false, quando, errore: "cartella auto-coscienza mancante" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ auto-coscienza/ non trovata");
    process.exit(1);
  }

  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const violazioni = [];
  for (const f of files) {
    const regola = CONTRATTO[f];
    if (!regola) continue; // file senza contratto dichiarato: non lo giudichiamo (minimale)
    let dati;
    try {
      dati = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    } catch (e) {
      violazioni.push({ file: f, problemi: [`JSON non parsabile: ${String(e.message || e)}`] });
      continue;
    }
    const problemi = valida(f, dati, regola);
    if (problemi.length) violazioni.push({ file: f, problemi });
  }

  const out = {
    ok: violazioni.length === 0,
    quando,
    file_controllati: files.filter((f) => CONTRATTO[f]).length,
    violazioni,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (out.ok) {
    console.log(`✅ contratti: ${out.file_controllati} file auto-coscienza conformi — ${quando}`);
  } else {
    console.log(`❌ contratti: ${violazioni.length} file fuori contratto — ${quando}`);
    for (const v of violazioni) {
      console.log(`  · ${v.file}`);
      for (const p of v.problemi) console.log(`      - ${p}`);
    }
  }
  process.exit(out.ok ? 0 : 1);
}

main();
