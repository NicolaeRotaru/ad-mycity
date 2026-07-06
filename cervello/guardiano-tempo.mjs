#!/usr/bin/env node
// Capacità #38 — IL GUARDIANO DEL TUO TEMPO. Misura in modo deterministico il CARICO DI FIRME
// di Nicola: quante azioni 🔴/🟡 aspettano la sua firma, da quanti giorni, quante ne ha chiuse.
// È il KPI della Legge "Nicola sempre più leggero": se la coda di firma cresce e invecchia, la
// macchina lo dice a chiare lettere invece di lasciare che il collo di bottiglia resti invisibile.
//
// 🟢 Sola lettura: legge la coda reale AZIONI-IN-ATTESA.md e il registro DECISIONI.md, NON scrive
// nel vault, NON fa git, NON tocca il mondo. Nessun numero inventato: tutto è contato dal testo.
//
// Uso:
//   node cervello/guardiano-tempo.mjs           -> report leggibile
//   node cervello/guardiano-tempo.mjs --json     -> output JSON (per gate / sentinelle / Pannello)
//
// Exit: 0 = coda sotto controllo · 1 = collo di bottiglia (una firma aspetta da troppo, soglia 7gg)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const SOGLIA_STALLO_GG = 7; // oltre questa attesa una firma è "ferma da troppo"

const CODA = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
const DECISIONI = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/DECISIONI.md");

// Parsa "2026-07-06 11:11" (ora di Piacenza) in Date. now e righe usano la stessa lettura locale,
// così lo scarto (l'età) è corretto a prescindere dal fuso del server.
function parseData(s) {
  const m = s && s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}

// Classifica lo stato di una riga della coda con priorità: chiusa > armata/gated > in attesa.
function classificaStato(stato) {
  const s = stato.toLowerCase();
  if (/✅|fatto|merged|deciso|rimandat|⛔|ritirat/.test(s)) return "chiusa";
  if (/⏸|armat|bozze pronte/.test(s)) return "armata";
  if (/in attesa/.test(s)) return "in_attesa";
  return "altro";
}

function coloreRiga(colore) {
  if (colore.includes("🔴")) return "🔴";
  if (colore.includes("🟡")) return "🟡";
  if (colore.includes("🟢")) return "🟢";
  return "?";
}

