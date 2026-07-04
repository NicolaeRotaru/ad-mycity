-- 110_profiles_cross_tenant_read_lockdown.sql
-- WS-DB-RLS · owner: security · 2026-07-04
--
-- FIX (GRAVE) — Over-grant colonne sensibili + lettura cross-tenant via "Public profile read".
--   CAUSA RADICE: la policy "Public profile read" (033)
--     USING (public_profile_enabled = true OR auth.uid() = id)
--   consente a QUALSIASI utente loggato di leggere le RIGHE altrui che hanno
--   public_profile_enabled=true. Poiché authenticated ha (postura Supabase di
--   default) SELECT su TUTTE le colonne di profiles, un venditore che attiva
--   l'opt-in diventa interamente leggibile: billing_iban, legal_fiscal_code,
--   legal_birth_date, legal_residence_*, business_*, kyc_*_url, stripe_*_id,
--   phone, address, wallet_balance_cents. Violazione GDPR/AML.
--
-- FIX (deny-by-default, chiude la CLASSE di leak, senza rompere l'owner):
--   1) DROP "Public profile read": nessun utente legge più la RIGA base di un
--      altro profilo. Restano SOLO: propria riga (001), admin (012), rider→buyer
--      dell'ordine assegnato (011/013). I profili pubblici buyer si servono dalla
--      view whitelisted public_profiles (109). La vetrina venditori dalla view
--      seller_public_profiles (109). → I campi sensibili NON sono più leggibili
--      cross-tenant per il ruolo authenticated, a PRESCINDERE dai grant di colonna.
--   2) REVOKE SELECT sulle colonne sensibili da `anon`: anon non ha "propria riga",
--      quindi non serve mai leggerle; le vetrine passano dalle view (definer, non
--      soggette al grant). Difesa in profondità contro qualsiasi path anon.
--      NB: NON revochiamo da `authenticated`: l'owner legge le proprie colonne
--      sensibili via client (app/sell, app/rider/onboarding, StripeConnectButton,
--      SellerHealthScore, rider/profile). Revocarle romperebbe l'onboarding.
--      L'isolamento cross-tenant per authenticated è già garantito dal punto (1)
--      (nessuna riga altrui leggibile). Il REVOKE da authenticated è l'Opzione A
--      (GOLD) descritta in WS-DB-RLS.md, gated sulla migrazione degli owner-read
--      a server-side.
--
-- IDEMPOTENTE. REVERSIBILE (in coda).
-- DIPENDENZA: 109 (view public_profiles/seller_public_profiles) DEVE precedere,
--   e le patch di codice di §B2 + app/u/[handle] verso le view devono accompagnare
--   il deploy, altrimenti le pagine pubbliche restano vuote.

BEGIN;

-- 1) Rimuove la lettura cross-tenant della riga base
DROP POLICY IF EXISTS "Public profile read" ON public.profiles;

-- 2) Difesa in profondità: anon non legge colonne sensibili sul base-table
REVOKE SELECT (
  billing_iban, billing_card_last4,
  legal_fiscal_code, legal_birth_date,
  legal_residence_addr, legal_residence_city, legal_residence_zip,
  business_legal_name, business_vat_number, business_form,
  business_address, business_city, business_zip, business_pec, business_sdi,
  kyc_id_doc_front_url, kyc_id_doc_back_url, kyc_selfie_url,
  kyc_provider_check_id, kyc_provider_status, kyc_provider_checked_at,
  stripe_account_id, stripe_customer_id, stripe_subscription_id,
  stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted,
  rider_license_url, rider_insurance_url, rider_haccp_url,
  wallet_balance_cents,
  phone, address
) ON public.profiles FROM anon;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- CREATE POLICY "Public profile read" ON public.profiles
--   FOR SELECT USING (public_profile_enabled = true OR auth.uid() = id);
-- GRANT SELECT (...colonne...) ON public.profiles TO anon;
