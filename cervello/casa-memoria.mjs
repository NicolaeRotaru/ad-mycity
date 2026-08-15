// 🏠 CASA-MEMORIA — DOVE si scrive la memoria della macchina, e SE si scrive.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «la misura che sporca»
// ─────────────────────────────────────────────────────────────────────────────
// Uno strumento di sola lettura che scrive nella memoria vera. Il conto già pagato, con le mani in
// pasta: eseguire `conta-blocco-mancante.mjs` da un test ha sovrascritto il referto vero — le
// trascrizioni contate sono passate da 589 a 1, perché nell'ambiente di prova le trascrizioni non
// ci sono — e il file è tornato al suo posto solo con un `git checkout`.
//
// Tre effetti, e il terzo è il peggiore:
//   ① chi scrive una prova comportamentale su questa famiglia sporca la memoria condivisa a ogni corsa;
//   ② verificare costa un diff, quindi l'incentivo che nasce è NON verificare;
//   ③ l'albero sporco fa sembrare un lavoro quello che è solo una misura.
//
// ⚠️ PERCHÉ IL FRENO STA QUI E NON DENTRO OGNI SCRIPT. La cura ovvia — una variabile d'ambiente per
// ogni strumento, `BLOCCO_MANCANTE_FILE`, `SENTINELLA_DATI_STATE_FILE`, … — è quella che ha generato
// AR-668: `sentinella-dati.mjs` aveva la sua variabile, ma lanciava `tick-auto-coscienza-leggero.mjs`
// con `execFileSync`, e QUELLO riscriveva `apprendimento.json` senza ereditare niente. Poi il tick
// lanciava `esperimenti-check.mjs`, che riscriveva `auto-miglioramento.json` con un `writeFileSync`
// crudo: tre porte annidate, un freno solo sulla prima. **Un freno messo sulla porta che si è trovata
// lascia aperte quelle che non si sono viste.**
//
// Qui il freno sta sul DATO: la decisione è una funzione pura che guarda il PERCORSO, la chiama chi
// scrive davvero (`cervello/scrivi-json.mjs`), e i due interruttori sono variabili d'ambiente — che i
// processi figli ereditano da soli. Deviare la radice una volta devia anche il terzo script annidato,
// senza che nessuno debba saperlo.
//
// I due interruttori:
//   · `MYCITY_MEMORIA_ROOT=/tmp/…`   → la memoria si scrive lì invece che nel vault vero.
//   · `MYCITY_MEMORIA_SOLA_LETTURA=1` → la memoria non si scrive affatto. Un comando di lettura non
//     scrive, punto.
// Senza nessuno dei due, il comportamento è quello di sempre: la macchina vera scrive dove ha
// sempre scritto. Il freno è opt-in per chi misura, non un cambio di rotta per chi lavora.
//
// 🟢 Modulo PURO: nessuna lettura di file, nessuna scrittura, nessun programma che parte all'import.
// L'ambiente arriva come parametro, così una prova può metterlo come vuole senza toccare il proprio.

import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** La radice del repo, dedotta da dove sta questo file. Stessa deduzione di `git-github.mjs`. */
export const RADICE_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** I nomi delle variabili, dichiarati una volta sola: chi li cerca li trova con un grep del nome. */
export const ENV_RADICE = "MYCITY_MEMORIA_ROOT";
export const ENV_SOLA_LETTURA = "MYCITY_MEMORIA_SOLA_LETTURA";

/**
 * LE CARTELLE CHE SONO «MEMORIA DELLA MACCHINA».
 *
 * Elenco dichiarato e non dedotto, per la stessa ragione dei campi-timbro in `scrittura-misura.mjs`:
 * una regola che indovina cosa sia memoria devierebbe anche file che memoria non sono, e un freno che
 * scatta dove non deve si impara a spegnere.
 *
 *   · `MyCity-Vault`    — la memoria vera: STATO, decisioni, referti, registro dei fatti.
 *   · `memoria-squadra` — i quaderni dei reparti, dove finisce la chiusura del loop.
 */
export const CARTELLE_MEMORIA = ["MyCity-Vault", "memoria-squadra"];

/** Un interruttore d'ambiente acceso: `1`, `si`, `true`, `on`. Vuoto e assente valgono spento. */
function acceso(v) {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "si" || s === "sì" || s === "true" || s === "on";
}

/** `true` se chi gira ha chiesto di guardare senza toccare. */
export function modoSolaLettura(env = {}) {
  return acceso((env || {})[ENV_SOLA_LETTURA]);
}

/** La radice deviata dichiarata nell'ambiente, oppure `null`. */
export function radiceDeviata(env = {}) {
  const v = String((env || {})[ENV_RADICE] ?? "").trim();
  return v ? v : null;
}

