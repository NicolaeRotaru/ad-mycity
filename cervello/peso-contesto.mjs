#!/usr/bin/env node
// AR-199 — il costo del contesto diventa un numero sorvegliato.
//
// La causa-radice del difetto, alla quinta domanda: «la macchina ha un contratto sul CONTENUTO della
// memoria e nessuno sul suo COSTO — la dimensione del contesto non è di nessuno». `vault-sanita`
// controlla che i file siano leggibili, non che siano sostenibili.
//
// Questo guardiano misura i byte dei file VIVI — quelli che il giro ha l'ordine di leggere
// (`cervello/giro.md`) e che la Cabina spedisce al browser — e fallisce quando uno **cresce** oltre
// il tetto dichiarato in `cervello/peso-contesto.json`.
//
// Il tetto SCENDE, non si alza: è la stessa regola di `malattie.json`. Dopo una potatura
// (`node cervello/pota-memoria.mjs --applica`) si rigenera con `--aggiorna` e il nuovo livello, più
// basso, diventa il nuovo massimo. Alzarlo è una decisione visibile, non un effetto collaterale.
//
// 🟢 Sola lettura.
// Uso: node cervello/peso-contesto.mjs [--json] [--aggiorna]
// Exit (AR-322): 0 = sotto i tetti · 1 = un file è cresciuto · 2 = non ho potuto misurare.

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.PESO_REPO || join(QUI, "..");
const TETTI = process.env.PESO_TETTI || join(QUI, "peso-contesto.json");
const JSON_MODE = process.argv.includes("--json");
const AGGIORNA = process.argv.includes("--aggiorna");

/** Il verdetto, puro: quali file hanno superato il proprio tetto. */
export function sforamenti(misure = {}, tetti = {}) {
  const fuori = [];
  for (const [file, byte] of Object.entries(misure)) {
    const tetto = tetti[file];
    if (!Number.isFinite(tetto)) {
      fuori.push({ file, byte, tetto: null, motivo: "nessun tetto dichiarato: un file che entra nel contesto senza un massimo è la curva silenziosa che stiamo curando" });
      continue;
    }
    if (byte > tetto) fuori.push({ file, byte, tetto, motivo: `${(byte - tetto).toLocaleString("it-IT")} byte sopra il tetto` });
  }
  return fuori;
}

/** Contratto dei guardiani (AR-322): 0 · 1 · 2, e il cieco vince. */
export function codiceUscita({ cieco = 0, fuori = 0 } = {}) {
  if (cieco > 0) return 2;
  return fuori > 0 ? 1 : 0;
}

function main() {
  let tetti;
  try {
    tetti = JSON.parse(readFileSync(TETTI, "utf8"));
  } catch {
    console.error(`⛔ PESO-CONTESTO CIECO: non ho potuto leggere i tetti (${TETTI}) — non è un verde.`);
    process.exit(2);
  }

  const misure = {};
  const mancanti = [];
  for (const rel of Object.keys(tetti.tetti || {})) {
    const p = join(REPO, rel);
    if (!existsSync(p)) { mancanti.push(rel); continue; }
    misure[rel] = statSync(p).size;
  }
  if (!Object.keys(misure).length) {
    console.error("⛔ PESO-CONTESTO CIECO: nessun file misurabile.");
    process.exit(2);
  }

  if (AGGIORNA) {
    const nuovo = { ...tetti, aggiornato: new Date().toISOString().slice(0, 10), tetti: { ...tetti.tetti } };
    let scesi = 0;
    for (const [f, b] of Object.entries(misure)) {
      if (!Number.isFinite(nuovo.tetti[f]) || b < nuovo.tetti[f]) { nuovo.tetti[f] = b; scesi++; }
    }
    writeFileSync(TETTI, JSON.stringify(nuovo, null, 2) + "\n");
    console.log(`📉 Tetti aggiornati: ${scesi} scesi al peso attuale. (Il tetto scende, non si alza: i file cresciuti restano fuori.)`);
    process.exit(0);
  }

  const fuori = sforamenti(misure, tetti.tetti || {});
  const totale = Object.values(misure).reduce((a, b) => a + b, 0);
  const rc = codiceUscita({ fuori: fuori.length });

  if (JSON_MODE) {
    console.log(JSON.stringify({ misure, tetti: tetti.tetti, fuori, totale, mancanti }, null, 2));
  } else {
    console.log(`\n⚖️  PESO DEL CONTESTO — ${Math.round(totale / 1024)} KB nei file che il giro rilegge a ogni passata`);
    for (const [f, b] of Object.entries(misure).sort((a, b) => b[1] - a[1])) {
      const t = (tetti.tetti || {})[f];
      const segno = !Number.isFinite(t) ? "❓" : b > t ? "⛔" : "✅";
      console.log(`   ${segno} ${f.replace("MyCity-Vault/90-Memoria-AI/", "")}: ${b.toLocaleString("it-IT")} B${Number.isFinite(t) ? ` (tetto ${t.toLocaleString("it-IT")})` : " — senza tetto"}`);
    }
    if (mancanti.length) console.log(`   ⚠️  dichiarati ma assenti: ${mancanti.join(", ")}`);
    if (fuori.length) {
      console.log(`\n   ⛔ ${fuori.length} sopra il tetto:`);
      for (const f of fuori) console.log(`   • ${f.file}: ${f.motivo}`);
      console.log(`\n   Pota: node cervello/pota-memoria.mjs --applica · poi node cervello/peso-contesto.mjs --aggiorna`);
    }
  }
  process.exit(rc);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
