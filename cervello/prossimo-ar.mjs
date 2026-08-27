#!/usr/bin/env node
// 🔢 IL PROSSIMO NUMERO LIBERO — chiesto, non scelto.
//
// PERCHÉ ESISTE (Nicola, 4/8: «fai la numero 2»). In un giorno solo la stessa collisione è capitata
// TRE volte: io scrivo la scheda AR-518 alle 00:52, il worker ne scrive un'altra AR-518 alle 02:13 sul
// suo ramo, e quando i due rami si incontrano una delle due deve sparire. La prima volta sono sparite
// quattro schede del worker dentro la mia fusione — ripristinate solo perché sono andato a
// controllare. La seconda sarebbero sparite le mie.
//
// E non è nuovo: la skill del cantiere lo racconta già («due `AR-444` diversi, uno chiuso e uno no»).
// Era una REGOLA scritta in un documento, e le regole scritte si dimenticano quando due macchine
// lavorano insieme senza vedersi. Qui diventa un comando che non si può sbagliare.
//
// LA RADICE, detta per intero: il numero libero non si legge nella propria copia. La copia locale è
// ferma al momento in cui è partita, mentre `main` cammina. Chiedere «qual è l'ultimo?» al proprio
// cantiere è come guardare l'orologio fermo — dà sempre una risposta, ed è sempre plausibile.
//
// COSA FA. Legge il cantiere in TRE posti — quello locale, `origin/main`, e ogni ramo aperto che
// porta commit non ancora dentro main — e torna il primo numero libero in tutti e tre. Se una delle
// fonti non è raggiungibile lo DICHIARA e non inventa: un numero preso al buio è esattamente il
// difetto che questo file esiste per chiudere.
//
// La terza fonte è arrivata dopo, e per la ragione peggiore: mancava. Vedi `ramiRemoti` più sotto —
// due collisioni in un giorno solo, con due sessioni che lavoravano la stessa casa senza vedersi.
//
// Uso:
//   node cervello/prossimo-ar.mjs           # il prossimo libero
//   node cervello/prossimo-ar.mjs --quanti 5  # cinque numeri liberi di fila
//   node cervello/prossimo-ar.mjs --json
//   node cervello/prossimo-ar.mjs --controlla  # nessun id duplicato nel cantiere locale
//
// Uscita (contratto guardiani, AR-322): 0 = ho un numero · 1 = ci sono id duplicati (--controlla)
// · 2 = non ho potuto leggere una delle due fonti, quindi non rispondo.
//
// 🟢 Sola lettura: non scrive niente, non tocca git se non per leggere.

import { readFileSync } from "node:fs";
import { gitEsegui, gitLetto } from "./git-github.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
// La radice è sostituibile SOLO per poter provare questo file su un repo finto: un guardiano che
// non è mai stato visto fallire non si distingue da uno che non guarda. In esercizio resta la casa.
const REPO = process.env.PROSSIMO_AR_ROOT || dirname(QUI);
export const CANTIERE = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";

/** I numeri usati in un elenco di schede. Pura: la provano su dati finti, non sul cantiere vero. */
export function numeriUsati(difetti = []) {
  return difetti
    .map((d) => Number(String(d?.id || "").match(/^AR-(\d+)$/)?.[1]))
    .filter((n) => Number.isFinite(n));
}

/**
 * Il primo numero libero DOPO l'ultimo usato, in TUTTE le fonti.
 *
 * Perché dopo l'ultimo e non nel primo buco: i buchi nella numerazione sono cronologia, non spazio
 * libero. Provato subito: la prima stesura proponeva `AR-97`, e una scheda scritta oggi con quel
 * numero mentirebbe su QUANDO è nata — chi legge il cantiere fra un mese userebbe l'id per orientarsi
 * nel tempo, come si fa con tutti gli altri. Un identificatore che si riavvolge non identifica più.
 */
export function prossimiLiberi(fonti = [], quanti = 1) {
  const presi = new Set(fonti.flat());
  const fuori = [];
  let n = (presi.size ? Math.max(...presi) : 0) + 1;
  while (fuori.length < quanti) {
    if (!presi.has(n)) fuori.push(n);
    n++;
    if (n > 100000) break; // rete di sicurezza: non giro all'infinito
  }
  return fuori;
}

