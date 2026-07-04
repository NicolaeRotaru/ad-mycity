# WS-QA — Pacchetto fix "QA & flussi critici" (marketplace MyCity)

> Owner: QA/flussi. Sorgenti in sola lettura: `/home/user/ad-mycity/marketplace`.
> SQL: `consegne/bonifica/sql/135_pickup_in_store_delivery_transition.sql`.
> Data: 2026-07-04. Colore complessivo: 🟡 (codice in branch) + 🔴 (deploy migrazione DB).
> CROSS (non riscritti qui): overselling/expires_at Stripe + claim atomico coupon → **vedi WS-MONEY**.

Copertura dei 5 finding `qa-flussi` + 2 edge extra del mandato:
1. B6 pickup_in_store non arriva a DELIVERED — **BLOCCANTE** → fix completo (SQL 135 + UI + rider query + copy)
2. Overselling / expires_at Stripe — grave → **→ vedi WS-MONEY** (annotato, non riscritto)
3. COD multi-negozio: rollback mancante prima del 409 — grave → fix
4. Coupon over-redemption non atomico — minore → **→ vedi WS-MONEY** (annotato)
5. Venditore compra i propri prodotti — minore → fix (COD + Stripe)
6. (extra) Carrello a totale 0 non ordinabile → verifica: già guardato (documento il presidio)

---

## FINDING 1 — 🔴🟡 BLOCCANTE — "Ritiro in negozio" non raggiunge mai DELIVERED

**Causa-radice.** L'unica transizione a `delivery_status='DELIVERED'` è la RPC del RIDER
`verify_delivery_code` (richiede `rider_id = auth.uid()` e stato in `PICKED_UP/OUT_FOR_DELIVERY`,
`migrations/061:230-264`). Gli ordini `pickup_in_store` non hanno rider → si fermano a `READY`.
Conseguenze deterministiche: payout card `HELD` per sempre (`releaseOrderPayout` esige DELIVERED,
`lib/stripe/payout.ts:69`); payout COD `AWAITING_REMITTANCE` per sempre (`confirm_cod_remittance`
esige rider+DELIVERED, `migrations/097:67-73`); niente reward/recensione (089/061); copy da rider al
buyer; l'ordine di ritiro compare nella dashboard rider e può essere "rubato" da un rider
(`app/rider/page.tsx:84`, l'`.or()` non filtra `pickup_in_store`).

**Fatto reale verificato:** ogni ordine (anche pickup) riceve pickup+delivery code all'INSERT via
trigger `create_order_verification_codes` (`migrations/016:74-99`) → `order_delivery_codes` esiste già
per gli ordini pickup: la RPC nuova può appoggiarsi al codice del cliente senza generare nulla.

### Fix A — SQL (state machine dedicata) — `sql/135_pickup_in_store_delivery_transition.sql`
Nuova RPC `seller_confirm_pickup(p_order_id, p_code)` SECURITY DEFINER: il venditore inserisce il
CODICE DI CONSEGNA del cliente (prova del ritiro) → `READY → DELIVERED`. Guardie: caller = seller,
`pickup_in_store = true`, `rider_id IS NULL`, stato `= READY`, codice = `order_delivery_codes.code`.
Settlement: **card** → lascia `payout_status='HELD'` (il cron paga il venditore normalmente);
**COD-pickup** → `payout_status='STORE_COLLECTED'` (nuovo stato terminale: il negozio ha già incassato
i contanti dal cliente; la commissione piattaforma diventa credito da riconciliare → **WS-MONEY**).
Il flag `mycity.allow_order_write` bypassa il trigger `enforce_order_update_rules` (061) sulle colonne
protette (`payout_status`, `delivered_at`). CHECK `orders_payout_status_check` esteso (drop+recreate
idempotente, pattern 097). Escludo modifiche al trigger: la RPC è privilegiata via flag.

### Fix B — UI venditore (`app/seller/orders/[id]/page.tsx`)
Aggiungere `pickup_in_store` alla select+type, e un'azione dedicata quando pickup+READY (input codice
6 cifre → `rpc('seller_confirm_pickup', {p_order_id, p_code})`). Sostituire il banner "in attesa di un
rider" (oggi mostrato anche ai pickup, riga 339-343) con una versione condizionata a `!pickup_in_store`.

