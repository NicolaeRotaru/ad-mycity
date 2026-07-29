#!/usr/bin/env node
// AR-105 · AR-108 — «non configurato» è una parola sola per due situazioni opposte.
//
// Un sensore spento può esserlo per due motivi che non si somigliano per niente:
//
//   · **decisione** — Nicola ha scelto di non usarlo. È uno stato finale, sano, e va bene per sempre.
//   · **inerzia** — nessuno gliel'ha mai chiesto. È un buco che la macchina non sa di avere: il
//     sensore è costruito, il codice c'è, manca una riga di configurazione e nessuno la reclama.
//
// Il registro li scriveva uguali. Risultato misurato il 28/7: `sito_uptime` e `pannello_uptime` sono
// rimasti spenti **163 giri** senza che una sola card lo chiedesse a Nicola — non per una scelta, ma
// perché «non_configurato» sembra uno stato normale e nessuno lo guarda due volte.
//
// (Oggi quei due sono accesi, dal 18/7. Il difetto è stato scritto quando erano ancora spenti, e la
// sua descrizione è invecchiata: 10 sensori su 11 sono ok, resta solo `telegram_bot`. Ma il buco che
// li ha tenuti spenti mezzo anno è ancora lì, e riaprirà col prossimo sensore nuovo.)
//
// La regola: **uno spento senza un perché dichiarato è un buco, non uno stato.** E si chiede a
// Nicola UNA volta sola: una card che si ripete a ogni giro è una card che si impara a ignorare.
//
// Nessuna dipendenza, nessun orologio interno, nessun disco.

/** Perché un sensore è spento. Il terzo non è un motivo: è l'assenza di un motivo. */
export const MOTIVO = {
  DECISIONE: "decisione", // Nicola ha scelto di non usarlo: stato finale, sano
  DA_CHIEDERE: "da-chiedere", // sappiamo che non gliel'abbiamo ancora chiesto, e la card è in coda
  INERZIA: "inerzia", // nessuno l'ha mai chiesto e nessuno lo sta chiedendo: è il buco
};

/** Gli stati che il registro di cecità sa scrivere. `spento` non è uno di questi: è una lettura. */
export const SPENTI = new Set(["non_configurato", "cieco", "non_verificato"]);

/**
 * Il motivo dichiarato per un sensore, letto dal registro dei motivi.
 * Se il sensore non c'è nel registro, il motivo è `inerzia` — non «boh»: è precisamente il caso in
 * cui nessuno ha deciso niente, ed è quello che questo lotto esiste per far emergere.
 */
export function motivoDi(nome, registro = {}) {
  const voce = registro?.[String(nome)];
  const m = voce && typeof voce === "object" ? voce.motivo : voce;
  return Object.values(MOTIVO).includes(m) ? m : MOTIVO.INERZIA;
}

/**
 * **La decisione.** Questo sensore ha bisogno di Nicola?
 *
 *   · acceso                       → no, e non c'è niente da dire
 *   · spento per decisione         → no: ha già deciso, chiederglielo di nuovo è rumore
 *   · spento, card già in coda      → no: gliel'abbiamo chiesto, aspetta lui
 *   · spento per inerzia           → **sì**, ed è l'unico caso che deve alzare la mano
 *
 * Il `cieco` è un caso a parte e non è di questo lotto: un sensore che era acceso e non risponde più
 * è un guasto, non una configurazione mancante — lo gestisce già la sentinella della cecità.
 */
export function serveNicola({ stato, motivo = MOTIVO.INERZIA, cardInCoda = false } = {}) {
  if (!SPENTI.has(String(stato))) return { serve: false, perche: "il sensore è acceso" };
  if (String(stato) === "cieco") {
    return { serve: false, perche: "è cieco, non spento: è un guasto e lo vede la sentinella cecità" };
  }
  if (motivo === MOTIVO.DECISIONE) return { serve: false, perche: "spento per scelta di Nicola: è uno stato finale" };
  if (cardInCoda || motivo === MOTIVO.DA_CHIEDERE) {
    return { serve: false, perche: "già chiesto: la card è in coda, tocca a lui" };
  }
  return {
    serve: true,
    perche: "spento e nessuno ha mai chiesto se debba restarlo: è un buco, non una decisione",
  };
}

/**
 * Il quadro completo dei sensori spenti, diviso per motivo. Serve al guardiano e alla card.
 * `da_chiedere` è la lista che genera UNA card; le altre due sono informative.
 */
export function quadroSpenti(sensori = {}, registro = {}) {
  const perMotivo = { decisione: [], "da-chiedere": [], inerzia: [], guasti: [] };
  for (const [nome, v] of Object.entries(sensori || {})) {
    const stato = v?.stato;
    if (!SPENTI.has(String(stato))) continue;
    if (String(stato) === "cieco") {
      perMotivo.guasti.push(nome);
      continue;
    }
    perMotivo[motivoDi(nome, registro)].push(nome);
  }
  return {
    accesi: Object.values(sensori || {}).filter((v) => v?.stato === "ok").length,
    totale: Object.keys(sensori || {}).length,
    ...perMotivo,
    da_chiedere_ora: perMotivo.inerzia,
  };
}

/** Contratto dei guardiani (AR-322): 0 tutto dichiarato · 1 c'è un buco · 2 non ho potuto leggere. */
export function codiceUscita({ cieco = 0, senzaMotivo = 0 } = {}) {
  if (cieco > 0) return 2;
  return senzaMotivo > 0 ? 1 : 0;
}
