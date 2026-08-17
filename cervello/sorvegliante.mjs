#!/usr/bin/env node
// 👁️ SORVEGLIANTE — la revisione che gira MENTRE lavoro, non alla fine.
//
// PERCHÉ ESISTE (Nicola, 30/7): «ogni volta che ti chiedo di ricontrollare il lavoro fatto trovi
// problemi che tu stesso hai creato risolvendo i difetti, e trovi anche cose che non avevi guardato.
// Sembra che non hai un'auto-revisione mentre stai lavorando, e un quadro ampio di quello che stai
// facendo.» Ha ragione, e la prova è nell'architettura: prima di questo file la revisione esisteva
// solo in DUE momenti, entrambi tardi —
//
//   · al commit  → .githooks/pre-commit: sintassi, perimetro di main, segreti. Nient'altro.
//   · a fine lotto → cancello-lotto.mjs: prove, guardiani, typecheck.
//   · a fine giro  → auto-analisi.md: entità, numeri, semaforo (il CONTENUTO, non il codice).
//
// Mentre scrivo una modifica: **nessuno**. E la riga che salta è quasi sempre l'ultima, cioè quella
// che arriva quando il lavoro sembra già finito (come-riparo.md ⑥) — esattamente il momento in cui
// un controllo di fine corsa è meno capace di trovarla, perché a quel punto sono di parte.
//
// COSA GUARDA. Solo il DELTA: le righe che ho AGGIUNTO adesso. Non il debito storico — quello ha già
// i suoi tetti in malattie.json e tetti-lotto.json. È una scelta di taratura, non pigrizia: un
// cancello che parte rosso su mezzo repo viene disattivato entro la settimana (stampo-metro.mjs), uno
// che parte verde si accorge del primo che sporca. Guardando solo le righe nuove **parte verde per
// costruzione**, e il primo che sporca sono io.
//
//   ① malattia-nuova   — una riga che aggiungo ADESSO è una nuova istanza di una malattia già
//                        censita in malattie.json. Il registro è quello, non una copia: due liste
//                        della stessa conoscenza divergono sempre.
//   ② prova-accecata   — ho modificato un file su cui poggia una mutazione di mutanti.json, e il
//                        pezzo che quella mutazione cerca non c'è più. Cioè: un fix vecchio è appena
//                        rimasto senza prova, in silenzio. Nessuno lo controlla oggi (non-vacuita.mjs
//                        gira sui difetti del lotto in corso, non su quelli che il diff sfiora).
//   ③ gate-orfano      — dichiaro un `gate:` che punta a un test inesistente. «Non fatto» diventa
//                        indistinguibile da «puntatore rotto» — e il conto dei freni sale senza che
//                        la difesa esista. Se la nota nomina una PR aperta è `gate-in-attesa`: giallo,
//                        non verde (un'attesa senza scadenza è un'esenzione travestita, AR-338).
//   ④ perimetro-letterale — aggiungo a un guardiano un elenco di file scritto a mano. È la malattia
//                        di AR-347 alla lettera: «FILE_PILOTA è un elenco letterale, e chi lo ha
//                        scritto ha elencato i file dove aveva appena visto il difetto». È il modo
//                        preciso in cui un difetto si chiude riparando l'istanza e lasciando la classe.
//   ⑤ raggio           — chi ALTRO importa i file che ho toccato. Non è un errore: è il quadro ampio
//                        che manca. AR-338, AR-344 e AR-415 hanno tutti la stessa forma — ho cambiato
//                        un lettore condiviso e il significato è cambiato per tutti gli altri.
//
// E DAL 3/8 (AR-495) anche il lato SOTTRAZIONE, che per tre giorni non ha guardato nessuno. «Solo le
// righe che aggiungo» era una taratura giusta contro il debito storico e sbagliata su ciò che tolgo:
// quello è delta mio quanto il resto. Provato prima di scriverlo — un diff che cancellava un `gate:` e
// il test a cui puntava usciva `voci: 0, exit 0`, e il file cancellato non compariva nemmeno.
//
//   ⑥ difesa-rimossa    — sparisce un test che è il freno di una lezione, un file su cui poggia una
//                        mutazione, o la riga che LANCIA un guardiano. I registri continuano a
//                        contarlo: il numero dei freni resta, la difesa no.
//   ⑦ soglia-allentata  — un tetto che sale o un minimo che scende. Il rosso diventa verde senza che
//                        niente sia migliorato (stampo-metro.mjs: «peggioramento travestito da pareggio»).
//   ⑧ esenzione-aggiunta — un percorso che entra in una lista di esclusione o in una baseline: la
//                        porta di AR-338, zittire senza curare.
//
// COSA NON FA. Non giudica se il fix è giusto, non legge il cantiere, non sostituisce il cancello del
// lotto. Cinque misure meccaniche su un diff: dove passa un «forse» qui, la risposta è tacere.
//
// COPERTURA DICHIARATA (⑤ è una euristica, e va detto). Dal 3/8 (AR-508, Nicola: «fai sapere al
// sorvegliante chi poggia su un file in modo indiretto») il raggio arriva a DUE PASSI e riconosce tre
// forme di legame: ① l'`import`/`require`/`from`; ② il percorso scritto per intero in qualunque file
// di codice — uno .sh, un workflow .yml, un `.service` di systemd, `.claude/settings.json`; ③ il nome
// del file dentro una stringa in un contesto che lo USA (`join(QUI, "x.mjs")`, `import(nome)`,
// `node x.mjs`, `ExecStart=`), che è il modo in cui questo repo compone davvero i percorsi. Poi
// risale di un passo: chi poggia su chi poggia su di me.
//   NON copre: i nomi costruiti pezzo per pezzo a runtime (`nome + ".mjs"`), i riferimenti nei .md e
//   nei registri di memoria (lì gli script si nominano per mestiere — contarli faceva salire il raggio
//   di cancello-stop.mjs da 10 a 86 file, cioè da un elenco a un rumore), e il TERZO passo, dove in
//   questo repo quasi tutto poggia su un registro comune e la risposta diventerebbe «mezzo repo».
//   Un raggio vuoto significa «non ne ho trovati», mai «non ce ne sono».
//
// IL CANALE (AR-465, 30/7 — la riparazione più importante di questo file). Per un giorno intero
// questa guardia ha girato a ogni mia modifica e ha parlato a NESSUNO. La riga in settings.json c'era,
// il codice era giusto, le prove verdi — e il verdetto finiva in un log di debug che non leggo. Un
// hook `PostToolUse` che esce con 0 e stampa testo semplice non arriva al modello: la documentazione
// lo dice a lettere, e io ho chiuso AR-455 senza andarla a leggere. Il risultato è la malattia che
// questa stessa macchina sa nominare — una misura che non può dire di no — costruita il mattino e
// consegnata il pomeriggio. Il canale che arriva davvero è UNO: stdout deve essere JSON con
// `hookSpecificOutput.additionalContext`, e allora il verdetto compare accanto al risultato dello
// strumento. Da qui la forma `--hook`: JSON o niente.
//
// E il silenzio? Se taccio quando è pulito (giusto: un avvisatore che parla sempre viene spento entro
// la settimana, L-2026-0730-533), «zitto perché non c'è niente» e «zitto perché sono morto» tornano
// indistinguibili — di nuovo la stessa malattia, un giro più in là. Per questo la forma hook lascia un
// BATTITO: un file ignorato da git (`_tmp_*`, così verificare non sporca l'albero — AR-464) con l'ora
// dell'ultimo scatto. `--battito` lo legge e risponde alla sola domanda che conta: hai girato o no?
//
// LE CINQUE RIPARAZIONI DEL 4/8 (Nicola: «fai le cinque che mi hai consigliato»). Hanno tutte la
// stessa forma, ed è per questo che sono state scelte insieme fra le 22 proposte: nessuna aggiunge
// una capacità, tutte tolgono un modo in cui questa guardia diceva il verde senza aver guardato.
//
//   Ⓐ IL PERIMETRO IN CI (era: misura zero e stampa verde). `cancello-lotto.mjs` la lanciava senza
//     argomenti, cioè `git diff HEAD` su un albero appena clonato e quindi pulito: zero file toccati,
//     zero voci, exit 0. Il passo c'era nel cancello, il verdetto no — e un verde che non ha misurato
//     è peggio di un controllo assente, perché insegna che il verde non vuol dire niente (è la stessa
//     malattia che questo file ha in cima al registro). Ora accetta `--base <spec>` e il cancello le
//     passa lo stesso antenato comune che usa per i difetti. E se un `--base` esplicito produce un
//     perimetro VUOTO, quello non è più «pulito»: è cieco, perché qualcuno mi ha chiesto di
//     confrontare con qualcosa e non ho trovato niente da guardare.
//
//   Ⓑ I FILE SALTATI IN SILENZIO (era: la regola di casa violata dentro chi la applica). Un file
//     nuovo oltre il tetto dei byte, o illeggibile, veniva saltato con un `continue` muto. Cioè la
//     guardia diceva di aver guardato un file che non ha aperto — che è esattamente il «⚪ non l'ho
//     potuto vedere ≠ verde» che questa casa pretende da tutti gli altri guardiani.
//
//   Ⓒ LA FUSIONE IN CORSO (era: un falso rosso già pagato, AR-503). `git diff HEAD` prende tutto
//     l'albero di lavoro, comprese le righe che sta portando dentro un merge o un rebase. Accusarmi
//     di quelle è il modo più veloce per insegnarmi a scorrere il verdetto — e un verdetto scorso è
//     una guardia spenta. Ora se una fusione è in corso lo DICHIARA e si dichiara cieca: le voci
//     restano visibili (possono essere vere), ma non sono più attribuibili a me.
//
//   Ⓓ IL REPO DEL MARKETPLACE (era: cieca per costruzione e zitta). `git` gira con `cwd` sulla radice
//     di QUESTA casa, e la copia del sito è un altro repo, escluso apposta. Quando lavoro sul sito la
//     guardia non vede niente e tace: identico a «tutto a posto». Farla vedere anche là è un lavoro
//     grosso che serve poco; farle dire «lì non arrivo, e ci sono N file modificati» è una riga e
//     vale quasi uguale.
//
//   Ⓔ LA VIA DI ESENZIONE TRACCIATA (era: l'unica risposta possibile a un falso rosso era ignorarlo).
//     E intanto il contatore «⟲ già detto N volte» saliva su un falso positivo, fino a far scattare
//     il cancello dello Stop: la macchina si puniva da sola per un errore suo. Ora esiste una forma
//     riconosciuta — `sorvegliante: ok <classe> fino al AAAA-MM-GG — <perché>` — che vale come
//     risposta. Con la scadenza OBBLIGATORIA: un'esenzione senza data è la porta di AR-338, e infatti
//     una scritta senza data non zittisce niente, si accusa da sola.
//
// Uso:
//   node cervello/sorvegliante.mjs              # diff del working tree + staged vs HEAD
//   node cervello/sorvegliante.mjs --hook       # per l'hook: JSON che arriva al modello, SEMPRE exit 0
//   node cervello/sorvegliante.mjs --battito    # «il canale è vivo?» — quando ha girato l'ultima volta
//   node cervello/sorvegliante.mjs --staged     # solo lo staged (è la forma che usa il pre-commit)
//   node cervello/sorvegliante.mjs --base <spec> # confronta con QUESTO (è la forma che usa la CI)
//   node cervello/sorvegliante.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = nessuna voce grave sul mio delta
//   1 = almeno una voce grave: l'ho introdotta io, adesso
//   2 = non ho potuto misurare (git assente, registri illeggibili, fusione in corso, perimetro
//       vuoto con un `--base` esplicito) — «cieco» NON è verde
//
// 🟢 Sola lettura sul repo: non tocca git, non modifica file versionati. L'UNICA scrittura è il
//    battito in `--hook`, fuori da git (vedi sopra): senza, il canale non è verificabile.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { senzaCommenti } from "./spazzata-fratelli.mjs";
// Nessun anello: il libro mastro non importa niente da qui, registra e basta.
import { annota, chiudi } from "./libro-mastro.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
// La mappa referto→generatore che la casa dichiara già: una casa sola per quell'elenco, altrimenti
// due copie della stessa conoscenza divergono al primo aggiornamento (AR-556).
import { REFERTI_RIGENERATI } from "./file-della-macchina.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

// Questi file NOMINANO le malattie per mestiere: il registro, la guardia stessa, le sue prove e le
// mutazioni. Contare le loro citazioni come istanze è lo stesso errore che spazzata-fratelli ha già
// pagato nel lotto 11 — scambiare una MENZIONE per una CHIAMATA, e punire chi documenta.
//
// ⚠️ L'esenzione vale SOLO per il controllo ① (i pattern delle malattie), non per gli altri quattro.
// La prima versione la applicava al file intero, e il primo lavoro su cui l'ho provata — la
// costruzione di questa guardia stessa — è uscito «0 file toccati nel delta»: avevo scritto tre file
// e la guardia era cieca su tutti e tre. Un'esenzione presa per una classe di controllo e allargata a
// tutte è la stessa forma di AR-338 («zittire una malattia senza curarla»), e qui l'avrei pagata
// proprio dove serviva di più: nessun raggio, nessuna prova accecata, nessun gate orfano sul codice
// dei guardiani — cioè sui file che ne rompono di più quando cambiano.
export const SALTA_MALATTIE = [
  "cervello/sorvegliante.mjs",
  "cervello/spazzata-fratelli.mjs",
  "cervello/malattie.json",
  "cervello/mutanti.json",
  "cervello/test/",
];

const esenteDaMalattie = (file) => SALTA_MALATTIE.some((s) => file === s || file.startsWith(s));

// Un file di prova è un libro di ESEMPI: contiene finti gate, finti elenchi, finte malattie, perché il
// suo mestiere è provare che la guardia li riconosce. Leggerli come dichiarazioni vere è la terza
// comparsa della stessa forma in un'ora — «menzione ≠ chiamata» — e stavolta l'ha trovata la guardia
// su sé stessa: girata sul lavoro che la costruiva, si è accusata di due gate orfani che sono le
// fixture dei suoi test. Vale per i controlli che leggono DICHIARAZIONI (①③④); il raggio e la prova
// accecata restano accesi, perché quelli misurano effetti, non intenzioni.
export const FIXTURE = ["cervello/test/"];
const eFixture = (file) => FIXTURE.some((s) => file.startsWith(s));

// I file di `auto-coscienza/` sono il TERMOMETRO, non il metro: li riscrivono per intero i guardiani
// (verifica-sensori.mjs, pagella-intelligenza.mjs, ...) a ogni giro, mai una mano. Un campo come
// `max_giri_ciechi` o `quota` lì dentro è una MISURA che sale e scende da sola col mondo reale (il sito
// è giù da più giri, un gate in più è stato scritto) — non un tetto che qualcuno ha alzato per spegnere
// un rosso. `soglieAllentate` non lo sa distinguere da un `NOME_SOGLIA` vero scritto a mano in un file
// di config, quindi lo esentiamo qui: chi vuole davvero alzare un tetto lo fa nello script che lo
// CALCOLA (cervello/*.mjs, restano guardati), non nel suo output.
export const TELEMETRIA_GENERATA = ["MyCity-Vault/90-Memoria-AI/auto-coscienza/"];
const eTelemetria = (file) => TELEMETRIA_GENERATA.some((s) => file.startsWith(s));

/** I file di PROSA: lì niente si esegue, quindi ogni nome di script è una menzione, mai una chiamata.
 *  Vale per il controllo ⑥b (vedi il perché accanto a quel controllo). I `.md` restano pienamente
 *  guardati da ①: una malattia con `estensioni: [".md"]` è una regola sul TESTO, ed è un'altra cosa. */
export const PROSA = [".md", ".markdown", ".txt"];

/** Quanto può costare UNA malattia su un file prima che smetta di cercarla e lo dica (AR-542).
 *  Due secondi: il giro completo sul repo vero ne costa 0,3 in tutto, quindi qui dentro non ci
 *  finisce mai un pattern sano — e l'hook ha 15 secondi, che restano per tutti gli altri. */
export const BUDGET_PATTERN_MS = 2000;
const ePROSA = (file) => PROSA.some((e) => file.endsWith(e));

/**
 * I REFERTI: quello che la macchina SCRIVE su sé stessa dopo aver misurato. (AR-543.)
 *
 * Sono log, non dichiarazioni: dentro c'è scritto «ho accusato la rimozione di X», e quel nome è la
 * cronaca di un allarme, non il posto da cui X viene lanciato. Nessuna difesa vive qui — vivono nel
 * cantiere, nelle lezioni e nei mutanti, che restano guardati come prima.
 *
 * Si rigenerano da soli al giro dopo, quindi in una fusione si prende il lato di main e si va avanti:
 * ed è esattamente il gesto per cui questa guardia ha accusato SÉ STESSA il 4/8 alle 05:55, quattro
 * volte, sul proprio diario. Terza forma della stessa regola in questo file — «menzione ≠ chiamata»
 * dopo i commenti (⑥b) e la prosa (AR-503) — e la più imbarazzante: il diario di chi accusa.
 */
