# WS-API — Pacchetto di fix «API / Backend»

> Owner: backend-dev senior · Data: 2026-07-04 · Fonte: `consegne/bonifica/_findings.json` → `api-backend` (6 item)
> Repo target (sola lettura, no git da qui): `/home/user/ad-mycity/marketplace`
> Applicazione: branch `fix/ws-api-bonifica` → PR → anteprima → firma Nicola. **Zero deploy da qui.**

## Mappa dei 6 finding

| # | Finding | Owner | Colore | Fix |
|---|---------|-------|--------|-----|
| 1 | Dead auth routes signin/signup usano client Supabase 'browser' come singleton server (session bleed + signOut global) | **WS-API** | 🟡 | **Rimuovere** (dead code) + lint rule |
| 2 | `reverseOrderTransfer` single-shot per ordine | → **WS-MONEY** | — | annotato (impatto backend sotto) |
| 3 | `validateCoupon` TOCTOU / claim non atomico | → **WS-MONEY** | — | annotato |
| 4 | gift-cards `idempotencyKey` con `Date.now()` | **WS-API** | 🟢 | key deterministico per-intento |
| 5 | Nessun timeout su client Anthropic né `maxDuration` sulle route AI | **WS-API** | 🟢 | `timeout`+`maxRetries` + `maxDuration` |
| 5b | AI catalog-batch usa rate limiter **sync** in-memory | **WS-API** | 🟢 | → `rateLimitAsync` (durevole → WS-AI) |
| 6 | Webhook Stripe: doppio `increment_coupon_usage` su re-delivery | → **WS-MONEY** | — | annotato |

Dipendenze: **WS-MONEY** (finding 2, 3, 6 — logica soldi/coupon), **WS-AI** (provisioning store durevole per il rate limiter AI). Nessun 🔴 in questo pacchetto.

---

## FIX 1 — Auth routes signin/signup 🟡 grave→eliminata la classe

### Causa-radice
`app/api/auth/signin/route.ts:2` e `app/api/auth/signup/route.ts:2` importano `auth` da `@/lib/supabase/client.ts` — modulo `'use client'` con **singleton module-level** (`let _supabase = createBrowserClient(...)`, `lib/supabase/client.ts:6-27`). In un processo Node long-running (Render) il singleton è **condiviso fra tutte le richieste**: il `GoTrueClient` tiene `currentSession` in memoria globale. Due login concorrenti si sovrascrivono la sessione; il ramo email-non-confermata chiama `auth.signOut()` (scope default **'global'** in supabase-js v2, `signin/route.ts:51`) → revoca la sessione *attualmente caricata* (di un altro utente) su **tutti i device**.

### Decisione (motivata): **RIMUOVERE le due route** — non riscriverle
Verifica avversariale eseguita:
- `grep -rn "api/auth/signin|api/auth/signup"` su `app/ components/ lib/` (esclusa `app/api/auth`) → **0 caller**.
- Il login/registrazione reale è **100% client-side**: `app/sign-in/page.tsx:66` chiama `auth.signIn` dal browser (dove `createBrowserClient` scrive correttamente i cookie di sessione, un client per tab); `app/sign-up/page.tsx:71` chiama `supabase.auth.signUp` client-side; OAuth in `components/ui/AuthShell.tsx:112`.

→ Le due route sono **dead code**. Riscriverle con `createServerClient(@supabase/ssr)` per-richiesta produrrebbe codice corretto ma **comunque mai chiamato** (manutenzione morta + superficie d'attacco inutile). La mossa che **elimina l'intera classe di bug** (session bleed) è cancellarle e impedirne per policy la reintroduzione. Se in futuro servisse davvero un login server-side (es. app mobile), si crea allora con `getServerSupabase()`/client per-request — mai col browser singleton.

> Nota: `lib/supabase/client.ts` **resta invariato** — è corretto per l'uso client-side (sign-in/sign-up page, admin/seller pages). Il difetto non è il file, è usarlo in `app/api/**`.

### Fix ESATTO
**A) Cancellare i due file** (dead code):
```
git rm app/api/auth/signin/route.ts
git rm app/api/auth/signup/route.ts
```

**B) Lint guard — vietare l'import del client browser dentro `app/api/**`** (rende impossibile ricreare il bug).
`.eslintrc.json` — before:
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "@next/next/no-img-element": "off",
    "@next/next/no-before-interactive-script-outside-document": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```
after (aggiunto blocco `overrides`):
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "@next/next/no-img-element": "off",
    "@next/next/no-before-interactive-script-outside-document": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn"
  },
  "overrides": [
    {
      "files": ["app/api/**/*.ts", "app/api/**/*.tsx"],
      "rules": {
        "no-restricted-imports": ["error", {
          "paths": [{
            "name": "@/lib/supabase/client",
            "message": "Client Supabase 'browser' (createBrowserClient, singleton module-level) vietato nelle route server: currentSession condivisa fra richieste → session bleed e signOut('global') che revoca sessioni altrui. Usa getServerSupabase()/getAdminSupabase() da @/lib/supabase/server."
          }]
        }]
      }
    }
  ]
}
```

