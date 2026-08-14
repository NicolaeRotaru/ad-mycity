# c4-segreti.sh — UN SEGRETO VIVE SOLO NELL'AMBIENTE DEL PROCESSO (AR-278 · AR-428).
#
# Si "sourcia", non si esegue:  . "$SCRIPT_DIR/c4-segreti.sh"
#
# ── Cosa era rotto ────────────────────────────────────────────────────────────────────────────────
# In undici punti fra giro.sh, worker.sh, ritmo.sh e monitora.sh la chiave di servizio della memoria
# — quella con cui si SCRIVE la tabella `impostazioni`, dove vive il kill-switch della pausa — e il
# token di GitHub viaggiavano dentro gli argomenti dei comandi:
#     curl -H "apikey: $SUPABASE_SERVICE_KEY" …
#     git fetch "https://x-access-token:${GIT_PUSH_TOKEN}@github.com/…"
# Su Linux gli argomenti di un processo sono leggibili da chiunque giri sulla macchina (`ps aux`,
# /proc/PID/cmdline). La regola scritta in questo repo diceva «mai nel codice, mai nei log»: la riga
# di comando non era nell'elenco, e quello che non è nell'elenco non è coperto.
#
# ── La regola, adesso, in positivo ────────────────────────────────────────────────────────────────
# Un segreto sta nell'AMBIENTE del processo. Da lì può passare a un figlio (git lo legge col suo
# programma askpass) o a un file di configurazione leggibile solo da noi (curl lo legge con
# --config). Mai in un argomento, mai dentro un indirizzo.
# Il guardiano che lo misura è `node cervello/c4-cancelli.mjs segreti-argomenti`: fallisce sul
# dodicesimo punto che dovesse nascere, in qualunque script del cervello.
#
# ── Cosa NON copre, detto chiaro ──────────────────────────────────────────────────────────────────
# Il file di configurazione di curl è un file vero sul disco: nasce con permessi 600 dentro una
# cartella temporanea privata e viene cancellato all'uscita, ma se il processo viene ucciso di netto
# (kill -9) resta lì finché qualcuno non pulisce /tmp. È comunque un passo avanti netto rispetto
# agli argomenti, che sono leggibili da CHIUNQUE, subito, senza permessi.

# ──────────────────────────────────────────────────────────────────────────────────────────────────
# GIT — l'indirizzo non porta più il token; la password la dà l'ambiente al programma askpass.
# ──────────────────────────────────────────────────────────────────────────────────────────────────

# L'indirizzo del repo SENZA credenziali dentro.  Uso:  url="$(c4_git_url)"
c4_git_url() {
  printf 'https://github.com/%s.git' "${GIT_REPO:-}"
}

# Prepara il canale di autenticazione. Dopo la chiamata:
#   · GIT_ASKPASS punta a cervello/c4-askpass.sh (che legge GIT_PUSH_TOKEN dall'ambiente);
#   · C4_GIT_OPZ contiene le opzioni da passare a git PRIMA del sottocomando.
# `credential.helper=` vuoto azzera la catena degli helper di sistema: senza, un helper installato
# sulla macchina risponderebbe per primo con una credenziale vecchia e askpass non verrebbe mai
# chiamato — il classico «funziona sul mio, non sul server».
c4_git_prepara() {
  local qui
  qui="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
  export GIT_ASKPASS="$qui/c4-askpass.sh"
  export GIT_TERMINAL_PROMPT=0     # niente prompt interattivo: su un VPS non c'è nessuno a rispondere
  [ -n "${GIT_PUSH_TOKEN:-}" ] && export GIT_PUSH_TOKEN
  [ -n "${GIT_TOKEN:-}" ] && export GIT_TOKEN
  C4_GIT_OPZ=(-c "credential.helper=")
  return 0
}

# ──────────────────────────────────────────────────────────────────────────────────────────────────
# CURL — le intestazioni autenticate arrivano da un file di configurazione privato, non da argv.
# ──────────────────────────────────────────────────────────────────────────────────────────────────

C4_CURL_CFG=""

# Crea il file di configurazione con le due intestazioni della memoria e popola:
#   C4_CURL_AUTH = (--config <file>)   ← da usare al posto di  -H "apikey: …" -H "Authorization: …"
# Ritorna 1 (e lascia C4_CURL_AUTH vuoto) se la chiave non c'è: chi chiama decide cosa fare, invece
# di scoprire l'assenza a metà di una richiesta.
c4_curl_prepara() {
  C4_CURL_AUTH=()
  [ -n "${SUPABASE_SERVICE_KEY:-}" ] || return 1
  local dir
  dir="$(umask 077; mktemp -d -t mycity-auth.XXXXXX 2>/dev/null)" || return 1
  C4_CURL_CFG="$dir/curl.cfg"
  ( umask 077
    printf 'header = "apikey: %s"\nheader = "Authorization: Bearer %s"\n' \
      "$SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY" > "$C4_CURL_CFG"
  ) || return 1
  chmod 600 "$C4_CURL_CFG" 2>/dev/null || true
  C4_CURL_AUTH=(--config "$C4_CURL_CFG")
  return 0
}

# Cancella il file di configurazione. Va agganciata a una trap EXIT dal chiamante.
c4_curl_chiudi() {
  [ -n "${C4_CURL_CFG:-}" ] && rm -rf "$(dirname "$C4_CURL_CFG")" 2>/dev/null
  C4_CURL_CFG=""
  C4_CURL_AUTH=()
  return 0
}
