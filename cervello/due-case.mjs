#!/usr/bin/env node
// 🏠🏠 DUE CASE — un passo del cancello vive in due posti, e il secondo nessuno lo prova.
//
// IL DIFETTO VERO CHE CHIUDE: **un controllo nuovo entra nel cancello senza che nessuno lo abbia
// mai visto girare nella casa in cui girerà davvero.** `cervello/test-cervello.mjs` fa girare
// funzioni pure su casi finti — verdi qui e verdi sul runner per costruzione. Il cancello invece
// LANCIA lo script sul repo vero, nell'ambiente vero. La casa è la differenza, e la casa non la
// misurava nessuno. Due schede sono nate da lì: AR-506 e AR-514 (un file che sul runner non esiste
// mai → uscita 2 a ogni corsa → il ⚪ di un passo diventa il rosso di tutti). Una terza, AR-511,
// questo freno NON la prende più: sta qui sotto, nel buco dichiarato, ed è la cosa più importante
// del file. E AR-526 (un file che c'è ma che la macchina non può scrivere) **non è coperta**: sta
// fra i buchi al punto ⑩, perché la casa spoglia è una copia in `/tmp` e lì si scrive — misurato.
//
// UNA DOMANDA SOLA, ED È ESEGUIBILE:
//
//   ⓐ IL PASSO NUOVO DÀ LO STESSO VERDETTO NELLE DUE CASE?
//      I passi nati o riscritti in questo lotto vengono RILANCIATI in una **casa spoglia**: una
//      copia vera del repo in una cartella temporanea, con HOME vuota, `CI=1`, l'indice di git
//      pulito, i file ignorati (i `cervello/_tmp_*`) assenti, la **storia intera** e `origin/main`
//      al commit **pre-lotto** — cioè la casa che `actions/checkout` costruisce sul runner con
//      `fetch-depth: 0` (`.github/workflows/cancello-lotto.yml`, riga 58).
//      Se lì il passo esce ≠ 0 mentre in casa esce 0, il freno nasce rotto: **rosso**. È AR-506 e
//      AR-514 riprodotti, non descritti.
//
// ⚠️ LA CASA SPOGLIA HA FINTO UN CLONE SUPERFICIALE, E PER QUELLA BUGIA ACCUSAVA IL FALSO.
// Fino alla quarta consegna la copia si montava con `git init` + un commit + `.git/shallow` scritto
// a mano e NESSUN remote: storia mozza, `origin/main` inesistente, ramo `master`. Il runner fa
// l'opposto. Conseguenza MISURATA, non ragionata: quattro guardiani onesti del cancello uscivano 2
// **solo per via della casa** — `cervello/forma-json.mjs` («origin/main non raggiungibile»),
// `cervello/mutazioni-orfane.mjs` («nessun origin/main da cui contare»), `cervello/prossimo-ar.mjs`
// («né su origin/main né su main»), `cervello/conta-verdetti-muti.mjs` («CIECO: clone superficiale»)
// — e questo freno li marchiava «NASCE ROTTO». Gli stessi quattro, stesso commit, su un clone a
// profondità intera: exit 0 tutti e quattro. L'accusa era falsa quattro volte su quattro, e il
// grilletto era una riga di commento in fondo a uno di quei file. Adesso la casa ha la storia intera
// e `origin/main`, e quei quattro ci escono 0: il caso sta nel banco e diventa rosso se la casa
// torna a fingere.
//
// ⚠️ IL CONTRATTO STA QUI SOPRA LE OTTO DECINE DI RIGHE, E NON PIÙ IN FONDO ALL'INTESTAZIONE.
// `cervello/guardia-viva.mjs` riconosce uno strumento come guardiano solo se il contratto d'uscita
// compare nelle prime 80 righe (`RIGHE_INTESTAZIONE`). Con l'intestazione lunga finiva alla riga
// 105, questo file non risultava un guardiano, e la sua voce in `cervello/guardiani-motivi.json`
// diventava una VOCE FANTASMA: `cervello/test/guardiano-mai-messo-di-guardia.test.mjs` usciva 1 e
// la suite del cervello — che è un passo del cancello — nasceva rossa per tutti. Misurato sulla
// versione precedente e su questa, prima di spostare il blocco.
//
// Uso:
//   node cervello/due-case.mjs                 # il verdetto
//   node cervello/due-case.mjs --json          # per gli script
//   node cervello/due-case.mjs --tutti         # prova TUTTI i passi provabili, non solo i nuovi
//   node cervello/due-case.mjs --aggiorna-tetto
//
// Uscita (contratto guardiani, AR-322):
//   0 = misurato: nessun passo nuovo nasce rotto e il tetto non è salito
//   1 = uno dei due non torna → il lotto non si consegna
//   2 = NON HO POTUTO MISURARE (niente cancello, niente git, copia fallita, orologio scaduto)
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ BUCO APERTO DICHIARATO — LA DOMANDA ⓑ È STATA AMPUTATA, E QUESTO È IL PERCHÉ
// ─────────────────────────────────────────────────────────────────────────────────────────────
// Fino alla terza consegna questo freno faceva una seconda domanda: «il passo nuovo sa diventare
// rosso — lì?». Prendeva da `cervello/mutanti.json` una mutazione che dichiarava di far diventare
// rosso quello script (campo `test` uguale allo script del passo), la applicava dentro la copia e
// pretendeva l'uscita 1. È stata TOLTA, non riparata. Tre misure, tutte rigiocate col comando e
// l'uscita veri, dicono che era una spunta verde appoggiata sopra una malattia viva:
//
//   ① SI COMPRAVA IN SEI RIGHE DI JSON. L'unico ingresso del verdetto era «il codice d'uscita è
//      ≠ 0 dopo che qualcuno ha cambiato un file»: nessuno controllava che quel file fosse ciò che
//      il guardiano sorveglia. Misurato su uno script malato di tipo AR-511 (legge l'indice di git,
//      vuoto sul runner): con la mutazione onesta → «NASCE SENZA MORSO», exit 1, giusto. Puntando
//      la stessa mutazione sul guardiano STESSO (`file` = lo script del passo) → «✅ sotto
//      mutazione diventa rosso nella casa spoglia», exit 0, con lo script malato identico al primo
//      byte (md5 `e331b8a0…` prima e dopo). Variante ancora più economica: rompere una riga di
//      `import` così che node esca 1 per errore di sintassi. Il verde arrivava senza toccare un
//      byte della malattia.
//   ② PRETENDEVA UNA CONVENZIONE CHE LA CASA NON USA. Chiedeva una mutazione col campo `test`
//      uguale allo SCRIPT del passo, mentre in `cervello/mutanti.json` **719 mutazioni su 727
//      puntano a un file di prova** (`cervello/test/*.test.mjs`). Chi aggiunge un passo seguendo la
//      convenzione dominante trovava un rosso: non un caso isolato, la forma normale di ogni passo
//      nuovo.
//   ③ NASCEVA ROSSO PER TUTTI. Montata insieme agli altri due freni dello stesso lotto, la domanda
//      ⓑ usciva 1 accusando entrambi di «NASCE SENZA MORSO» — misurato, exit reale 1 — e bloccava
//      il cancello di tutti al primo montaggio. È esattamente la malattia AR-506/511/514/526/534
//      che questo file esiste per curare, rifatta dal medico.
//
// COSA RESTA SCOPERTO, DETTO CHIARO: **un passo che nella casa spoglia esce 0 avendo guardato zero
// cose non lo prende più nessuno.** È AR-511: il guardiano legge l'indice di git, sul runner
// l'indice è pulito, e il verde è un verde che non ha misurato niente. Qui dentro non c'è oggi
// nessuna misura di quel difetto — e vale più dirlo che coprirlo male.
//
// LA FORMA CHE AVREBBE DOVUTO AVERE PER REGGERE (per chi la riscriverà, non da rifare a occhio):
//   · la mutazione non deve poter toccare lo script del passo né i suoi import: se il bersaglio sta
//     dentro il perimetro del guardiano, l'esito è ⚪ «non ho misurato», mai ✅;
//   · servono DUE mutazioni con esito opposto — una che morde su ciò che il passo sorveglia e una
//     puntata sul guardiano stesso che NON deve bastare — così il verde non si compra con una riga;
//   · il legame passo→mutazione va letto nella convenzione di casa (`test` = il file di prova), non
//     in una convenzione inventata per l'occasione;
//   · e prima di agganciarla al cancello va montata insieme ai freni fratelli del suo lotto e
//     misurata: se esce 1 al primo montaggio, è nata rossa e non si consegna.
//
// ⚠️ LA PRIMA VERSIONE È STATA BUTTATA, E VALE LA PENA RICORDARE PERCHÉ. Leggeva una CARTA scritta
// a mano: ogni passo dichiarava «da cosa leggo il mio verdetto», e il freno diventava rosso quando
// la dichiarazione nominava una fonte impossibile in CI. **Diventava rosso solo se chi aggiungeva
// il passo si autodenunciava, e chi si autodenuncia non aveva il difetto.** La ⓑ era il piano
// sopra: là si dichiarava da cosa si legge, qui si sceglieva cosa rompere — e in tutti e due i casi
// lo sceglieva la persona che ha fretta di consegnare.
//
// LA CASA SPOGLIA È UNA COPIA, NON IL REPO SPOGLIATO. È la differenza che rende questo freno
// innocuo: la prima versione spostava i file di servizio del repo vero per il tempo della corsa, e
// un passo che scrive non si poteva rilanciare («romperlo per capire se è rotto»). Qui si esegue su
// una copia usa-e-getta: il repo di chi lancia il freno non viene toccato nemmeno se il passo
// scrive, nemmeno su Ctrl-C. Costa 1,4 secondi di copia.
//
// ⚠️ CON UNA ECCEZIONE, E VA DETTA QUI PERCHÉ QUI SI LEGGE. Quando un passo esce ≠ 0 nella casa
// spoglia, lo rilancio UNA volta **qui**, nel repo vero, per sapere se è la casa a farlo cadere o se
// era già rosso di suo. Quella corsa è una corsa normale di quel passo: **se quel passo scrive, qui
// scrive.** Misurato su questo repo con `--tutti`: `cervello/cancello-stop.mjs` ha lasciato la sua
// ancora del turno (`cervello/_tmp_stop-ancora.json`, ignorato da git). Non è un danno nuovo — il
// cancello lancia quel passo qui a ogni corsa comunque — ma «sola lettura» sarebbe una bugia, e il
// verdetto adesso dice quanti passi ha rilanciato in casa.
//
// MI ESCLUDO DA ME STESSA, ED È UNA RIGA CHE VALE UN BLOCCANTE. Quando questo file sarà un passo
// del cancello, rilanciarlo dentro la casa spoglia vorrebbe dire lanciare una copia di me che ne
// lancia un'altra: `spawnSync` è sincrono, il SIGTERM non lo legge nessuno, e il processo non torna
// più (misurato sulla prima versione: 204 processi annidati dopo 20 secondi, 992 in due minuti).
// Due cinture: ① il piano salta il passo il cui script sono io (`statoDelPasso` → «io»), e mi
// riconosco **anche quando il repo da giudicare non è quello in cui vivo** (`AD_REPO` puntato
// altrove: senza quella riga il passo col mio nome finiva rilanciato e la seconda cintura pagava
// un ⚪ falso); ② ogni figlio parte con `DUE_CASE_DENTRO=1`, e con quella variabile addosso questo
// file non esegue NESSUNO. La prova che la ① c'è davvero sta in `cervello/test/due-case.test.mjs`:
// togli la riga e il caso diventa rosso.
//
// NON RILANCIO I PASSI CHE IL CANCELLO STESSO PAGA A CARO PREZZO, E IL MOTIVO È MISURATO. Il
// cancello concede a ogni passo 300 secondi; a due ne concede di più, e `cervello/test-cervello.mjs`
// (600 s) è il runner di tutte le prove del cervello. Rilanciarlo nella casa spoglia costava
// **7 minuti e 35 secondi** su un lotto che aveva cambiato una riga di commento (186 s nella casa
// spoglia + 210 s in casa), e finiva in un ROSSO FALSO: dentro la casa spoglia ogni figlio porta
// `DUE_CASE_DENTRO=1`, la suite riesegue il banco di questo stesso freno, e il freno vedeva rossa
// una suite che aveva rotto lui. Adesso quei passi non si rilanciano: si contano sotto il TETTO,
// che è un ⚪ dichiarato con un numero, non un verde. La soglia non è inventata — è il timeout di
// casa del cancello (`opts.timeout || 300_000`), letto dal suo codice.
//
// COSA NON PROVA (detto prima, non dopo — un freno largo che nessuno sa quando scatta è peggio di
// uno stretto):
//   ① IL VERDE CHE HA GUARDATO ZERO (AR-511). È il buco dichiarato qui sopra: da quando la domanda
//      ⓑ è stata amputata, un passo che nella casa spoglia esce 0 senza aver misurato niente passa.
//   ② Non prova SE STESSA. Chi giudica questo file è il suo banco e la verifica avversariale, non
//      lui. È il prezzo dichiarato dell'assenza di ricorsione, non una svista.
//   ③ Il perimetro «nato o riscritto» lo dà git: `merge-base` col ramo pubblicato quando la storia
//      è intera, altrimenti `HEAD`. Con `HEAD` un pezzo di lotto già committato non risulta nuovo —
//      e allora questo freno **non esce verde: esce ⚪**, perché la sua unica domanda non l'ha
//      nemmeno potuta porre (misurato: su questa macchina, che è un clone superficiale, un lotto già
//      committato faceva uscire 0 avendo rilanciato ZERO passi). In CI la storia c'è
//      (`fetch-depth: 0`) e il ⚪ non compare.
//   ④ NELLA CASA SPOGLIA IL LOTTO È COMMITTATO, IN CASA QUASI MAI — ed è un asse in più, non un
//      dettaglio: là il ramo esiste e `origin/main` è il commit di partenza, esattamente come sul
//      runner. Quindi un passo che guarda «cosa ha committato questo lotto» (per esempio
//      `cervello/cancello-stop.mjs`) può essere verde qui e rosso lì **avendo ragione lui**: il
//      difetto è nel lotto non finito, non nel passo. Misurato con `--tutti` su questo stesso lotto.
//      La riga di rimedio sotto l'accusa nomina questa strada per seconda, apposta.
//   ⑤ La casa spoglia imita cinque assi (HOME vuota, `CI=1`, indice pulito, file ignorati assenti,
//      storia intera con `origin/main` al pre-lotto) e `node_modules` lo COLLEGA invece di toglierlo,
//      perché sul runner c'è `npm ci`: così non può mai essere lui a spiegare una differenza.
//      Versione di Node, filesystem, fuso, rete e permessi restano quelli di qui: la copertura è
//      «non contiene le trappole già pagate», non «è sicuro».
//   ⑥ I passi che non si possono rilanciare nudi non si provano MAI: `npx tsc`, chi riceve
//      argomenti calcolati (`--base`, `--difetti`) perché lanciarlo senza misurerebbe un'altra cosa,
//      e chi il cancello paga più dei suoi 300 secondi di casa. Non spariscono: si contano contro un
//      TETTO in `cervello/due-case.json`, che scende e non risale. Aggiungerne uno nuovo alza il
//      conto sopra il tetto ed è rosso.
//   ⑦ Il tetto si abbassa con `--aggiorna-tetto`, che scrive **il minimo fra la misura e il numero
//      di prima** (`Math.min`, come i tetti del cancello alle sue righe 720-724): quel comando non
//      lo può alzare. E se la chiave `tetto_mai_provabili` non c'è, **non scrive affatto ed esce 1**:
//      togliere la riga e ridare lo stesso comando era il modo misurato di alzare il numero (0 → 1,
//      rosso → verde) senza che il diff mostrasse altro che una chiave riscritta dallo strumento.
//      Alzarlo resta una riga da scrivere a mano in `cervello/due-case.json`, e si vede nel diff —
//      un cricchetto, non un lucchetto.
//   ⑧ COSTA quanto il passo che rilancia. Su un lotto che non tocca nessun passo del cancello è la
//      lettura di due file: 0,16 secondi misurati. Quando un passo è nato o riscritto si paga una
//      casa spoglia (misurata su questo repo: 2,5 s — 1,4 di copia dei 2768 file più una `git show`
//      per ognuno dei file toccati dal lotto, 13 in questo, 0,04 s l'una) più una corsa di quel
//      passo. Il caso peggiore misurato è `--tutti`: 18 case, 18 corse, 58,7 secondi.
//   ⑨ Rilancia OGNI passo nuovo, compresi i freni fratelli montati nello stesso lotto: non li
//      conosce, non li nomina e non ne importa niente: se uno di loro esce ≠ 0 nella casa spoglia
//      mentre in casa esce 0, la malattia è sua e il freno la dice. Misurato coi tre freni del
//      lotto 51 montati insieme: exit 0.
//   ⑩ Con `AD_REPO` puntato a un albero diverso da quello in cui gira il processo, il perimetro
//      collassa SEMPRE su `HEAD`: `cervello/storia-git.mjs` (riga 150) risolve `.git` contro la
//      cartella del processo invece che contro il repo che gli si passa, e risponde con gli innesti
//      del repo di qui. Misurato costruendo un albero a storia intera con `origin/main` al commit
//      pre-lotto: da fuori diceva «clone superficiale», da dentro trovava il merge-base. In CI e nel
//      cancello il processo gira DENTRO il repo, quindi il percorso vero è quello buono — ma è un
//      difetto di un modulo condiviso, non mio, e va detto invece che aggirato qui dentro.
//   ⑪ AR-526 — «il file c'è ma la macchina non lo può scrivere» — QUI NON SI RIPRODUCE. La casa
//      spoglia è una copia in `/tmp`, e lì si scrive: un passo che sul runner morirebbe sui permessi
//      esce verde da me. Non è coperta: è dichiarata, e chi cerca quel difetto deve cercarlo altrove.
//   ⑫ IL CENSIMENTO SA DI NON SAPER LEGGERE, MA NON SA LEGGERE. Riconosco solo la forma letterale
//      `esegui("nome", "comando", ["arg"])`. Un passo scritto in un altro modo — un aiutante
//      (`const passoNode = (n, s) => esegui(n, "node", [s])`), le virgolette singole, un nome
//      calcolato — non lo so leggere, e allora **non esco verde: esco ⚪** e dico quanti me ne
//      mancano (`censimentoDelCancello` conta le occorrenze di `esegui(` e le confronta con quelle
//      riconosciute). Prima uscivo verde dicendo «22 passi censiti» mentre il cancello ne lanciava
//      di più: misurato con un refactor di una riga, che portava da rosso a verde senza toccare un
//      byte dello script malato. Un passo che non so leggere è un passo che non ho misurato.
//   ⑬ IL TEMPO. Il cancello mi dà 300 secondi in tutto e io ne do altrettanti a ogni passo che
//      rilancio: due passi lenti e mi ucciderebbe l'orologio (codice 124 = rosso senza spiegazione).
//      Perciò mi tengo un budget mio (`DUE_CASE_BUDGET`, 240 s): quando è finito i passi che restano
//      diventano ⚪ dichiarati, non un rosso che nessuno sa spiegare.
//   ⑭ NON SONO SOLA LETTURA SUL REPO DI QUI, e per tre consegne c'era scritto che lo ero. Il
//      confronto «era già rosso in casa?» è una corsa vera di quel passo, qui: se scrive, scrive.
//      Misurato: `--tutti` su questo repo ha fatto scrivere a `cervello/cancello-stop.mjs` la sua
//      ancora del turno. Succede solo per i passi che nella casa spoglia escono ≠ 0, e il verdetto
//      dice quanti sono stati. Il banco ha un caso che lo pretende: un passo che scrive, e il file
//      che compare nel repo di prova.
//
// 🟡 DI SUO non scrive niente sul repo di chi lo lancia: solo dentro una cartella temporanea, e solo
// `cervello/due-case.json` quando gli si chiede `--aggiorna-tetto`. Ma RILANCIA dei passi — nella
// copia sempre, e qui una volta sola per confronto quando uno esce ≠ 0 là — e un passo che scrive
// scrive dove gira. Il conto dei rilanci in casa è stampato sotto il verdetto (vedi il buco ⑭).

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { CODICE } from "./esito-guardiano.mjs";
import { senzaCommenti, storiaDelRepo } from "./storia-git.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
/** Il repo in cui VIVO: non sempre è quello che devo giudicare (vedi `percorsoDiMe`). */
const MIO_REPO = join(QUI, "..");
const REPO = process.env.AD_REPO || MIO_REPO;

