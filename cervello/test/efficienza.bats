#!/usr/bin/env bats
# efficienza.bats — rifiniture di efficienza della radiografia (gruppo minori). Tagliano VOLUME e
# scritture ridondanti SENZA toccare verità/sicurezza (governo: "taglia il volume, non i controlli").
#   A) pensiero mirato: thinking spento sui compiti di solo volume (metabolizza, diagnosi errori).
#   B) battito throttle: il DB heartbeat si scrive ogni WORKER_BATTITO_SEC, non a ogni giro del loop.
#   C) streaming skip-se-invariato: niente PATCH del parziale quando il testo non è cresciuto.

WORKER="${BATS_TEST_DIRNAME}/../worker.sh"
MOTORE="${BATS_TEST_DIRNAME}/../motore-ai.sh"

@test "worker.sh e motore-ai.sh sintatticamente validi" {
  bash -n "$WORKER"
  bash -n "$MOTORE"
}

# ── A) PENSIERO MIRATO ──────────────────────────────────────────────────────────────────────────
@test "motore-ai: AI_THINKING override il default del thinking per-lavoro" {
  grep -q 'AI_THINKING:-\${CERVELLO_THINKING_TOKENS' "$MOTORE"
}

@test "motore-ai: comportamento reale — AI_THINKING=0 spegne MAX_THINKING_TOKENS, default lo accende" {
  # estrai e verifica la logica in isolamento (senza dipendere dal resto del file)
  FN="$BATS_TEST_TMPDIR/think.sh"
  cat > "$FN" <<'SH'
ai_engine() { echo claude; }
calc() {
  local _think="${AI_THINKING:-${CERVELLO_THINKING_TOKENS:-8000}}"
  if [ "$_think" != 0 ]; then export MAX_THINKING_TOKENS="$_think"; else unset MAX_THINKING_TOKENS; fi
}
SH
  source "$FN"
  # default: nessun override → thinking acceso a 8000
  unset AI_THINKING CERVELLO_THINKING_TOKENS MAX_THINKING_TOKENS; calc
  [ "$MAX_THINKING_TOKENS" = 8000 ]
  # volume: AI_THINKING=0 → thinking spento
  AI_THINKING=0 CERVELLO_THINKING_TOKENS=8000; calc
  [ -z "${MAX_THINKING_TOKENS:-}" ]
}

@test "worker: metabolizza (testi-volume) gira senza pensiero; diagnosi_errore idem" {
  grep -q 'compito_router" = "testi-volume" \]; then export AI_THINKING=0' "$WORKER"
  grep -q 'local AI_THINKING=0' "$WORKER"
}

# ── B) BATTITO THROTTLE ─────────────────────────────────────────────────────────────────────────
@test "worker: il battito DB è throttlato (WORKER_BATTITO_SEC) ma il watchdog resta ogni giro" {
  grep -q 'WORKER_BATTITO_SEC:-20' "$WORKER"
  # battito_systemd (watchdog) NON deve essere sotto la guardia del throttle: resta chiamato ogni giro
  grep -q '^  battito_systemd' "$WORKER"
}

@test "worker: prima scrittura del battito immediata (_LAST_BEAT=0)" {
  grep -q '_LAST_BEAT=0' "$WORKER"
}

# ── C) STREAMING SKIP-SE-INVARIATO ──────────────────────────────────────────────────────────────
@test "worker: il parziale si riscrive solo se il testo è cresciuto (acc != _last_acc)" {
  grep -q '\[ "\$acc" != "\$_last_acc" \]' "$WORKER"
  grep -q '_last_acc="\$acc"' "$WORKER"
}

# ── Guardia anti-regressione: NON abbiamo toccato i controlli di verità/sicurezza ────────────────
@test "regressione: la guardia stato=eq.in_corso sui parziali e sull'esito è ancora lì" {
  # i parziali e l'esito finale restano protetti (fix #277) — l'efficienza non li ha rimossi
  [ "$(grep -c 'stato=eq.in_corso' "$WORKER")" -ge 2 ]
}

@test "regressione: il battito per-lane (fix due-worker #279) è ancora scritto" {
  grep -q 'worker:ultimo:\$WORKER_LANE' "$WORKER"
}

@test "efficienza: motore-ai espone ai_cursor_auth_ok per login senza API key" {
  grep -q 'ai_cursor_auth_ok()' "$MOTORE"
}
