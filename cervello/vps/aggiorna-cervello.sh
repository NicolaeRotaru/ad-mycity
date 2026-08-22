#!/usr/bin/env bash
# aggiorna-cervello.sh — allinea il CODICE da main sul VPS e riavvia il worker.
# Il worker gira come utente «mycity»: i comandi git DEVONO essere di mycity, mai di root.
#
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"
ts() { date '+%Y-%m-%d %H:%M'; }

# ─────────────────────────────────────────────────────────────────────────────
# 🪞 SI ESEGUE DA UNA COPIA DI SÉ, e non dal file nel repo.
#
# IL GUASTO, visto sul server il 22/8 alle 11:57 e riprodotto in laboratorio.
# Più sotto questo copione mette da parte i file sporchi per far partire il rebase. Fra quei file può
# esserci — e quel giorno c'era — **sé stesso**, insieme a `conflitti-memoria.mjs`. Bash però NON
# tiene il copione in memoria: lo legge un pezzo alla volta, tenendo la posizione nel file. Se il
# file si accorcia sotto i suoi piedi, bash arriva alla fine e **si ferma in silenzio, uscendo 0**.
#
# Provato, non dedotto: un copione di quattro righe che riscrive sé stesso con una versione più corta
# esegue SOLO la prima riga e finisce con successo. Nessun errore, nessun avviso.
#
# Sul server è successo esattamente questo: la riparazione dei conflitti era arrivata, il file la
# conteneva, e non è stata eseguita — perché quando l'esecuzione ci è arrivata quel pezzo di file non
# esisteva più. Da fuori sembrava che la riparazione non funzionasse. Funzionava: non veniva letta.
#
# La cura è quella classica per i copioni che si aggiornano da soli: si lavora su una copia, che
# nessuno può cambiare mentre gira. Il marcatore evita il ciclo infinito.
if [ -z "${AGGIORNA_DA_COPIA:-}" ]; then
  _copia="$(mktemp -t aggiorna-cervello.XXXXXX.sh)"
  if cp -- "${BASH_SOURCE[0]}" "$_copia" 2>/dev/null; then
    trap 'rm -f -- "$_copia"' EXIT
    AGGIORNA_DA_COPIA=1 bash "$_copia" "$@"
    exit $?
  fi
  # Se la copia non riesce si prosegue lo stesso: meglio un allineamento fragile che nessuno.
  echo "[$(ts)] ⚠️  Non sono riuscita a lavorare su una copia di me stessa: proseguo dal file nel repo." >&2
fi

REPO="${REPO:-/opt/mycity/ad-mycity}"
APP_USER="${APP_USER:-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"
# AR-310 — il perimetro della memoria, lo stesso degli altri quattro pubblicatori. Prima qui c'era un
# `git add -A` secco: mandava su main tutto quello che trovava, CODICE compreso. Il codice sul server si
# allinea DA main, non si pubblica MAI verso main — se un file di codice è sporco va lasciato lì e
# segnalato, non committato.
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)
# AR-311/312 — le decisioni sull'esito dell'allineamento stanno in una funzione pura, provabile.
# shellcheck source=cervello/allineamento-esito.sh
. "$REPO/cervello/allineamento-esito.sh"

if [ "$(id -un)" = "root" ]; then
  echo "[$(ts)] ▶ Fix permessi repo → $APP_USER, poi allineamento senza root."
  chown -R "$APP_USER:$APP_USER" "$REPO"
  AGGIORNA_SKIP_RESTART=1 sudo -u "$APP_USER" -H env AGGIORNA_SKIP_RESTART=1 bash "$REPO/cervello/vps/aggiorna-cervello.sh"

  # AR-059: le unit systemd sono auto-modificabili come il codice → dopo l'allineamento
  # ri-propaga i file .service/.timer che differiscono da quelli installati e fai
  # 'systemctl daemon-reload', così i cambi di cadenza / nuovi timer diventano attivi
  # (senza reload systemd continua a leggere le vecchie unit). Solo root può scriverli.
  _units_changed=0
  for _u in "$REPO"/cervello/vps/mycity-*.service "$REPO"/cervello/vps/mycity-*.timer; do
    [ -f "$_u" ] || continue
    _name="$(basename "$_u")"
    if ! cmp -s "$_u" "/etc/systemd/system/$_name" 2>/dev/null; then
      cp "$_u" "/etc/systemd/system/$_name"
      echo "[$(ts)]   → unit aggiornata: $_name"
      _units_changed=1
    fi
  done
  if [ "$_units_changed" = 1 ]; then
    systemctl daemon-reload
    echo "[$(ts)] 🔧 Unit systemd ri-propagate + daemon-reload (cadenze aggiornate)."
  fi

  echo "[$(ts)] ▶ Riavvio mycity-worker + mycity-worker-chat..."
  systemctl restart mycity-worker
  systemctl restart mycity-worker-chat 2>/dev/null || true
  sleep 2
  if systemctl is-active --quiet mycity-worker; then
    echo "[$(ts)] ✓ Worker attivo. Lancia «fai un giro» dal Pannello."
  else
    echo "[$(ts)] ✗ Worker non partito — journalctl -u mycity-worker -n 30" >&2
    exit 1
  fi
  if systemctl is-active --quiet mycity-worker-chat 2>/dev/null; then
    echo "[$(ts)] ✓ Worker chat attivo (streaming + parziali)."
  else
    echo "[$(ts)] ⚠ Worker chat non attivo — journalctl -u mycity-worker-chat -n 20" >&2
  fi
  exit 0
