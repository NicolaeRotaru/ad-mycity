#!/usr/bin/env bash
# 🚧 GATE DI PUBBLICAZIONE — il cancello che ferma la memoria bugiarda, per TUTTI i pubblicatori.
#
# AR-314 / AR-297 / AR-299. Misurato il 27/7 sui cinque pubblicatori della memoria:
#
#   file                        guardia-ramo   perimetro   timeout-rete   cancello (scan-segreti)
#   cervello/giro.sh                 1             4            0                 7
#   cervello/ritmo.sh                1             3            0                 0
#   cervello/monitora.sh             2             3            0                 0
#   cervello/worker.sh               3             2            6                 0
#
# Il cancello che impedisce di pubblicare segreti, numeri incoerenti e frasi disoneste esiste in UN
# pubblicatore su cinque. Il timeout di rete in un altro. Ogni protezione è nata dove qualcuno ha visto
# rompersi qualcosa, e non è mai stata portata nelle copie accanto: `ritmo.sh` è quasi riga per riga il
# blocco di `giro.sh` — meno il cancello.
#
# È lo stesso difetto che il 27/7 è comparso quattro volte in una sessione sola («il fix applicato a una
# copia sola»), qui alla scala del worker: il giro pubblica protetto, le cadenze no, e la porta più usata
# resta aperta.
#
# ⚠️ Questo file si LIMITA ad aggiungere protezioni. Non tocca il push che funziona: i cinque loop di
# fetch/rebase/push restano dove sono. Unificarli è AR-297 nella sua forma piena e va fatto con la
# macchina in mano, non alla cieca da un clone superficiale — pubblicare la memoria è la funzione da cui
# dipende tutto il resto, e un errore lì si vede solo quando la Cabina smette di aggiornarsi.
#
# Uso (in cima al blocco di pubblicazione, prima del commit):
#   . "$SCRIPT_DIR/gate-pubblicazione.sh"
#   if ! gate_pubblicazione "$SCRIPT_DIR" "$REPO"; then  … non pubblicare …  fi
#
# Le funzioni di DECISIONE qui sotto sono pure (nessun I/O): è l'unico modo perché un test le esegua
# invece di rileggerle. La lezione del 27/7, applicata anche qui.

# ─────────────────────────────────────────────────────────────────────────────
# DECISIONI (pure)
# ─────────────────────────────────────────────────────────────────────────────

# Il ramo su cui ci troviamo può ricevere la memoria?
#   0 = sì · 1 = no
# Solo il ramo unico della memoria (dal 6/7: `main`). Pubblicare da un ramo di lavoro abbandonato
# significa far prendere il suo posto a main — AR-315. Il worker questa guardia ce l'ha (worker.sh:216),
# gli altri no: qui diventa di tutti.
ramo_ammesso() {
  local ramo="${1:-}" atteso="${2:-main}"
  [ -n "$ramo" ] && [ "$ramo" = "$atteso" ]
}

# C'è un rebase a metà nel worktree? (AR-396 — OSSERVAZIONE, non decisione: la decisione la prende
# `decidiRebase()` in cervello/esito-scrittura.mjs.) Un albero fermo a metà rebase ha HEAD staccato
# su un avanzamento PARZIALE: pubblicarlo significa mandare su main meno di quello che c'è.
#   0 = sì, c'è un rebase in corso · 1 = albero pulito da rebase
rebase_in_corso() {
  local d
  for d in rebase-merge rebase-apply; do
    d="$(git rev-parse --git-path "$d" 2>/dev/null || true)"
    [ -n "$d" ] && [ -d "$d" ] && return 0
  done
  return 1
}

# Lo stage contiene SOLO memoria?
#   0 = sì (perimetro rispettato) · 1 = no, c'è del codice
# AR-310: `aggiorna-cervello.sh` fa `git add -A` secco e manda su main tutto quello che trova, codice
# compreso. Il codice sul server si allinea DA main, non si pubblica MAI verso main.
perimetro_ok() {
  local staged="${1:-}"
  [ -z "$(printf '%s\n' "$staged" | grep -vE '^(MyCity-Vault|consegne|creativi|memoria-squadra)/' | grep -v '^$' || true)" ]
}

# Verdetto finale del cancello, dati gli esiti dei singoli guardiani.
# Ogni argomento è un rc: 0 = passato, ≠0 = bocciato o cieco.
#   0 = si pubblica · 1 = NON si pubblica
# Fail-closed di proposito: un guardiano che non riesce a misurare vale come guardiano fallito
# (AR-322). Meglio memoria vecchia sul Pannello che memoria che mente.
gate_verdetto() {
  local segreti="${1:-0}" fatti="${2:-0}" onesta="${3:-0}" sanita="${4:-0}"
  [ "$segreti" -eq 0 ] && [ "$fatti" -eq 0 ] && [ "$onesta" -eq 0 ] && [ "$sanita" -eq 0 ]
}

