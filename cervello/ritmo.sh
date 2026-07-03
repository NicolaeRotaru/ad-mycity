#!/usr/bin/env bash
# ritmo.sh — Cadenze del battito AD (mattino | sera | settimana), motore AI Cursor 'agent' o Claude 'claude'.
# Legge cervello/ritmo.md dal disco e aggiorna 90-Memoria-AI/RITMO.md (+ SALA/STATO come da prompt).
# Lanciato dai timer systemd (mycity-ritmo-*.timer) o a mano: ritmo-ora.sh {mattino|sera|settimana}
set -uo pipefail

export TZ="${TZ:-Europe/Rome}"

RITMO_TIPO="${1:-}"
case "$RITMO_TIPO" in
  mattino)
    RITMO_SEZIONE="☀️ PIANO DEL MATTINO"
    RITMO_TITOLO="Piano del mattino"
    ;;
  mezzogiorno)
    RITMO_SEZIONE="🕛 PUNTO DI MEZZOGIORNO"
    RITMO_TITOLO="Punto di mezzogiorno"
    ;;
  sera)
    RITMO_SEZIONE="🌙 REPORT DELLA SERA"
    RITMO_TITOLO="Report della sera"
    ;;
  settimana)
    RITMO_SEZIONE="📅 REVIEW + RETROSPETTIVA"
    RITMO_TITOLO="Review settimanale"
    ;;
  *)
    echo "Uso: ritmo.sh {mattino|mezzogiorno|sera|settimana}" >&2
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
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-98592323+NicolaeRotaru@users.noreply.github.com}"
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

# AR-086: DELTA-GATE anche al ritmo (come giro.sh) — non accendere il motore premium se lo stato reale
# è invariato dall'ultimo giro pieno (evita il cluster mattutino giro+ritmo+monitora a stato fermo).
# Bypass: RITMO_FORCE=1 / DELTA_GATE_FORCE=1 (le cadenze on-demand girano sempre).
RUN_AI=1
if [ "${RITMO_FORCE:-0}" = 1 ] || [ "${DELTA_GATE_FORCE:-0}" = 1 ]; then
  echo "[$(ts)] Delta-gate ritmo: BYPASS (forzato/on-demand) → cadenza piena."
elif command -v node >/dev/null 2>&1; then
  _dg_out="$(node "$SCRIPT_DIR/delta-gate.mjs" 2>&1)"; _dg_rc=$?
  printf '%s\n' "$_dg_out" | tail -4
  if [ "$_dg_rc" = 20 ]; then
    RUN_AI=0
    echo "[$(ts)] ⏭️  DELTA-GATE: stato invariato dall'ultimo giro pieno → salto il motore premium del ritmo $RITMO_TIPO."
  fi
fi

PROMPT="Sei l'AD digitale di MyCity (segui CLAUDE.md e gli agenti in .claude/agents/).

