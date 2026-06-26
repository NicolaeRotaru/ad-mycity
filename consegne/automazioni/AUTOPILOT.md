# 🛰️ Marketing Autopilot di MyCity

La macchina che permette all'AD di **pianificare, preparare e pubblicare** il marketing
sui vari canali **da solo**, una volta collegate le chiavi. Di default **non parte nulla**:
tutto è in DRY-RUN finché non ci sono (a) le chiavi del canale e (b) `AUTOPILOT_LIVE=1`,
e le azioni che toccano clienti reali/soldi restano **🔴 firma di Nicola**.

> ⛔ Non tocca mai `mycity-live` (il marketplace). Agisce solo su canali esterni (social, email, Telegram, Google).

---

## 🧩 Architettura (come è fatta)

```
 calendario-editoriale.json   →   autopilot.mjs (scheduler)   →   publishers/<canale>.mjs   →   canale reale
   (cosa, quando, dove)            legge le voci "in scadenza"      una funzione per canale       (o via n8n)
                                   applica il cancello 🟢🟡🔴        in DRY-RUN stampa soltanto
                                   logga + accoda le 🔴
```

- **`cervello/calendario-editoriale.json`** — il piano editoriale. Ogni voce: `data, canale, titolo,
  testo, mediaRef, utm, colore, stato`. È un file dati: lo riempiono content-social/marketing.
- **`cervello/autopilot.mjs`** — lo **scheduler**. Trova le voci con `data <= oggi` e `stato: programmato`,
  sceglie il publisher, esegue (dry-run di default), **logga** in `creativi/output/autopilot-log.jsonl`
  e **accoda** le voci 🔴 in `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md`.
- **`cervello/publishers/`** — un modulo per canale (`telegram, email, gbp, facebook, instagram`) +
  `_comune.mjs` (UTM, POST, logger) e `index.mjs` (registro). Ogni publisher ha la stessa firma
  `pubblica(voce, ctx)` e in dry-run stampa solo cosa farebbe.
- **`consegne/automazioni/n8n/`** — 2 workflow n8n esportabili (hub per i canali con OAuth complesso).

### Comandi
```bash
node cervello/autopilot.mjs              # stato + voci in scadenza oggi (dry-run)
node cervello/autopilot.mjs giro         # processa le voci in scadenza (dry-run)
node cervello/autopilot.mjs giro --tutto # processa TUTTE le voci programmate (utile per provare)
AUTOPILOT_LIVE=1 node cervello/autopilot.mjs giro   # pubblica davvero le 🟢/🟡 con chiavi pronte
```

---

## 🔌 Come si accende — checklist chiavi (in ordine di priorità)

Le chiavi vanno SOLO nelle variabili d'ambiente (`.env.local` o env del worker). **Mai in chat o nei file.**
Passo-passo per ottenerle: `cervello/collega-le-mani.md`.

| # | Mano | Variabili d'ambiente | Costo | Difficoltà | Sblocca |
|---|---|---|---|---|---|
| 1 | **Telegram** ⭐ | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | gratis | 5 min | avvisi a te + canale/gruppo |
| 2 | **n8n self-hosted** | `N8N_WEBHOOK_URL` | gratis | medio | hub per GBP/FB/IG/Google senza incollare token |
| 3 | **Gemini** (banco AI) | `GEMINI_API_KEY` | free tier | 5 min | generazione testi/immagini per i contenuti |
| 4 | **Email (Resend)** | `RESEND_API_KEY`, `RESEND_FROM` (+ `EMAIL_TEST_TO` per prove) | free tier | medio (dominio+DKIM) | newsletter/DEM |
| 5 | **Google Business** | `GBP_ACCESS_TOKEN`, `GBP_ACCOUNT_ID`, `GBP_LOCATION_ID` (o via n8n) | gratis | medio-alto (OAuth + revisione Google) | post su Maps/Google |
| 6 | **Facebook Page** | `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN` (o via n8n) | gratis | **alto** (app Meta + Business Verification) | post Pagina FB |
| 7 | **Instagram** | `IG_USER_ID`, `IG_ACCESS_TOKEN` (o via n8n) | gratis | **alto** (account Business + app Meta) | post feed IG |

**Consiglio operativo:** parti da Telegram (subito utile per avvisarti), poi n8n come hub, poi Email.
Meta (FB/IG) per ultimo: il setup è lento.

---

## 🟢🟡🔴 Cosa è quale colore

- **🟢 VERDE** — scrivere/modificare il calendario, lanciare l'autopilot in **DRY-RUN**, avvisi Telegram
  a te stesso / canale interno. → si fa da soli.
- **🟡 GIALLO** — pubblicare un **post pubblico** (FB/IG/GBP) o un avviso su un canale con clienti.
  È cancellabile → "fai e avvisa". In LIVE parte se ci sono le chiavi.
- **🔴 ROSSO** — **email/DEM a clienti reali** (serve consenso GDPR), qualsiasi cosa legata a **budget ads**,
  o azioni irreversibili. → **NON parte mai in automatico**: l'autopilot la **accoda** in
  `AZIONI-IN-ATTESA.md` per la firma di Nicola.

Il colore lo decide il campo `colore` della voce nel calendario. In LIVE lo scheduler **rispetta** il colore:
le 🔴 vengono accodate, non pubblicate.

---

## ⚠️ Limiti reali (da sapere prima di promettere)

- **Meta (Facebook + Instagram):** l'API di publishing richiede un'**app Meta** con i permessi
  `pages_manage_posts` / `instagram_content_publish`, e l'app deve passare l'**App Review** +
  **Business Verification** (documenti aziendali; può richiedere **giorni/settimane**). Finché l'app è in
  "modalità sviluppo" pubblica solo su account di test.
- **Instagram pubblica SOLO con un media** (foto/video) ospitato a un **URL pubblico** (`mediaRef`).
  Niente caption-only: il publisher salta la voce e lo segnala.
- **Google Business Profile:** serve un progetto Google Cloud e la **richiesta di accesso all'API**
  (revisione Google). Più semplice gestirlo via un nodo n8n (OAuth gestito).
- **Email (Resend):** il free tier ha limiti di volume; serve **dominio verificato (SPF/DKIM)** per
  non finire in spam. Le email marketing ai clienti richiedono **consenso + footer di disiscrizione**
  (validazione `@legale-privacy` prima del primo invio reale).
- **Telegram:** nessun limite pratico per i nostri volumi; è la mano più semplice e affidabile.

---

## 🤝 Handoff
- **PASSO-A @content-social / @marketing:** riempite il calendario con i contenuti veri (testi finali,
  `mediaRef` dalle grafiche di @designer/@ai-designer, URL lista d'attesa reale).
- **PASSO-A @legale-privacy:** validare footer/consenso prima di attivare il canale Email verso clienti.
- **RIVEDI @finanza:** se in futuro si collega un canale ads (sempre 🔴).

## 🙋 Cosa serve da Nicola per accendere
Collegare le chiavi nell'ordine sopra (almeno Telegram + n8n per partire), poi dare il via con
`AUTOPILOT_LIVE=1`. Le email/DEM ai clienti e gli ads restano 🔴: si firmano da `AZIONI-IN-ATTESA.md`.
