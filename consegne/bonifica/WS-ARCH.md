# WS-ARCH — Pacchetto di fix «Architettura»

Owner: ingegnere senior · Fonte problemi: `consegne/bonifica/_findings.json` → `architettura` (9 item, tutti coperti).
Codice letto (sola lettura): `/home/user/ad-mycity/marketplace`. Nessun `git`, nessun deploy.
SQL prodotta: `consegne/bonifica/sql/140_*.sql` (idempotente), `141_*.sql` (dati, 🔴).

Legenda colore: 🟢 reversibile/locale · 🟡 branch+PR, tocca comportamento · 🔴 firma Nicola (dati/soldi/prod).

Mappa dei 9 finding:
1. Seller auto-approvato → **OWN** (§B4) — 🔴 causa-radice + SQL
2. Dead auth routes signin/signup → **CROSS → vedi WS-API** (§X1)
3. Store-hours solo su COD → **OWN** (§S)
4. Checkout client duplica costanti spedizione/sconto → **OWN** (§C)
5. Order-math duplicata Stripe/COD → **OWN** (§O)
6. Middleware is_approved su /admin e /rider → **OWN** (§M)
7. `lib/order-status.ts` accoppiato a lucide-react → **OWN** (§I)
8. `deliveryWindow` fuso locale vs `romeNow` → **OWN** (§T)
9. Coupon TOCTOU race → **CROSS → vedi WS-MONEY** (§X2)

---

## §B4 — Venditore auto-approvato senza review/KYC  🔴 (bloccante)

**Causa-radice.** `handle_new_user` (ultima ridefinizione del corpo in
`migrations/015_competitive_moats.sql:143-151`) imposta
`is_approved = CASE WHEN role_choice IN ('seller','rider') THEN true ELSE false END`.
`role_choice` viene da `raw_user_meta_data->>'role'`, controllato dal client
(`app/sign-up/page.tsx:75` invia `options.data:{ role }`). Quindi un self-signup
"Venditore" nasce `is_approved=TRUE` e pubblica prodotti LIVE + incassa COD senza
KYC. Il flusso curato `/sell` fa il contrario (`app/sell/page.tsx:71-73`:
`is_approved=false, approval_status='pending'`): **due fonti di verità incoerenti**.
Tutte le guardie leggono `is_approved` (middleware, `withSellerAuth`, RLS prodotti
082/023): basta rimettere quel flag a false alla nascita per chiudere tutto.

**Fonte di verità unica scelta.** `is_approved` = colonna di *enforcement*;
`approval_status` = stato leggibile. Si flippano SEMPRE insieme, e SOLO dallo staff
via `app/api/admin/users/[id]/moderate/route.ts:32,44` (`approval_status='approved',
is_approved=true` insieme). L'unico violatore era `handle_new_user`. Fix = allinearlo.

### Fix 1 — migrazione SQL (fornita)
`consegne/bonifica/sql/140_arch_seller_approval_unify.sql` — `CREATE OR REPLACE
FUNCTION public.handle_new_user()` con `is_approved=false` sempre, `approval_status`
= `'pending'` per seller/rider / `'approved'` per buyer, **ri-dichiarando
`SET search_path = public`** (059:22 lo aveva fissato; CREATE OR REPLACE lo
azzererebbe). Preserva `referral_code` e il trigger `on_auth_user_created` esistente.

### Fix 2 — rimuovere "Venditore" dal signup diretto (`app/sign-up/page.tsx`)
Il ruolo seller va incanalato su `/sell` (flusso curato con KYC). Il rider resta
selezionabile ma con 140 nasce comunque NON approvato.

