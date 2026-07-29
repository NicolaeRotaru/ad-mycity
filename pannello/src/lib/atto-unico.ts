// 🔒 UN ATTO PARTE UNA VOLTA SOLA — la guardia sta sul confine dell'atto, non sui campanelli.
//
// LA MALATTIA (lotto 29). Quattro difetti, una forma sola: la protezione contro il doppio invio è
// appesa a QUALCOSA CHE STA FUORI dall'atto — il nome della decisione, l'attributo del bottone, un
// timer nella barra di scrittura — e ogni strada nuova verso lo stesso atto nasce senza.
//   · AR-229 — approva → rifiuta → approva: la seconda approvazione riesegue le «mani» davvero.
//              La guardia `giaEseguita` esisteva, ma solo dentro il ramo `annulla`.
//   · AR-259 — un solo invio, due lavori: dopo un timeout il ciclo ritenta la POST. L'abort non
//              annulla la scrittura arrivata a Supabase, la rende solo invisibile.
//   · AR-260 — due messaggi ravvicinati: il primo entra nel registro dei pendenti DOPO che la POST
//              è tornata, quindi durante la creazione il sistema è cieco su se stesso.
//   · AR-261 — dalla finestra video il tasto Invio bypassa `disabled={... || chatLoading}`, perché
//              la guardia era nel JSX invece che nella funzione.
//
// LA RADICE COMUNE, già pagata una volta (LEZIONI-CHAT: «cercare il fix al CONFINE della creazione,
// non moltiplicare i lock sui punti di ingresso»): finché la guardia non sta sull'atto, ogni
// superficie nuova la rifà da capo — o se la dimentica.
//
// 🟢 Modulo puro: nessun import, nessun window, nessun fetch. Prova: cervello/test/atto-che-parte-due-volte.test.mjs

// ─────────────────────────────────────────────────────────────────────────────
// ① Lo stato di un'azione — l'unico fatto che conta (AR-229)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'azione è già partita? Si guarda lo STATO salvato, non il nome della decisione in arrivo.
 *
 * `""` = mai decisa · `"rifiutata"` = decisa di no, mai partita · qualsiasi altro valore
 * (`fatta`, `simulata`, `coda`, `errore`) = le mani si sono già mosse.
 *
 * Chiamarla da OGNI decisione che riscrive lo stato — approva, rifiuta, annulla — chiude il buco:
 * un'azione già partita non può più tornare «da decidere» passando per «rifiutata».
 */
export function attoGiaAvviato(statoSalvato: string | null | undefined): boolean {
  const s = String(statoSalvato || "").trim();
  return s !== "" && s !== "rifiutata";
}

/**
 * Le decisioni che riscrivono lo stato di un'azione e che quindi devono passare dal controllo.
 * `approva` compresa: ri-approvare un'azione già fatta rieseguirebbe le mani.
 */
export const DECISIONI_CHE_RISCRIVONO = ["approva", "rifiuta", "annulla"] as const;
export type DecisioneAzione = (typeof DECISIONI_CHE_RISCRIVONO)[number];

// ─────────────────────────────────────────────────────────────────────────────
// ② Ritentare una scrittura è sicuro solo se sai che NON è avvenuta (AR-259)
// ─────────────────────────────────────────────────────────────────────────────

/** Perché una scrittura non ha risposto bene. Stessi nomi di `EsitoLavoro` in store.ts. */
export type MotivoScrittura = "config" | "rete" | "timeout" | "rifiuto";

/**
 * Cosa fare dopo una scrittura andata male:
 *   · "stop"     — è certo che non serve (o non si può) ritentare: errore stabile o configurazione.
 *   · "ritenta"  — è certo che la scrittura NON è avvenuta: si può ripetere senza duplicare.
 *   · "verifica" — AMBIGUO: la scrittura può essere arrivata lo stesso. Prima si cerca se la riga
 *                  esiste già; solo se non c'è si ritenta.
 *
 * Il caso che ha rotto (AR-259) è proprio l'ambiguo: `LAVORO_TIMEOUT_MS` aborta il fetch lato
 * client dopo 4s, ma Supabase la riga l'ha scritta. Ritentare alla cieca crea il gemello.
 */
