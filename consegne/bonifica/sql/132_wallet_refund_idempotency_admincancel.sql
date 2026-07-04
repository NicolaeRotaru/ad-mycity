-- 132_wallet_refund_idempotency_admincancel.sql
-- WS-MONEY · owner: backend-dev · 2026-07-04
--
-- FIX finding #3 (parte DB): admin-cancel di ordine COD non pagato non stornava il
--     credito wallet. La patch a app/api/admin/orders/[id]/cancel/route.ts accredita
--     wallet_credit(reason='order_admin_canceled', ref='admin_cancel_<order>'). Questo
--     indice garantisce che un doppio annullo NON accrediti due volte (23505 = no-op).
--
-- Nota: mig.098 ha già l'indice per reason='cod_refund'. Qui aggiungiamo la stessa
-- protezione per i due reason usati dall'annullo COD, per completezza.
--
-- Solo indici (nessun cambio di logica DB) → NON bloccante per il deploy: senza
-- l'indice il codice funziona, solo senza la garanzia anti-doppio-accredito.
--
-- Reversibile. Idempotente.

CREATE UNIQUE INDEX IF NOT EXISTS wallet_ledger_admin_cancel_ref_idx
  ON public.wallet_ledger (ref)
  WHERE reason = 'order_admin_canceled';

-- 'order_cod_refund' è usato anche dallo storno di rollback in orders/cod (ref = order.id):
-- l'indice rende idempotente anche quel path (retry/doppia esecuzione).
CREATE UNIQUE INDEX IF NOT EXISTS wallet_ledger_cod_refund_rollback_ref_idx
  ON public.wallet_ledger (ref)
  WHERE reason = 'order_cod_refund';

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- DROP INDEX IF EXISTS public.wallet_ledger_admin_cancel_ref_idx;
-- DROP INDEX IF EXISTS public.wallet_ledger_cod_refund_rollback_ref_idx;
