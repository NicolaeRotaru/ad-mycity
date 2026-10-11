#!/usr/bin/env node
// AR-129 · AR-287 · AR-289 — il metro che non poteva dire di no.
//
// `stampo-check` dichiara «120/120 senior completi». Misurato il 28/7, dietro quel 120/120 c'è:
//
//   · **72 quaderni su 120 non hanno MAI una riga ESITO.** Il guardiano contava `existsSync`, e un
//     foglio bianco esiste. (AR-287)
//   · **la soglia dei kit era 5.200 byte, il kit più piccolo ne ha 5.282**: 82 byte di margine su un
//     parco che ha mediana 17.649. Nessun kit poteva fallire — la soglia era stata scelta per far
//     passare i file esistenti, non per misurare una profondità. (AR-129)
//   · **nove kit del cluster banche/legale hanno la stessa galleria copiata**, e la stessa intestazione
//     «STRATO 5» due volte nello stesso file. Promossi lo stesso. (AR-289)
//
// Tre misure indipendenti — spessore, fotocopia, struttura — cadono sugli **stessi 9-10 file**. Non
// sono tre debiti: è uno solo, e il metro non lo vedeva.
//
// ── Come è tarato, e perché così ────────────────────────────────────────────
// Un cancello che parte rosso su mezzo parco viene disattivato entro la settimana; uno che parte verde
// si accorge del primo che sporca. Quindi: il debito di oggi si DICHIARA, per nome e con la data, in
// `cervello/stampo-baseline.json`; il guardiano fallisce quando compare un nome NUOVO. Per nome e non
// per conteggio, perché a parità di numero «uno riparato + uno nuovo» è un peggioramento travestito da
// pareggio — e un'esenzione da un punteggio può solo abbassarlo, mai alzarlo.
//
// La soglia dello spessore è **relativa alla mediana del parco**, non un numero fisso: se i kit
// migliorano, la soglia sale da sola. È l'opposto di un pavimento tarato sul risultato voluto.
//
// Nessuna dipendenza esterna e nessun I/O (l'unico import è il modulo fratello `mansionario-misure.mjs`,
// puro anche lui): si esegue su testo passato da fuori, così una prova può misurare un parco finto
// invece di com'è il repo adesso.

// AR-436 — le misure di SOSTANZA del mansionario (modelli, loop, galleria, trappole, carburante)
// vivono in un file loro, puro come questo, così una prova le può eseguire su un mansionario finto.
import { DIFETTO_SOSTANZA, difettiSostanza, parteDiMestiere } from "./mansionario-misure.mjs";

export { DIFETTO_SOSTANZA, difettiSostanza, misureMansionario, parteDiMestiere } from "./mansionario-misure.mjs";

export const DIFETTO = {
  ...DIFETTO_SOSTANZA,
  SCHEDA_ASSENTE: "scheda_mestiere_assente",
  HOOK_RUBRICA_ASSENTE: "hook_rubrica_assente",
  SCORECARD_ASSENTE: "scorecard_assente",
  RITUALE_ASSENTE: "rituale_fine_assente",
  KIT_ASSENTE: "kit_assente",
  KIT_SENZA_SEZIONE_E: "kit_senza_sezione_E",
  KIT_SOTTILE: "kit_sottile",
  KIT_FOTOCOPIA: "kit_fotocopia",
  KIT_STRUTTURA_ROTTA: "kit_struttura_rotta",
  QUADERNO_ASSENTE: "quaderno_assente",
  QUADERNO_VUOTO: "quaderno_vuoto",
  QUADERNO_FERMO: "quaderno_fermo",
  QUADERNO_DUE_CASE: "quaderno_due_case",
};

