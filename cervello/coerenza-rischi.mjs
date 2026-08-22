#!/usr/bin/env node
// coerenza-rischi.mjs — una casa sola per i rischi (gemello di coerenza-fatti, AR-102 esteso).
//
// CANONICO: MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json (N/B, owner, sentinelle).
// PUNTATORE: MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-rischi.json (RSK legacy → citare il canonico).
//
// Uso:
//   node cervello/coerenza-rischi.mjs           -> controlla (exit 0 ok · 1 divergenze)
//   node cervello/coerenza-rischi.mjs --json

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nowPiacenza, stampSegnale } from "./git-github.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = join(QUI, "..");
// Sovrascrivibili SOLO per PROVARE il guardiano su un registro finto (stessa ragione di
// AZIONI_CODA_FILE e SENSORI_CECITA_FILE): un buco va DIMOSTRATO facendolo accadere, e non si può
// farlo accadere sul registro vero. Non allargano niente — la casa canonica resta questa.
const CANONICO = process.env.REGISTRO_RISCHI_FILE || join(ROOT, "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json");
const PUNTATORE = process.env.REGISTRO_RISCHI_PUNTATORE || join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-rischi.json");
const REPORT = process.env.REGISTRO_RISCHI_REPORT || join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-rischi.json");

const JSON_MODE = process.argv.includes("--json");

function leggiJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

/**
 * I rischi che hanno un proprietario e nessuna condizione che lo svegli (AR-148).
 *
 * Pura, esportata e senza I/O: la prova la esegue sui dati invece di cercare una parola in un file —
 * che è esattamente il modo in cui AR-015 si era chiuso senza essere vero.
 *
 * Un rischio ARCHIVIATO o CHIUSO non chiede più niente a nessuno: sarebbe un rosso che non si può
 * togliere, e un guardiano sempre rosso viene spento entro la settimana.
 */
export function rischiSenzaSentinella(rischi = []) {
  return (rischi || []).filter((r) => {
    if (!r || !r.id) return false;
    if (r.stato === "archiviato" || r.stato === "chiuso") return false;
    if (!String(r.owner || "").trim()) return false; // senza owner lo denuncia già l'altro controllo
    return !String(r.sentinella || "").trim();
  });
}

function check() {
  const problemi = [];
  const canonico = leggiJson(CANONICO, null);
  const puntatore = leggiJson(PUNTATORE, null);

  if (!canonico || !Array.isArray(canonico.rischi)) {
    problemi.push({ tipo: "canonico_assente", dettaglio: "REGISTRO-RISCHI.json mancante o senza rischi[]" });
  }

  if (!puntatore) {
    problemi.push({ tipo: "puntatore_assente", dettaglio: "auto-coscienza/registro-rischi.json assente" });
  } else if (!puntatore._canonico && !puntatore._puntatore) {
    problemi.push({
      tipo: "puntatore_mancante",
      dettaglio: "registro-rischi auto-coscienza non dichiara _canonico verso 05-Soldi-Rischi/REGISTRO-RISCHI.json",
    });
  }

  const rischiCanonici = (canonico?.rischi || []).filter((r) => r.id);
  const altaSenzaOwner = rischiCanonici.filter(
    (r) => (r.gravita === "alta" || r.gravita === "media-alta") && !(r.owner || "").trim()
  );
  if (altaSenzaOwner.length) {
    problemi.push({
      tipo: "alta_senza_owner",
      dettaglio: `${altaSenzaOwner.length} rischi ALTA senza owner nel registro canonico`,
      ids: altaSenzaOwner.map((r) => r.id),
    });
  }

  // AR-148 — IL BUCO CHE HA CHIUSO AR-015 A VUOTO.
  //
  // AR-015 («registro rischi») fu dichiarato chiuso 14 su 14 verificando che il FILE esistesse, non
  // che ogni riga avesse la sua condizione osservabile. Misurato il 22/8, cioè sette settimane dopo:
  // 14 rischi, 14 con owner, e SEI con la sentinella vuota — N2 (KYC/AML), N4 (inquadramento rider),
  // N5 (IVA), N6 (alcolici), N7 (allergeni), B5 (stagionalità). Cinque su sei normativi.
  //
  // Un rischio con un proprietario e senza sentinella è un rischio che nessuno vedrà arrivare: c'è
  // scritto CHI risponde, non COSA deve far scattare la risposta. E la completezza semantica non la
  // guardava nessuno, perché il guardiano controllava che il registro avesse una casa sola — non che
  // le sue righe dicessero qualcosa.
  const senzaSentinella = rischiSenzaSentinella(rischiCanonici);
  if (senzaSentinella.length) {
    problemi.push({
      tipo: "senza_sentinella",
      dettaglio: `${senzaSentinella.length} rischi con owner e senza sentinella: c'è scritto chi risponde, non cosa deve far scattare la risposta`,
      ids: senzaSentinella.map((r) => r.id),
    });
  }

  const rskAttivi = (puntatore?.rischi || []).filter((r) => r.stato !== "archiviato" && r.stato !== "chiuso");
  if (rskAttivi.length && !puntatore?._canonico) {
    problemi.push({
      tipo: "doppio_registro",
      dettaglio: `${rskAttivi.length} rischi RSK ancora attivi nel puntatore senza delega al canonico`,
      ids: rskAttivi.map((r) => r.id),
    });
  }

  const ok = problemi.length === 0;
  const report = {
    aggiornato: nowPiacenza(),
    ok,
    canonico: "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json",
    puntatore: "MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-rischi.json",
    n_rischi_canonico: rischiCanonici.length,
    problemi,
  };

  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

  return report;
}

async function main() {
  const report = check();
  await stampSegnale(
    "coerenza-rischi",
    report.ok ? "ok" : "warn",
    report.ok
      ? `${report.n_rischi_canonico} rischi · canonico ok`
      : `${report.problemi.length} divergenze registro-rischi`
  );

  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n🛡️ COERENZA RISCHI — ${report.aggiornato}\n`);
    console.log(`Canonico: ${report.canonico} (${report.n_rischi_canonico} rischi)`);
    if (report.ok) {
      console.log("✅ Registro rischi coerente (una casa sola).");
    } else {
      for (const p of report.problemi) {
        console.log(`❌ ${p.tipo}: ${p.dettaglio}`);
      }
    }
  }

  process.exit(report.ok ? 0 : 1);
}

// La guardia sul main: senza, importare questo file per una funzione pura ne ESEGUE il programma —
// scrive il report, manda il segnale e chiama process.exit. È la malattia censita
// «programma-che-parte-importando», e qui impediva a una prova di eseguire `rischiSenzaSentinella`
// senza far girare tutto il guardiano.
if (import.meta.url === `file://${process.argv[1]}`) {
main().catch(async (e) => {
  console.error("ERRORE coerenza-rischi:", e.message || e);
  await stampSegnale("coerenza-rischi", "errore", (e.message || e).toString().slice(0, 160));
  process.exit(1);
});
}
