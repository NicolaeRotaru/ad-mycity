# shellcheck shell=bash
# 🔢 La riga «Numero per una card NUOVA» per i prompt dell'AD: il worker (contesto_macchina_chat,
# quindi anche i lavori lanciati dal Pannello) e il giro.
#
# PERCHÉ IN UN FILE SUO. Il 25/10 il numero di una card nuova poteva tornare uno già speso: archiviata
# la #211, la coda finiva a #210. La maggior parte delle card la scrive l'AD a mano, e da due porte:
# il worker e il giro. Una riga sola per tutte e due, in un file che la prova ESEGUE (come
# titolo-commit.sh): due copie della stessa frase, prima o poi, dicono due cose diverse.
#
# Uso:  . cervello/riga-prossima-card.sh ; riga_prossima_card [cartella-cervello] [percorso-coda]
# Stampa la riga, senza a capo finale. Se la coda non c'è, non stampa niente: non c'è dove accodare.
# Se il numero non si legge, lo DICE (NON LETTO) invece di lasciare l'AD a contare da solo.
#
# Il numero è una FOTOGRAFIA: fra il contesto e la scrittura può nascere un'altra card (la card di
# merge di `git-pr.mjs --accoda`, un altro lavoro, un altro tentativo del giro). Per questo la riga
# dice di rilanciare il comando subito prima di OGNI card, e la scrittura di un numero già speso la
# ferma comunque `mano-fermata.mjs`. Il comando ha un tetto di 10 secondi: questa riga entra in
# ogni prompt, e un disco inceppato non deve tenere appeso il turno.
riga_prossima_card() {
  local dir="${1:-cervello}" coda="${2:-MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md}" n=""
  [ -f "$coda" ] || return 0
  n="$(timeout 10s node "$dir/prossima-card.mjs" --coda "$coda" 2>/dev/null)" || n=""
  if [ -n "$n" ]; then
    printf '%s' "- Numero per una card NUOVA: adesso è #$n (il più alto mai usato + 1, contando anche l'archivio delle card chiuse). È una fotografia: subito prima di scrivere OGNI card, anche la prima e dopo ogni git-pr.mjs --accoda, rilancia node cervello/prossima-card.mjs. Con Claude Code, una scrittura con Edit o Write che usa un numero già speso viene fermata; da Bash, o con un altro motore, no."
  else
    printf '%s' "- Numero per una card NUOVA: NON LETTO — prima di accodare lancia node cervello/prossima-card.mjs (conta anche l'archivio)."
  fi
}
