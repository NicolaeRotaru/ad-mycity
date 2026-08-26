#!/usr/bin/env bash
# 🛣️ LA PRESA DEI LAVORI DEL WORKER — una casa sola, e provabile. AR-804.
#
# Stava dentro il ciclo di `worker.sh`, in mezzo a mille righe: `order=created_at.asc&limit=1`,
# l'ordine d'arrivo. Con un padrone solo andava bene. Con quaranta botteghe che pagano un canone no:
# chi mette in coda trenta lavori, o uno che va in loop, ferma tutti gli altri — e il tempo perso e'
# di qualcuno che non c'entra niente.
#
# Qui dentro ci sono due regole, in quest'ordine, e nessuna delle due e' nuova:
#   ① LA CHAT PASSA DAVANTI. Nicola aspetta la risposta in diretta: una chat batte sempre giro,
#      ritmo e metabolizzazione. Non si tocca.
#   ② FRA I LAVORI DI FONDO SI VA A TURNO fra i negozi, non in ordine d'arrivo. Il turno lo decide
#      `bottega/scelta-worker.mjs`, che a sua volta usa le corsie gia' scritte e provate.
#
# PERCHE' IN UN FILE A PARTE: perche' una prova possa ESEGUIRLO. Un test che rilegge `worker.sh`
# cercando una parola non distingue un turno da un FIFO col commento giusto sopra — e il difetto che
# stiamo chiudendo e' nato proprio cosi', una funzione giusta che non chiamava nessuno.
# Il precedente in casa e' `lib-esito-lavoro.sh`, provato allo stesso modo con un `curl` finto.
#
# Prova: node --test cervello/test/il-negozio-lento-non-ferma-gli-altri.test.mjs

# NESSUNA FINESTRA, e il motivo e' misurato. La prima versione leggeva le 200 righe piu' vecchie e
# da quelle deduceva le corsie: un negozio con 200 lavori in attesa riempiva la finestra intera e il
# lavoro appena accodato da un altro diventava invisibile — «tutte le corsie sono ferme» con la coda
# piena. La fame che questo file esiste per togliere, rimessa dentro dal tetto della finestra.
# Adesso: prima si chiede QUALI negozi hanno lavori in attesa (una colonna sola, righe corte, tutte),
# si decide il turno, e solo dopo si chiede il lavoro piu' vecchio del negozio scelto.

# L'ultimo negozio servito: il turno riparte da DOPO di lui. Vive quanto il processo; se il worker
# riparte il giro ricomincia dal primo, che non e' un danno — e' solo un turno che riparte.
ULTIMO_NEGOZIO=""

# Perche' l'ultima scelta e' andata come e' andata. Lo legge chi guarda i log quando la coda ha
# lavori e non parte niente: senza, la risposta e' «non lo so», che costa piu' del freno.
MOTIVO_CODA=""

# La riga del prossimo lavoro (array JSON di 0 o 1 elemento). Torna QUI e non su stdout perche'
# `$(...)` apre una sottoshell: l'ultimo negozio servito, il motivo e il ripiego morirebbero dentro
# quella, e il turno non girerebbe mai — sempre il primo negozio, in silenzio. Misurato, non temuto:
# la prova del turno che gira era rossa proprio cosi'.
CODA_RIGA="[]"

# 1 quando la scelta e' ripiegata sull'ordine d'arrivo. Un ripiego silenzioso e' peggio del difetto:
# il turno risulterebbe attivo mentre non lo e'.
CODA_RIPIEGATA=0

# La riga di una chat in attesa, se c'e'. La precedenza della chat non passa dal turno.
_coda_chat() {
  local rc=0 riga=""
  CODA_RIGA="[]"
  riga="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&tipo=eq.chat${_rtry}&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null)" || rc=$?
  if [ "$rc" -ne 0 ]; then
    _rtry=""
    riga="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&tipo=eq.chat&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
    echo "[$(ts)] ⚠️  AR-295: la coda NON sta rispettando l'ora di ritentativo (la query col filtro e' stata rifiutata, rc=$rc): i lavori in attesa del reset verranno ripresi subito. Manca la migration lavori-retry.sql?" >&2
  fi
  CODA_RIGA="$riga"
}

