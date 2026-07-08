#!/usr/bin/env bats
# AR-103 — il cancello di CONSENSO PER-AZIONE deve restare cablato negli esecutori.
# Due livelli: (1) guardie anti-drift (grep) che il fix è presente nel sorgente; (2) la suite
# comportamentale node (trovaAzione/approvata/allowlist/pausa fail-closed).

DIR="$BATS_TEST_DIRNAME/.."
ESEG="$DIR/esegui-azione.mjs"
MKT="$DIR/marketplace.mjs"
MOD="$DIR/consenso-azione.mjs"
ALLOW="$DIR/mani-allowlist.json"

@test "modulo consenso esiste e ha il cancello unico" {
  run grep -F 'export async function consensoInvio' "$MOD"
  [ "$status" -eq 0 ]
}

@test "PAUSA dentro l'esecutore è FAIL-CLOSED (bloccante di default)" {
  run grep -F 'PAUSA non verificabile' "$MOD"
  [ "$status" -eq 0 ]
  run grep -F 'bloccante: true' "$MOD"
  [ "$status" -eq 0 ]
}

@test "esegui-azione importa e usa il cancello prima di ogni invio" {
  run grep -F 'from "./consenso-azione.mjs"' "$ESEG"
  [ "$status" -eq 0 ]
  # ogni mano passa da invioAutorizzato
  run grep -c 'await invioAutorizzato(' "$ESEG"
  [ "$status" -eq 0 ]
  [ "$output" -ge 5 ]   # telegram, email, notifica, n8n, github-merge
}

@test "marketplace importa e usa il cancello sulle 3 scritture" {
  run grep -F 'from "./consenso-azione.mjs"' "$MKT"
  [ "$status" -eq 0 ]
  run grep -c 'await scritturaAutorizzata(' "$MKT"
  [ "$status" -eq 0 ]
  [ "$output" -ge 3 ]   # setSettings, inserisci, aggiorna
}

@test "allowlist di default è BLOCCATA (nessun destinatario sbloccato)" {
  run grep -F '"email": []' "$ALLOW"
  [ "$status" -eq 0 ]
  run grep -F '"n8n": false' "$ALLOW"
  [ "$status" -eq 0 ]
}

@test "anti-drift codici casella: stesse costanti del Pannello (31,131,26,100)" {
  run grep -F 'Math.imul(31, h)' "$MOD"
  [ "$status" -eq 0 ]
  run grep -F 'Math.imul(131, h)' "$MOD"
  [ "$status" -eq 0 ]
}

@test "suite comportamentale node (se node è disponibile)" {
  if ! command -v node >/dev/null 2>&1; then skip "node non disponibile"; fi
  run node --test "$BATS_TEST_DIRNAME/consenso-azione.test.mjs"
  [ "$status" -eq 0 ]
}
