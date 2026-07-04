-- =============================================================================
-- 120_perf_fk_covering_indexes.sql
-- WS-PERF · advisor performance "unindexed_foreign_keys" (5 FK senza indice)
-- Colore: 🔴 (DDL su DB live) — ma a rischio bassissimo: solo CREATE INDEX,
--          nessuna riscrittura dati, additivo e reversibile con DROP INDEX.
-- Idempotente: IF NOT EXISTS su ogni indice → ri-eseguibile senza errori.
-- =============================================================================
--
-- CAUSA-RADICE: 5 foreign key non hanno un indice di copertura sulla colonna
-- referenziante. Ogni DELETE/UPDATE sul lato "padre" forza un seq scan sul
-- lato "figlio" per verificare il vincolo, e le query che filtrano/joinano su
-- quella colonna non hanno appoggio → full scan che peggiora sotto volume.
--
-- MISURA ATTESA: le join/lookup su queste colonne passano da Seq Scan a Index
-- Scan; i DELETE sui padri (es. cancellazione variante/utente/pagina CMS) non
-- lockano più il figlio in scansione lineare. Guadagno cresce col volume.
--
-- NOTA LOCK: CREATE INDEX prende un lock SHARE (blocca le SCRITTURE sulla
-- tabella per la durata della build). Su tabelle piccole è millisecondi. Se
-- `order_items` è grande in produzione, esegui QUELLA riga come CREATE INDEX
-- CONCURRENTLY via psql diretto FUORI da una transazione (vedi blocco in fondo),
-- perché CONCURRENTLY non è ammesso dentro apply_migration (che è transazionale).
-- -----------------------------------------------------------------------------

-- order_items.variant_id → product_variants(id)
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id
  ON public.order_items (variant_id);

-- cms_pages.updated_by → auth.users / profiles(id)
CREATE INDEX IF NOT EXISTS idx_cms_pages_updated_by
  ON public.cms_pages (updated_by);

-- cod_reconciliations.remitted_by → profiles(id)
CREATE INDEX IF NOT EXISTS idx_cod_reconciliations_remitted_by
  ON public.cod_reconciliations (remitted_by);

-- review_helpful.user_id → profiles(id)  (usato anche dalle RLS *_own)
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id
  ON public.review_helpful (user_id);

-- site_settings.updated_by → profiles(id)
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by
  ON public.site_settings (updated_by);

-- -----------------------------------------------------------------------------
-- ROLLBACK:
--   DROP INDEX IF EXISTS public.idx_order_items_variant_id;
--   DROP INDEX IF EXISTS public.idx_cms_pages_updated_by;
--   DROP INDEX IF EXISTS public.idx_cod_reconciliations_remitted_by;
--   DROP INDEX IF EXISTS public.idx_review_helpful_user_id;
--   DROP INDEX IF EXISTS public.idx_site_settings_updated_by;
--
-- VARIANTE CONCURRENTLY (solo se order_items è grande; NON dentro una txn):
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_variant_id
--     ON public.order_items (variant_id);
-- =============================================================================
