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

// LOTTO 33 — AR-381. Il cancello sta QUI, e sta qui una volta sola.
//
// Fino al 29/7 le sei mani di questa cartella (Facebook, Instagram, email, Google Business Profile,
// Telegram, più questo comune) non erano nemmeno CONTATE come mani: il guardiano delle uscite
// leggeva `cervello/` a un livello solo, quindi `publishers/` non esisteva come luogo dove può
// esserci un'uscita. Nessuno le aveva nascoste — semplicemente il perimetro del controllo era stato
// dedotto dagli esempi disponibili quando è nato, e da allora è sempre uscito verde.
//
// Il cancello vero era a monte, in `autopilot.mjs`, che chiama `consensoInvio` prima di scegliere il
// publisher. Ma un cancello che sta nel CHIAMANTE protegge solo quel chiamante: chiunque importi
// `publishers/facebook.mjs` per conto suo pubblica sul mondo senza passare da niente. È la forma di
// difetto che questo repo chiama «la regola vive nella disciplina di chi esegue invece che al
// confine» — e la cura non è aggiungere il controllo anche negli altri sei posti, è spostarlo sul
// DATO: qui, dove passano tutti.
//
// Fail-closed per costruzione: se la pausa non è verificabile (Supabase giù, chiavi assenti)
// `pausaAttiva()` risponde «bloccante», quindi il silenzio della memoria FERMA l'invio invece di
// lasciarlo passare. Un cancello che si apre quando non riesce a misurare non è un cancello.
import { pausaAttiva } from "../consenso-azione.mjs";

/**
 * POST JSON generico — il collo di bottiglia di ogni pubblicazione verso il mondo.
 *
 * Torna `{ ok: false, status: 0, bloccato: true, text: <motivo> }` quando il cancello dice no: gli
 * esiti dei publisher hanno già la forma «non è partito, ed ecco perché», quindi un rifiuto si
 * racconta da solo senza far esplodere il giro.
 */
export async function postJSON(url, headers, body) {
  if (!LIVE) {
    return { ok: false, status: 0, bloccato: true, text: "DRY-RUN: AUTOPILOT_LIVE non è 1 — niente esce davvero" };
  }
  const pausa = await pausaAttiva();
  if (pausa.bloccante) {
    return { ok: false, status: 0, bloccato: true, text: `cancello: ${pausa.motivo}` };
  }
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
