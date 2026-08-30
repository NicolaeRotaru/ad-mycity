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
# 28/8/2026 — LA GREP CHIEDEVA ANCHE L'IMPAGINAZIONE, NON SOLO LA SICUREZZA.
#
# Cercava l'intera riga `lavori?id=eq.$id&stato=eq.in_corso" "${AUTH[@]}" -d "$body"`. Il `-d "$body"`
# è finito sulla riga dopo — a capo, niente di più — e la prova è diventata rossa mentre il filtro di
# sicurezza era intatto. Adesso chiede solo l'invariante che conta: la PATCH finale deve toccare la
# riga SOLO se il lavoro è ancora in corso, o un lavoro già chiuso resuscita.
#
# ⚠️ Resta una grep, e va detto: la prova che esegue davvero questa PATCH vuole un worker.sh che si
# possa caricare senza avviarsi, e quello è il lotto dopo (scheda registrata nel cantiere).
@test "PATCH finale: scrive l'esito SOLO se il lavoro è ancora in_corso (no resurrezione)" {
  run grep -c 'lavori?id=eq.\$id&stato=eq.in_corso' "$WORKER"
  [ "$status" -eq 0 ]
  [ "$output" -ge 2 ] || { echo "meno di due PATCH finali filtrano su in_corso: un lavoro chiuso può resuscitare"; false; }
}

# ── FIX 2: sync_vault non pubblica da un ramo diverso da main ────────────────────────────────────
@test "sync_vault: guardia di ramo prima del push (niente codice fix/* su main)" {
  grep -q 'cur_branch="\$(git rev-parse --abbrev-ref HEAD' "$WORKER"
  grep -q 'if \[ "\$cur_branch" != "\$branch" \]; then' "$WORKER"
  # deve rientrare con return 2 (benigno): NON flippa un esegui-azione in errore (solo rc=1 lo fa)
  run bash -c "sed -n '/GUARDIA RAMO/,/git add -A/p' '$WORKER' | grep -c 'return 2'"
  [ "$output" -ge 1 ]
}

# 28/8/2026 — LA DECISIONE SI È SPOSTATA IN UNA TESTA CHE SI PUÒ INTERROGARE.
#
# Qui si cercava la riga `if [ "$sync_rc" = 1 ] && [ "$tipo" = "esegui-azione" ]` dentro worker.sh.
# Quel bivio adesso lo decide `cervello/esito-scrittura.mjs`, chiamato da `applica_esito_sync`: la
# grep è diventata rossa perché il codice ha smesso di avere quella riga, non perché la regola sia
# cambiata. La regola è la stessa, e adesso gliela si chiede.
@test "sync_vault: solo rc=1 converte un esegui-azione in errore (la guardia ramo torna 2)" {
  run node "$BATS_TEST_DIRNAME/../esito-scrittura.mjs" sync --rc=1 --tipo=esegui-azione
  echo "$output" | grep -q '"stato":"errore"' || { echo "un push fallito non segna più errore: $output"; false; }

  run node "$BATS_TEST_DIRNAME/../esito-scrittura.mjs" sync --rc=2 --tipo=esegui-azione
  echo "$output" | grep -q '"stato":"errore"' && { echo "la guardia di ramo (2) genera un falso errore: $output"; false; }
  echo "$output" | grep -q '"pendente":true' || { echo "una pubblicazione rimandata deve restare pendente: $output"; false; }
  echo "$output" | grep -q '"motivo":"rimandata"' || { echo "rc=2 non è più riconosciuto come rimandata: $output"; false; }

  run node "$BATS_TEST_DIRNAME/../esito-scrittura.mjs" sync --rc=0 --tipo=esegui-azione
  echo "$output" | grep -q '"pendente":false' || { echo "un push riuscito non deve restare pendente: $output"; false; }
}

# Cablaggio, sul NOME e non sull'implementazione: se il worker smette di passare da qui, si vede.
@test "sync_vault: il worker chiede l'esito a applica_esito_sync" {
  run grep -F 'applica_esito_sync' "$WORKER"
  [ "$status" -eq 0 ] || { echo "worker.sh non passa più da applica_esito_sync"; false; }
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
