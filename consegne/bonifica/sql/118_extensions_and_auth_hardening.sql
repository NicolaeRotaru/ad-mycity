-- 118_extensions_and_auth_hardening.sql
-- WS-DB-RLS · owner: security/devops-sre · 2026-07-04
--
-- FIX advisor residui — bassa priorità, con cautele.
--
-- (A) advisor 0014 — extension_in_public: pg_trgm installata in `public`.
--     RISCHIO se lasciata: minimo (naming/search_path hygiene). RISCHIO se spostata
--     MALE: alto — pg_trgm fornisce operatori/opclass usati dagli indici GIN/GIST
--     di ricerca (es. indici trigram su products.name). Un DROP/CREATE brutale
--     invaliderebbe quegli indici. Per questo lo spostamento NON è un semplice
--     ALTER e va fatto con inventario indici a mano → lo lasciamo COMMENTATO e
--     lo trattiamo come task devops separato con finestra di manutenzione.
--
--     Procedura consigliata (NON eseguita qui):
--       1) censire gli indici che usano opclass gin_trgm_ops/gist_trgm_ops;
--       2) CREATE SCHEMA IF NOT EXISTS extensions;
--       3) ALTER EXTENSION pg_trgm SET SCHEMA extensions;
--       4) aggiungere `extensions` al search_path del ruolo/DB
--          (ALTER ROLE authenticator SET search_path = public, extensions);
--       5) verificare che gli indici trigram siano ancora validi (\d+ sulle tabelle).
--     → Consiglio: BASSA priorità, post go-live, con backup. Non bloccante.
--
-- (B) advisor auth — Leaked Password Protection disabilitata.
--     NON è configurabile via SQL: è un toggle del pannello Supabase Auth.
--     AZIONE MANUALE (🔴 Nicola/devops): Dashboard → Authentication → Policies →
--     "Leaked password protection" = ON (check HaveIBeenPwned). 2 minuti, nessun
--     impatto sugli utenti esistenti. Vedi WS-DB-RLS.md §Auth.
--
-- Questo file di per sé non applica DDL: è il segnaposto tracciabile dei due
-- advisor a gestione manuale/devops. Lasciato idempotente e no-op.

DO $$
BEGIN
  RAISE NOTICE 'pg_trgm move + leaked-password protection: gestione manuale/devops (vedi header).';
END $$;

-- Blocco pg_trgm (da eseguire in finestra di manutenzione, dopo censimento indici):
-- CREATE SCHEMA IF NOT EXISTS extensions;
-- ALTER EXTENSION pg_trgm SET SCHEMA extensions;
-- ALTER ROLE authenticator SET search_path = public, extensions;
