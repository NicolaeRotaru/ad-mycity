---
titolo: WS-ANALYTICS-SEC — Pacchetto fix Dati&Analytics + Sicurezza&Auth
data: 2026-07-04 18:40
owner: tech (data/analytics + app-sec)
fonte_problemi: consegne/bonifica/_findings.json → "dati-analytics" (12) + "sicurezza-auth" (3)
repo: /home/user/ad-mycity/marketplace (SOLA LETTURA — i diff vanno applicati in branch fix/ws-analytics-sec)
dipendenze: WS-DB-RLS (trigger messages), GLOSSARIO-KPI (definizioni view/visita/ordine)
---

# WS-ANALYTICS-SEC — pacchetto pronto da applicare

Branch unico: `fix/ws-analytics-sec`. 15 finding coperti (12 analytics + 3 sicurezza).
Ogni finding: causa-radice · diff before/after (file:riga reali) · test · colore · rischio&rollback · dipendenze.

---

## 0) DEFINIZIONE UNICA (da recepire nel GLOSSARIO-KPI prima di mergiare le metriche)

Oggi 3 sorgenti misurano "visite" e "ordini" con popolazioni diverse. Fissiamo UNA verità e allineiamo il codice a essa:

| Concetto | Verità unica (autoritativa) | Sorgenti che si allineano |
|---|---|---|
| **view di prodotto** | riga `product_views` (server-safe, anonima/aggregata) = misura di prodotto per il seller; PostHog `product_viewed` = evento di funnel behavioral (gated consenso). Non si confrontano tra loro: la prima è "quante volte è stata aperta la scheda", la seconda "quanti utenti consenzienti l'hanno vista". | seller/analytics (product_views), PostHog (product_viewed) |
| **visita / pageview** | evento `activity_events.category='visitor', event_type='page_view'` → **campione consenzienti**; da etichettare SEMPRE come tale + affiancare conteggio aggregato cookieless per i volumi totali | admin/activity dashboards |
| **ordine (valido)** | ordine con `delivery_status NOT IN ('CANCELED','FAILED')` — stesso filtro per conteggi, conversion e revenue | seller/analytics, finanza, GLOSSARIO |

Regola: nessuna KPI mostra "traffico/ordini" senza dichiarare la base (consenso / stati inclusi). → coordinare con @finanza e @analista sul GLOSSARIO-KPI.

---

# PARTE A — DATI & ANALYTICS (12 finding)

## A1 🟡 GRAVE — 14 eventi definiti ma mai emessi (funnel morti)
`lib/analytics/events.ts:42-169`

**Causa-radice:** il file è dichiarato "single source of truth" ma esporta 14 `track*` senza call-site. Non è un bug di runtime: è **debito di istrumentazione** che rende vuoti i funnel discovery/engagement/seller/rider e fa credere "manca il comportamento" invece di "manca la misura".

**Fix (policy, 2 tempi):**
1. **Subito (🟢, questo branch):** cablare i 4 eventi a costo quasi-zero, già disponibili nei sink UI esistenti:
   - `trackStoreViewed(sellerId)` → in `app/store/[id]` (client boundary, come ProductViewTracker).
   - `trackCategoryViewed(slug)` → in `app/category/[slug]` (client).
   - `trackFavoriteAdded(productId)` → nel click "preferito" (grep il bottone cuore).
   - `trackReviewSubmitted(...)` → nel submit recensione.
   Pattern identico a ProductViewTracker (componente invisibile client, gated dal consenso via `track()`).
2. **Il resto (referral/share/seller-onboarding/rider):** finché non c'è il punto UI reale, **spostarli in una sezione `// NON ANCORA CABLATO`** con un commento che vieta di usarli in dashboard, così il file torna onesto. NON lasciarli mescolati ai vivi.

**Diff (esempio, marcatura onestà) `lib/analytics/events.ts:151`:**
```diff
-// Seller funnel
+// Seller funnel — ⚠️ NON ANCORA CABLATO (nessun call-site UI). Non usare in
+// dashboard finché non emesso: vedi WS-ANALYTICS-SEC A1.
 export const trackSellerOnboardingStarted = () =>
```

**Verifica:** `grep -rn "trackStoreViewed\|trackCategoryViewed" app/` deve trovare i call-site; su PostHog Live Events compaiono `store_viewed`/`category_viewed` navigando.
**Rischio&rollback:** minimo (aggiunge eventi, non tocca flussi). Rollback = rimuovi i componenti tracker.
**Dipendenze:** i call-site UI toccano pagine store/category/product → handoff @frontend-dev per il posizionamento pixel-safe.

---

