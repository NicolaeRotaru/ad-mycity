#!/usr/bin/env bash
# giro.sh — GIRO DI PERLUSTRAZIONE dell'AD MyCity (motore AI: Cursor 'agent' o Claude 'claude'), per VPS Linux.
# Equivalente Linux di giro.ps1. Gira nella cartella del repo, cosi' il motore prende
# automaticamente CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.
# Il timer automatico (mycity-giro.timer) è DISATTIVATO. Lanciare a mano con giro-ora.sh.
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

# Motore AI condiviso (Cursor 'agent' di default, oppure Claude 'claude'). Vedi cervello/motore-ai.sh.
. "$SCRIPT_DIR/motore-ai.sh"

ts() { date '+%Y-%m-%d %H:%M'; }

# Motore AI installato e utilizzabile?
ai_check || { echo "[$(ts)] Motore AI non disponibile. Vedi cervello/vps/setup.sh." >&2; exit 1; }

# Il worker gira come «mycity»: se .git è di root, fetch/push falliscono (Permission denied).
if [ -f "$REPO/.git/config" ] && ! test -w "$REPO/.git/config" 2>/dev/null; then
  echo "[$(ts)] ERRORE: .git/config non scrivibile da $(id -un) — git bloccato." >&2
  echo "[$(ts)]   Fix (come root): sudo chown -R mycity:mycity $REPO && sudo systemctl restart mycity-worker" >&2
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
# Modello: il VPS lavora sul ramo dedicato 'memoria-ad' (vault accumulato: STATO/DECISIONI/briefing +
# consegne/creativi). Il CODICE (pannello, cervello, agenti) arriva da 'main'. Tenendo la memoria FUORI da
# 'main', 'main' non diverge mai e i bugfix spinti su main arrivano al server a ogni giro.
branch="${GIT_BRANCH:-memoria-ad}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-ad@mycity.local}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity (VPS)}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
LOCK="$REPO/.git/mycity-sync.lock"           # serializza le operazioni git tra giro e worker (stesso working tree)
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)   # cartelle ACCUMULATE dell'AD: mai sovrascritte da main
if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
  url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"   # token al volo, non salvato
  (
    flock -w 600 9 || exit 0   # Fix A: timeout sul lock — niente hang se un altro processo resta appeso
    # Fix B: se un giro precedente è morto lasciando scritture del vault NON committate (siamo ancora sul
    # ramo memoria-ad), salvale e pushale PRIMA del reset distruttivo qui sotto, così non vengono perse.
    if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ] && [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      git add -A 2>/dev/null || true
      git "${GIT_ID[@]}" commit -q -m "recupero: scritture pendenti da un giro interrotto ($(ts))" 2>/dev/null || true
      git push "$url" "HEAD:${branch}" 2>/dev/null && echo "[$(ts)] Recuperate scritture pendenti di un giro precedente." || true
    fi
    # 1) Mettiti sul ramo della memoria, dall'accumulato remoto (include le scritture pushate dal worker).
    if git fetch "$url" "$branch" 2>/dev/null; then
      git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -f -B "$branch" 2>/dev/null || true
    else
      git checkout -f -B "$branch" 2>/dev/null || true   # primo giro: il ramo remoto non esiste ancora
    fi
    # 2) Allinea SOLO il CODICE a main (NIENTE merge, e soprattutto NIENTE checkout delle cartelle di
    #    memoria). Prendo i soli path top-level di main che NON sono cartelle di memoria: così il vault
    #    (MyCity-Vault/consegne/creativi/memoria-squadra) non viene MAI toccato dall'allineamento →
    #    impossibile resuscitare file potati dall'AD o sovrascrivere le scritture del vault. Deterministico.
    #    (La memoria resta quella del ramo memoria-ad, ripresa dal remoto al passo 1.)
    _main_ok=0
    _main_err=""
    for _mf in 1 2 3; do
      if _main_err="$(git fetch "$url" main 2>&1)"; then _main_ok=1; break; fi
      sleep 2
    done
    if [ "$_main_ok" = 1 ]; then
      code_paths=()
      while IFS= read -r p; do
        case "$p" in MyCity-Vault|consegne|creativi|memoria-squadra) ;; *) code_paths+=("$p") ;; esac
      done < <(git ls-tree --name-only FETCH_HEAD)
      if [ "${#code_paths[@]}" -gt 0 ] && git checkout FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null; then
        git "${GIT_ID[@]}" commit -q -m "giro: allinea codice a main (vault intatto) ($(ts))" 2>/dev/null || true
        echo "[$(ts)] Codice allineato a origin/main (solo codice, vault intatto)."
      else
        echo "[$(ts)] WARN: allineamento del codice fallito, continuo col codice attuale." >&2
      fi
      # Bootstrap-if-absent dell'AUTO-COSCIENZA dallo scaffold di main. Il vault vive su memoria-ad e NON viene
      # mai sovrascritto da main; MA se la CARTELLA auto-coscienza non esiste ancora su memoria-ad (ramo fresco,
      # l'AD non l'ha mai creata) la prendo UNA TANTUM da main: cosi' la Cabina ha una base e l'auto-analisi ha
      # il registro-realta da leggere per il grounding. SOLO se la CARTELLA manca -> appena esiste l'AD ne e'
      # padrone e il giro non la tocca piu' (niente resurrezione di un file che l'AD ha potato di proposito).
      # (FETCH_HEAD qui = main.) Resta staged: lo committa il sync della memoria a fine giro, su memoria-ad.
      ac="MyCity-Vault/90-Memoria-AI/auto-coscienza"
      if [ ! -d "$ac" ] && git cat-file -e "FETCH_HEAD:$ac/auto-analisi.json" 2>/dev/null; then
        git checkout FETCH_HEAD -- "$ac" 2>/dev/null \
          && echo "[$(ts)] Bootstrap auto-coscienza: scaffold preso da main (cartella mancante su $branch)." \
          || echo "[$(ts)] WARN: bootstrap auto-coscienza fallito, continuo." >&2
      fi
    else
      echo "[$(ts)] WARN: fetch di main fallito dopo 3 tentativi — continuo col codice già sul disco." >&2
      [ -n "$_main_err" ] && echo "[$(ts)]   Dettaglio git: $_main_err" >&2
    fi
  ) 9>"$LOCK" || true
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento codice/memoria (solo locale)." >&2
fi