const JSON_MODE = process.argv.includes("--json");
const TUTTI = process.argv.includes("--tutti");
const AGGIORNA_TETTO = process.argv.includes("--aggiorna-tetto");

/** La seconda cintura contro la ricorsione: un figlio non esegue nessuno. */
const SONO_UN_FIGLIO = process.env.DUE_CASE_DENTRO === "1";

const CANCELLO = "cervello/cancello-lotto.mjs";
const TETTO_FILE = process.env.DUE_CASE_TETTO_FILE || join(REPO, "cervello/due-case.json");

/**
 * Il budget di casa del cancello: `opts.timeout || 300_000` alla sua riga 570.
 *
 * Non è una soglia inventata da me: è il cancello che dichiara, nel suo codice, quali passi costano
 * più degli altri. A quelli non ci vado nemmeno vicino — si contano sotto il tetto.
 */
const BUDGET_DI_CASA = 300_000;

/**
 * Quanto aspetto un passo. Ucciso dall'orologio = NON MISURATO (⚪), mai verde e mai rosso.
 *
 * Lo stesso budget che il cancello dà ai suoi passi normali, e per la stessa ragione: un passo che
 * lì ci sta dentro deve starci anche qui, e uno che lì non ci sta non lo rilancio proprio.
 */
const TEMPO_MASSIMO = Number(process.env.DUE_CASE_TIMEOUT || BUDGET_DI_CASA);

