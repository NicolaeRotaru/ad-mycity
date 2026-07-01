#!/usr/bin/env bash
# ritmo-run.sh — cadenze del battito AD (piano mattino / report sera / review settimanale), VPS Linux.
# Lanciato dai timer systemd mycity-ritmo-*.timer. Gemello leggero di monitora.sh.
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"

CADENZA="${1:-}"
case "$CADENZA" in
  mattino|sera|settimana) ;;
  *)
    echo "Uso: $0 mattino|sera|settimana" >&2
    exit 2
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

. "$SCRIPT_DIR/motore-ai.sh"

ts() { date '+%Y-%m-%d %H:%M'; }

ai_check || { echo "[$(ts)] Motore AI non disponibile. Vedi cervello/vps/setup.sh." >&2; exit 1; }

if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    echo "[$(ts)] AD in PAUSA (kill-switch): ritmo $CADENZA saltato."
    exit 0
  fi
fi

branch="${GIT_BRANCH:-memoria-ad}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-ad@mycity.local}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity (VPS)}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
LOCK="$REPO/.git/mycity-sync.lock"
if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
  url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
  (
    flock -w 600 9 || exit 0
    if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ] && [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      git add -A 2>/dev/null || true
      git "${GIT_ID[@]}" commit -q -m "recupero: scritture pendenti da ritmo interrotto ($(ts))" 2>/dev/null || true
      git push "$url" "HEAD:${branch}" 2>/dev/null && echo "[$(ts)] Recuperate scritture pendenti." || true
    fi
    if git fetch "$url" "$branch" 2>/dev/null; then
      git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -f -B "$branch" 2>/dev/null || true
    else
      git checkout -f -B "$branch" 2>/dev/null || true
    fi
    if git fetch "$url" main 2>/dev/null; then
      code_paths=()
      while IFS= read -r p; do
        case "$p" in MyCity-Vault|consegne|creativi|memoria-squadra) ;; *) code_paths+=("$p") ;; esac
      done < <(git ls-tree --name-only FETCH_HEAD)
      if [ "${#code_paths[@]}" -gt 0 ] && git checkout FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null; then
        git "${GIT_ID[@]}" commit -q -m "ritmo $CADENZA: allinea codice a main (vault intatto) ($(ts))" 2>/dev/null || true
        echo "[$(ts)] Codice allineato a origin/main (solo codice, vault intatto)."
      fi
    fi
  ) 9>"$LOCK" || true
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento codice/memoria (solo locale)." >&2
fi

PROMPT_FILE="$SCRIPT_DIR/ritmo-${CADENZA}.md"
PROMPT="$(cat "$PROMPT_FILE" 2>/dev/null || true)"
if [ -z "$PROMPT" ]; then
  echo "[$(ts)] ERRORE: $PROMPT_FILE non trovato/vuoto; ritmo $CADENZA saltato." >&2
  exit 1
fi

echo "[$(ts)] Avvio ritmo AD ($CADENZA, motore: $(ai_engine))..."
ai_build_cmd
"${AI_CMD[@]}" "$PROMPT" || {
  echo "[$(ts)] Il motore AI ha restituito un errore (ritmo $CADENZA non completato)." >&2
}
echo "[$(ts)] Ritmo $CADENZA completato."

(
  flock -w 600 9 || exit 0
  git add -A 2>/dev/null || true
  if git diff --cached --quiet 2>/dev/null; then
    echo "[$(ts)] Nessuna novità da inviare."
  else
    git "${GIT_ID[@]}" commit -q -m "ritmo AD: $CADENZA ($(ts))" || true
    if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
      url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
      ok=0
      for attempt in 1 2 3; do
        git fetch "$url" "$branch" 2>/dev/null && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
        if git push "$url" "HEAD:${branch}" 2>/dev/null; then
          echo "[$(ts)] Ritmo $CADENZA sincronizzato su GitHub (ramo $branch, tentativo $attempt)."
          ok=1; break
        fi
        echo "[$(ts)] Push tentativo $attempt fallito, riprovo..." >&2
        sleep 3
      done
      [ "$ok" = 1 ] || echo "[$(ts)] Push fallito dopo 3 tentativi (il prossimo ritmo recupera)." >&2
    else
      echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: salto il push."
    fi
  fi
) 9>"$LOCK" || true
