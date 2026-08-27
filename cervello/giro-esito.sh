#!/usr/bin/env bash
# giro-esito.sh — DECIDE l'esito del giro (AR-300 / AR-301 / AR-320).
#
# Perché esiste come file a parte: la decisione «questo giro è andato bene?» era sparsa in fondo a
# giro.sh e non era testabile senza far girare tutto il giro (motore AI, guardiani, git). Risultato:
# nessuno l'aveva mai provata, e per mesi ha risposto «sì» anche a controlli tutti rossi. Qui è una
# funzione pura — stessa logica, ma si può interrogare con casi finti e verificare che risponda bene.
#
# 🟢 Sola lettura: non tocca file, non chiama rete, non fa git. Definisce solo funzioni.

# esito_giro_rc <memoria_incoerente> <had_changes> <push_ok> <ai_rc> <gate_rossi> <vincoli_non_consegnati> [motore_eseguito]
#   0 = giro pulito (o memoria salvata nonostante AI instabile)
#   1 = AI fallita e nessuna memoria nuova pubblicata
#   2 = memoria scritta ma push fallito, oppure gate memoria (AR-104) ha bloccato la pubblicazione
#   3 = giro concluso ma con VINCOLI ANCORA ATTIVI: la memoria è pubblicata, il giro NON è pulito
#   4 = il motore ha GIRATO e non ha scritto NIENTE: un giro a vuoto
#
# ⭕ IL GIRO A VUOTO (11/8, trovato guardando perché il briefing restava vecchio di 31 ore).
# Fin qui un giro col motore andato bene e ZERO file scritti usciva 0, cioè «pulito»: il worker lo
# segnava fatto e la Cabina lo mostrava verde. È il buco peggiore che possa avere questa funzione,
# perché non racconta un guasto — racconta un successo mentre la macchina sta ferma. Il sintomo che
# l'ha fatto vedere: il registro delle cadenze diceva «giro fermo da 31h» mentre le impostazioni
# dicevano che il giro era uscito quel pomeriggio. Erano vere entrambe: girava e non scriveva.
# Serve `motore_eseguito` per non confondere due silenzi diversi. Il delta-gate SPEGNE apposta il
# motore quando non è cambiato niente (AR-019): lì zero scritture è la risposta giusta e resta 0.
# Un motore ACCESO che non lascia una riga, invece, è un giro che non è successo.
esito_giro_rc() {
  local memoria_incoerente="${1:-0}" had_changes="${2:-0}" push_ok="${3:-1}"
  local ai_rc="${4:-0}" gate_rossi="${5:-0}" non_consegnati="${6:-0}" motore_eseguito="${7:-1}"

  # AR-104: il gate memoria ha la precedenza — se la pubblicazione è stata bloccata, non è un successo
  # silenzioso nemmeno quando non siamo arrivati al commit.
  [ "$memoria_incoerente" = 1 ] && { echo 2; return; }
  [ "$had_changes" = 1 ] && [ "$push_ok" != 1 ] && { echo 2; return; }

  if [ "$ai_rc" -ne 0 ]; then
    # Motore instabile ma memoria comunque pubblicata: non si perde nulla, però se i cancelli sono
    # rossi vale la stessa regola di sotto — non è un giro pulito.
    if [ "$had_changes" = 1 ] && [ "$push_ok" = 1 ]; then
      [ "$gate_rossi" -gt 0 ] && { echo 3; return; }
      echo 0; return
    fi
    echo 1; return
  fi

  # Il giro a vuoto viene PRIMA dei cancelli: se il motore non ha scritto niente, i cancelli rossi
  # sono la conseguenza (nessuno li ha consumati), non la notizia. Dire «vincoli attivi» manderebbe
  # a cercare la causa nel posto sbagliato — è lo stesso errore di rotta che questa riga ripara.
  [ "$motore_eseguito" = 1 ] && [ "$had_changes" != 1 ] && { echo 4; return; }

  # AR-300/AR-320: i vincoli hard ora contano nell'esito. Prima vivevano solo dentro il testo del
  # prompt: un giro con tutti i controlli falliti usciva 0 e il Pannello lo mostrava verde.
  [ "$gate_rossi" -gt 0 ] && { echo 3; return; }
  [ "$non_consegnati" = 1 ] && { echo 3; return; }
  echo 0
}

