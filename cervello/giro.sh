#!/usr/bin/env bash
# giro.sh — GIRO DI PERLUSTRAZIONE dell'AD MyCity con Claude Code (piano Max), per VPS Linux.
# Equivalente Linux di giro.ps1. Gira nella cartella del repo, cosi' Claude Code prende
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
# Modello: il VPS lavora sul ramo dedicato 'memoria-ad' (vault accumulato: STATO/DECISIONI/briefing +
# consegne/creativi). Il CODICE (pannello, cervello, agenti) arriva da 'main'. Tenendo la memoria FUORI da
# 'main', 'main' non diverge mai e i bugfix spinti su main arrivano al server a ogni giro.
branch="${GIT_BRANCH:-memoria-ad}"
GIT_ID=(-c user.email="ad@mycity.local" -c user.name="AD MyCity (VPS)")
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
    if git fetch "$url" main 2>/dev/null; then
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
      echo "[$(ts)] WARN: fetch di main fallito: salto allineamento codice e bootstrap auto-coscienza." >&2
    fi
  ) 9>"$LOCK" || true
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento codice/memoria (solo locale)." >&2
fi

# Esegue il giro. acceptEdits: l'AD scrive nella sua memoria (il vault) senza chiedere ogni volta.
# Le azioni 🔴 restano comunque da firmare (regole in CLAUDE.md).
# Guardia: leggi il prompt DOPO l'allineamento e abortisci se vuoto (evita il "--print con input vuoto").
PROMPT="$(cat "$SCRIPT_DIR/giro.md" 2>/dev/null || true)"
if [ -z "$PROMPT" ]; then
  echo "[$(ts)] ERRORE: cervello/giro.md non trovato/vuoto dopo l'allineamento; giro saltato." >&2
  exit 1
fi
echo "[$(ts)] Avvio giro di perlustrazione AD..."
claude -p "$PROMPT" --permission-mode acceptEdits || {
  echo "[$(ts)] Claude ha restituito un errore (giro non completato)." >&2
}
echo "[$(ts)] Giro completato."

# --- Sync della memoria sul RAMO DEDICATO 'memoria-ad': commit + push (rebase, NON force) ---
# Sotto lo STESSO lock del worker: i due non si pestano. Push NON-force con rebase, così le scritture del
# worker (pushate su memoria-ad) NON vengono mai cancellate dal giro (col force-push le perdeva).
# Il Pannello legge questo ramo via OBSIDIAN_BRANCH. 'main' resta intatto (la memoria non vive li').
(
  flock -w 600 9 || exit 0   # Fix A: timeout sul lock (se salta, il prossimo giro recupera il WIP)
  # Guardia auto-coscienza: l'auto-analisi DEVE aver persistito il verdetto qui (la Cabina lo legge da questo file).
  [ -f "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-analisi.json" ] \
    || echo "[$(ts)] ⚠️  AUTO-ANALISI NON PERSISTITA: manca auto-coscienza/auto-analisi.json — la Cabina resterà vuota (vedi passo 11 del giro)." >&2
  git add -A 2>/dev/null || true          # stage di TUTTO (il .env e' gitignored, resta fuori)
  if git diff --cached --quiet 2>/dev/null; then
    echo "[$(ts)] Nessuna modifica al vault da inviare."
  else
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
      [ "$ok" = 1 ] || echo "[$(ts)] Push della memoria fallito dopo 3 tentativi (il giro successivo recupera)." >&2
    else
      echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: salto il push (la memoria resta solo sul server)."
    fi
  fi
) 9>"$LOCK" || true
