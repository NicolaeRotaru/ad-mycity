-- 113_messages_body_freeze.sql
-- WS-DB-RLS · owner: security/backend-dev · 2026-07-04
--
-- FIX (MINORE) — messages_update_read consente al destinatario di riscrivere il
--   body dei messaggi altrui.
--   CAUSA RADICE: la policy UPDATE su messages (026) usa solo USING (partecipante
--   della conversazione), senza WITH CHECK né limiti di colonna. Un partecipante
--   — incluso il destinatario — può UPDATE qualsiasi colonna (incluso body) dei
--   messaggi inviati dall'altra parte. Il commento "mai modificare body" non è
--   enforced.
--
-- FIX: trigger BEFORE UPDATE. Per un utente diverso dal sender consente SOLO la
--   modifica di read_at e congela body/sender_id/conversation_id/created_at. Il
--   sender può correggere il proprio messaggio ma non può falsificare sender_id/
--   conversation_id/created_at. Le scritture server (service_role) e le RPC fidate
--   (es. process-deletions che anonimizza il body) restano libere.
--
-- IDEMPOTENTE. REVERSIBILE (in coda).

BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_message_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := (SELECT auth.uid());
  is_priv boolean := public.is_admin()
    OR coalesce((SELECT auth.jwt() ->> 'role'), '') = 'service_role';
BEGIN
  IF is_priv THEN
    RETURN NEW;
  END IF;

  -- Chiavi/identità immutabili per chiunque non sia staff
  IF NEW.sender_id       IS DISTINCT FROM OLD.sender_id
  OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
  OR NEW.created_at      IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'messages: campo immutabile' USING ERRCODE = '42501';
  END IF;

  -- Un utente diverso dal mittente può toccare SOLO read_at
  IF uid IS DISTINCT FROM OLD.sender_id
     AND NEW.body IS DISTINCT FROM OLD.body THEN
    RAISE EXCEPTION 'messages: solo il mittente può modificare il testo' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_message_update ON public.messages;
CREATE TRIGGER trg_enforce_message_update
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_message_update_rules();

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- DROP TRIGGER IF EXISTS trg_enforce_message_update ON public.messages;
-- DROP FUNCTION IF EXISTS public.enforce_message_update_rules();
