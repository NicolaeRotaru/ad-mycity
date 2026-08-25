-- ============================================================================
-- 🏪 lavori.negozio_id — la corsia del negozio, PASSO 1 di 2 (AR-801)
-- ============================================================================
-- Da eseguire nel progetto Supabase DELLA MEMORIA (xjljcsorpbqwttrejqte), SQL Editor.
-- Additiva e idempotente. Si può applicare quando vuoi, anche PRIMA che il Pannello
-- nuovo sia online: il codice di oggi ignora la colonna e continua a funzionare.
--
-- PERCHÉ. ARCHITETTURA-TRE-MACCHINE.md, meccanismo ①: «negozio_id su ogni riga,
-- ovunque. Nessuna tabella senza». Il lato codice della BOTTEGA quel muro ce l'ha già
-- (cervello/bottega/lavoro.mjs non sa costruire un lavoro senza negozio). La tabella
-- no: letta dal vivo il 23/8, 3.255 righe, nessun campo del negozio. Finché è così il
-- muro tiene solo per chi passa dal modulo nuovo, e una query diretta lo aggira senza
-- che nessuno se ne accorga.
--
-- PERCHÉ IL CENTRO HA UN NOME E NON UN CAMPO VUOTO. I lavori che la macchina fa per sé
-- (giri, report, chat) non sono di nessun negozio. Lasciarli vuoti sembra naturale, ma
-- un campo che può essere vuoto è un campo che si può DIMENTICARE — e poi il muro nel
-- database (AR-802) dovrebbe decidere cosa fare del vuoto: «vuoto vede tutto» e «vuoto
-- non vede niente» sono tutt'e due trappole. Col centro che ha un nome, il campo può
-- diventare obbligatorio, e una scrittura diretta che si dimentica il negozio NON
-- riesce invece di riuscire male.
--
-- ⚠️ QUESTO PASSO DA SOLO NON CHIUDE IL BUCO. La colonna qui è ancora nullable, quindi
-- un `insert` diretto senza negozio passa lo stesso. A chiudere è il PASSO 2
-- (lavori-negozio-id-obbligatorio.sql), che va applicato DOPO che il Pannello nuovo è
-- online. L'ordine non è pignoleria: vedi la nota in fondo a quel file.
-- ============================================================================

-- 1) La colonna. Nullable adesso: nessuna riga esistente la ha, e una colonna
--    obbligatoria non si può aggiungere a una tabella che ha già 3.255 righe.
alter table public.lavori add column if not exists negozio_id text;

-- 2) Le righe che c'erano prima sono tutte lavori della macchina per sé stessa.
--    Idempotente: la seconda volta non trova più niente da aggiornare.
update public.lavori set negozio_id = 'centro' where negozio_id is null;

-- 3) L'indice: il worker prenderà i lavori a turno tra i negozi (meccanismo ③,
--    «una coda sola, ma a corsie»), quindi filtrerà per negozio a ogni giro.
create index if not exists lavori_negozio_id_idx on public.lavori (negozio_id);
