#!/usr/bin/env node
// 🚧 IL TETTO COME REGOLA DEL CANCELLO, non come proprietà di una misura — AR-437.
//
// 🟢 Pura: nessun file, nessun processo, nessuna rete. Riceve quello che si sa già e risponde.
//
// IL DIFETTO CHE CHIUDE. Il cancello del lotto chiama quattro guardiani. Due (`prova-con-or`,
// `mutazione-mancante`) passano da un TETTO: il debito ereditato si conta, si vede e scende, mentre
// ciò che il lotto tocca ADESSO è blocco duro. Gli altri due (`prove-oneste`, `test-cervello`) il
// cancello li chiama e ne propaga il codice d'uscita secco — quindi un lotto sano non poteva
// consegnare finché non si ripuliva tutto il debito storico di qualcun altro.
//
// I cinque perché, fino in fondo: ① perché il cancello è rosso su un lotto sano? Perché quei due
// guardiani escono 1 sul debito. ② Perché escono 1 sul debito? Perché il debito lo contano tutto.
// ③ Perché il cancello non lo assorbe? Perché il tetto è scritto DENTRO la logica dei primi due.
// ④ Perché è scritto lì? Perché è nato come proprietà di quella misura, non come regola del cancello.
// ⑤ Quindi ogni guardiano agganciato dopo nasce senza tetto — e nascerà senza anche il prossimo.
//
// Qui la regola diventa UNA, e chiunque venga agganciato domani ci passa: è la differenza fra curare
// un caso e curare la classe. E il pericolo che cura non è il rosso: è il verde che si ottiene
// scavalcando un rosso — perché un cancello sempre rosso viene aggirato al secondo giro, e da quel
// momento non dice più niente nemmeno quando ha ragione.
//
// LE DUE MISURE, che restano due apposta:
//   · DEBITO ereditato → un tetto che scende e non risale. Si vede, si conta, non blocca.
//   · CIÒ CHE IL LOTTO TOCCA → blocco duro, sempre, anche sotto il tetto. Un test che questo lotto
//     ha scritto o modificato e che è rosso NON entra, e nessun tetto lo assolve.

/**
 * Il verdetto di un guardiano letto attraverso il suo tetto.
 *
 * @param {object} p
 * @param {number} p.codice      il codice d'uscita del guardiano (0 ok · 2 cieco · altro violazione)
 * @param {number|null} p.quanti quante violazioni ha misurato; `null` = non l'ho saputo contare
 * @param {number|null} p.tetto  il tetto dichiarato; `null` = mai dichiarato
 * @param {string[]|null} p.delLotto le violazioni attribuibili a ciò che il lotto tocca adesso;
 *                                   `null` = non so attribuirle (e allora NON assolvo)
 * @returns {{esito:"ok"|"cieco"|"violazione"|"debito", regola?:string, chi?:string[], motivo?:string, tettoDaDichiarare?:number}}
 */
