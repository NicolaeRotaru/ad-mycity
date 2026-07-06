#!/usr/bin/env node
// 📲 NOTIFICA-APPROVAZIONI (richiesta di Nicola 2026-07-05) — le cose da firmare ARRIVANO A LUI,
// non aspettano che apra il Pannello.
//
// COSA FA: legge la coda MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md (righe-tabella con stato
// "in attesa" + blocchi ##/### 🟡/🔴 in attesa), trova le azioni NON ancora notificate (stato in
// auto-coscienza/notifiche-approvazioni.json) e manda UN messaggio Telegram a Nicola con titolo,
// colore e "cosa cambia". Ogni azione viene notificata UNA volta sola (dedup persistente).
//
// COLORE: 🟢 — è un avviso a Nicola stesso (canale interno, vedi cervello/azioni.md: "Telegram
// avvisi a te = 🟢"). NON pubblica nulla, NON scrive a clienti: dice al proprietario che c'è
// una firma che lo aspetta. Il collo di bottiglia n.1 della macchina è il tempo firma→azione.
//
// CHIAVI: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (cervello/vps/.env). Senza chiavi → dry-run
// (stampa cosa manderebbe, NON segna come notificato: al collegamento delle chiavi recupera tutto).
//
// USO:
//   node cervello/notifica-approvazioni.mjs           -> trova le nuove e le manda (o dry-run senza chiavi)
//   node cervello/notifica-approvazioni.mjs --dry     -> forza dry-run anche con le chiavi
//   node cervello/notifica-approvazioni.mjs --json    -> output JSON (per giro / sentinelle)
//   node cervello/notifica-approvazioni.mjs --test    -> manda un messaggio di prova (verifica chiavi)
//
// Cablato in giro.sh a fine giro (dopo il sync della memoria): ogni giro che accoda azioni nuove
// le fa squillare in tasca a Nicola. Exit 0 sempre (informa, non blocca il giro).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const CODA_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
const STATE_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/notifiche-approvazioni.json");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const CHAT = process.env.TELEGRAM_CHAT_ID?.trim();
const PANNELLO = process.env.PANNELLO_URL?.trim(); // es. https://pannello-mycity.vercel.app (opzionale)

const args = process.argv.slice(2);
const JSON_MODE = args.includes("--json");
const DRY = args.includes("--dry") || !TOKEN || !CHAT;
const TEST = args.includes("--test");
const MAX_PER_MESSAGGIO = 6; // non trasformare Telegram in un muro di testo: le altre le conta

function idAzione(titolo, data) {
  return createHash("sha1").update(`${data}|${titolo}`).digest("hex").slice(0, 12);
}

function pulisciTitolo(t) {
  return t
    .replace(/\*\*/g, "")
    .replace(/\{origine:[^}]*\}/g, "") // tag interni del Pannello: non-umani, fuori dal messaggio
    .replace(/\s+/g, " ")
    .trim();
}

// Estrae le azioni "in attesa" dalla coda: (a) righe della tabella a 8/10 colonne, (b) blocchi ##/###.
export function estraiAzioni(testo) {
  const azioni = [];

  // (a) Righe-tabella: | # | Data e ora | Reparto | Azione | Colore | Contenuto | Canale | Stato | [Cosa cambia | Se va bene]
  for (const riga of testo.split("\n")) {
    if (!riga.trim().startsWith("|")) continue;
    const celle = riga.split("|").map((c) => c.trim());
    // celle[0] è vuota (la riga inizia con |): numero=1, data=2, reparto=3, azione=4, colore=5, stato=8
    if (celle.length < 9) continue;
    const numero = celle[1];
    if (!/^\d+$/.test(numero)) continue; // header/separatori fuori
    const stato = celle[8] || "";
    if (!/in attesa/i.test(stato)) continue;
    const colore = /🔴/.test(celle[5]) ? "🔴" : /🟡/.test(celle[5]) ? "🟡" : "";
    if (!colore) continue;
    const titolo = pulisciTitolo(celle[4] || "");
    if (!titolo) continue;
    azioni.push({
      id: idAzione(titolo, celle[2] || ""),
      numero,
      data: celle[2] || "",
      reparto: (celle[3] || "").replace(/^@/, ""),
      titolo,
      colore,
      cosa_cambia: pulisciTitolo(celle[9] || ""),
    });
  }

  // (b) Blocchi `##`/`###` con 🟡/🔴 il cui corpo dice "in attesa" (il formato libero dei senior).
  const blocchi = testo.split(/^##+ /m).slice(1);
  for (const b of blocchi) {
    const [prima, ...resto] = b.split("\n");
    const corpo = resto.join("\n");
    const colore = /🔴/.test(prima) ? "🔴" : /🟡/.test(prima) ? "🟡" : "";
    if (!colore) continue;
    if (!/in attesa|IN ATTESA/i.test(corpo)) continue;
    if (/✅\s*(FATTO|MERGED|DECISO)/i.test(prima)) continue;
    const titolo = pulisciTitolo(prima.replace(/[🔴🟡]/g, ""));
    if (!titolo) continue;
    const dataM = b.match(/(\d{4}-\d{2}-\d{2})/);
    azioni.push({
      id: idAzione(titolo, dataM ? dataM[1] : ""),
      numero: "",
      data: dataM ? dataM[1] : "",
      reparto: (prima.match(/@([a-z0-9-]+)/i) || [])[1] || "",
      titolo,
      colore,
      cosa_cambia: "",
    });
  }

  // Dedup per id (una tabella + un blocco che descrivono la stessa azione contano una volta).
  const visti = new Set();
  return azioni.filter((a) => (visti.has(a.id) ? false : (visti.add(a.id), true)));
}

export function componiMessaggio(nuove, totaleInCoda) {
  const righe = [];
  righe.push(`🖊️ MyCity — ${nuove.length === 1 ? "1 nuova cosa" : `${nuove.length} nuove cose`} da approvare (${totaleInCoda} in coda):`);
  righe.push("");
  for (const a of nuove.slice(0, MAX_PER_MESSAGGIO)) {
    righe.push(`${a.colore} ${a.numero ? `#${a.numero} · ` : ""}${a.titolo}${a.reparto ? `  (@${a.reparto})` : ""}`);
    if (a.cosa_cambia) righe.push(`   ↳ ${a.cosa_cambia}`);
  }
  if (nuove.length > MAX_PER_MESSAGGIO) {
    righe.push(`…e altre ${nuove.length - MAX_PER_MESSAGGIO} in coda.`);
  }
  righe.push("");
  righe.push(PANNELLO ? `Approva dal Pannello: ${PANNELLO}` : `Approva dal Pannello, o scrivi all'AD "ok <numero>".`);
  return righe.join("\n");
}

async function inviaTelegram(testo) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text: testo, disable_web_page_preview: true }),
  });
  return { ok: r.ok, status: r.status, text: (await r.text()).slice(0, 200) };
}

