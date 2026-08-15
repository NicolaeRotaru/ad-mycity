// ═══════════════════════════════════════════════════════════════════════════
// QUANDO CADE LA RETE, IL PANNELLO DÀ LA COLPA A CHI NON C'ENTRA — AR-608
//
// COSA DICEVA LA SCHEDA E COSA HO TROVATO. La scheda (13/8) accusava tre cose: le due letture dei
// quaderni senza `catch`, il messaggio «Quaderno non trovato» al posto di «è caduta la rete», e le
// istruzioni da operatore («servono le variabili OBSIDIAN_* su Vercel») mostrate a chi guarda la
// Cabina dal telefono. Le prime due erano già state curate da AR-263: i `catch` ci sono, e il terzo
// stato «non ho potuto leggere» esiste in `casella-ricarica.ts`. Restava in piedi la terza — e ne
// sono venute fuori altre due, peggiori, che nessuna scheda diceva:
//
//  ① IL RIPASSO SILENZIOSO CANCELLA QUELLO CHE SI VEDE. Ogni due minuti la casella si rilegge da
//     sola. Se quella lettura fallisce — un tunnel, un ascensore — l'elenco dei senior che era già
//     a schermo SPARISCE e al suo posto compare l'avviso di errore. Il dato c'era, era buono, ed è
//     stato buttato via da una lettura che non ha aggiunto niente. È il caso più frequente di
//     tutti, ed era anche il più invisibile: a un ricaricamento manuale tornava tutto.
//  ② LA COLPA SBAGLIATA È ANCORA POSSIBILE. Il messaggio delle variabili su Vercel è corretto solo
//     quando la lettura è RIUSCITA e ha risposto «non sono collegato». Legarlo a «la lista è vuota»
//     lo fa comparire anche quando la lista è vuota per un altro motivo.
//
// LA RADICE: quale delle cinque schermate mostrare era una catena di `? :` dentro il JSX. Una
// decisione lì dentro nessun test la può eseguire: si può solo cercarne la forma nel file — ed è
// esattamente il motivo per cui questo difetto è arrivato fin qui.
//
// 🟢 Modulo puro: nessun React, nessuna rete, nessun `window`.
// Prova: cervello/test/c5-quaderni-senza-rete.test.mjs
// ═══════════════════════════════════════════════════════════════════════════

// NOTA PER CHI RILEGGE (regola ⑥ del mansionario: «quali cancelli eredita il canale nuovo?»).
// Questo modulo NON sostituisce `cosaMostrare` di `casella-ricarica.ts`: ci si appoggia sopra. Il
// terzo stato di AR-263 — «non ho potuto leggere» ≠ «non c'è niente» — resta la sua decisione e il
// suo guardiano continua a vederla nel componente. Qui si decide solo il gradino successivo: QUALE
// delle cinque schermate vince, che è la parte che AR-608 sbagliava.
import { type MostraCasella } from "./casella-ricarica";

export type SchermataQuaderni =
  /** Prima lettura in corso: non c'è ancora niente da mostrare. */
  | "carico"
  /** L'elenco si vede. `avviso` dice se l'ultima rilettura è fallita. */
  | "elenco"
  /** Non si è potuto leggere e non c'era niente di buono da tenere. */
  | "non-letto"
  /** La lettura è riuscita e ha risposto «la memoria non è collegata»: qui le istruzioni servono. */
  | "non-collegato"
  /** Letto, collegato, e davvero non c'è nessun quaderno (o nessuno che corrisponda al filtro). */
  | "vuoto";

export type VistaQuaderni = {
  schermata: SchermataQuaderni;
  /** Il testo grande al centro, quando l'elenco non si vede. Vuoto quando si vede. */
  messaggio: string;
  /** La striscia sopra l'elenco: «l'ultima rilettura non è riuscita». Vuota quando è tutto a posto. */
  avviso: string;
  /** Vietato rassicurare: c'è qualcosa che non si è potuto leggere. */
  rassicurante: boolean;
};

export type ContestoQuaderni = {
  /** La risposta del server dice che la memoria è collegata. */
  collegato: boolean;
  /** Quanti quaderni si hanno in mano, buoni o vecchi che siano. */
  quantiInMano: number;
  /** Il motivo dell'ultima lettura fallita, se c'è stata. */
  motivo?: string | null;
};

