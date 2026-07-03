#!/usr/bin/env bash
# giro.sh — GIRO DI PERLUSTRAZIONE dell'AD MyCity (motore AI: Cursor 'agent' o Claude 'claude'), per VPS Linux.
# Equivalente Linux di giro.ps1. Gira nella cartella del repo, cosi' il motore prende
# automaticamente CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.
# Il timer automatico (mycity-giro.timer) è DISATTIVATO. Lanciare a mano con giro-ora.sh.
set -uo pipefail   # niente -e: il giro deve arrivare al push anche se un passo intermedio fallisce

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
# AR-100: il controllo PAUSA è FAIL-CLOSED. Se lo stato pausa NON è leggibile (curl fallisce / HTTP≠2xx),
# NON proseguiamo al buio: meglio un giro saltato che un giro che parte mentre Nicola ha messo PAUSA.
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null)"; _pausa_rc=$?
  if [ "$_pausa_rc" -ne 0 ]; then
    # AR-100: PAUSA_FAIL_CLOSED — pausa non verificabile → fermati (non girare al buio).
    echo "[$(ts)] ⛔ PAUSA_FAIL_CLOSED: stato pausa non verificabile (curl rc=$_pausa_rc) — giro FERMATO per sicurezza (pausa non verificabile)." >&2
    exit 0
  fi
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
    fi
    # Commit locali non pushati: pubblicali prima del checkout -f (altrimenti si perdono).
    if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ]; then
      git fetch "$url" "$branch" 2>/dev/null || true
      _ahead_pre="$(git rev-list --count "FETCH_HEAD..HEAD" 2>/dev/null || echo 0)"
      if [ "${_ahead_pre:-0}" -gt 0 ] 2>/dev/null; then
        echo "[$(ts)] ▶ Push di ${_ahead_pre} commit pendenti su origin/${branch}..."
        for _ap in 1 2 3; do
          git fetch "$url" "$branch" 2>/dev/null \
            && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
          git push "$url" "HEAD:${branch}" 2>/dev/null && break
          sleep 3
        done
      fi
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

