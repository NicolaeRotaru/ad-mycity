#!/usr/bin/env node
// Capacità #30 — IL METABOLISMO. Misura quanto CONSUMA la macchina (token/durata AI per tipo di
// lavoro e per modello) leggendo il consumo reale in auto-coscienza/costo-ai.json, e dice se il
// budget del giorno è largo o sotto pressione. È l'organo che trasforma la quota da vincolo a leva:
// mostra dove va la spesa così si può affamare ciò che costa senza rendere.
//
// 🟢 Sola lettura: legge costo-ai.json (scritto dai giri), NON scrive, NON tocca il mondo.
// Onestà: il token per-run non è sempre misurato (spesso null) → sommo ciò che c'è e uso anche la
// DURATA come proxy, dichiarando la copertura. Nessun numero inventato.
//
// Uso:  node cervello/metabolismo.mjs [--json]
// Exit: 0 = sotto la soglia giornaliera · 1 = soglia superata (o file assente)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const FILE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/costo-ai.json");

function aggrega(voci, chiave) {
  const map = {};
  for (const v of voci) {
    const k = v[chiave] || "?";
    map[k] = map[k] || { runs: 0, token: 0, durata_sec: 0 };
    map[k].runs++;
    map[k].token += v.token || 0;
    map[k].durata_sec += v.durata_sec || 0;
  }
  return Object.entries(map)
    .map(([k, v]) => ({ voce: k, ...v }))
    .sort((a, b) => b.durata_sec - a.durata_sec);
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(FILE)) {
    const out = { ok: false, quando, errore: "costo-ai.json non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ costo-ai.json non trovato");
    process.exit(1);
  }
  const j = JSON.parse(readFileSync(FILE, "utf8"));
  const oggi = j.oggi || { voci: [], runs: 0, token_totali: 0, durata_sec_totale: 0 };
  const voci = oggi.voci || [];
  const soglia = j.soglia_giornaliera_token || 0;

  const perTipo = aggrega(voci, "tipo");
  const perModello = aggrega(voci, "modello");
  const conToken = voci.filter((v) => typeof v.token === "number").length;
  const coperturaToken = voci.length ? Math.round((conToken / voci.length) * 100) : 0;
  const topConsumo = perTipo[0] || null;
  const pctSoglia = soglia ? +((oggi.token_totali / soglia) * 100).toFixed(3) : null;
  const sopraSoglia = soglia ? oggi.token_totali > soglia : false;

  const out = {
    ok: !sopraSoglia,
    quando,
    fonte: "auto-coscienza/costo-ai.json (consumo reale dei giri)",
    oggi: {
      data: oggi.data,
      runs: oggi.runs,
      token_totali: oggi.token_totali,
      durata_sec_totale: oggi.durata_sec_totale,
      soglia_token: soglia,
      pct_soglia: pctSoglia,
      copertura_token_pct: coperturaToken,
    },
    per_organo: perTipo,
    per_modello: perModello,
    top_consumo: topConsumo,
    sopra_soglia: sopraSoglia,
    storico_giorni: j.storico_giorni || [],
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`🪙 Il Metabolismo — ${quando}   (consumo reale della macchina)\n`);
  console.log(`   Oggi (${oggi.data}): ${oggi.runs} run · ${oggi.token_totali} token · ${oggi.durata_sec_totale}s`);
  if (pctSoglia != null) console.log(`   Budget giornaliero: ${oggi.token_totali}/${soglia} token = ${pctSoglia}% della soglia`);
  console.log(`   Copertura misura token: ${coperturaToken}% dei run (il resto misurato solo a durata)\n`);
  console.log(`   Consumo per organo (tipo di lavoro), dal più pesante:`);
  for (const t of perTipo) console.log(`     • ${t.voce.padEnd(18)} ${t.runs} run · ${t.token} token · ${t.durata_sec}s`);
  console.log(`   Consumo per modello:`);
  for (const m of perModello) console.log(`     • ${m.voce.padEnd(18)} ${m.runs} run · ${m.token} token · ${m.durata_sec}s`);
  console.log("");
  if (sopraSoglia) console.log(`   🔴 SOPRA SOGLIA: taglia il volume (mai verità e sicurezza).`);
  else console.log(`   ✅ Budget largo oggi (${pctSoglia}% della soglia): margine per lavorare.`);
  if (topConsumo) console.log(`   👉 L'organo più costoso oggi: "${topConsumo.voce}" (${topConsumo.durata_sec}s su ${oggi.durata_sec_totale}s).`);
  process.exit(out.ok ? 0 : 1);
}

main();