export const REFERTI = [
  ...REFERTI_RIGENERATI,
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json",
  // Questi due li aveva elencati `main` mentre il lotto 42 riscriveva questa funzione. Il
  // riconoscimento (③, più sotto) copre `salute.json` da solo, perché dichiara chi lo scrive —
  // `auto-analisi.json` NO, e verificandolo alla fusione l'ho visto perdere la protezione.
  //
  // Restano scritti a mano apposta: la cura generale non annulla una copertura che c'era. Un
  // riconoscimento più elegante che protegge un file in meno è un passo indietro travestito da
  // passo avanti — e questo l'ho misurato invece di dedurlo, chiedendo alla funzione se li vedeva.
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-analisi.json",
];

/**
 * 🚫 LE ECCEZIONI ALL'ESENZIONE (AR-556). Qui le difese ci vivono davvero, quindi il perdono non
 * arriva MAI — nemmeno se il file si dichiarasse generato da uno script. Sono quattro nomi e sono
 * un'eccezione, non un perimetro: senza questa riga basterebbe scrivere «Scritto da cervello/x.mjs»
 * dentro il cantiere per zittire la guardia sul registro che la guardia serve a proteggere.
 */
export const MAI_REFERTO = [
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json",
  "cervello/mutanti.json",
  "cervello/malattie.json",
];

/**
 * Come un referto DICHIARA di essere l'uscita di un comando: un campo di intestazione (`_cosa_e`,
 * `_scritto_da`, …) che nomina lo script del cervello che lo riscrive. È il riconoscimento che
 * sostituisce l'elenco: chi genera un referto nuovo domani lo dichiara e la guardia lo capisce da
 * sola, senza che nessuno venga qui ad aggiungere una riga.
 */
export const DICHIARA_GENERATORE =
  /"_[a-z_]+"\s*:\s*"(?:[^"\\]|\\.)*\b(?:scritt|generat|aggiornat|prodott|riempit)\w*\s+da\s+cervello\/[\w./-]+\.(?:mjs|js|sh)/i;

/**
 * È un referto? Cioè: quello che la macchina SCRIVE su sé stessa dopo aver misurato.
 *
 * AR-556 — PRIMA ERA UN ELENCO DI UN FILE, e costava un pedaggio su ogni referto rigenerato. AR-543
 * aveva capito la classe giusta — un file dove nessuna difesa PUÒ vivere — ma l'aveva scritta
 * elencando il file visto quel giorno. Nella stessa cartella ce ne sono una trentina, e molti citano
 * per mestiere il nome di un test o di un freno: appena uno veniva rigenerato dopo una chiusura, le
 * righe dei difetti chiusi sparivano e la guardia leggeva «difesa rimossa». Cioè il pedaggio cadeva
 * proprio sul lavoro che fa scendere il conto del cantiere.
 *
 * Tre strade, in quest'ordine: ① i quattro registri dove le difese vivono non sono MAI referti;
 * ② la mappa che la casa dichiara già (`REFERTI_RIGENERATI`, più il diario di questa guardia);
 * ③ il riconoscimento vero: un JSON che dichiara chi lo scrive.
 */
export function eReferto(file, contenuto = null) {
  const nome = String(file || "");
  if (MAI_REFERTO.some((f) => nome === f || nome.endsWith(`/${basename(f)}`))) return false;
  if (REFERTI.includes(nome)) return true;
  if (!nome.endsWith(".json")) return false;
  return typeof contenuto === "string" && DICHIARA_GENERATORE.test(contenuto);
}

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzione pura. Nessun I/O, nessun git: così una prova la esegue su un diff finto invece
// che su com'è il repo adesso (skill cantiere ③: la logica che decide deve stare dove un test la può
// ESEGUIRE, altrimenti la prova controlla la forma del codice invece dell'effetto).
// ─────────────────────────────────────────────────────────────────────────────

/** Quanto lontano dalla riga del `gate:` accetto di trovare la sua `gate_nota`. Un intorno, non tutto
 *  il file: in un JSON di lezioni le chiavi di una stessa voce stanno adiacenti, e allargare
 *  significherebbe far scusare un gate orfano dalla nota di un'altra lezione. */
export const VICINANZA_NOTA = 6;

/** Il minimo di letterali che trasforma un elenco in un perimetro dedotto. Uno è una costante; due
 *  sono già una lista scelta a mano, ed è a due che AR-347 è nato. */
export const LETTERALI_MIN = 2;

// ─────────────────────────────────────────────────────────────────────────────
// IL LATO SOTTRAZIONE (AR-495) — «le difese non muoiono per aggiunta, muoiono per sottrazione».
//
// PERCHÉ ESISTE. Fino al 3/8 questa guardia guardava SOLO le righe che aggiungo. La taratura era
// giusta contro il debito storico — un cancello che parte rosso su mezzo repo viene spento entro la
// settimana — ma applicata alla lettera lasciava fuori la metà del delta in cui una difesa muore.
// La prova, eseguita prima di scrivere una riga di questo blocco: un diff che cancella un `"gate"` E
// il test a cui puntava produceva `voci: 0`, `exit 0`, verde pieno. Il file cancellato non entrava
// nemmeno nell'elenco di quelli guardati (`+++ /dev/null` → scartato dal lettore).
//
// Le tre forme, tutte già pagate da questo repo:
//   ⑥ difesa-rimossa    — sparisce un test citato da un `gate:`, un file su cui poggia una mutazione,
//                         un guardiano lanciato dal cancello o da un hook. Il conteggio dei freni
//                         resta identico e la difesa non c'è più: è AR-338 fatto con la gomma.
//   ⑦ soglia-allentata  — un tetto che sale (o un minimo che scende). Il rosso diventa verde senza
//                         che niente sia migliorato — la forma che `stampo-metro.mjs` chiama
//                         «peggioramento travestito da pareggio».
//   ⑧ esenzione-aggiunta — un percorso che entra in una lista di esclusione o in una baseline. È una
//                         somma, non una sottrazione, ma l'effetto è lo stesso: zittire senza curare.
//
// TARATURA, cioè la parte che decide se questa guardia sopravviverà. Rifattorizzare cancella righe di
// continuo: se ⑥ parlasse a ogni riga tolta diventerebbe rumore, e il rumore spegne i freni. Quindi
// ⑥ scatta SOLO su ciò che qualcun ALTRO dichiara difesa nei registri (`indiceDifese`) — misurato,
// mai un elenco scritto a mano qui dentro (sarebbe AR-347 nel file che lo vieta). E se il nome
// ricompare fra le righe aggiunte, ho spostato o rinominato: si tace.
// ─────────────────────────────────────────────────────────────────────────────

/** Le chiavi il cui NOME dice «questo è un tetto». Generale apposta: un elenco di file di soglie
 *  sarebbe il perimetro dedotto di AR-347. Copertura dichiarata: una soglia che si chiama in un altro
 *  modo non la vedo — dirlo è la differenza fra un limite e una bugia.
 *
 *  Si legge sul nome NORMALIZZATO (`_` e `-` diventano spazi): senza, `COPERTURA_MIN` e `TETTO_MAX`
 *  — cioè la forma più comune in questo repo — non combaciavano, perché in `_MIN` non c'è nessun
 *  confine di parola prima della `m`. L'hanno trovato le prove; rileggendolo sembrava giusto. */
export const NOME_SOGLIA = /(tett|sogli|massim|limit|budget|quota|minim|\bmax\b|\bmin\b)/i;

/** `_` e `-` sono separatori di parola per chi legge, non per una regex: qui glielo diciamo. */
export const nomeNormale = (k = "") => String(k).replace(/[_-]+/g, " ");

/** Le chiavi il cui nome dice «qui dentro si è esentati». Stessa logica: la parola, non la lista. */
export const NOME_ESENZIONE = /(SALTA|ESENT|IGNORA|ESCLUS|EXCLUDE|SKIP|WHITELIST|ALLOW|BASELINE)/i;

/**
 * L'indice di ciò che ALTRI dichiarano difesa: percorso → perché lo è.
 *
 * Costruito dai registri (le lezioni col loro `gate`, le mutazioni col loro file e la loro prova, i
 * guardiani che il cancello e gli hook lanciano davvero), mai elencato a mano. Così il giorno in cui
 * nasce un freno nuovo questa guardia lo protegge senza che nessuno se ne ricordi.
 */
export function indiceDifese({ lezioni = [], mutanti = [], guardiani = [] } = {}) {
  const idx = new Map();
  const segna = (p, perche) => {
    if (p && typeof p === "string" && !idx.has(p)) idx.set(p, perche);
  };
  for (const l of lezioni) {
    const p = (String(l.gate || "").match(/[\w./-]+\.(?:m?js|sh|cjs|bats)/) || [])[0];
    segna(p, `è il freno della lezione ${l.id || "?"}`);
  }
  for (const mu of mutanti) {
    segna(mu.test, `è la prova che deve diventare rossa per ${mu.difetto || "un fix"}`);
    segna(mu.file, `è il codice su cui poggia la mutazione di ${mu.difetto || "un fix"}`);
  }
  for (const g of guardiani) segna(g, "è un guardiano che il cancello o un hook lancia davvero");
  return idx;
}

/**
 * ⑦ I tetti che questa modifica ha allentato.
 *
 * Un tetto si allenta salendo; un minimo si allenta scendendo. Distinguerli non è pedanteria: senza,
 * metà dei casi passerebbe e l'altra metà sarebbe un falso rosso — e un guardiano che sbaglia in
 * entrambe le direzioni non lo guarda più nessuno.
 */
export function soglieAllentate(rimosse = [], aggiunte = [], file = "") {
  const numeri = (righe) => {
    const m = new Map();
    for (const r of righe) {
      const pulita = senzaCommenti(r.testo, file);
      const g = /["']?([A-Za-z_][\w. -]*)["']?\s*[:=]\s*(-?\d+(?:[._]\d+)*)/.exec(pulita);
      if (!g || !NOME_SOGLIA.test(nomeNormale(g[1]))) continue;
      const v = Number(String(g[2]).replace(/_/g, ""));
      if (Number.isFinite(v)) m.set(g[1].trim(), v);
    }
    return m;
  };
  const prima = numeri(rimosse);
  const dopo = numeri(aggiunte);
  const fuori = [];
  for (const [chiave, a] of dopo) {
    if (!prima.has(chiave)) continue;
    const da = prima.get(chiave);
    const eMinimo = /minim|\bmin\b/i.test(nomeNormale(chiave));
    if (eMinimo ? a < da : a > da) fuori.push({ chiave, da, a });
  }
  return fuori;
}

/**
 * ⑧ I percorsi che questa modifica ha messo al riparo da un controllo.
 *
 * Due strade, perché le esenzioni si scrivono in due posti: dentro un array che si CHIAMA esenzione,
 * e dentro un file di baseline (dove il nome del file è già la dichiarazione).
 */
export function esenzioniAggiunte(aggiunte = [], file = "") {
  const daBaseline = /baseline[^/]*\.json$/i.test(file)
    ? aggiunte.flatMap((r) => r.testo.match(/["'][^"'\n]*\.(?:md|m?js|ts|tsx|json|sh)["']/g) || [])
    : [];
  const daArray = [];
  for (const r of aggiunte) {
    const dich = /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Z][A-Z0-9_]*)\s*=\s*\[/.exec(r.testo);
    if (!dich || !NOME_ESENZIONE.test(dich[1])) continue;
    const blocco = [r, ...aggiunte.filter((x) => x.n > r.n && x.n <= r.n + 8)].map((x) => x.testo).join("\n");
    const chiuso = blocco.slice(0, blocco.indexOf("]") + 1 || undefined);
    daArray.push(...(chiuso.match(/["'][^"'\n]*\.(?:md|m?js|ts|tsx|json|sh)["']/g) || []));
  }
  return [...new Set([...daBaseline, ...daArray])];
}

// ─────────────────────────────────────────────────────────────────────────────
// Ⓔ LA VIA DI ESENZIONE TRACCIATA (4/8) — «se una voce è un falso rosso, l'unica risposta possibile
// è ignorarla».
//
// PERCHÉ ESISTE. Non per far tacere la guardia: per impedirle di mentire al proprio contatore. Dal
// 3/8 ogni voce ha un contatore («⟲ già detto 12 volte») e a INSISTENZA scatta il cancello dello
// Stop. Ma non esisteva nessun modo di RISPONDERE a una voce: né «l'ho curata» (quello si vede da
// solo, la voce sparisce) né «questa è sbagliata». Quindi un falso positivo saliva come un vero,
// finché la macchina si bloccava da sola per un errore suo — e il primo che impara a scorrere il
// verdetto in quel caso sono io. Un contatore che conta anche i falsi non è una misura, è rumore
// con un numero davanti.
//
// LA FORMA, e perché è così stretta:
//
//     sorvegliante: ok <classe|*> fino al AAAA-MM-GG — <perché>
//
// · LA CLASSE, perché un'esenzione al volo su tutto il file spegnerebbe anche i controlli che
//   nessuno ha guardato. `*` esiste, ma va scritto: è una scelta, non l'impostazione di partenza.
// · LA DATA È OBBLIGATORIA. Un'esenzione senza scadenza è esattamente la porta di AR-338 («zittire
//   una malattia senza curarla»), e questo file la nomina già due volte: nel controllo ③ («un'attesa
//   senza scadenza è un'esenzione travestita») e nel controllo ⑧. Sarebbe stato assurdo aprirla qui.
//   Scaduta, la voce TORNA da sola e si porta dietro la data: è il promemoria che nessuno scriverà.
// · IL PERCHÉ, con un minimo di sostanza. «ok — boh» non è una risposta, è la stessa riga di prima
//   con meno rumore.
// · E una scritta MALFATTA non zittisce niente: diventa una voce sua. Il modo più naturale di
//   sbagliare qui è scrivere l'esenzione e dimenticare la data — cioè ottenere per distrazione
//   proprio l'esenzione perpetua che la forma vuole impedire.
//
// DOVE SI LEGGONO, e questa riga l'ha scritta il difetto invece del progetto. La prima stesura
// leggeva i marcatori in QUALUNQUE file toccato, esentando solo `SALTA_MALATTIE`. Poi ho scritto la
// scheda di cantiere che documenta questa forma — nel vault, in prosa — e la guardia me l'ha
// contestata come «esenzione malfatta»: aveva letto una SPIEGAZIONE come una dichiarazione. È
// «menzione ≠ chiamata» per la quinta volta in questo repo, e stavolta l'ho presa scrivendo il
// commento che dice di averla evitata.
//
// La regola giusta era già in casa, nel controllo ⑥b: in un file di prosa non esiste nessuna
// chiamata, ogni riga è una menzione. Quindi i marcatori valgono SOLO nei file di codice
// (`eCodice`) e non di prosa (`ePROSA`), più l'esenzione di `SALTA_MALATTIE` — dove la forma è
// scritta per essere insegnata. Il prezzo, detto: un falso rosso dentro il sorvegliante stesso, o
// dentro un `.md`, non si può zittire così. E va bene: là il rumore costa meno del silenzio.
// ─────────────────────────────────────────────────────────────────────────────

/** Il minimo di sostanza di un «perché». Corto apposta: il freno è la data, non la lunghezza. */
export const PERCHE_MIN = 10;

/** La forma buona, per intero. La data in cifre (non `AAAA-MM-GG`) è ciò che distingue una
 *  dichiarazione da una spiegazione — ed è la ragione per cui questo file può documentarsi da solo. */
export const ESENZIONE_BUONA = /sorvegliante:\s*ok\s+([\w*-]+)\s+fino al\s+(\d{4}-\d{2}-\d{2})\s*[—–-]\s*(\S.*?)\s*$/;

/** Il tentativo, buono o rotto che sia: serve a distinguere «non ne ha scritta nessuna» da «ne ha
 *  scritta una e le manca un pezzo». Senza, una data dimenticata sarebbe silenzio — cioè un'esenzione
 *  perpetua ottenuta per distrazione, che è il caso che questa forma esiste per impedire. */
export const ESENZIONE_TENTATA = /sorvegliante:\s*ok\b/;

/**
 * I marcatori dichiarati dentro un file.
 *
 * @returns {{valide:Array<{classe:string,scadenza:string,perche:string,riga:number}>, rotte:Array<{riga:number,testo:string,manca:string}>}}
 */