BEFORE (`:17-23`):
```tsx
type Role = 'buyer' | 'seller' | 'rider';

const ROLES: { value: Role; Icon: LucideIcon; title: string; subtitle: string }[] = [
  { value: 'buyer',  Icon: ShoppingCart, title: 'Acquirente', subtitle: 'Compra dai negozi locali' },
  { value: 'seller', Icon: Store,        title: 'Venditore',  subtitle: 'Vendi i tuoi prodotti' },
  { value: 'rider',  Icon: Bike,         title: 'Rider',      subtitle: 'Consegna ordini' },
];
```
AFTER:
```tsx
type Role = 'buyer' | 'rider';
// "Venditore" NON è più un self-signup: passa dal flusso curato /sell (KYC + review).
// Vendere richiede approvazione staff → niente scorciatoia dal signup diretto.
const ROLES: { value: Role; Icon: LucideIcon; title: string; subtitle: string }[] = [
  { value: 'buyer', Icon: ShoppingCart, title: 'Acquirente', subtitle: 'Compra dai negozi locali' },
  { value: 'rider', Icon: Bike,         title: 'Rider',      subtitle: 'Consegna ordini' },
];
```
BEFORE (`:28-30`) — `isRole` deve rifiutare `?role=seller` nel deep-link:
```tsx
function isRole(v: string | null): v is Role {
  return v === 'buyer' || v === 'seller' || v === 'rider';
}
```
AFTER:
```tsx
function isRole(v: string | null): v is Role {
  return v === 'buyer' || v === 'rider';
}
```
Rimuovere l'import ora inutilizzato `Store` da `lucide-react` (`:6`) e — se un utente
arriva da un vecchio link `/sign-up?role=seller` — `initialRole` cade su `'buyer'`
(già gestito da `isRole`). Opzionale UX: un link "Vuoi vendere? Registra il tuo
negozio" → `/sell`.

### Fix 3 — coordinamento trigger (→ WS-DB-RLS, NON in questo WS) §B4-trigger
`enforce_profile_update_rules` (`061:25-73`) oggi blocca role→admin e is_approved
false→true, ma NON i passaggi `role → 'seller'/'rider'` via UPDATE, né una modifica
di `is_approved` in altre direzioni. Da aggiungere (nel ramo non-privilegiato):
```sql
-- blocca l'auto-promozione a ruolo operativo
IF NEW.role IN ('seller','rider') AND OLD.role IS DISTINCT FROM NEW.role THEN
  RAISE EXCEPTION 'profiles: cambio ruolo operativo riservato allo staff' USING ERRCODE='42501';
END IF;
-- congela is_approved in QUALSIASI direzione per i non privilegiati
IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
  RAISE EXCEPTION 'profiles: approvazione riservata allo staff' USING ERRCODE='42501';
END IF;
```
→ **vedi WS-DB-RLS**: possiede quel trigger; qui solo l'indicazione.

