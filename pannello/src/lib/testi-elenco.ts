// ═══════════════════════════════════════════════════════════════════════════
// IL BUCO CHE SI TRAVESTE DA RISPOSTA COMPLETA — AR-715 · AR-716
//
// L'elenco dei lavori gira leggero apposta: niente domanda, niente risposta (sulle chat sono 9,8 KB
// a riga, ogni otto secondi). Dentro la stessa sessione il buco non si vede, perché i lavori ancora
// in corso vengono riletti a parte. Ma un lavoro già FINITO non lo rilegge nessuno: dopo un
// ricaricamento della pagina le sue righe arrivano mute, e ricostruire una conversazione da righe
// mute non produce niente. Da lì i due difetti:
//
//  · AR-715 — la chat SPARISCE. L'elenco del Worker aggiunge le conversazioni che vivono solo nei
//    lavori, ma prima controlla di aver trovato almeno un messaggio di Nicola. Con le righe mute non
//    ne trova nessuno e salta il gruppo: la conversazione esiste, il suo nome è pure noto, e
//    dall'elenco è sparita.
//  · AR-716 — il thread si ACCORCIA in silenzio. La fusione «salvati + ricostruiti dai lavori»
//    torna il solo thread salvato, senza distinguere «non c'era niente in più» da «non ho potuto
//    leggere». A schermo diventa «0 messaggi» sotto una chat che ne ha sei.
//
// LA RADICE COMUNE: le due funzioni girano DURANTE il disegno della pagina, quindi non possono
// aspettare una lettura, e nessuna delle due dichiarava di essere a corto di dati. Un buco muto è
// indistinguibile da un vuoto vero, e chi lo riceve lo mostra come se fosse la verità.
//
// LA CURA, in tre pezzi che stanno tutti qui dentro:
//  ① il buco si DICHIARA (`threadIncompleto`): righe che promettono un testo e non lo portano;
//  ② un gruppo-chat con righe mute RESTA nell'elenco invece di sparire (`esitoGruppoChat`);
//  ③ la dichiarazione ha un destinatario: `idsDaPrecaricareInElenco` dice cosa rileggere una volta
//     sola all'arrivo dell'elenco, e la pagina lo legge fuori dal disegno. Il buco non viene
//     mostrato come completo: viene riempito.
//
// 🟢 Modulo puro: nessun React, nessuna rete, nessun `window`.
// Prova: cervello/test/c5-chat-mute-nell-elenco.test.mjs
// ═══════════════════════════════════════════════════════════════════════════

import { idsDaRileggerePerThread, type LavoroThread } from "./recupero-thread";
import { messaggiDaGruppo, raggruppaLavori, type LavoroBase, type MsgChat } from "./lavori-gruppo";
import { mergeThreadMsgs } from "./chat-thread-merge";

/** Quante righe si possono chiedere in un colpo: la rotta dei dettagli è un batch, non un fiume. */
export const MAX_PRECARICO = 40;

/** Un gruppo è una conversazione se almeno uno dei suoi lavori è una chat. */
export function eGruppoChat(lavori: LavoroBase[] | null | undefined): boolean {
  return (Array.isArray(lavori) ? lavori : []).some((l) => l?.tipo === "chat");
}

/**
 * ① AR-716 — queste righe promettono un testo che non portano?
 *
 * È la stessa domanda che si fa il ripescaggio quando si apre una casella, chiesta però al momento
 * del disegno: se la risposta è sì, quello che si sta per mostrare è un buco, non un vuoto.
 */
export function threadIncompleto(lavori: LavoroThread[] | null | undefined): boolean {
  return idsDaRileggerePerThread(lavori).length > 0;
}

export type EsitoGruppoChat = {
  /** Il gruppo va tenuto nell'elenco delle conversazioni. */
  tieni: boolean;
  /** I messaggi ricostruibili adesso (possono essere zero, e va bene: si riempiono dopo). */
  messaggi: MsgChat[];
  /** Manca del testo che esiste: quello che si vede non è tutto. */
  incompleto: boolean;
  /** Perché, in una frase: serve a chi legge il codice fra sei mesi. */
  motivo: string;
};

/**
 * ② AR-715 — un gruppo-chat resta nell'elenco anche quando le sue righe sono mute.
 *
 * Il vecchio controllo era «se non trovo un messaggio di Nicola, salto»: giusto contro i gruppi
 * vuoti, sbagliato dopo un ricaricamento, quando NESSUN gruppo porta il testo. La differenza fra i
 * due casi non è il numero di messaggi trovati, è se c'è qualcosa da rileggere:
 *
 *   · niente messaggi e niente da rileggere → il gruppo è vuoto davvero, si salta (com'era);
 *   · niente messaggi ma righe da rileggere → la chat esiste, il nome pure: **si tiene**, e il
 *     testo arriva col precarico.
 */
