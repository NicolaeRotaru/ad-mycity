# 🛠️ 20 — Tecnologia & Stack (vista CTO)

> Principio: **"Buy the boring, build the core".** Budget MVP ~50-100€/mese. Collega a [[17-Prodotto-e-UX]] · [[15-Rischi-e-Compliance]].

## Build vs Buy
- 🔴 **No Shopify** (mono-negozio, multivendor è un hack). 🟡 **Sharetribe** solo per validare l'idea in 1 settimana, non come prodotto. 🟡 **Medusa.js** per il "riscrivi a scala", non ora.
- 🟢 **BUILD i 3 pezzi unici:** carrello multi-bottega, split payment, batching consegne.
- 🟢 **BUY l'infrastruttura noiosa:** Stripe Connect (pagamenti/KYC), Supabase (DB/auth/storage), Vercel, Gemini (AI vision), WhatsApp Cloud API.
- **Prima di tutto:** valida la domanda con landing + ordini manuali (Google Form/WhatsApp), zero codice. Poi costruisci.

## Stack
PWA **Next.js** (cliente+negozio+admin, una codebase, no fee App Store) · **Supabase** (Postgres + Auth + Storage + Edge Functions, region EU) · **Vercel** hosting · **PostHog** analytics (free 1M eventi) · **n8n** automazioni back-office.

## Pagamenti — Stripe Connect Express
- **Express** = KYC ospitato da Stripe → scarichi la compliance PSD2/AML su di loro, **non sei istituto di pagamento**.
- **Pattern "Separate Charges & Transfers"** (necessario per multi-bottega): cliente paga 1 volta alla piattaforma → ordine esploso in N sub-ordini → alla consegna, N transfer ai negozi (subtotale − commissione). Paghi il negozio solo dopo conferma consegna.
- PCI: Stripe Elements → **SAQ-A** (compliance minima), i dati carta non toccano i tuoi server.

## AI Vision onboarding — Google Gemini Flash
~1/8 del costo di GPT-4o, ottimo su foto imperfette, structured output (JSON). Flusso: foto → estrazione JSON (nome/€/descrizione/categoria/confidenza) → review UI a card → bulk publish. **Prezzo verificato sempre dall'umano** (confidenza <0,9 = rosso). Costo ~€0,10-0,50 per bottega.

## Gestione ordini negozio (per maturità)
1. 🟢 **WhatsApp Cloud API** (default): messaggio strutturato + bottoni "Accetto"/"Non disponibile". Vai diretto su Meta (no markup Twilio).
2. 🟡 **Stampante termica** (CloudPRNT) quando volume >5 ordini/giorno per negozio.
3. 🟡 **Dashboard web negozio** (stessa codebase) per i più digitali.

## Consegne
MVP semi-manuale ("Wizard of Oz"): batching a mano su mappa dashboard. Rider via WhatsApp (lista tappe + link Google Maps), poi PWA rider con stato real-time (Supabase Realtime). Tracking cliente = pagina stati, no GPS live all'inizio. Routing API (Google/Mapbox) solo oltre i 40-50 ordini/giorno.

## Costi mensili
Validazione ~0-5€ · MVP (100-300 ordini/mese) ~50-100€ (quasi tutto free tier) · Crescita (1500+ ordini) ~150-250€. Il transato Stripe NON è costo piattaforma.

## Dove NON over-investire
🔴 app native (→ PWA) · microservizi/k8s (→ monolite serverless) · routing AI (→ manuale) · gestionale negozio (→ WhatsApp) · pagamenti/KYC (→ Stripe) · addestrare AI (→ API) · data warehouse (→ Postgres+PostHog).

## Compliance tech
GDPR: region EU, dati minimizzati, DPA con i fornitori, export/cancellazione account. **RLS Supabase** = difesa #1 (ogni bottega vede solo i suoi ordini). Secrets solo lato server. Webhook firmati.

### Fonti
[Stripe Connect 2026](https://drop-desk.com/blog/guides/stripe-fees-for-marketplace-operators/) · [Supabase pricing](https://uibakery.io/blog/supabase-pricing) · [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) · [WhatsApp API pricing](https://respond.io/blog/whatsapp-business-api-pricing) · [Sharetribe vs Medusa](https://roobykon.com/blog/posts/sharetribe-vs-medusa-js-comparison)

#tecnologia #stack #cto #priorità/alta
