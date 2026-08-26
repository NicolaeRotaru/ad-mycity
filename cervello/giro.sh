#!/usr/bin/env bash
# giro.sh — GIRO DI PERLUSTRAZIONE dell'AD MyCity (motore AI: Cursor 'agent' o Claude 'claude'), per VPS Linux.
# Equivalente Linux di giro.ps1. Gira nella cartella del repo, cosi' il motore prende
# automaticamente CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.
# AR-060: il battito è ATTIVO. Il timer automatico (mycity-giro.timer) fa girare il giro ogni ~2h;
# la cadenza reale è nel file .timer (unica fonte di verità). Per un giro a mano usa giro-ora.sh.
set -uo pipefail   # niente -e: il giro deve arrivare al push anche se un passo intermedio fallisce

# 🖊️ CONFINE DELLA FIRMA — AR-119/AR-380. Il giro scrive due segnali su `impostazioni` dopo il push
# della memoria. Le chiavi si dichiarano qui perché `cervello/firma-check.mjs` possa verificare che
# nessuna sia una firma: la chiave di servizio potrebbe scriverla, la disciplina no. Prima del lotto
# 33 il guardiano leggeva solo i `.mjs`, quindi questa dichiarazione non gliela chiedeva nessuno.
# CHIAVI_SCRITTE = ["memoria-ad:ultimo_push", "cuore:ultimo_giro"]

# Fuso di Piacenza: gli orari scritti in memoria (data:, SALA, AZIONI, commit) devono essere
# ora-di-parete italiana. Senza questo, su un VPS in UTC (default Hetzner) finiscono indietro di 1-2h.
export TZ="${TZ:-Europe/Rome}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

# Hook git versionati (scan-segreti al commit) — idempotente, attiva core.hooksPath su ogni clone.
# 🔒 AR-644 — l'esito NON si butta più via. `>/dev/null 2>&1 || true` rendeva l'aggancio riuscito e
# l'aggancio fallito la stessa identica cosa da fuori: il giro proseguiva e committava senza cancelli,
# in silenzio. L'istante della chiamata era giusto (all'avvio, prima di ogni commit); a mancare era
# la lettura del risultato. Non blocca il giro — il cancello del push resta — ma lo DICE.
if [ -f "$SCRIPT_DIR/installa-hooks.sh" ]; then
  _hook_out="$(bash "$SCRIPT_DIR/installa-hooks.sh" 2>&1)" || {
    echo "⚠️  AR-644: i cancelli del commit NON si sono agganciati — questo giro committa senza scan dei segreti." >&2
    printf '%s\n' "$_hook_out" | tail -3 >&2
  }
fi

# Carica i segreti del server (se presenti). Su systemd arrivano anche da EnvironmentFile.
ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

# Motore AI condiviso (Claude 'claude' principale, Cursor 'agent' su richiesta). Vedi cervello/motore-ai.sh.
. "$SCRIPT_DIR/motore-ai.sh"

# 🔑 AR-278 / AR-428 — I SEGRETI ESCONO DAGLI ARGOMENTI DEI COMANDI.
# Il token di GitHub viaggiava dentro l'indirizzo del repo e la chiave di servizio dentro le
# intestazioni di curl: due argomenti, e su Linux gli argomenti di un processo li legge chiunque
# giri sulla macchina. Da qui in avanti il token lo dà l'ambiente al programma askpass di git, e le
# intestazioni arrivano a curl da un file di configurazione leggibile solo da noi.
. "$SCRIPT_DIR/c4-segreti.sh"
c4_git_prepara
c4_curl_prepara || true   # senza chiave le chiamate autenticate non partono: lo dice chi le usa
trap 'c4_curl_chiudi' EXIT

# 🔌 Parity skill: specchio .cursor/skills → .claude/skills prima di lanciare la CLI (best-effort).
node "$SCRIPT_DIR/sync-worker-plugins.mjs" --specchia >/dev/null 2>&1 || true

ts() { date '+%Y-%m-%d %H:%M'; }

# AR-204 — il cronometro del PROCESSO, non quello del motore AI. `GIRO_START` (più sotto) parte dopo
# i guardiani e misura solo la parte AI: così un giro saltato dal delta-gate risultava costare 1
# secondo, quando prima aveva già fatto girare una cinquantina di processi node. Un numero che dice
# «costo zero» su un lavoro che è costato davvero è peggio di nessun numero: ci si decide sopra.
GIRO_START_TOT="$(date +%s)"

# ═══════════════════════════════════════════════════════════════════════════════════════════════
# 🎚️ AR-324 — LE SOGLIE CON CUI GIRA QUESTO GIRO SI SCRIVONO, ALTRIMENTI IL VERDE È AMBIGUO
#
# Le soglie dei cancelli si allentano o si spengono da `cervello/vps/.env`, e il registro del giro
# non le scriveva da nessuna parte: a posteriori nessuno poteva ricostruire con quali soglie fosse
# girato. Un verde diventa così ambiguo — può voler dire «ho verificato e va bene» oppure «mi hanno
# alzato la soglia sopra il caso peggiore» — e un controllo che non si può ricostruire non è un
# controllo, è una dichiarazione. Su un percorso che porta a pubblicare la memoria che Nicola legge,
# è una lacuna di tracciabilità.
# La riga esce SEMPRE nel log; quando una manopola che allenta un cancello non è quella di fabbrica,
# il motore riceve anche un vincolo che gli chiede di dichiararla in coda come scelta 🟡 con motivo
# e scadenza — così una soglia allentata scade invece di restare per sempre.
SOGLIE_VINCOLO=""
if command -v node >/dev/null 2>&1; then
  _forza_disco=()
  [ -f "$SCRIPT_DIR/vps/.giro-force" ] && _forza_disco+=("cervello/vps/.giro-force (giro forzato a mano)")
  _soglie_out="$(node "$SCRIPT_DIR/c4-cancelli.mjs" soglie --vincolo "${_forza_disco[@]}" 2>/dev/null)"; _soglie_rc=$?
  printf '[%s] %s\n' "$(ts)" "$(printf '%s' "$_soglie_out" | head -1)"
  if [ "$_soglie_rc" = 7 ]; then
    SOGLIE_VINCOLO="$_soglie_out"
    echo "[$(ts)] ⚠️  AR-324: questo giro NON gira con le soglie di fabbrica → vincolo al motore (dichiarale in coda)." >&2
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# AR-307 — mostra l'ESITO di un guardiano senza perdere la riga che conta.
# Prima si usava `| tail -N`: i guardiani stampano il verdetto in TESTA e node mette lo stack in
# MEZZO, così nel log del giro restava la coda decorativa e l'errore vero spariva. Chi leggeva il log
# vedeva un guardiano «passato» che in realtà era esploso alla prima riga.
# Questo filtro tiene: la PRIMA riga (il verdetto), fino a 2 righe di errore ovunque siano, e la coda.
# Uso: <comando> 2>&1 | esito_righe 4
esito_righe() {
  local n="${1:-4}"
  awk -v n="$n" '
    { L[NR] = $0 }
    END {
      if (NR == 0) exit
      if (NR <= n) { for (i = 1; i <= NR; i++) print L[i]; exit }
      print L[1]
      err = 0
      for (i = 2; i <= NR - n + 1 && err < 2; i++) {
        if (L[i] ~ /(Error|ERRORE|Errore|Traceback|⛔|❌)/) { print L[i]; err++ }
      }
      print "   …"
      for (i = NR - n + 2; i <= NR; i++) print L[i]
    }'
}

# AR-293/AR-317: le mani condivise delle tre cadenze (lucchetto d'esecuzione, marcatore di scrittura,
# motore col timeout derivato, registro degli esiti). Vedi cervello/lib-cadenza.sh.
. "$SCRIPT_DIR/lib-cadenza.sh"

# AR-293 — «niente impedisce a due giri di girare insieme: il lucchetto protegge solo il pezzo che
# parla con GitHub». Quello esistente (fd 9) è nato per il conflitto git, perché il primo danno visto
# era un push rifiutato; il conflitto sui FILE non lo copriva nessuno. Questo è per l'esecuzione, non
# bloccante: il secondo giro esce subito invece di accodarsi.
cadenza_lock giro || exit 0

# Motore AI installato e utilizzabile?
ai_check || { echo "[$(ts)] Motore AI non disponibile. Vedi cervello/vps/setup.sh." >&2; exit 1; }

# Il worker gira come «mycity»: se .git è di root, fetch/push falliscono (Permission denied).
if [ -f "$REPO/.git/config" ] && ! test -w "$REPO/.git/config" 2>/dev/null; then
  echo "[$(ts)] ERRORE: .git/config non scrivibile da $(id -un) — git bloccato." >&2
  echo "[$(ts)]   Fix (come root): sudo chown -R mycity:mycity $REPO && sudo systemctl restart mycity-worker" >&2
  exit 1
fi

