#!/usr/bin/env bash
# lib-cadenza.sh — LE MANI CONDIVISE DELLE TRE CADENZE (giro · ritmo · monitora).
#
# La testa che DECIDE sta in `cervello/esito-cadenza.mjs` (modulo puro, provato dai test). Qui ci
# sono solo le mani: prendere un lucchetto, alzare un marcatore, lanciare il motore col timeout che
# la testa ha calcolato, scrivere l'esito che la testa ha deciso. Nessuna decisione vive in questo
# file — è la regola che ha permesso di provare il lotto invece di guardarlo.
#
# Perché esiste: giro.sh, ritmo.sh e monitora.sh sono tre copie a mano dello stesso motore di
# cadenza. Ogni protezione — lucchetto, timeout, ritentativi, esito — è nata nella copia dove il
# danno era stato visto e non è mai arrivata alle altre due. La tabella in `gate-pubblicazione.sh`
# lo aveva già misurato per il cancello di pubblicazione; questo file chiude gli assi rimasti.
#
# Uso:  . "$SCRIPT_DIR/lib-cadenza.sh"
# Richiede: REPO, SCRIPT_DIR, ts() — cioè quello che i tre script definiscono già in testa.

# ─────────────────────────────────────────────────────────────────────────────
# ① LUCCHETTO DI ESECUZIONE — AR-145 · AR-293
# ─────────────────────────────────────────────────────────────────────────────
# AR-293: «niente impedisce a due giri o a due cadenze di girare insieme: il lucchetto protegge solo
# il pezzo che parla con GitHub». Il lucchetto esistente (`.git/mycity-sync.lock`, fd 9) è nato per
# il conflitto GIT — due push in contemporanea — perché il primo danno visto era un push rifiutato.
# Il conflitto sui FILE non lo copre nessuno: due cadenze possono scrivere lo stesso vault insieme.
#
# AR-145: lo stesso buco visto dall'altro lato — Piano del mattino e Report della sera si sono
# autorilanciati 7 volte in ~100 minuti, perché `ritmo.sh` «si fida di chi lo invoca» (timer, coda
# lavori, chat) e non ha nessun «ne sta già girando uno?».
#
# Un lucchetto PER TIPO, non globale: una cadenza non deve bloccare il giro, ma non deve nemmeno
# poter partire due volte. Non bloccante (`flock -n`): il secondo esce subito con una riga invece di
# accodarsi — accodarsi significherebbe eseguire il Piano del mattino a mezzogiorno.
#
# Il descrittore si rilascia da solo quando il processo muore: un kill o un crash non lascia
# lucchetti orfani. (Questa parte del disegno esistente è corretta e va mantenuta — AR-293.)
cadenza_lock() {
  local tipo="${1:?serve il tipo di cadenza}"
  local file="${REPO:-.}/.git/MYCITY_RUN_LOCK-${tipo}"
  command -v flock >/dev/null 2>&1 || {
    echo "[$(ts)] WARN: flock assente — niente lucchetto di esecuzione per «$tipo» (AR-293)." >&2
    return 0
  }
  # fd 8 = lucchetto di ESECUZIONE (tenuto per tutto il run). fd 9 = lucchetto di SYNC git, che
  # resta com'è: sono due cose diverse, ed è averle confuse a lasciare il buco.
  exec 8>"$file" || return 0
  if ! flock -n 8; then
    echo "[$(ts)] ⏭️  Cadenza «$tipo»: ne sta già girando una (lucchetto $file) — esco senza fare nulla."
    return 1
  fi
  printf '%s %s\n' "$$" "$(date '+%Y-%m-%d %H:%M:%S')" >&8 2>/dev/null || true
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# ② MARCATORE «STO SCRIVENDO» — AR-317
# ─────────────────────────────────────────────────────────────────────────────
# «Il lucchetto si prende solo alla fine: mentre l'AD scrive, un altro processo committa e resetta
# sotto.» Il lucchetto git copre i comandi git, non i 45 minuti in cui il motore scrive i file. Non
# si può tenere il lucchetto git per tutto quel tempo (bloccherebbe il worker), quindi serve la
# distinzione che manca: «sto scrivendo» ≠ «sto pubblicando».
#
# Il marcatore si toglie con una trap, anche in caso di errore: un marcatore dimenticato bloccherebbe
# l'allineamento per sempre, ed è esattamente il modo in cui una protezione diventa un danno.
CADENZA_MARCATORE=""
CADENZA_AI_PID=""
cadenza_scrittura_inizio() {
  local tipo="${1:?serve il tipo}"
  CADENZA_MARCATORE="${REPO:-.}/.git/mycity-scrittura-in-corso"
  printf '%s %s %s\n' "$$" "$tipo" "$(date +%s)" >"$CADENZA_MARCATORE" 2>/dev/null || return 0
  # Sopravvive all'uscita normale, a Ctrl-C e al kill del watchdog.
  trap 'cadenza_interrotta' EXIT INT TERM
}

# Il gestore della trap. Non toglie SOLO il marcatore: prima ferma il motore.
#
# Toglierlo con il motore ancora vivo sarebbe una bugia peggiore del difetto di partenza — diremmo
# «ho finito di scrivere» mentre la CLI continua a scrivere nel vault, e l'allineamento partirebbe
# proprio in quel momento. Il marcatore dice «qualcuno sta scrivendo»: finché è vero, resta.
cadenza_interrotta() {
  if [ -n "${CADENZA_AI_PID:-}" ] && kill -0 "$CADENZA_AI_PID" 2>/dev/null; then
    kill -TERM "$CADENZA_AI_PID" 2>/dev/null || true
    # Un attimo per chiudere i file, poi la maniera forte.
    for _i in 1 2 3 4 5; do
      kill -0 "$CADENZA_AI_PID" 2>/dev/null || break
      sleep 1
    done
    kill -KILL "$CADENZA_AI_PID" 2>/dev/null || true
  fi
  CADENZA_AI_PID=""
  cadenza_scrittura_fine
}

cadenza_scrittura_fine() {
  [ -n "${CADENZA_MARCATORE:-}" ] && rm -f "$CADENZA_MARCATORE" 2>/dev/null
  CADENZA_MARCATORE=""
  return 0
}

# cadenza_scrittura_in_corso [eta-massima-sec] → 0 se qualcuno sta scrivendo ADESSO.
# Un marcatore più vecchio del timeout del motore è un residuo, non una scrittura viva: va ignorato,
# altrimenti un crash di ieri ferma l'allineamento di oggi.
cadenza_scrittura_in_corso() {
  local max="${1:-3600}"
  local f="${REPO:-.}/.git/mycity-scrittura-in-corso"
  [ -f "$f" ] || return 1
  local quando; quando="$(awk '{print $3}' "$f" 2>/dev/null)"
  [ -n "$quando" ] || return 1
  local eta=$(( $(date +%s) - quando ))
  [ "$eta" -ge 0 ] && [ "$eta" -lt "$max" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# ③ IL MOTORE, CON IL TIMEOUT DERIVATO E LA POLICY INTERROGATA — AR-162 · AR-201 · AR-305
# ─────────────────────────────────────────────────────────────────────────────
# Tre difetti, un ciclo solo:
#   · AR-162 — il timeout per tentativo era uguale al budget totale: i tentativi 2 e 3 non partivano
#     mai. Ora lo deriva `esito-cadenza.mjs` dal budget, e l'invariante (n×timeout + pause ≤ budget)
#     è verificata da un test invece che da un numero scritto a occhio.
#   · AR-201 — il ciclo ritentava tre volte con `sleep 30` fisso senza chiedere niente, mentre
#     `retry-policy.mjs` è la fonte unica di «si ritenta?» dal giorno di AR-092. Ora la interroga.
#   · AR-305 — `monitora.sh` non aveva NÉ timeout NÉ ciclo: una riga `"${AI_CMD[@]}" "$PROMPT" || {…}`.
#     Chiamando questa funzione lo eredita senza che nessuno debba ricordarselo.
#
# Popola: CADENZA_AI_RC (rc finale) · CADENZA_AI_OUT (ultimo output) · CADENZA_AI_TENTATIVI.
cadenza_ai_run() {
  local tipo="${1:?serve il tipo}" prompt="${2:?serve il prompt}"
  local budget="${3:-2700}" tentativi="${4:-3}" pausa="${5:-30}"

  local to
  to="$(node "${SCRIPT_DIR:-cervello}/esito-cadenza.mjs" timeout --budget="$budget" --tentativi="$tentativi" --pausa="$pausa" 2>/dev/null)"
  # Se node non risponde non inventiamo un numero: si ripiega sul budget diviso i tentativi, che è
  # comunque dentro l'invariante — mai sul budget intero, che è il difetto di partenza.
  [ -n "$to" ] || to=$(( budget / tentativi ))
  echo "[$(ts)] Motore «$tipo»: budget ${budget}s → ${to}s per tentativo × ${tentativi} (AR-162)."

  local T=()
  command -v timeout >/dev/null 2>&1 && T=(timeout --kill-after=60s "$to")

  CADENZA_AI_RC=0
  CADENZA_AI_OUT=""
  CADENZA_AI_TENTATIVI=0
  local n _tmp
  for (( n = 1; n <= tentativi; n++ )); do
    CADENZA_AI_TENTATIVI="$n"
    CADENZA_AI_RC=0
    # ⚠️ Il motore gira in BACKGROUND e si aspetta con `wait`, invece che in primo piano.
    # Non è uno sfizio: bash NON esegue le trap mentre un comando in primo piano è in corso — le
    # tiene in sospeso fino a quando quel comando finisce. Con il motore in primo piano per 45
    # minuti, un SIGTERM dal watchdog lasciava il marcatore di scrittura sul disco e bloccava ogni
    # allineamento fino alla scadenza della finestra di anzianità. `wait` invece si interrompe
    # subito sul segnale, la trap parte, il motore viene fermato e il marcatore tolto.
    # (Trovato dal test che uccide davvero il processo — un grep non lo avrebbe mai visto.)
    _tmp="$(mktemp "${TMPDIR:-/tmp}/cadenza-ai-XXXXXX")"
    "${T[@]}" "${AI_CMD[@]}" "$prompt" >"$_tmp" 2>&1 &
    CADENZA_AI_PID=$!
    wait "$CADENZA_AI_PID" || CADENZA_AI_RC=$?
    CADENZA_AI_PID=""
    CADENZA_AI_OUT="$(cat "$_tmp" 2>/dev/null)"
    rm -f "$_tmp" 2>/dev/null || true
    printf '%s\n' "$CADENZA_AI_OUT"
    [ "$CADENZA_AI_RC" -eq 0 ] && break

    if [ "$CADENZA_AI_RC" = 124 ] || [ "$CADENZA_AI_RC" = 137 ]; then
      echo "[$(ts)] Motore «$tipo» tentativo $n IN TIMEOUT (${to}s) — ucciso." >&2
    else
      echo "[$(ts)] Motore «$tipo» tentativo $n fallito (rc=$CADENZA_AI_RC)." >&2
    fi
    printf '%s\n' "$CADENZA_AI_OUT" | tail -15 >&2

    # AR-201: si CHIEDE, non si ritenta a memoria. La policy è la stessa che usa il worker.
    local _dec _ver
    _dec="$(RP_TIPO="$tipo" RP_TENTATIVI="$n" RP_RISULTATO="$CADENZA_AI_OUT" \
      timeout 20s node "${SCRIPT_DIR:-cervello}/retry-policy.mjs" decidi 2>/dev/null || echo '{}')"
    _ver="$(node "${SCRIPT_DIR:-cervello}/esito-cadenza.mjs" ritenta \
      --ai-rc="$CADENZA_AI_RC" --tentativo="$n" --tentativi="$tentativi" --policy="$_dec" 2>/dev/null || echo '{}')"
    if ! printf '%s' "$_ver" | grep -q '"ritenta":true'; then
      echo "[$(ts)] Motore «$tipo»: la retry-policy dice di NON ritentare — mi fermo al tentativo $n (AR-201)." >&2
      break
    fi
    echo "[$(ts)] Motore «$tipo»: la retry-policy dice di ritentare — pausa ${pausa}s." >&2
    sleep "$pausa"
  done
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# ③bis L'ANNUNCIO CHE VA GUADAGNATO — AR-389
# ─────────────────────────────────────────────────────────────────────────────
# «Il piano del mattino dice sempre di essere andato bene, anche quando il motore non è mai partito.»
# In `ritmo.sh` la riga «Ritmo $TIPO completato.» stava FUORI dal blocco del motore: usciva col
# delta-gate che aveva spento la parte AI, dopo tre tentativi falliti e dopo un ri-accodamento per
# rate-limit. Il codice d'uscita era giusto, la frase no — e la frase è quello che legge un umano.
#
# La cura non è un `if` in più dentro ritmo.sh: sarebbe la quarta copia della stessa catena, e la
# causa di sistema ⑤ della scheda è proprio quella («ogni cura viene applicata alla copia in cui il
# sintomo è stato visto»). La frase la decide `annuncioCadenza()` in `cervello/esito-scrittura.mjs`
# — funzione pura, provata da `cervello/test/annuncio-cadenza.test.mjs`. Qui c'è solo la mano.
#
# cadenza_annuncio <titolo> <ai_rc> <motore_acceso> [tentativi] [riaccodata] [vincoli_attivi]
# Stampa la frase con l'ora sul canale giusto — stdout se il successo è stato guadagnato, stderr in
# tutti gli altri casi — e ritorna 0/1 di conseguenza (così il chiamante può ancora ramificare).
cadenza_annuncio() {
  local titolo="${1:?serve il titolo}" ai_rc="${2:-0}" motore="${3:-1}"
  local tentativi="${4:-1}" riaccodata="${5:-0}" vincoli="${6:-0}"
  local frase rc=0
  frase="$(node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" annuncio \
    --titolo="$titolo" --ai-rc="$ai_rc" --motore="$motore" \
    --tentativi="$tentativi" --riaccodata="$riaccodata" --vincoli="$vincoli" 2>/dev/null)" || rc=$?
  # Nessuna risposta = non ho potuto misurare. ⚪ non è mai ✅: la frase lo dice e si esce da stderr.
  if [ -z "$frase" ]; then
    frase="$titolo: esito NON misurato (la testa non ha risposto) — non lo chiamo un successo."
    rc=10
  fi
  if [ "$rc" -eq 0 ]; then
    CADENZA_ANNUNCIO_OK=1
    echo "[$(ts)] $frase"
    return 0
  fi
  CADENZA_ANNUNCIO_OK=0
  echo "[$(ts)] ⛔ $frase" >&2
  return 1
}

# cadenza_uscita <codice-di-cadenza_esito>
# L'ultima clausola di AR-389: «non uscire 0 quando la cadenza non è stata prodotta». Il codice
# d'uscita eredita la verità dell'annuncio — se la frase non è stata guadagnata, 0 non è ammesso.
# La decide `codiceUscitaCadenza()` in cervello/esito-scrittura.mjs; qui si stampa e basta.
cadenza_uscita() {
  local codice="${1:-0}" finale
  finale="$(node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" uscita \
    --codice="$codice" --annuncio-ok="${CADENZA_ANNUNCIO_OK:-1}" 2>/dev/null)"
  case "$finale" in ''|*[!0-9]*) finale=2 ;; esac   # non misurato ≠ verde
  printf '%s\n' "$finale"
}

# ─────────────────────────────────────────────────────────────────────────────
# ④ L'ESITO COME FATTO SCRITTO — AR-163 · AR-313 · AR-164 · AR-166 · AR-302
# ─────────────────────────────────────────────────────────────────────────────
# cadenza_esito <tipo> <ai_rc> <cambi> <push_ok> <passi_ok> <vincoli_attivi> [elenco-vincoli]
#
# Decide il codice d'uscita (con la stessa testa del giro) E lascia la traccia sul disco, dove il
# Pannello e i guardiani la possono leggere. Senza la traccia, «la cadenza non è uscita» e «la
# cadenza è uscita male» restano indistinguibili — che è AR-164 alla radice.
#
# Stampa su stdout SOLO il codice: il chiamante fa `exit "$(cadenza_esito …)"`.
cadenza_esito() {
  local tipo="${1:?serve il tipo}" ai_rc="${2:-0}" cambi="${3:-0}" push_ok="${4:-1}"
  local passi_ok="${5:-1}" vincoli="${6:-0}" elenco="${7:-}"

  local _json
  _json="$(node "${SCRIPT_DIR:-cervello}/esito-cadenza.mjs" esito \
    --ai-rc="$ai_rc" --cambi="$cambi" --push-ok="$push_ok" --passi-ok="$passi_ok" --vincoli="$vincoli" 2>/dev/null)"

  local codice etichetta
  codice="$(printf '%s' "$_json" | sed -n 's/.*"codice":\([0-9]*\).*/\1/p')"
  etichetta="$(printf '%s' "$_json" | sed -n 's/.*"esito":"\([^"]*\)".*/\1/p')"
  # Nessuna risposta = non ho potuto misurare. Non è un verde: 2 («non pubblicato/non misurato»).
  [ -n "$codice" ] || { codice=2; etichetta="esito-non-misurato"; }

  cadenza_registra "$tipo" "$codice" "$etichetta" "$ai_rc" "$push_ok" "$passi_ok" "$vincoli" "$elenco"

  case "$codice" in
    2) echo "[$(ts)] ⛔ Cadenza «$tipo»: MEMORIA NON PUBBLICATA ($etichetta) — exit 2, non è un successo." >&2 ;;
    1) echo "[$(ts)] ⛔ Cadenza «$tipo»: motore fallito e nessuna memoria nuova — exit 1." >&2 ;;
    3) echo "[$(ts)] ⛔ Cadenza «$tipo»: $vincoli vincoli ancora attivi (${elenco:-}) — exit 3, non è pulita." >&2 ;;
    0) echo "[$(ts)] ✅ Cadenza «$tipo» pulita." >&2 ;;
  esac
  # ⚠️ stdout porta SOLO il codice: il chiamante fa `rc="$(cadenza_esito …)"`. Ogni riga di
  # chiacchiera qui dentro finirebbe DENTRO quel valore — è lo stesso inciampo già pagato in
  # `pubblica_memoria`, dove il «Current branch is up to date» del rebase finiva nel numero del
  # tentativo. Tutto il resto va su stderr.
  printf '%s\n' "$codice"
}

