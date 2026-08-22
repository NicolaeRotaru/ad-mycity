// 🚦 QUANDO UNA PROVA NON PUÒ CHIUDERE UN DIFETTO — la regola in un posto solo, senza toccare niente.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «un metro che non può fallire»
// ─────────────────────────────────────────────────────────────────────────────
// AR-354, misurato di nuovo il 22/8/2026 sul cantiere vero (777 schede, 112 da fare):
//
//   · 27 schede da fare sono `bloccante` o a impatto di crescita `alto`. **19 di quelle 27 non
//     hanno una prova che ESEGUE qualcosa**: 8 cercano una parola dentro un file, 10 dichiarano
//     una verifica umana, 1 non ha proprio il campo `verifica`. Sono i difetti che pesano di più
//     e sono coperti dal metro più debole che esiste.
//   · Una prova a parola-in-un-file può diventare verde per motivi che col fix non c'entrano —
//     qualcuno scrive quella parola in un commento, o rinomina una variabile. Il difetto si chiude
//     e nessuno lo riguarda più. *Una ricerca di parole non può fallire nel modo in cui fallisce
//     la realtà*: è per questo che gli errori li trovava Nicola e non la macchina.
//
// La regola giusta la macchina se la scriveva già da sola — dentro il TESTO dei vincoli del giro
// («meglio ancora, sostituiscila con una prova comportamentale»). Ma una regola che vive in un
// messaggio si obbedisce solo quando c'è tempo. Qui diventa una funzione che qualcuno chiama, cioè
// un cancello che può dire di no.
//
// ⚠️ QUESTO FILE DECIDE, NON AGISCE. Il guardiano che lo chiama oggi è `cervello/cantiere-prove.mjs`
// (classifica e conta). **Chi CHIUDE davvero le schede è `cervello/auto-fix.mjs`**, e quello non
// passa ancora di qui: finché non lo fa, questo è il metro onesto e quella è la porta aperta. Sta
// scritto nel referto (`chiuderebbe_lo_stesso`) invece che nella testa di chi legge.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun processo, nessun `process.env`, nessun
// orologio. Tutto ciò che serve arriva dagli argomenti — così un test lo può ESEGUIRE invece di
// cercarne una parola in un file, che è la malattia stessa.

import { classificaProva } from "./contratto-prova.mjs";
import { formaProvaScheda, gravitaDi, verdettoProva } from "./contratto-scheda.mjs";

// ═══════════════════════════════════════════════════════════════════════════
// ① I NOMI — le marche e le classi, dette una volta sola
// ═══════════════════════════════════════════════════════════════════════════

/** La marca che AR-354 chiede a voce alta: una prova che poggia su un file che non esiste. */
export const MARCA_IMPOSSIBILE = "prova_impossibile";

/** L'altra marca: la prova esiste e si valuta, ma è troppo debole per il peso del difetto. */
export const MARCA_DEBOLE_SU_GRAVE = "prova_debole_su_grave";

/**
 * La classe con cui il guardiano etichetta il caso ②.
 *
 * Il caso ① tiene il nome storico `prova-orfana` apposta: due prove vive lo pretendono
 * (`prova-che-non-puo-fallire.test.mjs`), e rinominare una classe per farla assomigliare al testo
 * di una scheda romperebbe un metro che funziona per guadagnare una parola. La MARCA chiesta dalla
 * scheda viaggia come campo (`prova_impossibile: true`), che è dove la si può contare.
 */
export const CLASSE_DEBOLE_SU_GRAVE = "prova-debole-su-grave";

/** Il nome storico della prova che punta al vuoto. Non si rinomina: vedi sopra. */
export const CLASSE_IMPOSSIBILE = "prova-orfana";

/** Le gravità che da sole obbligano alla prova comportamentale. */
export const GRAVITA_CHE_OBBLIGANO = Object.freeze(["bloccante"]);

/** Il valore di `impatto_crescita` che obbliga alla prova comportamentale. */
export const IMPATTO_CHE_OBBLIGA = "alto";

// ═══════════════════════════════════════════════════════════════════════════
// ② LA DOMANDA — questo difetto pretende una prova che ESEGUE?
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Il difetto è di quelli a cui una parola cercata in un file non basta?
 *
 * Due strade, e bastano perché sono le due che pesano: la gravità `bloccante` (il difetto che
 * ferma qualcosa) e l'impatto di crescita `alto` (il difetto che costa soldi). Sui `minore` e sui
 * `medio` la prova a pattern resta ammessa: vietarla ovunque congelerebbe l'84% del cantiere
 * (AR-444), e un cancello che nessuno può attraversare è un cancello che si impara ad aggirare.
 *
 * `impatto_crescita` si legge con l'uguale esatto, come fa `cantiere-owner-check.mjs`: nel registro
 * vero quel campo porta anche 40 frasi di prosa («indiretto: è debito della macchina…»), e un
 * confronto largo le tirerebbe dentro tutte.
 *
 * @param {object} d la scheda del cantiere
 * @returns {{obbligatoria: boolean, perche: string}}
 */
