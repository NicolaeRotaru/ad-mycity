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

# esito_allineamento <ok_push_pendenti> <fetch_ok> <lavoro_vivo_su_ramo>
#   0 = allineato       · si può segnare lo SHA
#   3 = rimandato       · lavoro vivo su un ramo: riprova al prossimo giro (già esistente)
#   4 = fetch fallito   · non ho scaricato niente: NON segnare lo SHA (AR-312)
#   5 = push pendenti fallito · ci sono commit del server non pubblicati: NON allineare, li perderei (AR-311)
#
# L'ordine conta: il push pendenti si valuta PER PRIMO perché è l'unico caso in cui proseguire
# DISTRUGGE del lavoro. Gli altri due lasciano solo il server indietro, che è recuperabile.
esito_allineamento() {
  local ok_push="${1:-1}" fetch_ok="${2:-1}" lavoro_vivo="${3:-0}"
  [ "$ok_push" != 1 ] && { echo 5; return; }
  [ "$lavoro_vivo" = 1 ] && { echo 3; return; }
  [ "$fetch_ok" != 1 ] && { echo 4; return; }
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

# motivo_allineamento <rc> — la frase da mettere nel log e nel segnale, in italiano.
motivo_allineamento() {
  case "${1:-0}" in
    0) echo "allineato" ;;
    3) echo "rimandato: una sessione sta lavorando su un ramo" ;;
    4) echo "fetch fallito: non ho scaricato niente, quindi NON ho allineato (rete o token)" ;;
    5) echo "commit del server non pubblicati: NON allineo, il checkout -f li cancellerebbe" ;;
    *) echo "allineamento fallito (rc=$1)" ;;
  esac
}
