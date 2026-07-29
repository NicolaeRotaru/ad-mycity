// 💾 SCRIVI-JSON — la scrittura che non lascia mai un file a metà.
//
// AR-296. Misurato il 27/7: in `cervello/` ci sono **111 `writeFileSync` e zero `renameSync`**, e la
// funzione `writeJson` è copiaincollata in almeno cinque file. Ogni registro di memoria — costo-ai,
// calibrazione, sentinelle, cantiere — viene riscritto INTERO leggendolo prima e risalvandolo dopo.
//
// Due guasti diversi, stessa causa:
//   ① UN FILE A METÀ. `writeFileSync` non è atomico: se il processo muore mentre scrive (kill del
//      servizio, riavvio del VPS, disco pieno) sul disco resta un JSON troncato. Al giro dopo il
//      `JSON.parse` fallisce e quel registro è morto — «memoria bloccata da un file rotto».
//   ② IL LAVORO DELL'ALTRO CANCELLATO. Due processi che leggono lo stesso file, ci aggiungono una
//      cosa ciascuno e risalvano: l'ultimo che scrive cancella la riga del primo.
//
// Qui si chiude ①, che è il guasto irreversibile: un file troncato non si recupera, un run perso sì.
// Per ② serve l'append (registri a righe invece che a oggetto unico) ed è la seconda metà di AR-296,
// dichiarata e non fatta: cambia il FORMATO dei registri, e va fatta un registro alla volta guardando
// chi lo legge — non con una sostituzione di massa da un clone superficiale.
//
// Come funziona: si scrive su un temporaneo NELLA STESSA CARTELLA, poi `renameSync` sopra l'originale.
// Il rename dentro lo stesso filesystem è atomico per il kernel: o vede il file vecchio o quello
// nuovo, mai uno a metà. Stessa cartella e non /tmp proprio per questo — fra filesystem diversi il
// rename diventa una copia, e la copia può interrompersi come qualsiasi altra scrittura.
//
// Nessun import oltre a node:fs. Le funzioni di decisione sono pure, così un test le esegue.

import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";

/**
 * Il nome del temporaneo: nella stessa cartella del file finale, e diverso per ogni processo.
 *
 * Il `pid` serve perché due processi che salvano lo stesso registro nello stesso istante non devono
 * scrivere sullo stesso temporaneo — altrimenti il rimedio introduce la corsa che doveva togliere.
 * Il punto iniziale lo tiene fuori dai `git add` e dagli `ls` normali, e `.tmp` finale lo rende
 * riconoscibile come residuo se un crash ne lascia uno in giro.
 */
export function nomeTemporaneo(percorso, pid = process.pid) {
  return join(dirname(percorso), `.${basename(percorso)}.${pid}.tmp`);
}

/**
 * Quanto è indentato un JSON che esiste già. Si misura, non si indovina.
 *
 * Serve perché non tutti i registri della memoria hanno la stessa forma: il cantiere dei difetti e
 * i mutanti stanno a UNO spazio, quasi tutto il resto a due. Un default non è una scelta neutra —
 * è la forma di qualcun altro imposta a tutti.
 */
export function indentDi(testo, seNonSiCapisce = 2) {
  const m = String(testo || "").match(/^[{[]\r?\n( +)/);
  return m ? m[1].length : seNonSiCapisce;
}

/**
 * Il testo da scrivere: JSON con l'a-capo finale, all'indentazione chiesta.
 *
 * Prima era fissa a 2, «per rendere il diff leggibile» — e faceva l'esatto contrario. Il cantiere
 * dei difetti sta a UNO spazio: ogni volta che un guardiano applicava una chiusura, il writer lo
 * riscriveva tutto a due e il diff diventava **14.482 righe per una parola cambiata**. Un diff così
 * non lo rilegge nessuno, quindi si mergia per fiducia — e la fiducia non è una prova. Misurato il
 * 29/7 su `auto-fix.mjs verifica --applica`.
 */
export function testoJson(dati, indent = 2) {
  return JSON.stringify(dati, null, indent) + "\n";
}

/**
 * Scrive un JSON in modo che il file finale non possa MAI essere a metà.
 *
 * Torna il percorso scritto. Se il rename fallisce, il temporaneo viene rimosso e l'errore risale:
 * meglio un'eccezione visibile che un file muto lasciato indietro.
 */
export function scriviJsonAtomico(percorso, dati) {
  mkdirSync(dirname(percorso), { recursive: true });
  const tmp = nomeTemporaneo(percorso);
  // La forma del file la decide il file, non chi ci scrive dentro: un registro tenuto a uno spazio
  // resta a uno spazio anche quando lo aggiorna un guardiano. Un file nuovo nasce a due.
  let indent = 2;
  if (existsSync(percorso)) {
    try {
      indent = indentDi(readFileSync(percorso, "utf8"));
    } catch {
      /* illeggibile: tengo il default invece di fermare una scrittura che deve andare a buon fine */
    }
  }
  try {
    writeFileSync(tmp, testoJson(dati, indent), "utf8");
    renameSync(tmp, percorso); // atomico: il kernel non mostra mai uno stato intermedio
  } catch (e) {
    try {
      if (existsSync(tmp)) unlinkSync(tmp);
    } catch {}
    throw e;
  }
  return percorso;
}

/** Come sopra ma per testo già formato (Markdown, log): stessa garanzia, nessuna serializzazione. */
export function scriviTestoAtomico(percorso, testo) {
  mkdirSync(dirname(percorso), { recursive: true });
  const tmp = nomeTemporaneo(percorso);
  try {
    writeFileSync(tmp, String(testo ?? ""), "utf8");
    renameSync(tmp, percorso);
  } catch (e) {
    try {
      if (existsSync(tmp)) unlinkSync(tmp);
    } catch {}
    throw e;
  }
  return percorso;
}