# giro_e_pieno <ai_rc> <steps_ok> <gate_rossi>  → "1" se il giro può dichiararsi PIENO, "0" altrimenti.
#
# AR-301. Dichiararsi «pieno» non è una nota di log: promuove la firma corrente a riferimento, e i giri
# successivi la usano per SALTARE il motore fino a 12h. Prima girava sempre — anche con il motore
# fallito o con i passi 11-12 saltati — quindi un giro andato male spegneva quelli dopo, che credevano
# che non fosse cambiato nulla. Si guadagna, non si assume.
giro_e_pieno() {
  local ai_rc="${1:-0}" steps_ok="${2:-1}" gate_rossi="${3:-0}"
  if [ "$ai_rc" -eq 0 ] && [ "$steps_ok" = 1 ] && [ "$gate_rossi" -eq 0 ]; then echo 1; else echo 0; fi
}

# esito_giro_etichetta <ai_rc> <gate_rossi> <push_ok> <steps_ok> [had_changes] [motore_eseguito]
# Nome leggibile dell'esito, scritto in esito-giro.json e usato nei messaggi.
#
# 🏷️ L'ORDINE È LA NOTIZIA (11/8). L'etichetta è quello che Nicola legge in Cabina, quindi deve dire
# il fatto PIÙ GRAVE, non il primo che capita. Prima «vincoli-attivi» veniva prima di «non-pubblicato»:
# un giro la cui memoria non era uscita dal server veniva raccontato come «ci sono dei controlli
# rossi», e chi leggeva andava a sistemare i controlli mentre il problema era che non si pubblicava
# più niente. Ordine giusto, dal più grave: motore rotto → memoria non uscita → giro a vuoto →
# controlli rossi → passi saltati → pulito.
esito_giro_etichetta() {
  local ai_rc="${1:-0}" gate_rossi="${2:-0}" push_ok="${3:-1}" steps_ok="${4:-1}"
  local had_changes="${5:-1}" motore_eseguito="${6:-1}"
  if [ "$ai_rc" -ne 0 ]; then echo "motore-fallito"; return; fi
  if [ "$push_ok" != 1 ]; then echo "non-pubblicato"; return; fi
  if [ "$motore_eseguito" = 1 ] && [ "$had_changes" != 1 ]; then echo "giro-a-vuoto"; return; fi
  if [ "$gate_rossi" -gt 0 ]; then echo "vincoli-attivi"; return; fi
  if [ "$steps_ok" != 1 ]; then echo "passi-saltati"; return; fi
  echo "pulito"
}

# ─────────────────────────────────────────────────────────────────────────────
# IL CONTRATTO DEI GUARDIANI (AR-322 / AR-308 / AR-309)
# ─────────────────────────────────────────────────────────────────────────────
#
# Il difetto: `rc≠0` significava due cose diverse — «ho misurato e sei bocciato» e «non ho potuto
# misurare». Nessuno aveva riservato un codice al secondo caso, perché ogni guardiano è stato scritto
# separatamente con la sua convenzione. Risultato: un guardiano che si ROMPE consegna la propria
# traccia d'errore al motore come se fosse la regola da rispettare — il giro ubbidisce a uno stack
# trace. E all'opposto, quattro guardiani escono 0 quando l'input manca: un verde che non è un verde.
#
# Il contratto, uno per tutti:
#   0 = passato          1 = bocciato (violazione di dominio)      2 = cieco (non ho potuto misurare)
#
# Un guardiano cieco NON è verde e NON è bocciato: è uno strumento rotto, e va detto con parole sue —
# «ripara lo strumento, non fidarti del verde che non c'è» — non col testo di dominio, che sarebbe una
# bugia sul contenuto.

# vincolo_da_rc <nome-guardiano> <rc> <testo-di-dominio>
# Stampa il vincolo da dare al motore, o niente se il guardiano è passato.
vincolo_da_rc() {
  local nome="${1:-guardiano}" rc="${2:-0}" testo="${3:-}"
  case "$rc" in
    0) : ;;  # passato: nessun vincolo
    2) printf '⚠️ GUARDIANO CIECO (%s rc=2, AR-322): non è riuscito a misurare — NON è un verde. Ripara lo strumento prima di fidarti di questo giro; non trattare questo messaggio come una regola di contenuto.\n' "$nome" ;;
    *) printf '%s\n' "$testo" ;;
  esac
}

