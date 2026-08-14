// 🔄 QUANDO UNA CASELLA SI RICARICA — e cosa dice quando non ha potuto leggere.
//
// LA MALATTIA (corsia 3 del lotto 41): la regola di freschezza vive dentro il componente. Ogni
// casella decide da sé se ripassare, e la maggioranza decide di no; e quando la lettura fallisce
// mostra il vuoto, che si legge come «non c'è niente».
//
//   AR-236 — dieci caselle caricano SOLO al montaggio: `useEffect(() => { carica(); }, [carica])` e
//     nient'altro. Nessun intervallo, nessun ripasso al ritorno sulla scheda. Ci si è affidati alla
//     rete di segnali del worker, che ha un buco: senza rete di sicurezza a tempo, una casella può
//     restare ferma per ore mostrando numeri di ieri come se fossero di adesso.
//   AR-263 — il quaderno di un senior aperto con la rete che salta mostra un riquadro VUOTO: il
//     `try/finally` senza `catch` spegne la rotellina e non registra il fallimento, lo stato resta
//     `null` e `null` a video è «niente».
//   AR-408 — al primo avvio e a ogni rilascio la pagina si ricarica da sola e butta via quello che
//     stavi scrivendo: `controllerchange` scatta anche al PRIMO controllo (quando la pagina non era
//     controllata da nessuno) e il gestore ricarica sempre, senza guardare se c'è un gesto in corso.
//
// LA RADICE COMUNE: non è mai stato deciso, in un posto solo, **quando un dato si rilegge** e
// **cosa si mostra quando non lo si è potuto leggere**. Finché quelle due decisioni stanno nel JSX,
// la casella nuova nasce già malata perché ricopia la sorella.
//
// 🟢 Modulo puro: nessun React, nessun window, nessuna rete. L'unico stato è il registro dei gesti
// in corso, che è una mappa in memoria e si azzera da un test.
// Prova: cervello/test/c3-casella-ricarica.test.mjs

// ─────────────────────────────────────────────────────────────────────────────
// AR-236 — il ripasso a tempo
// ─────────────────────────────────────────────────────────────────────────────

/** Il ripasso di sicurezza di una casella che mostra dati vivi. Un minuto: si vede e non pesa. */
export const RIPASSO_CASELLA_MS = 60_000;

/** Sotto questo non si scende: martellare il server non è freschezza, è un altro difetto. */
export const RIPASSO_MINIMO_MS = 15_000;

/**
 * Ogni quanto una casella si rilegge da sola.
 *
 * Zero, `undefined`, un numero assurdo: tutti finiscono su un intervallo VALIDO. È il punto della
 * funzione — la casella non ha modo di dichiarare «io non ripasso», che è com'erano tutte e dieci.
 */
export function intervalloRipasso(ms?: number | null): number {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return RIPASSO_CASELLA_MS;
  return Math.max(RIPASSO_MINIMO_MS, Math.round(n));
}

/** Le tre vie con cui un dato torna fresco. Se ne manca una, la casella ha un buco. */
export type ViaDiRipasso = "segnale" | "tempo" | "ritorno";

/**
 * IL CENSIMENTO (la lezione di AR-402: la prova deve cercare l'INSTALLAZIONE, non l'esistenza).
 *
 * Riceve i sorgenti veri delle caselle e dice quali non hanno il ripasso a tempo. `usePanelRefresh`
 * porta con sé segnale + tempo + ritorno; il solo `usePanelSync` porta il segnale e basta.
 */
