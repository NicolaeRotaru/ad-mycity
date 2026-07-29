#!/usr/bin/env node
// freschezza-cadenze.mjs — AR-164: «si controlla che la sveglia sia carica, mai che qualcuno si
// sia alzato».
//
// Il difetto: i guardiani dell'automazione controllano i TIMER systemd (lo strumento). Un timer
// attivo che lancia uno script che esce subito è verde da entrambe le parti e non produce niente:
// se il Piano del mattino smette di uscire, nessuno se ne accorge. La radice, scritta nella scheda:
// «il controllo dell'automazione è stato pensato come controllo dell'INFRASTRUTTURA e non del
// PRODOTTO delle cadenze» — la stessa confusione per cui una riunione si considera fatta perché è
// a calendario, non perché ha prodotto una decisione.
//
// La cura ha due metà, e questa è la seconda: la prima è che ogni cadenza adesso LASCIA il proprio
// esito con l'ora (cervello/lib-cadenza.sh → esito-cadenze.json); qui lo si legge e si dice chi non
// si è più alzato. La decisione è pura e sta in `esito-cadenza.mjs` — questo file è solo l'occhio.
//
// Contratto guardiani (AR-322): 0 = passato · 1 = bocciato · 2 = cieco (non ho potuto misurare).
// 🟢 Sola lettura.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cadenzeStantie, CADENZE } from "./esito-cadenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const STATO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json");
const json = process.argv.includes("--json");

let stato;
try {
  stato = JSON.parse(readFileSync(STATO, "utf8"));
} catch (e) {
  // Il file non c'è ancora: è il primo giro dopo l'installazione, non una cadenza morta.
  // Cieco ≠ bocciato — dirlo con parole sue è il contratto AR-322.
  const msg = `⚠️ CIECO: non ho potuto leggere ${STATO.replace(REPO + "/", "")} (${e.code || e.message}).\n   È normale finché le cadenze non hanno girato almeno una volta con lib-cadenza.sh.`;
  process.stdout.write(json ? JSON.stringify({ cieco: true, motivo: e.code || e.message }) + "\n" : msg + "\n");
  process.exit(2);
}

const stantie = cadenzeStantie({ stato, adessoMs: Date.now() });

// AR-166 clausola (b) — «al giro SUCCESSIVO passalo come vincolo hard». Il giro precedente che ha
// saltato l'auto-analisi e l'apprendimento lo scriveva solo su stderr, «il registro tecnico del
// server», e chiudeva dicendo che era andato tutto bene. Ora quella riga sopravvive nell'esito, e
// qui diventa una richiesta al giro di adesso: rifà per primi i passi che l'altro ha saltato.
const passiSaltati = Object.entries(stato.cadenze || {})
  .filter(([, v]) => v && v.passi_ok === false)
  .map(([tipo, v]) => ({ tipo, quando: v.quando }));
// Una cadenza «mai registrata» in un file appena nato non è una cadenza morta: è l'installazione in
// corso. Boccia solo su ciò che è DAVVERO invecchiato, e conta le mai-viste a parte.
const invecchiate = stantie.filter((s) => s.ore !== null);
const maiViste = stantie.filter((s) => s.ore === null);

if (json) {
  process.stdout.write(
    JSON.stringify({ invecchiate, maiViste, passiSaltati, totali: Object.keys(CADENZE).length }) + "\n",
  );
} else {
  process.stdout.write(`🕰️  FRESCHEZZA DELLE CADENZE — ${Object.keys(CADENZE).length} attese\n\n`);
  if (!invecchiate.length && !maiViste.length && !passiSaltati.length) {
    process.stdout.write("   ✅ tutte le cadenze si sono alzate dentro la loro finestra.\n");
  }
  for (const s of invecchiate) {
    process.stdout.write(`   ⛔ ${s.tipo}: ${s.motivo} (max ${s.oreMax}h)\n`);
  }
  for (const s of passiSaltati) {
    process.stdout.write(`   ⛔ ${s.tipo} (${s.quando}): è uscito saltando l'auto-analisi o l'apprendimento — rifalli PRIMA di altro\n`);
  }
  for (const s of maiViste) {
    process.stdout.write(`   ·  ${s.tipo}: ${s.motivo} — non conta come bocciatura finché non ha mai girato\n`);
  }
}

process.exit(invecchiate.length || passiSaltati.length ? 1 : 0);
