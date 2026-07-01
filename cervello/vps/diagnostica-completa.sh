#!/usr/bin/env bash
# diagnostica-completa.sh — trova PERCHÉ la chat resta in coda (un solo comando, output chiaro).
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/diagnostica-completa.sh
set -uo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"
cd "$REPO"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
ok() { echo "  ✓ $*"; }
ko() { echo "  ✗ $*"; }
warn() { echo "  ⚠ $*"; }

echo "═══════════════════════════════════════════════════════════"
echo " MyCity — Diagnostica worker chat · $(ts)"
echo "═══════════════════════════════════════════════════════════"
echo

# --- 1. systemd ---
echo "▶ 1) Servizio systemd"
if systemctl is-active --quiet mycity-worker 2>/dev/null; then
  ok "mycity-worker è active (running)"
else
  ko "mycity-worker NON è active"
  echo "     → sudo systemctl start mycity-worker"
  echo "     → journalctl -u mycity-worker -n 25 --no-pager"
fi
restarts="$(systemctl show mycity-worker -p NRestarts --value 2>/dev/null || echo "?")"
echo "     Riavvii systemd (NRestarts): $restarts"
if [ "${restarts:-0}" != "?" ] && [ "${restarts:-0}" -gt 20 ] 2>/dev/null; then
  warn "Troppi riavvii → il worker crasha all'avvio (vedi log sotto)"
fi
echo

# --- 2. .env ---
echo "▶ 2) File .env"
if [ ! -f "$ENV_FILE" ]; then
  ko "Manca $ENV_FILE"
  exit 1
fi
if sudo -u mycity -H bash -lc "set -a; source '$ENV_FILE'; set +a; echo OK" 2>/dev/null | grep -q OK; then
  ok "Sintassi .env OK (utente mycity)"
else
  ko "Errore sintassi .env — virgolette su valori con spazi (es. GIT_AUTHOR_NAME=\"AD MyCity VPS\")"
fi
set -a; . "$ENV_FILE"; set +a
echo

# --- 3. Supabase ---
echo "▶ 3) Supabase MEMORIA (NON marketplace)"
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
  ko "SUPABASE_URL o SUPABASE_SERVICE_KEY mancanti nel .env"
else
  echo "     URL: ${SUPABASE_URL}"
  if echo "$SUPABASE_URL" | grep -q 'clmpyfvpvfjgeviworth'; then
    ko "URL è il DB MARKETPLACE — serve xjljcsorpbqwttrejqte (memoria)"
  fi
  _chk="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=chiave&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>&1 || true)"
  if printf '%s' "$_chk" | grep -qE 'PGRST205|not found'; then
    ko "Tabella impostazioni assente — DB sbagliato o chiave errata"
  else
    ok "Connessione Supabase memoria OK"
  fi
fi
echo

# --- 4. Motore AI ---
echo "▶ 4) Motore AI (Cursor agent / Claude)"
. "$REPO/cervello/motore-ai.sh"
echo "     CERVELLO_MOTORE=${CERVELLO_MOTORE:-auto}"
if [ -z "${CURSOR_API_KEY:-}" ]; then
  warn "CURSOR_API_KEY mancante — obbligatoria se CERVELLO_MOTORE=cursor"
else
  ok "CURSOR_API_KEY presente (${#CURSOR_API_KEY} caratteri)"
fi
if sudo -u mycity -H bash -lc "export PATH=\"\$HOME/.local/bin:\$PATH\"; source '$ENV_FILE' 2>/dev/null; . '$REPO/cervello/motore-ai.sh'; ai_check" 2>&1; then
  ok "ai_check passato per utente mycity ($(sudo -u mycity -H bash -lc "export PATH=\"\$HOME/.local/bin:\$PATH\"; source '$ENV_FILE'; . '$REPO/cervello/motore-ai.sh'; ai_engine") / $(sudo -u mycity -H bash -lc "export PATH=\"\$HOME/.local/bin:\$PATH\"; source '$ENV_FILE'; . '$REPO/cervello/motore-ai.sh'; ai_cli_name"))"
