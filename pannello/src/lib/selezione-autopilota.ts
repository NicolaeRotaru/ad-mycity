// AR-232 — quali azioni l'autopilota può eseguire da solo, e quali degrada.
//
// Perché questa funzione esiste come modulo puro e non come un `if` dentro `eseguiAutopilota`: la
// prima stesura la teneva nell'esecutore, e la prova che avrebbe dovuto proteggerla era **vacua per
// la rottura più importante**. Sostituendo `if (r.rischiosa)` con `if (false)` — cioè spegnendo il
// cancello e lasciando tutto il resto al suo posto — la prova restava verde: le stringhe c'erano
// ancora, la chiamata pure, solo che non decideva più niente.
//
// È la stessa forma dei difetti che questi lotti stanno curando (AR-127, AR-169, AR-272): la regola
// che vive dentro l'esecutore. Qui la regola esce dall'esecutore e diventa una funzione che si può
// eseguire su ingressi finti — così una prova la mette alla prova davvero, invece di guardarla.
//
// Le quattro condizioni del fix di AR-232:
//   (a) è 🟢                              ← livelloEffettivo
//   (b) il canale è auto-eseguibile       ← livelloEffettivo (il canale ALZA il colore)
//   (c) il destinatario è in allowlist    ← mani.ts, al momento dell'invio (AR-139)
//   (d) il testo non ha indicatori di rischio ← rischioDalContenuto
//
// Nessuna dipendenza oltre ai due moduli puri: niente rete, niente Supabase.

import { autoEseguibile } from "./livello-effettivo.ts";
import { rischioDalContenuto } from "./rischio-contenuto.ts";

export type AzioneSelezionabile = {
  id: string;
  titolo: string;
  testo: string;
  canale: string;
  livello: "verde" | "giallo" | "rosso" | "?";
};

export type Degradata<T> = { azione: T; motivo: string; indicatori: string[] };

/**
 * Divide le azioni già "non ancora decise" in quelle che la macchina può fare da sola e quelle che
 * degrada in coda con il motivo.
 *
 * Un'azione degradata NON è un errore: è il caso in cui l'etichetta diceva una cosa e il contenuto
 * ne dice un'altra. Va contata, perché il numero misura quanto spesso il colore auto-dichiarato
 * sbaglia — che è la domanda dietro tutto il difetto.
 */
export function selezionaAzioni<T extends AzioneSelezionabile>(azioni: T[]): { esegui: T[]; degradate: Degradata<T>[] } {
  const esegui: T[] = [];
  const degradate: Degradata<T>[] = [];
  for (const a of azioni || []) {
    // (a)+(b): colore e canale. Il canale è un fatto, il colore una dichiarazione.
    if (!autoEseguibile(a?.livello, a?.canale)) {
      degradate.push({ azione: a, motivo: "il canale porta fuori casa: serve la firma", indicatori: ["canale"] });
      continue;
    }
    // (d): il contenuto. L'unico parere indipendente da chi ha scritto la card.
    const r = rischioDalContenuto(`${a?.titolo ?? ""}\n${a?.testo ?? ""}`);
    if (r.rischiosa) {
      degradate.push({ azione: a, motivo: r.motivo, indicatori: r.indicatori.length ? r.indicatori : ["testo_illeggibile"] });
      continue;
    }
    esegui.push(a);
  }
  return { esegui, degradate };
}