# 🛑 Kill-switch: se il Pannello ha messo l'AD in PAUSA (impostazioni.pausa = on), non girare.
# AR-100 il fail-closed era già giusto QUI; AR-390 lo porta nella funzione condivisa
# (cervello/kill-switch.sh) perché le altre tre copie non ce l'avevano. Stesso comportamento di
# prima, un posto solo: quando la difesa vive in quattro copie, tre restano indietro.
. "$SCRIPT_DIR/kill-switch.sh"
pausa_consenti_partenza "giro" || exit 0

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
  url="$(c4_git_url)"   # AR-278: nessun token nell'indirizzo — lo dà l'ambiente ad askpass
  (
    cadenza_sync_attendi giro 600 || exit 0   # Fix A: timeout sul lock — niente hang se un altro processo resta appeso; e se scade, si dice (2026-08-16)
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
      if _fetch_err="$(git "${C4_GIT_OPZ[@]}" fetch "$url" "$branch" 2>&1)"; then _fetch_ok=1; break; fi
      sleep 2
    done
    if [ "$_fetch_ok" = 1 ]; then
      # AR-628 — il ramo «HEAD staccato» era rimasto DISTRUTTIVO in tutte e tre le copie (qui, in
      # ritmo.sh e in monitora.sh): `checkout -B "$branch" FETCH_HEAD` spostava il ramo sul remoto
      # ORFANANDO il commit di recupero creato poche righe sopra — nessun ref lo puntava più, e il
      # log stampava «HEAD portato su main» come se fosse tutto a posto. La cura di AR-028 copriva
      # solo il ramo in cui HEAD era già sul ramo. Adesso il caso staccato non ha più un percorso
      # suo: si riaggancia a QUESTO HEAD (che porta il commit di recupero) e poi passa dalla stessa
      # scala rebase → merge di tutti gli altri.
      _cur="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"
      if [ "$_cur" != "$branch" ]; then
        git checkout -B "$branch" 2>/dev/null || true
        echo "[$(ts)] Ramo unico: HEAD era staccato → riagganciato a ${branch} tenendo i commit locali (AR-628)."
      fi
      # Rebase dei commit locali sopra l'ultimo remoto. Se il rebase entra in conflitto (snapshot
      # toccato da due parti) abortisci e prova un merge non distruttivo; se anche il merge confligge
      # abortisci e resta sul locale — il push finale (rebase-retry) riproverà, niente si perde.
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
TEST_VINCOLO=""       # 25/7: test del cervello rossi o ineseguibili (prima non li lanciava nessuno)
DEBITO_VINCOLO=""     # 25/7: previsioni fatte e mai confrontate col reale (voce 2)
FATTI_VINCOLO=""      # AR-102: vincolo del gate coerenza-fatti (copie vecchie di un fatto in file vivi)
CHECKLIST_VINCOLO=""  # AR-030: vincolo freschezza checklist Nicola (stantia se > 2 giorni)
RISCHI_VINCOLO=""     # AR-431: vincolo freschezza mappa dei rischi (guardiano che nessuno eseguiva)
CADENZE_VINCOLO=""    # AR-164: una cadenza (giro/ritmo/monitora) ha smesso di uscire
CI_VINCOLO=""         # 4/8: una PR aperta non passa i controlli, e il rosso è suo (non ereditato da main)
OKR_VINCOLO=""        # AR-115: vincolo freschezza OKR-Squadra (target scaduti o doc stantio)
FRESCHEZZA_VINCOLO="" # 10/8: analisi Intelligence scadute mostrate in Cabina come se fossero fresche
# AR-322/308/309 — il contratto dei guardiani (0=passato · 1=bocciato · 2=cieco) e l'accumulo dei
# vincoli vivono in giro-esito.sh, come funzioni pure che un test può eseguire. Va caricato QUI, prima
# dei guardiani: finora si caricava a metà file, dopo che i vincoli erano già stati costruiti a mano.
# shellcheck source=cervello/giro-esito.sh
. "$SCRIPT_DIR/giro-esito.sh"
CAL_VINCOLO=""        # AR-042: vincolo calibrazione senza voci strutturate (schema legacy)
AGENTI_VINCOLO=""     # AR-007/008: guardiano registro agenti (promosso a gate hard da || true)
ESP_VINCOLO=""        # AR-041/106: guardiano esperimenti (promosso a gate hard da || true)
NORTH_STAR_VINCOLO="" # AR-113: north-star → vincolo HARD di allocazione (non blocca il giro)
KEYWORD_VINCOLO=""    # AR-009/027: guardiano owner-keyword (promosso a gate hard da || true)
APPRENDIMENTO_VINCOLO="" # Lever 1: guardiano apprendimento (archivio malato / errori ricorrenti non cristallizzati)
CORREZIONE_NICOLA_VINCOLO="" # AR-apprendimento (12/8): correzioni di Nicola senza gate proprio (numero, non promessa)
CHIUSURA_VINCOLO=""   # AR-566: si aprono più difetti di quanti se ne chiudono → questo giro chiude, non cerca
VERIFICA_VINCOLO=""      # Lever 2: verificatore avversariale (auto-analisi vuota) + validatore contratti come gate
PROVE_VINCOLO=""         # AR-330: prove del cantiere già soddisfatte alla nascita (difetti che si chiudono da soli)
COSTO_VINCOLO=""         # AR-196: il freno sui costi non sa quanto abbiamo speso (campo assente ≠ zero speso)
FRESCHEZZA_VINCOLO=""    # AR-165: guardiani del preambolo che non hanno battuto (verde vecchio ≠ verde)
VOLANO_VINCOLO=""        # AR-165: verdetto della sonda-volano, prima buttato in una pipe
FRATELLI_VINCOLO=""      # 28/7: una malattia nota si è allargata in un punto nuovo (spazzata-fratelli)
USCITE_VINCOLO=""        # AR-272: un'uscita verso il mondo reale non dichiarata, o senza cancello
SCADENZE_VINCOLO=""      # AR-147/214: scadenza entro 72h, o countdown trascritto che non è più vero
PAUSE_VINCOLO=""         # AR-159/157: una card in pausa che nessun orologio sveglierà, o una data ricopiata
SENSORI_SPENTI_VINCOLO="" # AR-105/108: un sensore spento senza un perché dichiarato è un buco, non uno stato
PORTE_VINCOLO=""         # AR-127: un push verso main che non passa dal cancello condiviso
SERRATURA_VINCOLO=""     # AR-825: lavori entrati su main senza un verde del cancello
FIRMA_VINCOLO=""         # AR-119: uno script del cervello che può scriversi la firma di Nicola
PORTA_GIT_VINCOLO=""     # AR-339: uno script che chiede elenchi a git senza -z (nomi con l'accento riscritti)
CABLATI_VINCOLO=""       # 21/8: un percorso di UNA macchina sola rientrato nel codice (correzione Nicola 4/7)
STASH_VINCOLO=""         # 21/8: messe da parte che nessuno riprende — 7.849 sul server, e nessun sensore
DEFERRAL_VINCOLO=""      # AR-186: il roster di CLAUDE.md e le schede dei senior si rimandano cose diverse
STAMPO_VINCOLO=""        # AR-291: verdetto dello stampo senior, prima buttato in un `|| true` (AR-129/287/289)
TASSO_VINCOLO=""         # AR-178: lezioni accumulate e mai applicate (l'altra metà, sfuggita al lotto 10)
GUARDIANI_VINCOLO=""     # 29/7: un guardiano che gira senza una riga in bacheca — protezione promessa e non spiegata
LETARGO_VINCOLO=""       # AR-392: il livello di degradazione dichiarato dal letargo, prima perso dentro una pipe
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
  # AR-178: era l'altra metà del difetto, e c'era cascato pure il fix. Il lotto 10 ha promosso a
  # cancello sonda-volano ma NON tasso-lezioni, e la prova del difetto era un OR
  # (`VOLANO_VINCOLO|_tasso_rc|_sonda_rc`): ha fatto centro sulla metà riparata e ha chiuso il difetto
  # con l'altra metà ancora rotta. Trovato rileggendo la chiusura 30 secondi dopo averla applicata —
  # tasso-lezioni usciva 1, cioè stava suonando, e il suo allarme finiva comunque nel cestino.
  echo "[$(ts)] Tasso applicazione lezioni (AR-051, prima della sonda)..."
  if ! guardiano tasso-lezioni.mjs --json; then
    TASSO_VINCOLO="$(vincolo_da_rc "tasso-lezioni" "$GUARDIANO_RC" "⛔ LEZIONI NON APPLICATE (tasso-lezioni.mjs rc=$GUARDIANO_RC, AR-178/AR-051): la macchina accumula lezioni e non le usa — imparare senza applicare è collezionare. In QUESTO giro marca le lezioni che hai davvero usato: node cervello/tasso-lezioni.mjs applica <id> \"<riferimento>\". Se non ne hai usata nessuna, dillo nel briefing invece di lasciarlo implicito.")"
    echo "[$(ts)] ⚠️  AR-178: tasso-lezioni rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  echo "[$(ts)] Sonda volano (4 invarianti)..."
  # AR-165: stesso trattamento della freschezza — l'esito della sonda finiva in una pipe e poi in un
  # `|| true`. Il verdetto «volano rotto» non ha mai raggiunto il motore.
  if ! guardiano sonda-volano.mjs --json; then
    VOLANO_VINCOLO="$(vincolo_da_rc "sonda-volano" "$GUARDIANO_RC" "⛔ VOLANO ROTTO (sonda-volano.mjs rc=$GUARDIANO_RC, AR-165): l'anello impara→correggi non si chiude. Guarda il verdetto: node cervello/sonda-volano.mjs --json")"
    echo "[$(ts)] ⚠️  AR-165: sonda-volano rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  echo "[$(ts)] Sensore cassa/runway (AR-016)..."
  node "$SCRIPT_DIR/sensore-cassa.mjs" --json 2>&1 | esito_righe 4 || true
  echo "[$(ts)] Sentinella fonti web (AR-036)..."
  node "$SCRIPT_DIR/sentinella-fonti.mjs" 2>&1 | esito_righe 4 || true
  echo "[$(ts)] Agenda intelligence (fonti dovute oggi)..."
  node "$SCRIPT_DIR/intelligence-agenda.mjs" 2>&1 | esito_righe 3 || true
  # AR-617 — i 114 senior che promettono di lavorare in sola lettura adesso hanno il limite scritto
  # dove la macchina lo legge, e questo guardiano controlla che promessa e permessi non divergano.
  # Va qui e non in CI: in CI il danno è già scritto, qui arriva prima che si deleghi il lavoro.
  # AR-407 — le medicine dei lotti si scrivevano e non si somministravano: nessuno contava chi le
  # usa. Il guardiano c'era e non lo eseguiva nessuno, che è la stessa malattia un piano sopra.
  echo "[$(ts)] Adozione delle medicine (AR-407)..."
  _medicine_out="$(node "$SCRIPT_DIR/adozione-medicine.mjs" 2>&1)"; _medicine_rc=$?
  printf '%s\n' "$_medicine_out" | tail -4
  if [ "$_medicine_rc" -eq 1 ]; then
    MEDICINE_VINCOLO="⛔ UNA MEDICINA NON SOMMINISTRATA (adozione-medicine.mjs rc=$_medicine_rc, AR-407): è nato un punto scoperto nuovo, oppure una cura scritta non la usa nessuno."
    echo "[$(ts)] ⚠️  AR-407: adozione-medicine FALLITO (rc=$_medicine_rc) → vincolo al motore." >&2
  elif [ "$_medicine_rc" -ne 0 ]; then
    echo "[$(ts)] ⚪ AR-407: adozione-medicine non ha potuto misurare (rc=$_medicine_rc) — cieco, non verde." >&2
  fi
  echo "[$(ts)] Guardiano permessi dei senior (AR-617)..."
  _solalettura_out="$(node "$SCRIPT_DIR/senior-sola-lettura.mjs" 2>&1)"; _solalettura_rc=$?
  printf '%s\n' "$_solalettura_out" | tail -4
  if [ "$_solalettura_rc" -eq 1 ]; then
    SENIOR_SOLA_LETTURA_VINCOLO="⛔ UN SENIOR PROMETTE SOLA LETTURA E HA GLI STRUMENTI PER SCRIVERE (senior-sola-lettura.mjs rc=$_solalettura_rc, AR-617): allinea il mansionario prima di delegargli lavoro."
    echo "[$(ts)] ⚠️  AR-617: senior-sola-lettura FALLITO (rc=$_solalettura_rc) → vincolo hard al motore." >&2
  elif [ "$_solalettura_rc" -ne 0 ]; then
    echo "[$(ts)] ⚪ AR-617: senior-sola-lettura non ha potuto misurare (rc=$_solalettura_rc) — cieco, non verde." >&2
  fi
  echo "[$(ts)] Guardiano registro agenti (AR-007/008 — gate hard)..."
  _agenti_out="$(node "$SCRIPT_DIR/agent-registry-check.mjs" 2>&1)"; _agenti_rc=$?
  printf '%s\n' "$_agenti_out" | tail -4
  if [ "$_agenti_rc" -ne 0 ]; then
    AGENTI_VINCOLO="⛔ REGISTRO AGENTI INCONSISTENTE (agent-registry-check.mjs rc=$_agenti_rc, AR-007/008): un agente è orfano o il conteggio dei 120 file .claude/agents/ non torna. Correggi prima di delegare nuovo lavoro."
    echo "[$(ts)] ⚠️  AR-007/008: agent-registry-check FALLITO (rc=$_agenti_rc) → vincolo hard al motore." >&2
  fi
  # AR-291 — il verdetto di questo guardiano finiva in una pipe e poi in un `|| true`, mentre quello
  # accanto (agent-registry-check) diventava vincolo hard. Adesso è un cancello, e la condizione di
  # promozione che AR-291 chiedeva è SODDISFATTA: dal lotto 24 il metro legge il contenuto (quaderni
  # vuoti, kit sottili in rapporto alla mediana, fotocopie, struttura) e non la sola presenza dei file.
  # Parte verde perché il debito del 28/7 è dichiarato per nome in cervello/stampo-baseline.json:
  # blocca il primo NUOVO che sporca, non il parco esistente.
  # AR-119 — il confine della firma. La firma di Nicola vive in `impostazioni`, e il cervello quella
  # tabella la scrive con la stessa chiave con cui la legge: a livello di permessi il confine non
  # esiste, esiste una convenzione. Questo cancello la rende un controllo. Nasce VERDE (nessuno script
  # scrive chiavi di firma, misurato il 28/7), quindi blocca il primo che proverà a farlo.
  echo "[$(ts)] Guardiano del confine della firma (AR-119 — gate hard)..."
  if ! guardiano firma-check.mjs; then
    FIRMA_VINCOLO="$(vincolo_da_rc "firma-check" "$GUARDIANO_RC" "⛔ CONFINE DELLA FIRMA VIOLATO (firma-check.mjs rc=$GUARDIANO_RC, AR-119): uno script del cervello scrive — o può scrivere — la chiave con cui Nicola firma le azioni. Chi esegue non può firmare se stesso. Togli quella scrittura, oppure dichiara le chiavi che lo script tocca con CHIAVI_SCRITTE. Dettaglio: node cervello/firma-check.mjs")"
    echo "[$(ts)] ⚠️  AR-119: firma-check rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # AR-339/340/341 — la porta degli elenchi git. Git riscrive i nomi con l'accento (26 file del
  # vault): chi chiede un elenco a git senza passare dalla porta riceve percorsi che non esistono e
  # non se ne accorge — lo scanner dei segreti li saltava in silenzio contandoli fra i controllati.
  # Nasce VERDE (i quattro punti sono stati portati dentro il 29/7): blocca il primo che uscirà.
  echo "[$(ts)] Guardiano della porta degli elenchi git (AR-339 — gate hard)..."
  if ! guardiano percorsi-git.mjs --check; then
    PORTA_GIT_VINCOLO="$(vincolo_da_rc "percorsi-git" "$GUARDIANO_RC" "⛔ PORTA DEGLI ELENCHI GIT SCAVALCATA (percorsi-git.mjs rc=$GUARDIANO_RC, AR-339/340/341): uno script chiede a git un elenco di percorsi senza -z, quindi riceve i nomi con l'accento riscritti in ottali e lavora su file che non esistono — in silenzio. Fallo passare da percorsiDaGit() in cervello/percorsi-git.mjs. Dettaglio: node cervello/percorsi-git.mjs --check")"
    echo "[$(ts)] ⚠️  AR-339: percorsi-git rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # 21/8 — IL FRENO DELLA CORREZIONE DEL 4/7, che quella volta non era stato messo.
  # Nicola: «togli il cablato su Windows una volta per sempre, impedisci che riaccada». Il registro
  # dava per fatto sia la pulizia sia questo guardiano; il 21/8 il path era rientrato in
  # marketplace-repo.mjs e il guardiano non esisteva. Una correzione chiusa con una frase rientra.
  echo "[$(ts)] Guardiano dei percorsi cablati su una macchina sola (gate hard)..."
  if ! guardiano no-path-cablati-check.mjs; then
    CABLATI_VINCOLO="$(vincolo_da_rc "no-path-cablati" "$GUARDIANO_RC" "⛔ PERCORSO CABLATO SU UNA MACCHINA SOLA (no-path-cablati-check.mjs rc=$GUARDIANO_RC): nel codice è rientrato un percorso che vale solo sul PC di qualcuno (C:\\Users\\… o /Users/<nome>/). Su tutte le altre macchine quel codice punta al nulla, in silenzio — ed è la ricaduta che Nicola ha già corretto il 4/7. Chiedi la posizione a chi la sa: resolveMarketplaceRepo() in cervello/marketplace-repo.mjs. Dettaglio: node cervello/no-path-cablati-check.mjs")"
    echo "[$(ts)] ⚠️  percorsi cablati rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # 21/8 — IL SENSORE CHE NON C'ERA MENTRE IL LAVORO SPARIVA.
  # Il server ha accumulato 7.849 messe da parte senza che nessuno se ne accorgesse: l'allineamento
  # ne creava una al minuto per far partire un rebase, e in tutto il repo non esisteva un `git stash
  # pop`. Il difetto è riparato; questo è l'occhio che mancava, perché un guasto che nessuno misura
  # torna e non lo sa nessuno. Una messa da parte è un prestito: se non torna, è lavoro perso.
  echo "[$(ts)] Guardiano delle messe da parte mai riprese (gate hard)..."
  if ! guardiano stash-dimenticate.mjs; then
    STASH_VINCOLO="$(vincolo_da_rc "stash-dimenticate" "$GUARDIANO_RC" "⛔ MESSE DA PARTE MAI RIPRESE (stash-dimenticate.mjs rc=$GUARDIANO_RC): ci sono modifiche messe da parte con git stash che nessuno ha ripreso. È il guasto che il 21/8 ha tenuto il server scollegato da GitHub per giorni, 7.849 volte: chi crea una messa da parte deve restituirla, sempre, riuscito o fallito il lavoro. NON buttarle: dentro può esserci memoria vera. Guarda cosa contengono con node cervello/stash-dimenticate.mjs --dettaglio")"
    echo "[$(ts)] ⚠️  stash dimenticate rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # AR-186 — i due elenchi che governano i 120: la riga-roster di CLAUDE.md (la legge Nicola) e il
  # campo description del mansionario (lo legge il router). Un rimando presente in uno solo dei due
  # manda il lavoro a un senior che non lo rivendica. Nasce VERDE sui tredici dichiarati il 29/7 in
  # cervello/deferral-baseline.json: blocca il quattordicesimo.
  echo "[$(ts)] Guardiano dei rimandi fra senior (AR-186 — gate hard)..."
  if ! guardiano deferral-agenti.mjs; then
    DEFERRAL_VINCOLO="$(vincolo_da_rc "deferral-agenti" "$GUARDIANO_RC" "⛔ RIMANDI FRA SENIOR DIVERGENTI (deferral-agenti.mjs rc=$GUARDIANO_RC, AR-186): un agente rimanda a qualcuno in CLAUDE.md ma non nella sua scheda (o viceversa), e non era nel debito dichiarato. Il router legge la scheda, Nicola legge CLAUDE.md: il lavoro va dove dice il primo. Allinea i due, oppure dichiaralo con motivo in cervello/deferral-baseline.json. Dettaglio: node cervello/deferral-agenti.mjs")"
    echo "[$(ts)] ⚠️  AR-186: deferral-agenti rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  echo "[$(ts)] Guardiano stampo senior (vettori-installati / Come pensa l'AD — gate hard)..."
  if ! guardiano stampo-check.mjs; then
    STAMPO_VINCOLO="$(vincolo_da_rc "stampo-check" "$GUARDIANO_RC" "⛔ STAMPO SENIOR PEGGIORATO (stampo-check.mjs rc=$GUARDIANO_RC, AR-129/AR-287/AR-289/AR-291): un agente ha un difetto di stampo che NON era nel debito dichiarato — quaderno mai scritto, kit sottile rispetto alla mediana del parco, kit fotocopia di altri, o strati duplicati. Riparalo in questo giro, oppure dichiaralo con motivo in cervello/stampo-baseline.json — allargare quella lista è una decisione visibile, non un effetto collaterale. Dettaglio: node cervello/stampo-check.mjs")"
    echo "[$(ts)] ⚠️  AR-291: stampo-check rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # INFORMATIVO — si promuove a cancello quando la potatura è stata applicata su main
  # (`node cervello/pota-memoria.mjs --applica`) e i tetti riabbassati (`peso-contesto.mjs --aggiorna`).
  # Oggi esce 1 apposta: i tetti sono l'OBIETTIVO post-potatura, non il peso di oggi, quindi il rosso
  # è la misura del lavoro che manca. Promuoverlo adesso bloccherebbe ogni giro su un debito noto.
  echo "[$(ts)] Peso del contesto (AR-199 — quanto rilegge il giro a ogni passata)..."
  # Uscita CATTURATA anche se per ora è informativa: scriverla come `node … | tail` avrebbe aggiunto
  # un'istanza alla malattia «esito-in-una-pipe» proprio mentre ne curo un'altra, e il codice d'uscita
  # sarebbe stato irrecuperabile il giorno della promozione. Così invece basterà usare $_peso_rc.
  _peso_out="$(node "$SCRIPT_DIR/peso-contesto.mjs" 2>&1)"; _peso_rc=$?
  printf '%s\n' "$_peso_out" | tail -8
  [ "$_peso_rc" -ne 0 ] && echo "[$(ts)] ℹ️  AR-199: memoria sopra i tetti-obiettivo (rc=$_peso_rc) — informativo finché la potatura non è passata." >&2
  # INFORMATIVO — si promuove a cancello quando il drift è 0. Oggi esce 1 (una skill non citata nei
  # doc): promuoverlo adesso bloccherebbe ogni giro su un debito di documentazione. AR-291: un
  # guardiano resta informativo solo con la sua condizione di promozione scritta accanto.
  echo "[$(ts)] Guardiano capacità (workflow ↔ comandi)..."
  node "$SCRIPT_DIR/guardiano-capacita.mjs" 2>&1 | esito_righe 4 || true
  # Round 2 programma intelligenza (2026-07-25). Due misure, per ora INFORMATIVE (|| true):
  #  · cantiere-prove: quanti difetti nessun guardiano può chiudere (il caso AR-144/AR-117 — fix
  #    mergiato e provato, ma il cantiere lo contava ancora aperto perché la prova puntava altrove).
  #  · pagella-intelligenza: i 5 numeri di "quando la macchina è pronta", con lo storico del movimento.
  # NON sono vincoli hard: oggi cantiere-prove fallirebbe subito (bloccanti non verificabili) e
  # bloccherebbe ogni giro invece di migliorarlo. Si promuove a cancello quando bloccanti_ciechi = 0.
  echo "[$(ts)] Guardiano prove del cantiere (difetti che nessuno può chiudere)..."
  node "$SCRIPT_DIR/cantiere-prove.mjs" 2>&1 | esito_righe 4 || true
  # AR-330 — la guardia della NASCITA: nessun difetto può stare in cantiere con una prova che era già
  # soddisfatta il giorno in cui è nato. Una prova già vera alla nascita descrive il sintomo, non la
  # cura: il difetto si chiude da solo senza che nessuno ripari niente. È successo il 27/7 alle 12:15
  # con 91 difetti su 173 — 60 secondi dopo il merge, con zero righe di codice cambiate.
  #
  # Questo NASCE HARD, al contrario di cantiere-prove qui sopra. La differenza è che cantiere-prove
  # misura un debito accumulato (fallirebbe subito e bloccherebbe ogni giro), mentre questo misura una
  # cosa che oggi è a zero: il cantiere è pulito, e deve restarci. Un cancello che parte già rosso non
  # protegge niente — viene disattivato entro la settimana. Uno che parte verde si accorge del primo
  # che sporca, ed è per quello che serve.
  _prove_out="$(node "$SCRIPT_DIR/prove-oneste.mjs" 2>&1)"; _prove_rc=$?
  printf '%s\n' "$_prove_out" | head -1
  printf '%s\n' "$_prove_out" | tail -6
  if [ "$_prove_rc" -eq 1 ]; then
    PROVE_VINCOLO="⛔ PROVE DISONESTE IN CANTIERE (prove-oneste.mjs rc=1, AR-330): almeno un difetto aperto ha una prova che era GIÀ soddisfatta alla sua nascita — si chiuderà da solo senza che nessuno abbia riparato niente. Riscrivi quelle prove PRIMA di chiudere il giro: devono citare qualcosa che esisterà SOLO col fix installato, o meglio diventare comportamentali ({\"comando\":\"node cervello/test/<nome>.test.mjs\"}). Elenco: node cervello/prove-oneste.mjs"
    echo "[$(ts)] ⚠️  AR-330: prove-oneste FALLITO (rc=1) → vincolo hard al motore." >&2
  elif [ "$_prove_rc" -ne 0 ]; then
    PROVE_VINCOLO="⚠️ GUARDIANO PROVE CIECO (prove-oneste.mjs rc=$_prove_rc, AR-322): non ha potuto misurare l'onestà delle prove del cantiere. Ripara lo strumento — non fidarti del verde che non c'è."
    echo "[$(ts)] ⚠️  AR-330: prove-oneste CIECO (rc=$_prove_rc) → vincolo di cecità." >&2
  fi
  # I FRENI DELLE LEZIONI, prima della pagella che li conta. L'ordine non è estetico: la pagella
  # legge `con_gate` da apprendimento.json e non sa distinguere un freno vero da un campo compilato
  # bene. Questo lo sa, e nasce HARD come prove-oneste e per lo stesso motivo — oggi vale zero su
  # zero, quindi non blocca nessuno; si accorge del primo gate finto, che è l'unico momento in cui
  # serve. Se partisse rosso lo spegnerebbero entro la settimana.
  _gate_out="$(node "$SCRIPT_DIR/gate-veri.mjs" 2>&1)"; _gate_rc=$?
  printf '%s\n' "$_gate_out" | tail -4
  if [ "$_gate_rc" -eq 1 ]; then
    GATE_VINCOLO="⛔ FRENI FINTI FRA LE LEZIONI (gate-veri.mjs rc=1): almeno una correzione di Nicola dichiara un gate che non può scattare — comando inesistente, oppure mai rotto apposta da una mutazione. Il punteggio 'ha imparato' sale senza che sia stata costruita nessuna difesa. Aggiungi la mutazione in cervello/mutanti.json (campo lezione: L-xxx), o togli il campo gate. Elenco: node cervello/gate-veri.mjs"
    echo "[$(ts)] ⚠️  gate-veri FALLITO (rc=1) → vincolo hard al motore." >&2
  elif [ "$_gate_rc" -ne 0 ]; then
    GATE_VINCOLO="⚠️ GUARDIANO DEI FRENI CIECO (gate-veri.mjs rc=$_gate_rc): non ha potuto misurare se i gate dichiarati sono veri. Ripara lo strumento — non fidarti del verde che non c'è."
    echo "[$(ts)] ⚠️  gate-veri CIECO (rc=$_gate_rc) → vincolo di cecità." >&2
  fi
  echo "[$(ts)] Pagella dell'intelligenza (quanto manca a 'pronta')..."
  node "$SCRIPT_DIR/pagella-intelligenza.mjs" 2>&1 | esito_righe 8 || true

  # ─── I TEST GIRANO A OGNI GIRO (25/7) ─────────────────────────────────────────────────
  # Il difetto, trovato controllando il guardiano che avevo appena costruito: i test di
  # `cervello/test/` e quelli del Pannello NON li lanciava nessuno. Non il giro, non una CI — solo
  # una persona che li digitava a mano. Avevo costruito `test-pannello.mjs` proprio per scoprire
  # i test che nessuno esegue, e l'avevo lasciato nella stessa condizione. Una rete che nessuno
  # tende non è una rete.
  #
  # CERVELLO = VINCOLO HARD. Sono test puri di Node su moduli .mjs: niente rete, niente DB, niente
  # compilatore. Se diventano rossi sono rossi davvero, e il giro deve saperlo prima di decidere
  # qualsiasi cosa — non dopo. ~2 secondi.
  echo "[$(ts)] Test del cervello (la rete c'è o non c'è)..."
  _testc_out="$(node "$SCRIPT_DIR/test-cervello.mjs" 2>&1)"; _testc_rc=$?
  printf '%s\n' "$_testc_out" | tail -6
  if [ "$_testc_rc" -ne 0 ]; then
    TEST_VINCOLO="⛔ TEST DEL CERVELLO ROSSI (test-cervello.mjs rc=$_testc_rc): uno o più file di test non passano o non partono. NON dichiarare 'fatto' e non aprire PR finché non tornano verdi: rimettili a posto PRIMA di ogni altro lavoro, poi rilancia 'node cervello/test-cervello.mjs'. Un test rosso ignorato è il difetto che ha generato tutti gli altri."
    echo "[$(ts)] ⚠️  Test del cervello ROSSI (rc=$_testc_rc) → passo un vincolo hard al motore." >&2
  fi
  # PANNELLO = INFORMATIVO, e il motivo è onesto: girano solo col type-stripping di Node (≥22.18),
  # e da qui non posso verificare quale Node esegue davvero il giro sul VPS. Consegnare un vincolo
  # hard che non ho potuto provare sulla macchina bersaglio è l'errore che ho già fatto. Si promuove
  # a cancello il giorno che lo si vede verde nel log del VPS.
  echo "[$(ts)] Test del Pannello (informativo finché non provato sul VPS)..."
  node "$SCRIPT_DIR/test-pannello.mjs" 2>&1 | esito_righe 4 || true

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
  node "$SCRIPT_DIR/supervisione-negozi.mjs" --accoda 2>&1 | esito_righe 6 || true
  echo "[$(ts)] Housekeeping coda azioni (sposta ✅/❌ in archivio se >20)..."
  node "$SCRIPT_DIR/housekeeping-azioni.mjs" 2>&1 | esito_righe 2 || true
  echo "[$(ts)] Sonda chiusura-loop quaderni (AR-009)..."
  node "$SCRIPT_DIR/chiusura-loop.mjs" --sonda 2>&1 | esito_righe 4 || true
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
  node "$SCRIPT_DIR/calibrazione.mjs" scadute 2>&1 | esito_righe 4 || true

  # ─── IL DEBITO DI MISURA NON SI CONDONA PIÙ (25/7, voce 2) ────────────────────────
  # Lo sweep qui sopra marca 'scaduta' e il giro tirava dritto: alle 06:20 «devi ancora misurare»
  # diventava «pazienza», in silenzio. Cinque previsioni vere sono nate, morte e non hanno
  # insegnato niente. Prevedere senza mai misurare non è calibrazione, è oroscopo — e la voce 2
  # della pagella («sa prevedere le conseguenze delle sue mosse») resta cieca finché è così.
  echo "[$(ts)] Debito di misura (previsioni mai confrontate col reale)..."
  _deb_out="$(node "$SCRIPT_DIR/calibrazione.mjs" debito --gate 2>&1)"; _deb_rc=$?
  printf '%s\n' "$_deb_out" | tail -12
  if [ "$_deb_rc" -ne 0 ]; then
    DEBITO_VINCOLO="⛔ DEBITO DI MISURA APERTO (calibrazione.mjs debito rc=$_deb_rc): ci sono previsioni fatte e mai confrontate col reale. PRIMA di chiudere questo giro chiudine almeno UNA con 'node cervello/calibrazione.mjs esito --id=<id> --reale=<n> --fonte=<fonte>' — il numero va LETTO da una fonte ammessa, mai stimato. Se una previsione non è più misurabile, chiudila lo stesso dicendo perché nella nota: una rinuncia motivata insegna, una scadenza silenziosa no."
    echo "[$(ts)] ⚠️  Debito di misura aperto (rc=$_deb_rc) → passo un vincolo hard al motore." >&2
  fi

  # AR-042: guardiano schema calibrazione — verifica che almeno una voce abbia il campo 'stato'
  # (lo schema CLI, non lo schema legacy a mano). Se il registro è tutto voci legacy, il motore di autonomia
  # gira su dati vuoti → passiamo un vincolo hard al motore di usare la CLI.
  echo "[$(ts)] Guardiano schema calibrazione (AR-042)..."
  _cal_file="MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"
  if [ -f "$_cal_file" ] && command -v node >/dev/null 2>&1; then
    # AR-040: prima archivia le voci legacy (senza id/stato valido) così il conteggio è pulito.
    echo "[$(ts)] Archivia voci calibrazione legacy (AR-040)..."
    node "$SCRIPT_DIR/calibrazione.mjs" archivia-legacy 2>&1 | esito_righe 2 || true
    _cal_strutturate="$(node -e "
      const c=JSON.parse(require('fs').readFileSync('$_cal_file','utf8'));
      const arr=c.previsioni||c.registro||[];
      console.log(arr.filter(v=>v.stato).length);
    " 2>/dev/null || echo 0)"
    if [ "${_cal_strutturate:-0}" = "0" ]; then
      # AR-040/AR-042: registro vuoto → apri automaticamente UNA previsione baseline (non delegare al motore).
      echo "[$(ts)] ⚙️  AR-040: registro vuoto, autoprevedi la prima previsione baseline..."
      node "$SCRIPT_DIR/calibrazione.mjs" autoprevedi 2>&1 | esito_righe 3 || true
      # Rileggi dopo autoprevedi
      _cal_strutturate="$(node -e "
        const c=JSON.parse(require('fs').readFileSync('$_cal_file','utf8'));
        const arr=c.previsioni||c.registro||[];
        console.log(arr.filter(v=>v.stato).length);
      " 2>/dev/null || echo 0)"
      if [ "${_cal_strutturate:-0}" = "0" ]; then
        # AR-308: si ACCUMULA, non si sovrascrive. Il vincolo qui sotto (AR-061) usava la stessa
        # variabile con un `=` secco e cancellava questo allarme senza lasciare traccia.
        CAL_VINCOLO="$(aggiungi_vincolo "$CAL_VINCOLO" "⛔ CALIBRAZIONE SPENTA (AR-042): calibrazione.json ha ancora 0 voci con campo 'stato' dopo autoprevedi. OBBLIGO: chiama 'node cervello/calibrazione.mjs prevedi --reparto=@AD --azione=... --metrica=... --atteso=... --entro=AAAA-MM-GG'. NON scrivere a mano nel JSON.")"
        echo "[$(ts)] ⚠️  AR-042: calibrazione.json senza voci strutturate dopo autoprevedi → vincolo hard." >&2
      else
        echo "[$(ts)] ✅ calibrazione.json: ${_cal_strutturate} voci strutturate (dopo autoprevedi)."
      fi
    else
      echo "[$(ts)] ✅ calibrazione.json: ${_cal_strutturate} voci strutturate."
    fi
    echo "[$(ts)] Ripara sensore_stato mancanti (AR-061)..."
    node "$SCRIPT_DIR/calibrazione.mjs" ripara 2>&1 | esito_righe 2 || true
    echo "[$(ts)] Guardiano calibrazione fonte+sensore (AR-061)..."
    _valida_out="$(node "$SCRIPT_DIR/calibrazione.mjs" valida 2>&1)"; _valida_rc=$?
    printf '%s\n' "$_valida_out" | tail -2
    if [ "$_valida_rc" -ne 0 ]; then
      # AR-322: rc=2 significa «non ho potuto misurare», non «sei bocciato» — e non va raccontato col
      # testo di dominio, che sarebbe una bugia sul contenuto. AR-308: accumula, non sovrascrive.
      CAL_VINCOLO="$(aggiungi_vincolo "$CAL_VINCOLO" "$(vincolo_da_rc "calibrazione.mjs valida" "$_valida_rc" "⛔ CALIBRAZIONE NON CONFORME (AR-061): $(printf '%s' "$_valida_out" | head -1)")")"
      echo "[$(ts)] ⚠️  AR-061: calibrazione rc=$_valida_rc → vincolo al motore." >&2
    fi
  fi
  # PZ-009: sonda taste-file — il log dei verdetti di Nicola è vivo o vuoto? (informa, non blocca)
  echo "[$(ts)] Sonda taste-file (verdetti di Nicola)..."
  node "$SCRIPT_DIR/taste-file.mjs" --sonda 2>&1 | esito_righe 2 || true
  # 4/8: la CI delle PR aperte. Questa macchina apre PR da sola a ogni lavoro e non ha mai guardato
  # come finivano i controlli: la sera del 4/8, cinque PR su sei erano rosse e nessuno lo sapeva.
  # Il vincolo scatta SOLO sul rosso di cui la PR è responsabile: i rossi ereditati da `main` sono un
  # guasto solo moltiplicato per il numero di PR aperte, e un allarme gonfiato si impara a scorrere.
  echo "[$(ts)] Sonda CI (le PR aperte passano le prove?)..."
  _ci_out="$(node "$SCRIPT_DIR/ci-stato.mjs" --sonda 2>&1)"; _ci_rc=$?
  printf '%s\n' "$_ci_out" | esito_righe 4
  if [ "$_ci_rc" -eq 1 ]; then
    CI_VINCOLO="⛔ PR APERTE CON LE PROVE ROSSE (ci-stato.mjs rc=$_ci_rc): il lavoro è già su GitHub e non passa i controlli — finché resta così, Nicola non può unirlo. Guarda di chi è il rosso PRIMA di toccare qualcosa (\`node cervello/ci-stato.mjs\`): se dice «ereditata», il guasto è su main e si ripara LÀ una volta sola, non su ogni PR.
$_ci_out"
    echo "[$(ts)] ⚠️  CI: rc=$_ci_rc → vincolo hard al motore." >&2
  fi
  # AR-030: freschezza CHECKLIST-NICOLA.md — se è stantia (>2 giorni), il motore riceve un VINCOLO.
  echo "[$(ts)] Freschezza checklist Nicola (AR-030)..."
  _checklist_out="$(node "$SCRIPT_DIR/freschezza-checklist.mjs" 2>&1)"; _checklist_rc=$?
  printf '%s\n' "$_checklist_out" | tail -3
  if [ "$_checklist_rc" -ne 0 ]; then
    CHECKLIST_VINCOLO="$(printf '%s\n' "$_checklist_out" | head -1)"
    echo "[$(ts)] ⚠️  AR-030: checklist stantia → vincolo hard al motore." >&2
  fi
  # AR-431: freschezza della MAPPA DEI RISCHI. Il guardiano esisteva e non lo eseguiva nessuno —
  # cioè era esattamente la malattia che doveva sorvegliare. Cablarlo qui è la clausola del
  # fix_proposto che era rimasta fuori: «come gli altri tre».
  echo "[$(ts)] Freschezza della mappa dei rischi (AR-431)..."
  _rischi_out="$(node "$SCRIPT_DIR/freschezza-rischi.mjs" 2>&1)"; _rischi_rc=$?
  printf '%s\n' "$_rischi_out" | tail -3
  if [ "$_rischi_rc" -ne 0 ]; then
    RISCHI_VINCOLO="$(vincolo_da_rc "freschezza-rischi" "$_rischi_rc" "⛔ MAPPA DEI RISCHI STANTIA (freschezza-rischi.mjs rc=$_rischi_rc, AR-431): i rischi gravi dell'azienda non li riguarda nessuno da mesi, mentre la checklist ha il suo controllo di freschezza da luglio. Guarda chi è l'owner e da quanti giorni: node cervello/freschezza-rischi.mjs
$_rischi_out")"
    echo "[$(ts)] ⚠️  AR-431: mappa dei rischi stantia → vincolo hard al motore." >&2
  fi
  # AR-164: freschezza delle CADENZE — non «la sveglia è carica?» (i timer, già guardati da
  # verifica-automazione) ma «qualcuno si è alzato?». Un timer attivo che lancia uno script che esce
  # subito è verde da entrambe le parti e non produce niente: se il Piano del mattino smette di
  # uscire, prima non se ne accorgeva nessuno.
  echo "[$(ts)] Freschezza delle cadenze (AR-164 — il prodotto, non il timer)..."
  _cad_out="$(node "$SCRIPT_DIR/freschezza-cadenze.mjs" 2>&1)"; _cad_rc=$?
  printf '%s\n' "$_cad_out" | tail -5
  if [ "$_cad_rc" -ne 0 ]; then
    CADENZE_VINCOLO="$(vincolo_da_rc "freschezza-cadenze" "$_cad_rc" "⛔ UNA CADENZA HA SMESSO DI USCIRE (freschezza-cadenze.mjs rc=$_cad_rc, AR-164): un timer può essere attivo e non produrre niente. Guarda quale manca e perché PRIMA di fidarti del ritmo di questa settimana: node cervello/freschezza-cadenze.mjs
$_cad_out")"
    echo "[$(ts)] ⚠️  AR-164: freschezza-cadenze rc=$_cad_rc → vincolo al motore." >&2
  fi
  # AR-115: freschezza OKR-Squadra.md — target con data passata o doc stantio ⇒ riscrittura obbligatoria.
  echo "[$(ts)] Freschezza OKR-Squadra (AR-115)..."
  _okr_out="$(node "$SCRIPT_DIR/freschezza-okr.mjs" 2>&1)"; _okr_rc=$?
  printf '%s\n' "$_okr_out" | tail -3
  if [ "$_okr_rc" -ne 0 ]; then
    OKR_VINCOLO="$(printf '%s\n' "$_okr_out" | head -1)"
    echo "[$(ts)] ⚠️  AR-115: OKR stantio/scaduto → vincolo hard al motore." >&2
  fi
  # PZ-012 (era AR-077, mai cablato): sentinella BUDGET per reparto — se un reparto sfora il suo
  # budget (OKR) accoda lo STOP 🔴; se non c'è spesa collegata lo dice onestamente (sensore non attivo).
  echo "[$(ts)] Sentinella budget per reparto (AR-077)..."
  node "$SCRIPT_DIR/sentinella-budget.mjs" 2>&1 | esito_righe 4 || true
  # PZ-013: SEMAFORO DINAMICO — i reparti con autonomia 'alta' GUADAGNATA (Wilson ≥0.7 su ≥8 esiti
  # reali) generano una PROPOSTA 🟡 di promozione giallo→verde in AZIONI-IN-ATTESA. Mai auto-applicata:
  # la firma resta a Nicola. È l'autonomia a punti che si espande sulle prove, non a simpatia.
  echo "[$(ts)] Semaforo dinamico: proposte di promozione da calibrazione (PZ-013)..."
  node "$SCRIPT_DIR/calibrazione.mjs" promozioni --accoda 2>&1 | esito_righe 4 || true
  # PZ-010: sweep esperimenti — chiude a scadenza gli esperimenti aperti di auto-miglioramento.json
  # (AR-054: nessun esperimento resta aperto all'infinito; la misura non è delegata alla memoria dell'LLM).
  echo "[$(ts)] Sweep esperimenti in scadenza (AR-054/AR-041/AR-106 — gate hard)..."
  # 🧪 AR-323 — IL TESTO DEL VINCOLO LO PRODUCE IL GUARDIANO, NON IL GIRO.
  # Qui c'era una frase fissa scritta a mano: «NESSUN ESPERIMENTO APERTO … aprine uno». Ma il
  # guardiano esce 1 per DUE motivi opposti — «non c'è nessun esperimento aperto» e «ce ne sono di
  # scaduti che nessuno ha misurato» — e sa distinguerli, lo scrive nel suo output. Il giro lo
  # buttava via e dava sempre lo stesso ordine: apri un esperimento nuovo. Anche quando il problema
  # era esattamente l'opposto: misurare quelli vecchi. Così il volano accumulava esperimenti aperti
  # e non ne chiudeva nessuno, restando formalmente in regola — e la calibrazione, che è il modo in
  # cui l'azienda impara, restava ferma proprio mentre i controlli dicevano che girava.
  # La condizione era cambiata dentro il .mjs, il testo viveva in un altro file: due case per una
  # cosa sola. Adesso il giro RIPORTA quello che ha detto il guardiano, come fa già per la checklist
  # e per gli OKR. (stderr fuori dal vincolo: AR-309 — una traccia d'errore nel prompt si travestirebbe
  # da regola da rispettare.)
  _esp_out="$(node "$SCRIPT_DIR/esperimenti-check.mjs" 2>/dev/null)"; _esp_rc=$?
  printf '%s\n' "$_esp_out" | tail -4
  if [ "$_esp_rc" -ne 0 ]; then
    ESP_VINCOLO="⛔ VOLANO DEGLI ESPERIMENTI (esperimenti-check.mjs rc=$_esp_rc, AR-041/AR-106/AR-323) — quello che ha misurato il guardiano, parola per parola:
$_esp_out
Fai quello che ti dice QUI SOPRA: se dice che ce ne sono da MISURARE, misura quelli (scrivi delta e stato in auto-miglioramento.json) — non aprirne uno nuovo. Se dice che non ce n'è nessuno aperto, aprilo: node cervello/esperimenti-check.mjs --apri --ambito=<divario più alto> --metrica=<KPI> --atteso=1 --giorni=7"
    echo "[$(ts)] ⚠️  AR-041/106: esperimenti-check FALLITO (rc=$_esp_rc) → vincolo hard al motore, col testo del guardiano." >&2
  fi
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
  node "$SCRIPT_DIR/coerenza-rischi.mjs" 2>&1 | esito_righe 4 || true
  # AR-449: il peso dei file che la Cabina rilegge ogni 30 secondi. Il 30/7 alle 02:03
  # cantiere-difetti.json ha passato il tetto inline di GitHub e per dodici ore il Pannello ha
  # mostrato «Nessun difetto aperto 👍» con 162 aperti. La seconda strada adesso c'è; questo
  # guardiano serve a vedere la crescita MENTRE è ancora innocua, non quando è già un muro.
  echo "[$(ts)] Peso dei file della Cabina (AR-449)..."
  node "$SCRIPT_DIR/peso-file-cabina.mjs" 2>&1 | esito_righe 6 || true
  # AR-023: RICONCILIA IL CANTIERE — chiude da solo i difetti il cui fix è GIÀ nel codice (prova
  # verifica:{file,pattern}). Gira SEMPRE (prima del delta-gate) così la chiusura è deterministica e
  # NON dipende dal motore AI: il sync di fine giro la pubblica su main → il Pannello (che legge
  # quel ramo unico) non mostra più "in-corso" un difetto già risolto. Sola lettura del codice + bookkeeping.
  # auto-fix: solo verifica, no --applica — chiusura difetti solo manuale o via PR firmata.
  echo "[$(ts)] Auto-fix: riconcilia cantiere (solo verifica — chiusura manuale o via PR)..."
  node "$SCRIPT_DIR/auto-fix.mjs" verifica 2>&1 | esito_righe 6 || true
  echo "[$(ts)] Sincronizza proposte auto-riscrittura → cantiere..."
  node "$SCRIPT_DIR/sincronizza-proposte.mjs" 2>&1 | esito_righe 3 || true
  echo "[$(ts)] Allinea scan radiografia → cantiere (findings + voto live)..."
  node "$SCRIPT_DIR/allinea-scan-cantiere.mjs" 2>&1 | esito_righe 4 || true
  # 28/7 (domanda di Nicola: «non solo l'hai risolto, ma l'hai migliorato?»): la spazzata dei fratelli.
  # Un test dimostra che UN punto guarisce; questo dimostra che la malattia non è viva due porte più in
  # là. Fallisce se una forma-di-difetto nota si allarga — più istanze del tetto, o un file nuovo che si
  # ammala. Registro: cervello/malattie.json.
  # AR-272 (c) — l'elenco delle uscite verso il mondo reale. La radice comune dei tre bloccanti sulla
  # sicurezza è che il cancello sta DENTRO ogni esecutore invece che al confine: così un'uscita nuova
  # nasce scoperta e nessuno se ne accorge, perché non esisteva un elenco di cosa sia un'uscita.
  echo "[$(ts)] 🚪 Uscite verso il mondo reale (chi tocca il mondo, e chi lo controlla)..."
  if ! guardiano uscite-check.mjs; then
    USCITE_VINCOLO="$(vincolo_da_rc "uscite-check" "$GUARDIANO_RC" "⛔ USCITA SCOPERTA (uscite-check.mjs rc=$GUARDIANO_RC, AR-272): un punto di questa macchina scrive o manda qualcosa FUORI e nessuno l'ha dichiarato — oppure una dichiarata «serve il cancello» non lo importa. Non aggirarlo: dichiara l'uscita in cervello/uscite-reali.json dicendo se serve il cancello e, se non serve, PERCHÉ. Elenco: node cervello/uscite-check.mjs")"
    echo "[$(ts)] ⚠️  AR-272: uscite-check rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # AR-147/AR-214 — le scadenze esterne come DATI. Un countdown si CALCOLA: trascriverlo lo congela
  # al momento in cui è stato scritto, e da lì invecchia in silenzio sembrando aggiornato.
  echo "[$(ts)] 📅 Scadenze (calcolate, non trascritte)..."
  if ! guardiano scadenzario-check.mjs; then
    SCADENZE_VINCOLO="$(vincolo_da_rc "scadenzario-check" "$GUARDIANO_RC" "⛔ SCADENZA IMMINENTE o COUNTDOWN STANTIO (scadenzario-check.mjs rc=$GUARDIANO_RC, AR-147/AR-214): c'è una scadenza esterna entro 72h, oppure un file vivo contiene un countdown scritto a mano che ha smesso di essere vero. Le scadenze imminenti vanno in cima alle mosse del giro; i countdown trascritti vanno tolti — si calcolano, non si ricopiano. Dettaglio: node cervello/scadenzario-check.mjs")"
    echo "[$(ts)] ⚠️  AR-147/214: scadenzario rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # AR-159/AR-157 — le pause della coda. «Riprendono da sole» era una frase: il ⏸ lo leggeva un solo
  # punto della macchina, e serviva a TOGLIERE la card dal conteggio delle firme in attesa. Qui la
  # pausa viene confrontata con l'orologio, e la data dev'essere citata dal registro — non ricopiata
  # nel titolo, dove invecchia in silenzio il giorno che Nicola la sposta.
  # `--risveglia` e non solo il rilevatore: AR-159 (c) vieta di chiudere il punto con un promemoria,
  # perché il promemoria a mano è il meccanismo che qui ha già fallito. Scrive solo quando una pausa
  # è davvero finita, tocca solo la coda dell'AD, ed è idempotente (provato).
  # AR-105/AR-108 — i sensori uptime sono rimasti spenti 163 giri perché «non_configurato» sembra uno
  # stato normale e nessuna card lo reclamava. Ora uno spento deve dire PERCHÉ: scelta di Nicola o
  # buco. `--accoda` fa UNA card, mai ripetuta: una domanda che torna a ogni giro si impara a saltare.
  # AR-127 — il cancello condiviso esiste; il rischio è che una porta nuova non ci passi. Terza volta
  # che questa forma torna (AR-272 uscite, AR-169 registro, ora i push): quando una regola vive in N
  # posti, prima o poi N-1 restano indietro. Qui la si conta invece di sperarci.
  echo "[$(ts)] 🚪 Porte di pubblicazione (chi pusha senza cancello?)..."
  if ! guardiano porte-check.mjs; then
    PORTE_VINCOLO="$(vincolo_da_rc "porte-check" "$GUARDIANO_RC" "⛔ PORTA SCOPERTA (porte-check.mjs rc=$GUARDIANO_RC, AR-127): c'è un punto che pubblica su main senza passare da gate_pubblicazione — cioè senza controllo del ramo, del perimetro e dei guardiani di verità. Fallo passare dal cancello condiviso, o dichiara il PERCHÉ nelle ESENZIONI di porte-check.mjs. Elenco: node cervello/porte-check.mjs")"
    echo "[$(ts)] ⚠️  AR-127: porte-check rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # AR-825 — IL CANCELLO PARLA, MA NON CHIUDE.
  # `porte-check` qui sopra conta chi pubblica SENZA passare dal cancello. Questo conta il caso
  # gemello e più insidioso: chi dal cancello ci passa, si sente dire di no, ed entra lo stesso.
  # Il conto del 26/8: 141 lavori uniti su main dal 4 agosto, DIECI senza un verde — nove col
  # cancello rosso sulla testa, uno che il cancello non ha mai visto. La radice non è nel cancello,
  # che funziona: su GitHub un controllo ferma un merge solo se è dichiarato obbligatorio sul ramo,
  # e questo non lo è. Quella scelta è di Nicola e costa (card #177), quindi qui non si blocca
  # niente: si tiene il numero sotto un tetto che scende e non risale.
  # Il tetto sta qui e non dentro lo strumento apposta — chi lo alza lo fa con un commit visibile.
  echo "[$(ts)] 🚪 Lavori entrati su main senza un verde del cancello (AR-825)..."
  if ! guardiano entrate-senza-cancello.mjs --tetto 10; then
    SERRATURA_VINCOLO="$(vincolo_da_rc "entrate-senza-cancello" "$GUARDIANO_RC" "⛔ IL NUMERO È CRESCIUTO (entrate-senza-cancello.mjs rc=$GUARDIANO_RC, AR-825): un altro lavoro è entrato su main senza un verde del cancello. Erano dieci il 26/8 e quel dieci è il tetto. Guarda QUALE e perché prima di qualunque altra cosa: node cervello/entrate-senza-cancello.mjs. Se lo scavalco era giusto, dillo abbassando o alzando il tetto con un commit che si vede — non lasciandolo salire in silenzio.")"
    echo "[$(ts)] ⚠️  AR-825: entrate-senza-cancello rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  echo "[$(ts)] 🔐 Rotte del Pannello che scrivono da una GET (AR-409)..."
  if ! guardiano rotte-scriventi-check.mjs; then
    ROTTE_SCRIVENTI_VINCOLO="$(vincolo_da_rc "rotte-scriventi-check" "$GUARDIANO_RC" "⛔ ROTTA CHE SCRIVE FUORI DALLA SERRATURA (rotte-scriventi-check.mjs rc=$GUARDIANO_RC, AR-409/AR-226): una rotta del Pannello cambia lo stato del mondo da una GET, e la serratura la lascia passare come lettura perché classifica per verbo. Sposta la scrittura in una POST, oppure dichiarala in pannello/src/lib/rotte-scriventi.ts (SCRIVONO_IN_GET) col PERCHÉ — e allora le servirà same-origin o token come a una POST. Elenco: node cervello/rotte-scriventi-check.mjs")"
    echo "[$(ts)] ⚠️  AR-409: rotte-scriventi rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  echo "[$(ts)] 🔌 Sensori spenti (per scelta o per inerzia?)..."
  if ! guardiano sensori-spenti-check.mjs --accoda; then
    SENSORI_SPENTI_VINCOLO="$(vincolo_da_rc "sensori-spenti-check" "$GUARDIANO_RC" "⛔ SENSORE SPENTO SENZA MOTIVO (sensori-spenti-check.mjs rc=$GUARDIANO_RC, AR-105/AR-108): c'è uno strumento costruito che non sta guardando niente, e nessuno ha dichiarato se debba restare spento. Non è uno stato: è un buco. Dichiara il motivo in cervello/sensori-motivi.json (decisione | da-chiedere) oppure lascia che la card lo chieda a Nicola. Dettaglio: node cervello/sensori-spenti-check.mjs")"
    echo "[$(ts)] ⚠️  AR-105/108: sensori-spenti rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  echo "[$(ts)] ⏸ Pause della coda (qualcuno le sveglia davvero?)..."
  if ! guardiano pausa-check.mjs --risveglia; then
    PAUSE_VINCOLO="$(vincolo_da_rc "pausa-check" "$GUARDIANO_RC" "⛔ PAUSA SENZA RISVEGLIO o DATA RICOPIATA (pausa-check.mjs rc=$GUARDIANO_RC, AR-159/AR-157): c'è una card in pausa che nessun orologio sveglierà, oppure una card che si tiene dentro il valore di un fatto invece di citarne l'id — e quando Nicola sposta la data, quella copia mente. Se una pausa è scaduta, sveglia le card: node cervello/pausa-check.mjs --risveglia. Dettaglio: node cervello/pausa-check.mjs")"
    echo "[$(ts)] ⚠️  AR-159/157: pausa-check rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  echo "[$(ts)] 🧹 Spazzata dei fratelli (la stessa malattia, cercata dappertutto)..."
  if ! guardiano spazzata-fratelli.mjs; then
    FRATELLI_VINCOLO="$(vincolo_da_rc "spazzata-fratelli" "$GUARDIANO_RC" "⛔ MALATTIA ALLARGATA (spazzata-fratelli.mjs rc=$GUARDIANO_RC): una forma di difetto già nota è comparsa in un punto nuovo, o è cresciuta oltre il tetto. Non è un difetto nuovo: è uno vecchio che si è spostato. Curalo nello stesso lavoro, oppure dichiaralo esente col PERCHÉ in cervello/malattie.json — un'esenzione senza motivo è il silenzio che stiamo curando. Elenco: node cervello/spazzata-fratelli.mjs")"
    echo "[$(ts)] ⚠️  spazzata-fratelli rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi
  # 29/7 (Nicola: «inseriscili dentro bacheca della home e tienila sempre aggiornata») — l'elenco dei
  # guardiani in bacheca si RICAVA da questo file a ogni giro, non si scrive a mano. Il cablaggio non
  # può quindi invecchiare; può invecchiare la frase che spiega cosa fa ognuno, ed è l'unica cosa che
  # questo cancello pretende. Si promuove a cancello — e non resta informativo — perché scatta solo
  # quando qualcuno AGGIUNGE o TOGLIE un guardiano: costa una riga scriverla adesso, e se non si
  # scrive adesso non si scrive più. Con l'elenco incompleto la bacheca NON viene riscritta: meglio
  # quella di ieri, completa, che una con un buco.
  echo "[$(ts)] 🛡️  Guardiani in bacheca (l'elenco combacia con chi gira davvero?)..."
  if ! guardiano guardiani-check.mjs --bacheca; then
    GUARDIANI_VINCOLO="$(vincolo_da_rc "guardiani-check" "$GUARDIANO_RC" "⛔ ELENCO GUARDIANI SCOLLATO (guardiani-check.mjs rc=$GUARDIANO_RC): c'è un controllo che gira senza una descrizione in bacheca, o una descrizione rimasta di uno che non gira più. Nicola legge quella tabella per sapere chi lo protegge: un buco lì è una protezione promessa e non data. Scrivi la riga in cervello/censimento-guardiani.mjs (DESCRIZIONI) in QUESTO giro. Elenco: node cervello/guardiani-check.mjs")"
    echo "[$(ts)] ⚠️  guardiani-check rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi

  # 29/7 (Nicola: «aggiungi la descrizione delle 9 parti dentro la bacheca … vorrei che questa
  # sezione venga aggiornata ogni volta che c'è una cosa nuova dentro la macchina») — gemello del
  # cancello qui sopra, per la mappa invece che per i guardiani. I NUMERI si ricontano dal repo a
  # ogni giro e non possono invecchiare; quello che può invecchiare è la frase che spiega un pezzo
  # NUOVO, ed è l'unica cosa che questo cancello pretende. Scatta solo quando qualcuno AGGIUNGE o
  # TOGLIE un pezzo misurabile (skill, sensore, mano, servizio del VPS, area del Pannello): costa una
  # riga scriverla adesso, e se non si scrive adesso non si scrive più. Con l'elenco incompleto la
  # bacheca NON viene riscritta: meglio la mappa di ieri, completa, che una con un buco.
  echo "[$(ts)] 🗺️  Mappa della macchina in bacheca (i pezzi nuovi sono spiegati?)..."
  if ! guardiano mappa-macchina.mjs --bacheca; then
    MAPPA_VINCOLO="$(vincolo_da_rc "mappa-macchina" "$GUARDIANO_RC" "⛔ MAPPA DELLA MACCHINA SCOLLATA (mappa-macchina.mjs rc=$GUARDIANO_RC): è comparso un pezzo nuovo della macchina senza una riga che dica cosa fa, oppure è rimasta la riga di un pezzo che non c'è più. Nicola legge quella sezione della bacheca per capire di cosa è fatta la macchina: un buco lì è una macchina che cresce di nascosto. Scrivi la riga in cervello/censimento-macchina.mjs (DESCRIZIONI) in QUESTO giro. Elenco: node cervello/mappa-macchina.mjs")"
    echo "[$(ts)] ⚠️  mappa-macchina rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi

  # AR-165: era `node … | tail -4 || true` — l'esito buttato due volte. Il guardiano che deve scoprire
  # i controlli spenti in silenzio era, lui per primo, muto. Ora è un cancello dichiarato.
  echo "[$(ts)] Meta-guardiano freschezza-segnali (guardiani del preambolo hanno battuto?)..."
  if ! guardiano freschezza-segnali.mjs; then
    FRESCHEZZA_VINCOLO="$(vincolo_da_rc "freschezza-segnali" "$GUARDIANO_RC" "⛔ SEGNALI STANTII (freschezza-segnali.mjs rc=$GUARDIANO_RC, AR-165): almeno un guardiano del preambolo NON ha battuto in questo giro — il suo verde non esiste, è solo vecchio. Prima di fidarti dei controlli, guarda quale manca: node cervello/freschezza-segnali.mjs")"
    echo "[$(ts)] ⚠️  AR-165: freschezza-segnali rc=$GUARDIANO_RC → vincolo hard al motore." >&2
  fi

  # === CAPACITÀ VIVE + GUARDIANI ORFANI (6/7) — north-star/keyword = vincolo HARD allocazione (AR-113) ===
  echo "[$(ts)] ⭐ North Star (AR-113 — vincolo allocazione se stallo ≥ soglia giorni)..."
  _north_out="$(node "$SCRIPT_DIR/north-star-check.mjs" --gate 2>&1)"; _north_rc=$?
  printf '%s\n' "$_north_out" | tail -8
  if [ "$_north_rc" -ne 0 ]; then
    NORTH_STAR_VINCOLO="⛔ NORTH STAR IN STALLO (north-star-check.mjs --gate rc=$_north_rc, AR-113): 0 ordini pagati da ≥${NORTH_STAR_GIORNI_GATE:-3} giorni. Questo giro produce SOLO azioni che avvicinano il 1° ordine pagato; lavoro sulla macchina ammesso solo se sblocca direttamente una card business in coda (es. ordine test PQ, payout, contatto negozio)."
    echo "[$(ts)] ⚠️  AR-113: north-star-check FALLITO (rc=$_north_rc) → vincolo hard allocazione al motore." >&2
  fi
  echo "[$(ts)] Guardiano owner-keyword (AR-009/AR-027 — ora gate hard)..."
  _keyword_out="$(node "$SCRIPT_DIR/keyword-owner-check.mjs" 2>&1)"; _keyword_rc=$?
  printf '%s\n' "$_keyword_out" | tail -4
  if [ "$_keyword_rc" -ne 0 ]; then
    KEYWORD_VINCOLO="⛔ KEYWORD OWNER DUPLICATO (keyword-owner-check.mjs rc=$_keyword_rc, AR-009/AR-027): due agenti si dichiarano owner della stessa keyword → routing ambiguo. Correggi il mansionario prima di delegare."
    echo "[$(ts)] ⚠️  AR-109: keyword-owner-check FALLITO (rc=$_keyword_rc) → vincolo hard al motore." >&2
  fi
  # ── 10/8 — Guardiano freschezza Intelligence: la Cabina non deve mostrare analisi scadute. ──
  # Nasce dalla domanda di Nicola «ogni quanto si aggiorna?»: la risposta vera era «da undici giorni
  # non si aggiorna», e nessuno se n'era accorto perché la vecchiaia di un'analisi non era misurata
  # da nessuna parte. La soglia la deriva dalle cadenze delle fonti, non è un numero scritto qui.
  echo "[$(ts)] Guardiano freschezza Intelligence (le analisi mostrate sono ancora valide?)..."
  _fresc_out="$(node "$SCRIPT_DIR/freschezza-intelligence.mjs" --check 2>&1)"; _fresc_rc=$?
  printf '%s\n' "$_fresc_out" | tail -8
  if [ "$_fresc_rc" -ne 0 ]; then
    FRESCHEZZA_VINCOLO="⛔ INTELLIGENCE SCADUTA (freschezza-intelligence.mjs rc=$_fresc_rc): la Cabina sta mostrando analisi oltre la loro scadenza come se fossero fresche. Rigenerale (o spiega perché non si può) prima di usarle per decidere."
    echo "[$(ts)] ⚠️  Freschezza Intelligence FALLITA (rc=$_fresc_rc) → vincolo hard al motore." >&2
  fi
  # ── Lever 1 — Guardiano apprendimento (impara o solo accumula?) → vincolo hard «cristallizza». ──
  echo "[$(ts)] Guardiano apprendimento (Lever 1: impara o accumula?)..."
  _appr_out="$(node "$SCRIPT_DIR/apprendimento-guardiano.mjs" --gate 2>&1)"; _appr_rc=$?
  printf '%s\n' "$_appr_out" | tail -6
  if [ "$_appr_rc" -ne 0 ]; then
    _appr_ric="$(node "$SCRIPT_DIR/apprendimento-guardiano.mjs" --memoria 2>&1 || true)"
    APPRENDIMENTO_VINCOLO="⛔ APPRENDIMENTO FERMO (apprendimento-guardiano.mjs rc=$_appr_rc): promuovi a \`principio\` 2-3 lezioni mature con più evidenze (scrivi la regola in un mansionario/sentinella) e rendi la 1ª area ricorrente qui sotto un GATE; NON loggare l'ennesima lezione uguale. Una lezione nuova si scrive SOLO dalla porta (AR-651), mai aprendo il file a mano: \`node cervello/lezione-nuova.mjs --fonte \"…\" --testo \"…\" --regola \"…\" [--gate \"…\"]\` — il numero lo conia lei, ed è così che smettono di nascere due lezioni con lo stesso id.
$_appr_ric"
    echo "[$(ts)] ⚠️  Lever 1: apprendimento malato → vincolo hard al motore." >&2
  fi
  # ── AR-apprendimento — Correzione-Nicola-gate: l'area più ripetuta (18/26 lezioni) diventa un ──
  # numero verificabile invece di restare "farò più attenzione". Nasce dal vincolo HARD del giro
  # 2026-08-12 (Nicola: «promuovi... rendi la 1ª area ricorrente un GATE»). Sola lettura di
  # apprendimento.json, non blocca — segnala se il conteggio di lezioni-senza-freno peggiora.
  echo "[$(ts)] Guardiano correzione-Nicola-gate (l'area più ripetuta ha davvero un freno?)..."
  _cngate_out="$(node "$SCRIPT_DIR/correzione-nicola-gate.mjs" --json 2>&1)"; _cngate_rc=$?
  printf '%s\n' "$_cngate_out" | tail -8
  if [ "$_cngate_rc" -ne 0 ]; then
    CORREZIONE_NICOLA_VINCOLO="⛔ CORREZIONI DI NICOLA SENZA FRENO (correzione-nicola-gate.mjs rc=$_cngate_rc): l'area 'correzione-nicola' ha lezioni senza un gate proprio (comando/test che scatta), sopra soglia o peggiorata dal giro scorso. In QUESTO giro prendi 1-2 lezioni di quest'area con un 'gate:' scrivibile e verificale con node cervello/gate-veri.mjs — non limitarti a rileggerle.
$_cngate_out"
    echo "[$(ts)] ⚠️  Correzione-Nicola senza freno → vincolo al motore." >&2
  fi
  # ── AR-566 — Tasso di chiusura: si chiude almeno quanto si apre? → vincolo hard «chiudi, non cercare». ──
  # Approvato da Nicola il 10/8 («ok tasso di chiusura»). È il voto della macchina su sé stessa: finché
  # apre più difetti di quanti ne chiude, ogni ricerca nuova allunga la lista invece di accorciarla —
  # e il lavoro sembra peggiorare proprio mentre se ne fa di più. Sotto obiettivo il giro spende il
  # turno a chiudere. rc=2 è cieco (cantiere illeggibile): non è un verde, ma non ferma la ricerca.
  echo "[$(ts)] Tasso di chiusura (AR-566: chiudo almeno quanto apro?)..."
  _chius_out="$(node "$SCRIPT_DIR/tasso-chiusura.mjs" --gate 2>/dev/null)"; _chius_rc=$?
  printf '%s\n' "$_chius_out" | tail -8
  if [ "$_chius_rc" -eq 1 ]; then
    CHIUSURA_VINCOLO="⛔ APRO PIÙ DI QUANTO CHIUDO (tasso-chiusura.mjs rc=$_chius_rc): questo giro NON apre ricerche nuove — niente radiografie, niente dimensioni d'analisi nuove, niente difetti nuovi se non quelli che incontri riparando. Spendi il turno a CHIUDERE difetti già nel cantiere, con una prova che gira. Il conto qui sotto è il tuo voto.
$_chius_out"
    echo "[$(ts)] ⚠️  AR-566: sotto obiettivo → vincolo hard «chiudi, non cercare»." >&2
  elif [ "$_chius_rc" -eq 2 ]; then
    echo "[$(ts)] ⚪ AR-566: non ho potuto contare il tasso di chiusura (cieco, non verde)." >&2
  fi
  # ── Lever 3 — Cristallizzazione: promuovi le mature a principio + decadimento (meccanico, con backup). ──
  echo "[$(ts)] Cristallizzazione apprendimento (Lever 3: lezione→principio)..."
  node "$SCRIPT_DIR/cristallizza-apprendimento.mjs" --applica 2>&1 | esito_righe 4 || true
  # ── AR-416 — Potatore dell'archivio: la cristallizzazione fa CRESCERE apprendimento.json a ogni
  #    giro, e il potatore non lo lanciava nessuno — l'11/8 il file ha superato il tetto di lettura
  #    (1.070.609 > 1.048.576) e la scheda Apprendimento della Cabina è tornata illeggibile.
  #    --se-serve pota SOLO sopra il 95% del tetto (mai le lezioni vive), sotto non scrive un byte. ──
  echo "[$(ts)] Potatore archivio apprendimento (AR-416: pota prima del muro)..."
  node "$SCRIPT_DIR/pota-apprendimento.mjs" --se-serve 2>&1 | esito_righe 3 || true
  # ── Lever 2 — Verificatore avversariale: l'ultima auto-analisi era una refutazione VERA o un timbro? ──
  echo "[$(ts)] Verificatore avversariale (Lever 2: auto-verifica vera o timbro?)..."
  # AR-309 — due correzioni. (a) `2>&1` mescolava stderr nel testo del vincolo: una traccia d'errore
  # del guardiano finiva nel prompt travestita da regola da rispettare (è AR-322 visto da qui). Ora
  # stderr va al log e solo stdout diventa vincolo. (b) Era l'UNICO guardiano a non lasciare una riga
  # nel log: chi leggeva non poteva sapere se fosse passato, bocciato o mai partito.
  _verif_out="$(node "$SCRIPT_DIR/verifica-avversariale.mjs" --gate 2>/dev/null)"; _verif_rc=$?
  printf '%s\n' "$_verif_out" | tail -4
  if [ "$_verif_rc" -ne 0 ]; then
    VERIFICA_VINCOLO="$(vincolo_da_rc "verifica-avversariale.mjs" "$_verif_rc" "$_verif_out")"
    echo "[$(ts)] ⚠️  Lever 2: verificatore avversariale rc=$_verif_rc → vincolo al motore." >&2
  fi
  # ── Lever 2 — Validatore contratti JSON ora GATE HARD (niente più «|| true» silenzioso, AR-043). ──
  # AR-212 — prima si CORREGGE, poi si giudica. Il cancello dà al motore un vincolo, cioè CHIEDE di
  # scrivere il nome giusto: ma un vincolo è una richiesta, non una garanzia. Misurato il 28/7, giorni
  # dopo aver alzato il cancello, auto-analisi.json aveva ancora `domande_bloccanti` con TRE domande
  # dentro — una sul bando da 10.000€ in scadenza fra due giorni, invisibile in Cabina. Rinominare in
  # modo deterministico non dipende da chi scrive.
  node "$SCRIPT_DIR/valida-contratti.mjs" --correggi >/dev/null 2>&1 || true
  echo "[$(ts)] Validatore contratti JSON auto-coscienza (AR-043 — ora gate)..."
  _contr_out="$(node "$SCRIPT_DIR/valida-contratti.mjs" 2>&1)"; _contr_rc=$?
  printf '%s\n' "$_contr_out" | tail -4
  if [ "$_contr_rc" -ne 0 ]; then
    VERIFICA_VINCOLO="$VERIFICA_VINCOLO
⛔ CONTRATTI JSON FUORI-CONTRATTO (valida-contratti.mjs rc=$_contr_rc): un file auto-coscienza usa nomi-campo fuori dal contratto → il Pannello legge campi vuoti e mostra a Nicola una salute cieca. Rinomina ai nomi canonici PRIMA di chiudere il giro."
    echo "[$(ts)] ⚠️  Lever 2: contratti JSON fuori-contratto → vincolo hard al motore." >&2
  fi
  # Le 7 capacità costruite (visione 53) — sola lettura sui dati reali della macchina:
  # INFORMATIVO — NON si promuove, e la ragione è definitiva: misura il carico di firme di NICOLA, e
  # oggi esce 1 dicendo «sei tu il vincolo, la macchina ha già fatto la sua parte». Un cancello che
  # ferma la macchina perché un umano non ha ancora firmato punisce la parte sbagliata. AR-291.
  echo "[$(ts)] ⏱️  #38 Guardiano del Tuo Tempo (carico firme)..."
  node "$SCRIPT_DIR/guardiano-tempo.mjs" 2>&1 | esito_righe 3 || true
  echo "[$(ts)] 🪙 #30 Metabolismo (costo AI per organo)..."
  node "$SCRIPT_DIR/metabolismo.mjs" 2>&1 | esito_righe 3 || true
  echo "[$(ts)] 💶 #13 Bilancio Vivo (margine per ordine)..."
  node "$SCRIPT_DIR/bilancio-vivo.mjs" 2>&1 | esito_righe 3 || true
  echo "[$(ts)] 🦠 #12 Sistema Immunitario (red team sicurezza)..."
  node "$SCRIPT_DIR/sistema-immunitario.mjs" 2>&1 | esito_righe 4 || true
  echo "[$(ts)] ⚡ #23 Midollo Spinale (riflessi proposti)..."
  node "$SCRIPT_DIR/midollo-spinale.mjs" 2>&1 | esito_righe 3 || true
  echo "[$(ts)] 🛌 #37 Letargo (livello di degradazione)..."
  # AR-392 — «chi deve spegnere il superfluo quando finisce la benzina parla e nessuno lo ascolta».
  # La riga era `node letargo.mjs 2>&1 | esito_righe 3 || true`: in bash il codice d'uscita di una
  # pipe è quello dell'ULTIMO comando, cioè del filtro che stampa tre righe. Il verdetto del letargo
  # — RISPARMIO o SOPRAVVIVENZA, e cosa spegnere — moriva lì, e la macchina continuava a spendere
  # come se avesse il serbatoio pieno.
  # Restava informativo per una ragione giusta applicata al passo sbagliato: «le regole di letargo
  # si firmano una volta». Vero per SPEGNERE, che è 🟡 e resta di Nicola. Ma MISURARE e DIRE sono
  # sola lettura, e non hanno mai avuto bisogno di una firma. Qui si consegna il verdetto e basta:
  # entra nell'elenco dei vincoli attivi (derivato dalle variabili `*_VINCOLO`, AR-387), arriva al
  # motore e conta nell'esito del giro.
  _letargo_out="$(node "$SCRIPT_DIR/letargo.mjs" 2>&1)"; _letargo_rc=$?
  printf '%s\n' "$_letargo_out" | esito_righe 3
  if [ "$_letargo_rc" -ne 0 ]; then
    LETARGO_VINCOLO="⛔ BENZINA AGLI SGOCCIOLI (letargo.mjs rc=$_letargo_rc, AR-392): la macchina NON è al livello NORMALE. Questo giro spende il minimo indispensabile: taglia il VOLUME (giri pesanti, contenuti, esperimenti nuovi), MAI i controlli di verità e sicurezza. Le regole di spegnimento restano 🟡 da firmare una volta: quello che segue è il verdetto misurato adesso, parola per parola.
$_letargo_out"
    echo "[$(ts)] ⚠️  #37 Letargo: livello degradato → vincolo al motore." >&2
  fi
  echo "[$(ts)] ⏪ #4 Macchina del Tempo (replay della giornata)..."
  node "$SCRIPT_DIR/macchina-del-tempo.mjs" 2>&1 | esito_righe 2 || true
  # Il tracker che veglia i cancelli di sblocco delle 46 capacità ancora chiuse:
  echo "[$(ts)] 🔓 Sblocco capacità (cancelli di realtà delle 46 chiuse)..."
  node "$SCRIPT_DIR/sblocco-capacita.mjs" 2>&1 | esito_righe 5 || true
  echo "[$(ts)] 🧬 Cruscotto 53 capacità (7 vive + 46 scaffold)..."
  node "$SCRIPT_DIR/capacita.mjs" 2>&1 | esito_righe 3 || true
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
# BUDGET_FORCE=1 solo emergenza rarissima (Nicola): salta il tetto token.
#
# 🔓 AR-423 — QUI IL COMMENTO E LA RIGA DICEVANO IL CONTRARIO, PER SETTIMANE.
# La condizione era:
#     [ "${RUN_AI:-1}" = 1 ] && [ "${DELTA_GATE_FORCE:-0}" != 1 ] && [ "${BUDGET_FORCE:-0}" != 1 ]
# cioè chi lanciava un giro con `DELTA_GATE_FORCE=1` — documentato venti righe sopra come sinonimo di
# GIRO_FORCE per i giri a mano e per quelli chiesti dal Pannello — saltava ANCHE il tetto sui token,
# in silenzio: nessun ramo del `case` sotto poteva loggare «freno non eseguito», perché non ci si
# arrivava proprio. Due interruttori documentati come sinonimi avevano effetti di sicurezza opposti.
# Sono due cose diverse incollate nella stessa riga: «salta il risparmio» e «salta la sicurezza».
# Adesso la decisione non è più una stringa di bash che nessun test esegue: la prende
# `c4-cancelli.mjs tetto-budget` (esce 0 = consulta il freno, 10 = saltato con BUDGET_FORCE), e un
# freno spento a mano lascia una riga esplicita nel log invece di sparire.
_tetto_out="$(RUN_AI="${RUN_AI:-1}" node "$SCRIPT_DIR/c4-cancelli.mjs" tetto-budget 2>/dev/null)"; _tetto_rc=$?
if [ "$_tetto_rc" = 10 ]; then
  printf '%s\n' "$_tetto_out" >&2
  echo "[$(ts)] ⚠️  GATE-BUDGET SALTATO A MANO (AR-423): il tetto sui token non frena questo giro." >&2
fi
if [ "$_tetto_rc" = 0 ] && command -v node >/dev/null 2>&1; then
  # AR-196 — tre buchi nello stesso punto, tutti e tre «assenza letta come rassicurazione»:
  #   ① si leggeva `.oggi.token_totali`, che è 0 per costruzione (ogni registrazione passa con --stima,
  #      AR-043): il freno confrontava 0 con 2.000.000 e non poteva scattare. Misurato il 27/7: 0 reali
  #      per sei giorni di fila, 385.000 stimati nel solo 27/7.
  #   ② il `// 0` di jq trasformava «campo assente» in «zero token spesi» — un buco travestito da misura.
  #   ③ tutto il blocco era dentro `if command -v jq`: su una macchina senza jq il freno non esisteva,
  #      senza una riga di log. Ora la decisione è un programma node — lo stesso che gira nei test.
  # La decisione sta in UN posto solo (freno-costi.mjs → fonte-numero.mjs), così il test la esegue davvero.
  node "$SCRIPT_DIR/costo-ai.mjs" --json >/dev/null 2>&1 || true   # rinfresca token_per_gate nel file
  _freno_out="$(node "$SCRIPT_DIR/freno-costi.mjs" 2>/dev/null)"; _freno_rc=$?
  case "$_freno_rc" in
    1)
      RUN_AI=0
      echo "[$(ts)] ⛔ GATE-BUDGET (AR-087): ${_freno_out#*$'\t'} → motore premium FERMATO (passaggio minimo). I 🔴/controlli restano attivi."
      ;;
    2)
      # Freno cieco (AR-322): non ferma la macchina — sarebbe un blocco totale su un campo mancante —
      # ma non dice nemmeno «sotto soglia». Lo dichiara, e il motore lo riceve come vincolo.
      COSTO_VINCOLO="⛔ FRENO COSTI CIECO (AR-196): ${_freno_out#*$'\t'}. NON so quanto ha speso oggi la macchina: il tetto token non è verificabile in questo giro. Non trattarlo come «sotto soglia» — tieni il volume basso e segnala a Nicola se si ripete. Diagnosi: node cervello/freno-costi.mjs --json"
      echo "[$(ts)] ⚠️  GATE-BUDGET CIECO (AR-196): ${_freno_out#*$'\t'} → vincolo hard al motore, motore NON fermato." >&2
      ;;
  esac
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
# Lever 1 — Memoria persistente nel giro: fatti + principi + errori ricorrenti + preferenze + lezioni nette.
# Prima il giro ripartiva CIECO (contesto-lezioni.mjs non era cablato). Sola lettura, non fallisce mai.
_MEMORIA_BLOCK="$(node "$SCRIPT_DIR/contesto-lezioni.mjs" 2>/dev/null || true)"
if [ -n "$_MEMORIA_BLOCK" ]; then
  PROMPT="$PROMPT

