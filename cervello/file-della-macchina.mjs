#!/usr/bin/env node
// 📓 I FILE CHE LA MACCHINA RISCRIVE DA SOLA — una casa sola per l'elenco dichiarato.
//
// PERCHÉ ESISTE. Questi percorsi vivevano dentro `git-pr.mjs` come due costanti private. Quando il
// 30/7 è nato `ramo-pulito.mjs` — il freno delle ventuno correzioni sui conflitti di PR — la
// tentazione era ricopiarli: due elenchi della stessa cosa in due file, che è il modo garantito di
// vederli divergere al primo aggiornamento. Stanno qui, e li leggono entrambi.
//
// COSA SONO. Non è «la lista dei file da ignorare»: è l'elenco DICHIARATO, quello che sappiamo per
// esperienza pagata. `ramo-pulito.mjs` lo usa come SEME e ci somma quello che deduce dalla storia di
// `origin/main` (chi ha scritto cosa negli ultimi giorni). Servono tutti e due, e il 30/7 si è visto
// perché: la sola deduzione non copriva `apprendimento.json` — che il worker riscrive a ogni giro,
// ma che quel giorno avevo toccato anche io a mano, quindi non risultava «solo automatico». Cioè
// proprio il file di una delle lezioni da cui il freno è nato. Un elenco chiuso invecchia; una
// deduzione da sola ha buchi; insieme reggono.

/**
 * Riscritti dal worker a ogni giro. Non vanno nel commit automatico di una PR: generano il
 * conflitto ricorrente che Nicola ha segnalato ventuno volte.
 */
export const RISCRITTI_DAL_WORKER = [
  "cervello/routing.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/sentinella-dati.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json",
];

/**
 * La descrizione PR condivisa fra TUTTE le PR: come output di scrittura, mai come input.
 * Il rebase la risolve con la versione di main — cioè con la descrizione della PR precedente,
 * silenziosamente (L-2026-0718-273).
 */
export const CORPO_PR_CONDIVISO = "consegne/tech/pr-ad-mycity-body.md";

/** Il seme completo: ciò che sappiamo già, prima ancora di guardare la storia. */
export const SEMI_DIARIO = [...RISCRITTI_DAL_WORKER, CORPO_PR_CONDIVISO];
