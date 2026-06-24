// _comune.mjs — utilità condivise da tutti i publisher della Marketing Autopilot.
//
// PRINCIPIO DI SICUREZZA (uguale a esegui-azione.mjs):
//   - di default TUTTO è in DRY-RUN: nessun publisher invia davvero, stampa solo cosa farebbe.
//   - per pubblicare DAVVERO servono: (a) le chiavi del canale, (b) AUTOPILOT_LIVE=1.
//   - le azioni che toccano il pubblico restano 🔴 (firma di Nicola) finche' non sono in coda.
//
// Ogni publisher esporta una funzione async `pubblica(voce, ctx)` con firma uniforme:
//   voce = { id, data, canale, testo, mediaRef, utm, colore }   (una riga del calendario)
//   ctx  = { live, log }                                          (modalita' + logger)
// e ritorna { canale, stato: "dry-run"|"inviato"|"errore"|"manca-chiave", dettaglio }.

export const LIVE = process.env.AUTOPILOT_LIVE === "1";

// POST JSON generico (stesso pattern di esegui-azione.mjs).
export async function postJSON(url, headers, body) {
  const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  return { ok: r.ok, status: r.status, text: (await r.text()).slice(0, 300) };
}

// Applica i parametri UTM a un eventuale link nel testo (tracciamento campagne in GA4/PostHog).
export function conUtm(testo, utm) {
  if (!utm || !testo) return testo;
  const qs = Object.entries(utm)
    .filter(([, v]) => v)
    .map(([k, v]) => `utm_${k}=${encodeURIComponent(v)}`)
    .join("&");
  if (!qs) return testo;
  // aggiunge gli UTM al primo URL trovato nel testo
  return testo.replace(/(https?:\/\/[^\s]+)/, (m) => (m.includes("?") ? `${m}&${qs}` : `${m}?${qs}`));
}

// Logger uniforme: prefisso [DRY-RUN] o [LIVE] + canale.
export function logRiga(live, canale, msg) {
  console.log(`${live ? "[LIVE]" : "[DRY-RUN]"} ${canale.toUpperCase()} → ${msg}`);
}

// Esito standard di un publisher.
export function esito(canale, stato, dettaglio) {
  return { canale, stato, dettaglio };
}
