#!/usr/bin/env bats
# AR-035 — verifica-sensori NON deve sovrascrivere lo stato dei sensori (che il Pannello mostra a Nicola)
# quando gira da un ambiente senza chiavi (es. sessione cloud senza .env): sarebbe una falsa cecità che
# clobbera lo stato reale del VPS. Deve scrivere solo se l'ambiente è configurato o è un update MCP esplicito.
# Il file reale viene ripristinato da git dopo ogni test (teardown), così la suite non lo modifica.

CECITA="MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json"

setup() { cd "$BATS_TEST_DIRNAME/../.."; }
teardown() { git checkout HEAD -- "$CECITA" 2>/dev/null || true; }

# Esegue verifica-sensori pulendo dall'ambiente TUTTE le chiavi sensore (simula la sessione cloud).
run_sensori() {
  env -u MARKETPLACE_SUPABASE_URL -u MARKETPLACE_SUPABASE_KEY -u STRIPE_SECRET_KEY \
      -u RESEND_API_KEY -u MARKETPLACE_SITE_URL -u POSTHOG_API_KEY -u POSTHOG_PERSONAL_API_KEY \
      node cervello/verifica-sensori.mjs --json "$@"
}

@test "ambiente senza chiavi: stato_persistito=false (non clobbera)" {
  run run_sensori
  echo "$output" | grep -q '"stato_persistito": false' || { echo "atteso stato_persistito false: $output" | tail -3; false; }
}

@test "ambiente senza chiavi: il file su disco resta byte-identico" {
  before="$(md5sum "$CECITA" | cut -d' ' -f1)"
  run_sensori >/dev/null 2>&1 || true
  after="$(md5sum "$CECITA" | cut -d' ' -f1)"
  [ "$before" = "$after" ]
}

@test "aggiornamento MCP esplicito: stato_persistito=true (scrive)" {
  run run_sensori --mcp-supabase=cieco
  echo "$output" | grep -q '"stato_persistito": true' || { echo "atteso stato_persistito true con --mcp: $output" | tail -3; false; }
}

@test "guardia anti-drift: la scrittura del file è dietro il guard scriviStato" {
  run grep -n 'if (scriviStato)' cervello/verifica-sensori.mjs
  [ "$status" -eq 0 ]
}
