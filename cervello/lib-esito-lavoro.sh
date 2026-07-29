#!/usr/bin/env bash
# lib-esito-lavoro.sh — LE MANI CHE REGISTRANO COM'È ANDATA (worker).
#
# La testa che DECIDE sta in `cervello/esito-scrittura.mjs` (modulo puro, provato dai test). Qui ci
# sono solo le mani: ritentare una PATCH, ricoverare un esito su disco, riprendere una pubblicazione
# rimandata. Nessuna decisione vive in questo file — è la regola che rende provabile il lotto.
#
# Perché esiste un file a parte invece di due funzioni dentro `worker.sh`: worker.sh non è
# sorgibile (in fondo parte il ciclo infinito), quindi qualunque cosa scritta lì dentro può essere
# solo GUARDATA da una prova, mai ESEGUITA. È così che AR-397 e AR-399 sono sopravvissuti alle
# radiografie. Da qui, invece, un test le chiama davvero — con un `curl` finto che fallisce a
# comando — e vede l'effetto sul disco.
#
# Uso:  . "$SCRIPT_DIR/lib-esito-lavoro.sh"
# Richiede: REPO, SCRIPT_DIR, ts(), SUPABASE_URL, AUTH[] — quello che worker.sh definisce già in testa.

# ─────────────────────────────────────────────────────────────────────────────
# ① AR-397 — LA REGISTRAZIONE È PARTE DELL'EFFETTO
# ─────────────────────────────────────────────────────────────────────────────
# «Il risultato di un lavoro si scrive una volta sola: se quella volta va storta, un'azione già
# partita torna in coda.» Alla fine di ogni lavoro il worker scriveva l'esito con UNA curl: se
# falliva, stampava una riga su stderr e passava oltre. Il lavoro restava `in_corso` per sempre;
# dopo la soglia la sentinella lo chiudeva in errore con «potrebbe essere già partita → riapprova
# dal Pannello» — cioè la regola che protegge dal doppio invio ne diventava la causa, perché
# l'azione ERA riuscita e non lo sapeva più nessuno.
#
# Due difese, entrambe al CONFINE DELL'ATTO (qui dentro, non nel chiamante):
#   · ritentativi con attesa crescente (la stessa politica di tutto il resto della catena);
#   · se falliscono tutti, l'esito si RICOVERA su disco e il worker lo ripubblica da solo.
#
# Dove si ricovera: dentro `.git/`, non in `cervello/stato/` come proponeva la scheda. La cartella
# git è l'unico posto del worktree che sopravvive a `git checkout -f` e a `git clean -fdx` — cioè
# proprio ai comandi che `aggiorna-cervello.sh` esegue sul server (AR-388). Un ricovero cancellato
# dall'allineamento sarebbe la malattia di partenza con un passaggio in più. Stesso posto del
# marcatore di scrittura di AR-317, per la stessa ragione.
esito_ricovero_dir() {
  printf '%s\n' "${ESITO_RICOVERO_DIR:-${REPO:-.}/.git/mycity-esito-ricovero}"
}

# scrivi_esito_lavoro <id> <body-json> [etichetta]
# Ritorna 0 se il database ha confermato la scrittura, 1 se l'esito è stato ricoverato.
# ⚠️ È l'UNICA porta da cui l'esito di un lavoro esce dal worker: entrambi i rami (ri-programmazione
# e stato finale) passano di qui. Il freno sta sul DATO, non sul singolo chiamante — altrimenti la
# prossima strada che scrive un esito ripartirebbe senza rete.
scrivi_esito_lavoro() {
  local id="${1:?serve id}" body="${2:?serve body}" etichetta="${3:-esito}"
  local max="${ESITO_TENTATIVI:-4}" tent attesa
  for (( tent = 1; tent <= max; tent++ )); do
    if curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id&stato=eq.in_corso" "${AUTH[@]}" -d "$body" >/dev/null 2>&1; then
      [ "$tent" -gt 1 ] && echo "[$(ts)] Lavoro $id: $etichetta scritto al tentativo $tent." >&2
      esito_ricovero_scarta "$id"
      return 0
    fi
    if [ "$tent" -lt "$max" ]; then
      attesa="$(node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" attesa --tentativo="$tent" 2>/dev/null || echo 2)"
      case "$attesa" in ''|*[!0-9]*) attesa=2 ;; esac
      echo "[$(ts)] Lavoro $id: $etichetta non scritto (tentativo $tent/$max) — riprovo fra ${attesa}s." >&2
      sleep "$attesa"
    fi
  done
  esito_ricovera "$id" "$body" "$etichetta"
  return 1
}

