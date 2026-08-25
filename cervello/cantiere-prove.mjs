#!/usr/bin/env node
// 🔎 GUARDIANO DELLE PROVE DEL CANTIERE — smaschera i difetti che NON possono chiudersi da soli.
// 🟢 Sola lettura (cantiere + codice); scrive solo il proprio report (auto-coscienza/cantiere-prove.json).
//
// Problema (trovato il 2026-07-25): il fix del freno budget-token è stato mergiato (PR #519,
// cervello/costo-ai.mjs) e PROVATO funzionante, ma il cantiere continuava a contarlo come bloccante
// aperto. La riconciliazione automatica (auto-fix.mjs verifica --applica) era girata pochi minuti dopo
// il merge e non se n'era accorta. Due cause distinte, entrambe invisibili:
//   ① AR-144 ha verifica {tipo:"umano"} → nessuna prova automatica: non è chiudibile da un guardiano,
//      MAI, qualunque fix arrivi. Resta aperto in eterno finché un umano non se ne ricorda.
//   ② AR-117 ha una prova automatica che punta al file SBAGLIATO (cerca token_stimati in giro.sh,
//      mentre il fix è atterrato in costo-ai.mjs) → il verificatore guarda nel posto sbagliato.
//
// Il guaio non è il singolo difetto: è che "pattern assente" e "puntatore rotto" sono INDISTINGUIBILI
// per auto-fix.mjs — entrambi si leggono come "fix non fatto". Così un lavoro davvero consegnato
// sparisce dai numeri, la macchina si dichiara peggio di com'è, e la pagella dell'intelligenza
// (che legge proprio il conteggio dei bloccanti) misura una realtà vecchia.
//
// Questo guardiano classifica la PROVA di ogni difetto non chiuso e fallisce quando un BLOCCANTE
// non è verificabile: un numero che nessuno può abbassare non è un difetto, è un debito silenzioso.
//
// Classi di prova:
//   auto-ok       → file+pattern combaciano ORA: auto-fix lo chiuderà al prossimo giro
//   auto-attesa   → file+pattern non combaciano ma il difetto è giovane: normale, il fix non c'è ancora
//   auto-sospetta → non combaciano e il difetto è vecchio (> GIORNI_SOSPETTO): il puntatore potrebbe
//                   essere sbagliato, o il fix è atterrato altrove (il caso AR-117)
//   umana         → nessuna prova automatica: non auto-chiudibile per costruzione (il caso AR-144)
//
// Uso:
//   node cervello/cantiere-prove.mjs            -> report + scrive cantiere-prove.json
//   node cervello/cantiere-prove.mjs --dry      -> report, NON scrive
//   node cervello/cantiere-prove.mjs --json     -> output JSON
//   node cervello/cantiere-prove.mjs --gate     -> exit 1 se un BLOCCANTE non è verificabile
//
// Env: CANTIERE_PROVE_GIORNI (default 3) = da quanti giorni una prova non soddisfatta diventa sospetta.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { formaProva } from "./chiusura-dichiarata.mjs";
import { MOTIVO_COMANDO_NON_AMMESSO } from "./forma-prova.mjs";
import { fileDelComando } from "./cancello-lotto.mjs";
// 🚦 Il verdetto su una fonte che non si è lasciata leggere: la regola sta nel modulo puro, qui si
// fa solo l'I/O e le si raccontano i fatti (AR-709).
import { codiceDiUscita, esitoDellaFonte } from "./esito-guardiano.mjs";
// 📇 IL CONTRATTO DELLA SCHEDA, in un posto solo (contratto-scheda.mjs). Prima ogni script se lo
// rileggeva a modo suo: è per questo che i nomi dei campi divergevano e il registro non sapeva
// leggere sé stesso. Qui si LEGGE il contratto, non lo si riscrive.
// 📏 E il contratto della PROVA (contratto-prova.mjs): «questa prova vale?» ha una risposta sola,
// e non la riscrive ogni file che se la chiede — è la malattia della corsia C del lotto 42. Da
// AR-354 questo file non lo interroga più a mano: la domanda passa da `prova-ammissibile.mjs`, che
// la fa una volta per tutt'e due i cancelli. Due chiamanti indipendenti dello stesso contratto sono
// già mezza divergenza.
import { provaSoddisfatta } from "./prove-regole.mjs";
// 🚦 AR-354 — I DUE CANCELLI SULLA PROVA vivono in un modulo puro, non in mezzo a questo programma.
// La ragione è la malattia stessa: una regola scritta dentro uno script si può solo GUARDARE, e per
// provarla bisognerebbe far girare il guardiano intero sul cantiere vero. Là un test la ESEGUE.
import {
  MARCA_DEBOLE_SU_GRAVE,
  MARCA_IMPOSSIBILE,
  ammissibilitaProva,
  bilancioDelReferto,
  provaCheEsegue,
  provaComportamentaleObbligatoria,
} from "./prova-ammissibile.mjs";
// 🚧 AR-684 — «quante schede ci sono» ha UNA casa (stati-cantiere.mjs). Qui c'era un filtro scritto
// a mano, `d.stato !== "chiuso"`, ed è il modo esatto in cui il terzo stato spariva dai totali.
import { contaDifetti, eDaFare } from "./stati-cantiere.mjs";
import {
  NON_MISURABILE,
  aliasFuoriContratto,
  gravitaDi,
  proveNonMisurabili,
  schedeIncomplete,
  schedeSenzaProva,
  timbriStorti,
  verdettoProva,
  schedeNonGiudicabili,
} from "./contratto-scheda.mjs";

