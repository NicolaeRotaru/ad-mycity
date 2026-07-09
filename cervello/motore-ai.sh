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
#   CURSOR_API_KEY   = chiave API Cursor (alternativa al login interattivo 'agent login')
#
# Espone: ai_engine, ai_cli_name, ai_check, ai_build_cmd (popola l'array globale AI_CMD).

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
      if command -v agent >/dev/null 2>&1; then echo cursor
      elif command -v claude >/dev/null 2>&1; then echo claude
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

# Verifica che il motore sia installato (e dia un avviso utile se manca la chiave). Ritorna 1 se inutilizzabile.
ai_check() {
  ai_ensure_path
  local eng cli
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
  if [ "$eng" = cursor ] && [ "${CERVELLO_MOTORE:-auto}" = cursor ] && [ -z "${CURSOR_API_KEY:-}" ]; then
    echo "ERRORE: CERVELLO_MOTORE=cursor ma CURSOR_API_KEY mancante nel .env." >&2
    echo "  Crea la chiave su cursor.com/dashboard → API Keys e aggiungila a cervello/vps/.env" >&2
    return 1
  fi
  if [ "$eng" = cursor ] && [ -z "${CURSOR_API_KEY:-}" ]; then
    echo "Nota: CURSOR_API_KEY non impostata — su VPS serve quasi sempre. cursor.com/dashboard → API Keys." >&2
  fi
  return 0
}

# Esporta variabili che la CLI Cursor legge in headless (VPS systemd).
ai_prepare_env() {
  ai_ensure_path
  if [ "$(ai_engine)" = cursor ] && [ -n "${CURSOR_API_KEY:-}" ]; then
    export CURSOR_API_KEY
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
      # -p = non interattivo · --force = scrive file · --trust = VPS headless senza prompt workspace
      AI_CMD=(agent -p --force --trust)
      [ -n "${CERVELLO_MODELLO:-}" ] && AI_CMD+=(--model "$CERVELLO_MODELLO")
      ;;
    claude)
      # --permission-mode acceptEdits auto-accetta SOLO le modifiche ai file. In headless (-p) non c'è
      # nessuno a cui chiedere: ogni Bash resta bloccato → la macchina non riusciva ad aprire PR né a
      # far partire le scritture DB firmate (era la "grossa difficoltà a scrivere su supabase e github").
      # Qui sblocchiamo SOLO gli script sicuri: git-pr (apre PR — il merge resta l'ok di Nicola) e i
      # tool DB/mani che HANNO GIÀ dentro il cancello di firma (marketplace.mjs / esegui-azione.mjs:
      # DRY-RUN finché non c'è AZIONI_LIVE=1 + AZIONE_ID firmato + allowlist). Niente 'git push' libero:
      # il push autenticato lo fa solo git-pr.mjs, su un branch di PR, mai su main. Override: AI_ALLOWED_TOOLS.
      local _allowed="${AI_ALLOWED_TOOLS:-Bash(node cervello/git-pr.mjs:*),Bash(node cervello/git-github.mjs:*),Bash(node cervello/marketplace.mjs:*),Bash(node cervello/esegui-azione.mjs:*),Bash(git add:*),Bash(git commit:*),Bash(git checkout:*),Bash(git switch:*),Bash(git branch:*),Bash(git status:*),Bash(git diff:*),Bash(git stash:*)}"
      AI_CMD=(claude -p --permission-mode acceptEdits --allowedTools "$_allowed")
      [ -n "${CERVELLO_MODELLO:-}" ] && AI_CMD+=(--model "$CERVELLO_MODELLO")
      ;;
  esac
}
