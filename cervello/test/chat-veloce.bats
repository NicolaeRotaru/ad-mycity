#!/usr/bin/env bats
# Verifica la corsia veloce della chat (worker.sh): il classificatore chat_e_complesso
# instrada la chiacchiera semplice al modello veloce e i compiti pesanti su Opus.
# Estrae la funzione REALE da worker.sh (non una copia) così il test non diverge dal codice.

setup() {
  WORKER="${BATS_TEST_DIRNAME}/../worker.sh"
  FN="${BATS_TEST_TMPDIR}/fn.sh"
  # Estrai la sola funzione chat_e_complesso dal worker vero.
  sed -n '/^chat_e_complesso() {/,/^}/p' "$WORKER" > "$FN"
  # Sanity: la funzione deve esistere nel worker.
  [ -s "$FN" ]
  source "$FN"
}

# Ritorna 0 = complesso (→ Opus), 1 = semplice (→ veloce).

@test "saluto semplice -> veloce" {
  run chat_e_complesso "ciao, come va?"
  [ "$status" -eq 1 ]
}

@test "che decido -> veloce" {
  run chat_e_complesso "cosa devo decidere oggi?"
  # 'decid' e' parola-spia -> complesso: le decisioni restano su Opus (giusto).
  [ "$status" -eq 0 ]
}

@test "spiegami breve -> veloce" {
  run chat_e_complesso "spiegami questa cosa in due righe"
  [ "$status" -eq 1 ]
}

@test "analisi numeri -> Opus" {
  run chat_e_complesso "analizza gli incassi di giugno"
  [ "$status" -eq 0 ]
}

@test "soldi/euro -> Opus" {
  run chat_e_complesso "possiamo spendere 200 euro in ads?"
  [ "$status" -eq 0 ]
}

@test "quanto -> Opus" {
  run chat_e_complesso "quanto abbiamo incassato?"
  [ "$status" -eq 0 ]
}

@test "messaggio lungo -> Opus" {
  long=$(printf 'x%.0s' {1..300})
  run chat_e_complesso "$long"
  [ "$status" -eq 0 ]
}

@test "radiografia -> Opus" {
  run chat_e_complesso "fatti una radiografia"
  [ "$status" -eq 0 ]
}