fi

cd "$REPO"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

branch="${GIT_BRANCH:-main}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-98592323+NicolaeRotaru@users.noreply.github.com}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity VPS}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
LOCK="$REPO/.git/mycity-sync.lock"

if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
  echo "[$(ts)] ERRORE: GIT_PUSH_TOKEN e GIT_REPO obbligatori nel .env" >&2
  exit 1
fi

# Verifica permessi .git (errore tipico: aggiornamenti fatti come root).
if ! test -w "$REPO/.git/config" 2>/dev/null; then
  echo "[$(ts)] ERRORE: .git/config non scrivibile da $(id -un)." >&2
  echo "  Esegui come root: sudo chown -R $APP_USER:$APP_USER $REPO" >&2
  exit 1
fi

# GIT_REMOTE_URL: cucitura per i test (default invariato in produzione).
url="${GIT_REMOTE_URL:-https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git}"

echo "[$(ts)] ▶ Allineamento codice da main (vault intatto) come $(id -un)..."
exec 9>"$LOCK"
flock -w 120 9

# AR-317 — L'ALTRA METÀ DEL DIFETTO.
# «Il lucchetto si prende solo alla fine: mentre l'AD scrive, un altro processo committa e resetta
# sotto.» Questo script è quell'altro processo: prende il lucchetto git (che il giro NON tiene mentre
# scrive, e non potrebbe — sono 45 minuti) e più sotto fa `git checkout -f -B`, che strappa via il
# lavoro a metà. Il lucchetto non basta perché i due non competono sulla stessa cosa: uno pubblica,
# l'altro scrive.
# Ora c'è il marcatore. Se una cadenza sta scrivendo ADESSO, questo allineamento si rimanda (rc=3)
# senza toccare il worktree; un marcatore vecchio è un residuo di un run morto e si ignora, se no una
# cadenza crashata bloccherebbe gli allineamenti per sempre.
SCRIPT_DIR_CERVELLO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -r "$SCRIPT_DIR_CERVELLO/lib-cadenza.sh" ]; then
  REPO="$REPO" . "$SCRIPT_DIR_CERVELLO/lib-cadenza.sh"
  if cadenza_scrittura_in_corso "${CADENZA_SCRITTURA_MAX_SEC:-3600}"; then
    echo "[$(ts)] ⏭️  Una cadenza sta SCRIVENDO nel vault (marcatore .git/mycity-scrittura-in-corso) — allineamento rimandato (AR-317)." >&2
    exit 3
  fi
fi