export function provaComportamentaleObbligatoria(d) {
  const gravita = String(gravitaDi(d) ?? "").trim();
  const impatto = String(d?.impatto_crescita ?? "").trim();
  const perGravita = GRAVITA_CHE_OBBLIGANO.includes(gravita);
  const perImpatto = impatto === IMPATTO_CHE_OBBLIGA;
  if (!perGravita && !perImpatto) {
    return { obbligatoria: false, perche: `gravità «${gravita || "?"}» e impatto «${impatto || "?"}»: la prova a pattern resta ammessa` };
  }
  const motivi = [];
  if (perGravita) motivi.push("è un BLOCCANTE");
  if (perImpatto) motivi.push("ha impatto di crescita ALTO");
  return { obbligatoria: true, perche: `questo difetto ${motivi.join(" e ")}` };
}

/**
 * La prova ESEGUE qualcosa? Cioè: è un `{comando: …}` che il motore sa far girare.
 *
 * Le due condizioni insieme, e la seconda è quella che salta: `{comando: "chiedere a Nicola"}` ha
 * la forma giusta e non si esegue — è il codice 2 del contratto di casa, «non ho potuto misurare»,
 * che non è né un verde né una prova.
 */
export function provaCheEsegue(verifica) {
  if (formaProvaScheda(verifica) !== "comando") return false;
  return verdettoProva(verifica).eseguibile === true;
}

