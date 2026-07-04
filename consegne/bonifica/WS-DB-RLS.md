---
data: 2026-07-04 18:40
workstream: WS-DB-RLS
owner: security (con backend-dev per il codice)
fonte: consegne/bonifica/_findings.json["rls-database"] (9) + advisor DB live (Supabase MCP, progetto Mycity)
stato: pacchetto pronto per firma — migrazioni sul DB live = 🔴
---

# WS-DB-RLS — Pacchetto di fix «RLS & Database»

Copre **tutti i 9 finding** di `rls-database` **+** gli advisor di sicurezza del DB live
(2 ERROR view SECURITY DEFINER, 9 tabelle RLS-no-policy, ~17 funzioni SECURITY DEFINER,
leaked-password, pg_trgm). Ogni fix ha: causa-radice · fix esatto · test · verifica · colore ·
rischio&rollback · dipendenze. Le migrazioni SQL sono in `consegne/bonifica/sql/` (range **108-119**,
idempotenti, stile `marketplace/migrations/*.sql`). **Non ho toccato** i file esistenti (130-135, 140-141).

> **Verificato sul reale** (non a memoria): schema/policy via Supabase MCP (`execute_sql` read-only) sul
> progetto `clmpyfvpvfjgeviworth`, corpo funzioni via `pg_get_functiondef`, embed via grep in
> `/home/user/ad-mycity/marketplace`. Confidenza per punto indicata sotto.

## Ordine di applicazione consigliato
`109` (view) → `110` (lockdown profili) **insieme alle patch di codice B2** → poi `108, 111, 112, 113,
114, 115` (+ patch coupons) → `116, 117` → `118` (manuale/devops). `108` e `140` sono indipendenti.

---

## 🔴 B1 — Auto-accredito illimitato del wallet (BLOCCANTE) · `108_fix_wallet_revoke_and_trigger.sql`
**Causa-radice.** `profiles.wallet_balance_cents` (087) senza `REVOKE UPDATE`; policy update di 001 senza
`WITH CHECK`/limiti colonna; trigger `enforce_profile_update_rules` (061) congela role/is_approved/stripe/kyc
ma **non** il wallet. Unico vincolo: `CHECK(>=0)`. Un buyer con la sola anon key:
`from('profiles').update({wallet_balance_cents: 100000000}).eq('id', self)` → credito spendibile
(`app/api/orders/cod/route.ts:297` → `wallet_debit`). Contraddice la garanzia di 087.
**Fix.** (1) `REVOKE UPDATE (wallet_balance_cents) FROM authenticated, anon`; (2) freeze del wallet nel
trigger (rewrite coerente che **mantiene tutte le protezioni di 061** + aggiunge il wallet + blocca
**qualsiasi** cambio di `is_approved`). Scritture solo via RPC definer `_wallet_apply`.
**Test.** Come buyer (anon key): l'`update` del wallet → `42501`; `redeem_gift_card`/`convert_loyalty_to_credit`
→ accreditano; checkout COD con credito → `wallet_debit` OK. Regressione: `/sell` (candidatura seller) e
`/rider/onboarding` continuano a salvare (role/approval_status='pending' restano permessi).
**Verifica.** `SELECT has_column_privilege('authenticated','public.profiles','wallet_balance_cents','UPDATE')` → false.
**Colore.** 🔴 (DDL live). **Rischio/rollback.** Basso; rollback in coda al file (sconsigliato: riapre il furto).
**Dipendenze.** Coordinamento con `140` (tocca solo `handle_new_user`, nessun conflitto). Vedi §Coordinamento-trigger.
**Confidenza.** Alta (colonna, policy, corpo trigger, chiamata COD verificati).

### Coordinamento-trigger (per WS-ARCH / 140)
- `108` è l'**unica** definizione di `enforce_profile_update_rules`. Include: blocco role→admin, **freeze wallet**,
  **is_approved: nessun cambio** dal non-privilegiato (061 bloccava solo false→true), approval_status solo→'pending',
  freeze stripe/kyc/subscription/approved_by/at.
