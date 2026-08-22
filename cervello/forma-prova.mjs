#!/usr/bin/env node
// 📏 CHE FORMA DEVE AVERE UNA PROVA PER POTER CHIUDERE UN DIFETTO — una regola, una casa.
//
// PERCHÉ ESISTE (lotto 33, e l'ha pagato il lotto stesso). `auto-fix.mjs` — che chiude i difetti
// DOPO il merge — esegue solo `node cervello/<script>.mjs [--flag]`, e la restrizione è una difesa
// voluta: *un difetto non deve poter far girare codice arbitrario per dichiararsi risolto*. Ma
// quella regola viveva solo lì dentro, quindi il **cancello del lotto** poteva accettare una prova
// che il motore non sa eseguire. È successo: AR-409 e AR-226 sono stati consegnati con un comando
// che portava `--import`, il cancello l'ha lasciato passare, il merge è andato — e i due difetti
// sono rimasti aperti marcati «manuale», cioè in attesa di un umano che non sapeva di essere atteso.
//
// Due guardiani, due idee di cosa sia un comando valido, e il più severo senza voce prima del merge:
// è la malattia del lotto 33 («la regola vive in N posti e N-1 restano indietro») dentro il lotto 33.
//
// Sta in un file suo, minuscolo e SENZA DIPENDENZE, per una ragione pratica oltre che di principio:
// il cancello dev'essere eseguibile dentro un repo finto di quattro file, e importare tutto
// `auto-fix.mjs` per una riga di espressione regolare trascinerebbe dentro mezza macchina.
//
// 🟢 Funzioni pure: nessun I/O, nessun import.

/**
 * La forma ammessa. Due gruppi: ① lo script sotto `cervello/`, ② gli eventuali flag.
 * Niente caricatori (`--import`, `--require`), niente interprete diverso da node, niente shell:
 * ognuna di quelle strade farebbe eseguire codice scelto da chi scrive il difetto.
 */
export const FORMA_COMANDO_PROVA = /^node\s+(--test\s+)?(cervello\/[\w./-]+\.mjs)((?:\s+--[\w-]+)*)$/;

/**
 * ⚠️ `--test` È AMMESSO, ed è la clausola che mancava ad AR-559.
 *
 * Il conto, misurato il 13/8 e ancora vero il 22/8: 57 schede CHIUSE portano una prova che il
 * motore non sa eseguire, e quasi tutte per cinque caratteri — `node --test x` invece di `node x`.
 * Cioè comandi che funzionerebbero benissimo: quelle chiusure poggiano su prove che nessuno ha mai
 * fatto girare, ed è il verde che non prova niente, moltiplicato per 57.
 *
 * Perché ammetterlo non allarga il buco che questa forma difende. Il pericolo nominato qui sopra
 * sono i CARICATORI (`--import`, `--require`) e gli interpreti diversi: strade con cui chi scrive
 * una scheda farebbe eseguire codice di sua scelta. `--test` non carica niente — è il banco di
 * prova dentro Node, e il solo file che tocca è quello nominato subito dopo, che deve comunque
 * stare sotto `cervello/`. Nessuna shell, nessun interprete nuovo, nessun file in più.
 *
 * E il flag viene ESEGUITO, non tolto di mezzo: chi lancia la prova lancia esattamente il comando
 * che sta scritto sulla scheda. Un motore che silenziosamente esegue qualcosa di diverso da quello
 * che è scritto è la stessa bugia in un'altra stanza.
 */

/** Il prefisso da mettere PRIMA del percorso quando si esegue (oggi: solo `--test`, o niente). */
export function prefissoComando(comando) {
  const m = FORMA_COMANDO_PROVA.exec(String(comando || "").trim());
  return m && m[1] ? [m[1].trim()] : [];
}

/** Questo comando si può eseguire per chiudere un difetto? */
export function comandoAmmesso(comando) {
  return FORMA_COMANDO_PROVA.test(String(comando || "").trim());
}

/** Come si spiega il rifiuto, in un posto solo così i due guardiani dicono la stessa cosa. */
export const MOTIVO_COMANDO_NON_AMMESSO = "solo: node cervello/<script>.mjs [--flag]";
