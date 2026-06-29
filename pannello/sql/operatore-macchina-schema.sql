-- ============================================================================
-- 🏭 SCHEMA OPERATORE/MACCHINA — Tutte le tabelle dell'AD digitale MyCity
-- ============================================================================
-- Migrazione per il progetto Supabase DELLA MEMORIA (ad-mycity).
-- Aggiunge le ~20 tabelle che completano il cervello dell'operatore:
-- decisioni, azioni, sala operativa, sentinelle, stato KPI, registro realtà,
-- auto-analisi, auto-radiografia, cantiere difetti, apprendimento,
-- calibrazione, auto-miglioramento, storico salute, watchlist, intenzioni,
-- agenti, consegne, radar, ritmo.
--
-- Idempotente: "create table if not exists" → rilanciabile senza danni.
-- RLS attiva senza policy pubbliche: solo service_role scrive/legge.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1) DECISIONI — log append-only di ogni decisione 🟢🟡🔴
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.decisioni (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  data_decisione  timestamptz not null default now(),
  colore          text not null check (colore in ('verde', 'giallo', 'rosso')),
  reparto         text not null,
  cosa            text not null,
  perche          text not null default '',
  esito           text not null default '',
  stato           text not null default 'proposta'
                  check (stato in ('proposta', 'approvata', 'eseguita', 'annullata')),
  firmato_da      text,
  note            text not null default ''
);
create index if not exists decisioni_created_at_idx
  on public.decisioni (created_at desc);
create index if not exists decisioni_colore_idx
  on public.decisioni (colore);
create index if not exists decisioni_stato_idx
  on public.decisioni (stato);

-- ────────────────────────────────────────────────────────────────────────────
-- 2) AZIONI_IN_ATTESA — coda delle azioni da approvare/eseguire
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.azioni_in_attesa (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  numero          serial,
  reparto         text not null,
  azione          text not null,
  colore          text not null check (colore in ('verde', 'giallo', 'rosso')),
  contenuto       text not null default '',
  canale          text not null default '',
  stato           text not null default 'in_attesa'
                  check (stato in ('in_attesa', 'approvata', 'eseguita', 'annullata', 'scaduta')),
  cosa_cambia     text not null default '',
  se_va_bene      text not null default '',
  approvata_at    timestamptz,
  eseguita_at     timestamptz,
  decisione_id    uuid references public.decisioni(id),
  file_consegna   text
);
create index if not exists azioni_stato_idx
  on public.azioni_in_attesa (stato);
create index if not exists azioni_created_at_idx
  on public.azioni_in_attesa (created_at desc);
create index if not exists azioni_reparto_idx
  on public.azioni_in_attesa (reparto);

-- ────────────────────────────────────────────────────────────────────────────
-- 3) SALA_OPERATIVA — canale append-only di coordinamento tra reparti
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.sala_operativa (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  reparto         text not null,
  tipo            text not null
                  check (tipo in ('FACCIO', 'FATTO', 'SERVE', 'PASSO_A', 'RIVEDI')),
  messaggio       text not null,
  destinatario    text
);
create index if not exists sala_operativa_created_at_idx
  on public.sala_operativa (created_at desc);
create index if not exists sala_operativa_reparto_idx
  on public.sala_operativa (reparto);

-- ────────────────────────────────────────────────────────────────────────────
-- 4) SENTINELLE — definizione dei trigger di monitoraggio
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.sentinelle (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  segnale         text not null,
  soglia          text not null,
  operatore       text not null default '>='
                  check (operatore in ('>', '<', '>=', '<=', '=', '!=')),
  reparto         text not null,
  azione          text not null,
  colore          text not null check (colore in ('verde', 'giallo', 'rosso')),
  attiva          boolean not null default true,
  descrizione     text not null default '',
  ultima_verifica timestamptz
);
create index if not exists sentinelle_attiva_idx
  on public.sentinelle (attiva) where attiva = true;

-- ────────────────────────────────────────────────────────────────────────────
-- 5) SENTINELLE_SCATTATE — eventi quando una sentinella scatta
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.sentinelle_scattate (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  sentinella_id   uuid not null references public.sentinelle(id),
  valore_attuale  text not null,
  dettaglio       text not null default '',
  gestita         boolean not null default false,
  gestita_at      timestamptz,
  gestita_da      text
);
create index if not exists sentinelle_scattate_created_at_idx
  on public.sentinelle_scattate (created_at desc);
create index if not exists sentinelle_scattate_gestita_idx
  on public.sentinelle_scattate (gestita) where gestita = false;

