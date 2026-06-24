// facebook.mjs — Publisher per Facebook Page (post sulla Pagina MyCity).
//
// MANO: gratis come API, ma con SETUP LENTO (Meta). Vedi azioni.md (riga Meta) e AUTOPILOT.md.
// CHIAVI / requisiti (variabili d'ambiente):
//   FB_PAGE_ID            -> id della Pagina Facebook
//   FB_PAGE_ACCESS_TOKEN  -> Page Access Token (long-lived) da un'app Meta
//   (in alternativa) N8N_WEBHOOK_URL -> instrada a un workflow n8n collegato a Meta
// ENDPOINT: https://graph.facebook.com/v21.0/{PAGE_ID}/feed   (testo)
//           https://graph.facebook.com/v21.0/{PAGE_ID}/photos (foto)
//
// COLORE: 🟡 (post pubblico, cancellabile). 🔴 se collegato a budget ads.
// LIMITE REALE: serve un'app Meta con permessi pages_manage_posts + App Review;
//   l'app deve uscire dalla modalita' sviluppo (Business Verification — può richiedere giorni).

import { postJSON, conUtm, logRiga, esito } from "./_comune.mjs";

const PAGE = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const N8N = process.env.N8N_WEBHOOK_URL;
const GRAPH = "https://graph.facebook.com/v21.0";

export async function pubblica(voce, ctx) {
  const testo = conUtm(voce.testo, voce.utm);
  const viaApi = PAGE && TOKEN;
  const haCanale = viaApi || N8N;

  if (!ctx.live || !haCanale) {
    logRiga(false, "facebook", `feed Pagina :: ${testo.slice(0, 120)}…${voce.mediaRef ? `  [media: ${voce.mediaRef}]` : ""}`);
    return esito("facebook", haCanale ? "dry-run" : "manca-chiave", "FB_PAGE_ID+FB_PAGE_ACCESS_TOKEN oppure N8N_WEBHOOK_URL");
  }

  if (N8N) {
    const r = await postJSON(N8N, { "Content-Type": "application/json" }, { canale: "facebook", testo, mediaRef: voce.mediaRef, fonte: "autopilot" });
    logRiga(true, "facebook", r.ok ? "inviato a n8n" : `errore ${r.status}`);
    return esito("facebook", r.ok ? "inviato" : "errore", r.ok ? "via n8n" : `${r.status} ${r.text}`);
  }

  const r = voce.mediaRef
    ? await postJSON(`${GRAPH}/${PAGE}/photos`, { "Content-Type": "application/json" }, { url: voce.mediaRef, caption: testo, access_token: TOKEN })
    : await postJSON(`${GRAPH}/${PAGE}/feed`, { "Content-Type": "application/json" }, { message: testo, access_token: TOKEN });

  logRiga(true, "facebook", r.ok ? "pubblicato" : `errore ${r.status}`);
  return esito("facebook", r.ok ? "inviato" : "errore", r.ok ? "" : `${r.status} ${r.text}`);
}
