# WS-MONEY — Pacchetto di fix Pagamenti / Stripe Connect

> Owner: **backend-dev** · 2026-07-04 · dimensione `pagamenti-stripe` (8 finding, tutti coperti)
> Fonti: codice reale `marketplace/` (SCT — Separate Charges & Transfers) · `_findings.json` · radiografia 2026-07-04
> Migrazioni: `consegne/bonifica/sql/130..134` (range riservato; ultima migration in repo = 107)
> Colore complessivo: 🟡 (patch di codice in branch + migrazioni reversibili) — **nessun deploy senza firma** 🔴

**Come applicare (ordine — le migrazioni PRIMA del codice che le usa):**
1. `130` (coupon claim) → poi patch checkout/cod/webhook coupon.
2. `131` (reversed_amount_cents) → poi patch `payout.ts` (refund clamp + reversal cumulativo) + webhook select.
3. `132` (idempotenza wallet) → poi patch admin-cancel COD.
4. `133` (rider_reversal_id) → codice **solo** se Nicola approva il claw-back rider (finding #7).
5. `134` (event claim) → poi patch webhook event-level.

**Cosa referenziano gli altri workstream (owner = io):**
- **CLAIM ATOMICO COUPON** → RPC `claim_coupon(code,user,ref)` / `release_coupon(ref)` (mig.130). Chi tocca checkout/COD/carrello usa QUESTE, non deve reimplementare la logica coupon.
- **FINESTRA OVERSELLING** → `expires_at` sulla Checkout Session (client.ts) + ri-riserva stock in `handleCheckoutCompleted` (webhook). Chi tocca checkout/stock si allinea qui.
- **Reversal cumulativo** `reverseOrderTransfer(order, amountCents?, ref)` + colonna `reversed_amount_cents` → chi emette rimborsi/dispute/chargeback passa da qui.

---

## Finding #1 — Over-refund + reversal single-shot 🔴→🟡 (grave, perdita economica diretta)

**Causa radice.** In `refundOrder` (`lib/stripe/payout.ts:330-331`) il tetto è `min(amount, orderTotalCents)`, MAI `orderTotalCents - refunded_amount_cents`: dopo un reso REFUNDED si può aprire un secondo reso/dispute e ri-rimborsare a pieno. Sul COD è doppio accredito wallet (ref diverso → l'indice parziale non protegge). In più `reverseOrderTransfer` (`:248-250`, `:260`) è no-op se `stripe_reversal_id` è già presente e usa `idempotencyKey` per-ordine: un 2° reversal parziale non storna la quota venditore.

**Fix.** (a) clamp al **residuo**; (b) reversal **cumulativo** con `reversed_amount_cents` (mig.131) e `idempotencyKey` **per operazione**.

### 1a. Clamp al residuo — `lib/stripe/payout.ts:328-332`
```diff
   // Clamp di sicurezza: mai rimborsare più del RESIDUO ancora rimborsabile
-  // (in multi-seller la charge è condivisa: un clamp per-ordine evita di prosciugare i fondi degli altri seller).
+  // (in multi-seller la charge è condivisa: un clamp per-ordine evita di prosciugare i fondi degli altri seller).
+  // RESIDUO = totale ordine − già rimborsato: senza questo, un 2° reso/dispute rimborsava di nuovo il totale pieno.
   const orderTotalCents = Math.round(Number(order.total_price) * 100);
-  const safeAmountCents = Math.max(0, Math.min(opts.amountCents, orderTotalCents));
-  if (safeAmountCents <= 0) throw new Error('refundOrder: importo rimborso non valido');
+  const alreadyRefundedCents = order.refunded_amount_cents ?? 0;
+  const residualCents = Math.max(0, orderTotalCents - alreadyRefundedCents);
+  const safeAmountCents = Math.max(0, Math.min(opts.amountCents, residualCents));
+  if (safeAmountCents <= 0) throw new Error('refundOrder: nessun importo residuo da rimborsare');
```

### 1b. Aggiungi `reversed_amount_cents` alle SELECT — `payout.ts:322`
```diff
-    .select('id, user_id, total_price, seller_payout_cents, payout_status, stripe_payment_intent, stripe_transfer_id, stripe_reversal_id, refunded_amount_cents, payment_method')
+    .select('id, user_id, total_price, seller_payout_cents, payout_status, stripe_payment_intent, stripe_transfer_id, stripe_reversal_id, reversed_amount_cents, refunded_amount_cents, payment_method')
```

### 1c. Reversal cumulativo — `payout.ts:218-271` (interface + funzione)
```diff
 export interface ReversibleOrder {
   id: string;
   payout_status: string | null;
   stripe_transfer_id: string | null;
   seller_payout_cents: number | null;
   stripe_reversal_id?: string | null;
+  reversed_amount_cents?: number | null;
 }
@@
 export async function reverseOrderTransfer(
   order: ReversibleOrder,
   amountCents?: number,
+  /** Suffisso di idempotenza PER OPERAZIONE (es. return_<id> / dispute_<id> / charge_<id>). */
+  idemRef?: string,
 ): Promise<{ reversalId: string | null; reversedCents: number }> {
   if (order.payout_status !== 'TRANSFERRED' || !order.stripe_transfer_id) {
     return { reversalId: null, reversedCents: 0 };
   }
-  if (order.stripe_reversal_id) {
-    return { reversalId: order.stripe_reversal_id, reversedCents: 0 };
-  }
-
-  const maxCents = order.seller_payout_cents ?? 0;
-  const reverseCents = Math.min(amountCents ?? maxCents, maxCents);
-  if (reverseCents <= 0) return { reversalId: null, reversedCents: 0 };
+  // Claw-back CUMULATIVO: si può stornare più volte finché la somma non supera il netto.
+  const maxCents = order.seller_payout_cents ?? 0;
+  const alreadyReversed = order.reversed_amount_cents ?? 0;
+  const remaining = Math.max(0, maxCents - alreadyReversed);
+  const reverseCents = Math.min(amountCents ?? remaining, remaining);
+  if (reverseCents <= 0) return { reversalId: order.stripe_reversal_id ?? null, reversedCents: 0 };
 
   const stripe = getStripe();
   const reversal = await stripe.transfers.createReversal(
     order.stripe_transfer_id,
     { amount: reverseCents, metadata: { order_id: order.id } },
-    { idempotencyKey: `reversal_${order.id}` },
+    // idempotencyKey PER OPERAZIONE: un 2° reversal parziale (ref diverso) storna davvero.
+    { idempotencyKey: `reversal_${order.id}_${idemRef ?? alreadyReversed}` },
   );
 
   const admin = getAdminSupabase();
-  const isFull = reverseCents >= maxCents;
+  const newReversed = alreadyReversed + reverseCents;
+  const isFull = newReversed >= maxCents;
   await admin
     .from('orders')
-    .update({ stripe_reversal_id: reversal.id, ...(isFull ? { payout_status: 'REVERSED' } : {}) })
+    .update({
+      stripe_reversal_id: reversal.id,
+      reversed_amount_cents: newReversed,
+      ...(isFull ? { payout_status: 'REVERSED' } : {}),
+    })
     .eq('id', order.id);
 
-  return { reversalId: reversal.id, reversedCents: reverseCents };
+  return { reversalId: reversal.id, reversedCents: reverseCents };
 }
```

### 1d. Passa il ref di idempotenza dai due call-site in `refundOrder` (`payout.ts:358` e `:414`)
```diff
-    const { reversedCents } = await reverseOrderTransfer(order, sellerShare);
+    const { reversedCents } = await reverseOrderTransfer(order, sellerShare, opts.idempotencyKey);
```
(identico nei due punti: COD ~358 e carta ~414; `opts.idempotencyKey` è già `return_<id>`/`dispute_<id>`.)

### 1e. Webhook `handleChargeRefunded` — select + ref (`webhook/route.ts:647`, `:694`)
```diff
-    .select('id, user_id, total_price, seller_id, payout_status, payment_status, stripe_transfer_id, seller_payout_cents, stripe_reversal_id')
+    .select('id, user_id, total_price, seller_id, payout_status, payment_status, stripe_transfer_id, seller_payout_cents, stripe_reversal_id, reversed_amount_cents')
@@
-        const { reversalId } = await reverseOrderTransfer(o);
+        const { reversalId } = await reverseOrderTransfer(o, undefined, `charge_${charge.id}`);
```
E in `findOrdersForDispute` (colonne dispute, `webhook:792`) aggiungi `reversed_amount_cents`; in `handleDisputeCreated` (`:802`) → `reverseOrderTransfer(o, undefined, \`dispute_${dispute.id}\`)`.

**Test** (`tests/unit/refund-clamp.test.ts`):
```
- refund clamp: order 100€, già rimborsato 100€ → refundOrder({amount:10000}) throw "nessun importo residuo".
- refund clamp: order 100€, già 60€ → refundOrder({amount:8000}) rimborsa solo 4000 (residuo).
- reversal cumulativo: seller_payout=9000, reversed=0 → reverse(4000,'r1') → reversed=4000, status TRANSFERRED;
    poi reverse(6000,'r2') → clampa a 5000, reversed=9000, status REVERSED, 2 createReversal con key distinte.
- reversal oltre il netto: reversed=9000 → reverse(1000) → no-op (remaining=0).
```
**Verifica.** `stripe listen` → doppio reso su stesso ordine: 2° chiamata NON crea refund extra; su carta la somma reversal in Dashboard = netto venditore, mai oltre.
**Rischio&rollback.** Colonna additiva con backfill (mig.131). Rollback: drop colonna + revert diff → torna al comportamento single-shot. Rischio: CHECK `NOT VALID` non blocca righe storiche.
**Dipendenze.** Richiede mig.131 applicata prima del codice.

---

## Finding #2 — Finestra di overselling (session 24h vs pending 2h) 🟡 (grave)

**Causa radice.** `createMultiSellerCheckoutSession` (`client.ts:168-193`) non imposta `expires_at` → sessione pagabile ~24h. `pending_checkouts.expires_at` = 2h (mig.042) + cron `expire-checkouts` fa `restore_stock` e porta a EXPIRED. Se il buyer paga tra +2h e +24h, `handleCheckoutCompleted` (unico guard `status==='COMPLETED'`, `webhook:210`) crea ordini SENZA ri-riservare stock già rilasciato.

**Fix (a).** `expires_at` allineato al pending — `client.ts:168`
```diff
   return await stripe.checkout.sessions.create({
     mode: 'payment',
     payment_method_types: ['card'],
+    // Allinea la vita della sessione alla riserva stock del pending_checkout (~2h):
+    // oltre, il cron ha già rilasciato lo stock → niente pagamento su merce non riservata.
+    expires_at: Math.floor(Date.now() / 1000) + 118 * 60, // 118 min (< 120 min del pending)
     line_items: lineItems,
```

**Fix (b).** Ri-riserva difensiva in `handleCheckoutCompleted` — `webhook/route.ts:209-213`
```diff
   // Idempotenza checkout-level: se già processato, no-op.
   if (pending.status === 'COMPLETED') {
     logger.info('[stripe] pending_checkout già COMPLETED, skip', { pendingCheckoutId });
     return;
   }
+
+  // Overselling guard: se il pending NON è più PENDING (EXPIRED/CANCELED dal cron) ma il
+  // buyer ha pagato lo stesso, lo stock è già stato rilasciato. Prova a ri-riservarlo
+  // PRIMA di creare gli ordini; se non è più disponibile, NON creare ordini alla cieca:
+  // rimborsa in automatico e allerta gli admin.
+  if (pending.status !== 'PENDING') {
+    const groupsForReserve = (pending.groups as PendingGroup[]) ?? [];
+    const reserveItems = groupsForReserve.flatMap((g) =>
+      (g.items ?? []).map((it) => ({ product_id: it.productId, variant_id: it.variantId ?? null, qty: it.quantity })),
+    );
+    const { error: reErr } = reserveItems.length
+      ? await admin.rpc('reserve_stock', { p_items: reserveItems })
+      : { error: null };
+    if (reErr) {
+      const piForRefund = typeof session.payment_intent === 'string' ? session.payment_intent : null;
+      logger.error('[stripe] checkout post-scadenza: stock non più disponibile, refund automatico', {
+        pendingCheckoutId, err: reErr,
+      });
+      if (piForRefund) {
+        try {
+          await stripe.refunds.create(
+            { payment_intent: piForRefund, reason: 'requested_by_customer', metadata: { reason: 'oversold_after_expiry', pending_checkout_id: pendingCheckoutId } },
+            { idempotencyKey: `oversell_refund_${pendingCheckoutId}` },
+          );
+        } catch (e) { logger.error('[stripe] refund automatico oversell fallito', e); }
+      }
+      await admin.from('pending_checkouts').update({ status: 'OVERSOLD_REFUNDED' }).eq('id', pendingCheckoutId);
+      await notifyAdmins('⚠️ Ordine annullato: stock esaurito dopo scadenza checkout',
+        `Checkout ${pendingCheckoutId} pagato dopo la scadenza, stock non disponibile: rimborsato in automatico.`, '/admin');
+      return;
+    }
+    logger.warn('[stripe] checkout post-scadenza ri-riservato con successo, procedo', { pendingCheckoutId, status: pending.status });
+  }
```
> `notifyAdmins` è già definita in `webhook/route.ts:776`. `PendingGroup` idem. Con `expires_at` (fix a), Stripe emette anche `checkout.session.expired` (già gestito) — il ramo (b) resta come rete su race di pochi secondi.

**Test** (`tests/unit/checkout-oversell.test.ts`): pending EXPIRED + reserve_stock ok → ordini creati; pending EXPIRED + reserve_stock RAISE → nessun ordine, 1 refund con key `oversell_refund_*`, status OVERSOLD_REFUNDED, alert admin.
**Verifica.** In staging: crea checkout, forza pending→EXPIRED (o attendi cron), paga la vecchia sessione → verifica refund automatico e assenza ordine.
**Rischio&rollback.** Nessuna migration. `expires_at` min Stripe = 30 min: 118 min è valido. Rollback = revert diff.
**Dipendenze.** Nessuna sul DB. Coordinare con chi tocca `cron/expire-checkouts` (deve continuare a `restore_stock`).

---

## Finding #3 — Admin-cancel COD: no restore stock né storno wallet 🟡 (grave)

**Causa radice.** Ramo `else` di `cancel/route.ts:63-73`: solo UPDATE CANCELED. Non chiama `restore_stock_for_order` né storna `wallet_applied_cents`. Il COD riserva stock (`cod:284`) e può aver speso credito (`cod:297`).

**Fix.** `cancel/route.ts` — select (`:35`) + ramo non-carta (`:63-73`)
```diff
-    .select('id, user_id, total_price, payment_method, payment_status, delivery_status, stripe_payment_intent')
+    .select('id, user_id, total_price, payment_method, payment_status, delivery_status, stripe_payment_intent, wallet_applied_cents')
@@
   } else {
+    // COD/non pagato. Se NON ancora consegnato, ripristina stock e storna il credito
+    // wallet usato (idempotente via unique index, mig.132). Un COD già DELIVERED ha il
+    // contante incassato dal rider: NON si ripristina stock né si storna (merce consegnata).
+    const wasDelivered = order.delivery_status === 'DELIVERED';
     const { error: updErr } = await admin
       .from('orders')
       .update({
         delivery_status: 'CANCELED',
         canceled_at: new Date().toISOString(),
         ...(order.payment_status === 'PENDING' ? { payment_status: 'FAILED' } : {}),
       })
       .eq('id', order.id);
     if (updErr) return ApiErrors.internal('Annullamento fallito');
+
+    if (!wasDelivered) {
+      await admin.rpc('restore_stock_for_order', { p_order_id: order.id });
+      const walletApplied = order.wallet_applied_cents ?? 0;
+      if (walletApplied > 0) {
+        const { error: wErr } = await admin.rpc('wallet_credit', {
+          p_user: order.user_id,
+          p_cents: walletApplied,
+          p_reason: 'order_admin_canceled',
+          p_ref: `admin_cancel_${order.id}`,
+        });
+        // 23505 = già stornato (doppio annullo): idempotente, non è un errore.
+        if (wErr && (wErr as { code?: string }).code !== '23505') {
+          logger.error('[admin cancel] storno wallet COD fallito', wErr);
+          return ApiErrors.internal('Storno credito fallito');
+        }
+      }
+    }
   }
```

**Test** (`tests/unit/admin-cancel-cod.test.ts`): COD NEW con wallet_applied=500 → cancel → restore_stock_for_order chiamata + wallet_credit(500,'order_admin_canceled'); doppio cancel → 2° wallet_credit 23505 → no-op, ordine resta CANCELED; COD DELIVERED → nessun restore, nessuno storno.
**Verifica.** In staging: COD con gift card, annulla da admin → saldo wallet ripristinato, stock prodotto tornato.
**Rischio&rollback.** mig.132 = solo indici (non bloccante). Nota: `restore_stock_for_order` (mig.062) ripristina lo stock **prodotto**; per gli ordini con **varianti** verificare che mig.080 lo estenda alle varianti — se no, follow-up (fuori scope, segnalato).
**Dipendenze.** mig.132 prima del codice.

---

## Finding #4 — Coupon TOCTOU (max_uses / first_order_only) 🟡 (grave) — **CLAIM ATOMICO, owner**

**Causa radice.** Vedi mig.130 header: validazione e incremento separati, nessun claim atomico né vincolo di redemption.

**Fix.** RPC `claim_coupon`/`release_coupon` (mig.130) + patch ai 3 call-site. Il claim avviene **prima** di applicare lo sconto (carta: prima di creare la Session; COD: prima di creare gli ordini); il webhook **non incrementa più**.

### 4a. Checkout carta — `app/api/stripe/checkout/route.ts` (dopo il pending insert, ~riga 359)
```diff
   if (pendErr || !pending) {
     logger.error('[stripe] pending_checkout insert failed', pendErr);
     await admin.rpc('restore_stock', { p_items: stockItems }); // rilascia la riserva
     return ApiErrors.internal('Errore nella preparazione del pagamento.');
   }
+
+  // CLAIM ATOMICO del coupon (ref = pending.id): impegna l'uso PRIMA di dare lo sconto
+  // in Checkout. Elimina il TOCTOU (N checkout paralleli con lo stesso codice). Storno su
+  // ogni fallimento a valle. Il webhook NON incrementa più (il claim è già qui).
+  if (validatedCouponCode) {
+    const { data: claim } = await admin.rpc('claim_coupon', {
+      p_code: validatedCouponCode, p_user: user.id, p_ref: pending.id,
+    });
+    if (!claim?.ok) {
+      await admin.rpc('restore_stock', { p_items: stockItems });
+      await admin.from('pending_checkouts').update({ status: 'CANCELED' }).eq('id', pending.id);
+      return ApiErrors.invalidRequest(`Coupon non più disponibile: ${claim?.reason ?? 'esaurito'}`);
+    }
+  }
```
E nel `catch` di creazione Session (`checkout:391-400`) aggiungi lo storno:
```diff
     await admin.rpc('restore_stock', { p_items: stockItems });
+    if (validatedCouponCode) await admin.rpc('release_coupon', { p_ref: pending.id });
     await admin
       .from('pending_checkouts')
       .update({ status: 'CANCELED' })
       .eq('id', pending.id);
```

### 4b. Webhook — rimuovi l'incremento (ora è al checkout) — `webhook/route.ts:356-362`
```diff
-  // Traccia l'uso del coupon (server-side authoritative). handleCheckoutCompleted
-  // esce subito se il pending era già COMPLETED, quindi l'incremento è eseguito
-  // una sola volta per checkout.
-  if (couponCode && createdOrderIds.length > 0) {
-    const { error: cErr } = await admin.rpc('increment_coupon_usage', { p_code: couponCode });
-    if (cErr) logger.warn('[stripe] increment_coupon_usage fallito', { couponCode, message: cErr.message });
-  }
+  // NB: l'uso del coupon è già stato IMPEGNATO atomicamente in /api/stripe/checkout
+  // (claim_coupon, ref = pending_checkout_id). Qui NON si incrementa più: eviterebbe il
+  // doppio conteggio su retry del webhook (finding #5).
```

### 4c. Scadenza/cancel checkout → storno claim
- `webhook/route.ts:handleCheckoutExpired` (`:871-887`), dopo aver marcato EXPIRED:
```diff
   if (items.length > 0) await admin.rpc('restore_stock', { p_items: items });
   await admin.from('pending_checkouts').update({ status: 'EXPIRED' }).eq('id', pid);
+  await admin.rpc('release_coupon', { p_ref: pid }); // rilascia l'eventuale claim coupon
```
- `app/api/cron/expire-checkouts/route.ts`: dopo aver portato un pending a EXPIRED e fatto `restore_stock`, aggiungi `await admin.rpc('release_coupon', { p_ref: <pending.id> })`.
- Il ramo overselling di finding #2 (status OVERSOLD_REFUNDED) deve pure fare `release_coupon(pendingCheckoutId)`.

### 4d. COD — claim prima del loop ordini — `app/api/orders/cod/route.ts`
Genera un ref stabile e claima subito dopo la validazione coupon (dopo `:221`):
```diff
   let validatedCouponCode: string | null = null;
+  const couponClaimRef = `cod_${crypto.randomUUID()}`; // import { randomUUID } from 'node:crypto'
   if (body.couponCode && body.couponCode.trim()) {
     const couponRes = await validateCoupon(body.couponCode, grandSubtotalCents / 100, user.id, supa);
     if (!couponRes.ok) return ApiErrors.invalidRequest(`Coupon non valido: ${couponRes.reason}`);
     couponDiscountCents = Math.max(0, Math.round(couponRes.discount * 100));
     couponFreeShipping = couponRes.freeShipping;
     validatedCouponCode = couponRes.coupon.code;
+    const { data: claim } = await admin.rpc('claim_coupon', {
+      p_code: validatedCouponCode, p_user: user.id, p_ref: couponClaimRef,
+    });
+    if (!claim?.ok) return ApiErrors.invalidRequest(`Coupon non più disponibile: ${claim?.reason ?? 'esaurito'}`);
   }
```
Aggiungi lo **storno** in `rollbackCreatedCodOrders` (`:244`) e nei due early-return dopo il claim (reserve_stock 409 `:285-291`, order-insert fail `:356-368`):
```diff
   const rollbackCreatedCodOrders = async () => {
+    if (validatedCouponCode) await admin.rpc('release_coupon', { p_ref: couponClaimRef });
     for (let j = createdOrderIds.length - 1; j >= 0; j--) {
```
```diff
     if (resErr) {
       logger.warn('[cod] reserve_stock fallita', ...);
+      if (validatedCouponCode) await admin.rpc('release_coupon', { p_ref: couponClaimRef });
+      await rollbackCreatedCodOrders();
       return NextResponse.json({ error: 'Alcuni articoli non sono più disponibili...' }, { status: 409 });
     }
```
> Nota bonus: il path `reserve_stock` 409 **non** faceva rollback dei gruppi già creati (bug pre-esistente fuori scope) — la riga `rollbackCreatedCodOrders()` aggiunta lo sana anche per gli ordini. `rollbackCreatedCodOrders` è idempotente sul release (ripete `release_coupon` che è no-op se già stornato).

Sostituisci infine l'incremento finale — `cod:457-461`:
```diff
-    // Traccia uso coupon (server-side authoritative).
-    if (validatedCouponCode && createdOrderIds.length > 0) {
-      const { error: cErr } = await admin.rpc('increment_coupon_usage', { p_code: validatedCouponCode });
-      if (cErr) logger.warn('[cod] increment_coupon_usage fallito', ...);
-    }
+    // L'uso del coupon è già stato impegnato atomicamente (claim_coupon, ref=couponClaimRef).
```

**Test** (`tests/unit/coupon-race.test.ts` + integrazione DB):
```
- claim_coupon(max_uses=1): 2 chiamate concorrenti con ref diversi → una ok, l'altra {ok:false,reason:'exhausted'}.
- claim_coupon(first_order_only): stesso user, 2 ref diversi → 1 ok, 1 {ok:false,'first_order_used'}.
- idempotenza: claim_coupon(stesso ref) x2 → 2° {ok:true,idempotent:true}, uses_count invariato.
- release_coupon(ref): dopo claim, release → uses_count torna al valore precedente, redemption rimossa.
- claim→release→claim stesso ref → ok (riusabile dopo storno).
```
Race reale: 20 richieste parallele stesso coupon max_uses=1 → esattamente 1 redemption in tabella.
**Verifica.** `psql`: `SELECT claim_coupon('X', '<uid>', 'r1');` in due sessioni concorrenti (BEGIN + FOR UPDATE serializza).
**Rischio&rollback.** mig.130 reversibile. Il claim al checkout consuma l'uso anche per checkout abbandonati → **compensato** da `release_coupon` sui path expired/cancel/fail. Rischio residuo: un pending che muore senza passare da expire-cron lascia il claim appeso finché il cron non lo scade (accettabile; il cron `expire-checkouts` lo rilascia).
**Dipendenze.** mig.130 prima del codice. Coordinare con chi tocca `cron/expire-checkouts` (deve chiamare `release_coupon`).

---

## Finding #5 — Effetti non idempotenti su retry webhook 🟡 (minore)

**Causa radice.** (i) idempotenza event-level (`webhook:57-76`) senza lock → doppia consegna concorrente processa due volte; (ii) `increment_coupon_usage` prima del COMPLETED; (iii) email/notifiche non deduplicate.

**Fix.** (ii) **già risolto** da finding #4 (claim idempotente per ref + rimozione incremento dal webhook). (i) claim atomico event-level (mig.134). (iii) → follow-up minore sotto.

### 5a. Claim atomico event-level — `webhook/route.ts:55-76`
```diff
   const admin = getAdminSupabase();
-
-  // Idempotenza event-level. processed=true viene scritto SOLO a fine handler riuscito...
-  const seen = await admin.from('stripe_event_log').insert({ event_id: event.id, type: event.type });
-  if (seen.error) {
-    if (seen.error.code === '23505') {
-      const { data: existing } = await admin
-        .from('stripe_event_log')
-        .select('processed')
-        .eq('event_id', event.id)
-        .single();
-      if (existing?.processed) {
-        return NextResponse.json({ received: true, duplicated: true }, { status: 200 });
-      }
-      // tentativo precedente non completato → procedi a riprocessare
-    } else {
-      logger.error(seen.error, { context: 'stripe-event-log-insert' });
-    }
-  }
+  // Idempotenza event-level con CLAIM ATOMICO (mig.134). Due consegne concorrenti dello
+  // stesso event.id: solo UNA vince il claim e processa; l'altra salta. Lo stale-timeout
+  // (5 min) libera un evento lasciato appeso da un worker morto.
+  await admin
+    .from('stripe_event_log')
+    .upsert({ event_id: event.id, type: event.type }, { onConflict: 'event_id', ignoreDuplicates: true });
+  const staleBefore = new Date(Date.now() - 5 * 60_000).toISOString();
+  const { data: claimedEvent } = await admin
+    .from('stripe_event_log')
+    .update({ processing_started_at: new Date().toISOString() })
+    .eq('event_id', event.id)
+    .eq('processed', false)
+    .or(`processing_started_at.is.null,processing_started_at.lt.${staleBefore}`)
+    .select('event_id');
+  if (!claimedEvent || claimedEvent.length === 0) {
+    // Già processato o in-flight su un altro worker: no-op.
+    return NextResponse.json({ received: true, deduped: true }, { status: 200 });
+  }
```
(Il blocco finale `processed=true` a `webhook:142-145` resta invariato.)

### 5b. Dedup email/notifiche (follow-up minore, 🟢)
Persistere un flag `notified_at` sull'ordine (o riusare la `email_queue` con claim di mig.085) e inviare le email di conferma solo se `notified_at IS NULL`, settandolo nella stessa transazione. Non bloccante: con 5a le doppie consegne concorrenti sono già escluse; resta solo il retry sequenziale dopo crash tra invio e COMPLETED. Consegnato come task separato per non gonfiare questo diff.

**Test** (`tests/unit/webhook-event-claim.test.ts`): due `POST` concorrenti stesso event.id → un solo handler esegue (mock su `handleCheckoutCompleted` chiamato 1 volta), entrambe 200.
**Verifica.** `stripe trigger` + doppio replay ravvicinato → 1 solo set di ordini/email.
**Rischio&rollback.** mig.134 additiva. Rollback: drop colonna + revert (torna al comportamento insert/check).
**Dipendenze.** mig.134 prima del codice. Coincide con finding #4 sul webhook (stesso file — applicare insieme).

---

## Finding #6 — Race charge.refunded vs payout in-flight (PROCESSING) 🟡 (minore)

**Causa radice.** `releaseOrderPayout` (`payout.ts:126-129`) fa l'update finale a TRANSFERRED **senza guardia di stato**: se un `charge.refunded`/dispute porta l'ordine a REFUNDED durante la creazione del transfer, l'update lo sovrascrive → seller pagato, nessun reversal. `handleChargeRefunded` storna solo i TRANSFERRED (`:692`), i PROCESSING no.

**Fix.** Update finale **condizionato** a PROCESSING; se perso, storna subito il transfer appena creato — `payout.ts:126-137`
```diff
-    await admin
-      .from('orders')
-      .update({ stripe_transfer_id: transfer.id, payout_status: 'TRANSFERRED', payout_at: new Date().toISOString() })
-      .eq('id', order.id);
-
-    return { ok: true, transferId: transfer.id };
+    // Chiudi il payout SOLO se l'ordine è ancora PROCESSING: se nel frattempo un refund/
+    // dispute l'ha portato a REFUNDED/REVERSED, NON scriviamo TRANSFERRED (seller resterebbe
+    // pagato) — stornamo subito il transfer appena creato.
+    const { data: settled } = await admin
+      .from('orders')
+      .update({ stripe_transfer_id: transfer.id, payout_status: 'TRANSFERRED', payout_at: new Date().toISOString() })
+      .eq('id', order.id)
+      .eq('payout_status', 'PROCESSING')
+      .select('id');
+    if (!settled || settled.length === 0) {
+      // Race: lo stato è cambiato durante il transfer. Traccia il transfer e stornalo.
+      await admin.from('orders').update({ stripe_transfer_id: transfer.id }).eq('id', order.id);
+      try {
+        const rev = await stripe.transfers.createReversal(
+          transfer.id,
+          { amount: order.seller_payout_cents, metadata: { order_id: order.id, reason: 'payout_raced_refund' } },
+          { idempotencyKey: `reversal_${order.id}_raced` },
+        );
+        await admin
+          .from('orders')
+          .update({ stripe_reversal_id: rev.id, reversed_amount_cents: order.seller_payout_cents })
+          .eq('id', order.id);
+      } catch (e) {
+        logger.error('[stripe] storno payout in race con refund fallito', { orderId: order.id, e });
+      }
+      return { ok: false, code: 'BAD_STATE', reason: 'Payout stornato: ordine rimborsato durante il transfer' };
+    }
+
+    return { ok: true, transferId: transfer.id };
```

**Test** (`tests/unit/payout-race.test.ts`): mock — durante `transfers.create` l'ordine passa a REFUNDED; `releaseOrderPayout` → update PROCESSING ritorna 0 righe → `createReversal(key reversal_<id>_raced)` chiamato, ritorno BAD_STATE.
**Verifica.** Difficile da riprodurre a mano (finestra stretta): coperta da unit test + log `payout_raced_refund` in Sentry.
**Rischio&rollback.** Usa `reversed_amount_cents` (mig.131). Rollback: revert diff. Rischio: se `createReversal` fallisce, resta il log per riconciliazione manuale (nessun peggioramento vs oggi).
**Dipendenze.** mig.131.

---

## Finding #7 — Compenso rider non recuperato su refund/chargeback 🟡 (minore) — **DECISIONE NICOLA** 🔴

**Causa radice.** Nessun handler storna `rider_transfer_id` su refund pieno/dispute lost: la fee di consegna versata al rider resta persa dalla piattaforma. Asimmetrico vs claw-back venditore.

**Due opzioni — serve la scelta di Nicola:**
- **A) Storna il rider** (recupera la fee). mig.133 (colonna `rider_reversal_id`, già scritta) + helper + call nei due handler.
- **B) Costo accettato** (il rider ha lavorato): **non stornare**, solo documentare. Zero codice.