# esito_ricovera <id> <body> <etichetta> — l'esito che il database non ha accettato finisce su disco.
esito_ricovera() {
  local id="${1:?}" body="${2:?}" etichetta="${3:-esito}" dir file
  dir="$(esito_ricovero_dir)"
  file="$dir/$id.json"
  if ! mkdir -p "$dir" 2>/dev/null; then
    echo "[$(ts)] ⛔ Lavoro $id: esito PERSO — non riesco nemmeno a creare $dir." >&2
    return 1
  fi
  # Scrittura atomica (tmp + mv): un ricovero troncato è un ricovero che mente.
  if RIC_ID="$id" RIC_BODY="$body" RIC_ET="$etichetta" node -e '
    const fs=require("fs");
    const f=process.argv[1];
    let corpo; try{ corpo=JSON.parse(process.env.RIC_BODY); }catch{ corpo={risultato:process.env.RIC_BODY}; }
    const r={ id:process.env.RIC_ID, etichetta:process.env.RIC_ET, stato:corpo.stato||"", body:corpo,
              quando:new Date().toISOString(), _cosa_e:"Esito di un lavoro che il database non ha accettato (AR-397). Il worker lo ripubblica da solo al ciclo successivo: senza, un azione gia eseguita tornerebbe da riapprovare." };
    fs.writeFileSync(f+".tmp", JSON.stringify(r,null,2)+"\n");
    fs.renameSync(f+".tmp", f);
  ' "$file" 2>/dev/null; then
    echo "[$(ts)] ⛔ Lavoro $id: $etichetta NON scritto dopo ${ESITO_TENTATIVI:-4} tentativi — RICOVERATO in $file, lo ripubblico al prossimo ciclo." >&2
    return 0
  fi
  echo "[$(ts)] ⛔ Lavoro $id: esito PERSO (ricovero non riuscito in $file)." >&2
  return 1
}

# esito_ricoverato_esiste <id> → 0 se per quel lavoro c'è un esito in attesa di ripubblicazione.
# È il DATO su cui si sposta il controllo: lo guardano tutti e due i canali che chiudono gli orfani
# (questo worker e cervello/sentinella-lavori.mjs), invece di ripetere la regola in due posti.
esito_ricoverato_esiste() {
  local id="${1:-}"
  [ -n "$id" ] || return 1
  [ -f "$(esito_ricovero_dir)/$id.json" ]
}

esito_ricovero_scarta() {
  local id="${1:?}" dir
  dir="$(esito_ricovero_dir)"
  [ -f "$dir/$id.json" ] && rm -f "$dir/$id.json" 2>/dev/null
  return 0
}

# ripubblica_esiti_ricoverati — il worker rilegge i ricoveri e li riscrive.
# Il ricovero si butta SOLO quando il database ha confermato o quando dice che quel lavoro ha già un
# esito buono. Se lo stato non è leggibile, il file resta: un ricovero perso è di nuovo la malattia.
ripubblica_esiti_ricoverati() {
  local dir file id stato_attuale stato_ric body dec azione _riga_lavoro
  dir="$(esito_ricovero_dir)"
  [ -d "$dir" ] || return 0
  for file in "$dir"/*.json; do
    [ -f "$file" ] || continue
    id="$(basename "$file" .json)"
    stato_ric="$(jq -r '.stato // ""' "$file" 2>/dev/null || true)"
    body="$(jq -c '.body // {}' "$file" 2>/dev/null || true)"
    if [ -z "$body" ] || [ "$body" = "{}" ]; then
      echo "[$(ts)] Ricovero $id illeggibile — lo lascio dov'è (non lo butto)." >&2
      continue
    fi
    _riga_lavoro="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?id=eq.$id&select=stato" "${AUTH[@]}" 2>/dev/null || true)"
    stato_attuale="$(printf '%s' "$_riga_lavoro" | jq -r '.[0].stato // ""' 2>/dev/null || true)"
    dec="$(node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" ripubblica --stato="$stato_attuale" --ricoverato="$stato_ric" 2>/dev/null || true)"
    azione="$(printf '%s' "$dec" | sed -n 's/.*"azione":"\([^"]*\)".*/\1/p')"
    case "$azione" in
      scrivi)
        # Qui NON si filtra su stato=in_corso: il caso che il ricovero esiste per riparare è proprio
        # il lavoro chiuso in «errore» dalla sentinella mentre l'azione era invece riuscita.
        if curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" -d "$body" >/dev/null 2>&1; then
          echo "[$(ts)] ✅ Esito ricoverato del lavoro $id ripubblicato ($stato_ric)." >&2
          rm -f "$file" 2>/dev/null
        else
          echo "[$(ts)] Esito ricoverato del lavoro $id: riscrittura ancora fallita — riprovo al prossimo ciclo." >&2
        fi
        ;;
      scarta)
        echo "[$(ts)] Ricovero $id non serve più (il lavoro è «$stato_attuale») — lo tolgo." >&2
        rm -f "$file" 2>/dev/null
        ;;
      *)
        echo "[$(ts)] Ricovero $id: stato del lavoro non leggibile — lo tengo per il prossimo ciclo." >&2
        ;;
    esac
  done
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# ② AR-399 — LA PUBBLICAZIONE RIMANDATA CHE NESSUNO RIPRENDE
# ─────────────────────────────────────────────────────────────────────────────
# `sync_vault` ha quattro esiti e il chiamante ne leggeva uno. Con rc=2 (rimandata) e rc=3 (token
# assente) il lavoro si chiudeva «fatto» mentre la memoria non era mai uscita, e il ripescaggio era
# affidato all'arrivo del lavoro SUCCESSIVO: a coda vuota o worker fermo, non arrivava mai.
#
# Il marcatore rende il passo rimandato una cosa con un'ora di ripresa, che è ciò che la macchina sa
# già fare per i LAVORI (riprova_dopo) e non sapeva fare per i propri passi.
sync_pendente_file() {
  printf '%s\n' "${SYNC_PENDENTE_FILE:-${REPO:-.}/.git/mycity-sync-pendente}"
}

