#!/usr/bin/env bash
# 🛑 KILL-SWITCH — la pausa di Nicola, in UN posto solo (AR-390 / AR-038 / AR-100).
#
# Nel Pannello c'è un interruttore: `impostazioni.pausa = on` ferma l'AD. Ogni cosa che accende il
# motore AI deve chiederglielo prima. Fin qui glielo chiedevano in quattro, ognuno con la sua copia:
#
#   file                    curl                                    se la rete fa i capricci
#   cervello/giro.sh        curl … ; _pausa_rc=$?                   si ferma  (fail-closed)
#   cervello/worker.sh      curl … || _pausa_rc=$?                  si ferma  (fail-closed)
#   cervello/ritmo.sh       curl … || true                          PARTE    ⛔
#   cervello/monitora.sh    curl … || true                          PARTE    ⛔
#
# La tabella di sopra è la malattia intera in quattro righe: `|| true` ingoia il codice d'uscita della
# curl, quindi una risposta vuota per un errore di rete non contiene `"valore":"on"` e la cadenza
# parte **mentre Nicola crede di aver messo in pausa**. Il fail-closed era stato installato dove il
# rischio si vedeva (il worker, che tocca il mondo; il giro, che è il più frequente) e non è mai
# arrivato nelle copie accanto — perché AR-038 e AR-100 sono stati chiusi misurando il file curato,
# non la famiglia.
#
# La causa di sistema: il kill-switch non aveva una funzione condivisa come ce l'ha la pubblicazione
# (`gate-pubblicazione.sh`). Era una convenzione copiata quattro volte, e le convenzioni si degradano
# copia dopo copia. Da qui in poi la copia è una.
#
# Uso (in cima allo script, prima di accendere il motore):
#   . "$SCRIPT_DIR/kill-switch.sh"
#   pausa_consenti_partenza "ritmo $RITMO_TIPO" || exit 0
#
# ⚙️ Perché in bash e non in node come le altre decisioni: `pausa_verdetto` la chiama anche il worker,
# dentro un ciclo che gira ogni secondo. Un processo node al secondo sarebbe 86.400 processi al
# giorno per una `case` di tre righe. Il file però è SORGIBILE, quindi una prova la ESEGUE davvero
# (`cervello/test/kill-switch.test.mjs`, `cervello/test/pausa-fail-closed.bats`) invece di cercarne
# la forma nel sorgente — che è la cosa che conta.

# ─────────────────────────────────────────────────────────────────────────────
# LA DECISIONE (pura: nessun I/O, nessuna rete)
# ─────────────────────────────────────────────────────────────────────────────

# pausa_verdetto <rc-della-curl> <corpo-della-risposta>
#   0 = via libera        · la pausa è spenta e l'ho VISTO
#   1 = in pausa          · Nicola ha girato l'interruttore
#   2 = non verificabile  · non ho potuto leggere lo stato (rete, token, HTTP≠2xx)
#
# Il 2 è il motivo per cui questa funzione esiste. Prima esistevano solo due risposte, e «non ho
# potuto leggere» finiva dentro «via libera»: lo stesso errore che il contratto 0/1/2 dei guardiani
# (AR-322) ha già corretto altrove. Un interruttore che non risponde non è un interruttore spento.
pausa_verdetto() {
  local rc="${1:-0}" corpo="${2:-}"
  # Un rc che non è nemmeno un numero è a maggior ragione «non ho potuto leggere»: cieco, non verde.
  if ! [ "$rc" -eq 0 ] 2>/dev/null; then return 2; fi
  if printf '%s' "$corpo" | grep -q '"valore":"on"'; then return 1; fi
  return 0
}

