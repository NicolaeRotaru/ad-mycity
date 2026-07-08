// Esecutore delle azioni APPROVATE dell'AD: fa partire un'azione sul canale giusto.
// Mani dirette (email, notifica in-app, Telegram) + hub universale (n8n) che instrada al resto.
//
// SICUREZZA: di default gira in DRY-RUN → NON invia nulla, stampa solo cosa farebbe.
// Per inviare davvero servono le chiavi + AZIONI_LIVE=1 (vedi cervello/collega-le-mani.md).
// AR-103: AZIONI_LIVE=1 NON basta più. Prima di ogni invio reale il cancello di consenso per-azione
// (cervello/consenso-azione.mjs) verifica: PAUSA off + AZIONE_ID firmato in AZIONI-IN-ATTESA.md +
// destinatario nella allowlist (cervello/mani-allowlist.json). Se manca uno → resta DRY-RUN.
//
// Uso:
//   node esegui-azione.mjs                                  -> stato dei canali (verifica)
//   node esegui-azione.mjs telegram "<testo>"
//   node esegui-azione.mjs email <to> "<oggetto>" "<testo>"
//   node esegui-azione.mjs notifica <userId> "<titolo>" "<corpo>" [link]
//   node esegui-azione.mjs n8n '<json>'        (l'hub n8n instrada a WhatsApp/social/Google/ecc.)
//   node esegui-azione.mjs github-merge ad-mycity|mycity <prNum>   (merge PR — 🔴, AZIONI_LIVE=1)

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { consensoInvio } from "./consenso-azione.mjs";

const LIVE = process.env.AZIONI_LIVE === "1" || process.env.AZIONI_LIVE === "on";
// AR-078: ogni mano reale è 🟡 e va legata al percorso proponi→firma→registra.
// L'azione LIVE deve citare l'id della coda AZIONI-IN-ATTESA (env AZIONE_ID) e
// lasciare traccia append-only in DECISIONI.md. Vault = memoria della macchina.
const AZIONE_ID = process.env.AZIONE_ID || "(non collegata a AZIONI-IN-ATTESA)";
const VAULT = fileURLToPath(new URL("../MyCity-Vault/90-Memoria-AI/", import.meta.url));

// AR-078: traccia in DECISIONI.md (data+ora, cosa, perché) al momento dell'esecuzione LIVE.
function tracciaDecisione(cosa) {
  if (!LIVE) return; // in DRY-RUN non si tocca il mondo → niente traccia
  try {
    const now = new Date();
    const p = (n) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
    const riga = `- ${ts} · 🟡 · [AD/esegui-azione] · MANO ESEGUITA (LIVE): ${cosa} · azione coda AZIONI-IN-ATTESA: ${AZIONE_ID} · —\n`;
    fs.appendFileSync(new URL("DECISIONI.md", "file://" + VAULT), riga);
  } catch (e) {
    console.log(`[avviso] traccia DECISIONI non scritta: ${e.message}`);
  }
}
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
  console.log(`  modalita':          ${LIVE ? "LIVE (invia solo cio' che e' firmato)" : "DRY-RUN (non invia nulla)"}`);
  console.log(`  cancello AR-103:    consenso per-azione ATTIVO (PAUSA + AZIONE_ID firmato + allowlist destinatari)`);
  console.log("\nPer l'invio reale: chiavi + AZIONI_LIVE=1 + AZIONE_ID di una casella APPROVATA + destinatario in cervello/mani-allowlist.json.");
}

async function post(url, headers, body) {
  const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  return { ok: r.ok, status: r.status, text: (await r.text()).slice(0, 300) };
}

// AR-103: prima di OGNI invio reale, il cancello di consenso per-azione. Se nega, degrada a DRY-RUN
// stampando il motivo (pausa? azione non firmata? destinatario non in allowlist?). Nulla parte "al buio".
async function invioAutorizzato(canale, destinatario) {
  if (!LIVE) return { live: false, motivo: "AZIONI_LIVE non attivo (DRY-RUN)" };
  return consensoInvio({ azioneId: AZIONE_ID, canale, destinatario });
}

async function telegram(testo) {
  if (!testo) return console.log('Manca il testo. Uso: telegram "<testo>"');
  const g = await invioAutorizzato("telegram", TG_CHAT);
  if (!g.live || !TG_TOKEN || !TG_CHAT) return console.log(`[DRY-RUN] TELEGRAM → ${testo}${LIVE && !g.live ? `\n  (bloccato: ${g.motivo})` : ""}`);
  const r = await post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { "Content-Type": "application/json" }, { chat_id: TG_CHAT, text: testo });
  console.log(r.ok ? "Telegram inviato" : `Errore Telegram: ${r.status} ${r.text}`);
  if (r.ok) tracciaDecisione(`Telegram → "${testo}"`); // AR-078
}

