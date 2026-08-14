// lettura-a-blocchi.mjs — leggere un file GROSSO senza tenerlo tutto in memoria e senza smettere
// di guardarlo. Nato per AR-441.
//
// PERCHÉ ESISTE. Lo scanner dei segreti saltava i file oltre 2 MB. AR-427 ha tolto la bugia («file
// non aperto» non è più «file pulito»: finisce fra i non raggiunti e il verdetto diventa cieco), ma
// la cecità dichiarata non è la cura: il giorno in cui il file più grosso supera il tetto, il
// guardiano suona a OGNI giro sul file che nessuno può sistemare — e un cancello che suona sempre
// viene aggirato al secondo giro. Misurato il 13/8 sul repo vero:
//
//     cantiere-difetti.json  1,70 MB  ← l'85% del tetto, e cresce a ogni giro
//     auto-radiografia.json  1,20 MB
//     apprendimento.json     0,97 MB
//
// Cioè il muro non è un caso limite in attesa: è la settimana prossima.
//
// LA CURA. Si legge a blocchi, tenendo una CODA del blocco precedente attaccata al successivo, così
// una chiave a cavallo del taglio resta intera sotto gli occhi della regola. La dimensione smette di
// essere sia un'esenzione sia una cecità: i file grossi si leggono, punto.
//
// PURA (la parte che decide): `cercaNeiBlocchi` prende una sequenza di PEZZI DI TESTO e ridà i
// match. Non apre niente, non conosce il disco: una prova le passa `["...ab", "cd..."]` e verifica
// che il segreto spezzato in due venga trovato lo stesso, senza dover creare un file da 3 MB.
//
// 🟢 Sola lettura.

import { closeSync, openSync, readSync } from "node:fs";
import { StringDecoder } from "node:string_decoder";

/** Quanto testo del blocco precedente si riattacca al successivo. */
export const SOVRAPPOSIZIONE = 64 * 1024;

/** Quanto si legge per volta dal disco. Un mega alla volta: la memoria resta piatta. */
export const BLOCCO = 1024 * 1024;

/**
 * La stessa regex, garantita globale e con il suo `lastIndex` a zero.
 *
 * Le regole vivono in un modulo condiviso e sono oggetti riusati da più scanner: avanzare il
 * `lastIndex` dell'originale è il modo classico per far saltare un match al chiamante dopo (è un
 * bug che il codice di casa ha già pagato altrove — qui si evita alla radice, clonando).
 */
function globale(re) {
  return new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
}

/**
 * Un solo giro di regole su una finestra di testo, con l'offset ASSOLUTO di dove comincia.
 *
 * Il caso delicato è il bordo destro. Un match che finisce esattamente dove finisce la finestra può
 * essere TAGLIATO a metà: riportarlo così darebbe un campione mozzo (lunghezza sbagliata nel
 * rapporto). Se comincia dentro la coda — cioè il prossimo giro lo rivedrà per intero — lo si
 * rimanda. Se invece comincia PRIMA della coda, il prossimo giro non ne vedrebbe l'inizio: allora
 * si riporta subito, anche mozzo. Meglio un campione corto che un segreto perso: uno si vede, l'altro no.
 */
function scansionaFinestra(finestra, base, regole, stato, ultima) {
  const fineFinestra = base + finestra.length;
  const inizioCoda = ultima ? fineFinestra : fineFinestra - Math.min(stato.sovrapposizione, finestra.length);
  for (const regola of regole) {
    const re = globale(regola.re);
    let m;
    while ((m = re.exec(finestra)) !== null) {
      if (m[0] === "") {
        re.lastIndex++; // una regola a lunghezza zero non deve inchiodare il ciclo
        continue;
      }
      const inizio = base + m.index;
      const fine = inizio + m[0].length;
      if (!ultima && fine === fineFinestra && inizio >= inizioCoda) continue; // lo rivedo intero dopo
      // La coda si rilegge apposta: senza questa chiave lo stesso match uscirebbe due volte.
      const chiave = `${regola.nome}@${inizio}`;
      if (stato.visti.has(chiave)) continue;
      stato.visti.add(chiave);
      stato.trovati.push({ regola: regola.nome, valore: m[0], offset: inizio });
    }
  }
}

/**
 * Cerca le regole in una sequenza di pezzi di testo, come se fossero un testo solo.
 *
 * @param {Iterable<string>} pezzi  i blocchi, nell'ordine in cui stanno nel file
 * @param {{nome: string, re: RegExp}[]} regole
 * @returns {{regola: string, valore: string, offset: number}[]} in ordine di lettura, senza doppioni
 */
export function cercaNeiBlocchi(pezzi, regole, { sovrapposizione = SOVRAPPOSIZIONE } = {}) {
  const stato = { trovati: [], visti: new Set(), sovrapposizione };
  let coda = "";
  let base = 0;
  const it = pezzi[Symbol.iterator]();
  let corrente = it.next();
  while (!corrente.done) {
    const prossimo = it.next();
    const finestra = coda + String(corrente.value ?? "");
    scansionaFinestra(finestra, base, regole, stato, Boolean(prossimo.done));
    const quanta = Math.min(sovrapposizione, finestra.length);
    coda = finestra.slice(finestra.length - quanta);
    base = base + finestra.length - quanta;
    corrente = prossimo;
  }
  return stato.trovati;
}

/**
 * I pezzi di un file, letti col fiato corto: un blocco per volta, memoria costante.
 *
 * Sincrono apposta: lo scanner dei segreti gira dentro un `for` sincrono prima del commit, e
 * trasformarlo in asincrono per leggere tre file grossi sarebbe un rischio molto più grande del
 * problema. Il `StringDecoder` tiene insieme i caratteri accentati tagliati a metà fra due blocchi —
 * senza, un `à` a cavallo del taglio diventerebbe due caratteri rotti.
 */
export function* pezziDiFile(percorso, dimensione = BLOCCO) {
  const fd = openSync(percorso, "r");
  const buf = Buffer.allocUnsafe(dimensione);
  const dec = new StringDecoder("utf8");
  try {
    let letti;
    while ((letti = readSync(fd, buf, 0, dimensione, null)) > 0) {
      const pezzo = dec.write(buf.subarray(0, letti));
      if (pezzo) yield pezzo;
    }
    const resto = dec.end();
    if (resto) yield resto;
  } finally {
    closeSync(fd);
  }
}
