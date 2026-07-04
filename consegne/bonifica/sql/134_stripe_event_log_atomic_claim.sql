-- 134_stripe_event_log_atomic_claim.sql
-- WS-MONEY · owner: backend-dev · 2026-07-04
--
-- FIX finding #5 (parte event-level): l'idempotenza del webhook (insert su
--     stripe_event_log + rilettura di processed) NON è protetta da lock. Due consegne
--     CONCORRENTI dello stesso event.id possono entrambe vedere processed=false e
--     processare in parallelo (Stripe ritenta in fretta / delivery duplicata).
--
-- SOLUZIONE: claim atomico. Aggiunge processing_started_at; il webhook fa un UPDATE
-- condizionale che concede il diritto di processare a UN solo worker
-- (WHERE processed=false AND (processing_started_at IS NULL OR è "stale")). Chi non
-- vince salta (l'altro sta processando / ha già processato). Lo stale-timeout (5 min)
-- evita che un worker morto blocchi per sempre l'evento.
--
-- Reversibile. Idempotente. Rollback in coda.

ALTER TABLE public.stripe_event_log
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz;

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- ALTER TABLE public.stripe_event_log DROP COLUMN IF EXISTS processing_started_at;