**Test (scheletro).**
```sql
-- pgTAP / SQL: dopo 140, un signup seller non nasce approvato
INSERT INTO auth.users (id, raw_user_meta_data) VALUES (gen_random_uuid(), '{"role":"seller"}');
-- atteso: profiles.is_approved=false AND approval_status='pending'
```
```ts
// tests/unit/sign-up-roles.test.ts — ROLES non contiene 'seller'; isRole('seller')===false
```
**Verifica.** In anteprima: registrarsi come "Venditore" non è più possibile; un account
creato via API con `data:{role:'seller'}` resta `is_approved=false` → non pubblica
prodotti (RLS 082 blocca l'INSERT). `/sell` continua a funzionare.
**Rischio&rollback.** 140 idempotente e reversibile (ri-`CREATE OR REPLACE` col vecchio
corpo). 141 (dati) è 🔴 e separato — vedi sotto. Diff frontend minima.
**Dipendenze.** 140 prima di 141. Trigger → WS-DB-RLS. Nessuna su altri WS per il core.

### 141 — bonifica dati venditori già auto-approvati  🔴
`consegne/bonifica/sql/141_arch_reconcile_unverified_sellers.sql`: demota a
`is_approved=false` SOLO la firma del bug (`is_approved=true AND
approval_status='pending' AND role IN ('seller','rider')`), che lo staff non può
produrre. Non tocca gli approvati veri. **Decisione di Nicola**: demotare (default,
sicuro) vs promuovere in blocco. Salvare l'elenco impattato prima di applicare
(query nel file).

---

## §S — Guardia "negozio chiuso" solo su COD, assente sul checkout carta  🟡 (grave)

**Causa-radice.** `app/api/orders/cod/route.ts:130-154` carica `store_hours` nella
query sellers e blocca con `isStoreClosedForOrder` (409). `app/api/stripe/checkout/route.ts:134-137`
seleziona `id, store_name, full_name, store_lat, store_lng` — **senza `store_hours`**
e senza guardia. Stesso ordine: bloccato in contanti, passa con carta → rider a
saracinesca abbassata.

**Fix — estrarre una funzione condivisa** (elimina la divergenza a monte).
Aggiungere a `lib/store-hours.ts` (modulo puro già esistente):
```ts
/** Primo negozio CHIUSO adesso nella lista (o null). NULL-safe (riusa isStoreClosedForOrder). */
export function firstClosedStore(
  sellers: Array<{ store_name?: string | null; store_hours?: unknown }>,
  now: Date = romeNow(),
): string | null {
  for (const s of sellers) {
    if (isStoreClosedForOrder(s.store_hours, now)) return s.store_name ?? 'Il negozio';
  }
  return null;
}
```

COD — sostituire il loop inline (`route.ts:143-154`) con la chiamata condivisa:
BEFORE:
```ts
if (!body.pickupInStore) {
  for (const s of sellers ?? []) {
    if (isStoreClosedForOrder(s.store_hours)) {
      return NextResponse.json({ error: `${s.store_name ?? 'Il negozio'} è chiuso ...` }, { status: 409 });
    }
  }
}
```
AFTER:
```ts
if (!body.pickupInStore) {
  const closed = firstClosedStore(sellers ?? []);
  if (closed) return NextResponse.json(
    { error: `${closed} è chiuso in questo momento. Riprova durante gli orari di apertura indicati sulla pagina del negozio.` },
    { status: 409 });
}
```
(import: `firstClosedStore` accanto a `isStoreClosedForOrder`.)

Stripe checkout — (a) aggiungere `store_hours` alla SELECT (`route.ts:134-137`):
BEFORE: `.select('id, store_name, full_name, store_lat, store_lng')`
AFTER:  `.select('id, store_name, full_name, store_lat, store_lng, store_hours')`
(b) inserire la guardia subito dopo il popolamento delle mappe seller (dopo `:144`),
PRIMA della riserva stock/creazione pending:
```ts
import { firstClosedStore } from '@/lib/store-hours';
// ...
if (!body.pickupInStore) {
  const closed = firstClosedStore(sellers ?? []);
  if (closed) return NextResponse.json(
    { error: `${closed} è chiuso in questo momento. Riprova durante gli orari di apertura indicati sulla pagina del negozio.` },
    { status: 409 });
}
```
Posizionarla prima di `reserve_stock` (`:324`) così un negozio chiuso non consuma
stock né crea `pending_checkouts`.

**Test.** `tests/unit/store-hours.test.ts`: `firstClosedStore` ritorna il nome del
primo chiuso, `null` se tutti aperti/senza orari; test route: POST checkout carta
verso negozio chiuso → 409 (mock sellers con `store_hours` chiusi + `romeNow`).
**Verifica.** In anteprima con un negozio con orari impostati e "chiuso ora": sia COD
sia carta → 409 identico.
**Rischio&rollback.** Basso; NULL-safe (negozi senza orari non bloccati). Rollback =
rimuovere la guardia dal checkout. **Dipendenze.** Nessuna cross-WS.

---

## §O — Matematica di creazione ordine duplicata Stripe/COD  🟡 (grave)

**Causa-radice.** `app/api/stripe/checkout/route.ts` e `app/api/orders/cod/route.ts`
reimplementano quasi identica la stessa pipeline (subtotali, coupon pro-rata, sconto
ritiro, spedizione, split). Divergenze già presenti: il **clamp difensivo
`totalDiscountCents = Math.min(...)`** esiste solo in Stripe (`checkout/route.ts:282-286`),
assente nel COD → nel COD lo sconto totale può teoricamente superare
subtotale+spedizione (oggi non morde perché `validateCoupon` cappa lo sconto al
subtotale, ma è un invariante monetario mancante). Ogni patch a prezzi va replicata
a mano in due punti: fabbrica di bug monetari.

**Fix — estrarre il core puro in `lib/orders/priceOrder.ts`** (nuovo file), consumato
da entrambe le route. Incapsula i calcoli identici; le differenze legittime (metodo
pagamento, wallet, riserva stock, persistenza) restano nelle route.
```ts
// lib/orders/priceOrder.ts — core puro condiviso Stripe/COD. Nessun I/O, testabile.
export type PricedGroup = {
  subtotalCents: number; shippingCents: number; deliveryFeeCents: number;
  couponPortionCents: number; pickupPortionCents: number;
  discountCents: number;      // coupon+pickup del gruppo (già clampato)
  totalCents: number;         // max(0, subtotal+shipping+fee - discount)
};
export type PricedOrder = {
  grandSubtotalCents: number; grandShippingCents: number;
  couponDiscountCents: number; pickupDiscountCents: number;
  totalDiscountCents: number; // CLAMP unico: min(coupon+pickup, subtotal+shipping-1)
  groups: PricedGroup[];
  expectedChargeCents: number;
};

/**
 * Dati i subtotali/spedizioni/fee già ricalcolati dal DB e lo sconto coupon
 * grezzo (da validateCoupon), restituisce lo split pro-rata con il CLAMP applicato
 * in modo COERENTE su entrambe le route. È l'unico punto dove vive la math di sconto.
 */
export function priceOrder(input: {
  subtotalPerGroupCents: number[];
  shippingPerGroupCents: number[];
  deliveryFeePerGroupCents: number[];
  couponDiscountCents: number;
  pickupInStore: boolean;
  pickupDiscountPercent: number;   // = PICKUP_DISCOUNT_PERCENT
}): PricedOrder {
  const grandSubtotalCents = input.subtotalPerGroupCents.reduce((s, x) => s + x, 0);
  const grandShippingCents = input.shippingPerGroupCents.reduce((s, x) => s + x, 0);
  const pickupDiscountCents = input.pickupInStore
    ? Math.round(grandSubtotalCents * (input.pickupDiscountPercent / 100)) : 0;
  // CLAMP difensivo unico (prima era solo nel path Stripe): lo sconto totale non
  // può superare subtotale+spedizione-1c. Scala coupon e pickup in proporzione.
  const rawDiscount = input.couponDiscountCents + pickupDiscountCents;
  const totalDiscountCents = Math.min(rawDiscount, Math.max(0, grandSubtotalCents + grandShippingCents - 1));
  const scale = rawDiscount > 0 ? totalDiscountCents / rawDiscount : 0;
  const couponEff = Math.round(input.couponDiscountCents * scale);
  const pickupEff = totalDiscountCents - couponEff;

  const groups = input.subtotalPerGroupCents.map((subtotal, i) => {
    const shipping = input.shippingPerGroupCents[i];
    const deliveryFeeCents = input.deliveryFeePerGroupCents[i];
    const portion = grandSubtotalCents > 0 ? subtotal / grandSubtotalCents : 0;
    const couponPortionCents = Math.round(couponEff * portion);
    const pickupPortionCents = Math.round(pickupEff * portion);
    const discountCents = couponPortionCents + pickupPortionCents;
    const totalCents = Math.max(0, subtotal + shipping + deliveryFeeCents - discountCents);
    return { subtotalCents: subtotal, shippingCents: shipping, deliveryFeeCents,
             couponPortionCents, pickupPortionCents, discountCents, totalCents };
  });
  const expectedChargeCents = groups.reduce((s, g) => s + g.totalCents, 0);
  return { grandSubtotalCents, grandShippingCents, couponDiscountCents: couponEff,
           pickupDiscountCents: pickupEff, totalDiscountCents, groups, expectedChargeCents };
}
```

Integrazione **Stripe** (`checkout/route.ts`): dopo aver calcolato
`subtotalPerGroupCents`, `shippingPerGroupCents`, `deliveryFeePerGroupCents` e
`couponDiscountCents` (grezzo), sostituire il blocco `:271-315` (pickupDiscount,
clamp, `groupPersisted`, `expectedChargeCents`) con:
```ts
const priced = priceOrder({
  subtotalPerGroupCents, shippingPerGroupCents, deliveryFeePerGroupCents,
  couponDiscountCents, pickupInStore: body.pickupInStore,
  pickupDiscountPercent: PICKUP_DISCOUNT_PERCENT,
});
const totalDiscountCents = priced.totalDiscountCents;          // passato a Stripe
const groupPersisted = stripeGroups.map((g, i) => ({
  sellerId: g.sellerId, storeName: g.storeName, items: g.items, ...priced.groups[i],
}));
const expectedChargeCents = priced.expectedChargeCents;
```
Integrazione **COD** (`cod/route.ts`): sostituire `pickupDiscountCents` (`:235-237`)
e il calcolo per-gruppo `couponPortion/pickupPortion/discountCents` (`:268-271`) con
il consumo di `priced.groups[i]` — così il **clamp entra nel COD** (fix della
divergenza) e la math vive in un solo file.

**Test.** `tests/unit/priceOrder.test.ts`: (a) coupon che eccede subtotale → clamp a
`subtotal+shipping-1`; (b) pro-rata multi-seller somma == `expectedChargeCents`;
(c) parità Stripe↔COD sugli stessi input (nessun gruppo negativo). Aggiungere il test
di divergenza citato nel finding: totale client-checkout == ricalcolo server.
**Verifica.** Ordine multi-seller con coupon: COD e carta producono lo stesso
`total_price` per gruppo; nessuna regressione sugli importi mostrati.
**Rischio&rollback.** 🟡 tocca codice-soldi: modulo puro con test prima del wiring;
il clamp è behavior-neutral nei casi normali (validateCoupon già cappa) e stringe
solo il caso patologico. Rollback = ripristinare i blocchi inline. **Dipendenze.**
Nessuna cross-WS; §S indipendente ma sulla stessa route (coordinare la PR).

---

## §C — Checkout client duplica costanti/logica spedizione-sconto  🟡 (minore)

**Causa-radice.** `app/checkout/page.tsx` non importa da `lib/shipping`/`lib/constants`:
ridichiara `SHIPPING_PER_ORDER=4.9` (`:43`), `PICKUP_DISCOUNT_PERCENT=10` (`:331`) e
reimplementa `shippingFor` (`:334-342`, copia di `shippingForEuro`). 3 implementazioni
della stessa regola, 2 copie divergibili: al primo cambio di tariffa il totale mostrato
diverge da quello addebitato dal server.

**Fix — importare la fonte unica.**
BEFORE (`:14`): `import { FREE_SHIPPING_THRESHOLD, PLATFORM_DELIVERY_FEE_CENTS } from '@/lib/constants';`
AFTER:  `import { FREE_SHIPPING_THRESHOLD, PLATFORM_DELIVERY_FEE_CENTS, PICKUP_DISCOUNT_PERCENT } from '@/lib/constants';`
Aggiungere: `import { shippingForEuro } from '@/lib/shipping';`

BEFORE (`:43-45`):
```tsx
const SHIPPING_PER_ORDER = 4.9;
const SHIPPING_COST_FOR = (subtotal: number) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PER_ORDER);
```
AFTER: eliminare entrambe (non più usate).

BEFORE (`:331`): `const PICKUP_DISCOUNT_PERCENT = 10;`  → eliminare (usa l'import).

BEFORE (`:334-342`):
```tsx
const shippingFor = (g: { storeLat: number | null; storeLng: number | null; items: CartItem[] }): number => {
  if (pickupInStore) return 0;
  const subtotal = groupSubtotal(g);
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (g.storeLat && g.storeLng && form.lat && form.lng) {
    const km = haversineKm(g.storeLat, g.storeLng, form.lat, form.lng);
    return riderFee(km);
  }
  return SHIPPING_COST_FOR(subtotal);
};
```
AFTER (delega alla fonte unica; identica logica, `freeShipping` da coupon se presente):
```tsx
const shippingFor = (g: { storeLat: number | null; storeLng: number | null; items: CartItem[] }): number =>
  shippingForEuro({
    subtotal: groupSubtotal(g),
    storeLat: g.storeLat, storeLng: g.storeLng,
    deliveryLat: form.lat ?? null, deliveryLng: form.lng ?? null,
    pickupInStore,
    freeShipping: appliedCoupon?.freeShipping ?? false, // se la UI traccia il coupon; altrimenti ometti
  });
```
(Se il componente non ha `appliedCoupon`, ometti `freeShipping`: default false, identico
all'attuale.) `haversineKm`/`riderFee` restano importati solo se usati altrove, altrimenti
rimuovere gli import ora orfani (`:15`).

**Test.** `tests/unit/checkout-shipping-parity.test.ts`: per un set di input il totale
client (`shippingFor` + pickup) coincide col ricalcolo server (`shippingCentsFor` +
`PICKUP_DISCOUNT_PERCENT`).
**Verifica.** Checkout multi-seller: spedizione e sconto ritiro mostrati == addebitati.
**Rischio&rollback.** Basso (valori oggi già allineati; è dedup). Rollback = ripristino
costanti locali. **Dipendenze.** Nessuna; sinergica con §O (stessa fonte unica).

---

## §M — Middleware applica `is_approved` a /admin e /rider  🟡 (grave)

**Causa-radice.** `middleware.ts:257`:
`if (!role || !roleRule.allowed.includes(role) || !approved)` applica `!approved`
UNIFORMEMENTE a `/admin`, `/seller`, `/rider` (`ROLE_PROTECTED :38-41`), ma
`is_approved` è concetto seller. Un admin promosso via SQL (`012` non tocca
`is_approved`, default false in `001:6`) viene rediretto fuori da tutto `/admin`,
mentre `withAdminAuth` (`lib/api/middleware.ts:171-177`) controlla solo
`role==='admin'` → può chiamare le API ma non caricare le pagine. Gate incoerente.

**Fix — richiedere `approved` solo per il ramo seller.**
BEFORE (`:256-263`):
```ts
if (roleRule) {
  if (!role || !roleRule.allowed.includes(role as ProfileRole & ('admin' | 'seller' | 'rider')) || !approved) {
    const url = req.nextUrl.clone();
    url.pathname = role === 'seller' ? '/seller/dashboard' : '/';
    return withCsp(NextResponse.redirect(url));
  }
}
```
AFTER:
```ts
if (roleRule) {
  const roleAllowed = !!role && roleRule.allowed.includes(role as ProfileRole & ('admin' | 'seller' | 'rider'));
  // is_approved è un concetto SELLER (candidatura→review→approvazione). Admin e rider
  // NON hanno semantica di approvazione a livello middleware (admin creato via SQL;
  // rider gated da RLS/trigger lato dati → vedi WS-DB-RLS): non bloccarli qui.
  const approvalOk = role === 'seller' ? approved : true;
  if (!roleAllowed || !approvalOk) {
    const url = req.nextUrl.clone();
    url.pathname = role === 'seller' ? '/seller/dashboard' : '/';
    return withCsp(NextResponse.redirect(url));
  }
}
```
Nessun cambio alla SELECT (`:214-218`, già prende `role, is_approved`).

**Test.** `tests/unit/middleware-roles.test.ts` (o e2e): admin con `is_approved=false`
accede a `/admin`; seller non approvato → redirect `/seller/dashboard`; rider accede a
`/rider` a prescindere da `is_approved`.
**Verifica.** Promuovere un buyer ad admin via SQL (senza toccare is_approved) e aprire
`/admin` in anteprima: non viene più rediretto.
**Rischio&rollback.** 🟡. Attenzione: sblocca `/rider` anche per rider non approvati —
coerente col fatto che l'approvazione rider va enforce-ata **a livello dati** (RLS
ordini + trigger). Se si vuole gating rider anche in pagina, farlo su
`approval_status`/ruolo **dopo** che WS-DB-RLS ha chiuso l'RLS ordini (oggi role-agnostica,
finding rls-database). Rollback = ripristino condizione singola. **Dipendenze.**
Allineare con `withAdminAuth`/`withSellerAuth` (già solo role/seller-approved: coerenti).
Gating rider robusto → **vedi WS-DB-RLS**.

---

## §I — `lib/order-status.ts` accoppiato a lucide-react  🟢 (minore)

**Causa-radice.** `lib/order-status.ts:15-29` importa icone `lucide-react` per
`ORDER_STATUS_ICON`: il modulo di dominio (tipi/label/transizioni, importato anche da
logica pura) trascina il set React/lucide nel grafo di chi vuole solo i tipi.

**Fix — separare le icone in un modulo UI dedicato.** Nuovo file
`components/orders/statusIcons.ts`:
```ts
import { Clock, ChefHat, Package, Bike, Hand, Truck, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/lib/order-status';

export const ORDER_STATUS_ICON: Record<OrderStatus, LucideIcon> = {
  NEW: Clock, ACCEPTED: ChefHat, READY: Package, ASSIGNED: Bike,
  PICKED_UP: Hand, OUT_FOR_DELIVERY: Truck, DELIVERED: CheckCircle2, CANCELED: XCircle,
};
```
`lib/order-status.ts`: rimuovere l'import lucide (`:13-18`) e l'export
`ORDER_STATUS_ICON` (`:20-29`). Il modulo resta puro (nessun import React).

Aggiornare i 3 importer + il test (blast-radius chiuso, `Grep ORDER_STATUS_ICON`):
- `app/orders/[id]/page.tsx:18` — spostare `ORDER_STATUS_ICON` dall'import
  `@/lib/order-status` a `@/components/orders/statusIcons` (gli altri simboli restano).
- `app/admin/page.tsx:12` — idem: `ORDER_STATUS_LABEL, type OrderStatus` da
  `@/lib/order-status`; `ORDER_STATUS_ICON` da `@/components/orders/statusIcons`.
- `components/ui/OrderStatusBadge.tsx:4` — `ORDER_STATUS_ICON` da `@/components/orders/statusIcons`.
- `tests/unit/order-status.test.ts:6,28` — aggiornare l'import di `ORDER_STATUS_ICON`
  (o spostare quell'assert in un nuovo `tests/unit/status-icons.test.ts`).

**Test.** `tsc`/build verde; `status-icons.test.ts`: ogni `OrderStatus` ha un'icona.
**Verifica.** Pagine ordini/admin/badge renderizzano le icone come prima; import di
`lib/order-status` da un contesto non-React (es. test/edge) non tira più lucide.
**Rischio&rollback.** 🟢 puro refactor di import; nessun cambio a rendering/logica.
Rollback = re-inline. **Dipendenze.** Nessuna.

---

## §T — `deliveryWindow` usa il fuso locale del runtime  🟢 (minore)

**Causa-radice.** `lib/delivery.ts:30-45` calcola il cutoff con `new Date(nowMs)` +
`setHours(cutoffHour,0,0,0)`, cioè nel fuso LOCALE del runtime/device. `lib/store-hours.ts:35-36`
àncora invece a `Europe/Rome` via `romeNow()`. Su device fuori fuso IT (turisti/in
viaggio) il countdown "arriva oggi" è errato di 1-2h; sbagliato anche se `deliveryWindow`
venisse riusata server-side (UTC). Due moduli, due nozioni di tempo per la stessa promessa.

**Fix — ancorare a Europe/Rome riusando `romeNow`, mantenendo la funzione pura** e un
`targetIso` correttamente calcolato come delta reale (DST-safe).
BEFORE (`:30-45`):
```ts
export function deliveryWindow(nowMs: number, cutoffHour = DEFAULT_CUTOFF_HOUR): DeliveryWindow {
  const now = new Date(nowMs);
  const cutoffToday = new Date(now);
  cutoffToday.setHours(cutoffHour, 0, 0, 0);
  const beforeCutoff = nowMs < cutoffToday.getTime();
  if (beforeCutoff) {
    return { beforeCutoff: true, targetIso: cutoffToday.toISOString(), day: 'oggi' };
  }
  const cutoffTomorrow = new Date(cutoffToday);
  cutoffTomorrow.setDate(cutoffTomorrow.getDate() + 1);
  return { beforeCutoff: false, targetIso: cutoffTomorrow.toISOString(), day: 'domani' };
}
```
AFTER:
```ts
import { romeNow } from './store-hours';

export function deliveryWindow(nowMs: number, cutoffHour = DEFAULT_CUTOFF_HOUR): DeliveryWindow {
  // Àncora la "promessa oggi/domani" all'orologio da parete di Piacenza (Europe/Rome),
  // indipendente dal fuso del device/runtime — coerente con store-hours.romeNow().
  const rome = romeNow(new Date(nowMs));
  const romeMinutes = rome.getHours() * 60 + rome.getMinutes();
  const cutoffMinutes = cutoffHour * 60;
  const beforeCutoff = romeMinutes < cutoffMinutes;

  // Delta in minuti fino al cutoff (oggi se in tempo, domani altrimenti), calcolato
  // sull'orologio di Roma e applicato all'istante REALE (nowMs) → ISO corretto e DST-safe.
  const minutesToCutoff = beforeCutoff
    ? cutoffMinutes - romeMinutes
    : (24 * 60 - romeMinutes) + cutoffMinutes;
  const subMinutePartMs = rome.getSeconds() * 1000 + rome.getMilliseconds();
  const targetMs = nowMs + minutesToCutoff * 60_000 - subMinutePartMs;

  return { beforeCutoff, targetIso: new Date(targetMs).toISOString(), day: beforeCutoff ? 'oggi' : 'domani' };
}
```
(`romeNow` è già esportato da `lib/store-hours.ts:35`. Nessun cambio a `deliveryEstimate`,
che chiama `deliveryWindow`.)

**Test.** `tests/unit/delivery.test.ts`: fissare `nowMs` e stubare TZ (o iniettare):
alle 17:00 Rome → `day='oggi'`; alle 19:00 Rome → `day='domani'`; `targetIso` a ~1h
dal now reale prima del cutoff; verificare che un device simulato in fuso diverso dà
lo stesso `day` (àncora Rome).
**Verifica.** In anteprima con orologio device spostato di fuso: il countdown
`DeliveryCutoff` resta ancorato all'ora di Piacenza.
**Rischio&rollback.** 🟢 funzione pura, test-first. `romeNow` via `toLocaleString`
introduce una micro-dipendenza da ICU del runtime (già usata da store-hours: coerente).
Rollback = ripristino `setHours`. **Dipendenze.** Nessuna; unifica l'approccio-tempo
con store-hours.

---

## §X1 — Dead auth routes /api/auth/signin|signup  → vedi WS-API  (minore)

Non riscritto qui (owner: **WS-API**). Sintesi: `app/api/auth/signin/route.ts` e
`signup/route.ts` importano `auth` da `@/lib/supabase/client` (`'use client'`,
singleton browser) ed eseguono signIn/signUp lato server; nessuna pagina le chiama
(solo i test). Il rate-limit/captcha che contengono NON protegge il flusso reale
(client-side). → **WS-API**: rimuovere le due route (dead code) o riscriverle con
`createServerClient(@supabase/ssr)` per-richiesta e puntarci le pagine; aggiungere una
lint-rule che vieta l'import di `@/lib/supabase/client` sotto `app/api`.

## §X2 — Coupon TOCTOU (validazione ≠ incremento)  → vedi WS-MONEY  (minore)

Non riscritto qui (owner: **WS-MONEY**, che possiede il claim atomico coupon —
duplicato anche in `pagamenti-stripe`). Sintesi: `validateCoupon` (`lib/coupons.ts:57,66`)
controlla `uses_count`/`first_order_only` alla creazione checkout, ma
`increment_coupon_usage` (`migrations/058:24-33`) fa `UPDATE ... SET uses_count=uses_count+1`
INCONDIZIONATO, molto dopo (webhook/COD): N checkout concorrenti passano tutti. →
**WS-MONEY**: claim atomico `UPDATE ... WHERE (max_uses IS NULL OR uses_count<max_uses)
RETURNING`, procedere solo se ha aggiornato 1 riga; per `first_order_only` vincolo unico
`(coupon,user)`. Interseca `cod/route.ts:458-461` e `webhook/route.ts` — coordinare
con la PR §O sui percorsi ordine.

---

## Riepilogo dipendenze cross-WS
- **§B4-trigger ↔ WS-DB-RLS**: aggiungere a `enforce_profile_update_rules` (061) il
  blocco `role→seller/rider` e il congelamento di `is_approved` per i non privilegiati.
- **§M ↔ WS-DB-RLS**: gating rider robusto vive nell'RLS ordini (oggi role-agnostica),
  non nel middleware.
- **§X2 ↔ WS-MONEY**: claim atomico coupon (interseca §O sulle route ordine).
- **§X1 ↔ WS-API**: dead auth routes + lint-rule import client in `app/api`.
- **Interni**: 140 prima di 141; §S e §O sulla stessa route Stripe/COD → una PR
  coordinata; §C sinergica con §O (fonte unica).

## File prodotti
- `consegne/bonifica/sql/140_arch_seller_approval_unify.sql` (idempotente)
- `consegne/bonifica/sql/141_arch_reconcile_unverified_sellers.sql` (dati, 🔴)
