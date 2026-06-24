// instagram.mjs — Publisher per Instagram (feed) via Instagram Graph API.
//
// MANO: gratis come API, SETUP LENTO (Meta) + REQUISITI STRINGENTI. Vedi AUTOPILOT.md (limiti).
// CHIAVI / requisiti (variabili d'ambiente):
//   IG_USER_ID    -> id dell'account Instagram BUSINESS/CREATOR (collegato a una Pagina FB)
//   IG_ACCESS_TOKEN -> access token con permessi instagram_content_publish
//   (in alternativa) N8N_WEBHOOK_URL -> instrada a n8n collegato a Meta
// ENDPOINT (2 passi): POST /{IG_USER_ID}/media  (crea il container) → POST /{IG_USER_ID}/media_publish
//
// LIMITE REALE IMPORTANTE: l'API pubblica SOLO con un'IMMAGINE/VIDEO ospitato a un URL PUBBLICO
//   (mediaRef obbligatorio). Niente media → non si può pubblicare. Niente caption-only.
//   Richiede account Business, app Meta approvata, Business Verification.
//
// COLORE: 🟡 (post pubblico). Se manca mediaRef → l'autopilot lo segnala e NON pubblica.

import { postJSON, conUtm, logRiga, esito } from "./_comune.mjs";

const IG = process.env.IG_USER_ID;
const TOKEN = process.env.IG_ACCESS_TOKEN;
const N8N = process.env.N8N_WEBHOOK_URL;
const GRAPH = "https://graph.facebook.com/v21.0";

export async function pubblica(voce, ctx) {
  const testo = conUtm(voce.testo, voce.utm);
  const viaApi = IG && TOKEN;
  const haCanale = viaApi || N8N;

  // Requisito specifico IG: serve un media a URL pubblico.
  if (!voce.mediaRef) {
    logRiga(ctx.live, "instagram", "SALTATO: Instagram richiede una foto/video (mediaRef) a URL pubblico");
    return esito("instagram", "manca-media", "Instagram non pubblica testo senza immagine");
  }

  if (!ctx.live || !haCanale) {
    logRiga(false, "instagram", `media ${voce.mediaRef} :: caption "${testo.slice(0, 100)}…"`);
    return esito("instagram", haCanale ? "dry-run" : "manca-chiave", "IG_USER_ID+IG_ACCESS_TOKEN oppure N8N_WEBHOOK_URL");
  }

  if (N8N) {
    const r = await postJSON(N8N, { "Content-Type": "application/json" }, { canale: "instagram", testo, mediaRef: voce.mediaRef, fonte: "autopilot" });
    logRiga(true, "instagram", r.ok ? "inviato a n8n" : `errore ${r.status}`);
    return esito("instagram", r.ok ? "inviato" : "errore", r.ok ? "via n8n" : `${r.status} ${r.text}`);
  }

  // Passo 1: crea il media container.
  const c = await postJSON(`${GRAPH}/${IG}/media`, { "Content-Type": "application/json" }, { image_url: voce.mediaRef, caption: testo, access_token: TOKEN });
  if (!c.ok) {
    logRiga(true, "instagram", `errore container ${c.status}`);
    return esito("instagram", "errore", `container ${c.status} ${c.text}`);
  }
  let creationId;
  try { creationId = JSON.parse(c.text).id; } catch { /* lasciamo undefined */ }
  // Passo 2: pubblica il container.
  const p = await postJSON(`${GRAPH}/${IG}/media_publish`, { "Content-Type": "application/json" }, { creation_id: creationId, access_token: TOKEN });
  logRiga(true, "instagram", p.ok ? "pubblicato" : `errore publish ${p.status}`);
  return esito("instagram", p.ok ? "inviato" : "errore", p.ok ? "" : `${p.status} ${p.text}`);
}