function leggiStato() {
  if (!existsSync(STATE_PATH)) {
    return {
      _cosa_e:
        "📲 Registro delle azioni della coda già NOTIFICATE a Nicola su Telegram (dedup: ogni azione squilla una volta sola). Scritto da cervello/notifica-approvazioni.mjs.",
      notificate: {},
      meta: { totale_notifiche: 0 },
    };
  }
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch {
    return { notificate: {}, meta: { totale_notifiche: 0 } };
  }
}

async function main() {
  const quando = nowPiacenza();

  if (TEST) {
    const msg = `📲 Prova di collegamento — ${quando}\nSe leggi questo, le notifiche di approvazione sono attive.`;
    if (DRY) {
      console.log(`[DRY-RUN] TELEGRAM → ${msg.replace(/\n/g, " · ")}`);
      console.log(TOKEN && CHAT ? "(--dry forzato)" : "(mancano TELEGRAM_BOT_TOKEN/CHAT_ID in cervello/vps/.env)");
    } else {
      const r = await inviaTelegram(msg);
      console.log(r.ok ? "✅ Messaggio di prova inviato." : `❌ Invio fallito: ${r.status} ${r.text}`);
      process.exit(r.ok ? 0 : 1);
    }
    process.exit(0);
  }

  if (!existsSync(CODA_PATH)) {
    console.log("📲 notifica-approvazioni: AZIONI-IN-ATTESA.md assente — nulla da notificare.");
    process.exit(0);
  }

  const azioni = estraiAzioni(readFileSync(CODA_PATH, "utf8"));
  const stato = leggiStato();
  const nuove = azioni.filter((a) => !stato.notificate[a.id]);

  const out = { quando, in_coda: azioni.length, nuove: nuove.length, dry_run: DRY, titoli_nuove: nuove.map((a) => a.titolo) };

  if (!nuove.length) {
    await stampSegnale("notifica-approvazioni", "ok", `0 nuove · ${azioni.length} in coda · ${quando}`);
    console.log(JSON_MODE ? JSON.stringify(out, null, 2) : `📲 Nessuna azione nuova da notificare (${azioni.length} in coda, già tutte notificate).`);
    process.exit(0);
  }

  const messaggio = componiMessaggio(nuove, azioni.length);

  if (DRY) {
    await stampSegnale("notifica-approvazioni", "warn", `${nuove.length} nuove NON inviate (${TOKEN && CHAT ? "dry forzato" : "chiavi Telegram mancanti"}) · ${quando}`);
    if (JSON_MODE) console.log(JSON.stringify({ ...out, messaggio }, null, 2));
    else {
      console.log(`[DRY-RUN] TELEGRAM → manderei questo messaggio (${nuove.length} nuove):\n`);
      console.log(messaggio);
      if (!TOKEN || !CHAT) console.log("\n(mancano TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID: al collegamento le notifiche partono da sole, niente va perso)");
    }
    // NON segna come notificate: quando le chiavi arrivano, il primo run reale recupera tutto.
    process.exit(0);
  }

  const r = await inviaTelegram(messaggio);
  if (r.ok) {
    for (const a of nuove) stato.notificate[a.id] = { titolo: a.titolo, colore: a.colore, notificata_il: quando };
    stato.aggiornato = quando;
    stato.meta = stato.meta || {};
    stato.meta.totale_notifiche = (stato.meta.totale_notifiche || 0) + 1;
    mkdirSync(dirname(STATE_PATH), { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify(stato, null, 2) + "\n", "utf8");
  }
  await stampSegnale(
    "notifica-approvazioni",
    r.ok ? "ok" : "errore",
    r.ok ? `${nuove.length} nuove notificate a Nicola · ${quando}` : `invio fallito ${r.status} · ${quando}`
  );
  if (JSON_MODE) console.log(JSON.stringify({ ...out, inviato: r.ok, telegram: r.status }, null, 2));
  else console.log(r.ok ? `📲 Notificate ${nuove.length} nuove azioni a Nicola su Telegram.` : `❌ Invio Telegram fallito: ${r.status} ${r.text}`);
  process.exit(0);
}

// Import-safe per i test: gira solo se invocato direttamente.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => {
    console.error("ERRORE notifica-approvazioni:", e.message || e);
    await stampSegnale("notifica-approvazioni", "errore", `crash: ${(e.message || e).toString().slice(0, 180)}`);
    process.exit(1);
  });
}
