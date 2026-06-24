# 🔌 COLLEGA LE MANI — checklist per Nicola (prima le gratis)

> Ogni mano richiede un account/chiave **tuo**. Qui le metti in ordine: prima lo **starter pack gratis**, poi
> le a basso costo. Le chiavi si incollano nelle **variabili d'ambiente** (`.env.local` in locale, o le env del worker).
> ⚠️ Non incollare MAI le chiavi in chat: mettile solo nelle variabili d'ambiente.

## 🆓 STARTER PACK GRATIS (fai questi per primi)
1. **Telegram** (5 min) — apri Telegram, scrivi a **@BotFather** → `/newbot` → ottieni il `TOKEN`. Poi scrivi un
   messaggio al tuo bot e recupera il tuo `CHAT_ID`. Imposta: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
2. **n8n self-hosted** (gratis) — installa n8n (sul tuo PC o un VPS), crea un **Webhook**, copia l'URL in
   `N8N_WEBHOOK_URL`. Da qui n8n può instradare a WhatsApp/social/Google/ecc.
3. **Gemini** (free tier) — vai su Google AI Studio, crea una API key → `GEMINI_API_KEY`. (vision foto + immagini)
4. **Email (Resend)** (free) — crea account Resend, verifica un dominio, API key → `RESEND_API_KEY` (+ `RESEND_FROM`).
5. **Web push** — genera le chiavi VAPID (`npx web-push generate-vapid-keys`) → `VAPID_PUBLIC/PRIVATE_KEY`.
6. **Chiave SCRITTURA marketplace** — la `service_role` di Supabase del marketplace → `MARKETPLACE_SUPABASE_WRITE_KEY`.
   ⚠️ È potente: abilita email/notifiche/coupon a partire DAVVERO. Inizia col canale a rischio minimo (notifica a te stesso).
7. **Google** (free) — account Google → abilita le API che servono (Sheets, Business Profile). Le colleghi via n8n.

## 💸 A BASSO COSTO (quando servono)
- **WhatsApp Business** — richiede un numero dedicato + **verifica business su Meta** (più lenta). Si collega via n8n.
- **Groq / DeepSeek** (alto volume cheap) — crea API key → `GROQ_API_KEY` / `DEEPSEEK_API_KEY`.
- **Stripe write** — già hai l'account; le azioni di denaro restano **🔴 firma**.

## 💰 SOLO CON BUDGET (🔴)
Ads (Meta/Google/TikTok), WhatsApp a volume, voce a volume, stampa fisica.

---
## Come accendere l'invio reale
Di default tutto è in **DRY-RUN** (non parte nulla). Quando hai messo le chiavi:
- prova: `node cervello/esegui-azione.mjs` → vedi lo stato dei canali;
- per inviare davvero, imposta `AZIONI_LIVE=1`.
Registro mani: `cervello/azioni.md` · Banco AI: `cervello/banco-ai.md`.
