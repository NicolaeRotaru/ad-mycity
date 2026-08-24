-- ============================================================================
-- 🏪 lavori.negozio_id obbligatorio — PASSO 2 di 2 (AR-801)
-- ============================================================================
-- Da eseguire nel progetto Supabase DELLA MEMORIA (xjljcsorpbqwttrejqte), SQL Editor.
--
-- ⚠️ ORDINE OBBLIGATO, E NON È PIGNOLERIA. Applica questo file SOLO quando tutt'e due
-- queste cose sono vere:
--
--   ① lavori-negozio-id.sql (passo 1) è già stato eseguito;
--   ② il Pannello con la modifica di AR-801 è ONLINE su Vercel.
--
-- Il motivo di ②: il Pannello di oggi crea i lavori senza scrivere il negozio. Se
-- rendi la colonna obbligatoria mentre quel codice è ancora in produzione, OGNI
-- creazione di lavoro fallisce — chat, giri, report, sentinelle. La macchina si ferma.
-- Il Pannello nuovo invece scrive sempre la corsia: chi non dichiara un negozio
-- chiede un lavoro del centro, e lo dice.
--
-- COSA CAMBIA DAVVERO. È questo passo, non il primo, a chiudere il buco: da qui in poi
-- un `insert` diretto che si dimentica il negozio NON RIESCE. Prima riusciva, e la
-- riga finiva nel mucchio comune senza che nessuno se ne accorgesse — che è
-- esattamente il difetto AR-801.
--
-- SE QUALCOSA VA STORTO si torna indietro con una riga:
--   alter table public.lavori alter column negozio_id drop not null;
-- ============================================================================

-- Rete di sicurezza: se per qualunque motivo fosse rimasta una riga senza corsia, la
-- mette nel centro invece di far fallire il comando qui sotto con un errore oscuro.
update public.lavori set negozio_id = 'centro' where negozio_id is null;

alter table public.lavori alter column negozio_id set not null;
