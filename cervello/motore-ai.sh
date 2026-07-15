# motore-ai.sh — sceglie il MOTORE AI del cervello e costruisce il comando da lanciare.
# È fatto per essere "sourced" da worker.sh / giro.sh / monitora.sh (non eseguito da solo).
#
# Perché esiste: il cervello prima girava SOLO su Claude Code (CLI 'claude', piano Max).
# Ora può girare anche su Cursor (CLI 'agent') usando il tuo abbonamento Cursor. Questo file
# tiene UN SOLO punto in cui si decide il motore, così gli script non lo duplicano.
#
# Variabili (in cervello/vps/.env):
#   CERVELLO_MOTORE  = auto | cursor | claude   (default: auto → preferisce 'agent', poi 'claude')
#   CERVELLO_MODELLO = modello opzionale (es. composer-2.5 per Cursor, claude-4.6-sonnet per Claude)
#   CURSOR_API_KEY   = chiave User API Cursor (opzionale se hai fatto 'agent login' con l'abbonamento)
#
# Espone: ai_engine, ai_cli_name, ai_cursor_auth_ok, ai_check, ai_build_cmd (popola AI_CMD).

# Percorso repo (per messaggi di errore leggibili); worker.sh imposta REPO prima del source.
if [ -z "${REPO_ROOT:-}" ]; then
  if [ -n "${REPO:-}" ]; then
    REPO_ROOT="$REPO"
  else
    _motore_ai_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
    REPO_ROOT="$(dirname "$_motore_ai_dir")"
  fi
fi

# agent si installa in ~/.local/bin; un .env che esporta PATH può nasconderlo a command -v.
ai_ensure_path() {
  if [ -n "${HOME:-}" ] && [ -d "$HOME/.local/bin" ]; then
    case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) export PATH="$HOME/.local/bin:$PATH" ;; esac
  fi
}

# Quale motore usare: cursor | claude | none.
ai_engine() {
  ai_ensure_path
  case "${CERVELLO_MOTORE:-auto}" in
    cursor) echo cursor ;;
    claude) echo claude ;;
    *)
      # auto: Claude è il motore principale. Cursor ('agent') si usa SOLO se esplicitamente
      # richiesto con CERVELLO_MOTORE=cursor — mai in automatico (Nicola 2026-07-10).
      if command -v claude >/dev/null 2>&1; then echo claude
      elif command -v agent >/dev/null 2>&1; then echo cursor
      else echo none; fi
      ;;
  esac
}

# Nome della CLI del motore scelto (agent | claude | "").
ai_cli_name() {
  case "$(ai_engine)" in
    cursor) echo agent ;;
    claude) echo claude ;;
    *) echo "" ;;
  esac
}

# Esegue `agent status` con --api-key quando la key è nel .env (headless VPS: l'env da sola a volte
# non basta — vedi forum Cursor + docs CLI). Stampa stdout/stderr; rc = rc di agent.
ai_agent_status_raw() {
  ai_ensure_path
  command -v agent >/dev/null 2>&1 || return 1
  local _extra=()
  if [ -n "${CURSOR_API_KEY:-}" ]; then
    export CURSOR_API_KEY
    _extra=(--api-key "$CURSOR_API_KEY")
  fi
  agent "${_extra[@]}" status 2>&1
}

# True se `agent status` (testo o JSON) dice che siamo autenticati.
ai_cursor_status_authenticated() {
  ai_ensure_path
  command -v agent >/dev/null 2>&1 || return 1
  local _json _extra=()
  if [ -n "${CURSOR_API_KEY:-}" ]; then
    export CURSOR_API_KEY
    _extra=(--api-key "$CURSOR_API_KEY")
  fi
  _json="$(agent "${_extra[@]}" status --format json 2>/dev/null)" || true
  if [ -n "$_json" ] && command -v jq >/dev/null 2>&1; then
    if printf '%s' "$_json" | jq -e '(.authenticated == true) or (.loggedIn == true)' >/dev/null 2>&1; then
      return 0
    fi
    if printf '%s' "$_json" | jq -e '(.email // .user.email // .account.email // .user) != null' >/dev/null 2>&1; then
      return 0
    fi
    if printf '%s' "$_json" | jq -e '.authenticated == false' >/dev/null 2>&1; then
      # Con API key il JSON è autorevole (key invalida). Senza key alcune build agent
      # rispondono false in JSON anche con agent login attivo — prova il testo sotto.
      if [ -n "${CURSOR_API_KEY:-}" ]; then
        return 1
      fi
    fi
  fi
  local _st
  _st="$(ai_agent_status_raw)" || true
  case "$_st" in
    *[Nn]ot\ logged\ in*|*[Nn]ot\ authenticated*|*"Not Logged In"*|*"Not authenticated"*) return 1 ;;
    *[Aa]uthenticated*|*"Login successful"*|*"logged in"*|*"Logged in"*) return 0 ;;
  esac
  return 1
}

