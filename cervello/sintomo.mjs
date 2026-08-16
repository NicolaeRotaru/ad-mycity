#!/usr/bin/env node
// 🩺 IL SINTOMO — «questo difetto è ANCORA rotto?», con una risposta che può dire di no.
//
// 🟢 PURO: nessun file, nessun processo, nessuna rete. Riceve quello che si è osservato e risponde.
// È la condizione perché un test possa ESEGUIRE queste decisioni invece di cercarle in un file —
// che è esattamente la malattia che questo modulo cura.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
//
// Nicola, 16/8: «trova il modo per sapere se i 138 difetti sono ancora rotti».
//
// Il conto che l'ha chiesto: dei 210 difetti non chiusi, 138 non aspettano una riparazione —
// aspettano un METRO. 34 dicono «lo deve guardare una persona» e nessuna macchina li chiuderà mai.
// 53 avevano una prova che cercava una parola dentro un file, e quel file è cambiato in un mese.
// 30 non hanno prova affatto. Solo 64 su 210 hanno oggi un comando che sa rispondere sì o no.
//
// Gli strumenti che già esistono guardano da altre parti, ed è per questo che il buco è rimasto:
//   · `cantiere-prove.mjs` classifica la FORMA della prova — non chiede mai se il sintomo c'è ancora.
//   · `chiusure-audit.mjs` riesegue la prova dei difetti CHIUSI — non guarda gli aperti.
//   · `auto-fix.mjs` chiude chi ha una prova che passa — e un difetto senza prova non lo tocca mai.
// Nessuno chiede a un difetto aperto: «il sintomo si riproduce ancora oggi?».
//
// ─────────────────────────────────────────────────────────────────────────────
// LA DISTINZIONE CHE FA TUTTO — misurare la MALATTIA, non cercare la CURA
// ─────────────────────────────────────────────────────────────────────────────
//
// AR-128 è il caso-scuola, ed è ancora aperto mentre scrivo. Dice: «nessun sensore per le
// contestazioni carta». La sua prova era: cerca la parola «chargeback» dentro `sentinelle.md`.
// Scrivere quella parola in quel file avrebbe chiuso il difetto — e il sensore non ci sarebbe
// stato comunque. Quella prova cercava la CURA.
//
// Il sintomo fa il contrario: misura la MALATTIA. «Quanti sensori esistono per le contestazioni?»
// Il numero scende solo se il sensore nasce davvero. Nessuna parola scritta da qualche parte lo
// muove. La differenza operativa, e il modo di farla rispettare da una macchina:
//
//   → un sintomo deve essere INVARIANTE alla scrittura del testo della cura.
//
// Da qui la regola ②: un sintomo non può essere una parola cercata dentro un documento di prosa.
// Là dentro la cura si scrive in tre secondi, e il metro si compra.
//
// ─────────────────────────────────────────────────────────────────────────────
// E I TRE ESITI — perché non sono due
// ─────────────────────────────────────────────────────────────────────────────
//
// La malattia già censita `cieco-che-torna-una-misura` dice: un errore diventa una misura, il
// `catch { return 0 }` restituisce zero, e lo zero rassicura. Qui il comando che non gira NON è
// «sano»: è NON MISURATO, e va contato in una colonna sua. Un difetto che non si è lasciato
// misurare resta un difetto ignoto, e ignoto non è guarito.

// ─────────────────────────────────────────────────────────────────────────────
// ① I TRE ESITI
// ─────────────────────────────────────────────────────────────────────────────

/** Il sintomo si riproduce: il difetto è ancora lì. */
export const ROTTO = "rotto";
/** Il sintomo non si riproduce più: il difetto sembra guarito, e ora si può guardare il perché. */
export const SANO = "sano";
/** Non si è lasciato misurare. NON è un verde: è un buco dichiarato. */
export const NON_MISURATO = "non-misurato";

export const ESITI = [ROTTO, SANO, NON_MISURATO];

// ─────────────────────────────────────────────────────────────────────────────
// ② IL CONTRATTO DEL SINTOMO
// ─────────────────────────────────────────────────────────────────────────────

/** Gli operatori con cui si dichiara quando il numero osservato significa «ancora rotto». */
export const OPERATORI = [">=", "<=", "==", ">", "<", "!="];

