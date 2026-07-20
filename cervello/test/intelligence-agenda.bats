#!/usr/bin/env bats
# intelligence-agenda.mjs — agenda fonti dovute oggi

@test "intelligence-agenda esce 0 e scrive JSON" {
  run node cervello/intelligence-agenda.mjs --json
  [ "$status" -eq 0 ]
  [[ "$output" == *"fonti_dovute"* ]]
  [ -f cervello/intelligence-agenda.json ]
}

@test "intelligence-agenda include fonti giornaliere" {
  run node cervello/intelligence-agenda.mjs --json
  [[ "$output" == *"liberta-attualita"* ]] || [[ "$output" == *"cciaa-emilia-bandi"* ]]
}
