#!/usr/bin/env bash
# allineamento-esito.sh — DECIDE l'esito dell'allineamento del codice sul VPS (AR-311/312/316).
#
# Tre difetti, una radice: **l'allineamento dice «fatto» anche quando non ha fatto niente** — e in un
# caso cancella il lavoro invece di fermarsi.
#
#   AR-311 (bloccante) — se il push dei commit pendenti fallisce, il copione stampa un ✗ e TIRA DRITTO
#     fino al `checkout -f`, che quei commit li butta. Il lavoro del server sparisce per un errore di
#     rete. Un avviso su stderr non è una difesa: è un necrologio.
#   AR-312 — se il fetch fallisce, l'allineamento diventa un no-op silenzioso ma il copione esce 0 e
#     watch-main SEGNA LO SHA COME VISTO: da quel momento non ci riprova più. Il server resta indietro
#     per sempre, dicendo che va tutto bene.
#   AR-316 — un rinvio è normale (una chat sta lavorando su un ramo). Sei rinvii di fila per mezz'ora
#     no: significa che il worktree è bloccato, e nessuno se ne accorge perché ogni singolo rinvio
#     è verde.
#
# La regola che li unisce: **se un passo dell'allineamento non è riuscito, lo SHA non si segna.**
# Segnare lo SHA significa «ho visto questa versione e l'ho applicata»: dirlo senza averlo fatto è la
# bugia che rende il server invisibilmente vecchio.
#
# 🟢 Sola lettura: definisce solo funzioni pure. Nessun I/O, così un test le esegue davvero.

# esito_allineamento <ok_push_pendenti> <fetch_ok> <lavoro_vivo_su_ramo> [head_sul_ramo]
#   0 = allineato       · si può segnare lo SHA
#   3 = rimandato       · lavoro vivo su un ramo: riprova al prossimo giro (già esistente)
#   4 = fetch fallito   · non ho scaricato niente: NON segnare lo SHA (AR-312)
#   5 = push pendenti fallito · ci sono commit del server non pubblicati: NON allineare, li perderei (AR-311)
#   6 = HEAD non è finito sul ramo · i file sono aggiornati ma la POSIZIONE no (12/8)
#
# L'ordine conta: il push pendenti si valuta PER PRIMO perché è l'unico caso in cui proseguire
# DISTRUGGE del lavoro. Gli altri due lasciano solo il server indietro, che è recuperabile.
#
# 📍 IL QUARTO CASO — «HEAD staccato» (12/8, due giorni di macchina ferma).
# Il difetto è lo stesso dei tre qui sopra, nel passo che nessuno aveva coperto: quello che rimette
# la POSIZIONE. Il comando che riporta HEAD sul ramo finiva con `|| true`; se falliva, il copione
# tirava dritto, aggiornava i FILE da main e stampava «✓ Allineamento completato». Vero sui file,
# falso sulla posizione: il server restava staccato su un commit vecchio.
# Cosa è costato: `git status` sul server diceva `## HEAD (no branch)` mentre l'allineamento aveva
# appena dichiarato successo. Da lì tre sintomi che sembravano tre guasti diversi — la memoria non
# usciva più (la pubblicazione si rifiuta se non è sul ramo), il worker non prendeva più i fix (il
# file era più avanti del commit staccato, e la guardia lo leggeva come «codice manomesso»), e la
# Cabina mostrava un pallino arancione al posto di «sono ferma da due giorni».
# La regola è già scritta in cima a questo file, e vale anche qui: un passo che non è riuscito non
# si racconta come riuscito. Aggiornare i file senza spostare la posizione non è un allineamento.
esito_allineamento() {
  local ok_push="${1:-1}" fetch_ok="${2:-1}" lavoro_vivo="${3:-0}" head_ok="${4:-1}"
  [ "$ok_push" != 1 ] && { echo 5; return; }
  [ "$lavoro_vivo" = 1 ] && { echo 3; return; }
  [ "$fetch_ok" != 1 ] && { echo 4; return; }
  [ "$head_ok" != 1 ] && { echo 6; return; }
  echo 0
}

# watch_azione <rc_allineamento> <rinvii_consecutivi> [tetto]
# Cosa deve fare watch-main con quell'esito.
#   segna   = allineamento riuscito: scrivi lo SHA, segnale ok
#   rimanda = non riuscito ma normale: NON scrivere lo SHA, segnale ok, riprova
#   allarme = non riuscito da troppo tempo: NON scrivere lo SHA, segnale ERRORE (AR-316)
#
# Il tetto esiste perché «rimanda» è verde, e un verde ripetuto all'infinito è indistinguibile da un
# sistema fermo. Sei rinvii ≈ mezz'ora: oltre, non è più una chat che lavora, è un worktree bloccato.
watch_azione() {
  local rc="${1:-0}" rinvii="${2:-0}" tetto="${3:-6}"
  [ "$rc" = 0 ] && { echo segna; return; }
  [ "$rinvii" -ge "$tetto" ] && { echo allarme; return; }
  echo rimanda
}

