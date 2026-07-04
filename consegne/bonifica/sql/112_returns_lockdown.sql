-- 112_returns_lockdown.sql
-- WS-DB-RLS · owner: security/backend-dev · 2026-07-04
--
-- FIX (GRAVE) — returns_buyer_insert non validato.
--   CAUSA RADICE: la policy INSERT su returns (024) è
--     WITH CHECK (auth.uid() = buyer_id)
--   e non verifica proprietà ordine, seller_id reale, stato DELIVERED, finestra
--   14gg, né congela status/refund_amount_cents; nessun trigger BEFORE INSERT.
--   A differenza di orders/order_items/business_orders (INSERT client RIMOSSA in
--   058 per forzare la creazione server-side), returns è rimasta scrivibile dal
--   client via PostgREST → un buyer può forgiare resi con seller_id arbitrario,
--   status pre-impostato ('REFUNDED') e refund_amount_cents arbitrario, saltando
--   app/api/returns/create.
--
-- FIX (coerente con 058): la creazione resi passa SOLO dal route server-side
--   /api/returns/create (che gira con service_role e bypassa RLS). Si rimuove la
--   policy INSERT del client. Buyer/seller/admin conservano la SOLA LETTURA
--   (returns_buyer_read/returns_seller_read/returns_admin_all).
--
-- VERIFICA PRE-DEPLOY (confidenza alta): confermato che NESSUN codice CLIENT
--   inserisce in returns — l'unico .from('returns') non-admin è
--   app/seller/orders/[id]/page.tsx:169 (lettura/decisione, non insert), mentre
--   app/api/returns/create/route.ts crea il reso server-side. Rieseguire il grep
--   `from('returns').insert` prima del deploy.
--
-- IDEMPOTENTE. REVERSIBILE (in coda).

BEGIN;

DROP POLICY IF EXISTS returns_buyer_insert ON public.returns;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================ ROLLBACK =====================================
-- create policy returns_buyer_insert on public.returns
--   for insert with check (auth.uid() = buyer_id);
-- (In alternativa, se si vuole tenere l'INSERT client: rafforzare il WITH CHECK
--  con EXISTS(ordine del buyer DELIVERED) + status='REQUESTED'
--  + refund_amount_cents IS NULL + seller_id = seller reale dell'ordine.)