# Un guardiano SPARITO non è un guardiano verde (AR-633). La regola era già scritta due righe sopra
# la chiamata: «su un server senza node il cancello dev'essere CIECO, non verde» — e vale identica
# per il FILE del guardiano: `[ -f … ] && node …` lasciava l'rc a 0 quando vault-sanita.mjs non
# c'era, cioè il pezzo mancante comprava il via libera. Un metro che non può misurare dev'essere
# cieco (e dirlo), mai verde.
#   0 = presente (si può misurare) · 1 = sparito (cieco → il cancello NON passa)
guardiano_presente() {
  [ -n "${1:-}" ] && [ -f "$1" ]
}

# Quanti secondi dare a un'operazione di rete prima di considerarla appesa.
# AR-299: senza, il lucchetto resta in mano a una connessione morta e tutti gli altri aspettano dieci
# minuti per niente. Il worker usa già questo valore; qui diventa il default di tutti.
gate_timeout_rete() {
  printf '%s\n' "${GIT_NET_TIMEOUT:-60}"
}

# ─────────────────────────────────────────────────────────────────────────────
# ESECUZIONE (I/O)
# ─────────────────────────────────────────────────────────────────────────────

# gate_pubblicazione <SCRIPT_DIR> <REPO> [ramo-atteso]
# Torna 0 se si può pubblicare, 1 altrimenti. Stampa su stderr il motivo del rifiuto.
gate_pubblicazione() {
  local dir="${1:?serve SCRIPT_DIR}" repo="${2:?serve REPO}" atteso="${3:-main}"
  local _ts; _ts="$(date '+%Y-%m-%d %H:%M')"

  # ① IL RAMO. Prima di tutto: se siamo sul ramo sbagliato non c'è niente da controllare, si esce.
  local ramo; ramo="$(git -C "$repo" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  if ! ramo_ammesso "$ramo" "$atteso"; then
    echo "[$_ts] ⛔ GATE: HEAD è su «${ramo:-?}», non su «$atteso» — NON pubblico (AR-315)." >&2
    return 1
  fi

  # ② IL PERIMETRO. Solo memoria nello stage, mai codice.
  local staged; staged="$(git -C "$repo" diff --cached --name-only 2>/dev/null || true)"
  if ! perimetro_ok "$staged"; then
    echo "[$_ts] ⛔ GATE: file di CODICE nello stage — NON pubblico (AR-310/AR-044):" >&2
    printf '%s\n' "$staged" | grep -vE '^(MyCity-Vault|consegne|creativi|memoria-squadra)/' | head -5 >&2
    return 1
  fi

  # ③ I GUARDIANI DI VERITÀ. Sono gli stessi quattro che giro.sh applica da solo dal 20/7.
  # `command -v node` perché su un server senza node il cancello dev'essere CIECO, non verde.
  if ! command -v node >/dev/null 2>&1; then
    echo "[$_ts] ⛔ GATE: node non disponibile — non posso misurare, quindi NON pubblico (AR-322)." >&2
    return 1
  fi
  # AR-633: PRIMA di misurare, i metri devono esserci. `[ -f … ] && { … }` su vault-sanita lasciava
  # l'rc a 0 a file sparito — il cancello passava CON UN GUARDIANO IN MENO, in silenzio. Scan-segreti
  # e coerenza-fatti erano coperti solo di riflesso (node esce ≠0 su un file assente): qui il
  # controllo diventa esplicito e uguale per tutti e tre, col motivo scritto invece di un rc anonimo.
  local _g
  for _g in scan-segreti.mjs coerenza-fatti.mjs vault-sanita.mjs; do
    if ! guardiano_presente "$dir/$_g"; then
      echo "[$_ts] ⛔ GATE: guardiano $_g ASSENTE in $dir — un metro sparito non è un verde: CIECO, quindi NON pubblico (AR-633)." >&2
      return 1
    fi
  done
  local rc_seg=0 rc_fat=0 rc_one=0 rc_san=0
  node "$dir/scan-segreti.mjs"   >/dev/null 2>&1 || rc_seg=$?
  node "$dir/coerenza-fatti.mjs" >/dev/null 2>&1 || rc_fat=$?
  # onesta-check vuole i file da controllare: sulla memoria interna ha falsi positivi noti (i log
  # append-only), quindi resta INFORMATIVO qui come già in giro.sh — non entra nel verdetto.
  node "$dir/vault-sanita.mjs" >/dev/null 2>&1 || rc_san=$?

  if ! gate_verdetto "$rc_seg" "$rc_fat" "$rc_one" "$rc_san"; then
    echo "[$_ts] ⛔ GATE: memoria NON pubblicabile (scan-segreti=$rc_seg coerenza-fatti=$rc_fat vault-sanita=$rc_san) — risolvi prima di ripubblicare (AR-314)." >&2
    return 1
  fi
  return 0
}

