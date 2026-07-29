#!/usr/bin/env node
// AR-168 · AR-172 · AR-173 · AR-169 · AR-170 — una previsione che nessuno può smentire non è una
// previsione: è una frase scritta dopo.
//
// Misurato il 28/7 sulle 42 voci del registro di calibrazione:
//
//   · **37 su 42** sono nate e morte lo stesso giorno. Il ponte `chiusura-loop → calibrazione` le
//     crea dalla riga ESITO, che contiene già l'atteso E il reale: chi le scrive conosce il
//     risultato mentre le scrive (AR-168).
//   · **42 su 42** non hanno una `baseline`. Senza il valore di partenza non si può dire se
//     «prevedo 0 ordini» sia una previsione o la fotografia di un numero fermo. Il filtro
//     anti-banalità leggeva le PAROLE; ne ha prese 3 (AR-172).
//   · **34 mancate su 34** non dicono perché. Un errore senza causa non insegna niente: si può
//     sbagliare la stessa cosa all'infinito e il registro cresce senza che nessuno impari (AR-169).
//   · **5** sono state chiuse dopo la finestra, tutte lo stesso giorno (26/7) in una passata di
//     recupero. La più vecchia scadeva il 17/7 ed è stata dichiarata azzeccata **nove giorni dopo**
//     (AR-173).
//   · `--fonte="conferma di Nicola"` chiude qualunque voce senza un riferimento verificabile. Oggi
//     nessuna la usa: la porta è aperta e nessuno ci è ancora passato (AR-170).
//
// Il conto che fa male: **8 azzeccate, di cui ZERO senza almeno uno di questi difetti.**
//
// ── La regola di disegno, imparata scrivendo questo file ─────────────────────
//
// Un'esclusione dal punteggio deve poter **solo abbassarlo**. Le `mancate` senza causa sono 34 su
// 34: toglierle dal conteggio farebbe salire la percentuale di centri: «pulire i dati» diventerebbe
// il modo più comodo per sembrare più bravi. Quindi la famiglia si divide in due, e la divisione non
// è estetica:
//
//   · **esclusioni dal punteggio** (nata-chiusa, banale, fuori-finestra, sensore cieco) — tolgono un
//     CENTRO che non era guadagnato. Direzione: il voto scende.
//   · **invarianti di scrittura** (causa sulla mancata, fonte umana verificabile) — non toccano il
//     voto, fanno fallire `valida` sulle voci NUOVE. Lo storico non si riscrive (AR-102): resta,
//     dichiarato e datato, e il vincolo lega da un taglio in avanti — così il cancello nasce verde e
//     prende la prima voce che sporca, invece di nascere rosso su 42 e venire spento in una settimana.
//
// ── Perché l'invariante sta sul DATO e non sulla porta ──────────────────────
//
// `cmdEsito` questi cancelli li ha già: pretende la fonte, il sensore, e da PZ-011 la causa su ogni
// mancata. Eppure nel registro **non c'è una sola causa, su 42 voci**. Il motivo è che `cmdEsito`
// non è l'unica porta: il ponte `da-loop` scrive diretto, e il 26/7 una passata di recupero ha
// chiuso cinque voci in blocco senza passare di lì. Finché il controllo vive nella porta, ne basta
// una nuova per aggirarlo — e una nuova porta si aggiunge sempre.
//
// Per questo l'invariante sta qui, sulla voce: chiunque l'abbia scritta, la regola è la stessa. È la
// stessa forma di AR-272 (il cancello al confine invece che dentro ogni esecutore), applicata al
// registro invece che alle uscite verso il mondo.
//
// Nessun orologio interno: la finestra si giudica contro le date della voce, così un test può
// eseguire queste decisioni su una voce finta. L'unico import è `ripartisci` da misura-parziale.mjs
// — anche lui puro e senza dipendenze — perché un conteggio che può perdere righe (AR-358) si cura
// una volta sola, nella forma, non in ogni punto che conta.

import { ripartisci } from "./misura-parziale.mjs";

/** Perché una voce non entra nel punteggio. Sono motivi, non un booleano: se ne può avere più d'uno. */
export const ESCLUSA = {
  NON_PREVISIONE: "non-una-previsione", // manca l'atteso o il reale: è una nota
  APERTA: "ancora-aperta", // non chiusa: non è né un centro né un errore
  SENSORE_CIECO: "sensore-cieco", // il reale l'ha misurato uno strumento che non vedeva
  BANALE: "banale", // l'atteso coincide col valore di partenza: prevedere che il fermo resti fermo
  NATA_CHIUSA: "nata-chiusa", // aperta e chiusa nello stesso giorno: il risultato era già noto
  FUORI_FINESTRA: "fuori-finestra", // misurata dopo la scadenza dichiarata
};

