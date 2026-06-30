-- Raggruppa i lavori della stessa conversazione chat (Lavori del cervello).
alter table public.lavori add column if not exists gruppo_id text;
create index if not exists lavori_gruppo_id_idx on public.lavori (gruppo_id);