/** Frazione della mediana sotto cui un kit è «sottile». 0.4 → sul parco del 28/7 boccia i 10 del cluster. */
export const FRAZIONE_MEDIANA = 0.4;
/** Giorni oltre i quali un quaderno con righe è comunque fermo. */
export const GIORNI_FERMO = 30;
/** Un blocco più corto di così è troppo generico per chiamarlo fotocopia (titoli, righe di legenda). */
export const BLOCCO_MIN_CHAR = 200;
/** Due kit che condividono un blocco possono essere parenti; tre sono uno stampo incollato. */
export const FOTOCOPIA_MIN_KIT = 3;

export function mediana(numeri = []) {
  const v = [...numeri].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!v.length) return 0;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
}

/**
 * La soglia dello spessore, RELATIVA al parco. Un pavimento fisso invecchia nel verso sbagliato: si
 * sceglie una volta sotto il file più piccolo e da lì non boccia più niente, per sempre.
 */
export function sogliaSottile(dimensioni = [], frazione = FRAZIONE_MEDIANA) {
  return Math.round(mediana(dimensioni) * frazione);
}

/** I paragrafi «sostanziali» di un testo, normalizzati, per confrontarli fra file diversi. */
export function blocchiDi(testo = "", minChar = BLOCCO_MIN_CHAR) {
  return String(testo || "")
    .split(/\n\s*\n/)
    .map((b) => b.trim().replace(/\s+/g, " "))
    .filter((b) => b.length >= minChar);
}

/**
 * I kit che condividono blocchi identici con almeno `minKit` altri. Torna una mappa nome → quanti
 * blocchi condivisi, così il rapporto può dire QUANTO è copiato e non solo che lo è.
 */
export function fotocopie(kitPerNome = {}, { minChar = BLOCCO_MIN_CHAR, minKit = FOTOCOPIA_MIN_KIT } = {}) {
  const dove = new Map();
  for (const [nome, testo] of Object.entries(kitPerNome)) {
    for (const b of blocchiDi(testo, minChar)) {
      if (!dove.has(b)) dove.set(b, new Set());
      dove.get(b).add(nome);
    }
  }
  const colpiti = {};
  for (const [, nomi] of dove) {
    if (nomi.size < minKit) continue;
    for (const n of nomi) colpiti[n] = (colpiti[n] || 0) + 1;
  }
  return colpiti;
}

