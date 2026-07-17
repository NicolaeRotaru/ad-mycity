#!/usr/bin/env bats
# due-worker.bats — coordinamento tra i DUE worker (mycity-worker "all" + mycity-worker-chat).
# Radiografia 2026-07-11, gruppo strutturale: i due processi non devono più pestarsi i piedi su
# coda/battito/recupero-orfani/riavvio. Verifica la funzione PURA della decisione orfani + il
# cablaggio (identità, battito per-lane, claim con owner, riavvio per-lane, migration).

WORKER="${BATS_TEST_DIRNAME}/../worker.sh"

setup() {
  FN="$BATS_TEST_TMPDIR/fn.sh"
  sed -n '/^_orfano_decisione() {/,/^}/p' "$WORKER" > "$FN"
  grep -q '_orfano_decisione()' "$FN"
  source "$FN"
}

@test "worker.sh sintatticamente valido" {
  bash -n "$WORKER"
}

# ── DECISIONE ORFANI (DB migrato: owner presente) ───────────────────────────────────────────────
# Args: has_owner owner_lane my_lane eta grace soglia
@test "orfano di UN'ALTRA lane, recente → LASCIA (vivo altrove)" {
  run _orfano_decisione 1 all chat 5 4 60
  [ "$output" = lascia ]
}

@test "orfano della MIA lane → PROCEDI (mio orfano da riavvio, lo recupero subito)" {
  run _orfano_decisione 1 chat chat 5 4 60
  [ "$output" = procedi ]
}

@test "orfano di un'altra lane ma ANTICO (oltre soglia) → PROCEDI (l'altro worker è morto)" {
  run _orfano_decisione 1 all chat 90 4 60
  [ "$output" = procedi ]
}

@test "orfano della mia lane anche se freschissimo → PROCEDI (niente grazia sui miei)" {
  run _orfano_decisione 1 all all 1 4 60
  [ "$output" = procedi ]
}

# ── DECISIONE ORFANI (DB NON migrato: owner assente → sola grazia-per-età) ───────────────────────
@test "senza owner, fresco (entro grazia) → LASCIA" {
  run _orfano_decisione 0 "" chat 2 4 60
  [ "$output" = lascia ]
}

@test "senza owner, oltre la grazia → PROCEDI" {
  run _orfano_decisione 0 "" chat 10 4 60
  [ "$output" = procedi ]
}

@test "has_owner=1 ma owner VUOTO (riga legacy) → ricade sulla grazia-per-età" {
  run _orfano_decisione 1 "" chat 2 4 60
  [ "$output" = lascia ]
  run _orfano_decisione 1 "" chat 10 4 60
  [ "$output" = procedi ]
}

# ── CABLAGGIO nel worker ────────────────────────────────────────────────────────────────────────
@test "identità: WORKER_ID (lane:host:pid) definito" {
  grep -q 'WORKER_ID="\${WORKER_LANE}:\$(hostname' "$WORKER"
}

@test "battito per-lane: si scrive worker:ultimo:<lane> oltre a worker:ultimo" {
  grep -q 'worker:ultimo:\$WORKER_LANE' "$WORKER"
  grep -qF '\"chiave\":\"worker:ultimo\"' "$WORKER"
}

# ── BATTITO DURANTE LA CHAT (root-cause fix falso-positivo "worker chat fermo", 2026-07-17) ──────
# Un turno chat lungo (letture/subagent/ragionamento con poco testo nuovo) tiene il worker dentro
# _chat_stream_run per minuti SENZA tornare in cima al loop principale. Se lì dentro non batte, il
# per-lane worker:ultimo:chat si congela → la sentinella-lavori lo dà per "worker chat morto" dopo
# 5 min e UCCIDE una chat sana ancora in corso. Il worker DEVE battere anche mentre genera.
@test "battito-durante-chat: _chat_stream_run rinfresca il battito nel loop di streaming" {
  FN2="$BATS_TEST_TMPDIR/stream.sh"
  sed -n '/^_chat_stream_run() {/,/^}/p' "$WORKER" > "$FN2"
  grep -q '_chat_stream_run()' "$FN2"
  # il loop while-genera deve chiamare battito_worker + battito_systemd, col throttle WORKER_BATTITO_SEC
  grep -q 'battito_worker' "$FN2"
  grep -q 'battito_systemd' "$FN2"
  grep -q 'WORKER_BATTITO_SEC' "$FN2"
}

# La soglia con cui la sentinella dà per morto il worker-chat (CHAT_WORKER_MORTO_MIN) deve restare
# MOLTO sopra il throttle del battito (WORKER_BATTITO_SEC), altrimenti anche un worker vivo che
# batte regolarmente verrebbe scambiato per morto. Invariante di progetto tra i due file.
@test "invariante: soglia morte-chat della sentinella >> throttle del battito" {
  SENT="${BATS_TEST_DIRNAME}/../sentinella-lavori.mjs"
  [ -f "$SENT" ]
  grep -q 'CHAT_WORKER_MORTO_MIN = 5' "$SENT"
  # 5 min = 300s, molto oltre i 20s di default del battito → nessun falso positivo su worker vivo
}

@test "claim: marchia worker_owner=WORKER_ID quando il DB è migrato" {
  grep -q 'HAS_OWNER_COL:-0.*= 1.*_claim_body' "$WORKER" || grep -q '_claim_body="\$(jq -n --arg o "\$WORKER_ID"' "$WORKER"
}

@test "probe colonna owner: HAS_OWNER_COL con degrado grazioso" {
  grep -q 'HAS_OWNER_COL=0' "$WORKER"
  grep -q 'select=worker_owner' "$WORKER"
}

@test "recupero orfani: il select include worker_owner solo se migrato" {
  grep -q 'sel="\$sel,worker_owner"' "$WORKER"
}

@test "riavvio: marcatore di consumo per-lane (worker:riavvia:visto:<lane>) — entrambi si ricaricano" {
  grep -q 'worker:riavvia:visto:\$WORKER_LANE' "$WORKER"
  grep -q '_riavvia_forse_spegni_flag' "$WORKER"
  grep -q '_riavvia_sibling_lane' "$WORKER"
}

@test "migration owner presente e additiva (add column if not exists)" {
  SQL="${BATS_TEST_DIRNAME}/../../pannello/sql/lavori-worker-owner.sql"
  [ -f "$SQL" ]
  grep -q 'add column if not exists worker_owner text' "$SQL"
}
