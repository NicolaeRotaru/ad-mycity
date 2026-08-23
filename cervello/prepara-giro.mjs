#!/usr/bin/env node
// 🎒 IL BAGAGLIO DEL GIRO — quello che il workflow non può leggersi da solo.
//
// AR-780. `.claude/workflows/giro-operativo.js` aveva bisogno di due cose che si ricavano leggendo
// il repo: CHI va in turno oggi (`turnoDelGiro`) e i FATTI vivi del registro (`fattiVivi`). Le
// calcolava importandole — e il motore dei workflow non accetta nessun import, quindi quello script
// non è mai partito. Da due mesi.
//
// Il rimedio non è aggirare il motore: è calcolarle QUI, dove il disco si legge, e passarle al
// workflow come `args`. Lo stesso codice di prima, spostato dove può girare davvero.
//
// 🟢 Sola lettura: legge i mansionari e il registro dei fatti, non scrive niente.
//
// Uso:
//   node cervello/prepara-giro.mjs           -> il JSON da passare come `args` del workflow
//   node cervello/prepara-giro.mjs --umano   -> la stessa cosa in una riga leggibile

import { pathToFileURL } from "node:url";
import { FATTI_DEL_GIRO, fattiVivi, radiceRepo } from "./prompt-senior.mjs";
import { turnoDelGiro } from "./turno-senior.mjs";

/**
 * Il bagaglio, come funzione pura di ciò che sta sul disco: una prova la può eseguire senza far
 * partire niente. Torna sempre lo stesso oggetto, anche quando qualcosa manca — e allora lo dice
 * nel campo `cieco` invece di consegnare un turno vuoto travestito da turno.
 */
export function bagaglioDelGiro({ radice = radiceRepo() } = {}) {
  const cieco = [];
  let turno = [];
  let copertura = {};
  try {
    ({ turno, copertura } = turnoDelGiro({ radice }));
  } catch (e) {
    cieco.push(`turno non calcolabile: ${e.message}`);
  }
  let fatti = null;
  try {
    fatti = fattiVivi(FATTI_DEL_GIRO, radice);
  } catch (e) {
    cieco.push(`fatti vivi non leggibili: ${e.message}`);
  }
  return { turno: turno || [], copertura: copertura || {}, fatti, cieco };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const b = bagaglioDelGiro();
  if (process.argv.includes("--umano")) {
    console.log(
      `🎒 in turno ${b.turno.length} senior su ${b.copertura.senior ?? "?"}` +
        ` · fatti vivi: ${b.fatti ? Object.keys(b.fatti).length : 0}` +
        (b.cieco.length ? `\n⚪ non ho potuto misurare: ${b.cieco.join(" · ")}` : ""),
    );
  } else {
    console.log(JSON.stringify(b, null, 2));
  }
  // Un turno vuoto NON è un giro senza lavoro: è un bagaglio che non si può consegnare. Chi lancia
  // il workflow deve accorgersene qui, non scoprirlo da un giro che propone niente.
  process.exit(b.turno.length ? 0 : 1);
}