export function caselleSenzaRipasso(files: { percorso: string; sorgente: string }[]): string[] {
  const fuori: string[] = [];
  for (const f of files || []) {
    const src = String(f?.sorgente || "");
    const conRipasso = /usePanelRefresh\s*\(/.test(src);
    const conIntervallo = /setInterval\s*\(/.test(src);
    if (!conRipasso && !conIntervallo) fuori.push(f.percorso);
  }
  return fuori;
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-263 — il terzo stato: «non ho potuto leggere» non è «non c'è niente»
// ─────────────────────────────────────────────────────────────────────────────

export type StatoCasella = "carico" | "dato" | "vuoto" | "non-letto";

export type MostraCasella = {
  stato: StatoCasella;
  /** Cosa scrivere quando a schermo non c'è il dato. Vuoto quando il dato c'è. */
  messaggio: string;
  /** Falso vieta alla schermata la frase tranquillizzante e il contatore a zero. */
  rassicurante: boolean;
};

/**
 * Cosa mostra una casella, in un posto solo.
 *
 * L'ordine è la cura: prima la rotellina (sto ancora guardando), poi il buio (non ho potuto
 * guardare), poi il dato, poi il vuoto — che è l'unico caso in cui rassicurare è corretto.
 *
 * `letto === false` con un messaggio è il caso di AR-263: prima di questa funzione, quel caso
 * usciva identico al vuoto, cioè «questo senior non ha scritto niente».
 */
export function cosaMostrare(p: {
  caricando: boolean;
  letto: boolean;
  vuoto: boolean;
  motivo?: string | null;
  testoVuoto?: string;
}): MostraCasella {
  if (p.caricando) return { stato: "carico", messaggio: "", rassicurante: false };
  if (!p.letto) {
    const motivo = String(p.motivo || "").trim();
    return {
      stato: "non-letto",
      messaggio: motivo
        ? `⚠️ Non sono riuscito a leggere: ${motivo}. Riprova fra un momento.`
        : "⚠️ Non sono riuscito a leggere questo dato. Riprova fra un momento.",
      rassicurante: false,
    };
  }
  if (p.vuoto) return { stato: "vuoto", messaggio: p.testoVuoto || "Non c'è ancora niente qui.", rassicurante: true };
  return { stato: "dato", messaggio: "", rassicurante: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-408 — la pagina non si ricarica sotto le dita
// ─────────────────────────────────────────────────────────────────────────────

export type AzioneRicarica = "niente" | "ricarica" | "rimanda";

export type DecisioneRicarica = { azione: AzioneRicarica; motivo: string };

/**
 * `controllerchange` è arrivato: si ricarica?
 *
 *   · non c'era nessun controller prima → è il PRIMO controllo, non un aggiornamento: niente.
 *     (È la guardia standard che mancava: alla prima visita la ricarica era garantita, sempre.)
 *   · c'era, e Nicola sta scrivendo     → si rimanda e glielo si dice: la bozza non è ricostruibile.
 *   · c'era, e non sta facendo niente   → si ricarica: è una versione nuova, i chunk vecchi non ci sono più.
 */
export function decidiRicaricaPagina(p: { controllerPrima: boolean; lavoroInCorso: boolean }): DecisioneRicarica {
  if (!p.controllerPrima) {
    return { azione: "niente", motivo: "primo controllo del service worker: non è un aggiornamento" };
  }
  if (p.lavoroInCorso) {
    return { azione: "rimanda", motivo: "c'è un messaggio in scrittura o un invio in corso: la ricarica lo cancellerebbe" };
  }
  return { azione: "ricarica", motivo: "versione nuova e niente in sospeso" };
}

/** Il registro dei gesti in corso: chi scrive si segna, chi vorrebbe ricaricare lo legge. */
const gestiInCorso = new Set<string>();

export function segnaLavoroInCorso(superficie: string, attivo: boolean): void {
  const k = String(superficie || "").trim() || "chat";
  if (attivo) gestiInCorso.add(k);
  else gestiInCorso.delete(k);
}

export function lavoroInCorso(): boolean {
  return gestiInCorso.size > 0;
}

/** Solo per i test e per lo smontaggio: azzera il registro. */
export function azzeraLavoriInCorso(): void {
  gestiInCorso.clear();
}

/** Dove vive la bozza di una superficie, fra una ricarica e l'altra. */
export function chiaveBozza(superficie: string): string {
  return `mycity_bozza_${String(superficie || "chat").trim() || "chat"}`;
}

/**
 * Quale bozza sopravvive.
 *
 * Quella corrente vince SEMPRE se non è vuota: ripescare sopra a quello che Nicola sta scrivendo
 * adesso sarebbe la stessa perdita di dati, al contrario.
 */
export function bozzaDaRipescare(salvata: string | null | undefined, corrente: string): string {
  if (String(corrente || "").trim()) return corrente;
  return String(salvata || "");
}
