-- 115_coupons_no_public_enum.sql
-- WS-DB-RLS · owner: security/backend-dev · 2026-07-04
--
-- FIX (MINORE) — coupons: lettura pubblica dell'intera tabella → enumerazione.
--   CAUSA RADICE: policy "Anyone can read active coupons" (014) USING (active=true)
--   espone a chiunque (anon) code/type/value/min_subtotal/first_order_only di
--   TUTTI i coupon attivi (`select * from coupons where active=true`). Un utente
--   enumera e usa anche codici riservati/mirati → erosione margini.
--
-- FIX: rimuovere la SELECT pubblica sulla tabella e validare per codice PUNTUALE
--   via RPC SECURITY DEFINER lookup_coupon_by_code(p_code) che ritorna SOLO la
--   riga del codice richiesto (nessuna enumerazione possibile). La logica di
--   validazione (scadenza/max_uses/min_subtotal/first_order_only/sconto) resta in
--   lib/coupons.ts: cambia SOLO la sorgente della riga.
--
-- MIGRAZIONE CODICE RICHIESTA (accompagna il deploy, vedi WS-DB-RLS.md §Coupons):
--   lib/coupons.ts — sostituire
--     const { data: coupon } = await client.from('coupons')
--        .select('*').eq('code', trimmed).eq('active', true).maybeSingle();
--   con
--     const { data: rows } = await client.rpc('lookup_coupon_by_code', { p_code: trimmed });
--     const coupon = Array.isArray(rows) ? rows[0] : rows;
--   (admin CRUD su coupons resta invariato: la policy "Admins can manage coupons"
--    di 014 copre già SELECT/INSERT/UPDATE/DELETE per gli admin.)
--
-- COORDINAMENTO WS-MONEY: il claim atomico resta claim_coupon/release_coupon (130,
--   già fatto). Questa RPC è SOLO la lettura di validazione — nessuna sovrapposizione.
--
-- IDEMPOTENTE. REVERSIBILE (in coda).

BEGIN;

-- 1) Niente più enumerazione: via la SELECT pubblica
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;

-- 2) Lookup puntuale per codice (una sola riga, attiva)
CREATE OR REPLACE FUNCTION public.lookup_coupon_by_code(p_code text)
RETURNS SETOF public.coupons
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.coupons
  WHERE code = upper(trim(p_code))
    AND active = true
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_coupon_by_code(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.lookup_coupon_by_code(text) TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- DROP FUNCTION IF EXISTS public.lookup_coupon_by_code(text);
-- CREATE POLICY "Anyone can read active coupons" ON public.coupons
--   FOR SELECT USING (active = true);