**Raccomandazione backend.** Opzione **B documentata** come default (il rider ha effettivamente consegnato; stornarlo dopo la consegna è iniquo), con **A opzionale** attivabile solo per gli ordini annullati **prima** della consegna. Non implemento lo storno rider finché Nicola non sceglie.

**Se A** — bozza helper (`payout.ts`) + call:
```
export async function reverseRiderTransfer(order): Promise<{reversalId:string|null}> {
  if (order.rider_payout_status !== 'TRANSFERRED' || !order.rider_transfer_id) return {reversalId:null};
  if (order.rider_reversal_id) return {reversalId: order.rider_reversal_id};
  const rev = await getStripe().transfers.createReversal(order.rider_transfer_id,
    { metadata:{order_id:order.id, kind:'rider_fee'} }, { idempotencyKey:`reversal_rider_${order.id}` });
  await getAdminSupabase().from('orders')
    .update({ rider_reversal_id: rev.id, rider_payout_status:'REVERSED' }).eq('id', order.id);
  return {reversalId: rev.id};
}
```
→ chiamare in `handleChargeRefunded` e `handleDisputeClosed(lost)` sugli ordini con `rider_payout_status='TRANSFERRED'` (aggiungere `rider_payout_status, rider_transfer_id, rider_reversal_id` alle SELECT).

