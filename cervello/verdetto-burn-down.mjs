// 📉 VERDETTO BURN-DOWN — «il cantiere sta calando davvero?», come DECISIONE e non come stampa.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE CURA (AR-703): un metro che non può fallire.
// ─────────────────────────────────────────────────────────────────────────────
// `salute-onesta.mjs` è lo strumento che risponde a «sto migliorando?»: conta i difetti aperti
// adesso e quelli aperti una settimana fa, e dice se il cantiere cala o cresce. Aveva tutto —
// shebang, contratto d'uscita, `process.exit` — tranne la cosa che rende un guardiano un guardiano:
// **qualcuno che lo esegua e che dia retta al suo verdetto**. Il numero c'era, il freno no. La sua
// uscita conosceva due valori soli, 0 («ho misurato») e 2 («non ho potuto guardare»): un cantiere
// che CRESCE usciva 0, cioè con la faccia del verde, e finiva stampato in una riga di console che
// non leggeva nessuno.
//
// PERCHÉ QUESTA DECISIONE VIVE IN UN FILE SUO. In `salute-onesta.mjs` il conto si fa al primo rigo:
// il modulo apre due file del vault appena lo importi. Una prova che volesse eseguire il giudizio
// su un cantiere finto non potrebbe — si ritroverebbe addosso il cantiere vero. Qui non si legge
// niente e non si chiama niente: entrano quattro numeri, esce un verdetto. Così un test può
// ESEGUIRE la decisione su un cantiere che peggiora, invece di cercare una parola dentro un file.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA REGOLA, e perché il margine cambia il verdetto invece di decorarlo
// ─────────────────────────────────────────────────────────────────────────────
// Il confronto col passato ha un'incertezza dichiarata (AR-671): le schede senza una data di
// nascita leggibile non si sanno collocare a «una settimana fa», e sono `margine`. Se la differenza
// fra allora e adesso è più piccola di quel margine, **la direzione non la so**: il cantiere
// potrebbe stare calando come stare crescendo. Chiamarlo verde sarebbe un verde comprato; chiamarlo
// rosso sarebbe accusare qualcuno di una cosa non misurata. C'è già la terza risposta di casa
// (AR-322): uscita 2 — non l'ho potuto misurare, che non è mai un verde.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun orologio, nessun `process.env`.

/** Il contratto d'uscita di questo verdetto — lo stesso di casa (AR-322). */
export const USCITA = { cala: 0, cresce: 1, cieco: 2 };

const intero = (n) => Number.isInteger(n);

/**
 * Il cantiere sta calando?
 *
 * @param {{letto?:boolean, apertiOra?:number|null, apertiSettimanaFa?:number|null, margine?:number|null}} conto
 *   `letto` = il cantiere si è lasciato leggere · `margine` = quante schede non so collocare a
 *   «una settimana fa» (AR-671), cioè di quanto può sbagliare il confronto.
 * @returns {{stato:"cala"|"cresce"|"fermo"|"incerto"|"cieco", peggiora:boolean, uscita:0|1|2,
 *            differenza:number|null, margine:number|null, detto:string}}
 */
export function giudicaBurnDown({ letto = false, apertiOra = null, apertiSettimanaFa = null, margine = null } = {}) {
  const cieco = (detto) => ({ stato: "cieco", peggiora: false, uscita: USCITA.cieco, differenza: null, margine: null, detto });

  // ① Il cantiere non si è lasciato leggere. Un errore di lettura non esce dalla porta con la
  //    faccia di uno zero: se dicessi «cala» qui, il giorno che il registro si rompe la macchina
  //    festeggerebbe.
  if (letto !== true) return cieco("non ho potuto leggere il cantiere dei difetti: senza quella lista non so dire se sta calando");
  if (!intero(apertiOra)) return cieco("non ho un numero di difetti aperti adesso: senza quello non c'è niente da confrontare");
  if (!intero(apertiSettimanaFa)) return cieco("non so quanti difetti erano aperti una settimana fa: il confronto non si può fare");
  // ② Il margine ASSENTE è cecità, non zero. «Non so di quanto posso sbagliare» e «non posso
  //    sbagliare» sono due frasi diverse, e la seconda scritta al posto della prima è il modo più
  //    comodo di comprare un verde.
  if (!intero(margine) || margine < 0)
    return cieco("non so di quanto può sbagliare il confronto con una settimana fa: senza quel margine non do un verdetto");

  const differenza = apertiSettimanaFa - apertiOra; // positivo = ne restano meno di prima, cioè bene
  const conto = (stato, uscita, detto) => ({ stato, peggiora: uscita === USCITA.cresce, uscita, differenza, margine, detto });
  const schede = (n) => `${n} ${n === 1 ? "difetto" : "difetti"}`;

  // ③ Fermo davvero: nessuna differenza e niente che non sappia collocare. Non è un progresso, ma
  //    non è un peggioramento: il freno scatta su chi PEGGIORA, non su chi non migliora abbastanza.
  if (differenza === 0 && margine === 0) {
    return conto("fermo", USCITA.cala, `il cantiere è fermo: ${schede(apertiOra)} aperti oggi, gli stessi di una settimana fa.`);
  }

  // ④ La differenza sta dentro l'incertezza: la direzione non la so. Terza risposta, non una delle
  //    due comode.
  if (Math.abs(differenza) <= margine) {
    return conto(
      "incerto",
      USCITA.cieco,
      `non so dire se il cantiere cala: fra oggi e una settimana fa ballano ${schede(Math.abs(differenza))}, ` +
        `ma ${margine} schede non hanno una data di nascita leggibile, quindi il confronto può sbagliare di più di così.`,
    );
  }

  // ⑤ Il caso per cui esiste questo file: il cantiere CRESCE, e adesso ha un codice d'uscita.
  if (differenza < 0) {
    return conto(
      "cresce",
      USCITA.cresce,
      `il cantiere CRESCE: ${schede(-differenza)} aperti in più rispetto a una settimana fa ` +
        `(${apertiSettimanaFa} allora, ${apertiOra} adesso). Si aprono più difetti di quanti se ne chiudono.`,
    );
  }

  return conto(
    "cala",
    USCITA.cala,
    `il cantiere cala: ${schede(differenza)} in meno rispetto a una settimana fa (${apertiSettimanaFa} allora, ${apertiOra} adesso).`,
  );
}