# cadenza_registra <tipo> <codice> <etichetta> <ai_rc> <push_ok> <passi_ok> <vincoli> [elenco]
# SOLO la scrittura della traccia, senza decidere niente.
#
# Sta a parte perché `giro.sh` ha già la sua testa provata (`cervello/giro-esito.sh`, AR-300/301/320)
# e sostituirgliela alla cieca sarebbe il modo peggiore di unificare: il giro decide col suo, ma la
# riga la lascia QUI, nello stesso registro delle altre due. Che le due teste non possano divergere
# lo dimostra il test di parità in `cervello/test/esito-cadenza.test.mjs`, non la buona volontà.
cadenza_registra() {
  local tipo="${1:?serve il tipo}" codice="${2:-2}" etichetta="${3:-sconosciuto}" ai_rc="${4:-0}"
  local push_ok="${5:-1}" passi_ok="${6:-1}" vincoli="${7:-0}" elenco="${8:-}"

  CADENZA_TIPO="$tipo" CADENZA_ESITO="$etichetta" CADENZA_CODICE="$codice" \
  CADENZA_AI_RC="$ai_rc" CADENZA_PUSH_OK="$push_ok" CADENZA_PASSI_OK="$passi_ok" \
  CADENZA_VINCOLI="$vincoli" CADENZA_ELENCO="$elenco" \
  node -e '
    const fs=require("fs"), p="MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json";
    let s={}; try{ s=JSON.parse(fs.readFileSync(p,"utf8")); }catch{}
    s._cosa_e="Esito REALE dell ultima uscita di OGNI cadenza (AR-163/164/166/302/313). Prima ogni copione decideva da se se e come dire di essere andato male, e chi taceva risultava sano: monitora.sh usciva 0 anche col push fallito. Qui la cadenza che non esce si vede, perche la sua riga invecchia.";
    s.cadenze=s.cadenze||{};
    s.cadenze[process.env.CADENZA_TIPO]={
      quando:new Date(Date.now()+2*3600*1000).toISOString().slice(0,16).replace("T"," "),
      esito:process.env.CADENZA_ESITO, codice:+process.env.CADENZA_CODICE,
      ai_rc:+process.env.CADENZA_AI_RC||0, push_ok:process.env.CADENZA_PUSH_OK==="1",
      passi_ok:process.env.CADENZA_PASSI_OK==="1", vincoli_attivi:+process.env.CADENZA_VINCOLI||0,
      vincoli:(process.env.CADENZA_ELENCO||"").split(" ").filter(Boolean)
    };
    s.aggiornato=s.cadenze[process.env.CADENZA_TIPO].quando;
    fs.writeFileSync(p, JSON.stringify(s,null,2)+"\n");
  ' 2>/dev/null || echo "[$(ts)] WARN: esito della cadenza «$tipo» non scritto su disco." >&2

  # AR-313 — la traccia anche sul canale che il Pannello legge in tempo reale (`automazione:<nome>`
  # su Supabase), la stessa riga che lasciano git-pr e git-merge. Il file su disco arriva a Nicola
  # solo dopo il push: se è proprio il push ad essere fallito, senza questa riga il fallimento non
  # arriverebbe da nessuna parte. La scheda lo chiedeva per monitora; sta qui perché valga per
  # tutte e tre — è il punto del lotto.
  CADENZA_TIPO="$tipo" CADENZA_ESITO="$etichetta" CADENZA_CODICE="$codice" \
  CADENZA_LIB="${SCRIPT_DIR:-cervello}/git-github.mjs" \
  node -e '
    import(require("node:url").pathToFileURL(process.env.CADENZA_LIB).href).then(async (m) => {
      const c = +process.env.CADENZA_CODICE;
      await m.stampSegnale(process.env.CADENZA_TIPO, c === 0 ? "ok" : "errore",
        `${process.env.CADENZA_ESITO} (uscita ${c})`);
    }).catch(() => {});
  ' >/dev/null 2>&1 || true
  return 0
}
