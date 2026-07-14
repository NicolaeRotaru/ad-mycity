#!/usr/bin/env bash
# giro.sh — GIRO DI PERLUSTRAZIONE dell'AD MyCity (motore AI: Cursor 'agent' o Claude 'claude'), per VPS Linux.
# Equivalente Linux di giro.ps1. Gira nella cartella del repo, cosi' il motore prende
# automaticamente CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.
# AR-060: il battito è ATTIVO. Il timer automatico (mycity-giro.timer) fa girare il giro ogni ~2h;
# la cadenza reale è nel file .timer (unica fonte di verità). Per un giro a mano usa giro-ora.sh.
set -uo pipefail   # niente -e: il giro deve arrivare al push anche se un passo intermedio fallisce

# Fuso di Piacenza: gli orari scritti in memoria (data:, SALA, AZIONI, commit) devono essere
# ora-di-parete italiana. Senza questo, su un VPS in UTC (default Hetzner) finiscono indietro di 1-2h.
export TZ="${TZ:-Europe/Rome}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

# Hook git versionati (scan-segreti al commit) — idempotente, attiva core.hooksPath su ogni clone.
if [ -f "$SCRIPT_DIR/installa-hooks.sh" ]; then
  bash "$SCRIPT_DIR/installa-hooks.sh" >/dev/null 2>&1 || true
fi

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

# --- RAMO UNICO: allinea codice+memoria all'ultimo remoto (PRIMA del giro), in modo NON distruttivo ---
# Modello a ramo unico (Fase 2): codice E memoria vivono su UN SOLO ramo = 'main' (OBSIDIAN_BRANCH=main,
# GIT_BRANCH=main). Non c'è più il ramo 'memoria-ad' separato né l'allineamento del codice da main: siamo
# GIÀ su main. Qui ci portiamo all'ultimo commit remoto (bugfix + memoria pushata altrove) SENZA azzerare
# le scritture locali non ancora pushate — niente 'checkout -f' distruttivo che le perderebbe.
branch="${GIT_BRANCH:-main}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-98592323+NicolaeRotaru@users.noreply.github.com}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity (VPS)}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
LOCK="$REPO/.git/mycity-sync.lock"           # serializza le operazioni git tra giro e worker (stesso working tree)
# AR-044: perimetro-memoria — solo queste cartelle entrano in git (il codice non si auto-modifica).
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)
if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
  url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"   # token al volo, non salvato
  (
    flock -w 600 9 || exit 0   # Fix A: timeout sul lock — niente hang se un altro processo resta appeso
    # Fix B (PRESERVATA): se un giro precedente è morto lasciando scritture del vault NON committate,
    # committale ORA — così il rebase/merge qui sotto non le trova come modifiche pendenti (fallirebbe) e
    # non vanno perse. Il push finale del giro le pubblica.
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      git add -A "${MEM_DIRS[@]}" 2>/dev/null || true  # AR-044: solo memoria, mai codice
      git restore --staged pannello/ cervello/ 2>/dev/null || true  # guard: mai codice in recupero
      git "${GIT_ID[@]}" commit -q -m "recupero: scritture pendenti da un giro interrotto ($(ts))" 2>/dev/null || true
    fi
    # Portati all'ultimo remoto in modo NON distruttivo: fetch + rebase (fallback merge --no-edit). I commit
    # locali non pushati restano DENTRO HEAD (rebase li riapplica sopra il remoto) — nessuna scrittura persa.
    _fetch_ok=0
    _fetch_err=""
    for _mf in 1 2 3; do
      if _fetch_err="$(git fetch "$url" "$branch" 2>&1)"; then _fetch_ok=1; break; fi
      sleep 2
    done
    if [ "$_fetch_ok" = 1 ]; then
      _cur="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"
      if [ "$_cur" = "$branch" ]; then
        # Siamo sul ramo: rebase dei commit locali sopra l'ultimo remoto. Se il rebase entra in conflitto
        # (snapshot toccato da due parti) abortisci e prova un merge non distruttivo; se anche il merge
        # confligge abortisci e resta sul locale — il push finale (rebase-retry) riproverà, niente si perde.
        if git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null; then
          echo "[$(ts)] Ramo unico: allineato a origin/${branch} via rebase (scritture locali preservate)."
        else
          git rebase --abort 2>/dev/null || true
          if git "${GIT_ID[@]}" merge --no-edit FETCH_HEAD 2>/dev/null; then
            echo "[$(ts)] Ramo unico: allineato a origin/${branch} via merge (rebase in conflitto)."
          else
            git merge --abort 2>/dev/null || true
            echo "[$(ts)] WARN: rebase/merge su ${branch} in conflitto — continuo col locale, il push finale riproverà." >&2
          fi
        fi
      else
        # Detached/primo giro: portati sul ramo dall'accumulato remoto.
        git checkout -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -B "$branch" 2>/dev/null || true
        echo "[$(ts)] Ramo unico: HEAD portato su ${branch} da origin/${branch}."
      fi
    else
      echo "[$(ts)] WARN: fetch di ${branch} fallito dopo 3 tentativi — continuo col codice/memoria già sul disco." >&2
      [ -n "$_fetch_err" ] && echo "[$(ts)]   Dettaglio git: $_fetch_err" >&2
    fi
  ) 9>"$LOCK" || true
