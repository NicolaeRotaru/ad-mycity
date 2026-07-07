#!/usr/bin/env bats
# Round 1 (worker) — due invarianti di sicurezza dentro il loop del worker:
#  A) CLAIM ATOMICO: prendere un lavoro solo se ANCORA in_attesa (compare-and-set) → niente doppia
#     esecuzione se due worker pollano insieme.
#  B) PAUSA FAIL-CLOSED: se lo stato pausa non è leggibile, NON prendere lavori (come AR-100 nel giro).
# worker.sh esegue un loop infinito e non è sourceable: testo funzioni-SPECCHIO del fix + guardie
# anti-drift che il sorgente contenga davvero i token chiave.

WORKER="$BATS_TEST_DIRNAME/../worker.sh"

# --- specchio del CLAIM ATOMICO (mirror del blocco in worker.sh) ---
# stub_curl_out = cosa "torna" la PATCH di claim; decide come il worker.
claim_decision() {
  local claimed="$1"
  if [ -z "$(printf '%s' "$claimed" | jq -r '.[0].id // empty' 2>/dev/null)" ]; then
    echo "salto"; return 1
  fi
  echo "procedo"; return 0
}

@test "A1 claim vinto (riga tornata) → il worker procede" {
  run claim_decision '[{"id":"job1","stato":"in_corso"}]'
  [ "$status" -eq 0 ]
  [ "$output" = "procedo" ]
}

@test "A2 claim perso (risposta vuota []) → il worker salta, niente doppia esecuzione" {
  run claim_decision '[]'
  [ "$status" -eq 1 ]
  [ "$output" = "salto" ]
}

@test "A3 guardia anti-drift: worker.sh fa il claim compare-and-set (stato=eq.in_attesa + return=representation)" {
  run grep -F 'lavori?id=eq.$id&stato=eq.in_attesa' "$WORKER"
  [ "$status" -eq 0 ]
  run grep -F 'Prefer: return=representation' "$WORKER"
  [ "$status" -eq 0 ]
}

# --- specchio della PAUSA FAIL-CLOSED ---
# pausa_decision <rc-del-curl> <corpo> → stampa cosa fa il worker
pausa_decision() {
  local rc="$1" pausa="$2"
  if [ "$rc" -ne 0 ]; then echo "skip-fail-closed"; return; fi
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then echo "skip-in-pausa"; return; fi
  echo "procedi"
}

@test "B1 stato pausa non leggibile (rc!=0) → fail-closed, non prende lavori" {
  run pausa_decision 7 ""
  [ "$output" = "skip-fail-closed" ]
}

@test "B2 pausa attiva (valore on) → salta" {
  run pausa_decision 0 '[{"valore":"on"}]'
  [ "$output" = "skip-in-pausa" ]
}

@test "B3 pausa off e leggibile → procede" {
  run pausa_decision 0 '[{"valore":"off"}]'
  [ "$output" = "procedi" ]
}

@test "B4 guardia anti-drift: worker.sh ha il guard PAUSA_FAIL_CLOSED con cattura dell'rc" {
  run grep -F 'PAUSA_FAIL_CLOSED' "$WORKER"
  [ "$status" -eq 0 ]
  run grep -F '_pausa_rc=$?' "$WORKER"
  [ "$status" -eq 0 ]
}