async function email(to, subject, text) {
  if (!to) return console.log('Manca il destinatario. Uso: email <to> "<oggetto>" "<testo>"');
  const g = await invioAutorizzato("email", to);
  if (!g.live || !RESEND_KEY) return console.log(`[DRY-RUN] EMAIL → ${to}\n  oggetto: ${subject}\n  testo: ${text}${LIVE && !g.live ? `\n  (bloccato: ${g.motivo})` : ""}`);
  const r = await post("https://api.resend.com/emails", { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" }, { from: RESEND_FROM, to, subject, text });
  console.log(r.ok ? `Email inviata a ${to}` : `Errore email: ${r.status} ${r.text}`);
  if (r.ok) tracciaDecisione(`Email → ${to} · oggetto: ${subject}`); // AR-078
}

async function notifica(userId, title, body, link) {
  if (!userId) return console.log('Manca userId. Uso: notifica <userId> "<titolo>" "<corpo>" [link]');
  const g = await invioAutorizzato("notifica", userId);
  if (!g.live || !MKT_URL || !MKT_WRITE_KEY) return console.log(`[DRY-RUN] NOTIFICA → utente ${userId}\n  ${title}: ${body}${link ? "  (" + link + ")" : ""}${LIVE && !g.live ? `\n  (bloccato: ${g.motivo})` : ""}`);
  const r = await post(`${MKT_URL}/rest/v1/notifications`, { apikey: MKT_WRITE_KEY, Authorization: `Bearer ${MKT_WRITE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" }, { user_id: userId, title, body, link });
  console.log(r.ok ? `Notifica creata per ${userId}` : `Errore notifica: ${r.status} ${r.text}`);
  if (r.ok) tracciaDecisione(`Notifica in-app → utente ${userId} · ${title}`); // AR-078
}

// Hub universale: l'AD manda un'azione json a n8n, che la instrada (whatsapp/social/google/...).
async function n8n(jsonStr) {
  let payload;
  try { payload = JSON.parse(jsonStr || "{}"); } catch { return console.log('JSON non valido. Es: n8n \'{"canale":"whatsapp","a":"+39...","testo":"ciao"}\''); }
  const g = await invioAutorizzato("n8n", payload?.a || payload?.canale || "");
  if (!g.live || !N8N) return console.log(`[DRY-RUN] n8n → ${JSON.stringify(payload)}${LIVE && !g.live ? `\n  (bloccato: ${g.motivo})` : ""}`);
  const r = await post(N8N, { "Content-Type": "application/json" }, { ...payload, fonte: "mycity-AD" });
  console.log(r.ok ? "Azione inviata a n8n" : `Errore n8n: ${r.status} ${r.text}`);
  if (r.ok) tracciaDecisione(`n8n hub → ${JSON.stringify(payload).slice(0, 120)}`); // AR-078
}

async function githubMerge(repoKey, prStr) {
  const pr = Number(prStr);
  if (repoKey !== "ad-mycity" && repoKey !== "mycity") {
    return console.log('Uso: github-merge ad-mycity|mycity <numeroPR>');
  }
  if (!Number.isFinite(pr) || pr < 1) {
    return console.log('Uso: github-merge ad-mycity|mycity <numeroPR>');
  }
  const { spawnSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const script = fileURLToPath(new URL("./git-merge.mjs", import.meta.url));
  // AR-103: anche il merge reale passa dal cancello di consenso. Se nega → forza --dry-run.
  const g = await invioAutorizzato("github", `${repoKey}#${pr}`);
  if (LIVE && !g.live) console.log(`[merge BLOCCATO → dry-run] ${g.motivo}`);
  const extra = LIVE && g.live ? [] : ["--dry-run"];
  const r = spawnSync(process.execPath, [script, "--repo", repoKey, "--pr", String(pr), ...extra], {
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd) stato();
else if (cmd === "telegram") await telegram(rest[0]);
else if (cmd === "email") await email(rest[0], rest[1] || "(senza oggetto)", rest[2] || "");
else if (cmd === "notifica") await notifica(rest[0], rest[1] || "", rest[2] || "", rest[3]);
else if (cmd === "n8n") await n8n(rest[0]);
else if (cmd === "github-merge") await githubMerge(rest[0], rest[1]);
else console.log('Comando sconosciuto. Uso: (niente) | telegram | email | notifica | n8n | github-merge. Vedi l\'header del file.');
