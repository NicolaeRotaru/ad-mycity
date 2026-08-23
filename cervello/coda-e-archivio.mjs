#!/usr/bin/env node
// 🗄️ LE DUE CASE DELLE CARD — dove vivono le carte della coda, adesso che sono due file. 🟢 Sola lettura.
//
// Dal 23/8 (AR-807, clausola a) le carte chiuse non stanno più in fondo a `AZIONI-IN-ATTESA.md`: la
// pulizia le porta in `Archivio/AZIONI-CHIUSE.md`. La coda tiene solo quello che aspetta una firma,
// e torna dentro il campo visivo del controllo che la legge.
//
// PERCHÉ QUESTO FILE ESISTE, ed è la lezione del 22/8. Quel giorno ho spostato le carte chiuse e ho
// rotto due prove: cercavano una carta nella coda, e la carta non era più lì. Il rimedio non è
// «ricordarsi di guardare anche nell'altro file» — è che ci sia UN posto solo dove è scritto quali
// sono le case, così chi cerca una carta non deve saperlo. Un elenco che si tiene a mente è un
// elenco che prima o poi qualcuno non tiene a mente.
//
// LA REGOLA DI CHI CERCA. Chi vuole le carte APERTE legge la coda e basta: è la domanda giusta, e
// dopo lo spostamento è anche l'unica risposta possibile. Chi cerca una carta per NOME — perché
// vuole sapere se una domanda è stata fatta, o com'è finita — deve guardare in tutte e due, perché
// una carta si sposta di casa il giorno che riceve risposta.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

export const CODA = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
export const ARCHIVIO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-CHIUSE.md");

/** Le due case, in ordine: prima quello che aspetta, poi quello che ha già avuto risposta. */
export const CASE = [CODA, ARCHIVIO];

/**
 * Il testo di tutte e due, cucito. Serve a chi cerca una carta per nome.
 *
 * Un file che non si legge NON diventa una stringa vuota silenziosa: finisce in `mancanti`, così chi
 * chiama può distinguere «la carta non c'è» da «non ho potuto guardare in una delle due case».
 */
export function testoDelleDueCase({ leggi = (p) => readFileSync(p, "utf8"), case: dove = CASE } = {}) {
  const pezzi = [];
  const mancanti = [];
  for (const p of dove) {
    try {
      pezzi.push(leggi(p));
    } catch {
      mancanti.push(p);
    }
  }
  return { testo: pezzi.join("\n\n"), mancanti, lette: pezzi.length };
}