/**
 * Un sintomo è dichiarato bene?
 *
 * Serve: la `misura` (un comando che stampa UN numero), `rotto_se` (quando quel numero significa
 * che la malattia c'è) e `alla_nascita` (quanto valeva quando il difetto è stato scoperto).
 *
 * `alla_nascita` non è decorazione: è ciò che rende leggibile un cambio di verdetto. Senza, un
 * «sano» di oggi non si distingue da un «non l'ho mai visto rotto», e quella differenza è tutto.
 */
export function sintomoValido(s) {
  if (!s || typeof s !== "object") return { valido: false, motivo: "nessun sintomo dichiarato" };
  if (typeof s.misura !== "string" || !s.misura.trim()) {
    return { valido: false, motivo: "manca `misura`: il comando che osserva la malattia" };
  }
  if (s.altre_misure !== undefined && !Array.isArray(s.altre_misure)) {
    return { valido: false, motivo: "`altre_misure` dev'essere una lista di sintomi, uno per clausola" };
  }
  const cond = s.rotto_se;
  if (!cond || typeof cond !== "object") {
    return { valido: false, motivo: "manca `rotto_se`: quando il numero osservato significa «ancora rotto»" };
  }
  const chiavi = Object.keys(cond);
  if (chiavi.length !== 1) {
    return { valido: false, motivo: "`rotto_se` vuole un operatore solo, non " + chiavi.length };
  }
  const [op] = chiavi;
  if (!OPERATORI.includes(op)) {
    return { valido: false, motivo: `operatore «${op}» fuori contratto: ammessi ${OPERATORI.join(" ")}` };
  }
  if (typeof cond[op] !== "number" || !Number.isFinite(cond[op])) {
    return { valido: false, motivo: "la soglia di `rotto_se` non è un numero" };
  }
  if (typeof s.alla_nascita !== "number" || !Number.isFinite(s.alla_nascita)) {
    return { valido: false, motivo: "manca `alla_nascita`: quanto valeva la misura quando il difetto è nato" };
  }
  // Un sintomo che alla nascita NON era rotto è un sintomo che misura la cosa sbagliata: il difetto
  // esisteva, quindi la sua misura doveva dirlo. Questo controllo ha un costo — obbliga a osservare
  // davvero prima di dichiarare — ed è il costo che impedisce di scrivere sintomi a caso.
  if (!soddisfa(s.alla_nascita, cond)) {
    return {
      valido: false,
      motivo: `alla nascita valeva ${s.alla_nascita}, che NON soddisfa rotto_se: questo sintomo non misura questo difetto`,
    };
  }
  return { valido: true, motivo: null };
}

