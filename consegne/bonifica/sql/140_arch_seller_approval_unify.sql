-- 140: ARCH B4 — unifica l'approvazione venditore su UNA sola fonte di verità
--
-- PROBLEMA (bloccante, findings.architettura[0]):
--   handle_new_user (ultima ridefinizione del corpo in 015_competitive_moats.sql:143-151)
--   imposta is_approved = (role_choice IN ('seller','rider')) -> un self-signup
--   "Venditore"/"Rider" nasce GIÀ approvato (is_approved=TRUE) e pubblica prodotti
--   LIVE / accede ai flussi senza review né KYC. Il flusso curato /sell fa invece
--   is_approved=false, approval_status='pending' (app/sell/page.tsx:71-73): due fonti
--   di verità incoerenti.
--
-- FIX: allineare handle_new_user al flusso /sell. Nessun nuovo utente nasce mai
--   approvato. is_approved resta la colonna di ENFORCEMENT (letta da RLS
--   082/023, middleware.ts, withSellerAuth) e viene messa a TRUE SOLO dallo staff
--   via /api/admin/users/[id]/moderate (che setta anche approval_status='approved',
--   approved_at/by): le due colonne restano quindi sempre in sync, con la sola
--   eccezione — ora rimossa — di handle_new_user. approval_status resta lo stato
--   leggibile ('pending'|'approved'|'rejected'|'suspended').
--
-- IDEMPOTENTE: CREATE OR REPLACE FUNCTION.
--
-- ⚠️ search_path: 059_security_audit_rpc_lockdown.sql:22 ha fissato
--   `ALTER FUNCTION public.handle_new_user() SET search_path = public`.
--   CREATE OR REPLACE azzera le SET-clause preesistenti -> le RI-dichiariamo qui
--   per NON perdere l'hardening anti schema-injection.
--
-- DIPENDENZE / COORDINAMENTO:
--   - WS-DB-RLS possiede enforce_profile_update_rules (061:25-73). Questo file NON
--     lo tocca. Da aggiungere là (vedi WS-ARCH.md §B4-trigger): bloccare per i non
--     privilegiati i passaggi role -> 'seller'/'rider' via UPDATE e qualsiasi
--     modifica di is_approved (oggi blocca solo false->true), così l'unificazione
--     regge anche sul canale UPDATE, non solo sull'INSERT del trigger.
--   - Frontend: rimuovere l'opzione "Venditore" dal signup diretto
--     (app/sign-up/page.tsx) — diff in WS-ARCH.md. Il rider resta selezionabile ma
--     nasce comunque NON approvato (staff-gated).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    role_choice text;
BEGIN
    role_choice := COALESCE(new.raw_user_meta_data->>'role', 'buyer');
    INSERT INTO public.profiles (id, role, is_approved, approval_status, referral_code)
    VALUES (
        new.id,
        CASE
          WHEN role_choice = 'seller' THEN 'seller'
          WHEN role_choice = 'rider'  THEN 'rider'
          ELSE 'buyer'
        END,
        -- MAI auto-approvati: fonte di verità unica. L'approvazione è un atto
        -- esclusivo dello staff (moderate route), che setta is_approved + approval_status insieme.
        false,
        -- 'pending' per chi richiede un ruolo operativo (seller/rider) da approvare;
        -- 'approved' per il buyer, che non ha nulla da approvare (nessun gate lo usa).
        CASE WHEN role_choice IN ('seller', 'rider') THEN 'pending' ELSE 'approved' END,
        upper(substr(md5(new.id::text), 1, 8))
    );
    RETURN new;
END;
$$;

-- Nota: il trigger `on_auth_user_created` (definito nelle migrazioni iniziali) che
-- richiama handle_new_user NON va ridichiarato: CREATE OR REPLACE aggiorna il corpo
-- in-place mantenendo il trigger esistente agganciato.