else
  echo "[$(ts)] GIT_PUSH_TOKEN/GIT_REPO non impostati: niente allineamento remoto (solo locale)." >&2
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
ALLOC_VINCOLO=""      # AR-081: vincolo dell'allocazione-check (popolato sotto se il guardiano fallisce)
REGISTRO_SCELTE_VINCOLO=""  # AR-103: dossier vendite scelta_ragionata non sincronizzati nel registro
LOOP_VINCOLO=""       # PZ-008: vincolo del gate chiusura-loop (FATTO in Sala senza ESITO nel quaderno)
FATTI_VINCOLO=""      # AR-102: vincolo del gate coerenza-fatti (copie vecchie di un fatto in file vivi)
CHECKLIST_VINCOLO=""  # AR-030: vincolo freschezza checklist Nicola (stantia se > 2 giorni)
CAL_VINCOLO=""        # AR-042: vincolo calibrazione senza voci strutturate (schema legacy)
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
  # FIX gate-verità (AR-011): il freno HARD deve dipendere SPECIFICAMENTE da supabase_rest (la fonte-di-verità
  # di ordini/clienti), NON dall'exit-code — che è 0 se un QUALSIASI sensore configurato è vivo (basta l'uptime
  # del sito o Stripe). Se supabase_rest è cieco ma un altro sensore regge, _sens_rc=0 ma i NUMERI ordini/clienti
  # sono ciechi lo stesso: leggiamo datiOrdiniCiechi dal JSON e imponiamo comunque "niente numeri nuovi".
  elif printf '%s' "$_sens_out" | grep -q '"datiOrdiniCiechi": *true'; then
    SENSORI_CIECHI=1
    SENSORI_VINCOLO="⛔ FONTE-DI-VERITÀ DATI CIECA: supabase_rest (ordini/clienti via REST) NON è 'ok', anche se altri sensori (uptime/stripe/posthog) reggono. I numeri ordini/clienti/incassi sono ciechi: NON scriverli come fatti nuovi. Usa la baseline di STATO con la sua data di verifica e metti i dati mancanti nella sezione Gap."
    echo "[$(ts)] ⚠️  SUPABASE_REST CIECO (datiOrdiniCiechi=true, ma altri sensori vivi): vincolo HARD 'niente numeri nuovi' comunque attivo." >&2
  fi
  echo "[$(ts)] Tasso applicazione lezioni (AR-051, prima della sonda)..."
  node "$SCRIPT_DIR/tasso-lezioni.mjs" --json 2>&1 | tail -4 || true
  echo "[$(ts)] Sonda volano (4 invarianti)..."
  node "$SCRIPT_DIR/sonda-volano.mjs" --json 2>&1 | tail -8 || true
  echo "[$(ts)] Sensore cassa/runway (AR-016)..."
  node "$SCRIPT_DIR/sensore-cassa.mjs" --json 2>&1 | tail -4 || true
  echo "[$(ts)] Sentinella fonti web (AR-036)..."
  node "$SCRIPT_DIR/sentinella-fonti.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] Guardiano registro agenti (AR-007/008)..."
  node "$SCRIPT_DIR/agent-registry-check.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] Guardiano stampo senior (vettori-installati / Come pensa l'AD)..."
  node "$SCRIPT_DIR/stampo-check.mjs" 2>&1 | tail -6 || true
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
  echo "[$(ts)] Guardiano registro scelte ragionate (AR-103: dossier vendite ↔ registro-realta)..."
  _rs_out="$(node "$SCRIPT_DIR/registro-scelte-check.mjs" 2>&1)"; _rs_rc=$?
  printf '%s\n' "$_rs_out" | tail -8
  if [ "$_rs_rc" -ne 0 ]; then
    REGISTRO_SCELTE_VINCOLO="⛔ REGISTRO SCELTE INCOMPLETO (registro-scelte-check.mjs rc=$_rs_rc): un dossier in consegne/vendite dichiara prospect 'scelta_ragionata' ma mancano nel registro-realta.json — il Pannello mostra una lista incompleta. PRIMA di chiudere: aggiungi OGNI entità mancante in MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json (stato scelta_ragionata, evidenze, fonte_ragionamento) e riesegui node cervello/registro-scelte-check.mjs finché passa (exit 0)."
    echo "[$(ts)] ⚠️  AR-103: registro-scelte-check FALLITO (rc=$_rs_rc) → passo un vincolo hard al motore." >&2
  fi
  echo "[$(ts)] Supervisione negozi & prodotti (dati mancanti → proposte da firmare)..."
  # Veglia ogni negozio e ogni prodotto, trova i dati mancanti e ACCODA le proposte 🟡 di riempimento
  # (autofill deducibile) in AZIONI-IN-ATTESA — sola lettura del marketplace, niente scrive sul DB, mai
  # tocca campi sensibili (legale/fiscale/IBAN/KYC/Stripe/consensi). Non è un gate: || true.
  node "$SCRIPT_DIR/supervisione-negozi.mjs" --accoda 2>&1 | tail -6 || true
  echo "[$(ts)] Sonda chiusura-loop quaderni (AR-009)..."
  node "$SCRIPT_DIR/chiusura-loop.mjs" --sonda 2>&1 | tail -4 || true
  # PZ-008 (piano "chiudi i loop"): GATE chiusura-loop — chi ha scritto FATTO in Sala OGGI deve avere
  # l'ESITO nel quaderno. Se manca, il motore riceve un VINCOLO HARD (stesso pattern di allocazione-check):
  # il loop atteso→reale smette di essere decorativo.
  echo "[$(ts)] Gate chiusura-loop (FATTO in Sala ⇒ ESITO nel quaderno)..."
  _loop_out="$(node "$SCRIPT_DIR/chiusura-loop.mjs" --gate 2>&1)"; _loop_rc=$?
  printf '%s\n' "$_loop_out" | tail -6
  if [ "$_loop_rc" -ne 0 ]; then
    LOOP_VINCOLO="⛔ LOOP NON CHIUSO (chiusura-loop --gate rc=$_loop_rc): reparti con FATTO in SALA-OPERATIVA oggi ma SENZA riga ESITO nel loro quaderno memoria-squadra. PRIMA di chiudere questo giro, registra l'ESITO per ognuno con: node cervello/chiusura-loop.mjs registra <reparto> \"<contesto>\" \"<scorecard>\" \"<atteso>\" \"<reale>\". Il loop atteso→reale è la calibrazione: senza, l'azienda non impara."
    echo "[$(ts)] ⚠️  PZ-008: gate chiusura-loop FALLITO (rc=$_loop_rc) → passo un vincolo hard al motore." >&2
  fi
  # AR-053: sweep deterministico delle previsioni SCADUTE via `node cervello/calibrazione.mjs scadute` —
  # marca 'scaduta' quelle oltre 'entro' senza esito, così non marciscono aperte contando come 'prova'
  # mai misurata (la chiusura del ciclo prevedi→misura non resta delegata alla memoria dell'LLM).
  echo "[$(ts)] Calibrazione: sweep previsioni scadute (AR-053)..."
  node "$SCRIPT_DIR/calibrazione.mjs" scadute 2>&1 | tail -4 || true
  # AR-042: guardiano schema calibrazione — verifica che almeno una voce abbia il campo 'stato'
  # (lo schema CLI, non lo schema legacy a mano). Se il registro è tutto voci legacy, il motore di autonomia
  # gira su dati vuoti → passiamo un vincolo hard al motore di usare la CLI.
  echo "[$(ts)] Guardiano schema calibrazione (AR-042)..."
  _cal_file="MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"
  if [ -f "$_cal_file" ] && command -v node >/dev/null 2>&1; then
    # AR-040: prima archivia le voci legacy (senza id/stato valido) così il conteggio è pulito.
    echo "[$(ts)] Archivia voci calibrazione legacy (AR-040)..."
    node "$SCRIPT_DIR/calibrazione.mjs" archivia-legacy 2>&1 | tail -2 || true
    _cal_strutturate="$(node -e "
      const c=JSON.parse(require('fs').readFileSync('$_cal_file','utf8'));
      const arr=c.previsioni||c.registro||[];
      console.log(arr.filter(v=>v.stato).length);
    " 2>/dev/null || echo 0)"
    if [ "${_cal_strutturate:-0}" = "0" ]; then
      # AR-040/AR-042: registro vuoto → apri automaticamente UNA previsione baseline (non delegare al motore).
      echo "[$(ts)] ⚙️  AR-040: registro vuoto, autoprevedi la prima previsione baseline..."
      node "$SCRIPT_DIR/calibrazione.mjs" autoprevedi 2>&1 | tail -3 || true
      # Rileggi dopo autoprevedi
      _cal_strutturate="$(node -e "
        const c=JSON.parse(require('fs').readFileSync('$_cal_file','utf8'));
        const arr=c.previsioni||c.registro||[];
        console.log(arr.filter(v=>v.stato).length);
      " 2>/dev/null || echo 0)"
      if [ "${_cal_strutturate:-0}" = "0" ]; then
        CAL_VINCOLO="⛔ CALIBRAZIONE SPENTA (AR-042): calibrazione.json ha ancora 0 voci con campo 'stato' dopo autoprevedi. OBBLIGO: chiama 'node cervello/calibrazione.mjs prevedi --reparto=@AD --azione=... --metrica=... --atteso=... --entro=AAAA-MM-GG'. NON scrivere a mano nel JSON."
        echo "[$(ts)] ⚠️  AR-042: calibrazione.json senza voci strutturate dopo autoprevedi → vincolo hard." >&2
      else
        echo "[$(ts)] ✅ calibrazione.json: ${_cal_strutturate} voci strutturate (dopo autoprevedi)."
      fi
    else
      echo "[$(ts)] ✅ calibrazione.json: ${_cal_strutturate} voci strutturate."
    fi
    echo "[$(ts)] Guardiano calibrazione fonte+sensore (AR-061)..."
    node "$SCRIPT_DIR/calibrazione.mjs" valida 2>&1 | tail -2 || true
  fi
  # PZ-009: sonda taste-file — il log dei verdetti di Nicola è vivo o vuoto? (informa, non blocca)
  echo "[$(ts)] Sonda taste-file (verdetti di Nicola)..."
  node "$SCRIPT_DIR/taste-file.mjs" --sonda 2>&1 | tail -2 || true
  # AR-030: freschezza CHECKLIST-NICOLA.md — se è stantia (>2 giorni), il motore riceve un VINCOLO.
  echo "[$(ts)] Freschezza checklist Nicola (AR-030)..."
  _checklist_out="$(node "$SCRIPT_DIR/freschezza-checklist.mjs" 2>&1)"; _checklist_rc=$?
  printf '%s\n' "$_checklist_out" | tail -3
  if [ "$_checklist_rc" -ne 0 ]; then
    CHECKLIST_VINCOLO="$(printf '%s\n' "$_checklist_out" | head -1)"
    echo "[$(ts)] ⚠️  AR-030: checklist stantia → vincolo hard al motore." >&2
  fi
  # PZ-012 (era AR-077, mai cablato): sentinella BUDGET per reparto — se un reparto sfora il suo
  # budget (OKR) accoda lo STOP 🔴; se non c'è spesa collegata lo dice onestamente (sensore non attivo).
  echo "[$(ts)] Sentinella budget per reparto (AR-077)..."
  node "$SCRIPT_DIR/sentinella-budget.mjs" 2>&1 | tail -4 || true
  # PZ-013: SEMAFORO DINAMICO — i reparti con autonomia 'alta' GUADAGNATA (Wilson ≥0.7 su ≥8 esiti
  # reali) generano una PROPOSTA 🟡 di promozione giallo→verde in AZIONI-IN-ATTESA. Mai auto-applicata:
  # la firma resta a Nicola. È l'autonomia a punti che si espande sulle prove, non a simpatia.
  echo "[$(ts)] Semaforo dinamico: proposte di promozione da calibrazione (PZ-013)..."
  node "$SCRIPT_DIR/calibrazione.mjs" promozioni --accoda 2>&1 | tail -4 || true
  # PZ-010: sweep esperimenti — chiude a scadenza gli esperimenti aperti di auto-miglioramento.json
  # (AR-054: nessun esperimento resta aperto all'infinito; la misura non è delegata alla memoria dell'LLM).
  echo "[$(ts)] Sweep esperimenti in scadenza (AR-054)..."
  node "$SCRIPT_DIR/esperimenti-check.mjs" 2>&1 | tail -4 || true
  # AR-102: GATE COERENZA-FATTI — fonte unica della verità + propagazione a cascata. Ogni fatto-chiave
  # vive in registro-fatti.json; quando cambia, il valore VECCHIO entra in "caccia" e questo gate
  # FALLISCE finché una copia vecchia resta in un file VIVO (coda, STATO, piani, intenzioni, consegne).
  # Stesso pattern di allocazione-check/chiusura-loop: rc≠0 → vincolo HARD al motore, mai log ingoiato.
  echo "[$(ts)] Gate coerenza-fatti (fonte unica della verità, AR-102)..."
  _fatti_out="$(node "$SCRIPT_DIR/coerenza-fatti.mjs" 2>&1)"; _fatti_rc=$?
  printf '%s\n' "$_fatti_out" | tail -8
  if [ "$_fatti_rc" -ne 0 ]; then
    FATTI_VINCOLO="⛔ MEMORIA INCOERENTE (coerenza-fatti.mjs rc=$_fatti_rc): un fatto del registro (MyCity-Vault/90-Memoria-AI/registro-fatti.json) è cambiato ma copie del valore VECCHIO restano in file vivi — il Pannello le sta mostrando a Nicola come se fossero vere. PRIMA di chiudere questo giro: apri MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-fatti.json, riscrivi OGNI file elencato col valore nuovo, e riesegui \`node cervello/coerenza-fatti.mjs\` finché passa (exit 0). Le cacce bonificate (0 copie) chiudile con \`chiudi-caccia\`. La storia (DECISIONI, Briefing, quaderni) NON si riscrive: è già esente."
    echo "[$(ts)] ⚠️  AR-102: coerenza-fatti FALLITO (rc=$_fatti_rc) → passo un vincolo hard al motore." >&2
  fi
  echo "[$(ts)] Gate coerenza-rischi (registro canonico 05-Soldi-Rischi)..."
  node "$SCRIPT_DIR/coerenza-rischi.mjs" 2>&1 | tail -4 || true
  # AR-023: RICONCILIA IL CANTIERE — chiude da solo i difetti il cui fix è GIÀ nel codice (prova
  # verifica:{file,pattern}). Gira SEMPRE (prima del delta-gate) così la chiusura è deterministica e
  # NON dipende dal motore AI: il sync di fine giro la pubblica su main → il Pannello (che legge
  # quel ramo unico) non mostra più "in-corso" un difetto già risolto. Sola lettura del codice + bookkeeping.
  echo "[$(ts)] Auto-fix: riconcilia cantiere (solo verifica — chiusura manuale o via PR)..."
  node "$SCRIPT_DIR/auto-fix.mjs" verifica 2>&1 | tail -6 || true
  echo "[$(ts)] Sincronizza proposte auto-riscrittura → cantiere..."
  node "$SCRIPT_DIR/sincronizza-proposte.mjs" 2>&1 | tail -3 || true
  echo "[$(ts)] Allinea scan radiografia → cantiere (findings + voto live)..."
  node "$SCRIPT_DIR/allinea-scan-cantiere.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] Meta-guardiano freschezza-segnali (guardiani del preambolo hanno battuto?)..."
  node "$SCRIPT_DIR/freschezza-segnali.mjs" 2>&1 | tail -4 || true

  # === CAPACITÀ VIVE + GUARDIANI ORFANI ORA CABLATI NEL BATTITO (sola lettura, informativi) ===
  # Resi vivi su richiesta di Nicola (6/7): girano a ogni giro e lasciano il loro esito nel log/Cabina.
  # NON sono gate (|| true): non bloccano il giro — trasformarli in gate hard è un passo successivo (🟡).
  # Guardiani read-only che erano ORFANI dal battito (audit 6/7):
  echo "[$(ts)] ⭐ North Star (ordini/negozi/margine — era orfana dal battito)..."
  node "$SCRIPT_DIR/north-star-check.mjs" 2>&1 | tail -6 || true
  echo "[$(ts)] Guardiano owner-keyword (anti-doppione AR-008/AR-027)..."
  node "$SCRIPT_DIR/keyword-owner-check.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] Validatore contratti JSON auto-coscienza (AR-043)..."
  node "$SCRIPT_DIR/valida-contratti.mjs" 2>&1 | tail -4 || true
  # Le 7 capacità costruite (visione 53) — sola lettura sui dati reali della macchina:
  echo "[$(ts)] ⏱️  #38 Guardiano del Tuo Tempo (carico firme)..."
  node "$SCRIPT_DIR/guardiano-tempo.mjs" 2>&1 | tail -3 || true
  echo "[$(ts)] 🪙 #30 Metabolismo (costo AI per organo)..."
  node "$SCRIPT_DIR/metabolismo.mjs" 2>&1 | tail -3 || true
  echo "[$(ts)] 💶 #13 Bilancio Vivo (margine per ordine)..."
  node "$SCRIPT_DIR/bilancio-vivo.mjs" 2>&1 | tail -3 || true
  echo "[$(ts)] 🦠 #12 Sistema Immunitario (red team sicurezza)..."
  node "$SCRIPT_DIR/sistema-immunitario.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] ⚡ #23 Midollo Spinale (riflessi proposti)..."
  node "$SCRIPT_DIR/midollo-spinale.mjs" 2>&1 | tail -3 || true
  echo "[$(ts)] 🛌 #37 Letargo (livello di degradazione)..."
  node "$SCRIPT_DIR/letargo.mjs" 2>&1 | tail -3 || true
  echo "[$(ts)] ⏪ #4 Macchina del Tempo (replay della giornata)..."
  node "$SCRIPT_DIR/macchina-del-tempo.mjs" 2>&1 | tail -2 || true
  # Il tracker che veglia i cancelli di sblocco delle 46 capacità ancora chiuse:
  echo "[$(ts)] 🔓 Sblocco capacità (cancelli di realtà delle 46 chiuse)..."
  node "$SCRIPT_DIR/sblocco-capacita.mjs" 2>&1 | tail -5 || true
  echo "[$(ts)] 🧬 Cruscotto 53 capacità (7 vive + 46 scaffold)..."
  node "$SCRIPT_DIR/capacita.mjs" 2>&1 | tail -3 || true
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

