/**
 * ⏱️ GLI ORDINI IN RITARDO — la promessa del modello, come domanda al database.
 *
 * «Te lo portiamo entro lo slot» è la promessa che regge tutta la parte consegne. Il sensore che
 * dice se la stiamo mantenendo cerca gli ordini con lo slot promesso GIÀ SCADUTO e la consegna NON
 * ancora avvenuta: è lo stato operativo dell'ordine, non quello contabile.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERCHÉ STA IN UN FILE SUO
 * ─────────────────────────────────────────────────────────────────────────────
 * Perché una prova possa ESEGUIRLO. Stava dentro `sentinella-dati.mjs`, che parte da solo appena lo
 * importi: un test non può interrogarlo senza farlo girare per intero. Così il caso di prova di
 * AR-071 si era ridotto a cercare tre parole nel sorgente — e quelle parole lì dentro compaiono
 * sette volte, quindi la mutazione che spegneva il sensore ne cambiava una e la prova restava verde.
 * Misurato il 26/8 (AR-840).
 *
 * L'istante arriva da fuori: un sensore che legge l'orologio da sé non si può provare, e la stessa
 * domanda fatta due volte darebbe due risposte.
 *
 * 🟢 Modulo puro: nessun disco, nessuna rete, nessun orologio.
 *
 * Prova: node cervello/test/il-volano-i-sensori-e-la-stella.test.mjs
 */

/** Il nome del sensore, così chi lo cerca lo trova in una casa sola. */
export const SENSORE_RITARDO = "ordini_slot_scaduto";

/**
 * La domanda al database: slot passato E consegna non avvenuta.
 *
 * Servono tutte e due le condizioni. Solo la prima conterebbe anche gli ordini consegnati in tempo
 * di ieri; solo la seconda conterebbe quelli che devono ancora arrivare e sono in orario.
 */
const ISTANTE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

export function queryOrdiniInRitardo(adesso) {
  const istante = String(adesso ?? "").trim();
  if (!istante) throw new Error("queryOrdiniInRitardo: serve l'istante, non lo leggo da solo");
  // L'istante finisce dentro una query, quindi la sua FORMA va controllata qui e non data per buona.
  // Oggi l'unico che chiama passa un `toISOString()`, ma un valore con dentro una `&` aggiungerebbe
  // un parametro alla domanda — per esempio un `limit` — e il sensore conterebbe un'altra cosa
  // credendo di contare i ritardi. Trovato riguardando il perimetro con la lente della sicurezza.
  if (!ISTANTE.test(istante)) {
    throw new Error(`queryOrdiniInRitardo: «${istante}» non è un istante ISO: non lo metto in una query`);
  }
  return `orders?expected_delivery=lt.${istante}&delivered_at=is.null`;
}
