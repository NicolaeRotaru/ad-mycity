#!/usr/bin/env node
// riconcilia-perimetro.mjs — un commit mette dentro solo ciò che il suo messaggio dichiara.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// IL CASO VERO, 21/8 20:07. Il commit automatico del server diceva:
//
//     riconcilia: chiude difetti risolti nel codice
//
// e conteneva QUATTRO file. Uno era il cantiere, che è ciò che la riconciliazione chiude davvero.
// Gli altri tre erano saliti a bordo perché la riga che li metteva in staging era questa:
//
//     git add "$ac"        # $ac = tutta la cartella auto-coscienza
//
// Fra loro, `apprendimento.json` è passato da 531 lezioni a 529: due lezioni arrivate su main da
// altrettante richieste di unione firmate, cancellate da un commit che parlava d'altro. Confronto id
// per id: aggiunte 0, modificate 0, perse 2. Non una modifica — una sovrascrittura con uno stato
// vecchio, pubblicata sotto un nome che non era il suo.
//
// LA CAUSA, in una riga: `git add <cartella>` non mette in staging quello che il lavoro ha fatto,
// mette quello che nella cartella è sporco. Sono due cose diverse ogni volta che qualcos'altro ha
// scritto lì dentro — e su una macchina che gira in continuo, qualcos'altro scrive sempre.
//
// Non conta chi ha sporcato il file: conta che sporcarlo bastasse a pubblicarlo. Questo modulo
// toglie quel «bastava»: chi riconcilia mette in staging SOLO i file che la riconciliazione scrive
// (`cervello/auto-fix.mjs` ne scrive uno), e tutto il resto lo DICHIARA invece di portarselo dietro.
//
// Uso:
//   git status --porcelain <cartella> | node cervello/riconcilia-perimetro.mjs
//     stdout → i percorsi da mettere in staging, uno per riga (vuoto = niente da committare)
//     stderr → gli intrusi, con il perché
//   Uscita: 0 nessun intruso · 1 almeno un intruso (il chiamante logga, NON committa gli intrusi)

/**
 * I file che la riconciliazione ha il diritto di scrivere.
 * Due, e li ho contati leggendo il codice invece che a memoria: `cervello/auto-fix.mjs` scrive
 * `cantiere-difetti.json` (le schede) e `storico-salute.json` (la serie del voto). Avevo scritto
 * «uno solo» ed era falso — se n'è accorta la prova qui accanto, che li conta nel sorgente, PRIMA
 * che il perimetro troppo stretto arrivasse sul server a bloccare il lavoro giusto.
 *
 * Se un giorno auto-fix ne scriverà un terzo, quella prova diventa rossa e la lista cresce NELLO
 * STESSO lavoro. È il punto: allargare il perimetro resta un gesto visibile in una riga di codice,
 * invece di succedere da solo perché un altro processo ha toccato la cartella.
 */
export const SCRITTI_DALLA_RICONCILIAZIONE = Object.freeze(["cantiere-difetti.json", "storico-salute.json"]);

/** Il percorso che `git status --porcelain` riporta su una riga, senza il codice di stato. */
export function percorsoDellaRiga(riga) {
  if (!riga || riga.length < 4) return "";
  const resto = riga.slice(3).trim();
  if (!resto) return "";
  // I rinomini arrivano come «vecchio -> nuovo»: conta la destinazione, è quella che si committa.
  const freccia = resto.lastIndexOf(" -> ");
  const p = freccia === -1 ? resto : resto.slice(freccia + 4);
  return p.replace(/^"(.*)"$/, "$1"); // git cita i nomi con spazi o accenti
}

/**
 * Divide lo sporco in due: quello che questo commit può portare, e quello che deve solo dichiarare.
 * Pura: prende il testo di `git status --porcelain`, torna { miei, altrui }.
 */
export function partiziona(porcelain, ammessi = SCRITTI_DALLA_RICONCILIAZIONE) {
  const miei = [];
  const altrui = [];
  for (const riga of String(porcelain || "").split("\n")) {
    const p = percorsoDellaRiga(riga);
    if (!p) continue;
    const nome = p.split("/").pop();
    (ammessi.includes(nome) ? miei : altrui).push(p);
  }
  return { miei, altrui };
}

function main() {
  let dentro = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (c) => (dentro += c));
  process.stdin.on("end", () => {
    const { miei, altrui } = partiziona(dentro);
    for (const p of miei) console.log(p);
    if (altrui.length) {
      console.error(`⚠️  ${altrui.length} file sporchi che la riconciliazione NON scrive: restano fuori dal commit.`);
      for (const p of altrui) console.error(`     ${p}`);
      console.error(`   Li ha cambiati qualcun altro. Portarseli dietro sotto «chiude difetti risolti nel`);
      console.error(`   codice» è come li abbiamo persi il 21/8: due lezioni cancellate da un commit`);
      console.error(`   che parlava d'altro.`);
      process.exit(1);
    }
    process.exit(0);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) main();
