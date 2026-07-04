-- 135_pickup_in_store_delivery_transition.sql
--
-- FIX BLOCCANTE (WS-QA / B6): gli ordini "Ritiro in negozio" (pickup_in_store)
-- non raggiungono MAI delivery_status='DELIVERED' → payout venditore congelato
-- per sempre (card: HELD eterno; COD: AWAITING_REMITTANCE eterno) + ordine in limbo.
--
-- Causa-radice: l'UNICA transizione verso DELIVERED è verify_delivery_code (RPC del
-- RIDER: richiede rider_id=auth.uid() e stato PICKED_UP/OUT_FOR_DELIVERY, migr.061:230).
-- Il ritiro in negozio non ha rider: l'ordine si ferma a READY.
--
-- Modello di settlement scelto (owner QA, coerente con 097 COD):
--   • Il CLIENTE ritira in negozio e mostra al venditore il proprio CODICE DI CONSEGNA
--     (order_delivery_codes, già generato all'INSERT dell'ordine da migr.016).
--   • Il VENDITORE inserisce il codice → RPC seller_confirm_pickup → DELIVERED.
--   • Ordine CARD: payout_status resta 'HELD' → il cron release-payouts paga il
--     venditore normalmente (l'escrow è della piattaforma). Nessun cambio necessario.
--   • Ordine COD-pickup: il negozio incassa i contanti DIRETTAMENTE dal cliente
--     (nessun rider, nessuna rimessa). Quindi NON è dovuto alcun transfer
--     piattaforma→venditore: payout_status='STORE_COLLECTED' (stato terminale).
--     La COMMISSIONE piattaforma sull'ordine COD-pickup diventa un CREDITO verso il
--     negozio da riconciliare a parte (→ vedi WS-MONEY / contabilità: settlement fee).
--
-- Idempotente (CREATE OR REPLACE, drop+recreate del CHECK come 097/081).

-- =========================================================
-- 1) payout_status: aggiungi 'STORE_COLLECTED' (terminale COD-pickup)
-- =========================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payout_status_check') THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_payout_status_check;
  END IF;
END$$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payout_status_check
  CHECK (payout_status IN (
    'PENDING',
    'HELD',
    'PROCESSING',
    'TRANSFERRED',
    'REFUNDED',
    'FAILED',
    'PENDING_SELLER_ONBOARDING',
    'REVERSED',
    'AWAITING_REMITTANCE',
    'STORE_COLLECTED'
  ));

-- =========================================================
-- 2) RPC: il VENDITORE conferma il ritiro in negozio col codice del cliente
--    SECURITY DEFINER → imposta il flag mycity.allow_order_write per bypassare
--    il trigger enforce_order_update_rules (migr.061) sulle colonne protette.
-- =========================================================
CREATE OR REPLACE FUNCTION public.seller_confirm_pickup(p_order_id uuid, p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := (SELECT auth.uid());
  v_seller_id uuid;
  v_buyer_id  uuid;
  v_status    text;
  v_pickup    boolean;
  v_rider     uuid;
  v_method    text;
  stored_code text;
BEGIN
  PERFORM set_config('mycity.allow_order_write', '1', true);

  SELECT seller_id, user_id, delivery_status, pickup_in_store, rider_id, payment_method
    INTO v_seller_id, v_buyer_id, v_status, v_pickup, v_rider, v_method
  FROM public.orders WHERE id = p_order_id;

  IF v_seller_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'ORDER_NOT_FOUND');
  END IF;
  IF v_seller_id <> uid THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'NOT_SELLER');
  END IF;
  IF v_pickup IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'NOT_PICKUP_ORDER');
  END IF;
  IF v_rider IS NOT NULL THEN
    -- Un rider ha (erroneamente) preso in carico un ordine di ritiro: non è più
    -- un flusso di ritiro pulito → blocca e chiedi intervento (staff).
    RETURN jsonb_build_object('ok', false, 'reason', 'HAS_RIDER');
  END IF;
  IF v_status <> 'READY' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'WRONG_STATUS', 'status', v_status);
  END IF;

  -- Codice = codice di CONSEGNA del cliente (lo mostra al ritiro). Prova che è il
  -- cliente giusto a ritirare, simmetrico alla consegna del rider.
  SELECT code INTO stored_code FROM public.order_delivery_codes WHERE order_id = p_order_id;
  IF stored_code IS NULL OR stored_code <> trim(p_code) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'WRONG_CODE');
  END IF;

  UPDATE public.order_delivery_codes SET verified_at = now() WHERE order_id = p_order_id;

  IF lower(coalesce(v_method, '')) IN ('cod', 'cash') THEN
    -- COD-pickup: il negozio ha incassato i contanti direttamente. Nessun
    -- transfer piattaforma→venditore. Commissione = credito da riconciliare (WS-MONEY).
    UPDATE public.orders
      SET delivery_status = 'DELIVERED', delivered_at = now(), payout_status = 'STORE_COLLECTED'
    WHERE id = p_order_id;
  ELSE
    -- CARD-pickup: escrow della piattaforma. Lascia payout_status invariato ('HELD')
    -- così il cron release-payouts paga il venditore come per gli ordini a domicilio.
    UPDATE public.orders
      SET delivery_status = 'DELIVERED', delivered_at = now()
    WHERE id = p_order_id;
  END IF;

  INSERT INTO public.notifications (user_id, title, body, link) VALUES
    (v_buyer_id,  '✅ Ordine ritirato',
       'Hai ritirato il tuo ordine in negozio. Grazie!',
       '/orders/' || p_order_id),
    (v_seller_id, '✅ Ritiro confermato',
       'Hai consegnato l''ordine al cliente in negozio.',
       '/seller/orders/' || p_order_id);

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.seller_confirm_pickup(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seller_confirm_pickup(uuid, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
