-- 133_rider_reversal_tracking.sql
-- WS-MONEY · owner: backend-dev · 2026-07-04
--
-- FIX finding #7 (OPZIONALE — decisione di business): compenso rider non recuperato
--     su rimborso pieno / chargeback.
--
-- CAUSA RADICE: su charge.refunded pieno e dispute lost l'ordine è annullato e la
-- quota venditore stornata (reverseOrderTransfer agisce su stripe_transfer_id), ma
-- nessun handler tocca rider_transfer_id: il transfer di shipping_cost già versato al
-- rider non viene mai revertito. Asimmetrico rispetto al claw-back venditore.
--
-- Questa migration prepara SOLO il tracciamento (colonna rider_reversal_id). L'attivazione
-- del claw-back rider è una PATCH di codice gated dietro decisione di Nicola (vedi
-- WS-MONEY.md · finding #7): storno rider = costo recuperato dalla piattaforma; oppure
-- si DOCUMENTA come costo accettato e non si tocca nulla lato Stripe.
--
-- Reversibile. Idempotente. Nessun effetto finché il codice non usa la colonna.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS rider_reversal_id text;

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS rider_reversal_id;
