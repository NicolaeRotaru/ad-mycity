// telegram.mjs — Publisher per Telegram (canale/gruppo o avviso a Nicola).
//
// MANO: gratis ⭐ (la prima da accendere). Vedi collega-le-mani.md punto 1.
// CHIAVI necessarie (variabili d'ambiente):
//   TELEGRAM_BOT_TOKEN  -> token del bot creato con @BotFather
//   TELEGRAM_CHAT_ID    -> id del canale/gruppo/chat di destinazione
// ENDPOINT: https://api.telegram.org/bot<TOKEN>/sendMessage  (sendPhoto se c'e' mediaRef)
//
// COLORE: 🟢 se scrive a te stesso / canale interno; 🟡 se è un canale pubblico con clienti.

import { postJSON, conUtm, logRiga, esito } from "./_comune.mjs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;

export async function pubblica(voce, ctx) {
  const testo = conUtm(voce.testo, voce.utm);
  const haChiavi = TOKEN && CHAT;

  if (!ctx.live || !haChiavi) {
    logRiga(false, "telegram", `chat ${CHAT || "?"} :: ${testo}${voce.mediaRef ? `  [media: ${voce.mediaRef}]` : ""}`);
    return esito("telegram", haChiavi ? "dry-run" : "manca-chiave", "TELEGRAM_BOT_TOKEN/CHAT_ID");
  }

  // LIVE: se c'e' un media usa sendPhoto, altrimenti sendMessage.
  const base = `https://api.telegram.org/bot${TOKEN}`;
  const r = voce.mediaRef
    ? await postJSON(`${base}/sendPhoto`, { "Content-Type": "application/json" }, { chat_id: CHAT, photo: voce.mediaRef, caption: testo })
    : await postJSON(`${base}/sendMessage`, { "Content-Type": "application/json" }, { chat_id: CHAT, text: testo });

  logRiga(true, "telegram", r.ok ? "inviato" : `errore ${r.status}`);
  return esito("telegram", r.ok ? "inviato" : "errore", r.ok ? "" : `${r.status} ${r.text}`);
}
