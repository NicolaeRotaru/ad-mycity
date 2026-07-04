# WS-PERF — Pacchetto di fix Performance (frontend + DB live)

> Owner: backend-dev (performance frontend+DB). Data: 2026-07-04.
> Fonti sola lettura: `/home/user/ad-mycity/marketplace` · findings `consegne/bonifica/_findings.json` chiave `performance` (11) · advisor DB live confermati via Supabase MCP (progetto Mycity `clmpyfvpvfjgeviworth`, execute_sql read-only su pg_policies/pg_stat_user_indexes/pg_constraint).
> Colore globale: codice = 🟡 (branch, no deploy) · migrazioni DB live = 🔴 (firma Nicola + @security).
> **Coordinamento:** `ProductGrid.tsx` / `ProductCard.tsx` sono toccati anche da **WS-A11Y** e **WS-FRONTEND** → sotto annoto solo le righe perf, senza duplicare i loro interventi. Applicare in un branch condiviso `perf/*` con rebase, evitando collisioni sugli stessi hunk.

Ordine di rollout consigliato: **DB-A (indici FK, 120)** → **DB-B (initplan, 121)** → **codice P1→P11** → proposte 122/123 (rimandate). Le migrazioni DB abilitano gli spinti-nel-DB del codice (P2/P11).

---

## SEZIONE A — Fix di CODICE (11 finding)

### P1 · Catalogo/ricerca senza limite né paginazione (GRAVE)
- **File:** `components/ProductGrid.tsx:74-112` (query), `:398-402` (render); chiamanti senza `limit`: `app/search/page.tsx:474`, `app/novita/page.tsx:48`, `app/category/[slug]/page.tsx:432`, `components/StoreProductExplorer.tsx:202`.
- **Causa-radice:** `.limit()` applicato solo se il chiamante passa `limit` (riga 101). Le superfici principali non lo passano → si scaricano TUTTE le righe `status='available'` (troncate a ~1000 dal cap PostgREST), `description` inclusa (riga 80), e ogni riga è montata nel DOM senza virtualizzazione.
- **Fix ESATTO:**
  1. Default limit + paginazione keyset. In `ProductGrid.tsx`:
     ```diff
     -const ProductGrid = ({ categoryId, …, sort = 'relevance', … }: Props) => {
     +const PAGE_SIZE = 24;
     +const ProductGrid = ({ categoryId, …, sort = 'relevance', pageSize = PAGE_SIZE, … }: Props) => {
     ```
     Passare da `useQuery` a `useInfiniteQuery` con `.range(from, from+pageSize-1)` e cursore keyset (`created_at`+`id`) invece di OFFSET (OFFSET degrada in profondità):
     ```diff
     -    .select(`… id, name, description, price, … `)
     +    .select(`id, name, price, compare_at_price, images, stock, has_variants, created_at, seller_id, category_id`)
          .eq('status', 'available')
     +    .order('created_at', { ascending: false }).order('id', { ascending: false })
     +    .limit(pageSize)
     ```
     (nella pagina successiva: `.lt('created_at', lastCreatedAt)` o filtro keyset composito).
  2. Rimuovere `description` dalla select delle card (già in P3 per la scheda; qui la card non la usa — `ProductCard` riceve `description` ma può restare vuota su griglia).
  3. Virtualizzazione della griglia lunga con `react-window`/`@tanstack/react-virtual` (solo sul layout `grid`, non sulle rail). Coord. con WS-FRONTEND se rifà il markup.
- **Misura attesa:** payload SRP/categoria da centinaia di KB–MB a ~decine di KB per pagina; nodi DOM da N→24; **LCP mobile ↓ 30-50%**, **TBT ↓** (meno mount di ProductCard). Lista sempre completa (niente troncamento a 1000).
- **Test/verifica:** SRP con >24 match mostra "carica altre"/infinite-scroll; conteggio DOM = pageSize; network mostra `range`/`limit`. Regressione su rail (devono restare a scorrimento orizzontale, `limit` già passato dalla home).
- **Colore:** 🟡 · **Rischio&rollback:** medio (cambia data-fetch di 4 superfici) → dietro flag/branch, rollback = revert del componente. **Dipendenze:** nessuna DB; sblocca P2.

