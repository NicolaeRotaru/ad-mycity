// 🏪 I CONTI DELLA RADIOGRAFIA DEL SITO — la casa unica di «quanti difetti ha il marketplace».
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «il contatore che cerca nel posto sbagliato e risponde zero»
// ─────────────────────────────────────────────────────────────────────────────
// Il referto del marketplace ha cambiato forma il 18/8/2026. Fino al 29/7 i problemi stavano dentro
// ogni dimensione (`dimensioni[].findings`); dal 18/8 stanno in un elenco unico a parte
// (`problemi[]`), e le dimensioni portano solo i contatori. Il vocabolario degli stati è cambiato
// insieme alla forma: prima `chiuso`, oggi `riparato` e `gia_riparato_prima`.
//
// Chi contava non se n'è accorto, perché cercare dove non c'è niente non è un errore: è uno zero.
//   · `cervello/allinea-scan-cantiere.mjs` scriveva `findings_aperti: 0` — e il Pannello mostra
//     `sync_scan.findings_aperti ?? meta.findings`, dove **`0` non è nullish e vince su 245**.
//     Cioè: al primo giro dopo il cambio di forma la Cabina sarebbe passata da «245, rosso» a
//     «0, verde» senza che nessuno avesse riparato niente.
//   · la scheda del Pannello disegna `dimensioni[].findings`, quindi da un mese mostra i contatori
//     e **sotto la lista vuota**.
//
// IL CONTO VERO, misurato il 20/8/2026 sul referto del 18/8: 245 problemi, di cui **29 aperti**
// (1 bloccante, 15 gravi, 13 minori), 207 riparati e 9 già a posto quando sono stati ricontrollati.
// La Cabina, negli stessi minuti, diceva «12 bloccanti» in home e «245 problemi» nella pagina.
//
// LA REGOLA CHE RENDE LO ZERO IMPOSSIBILE, ed è il cuore del fix: **il totale dichiarato nel referto
// è il testimone**. Se `meta.findings` dice 245 e io non trovo nessun problema da nessuna parte, non
// ho letto il referto — non l'ho trovato riparato. In quel caso i conti restano `null` col motivo,
// mai zero. Uno zero è un fatto; un errore di lettura travestito da zero è la bugia peggiore che la
// Cabina possa dire (è la stessa lezione di `cervello/stati-cantiere.mjs`, pagata sul cantiere).
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun `process.env`, nessun orologio. Tutto arriva
// dagli argomenti, così una prova lo può ESEGUIRE sul referto vero e sui casi limite.
//
// Il gemello TypeScript è `pannello/src/lib/radiografia-marketplace-conti.ts` (Next.js non importa
// da `cervello/`). Non è libero: `cervello/test/il-conto-del-sito-che-dice-zero.test.mjs` confronta
// le due case campo per campo, sul referto vero e sui limiti.

