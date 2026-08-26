// 🎯 QUALI MUTAZIONI FAR GIRARE — AR-835.
//
// IL DIFETTO, misurato il 26/8/2026 sul lotto 63 di questo stesso ramo.
//
// Il banco delle mutazioni (`cervello/non-vacuita.mjs`) è il controllo più prezioso del metodo: è
// l'unico che misura se gli ALTRI controlli servono a qualcosa. Rompe il fix apposta e pretende
// che la prova diventi rossa. Il cancello del lotto lo lancia solo sulle mutazioni «del lotto», e
// il commento accanto a quella riga lo diceva già a chiare lettere: «rompere quelle di trenta
// lotti a ogni consegna costerebbe minuti, e un controllo che si impara a saltare è già spento».
//
// L'intenzione era giusta. Sbagliato era il metro con cui si riconosceva «il lotto»: le SCHEDE
// toccate, non il CODICE toccato. Sono due cose diverse, e si separano nel caso più comune che
// esista qui dentro — il lotto che CHIUDE le schede riparate dal lotto prima.
//
// IL CONTO. Il lotto 63 ha cambiato quattro file, tutti di memoria: nessuna riga di codice.
// Schede toccate: venticinque (ventidue chiusure più tre blocchi dichiarati). Il cancello ha
// preso quelle venticinque schede, ha trovato le loro OTTANTACINQUE mutazioni sparse su
// ventinove file di codice che questo lotto non ha sfiorato, e ha cominciato a romperli uno per
// uno. Ogni mutazione fa girare una suite. A quindici minuti il passo ha sbattuto contro il suo
// tetto di tempo ed è uscito rosso; il runner ha poi dovuto ammazzare cinquecento processi node
// rimasti orfani. Corsa: 25,2 minuti contro gli 8,1 della stessa mattina.
//
// PERCHÉ È GRAVE E NON SOLO LENTO. Il cancello non poteva più diventare verde — e la macchina ha
// già scritto, in cima a `.github/workflows/cancello-lotto.yml`, che cosa succede allora: «un
// cancello sempre rosso viene aggirato al secondo giro, ed è peggio di non averlo». Peggio
// ancora, il freno colpiva esattamente il comportamento che la macchina ha l'ordine di
// massimizzare: chiudere almeno quanto si apre. Più schede chiudi, più lungo diventa il cancello,
// finché non ce la fa più.
//
// LA CURA. Il perimetro segue il CODICE, non le schede. Una mutazione si fa girare quando questo
// lotto ha cambiato il file che rompe, oppure quando ha scritto o cambiato la prova che quella
// mutazione deve far diventare rossa. Tutto il resto misurerebbe due volte contenuto identico:
// stesso file, stessa prova, stessa risposta di ieri.
//
// ⚠️ NON È UN'ASTICELLA ABBASSATA, e la differenza sta in due punti che vanno letti insieme:
//   ① il nuovo metro trova anche cose che il vecchio PERDEVA — una mutazione il cui file questo
//      lotto ha cambiato entra nel perimetro anche se la sua scheda nessuno l'ha toccata, e prima
//      no;
//   ② quando non si sa quali file il lotto ha cambiato, il perimetro NON si stringe: si allarga a
//      tutte le mutazioni delle schede toccate, cioè al comportamento di prima. Un cieco allarga,
//      non stringe. È la stessa regola dell'exit 2 del cancello: ciò che non ho misurato non lo
//      chiamo verde.
// E ciò che resta fuori non sparisce in silenzio: `saltate` porta con sé il motivo, e chi chiama
// deve dichiararlo (il cancello lo stampa fra gli avvisi). Un taglio non dichiarato si legge come
// «ho guardato tutto», ed è la bugia che questo file esiste per non raccontare.
//
// Prova comportamentale: `node cervello/test/perimetro-mutazioni.test.mjs`.

/** Gli id nominati da una voce di `mutanti.json`: il campo `difetto` può accorparne più d'uno («AR-239+AR-264»). */
export function idDellaMutazione(m) {
  return String(m?.difetto || "").match(/AR-\d+/g) || [];
}