$_MEMORIA_BLOCK"
fi
# AR-320: ELENCO UNICO DEI VINCOLI ATTIVI. Prima i 18 *_VINCOLO vivevano SOLO dentro $PROMPT: se il
# motore veniva saltato (delta-gate o tetto-token) il testo non veniva mai consumato e i cancelli si
# scioglievano in silenzio — il giro pubblicava lo stesso e usciva 0. Qui li raccogliamo in un elenco
# che esiste FUORI dal prompt, così può governare sia il salto del motore sia l'esito del giro.
#
# LOTTO 33 — AR-379/AR-387: l'elenco si DERIVA, non si enumera.
#
# Fino al 29/7 qui c'era una seconda lista scritta a mano, parallela alle variabili vere. Le
# variabili dichiarate erano 32, i nomi enumerati 27: cinque guardiani potevano diventare rossi e il
# giro si chiudeva «pulito» lo stesso. Fra i cinque c'erano FIRMA (chi può scriversi la firma di
# Nicola) e PORTE (chi pubblica su main senza cancello) — cioè due dei controlli più seri che
# abbiamo. Nessuno l'aveva fatto apposta: riempire una variabile e contarla sono due gesti separati,
# a quasi cinquecento righe di distanza, e il secondo era affidato alla memoria di chi scriveva.
#
# `compgen -v` chiede alla shell quali variabili esistono DAVVERO in questo momento: un vincolo nuovo
# entra nel conteggio per costruzione, e non c'è più un secondo posto che possa restare indietro.
# Chi vuole tenerne uno fuori lo dichiara qui sotto col perché — un'esenzione si discute, una
# dimenticanza no, perché nessuno la vede.
declare -A VINCOLI_ESCLUSI=()
# (vuoto, ed è voluto: oggi ogni vincolo dichiarato deve contare. La casella esiste per il giorno in
#  cui servirà, col motivo scritto per esteso come si fa per le esenzioni delle uscite e delle porte.)
VINCOLI_ATTIVI=()
VINCOLI_NOMI_VISTI=()
for _vvar in $(compgen -v | grep -E '_VINCOLO$' | sort); do
  _vnome="${_vvar%_VINCOLO}"
  VINCOLI_NOMI_VISTI+=("$_vnome")
  if [ -n "${VINCOLI_ESCLUSI[$_vnome]:-}" ]; then continue; fi
  eval "_vval=\"\${${_vvar}:-}\""
  [ -n "$_vval" ] && VINCOLI_ATTIVI+=("$_vnome")