// ═══════════════════════════════════════════════════════════════════════════
// ① IL VOCABOLARIO — quali stati vogliono dire «non è più lavoro»
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gli stati che chiudono un problema del sito. Sono TRE perché il referto ne usa tre:
 *   · `chiuso`             — la parola della forma vecchia (fino al 29/7), tenuta per non perdere i referti d'archivio
 *   · `riparato`           — riparato in un lotto, con la sua nota
 *   · `gia_riparato_prima` — trovato già a posto quando è stato ricontrollato: non è lavoro, ma non è nemmeno una riparazione di questo lotto
 * Tutto il resto è APERTO, compreso uno stato che non so nominare: un'etichetta nuova non deve poter
 * far sparire un difetto dal conto (è esattamente com'era sparito il terzo stato del cantiere).
 */
export const STATI_CHIUSI = Object.freeze(["chiuso", "riparato", "gia_riparato_prima"]);

/** L'etichetta che il vuoto porta nel conto per stato. Anche il niente ha un nome, così si vede. */
export const STATO_ASSENTE = "(senza stato)";

/** Le severità che so nominare. Quelle che non conosco NON spariscono: finiscono in `altre`. */
export const SEVERITA_NOTE = Object.freeze(["bloccante", "grave", "minore"]);

/** L'etichetta della severità mancante. Un problema senza gravità resta un problema. */
export const SEVERITA_ASSENTE = "(senza gravita)";

/** Lo stato di un problema, normalizzato: senza spazi attorno, e con un nome anche quando manca. */
export function statoDi(p) {
  return String(p?.stato ?? "").trim().toLowerCase() || STATO_ASSENTE;
}

/** Questo problema è chiuso? La porta unica: chi conta, chi disegna e chi giudica passano da qui. */
export function eChiuso(p) {
  return STATI_CHIUSI.includes(statoDi(p));
}

/** Questo problema è ancora lavoro? Tutto ciò che non è chiuso — compreso ciò che non so nominare. */
export function eAperto(p) {
  return !eChiuso(p);
}

/** La gravità di un problema, normalizzata. */
export function severitaDi(p) {
  return String(p?.severita ?? "").trim().toLowerCase() || SEVERITA_ASSENTE;
}

/**
 * Dove sta il problema, qualunque nome porti il campo.
 *
 * La forma vecchia lo chiamava `dove`, la nuova `file`. È lo stesso dato — il punto del codice — e
 * la scheda ne disegna uno solo: senza questa riga la colonna «Dove» del Pannello resta vuota su
 * tutti i referti dal 18/8 in poi.
 */
export function doveDi(p) {
  return p?.dove ?? p?.file ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════
// ② DOVE SONO I PROBLEMI — le due forme storiche, e il caso «non lo so vedere»
// ═══════════════════════════════════════════════════════════════════════════

/** Quanti problemi dichiara di avere il referto, se lo dichiara. È il testimone contro lo zero. */
export function dichiaratiDalReferto(digest) {
  const n = digest?.meta?.findings;
  return Number.isFinite(n) ? n : null;
}

/**
 * I problemi del referto, da qualunque forma arrivino.
 *
 * Torna `forma` così chi legge sa da dove viene la risposta, e `problemi: null` quando la forma non
 * la riconosco — perché una lista che non so leggere non è una lista vuota.
 */
export function problemiDelReferto(digest) {
  const dichiarati = dichiaratiDalReferto(digest);

  // ⚠️ PRIMA DI TUTTO: esiste un audit del sito che nessuno ha saputo leggere?
  // Il 22/8/2026 la Cabina diceva «0 problemi aperti» mentre in consegne/design/ c'erano 208 problemi
  // verificati, due dei quali impedivano a ogni negoziante di caricare la copertina della vetrina:
  // il digest guardava una cartella sola, e non guardare non e' un errore, e' uno zero. Adesso il
  // digest dichiara in `fonti_non_lette` ogni referto che non sa leggere, e finche' quell'elenco non
  // e' vuoto QUI non esce nessun numero: un conto parziale spacciato per intero e' la bugia che
  // questo file esiste per impedire.
  const nonLette = Array.isArray(digest?.fonti_non_lette) ? digest.fonti_non_lette.filter(Boolean) : [];
  if (nonLette.length) {
    return {
      forma: "incompleto",
      problemi: null,
      dichiarati,
      motivo:
        `${nonLette.length} referto/i di audit del sito non sono entrati in questo conto ` +
        `(${nonLette.map((r) => r?.file ?? "?").join(", ")}): il numero sarebbe parziale, e un parziale ` +
        `presentato come totale è peggio di un non-letto. Dichiara la fonte in cervello/referti-sito.mjs ` +
        `e rilancia node cervello/radiografia-marketplace-digest.mjs.`,
    };
  }

  // Forma nuova (dal 18/8): elenco unico, ogni voce porta la sua dimensione.
  if (Array.isArray(digest?.problemi) && digest.problemi.filter(Boolean).length) {
    return { forma: "elenco", problemi: digest.problemi.filter(Boolean), dichiarati, motivo: null };
  }

  // Forma vecchia (fino al 29/7): i problemi stanno dentro le dimensioni.
  const daDimensioni = [];
  if (Array.isArray(digest?.dimensioni)) {
    for (const d of digest.dimensioni) {
      if (!Array.isArray(d?.findings)) continue;
      for (const f of d.findings) {
        if (f) daDimensioni.push({ ...f, dimensione: f.dimensione ?? d.chiave ?? d.key ?? null });
      }
    }
  }
  if (daDimensioni.length) {
    return { forma: "dimensioni", problemi: daDimensioni, dichiarati, motivo: null };
  }

  // Nessun problema da nessuna parte. Qui si decide fra «zero davvero» e «non lo so vedere», e lo
  // decide il referto stesso: se dichiara di averne trovati, la lista c'è e io non l'ho trovata.
  if (dichiarati === 0) {
    return { forma: "vuoto", problemi: [], dichiarati, motivo: null };
  }
  return {
    forma: "illeggibile",
    problemi: null,
    dichiarati,
    motivo:
      dichiarati == null
        ? "il referto non ha né un elenco di problemi né un totale dichiarato: non ho potuto contare (e un non-contato non è uno zero)"
        : `il referto dichiara ${dichiarati} problemi ma non ne trovo nessuno né in «problemi» né in «dimensioni[].findings»: la forma del file è cambiata e questo contatore non la sa leggere (e un non-letto non è uno zero)`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ③ IL CONTO — con tutti i rami, e `null` quando non ho potuto leggere
// ═══════════════════════════════════════════════════════════════════════════

function contoVuotoPerSeverita() {
  return { bloccante: 0, grave: 0, minore: 0, altre: 0 };
}

/**
 * IL CONTO DEI DIFETTI DEL SITO — quello che la Cabina mostra e che il giro riallinea.
 *
 * ① `aperti` è tutto ciò che non è chiuso, mai «totale meno i riparati che conosco»
 * ② la somma dei rami DEVE fare il totale: una severità mai vista prima finisce in `altre` invece di
 *    aprire un buco dove i problemi scompaiono
 * ③ non letto non è zero: senza una lista riconoscibile i conti restano `null` col motivo
 * ④ `divergenza_dal_dichiarato` misura la distanza fra i problemi che ho contato e quelli che il
 *    referto dice di avere. Se non è zero il file ha smesso di essere coerente con sé stesso, e si
 *    vede invece di essere assorbito in silenzio.
 */
export function contoMarketplace(digest) {
  const { forma, problemi, dichiarati, motivo } = problemiDelReferto(digest);
  if (problemi == null) {
    return {
      letto: false,
      motivo,
      forma,
      dichiarati,
      divergenza_dal_dichiarato: null,
      totale: null,
      chiusi: null,
      aperti: null,
      aperti_per_severita: null,
      totale_per_severita: null,
      per_stato: null,
    };
  }

  const per_stato = {};
  const aperti_per_severita = contoVuotoPerSeverita();
  const totale_per_severita = contoVuotoPerSeverita();
  let chiusi = 0;
  let aperti = 0;

  for (const p of problemi) {
    const stato = statoDi(p);
    per_stato[stato] = (per_stato[stato] ?? 0) + 1;
    const sev = severitaDi(p);
    const ramo = SEVERITA_NOTE.includes(sev) ? sev : "altre";
    totale_per_severita[ramo] += 1;
    // «Chiuso» lo decide `eChiuso`, la porta unica di questo file — non un confronto in più scritto
    // qui, che sarebbe la seconda definizione della stessa parola dentro lo stesso modulo.
    if (eChiuso(p)) chiusi += 1;
    else {
      aperti += 1;
      aperti_per_severita[ramo] += 1;
    }
  }

  return {
    letto: true,
    motivo: null,
    forma,
    dichiarati,
    divergenza_dal_dichiarato: dichiarati == null ? null : problemi.length - dichiarati,
    totale: problemi.length,
    chiusi,
    aperti,
    aperti_per_severita,
    totale_per_severita,
    per_stato,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ④ LE DIMENSIONI DA DISEGNARE — una forma sola per la Cabina, da entrambe le forme del referto
// ═══════════════════════════════════════════════════════════════════════════

/** I campi che la scheda del Pannello LEGGE di un problema. Il resto è peso morto sulla rete. */
export const CAMPI_PROBLEMA = Object.freeze([
  "titolo",
  "severita",
  "descrizione",
  "impatto",
  "fix",
  "dove",
  "stato",
  "nota_riparazione",
]);

/**
 * Le dimensioni con dentro i loro problemi, nella forma che la scheda sa disegnare.
 *
 * Di base torna **solo gli aperti**: i chiusi la scheda li filtrerebbe via all'arrivo, e sul referto
 * del 18/8 sono 216 su 245 — cioè 216 schede che attraversano la rete per essere buttate. Di loro
 * resta il numero (`problemi_chiusi`), perché «0 aperti» e «0 aperti, 12 riparati» non raccontano la
 * stessa storia.
 *
 * Torna `null` quando il referto non è leggibile: una lista vuota direbbe «nessun problema», che è
 * la bugia che questo file esiste per impedire.
 */
export function dimensioniDaDisegnare(digest, { soloAperti = true } = {}) {
  const { problemi } = problemiDelReferto(digest);
  if (problemi == null) return null;

  // L'ordine e i nomi leggibili vengono dalle dimensioni dichiarate; una dimensione che compare solo
  // nei problemi non si perde: si aggiunge in coda con la sua chiave.
  const ordine = [];
  const perChiave = new Map();
  const aggiungi = (chiave, nome) => {
    const k = String(chiave ?? "").trim() || "(senza area)";
    if (!perChiave.has(k)) {
      perChiave.set(k, { key: k, nome: nome ?? null, findings: [], problemi_chiusi: 0 });
      ordine.push(k);
    }
    return perChiave.get(k);
  };

  if (Array.isArray(digest?.dimensioni)) {
    for (const d of digest.dimensioni) {
      if (!d) continue;
      aggiungi(d.chiave ?? d.key, d.nome ?? null);
    }
  }

  for (const p of problemi) {
    const voce = aggiungi(p?.dimensione, null);
    if (eChiuso(p)) {
      voce.problemi_chiusi += 1;
      if (soloAperti) continue;
    }
    const snello = {};
    for (const k of CAMPI_PROBLEMA) if (p?.[k] != null) snello[k] = p[k];
    const dove = doveDi(p);
    if (dove != null) snello.dove = dove;
    voce.findings.push(snello);
  }

  // Una dimensione senza niente da mostrare e senza niente di chiuso non è una riga: è rumore.
  return ordine
    .map((k) => perChiave.get(k))
    .filter((d) => d.findings.length || d.problemi_chiusi);
}
