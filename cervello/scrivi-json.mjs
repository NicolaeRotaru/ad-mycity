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
 * Il testo da scrivere: JSON indentato a 2 con l'a-capo finale, come già fanno tutte le copie di
 * `writeJson` in giro per `cervello/`. Pura apposta: è ciò che rende il diff leggibile e va provato.
 *
 * `indent` (AR-530): la forma che il file aveva PRIMA, quando c'è. Due spazi restano il default per i
 * file nuovi — è la forma di casa, 51 registri su 60 — ma su un file che esiste già la sua forma vince
 * sempre. Il motivo non è estetico ed è misurato due volte: il 30/7 riscrivere `apprendimento.json`
 * con un'indentazione diversa ha prodotto un diff di +12.147/−12.124 righe, e il 3/8 la stessa cosa
 * sul cantiere (+8.975/−8.895) per aggiungere quattro schede. Una PR così non la rilegge nessuno, e
 * chiunque altro tocchi quel file va in conflitto totale invece che su una riga.
 *
 * Dal 3/8 c'è anche un freno al commit (`forma-json.mjs --staged`): senza questa funzione, il freno
 * avrebbe fermato il worker sul server invece di aiutarlo — bloccare un commit automatico non ripara
 * niente, sposta solo il guasto un piano più in là.
 */
export function testoJson(dati, indent = 2) {
  return JSON.stringify(dati, null, indent) + "\n";
}

/** L'indentazione di un file JSON che esiste già, letta dalla sua prima riga annidata. `null` se il
 *  file non c'è, non si legge, o sta tutto su una riga: lì non c'è nessuna forma da conservare. */
export function indentEsistente(percorso) {
  let testo;
  try {
    testo = readFileSync(percorso, "utf8");
  } catch {
    return null; // file nuovo: sceglie chi scrive
  }
  for (const riga of testo.split("\n").slice(1, 200)) {
    const m = riga.match(/^([ \t]+)\S/);
    if (m) return m[1] === "\t" ? "\t" : m[1].length;
  }
  return null;
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
  // La forma del file che c'è già vince sulla mia (AR-530): vedi `testoJson`.
  const indent = indentEsistente(percorso) ?? 2;
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