# ─────────────────────────────────────────────────────────────────────────────
# AR-467 · AR-468 · AR-469 — le tre decisioni dello stallo del 31/7, rese pure perché una prova le
# possa ESEGUIRE. Il guasto vero non è stato nessuna di queste tre da sola: è stato il fatto che
# nessuna esisteva, e il copione tirava dritto indovinando.
# ─────────────────────────────────────────────────────────────────────────────

# deve_committare_recupero <commit_non_pubblicati> → si | no
#
# AR-467 — un altro commit di recupero, quando ce ne sono già di non pubblicati, non aiuta: PEGGIORA.
# Ogni commit in più allontana il ramo da origin/main, rende il rebase successivo più difficile e
# garantisce il fallimento del giro dopo. Dal 30/7 12:00 al 31/7 20:40 questo ciclo ha prodotto 1519
# commit — uno al minuto, tutti chiamati «recupero: scritture pendenti» — senza pubblicarne nemmeno
# uno. Un retry che peggiora lo stato che deve riparare non è un retry: è un guasto che si moltiplica.
# La regola: prima si pubblica, poi si committa.
deve_committare_recupero() {
  local ahead="${1:-0}"
  [ "$ahead" -gt 0 ] 2>/dev/null && { echo no; return; }
  echo si
}

# azione_ramo_vivo <ramo_corrente> <ramo_bersaglio> <eta_tip_min> <sporco_codice> [min_lavoro] [max_stallo]
#   → allinea | rimanda | libera
#
# 2026-08-21 — L'USCITA DI SICUREZZA CHE NON SCADEVA MAI (422 rinvii, e prima 1716).
#
# Quando HEAD sul server sta su un ramo diverso da main, l'allineamento si rimanda: giusto, perché
# `checkout -f` strapperebbe il lavoro a una chat che sta scrivendo ORA. Contro lo stallo c'era già
# una fuga: «un ramo fermo da più di mezz'ora e senza sporco di CODICE è abbandonato, allineo lo
# stesso». Ma quella fuga si spegneva del tutto appena c'era un solo file di codice sporco — e senza
# nessun tetto sull'attesa. Un file avanzato da una sessione uccisa a metà, e il rinvio diventava
# eterno: la macchina scriveva e non pubblicava più, con ogni singolo rinvio verde.
#
# Il conto: il 30/7 sono stati 1716 rinvii consecutivi, 31 ore, 1519 commit mai usciti. Il 18/8 il
# referto del server contava 422 rinvii — cioè lo stesso guasto, la seconda volta. È la regola della
# skill: un difetto tornato due volte non si ripara una terza, gli si mette un guardiano alla radice.
#
# Il guardiano è un tetto sull'attesa. Sotto `min_lavoro` c'è davvero qualcuno che lavora: si
# rimanda. Senza sporco di codice il ramo è abbandonato: si allinea (fuga di prima, invariata). Con
# sporco di codice si rimanda ancora — ma non per sempre: oltre `max_stallo` non è più «una chat che
# lavora», è un worktree piantato, e la risposta diventa `libera`.
#
# `libera` NON vuol dire «butta»: chi la riceve deve prima PARCHEGGIARE il lavoro sporco con un
# commit sul ramo dov'è (niente va perso, si recupera con un checkout di quel ramo) e solo dopo
# allineare. La differenza fra `allinea` e `libera` è tutta lì: la prima trova il ramo pulito, la
# seconda ha delle cose da mettere al sicuro prima di passare.
azione_ramo_vivo() {
  local cur="${1:-}" bersaglio="${2:-}" eta="${3:-0}" sporco="${4:-0}"
  local min_lavoro="${5:-30}" max_stallo="${6:-240}"
  # Già sul ramo giusto, o HEAD staccato (non è il lavoro di nessuno): non c'è niente da proteggere.
  [ "$cur" = "$bersaglio" ] && { echo allinea; return; }
  [ "$cur" = "HEAD" ] && { echo allinea; return; }
  [ -z "$cur" ] && { echo allinea; return; }
  # Un numero che non è un numero non compra un allineamento: nel dubbio si rimanda.
  [ "$eta" -ge 0 ] 2>/dev/null || { echo rimanda; return; }
  [ "$eta" -lt "$min_lavoro" ] && { echo rimanda; return; }
  [ "$sporco" != 1 ] && { echo allinea; return; }
  [ "$eta" -ge "$max_stallo" ] && { echo libera; return; }
  echo rimanda
}

