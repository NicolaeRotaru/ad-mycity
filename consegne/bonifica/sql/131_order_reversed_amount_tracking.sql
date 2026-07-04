-- 131_order_reversed_amount_tracking.sql
-- WS-MONEY · owner: backend-dev · 2026-07-04
--
-- FIX finding #1 (parte DB): reversal single-shot per ordine → claw-back cumulativo.
--
-- CAUSA RADICE: reverseOrderTransfer (lib/stripe/payout.ts:245-268) è no-op se
-- stripe_reversal_id è già presente (settato a QUALSIASI reversal, anche parziale) e
-- usa idempotencyKey per-ordine `reversal_<order.id>`. Un secondo rimborso parziale
-- NON storna la quota venditore corrispondente: la piattaforma non recupera il netto
-- del 2° rimborso. Manca una colonna che tracci QUANTO è già stato stornato.
--
-- SOLUZIONE: colonna orders.reversed_amount_cents (cumulativa). Il codice
-- (patch payout.ts) permette reversal multipli finché
-- SUM(reversal) <= seller_payout_cents, con idempotencyKey per OPERAZIONE (non per
-- ordine). Vincolo di coerenza: reversed_amount_cents non può superare il netto venditore.
--
-- Reversibile. Idempotente. Rollback in coda.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS reversed_amount_cents int NOT NULL DEFAULT 0;

-- Backfill coerente: gli ordini già portati a 'REVERSED' hanno avuto un reversal
-- pieno del netto venditore → allinea il cumulativo (evita di ri-stornarli).
UPDATE public.orders
   SET reversed_amount_cents = COALESCE(seller_payout_cents, 0)
 WHERE payout_status = 'REVERSED'
   AND reversed_amount_cents = 0
   AND COALESCE(seller_payout_cents, 0) > 0;

-- Vincolo di sicurezza: mai stornare più del netto versato al venditore.
-- (NOT VALID per non fallire su eventuali righe storiche incoerenti; validare a mano
--  dopo la verifica dei dati con: ALTER TABLE ... VALIDATE CONSTRAINT ...)
DO $$ BEGIN
  ALTER TABLE public.orders
    ADD CONSTRAINT orders_reversed_within_payout
    CHECK (reversed_amount_cents >= 0
           AND (seller_payout_cents IS NULL
                OR reversed_amount_cents <= seller_payout_cents)) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_reversed_within_payout;
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS reversed_amount_cents;
