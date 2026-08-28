#!/usr/bin/env bats
# irrobustimenti.bats — chiusura dei difetti di ROBUSTEZZA rimasti dalla radiografia (dopo i 5 gruppi
# principali). Nessuno «perde soldi» come i primi, ma irrobustiscono l'affidabilità. Verificano il
# comportamento puro dove possibile + il cablaggio dove è inline.

WORKER="${BATS_TEST_DIRNAME}/../worker.sh"
WATCH="${BATS_TEST_DIRNAME}/../vps/watch-main.sh"
RP="${BATS_TEST_DIRNAME}/../retry-policy.mjs"

need_node() { command -v node >/dev/null 2>&1 || skip "node non disponibile"; }

@test "worker.sh, watch-main.sh, retry-policy.mjs validi" {
  bash -n "$WORKER"
  bash -n "$WATCH"
  need_node; node --check "$RP"
}

# ── B3: 'proposta' NON è più pre-esecuzione (niente auto-retry → niente doppio invio) ────────────
@test "retry-policy: 'proposta' esclusa da TIPI_PRE_ESECUZIONE" {
  need_node
  run node -e "import('$RP').then(m=>process.exit(m.TIPI_PRE_ESECUZIONE.has('proposta')?1:0))"
  [ "$status" -eq 0 ]
}
@test "retry-policy: i tipi davvero pre-esecuzione restano (giro/chat/ritmo)" {
  need_node
  run node -e "import('$RP').then(m=>{const s=m.TIPI_PRE_ESECUZIONE;process.exit((s.has('giro')&&s.has('chat')&&s.has('ritmo-sera'))?0:1)})"
  [ "$status" -eq 0 ]
}

# ── E1 + git timeouts: fetch/push/ls-remote sotto timeout ────────────────────────────────────────
@test "watch-main: git fetch sotto timeout" {
  grep -q 'timeout "\${WATCH_FETCH_TIMEOUT:-60}" git fetch' "$WATCH"
}
# 28/8/2026 — LE TRE GREP CHIEDEVANO LA RIGA ESATTA, E LA RIGA È CAMBIATA PER UN MOTIVO BUONO.
#
# Cercavano `timeout "$_gt" git fetch` e simili. Nel frattempo fra `git` e il verbo si è infilato
# `"${C4_GIT_OPZ[@]}"` — le opzioni comuni, raccolte in un array invece di essere ricopiate ovunque.
# Il timeout non è mai stato tolto: le prove sono diventate rosse per un riordino.
#
# Adesso si chiede l'invariante e non l'impaginazione: ogni verbo di rete di git deve comparire
# almeno una volta avvolto in `timeout`, con quello che vuole in mezzo. Una riga che toglie il
# timeout fa ancora diventare rossa la prova; una che aggiunge un'opzione no.
timeout_su() {  # $1 = verbo di rete di git
  grep -cE "timeout [^|]*git [^|]*$1" "$WORKER"
}

@test "worker: sync_vault fetch e push sotto timeout" {
  [ "$(timeout_su fetch)" -ge 1 ] || { echo "nessun git fetch sotto timeout: una rete che non risponde blocca il worker"; false; }
  [ "$(timeout_su push)" -ge 1 ]  || { echo "nessun git push sotto timeout: la pubblicazione può restare appesa"; false; }
}
@test "worker: ls-remote di avvio sotto timeout" {
  [ "$(timeout_su ls-remote)" -ge 1 ] || { echo "il controllo di avvio non ha timeout: il worker può non partire mai"; false; }
}

# ── Probe fail-closed: le due sonde si accendono SOLO su un HTTP 200 esplicito ────────────────────
#
# 28/8/2026 — QUI LA PROVA ERA VERDE MENTRE DESCRIVEVA UNA REGOLA CHE IL CODICE NON USA PIÙ.
#
# La copia della logica qui sotto decideva «risposta che comincia con [ → accendi». È la regola
# vecchia. Il worker, dopo il guasto dell'11/7 sera, decide sull'HTTP: si accende SOLO su un 200
# esplicito, perché con `curl -f` un 400 di PostgREST non stampa nessun corpo — e la vecchia regola,
# che cercava il messaggio d'errore, dichiarava la colonna PRESENTE quando mancava. Da lì ogni claim
# finiva in 400 e la coda restava ferma con il worker vivo.
#
# La copia però continuava a passare, perché nessuno l'aveva aggiornata: una prova verde che
# raccontava una macchina che non esiste più. Adesso la copia dice la regola vera, e accanto c'è
# l'invariante sul sorgente: entrambe le sonde devono confrontarsi con 200.
@test "worker: le due sonde si accendono solo su un 200 esplicito (mai dall'assenza di errore)" {
  [ "$(grep -cE '= 200' "$WORKER")" -ge 2 ] || { echo "una sonda non decide più su un 200 esplicito: può accendersi al buio"; false; }
}
@test "comportamento probe fail-closed: solo un 200 accende, tutto il resto spegne" {
  decidi() { # $1 = codice HTTP restituito da curl → echo ON|OFF
    if [ "$1" = 200 ]; then echo ON; else echo OFF; fi
  }
  run decidi "000"; [ "$output" = OFF ]   # rete morta → OFF
  run decidi "400"; [ "$output" = OFF ]   # colonna assente (e nessun corpo, con curl -f) → OFF
  run decidi "500"; [ "$output" = OFF ]   # server in difficoltà → OFF
  run decidi "";    [ "$output" = OFF ]   # niente risposta → OFF
  run decidi "200"; [ "$output" = ON ]    # unica strada per accendersi
}

# ── Path traversal: '..' negli allegati viene scartato ──────────────────────────────────────────
@test "worker: allegato con '..' nel percorso scartato" {
  grep -q 'case "\$percorso" in \*\.\.\*)' "$WORKER"
}

# ── rispondi_chat_json: stdout JSON pulito (stderr scartato, non 2>&1) ───────────────────────────
@test "worker: la chat-json non mescola stderr nello stdout JSON" {
  grep -q 'output-format json "\$prompt" 2>/dev/null' "$WORKER"
}

# ── Fallback resume mirato: non su timeout ──────────────────────────────────────────────────────
@test "worker: il fallback senza-resume esclude i codici di timeout (124/137/143)" {
  [ "$(grep -c '\[ "\$rc" != 124 \] && \[ "\$rc" != 137 \] && \[ "\$rc" != 143 \]' "$WORKER")" -ge 2 ]
}

# ── Sweep temporanei orfani all'avvio ───────────────────────────────────────────────────────────
@test "worker: sweep dei tmp orfani (mycity-worker.* e mycity-allegati) all'avvio" {
  grep -q "name 'mycity-worker.\*' -mtime +1 -delete" "$WORKER"
  grep -q '/tmp/mycity-allegati -maxdepth 1 -mindepth 1 -mtime +1' "$WORKER"
}