export function esitoGruppoChat(lavori: LavoroBase[] | null | undefined): EsitoGruppoChat {
  const righe = Array.isArray(lavori) ? lavori : [];
  if (!eGruppoChat(righe)) {
    return { tieni: false, messaggi: [], incompleto: false, motivo: "non è una conversazione" };
  }
  const messaggi = messaggiDaGruppo(righe).filter((m) => !m.pending);
  const incompleto = threadIncompleto(righe as LavoroThread[]);
  const conVoceDiNicola = messaggi.some((m) => m.role === "user" && m.content.trim());
  if (conVoceDiNicola) {
    return { tieni: true, messaggi, incompleto, motivo: "ricostruita dalle righe dell'elenco" };
  }
  if (incompleto) {
    return {
      tieni: true,
      messaggi,
      incompleto: true,
      motivo: "righe mute: la chat esiste, il testo si rilegge — sparire sarebbe peggio che essere incompleta",
    };
  }
  return { tieni: false, messaggi, incompleto: false, motivo: "niente da mostrare e niente da rileggere" };
}

export type ThreadDiLista<T extends MsgChat> = {
  messaggi: T[];
  /** Vero quando manca del testo che esiste: il conteggio a schermo non è la verità. */
  incompleto: boolean;
};

/**
 * ② AR-716 — il thread mostrato in lista, con dichiarato quanto è completo.
 *
 * La fusione è quella di prima (salvati + ricostruiti dai lavori). Quello che cambia è che adesso
 * esce anche la seconda metà della notizia: se `incompleto` è vero, «meno messaggi» non vuol dire
 * «meno messaggi», vuol dire «non li ho potuti leggere».
 */
export function threadDiLista<T extends MsgChat>(
  salvati: T[] | null | undefined,
  lavori: LavoroBase[] | null | undefined,
): ThreadDiLista<T> {
  const base = (Array.isArray(salvati) ? salvati : []) as T[];
  const righe = Array.isArray(lavori) ? lavori : [];
  if (righe.length === 0) return { messaggi: base, incompleto: false };
  const daLavori = messaggiDaGruppo(righe) as unknown as T[];
  return {
    messaggi: mergeThreadMsgs(base, daLavori),
    incompleto: threadIncompleto(righe as LavoroThread[]),
  };
}

/**
 * Cosa scrivere al posto del numero di messaggi.
 *
 * Tre puntini invece di uno zero: uno zero è un'affermazione («questa chat è vuota») e sarebbe
 * falsa. I puntini dicono «sto ancora leggendo», che è vero e dura un giro di poll.
 */
export function conteggioMessaggiDaMostrare(quanti: number, incompleto: boolean): string {
  const n = Number.isFinite(quanti) ? Math.max(0, Math.round(quanti)) : 0;
  if (incompleto && n === 0) return "…";
  return String(n);
}

/**
 * ③ La dichiarazione ha un destinatario: cosa rileggere UNA VOLTA SOLA all'arrivo dell'elenco.
 *
 * Solo i gruppi-chat: sono gli unici che l'elenco del Worker deve poter ricostruire. `giaChiesti` è
 * la memoria di chi ha già domandato — senza, questo ripartirebbe a ogni giro di poll (otto
 * secondi) e sarebbe un difetto peggiore di quello che cura.
 */
export function idsDaPrecaricareInElenco(
  lavori: LavoroBase[] | null | undefined,
  mappaGruppi: Record<string, string> = {},
  giaChiesti: ReadonlySet<string> = new Set<string>(),
  max: number = MAX_PRECARICO,
): string[] {
  const righe = Array.isArray(lavori) ? lavori : [];
  if (righe.length === 0) return [];
  const out: string[] = [];
  for (const g of raggruppaLavori(righe, mappaGruppi || {})) {
    if (!eGruppoChat(g.lavori)) continue;
    for (const id of idsDaRileggerePerThread(g.lavori as LavoroThread[])) {
      if (giaChiesti?.has?.(id)) continue;
      out.push(id);
    }
  }
  const tetto = Number.isFinite(max) && max > 0 ? Math.round(max) : MAX_PRECARICO;
  return [...new Set(out)].slice(0, tetto);
}