/** I numeri di STRATO che compaiono come intestazione, nell'ordine in cui compaiono. */
export function stratiDi(testo = "") {
  return [...String(testo || "").matchAll(/^#+\s.*STRATO\s+(\d)/gm)].map((m) => m[1]);
}

// ── La clausola di AR-129 che ho ESEGUITO e poi tolto, misurando ────────────
// Il fix chiedeva, in alternativa o in aggiunta alla soglia relativa, un controllo strutturale:
// «presenza sostanziale di STRATO 3/4/5/6 + GALLERIA con >=2 esempi». L'ho scritto, e poi l'ho
// misurato sul parco: **tutti e 120 i kit hanno gli strati 3-4-5-6** e **tutti hanno almeno 2 esempi
// in galleria** (minimo esatto 2, mediana 6). Sarebbero stati due cancelli incapaci di bocciare
// chiunque — cioè esattamente il difetto che AR-129 descrive, riscritto con altre parole.
// (La prima stesura contava solo le righe «- ✅»: accusava 7 kit che gli esempi ce li hanno, scritti
// sotto un'intestazione «## ✅ GOLD». Un metro sbagliato che accusa è peggio di nessun metro.)
// Dei tre controlli strutturali proposti resta l'unico che discrimina davvero: l'intestazione di
// strato duplicata, 9 kit su 120.

/** Una stessa intestazione di strato due volte nello stesso file: il kit è stato incollato male. */
export function stratiDuplicati(testo = "") {
  const visti = new Set();
  const doppi = new Set();
  for (const n of stratiDi(testo)) {
    if (visti.has(n)) doppi.add(n);
    visti.add(n);
  }
  return [...doppi];
}

/**
 * Le date degli ESITO veri di un quaderno.
 * Solo righe di elenco che iniziano con «- AAAA-MM-GG»: la riga «Formato: … atteso→reale …» del
 * modello contiene le stesse parole di un esito e ha ingannato la prima misura che ho fatto io.
 */
export function esiti(testoQuaderno = "") {
  return String(testoQuaderno || "")
    .split("\n")
    .map((r) => (r.match(/^-\s+(\d{4}-\d{2}-\d{2})/) || [])[1])
    .filter(Boolean);
}

/**
 * L'ultimo ESITO = la data PIÙ ALTA, non l'ultima riga del file.
 * `chiusura-loop` scrive in testa alla sezione (il più recente per primo): leggere l'ultima riga dà la
 * riga più VECCHIA e dichiara fermo un quaderno scritto un minuto fa. Errore commesso il 28/7 alle
 * 16:00, mentre misuravo questo stesso difetto.
 */
export function ultimoEsito(testoQuaderno = "") {
  const d = esiti(testoQuaderno).sort();
  return d.length ? d[d.length - 1] : null;
}

/** vuoto | fermo | vivo — un foglio bianco non è «completo», ed è la metà del difetto AR-287. */
export function statoQuaderno(testo, { adessoIso, giorni = GIORNI_FERMO } = {}) {
  if (testo == null) return { stato: "assente", difetto: DIFETTO.QUADERNO_ASSENTE, ultimo: null };
  const ultimo = ultimoEsito(testo);
  if (!ultimo) return { stato: "vuoto", difetto: DIFETTO.QUADERNO_VUOTO, ultimo: null };
  const gg = Math.floor((Date.parse(`${adessoIso}T12:00:00Z`) - Date.parse(`${ultimo}T12:00:00Z`)) / 86400000);
  if (Number.isFinite(gg) && gg > giorni) return { stato: "fermo", difetto: DIFETTO.QUADERNO_FERMO, ultimo, giorni: gg };
  return { stato: "vivo", difetto: null, ultimo, giorni: Number.isFinite(gg) ? gg : null };
}

/** I difetti di un singolo kit. `bytes` arriva da fuori: qui non si tocca il disco. */
export function difettiKit({ testo, bytes, soglia, blocchiCopiati = 0 } = {}) {
  const d = [];
  if (testo == null) return [DIFETTO.KIT_ASSENTE];
  if (!/\n##\s*E\./.test(testo)) d.push(DIFETTO.KIT_SENZA_SEZIONE_E);
  if (Number.isFinite(bytes) && Number.isFinite(soglia) && soglia > 0 && bytes < soglia) d.push(DIFETTO.KIT_SOTTILE);
  if (blocchiCopiati > 0) d.push(DIFETTO.KIT_FOTOCOPIA);
  if (stratiDuplicati(testo).length) d.push(DIFETTO.KIT_STRUTTURA_ROTTA);
  return d;
}

/**
 * I difetti di un singolo mansionario.
 *
 * AR-436 — LE PRIME QUATTRO RIGHE NON POTEVANO BOCCIARE NESSUNO, e per costruzione. Cercavano i
 * quattro titoli che il template di rollout incollava in ogni file: misurato il 22/8 sul parco vero,
 * **120 su 120** li avevano tutti e quattro. Il metro era nato per certificare la FINE del rollout —
 * «ci sono i titoli?» — e da lì in poi ha continuato a rispondere «120/120 completi» a una domanda
 * che nessuno stava più facendo. Restano, perché un titolo che sparisce è ancora un difetto: ma da
 * soli erano un timbro, non un giudizio.
 *
 * Sotto arrivano le misure di SOSTANZA (`cervello/mansionario-misure.mjs`): contano le voci dentro i
 * titoli invece dei titoli. Col metro nuovo passano **38 mansionari su 120** — e il conto sta in una
 * prova che gira, `cervello/test/metro-mansionari-puo-bocciare.test.mjs`, non in questo commento.
 *
 * @param {string} testo
 * @param {{blocchiCopiati?: number}} [opzioni] `blocchiCopiati` arriva da fuori come per i kit: la
 *   fotocopia è una misura relativa al parco, e un file solo non può vederla (vedi `fotocopieMansionari`).
 */
export function difettiAgente(testo = "", opzioni = {}) {
  const d = [];
  if (!/##\s*🎓\s*SCHEDA MESTIERE/i.test(testo)) d.push(DIFETTO.SCHEDA_ASSENTE);
  if (!/RUBRICA-LIVELLI/i.test(testo)) d.push(DIFETTO.HOOK_RUBRICA_ASSENTE);
  if (!/scorecard/i.test(testo)) d.push(DIFETTO.SCORECARD_ASSENTE);
  if (!/RITUALE DI FINE/i.test(testo)) d.push(DIFETTO.RITUALE_ASSENTE);
  d.push(...difettiSostanza(testo, opzioni));
  return d;
}

/**
 * AR-436 — la caccia alle fotocopie, applicata ai MANSIONARI e non solo ai kit.
 *
 * Si confronta la sola parte di mestiere: la Carta del Dipendente e il doer mode sono identici su
 * tutti e 120 **per progetto**, e misurare il file intero dichiara fotocopia 120 mansionari su 120
 * (misurato). Un metro che boccia tutti e un metro che promuove tutti hanno lo stesso difetto: non
 * distinguono. Sulla sola scheda mestiere, oggi, il parco vero è pulito — zero fotocopie.
 *
 * @param {Record<string,string>} mansionariPerNome
 * @returns {Record<string, number>} nome → quanti blocchi condivisi con altri due o più
 */
export function fotocopieMansionari(mansionariPerNome = {}, opzioni = {}) {
  const soloMestiere = {};
  for (const [nome, testo] of Object.entries(mansionariPerNome)) soloMestiere[nome] = parteDiMestiere(testo);
  return fotocopie(soloMestiere, opzioni);
}

/**
 * Il verdetto. Confronta il quadro con il debito DICHIARATO, **per nome**.
 *
 * A parità di conteggio, «uno riparato e uno nuovo» è un peggioramento: se guardassi il totale
 * passerebbe. E il debito dichiarato può solo restringersi da solo — un nome che non è più in difetto
 * non va tolto dalla lista per far spazio a un altro: va tolto e basta.
 */
export function nuoviRispettoAlDebito(quadro = {}, baseline = {}) {
  const noto = baseline.debito || {};
  const nuovi = [];
  for (const [nome, difetti] of Object.entries(quadro)) {
    const ammessi = new Set(noto[nome] || []);
    for (const d of difetti) if (!ammessi.has(d)) nuovi.push({ nome, difetto: d });
  }
  return nuovi;
}

/**
 * I difetti che possono PEGGIORARE DA SOLI, perché a muoversi è il metro e non l'agente.
 *
 *   · `quaderno_fermo` — matura col CALENDARIO: a 30 giorni dall'ultimo esito un quaderno intatto
 *     cambia stato da solo, senza che nessuno abbia toccato niente.
 *   · `kit_sottile`   — matura con la MEDIANA DEL PARCO: la soglia è il 40% della mediana, quindi un
 *     kit può diventare «sottile» perché GLI ALTRI sono migliorati.
 *
 * Ogni altro difetto, se è nuovo, ha un autore.
 */
export const MATURANO_DA_SOLE = new Set([DIFETTO.QUADERNO_FERMO, DIFETTO.KIT_SOTTILE]);

/**
 * REGRESSIONE o DEBITO INVECCHIATO — la distinzione che questo metro non aveva, e il conto che ha
 * presentato.
 *
 * IL DANNO, misurato. Il debito è dichiarato per NOME e per TIPO: registra QUALI difetti aveva un
 * agente, non DA QUANTO. Il 2026-08-01 tredici quaderni — @ads-performance, @ai-copywriter,
 * @ai-designer, @ai-video, @contabilita, @cro, @dispatch, @dispute, @influencer-partnership,
 * @legale-privacy, @qa, @rider-fleet, @supporto — avevano tutti l'ultimo esito al 2026-07-01 e hanno
 * passato insieme i 30 giorni. Nessuno li ha toccati: il 28/7 (dichiarazione del debito) erano a 27
 * giorni, il 31/7 a 30, il 1/8 a 31. Da quel momento `stampo-check` esce 1, il test
 * `un-quaderno-una-casa` fallisce e **i due workflow della CI sono rossi su main per chiunque** —
 * anche per una PR che tocca due file markdown del vault e nessun quaderno.
 *
 * È la stessa forma che `cancello-lotto` cura da sé: «il tetto separa il debito (misurato, visibile,
 * in calo) dalla regressione (bloccata subito)». Qui quella separazione non c'era, e il registro di
 * questa casa dice già come va a finire: **un cancello sempre rosso viene aggirato al secondo giro,
 * ed è peggio di non averlo.**
 *
 * LA REGOLA: un difetto nuovo è una **regressione** solo se il pezzo PROPRIO dell'agente è
 * peggiorato — righe di esito sparite, kit rimpicciolito. Se il suo dato è intatto e a muoversi è
 * stato il metro attorno, è **debito invecchiato**: si conta, si dichiara, si vede — e non blocca
 * il lavoro di chi non c'entra.
 *
 * COSA NON FA, e va detto: non è un permesso. Gli invecchiati restano nel rapporto con nome e
 * ragione, e la pressione perché rientrino sta dove c'è qualcuno che può agire — la voce «quaderni»
 * della pagella e `chiusura-loop --gate` — non addosso a chi apre la prossima PR.
 *
 * Quando non si può misurare (l'agente non ha il suo valore nella baseline) l'esito è
 * **regressione**, non invecchiamento: cieco non è verde, e il verso sicuro dell'incertezza è
 * quello che blocca.
 *
 * AR-959 — UN QUADERNO CHE ALLA DICHIARAZIONE ERA VUOTO NON È «CIECO». La baseline non ha il suo
 * ultimo esito perché non ne aveva nessuno: il debito lo dice per nome (`quaderno_vuoto`). Quindi
 * si sa esattamente cosa c'era — niente — e niente non può sparire: ogni esito di oggi è nato dopo.
 * Il 10/10 @dpo e @mobile-app, guariti dal vuoto con un esito ciascuno, hanno passato i 30 giorni
 * senza scriverne un secondo e sono usciti «regressione»: la CI era rossa su main per un calendario,
 * la stessa malattia del 1/8 entrata da una porta che la regola non copriva. Prima di questa riga
 * settantadue quaderni avevano quel debito — settanta, tolti quei due — e ognuno avrebbe rifatto la
 * stessa strada trenta giorni dopo il suo primo esito.
 */
export function classificaNuovi(nuovi = [], { ultimoOggi = {}, kitBytesOggi = {}, baseline = {} } = {}) {
  const ultimoAllora = baseline.ultimo_esito || {};
  const bytesAllora = baseline.kit_bytes || {};
  const vuotiAllora = senzaEsitiAllaDichiarazione(baseline);
  const assentiAllora = new Set(
    Object.entries(baseline.debito || {})
      .filter(([, difetti]) => Array.isArray(difetti) && difetti.includes(DIFETTO.QUADERNO_ASSENTE))
      .map(([nome]) => nome)
  );
  const regressioni = [];
  const invecchiati = [];
  for (const n of nuovi) {
    const v = maturatoDaSolo(n, { ultimoOggi, kitBytesOggi, ultimoAllora, bytesAllora, vuotiAllora, assentiAllora });
    (v.invecchiato ? invecchiati : regressioni).push({ ...n, perche: v.perche });
  }
  return { regressioni, invecchiati };
}

/**
 * I quaderni che alla dichiarazione non avevano nessun esito: vuoti (`quaderno_vuoto`) o non ancora
 * nati (`quaderno_assente`). Il debito lo dice per nome. PURA.
 *
 * Il terzo collaudo dell'11/10 ha trovato il secondo caso: un senior nuovo entra nella baseline col
 * quaderno assente, poi il giro gli scrive il primo esito (`chiusura-loop registra` crea il file) e lo
 * pubblica su main. Contando solo i vuoti, quel quaderno risultava «non giudicabile» e la CI diventava
 * rossa per tutti, per una scrittura che nessuna richiesta di unione aveva fatto — e il giro non può
 * ripararla, perché non pubblica `cervello/`. Vuoto o assente, alla dichiarazione non c'era niente:
 * niente può essere sparito.
 */
const SENZA_ESITI = new Set([DIFETTO.QUADERNO_VUOTO, DIFETTO.QUADERNO_ASSENTE]);
export function senzaEsitiAllaDichiarazione(baseline = {}) {
  return new Set(
    Object.entries(baseline.debito || {})
      .filter(([, difetti]) => Array.isArray(difetti) && difetti.some((d) => SENZA_ESITI.has(d)))
      .map(([nome]) => nome)
  );
}

/**
 * AR-959, il pezzo che il collaudo dell'11/10 ha trovato scoperto: la baseline che non saprebbe più
 * giudicare un quaderno.
 *
 * Un quaderno fermo si giudica con una di due cose scritte nella baseline: il suo ultimo esito di
 * allora (`ultimo_esito`), oppure la parola `quaderno_vuoto` nel debito. Quando un quaderno guarisce
 * dal vuoto, è il guardiano stesso a dire di togliere quella parola. Se nello stesso momento nessuno
 * scrive la data, la baseline perde l'unica cosa che sapeva: il quaderno resta verde finché scrive, e
 * trenta giorni dopo il suo ultimo esito esce «regressione» per un calendario. È la CI rossa del
 * 10/10, e il collaudo l'ha rifatta con un orologio finto.
 *
 * Qui il buco diventa rosso IL GIORNO STESSO, quando chi ha tolto la riga è ancora lì e la data da
 * scrivere è una sola: ogni quaderno che ha esiti oggi deve avere nella baseline o la sua data, o la
 * parola «vuoto» o «assente». Vale anche per un senior nuovo: dichiarato assente, il primo esito che
 * gli scrive il giro non accende niente. PURA.
 */
export function baselineCieca({ ultimoOggi = {}, baseline = {} } = {}) {
  const ultimoAllora = baseline.ultimo_esito || {};
  const vuotiAllora = senzaEsitiAllaDichiarazione(baseline);
  return Object.entries(ultimoOggi)
    .filter(([nome, oggi]) => oggi && !ultimoAllora[nome] && !vuotiAllora.has(nome))
    .map(([nome, oggi]) => ({ nome, ultimo_oggi: oggi }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

/** Il cuore della distinzione: il pezzo PROPRIO dell'agente è peggiorato, sì o no? */
function maturatoDaSolo(n, { ultimoOggi, kitBytesOggi, ultimoAllora, bytesAllora, vuotiAllora = new Set(), assentiAllora = new Set() }) {
  // Il quarto collaudo dell'11/10: un quaderno dichiarato assente che nasce senza una riga di esito
  // valida (vuoto, o con un esito scritto senza il trattino — il giro l'ha già fatto) esce «vuoto», un
  // difetto nuovo. Ma da un quaderno che non c'era non può sparire niente: non è una regressione di
  // nessuno, e il giro che l'ha creato non potrebbe nemmeno rimediare, perché non pubblica cervello/.
  if (n.difetto === DIFETTO.QUADERNO_VUOTO && assentiAllora.has(n.nome)) {
    return { invecchiato: true, perche: "alla dichiarazione il quaderno non c'era: adesso c'è, ma senza esiti — da un quaderno che non esisteva non può sparire niente" };
  }
  if (!MATURANO_DA_SOLE.has(n.difetto)) {
    return { invecchiato: false, perche: "questo difetto non matura da solo: se è nuovo, qualcuno l'ha introdotto" };
  }
  if (n.difetto === DIFETTO.QUADERNO_FERMO) {
    const oggi = ultimoOggi[n.nome];
    const allora = ultimoAllora[n.nome];
    if (oggi && !allora && vuotiAllora.has(n.nome)) {
      return {
        invecchiato: true,
        perche: `alla dichiarazione il quaderno era vuoto o non c'era: ogni esito di oggi (l'ultimo è del ${oggi}) è nato dopo, e di quello che c'era allora non può essere sparito niente — a muoversi è stato il calendario`,
      };
    }
    if (!oggi || !allora) {
      return { invecchiato: false, perche: "non so da quando era fermo: senza l'ultimo esito nella baseline non distinguo, e cieco non è verde" };
    }
    return oggi >= allora
      ? { invecchiato: true, perche: `nessun esito è sparito (ultimo ${oggi}, era ${allora}): a muoversi è stato il calendario` }
      : { invecchiato: false, perche: `l'ultimo esito è tornato indietro (${allora} → ${oggi}): sono sparite delle righe` };
  }
  const oggi = kitBytesOggi[n.nome];
  const allora = bytesAllora[n.nome];
  if (!Number.isFinite(oggi) || !Number.isFinite(allora)) {
    return { invecchiato: false, perche: "non so quanto pesava: senza i byte nella baseline non distinguo, e cieco non è verde" };
  }
  return oggi >= allora
    ? { invecchiato: true, perche: `il kit non si è ristretto (${oggi}B, erano ${allora}B): si è alzata la mediana del parco` }
    : { invecchiato: false, perche: `il kit si è ristretto (${allora}B → ${oggi}B)` };
}

/** I nomi del debito dichiarato che NON sono più in difetto: si possono togliere dalla lista. */
export function debitoRiparato(quadro = {}, baseline = {}) {
  const noto = baseline.debito || {};
  const guariti = [];
  for (const [nome, difetti] of Object.entries(noto)) {
    const ora = new Set(quadro[nome] || []);
    for (const d of difetti) if (!ora.has(d)) guariti.push({ nome, difetto: d });
  }
  return guariti;
}

/** Contratto dei guardiani (AR-322): 0 niente di nuovo · 1 un difetto nuovo · 2 non ho potuto misurare. */
export function codiceUscita({ cieco = 0, nuovi = 0 } = {}) {
  if (cieco > 0) return 2;
  return nuovi > 0 ? 1 : 0;
}

/**
 * AR-342 — un quaderno ha UNA casa.
 *
 * Il 29/7 sono saltate fuori quattro copie di quaderni in una seconda cartella
 * (`MyCity-Vault/90-Memoria-AI/memoria-squadra/`) che nessuno aggiornava più: account-negozi era di
 * venti giorni indietro e un dodicesimo del peso. E non erano duplicati — dentro c'erano CINQUE
 * esiti mai arrivati alla casa vera, tre dei quali senza il trattino iniziale, quindi invisibili
 * anche al contatore degli esiti. Una copia vecchia lasciata in giro non è disordine: è una bugia
 * che chi la apre per primo crede aggiornata.
 *
 * Pura: prende `{cartella: [nomi]}` e dice quali nomi vivono in più di una casa. Serve un metro,
 * altrimenti fra un mese la seconda cartella si ripopola da sola e nessuno se ne accorge finché non
 * conta i byte — che è esattamente come è passata inosservata la prima volta.
 *
 * @param {Record<string, string[]>} perCartella
 * @returns {{nome: string, case: string[]}[]} ordinati per nome
 */
export function quaderniInPiuCase(perCartella = {}) {
  const case_ = new Map();
  for (const [cartella, nomi] of Object.entries(perCartella || {})) {
    for (const n of nomi || []) {
      if (!case_.has(n)) case_.set(n, []);
      const dove = case_.get(n);
      if (!dove.includes(cartella)) dove.push(cartella);
    }
  }
  return [...case_.entries()]
    .filter(([, dove]) => dove.length > 1)
    .map(([nome, dove]) => ({ nome, case: dove.slice().sort() }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}