function gg(ms) {
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function main() {
  const quandoStr = nowPiacenza();
  const now = parseData(quandoStr) || new Date();

  if (!existsSync(CODA)) {
    const out = { ok: false, quando: quandoStr, errore: "AZIONI-IN-ATTESA.md non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ AZIONI-IN-ATTESA.md non trovato");
    process.exit(1);
  }

  // --- Parsa la tabella della coda: solo righe "| N | ... |" con N intero ---
  const righe = [];
  for (const line of readFileSync(CODA, "utf8").split("\n")) {
    if (!line.trimStart().startsWith("|")) continue;
    const celle = line.split("|").map((c) => c.trim());
    // split("|") su "| a | b |" -> ["", "a", "b", ""]: togliamo i bordi vuoti
    if (celle[0] === "") celle.shift();
    if (celle[celle.length - 1] === "") celle.pop();
    if (celle.length < 8) continue;
    if (!/^\d+$/.test(celle[0])) continue; // salta header ("#") e separatore ("---")
    righe.push({
      num: +celle[0],
      data: celle[1],
      reparto: celle[2],
      azione: celle[3],
      colore: coloreRiga(celle[4]),
      stato: classificaStato(celle[7]),
      quando: parseData(celle[1]),
    });
  }

  const inAttesa = righe.filter((r) => r.stato === "in_attesa");
  const armate = righe.filter((r) => r.stato === "armata");
  const chiuse = righe.filter((r) => r.stato === "chiusa");

  // Età di ogni firma in attesa (giorni), dalla più vecchia.
  const conEta = inAttesa
    .map((r) => ({ ...r, eta_gg: r.quando ? gg(now - r.quando) : null }))
    .sort((a, b) => (b.eta_gg ?? -1) - (a.eta_gg ?? -1));

  const rosse = inAttesa.filter((r) => r.colore === "🔴").length;
  const gialle = inAttesa.filter((r) => r.colore === "🟡").length;
  const piuVecchia = conEta[0] || null;
  const etaValide = conEta.map((r) => r.eta_gg).filter((v) => v != null);
  const etaMedia = etaValide.length
    ? Math.round(etaValide.reduce((a, b) => a + b, 0) / etaValide.length)
    : null;

  // --- Ritmo: decisioni registrate in DECISIONI negli ultimi 7 giorni ---
  // Onestà: /nicola/ conta le righe che lo CITANO (richiesta o firma), non solo le firme vere —
  // quindi l'etichetta è "ti coinvolgono", non "firmate da te", per non gonfiare il numero.
  let decisioni7gg = 0;
  let coinvolgonoNicola7gg = 0;
  if (existsSync(DECISIONI)) {
    for (const line of readFileSync(DECISIONI, "utf8").split("\n")) {
      const m = line.match(/^-\s*(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2})/);
      if (!m) continue;
      const d = parseData(m[1]);
      if (!d || gg(now - d) > 7 || d > now) continue;
      decisioni7gg++;
      if (/nicola/i.test(line)) coinvolgonoNicola7gg++;
    }
  }

  const stallo = (piuVecchia?.eta_gg ?? 0) > SOGLIA_STALLO_GG;
  const out = {
    ok: !stallo,
    quando: quandoStr,
    fonte: "AZIONI-IN-ATTESA.md + DECISIONI.md (conteggio deterministico, nessun numero inventato)",
    coda_firma_nicola: {
      totale_in_attesa: inAttesa.length,
      rosse,
      gialle,
      piu_vecchia_gg: piuVecchia?.eta_gg ?? null,
      piu_vecchia_azione: piuVecchia ? `#${piuVecchia.num} · ${piuVecchia.azione}` : null,
      eta_media_gg: etaMedia,
    },
    armate_gated: armate.length, // pronte ma in attesa di una condizione (scala/business), non di te
    chiuse_in_coda: chiuse.length,
    ultimi_7_giorni: { decisioni_registrate: decisioni7gg, ti_coinvolgono: coinvolgonoNicola7gg },
    soglia_stallo_gg: SOGLIA_STALLO_GG,
    stallo,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`⏱️  Guardiano del Tuo Tempo — ${quandoStr}`);
  console.log(`   (carico di firma di Nicola, contato dai dati reali)\n`);
  console.log(`   In attesa della tua firma:  ${inAttesa.length}   (🔴 ${rosse} · 🟡 ${gialle})`);
  if (piuVecchia) {
    console.log(`   La più vecchia aspetta da:  ${piuVecchia.eta_gg} giorni`);
    console.log(`      → ${piuVecchia.colore} #${piuVecchia.num} · ${piuVecchia.azione.slice(0, 80)}`);
  }
  if (etaMedia != null) console.log(`   Attesa media della coda:    ${etaMedia} giorni`);
  console.log(`   Armate ma in attesa di una condizione (non di te): ${armate.length}`);
  console.log(`   Già chiuse (storico in coda): ${chiuse.length}`);
  console.log(`   Ultimi 7 giorni: ${decisioni7gg} decisioni nel diario, ${coinvolgonoNicola7gg} ti coinvolgono`);
  console.log("");
  if (stallo) {
    console.log(`   🔴 COLLO DI BOTTIGLIA: una firma aspetta da ${piuVecchia.eta_gg} giorni (soglia ${SOGLIA_STALLO_GG}).`);
    console.log(`      Sei tu il vincolo: la macchina ha già fatto la sua parte, aspetta te.`);
  } else {
    console.log(`   ✅ Coda sotto controllo: nessuna firma ferma oltre ${SOGLIA_STALLO_GG} giorni.`);
  }
  process.exit(out.ok ? 0 : 1);
}

main();
