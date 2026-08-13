#!/usr/bin/env node
// 🧠 CORREZIONE-NICOLA-GATE — trasforma in un numero verificabile l'errore-tipo più ripetuto della
// memoria: una correzione di Nicola che genera una lezione ma MAI un freno automatico (`gate`).
//
// IL PROBLEMA CHE RISOLVE (AR-apprendimento, vincolo HARD del giro 2026-08-12): l'area `correzione-nicola`
// ha ~26 lezioni, ~18 ripetizioni dello stesso tipo di errore, e nessuna era mai diventata un gate — solo
// la promessa di "farci più attenzione". Il sotto-caso `.claude/settings.json` ha già un freno vero
// (AR-533, `mano-fermata.mjs`), ma copre un solo sintomo: non esisteva un conteggio automatico di QUANTE
// correzioni di Nicola restano senza un freno proprio. Questo script lo rende un numero che il giro non
// può ignorare — stesso schema di apprendimento-guardiano.mjs.
//
// COSA MISURA (sola lettura di apprendimento.json):
//   conta le lezioni (in "lezioni" e in "principi") con tag "correzione-nicola" (o fonte "correzione di
//   Nicola") che NON hanno un campo "gate" (o non lo referenziano nel testo/regola). Confronta col giro
//   precedente (registro in questo stesso file, campo `_storia`): se il numero di lezioni-senza-gate CRESCE
//   rispetto all'ultima misurazione, o resta sopra SOGLIA senza che nessuna sia stata chiusa, esce rc=1.
//
// USO:
//   node cervello/correzione-nicola-gate.mjs          -> report + exit code (0 sano, 1 da sistemare)
//   node cervello/correzione-nicola-gate.mjs --json    -> JSON macchina
//
// Non scrive apprendimento.json. Scrive solo il proprio report in
// auto-coscienza/correzione-nicola-gate.json (storia delle misurazioni, per vedere se il numero scende).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = resolve(QUI, "..");
const APPRENDIMENTO = join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
const REPORT = join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/correzione-nicola-gate.json");

const SOGLIA_SENZA_GATE = 20; // punto di partenza 2026-08-12: 26 lezioni tag correzione-nicola, ~24 senza gate

function leggiJSON(percorso, fallback) {
  if (!existsSync(percorso)) return fallback;
  try {
    return JSON.parse(readFileSync(percorso, "utf8"));
  } catch {
    return fallback;
  }
}

function haGate(lezione) {
  if (lezione.gate && String(lezione.gate).trim()) return true;
  // un principio può portare il freno nel testo (riferimento esplicito a uno script/test)
  const testo = `${lezione.testo || ""} ${lezione.regola || ""}`;
  return /cervello\/[\w.-]+\.(mjs|sh)|test\/[\w.-]+\.test\.mjs/.test(testo);
}

function etaggataCorrezioneNicola(lezione) {
  const tag = Array.isArray(lezione.tag) ? lezione.tag : [];
  if (tag.includes("correzione-nicola")) return true;
  if (lezione.caso_studio_nicola === true) return true;
  if (String(lezione.fonte || "").toLowerCase().includes("correzione di nicola")) return true;
  return false;
}

// `dati`/`storiaPrecedente` iniettabili: è quello che permette al test di provare il calcolo su un
// caso finto (0 lezioni, N lezioni tutte senza gate, un peggioramento rispetto al giro prima) senza
// dover sporcare apprendimento.json o correzione-nicola-gate.json veri — stessa ragione per cui
// scadenzario-check.mjs accetta un registro iniettato.
function calcola(datiIn, storiaPrecedenteIn) {
  const dati = datiIn !== undefined ? datiIn : leggiJSON(APPRENDIMENTO, null);
  if (!dati) {
    return { errore: "apprendimento.json non leggibile o assente" };
  }

  const lezioni = Array.isArray(dati.lezioni) ? dati.lezioni : [];
  const principi = Array.isArray(dati.principi) ? dati.principi : [];
  const tutte = [...lezioni, ...principi];

  const taggate = tutte.filter(etaggataCorrezioneNicola);
  const senzaGate = taggate.filter((l) => !haGate(l));

  const storiaPrecedente = storiaPrecedenteIn !== undefined ? storiaPrecedenteIn : leggiJSON(REPORT, { storia: [] });
  const ultimaMisurazione = (storiaPrecedente.storia || []).slice(-1)[0] || null;

  const peggiorato = ultimaMisurazione ? senzaGate.length > ultimaMisurazione.senza_gate : false;
  const sopraSoglia = senzaGate.length > SOGLIA_SENZA_GATE;
  const sano = !peggiorato && !sopraSoglia;

  const risultato = {
    quando: new Date().toISOString().slice(0, 16).replace("T", " "),
    totale_taggate: taggate.length,
    senza_gate: senzaGate.length,
    con_gate: taggate.length - senzaGate.length,
    soglia: SOGLIA_SENZA_GATE,
    peggiorato_dal_giro_precedente: peggiorato,
    sano,
    esempi_senza_gate: senzaGate.slice(0, 5).map((l) => l.id || (l.testo || "").slice(0, 60)),
  };

  const nuovaStoria = { storia: [...(storiaPrecedente.storia || []).slice(-19), risultato] };
  return { risultato, nuovaStoria };
}

function main() {
  const esito = calcola();
  if (esito.errore) {
    console.error(`⛔ correzione-nicola-gate: ${esito.errore}`);
    process.exit(1);
    return;
  }
  const { risultato, nuovaStoria } = esito;
  writeFileSync(REPORT, JSON.stringify(nuovaStoria, null, 1));

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(risultato, null, 1));
  } else {
    console.log(`🧠 correzione-nicola-gate: ${risultato.totale_taggate} lezioni tag correzione-nicola · ${risultato.senza_gate} senza gate (soglia ${risultato.soglia}) · ${risultato.sano ? "✅ sano" : "⛔ da sistemare"}`);
    if (!risultato.sano) {
      console.log("Esempi senza gate:", risultato.esempi_senza_gate.join(" · "));
    }
  }

  process.exit(risultato.sano ? 0 : 1);
}

export { calcola, haGate, etaggataCorrezioneNicola, SOGLIA_SENZA_GATE };

if (import.meta.url === `file://${process.argv[1]}`) main();