-- ────────────────────────────────────────────────────────────────────────────
-- 6) STATO_KPI — snapshot dei 7 numeri chiave ad ogni giro
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.stato_kpi (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  negozi_approvati    integer not null default 0,
  prodotti_faro       integer not null default 0,
  ordini_creati       integer not null default 0,
  ordini_pagati       integer not null default 0,
  ordini_consegnati   integer not null default 0,
  payout_testato      boolean not null default false,
  clienti_nuovi       integer not null default 0,
  note                text not null default '',
  fonte               text not null default 'giro',
  dati_extra          jsonb not null default '{}'::jsonb
);
create index if not exists stato_kpi_created_at_idx
  on public.stato_kpi (created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 7) REGISTRO_REALTA — fondazione di verità per ogni entità menzionata
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.registro_realta (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  nome                text not null,
  tipo                text not null default 'generico',
  stato               text not null default 'da_verificare'
                      check (stato in ('confermato', 'scelta_ragionata', 'da_verificare', 'scartato')),
  fonte               text not null default '',
  confidenza          numeric(3,2) not null default 0.50
                      check (confidenza >= 0 and confidenza <= 1),
  fonte_ragionamento  text not null default '',
  evidenze            jsonb not null default '[]'::jsonb,
  note                text not null default '',
  domanda_per_nicola  text,
  ultima_verifica     timestamptz
);
create index if not exists registro_realta_stato_idx
  on public.registro_realta (stato);
create index if not exists registro_realta_nome_idx
  on public.registro_realta (nome);

-- ────────────────────────────────────────────────────────────────────────────
-- 8) AUTO_ANALISI — voto di fiducia sul proprio lavoro (ogni giro)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.auto_analisi (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  voto_fiducia        integer not null check (voto_fiducia >= 0 and voto_fiducia <= 100),
  trend_fiducia       text not null default '='
                      check (trend_fiducia in ('up', 'down', 'stable')),
  sintesi             text not null default '',
  verifiche           jsonb not null default '{}'::jsonb,
  errori              jsonb not null default '[]'::jsonb,
  domande_per_nicola  jsonb not null default '[]'::jsonb,
  punti_ciechi        jsonb not null default '[]'::jsonb,
  miglioramenti       jsonb not null default '[]'::jsonb,
  salute_macchina     jsonb not null default '{}'::jsonb
);
create index if not exists auto_analisi_created_at_idx
  on public.auto_analisi (created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 9) AUTO_RADIOGRAFIA — salute architettura (settimanale/su comando)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.auto_radiografia (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  tipo                  text not null default 'completa'
                        check (tipo in ('completa', 'sonda')),
  voto_salute           integer not null check (voto_salute >= 0 and voto_salute <= 100),
  trend                 text not null default '='
                        check (trend in ('up', 'down', 'stable')),
  sintesi               text not null default '',
  dimensioni            jsonb not null default '[]'::jsonb,
  pre_mortem            jsonb not null default '[]'::jsonb,
  benchmark_vs_migliori jsonb not null default '[]'::jsonb,
  salute_marketplace    jsonb not null default '{}'::jsonb,
  proposte_nuovi_pezzi  jsonb not null default '[]'::jsonb,
  sonda                 jsonb not null default '{}'::jsonb,
  meta                  jsonb not null default '{}'::jsonb
);
create index if not exists auto_radiografia_created_at_idx
  on public.auto_radiografia (created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 10) CANTIERE_DIFETTI — backlog dei difetti auto-trovati
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.cantiere_difetti (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  codice            text not null unique,
  titolo            text not null,
  dimensione        text not null default '',
  gravita           text not null default 'media'
                    check (gravita in ('critica', 'alta', 'media', 'bassa')),
  impatto_crescita  text not null default 'medio'
                    check (impatto_crescita in ('alto', 'medio', 'basso')),
  causa_radice      text not null default '',
  fix_proposto      text not null default '',
  colore            text not null default 'giallo'
                    check (colore in ('giallo', 'rosso')),
  stato             text not null default 'aperto'
                    check (stato in ('aperto', 'in_corso', 'chiuso')),
  nato              date not null default current_date,
  chiuso_il         date,
  radiografia_id    uuid references public.auto_radiografia(id)
);
create index if not exists cantiere_difetti_stato_idx
  on public.cantiere_difetti (stato);
create index if not exists cantiere_difetti_impatto_idx
  on public.cantiere_difetti (impatto_crescita);