# Cursor autenticato: CURSOR_API_KEY nel .env (consigliato su VPS headless) OPPURE 'agent login'.
# Ritorna 0 solo se agent status conferma l'autenticazione (non basta avere la riga nel .env).
ai_cursor_auth_ok() {
  ai_cursor_status_authenticated
}

# Come sopra, ma stampa "api_key" | "login" | "" (per diagnostica/test).
ai_cursor_auth_mode() {
  if [ -n "${CURSOR_API_KEY:-}" ]; then
    if ai_cursor_status_authenticated; then
      echo api_key
      return 0
    fi
    echo ""
    return 1
  fi
  if ai_cursor_status_authenticated; then
    echo login
    return 0
  fi
  echo ""
  return 1
}

# Verifica che il motore sia installato e autenticato. Ritorna 1 se inutilizzabile.
ai_check() {
  ai_ensure_path
  local eng cli _mode
  eng="$(ai_engine)"
  if [ "$eng" = none ]; then
    echo "Nessun motore AI trovato. Installa Cursor CLI ('agent', vedi cursor.com/install) o Claude Code ('claude')." >&2
    return 1
  fi
  cli="$(ai_cli_name)"
  if ! command -v "$cli" >/dev/null 2>&1; then
    echo "CLI '$cli' non trovata (motore=$eng). Installala o cambia CERVELLO_MOTORE (es. claude o auto)." >&2
    return 1
  fi
  if [ "$eng" = cursor ]; then
    if ! ai_cursor_auth_ok; then
      echo "ERRORE: motore Cursor senza autenticazione." >&2
      echo "  Su VPS headless agent login spesso NON persiste: serve la User API Key (NON Admin key)." >&2
      echo "  Fix rapido (1 comando):" >&2
      echo "       sudo bash $REPO_ROOT/cervello/vps/collega-cursor.sh" >&2
      echo "  Oppure a mano nel .env:" >&2
      echo "       CERVELLO_MOTORE=cursor" >&2
      echo "       CURSOR_API_KEY=key_...  (cursor.com/dashboard → API Keys → User API Key)" >&2
      echo "  Poi: sudo systemctl restart mycity-worker mycity-worker-chat" >&2
      if [ -n "${CURSOR_API_KEY:-}" ]; then
        echo "  ATTENZIONE: CURSOR_API_KEY impostata ma agent status dice non autenticato (key errata/scaduta o Admin key)." >&2
      fi
      return 1
    fi
    _mode="$(ai_cursor_auth_mode)"
    if [ "$_mode" = login ]; then
      echo "Cursor: autenticato via agent login (abbonamento, senza CURSOR_API_KEY)." >&2
    fi
  fi
  return 0
}

# Esporta variabili che la CLI Cursor legge in headless (VPS systemd).
ai_prepare_env() {
  ai_ensure_path
  if [ "$(ai_engine)" = cursor ] && [ -n "${CURSOR_API_KEY:-}" ]; then
    export CURSOR_API_KEY
  fi
  # 🧠 RAGIONAMENTO ESTESO (thinking) — il motivo per cui il cervello «non ragionava»: la CLI
  # partiva senza budget di pensiero, quindi rispondeva d'istinto invece di ragionare prima di
  # agire (come fa Claude Code in sessione interattiva). Con MAX_THINKING_TOKENS la CLI Claude
  # PENSA prima di rispondere su ogni corsia (chat, giro, lavori): più lento di qualche secondo,
  # molto più giusto. Il pensiero NON finisce nella risposta a Nicola (_estrai_stream prende solo
  # i blocchi text). Override: CERVELLO_THINKING_TOKENS nel .env (0 = spento, com'era prima).
  # 💸 PENSIERO MIRATO (efficienza): il thinking serve dove si RAGIONA (chat, giro, lavori), NON sui
  # compiti di solo VOLUME (metabolizzare = riassumere; diagnosi errore = tradurre): lì bruciava budget
  # a vuoto. Il chiamante può abbassarlo per-lavoro con AI_THINKING (0 = spento); default = quello del .env.
  if [ "$(ai_engine)" = claude ]; then
    local _think="${AI_THINKING:-${CERVELLO_THINKING_TOKENS:-8000}}"
    if [ "$_think" != 0 ]; then export MAX_THINKING_TOKENS="$_think"; else unset MAX_THINKING_TOKENS; fi
  fi
  # Headless VPS: niente browser login.
  export CI="${CI:-true}"
}

