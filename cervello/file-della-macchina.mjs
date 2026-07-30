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

/**
 * 📋 I REFERTI CHE UN GUARDIANO RIGENERA. Non sono memoria da difendere: sono l'uscita di un
 * comando. Chi vuole la versione buona non la recupera da un ramo — rilancia il guardiano.
 *
 * PERCHÉ SONO UN ELENCO A PARTE, e non dentro `SEMI_DIARIO`. Sono **file contesi**: la storia di
 * `origin/main` dice che negli ultimi 7 giorni li hanno toccati sia i commit automatici sia le mani
 * (AZIONI 6 commit/2 automatici, storico-salute 10/5, coerenza-fatti 28/10). `ramo-pulito.mjs` per
 * regola dichiarata NON blocca i contesi — «quelli si risolvono col rebase, non con un freno
 * all'apertura» — e ha ragione: ogni lotto del cantiere rilancia `cantiere-prove.mjs` e riscrive il
 * suo referto, quindi metterli fra i semi farebbe gridare il freno a ogni singolo lotto. Il posto
 * dove si risolvono è il rebase, ed è lì che questo elenco viene usato.
 *
 * COSA GARANTISCE che tenere la versione di `main` non perda niente: ognuno di questi ha un comando
 * che lo riscrive da zero (`salute.mjs`, `cantiere-prove.mjs`, `coerenza-fatti.mjs`,
 * `stampo-check.mjs`, e per lo storico i sensori che lo appendono). La copia che un ramo di codice
 * si porta dietro è il referto di quando quel ramo è nato: vecchio per costruzione.
 *
 * ⚠️ Qui NON entrano i file di contenuto — AZIONI-IN-ATTESA.md e BACHECA.md. Quelli portano azioni
 * in coda e decisioni: nessuno dei due lati è «l'uscita di un comando», e sceglierne uno da soli
 * vorrebbe dire cancellare in silenzio un'azione che Nicola deve firmare. Su quelli il rebase si
 * FERMA e nomina i file (vedi `git-pr.mjs`).
 */
export const REFERTI_RIGENERATI = [
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-prove.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-fatti.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/stampo-check.json",
];

/** Il seme completo: ciò che sappiamo già, prima ancora di guardare la storia. */
export const SEMI_DIARIO = [...RISCRITTI_DAL_WORKER, CORPO_PR_CONDIVISO];