/** Perché una voce NUOVA non può essere scritta. Non tolgono punti: bloccano la scrittura. */
export const INVARIANTE = {
  SENZA_CAUSA: "mancata-senza-causa", // AR-169
  FONTE_NON_VERIFICABILE: "fonte-umana-senza-riferimento", // AR-170
};

/**
 * Le cause ammesse per una previsione mancata — le stesse tre che `cmdEsito` chiede già da PZ-011:
 * `modello` (il ragionamento era sbagliato) · `dato` (il dato di partenza era sporco) · `mondo` (è
 * successo qualcosa di esterno). Non sono nuove, e non devono esserlo: se questo file ne inventasse
 * altre, il cancello boccerebbe le voci scritte correttamente dalla porta principale.
 */
export const CAUSE_AMMESSE = ["modello", "dato", "mondo"];

const soloData = (x) => String(x || "").slice(0, 10);

/**
 * Il limite vero di una finestra scritta come data secca. `entro: 2026-07-16` significa «entro quel
 * giorno», quindi finisce alle 23:59 di quel giorno — non a mezzanotte.
 *
 * Non è pignoleria: la prima versione della misura di questo lotto contava 7 voci fuori finestra
 * perché confrontava con la mezzanotte, e una chiusa alle 10:05 del giorno di scadenza risultava in
 * ritardo. Le vere sono 5. Un metro storto sul difetto è un difetto in più, non uno in meno.
 */
export function fineFinestra(entro) {
  const m = String(entro || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59).getTime();
}

/** AR-168 — creata e chiusa lo stesso giorno: chi l'ha scritta conosceva già il risultato. */
export function nataChiusa(voce = {}) {
  const c = soloData(voce.creato);
  const k = soloData(voce.chiuso_il);
  return Boolean(c && k && c === k);
}

/**
 * AR-172 — la banalità si legge dai DATI, non dalle parole.
 *
 * `banale === true` resta valido: è la marcatura vecchia, fatta a mano, e buttarla via perderebbe
 * informazione vera. Ma quando c'è una `baseline` il giudizio non è più un'opinione: se l'atteso
 * coincide col valore di partenza, si stava prevedendo che il fermo restasse fermo.
 */
export function banale(voce = {}) {
  if (voce.banale === true) return true;
  if (voce.baseline == null || voce.atteso == null) return false;
  return Number(voce.baseline) === Number(voce.atteso);
}

/** AR-173 — misurata dopo la scadenza che si era data. Nove giorni dopo, il centro non è un centro. */
export function fuoriFinestra(voce = {}) {
  const limite = fineFinestra(voce.entro);
  if (limite == null || !voce.chiuso_il) return false;
  const chiusa = new Date(voce.chiuso_il).getTime();
  return Number.isFinite(chiusa) && chiusa > limite;
}

/**
 * AR-170 — «conferma di Nicola» non è una misura finché non dice DOVE.
 * Ammesso: l'id di una card della coda (`#qualcosa`) o una riga di DECISIONI con data e ora.
 */
export function fonteVerificabile(voce = {}) {
  const f = String(voce.fonte || "");
  if (!/nicola|umana|conferma/i.test(f)) return true; // fonte strumentale: la giudica sensore_stato
  return /#[a-z0-9][a-z0-9-]*/i.test(f) || /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(f);
}

/**
 * **La decisione.** Questa voce può contare come centro o come errore nel punteggio di un reparto?
 *
 * `nonPrevisione` arriva da fuori (`volano-regole.nonEUnaPrevisione`) per non avere due definizioni
 * della stessa cosa in due file: quando due posti decidono «cos'è una previsione» prima o poi
 * decidono diverso.
 */
export function contaNelPunteggio(voce = {}, { nonPrevisione = false } = {}) {
  const motivi = [];
  if (nonPrevisione) motivi.push(ESCLUSA.NON_PREVISIONE);
  if (voce.stato !== "azzeccata" && voce.stato !== "mancata") motivi.push(ESCLUSA.APERTA);
  // Il sensore vale come misura se vedeva (`ok`) o se è una fonte umana dichiarata (`n/d`).
  if (voce.sensore_stato !== "ok" && voce.sensore_stato !== "n/d") motivi.push(ESCLUSA.SENSORE_CIECO);
  if (banale(voce)) motivi.push(ESCLUSA.BANALE);
  if (nataChiusa(voce)) motivi.push(ESCLUSA.NATA_CHIUSA);
  if (fuoriFinestra(voce)) motivi.push(ESCLUSA.FUORI_FINESTRA);
  return {
    conta: motivi.length === 0,
    motivi,
    spiegazione: motivi.length ? `esclusa dal punteggio: ${motivi.join(", ")}` : "conta nel punteggio",
  };
}

