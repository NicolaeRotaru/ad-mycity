-- 117_secdef_function_execute_lockdown.sql
-- WS-DB-RLS · owner: security · 2026-07-04
--
-- FIX advisor 0028/0029 (SECURITY DEFINER functions eseguibili da anon/authenticated).
--   TRIAGE per intenzionalità (verificato via pg_proc.has_function_privilege + corpo):
--
--   [REVOCA — non deve essere una RPC pubblica]
--     • admin_list_user_emails() : ritorna email/telefono di TUTTI gli auth.users.
--       Ha guardia interna is_admin() (un non-admin prende 42501), quindi non è un
--       leak; ma è chiamata SOLO server-side (admin client / service_role, che
--       bypassa i grant). Revocare EXECUTE da anon/authenticated chiude la
--       superficie RPC inutile (difesa in profondità). → REVOKE.
--
--   [RESTANO ESEGUIBILI — sono RPC VOLUTE, con authz interna per-oggetto]
--     • cancel_order / seller_reject_order / verify_pickup_code /
--       verify_delivery_code / rider_release_order / confirm_cod_remittance :
--       chiamate dal client dell'attore legittimo (buyer/seller/rider); ognuna
--       verifica auth.uid() vs owner/seller/rider dell'ordine e lo stato. Il WARN
--       0029 "signed-in può chiamarla" è ATTESO: l'autorizzazione è nel corpo.
--     • redeem_gift_card / convert_loyalty_to_credit : top-up wallet legittimo
--       dell'utente (unico canale di accredito ammesso, vedi 108). RESTANO.
--     • touch_loyalty_streak() : RPC check-in loyalty (lib/loyalty.ts). RESTA
--       (già esclusa in 106).
--
--   [DEVONO restare PUBBLICHE anche ad anon — analytics/vetrina]
--     • track_sponsored_impression / track_sponsored_click / track_story_view :
--       tracking dal client anonimo. RESTANO (anon+authenticated).
--     • store_follower_count / get_referral_leaderboard : conteggi/classifiche
--       pubbliche mostrate in vetrina. RESTANO (anon+authenticated).
--
--   [NON revocabili — referenziate dentro le RLS policy]
--     • is_admin() (usata in decine di policy) e is_rider() (111): il ruolo che
--       interroga DEVE poter eseguire la funzione durante la valutazione della
--       policy. Revocare EXECUTE da authenticated ROMPEREBBE l'intero strato RLS.
--       Il WARN 0028/0029 su is_admin è ACCETTATO: ritorna solo lo stato-admin del
--       chiamante (nessun dato di terzi). RESTANO eseguibili.
--
-- IDEMPOTENTE (REVOKE no-op se già assente). REVERSIBILE (GRANT in coda).

BEGIN;

REVOKE EXECUTE ON FUNCTION public.admin_list_user_emails() FROM anon, authenticated, PUBLIC;
-- (service_role e i chiamanti server con admin client continuano a funzionare:
--  service_role bypassa i grant EXECUTE.)

COMMIT;

-- ============================ ROLLBACK =====================================
-- GRANT EXECUTE ON FUNCTION public.admin_list_user_emails() TO authenticated;
