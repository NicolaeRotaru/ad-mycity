-- Auto-recovery della coda: campi per il RITENTATIVO automatico dei lavori falliti.
--   tentativi     = quante volte il worker ha già ri-provato AUTOMATICAMENTE questo lavoro.
--   riprova_dopo  = istante prima del quale il worker NON deve riprenderlo (attende il reset
--                   quota o il backoff). Il worker filtra: stato=in_attesa AND
--                   (riprova_dopo IS NULL OR riprova_dopo <= now()).
-- Idempotente: "add column if not exists" → puoi rilanciarlo senza danni.
alter table public.lavori add column if not exists tentativi    int         not null default 0;
alter table public.lavori add column if not exists riprova_dopo timestamptz;

-- Indice per il gate del worker (pochi in coda, ma tiene la SELECT veloce e chiara).
create index if not exists lavori_riprova_dopo_idx on public.lavori (riprova_dopo);
