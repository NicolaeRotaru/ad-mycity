#!/usr/bin/env node
// 🚪🚪 PORTE GEMELLE — «questo atto da quante porte si compie, e le altre CHIAMANO la guardia?»
//
// COSA FA — UNA domanda sola, e nessuna di più. Per ogni atto registrato in
// `cervello/atti-con-porte.json` trova chi lo COMPIE (rilevatore dichiarato) e misura chi CHIAMA la
// guardia. Chi non la chiama: o è dichiarato in `esenti` col perché e la sua natura (a scadenza,
// oppure per sempre col perché del per-sempre), o è una PORTA SCOPERTA → rosso, col nome del file e
// la riga.
//
// Uso:
//   node cervello/porte-gemelle.mjs                   -> rapporto
//   node cervello/porte-gemelle.mjs --json            -> JSON
//   node cervello/porte-gemelle.mjs --aggiorna-tetti  -> abbassa i tetti già dichiarati alla misura di oggi
//
// ⬆️  E IL CONTRATTO QUI SOTTO STA IN ALTO PER FORZA, NON PER GUSTO. Il censimento dei guardiani
// (`cervello/guardia-viva.mjs`, `eGuardiano`) cerca questa riga nelle PRIME 80 righe del file:
// oltre quelle, per lui è codice. Con l'intestazione lunga il contratto finiva alla riga 135, e
// `eGuardiano` rispondeva FALSO su questo file — misurato il 23/8/2026, mentre sui due fratelli
// nati nello stesso lotto rispondeva vero. Quindi il verde che questo freno prendeva sul controllo
// «uno strumento costruito e mai messo di guardia è un buco» non era guadagnato: era comprato
// dall'essere illeggibile, e il giorno in cui qualcuno togliesse la sua riga dal cancello nessuno
// se ne accorgerebbe. La lezione era già scritta da `due-case.mjs`, in testa a sé, nello stesso
// lotto: il primo caso di prova di questa cura è che quella riga qui sopra resti sopra la 80.
//
// Uscita (contratto guardiani, AR-322): 0 = ho esaminato almeno una porta E ognuna chiama la guardia
// o è dichiarata · 1 = porta scoperta, casa dichiarata e falsa, esenzione morta/scaduta/senza perché,
// atto oltre il tetto · 2 = ⚪ NON HO POTUTO MISURARE — compreso «non ho guardato niente»: zero atti,
// zero porte trovate, una cartella persa. Il 2 non è mai un verde, e il verde non è mai disponibile a
// mani vuote.
//
// Prova comportamentale: node cervello/test/altra-porta-lasciata-aperta.test.mjs
//
// 🟢 SOLA LETTURA: legge l'albero di lavoro e un JSON. Non tocca git (quindi in CI, sul clone
// superficiale, è verde o rosso esattamente come sul VPS: nessuna finestra in cui possa essere verde
// per costruzione), non fa rete, non scrive niente — tranne `--aggiorna-tetti`, che abbassa i tetti
// già dichiarati passando da `scriviJsonAtomico` (mai `writeFileSync` crudo, AR-639).
//
// IL DIFETTO CHE CHIUDE, misurato sul repo vero il 23/8/2026 e non ipotizzato. L'atto «chiudere un
// difetto del cantiere» ha una guardia — `ammissibilitaProva` in `cervello/prova-ammissibile.mjs` —
// e la importa UN FILE SOLO: `cantiere-prove.mjs`, che di sé dichiara alla riga 228 «⚠️ QUESTO
// GUARDIANO NON CHIUDE NIENTE: chi chiude è auto-fix.mjs, e non passa ancora di qui». Chi chiude
// davvero è altrove: `auto-fix.mjs` (402, 454), `allinea-scan-cantiere.mjs` (176, 232),
// `round2-applica.mjs` (67, 73). **Zero su tre passano dal cancello.** È AR-796, vivo oggi — e la
// macchina lo sapeva: l'aveva scritto in un commento invece che in un numero. Un commento non ferma
// niente. Questo file trasforma quella confessione in un rosso.
//
// 🔧 IL DIFETTO DI QUESTA VERSIONE — quello vero, quello che ha bocciato la seconda: IL FRENO
// GUARDAVA UNA PAROLA, NON UN COMPORTAMENTO. Un file «passava dalla guardia» se da qualche parte
// dentro c'era SCRITTA la parola `ammissibilitaProva`. Non se la chiamava: se la nominava. Misurato
// il 23/8 su una copia del repo, tre righe che non riparano niente, tutte con lo stesso esito
// (`1 scoperta` → `0 scoperta`, uscita 1 → 0, AR-796 intatto):
//     export const NOTA = "ammissibilitaProva";
//     throw new Error("prova non ammissibile: vedi ammissibilitaProva in prova-ammissibile.mjs");
//     import { ammissibilitaProva as _g } from "./prova-ammissibile.mjs";   // import mai usato
// La seconda non è un dispetto: è il messaggio d'errore che scriverebbe chiunque spieghi perché una
// prova è stata rifiutata. La terza è un import rimasto dopo un refactoring. Peggio ancora, la riga
// spegneva il rosso anche su una porta NUOVA: messa in un file che con quella porta non c'entrava
// niente, il conto tornava sotto il tetto e la porta di servizio restava aperta col ✅ accanto. E
// con `--aggiorna-tetti` il tetto crollava da 1 a 0: AR-796 curato per iscritto, per sempre, senza
// che una riga di codice fosse cambiata.
// LA CURA, ed è la stessa simmetria che il freno applicava già dall'altra parte (`primitiviDelRilevatore`
// prende solo i nomi CHIAMATI): la guardia SI CHIAMA, non si nomina. `soloCodice` spegne stringhe,
// template, commenti e letterali di espressione regolare; su quel che resta si cerca la forma
// `nome(` — più gli alias di un import con rinomina (`{ ammissibilitaProva as g }` + `g(`), perché
// chi la chiama sotto un altro nome ci passa davvero e accusarlo sarebbe un rosso falso.
//
// LA FORMA CHE SI RIPETE, e le schede che l'hanno pagata:
//   · AR-172 — la porta A MANO riparata, quella AUTOMATICA lasciata aperta. Il verso opposto è vivo
//     ADESSO in `calibrazione.mjs`: `autoprevedi` (757-760) dopo il fix rifiuta di aprire una
//     previsione senza una baseline vera, mentre la riga di comando `--baseline` (378-390), quando
//     la baseline manca, stampa un avviso e **apre lo stesso**. (Vedi il limite ⑦: a granularità di
//     FILE questo caso NON si vede — è una correzione alla spec, non una promessa mantenuta.)
//   · AR-558 — curato `tasso-lezioni.mjs`, lasciate aperte tre altre porte sullo stesso file di
//     memoria: quattro giorni e diciassette ore di memoria non pubblicata. Erano PREESISTENTI,
//     quindi dentro la linea di partenza di `spazzata-fratelli` — che vede il fratello che NASCE,
//     non quello che C'ERA GIÀ. Ed è sempre quello che c'era già a riaprire il difetto.
//   · AR-796 — il caso qui sopra.
//
// 🕳️ IL BUCO CHE HO TOLTO, e lo dico prima perché un buco dichiarato vale più di una copertura
// finta. La versione precedente aveva un secondo controllo: «ogni scheda bloccante/grave chiusa dopo
// l'accensione deve portare un campo `altra_porta` che dice quale atto hai riparato». Misurato:
// `grep -rn altra_porta` su `cervello/`, `pannello/src` e `auto-coscienza/` → **zero programmi lo
// scrivono**, mentre `auto-fix.mjs` chiude schede da solo. Chiudendo AR-796 come lo chiuderebbe
// `auto-fix.mjs` il freno usciva 1: cioè il primo lotto che passa di qui diventa rosso e resta rosso
// finché una persona non scrive quel campo a mano, su ogni scheda grave, per sempre. Un rosso a mano
// su ogni lotto futuro non è un freno, è una tassa — e le tasse si abrogano entro la settimana
// (AR-506, AR-511, AR-514, AR-526, AR-534). Uno scrittore automatico onesto non è scrivibile: la
// risposta («quale atto hai riparato, e chi altro lo compie») è un giudizio, e un campo riempito da
// un programma con un segnaposto sarebbe la spunta verde comprata con sei righe di JSON. Quindi il
// controllo È TOLTO, e con lui la sua forza: **il registro degli atti NON cresce da solo**. Chi
// registra un atto nuovo è una persona. Questo è debito aperto, scritto qui e non altrove.
//
// IL REGISTRO DICHIARA SOLO LE ESENZIONI; CHI PASSA SI MISURA. Deliberato: un elenco a mano di «chi
// passa» sarebbe `perimetro-letterale` (AR-347), e il sorvegliante lo prenderebbe al controllo ④ —
// il freno nascerebbe con la malattia che cura.
//
// LA VALVOLA CHE GLI IMPEDISCE DI NASCERE ROSSO SU TUTTO. Misurato con questo stesso metro il 23/8:
// l'atto «scrivere un JSON di memoria» ha 69 porte, 67 delle quali non passano da `scriviJsonAtomico`.
// Un cancello che nasce rosso su decine di file viene spento entro la settimana. Quindi: fino a
// `max_porte` (8) scoperte ognuna si nomina in `esenti`; oltre, l'atto DEVE dichiarare `tetto_porte`
// = la misura di oggi, che scende e non risale. Nessuna terza via. E il tetto si abbassa SOLO da una
// misura intera: con una cartella cieca `--aggiorna-tetti` si rifiuta di scendere, perché un tetto
// abbassato da mezza misura è un debito cancellato senza averlo pagato.
//
// LE ESENZIONI HANNO DUE NATURE, E UNA SOLA DELLE DUE HA UNA DATA. Misurato il 23/8/2026: le tre
// esenzioni del registro scadevano tutte lo stesso giorno, il 15 ottobre 2026. Il 16 il freno
// usciva 1 senza che nessuno avesse toccato una riga di codice — e due di quelle tre, quel giorno,
// non avrebbero avuto niente da riparare: una PROPAGA un giudizio già dato, l'altra è una copia in
// sola lettura per la Cabina. Cioè quel giorno non ci sarebbe stato un guasto: ci sarebbe stata una
// persona che riscrive una data in un JSON. Una miccia a cinquantaquattro giorni non è un freno, è
// una tassa — e le tasse si abrogano entro la settimana (AR-506, AR-511, AR-514, AR-526, AR-534).
//   · `natura: "temporanea"` — ed è ciò che vale quando `natura` non c'è, perché un campo
//     dimenticato non può regalare il per-sempre: il default deve cadere sempre dalla parte che ha
//     una scadenza. Servono `fino_al` con una data non passata E `si_toglie_quando`, cioè che cosa
//     deve succedere perché l'esenzione sparisca. Una data senza quella seconda metà è esattamente
//     il caso di ottobre: arriva il giorno, e l'unica cosa che si può fare è riscriverla.
//   · `natura: "strutturale"` — niente `fino_al` (una cosa o scade o è per sempre: scriverli
//     insieme rimette la miccia che il per-sempre serviva a togliere), e in cambio DUE perché
//     invece di uno: `perche` (perché questa porta non passa dalla guardia) e `perche_per_sempre`
//     (perché nessun lavoro futuro cambierà quella risposta). Chiedere il per-sempre costa un
//     perché in più della proroga, non uno in meno.
// E IL PER-SEMPRE NON È GRATIS: le esenzioni strutturali di un atto si CONTANO, e il conto vive
// sotto `tetto_strutturali`, che scende e non risale come `tetto_porte`. Senza quel tetto dichiarato
// la prima strutturale fa rosso: altrimenti «strutturale» diventerebbe la parola con cui si spegne
// qualunque porta, cioè la casella dove i buchi vanno a morire di vecchiaia.
//
// 🕳️ E QUELLO CHE QUESTA CURA NON FA, col numero vero invece che con una speranza: NON SA DIRE SE
// «STRUTTURALE» È VERO. Un tetto si alza a mano — da 2 a 5 dentro il registro, e la porta spenta in
// più è assolta — ed è lo stesso buco che ha già `tetto_porte`: i tetti di `atti-con-porte.json` non
// li sorveglia NESSUN guardiano di questa casa. Misurato il 23/8/2026: zero, `tetto-guardiano.mjs`
// non nomina questo file. Quello che il freno mantiene davvero, e a ogni corsa, sono i tre controlli
// sul codice VIVO, che valgono uguali per le strutturali: il file esente deve esistere ancora, deve
// compiere ancora l'atto, e non deve già chiamare la guardia. Il giorno in cui `cantiere-snello.ts`
// chiamerà `ammissibilitaProva`, la sua esenzione «per sempre» muore rossa lo stesso giorno.
//
// I LIMITI, detti prima (un freno di cui non si conosce il perimetro viene letto come una promessa
// che non ha fatto):
//   ① NON SCOPRE GLI ATTI DA SOLO: un atto non registrato è invisibile, e da quando il controllo ②
//      è stato tolto (vedi sopra) niente lo fa crescere. Debito aperto, non copertura.
//   ② MISURA LA CHIAMATA, NON IL PERCORSO: «questo file chiama la guardia» non è «ci passa sempre».
//      La chiamata può stare in un ramo morto o in una funzione che nessuno invoca. È la differenza
//      fra una porta con la serratura e una porta chiusa a chiave, e quel livello lo dà solo un test
//      a tabella condivisa. Ma NON è più il buco di prima: fra «la chiamata c'è, forse su un ramo
//      morto» e «c'è solo la parola dentro una stringa» corre tutta la distanza fra le due versioni.
//   ②bis DUE FORME DI CHIAMATA CHE NON DISTINGUO: `oggetto.ammissibilitaProva(x)` conta come
//      passaggio anche se `oggetto` è un altro oggetto con un metodo omonimo (scelto così apposta:
//      `import * as P` + `P.ammissibilitaProva(x)` ci passa davvero, e accusarlo sarebbe un rosso
//      falso); e una rinomina per destrutturazione (`const { ammissibilitaProva: g } = …; g(x)`) NON
//      la vedo — quel file risulterebbe scoperto. Sbaglio in rosso, non in verde.
//   ③ VEDE SOLO CIÒ CHE UN'ANALISI DI TESTO PUÒ VEDERE, e solo dentro `dove`: una porta dinamica
//      (nome costruito a runtime, wrapper che rinomina l'atto) non si vede. Fuori perimetro finché
//      nessuno li dichiara: `cervello/*.sh`, `cervello/vps/*.sh`, i workflow n8n, i YAML della CI, il
//      repo del marketplace. Una cartella dichiarata e assente si dichiara ⚪ ACCANTO alla misura
//      (l'atto resta misurato sul resto e non può uscire verde); se non se ne legge nessuna, l'atto è
//      ⚪ per intero. Una cartella MAI dichiarata non esce affatto.
//   ③bis IL RILEVATORE GUARDA ANCHE DENTRO LE STRINGHE, e la guardia NO. Non è una svista: sono due
//      domande diverse. L'atto può essere scritto come DATO (`a.stato = "chiuso"` in
//      `round2-applica.mjs:67`, `stato: "chiuso"` in `cantiere-snello.ts:355`: due porte vere che
//      sparirebbero spegnendo le stringhe), mentre la guardia o la chiami o non la chiami. Il prezzo:
//      un file che nomina l'atto dentro un messaggio può essere contato come porta di troppo — un
//      rosso in più, che si chiude nominandolo in `esenti`. Mai un verde in meno.
//   ③ter IL RILEVATORE VEDE QUATTRO GRAFIE SU OTTO, e il numero è misurato il 23/8/2026 con il
//      rilevatore vero, non stimato: `timbraChiusura(…)`, `d.stato = "chiuso"`, `stato: "chiuso"`
//      dentro un oggetto e `Object.assign(d, {stato:"chiuso"})` le VEDE; gli apici singoli
//      (`d.stato = 'chiuso'`), gli apici inversi, `d["stato"] = "chiuso"` e la costante intermedia
//      (`const CHIUSO = "chiuso"; d.stato = CHIUSO`) NO. La forma giusta di questa casa — il timbro
//      unico che AR-575 ha reso obbligatorio — è la prima, e la vede sempre. Quanto costa oggi:
//      rimisurando i 573 file del perimetro con un rilevatore largo escono le STESSE 4 porte, cioè
//      il buco ne nasconde ZERO adesso. Ma resta un verso in cui si sbaglia in VERDE — la stessa
//      porta, riscritta con gli apici singoli, sparisce — e sta scritto qui invece che essere
//      scoperto. Allargare il rilevatore è una riga nel registro, non nel codice.
//   ④ NON DICE SE LA GUARDIA È GIUSTA: se la guardia registrata è debole, tutte le porte «passano» e
//      il verde è su una difesa che non difende. Misura la copertura, non la qualità. Nello stesso
//      verso: un file che si DEFINISCE in casa una funzione omonima e chiama quella risulta passante.
//   ⑤ NON RIMPIAZZA `spazzata-fratelli`, `sorvegliante` ⑩, `porte-check`, `uscite-check` né
//      `indentazione-guardia`: fa una domanda diversa sulla stessa superficie.
//   ⑥ LA PORTA È IL FILE, non la chiamata. Due porte gemelle NELLO STESSO FILE — è il caso vivo di
//      `calibrazione.mjs` per AR-172 — risultano una porta sola, e siccome quel file la guardia la
//      chiama, l'atto passerebbe. Correzione dichiarata alla spec del 23/8, che dava AR-172 per
//      fermato: qui NON lo è. Per prenderlo servirebbe la granularità di funzione, oppure — meglio —
//      spostare la porta a mano sulla stessa guardia dell'automatica.
//
// 🚫 NON DIPENDE DAGLI ALTRI FRENI DEL LOTTO e non li nomina: né `due-case.mjs` né
// `puntatori-scollegati.mjs`. Le dipendenze incrociate fra freni nati insieme sono state la causa di
// metà dei rossi del giro scorso: un freno che per essere verde ha bisogno di un fratello nato ieri
// nasce già fragile.
//
// La voce di un atto nel registro: id · atto · perche_conta · guardia{file,funzione} · casa (il file
// dove l'atto è scritto una volta sola: si dichiara, e viene verificato) · rilevatore · dove[] ·
// estensioni[] · esenti[] · tetto_porte (facoltativo) · tetto_strutturali (obbligatorio se c'è
// almeno un'esenzione strutturale).
// La voce di un'esenzione: file · perche · natura ("temporanea" quando manca) e, secondo la natura,
// `fino_al` + `si_toglie_quando` oppure `perche_per_sempre`.
//
// Due variabili d'ambiente per poterlo provare su un albero finto senza sporcare il repo (la via che
// `SPAZZATA_REPO` ha già dovuto aprire in AR-334): `PORTE_GEMELLE_REPO`, `PORTE_GEMELLE_REGISTRO`.
//

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
// 🧹 «Cos'è un commento» lo sa UN posto solo, e serve al RILEVATORE: quella lente è a righe (deve
// esserlo: il sorvegliante applica la stessa regola sulle righe di un diff) e lascia stare le
// stringhe, perché l'atto può essere scritto come dato. La lente della GUARDIA è un'altra cosa e sta
// più sotto (`soloCodice`): legge carattere per carattere, perché una parola dentro un template che
// spanna tre righe una lente a righe non la può vedere.
import { senzaCommenti } from "./spazzata-fratelli.mjs";
// 🔭 Il perimetro si MISURA (perimetro.mjs, lotto 33): `leggiPerimetro` torna `null` — non `[]` — se
// la radice non si può leggere. «Non ho potuto guardare» e «non c'è niente» sono due risposte diverse,
// ed è esattamente da lì che nascono i guardiani ciechi che si dichiarano verdi.
import { leggiPerimetro } from "./perimetro.mjs";
// 🚦 I codici d'uscita non si ricopiano a mano (AR-711).
import { CODICE } from "./esito-guardiano.mjs";
// 💾 L'unica scrittura possibile passa di qui (AR-639).
import { scriviJsonAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.PORTE_GEMELLE_REPO || dirname(QUI);
const REGISTRO = process.env.PORTE_GEMELLE_REGISTRO || join(QUI, "atti-con-porte.json");
/** Questo file cita gli atti che vieta: contarlo come porta sarebbe punire chi scrive la difesa. */
const SE_STESSO = "cervello/porte-gemelle.mjs";

/** Quanti caratteri deve avere un perché per essere un perché. Stessa soglia di `spazzata-fratelli`,
 *  `porte-check` e `malattie-mancanti`: sotto, è una scrollata di spalle scritta. */
export const PERCHE_MIN = 30;

/** Oltre questo numero di porte scoperte un atto non si cura a nomi: o dichiara un tetto, o va a un
 *  guardiano dedicato. Il numero nasce dalla misura di AR-558: 45 porte per «scrivere un JSON». */
export const MAX_PORTE = 8;

/** Le due sole nature che un'esenzione può avere. Non c'è una terza via, ed è deliberato: una
 *  casella «altro» diventa il posto dove va tutto ciò che non si vuole decidere. */
export const NATURE = ["temporanea", "strutturale"];

/**
 * LA NATURA DICHIARATA DI UN'ESENZIONE. Pura.
 *
 * Chi non la scrive è «temporanea», e la direzione del default è la cosa importante: un campo
 * dimenticato non può regalare il per-sempre. Se il default cadesse dall'altra parte, la strada più
 * facile — non scrivere niente — sarebbe anche quella che spegne una porta per l'eternità.
 *
 * Torna `""` quando la natura è scritta e non è una delle due: una parola inventata non vale come
 * dichiarazione, e trattarla come «temporanea» significherebbe accettare in silenzio un refuso.
 */
export function naturaDi(esenzione = {}) {
  const n = String(esenzione?.natura ?? "").trim().toLowerCase();
  if (!n) return "temporanea";
  return NATURE.includes(n) ? n : "";
}

/** I percorsi si confrontano sempre con le barre in avanti, su qualunque sistema. */
export function normalizza(p = "") {
  return String(p || "").split(sep).join("/").replace(/^\.\//, "");
}

/** La data di oggi come «AAAA-MM-GG», per confrontarla con le scadenze delle esenzioni. */
export function oggiIso(d = new Date()) {
  return new Date(d.getTime()).toISOString().slice(0, 10);
}

/** Un nome dentro un'espressione regolare va messo in fuga: `$` da solo aprirebbe un'altra regola. */
export function fuga(s = "") {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─────────────────────────────────────────────────────────────────────────────
// LA LENTE DELLA GUARDIA: che cosa il file FA, non che cosa il file NOMINA.
// ─────────────────────────────────────────────────────────────────────────────

/** Dopo una di queste parole una barra apre un'espressione regolare, non una divisione. */
const PRIMA_DI_UNA_REGEX = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "case", "do", "else", "yield", "await", "throw",
]);

/** `a / b` o `/regola/`? Si guarda l'ultima cosa scritta: dopo un valore (nome, numero, parentesi
 *  chiusa, stringa già spenta, e in JSX dopo `<` o `>`) la barra divide; altrimenti apre una regola. */
function unaRegexPuoIniziareQui(uscita = "") {
  const t = uscita.replace(/\s+$/, "");
  if (!t) return true;
  const ultimo = t[t.length - 1];
  if (/[A-Za-z0-9_$]/.test(ultimo)) {
    const parola = (t.match(/[A-Za-z_$][A-Za-z0-9_$]*$/) || [""])[0];
    return PRIMA_DI_UNA_REGEX.has(parola);
  }
  return !")]\"'`<>".includes(ultimo);
}

/** Dov'è la chiusura di questo letterale, SULLA STESSA RIGA? `-1` se non c'è: allora quel carattere
 *  non apriva niente — è l'apostrofo di «l'ordine» dentro del testo JSX, non una stringa. Cercare
 *  oltre la riga farebbe divorare al lettore il codice vero che viene dopo, e un pezzo di codice
 *  divorato è un'accusa falsa. */
function chiusuraSullaRiga(s, apertura, quale) {
  for (let i = apertura + 1; i < s.length; i++) {
    if (s[i] === "\\") { i++; continue; }
    if (s[i] === "\n") return -1;
    if (s[i] === quale) return i;
  }
  return -1;
}

/**
 * SOLO IL CODICE: torna il testo con stringhe, template, commenti ed espressioni regolari SPENTI
 * (sostituiti da segnaposti che tengono le righe al loro posto), e il codice vero lasciato intatto —
 * compreso quello dentro le interpolazioni `${…}` di un template, che codice è.
 *
 * 🔧 È LA RIPARAZIONE DEL DIFETTO CHE HA BOCCIATO LA VERSIONE PRECEDENTE. Prima la guardia si cercava
 * con `\bnome\b` su tutto il file: bastava che la parola comparisse dentro una stringa — un messaggio
 * d'errore, una nota, un import mai usato — e il file risultava «passa dalla guardia».
 *
 * Perché un lettore carattere per carattere e non una regex: una regex a righe non vede un template
 * che spanna tre righe, ed è proprio lì che una parola si nasconde meglio. Perché non il parser di
 * node: node non lo espone, e questa casa non ha dipendenze esterne. Quindi RESTRINGO e lo dichiaro:
 * riconosco stringhe, template, commenti e letterali di espressione regolare che si CHIUDONO dove ci
 * si aspetta (la stringa entro la riga, contando le barre di continuazione; il template e il commento
 * a blocco anche più avanti). Se una virgoletta non ha compagna, non apriva niente: è l'apostrofo di
 * «l'ordine» dentro del testo JSX, e resta un carattere qualsiasi — divorare da lì in poi
 * spegnerebbe codice vero e produrrebbe un'accusa falsa.
 *
 * 🕳️ IL BUCO DI QUESTA SCELTA, detto e non nascosto: una virgoletta lasciata aperta per sbaglio fa
 * leggere come CODICE quello che è testo, e se lì dentro c'è scritto `nome(` il file risulterebbe
 * passante. Cioè in quel caso sbaglio verso il VERDE, non verso il rosso. Non è un caso che si
 * incontri (un file con una stringa aperta non compila nemmeno), ma è il verso in cui sbaglia, e chi
 * legge deve saperlo invece di scoprirlo.
 */
export function soloCodice(testo = "") {
  const s = String(testo);
  const n = s.length;
  let out = "";
  let i = 0;
  // La pila tiene i template aperti: dentro `${…}` si torna a leggere CODICE VERO, e la graffa che
  // chiude l'interpolazione va distinta da quelle di un oggetto scritto lì dentro.
  const pila = [];
  while (i < n) {
    const cima = pila[pila.length - 1];
    if (cima && cima.tipo === "template") {
      const c = s[i];
      if (c === "\\") { i += 2; continue; }
      if (c === "`") { pila.pop(); out += '""'; i++; continue; }
      if (c === "$" && s[i + 1] === "{") { pila.push({ tipo: "interpolazione", graffe: 0 }); out += " "; i += 2; continue; }
      if (c === "\n") out += "\n";
      i++;
      continue;
    }
    const c = s[i];
    const d = s[i + 1];
    if (c === "/" && d === "/") {
      while (i < n && s[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && d === "*") {
      const fine = s.indexOf("*/", i + 2);
      const stop = fine < 0 ? n : fine + 2;
      for (let k = i; k < stop; k++) if (s[k] === "\n") out += "\n";
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      const fine = chiusuraSullaRiga(s, i, c);
      if (fine < 0) { out += " "; i++; continue; }
      out += '""';
      i = fine + 1;
      continue;
    }
    if (c === "`") {
      // Un apice inverso senza compagno più avanti non apre un template: lasciarlo aprire spegnerebbe
      // tutto il resto del file, e un file spento è un file accusato per sbaglio.
      if (s.indexOf("`", i + 1) < 0) { out += " "; i++; continue; }
      pila.push({ tipo: "template" });
      i++;
      continue;
    }
    if (c === "/" && unaRegexPuoIniziareQui(out)) {
      let j = i + 1;
      let inClasse = false;
      let fine = -1;
      for (; j < n; j++) {
        const x = s[j];
        if (x === "\\") { j++; continue; }
        if (x === "\n") break;
        if (x === "[") inClasse = true;
        else if (x === "]") inClasse = false;
        else if (x === "/" && !inClasse) { fine = j; break; }
      }
      if (fine < 0) { out += c; i++; continue; }
      i = fine + 1;
      while (i < n && /[dgimsuvy]/.test(s[i])) i++;
      out += " 0 ";
      continue;
    }
    if (cima && cima.tipo === "interpolazione") {
      if (c === "{") cima.graffe++;
      else if (c === "}") {
        if (cima.graffe === 0) { pila.pop(); out += " "; i++; continue; }
        cima.graffe--;
      }
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * GLI ALTRI NOMI DELLA STESSA GUARDIA: chi la importa rinominandola (`{ ammissibilitaProva as g }`)
 * e poi chiama `g(…)` ci passa davvero. Non contarlo sarebbe un rosso falso, e un rosso falso spegne
 * un cancello quanto un verde falso.
 */
export function aliasDellaGuardia(codice = "", funzione = "") {
  const nome = String(funzione || "");
  if (!nome) return [];
  const re = new RegExp(`\\b${fuga(nome)}\\s+as\\s+([A-Za-z_$][A-Za-z0-9_$]*)`, "g");
  const out = new Set();
  let m;
  while ((m = re.exec(String(codice)))) out.add(m[1]);
  return [...out];
}

/**
 * QUESTO FILE CHIAMA LA GUARDIA? Non «la nomina»: la CHIAMA. Si cerca la forma `nome(` — ammesse la
 * chiamata opzionale `nome?.(` e quella su un oggetto (`P.nome(`, il caso di `import * as P`) — sul
 * testo con stringhe, template, commenti ed espressioni regolari già spenti.
 *
 * Le tre righe innocue che prima spegnevano l'accusa e adesso non la spengono più:
 *   `export const NOTA = "ammissibilitaProva";`                       → stringa spenta, nessuna chiamata
 *   `throw new Error("… vedi ammissibilitaProva in …");`              → stringa spenta, nessuna chiamata
 *   `import { ammissibilitaProva as _g } from "./prova-ammissibile.mjs";` → alias `_g` mai chiamato
 */
export function chiamaLaGuardia(testo = "", funzione = "") {
  const nome = String(funzione || "");
  if (!nome) return { chiama: false, come: null };
  const codice = soloCodice(testo);
  for (const n of [nome, ...aliasDellaGuardia(codice, nome)]) {
    if (new RegExp(`(?:^|[^A-Za-z0-9_$])${fuga(n)}\\s*(?:\\?\\.\\s*)?\\(`).test(codice)) {
      return { chiama: true, come: n === nome ? `${nome}()` : `${n}() — cioè ${nome}(), importata con un altro nome` };
    }
  }
  return { chiama: false, come: null };
}

/**
 * I PRIMITIVI DELL'ATTO: i soli nomi che il rilevatore cerca come CHIAMATA (`nome\s*\(`).
 *
 * 🔧 LA RIPARAZIONE DELLA PRIMA BOCCIATURA. Prima si pescava dal rilevatore OGNI parola di almeno tre
 * lettere: da `timbraChiusura\s*\(|\bstato\s*[:=]\s*"chiuso"` uscivano anche `stato` e `chiuso`, e poi
 * si scartava come «casa dell'atto» qualunque file che esportasse una di quelle parole. In una
 * macchina scritta in italiano `stato` e `chiuso` stanno dappertutto: bastava aggiungere in fondo ad
 * `auto-fix.mjs` la riga `export const stato = "chiuso";` — che non ripara niente — e il freno passava
 * da rosso a VERDE, col file sparito perfino dall'elenco delle porte. Chi è una porta non si decide da
 * una forma di testo: qui si prendono solo i nomi CHIAMATI, e servono a UNA cosa sola — verificare la
 * casa DICHIARATA nel registro.
 */
export function primitiviDelRilevatore(rilevatore = "") {
  const pezzi = String(rilevatore).match(/[A-Za-z_$][A-Za-z0-9_$]{2,}(?:\\[sS][*+?]?|\s)*\\?\(/g) || [];
  return [...new Set(pezzi.map((t) => t.match(/^[A-Za-z_$][A-Za-z0-9_$]*/)[0]))];
}

/**
 * QUESTO FILE È LA CASA DELL'ATTO? Si guarda cosa il file FA, in due mosse che una riga qualsiasi non
 * altera:
 *   ① se IMPORTA il primitivo da un altro file, la casa è quell'altro file — e lui è una porta. È il
 *      caso vero di `auto-fix.mjs`, che fa `import { timbraChiusura } from "./contratto-scheda.mjs"`
 *      e poi `export { timbraChiusura }`: riscrivere quel rimando come `export const timbraChiusura =
 *      …` (stessa cosa, altra forma) faceva diventare verde il freno. Adesso no: chi importa non è
 *      la casa, comunque scriva la riga.
 *   ② altrimenti deve DEFINIRLO davvero (`function nome(`, `class nome`, `const nome = …`).
 */
export function eLaCasaDellAtto(testo = "", primitivi = []) {
  const t = String(testo);
  if (!primitivi.length) return false;
  if (primitivi.some((n) => new RegExp(`import[\\s\\S]{0,400}?\\b${fuga(n)}\\b[\\s\\S]{0,400}?from`).test(t))) return false;
  return primitivi.some(
    (n) =>
      new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:function\\*?|class)\\s+${fuga(n)}\\b`).test(t) ||
      new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:const|let|var)\\s+${fuga(n)}\\s*=`).test(t),
  );
}

/**
 * IL VERDETTO SULLA CASA DICHIARATA. Pura.
 *
 * La casa è l'unico file che l'atto può NON compiere pur nominandolo: è il posto dove l'atto è
 * scritto una volta sola. Si DICHIARA nel registro (`casa: "cervello/contratto-scheda.mjs"`) e si
 * VERIFICA. Le tre risposte:
 *   · `null` — o non c'è casa dichiarata (allora non si scarta niente, e la casa esce come porta:
 *     l'omissione rende il freno più rosso, mai più verde), o la dichiarazione regge;
 *   · `{cieco}` — non ho potuto verificarla: uno scarto non verificato è esattamente il buco di prima;
 *   · `{motivo}` — la dichiarazione è FALSA: una porta travestita da casa. Rosso.
 */
export function verdettoCasa(atto = {}, files = []) {
  const casa = normalizza(atto?.casa);
  if (!casa) return null;
  const primitivi = primitiviDelRilevatore(atto?.rilevatore);
  if (!primitivi.length) {
    return { cieco: `dichiara la casa «${casa}» ma il rilevatore non nomina nessuna funzione chiamata: non posso verificare che sia davvero la casa, e uno scarto non verificabile è il buco che questo freno chiude` };
  }
  const dentro = files.find((f) => normalizza(f.file) === casa);
  if (!dentro) {
    return { cieco: `la casa dichiarata «${casa}» non è fra i file di «dove»: non l'ho letta, quindi non l'ho verificata` };
  }
  if (!eLaCasaDellAtto(soloCodice(String(dentro.testo ?? "")), primitivi)) {
    return { motivo: `la casa dichiarata non definisce ${primitivi.map((n) => `${n}()`).join(" né ")} — o se lo importa da un altro file: una casa che non scrive l'atto è una porta travestita da casa, e scartarla sarebbe un buco` };
  }
  return null;
}

/** I test CITANO ciò che vietano: è il loro mestiere, e contarli come porte fa crescere il numero
 *  proprio quando qualcuno scrive la prova che lo impedisce. */
export function eUnTest(rel = "") {
  const p = normalizza(rel);
  return p.split("/").includes("test") || /\.(test|spec)\.[cm]?[jt]sx?$/.test(p);
}

/**
 * LE PORTE DI UN ATTO. Pura: entrano l'atto e i file già letti, esce l'elenco delle porte con lo
 * stato di ognuna (`passa` misurato · `dichiarata` in `esenti` · `scoperta`).
 *
 * Due lenti diverse su due domande diverse, ed è deliberato (limite ③bis):
 *   · CHI COMPIE L'ATTO — `senzaCommenti`, che lascia stare le stringhe: l'atto può essere scritto
 *     come dato (`a.stato = "chiuso"`), e spegnere le stringhe farebbe sparire due porte vere.
 *   · CHI CHIAMA LA GUARDIA — `chiamaLaGuardia`, che spegne stringhe, template, commenti ed
 *     espressioni regolari: la guardia o la chiami o non la chiami, e nominarla non è chiamarla.
 *
 * @param {object} atto   la voce del registro
 * @param {Array<{file:string,testo:string}>} files  i file del perimetro, percorso relativo al repo
 */
export function porteDiUnAtto(atto = {}, files = []) {
  const re = new RegExp(String(atto.rilevatore ?? ""), "m");
  const funzione = String(atto?.guardia?.funzione || "");
  // Fuori gioco: la guardia (chi la ospita ci passa per definizione), la casa DICHIARATA e verificata
  // dal registro, e questo stesso file. Nient'altro: nessun file può chiamarsi fuori da solo
  // scrivendo una riga — è il buco che ha bocciato la prima versione.
  const fuoriGioco = new Set([normalizza(atto?.guardia?.file), normalizza(atto?.casa), SE_STESSO].filter(Boolean));
  const esenti = new Map((atto.esenti || []).map((e) => [normalizza(e?.file), e]));
  const porte = [];
  for (const { file, testo } of files) {
    const rel = normalizza(file);
    if (fuoriGioco.has(rel) || eUnTest(rel)) continue;
    const perRilevatore = senzaCommenti(String(testo ?? ""), rel);
    const righe = perRilevatore.split("\n");
    const i = righe.findIndex((r) => re.test(r));
    if (i < 0) continue;
    const chiamata = chiamaLaGuardia(String(testo ?? ""), funzione);
    const esenzione = esenti.get(rel) || null;
    porte.push({
      file: rel,
      riga: i + 1,
      riga_testo: righe[i].trim().slice(0, 120),
      stato: chiamata.chiama ? "passa" : esenzione ? "dichiarata" : "scoperta",
      come: chiamata.come,
      esenzione,
    });
  }
  return porte.sort((a, b) => a.file.localeCompare(b.file));
}

/**
 * LE ESENZIONI CHE NON VALGONO PIÙ, e il motivo di ognuna.
 *
 * Un residuo lasciato lì nasconde il prossimo caso vero — è la lezione già pagata su
 * `bypass-del-cancello`, e la stessa che `pesaEsenzioni` applica in `spazzata-fratelli`. Cinque modi
 * di non valere: senza file · nessuna porta lì (file sparito, o il rilevatore non lo prende più) ·
 * quella porta adesso chiama davvero la guardia (l'hai curata: toglila) · perché troppo corto ·
 * scaduta o senza scadenza (un'attesa senza data è un'esenzione travestita, AR-338).
 */
export function esenzioniMorte(atto = {}, porte = [], oggi = new Date(), cartelleCieche = []) {
  const perFile = new Map(porte.map((p) => [p.file, p]));
  const morte = [];
  const limite = oggiIso(oggi);
  for (const e of atto.esenti || []) {
    const file = normalizza(e?.file);
    if (!file) {
      morte.push({ file: "(senza file)", motivo: "esenzione senza `file`: non copre niente" });
      continue;
    }
    // 🔧 Un'esenzione che abita una cartella che non si legge NON è morta: è non misurabile. Senza
    // questa riga, togliere `pannello/` faceva accusare `cantiere-snello.ts` di essere un residuo —
    // un rosso falso, cioè il modo più veloce per far spegnere un cancello. La cecità della cartella
    // è già dichiarata ⚪ accanto alla misura.
    if (cartelleCieche.some((d) => file === normalizza(d) || file.startsWith(`${normalizza(d)}/`))) continue;
    const p = perFile.get(file);
    if (!p) {
      morte.push({ file, motivo: "nessuna porta qui: o il file non c'è più, o il rilevatore non lo prende più — un residuo nasconde il prossimo caso vero" });
      continue;
    }
    if (p.stato === "passa") {
      morte.push({ file, motivo: "adesso chiama davvero la guardia: l'esenzione è un residuo, toglila" });
      continue;
    }
    const perche = String(e?.perche || "").trim();
    if (perche.length < PERCHE_MIN) {
      morte.push({ file, motivo: `il perché è ${perche.length} caratteri (ne servono ${PERCHE_MIN}): senza, è un'esenzione travestita` });
      continue;
    }
    // 🔧 DA QUI IN GIÙ È LA CURA DEL 23/8 SERA: la scadenza deve riflettere il MOTIVO. Prima c'era
    // una sola strada — `fino_al` per tutti — e il risultato misurato era che le tre esenzioni del
    // registro morivano tutte lo stesso giorno, il 15 ottobre 2026, mentre due di loro non avevano
    // niente da riparare quel giorno. Una miccia comune non è un freno: è una data da riscrivere.
    const natura = naturaDi(e);
    if (!natura) {
      morte.push({
        file,
        motivo: `natura «${String(e?.natura ?? "").trim()}» sconosciuta: le sole due sono "temporanea" (con \`fino_al\` e \`si_toglie_quando\`) e "strutturale" (senza \`fino_al\`, con \`perche_per_sempre\`)`,
      });
      continue;
    }
    if (natura === "strutturale") {
      // Una strutturale con una data è la miccia rimessa dentro la cura: o scade o è per sempre.
      if (String(e?.fino_al || "").trim()) {
        morte.push({
          file,
          motivo: `dichiarata "strutturale" e insieme "fino_al": ${String(e.fino_al).trim()} — o scade o è per sempre. Scriverli insieme rimette la scadenza che il per-sempre serviva a togliere`,
        });
        continue;
      }
      // Il per-sempre costa un perché IN PIÙ della proroga, non uno in meno: `perche` dice perché
      // questa porta non passa dalla guardia, `perche_per_sempre` perché nessun lavoro futuro
      // cambierà quella risposta. Sono due domande diverse, e la seconda è quella che si sta
      // chiedendo di credere per sempre.
      const perSempre = String(e?.perche_per_sempre || "").trim();
      if (perSempre.length < PERCHE_MIN) {
        morte.push({
          file,
          motivo: `"strutturale" con un \`perche_per_sempre\` di ${perSempre.length} caratteri (ne servono ${PERCHE_MIN}): serve scritto perché NESSUN lavoro futuro potrà farla passare dalla guardia — altrimenti è una proroga infinita con un'altra etichetta`,
        });
        continue;
      }
      continue;
    }
    const fino = String(e?.fino_al || "").trim();
    if (!fino) {
      morte.push({
        file,
        motivo: 'senza `fino_al`: un\'attesa senza scadenza è un\'esenzione travestita (AR-338). Se non scadrà mai davvero, dichiarala `"natura": "strutturale"` e scrivi il `perche_per_sempre`',
      });
      continue;
    }
    if (fino < limite) {
      morte.push({ file, motivo: `esenzione scaduta il ${fino}: o la rinnovi dicendo perché, o la porta va curata` });
      continue;
    }
    // La seconda metà della data, ed è quella che il 15 ottobre sarebbe mancata: una scadenza senza
    // «cosa deve succedere per toglierla» non si può fare altro che riscriverla.
    const quando = String(e?.si_toglie_quando || "").trim();
    if (quando.length < PERCHE_MIN) {
      morte.push({
        file,
        motivo: `scade il ${fino} ma non dice \`si_toglie_quando\` (${quando.length} caratteri, ne servono ${PERCHE_MIN}): una data senza il fatto che la chiude, il giorno che arriva, si può solo riscrivere — ed è la tassa, non il freno`,
      });
      continue;
    }
  }
  return morte;
}

/**
 * IL VERDETTO SU UN ATTO. Pura. Le tre corsie, in quest'ordine:
 *   · esenzioni che non valgono più → rosso, sempre;
 *   · tetto DICHIARATO → governa lui: sopra il tetto è rosso, sotto o pari è debito visibile e in
 *     calo. Governa anche quando le scoperte scendono sotto `max_porte`, altrimenti migliorare da 12
 *     a 5 farebbe diventare rosso un atto che era verde — un metro che punisce chi cura si impara ad
 *     aggirare;
 *   · nessun tetto → fino a `max_porte` ogni porta scoperta si nomina (rosso, con file e riga);
 *     oltre, l'atto è rosso e il messaggio indica le DUE uscite, perché un rosso senza uscita è un
 *     cancello che qualcuno spegnerà.
 */
export function verdettoAtto(atto = {}, porte = [], oggi = new Date(), maxPorte = MAX_PORTE, motiviDaFuori = [], cartelleCieche = []) {
  const scoperte = porte.filter((p) => p.stato === "scoperta");
  const dichiarate = porte.filter((p) => p.stato === "dichiarata");
  const passano = porte.filter((p) => p.stato === "passa");
  const morte = esenzioniMorte(atto, porte, oggi, cartelleCieche);
  // Il per-sempre si CONTA, e si conta dal REGISTRO, non dalle porte trovate: una cartella che non
  // si legge fa sparire la porta, non la dichiarazione — e un numero che scende perché una cartella
  // era cieca è un debito cancellato senza averlo pagato (la stessa ragione per cui
  // `--aggiorna-tetti` si rifiuta di scendere da mezza misura).
  const strutturali = (atto.esenti || []).filter((e) => naturaDi(e) === "strutturale");
  const tettoStrutturali = Number.isInteger(atto.tetto_strutturali) ? atto.tetto_strutturali : null;
  const tetto = Number.isInteger(atto.tetto_porte) ? atto.tetto_porte : null;
  const max = Number.isInteger(atto.max_porte) ? atto.max_porte : maxPorte;
  const guardia = `${atto?.guardia?.funzione || "(guardia non dichiarata)"}()`;
  const motivi = [...motiviDaFuori];

  for (const m of morte) motivi.push({ tipo: "esenzione-morta", dove: m.file, motivo: m.motivo });

  // Il per-sempre non è gratis. Senza un tetto dichiarato «strutturale» sarebbe la parola con cui si
  // spegne qualunque porta scrivendo due frasi — cioè la casella dove i buchi vanno a morire di
  // vecchiaia, che è esattamente il difetto che questo freno esiste per prendere.
  if (strutturali.length) {
    const nomi = strutturali.map((e) => normalizza(e?.file) || "(senza file)").join(", ");
    if (tettoStrutturali == null) {
      motivi.push({
        tipo: "per-sempre-senza-tetto",
        dove: nomi,
        motivo:
          `${strutturali.length} esenzione/i dichiarata/e "strutturale", cioè spenta/e per sempre, e nessun "tetto_strutturali". ` +
          `Dichiara "tetto_strutturali": ${strutturali.length} in questo atto: diventa un numero visibile che scende e non risale, e la prossima porta spenta per sempre fa rosso subito.`,
      });
    } else if (strutturali.length > tettoStrutturali) {
      motivi.push({
        tipo: "sopra-il-tetto-per-sempre",
        dove: nomi,
        motivo: `${strutturali.length} esenzioni per sempre contro un tetto di ${tettoStrutturali}: il tetto scende e non risale, e una porta spenta per sempre in più non entra nemmeno sotto`,
      });
    }
  }

  if (tetto != null) {
    if (scoperte.length > tetto) {
      motivi.push({
        tipo: "sopra-il-tetto",
        dove: scoperte.map((p) => `${p.file}:${p.riga}`).join(", "),
        motivo: `${scoperte.length} porte scoperte contro un tetto di ${tetto}: il tetto scende e non risale, una porta NUOVA non entra nemmeno sotto`,
      });
    }
  } else if (scoperte.length > max) {
    motivi.push({
      tipo: "troppe-porte-senza-tetto",
      dove: scoperte.map((p) => `${p.file}:${p.riga}`).join(", "),
      motivo:
        `${scoperte.length} porte scoperte (oltre ${max}) e nessun tetto. Due uscite, non una: ` +
        `① dichiara "tetto_porte": ${scoperte.length} in questo atto — diventa un numero visibile e in calo; ` +
        `② dai a questo atto un guardiano dedicato e rimanda a lui. Senza una delle due l'atto resta rosso.`,
    });
  } else {
    for (const p of scoperte) {
      motivi.push({
        tipo: "porta-scoperta",
        dove: `${p.file}:${p.riga}`,
        motivo:
          `compie l'atto e non chiama ${guardia} da nessuna parte (nominarla in una stringa, in un commento o in un import mai usato non conta) — ` +
          `falla passare, oppure dichiarala in "esenti" col perché (≥${PERCHE_MIN} caratteri) e la sua natura: "temporanea" con "fino_al" e "si_toglie_quando", ` +
          `oppure "strutturale" senza data e con "perche_per_sempre" (e allora conta contro "tetto_strutturali")`,
      });
    }
  }

  return {
    id: atto.id || "(atto senza id)",
    ok: motivi.length === 0,
    guardia: `${normalizza(atto?.guardia?.file)} · ${atto?.guardia?.funzione || "?"}`,
    passano: passano.length,
    dichiarate: dichiarate.length,
    // I due pezzi di `dichiarate` vengono dalle PORTE, e quindi sommano sempre a `dichiarate`.
    // `per_sempre` qui sotto viene invece dal REGISTRO e può essere più grande: se `pannello/` non si
    // legge, quella porta non c'è ma la dichiarazione sì. Due numeri, due fonti, e le fonti sono
    // scritte accanto a ognuno — un numero senza la sua fonte è il modo in cui un rapporto mente.
    dichiarate_per_sempre: dichiarate.filter((p) => naturaDi(p.esenzione) === "strutturale").length,
    dichiarate_a_scadenza: dichiarate.filter((p) => naturaDi(p.esenzione) !== "strutturale").length,
    per_sempre: strutturali.length,
    tetto_strutturali: tettoStrutturali,
    scoperte: scoperte.length,
    tetto,
    motivi,
    porte,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Da qui in giù: I/O. Tutto ciò che DECIDE sta sopra, dove una prova lo può eseguire.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * I file del perimetro di un atto.
 *
 * 🔧 RIPARATO: prima bastava UNA cartella illeggibile per buttare via l'atto intero — tolto
 * `pannello/`, il rosso già provato dentro `cervello/` (che si leggeva benissimo) spariva dietro un
 * ⚪. Un cieco che si mangia un rosso provato è un modo di far passare la consegna. Adesso si misura
 * su quello che si legge, la cartella persa si dichiara accanto, e il risultato non può essere verde:
 * al massimo ⚪. Solo se NON si legge niente l'atto è cieco per intero.
 */
function fileDellAtto(atto) {
  const estensioni = Array.isArray(atto.estensioni) && atto.estensioni.length ? atto.estensioni : [".mjs", ".ts", ".tsx"];
  const dove = Array.isArray(atto.dove) && atto.dove.length ? atto.dove : ["cervello"];
  const fuori = [];
  const cieche = [];
  for (const d of dove) {
    const radice = join(REPO, d);
    const letti = leggiPerimetro(radice, { estensioni, escludi: ["test"] });
    if (letti == null) {
      cieche.push({ cartella: d, motivo: `la cartella dichiarata «${d}» non si legge da qui (in CI \`pannello/\` o \`marketplace/\` possono mancare)` });
      continue;
    }
    for (const x of letti) fuori.push({ file: normalizza(join(d, x.file)), testo: x.testo });
  }
  if (cieche.length === dove.length) return { files: null, cieche, motivo: cieche.map((c) => c.motivo).join(" · ") };
  return { files: fuori, cieche, motivo: null };
}

function leggiJson(percorso) {
  try {
    return { dati: JSON.parse(readFileSync(percorso, "utf8")), errore: null };
  } catch (e) {
    return { dati: null, errore: e.message };
  }
}

function main() {
  const jsonMode = process.argv.includes("--json");
  const aggiornaTetti = process.argv.includes("--aggiorna-tetti");
  const oggi = new Date();

  const { dati: registro, errore } = leggiJson(REGISTRO);
  if (errore || !Array.isArray(registro?.atti)) {
    const motivo = errore ? `registro illeggibile (${REGISTRO}): ${errore}` : "il registro non ha un elenco `atti`";
    if (jsonMode) console.log(JSON.stringify({ ok: false, cieco: true, motivo }, null, 2));
    else console.error(`⚪ PORTE GEMELLE — non ho potuto misurare: ${motivo}. Cieco non è verde.`);
    process.exit(CODICE.cieco);
  }

  const maxPorte = Number.isInteger(registro.max_porte) ? registro.max_porte : MAX_PORTE;
  const verdetti = [];
  const ciechi = [];

  for (const atto of registro.atti) {
    const id = atto?.id || "(atto senza id)";
    try {
      new RegExp(String(atto?.rilevatore ?? ""), "m");
    } catch (e) {
      ciechi.push({ id, motivo: `il rilevatore non è un'espressione regolare valida: ${e.message}` });
      continue;
    }
    if (!atto?.rilevatore) {
      ciechi.push({ id, motivo: "nessun rilevatore dichiarato: non so chi compie questo atto" });
      continue;
    }
    const fileGuardia = normalizza(atto?.guardia?.file);
    if (!fileGuardia || !existsSync(join(REPO, fileGuardia))) {
      ciechi.push({ id, motivo: `il file della guardia («${fileGuardia || "non dichiarato"}») non c'è: non posso dire chi ci passa` });
      continue;
    }
    if (!String(atto?.guardia?.funzione || "").trim()) {
      ciechi.push({ id, motivo: "la guardia non dichiara la `funzione` da chiamare: senza un nome da cercare non misuro chi ci passa, e dire che nessuno ci passa sarebbe un rosso inventato" });
      continue;
    }
    const { files, cieche, motivo } = fileDellAtto(atto);
    if (files == null) {
      ciechi.push({ id, motivo });
      continue;
    }
    for (const c of cieche) ciechi.push({ id, motivo: `MISURATO SOLO IN PARTE — ${c.motivo}. Quello che ho letto lo dico lo stesso, ma non posso chiamarlo verde` });
    const casa = verdettoCasa(atto, files);
    if (casa?.cieco) {
      ciechi.push({ id, motivo: casa.cieco });
      continue;
    }
    const porte = porteDiUnAtto(atto, files);
    // 🔧 IL PAVIMENTO DEL VERDE. Zero porte trovate non è «tutto a posto»: è «non ho guardato
    // niente». Succede il giorno in cui la funzione viene rinominata e il rilevatore smette di
    // vederla — e prima quel giorno il freno lo salutava con un ✅. Un verde che non ha esaminato
    // nulla è la malattia, non la cura.
    if (!porte.length) {
      ciechi.push({
        id,
        motivo: `il rilevatore non ha trovato NESSUNA porta in ${(Array.isArray(atto.dove) ? atto.dove : ["cervello"]).join(", ")}: o l'atto non si compie più da nessuna parte, o il rilevatore è rotto. Zero cose guardate non fanno un verde`,
      });
      continue;
    }
    const motiviCasa = casa?.motivo ? [{ tipo: "casa-non-verificata", dove: normalizza(atto.casa), motivo: casa.motivo }] : [];
    verdetti.push(verdettoAtto(atto, porte, oggi, maxPorte, motiviCasa, cieche.map((c) => c.cartella)));
  }

  if (!registro.atti.length) {
    ciechi.push({ id: "(nessun atto)", motivo: "il registro non elenca nessun atto: non ho misurato niente, e non aver misurato niente non è un verde" });
  }

  // ── i tetti scendono, e solo quelli già dichiarati (aggiungerne uno qui sarebbe auto-assolversi) ──
  // 🔧 E scendono SOLO da una misura intera. Un tetto abbassato mentre una cartella non si legge — o
  // mentre un atto è uscito cieco — è un debito cancellato senza averlo pagato: il numero scende, non
  // risale più, e la porta rimasta aperta non la cerca più nessuno.
  if (aggiornaTetti) {
    if (ciechi.length) {
      console.log(
        `⛔ non abbasso nessun tetto: la misura di oggi è PARZIALE (${ciechi.length} controllo/i non misurato/i). ` +
          "Un tetto che scende da mezza misura è un debito cancellato senza pagarlo, e non risale più.",
      );
    } else {
      let cambiati = 0;
      for (const atto of registro.atti) {
        const v = verdetti.find((x) => x.id === atto.id);
        if (!v) continue;
        // Due tetti, la stessa regola: scendono alla misura di oggi e non risalgono mai. Il secondo
        // è quello delle esenzioni per sempre — quando una strutturale viene tolta perché la porta
        // è stata curata, il tetto la segue e nessuno può rimetterne un'altra al suo posto.
        for (const [campo, misura] of [
          ["tetto_porte", v.scoperte],
          ["tetto_strutturali", v.per_sempre],
        ]) {
          if (!Number.isInteger(atto[campo])) continue;
          const nuovo = Math.min(atto[campo], misura);
          if (nuovo !== atto[campo]) {
            atto[campo] = nuovo;
            cambiati++;
          }
        }
      }
      if (cambiati) {
        registro.aggiornato = new Date().toISOString().slice(0, 16).replace("T", " ");
        scriviJsonAtomico(REGISTRO, registro);
      }
      console.log(`🔻 tetti abbassati: ${cambiati}${cambiati ? "" : " (nessuno da abbassare)"}`);
    }
  }

  const rossi = verdetti.filter((v) => !v.ok);
  // 🔧 IL PAVIMENTO DEL VERDE, seconda metà: quante porte ho ESAMINATO in tutto. Se sono zero — il
  // registro senza atti, o ogni atto senza candidati — il verde non è disponibile. Prima `atti: []`
  // stampava «0 atto/i misurato/i» e subito sotto «✅ ogni porta di ogni atto passa dalla guardia»,
  // con uscita 0: una frase rassicurante su niente.
  const porteEsaminate = verdetti.reduce((n, v) => n + v.porte.length, 0);
  // Sotto un tetto dichiarato una porta scoperta NON fa rosso: è debito visibile e in calo. Ma allora
  // il verde non può dire «ognuna passa dalla guardia o è dichiarata», perché è falso. Un verde che
  // dice una cosa falsa è come un verde muto: si smette di leggerlo.
  const scoperteTotali = verdetti.reduce((n, v) => n + v.scoperte, 0);
  // E lo stesso vale per le porte spente PER SEMPRE: sono dentro il verde, e un verde che non le
  // nomina le fa sparire. Fonte: le esenzioni "strutturale" dichiarate nel registro (non le porte
  // trovate — vedi il commento accanto a `per_sempre` in `verdettoAtto`).
  const perSempreTotali = verdetti.reduce((n, v) => n + v.per_sempre, 0);
  const nienteGuardato = porteEsaminate === 0;
  // Il rosso vince sul cieco, e non è una svista: un atto MISURATO rosso è un guasto provato, un atto
  // cieco è un'ignoranza. Nasconderlo dietro il 2 farebbe passare la consegna. I ciechi restano
  // contati a parte, sempre, e non entrano mai nel verde.
  const uscita = rossi.length ? CODICE.rosso : ciechi.length || nienteGuardato ? CODICE.cieco : CODICE.verde;

  if (jsonMode) {
    // `ok` è l'uscita per il cancello, non «tutto a posto»: `porte_ancora_scoperte` è il debito che
    // un tetto dichiarato tiene fermo. Chi legge il JSON deve vedere il numero, non solo la spunta.
    console.log(
      JSON.stringify(
        {
          ok: uscita === CODICE.verde,
          uscita,
          acceso_il: registro.acceso_il,
          porte_esaminate: porteEsaminate,
          porte_ancora_scoperte: scoperteTotali,
          porte_spente_per_sempre: perSempreTotali,
          atti: verdetti,
          ciechi,
        },
        null,
        2,
      ),
    );
    process.exit(uscita);
  }

  console.log(`\n🚪🚪 PORTE GEMELLE — ${verdetti.length} atto/i misurato/i su ${porteEsaminate} porta/e esaminata/e, ${ciechi.length} cieco/i · registro acceso il ${registro.acceso_il || "(non dichiarato)"}\n`);
  for (const v of verdetti) {
    console.log(`${v.ok ? "✅" : "❌"} ${v.id} — guardia: ${v.guardia}`);
    const spaccato = v.dichiarate ? ` (${v.dichiarate_per_sempre} per sempre, ${v.dichiarate_a_scadenza} a scadenza)` : "";
    console.log(
      `   ${v.passano} chiama/no la guardia · ${v.dichiarate} dichiarata/e${spaccato} · ${v.scoperte} scoperta/e` +
        // Il per-sempre si stampa come `2/2 dal registro` e non come tetto secco: quando `pannello/`
        // non si legge le porte dichiarate scendono a 1 e il tetto resta 2, e un tetto solo, lì
        // accanto, si leggerebbe come «c'è posto per un'altra». Il numero che il tetto governa è
        // quello del registro, e va scritto con la sua fonte.
        `${v.tetto != null ? ` · tetto ${v.tetto}` : ""}` +
        `${v.tetto_strutturali != null ? ` · per sempre ${v.per_sempre}/${v.tetto_strutturali} dal registro` : ""}`,
    );
    for (const p of v.porte) {
      const eti = p.stato === "passa" ? "✅" : p.stato === "dichiarata" ? "➖" : "🕳️ ";
      // Accanto a ogni porta dichiarata si legge FINO A QUANDO. È il modo più corto di far vedere
      // la cura: il 15 ottobre non compare più su chi non ha niente da fare quel giorno.
      const perche =
        p.stato === "passa"
          ? ` · chiama ${p.come}`
          : p.stato === "dichiarata"
            ? naturaDi(p.esenzione) === "strutturale"
              ? " · dichiarata PER SEMPRE"
              : ` · dichiarata fino al ${String(p.esenzione?.fino_al || "(senza data)").trim()}`
            : "";
      console.log(`      ${eti} ${p.file}:${p.riga}${perche}`);
    }
    if (v.tetto != null && v.scoperte) {
      const dove = v.porte.filter((p) => p.stato === "scoperta").map((p) => `${p.file}:${p.riga}`).join(", ");
      console.log(`   🕳️  ANCORA SCOPERTA/E sotto il tetto dichiarato (${v.tetto}): ${dove} — il tetto scende e non risale, e una porta NUOVA fa rosso subito.`);
    }
    for (const m of v.motivi) console.log(`   ❌ [${m.tipo}] ${m.dove ? `${m.dove} — ` : ""}${m.motivo}`);
    console.log("");
  }
  for (const c of ciechi) console.log(`⚪ ${c.id} — non ho potuto misurare: ${c.motivo}`);

  if (uscita === CODICE.rosso) console.log(`\n❌ ${rossi.length} atto/i con una porta che nessuno guarda.`);
  else if (uscita === CODICE.cieco)
    console.log(
      `\n⚪ ${ciechi.length} controllo/i NON MISURATO/I. Cieco non è verde.${nienteGuardato ? " E qui le porte esaminate sono ZERO: un freno che non ha guardato niente non può dire «tutto a posto»." : ""}`,
    );
  else if (scoperteTotali || perSempreTotali) {
    // Il verde dice sempre QUANTO debito si sta portando dietro, e in due pezzi separati perché sono
    // due cose diverse: la scoperta è un debito che deve scendere, la spenta per sempre è una porta
    // che non passerà mai — e nasconderla dentro «tutto a posto» sarebbe la spunta verde sopra una
    // malattia viva.
    const pezzi = [];
    if (scoperteTotali) pezzi.push(`${scoperteTotali} ancora SCOPERTA/E sotto un tetto dichiarato che scende e non risale`);
    if (perSempreTotali) pezzi.push(`${perSempreTotali} spenta/e PER SEMPRE (esenzioni strutturali, sotto il loro tetto)`);
    console.log(
      `\n✅ ${porteEsaminate} porta/e esaminata/e, e ${pezzi.join(" · ")}. ` +
        `Verde per il cancello, non «tutto a posto»: il debito è quel numero, e una porta in più fa rosso subito.`,
    );
  } else console.log(`\n✅ ${porteEsaminate} porta/e esaminata/e: ognuna chiama la guardia o è dichiarata.`);
  process.exit(uscita);
}

// Importare questo file NON deve far partire niente: la prova importa le funzioni pure per eseguirle
// su ingressi finti, e senza questa guardia si ritroverebbe il rapporto del repo vero in mezzo ai
// propri casi. È un difetto già costato tre schede (AR-445, AR-680).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
