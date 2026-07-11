-- ============================================================================
-- 🪪 lavori.worker_owner — proprietà del lavoro per il recupero orfani a due worker
-- ============================================================================
-- Da eseguire nel progetto Supabase DELLA MEMORIA (xjljcsorpbqwttrejqte), SQL Editor.
-- Additiva e idempotente: colonna nullable, il codice esistente la ignora.
--
-- Perché: con DUE worker (mycity-worker "all" + mycity-worker-chat) il recupero orfani
-- presumeva un solo consumer e, al riavvio di uno, cestinava/ri-accodava i lavori VIVI
-- dell'altro (doppia esecuzione chat, azione reale marcata «riapprova» mentre partiva).
-- Con questa colonna il claim marchia CHI ha preso il lavoro (WORKER_ID = "lane:host:pid")
-- e il recupero orfani rispetta la proprietà: un worker non tocca gli in_corso VIVI
-- dell'altra lane finché non sono ANTICHI (l'altro worker è morto per davvero).
--
-- Il worker DEGRADA con grazia se la colonna non c'è (probe HAS_OWNER_COL): torna alla
-- sola grazia-per-età. Quindi puoi applicare questa SQL quando vuoi, senza fretta.
-- ============================================================================

alter table public.lavori add column if not exists worker_owner text;

-- Indice leggero: il recupero orfani filtra gli in_corso e guarda l'owner.
create index if not exists lavori_worker_owner_idx on public.lavori (worker_owner);
