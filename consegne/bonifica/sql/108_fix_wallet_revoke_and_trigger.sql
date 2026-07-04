-- 108_fix_wallet_revoke_and_trigger.sql
-- WS-DB-RLS · owner: security/backend-dev · 2026-07-04
--
-- FIX B1 (BLOCCANTE) — Auto-accredito illimitato del wallet.
--   CAUSA RADICE: profiles.wallet_balance_cents (087) non ha REVOKE UPDATE per
--   authenticated/anon; la policy "Users can update their own profile" (001) è
--   USING (auth.uid()=id) senza WITH CHECK né limiti di colonna; il trigger
--   enforce_profile_update_rules (061) congela role/is_approved/stripe_/kyc_ ma
--   NON wallet_balance_cents. Unico vincolo residuo: CHECK(>=0). Quindi un buyer
--   con la sola anon key può fare
--     supabase.from('profiles').update({wallet_balance_cents: 100000000}).eq('id', self)
--   e spendere il credito (app/api/orders/cod/route.ts → wallet_debit).
--
-- FIX (doppia barriera, deny-by-default):
--   1) REVOKE UPDATE (wallet_balance_cents) ON profiles FROM authenticated, anon
--      → PostgREST non può più scrivere quella colonna con la anon key.
--   2) Congelamento in enforce_profile_update_rules: per un utente NON privilegiato
--      qualsiasi variazione di wallet_balance_cents → RAISE 42501.
--   Le scritture legittime restano SOLO via RPC SECURITY DEFINER _wallet_apply
--   (redeem_gift_card / convert_loyalty_to_credit / wallet_debit / wallet_credit),
--   che girano come definer e bypassano sia il grant di colonna sia il trigger.
--
-- Questo file è ANCHE l'UNICA definizione coerente di enforce_profile_update_rules:
--   riscrive il trigger di 061 mantenendo TUTTE le sue protezioni e aggiungendo il
--   freeze del wallet. Vedi §COORDINAMENTO per role/is_approved/public_profile_enabled.
--
-- COORDINAMENTO:
--   - WS-ARCH/140 tocca SOLO handle_new_user (INSERT). NON tocca questo trigger →
--     nessun conflitto. 140 e 108 sono indipendenti; ordine libero.
--   - WS-ARCH aveva chiesto di bloccare qui anche role->'seller'/'rider' su UPDATE.
--     NON lo facciamo: app/sell/page.tsx e app/rider/onboarding fanno un UPDATE
--     CLIENT che imposta role='seller'/'rider' con is_approved=false,
--     approval_status='pending' (candidatura self-service, comportamento VOLUTO di
--     061). Bloccarlo romperebbe l'onboarding e NON aggiunge sicurezza: un
--     seller/rider non approvato è già inerte (tutti i gate leggono is_approved).
--     Manteniamo quindi l'allowance di 061 e IN PIÙ blocchiamo QUALSIASI modifica
--     di is_approved da parte del non-privilegiato (061 bloccava solo false->true).
--   - public_profile_enabled NON viene congelato qui: il leak che motivava il freeze
--     è chiuso alla radice in 110 (DROP policy "Public profile read" + vista
--     whitelisted public_profiles). Congelarlo romperebbe PublicProfileToggle
--     (self-service legittimo dell'owner). Vedi WS-DB-RLS.md §B1/§Over-grant.
--
-- IDEMPOTENTE: CREATE OR REPLACE + REVOKE (no-op su grant assenti).
-- REVERSIBILE: GRANT UPDATE(wallet_balance_cents) ... + ripristino corpo 061.

BEGIN;

-- 1) Blocco a livello di privilegio di colonna (PostgREST)
REVOKE UPDATE (wallet_balance_cents) ON public.profiles FROM authenticated, anon;

-- 2) Trigger unico e coerente (superset di 061 + freeze wallet)
CREATE OR REPLACE FUNCTION public.enforce_profile_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_priv boolean := public.is_admin()
    OR coalesce((SELECT auth.jwt() ->> 'role'), '') = 'service_role'
    OR coalesce(current_setting('mycity.allow_profile_write', true), '') = '1';
BEGIN
  IF is_priv THEN
    RETURN NEW;
  END IF;

  -- [061] Vietato auto-promuoversi admin
  IF NEW.role = 'admin' AND OLD.role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'profiles: cambio ruolo riservato allo staff' USING ERRCODE = '42501';
  END IF;

  -- [061+108] is_approved: nessun cambio da parte del non-privilegiato
  --           (061 bloccava solo false->true; ora blocchiamo QUALSIASI variazione)
  IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
    RAISE EXCEPTION 'profiles: approvazione riservata allo staff' USING ERRCODE = '42501';
  END IF;

  -- [061] approval_status: l'utente può solo richiedere ('pending')
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status
     AND coalesce(NEW.approval_status, '') NOT IN ('pending', '') THEN
    RAISE EXCEPTION 'profiles: stato approvazione riservato allo staff' USING ERRCODE = '42501';
  END IF;

  -- [108] FREEZE WALLET: il credito non è mai scrivibile dall'utente (solo RPC definer)
  IF NEW.wallet_balance_cents IS DISTINCT FROM OLD.wallet_balance_cents THEN
    RAISE EXCEPTION 'profiles: saldo credito modificabile solo via RPC' USING ERRCODE = '42501';
  END IF;

  -- [061] Campi gestiti SOLO da staff/server (audit approvazione + Stripe Connect + KYC + subscription)
  IF NEW.approved_by              IS DISTINCT FROM OLD.approved_by
  OR NEW.approved_at              IS DISTINCT FROM OLD.approved_at
  OR NEW.stripe_account_id        IS DISTINCT FROM OLD.stripe_account_id
  OR NEW.stripe_charges_enabled   IS DISTINCT FROM OLD.stripe_charges_enabled
  OR NEW.stripe_payouts_enabled   IS DISTINCT FROM OLD.stripe_payouts_enabled
  OR NEW.stripe_details_submitted IS DISTINCT FROM OLD.stripe_details_submitted
  OR NEW.kyc_provider_status      IS DISTINCT FROM OLD.kyc_provider_status
  OR NEW.kyc_provider_check_id    IS DISTINCT FROM OLD.kyc_provider_check_id
  OR NEW.kyc_provider_checked_at  IS DISTINCT FROM OLD.kyc_provider_checked_at
  OR NEW.subscription_status      IS DISTINCT FROM OLD.subscription_status
  THEN
    RAISE EXCEPTION 'profiles: campo riservato non modificabile' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Il trigger BEFORE UPDATE (trg_enforce_profile_update, 061) resta agganciato:
-- CREATE OR REPLACE aggiorna il corpo in-place.

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- GRANT UPDATE (wallet_balance_cents) ON public.profiles TO authenticated;  -- (ri-espone il bug: NON farlo)
-- + ripristinare il corpo di enforce_profile_update_rules dalla 061.
