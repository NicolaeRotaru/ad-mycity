#!/usr/bin/env node
// ⏳ GATE IN ATTESA — «freno mai costruito» e «freno che aspetta un merge» sono due cose diverse.
//
// LA MALATTIA (AR-458). `gate-veri.mjs` guardava una lezione col campo `gate:`, non trovava il file
// del comando su QUESTO ramo, e gridava «gate orfano». Ma un test può benissimo esistere in una PR
// non ancora mergiata — è successo davvero il 30/7 su L-2026-0730-530, la cui `gate_nota` diceva
// per esteso «PR #635, non ancora su main» e che il guardiano non leggeva. Due stati opposti
// schiacciati in uno solo: uno è un debito legittimo, l'altro è un freno che non esiste.
//
// PERCHÉ CONTA. Un guardiano che grida al lupo si impara a ignorare, e il giorno in cui grida per un
// gate DAVVERO orfano nessuno lo ascolta più. Il costo non è il falso rosso di oggi: è il vero rosso
// di domani.
//
// PERCHÉ UN FILE A PARTE. Questa è la decisione, e deve stare dove una prova la può ESEGUIRE su una
// nota finta invece di cercarne la forma dentro `gate-veri.mjs`. Qui non si legge niente e non si
// chiama niente: entrano una nota, una data e l'ora di adesso, esce una classe.
//
// LA TERZA STRADA HA UN PREZZO, e sono due clausole:
//   ① l'attesa vuole il NUMERO DELLA PR. Un'attesa senza riferimento non si può verificare, quindi
//      è un'esenzione travestita — ed è la porta di AR-338.
//   ② l'attesa SCADE. Dopo `GIORNI_ATTESA_MAX` torna orfana, perché un'attesa senza fine è la stessa
//      esenzione, detta più lentamente. Una PR che non si mergia in tre settimane non è in coda: è
//      abbandonata, e la lezione è senza freno.
//
// La stessa distinzione vive già nel sorvegliante (classe `gate-in-attesa`, gravità media), ma là
// lavora sulle righe di un diff, non su una lezione. Questo file è la forma applicabile a un
// oggetto-lezione; l'AD dovrà far passare anche il sorvegliante di qui, o resteranno due copie.
//
// 🟢 Pura: niente I/O, niente rete, niente processi.

/** Quanto può durare un'attesa prima di tornare un debito rosso. Tre settimane: due sprint di merge. */
export const GIORNI_ATTESA_MAX = 21;

/** Il riferimento a una PR dentro una nota libera. `PR #635`, `pr#635`, `PR  #635`: tutti validi. */
const RIFERIMENTO_PR = /\bPR\s*#\s*(\d+)/i;

const GIORNO_MS = 86_400_000;

/**
 * Che cos'è un gate il cui file NON esiste su questo ramo.
 *
 * @param {{gateNota?:string, nato?:string, adesso?:number, giorniMax?:number}} arg
 *   `gateNota` la nota della lezione · `nato` quando la lezione è stata scritta (AAAA-MM-GG…) ·
 *   `adesso` l'ora iniettata (una decisione che legge l'orologio da sé non è provabile).
 * @returns {{classe:"gate-orfano"|"gate-in-attesa", bloccante:boolean, pr:number|null, giorni:number|null, motivo:string}}
 */
export function classificaGateAssente({ gateNota = "", nato = "", adesso = Date.now(), giorniMax = GIORNI_ATTESA_MAX } = {}) {
  const m = RIFERIMENTO_PR.exec(String(gateNota ?? ""));
  if (!m) {
    return {
      classe: "gate-orfano",
      bloccante: true,
      pr: null,
      giorni: null,
      motivo: "il file del gate non esiste su questo ramo e nessuna nota dice dove sarebbe: «non fatto» resta indistinguibile da «puntatore rotto»",
    };
  }
  const pr = Number(m[1]);
  const t = Date.parse(String(nato ?? "").slice(0, 10));
  if (Number.isNaN(t)) {
    // Un'attesa che non si sa quando è cominciata non può scadere mai: è l'esenzione perpetua.
    return {
      classe: "gate-orfano",
      bloccante: true,
      pr,
      giorni: null,
      motivo: `l'attesa della PR #${pr} non ha una data di inizio leggibile: un'attesa che non può scadere è un'esenzione travestita`,
    };
  }
  const giorni = Math.floor((adesso - t) / GIORNO_MS);
  if (giorni > giorniMax) {
    return {
      classe: "gate-orfano",
      bloccante: true,
      pr,
      giorni,
      motivo: `la PR #${pr} è dichiarata in attesa da ${giorni} giorni (il massimo è ${giorniMax}): non è in coda, è ferma — e la lezione resta senza freno`,
    };
  }
  return {
    classe: "gate-in-attesa",
    bloccante: false,
    pr,
    giorni,
    motivo: `il freno esiste nella PR #${pr}, non ancora su questo ramo (dichiarata ${giorni} giorni fa): conta come debito, non come difesa`,
  };
}

/**
 * La nota di una lezione, da qualunque campo la scriva chi la registra.
 * Un solo posto che sa i nomi possibili: due copie di questa scelta sono due guardiani che leggono
 * lezioni diverse dallo stesso file.
 * @param {object} lezione
 */
export function notaDelGate(lezione) {
  return String(lezione?.gate_nota ?? lezione?.gateNota ?? "");
}

/** La data di nascita di una lezione, coi due nomi che il registro usa davvero. */
export function nascitaDellaLezione(lezione) {
  return String(lezione?.nato ?? lezione?.data ?? "");
}