if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ] && [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  # AR-467 — PRIMA di committare, guarda se c'è già un arretrato non pubblicato. Se c'è, un altro
  # commit non salva niente: allontana il ramo, rende il rebase più difficile e prepara il fallimento
  # del giro dopo. È il ciclo che il 30/7 ha prodotto 1519 commit in 31 ore senza pubblicarne uno.
  git fetch "$url" "$branch" 2>/dev/null || true
  _arretrato="$(git rev-list --count "FETCH_HEAD..HEAD" 2>/dev/null || echo 0)"
  if [ "$(deve_committare_recupero "${_arretrato:-0}")" = no ]; then
    echo "[$(ts)] ⏸️  Scritture pendenti NON committate: ci sono già ${_arretrato} commit non pubblicati (AR-467). Prima si pubblica, poi si committa." >&2
  else
    git add -A "${MEM_DIRS[@]}" 2>/dev/null || true   # AR-310: solo memoria, mai codice
    # AR-314 — anche il recupero delle scritture pendenti passa dal cancello: è un commit su main come
    # gli altri, e finora era l'unico che non guardava niente prima di farlo.
    if ! ( . "$REPO/cervello/gate-pubblicazione.sh"; gate_pubblicazione "$REPO/cervello" "$REPO" "$branch" ); then
      echo "[$(ts)] ⛔ Scritture pendenti NON committate: il cancello ha detto no (restano sul server)." >&2
      git reset HEAD -- . 2>/dev/null || true
    else
      git "${GIT_ID[@]}" commit -q -m "recupero: scritture pendenti ($(ts))" 2>/dev/null || true
    fi
  fi
fi

# 🔓 IL CODICE SI ALLINEA ANCHE QUANDO LA MEMORIA NON SI PUBBLICA.
# Portare il codice da main è a SENSO UNICO: tocca solo i path di codice, non sfiora la memoria del
# server e non ha bisogno che il rebase o il push riescano. Pubblicare la memoria è un'altra cosa, e
# può restare bloccata per giorni quando le due storie divergono.
# Fino al 20/8 le due stavano dietro allo STESSO `exit`: quando il push dei commit pendenti falliva
# si usciva PRIMA di arrivare all'allineamento del codice, e il server smetteva di ricevere fix.
# Dodici giorni e 3442 tentativi dopo, la riparazione del lucchetto mergiata su main non era mai
# arrivata al server — e la macchina non era più riparabile da remoto proprio mentre serviva
# ripararla. Un guasto della memoria non deve togliere le mani a chi ripara.
allinea_codice_da_main() {
  local code_paths=() p f
  while IFS= read -r p; do
    case "$p" in MyCity-Vault|consegne|creativi|memoria-squadra) ;; *) code_paths+=("$p") ;; esac
  done < <(git ls-tree --name-only FETCH_HEAD)
  [ "${#code_paths[@]}" -gt 0 ] || return 0
  # 1) Porta da main aggiunte + modifiche dei path di CODICE.
  git checkout FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null || true
  # 2) Propaga le CANCELLAZIONI: git checkout NON rimuove i file che main ha eliminato
  #    (es. cervello/vps/.env.save di AR-004) → restavano vivi sul ramo che serve il Pannello.
  while IFS= read -r f; do
    [ -n "$f" ] && git rm -q -f --ignore-unmatch -- "$f" 2>/dev/null || true
  done < <(git diff --name-only --diff-filter=D HEAD FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null)
  git "${GIT_ID[@]}" commit -q -m "aggiorna-cervello: allinea codice a main ($(ts))" 2>/dev/null || true
  echo "[$(ts)] Codice allineato a origin/main (incluse cancellazioni)."
  return 0
}

