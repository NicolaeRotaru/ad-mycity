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

# AR-163/AR-293/AR-305/AR-313: le mani condivise delle tre cadenze. Fino a qui monitora.sh era la
# copia rimasta più indietro — nessun timeout, nessun ciclo di ritentativi, nessun lucchetto e
# nessun codice d'uscita: usciva 0 qualunque cosa fosse successa.
. "$SCRIPT_DIR/lib-cadenza.sh"

# AR-293/AR-145: un solo monitoraggio per volta. Se ne sta già girando uno, esco subito.
cadenza_lock monitora || exit 0

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
      git add -A "${MEM_DIRS[@]}" 2>/dev/null || true
      git restore --staged pannello/ cervello/ 2>/dev/null || true
      git "${GIT_ID[@]}" commit -q -m "recupero: scritture pendenti da un run interrotto ($(ts))" 2>/dev/null || true
      # AR-127 — anche il RECUPERO passa dal cancello, e qui più che altrove: questo ramo scatta
      # quando un run precedente è morto a metà scrittura, cioè esattamente quando la memoria ha più
      # probabilità di essere incoerente. Prima pubblicava e basta — negli ultimi 60 commit del VPS
      # «recupero: scritture pendenti» compare 6 volte, tutte senza un controllo davanti.
      . "$SCRIPT_DIR/gate-pubblicazione.sh"
      if gate_pubblicazione "$SCRIPT_DIR" "$REPO"; then
        git push "$url" "HEAD:${branch}" 2>/dev/null && echo "[$(ts)] Recuperate scritture pendenti di un run precedente." || true
      else
        echo "[$(ts)] ⛔ Recupero NON pubblicato: il cancello ha detto no. Le scritture restano committate in locale." >&2
      fi
    fi
    _fetch_ok=0
    for _mf in 1 2 3; do
      if git fetch "$url" "$branch" 2>/dev/null; then _fetch_ok=1; break; fi
      sleep 2
    done
    if [ "$_fetch_ok" = 1 ]; then
      _cur="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"
      if [ "$_cur" = "$branch" ]; then
        if git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null; then
          echo "[$(ts)] Ramo: allineato a origin/${branch} via rebase (commit locali preservati)."
        else
          git rebase --abort 2>/dev/null || true
          if git "${GIT_ID[@]}" merge --no-edit FETCH_HEAD 2>/dev/null; then
            echo "[$(ts)] Ramo: allineato a origin/${branch} via merge (rebase in conflitto)."
          else
            git merge --abort 2>/dev/null || true
            echo "[$(ts)] WARN: rebase/merge su ${branch} in conflitto — continuo col locale." >&2
          fi
        fi
      else
        git checkout -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -B "$branch" 2>/dev/null || true
        echo "[$(ts)] Ramo: HEAD portato su ${branch} da origin/${branch}."
      fi
    else
      echo "[$(ts)] WARN: fetch di ${branch} fallito — continuo col codice/memoria sul disco." >&2
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
# AR-317: da qui il motore scrive nel vault. Il marcatore dice agli altri processi «sto scrivendo»,
# così l'allineamento non committa roba a metà né resetta il lavoro in corso. La trap lo toglie
# anche se il processo viene ucciso.
cadenza_scrittura_inizio monitora
# AR-305/AR-163/AR-162/AR-201: timeout derivato dal budget + ritentativi che INTERROGANO la
# retry-policy. Prima era una riga sola senza timeout, senza ciclo e con l'rc buttato via.
cadenza_ai_run monitora "$PROMPT" "${MONITORA_BUDGET_SEC:-2700}" 3 30
ai_rc="${CADENZA_AI_RC:-0}"
cadenza_scrittura_fine
if [ "$ai_rc" -ne 0 ]; then
  echo "[$(ts)] Il motore AI ha restituito un errore dopo ${CADENZA_AI_TENTATIVI:-1} tentativi (rc=$ai_rc)." >&2
fi