/**
 * LE FONTI da cui si sceglie il numero: la mia copia, main, e ogni ramo aperto che porta un cantiere.
 *
 * ⚠️ 27/8 · AR-853 — QUESTA FUNZIONE NON C'ERA, e la riga che monta l'elenco viveva dentro `main()`,
 * fra una lettura di disco e una chiamata a git. Cioè in un posto che nessuna prova poteva eseguire.
 * Il risultato: `prossimiLiberi` aveva cinque casi, e la decisione di COSA passargli non ne aveva
 * nessuno. Togliendo main e i rami dall'elenco — la mutazione registrata per AR-535, fatta girare
 * per la prima volta oggi — il test restava verde: le cinque prove parlano della funzione pura, e
 * quella continua a rispondere benissimo sulla fonte sola che le arriva.
 *
 * Non è un difetto teorico: è ESATTAMENTE quello che è successo. AR-835, AR-836 e AR-837 sono stati
 * allocati due volte, qui e su un'altra sessione, e la collisione l'ho pagata a mano nella fusione
 * di stamattina rinumerando tre schede e i loro richiami. La scheda che quel difetto lo chiude
 * (AR-535) risultava chiusa e provata: la difesa c'era nel codice, e non la guardava nessuno.
 *
 * La cura è quella di casa: la decisione esce in una funzione PURA che riceve da fuori la risposta
 * del mondo, così una prova può percorrere tutte le strade — anche quelle che l'ambiente di qui non
 * prende mai.
 *
 * @param {{locali?: object[], suMain?: object[], daRami?: number[][]}} mondo le tre risposte, da fuori
 * @returns {number[][]} le liste di numeri usati, una per fonte
 */
export function fontiDelNumero({ locali = [], suMain = [], daRami = [] } = {}) {
  // ⛔ UNA FONTE CHE NON È UN ELENCO FERMA TUTTO, e non diventa una lista vuota.
  //
  // Trovato con la lente della sicurezza sul perimetro, misurando invece di rileggere: `null` qui
  // dentro tirava un errore per caso — `numeriUsati` fa `.map` — mentre `undefined` diventava `[]`
  // in silenzio, per via del valore di scorta qui sopra. Le due strade sono la stessa domanda con
  // due risposte diverse, e la seconda è quella cattiva: una fonte sparita senza dirlo è ESATTAMENTE
  // il difetto che questa funzione esiste per chiudere, rifatto un piano più in basso.
  //
  // Il tono lo detta il file: qui si rifiuta invece di indovinare. «Non ho potuto leggere il
  // cantiere locale: non rispondo con un numero inventato» è la prima cosa che fa `main()`.
  for (const [nome, fonte] of [["locali", locali], ["suMain", suMain], ["daRami", daRami]]) {
    if (!Array.isArray(fonte)) {
      throw new TypeError(`la fonte «${nome}» non è un elenco (${fonte === null ? "null" : typeof fonte}): non scelgo un numero guardando meno fonti di quelle che dovrei`);
    }
  }
  return [numeriUsati(locali), numeriUsati(suMain), ...daRami];
}

/** Gli id che compaiono due volte: due schede diverse con lo stesso numero. */
export function duplicati(difetti = []) {
  const visti = new Map();
  for (const d of difetti) {
    const id = String(d?.id || "");
    if (!/^AR-\d+$/.test(id)) continue;
    visti.set(id, (visti.get(id) || 0) + 1);
  }
  return [...visti.entries()].filter(([, n]) => n > 1).map(([id, n]) => ({ id, quante: n }));
}

/**
 * Le schede che hanno PERSO il loro numero: stesso id qui e su main, ma sotto ci sono due difetti
 * diversi. (AR-538.)
 *
 * `duplicati()` guarda dentro una copia sola e vede due schede col medesimo numero. Questo guarda
 * fra due copie e vede la cosa peggiore: il numero è uno, la scheda è una, e alla fusione UNA DELLE
 * DUE STORIE SPARISCE senza lasciare traccia. Nessun conteggio cala — 532 schede prima, 532 dopo —
 * quindi non se ne accorge nessuno.
 *
 * Successo il 4/8 alle 05:30: su main AR-522 era «il perimetro del turno non esiste al primo giro»,
 * con il suo file, la sua prova e la sua mutazione. Poi main ha riscritto AR-522 come «uno spazio di
 * indentazione ha fermato la macchina per quattro giorni». Alla fusione la prima è sparita: il codice
 * `cervello/intento-turno.mjs` è ancora lì e ancora provato, ma la scheda che lo racconta non esiste
 * più. L'ha trovata il sorvegliante per caso, perché la mutazione puntava a un file che il registro
 * non nominava più.
 *
 * DUE campi diversi devono discordare, non uno: la data di nascita E il titolo. Un titolo affinato è
 * un lavoro normale, una data corretta pure; ma un difetto non cambia entrambe le cose restando lo
 * stesso difetto. Con un campo solo questo guardiano sarebbe rosso a ogni rilettura, e un rosso che
 * si accende sempre viene spento entro la settimana.
 */