# Commit locali già fatti ma non pushati: pubblicali PRIMA del checkout -f (altrimenti si perdono).
if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ]; then
  git fetch "$url" "$branch" 2>/dev/null || true
  _ahead_pre="$(git rev-list --count "FETCH_HEAD..HEAD" 2>/dev/null || echo 0)"
  if [ "${_ahead_pre:-0}" -gt 0 ] 2>/dev/null; then
    echo "[$(ts)] ▶ Push di ${_ahead_pre} commit pendenti su origin/${branch} (prima dell'allineamento)..."
    _ok_pre=0
    _perche_rebase=""
    for _a in 1 2 3; do
      # AR-469 — il rebase NON parte se restano modifiche tracciate non messe in staging, e sul server
      # ce ne sono sempre: i file dati che la macchina si riscrive vivono in `cervello/`, che non entra
      # mai in staging. Niente elenco di file — la domanda è generale, così un quarto file dati domani
      # non rimette la trappola.
      #
      # 2026-08-21 — DUE BUCHI IN QUESTE RIGHE, pagati con 7.849 stash e giorni di server fermo:
      #   ① si metteva da parte solo il TRACCIATO, ma il server veniva respinto da file NON tracciati
      #      («untracked working tree files would be overwritten»). Il rimedio spostava l'ostacolo
      #      sbagliato: il rebase restava fermo e la stash nasceva lo stesso, ogni minuto.
      #   ② la stash non si riprendeva MAI — in tutto il repo non esisteva un `git stash pop`. Il giro
      #      dopo ritrovava l'albero pulito, credeva che il guasto fosse passato, e ricominciava.
      # Adesso è un PRESTITO: si mette da parte ciò che blocca DAVVERO (incluso il non tracciato che i
      # commit in arrivo rivendicano) e si restituisce sempre, riuscito o fallito che sia il rebase.
      _stash_fatta=0
      _in_arrivo="$(git ls-tree -r --name-only FETCH_HEAD 2>/dev/null || true)"
      _da_parte="$(paths_da_mettere_da_parte "$(git status --porcelain 2>/dev/null)" "$_in_arrivo")"
      if [ -n "$_da_parte" ]; then
        # -u perché nell'elenco possono esserci file NON tracciati; i percorsi perché il perimetro
        # deve restare stretto: mai portare via il non tracciato che nessuno rivendica.
        _stash_argv=(stash push -u -m "aggiorna-cervello: prestito prima del rebase ($(ts))" --)
        while IFS= read -r _p; do [ -n "$_p" ] && _stash_argv+=("$_p"); done <<< "$_da_parte"
        if git "${GIT_ID[@]}" "${_stash_argv[@]}" >/dev/null 2>&1; then
          _stash_fatta=1
          echo "[$(ts)] 📦 Prestito prima del rebase: $(printf '%s' "$_da_parte" | tr '\n' ' ')" >&2
        fi
      fi
      # AR-468 — l'uscita del rebase si TIENE. Prima finiva in /dev/null e il messaggio d'errore
      # accusava il token: 31 ore mandate a cercare dove non c'era niente.
      if git fetch "$url" "$branch" 2>/dev/null; then
        if ! _perche_rebase="$(git "${GIT_ID[@]}" rebase FETCH_HEAD 2>&1)"; then
          # 22/8 — I CONFLITTI CHE NESSUNO RISOLVEVA.
          # Il giorno prima avevamo tolto l'ostacolo che impediva al rebase di PARTIRE. Il mattino
          # dopo parte, e si ferma qui: «il rebase ha trovato conflitti: vanno risolti a mano». Sul
          # server «a mano» vuol dire mai, e i commit si accumulano — erano 12 alle 09:20. È la
          # stessa malattia di ieri in un altro punto: chi sa rimandarsi, senza un tetto, rimanda
          # per sempre.
          # Sui file di MEMORIA la risposta è meccanica e sta in `conflitti-memoria.mjs`: registri
          # rigenerati → la copia di main; quaderni e diari → entrambe le parti; archivi a id →
          # unione. Su tutto il resto quell'attrezzo RIFIUTA e non tocca niente: se fra i conflitti
          # c'è del codice, si torna ad annullare come prima. Meglio fermi che risolti a caso.
          # ⚠️ L'uscita del risolutore si TIENE. Al primo tentativo finiva in /dev/null, e cosi'
          # «ha rifiutato perche' c'e' del codice fra i conflitti» e «non e' nemmeno partito» erano
          # la stessa cosa: due guasti diversi con due cure diverse, resi indistinguibili da un
          # reindirizzamento. E' successo davvero — un modulo mancante lo uccideva prima di
          # accendersi, e da fuori sembrava una decisione. E' lo stesso errore di AR-468.
          # Nessun «se il file esiste» davanti alla chiamata: un attrezzo invocato solo quando c'è
          # sparisce in silenzio quando non c'è, e il silenzio somiglia a una decisione. Si prova e
          # basta — se manca il file o manca node, l'errore lo dice la riga sotto, con il suo nome.
          _perche_conflitti=""
          if _perche_conflitti="$(node "$REPO/cervello/conflitti-memoria.mjs" --applica --repo "$REPO" 2>&1)"; then
            if _perche_rebase="$(GIT_EDITOR=true git "${GIT_ID[@]}" rebase --continue 2>&1)"; then
              echo "[$(ts)] 🧩 Conflitti di MEMORIA risolti da soli (nessuna riga persa): il rebase è andato avanti." >&2
              _perche_rebase=""
            else
              git rebase --abort 2>/dev/null || true
            fi
          else
            [ -n "$_perche_conflitti" ] && echo "[$(ts)] 🧩 I conflitti NON si risolvono da soli: $(printf '%s' "$_perche_conflitti" | head -2 | tr '\n' ' ')" >&2
            git rebase --abort 2>/dev/null || true
          fi
        else
          _perche_rebase=""
        fi
      fi
      _push_ok=0
      if git push "$url" "HEAD:${branch}" 2>&1; then
        echo "[$(ts)] ✓ Commit pendenti pubblicati su GitHub."
        _push_ok=1
      fi
      # 🔁 IL PRESTITO SI RESTITUISCE — riuscito o fallito che sia il tentativo.
      # Questa è la riga che non esisteva. Senza, ogni minuto nasceva una stash e nessuno la
      # riprendeva: 7.849 messe da parte, e il giro dopo ripartiva da un albero pulito credendo che
      # il guasto fosse passato. Se il pop CONFLIGGE la stash resta — ma allora lo si DICE, invece di
      # lasciarla in silenzio come prima.
      if [ "$_stash_fatta" = 1 ]; then
        if git "${GIT_ID[@]}" stash pop >/dev/null 2>&1; then
          _stash_fatta=0
        else
          # NON si "ripulisce" con checkout/reset: sarebbero comandi che buttano, e qui dentro c'è
          # lavoro vero. Il pop fallito lascia la stash intatta — quindi il lavoro c'è ancora, e la
          # cosa giusta è dirlo forte invece di sistemare a tentoni.
          echo "[$(ts)] ⚠️  Il prestito NON è tornato indietro pulito: la stash resta ed è ancora tutta lì (git stash list). Va guardata a mano." >&2
        fi
      fi
      [ "$_push_ok" = 1 ] && { _ok_pre=1; break; }
      sleep 3
    done
    # AR-311 — qui prima c'era solo un echo, e l'esecuzione TIRAVA DRITTO fino al `checkout -f`
    # che quei commit li butta: il lavoro del server spariva per un errore di rete. Un avviso su
    # stderr non è una difesa. Ora ci si ferma con un codice dedicato: watch-main NON segna lo SHA,
    # il lavoro resta sul server e si riprova al prossimo giro.
    if [ "$_ok_pre" != 1 ]; then
      _rc_all="$(esito_allineamento 0 1 0)"
      echo "[$(ts)] ⛔ $(motivo_allineamento "$_rc_all") — ${_ahead_pre} commit restano qui." >&2
      echo "[$(ts)]    Causa: $(motivo_push_fallito "$_perche_rebase")" >&2
      # La causa esce dalla macchina: watch-main la infila nel segnale che il Pannello legge. Su
      # stderr resterebbe nel journal del server, cioè invisibile a chiunque non possa entrarci.
      printf '%s (%s commit fermi qui)\n' "$(motivo_push_fallito "$_perche_rebase")" "$_ahead_pre" \
        > "$REPO/.git/mycity-allineamento-causa" 2>/dev/null || true
      # La memoria resta qui, ma il CODICE si allinea lo stesso: è a senso unico e non tocca i
      # commit del server. Senza questa riga un server che non riesce a pubblicare smette anche di
      # RICEVERE le riparazioni — ed è così che si diventa irreparabili da remoto.
      if git fetch "$url" main 2>/dev/null; then
        allinea_codice_da_main
      else
        echo "[$(ts)]    (fetch di main fallito: il codice NON si allinea in questo giro)" >&2
      fi
      exit "$_rc_all"
    fi
    rm -f "$REPO/.git/mycity-allineamento-causa" 2>/dev/null || true
  fi