Diff (indicativo, su riga reale):
```
// BEFORE — type OrderRow (riga 30-31)
  delivery_status: OrderStatus;
  payment_method?: string | null;
// AFTER
  delivery_status: OrderStatus;
  payment_method?: string | null;
  pickup_in_store?: boolean | null;

// BEFORE — select sel() (riga 129)
  id, user_id, total_price, shipping_cost, delivery_status,${pay} created_at,
// AFTER
  id, user_id, total_price, shipping_cost, delivery_status, pickup_in_store,${pay} created_at,

// BEFORE — banner "in attesa rider" (riga 339)
  {order.delivery_status === 'READY' && !order.rider_id && (
// AFTER — solo consegna a domicilio
  {order.delivery_status === 'READY' && !order.rider_id && !order.pickup_in_store && (
```
Nuovo blocco azione pickup (inserire dopo il blocco `ACCEPTED`, prima del banner rider):
```tsx
{order.pickup_in_store && order.delivery_status === 'READY' && (
  <div className="bg-white border border-cream-300 rounded-xl p-5">
    <p className="text-sm text-ink-600 mb-3">
      Il cliente ritira in negozio. Fatti dire il <strong>codice di ritiro</strong> e inseriscilo
      per confermare la consegna{cod ? ' (incassa i contanti al ritiro)' : ''}.
    </p>
    <div className="flex gap-2 flex-wrap items-center">
      <input value={pickupInput} onChange={(e) => setPickupInput(e.target.value.replace(/\D/g,'').slice(0,6))}
        inputMode="numeric" placeholder="000000"
        className="w-32 rounded-xl border border-cream-300 px-3 py-2.5 font-mono text-lg tracking-widest" />
      <Button icon={CheckCircle2} loading={confirmPickup.isPending}
        disabled={pickupInput.length !== 6}
        onClick={() => confirmPickup.mutate(pickupInput)}>
        Consegna al cliente
      </Button>
    </div>
  </div>
)}
```
Nuova mutation (accanto a `transition`):
```tsx
const [pickupInput, setPickupInput] = useState('');
const confirmPickup = useMutation({
  mutationFn: async (code: string) => {
    const { data, error } = await supabase.rpc('seller_confirm_pickup', { p_order_id: id, p_code: code });
    if (error) throw error;
    const r = data as { ok: boolean; reason?: string };
    if (!r.ok) throw new Error(r.reason ?? 'Codice non valido');
  },
  onSuccess: () => {
    setPickupInput('');
    qc.invalidateQueries({ queryKey: queryKeys.seller.order(id) });
    qc.invalidateQueries({ queryKey: queryKeys.seller.orders });
    toast.success('Ritiro confermato');
  },
  onError: (err: unknown) => toast.error(friendlyError(err)),
});
```

### Fix C — escludi i pickup dalla dashboard rider (`app/rider/page.tsx:84`)
```
// BEFORE
  .or(`and(delivery_status.in.(ACCEPTED,READY),rider_id.is.null),rider_id.eq.${user.id}`)
// AFTER
  .or(`and(delivery_status.in.(ACCEPTED,READY),rider_id.is.null,pickup_in_store.is.false),rider_id.eq.${user.id}`)
```
(aggiungere `pickup_in_store` alla select riga 79-81). Nota: `pickup_in_store` ha `DEFAULT false`
(015) → `.is.false` copre gli ordini reali; belt-and-suspenders con la guardia `rider_id IS NULL` in RPC.