# Passi deterministici PRIMA del motore AI: sensori (retry REST + contatore cecità) e sonda volano.
# AR-010/AR-011: NON ingoiamo più l'exit code dei sensori. Se sono tutti ciechi, il giro deve saperlo
# e passare un VINCOLO HARD al motore ("non inventare numeri"), non solo una stampa buttata via.
SENSORI_CIECHI=0
SENSORI_VINCOLO=""
ALLOC_VINCOLO=""   # AR-081: vincolo dell'allocazione-check (popolato sotto se il guardiano fallisce)
if command -v node >/dev/null 2>&1; then
  echo "[$(ts)] Verifica sensori dati (retry REST + contatore cecità)..."
  # AR-038: il canale MCP è trasporto di sessione, NON testabile da script. Passiamo lo stato del
  # canale MCP a verifica-sensori con i flag --mcp-* (forcing-function): se la sessione AD ha appena
  # usato l'MCP mette GIRO_MCP_SUPABASE/GIRO_MCP_STRIPE=ok|cieco e lo inoltriamo; altrimenti NON
  # inventiamo uno stato (resta 'non_verificato' e sotto urliamo che l'MCP non conta come verità).
  MCP_FLAGS=()
  [ -n "${GIRO_MCP_SUPABASE:-}" ] && MCP_FLAGS+=(--mcp-supabase="$GIRO_MCP_SUPABASE")
  [ -n "${GIRO_MCP_STRIPE:-}" ] && MCP_FLAGS+=(--mcp-stripe="$GIRO_MCP_STRIPE")
  _sens_out="$(node "$SCRIPT_DIR/verifica-sensori.mjs" --json "${MCP_FLAGS[@]}" 2>&1)"; _sens_rc=$?
  printf '%s\n' "$_sens_out" | tail -6
  if [ "${#MCP_FLAGS[@]}" -eq 0 ]; then
    echo "[$(ts)] ⚠️  AR-038: MCP non verificato in questo giro (nessun GIRO_MCP_*) → resta 'non_verificato', NON conta come canale di verità (la fonte è il REST)." >&2
  fi
  if [ "$_sens_rc" -ne 0 ]; then
    SENSORI_CIECHI=1
    SENSORI_VINCOLO="⛔ SENSORI DATI CIECHI (verifica-sensori.mjs ha restituito 'tutti ciechi'). NON scrivere numeri nuovi come fatti: usa la baseline di STATO con la sua data di verifica e metti i dati mancanti nella sezione Gap. Se fuori non è cambiato nulla, fai un passaggio MINIMO e onesto invece di gonfiare il giro."
    echo "[$(ts)] ⚠️  SENSORI CIECHI (rc=$_sens_rc): il giro girerà in modalità baseline (niente numeri nuovi)." >&2
  fi
  echo "[$(ts)] Sonda volano (4 invarianti)..."
  node "$SCRIPT_DIR/sonda-volano.mjs" --json 2>&1 | tail -8 || true
  echo "[$(ts)] Sensore cassa/runway (AR-016)..."
  node "$SCRIPT_DIR/sensore-cassa.mjs" --json 2>&1 | tail -4 || true
  echo "[$(ts)] Guardiano registro agenti (AR-007/008)..."
  node "$SCRIPT_DIR/agent-registry-check.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] Guardiano capacità (workflow ↔ comandi)..."
  node "$SCRIPT_DIR/guardiano-capacita.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] Guardiano allocazione sforzo (AR-006: pesante solo su entità confermata)..."
  # AR-081: NON scartiamo più l'exit-code con "|| true". Cattura rc del guardiano e trattalo come
  # VINCOLO: se fallisce (una 'scelta_ragionata' accumula asset pesanti mentre un negozio 'confermato'
  # payout-ready è a 0) passiamo un vincolo hard al motore, invece di ingoiare l'errore in silenzio.
  _alloc_out="$(node "$SCRIPT_DIR/allocazione-check.mjs" 2>&1)"; _alloc_rc=$?
  printf '%s\n' "$_alloc_out" | tail -6
  if [ "$_alloc_rc" -ne 0 ]; then
    ALLOC_VINCOLO="⛔ ALLOCAZIONE SFORZO SBILANCIATA (allocazione-check.mjs rc=$_alloc_rc): una entità 'scelta_ragionata' (prospect non firmato, non nel DB) sta accumulando asset pesanti mentre un negozio 'confermato' payout-ready resta a 0. NON produrre altri asset pesanti intestati a entità non confermate: sposta lo sforzo sul negozio che può già incassare, o fermati a bozze-template neutre e riusabili."
    echo "[$(ts)] ⚠️  AR-081: allocazione-check FALLITO (rc=$_alloc_rc) → passo un vincolo hard al motore." >&2
  fi
  echo "[$(ts)] Sonda chiusura-loop quaderni (AR-009)..."
  node "$SCRIPT_DIR/chiusura-loop.mjs" --sonda 2>&1 | tail -4 || true
  # AR-023: RICONCILIA IL CANTIERE — chiude da solo i difetti il cui fix è GIÀ nel codice (prova
  # verifica:{file,pattern}). Gira SEMPRE (prima del delta-gate) così la chiusura è deterministica e
  # NON dipende dal motore AI: il sync di fine giro la pubblica su memoria-ad → il Pannello (che legge
  # quel ramo) non mostra più "in-corso" un difetto già risolto. Sola lettura del codice + bookkeeping.
  echo "[$(ts)] Auto-fix: riconcilia cantiere (chiude i difetti già risolti nel codice)..."
  node "$SCRIPT_DIR/auto-fix.mjs" verifica --applica 2>&1 | tail -6 || true
fi

