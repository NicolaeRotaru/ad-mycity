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
export const FORMA_COMANDO_PROVA = /^node\s+(cervello\/[\w./-]+\.mjs)((?:\s+--[\w-]+)*)$/;

/** Questo comando si può eseguire per chiudere un difetto? */
export function comandoAmmesso(comando) {
  return FORMA_COMANDO_PROVA.test(String(comando || "").trim());
}

/** Come si spiega il rifiuto, in un posto solo così i due guardiani dicono la stessa cosa. */
export const MOTIVO_COMANDO_NON_AMMESSO = "solo: node cervello/<script>.mjs [--flag]";
