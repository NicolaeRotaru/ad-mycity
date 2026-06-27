#!/usr/bin/env bash
# giro.sh — GIRO DI PERLUSTRAZIONE dell'AD MyCity con Claude Code (piano Max), per VPS Linux.
# Equivalente Linux di giro.ps1. Gira nella cartella del repo, cosi' Claude Code prende
# automaticamente CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.
# Lo lancia il timer systemd (cervello/vps/mycity-giro.timer) ogni 2 ore.
set -euo pipefail

# Fuso di Piacenza: gli orari scritti in memoria (data:, SALA, AZIONI, commit) devono essere
# ora-di-parete italiana. Senza questo, su un VPS in UTC (default Hetzner) finiscono indietro di 1-2h.
export TZ="${TZ:-Europe/Rome}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

# Carica i segreti del server (se presenti). Su systemd arrivano anche da EnvironmentFile.
ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

ts() { date '+%Y-%m-%d %H:%M'; }

# Claude Code installato e loggato col Max?
if ! command -v claude >/dev/null 2>&1; then
  echo "[$(ts)] Claude Code (CLI 'claude') non trovato. Installalo e fai 'claude login' col tuo piano Max." >&2
  exit 1
fi

# Kill-switch: se il Pannello ha messo l'AD in PAUSA (impostazioni.pausa = on), non girare.
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    echo "[$(ts)] AD in PAUSA (kill-switch): giro saltato."
    exit 0
  fi
fi

# --- Prepara il ramo della memoria e ALLINEA IL CODICE a main (PRIMA del giro) ---
# Modello: il VPS lavora sul ramo dedicato 'memoria-ad' (vault accumulato: STATO/DECISIONI append-only +
# briefing). Il CODICE (pannello, cervello, agenti) arriva da 'main'. Tenendo la memoria FUORI da 'main',
# 'main' non diverge mai e i bugfix spinti su main arrivano davvero al server a ogni giro.
branch="${GIT_BRANCH:-memoria-ad}"
GIT_ID=(-c user.email="ad@mycity.local" -c user.name="AD MyCity (VPS)")
if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
  url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"   # token al volo, non salvato
  # 1) Mettiti sul ramo della memoria, partendo dall'accumulato remoto (se esiste).
  if git fetch "$url" "$branch" 2>/dev/null; then
    git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -f -B "$branch" 2>/dev/null || true
  else
    git checkout -f -B "$branch" 2>/dev/null || true   # primo giro: il ramo remoto non esiste ancora
  fi
  # 2) Porta dentro gli aggiornamenti di CODICE da main. File di codice e di vault sono disgiunti
  #    (cartelle diverse): i conflitti sono rari; in caso, vince main sul codice (-X theirs).
  if git fetch "$url" main 2>/dev/null; then
    if git "${GIT_ID[@]}" merge --no-edit -X theirs FETCH_HEAD 2>/dev/null; then
      echo "[$(ts)] Codice allineato a origin/main."
    else
      git merge --abort 2>/dev/null || true
      echo "[$(ts)] WARN: merge di main fallito, continuo col codice attuale." >&2
    fi
  fi
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento codice/memoria (solo locale)." >&2
fi

# Esegue il giro. acceptEdits: l'AD scrive nella sua memoria (il vault) senza chiedere ogni volta.
# Le azioni 🔴 restano comunque da firmare (regole in CLAUDE.md).
echo "[$(ts)] Avvio giro di perlustrazione AD..."
claude -p "$(cat "$SCRIPT_DIR/giro.md")" --permission-mode acceptEdits || {
  echo "[$(ts)] Claude ha restituito un errore (giro non completato)." >&2
}
echo "[$(ts)] Giro completato."

# --- Sync della memoria sul RAMO DEDICATO 'memoria-ad': commit + force-push, zero conflitti ---
# Il giro e' l'UNICO scrittore di questo ramo. Qui ci siamo gia' sopra (preparato prima del giro) con
# dentro il codice di main + il vault accumulato: committiamo le modifiche del giro e force-pushiamo.
# Il Pannello legge questo ramo via OBSIDIAN_BRANCH. 'main' resta intatto (la memoria non vive li').
git add -A 2>/dev/null || true          # stage di TUTTO (il .env e' gitignored, resta fuori)
if git diff --cached --quiet 2>/dev/null; then
  echo "[$(ts)] Nessuna modifica al vault da inviare."
else
  git "${GIT_ID[@]}" commit -q -m "giro AD: aggiorna memoria ($(ts))" || true
  if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
    url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"   # token al volo, non salvato
    ok=0
    for attempt in 1 2 3; do
      # ramo solo dell'AD: il force-push e' sicuro (nessun altro lo scrive) e non si incastra mai
      if git push --force "$url" "HEAD:${branch}" 2>/dev/null; then
        echo "[$(ts)] Memoria sincronizzata su GitHub (ramo $branch, tentativo $attempt)."
        ok=1; break
      fi
      echo "[$(ts)] Push tentativo $attempt fallito, riprovo..." >&2
      sleep 3
    done
    [ "$ok" = 1 ] || echo "[$(ts)] Push della memoria fallito dopo 3 tentativi (il giro successivo recupera)." >&2
  else
    echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: salto il push (la memoria resta solo sul server)."
  fi
fi