-- ────────────────────────────────────────────────────────────────────────────
-- 11) APPRENDIMENTO — lezioni con decadimento della confidenza
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.apprendimento (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  testo             text not null,
  tag               jsonb not null default '[]'::jsonb,
  reparto           text not null default '',
  confidenza        numeric(3,2) not null default 0.50
                    check (confidenza >= 0 and confidenza <= 1),
  evidenze          integer not null default 1,
  fonte             text not null default 'esito'
                    check (fonte in (
                      'esito', 'approvazione', 'calibrazione', 'pattern',
                      'auto_analisi', 'eccezione', 'benchmark', 'auto_radiografia'
                    )),
  caso_studio_nicola boolean not null default false,
  nato              date not null default current_date,
  ultima_conferma   date not null default current_date,
  stato             text not null default 'attiva'
                    check (stato in ('attiva', 'principio', 'in_prova', 'decaduta'))
);
create index if not exists apprendimento_stato_idx
  on public.apprendimento (stato);
create index if not exists apprendimento_reparto_idx
  on public.apprendimento (reparto);
create index if not exists apprendimento_confidenza_idx
  on public.apprendimento (confidenza desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 12) CALIBRAZIONE — accuratezza previsioni per reparto (autonomia)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.calibrazione (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  reparto         text not null,
  previsioni      integer not null default 0,
  azzeccate       integer not null default 0,
  punteggio       numeric(3,2) not null default 0.00
                  check (punteggio >= 0 and punteggio <= 1),
  autonomia       text not null default 'bassa'
                  check (autonomia in ('alta', 'media', 'bassa')),
  dettaglio       jsonb not null default '[]'::jsonb
);
create index if not exists calibrazione_reparto_idx
  on public.calibrazione (reparto);

-- ────────────────────────────────────────────────────────────────────────────
-- 13) AUTO_MIGLIORAMENTO — benchmark, esperimenti, peer review
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.auto_miglioramento (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  benchmark       jsonb not null default '[]'::jsonb,
  esperimenti     jsonb not null default '[]'::jsonb,
  peer_review     jsonb not null default '[]'::jsonb,
  proposte        jsonb not null default '[]'::jsonb
);
create index if not exists auto_miglioramento_created_at_idx
  on public.auto_miglioramento (created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 14) STORICO_SALUTE — serie storica salute della macchina
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.storico_salute (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  data            date not null default current_date,
  voto_salute     integer not null check (voto_salute >= 0 and voto_salute <= 100),
  difetti_aperti  integer not null default 0,
  difetti_chiusi  integer not null default 0,
  tipo            text not null default 'completa'
                  check (tipo in ('completa', 'sonda'))
);
create index if not exists storico_salute_data_idx
  on public.storico_salute (data desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 15) WATCHLIST_RIFERIMENTI — benchmark e riferimenti da monitorare
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.watchlist_riferimenti (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  mestiere        text not null,
  chi             text not null,
  perche          text not null default '',
  fonte           text not null default '',
  aggiunto_da     text not null default 'macchina'
                  check (aggiunto_da in ('nicola', 'macchina'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 16) INTENZIONI_NICOLA — cosa Nicola intende fare prossimamente
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.intenzioni_nicola (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  sintesi         text not null default '',
  prossime_mosse  jsonb not null default '[]'::jsonb,
  primi_negozi    jsonb not null default '[]'::jsonb,
  rischi          jsonb not null default '[]'::jsonb,
  serve_da_nicola jsonb not null default '[]'::jsonb
);
create index if not exists intenzioni_nicola_created_at_idx
  on public.intenzioni_nicola (created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 17) AGENTI — registro dei senior agent con stato e metriche
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.agenti (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  nome                text not null unique,
  ruolo               text not null default '',
  reparto             text not null default '',
  emoji               text not null default '',
  descrizione         text not null default '',
  stato               text not null default 'attivo'
                      check (stato in ('attivo', 'disattivo', 'in_manutenzione')),
  ultimo_utilizzo     timestamptz,
  compiti_completati  integer not null default 0,
  compiti_falliti     integer not null default 0,
  kpi_principale      text not null default '',
  configurazione      jsonb not null default '{}'::jsonb
);
create index if not exists agenti_nome_idx
  on public.agenti (nome);
create index if not exists agenti_stato_idx
  on public.agenti (stato);

-- ────────────────────────────────────────────────────────────────────────────
-- 18) CONSEGNE — tracking dei deliverable prodotti dai senior
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.consegne (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  reparto         text not null,
  tipo            text not null default 'documento',
  titolo          text not null,
  percorso_file   text not null default '',
  colore          text not null default 'verde'
                  check (colore in ('verde', 'giallo', 'rosso')),
  stato           text not null default 'bozza'
                  check (stato in ('bozza', 'pronto', 'consegnato', 'archiviato')),
  note            text not null default '',
  azione_id       uuid references public.azioni_in_attesa(id)
);
create index if not exists consegne_reparto_idx
  on public.consegne (reparto);
create index if not exists consegne_stato_idx
  on public.consegne (stato);
create index if not exists consegne_created_at_idx
  on public.consegne (created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 19) RADAR — fattori esterni monitorati (50 segnali bidirezionali)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.radar (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  fattore               text not null,
  categoria             text not null default 'generico',
  fonte                 text not null default '',
  peso                  integer not null default 3
                        check (peso >= 1 and peso <= 5),
  direzione             text not null default 'IN'
                        check (direzione in ('IN', 'OUT', 'BIDI')),
  cadenza               text not null default 'settimanale'
                        check (cadenza in ('giornaliera', 'settimanale', 'mensile', 'su_evento')),
  reparto               text not null default '',
  ultimo_valore         text not null default '',
  ultimo_aggiornamento  timestamptz,
  attivo                boolean not null default true,
  effetti_catena        jsonb not null default '[]'::jsonb
);
create index if not exists radar_attivo_idx
  on public.radar (attivo) where attivo = true;
create index if not exists radar_categoria_idx
  on public.radar (categoria);

-- ────────────────────────────────────────────────────────────────────────────
-- 20) RITMO — log delle cadenze eseguite (mattino, sera, settimana, mese)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.ritmo (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  tipo            text not null
                  check (tipo in (
                    'piano_mattino', 'report_sera',
                    'review_settimana', 'strategia_mese'
                  )),
  periodo         text not null default '',
  contenuto       jsonb not null default '{}'::jsonb,
  completato      boolean not null default true,
  note            text not null default ''
);
create index if not exists ritmo_tipo_idx
  on public.ritmo (tipo);