# serve_mettere_da_parte <uscita di git status --porcelain> → si | no
#
# AR-469 — `git rebase` si rifiuta di partire se ci sono modifiche TRACCIATE non messe in staging. Sul
# server ci sono sempre: `cervello/fonti-salute.json`, `intelligence-agenda.json`, `scadenzario.json`
# sono DATI che la macchina si riscrive girando, ma vivono in `cervello/`, che l'allineamento non mette
# mai in staging (regola giusta: solo memoria, mai codice — AR-310). Restavano sporchi per costruzione,
# e il rebase non partiva MAI.
#
# Niente elenco di file: sarebbe il perimetro letterale di AR-347, e domani un quarto file dati
# rimetterebbe la trappola. La domanda giusta è generale — «c'è qualcosa di tracciato da mettere da
# parte?» — e la risposta si legge dal porcelain. I file NON tracciati non contano: non bloccano il
# rebase, e metterli da parte rischierebbe di portarsi via lavoro di qualcun altro.
serve_mettere_da_parte() {
  printf '%s\n' "${1:-}" | grep -qE '^(.[MDARCU]|[MDARCU].)' && { echo si; return; }
  echo no
}

# motivo_push_fallito <uscita del rebase> → la causa VERA, in italiano
#
# AR-468 — il copione faceva `git rebase … 2>/dev/null || git rebase --abort` e poi, quando il push
# veniva rifiutato, stampava «Controlla GIT_PUSH_TOKEN/rete». Il token era sano e la rete anche: la
# causa era «cannot rebase: You have unstaged changes», buttata in /dev/null. Trentuno ore di diagnosi
# mandata dalla parte sbagliata da un reindirizzamento. Un messaggio che INDOVINA la causa è peggio di
# nessun messaggio: manda a cercare dove non c'è niente.
motivo_push_fallito() {
  local uscita="${1:-}"
  case "$uscita" in
    *"unstaged changes"*|*"You have unstaged"*)
      echo "l'albero di lavoro ha modifiche non messe in staging: il rebase non parte nemmeno" ;;
    *CONFLICT*|*"could not apply"*)
      echo "il rebase ha trovato conflitti: vanno risolti a mano" ;;
    *"unborn branch"*|*"does not point to a valid"*)
      echo "il riferimento del rebase non è valido: il fetch non ha portato niente" ;;
    "")
      echo "il rebase è andato a buon fine ma GitHub ha rifiutato il push (token, rete o ramo protetto)" ;;
    *)
      echo "il rebase è fallito: $(printf '%s' "$uscita" | grep -m1 -i 'error\|fatal' || printf '%s' "$uscita" | head -1)" ;;
  esac
}

# frase_segnale_allineamento <rc> <rinvii> [causa-specifica] → la riga che ESCE dalla macchina.
#
# 2026-08-16 — il perché vero del blocco moriva sul server. `motivo_push_fallito` sa già distinguere
# «il rebase ha trovato conflitti» da «GitHub ha rifiutato il push»: due guasti con due cure diverse.
# Ma quella frase finiva solo su stderr, cioè nel journal di systemd, cioè solo per chi può entrare
# nel VPS. Fuori — Pannello, telefono, sessione cloud — arrivava «commit del server non pubblicati»
# e basta, che non dice né cosa è successo né cosa fare. Sei ore e mezza di macchina ferma con la
# causa già scritta e mai uscita di casa: la stessa lezione del motore AI (lib-cadenza ③), non
# ancora applicata qui.
frase_segnale_allineamento() {
  local rc="${1:-0}" rinvii="${2:-0}" causa="${3:-}"
  local frase
  frase="allineamento fermo da ${rinvii} giri (~$(( rinvii * 5 )) min): $(motivo_allineamento "$rc")"
  [ -n "$causa" ] && frase="$frase — causa: $causa"
  printf '%s\n' "$frase"
}

# motivo_allineamento <rc> — la frase da mettere nel log e nel segnale, in italiano.
motivo_allineamento() {
  case "${1:-0}" in
    0) echo "allineato" ;;
    3) echo "rimandato: una sessione sta lavorando su un ramo" ;;
    4) echo "fetch fallito: non ho scaricato niente, quindi NON ho allineato (rete o token)" ;;
    5) echo "commit del server non pubblicati: NON allineo, il checkout -f li cancellerebbe" ;;
    6) echo "HEAD è rimasto STACCATO (nessun ramo): i file sono aggiornati ma la posizione no — la memoria non si pubblica e i fix non si caricano finché non torna sul ramo" ;;
    *) echo "allineamento fallito (rc=$1)" ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# paths_non_tracciati_che_bloccano <porcelain> <file in arrivo, uno per riga> → i path, uno per riga
