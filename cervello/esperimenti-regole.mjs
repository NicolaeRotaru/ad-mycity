// 🧪 ESPERIMENTI-REGOLE — quando un esperimento ha davvero reso conto, e quando ha solo detto di sì.
//
// AR-150. Nel registro degli esperimenti `stato: "misurato"` è una parola che il motore si scrive da
// solo. Il 15/8, sui quindici esperimenti veri, nove la portavano — e la loro stessa nota diceva
// un'altra cosa:
//
//   EXP-004 · stato "misurato" · nota: «MANCATA (non testata): il gate #post-meteo-pioggia-20lug non
//            è mai stato pubblicato». Cioè il post non è mai uscito, quindi l'ipotesi non è stata
//            respinta: non è mai stata provata.
//
// Un esperimento gated su un'azione 🔴 che Nicola non ha approvato scade a vuoto. Chiuderlo come
// «misurato» non è un errore di battitura: è il volano che si dà ragione da solo, perché a valle
// `sonda-volano.mjs` contava quel «misurato» come PROVA che la macchina impara.
//
// La distinzione che mancava, e che qui diventa eseguibile:
//   · **misurato**    — il gate è partito, il numero è stato letto, l'ipotesi ha vinto o perso.
//   · **non-testato** — il gate non è mai partito: non c'è nessun esito, solo una scadenza passata.
// Sono due cose diverse e chiamarle con lo stesso nome è ciò che ha reso il segnale incapace di dire
// di no. Un esperimento mai eseguito conta come intenzione, mai come apprendimento.
//
// Nessun import: qui c'è solo il ragionamento, così un test lo esegue sui dati veri.

/** Gli stati che il registro può portare, con `non-testato` che prima non esisteva. */
export const STATI_ESPERIMENTO = ["pianificato", "aperto", "non-testato", "misurato", "chiuso"];

/**
 * Le frasi con cui un esperimento confessa, nella sua stessa nota, che il gate non è mai partito.
 *
 * Sono le parole vere trovate nel registro il 15/8, non un elenco immaginato: «non testata», «mai
 * testata», «mai stato pubblicato», «mai partito», «mai inviat*», «mai eseguito», «scade a vuoto»,
 * «non ha mai ricevuto la parola di Nicola», «l'email non è mai partita».
 */
export const RE_GATE_MAI_PARTITO =
  /\b(non testat[ao]|mai testat[ao]|mai\s+(?:stat[oaie]\s+)?(?:pubblicat|inviat|partit|esegui|spedit|mandat)|mai ricevuto la parola|scade(?:va)? a vuoto)/i;

/** Il testo che l'esperimento racconta di sé: nota, delta e motivo, tutto insieme. */
export function raccontoEsperimento(exp) {
  if (!exp || typeof exp !== "object") return "";
  return [exp.nota, exp.delta, exp.motivo, exp.esito].filter((v) => typeof v === "string").join(" \n ");
}

/**
 * L'esperimento dice, con parole sue, che il gate non è mai scattato?
 *
 * Si legge il RACCONTO e non lo stato, perché è lo stato ad essere in discussione. È la stessa mossa
 * di AR-571: quando due campi dello stesso oggetto si contraddicono, comanda quello che descrive un
 * fatto accaduto, non quello che dichiara un'etichetta.
 */
export function gateMaiPartito(exp) {
  return RE_GATE_MAI_PARTITO.test(raccontoEsperimento(exp));
}

/**
 * Lo stato EFFETTIVO di un esperimento — quello che i suoi dati sostengono, non quello che dichiara.
 *
 * Solo `misurato`/`chiuso` possono essere smentiti: un `aperto` o un `pianificato` non promettono
 * niente e non c'è niente da smontare.
 */
export function statoEffettivo(exp) {
  const dichiarato = String(exp?.stato || "").trim() || "senza-stato";
  if (dichiarato !== "misurato" && dichiarato !== "chiuso") return dichiarato;
  if (gateMaiPartito(exp)) return "non-testato";
  return dichiarato;
}

/** Questo esperimento può contare come prova che la macchina impara? */
export function esperimentoProvaApprendimento(exp) {
  const s = statoEffettivo(exp);
  return s === "misurato" || s === "chiuso";
}

/** Gli esperimenti che si dichiarano misurati e non lo sono. L'elenco, non solo il numero. */
export function esperimentiNonTestati(esperimenti = []) {
  return (Array.isArray(esperimenti) ? esperimenti : []).filter((e) => statoEffettivo(e) === "non-testato");
}

/**
 * Il conto degli esperimenti per stato EFFETTIVO.
 *
 * `misurati` qui è più basso di prima ed è giusto così: prima quel numero comprendeva anche gli
 * esperimenti mai eseguiti, e finiva nel Pannello come se il volano girasse.
 */
export function contaEsperimenti(esperimenti = []) {
  const lista = Array.isArray(esperimenti) ? esperimenti : [];
  const per = { pianificato: 0, aperto: 0, "non-testato": 0, misurato: 0, chiuso: 0, altro: 0 };
  for (const e of lista) {
    const s = statoEffettivo(e);
    if (s in per) per[s] += 1;
    else per.altro += 1;
  }
  return {
    totale: lista.length,
    pianificati: per.pianificato,
    aperti: per.aperto,
    non_testati: per["non-testato"],
    misurati: per.misurato,
    chiusi: per.chiuso,
    altro: per.altro,
    // Il denominatore: fra gli esperimenti che si dichiarano finiti, quanti hanno davvero reso conto.
    resa: per.misurato + per.chiuso + per["non-testato"] > 0
      ? Math.round(((per.misurato + per.chiuso) / (per.misurato + per.chiuso + per["non-testato"])) * 100) / 100
      : null,
  };
}