# segna_sync_pendente <rc> — da chiamare con l'rc di sync_vault. rc=0 cancella il marcatore.
segna_sync_pendente() {
  local rc="${1:-0}" f
  f="$(sync_pendente_file)"
  if [ "$rc" = 0 ]; then
    [ -f "$f" ] && { rm -f "$f" 2>/dev/null; echo "[$(ts)] Pubblicazione pendente recuperata: la memoria è su GitHub." >&2; }
    return 0
  fi
  # La PRIMA volta timbra l'ora; le successive la lasciano stare — l'età serve a misurare da quanto
  # la memoria non esce, non da quanto è passato dall'ultimo tentativo.
  if [ ! -f "$f" ]; then
    printf '%s %s\n' "$rc" "$(date +%s)" > "$f" 2>/dev/null || true
  fi
  return 0
}

# applica_esito_sync <rc-di-sync_vault> <tipo-lavoro>
# Stampa su stdout la riga JSON decisa da `esitoSync()` (stato · nota · pendente) e ALZA o TOGLIE il
# marcatore di pubblicazione pendente. Il chiamante si limita a leggere stato e nota.
#
# Sta qui e non dentro worker.sh apposta: la traduzione «rc → cosa dico a Nicola e cosa devo
# riprendere» è il punto in cui AR-399 viveva, e dentro worker.sh una prova potrebbe solo guardarla.
applica_esito_sync() {
  local rc="${1:-0}" tipo="${2:-}" dec
  dec="$(node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" sync --rc="$rc" --tipo="$tipo" 2>/dev/null || true)"
  if [ -z "$dec" ] && [ "$rc" != 0 ]; then
    # Nessuna risposta dalla testa: un dubbio non diventa un successo.
    dec='{"stato":"","nota":"[worker] Pubblicazione della memoria con esito non misurato — la tratto come NON pubblicata.","pendente":true}'
  fi
  [ -n "$dec" ] || dec='{"stato":"","nota":"","pendente":false}'
  if printf '%s' "$dec" | grep -q '"pendente":true'; then
    segna_sync_pendente "$rc"
  else
    segna_sync_pendente 0
  fi
  printf '%s\n' "$dec"
}

# sync_va_ripresa → 0 se è ora di riprovare la pubblicazione (e stampa il motivo su stderr).
# Alza la voce se la memoria è ferma da troppo: commit locali non pubblicati significano un Pannello
# che mostra numeri vecchi senza dirlo.
sync_va_ripresa() {
  local f rc quando dec esito motivo
  f="$(sync_pendente_file)"
  [ -f "$f" ] || return 1
  rc="$(awk '{print $1}' "$f" 2>/dev/null)"
  quando="$(awk '{print $2}' "$f" 2>/dev/null)"
  [ -n "$quando" ] || return 1
  esito=0
  dec="$(node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" ripresa \
    --quando="$(( quando * 1000 ))" --rc="${rc:-?}" \
    --cooldown="${SYNC_RIPRESA_COOLDOWN:-300}" --allarme-ore="${SYNC_ALLARME_ORE:-6}" 2>/dev/null)" || esito=$?
  motivo="$(printf '%s' "$dec" | sed -n 's/.*"motivo":"\([^"]*\)".*/\1/p')"
  if printf '%s' "$dec" | grep -q '"allarme":true'; then
    echo "[$(ts)] ⛔ MEMORIA NON PUBBLICATA da troppo tempo: ${motivo:-?} — il Pannello sta mostrando dati vecchi." >&2
    # L'allarme «visibile» che chiede la scheda: la riga sul canale che il Pannello legge, la stessa
    # che lasciano git-pr, git-merge e le cadenze. Su stderr finirebbe solo nel log del server — e il
    # sintomo di questo difetto è proprio che nessuno guarda lì. Se nemmeno l'avviso passa, lo si
    # dice: un avviso non recapitato non può passare per un avviso dato (è la malattia del lotto).
    SP_MOTIVO="${motivo:-pubblicazione ferma}" SP_LIB="${SCRIPT_DIR:-cervello}/git-github.mjs" node -e '
      import(require("node:url").pathToFileURL(process.env.SP_LIB).href).then(async (m) => {
        const ok = await m.stampSegnale("memoria-non-pubblicata", "errore", process.env.SP_MOTIVO);
        process.exit(ok ? 0 : 1);
      }).catch(() => process.exit(1));
    ' >/dev/null 2>&1 \
      || echo "[$(ts)] ⚠️  Avviso «memoria non pubblicata» NON recapitato al Pannello (resta solo questa riga di log)." >&2
  fi
  [ "$esito" = 0 ] || return 1
  return 0
}
