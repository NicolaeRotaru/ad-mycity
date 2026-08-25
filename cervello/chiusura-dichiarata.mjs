/**
 * AR-444 — La volontà dichiarata di chi ha lavorato un difetto batte la prova sulla scheda.
 *
 * Il caso che ha rotto (29/7, lotto 35): AR-396 era dichiarato APERTO in tre punti — corpo della
 * PR #621, messaggio di commit, `nota_fix` — perché la sua prova non discriminava. Sulla scheda era
 * però rimasta la vecchia prova a PATTERN scritta dalla radiografia. Il lotto aveva riparato il
 * codice, quindi al primo `auto-fix --applica` quel pattern si è trovato e la scheda si è chiusa da
 * sola, smentendo la firma di Nicola. Il conteggio diceva «✅ Chiusi 20» ed era verde: uno dei venti
 * non doveva esserci.
 *
 * Causa di sistema: la decisione di chiusura guardava SOLO la prova presente sulla scheda. Una
 * dichiarazione umana non aveva alcuna forma leggibile dalla macchina — viveva in prosa dentro
 * `nota_fix`, dove nessun controllo la cerca.
 *
 * PERCHÉ NON HO FATTO CIÒ CHE LA SCHEDA PROPONEVA. Il `fix_proposto` di AR-444 (scritto da me quella
 * notte) chiedeva anche che una prova in forma {file, pattern, presente} non potesse PIÙ chiudere
 * un difetto. Misurato il 30/7: 127 dei 151 difetti aperti hanno esattamente quella forma. Vietarle
 * di chiudere congelerebbe l'84% del cantiere — e un cancello sempre rosso viene aggirato al secondo
 * giro, che è la malattia che stiamo curando, non la cura. Quindi: la forma debole continua a poter
 * chiudere, ma (a) perde SEMPRE contro una dichiarazione umana, (b) marca la chiusura come debole
 * così è ritrovabile e rileggibile, (c) il suo numero sta sotto un tetto che scende e non risale.
 *
 * Funzioni pure, nessun I/O: il punto malato (`auto-fix.mjs`) le chiama.
 */

// 🚧 «Quali schede sono ancora lavoro» non si decide qui: la casa è cervello/stati-cantiere.mjs.
// Il conto del debito partiva da `stato === "aperto"` e saltava il terzo stato (AR-719).
import { eDaFare } from "./stati-cantiere.mjs";
// 🛑 IL CANCELLO CHE DECIDE SE UNA PROVA PUÒ CHIUDERE (AR-796). Stava in `prova-ammissibile.mjs`
// e lo consultava solo il REFERTO — `cantiere-prove.mjs`, che guarda e racconta. Chi CHIUDE
// davvero è `auto-fix.mjs`, e non passava di lì: zero occorrenze, verificato col grep il 23/8.
// Due cancelli costruiti bene, montati sulla porta che non si apre. Adesso il freno sta sulla
// strada dell\'atto, cioè dentro il verdetto che il chiuditore già chiamava.
import { ammissibilitaProva } from "./prova-ammissibile.mjs";

/** Le forme di prova che una scheda può portare. La forte è una sola: un comando che si esegue. */
export function formaProva(verifica) {
  if (!verifica) return "nessuna";
  if (verifica.comando) return "comando";
  if (verifica.file && verifica.pattern) return "pattern";
  return "altro";
}

/** Una prova è DEBOLE quando non esegue niente: cerca del testo e ne deduce un verdetto. */
export function provaDebole(verifica) {
  return formaProva(verifica) === "pattern";
}

/**
 * La dichiarazione umana. Un difetto con `chiusura: "bloccata"` non si chiude MAI da solo,
 * qualunque cosa dica la sua prova: qualcuno ha guardato quel difetto e ha deciso che resta aperto.
 * Si sblocca solo togliendo il campo a mano — cioè con un'altra decisione umana.
 *
 * Il motivo è obbligatorio: un blocco senza motivo è un silenzio, ed è la cosa che stiamo curando.
 */
export function chiusuraBloccata(dif) {
  const c = dif && dif.chiusura;
  if (c !== "bloccata") return { bloccata: false };
  const motivo = (dif.chiusura_motivo || "").trim();
  if (!motivo) {
    return {
      bloccata: true,
      motivo: "chiusura bloccata SENZA motivo scritto: vale lo stesso (la dichiarazione batte la prova), ma va motivata",
      motivo_mancante: true,
    };
  }
  return { bloccata: true, motivo };
}

/**
 * Il verdetto finale su UNA scheda, dato l'esito grezzo della sua prova.
 * `esitoProva` è ciò che ha stabilito la prova: "risolto" | "aperto" | "manuale".
 * Torna sempre {chiude, debole, motivo} — mai un booleano nudo, così chi stampa non può
 * perdere per strada il fatto che quella chiusura era debole.
 *
 * ── AR-796 · IL FRENO NON ERA SULLA STRADA ────────────────────────────────────────────────
 * I due cancelli di `prova-ammissibile.mjs` (prova orfana · prova debole su difetto pesante)
 * esistevano da due lotti e nessuno che CHIUDE li chiamava. `auto-fix.mjs` chiamava già questa
 * funzione, ma ne usava solo `bloccata` e `debole`: il campo `chiude` veniva calcolato e buttato
 * via, e la decisione la rifaceva a mano con `r.esito === "risolto" && g.ammessa`. Un verdetto
 * che il chiamante ricalcola è un verdetto che non decide niente.
 *
 * Adesso il cancello sta QUI, cioè sull\'unica strada che porta all\'atto, e `chiude` è la
 * risposta — non un parere accanto alla risposta.
 *
 * COSA COSTA, misurato il 23/8/2026 sul cantiere vero (108 schede da fare): 19 sono pesanti con
 * una prova che non esegue niente, quindi da oggi non si chiudono più da sole. Di quelle 19,
 * **zero** avevano la prova soddisfatta in questo momento: accendere il freno oggi non toglie
 * nessuna chiusura. La scheda temeva «bloccarle tutte insieme e farsi aggirare al secondo giro»
 * — il conto dice che il giorno per accenderlo è oggi, perché non blocca niente e da domani
 * nessuna delle 19 può chiudersi su una parola trovata in un file. Il loro numero lo tiene già
 * `tetti-lotto.json` (`prova_debole`), sotto un tetto che scende: non serve un secondo registro.
 *
 * `fileEsiste` è l\'unica domanda al disco, iniettata perché questo file resta puro. Il default
 * dice «il file c\'è»: un default che INVENTA una prova orfana sarebbe peggio di uno che se ne
 * lascia sfuggire una — chi non inietta il mondo perde il cancello (b), non ne guadagna uno finto.
 *
 * @param {object} dif la scheda del cantiere
 * @param {string} esitoProva "risolto" | "aperto" | "manuale"
 * @param {{fileEsiste?: (percorso: string) => boolean}} mondo
 */
