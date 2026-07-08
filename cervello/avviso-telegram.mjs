#!/usr/bin/env node
// 📲 AVVISO-TELEGRAM (AR-104) — mandare UN messaggio libero a Nicola su Telegram, riusando ESATTAMENTE
// lo stesso canale/meccanismo di notifica-approvazioni.mjs (fetch → api.telegram.org/sendMessage,
// chiavi TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID da cervello/vps/.env). NON un canale nuovo: lo stesso.
//
// PERCHÉ SEPARATO: notifica-approvazioni.mjs manda la CODA di approvazioni (con dedup). Qui serve un
// avviso ad-hoc (es. "memoria incoerente, giro NON pubblicato") che deve squillare sempre, senza dedup.
//
// COLORE: 🟢 — avviso a Nicola stesso (canale interno, come da cervello/azioni.md: "Telegram avvisi a
// te = 🟢"). NON scrive a clienti, NON pubblica nulla.
//
// CHIAVI: senza TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID → DRY-RUN (stampa cosa manderebbe). Exit 0 SEMPRE:
// avvisare non deve far fallire il chiamante (il gate che blocca il push è un ALTRO controllo).
//
// USO:  node cervello/avviso-telegram.mjs "testo del messaggio"
//       echo "testo" | node cervello/avviso-telegram.mjs        (legge da stdin se manca l'argomento)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const CHAT = process.env.TELEGRAM_CHAT_ID?.trim();
const DRY = !TOKEN || !CHAT || process.argv.includes("--dry");

// 📮 CASELLA AVVISI (richiesta di Nicola, 2026-07-09): finché Telegram non è collegato, ogni avviso
// deve comunque arrivargli. Lo depositiamo in un file di memoria che il Pannello legge già
// (readVaultFile) e mostra nella scheda «📣 Avvisi» dentro Azioni. Così l'avviso NON si perde mai:
//  - Telegram spento  → resta nella casella (il Pannello lo mostra);
//  - push bloccato dal gate → sul Pannello del VPS (che legge il filesystem) compare subito lo stesso.
// Path risolto dallo script (non dal cwd): cervello/ → ../MyCity-Vault/… = radice repo.
const CASELLA = fileURLToPath(new URL("../MyCity-Vault/90-Memoria-AI/avvisi-macchina.json", import.meta.url));
const MAX_AVVISI = 50; // teniamo solo gli ultimi 50: la casella non cresce all'infinito (e vault-sanità resta felice).

function depositaInCasella(t) {
  try {
    let lista = [];
    try {
      const grezzo = JSON.parse(readFileSync(CASELLA, "utf8"));
      if (Array.isArray(grezzo)) lista = grezzo;
      else if (Array.isArray(grezzo?.avvisi)) lista = grezzo.avvisi; // tollera entrambe le forme
    } catch { /* file assente o vuoto: si parte da lista vuota */ }
    lista.push({ at: new Date().toISOString(), testo: t, canale: DRY ? "casella" : "telegram+casella" });
    if (lista.length > MAX_AVVISI) lista = lista.slice(-MAX_AVVISI);
    // Scriviamo la forma { avvisi: [...] }: JSON valido stabile (vault-sanità lo verifica a ogni giro).
    writeFileSync(CASELLA, JSON.stringify({ aggiornato: new Date().toISOString(), avvisi: lista }, null, 2) + "\n");
  } catch (e) {
    // La casella è best-effort: se non riesco a scrivere NON blocco l'avviso (Telegram può ancora partire).
    console.error(`avviso-telegram: casella non scritta (${e.message})`);
  }
}

// testo: dall'argomento (unendo tutti gli arg non-flag) o da stdin
let testo = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ").trim();
if (!testo) {
  try {
    testo = readFileSync(0, "utf8").trim(); // fd 0 = stdin
  } catch { /* niente stdin */ }
}
if (!testo) {
  console.error("avviso-telegram: nessun testo (passa un argomento o via stdin).");
  process.exit(0); // non è un errore fatale per il chiamante
}

// Deposita SEMPRE nella casella del Pannello, prima di provare Telegram: l'avviso non si perde
// nemmeno se Telegram è spento o l'invio fallisce.
depositaInCasella(testo);

// Stesso identico invio di notifica-approvazioni.mjs::inviaTelegram
async function inviaTelegram(t) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text: t, disable_web_page_preview: true }),
  });
  return { ok: r.ok, status: r.status, text: (await r.text()).slice(0, 200) };
}

if (DRY) {
  console.log(`[DRY-RUN] TELEGRAM → ${testo.replace(/\n/g, " · ")}`);
  console.log("📮 Salvato nella casella Avvisi del Pannello (Azioni › 📣 Avvisi).");
  if (!TOKEN || !CHAT) console.log("(Telegram non collegato: mancano TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID in cervello/vps/.env)");
  process.exit(0);
}

try {
  const r = await inviaTelegram(testo);
  console.log(r.ok ? "📲 Avviso inviato a Nicola su Telegram." : `❌ Invio Telegram fallito: ${r.status} ${r.text}`);
} catch (e) {
  console.error(`❌ Invio Telegram fallito: ${e.message}`);
}
process.exit(0); // sempre 0: l'avviso non deve rompere il giro
