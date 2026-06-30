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

# Quale motore usare: cursor | claude | none.
ai_engine() {
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
  local eng cli
  eng="$(ai_engine)"
  if [ "$eng" = none ]; then
    echo "Nessun motore AI trovato. Installa Cursor CLI ('agent', vedi cursor.com/install) o Claude Code ('claude')." >&2
    return 1
  fi
  cli="$(ai_cli_name)"
  if ! command -v "$cli" >/dev/null 2>&1; then
    echo "CLI '$cli' non trovata (motore=$eng). Installala o cambia CERVELLO_MOTORE." >&2
    return 1
  fi
  if [ "$eng" = cursor ] && [ -z "${CURSOR_API_KEY:-}" ]; then
    echo "Nota: CURSOR_API_KEY non impostata. Uso il login interattivo di 'agent' (se presente). Per il VPS, imposta CURSOR_API_KEY in cervello/vps/.env." >&2
  fi
  return 0
}

# Costruisce il comando del motore SENZA il prompt: popola l'array globale AI_CMD.
# Il chiamante appende il prompt come ultimo argomento, es.:  "${AI_CMD[@]}" "$prompt"
# (così funziona anche dentro 'timeout ... "${AI_CMD[@]}" "$prompt"').
ai_build_cmd() {
  AI_CMD=()
  case "$(ai_engine)" in
    cursor)
      # -p = non interattivo (print) · --force = applica le modifiche ai file senza chiedere (≈ acceptEdits)
      AI_CMD=(agent -p --force)
      [ -n "${CERVELLO_MODELLO:-}" ] && AI_CMD+=(--model "$CERVELLO_MODELLO")
      ;;
    claude)
      AI_CMD=(claude -p --permission-mode acceptEdits)
      [ -n "${CERVELLO_MODELLO:-}" ] && AI_CMD+=(--model "$CERVELLO_MODELLO")
      ;;
  esac
}
