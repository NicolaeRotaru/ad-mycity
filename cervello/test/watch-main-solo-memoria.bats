#!/usr/bin/env bats
# AR-027 — watch-main non deve riavviare il worker quando un push ha toccato SOLO file di memoria
# (vault/consegne/creativi/memoria-squadra). Questo test verifica il classificatore memoria-vs-codice
# ESATTO usato da watch-main.sh, su una vera fixture git. La regex qui DEVE restare identica a quella
# in cervello/vps/watch-main.sh (blocco AR-027, 2° caso).

# Ritorna 0 (=solo memoria) se tra A e B nessun file di CODICE è cambiato. Copia fedele di watch-main.sh.
solo_memoria() {
  local A="$1" B="$2"
  if ! git diff --name-only "$A" "$B" 2>/dev/null \
       | grep -qvE '^(MyCity-Vault|consegne|creativi|memoria-squadra)/'; then
    return 0
  fi
  return 1
}

setup() {
  cd "$BATS_TEST_TMPDIR"
  git init -q repo && cd repo
  git config user.email t@t && git config user.name t
  mkdir -p MyCity-Vault/90-Memoria-AI cervello
  echo base > MyCity-Vault/90-Memoria-AI/STATO.md
  echo 'echo ciao' > cervello/worker.sh
  git add -A && git commit -q -m base
  BASE="$(git rev-parse HEAD)"
}

@test "push di sola memoria è classificato memoria-only (nessun riavvio)" {
  echo cambiato > MyCity-Vault/90-Memoria-AI/STATO.md
  git commit -qam "solo memoria"
  run solo_memoria "$BASE" HEAD
  [ "$status" -eq 0 ]
}

@test "push che tocca un file di codice NON è memoria-only (riavvio giustificato)" {
  echo 'echo modificato' > cervello/worker.sh
  git commit -qam "codice"
  run solo_memoria "$BASE" HEAD
  [ "$status" -eq 1 ]
}

@test "push misto memoria+codice conta come codice (riavvio)" {
  echo x > MyCity-Vault/90-Memoria-AI/STATO.md
  echo 'echo y' > cervello/worker.sh
  git commit -qam "misto"
  run solo_memoria "$BASE" HEAD
  [ "$status" -eq 1 ]
}

@test "la regex del test è ancora identica a quella di watch-main.sh" {
  # guardia anti-drift: se qualcuno cambia la whitelist nel sorgente, questo test lo segnala
  run grep -F "grep -qvE '^(MyCity-Vault|consegne|creativi|memoria-squadra)/'" \
    "$BATS_TEST_DIRNAME/../vps/watch-main.sh"
  [ "$status" -eq 0 ]
}