### Fix D — copy buyer (`app/orders/[id]/page.tsx:239`)
Il buyer di un ordine pickup deve leggere copy di ritiro e vedere il proprio codice.
```
// BEFORE (HERO_SUBTITLE, riga 239)
    READY: 'Pronto in negozio · un rider sta per ritirarlo',
// AFTER — condizionare al pickup nel punto d'uso:
//   const readySub = order.pickup_in_store
//     ? 'Pronto per il ritiro · passa in negozio con il tuo codice'
//     : 'Pronto in negozio · un rider sta per ritirarlo';
```
Aggiungere (se non già presente) il display del codice di consegna al buyer per ordini pickup in stato
READY, così può mostrarlo al banco. `pickup_in_store` va aggiunto alla query dell'ordine buyer.

**Test e2e/integration (scheletro).**
- `pickup_card_reaches_delivered_and_pays_seller`: crea ordine card `pickup_in_store=true` →
  seller ACCEPTED→READY → `seller_confirm_pickup(order, codiceConsegna)` → assert `delivery_status='DELIVERED'`,
  `delivered_at` set, `payout_status='HELD'` → run `releaseOrderPayout(order)` (seller Connect ok) →
  assert `payout_status='TRANSFERRED'`.
- `pickup_cod_settles_store_collected`: ordine COD pickup → confirm → assert `payout_status='STORE_COLLECTED'`,
  `delivered_at` set; `confirm_cod_remittance` NON lo tocca; il cron release-payouts lo salta.
- `seller_confirm_pickup_rejects_wrong_code / not_seller / not_pickup / has_rider / wrong_status`.
- `rider_dashboard_excludes_pickup`: ordine pickup READY non compare nella query rider; un ordine a
  domicilio READY sì.
- `pickup_order_not_claimable_by_rider`: tentativo di claim rider su ordine pickup → nessuna riga.

**Verifica.** Percorrere in staging: crea 1 ordine pickup card + 1 pickup COD, portali a DELIVERED via
UI seller, controlla su Supabase (lettura) i campi `delivery_status/delivered_at/payout_status`.
**Colore.** SQL/deploy DB = 🔴 (firma Nicola, prima del deploy codice); UI+rider+copy in branch = 🟡.
**Rischio & rollback.** La RPC è additiva; il CHECK esteso è retro-compatibile (solo aggiunge un valore).
Rollback: `DROP FUNCTION seller_confirm_pickup`; ripristinare il CHECK precedente (senza STORE_COLLECTED)
solo se nessun ordine lo usa già. La modifica al filtro rider è reversibile (una riga).
**Dipendenze.** Ordine deploy: **prima** la migrazione 135, **poi** il codice UI (come 097). Nessuna
dipendenza inversa. Settlement commissione COD-pickup → **WS-MONEY / contabilità**.

---

## FINDING 3 — 🟡 GRAVE — COD multi-negozio: ordini orfani + wallet addebitato al 409

**Causa-radice.** In `app/api/orders/cod/route.ts` gli ordini si creano in loop per-gruppo. Se
`reserve_stock` fallisce per il gruppo `i>0` (race), la route fa `return … {status:409}` **senza**
chiamare `rollbackCreatedCodOrders()` (righe 285-291) — a differenza dei rami order-insert/items sotto
(righe 357, 397) che invece la chiamano. Gli ordini dei gruppi `0..i-1` restano committati, con stock
riservato, wallet debitato e notifiche/email inviate. Il client vede 409 e non svuota il carrello →
al retry duplica ordini e raddoppia l'addebito wallet.