# pausa_motivo <verdetto> <etichetta> <rc>
# La frase da stampare. Sta qui e non nei chiamanti perché la stessa fermata deve raccontarsi con le
# stesse parole in tutti e quattro: quando il testo si copia, dopo un po' i testi divergono e non si
# capisce più se due log parlano dello stesso guasto.
pausa_motivo() {
  case "${1:-0}" in
    1) printf '⏸️  AD in PAUSA (kill-switch): %s saltato.\n' "${2:-lavoro}" ;;
    2) printf '⛔ PAUSA_FAIL_CLOSED: stato pausa non verificabile (rc=%s) — %s FERMATO per sicurezza: meglio fermo che partito mentre Nicola crede di averlo messo in pausa.\n' "${3:-?}" "${2:-lavoro}" ;;
    *) : ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# LE MANI (I/O: la chiamata a Supabase)
# ─────────────────────────────────────────────────────────────────────────────

# pausa_stato — legge l'interruttore. Stampa il corpo su stdout, torna l'rc della curl.
# Isolata dalla decisione apposta: così la prova può sostituire QUESTA e lasciare quella vera.
pausa_stato() {
  [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ] || return 0
  curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>/dev/null
}

# pausa_consenti_partenza <etichetta>
# 0 = puoi partire · 1 = non partire (in pausa o non verificabile). Stampa il motivo dove va letto:
# la pausa su stdout (è normale amministrazione), il fail-closed su stderr (è un guasto).
#
# ⚠️ Senza SUPABASE_URL/KEY il kill-switch non è collegato affatto — è il caso di un clone locale o
# della CI, dove non c'è nessun interruttore da rispettare. Lì si parte, come si è sempre fatto: il
# difetto è la rete che fallisce CON le chiavi presenti, non l'assenza di chiavi.
pausa_consenti_partenza() {
  local etichetta="${1:-lavoro}" corpo rc v _ts
  if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
    return 0
  fi
  rc=0
  corpo="$(pausa_stato)" || rc=$?
  v=0
  pausa_verdetto "$rc" "$corpo" || v=$?
  _ts="$(date '+%Y-%m-%d %H:%M')"
  case "$v" in
    0) return 0 ;;
    1) printf '[%s] %s' "$_ts" "$(pausa_motivo 1 "$etichetta" "$rc")"; return 1 ;;
    *) printf '[%s] %s' "$_ts" "$(pausa_motivo 2 "$etichetta" "$rc")" >&2
       pausa_segnala_cieco "$etichetta" "$rc"
       return 1 ;;
  esac
}

# pausa_segnala_cieco <etichetta> <rc> — il fail-closed ESCE dalla macchina.
#
# 2026-08-16 — fermarsi quando non si riesce a leggere l'interruttore è la scelta giusta e resta.
# Quello che mancava è che si sapesse. Il motivo andava solo su stderr, cioè nel journal del server:
# se Supabase diventa irraggiungibile CON le chiavi presenti, giro, ritmo e monitoraggio si fermano
# tutti e tre insieme e da fuori non arriva niente — e non può arrivare, perché la memoria non si
# pubblica proprio in quanto le cadenze sono ferme. In Cabina «Nicola ha messo in pausa» e «non
# riesco a leggere se è in pausa» erano indistinguibili: due cose molto diverse, una normale e una
# un guasto. Stessa famiglia del lucchetto orfano, terzo punto d'ingresso.
pausa_segnala_cieco() {
  local etichetta="${1:-lavoro}" rc="${2:-?}"
  PAUSA_ETICHETTA="$etichetta" PAUSA_RC="$rc" \
  PAUSA_LIB="${SCRIPT_DIR:-cervello}/git-github.mjs" \
  node -e '
    import(require("node:url").pathToFileURL(process.env.PAUSA_LIB).href).then(async (m) => {
      await m.stampSegnale(`pausa-${process.env.PAUSA_ETICHETTA}`.replace(/\s+/g, "-"), "errore",
        `stato pausa non verificabile (rc=${process.env.PAUSA_RC}): fermato per sicurezza, non e una pausa voluta`);
    }).catch(() => {});
  ' >/dev/null 2>&1 || true
  return 0
}
