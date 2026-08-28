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

# 28/8/2026 — QUI C'ERA UNA GREP, ED È DIVENTATA ROSSA PERCHÉ IL CODICE È MIGLIORATO.
#
# La prova cercava la riga `if (scriviStato)` dentro verifica-sensori.mjs. Il guard nel frattempo si
# è irrigidito in `if (scriviStato && !SOLA_LETTURA)`: la scrittura è protetta MEGLIO di prima, e la
# prova è diventata rossa lo stesso. Una prova che non sa distinguere un rinforzo da una
# regressione non protegge niente: dice solo che il testo è cambiato.
#
# Adesso si guarda il comportamento vero: in sola lettura il file NON si tocca. Misurato prima di
# scriverla — senza `--sola-lettura` l'impronta del file cambia, con `--sola-lettura` resta identica.
@test "in sola lettura il file dei sensori non si tocca, nemmeno con un aggiornamento MCP esplicito" {
  before="$(md5sum "$CECITA" | cut -d' ' -f1)"
  run_sensori --mcp-supabase=cieco --sola-lettura >/dev/null 2>&1 || true
  after="$(md5sum "$CECITA" | cut -d' ' -f1)"
  [ "$before" = "$after" ] || { echo "il file è stato scritto in sola lettura: il freno !SOLA_LETTURA non c'è più"; false; }
}

# E la controprova, che è ciò che rende la prova qui sopra non vacua: senza `--sola-lettura` lo
# stesso comando il file lo scrive davvero. Senza questa riga, un verifica-sensori che non scrive
# MAI passerebbe il controllo di sopra a pieni voti.
@test "senza sola lettura lo stesso comando il file lo scrive (altrimenti la prova di sopra è vuota)" {
  before="$(md5sum "$CECITA" | cut -d' ' -f1)"
  run_sensori --mcp-supabase=cieco >/dev/null 2>&1 || true
  after="$(md5sum "$CECITA" | cut -d' ' -f1)"
  [ "$before" != "$after" ] || { echo "il file non è cambiato nemmeno scrivendo: la prova del freno non prova niente"; false; }
}