# Il lavoro di fondo scelto a turno fra i negozi. Se qualcosa non si puo' leggere si ripiega
# sull'ordine d'arrivo, ma AD ALTA VOCE (la regola di AR-295: un ripiego muto e' una bugia).
_coda_a_turno() {
  local negozi incorso impost scelta negozio ingresso rc=0
  CODA_RIPIEGATA=0
  MOTIVO_CODA=""

  # ① Chi ha lavori in attesa. Una colonna sola: sono righe da poche decine di byte, si possono
  #    prendere tutte senza tetto — ed e' esattamente il tetto che creava la fame.
  negozi="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa${_rtry}&select=negozio_id&order=created_at.asc" "${AUTH[@]}" 2>/dev/null || true)"
  if ! printf '%s' "$negozi" | jq -e 'type=="array"' >/dev/null 2>&1; then
    CODA_RIPIEGATA=1
    echo "[$(ts)] ⚠️  AR-804: la coda a corsie non e' leggibile (manca negozio_id sulla tabella lavori?) — si riprende in ORDINE D'ARRIVO: un negozio lento puo' fermare gli altri." >&2
    CODA_RIGA="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa${_rtry}&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
    [ -n "$CODA_RIGA" ] || CODA_RIGA="[]"
    return 0
  fi

  incorso="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_corso&select=negozio_id" "${AUTH[@]}" 2>/dev/null || true)"
  printf '%s' "$incorso" | jq -e 'type=="array"' >/dev/null 2>&1 || incorso="[]"
  impost="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?chiave=like.bottega:negozio:*&select=chiave,valore" "${AUTH[@]}" 2>/dev/null || true)"
  printf '%s' "$impost" | jq -e 'type=="array"' >/dev/null 2>&1 || impost="[]"

  # ② A chi tocca. L'esito NON finisce in una pipe e non si compra con un `|| true`: in una pipe il
  #    codice che conta e' quello dell'ultimo comando, e chi sceglie esce 2 quando l'ingresso e'
  #    illeggibile — con l'esito buttato via quel caso diventava «niente da fare», cioe' un worker
  #    che dorme in silenzio con la coda piena.
  ingresso="$(jq -n --argjson negozi "$negozi" --argjson inCorso "$incorso" --argjson impostazioni "$impost" --arg ultimo "$ULTIMO_NEGOZIO" \
    '{negoziInAttesa:$negozi, inCorso:$inCorso, impostazioni:$impostazioni, ultimo:(if $ultimo=="" then null else $ultimo end)}' 2>/dev/null || true)"
  scelta="$(printf '%s' "$ingresso" | node "$SCRIPT_DIR/bottega/scelta-worker.mjs" 2>/dev/null)" || rc=$?

  negozio="$(printf '%s' "$scelta" | jq -r '.negozioId // empty' 2>/dev/null || true)"
  if [ -z "$negozio" ]; then
    if [ "$rc" -ne 0 ] || [ -z "$scelta" ]; then
      CODA_RIPIEGATA=1
      echo "[$(ts)] ⚠️  AR-804: chi sceglie il turno non ha risposto (uscita $rc) — si riprende in ORDINE D'ARRIVO." >&2
      CODA_RIGA="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa${_rtry}&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
      [ -n "$CODA_RIGA" ] || CODA_RIGA="[]"
      return 0
    fi
    MOTIVO_CODA="$(printf '%s' "$scelta" | jq -r '.motivo // ""' 2>/dev/null || true)"
    CODA_RIGA="[]"
    return 0
  fi

  # ③ Il lavoro piu' vecchio DI QUEL NEGOZIO. Dentro la corsia vale l'ordine d'arrivo: il turno e'
  #    fra i negozi, non dentro.
  CODA_RIGA="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa${_rtry}&negozio_id=eq.$negozio&order=created_at.asc&limit=1&select=id,tipo,richiesta,negozio_id,created_at" "${AUTH[@]}" 2>/dev/null || true)"
  if [ -z "$(printf '%s' "$CODA_RIGA" | jq -r '.[0].id // empty' 2>/dev/null)" ]; then
    # Il lavoro c'era un attimo fa e adesso no: un altro worker l'ha preso. Non e' un guasto.
    MOTIVO_CODA="il lavoro di $negozio e' stato preso da un altro worker fra le due richieste"
    CODA_RIGA="[]"
    return 0
  fi
  ULTIMO_NEGOZIO="$negozio"
}

# LA PORTA: mette in `CODA_RIGA` la riga del prossimo lavoro (array JSON di 0 o 1 elemento).
# Si chiama SENZA `$(...)`, altrimenti lo stato del turno resta nella sottoshell.
coda_prossima_riga() {
  MOTIVO_CODA=""
  _coda_chat
  if [ -n "$(printf '%s' "$CODA_RIGA" | jq -r '.[0].id // empty' 2>/dev/null)" ]; then
    return 0
  fi
  # Worker dedicato solo-chat: nessuna chat in attesa → aspetta, non prende lavori di fondo.
  if [ "$WORKER_LANE" = chat ]; then
    CODA_RIGA="[]"
    return 0
  fi
  _coda_a_turno
}
