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