done
echo "[$(ts)] AR-387: ${#VINCOLI_NOMI_VISTI[@]} vincoli dichiarati e TUTTI contati (derivati, non enumerati)." >&2
GATE_ROSSI="${#VINCOLI_ATTIVI[@]}"
if [ "$GATE_ROSSI" -gt 0 ]; then
  echo "[$(ts)] ⛔ $GATE_ROSSI vincoli ATTIVI in questo giro: ${VINCOLI_ATTIVI[*]}" >&2
fi

# ── AR-687 — DA QUANTI GIRI DICE NO? ─────────────────────────────────────────────────────────────
# Fino a oggi un vincolo era una stringa vuota o piena, e basta: un guardiano rosso da tre settimane
# occupava il prompt esattamente come uno rosso da un minuto. Il modo di misurarlo esisteva già
# (`cronicita-allarmi.mjs`, nato per AR-440) ma nel giro non lo chiamava nessuno: mancava l'aggancio,
# ed è questo. Il conto vive in `.git/` perché è lo stato di una macchina, non memoria da committare.
#
# ⚠️ Il nome NON finisce in `_VINCOLO`, ed è voluto: non è un cancello suo: è l'ETÀ dei cancelli già
# contati due righe più su. Chiamarlo `_VINCOLO` gli farebbe contare una seconda volta gli stessi
# rossi, e il conto di AR-387 mentirebbe.
#
# ⚠️ Il verdetto NON si calcola qui. La decisione sta in una funzione pura che un test può eseguire
# (`bloccoPerIlGiro`); questa parte incolla e basta. L'unica cosa che decide la shell è cosa fare
# quando il comando non parte — e non parte MAI in silenzio: un vuoto vuol dire «niente di cronico»,
# un'uscita ≠ 0 vuol dire «non l'ho misurato», e le due cose non si possono confondere.
# >>> AR-687 BLOCCO CRONICITA (il test cervello/test/vincolo-cronico.test.mjs esegue queste righe) >>>
CRONICITA_BLOCCO=""
_cron_out="$(node "$SCRIPT_DIR/cronicita-allarmi.mjs" --attivi="${VINCOLI_ATTIVI[*]:-}" --blocco 2>/dev/null)"; _cron_rc=$?
if [ "$_cron_rc" -ne 0 ]; then
  CRONICITA_BLOCCO="⚠️ NON HO POTUTO MISURARE DA QUANTI GIRI questi controlli dicono no (cronicita-allarmi.mjs rc=$_cron_rc). Tratta OGNI vincolo qui sopra come se fosse nuovo e ripetilo per intero: saltarne uno perché «tanto è vecchio», senza sapere se è vecchio, è il modo peggiore di sbagliare."
