#!/usr/bin/env bats
# motore-ai-cursor-auth.bats — Cursor come motore: accetta agent login senza CURSOR_API_KEY.

ROOT="${BATS_TEST_DIRNAME}/.."
MOTORE="$ROOT/motore-ai.sh"

_setup_mock_agent() {
  export MOCK_AGENT_STATUS="${1:-Not logged in}"
  export PATH="$BATS_TEST_TMPDIR:$PATH"
  cat > "$BATS_TEST_TMPDIR/agent" <<'SH'
#!/usr/bin/env bash
if [ "${1:-}" = status ]; then
  echo "$MOCK_AGENT_STATUS"
  exit 0
fi
echo "mock agent"
exit 0
SH
  chmod +x "$BATS_TEST_TMPDIR/agent"
}

_source_motore() {
  # shellcheck disable=SC1090
  . "$MOTORE"
}

@test "motore-ai: ai_cursor_auth_ok con CURSOR_API_KEY senza login" {
  _setup_mock_agent "Not logged in"
  export CURSOR_API_KEY=test_key
  export CERVELLO_MOTORE=cursor
  _source_motore
  run ai_cursor_auth_ok
  [ "$status" -eq 0 ]
}

@test "motore-ai: ai_cursor_auth_ok con agent login senza API key" {
  _setup_mock_agent "Login successful"
  unset CURSOR_API_KEY
  export CERVELLO_MOTORE=cursor
  _source_motore
  run ai_cursor_auth_ok
  [ "$status" -eq 0 ]
  run ai_cursor_auth_mode
  [ "$status" -eq 0 ]
  [ "$output" = login ]
}

@test "motore-ai: ai_check cursor rifiuta senza key né login" {
  _setup_mock_agent "Not logged in"
  unset CURSOR_API_KEY
  export CERVELLO_MOTORE=cursor
  _source_motore
  run ai_check 2>&1
  [ "$status" -eq 1 ]
  [[ "$output" == *"agent login"* ]]
}

@test "motore-ai: ai_check cursor accetta solo agent login" {
  _setup_mock_agent "Login successful"
  unset CURSOR_API_KEY
  export CERVELLO_MOTORE=cursor
  _source_motore
  run ai_check 2>&1
  [ "$status" -eq 0 ]
  [[ "$output" == *"agent login"* ]]
}
