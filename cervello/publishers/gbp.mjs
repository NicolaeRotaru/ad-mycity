// gbp.mjs — Publisher Google Business Profile (post sulla scheda Google/Maps del negozio o di MyCity).
//
// MANO: gratis. Vedi azioni.md (Google Business Profile) e collega-le-mani.md punto 7.
// CONSIGLIATO passare via n8n: l'OAuth Google e' piu' semplice da gestire in un nodo n8n
// che non incollando token nello script. Qui supportiamo entrambe le vie.
//
// CHIAVI / requisiti (variabili d'ambiente):
//   GBP_ACCESS_TOKEN  -> access token OAuth2 con scope business.manage (via Google Cloud)
//   GBP_ACCOUNT_ID    -> id account GBP
//   GBP_LOCATION_ID   -> id della scheda (location)
//   (in alternativa) N8N_WEBHOOK_URL -> instrada il post a un workflow n8n che parla con Google
// ENDPOINT: https://mybusiness.googleapis.com/v4/accounts/{acc}/locations/{loc}/localPosts
//
// COLORE: 🟡 (contenuto pubblico sulla scheda; non irreversibile, si può cancellare il post).
// LIMITE REALE: l'API GBP richiede progetto Google Cloud + richiesta accesso (revisione Google).

import { postJSON, conUtm, logRiga, esito } from "./_comune.mjs";

const TOKEN = process.env.GBP_ACCESS_TOKEN;
const ACC = process.env.GBP_ACCOUNT_ID;
const LOC = process.env.GBP_LOCATION_ID;
const N8N = process.env.N8N_WEBHOOK_URL;

export async function pubblica(voce, ctx) {
  const testo = conUtm(voce.testo, voce.utm);
  const viaApi = TOKEN && ACC && LOC;
  const haCanale = viaApi || N8N;

  if (!ctx.live || !haCanale) {
    logRiga(false, "gbp", `post sulla scheda :: ${testo.slice(0, 120)}…${voce.mediaRef ? `  [media: ${voce.mediaRef}]` : ""}`);
    return esito("gbp", haCanale ? "dry-run" : "manca-chiave", "GBP_ACCESS_TOKEN+ACCOUNT+LOCATION oppure N8N_WEBHOOK_URL");
  }

  // Preferenza: se c'e' n8n, instrada lì (gestisce il refresh OAuth).
  if (N8N) {
    const r = await postJSON(N8N, { "Content-Type": "application/json" }, { canale: "gbp", testo, mediaRef: voce.mediaRef, fonte: "autopilot" });
    logRiga(true, "gbp", r.ok ? "inviato a n8n" : `errore ${r.status}`);
    return esito("gbp", r.ok ? "inviato" : "errore", r.ok ? "via n8n" : `${r.status} ${r.text}`);
  }

  // Via API diretta.
  const url = `https://mybusiness.googleapis.com/v4/accounts/${ACC}/locations/${LOC}/localPosts`;
  const body = {
    languageCode: "it",
    summary: testo,
    topicType: "STANDARD",
    ...(voce.mediaRef ? { media: [{ mediaFormat: "PHOTO", sourceUrl: voce.mediaRef }] } : {}),
  };
  const r = await postJSON(url, { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body);
  logRiga(true, "gbp", r.ok ? "pubblicato" : `errore ${r.status}`);
  return esito("gbp", r.ok ? "inviato" : "errore", r.ok ? "" : `${r.status} ${r.text}`);
}
