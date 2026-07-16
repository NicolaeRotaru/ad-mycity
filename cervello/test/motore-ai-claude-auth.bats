#!/usr/bin/env bats
# motore-ai-claude-auth.bats — Claude come motore: preflight autenticazione headless.
# (Parity col preflight Cursor — fix 2026-07-16: prima un login Claude assente sul VPS si
#  scopriva solo a runtime, con lavori morti e errori criptici in coda.)

ROOT="${BATS_TEST_DIRNAME}/.."
MOTORE="$ROOT/motore-ai.sh"

setup() {
  # ambiente pulito: niente credenziali vere del runner, niente config della macchina
  unset CLAUDE_CODE_OAUTH_TOKEN ANTHROPIC_API_KEY CLAUDE_CONFIG_DIR CERVELLO_CLAUDE_AUTH_CHECK CURSOR_API_KEY
  export HOME="$BATS_TEST_TMPDIR"
  export CERVELLO_MOTORE=claude
  # mock della CLI claude nel PATH: ai_check deve superare il controllo "CLI installata"
  cat > "$BATS_TEST_TMPDIR/claude" <<'SH'
#!/usr/bin/env bash
echo mock-claude
SH
  chmod +x "$BATS_TEST_TMPDIR/claude"
  export PATH="$BATS_TEST_TMPDIR:$PATH"
}

_source_motore() {
  # shellcheck disable=SC1090
  . "$MOTORE"
}

@test "claude-auth: nessuna credenziale → ai_claude_auth_ok fallisce" {
  _source_motore
  run ai_claude_auth_ok
  [ "$status" -ne 0 ]
}

@test "claude-auth: CLAUDE_CODE_OAUTH_TOKEN → mode oauth_token" {
  export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat-test
  _source_motore
  run ai_claude_auth_mode
  [ "$status" -eq 0 ]
  [ "$output" = "oauth_token" ]
}

@test "claude-auth: ANTHROPIC_API_KEY → mode api_key" {
  export ANTHROPIC_API_KEY=sk-ant-api-test
  _source_motore
  run ai_claude_auth_mode
  [ "$status" -eq 0 ]
  [ "$output" = "api_key" ]
}

@test "claude-auth: credenziali di claude login sul disco → mode login" {
  mkdir -p "$HOME/.claude"
  echo '{}' > "$HOME/.claude/.credentials.json"
  _source_motore
  run ai_claude_auth_mode
  [ "$status" -eq 0 ]
  [ "$output" = "login" ]
}

@test "claude-auth: CLAUDE_CONFIG_DIR alternativo viene rispettato" {
  mkdir -p "$BATS_TEST_TMPDIR/cfg"
  echo '{}' > "$BATS_TEST_TMPDIR/cfg/.credentials.json"
  export CLAUDE_CONFIG_DIR="$BATS_TEST_TMPDIR/cfg"
  _source_motore
  run ai_claude_auth_mode
  [ "$status" -eq 0 ]
  [ "$output" = "login" ]
}

@test "claude-auth: ai_check senza credenziali → rc 1 e indica collega-claude.sh" {
  _source_motore
  run ai_check
  [ "$status" -eq 1 ]
  [[ "$output" == *"collega-claude.sh"* ]]
  [[ "$output" == *"setup-token"* ]]
}

@test "claude-auth: ai_check con token → rc 0" {
  export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat-test
  _source_motore
  run ai_check
  [ "$status" -eq 0 ]
}

@test "claude-auth: CERVELLO_CLAUDE_AUTH_CHECK=0 salta il preflight (via di fuga)" {
  export CERVELLO_CLAUDE_AUTH_CHECK=0
  _source_motore
  run ai_check
  [ "$status" -eq 0 ]
}

@test "claude-auth: il preflight Claude non tocca il motore cursor" {
  # motore cursor senza auth: deve fallire per l'auth CURSOR, non per quella Claude
  export CERVELLO_MOTORE=cursor
  cat > "$BATS_TEST_TMPDIR/agent" <<'SH'
#!/usr/bin/env bash
echo "Not logged in"
SH
  chmod +x "$BATS_TEST_TMPDIR/agent"
  _source_motore
  run ai_check
  [ "$status" -eq 1 ]
  [[ "$output" == *"Cursor"* ]]
  [[ "$output" != *"collega-claude"* ]]
}