### P2 · Ordinamento e filtri in JS su set troncato → ranking/conteggi sbagliati (GRAVE)
- **File:** `components/ProductGrid.tsx:85-90` (switch order), `:200-234` (filtered/sort client), `:238-241` (onCount).
- **Causa-radice:** lo switch DB non gestisce `rating`/`discount_desc` (cadono in `created_at desc`); minRating/onlyInStock/onlyPromo/onlyOpenStores e i sort per rating/sconto sono applicati DOPO il fetch, quindi solo sui ≤1000 più recenti. `onCount` conta il post-filtro → "N prodotti" errato.
- **Fix ESATTO:** spingere ordinamento e filtri nel DB con una **RPC paginata** `search_catalog(p_category_ids, p_seller_id, p_search, p_min_price, p_max_price, p_only_in_stock, p_only_promo, p_min_rating, p_sort, p_limit, p_cursor)` che:
  - joina `product_rating_stats` (RPC 052 già esistente) per `rating`/`minRating` server-side;
  - calcola lo sconto effettivo (`compare_at_price` + promo attive) in SQL per `discount_desc`;
  - filtra stock/promo in query; ritorna righe + `total_count` reale via `count(*) OVER()`.
  Il client (`ProductGrid`) resta a **solo render**: elimina i blocchi `filtered`/sort JS (righe 200-234) e usa `onCount(total_count)` dalla RPC.
  - **Backend (nuova migrazione, fuori da questo range 120-129 → assegnare a WS-DB o nuovo file 124):** definire la RPC `SECURITY INVOKER` (rispetta RLS) con indici di supporto (`products(status, category_id, created_at)`, indice su prezzo). Annotato qui come dipendenza, non incluso perché è codice DB nuovo, non un lint advisor.
- **Misura attesa:** ranking corretto (i "più votati/scontati" reali), conteggio esatto, **CPU client ↓** (niente sort/filtri JS), query servita da indice.
- **Colore:** 🟡 codice + 🔴 RPC/indice DB · **Rischio&rollback:** medio-alto (cuore della SRP) → dietro branch, rollback = revert. **Dipendenze:** richiede la RPC (DB) prima del cambio client; costruisce su P1.