#
# 2026-08-21 — LA MESSA DA PARTE CHE NON TOGLIE L'OSTACOLO, E CHE NESSUNO RIPRENDE.
#
# Il server è rimasto fermo per giorni ripetendo questo, ogni minuto:
#
#   error: The following untracked working tree files would be overwritten by checkout:
#
# Sopra, `serve_mettere_da_parte` mette da parte le modifiche TRACCIATE, e il suo commento dice:
# «I file NON tracciati non contano: non bloccano il rebase». **Non è vero, e il server lo ha
# dimostrato 7.849 volte.** Un file non tracciato NON blocca finché nessuno lo rivendica; nel momento
# in cui i commit in arrivo AGGIUNGONO un file con quel nome, git si ferma piuttosto che sovrascrivere
# lavoro che non ha mai visto. È la stessa prudenza che ci salva altrove.
#
# Il conto di quell'errore nel commento: un rimedio che agisce sull'ostacolo sbagliato lascia
# l'ostacolo dov'è, ma **crea comunque la stash**. Ogni minuto una in più, mai ripresa da nessuno:
# in tutto il repo non esisteva un solo `git stash pop`. Settemilaottocentoquarantanove messe da parte
# e zero riprese non sono prudenza — sono una perdita che si traveste da cautela.
#
# Qui NON si mette da parte tutto ciò che non è tracciato: sarebbe la mossa che il vecchio commento
# temeva a ragione (portarsi via il lavoro di qualcun altro). Si mettono da parte SOLO i file non
# tracciati che i commit in arrivo rivendicano — cioè esattamente quelli che git nomina nel rifiuto.
paths_non_tracciati_che_bloccano() {
  local porcelain="${1:-}" in_arrivo="${2:-}"
  [ -n "$porcelain" ] && [ -n "$in_arrivo" ] || return 0
  local riga path
  printf '%s\n' "$porcelain" | while IFS= read -r riga; do
    case "$riga" in
      '??'*) ;;            # solo i non tracciati: i tracciati li copre serve_mettere_da_parte
      *) continue ;;
    esac
    path="${riga#?? }"
    path="${path%\"}"; path="${path#\"}"
    [ -n "$path" ] || continue
    printf '%s\n' "$in_arrivo" | grep -qxF -- "$path" && printf '%s\n' "$path"
  done
  # L'uscita della funzione NON è quella dell'ultimo grep: con `set -e` nel chiamante un file che
  # non collide farebbe morire l'allineamento. Qui si risponde «ho guardato», non «ho trovato».
  return 0
}

# paths_da_mettere_da_parte <porcelain> <file in arrivo> → tutti i path che fermano il rebase
#
# 2026-08-21, seconda passata — il primo rimedio che ho scritto per questo difetto ne aveva uno suo,
# e l'ha trovato la prova: mettendo da parte con la forma `stash push -u -- <percorsi>` si mette da
# parte SOLO quei percorsi, e il tracciato sporco resta dov'è. Il rebase continuava a rispondere
# «l'albero di lavoro ha modifiche non messe in staging». Un rimedio che toglie metà ostacolo lascia
# il server fermo esattamente come prima.
#
# Qui l'elenco è uno solo e li copre tutti e due: i tracciati sporchi (qualunque essi siano — niente
# elenco letterale, è la trappola di AR-347) e i non tracciati che i commit in arrivo rivendicano.
# Fuori restano i non tracciati che nessuno reclama: quelli non bloccano, e portarli via sarebbe
# rubare il lavoro di chi sta scrivendo.
paths_da_mettere_da_parte() {
  local porcelain="${1:-}" in_arrivo="${2:-}" riga path
  [ -n "$porcelain" ] || return 0
  printf '%s\n' "$porcelain" | while IFS= read -r riga; do
    [ -n "$riga" ] || continue
    path="${riga:3}"
    path="${path%\"}"; path="${path#\"}"
    [ -n "$path" ] || continue
    case "$riga" in
      '??'*)
        # non tracciato: entra solo se i commit in arrivo lo rivendicano
        [ -n "$in_arrivo" ] && printf '%s\n' "$in_arrivo" | grep -qxF -- "$path" && printf '%s\n' "$path"
        ;;
      *)
        # tracciato sporco: entra sempre, è quello che AR-469 aveva già visto
        printf '%s\n' "$path"
        ;;
    esac
  done
  return 0
}