// I chiamanti storici (e i loro test) importavano queste due da qui: continuano a funzionare, ma
// la definizione è UNA e sta nel contratto. Riesportare è il modo di spostare una regola senza
// rompere chi la usava — l'alternativa, lasciarne una copia qui, è la malattia stessa.
export { gravitaDi, schedeIncomplete };

// ⚠️ Un modulo che ESEGUE il suo CLI al solo essere importato non e' testabile: chi lo importa per
// provarne una funzione si ritrova il guardiano intero girato e un file di memoria riscritto sotto i
// piedi. Successo due volte in due giorni — sonda-volano.mjs (lotto 35) e questo — quindi non e' un
// inciampo, e' una forma. Da qui in giu' gli effetti stanno dietro questa guardia.
const E_CLI = import.meta.url === pathToFileURL(process.argv[1] || "").href;

const DRY = process.argv.includes("--dry");
const JSON_MODE = process.argv.includes("--json");
const GATE = process.argv.includes("--gate");
const GATE_CAMPI = process.argv.includes("--gate-campi");
const GATE_PROVE = process.argv.includes("--gate-prove");
const GIORNI_SOSPETTO = Number(process.env.CANTIERE_PROVE_GIORNI || 3);

const AC = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
// AR-799 — stessa chiave del resto della casa (`CANTIERE_FILE`, come salute-onesta.mjs e
// auto-fix.mjs). Uno strumento deviabile a metà non è deviabile.
const CANTIERE_PATH = process.env.CANTIERE_FILE || join(AC, "cantiere-difetti.json");
// AR-799 — questo strumento scrive in un registro solo, e anche quello va deviabile: la prova del
// conto deve poter leggere un referto suo invece di quello vero. È la seconda metà della lezione del
// 23/8 — una maniglia che apre metà porta fa credere di essere al riparo, e il primo a caderci sono
// stato io (quattro punti finti nella storia della salute, trovati da un'altra prova).
const OUT_PATH = process.env.CANTIERE_PROVE_REPORT || join(AC, "cantiere-prove.json");

/**
 * La lettura di un JSON che dice anche PERCHÉ non ha letto — AR-709.
 *
 * Qui c'era un `readJson` che tornava `null` per tre motivi diversi (il file non c'è · il JSON è
 * rotto · l'ho letto ed era davvero null) e chi lo chiamava concludeva «uscita 1», cioè «ho
 * misurato e ho trovato dei guai». Non era vero: non si era misurato niente, ed è un 2. Un cantiere
 * pieno di difetti e un cantiere che non si lascia aprire arrivavano a giro.sh, al cancello e alla
 * CI con la stessa faccia.
 *
 * Il vecchio lettore è stato tolto, non affiancato: lasciarne due è come questa malattia si
 * riproduce — la strada comoda resta lì e il prossimo la prende.
 *
 * La regola che decide sta in `esitoDellaFonte` (modulo puro): qui si fa solo l'I/O e le si
 * raccontano i fatti.
 */
function leggiJson(path, { cosa, forma = () => true, formaAttesa = "" } = {}) {
  const nome = cosa || path.replace(`${AD_ROOT}/`, "");
  if (!existsSync(path)) return { valore: null, esito: esitoDellaFonte({ trovata: false }, { cosa: nome }) };
  let valore;
  try {
    valore = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    return { valore: null, esito: esitoDellaFonte({ errore: e }, { cosa: nome }) };
  }
  return { valore, esito: esitoDellaFonte({ formaValida: forma(valore) === true, formaAttesa }, { cosa: nome }) };
}

/** Giorni interi trascorsi da una data "AAAA-MM-GG [HH:MM]". null se illeggibile. */
function giorniDa(s) {
  const m = typeof s === "string" ? s.match(/(\d{4})-(\d{2})-(\d{2})/) : null;
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const oggi = nowPiacenza().match(/(\d{4})-(\d{2})-(\d{2})/);
  const base = oggi ? new Date(`${oggi[1]}-${oggi[2]}-${oggi[3]}T00:00:00`) : new Date();
  return Math.max(0, Math.round((base - d) / 86400000));
}

/**
 * La stessa lettura che fa auto-fix.mjs, ma senza chiudere nulla: serve solo a sapere
 * se la prova COMBACIA oggi. presente:false = il difetto è risolto quando il pattern è ASSENTE.
 */
function provaCombacia(v) {
  const vuolePresente = v.presente !== false;
  const abs = join(AD_ROOT, v.file);
  if (!existsSync(abs)) {
    // File assente: se il fix consiste nel CREARE il file, "assente" significa fix non ancora fatto.
    // Non è un puntatore rotto — è un fix legittimamente in attesa (es. AR-112 middleware.ts).
    return { combacia: !vuolePresente, fileAssente: true };
  }
  let testo = "";
  try {
    testo = readFileSync(abs, "utf8");
  } catch {
    return { combacia: false, fileAssente: false, illeggibile: true };
  }
  // AR-743 — IL CONFRONTO LO DECIDE LA CASA, non questo file.
  //
  // Qui c'era una copia a mano di «la prova combacia?». Erano quattro copie della stessa
  // decisione — la casa più tre — e le tre non ereditavano niente di quello che la casa aveva
  // imparato:
  //
  //   · AR-151, il testo letterale: un pattern scritto come testo, con un dollaro in mezzo,
  //     compilato come regex non può mai combaciare (quel simbolo asserisce fine-stringa) mentre
  //     il fix nel codice c'è davvero. La casa prova la regex E il letterale.
  //   · AR-355, il commento: due difetti del worker risultavano chiusi perché la prova citava una
  //     frase che nel file esisteva — dentro un commento scritto da chi aveva fatto il fix. C'era
  //     la descrizione della cura, non la cura. La casa cerca solo dove il computer esegue.
  //
  // Ogni difesa aggiunta là proteggeva la metà dei chiamanti. È la malattia censita «una parola
  // con due padroni», dentro il metro che giudica tutte le altre.
  return { combacia: provaSoddisfatta(v, testo), fileAssente: false };
}

