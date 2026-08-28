// AR-859 — «il posto dove dovevo guardare non c'è» NON è «ho guardato e non c'è niente».
//
// LA MALATTIA, in una riga: ventuno programmi di questa casa dichiaravano di aver trovato un
// problema (uscita 1) in un ramo dove non avevano guardato niente. Da fuori quei due stati sono
// indistinguibili, e chi legge va a riparare la cosa sbagliata — misurato su `giro.sh`, che a
// `test-cervello.mjs rc=1` risponde «TEST DEL CERVELLO ROSSI: uno o più file di test non passano»
// anche quando la cartella delle prove non esiste proprio: si va a leggere i test invece di
// riparare lo strumento (è la stessa cosa che dice il commento di AR-843 sopra quel blocco).
//
// IL CONTRATTO DI CASA (AR-322, scritto in `misura-o-cieco.mjs`, da cui qui si importano i nomi
// invece di ricopiarli — due contratti con gli stessi tre numeri sono due contratti che si
// allontanano):
//   0 = ho guardato, è a posto · 1 = ho guardato e ho TROVATO · 2 = NON HO POTUTO GUARDARE.
//
// LA REGOLA CHE SEPARA I DUE CASI, ed è tutta qui:
//
//   · **il posto non c'è** → ⚪ 2. La cartella, il registro, l'elenco su cui dovevo lavorare non
//     esiste: non ho esaminato una sola cosa, quindi non ho nessun reperto da consegnare.
//   · **il posto c'è ed è vuoto** → ❌ 1. Ho aperto e ho contato: zero. Lo zero È il reperto, e
//     spesso è il reperto grave («il cervello non ha rete», «non c'è nessun reparto»).
//   · **il posto c'è e non ho potuto contarlo** (permessi, lettura fallita) → ⚪ 2. Sono di nuovo
//     senza misura, e un buco non è uno zero.
//
// PERCHÉ UNA FUNZIONE E NON TRE `if`. La stessa decisione, scritta a mano in tre programmi, si è
// già sbagliata in tre modi diversi; e scritta dentro un `main` nessuna prova la può eseguire senza
// far partire tutto il programma — che è precisamente il motivo per cui la malattia è rimasta viva.
// Qui la decisione è una, pura, e i punti malati la CHIAMANO.
//
// 🟢 Nessun I/O, nessuna rete, nessun programma che parte all'import: si esegue in un test senza
// preparare niente.

import { CIECO, OK, ROTTO, codiceUscita } from "./misura-o-cieco.mjs";

/**
 * Che verdetto dare quando quello che cercavo non c'è: mancava il POSTO o mancava il CONTENUTO?
 *
 * @param {object} p
 * @param {boolean} p.postoCe il posto dove dovevo guardare esiste? (la cartella, il file, l'elenco)
 * @param {number|null} [p.trovati] quante cose ci ho trovato dentro. `null` = non ho potuto contarle.
 * @param {string} [p.dove] come si chiama il posto, per il messaggio (es. "cervello/test").
 * @param {string} [p.cerco] cosa ci cercavo, per il messaggio (es. "le prove del cervello").
 * @param {string} [p.reperto] la frase da usare quando lo zero è il reperto: è la notizia grave che
 *   il chiamante vuole dare («il cervello non ha rete»). Se manca, se ne compone una neutra.
 * @returns {{esito: "ok"|"cieco"|"rotto", codice: 0|1|2, perche: string, posto_ce: boolean, trovati: number|null}}
 */
export function verdettoPostoVuoto({ postoCe, trovati = null, dove = "", cerco = "", reperto = "" } = {}) {
  const nome = String(dove || "").trim();
  const cosa = String(cerco || "").trim() || "quello che cercavo";
  const suffisso = nome ? ` (${nome})` : "";

  // ⚪ ① il posto non c'è. Non ho aperto niente: qualunque cosa dicessi sul contenuto me la
  // starei inventando. È il ramo che tutta questa malattia sbagliava.
  if (!postoCe) {
    return esito(
      CIECO,
      `il posto dove dovevo cercare ${cosa}${suffisso} non c'è: non ho guardato niente, quindi non ho trovato niente`,
      { postoCe: false, trovati: null },
    );
  }

  // ⚪ ② il posto c'è ma non ho potuto contarlo. Un buco non è uno zero (è la stessa riga di
  // `fonte-numero.mjs`: un campo assente non è «zero token spesi»).
  const n = trovati === null || trovati === undefined ? null : Number(trovati);
  if (n === null || !Number.isFinite(n)) {
    return esito(CIECO, `${nome || "il posto"} c'è ma non sono riuscita a contare ${cosa}: non ho una misura`, {
      postoCe: true,
      trovati: null,
    });
  }

  // ❌ ③ il posto c'è ed è vuoto. Ho aperto, ho contato, il conto è zero: QUESTO è un reperto, e
  // travestirlo da ⚪ sarebbe la malattia opposta — un guardiano che fa sparire un'accusa vera
  // dicendo «non ho potuto guardare».
  if (n === 0) {
    return esito(ROTTO, reperto ? String(reperto) : `ho guardato in ${nome || "quel posto"}: ${cosa} non c'è. Lo zero è il reperto.`, {
      postoCe: true,
      trovati: 0,
    });
  }

  return esito(OK, `${n} ${cosa} in ${nome || "quel posto"}`, { postoCe: true, trovati: n });
}

function esito(nome, perche, { postoCe, trovati }) {
  return { esito: nome, codice: codiceUscita(nome), perche, posto_ce: postoCe, trovati };
}

/**
 * La riga che un programma stampa uscendo, perché tutti e tre dicano la stessa cosa con le stesse
 * parole: un referto ⚪ che ogni strumento scrive a modo suo è un referto che nessuno impara a
 * riconoscere.
 */
export function rigaReferto(v) {
  const segno = v.codice === 2 ? "⚪" : v.codice === 1 ? "❌" : "✅";
  const targa = v.codice === 2 ? " (AR-859: 2 = non ho potuto misurare, NON è un verde e NON è un rosso)" : "";
  return `${segno} ${v.perche}${targa}`;
}