# pubblica_memoria <url> <branch> [tentativi] [timeout-rete-secondi]
# L'UNICO loop fetch→rebase→push della memoria (AR-297 nella sua forma piena, AR-299).
#
# Fino a qui la stessa sequenza esisteva in tre copie (giro.sh, ritmo.sh, monitora.sh) più quella del
# worker: identiche riga per riga, tranne che il worker aveva il timeout di rete e gli altri no. Una
# connessione appesa in un `git fetch` senza timeout tiene il lucchetto della memoria finché il
# watchdog non ammazza il processo, e tutti gli altri aspettano dieci minuti per niente.
#
# Difese, tutte in un posto solo:
#   · timeout di rete su OGNI fetch e OGNI push (default GIT_NET_TIMEOUT=60s, come il worker);
#   · ricontrollo del RAMO subito prima del push — il gate l'ha già guardato, ma tra il gate e il push
#     passano un commit e un rebase: se qualcosa ci ha spostati, qui ci si ferma (AR-315);
#   · push fast-forward e basta: mai forzato, mai --force-with-lease. Se il remoto è avanti, il rebase
#     del giro successivo recupera; sovrascrivere il lavoro del worker no.
# Stampa su stdout il numero del tentativo riuscito. Ritorna 0 se pubblicato, 1 altrimenti.
pubblica_memoria() {
  local url="${1:?serve url}" branch="${2:?serve branch}" tentativi="${3:-3}" gt="${4:-}"
  [ -n "$gt" ] || gt="$(gate_timeout_rete)"
  local T=()
  command -v timeout >/dev/null 2>&1 && T=(timeout "$gt")
  local _ts; _ts="$(date '+%Y-%m-%d %H:%M')"

  local ramo; ramo="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  if ! ramo_ammesso "$ramo" "$branch"; then
    echo "[$_ts] ⛔ PUSH ANNULLATO: HEAD è su «${ramo:-?}», non su «$branch» — non pubblico da qui (AR-297)." >&2
    return 1
  fi

  local i
  for ((i = 1; i <= tentativi; i++)); do
    # ⚠️ Tutto muto su stdout: l'unica cosa che questa funzione stampa lì è il numero del tentativo,
    # che il chiamante cattura. Il "Current branch main is up to date" del rebase finiva dentro quel
    # valore — trovato dal test che pubblica sul serio, non lo avrebbe visto nessun grep.
    if "${T[@]}" git fetch "$url" "$branch" >/dev/null 2>&1; then
      # AR-396 — il rebase aveva TRE esiti possibili e ne veniva letto zero: la catena
      # `rebase || rebase --abort || true` ingoiava anche il caso in cui l'abort stesso fallisce, e
      # si arrivava al push con l'albero A METÀ REBASE — HEAD staccato su un avanzamento PARZIALE che
      # dal remoto risulta fast-forward. Il push riusciva e su main finiva metà lavoro: verde da
      # tutte le parti. Ora l'esito lo classifica `decidiRebase()` (cervello/esito-scrittura.mjs):
      # riuscito / abortito pulito / albero sporco. Sul terzo si smette, non si pubblica.
      local _rb_rc=0 _rb_abort="" _rb_in_corso=0 _rb_dec
      git ${GIT_ID[@]+"${GIT_ID[@]}"} rebase FETCH_HEAD >/dev/null 2>&1 || _rb_rc=$?
      if [ "$_rb_rc" -ne 0 ]; then
        _rb_abort=0
        git rebase --abort >/dev/null 2>&1 || _rb_abort=$?
        rebase_in_corso && _rb_in_corso=1
        _rb_dec="$(node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" rebase \
          --rc="$_rb_rc" --rc-abort="$_rb_abort" --in-corso="$_rb_in_corso" 2>/dev/null)"
        # Nessuna risposta dalla testa = non ho potuto classificare l'albero. Fail-closed come tutto
        # il cancello (AR-322): meglio memoria vecchia sul Pannello che metà lavoro su main.
        if [ -z "$_rb_dec" ] || ! printf '%s' "$_rb_dec" | grep -q '"puoiPushare":true'; then
          local _rb_coda=""
          [ "$_rb_in_corso" = 1 ] && _rb_coda=", rebase ancora in corso"
          echo "[$_ts] ⛔ PUSH ANNULLATO (AR-396): rebase rc=$_rb_rc, abort rc=$_rb_abort$_rb_coda — non pubblico un avanzamento parziale." >&2
          return 1
        fi
      fi
    else
      echo "[$_ts] WARN: fetch non riuscito o oltre ${gt}s (tentativo $i) — provo comunque il push." >&2
    fi
    # AR-396 — il ricontrollo del RAMO al CONFINE DELL'ATTO. Il commento di questa funzione lo
    # dichiarava da sempre («subito prima del push, perché fra il gate e il push passano un commit e
    # un rebase») ma la chiamata stava FUORI dal ciclo, cioè prima del fetch e del rebase: la prova
    # che ha chiuso AR-297/AR-315 cercava la presenza del controllo, non la sua posizione.
    ramo="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
    if ! ramo_ammesso "$ramo" "$branch"; then
      echo "[$_ts] ⛔ PUSH ANNULLATO: dopo il rebase HEAD è su «${ramo:-?}», non su «$branch» (AR-396)." >&2
      return 1
    fi
    if "${T[@]}" git push "$url" "HEAD:${branch}" >/dev/null 2>&1; then
      printf '%s\n' "$i"
      return 0
    fi
    echo "[$_ts] Push tentativo $i fallito, riprovo..." >&2
    sleep 3
  done
  return 1
}
