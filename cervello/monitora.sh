#!/usr/bin/env bash
# monitora.sh — GIRO DI MONITORAGGIO WEB dell'AD MyCity (Ondata 3) con Claude Code (piano Max), VPS Linux.
# Gemello di giro.sh ma LEGGERO: lancia cervello/monitora.md (solo le fonti dovute oggi del radar-fonti)
# e aggiorna i file 90-Memoria-AI/Intelligence/*.md. Lo lancia il timer systemd (mycity-monitora.timer)
# una volta al giorno. Riusa la stessa logica di allineamento/sync della memoria di giro.sh.
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

ts() { date '+%Y-%m-%d %H:%M'; }

if ! command -v claude >/dev/null 2>&1; then
  echo "[$(ts)] Claude Code (CLI 'claude') non trovato. Installalo e fai 'claude login' col tuo piano Max." >&2
  exit 1
fi

# Kill-switch: se il Pannello ha messo l'AD in PAUSA, non monitorare.
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    echo "[$(ts)] AD in PAUSA (kill-switch): monitoraggio saltato."
    exit 0
  fi
fi

# --- Prepara il ramo della memoria e ALLINEA IL CODICE a main (come giro.sh) ---
branch="${GIT_BRANCH:-memoria-ad}"
GIT_ID=(-c user.email="ad@mycity.local" -c user.name="AD MyCity (VPS)")
LOCK="$REPO/.git/mycity-sync.lock"
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)
if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
  url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
  (
    flock 9
    if git fetch "$url" "$branch" 2>/dev/null; then
      git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -f -B "$branch" 2>/dev/null || true
    else
      git checkout -f -B "$branch" 2>/dev/null || true
    fi
    memref="$(git rev-parse HEAD 2>/dev/null || echo '')"
    # Allinea il CODICE a main in modo DETERMINISTICO: checkout dei file di main, NIENTE merge
    # (il merge -X theirs andava in conflitto quando memoria-ad e main divergevano → codice vecchio).
    # Poi RIPRISTINA le cartelle di memoria dal ramo memoria-ad (HEAD): risultato = codice di main
    # + memoria accumulata. Il checkout non cancella file e non perde mai il vault.
    if git fetch "$url" main 2>/dev/null; then
      if git checkout FETCH_HEAD -- . 2>/dev/null; then
        for d in "${MEM_DIRS[@]}"; do
          [ -n "$memref" ] && git checkout "$memref" -- "$d" 2>/dev/null || true
        done
        git "${GIT_ID[@]}" commit -q -m "monitoraggio: allinea codice a main, memoria preservata ($(ts))" 2>/dev/null || true
        echo "[$(ts)] Codice allineato a origin/main (deterministico, memoria preservata)."
      else
        echo "[$(ts)] WARN: checkout del codice di main fallito, continuo col codice attuale." >&2
      fi
    fi
  ) 9>"$LOCK" || true
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento codice/memoria (solo locale)." >&2
fi

# Esegue il monitoraggio (LEGGERO: solo le fonti dovute oggi). acceptEdits: scrive nel vault senza chiedere.
# Guardia: leggi il prompt DOPO l'allineamento e abortisci se è vuoto (evita il "--print con input vuoto").
PROMPT="$(cat "$SCRIPT_DIR/monitora.md" 2>/dev/null || true)"
if [ -z "$PROMPT" ]; then
  echo "[$(ts)] ERRORE: cervello/monitora.md non trovato/vuoto dopo l'allineamento; monitoraggio saltato." >&2
  exit 1
fi
echo "[$(ts)] Avvio monitoraggio web AD..."
claude -p "$PROMPT" --permission-mode acceptEdits || {
  echo "[$(ts)] Claude ha restituito un errore (monitoraggio non completato)." >&2
}
echo "[$(ts)] Monitoraggio completato."

# --- Sync della memoria sul ramo 'memoria-ad': commit + push (rebase, NON force) ---
(
  flock 9
  git add -A 2>/dev/null || true
  if git diff --cached --quiet 2>/dev/null; then
    echo "[$(ts)] Nessuna novità dalle fonti da inviare."
  else
    git "${GIT_ID[@]}" commit -q -m "monitoraggio web AD: aggiorna Intelligence ($(ts))" || true
    if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
      url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
      ok=0
      for attempt in 1 2 3; do
        git fetch "$url" "$branch" 2>/dev/null && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
        if git push "$url" "HEAD:${branch}" 2>/dev/null; then
          echo "[$(ts)] Intelligence sincronizzata su GitHub (ramo $branch, tentativo $attempt)."
          ok=1; break
        fi
        echo "[$(ts)] Push tentativo $attempt fallito, riprovo..." >&2
        sleep 3
      done
      [ "$ok" = 1 ] || echo "[$(ts)] Push fallito dopo 3 tentativi (il prossimo monitoraggio recupera)." >&2
    else
      echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: salto il push."
    fi
  fi
) 9>"$LOCK" || true
