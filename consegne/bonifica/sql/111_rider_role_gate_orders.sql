-- 111_rider_role_gate_orders.sql
-- WS-DB-RLS · owner: security/backend-dev · 2026-07-04
--
-- FIX (GRAVE) — Policy ordini "rider" senza controllo di ruolo → PII di consegna
--   dei clienti leggibile da QUALSIASI utente autenticato.
--   CAUSA RADICE: la policy SELECT "Riders can view available and own orders" (019)
--     USING ((delivery_status IN ('ACCEPTED','READY') AND rider_id IS NULL)
--            OR rider_id = auth.uid())
--   e la gemella UPDATE "Riders can update assigned or claim free orders" (011)
--     USING (rider_id = auth.uid() OR (delivery_status='READY' AND rider_id IS NULL))
--   NON verificano role='rider' né is_approved. Essendo in OR con le policy di
--   buyer/seller/admin, ogni utente autenticato (anche un buyer) legge tutti gli
--   ordini ACCEPTED/READY non assegnati: delivery_full_name, delivery_phone,
--   delivery_address, delivery_lat/lng, total_price, user_id. E può "claimare"
--   ordini READY (disturbo operativo).
--
-- FIX: gate di ruolo con helper is_rider() STABLE SECURITY DEFINER (evita
--   ricorsione RLS su profiles) applicato al disgiunto "pool ordini" sia in
--   SELECT sia in UPDATE. Il ramo "propri ordini" (rider_id = auth.uid()) resta.
--   Il trigger enforce_order_update_rules (061) continua a validare la transizione
--   di claim; questa policy chiude la VISIBILITÀ a monte.
--
-- IDEMPOTENTE. REVERSIBILE (in coda).

BEGIN;

-- Helper: l'utente corrente è un rider approvato?
CREATE OR REPLACE FUNCTION public.is_rider()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'rider'
      AND is_approved = true
  );
$$;
-- is_rider() è referenziata dalle policy: DEVE restare eseguibile dal ruolo che
-- interroga (authenticated). Ritorna solo il proprio stato-ruolo → nessun leak.
REVOKE EXECUTE ON FUNCTION public.is_rider() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_rider() TO authenticated;

-- SELECT: pool ordini visibile SOLO ai rider approvati
DROP POLICY IF EXISTS "Riders can view available and own orders" ON public.orders;
CREATE POLICY "Riders can view available and own orders"
  ON public.orders FOR SELECT
  USING (
    (delivery_status IN ('ACCEPTED', 'READY') AND rider_id IS NULL AND public.is_rider())
    OR rider_id = (SELECT auth.uid())
  );

-- UPDATE: claim del pool SOLO ai rider approvati
DROP POLICY IF EXISTS "Riders can update assigned or claim free orders" ON public.orders;
CREATE POLICY "Riders can update assigned or claim free orders"
  ON public.orders FOR UPDATE
  USING (
    rider_id = (SELECT auth.uid())
    OR (delivery_status = 'READY' AND rider_id IS NULL AND public.is_rider())
  );

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- Ripristinare le due policy senza `AND public.is_rider()` (definizioni 019/011).
-- DROP FUNCTION IF EXISTS public.is_rider();