/**
 * Le mutazioni che questo lotto deve far girare, e quelle che lascia fuori col loro perché.
 *
 * Pura: riceve ciò che si sa già e non chiede niente a git, così una prova può metterla in tutti
 * i suoi stati senza costruire nessun repo.
 *
 * @param {object} p
 * @param {Array|null}  p.mutanti       le voci di mutanti.json, o null se illeggibile
 * @param {string[]|null} p.toccati     le schede su cui il lotto ha lavorato, o null se non lo so
 * @param {string[]|null} p.proveCambiate le schede la cui `verifica` questo lotto ha scritto o cambiato
 * @param {string[]|null} p.fileCambiati i file che il lotto ha cambiato, o null se non lo so
 * @returns {{girare: Array, saltate: Array<{mutazione: object, motivo: string}>, difetti: string[], cieco: boolean, motivo: string|null}}
 */
export function mutazioniDaGirare({ mutanti = null, toccati = null, proveCambiate = null, fileCambiati = null } = {}) {
  const vuoto = (motivo) => ({ girare: [], saltate: [], difetti: [], cieco: true, motivo });
  if (!mutanti) return vuoto("mutanti.json non è leggibile: non so quali mutazioni esistano");
  if (toccati === null) return vuoto("non so quali difetti tocca questo lotto: nessun ramo pubblicato con cui confrontarmi");

  const suSchedeToccate = mutanti.filter((m) => idDellaMutazione(m).some((id) => toccati.includes(id)));

  // Cieco sui file → si torna al perimetro largo di prima. Mai il contrario.
  if (fileCambiati === null) {
    return {
      girare: suSchedeToccate,
      saltate: [],
      difetti: [...new Set(suSchedeToccate.flatMap(idDellaMutazione))],
      cieco: false,
      motivo: "non so quali file ha cambiato questo lotto: faccio girare tutte le mutazioni delle schede toccate — un cieco allarga, non stringe",
    };
  }

  const cambiati = new Set(fileCambiati);
  const proveSue = new Set(proveCambiate || []);
  const girare = [];
  const saltate = [];
  for (const m of mutanti) {
    const ids = idDellaMutazione(m);
    const suoFile = cambiati.has(m?.file);
    const suaProva = ids.some((id) => proveSue.has(id));
    if (suoFile || suaProva) {
      girare.push(m);
      continue;
    }
    if (!ids.some((id) => toccati.includes(id))) continue; // di un altro lotto: non è roba mia, non la conto
    saltate.push({
      mutazione: m,
      motivo: `${m?.file}: questo lotto non ha cambiato né quel file né la prova di ${ids.join("+") || "questa scheda"}`,
    });
  }

  return { girare, saltate, difetti: [...new Set(girare.flatMap(idDellaMutazione))], cieco: false, motivo: null };
}

/**
 * La riga da dichiarare quando qualcosa è rimasto fuori dal perimetro, o `null` se non è rimasto
 * niente. Sta qui e non nel cancello perché è la seconda metà della stessa decisione: chi
 * restringe deve dire che cosa ha lasciato indietro, e le due cose non devono poter divergere.
 */
export function rigaDelleSaltate(saltate = []) {
  if (!saltate.length) return null;
  const file = [...new Set(saltate.map((s) => s.mutazione?.file).filter(Boolean))];
  const quante = saltate.length;
  return (
    `${quante} mutazion${quante === 1 ? "e" : "i"} delle schede toccate non ${quante === 1 ? "è girata" : "sono girate"}: ` +
    `questo lotto non ha cambiato né i loro file (${file.slice(0, 4).join(", ")}${file.length > 4 ? `, +${file.length - 4}` : ""}) ` +
    "né le loro prove — la loro misura resta quella dell'ultimo lotto che li ha toccati"
  );
}

/**
 * Il perimetro a partire da ciò che git ha saputo dire, cioè l'uscita di `fileToccatiDaGit`.
 *
 * Esiste per una ragione sola, e sta tutta in una riga: la traduzione «git non ha risposto del
 * tutto → non stringere». Lasciata nel cancello sarebbe una riga che nessuna prova esegue, e una
 * decisione che nessuna prova esegue è esattamente la forma di difetto che questo repo continua a
 * trovarsi addosso. Qui invece la mutazione che la rovescia fa diventare rossa la prova.
 *
 * @param {{mutanti: Array|null, toccati: string[]|null, proveCambiate: string[]|null, daGit: {file: string[], ciechi: string[]}|null}} p
 */
export function perimetroDalGit({ mutanti = null, toccati = null, proveCambiate = null, daGit = null } = {}) {
  // Nessuna risposta, o una risposta parziale (`ciechi` non vuoto), valgono lo stesso: non lo so.
  const fileCambiati = daGit && !daGit.ciechi?.length ? daGit.file : null;
  return mutazioniDaGirare({ mutanti, toccati, proveCambiate, fileCambiati });
}