else
  CRONICITA_BLOCCO="$_cron_out"
fi
if [ -n "$CRONICITA_BLOCCO" ]; then
  PROMPT="$PROMPT

## Da quanti giri dicono no (AR-687 — l'età dei vincoli, non un vincolo in più)
$CRONICITA_BLOCCO"
fi
# <<< AR-687 BLOCCO CRONICITA <<<

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
if [ -n "${TEST_VINCOLO:-}" ]; then
  # 25/7: i test del cervello girano a ogni giro e il loro rosso arriva al motore come regola hard.
  # Prima non li lanciava nessuno: esistevano solo quando una persona li digitava a mano.
  PROMPT="$PROMPT

## Vincolo test del cervello (HARD — dal guardiano test-cervello prima di te)
$TEST_VINCOLO"
fi
if [ -n "${DEBITO_VINCOLO:-}" ]; then
  # 25/7: le previsioni scadute senza misura arrivano al motore come debito da saldare, non come
  # archivio. È la voce 2 della pagella: senza confronto col reale non c'è nessuna calibrazione.
  PROMPT="$PROMPT

## Vincolo debito di misura (HARD — dal gate calibrazione prima di te)
$DEBITO_VINCOLO"
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
if [ -n "${RISCHI_VINCOLO:-}" ]; then
  # AR-431: la mappa dei rischi è ferma da mesi — il motore deve riguardarla in questo giro, non
  # lasciare che un rischio ALTA invecchi in silenzio. Il vincolo si CONSUMA qui: calcolarlo e non
  # usarlo sarebbe la stessa malattia del lotto (un verdetto prodotto e buttato via).
  PROMPT="$PROMPT