fi

# 🛡️ RACE col lavoro vivo (10/7): se una sessione chat sta lavorando ORA su un branch fix/*
# (HEAD fuori da main con commit fresco, oppure modifiche di CODICE non committate), il
# checkout -f qui sotto le strapperebbe HEAD da sotto i piedi (il commit atterra su main
# locale — successo alle 18:05 con fix/chat-parla-casella-ux) e il -f SCARTEREBBE le modifiche
# non committate. In quel caso RIMANDIAMO l'allineamento (exit 3): watch-main NON segna lo SHA
# come visto e riprova tra 5 minuti. Fuga anti-stallo: un branch fermo da >30 min e senza
# sporco di codice è abbandonato → si allinea comunque come prima.
_cur_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "$branch")"
if [ "$_cur_branch" != "$branch" ] && [ "$_cur_branch" != "HEAD" ]; then
  _tip_epoch="$(git log -1 --format=%ct 2>/dev/null || echo 0)"
  _tip_age_min=$(( ( $(date +%s) - _tip_epoch ) / 60 ))
  _dirty_codice=0
  if git status --porcelain 2>/dev/null | cut -c4- | grep -qvE '^(MyCity-Vault|consegne|creativi|memoria-squadra)/'; then
    _dirty_codice=1
  fi
  # 2026-08-21 — la decisione non si improvvisa più qui dentro: la prende `azione_ramo_vivo`, che è
  # pura e che una prova può ESEGUIRE. Il buco che chiude: prima bastava UN file di codice sporco per
  # spegnere del tutto la fuga anti-stallo, e il rinvio non scadeva mai (422 rinvii il 18/8, 1716 il
  # 30/7). Ora l'attesa ha un tetto: oltre, il lavoro si PARCHEGGIA e si allinea.
  _azione="$(azione_ramo_vivo "$_cur_branch" "$branch" "$_tip_age_min" "$_dirty_codice" \
      "${ALLINEAMENTO_LAVORO_MIN:-30}" "${ALLINEAMENTO_STALLO_MAX_MIN:-240}")"
  case "$_azione" in
    rimanda)
      echo "[$(ts)] ⏸ Allineamento RIMANDATO: lavoro in corso sul branch '$_cur_branch' (ultimo commit ${_tip_age_min} min fa, sporco codice=$_dirty_codice) — riprovo al prossimo watch-main."
      exit 3
      ;;
    libera)
      # Il worktree è piantato da ore su un ramo che nessuno sta più toccando, ma con roba non
      # committata sopra. Non si butta NIENTE: si committa dov'è — il ramo resta nel repo e il
      # lavoro si riprende con `git checkout '$_cur_branch'` — e solo dopo si allinea.
      echo "[$(ts)] ⛔ Branch '$_cur_branch' PIANTATO da ${_tip_age_min} min con modifiche di codice non committate: parcheggio il lavoro e allineo (la memoria non usciva più)." >&2
      git add -A 2>/dev/null || true
      if git "${GIT_ID[@]}" commit -q -m "parcheggio automatico: lavoro fermo da ${_tip_age_min} min su ${_cur_branch} ($(ts))" 2>/dev/null; then
        echo "[$(ts)] Lavoro parcheggiato su '$_cur_branch': si recupera con 'git checkout $_cur_branch'." >&2
      else
        # Non sono riuscita a metterlo al sicuro: allora NON allineo. Rimandare lascia il server
        # indietro; tirare dritto col checkout -f cancellerebbe il lavoro. La prima è recuperabile.
        echo "[$(ts)] ⛔ Parcheggio FALLITO su '$_cur_branch': NON allineo, il checkout cancellerebbe lavoro non salvato." >&2
        printf 'parcheggio fallito sul ramo %s: lavoro non committato a rischio, allineamento fermo\n' "$_cur_branch" \
          > "$REPO/.git/mycity-allineamento-causa" 2>/dev/null || true
        exit 3
      fi
      ;;
    *)
      echo "[$(ts)] Branch '$_cur_branch' fermo da ${_tip_age_min} min e senza sporco di codice: lo considero abbandonato, allineo a main."
      ;;
  esac
