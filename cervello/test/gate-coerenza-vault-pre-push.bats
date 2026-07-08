#!/usr/bin/env bats
# AR-104 — il gate COERENZA-FATTI + SANITÀ-VAULT deve essere un CANCELLO BLOCCANTE del push su main
# (non più solo un vincolo soft al motore AI). Tre livelli:
#   (A) comportamentale su vault-sanita.mjs (fixture reali: pulito passa, sporco blocca);
#   (B) mirror della logica di decisione del gate in giro.sh (coerenza rc || sanità rc → blocco + telegram);
#   (C) guardie anti-drift (grep) che il gate è davvero cablato nel percorso di pubblicazione di giro.sh.

DIR="$BATS_TEST_DIRNAME/.."
VS="$DIR/vault-sanita.mjs"
AT="$DIR/avviso-telegram.mjs"
GIRO="$DIR/giro.sh"

need_node() { command -v node >/dev/null 2>&1 || skip "node non disponibile"; }

# ---------- (A) vault-sanita.mjs: comportamento su fixture ----------

@test "vault pulito (md con frontmatter chiuso + json valido) → PASSA (exit 0)" {
  need_node
  local V="$BATS_TEST_TMPDIR/pulito"
  mkdir -p "$V"
  printf -- '---\ndata: 2026-07-08 10:00\n---\n\n# ok\ncontenuto\n' > "$V/STATO.md"
  printf '{"a":1,"b":[2,3]}\n' > "$V/registro.json"
  printf 'note libere senza frontmatter\n' > "$V/note.md"
  run node "$VS" "$V"
  [ "$status" -eq 0 ]
}

@test "file .md con marcatore di conflitto git → BLOCCA (exit != 0)" {
  need_node
  local V="$BATS_TEST_TMPDIR/conflitto"
  mkdir -p "$V"
  printf '# titolo\n<<<<<<< HEAD\nmio\n=======\nloro\n>>>>>>> altro\n' > "$V/STATO.md"
  run node "$VS" "$V"
  [ "$status" -ne 0 ]
  echo "$output" | grep -qi "conflitto"
}

@test "file .md a 0 byte → BLOCCA (exit != 0)" {
  need_node
  local V="$BATS_TEST_TMPDIR/vuoto"
  mkdir -p "$V"
  : > "$V/STATO.md"   # 0 byte
  run node "$VS" "$V"
  [ "$status" -ne 0 ]
  echo "$output" | grep -qi "0 byte"
}

@test "file .json corrotto → BLOCCA (exit != 0)" {
  need_node
  local V="$BATS_TEST_TMPDIR/jsonrotto"
  mkdir -p "$V"
  printf '{"a":1,\n' > "$V/registro.json"   # JSON troncato
  run node "$VS" "$V"
  [ "$status" -ne 0 ]
  echo "$output" | grep -qi "json"
}

@test "frontmatter .md aperto ma mai chiuso → BLOCCA (exit != 0)" {
  need_node
  local V="$BATS_TEST_TMPDIR/fm"
  mkdir -p "$V"
  printf -- '---\ndata: 2026-07-08 10:00\ntitolo: senza chiusura\n\n# corpo\n' > "$V/STATO.md"
  run node "$VS" "$V"
  [ "$status" -ne 0 ]
  echo "$output" | grep -qi "frontmatter"
}

@test "cartella inesistente → FAIL-CLOSED (exit != 0, non 'ok pubblica')" {
  need_node
  run node "$VS" "$BATS_TEST_TMPDIR/non-esiste-affatto"
  [ "$status" -ne 0 ]
}

# ---------- (B) mirror della decisione del gate di giro.sh ----------
# Copia fedele della logica: se coerenza-fatti rc!=0 OPPURE vault-sanità rc!=0 → blocco + avviso Telegram.
# Qui stubbiamo i due comandi come fa il repo per i test comportamentali.
decisione_gate() { # $1 = rc coerenza, $2 = rc sanità → echo "BLOCCA:motivo" o "OK"
  local cf_rc="$1" vs_rc="$2" incoerente=0 motivi=""
  if [ "$cf_rc" -ne 0 ]; then incoerente=1; motivi="${motivi}coerenza-fatti rc=$cf_rc; "; fi
  if [ "$vs_rc" -ne 0 ]; then incoerente=1; motivi="${motivi}vault-sanità rc=$vs_rc; "; fi
  if [ "$incoerente" = 1 ]; then echo "BLOCCA:$motivi"; else echo "OK"; fi
}

@test "gate: coerenza ok + sanità ok → OK (push lasciato passare)" {
  run decisione_gate 0 0
  [ "$output" = "OK" ]
}

@test "gate: coerenza rc!=0 (copia vecchia di un fatto) → BLOCCA" {
  run decisione_gate 1 0
  echo "$output" | grep -q "^BLOCCA:"
  echo "$output" | grep -q "coerenza-fatti rc=1"
}

@test "gate: sanità rc!=0 (conflitto/0-byte) → BLOCCA" {
  run decisione_gate 0 1
  echo "$output" | grep -q "^BLOCCA:"
  echo "$output" | grep -q "vault-sanità rc=1"
}

@test "avviso-telegram in dry-run (senza chiavi) → exit 0 e stampa il messaggio" {
  need_node
  unset TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID
  run node "$AT" "⚠️ MyCity: memoria incoerente, giro NON pubblicato (test)."
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "DRY-RUN"
  echo "$output" | grep -q "memoria incoerente"
}

# ---------- (C) guardie anti-drift: il gate è cablato nel percorso di pubblicazione ----------

@test "giro.sh: coerenza-fatti è RIeseguita nel blocco pre-push (AR-104)" {
  run grep -F 'AR-104: GATE COERENZA-FATTI + SANITÀ VAULT' "$GIRO"
  [ "$status" -eq 0 ]
  run grep -F 'node "$SCRIPT_DIR/coerenza-fatti.mjs" 2>&1)"; _cf_rc=$?' "$GIRO"
  [ "$status" -eq 0 ]
}

@test "giro.sh: vault-sanita è chiamato prima del push" {
  run grep -F 'node "$SCRIPT_DIR/vault-sanita.mjs" "MyCity-Vault/90-Memoria-AI" 2>&1)"; _vs_rc=$?' "$GIRO"
  [ "$status" -eq 0 ]
}

@test "giro.sh: MEMORIA_INCOERENTE blocca il push (GIRO_PUSH_OK=0) come scan-segreti/onesta" {
  run grep -F '[ "$MEMORIA_INCOERENTE" = 1 ]; then' "$GIRO"
  [ "$status" -eq 0 ]
}

@test "giro.sh: il blocco del gate NON è un successo silenzioso (exit 2)" {
  run grep -F 'if [ "${MEMORIA_INCOERENTE:-0}" = 1 ]; then' "$GIRO"
  [ "$status" -eq 0 ]
  run grep -A2 'GATE MEMORIA (AR-104): pubblicazione bloccata' "$GIRO"
  echo "$output" | grep -q "exit 2"
}

@test "giro.sh: fail-closed se node manca (impossibile verificare → non pubblicare)" {
  run grep -F 'node non disponibile — sync BLOCCATA (fail-closed)' "$GIRO"
  [ "$status" -eq 0 ]
}

@test "giro.sh: manda un avviso Telegram sullo stesso canale (avviso-telegram.mjs)" {
  run grep -F 'node "$SCRIPT_DIR/avviso-telegram.mjs"' "$GIRO"
  [ "$status" -eq 0 ]
}