- **NON** blocco `role→'seller'/'rider'` su UPDATE (WS-ARCH lo aveva chiesto): `app/sell/page.tsx:70-72` e
  `app/rider/onboarding` fanno un UPDATE **client** che imposta `role='seller'/'rider'` con `is_approved=false`,
  `approval_status='pending'` (candidatura self-service, comportamento **voluto** di 061). Bloccarlo **romperebbe
  l'onboarding** e non aggiunge sicurezza (un seller/rider non approvato è inerte: tutti i gate leggono `is_approved`,
  già congelato). Se WS-ARCH vuole comunque il blocco, prima va spostata l'assegnazione ruolo a un route server. **Decisione da confermare con Nicola/WS-ARCH.**
- **NON** congelo `public_profile_enabled`: il leak che lo motivava è chiuso alla radice in `110` (drop policy 033
  + view whitelisted). Congelarlo romperebbe `PublicProfileToggle` (self-service legittimo). Deviazione motivata.

---

## 🔴 B2 — La 107 rompe gli embed del profilo venditore (BLOCCANTE) · `109_fix_107_seller_embed.sql` + patch codice
**Causa-radice.** 107 ha eliminato la policy permissiva su `profiles` e creato la view `seller_public_profiles`,
ma **molti siti client** (soggetti a RLS) embeddano ancora il raw `profiles!...fkey`. Dopo 107 quelle SELECT
tornano `null` → schede prodotto "non disponibile" (`app/product/[id]/page.tsx:237`), ordini senza dati negozio,
**rider senza indirizzo/telefono di ritiro** → consegne bloccate; `SearchBar`/`FrequentlyBoughtTogether` usano
`!inner` → i prodotti **spariscono**.
**Fix — 2 leve (usale entrambe).**

**(a) Lato SQL — `109`:** ricrea `seller_public_profiles` con l'insieme colonne vetrina completo
(`security_invoker=false` esplicito: barriera a colonne whitelisted, **mai** IBAN/KYC/CF/Stripe/wallet);
**DROP** della view ridondante e **inutilizzata** `seller_storefronts` (grep: 0 usi → chiude 1 dei 2 ERROR 0010);
crea la view `public_profiles` (whitelist buyer: handle/bio/avatar/full_name) che sostituisce la lettura di 033.

**(b) Lato codice — migrare gli embed all'helper `lib/queries/seller-public-profiles.ts`** (pattern già usato in
`components/ProductGrid.tsx`: `fetchSellerPublicMap` + `attachSellerProfiles`). Sostituzione tipo:
```
// PRIMA (rotto): embed to-one soggetto a RLS
.select('*, profiles!products_seller_id_fkey ( id, store_name, is_approved, offers_express )')
// DOPO: query prodotti senza embed profilo, poi batch sulla view + attach
const { data: rows } = await supabase.from('products').select('*').…
const sellerMap = await fetchSellerPublicMap(supabase, rows.map(r => r.seller_id), 'id, store_name, is_approved, offers_express');
const withSeller = attachSellerProfiles(rows, sellerMap).filter(p => p.profiles?.is_approved);
```
**File CLIENT da migrare (rotti da 107 — verificati via grep):**
- Prodotto: `app/product/[id]/page.tsx:88`, `app/product/[id]/layout.tsx:28`, `app/product/[id]/opengraph-image.tsx:19` (OG, degrada soft)
- Ordini buyer: `app/orders/page.tsx:50`, `app/orders/[id]/page.tsx:89`, `app/orders/[id]/review/page.tsx:57`, `app/orders/[id]/dispute/page.tsx:42`
- Carrello/preferiti: `app/favorites/page.tsx:25`, `app/shared-cart/page.tsx:82`, `components/cart/CartUpsell.tsx:55`
- Rider (CRITICO — indirizzo ritiro): `app/rider/orders/[id]/page.tsx:91`, `app/rider/page.tsx:81`
- Home/ricerca: `components/SearchBar.tsx:82` (**!inner**), `components/products/FrequentlyBoughtTogether.tsx:53` (**!inner**),
  `components/home/TrendingNow.tsx:44,70`, `components/home/DropOfDay.tsx:68`, `components/home/StoryOfDay.tsx`,
  `components/home/StoriesCarousel.tsx`, `components/home/ShopOfMonthHero.tsx`, `components/home/HeroStoreCard.tsx`,
  `components/home-sections/ReorderRail.tsx:68`, `components/StoreStoryRing.tsx`, `components/RecentlyViewed.tsx:52`,
  `components/LiveActivityFeed.tsx:57`

