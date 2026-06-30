---
tipo: audit
data: 2026-07-01 12:00
fonte: radiografia marketplace (13 dimensioni, verifica avversariale)
repo: marketplace/ @ /opt/mycity/ad-mycity/marketplace
---

# 🩻 Radiografia marketplace MyCity — 2026-07-01

**Per gravità:** 🔴 4 bloccanti · 🟠 24 gravi · 🟡 18 minori

> Analisi profonda a 13 dimensioni sul codice marketplace (`NicolaeRotaru/mycity`, copia locale).
> Ogni voce è stata ricontrollata nel codice; scartati i falsi positivi (es. icone PWA PNG presenti in `public/`).

---

## 🔴 Bloccanti — da sistemare prima del live

### 1. Webhook Stripe marca checkout COMPLETED anche se gli ordini non sono stati creati

- **Dimensione:** pagamenti-stripe
- **Dove:** `app/api/stripe/webhook/route.ts:296-344`
- **Sintomo:** Se `orders.insert` fallisce (errori non-23505), il loop fa `continue` ma `pending_checkouts` viene sempre impostato a `COMPLETED`. Al retry webhook, l'early-return su `status === 'COMPLETED'` (riga 210) blocca ogni recovery.
- **Impatto:** Buyer pagato su Stripe, zero ordini in DB, stock riservato, nessuna recovery automatica.
- **Fix:** Marcare `COMPLETED` solo se `createdOrderIds.length === groups.length`. In caso di fallimento parziale: lasciare `PENDING`, rispondere 500 a Stripe per retry.

### 2. Checkout UI nasconde la fee piattaforma €3/consegna per negozio

- **Dimensione:** qa-flussi / frontend-ux
- **Dove:** `app/checkout/page.tsx:362` (manca `PLATFORM_DELIVERY_FEE_CENTS`); server la applica in `app/api/orders/cod/route.ts:248` e `app/api/stripe/checkout/route.ts:276`
- **Sintomo:** `grandTotal` = subtotale + spedizione − sconti, senza €3×N negozi. Stripe riceve la fee come line item (`lib/stripe/client.ts`).
- **Impatto:** Il buyer vede un totale inferiore di €3 per ogni negozio a domicilio; su multi-bottega l'errore si moltiplica → dispute, abbandono, danno fiducia.
- **Fix:** Aggiungere `deliveryFee = pickupInStore ? 0 : groups.length * (PLATFORM_DELIVERY_FEE_CENTS/100)` al calcolo UI e a `OrderSummary`. Allineare analytics/sessionStorage.

### 3. RLS profiles espone l'intera riga venditore (KYC, IBAN, Stripe ID)

- **Dimensione:** rls-database
- **Dove:** `migrations/006_public_seller_profiles.sql:15-20`
- **Sintomo:** Policy SELECT su tutta `profiles` quando `is_approved=true`. Colonne sensibili aggiunte in migration successive (legal_fiscal_code, billing_iban, stripe_account_id, kyc_*_url, wallet_balance_cents) sono nel result set per anon/authenticated via PostgREST.
- **Impatto:** Qualsiasi visitatore può leggere P.IVA, IBAN, documenti KYC e saldo wallet di ogni negozio approvato. Violazione GDPR.
- **Fix:** VIEW `seller_public_profiles` (security_invoker) con sole colonne vetrina. Revocare SELECT diretto su `profiles` per client; GRANT solo sulla view.

### 4. Ordine COD con order_items fallito → ordine fantasma senza rollback

- **Dimensione:** qa-flussi
- **Dove:** `app/api/orders/cod/route.ts:353-364`
- **Sintomo:** Se `order_items.insert` fallisce, il codice logga e continua: notifiche/email partono, ordine resta senza righe, stock riservato.
- **Impatto:** Venditore vede ordine da preparare senza prodotti; stock bloccato.
- **Fix:** Trattare `itemsErr` come fatale: cancellare ordine, `restore_stock`, stornare wallet, 500 al client senza push/email.

---

## 🟠 Gravi — impatto business/operativo elevato

### Pagamenti & soldi