/**
 * AR-650 — i BLOCCANTI che nessun guardiano potrà mai chiudere.
 *
 * Era una riga in mezzo al programma (`voci.filter(v => v.gravita === "bloccante" && …)`), quindi
 * nessun test poteva eseguirla senza far girare tutto lo script sul cantiere vero. Ed era cieca: le
 * schede della generazione nuova portano `severita`, non `gravita`, così un bloccante senza prova
 * non entrava nel conto — e il gate diceva «✅ ogni bloccante ha una prova» mentre AR-592 stava lì.
 *
 * Il conto è la cosa che deve scendere: se guarda il campo sbagliato non dice «non lo so», dice
 * «va tutto bene». Pura: riceve le voci già classificate.
 */
export function bloccantiCiechi(voci = []) {
  return voci.filter((v) => gravitaDi(v) === "bloccante" && !v.auto_chiudibile);
}

export function classifica(d) {
  const v = d.verifica;
  const eta = giorniDa(d.nato);
  // AR-650 — la gravità si legge dalla porta unica, non dal primo nome che le è stato dato.
  // `classifica` era l'ultimo lettore rimasto a guardare solo `d.gravita`: le 48 schede nate dalla
  // radiografia del 13/8 usano `severita`, quindi per lui erano tutte senza gravità — e il conto dei
  // BLOCCANTI ciechi (che legge `v.gravita`) ne saltava uno vero, AR-592. Un guardiano che conta zero
  // perché guarda il campo sbagliato non dice «non lo so»: dice «va tutto bene».
  // ⚠️ LA PRIMA RIGA NON SI RIFORMATTA: la mutazione di AR-650 (`mutanti.json`, lotto 38) cerca
  // esattamente `const base = { id: d.id, gravita: gravitaDi(d), eta_giorni: eta,` per rimettere
  // il difetto e vedere se il test diventa rosso. Spezzarla in tre righe la rende cieca — e una
  // mutazione cieca non dice «verde», dice «non ho potuto misurare», che qui vale come rosso.
  const base = { id: d.id, gravita: gravitaDi(d), eta_giorni: eta,
    impatto_crescita: d.impatto_crescita ?? null,
    // AR-354 — le due colonne che mancavano: la sua prova ESEGUE qualcosa, e questo difetto ne
    // pretende una? Senza, «prova debole» e «prova che gira» arrivavano a chi legge uguali.
    prova_esegue: provaCheEsegue(v),
    prova_obbligatoria: provaComportamentaleObbligatoria(d).obbligatoria,
    // AR-789/790 — la terza colonna, che è quella che mancava: la scheda si può GIUDICARE?
    // `prova_obbligatoria: false` da solo non distingue «non le serve una prova che esegue» da
    // «i campi su cui lo deciderei non sono leggibili». Erano 40 schede vive su 109 a cadere nel
    // secondo caso travestite da primo.
    non_giudicabile: provaComportamentaleObbligatoria(d).indecidibile === true,
    titolo: (d.titolo || "").slice(0, 110) };

  // ── AR-354 — I DUE CANCELLI, PRIMA DI OGNI ALTRA COSA ────────────────────────────────────
  //
  // Stanno in cima apposta, e non dentro il ramo del pattern dove il caso si vede meglio: qui sotto
  // ci sono cinque strade che tornano `auto_chiudibile: true`, e una regola messa su una sola le
  // lascia aperte tutte le altre. È la lezione già pagata (AR-172): la porta a mano riparata e
  // quella automatica lasciata aperta. Il freno sta sul DATO — la scheda — non sul ramo comodo.
  //
  //   (b) prova che poggia su un file inesistente → `prova_impossibile`, difetto SENZA controllo;
  //   (a) bloccante o impatto ALTO con una prova che non esegue niente → non chiudibile.
  //
  // QUESTO GUARDIANO NON CHIUDE NIENTE: chi chiude è `auto-fix.mjs`. Da AR-796 (23/8/2026) ci passa
  // però davvero — `verdettoChiusura` consulta `ammissibilitaProva`, quindi una prova che qui esce
  // non ammessa là non chiude. Fino a quel giorno il referto era un consiglio: contava le schede in
  // `chiuderebbe_lo_stesso` e poi auto-fix le chiudeva lo stesso. Il campo resta perché la domanda
  // resta buona («quante passerebbero se il freno saltasse?»), ma oggi la risposta è zero e se
  // tornasse a essere diversa da zero vorrebbe dire che il freno si è smontato.
  const amm = ammissibilitaProva(d, { fileEsiste: (f) => existsSync(join(AD_ROOT, f)) });
  if (!amm.ammessa) {
    return {
      ...base,
      classe: amm.classe,
      // Le due marche che la scheda AR-354 chiede per nome, scritte per esteso e non come chiave
      // calcolata: chi cerca `prova_impossibile` nel referto deve poterla trovare anche leggendo
      // questo file, non solo eseguendolo.
      prova_impossibile: amm.marca === MARCA_IMPOSSIBILE,
      prova_debole_su_grave: amm.marca === MARCA_DEBOLE_SU_GRAVE,
      senza_controllo: amm.senza_controllo,
      perche: amm.motivo,
      auto_chiudibile: false,
    };
  }

  // AR-344 — la forma di una prova la legge UN solo modulo (chiusura-dichiarata.mjs), non due lettori
  // indipendenti. Prima qui c'era `if (!v || !v.file || !v.pattern)`: tutto ciò che non fosse
  // file+pattern cadeva in «umana». Quando lo standard è passato a {comando}, chi CHIUDE ha imparato
  // la forma nuova e chi CLASSIFICA no — così ogni prova migrata alla forma MIGLIORE si contava come
  // «nessun guardiano potrà mai chiuderlo». Effetto perverso: più si riparava secondo lo standard,
  // più la macchina dichiarava di non potersi chiudere da sola. La cura non è insegnare la forma
  // anche al secondo lettore: è che il lettore sia uno solo.
  const forma = formaProva(v);
  if (forma === "comando") {
    // AR-559 — il verdetto sulla forma del comando lo emette il CONTRATTO, e a tre esiti: qui
    // «non ammesso» non è più un rosso qualunque, è `codice 2 = NON HO POTUTO MISURARE`. La
    // differenza non è di parole: 53 schede si sono chiuse perché «il motore non sa eseguirlo» e
    // «nessuno deve mai chiuderlo a macchina» finivano nello stesso cassetto, marcati «manuale».
    // (La copia locale del giudizio — `if (!comandoAmmesso(v.comando))` — è sparita apposta: era
    // il terzo lettore indipendente della stessa regola, cioè la malattia di AR-344 al terzo giro.)
    const vp = verdettoProva(v);
    if (vp.codice === NON_MISURABILE) {
      return {
        ...base,
        classe: "auto-sospetta",
        codice: NON_MISURABILE,
        perche: `comando di prova non ammesso: ${v.comando} — ${MOTIVO_COMANDO_NON_AMMESSO}`,
        auto_chiudibile: false,
      };
    }
    // Un comando che punta a un file inesistente non è una prova: è «non fatto» travestito da
    // «puntatore rotto», e i due si distinguono solo guardando.
    const file = fileDelComando(v.comando);
    if (file && !existsSync(join(AD_ROOT, file))) {
      return {
        ...base,
        classe: "auto-sospetta",
        perche: `la prova punta a un file che non esiste: ${file}`,
        auto_chiudibile: false,
      };
    }
    return { ...base, classe: "auto-comando", perche: `prova eseguibile: ${v.comando}`, auto_chiudibile: true };
  }
  if (forma !== "pattern") {
    return {
      ...base,
      classe: "umana",
      perche: "nessuna prova automatica (verifica umana): nessun guardiano potrà mai chiuderlo",
      auto_chiudibile: false,
    };
  }

  const r = provaCombacia(v);
  const dove = `${v.file} ~ /${v.pattern}/`;

  if (r.patternRotto) {
    return { ...base, classe: "auto-sospetta", perche: `regex non valida in verifica: ${dove}`, auto_chiudibile: false };
  }
  if (r.illeggibile) {
    return { ...base, classe: "auto-sospetta", perche: `file illeggibile: ${v.file}`, auto_chiudibile: false };
  }
  // AR-686 — IL PUNTATORE ROTTO VIENE PRIMA DEL «COMBACIA», e l'ordine è tutto il difetto.
  //
  // Con `presente:false` una prova su un file INESISTENTE «combacia» sempre: il pattern non c'è
  // perché non c'è il file. La riga qui sopra la classificava `auto-ok — auto-fix lo chiuderà`, cioè
  // il difetto si sarebbe chiuso perché il suo file è SPARITO. Con `presente:true` finiva invece in
  // `auto-attesa`, contata fra i fix in arrivo: un puntatore rotto travestito da lavoro in corso.
  // Due travestimenti diversi, la stessa causa — nessuno chiedeva se il file esistesse PRIMA di
  // giudicare il pattern. La domanda adesso la fa il contratto, e la risposta è una per tutti.
  //
  // (auto-fix.mjs qui non chiude: su file assente dice «aperto». Erano due metri sullo stesso caso —
  // questo diceva «lo chiuderà», quello non lo chiudeva — e un metro che promette una chiusura che
  // non arriva è come si costruisce un numero di cui nessuno si fida.)
  //
  // AR-354 — LA DOMANDA ADESSO È GIÀ STATA FATTA, IN CIMA. Qui c'era la sua seconda copia, dentro il
  // ramo del pattern: teneva il caso a valle di cinque righe che potevano tornare prima di lei.
  // Lasciarla sarebbe stata la malattia in miniatura — due lettori della stessa regola, e quello
  // dimenticato è sempre il secondo.
  if (r.combacia) {
    return { ...base, classe: "auto-ok", perche: `prova soddisfatta ora (${dove}): auto-fix lo chiuderà`, auto_chiudibile: true };
  }
  if (eta !== null && eta > GIORNI_SOSPETTO) {
    return {
      ...base,
      classe: "auto-sospetta",
      perche: `prova mai soddisfatta da ${eta} giorni (${dove}): il puntatore potrebbe indicare il file sbagliato, o il fix è atterrato altrove`,
      auto_chiudibile: false,
    };
  }
  return { ...base, classe: "auto-attesa", perche: `prova non ancora soddisfatta (${dove})`, auto_chiudibile: true };
}

