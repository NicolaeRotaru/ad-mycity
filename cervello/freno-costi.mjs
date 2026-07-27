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
import { decidiFrenoCosto, tokenPerGate } from "./fonte-numero.mjs";

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
const misura = tokenPerGate(dati.oggi);
const verdetto = decidiFrenoCosto({ valore: misura.valore, fonte: misura.fonte, soglia });

const out = {
  ...verdetto,
  valore: misura.valore,
  fonte: misura.fonte,
  reali: misura.reali,
  stimati: misura.stimati,
  soglia,
  file: FILE,
};

if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
else console.log(`${verdetto.azione}\t${verdetto.motivo}`);

process.exit(verdetto.azione === "frena" ? 1 : verdetto.azione === "cieco" ? 2 : 0);