| # | Titolo | Dove | Impatto |
|---|--------|------|---------|
| 5 | `charge.refunded` ripristina stock duplicato dopo `refundOrder` | `webhook/route.ts:698-701` + `payout.ts:434` | Inventario gonfiato, overselling |
| 6 | Chargeback vinto: nessun re-transfer al venditore | `webhook/route.ts:770-805` | Venditore perde netto anche vincendo disputa |
| 7 | `reverseOrderTransfer` blocca claw-back parziali successivi | `lib/stripe/payout.ts:248-268` | Piattaforma perde quota su rimborsi multipli post-payout |
| 8 | `expire-stale-orders` cancella prima di rimborsare | `cron/expire-stale-orders/route.ts:56-82` | Buyer addebitato, ordine CANCELED, nessun rimborso auto |
| 9 | Payout bloccato in PROCESSING se update DB fallisce post-transfer | `lib/stripe/payout.ts:110-135` | Transfer Stripe eseguito, DB incoerente |
| 10 | `refundOrder` emette refund Stripe prima del claw-back | `lib/stripe/payout.ts:397-414` | Buyer rimborsato, venditore mantiene transfer |

### Checkout & ordini

| # | Titolo | Dove | Impatto |
|---|--------|------|---------|
| 11 | Multi-variante stesso prodotto rifiutato (COD) | `app/api/orders/cod/route.ts:97` | Checkout bloccato (es. stessa maglietta S+M) |
| 12 | Stesso bug multi-variante su checkout carta | `app/api/stripe/checkout/route.ts:101` | Pagamento carta impossibile con varianti multiple |
| 13 | COD multi-negozio non atomico | `app/api/orders/cod/route.ts:238+` | Errore parziale lascia ordini committati |
| 14 | Orari negozio chiuso solo su COD, non carta | COD:140-150 vs Stripe checkout (assente) | Ordini carta accettati con negozio chiuso |
| 15 | ProductCard aggiunge prezzo pieno ignorando promo | `components/ProductCard.tsx:69` | Carrello/checkout disallineati dal prezzo reale |
| 16 | Wallet COD ignorato silenziosamente se debit fallisce | `app/api/orders/cod/route.ts:277` | Buyer spunta credito ma paga pieno in contanti |

### Sicurezza & privacy

| # | Titolo | Dove | Impatto |
|---|--------|------|---------|
| 17 | CAPTCHA disabilitato se manca `TURNSTILE_SECRET_KEY` | `lib/captcha.ts:17-26` | Bot su signup/login/contact in prod |
| 18 | GET `/api/products/[id]/external-refresh` pubblico triggera AI costosa | `external-refresh/route.ts:69-101` | Abuso budget Anthropic |
| 19 | `withInternalAuth` fallback su `SUPABASE_SERVICE_ROLE_KEY` | `lib/api/middleware.ts:232-238` | Payout interno invocabile con service-role leak |
| 20 | Profilo buyer opt-in espone tutte le colonne profiles | `migrations/033_buyer_public_profile_zone_codes.sql:29-31` | PII buyer oltre l'opt-in voluto |
| 21 | Rider vede PII ordini non assegnati (ACCEPTED/READY) | `migrations/019_rider_visibility.sql:15-20` | Harvest indirizzi/telefoni clienti altrui |
| 22 | Policy `group_participants` referenzia colonna inesistente `group_id` | `migrations/020:76-86` (colonna reale: `group_order_id`) | Migration 020 rollbacka; resta policy permissiva `USING (true)` da 015 |

### Frontend & UX

| # | Titolo | Dove | Impatto |
|---|--------|------|---------|
| 23 | Flash "carrello vuoto" su `/cart` | `app/cart/page.tsx:23-30` | Flicker → abbandono funnel |
| 24 | Flash "carrello vuoto" su `/checkout` | `app/checkout/page.tsx:49+` | Frizione nel passo critico |
| 25 | Messaggi: errore API → "Nessuna conversazione" | `app/messages/page.tsx:54-117` | Thread invisibili |
| 26 | Thread messaggi: errore → conversazione vuota | `app/messages/[id]/page.tsx:86` | Messaggi reali nascosti |
| 27 | Notifiche: qualsiasi errore → redirect login | `app/notifications/page.tsx:101` | Utente autenticato espulso su glitch rete |
| 28 | Profilo: errore fetch → redirect login | `app/profile/page.tsx:72` | Stesso pattern |
| 29 | Shared-cart: errore rete → "prodotti non disponibili" | `app/shared-cart/page.tsx:78` | Link WhatsApp sembra rotto |
| 30 | WhatsApp/telefono placeholder hardcoded | `app/contact/page.tsx:68` | CTA assistenza non raggiunge supporto reale |

### Deploy, performance, API

| # | Titolo | Dove | Impatto |
|---|--------|------|---------|
| 31 | Cron critici su cron-job.org, non in render.yaml | `render.yaml:73` | Payout/email/push fermi in silenzio se scheduler down |
| 32 | N+1 query nel cron send-emails | `cron/send-emails/route.ts:108` | Timeout cron, backlog email |
| 33 | release-payouts: fino a 600 transfer Stripe sequenziali | `cron/release-payouts/route.ts:91` | Timeout HTTP, payout in ritardo |
| 34 | 13 endpoint AI usano rateLimit in-memory sync | es. `ai/voice-product/route.ts:54` | Abuso costi Anthropic su multi-istanza |
| 35 | GDPR export senza rate limit | `account/export/route.ts:26` | DoS interno su Supabase |