**Fix ESATTO (`app/api/orders/cod/route.ts:285-291`).**
```
// BEFORE
      const { error: resErr } = await admin.rpc('reserve_stock', { p_items: groupStockItems });
      if (resErr) {
        logger.warn('[cod] reserve_stock fallita', { sellerId: g.sellerId, message: resErr.message });
        return NextResponse.json(
          { error: 'Alcuni articoli non sono più disponibili nelle quantità richieste.' },
          { status: 409 },
        );
      }
// AFTER
      const { error: resErr } = await admin.rpc('reserve_stock', { p_items: groupStockItems });
      if (resErr) {
        logger.warn('[cod] reserve_stock fallita', { sellerId: g.sellerId, message: resErr.message });
        // Il gruppo corrente NON è stato riservato, ma i gruppi 0..i-1 sono già ordini
        // committati (stock+wallet): disfali prima di rispondere, o restano orfani.
        await rollbackCreatedCodOrders();
        return NextResponse.json(
          { error: 'Alcuni articoli non sono più disponibili nelle quantità richieste.' },
          { status: 409 },
        );
      }
```
Nota: `rollbackCreatedCodOrders` (righe 244-262) già ripristina order_items, orders, stock e wallet in
ordine inverso — il fix riusa l'infrastruttura esistente, nessun nuovo codice di rollback.
Alternativa più forte (opzionale, maggior refactor): un'unica `reserve_stock` atomica su TUTTI i gruppi
prima di creare qualunque ordine (come il path Stripe). Raccomando il fix minimo (una riga) ora +
l'atomizzazione come follow-up, per rischio-regressione minore.

**Test integration.** `cod_multiseller_reserve_fail_rolls_back`: mock 3 gruppi, `reserve_stock` OK per
g0, FAIL per g1 → assert: nessun ordine residuo per g0 (orders/order_items cancellati), stock g0
ripristinato, wallet ricreditato, risposta 409. Regressione: `cod_single_group_ok` resta verde.
**Verifica.** In staging forzare esaurimento stock del 2° negozio tra validazione e riserva; controllare
in lettura che non restino ordini del 1° negozio e il saldo wallet sia intatto.
**Colore.** 🟡 (codice in branch). **Rischio & rollback.** Basso: aggiunge solo una chiamata di
cleanup già usata altrove; reversibile (rimuovere la riga). **Dipendenze.** Nessuna.

---

## FINDING 5 — 🟡 MINORE — Il venditore può acquistare i propri prodotti

**Causa-radice.** `canRolePurchase` consente il ruolo `seller` (`lib/shopping-access.ts`) e né
`/api/orders/cod` né `/api/stripe/checkout` bloccano `product.seller_id === user.id`: l'unico check è
`p.seller_id !== g.sellerId` (coerenza gruppo, non auto-acquisto). Le recensioni auto sono già bloccate
(093), ma ordini e metriche "più venduti"/ranking no → volumi falsabili.

**Fix ESATTO — COD (`app/api/orders/cod/route.ts`, dopo riga 168).**
```
// BEFORE
        if (p.seller_id !== g.sellerId) {
          return ApiErrors.invalidRequest(`Prodotto ${p.name} non appartiene al venditore indicato.`);
        }
// AFTER
        if (p.seller_id !== g.sellerId) {
          return ApiErrors.invalidRequest(`Prodotto ${p.name} non appartiene al venditore indicato.`);
        }
        if (p.seller_id === user.id) {
          return ApiErrors.invalidRequest('Non puoi acquistare dal tuo stesso negozio.');
        }
```
**Fix ESATTO — Stripe (`app/api/stripe/checkout/route.ts`, dopo riga 170).**
```
// BEFORE
      if (p.seller_id !== g.sellerId) {
        return ApiErrors.invalidRequest(`Prodotto ${p.name} non appartiene al venditore indicato.`);
      }
// AFTER
      if (p.seller_id !== g.sellerId) {
        return ApiErrors.invalidRequest(`Prodotto ${p.name} non appartiene al venditore indicato.`);
      }
      if (p.seller_id === user.id) {
        return ApiErrors.invalidRequest('Non puoi acquistare dal tuo stesso negozio.');
      }
```
(`user.id` è già in scope in entrambe le route.)

