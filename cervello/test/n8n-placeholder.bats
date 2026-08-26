#!/usr/bin/env bats
# n8n con URL segnaposto → non_configurato (non cecità infinita) + max_giri_ciechi_dati=0

CECITA="MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json"

setup() {
  cd "$BATS_TEST_DIRNAME/../.."
  # ⏭️ AR-652 — QUESTA PROVA PRESUMEVA IL VPS SENZA DIRLO.
  #
  # `verifica-sensori.mjs` esce 2 («non misurato») dove non c'è nessuna chiave: in una sessione
  # senza `MARKETPLACE_SUPABASE_URL` questi due casi uscivano ROSSI su codice sano, e prima di
  # AR-587 uscivano VERDI per un exit 0 che non misurava niente. Né l'uno né l'altro è la verità:
  # la verità è che qui non si può provare. Si dichiara, e il banco lo conta fra le non misurate —
  # un caso saltato non è un caso passato.
  [ -n "${MARKETPLACE_SUPABASE_URL:-}" ] || skip "senza MARKETPLACE_SUPABASE_URL i sensori non si possono misurare: questa prova vuole l'ambiente del VPS"
}
teardown() { git checkout HEAD -- "$CECITA" 2>/dev/null || true; }

@test "N8N_WEBHOOK_URL tuo-n8n: n8n_health non_configurato" {
  run env N8N_WEBHOOK_URL=https://tuo-n8n/webhook/mycity node cervello/verifica-sensori.mjs --json
  [ "$status" -eq 0 ]
  echo "$output" | grep -q '"nome": "n8n_health"' || false
  echo "$output" | grep -q 'non_configurato\|segnaposto' || {
    echo "$output" | grep -A2 n8n_health || true
    false
  }
}

@test "n8n segnaposto: max_giri_ciechi_dati resta 0 se REST ok" {
  run env N8N_WEBHOOK_URL=https://tuo-n8n/webhook/mycity node cervello/verifica-sensori.mjs --json
  [ "$status" -eq 0 ]
  echo "$output" | grep -q '"max_giri_ciechi_dati": 0' || {
    echo "atteso max_giri_ciechi_dati 0: $output" | tail -5
    false
  }
}