export function verdettoConTetto({ codice, quanti = null, tetto = null, delLotto = null } = {}) {
  if (codice === 0) return { esito: "ok" };
  // Il cieco resta cieco, sempre e prima di tutto: un tetto non può assolvere una misura mai fatta.
  // Se lo facesse, «non ho guardato» diventerebbe indistinguibile da «ho guardato e va bene», che è
  // la bugia che l'intero contratto dei guardiani (AR-322) esiste per impedire.
  if (codice === 2) return { esito: "cieco" };

  // ① IL BLOCCO DURO viene prima del tetto. Una violazione che questo lotto ha creato non si
  // consegna nemmeno se il totale resta sotto il tetto: il tetto è per il debito di chi è venuto
  // prima, non per il lavoro di adesso.
  if (Array.isArray(delLotto) && delLotto.length) {
    return {
      esito: "violazione",
      regola: "del-lotto",
      chi: delLotto,
      motivo: `${delLotto.length} rosso/i che questo lotto tocca adesso (${delLotto.slice(0, 8).join(", ")}): nessun tetto li assolve — sono tuoi`,
    };
  }

  // ② NON SO CONTARE → non assolvo. Un guardiano che esce 1 e di cui non so leggere il numero resta
  // rosso: la scelta rischiosa presa dal ramo dell'ignoranza è come si costruisce un verde bugiardo.
  if (quanti === null) {
    return {
      esito: "violazione",
      regola: "non-contato",
      motivo: "il guardiano è rosso e non ho saputo contare quanto: senza un numero non c'è tetto che tenga",
    };
  }

  // ③ NON SO ATTRIBUIRE → non assolvo, per la stessa ragione. «Forse non è mio» non è «non è mio».
  if (delLotto === null) {
    return {
      esito: "violazione",
      regola: "lotto-sconosciuto",
      motivo: `${quanti} rosso/i e non so quali tocca questo lotto (nessun confronto possibile): non assolvo ciò che non ho potuto attribuire`,
    };
  }

  // ④ IL TETTO MAI DICHIARATO NON ASSOLVE, e questa è la scelta più importante del file.
  //
  // La strada comoda era «nasce alla misura di adesso», come fa `prova_debole`. Rifiutata, e il
  // controesempio è banale: rompo `cervello/foo.mjs`, che fa diventare rosso un test che non ho
  // toccato. Quel rosso non è nel perimetro del blocco duro (il file del test non l'ho scritto io),
  // e un tetto che nasce ogni volta alla misura di adesso se lo mangia in silenzio — ogni volta.
  // Curerei il cancello sempre rosso creando un cancello che non vede più le regressioni: un guaio
  // peggiore di quello di partenza, perché il primo si vede e il secondo no.
  //
  // Un tetto vale solo se è un numero FERMO, scritto una volta e da lì in giù. Finché non c'è, il
  // rosso resta rosso — ma adesso dice cosa manca per diventare un debito misurato, che è una riga
  // sola in tetti-lotto.json. Il meccanismo è pronto: manca il numero, e il numero lo si dichiara.
  if (tetto === null || tetto === undefined) {
    return {
      esito: "violazione",
      regola: "tetto-non-dichiarato",
      motivo:
        `${quanti} rosso/i, nessuno di questo lotto, ma il tetto non è mai stato dichiarato: senza un numero fermo non so ` +
        `distinguere il debito di ieri da una regressione di oggi, e non assolvo ciò che non so distinguere. ` +
        `Dichiaralo (tetti-lotto.json, oppure --aggiorna-tetti) e da lì scende e non risale`,
      tettoDaDichiarare: quanti,
    };
  }

  if (quanti > tetto) {
    return {
      esito: "violazione",
      regola: "oltre-il-tetto",
      motivo: `${quanti} rosso/i contro un tetto di ${tetto}: il debito si è allargato`,
    };
  }
  if (quanti < tetto) {
    return {
      esito: "debito",
      tettoDaDichiarare: quanti,
      motivo: `rossi scesi da ${tetto} a ${quanti}: abbassa il tetto con --aggiorna-tetti`,
    };
  }
  return { esito: "debito", motivo: `${quanti} rosso/i ereditati, nessuno di questo lotto (sotto il tetto)` };
}

/**
 * AR-678 — IL PERIMETRO DICHIARATO, quando l'albero è di più di un lotto.
 *
 * `git diff HEAD` risponde a «cosa è cambiato nell'albero», non a «cosa ho toccato IO». Finché una
 * sessione sola lavora su un tronco le due domande hanno la stessa risposta; con sei corsie che
 * scrivono insieme — com'è successo in questo lotto — ogni corsia si vede attribuito il lavoro di
 * tutte, e il blocco duro accusa l'una del rosso dell'altra. Non è un caso limite: è la condizione
 * normale del lavoro parallelo.
 *
 * L'unica risposta onesta è una dichiarazione: chi lavora dice quali file sono suoi, e il guardiano
 * interseca. Senza dichiarazione si torna a ciò che git sa — che è una sovrastima, mai una
 * sottostima: si blocca troppo, non troppo poco. Il verso conta: sbagliare per eccesso ferma un
 * lavoro sano (fastidioso, visibile), sbagliare per difetto lascia passare un rosso (silenzioso).
 *
 * @param {string|string[]|null|undefined} valore l'elenco dichiarato (env `LOTTO_PERIMETRO`, virgole
 *   o a-capo), oppure niente
 * @returns {string[]|null} i percorsi dichiarati, o `null` se nessuno ha dichiarato niente
 */
