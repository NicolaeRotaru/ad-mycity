#!/usr/bin/env bash
# Runner leggero: estrae la funzione REALE chat_e_complesso dal worker e prova gli 8 casi.
# Equivalente a chat-veloce.bats, ma senza dipendere da `npx bats` (bloccato dalla chat Pannello).
set -u
cd "$(dirname "$0")/.."
FN="$(mktemp)"
sed -n '/^chat_e_complesso() {/,/^}/p' worker.sh > "$FN"
source "$FN"

LONG="$(head -c 300 /dev/zero | tr '\0' 'x')"
ok=0; ko=0

check() {
  chat_e_complesso "$2"
  local s=$?
  local got atteso
  [ "$s" -eq 0 ] && got="Opus" || got="veloce"
  [ "$3" -eq 0 ] && atteso="Opus" || atteso="veloce"
  if [ "$s" -eq "$3" ]; then
    printf '  OK   %-32s -> %s\n' "$1" "$got"; ok=$((ok+1))
  else
    printf '  FAIL %-32s atteso=%s ottenuto=%s\n' "$1" "$atteso" "$got"; ko=$((ko+1))
  fi
}

echo "=== CORSIA VELOCE - classificatore chat ==="
check "ciao come va"             "ciao, come va?"                     1
check "spiegami in due righe"    "spiegami questa cosa in due righe"  1
check "cosa devo decidere oggi"  "cosa devo decidere oggi?"           0
check "analizza gli incassi"     "analizza gli incassi di giugno"     0
check "spendere 200 euro in ads" "possiamo spendere 200 euro in ads?" 0
check "quanto abbiamo incassato" "quanto abbiamo incassato?"          0
check "messaggio lungo 300 char" "$LONG"                              0
check "fatti una radiografia"    "fatti una radiografia"              0
echo "=== Risultato: $ok passati, $ko falliti ==="
rm -f "$FN"
[ "$ko" -eq 0 ]