export function verdettoChiusura(dif, esitoProva, { fileEsiste = () => true } = {}) {
  const b = chiusuraBloccata(dif);
  if (b.bloccata) {
    return { chiude: false, debole: false, bloccata: true, inammissibile: false, marca: null, motivo: `dichiarato aperto da un umano — ${b.motivo}` };
  }
  if (esitoProva !== "risolto") {
    return { chiude: false, debole: false, bloccata: false, inammissibile: false, marca: null, motivo: `la prova non dice risolto (${esitoProva})` };
  }
  // ⛔ IL FRENO. Sta dopo la dichiarazione umana (che batte tutto) e prima della chiusura: una
  // prova soddisfatta ma non ammessa NON chiude, e il motivo che esce è lo stesso che il referto
  // stampa già — così chi legge il rifiuto e chi legge il conto leggono la stessa frase.
  const amm = ammissibilitaProva(dif, { fileEsiste });
  if (!amm.ammessa) {
    return {
      chiude: false,
      debole: provaDebole(dif.verifica),
      bloccata: false,
      inammissibile: true,
      marca: amm.marca,
      motivo: `la prova risulta soddisfatta ma non è ammessa a chiudere — ${amm.motivo}`,
    };
  }
  const debole = provaDebole(dif.verifica);
  return {
    chiude: true,
    debole,
    bloccata: false,
    inammissibile: false,
    // ⚪ La marca del terzo esito viaggia anche sulle chiusure che PASSANO (AR-789/790): una scheda
    // coi campi non dichiarati resta chiudibile, ma chi la chiude deve sapere che nessun cancello
    // ha potuto giudicarla. Un verde che non copre una parte non è un verde su quella parte.
    marca: amm.marca,
    motivo: debole
      ? "chiusa da una prova a PATTERN: un pattern non frena, non legge, non decide — da rileggere"
      : "chiusa da una prova che si esegue",
  };
}

/**
 * IL DEBITO DELLE PROVE DEBOLI — quante schede DA FARE portano ancora la forma a pattern.
 *
 * AR-719 — qui partiva da `d.stato === "aperto"`, cioè da uno dei tre stati vivi. Le schede
 * `da-riverificare` non erano né fra le aperte né fra le deboli: **il tetto poteva scendere solo
 * perché una scheda cambiava etichetta**, cioè il debito migliorava da solo. È il modo in cui un
 * debito si nasconde invece di calare, ed è il peggiore perché il numero sembra un progresso.
 *
 * La base adesso è «tutto ciò che non è chiuso», chiesta alla casa unica degli stati. Misurato il
 * 15/8/2026: 38 deboli su 184 aperte, 38 su 240 da fare — le 56 `da-riverificare` oggi non ne
 * portano nessuna, quindi il tetto non si muove. La scheda diceva il contrario («le 56 con la prova
 * debole stanno fuori dal tetto»): il buco era vero, il numero no. Vale la pena lo stesso — il
 * meccanismo per sbagliare c'era, e sarebbe scattato alla prima scheda riverificata con un grep.
 *
 * `aperti` resta nel risultato col vecchio nome perché `cancello-lotto.mjs` lo stampa, ma adesso
 * vale «da fare»: gli si affianca `da_fare`, che è come si chiama davvero.
 */
export function contaProveDeboli(difetti) {
  const daFare = (difetti || []).filter(Boolean).filter(eDaFare);
  const deboli = daFare.filter((d) => provaDebole(d.verifica));
  return { aperti: daFare.length, da_fare: daFare.length, deboli: deboli.length, ids: deboli.map((d) => d.id) };
}

/**
 * Il tetto discendente. Torna un verdetto a tre esiti come i guardiani: 0 misurato, 1 violazione.
 * Non si alza mai: se oggi ce ne sono meno di ieri, il tetto nuovo è oggi.
 */
export function verdettoTetto(conteggio, tetto) {
  if (typeof tetto !== "number") {
    return { codice: 2, motivo: "tetto non dichiarato: non ho potuto misurare", tettoNuovo: null };
  }
  if (conteggio > tetto) {
    return { codice: 1, motivo: `prove deboli CRESCIUTE: ${conteggio} contro un tetto di ${tetto}`, tettoNuovo: null };
  }
  return {
    codice: 0,
    motivo: conteggio < tetto ? `prove deboli scese: ${conteggio} (era ${tetto})` : `prove deboli stabili a ${conteggio}`,
    tettoNuovo: conteggio < tetto ? conteggio : tetto,
  };
}