export function perimetroDichiarato(valore) {
  const pezzi = Array.isArray(valore) ? valore : String(valore ?? "").split(/[,\n]/);
  const puliti = pezzi.map((p) => String(p ?? "").trim()).filter(Boolean);
  return puliti.length ? [...new Set(puliti)].sort() : null;
}

/**
 * I file di test che questo lotto ha aggiunto o modificato — il perimetro del blocco duro.
 *
 * Pura sulla decisione: riceve gli elenchi che git ha già dato e non li chiede lei, così una prova
 * può metterla in ogni forma senza costruire un repo.
 *
 * `dichiarato` (AR-678) restringe a ciò che questa corsia dice di aver toccato. `null` = nessuno ha
 * dichiarato niente, e allora vale ciò che vede git: tutto l'albero, sovrastimando.
 */
export function testDelLotto(cambiati = [], nonTracciati = [], cartella = "cervello/test/", dichiarato = null) {
  const solo = dichiarato ? new Set(dichiarato) : null;
  const dentro = new Set();
  for (const f of [...cambiati, ...nonTracciati]) {
    const p = String(f || "").trim();
    if (!p.startsWith(cartella)) continue;
    if (solo && !solo.has(p)) continue;
    dentro.add(p);
  }
  return [...dentro].sort();
}

/** Gli id dei difetti che `prove-oneste` ha dichiarato sospetti (`  · AR-123 [grave] …`). */
export function idSospetti(uscita = "") {
  const ids = new Set();
  for (const r of String(uscita).split("\n")) {
    // Il `[` è ciò che separa un sospetto da un cieco: i ciechi si stampano `· AR-126: impossibile…`.
    const m = /^\s*·\s+(AR-\d+)\s+\[/.exec(r);
    if (m) ids.add(m[1]);
  }
  return [...ids];
}

/**
 * I file rossi o ineseguibili dichiarati da `test-cervello --json`, letti da UNA famiglia.
 *
 * 🐚 DUE FAMIGLIE, DUE NUMERI — AR-693, e non è cosmetica del referto.
 *
 * Fino al 26/8 questa funzione sommava i `.test.mjs` e i `.bats` in un elenco solo, e la somma
 * funzionava per un motivo che stava per sparire: **i `.bats` non li eseguiva nessuno**, quindi
 * uscivano tutti `non-eseguito` e non arrivavano mai nel conto. Dichiarato un esecutore
 * (`cervello/installa-bats.sh`), quelle ventinove prove hanno cominciato a girare per davvero e ne
 * sono uscite **dieci rosse, diciannove casi caduti** — invisibili da mesi, e tutte in codice che
 * nessun lotto di oggi ha toccato: worker.sh, giro.sh, i permessi.
 *
 * Sommarle al tetto dei test in Node (che è ZERO, e deve restare zero) renderebbe il cancello rosso
 * per sempre il giorno stesso in cui si smette di essere ciechi — cioè punirebbe chi ha tolto la
 * benda. Questa casa ha già il conto di cosa succede a un cancello che non può diventare verde: si
 * impara a saltarlo al secondo giro. Quindi il debito ereditato in bash si CONTA sotto un tetto che
 * scende e non risale (`test_bash` in tetti-lotto.json), mentre i rossi in Node restano blocco duro.
 *
 * Il ⚪ non è un rosso in nessuna delle due: una prova che nessuno ha fatto girare non è una prova
 * che fallisce, ed è dichiarata a parte.
 *
 * @param quale "node" (i .test.mjs) | "bash" (i .bats) | "tutte"
 */
export function testRossi(jsonUscita = "", quale = "node") {
  try {
    const j = JSON.parse(jsonUscita);
    const righe = quale === "bash" ? j.bats || [] : quale === "tutte" ? [...(j.test || []), ...(j.bats || [])] : j.test || [];
    return righe.filter((x) => x && x.esito !== "ok" && x.esito !== "non-eseguito").map((x) => x.file);
  } catch {
    return null; // non ho saputo contare → chi chiama non deve assolvere
  }
}

/** I file `.bats` rossi — il debito ereditato, quello con un tetto che scende. */
export function testRossiBash(jsonUscita = "") {
  return testRossi(jsonUscita, "bash");
}