## A2 🔴(codice 🟡, deploy+env 🔴) GRAVE — purchase carta tracciato solo client al ritorno /orders → undercount revenue
`app/orders/page.tsx:67-91` + `app/checkout/page.tsx:516-529` + `app/api/stripe/webhook/route.ts`

**Causa-radice:** l'ordine reale nasce nel webhook server (`handleCheckoutCompleted`, riga 259 insert `orders`), ma `purchase`/`order_placed` è emesso SOLO se il browser rientra su `/orders?stripe=success` con `session_id` + `mc_pending_purchase` ancora in sessionStorage. Se l'utente chiude la tab (frequente mobile) l'evento non parte pur esistendo l'ordine. `package.json` non ha `posthog-node`, il webhook non fa alcun capture. Undercount sistematico del canale carta (lo scontrino più alto); COD invece è tracciato affidabile client-side.

**Fix:** emettere `purchase` **server-side dal webhook**, una volta per ordine creato, usando `order_id` come `transaction_id` (dedup GA4/PostHog). Tenere il client solo come conferma UX (o rimuoverlo per evitare doppio conteggio — vedi nota dedup sotto).

**Passi:**
1. `npm i posthog-node` (nuova dipendenza).
2. Nuovo modulo server `lib/analytics/server.ts`:
```ts
// lib/analytics/server.ts
import { PostHog } from 'posthog-node';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

let ph: PostHog | null = null;
function client(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!ph) ph = new PostHog(key, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com', flushAt: 1, flushInterval: 0 });
  return ph;
}

/** Emette purchase server-side (fonte di verità revenue). order_id = transaction_id → dedup. */
export async function trackPurchaseServer(o: {
  orderId: string; buyerId: string; totalCents: number; paymentMethod: string; sellerId: string; coupon?: string | null;
}) {
  const valueEur = Number((o.totalCents / 100).toFixed(2));
  // 1) PostHog (idempotente: usare orderId come uuid dell'evento → dedup lato PostHog)
  try {
    client()?.capture({
      distinctId: o.buyerId,
      event: 'order_placed',
      properties: { order_id: o.orderId, total_cents: o.totalCents, payment_method: o.paymentMethod, seller_id: o.sellerId, $insert_id: o.orderId },
    });
  } catch (e) { logger.warn('[analytics] posthog purchase fallita', e); }
  // 2) GA4 Measurement Protocol (server) — transaction_id=orderId → dedup con gtag client
  const gaId = env.gaMeasurementId(); const gaSecret = process.env.GA4_API_SECRET;
  if (gaId && gaSecret) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${gaId}&api_secret=${gaSecret}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: o.buyerId,
          events: [{ name: 'purchase', params: { transaction_id: o.orderId, currency: 'EUR', value: valueEur, payment_type: o.paymentMethod, coupon: o.coupon ?? undefined } }],
        }),
      });
    } catch (e) { logger.warn('[analytics] GA4 MP purchase fallita', e); }
  }
}
```
3. Chiamarlo nel webhook, **una volta per ordine**, subito dopo il push riuscito (webhook/route.ts:338-343):
```diff
     createdOrderIds.push({
       orderId: order.id,
       sellerId: g.sellerId,
       totalCents: g.totalCents,
       itemsCount: g.items.reduce((s, it) => s + it.quantity, 0),
     });
+    // Purchase server-side (fonte di verità revenue; order_id=transaction_id → dedup GA4/PostHog).
+    await trackPurchaseServer({ orderId: order.id, buyerId, totalCents: g.totalCents, paymentMethod: 'card', sellerId: g.sellerId, coupon: couponCode });
```
   (import in testa: `import { trackPurchaseServer } from '@/lib/analytics/server';`). È già dentro il ramo idempotente `if (pending.status === 'COMPLETED') return`, quindi gira 1 volta per checkout.