### Test (scheletro)
```ts
// test/lint/no-browser-client-in-api.test.ts  (o check nel CI)
// 1) Regression grep: nessun file app/api/** importa @/lib/supabase/client
import { execSync } from 'node:child_process';
it('nessuna route server importa il client Supabase browser', () => {
  const hits = execSync(
    `grep -rl "@/lib/supabase/client" app/api || true`, { encoding: 'utf8' }
  ).trim();
  expect(hits).toBe('');
});
// 2) ESLint fallisce se qualcuno reintroduce l'import (fixture)
```

### Verifica
`npx eslint app/api` esce 0; creare al volo una route di prova che importa `@/lib/supabase/client` → eslint deve dare errore. `npm run build` verde (nessun riferimento residuo alle route rimosse). Smoke: login/registrazione dal sito continuano a funzionare (sono client-side, non toccati).

### Rischio & rollback
Rischio **basso**: si rimuove codice non referenziato. Rollback: `git revert` del commit (ripristina i due file). Nessuna migrazione, nessun dato toccato.

### Dipendenze
Nessuna. Indipendente dagli altri fix.

---

## FIX 4 — gift-cards idempotencyKey non idempotente 🟢 minore

### Causa-radice
`app/api/gift-cards/checkout/route.ts:81`: `idempotencyKey: giftcard_${user.id}_${amountCents}_${body.recipientEmail}_${Date.now()}`. `Date.now()` rende il key **diverso a ogni chiamata** → un doppio-submit / retry crea N Checkout Session distinte; se il buyer paga due sessioni, il webhook emette due gift card diverse (codici HMAC su `session.id` diversi). L'idempotenza *dichiarata* qui è inefficace.

### Fix ESATTO
Rimuovere `Date.now()`; key **stabile per-intento**, con opzione di idempotency-key fornita dal client (UUID generato una volta per apertura form e riusato sui retry). Fallback deterministico se assente.

`app/api/gift-cards/checkout/route.ts` — schema (riga 26-31) before:
```ts
const Body = z.object({
  amountEuro: z.number().int().refine((v) => ALLOWED_AMOUNTS.includes(v), 'Importo non valido'),
  recipientName: z.string().min(1).max(120),
  recipientEmail: z.string().email().max(200),
  message: z.string().max(500).optional().nullable(),
});
```
after:
```ts
const Body = z.object({
  amountEuro: z.number().int().refine((v) => ALLOWED_AMOUNTS.includes(v), 'Importo non valido'),
  recipientName: z.string().min(1).max(120),
  recipientEmail: z.string().email().max(200),
  message: z.string().max(500).optional().nullable(),
  // Idempotency key generata dal client una volta per tentativo di acquisto
  // e riusata sui retry/doppio-submit. Se assente, si deriva un key stabile.
  idempotencyKey: z.string().uuid().optional(),
});
```
riga 81 before:
```ts
{ idempotencyKey: `giftcard_${user.id}_${amountCents}_${body.recipientEmail}_${Date.now()}` },
```
after:
```ts
{ idempotencyKey: body.idempotencyKey
    ? `giftcard_${user.id}_${body.idempotencyKey}`
    : `giftcard_${user.id}_${amountCents}_${body.recipientEmail}` },
```
> Il prefisso `user.id` isola i key fra utenti. Se il client riusa lo stesso UUID con parametri diversi, Stripe risponde con errore idempotency ("same key, different params") — comportamento sicuro (nessuna sessione stale silenziosa). Il fallback stabile collassa i doppi-submit dello stesso intento entro la finestra di 24h del key Stripe.
>
> Handoff frontend (🟡, non-bloccante): far generare a `app/profile/gift-cards` un `crypto.randomUUID()` all'apertura del form e passarlo come `idempotencyKey`. Finché il frontend non lo invia, vale il fallback deterministico (Date.now già rimosso = bug risolto). → PASSO-A @frontend-dev.

### Test (scheletro)
```ts
// test/api/gift-cards-idempotency.test.ts
it('due POST identici senza clientKey usano lo STESSO idempotencyKey', async () => {
  const spy = vi.spyOn(stripe.checkout.sessions, 'create');
  await POST(reqWith(body)); await POST(reqWith(body));
  const k1 = spy.mock.calls[0][1].idempotencyKey;
  const k2 = spy.mock.calls[1][1].idempotencyKey;
  expect(k1).toBe(k2);
  expect(k1).not.toMatch(/\d{13}/); // niente timestamp
});
it('clientKey diverso → key diverso (nuovo acquisto intenzionale)', () => { /* ... */ });
```

