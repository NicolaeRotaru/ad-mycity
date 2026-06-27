// Esecutore delle azioni APPROVATE dell'AD: fa partire un'azione sul canale giusto.
// Mani dirette (email, notifica in-app, Telegram) + hub universale (n8n) che instrada al resto.
//
// SICUREZZA: di default gira in DRY-RUN → NON invia nulla, stampa solo cosa farebbe.
// Per inviare davvero servono le chiavi + AZIONI_LIVE=1 (vedi cervello/collega-le-mani.md).
//
// Uso:
//   node esegui-azione.mjs                                  -> stato dei canali (verifica)
//   node esegui-azione.mjs telegram "<testo>"
//   node esegui-azione.mjs email <to> "<oggetto>" "<testo>"
//   node esegui-azione.mjs notifica <userId> "<titolo>" "<corpo>" [link]
//   node esegui-azione.mjs n8n '<json>'        (l'hub n8n instrada a WhatsApp/social/Google/ecc.)

const LIVE = process.env.AZIONI_LIVE === "1" || process.env.AZIONI_LIVE === "on";
const RESEND_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "MyCity <no-reply@mycity.example>";
const MKT_URL = process.env.MARKETPLACE_SUPABASE_URL;
const MKT_WRITE_KEY = process.env.MARKETPLACE_SUPABASE_WRITE_KEY;
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_CHAT_ID;
const N8N = process.env.N8N_WEBHOOK_URL;

const ok = (v) => (v ? "configurato" : "NON configurato");
function stato() {
  console.log("Stato delle MANI dell'AD:");
  console.log(`  Telegram:           ${ok(TG_TOKEN && TG_CHAT)}`);
  console.log(`  Email (Resend):     ${ok(RESEND_KEY)}`);
  console.log(`  Notifica in-app:    ${ok(MKT_URL && MKT_WRITE_KEY)}`);
  console.log(`  n8n (hub):          ${ok(N8N)}`);
  console.log(`  modalita':          ${LIVE ? "LIVE (invia davvero)" : "DRY-RUN (non invia nulla)"}`);
  console.log("\nPer l'invio reale: collega le chiavi (cervello/collega-le-mani.md) e imposta AZIONI_LIVE=1.");
}

async function post(url, headers, body) {
  const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  return { ok: r.ok, status: r.status, text: (await r.text()).slice(0, 300) };
}

async function telegram(testo) {
  if (!testo) return console.log('Manca il testo. Uso: telegram "<testo>"');
  if (!LIVE || !TG_TOKEN || !TG_CHAT) return console.log(`[DRY-RUN] TELEGRAM → ${testo}`);
  const r = await post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { "Content-Type": "application/json" }, { chat_id: TG_CHAT, text: testo });
  console.log(r.ok ? "Telegram inviato" : `Errore Telegram: ${r.status} ${r.text}`);
}

async function email(to, subject, text) {
  if (!to) return console.log('Manca il destinatario. Uso: email <to> "<oggetto>" "<testo>"');
  if (!LIVE || !RESEND_KEY) return console.log(`[DRY-RUN] EMAIL → ${to}\n  oggetto: ${subject}\n  testo: ${text}`);
  const r = await post("https://api.resend.com/emails", { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" }, { from: RESEND_FROM, to, subject, text });
  console.log(r.ok ? `Email inviata a ${to}` : `Errore email: ${r.status} ${r.text}`);
}

async function notifica(userId, title, body, link) {
  if (!userId) return console.log('Manca userId. Uso: notifica <userId> "<titolo>" "<corpo>" [link]');
  if (!LIVE || !MKT_URL || !MKT_WRITE_KEY) return console.log(`[DRY-RUN] NOTIFICA → utente ${userId}\n  ${title}: ${body}${link ? "  (" + link + ")" : ""}`);
  const r = await post(`${MKT_URL}/rest/v1/notifications`, { apikey: MKT_WRITE_KEY, Authorization: `Bearer ${MKT_WRITE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" }, { user_id: userId, title, body, link });
  console.log(r.ok ? `Notifica creata per ${userId}` : `Errore notifica: ${r.status} ${r.text}`);
}

// Hub universale: l'AD manda un'azione json a n8n, che la instrada (whatsapp/social/google/...).
async function n8n(jsonStr) {
  let payload;
  try { payload = JSON.parse(jsonStr || "{}"); } catch { return console.log('JSON non valido. Es: n8n \'{"canale":"whatsapp","a":"+39...","testo":"ciao"}\''); }
  if (!LIVE || !N8N) return console.log(`[DRY-RUN] n8n → ${JSON.stringify(payload)}`);
  const r = await post(N8N, { "Content-Type": "application/json" }, { ...payload, fonte: "mycity-AD" });
  console.log(r.ok ? "Azione inviata a n8n" : `Errore n8n: ${r.status} ${r.text}`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd) stato();
else if (cmd === "telegram") await telegram(rest[0]);
else if (cmd === "email") await email(rest[0], rest[1] || "(senza oggetto)", rest[2] || "");
else if (cmd === "notifica") await notifica(rest[0], rest[1] || "", rest[2] || "", rest[3]);
else if (cmd === "n8n") await n8n(rest[0]);
else console.log('Comando sconosciuto. Uso: (niente) | telegram | email | notifica | n8n. Vedi l\'header del file.');