export function esenzioniDichiarate(contenuto = "") {
  const valide = [];
  const rotte = [];
  if (typeof contenuto !== "string") return { valide, rotte };
  contenuto.split("\n").forEach((testo, i) => {
    if (!ESENZIONE_TENTATA.test(testo)) return;
    const m = ESENZIONE_BUONA.exec(testo);
    if (!m) {
      rotte.push({ riga: i + 1, testo: testo.trim(), manca: "la scadenza «fino al AAAA-MM-GG» o il perché dopo il trattino" });
      return;
    }
    if (m[3].length < PERCHE_MIN) {
      rotte.push({ riga: i + 1, testo: testo.trim(), manca: "un perché vero (qui ci sono meno di dieci caratteri)" });
      return;
    }
    valide.push({ classe: m[1], scadenza: m[2], perche: m[3], riga: i + 1 });
  });
  return { valide, rotte };
}

/** In questo file una scritta «sorvegliante: ok …» è una DICHIARAZIONE o solo una menzione?
 *  Dichiarazione solo dove qualcosa si esegue: codice, non prosa, non i file che insegnano la forma. */
export const leggeMarcatori = (file = "") => eCodice(file) && !ePROSA(file) && !esenteDaMalattie(file);

/** Questa dichiarazione copre questa voce? `*` copre tutto, ma va scritto apposta. */
export const copre = (esenzione, voce) => esenzione.classe === "*" || esenzione.classe === voce.classe;

/**
 * Applica le esenzioni alle voci. Pura: riceve i contenuti, non li legge dal disco.
 *
 * Tre esiti, e il terzo è quello che rende la cosa un freno invece di un interruttore:
 *   · esenzione viva      → la voce esce dall'elenco, e viene CONTATA a parte (mai sparita in
 *                           silenzio: un'esenzione muta è la stessa bugia con il segno cambiato).
 *   · esenzione scaduta   → la voce resta E si porta dietro la data di scadenza.
 *   · esenzione malfatta  → la voce resta, e ne nasce una nuova sulla scritta rotta.
 *
 * Le informative non si esentano: `raggio` e `deriva` sono quadri, non compiti, e non entrano
 * nemmeno nel contatore (vedi il blocco dell'esito). Esentare una domanda non vuol dire niente.
 */
