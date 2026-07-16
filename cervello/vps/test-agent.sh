#!/usr/bin/env bash
# test-agent.sh — verifica che il motore AI funzioni sul VPS (headless).
#   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-agent.sh
set -uo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
cd "$REPO"
ENV_FILE="$REPO/cervello/vps/.env"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

. "$REPO/cervello/motore-ai.sh"

TO="${TEST_AGENT_TIMEOUT:-90}"

echo "=== Test motore AI MyCity ==="
echo "Motore: $(ai_engine) ($(ai_cli_name))"
echo "HOME=$HOME  PATH=$PATH"

eng="$(ai_engine)"
if [ "$eng" = cursor ]; then
  mode="$(ai_cursor_auth_mode || true)"
  case "$mode" in
    api_key) echo "Auth Cursor: CURSOR_API_KEY (${#CURSOR_API_KEY} caratteri)" ;;
    login)   echo "Auth Cursor: agent login (abbonamento, senza API key nel .env)" ;;
    *)       echo "✗ Cursor non autenticato (manca key e agent login)" >&2; exit 1 ;;
  esac
elif [ "$eng" = claude ]; then
  mode="$(ai_claude_auth_mode || true)"
  case "$mode" in
    oauth_token) echo "Auth Claude: CLAUDE_CODE_OAUTH_TOKEN (token headless da setup-token)" ;;
    api_key)     echo "Auth Claude: ANTHROPIC_API_KEY (API a consumo)" ;;
    login)       echo "Auth Claude: claude login (credenziali su disco)" ;;
    *)
      echo "✗ Claude non autenticato (né token nel .env né claude login)." >&2
      echo "  Fix: sudo bash $REPO/cervello/vps/collega-claude.sh" >&2
      exit 1
      ;;
  esac
fi

if ! ai_check; then exit 1; fi

cli="$(ai_cli_name)"
if command -v "$cli" >/dev/null 2>&1; then
  echo "Versione $cli: $($cli --version 2>/dev/null || echo '?')"
fi

if [ "$eng" = cursor ]; then
  if grep -q '\--trust' "$REPO/cervello/motore-ai.sh" 2>/dev/null; then
    echo "motore-ai.sh: --trust presente ✓"
  else
    echo "⚠ motore-ai.sh SENZA --trust — esegui aggiorna-cervello.sh" >&2
  fi
fi

ai_build_cmd
echo "Comando: ${AI_CMD[*]}"
echo "Attendo risposta (max ${TO}s)…"
echo "---"

rc=0
out="$(timeout --kill-after=10s "$TO" "${AI_CMD[@]}" "Rispondi SOLO con la parola OK, nient'altro." 2>&1)" || rc=$?
printf '%s\n' "$out"

if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
  echo "✗ TIMEOUT dopo ${TO}s — il motore non risponde." >&2
  if [ "$eng" = cursor ]; then
    echo "  Possibili cause: rete VPS→Cursor bloccata, login scaduto, API Cursor giù." >&2
    echo "  Prova: curl -sI https://api2.cursor.sh | head -3" >&2
    echo "  Rifai login: sudo -u mycity -H bash -lc 'export NO_OPEN_BROWSER=1; agent login'" >&2
  elif [ "$eng" = claude ]; then
    echo "  Possibili cause: token scaduto/revocato, quota/session-limit del piano, rete VPS→Anthropic bloccata." >&2
    echo "  Ricollega: sudo bash $REPO/cervello/vps/collega-claude.sh" >&2
  fi
  exit 1
fi
if [ "$rc" -ne 0 ]; then
  echo "✗ $cli fallito (rc=$rc)" >&2
  exit 1
fi
echo "✓ $cli risponde correttamente."