fi

# AR-312 — il fetch NON si silenzia più con un `|| true`: se fallisce, il ramo verrebbe "allineato"
# a se stesso (FETCH_HEAD è ancora quello di prima) e il copione uscirebbe 0 — watch-main segnerebbe
# lo SHA come visto e non ci riproverebbe MAI più. Il server resta indietro dicendo che va bene.
if ! git fetch "$url" "$branch" 2>/dev/null; then
  _rc_all="$(esito_allineamento 1 0 0)"
  echo "[$(ts)] ⛔ $(motivo_allineamento "$_rc_all")" >&2
  exit "$_rc_all"
fi

# 🛟 AR-388 — IL FRENO AL CONFINE DELL'ATTO, non dentro il ramo che l'ha fatto vedere.
# Novanta righe più in su il recupero delle scritture pendenti ha DUE uscite che non committano
# niente — il cancello dice no (AR-314), oppure c'è già un arretrato non pubblicato (AR-467) — e
# tutte e due stampano «restano sul server» e proseguono fino a QUESTA riga, che le butta. La frase
# era falsa nel momento in cui è stata scritta.
# Mettere un `if` dentro quei due rami sarebbe la stessa malattia spostata di dieci righe: il terzo
# ramo che nascerà domani non lo erediterebbe. Il freno sta qui, sul DATO — «c'è memoria scritta e
# non salvata?» — e chi decide è una funzione pura che un test può eseguire
# (`decidiPrimaDelCheckout` in cervello/scritture-a-rischio.mjs).
# La messa da parte NON è una cancellazione: la stash resta, `git stash list` la mostra, e il giro
# dopo la ritrova. Se invece la messa da parte non riesce, NON si prosegue: si esce col codice 5,
# quello che watch-main già sa leggere come «non segnare lo SHA, il lavoro è ancora qui».
_azione_salvataggio=metti-da-parte   # cieco non è «procedi»: il default protegge
if command -v node >/dev/null 2>&1 && [ -f "$REPO/cervello/scritture-a-rischio.mjs" ]; then
  _porcelain="$(git status --porcelain -- "${MEM_DIRS[@]}" 2>/dev/null || true)"
  _azione_salvataggio="$(printf '%s\n' "$_porcelain" \
    | node "$REPO/cervello/scritture-a-rischio.mjs" decidi 2>/dev/null || true)"
  case "$_azione_salvataggio" in procedi|metti-da-parte) : ;; *) _azione_salvataggio=metti-da-parte ;; esac
