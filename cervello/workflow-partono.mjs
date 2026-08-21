#!/usr/bin/env node
// 🚦 I WORKFLOW PARTONO DAVVERO? — il controllo che nessuno faceva.
//
// LA MALATTIA (trovata il 21/8/2026, facendo la radiografia del marketplace chiesta da Nicola).
// I sei file in `.claude/workflows/` sono le capacità grosse della macchina: `radiografia`,
// `audit-design`, `auto-radiografia`, `audit-pannello`, `giro-operativo`, `radiografia-totale`.
// CLAUDE.md li nomina per nome nei comandi rapidi: «radiografia» → esegui il workflow radiografia.
// Nessuno di quei sei parte. Tutti e sei.
//
// Il motivo è di una riga: il motore dei workflow pretende che `export const meta = {…}` sia la
// PRIMA istruzione dello script, e non accetta nessun `import` — né statico («Unexpected token '{'.
// import call expects one or two arguments») né dinamico («import() is not available in workflow
// scripts»). I sei file aprono tutti con tre import e mettono `meta` in quarta posizione. Il motore
// li rifiuta prima di eseguire una sola riga: «Invalid workflow script: `export const meta` must be
// the FIRST statement in the script».
//
// LA RADICE, che è la parte che conta: **nessun guardiano ha mai provato ad AVVIARE un workflow.**
// I controlli esistenti misurano il FILE — che passi dalla porta dei senior, che i deferral esistano,
// che il conteggio torni — e passano tutti su uno script che il motore non accetterà mai. È la stessa
// malattia di `cervello/prompt-senior.mjs`, scritta nel suo stesso commento: si certificava
// l'INSTALLAZIONE e non l'ESECUZIONE. Qui è successo un piano più sotto, e per due mesi.
//
// COSA MISURA QUESTO FILE: la regola del motore, applicata al testo vero dei sei script. Non è una
// ricerca di parole: è la stessa condizione che il motore verifica prima di lanciare. Diventa verde
// solo quando quegli script partono davvero.
//
// 🟢 Sola lettura. Non scrive niente, non tocca la rete.
//
// Uso:
//   node cervello/workflow-partono.mjs          -> elenco e verdetto (exit 1 se qualcuno non parte)

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { elencaFile } from "./perimetro.mjs";

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CARTELLA = join(RADICE, ".claude", "workflows");

/** Cosa in `.claude/workflows/` NON è uno script da avviare. Vuoto: oggi sono tutti script. */
const FUORI_PERIMETRO = [];

/**
 * Il motore accetta lo script solo se `export const meta` è la prima istruzione. Commenti e righe
 * vuote in cima non contano: quelli il motore li salta. Un `import`, no.
 * @param {string} testo il contenuto dello script
 */
export function partirebbe(testo) {
  const senzaIntestazione = String(testo).replace(/^\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*|\s*\n)+/, "");
  return senzaIntestazione.startsWith("export const meta");
}

/** Il verdetto sui sei script. Separato dalla stampa, così una prova lo può eseguire. */
export function guarda() {
  if (!existsSync(CARTELLA)) return { misurato: false, motivo: `${CARTELLA} non esiste` };
  // Il perimetro NON si deduce dagli esempi di oggi (AR-379..387: un recinto scritto a mano nasce
  // verde e resta verde, perché fuori dal recinto non cerca niente). Qui dentro OGNI file è uno
  // script di workflow: si guardano tutti, e chi va tenuto fuori si dichiara per nome qui sotto,
  // col perché. Oggi non c'è niente da tenere fuori.
  const script = elencaFile(CARTELLA, { escludi: FUORI_PERIMETRO })
    .filter((f) => !f.includes("/") && statSync(join(CARTELLA, f)).isFile())
    .sort();
  if (script.length === 0) return { misurato: false, motivo: "nessuno script in .claude/workflows/" };
  const rotti = script.filter((f) => !partirebbe(readFileSync(join(CARTELLA, f), "utf8")));
  return { misurato: true, script, rotti };
}

// La parte da riga di comando gira SOLO se questo file è stato lanciato: importarlo da una prova
// non deve spegnere il processo di chi importa (era il difetto di questa stessa pagina, il 21/8).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const esito = guarda();
  if (!esito.misurato) {
    console.error(`⚪ non ho potuto misurare: ${esito.motivo}`);
    process.exit(2);
  }
  for (const f of esito.script) console.log(`${esito.rotti.includes(f) ? "❌" : "✅"} ${f}`);
  if (esito.rotti.length) {
    console.error(
      `\n❌ ${esito.rotti.length} workflow su ${esito.script.length} il motore li rifiuta: ${esito.rotti.join(", ")}` +
      `\n   Causa: c'è un import (o un'altra istruzione) sopra \`export const meta\`.` +
      `\n   Il motore non accetta import, né statici né dinamici: lo script va reso autonomo.`
    );
    process.exit(1);
  }
  console.log(`\n✅ tutti e ${esito.script.length} partono`);
}
