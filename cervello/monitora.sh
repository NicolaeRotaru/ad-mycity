#!/usr/bin/env bash
# monitora.sh — GIRO DI MONITORAGGIO WEB dell'AD MyCity (Ondata 3), motore AI Cursor 'agent' o Claude 'claude', VPS Linux.
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

# Motore AI condiviso (Cursor 'agent' di default, oppure Claude 'claude'). Vedi cervello/motore-ai.sh.
. "$SCRIPT_DIR/motore-ai.sh"

ts() { date '+%Y-%m-%d %H:%M'; }

ai_check || { echo "[$(ts)] Motore AI non disponibile. Vedi cervello/vps/setup.sh." >&2; exit 1; }

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
branch="${GIT_BRANCH:-main}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-98592323+NicolaeRotaru@users.noreply.github.com}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity (VPS)}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
LOCK="$REPO/.git/mycity-sync.lock"
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)
if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
  url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
  (
    flock -w 600 9 || exit 0   # Fix A: timeout sul lock — niente hang se un altro processo resta appeso
    # Fix B: se un run precedente è morto lasciando scritture del vault NON committate (siamo ancora sul
    # ramo della memoria), salvale e pushale PRIMA del reset distruttivo qui sotto, così non vengono perse.
    if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ] && [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      git add -A 2>/dev/null || true
      git "${GIT_ID[@]}" commit -q -m "recupero: scritture pendenti da un run interrotto ($(ts))" 2>/dev/null || true
      git push "$url" "HEAD:${branch}" 2>/dev/null && echo "[$(ts)] Recuperate scritture pendenti di un run precedente." || true
    fi
    if git fetch "$url" "$branch" 2>/dev/null; then
      git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -f -B "$branch" 2>/dev/null || true
    else
      git checkout -f -B "$branch" 2>/dev/null || true
    fi
    # Allinea SOLO il CODICE a main (NIENTE merge, e soprattutto NIENTE checkout delle cartelle di
    # memoria). Prendo i soli path top-level di main che NON sono cartelle di memoria: così il vault
    # (MyCity-Vault/consegne/creativi/memoria-squadra) non viene MAI toccato dall'allineamento →
    # impossibile resuscitare file potati dall'AD o sovrascrivere scritture del vault. Deterministico,
    # niente conflitti. (La memoria resta quella del ramo unico main, ripresa dal remoto sopra.)
    if git fetch "$url" main 2>/dev/null; then
      code_paths=()
      while IFS= read -r p; do
        case "$p" in MyCity-Vault|consegne|creativi|memoria-squadra) ;; *) code_paths+=("$p") ;; esac
      done < <(git ls-tree --name-only FETCH_HEAD)
      if [ "${#code_paths[@]}" -gt 0 ] && git checkout FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null; then
        git "${GIT_ID[@]}" commit -q -m "monitoraggio: allinea codice a main (vault intatto) ($(ts))" 2>/dev/null || true
        echo "[$(ts)] Codice allineato a origin/main (solo codice, vault intatto)."
      else
        echo "[$(ts)] WARN: allineamento del codice fallito, continuo col codice attuale." >&2
      fi
    fi
  ) 9>"$LOCK" || true
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento codice/memoria (solo locale)." >&2
fi

# Esegue il monitoraggio (LEGGERO: solo le fonti dovute oggi). acceptEdits: scrive nel vault senza chiedere.
# AR-088: NON incollare tutto monitora.md nel prompt (come fa giro.sh): l'agent su VPS è instabile con
# prompt enormi. Prompt corto a PUNTATORE — l'AI apre cervello/monitora.md dal disco con Read.
# Guardia: verifica DOPO l'allineamento che il file esista e non sia vuoto (evita run a vuoto).
if [ ! -s "$SCRIPT_DIR/monitora.md" ]; then
  echo "[$(ts)] ERRORE: cervello/monitora.md non trovato/vuoto dopo l'allineamento; monitoraggio saltato." >&2
  exit 1
fi
PROMPT="Sei l'AD digitale di MyCity (segui CLAUDE.md e gli agenti in .claude/agents/).

## Compito
Leggi ed esegui **per intero** il file \`cervello/monitora.md\` in questo repository (aprilo dal disco con Read, NON saltare passi).
Scrivi sul disco i file richiesti in MyCity-Vault/90-Memoria-AI/Intelligence/. Rispetta 🟢🟡🔴.
La memoria va sul RAMO UNICO main (il push git lo fa monitora.sh dopo di te — tu scrivi i file).

## Risposta in chat
Al termine restituisci un riepilogo breve (5-8 righe)."
echo "[$(ts)] Avvio monitoraggio web AD (motore: $(ai_engine))..."
MONITORA_START="$(date +%s)"   # AR-020: inizio del motore AI, per il costo del monitoraggio
ai_build_cmd
"${AI_CMD[@]}" "$PROMPT" || {
  echo "[$(ts)] Il motore AI ha restituito un errore (monitoraggio non completato)." >&2
}
echo "[$(ts)] Monitoraggio completato."

# AR-020: registra il costo del monitoraggio (durata + token se noti) nel log unico costo-ai.json.
if command -v node >/dev/null 2>&1 && [ -n "${MONITORA_START:-}" ]; then
  _mon_durata=$(( $(date +%s) - MONITORA_START ))
  node "$SCRIPT_DIR/costo-ai.mjs" --tipo=monitora --durata-sec="$_mon_durata" ${MONITORA_TOKEN:+--token="$MONITORA_TOKEN"} --modello="$(ai_engine)" >/dev/null 2>&1 || true
fi

# --- Sync della memoria sul ramo unico 'main': commit + push (rebase, NON force) ---
(
  flock -w 600 9 || exit 0   # Fix A: timeout sul lock (se salta, il prossimo monitoraggio recupera il WIP)
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