4. **Dedup col client:** poiché ora il purchase è server, il `trackOrderPlaced` client di `orders/page.tsx:83` userebbe `sessionId` come transaction_id (diverso dall'`order_id`) → **doppio conteggio carta**. Fix: rimuovere l'emissione client per la carta (lasciare solo il toast UX):
```diff
-          if (p?.valueCents) {
-            trackOrderPlaced(sessionId, p.valueCents, 'card', p.sellerId ?? 'multi', { coupon: p.coupon ?? undefined });
-          }
-          sessionStorage.setItem(dedupKey, '1');
+          // purchase carta è ora emesso server-side dal webhook (order_id=transaction_id).
+          // Qui solo UX: nessun evento per evitare doppio conteggio (session_id != order_id).
+          sessionStorage.setItem(dedupKey, '1');
```
   (COD resta tracciato client in checkout:434 con `order_id` reale — invariato.)

**Verifica:** completa un checkout carta test → chiudi la tab prima del ritorno → l'ordine esiste nel DB **e** `order_placed` compare in PostHog / `purchase` in GA4 DebugView con `transaction_id = order_id`. Ripeti il webhook (Stripe CLI resend) → nessun evento duplicato (stesso `$insert_id`/`transaction_id`).
**Rischio&rollback:** 🔴 perché serve deploy + 2 env nuovi. Se `posthog-node` o GA4 falliscono, il `try/catch` non deve mai far fallire il webhook (il purchase-tracking è best-effort, l'ordine è già salvato). Rollback = rimuovi la chiamata `trackPurchaseServer`.
**Dipendenze:** nuovo pkg `posthog-node`; nuova env `GA4_API_SECRET` (Measurement Protocol) — **carburante da Nicola/@devops** (senza, GA4 server resta off, PostHog server funziona già con la key esistente). Handoff @backend-dev (webhook) + @devops-sre (env+deploy).

---

## A3 🟡 GRAVE — conversion rate e "Ordini 30gg" seller includono annullati/pending
`app/seller/analytics/page.tsx:84,91`

**Causa-radice:** la query ordini (65-68) filtra solo `seller_id`+`created_at`, senza `delivery_status`. Poi `orders30 = orders.length` e `conversionRate = orders30/views30` contano TUTTI (CANCELED/NEW/PENDING), mentre `revenue30/7` (86-89) filtrano correttamente `DELIVERED`: due popolazioni per metriche mostrate insieme, e i "Consigli" (181-188) prescrivono su un numero gonfiato.

**Fix:** definizione unica "ordine valido" = `delivery_status NOT IN ('CANCELED','FAILED')` per conteggi e conversion (coerente con la sezione 0).
```diff
-      const orders30 = orders.length;
-      const orders7 = orders.filter((o) => o.created_at >= since7).length;
+      // Ordine "valido" = non annullato/fallito (coerente con revenue e GLOSSARIO-KPI).
+      const isValid = (o: { delivery_status: string }) => o.delivery_status !== 'CANCELED' && o.delivery_status !== 'FAILED';
+      const validOrders = orders.filter(isValid);
+      const orders30 = validOrders.length;
+      const orders7 = validOrders.filter((o) => o.created_at >= since7).length;
```
`conversionRate = views30 > 0 ? (orders30 / views30) * 100 : 0` resta invariato ma ora `orders30` è pulito.
Nota: `peakHours`/`hourCounts` (132-133) iterano su tutti gli `orders` → per coerenza usare `validOrders` anche lì (opzionale, minore).

**Verifica:** seller con 1 ordine CANCELED e 1 DELIVERED su 100 view → conversion = 1% (non 2%), card "Ordini 30gg" = 1.
**Rischio&rollback:** basso, pura logica di lettura. Rollback = 1 riga.
**Dipendenze:** documentare la definizione nel GLOSSARIO-KPI (@finanza/@analista).

---

## A4 🟡 GRAVE — dashboard traffico admin misura solo consenzienti, spacciato per totale
`components/ActivityTracker.tsx:56` + `app/api/track/route.ts:87-90` → `app/admin/activity/page.tsx`

**Causa-radice:** il beacon è doppio-gated sul consenso analytics (client 56 + server 87-90): senza opt-in nessun `page_view`. Le dashboard leggono `activity_events` e presentano "Visitatori 24h/top paths/IP" come traffico totale, senza nota. Sottostima non dichiarata → ogni tasso calcolato su questa base è distorto.

**Fix (minimo, difesa in profondità):** **etichettare** esplicitamente le metriche come campione consenzienti — non spacciarle per totale. (L'alternativa "conteggio cookieless aggregato" richiede un endpoint edge non-personale: proposta separata, vedi sotto.)
```diff
// app/admin/activity/page.tsx — accanto al titolo "Visitatori 24h"
- <h2>Visitatori 24h</h2>
+ <h2>Visitatori 24h <span className="text-xs text-ink-500">(solo utenti con consenso analytics)</span></h2>
```
**Proposta 🟢 follow-up (accodata):** middleware/edge counter cookieless (nessun PII, solo COUNT per path/giorno in una tabella `traffic_daily`) per avere il volume totale reale accanto al campione. Non in questo branch.

**Verifica:** la label appare in tutte le card di traffico; nessuna cifra "totale" resta senza qualificatore.
**Rischio&rollback:** nullo (solo copy). Dipendenze: allineare la nota alla definizione "visita" della sezione 0.

---

## A5 🟡 GRAVE — doppia verità views: product_views scritto senza consenso, product_viewed gated
`components/ProductViewTracker.tsx:24-49` vs `lib/analytics/posthog.tsx:40-52`

**Causa-radice:** nello stesso effetto, `trackProductViewed`→PostHog è gated (consenso), ma l'insert `product_views` (35-38) e l'upsert `recently_viewed` con `user_id` (41-48) girano SENZA controllo consenso. Per un non-consenziente si scrive la riga DB ma non l'evento PostHog → 3 numeri di "view" non riconciliabili + rischio privacy (recently_viewed con user_id pre-consenso).

**Fix (definizione unica sezione 0):** `product_views` resta la fonte-seller ma diventa **misura di prodotto anonima** (conteggio scheda-aperta, no user_id → nessun profilo pre-consenso); `recently_viewed` (personale) va **gated dal consenso**.
```diff
     trackProductViewed(productId, { price, category, seller_id: sellerId });
 
     (async () => {
-      const { data: { user } } = await supabase.auth.getUser();
-
-      // 1) product_views (sempre, anche guest)
+      // 1) product_views — misura di prodotto ANONIMA (nessun user_id): non è
+      //    profilazione, non richiede consenso; è il conteggio "scheda aperta"
+      //    autoritativo per il seller (vedi WS-ANALYTICS-SEC §0).
       await supabase.from('product_views').insert({
         product_id: productId,
-        user_id: user?.id ?? null,
+        user_id: null,
       });
 
-      // 2) recently_viewed (solo loggati) — upsert con touch viewed_at
-      if (user) {
+      // 2) recently_viewed — PERSONALE: solo con consenso analytics + loggato.
+      const { data: { user } } = await supabase.auth.getUser();
+      if (user && hasConsent('analytics')) {
         await supabase
           .from('recently_viewed')
```
(import: `import { hasConsent } from '@/lib/consent';`)

**Verifica:** utente senza consenso apre una scheda → `product_views` +1 con `user_id NULL`, `recently_viewed` invariato, PostHog nessun evento. Utente consenziente loggato → tutti e tre.
**Rischio&rollback:** basso; attenzione se qualche query usa `product_views.user_id` per unicità utente → grep prima di applicare (oggi il seller usa solo `product_id`/`viewed_at`, ok). Rollback = ripristina user_id.
**Dipendenze:** @security/@legale-privacy (base giuridica), GLOSSARIO (definizione "view").

---

## A6 🟡 MINORE — "Visitatori 24h" su fetch troncato a limit(3000)
`app/admin/activity/page.tsx:114-124`

**Causa-radice:** la sintesi 24h è aggregata client-side su `.limit(3000)`: oltre 3000 eventi/24h la finestra "24h" diventa "ultimi 3000 eventi" (poche ore) e il KPI plateaua senza errore. Latente (oggi il volume non c'è).

**Fix:** aggregare lato DB con una RPC/vista, togliendo la dipendenza dal limit di riga. Migrazione (coordinare con WS-DB-RLS/@backend-dev):
```sql
-- migrations/XXX_activity_summary_24h.sql
create or replace function activity_summary_24h()
returns table(unique_visitors bigint, anon_views bigint, logged_views bigint, logins bigint)
language sql stable security definer set search_path = public as $$
  select
    count(distinct coalesce(anon_id, session_id)) filter (where category='visitor'),
    count(*) filter (where category='visitor' and event_type='page_view' and user_id is null),
    count(*) filter (where category='visitor' and event_type='page_view' and user_id is not null),
    count(*) filter (where event_type='login')
  from activity_events
  where created_at >= now() - interval '24 hours' and is_bot = false;
$$;
revoke all on function activity_summary_24h() from public, anon;
grant execute on function activity_summary_24h() to authenticated; -- gate admin via RLS/route
```
Il client chiama `supabase.rpc('activity_summary_24h')` per i conteggi; top paths/IP con `.select(count)` mirati per gruppo, non su righe grezze.

**Verifica:** seed >3000 eventi in 24h in staging → il conteggio non si ferma a 3000.
**Rischio&rollback:** medio (nuova RPC security-definer → gate accesso admin). Rollback = drop function, torna al limit.
**Dipendenze:** WS-DB-RLS (migrazione+grant), @backend-dev.

---

## A7 🟡 MINORE — "Visitatori unici" conta tutte le categorie con fallback su r.id → inflazione
`app/admin/activity/page.tsx:138-141`

**Causa-radice:** `uniqueVisitors.add(visitorKey)` gira su OGNI riga (tutte le categorie) con `visitorKey = anon_id || session_id || ip || r.id`. Gli eventi non-visitor (trigger DB) spesso non hanno anon/session/ip → cadono su `r.id` (PK riga) e ognuno conta come visitatore unico.
```diff
     for (const r of realtime) {
-      const visitorKey = r.anon_id || r.session_id || r.ip || r.id;
-      if (new Date(r.created_at).getTime() >= fiveMin) onlineSet.add(visitorKey);
-      uniqueVisitors.add(visitorKey);
+      const isVisit = r.category === 'visitor';
+      const visitorKey = r.anon_id || r.session_id || null; // niente fallback su ip/r.id
+      if (isVisit && visitorKey) {
+        if (new Date(r.created_at).getTime() >= fiveMin) onlineSet.add(visitorKey);
+        uniqueVisitors.add(visitorKey);
+      }
       byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
```
**Verifica:** dataset con 100 eventi trigger senza identificatori + 5 page_view di 2 anon → uniqueVisitors = 2 (non 105).
**Rischio&rollback:** basso. Se la RPC A6 viene adottata, questo diventa superfluo per i conteggi (ma resta per la lista "online"). Coerente con la definizione "visita" §0.

---

## A8 🟡 MINORE — cookie A/B mc_exp_home_hero impostato senza consenso
`middleware.ts:122-144` + `lib/experiments.ts:45`

**Causa-radice:** il middleware persiste il cookie esperimento (90gg) a ogni nuovo visitatore incondizionatamente (128-143), prima del consenso. Un cookie A/B non è tecnico/necessario → sotto ePrivacy/Garante richiede consenso; incoerente con PostHog/GA4/mc_vid (tutti gated). Inoltre `experiment_exposed` è gated → popolazione assegnata (tutti) ≠ misurata (consenzienti).

**Fix:** assegnare la variante in-request (header, per render senza flicker) ma **persistere il cookie solo col consenso**. Leggere il consenso dal cookie in middleware:
```diff
   const res = NextResponse.next({ request: { headers: reqHeaders } });
   res.headers.set('Content-Security-Policy', csp);
-  for (const a of newAssignments) {
+  const consent = parseConsentCookie(req.cookies.get(CONSENT_COOKIE)?.value);
+  // Cookie A/B non necessario → persistito solo col consenso analytics.
+  // Senza consenso la variante resta per-request (header), non persistita.
+  for (const a of (consent.analytics ? newAssignments : [])) {
     res.cookies.set({ name: a.cookie, value: a.variant, maxAge: EXP_COOKIE_MAX_AGE, path: '/', sameSite: 'lax' });
   }
```
(import `parseConsentCookie, CONSENT_COOKIE` da `@/lib/consent` — già usati altrove, verificare compat edge-runtime del parser.)
Così assegnazione persistita e misurazione (`experiment_exposed`) coincidono: solo consenzienti.

**Verifica:** navigare senza accettare → nessun cookie `mc_exp_*` in response; accettare e ricaricare → cookie presente; `experiment_exposed` solo dopo consenso.
**Rischio&rollback:** basso; senza cookie il non-consenziente può cambiare variante tra request (accettabile: non è misurato). Rollback = rimuovi il gate. Dipendenze: @legale-privacy (conferma base), verificare che `parseConsentCookie` giri in edge middleware.

---

## A9 🟢 MINORE — $pageview PostHog con solo path (senza origin)
`lib/analytics/posthog.tsx:118-121` vs `components/GoogleAnalytics.tsx:46-49`

**Causa-radice:** forza `$current_url` al path relativo, degradando `$host`/referrer/parsing; GA4 usa `origin+url`. Due formati.
```diff
   useEffect(() => {
     if (!POSTHOG_KEY) return;
-    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
+    const rel = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
+    const url = (typeof window !== 'undefined' ? window.location.origin : '') + rel;
     getPosthog().then((ph) => {
       if (ph) ph.capture('$pageview', { $current_url: url });
     });
   }, [pathname, searchParams]);
```
**Verifica:** in PostHog `$current_url` = URL assoluto, `$host` popolato.
**Rischio&rollback:** nullo. Dipendenze: nessuna.

---

## A10 🟢 MINORE — funnel value incoerente: begin_checkout=subtotale, purchase=totale
`app/checkout/page.tsx:53-55` vs `:434-440` e `app/orders/page.tsx:83`

**Causa-radice:** `checkout_started/begin_checkout` (53-55) usa `sum(price*qty)` senza spedizione/sconti; `purchase` usa grandTotal. Il rapporto valore begin→purchase è distorto.

**Fix pragmatico:** documentare che `checkout_started.total_cents` = **subtotale merce** (spedizione/coupon non ancora noti al mount), e allineare l'analisi. Rendere esplicito il naming nel commento + property:
```diff
-      const totalCents = Math.round(c.reduce((s, i) => s + i.price * i.quantity, 0) * 100);
-      trackCheckoutStarted(totalCents, c.reduce((s, i) => s + i.quantity, 0));
+      // value = SUBTOTALE merce (spedizione/coupon ancora ignoti al mount del checkout).
+      // Non confrontabile 1:1 con purchase (grandTotal): vedi WS-ANALYTICS-SEC §A10 + GLOSSARIO.
+      const subtotalCents = Math.round(c.reduce((s, i) => s + i.price * i.quantity, 0) * 100);
+      trackCheckoutStarted(subtotalCents, c.reduce((s, i) => s + i.quantity, 0));
```
(rinominare il campo evento `total_cents`→`subtotal_cents` in `events.ts:89-90` è più pulito ma è breaking per dashboard esistenti → farlo solo coordinato con @analista.)
**Verifica:** GLOSSARIO documenta i due `value`. **Rischio:** nullo (commento/naming). Dipendenze: @analista.

---

## A11 🟢 MINORE — search result_count riflette solo match nome, pre-filtri
`components/ProductGrid.tsx:95-98,246-253`

**Causa-radice:** `result_count = prods.length` = risultati `ilike` sul solo `name`, prima dei filtri client (`filtered` usato per `onCount`), e cappato da `limit`. Non corrisponde a ciò che l'utente vede → diagnosi errate sulle ricerche a zero risultati.

**Fix:** tracciare il conteggio realmente mostrato (`filtered.length`) e chiarire nel naming che è post-filtri:
```diff
// dove si emette trackSearchPerformed (righe ~246-253)
-    trackSearchPerformed(search, prods.length);
+    // result_count = risultati effettivamente mostrati (post-filtri client), non il grezzo ilike.
+    trackSearchPerformed(search, filtered.length);
```
(se `filtered` non è in scope al punto di emissione, spostare la track dopo il calcolo di `filtered`, o passare `onCount`.)
**Verifica:** ricerca con filtro prezzo che azzera i risultati → `result_count=0` (oggi >0).
**Rischio&rollback:** basso. Dipendenze: @frontend-dev (scope di `filtered`), @cro (analisi ricerche zero-result).

---

## A12 🟢 MINORE — /api/track: handler session_start/signup mai inviati (config morta)
`app/api/track/route.ts:26-40` vs `components/ActivityTracker.tsx:89-118`

**Causa-radice:** `ALLOWED_EVENTS`/`SUMMARY` accettano `session_start` e `signup`, ma il client non li emette più (usa `page_view` con `metadata.new_session`; una registrazione appare come `login`). Config/commenti fuorvianti.

**Fix (scegliere UNA — raccomando emettere signup, è un evento utile):**
- **Opzione consigliata:** emettere davvero `signup` dal client alla registrazione (in ActivityTracker o nel flow di signup), così il funnel signup esiste in `activity_events` invece di essere dedotto da `profiles`. E **rimuovere** `session_start` (morto):
```diff
 const ALLOWED_EVENTS: Record<string, ActivityCategory> = {
   page_view: 'visitor',
-  session_start: 'visitor',
   login: 'auth',
   logout: 'auth',
   signup: 'auth',
 };
 const SUMMARY: Record<string, (path?: string) => string> = {
   page_view: (p) => `Pagina vista: ${p || '/'}`,
-  session_start: () => 'Nuova sessione avviata',
   login: () => 'Accesso effettuato',
   logout: () => 'Disconnessione',
   signup: () => 'Registrazione completata',
 };
```
  poi nel signup flow: `send({ event_type: 'signup' })` (nota: `signup` è category `auth` → non gated, coerente).
**Verifica:** registrandosi appare un evento `signup` in activity_events (non solo `login`); nessun handler `session_start` residuo.
**Rischio&rollback:** basso. Dipendenze: punto di emissione signup → @frontend-dev.

---

# PARTE B — SICUREZZA & AUTH (3 finding)

## B1 🟡 GRAVE — XSS/HTML-injection via JSON-LD (6 sink senza escape)
`app/product/[id]/page.tsx:392` · `app/store/[id]/page.tsx:94` · `components/ui/Breadcrumb.tsx:63` · `app/category/[slug]/page.tsx:254,295` · `app/layout.tsx:119`

**Causa-radice:** tutti i sink fanno `dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}`. `JSON.stringify` NON esegue escape di `<` `/` `U+2028` `U+2029`: un campo controllato dal venditore (nome/descrizione prodotto, store_name/address/socials, label breadcrumb) contenente `</script><meta http-equiv=refresh ...>` esce dal contesto script e inietta HTML in SSR. La CSP nonce+strict-dynamic blocca l'esecuzione di `<script>` inline ma **non** l'HTML-injection non-script (refresh→phishing, overlay, defacement). Stored, persistente, colpisce le pagine più viste.

**Fix — difesa in profondità, helper centralizzato:**
```ts
// lib/jsonld.ts
/**
 * Serializza un oggetto per l'inserimento sicuro in <script type="application/ld+json">.
 * Escapa i caratteri che possono rompere il contesto <script> o l'HTML:
 *  - '<'  → <  (impedisce </script> e <meta ...>)
 *  - U+2028/U+2029 → line/paragraph separator (validi in HTML, rompono JS)
 * NON affidarsi alla sola CSP: questa è la barriera contro HTML-injection non-script.
 */
export function jsonLdSafe(schema: unknown): string {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/ /g, '\\u2028')
    .replace(/ /g, '\\u2029');
}
```
Applicare in **tutti e 6** i sink (identico ovunque):
```diff
- dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
+ dangerouslySetInnerHTML={{ __html: jsonLdSafe(productSchema) }}
```
(import `import { jsonLdSafe } from '@/lib/jsonld';` in ciascun file; per `layout.tsx` → `orgSchema`, `store` → `localBusinessSchema`, `category` × 2 → `breadcrumbSchema`, Breadcrumb → `schema`.)

**Verifica:**
- Unit: `jsonLdSafe({ n: '</script><meta http-equiv="refresh">' })` non contiene `</script>` né `<meta` letterali (solo `<`).
- E2E: crea un prodotto/store con nome `</script><h1>XSS</h1>`, apri la scheda in SSR → nessun `<h1>` iniettato nel DOM; lo JSON-LD resta parsabile (test `06-seo-and-a11y.spec.ts:19` continua a passare, `JSON.parse` del textContent OK perché `<` è JSON valido).
**Rischio&rollback:** basso — l'escape produce JSON semanticamente identico (i parser Google/JSON-LD de-escapano `<`), nessuna regressione SEO. Rollback = torna a JSON.stringify. **Blast-radius:** 6 file, tutte pagine ad alto traffico → priorità alta.
**Dipendenze:** @security (review), @frontend-dev (i 6 file sono componenti pagina). Nessuna migrazione.

---

## B2 🟡 MINORE — rate-limit per-IP aggirabile via X-Forwarded-For falsificato + Turnstile fail-open
`lib/rate-limit.ts:152-159` + `lib/captcha.ts:17-27`

**Causa-radice (XFF):** `getClientIp` prende il **primo** valore di XFF (`split(',')[0]`), controllato dal client. Dietro il proxy Render l'attaccante invia un XFF arbitrario e il proxy **appende** l'IP reale in coda → `[0]` resta il valore falso. Tutti i limiter keyati su IP diventano aggirabili ruotando l'header (10 call-site, tra cui signin/signup/contact/track).

**Fix XFF — prendere l'hop fidato (destra), non il leftmost:**
```diff
-/** Estrae IP "ragionevole" da NextRequest. Non perfetto contro spoofing. */
-export function getClientIp(req: Request): string {
-  const xff = req.headers.get('x-forwarded-for');
-  if (xff) return xff.split(',')[0].trim();
-  const real = req.headers.get('x-real-ip');
-  if (real) return real.trim();
-  return 'unknown';
-}
+/**
+ * IP del client resistente allo spoofing dietro il proxy Render.
+ * Render/piattaforma APPENDE l'IP reale in coda a X-Forwarded-For: il client può
+ * iniettare valori falsi a SINISTRA ma non a destra. Quindi si prende l'ULTIMO
+ * valore dell'XFF (l'hop più vicino al nostro edge fidato), non il primo.
+ * TRUSTED_PROXY_HOPS permette di scartare N proxy interni se la topologia cambia.
+ */
+const TRUSTED_PROXY_HOPS = Number(process.env.TRUSTED_PROXY_HOPS ?? 0);
+export function getClientIp(req: Request): string {
+  // x-real-ip è impostato dal proxy della piattaforma (non falsificabile dal client): preferirlo.
+  const real = req.headers.get('x-real-ip');
+  if (real) return real.trim();
+  const xff = req.headers.get('x-forwarded-for');
+  if (xff) {
+    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
+    if (parts.length > 0) {
+      const idx = Math.max(0, parts.length - 1 - TRUSTED_PROXY_HOPS);
+      return parts[idx];
+    }
+  }
+  return 'unknown';
+}
+```
+**⚠️ Verificare su Render** quale header è autoritativo (`x-real-ip` vs XFF rightmost) prima del merge — dipende dalla config edge. Se Render setta `x-real-ip` col client IP reale, è la fonte migliore.

**Fix Turnstile fail-open (captcha.ts:18-27):** in produzione l'assenza di `TURNSTILE_SECRET_KEY` deve essere **hard-fail**, non skip:
```diff
   const secret = env.turnstileSecretKey();
   if (!secret) {
-    if (process.env.NODE_ENV === 'production') {
-      logger.error(new Error('TURNSTILE_SECRET_KEY mancante in produzione: CAPTCHA disabilitato (rischio bot)'), { context: 'captcha' });
-    }
-    return { ok: true, skipped: true };
+    if (process.env.NODE_ENV === 'production') {
+      // Fail-CLOSED: in prod senza chiave il CAPTCHA non può essere aggirato silenziosamente.
+      logger.error(new Error('TURNSTILE_SECRET_KEY mancante in produzione'), { context: 'captcha' });
+      return { ok: false, reason: 'CAPTCHA non configurato' };
+    }
+    // Solo in dev/local: skip per non richiedere l'integrazione.
+    return { ok: true, skipped: true };
   }
```

**Verifica:** (XFF) request con `X-Forwarded-For: 1.2.3.4` finto + IP reale appeso → il rate-limit key usa l'IP reale, ruotare l'header falso non resetta il contatore (test unit `rate-limit.test.ts`). (Turnstile) in `NODE_ENV=production` senza secret → signin/signup ritornano errore CAPTCHA, non passano.
**Rischio&rollback:** medio. Il fail-closed Turnstile **blocca i login se la chiave manca in prod** → prima di deployare verificare che `TURNSTILE_SECRET_KEY` sia effettivamente impostata su Render (altrimenti lockout). → **coordinare con @devops-sre** (env check pre-deploy). XFF: se la topologia proxy è diversa dall'assunto, l'IP può risultare errato → mitigato da `x-real-ip` first + `TRUSTED_PROXY_HOPS`. Rollback = ripristina leftmost / fail-open.
**Dipendenze:** @devops-sre (conferma header Render + presenza TURNSTILE_SECRET_KEY prima del deploy), @security (review).

---

## B3 🟡 MINORE — messages_update_read consente di riscrivere il body altrui
`migrations/026_chat_messaging.sql:83` (RLS `messages_update_read`)

**Causa-radice:** la policy ha solo `USING` (appartenenza conversazione via buyer_id/seller_id), senza `WITH CHECK` ristretto né trigger BEFORE UPDATE che congeli `body`, né GRANT per-colonna. Un partecipante può `update({ body })` su un messaggio della controparte e la scrittura passa → manomissione/ripudio della cronologia chat (usata come prova in resi/dispute).

**Fix — NON duplicare qui la migrazione: è di dominio DB/RLS.** → **coordinare con WS-DB-RLS.** Annoto la soluzione raccomandata perché WS-DB-RLS la recepisca (stesso pattern di `enforce_profile_update_rules`/`enforce_order_update_rules` già presenti):
```sql
-- (da inserire in WS-DB-RLS, NON in questo branch)
create or replace function enforce_message_update_rules()
returns trigger language plpgsql as $$
begin
  -- solo read_at può cambiare per utenti non privilegiati; body/mittente immutabili
  if NEW.body is distinct from OLD.body then
    raise exception 'message body is immutable';
  end if;
  return NEW;
end $$;
create trigger trg_enforce_message_update
  before update on public.messages
  for each row execute function enforce_message_update_rules();
-- in alternativa/aggiunta: revoke update on public.messages from authenticated;
--                          grant update (read_at) on public.messages to authenticated;
```
**Verifica (in WS-DB-RLS):** un partecipante prova `update({ body })` su un messaggio → eccezione `message body is immutable`; `update({ read_at })` passa.
**Rischio&rollback:** medio (tocca RLS chat) → è WS-DB-RLS a valutarlo e testarlo. Qui: **solo annotazione**, nessuna modifica applicata.
**Dipendenze:** WS-DB-RLS (owner della migrazione), @security.

---

## Riepilogo colori & sequenza consigliata
| # | Finding | Colore | Owner handoff |
|---|---|---|---|
| B1 | JSON-LD escape (helper jsonLdSafe) | 🟡 codice | frontend-dev/security — **priorità 1** (stored, alto traffico) |
| A2 | purchase server-side webhook | 🔴 deploy+env | backend-dev + devops (GA4_API_SECRET, posthog-node) |
| A3,A5,A4 | KPI ordini/view/consenso | 🟡 codice | frontend/backend + finanza/legale |
| B2 | getClientIp + Turnstile fail-closed | 🟡 codice | devops (verifica header Render + env) |
| A1,A6,A7-A12 | funnel/aggregazioni/naming | 🟢/🟡 | frontend + backend (A6 RPC) |
| B3 | messages body immutable | 🟡 DB | **WS-DB-RLS** (annotato, non applicato) |

**Carburante che alza il tetto (da Nicola/@devops):** `GA4_API_SECRET` (Measurement Protocol server), conferma header IP autoritativo su Render, conferma `TURNSTILE_SECRET_KEY` presente in prod prima del fail-closed.
