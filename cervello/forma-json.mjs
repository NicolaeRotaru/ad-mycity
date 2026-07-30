#!/usr/bin/env node
// 📐 UN FILE RISCRITTO TUTTO PER CAMBIARE UNA RIGA.
//
// PERCHÉ ESISTE. Il 30/7, per aggiungere un campo `gate` a ventuno lezioni, ho riscritto
// `apprendimento.json` con `JSON.stringify(…, null, 1)` mentre il file era indentato a due spazi.
// Diff: +12.147 / −12.124. Stessa cosa su `cantiere-difetti.json`: +7.438 / −7.406 per aggiungere
// un difetto. Il contenuto era giusto — è la FORMA che è cambiata su ogni riga.
//
// Perché è grave e non estetico:
//   · una PR così non la rilegge nessuno, e «si mergia per fiducia» — che non è una prova;
//   · ogni altra sessione che tocchi quel file va in conflitto TOTALE, non su una riga;
//   · e sono proprio i file che il worker riscrive di continuo, cioè la famiglia di errori che
//     ventuno correzioni di Nicola avevano già segnalato. L'ho commessa mentre la chiudevo.
//
// COSA CONTROLLA. Per ogni JSON che il ramo tocca, confronta l'indentazione con quella su
// `origin/main`. Non impone uno stile: impone di NON cambiarlo. Chi scrive un file nuovo sceglie
// quello che vuole; chi ne modifica uno esistente lo lascia com'era.
//
// 🟢 Sola lettura.
//
// Uso:
//   node cervello/forma-json.mjs           -> controlla i JSON toccati dal ramo
//   node cervello/forma-json.mjs --json
// Exit: 0 = nessuna riformattazione · 1 = un file ha cambiato forma · 2 = non ho potuto misurare

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const JSON_MODE = process.argv.includes("--json");

/**
 * L'indentazione di un JSON, letta dalla prima riga annidata.
 *
 * Pura: prende il testo e torna il numero di spazi (o `\t`), oppure null se il file è su una riga
 * sola — nel qual caso non c'è una forma da conservare e non si dice niente.
 */
export function indentazione(testo = "") {
  for (const riga of String(testo).split("\n").slice(1, 40)) {
    const m = riga.match(/^([ \t]+)\S/);
    if (m) return m[1] === "\t" ? "tab" : String(m[1].length);
  }
  return null;
}

/** I file che hanno cambiato FORMA pur restando validi: stesso contenuto, ogni riga diversa. */
export function riformattati(coppie = []) {
  const fuori = [];
  for (const { file, prima, dopo } of coppie) {
    const a = indentazione(prima);
    const b = indentazione(dopo);
    if (a === null || b === null || a === b) continue;
    fuori.push({ file, prima: a, dopo: b });
  }
  return fuori;
}

function main() {
  let toccati;
  try {
    toccati = percorsiDaGit(["diff", "--name-only", "origin/main...HEAD"], { cwd: AD_ROOT }).filter((f) => f.endsWith(".json"));
  } catch (e) {
    return esci(2, `non riesco a chiedere a git i file del ramo (${e.message})`);
  }
  if (!toccati.length) {
    if (!JSON_MODE) console.log("📐 nessun JSON toccato da questo ramo.");
    process.exit(0);
  }

  const coppie = [];
  for (const file of toccati) {
    const r = spawnSync("git", ["show", `origin/main:${file}`], { cwd: AD_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) continue; // file nuovo: nessuna forma da conservare
    let dopo;
    try {
      dopo = readFileSync(join(AD_ROOT, file), "utf8");
    } catch {
      continue; // cancellato dal ramo: non è una riformattazione
    }
    coppie.push({ file, prima: r.stdout, dopo });
  }

  const fuori = riformattati(coppie);
  if (JSON_MODE) {
    console.log(JSON.stringify({ quando: nowPiacenza(), controllati: coppie.length, riformattati: fuori }, null, 2));
    process.exit(fuori.length ? 1 : 0);
  }

  console.log(`\n📐 FORMA DEI JSON — ${nowPiacenza()}\n`);
  console.log(`  JSON toccati dal ramo e già presenti su main: ${coppie.length}`);
  if (!fuori.length) {
    console.log(`\n✅ nessuno ha cambiato indentazione: i diff mostrano solo le righe cambiate davvero.`);
    process.exit(0);
  }
  for (const f of fuori) console.log(`  ❌ ${f.file}: era ${f.prima} spazi, ora ${f.dopo}`);
  console.log(`\n❌ ${fuori.length} file riscritti tutti per cambiarne una parte.`);
  console.log(`   Il contenuto può essere giusto: è la forma che rende la PR illeggibile e il`);
  console.log(`   conflitto totale per chiunque altro tocchi quel file. Riscrivilo con`);
  console.log(`   l'indentazione di prima — JSON.stringify(dati, null, <spazi di origin/main>).`);
  process.exit(1);
}

function esci(codice, messaggio) {
  if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: codice === 2, motivo: messaggio }));
  else console.error(`forma-json: ${messaggio}`);
  process.exit(codice);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
