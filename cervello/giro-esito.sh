#!/usr/bin/env bash
# giro-esito.sh — DECIDE l'esito del giro (AR-300 / AR-301 / AR-320).
#
# Perché esiste come file a parte: la decisione «questo giro è andato bene?» era sparsa in fondo a
# giro.sh e non era testabile senza far girare tutto il giro (motore AI, guardiani, git). Risultato:
# nessuno l'aveva mai provata, e per mesi ha risposto «sì» anche a controlli tutti rossi. Qui è una
# funzione pura — stessa logica, ma si può interrogare con casi finti e verificare che risponda bene.
#
# 🟢 Sola lettura: non tocca file, non chiama rete, non fa git. Definisce solo funzioni.

# esito_giro_rc <memoria_incoerente> <had_changes> <push_ok> <ai_rc> <gate_rossi> <vincoli_non_consegnati>
#   0 = giro pulito (o memoria salvata nonostante AI instabile)
#   1 = AI fallita e nessuna memoria nuova pubblicata
#   2 = memoria scritta ma push fallito, oppure gate memoria (AR-104) ha bloccato la pubblicazione
#   3 = giro concluso ma con VINCOLI ANCORA ATTIVI: la memoria è pubblicata, il giro NON è pulito
esito_giro_rc() {
  local memoria_incoerente="${1:-0}" had_changes="${2:-0}" push_ok="${3:-1}"
  local ai_rc="${4:-0}" gate_rossi="${5:-0}" non_consegnati="${6:-0}"

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

# esito_giro_etichetta <ai_rc> <gate_rossi> <push_ok> <steps_ok>
# Nome leggibile dell'esito, scritto in esito-giro.json e usato nei messaggi.
esito_giro_etichetta() {
  local ai_rc="${1:-0}" gate_rossi="${2:-0}" push_ok="${3:-1}" steps_ok="${4:-1}"
  if [ "$ai_rc" -ne 0 ]; then echo "motore-fallito"; return; fi
  if [ "$gate_rossi" -gt 0 ]; then echo "vincoli-attivi"; return; fi
  if [ "$push_ok" != 1 ]; then echo "non-pubblicato"; return; fi
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
