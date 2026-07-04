-- 130_coupon_atomic_claim_and_redemptions.sql
-- WS-MONEY · owner: backend-dev · 2026-07-04
--
-- FIX finding #4 (TOCTOU coupon: max_uses / first_order_only aggirabili in concorrenza)
--     + finding #5 (increment_coupon_usage non idempotente su retry webhook).
--
-- CAUSA RADICE: validateCoupon (lib/coupons.ts) legge uses_count/ordini in fase di
-- validazione, ma l'incremento (increment_coupon_usage) avviene DOPO — tra i due
-- non esiste ancora nessun ordine, quindi N checkout paralleli con lo stesso codice
-- passano tutti la validazione e applicano tutti lo sconto. Nessun claim atomico né
-- vincolo unico di redemption per (coupon,user). increment_coupon_usage (mig.058) è
-- un semplice UPDATE +1 senza cap enforced e senza idempotenza per-checkout.
--
-- SOLUZIONE: claim ATOMICO con vincolo DB.
--   - tabella coupon_redemptions con UNIQUE(coupon_id, ref)  → idempotenza per checkout
--     (ref = pending_checkout_id per carta, ref applicativo per COD): un retry NON
--     ri-incrementa.
--   - UNIQUE parziale (coupon_id, user_id) WHERE first_order_only → backstop hard: un
--     utente non può usare due volte un coupon "solo primo ordine", nemmeno in race.
--   - claim_coupon(): lock FOR UPDATE del coupon (serializza i claim concorrenti sullo
--     stesso codice) + UPDATE condizionale con cap `... AND (max_uses IS NULL OR
--     uses_count < max_uses) RETURNING` → solo chi aggiorna 1 riga ha il diritto.
--   - release_coupon(): storno su checkout fallito/scaduto (rilascia il claim).
--
-- Il chiamante applicativo (checkout/route.ts, orders/cod/route.ts) chiama claim_coupon
-- PRIMA di dare lo sconto (Stripe Session / total_price COD) e release_coupon sui path
-- di fallimento. Il webhook NON incrementa più (il claim è già avvenuto al checkout).
--
-- Reversibile. Idempotente (IF NOT EXISTS / OR REPLACE). Rollback in coda al file.

-- =============================================================================
-- 1. Tabella di redemption (una riga per uso "impegnato" di un coupon)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id         uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id           uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ref               text NOT NULL,              -- pending_checkout_id (carta) / ref COD
  first_order_only  boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Idempotenza per checkout: lo stesso ref non consuma due volte (retry webhook safe).
CREATE UNIQUE INDEX IF NOT EXISTS coupon_redemptions_ref_idx
  ON public.coupon_redemptions (coupon_id, ref);

-- Backstop hard "solo primo ordine": max una redemption per (coupon,user).
CREATE UNIQUE INDEX IF NOT EXISTS coupon_redemptions_user_first_order_idx
  ON public.coupon_redemptions (coupon_id, user_id)
  WHERE first_order_only;

CREATE INDEX IF NOT EXISTS coupon_redemptions_user_idx
  ON public.coupon_redemptions (user_id);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coupon_redemptions_owner_read ON public.coupon_redemptions;
CREATE POLICY coupon_redemptions_owner_read ON public.coupon_redemptions
  FOR SELECT USING (auth.uid() = user_id);
-- Nessuna policy di scrittura: si scrive solo via claim_coupon (SECURITY DEFINER).

-- =============================================================================
-- 2. claim_coupon — riserva atomica di un uso
-- =============================================================================
-- Ritorna jsonb {ok:boolean, reason?:text, idempotent?:boolean}.
--   ok=true               → uso riservato (o già riservato per lo stesso ref).
--   ok=false reason=...    → invalid | exhausted | first_order_used | race.
-- Il chiamante applica lo sconto SOLO se ok=true.
CREATE OR REPLACE FUNCTION public.claim_coupon(p_code text, p_user uuid, p_ref text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_updated int;
BEGIN
  IF p_ref IS NULL OR btrim(p_ref) = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_ref');
  END IF;

  -- Lock della riga coupon: serializza tutti i claim concorrenti sullo stesso codice.
  SELECT * INTO v_coupon
    FROM public.coupons
   WHERE code = upper(btrim(p_code)) AND active = true
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  -- Scadenza (coerente con validateCoupon).
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  -- Idempotenza per checkout: stesso ref già impegnato → no-op success.
  IF EXISTS (
    SELECT 1 FROM public.coupon_redemptions
     WHERE coupon_id = v_coupon.id AND ref = p_ref
  ) THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  -- first_order_only: un solo uso per utente (check + vincolo unico più sotto).
  IF v_coupon.first_order_only AND p_user IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.coupon_redemptions
       WHERE coupon_id = v_coupon.id AND user_id = p_user
    ) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'first_order_used');
    END IF;
  END IF;

  -- Claim atomico del cap: solo chi aggiorna 1 riga ha diritto all'uso.
  UPDATE public.coupons
     SET uses_count = COALESCE(uses_count, 0) + 1
   WHERE id = v_coupon.id
     AND (max_uses IS NULL OR COALESCE(uses_count, 0) < max_uses);
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'exhausted');
  END IF;

  -- Registra la redemption. I vincoli unici (ref, user first_order) sono il backstop
  -- hard: una violazione qui fa rollback dell'intera funzione (RPC = 1 transazione),
  -- quindi l'incremento uses_count viene annullato.
  INSERT INTO public.coupon_redemptions (coupon_id, user_id, ref, first_order_only)
  VALUES (v_coupon.id, p_user, p_ref, COALESCE(v_coupon.first_order_only, false));

  RETURN jsonb_build_object('ok', true);
EXCEPTION
  WHEN unique_violation THEN
    -- Race sull'indice (ref concorrente o per-user first_order): trattato come non
    -- riservabile. L'UPDATE uses_count è annullato dal rollback della funzione.
    RETURN jsonb_build_object('ok', false, 'reason', 'race');
END;
$$;

-- =============================================================================
-- 3. release_coupon — storno del claim (checkout fallito / scaduto / annullato)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.release_coupon(p_ref text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_cid uuid;
BEGIN
  IF p_ref IS NULL OR btrim(p_ref) = '' THEN RETURN; END IF;
  -- Rimuove la/e redemption di questo ref e decrementa il cap corrispondente.
  FOR v_cid IN
    DELETE FROM public.coupon_redemptions WHERE ref = p_ref RETURNING coupon_id
  LOOP
    UPDATE public.coupons
       SET uses_count = GREATEST(0, COALESCE(uses_count, 0) - 1)
     WHERE id = v_cid;
  END LOOP;
END;
$$;

-- =============================================================================
-- 4. Permessi: solo il backend (service_role) claim/release. Mai il client.
-- =============================================================================
REVOKE ALL ON FUNCTION public.claim_coupon(text, uuid, text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_coupon(text)           FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_coupon(text, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_coupon(text)           TO service_role;

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- ROLLBACK (eseguire manualmente per annullare la migration)
-- =============================================================================
-- DROP FUNCTION IF EXISTS public.claim_coupon(text, uuid, text);
-- DROP FUNCTION IF EXISTS public.release_coupon(text);
-- DROP TABLE IF EXISTS public.coupon_redemptions;   -- ATTENZIONE: perde lo storico redemption
-- NB: increment_coupon_usage (mig.058) resta in piedi per retro-compatibilità: il
--     codice applicativo smette solo di chiamarlo. Nessun dato perso al rollback del
--     codice (i claim restano coerenti perché uses_count è comunque incrementato).