export function sovrascritte(locali = [], suMain = []) {
  const laggiu = new Map();
  for (const d of suMain) if (/^AR-\d+$/.test(String(d?.id || ""))) laggiu.set(d.id, d);
  const perse = [];
  for (const mio of locali) {
    const loro = laggiu.get(mio?.id);
    if (!loro) continue;
    const natoDiverso = mio.nato && loro.nato && String(mio.nato) !== String(loro.nato);
    const titoloDiverso = mio.titolo && loro.titolo && String(mio.titolo) !== String(loro.titolo);
    if (natoDiverso && titoloDiverso) perse.push({ id: mio.id, qui: String(mio.titolo), suMain: String(loro.titolo) });
  }
  return perse;
}

/**
 * I rami remoti che possono già contenere schede appena scritte — ogni ramo tranne main.
 *
 * PERCHÉ (Nicola non l'ha chiesto: l'ho scontrato). Il 25/8 la stessa collisione è capitata DUE
 * volte in un giorno. La prima l'ho scoperta contando male una fusione: 536+1+1 doveva fare 538 e
 * faceva 537, e la scheda mancante era la mia AR-814, perché main ne aveva già una con quel numero.
 * La seconda l'ho evitata per fortuna, leggendo il lavoro di un'altra sessione PRIMA di scrivere:
 * teneva tre numeri su un ramo aperto, e io stavo per dare esattamente quei tre. (I numeri non li
 * scrivo qui apposta: sono schede di un altro lavoro, e citarle da qui le farebbe risultare mie.)
 *
 * LA RADICE, che è il punto: questo comando è nato per non leggere il numero libero nella propria
 * copia — e poi lo cercava in due posti soli, `main` e qui. Ma un numero preso da un'altra sessione
 * non è ancora su main: vive per ore su un ramo aperto, invisibile a entrambe le fonti. Cioè la
 * finestra in cui la collisione è POSSIBILE è esattamente la finestra che il comando non guardava.
 * L'orologio non era più fermo, ma continuava a mancare un fuso.
 */
export function ramiRemoti(repo = REPO) {
  // `--no-merged origin/main` non è un'ottimizzazione: è la definizione giusta dell'insieme. Un ramo
  // già dentro main non può nascondere un numero, perché i suoi numeri SONO quelli di main — e main
  // lo leggo comunque. Restano i rami che portano commit che main non ha: lì, e solo lì, può vivere
  // una scheda che nessuna delle altre due fonti conosce. (Detto in fretta: 528 rami → 207, e il
  // comando da 15 secondi torna a 2. Ma la ragione per cui è giusto viene prima del tempo.)
  // Passa dall'esecutore unico (`gitEsegui`): è la riga che porta il tetto sullo stdout, e un
  // `for-each-ref` su un repo con centinaia di rami è esattamente il caso in cui il tetto di 1 MB
  // che Node mette di suo si fa sentire. Ogni altra chiamata diretta a git è una porta laterale, e
  // qui la porta laterale l'avevo appena aperta io: me l'ha contata `spazzata-fratelli`.
  const out = gitEsegui(
    ["for-each-ref", "--format=%(refname)", "--no-merged", "origin/main", "refs/remotes/origin"],
    repo,
  );
  return out
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .filter((r) => !/\/(HEAD|main)$/.test(r));
}

/**
 * Il cantiere su un ramo, distinguendo i due «non c'è» che NON sono la stessa cosa:
 *  - il ramo non ha quel file (vecchio, o di un altro mestiere) → `null`, non c'è niente da confrontare;
 *  - il file c'è e non si legge → si propaga, perché lì sto diventando cieco senza accorgermene.
 */
export function cantiereDiRamo(rif, repo = REPO) {
  // `gitLetto` torna null quando git fallisce — cioè quando quel ramo non porta il file, e allora
  // non c'è nessun numero che possa scontrarsi col mio. Il JSON rotto invece esce da JSON.parse e
  // si propaga: è lì che diventerei cieco senza accorgermene.
  const grezzo = gitLetto(["show", `${rif}:${CANTIERE}`], repo);
  if (grezzo === null) return null;
  return JSON.parse(grezzo).difetti || [];
}