# AR-019: DELTA-GATE — "niente di nuovo → salta il giro pesante". Confronta lo stato reale
# (ordini/clienti/incassi via REST + firma sentinelle) con l'ultimo giro PIENO. Se nulla è cambiato
# (ed è passato meno di DELTA_GATE_MAX_ORE dall'ultimo giro pieno), NON accendiamo il motore AI premium:
# gira solo la sonda leggera (già eseguita sopra). Così i ~9 giri/giorno a vuoto non bruciano token/Max.
# Bypass (i giri ON-DEMAND girano sempre; solo la cadenza fissa del timer viene throttlata):
#   - GIRO_FORCE=1 / DELTA_GATE_FORCE=1  → env (worker.sh lo mette per i giri dalla coda del Pannello)
#   - sentinella one-shot cervello/vps/.giro-force → giro-ora.sh la crea per il lancio manuale sul VPS
RUN_AI=1
FORCE_FLAG="$SCRIPT_DIR/vps/.giro-force"
if [ "${GIRO_FORCE:-0}" = 1 ] || [ "${DELTA_GATE_FORCE:-0}" = 1 ] || [ -f "$FORCE_FLAG" ]; then
  [ -f "$FORCE_FLAG" ] && rm -f "$FORCE_FLAG" 2>/dev/null   # one-shot: consumala così il timer dopo torna gated
  echo "[$(ts)] Delta-gate: BYPASS (giro forzato/on-demand) → giro pieno."
elif command -v node >/dev/null 2>&1; then
  _dg_out="$(node "$SCRIPT_DIR/delta-gate.mjs" 2>&1)"; _dg_rc=$?
  printf '%s\n' "$_dg_out" | tail -4
  if [ "$_dg_rc" = 20 ]; then
    RUN_AI=0
    echo "[$(ts)] ⏭️  DELTA-GATE: stato invariato dall'ultimo giro pieno → SALTO la parte AI pesante (solo sonda)."
  fi
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
if [ -n "$SENSORI_VINCOLO" ]; then
  PROMPT="$PROMPT

## Vincolo sensori (HARD — dal controllo deterministico prima di te)
$SENSORI_VINCOLO"
fi
if [ -n "$ALLOC_VINCOLO" ]; then
  # AR-081: il vincolo dell'allocazione-check arriva al motore come regola hard, non come log ingoiato.
  PROMPT="$PROMPT

## Vincolo allocazione sforzo (HARD — dal guardiano allocazione-check prima di te)
$ALLOC_VINCOLO"
fi
PROMPT="$PROMPT

## Risposta in chat
Al termine restituisci a Nicola il TL;DR del briefing (5 righe + mossa n.1)."

# GIRO_START serve anche fuori dal blocco AI (costo-ai a fine giro): lo fissiamo PRIMA del gate.
GIRO_START="$(date +%s)"
ai_rc=0
if [ "${RUN_AI:-1}" != 1 ]; then
  echo "[$(ts)] Parte AI SALTATA dal delta-gate (AR-019): nessun motore premium acceso in questo giro."
