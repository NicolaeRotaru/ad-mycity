#!/usr/bin/env bats
# Guardia sul bug del 2026-07-09/10: --allowedTools della CLI claude è VARIADICO — se resta
# l'ULTIMA opzione di AI_CMD, si mangia il prompt che il chiamante appende dopo
# ("${AI_CMD[@]}" "$prompt") e la CLI muore con «Input must be provided…». Per una notte intera
# giro/metabolizza/playbook/esegui-azione sono partiti SENZA prompt: tutti in errore, PR mai aperte.
# Qui blindiamo il contratto: dopo --allowedTools viene sempre un'opzione a valore singolo.

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"

costruisci() {
  # Forza il motore claude senza richiedere la CLI installata (ai_engine non fa command -v se forzato).
  export CERVELLO_MOTORE=claude
  unset CERVELLO_MODELLO AI_ALLOWED_TOOLS 2>/dev/null || true
  # shellcheck disable=SC1091
  . "$ROOT/cervello/motore-ai.sh"
  ai_build_cmd
}

@test "mani armate (AI_ALLOW_ACTIONS=1): --allowedTools NON è l'ultima opzione" {
  export AI_ALLOW_ACTIONS=1
  costruisci
  ultima="${AI_CMD[${#AI_CMD[@]}-1]}"
  [ "$ultima" != "--allowedTools" ]
  # Il valore di --allowedTools deve essere seguito da un'altra opzione (chiude la lista variadica).
  local i trovato=0
  for (( i=0; i<${#AI_CMD[@]}; i++ )); do
    if [ "${AI_CMD[$i]}" = "--allowedTools" ]; then
      dopo_valore="${AI_CMD[$((i+2))]:-}"
      [[ "$dopo_valore" == --* ]]
      trovato=1
    fi
  done
  [ "$trovato" = 1 ]
}

@test "mani armate: l'ultimo elemento è il valore di --permission-mode (il prompt appeso resta prompt)" {
  export AI_ALLOW_ACTIONS=1
  costruisci
  ultima="${AI_CMD[${#AI_CMD[@]}-1]}"
  penultima="${AI_CMD[${#AI_CMD[@]}-2]}"
  [ "$penultima" = "--permission-mode" ]
  [ "$ultima" = "acceptEdits" ]
}

@test "chat (AI_ALLOW_ACTIONS=0): nessun --allowedTools, comando pulito" {
  export AI_ALLOW_ACTIONS=0
  costruisci
  for el in "${AI_CMD[@]}"; do
    [ "$el" != "--allowedTools" ]
  done
}
