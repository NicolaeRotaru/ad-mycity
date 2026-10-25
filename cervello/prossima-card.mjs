#!/usr/bin/env node
// 🔢 IL NUMERO DELLA PROSSIMA CARD — per chi la scrive a mano. 🟢 Sola lettura.
//
// PERCHÉ ESISTE. I tre scrittori automatici di card (card di merge, sensori spenti, risveglio delle
// pause) scelgono il numero con `prossimoNumero`, guardando la coda E il suo archivio. Ma la maggior
// parte delle card la scrive l'AD a mano — dal worker, dal giro, da un lavoro lanciato dal Pannello —
// e l'AD vede la coda, non l'archivio. Il 25/10, archiviata la #211, la card più alta in coda era la
// #210: chi contava a occhio scriveva 211, un numero già speso. Per l'AD la regola era una frase
// («il più alto mai usato + 1»); questo comando gliela dà fatta, e il worker la mette nel suo contesto.
//
// USO:
//   node cervello/prossima-card.mjs                  -> stampa il numero (es. 212)
//   node cervello/prossima-card.mjs --coda <file>    -> su un'altra coda (prove): l'archivio è quello accanto
//
// EXIT: 0 = numero stampato · 2 = CIECO: la coda o il suo archivio non si leggono, e un numero scelto
// senza averli visti può essere un doppione. Meglio nessun numero che uno sbagliato.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { CODA, testoArchivioDi } from "./coda-e-archivio.mjs";
import { prossimoNumero } from "./pausa-coda.mjs";

/** Il prossimo numero libero, contando la coda e l'archivio che le sta accanto. Lancia se non legge. */
export function prossimaCard(percorsoCoda = CODA, { leggi = (p) => readFileSync(p, "utf8") } = {}) {
  const coda = leggi(percorsoCoda);
  return prossimoNumero(coda, testoArchivioDi(percorsoCoda, { leggi }));
}

function main() {
  const i = process.argv.indexOf("--coda");
  const percorso = i > 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : CODA;
  try {
    console.log(String(prossimaCard(percorso)));
  } catch (e) {
    console.error(`⚪ CIECO — non leggo la coda o il suo archivio (${e?.code ?? e?.message ?? e}): nessun numero, per non darne uno già speso.`);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