// ─────────────────────────── esecuzione ───────────────────────────
// Tutta dentro la guardia E_CLI (la stessa malattia detta in testa al file): prima di AR-582 il
// modulo LEGGEVA il cantiere vero e poteva fare process.exit(1) al solo essere importato — un test
// che ne importa una funzione pura si ritrovava il guardiano girato sotto i piedi.

if (E_CLI) {

// AR-709 — «non ho potuto aprire il cantiere» NON è «ho guardato e ho trovato dei guai».
// Prima qui usciva 1, cioè il codice che nel contratto di casa (AR-322) vuol dire «ho misurato».
// Chi legge l'uscita — giro.sh, il cancello, la CI — non poteva distinguere i due casi, e il
// secondo arrivava con la faccia del primo. Adesso è un 2, e la frase dice cosa non si è letto.
const lettura = leggiJson(CANTIERE_PATH, {
  cosa: "il cantiere dei difetti",
  forma: (v) => Array.isArray(v?.difetti),
  formaAttesa: "un oggetto con dentro l'elenco `difetti`",
});
if (lettura.esito.stato !== "verde") {
  console.error(`⚪ ${lettura.esito.motivo}`);
  console.error("   Non è un cantiere pulito: è una misura che non c'è stata. Ripara la fonte, non fidarti di questo silenzio.");
  process.exit(codiceDiUscita(lettura.esito));
}
const cantiere = lettura.valore;

// AR-684 — IL CONTO LO FA LA CASA, e questo referto ci si misura contro.
//
// Qui c'era `cantiere.difetti.filter((d) => d.stato !== "chiuso")`, un filtro scritto a mano, e il
// numero che ne usciva si pubblicava sotto il nome `difetti_aperti`. Sul registro vero del 22/8 gli
// stati sono TRE — 665 `chiuso`, 102 `aperto`, 10 `da-riverificare` — quindi quel campo diceva 112
// chiamandoli «aperti», mentre il registro accanto ne dichiarava 102 con lo stesso nome. Due numeri
// con lo stesso nome in due file, diversi di esattamente uno stato: è così che il terzo stato
// sparisce, e sparisce sempre dalla parte comoda.
//
// Adesso: `eDaFare` (la casa) decide chi è lavoro, `contaDifetti` (la casa) fa il conto per stato, e
// `bilancioDelReferto` pretende che **chiuse + classificate = totale**. Se domani nasce un sesto
// stato e qualcuno lo dimentica in un `.filter()`, la somma non torna e il referto lo dice da solo.
const conto = contaDifetti(cantiere.difetti);
const aperti = cantiere.difetti.filter(eDaFare);
const voci = aperti.map(classifica);
const bilancio = bilancioDelReferto(conto, voci.length);

const perClasse = voci.reduce((a, v) => ((a[v.classe] = (a[v.classe] || 0) + 1), a), {});
const bloccantiCiechiOra = bloccantiCiechi(voci);
const nonChiudibili = voci.filter((v) => !v.auto_chiudibile);
// AR-354 ② — LE PROVE IMPOSSIBILI: poggiano su un file che non esiste, quindi non possono dire né
// sì né no. Sono difetti SENZA controllo, e stanno in una colonna loro apposta: mescolarle ai «fix
// in attesa» è il travestimento che AR-686 ha smascherato una volta e che questo numero impedisce.
const proveImpossibili = voci.filter((v) => v.prova_impossibile === true);
// AR-354 ① — I DIFETTI CHE PESANO CON LA PROVA PIÙ DEBOLE: bloccanti o a impatto di crescita alto
// la cui prova non esegue niente. È il numero che deve scendere, e scende solo scrivendo dei test.
const daAlzare = voci.filter((v) => v.prova_debole_su_grave === true);
// ⚠️ IL BUCO CHE RESTA, DETTO COME NUMERO invece che sperato: questo guardiano dichiara «non
// chiudibile», ma chi CHIUDE è `auto-fix.mjs`, che non passa da `prova-ammissibile.mjs`. Le schede
// qui sotto sono quelle che auto-fix chiuderebbe lo stesso, oggi, perché la loro prova a pattern
// combacia adesso. Finché il numero è 0 il buco è teorico; il giorno che sale, è una chiusura falsa
// in arrivo — e si vede prima, non dopo.
const nonGiudicabili = voci.filter((v) => v.non_giudicabile === true);
const campiIlleggibili = schedeNonGiudicabili(aperti);
// AR-796 — le chiusure passate dalla porta A MANO lasciando una dichiarazione. Si leggono su TUTTE
// le schede, non solo su quelle da fare: sono chiuse per definizione, ed è proprio perché sono già
// chiuse che qualcuno deve poterle ritrovare.
const chiuseForzate = cantiere.difetti.filter((d) => typeof d?.chiusa_su_prova_non_ammessa === "string" && d.chiusa_su_prova_non_ammessa.trim());
const chiuseNonMisurate = cantiere.difetti.filter((d) => typeof d?.prova_non_misurata === "string" && d.prova_non_misurata.trim());
const chiuderebbeLoStesso = daAlzare.filter((v) => {
  const d = aperti.find((x) => x.id === v.id);
  return formaProva(d?.verifica) === "pattern" && provaCombacia(d.verifica).combacia === true;
});
// AR-582 — le schede a cui manca un campo del contratto (impatto_crescita/nato sui non-minori):
// senza quei campi la coda per priorità e il conto mensile non sanno dove metterle.
const incomplete = schedeIncomplete(cantiere.difetti);
// AR-023 — le schede non chiuse SENZA il campo `verifica`. Era obbligatorio nella prosa di
// auto-coscienza.md e in nessun guardiano, cioè non era obbligatorio: qui diventa un numero.
const senzaProva = schedeSenzaProva(cantiere.difetti);
// AR-559 — le prove che il motore NON SA ESEGUIRE, su TUTTO il registro (chiuse comprese). È il
// conto che conta: una scheda chiusa su una prova mai eseguita è un verde che non prova niente.
// Si guardano anche le chiuse apposta — il controllo `prova-orfana` del cancello vede solo le
// schede toccate dal lotto in corso, e fuori da lì nessuno contava.
const nonMisurabiliTutte = proveNonMisurabili(cantiere.difetti);
// Due debiti diversi sotto lo stesso codice 2, e vanno contati separati o nessuno dei due si vede
// scendere: «il motore non sa eseguire questo comando» (AR-559) è un difetto di FORMA che si
// ripara riscrivendo il comando; «da riverificare» è una scheda che aspetta qualcuno.
const nonMisurabili = nonMisurabiliTutte.filter((v) => v.causa === "comando-non-eseguibile");
const daRiverificare = nonMisurabiliTutte.filter((v) => v.causa === "da-riverificare");
// AR-649 — i nomi di campo fuori contratto (`severita` dove il registro dice `gravita`). Il
// registro non sapeva leggere sé stesso perché nessuno guardava il NOME: guardavano il valore, e
// trovando `undefined` concludevano «nessuna gravità», che è un silenzio, non un errore.
const alias = cantiere.difetti
  .map((d) => ({ id: d.id, stato: d.stato, alias: aliasFuoriContratto(d) }))
  .filter((x) => x.alias.length);
// AR-655/AR-575 — le chiusure col timbro storto: oggi nessuna senza data, ma 24 con la data secca.
// Il buco non è chiuso, si è spostato di un campo — e un timbro senza ora non entra nel mese.
const timbriRotti = timbriStorti(cantiere.difetti);

const report = {
  _cosa_e:
    "🔎 GUARDIANO DELLE PROVE — classifica la prova di ogni difetto non chiuso del cantiere e smaschera quelli che nessun guardiano potrà mai chiudere (prova umana, o puntatore che indica il file sbagliato). Nasce dal caso AR-144/AR-117 del 2026-07-25: fix mergiato e provato, ma il cantiere continuava a contarlo aperto. Scritto da cervello/cantiere-prove.mjs.",
  // AR-287 — un verde va letto per quello che vale, non per quello che sembra.
  _cosa_NON_prova:
    "Non prova che le prove siano BUONE: classifica la loro FORMA (comando eseguibile / pattern nel codice / verifica umana) e se il puntatore esiste. Una prova comportamentale che passa anche col fix rotto — una prova vacua — qui risulta sana: quello lo scopre solo chi rompe il fix apposta e guarda se diventa rossa.",
  aggiornato: nowPiacenza(),
  giorni_sospetto: GIORNI_SOSPETTO,
  // AR-684 — il nome storico resta perché fuori da qui c'è chi lo legge, ma NON vuol dire «aperto»:
  // vuol dire «tutto ciò che non è chiuso». Il nome onesto gli sta accanto, e sotto c'è il conto per
  // stato con la somma che si controlla da sola. Un numero senza denominatore non può sbilanciarsi,
  // quindi non può neanche denunciare uno stato saltato.
  difetti_aperti: aperti.length,
  difetti_da_fare: aperti.length,
  conto,
  bilancio,
  per_classe: perClasse,
  // ── AR-354 — i due debiti che questo lotto rende contabili ────────────────────────────────
  // Stanno nel referto SEMPRE, anche a zero: un numero che compare solo quando è brutto non si può
  // guardare scendere, e questi devono scendere.
  difetti_senza_controllo: proveImpossibili.length,
  prove_impossibili: proveImpossibili.map((v) => ({ id: v.id, gravita: v.gravita, perche: v.perche })),
  prove_da_alzare: daAlzare.map((v) => ({ id: v.id, gravita: v.gravita, impatto_crescita: v.impatto_crescita, perche: v.perche })),
  chiuderebbe_lo_stesso: chiuderebbeLoStesso.map((v) => v.id),
  // AR-789/790 — il terzo debito contabile. Sta qui SEMPRE, anche a zero, per la stessa ragione
  // degli altri due: un numero che compare solo quando è brutto non si può guardare scendere.
  schede_non_giudicabili: nonGiudicabili.length,
  // AR-789/790 — DUE numeri, e vanno tenuti diversi o diventano «una parola con due padroni».
  //   · `schede_non_giudicabili` = quante il CANCELLO non sa decidere. Un bloccante con l'impatto
  //     illeggibile non è qui dentro: il cancello decide lo stesso, perché la gravità gli basta.
  //   · `schede_campi_illeggibili` = quante hanno un campo che non si legge, cancello a parte.
  //     È la qualità del DATO, ed è sempre ≥ dell'altro.
  // Il 23/8 la differenza era esattamente 1 (AR-795: bloccante con `impatto_crescita: "diretto: …"`,
  // e «diretto» non è una delle quattro categorie). Farli coincidere in un numero solo nascondeva
  // proprio quel caso — ed è la stessa malattia che il lotto 50 stava curando.
  schede_campi_illeggibili: campiIlleggibili.length,
  campi_illeggibili: campiIlleggibili.map((d) => ({ id: d.id, gravita: d.gravita ?? null, impatto_crescita: d.impatto_crescita ?? null })),
  // ── AR-796 — LE DICHIARAZIONI DELLA PORTA A MANO, finalmente contate ──────────────────────
  //
  // `auto-fix.mjs chiudi --id=…` non si sbarra (davanti c'è una persona che ha scritto l'id), ma
  // quando chiude su una prova che il cancello non ammetterebbe lo SCRIVE sulla scheda. Fin qui la
  // scelta è giusta; il buco era che quel campo non lo leggeva nessuno — e un campo che nessuno
  // conta è un silenzio con un nome più bello.
  //
  // Vale anche per `prova_non_misurata`, che è di AR-559 (13/8) e porta lo stesso difetto da allora:
  // il messaggio a schermo prometteva testualmente «e nel conto di `cantiere-prove.mjs --gate-prove`»
  // e quel conto non è mai esistito — due sole occorrenze in tutto il repo, verificate col grep il
  // 23/8, tutt'e due dentro auto-fix. Una promessa stampata a schermo non è un contatore.
  //
  // Ci sono SEMPRE, anche a zero, come gli altri debiti contabili: un numero che compare solo
  // quando è brutto non si può guardare scendere.
  chiuse_su_prova_non_ammessa: chiuseForzate.length,
  chiuse_su_prova_non_misurata: chiuseNonMisurate.length,
  chiuse_da_rileggere: [...new Set([...chiuseForzate, ...chiuseNonMisurate].map((d) => d.id))].sort(),
  non_giudicabili: nonGiudicabili.map((v) => ({ id: v.id, gravita: v.gravita, impatto_crescita: v.impatto_crescita, perche: v.perche })),
  non_auto_chiudibili: nonChiudibili.length,
  bloccanti_ciechi: bloccantiCiechiOra.map((v) => v.id),
  // AR-582 — schede non-minori senza impatto_crescita e/o nato: fuori da ogni ordinamento per
  // priorità e (senza nato) fuori dal conto mensile. `--gate-campi` le rende un rosso.
  schede_incomplete: incomplete,
  // ── il contratto della scheda, i quattro numeri che prima non esistevano ──────────────────
  // Stanno nel report SEMPRE, anche a zero: un numero che compare solo quando è brutto non si può
  // guardare scendere, e questi devono scendere.
  schede_senza_prova: senzaProva, // AR-023
  prove_non_misurabili: nonMisurabili, // AR-559 — codice 2: non è verde, è cieco
  // ⚠️ NOME CAMBIATO, e la ragione è la malattia di questo lotto. Si chiamava `da_riverificare`,
  // esattamente come `conto.da_riverificare` che adesso gli sta due righe sopra — e le due cose non
  // sono la stessa: questa è la PROVA dichiarata `{tipo:"da-riverificare"}` (7 schede), quella è lo
  // STATO della scheda (10 schede). Una parola con due padroni dentro lo stesso referto è come
  // nascono i numeri che litigano. Nessuno fuori da qui la leggeva: verificato prima di rinominarla.
  prove_da_riverificare: daRiverificare, // codice 2 dell'altro tipo: la scheda aspetta qualcuno
  alias_fuori_contratto: alias, // AR-649 — `severita` dove il registro dice `gravita`
  timbri_storti: timbriRotti, // AR-655 — chiuse con una data senza ora (o senza data)
  voci,
};

if (!DRY && E_CLI) writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (JSON_MODE) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`\n🔎 PROVE DEL CANTIERE — ${report.aggiornato}\n`);
  // AR-684 — il numero con il suo denominatore e i suoi stati. Un «112 difetti non chiusi» da solo
  // non lascia vedere che 10 di quelli stanno in un terzo stato che per mesi nessuno contava.
  // ⚠️ «Difetti non chiusi: N» resta l'attacco della riga: `cantiere-che-non-si-apre…test.mjs` la
  // cerca così per sapere che il guardiano ha davvero contato. Il denominatore e gli stati si
  // aggiungono DOPO — allargare una riga è gratis, rinominarla rompe chi la legge.
  console.log(`   Difetti non chiusi: ${aperti.length} su ${conto.totale} schede (${conto.chiusi} chiuse) — ${bilancio.motivo}`);
  if (conto.altri) {
    console.log(`   ⚠️  ${conto.altri} scheda/e in uno stato che non so nominare: ${(conto.stati_ignoti || []).map((s) => `${s.stato} (${s.quante})`).join(", ")}`);
  }
  for (const [k, n] of Object.entries(perClasse).sort()) console.log(`   · ${k}: ${n}`);
  console.log("");
  const problemi = voci.filter((v) => !v.auto_chiudibile);
  if (problemi.length) {
    console.log(`   ⚠️  ${problemi.length} difetti che NESSUN guardiano può chiudere da solo:\n`);
    for (const v of problemi) {
      const bang = v.gravita === "bloccante" ? "🔴" : "· ";
      console.log(`   ${bang} ${v.id} [${v.gravita}] — ${v.classe}`);
      console.log(`      ${v.perche}`);
    }
    console.log("");
  }
  console.log(
    bloccantiCiechiOra.length
      ? `❌ ${bloccantiCiechiOra.length} BLOCCANTI non verificabili (${bloccantiCiechiOra.map((v) => v.id).join(", ")}): gonfiano il conteggio senza che nessuno possa abbassarlo.`
      : "✅ Ogni bloccante ha una prova che un guardiano può verificare.",
  );
  // ── AR-354 — i due cancelli, stampati anche a zero ────────────────────────────────────────
  console.log(
    `\n🚦 PROVE AMMISSIBILI — ${daAlzare.length} difetti gravi (bloccante o impatto ALTO) la cui prova non esegue niente · ${proveImpossibili.length} difetti SENZA controllo (la prova punta a un file che non esiste)`,
  );
  for (const v of daAlzare.slice(0, 8)) console.log(`   · ${v.id} [${v.gravita}/${v.impatto_crescita ?? "?"}] ${v.perche}`);
  if (daAlzare.length > 8) console.log(`   … e altri ${daAlzare.length - 8}`);
  for (const v of proveImpossibili.slice(0, 6)) console.log(`   🕳️  ${v.id} — ${v.perche}`);
  if (chiuderebbeLoStesso.length) {
    // Il buco fra il metro e l'atto, detto come numero. Qui si CLASSIFICA; chi chiude è auto-fix.mjs,
    // e non passa da `prova-ammissibile.mjs`: fino ad allora queste si chiudono lo stesso.
    console.log(
      `   ❗ ${chiuderebbeLoStesso.length} di quelli li chiuderebbe LO STESSO \`auto-fix.mjs\` (${chiuderebbeLoStesso.map((v) => v.id).join(", ")}): la loro prova a pattern combacia ORA, e auto-fix non passa da questo cancello. Il freno vive qui, l'atto vive là.`,
    );
  }
  if (incomplete.length) {
    console.log(`\n📇 ${incomplete.length} schede NON minori senza i campi del contratto (la coda per priorità non sa dove metterle):`);
    for (const s of incomplete.slice(0, 12)) console.log(`   · ${s.id} [${s.gravita}] — manca ${s.manca.join(" e ")}`);
    if (incomplete.length > 12) console.log(`   … e altre ${incomplete.length - 12}`);
  }
  // ── il contratto della scheda: quattro conti che devono poter SCENDERE ────────────────────
  // Si stampano anche a zero. Un numero che appare solo quando è brutto non si può guardare
  // scendere: sparisce, e la sparizione somiglia a una guarigione.
  console.log(
    `\n📇 CONTRATTO DELLA SCHEDA — ${senzaProva.length} senza \`verifica\` (AR-023) · ${nonMisurabili.length} con una prova che il motore NON sa eseguire (AR-559) · ${daRiverificare.length} dichiarate da riverificare · ${alias.length} col nome di campo fuori contratto (AR-649) · ${timbriRotti.length} chiuse col timbro storto (AR-655)`,
  );
  if (nonMisurabili.length) {
    const chiuse = nonMisurabili.filter((v) => v.stato === "chiuso");
    console.log(
      `   ⚠️  codice 2 = NON HO POTUTO MISURARE: ${chiuse.length} di quelle ${nonMisurabili.length} sono CHIUSE. Una scheda chiusa su una prova che nessuno sa eseguire è un verde che non prova niente.`,
    );
    for (const v of nonMisurabili.slice(0, 6)) console.log(`   · ${v.id} [${v.stato}] ${v.motivo}`);
    if (nonMisurabili.length > 6) console.log(`   … e altre ${nonMisurabili.length - 6}`);
  }
  if (senzaProva.length) {
    console.log(`   · senza \`verifica\`: ${senzaProva.slice(0, 10).map((s) => s.id).join(", ")}${senzaProva.length > 10 ? " …" : ""}`);
  }
  if (!DRY) console.log(`   report: ${OUT_PATH.replace(`${AD_ROOT}/`, "")}\n`);
}