else
  ko "ai_check FALLITO — il worker esce subito e systemd lo riavvia in loop"
  echo "     → sudo -u mycity -H bash $REPO/cervello/vps/test-agent.sh"
  echo "     → Installa agent: curl https://cursor.com/install -fsS | bash (come mycity)"
fi
echo

# --- 5. Pausa AD ---
echo "▶ 5) Kill-switch pausa"
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    ko "AD in PAUSA nel Pannello — il worker non esegue nulla"
    echo "     → Pannello → Azioni → Governo → Riattiva l'AD"
  else
    ok "AD non in pausa"
  fi
fi
echo

# --- 6. Battito worker ---
echo "▶ 6) Battito worker (worker:ultimo in Supabase)"
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  batt="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore,updated_at&chiave=eq.worker:ultimo&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null || true)"
  val="$(printf '%s' "$batt" | jq -r '.[0].valore // empty' 2>/dev/null)"
  if [ -z "$val" ]; then
    ko "Mai battuto — worker non è mai entrato nel loop (crash all'avvio?)"
  else
    echo "     Ultimo battito: $val"
    sec=$(( $(date +%s) - $(date -d "$val" +%s 2>/dev/null || echo 0) ))
    if [ "$sec" -lt 30 ] 2>/dev/null; then
      ok "Worker VIVO (battito < 30s fa)"
    elif [ "$sec" -lt 120 ] 2>/dev/null; then
      warn "Battito vecchio di ${sec}s — worker lento o appena riavviato"
    else
      ko "Worker SPENTO (battito > 2 min fa) nonostante systemd"
      echo "     → journalctl -u mycity-worker -n 40 --no-pager"
    fi
  fi
  pipe="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.worker:pipeline&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null | jq -r '.[0].valore // "?"')"
  echo "     Pipeline: $pipe"
  if [ "$pipe" = "legacy-agent-direct" ]; then
    warn "Pipeline LEGACY — esegui: sudo bash $REPO/cervello/vps/aggiorna-cervello.sh"
  fi
fi
echo

# --- 7. Coda lavori ---
echo "▶ 7) Coda lavori"
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  AUTH=(-H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
  for st in in_attesa in_corso fatto errore; do
    n="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.$st&select=id" "${AUTH[@]}" 2>/dev/null | jq 'length' 2>/dev/null || echo "?")"
    echo "     $st: $n"
  done
  orfani="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_corso&select=id,tipo,updated_at" "${AUTH[@]}" 2>/dev/null || true)"
  on="$(printf '%s' "$orfani" | jq 'length' 2>/dev/null || echo 0)"
  if [ "${on:-0}" -gt 0 ] 2>/dev/null; then
    warn "$on lavoro/i bloccati in_corso"
    echo "     → sudo -u mycity -H bash $REPO/cervello/vps/recupera-lavori-orfani.sh"
  fi
fi
echo

# --- 8. Permessi git ---
echo "▶ 8) Permessi repo (utente mycity)"
owner="$(stat -c '%U' "$REPO/.git/config" 2>/dev/null || echo "?")"
if [ "$owner" = "root" ]; then
  ko ".git/config di root — worker (mycity) non può fare git push"
  echo "     → sudo chown -R mycity:mycity $REPO"
else
  ok "Proprietario .git/config: $owner"
fi
echo

# --- 9. Ultimi log ---
echo "▶ 9) Ultimi 12 log worker"
journalctl -u mycity-worker -n 12 --no-pager 2>/dev/null || warn "journalctl non disponibile (non sei root?)"
echo
echo "═══════════════════════════════════════════════════════════"
echo " Se ai_check ✗ o battito assente → incolla l'output sopra in chat."
echo " Test rapido motore: sudo -u mycity -H bash $REPO/cervello/vps/test-agent.sh"
echo "═══════════════════════════════════════════════════════════"