# Esegue il giro col motore AI. L'AD scrive nella sua memoria (il vault) senza chiedere ogni volta.
# Le azioni 🔴 restano comunque da firmare (regole in CLAUDE.md).
# NON incollare tutto giro.md nel prompt (16k+ caratteri → agent instabile su VPS).
# L'agent gira nel repo con --force: legge cervello/giro.md dal disco.
if [ ! -s "$SCRIPT_DIR/giro.md" ]; then
  echo "[$(ts)] ERRORE: cervello/giro.md non trovato/vuoto dopo l'allineamento; giro saltato." >&2
  exit 1
fi
PROMPT="Sei l'AD digitale di MyCity (segui CLAUDE.md e gli agenti in .claude/agents/).

## Compito
Leggi ed esegui **per intero** il file \`cervello/giro.md\` in questo repository (aprilo dal disco con Read, NON saltare passi).
Scrivi sul disco tutti i file richiesti (vault, briefing, auto-coscienza, ecc.). Rispetta 🟢🟡🔴.
La memoria va sul ramo memoria-ad (il push git lo fa giro.sh dopo di te — tu scrivi i file)."
if [ -n "${GIRO_EXTRA_INSTRUCTION:-}" ]; then
  PROMPT="$PROMPT

## Istruzione aggiuntiva
$GIRO_EXTRA_INSTRUCTION"
fi
PROMPT="$PROMPT

## Risposta in chat
Al termine restituisci a Nicola il TL;DR del briefing (5 righe + mossa n.1)."

echo "[$(ts)] Avvio giro di perlustrazione AD (motore: $(ai_engine), prompt=file)..."
ai_build_cmd
ai_rc=0
_ai_out=""
for _attempt in 1 2 3; do
  ai_rc=0
  _ai_out="$("${AI_CMD[@]}" "$PROMPT" 2>&1)" || ai_rc=$?
  printf '%s\n' "$_ai_out"
  [ "$ai_rc" -eq 0 ] && break
  echo "[$(ts)] Motore AI tentativo $_attempt fallito (rc=$ai_rc) — riprovo tra 30s..." >&2
  printf '%s\n' "$_ai_out" | tail -15 >&2
  [ "$_attempt" -lt 3 ] && sleep 30
done
if [ "$ai_rc" -ne 0 ]; then
  echo "[$(ts)] Il motore AI ha restituito un errore dopo 3 tentativi (rc=$ai_rc)." >&2
  echo "[$(ts)]   Ultimo output agent:" >&2
  printf '%s\n' "$_ai_out" | tail -25 >&2
  echo "[$(ts)]   Se test-agent.sh passa ma il giro no: journalctl -u mycity-worker -n 50" >&2
fi
echo "[$(ts)] Giro completato."

# TL;DR per la chat (se il digest è stato scritto nel vault).
GIRO_TLDR=""
if [ -f "MyCity-Vault/90-Memoria-AI/ultimo-briefing.json" ] && command -v jq >/dev/null 2>&1; then
  _data="$(jq -r '.data // empty' MyCity-Vault/90-Memoria-AI/ultimo-briefing.json 2>/dev/null || true)"
  _sit="$(jq -r '.situazione // empty' MyCity-Vault/90-Memoria-AI/ultimo-briefing.json 2>/dev/null || true)"
  if [ -n "$_sit" ]; then
    GIRO_TLDR="## TL;DR — Giro ${_data:-$(ts)}

$_sit"
    printf '%s\n' "$GIRO_TLDR"
  fi
fi

# --- Sync della memoria sul RAMO DEDICATO 'memoria-ad': commit + push (rebase, NON force) ---
# Sotto lo STESSO lock del worker: i due non si pestano. Push NON-force con rebase, così le scritture del
# worker (pushate su memoria-ad) NON vengono mai cancellate dal giro (col force-push le perdeva).
# Il Pannello legge questo ramo via OBSIDIAN_BRANCH. 'main' resta intatto (la memoria non vive li').
GIRO_PUSH_OK=1
GIRO_HAD_CHANGES=0
exec 9>"$LOCK"
if flock -w 600 9; then
  # Guardia auto-coscienza: l'auto-analisi DEVE aver persistito il verdetto qui (la Cabina lo legge da questo file).
  [ -f "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-analisi.json" ] \
    || echo "[$(ts)] ⚠️  AUTO-ANALISI NON PERSISTITA: manca auto-coscienza/auto-analisi.json — la Cabina resterà vuota (vedi passo 11 del giro)." >&2
  git add -A 2>/dev/null || true          # stage di TUTTO (il .env e' gitignored, resta fuori)
  if git diff --cached --quiet 2>/dev/null; then
    echo "[$(ts)] Nessuna modifica al vault da inviare."
  else
    GIRO_HAD_CHANGES=1
    git "${GIT_ID[@]}" commit -q -m "giro AD: aggiorna memoria ($(ts))" || true
    if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
      url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"   # token al volo, non salvato
      ok=0
      for attempt in 1 2 3; do
        # riallineati al remoto (il worker potrebbe aver pushato) con rebase, poi push fast-forward
        git fetch "$url" "$branch" 2>/dev/null && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
        if git push "$url" "HEAD:${branch}" 2>/dev/null; then
          echo "[$(ts)] Memoria sincronizzata su GitHub (ramo $branch, tentativo $attempt)."
          ok=1; break
        fi
        echo "[$(ts)] Push tentativo $attempt fallito, riprovo..." >&2
        sleep 3
      done
      if [ "$ok" = 1 ]; then
        # Battito per diagnosi Pannello (ultimo push memoria-ad riuscito).
        if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
          curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" \
            -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
            -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates,return=minimal" \
            -d "{\"chiave\":\"memoria-ad:ultimo_push\",\"valore\":\"$(date -Iseconds)\",\"updated_at\":\"$(date -Iseconds)\"}" \
            >/dev/null 2>&1 || true
        fi
      else
        GIRO_PUSH_OK=0
        echo "[$(ts)] ERRORE: push della memoria fallito dopo 3 tentativi." >&2
      fi
    else
      echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: salto il push (la memoria resta solo sul server)." >&2
      GIRO_PUSH_OK=0
    fi
  fi
else
  GIRO_PUSH_OK=0
  echo "[$(ts)] WARN: lock git occupato troppo a lungo — sync memoria saltata (prossimo giro recupera)." >&2
fi
exec 9>&-

# Exit code per worker.sh:
#   0 = ok (o memoria salvata nonostante AI parziale)
#   1 = AI fallita e nessuna memoria nuova pubblicata
#   2 = memoria scritta ma push fallito
if [ "$GIRO_HAD_CHANGES" = 1 ] && [ "$GIRO_PUSH_OK" != 1 ]; then
  exit 2
fi
if [ "$ai_rc" -ne 0 ]; then
  if [ "$GIRO_HAD_CHANGES" = 1 ] && [ "$GIRO_PUSH_OK" = 1 ]; then
    echo "[$(ts)] WARN: motore AI instabile ma memoria pubblicata su GitHub." >&2
    exit 0
  fi
  exit 1
fi
exit 0