fi
if [ "$_azione_salvataggio" = "metti-da-parte" ]; then
  _stash_out=""
  if _stash_out="$(git "${GIT_ID[@]}" stash push -u -m "aggiorna-cervello: memoria non committata, messa al sicuro prima dell'allineamento ($(ts))" -- "${MEM_DIRS[@]}" 2>&1)"; then
    case "$_stash_out" in
      *"No local changes"*|*"Nessuna modifica locale"*) : ;;
      *) echo "[$(ts)] 📦 Memoria non committata messa al sicuro prima del checkout -f (git stash list per riprenderla) — AR-388." ;;
    esac
  else
    _rc_all="$(esito_allineamento 0 1 0)"
    echo "[$(ts)] ⛔ NON allineo: c'è memoria scritta e non salvata e non sono riuscito a metterla da parte — il checkout -f la cancellerebbe (AR-388)." >&2
    printf '%s\n' "$_stash_out" | head -3 >&2
    exit "$_rc_all"
  fi
fi
git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null || git checkout -f -B "$branch" 2>/dev/null || true

# 📍 LA POSIZIONE SI CONTROLLA, NON SI DÀ PER FATTA (12/8 — due giorni di macchina ferma).
# La riga qui sopra finiva col suo `|| true` e basta. Se entrambi i checkout fallivano, il copione
# tirava dritto: aggiornava i FILE da main e stampava «✓ Allineamento completato», mentre HEAD
# restava STACCATO su un commit vecchio. Sul server si vedeva `## HEAD (no branch)` mezz'ora dopo
# un allineamento «riuscito». Da lì la memoria ha smesso di uscire per 31 ore (la pubblicazione si
# rifiuta se non sei sul ramo) e i fix mergiati non venivano più caricati (il file su disco era più
# avanti del commit staccato, e la guardia anti-manomissione leggeva quella differenza come codice
# toccato a mano). Tre sintomi, una riga.
# È il quarto caso della regola scritta in cima ad allineamento-esito.sh, applicata al passo che
# nessuno aveva coperto: quello che sposta la posizione.
_head_ora="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if [ "$_head_ora" != "$branch" ]; then
  _rc_all="$(esito_allineamento 1 1 0 0)"
  echo "[$(ts)] ⛔ $(motivo_allineamento "$_rc_all") — HEAD è su '$_head_ora', non su '$branch'." >&2
  echo "[$(ts)]    Rimedio: git checkout -B $branch FETCH_HEAD (se si lamenta di modifiche locali, mettile da parte con git stash push prima)." >&2
  exit "$_rc_all"
fi

# Fetch di main NON silenziato: se fallisce, FETCH_HEAD resterebbe quello di $branch (riga sopra)
# e l'"allineamento" diventerebbe un no-op silenzioso (allinea il ramo a se stesso). Fermiamoci.
if ! git fetch "$url" main; then
  # AR-312 — prima qui si stampava l'errore e si TIRAVA DRITTO fino a `exit 0`: il codice non veniva
  # allineato ma watch-main segnava lo SHA come visto. «Ho saltato l'allineamento» e «ho allineato»
  # finivano nello stesso esito. Regola: se un passo non è riuscito, lo SHA non si segna.
  _rc_all="$(esito_allineamento 1 0 0)"
  echo "[$(ts)] ⛔ $(motivo_allineamento "$_rc_all") — allineamento codice SALTATO." >&2
  exit "$_rc_all"
else
  allinea_codice_da_main
fi