/** Il numero osservato dice «malattia presente»? */
export function soddisfa(valore, rotto_se) {
  const [op] = Object.keys(rotto_se || {});
  const soglia = rotto_se?.[op];
  if (typeof valore !== "number" || !Number.isFinite(valore)) return false;
  switch (op) {
    case ">=":
      return valore >= soglia;
    case "<=":
      return valore <= soglia;
    case "==":
      return valore === soglia;
    case "!=":
      return valore !== soglia;
    case ">":
      return valore > soglia;
    case "<":
      return valore < soglia;
    default:
      return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ LA REGOLA ANTI-COMPIACENZA — un sintomo non si compra scrivendo una parola
// ─────────────────────────────────────────────────────────────────────────────

/** I documenti in cui la cura si scrive in tre secondi: là dentro cercare una parola non misura niente. */
const PROSA = /\.(md|txt|mdx)(\s|$|["'`])/i;
/** Le forme che cercano un testo invece di eseguire qualcosa. */
const CERCA_TESTO = /^\s*(grep|rg|ag|ack)\b/;

/**
 * Questa misura osserva la MALATTIA, o cerca il testo della CURA?
 *
 * È il controllo che tiene in piedi tutto il resto. Un `grep parola documento.md` come sintomo
 * riproduce esattamente AR-128: la parola si scrive, il difetto si chiude, e il sensore non c'è.
 *
 * Cosa resta ammesso, e perché:
 *   · eseguire uno script della macchina e leggerne l'uscita → la macchina risponde di sé
 *   · leggere un valore da un file di dati che la macchina produce → il dato non si scrive a mano
 *   · contare occorrenze in file di CODICE → per cambiare il conto bisogna cambiare il codice
 * Cosa no:
 *   · cercare una parola dentro un documento di prosa → si compra in tre secondi
 */
export function misuraLaMalattia(misura) {
  const m = String(misura || "");
  if (!m.trim()) return { ok: false, motivo: "misura vuota" };
  if (CERCA_TESTO.test(m) && PROSA.test(m)) {
    return {
      ok: false,
      motivo:
        "cerca una parola dentro un documento di prosa: misura la CURA, non la MALATTIA — è la forma di AR-128, dove scrivere «chargeback» in un .md chiudeva il difetto e il sensore non c'era comunque",
    };
  }
  return { ok: true, motivo: null };
}

/** Un sintomo che legge un dato prodotto dalla macchina, o che fa rispondere la macchina di sé. */
export const FORTE = "forte";
/** Un sintomo che conta occorrenze nel codice: misurabile, ma può contare la parola invece della cosa. */
export const DEBOLE = "debole";

/** Le forme che leggono ciò che la macchina produce, invece di cercare come è scritta. */
const LEGGE_UN_DATO = /(auto-coscienza\/|\.json|^\s*node\s+cervello\/)/;

/**
 * Quanto pesa questo metro.
 *
 * Nato misurando: `grep -l chargeback cervello/*.mjs` restituisce 7, e sembra dire «ci sono
 * 7 sensori per le contestazioni». Non è vero: dice che 7 file NOMINANO quella parola, spesso
 * dentro un commento che spiega perché il sensore manca. Anche sul codice, il grep misura spesso
 * la parola e non la cosa.
 *
 * La regola ③ blocca solo il caso indifendibile (la parola dentro la prosa). Questo non blocca
 * niente: dichiara. Un sintomo debole vale — è comunque infinitamente meglio del nulla — ma il
 * referto lo scrive accanto al verdetto, così un «guarito» misurato debolmente non si legge come
 * un «guarito» misurato leggendo il dato vero. Nascondere questa differenza sarebbe rifare, un
 * piano più su, esattamente la malattia che stiamo curando.
 */
export function forzaSintomo(misura) {
  const m = String(misura || "");
  if (CERCA_TESTO.test(m) && !LEGGE_UN_DATO.test(m)) return DEBOLE;
  return FORTE;
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ IL VERDETTO — dove «non ha girato» non diventa mai «sano»
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Che cosa dice l'osservazione appena fatta.
 *
 * Riceve i FATTI (l'uscita del comando, il suo codice, l'eventuale errore) e non li va a prendere:
 * è così che un test può provare ogni ramo, compresi quelli che nella realtà capitano una volta
 * l'anno — il comando che non esiste, l'uscita che non è un numero, lo script che esplode.
 */
export function verdettoSintomo({ sintomo, uscita, codice, errore } = {}) {
  const forma = sintomoValido(sintomo);
  if (!forma.valido) return { esito: NON_MISURATO, valore: null, perche: forma.motivo };

  const onesta = misuraLaMalattia(sintomo.misura);
  if (!onesta.ok) return { esito: NON_MISURATO, valore: null, perche: onesta.motivo };

  if (errore) return { esito: NON_MISURATO, valore: null, perche: `la misura non è girata: ${errore}` };

  // ⚠️ Il codice d'uscita NON decide il verdetto, e non è una svista.
  //
  // `grep -c` esce 1 quando conta zero. Se leggessi il codice come «errore», ogni malattia
  // completamente assente diventerebbe «non misurata» — e ogni guarigione vera sparirebbe nella
  // colonna dei buchi. Quello che conta è se ha stampato un numero. Il codice serve solo a
  // spiegare il silenzio: nessun numero E codice diverso da zero significa che è esploso davvero.
  const valore = numeroDa(uscita);
  if (valore === null) {
    const coda = codice === 0 || codice === undefined ? "" : ` (uscita in codice ${codice})`;
    return { esito: NON_MISURATO, valore: null, perche: `la misura non ha stampato un numero${coda}` };
  }

  if (soddisfa(valore, sintomo.rotto_se)) {
    return { esito: ROTTO, valore, perche: `misurato ${valore}: la malattia si riproduce` };
  }
  const [op] = Object.keys(sintomo.rotto_se);
  return {
    esito: SANO,
    valore,
    perche: `misurato ${valore}, alla nascita era ${sintomo.alla_nascita} (rotto se ${op} ${sintomo.rotto_se[op]}): il sintomo non si riproduce più`,
  };
}

/**
 * L'ultimo numero stampato dal comando.
 *
 * L'ULTIMO e non il primo: gli script della casa stampano righe di contesto e chiudono col conto.
 * Prendere il primo numero significherebbe leggere un anno da un timbro di data.
 */
export function numeroDa(uscita) {
  if (typeof uscita === "number" && Number.isFinite(uscita)) return uscita;
  const righe = String(uscita ?? "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  for (let i = righe.length - 1; i >= 0; i--) {
    const m = /^-?\d+(\.\d+)?$/.exec(righe[i]);
    if (m) return Number(righe[i]);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ IL CONTO — quello che Nicola legge
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Il riassunto di una tornata di osservazioni.
 *
 * `non_misurati` sta nel conto e non viene nascosto: è il numero che dice quanto di ciò che
 * chiamiamo «difetti aperti» è in realtà ignoto. Finché è alto, ogni altra cifra è parziale — e
 * dirlo è il minimo che questo strumento deve a chi lo legge.
 */
/**
 * Il verdetto su un difetto con PIÙ CLAUSOLE — e basta una clausola rotta perché sia rotto.
 *
 * ⚠️ IL CASO CHE HA COSTRETTO A SCRIVERLO, il 16/8, mezz'ora dopo il primo referto vero.
 *
 * AR-216 chiede tre cose: (a) cancellare la cartella doppia dei quaderni, (b) far cercare al
 * Pannello anche le cartelle fuori dal vault, (c) una regola di processo. Il primo sintomo che ho
 * scritto misurava solo la (a) — le cartelle sono tornate una — e lo strumento ha stampato
 * «il sintomo non si riproduce più». Guardando il codice a mano: la ricerca del Pannello legge
 * ancora solo dentro il vault, e i quaderni vivi stanno alla radice. La (b) non è mai stata fatta.
 *
 * Cioè: al primo referto della sua vita, questo strumento ha prodotto un falso guarito. Ed è la
 * malattia che era nato per curare — un metro che dice verde su una cosa che è rotta. La regola
 * ⑥ del mansionario lo dice da prima: «la clausola che salta è quasi sempre l'ultima, perché
 * arriva quando il lavoro sembra finito».
 *
 * Da qui: un difetto a più clausole vuole una misura per clausola, e SANO lo diventa solo se
 * TUTTE tacciono. Una sola che parla, e il difetto è rotto. Un non-misurato fra le clausole non
 * si arrotonda a sano: l'insieme resta non misurato, perché nessuno sa cosa dicano le altre.
 */
export function verdettoDelDifetto(osservazioni = []) {
  if (!osservazioni.length) {
    return { esito: NON_MISURATO, perche: "nessuna clausola osservata", clausole: [] };
  }
  const rotta = osservazioni.find((o) => o.esito === ROTTO);
  if (rotta) {
    const quante = osservazioni.filter((o) => o.esito === ROTTO).length;
    const coda = osservazioni.length > 1 ? ` (${quante} clausole su ${osservazioni.length} ancora rotte)` : "";
    return { esito: ROTTO, perche: rotta.perche + coda, clausole: osservazioni };
  }
  const cieca = osservazioni.find((o) => o.esito === NON_MISURATO);
  if (cieca) {
    return {
      esito: NON_MISURATO,
      perche: `una clausola non si è lasciata misurare (${cieca.perche}): le altre tacciono, ma questa no`,
      clausole: osservazioni,
    };
  }
  const coda = osservazioni.length > 1 ? ` — tutte e ${osservazioni.length} le clausole tacciono` : "";
  return { esito: SANO, perche: osservazioni[0].perche + coda, clausole: osservazioni };
}

export function contaEsiti(verdetti = []) {
  const c = { rotti: 0, sani: 0, non_misurati: 0, totale: 0 };
  for (const v of verdetti) {
    c.totale++;
    if (v?.esito === ROTTO) c.rotti++;
    else if (v?.esito === SANO) c.sani++;
    else c.non_misurati++;
  }
  c.copertura = c.totale ? Number(((c.rotti + c.sani) / c.totale).toFixed(3)) : 0;
  return c;
}