## Compito
Leggi ed esegui **per intero** la sezione **${RITMO_SEZIONE}** del file \`cervello/ritmo.md\` (aprilo dal disco con Read, NON saltare passi).
Scrivi sul disco tutti i file richiesti (vault, RITMO.md, SALA-OPERATIVA, STATO, ecc.). Rispetta 🟢🟡🔴.

## Obbligatorio per RITMO.md
Aggiungi in fondo a \`MyCity-Vault/90-Memoria-AI/RITMO.md\` un blocco con intestazione esatta:
\`## ${RITMO_TITOLO} · AAAA-MM-GG HH:MM\` (ora di Piacenza, con i minuti), seguito dal contenuto.
L'ultimo blocco con questa intestazione è quello che legge il Pannello (/api/ritmo).

La memoria va sul ramo memoria-ad (il push git lo fa ritmo.sh dopo di te — tu scrivi i file).

## Risposta in chat
Al termine restituisci un riepilogo breve (5-8 righe)."

# AR-024: RECUPERO CADENZA su rate-limit. Se il motore AI fallisce per QUOTA (session/rate limit), la
# cadenza andrebbe persa fino al timer di domani (il retry interno qui sotto è solo 3×30s ≈ 90s, troppo
# corto per un reset che avviene tra ore). Rimedio: la ri-accodo nella coda 'lavori' come tipo
# 'ritmo-<sezione>' con riprova_dopo = orario di reset (calcolato da retry-policy.mjs). Da lì il worker la
# ri-esegue quando il limite si libera → il report/mosse mancati vengono prodotti da soli, in ritardo ma
# prodotti. NON si accoda se siamo GIÀ dentro un retry del worker (RITMO_FROM_WORKER=1) → niente loop.
accoda_recupero_cadenza() {
  [ "${RITMO_FROM_WORKER:-0}" = 1 ] && return 0
  [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ] || { echo "[$(ts)] Recupero cadenza: manca SUPABASE (memoria) — non posso ri-accodare." >&2; return 0; }
  command -v jq >/dev/null 2>&1 || { echo "[$(ts)] Recupero cadenza: manca jq — salto." >&2; return 0; }
  local tipo="ritmo-${RITMO_TIPO}"
  local A=(-H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json")
  # Chiedo alla retry-policy (fonte unica) se/quando ritentare: quota → sì, ancorato al reset; altro → no.
  local decis
  decis="$(RP_TIPO="$tipo" RP_TENTATIVI=0 RP_RISULTATO="$_ai_out" timeout 20s node "$SCRIPT_DIR/retry-policy.mjs" decidi 2>/dev/null || echo '{}')"
  if [ "$(printf '%s' "$decis" | jq -r '.azione // "stop"' 2>/dev/null)" != "ritenta" ]; then
    echo "[$(ts)] Cadenza $tipo: errore non da rate-limit → nessun recupero automatico (resta il timer di domani)." >&2
    return 0
  fi
  local quando; quando="$(printf '%s' "$decis" | jq -r '.quandoISO // empty' 2>/dev/null)"
  # Idempotenza: se una cadenza uguale è già in coda, non duplicare.
  local gia; gia="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&tipo=eq.$tipo&select=id&limit=1" "${A[@]}" 2>/dev/null || true)"
  if printf '%s' "$gia" | jq -e '.[0].id' >/dev/null 2>&1; then
    echo "[$(ts)] Cadenza $tipo già in coda (recupero) — non duplico." >&2
    return 0
  fi
  local richiesta="Recupero automatico della cadenza «$RITMO_TITOLO» saltata per rate-limit del motore AI. Riesegui la sezione ritmo '$RITMO_TIPO' e pubblica la memoria su memoria-ad."
  local body; body="$(jq -n --arg t "$tipo" --arg r "$richiesta" --arg q "$quando" \
    '{stato:"in_attesa", tipo:$t, richiesta:$r, esperto:"ritmo", tentativi:1, riprova_dopo:$q}')"
  if curl -fsS -X POST "$SUPABASE_URL/rest/v1/lavori" "${A[@]}" -d "$body" >/dev/null 2>&1; then
    echo "[$(ts)] Cadenza $tipo ri-accodata: ritento dopo $quando (reset quota) — il worker la ri-esegue da solo."
  else
    # DB non ancora migrato (manca riprova_dopo/tentativi)? riprovo con i campi minimi: il worker la
    # prenderà al prossimo giro (e, senza colonne retry, ripiegherà sul comportamento classico).
    body="$(jq -n --arg t "$tipo" --arg r "$richiesta" '{stato:"in_attesa", tipo:$t, richiesta:$r, esperto:"ritmo"}')"
    curl -fsS -X POST "$SUPABASE_URL/rest/v1/lavori" "${A[@]}" -d "$body" >/dev/null 2>&1 \
      && echo "[$(ts)] Cadenza $tipo ri-accodata (senza riprova_dopo — DB non migrato: gira appena il worker è libero)." \
      || echo "[$(ts)] Cadenza $tipo: ri-accodamento fallito (riprovo al prossimo timer)." >&2
  fi
}

RITMO_START="$(date +%s)"   # AR-020: inizio del motore AI, per registrare il costo della cadenza
ai_rc=0
_ai_out=""
if [ "${RUN_AI:-1}" != 1 ]; then
  # AR-086: parte AI saltata dal delta-gate — cadenza a costo ~0, la memoria resta all'ultimo blocco.
  echo "[$(ts)] Parte AI del ritmo SALTATA dal delta-gate (AR-086): nessun motore premium acceso."
else
echo "[$(ts)] Avvio ritmo AD ($RITMO_TIPO, motore: $(ai_engine))..."
ai_build_cmd
# AR-005: timeout dentro ritmo.sh (come giro.sh) — un motore appeso non deve bloccare la cadenza.
RITMO_AI_TIMEOUT="${RITMO_AI_TIMEOUT:-${GIRO_AI_TIMEOUT:-2700}}"
AI_TIMEOUT=()
command -v timeout >/dev/null 2>&1 && AI_TIMEOUT=(timeout --kill-after=60s "$RITMO_AI_TIMEOUT")
for _attempt in 1 2 3; do
  ai_rc=0
  _ai_out="$("${AI_TIMEOUT[@]}" "${AI_CMD[@]}" "$PROMPT" 2>&1)" || ai_rc=$?
  printf '%s\n' "$_ai_out"
  [ "$ai_rc" -eq 0 ] && break
  if [ "$ai_rc" = 124 ] || [ "$ai_rc" = 137 ]; then
    echo "[$(ts)] Motore AI tentativo $_attempt ANDATO IN TIMEOUT (${RITMO_AI_TIMEOUT}s) — ucciso, riprovo tra 30s..." >&2
  else
    echo "[$(ts)] Motore AI tentativo $_attempt fallito (rc=$ai_rc) — riprovo tra 30s..." >&2
  fi
  printf '%s\n' "$_ai_out" | tail -15 >&2
  [ "$_attempt" -lt 3 ] && sleep 30
done
if [ "$ai_rc" -ne 0 ]; then
  echo "[$(ts)] Il motore AI ha restituito un errore dopo 3 tentativi (rc=$ai_rc)." >&2
  printf '%s\n' "$_ai_out" | tail -25 >&2
  # AR-024: prova a recuperare la cadenza saltata per rate-limit (ri-accoda con riprova_dopo = reset).
  accoda_recupero_cadenza || true
fi
fi   # AR-086: fine blocco RUN_AI (delta-gate del ritmo)
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

# AR-020: registra il costo di questa cadenza (durata + token se noti) nel log unico costo-ai.json.
if command -v node >/dev/null 2>&1 && [ -n "${RITMO_START:-}" ]; then
  _ritmo_durata=$(( $(date +%s) - RITMO_START ))
  node "$SCRIPT_DIR/costo-ai.mjs" --tipo="ritmo-$RITMO_TIPO" --durata-sec="$_ritmo_durata" ${RITMO_TOKEN:+--token="$RITMO_TOKEN"} --modello="$(ai_engine)" >/dev/null 2>&1 || true
fi

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
