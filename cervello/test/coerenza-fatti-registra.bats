#!/usr/bin/env bats
# Sicurezza di SCRITTURA del registro-fatti (fonte unica della verità, AR-102).
# Garanzia richiesta da Nicola: "scrivo in chat → cambia PROPRIO quel dato, non fa casino".
#   - `registra` colpisce il fatto per ID esatto;
#   - un id-refuso (negozio.far) è RIFIUTATO senza --nuovo → niente fatti-duplicato creati per sbaglio;
#   - --dry mostra l'anteprima e NON scrive.
# Il registro vero non viene toccato: i test girano su un registro temporaneo (env COERENZA_FATTI_REGISTRO).

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
CF="$ROOT/cervello/coerenza-fatti.mjs"

setup() {
  TMP="$(mktemp -d)"
  export COERENZA_FATTI_REGISTRO="$TMP/registro.json"
  export COERENZA_FATTI_REPORT="$TMP/report.json"
  cat > "$COERENZA_FATTI_REGISTRO" <<'JSON'
{
  "versione": 1,
  "aggiornato": "2026-07-17 00:00",
  "fatti": [
    { "id": "negozio.faro", "nome": "Negozio faro", "valore": "Pane Quotidiano", "fonte": "test", "aggiornato": "2026-07-17 00:00", "storia": [], "caccia": [], "esenzioni": [] },
    { "id": "northstar.consegnati", "nome": "Ordini consegnati", "valore": "0", "fonte": "test", "aggiornato": "2026-07-17 00:00", "storia": [], "caccia": [], "esenzioni": [] }
  ]
}
JSON
}

teardown() { rm -rf "$TMP"; }

@test "id-refuso senza --nuovo è RIFIUTATO e suggerisce l'id giusto" {
  run node "$CF" registra negozio.far "Valore Sbagliato"
  [ "$status" -eq 1 ]
  [[ "$output" == *"NON esiste"* ]]
  [[ "$output" == *"negozio.faro"* ]]
}

@test "id inesistente NON crea un fatto-fantasma nel file" {
  node "$CF" registra negozio.far "Valore Sbagliato" || true
  ! grep -q '"id": "negozio.far"' "$COERENZA_FATTI_REGISTRO"
}

@test "--nuovo crea davvero un fatto nuovo" {
  run node "$CF" registra prova.nuovo "Valore X" --nuovo
  [ "$status" -eq 0 ]
  [[ "$output" == *"Registrato"* ]]
  grep -q '"id": "prova.nuovo"' "$COERENZA_FATTI_REGISTRO"
}

@test "--dry mostra l'anteprima ma NON scrive" {
  run node "$CF" registra negozio.faro "Panificio Prova" --caccia "Pane Quotidiano da bonificare prova" --dry
  [ "$status" -eq 0 ]
  [[ "$output" == *"DRY"* ]]
  ! grep -q "Panificio Prova" "$COERENZA_FATTI_REGISTRO"
}

@test "registra per id esatto aggiorna il valore e conserva il vecchio in storia" {
  run node "$CF" registra negozio.faro "Panificio Nuovo" --caccia "Pane Quotidiano da bonificare prova"
  [ "$status" -eq 0 ]
  grep -q "Panificio Nuovo" "$COERENZA_FATTI_REGISTRO"
  grep -q '"fino_a"' "$COERENZA_FATTI_REGISTRO"
}

@test "colpisce SOLO il fatto giusto: aggiornare negozio.faro non tocca northstar" {
  node "$CF" registra negozio.faro "Panificio Nuovo" --caccia "Pane Quotidiano da bonificare prova"
  run node "$CF" lista
  [[ "$output" == *"northstar.consegnati = «0»"* ]]
}