# AR-087: GATE-BUDGET — circuit-breaker deterministico sul costo (token). Prima di accendere il motore
# premium leggo lo stato di `costo-ai.mjs --json`: se i token di OGGI hanno superato la soglia giornaliera,
# DEGRADO a passaggio minimo (niente motore premium) finché il giorno non si resetta. I 🔴/controlli
# restano attivi: sotto budget si taglia il VOLUME, non la sicurezza.
# GATE-BUDGET non bypassa GIRO_FORCE: il delta-gate sì (throttle), la sicurezza-quota no.
if [ "${RUN_AI:-1}" = 1 ] && [ "${DELTA_GATE_FORCE:-0}" != 1 ] && command -v node >/dev/null 2>&1; then
  _budget_json="$(node "$SCRIPT_DIR/costo-ai.mjs" --json 2>/dev/null || true)"
  if command -v jq >/dev/null 2>&1 && [ -n "$_budget_json" ]; then
    _tok_oggi="$(printf '%s' "$_budget_json" | jq -r '.oggi.token_totali // 0' 2>/dev/null || echo 0)"
    _tok_soglia="$(printf '%s' "$_budget_json" | jq -r '.soglia_giornaliera_token // 0' 2>/dev/null || echo 0)"
    if [ "${_tok_soglia:-0}" -gt 0 ] 2>/dev/null && [ "${_tok_oggi:-0}" -gt "${_tok_soglia:-0}" ] 2>/dev/null; then
      RUN_AI=0
      echo "[$(ts)] ⛔ GATE-BUDGET (AR-087): token oggi ${_tok_oggi} > soglia ${_tok_soglia} → motore premium FERMATO (passaggio minimo). I 🔴/controlli restano attivi."
    fi
  fi