# Costruisce il comando del motore SENZA il prompt: popola l'array globale AI_CMD.
# Il chiamante appende il prompt come ultimo argomento, es.:  "${AI_CMD[@]}" "$prompt"
# (così funziona anche dentro 'timeout ... "${AI_CMD[@]}" "$prompt"').
ai_build_cmd() {
  ai_prepare_env
  AI_CMD=()
  case "$(ai_engine)" in
    cursor)
      # PERIMETRO valle (rischio-sicurezza-se): Cursor --force --trust non ha allow/deny CLI.
      # .claude/settings.json NON protegge questo motore — vale solo per Claude Code.
      # Il perimetro reale è a VALLE: guardiano-integrità AR-044, scan-segreti, worker-chat
      # (no push su main, PR via git-pr.mjs), regole 🟢🟡🔴 nel prompt.
      # -p = non interattivo · --force = scrive file · --trust = VPS headless senza prompt workspace
      # --api-key = obbligatorio su molti VPS headless (env var da sola non basta per status/run).
      AI_CMD=(agent -p --force --trust)
      if [ -n "${CURSOR_API_KEY:-}" ]; then
        export CURSOR_API_KEY
        AI_CMD+=(--api-key "$CURSOR_API_KEY")
      fi
      if [ -n "${CERVELLO_MODELLO:-}" ]; then AI_CMD+=(--model "$CERVELLO_MODELLO"); fi
      ;;
    claude)
      # --permission-mode acceptEdits auto-accetta SOLO le modifiche ai file. In headless (-p) non c'è
      # nessuno a cui chiedere: ogni Bash resta bloccato → la macchina non riusciva ad aprire PR né a
      # far partire le scritture DB firmate (era la "grossa difficoltà a scrivere su supabase e github").
      # Sblocco SOLO sulle corsie di LAVORO, e SOLO degli script sicuri: git-pr (apre PR — il merge resta
      # l'ok di Nicola) e i tool DB/mani che HANNO GIÀ dentro il cancello di firma (marketplace.mjs /
      # esegui-azione.mjs: DRY-RUN finché non c'è AZIONI_LIVE=1 + AZIONE_ID firmato + allowlist). Niente
      # 'git push' libero: il push autenticato lo fa solo git-pr.mjs, su un branch di PR, mai su main.
      # AI_ALLOW_ACTIONS: la chat lo mette a 0 (conversazione pulita, niente mani, streaming intatto);
      # i lavori a 1 (default). Override della lista: AI_ALLOWED_TOOLS.
      #
      # ⚠️ ORDINE OBBLIGATORIO (bug 2026-07-09/10, ha spento giro/metabolizza/azioni per una notte intera):
      # --allowedTools della CLI claude è VARIADICO (accetta più valori separati da spazio). Se resta
      # l'ULTIMA opzione, si mangia anche il PROMPT che il chiamante appende dopo ("${AI_CMD[@]}" "$prompt")
      # → la CLI risponde «Input must be provided either through stdin or as a prompt argument» e OGNI
      # lavoro con le mani armate muore alla partenza. Per questo --allowedTools va PRIMA di
      # --permission-mode (opzione a valore singolo che CHIUDE la lista variadica). Mai riordinare.
      # Test di guardia: cervello/test/motore-ai-allowedtools.bats
      AI_CMD=(claude -p)
      if [ "${AI_ALLOW_ACTIONS:-1}" = 1 ]; then
        local _allowed="${AI_ALLOWED_TOOLS:-Bash(node cervello/git-pr.mjs:*),Bash(node cervello/git-github.mjs:*),Bash(node cervello/marketplace.mjs:*),Bash(node cervello/esegui-azione.mjs:*),Bash(git add:*),Bash(git commit:*),Bash(git checkout:*),Bash(git switch:*),Bash(git branch:*),Bash(git status:*),Bash(git diff:*),Bash(git stash:*)}"
        AI_CMD+=(--allowedTools "$_allowed")
      fi
      AI_CMD+=(--permission-mode acceptEdits)
      # `if` esplicito (non `[ ] &&`): l'ultima riga della funzione non deve MAI lasciare rc=1
      # quando il modello non è impostato — sotto `set -e` spegnerebbe il chiamante.
      if [ -n "${CERVELLO_MODELLO:-}" ]; then AI_CMD+=(--model "$CERVELLO_MODELLO"); fi
      ;;
  esac
}

# AR-043 / efficienza-costo: stima token da durata+testo quando la CLI non espone usage strutturato.
# Resta STIMA (non misura): i gate che contano sul serio devono leggere --stima e non fidarsi ciecamente.
ai_stima_token() {
  local start_sec="${1:-0}" prompt="${2:-}" output="${3:-}"
  local now_sec durata_sec durata_min chars token_durata token_chars tok
  now_sec="$(date +%s)"
  durata_sec=$(( now_sec - start_sec ))
  [ "$durata_sec" -lt 1 ] && durata_sec=1
  durata_min=$(( durata_sec / 60 + 1 ))
  chars=$(( ${#prompt} + ${#output} ))
  token_durata=$(( durata_min * 5000 ))
  token_chars=$(( chars / 4 ))
  tok=$(( token_durata > token_chars ? token_durata : token_chars ))
  [ "$tok" -lt 50000 ] && tok=50000
  echo "$tok"
}

# Decisione Nicola #59: niente adattatore Groq/Gemini (API a consumo). Il router DECIDE ma l'esecuzione
# resta sempre sul motore premium (Claude/Cursor). Vedi banco-ai.mjs ROUTER_SOLO_CONSIGLIO.
export AI_ECON_CMD=""