await stampSegnale(
  "cantiere-prove",
  bloccantiCiechiOra.length || nonMisurabili.length ? "attenzione" : "ok",
  `${nonChiudibili.length}/${aperti.length} non auto-chiudibili · ${bloccantiCiechiOra.length} bloccanti ciechi · ${incomplete.length} schede senza campi · ${nonMisurabili.length} prove che il motore non sa eseguire · ${senzaProva.length} senza verifica`,
).catch((e) => console.error(`⚠️  segnale non stampato (il verdetto qui sopra resta valido): ${e.message || e}`));

// ⚠️ `process.exitCode` E NON `process.exit()` — UN GUARDIANO CHE SI TRONCA IL REFERTO.
//
// Trovato qui il 13/8, allargando il report. Quando stdout è una PIPE (cioè sempre: `| head`,
// `$(...)`, `spawnSync` di un test) le scritture di node sono ASINCRONE: `console.log` mette in
// coda, il sistema ne accetta 64 KB e il resto aspetta. `process.exit()` non aspetta — butta via
// la coda. Misurato: il referto `--json` è 166.684 byte su file e ne arrivavano 65.536 esatti su
// pipe, tagliato a metà stringa. Il JSON troncato non si parsa: chi legge il guardiano riceve un
// errore invece di un verdetto, e un guardiano che non consegna il referto è un guardiano spento.
//
// Non è colpa dell'ultima riga: era già così a 114.699 byte, cioè da prima di questo lotto — il
// referto era sopra i 64 KB da un pezzo e il taglio dipendeva dal caso. Assegnare `exitCode`
// lascia che node svuoti la coda e POI esca con lo stesso numero: il codice d'uscita è identico,
// il referto arriva intero.
if (GATE && bloccantiCiechiOra.length) process.exitCode = 1;
// AR-582/AR-649/AR-023 — freno separato dal `--gate` storico: rosso se una scheda non-minore è
// senza impatto_crescita/nato, se una scheda non chiusa è senza `verifica`, o se un nome di campo
// sta fuori contratto. Separato apposta: il debito di oggi non deve far diventare rosso il giro
// che usa `--gate`, ma chi vuole il contratto duro ce l'ha.
if (GATE_CAMPI && (incomplete.length || senzaProva.length || alias.length)) process.exitCode = 1;
// AR-684 — E IL BILANCIO, sotto lo stesso flag. Un referto le cui schede classificate più le chiuse
// non fanno il totale sta lasciando fuori uno stato: è il buco che ha tenuto 56 schede (10 oggi)
// fuori dai conti per mesi. Sta sotto `--gate-campi` e non sotto il `--gate` storico apposta —
// quello guarda i bloccanti, questo guarda il contratto — e resta fuori dalla corsa senza flag, che
// deve continuare a uscire 0 (`scheda-mal-formata-chiude-da-sola.test.mjs` lo pretende).
if (GATE_CAMPI && bilancio.torna !== true) {
  console.error(`\n❌ ${bilancio.motivo}`);
  process.exitCode = 1;
}
// AR-559 — il freno delle prove cieche, di nuovo separato: `--gate-prove` è ROSSO finché esiste
// una scheda (aperta O CHIUSA) la cui prova il motore non sa eseguire. Terzo flag e non un ramo
// dei due esistenti perché è l'unico che guarda anche l'archivio, e mescolare i tre renderebbe
// impossibile dire QUALE dei tre debiti sta scendendo.
if (GATE_PROVE && nonMisurabili.length) process.exitCode = 1;

} // fine E_CLI
