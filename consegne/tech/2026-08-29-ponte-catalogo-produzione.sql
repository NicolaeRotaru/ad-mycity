-- PONTE APPLICATO ALLA PRODUZIONE il 2026-08-29 00:40 (progetto Supabase «Mycity»).
-- Registrato come  20260828230000 / 129p_ponte_produzione_catalogo_visibile  — NON come «129».
--
-- PERCHE' UN PONTE E NON LA 129 DEL REPO. Il registro della produzione e' fermo a 125c: mancano
-- 126, 127, 128 e 129. La 128 cambia la firma di active_promo_products da sette a nove colonne,
-- quindi il file del repo sarebbe fallito a meta'. E registrarlo come «129» avrebbe fatto SALTARE
-- la 129 vera al prossimo rilascio, facendo arrivare la 128 per ultima — che rimette il guasto
-- sulle promozioni, in silenzio e per sempre. Col nome distinto, il rilascio ordinato
-- 126 → 127 → 128 → 129 resta intatto e finisce nello stato giusto.
--
-- COSA NON C'E' DENTRO, e non per dimenticanza:
--  · la riscrittura della regola delle RECENSIONI. La diagnosi era sbagliata: quella regola non
--    interroga `profiles`, interroga `products`. Le zero recensioni erano un effetto a catena e si
--    curano da sole riparando i prodotti. Riscriverla avrebbe tolto all'amministratore le recensioni
--    dei negozi sospesi, senza curare niente.
--  · la fascia dei PIU' VISTI a permessi di definizione. Avrebbe aperto a chiunque il conteggio
--    delle visite prodotto per prodotto, e il beneficio era zero: il sito riaggancia quelle righe a
--    `profiles` e le butta via, quindi la fascia resta vuota comunque.
--  · `prodotto_in_vetrina`, che serviva solo alla regola delle recensioni.
--
-- MISURA, col ruolo `anon` (la chiave pubblica che ha ogni browser):
--   prima → prodotti 0 su 5 · ricerca «pane» 0 · negozi in vetrina 1
--   dopo  → prodotti 5 su 5 · ricerca «pane» 1 · negozi in vetrina 1
--   e cio' che era chiuso resta chiuso: profiles 0 · product_views 0 · orders 0
--   un cliente registrato qualunque: 5 prodotti.
--
-- NON DIMOSTRATO: recensioni negozio e vetrina sconti passano da zero a zero, perche' quelle tabelle
-- sono vuote. Non contarle come chiuse.

BEGIN;
SET LOCAL lock_timeout = '3s';

CREATE OR REPLACE FUNCTION public.negozio_approvato(p_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
     WHERE p.id = p_id AND p.role = 'seller' AND p.is_approved = true
  );
$$;
REVOKE ALL ON FUNCTION public.negozio_approvato(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.negozio_approvato(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Products visible to public if seller approved" ON public.products;
CREATE POLICY "Products visible to public if seller approved"
  ON public.products FOR SELECT
  USING (status = 'available' AND public.negozio_approvato(seller_id));

DROP POLICY IF EXISTS "Store reviews readable for approved stores" ON public.store_reviews;
CREATE POLICY "Store reviews readable for approved stores"
  ON public.store_reviews FOR SELECT
  USING (public.negozio_approvato(store_id));

-- Le due funzioni di vetrina: STESSA firma che la produzione ha oggi (active_promo_products resta a
-- SETTE colonne finche' non arriva la 128). Cambia solo da dove prendono il negozio: la vista
-- pubblica per il nome, la funzione per il filtro.

CREATE OR REPLACE FUNCTION public.search_products_smart(q text, lim int DEFAULT 10)
RETURNS TABLE (id uuid, name text, price numeric, images jsonb, seller_id uuid, store_name text, rank real)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $fn$
DECLARE
    q_trim text := trim(q);
BEGIN
    IF q_trim = '' OR char_length(q_trim) < 1 THEN
        RETURN;
    END IF;
    IF char_length(q_trim) < 3 THEN
        RETURN QUERY
            SELECT p.id, p.name, p.price, p.images, p.seller_id, pr.store_name,
                   similarity(p.name, q_trim) AS rank
            FROM public.products p
            LEFT JOIN public.seller_public_profiles pr ON pr.id = p.seller_id
            WHERE p.status = 'available'
              AND public.negozio_approvato(p.seller_id)
              AND (p.name ILIKE q_trim || '%' OR p.name % q_trim)
            ORDER BY rank DESC, p.name
            LIMIT lim;
    ELSE
        RETURN QUERY
            SELECT p.id, p.name, p.price, p.images, p.seller_id, pr.store_name,
                   ts_rank(p.search_tsv, websearch_to_tsquery('italian', q_trim)) AS rank
            FROM public.products p
            LEFT JOIN public.seller_public_profiles pr ON pr.id = p.seller_id
            WHERE p.status = 'available'
              AND public.negozio_approvato(p.seller_id)
              AND (p.search_tsv @@ websearch_to_tsquery('italian', q_trim) OR p.name % q_trim)
            ORDER BY rank DESC NULLS LAST, p.name
            LIMIT lim;
    END IF;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.active_promo_products(p_limit int DEFAULT 12, p_seller uuid DEFAULT NULL)
RETURNS TABLE (product_id uuid, name text, price numeric, images jsonb, seller_id uuid, store_name text, discount_percent int)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $fn$
    SELECT p.id AS product_id, p.name, p.price, p.images, p.seller_id, pr.store_name,
           MAX(sp.discount_percent)::int AS discount_percent
    FROM public.products p
    LEFT JOIN public.seller_public_profiles pr ON pr.id = p.seller_id
    JOIN public.seller_promotions sp
      ON sp.seller_id = p.seller_id AND sp.status = 'active'
     AND sp.starts_at <= now() AND sp.ends_at >= now()
     AND (sp.scope = 'store'
       OR (sp.scope = 'category' AND sp.category_id = p.category_id)
       OR (sp.scope = 'products' AND p.id = ANY(sp.product_ids)))
    WHERE p.status = 'available'
      AND public.negozio_approvato(p.seller_id)
      AND (p_seller IS NULL OR p.seller_id = p_seller)
    GROUP BY p.id, p.name, p.price, p.images, p.seller_id, pr.store_name
    ORDER BY discount_percent DESC, p.id
    LIMIT GREATEST(p_limit, 1);
$fn$;

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260828230000', '129p_ponte_produzione_catalogo_visibile')
ON CONFLICT (version) DO NOTHING;

COMMIT;
