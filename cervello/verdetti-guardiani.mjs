#!/usr/bin/env node
// AR-291 — un guardiano si innesta nel giro solo con la sua condizione di promozione scritta accanto.
//
// Il difetto, misurato il 28/7: `agent-registry-check` diventava vincolo hard e `stampo-check`, due
// righe sotto, finiva in `| tail -6 || true`. Stesso giro, stesso preambolo, due destini: uno parlava
// al motore, l'altro parlava al vuoto. Non era una scelta — era il residuo di come erano stati
// aggiunti, uno alla volta, in momenti diversi.
//
// La cura non è «promuovi tutto»: alcuni guardiani DEVONO restare informativi (uno che oggi esce 1 su
// un debito noto bloccherebbe ogni giro; uno che misura il carico di firme di Nicola fermerebbe la
// macchina per una cosa che tocca a lui). La cura è che la scelta sia **dichiarata**: accanto a ogni
// guardiano informativo c'è scritto a quale condizione diventa un cancello, o perché non lo diventerà.
//
// Nessuna dipendenza e nessun I/O: si esegue su testo passato da fuori.

/** Gli script che portano un VERDETTO nel codice d'uscita. Gli altri (sensori, aggiornatori, contatori) no. */
// Riconoscere i guardiani DAL NOME è una regola che perde: `peso-contesto.mjs` (lotto 27) non
// combaciava con nessuna di queste forme, quindi sarebbe potuto entrare nel giro come riga
// informativa senza dover dire perché — esattamente il buco che AR-291 chiude. Finché il criterio è
// il nome, un guardiano nuovo con un nome fuori convenzione va aggiunto QUI insieme al suo innesto.
const RE_GUARDIANO = /node\s+"\$SCRIPT_DIR\/((?:[a-z-]+-check|guardiano-[a-z-]+|sonda-[a-z-]+|peso-contesto|cantiere-prove|prove-oneste|verifica-[a-z-]+))\.mjs"/;

/** L'esito buttato via: la pipe e poi `|| true`. */
const RE_SCARTATO = /\|\|\s*true\s*$/;

/** Le forme in cui una condizione di promozione è scritta davvero (o una rinuncia motivata). */
const RE_CONDIZIONE = /si promuove|non si promuove|promuove a cancello|diventa (?:un )?(?:vincolo|cancello|gate)|resta informativ|NON è un cancello/i;

/** Quante righe sopra si guarda per trovare la condizione: il commento che precede l'invocazione. */
export const RIGHE_DI_CONTESTO = 8;

/**
 * I guardiani che il giro esegue buttandone via l'esito, con l'indicazione se accanto c'è o no la
 * condizione di promozione. `dichiarato: false` è il difetto: una scelta presa e mai scritta.
 *
 * Una seconda invocazione dello STESSO guardiano il cui verdetto è già stato preso poche righe sopra
 * (`if ! node …`) non conta: lì il `|| true` è sulla stampa del dettaglio, non sul giudizio. È il caso
 * di `onesta-check`, e trattarlo come scartato avrebbe fatto scrivere una finta condizione di
 * promozione su una riga che è già un cancello.
 */
export function guardianiInformativi(testoGiro = "", { contesto = RIGHE_DI_CONTESTO } = {}) {
  const righe = String(testoGiro || "").split("\n");
  const trovati = [];
  righe.forEach((riga, i) => {
    if (/^\s*#/.test(riga)) return; // un'invocazione dentro un commento non gira
    const m = riga.match(RE_GUARDIANO);
    if (!m || !RE_SCARTATO.test(riga)) return;
    const finestra = righe.slice(Math.max(0, i - contesto), i);
    const giaPreso = finestra.some((r) => r.includes(`${m[1]}.mjs`) && !RE_SCARTATO.test(r) && !/^\s*#/.test(r));
    if (giaPreso) return;
    trovati.push({
      guardiano: m[1],
      riga: i + 1,
      dichiarato: RE_CONDIZIONE.test(finestra.join("\n")),
    });
  });
  return trovati;
}

/** Quelli senza condizione scritta: il difetto vero e proprio. */
export function senzaCondizione(testoGiro = "", opzioni) {
  return guardianiInformativi(testoGiro, opzioni).filter((g) => !g.dichiarato);
}