**SAFE (non toccare — service_role/admin bypassano RLS o coperti dalla policy admin 012):** tutti gli `app/admin/*`
e gli `app/api/*` (usano `getAdminSupabase`), es. `app/api/seller/orders/[id]/label/route.ts`, `app/api/cron/operational-alerts/route.ts`.

**Follow-up correlato (NON in B2, → backend-dev):** embed che leggono il **nome di una controparte** non-venditore
(rider/buyer `full_name` mostrato all'altro attore): `app/seller/orders/[id]/page.tsx:133` (rider),
`app/seller/customers/page.tsx:43` (buyer), `app/seller/reviews`/`app/rider/reviews` (reviewer),
`app/messages*`/`components/ProductQA.tsx` (controparte). Questi non sono venditori → non stanno in
`seller_public_profiles`. Servono una **esposizione minimale order-scoped** (RPC/vista `order_participants` che
ritorna solo `full_name` delle controparti di un ordine/conversazione a cui l'utente partecipa). Proposta da
girare a backend-dev; non riaprire una policy permissiva su `profiles`.

**Test.** Da anon e da buyer: scheda prodotto mostra il negozio e NON "non disponibile"; ricerca ritorna prodotti;
rider vede indirizzo/telefono ritiro. **Verifica.** `SELECT * FROM seller_public_profiles LIMIT 1` come anon → solo
colonne vetrina. **Colore.** 🔴 (SQL) + 🟡 (patch codice in branch, anteprima, poi 🔴 deploy). **Rischio/rollback.**
Medio: senza le patch di codice le pagine restano vuote → **SQL e codice vanno insieme**. Rollback view in coda a 109.
**Dipendenze.** `109` prima di `110`. **Confidenza.** Alta sui file (grep), media sul comportamento PostgREST del
singolo embed migrato (test in anteprima).

### Advisor 0010 (SECURITY DEFINER VIEW) — perché resta, e l'end-state GOLD
Le view vetrina restano `security_invoker=false` **di proposito**: sono barriere a **colonne whitelisted** su
venditori approvati (nessuna colonna sensibile). Convertirle a `security_invoker=true` richiederebbe una policy
**permessiva sui ROW** dei venditori sul base-table, che ri-esporrebbe le colonne sensibili al ruolo
`authenticated` (che le legge sulla **propria** riga da `/sell`, `/rider/onboarding`, `StripeConnectButton`,
`SellerHealthScore`) → **non revocabili senza rompere l'onboarding**. Quindi: `seller_storefronts` **rimossa**
(1 ERROR chiuso), `seller_public_profiles` **accettata e documentata** (1 ERROR residuo, motivato).
**Opzione A — end-state GOLD (coordinata, fuori range):** `security_invoker=true` + policy narrow "approved seller
rows" + `REVOKE SELECT` colonne sensibili **da authenticated** + migrazione dei ~6 owner-self-read a route
server/RPC. Chiude anche l'ultimo ERROR ma è multi-file (frontend-dev+backend-dev) e va pianificata a parte.

---

## 🟠 GRAVE — Policy ordini "rider" senza controllo di ruolo · `111_rider_role_gate_orders.sql`
**Causa-radice.** SELECT `019` e UPDATE `011` sul pool ordini non verificano `role='rider'`/`is_approved`. In OR
con le altre policy → **ogni** utente autenticato legge PII di consegna (nome/telefono/indirizzo/geo/total_price)
degli ordini ACCEPTED/READY liberi e può "claimarli". Esposizione latente ma strutturale.
**Fix.** Helper `is_rider()` STABLE SECURITY DEFINER (no ricorsione RLS) + gate `AND public.is_rider()` sul disgiunto
"pool" in SELECT e UPDATE; il ramo `rider_id = auth.uid()` resta.
**Test.** Buyer: `from('orders').select('delivery_phone').eq('delivery_status','READY').is('rider_id',null)` → 0 righe;
rider approvato: vede il pool e claima; il trigger 061 valida la transizione.
**Verifica.** `SELECT is_rider()` come buyer → false, come rider approvato → true.
**Colore.** 🔴. **Rischio/rollback.** Basso; rollback in coda. **Dipendenze.** Nessuna. **Confidenza.** Alta.

---

## 🟠 GRAVE — Over-grant colonne sensibili + lettura cross-tenant · `110_profiles_cross_tenant_read_lockdown.sql`
**Causa-radice.** Policy `"Public profile read"` (033) `USING (public_profile_enabled = true OR auth.uid()=id)`
lascia leggere le **righe altrui** opt-in; con `authenticated` che ha SELECT su tutte le colonne → IBAN, CF, data
nascita, residenza, business, URL KYC, Stripe ID, telefono, indirizzo, wallet leggibili. Un venditore che attiva
l'opt-in diventa interamente leggibile. Violazione GDPR/AML (latente finché nessuno opta-in).
**Fix (deny-by-default, senza rompere l'owner).** (1) **DROP** `"Public profile read"`: nessuno legge più la riga
base di un altro profilo (restano: propria riga 001, admin 012, rider→buyer dell'ordine 011/013). I profili pubblici
buyer si servono dalla view `public_profiles` (109). → le colonne sensibili **non sono più leggibili cross-tenant**
per `authenticated`, a prescindere dai grant di colonna. (2) `REVOKE SELECT` colonne sensibili **da `anon`** (anon non
ha "propria riga"; le vetrine passano dalle view definer). **NON** revoco da `authenticated` (romperebbe l'owner-read
di `/sell`, `/rider/onboarding`, `StripeConnectButton`, `SellerHealthScore`, `rider/profile` — verificati via grep):
l'isolamento cross-tenant è già dato dal punto (1).
**Migrazione codice (accompagna il deploy):** `app/u/[handle]/page.tsx:27` e `components/store-sections/*` che leggono
i campi pubblici → puntare a `public_profiles`. `PublicProfileToggle` legge/scrive la **propria** riga → invariato.
**Test.** Buyer B legge il profilo del venditore opt-in A: `from('profiles').select('billing_iban').eq('id',A)` → 0 righe;
la pagina `/u/handle` continua a mostrare bio/handle via `public_profiles`. **Verifica.** advisor 0009-like: nessuna
riga altrui dal base-table; `has_column_privilege('anon',...,'billing_iban','SELECT')` → false.
**Colore.** 🔴. **Rischio/rollback.** Medio (pagine pubbliche): serve la patch `/u/[handle]`→view **insieme**; rollback in coda.
**Dipendenze.** `109` (view `public_profiles`) prima. **Confidenza.** Alta.

---

## 🟠 GRAVE — Auto-approvazione al signup (role/is_approved dal client) → **WS-ARCH / `140`**
**NON riscrivo:** WS-ARCH ha già corretto `handle_new_user` in `140_arch_seller_approval_unify.sql` (nessun utente
nasce approvato). **La mia parte** (canale UPDATE) è in `108`: `is_approved` non modificabile dal non-privilegiato +
role→admin bloccato. **Vedi §Coordinamento-trigger** per la scelta su role→seller/rider (mantenuto per l'onboarding
self-service; da confermare). **Confidenza.** Alta (140 letto, corpo `handle_new_user` verificato via MCP).

---

## 🟠 GRAVE — `returns_buyer_insert` non validato · `112_returns_lockdown.sql`
**Causa-radice.** INSERT policy `WITH CHECK (auth.uid()=buyer_id)` senza verifica ordine/seller/stato/finestra e senza
trigger → un buyer forgia resi con `seller_id` arbitrario, `status='REFUNDED'`, `refund_amount_cents` arbitrario,
saltando `/api/returns/create`. A differenza di orders/order_items (INSERT client rimossa in 058), `returns` è rimasta
client-writable.
**Fix.** **DROP** `returns_buyer_insert`: creazione **solo** server-side via `/api/returns/create` (service_role,
bypassa RLS), coerente con 058. Buyer/seller/admin conservano la lettura.
**Verifica pre-deploy.** Confermato (grep): nessun `from('returns').insert` client; unico `.from('returns')` non-admin
è `app/seller/orders/[id]/page.tsx:169` (non insert). Rieseguire il grep prima del deploy.
**Test.** Buyer: `from('returns').insert({...seller_id arbitrario})` → RLS nega; `/api/returns/create` funziona.
**Colore.** 🔴. **Rischio/rollback.** Basso (in coda). **Dipendenze.** Verifica che il route create usi service_role.
**Confidenza.** Media-alta (route create presunto server-side dal pattern; verificare la riga admin client).

---

## 🟡 MINORE — `messages_update_read` riscrive il body altrui · `113_messages_body_freeze.sql`
**Causa-radice.** UPDATE policy `026` solo `USING (partecipante)` senza `WITH CHECK`/limiti colonna → il destinatario
riscrive `body` dei messaggi altrui. **Fix.** Trigger BEFORE UPDATE: per chi non è il `sender` consente solo `read_at`
e congela `body/sender_id/conversation_id/created_at`; staff/service_role liberi (anche l'anonimizzazione di
`process-deletions`). **Test.** Destinatario `update({body:'x'})` su messaggio altrui → `42501`; `update({read_at})` OK.
**Colore.** 🔴 (trigger su tabella live). **Rischio/rollback.** Basso (in coda). **Confidenza.** Alta (colonne verificate).

---

## 🟡 MINORE — `subscription_orders` write cross-tenant · `114_subscription_orders_split_policies.sql`
**Causa-radice.** `FOR ALL USING (auth.uid()=user_id OR auth.uid()=seller_id)` senza `WITH CHECK` → il seller
UPDATE/DELETE le subscription del buyer. **Fix.** Split: SELECT per entrambi; INSERT/UPDATE/DELETE solo
`auth.uid()=user_id` (con `WITH CHECK`). **Test.** Seller `update` su subscription di un buyer → 0 righe/negato.
**Colore.** 🔴. **Rischio/rollback.** Basso (tabella non ancora cablata; in coda). **Confidenza.** Alta (colonne verificate).

---

## 🟡 MINORE — `coupons`: enumerazione codici · `115_coupons_no_public_enum.sql` + patch `lib/coupons.ts`
**Causa-radice.** Policy `"Anyone can read active coupons"` (014) `USING (active=true)` → `select * from coupons` espone
tutti i codici attivi (anche riservati). **Fix.** DROP della SELECT pubblica + RPC `lookup_coupon_by_code(p_code)`
SECURITY DEFINER (ritorna **solo** la riga del codice richiesto). `lib/coupons.ts` cambia solo la sorgente:
`.from('coupons').select('*').eq('code',...)` → `.rpc('lookup_coupon_by_code',{p_code})` (logica invariata).
**Coordinamento WS-MONEY:** il claim atomico resta `claim_coupon/release_coupon` (130); questa è solo la lettura.
**Test.** anon: `from('coupons').select('*')` → 0 righe; `rpc('lookup_coupon_by_code',{p_code:'NATALE10'})` → 1 riga;
codice inesistente → 0. **Colore.** 🔴 (SQL) + 🟡 (patch lib in branch). **Rischio/rollback.** Basso ma **SQL+patch
insieme** (senza patch, la validazione coupon si rompe). Rollback in coda. **Confidenza.** Alta (`lib/coupons.ts` letto).

---

## Advisor DB live

| Advisor | Livello | Fix | File | Colore |
|---|---|---|---|---|
| `security_definer_view` × 2 (seller_storefronts, seller_public_profiles) | ERROR | Drop `seller_storefronts` (inutilizzata) → 1 chiuso; `seller_public_profiles` **accettata/documentata** (barriera colonne whitelisted). Opzione A GOLD per chiudere il 2° | `109` | 🔴 |
| `rls_enabled_no_policy` × 9 | INFO | Policy admin-read esplicita (deny-by-default per i client; write solo service_role) | `116` | 🔴 |
| `anon/authenticated_security_definer_function_executable` × ~17 | WARN | Triage: **REVOKE** solo `admin_list_user_emails`; le altre restano (RPC volute con authz interna / analytics pubbliche / `is_admin`+`is_rider` usate nelle policy) | `117` | 🔴 |
| `extension_in_public` (pg_trgm) | WARN | Spostare in schema `extensions` in finestra manutenzione (censire indici trigram prima) — **non bloccante** | `118` (commentato) | 🔴/devops |
| `auth_leaked_password_protection` | WARN | Toggle Dashboard → Auth → ON (non SQL) | `118` (nota) | 🔴 manuale |

Dettaglio del triage funzioni SECURITY DEFINER nell'header di `117` (perché ognuna resta o viene revocata).
**Nota chiave:** `is_admin()`/`is_rider()` **non** vanno revocate da `authenticated` — sono referenziate dentro le
RLS policy e il ruolo che interroga deve poterle eseguire, altrimenti l'intero strato RLS si rompe (verificato: il
WARN su `is_admin` è accettato, ritorna solo lo stato del chiamante).

---

## File SQL prodotti (range 108-119)
- `108_fix_wallet_revoke_and_trigger.sql` — B1 wallet + trigger profili coerente (🔴)
- `109_fix_107_seller_embed.sql` — B2 view vetrina + drop seller_storefronts + public_profiles (🔴)
- `110_profiles_cross_tenant_read_lockdown.sql` — drop 033 + REVOKE colonne da anon (🔴)
- `111_rider_role_gate_orders.sql` — is_rider() + gate ruolo su SELECT/UPDATE ordini (🔴)
- `112_returns_lockdown.sql` — drop returns_buyer_insert (🔴)
- `113_messages_body_freeze.sql` — trigger freeze body (🔴)
- `114_subscription_orders_split_policies.sql` — split RW→SELECT+owner-write (🔴)
- `115_coupons_no_public_enum.sql` — drop SELECT pubblica + lookup_coupon_by_code (🔴 + patch lib)
- `116_rls_no_policy_tables.sql` — 9 tabelle: policy admin-read (🔴)
- `117_secdef_function_execute_lockdown.sql` — REVOKE admin_list_user_emails (🔴)
- `118_extensions_and_auth_hardening.sql` — pg_trgm + leaked-password (manuale/devops)

## Patch di CODICE che accompagnano lo SQL (→ frontend-dev/backend-dev, branch → anteprima → 🔴 deploy)
1. **B2** migrazione embed seller → helper `seller-public-profiles.ts` (elenco file §B2).
2. **110** `app/u/[handle]/page.tsx` + `components/store-sections/*` → view `public_profiles`.
3. **115** `lib/coupons.ts` → `rpc('lookup_coupon_by_code')`.
4. **Follow-up** esposizione order-scoped dei nomi controparte (rider/buyer) — nuovo RPC/vista (backend-dev).

## Cosa serve da Nicola (🔴)
- Firma per applicare le migrazioni **108-117** sul DB live (via backend-dev/devops, con anteprima delle patch codice).
- Decisione §Coordinamento-trigger: bloccare o no `role→seller/rider` su UPDATE (io **raccomando NO** per non rompere
  l'onboarding self-service; is_approved già congelato copre il rischio).
- Toggle manuale **Leaked Password Protection = ON** nel pannello Supabase Auth.
- Ok a schedulare (post go-live) lo spostamento di `pg_trgm` (finestra manutenzione, non bloccante).

## Punti incerti / da verificare in anteprima
- Comportamento PostgREST del singolo embed migrato (test in anteprima, non solo teoria).
- `app/api/returns/create` usa davvero il service_role (grep suggerisce sì; confermare la riga admin client).
- Follow-up nomi-controparte: scelta tra RPC vs vista `order_participants` (design con backend-dev).
- Opzione A GOLD (security_invoker + REVOKE authenticated + owner-read a server) resta da pianificare per chiudere
  l'ultimo ERROR 0010.
