#!/usr/bin/env bats
# motore-ai-cursor-auth.bats — Cursor come motore: API key headless + agent login.

ROOT="${BATS_TEST_DIRNAME}/.."
MOTORE="$ROOT/motore-ai.sh"

_setup_mock_agent() {
  export MOCK_AGENT_STATUS="${1:-Not logged in}"
  export MOCK_AGENT_JSON="${2:-}"
  export PATH="$BATS_TEST_TMPDIR:$PATH"
  cat > "$BATS_TEST_TMPDIR/agent" <<'SH'
#!/usr/bin/env bash
# Mock Cursor CLI: status testo + JSON + --api-key
_extra=()
while [ $# -gt 0 ]; do
  case "$1" in
    --api-key) _extra+=("$1" "$2"); shift 2 ;;
    --format) _fmt="$2"; shift 2 ;;
    status) _cmd=status; shift ;;
    *) shift ;;
  esac
done
if [ "${_cmd:-}" = status ]; then
  if [ "${_fmt:-}" = json ]; then
    if [ -n "$MOCK_AGENT_JSON" ]; then
      echo "$MOCK_AGENT_JSON"
    else
      echo '{"authenticated":false}'
    fi
    exit 0
  fi
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

@test "motore-ai: ai_cursor_auth_ok con CURSOR_API_KEY valida (JSON authenticated)" {
  _setup_mock_agent "Not logged in" '{"authenticated":true,"email":"test@example.com"}'
  export CURSOR_API_KEY=test_key
  export CERVELLO_MOTORE=cursor
  _source_motore
  run ai_cursor_auth_ok
  [ "$status" -eq 0 ]
}

@test "motore-ai: ai_cursor_auth_ok rifiuta CURSOR_API_KEY invalida" {
  _setup_mock_agent "Not logged in" '{"authenticated":false}'
  export CURSOR_API_KEY=bad_key
  export CERVELLO_MOTORE=cursor
  _source_motore
  run ai_cursor_auth_ok
  [ "$status" -eq 1 ]
}

@test "motore-ai: ai_cursor_auth_ok con agent login (testo) senza API key" {
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
  [[ "$output" == *"collega-cursor"* ]]
}

@test "motore-ai: ai_build_cmd cursor passa --api-key quando CURSOR_API_KEY è impostata" {
  _setup_mock_agent "ok" '{"authenticated":true}'
  export CURSOR_API_KEY=secret_key
  export CERVELLO_MOTORE=cursor
  _source_motore
  ai_build_cmd
  found=0
  for (( i=0; i<${#AI_CMD[@]}; i++ )); do
    if [ "${AI_CMD[$i]}" = --api-key ] && [ "${AI_CMD[$((i+1))]}" = secret_key ]; then
      found=1
    fi
  done
  [ "$found" -eq 1 ]
}