### Verifica
Doppio-click sul bottone "Acquista" in anteprima → una sola Checkout Session in dashboard Stripe (test mode). Log: stesso `idempotencyKey`.

### Rischio & rollback
Rischio **molto basso**. Edge: un utente che compra volontariamente due gift card identiche (stesso importo+destinatario) entro 24h senza clientKey riceverebbe la stessa sessione — mitigato dal clientKey lato frontend. Rollback: revert di una riga.

### Dipendenze
Nessuna backend. Enhancement frontend opzionale (@frontend-dev).

---

## FIX 5 — Timeout Anthropic + maxDuration route AI 🟢 minore

### Causa-radice
`lib/ai/client.ts:96`: `new Anthropic({ apiKey })` — nessun `timeout` né `maxRetries` → vale il default SDK (~10 min + retry). Nessuna route in `app/api` imposta `maxDuration`. Le route con `web_search` possono restare appese per minuti su una singola chiamata lenta, occupando un worker.

### Fix ESATTO
**A) Timeout sul client** — `lib/ai/client.ts:96` before:
```ts
  _client = new Anthropic({ apiKey });
```
after:
```ts
  // Timeout esplicito: una chiamata AI lenta non deve tenere un worker per minuti.
  // web_search può essere lento → 60s per tentativo, 1 solo retry (worst-case ~120s,
  // coperto da maxDuration sulle route). Override per-chiamata dove serve.
  _client = new Anthropic({ apiKey, timeout: 60_000, maxRetries: 1 });
```

**B) `maxDuration` sulle route AI con `web_search`** — aggiungere `export const maxDuration = 120;` sotto la riga `export const runtime = 'nodejs';` di ciascuna:
- `app/api/ai/barcode-lookup/route.ts:19`
- `app/api/ai/improve-product/route.ts:37`
- `app/api/ai/product-chat/route.ts:29`
- `app/api/vision/extract-product/route.ts:24`
- `app/api/marketplace/import-fetch/route.ts:19`
- `app/api/cron/external-price-alerts/route.ts:24` (usa `lib/products/externalSync.ts:88` web_search)

Esempio (barcode-lookup) before:
```ts
export const runtime = 'nodejs';
```
after:
```ts
export const runtime = 'nodejs';
// web_search può richiedere fino a ~2 min: allineato a timeout(60s)×maxRetries(1) del client Anthropic.
export const maxDuration = 120;
```
> Nota piattaforma: `maxDuration` è un knob **Vercel-effective**; su Render il timeout di piattaforma governa comunque — la protezione *reale* qui è il `timeout` del client SDK (A). Metto entrambi per coerenza e portabilità.

### Test (scheletro)
```ts
// test/ai/client-timeout.test.ts
it('il client Anthropic è costruito con timeout e maxRetries', () => {
  const ctor = vi.spyOn(Anthropic.prototype, 'constructor' as never);
  __resetAnthropicClient(); getAnthropic();
  expect(ctorArgs).toMatchObject({ timeout: 60_000, maxRetries: 1 });
});
// test/ai/routes-maxduration.test.ts — ogni route web_search esporta maxDuration
it.each(WEB_SEARCH_ROUTES)('%s esporta maxDuration', async (p) => {
  const mod = await import(p); expect(typeof mod.maxDuration).toBe('number');
});
```

### Verifica
Simulare un endpoint web_search lento (mock che ritarda) → la richiesta fallisce con `APITimeoutError` a ~60s invece di appendersi. `npm run build` verde.

### Rischio & rollback
Rischio **basso**. Attenzione: 60s potrebbe essere corto per web_search complesse → alzabile per-chiamata (`client.messages.create(..., { timeout })`) senza toccare il default. Il cron external-price-alerts va verificato che 120s stia nella sua finestra di schedule. Rollback: revert.

### Dipendenze
Nessuna.

---

## FIX 5b — AI catalog-batch: rate limiter sync → async 🟢 minore

### Causa-radice
`app/api/ai/catalog-batch/start/route.ts:4,35` e `app/api/ai/catalog-batch/apply/route.ts:4,32` usano `rateLimit()` **sync in-memory**: il contatore vive nel processo, si azzera a ogni restart Render e non è condiviso fra istanze (scale-out) → il limite (start: 5/h, apply: 20/h) è aggirabile. `catalog-batch/status/route.ts:32` usa già `rateLimitAsync` (pattern corretto).