## Vincolo mappa dei rischi (HARD — AR-431: stantia)
$RISCHI_VINCOLO"
fi
if [ -n "${CADENZE_VINCOLO:-}" ]; then
  # AR-164: una cadenza ha smesso di uscire — il motore deve dirlo a Nicola, non lasciarlo su stderr.
  PROMPT="$PROMPT

## Vincolo freschezza cadenze (HARD — AR-164: una cadenza non esce più)
$CADENZE_VINCOLO"
fi
if [ -n "${CI_VINCOLO:-}" ]; then
  # 4/8: il lavoro consegnato che non passa le prove è lavoro fermo, non lavoro fatto.
  PROMPT="$PROMPT

## Vincolo CI (HARD — una PR aperta non passa i controlli)
$CI_VINCOLO"
fi
if [ -n "${OKR_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo OKR-Squadra (HARD — AR-115: target scaduti o priorità stantie)
$OKR_VINCOLO"
fi
if [ -n "${CAL_VINCOLO:-}" ]; then
  # AR-042: il registro calibrazione ha solo voci legacy → il motore deve usare la CLI prevedi.
  PROMPT="$PROMPT

## Vincolo calibrazione (HARD — AR-042: 0 voci strutturate nel registro)
$CAL_VINCOLO"
fi
if [ -n "${AGENTI_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo registro agenti (HARD — AR-007/008: agente orfano o conteggio errato)
$AGENTI_VINCOLO"
fi
if [ -n "${FIRMA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo confine della firma (HARD — AR-119: chi esegue non può firmare se stesso)
$FIRMA_VINCOLO"
fi
if [ -n "${DEFERRAL_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo rimandi fra senior (HARD — AR-186: i due elenchi che governano i 120 divergono)
$DEFERRAL_VINCOLO"
fi
if [ -n "${PORTA_GIT_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo porta degli elenchi git (HARD — AR-339: percorsi con l'accento letti male, in silenzio)
$PORTA_GIT_VINCOLO"
fi
if [ -n "${CABLATI_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo percorsi cablati (HARD — 21/8: una correzione di Nicola del 4/7 rientrata dalla finestra)
$CABLATI_VINCOLO"
fi
if [ -n "${STASH_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo messe da parte (HARD — 21/8: 7.849 stash mai riprese, e nessun sensore che guardasse)
$STASH_VINCOLO"
fi
if [ -n "${STAMPO_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo stampo senior (HARD — AR-291: un difetto di stampo NUOVO oltre il debito dichiarato)
$STAMPO_VINCOLO"
fi
if [ -n "${ESP_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo esperimenti (HARD — AR-041/106: nessun esperimento aperto, volano cieco)
$ESP_VINCOLO"
fi
if [ -n "${NORTH_STAR_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo north-star (HARD allocazione — AR-113: stallo ≥ soglia sul 1° ordine pagato)
$NORTH_STAR_VINCOLO"
fi
if [ -n "${KEYWORD_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo keyword-owner (HARD — AR-109: doppione owner, routing ambiguo)
$KEYWORD_VINCOLO"
fi
if [ -n "${APPRENDIMENTO_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo apprendimento (HARD — Lever 1: la macchina deve imparare, non solo accumulare)
$APPRENDIMENTO_VINCOLO"
fi
if [ -n "${CORREZIONE_NICOLA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo correzione-Nicola-gate (l'area più ripetuta della memoria deve avere un freno vero)
$CORREZIONE_NICOLA_VINCOLO"
fi
if [ -n "${CHIUSURA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo tasso di chiusura (HARD — AR-566: chiudere viene prima di cercare)
$CHIUSURA_VINCOLO"
fi
if [ -n "${VERIFICA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo auto-verifica (HARD — Lever 2: refutazione vera + contratti JSON in regola)
$VERIFICA_VINCOLO"
fi
if [ -n "${PROVE_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo prove oneste (HARD — AR-330: un difetto non può nascere già chiuso)
$PROVE_VINCOLO"
fi
if [ -n "${GATE_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo freni delle lezioni (HARD — una correzione si chiude con un impedimento, non con una frase)
$GATE_VINCOLO"
fi
if [ -n "${COSTO_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo freno costi (HARD — AR-196: un campo assente non è «zero speso»)
$COSTO_VINCOLO"
fi
if [ -n "${FRESCHEZZA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo freschezza dei segnali (HARD — AR-165: un guardiano che non ha battuto non è un verde)
$FRESCHEZZA_VINCOLO"
fi
if [ -n "${VOLANO_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo volano (HARD — AR-165: il verdetto della sonda finiva in una pipe)
$VOLANO_VINCOLO"
fi
if [ -n "${FRATELLI_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo spazzata dei fratelli (HARD — una malattia nota si è allargata)
$FRATELLI_VINCOLO"
fi
if [ -n "${USCITE_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo uscite verso il mondo reale (HARD — AR-272: il cancello sta al confine, non dentro)
$USCITE_VINCOLO"
fi
if [ -n "${SCADENZE_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo scadenze (HARD — AR-147/214: un countdown si calcola, non si trascrive)
$SCADENZE_VINCOLO"
fi
if [ -n "${PAUSE_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo pause della coda (HARD — AR-159/157: una pausa è uno stato, non una frase)
$PAUSE_VINCOLO"
fi
if [ -n "${SENSORI_SPENTI_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo sensori spenti (HARD — AR-105/108: spento senza un perché è un buco, non uno stato)
$SENSORI_SPENTI_VINCOLO"
fi
if [ -n "${PORTE_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo porte di pubblicazione (HARD — AR-127: il cancello al confine, non dentro ogni esecutore)
$PORTE_VINCOLO"
fi
if [ -n "${SERRATURA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo serratura del cancello (HARD — AR-825: un verdetto che non ferma non è un freno)
$SERRATURA_VINCOLO"
fi
if [ -n "${TASSO_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo lezioni applicate (HARD — AR-178: imparare senza applicare è collezionare)
$TASSO_VINCOLO"
fi
if [ -n "${GUARDIANI_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo elenco guardiani (HARD — 29/7: la bacheca dice a Nicola chi lo protegge, e deve dire il vero)
$GUARDIANI_VINCOLO"
fi
if [ -n "${MAPPA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo mappa della macchina (HARD — 29/7: la bacheca spiega di cosa è fatta la macchina, e deve restare vera)
$MAPPA_VINCOLO"
fi
if [ -n "${LETARGO_VINCOLO:-}" ]; then
  # AR-392: il verdetto del letargo è sola lettura, quindi arriva al motore senza aspettare nessuna
  # firma. Quello che resta 🟡 è SPEGNERE, e infatti qui non si spegne niente: si dice.
  PROMPT="$PROMPT

## Vincolo letargo (AR-392: la benzina è agli sgoccioli — taglia il volume, mai i controlli)
$LETARGO_VINCOLO"
fi
if [ -n "${SOGLIE_VINCOLO:-}" ]; then
  # AR-324: se una manopola che allenta un cancello non è quella di fabbrica, il motore lo deve
  # SAPERE e Nicola lo deve LEGGERE. Un vincolo che resta nel log è un vincolo che non è arrivato.
  PROMPT="$PROMPT

## Vincolo soglie in vigore (AR-324: questo giro non gira con le soglie di fabbrica)
$SOGLIE_VINCOLO"
fi
PROMPT="$PROMPT

## Risposta in chat
Al termine restituisci a Nicola il TL;DR del briefing (5 righe + mossa n.1)."

# GIRO_START serve anche fuori dal blocco AI (costo-ai a fine giro): lo fissiamo PRIMA del gate.
GIRO_START="$(date +%s)"
ai_rc=0
# AR-320 (a): un vincolo attivo È per definizione «qualcosa è cambiato» → il delta-gate non può
# dichiarare che non c'è niente da fare. Se il motore era stato spento per assenza di delta, lo
# riaccendiamo: i cancelli vanno consegnati a qualcuno che li possa leggere.
# AR-302 — la regola («si può spegnere il motore mentre dei cancelli sono rossi?») viveva qui, in
# mezzo a milleduecento righe che nessuno può eseguire senza far girare un giro intero: per questo
# non è mai stata provata. Ora la decide `motoreSaltabile()` in cervello/esito-cadenza.mjs — funzione
# pura, interrogabile con casi finti, provata da cervello/test/esito-cadenza.test.mjs.
VINCOLI_NON_CONSEGNATI=0
if [ "${RUN_AI:-1}" != 1 ]; then
  _salt="$(node "$SCRIPT_DIR/esito-cadenza.mjs" saltabile --vincoli="${GATE_ROSSI:-0}" --motivo="${GIRO_SALTO_MOTIVO:-delta}" 2>/dev/null || echo '')"
  if printf '%s' "$_salt" | grep -q '"saltabile":false'; then
    echo "[$(ts)] ⛔ AR-320/AR-302: $GATE_ROSSI vincoli attivi (${VINCOLI_ATTIVI[*]}) — il motore NON può essere saltato dal delta-gate." >&2
    RUN_AI=1
  elif printf '%s' "$_salt" | grep -q '"vincoliNonConsegnati":true'; then
    # Saltato per budget con vincoli ancora attivi → non evaporano in silenzio: restano nell'esito.
    VINCOLI_NON_CONSEGNATI=1
    echo "[$(ts)] ⛔ AR-320: motore saltato ma $GATE_ROSSI vincoli restano ATTIVI e NON consegnati: ${VINCOLI_ATTIVI[*]}" >&2
  elif [ -z "$_salt" ]; then
    # Non ho potuto misurare: non è un verde. Prudenza — se ci sono cancelli rossi il motore si accende.
    echo "[$(ts)] ⚠️  AR-302: non ho potuto decidere se il motore è saltabile — prudenza." >&2
    [ "${GATE_ROSSI:-0}" -gt 0 ] && RUN_AI=1
  fi
fi
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
# AR-317 — «il lucchetto si prende solo alla fine: mentre l'AD scrive, un altro processo committa e
# resetta sotto». Il lucchetto git copre i comandi git, non i 45 minuti in cui il motore scrive i
# file; tenerlo per tutto quel tempo bloccherebbe il worker. Il marcatore è la distinzione che
# mancava fra «sto scrivendo» e «sto pubblicando». La trap lo toglie anche se il giro viene ucciso.
cadenza_scrittura_inizio giro
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
  # 2026-08-10 — le due cose che al giro mancavano, e che il ritmo aveva da AR-024:
  #   ① la traccia ESCE dalla macchina: senza questa riga il perché resta nel journal del VPS e da
  #      fuori si legge solo «motore-fallito» (undici giorni per capire che era il limite settimanale);
  #   ② la cadenza si RI-ACCODA con l'orario del reset, invece di sperare nel timer successivo — che
  #      con un limite settimanale trova lo stesso muro per giorni.
  # Il giro ha un ciclo suo (non passa da cadenza_ai_run): qui le chiamate vanno esplicite.
  # Il «non ce l'ho fatta» si dice: una traccia persa in silenzio riporta al difetto di partenza.
  if command -v node >/dev/null 2>&1; then
    printf '%s\n' "$_ai_out" \
      | node "$SCRIPT_DIR/errore-motore.mjs" registra --cadenza=giro --rc="$ai_rc" --repo="$REPO" >&2 \
      || echo "[$(ts)] ⚠️  Guasto del motore NON registrato in memoria: da fuori resterà invisibile." >&2
  fi
  cadenza_recupero giro "il giro di perlustrazione" "$_ai_out"
fi
# AR-300: messaggio onesto. Prima qui c'era «Giro completato.» stampato SEMPRE, anche con il motore
# fallito e tutti i cancelli rossi — ed è la riga che il worker e il Pannello leggevano come successo.
if [ "$ai_rc" -eq 0 ] && [ "${GATE_ROSSI:-0}" -eq 0 ]; then
  echo "[$(ts)] Giro completato."
elif [ "$ai_rc" -eq 0 ]; then
  echo "[$(ts)] Giro finito CON ${GATE_ROSSI} VINCOLI ANCORA ATTIVI (${VINCOLI_ATTIVI[*]}): non è un giro pulito." >&2
else
  echo "[$(ts)] Giro finito MALE: motore rc=$ai_rc${GATE_ROSSI:+, vincoli attivi: $GATE_ROSSI}." >&2
fi

# AR-083 / AR-043: stima token condivisa (motore-ai.sh). Resta STIMA → --stima.
if [ -z "${GIRO_TOKEN:-}" ]; then
  GIRO_TOKEN="$(ai_stima_token "$GIRO_START" "$PROMPT" "${_ai_out:-}")"
  GIRO_TOKEN_STIMA=1
  export GIRO_TOKEN GIRO_TOKEN_STIMA
fi

# AR-014: gate deterministico sui passi 11-12 del giro (auto-analisi + apprendimento). Se il motore
# AI li ha saltati in silenzio, questi file NON risultano aggiornati in questo giro: lo diciamo forte
# (non è un exit 0 pulito) invece di far finta di niente. Non blocca il push della memoria già scritta.
cadenza_scrittura_fine   # AR-317: il motore ha finito di scrivere — l'allineamento può ripartire
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
# AR-301: la promozione a «giro pieno» è una DICHIARAZIONE («qui è tutto aggiornato, i prossimi giri
# possono saltare il motore fino a 12h»). Prima girava sempre, anche con ai_rc≠0 o con i passi 11-12
# saltati: un giro fallito spegneva i successivi. Ora la si guadagna.
# shellcheck source=cervello/giro-esito.sh
. "$SCRIPT_DIR/giro-esito.sh"
if [ "$(giro_e_pieno "$ai_rc" "${GIRO_STEPS_OK:-1}" "${GATE_ROSSI:-0}")" = 1 ]; then
  command -v node >/dev/null 2>&1 && node "$SCRIPT_DIR/delta-gate.mjs" --segna-pieno >/dev/null 2>&1 || true
else
  echo "[$(ts)] AR-301: NON promuovo la firma a «giro pieno» (ai_rc=$ai_rc, passi_ok=${GIRO_STEPS_OK:-1}, vincoli_attivi=${GATE_ROSSI:-0}) — i prossimi giri devono rifare il lavoro, non saltarlo." >&2
fi
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
  # AR-275: prima di FIDARSI dello scanner, si prova che le sue regole mordano davvero sulle chiavi
  # che il cervello usa (campioni finti, nessun valore reale). Non blocca la pubblicazione — segnala
  # forte: uno scanner con un buco è peggio di nessuno scanner, perché rassicura.
  if ! node "$SCRIPT_DIR/scan-segreti.mjs" --prova >/dev/null 2>&1; then
    echo "[$(ts)] ⚠️  SCAN SEGRETI: una famiglia di chiavi in uso NON è coperta da nessuna regola:" >&2
    node "$SCRIPT_DIR/scan-segreti.mjs" --prova 2>&1 | esito_righe 8 >&2
  fi
  if ! node "$SCRIPT_DIR/scan-segreti.mjs" >/dev/null 2>&1; then
    SEGRETO_TROVATO=1
    echo "[$(ts)] ⛔ SCAN SEGRETI: possibile segreto nei file versionabili — sync memoria BLOCCATA." >&2
    node "$SCRIPT_DIR/scan-segreti.mjs" 2>&1 | esito_righe 12 >&2 || true
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
    node "$SCRIPT_DIR/onesta-check.mjs" "${_onesta_files[@]}" 2>&1 | esito_righe 12 >&2 || true
    if [ "${ONESTA_BLOCCA:-0}" = 1 ]; then
      ONESTA_BLOCK=1
      echo "[$(ts)] ⛔ ONESTA_BLOCCA=1: sync memoria BLOCCATA per violazioni onestà (come i segreti)." >&2
    else
      echo "[$(ts)] ⚠️  Giro marcato NON-ONESTO (WARN forte, push non bloccato). Imposta ONESTA_BLOCCA=1 per bloccarlo." >&2
    fi
  fi
fi

# 10/8 (Nicola: «guarda tutti i piani — non sono stati aggiornati; aggiungi la data con l'ultima
# volta in cui sono stati aggiornati»): riscrive in cima a ogni piano di 06-Piani la riga «Ultimo
# aggiornamento: …», misurata da git sul CORPO del piano — il blocco che il punto 9 rigenera in
# fondo non conta, altrimenti ogni piano risulterebbe aggiornato a ogni giro.
# QUI e non prima: il punto 9 ha appena riscritto quei blocchi, e la riga ne cita la data.
# Scrive solo dentro il vault (perimetro MEM_DIRS) e non pubblica: la pubblica il sync qui sotto.
# rc=2 NON è un errore del giro: è «storia di git troncata, non ho potuto misurare» — e in quel
# caso non scrive niente, invece di stampare sui piani la data del clone.
if command -v node >/dev/null 2>&1; then
  echo "[$(ts)] Data sui piani (da quanto è fermo ciascuno)..."
  _piani_out="$(node "$SCRIPT_DIR/piani-data.mjs" --scrivi 2>&1)"; _piani_rc=$?
  printf '%s\n' "$_piani_out" | tail -6
  if [ "$_piani_rc" = 2 ]; then
    echo "[$(ts)] ⚪ piani-data CIECO (rc=2): storia di git troncata — le date sui piani restano quelle di prima." >&2
  elif [ "$_piani_rc" -ne 0 ]; then
    echo "[$(ts)] ⚠️  piani-data rc=$_piani_rc: una riga della data non dice la verità — rilancia \`node cervello/piani-data.mjs --scrivi\`." >&2
  fi

  # Il gemello della riga qui sopra: quella dice DA QUANTO un piano è fermo, questo COSA dice di
  # falso mentre è fermo. Scrive l'avviso in cima ai piani smentiti dal registro-fatti (bando
  # chiuso dato per aperto, commissione vecchia, faro sbagliato) e lo toglie da solo quando piano e
  # registro tornano d'accordo. Non tocca il testo di Nicola: correggerlo è una revisione sua.
  # Qui e non prima: il punto 9 ha appena riscritto i blocchi dell'AD, che l'avviso legge e conta.
  # Non è un cancello del push: un piano che dice una cosa vecchia è una cosa da far vedere a
  # Nicola, non un motivo per tenere ferma tutta la memoria del giro.
  echo "[$(ts)] Smentite nei piani (cosa dicono di non più vero)..."
  _verita_out="$(node "$SCRIPT_DIR/piani-verita.mjs" --scrivi 2>&1)"; _verita_rc=$?
  printf '%s\n' "$_verita_out" | tail -4
  if [ "$_verita_rc" = 2 ]; then
    echo "[$(ts)] ⚪ piani-verita CIECO (rc=2): registro-fatti illeggibile o regola orfana — nessun avviso riscritto." >&2
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
    # Estrae i nomi file specifici (righe "   - NOME: TIPO") e li include nell'avviso.
    _vs_file="$(printf '%s\n' "$_vs_out" | grep -E '^[[:space:]]+-[[:space:]]' | head -5 | sed 's/^[[:space:]]*-[[:space:]]*//' | tr '\n' ' | ' | sed 's/ | $//')"
    _gate_motivi="${_gate_motivi}vault-sanità: ${_vs_file:-vault sporco (conflitti/0-byte/frontmatter o JSON rotti)}; "
    echo "[$(ts)] ⛔ VAULT-SANITÀ (pre-push): vault sporco (rc=$_vs_rc) — sync BLOCCATA." >&2
    printf '%s\n' "$_vs_out" | tail -12 >&2
  fi
else
  # FAIL-CLOSED: senza node non posso verificare né coerenza né sanità → non pubblicare.
  MEMORIA_INCOERENTE=1
  _gate_motivi="${_gate_motivi}node non disponibile: impossibile verificare coerenza/sanità (fail-closed); "
  echo "[$(ts)] ⛔ GATE MEMORIA (pre-push): node non disponibile — sync BLOCCATA (fail-closed)." >&2
fi
# ═══════════════════════════════════════════════════════════════════════════════════════════════
# 🔁 RIVERIFICA VINCOLI — AR-321: un cancello che non si rimisura è un cartello
#
# Il giro alza fino a una quarantina di vincoli, li scrive nel prompt e non li guarda più. Uno solo
# veniva rimisurato dopo il motore — la coerenza dei fatti, qui sopra (AR-104) — e infatti è l'unico
# che blocca davvero la pubblicazione. Per tutti gli altri il motore poteva ignorarli e il giro
# chiudeva lo stesso: un vincolo NON rispettato era indistinguibile, per Nicola e per il log, da un
# vincolo rispettato. La macchina poteva dichiarare tredici volte «⛔ HARD» e chiudere in verde
# tredici volte — che è il modo esatto in cui un cancello diventa rumore da ignorare.
#
# La causa non era la pigrizia: era la DEFINIZIONE. «Vincolo» voleva dire testo nel prompt, non
# condizione da soddisfare. Un'istruzione non si verifica; una condizione sì.
#
# Adesso: ogni vincolo che era rosso PRIMA del motore viene rimisurato ADESSO, eseguendo di nuovo il
# guardiano che l'aveva alzato. Chi rimisura cosa lo dice la tabella in cervello/c4-cancelli.mjs, e
# il verdetto lo decide la stessa (funzione pura, quindi provabile con casi finti):
#   · resta rosso e tocca ciò che il Pannello mostra  → NON si pubblica, come già fa AR-104;
#   · resta rosso e riguarda il resto                 → il giro esce 3, non è pulito;
#   · non è rimisurabile qui                          → si dichiara, e resta contato: ⚪ non è verde;
#   · è tornato verde                                 → il motore ha obbedito, e il giro può essere pulito.
# Questa è anche la metà mancante del conto: prima GATE_ROSSI restava quello di PRIMA del motore, e
# un giro in cui l'AD aveva sistemato tutto veniva marcato «non pulito» lo stesso.
if [ "${RUN_AI:-1}" = 1 ] && [ "${GATE_ROSSI:-0}" -gt 0 ] && command -v node >/dev/null 2>&1; then
  echo "[$(ts)] 🔁 RIVERIFICA VINCOLI (AR-321): rimisuro i ${GATE_ROSSI} cancelli che erano rossi prima del motore..."
  RIV_RIMASTI=(); RIV_RISOLTI=(); RIV_NONRIM=()
  while IFS="$(printf '\t')" read -r _rnome _rclasse _rcomando; do
    [ -z "${_rnome:-}" ] && continue
    if [ "$_rclasse" = "non-rimisurabile" ]; then
      RIV_NONRIM+=("$_rnome")
      echo "[$(ts)]   ⚪ $_rnome — da qui non lo posso rimisurare: $_rcomando" >&2
      continue
    fi
    # shellcheck disable=SC2086
    if timeout 120 node "$SCRIPT_DIR"/$_rcomando >/dev/null 2>&1; then
      RIV_RISOLTI+=("$_rnome")
    else
      RIV_RIMASTI+=("$_rnome")
      echo "[$(ts)]   ⛔ $_rnome — il vincolo era stato consegnato al motore e il guardiano dice ANCORA no." >&2
    fi
  done < <(node "$SCRIPT_DIR/c4-cancelli.mjs" riverifica-elenco "${VINCOLI_ATTIVI[@]}" 2>/dev/null)
  _riv_out="$(node "$SCRIPT_DIR/c4-cancelli.mjs" riverifica-esito \
    --rimasti="${RIV_RIMASTI[*]:-}" --risolti="${RIV_RISOLTI[*]:-}" --non-rimisurabili="${RIV_NONRIM[*]:-}" 2>/dev/null)"
  _riv_rc=$?
  printf '%s\n' "$_riv_out"
  # Il conto dei cancelli rossi diventa quello di ADESSO: quelli ancora rossi più quelli che non ho
  # potuto rimisurare (prudenza — «non l'ho potuto vedere» non è mai un verde).
  VINCOLI_ATTIVI=("${RIV_RIMASTI[@]}" "${RIV_NONRIM[@]}")
  GATE_ROSSI="${#VINCOLI_ATTIVI[@]}"
  if [ "$_riv_rc" = 2 ]; then
    MEMORIA_INCOERENTE=1
    _gate_motivi="${_gate_motivi}AR-321: vincoli consegnati al motore e NON soddisfatti su ciò che il Pannello mostra (${RIV_RIMASTI[*]}); "
    echo "[$(ts)] ⛔ AR-321: il motore non ha soddisfatto un vincolo che tocca quello che Nicola legge — sync BLOCCATA." >&2
  fi
fi

# Avviso a Nicola SUBITO (Telegram, stesso canale di notifica-approvazioni; senza chiavi = dry-run).
if [ "$MEMORIA_INCOERENTE" = 1 ] && command -v node >/dev/null 2>&1; then
  node "$SCRIPT_DIR/avviso-telegram.mjs" \
    "⚠️ MyCity: memoria incoerente/vault sporco — giro NON pubblicato ($(ts)). Dettaglio: ${_gate_motivi}La memoria resta solo sul server, il Pannello NON mostra dati non verificati." \
    2>&1 | esito_righe 2 || true
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
    # AR-127 — il motore principale usava una copia SCRITTA A MANO del cancello: aveva il perimetro
    # (AR-044) ma non il controllo del ramo, e i guardiani di verità li eseguiva prima, come vincoli
    # al motore, non come cancello davanti al push. Due implementazioni della stessa regola: quando
    # una si rafforza, l'altra non lo sa. Ora è la stessa che usano ritmo, monitora e worker.
    #
    # 🕐 AR-395 — E STA QUI, PRIMA DEL COMMIT, come negli altri tre. Prima veniva chiamato DOPO
    # `git commit`: il commit svuota lo stage, quindi il controllo del perimetro guardava un insieme
    # vuoto e rispondeva verde — «nessun file di codice» quando in realtà non c'era più niente da
    # vedere. Il cancello era stato inserito nel punto in cui c'era il push, non nel punto in cui
    # c'era il rischio, e uno 0 tornato da un metro che non ha misurato somiglia in tutto a un 0 che
    # ha misurato. Il quarto argomento (`1`) dichiara «ho del lavoro da pubblicare»: se lo stage
    # risultasse vuoto adesso, il cancello lo direbbe invece di lasciar passare.
    . "$SCRIPT_DIR/gate-pubblicazione.sh"
    if ! gate_pubblicazione "$SCRIPT_DIR" "$REPO" "$branch" 1; then
      echo "[$(ts)] ⛔ Memoria NON pubblicata: il cancello ha detto no — nessun commit, il lavoro resta nel worktree." >&2
      GIRO_PUSH_BLOCCATO=1
      GIRO_PUSH_OK=0
    else
    git "${GIT_ID[@]}" commit -q -m "giro AD: aggiorna memoria ($(ts))" || true
    if [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ]; then
      url="$(c4_git_url)"   # AR-278: nessun token nell'indirizzo — lo dà l'ambiente ad askpass
      # AR-297/AR-299 — un solo loop di pubblicazione per tutti (gate-pubblicazione.sh): controlla il
      # ramo un'ultima volta prima del push e mette il timeout di rete su fetch e push, che qui non
      # c'era. Prima erano tre copie identiche della stessa sequenza, e il timeout ce l'aveva solo il
      # worker: bastava una connessione appesa per tenere il lucchetto della memoria fino al watchdog.
      ok=0
      if attempt="$(pubblica_memoria "$url" "$branch" 3 "${GIT_NET_TIMEOUT:-60}")"; then
        echo "[$(ts)] Memoria sincronizzata su GitHub (ramo $branch, tentativo $attempt)."
        ok=1
      fi
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
              "${C4_CURL_AUTH[@]}" \
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
    fi   # AR-127/AR-395: chiude il ramo «cancello passato» (il cancello ora sta PRIMA del commit)
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
  _giro_durata_tot=$(( $(date +%s) - ${GIRO_START_TOT:-$GIRO_START} ))   # AR-204: durata VERA del processo
  if [ "${RUN_AI:-1}" != 1 ]; then
    # AR-204: qui va la durata TOTALE. Il giro saltato non è gratis — sono i guardiani, e sono la voce
    # di costo che il registro deve poter confrontare col risparmio del motore spento.
    node "$SCRIPT_DIR/costo-ai.mjs" --tipo=giro-saltato --durata-sec="$_giro_durata_tot" --token=0 --modello="delta-gate" >/dev/null 2>&1 || true
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
  node "$SCRIPT_DIR/notifica-approvazioni.mjs" 2>&1 | esito_righe 3 || true
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

# AR-300: l'ESITO DEL GIRO diventa un fatto scritto, non una riga di log. Il Pannello e il worker
# devono poter distinguere «giro pulito» da «giro finito con i cancelli rossi» senza leggere stderr.
if command -v node >/dev/null 2>&1; then
  GATE_ROSSI="${GATE_ROSSI:-0}" \
  VINCOLI_ELENCO="${VINCOLI_ATTIVI[*]:-}" \
  AI_RC="$ai_rc" \
  PUSH_OK="${GIRO_PUSH_OK:-1}" \
  STEPS_OK="${GIRO_STEPS_OK:-1}" \
  NON_CONSEGNATI="${VINCOLI_NON_CONSEGNATI:-0}" \
  HAD_CHANGES="${GIRO_HAD_CHANGES:-0}" \
  MOTORE_ESEGUITO="${RUN_AI:-1}" \
  ESITO="$(esito_giro_etichetta "$ai_rc" "${GATE_ROSSI:-0}" "${GIRO_PUSH_OK:-1}" "${GIRO_STEPS_OK:-1}" "${GIRO_HAD_CHANGES:-0}" "${RUN_AI:-1}")" \
  node -e '
    const fs=require("fs");
    const g=+process.env.GATE_ROSSI||0, ai=+process.env.AI_RC||0;
    const push=process.env.PUSH_OK==="1", steps=process.env.STEPS_OK==="1";
    // L etichetta arriva da esito_giro_etichetta (cervello/giro-esito.sh): UNA regola sola.
    // Prima qui c era una seconda copia scritta in JS, e le due si erano gia allontanate — questo
    // file diceva «vincoli-attivi» dove la funzione diceva «non-pubblicato». Due copie di una
    // regola non restano d accordo: una si aggiorna e l altra no, e nessuno se ne accorge.
    const esito = process.env.ESITO || "pulito";
    fs.writeFileSync("MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-giro.json", JSON.stringify({
      _cosa_e:"Esito REALE dell ultimo giro (AR-300). Prima il giro stampava «Giro completato.» anche a controlli tutti rossi: questo file dice la verita, e il Pannello la puo leggere.",
      // AR-629/AR-634: l ora nel fuso VERO di Piacenza (Europe/Rome), non +2h fisse — l offset
      // scolpito era quello estivo (CEST) e da fine ottobre a fine marzo timbrava un ora avanti.
      // Stessa formula di timbroOra() in cervello/registra-cadenza.mjs (sv-SE → "AAAA-MM-GG HH:MM").
      data:new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date()),
      esito, pulito: esito==="pulito",
      gate_rossi:g, vincoli_attivi:(process.env.VINCOLI_ELENCO||"").split(" ").filter(Boolean),
      ai_rc:ai, push_ok:push, passi_11_12_ok:steps,
      ha_scritto: process.env.HAD_CHANGES==="1", motore_eseguito: process.env.MOTORE_ESEGUITO==="1",
      vincoli_non_consegnati:process.env.NON_CONSEGNATI==="1"
    },null,2)+"\n");
  ' 2>/dev/null || true
fi

# Exit code per worker.sh:
#   0 = ok (o memoria salvata nonostante AI parziale)
#   1 = AI fallita e nessuna memoria nuova pubblicata
#   2 = memoria scritta ma push fallito, OPPURE gate memoria (AR-104) ha bloccato la pubblicazione
#   3 = giro concluso ma con VINCOLI ANCORA ATTIVI (AR-300/AR-320): la memoria è pubblicata, ma il
#       giro NON è pulito e non va contato come successo.
# AR-104: se il gate coerenza/sanità ha bloccato il push, NON deve essere un successo silenzioso —
# anche se GIRO_HAD_CHANGES=0 (non siamo arrivati al commit). exit 2 = "memoria NON pubblicata".
# AR-300/AR-301/AR-320: la decisione vive in cervello/giro-esito.sh — funzione pura, quindi provata
# da cervello/test/giro-esito.test.mjs con casi finti. Prima era logica sparsa qui in fondo che
# nessuno aveva mai potuto eseguire senza far girare un giro intero: per questo per mesi ha detto
# «tutto bene» anche con i cancelli rossi.
# shellcheck source=cervello/giro-esito.sh
. "$SCRIPT_DIR/giro-esito.sh"
_giro_rc="$(esito_giro_rc "${MEMORIA_INCOERENTE:-0}" "$GIRO_HAD_CHANGES" "$GIRO_PUSH_OK" "$ai_rc" "${GATE_ROSSI:-0}" "${VINCOLI_NON_CONSEGNATI:-0}" "${RUN_AI:-1}")"
# AR-164/AR-166: il giro lascia la sua riga nello STESSO registro delle altre due cadenze, con l'ora.
# Serve al guardiano freschezza-cadenze.mjs, che risponde alla domanda che nessuno faceva — non «la
# sveglia è carica?» (il timer systemd) ma «qualcuno si è alzato?». Un passo saltato (GIRO_STEPS_OK=0)
# finiva solo su stderr, «il registro tecnico del server»: da qui in poi è un fatto che sopravvive.
cadenza_registra giro "$_giro_rc" \
  "$(esito_giro_etichetta "$ai_rc" "${GATE_ROSSI:-0}" "${GIRO_PUSH_OK:-1}" "${GIRO_STEPS_OK:-1}" "$GIRO_HAD_CHANGES" "${RUN_AI:-1}")" \
  "$ai_rc" "${GIRO_PUSH_OK:-1}" "${GIRO_STEPS_OK:-1}" "${GATE_ROSSI:-0}" "${VINCOLI_ATTIVI[*]:-}"
case "$_giro_rc" in
  2) echo "[$(ts)] ⛔ MEMORIA NON PUBBLICATA (gate AR-104 o push fallito) — exit 2 (non è un successo)." >&2 ;;
  1) echo "[$(ts)] ⛔ Motore AI fallito e nessuna memoria nuova pubblicata — exit 1." >&2 ;;
  4) echo "[$(ts)] ⭕ GIRO A VUOTO: il motore è andato bene ma non ha scritto NESSUN file — exit 4. Niente briefing, niente memoria nuova, niente da pubblicare: questo giro non è successo. Guarda l'output del motore qui sopra prima di dare la colpa ai cancelli." >&2 ;;
  3) if [ "${VINCOLI_NON_CONSEGNATI:-0}" = 1 ]; then
       echo "[$(ts)] ⛔ VINCOLI NON CONSEGNATI: il motore è stato saltato mentre dei cancelli erano attivi — exit 3." >&2
     else
       # «pubblicata» solo se c'era davvero qualcosa da pubblicare: un giro senza scritture non
       # pubblica niente, e dirlo lo stesso è la bugia che teneva in piedi il giro a vuoto.
       if [ "${GIRO_HAD_CHANGES:-0}" = 1 ]; then _pubbl="La memoria è pubblicata"; else _pubbl="Non c'era memoria nuova da pubblicare"; fi
       echo "[$(ts)] ⛔ GIRO NON PULITO: ${GATE_ROSSI:-0} vincoli ancora attivi (${VINCOLI_ATTIVI[*]:-}) — exit 3. ${_pubbl}, ma questo giro non va contato come riuscito." >&2
     fi ;;
  0) [ "$ai_rc" -ne 0 ] && echo "[$(ts)] WARN: motore AI instabile ma memoria pubblicata su GitHub." >&2 ;;
esac
exit "$_giro_rc"
