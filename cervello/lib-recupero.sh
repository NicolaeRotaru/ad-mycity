#!/usr/bin/env bash
# 🛟 CHI SI PUÒ RIMETTERE IN CODA — la copia per la shell della decisione di AR-624.
#
# La versione con i commenti lunghi sta in `pannello/src/lib/recupero-lavoro.ts`: leggi quella per il
# perché. Qui c'è la stessa regola, perché lo script del VPS gira in bash e non può importare un .ts.
#
# ⚠️ Due copie della stessa decisione divergono, sempre — a meno che qualcosa lo impedisca. Quel
# qualcosa è `cervello/test/recupero-due-porte.test.mjs`: passa la STESSA tabella di casi a questa
# funzione e a quella TypeScript e pretende lo stesso verdetto. Se cambi una regola qui e non là (o
# viceversa), quel test diventa rosso. Non toccare l'una senza l'altra.

# Minuti passati da una data ISO. Data assente o illeggibile = vecchissimo (99999): un lavoro senza
# data non deve restare bloccato per sempre solo perché non sappiamo quando si è mosso.
_recupero_eta_min() {
  local quando="$1" t adesso
  [ -z "$quando" ] && { echo 99999; return; }
  t="$(date -d "$quando" +%s 2>/dev/null || echo "")"
  [ -z "$t" ] && { echo 99999; return; }
  adesso="${RECUPERO_ADESSO_EPOCH:-$(date +%s)}"
  echo $(( (adesso - t) / 60 < 0 ? 0 : (adesso - t) / 60 ))
}

# Decisione PURA. Stampa: riapprova | lascia | riaccoda
# Args: tipo owner eta_min [soglia_vivo_min]
_recupero_decisione() {
  local tipo="$1" owner="$2" eta="$3" soglia="${4:-60}"
  # ① azione reale: non si tocca mai. Potrebbe essere già partita — rieseguirla è un doppio invio.
  case " esegui-azione proposta " in
    *" $tipo "*) echo riapprova; return ;;
  esac
  # ② ha un proprietario e si è mosso da poco: lo sta eseguendo un worker ADESSO.
  if [ -n "$owner" ] && [ "$eta" -lt "$soglia" ]; then echo lascia; return; fi
  # ③ nessuno lo rivendica: torna in coda.
  echo riaccoda
}
