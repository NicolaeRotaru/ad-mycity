#!/usr/bin/env node
// comandi-senza-casa.mjs — un comando dato a Nicola deve dire DA DOVE si lancia.
//
// PERCHÉ ESISTE. Due volte lo stesso inciampo, a due settimane di distanza:
//   · 4/8  — comando di verifica lanciato dalla home invece che dalla cartella del progetto:
//            «Cannot find module». Diagnosticato e corretto, e la lezione (L-2026-0804-01) diceva
//            già di dare il percorso. È rimasta una frase.
//   · 21/8 16:32 — stessa scena: `cp consegne/…` e `node cervello/…` lanciati da /root, tutti e due
//            falliti. Nicola ha dovuto mandare uno screenshot per farmelo capire.
//
// La lezione non aveva un guardiano, quindi non ha fermato niente: dipendeva dalla mia attenzione,
// e la mia attenzione ha ceduto alla seconda occasione. Questo lo misura invece di ricordarselo.
//
// LA REGOLA. In una card ancora aperta di AZIONI-IN-ATTESA, un blocco di comandi che nomina un
// percorso interno al repo (`cervello/…`, `consegne/…`) deve contenere anche il `cd` che ci porta.
// Non è pedanteria: quei percorsi esistono SOLO dentro la cartella del progetto, e Nicola i comandi
// li lancia dal server, dove la home è un'altra cosa. Un comando che presuppone una cartella che
// non ha detto non è un comando: è un indovinello che fallisce con uno stack trace.
//
// Le card già chiuse (✅) non si toccano: sono storia, e la storia non si riscrive.
//
// Uso: node cervello/comandi-senza-casa.mjs [--file <percorso>]
// Uscita: 0 nessun comando orfano · 1 almeno uno · 2 non ho potuto misurare

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CODA = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");

/** I comandi che vivono solo dentro la cartella del repo. */
const PREFISSI_INTERNI = [
  "node cervello/",
  "bash cervello/",
  "sh cervello/",
  "node --test cervello/",
  "npx bats cervello/",
  "cp consegne/",
  "cat consegne/",
  "cp creativi/",
];

/** Le card del file, una per titolo `### `. Torna [{titolo, corpo}]. */
export function carte(testo) {
  return testo
    .split(/^### /m)
    .slice(1)
    .map((pezzo) => {
      const fine = pezzo.indexOf("\n");
      return { titolo: fine === -1 ? pezzo : pezzo.slice(0, fine), corpo: pezzo };
    });
}

/** I blocchi ``` di un testo, senza i backtick. */
export function blocchi(corpo) {
  return [...corpo.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1]);
}

/** Un blocco è orfano se nomina un percorso interno e non dice da dove partire. */
export function orfano(blocco) {
  const righe = blocco
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  const interni = righe.filter((r) => PREFISSI_INTERNI.some((p) => r.startsWith(p)));
  if (interni.length === 0) return null;
  if (righe.some((r) => r.startsWith("cd "))) return null;
  return interni[0];
}

/** I comandi orfani nelle card ancora aperte. Torna [{titolo, comando}]. */
export function orfani(testo) {
  const trovati = [];
  for (const c of carte(testo)) {
    if (c.titolo.startsWith("✅")) continue; // storia chiusa
    for (const b of blocchi(c.corpo)) {
      const cmd = orfano(b);
      if (cmd) {
        trovati.push({ titolo: c.titolo.trim(), comando: cmd });
        break; // una segnalazione per card: il rimedio è lo stesso
      }
    }
  }
  return trovati;
}

function main() {
  const i = process.argv.indexOf("--file");
  const file = i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : CODA;
  if (!existsSync(file)) {
    console.error(`⚪ non ho potuto misurare: ${file} non esiste`);
    process.exit(2);
  }
  const trovati = orfani(readFileSync(file, "utf8"));
  console.log("🏠 OGNI COMANDO DICE DA DOVE SI LANCIA");
  if (trovati.length === 0) {
    console.log("\n✅ nessun comando orfano nelle card aperte.");
    process.exit(0);
  }
  console.error(`\n⛔ ${trovati.length} card danno un comando senza dire da quale cartella:`);
  for (const t of trovati) {
    console.error(`  · ${t.titolo}`);
    console.error(`      ${t.comando}`);
  }
  console.error(`\n   Quei percorsi esistono solo dentro la cartella del progetto, e Nicola lancia`);
  console.error(`   dal server. Metti il \`cd\` nello stesso blocco: un comando che presuppone una`);
  console.error(`   cartella che non ha detto fallisce con uno stack trace, non con una spiegazione.`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
