#!/usr/bin/env bash
# ✍️ IL TITOLO UMANO DEL COMMIT DEL WORKER — la decisione, in una casa sua.
#
# PERCHÉ ESISTE QUESTO FILE, e non è un riordino. La prova `cervello/test/worker-titolo-commit.bats`
# non chiamava questa logica: se la RITAGLIAVA da `worker.sh` con un `awk` fra due marcatori di
# testo, e poi la eseguiva con `eval`. Ha funzionato finché nessuno ha scritto dentro quel tratto.
# Poi AR-314 ci ha messo il cancello prima del commit — `. "$SCRIPT_DIR/gate-pubblicazione.sh"` —
# e da quel momento il ritaglio si portava dietro una `source` di un percorso che nella prova non
# esiste: l'`eval` moriva prima di arrivare al commit e **sei casi su otto** erano rossi. Nessuno
# l'ha visto per mesi, perché `bats` non lo installava nessuno (AR-693).
#
# LA REGOLA CHE APPLICA (③ del cantiere): la logica che decide deve stare dove un test la può
# ESEGUIRE — funzione pura, senza dipendenze, in un file suo; il punto malato la chiama. Finché
# stava in mezzo al `sync_vault`, l'unica prova possibile era ritagliare del testo — ed è
# esattamente il tipo di prova che ha lasciato vivere il difetto.
#
# Si carica con `. cervello/titolo-commit.sh` e non fa niente da sola.

# Il titolo di una riga da mettere nel commit, dato il testo della richiesta e l'id del lavoro.
#
#   titolo_commit "<richiesta>" "<id>"   → stampa il titolo, sempre non vuoto
#
# Le clausole, tutte già provate da worker-titolo-commit.bats:
#  · la busta della chat del Pannello («## Conversazione finora / Nicola: … / AD: …») porta dentro
#    più messaggi: il titolo utile è l'ULTIMO di Nicola, non l'intestazione tecnica;
#  · gli a-capo diventano spazi (un titolo di commit è una riga sola);
#  · via le intestazioni della busta e gli spazi ai bordi;
#  · taglio a 60 BYTE, non a 60 caratteri: `cut -c` e `${var:0:60}` in locale C spezzano l'UTF-8 a
#    metà di una lettera accentata, e il commit esce con un byte orfano;
#  · `iconv -c` scarta l'eventuale lettera spezzata in coda. NB (glibc): con `-c` stampa il prefisso
#    valido ma esce ≠0 sul byte spezzato — niente `||` sullo stesso stdout, duplicherebbe il testo;
#  · richiesta vuota → `lavoro <id>`, il vecchio formato: nessuna regressione.
titolo_commit() {
  local richiesta="${1:-}" id="${2:-}" titolo_grezzo titolo_breve scrub_utf8
  titolo_grezzo="$richiesta"
  [ "${titolo_grezzo#*Nicola:}" != "$titolo_grezzo" ] && titolo_grezzo="${titolo_grezzo##*Nicola:}"
  titolo_breve="$(printf '%s' "$titolo_grezzo" | tr '\n' ' ' \
    | sed 's/^[[:space:]]*//; s/^##[[:space:]]*//; s/^Nuovo messaggio di Nicola[[:space:]]*//; s/^Conversazione finora[[:space:]]*//; s/[[:space:]]*$//' \
    | head -c 60)"
  scrub_utf8="$(printf '%s' "$titolo_breve" | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null || true)"
  [ -n "$scrub_utf8" ] && titolo_breve="$scrub_utf8"
  [ -z "$titolo_breve" ] && titolo_breve="lavoro ${id:-?}"
  printf '%s' "$titolo_breve"
}
