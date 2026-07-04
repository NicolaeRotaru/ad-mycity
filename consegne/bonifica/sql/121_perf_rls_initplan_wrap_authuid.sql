-- =============================================================================
-- 121_perf_rls_initplan_wrap_authuid.sql
-- WS-PERF · advisor "auth_rls_initplan" (11 policy con auth.uid() NON avvolto)
-- Colore: 🔴 (DDL su DB live, tocca RLS → security-sensitive)
-- ⚠️ COORDINAMENTO: le RLS core sono di WS-DB-RLS (file 108-119). Questo file
--    NON riscrive la logica di autorizzazione: la lascia IDENTICA e si limita a
--    sostituire `auth.uid()` con `(SELECT auth.uid())`. È behavior-preserving.
--    Far validare a @security prima dell'apply.
-- Idempotente: DROP POLICY IF EXISTS + CREATE per ciascuna.
-- =============================================================================
--
-- CAUSA-RADICE: quando una policy usa `auth.uid()` "nudo", Postgres lo rivaluta
-- PER OGNI RIGA scansionata (initplan non estratto) → CPU sprecata sulle
-- tabelle grandi. Avvolgendolo in `(SELECT auth.uid())` il planner lo valuta
-- UNA volta e riusa il risultato (InitPlan) su tutte le righe. Le altre ~70
-- policy del DB usano già la forma avvolta: queste 11 erano rimaste indietro.
--
-- MISURA ATTESA: -1 valutazione di funzione per riga scansionata sulle query
-- filtrate da RLS su follows / review_helpful / wallet_ledger / product_variants
-- / referrals / rider_reviews / store_reviews. Nessun cambiamento di risultati.
--
-- RISCHIO&ROLLBACK: la logica booleana è invariata → l'accesso concesso/negato
-- resta identico. Rollback = ricreare le policy con `auth.uid()` nudo (sotto).
-- Test post-apply: SELECT/INSERT come utente proprietario deve funzionare, come
-- estraneo deve fallire (vedi WS-PERF.md §C per la matrice di verifica).
-- -----------------------------------------------------------------------------

-- ---- follows (user_id) ------------------------------------------------------
DROP POLICY IF EXISTS follows_select_own ON public.follows;
CREATE POLICY follows_select_own ON public.follows
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS follows_insert_own ON public.follows;
CREATE POLICY follows_insert_own ON public.follows
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS follows_delete_own ON public.follows;
CREATE POLICY follows_delete_own ON public.follows
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ---- review_helpful (user_id) ----------------------------------------------
DROP POLICY IF EXISTS review_helpful_select_own ON public.review_helpful;
CREATE POLICY review_helpful_select_own ON public.review_helpful
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS review_helpful_insert_own ON public.review_helpful;
CREATE POLICY review_helpful_insert_own ON public.review_helpful
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS review_helpful_delete_own ON public.review_helpful;
CREATE POLICY review_helpful_delete_own ON public.review_helpful
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ---- wallet_ledger (user_id) -----------------------------------------------
DROP POLICY IF EXISTS wallet_ledger_owner_read ON public.wallet_ledger;
CREATE POLICY wallet_ledger_owner_read ON public.wallet_ledger
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- ---- product_variants (via prodotto del venditore) -------------------------
DROP POLICY IF EXISTS product_variants_modify ON public.product_variants;
CREATE POLICY product_variants_modify ON public.product_variants
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.seller_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.seller_id = (SELECT auth.uid())));

-- ---- referrals (insert) ----------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can create referral" ON public.referrals;
CREATE POLICY "Authenticated users can create referral" ON public.referrals
  FOR INSERT WITH CHECK (
    (referred_id = (SELECT auth.uid())) AND (referrer_id <> referred_id));

-- ---- rider_reviews (insert) ------------------------------------------------
DROP POLICY IF EXISTS "Buyers can review their rider" ON public.rider_reviews;
CREATE POLICY "Buyers can review their rider" ON public.rider_reviews
  FOR INSERT WITH CHECK (
    (user_id = (SELECT auth.uid()))
    AND (rider_id <> (SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = rider_reviews.order_id
        AND orders.user_id = (SELECT auth.uid())
        AND orders.rider_id = rider_reviews.rider_id
        AND orders.delivery_status = 'DELIVERED'::text));

-- ---- store_reviews (insert) ------------------------------------------------
-- NB: preservo fedelmente l'espressione ORIGINALE, inclusa la tautologia
-- `(store_reviews.store_id = store_reviews.store_id)` già presente in produzione
-- (pre-esistente, NON introdotta qui). Segnalata a WS-DB-RLS/@security come
-- possibile bug logico da correggere in un file RLS dedicato — fuori scope perf.
DROP POLICY IF EXISTS "Buyers can review delivered orders" ON public.store_reviews;
CREATE POLICY "Buyers can review delivered orders" ON public.store_reviews
  FOR INSERT WITH CHECK (
    (user_id = (SELECT auth.uid()))
    AND (store_id <> (SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = store_reviews.order_id
        AND orders.user_id = (SELECT auth.uid())
        AND (store_reviews.store_id = store_reviews.store_id)
        AND orders.delivery_status = 'DELIVERED'::text));

-- =============================================================================
-- ROLLBACK: ripetere i DROP POLICY IF EXISTS qui sopra e ricreare le stesse
-- policy usando `auth.uid()` senza il wrapping SELECT (stato pre-migrazione).
-- =============================================================================