/**
 * Il pezzo di percorso DENTRO la memoria, oppure `null` se quel percorso memoria non è.
 *
 * Si misura sulla radice VERA del repo apposta: una cartella finta in `/tmp/prova/MyCity-Vault/…`
 * costruita da un test non deve essere deviata altrove: quel test si è già fatto la sua sabbiera, e
 * dirottargliela sarebbe la cura che rompe il malato sano.
 *
 * @param {string} percorso il file che si sta per scrivere (assoluto o relativo alla radice).
 * @param {string} radice la radice del repo vero.
 * @returns {string|null} il percorso relativo alla radice (es. `MyCity-Vault/90-Memoria-AI/x.json`).
 */
export function pezzoDentroLaMemoria(percorso, radice = RADICE_REPO) {
  const p = String(percorso ?? "");
  if (!p) return null;
  const assoluto = isAbsolute(p) ? resolve(p) : resolve(radice, p);
  const rel = relative(resolve(radice), assoluto);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) return null; // fuori dal repo: non è roba nostra
  const primo = rel.split(sep)[0];
  return CARTELLE_MEMORIA.includes(primo) ? rel : null;
}

/**
 * ⭐ LA DECISIONE: questa scrittura dove va a finire, e va fatta?
 *
 * Le regole, nell'ordine in cui si applicano — l'ordine è parte della regola:
 *
 *   ① il percorso NON è memoria della macchina → si scrive dov'era, senza domande. Il freno non deve
 *      allargarsi: se toccasse anche i file di lavoro, un giro vero si ritroverebbe mezzo dirottato.
 *   ② `MYCITY_MEMORIA_SOLA_LETTURA` → non si scrive. Vale su ogni strumento e su ogni script che ne
 *      lanci un altro, perché l'ambiente lo ereditano i figli.
 *   ③ `MYCITY_MEMORIA_ROOT` → si scrive nella radice deviata, conservando lo stesso percorso interno.
 *      Stesso percorso interno e non un nome piatto: un referto che finisce accanto agli altri si può
 *      leggere e confrontare come nel vault vero.
 *   ④ altrimenti → la memoria vera, come è sempre stato.
 *
 * @param {string} percorso il file che si sta per scrivere.
 * @param {object} [p]
 * @param {object} [p.env] l'ambiente da cui leggere gli interruttori.
 * @param {string} [p.radice] la radice del repo vero.
 * @returns {{scrivi: boolean, percorso: string, deviato: boolean, memoria: boolean, motivo: string}}
 */
export function decidiDestinazione(percorso, { env = {}, radice = RADICE_REPO } = {}) {
  const dentro = pezzoDentroLaMemoria(percorso, radice);
  if (dentro === null) {
    return {
      scrivi: true,
      percorso: String(percorso ?? ""),
      deviato: false,
      memoria: false,
      motivo: "non è memoria della macchina: si scrive dov'era",
    };
  }
  if (modoSolaLettura(env)) {
    return {
      scrivi: false,
      percorso: String(percorso ?? ""),
      deviato: false,
      memoria: true,
      motivo: `${ENV_SOLA_LETTURA}: chi misura non scrive nella memoria, nemmeno per sbaglio`,
    };
  }
  const altrove = radiceDeviata(env);
  if (altrove) {
    return {
      scrivi: true,
      percorso: join(altrove, dentro),
      deviato: true,
      memoria: true,
      motivo: `${ENV_RADICE}: la memoria di questa corsa vive in una sabbiera, non nel vault vero`,
    };
  }
  return {
    scrivi: true,
    percorso: String(percorso ?? ""),
    deviato: false,
    memoria: true,
    motivo: "memoria vera: nessun interruttore acceso",
  };
}

/**
 * Il percorso su cui uno script deve lavorare, dato il suo posto DENTRO la memoria.
 *
 * È la porta per chi calcola il proprio file da sé (AR-446: «il percorso va INIETTATO, non
 * calcolato»): invece di `join(AD_ROOT, "MyCity-Vault/…")` si scrive `fileMemoria("MyCity-Vault/…")`,
 * e da quel momento quello script si può far girare su una sabbiera senza toccargli una riga.
 *
 * @param {string} relativo il percorso dentro il repo, es. `MyCity-Vault/90-Memoria-AI/x.json`.
 */
export function fileMemoria(relativo, { env = {}, radice = RADICE_REPO } = {}) {
  const vero = isAbsolute(relativo) ? relativo : join(radice, relativo);
  const d = decidiDestinazione(vero, { env, radice });
  return d.percorso;
}