create index if not exists ritmo_created_at_idx
  on public.ritmo (created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 21) OKR_SQUADRA — obiettivi e risultati chiave per reparto
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.okr_squadra (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  reparto         text not null,
  periodo         text not null default '',
  obiettivo       text not null,
  kpi             text not null default '',
  target          text not null default '',
  attuale         text not null default '',
  progresso       numeric(5,2) not null default 0.00,
  budget_euro     numeric(10,2),
  budget_speso    numeric(10,2) not null default 0.00,
  stato           text not null default 'attivo'
                  check (stato in ('attivo', 'raggiunto', 'fallito', 'sospeso')),
  note            text not null default ''
);
create index if not exists okr_squadra_reparto_idx
  on public.okr_squadra (reparto);
create index if not exists okr_squadra_stato_idx
  on public.okr_squadra (stato);

-- ────────────────────────────────────────────────────────────────────────────
-- 22) ERRORI_RICORRENTI — pattern di errori per prevenzione alla radice
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.errori_ricorrenti (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  titolo          text not null,
  pattern         text not null default '',
  reparto         text not null default '',
  occorrenze      integer not null default 1,
  ultima_volta    timestamptz not null default now(),
  causa_radice    text not null default '',
  contromisura    text not null default '',
  stato           text not null default 'attivo'
                  check (stato in ('attivo', 'mitigato', 'risolto')),
  auto_analisi_ids jsonb not null default '[]'::jsonb
);
create index if not exists errori_ricorrenti_stato_idx
  on public.errori_ricorrenti (stato);

-- ============================================================================
-- RLS: attiva su TUTTE le nuove tabelle, nessuna policy pubblica.
-- Solo service_role scrive/legge (bypassa RLS).
-- ============================================================================
alter table public.decisioni           enable row level security;
alter table public.azioni_in_attesa    enable row level security;
alter table public.sala_operativa      enable row level security;
alter table public.sentinelle          enable row level security;
alter table public.sentinelle_scattate enable row level security;
alter table public.stato_kpi           enable row level security;
alter table public.registro_realta     enable row level security;
alter table public.auto_analisi        enable row level security;
alter table public.auto_radiografia    enable row level security;
alter table public.cantiere_difetti    enable row level security;
alter table public.apprendimento       enable row level security;
alter table public.calibrazione        enable row level security;
alter table public.auto_miglioramento  enable row level security;
alter table public.storico_salute      enable row level security;
alter table public.watchlist_riferimenti enable row level security;
alter table public.intenzioni_nicola   enable row level security;
alter table public.agenti              enable row level security;
alter table public.consegne            enable row level security;
alter table public.radar               enable row level security;
alter table public.ritmo               enable row level security;
alter table public.okr_squadra         enable row level security;
alter table public.errori_ricorrenti   enable row level security;

-- ============================================================================
-- Fine. 22 tabelle create, tutte con RLS attiva senza policy pubbliche.
-- Il Pannello e il cervello usano la service_role key per accedervi.
-- ============================================================================