---

## 🟡 Minori — da pianificare

| # | Titolo | Dove |
|---|--------|------|
| 36 | Health endpoint espone errori env/DB | `app/api/health/route.ts:43-57` |
| 37 | Upload KYC valida MIME solo da client | `kyc/upload-document/route.ts:39-49` |
| 38 | `withAdminAuth` non verifica `is_approved` | `lib/api/middleware.ts:164-169` |
| 39 | `returns` INSERT non verifica appartenenza ordine | `migrations/024:108-109` |
| 40 | `event_rsvps` SELECT pubblica espone user_id | `migrations/034:112-113` |
| 41 | `shop_of_month_votes` SELECT pubblico espone voter_id | `migrations/034:48-50` |
| 42 | Geocoding tardivo COD cambia spedizione vs anteprima | `checkout/page.tsx:382` |
| 43 | Subtotale checkout da prezzi stale in localStorage | `checkout/page.tsx:222` |
| 44 | Copy "Niente costi nascosti" vs fee assente in UI | `OrderSummary.tsx:108` |
| 45 | Negozi vicini: errori Supabase silenziosi | `app/near/page.tsx:22` |
| 46 | Indirizzi salvati: errori ignorati | `profile/addresses/page.tsx:48` |
| 47 | Categoria: errore rete mostrato come 404 | `category/[slug]/page.tsx:86` |
| 48 | Checkout: errore gruppi senza retry | `checkout/page.tsx:770` |
| 49 | Health check DB senza timeout | `health/route.ts:31` |
| 50 | CI E2E attende `/` invece di `/api/health` | `.github/workflows/ci.yml:169` |
| 51 | Log info disabilitati in produzione | `lib/logger.ts:66` |
| 52 | Env critiche assenti da render.yaml (VAPID, INTERNAL_API_SECRET) | `render.yaml:32` |
| 53 | Drift migration non verificato in CI | `.github/workflows/ci.yml` |

---

## ✅ Verificato e a posto

- Firma webhook Stripe (`constructEvent`)
- Prezzi ricalcolati server-side; INSERT ordini client-side rimosso (058)
- IDOR ordini/resi/chat con ownership check
- Escalation ruolo profiles (061)
- Cron protetti da `withCronAuth`
- Segreti server-only (no service-role nel browser)
- XSS richText con DOMPurify
- SSRF rehost con `safeImageFetch`
- Icone PWA PNG presenti in `public/` (icon-192.png, icon-512.png, maskable, apple-touch-icon)

---

## 🎯 Piano d'azione consigliato (ordine priorità)

### Sprint 1 — soldi & checkout (🔴 + pagamenti gravi)
1. Fix webhook pending_checkout (solo COMPLETED se tutti gli ordini creati)
2. Fee €3 visibile in checkout UI
3. Rollback atomico COD (order_items + multi-negozio)
4. Validazione varianti duplicate (Set su productIds)
5. Stock restore idempotente su charge.refunded

### Sprint 2 — privacy & sicurezza (🔴 RLS + gravi auth)
6. VIEW `seller_public_profiles` + revoca SELECT diretto
7. Fix migration group_participants (`group_order_id`)
8. CAPTCHA fail-closed in produzione
9. Bloccare external-refresh AI su GET pubblico
10. `INTERNAL_API_SECRET` obbligatorio (no fallback service-role)

### Sprint 3 — UX & operatività
11. Hydration carrello (useSyncExternalStore) su cart/checkout
12. ErrorState + retry su messaggi/notifiche/profilo
13. Allineare orari negozio su checkout carta
14. Cron in render.yaml o monitor heartbeat robusto

> **Colore fix:** tutti i fix al codice marketplace = 🟡 (branch + anteprima). Deploy produzione = 🔴 firma Nicola.

---

## Fonte & metodo

- Repo analizzato: `/opt/mycity/ad-mycity/marketplace` (commit locale 2026-06-30)
- 13 dimensioni: architettura, sicurezza, RLS, Stripe, privacy, performance, frontend, a11y (campione), QA flussi, API, AI, analytics (campione), deploy/SRE
- Verifica avversariale: ogni finding ricontrollato nel codice; dubbi scartati
- Non eseguiti: test E2E live, query Supabase produzione, penetration test
