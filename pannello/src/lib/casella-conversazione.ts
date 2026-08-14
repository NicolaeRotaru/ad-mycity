// 💬 CHI È QUESTA CONVERSAZIONE — identità e fusione della chat di una casella.
//
// LA MALATTIA (corsia 3 del lotto 41): la casella si costruisce da sé la regola di identità e la
// regola di aggiornamento. Nessuna delle due sta scritta in un posto solo, quindi la casella e il
// suo gemello — l'Assistente — ne hanno due versioni diverse, e vince quella sbagliata.
//
//   AR-405 — la chat di una casella è agganciata al suo TITOLO: `💬 ${titolo}`. Ma il titolo arriva
//     dai ~38 punti di innesto come testo TAGLIATO di quello che si vede a schermo
//     (`Difetto: ${umano.titolo}`, `Domanda: ${testo.slice(0, 60)}`…). Quando l'AD riscrive il
//     titolo di un difetto — cosa che fa a ogni radiografia — la chiave cambia e la conversazione
//     avuta lì diventa irraggiungibile: la casella si riapre vuota. Specularmente, due voci che
//     condividono i primi 50-60 caratteri finiscono nello stesso thread.
//     Si stava usando il testo di PRESENTAZIONE come chiave di IDENTITÀ.
//   AR-404 — mentre la casella aspetta la risposta, un evento del bus fa `setMsgs(det.messaggi)` in
//     blocco: sostituzione integrale, senza guardare di quale conversazione parla l'evento e senza
//     conservare la bolla «💭 Sto elaborando la risposta…». L'Assistente lo stesso difetto ce l'ha
//     avuto (AR-266/AR-267) ed è stato curato lì; il lato gemello no, perché il bus non ha un
//     contratto scritto su cosa deve fare CHI ASCOLTA.
//
// LA CURA È RIUSO, NON CODICE NUOVO: `aggiornamentoPertinente` e `fondiConservandoVivi` esistono già
// in `stato-vivo.ts` (sono la cura del lotto 29) e `mergeThreadMsgs` in `chat-thread-merge.ts`. Qui
// si mettono insieme in UNA decisione che la casella chiama, invece di riscriverne un dialetto.
//
// 🟢 Modulo puro: nessun React, nessun window, nessuna rete. Importa solo altri moduli puri.
// Prova: cervello/test/c3-casella-conversazione.test.mjs

import { fondiConservandoVivi, aggiornamentoPertinente, type MsgTransitorio } from "./stato-vivo.ts";
import { mergeThreadMsgs, type ThreadMsg } from "./chat-thread-merge.ts";

/** Le conversazioni di casella si riconoscono da qui in tutta la Cabina (Assistente compreso). */
export const PREFISSO_CASELLA = "💬 ";

const APRE = "⟨#";
const CHIUDE = "⟩";

/**
 * Il titolo con cui una conversazione di casella vive: **leggibile per Nicola, identificata da un id
 * stabile**.
 *
 *   `💬 Difetto: il worker non riparte ⟨#AR-318⟩`
 *
 * Il testo davanti è presentazione e può cambiare quando vuole; la targhetta in fondo è l'identità e
 * non cambia mai. È la stessa distinzione del registro dei fatti — una casa sola per il fatto, gli
 * altri lo citano — applicata a una conversazione invece che a un numero.
 *
 * Senza `idCasella` si ricade sulla chiave di prima (solo titolo): il chiamante che non ha ancora un
 * id non perde la sua chat, ma resta esposto al difetto. Non è un ripiego silenzioso —
 * `identitaStabile()` lo sa dire.
 */
export function chiaveConversazione(idCasella: string | null | undefined, titolo: string): string {
  const id = String(idCasella ?? "").trim();
  const testo = String(titolo ?? "").trim();
  if (!id) return `${PREFISSO_CASELLA}${testo}`;
  return `${PREFISSO_CASELLA}${testo} ${APRE}${id}${CHIUDE}`;
}

/** La chiave con cui la conversazione era salvata PRIMA di questa cura (serve alla migrazione). */
export function chiaveLegacy(titolo: string): string {
  return `${PREFISSO_CASELLA}${String(titolo ?? "").trim()}`;
}

/** L'id dentro un titolo di conversazione, se c'è. `null` = thread vecchio, identificato dal testo. */
export function idDaChiave(chiave: string | null | undefined): string | null {
  const s = String(chiave ?? "");
  const a = s.lastIndexOf(APRE);
  if (a < 0) return null;
  const b = s.indexOf(CHIUDE, a + APRE.length);
  if (b < 0) return null;
  const id = s.slice(a + APRE.length, b).trim();
  return id || null;
}

