/**
 * AR-258 — quando una risposta non arriva più, la bolla «sto elaborando» deve smettere di girare.
 *
 * Il difetto: la bolla pending non aveva NESSUN tempo massimo, e viene salvata in localStorage —
 * quindi sopravvive anche al riavvio del browser. Se il worker moriva, si riavviava o perdeva il
 * lavoro, quella bolla restava a girare per sempre: Nicola vedeva la chat «che sta pensando» su una
 * risposta che non sarebbe mai arrivata. Le altre due superfici di chat del Pannello un tempo massimo
 * ce l'hanno — questa no: il solito fix applicato a una copia sola.
 *
 * Sta in un file a parte, come funzione pura, per lo stesso motivo di lib/serratura.ts: dentro
 * page.tsx (2.100+ righe di componente) questa regola si potrebbe solo rileggere, mai eseguire in un
 * test — ed è la forma di prova debole che il 27/7 ha lasciato passare 91 chiusure false.
 */

export type PendingChat = {
  id: string;
  tipo: string;
  targetConvId: string;
  /** epoch ms di quando l'attesa è iniziata. Le voci vecchie (salvate prima di AR-258) non ce l'hanno. */
  creatoIl?: number;
};

/**
 * Tempo massimo di attesa prima di dichiarare morta una risposta.
 *
 * 45 minuti = il timeout del worker per un giro (WORKER_TIMEOUT_GIRO=2700s). Sotto quella soglia
 * rischieremmo di dichiarare persa una risposta che sta ancora arrivando; sopra, Nicola resterebbe a
 * guardare una bolla che gira per un lavoro che il worker ha già abbandonato.
 */
export const SOGLIA_PENDING_MS = 45 * 60 * 1000;

/**
 * L'attesa è scaduta?
 *
 * Una voce SENZA `creatoIl` viene dalla versione precedente al fix: non sappiamo quando è nata, e
 * proprio quelle sono le bolle eterne rimaste in localStorage. Le trattiamo come scadute — meglio un
 * «non è arrivata risposta» onesto che uno spinner che gira all'infinito su qualcosa di perduto.
 */
export function pendingScaduto(pend: PendingChat, adesso: number, sogliaMs: number = SOGLIA_PENDING_MS): boolean {
  if (typeof pend.creatoIl !== "number" || !Number.isFinite(pend.creatoIl)) return true;
  if (pend.creatoIl > adesso) return false; // orologio spostato indietro: non inventiamo una scadenza
  return adesso - pend.creatoIl >= sogliaMs;
}

/** Divide le attese in «ancora vive» e «scadute», senza mutare l'ingresso. */
export function separaPending(
  pendings: PendingChat[],
  adesso: number,
  sogliaMs: number = SOGLIA_PENDING_MS,
): { vive: PendingChat[]; scadute: PendingChat[] } {
  const vive: PendingChat[] = [];
  const scadute: PendingChat[] = [];
  for (const p of pendings) (pendingScaduto(p, adesso, sogliaMs) ? scadute : vive).push(p);
  return { vive, scadute };
}

/** Il testo che sostituisce la bolla eterna: dice cos'è successo e cosa può fare Nicola. */
export function messaggioAttesaScaduta(minuti: number = Math.round(SOGLIA_PENDING_MS / 60000)): string {
  return `⚠️ Nessuna risposta dopo ${minuti} minuti: il lavoro non è più in corso. Riprova, oppure controlla lo stato del worker nella casella Lavori.`;
}

/**
 * AR-265 — la vista non deve tornare indietro da sola.
 *
 * Salvare una chat nuova è un `await`: durante quell'attesa Nicola può passare a un'altra
 * conversazione. Prima, alla risoluzione, `setConvId(savedConv)` veniva eseguito comunque — quindi la
 * vista tornava alla chat di partenza mentre a schermo c'erano i messaggi dell'altra, e la risposta
 * finiva scritta e SALVATA sotto la conversazione sbagliata.
 *
 * Il mirror sincrono `convIdRef` esisteva già ed era stato introdotto per questo stesso problema
 * sull'instradamento delle risposte — ma qui non veniva usato: il fix era stato applicato a una copia
 * sola. È il pattern che fa dire «ma non l'avevamo già sistemato?».
 *
 * @param convAperta        la conversazione che Nicola sta guardando ADESSO (convIdRef.current)
 * @param gruppoDiPartenza  la conversazione da cui è partito questo invio
 */
export function deveSpostareLaVista(convAperta: string | null | undefined, gruppoDiPartenza: string): boolean {
  if (!gruppoDiPartenza) return false;
  return convAperta === gruppoDiPartenza;
}
