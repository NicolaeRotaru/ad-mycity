#!/usr/bin/env bats
# 25/10/2026 — Il numero per una card NUOVA arriva all'AD, nel worker e nel giro.
#
# Archiviata la #211, la coda finiva a #210: chi contava dalla coda scriveva 211, un numero già speso.
# La maggior parte delle card la scrive l'AD a mano, da due porte (il worker, il giro). Qui si ESEGUE
# la riga che tutte e due mettono nel prompt (cervello/riga-prossima-card.sh), su una coda finta con
# il suo archivio accanto.

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"

setup() {
  TMP="$(mktemp -d)"
  cd "$TMP"
  mkdir -p MyCity-Vault/90-Memoria-AI/Archivio
  printf '### 🟡 #210 — Una card in attesa · ⏳ accodata 2026-10-21 10:00\n' > MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md
  printf '### ✅ #211 — Una card archiviata · ⏳ accodata 2026-10-24 18:00\n' > MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md
  . "$ROOT/cervello/riga-prossima-card.sh"
}

teardown() { rm -rf "$TMP"; }

@test "il caso che ha rotto: il numero conta anche la card archiviata" {
  out="$(riga_prossima_card "$ROOT/cervello")"
  [[ "$out" == "- Numero per una card NUOVA: #212 "* ]]
  [[ "$out" != *"#211"* ]]
}

@test "con l'archivio illeggibile dice NON LETTO, non un numero" {
  rm MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md
  mkdir MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md
  out="$(riga_prossima_card "$ROOT/cervello")"
  [[ "$out" == *"NON LETTO"* ]]
  [[ "$out" != *"#21"* ]]
}

@test "senza coda non c'è dove accodare: nessuna riga" {
  rm MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md
  out="$(riga_prossima_card "$ROOT/cervello")"
  [ -z "$out" ]
}

@test "il giro mette la stessa riga nel suo prompt, prima di partire" {
  # Il prompt del giro è costruito in mezzo a giro.sh e non si può eseguire da solo: qui si
  # controlla che carichi la riga condivisa e la attacchi a PROMPT. La riga stessa è provata sopra.
  grep -q '^if \. "\$SCRIPT_DIR/riga-prossima-card.sh"; then$' "$ROOT/cervello/giro.sh"
  grep -q '_riga_card="\$(riga_prossima_card "\$SCRIPT_DIR")"' "$ROOT/cervello/giro.sh"
  riga_prompt="$(grep -n '^PROMPT="Sei l.AD digitale' "$ROOT/cervello/giro.sh" | head -1 | cut -d: -f1)"
  riga_card="$(grep -n '_riga_card="\$(riga_prossima_card' "$ROOT/cervello/giro.sh" | head -1 | cut -d: -f1)"
  riga_lancio="$(grep -n '"\${AI_CMD\[@\]}" "\$PROMPT"' "$ROOT/cervello/giro.sh" | head -1 | cut -d: -f1)"
  [ -n "$riga_lancio" ]
  [ "$riga_prompt" -lt "$riga_card" ]
  [ "$riga_card" -lt "$riga_lancio" ]
}