# AR-023: RICONCILIA IL CANTIERE appena il codice è allineato a main. È il percorso "immediato": watch-main
# rileva main avanzato (≈5 min), qui allineiamo il codice E chiudiamo i difetti il cui fix è ORA presente
# (prova verifica:{file,pattern}). La chiusura viene committata e pubblicata sul ramo della memoria (main) dal push qui sotto
# → il Pannello non mostra più "in-corso" un fix già mergiato. Sola lettura del codice + bookkeeping memoria.
if command -v node >/dev/null 2>&1; then
  node cervello/auto-fix.mjs verifica --applica 2>&1 | tail -6 || true
  ac="MyCity-Vault/90-Memoria-AI/auto-coscienza"
  # 2026-08-21 — UN COMMIT METTE DENTRO SOLO CIÒ CHE IL SUO MESSAGGIO DICHIARA.
  # Qui c'era `git add "$ac"`: tutta la cartella. Alle 20:07 quel commit — intitolato «chiude difetti
  # risolti nel codice» — ha pubblicato QUATTRO file, e fra questi `apprendimento.json` è passato da
  # 531 lezioni a 529. Due lezioni arrivate su main da altrettante PR firmate, cancellate da un commit
  # che parlava d'altro (confronto id per id: aggiunte 0, modificate 0, perse 2).
  #
  # `git add <cartella>` non mette in staging quello che il lavoro ha fatto: mette quello che nella
  # cartella è sporco. Su una macchina che gira in continuo qualcos'altro scrive sempre lì dentro, e
  # sporcare un file bastava a pubblicarlo. Adesso il perimetro è dichiarato in
  # `cervello/riconcilia-perimetro.mjs` (i due archivi che auto-fix.mjs scrive davvero) e provato da
  # `cervello/test/commit-che-porta-piu-di-quel-che-dice.test.mjs`.
  _da_committare="$(git status --porcelain "$ac" 2>/dev/null | node cervello/riconcilia-perimetro.mjs 2>/tmp/riconcilia-intrusi.$$)"
  if [ -s /tmp/riconcilia-intrusi.$$ ]; then
    # Gli intrusi si DICHIARANO, non si portano dietro: restano sporchi sul disco e chi li ha scritti
    # se li pubblica sotto il proprio nome. Il silenzio qui è come li abbiamo persi.
    sed "s/^/[$(ts)] /" /tmp/riconcilia-intrusi.$$ >&2
  fi
  rm -f /tmp/riconcilia-intrusi.$$
  if [ -n "$_da_committare" ]; then
    # shellcheck disable=SC2086 # percorsi senza spazi, uno per riga, prodotti dal perimetro
    echo "$_da_committare" | while IFS= read -r _f; do [ -n "$_f" ] && git add -- "$_f" 2>/dev/null || true; done
    git "${GIT_ID[@]}" commit -q -m "riconcilia: chiude difetti risolti nel codice ($(ts))" 2>/dev/null || true
    echo "[$(ts)] 🔧 Riconciliazione cantiere: difetti verificati chiusi (verranno pubblicati su ${branch})."
  fi
fi

git fetch "$url" "$branch" 2>/dev/null || true
_ahead="$(git rev-list --count "FETCH_HEAD..HEAD" 2>/dev/null || echo 0)"
if [ "${_ahead:-0}" -gt 0 ] 2>/dev/null; then
  echo "[$(ts)] ▶ Push di ${_ahead} commit su origin/${branch}..."
  _ok=0
  for _a in 1 2 3; do
    git fetch "$url" "$branch" 2>/dev/null \
      && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
    if git push "$url" "HEAD:${branch}" 2>/dev/null; then
      echo "[$(ts)] ✓ Memoria/codice pubblicati su GitHub (ramo ${branch})."
      _ok=1; break
    fi
    sleep 3
  done
  [ "$_ok" = 1 ] || echo "[$(ts)] ✗ Push fallito — controlla GIT_PUSH_TOKEN." >&2
fi

exec 9>&-

_rev="$(git log -1 --format=%h -- cervello/worker.sh 2>/dev/null || echo "?")"
if grep -q 'bash "\$SCRIPT_DIR/giro.sh"' cervello/worker.sh 2>/dev/null; then
  echo "[$(ts)] Pipeline worker: giro-pipeline-v2 (rev $_rev) ✓"
else
  echo "[$(ts)] WARN: worker ancora legacy?" >&2
fi
if grep -q '\--trust' cervello/motore-ai.sh 2>/dev/null; then
  echo "[$(ts)] motore-ai: --trust presente ✓"
else
  echo "[$(ts)] WARN: motore-ai senza --trust." >&2
fi

# Riavvio worker: solo root (mycity non ha sudo).
if [ -n "${AGGIORNA_SKIP_RESTART:-}" ]; then
  echo "[$(ts)] ✓ Allineamento completato."
  exit 0
fi

if [ "$(id -un)" != "root" ]; then
  echo "[$(ts)] ✓ Allineamento completato." >&2
  echo "[$(ts)]   Riavvio worker (come root): sudo bash cervello/vps/aggiorna-cervello.sh" >&2
  echo "[$(ts)]   (allinea codice da GitHub + riavvia worker E worker-chat)" >&2
  exit 0
fi

echo "[$(ts)] ▶ Riavvio mycity-worker + mycity-worker-chat..."
systemctl restart mycity-worker
systemctl restart mycity-worker-chat 2>/dev/null || true
sleep 2
if systemctl is-active --quiet mycity-worker; then
  echo "[$(ts)] ✓ Worker attivo. Lancia «fai un giro» dal Pannello."
else
  echo "[$(ts)] ✗ Worker non partito — journalctl -u mycity-worker -n 30" >&2
  exit 1
fi
if systemctl is-active --quiet mycity-worker-chat 2>/dev/null; then
  echo "[$(ts)] ✓ Worker chat attivo (streaming + parziali)."
else
  echo "[$(ts)] ⚠ Worker chat non attivo — journalctl -u mycity-worker-chat -n 20" >&2
fi