else
echo "[$(ts)] Avvio giro di perlustrazione AD (motore: $(ai_engine), prompt=file)..."
ai_build_cmd
# AR-005: timeout DENTRO giro.sh, così vale per QUALUNQUE invocatore (timer systemd o coda worker),
# non solo per la via-coda. Un motore AI appeso al primo tentativo non torna mai: senza questo, il
# battito ogni-2h muore in silenzio. `timeout` (coreutils) è sempre presente su VPS Linux.
GIRO_AI_TIMEOUT="${GIRO_AI_TIMEOUT:-2700}"   # 45 min per tentativo
AI_TIMEOUT=()
command -v timeout >/dev/null 2>&1 && AI_TIMEOUT=(timeout --kill-after=60s "$GIRO_AI_TIMEOUT")
GIRO_START="$(date +%s)"   # inizio effettivo del motore AI (per il costo del giro)
ai_rc=0
_ai_out=""
for _attempt in 1 2 3; do
  ai_rc=0
  _ai_out="$("${AI_TIMEOUT[@]}" "${AI_CMD[@]}" "$PROMPT" 2>&1)" || ai_rc=$?
  printf '%s\n' "$_ai_out"
  [ "$ai_rc" -eq 0 ] && break
  printf '%s\n' "$_ai_out" | tail -15 >&2
  # AR-092: NON riprovare ciecamente. Chiedi a retry-policy.mjs (fonte unica: classificaErrore) SE
  # questo errore va ritentato — così un errore non-ritentabile o esaurito si ferma subito invece di
  # bruciare 3 rilanci fissi. Il tipo 'giro' è pre-esecuzione (0 rischio doppio-invio reale).
  _rp_azione="ritenta"; _rp_classe="?"
  if command -v node >/dev/null 2>&1; then
    _rp_risultato="rc=$ai_rc $(printf '%s' "$_ai_out" | tail -c 4000)"
    _rp_json="$(RP_TIPO=giro RP_TENTATIVI="$_attempt" RP_RISULTATO="$_rp_risultato" \
      node "$SCRIPT_DIR/retry-policy.mjs" decidi 2>/dev/null || true)"
    case "$_rp_json" in *'"azione":"stop"'*) _rp_azione="stop" ;; esac
    _c="$(printf '%s' "$_rp_json" | grep -o '"classe":"[^"]*"' | head -1 | cut -d'"' -f4)"
    [ -n "$_c" ] && _rp_classe="$_c"
  fi
  if [ "$_rp_azione" = "stop" ]; then
    echo "[$(ts)] Motore AI tentativo $_attempt fallito (rc=$ai_rc, classe=$_rp_classe) — retry-policy dice STOP: non ritento a vuoto." >&2
    break
  fi
  echo "[$(ts)] Motore AI tentativo $_attempt fallito (rc=$ai_rc, classe=$_rp_classe) — retry-policy dice RITENTA, riprovo tra 30s..." >&2
  [ "$_attempt" -lt 3 ] && sleep 30
done
if [ "$ai_rc" -ne 0 ]; then
  echo "[$(ts)] Il motore AI ha restituito un errore dopo 3 tentativi (rc=$ai_rc)." >&2
  echo "[$(ts)]   Ultimo output agent:" >&2
  printf '%s\n' "$_ai_out" | tail -25 >&2
  echo "[$(ts)]   Se test-agent.sh passa ma il giro no: journalctl -u mycity-worker -n 50" >&2
fi
echo "[$(ts)] Giro completato."

# AR-014: gate deterministico sui passi 11-12 del giro (auto-analisi + apprendimento). Se il motore
# AI li ha saltati in silenzio, questi file NON risultano aggiornati in questo giro: lo diciamo forte
# (non è un exit 0 pulito) invece di far finta di niente. Non blocca il push della memoria già scritta.
GIRO_STEPS_OK=1
if [ "$ai_rc" -eq 0 ]; then
  for _rel in auto-coscienza/auto-analisi.json auto-coscienza/apprendimento.json; do
    _p="MyCity-Vault/90-Memoria-AI/$_rel"
    if [ ! -f "$_p" ] || [ "$(stat -c %Y "$_p" 2>/dev/null || echo 0)" -lt "$GIRO_START" ]; then
      GIRO_STEPS_OK=0
      echo "[$(ts)] ⚠️  PASSO DEL GIRO SALTATO: $_p mancante o non aggiornato in questo giro (vedi passi 11-12 di giro.md)." >&2
    fi
  done
fi
# AR-019: un giro PIENO è appena girato → promuovi la firma corrente a riferimento, così i prossimi
# giri si confrontano con QUESTO stato e saltano finché ordini/clienti/incassi/sentinelle non cambiano.
command -v node >/dev/null 2>&1 && node "$SCRIPT_DIR/delta-gate.mjs" --segna-pieno >/dev/null 2>&1 || true
fi   # fine blocco RUN_AI (delta-gate AR-019)

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
# AR-021: scan-segreti PRIMA di versionare qualunque cosa. Se trova un segreto reale nei file
# versionabili, BLOCCHIAMO commit+push del giro: meglio un giro non pubblicato che un token nella storia.
SEGRETO_TROVATO=0
if command -v node >/dev/null 2>&1; then
  if ! node "$SCRIPT_DIR/scan-segreti.mjs" >/dev/null 2>&1; then
    SEGRETO_TROVATO=1
    echo "[$(ts)] ⛔ SCAN SEGRETI: possibile segreto nei file versionabili — sync memoria BLOCCATA." >&2
    node "$SCRIPT_DIR/scan-segreti.mjs" 2>&1 | tail -12 >&2 || true
  fi
fi

exec 9>"$LOCK"
if [ "$SEGRETO_TROVATO" = 1 ]; then
  GIRO_PUSH_OK=0
  echo "[$(ts)] Giro NON pubblicato: rimuovi il segnalato dallo scan-segreti, poi rilancia." >&2
elif flock -w 600 9; then
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
        # Battito per diagnosi Pannello (ultimo push + ora giro per il Cuore).
        if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
          _now_iso="$(date -Iseconds)"
          _giro_quando="$_now_iso"
          if [ -f "MyCity-Vault/90-Memoria-AI/ultimo-briefing.json" ] && command -v jq >/dev/null 2>&1; then
            _bq="$(jq -r '.data // empty' MyCity-Vault/90-Memoria-AI/ultimo-briefing.json 2>/dev/null || true)"
            [ -n "$_bq" ] && _giro_quando="$_bq"
          fi
          for _pair in "memoria-ad:ultimo_push|$_now_iso" "cuore:ultimo_giro|$_giro_quando"; do
            _chiave="${_pair%%|*}"
            _valore="${_pair#*|}"
            curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" \
              -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
              -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates,return=minimal" \
              -d "{\"chiave\":\"$_chiave\",\"valore\":\"$_valore\",\"updated_at\":\"$_now_iso\"}" \
              >/dev/null 2>&1 || true
          done
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

# AR-020: registra il costo del giro (durata + token se noti) così la macchina non è cieca sul proprio consumo.
# Se il delta-gate (AR-019) ha SALTATO la parte AI, lo registriamo come "giro-saltato" con 0 token: così il
# log costo-ai.json rende VISIBILE il risparmio (quanti giri pieni sono stati evitati perché nulla cambiava).
if command -v node >/dev/null 2>&1 && [ -n "${GIRO_START:-}" ]; then
  _giro_durata=$(( $(date +%s) - GIRO_START ))
  if [ "${RUN_AI:-1}" != 1 ]; then
    node "$SCRIPT_DIR/costo-ai.mjs" --tipo=giro-saltato --durata-sec="$_giro_durata" --token=0 --modello="delta-gate" >/dev/null 2>&1 || true
  else
    node "$SCRIPT_DIR/costo-ai.mjs" --tipo=giro --durata-sec="$_giro_durata" ${GIRO_TOKEN:+--token="$GIRO_TOKEN"} --modello="$(ai_engine)" >/dev/null 2>&1 || true
  fi
fi

# Segnale finale AR-014: se il motore ha girato ma ha saltato i passi 11-12, lascialo scritto nel log
# (la memoria già prodotta viene comunque pubblicata: non si perde nulla, ma la qualità del giro è segnata).
if [ "${GIRO_STEPS_OK:-1}" = 0 ]; then
  echo "[$(ts)] ⚠️  QUALITÀ GIRO: auto-analisi/apprendimento non aggiornati in questo giro (passi 11-12 saltati)." >&2
fi

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