/**
 * Il budget di TUTTA la corsa, e sta sotto quello che il cancello dà a me.
 *
 * Il cancello mi concede i suoi 300 secondi (`opts.timeout || 300_000`) e io ne davo altrettanti a
 * OGNI passo che rilancio: due passi lenti e mi ammazza l'orologio: `status === null` → 124 →
 * `fallito: true` → rosso per tutti, senza una riga che spieghi perché. Con un budget mio, il passo
 * che non ci sta dentro diventa un ⚪ con nome e cognome.
 *
 * Con `--tutti` il budget è un'ora: quel comando lo lancia una persona a mano, non il cancello, e lì
 * non c'è nessun orologio esterno da cui difendersi — solo la pazienza di chi guarda.
 */
const BUDGET_TOTALE = Number(process.env.DUE_CASE_BUDGET || (TUTTI ? 3_600_000 : 240_000));

/** Sotto questo tempo non vale la pena partire: la sola copia del repo costa un paio di secondi. */
const MINIMO_PER_PROVARE = 20_000;

/**
 * L'ISTANTE IN CUI SONO NATO — e non «l'istante in cui comincio a rilanciare». AR-913.
 *
 * ⚠️ IL BUDGET QUI SOPRA DICHIARA «sta sotto quello che il cancello dà a me», e per un mese non è
 * stato vero. L'orologio partiva dopo il piano, il censimento, il perimetro e la costruzione della
 * casa spoglia: tutto quel tempo era gratis, e i 240 secondi si contavano sopra un tempo già speso.
 * Sul runner del 31/8 il cancello mi ha ucciso a 300 secondi netti — `exit 124`, cioè rosso per
 * tutti, che è esattamente il difetto che quel budget doveva impedire.
 *
 * Un budget che comincia a contare a metà del lavoro non è un budget: è una promessa che si tiene
 * solo quando la prima metà è veloce. Da qui in giù conta tutto, dalla prima riga.
 */
const AVVIATO = Date.now();

// ─────────────────────────────────────────────────────────────────────────────
// ① LE DECISIONI, PURE — una prova le ESEGUE invece di cercarle in un file.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'UNICA forma di passo che so leggere: `esegui("nome", "comando", ["arg"], {opzioni})`.
 *
 * È una funzione e non una costante perché una `RegExp` con la `g` porta con sé `lastIndex`: una
 * costante condivisa fra due chiamate si ricorderebbe dove era arrivata, e il secondo censimento
 * conterebbe meno passi del primo senza che nessuno se ne accorga. Una nuova a ogni giro costa
 * niente e non ha memoria.
 */
const FORMA_RICONOSCIUTA = () => /\besegui\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*\[([^\]]*)\]\s*(?:,\s*\{([^}]*)\})?/g;

