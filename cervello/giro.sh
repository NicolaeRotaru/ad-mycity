#!/usr/bin/env bash
# giro.sh — GIRO DI PERLUSTRAZIONE dell'AD MyCity con Claude Code (piano Max), per VPS Linux.
# Equivalente Linux di giro.ps1. Gira nella cartella del repo, cosi' Claude Code prende
# automaticamente CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.
# Lo lancia il timer systemd (cervello/vps/mycity-giro.timer) ogni 2 ore.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

# Carica i segreti del server (se presenti). Su systemd arrivano anche da EnvironmentFile.
ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

ts() { date '+%Y-%m-%d %H:%M'; }

# Claude Code installato e loggato col Max?
if ! command -v claude >/dev/null 2>&1; then
  echo "[$(ts)] Claude Code (CLI 'claude') non trovato. Installalo e fai 'claude login' col tuo piano Max." >&2
  exit 1
fi

# Kill-switch: se il Pannello ha messo l'AD in PAUSA (impostazioni.pausa = on), non girare.
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    echo "[$(ts)] AD in PAUSA (kill-switch): giro saltato."
    exit 0
  fi
fi

# Esegue il giro. acceptEdits: l'AD scrive nella sua memoria (il vault) senza chiedere ogni volta.
# Le azioni 🔴 restano comunque da firmare (regole in CLAUDE.md).
echo "[$(ts)] Avvio giro di perlustrazione AD..."
claude -p "$(cat "$SCRIPT_DIR/giro.md")" --permission-mode acceptEdits || {
  echo "[$(ts)] Claude ha restituito un errore (giro non completato)." >&2
}
echo "[$(ts)] Giro completato."

# --- Sync del vault su GitHub: cosi' il Pannello (via OBSIDIAN_*) vede subito briefing/azioni/stato ---
branch="${GIT_BRANCH:-main}"
git add MyCity-Vault/ memoria-squadra/ consegne/ creativi/ 2>/dev/null || true
if git diff --cached --quiet 2>/dev/null; then
  echo "[$(ts)] Nessuna modifica al vault da inviare."
else
  git -c user.email="ad@mycity.local" -c user.name="AD MyCity (VPS)" \
    commit -q -m "giro AD: aggiorna memoria ($(ts))" || true
  git pull --rebase origin "$branch" 2>/dev/null || true
  if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
    # Token usato solo al volo nell'URL di push: non resta salvato nella config.
    if git push "https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git" "HEAD:${branch}" 2>/dev/null; then
      echo "[$(ts)] Vault sincronizzato su GitHub ($branch)."
    else
      echo "[$(ts)] Push del vault fallito (controlla GIT_PUSH_TOKEN / GIT_REPO / GIT_BRANCH)." >&2
    fi
  else
    echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: salto il push (il vault resta solo sul server)."
  fi
fi
