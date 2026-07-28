#!/usr/bin/env node
// AR-141 — l'approvazione sblocca una TABELLA, e sulla tabella viaggia anche il prezzo.
//
// Il cancello AR-103 controlla «esiste un AZIONE_ID firmato da Nicola + la tabella è in
// mani-allowlist.json». Non controlla che i CAMPI scritti siano quelli della casella approvata. Su
// `products` convivono la descrizione (innocua, riempita in automatico dalla supervisione negozi) e
// il **prezzo**, che la regola d'oro tiene in 🔴 dedicato.
//
// Conseguenza concreta: Nicola approva «completa la descrizione dei prodotti di Pane Quotidiano», e
// nello stesso PATCH può viaggiare `price`. La firma c'è, il cancello è verde, il prezzo cambia — e
// nessuno ha mentito: semplicemente il permesso era più largo della frase che l'ha ottenuto.
//
// È la stessa forma di AR-119 e AR-140, ed è per questo che stanno nello stesso lotto: il permesso è
// una parola, e la parola copre più di quello che qualcuno ha letto.
//
// La cura: campi vietati per tabella, con una lista che si allarga SOLO con un flag esplicito e
// separato — mai a bordo di un'altra approvazione.
//
// Nessuna dipendenza e nessun I/O: si esegue sull'oggetto passato da fuori.

/**
 * I campi che nessuna approvazione generica può toccare, per tabella.
 * Sono i campi 🔴 della regola d'oro: soldi e identità commerciale del negozio.
 * Il carattere `*` vale per qualunque tabella.
 */
export const CAMPI_RISERVATI = {
  "*": ["id", "created_at", "owner_id", "user_id", "vendor_id", "stripe_account_id"],
  products: ["price", "compare_at_price", "cost", "commission", "commission_rate", "vendor_id", "stock"],
  vendors: ["commission_rate", "payout_iban", "iban", "stripe_account_id", "status", "verified"],
  orders: ["total", "amount", "payment_status", "delivery_status", "refunded"],
  site_settings: ["commission_rate", "delivery_fee", "free_shipping_threshold"],
};

/** Il nome del flag che serve per toccare un campo riservato, uno alla volta e dichiarato. */
export const FLAG_CAMPO = "CAMPI_RISERVATI_SBLOCCATI";

/** I campi riservati per una tabella: quelli suoi più quelli universali. */
export function riservatiDi(tabella) {
  return [...(CAMPI_RISERVATI["*"] || []), ...(CAMPI_RISERVATI[String(tabella || "")] || [])];
}

/**
 * I campi di `oggetto` che questa scrittura non può toccare.
 *
 * `sbloccati` è l'elenco esplicito passato a mano (dal flag): sblocca SOLO i campi nominati, e va
 * scritto nel comando — non può arrivare da un file che la macchina stessa aggiorna, altrimenti è
 * di nuovo un permesso che si autoconcede.
 */
export function campiVietati(tabella, oggetto = {}, { sbloccati = [] } = {}) {
  if (!oggetto || typeof oggetto !== "object") return [];
  const vietati = new Set(riservatiDi(tabella));
  const ok = new Set((sbloccati || []).map((s) => String(s).trim()).filter(Boolean));
  return Object.keys(oggetto).filter((c) => vietati.has(c) && !ok.has(c));
}

/**
 * Il verdetto per una scrittura. Fail-closed: un oggetto che non si riesce a leggere non passa,
 * perché «non ho capito cosa scrivi» non è «puoi scrivere».
 */
export function scritturaAmmessa(tabella, oggetto, opzioni) {
  if (oggetto == null || typeof oggetto !== "object" || Array.isArray(oggetto)) {
    return { ammessa: false, vietati: [], motivo: "corpo della scrittura non leggibile → bloccata (fail-closed)" };
  }
  const vietati = campiVietati(tabella, oggetto, opzioni);
  if (!vietati.length) return { ammessa: true, vietati: [], motivo: "nessun campo riservato" };
  return {
    ammessa: false,
    vietati,
    motivo:
      `campi riservati in "${tabella}": ${vietati.join(", ")} — un'approvazione per altro non li sblocca. ` +
      `Se è davvero questo che vuoi cambiare, dillo apposta: ${FLAG_CAMPO}="${vietati.join(",")}" (e serve comunque la firma di Nicola).`,
  };
}

/** L'elenco dal flag, che arriva dall'ambiente del comando e non da un file scritto dalla macchina. */
export function sbloccatiDaFlag(env = {}) {
  return String(env[FLAG_CAMPO] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