fi

PROMPT="Sei l'AD digitale di MyCity (segui CLAUDE.md e gli agenti in .claude/agents/).

## Compito
Leggi ed esegui **per intero** il file \`cervello/giro.md\` in questo repository (aprilo dal disco con Read, NON saltare passi).
Scrivi sul disco tutti i file richiesti (vault, briefing, auto-coscienza, ecc.). Rispetta 🟢🟡🔴.
La memoria va sul ramo main — ramo unico, codice+memoria insieme (il push git lo fa giro.sh dopo di te — tu scrivi i file)."
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
if [ -n "${REGISTRO_SCELTE_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo registro scelte ragionate (HARD — dal guardiano registro-scelte-check prima di te)
$REGISTRO_SCELTE_VINCOLO"
fi
if [ -n "${LOOP_VINCOLO:-}" ]; then
  # PZ-008: il gate chiusura-loop arriva al motore come regola hard (registra gli ESITI, non rimandare).
  PROMPT="$PROMPT

## Vincolo chiusura-loop (HARD — dal gate chiusura-loop prima di te)
$LOOP_VINCOLO"
fi
if [ -n "${FATTI_VINCOLO:-}" ]; then
  # AR-102: il gate coerenza-fatti arriva al motore come regola hard (propaga PRIMA di chiudere il giro).
  PROMPT="$PROMPT

## Vincolo coerenza-fatti (HARD — dal gate coerenza-fatti prima di te)
$FATTI_VINCOLO"
fi
if [ -n "${CHECKLIST_VINCOLO:-}" ]; then
  # AR-030: la checklist di Nicola è stantia → il motore deve rigenerarla in questo giro.
  PROMPT="$PROMPT

## Vincolo checklist Nicola (HARD — AR-030: stantia oltre 2 giorni)
$CHECKLIST_VINCOLO"
fi
if [ -n "${CAL_VINCOLO:-}" ]; then
  # AR-042: il registro calibrazione ha solo voci legacy → il motore deve usare la CLI prevedi.
  PROMPT="$PROMPT

## Vincolo calibrazione (HARD — AR-042: 0 voci strutturate nel registro)
$CAL_VINCOLO"
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
# AR-058: budget-tempo UNICO del giro. I 3 tentativi interni (con 2 pause da 30s) devono stare DENTRO il
# timeout esterno (worker 2700s / systemd 3600s), altrimenti l'invocatore uccide giro.sh prima che i retry
# si completino (retry morti). Derivo il timeout per-tentativo dal budget esterno di riferimento (2700s):
# 3×GIRO_AI_TIMEOUT + 2×30s ≤ GIRO_BUDGET_SEC → GIRO_AI_TIMEOUT ≤ 880s. Default prudente 800s (3×800+60=2460s).
GIRO_BUDGET_SEC="${GIRO_BUDGET_SEC:-2700}"   # budget esterno di riferimento (deve combaciare con worker/systemd)
GIRO_AI_TIMEOUT="${GIRO_AI_TIMEOUT:-800}"    # per tentativo; 3 tentativi + pause stanno dentro il budget esterno
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

# AR-083 / AR-043: stima token condivisa (motore-ai.sh). Resta STIMA → --stima.
if [ -z "${GIRO_TOKEN:-}" ]; then
  GIRO_TOKEN="$(ai_stima_token "$GIRO_START" "$PROMPT" "${_ai_out:-}")"
  GIRO_TOKEN_STIMA=1
  export GIRO_TOKEN GIRO_TOKEN_STIMA
fi

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

# --- Sync della memoria sul RAMO UNICO 'main': commit + push (rebase, NON force) ---
# Sotto lo STESSO lock del worker: i due non si pestano. Push NON-force con rebase, così le scritture del
# worker (già pushate) NON vengono mai cancellate dal giro (col force-push le perdeva). Ramo unico:
# codice e memoria vivono entrambi su 'main' — è il ramo che il Pannello legge via OBSIDIAN_BRANCH=main.
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

# FIX onestà-agganciata (AR-075): l'onesta-check era strumentato ma MAI chiamato nel percorso di
# pubblicazione della memoria. Prima del commit lo eseguiamo su STATO.md + l'ultimo briefing (gli artefatti
# che la Cabina mostra a Nicola), riusando il pattern di scan-segreti. Default: WARN FORTE che marca il
# giro NON-onesto senza bloccare — la memoria interna non è customer-facing e l'onesta-check può avere falsi
# positivi sui numeri baseline. Con ONESTA_BLOCCA=1 blocca il push esattamente come un segreto.
ONESTA_BLOCK=0
if command -v node >/dev/null 2>&1; then
  _onesta_files=()
  [ -f "MyCity-Vault/90-Memoria-AI/STATO.md" ] && _onesta_files+=("MyCity-Vault/90-Memoria-AI/STATO.md")
  _ultimo_brief="$(ls -t MyCity-Vault/90-Memoria-AI/Briefing/*.md 2>/dev/null | head -1)"
  [ -n "$_ultimo_brief" ] && _onesta_files+=("$_ultimo_brief")
  if [ "${#_onesta_files[@]}" -gt 0 ] && ! node "$SCRIPT_DIR/onesta-check.mjs" "${_onesta_files[@]}" >/dev/null 2>&1; then
    echo "[$(ts)] ⚠️  ONESTA-CHECK: violazioni onestà (segnaposto non risolti / numeri senza fonte) in STATO.md o ultimo briefing:" >&2
    node "$SCRIPT_DIR/onesta-check.mjs" "${_onesta_files[@]}" 2>&1 | tail -12 >&2 || true
    if [ "${ONESTA_BLOCCA:-0}" = 1 ]; then
      ONESTA_BLOCK=1
      echo "[$(ts)] ⛔ ONESTA_BLOCCA=1: sync memoria BLOCCATA per violazioni onestà (come i segreti)." >&2
    else
      echo "[$(ts)] ⚠️  Giro marcato NON-ONESTO (WARN forte, push non bloccato). Imposta ONESTA_BLOCCA=1 per bloccarlo." >&2
    fi
  fi
fi

# AR-104: GATE COERENZA-FATTI + SANITÀ VAULT come CANCELLO BLOCCANTE del push (non più solo vincolo soft
# al motore). Gira ORA, DOPO che l'AI ha scritto: è lo stato REALE che sta per finire su main e che il
# Pannello mostrerà a Nicola. Se la memoria è incoerente (una copia vecchia di un fatto è rimasta) o il
# vault è "sporco" (marcatori di conflitto, file a 0 byte, frontmatter/JSON rotti) → NON pubblichiamo:
# meglio memoria vecchia sul Pannello che memoria che MENTE. Stesso stile di scan-segreti/onesta-check:
# rc catturato esplicitamente, MAI `|| true` che ingoia il fallimento del gate (AR-081/AR-010).
# FAIL-CLOSED: se un check non riesce a girare (node assente / crash), trattiamo come "non pubblicare".
MEMORIA_INCOERENTE=0
_gate_motivi=""
if command -v node >/dev/null 2>&1; then
  # (1) coerenza-fatti RIeseguita sullo stato scritto dall'AI (la 1ª esecuzione, riga ~218, era pre-scrittura).
  _cf_out="$(node "$SCRIPT_DIR/coerenza-fatti.mjs" 2>&1)"; _cf_rc=$?
  if [ "$_cf_rc" -ne 0 ]; then
    MEMORIA_INCOERENTE=1
    _gate_motivi="${_gate_motivi}coerenza-fatti rc=$_cf_rc (una copia vecchia di un fatto è rimasta in un file vivo); "
    echo "[$(ts)] ⛔ COERENZA-FATTI (pre-push): memoria incoerente (rc=$_cf_rc) — sync BLOCCATA." >&2
    printf '%s\n' "$_cf_out" | tail -8 >&2
  fi
  # (2) sanità del vault (l'INTERA 90-Memoria-AI: robusto e semplice — copre anche i file non ancora staged).
  _vs_out="$(node "$SCRIPT_DIR/vault-sanita.mjs" "MyCity-Vault/90-Memoria-AI" 2>&1)"; _vs_rc=$?
  if [ "$_vs_rc" -ne 0 ]; then
    MEMORIA_INCOERENTE=1
    _gate_motivi="${_gate_motivi}vault-sanità rc=$_vs_rc (vault sporco: conflitti/0-byte/frontmatter o JSON rotti); "
    echo "[$(ts)] ⛔ VAULT-SANITÀ (pre-push): vault sporco (rc=$_vs_rc) — sync BLOCCATA." >&2
    printf '%s\n' "$_vs_out" | tail -12 >&2
  fi
else
  # FAIL-CLOSED: senza node non posso verificare né coerenza né sanità → non pubblicare.
  MEMORIA_INCOERENTE=1
  _gate_motivi="${_gate_motivi}node non disponibile: impossibile verificare coerenza/sanità (fail-closed); "
  echo "[$(ts)] ⛔ GATE MEMORIA (pre-push): node non disponibile — sync BLOCCATA (fail-closed)." >&2
fi
# Avviso a Nicola SUBITO (Telegram, stesso canale di notifica-approvazioni; senza chiavi = dry-run).
if [ "$MEMORIA_INCOERENTE" = 1 ] && command -v node >/dev/null 2>&1; then
  node "$SCRIPT_DIR/avviso-telegram.mjs" \
    "⚠️ MyCity: memoria incoerente/vault sporco — giro NON pubblicato ($(ts)). Dettaglio: ${_gate_motivi}La memoria resta solo sul server, il Pannello NON mostra dati non verificati." \
    2>&1 | tail -2 || true
fi

exec 9>"$LOCK"
if [ "$SEGRETO_TROVATO" = 1 ] || [ "$ONESTA_BLOCK" = 1 ] || [ "$MEMORIA_INCOERENTE" = 1 ]; then
  GIRO_PUSH_OK=0
  echo "[$(ts)] Giro NON pubblicato: memoria incoerente / vault sporco — risolvi quanto segnalato (coerenza-fatti / vault-sanità / scan-segreti / onesta-check), poi rilancia." >&2
elif flock -w 600 9; then
  # Guardia auto-coscienza: l'auto-analisi DEVE aver persistito il verdetto qui (la Cabina lo legge da questo file).
  [ -f "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-analisi.json" ] \
    || echo "[$(ts)] ⚠️  AUTO-ANALISI NON PERSISTITA: manca auto-coscienza/auto-analisi.json — la Cabina resterà vuota (vedi passo 11 del giro)." >&2
  # AR-044: guardiano-integrità — stage SOLO le cartelle di memoria, mai il codice del cervello.
  git add -A "${MEM_DIRS[@]}" 2>/dev/null || true
  # Sicurezza aggiuntiva: se nonostante il perimetro un file di codice è staged, lo tolgo e segnalo.
  _codice_staged="$(git diff --cached --name-only 2>/dev/null | grep -vE '^(MyCity-Vault|consegne|creativi|memoria-squadra)/' | head -5 || true)"
  if [ -n "$_codice_staged" ]; then
    echo "[$(ts)] ⛔ GUARDIANO-INTEGRITÀ (AR-044): file di CODICE nello stage — rimossi per sicurezza:" >&2
    echo "$_codice_staged" >&2
    git reset HEAD -- . 2>/dev/null || true
    git add -A "${MEM_DIRS[@]}" 2>/dev/null || true
  fi
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
    # AR-043: --stima se GIRO_TOKEN_STIMA=1 (stima durata×throughput, non misura reale dalla CLI).
    _stima_flag="${GIRO_TOKEN_STIMA:+--stima}"
    node "$SCRIPT_DIR/costo-ai.mjs" --tipo=giro --durata-sec="$_giro_durata" ${GIRO_TOKEN:+--token="$GIRO_TOKEN"} --modello="$(ai_engine)" ${_stima_flag:-} >/dev/null 2>&1 || true
  fi
fi

# Segnale finale AR-014: se il motore ha girato ma ha saltato i passi 11-12, lascialo scritto nel log
# (la memoria già prodotta viene comunque pubblicata: non si perde nulla, ma la qualità del giro è segnata).
if [ "${GIRO_STEPS_OK:-1}" = 0 ]; then
  echo "[$(ts)] ⚠️  QUALITÀ GIRO: auto-analisi/apprendimento non aggiornati in questo giro (passi 11-12 saltati)." >&2
fi

# 📲 NOTIFICA APPROVAZIONI (richiesta Nicola 5/7): le azioni 🟡/🔴 nuove in coda gli arrivano su
# Telegram (dedup: ogni azione squilla una volta). 🟢 avviso a Nicola stesso; senza chiavi = dry-run.
# Va DOPO il sync: la coda notificata è quella definitiva del giro. Non blocca mai (|| true).
if command -v node >/dev/null 2>&1; then
  echo "[$(ts)] Notifica approvazioni (Telegram → Nicola)..."
  node "$SCRIPT_DIR/notifica-approvazioni.mjs" 2>&1 | tail -3 || true
fi

# PZ-007 (piano "chiudi i loop"): BATTITO ESTERNO. Ping a un watchdog FUORI dalla macchina
# (healthchecks.io / UptimeRobot heartbeat): se il VPS o il timer muoiono, il ping smette di arrivare
# e il servizio esterno avvisa Nicola — l'ultimo anello che il controllore interno non può coprire
# (se muore il VPS muore anche verifica-automazione). Senza HEARTBEAT_PING_URL non fa nulla.
if [ -n "${HEARTBEAT_PING_URL:-}" ]; then
  if curl -fsS -m 10 --retry 2 "$HEARTBEAT_PING_URL" >/dev/null 2>&1; then
    echo "[$(ts)] Battito esterno inviato (watchdog fuori-macchina)."
  else
    echo "[$(ts)] WARN: ping del battito esterno fallito (HEARTBEAT_PING_URL irraggiungibile)." >&2
  fi
fi

# Exit code per worker.sh:
#   0 = ok (o memoria salvata nonostante AI parziale)
#   1 = AI fallita e nessuna memoria nuova pubblicata
#   2 = memoria scritta ma push fallito, OPPURE gate memoria (AR-104) ha bloccato la pubblicazione
# AR-104: se il gate coerenza/sanità ha bloccato il push, NON deve essere un successo silenzioso —
# anche se GIRO_HAD_CHANGES=0 (non siamo arrivati al commit). exit 2 = "memoria NON pubblicata".
if [ "${MEMORIA_INCOERENTE:-0}" = 1 ]; then
  echo "[$(ts)] ⛔ GATE MEMORIA (AR-104): pubblicazione bloccata — exit 2 (non è un successo)." >&2
  exit 2
fi
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