**Rischio&rollback.** mig.133 inerte finché il codice non la usa. Colore 🔴 sulla **scelta** (impatta i rider reali).
**Dipendenze.** mig.133 + decisione.

---

## Finding #8 — Webhook non verifica payment_status='paid' né amount_total 🟢 (minore, latente)

**Causa radice.** `handleCheckoutCompleted`/gift card/sponsored creano tutto su `checkout.session.completed` senza controllare `session.payment_status==='paid'`. Oggi `payment_method_types=['card']` (sincrono) → latente; diventa reale con SEPA/Klarna/PayPal (async). Nessun controllo di divergenza importo.

**Fix.** Guardia + riconciliazione importo — `webhook/route.ts:188` (inizio `handleCheckoutCompleted`, e analogo in gift card `:432` / sponsored `:492`)
```diff
 async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
   const admin = getAdminSupabase();
   const stripe = getStripe();
+  // Con metodi async (SEPA/Klarna) 'completed' NON implica incasso: crea ordini solo se pagato.
+  if (session.payment_status && session.payment_status !== 'paid') {
+    logger.warn('[stripe] checkout.session.completed non pagato, skip', { sessionId: session.id, status: session.payment_status });
+    return;
+  }
```
E dopo aver caricato `pending` (che ha `total_cents`), riconciliazione soft:
```diff
   const groups = pending.groups as PendingGroup[];
+  // Riconciliazione importo: l'incassato deve combaciare con l'atteso (tolleranza 1c per
+  // il drift dell'arrotondamento pro-rata del coupon). Divergenze → alert, non blocco.
+  if (typeof session.amount_total === 'number' && typeof pending.total_cents === 'number'
+      && Math.abs(session.amount_total - pending.total_cents) > 1) {
+    logger.error('[stripe] divergenza importo checkout', {
+      pendingCheckoutId, expected: pending.total_cents, charged: session.amount_total });
+  }
```
> Per gift card/sponsored: aggiungere solo la guardia `payment_status !== 'paid'` in testa ai due handler. Quando si aggiungeranno metodi async, gestire anche `checkout.session.async_payment_succeeded/failed`.

