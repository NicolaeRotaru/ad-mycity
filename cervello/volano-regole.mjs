// 🎡 VOLANO-REGOLE — cosa conta come prova che la macchina impara davvero.
//
// AR-177 (bloccante) + AR-180. Il segnale `loop_chiude` — quello che dice a Nicola «la macchina si
// controlla, impara e si corregge» — era costruito in modo da NON POTER MAI dire di no.
//
//   ① `prova_business` contava come prova anche le previsioni APERTE e gli esperimenti APERTI.
//   ② Un cancello hard del giro OBBLIGA a tenere sempre almeno un esperimento aperto.
//   ③ Quindi la condizione era vera per costruzione: bastava avere un'intenzione per dichiarare
//      chiuso il loop. Aprire una previsione non è chiuderla — è il contrario.
//
// E dall'altro lato (AR-180) la sonda contava come prova proprio le righe che `calibrazione.mjs`
// dichiara «previsioni non sono mai state»: 36 righe su 42 nate pescando il primo numero di una frase
// di diario. La sonda rifaceva il filtro a mano invece di riusare quello del modulo, e i due sono
// divergiti — di nuovo la stessa regola scritta in due posti.
//
// Qui la regola sta in UN posto, senza import, dove un test la esegue. La usano sia `calibrazione.mjs`
// sia `sonda-volano.mjs`: due copie di un metro non sono un metro.
//
// La distinzione che mancava, e che è il cuore del fix:
//   · `loop_vivo`   = c'è attività (qualcuno ha aperto qualcosa). Informativo.
//   · `loop_chiude` = almeno un atteso→reale è stato CHIUSO e misurato nella finestra. Questa è la prova.
// Chiamarle con lo stesso nome è ciò che ha reso il segnale incapace di dire di no.

/**
 * Le righe che previsioni non sono mai state.
 *
 * `metrica: "esito_loop"` è il marchio del ponte rotto: righe nate pescando il primo numero di una
 * frase di diario. Non si cancellano — la storia non si riscrive — ma non contano come previsioni.
 * Il ponte corretto scrive `esito_loop_numerico`, e quelle contano.
 *
 * Vive QUI e non in calibrazione.mjs perché ora la usano in due, e perché `calibrazione.mjs`
 * importata ESEGUE il suo CLI e riscrive la memoria (trovato costruendo questo lotto).
 */
export function nonEUnaPrevisione(e) {
  return e?.metrica === "esito_loop";
}

/**
 * Una previsione conta come prova di apprendimento?
 *
 * Non basta `stato === "azzeccata" | "mancata"`: vanno scartate anche le righe marcate banali, quelle
 * col sensore cieco (misurate da uno strumento che non vedeva), e quelle nate già chiuse — creato e
 * chiuso nello stesso istante non è una previsione, è un verbale scritto a posteriori.
 */
export function previsioneValida(e) {
  if (!e) return false;
  if (nonEUnaPrevisione(e)) return false;
  if (e.banale === true) return false;
  if (e.sensore_stato === "cieco") return false;
  if (e.stato !== "azzeccata" && e.stato !== "mancata") return false;
  if (e.creato && e.chiuso_il && e.creato === e.chiuso_il) return false; // nata già chiusa
  return true;
}

/**
 * La prova di business: SOLO cose chiuse e misurate. Le aperte non entrano.
 *
 * È il fix di AR-177. Prima qui dentro c'erano anche `previsioniAperteRecenti.length > 0` e
 * `esperimentiAperti.length > 0` — e siccome un cancello del giro obbliga a tenerne sempre uno
 * aperto, la condizione non poteva essere falsa nemmeno in teoria.
 */
export function provaBusiness({ calibrazionePiena = false, esperimentiMisurati = false } = {}) {
  return Boolean(calibrazionePiena || esperimentiMisurati);
}

/**
 * Il loop CHIUDE: c'è un tasso di applicazione > 0 E almeno una prova di chiusura vera.
 * Il tasso da solo non basta (AR-013: era un numero che l'LLM si scriveva da sé).
 */
export function loopChiude({ tasso = 0, provaBusiness: pb = false, provaArchitettura = false } = {}) {
  return Number(tasso) > 0 && Boolean(pb || provaArchitettura);
}

/**
 * Il loop è VIVO: qualcosa si muove, anche se ancora non si è chiuso niente.
 *
 * Serve a non buttare via l'informazione che le aperte portavano: dire «non chiude» quando ci sono
 * dieci previsioni aperte è vero ma incompleto, e un segnale incompleto viene ignorato. Solo, questo
 * non è la prova che la macchina impara — è la prova che ci sta provando.
 */
export function loopVivo({ intenzioniAperte = 0, provaBusiness: pb = false, provaArchitettura = false } = {}) {
  return Number(intenzioniAperte) > 0 || Boolean(pb || provaArchitettura);
}
