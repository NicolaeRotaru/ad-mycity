#!/usr/bin/env node
// AR-196 — il freno sui costi, come programma che si può ESEGUIRE e quindi provare.
//
// Prima la decisione viveva dentro giro.sh come due righe di jq. Nessun test poteva farla scattare:
// per provarla bisognava far girare un giro intero. È lo stesso motivo per cui il difetto è vissuto
// tanto — la sua prova di chiusura era un grep di `token_per_gate` in un file, e un grep non frena.
//
// 🟢 Sola lettura: non scrive niente, non tocca il vault, non fa rete.
//
// Uso:
//   node cervello/freno-costi.mjs                 -> legge costo-ai.json dal vault
//   node cervello/freno-costi.mjs --file=X.json   -> legge un file dato (i test usano questo)
//   node cervello/freno-costi.mjs --json          -> verdetto completo in JSON
//
// Exit (contratto AR-322):  0 = sotto soglia (lascia)  ·  1 = oltre soglia (frena)  ·  2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decidiFrenoCostoDoppio, tokenPerGate, tokenSessionePerGate } from "./fonte-numero.mjs";
import { msDaTimbro } from "./ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const JSON_MODE = process.argv.includes("--json");

function flag(nome) {
  const p = `--${nome}=`;
  const a = process.argv.find((x) => x.startsWith(p));
  return a ? a.slice(p.length).trim() : null;
}

const FILE = flag("file") || join(QUI, "..", "MyCity-Vault/90-Memoria-AI/auto-coscienza/costo-ai.json");

function leggi() {
  if (!existsSync(FILE)) return null;
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return null;
  }
}

const dati = leggi();
if (dati == null) {
  const out = { azione: "cieco", motivo: `costo-ai.json non leggibile (${FILE})`, valore: null, soglia: null };
  console.log(JSON_MODE ? JSON.stringify(out) : `cieco\t${out.motivo}`);
  process.exit(2);
}

const soglia = Number(dati.soglia_giornaliera_token || 0);
// AR-442 — il SECONDO tetto: quanto si può bruciare nella finestra scorrevole (~6h), che è il muro
// vero della quota. Se il file non lo dichiara si eredita il tetto del giorno: in sei ore non si
// può spendere ciò che è concesso in ventiquattro. Non è un numero inventato — è quello già
// firmato per la giornata, applicato a una finestra più stretta.
const sogliaSessione = Number(dati.soglia_sessione_rolling_token || soglia || 0);
// AR-424 — la data di oggi a Piacenza, passata alla funzione pura invece di essere letta da dentro:
// così il confronto «di che giorno è questo contatore?» è provabile senza spostare l'orologio.
const OGGI_PIACENZA = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
const misura = tokenPerGate(dati.oggi, OGGI_PIACENZA);
const misuraSessione = tokenSessionePerGate(dati.sessione_rolling, Date.now(), msDaTimbro);
// AR-442 — DUE TETTI, VINCE IL PIÙ SEVERO. Prima qui c'era `decidiFrenoCosto` su un contatore solo,
// quello del GIORNO SOLARE: alle 00:10 ripartiva da zero e il freno lasciava passare una macchina
// che aveva appena bruciato tutto fra le 18 e le 24.
const verdetto = decidiFrenoCostoDoppio({
  giorno: { valore: misura.valore, fonte: misura.fonte, soglia },
  sessione: { valore: misuraSessione.valore, fonte: misuraSessione.fonte, soglia: sogliaSessione },
});

const out = {
  ...verdetto,
  valore: misura.valore,
  fonte: misura.fonte,
  reali: misura.reali,
  stimati: misura.stimati,
  soglia,
  valore_sessione: misuraSessione.valore,
  fonte_sessione: misuraSessione.fonte,
  soglia_sessione: sogliaSessione,
  finestra_min: dati.sessione_rolling?.finestra_min ?? null,
  file: FILE,
  // AR-424: il giorno del contatore va SEMPRE in chiaro accanto al verdetto. È il dato che mancava:
  // finché non compariva, «lascia, 0 token» e «lascia, 0 token di ieri» erano la stessa riga.
  giorno_contatore: misura.giorno ?? null,
  oggi: OGGI_PIACENZA,
};

if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
else console.log(`${verdetto.azione}\t${verdetto.motivo}`);

process.exit(verdetto.azione === "frena" ? 1 : verdetto.azione === "cieco" ? 2 : 0);