**Test** (`tests/unit/webhook-paid-guard.test.ts`): session `payment_status='unpaid'` → nessun ordine creato; amount_total ≠ pending.total_cents (>1c) → log error, ordini comunque creati (soft).
**Verifica.** Oggi no-op (card sempre paid); regressione check che i checkout normali passino.
**Rischio&rollback.** Nessuna migration. Rischio quasi nullo (guardia difensiva). Rollback = revert.
**Dipendenze.** Nessuna.

---

## Riepilogo colori & sequenza deploy

| # | Finding | Colore | Migration | File codice |
|---|---------|--------|-----------|-------------|
| 1 | Over-refund + reversal cumulativo | 🟡 | 131 | payout.ts, webhook |
| 2 | Overselling window | 🟡 | — | client.ts, webhook |
| 3 | Admin-cancel COD | 🟡 | 132 | cancel/route.ts |
| 4 | Coupon TOCTOU (claim atomico) | 🟡 | 130 | checkout, cod, webhook, cron |
| 5 | Webhook non idempotente | 🟡 | 134 | webhook |
| 6 | Payout in-flight vs refund | 🟡 | 131 | payout.ts |
| 7 | Rider non stornato | 🔴 scelta | 133 | payout.ts, webhook (se A) |
| 8 | payment_status/amount | 🟢 | — | webhook |

**Punti incerti / da confermare:**
- **Finding #7**: policy rider (A storna / B costo accettato) → **decisione Nicola**.
- **restore_stock_for_order + varianti** (finding #3): verificare che mig.080 ripristini lo stock di variante e non solo del prodotto; se no, follow-up.
- **mig.132**: se esistono righe storiche duplicate su `wallet_ledger.ref` con reason `order_cod_refund`/`order_admin_canceled`, il `CREATE UNIQUE INDEX` aborta (non distruttivo) → verificare con una query prima di applicare.
- Tutti i test sono **scheletri**: la repo usa un runner da confermare (cercare `tests/` / `vitest`/`jest`) prima di scriverli per intero.

**🔴 Per Nicola:** (1) firma per applicare le 5 migrazioni (130-134) su produzione; (2) scelta policy rider (finding #7); (3) firma per il merge del branch di codice dopo review @security.
