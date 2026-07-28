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
// Nessuna dipendenza e nessun I/O: si esegue su testo passato da fuori, così una prova può misurare un
// parco finto invece di com'è il repo adesso.

export const DIFETTO = {
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

/** I difetti che un mansionario può avere per conto suo (erano già qui, restano). */
export function difettiAgente(testo = "") {
  const d = [];
  if (!/##\s*🎓\s*SCHEDA MESTIERE/i.test(testo)) d.push(DIFETTO.SCHEDA_ASSENTE);
  if (!/RUBRICA-LIVELLI/i.test(testo)) d.push(DIFETTO.HOOK_RUBRICA_ASSENTE);
  if (!/scorecard/i.test(testo)) d.push(DIFETTO.SCORECARD_ASSENTE);
  if (!/RITUALE DI FINE/i.test(testo)) d.push(DIFETTO.RITUALE_ASSENTE);
  return d;
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