/** Questa chiave regge a un cambio del testo mostrato? */
export function identitaStabile(chiave: string): boolean {
  return idDaChiave(chiave) != null;
}

/**
 * Due chiavi parlano della stessa casella?
 *
 * Con l'id si confrontano gli id — e il titolo può essere stato riscritto dieci volte. Senza id (uno
 * dei due è un thread vecchio) resta il confronto testuale esatto, che è quello di prima.
 */
export function stessaCasella(a: string | null | undefined, b: string | null | undefined): boolean {
  const ia = idDaChiave(a);
  const ib = idDaChiave(b);
  if (ia && ib) return ia === ib;
  return String(a ?? "").trim() === String(b ?? "").trim();
}

export type ConversazioneSalvata = { id?: string | number | null; titolo?: string | null; messaggi?: unknown };

export type ConversazioneTrovata = {
  convId: string | null;
  titoloSalvato: string;
  messaggi: unknown;
  /** Vero quando è stata ripescata con la chiave VECCHIA: va risalvata col titolo nuovo. */
  daMigrare: boolean;
};

/**
 * Ripesca la conversazione di questa casella dall'elenco, in due passate (AR-405, clausola b):
 *   ① per identità (la targhetta `⟨#id⟩`), che sopravvive a ogni riscrittura del titolo;
 *   ② per il vecchio titolo esatto, così le chat già avute non si perdono nella migrazione.
 *
 * Quando risponde la seconda, `daMigrare` è vero: il chiamante risalva lo stesso `convId` col titolo
 * nuovo e da lì in poi la conversazione ha un'identità.
 */
export function trovaConversazione(
  elenco: ConversazioneSalvata[] | null | undefined,
  idCasella: string | null | undefined,
  titolo: string,
): ConversazioneTrovata | null {
  const lista = Array.isArray(elenco) ? elenco.filter(Boolean) : [];
  const chiave = chiaveConversazione(idCasella, titolo);
  const id = String(idCasella ?? "").trim();

  if (id) {
    const per = lista.find((c) => idDaChiave(c?.titolo) === id);
    if (per) {
      return {
        convId: per.id != null ? String(per.id) : null,
        titoloSalvato: String(per.titolo ?? chiave),
        messaggi: per.messaggi,
        daMigrare: false,
      };
    }
  }

  const vecchia = chiaveLegacy(titolo);
  const per = lista.find((c) => String(c?.titolo ?? "").trim() === vecchia);
  if (!per) return null;
  return {
    convId: per.id != null ? String(per.id) : null,
    titoloSalvato: vecchia,
    messaggi: per.messaggi,
    // Migra solo se adesso un'identità ce l'abbiamo: senza id non c'è niente verso cui migrare.
    daMigrare: Boolean(id),
  };
}

/**
 * Questo evento del bus riguarda la conversazione che ho aperto? (AR-404, clausola a)
 *
 * Due cancelli, non uno:
 *   · **identità**   — parla della mia casella? (il filtro di prima, ma per id e non per testo)
 *   · **pertinenza** — è proprio il mio thread? (`aggiornamentoPertinente`, la cura di AR-266)
 *
 * Il secondo mancava del tutto: bastava che l'Assistente ripubblicasse un thread più corto con lo
 * stesso titolo perché la casella lo adottasse e perdesse i messaggi sotto.
 */
export function accettaEventoBus(p: {
  chiaveMia: string;
  convIdMio: string | null | undefined;
  evento: { titolo?: string | null; convId?: string | null };
}): boolean {
  if (!stessaCasella(p.evento?.titolo, p.chiaveMia)) return false;
  return aggiornamentoPertinente(p.convIdMio, p.evento?.convId);
}

/**
 * Come si applica un thread che arriva da fuori: si FONDE, non si sostituisce (AR-404, clausola b).
 *
 * Le bolle vive — «💭 Sto elaborando la risposta…» e la scheda del prompt — non esistono da nessuna
 * altra parte: nessuna rilettura può ricostruirle, quindi nessun aggiornamento ha il diritto di
 * cancellarle. `mergeThreadMsgs` da sola non basta: comincia con un `pulisci()` che le butta via, ed
 * è esattamente il modo in cui AR-267 è nato sull'altra superficie.
 */
export function fondiThreadCasella<T extends ThreadMsg & MsgTransitorio>(correnti: T[], dallEvento: T[]): T[] {
  return fondiConservandoVivi<T>(correnti || [], dallEvento || [], (a, b) => mergeThreadMsgs<T>(a, b));
}
