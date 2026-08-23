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
import { senzaCommenti } from "./contratto-scheda.mjs";

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

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LA SECONDA REGOLA, e nasce da un errore mio del 23/8/2026.
//
// Riparando AR-780 ho tolto gli `import` dai sei script e ho rilanciato questo guardiano: verde,
// sei su sei. Ma quattro di quegli script continuavano a CHIAMARE le funzioni che gli import
// portavano — `promptSenior`, `radiceRepo`, `existsSync` — e a runtime sarebbero morti su un
// ReferenceError alla prima riga utile. Il guardiano diceva «partono» di script che non partivano.
//
// È la stessa malattia che il guardiano stesso denuncia nel suo commento in cima: si certificava
// l'INSTALLAZIONE e non l'ESECUZIONE. L'avevo appena curata un piano sopra e l'ho rifatta un piano
// sotto, nella stessa ora.
//
// Quindi: oltre alla prima istruzione si guarda se lo script NOMINA qualcosa che il motore non gli
// darà mai. Non è un'analisi del linguaggio — è un elenco di nomi che qui dentro non esistono, e
// cresce quando qualcuno ne trova un altro.
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Quello che il motore dei workflow METTE a disposizione. Sta scritto qui perché chi legge un
 * rosso deve sapere cosa può usare, non solo cosa non può.
 */
export const GLOBALI_DEL_MOTORE = Object.freeze([
  "agent", "parallel", "pipeline", "phase", "log", "args", "budget", "workflow",
]);

/**
 * I nomi che il motore NON dà, con la ragione. Il valore è il messaggio che esce a chi legge il
 * rosso: un elenco senza motivo si scorre, uno con il motivo si legge.
 */
export const NOMI_CHE_NON_ESISTONO = Object.freeze({
  require: "il motore non è Node: non c'è `require`",
  process: "niente `process`: né `process.env` né `process.argv`",
  __dirname: "niente percorsi del modulo",
  __filename: "niente percorsi del modulo",
  existsSync: "niente filesystem: `node:fs` non si può importare",
  readFileSync: "niente filesystem: `node:fs` non si può importare",
  writeFileSync: "niente filesystem: `node:fs` non si può importare",
  spawnSync: "niente processi figli",
  execSync: "niente processi figli",
  promptSenior: "veniva da cervello/prompt-senior.mjs, che qui non si può importare: usa `agentType`",
  radiceRepo: "veniva da cervello/prompt-senior.mjs: l'agente è già dentro il repo",
  fattiVivi: "legge il repo: calcolalo fuori e passalo in `args`",
  turnoDelGiro: "legge il repo: calcolalo fuori e passalo in `args`",
});

/**
 * Il testo senza commenti né stringhe: un nome citato in una frase non è una chiamata.
 *
 * I commenti li toglie la casa del contratto (`senzaCommenti`), che è la stessa regola usata per
 * cercare l'ATTO di chiusura nel codice (AR-724). Erano due copie della stessa riga in due file, e
 * due copie di una regola diventano due regole al primo che ne aggiusta una.
 */
function soloCodice(testo) {
  return senzaCommenti(testo)
    .replace(/`(?:[^`\\]|\\.)*`/g, "``")
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
}

/**
 * Lo script nomina qualcosa che il motore non gli darà? Torna l'elenco dei nomi con il perché.
 *
 * Guarda il CODICE, non i commenti né le stringhe: questi file spiegano nei commenti proprio quali
 * nomi non si possono usare, e contarli sarebbe un rosso su una spiegazione.
 */
export function nomiAssenti(testo) {
  const codice = soloCodice(testo);
  const trovati = [];
  for (const [nome, perche] of Object.entries(NOMI_CHE_NON_ESISTONO)) {
    // Il nome usato DAVVERO: seguito da `(` o da `.`, e non preceduto da un punto (una proprietà
    // che si chiama come lui — `x.process` — non è il globale).
    const re = new RegExp(`(^|[^.\\w$])${nome}\\s*[(.]`, "m");
    if (re.test(codice)) trovati.push({ nome, perche });
  }
  return trovati;
}

/** C'è un import? Il motore li rifiuta tutti, anche in fondo al file. */
export function haImport(testo) {
  return /^\s*import[\s{*]/m.test(soloCodice(testo));
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
  const guai = {};
  for (const f of script) {
    const testo = readFileSync(join(CARTELLA, f), "utf8");
    const motivi = [];
    if (!partirebbe(testo)) motivi.push("`export const meta` non è la prima istruzione");
    if (haImport(testo)) motivi.push("c'è un `import`: il motore non ne accetta nessuno");
    for (const { nome, perche } of nomiAssenti(testo)) motivi.push(`usa \`${nome}\` — ${perche}`);
    if (motivi.length) guai[f] = motivi;
  }
  const rotti = Object.keys(guai);
  return { misurato: true, script, rotti, guai };
}

// La parte da riga di comando gira SOLO se questo file è stato lanciato: importarlo da una prova
// non deve spegnere il processo di chi importa (era il difetto di questa stessa pagina, il 21/8).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const esito = guarda();
  if (!esito.misurato) {
    console.error(`⚪ non ho potuto misurare: ${esito.motivo}`);
    process.exit(2);
  }
  for (const f of esito.script) {
    console.log(`${esito.rotti.includes(f) ? "❌" : "✅"} ${f}`);
    for (const m of esito.guai?.[f] || []) console.log(`     · ${m}`);
  }
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