/**
 * Gli invarianti di SCRITTURA. Non tolgono punti: dicono che una voce non doveva essere scritta così.
 *
 * `dalIso` è il taglio: prima di quella data lo storico è esente e dichiarato tale. Senza il taglio
 * il cancello nascerebbe rosso su 34 voci e verrebbe disattivato entro la settimana — è successo
 * abbastanza volte da essere una regola, non un timore.
 */
export function invarianteRotta(voce = {}, dalIso = null) {
  if (dalIso && soloData(voce.creato) && soloData(voce.creato) < soloData(dalIso)) return [];
  const rotte = [];
  if (voce.stato === "mancata" && !CAUSE_AMMESSE.includes(String(voce.causa || ""))) {
    rotte.push(INVARIANTE.SENZA_CAUSA);
  }
  if (!fonteVerificabile(voce)) rotte.push(INVARIANTE.FONTE_NON_VERIFICABILE);
  return rotte;
}

/**
 * AR-358 — **il conteggio di un reparto, con la somma che torna per costruzione.**
 *
 * Il difetto: `calibrazione.ricalcolaReparti` saltava le righe `esito_loop` con un `continue` messo
 * A MONTE dei contatori. Misurato il 29/7: registro di 42 righe, 36 `esito_loop`, e `per_reparto`
 * mostrava per tutti e 13 i reparti `previsioni: 0, escluse: 0…` — 36 righe sparite da ENTRAMBI i
 * contatori. Nessuno poteva accorgersene, perché niente pretendeva che la somma tornasse.
 *
 * La forma della cura conta più della cura: qui il chiamante non conta più niente a mano e non può
 * più «saltare» una voce. Dice solo IN QUALE classe va, e la somma delle classi È il totale.
 *
 * @param {any[]} voci le righe del registro di UN reparto
 * @param {{nonPrevisione?: (v:any)=>boolean}} opts
 * @returns {{righe:number, previsioni:number, azzeccate:number, escluse:number,
 *   non_previsioni:number, quadra:boolean, per_motivo:Record<string,number>}}
 */
export function conteggioReparto(voci = [], { nonPrevisione = () => false } = {}) {
  const perMotivo = {};
  const { totale, conteggi, quadra } = ripartisci(
    voci,
    (v) => {
      if (nonPrevisione(v)) return "non_previsioni";
      const g = contaNelPunteggio(v, { nonPrevisione: false });
      if (g.conta) return v?.stato === "azzeccata" ? "azzeccate" : "previsioni_mancate";
      const primo = g.motivi[0] || "esclusa";
      perMotivo[primo] = (perMotivo[primo] || 0) + 1;
      return "escluse";
    },
    ["azzeccate", "previsioni_mancate", "escluse", "non_previsioni"],
  );
  return {
    righe: totale,
    previsioni: conteggi.azzeccate + conteggi.previsioni_mancate,
    azzeccate: conteggi.azzeccate,
    escluse: conteggi.escluse,
    non_previsioni: conteggi.non_previsioni,
    per_motivo: perMotivo,
    // L'identità che mancava: previsioni + escluse + non_previsioni = righe del registro.
    quadra: quadra && conteggi.azzeccate + conteggi.previsioni_mancate + conteggi.escluse + conteggi.non_previsioni === totale,
  };
}

/**
 * Il punteggio onesto di un registro intero: quante contano davvero, e — voce per motivo — quante
 * sono state tolte e perché. Il denominatore non si nasconde: «8 centri» senza dire su quante voci
 * e quante escluse è lo stesso numero che ha permesso a questo difetto di vivere un mese.
 */
export function punteggioOnesto(registro = [], { nonPrevisione = () => false } = {}) {
  const escluse = {};
  let contano = 0;
  let centri = 0;
  for (const voce of registro) {
    const g = contaNelPunteggio(voce, { nonPrevisione: nonPrevisione(voce) });
    if (g.conta) {
      contano += 1;
      if (voce.stato === "azzeccata") centri += 1;
      continue;
    }
    // Un solo motivo per voce nel conteggio — il primo — altrimenti la somma dei motivi supera il
    // numero delle voci e il rapporto diventa illeggibile. L'elenco completo resta in `motivi`.
    const primo = g.motivi[0];
    escluse[primo] = (escluse[primo] || 0) + 1;
  }
  return {
    campione: registro.length,
    contano,
    centri,
    mancate: contano - centri,
    punteggio: contano > 0 ? Number((centri / contano).toFixed(2)) : null,
    escluse,
  };
}