/**
 * Quale schermata mostrano i quaderni, in un posto solo.
 *
 * Prende in ingresso il verdetto di AR-263 (`cosaMostrare`: sto leggendo / non ho potuto leggere /
 * vuoto / dato) e decide il gradino dopo. L'ordine è la cura, ed è diverso da quello di prima in un
 * punto solo che cambia tutto: **un dato già in mano batte un errore di rilettura**. Prima l'errore
 * veniva per primo e spazzava via l'elenco; adesso l'elenco resta e l'errore diventa una striscia
 * sopra. Nessuno perde niente, e nessuno legge un verde che non è vero.
 */
export function vistaQuaderni(base: MostraCasella, ctx: ContestoQuaderni): VistaQuaderni {
  const inMano = Math.max(0, Number(ctx?.quantiInMano) || 0);
  const motivo = String(ctx?.motivo || "").trim();

  if (base?.stato === "carico" && inMano === 0) {
    return { schermata: "carico", messaggio: "", avviso: "", rassicurante: false };
  }

  // ① Il dato che si ha in mano non si butta via per una rilettura andata storta.
  if (base?.stato === "non-letto" && inMano > 0) {
    return {
      schermata: "elenco",
      messaggio: "",
      avviso: motivo
        ? `⚠️ L'ultima rilettura non è riuscita (${motivo}): quello che vedi è di prima.`
        : "⚠️ L'ultima rilettura non è riuscita: quello che vedi è di prima.",
      rassicurante: false,
    };
  }

  if (base?.stato === "non-letto") {
    return { schermata: "non-letto", messaggio: base.messaggio, avviso: "", rassicurante: false };
  }

  // ② Le istruzioni da operatore solo quando è il server ad aver detto «non sono collegato».
  if (!ctx?.collegato && inMano === 0) {
    return {
      schermata: "non-collegato",
      messaggio: "Quaderni non raggiungibili: la memoria non è collegata.",
      avviso: "",
      rassicurante: false,
    };
  }

  if (base?.stato === "vuoto") {
    return { schermata: "vuoto", messaggio: base.messaggio, avviso: "", rassicurante: true };
  }

  return { schermata: "elenco", messaggio: "", avviso: "", rassicurante: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// IL TASTO «RIPROVA» CHE NON RIPROVAVA
// ─────────────────────────────────────────────────────────────────────────────

export type GestoQuaderno = "clic" | "riprova";

export type AperturaQuaderno = {
  /** Chi resta aperto dopo il gesto (`null` = nessuno). */
  aperto: string | null;
  /** Si va a leggere il dettaglio. */
  leggi: boolean;
  perche: string;
};

/**
 * Cosa fa un gesto su un quaderno.
 *
 * TROVATO LEGGENDO IL CODICE, NON LA SCHEDA. Il tasto «Riprova» che compare quando la rete cade
 * faceva due cose in fila: chiudeva e riapriva. Ma la seconda chiamata rileggeva ancora il vecchio
 * «quale è aperto» — lo stato di React si aggiorna dopo — quindi ritrovava lo stesso nome, credeva
 * che si stesse chiudendo, e chiudeva. **Il tasto «Riprova» chiudeva il quaderno invece di
 * riprovare**: l'unica via d'uscita da un errore di rete faceva sparire l'errore insieme al
 * quaderno.
 *
 * Qui la differenza fra i due gesti è dichiarata, non dedotta da uno stato che nel frattempo è
 * cambiato: un clic sullo stesso quaderno lo chiude, una riprova lo rilegge sempre.
 */
export function aperturaQuaderno(apertoOra: string | null, senior: string, gesto: GestoQuaderno = "clic"): AperturaQuaderno {
  const nome = String(senior || "").trim();
  if (!nome) return { aperto: apertoOra ?? null, leggi: false, perche: "nessun quaderno indicato" };
  if (gesto === "riprova") {
    return { aperto: nome, leggi: true, perche: "riprova: si rilegge sempre, anche se è già aperto" };
  }
  if (apertoOra === nome) {
    return { aperto: null, leggi: false, perche: "clic sul quaderno già aperto: si chiude" };
  }
  return { aperto: nome, leggi: true, perche: "quaderno nuovo: si apre e si legge" };
}
