---
tipo: report-giornaliero
data: 2026-07-19 21:07
fonte: AD digitale
---

# Report giornaliero — 19 luglio 2026

## La situazione in una riga

Giornata tecnica eccezionale (marketplace, Pannello, Playwright, n8n avviato), ma il business resta fermo a zero ordini pagati — domani alle 10:00 apre PI26 e stasera il post domenica va ancora in copia-incolla.

---

## Numeri chiave (ore 21:07 — fonte REST + Stripe)

| KPI | Valore | Var. vs ieri |
|-----|--------|--------------|
| **Ordini pagati (North Star)** | **0** | = (stallo dal 24/6) |
| Ordini totali DB | 1 (annullato 24/6) | = |
| **Clienti buyer** | **4** | = (corretto: non 23) |
| Account marketplace totali | 23 (4 buyer · 17 seller · 1 admin · 1 rider) | = |
| Negozi live | **1** (Pane Quotidiano) | = |
| Stallo North Star | **~611h** (~25,5 giorni) | ▼ peggiorato (+19h) |
| Cassa Stripe | **0 €** | = |
| Runway | **non calcolabile** (manca `BURN_MENSILE_EUR` nel VPS, 168 giri) | = |

Sensori ore 21:07: REST ✅ · Stripe ✅ · Resend ✅ · Sito ✅ · Pannello ✅ · n8n non_configurato (container ok, workflow non importato) · MCP Supabase cieco 7 giri · Telegram non_configurato.

---

## Fatto oggi (🟢 e 🟡 completati)

**Marketplace — chiusura radiografia:**
- **PR #213 mergiata** — 35 fix gravi radiografia (7/7) su `main`.
- **Migrazioni 109/110/111 applicate** sul DB live (`rider_fee_cents`, vista `public_profiles`).
- **PR #214, #215, #216 mergiate** — icona carrello mobile, CI unit 715/715, fix build Render (`orders/page.tsx`).
- **Autofill supervisione eseguito** — 252 prodotti `condition=nuovo` + 242 `unit=pezzo` (Nicola ha approvato dalla casella Supervisione).
- **PR #217 aperta** — logo MyCity tagliato su navbar mobile (merge pendente).

**Pannello e chat:**
- Allowlist MCP **corretta e validata** (9 voci, JSON ok).
- Audit chat completo consegnato; **PR #475** (regressione «+» riapre chat vecchia) in coda merge.
- **PR #476–#479** — post domenica PQ in Diretta, anteprima grafica, PNG Playwright, «Parla con questa casella».
- **PR #472, #471** — caselle auto-coscienza compatte + titoli Lavori leggibili.

**Contenuti:**
- Post **«Domenica sera — fai il turno per la settimana»** (Pane Quotidiano) pronto in Diretta con copy + grafiche PNG Playwright.
- **Playwright operativo sul worker** (font + Node 22 + Chromium) — Content Factory esporta PNG puliti.

**Bandi:**
- Mappa completa finanziamenti consegnata — priorità **PI26** domani 20/7 ore 10:00 a sportello (max €10k, 50% fondo perduto tech).

**Automazione social (in corso):**
- **n8n installato sul VPS** — Nicola dentro l'account admin (fix secure cookie ok).
- Import workflow bloccato su JSON senza `id`/`versionId` — **fix aggiunto** al template `pubblica-post-programmato.json`; Nicola deve riprovare import via SSH.
- `N8N_WEBHOOK_URL` nel worker **ancora segnaposto** — pubblicazione automatica non attiva.

---

## Da firmare — in ordine di urgenza

### 🔴 URGENTE STASERA / DOMANI MATTINA

1. **#post-domenica-settimana-1907** — Pubblica il post «Prepara la settimana da casa» su Facebook/Instagram/gruppi locali. Copy e PNG pronti in Diretta contenuti. Timing era entro le 21:00 — se non fatto, pubblica ora o domani mattina presto.
2. **#bandi-cciaa-2007** — **Domani 20/7 ore 10:00** apre lo sportello PI26. Se non registrato su **restart.infocamere.it**, fallo **stasera** con firma digitale + fatture tech (Supabase/Vercel/Render) da maggio 2026.

### 🔴 / 🟡 Sblocca il North Star (primo ordine)

3. **#ordine-test-pq** — Fai un ordine su Pane Quotidiano (10 minuti). Unica leva diretta 0→1.
4. **#whatsapp-3-anchor-pi26** — 3 WhatsApp a Garetti, Peretti, Amendolara (testi in `consegne/vendite/`).
5. **#welcome-email-23** — Welcome email ai 4 buyer dormienti.

### 🟡 Merge Pannello / marketplace (deploy)

6. **PR #217** — Logo navbar mobile (dopo deploy Render: logo «MyCity» intero).
7. **PR #475, #479, #478, #477, #476** — Fix chat + Diretta contenuti + PNG.
8. **PR #480** — Bug `marketplace.mjs` aggiornamento (strumento autofill).
9. **Manual Deploy Render** se il sito non mostra ancora icona carrello / fix #214 — verifica che build sia verde su `main`.

### 🟡 n8n — mano social

10. Riprova import workflow in SSH (`docker cp` + `n8n import:workflow`) con JSON aggiornato → OAuth Meta → webhook in env worker (mai in chat) → «workflow importato».

---

## Segnali macchina (warn aperti)

- **tick-coscienza-leggero**: warn — tasso warn, giri continui.
- **notifica-approvazioni**: warn — 59 notifiche non inviate (manca `TELEGRAM_BOT_TOKEN`).
- **freschezza-segnali**: warn — 7 guardiani senza battito fresco.
- **taste-file**: warn — log ancora vuoto (0 verdetti reali).

Nessuno blocca l'operatività. Il collo di bottiglia resta **North Star = 0** e **PI26 domani**.

---

## Mano email

Resend ✅ configurato (API ok). **Invio automatico non eseguito:** `cervello/mani-allowlist.json` ha lista `email` **vuota** — regola AR-103 = DRY-RUN forzato anche con azione firmata. Per ricevere il report via email ogni sera: aggiungi la tua email in allowlist e di' «ok invio report».

---

## Prospettive domani (20 luglio)

- **Ore 10:00** — Sportello PI26 CCIAA: presentarsi con firma digitale + documentazione spese tech.
- **Post meteo** — Piogge probabili da martedì 21/7: card `#post-meteo-pioggia-20lug` per gruppi Facebook (dopo ordine test).
- **n8n** — Se import + OAuth completati, test dry-run post social; altrimenti copia-incolla manuale.

---

*Generato da AD digitale MyCity — 2026-07-19 21:07 (Europe/Rome)*
