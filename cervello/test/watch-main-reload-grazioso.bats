#!/usr/bin/env bats
# CAUSA-RADICE «azioni approvate finite in da-riapprovare»: watch-main faceva `systemctl restart
# mycity-worker` (kill HARD) quando main avanzava col codice → uccideva il lavoro IN CORSO (azione
# approvata compresa), che poi NON riparte da sola. Fix: reload GRAZIOSO (flag worker:riavvia, il worker
# riparte tra un lavoro e l'altro). Questo test estrae la funzione-decisione REALE da watch-main.sh e
# verifica: solo-memoria → nessun riavvio · default → grazioso (mai hard) · --restart-now → hard.

setup() {
  REPO="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  WATCH="$REPO/cervello/vps/watch-main.sh"
  # Estrai la funzione pura dal sorgente (dalla def alla prima } a colonna 0): se qualcuno la rompe,
  # il test fallisce sulla logica REALE, non su una copia.
  eval "$(awk '/^decidi_azione_riavvio\(\) \{/,/^\}/' "$WATCH")"
}

@test "push di sola memoria → nessun riavvio (AR-027)" {
  run decidi_azione_riavvio 1 0
  [ "$status" -eq 0 ]
  [ "$output" = "nessuno" ]
}

@test "push di codice, default → reload GRAZIOSO (niente kill del lavoro in corso)" {
  run decidi_azione_riavvio 0 0
  [ "$output" = "grazioso" ]
}

@test "push di codice con --restart-now → riavvio HARD (escape hatch manuale)" {
  run decidi_azione_riavvio 0 1
  [ "$output" = "hard" ]
}

@test "sola memoria vince anche con --restart-now (codice invariato = niente da riavviare)" {
  run decidi_azione_riavvio 1 1
  [ "$output" = "nessuno" ]
}

@test "il path automatico di default NON contiene un systemctl restart hard" {
  # Guardia anti-regressione: nel ramo 'grazioso' si alza il flag worker:riavvia, NON si fa systemctl.
  # Il systemctl resta solo nel wrapper root (rc=2) raggiunto dal ramo 'hard'/--restart-now.
  run bash -c "awk '/grazioso\\)/,/;;/' '$WATCH' | grep -c 'systemctl restart'"
  [ "$output" = "0" ]
}

@test "watch-main alza il flag worker:riavvia (canale del reload grazioso)" {
  run grep -F 'worker:riavvia' "$WATCH"
  [ "$status" -eq 0 ]
}