export function filtraEsentate(voci = [], contenutoPerFile = new Map(), oggi = "") {
  const tenute = [];
  const esentate = [];
  const cache = new Map();
  const dichiarate = (file) => {
    if (!file) return { valide: [], rotte: [] };
    if (!cache.has(file)) cache.set(file, esenzioniDichiarate(contenutoPerFile.get(file) ?? ""));
    return cache.get(file);
  };

  for (const v of voci) {
    if (v.gravita === "informativa") {
      tenute.push(v);
      continue;
    }
    const { valide } = dichiarate(v.file);
    const viva = valide.find((e) => copre(e, v) && e.scadenza >= oggi);
    if (viva) {
      esentate.push({ ...v, esenzione: viva });
      continue;
    }
    const scaduta = valide.find((e) => copre(e, v));
    tenute.push(
      scaduta
        ? { ...v, cosa: `${v.cosa} — l'esenzione era scaduta il ${scaduta.scadenza}`, scaduta: scaduta.scadenza }
        : v,
    );
  }

  // Le scritte rotte: una voce per ognuna, anche nei file dove non c'era nient'altro da dire. È il
  // caso in cui il silenzio sarebbe peggio del rosso — chi l'ha scritta CREDE di aver risposto.
  for (const [file, contenuto] of contenutoPerFile) {
    for (const r of esenzioniDichiarate(contenuto).rotte) {
      tenute.push({
        classe: "esenzione-malfatta",
        gravita: "media",
        file,
        riga: r.riga,
        cosa: `esenzione scritta ma non valida: manca ${r.manca}`,
        perche: "così non zittisce niente, e chi l'ha scritta crede di aver risposto. Una senza scadenza sarebbe peggio: è la porta di AR-338, l'esenzione perpetua ottenuta per distrazione.",
        domanda: "la forma è `sorvegliante: ok <classe|*> fino al AAAA-MM-GG — <perché>`. Fino a quando vale, e perché?",
      });
    }
  }

  return { voci: tenute, esentate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ⓒ LA FUSIONE IN CORSO (4/8) — il falso rosso che questo repo ha già pagato (AR-503).
//
// `git diff HEAD` prende TUTTO l'albero di lavoro, e durante un merge o un rebase l'albero contiene
// anche le righe che sta portando dentro qualcun altro. La guardia le ha già chiamate mie una volta.
// Non si può disambiguare davvero — nel mezzo di un merge «mio» non ha un confine netto — e infatti
// qui non si prova: si DICHIARA. Le voci restano visibili, perché possono benissimo essere vere; ma
// l'esito diventa cieco, e un cieco non è verde né rosso. È la differenza fra sbagliare e mentire.
// ─────────────────────────────────────────────────────────────────────────────

/** I file che git lascia nella SUA cartella mentre una fusione è a metà. Non è un elenco dedotto dai
 *  casi che ho visto (sarebbe AR-347): sono gli stati che git documenta, tutti.
 *
 *  Nomi NUDI, non percorsi: dove sia la cartella di git lo sa solo git. In un worktree `.git` è un
 *  FILE che punta altrove e `MERGE_HEAD` vive sotto `.git/worktrees/<nome>/` — quindi un `.git/…`
 *  scritto a mano qui non troverebbe mai niente. L'ho scoperto provando questa riparazione dal vivo
 *  dentro un worktree: il controllo esisteva, la prova pura era verde e la fusione non veniva
 *  riconosciuta. Un percorso costruito a mano al posto di una domanda alla porta — la stessa forma
 *  di AR-339, e stavolta l'ha presa il collaudo end-to-end invece della rilettura. */
/*  ⚠️ `REBASE_HEAD` NON è in questo elenco, e la sua assenza è il punto (4/8).
 *
 *  Gli altri stati git li CANCELLA quando l'operazione finisce; `REBASE_HEAD` no: resta lì a
 *  indicare l'ultimo commit riapplicato, anche a rebase concluso da ore. Con quel nome dentro
 *  l'elenco, il primo rebase rendeva questa guardia cieca PER SEMPRE in quel clone — e in silenzio,
 *  perché ⚪ si legge come «prudenza», non come «rotto».
 *
 *  Il conto vero è sul VPS, dove `git-pr.mjs` ribasa a OGNI pull request: lì la guardia si sarebbe
 *  spenta al primo lavoro e nessuno avrebbe collegato il ⚪ alla causa. Trovato il 4/8 sul mio stesso
 *  cancello, dopo aver riallineato un ramo: quattro guardiani verdi e questo ⚪ senza motivo visibile.
 *
 *  Il rebase VERO in corso resta coperto: git tiene `rebase-merge/` o `rebase-apply/` finché non
 *  finisce, e quelle due righe sono qui sotto. */
export const STATI_FUSIONE = [
  ["MERGE_HEAD", "una fusione (merge)"],
  ["rebase-merge", "un rebase interattivo"],
  ["rebase-apply", "un rebase o un `git am`"],
  ["CHERRY_PICK_HEAD", "un cherry-pick"],
  ["REVERT_HEAD", "un revert"],
];

/** Quale fusione è in corso, o `null`. Pura: la domanda «git ha questo file di stato?» arriva da
 *  fuori, perché solo chi tocca il disco sa dove git tenga la sua cartella. */
export function fusioneInCorso(esiste = () => false) {
  const trovato = STATI_FUSIONE.find(([nome]) => esiste(nome));
  return trovato ? trovato[1] : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ⓑ I SALTI DICHIARATI e Ⓓ L'ALTRO REPO (4/8) — due cecità legittime, taciute entrambe.
//
// Non hanno niente in comune se non la forma del difetto, che è la stessa e vale la pena scriverla
// una volta: una guardia può benissimo DECIDERE di non guardare una cosa (un file da mezzo mega a
// ogni Edit, un repo che non è il suo). Quella scelta è giusta. Quello che non può fare è lasciar
// credere di averla guardata — perché a quel punto la parte non misurata e la parte pulita escono
// dalla stessa bocca con lo stesso colore. È letteralmente la prima riga del registro delle malattie
// di questa casa: «il verde non vuol dire niente».
// ─────────────────────────────────────────────────────────────────────────────

/** Oltre questo, un file nuovo non si apre. Non è pigrizia: un export finito lì per sbaglio farebbe
 *  leggere megabyte a OGNI modifica, e una guardia lenta viene staccata come una rumorosa. */
export const TETTO_BYTE = 512 * 1024;

/** Quanti nomi mostrare prima di passare al conteggio: la busta deve restare leggibile in un colpo. */
export const NOMI_IN_CHIARO = 3;

const elencoCorto = (f = []) =>
  `${f.slice(0, NOMI_IN_CHIARO).join(", ")}${f.length > NOMI_IN_CHIARO ? ` (+${f.length - NOMI_IN_CHIARO})` : ""}`;

/**
 * Ⓐ Il perimetro vuoto è una risposta o una cecità?
 *
 * Dipende da chi ha chiesto. Senza `base`, «albero pulito» vuol dire davvero «non c'è niente da
 * guardare»: è la risposta giusta e vale 0. Con un `base` esplicito no — qualcuno mi ha chiesto di
 * confrontare con QUALCOSA, e non aver trovato niente significa che il confronto non ha funzionato.
 * È il caso esatto in cui la CI stampava verde da un albero appena clonato.
 */
export function motiviPerimetro({ base = null, nToccati = 0, nRimossi = 0 } = {}) {
  if (!base || nToccati || nRimossi) return [];
  return [`confronto con «${base}» a mani vuote: nessun file nel perimetro, quindi non ho misurato niente`];
}

/** I salti di questo giro, detti in italiano. Pura: riceve gli elenchi, non tocca il disco. */
export function motiviSalti({ grossi = [], illeggibili = [] } = {}) {
  const fuori = [];
  if (grossi.length) fuori.push(`${grossi.length} file nuovo/i oltre il tetto dei byte, non aperto/i: ${elencoCorto(grossi)}`);
  if (illeggibili.length) fuori.push(`${illeggibili.length} file nuovo/i illeggibile/i: ${elencoCorto(illeggibili)}`);
  return fuori;
}

/** Dove sta la copia del sito. Da `MARKETPLACE_REPO` se c'è — la stessa porta che usano i workflow e
 *  i senior — altrimenti la cartella dove `collega-marketplace.mjs` la mette. */
export const CARTELLA_MARKETPLACE = "marketplace";

/**
 * L'avviso sull'altro repo. Pura, così la prova può simulare una copia sporca senza clonare niente.
 *
 * Silenzio in due casi, e sono due «no» diversi: la copia non c'è (allora non sto lavorando sul sito
 * e non c'è niente da dichiarare) oppure è pulita (nessun lavoro non committato che io stia perdendo
 * di vista). Parla solo quando c'è del lavoro vero fuori dal mio sguardo.
 */
export function motiviMarketplace({ presente = false, sporchi = 0, leggibile = true } = {}) {
  if (!presente) return [];
  if (!leggibile) return [`la copia del sito in ${CARTELLA_MARKETPLACE}/ c'è ma non ho potuto chiederle come sta: non so se ci sto lasciando del lavoro non guardato`];
  if (!sporchi) return [];
  return [`${sporchi} file modificati nel repo del sito (${CARTELLA_MARKETPLACE}/): è un altro repo, lì non arrivo — nessuno dei miei controlli li ha guardati`];
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-713 — «PROVA ACCECATA» SI GIUDICA SUL FILE, E NON MENTRE QUALCUNO LO TIENE ROTTO APPOSTA.
//
// Due modi di gridare al lupo su un lavoro sano, e tutti e due sono stati misurati addosso a questa
// guardia il 15/8, undici volte di fila su `cervello/scrivi-json.mjs` mentre il pezzo c'era eccome:
//
//   ① IL PEZZO CHE MI ARRIVA NON È IL FILE. Il giudizio poggiava su `t.contenuto`, cioè su quello
//      che il chiamante ha voluto passare. Oggi il chiamante di casa legge da disco — ma è una sua
//      cortesia, non una regola: il giorno che un secondo canale passa il frammento della modifica,
//      ogni mutazione il cui appiglio sta FUORI da quel frammento risulta orfana e non lo è. La cura
//      non è ricordarsi di leggere il file: è che a leggerlo sia il controllo, per chiunque lo chiami.
//
//   ② LO STRUMENTO CHE MISURA TIENE IL FILE ROTTO. `non-vacuita.mjs` rompe il fix apposta per
//      pretendere il rosso, e mentre il test gira quel file su disco NON contiene `cerca`: è il suo
//      mestiere. Accusarlo in quella finestra è accusare la misura di essere una malattia. Il
//      foglietto di AR-708 (`_tmp_non-vacuita-in-corso.json`) dice quale file è sotto misura in
//      questo momento: leggerlo costa una `readFile` e toglie di mezzo un'intera classe di falsi.
//
// Perché conta più di un fastidio: un allarme grave ripetuto undici volte su un lavoro sano insegna
// a scorrere anche quelli veri (è il verso di AR-699). Un guardiano rumoroso finisce spento come uno
// lento.
// ─────────────────────────────────────────────────────────────────────────────

/** Il nome del foglietto che `non-vacuita.mjs` lascia mentre tiene un file rotto apposta. */
export const FOGLIETTO_MISURA = "_tmp_non-vacuita-in-corso.json";

/**
 * Quali file uno strumento di misura sta tenendo rotti ADESSO. Pura: entra il testo del foglietto
 * (o `null` se non c'è), esce l'insieme dei file da non accusare più il motivo di eventuale cecità.
 */
export function fileSottoMisura(testoFoglietto = null) {
  if (testoFoglietto === null || testoFoglietto === undefined) return { file: new Set(), motivo: null };
  if (typeof testoFoglietto !== "string" || !testoFoglietto.trim()) {
    return { file: new Set(), motivo: `${FOGLIETTO_MISURA} c'è ma è vuoto: non so quale file è sotto misura, quindi giudico tutto` };
  }
  let nota;
  try {
    nota = JSON.parse(testoFoglietto);
  } catch (e) {
    return { file: new Set(), motivo: `${FOGLIETTO_MISURA} non è JSON (${e.message}): non so quale file è sotto misura, quindi giudico tutto` };
  }
  if (!nota || typeof nota.file !== "string" || !nota.file.trim()) {
    return { file: new Set(), motivo: `${FOGLIETTO_MISURA} non nomina nessun file: non so quale file è sotto misura, quindi giudico tutto` };
  }
  return { file: new Set([nota.file]), motivo: null };
}

/**
 * Il testo su cui giudicare le mutazioni di un file. Il disco COMANDA: `t.contenuto` è ciò che il
 * chiamante ha passato, e su una modifica parziale non è il file intero (AR-713).
 *
 * @returns {{testo:string|null, motivo:string|null, sottoMisura:boolean}}
 */
export function letturaPerAccecate(file, t = {}, leggi = null, inMisura = new Set()) {
  if (inMisura.has(file)) return { testo: null, motivo: null, sottoMisura: true };
  if (typeof leggi !== "function") {
    return { testo: null, motivo: "non mi è stato dato un modo di leggere il file da disco", sottoMisura: false };
  }
  try {
    const testo = leggi(file);
    if (typeof testo !== "string") return { testo: null, motivo: "il file non c'è più su disco", sottoMisura: false };
    return { testo, motivo: null, sottoMisura: false };
  } catch (e) {
    return { testo: null, motivo: `non ho potuto leggerlo da disco (${e.message || e})`, sottoMisura: false };
  }
}

/**
 * Il verdetto sulle mutazioni di UN file. Pura: entra il testo già letto, escono voci e motivi.
 * Un testo che non ho potuto avere non è «nessuna mutazione accecata»: è un ⚪ che si dichiara.
 */
export function accecate(file, mutantiDelFile = [], lettura = {}) {
  const voci = [];
  const motivi = [];
  if (!mutantiDelFile.length) return { voci, motivi };
  if (lettura.sottoMisura) {
    motivi.push(
      `${file}: uno strumento di misura lo sta tenendo rotto apposta in questo momento (${FOGLIETTO_MISURA}) — le sue ${mutantiDelFile.length} mutazioni non le giudico finché la corsa non finisce`,
    );
    return { voci, motivi };
  }
  if (typeof lettura.testo !== "string") {
    motivi.push(
      `${file}: ha ${mutantiDelFile.length} mutazione/i ma ${lettura.motivo || "non ho il contenuto"} — non ho potuto controllare se le ho accecate`,
    );
    return { voci, motivi };
  }
  for (const mu of mutantiDelFile) {
    if (!mu.cerca) continue;
    if (lettura.testo.includes(mu.cerca)) continue;
    voci.push({
      classe: "prova-accecata",
      gravita: "grave",
      file,
      riga: null,
      cosa: `la mutazione di ${mu.difetto || "?"} («${mu.nome || ""}») non trova più il suo pezzo in questo file`,
      perche:
        "quel fix era protetto da una prova che sapeva diventare rossa. Adesso la prova non ha più niente da rompere: il fix resta, la difesa no — e nessuno se ne accorgerà, perché il test continua a passare.",
      domanda: `ho spostato quel pezzo (allora aggiorna \`cerca\` in cervello/mutanti.json) o l'ho rimosso (allora ho appena disfatto ${mu.difetto || "un fix"})?`,
    });
  }
  return { voci, motivi };
}

/**
 * @param {object} ing
 * @param {Array<{file:string, aggiunte:Array<{n:number,testo:string}>, contenuto?:string|null}>} ing.toccati
 * @param {Array<object>} ing.malattie   registro malattie.json (campo `malattie`)
 * @param {Array<object>} ing.mutanti    registro mutanti.json (campo `mutanti`)
 * @param {Map<string,string[]>} ing.importatori  file toccato → chi lo nomina
 * @param {(p:string)=>boolean} ing.esiste        esiste questo percorso nel repo?
 * @param {Array<{file:string, rimosse:Array<{n:number,testo:string}>, cancellato?:boolean}>} ing.rimossi
 * @param {Map<string,string>} ing.difese         percorso → perché qualcun altro lo dichiara difesa
 * @returns {{voci:Array<object>, cieco:boolean, motivi:string[]}}
 */
export function sorveglia({
  toccati = [],
  malattie = [],
  mutanti = [],
  importatori = new Map(),
  esiste = () => true,
  rimossi = [],
  difese = new Map(),
  oggi = "",
  leggi = null,
  inMisura = new Set(),
} = {}) {
  const voci = [];
  const motivi = [];

  // ⏱️ IL BUDGET DI TEMPO PER PATTERN (AR-542, trovato dall'analisi di sicurezza del 4/8).
  //
  // I pattern arrivano da `malattie.json`, e una regex scritta male può impiegare un tempo enorme su
  // una riga cortissima: misurato, `(a+)+$` su UNA riga di 29 caratteri tiene occupata la guardia
  // 19.883 ms. L'hook ha un tetto di 15 secondi — quindi una malattia maldestra non rende lento il
  // sorvegliante: lo fa UCCIDERE a metà, e il verdetto non arriva a nessuno. Cioè il canale muto di
  // AR-465 per un'altra strada, e stavolta senza che nessuno se ne accorga.
  //
  // Non si può interrompere una regex a metà in JavaScript. Quello che si può fare è misurare quanto
  // costa e smettere quando ha già mangiato troppo — dichiarandolo, perché una malattia che non ho
  // potuto cercare non è una malattia assente.
  const speso = new Map();
  const troppoLenta = (id) => {
    if ((speso.get(id) || 0) <= BUDGET_PATTERN_MS) return false;
    if (!speso.get(`detto:${id}`)) {
      speso.set(`detto:${id}`, 1);
      motivi.push(`malattia ${id}: il suo pattern ha già consumato ${speso.get(id)} ms, l'ho lasciata indietro su questo file — non è un verde, è una misura che non ho finito`);
    }
    return true;
  };

  // Un registro vuoto non è un repo sano: è una guardia che non cerca niente. Lo dico, non lo taccio.
  if (!malattie.length) motivi.push("registro malattie vuoto: non so quali forme di difetto cercare");
  if (!mutanti.length) motivi.push("registro mutanti vuoto: non posso sapere se ho accecato una prova");

  for (const t of toccati) {
    const file = t.file;
    const aggiunte = t.aggiunte || [];

    // ① malattia-nuova — le malattie censite, cercate solo sulle righe che aggiungo io.
    for (const m of esenteDaMalattie(file) ? [] : malattie) {
      if (!m.pattern) continue;
      if (Array.isArray(m.estensioni) && m.estensioni.length && !m.estensioni.some((e) => file.endsWith(e))) continue;
      // `percorsi` (facoltativo): alcune malattie sono regole di CASA, non di linguaggio — valgono in
      // un file preciso e altrove sarebbero un falso rosso. Un titolo che nomina un AR-xxx è un
      // difetto nella coda che legge Nicola e una cosa normalissima in una scheda del cantiere.
      if (Array.isArray(m.percorsi) && m.percorsi.length && !m.percorsi.some((p) => file.startsWith(p))) continue;
      // (Alla fusione del 4/8 QUI c'era una seconda copia del controllo sugli `esenti`: due sessioni
      // hanno curato lo stesso difetto nella stessa ora. Resta la versione di sotto, più severa —
      // pretende il PERCHÉ scritto — e con la sua mutazione già registrata. Due copie divergono.)
      let re;
      try {
        re = new RegExp(m.pattern);
      } catch {
        motivi.push(`malattia ${m.id}: pattern non compilabile, non l'ho potuta cercare`);
        continue;
      }
      // L'esenzione GIÀ DICHIARATA vale anche qui (AR-531).
      //
      // `malattie.json` porta per ogni forma un elenco `esenti` con file e PERCHÉ, e la spazzata dei
      // fratelli lo rispetta. Questo controllo no: cercava il pattern sulle righe aggiunte senza mai
      // guardare se quel file fosse già stato dichiarato esente. Il 4/8 ha accusato quattordici volte
      // di fila `pre-scrittura.mjs` — che è il guardiano che INTERCETTA il bypass, deve nominarlo per
      // riconoscerlo, ed era esente con un motivo scritto da un'altra sessione poche ore prima.
      // Quattordici allarmi su una riga dichiarata: è il rumore che spegne i freni.
      //
      // L'esenzione conta solo se porta il suo perché: una senza motivo resta un'accusa viva, perché
      // «esente» senza spiegazione è il modo educato di zittire (AR-338).
      const esente = (m.esenti || []).some((e) => e?.file === file && String(e?.perche || "").trim());
      if (esente) continue;
      for (const r of aggiunte) {
        // Il commento che spiega una malattia non è la malattia: stessa regola di spazzata-fratelli,
        // stessa funzione — non una seconda copia che col tempo divergerebbe.
        const pulita = senzaCommenti(r.testo, file);
        if (!pulita.trim()) continue;
        if (troppoLenta(m.id)) break; // il budget è finito: vedi `troppoLenta`, il motivo è già scritto
        const inizio = Date.now();
        const trovata = re.test(pulita);
        speso.set(m.id, (speso.get(m.id) || 0) + (Date.now() - inizio));
        if (trovata) {
          voci.push({
            classe: "malattia-nuova",
            gravita: "grave",
            file,
            riga: r.n,
            cosa: `riga nuova con la malattia «${m.id}»: ${m.nome || ""}`.trim(),
            perche: m.perche_e_grave || "forma di difetto già censita: qui si sta allargando",
            domanda: `questa riga la sto aggiungendo io adesso — la curo, o la dichiaro esente col PERCHÉ in cervello/malattie.json?`,
          });
        }
      }
    }

    // ② prova-accecata — ho toccato un file su cui poggia una mutazione, e il suo appiglio è sparito.
    //
    // AR-713 — il giudizio si dà sul FILE, non sul pezzo che mi è arrivato, e non mentre qualcuno lo
    // sta tenendo rotto apposta. Il testo lo prepara `letturaPerAccecate`; il verdetto lo dà
    // `accecate`, che è pura e si può eseguire.
    const suQuestoFile = mutanti.filter((mu) => mu.file === file);
    if (suQuestoFile.length) {
      const esito = accecate(file, suQuestoFile, letturaPerAccecate(file, t, leggi, inMisura));
      voci.push(...esito.voci);
      motivi.push(...esito.motivi);
    }

    // ③ gate-orfano — un freno dichiarato che non può scattare.
    for (const r of eFixture(file) ? [] : aggiunte) {
      const g = /"gate"\s*:\s*"([^"]+)"/.exec(r.testo);
      if (!g) continue;
      const cmd = g[1];
      const percorso = (cmd.match(/[\w./-]+\.(?:m?js|sh|cjs|bats)/) || [])[0];
      if (!percorso) {
        voci.push({
          classe: "gate-orfano",
          gravita: "grave",
          file,
          riga: r.n,
          cosa: `gate «${cmd}» non nomina nessun file: non si può nemmeno controllare che esista`,
          perche: "un freno che nessuno può puntare non è un freno: è una riga che fa salire il conteggio.",
          domanda: "quale comando, con quale file, fallisce se questa lezione viene violata?",
        });
        continue;
      }
      if (esiste(percorso)) continue;
      // Terza strada dichiarata: il test può stare in una PR non ancora mergiata. È uno stato vero e
      // frequente, e chiamarlo «orfano» insegna a ignorare il guardiano (è il falso rosso che ho
      // trovato io stesso il 30/7 su L-2026-0730-530). Ma resta GIALLO e vuole il numero della PR:
      // un'attesa senza riferimento è un'esenzione travestita, ed è la porta di AR-338.
      const intorno = aggiunte.filter((x) => Math.abs(x.n - r.n) <= VICINANZA_NOTA);
      const pr = intorno.map((x) => /PR\s*#(\d+)/.exec(x.testo)).find(Boolean);
      voci.push(
        pr
          ? {
              classe: "gate-in-attesa",
              gravita: "media",
              file,
              riga: r.n,
              cosa: `gate «${percorso}» non esiste ancora su questo ramo, dichiarato in attesa della PR #${pr[1]}`,
              perche: "è uno stato legittimo, ma finché quella PR non è mergiata il freno NON frena: conta come debito, non come difesa.",
              domanda: `la PR #${pr[1]} è ancora aperta? se è stata chiusa senza merge, questo gate è orfano e la lezione è senza freno.`,
            }
          : {
              classe: "gate-orfano",
              gravita: "grave",
              file,
              riga: r.n,
              cosa: `gate «${percorso}» non esiste`,
              perche: "«non fatto» diventa indistinguibile da «puntatore rotto», e il conto dei freni sale senza che la difesa esista.",
              domanda: "scrivo il test adesso, o togliergli il campo `gate` e dichiarare il debito?",
            }
      );
    }

    // ④ perimetro-letterale — un elenco di file scritto a mano dentro un guardiano.
    if (/^cervello\/[^/]+\.mjs$/.test(file) && !eFixture(file)) {
      for (const r of aggiunte) {
        if (!/^\s*(?:const|let|var)\s+[A-Z][A-Z0-9_]*\s*=\s*\[/.test(r.testo)) continue;
        // I letterali possono stare sulla stessa riga o sulle righe aggiunte subito sotto.
        const blocco = [r, ...aggiunte.filter((x) => x.n > r.n && x.n <= r.n + 8)]
          .map((x) => x.testo)
          .join("\n");
        const chiuso = blocco.slice(0, blocco.indexOf("]") + 1 || undefined);
        const letterali = chiuso.match(/["'][^"'\n]*\.(?:md|m?js|ts|tsx|json|sh)["']/g) || [];
        if (letterali.length >= LETTERALI_MIN) {
          voci.push({
            classe: "perimetro-letterale",
            gravita: "media",
            file,
            riga: r.n,
            cosa: `elenco di ${letterali.length} file scritto a mano in un guardiano: ${letterali.slice(0, 4).join(", ")}${letterali.length > 4 ? "…" : ""}`,
            perche: "è AR-347 alla lettera: un perimetro dedotto dagli esempi che avevo sotto gli occhi. Il guardiano dirà verde sui file che ho elencato e resterà cieco su tutti gli altri — cioè il difetto si chiuderà lasciando viva la classe.",
            domanda: "questo elenco l'ho MISURATO (scansione + esenzioni motivate) o l'ho dedotto dai punti dove avevo appena visto il difetto?",
          });
        }
      }
    }

    // ⑧ esenzione-aggiunta — un percorso che entra al riparo da un controllo.
    if (!eFixture(file)) {
      const esenti = esenzioniAggiunte(aggiunte, file);
      if (esenti.length) {
        voci.push({
          classe: "esenzione-aggiunta",
          gravita: "media",
          file,
          riga: null,
          cosa: `${esenti.length} percorso/i messo/i al riparo da un controllo: ${esenti.slice(0, 4).join(", ")}${esenti.length > 4 ? "…" : ""}`,
          perche: "è la porta di AR-338: zittire una malattia senza curarla. Il conteggio migliora, il difetto resta, e chi legge il verde crede che sia stato riparato.",
          domanda: "l'ho esentato con un PERCHÉ scritto accanto e una data in cui rientra, o l'ho tolto di mezzo perché faceva rosso?",
        });
      }
    }

    // ⑤ raggio — il quadro ampio: chi altro poggia su ciò che ho toccato, DIRETTAMENTE e no.
    const voce = importatori.get(file);
    const diretti = Array.isArray(voce) ? voce : voce?.diretti || [];
    const indiretti = Array.isArray(voce) ? [] : voce?.indiretti || [];
    if (diretti.length || indiretti.length) {
      const elenco = [...diretti, ...indiretti.map((f) => `${f} (a due passi)`)];
      voci.push({
        classe: "raggio",
        gravita: "informativa",
        file,
        riga: null,
        diretti: diretti.length,
        indiretti: indiretti.length,
        cosa:
          `${diretti.length + indiretti.length} altri file poggiano su questo` +
          `${indiretti.length ? ` (${diretti.length} diretti, ${indiretti.length} per interposta persona)` : ""}: ` +
          `${elenco.slice(0, 6).join(", ")}${elenco.length > 6 ? ` (+${elenco.length - 6})` : ""}`,
        perche: "AR-338, AR-344 e AR-415 hanno la stessa forma: ho cambiato un lettore condiviso e il significato è cambiato per tutti gli altri, senza che nessuno lo elencasse.",
        domanda: `per ognuno di questi: il cambiamento che ho fatto vale ancora, o cambia il significato di quello che leggono?`,
      });
    }
  }

  // ── ⑩⑪ IL GIUDIZIO SULLA RIPARAZIONE (AR-509, Nicola 3/8: «fallo giudicare se la riparazione è
  // giusta»). Fino a qui questo file dichiarava di non farlo — «cinque misure meccaniche su un diff:
  // dove passa un forse, la risposta è tacere» — e la dichiarazione resta VERA: non giudico se il fix
  // funziona (quello lo dicono le prove), non leggo il cantiere, non do voti. Giudico due modi di
  // riparare che si vedono nel diff e che in questa casa sono già costati due difetti interi:
  //
  //   ⑩ ho curato l'ISTANZA e lasciato la CLASSE. La riga che ho tolto conteneva una malattia
  //      censita — quindi stavo riparando — e nello stesso file ne restano altre uguali. È AR-347
  //      alla lettera: «chi lo ha scritto ha riparato i file dove aveva appena visto il difetto».
  //      Non è un'accusa: è la domanda che nessuno mi fa quando il fix sembra finito.
  //
  //   ⑪ ho cambiato la PROVA invece del CODICE. Ho tolto o riscritto righe in un file di test e il
  //      file che quel test difende non l'ho toccato. Aggiungere prove nuove è sano e non entra qui
  //      (guardo solo le righe RIMOSSE dal test): quello che questo controllo pesca è il gesto di
  //      far tornare verde il termometro invece di curare la febbre. Il cancello del lotto vede il
  //      test cancellato per intero (⑥a); questo vede l'asserzione tolta di nascosto dentro un file
  //      che resta vivo, e nessuno la guardava.
  const perNome = new Map(toccati.map((t) => [t.file, t]));
  // I nomi che dopo questa modifica ESISTONO ancora. I cancellati vanno tolti, o un file morto si
  // assolverebbe da solo: «c'è un file con lo stesso nome fra quelli toccati» sarebbe lui stesso.
  // (Trovato dalle prove, non dalla rilettura: le prime due erano rosse esattamente per questo.)
  const morti = new Set(rimossi.filter((r) => r.cancellato).map((r) => r.file));
  const nomiNuovi = new Set(toccati.filter((t) => !morti.has(t.file)).map((t) => basenameSemplice(t.file)));
  // Le righe AGGIUNTE in TUTTO il delta, senza commenti. Serve a ⑥b: la domanda che quella guardia
  // pone è «l'ho spostato altrove in questa stessa modifica?», e fino al 3/8 la risposta la cercava
  // solo dentro lo STESSO FILE — cioè in tutti i posti tranne quello dove uno spostamento finisce
  // (AR-516). Trovato dal vivo: ho spostato un contatore dal cancello del lotto alla visita, in un
  // solo commit, e la guardia l'ha chiamato «freno spento» ventidue volte di fila. Un allarme che
  // grida mentre guardi la riparazione è un allarme che si impara a scorrere.
  //
  // AR-557 — E GUARDA SOLO GLI ALTRI FILE. Prima guardava anche questo, cioè copriva già da sola
  // anche il caso dello spostamento DENTRO lo stesso file: le due domande diventavano una, la riga
  // sopra (`testoAggiunto`) non decideva più niente, e la mutazione che la spegneva lasciava il test
  // verde. Una prova che resta verde a fix rimosso è un difetto chiuso il cui freno non frena — cioè
  // un verde che vale zero. Ora le due domande sono separate: qui gli ALTRI file, sopra questo.
  const aggiunteSenzaCommenti = new Map(
    toccati.map((t) => [t.file, (t.aggiunte || []).map((a) => senzaCommenti(a.testo, t.file)).join("\n")]),
  );
  for (const r of rimossi) {
    const file = r.file;
    const rimosse = r.rimosse || [];
    const aggiunteQui = perNome.get(file)?.aggiunte || [];
    // «L'ho rimesso in QUESTO file?» — la prima delle due domande sullo spostamento.
    const testoAggiunto = aggiunteQui.map((a) => a.testo).join("\n");
    // «L'ho rimesso in un ALTRO file di questa stessa modifica?» — la seconda.
    const aggiuntoOvunque = [...aggiunteSenzaCommenti]
      .filter(([f]) => f !== file)
      .map(([, testo]) => testo)
      .join("\n");

    // ⑥a un FILE cancellato che qualcun altro dichiara difesa. Resta acceso anche sulle prove: un
    //    test cancellato È la difesa che muore, ed è il caso per cui questo controllo esiste.
    if (r.cancellato && difese.has(file)) {
      // Spostato o rinominato? Se un file con lo stesso nome compare fra quelli toccati, non è morto:
      // ha cambiato casa. Punire uno spostamento insegnerebbe a non riordinare mai più niente.
      if (!nomiNuovi.has(basenameSemplice(file))) {
        voci.push({
          classe: "difesa-rimossa",
          gravita: "grave",
          file,
          riga: null,
          cosa: `ho cancellato un file che ${difese.get(file)}`,
          perche: "il conteggio dei freni non cambia — quella riga nei registri c'è ancora — ma la difesa non esiste più. È AR-338 fatto con la gomma: nessuno se ne accorgerà, perché non resta niente che possa diventare rosso.",
          domanda: "l'ho sostituito con qualcosa che fallisce allo stesso modo (allora aggiorna il registro che lo nomina), o l'ho solo tolto?",
        });
      }
    }

    // ⑥b una RIGA rimossa che nomina una difesa, e quel nome non ricompare fra le righe aggiunte.
    //    Una sola regola per due casi veri: il `gate:` tolto da una lezione e il passo tolto dal
    //    cancello del lotto. I commenti no — togliere una frase che CITA un guardiano non lo spegne.
    //
    //    E per lo stesso motivo NIENTE PROSA (AR-503, trovato da questa guardia su sé stessa durante
    //    un merge). In un `.md` non esistono chiamate: ogni riga è una menzione. La guardia ha accusato
    //    la rimozione di «- (ancora vuoto — il primo ESITO si registra con: node cervello/chiusura-
    //    loop.mjs …)» da un quaderno — cioè una riga di ISTRUZIONI cancellata perché il quaderno non
    //    era più vuoto — chiamandola «hai spento un guardiano». È «menzione ≠ chiamata», la quarta
    //    volta in questo repo, stavolta dentro il controllo che quella regola la conosce: in un file
    //    di codice il filtro dei commenti basta, in un file di prosa il commento è TUTTO il file.
    // Il contenuto serve al riconoscimento del referto (AR-556): è il file stesso a dichiarare chi lo
    // riscrive, e senza leggerlo si tornerebbe a un elenco di nomi scritto a mano.
    if (!eFixture(file) && !ePROSA(file) && !eReferto(file, perNome.get(file)?.contenuto ?? null)) {
      for (const riga of rimosse) {
        const pulita = senzaCommenti(riga.testo, file);
        if (!pulita.trim()) continue;
        for (const [p, perche] of difese) {
          if (!pulita.includes(p)) continue;
          if (testoAggiunto.includes(p)) continue;
          // Spostato in un altro file dello stesso delta? Si guarda ovunque, e anche per SOLO NOME:
          // chi lancia un guardiano dal cancello scrive «cervello/x.mjs», chi lo lancia dalla visita
          // scrive «x.mjs», e confrontare i due percorsi per intero significava non riconoscere mai
          // uno spostamento fra i due posti.
          if (aggiuntoOvunque.includes(p) || aggiuntoOvunque.includes(basenameSemplice(p))) continue;
          // E soprattutto: quel freno, DOPO questa modifica, lo chiama ancora qualcuno in questo
          // stesso file? (AR-536.) Le tre righe sopra guardano tutte il GESTO — cosa ho tolto, cosa
          // ho messo — e nessuna guarda il RISULTATO. Su un registro dove lo stesso `gate:` compare
          // in dodici schede, cancellarne una è togliere un doppione, non spegnere un freno.
          if (difesaAncoraChiamata(perNome.get(file)?.contenuto ?? null, p, file)) continue;
          voci.push({
            classe: "difesa-rimossa",
            gravita: "grave",
            file,
            riga: riga.n,
            cosa: `ho tolto la riga che chiamava «${p}», che ${perche}`,
            perche: "un freno smette di frenare nel momento in cui nessuno lo lancia più, e da fuori non si vede: i registri lo contano ancora.",
            domanda: `l'ho spostato altrove in questa stessa modifica, o «${p}» adesso non lo esegue più nessuno?`,
          });
        }
      }
    }

    // ⑩ la classe rimasta viva dopo l'istanza curata (AR-509).
    if (!esenteDaMalattie(file)) {
      for (const c of classeRimasta(rimosse, perNome.get(file)?.contenuto ?? null, malattie, file)) {
        voci.push({
          classe: "riparazione-parziale",
          gravita: "media",
          file,
          riga: c.esempio,
          cosa: `qui ho appena curato «${c.malattia}», e nello stesso file ne restano ${c.quante} (la prima alla riga ${c.esempio})`,
          perche: "è AR-347 alla lettera: si ripara dove il difetto è stato VISTO, e la forma resta viva due righe più sotto. Il conto migliora, la classe no.",
          domanda: "le altre le curo adesso che ho il file aperto e la testa dentro, o le lascio a un me stesso futuro che non saprà nemmeno che ci sono?",
        });
      }
    }

    // ⑪ la prova indebolita mentre il codice resta com'era (AR-509, tarata col saldo in AR-530).
    const ind = provaIndebolita({ file, rimosse, aggiunte: aggiunteQui, toccati: toccati.map((t) => t.file), esiste });
    if (ind) {
      voci.push({
        classe: "prova-indebolita",
        gravita: "grave",
        file,
        riga: ind.esempio,
        cosa: `questo file adesso prova ${ind.quante} caso/i in meno (${ind.tolte} tolti, ${ind.messe} messi) e non ho toccato ${ind.difeso}`,
        perche: "far tornare verde il termometro non cura la febbre. Un test cancellato per intero lo vede il controllo ⑥; un'asserzione tolta dentro un file che resta vivo non la vedeva nessuno — e il conto delle prove resta identico.",
        domanda: "quel caso non serviva più perché il codice è cambiato (ma allora il codice dov'è?), o l'ho tolto perché era rosso?",
      });
    }

    // ⑦ soglia-allentata — un tetto che sale o un minimo che scende.
    if (!eFixture(file) && !eTelemetria(file)) {
      for (const s of soglieAllentate(rimosse, aggiunteQui, file)) {
        voci.push({
          classe: "soglia-allentata",
          gravita: "grave",
          file,
          riga: null,
          cosa: `«${s.chiave}» passa da ${s.da} a ${s.a}: il metro si è spostato, non il codice`,
          perche: "è il peggioramento travestito da pareggio di stampo-metro.mjs: il rosso diventa verde senza che niente sia migliorato, e la volta dopo il metro nuovo sembrerà quello di sempre.",
          domanda: "il tetto l'ho alzato perché il lavoro è cresciuto davvero (e allora dillo, con la data in cui torna giù) o perché il guardiano faceva rosso?",
        });
      }
    }
  }

  // ⑨ deriva — il quadro ampio sul LAVORO, non sul codice. Una domanda, non un'accusa.
  const zone = derivaDelLavoro([...toccati.map((t) => t.file), ...rimossi.map((r) => r.file)]);
  if (zone) {
    voci.push({
      classe: "deriva",
      gravita: "informativa",
      file: null,
      riga: null,
      cosa: `questo lavoro tocca ${zone.length} zone diverse: ${zone.join(", ")}`,
      perche: "è la forma di un lavoro che si è allargato strada facendo. Può essere giusto — un fix serio tocca il codice, la sua prova, il cantiere e la memoria — ma è anche il modo in cui si perde di vista quello per cui si era partiti.",
      domanda: "è ancora UN lavoro solo, o ne sono cominciati altri dentro questo? Se sono due, il secondo va dichiarato adesso, non scoperto alla consegna.",
    });
  }

  // Ⓔ le esenzioni dichiarate, per ultime: prima si guarda tutto, poi si risponde. I file di
  // `SALTA_MALATTIE` non si leggono (vedi il perché accanto alla forma: qui dentro il marcatore è
  // scritto per essere spiegato, e un lettore ingenuo lo prenderebbe per una dichiarazione vera).
  const contenutoPerFile = new Map(
    toccati
      .filter((t) => leggeMarcatori(t.file) && typeof t.contenuto === "string")
      .map((t) => [t.file, t.contenuto]),
  );
  const { voci: rimaste, esentate } = filtraEsentate(voci, contenutoPerFile, oggi);
  // Un'esenzione applicata senza sapere CHE GIORNO è oggi non è un'esenzione: è un interruttore.
  // Meglio dirlo che far finta che la scadenza sia stata controllata.
  if (esentate.length && !oggi) motivi.push("non so che giorno è oggi: le scadenze delle esenzioni non le ho potute controllare");

  return { voci: rimaste, cieco: motivi.length > 0, motivi, esentate };
}

/** Il nome del file senza cartelle. Qui e non da `node:path` perché il cuore resta puro: nessun
 *  modulo di sistema, così una prova lo esegue su percorsi finti di qualunque forma. */
export function basenameSemplice(p = "") {
  return String(p).split("/").pop() || "";
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑨ LA DERIVA (AR-501) — l'altra metà della frase di Nicola del 30/7.
//
// «Sembra che non hai un'auto-revisione mentre stai lavorando, **e un quadro ampio di quello che stai
// facendo**.» La prima metà l'hanno chiusa i controlli ①-⑧. La seconda finora era solo il ⑤ raggio,
// che risponde a «chi altro poggia su questo file» — una domanda sul CODICE. Manca quella sul LAVORO:
// sto ancora facendo la cosa per cui sono partito?
//
// Non è misurabile in generale, e non fingo il contrario: nessuna macchina sa qual era l'intenzione.
// È misurabile UNA cosa sola, ed è quella che si vede quando un lavoro scivola — quante zone diverse
// della casa sta toccando. Un lotto che tocca il cervello, il Pannello, il vault e le consegne può
// essere un lavoro coerente, ma è anche la forma esatta di un lavoro che si è allargato strada
// facendo. Perciò è una DOMANDA (informativa), non un'accusa: chi risponde sono io, ad alta voce.
// ─────────────────────────────────────────────────────────────────────────────

/** Le cartelle che contengono mondi diversi: lì la zona è il secondo livello, non il primo. Senza,
 *  tutto il vault sarebbe «una zona» e il conto non direbbe niente. */
export const CONTENITORI = ["MyCity-Vault", "pannello", "consegne", "creativi", ".claude"];

/** Quante zone diverse prima che valga la pena chiederselo. Cinque e non tre: un lavoro serio tocca
 *  il codice, la sua prova, il cantiere e la memoria — sono già quattro, e sono giuste. */
export const ZONE_MAX = 5;

export function zonaDi(file = "") {
  const p = String(file).split("/");
  return CONTENITORI.includes(p[0]) && p.length > 1 ? `${p[0]}/${p[1]}` : p[0] || "";
}

export function derivaDelLavoro(file = [], soglia = ZONE_MAX) {
  const zone = [...new Set(file.map(zonaDi).filter(Boolean))].sort();
  return zone.length > soglia ? zone : null;
}

/**
 * ⑥b — dopo questa modifica, quel freno lo chiama ancora qualcuno DENTRO QUESTO FILE? (AR-536.)
 *
 * Le tre condizioni che ⑥b aveva prima guardano tutte il GESTO: cosa ho tolto, cosa ho messo qui,
 * cosa ho messo altrove nello stesso delta. Nessuna guardava il RISULTATO — il file com'è rimasto.
 * Su un registro dove lo stesso `gate:` compare in dodici schede diverse, cancellarne una è togliere
 * un doppione: il freno resta chiamato da undici righe, e la guardia gridava lo stesso.
 *
 * Trovato dal vivo il 4/8 unendo `main`: quattro accuse su `apprendimento.json` e `cantiere-difetti.json`
 * — «hai spento cervello/test/sorvegliante.test.mjs» — mentre quel nome nei due file restava scritto
 * 13 e 15 volte e `gate-veri.mjs` usciva 0. Quattro accuse su quattro erano false, e un cancello che
 * non può diventare verde si impara ad aggirare: quella sera stavo per usare `--no-verify`.
 *
 * `senzaCommenti` riga per riga, non `contenuto.includes(p)` secco: se l'unica menzione rimasta è
 * dentro un commento, il freno NON è chiamato da nessuno e l'accusa è giusta. È «menzione ≠ chiamata»
 * — la stessa regola che questo repo ha già pagato cinque volte — applicata al rimedio invece che al
 * difetto, così il rimedio non apre il buco gemello.
 *
 * `null` quando il contenuto non c'è (file illeggibile o cancellato): lì non posso provare che sia
 * vivo, e cieco non è verde — torno `false` e l'accusa resta.
 *
 * @param {string|null} contenuto  il file COME È ADESSO
 * @param {string} p               il nome della difesa (percorso o comando)
 * @param {string} file            serve solo a `senzaCommenti` per scegliere la sintassi
 */
export function difesaAncoraChiamata(contenuto = null, p = "", file = "") {
  if (typeof contenuto !== "string" || !p) return false;
  return contenuto.split("\n").some((riga) => senzaCommenti(riga, file).includes(p));
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑩⑪ IL GIUDIZIO SULLA RIPARAZIONE (AR-509) — le due funzioni pure.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⑩ La classe rimasta viva dopo che ho curato l'istanza.
 *
 * @param {Array<{n:number,testo:string}>} rimosse  le righe che ho tolto da questo file
 * @param {string|null} contenuto                   il file COME È ADESSO
 * @param {Array<object>} malattie                  il registro
 * @returns {Array<{malattia:string, quante:number, esempio:number|null}>}
 *
 * La condizione è doppia apposta: ho tolto una riga malata E il file ne contiene ancora. Con la sola
 * seconda metà accuserei chiunque tocchi un file con del debito dentro — cioè quasi ogni file — e un
 * rosso che si accende sempre viene spento entro la settimana.
 */
export function classeRimasta(rimosse = [], contenuto = null, malattie = [], file = "") {
  if (typeof contenuto !== "string" || !rimosse.length) return [];
  const fuori = [];
  for (const m of malattie) {
    if (!m.pattern) continue;
    if (Array.isArray(m.estensioni) && m.estensioni.length && !m.estensioni.some((e) => file.endsWith(e))) continue;
    let re;
    try {
      re = new RegExp(m.pattern);
    } catch {
      continue;
    }
    const curata = rimosse.some((r) => re.test(senzaCommenti(r.testo, file)));
    if (!curata) continue;
    const righe = contenuto.split("\n");
    const restano = [];
    righe.forEach((r, i) => {
      if (re.test(senzaCommenti(r, file))) restano.push(i + 1);
    });
    if (restano.length) fuori.push({ malattia: m.id, quante: restano.length, esempio: restano[0] });
  }
  return fuori;
}

/** Da un file di prova al file che difende: `cervello/test/x.test.mjs` → `cervello/x.mjs`. `null`
 *  quando il nome non segue la convenzione — e allora taccio, invece di indovinare un percorso. */
export function fileDifeso(test = "") {
  const m = String(test).match(/^(.*)\/test\/(.+)\.test\.(m?js|ts|tsx)$/);
  return m ? `${m[1]}/${m[2]}.${m[3]}` : null;
}

/** Una riga che REGGE una prova: un'asserzione o l'apertura di un caso. `senzaCommenti` prima, o una
 *  riga commentata varrebbe quanto una viva — ed è il modo più comodo di spegnere un controllo. */
export const REGGE_UNA_PROVA = /\bassert\b|\bexpect\(|\btest\(|\bit\(|\bdescribe\(/;
export function conta(righe = [], file = "") {
  return righe.filter((r) => REGGE_UNA_PROVA.test(senzaCommenti(r.testo, file))).length;
}

/**
 * ⑪ Ho indebolito la prova invece di riparare il codice?
 *
 * IL SALDO, NON IL GESTO (AR-530, 4/8 — riparazione di un difetto mio del 3/8). La prima stesura
 * guardava le righe TOLTE: «hai rimosso una riga con un assert e non hai toccato il codice». Sembrava
 * giusto e non lo era, perché per chi legge un diff **sostituire** una riga è toglierne una e
 * aggiungerne un'altra. Risultato misurato attaccando la mia stessa funzione: quattro gesti del tutto
 * legittimi finivano ❌ e BLOCCAVANO il commit —
 *   · rinominare una variabile dentro un file di prova;
 *   · riscrivere il messaggio di un'asserzione;
 *   · cancellare una prova vecchia insieme alla cosa che provava;
 *   · spostare un caso da un file di prova a un altro.
 * Un freno grave che si accende sul lavoro pulito è il freno che si impara ad aggirare — e chi impara
 * `--no-verify` salta nello stesso gesto lo scan dei segreti e il perimetro di main.
 *
 * Adesso conta: quante righe che reggono una prova ho tolto, quante ne ho messe. Parla solo se il
 * SALDO è negativo, cioè se dopo la mia modifica quel file prova di meno. E le aggiunte passano da
 * `senzaCommenti`, altrimenti commentare un'asserzione invece di toglierla — che era il buco gemello,
 * scoperto nello stesso attacco — la farebbe contare come ancora viva.
 */
export function provaIndebolita({ file = "", rimosse = [], aggiunte = [], toccati = [], esiste = () => true } = {}) {
  const difeso = fileDifeso(file);
  if (!difeso || !esiste(difeso)) return null;
  if (toccati.includes(difeso)) return null;
  const tolte = conta(rimosse, file);
  const messe = conta(aggiunte, file);
  const saldo = tolte - messe;
  if (saldo <= 0) return null;
  const esempio = rimosse.find((r) => REGGE_UNA_PROVA.test(senzaCommenti(r.testo, file)));
  return { difeso, quante: saldo, tolte, messe, esempio: esempio ? esempio.n : null };
}

/** Le voci che fanno rosso. `raggio` non è un errore (è il quadro), `media` è un avviso che si legge. */
export function gravi(voci = []) {
  return voci.filter((v) => v.gravita === "grave");
}

// ─────────────────────────────────────────────────────────────────────────────
// IL CANALE — pure anche queste, e per lo stesso motivo del cuore: il modo in cui il verdetto ESCE è
// stato il difetto, non il verdetto. Una prova deve poter eseguire la busta e provare a romperla,
// altrimenti controlla che il codice «sembri giusto» — che è esattamente com'è passato inosservato.
// ─────────────────────────────────────────────────────────────────────────────

/** Il battito vive fuori da git: verificare non deve costare un diff (AR-464). */
export const BATTITO = "cervello/_tmp_sorvegliante-battito.json";

// ─────────────────────────────────────────────────────────────────────────────
// L'ESITO DEL VERDETTO (AR-497) — «ho parlato» non è «mi hanno ascoltato».
//
// PERCHÉ ESISTE. Il battito dimostra che la guardia ha GIRATO. Niente dimostrava che avessi FATTO
// qualcosa. Fra uno scatto e l'altro non c'era memoria: la stessa voce grave poteva tornare venti
// volte identica e nessuno — né io, né il cancello, né Nicola — aveva modo di sapere che era la
// ventesima. È AR-474 un giro più in là: il verdetto arriva a destinazione e poi evapora.
//
// COME. Il battito diventa un registro: ogni voce ha una chiave stabile e un contatore. Se torna,
// la busta lo dice; se torna troppe volte ed è ancora viva all'ultimo scatto, il cancello dello Stop
// non mi lascia chiudere.
//
// COSA NON MISURA, e va scritto qui perché è la parte che si dimentica: non misura che io abbia
// RAGIONATO. Un `raggio` non si «risolve» — è un quadro, non un compito — quindi le informative non
// entrano nel conteggio: farne una colpa creerebbe un debito che non si può estinguere, e un debito
// inestinguibile si impara a ignorare in blocco. Contano solo `grave` e `media`.
// ─────────────────────────────────────────────────────────────────────────────

/** Quante volte una voce può tornare prima che sia il caso di fermarsi. Tre e non due: la seconda
 *  volta può essere lo stesso lavoro ancora in corso, la terza è un andazzo. */
export const INSISTENZA = 3;

/** La chiave di una voce: stabile ai numeri di riga, che cambiano a ogni modifica del file. Senza
 *  questo il contatore ripartirebbe da uno a ogni edit — cioè non conterebbe mai niente. */
export function chiaveVoce(v = {}) {
  return `${v.classe}|${v.file}|${String(v.cosa || "").replace(/\d+/g, "#")}`;
}

/** Il registro aggiornato dopo uno scatto. Le informative non entrano: vedi sopra. */
export function aggiornaViste(viste = {}, voci = [], scatto = 0) {
  const fuori = { ...viste };
  for (const v of voci) {
    if (v.gravita !== "grave" && v.gravita !== "media") continue;
    const k = chiaveVoce(v);
    fuori[k] = { n: (fuori[k]?.n || 0) + 1, scatto, gravita: v.gravita, file: v.file, cosa: v.cosa };
  }
  return fuori;
}

/** Le voci che ho ripetuto abbastanza da non poterle più chiamare «appena viste», e che erano ancora
 *  vive all'ultimo scatto. Il secondo pezzo conta: una voce curata smette di comparire, e continuare
 *  a rinfacciarla sarebbe un guardiano che non si accorge di essere stato ascoltato. */
export function vociInsistenti(viste = {}, scatto = 0, soglia = INSISTENZA) {
  return Object.entries(viste)
    .filter(([, v]) => v.n >= soglia && v.scatto === scatto && v.gravita === "grave")
    .map(([chiave, v]) => ({ chiave, n: v.n, file: v.file, cosa: v.cosa }));
}

/**
 * Le voci comparse DOPO un certo scatto, e ancora vive all'ultimo.
 *
 * Serve al cancello dei senior (AR-527): un senior parte, la guardia scatta N volte mentre lavora, e
 * alla fine la domanda è «cosa è comparso da quando è partito LUI». Senza questo taglio il cancello
 * gli rinfaccerebbe le voci di chi ha lavorato prima — che è la stessa malattia del perimetro largo,
 * spostata dai turni ai senior.
 *
 * `gravi` e `medie` insieme: qui il conteggio non serve a bloccare, serve a raccontare cosa ha
 * lasciato — e una media lasciata a un senior è esattamente il genere di cosa che nessuno riguarda.
 */
export function vociDaScatto(viste = {}, scattoDa = 0, scattoOra = 0) {
  return Object.entries(viste)
    .filter(([, v]) => Number(v.scatto) > scattoDa && Number(v.scatto) === scattoOra)
    .map(([chiave, v]) => ({ chiave, n: v.n, file: v.file, cosa: v.cosa, gravita: v.gravita }));
}

/**
 * La busta che ARRIVA al modello. Un hook PostToolUse che stampa testo semplice finisce nel log di
 * debug; solo `hookSpecificOutput.additionalContext` viene messo accanto al risultato dello strumento.
 * Torna la stringa da stampare, o `null` quando non c'è niente da dire (tacere è la scelta giusta:
 * un avvisatore che parla a ogni modifica viene spento entro la settimana — il battito copre il resto).
 */
export function bustaPerIlModello(voci = [], nToccati = 0, viste = {}, { motivi = [], esentate = [] } = {}) {
  const rossi = gravi(voci);
  const righe = [];
  // «Te l'ho già detto N volte» è la sola parte che trasforma un avviso in un esito: senza, la
  // ventesima ripetizione è indistinguibile dalla prima e non succede niente né a me né al cancello.
  const ancora = (v) => {
    const n = viste?.[chiaveVoce(v)]?.n || 0;
    return n > 1 ? `  ⟲ già detto ${n} volte` : "";
  };
  for (const v of rossi.slice(0, 4)) {
    righe.push(`❌ ${v.classe} · ${v.file}${v.riga ? ":" + v.riga : ""} → ${v.cosa}${ancora(v)}\n   ↳ ${v.domanda}`);
  }
  for (const v of voci.filter((v) => v.gravita === "media").slice(0, 2)) {
    righe.push(`⚠️  ${v.classe} · ${v.file}${v.riga ? ":" + v.riga : ""} → ${v.cosa}${ancora(v)}`);
  }
  const raggi = voci.filter((v) => v.classe === "raggio");
  if (raggi.length) {
    // I due numeri separati (AR-508): «23 dipendenti» e «10 diretti + 13 a due passi» si leggono in
    // modo diverso — il secondo dice anche QUANTO lontano arriva il cambiamento, e il primo no.
    righe.push(
      `🔭 raggio: ${raggi
        .map((r) => {
          const d = typeof r.diretti === "number" ? r.diretti : Number((r.cosa.match(/^(\d+)/) || [, 0])[1]);
          return `${r.file} → ${d} diretti${r.indiretti ? ` · ${r.indiretti} a due passi` : ""}`;
        })
        .join(" · ")}`,
    );
  }
  const deriva = voci.find((v) => v.classe === "deriva");
  if (deriva) righe.push(`🧭 ${deriva.cosa}\n   ↳ ${deriva.domanda}`);
  if (rossi.length > 4) righe.push(`   …e altre ${rossi.length - 4} voci gravi: node cervello/sorvegliante.mjs`);
  // ⚪ CIÒ CHE NON HO GUARDATO (4/8, riparazioni Ⓑ Ⓒ Ⓓ). Fino a oggi i «non ho potuto misurare»
  // esistevano solo nella forma da terminale — cioè nell'unica forma che in una sessione non legge
  // NESSUNO. Il canale che conta è questo, e qui non arrivavano: una cecità dichiarata a chi non la
  // legge è una cecità taciuta, ed è la stessa forma di AR-465 un piano più giù. Due righe al massimo,
  // per la stessa ragione per cui i rossi si fermano a quattro: la busta deve stare in un colpo d'occhio.
  for (const m of motivi.slice(0, 2)) righe.push(`⚪ non ho guardato: ${m}`);
  if (motivi.length > 2) righe.push(`⚪ …e altri ${motivi.length - 2} punti non misurati`);
  // Le esenzioni non spariscono in silenzio: un interruttore muto è la stessa bugia col segno cambiato.
  if (esentate.length) {
    const prima = esentate[0];
    righe.push(`🤫 ${esentate.length} voce/i esentata/e (scade ${prima.esenzione?.scadenza || "?"}): ${prima.classe} · ${prima.file}`);
  }
  if (!righe.length) return null;
  const testo = [`👁️ SORVEGLIANTE — ${nToccati} file toccati da questa modifica`, ...righe].join("\n");
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: testo },
  });
}

/**
 * «Il canale è vivo?» — l'unica domanda a cui il silenzio non sa rispondere da solo.
 * Mai girato = 2, perché cieco non è verde: vale per la guardia esattamente come per il resto.
 */
/**
 * Un file APPENA CREATO non compare in `git diff HEAD`: git non lo conosce ancora. Per un giorno la
 * guardia ha quindi avuto un buco esattamente dove una malattia nuova entra più facilmente — il file
 * scritto da zero. Qui il file intero vale come «righe che sto aggiungendo adesso», perché è vero:
 * l'ho scritto tutto io, in questo momento. (Scoperto collaudando AR-465: l'esca funzionava solo dopo
 * un `git add`, e il perché mi è sembrato un dettaglio finché non ho guardato cosa implicava.)
 */
export function righeDiFileNuovo(contenuto = "") {
  // Un file binario non ha «righe che ho scritto»: leggerlo come testo produce solo rumore.
  if (contenuto.includes("\0")) return null;
  return contenuto.split("\n").map((testo, i) => ({ n: i + 1, testo })).filter((r) => r.testo.trim() !== "");
}

export function verdettoBattito(battito, adesso = 0) {
  const t = battito && battito.quando ? Date.parse(battito.quando) : NaN;
  if (!Number.isFinite(t)) {
    return {
      vivo: false,
      uscita: 2,
      testo: "⚪ il sorvegliante non ha mai scattato da hook qui: non so se il canale è vivo, e non saperlo non è un verde.",
    };
  }
  const min = Math.max(0, Math.round((adesso - t) / 60000));
  return {
    vivo: true,
    uscita: 0,
    testo: `✅ ultimo scatto ${min} min fa (${battito.quando}) — ${battito.file_toccati ?? "?"} file guardati, ${battito.voci ?? "?"} voci, ${battito.gravi ?? "?"} gravi.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — git, registri, filesystem. Sottile per scelta: tutto ciò che DECIDE sta sopra.
// ─────────────────────────────────────────────────────────────────────────────

function git(args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

/** Legge il diff unificato e ne estrae, per ogni file, le righe AGGIUNTE col loro numero vero. */
export function leggiDiff(testo) {
  const perFile = new Map();
  let file = null;
  let riga = 0;
  for (const l of testo.split("\n")) {
    if (l.startsWith("+++ ")) {
      const p = l.slice(4).trim();
      file = p === "/dev/null" ? null : p.replace(/^b\//, "");
      if (file && !perFile.has(file)) perFile.set(file, []);
      continue;
    }
    if (l.startsWith("@@")) {
      // @@ -vecchio,n +nuovo,n @@ → il numero di riga del NUOVO file, che è quello che mi serve.
      const m = /\+(\d+)/.exec(l);
      riga = m ? Number(m[1]) : 0;
      continue;
    }
    if (!file) continue;
    if (l.startsWith("+") && !l.startsWith("+++")) {
      perFile.get(file).push({ n: riga, testo: l.slice(1) });
      riga++;
    } else if (!l.startsWith("-") && !l.startsWith("\\")) {
      riga++;
    }
  }
  return perFile;
}

/**
 * L'altra metà del diff: le righe TOLTE e i file CANCELLATI.
 *
 * Funzione separata, non un allargamento di `leggiDiff`. Non è gusto: su quella riga di `leggiDiff`
 * poggia una mutazione (AR-452, «la guardia conta come mie anche le righe che ho RIMOSSO») e il suo
 * contratto — `aggiunte` sono SOLO i `+` — è provato e deve restare vero. Allargarlo avrebbe accecato
 * quella prova nell'atto stesso di costruire il controllo che serve a non accecare le prove.
 *
 * I numeri di riga sono quelli del file VECCHIO: è l'unico posto dove quella riga è mai esistita.
 */
export function leggiRimozioni(testo) {
  const rimosse = new Map();
  const cancellati = [];
  let vecchio = null;
  let corrente = null;
  let riga = 0;
  for (const l of testo.split("\n")) {
    if (l.startsWith("--- ")) {
      const p = l.slice(4).trim();
      vecchio = p === "/dev/null" ? null : p.replace(/^a\//, "");
      continue;
    }
    if (l.startsWith("+++ ")) {
      const p = l.slice(4).trim();
      const nuovo = p === "/dev/null" ? null : p.replace(/^b\//, "");
      if (!nuovo && vecchio) cancellati.push(vecchio);
      corrente = nuovo || vecchio;
      if (corrente && !rimosse.has(corrente)) rimosse.set(corrente, []);
      continue;
    }
    if (l.startsWith("@@")) {
      // Qui serve il numero del file VECCHIO — `-vecchio,n` — perché una riga tolta nel file nuovo
      // non ha nessuna posizione: è proprio ciò che non c'è più.
      const m = /-(\d+)/.exec(l);
      riga = m ? Number(m[1]) : 0;
      continue;
    }
    if (!corrente) continue;
    if (l.startsWith("-") && !l.startsWith("---")) {
      rimosse.get(corrente).push({ n: riga, testo: l.slice(1) });
      riga++;
    } else if (!l.startsWith("+") && !l.startsWith("\\")) {
      riga++;
    }
  }
  return { rimosse, cancellati };
}

/**
 * Chi nomina questi file. Euristica dichiarata in testa: import/require/from + citazioni di percorso.
 *
 * UNA passata sola per TUTTI i file toccati, non una per file. Prima era una scansione dell'intero
 * repo per ogni file del delta: con dieci file toccati erano dieci letture di tutto — ~90 ms l'una,
 * che su un lotto grosso diventano secondi. Finché la guardia girava solo dopo un Edit era un costo
 * invisibile; dovendola far girare anche dopo un comando (dove il tempo è dentro un timeout di 10
 * secondi) sarebbe diventata la ragione per staccarla. Una guardia lenta viene spenta come una
 * rumorosa: sono lo stesso difetto con due facce.
 */
/**
 * I NOMI che un file cita: la materia prima del raggio. Pura, così le prove non toccano il disco.
 *
 * Tre forme, e le ultime due sono quelle che l'`import` letterale non vedeva (AR-508, Nicola 3/8:
 * «fai sapere al sorvegliante chi poggia su un file in modo indiretto»):
 *   ① `import`/`require`/`from "…/x.mjs"` — il legame dichiarato, l'unico che si vedeva prima.
 *   ② il percorso scritto per intero da qualsiasi parte (`node cervello/x.mjs` in uno .sh, una riga
 *      di `settings.json`, un `.service` di systemd) — c'era già, ma solo su cinque estensioni.
 *   ③ il nome del file dentro una stringa qualunque: `join(QUI, "x.mjs")`, `await import(nome)`,
 *      `spawn("node", [join(DIR, "x.mjs")])`. È il modo in cui questo repo compone i percorsi — e
 *      finché il raggio cercava solo le due forme di sopra, un file chiamato così risultava senza
 *      nessuno che poggiasse su di lui. Un raggio vuoto letto come «non ne ho trovati» è onesto;
 *      letto come «non ce ne sono» è una bugia, ed è la forma di AR-344.
 */
export function nomiCitati(testo = "") {
  const fuori = new Set();
  const EST = "(?:m?js|cjs|ts|tsx|sh|json|ya?ml|service|timer)";
  // ①+② il percorso con almeno una cartella dentro: `cervello/x.mjs`, `./lib/y.ts`, `/opt/z.sh`.
  // Vale sempre, virgolette o no — è già un riferimento a un file preciso.
  for (const m of String(testo).matchAll(new RegExp(`[A-Za-z0-9_.-]*(?:/[A-Za-z0-9_.-]+)+\\.${EST}`, "g"))) {
    fuori.add(m[0].replace(/^\.\//, ""));
    fuori.add(basenameSemplice(m[0]));
  }
  // ③ il nome NUDO, ma solo in un contesto che lo USA: `join(QUI, "x.mjs")`, `import("x.mjs")`,
  // `node x.mjs`, `ExecStart=… x.sh`. Fuori da questi il nome nudo è una MENZIONE — una scheda del
  // cantiere che nomina uno script, una riga di apprendimento — e contarla come dipendenza è la
  // terza comparsa in questo file dello stesso errore: menzione ≠ chiamata. Misurato: senza questo
  // filtro il raggio di cancello-stop.mjs passava da 10 a 86 file, cioè da un elenco a un rumore.
  // ④ l'indirizzo di una pagina API (AR-531): un `fetch` verso una rotta è un legame vero quanto un
  // import — solo, passa dal browser. Riga per riga e senza i commenti: alla prima prova questo file
  // risultava chiamante di due rotte del Pannello, perché le nomina in un commento per spiegare la
  // regola. È la quarta comparsa di «menzione ≠ chiamata» in questo stesso file, e l'ha trovata la
  // misura sul repo vero, non la rilettura.
  for (const riga of String(testo).split("\n")) {
    const pulita = senzaCommenti(riga, ".ts");
    if (!pulita.includes("/api/")) continue;
    for (const m of pulita.matchAll(/["'`](\/api\/[A-Za-z0-9/_-]+)/g)) fuori.add(m[1].replace(/\/+$/, ""));
  }
  for (const m of String(testo).matchAll(new RegExp(`(?:from|import|require|join|node|bash|sh|ExecStart=)[^\\n]{0,80}?["'\`]([A-Za-z0-9_.-]+\\.${EST})["'\`]`, "g"))) {
    fuori.add(m[1]);
  }
  return fuori;
}

/**
 * L'ALTRO NOME DI UNA PAGINA API (AR-531, Nicola 4/8: «quel tipo di legame il raggio non lo vede,
 * né prima né adesso»).
 *
 * Nel Pannello una pagina API non la chiama nessun file: la chiama il browser, con un indirizzo —
 * `fetch("/api/anomalie")`. Per il grafo quel file risultava senza nessuno che poggiasse su di lui,
 * e cambiarne la risposta sembrava non toccare niente: misurato, 84 indirizzi diversi chiamati dal
 * Pannello, e per il raggio erano zero legami. È il caso peggiore di un raggio vuoto letto come
 * «non ce ne sono»: lì un cambiamento rompe una schermata che Nicola guarda.
 *
 * La convenzione di Next.js rende la cosa meccanica: `pannello/src/app/api/x/y/route.ts` risponde
 * all'indirizzo `/api/x/y`. Non è un'euristica, è il modo in cui quel programma decide le rotte.
 */
export function aliasDiRotta(rel = "") {
  const m = String(rel).match(/^pannello\/src\/app\/(api\/.+)\/route\.(?:m?js|ts|tsx)$/);
  if (!m) return null;
  const pieno = `/${m[1]}`;
  // LA ROTTA COL PARAMETRO (AR-534). `api/lavori/[id]/route.ts` risponde a `/api/lavori/<qualcosa>`,
  // e chi la chiama scrive `fetch(\`/api/lavori/${id}\`)`: nel testo resta solo `/api/lavori`, perché
  // il resto è una variabile. Confrontando la sola forma piena quella rotta risultava senza nessun
  // chiamante — cioè il falso negativo che AR-531 doveva chiudere, sopravvissuto dentro la sua cura.
  // Quindi una rotta dinamica vale anche per il suo prefisso fisso, che è tutto ciò che il chiamante
  // può scrivere a mano.
  const prefisso = pieno.split("/[")[0];
  return prefisso !== pieno ? [pieno, prefisso] : pieno;
}

/** Le cartelle dove «chi mi nomina» è una dipendenza che si può rompere. La memoria no: lì gli
 *  script si citano per mestiere (le schede del cantiere, le lezioni), e contarle come dipendenti
 *  gonfierebbe il raggio con file che non eseguono niente. */
export const CARTELLE_CODICE = ["cervello", "pannello", ".github", ".githooks", ".claude", "scripts"];
export const eCodice = (rel = "") => !rel.includes("/") || CARTELLE_CODICE.some((c) => rel.startsWith(`${c}/`));

/**
 * Il raggio a DUE PASSI, calcolato sul grafo delle citazioni.
 *
 * `citazioni`: percorso → i nomi che quel file cita (da `nomiCitati`).
 * Torna, per ogni file cercato: chi lo nomina (diretti) e chi nomina uno di quelli (indiretti).
 *
 * PERCHÉ SI FERMA A DUE. Non per pigrizia: al terzo passo, in un repo dove quasi tutto poggia su
 * `git-github.mjs` o su un registro, il raggio diventa «mezzo repo» — e un elenco che nomina tutto
 * non fa vedere niente. Due passi è il punto in cui la risposta è ancora una lista che si legge.
 * Il limite va DETTO, non nascosto: è scritto nella copertura dichiarata in testa al file.
 */
export function raggioDueP1assi(cercati = [], citazioni = new Map()) {
  // IL NOME CORTO VALE SOLO SE E' UNICO (AR-530, riparazione di un difetto mio del 3/8). Il confronto
  // sul solo basename e' quello che fa vedere i legami non dichiarati — `join(QUI, "x.mjs")` — ma
  // quando quel nome ce l'hanno in settanta, non identifica piu niente: misurato, nel Pannello ci
  // sono 76 file chiamati `route.ts`, e toccarne uno faceva risultare «22 dipendenti diretti»,
  // fra cui guardiani che nominano `route.ts` come pattern e perfino il registro delle malattie.
  // Un raggio gonfiato non e' un errore che blocca: e' rumore, e il rumore fa smettere di leggere.
  const quantiConQuestoNome = new Map();
  for (const f of citazioni.keys()) {
    const b = basenameSemplice(f);
    quantiConQuestoNome.set(b, (quantiConQuestoNome.get(b) || 0) + 1);
  }
  const nomeDistintivo = (b) => (quantiConQuestoNome.get(basenameSemplice(b)) || 0) <= 1;

  const nominano = (bersagli) => {
    const fuori = new Map();
    for (const [chi, nomi] of citazioni) {
      for (const b of bersagli) {
        if (chi === b) continue;
        const rotta = aliasDiRotta(b);
        if (rotta && [].concat(rotta).some((x) => nomi.has(x))) {
          if (!fuori.has(b)) fuori.set(b, []);
          fuori.get(b).push(chi);
          continue;
        }
        if (nomi.has(b) || (nomeDistintivo(b) && nomi.has(basenameSemplice(b)))) {
          if (!fuori.has(b)) fuori.set(b, []);
          fuori.get(b).push(chi);
        }
      }
    }
    return fuori;
  };
  const primo = nominano(cercati);
  const idx = new Map();
  for (const f of cercati) {
    const diretti = (primo.get(f) || []).sort();
    const secondo = nominano(diretti);
    const indiretti = [...new Set([...secondo.values()].flat())].filter((x) => x !== f && !diretti.includes(x)).sort();
    idx.set(f, { diretti, indiretti });
  }
  return idx;
}

function indiceImportatori(fileRel = []) {
  const idx = new Map(fileRel.map((f) => [f, { diretti: [], indiretti: [] }]));
  if (!fileRel.length) return idx;
  const citazioni = new Map();
  const cerca = (dir) => {
    let voci;
    try {
      voci = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const v of voci) {
      if (v.name === "node_modules" || v.name === ".git" || v.name === ".next") continue;
      const p = join(dir, v.name);
      if (v.isDirectory()) {
        cerca(p);
        continue;
      }
      // Le estensioni allargate (AR-508): `.yml` sono i workflow di GitHub — dove gira metà dei
      // guardiani — e `.service`/`.timer` sono il modo in cui il VPS lancia il worker. Erano fuori
      // dalla scansione, quindi un file lanciato SOLO da systemd o SOLO dalla CI risultava senza
      // nessuno che poggiasse su di lui: il raggio taceva proprio sui due chiamanti che non posso
      // vedere da qui.
      if (!/\.(m?js|cjs|ts|tsx|sh|json|ya?ml|service|timer)$/.test(v.name)) continue;
      const rel = relative(REPO, p);
      if (!eCodice(rel)) continue;
      try {
        if (statSync(p).size > 2 * 1024 * 1024) continue;
        citazioni.set(rel, nomiCitati(readFileSync(p, "utf8")));
      } catch {
        // illeggibile: una fonte in meno, e il conteggio più basso lo dice da solo
      }
    }
  };
  cerca(REPO);
  for (const [f, v] of raggioDueP1assi(fileRel, citazioni)) idx.set(f, v);
  return idx;
}

/**
 * C'è una fusione a metà? — l'unico pezzo di Ⓒ che tocca il disco.
 *
 * Due scelte, e tutte e due sono state SBAGLIATE alla prima stesura, ognuna presa da un guardiano
 * diverso di questa stessa casa. Vale la pena scriverle, perché sono la stessa lezione da due lati:
 *
 * ① DOVE. La cartella di git si CHIEDE a git (`--absolute-git-dir`), non si compone come `.git/…`.
 *    In un worktree `.git` è un file e quei nomi vivono altrove — quindi la prima versione, provata
 *    dal vivo dentro un worktree con un merge vero a metà, non l'ha riconosciuto. Le prove pure
 *    erano verdi: misuravano la funzione, non la domanda. (Stessa forma di AR-339.)
 *
 * ② COSA TORNA QUANDO NON SI SA. La prima versione faceva `catch { return false }`, cioè trasformava
 *    «git non mi ha risposto» in «nessuna fusione in corso» — e il commento accanto lo giustificava
 *    dicendo che tanto la cecità era già dichiarata altrove. L'ha bocciata `spazzata-fratelli` come
 *    istanza NUOVA di `fonte-troncata-letta-per-intera`, ed è nel giusto: quella era una scusa. Il
 *    fallimento di `rev-parse` e quello di `diff` sono due eventi diversi, e la parte non letta deve
 *    arrivare al verdetto. Adesso l'ignoranza ha un valore suo (`leggibile: false`) e diventa una
 *    riga fra i «non ho guardato» — che è precisamente ciò che le cinque riparazioni di oggi fanno.
 *
 * Una chiamata a git sola, non una per stato: sei domande a ogni Edit sarebbero il modo in cui una
 * guardia diventa lenta, e una guardia lenta viene staccata come una rumorosa.
 */
export function statoFusione() {
  let dir;
  try {
    dir = execFileSync("git", ["rev-parse", "--absolute-git-dir"], { cwd: REPO, encoding: "utf8" }).trim();
  } catch (e) {
    return { fusione: null, leggibile: false, errore: e.message.split("\n")[0] };
  }
  if (!dir) return { fusione: null, leggibile: false, errore: "git non dice dove tiene la sua cartella" };
  return { fusione: fusioneInCorso((nome) => existsSync(join(dir, nome))), leggibile: true };
}

/**
 * Come sta la copia del sito, chiesto alla porta. L'unico pezzo di Ⓓ che tocca il disco.
 *
 * `git status --porcelain` e non un conteggio a mano: è l'unica risposta che tiene conto del
 * `.gitignore` di QUEL repo. Costa una manciata di millisecondi e gira solo se la cartella c'è.
 */
export function statoMarketplace() {
  const dove = join(REPO, process.env.MARKETPLACE_REPO || CARTELLA_MARKETPLACE);
  if (!existsSync(join(dove, ".git"))) return { presente: false, sporchi: 0, leggibile: true };
  try {
    const fuori = execFileSync("git", ["status", "--porcelain"], { cwd: dove, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    return { presente: true, sporchi: fuori.split("\n").filter((r) => r.trim()).length, leggibile: true };
  } catch {
    // La cartella c'è ma git non risponde: è una cecità, non un'assenza. Sono due verdetti diversi.
    return { presente: true, sporchi: 0, leggibile: false };
  }
}

function leggiRegistro(nome, campo) {
  const p = join(QUI, nome);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"))[campo] || [];
  } catch {
    return null;
  }
}

const APPRENDIMENTO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json";

/** Le lezioni, per sapere quali test sono il freno di qualcosa. Vuoto = non le ho lette, e allora ⑥
 *  è più cieco: lo dico invece di dedurne che nessun test sia una difesa. */
function leggiLezioni() {
  try {
    return JSON.parse(readFileSync(join(REPO, APPRENDIMENTO), "utf8")).lezioni || [];
  } catch {
    return null;
  }
}

/**
 * I guardiani che vengono lanciati DAVVERO: quelli nominati dal cancello del lotto e dagli hook.
 *
 * Letti dai due file che li lanciano, non elencati qui: un elenco a mano sarebbe il perimetro dedotto
 * di AR-347 scritto dentro il controllo che lo vieta — e resterebbe indietro al primo guardiano nuovo.
 */
function guardianiNominati() {
  const fuori = new Set();
  for (const f of ["cervello/cancello-lotto.mjs", ".claude/settings.json"]) {
    try {
      const testo = readFileSync(join(REPO, f), "utf8");
      for (const m of testo.matchAll(/cervello\/[\w./-]+\.(?:m?js|sh)/g)) fuori.add(m[0]);
    } catch {
      // Un file che non riesco a leggere non è un guardiano assente: è una fonte in meno, e il
      // conteggio più basso lo dice da solo.
    }
  }
  return [...fuori];
}

/**
 * L'indice delle difese di QUESTO repo, letto dai registri veri.
 *
 * Esportato (AR-525) perché adesso serve anche al freno che parla PRIMA della mossa: quando sto per
 * cancellare un file, la domanda «qualcuno lo dichiara difesa?» è la stessa identica di quando l'ho
 * già cancellato. Sta qui e non là perché i tre lettori dei registri stanno qui: una seconda copia
 * divergerebbe, ed è la ragione per cui in questa macchina il registro delle malattie è UNO.
 */
export function difeseDelRepo() {
  return indiceDifese({
    lezioni: leggiLezioni() || [],
    mutanti: leggiRegistro("mutanti.json", "mutanti") || [],
    guardiani: guardianiNominati(),
  });
}

/**
 * IL GIRO COMPLETO SUL DELTA — l'I/O che sta fra il repo e il cuore.
 *
 * Estratto da `main()` (AR-502) perché adesso ha DUE chiamanti: il comando, e l'hook del Bash che
 * `misura-cieca.mjs` fa girare dopo ogni comando di shell. Finché ne aveva uno solo poteva stare
 * dentro `main()`; con due, lasciarlo lì avrebbe voluto dire scriverne una seconda copia — e due
 * copie della stessa lettura divergono sempre (è la ragione per cui in questo repo il registro delle
 * malattie è UNO).
 *
 * @returns {{errore:string|null, esito:object, toccati:Array}}
 */
export function verdettoDelDelta({ soloStaged = false, da = null, senzaRaggio = false } = {}) {
  // I motivi raccolti QUI, fuori dal cuore: sono cecità dell'I/O (un file non aperto, una fusione in
  // corso, un altro repo), non del ragionamento. Il cuore resta puro e ne aggiunge dei suoi.
  const motiviIO = [];
  let diff;
  try {
    // `-U0`: solo le righe cambiate, niente contesto — il contesto NON è mio, e contarlo
    // trasformerebbe il codice di qualcun altro in una mia colpa.
    //
    // `da` — DA DOVE si guarda. Due lavori diversi sono arrivati alla stessa conclusione lo stesso
    // giorno, ed è il motivo per cui questo parametro ha UN nome solo e non due:
    //   · il collaudo del lavoro finito chiede l'INTERO perimetro del turno (l'ancora dello Stop),
    //     non solo l'ultima modifica — commit compresi;
    //   · il cancello del lotto in CI chiede l'antenato comune col ramo pubblicato, perché lì
    //     l'albero è appena clonato e quindi pulito: senza, il perimetro esce vuoto e il verdetto è
    //     un verde che non ha misurato niente.
    // Due parametri per la stessa domanda sarebbero due risposte destinate a divergere: è la
    // ragione per cui in questa casa il registro delle malattie è UNO.
    diff = soloStaged ? git(["diff", "--cached", "-U0"]) : git(["diff", da || "HEAD", "-U0"]);
  } catch (e) {
    // Nessun HEAD (repo appena nato) o git assente: cieco, e cieco non è verde.
    return { errore: e.message.split("\n")[0], esito: { voci: [], cieco: true, motivi: [] }, toccati: [] };
  }

  // Ⓒ una fusione a metà: le righe nell'albero non sono tutte mie, e non c'è modo di separarle.
  //    E se git non risponde alla domanda, quello è un TERZO stato — non «nessuna fusione».
  const fus = statoFusione();
  if (fus.fusione) {
    motiviIO.push(`c'è ${fus.fusione} in corso: il diff contiene anche righe che non ho scritto io, e non so quali`);
  } else if (!fus.leggibile) {
    motiviIO.push(`non ho potuto chiedere a git se c'è una fusione in corso (${fus.errore}): se c'è, alcune di queste righe non sono mie`);
  }

  // Ⓓ l'altro repo. `git` gira sulla radice di QUESTA casa e la copia del sito è esclusa apposta
  // (`.gitignore`), quindi quando lavoro sul marketplace questa guardia non vede niente — e tacere
  // equivale a dire «tutto a posto». Parla solo se lì c'è davvero del lavoro non committato: un
  // avviso che compare anche a cartella pulita sarebbe rumore, e il rumore spegne i freni.
  motiviIO.push(...motiviMarketplace(statoMarketplace()));

  const perFile = leggiDiff(diff);

  // I file NUOVI, che il diff non conosce. `--staged` no: lì il perimetro è per definizione ciò che è
  // stato messo in staging, e allargarlo direbbe al pre-commit di bocciare per righe che non sta
  // committando. Il tetto sui byte non è pigrizia: un dump o un export finito nella cartella per
  // sbaglio farebbe leggere megabyte a ogni Edit, e una guardia lenta viene spenta come una rumorosa.
  if (!soloStaged) {
    // Dalla PORTA, non da git a mano (AR-339): con un nome accentato — 26 file solo in questo vault —
    // git restituisce il percorso citato con gli ottali, `readFileSync` fallisce e il file finirebbe
    // saltato in silenzio. Cioè: la guardia direbbe di aver guardato un file che non ha aperto. L'ha
    // trovato il guardiano che quella regola la fa rispettare, prima che uscisse.
    let nuovi = [];
    try {
      nuovi = percorsiDaGit(["ls-files", "--others", "--exclude-standard"], { cwd: REPO });
    } catch {
      nuovi = [];
    }
    // Ⓑ i salti si CONTANO. Prima erano due `continue` muti, e un file saltato in silenzio non
    // entrava fra i «⚪ non ho potuto misurare»: cioè la guardia diceva di aver guardato un file che
    // non ha aperto. È la regola di casa violata dentro il guardiano che la fa rispettare — e il
    // punto non è che il tetto sui byte sia sbagliato (non lo è: senza, un export finito lì per
    // sbaglio farebbe leggere megabyte a ogni Edit), è che una scelta legittima non va taciuta.
    const grossi = [];
    const illeggibili = [];
    for (const f of nuovi) {
      if (perFile.has(f)) continue;
      const abs = join(REPO, f);
      try {
        if (statSync(abs).size > TETTO_BYTE) {
          grossi.push(f);
          continue;
        }
        const righe = righeDiFileNuovo(readFileSync(abs, "utf8"));
        if (righe && righe.length) perFile.set(f, righe);
      } catch {
        // Illeggibile o sparito tra il `ls-files` e la lettura: non è una colpa, è un file che non
        // ho guardato — e la differenza fra le due cose è tutta questa riga.
        illeggibili.push(f);
      }
    }
    motiviIO.push(...motiviSalti({ grossi, illeggibili }));
  }

  const malattie = leggiRegistro("malattie.json", "malattie");
  const mutanti = leggiRegistro("mutanti.json", "mutanti");

  const toccati = [];
  for (const [file, aggiunte] of perFile) {
    const abs = join(REPO, file);
    let contenuto = null;
    try {
      contenuto = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    } catch {
      contenuto = null;
    }
    toccati.push({ file, aggiunte, contenuto });
  }
  // Il raggio si calcola solo sul codice condiviso, non sui .md e non sui dati del vault (lì «chi mi
  // cita» non è una dipendenza che si rompe), e con UNA scansione per tutti.
  // `senzaRaggio` (AR-531): il collaudo del lavoro finito usa questo giro per le voci gravi/medie e
  // il raggio non entra nelle sue istruzioni — pagare la scansione dell'intero repo a ogni «fatto»
  // bloccato sarebbe il costo che fa spegnere una guardia (lenta = rumorosa, stessa fine).
  const importatori = senzaRaggio
    ? new Map()
    : indiceImportatori(toccati.map((t) => t.file).filter((f) => /\.(m?js|cjs|ts|tsx)$/.test(f)));

  // Il lato sottrazione: ciò che ho TOLTO, e chi lo dichiarava una difesa.
  const { rimosse, cancellati } = leggiRimozioni(diff);
  const rimossi = [...rimosse].map(([file, righe]) => ({ file, rimosse: righe, cancellato: cancellati.includes(file) }));
  const lezioni = leggiLezioni();
  const difese = indiceDifese({ lezioni: lezioni || [], mutanti: mutanti || [], guardiani: guardianiNominati() });

  // AR-713 — chi è sotto misura adesso. Il foglietto lo lascia `non-vacuita.mjs` mentre tiene un
  // file rotto apposta: senza questa lettura la guardia accusa lo strumento che sta misurando.
  let foglietto = null;
  try {
    const via = join(REPO, FOGLIETTO_MISURA);
    foglietto = existsSync(via) ? readFileSync(via, "utf8") : null;
  } catch (e) {
    motiviIO.push(`non ho potuto leggere ${FOGLIETTO_MISURA} (${e.message}): se una misura è in corso, potrei accusarla a torto`);
  }
  const misura = fileSottoMisura(foglietto);
  if (misura.motivo) motiviIO.push(misura.motivo);

  const esito = sorveglia({
    toccati,
    malattie: malattie || [],
    mutanti: mutanti || [],
    importatori,
    esiste: (p) => existsSync(join(REPO, p)),
    rimossi,
    difese,
    oggi: new Date().toISOString().slice(0, 10),
    // Il disco COMANDA sul frammento che il chiamante ha in mano (AR-713).
    leggi: (p) => (existsSync(join(REPO, p)) ? readFileSync(join(REPO, p), "utf8") : null),
    inMisura: misura.file,
  });
  esito.motivi.push(...motiviIO);
  esito.motivi.push(...motiviPerimetro({ base: da, nToccati: toccati.length, nRimossi: rimossi.length }));
  esito.cieco = esito.motivi.length > 0;
  if (malattie === null) esito.motivi.push("cervello/malattie.json illeggibile");
  if (mutanti === null) esito.motivi.push("cervello/mutanti.json illeggibile");
  if (lezioni === null) esito.motivi.push(`${APPRENDIMENTO} illeggibile: non so quali test siano il freno di una lezione`);
  if (!difese.size) esito.motivi.push("nessuna difesa censita: non posso accorgermi se ne cancello una");
  return { errore: null, esito, toccati };
}

/**
 * Uno scatto da hook: aggiorna il registro nel battito e torna la busta da stampare (o `null`).
 *
 * Anche questa esportata per lo stesso motivo del giro: la chiama l'hook degli Edit e quello dei
 * comandi. Il battito si scrive SEMPRE, anche a mani vuote — è lì che il silenzio si confonde con la
 * morte — e vale per tutti e due i canali, altrimenti «ha girato» dipenderebbe da quale hook è
 * scattato per ultimo.
 */
export function scatto(esito, nToccati) {
  let precedente = {};
  let n = 0;
  try {
    const letto = JSON.parse(readFileSync(join(REPO, BATTITO), "utf8"));
    precedente = letto.viste || {};
    n = Number(letto.scatto) || 0;
  } catch {
    // Primo scatto della sessione (o battito illeggibile): si riparte da zero. Un registro assente
    // non è un registro vuoto per finta — semplicemente non ho ancora niente da ricordare.
  }
  n += 1;
  const viste = aggiornaViste(precedente, esito.voci, n);
  try {
    writeFileSync(
      join(REPO, BATTITO),
      JSON.stringify({ quando: new Date().toISOString(), file_toccati: nToccati, voci: esito.voci.length, gravi: gravi(esito.voci).length, scatto: n, viste }),
    );
  } catch {
    // Un battito che non si scrive non deve fermare il lavoro in corso: resta il verdetto, che è la
    // parte che conta. `--battito` dirà «mai scattato», ed è la risposta onesta.
  }
  return bustaPerIlModello(esito.voci, nToccati, viste, { motivi: esito.motivi || [], esentate: esito.esentate || [] });
}

/**
 * IL NOME DELLO STRUMENTO NON SI LEGGE DA STDIN — e la prima stesura di questo pezzo lo faceva.
 *
 * COSA È SUCCESSO, il 16/8, mezz'ora dopo averlo scritto. Per mettere nel libro mastro QUALE
 * strumento avesse svegliato la guardia, leggevo il payload dell'evento con una lettura sincrona,
 * protetta da un `isTTY`. Quel guardia copre un caso solo: il file lanciato da un terminale. Non
 * copre quello che conta — un chiamante che apre il canale e non lo chiude mai. Lì la lettura non
 * torna PIÙ, e la guardia resta appesa per sempre.
 *
 * Misurato: `sleep 60 | node cervello/sorvegliante.mjs --hook` non finiva. Dentro l'hook vero il
 * danno era limitato (Claude Code chiude stdin, e comunque c'è un tempo massimo), ma il programma
 * che esegue tutte le prove spawna i file con un canale aperto: sul mio ramo non finiva più, mentre
 * su main finiva in meno di novanta secondi. Una guardia che PIANTA chi la esegue è peggio di una
 * guardia che non sa il nome dello strumento.
 *
 * PERCHÉ TOGLIERLO NON COSTA NIENTE. La mappa di copertura non ricava da qui chi sorveglia cosa:
 * quello lo legge dai matcher del file dei freni. Dal libro mastro prende solo l'ELENCO degli
 * strumenti usati, e quell'elenco arriva già dalle altre guardie e dalla trascrizione. Il nome qui
 * era un di più; l'attesa infinita no.
 */

function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");
  const soloStaged = argv.includes("--staged");
  const json = argv.includes("--json");
  // Ⓐ `--base <spec>`: con cosa confrontarsi. Chi lo passa (la CI) lo sa meglio di me — l'antenato
  // comune col ramo pubblicato lo calcola già il cancello del lotto, e ricalcolarlo qui vorrebbe
  // dire tenere due risposte alla stessa domanda, che col tempo divergono sempre.
  const iBase = argv.indexOf("--base");
  const base = iBase >= 0 && argv[iBase + 1] && !argv[iBase + 1].startsWith("--") ? argv[iBase + 1] : null;
  if (iBase >= 0 && !base) {
    console.error("👁️ SORVEGLIANTE — `--base` vuole uno spec git subito dopo (es. `--base origin/main`).");
    process.exit(2);
  }

  // «Hai girato o no?» — prima di tutto il resto, perché è la domanda che si fa quando si sospetta
  // che la guardia sia morta, e in quel momento il diff non c'entra niente.
  if (argv.includes("--battito")) {
    let letto = null;
    try {
      letto = JSON.parse(readFileSync(join(REPO, BATTITO), "utf8"));
    } catch {
      letto = null;
    }
    const v = verdettoBattito(letto, Date.now());
    console.log(v.testo);
    process.exit(v.uscita);
  }

  // Il libro mastro: la riga si apre PRIMA di guardare il delta, perché è proprio qui che una guardia
  // può morire a metà (il calcolo del diff è la parte lenta, ed è dove scade il tempo massimo).
  // Senza l'apertura, un sorvegliante ucciso dal timeout lascerebbe la stessa traccia di uno che ha
  // detto ✅: nessuna. Con l'apertura, la mossa risulta NON guardata, che è la verità.
  const mastro = hook ? annota({ guardia: "sorvegliante", evento: "PostToolUse", strumento: "", bersaglio: "delta del repo" }) : "";

  const { errore, esito, toccati } = verdettoDelDelta({ soloStaged, da: base });
  if (errore) {
    if (hook) {
      console.log("👁️ sorvegliante: cieco (git non leggibile) — nessun controllo sul delta");
      chiudi(mastro, "ok", `cieco: ${errore}`);
      process.exit(0);
    }
    console.error(`👁️ SORVEGLIANTE CIECO — non ho potuto leggere il diff: ${errore}`);
    process.exit(2);
  }
  const rossi = gravi(esito.voci);

  if (json) {
    console.log(JSON.stringify({ ...esito, gravi: rossi.length, file_toccati: toccati.length }, null, 2));
    process.exit(rossi.length ? 1 : esito.cieco ? 2 : 0);
  }

  // ── Forma corta: entra nel mio contesto a OGNI modifica, quindi deve stare in poche righe o
  //    diventa rumore che imparo a scorrere. Solo i rossi, i gialli in una riga, il raggio contato.
  if (hook) {
    // Il battito PRIMA della busta, e sempre — anche a mani vuote: è lì che il silenzio si confonde
    // con la morte. stdout in forma hook è SOLO la busta JSON: qualsiasi altra riga la rende
    // illeggibile a chi la deve interpretare, e il verdetto tornerebbe a sparire nel log.
    const busta = scatto(esito, toccati.length);
    if (busta) console.log(busta);
    chiudi(mastro, rossi.length ? "blocca" : busta ? "avvisa" : "ok", rossi.map((v) => `${v.classe} ${v.file}`).join(" · "));
    // Avvisa, non blocca: un freno che ferma un Edit a metà lavoro viene spento in un giorno, e un
    // controllo spento è peggio di nessun controllo (insegna che il verde non vuol dire niente).
    // Il freno che BLOCCA sta al commit, dove fermarsi non costa il lavoro in corso.
    process.exit(0);
  }

  console.log(`\n👁️ SORVEGLIANTE — ${toccati.length} file toccati nel delta${base ? ` (confronto con «${base}»)` : ""}\n`);
  // Ⓐ «zero file» NON è più un'uscita anticipata. Era qui che la CI moriva: `process.exit(0)` prima
  // ancora di stampare i «non ho potuto misurare», cioè il verde stampato proprio nel caso in cui
  // non era stato guardato niente. Adesso si prosegue e la coda decide — se c'è un motivo, è cieco.
  if (!toccati.length && !esito.motivi.length) {
    console.log("   nessuna modifica da guardare.");
    process.exit(0);
  }
  const ordine = { grave: 0, media: 1, informativa: 2 };
  for (const v of [...esito.voci].sort((a, b) => ordine[a.gravita] - ordine[b.gravita])) {
    const seg = v.gravita === "grave" ? "❌" : v.gravita === "media" ? "⚠️ " : "🔭";
    console.log(`${seg} ${v.classe} — ${v.file}${v.riga ? ":" + v.riga : ""}`);
    console.log(`   ${v.cosa}`);
    console.log(`   perché: ${v.perche}`);
    console.log(`   → ${v.domanda}\n`);
  }
  if (esito.motivi.length) {
    console.log("⚪ non ho potuto misurare:");
    for (const m of esito.motivi) console.log(`   · ${m}`);
    console.log("");
  }
  // Ⓔ le esentate si mostrano sempre: se sparissero in silenzio, questa via sarebbe un interruttore
  // e non una risposta — e fra sei mesi nessuno saprebbe quali controlli sono spenti né da quando.
  if (esito.esentate?.length) {
    console.log(`🤫 ${esito.esentate.length} voce/i esentata/e con dichiarazione:`);
    for (const v of esito.esentate) {
      console.log(`   · ${v.classe} — ${v.file} · scade ${v.esenzione.scadenza} · ${v.esenzione.perche}`);
    }
    console.log("");
  }
  if (rossi.length) {
    console.log(`❌ ${rossi.length} voce/i grave/i introdotte da me in questo delta.`);
    process.exit(1);
  }
  if (esito.cieco) {
    console.log("⚪ nessuna voce grave, ma la misura è incompleta: cieco non è verde.");
    process.exit(2);
  }
  console.log("✅ nessuna voce grave sul delta.");
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
