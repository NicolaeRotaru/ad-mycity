#!/usr/bin/env node
// 🏷️ UNO STATO CHE NESSUN MISURATORE CAPISCE — AR-844.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// In questa casa ci sono DUE registri di difetti e DUE vocabolari:
//   · il cantiere della MACCHINA (`cantiere-difetti.json`) — dove l'unico stato chiuso è `chiuso`,
//     e lo usano tutti: tasso di chiusura, cancello del lotto, auto-fix, guardiano delle prove;
//   · il registro dei difetti del SITO (`radiografia-marketplace.json`) — dove
//     `radiografia-marketplace-conti.mjs` dichiara `STATI_CHIUSI = ["chiuso", "riparato",
//     "gia_riparato_prima"]`.
//
// Le due parole si somigliano e vivono a due cartelle di distanza. Il 27/8 ne ho trovate **18** nel
// cantiere della macchina messe in stato `riparato`: riparate davvero, con la prova che gira e passa,
// e contate APERTE da ogni misuratore — per sempre, perché nessuno di loro sa cosa voglia dire quella
// parola. Il guardiano delle prove le VEDEVA («18 schede in uno stato che non so nominare») e usciva
// 0 lo stesso: un rilevatore che riporta e non ferma niente.
//
// Il danno non è il conteggio: è che una scheda riparata resta in una lista che qualcuno un giorno
// riaprirà per «finire il lavoro», su un lavoro già finito. E dall'altro lato il tasso di chiusura —
// il voto che la macchina si dà — resta più basso del vero, quindi la macchina si frena da sola.
//
// ─────────────────────────────────────────────────────────────────────────────
// COSA FA, E COSA **NON** FA
// ─────────────────────────────────────────────────────────────────────────────
// Non conta niente per conto suo: chiede a `stati-cantiere.mjs`, che è la casa unica del conteggio.
// Qui c'è solo il FRENO che mancava, col tetto a **zero** — non c'è debito da smaltire, c'è una
// porta da tenere chiusa.
//
// NON dice se lo stato è quello GIUSTO per quella scheda. Dice solo che è una parola che i
// misuratori sanno leggere. Una scheda messa `chiuso` senza fix resta un problema di un altro
// guardiano (`prove-oneste`, `non-vacuita`), non di questo.
//
// 🟢 Sola lettura.
//
// Prova: node cervello/test/uno-stato-che-nessuno-capisce.test.mjs

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contaDifetti } from "./stati-cantiere.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..");

/**
 * IL VERDETTO. 0 sotto il tetto · 1 sopra · 2 quando non ho potuto contare — e il 2 non è un verde,
 * è la stessa regola che questo file esiste per far rispettare agli altri.
 */
export function verdettoStati({ conto = null, tetto = null } = {}) {
  if (!conto || conto.letto === false || !Array.isArray(conto.stati_ignoti)) {
    return { rc: 2, quanti: null, detto: `non ho potuto contare gli stati del cantiere: ${conto?.motivo ?? "conteggio assente"}` };
  }
  const quanti = conto.stati_ignoti.reduce((n, s) => n + (Number(s?.quante) || 0), 0);
  const nomi = conto.stati_ignoti.map((s) => `${s.stato} (${s.quante})`).join(", ");
  if (tetto === null || tetto === undefined || Number.isNaN(Number(tetto))) {
    return { rc: 2, quanti, detto: `${quanti} schede in uno stato che nessun misuratore capisce, ma non so leggere il tetto: non posso dire se è peggio di ieri` };
  }
  if (quanti > Number(tetto)) {
    return {
      rc: 1,
      quanti,
      detto:
        `${quanti} schede in uno stato che nessun misuratore del cantiere capisce (${nomi}), contro un tetto di ${tetto}: ` +
        `sono riparate o no, ma ogni contatore le legge APERTE — e restano in una lista che qualcuno riaprirà per finire un lavoro già finito`,
    };
  }
  return { rc: 0, quanti, detto: `${quanti} schede in uno stato non riconosciuto (tetto ${tetto}): il vocabolario del cantiere è uno solo` };
}

if (process.argv[1] && process.argv[1].endsWith("stati-che-nessuno-capisce.mjs")) {
  const fileCantiere = process.env.CANTIERE_FILE || join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
  const fileTetti = process.env.TETTI_FILE || join(RADICE, "cervello/tetti-lotto.json");

  let conto = null;
  try {
    const c = JSON.parse(readFileSync(fileCantiere, "utf8"));
    conto = contaDifetti(c?.difetti ?? c);
  } catch (e) {
    conto = { letto: false, motivo: `il cantiere non si legge: ${e.message.split("\n")[0]}` };
  }
  let tetto = null;
  try {
    const t = JSON.parse(readFileSync(fileTetti, "utf8"));
    tetto = Object.hasOwn(t, "stati_ignoti") ? Number(t.stati_ignoti) : null;
  } catch {
    tetto = null;
  }
  const v = verdettoStati({ conto, tetto });

  console.log("🏷️  STATI CHE NESSUN MISURATORE CAPISCE — AR-844\n");
  if (conto?.per_stato) {
    console.log(`   stati presenti: ${Object.entries(conto.per_stato).map(([s, n]) => `${s} (${n})`).join(" · ")}`);
  }
  console.log(`\n${v.rc === 0 ? "✅" : v.rc === 1 ? "⛔" : "⚠️"} ${v.detto}`);
  if (v.rc === 1) {
    console.log("\n   Nel cantiere della MACCHINA l'unico stato chiuso è `chiuso`: lo usano tasso-chiusura,");
    console.log("   cancello-lotto, auto-fix e cantiere-prove. `riparato` e `gia_riparato_prima` sono il");
    console.log("   vocabolario del registro del SITO (radiografia-marketplace-conti.mjs): lì valgono, qui no.");
    console.log("   Prima di cambiare uno stato, fai girare la prova della scheda: si corregge lo stato di un");
    console.log("   fix che c'è, non si dichiara chiuso un fix che non c'è.");
  }
  process.exit(v.rc);
}