**Test integration.** `seller_cannot_buy_own_product_cod` / `_stripe`: buyer = seller del prodotto →
assert 400 "Non puoi acquistare dal tuo stesso negozio", nessun ordine creato. Regressione:
`buyer_can_buy_other_seller` resta verde.
**Verifica.** In staging, con un account seller in modalità acquisto, tentare l'ordine di un proprio
prodotto → deve essere rifiutato su entrambi i path.
**Colore.** 🟡. **Rischio & rollback.** Minimo (guardia additiva, reversibile). **Dipendenze.** Nessuna.
Nota altitudine (classe di bug): valutare anche il blocco lato UI (nascondere "Aggiungi al carrello"
sui propri prodotti) → handoff **@frontend-dev**; il gate server resta la difesa autorevole.

---

## FINDING 6 (extra mandato) — 🟢 Carrello a totale 0 non ordinabile — GIÀ PRESIDIATO

**Verifica.** Entrambi i path bloccano il totale nullo: COD `app/api/orders/cod/route.ts:209`
(`if (grandSubtotalCents <= 0) return ApiErrors.invalidRequest('Importo non valido.')`) e Stripe
`app/api/stripe/checkout/route.ts:234` (identico). Zod impone `items.min(1)` e `quantity` positivo
(`ItemSchema`), e prodotti con `status != 'available'` sono rifiutati. Nessun fix necessario: aggiungo
solo i casi di regressione affinché non torni.
**Test regression.** `empty_cart_rejected` (zod), `zero_price_product_rejected` (grandSubtotal 0 → 400),
`coupon_100pct_still_creates_order` (totale scontato a 0 ma subtotale > 0 → ordine gratuito valido, non
bloccato per errore). **Colore.** 🟢 (nessuna modifica). **Dipendenze.** Nessuna.

---

## CROSS → WS-MONEY (annotati, NON riscritti qui)
- **Finding 2** — Stripe Session senza `expires_at` (`lib/stripe/client.ts:168-193`): il pending_checkout
  scade a 2h e `restore_stock` rilascia lo stock, ma la Session vive ~24h; `handleCheckoutCompleted`
  (`webhook/route.ts:210`) controlla l'idempotenza solo su `status==='COMPLETED'` e non ri-riserva lo
  stock → overselling. Fix (a) `expires_at` sulla Session ≈ scadenza DB; (b) in handleCheckoutCompleted,
  se `pending.status !== 'PENDING'` ri-eseguire `reserve_stock` prima di creare gli ordini, altrimenti
  refund automatico. **→ vedi WS-MONEY.**
- **Finding 4** — Enforcement coupon non atomico (`lib/coupons.ts:57-75` + `increment_coupon_usage`
  incondizionato, migr.058): over-redemption e `first_order_only` bypassabile in tab concorrenti. Fix:
  `UPDATE coupons SET uses_count=uses_count+1 WHERE code=… AND (max_uses IS NULL OR uses_count<max_uses)
  RETURNING id` (claim atomico) + tabella `coupon_redemptions(user_id,coupon_id) UNIQUE`. **→ vedi WS-MONEY.**

## Punti incerti (candore)
- **UI buyer (Fix D)**: non ho verificato se il codice di consegna è già mostrato al buyer per gli ordini
  pickup; se non lo è, va aggiunto (query + display). Confidenza flusso seller/RPC/rider: ~90% (letto
  fino in fondo, non eseguito in staging — sensori codice, non runtime).
- **Settlement commissione COD-pickup**: ho scelto `STORE_COLLECTED` terminale (il negozio incassa) e ho
  flaggato la commissione come credito da riconciliare → richiede decisione contabile in **WS-MONEY**
  (come/quando la piattaforma recupera il 10% sugli ordini COD ritirati in negozio).
- **`pickup_in_store` nullable**: `DEFAULT false` non `NOT NULL` (015); `.is.false` copre i reali, ma se
  esistessero righe storiche con NULL non verrebbero escluse dal rider — la guardia RPC `rider_id IS NULL`
  resta comunque la difesa. Valutare un backfill `UPDATE orders SET pickup_in_store=false WHERE … IS NULL`.