### P3 · Scheda prodotto: `select('*')` scarica colonne pesanti inutili (GRAVE)
- **File:** `app/product/[id]/page.tsx:87-89`.
- **Causa-radice:** `select('*')` sulla pagina più trafficata trascina `search_tsv` (tsvector che duplica name+description) e `external_data` (jsonb snapshot), mai usati dalla UI.
- **Fix ESATTO:**
  ```diff
  -      const { data, error } = await supabase.from('products').select(`
  -        *, categories ( slug, name ), profiles!products_seller_id_fkey ( id, store_name, is_approved, offers_express )
  -      `).eq('id', id).single();
  +      const { data, error } = await supabase.from('products').select(`
  +        id, name, description, price, compare_at_price, images, stock, has_variants,
  +        category_id, seller_id, status, condition, unit, external_source_url, offers_express,
  +        attributes, created_at,
  +        categories ( slug, name ),
  +        profiles!products_seller_id_fkey ( id, store_name, is_approved, offers_express )
  +      `).eq('id', id).single();
  ```
  (rivedere la lista colonne contro l'uso reale nel JSX prima del merge; **mai** `search_tsv`/`external_data`.)
- **Misura attesa:** payload scheda ↓ (soprattutto prodotti con descrizioni lunghe/importati); **render percepito mobile migliore** su pagina ad alto traffico.
- **Test/verifica:** la scheda mostra ancora tutti i campi; diff del payload JSON prima/dopo; nessun `undefined` nel JSX.
- **Colore:** 🟡 · **Rischio&rollback:** basso (solo lista colonne) → rollback = revert. **Dipendenze:** allineare con P4 (SSR) se rifà il fetch.

### P4 · Shopping interamente client-rendered: contenuto fuori dall'SSR (GRAVE, LCP/SEO)
- **File:** `app/product/[id]/page.tsx:1` (`'use client'`), `app/search/page.tsx:1`, `components/ProductGrid.tsx:1`.
- **Causa-radice:** prodotto/ricerca/catalogo renderizzano solo dopo hydration con fetch client verso Supabase → l'HTML iniziale non contiene titolo/prezzo/immagine; l'LCP arriva dopo download JS + round-trip DB dal browser.
- **Fix ESATTO:** portare **scheda** e **SRP** a Server Component con fetch server-side:
  - Estrarre la parte interattiva (selettori variante, add-to-cart, gallery) in un client component figlio; il wrapper pagina diventa `async` Server Component che fa il fetch con `@supabase/ssr` (server client) e passa i dati come props / `HydrationBoundary` con `dehydrate` del react-query prefetchato.
  - `app/product/[id]/page.tsx`: `export default async function ProductPage({ params })` → `const product = await getProductServer(id)` (colonne esplicite di P3) → rende above-the-fold (nome/prezzo/immagine) in SSR; il resto in `<ProductInteractive product={product} />` client.
- **Misura attesa:** **LCP/INP ↓** (contenuto nell'HTML, niente attesa JS+DB), **SEO** delle pagine prodotto rafforzata (markup indicizzabile) → impatto conversione + ranking.
- **Test/verifica:** `view-source` della scheda contiene nome/prezzo; Lighthouse mobile LCP prima/dopo; il flusso interattivo (varianti, carrello) resta funzionante.
- **Colore:** 🟡 (refactor architetturale) · **Rischio&rollback:** alto (tocca routing/rendering) → branch dedicato, rollout scheda prima, poi SRP; rollback = revert. **Dipendenze:** **grosso overlap con WS-FRONTEND** → concordare chi possiede il refactor SSR (raccomando: WS-FRONTEND guida, WS-PERF fornisce il fetch server-side con colonne esplicite). Costruisce su P3.

### P5 · `/near` aggrega recensioni in JS invece dell'RPC (MINORE)
- **File:** `app/near/page.tsx:41-45` (query) + `:52-61` (aggregazione JS).
- **Causa-radice:** `store_reviews.select('store_id, rating').in(...)` scarica OGNI recensione e media in loop; `/stores` fa già lo stesso con l'RPC aggregata `store_review_stats` (`app/stores/page.tsx:48`).
- **Fix ESATTO:**
  ```diff
  -  const [productsRes, reviewsRes] = await Promise.all([
  -    supabase.from('products').select('id, name, price, images, seller_id').in('seller_id', storeIds).eq('status','available').order('created_at',{ascending:false}).limit(400),
  -    supabase.from('store_reviews').select('store_id, rating').in('store_id', storeIds),
  -  ]);
  +  const [productsRes, statsRes] = await Promise.all([
  +    supabase.from('products').select('id, name, price, images, seller_id').in('seller_id', storeIds).eq('status','available').order('created_at',{ascending:false}).limit(400),
  +    supabase.rpc('store_review_stats', { p_store_ids: storeIds }),
  +  ]);
  ```
  e sostituire il loop `:52-61` con la mappatura diretta delle righe RPC (`{ store_id, avg, count }`), come in `app/stores/page.tsx`.
- **Misura attesa:** payload `/near` costante col crescere delle recensioni (oggi cresce lineare); CPU client ↓. Impatto modesto oggi (pagina gated da geolocalizzazione).
- **Test/verifica:** media/conteggio recensioni per negozio identici a prima; confronto con `/stores`.
- **Colore:** 🟡 · **Rischio&rollback:** basso → revert. **Dipendenze:** verificare la firma esatta dell'RPC `store_review_stats` (parametro `p_store_ids`) come usata in `app/stores/page.tsx`.

### P6 · ProductGrid: waterfall prodotti → profili venditore (MINORE)
- **File:** `components/ProductGrid.tsx:102-110`.
- **Causa-radice:** dopo la query products si ATTENDE una seconda query `fetchSellerPublicMap` (IN sui seller_id) prima di renderizzare → 2 RTT in serie, ripetuti per ogni rail/SRP/categoria.
- **Fix ESATTO:** eliminare il secondo round-trip con un **embed** sulla relazione seller nella stessa select:
  ```diff
  -    .select(`id, name, price, compare_at_price, images, stock, has_variants, created_at, seller_id, category_id`)
  +    .select(`id, name, price, compare_at_price, images, stock, has_variants, created_at, seller_id, category_id,
  +             profiles:profiles!products_seller_id_fkey ( id, store_name, store_hours, is_approved )`)
       .eq('status', 'available')
  ```
  poi filtrare `is_approved` sul risultato già joinato (rimuove `fetchSellerPublicMap`/`attachSellerProfiles`). Se l'embed non rispetta l'RLS voluta sui profili, in alternativa una singola RPC prodotti+vetrina.
- **Misura attesa:** **-1 RTT DB per ogni griglia**; sulla home con più rail i ritardi non si sommano più → first paint prodotti più rapido.
- **Test/verifica:** ogni card ha `storeName`; i non-approvati restano esclusi; network mostra 1 query invece di 2.
- **Colore:** 🟡 · **Rischio&rollback:** medio (cambia la forma dati) → revert. **Dipendenze:** verificare che l'embed profiles passi la RLS di lettura pubblica; convive con P1/P2 (stessa select).

### P7 · `next/image unoptimized` ovunque (MINORE, LCP)
- **File:** `components/ProductCard.tsx:132` (+ ~24 file, es. `components/home/HeroStoreCard.tsx:119` = hero LCP).
- **Causa-radice:** `unoptimized` disattiva la generazione del `srcset` responsive di Next → una sola larghezza fissa per slot, `sizes` ignorato, DPR non gestito; l'hero da 1200px servito anche a ~384px.
- **Fix ESATTO (2 opzioni):**
  - **A (preferita):** rimuovere `unoptimized` e usare l'optimizer Next con `sizes` già presente:
    ```diff
    -          unoptimized
               className="object-cover …"
    ```
    Verificare `next.config` (`images.remotePatterns`/`loader`): se le foto stanno su Supabase Storage/CDN esterno, aggiungere il pattern o un `loader` custom che mantenga `sizedImage()`.
  - **B (se A non fattibile subito):** costruire un `srcset` multi-larghezza con `sizedImage()` (es. 220/440/660w) e passarlo, così `sizes` torna efficace.
  - Priorità: **hero (`HeroStoreCard`) per primo** — è tipicamente l'elemento LCP.
- **Misura attesa:** immagini dimensionate per viewport/DPR → **byte immagine ↓** (soprattutto desktop/slot piccoli), **LCP hero ↓**.
- **Test/verifica:** `<img srcset>` presente e multi-width; Lighthouse "properly sized images" verde; nessuna immagine rotta (controllo domini in next.config).
- **Colore:** 🟡 · **Rischio&rollback:** medio (config immagini globale — rischio 404 se i domini non sono whitelisted) → testare in anteprima prima; rollback = rimettere `unoptimized`. **Dipendenze:** `next.config` immagini; **coord. WS-FRONTEND/WS-A11Y** che toccano ProductCard (alt/markup).

### P8 · Scheda prodotto: query recensioni senza LIMIT (MINORE)
- **File:** `app/product/[id]/page.tsx:116-126`.
- **Causa-radice:** recensioni caricate con doppio order ma senza `.limit()` → su prodotti molto recensiti si scarica tutto in un colpo.
- **Fix ESATTO:**
  ```diff
         const { data, error } = await supabase.from('reviews')
           .select('id, rating, comment, created_at, user_id, photo_urls, verified_purchase').eq('product_id', id)
           .order('verified_purchase', { ascending: false })
  -        .order('created_at', { ascending: false });
  +        .order('created_at', { ascending: false })
  +        .limit(20);
  ```
  aggiungere "Mostra altre recensioni" (paginazione keyset su `created_at`) e separare media/istogramma (già via `product_rating_stats`) dal contenuto testuale.
- **Misura attesa:** payload/tempo render costanti sui prodotti popolari (i più visitati).
- **Test/verifica:** mostra max 20 recensioni + "carica altre"; istogramma/media invariati (vengono dall'RPC).
- **Colore:** 🟡 · **Rischio&rollback:** basso → revert. **Dipendenze:** nessuna.

### P9 · Cron carrelli abbandonati: N+1 (MINORE)
- **File:** `app/api/cron/abandoned-carts/route.ts:37-46`.
- **Causa-radice:** per ogni candidato una `profiles.select('email_marketing').eq('id', c.user_id).single()` in serie (riga 41) + invio in serie.
- **Fix ESATTO:**
  1. Far ritornare il consenso dall'RPC (elimina la query per-candidato):
     `list_abandoned_carts_to_recover` deve includere `email_marketing` nella riga (modifica RPC → file DB, fuori range perf, annotato). Poi:
     ```diff
     -    const { data: prof } = await supa.from('profiles').select('email_marketing').eq('id', c.user_id).single();
     -    if (!prof?.email_marketing) { … }
     +    if (!c.email_marketing) { skipped++; await supa.rpc('mark_abandoned_cart_email_sent', { p_user: c.user_id }); continue; }
     ```
     In alternativa senza toccare l'RPC: **una** query `profiles.select('id, email_marketing').in('id', candidates.map(c=>c.user_id))` prima del loop e lookup da mappa.
  2. Invii con concorrenza limitata invece che seriali (es. `p-limit` a 5) mantenendo l'idempotenza (`mark_abandoned_cart_email_sent` dopo ogni successo).
- **Misura attesa:** da N+1 query a **1** (o N→1 batch); durata cron ~ tempo del batch parallelo, non somma dei RTT → meno rischio timeout serverless.
- **Test/verifica:** stesso numero di email inviate/skipped; nessuna doppia email (idempotenza preservata); tempo totale ↓.
- **Colore:** 🟡 codice (+ 🔴 se si modifica l'RPC) · **Rischio&rollback:** basso-medio → revert; mantenere il `mark_*` per idempotenza. **Dipendenze:** opzionale modifica RPC.

### P10 · Cron invio email: getUserById + update per riga, in serie (MINORE)
- **File:** `app/api/cron/send-emails/route.ts:100-140`.
- **Causa-radice:** loop con `profiles.select` (108), `auth.admin.getUserById` (117, Admin API di rete) e più update, tutti awaited in serie → latenza = somma dei RTT Admin API.
- **Fix ESATTO:**
  1. **Batch profili:** una query `profiles.select('id, full_name, email_marketing').in('id', batch.map(r=>r.user_id))` → mappa, invece di `.single()` per riga.
  2. **Evitare `getUserById` per-riga:** l'email è la cosa che manca. Se recuperabile in blocco (vista/`join` a `auth.users` via RPC service-role, o colonna email denormalizzata su profiles), fare **una** lookup batch. `auth.admin.getUserById` non supporta IN → preferibile una RPC service-role `emails_for_users(p_ids uuid[])` che ritorna `{id,email}` (file DB, annotato).
  3. **Concorrenza limitata** sugli invii (`p-limit`), mantenendo il claim atomico e gli update di stato per riga (idempotenza intatta).
- **Misura attesa:** latenza cron da O(Σ RTT) a O(max RTT batch) → **-70-90%** con 50 righe; niente timeout serverless.
- **Test/verifica:** sent/skipped/errors invariati; nessun doppio invio (claim atomico + sent_at); durata ↓ nel log.
- **Colore:** 🟡 codice (+ 🔴 nuova RPC email) · **Rischio&rollback:** medio (tocca un percorso con soldi/consenso) → mantenere idempotenza, revert facile. **Dipendenze:** RPC `emails_for_users` service-role.

### P11 · SRP: `ilike '%term%'` solo su name invece dell'FTS esistente (MINORE)
- **File:** `components/ProductGrid.tsx:95-98`.
- **Causa-radice:** la SRP filtra con `ilike('name', '%term%')` (solo `name`, `%…%` non usa indice) mentre esistono `search_tsv` (indicizzato) e l'RPC FTS `search_products_smart`, usata solo dall'autocomplete (`components/SearchBar.tsx:58`).
- **Fix ESATTO:** usare l'RPC FTS anche per la pagina risultati (allineata all'autocomplete), con LIMIT/paginazione — confluisce nella RPC `search_catalog` di P2 (che internamente usa `search_products_smart`/`search_tsv` per `p_search`). Rimuovere il ramo `ilike` (righe 95-98).
- **Misura attesa:** risultati più pertinenti (name+description+tags, ranking per rilevanza), query servita dall'indice tsvector invece di seq scan con LIKE.
- **Test/verifica:** ricerca multi-parola trova prodotti per descrizione/tag; parità con l'autocomplete; EXPLAIN mostra uso indice GIN.
- **Colore:** 🟡 (+ dipende dalla RPC di P2) · **Rischio&rollback:** medio → revert. **Dipendenze:** **si fonde con P2** (stessa RPC paginata).

---

## SEZIONE B — Fix DB LIVE (advisor performance, 236 lint)

| # | Advisor | File SQL | Colore | Stato |
|---|---------|----------|--------|-------|
| DB-A | 5 FK senza indice (unindexed_foreign_keys) | `sql/120_perf_fk_covering_indexes.sql` | 🔴 basso rischio | pronto da firmare |
| DB-B | 11 auth_rls_initplan | `sql/121_perf_rls_initplan_wrap_authuid.sql` | 🔴 (tocca RLS) | pronto, +validare @security |
| DB-C | 155 multiple_permissive_policies | `sql/122_perf_consolidate_permissive_policies_PROPOSAL.sql` | 🔴 PROPOSTA (file commentato) | strategia + 3 esempi, non auto-applica |
| DB-D | 64 unused_index | `sql/123_perf_unused_index_drops_PROPOSAL.sql` | 🔴 PROPOSTA (file commentato) | NON droppare ora |

**Tutti confermati sul DB live** (execute_sql read-only): i 5 FK hanno `has_index=false`; le 11 policy con `auth.uid()` nudo isolate da `pg_policies`; conteggio unused = 64 droppable (esclusi 37 UNIQUE + 28 PK).

- **DB-A (120):** additivo, idempotente (`IF NOT EXISTS`), reversibile (`DROP INDEX`). Se `order_items` è grande → variante `CONCURRENTLY` fuori transazione (nota nel file). **Misura:** join/lookup su quelle colonne da Seq→Index Scan; cascade delete non lockanti.
- **DB-B (121):** sostituisce `auth.uid()` → `(SELECT auth.uid())` in 11 policy, **logica invariata** (behavior-preserving). **Misura:** -1 valutazione funzione per riga scansionata su follows/review_helpful/wallet_ledger/product_variants/referrals/rider_reviews/store_reviews. Segnalata a WS-DB-RLS/@security una **tautologia pre-esistente** in `store_reviews` (`store_id = store_id`) preservata fedelmente (non è un bug introdotto qui).
- **DB-C (122):** consolidamento permissive → 1 policy per (ruolo, cmd) come OR dei predicati. Esempi pronti per `orders` (SELECT, 3→1), `products` (SELECT, elimina un duplicato esatto), `profiles` (SELECT, 3→1). File **commentato**: applicarlo è no-op finché WS-DB-RLS/@security non firmano.
- **DB-D (123):** DROP degli unused **rimandato**. Cautele: "unused" inaffidabile con stats giovani; NON droppare gli indici che coprono una FK (sono quelli che soddisfano l'advisor unindexed-FK) né quelli su percorsi soldi/idempotenza (stripe/checkout/payout). Candidati sicuri elencati solo su tabelle di osservabilità.

### Matrice di verifica RLS (dopo 121/eventuale 122)
Per ogni tabella toccata, come **proprietario** (accesso OK) e **estraneo** (accesso NEGATO):
`SET request.jwt.claims` con uid del proprietario → SELECT/INSERT deve riuscire; con uid estraneo → 0 righe / errore CHECK. Confronto conteggi PRIMA/DOPO su un utente reale: identici.

---

## Rollout & dipendenze (riepilogo)
1. **DB-A (120)** — subito dopo firma: sblocca gli indici per P2/P11.
2. **DB-B (121)** — firma + @security.
3. **Codice quick-win indipendenti:** P3, P5, P6, P7, P8, P9 (branch `perf/quick`).
4. **Refactor pesanti:** P1→P2→P11 (stessa RPC `search_catalog`, nuovo file DB 124 da assegnare) + P4 SSR (guida WS-FRONTEND).
5. **Cron:** P9, P10 (eventuali RPC service-role a supporto).
6. **Proposte 122/123:** rimandate a dopo, con @security e finestra di traffico reale.

**Non fatto qui (dipendenze aperte):** la RPC `search_catalog` (P2/P11), la modifica di `list_abandoned_carts_to_recover` (P9) e l'RPC `emails_for_users` (P10) sono **codice DB nuovo**, non lint advisor → vanno in un file migrazione fuori dal range 120-129 (assegnare a WS-DB / nuovo 124+) per non collidere con i range riservati.
