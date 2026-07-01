#!/usr/bin/env bash
# ritmo.sh — Cadenze del battito AD (mattino | sera | settimana), motore AI Cursor 'agent' o Claude 'claude'.
# Legge cervello/ritmo.md dal disco e aggiorna 90-Memoria-AI/RITMO.md (+ SALA/STATO come da prompt).
# Lanciato dai timer systemd (mycity-ritmo-*.timer) o a mano: ritmo-ora.sh {mattino|sera|settimana}
set -uo pipefail

export TZ="${TZ:-Europe/Rome}"

RITMO_TIPO="${1:-}"
case "$RITMO_TIPO" in
  mattino)
    RITMO_SEZIONE_MD="PIANO DEL MATTINO"
    RITMO_TITOLO="Piano del mattino"
    ;;
  sera)
    RITMO_SEZIONE_MD="REPORT DELLA SERA"
    RITMO_TITOLO="Report della sera"
    ;;
  settimana)
    RITMO_SEZIONE_MD="REVIEW + RETROSPETTIVA"
    RITMO_TITOLO="Review settimanale"
    ;;
  *)
    echo "Uso: ritmo.sh {mattino|sera|settimana}" >&2
    exit 1
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

. "$SCRIPT_DIR/motore-ai.sh"

ts() { date '+%Y-%m-%d %H:%M'; }

ai_check || { echo "[$(ts)] Motore AI non disponibile. Vedi cervello/vps/setup.sh e test-agent.sh." >&2; exit 1; }

if [ -f "$REPO/.git/config" ] && ! test -w "$REPO/.git/config" 2>/dev/null; then
  echo "[$(ts)] ERRORE: .git/config non scrivibile da $(id -un) — git bloccato." >&2
  echo "[$(ts)]   Fix (come root): sudo chown -R mycity:mycity $REPO && sudo systemctl restart mycity-worker" >&2
  exit 1
fi

if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    echo "[$(ts)] AD in PAUSA (kill-switch): ritmo $RITMO_TIPO saltato."
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
        git "${GIT_ID[@]}" commit -q -m "ritmo: allinea codice a main (vault intatto) ($(ts))" 2>/dev/null || true
        echo "[$(ts)] Codice allineato a origin/main (solo codice, vault intatto)."
      else
        echo "[$(ts)] WARN: allineamento del codice fallito, continuo col codice attuale." >&2
      fi
    fi
  ) 9>"$LOCK" || true
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento codice/memoria (solo locale)." >&2
fi

if [ ! -s "$SCRIPT_DIR/ritmo.md" ]; then
  echo "[$(ts)] ERRORE: cervello/ritmo.md non trovato/vuoto dopo l'allineamento; ritmo saltato." >&2
  exit 1
fi

PROMPT="Sei l'AD digitale di MyCity (segui CLAUDE.md e gli agenti in .claude/agents/).

## Compito
Leggi ed esegui **per intero** la sezione «${RITMO_SEZIONE_MD}» del file cervello/ritmo.md (aprilo dal disco con Read, NON saltare passi).
Scrivi sul disco tutti i file richiesti (vault, RITMO.md, SALA-OPERATIVA, STATO, ecc.). Rispetta 🟢🟡🔴.

## Obbligatorio per RITMO.md
Aggiungi in fondo a MyCity-Vault/90-Memoria-AI/RITMO.md un blocco con intestazione esatta:
## ${RITMO_TITOLO} · AAAA-MM-GG HH:MM (ora di Piacenza, con i minuti), seguito dal contenuto.
L'ultimo blocco con questa intestazione è quello che legge il Pannello (/api/ritmo).

La memoria va sul ramo memoria-ad (il push git lo fa ritmo.sh dopo di te — tu scrivi i file).

## Risposta in chat
Al termine restituisci un riepilogo breve (5-8 righe)."

echo "[$(ts)] Avvio ritmo AD ($RITMO_TIPO, motore: $(ai_engine))..."
ai_build_cmd
echo "[$(ts)] Comando: ${AI_CMD[*]} (prompt ${#PROMPT} caratteri)" >&2
ai_rc=0
_ai_out=""
RITMO_TIMEOUT="${RITMO_TIMEOUT:-900}"
for _attempt in 1 2 3; do
  ai_rc=0
  _ai_out="$(timeout --kill-after=60s "$RITMO_TIMEOUT" "${AI_CMD[@]}" "$PROMPT" 2>&1)" || ai_rc=$?
  printf '%s\n' "$_ai_out"
  [ "$ai_rc" -eq 0 ] && break
  echo "[$(ts)] Motore AI tentativo $_attempt fallito (rc=$ai_rc) — riprovo tra 30s..." >&2
  printf '%s\n' "$_ai_out" | tail -30 >&2
  [ "$_attempt" -lt 3 ] && sleep 30
done
if [ "$ai_rc" -ne 0 ]; then
  echo "[$(ts)] Il motore AI ha restituito un errore dopo 3 tentativi (rc=$ai_rc)." >&2
  printf '%s\n' "$_ai_out" | tail -25 >&2
fi
echo "[$(ts)] Ritmo $RITMO_TIPO completato."

RITMO_PUSH_OK=1
RITMO_HAD_CHANGES=0
exec 9>"$LOCK"
if flock -w 600 9; then
  git add -A 2>/dev/null || true
  if git diff --cached --quiet 2>/dev/null; then
    echo "[$(ts)] Nessuna modifica al vault da inviare."
  else
    RITMO_HAD_CHANGES=1
    git "${GIT_ID[@]}" commit -q -m "ritmo AD ($RITMO_TIPO): aggiorna memoria ($(ts))" || true
    if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
      url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
      ok=0
      for attempt in 1 2 3; do
        git fetch "$url" "$branch" 2>/dev/null && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
        if git push "$url" "HEAD:${branch}" 2>/dev/null; then
          echo "[$(ts)] Memoria sincronizzata su GitHub (ramo $branch, tentativo $attempt)."
          ok=1
          break
        fi
        echo "[$(ts)] Push tentativo $attempt fallito, riprovo..." >&2
        sleep 3
      done
      [ "$ok" = 1 ] || RITMO_PUSH_OK=0
    else
      RITMO_PUSH_OK=0
    fi
  fi
else
  RITMO_PUSH_OK=0
  echo "[$(ts)] WARN: lock git occupato — sync memoria saltata." >&2
fi
exec 9>&-

if [ "$RITMO_HAD_CHANGES" = 1 ] && [ "$RITMO_PUSH_OK" != 1 ]; then
  exit 2
fi
if [ "$ai_rc" -ne 0 ]; then
  if [ "$RITMO_HAD_CHANGES" = 1 ] && [ "$RITMO_PUSH_OK" = 1 ]; then
    echo "[$(ts)] WARN: motore AI instabile ma memoria pubblicata." >&2
    exit 0
  fi
  exit 1
fi
exit 0