export function comeRitentareScrittura(motivo: MotivoScrittura, status?: number): "stop" | "ritenta" | "verifica" {
  if (motivo === "config") return "stop";
  if (motivo === "rifiuto") {
    if (typeof status !== "number") return "verifica";
    // 429 = rate limit: la richiesta è stata respinta PRIMA di scrivere → ripetibile.
    if (status === 429) return "ritenta";
    // 4xx stabile (malformata, RLS, permessi): ritentare non cambia niente.
    if (status >= 400 && status < 500) return "stop";
    // 5xx: il server ha preso in carico e poi è caduto — può aver scritto.
    return "verifica";
  }
  // timeout / rete: la risposta non è arrivata, ma la richiesta può essere passata.
  return "verifica";
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ Il registro degli atti in volo — il confine della creazione (AR-260, AR-261)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tiene le chiavi degli atti PARTITI e non ancora conclusi. Serve a rispondere alla domanda che
 * durante la creazione nessuno sapeva fare: «ne esiste già uno in volo per questa conversazione?».
 *
 * Va segnato PRIMA della chiamata di rete e ripulito nel `finally` — non dopo la risposta, che è
 * esattamente il ritardo che ha creato AR-260.
 *
 * La scadenza (`ttlMs`) è la rete di sicurezza per il `finally` che non gira mai (tab chiusa a
 * metà, crash del render): senza, una chiave rimasta appesa bloccherebbe la chat per sempre — e un
 * blocco che non si apre più è peggio del doppione che doveva evitare.
 */
export class AttiInVolo {
  private inizi = new Map<string, number>();
  private ttlMs: number;

  // ⚠️ Campo esplicito, NON una `parameter property` (`constructor(private ttlMs = …)`): il
  // type-stripping di Node 22 — quello con cui i test importano questo modulo — non la supporta e
  // il file diventa inimportabile. Scoperto lanciando il test, non a occhio.
  constructor(ttlMs = 60_000) {
    this.ttlMs = ttlMs;
  }

  /** Prova a prendere il posto. `false` = ce n'è già uno in volo per questa chiave. */
  inizia(chiave: string, ora: number = Date.now()): boolean {
    if (this.inVolo(chiave, ora)) return false;
    this.inizi.set(chiave, ora);
    return true;
  }

  /** C'è un atto in volo (non scaduto) per questa chiave? */
  inVolo(chiave: string, ora: number = Date.now()): boolean {
    const at = this.inizi.get(chiave);
    if (at === undefined) return false;
    if (ora - at >= this.ttlMs) {
      this.inizi.delete(chiave);
      return false;
    }
    return true;
  }

  /** Libera il posto. Va nel `finally`, sempre. */
  finisci(chiave: string): void {
    this.inizi.delete(chiave);
  }

  /** Quanti atti risultano in volo adesso (per i test e la diagnostica). */
  quanti(ora: number = Date.now()): number {
    for (const [k, at] of [...this.inizi.entries()]) if (ora - at >= this.ttlMs) this.inizi.delete(k);
    return this.inizi.size;
  }
}

/** Chiave dell'atto «sto creando un lavoro di chat per questa conversazione». */
export function chiaveCreazioneChat(convId: string | null | undefined): string {
  return `creazione-chat:${convId || "nuova"}`;
}

/**
 * Si può mandare questo messaggio? (AR-261)
 *
 * Sta qui e non nel JSX perché nel JSX vale per UN modo di premere. Il bottone aveva
 * `disabled={!bozza.trim() || chatLoading}`, ma il gestore del tasto Invio chiama la funzione
 * direttamente e l'attributo non lo tocca: dalla finestra video e da quella dello schermo condiviso
 * si partiva una seconda volta mentre l'AD stava ancora rispondendo. Ogni superficie nuova che
 * invia deve poter fare UNA domanda sola, e questa è la domanda.
 */
export function puoInviareChat(stato: {
  testo: string;
  chatLoading?: boolean;
  bloccato?: boolean;
  destinatarioPresente?: boolean;
}): boolean {
  if (stato.bloccato) return false;
  if (stato.chatLoading) return false;
  if (!stato.testo || !stato.testo.trim()) return false;
  if (stato.destinatarioPresente === false) return false;
  return true;
}
