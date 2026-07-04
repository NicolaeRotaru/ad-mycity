-- 114_subscription_orders_split_policies.sql
-- WS-DB-RLS · owner: security/backend-dev · 2026-07-04
--
-- FIX (MINORE) — subscription_orders: policy FOR ALL permette al seller di
--   UPDATE/DELETE le righe del buyer (write cross-tenant).
--   CAUSA RADICE: subscription_orders_owner_rw (030)
--     FOR ALL USING (auth.uid() = user_id OR auth.uid() = seller_id)
--   senza WITH CHECK dedicato → il seller può modificare items/total_cents/
--   delivery_address delle subscription del buyer (e viceversa). Tabella non
--   ancora cablata nell'app ma raggiungibile via PostgREST con la anon key.
--
-- FIX: separare le policy.
--   - SELECT: entrambi (owner del buyer e seller collegato) leggono.
--   - INSERT/UPDATE/DELETE: SOLO il proprietario (auth.uid() = user_id), con
--     WITH CHECK che impedisce di cambiare user_id. Il seller resta in sola lettura.
--
-- IDEMPOTENTE. REVERSIBILE (in coda).

BEGIN;

DROP POLICY IF EXISTS subscription_orders_owner_rw ON public.subscription_orders;

-- Lettura: buyer proprietario + seller collegato
DROP POLICY IF EXISTS subscription_orders_read ON public.subscription_orders;
CREATE POLICY subscription_orders_read ON public.subscription_orders
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = seller_id
  );

-- Scrittura: SOLO il proprietario buyer
DROP POLICY IF EXISTS subscription_orders_owner_insert ON public.subscription_orders;
CREATE POLICY subscription_orders_owner_insert ON public.subscription_orders
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS subscription_orders_owner_update ON public.subscription_orders;
CREATE POLICY subscription_orders_owner_update ON public.subscription_orders
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
             WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS subscription_orders_owner_delete ON public.subscription_orders;
CREATE POLICY subscription_orders_owner_delete ON public.subscription_orders
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- DROP le 4 policy sopra e ricreare:
-- CREATE POLICY subscription_orders_owner_rw ON public.subscription_orders
--   FOR ALL USING (auth.uid() = user_id OR auth.uid() = seller_id);
