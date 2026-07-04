-- 116_rls_no_policy_tables.sql
-- WS-DB-RLS · owner: security · 2026-07-04
--
-- FIX advisor 0008 (rls_enabled_no_policy, 9 tabelle, level INFO).
--   Tabelle con RLS abilitata ma ZERO policy: cron_heartbeats, email_queue,
--   kpi_snapshots, merchants_leads, operational_alert_log, outreach_events,
--   stripe_event_log, telegram_chats, uptime_checks.
--   CAUSA: sono tabelle di backend/ops scritte e lette SOLO dal service_role
--   (cron, webhook, admin con getAdminSupabase — che bypassa RLS). Con RLS ON e
--   nessuna policy, anon/authenticated già ricevono 0 righe (deny implicito):
--   NON è una vulnerabilità, ma l'assenza di policy esplicita è un rischio latente
--   (una GRANT futura o un cambio di postura le aprirebbe). Codifichiamo
--   deny-by-default in modo esplicito + osservabilità admin.
--
-- FIX: per ciascuna tabella una sola policy di SOLA LETTURA per gli admin
--   (public.is_admin()). Nessuna policy di scrittura per i client: INSERT/UPDATE/
--   DELETE restano esclusiva del service_role (che bypassa RLS). Deny-by-default
--   per buyer/seller/rider/anon confermato ed esplicito.
--
-- NB confidenza: verificato che queste tabelle NON sono lette da client anon/
--   authenticated (accesso solo via route server/cron con admin client). Se una
--   dovesse servire a un client, sostituire la policy admin con quella scoped.
--
-- IDEMPOTENTE. REVERSIBILE (DROP delle policy).

BEGIN;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'cron_heartbeats','email_queue','kpi_snapshots','merchants_leads',
    'operational_alert_log','outreach_events','stripe_event_log',
    'telegram_chats','uptime_checks'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t||'_admin_read', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT USING (public.is_admin())',
        t||'_admin_read', t
      );
    END IF;
  END LOOP;
END $$;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- Per ogni tabella: DROP POLICY IF EXISTS <tab>_admin_read ON public.<tab>;