/** `./cervello/x.mjs` e `cervello\x.mjs` sono `cervello/x.mjs`: un file solo, un nome solo. */
export function normalizzaPercorso(p) {
  if (!p) return null;
  return String(p).split("\\").join("/").replace(/^\.\//, "");
}

/**
 * I passi VERI del cancello, letti dal suo codice.
 *
 * Derivato e non elencato: un passo nuovo entra da solo, e non c'è un secondo elenco che possa
 * restare indietro. Si estraggono le chiamate `esegui("<nome>", "<comando>", [<argomenti>], {<opzioni>})`,
 * comprese quelle assegnate a una variabile (`const pTest = esegui(…)`), che finiscono in
 * `passi.push` due righe dopo. Si deduplica per IDENTITÀ INTERA — nome, comando e argomenti insieme:
 * `--aggiorna-tetti` rilancia gli stessi due passi per misurare i tetti, e quelli sono davvero gli
 * stessi. Per NOME no, e il perché è misurato: due righe con lo stesso nome e uno script diverso
 * sono due passi, e il secondo spariva.
 *
 * `argomentiDinamici` è la domanda che salva la misura: quando il cancello passa `--base base.spec`
 * o `--difetti toccati.join(",")`, rilanciare lo script nudo NON è lo stesso comando.
 * `timeout` è il prezzo che il cancello DICHIARA di pagare per quel passo: serve a non rilanciare
 * chi costa minuti (vedi `maiProvabile`).
 */
export function passiDelCancello(testo) {
  const fuori = [];
  const visti = new Set();
  for (const m of String(testo || "").matchAll(FORMA_RICONOSCIUTA())) {
    const nome = m[1].replace(/\\(.)/g, "$1");
    const grezzo = m[3];
    // ⚠️ IL DOPPIONE SI RICONOSCE DALL'IDENTITÀ INTERA, NON DAL NOME — e questa riga vale un
    // bloccante. Deduplicando per nome, un passo NUOVO che portava il nome di uno vecchio spariva:
    // non veniva rilanciato, non veniva contato, e il conto delle chiamate tornava lo stesso perché
    // la riga c'era. Misurato: copiata la riga di un passo e cambiato SOLO lo script (il modo più
    // normale al mondo di aggiungerne uno — copia, incolla, cambia il file, scordati il nome), lo
    // script malato non veniva eseguito mai e il freno usciva verde. Adesso due righe collassano in
    // una sola se sono la STESSA chiamata: `--aggiorna-tetti` rilancia gli stessi due passi identici,
    // e quelli sì che sono uno solo.
    const chiave = JSON.stringify([nome, m[2], grezzo.replace(/\s+/g, " ").trim()]);
    if (visti.has(chiave)) continue;
    visti.add(chiave);
    const argomenti = [...grezzo.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((a) => a[1].replace(/\\(.)/g, "$1"));
    // Tolti i letterali, se resta qualcosa che non siano virgole e spazi un argomento è calcolato.
    const resto = grezzo.replace(/"(?:[^"\\]|\\.)*"/g, "").replace(/[\s,]/g, "");
    const opzioni = m[4] || "";
    const quantoTempo = opzioni.match(/\btimeout\s*:\s*([\d_]+)/);
    fuori.push({
      nome,
      comando: m[2],
      argomenti,
      argomentiDinamici: resto.length > 0,
      timeout: quantoTempo ? Number(quantoTempo[1].replace(/_/g, "")) : null,
      // Il percorso si NORMALIZZA: `./cervello/x.mjs` e `cervello/x.mjs` sono lo stesso file, e la
      // prima cintura anti-ricorsione confronta stringhe. Senza questa riga il passo scritto col
      // `./` non veniva riconosciuto come «io», finiva rilanciato, e il freno accusava se stesso —
      // misurato da una verifica avversariale, che l'ha comprato con due caratteri.
      script: normalizzaPercorso(argomenti.find((a) => a.endsWith(".mjs"))),
    });
  }
  return fuori;
}

/**
 * IL CENSIMENTO CON LA CONTROPROVA — quanti passi ci sono davvero, e quanti ne so leggere.
 *
 * La regola sopra riconosce UNA forma sola. Fin qui è onesto; il difetto era che il freno **non
 * aveva modo di accorgersi di ciò che non sapeva leggere**: un passo scritto in un altro modo non
 * veniva rilanciato, non veniva contato sotto il tetto, e il verdetto usciva verde dicendo «22 passi
 * censiti» mentre il cancello ne lanciava di più. Misurato con un refactor che chiunque farebbe al
 * quinto passo di fila — `const passoNode = (nome, script) => esegui(nome, "node", [script])` — che
 * portava il freno da rosso a verde senza toccare un byte dello script malato.
 *
 * La controprova è un conto, non un'altra espressione regolare: le occorrenze di `esegui(` nel testo
 * (tolti i commenti e la definizione della funzione) devono essere ESATTAMENTE quelle che ho
 * riconosciuto. Se non torna, non esco verde: esco ⚪ e dico il numero. Un passo che non so leggere
 * è un passo che non ho misurato.
 *
 * @returns {{passi: object[], censiti: number, riconosciute: number, chiamate: number, doppioni: number, tornaIlConto: boolean, motivo: string}}
 */
export function censimentoDelCancello(testo) {
  const pulito = senzaCommenti(String(testo || ""));
  const passi = passiDelCancello(pulito);
  const riconosciute = [...pulito.matchAll(FORMA_RICONOSCIUTA())].length;
  const occorrenze = [...pulito.matchAll(/\besegui\s*\(/g)].length;
  const definizioni = [...pulito.matchAll(/\b(?:async\s+)?function\s+esegui\s*\(/g)].length;
  const chiamate = occorrenze - definizioni;
  const tornaIlConto = chiamate === riconosciute;
  return {
    passi,
    censiti: passi.length,
    riconosciute,
    chiamate,
    doppioni: riconosciute - passi.length,
    tornaIlConto,
    motivo: tornaIlConto
      ? ""
      : `nel cancello ci sono ${chiamate} chiamate a \`esegui(\` e io ne so leggere ${riconosciute}: ${chiamate - riconosciute} passo/i è scritto in una forma che non riconosco (un aiutante, le virgolette singole, un nome calcolato). Quei passi NON li rilancio e NON li conto sotto il tetto: non sto misurando il cancello intero, e non lo chiamo verde.`,
  };
}

/**
 * Questo passo si può RILANCIARE nudo nella casa spoglia, o non si potrà mai?
 *
 * Non è una dichiarazione: sono fatti già estratti dal codice del cancello. Un `npx tsc` non è uno
 * script del cervello; un passo con argomenti calcolati lanciato nudo misura un'altra cosa (il
 * sorvegliante senza `--base` misura zero, che è proprio la malattia di casa); e un passo a cui il
 * cancello concede più dei suoi 300 secondi è un passo che rilanciato costa MINUTI.
 *
 * L'ultima regola è nata da un rosso falso misurato: `cervello/test-cervello.mjs` (600 s nel
 * cancello) è il runner di tutte le prove. Rilanciarlo dentro la casa spoglia costava 7m35s e
 * usciva 1 — perché la suite lì dentro rieseguiva il banco di QUESTO freno con `DUE_CASE_DENTRO=1`
 * addosso. Il freno accusava «nasce rotto» una suite che aveva rotto lui. Meglio un ⚪ contato sotto
 * il tetto che un rosso falso da 400 secondi fuori budget.
 *
 * Chi risponde `false` finisce sotto il TETTO: non sparisce, si conta.
 */
export function maiProvabile(passo) {
  const p = passo || {};
  if (p.comando !== "node") return { provabile: false, motivo: `non è uno script del cervello lanciato con \`node\` (comando: ${p.comando || "?"})` };
  if (!p.script) return { provabile: false, motivo: "il cancello non gli passa nessuno script .mjs da rilanciare" };
  if (p.argomentiDinamici === true) return { provabile: false, motivo: "il cancello gli passa argomenti calcolati (--base, --difetti): lanciarlo nudo misurerebbe un'altra cosa" };
  if (Number.isFinite(p.timeout) && p.timeout > BUDGET_DI_CASA)
    return {
      provabile: false,
      motivo: `il cancello stesso gli concede ${Math.round(p.timeout / 1000)} s invece dei ${BUDGET_DI_CASA / 1000} di casa: rilanciarlo costa minuti (misurati 7m35s sulla suite del cervello) e la sua corsa rieseguirebbe anche ME dentro la casa spoglia, dove non misuro niente — il rosso che ne uscirebbe sarebbe mio, non suo`,
    };
  return { provabile: true, motivo: "" };
}

/**
 * NATO, RISCRITTO o INVARIATO in questo lotto — e «io», che è il caso che impedisce la ricorsione.
 *
 * ⚠️ LA RIGA CHE VALE UN BLOCCANTE è la prima: se il passo lancia proprio questo file, si salta.
 * Senza, il freno agganciato al cancello rilancia una copia di sé che ne rilancia un'altra dentro
 * `spawnSync`, che è sincrono: il timeout manda il SIGTERM e non lo legge nessuno. La prima versione
 * ci è morta sopra con 992 processi annidati e un comando che non torna. Il banco ha un caso che
 * diventa rosso se questa riga sparisce.
 *
 * @param passo il passo estratto dal cancello di ADESSO
 * @param prima lo stesso passo estratto dal cancello del ramo di base, o `null` se non c'era
 * @param testoOra il testo dello script adesso, o `null` se non si legge
 * @param testoPrima il testo dello script al ramo di base, o `null` se non c'era / non si legge
 * @param seStesso il percorso (relativo al repo) di questo file
 */
export function statoDelPasso(passo, prima, testoOra, testoPrima, seStesso = null) {
  const p = passo || {};
  if (seStesso && p.script === seStesso) return "io";
  if (!prima) return "nato";
  if (prima.comando !== p.comando || JSON.stringify(prima.argomenti) !== JSON.stringify(p.argomenti)) return "riscritto";
  // Un passo SENZA script (`npx tsc`) non ha un testo da confrontare: il nome c'era e la riga del
  // cancello non è cambiata, quindi è invariato. Senza questa riga risultava NATO a ogni corsa —
  // «non ho un testo» letto come «il testo non c'era», che è la forma generale del verde bugiardo
  // rovesciato: un'accusa a ogni giro, e le accuse che tornano sempre si imparano a saltare.
  if (!p.script) return "invariato";
  if (testoPrima === null || testoPrima === undefined) return "nato"; // lo script non c'era al ramo di base
  if (testoOra !== testoPrima) return "riscritto";
  return "invariato";
}

/**
 * Il PIANO: cosa si prova, cosa si conta sotto il tetto, cosa si lascia stare — prima di eseguire.
 *
 * Pura per un motivo solo: così una prova può eseguirla e leggere il piano, invece di cercare in un
 * file la frase che dice che il piano è giusto.
 *
 * @param passiOra i passi del cancello di adesso
 * @param passiPrima i passi del cancello al ramo di base (elenco, anche vuoto)
 * @param opzioni.seStesso percorso di questo file, escluso dalla riesecuzione
 * @param opzioni.leggiOra (script) => testo|null
 * @param opzioni.leggiPrima (script) => testo|null
 * @param opzioni.tutti prova anche i passi invariati (comando `--tutti`, non il cancello)
 */
export function piano(passiOra = [], passiPrima = [], { seStesso = null, leggiOra = () => null, leggiPrima = () => null, tutti = false } = {}) {
  const perNome = new Map((passiPrima || []).map((p) => [p.nome, p]));
  return (passiOra || []).map((passo) => {
    const stato = statoDelPasso(passo, perNome.get(passo.nome) || null, passo.script ? leggiOra(passo.script) : null, passo.script ? leggiPrima(passo.script) : null, seStesso);
    const imitabile = maiProvabile(passo);
    if (stato === "io") return { passo, stato, provare: false, contaNelTetto: false, perche: "sono io: un freno che rilancia se stesso non torna più indietro" };
    // Il tetto conta la FORMA del cancello, non il lotto: un passo che non si potrà mai rilanciare
    // resta contato anche quando nessuno lo tocca, altrimenti il debito sparirebbe appena smette di
    // essere nuovo — ed è il modo in cui i numeri che devono scendere non scendono mai.
    if (!imitabile.provabile) return { passo, stato, provare: false, contaNelTetto: true, perche: imitabile.motivo };
    if (stato === "invariato" && !tutti) return { passo, stato, provare: false, contaNelTetto: false, perche: "invariato in questo lotto: l'ha già visto girare il cancello di chi l'ha scritto" };
    return { passo, stato, provare: true, contaNelTetto: false, perche: "" };
  });
}

/**
 * DOMANDA ⓐ — il verdetto delle due case, dai due codici d'uscita.
 *
 * L'unico ROSSO è quello stretto e vero: **verde in casa, non-verde nella casa spoglia**. È la forma
 * esatta di AR-506 e AR-514 — qui il file c'è, lì non c'è mai, e il 2 di un passo solo diventa il
 * rosso di tutti. Il caso opposto (rosso in casa, verde lì) non è affare di questo freno: il
 * cancello lancia comunque quel passo e lo dice da sé, e accusare due volte la stessa cosa insegna
 * a leggere solo il primo rigo.
 */
export function verdettoDueCase({ casa, spoglia, chiedeIlPassato = false }) {
  if (!Number.isInteger(spoglia)) return { esito: "non-misurato", motivo: "la casa spoglia non ha restituito un codice d'uscita leggibile" };
  if (spoglia === 0) return { esito: "ok", motivo: "verde anche nella casa spoglia" };
  // 🕰️ LA CASA È NATA IERI, E UN PASSO CHE CHIEDE DEL MESE SCORSO NON SI PUÒ GIUDICARE QUI — AR-832.
  //
  // La casa spoglia è un `git init` con DUE commit: il punto ⑤ in testa la chiama «storia intera»,
  // e nel senso stretto è vero (non è un clone superficiale). Ma un passo che chiede a git com'era
  // un file alla data di NASCITA di un difetto — luglio, per la maggior parte — lì non trova niente
  // e si dichiara cieco. Il runner vero invece la storia ce l'ha: `fetch-depth: 0` in tutt'e due i
  // workflow. Quindi quel 2 racconta la mia casa finta, non il runner.
  //
  // PROVATO IL 26/8, e il verso dell'errore è quello che fa danno: bastava aggiungere una riga di
  // commento a `cervello/prove-oneste.mjs` sul ramo di partenza — senza toccarne il comportamento —
  // per farmi scrivere «NASCE ROTTO». Un freno che accusa chi non ha fatto niente si impara a
  // scorrere (AR-786), e allora l'accusa vera non la legge più nessuno.
  //
  // Stretto apposta, e sono tre condizioni insieme: solo il **2** (cieco: il contratto dei guardiani
  // distingue 1 «violazione» da 2 «non ho potuto misurare», AR-322), solo per un passo che passa
  // dalla **porta della storia**, e senza toccare nessun tetto — non è un'assoluzione, è un ⚪ che
  // resta contato fra ciò che non copro. Un passo che esce **1** nella casa spoglia resta rosso
  // com'era: quelli sono AR-506 e AR-514, e su di loro non cambia niente.
  if (spoglia === 2 && chiedeIlPassato === null) {
    // Non ho potuto leggere lo script, quindi non so se chiede del passato. Si tiene il lato
    // prudente — l'accusa resta — ma si dice, invece di far passare un «no» che non ho misurato.
    return {
      esito: "nasce-rotto",
      motivo:
        "in casa esce 0, nella casa spoglia esce 2 (cieco). ⚠️ Non ho potuto leggere lo script per " +
        "sapere se chiede a git com'era il passato: se lo chiede, questo ⚪ potrebbe essere della mia " +
        "casa finta e non del runner (AR-832). Tengo l'accusa e lo dichiaro.",
    };
  }
  if (spoglia === 2 && chiedeIlPassato === true) {
    return {
      esito: "non-misurato",
      motivo:
        "si dichiara cieco nella casa spoglia, e quella casa è un `git init` con due commit: chiede " +
        "a git com'era un file mesi fa e lì il passato non c'è. Sul runner vero la storia c'è " +
        "(fetch-depth: 0), quindi questo ⚪ racconta la mia casa finta e non il runner (AR-832)",
    };
  }
  if (!Number.isInteger(casa)) return { esito: "non-misurato", motivo: "la casa spoglia dice ≠ 0 ma non ho potuto rilanciarlo qui per confronto" };
  if (casa !== 0) return { esito: "gia-rosso-in-casa", motivo: `esce ${casa} anche in casa: non è la casa a farlo cadere, e il cancello lo dice già da sé` };
  return {
    esito: "nasce-rotto",
    motivo:
      `in casa esce 0, nella casa spoglia esce ${spoglia} (${spoglia === 2 ? "cieco" : "rosso"}). ` +
      "Sul runner la casa è quella spoglia: questo passo nasce " +
      (spoglia === 2 ? "⚪ a ogni corsa, e il ⚪ di un passo solo fa uscire 2 tutto il cancello (AR-506, AR-514)." : "rosso a ogni corsa, per costruzione."),
  };
}

/**
 * Il TETTO dei passi che non si potranno mai rilanciare. Scende e non risale.
 *
 * Un tetto e non un divieto: quattro passi di oggi non sono rilanciabili per come il cancello li
 * chiama, e vietarli renderebbe il cancello rosso per sempre — cioè spento. Ma il numero non deve
 * poter crescere in silenzio: un passo nuovo che nasce non provabile è debito nuovo.
 */
export function verdettoTetto({ quanti, tetto }) {
  if (!Number.isInteger(tetto)) return { esito: "senza-tetto", motivo: "cervello/due-case.json non dichiara `tetto_mai_provabili`: senza un numero da confrontare non sto misurando niente" };
  if (quanti > tetto) return { esito: "salito", motivo: `${quanti} passi del cancello non si potranno mai rilanciare nella casa spoglia, contro un tetto di ${tetto}: il debito si è allargato` };
  if (quanti < tetto) return { esito: "sceso", motivo: `passi mai provabili scesi da ${tetto} a ${quanti}: abbassa il tetto con \`node cervello/due-case.mjs --aggiorna-tetto\`` };
  return { esito: "ok", motivo: `${quanti} passi mai provabili, esattamente il tetto` };
}

/**
 * Il tetto NUOVO da scrivere: il minimo fra la misura di adesso e quello che c'era.
 *
 * `Math.min` e non la misura secca, come i tetti del cancello (`cancello-lotto.mjs`, righe 720-724).
 * Una verifica avversariale ha misurato la scappatoia sulla versione senza: passo nuovo mai
 * provabile → rosso; `--aggiorna-tetto` → «scritto a 1»; rilancio → verde, con zero byte cambiati
 * nel cancello. Un tetto che un comando può alzare non è un tetto, è un pulsante «va bene così».
 *
 * ⚠️ SENZA TETTO NON SI SCRIVE — `null`, e chi chiama deve rifiutarsi. È la seconda scappatoia,
 * misurata: `Math.min` valeva solo se il tetto c'era, e senza chiave la funzione tornava la misura.
 * Quindi `rm` di una riga dal JSON più lo STESSO comando che il file documenta = tetto alzato
 * (misurato 0 → 1, rosso → verde), e in quel ramo il comando stampava pure «è un gesto esplicito e
 * cercabile nel diff» invece di dire che aveva alzato il numero. Una chiave tolta e rimessa dal
 * comando non è un gesto esplicito: è un cricchetto che gira al contrario.
 */
export function tettoDaScrivere({ quanti, tetto }) {
  if (!Number.isInteger(tetto)) return null;
  return Math.min(quanti, tetto);
}

/**
 * L'ESITO FINALE, e la regola contro il VERDE MUTO.
 *
 * Un freno che non ha esaminato niente non è verde: è ⚪. Qui «esaminato» ha una soglia esplicita —
 * almeno un passo censito — perché il censimento contro il tetto è una misura vera anche quando il
 * lotto non tocca nessun passo del cancello. Se invece i passi non si sono nemmeno potuti estrarre,
 * o git non ha saputo dire com'era prima, non c'è nessuna misura da raccontare: 2.
 */
export function esitoFinale({ censiti = 0, rossi = [], nonMisurati = [], tetto = { esito: "ok" } } = {}) {
  if (!censiti) return { codice: CODICE.cieco, riga: "non ho riconosciuto nessun passo dentro cancello-lotto.mjs: o è cambiata la forma di `esegui(…)`, o non ho guardato niente. Non chiamo verde questo." };
  if (rossi.length || tetto.esito === "salito" || tetto.esito === "senza-tetto") {
    const quanti = rossi.length + (tetto.esito === "salito" || tetto.esito === "senza-tetto" ? 1 : 0);
    return { codice: CODICE.rosso, riga: `${quanti === 1 ? "una cosa" : `${quanti} cose`} da sistemare prima di consegnare.` };
  }
  if (nonMisurati.length) return { codice: CODICE.cieco, riga: `${nonMisurati.length} passo/i non l'ho potuto misurare: il verde non copre quella parte.` };
  return { codice: CODICE.verde, riga: `${censiti} passi censiti, nessuno di quelli nuovi nasce rotto nella casa del runner.` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ② LA CASA SPOGLIA — una COPIA usa-e-getta, non il repo di chi lancia il freno.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * I file che arriveranno sul runner: tracciati + non tracciati NON ignorati (quelli del lotto in
 * corso, che saranno committati). Gli ignorati — i `cervello/_tmp_*`, `node_modules`, i `.env` —
 * restano fuori: è esattamente la condizione che ha generato AR-506.
 *
 * L'elenco passa dalla PORTA (`percorsiDaGit`, che mette il `-z`): senza, un nome con l'accento o
 * con uno spazio torna citato o spezzato, e la copia ci perde dentro un file.
 */
export function fileDaCopiare(root) {
  const tracciati = percorsiDaGit(["ls-files"], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
  const nuovi = percorsiDaGit(["ls-files", "--others", "--exclude-standard"], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
  return [...new Set([...tracciati, ...nuovi])];
}

/**
 * Costruisce la casa spoglia: una copia del repo com'è ADESSO sul disco, in una cartella temporanea.
 *
 * I cinque assi, tutti misurabili da chi legge:
 *   ① i file ignorati non ci sono (il clone del runner non li ha mai visti) — AR-506;
 *   ② l'indice di git è pulito: niente in `--cached` dopo i commit — AR-511;
 *   ③ la storia è INTERA e `origin/main` c'è, al commit **pre-lotto**: è quello che fa
 *      `actions/checkout` con `fetch-depth: 0`, dichiarato col motivo in
 *      `.github/workflows/cancello-lotto.yml` alla riga 58;
 *   ④ HOME vuota e `CI=1` li mette chi esegue (`ambienteSpoglio`) — AR-514;
 *   ⑤ `node_modules` viene COLLEGATO, non tolto: sul runner c'è `npm ci`, e una libreria mancante
 *      spiegherebbe una differenza che col runner non c'entra niente (è AR-437).
 *
 * ⚠️ L'ASSE ③ ERA UNA BUGIA, E COSTAVA QUATTRO ACCUSE FALSE. Fino alla quarta consegna la copia
 * scriveva `.git/shallow` a mano e non aveva nessun remote. Quattro guardiani del cancello —
 * `forma-json`, `mutazioni-orfane`, `prossimo-ar`, `conta-verdetti-muti` — uscivano 2 lì dentro
 * SOLO per quello (misurato: exit 2 nella casa finta, exit 0 sullo stesso commit in un clone a
 * profondità intera), e questo freno li marchiava «NASCE ROTTO». Adesso la copia si monta come il
 * runner: due commit — il **pre-lotto**, a cui punta `origin/main`, e il lotto — così `merge-base`,
 * `git show origin/main:…` e il delta del lotto rispondono come là.
 *
 * Se `origin/main` non si riesce a creare, la casa NON si consegna a metà: torna `ok:false`, il
 * passo diventa ⚪ «non misurato» e nessuno viene accusato. Una casa che non è quella del runner non
 * ha il diritto di dire che un passo nasce rotto.
 *
 * @param root il repo da copiare
 * @param dove la cartella (già esistente) in cui montarla
 * @param opzioni.base lo spec git dello stato PRE-lotto (`HEAD` o il merge-base con origin/main)
 * @returns {{ok:true, dir:string, delta:number}|{ok:false, motivo:string}}
 */
export function costruisciCasaSpoglia(root, dove, { base = "HEAD" } = {}) {
  let file;
  try {
    file = fileDaCopiare(root);
  } catch (e) {
    return { ok: false, motivo: `git non mi ha saputo dire quali file arriveranno sul runner (${(e?.message || e).toString().split("\n")[0]})` };
  }
  if (!file.length) return { ok: false, motivo: "git non ha elencato nessun file: fuori da un clone non so cosa copiare" };
  try {
    for (const f of file) {
      const sorgente = join(root, f);
      // Un file TRACCIATO che sul disco non c'è più è un file che questo lotto ha CANCELLATO: la
      // casa spoglia deve somigliare all'albero di lavoro, non all'indice. Senza questa riga, un
      // lotto che cancella un file rendeva cieco il freno intero — e un guardiano che diventa cieco
      // appena qualcuno cancella qualcosa è un guardiano che si impara a spegnere.
      if (!existsSync(sorgente)) continue;
      const dest = join(dove, f);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(sorgente, dest);
    }
  } catch (e) {
    return { ok: false, motivo: `non ho potuto copiare il repo (${(e?.message || e).toString().split("\n")[0]})` };
  }
  for (const mods of ["node_modules", join("pannello", "node_modules")]) {
    const sorgente = join(root, mods);
    if (!existsSync(sorgente)) continue;
    try {
      mkdirSync(dirname(join(dove, mods)), { recursive: true });
      symlinkSync(sorgente, join(dove, mods), "dir");
    } catch {
      // Senza il collegamento la copia è più povera del runner: si dirà nel motivo del ⚪ se serve.
    }
  }
  const git = (...args) => spawnSync("git", args, { cwd: dove, encoding: "utf8", timeout: 120_000 });
  const commit = (messaggio, ...extra) =>
    git("-c", "user.email=due-case@mycity", "-c", "user.name=casa spoglia", "-c", "commit.gpgsign=false", "commit", "-q", "--no-verify", ...extra, "-m", messaggio);
  // Il ramo si chiama `main` come sul runner: `prossimo-ar.mjs` cerca il cantiere «su origin/main né
  // su main», e in una copia che nasce `master` non lo trovava nemmeno con la storia intera.
  let init = git("init", "-q", "-b", "main", ".");
  if (init.status !== 0) {
    init = git("init", "-q", "."); // i git prima del 2.28 non conoscono `-b`
    if (init.status === 0) git("symbolic-ref", "HEAD", "refs/heads/main");
  }
  if (init.status !== 0) return { ok: false, motivo: `git init nella copia è fallito (${(init.stderr || "").trim().split("\n")[0] || "senza messaggio"})` };

  // ③a IL PRE-LOTTO. I file che questo lotto ha toccato tornano al contenuto del ramo di base, e
  //     quelli che ha creato spariscono: quello che resta È il commit da cui il lotto è partito.
  let toccati;
  try {
    toccati = fileToccatiDalLotto(root, base);
  } catch (e) {
    // La fonte non letta ARRIVA al verdetto: senza questo elenco il «pre-lotto» sarebbe una copia
    // identica al lotto, `origin/main` non direbbe più niente, e la casa somiglierebbe al runner
    // solo in apparenza. Un elenco vuoto ingoiato qui è la malattia `fonte-troncata-letta-per-intera`.
    return { ok: false, motivo: `git non mi ha saputo dire cosa ha toccato questo lotto (${(e?.causaGit || e?.message || e).toString().split("\n")[0]}): senza quell'elenco non so ricostruire il commit di partenza, e una casa senza pre-lotto non è quella del runner` };
  }
  for (const f of toccati) {
    const dest = join(dove, f);
    // `encoding: "buffer"` e non "utf8": un PNG letto come testo tornerebbe indietro corrotto, e la
    // casa spoglia conterrebbe un file che sul runner non esiste in quella forma.
    const prima = spawnSync("git", ["show", `${base}:${f}`], { cwd: root, encoding: "buffer", timeout: 60_000, maxBuffer: 64 * 1024 * 1024 });
    if (prima.status === 0) {
      try {
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, prima.stdout);
      } catch (e) {
        return { ok: false, motivo: `non ho potuto rimettere «${f}» com'era prima del lotto (${(e?.message || e).toString().split("\n")[0]})` };
      }
    } else {
      rmSync(dest, { force: true }); // al ramo di base non c'era: l'ha creato questo lotto
    }
  }
  git("add", "-A");
  const primo = commit("prima del lotto", "--allow-empty");
  if (primo.status !== 0) return { ok: false, motivo: `il commit del pre-lotto nella copia è fallito (${(primo.stderr || primo.stdout || "").trim().split("\n")[0] || "senza messaggio"})` };
  const preLotto = git("rev-parse", "HEAD");
  if (preLotto.status !== 0 || !preLotto.stdout.trim()) return { ok: false, motivo: "nella copia git non mi ha saputo dire il commit del pre-lotto" };
  const ref = git("update-ref", "refs/remotes/origin/main", preLotto.stdout.trim());
  if (ref.status !== 0)
    return {
      ok: false,
      motivo: `non ho potuto creare origin/main nella copia (${(ref.stderr || "").trim().split("\n")[0] || "senza messaggio"}): senza, la casa non è quella del runner e ogni passo che legge la storia uscirebbe cieco per colpa mia`,
    };
  git("config", "remote.origin.url", dove);
  git("config", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*");

  // ③b IL LOTTO. Gli stessi file tornano com'erano sul disco: adesso il delta `origin/main..HEAD` è
  //     esattamente questo lotto, come il ramo che il runner si trova davanti.
  for (const f of toccati) {
    const sorgente = join(root, f);
    const dest = join(dove, f);
    if (existsSync(sorgente)) {
      try {
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(sorgente, dest);
      } catch (e) {
        return { ok: false, motivo: `non ho potuto rimettere «${f}» com'è adesso (${(e?.message || e).toString().split("\n")[0]})` };
      }
    } else {
      rmSync(dest, { force: true }); // questo lotto l'ha cancellato
    }
  }
  if (toccati.length) {
    git("add", "-A");
    const secondo = commit("il lotto", "--allow-empty");
    if (secondo.status !== 0) return { ok: false, motivo: `il commit del lotto nella copia è fallito (${(secondo.stderr || secondo.stdout || "").trim().split("\n")[0] || "senza messaggio"})` };
  }
  return { ok: true, dir: dove, delta: toccati.length };
}

/**
 * I file che questo lotto ha toccato: modificati rispetto al ramo di base + nati e non ancora
 * committati. Sono gli unici che vanno riportati indietro per ricostruire il pre-lotto.
 *
 * ⚠️ NON INGOIA L'ERRORE DI GIT, e non è un dettaglio di stile: un `catch { return [] }` qui darebbe
 * un elenco vuoto, il «pre-lotto» sarebbe identico al lotto, `origin/main` punterebbe allo stesso
 * albero e la casa sembrerebbe quella del runner senza esserlo. È la malattia
 * `fonte-troncata-letta-per-intera` di `cervello/malattie.json` — una fonte letta a metà che produce
 * un verdetto intero — e `cervello/spazzata-fratelli.mjs` l'ha presa addosso a questo file mentre lo
 * scrivevo. L'errore sale, e chi chiama lo trasforma in ⚪.
 */
function fileToccatiDalLotto(root, base) {
  const chiedi = (args) => percorsiDaGit(args, { cwd: root, maxBuffer: 64 * 1024 * 1024 });
  return [...new Set([...chiedi(["diff", "--name-only", base]), ...chiedi(["ls-files", "--others", "--exclude-standard"])])];
}

/** L'ambiente della casa spoglia: HOME vuota, `CI=1`, e la cintura anti-ricorsione sui figli. */
export function ambienteSpoglio(base, home) {
  const env = { ...base };
  // Le variabili di QUESTA corsa non devono entrare nella prossima casa: `AD_REPO` la manderebbe a
  // misurare il repo vero dalla copia, e sarebbe la copia che non spoglia niente.
  for (const k of ["AD_REPO", "LOTTO_PERIMETRO", "DUE_CASE_TETTO_FILE", "DUE_CASE_TIMEOUT", "DUE_CASE_BUDGET"]) delete env[k];
  return {
    ...env,
    HOME: home,
    USERPROFILE: home,
    XDG_CONFIG_HOME: join(home, ".config"),
    CLAUDE_CONFIG_DIR: join(home, ".claude"),
    CI: "1",
    GITHUB_ACTIONS: "true",
    DUE_CASE_DENTRO: "1",
  };
}

/** Lancia un passo dentro una cartella, con un ambiente dato. Non lancia mai: torna i fatti. */
/**
 * ⏳ AR-908 — QUANTO POSSO ANCORA SPENDERE, dato l ISTANTE in cui il mio budget scade.
 *
 * PERCHE ESISTE. Fino al 2/9 `misuraIlPasso` riceveva una DURATA e la passava, intera, a ognuna
 * delle sue due corse: la casa spoglia e — se quella non usciva zero — il repo vero. Due corse da
 * `quantoTempo` ciascuna, piu la copia del repo che non era contata affatto. Con 240 secondi di
 * budget un passo solo poteva spenderne 480 piu la copia, e il cancello, che a due-case ne concede
 * 300, lo uccideva a meta: exit 124, cioe rosso per tutti senza una riga che dica perche.
 *
 * MISURATO il 2/9 su questa macchina: `node cervello/due-case.mjs` ucciso a 400 secondi. E la
 * controprova che dice dove NON era il difetto: con `DUE_CASE_BUDGET=1` esce in ZERO secondi con
 * quattro ⚪ dichiarati. Il budget quindi funzionava — davanti al ciclo. Dentro al ciclo no.
 *
 * Una durata non si puo dividere fra due chiamate: un ISTANTE si. Da qui in avanti gira la
 * scadenza, e ogni operazione chiede al proprio orologio quanto le resta — anche quella che viene
 * dopo la copia, che prima nessuno cronometrava.
 *
 * Torna 0 quando non resta abbastanza per misurare qualcosa di sensato: e la differenza fra
 * fermarsi da soli, che si legge, e farsi sparare, che non si legge.
 */
export function quantoPosso(scadenza, adesso = Date.now(), tettoPasso = TEMPO_MASSIMO, minimo = MINIMO_PER_PROVARE) {
  const resta = Number(scadenza) - Number(adesso);
  if (!Number.isFinite(resta) || resta < minimo) return 0;
  return Math.min(tettoPasso, resta);
}

/**
 * ⏱️ AR-909 — IL TEMPO MASSIMO ERA UNA RICHIESTA CORTESE, E IL FIGLIO POTEVA RIFIUTARLA.
 *
 * `spawnSync` allo scadere del `timeout` manda il segnale di `killSignal`, che per difetto e
 * SIGTERM. SIGTERM si puo intercettare e ignorare. Se il figlio non muore, node NON insiste e NON
 * passa a SIGKILL: resta ad aspettare che finisca per conto suo. Il campo si chiama `timeout` e non
 * ferma niente.
 *
 * MISURATO il 2/9 sul passo piu grosso che questo file rilancia, la suite del cervello:
 *   · senza killSignal ......... chiesti 30.000 ms → dopo 500.000 non era ancora tornato
 *   · con killSignal SIGKILL ... chiesti 30.000 ms → tornato dopo 30.041
 * E la controprova che dice dove NON era: senza le pipe (`stdio: "ignore"`) NON si ferma lo stesso,
 * quindi non era l attesa dell EOF; e con UN nipote solo il timeout funzionava (2000 chiesti, 2008
 * tornato), quindi non e il numero di processi: e che quel figlio li SIGTERM non lo uccide.
 *
 * PERCHE SIGKILL QUI E NON DAPPERTUTTO. Un SIGKILL non lascia riordinare: chi muore cosi puo
 * lasciare file a meta o un lock. Qui il figlio e un GUARDIANO in sola lettura dentro una copia
 * usa-e-getta del repo, quindi non c e niente da riordinare — e un guardiano che non si puo
 * fermare e peggio di uno ucciso male. Altrove (git, npm) la stessa riga NON e ovvia, e infatti
 * non l ho scritta: il conto di quanti altri punti hanno la stessa forma sta in AR-909.
 */
function esegui(dir, passo, env, timeout = TEMPO_MASSIMO) {
  const r = spawnSync(passo.comando, passo.argomenti, { cwd: dir, encoding: "utf8", timeout, killSignal: "SIGKILL", maxBuffer: 32 * 1024 * 1024, env });
  const ucciso = r.status === null;
  return {
    codice: ucciso ? null : r.status,
    ucciso,
    uscita: `${r.stdout || ""}${r.stderr || ""}`.trim().split("\n").filter(Boolean).slice(-6),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL VERDETTO
// ─────────────────────────────────────────────────────────────────────────────

/** `AAAA-MM-GG HH:MM` col fuso di Piacenza: la regola dell'orario vale anche sui file della macchina. */
function oraDiPiacenza(quando = new Date()) {
  return quando.toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16);
}

/**
 * Come mi chiamo dentro il cancello che sto giudicando — la prima cintura anti-ricorsione.
 *
 * Quasi sempre è «il mio percorso relativo al repo». Ma quando `AD_REPO` punta a un albero che non
 * è il mio (una prova, una copia, una casa spoglia) `relative` torna un `../../tmp/...` che non
 * assomiglia a nessun passo: il passo col mio nome finiva rilanciato, il figlio usciva 2 per via
 * della seconda cintura, e il freno gridava «nasce rotto» a se stesso. Misurato. In quel caso vale
 * il nome che ho in casa mia, che è il nome con cui ogni cancello mi chiama.
 */
export function percorsoDiMe(root, mio = fileURLToPath(import.meta.url), mioRepo = MIO_REPO) {
  const dentro = relative(root, mio).split("\\").join("/");
  if (dentro && !dentro.startsWith("..")) return dentro;
  return relative(mioRepo, mio).split("\\").join("/");
}

/** Con cosa confrontarsi per sapere cosa ha toccato QUESTO lotto (stessa regola del cancello). */
function basePerConfronto(root) {
  const storia = storiaDelRepo(root);
  if (storia.intera) {
    const mb = spawnSync("git", ["merge-base", "HEAD", "origin/main"], { cwd: root, encoding: "utf8", timeout: 30_000 });
    if (mb.status === 0 && mb.stdout.trim()) return { spec: mb.stdout.trim(), nota: "antenato comune con origin/main" };
  }
  return { spec: "HEAD", nota: `${storia.motivo} → confronto con l'ultimo commit locale (i pezzi già committati non risultano nuovi)` };
}

/** Il testo di un file com'era al ramo di base, o `null` se lì non c'era. */
function alRamoDiBase(root, spec, percorso) {
  const r = spawnSync("git", ["show", `${spec}:${percorso}`], { cwd: root, encoding: "utf8", timeout: 60_000, maxBuffer: 32 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

function leggiOppureNull(percorso) {
  try {
    return readFileSync(percorso, "utf8");
  } catch {
    return null;
  }
}

/**
 * Questo script fa domande sul passato? Si legge dal codice, non da un elenco (AR-832).
 *
 * TRE VALORI, non due — malattia `fonte-troncata-letta-per-intera`. `false` vorrebbe dire «l'ho
 * letto e non chiede del passato»; se la lettura non è riuscita quella frase è un verdetto intero
 * costruito su una fonte mai aperta, e ha la stessa faccia di uno vero. `null` = non lo so, e chi
 * decide sceglie il lato prudente DICENDOLO, invece di dedurlo in silenzio.
 *
 * @returns {boolean|null}
 */
export function passaDallaPortaDellaStoria(root, script, leggi = null) {
  if (!script) return false; // nessuno script da leggere: la risposta è no, e la so
  // Il percorso arriva dal sorgente del cancello e non da fuori, ma un `..` qui leggerebbe un file
  // fuori dal repo: si rifiuta invece di fidarsi. Costa una riga e toglie una domanda a chi rilegge.
  if (String(script).split("/").includes("..")) return false;
  let testo = null;
  try {
    testo = leggi ? leggi(script) : readFileSync(join(root, script), "utf8");
  } catch {
    testo = null;
  }
  if (testo === null || testo === undefined) return null; // non l'ho letto: non ho una risposta
  return /storiaDelRepo\w*\s*\(|statoStoria\s*\(/.test(String(testo));
}

/**
 * La misura vera di UN passo: lo si rilancia intatto nella casa spoglia e si confrontano le uscite.
 *
 * La copia è per passo e non per corsa: un passo che scrive lascerebbe la casa sporca per il
 * successivo, e la seconda misura sarebbe fatta in una casa che non è più quella dichiarata.
 */
export function misuraIlPasso(root, voce, spec = "HEAD", scadenza = Date.now() + TEMPO_MASSIMO) {
  const { passo, stato } = voce;
  const fermo = (motivo) => ({ passo: passo.nome, script: passo.script, stato, esito: "non-misurato", motivo });
  // AR-908 — la copia del repo e la parte lenta, e prima non la contava nessuno: se il budget e
  // gia finito qui, non la comincio nemmeno.
  if (!quantoPosso(scadenza)) return fermo("il mio budget era finito prima di costruire la casa spoglia: questo passo non l'ho rilanciato");
  const base = mkdtempSync(join(tmpdir(), "due-case-"));
  const casa = join(base, "casa-spoglia");
  const home = join(base, "home");
  try {
    mkdirSync(casa, { recursive: true });
    mkdirSync(home, { recursive: true });
    const costruita = costruisciCasaSpoglia(root, casa, { base: spec });
    if (!costruita.ok) return fermo(costruita.motivo);

    const env = ambienteSpoglio(process.env, home);
    const perLaPrima = quantoPosso(scadenza);
    if (!perLaPrima) return fermo("costruire la casa spoglia ha consumato tutto il budget: non ho rilanciato niente dentro");
    const intatto = esegui(casa, passo, env, perLaPrima);
    if (intatto.ucciso) return fermo(`nella casa spoglia non ha finito in ${perLaPrima} ms: ucciso dall'orologio non è né verde né rosso`);

    // ⓐ — le due case danno lo stesso verdetto?
    let inCasa = null;
    let rilanciatoQui = false;
    if (intatto.codice !== 0) {
      // ⚠️ QUESTA È UNA CORSA VERA, NEL REPO DI QUI: se il passo scrive, scrive. Si segna, e il
      // verdetto lo dice — «sola lettura» era una bugia comoda (buco ⑭).
      // AR-908 — QUI stava la meta nascosta del difetto: questa corsa riceveva `quantoTempo`
      // INTERO, cioe lo stesso budget gia speso una volta sopra. Adesso chiede all'orologio quanto
      // resta davvero, e se non resta niente lo dichiara invece di partire lo stesso.
      const perLaSeconda = quantoPosso(scadenza);
      if (!perLaSeconda) return fermo(`nella casa spoglia è uscito ${intatto.codice}, ma il budget è finito prima della seconda corsa: il confronto fra le due case non l'ho fatto`);
      rilanciatoQui = true;
      const qui = esegui(root, passo, process.env, perLaSeconda);
      inCasa = qui.ucciso ? null : qui.codice;
    }
    // Il riconoscimento è DERIVATO dal codice, mai da un elenco di nomi: si guarda se lo script passa
    // dalla porta della storia (`storiaDelRepo`, `storiaDelRepoCurata`, `statoStoria`) — la stessa che
    // cervello/storia-git.mjs impone a chiunque faccia una domanda sulla finestra passata. Misurato il
    // 26/8: 2 passi su 25 del cancello.
    const a = verdettoDueCase({
      casa: intatto.codice === 0 ? 0 : inCasa,
      spoglia: intatto.codice,
      chiedeIlPassato: passaDallaPortaDellaStoria(root, passo.script),
    });
    if (a.esito === "ok") return { passo: passo.nome, script: passo.script, stato, esito: "ok", motivo: a.motivo, rilanciatoQui };
    if (a.esito === "nasce-rotto") return { passo: passo.nome, script: passo.script, stato, esito: "nasce-rotto", motivo: a.motivo, uscita: intatto.uscita, rilanciatoQui };
    return { passo: passo.nome, script: passo.script, stato, esito: a.esito === "gia-rosso-in-casa" ? "gia-rosso-in-casa" : "non-misurato", motivo: a.motivo, uscita: intatto.uscita, rilanciatoQui };
  } finally {
    try {
      rmSync(base, { recursive: true, force: true });
    } catch {
      /* una cartella temporanea in più non vale un verdetto in meno */
    }
  }
}

function main() {
  const cancello = join(REPO, CANCELLO);
  if (!existsSync(cancello)) {
    console.error(`due-case: ${CANCELLO} assente → non so quali passi giudicare, e non lo invento`);
    process.exit(CODICE.cieco);
  }
  const testoOra = leggiOppureNull(cancello);
  if (testoOra === null) {
    console.error(`due-case: non ho potuto leggere ${CANCELLO} → non misuro`);
    process.exit(CODICE.cieco);
  }
  const censimento = censimentoDelCancello(testoOra);
  const passiOra = censimento.passi;

  // Il tetto: il censimento dei passi che non si potranno mai rilanciare.
  let tettoFile = null;
  try {
    tettoFile = JSON.parse(readFileSync(TETTO_FILE, "utf8"));
  } catch {
    tettoFile = null;
  }

  const seStesso = percorsoDiMe(REPO);
  const base = basePerConfronto(REPO);
  const testoPrima = alRamoDiBase(REPO, base.spec, CANCELLO);
  const passiPrima = testoPrima === null ? [] : censimentoDelCancello(testoPrima).passi;
  const cieco2 = testoPrima === null ? `git non mi ha saputo dare ${CANCELLO} al ramo di base (${base.spec}): ogni passo risulterebbe NATO, e misurerei il magazzino invece del lotto` : null;

  const ilPiano = piano(passiOra, passiPrima, {
    seStesso,
    tutti: TUTTI,
    leggiOra: (s) => leggiOppureNull(join(REPO, s)),
    leggiPrima: (s) => alRamoDiBase(REPO, base.spec, s),
  });

  const maiProvabili = ilPiano.filter((v) => v.contaNelTetto);
  const tettoVecchio = Number.isInteger(tettoFile?.tetto_mai_provabili) ? tettoFile.tetto_mai_provabili : null;
  const tetto = verdettoTetto({ quanti: maiProvabili.length, tetto: tettoVecchio });

  if (AGGIORNA_TETTO) {
    // ⛔ DUE RIFIUTI, ED È IL PUNTO IN CUI QUESTO COMANDO SMETTE DI ESSERE UNA SCORCIATOIA.
    // ① senza un tetto leggibile non si scrive: togliere la chiave e ridare questo stesso comando
    //    era il modo misurato di ALZARE il numero (0 → 1, rosso → verde) con un `rm` di una riga.
    // ② se il censimento non torna, la misura è un sottoconto: scriverla abbasserebbe il tetto su
    //    passi che non ho nemmeno visto. Il tetto scende sulla misura vera, o non scende.
    if (!Number.isInteger(tettoVecchio)) {
      console.error("⛔ due-case: in cervello/due-case.json manca `tetto_mai_provabili` (o non è un numero intero): NON scrivo niente.");
      console.error("   Senza il numero di prima non so se sto abbassando o alzando, e questo comando può solo abbassare.");
      console.error("   Rimetti la chiave a mano col numero che c'era — a mano si vede nel diff, ed è l'unico modo per farlo salire.");
      process.exit(CODICE.rosso);
    }
    if (!censimento.tornaIlConto) {
      console.error(`⛔ due-case: ${censimento.motivo}`);
      console.error("   Un tetto scritto su un censimento incompleto è un debito che sparisce senza essere pagato: NON scrivo niente.");
      process.exit(CODICE.rosso);
    }
    const scritto = tettoDaScrivere({ quanti: maiProvabili.length, tetto: tettoVecchio });
    scriviJsonAtomico(TETTO_FILE, {
      ...(tettoFile && typeof tettoFile === "object" ? tettoFile : {}),
      aggiornato: oraDiPiacenza(),
      tetto_mai_provabili: scritto,
      mai_provabili: maiProvabili.map((v) => ({ passo: v.passo.nome, motivo: v.perche })),
    });
    console.log(`✍️  due-case: tetto dei passi mai provabili scritto a ${scritto} in cervello/due-case.json (prima: ${tettoVecchio}, misurati adesso: ${maiProvabili.length}).`);
    if (maiProvabili.length > scritto) {
      console.log(`   ⚠️  ne ho contati ${maiProvabili.length}, ma questo comando scrive il MINIMO fra la misura e il tetto di prima (${tettoVecchio}): il numero non sale.`);
      console.log("   Il rosso resta lì finché non togli il passo mai provabile, oppure finché non alzi il numero a mano in cervello/due-case.json — e a mano si vede nel diff.");
    } else {
      console.log("   È un gesto esplicito e cercabile nel diff, come i tetti del cancello: un cricchetto, non un lucchetto.");
    }
    process.exit(CODICE.verde);
  }

  // LA SECONDA CINTURA CONTRO LA RICORSIONE. Un figlio non esegue nessuno: qualunque cosa succeda
  // alla prima cintura, l'albero dei processi è profondo uno.
  const daProvare = SONO_UN_FIGLIO ? [] : ilPiano.filter((v) => v.provare);

  // IL MIO BUDGET, PIÙ STRETTO DI QUELLO CHE MI DÀ IL CANCELLO. Il cancello mi concede 300 secondi
  // in tutto; se li spendessi tutti in rilanci mi ucciderebbe l'orologio, e un processo ucciso lì
  // vale 124 — cioè rosso senza spiegazione, per tutti. Meglio fermarsi da soli e dire quali passi
  // sono rimasti fuori: un ⚪ dichiarato si legge, un 124 no.
  //
  // ⚠️ E il conto parte da quando sono NATO, non da qui: vedi `AVVIATO`. È la differenza fra un
  // budget e una promessa.
  // AR-913: `AVVIATO`, non `Date.now()`. Il tempo speso PRIMA di arrivare qui — il piano, il
  // censimento, il perimetro, la costruzione della casa spoglia — è tempo che il cancello mi ha già
  // contato, e ignorarlo è come fermarsi al semaforo dopo l'incidente.
  const partenza = AVVIATO;
  const misure = [];
  for (const v of daProvare) {
    const rimasto = BUDGET_TOTALE - (Date.now() - partenza);
    if (rimasto < MINIMO_PER_PROVARE) {
      misure.push({
        passo: v.passo.nome,
        script: v.passo.script,
        stato: v.stato,
        esito: "non-misurato",
        motivo: `ho finito il mio budget (${Math.round(BUDGET_TOTALE / 1000)} s) prima di arrivare a lui: non l'ho rilanciato. Rilancialo da solo con \`node cervello/due-case.mjs --tutti\`, o dammi più tempo con DUE_CASE_BUDGET.`,
      });
      continue;
    }
    // AR-908 — la SCADENZA, non la durata: una durata si spende due volte, un istante no.
    misure.push(misuraIlPasso(REPO, v, base.spec, partenza + BUDGET_TOTALE));
  }
  const rossi = misure.filter((m) => m.esito === "nasce-rotto");
  const nonMisurati = misure.filter((m) => m.esito === "non-misurato");
  if (cieco2) nonMisurati.push({ passo: "(il perimetro del lotto)", esito: "non-misurato", motivo: cieco2 });
  // ⚪ IL CENSIMENTO CHE NON TORNA. Un passo che non so leggere non l'ho rilanciato e non l'ho
  // contato: il verde coprirebbe un pezzo di cancello che non ho guardato.
  if (!censimento.tornaIlConto) nonMisurati.push({ passo: "(il censimento dei passi)", esito: "non-misurato", motivo: censimento.motivo });
  // ⚪ IL PERIMETRO CHE COLLASSA SU HEAD. Con la storia troncata il confronto è con l'ultimo commit
  // locale: un pezzo di lotto GIÀ COMMITTATO non risulta nuovo, e io lo chiamo «invariato» senza
  // averlo guardato. Quei passi lì non sono provati e non sono nemmeno contati: dire verde sopra di
  // loro è il verde muto che questo file esiste per non fare. Misurato: su un clone superficiale col
  // lotto committato il freno usciva 0 avendo rilanciato zero passi. Non tocca i passi esclusi per
  // un motivo dichiarato (io, sotto il tetto): quelli sono ⚪ scritti riga per riga, e si leggono.
  const alBuio = ilPiano.filter((v) => !v.provare && !v.contaNelTetto && v.stato === "invariato");
  if (!SONO_UN_FIGLIO && base.spec === "HEAD" && !TUTTI && alBuio.length)
    nonMisurati.push({
      passo: `(${alBuio.length} passi che risultano invariati)`,
      esito: "non-misurato",
      motivo: `la storia è troncata (${base.nota}). Con questo confronto un pezzo di lotto già committato NON risulta nuovo: quei ${alBuio.length} passi li ho chiamati invariati senza poterlo verificare. In CI la storia c'è (fetch-depth: 0) e questo ⚪ non compare; qui il rimedio è \`git fetch --unshallow origin\`, oppure \`node cervello/due-case.mjs --tutti\` per rilanciarli tutti davvero.`,
    });
  if (SONO_UN_FIGLIO && ilPiano.some((v) => v.provare)) nonMisurati.push({ passo: "(i passi nuovi)", esito: "non-misurato", motivo: "sto girando DENTRO una casa spoglia (DUE_CASE_DENTRO=1): non rilancio nessuno, o l'albero dei processi non finirebbe mai" });

  const finale = esitoFinale({ censiti: passiOra.length, rossi, nonMisurati, tetto });

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          ok: finale.codice === CODICE.verde,
          codice: finale.codice,
          base: base.spec,
          censiti: passiOra.length,
          censimento: { chiamate: censimento.chiamate, riconosciute: censimento.riconosciute, doppioni: censimento.doppioni, tornaIlConto: censimento.tornaIlConto },
          provati: misure.length,
          nati: ilPiano.filter((v) => v.stato === "nato").map((v) => v.passo.nome),
          riscritti: ilPiano.filter((v) => v.stato === "riscritto").map((v) => v.passo.nome),
          io: ilPiano.filter((v) => v.stato === "io").map((v) => v.passo.nome),
          tetto,
          maiProvabili: maiProvabili.map((v) => ({ passo: v.passo.nome, motivo: v.perche })),
          misure,
        },
        null,
        2,
      ),
    );
    process.exit(finale.codice);
  }

  console.log("🏠🏠 IL PASSO NUOVO DEL CANCELLO GIRA ANCHE NELLA CASA IN CUI GIRERÀ DAVVERO?\n");
  // Il numero dei passi si stampa con la sua CONTROPROVA accanto: «22 passi censiti» da solo non
  // dice se sono tutti, e per tre consegne non lo erano.
  console.log(
    `   passi del cancello: ${passiOra.length} (${censimento.chiamate} chiamate a esegui(), ${censimento.riconosciute} lette${censimento.doppioni ? `, ${censimento.doppioni} righe identiche a un'altra` : ""}) · confronto con: ${base.spec} (${base.nota})`,
  );
  const nati = ilPiano.filter((v) => v.stato === "nato");
  const riscritti = ilPiano.filter((v) => v.stato === "riscritto");
  console.log(`   nati in questo lotto: ${nati.length} · riscritti: ${riscritti.length} · rilanciati nella casa spoglia: ${misure.length}\n`);

  for (const m of misure.filter((x) => x.esito === "nasce-rotto")) {
    console.log(`  ❌ ${m.passo} — NASCE ROTTO (${m.script})`);
    console.log(`     ${m.motivo}`);
    for (const r of m.uscita || []) console.log(`        ${r}`);
    // Le cause sono TRE, non una: la terza è nata con la casa nuova e va detta, o chi legge cerca
    // un difetto nello script mentre il difetto è nel lotto.
    console.log("     → tre strade, in quest'ordine: ① il passo legge una fonte che sul runner non c'è (allora è lui da sistemare);");
    console.log("       ② il passo vede il LOTTO COMMITTATO — nella casa spoglia lo è, come sul ramo che arriva in CI — e ha ragione a lamentarsi: allora è il lotto da finire, non lui;");
    console.log("       ③ non sta nel cancello: portalo nella visita (cervello/salute.mjs).");
    console.log("");
  }
  if (tetto.esito === "salito" || tetto.esito === "senza-tetto") {
    console.log(`  ❌ tetto dei passi mai provabili — ${tetto.motivo}`);
    for (const v of maiProvabili) console.log(`        · ${v.passo.nome}: ${v.perche}`);
    console.log("");
  }
  for (const m of nonMisurati) console.log(`  ⚪ ${m.passo} — ${m.motivo}`);
  // I passi contati sotto il tetto si STAMPANO uno per uno: un passo che nessuno rilancerà mai è un
  // ⚪ dichiarato, e un ⚪ che non si legge da nessuna parte è indistinguibile da un passo provato.
  for (const v of maiProvabili) console.log(`  ⚪ ${v.passo.nome} — NON LO RILANCIO (sotto il tetto): ${v.perche}`);
  // La riga anti-ricorsione si STAMPA: un'esclusione che nessuno vede è indistinguibile da un passo
  // provato, e questa è l'unica esclusione del freno che nasconde un bloccante (l'albero di processi
  // che non torna). Il banco pretende questa riga: toglila e il caso diventa rosso.
  for (const v of ilPiano.filter((x) => x.stato === "io")) console.log(`  ⚪ ${v.passo.nome} — NON MI PROVO DA SOLA: ${v.perche}. Chi mi giudica è cervello/test/due-case.test.mjs.`);
  for (const m of misure.filter((x) => x.esito === "gia-rosso-in-casa")) console.log(`  ℹ️  ${m.passo} — ${m.motivo}`);
  for (const m of misure.filter((x) => x.esito === "ok")) console.log(`  ✅ ${m.passo} — ${m.motivo}`);
  if (tetto.esito === "sceso") console.log(`  ⚠️  ${tetto.motivo}`);
  // Il ✅ del tetto NON si stampa sotto un verdetto ⚪ senza passi: un verde accanto a «non ho
  // guardato niente» è la riga che fa leggere «tutto a posto» a chi scorre. E non si stampa nemmeno
  // quando il censimento non torna: quel numero sarebbe un sottoconto, cioè un verde su una misura
  // che non ho.
  if (tetto.esito === "ok" && passiOra.length && censimento.tornaIlConto) console.log(`  ✅ tetto dei passi mai provabili — ${tetto.motivo}`);
  else if (tetto.esito === "ok" && passiOra.length) console.log("  ⚪ tetto dei passi mai provabili — non lo garantisco: i passi che non so leggere non li ho contati.");

  const quiPerConfronto = misure.filter((m) => m.rilanciatoQui);
  if (quiPerConfronto.length)
    console.log(
      `  ℹ️  ${quiPerConfronto.length} passo/i l'ho rilanciato anche QUI, nel repo vero, per sapere se era già rosso di suo (${quiPerConfronto.map((m) => m.passo).join(", ")}): se quel passo scrive, qui ha scritto.`,
    );
  console.log("");
  console.log(finale.codice === CODICE.verde ? `✅ ${finale.riga}` : finale.codice === CODICE.rosso ? `⛔ ${finale.riga}` : `⚪ ${finale.riga}`);
  console.log("   ⚪ non copro il VERDE CHE HA GUARDATO ZERO (AR-511): la domanda «sa diventare rosso lì?» è stata amputata — il perché sta in testa a cervello/due-case.mjs.");
  if (finale.codice === CODICE.verde && !misure.length) {
    console.log("   ⚠️  nessun passo del cancello è nato o è stato riscritto in questo lotto: ho misurato la FORMA del cancello contro il tetto, non un passo nuovo.");
  }
  process.exit(finale.codice);
}

// Importarlo non deve eseguirlo (AR-445, AR-680).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
