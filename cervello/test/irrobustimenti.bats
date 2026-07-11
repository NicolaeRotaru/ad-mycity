#!/usr/bin/env bats
# irrobustimenti.bats — chiusura dei difetti di ROBUSTEZZA rimasti dalla radiografia (dopo i 5 gruppi
# principali). Nessuno «perde soldi» come i primi, ma irrobustiscono l'affidabilità. Verificano il
# comportamento puro dove possibile + il cablaggio dove è inline.

WORKER="${BATS_TEST_DIRNAME}/../worker.sh"
WATCH="${BATS_TEST_DIRNAME}/../vps/watch-main.sh"
RP="${BATS_TEST_DIRNAME}/../retry-policy.mjs"

need_node() { command -v node >/dev/null 2>&1 || skip "node non disponibile"; }

@test "worker.sh, watch-main.sh, retry-policy.mjs validi" {
  bash -n "$WORKER"
  bash -n "$WATCH"
  need_node; node --check "$RP"
}

# ── B3: 'proposta' NON è più pre-esecuzione (niente auto-retry → niente doppio invio) ────────────
@test "retry-policy: 'proposta' esclusa da TIPI_PRE_ESECUZIONE" {
  need_node
  run node -e "import('$RP').then(m=>process.exit(m.TIPI_PRE_ESECUZIONE.has('proposta')?1:0))"
  [ "$status" -eq 0 ]
}
@test "retry-policy: i tipi davvero pre-esecuzione restano (giro/chat/ritmo)" {
  need_node
  run node -e "import('$RP').then(m=>{const s=m.TIPI_PRE_ESECUZIONE;process.exit((s.has('giro')&&s.has('chat')&&s.has('ritmo-sera'))?0:1)})"
  [ "$status" -eq 0 ]
}

# ── E1 + git timeouts: fetch/push/ls-remote sotto timeout ────────────────────────────────────────
@test "watch-main: git fetch sotto timeout" {
  grep -q 'timeout "\${WATCH_FETCH_TIMEOUT:-60}" git fetch' "$WATCH"
}
@test "worker: sync_vault fetch e push sotto timeout" {
  grep -q 'timeout "\$_gt" git fetch' "$WORKER"
  grep -q 'timeout "\$_gt" git push' "$WORKER"
}
@test "worker: ls-remote di avvio sotto timeout" {
  grep -q 'timeout "\${GIT_NET_TIMEOUT:-60}" git ls-remote' "$WORKER"
}

# ── Probe fail-closed: HAS_RETRY_COLS e HAS_OWNER_COL richiedono un array REST valido ─────────────
@test "worker: le probe colonne sono fail-closed (richiedono un array '[')" {
  # entrambe le probe (retry + owner) devono avere il requisito positivo dell'array REST
  [ "$(grep -cF '^[[:space:]]*\[' "$WORKER")" -ge 2 ]
}
@test "comportamento probe fail-closed: vuoto o errore → OFF, array valido → ON" {
  decidi() { # $1 = risposta grezza → echo ON|OFF
    if printf '%s' "$1" | grep -qE '^[[:space:]]*\[' \
       && ! printf '%s' "$1" | grep -qiE 'does not exist|PGRST|could not find|column'; then echo ON; else echo OFF; fi
  }
  run decidi ""; [ "$output" = OFF ]                                   # rete morta → OFF
  run decidi "curl: (7) Failed to connect"; [ "$output" = OFF ]        # errore rete → OFF
  run decidi '{"code":"42703","message":"column does not exist"}'; [ "$output" = OFF ]  # colonna assente → OFF
  run decidi '[{"riprova_dopo":null}]'; [ "$output" = ON ]             # array valido → ON
  run decidi '[]'; [ "$output" = ON ]                                  # array vuoto valido → ON
}

# ── Path traversal: '..' negli allegati viene scartato ──────────────────────────────────────────
@test "worker: allegato con '..' nel percorso scartato" {
  grep -q 'case "\$percorso" in \*\.\.\*)' "$WORKER"
}

# ── rispondi_chat_json: stdout JSON pulito (stderr scartato, non 2>&1) ───────────────────────────
@test "worker: la chat-json non mescola stderr nello stdout JSON" {
  grep -q 'output-format json "\$prompt" 2>/dev/null' "$WORKER"
}

# ── Fallback resume mirato: non su timeout ──────────────────────────────────────────────────────
@test "worker: il fallback senza-resume esclude i codici di timeout (124/137/143)" {
  [ "$(grep -c '\[ "\$rc" != 124 \] && \[ "\$rc" != 137 \] && \[ "\$rc" != 143 \]' "$WORKER")" -ge 2 ]
}

# ── Sweep temporanei orfani all'avvio ───────────────────────────────────────────────────────────
@test "worker: sweep dei tmp orfani (mycity-worker.* e mycity-allegati) all'avvio" {
  grep -q "name 'mycity-worker.\*' -mtime +1 -delete" "$WORKER"
  grep -q '/tmp/mycity-allegati -maxdepth 1 -mindepth 1 -mtime +1' "$WORKER"
}
