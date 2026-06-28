-- ============================================================================
-- 🧠 SCHEMA DATABASE MEMORIA — Cabina Operativa AD MyCity
-- ============================================================================
-- Da eseguire nel progetto Supabase DELLA MEMORIA (SEPARATO dal marketplace),
-- nel SQL Editor. Crea tutte le tabelle che l'operatore (Pannello + cervello)
-- legge/scrive via SUPABASE_URL + SUPABASE_SERVICE_KEY.
--
-- ⚠️ NON eseguire questo nel DB del marketplace: la memoria va tenuta separata.
--
-- Idempotente: "create table if not exists" → puoi rilanciarlo senza danni.
-- RLS attiva senza policy pubbliche: l'anon key NON legge la memoria;
-- l'operatore usa la service_role (che bypassa la RLS). È il default sicuro.
--
-- Schema allineato 1:1 a pannello/src/lib/store.ts (verificato sul DDL live).
-- ============================================================================

-- 1) BRIEFINGS — il digest dell'ultimo giro (la card "Cosa ho scoperto").
create table if not exists public.briefings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  data        jsonb not null            -- { situazione, opportunita[], azioni[] }
);
create index if not exists briefings_created_at_idx on public.briefings (created_at desc);

-- 2) DIARIO — log persistente di tutto ciò che l'AD dice e fa (chat/giro/azione).
create table if not exists public.diario (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  tipo        text not null default 'chat',
  titolo      text not null default '',
  testo       text not null default ''
);
create index if not exists diario_created_at_idx on public.diario (created_at desc);

-- 3) LAVORI — la coda (IPC) tra Pannello e cervello-Max sul VPS.
--    Il Pannello crea 'in_attesa'; il worker passa a 'in_corso' e poi 'fatto'/'errore'.
create table if not exists public.lavori (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  stato       text not null default 'in_attesa',   -- in_attesa|in_corso|fatto|errore
  tipo        text not null default 'analisi',
  richiesta   text not null,
  risultato   text not null default '',
  esperto     text not null default ''
);
create index if not exists lavori_created_at_idx on public.lavori (created_at desc);
create index if not exists lavori_stato_idx on public.lavori (stato);

-- 4) CONVERSAZIONI — memoria delle chat (ricordare/riprendere tra dispositivi).
--    Opzionale: senza, il Pannello ripiega sul salvataggio locale.
create table if not exists public.conversazioni (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  titolo      text not null default 'Conversazione',
  messaggi    jsonb not null default '[]'::jsonb
);
create index if not exists conversazioni_updated_at_idx on public.conversazioni (updated_at desc);

-- 5) IMPOSTAZIONI — chiave/valore: kill-switch (pausa), autopilota, battito del
--    cuore, budget AI, parametri economici, log azioni, stelle, dedup playbook…
--    'chiave' UNIQUE è OBBLIGATORIA: l'upsert usa on_conflict=chiave.
create table if not exists public.impostazioni (
  id          uuid primary key default gen_random_uuid(),
  chiave      text not null unique,
  valore      text,
  updated_at  timestamptz not null default now()
);

-- RLS: attiva ovunque, nessuna policy pubblica (solo service_role scrive/legge).
alter table public.briefings     enable row level security;
alter table public.diario        enable row level security;
alter table public.lavori        enable row level security;
alter table public.conversazioni enable row level security;
alter table public.impostazioni  enable row level security;

-- ============================================================================
-- Fine. Dopo l'esecuzione, su Vercel imposta:
--   SUPABASE_URL         = https://<progetto-memoria>.supabase.co
--   SUPABASE_SERVICE_KEY = <service_role del progetto memoria>
-- e fai Redeploy. La card "Stato macchina" del Pannello passerà "Memoria collegata" a verde.
-- ============================================================================
