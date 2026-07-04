-- 109_fix_107_seller_embed.sql
-- WS-DB-RLS · owner: security/backend-dev · 2026-07-04
--
-- FIX B2 (BLOCCANTE) — lato SQL. La migrazione 107 ha eliminato la policy
--   "Anyone can view approved seller profiles" e creato la view
--   seller_public_profiles, ma ~40 siti di codice CLIENT (anon/buyer/rider,
--   soggetti a RLS) embeddano ancora il raw `profiles!...fkey`. Dopo 107 quelle
--   SELECT su profiles tornano NULL → schede prodotto "non disponibile",
--   pagine ordini senza dati negozio, rider senza indirizzo/telefono di ritiro.
--   Il fix DEFINITIVO è lato codice (migrare gli embed all'helper su
--   seller_public_profiles) — vedi WS-DB-RLS.md §B2 con l'elenco completo dei file.
--
-- QUESTO FILE fa la parte SQL necessaria a quel fix:
--   1) Ricrea seller_public_profiles con l'insieme colonne vetrina completo e
--      con security_invoker OFF esplicito (barriera a colonne whitelisted: la
--      view è l'unico canale pubblico e NON espone MAI IBAN/KYC/CF/Stripe/wallet).
--      NB: il lint 0010 (SECURITY DEFINER VIEW) su questa view è ACCETTATO e
--      documentato: è una barriera di esposizione controllata DELIBERATA su sole
--      colonne non sensibili di venditori approvati. Convertirla a
--      security_invoker richiederebbe una policy permessiva sui ROW dei venditori
--      sul base-table, che ri-esporrebbe le colonne sensibili al ruolo
--      authenticated (che le legge sulla PROPRIA riga da app/sell, rider/onboarding,
--      StripeConnectButton...) → non revocabili senza rompere l'onboarding.
--      Vedi WS-DB-RLS.md §Advisor-0010 per l'Opzione A (security_invoker + REVOKE
--      colonne da authenticated + migrazione owner-self-read a server): end-state
--      GOLD, ma multi-file e coordinata, NON in questo range.
--   2) DROP della view ridondante seller_storefronts: stessa proiezione della
--      vetrina (in più `referral_code`, semi-sensibile) e ZERO usi nel codice
--      (grep marketplace: nessun riferimento). Rimuovendola si chiude 1 dei 2
--      ERROR 0010 senza alcun impatto.
--   3) Crea la view whitelisted public_profiles per i profili pubblici buyer
--      (public_handle/bio/avatar), che sostituisce la lettura cross-tenant della
--      policy 033 rimossa in 110. Vedi WS-DB-RLS.md §B2 e §110 per le patch di
--      app/u/[handle]/page.tsx e components/store-sections/* verso questa view.
--
-- IDEMPOTENTE (CREATE OR REPLACE VIEW / DROP VIEW IF EXISTS).
-- REVERSIBILE (in coda).

BEGIN;

-- 1) Vetrina venditori — sole colonne non sensibili, venditori approvati
CREATE OR REPLACE VIEW public.seller_public_profiles
WITH (security_invoker = false) AS
SELECT
  id, store_name, store_address, store_lat, store_lng, store_phone,
  store_logo, store_hours, store_media, store_description,
  store_customization, store_site, offers_express, founded_year,
  is_approved, role, created_at
FROM public.profiles
WHERE is_approved = true
  AND store_name IS NOT NULL
  AND role = 'seller';

COMMENT ON VIEW public.seller_public_profiles IS
  'Vetrina pubblica negozi approvati (sole colonne non sensibili). Barriera colonne whitelisted; lint 0010 accettato. @foreignKey (id) references public.profiles (id)';

GRANT SELECT ON public.seller_public_profiles TO anon, authenticated;

-- 2) View ridondante e inutilizzata → rimossa (chiude 1 ERROR 0010)
DROP VIEW IF EXISTS public.seller_storefronts;

-- 3) Profili pubblici buyer — whitelist minimale (sostituisce la lettura di 033)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT
  id, public_handle, public_bio, public_avatar_url, full_name, created_at
FROM public.profiles
WHERE public_profile_enabled = true
  AND public_handle IS NOT NULL;

COMMENT ON VIEW public.public_profiles IS
  'Profili pubblici opt-in (sole colonne pubbliche). Sostituisce la policy 033. @foreignKey (id) references public.profiles (id)';

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- DROP VIEW IF EXISTS public.public_profiles;
-- Ricreare seller_storefronts dalla definizione live (backup in WS-DB-RLS.md).
