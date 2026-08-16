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
// Nessun import oltre a node:fs e a due moduli PURI di casa. Le funzioni di decisione sono pure,
// così un test le esegue.
//
// ⚠️ QUI PASSA ANCHE IL FRENO DELLA MEMORIA (AR-663 · AR-668 · AR-639 · AR-446). Questo è l'unico
// punto che TUTTI gli scrittori atomici attraversano, quindi è qui che si decide se una scrittura
// nella memoria della macchina va fatta e dove — invece che dentro ogni script, una variabile alla
// volta. Il freno dentro lo script è la forma che ha generato AR-668: `sentinella-dati` aveva la sua
// variabile e lanciava un tick che non ereditava niente. `cervello/casa-memoria.mjs` lo sposta sul
// dato, e i processi figli lo ereditano dall'ambiente senza sapere che esiste.

import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { decidiDestinazione } from "./casa-memoria.mjs";
import { decidiScrittura } from "./scrittura-misura.mjs";

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
 */
export function testoJson(dati, indent = 2) {
  return JSON.stringify(dati, null, indent) + "\n";
}

/**
 * L'indentazione che il file ha GIÀ — si conserva, non si impone (AR-530).
 *
 * IL CONTO DI NON AVERLO FATTO: quattro giorni e diciassette ore di macchina ferma. `tasso-lezioni`
 * riscriveva `apprendimento.json` con due spazi mentre quel file ne ha uno. Per git non è un campo
 * cambiato: è il file intero riscritto. Il guardiano della forma blocca il commit — giustamente, è
 * nato per questo — l'albero resta sporco, il rebase si rifiuta di partire su un albero sporco, il
 * push non parte, e la macchina lavora dieci minuti a ogni giro senza che ne esca niente. Quattro
 * anelli di catena, e il primo è uno spazio.
 *
 * Otto file di questo repo hanno un solo spazio (apprendimento, guardiani-motivi, malattie, mutanti,
 * permessi-debito, radar, radar-fonti, tetti-lotto): finché l'indentazione la decide chi SCRIVE
 * invece del file che ESISTE, ognuno di questi è la prossima istanza.
 *
 * Su un file che non c'è ancora torna il valore di riferimento: lì non c'è niente da conservare.
 */
export function indentazioneDi(percorso, riferimento = 2) {
  let testo;
  try {
    testo = readFileSync(percorso, "utf8");
  } catch {
    return riferimento; // file nuovo: non è una misura mancata, non c'è ancora niente da misurare
  }
  for (const riga of testo.split("\n").slice(1, 8)) {
    const m = /^( +)"/.exec(riga);
    if (m) return m[1].length;
  }
  return riferimento;
}

/**
 * ⭐ CIECO NON SOVRASCRIVE VEDENTE, ma sul DATO invece che dentro un comando (AR-568 b · AR-286).
 *
 * La clausola esisteva già, scritta dentro `verifica-sensori.mjs`. Lì protegge un file solo: gli
 * altri referti di misura — il tasso di chiusura, il blocco mancante, il referto della coerenza —
 * restano scoperti, e ogni strumento nuovo nasce scoperto per default. È la forma che ha generato
 * AR-668: il freno sulla porta che si è vista.
 *
 * Qui la regola vale per chiunque passi da questa penna, e il prezzo di ammissione è il TIMBRO: la
 * protezione scatta solo se la misura dichiara `origine` (e la vecchia pure). Una misura anonima non
 * si può confrontare con nessun'altra — ed è per questo che AR-286 non è un dettaglio di
 * catalogazione: senza provenienza, un residuo e una misura sono la stessa riga.
 *
 * Chi scrive documenti che misure non sono (registri, code, cantieri) non ha `origine` e non vede
 * cambiare niente: il freno non deve allargarsi dove nessuno l'ha chiesto.
 *
 * @returns {{scrivi: boolean, motivo: string}}
 */
function coperturaAmmessa(percorso, dati) {
  if (!dati || typeof dati !== "object" || !dati.origine) return { scrivi: true, motivo: "" };
  let vecchia = null;
  let leggibile = true;
  try {
    if (existsSync(percorso)) vecchia = JSON.parse(readFileSync(percorso, "utf8"));
  } catch {
    leggibile = false; // un file rotto NON deve passare per «non c'era niente prima»
  }
  if (vecchia === null && leggibile) return { scrivi: true, motivo: "" };
  if (!vecchia || typeof vecchia !== "object" || !vecchia.origine) return { scrivi: true, motivo: "" };
  const d = decidiScrittura({ misuraNuova: dati, misuraVecchia: vecchia, vecchiaLeggibile: leggibile });
  // Qui interessa SOLO la regola della copertura: «nulla è cambiato oltre l'ora» resta una scelta di
  // chi misura (per un contatore l'esecuzione È il dato), e imporla da qui spegnerebbe in silenzio i
  // guardiani che quella decisione la prendono già, con la loro prova addosso.
  if (!d.scrivi && d.affianca) return { scrivi: false, motivo: d.motivo };
  return { scrivi: true, motivo: "" };
}

/**
 * Scrive un JSON in modo che il file finale non possa MAI essere a metà.
 *
 * Torna il percorso scritto, o `null` se la scrittura è stata fermata dal freno della memoria (chi
 * misura non sporca) o dalla guardia della copertura (chi ha visto meno non cancella chi ha visto
 * più). Se il rename fallisce, il temporaneo viene rimosso e l'errore risale: meglio un'eccezione
 * visibile che un file muto lasciato indietro.
 */
export function scriviJsonAtomico(percorso, dati, env = process.env) {
  const dove = decidiDestinazione(percorso, { env });
  if (!dove.scrivi) return null;
  percorso = dove.percorso;
  const copertura = coperturaAmmessa(percorso, dati);
  if (!copertura.scrivi) {
    // Un rifiuto muto è un guasto: chi legge il log deve capire perché il file non è cambiato.
    console.error(`⏭️  NON riscrivo ${percorso}: ${copertura.motivo}`);
    return null;
  }
  mkdirSync(dirname(percorso), { recursive: true });
  const tmp = nomeTemporaneo(percorso);
  try {
    // L'indentazione si legge dal file che si sta per sostituire: chi scrive non la sceglie (AR-530).
    writeFileSync(tmp, testoJson(dati, indentazioneDi(percorso)), "utf8");
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
export function scriviTestoAtomico(percorso, testo, env = process.env) {
  const dove = decidiDestinazione(percorso, { env });
  if (!dove.scrivi) return null;
  percorso = dove.percorso;
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