function daGit(rif) {
  // Anche questa era una porta laterale, ereditata e dentro il tetto di partenza. Curarla mentre ero
  // già qui fa SCENDERE il numero invece di lasciarlo fermo, ed è l'unico verso in cui può muoversi.
  return JSON.parse(gitEsegui(["show", `${rif}:${CANTIERE}`], REPO)).difetti || [];
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const i = argv.indexOf("--quanti");
  const quanti = i !== -1 ? Math.max(1, Number(argv[i + 1]) || 1) : 1;

  let locali;
  try {
    locali = JSON.parse(readFileSync(join(REPO, CANTIERE), "utf8")).difetti || [];
  } catch (e) {
    console.error(`⚪ non ho potuto leggere il cantiere locale (${e.message.split("\n")[0]}): non rispondo con un numero inventato.`);
    process.exit(2);
  }

  // La fonte che conta è main: la copia locale è ferma a quando è partita. Serve anche a
  // `--controlla`, perché la sovrascrittura di una scheda si vede SOLO confrontando le due copie.
  let suMain = null;
  const basi = ["origin/main", "main"];
  for (const b of basi) {
    try {
      suMain = daGit(b);
      break;
    } catch {
      // provo la base successiva
    }
  }
  if (suMain === null) {
    console.error(`⚪ non ho potuto leggere il cantiere su ${basi.join(" né su ")}: senza quella fonte il numero sarebbe scelto al buio, ed è esattamente il difetto che questo comando chiude. Rimedio: git fetch origin main.`);
    process.exit(2);
  }

  if (argv.includes("--controlla")) {
    const dup = duplicati(locali);
    const perse = sovrascritte(locali, suMain);
    if (!dup.length && !perse.length) {
      if (!json) console.log(`✅ nessun numero usato due volte, nessuna scheda sovrascritta (${locali.length} qui, ${suMain.length} su main).`);
      process.exit(0);
    }
    if (dup.length) {
      console.error(`❌ ${dup.length} numero/i usato/i da due schede diverse: ${dup.map((d) => `${d.id} ×${d.quante}`).join(", ")}`);
      console.error(`   Due schede con lo stesso numero non sono un fastidio: alla prima unione una delle due sparisce.`);
    }
    for (const p of perse) {
      console.error(`❌ ${p.id} racconta due difetti diversi qui e su main — una delle due storie sparisce alla fusione, e il conteggio non cala:`);
      console.error(`     qui:     ${p.qui.slice(0, 110)}`);
      console.error(`     su main: ${p.suMain.slice(0, 110)}`);
      console.error(`   Rimedio: dai un numero nuovo a quella che l'ha perso (node cervello/prossimo-ar.mjs) e rimettila nel cantiere.`);
    }
    process.exit(1);
  }

  // I rami aperti sono la terza fonte, e sono la sola in cui la collisione è ancora EVITABILE:
  // quando il numero è arrivato su main lo scontro è già successo. Qui la severità è voluta —
  // rifiutarsi di rispondere costa un `git fetch`, un numero sbagliato costa una scheda persa.
  let rami;
  try {
    rami = ramiRemoti();
  } catch (e) {
    console.error(`⚪ non ho potuto elencare i rami aperti (${e.message.split("\n")[0]}): un altro lavoro potrebbe avere già preso questo numero e io non lo saprei. Non rispondo. Rimedio: git fetch origin.`);
    process.exit(2);
  }
  const daRami = [];
  const nonLetti = [];
  for (const r of rami) {
    try {
      const d = cantiereDiRamo(r);
      if (d) daRami.push(numeriUsati(d));
    } catch (e) {
      nonLetti.push(`${r.replace("refs/remotes/", "")} (${e.message.split("\n")[0]})`);
    }
  }
  if (nonLetti.length) {
    console.error(`⚪ ${nonLetti.length} ramo/i porta/no il cantiere ma non l'ho saputo leggere: ${nonLetti.join(", ")}`);
    console.error(`   Un numero dato senza averli letti è un numero preso al buio, ed è il difetto che questo comando esiste per chiudere.`);
    process.exit(2);
  }

  const liberi = prossimiLiberi(fontiDelNumero({ locali, suMain, daRami }), quanti);
  const id = liberi.map((n) => `AR-${n}`);
  if (json) {
    console.log(JSON.stringify({ id, locali: locali.length, suMain: suMain.length, rami: daRami.length }, null, 2));
    process.exit(0);
  }
  console.log(id.join(" "));
  console.error(`   (libero qui — ${locali.length} schede — su main — ${suMain.length} — e su ${daRami.length} ramo/i aperto/i con un cantiere)`);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