# aggiungi_vincolo <esistente> <nuovo>
# Accumula invece di sovrascrivere (AR-308). Il difetto: due gate diversi condividevano la stessa
# variabile e la SECONDA assegnazione cancellava la prima — l'allarme «calibrazione spenta» spariva
# senza lasciare traccia quando scattava anche «calibrazione non conforme». Due allarmi sullo stesso
# argomento non sono lo stesso allarme.
aggiungi_vincolo() {
  local esistente="${1:-}" nuovo="${2:-}"
  [ -z "$nuovo" ] && { printf '%s' "$esistente"; return; }
  [ -z "$esistente" ] && { printf '%s' "$nuovo"; return; }
  printf '%s\n%s' "$esistente" "$nuovo"
}

# guardiano <script.mjs> [args...]
# AR-165 — Esegue un guardiano SENZA perderne l'esito, e lo lascia in GUARDIANO_RC/GUARDIANO_OUT.
#
# Il difetto: due guardiani veri erano cablati come `node x.mjs 2>&1 | tail -4 || true`. In una pipe
# il codice d'uscita che conta è quello dell'ULTIMO comando (`tail`, sempre 0), e il `|| true` lo
# seppellisce una seconda volta. Il guardiano nato apposta per scoprire i controlli spenti in silenzio
# aveva, lui per primo, l'allarme staccato — e per settimane nessuno se n'è accorto perché nel giro il
# modello «riga informativa» e il modello «cancello» si somigliano a vista: la differenza sta in due
# caratteri. Qui la differenza diventa il NOME della funzione che chiami.
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

# sensore <script> <righe> [args...]
#
# AR-859 — per gli attrezzi che NON sono cancelli. `guardiano()` non va bene per loro: marca un
# «freno scattato» a ogni uscita diversa da zero, e questi escono 1 tutti i giorni per ragioni
# legittime (il Bilancio Vivo dice 1 finche' il margine realizzato e' zero, che oggi e' la verita').
# Marcarli come freni riempirebbe di rumore il conto delle lezioni usate.
#
# Ma il 2 e' un'altra cosa, ed e' il motivo per cui questa funzione esiste: da oggi questi attrezzi
# sanno dire «non ho potuto misurare», e finche' li si lancia dentro una pipe quel ⚪ non lo sente
# nessuno. La pipe restituisce l'uscita dell'ULTIMO comando, che va sempre bene.
#
# Quindi: l'esito si cattura PRIMA di stampare, le righe si stampano lo stesso, e sul 2 si grida.
# Niente vincolo hard: un sensore cieco non deve fermare il giro, deve smettere di essere invisibile.
sensore() {
  local _script="$1" _righe="${2:-3}"; shift 2 || shift
  local _out _rc
  _out="$(node "${SCRIPT_DIR:-.}/$_script" "$@" 2>&1)"; _rc=$?
  printf '%s\n' "$_out" | esito_righe "$_righe"
  if [ "$_rc" -eq 2 ]; then
    printf '⚪ %s non ha potuto misurare (rc=2). Un ⚪ non vale un verde: ripara lo strumento prima di fidarti di questo giro.\n' "$_script" >&2
  fi
  return "$_rc"
}

guardiano() {
  local _script="$1"; shift
  GUARDIANO_OUT="$(node "${SCRIPT_DIR:-.}/$_script" "$@" 2>&1)"; GUARDIANO_RC=$?
  printf '%s\n' "$GUARDIANO_OUT" | tail -6
  # AR-770 — un freno rosso È l'inciampo evitato: qui, e solo qui, una lezione risulta USATA.
  # Prima l'unica traccia era un comando a mano che quasi nessuno lanciava: 6 lezioni su 521 ne
  # portavano una. Su verde non scrive niente, apposta — marcare a ogni passaggio misurerebbe «te
  # l'ho mostrata», non «mi ha fermata». Best-effort: se questa marcatura fallisce NON deve cambiare
  # l'esito del guardiano, che è l'unica cosa che il chiamante legge.
  if [ "$GUARDIANO_RC" -ne 0 ]; then
    local _marca_out _marca_rc
    _marca_out="$(node "${SCRIPT_DIR:-.}/freno-scattato.mjs" "$_script" --rc "$GUARDIANO_RC" --ref "freno rosso nel giro: $_script" 2>&1)"; _marca_rc=$?
    # L'esito della marcatura NON si butta: se fallisce lo si dice. Buttarlo qui sarebbe la stessa
    # malattia che questa funzione esiste per curare, commessa dentro la cura.
    if [ "$_marca_rc" -ne 0 ]; then
      printf '⚠️  marcatura uso non riuscita (rc=%s): %s\n' "$_marca_rc" "$_marca_out" >&2
    fi
  fi
  return "$GUARDIANO_RC"
}
