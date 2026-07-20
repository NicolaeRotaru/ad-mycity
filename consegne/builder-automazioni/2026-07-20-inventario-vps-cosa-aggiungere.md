---
data: 2026-07-20 02:12
tipo: inventario
reparto: builder-automazioni
origine: worker «cos'altro posso inserire sul VPS?» (refresh post N8N env L-357)
---

# VPS MyCity — cosa c'è già e cosa aggiungere (non altri programmi)

## In una riga per Nicola

**Sul VPS hai già tutto il software utile — adesso serve collegare le mani nel file env (prima: sistema le 3 righe n8n duplicate), non installare altro.**

---

## Stack verificato sul server (02:12)

| Pezzo | Stato | Prova |
|---|---|---|
| Worker chat + coda | ✅ attivo | `systemctl is-active mycity-worker` + `mycity-worker-chat` → active |
| Timer automatici | ✅ | giro 06:20, ritmo mattino/mezzogiorno/sera/settimana, sentinella, watch-main, monitora, verifica |
| n8n | ✅ risponde | HTTP 200 su `127.0.0.1:5678` |
| Playwright Content Factory | ✅ | `/opt/node22` + `/opt/pw-browsers` + `PLAYWRIGHT_BROWSERS_PATH` in env |
| Docker | ✅ (n8n) | container n8n in esecuzione (porta 5678) |
| Dati marketplace + Stripe + Resend | ✅ sensori | `verifica-sensori.mjs` exit 0 su REST/Stripe/Resend/sito/Pannello |

**Non serve sul VPS:** secondo cervello, Pannello web (resta Vercel), terminale web, PostHog (spento per decisione), container «a caso», WhatsApp diretto (Meta lento — passa da n8n dopo OAuth).

---

## Cosa manca — ordine consigliato (env + minuti, non installazioni)

### 1. Sistema `.env` n8n — **blocco attuale** (L-357)

Nicola ha incollato l'URL webhook ma nel file ci sono **3 righe** `N8N_WEBHOOK_URL` — le prime due sono ancora segnaposto; il loader usa **la prima che trova**.

**Fix SSH (5 min):**
1. Apri `/opt/mycity/ad-mycity/cervello/vps/.env`
2. Lascia **una sola** riga `N8N_WEBHOOK_URL=` con l'URL **Production** copiato dal nodo Webhook in n8n (non `/webhook-test/` — quello è solo per prove manuali)
3. Cancella tutte le altre righe duplicate
4. In n8n: workflow «Pubblica post programmato» → toggle **Active**
5. `sudo systemctl restart mycity-worker`
6. Scrivi in chat: **«webhook collegato»** → AD verifica sensori verdi

### 2. Telegram (~5 min) — **59 avvisi approvazione fermi**

Mancano `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` nel `.env`.

Passi: @BotFather → `/newbot` → token; messaggio al bot → chat id. Restart worker.

Sblocca: notifiche card «Da approvare» sul telefono senza aprire il Pannello.

Guida: `cervello/collega-le-mani.md` punto 1.

### 3. `BURN_MENSILE_EUR` (~2 min) — runway da 175 giri «sconosciuto»

Stripe **funziona** (cassa 0 €). Manca solo il denominatore burn.

Aggiungi una riga tipo `BURN_MENSILE_EUR=500` (stima costi fissi mensili reali). Restart worker.

Card già in coda: **🟡 #burn-mensile-env**. Diagnosi: `consegne/finanza/2026-07-20-diagnosi-cassa-runway.md`.

### 4. Altri workflow n8n (import, non nuovo software)

Modelli già in repo — import da SSH come «Pubblica post programmato»:

| File | A cosa serve |
|---|---|
| `consegne/automazioni/n8n/pubblica-post-programmato.json` | ✅ già importato — finire Active + webhook |
| `consegne/automazioni/n8n/raccolta-iscritti-lista-attesa.json` | Iscritti lista attesa → Google Sheet / alert |

Catalogo idee (carrello abbandonato, ordine pagato→negozio, meteo, …): chat 19/7 22:34–23:36 — tutti pendono webhook collegato.

### 5. Chiavi env opzionali (quando servono)

| Chiave | Sblocca | Priorità |
|---|---|---|
| `GEMINI_API_KEY` | Immagini/testi AI Content Factory sul VPS | media |
| `N8N_API_KEY` (read-only) | AD vede esecuzioni/errori nodi n8n | bassa |
| Meta OAuth **dentro n8n** | Post FB/IG automatici | alta ma **lenta** (giorni/settimane verifica Meta) |

Resend **già collegato** ✅. `AZIONI_LIVE=1` **già on** — azioni 🔴 restano comunque in coda firma.

---

## Cosa NON aggiungere ora

| Idea | Perché no |
|---|---|
| Secondo worker / secondo VPS | Un cervello basta; duplica costo e confusione |
| Pagina terminale nel Pannello | Rischio sicurezza (L-355) — usa chat + pulsanti preset |
| WhatsApp API diretta | Meta Business Verification lenta — n8n dopo FB collegato |
| Firecrawl / Tabnine MCP sul VPS | Chiavi/MCP opzionali sessione dev, non runtime worker |
| Pannello self-hosted | Vercel ok; deploy separato |

---

## Prossimo singolo passo consigliato

**Oggi ore 10:00** c'è PI26 a sportello 🔴 — ma in **2 minuti** tra una cosa e l'altra:

1. **Dedup `N8N_WEBHOOK_URL`** + URL Production + Active + restart → «webhook collegato»
2. Poi **Telegram** (5 min) — massimo impatto immediato sulle 59 notifiche pendenti

---

## Riferimenti

- Architettura worker vs n8n: L-344
- Checklist viva: `cervello/vps/CHECKLIST-VIVO.md`
- Mani autopilot: `consegne/automazioni/AUTOPILOT.md` + `cervello/collega-le-mani.md`
- Pulsanti Termux proposti (attesa ok Nicola): L-356 — fase 1 = 4 pulsanti Pannello, non software VPS
