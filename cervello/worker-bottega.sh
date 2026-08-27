#!/usr/bin/env bash
# 🚧 IL MURO E LA PORTA DI BOTTEGA, DAL LATO DEL WORKER — AR-839.
#
# Due mani, e stanno insieme perche' sono la stessa domanda vista da due lati:
#   `bottega_muro`   — questo lavoro si puo' eseguire? Si chiede su OGNI lavoro, del centro o no,
#                      subito dopo averlo preso dalla coda e PRIMA di qualsiasi altra cosa.
#   `bottega_prompt` — il testo per l'AI di un lavoro di bottega, che esce da `testoPerAI` e da
#                      nessun altro posto.
#
# PERCHE' ALL'ESECUZIONE E NON ALLA PRESA DEI LAVORI: e' stato provato e misurato il 26/8. Il muro
# dentro `worker-coda.sh` rendeva CIECHE cinque mutazioni del turno — la presa smetteva di
# consegnare, quindi rompere il turno non cambiava piu' niente e le prove restavano verdi lo
# stesso. Un freno che spegne le prove di un altro freno e' un cattivo affare: qui il muro sta dopo
# la presa, sul lavoro gia' scelto, e non tocca chi sceglie.
#
# PERCHE' IN UN FILE A PARTE: perche' una prova possa ESEGUIRLO. `worker.sh` non e' sorgibile (in
# fondo ha il ciclo infinito), e una prova che rilegge il suo testo cercando una parola non
# distingue un muro montato da un commento che lo descrive. E' esattamente cosi' che AR-839 e'
# nato: due meccanismi giusti, provati, che non chiamava nessuno.
#
# Prova: node cervello/test/il-testo-di-bottega-non-porta-l-altro-negozio.test.mjs

# Il negozio della macchina, per l'unico caso in cui non si puo' chiedere al muro: node che non
# risponde. E' una COPIA di `CENTRO` in guardia-esecuzione.mjs, e una copia che si allontana
# dall'originale e' una bugia — quindi la prova le confronta eseguendo tutte e due.
BOTTEGA_CENTRO="centro"

# Il perche' dell'ultima risposta. Un lavoro fermo senza motivo e' la telefonata del lunedi' mattina.
BOTTEGA_MOTIVO=""

# Il testo composto. Torna QUI e non su stdout perche' il chiamante deve poter distinguere «testo
# vuoto» da «non l'ho composto», e perche' il motivo deve sopravvivere alla chiamata.
BOTTEGA_TESTO=""

# QUESTO LAVORO SI PUO' ESEGUIRE?
#   0 = si · 1 = no, fermo (il perche' e' in BOTTEGA_MOTIVO) · 2 = non ho potuto chiedere
#
# Il 2 non e' un verde. Vale solo per il centro, e solo perche' un lavoro del centro non ha nessun
# negozio da tenere separato: fermare tutta la macchina perche' node non parte sarebbe un danno piu'
# grande del rischio che si sta coprendo. Per un lavoro di un negozio, invece, «non lo so» vale
# «no»: e' il caso per cui il muro esiste.
bottega_muro() {
  local negozio="${1:-}" tipo="${2:-}" ingresso out rc=0
  BOTTEGA_MOTIVO=""
  ingresso="$(jq -cn --arg n "$negozio" --arg t "$tipo" '{negozio:$n,tipo:$t}' 2>/dev/null)" || ingresso=""
  if [ -n "$ingresso" ]; then
    out="$(printf '%s' "$ingresso" | node "$SCRIPT_DIR/bottega/testo-lavoro.mjs" --controlla 2>&1)" || rc=$?
    [ "$rc" = 0 ] && return 0
    if [ "$rc" = 3 ]; then
      BOTTEGA_MOTIVO="$out"
      return 1
    fi
  else
    rc="jq"
  fi
  if [ "$(printf '%s' "$negozio" | tr -d '[:space:]')" = "$BOTTEGA_CENTRO" ]; then
    BOTTEGA_MOTIVO="il muro fra i negozi non ha risposto (uscita $rc): il lavoro e' del centro e non ha nessun negozio da tenere separato, quindi parte lo stesso — ma questo non e' un verde"
    return 2
  fi
  BOTTEGA_MOTIVO="il muro fra i negozi non ha risposto (uscita $rc) e questo lavoro e' del negozio «$negozio»: non lo eseguo. Un negozio che non si puo' controllare non passa."
  return 1
}

# IL TESTO PER L'AI DI UN LAVORO DI BOTTEGA — da `testoPerAI`, e da nessun'altra parte.
#   $1 = la riga del lavoro (array JSON di 1 elemento, come esce dalla coda)
#   0 = testo pronto in BOTTEGA_TESTO · 1 = niente testo, il perche' e' in BOTTEGA_MOTIVO
#
# Le colonne `materiale` e `righe` sulla tabella `lavori` non ci sono ancora: oggi passano due
# elenchi vuoti. E' voluto, ed e' il motivo per cui la porta si monta ADESSO — il giorno che le
# colonne arrivano ci passano dentro senza che nessuno debba ricordarsi di aggiungere un controllo.
bottega_prompt() {
  local riga="${1:-[]}" ingresso rc=0 err
  BOTTEGA_TESTO=""
  BOTTEGA_MOTIVO=""
  ingresso="$(printf '%s' "$riga" | jq -c '{negozio:(.[0].negozio_id // ""), tipo:(.[0].tipo // ""), mandato:(.[0].richiesta // ""), materiale:(.[0].materiale // []), righe:(.[0].righe // []), cassaforte:(.[0].cassaforte // {})}' 2>/dev/null)" || ingresso=""
  if [ -z "$ingresso" ]; then
    BOTTEGA_MOTIVO="la riga del lavoro non e' leggibile: non compongo nessun testo"
    return 1
  fi
  # Un file per lo stderr del costruttore. Se `mktemp` non risponde si ripiega su un nome nostro
  # invece di lasciare la variabile vuota: `2>""` non e' un redirect, e' un errore — e sotto
  # `pipefail` porterebbe via il lavoro per un motivo che non c'entra niente con la bottega.
  err="$(mktemp 2>/dev/null)" || err=""
  [ -n "$err" ] || err="${TMPDIR:-/tmp}/bottega-prompt-$$.err"
  BOTTEGA_TESTO="$(printf '%s' "$ingresso" | node "$SCRIPT_DIR/bottega/testo-lavoro.mjs" 2>"$err")" || rc=$?
  # Lo scarto delle righe altrui esce sullo stderr del costruttore anche quando il testo e' buono:
  # va nel log del worker, non buttato via. Un filtro silenzioso e' una perdita che nessuno vede.
  [ -s "$err" ] && sed 's/^/[bottega] /' "$err" >&2
  if [ "$rc" != 0 ]; then
    BOTTEGA_MOTIVO="$(tr '\n' ' ' < "$err")"
    [ -n "$BOTTEGA_MOTIVO" ] || BOTTEGA_MOTIVO="il costruttore del testo di bottega e' uscito $rc senza dire perche'"
    BOTTEGA_TESTO=""
    rm -f "$err"
    return 1
  fi
  rm -f "$err"
  return 0
}