/** Com'è fatta questa prova, detto in italiano per chi legge il referto. */
export function descriviProva(verifica) {
  switch (formaProvaScheda(verifica)) {
    case "comando":
      return `un comando che il motore non sa eseguire (${String(verifica?.comando ?? "").trim() || "vuoto"})`;
    case "pattern":
      return `una parola cercata dentro un file (${verifica.file} ~ /${verifica.pattern}/)`;
    case "umana":
      return "una verifica dichiarata umana: nessun guardiano potrà mai chiuderla";
    case "da-riverificare":
      return "una prova dichiarata da riverificare: nessuno l'ha ancora misurata";
    case "nessuna":
      return "nessuna prova dichiarata";
    default:
      return "una prova che dichiara una forma che non ha";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ③ IL VERDETTO — i due cancelli di AR-354, in una risposta sola
// ═══════════════════════════════════════════════════════════════════════════

/**
 * QUESTA PROVA PUÒ CHIUDERE QUESTO DIFETTO? I due cancelli che la scheda AR-354 chiede.
 *
 *   (b) la prova poggia su un FILE CHE NON ESISTE → `prova_impossibile`: è un difetto **senza
 *       controllo**, non un difetto in attesa. La differenza non è di parole — «in attesa» finisce
 *       nel mucchio dei fix in arrivo, cioè in una colonna che promette una chiusura che nessuno
 *       potrà mai fare, e con `presente:false` la prova combacerebbe proprio PERCHÉ il file è
 *       sparito (AR-686).
 *   (a) il difetto è bloccante o ad alto impatto e la sua prova NON esegue niente →
 *       `prova_debole_su_grave`: non è chiudibile finché qualcuno non le mette sotto un comando.
 *
 * L'ordine è (b) prima di (a) apposta: un puntatore rotto è un fatto sul MONDO, la debolezza è un
 * giudizio sul PESO. Quando valgono tutt'e due, chi legge deve sapere prima che il file non c'è.
 *
 * Torna sempre lo stesso oggetto, anche quando va tutto bene: `ammessa: true` con marca `null`.
 * Un verdetto che a volte è un booleano e a volte un oggetto è come si perde per strada il motivo.
 *
 * @param {object} d la scheda del cantiere (gravita/severita, impatto_crescita, verifica)
 * @param {{fileEsiste?: (percorso: string) => boolean}} mondo l'unica domanda al disco, iniettata
 * @returns {{ammessa:boolean, marca:string|null, classe:string|null, senza_controllo:boolean, motivo:string}}
 */
export function ammissibilitaProva(d, { fileEsiste = () => false } = {}) {
  const v = d?.verifica;

  // (b) — il puntatore rotto. La domanda «quel file c'è?» la fa il contratto, così la risposta è
  // una sola per tutti i lettori (AR-686: erano quattro copie che divergevano).
  const c = classificaProva(v, { fileEsiste });
  if (c.tipo === "orfana") {
    return {
      ammessa: false,
      marca: MARCA_IMPOSSIBILE,
      classe: CLASSE_IMPOSSIBILE,
      senza_controllo: true,
      motivo: `${c.motivo} — questo difetto è SENZA controllo, non in attesa di un fix`,
    };
  }

  // (a) — il peso del difetto contro la forza della prova.
  const obbligo = provaComportamentaleObbligatoria(d);
  if (obbligo.obbligatoria && !provaCheEsegue(v)) {
    return {
      ammessa: false,
      marca: MARCA_DEBOLE_SU_GRAVE,
      classe: CLASSE_DEBOLE_SU_GRAVE,
      senza_controllo: false,
      motivo:
        `${obbligo.perche}, e la sua prova è ${descriviProva(v)}. ` +
        "Un difetto così non si chiude su una parola cercata in un file: serve `{comando: \"node cervello/test/<nome>.test.mjs\"}`, cioè una prova che diventa rossa se il difetto torna.",
    };
  }

  return { ammessa: true, marca: null, classe: null, senza_controllo: false, motivo: c.motivo };
}

// ═══════════════════════════════════════════════════════════════════════════
// ④ IL BILANCIO DEL REFERTO — nessuna scheda fuori dai totali (AR-684)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * LE SCHEDE CLASSIFICATE PIÙ LE CHIUSE DEVONO FARE IL TOTALE. Se non lo fanno, il referto lo dice.
 *
 * AR-684, verificato sul JSON vero il 22/8/2026: il terzo stato si chiama **`da-riverificare`** e
 * oggi sono **10 schede** su 777 (665 chiuse, 102 `aperto`, 10 `da-riverificare`). Il conto scritto
 * dentro il registro è stato riparato altrove e oggi torna; **il referto del guardiano delle prove
 * no**: pubblicava `difetti_aperti: 112` con un filtro scritto a mano (`d.stato !== "chiuso"`),
 * cioè un numero che si CHIAMA «aperti» mentre ne conta 112 — 102 aperti più i 10 del terzo stato.
 * Due numeri con lo stesso nome in due file, diversi di esattamente uno stato.
 *
 * Il difetto non è il numero: è che **nessuno se ne poteva accorgere**. Un referto senza totale e
 * senza denominatore non può sbilanciarsi, quindi non può neanche denunciare uno stato saltato.
 * Qui il conto si controlla da solo: se domani nasce un sesto stato e qualcuno lo dimentica in un
 * `.filter()`, la somma non torna e il guardiano lo stampa invece di lasciarlo scoprire a una
 * radiografia sei settimane dopo.
 *
 * `null` quando il conto non è stato letto: su un cieco non si emette un verdetto (e un non-contato
 * non è uno zero).
 *
 * @param {object} conto il risultato di `contaDifetti` (cervello/stati-cantiere.mjs)
 * @param {number} classificate quante schede il referto ha davvero classificato
 * @returns {{torna:boolean|null, attese:number|null, viste:number|null, fuori:number|null, motivo:string}}
 */
export function bilancioDelReferto(conto, classificate) {
  if (!conto || conto.letto !== true) {
    return { torna: null, attese: null, viste: null, fuori: null, motivo: "il conto del cantiere non è stato letto: non ho potuto bilanciare niente, e un non-bilanciato non è un bilanciato" };
  }
  const viste = Number(classificate);
  if (!Number.isFinite(viste)) {
    return { torna: null, attese: conto.da_fare, viste: null, fuori: null, motivo: "non mi è arrivato quante schede il referto ha classificato: non ho potuto bilanciare niente" };
  }
  const attese = conto.da_fare;
  const fuori = attese - viste;
  const somma = conto.chiusi + viste;
  const torna = fuori === 0 && somma === conto.totale;
  return {
    torna,
    attese,
    viste,
    fuori,
    motivo: torna
      ? `bilancio a posto: ${conto.chiusi} chiuse + ${viste} classificate = ${conto.totale} schede, e ogni stato vivo è dentro (${statiVivi(conto)})`
      : `BILANCIO ROTTO: ${conto.chiusi} chiuse + ${viste} classificate = ${somma}, ma le schede sono ${conto.totale}. ` +
        `${Math.abs(fuori)} scheda/e ${fuori > 0 ? "non entrano in nessun totale" : "sono contate due volte"} — il terzo stato del cantiere (${statiVivi(conto)}) è il posto dove guardare.`,
  };
}

/** Gli stati vivi con il loro numero, scritti come li direbbe una persona. */
function statiVivi(conto) {
  const righe = [];
  if (conto.aperti) righe.push(`${conto.aperti} aperto`);
  if (conto.in_corso) righe.push(`${conto.in_corso} in-corso`);
  if (conto.da_riverificare) righe.push(`${conto.da_riverificare} da-riverificare`);
  if (conto.altri) righe.push(`${conto.altri} in uno stato che non so nominare`);
  return righe.join(" · ") || "nessuna scheda viva";
}