# AR-043: stima token condivisa — monitora prima registrava token=null.
if [ -z "${MONITORA_TOKEN:-}" ] && [ -n "${MONITORA_START:-}" ]; then
  MONITORA_TOKEN="$(ai_stima_token "$MONITORA_START" "$PROMPT" "")"
  MONITORA_TOKEN_STIMA=1
  export MONITORA_TOKEN MONITORA_TOKEN_STIMA
fi

# AR-020: registra il costo del monitoraggio (durata + token se noti) nel log unico costo-ai.json.
if command -v node >/dev/null 2>&1 && [ -n "${MONITORA_START:-}" ]; then
  _mon_durata=$(( $(date +%s) - MONITORA_START ))
  _stima_flag="${MONITORA_TOKEN_STIMA:+--stima}"
  node "$SCRIPT_DIR/costo-ai.mjs" --tipo=monitora --durata-sec="$_mon_durata" ${MONITORA_TOKEN:+--token="$MONITORA_TOKEN"} --modello="$(ai_engine)" ${_stima_flag:-} >/dev/null 2>&1 || true
fi

# --- Sync della memoria sul ramo unico 'main': commit + push (rebase, NON force) ---
# AR-313: il blocco era una SUBSHELL che finiva in `) 9>"$LOCK" || true`. Due conseguenze, entrambe
# gravi: (a) le variabili scritte dentro non uscivano, quindi non c'era modo di sapere com'era
# andata; (b) il `|| true` seppelliva l'esito e lo script chiudeva sempre 0 — «il monitoraggio si
# dichiara riuscito anche quando la memoria non è arrivata su GitHub». Ora è un blocco normale con
# il lucchetto su fd 9, come già fa ritmo.sh, e l'esito sopravvive.
MONITORA_PUSH_OK=1
MONITORA_HAD_CHANGES=0
exec 9>"$LOCK"
if flock -w 600 9; then
  git add -A "${MEM_DIRS[@]}" 2>/dev/null || true
  if git diff --cached --quiet 2>/dev/null; then
    echo "[$(ts)] Nessuna novità dalle fonti da inviare."
  else
    MONITORA_HAD_CHANGES=1
    # AR-314 — anche il monitoraggio passa dal cancello: pubblica sulla stessa main del giro, e finora
    # lo faceva senza nessuno dei quattro controlli di verità. Additivo: il push resta com'è.
    . "$SCRIPT_DIR/gate-pubblicazione.sh"
    if ! gate_pubblicazione "$SCRIPT_DIR" "$REPO"; then
      MONITORA_PUSH_OK=0
      echo "[$(ts)] Intelligence NON pubblicata: il cancello ha detto no (vedi sopra) — nessun commit." >&2
    elif [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
      git "${GIT_ID[@]}" commit -q -m "monitoraggio web AD: aggiorna Intelligence ($(ts))" || true
      url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
      # AR-297/AR-299 — stessa funzione di pubblicazione di giro e ritmo: ramo controllato prima del
      # push e timeout di rete su fetch/push.
      ok=0
      if attempt="$(pubblica_memoria "$url" "$branch" 3 "${GIT_NET_TIMEOUT:-60}")"; then
        echo "[$(ts)] Intelligence sincronizzata su GitHub (ramo $branch, tentativo $attempt)."
        ok=1
      fi
      if [ "$ok" != 1 ]; then
        MONITORA_PUSH_OK=0
        echo "[$(ts)] Push fallito dopo 3 tentativi (il prossimo monitoraggio recupera)." >&2
      fi
    else
      MONITORA_PUSH_OK=0
      echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: salto il push." >&2
    fi
  fi
else
  MONITORA_PUSH_OK=0
  echo "[$(ts)] WARN: lock git occupato — sync della Intelligence saltata." >&2
fi
exec 9>&-

# AR-163/AR-313: l'esito diventa un fatto scritto e un codice d'uscita, con la STESSA testa del giro
# e del ritmo (cervello/esito-cadenza.mjs). Prima qui non c'era nessun `exit`: lo script finiva e
# systemd registrava 0 — motore fallito, push fallito e monitoraggio riuscito erano la stessa cosa.
exit "$(cadenza_esito monitora "$ai_rc" "$MONITORA_HAD_CHANGES" "$MONITORA_PUSH_OK" 1 0)"
