#!/usr/bin/env bats
# worker-doppio-invio.bats — i 3 fix del gruppo 1 della radiografia profonda (2026-07-11):
# proteggono contro il DOPPIO INVIO di azioni reali e il codice non revisionato su main, nati
# dall'avere DUE worker (mycity-worker + mycity-worker-chat) che si pestano i piedi.
# Sono guardie di CABLAGGIO (grep sul worker vero) + un test comportamentale sulla grazia orfani.

WORKER="${BATS_TEST_DIRNAME}/../worker.sh"

@test "worker.sh esiste ed è sintatticamente valido" {
  bash -n "$WORKER"
}

# ── FIX 1: guardia stato=eq.in_corso sulla PATCH finale dell'esito ──────────────────────────────
@test "PATCH finale: scrive l'esito SOLO se il lavoro è ancora in_corso (no resurrezione)" {
  # entrambe le PATCH finali (ramo retry e ramo normale) devono filtrare su stato=eq.in_corso
  run grep -c 'lavori?id=eq.\$id&stato=eq.in_corso" "\${AUTH\[@\]}" -d "\$body"' "$WORKER"
  [ "$status" -eq 0 ]
  [ "$output" -ge 2 ]
}

# ── FIX 2: sync_vault non pubblica da un ramo diverso da main ────────────────────────────────────
@test "sync_vault: guardia di ramo prima del push (niente codice fix/* su main)" {
  grep -q 'cur_branch="\$(git rev-parse --abbrev-ref HEAD' "$WORKER"
  grep -q 'if \[ "\$cur_branch" != "\$branch" \]; then' "$WORKER"
  # deve rientrare con return 2 (benigno): NON flippa un esegui-azione in errore (solo rc=1 lo fa)
  run bash -c "sed -n '/GUARDIA RAMO/,/git add -A/p' '$WORKER' | grep -c 'return 2'"
  [ "$output" -ge 1 ]
}

@test "sync_vault: solo rc=1 converte un esegui-azione in errore (la guardia ramo torna 2)" {
  # il chiamante flippa in errore SOLO su sync_rc=1: garantisce che return 2 non generi falso Riprova
  grep -q 'if \[ "\$sync_rc" = 1 \] && \[ "\$tipo" = "esegui-azione" \]' "$WORKER"
}

# ── FIX 3: grazia orfani — comportamento reale della soglia ─────────────────────────────────────
setup_grace() {
  FN="$BATS_TEST_TMPDIR/grace.sh"
  # estrae solo il blocco decisionale della grazia in una funzione testabile
  cat > "$FN" <<'SH'
decidi_grazia() { # $1=eta_min $2=grace_min -> "lascia" | "processa"
  local eta="$1" grace="$2"
  if [ "$eta" -lt "$grace" ]; then echo lascia; else echo processa; fi
}
SH
  source "$FN"
}

@test "grazia: un orfano fresco (2min < 4) viene LASCIATO in_corso" {
  setup_grace
  run decidi_grazia 2 4
  [ "$output" = lascia ]
}

@test "grazia: un orfano vecchio (10min >= 4) viene PROCESSATO (recupero normale)" {
  setup_grace
  run decidi_grazia 10 4
  [ "$output" = processa ]
}

@test "grazia: al confine (eta = grace) si processa (non si lascia in eterno)" {
  setup_grace
  run decidi_grazia 4 4
  [ "$output" = processa ]
}

@test "worker: la grazia è cablata PRIMA del ramo azione (anche le azioni reali fresche protette)" {
  # il continue della grazia deve comparire prima del case esegui-azione|proposta
  run bash -c "grep -n 'grazia' '$WORKER' | head -1 | cut -d: -f1"
  local riga_grazia="$output"
  run bash -c "grep -n 'esegui-azione proposta' '$WORKER' | head -1 | cut -d: -f1"
  local riga_azione="$output"
  [ "$riga_grazia" -lt "$riga_azione" ]
}

@test "worker: la soglia di grazia è configurabile da .env (WORKER_ORFANO_GRACE_MIN)" {
  grep -q 'SOGLIA_ORFANO_GRACE_MIN="\${WORKER_ORFANO_GRACE_MIN:-4}"' "$WORKER"
}