### Fix ESATTO
`app/api/ai/catalog-batch/start/route.ts` — riga 4 `import { rateLimit }` → `import { rateLimitAsync }`; riga 35:
```ts
// before
const rl = rateLimit({ key: `ai-catalog-batch-start:${user.id}`, max: 5, windowMs: 60 * 60_000 });
// after
const rl = await rateLimitAsync({ key: `ai-catalog-batch-start:${user.id}`, max: 5, windowMs: 60 * 60_000 });
```
`app/api/ai/catalog-batch/apply/route.ts` — riga 4 import → `rateLimitAsync`; riga 32:
```ts
// before
const rl = rateLimit({ key: `ai-catalog-batch-apply:${user.id}`, max: 20, windowMs: 60 * 60_000 });
// after
const rl = await rateLimitAsync({ key: `ai-catalog-batch-apply:${user.id}`, max: 20, windowMs: 60 * 60_000 });
```
Verificare che entrambi gli handler siano già `async` (lo sono, dentro `withSellerAuth`) — l'`await` è legale.

> `rateLimitAsync` ha già il fallback automatico a in-memory se Upstash non è configurato (`lib/rate-limit.ts:134-149`): lo swap è **sicuro anche senza store durevole**. Il **provisioning dello store durevole (Upstash) per tutte le route AI è → WS-AI (owner)**: finché non c'è, il comportamento è identico a oggi ma il codice è già pronto a diventare durevole a env-var collegata.

### Test (scheletro)
```ts
// test/api/catalog-batch-ratelimit.test.ts
it('start supera il limite → 429 (via rateLimitAsync)', async () => {
  for (let i = 0; i < 5; i++) await POST(sellerReq());
  const res = await POST(sellerReq());
  expect(res.status).toBe(429);
});
```

### Verifica
Grep `grep -rn "rateLimit(" app/api/ai/catalog-batch` → 0 risultati (solo `rateLimitAsync`). Build verde.

### Rischio & rollback
Rischio **molto basso** (stessa semantica, aggiunto `await`). Rollback: revert import + await.

### Dipendenze
**→ WS-AI** per lo store durevole (Upstash). Lo swap qui è indipendente e non lo attende.

---

## CROSS — finding di WS-MONEY (owner), impatto backend annotato

Non riscritti qui. Riferimento e impatto lato backend:

- **Finding 2 — `reverseOrderTransfer` single-shot** (`lib/stripe/payout.ts:248-249,260-271`) → **vedi WS-MONEY**.
  Impatto backend: claw-back tracciato da una sola colonna `stripe_reversal_id` con early-return + `idempotencyKey` fisso `reversal_${order.id}`. Il fix (importo cumulativo stornato + key per-evento `reversal_<orderId>_<refundId>`) tocca schema (nuova colonna `reversed_amount_cents` o uso di `transfers.listReversals`) → **serve migrazione**: la prepara/coordina WS-MONEY; se richiede una colonna, io (backend-dev) posso fornire la migrazione reversibile su richiesta.

- **Finding 3 — `validateCoupon` TOCTOU / claim non atomico** (`lib/coupons.ts:57-74`) → **vedi WS-MONEY**.
  Impatto backend: read-then-act senza lock; il fix atomico (`UPDATE ... WHERE code=? AND (max_uses IS NULL OR uses_count < max_uses)` con check righe modificate; unique `(coupon_id,user_id)` su tabella redemptions per `first_order_only`) è **DB-side** → migrazione + modifica RPC `increment_coupon_usage`. Owner WS-MONEY.

- **Finding 6 — Webhook Stripe: doppio `increment_coupon_usage` su re-delivery** (`app/api/stripe/webhook/route.ts:56-76,209-213,359-373`) → **vedi WS-MONEY**.
  Impatto backend: idempotenza event-level scritta a fine handler; transizione `pending→COMPLETED` (riga 365-373) è un update **non condizionato** → non fa da lock. Fix: `update pending_checkouts set status='COMPLETED' where id=? and status='PENDING'` con check `rows=1`, ed eseguire `increment_coupon_usage`+email **solo se la transizione è vinta**. Owner WS-MONEY (stesso file/logica dei finding 2-3).

---

## Riepilogo applicazione
1. Branch `fix/ws-api-bonifica` (dopo `git pull` — altra sessione attiva su `mycity-live`).
2. FIX 1 (rm 2 file + eslint), FIX 4 (gift-cards), FIX 5 (client+6 route), FIX 5b (2 route catalog-batch).
3. `npm run lint && npm run build && npm test` verdi.
4. PR con questo documento come descrizione; anteprima; **firma Nicola** per merge. Nessun deploy da qui.
5. Coordinare con **WS-MONEY** (finding 2/3/6) e **WS-AI** (store durevole rate limiter) prima del merge se toccano gli stessi file.
