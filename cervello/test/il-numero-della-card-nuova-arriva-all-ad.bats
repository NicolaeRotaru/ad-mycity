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
  [[ "$out" == "- Numero per una card NUOVA: adesso è #212 "* ]]
  [[ "$out" == *"OGNI card"* ]]
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

# Il blocco VERO di giro.sh che costruisce il prompt, dalla riga che apre PROMPT fino a quella prima
# di GIRO_EXTRA_INSTRUCTION: si ritaglia e si ESEGUE, invece di cercarne il testo.
riga_di() { grep -n -F "$1" "$ROOT/cervello/giro.sh" | head -1 | cut -d: -f1; }
blocco_prompt_del_giro() {
  local da a
  da="$(riga_di 'PROMPT="Sei l')"
  a="$(riga_di 'if [ -n "${GIRO_EXTRA_INSTRUCTION:-}" ]; then')"
  [ -n "$da" ] && [ -n "$a" ] || return 1
  sed -n "${da},$((a - 1))p" "$ROOT/cervello/giro.sh"
}

@test "il giro mette la riga nel suo prompt: il blocco vero, eseguito" {
  blocco="$(blocco_prompt_del_giro)"
  [[ "$blocco" == *"riga_prossima_card"* ]]
  ts() { echo "2026-10-25 14:00"; }
  SCRIPT_DIR="$ROOT/cervello"
  eval "$blocco"
  [[ "$PROMPT" == *"Numero per una card NUOVA: adesso è #212 "* ]]
}

@test "il giro senza la riga condivisa dice NON LETTO nel prompt, non tace" {
  blocco="$(blocco_prompt_del_giro)"
  ts() { echo "2026-10-25 14:00"; }
  SCRIPT_DIR="$TMP/cartella-vuota"
  mkdir -p "$SCRIPT_DIR"
  eval "$blocco" 2>/dev/null
  [[ "$PROMPT" == *"Numero per una card NUOVA: NON LETTO"* ]]
}

@test "dopo il blocco, nessuno riscrive PROMPT da capo prima di lanciare il giro" {
  inizio="$(riga_di 'if [ -n "${GIRO_EXTRA_INSTRUCTION:-}" ]; then')"
  lancio="$(riga_di '"${AI_CMD[@]}" "$PROMPT"')"
  [ -n "$inizio" ] && [ -n "$lancio" ]
  # Ogni assegnazione a PROMPT fra i due deve ripartire da "$PROMPT": una che riparte da capo perde la riga.
  da_capo="$(sed -n "${inizio},${lancio}p" "$ROOT/cervello/giro.sh" | grep -E '^[[:space:]]*PROMPT="' | grep -vF 'PROMPT="$PROMPT' || true)"
  [ -z "$da_capo" ]
}

@test "un node che si pianta non tiene appeso il turno: dopo 10 secondi dice NON LETTO" {
  mkdir -p "$TMP/finto"
  printf '#!/usr/bin/env bash\nsleep 60\n' > "$TMP/finto/node"
  chmod +x "$TMP/finto/node"
  inizio=$SECONDS
  out="$(PATH="$TMP/finto:$PATH" riga_prossima_card "$ROOT/cervello")"
  durata=$((SECONDS - inizio))
  [[ "$out" == *"NON LETTO"* ]]
  [ "$durata" -lt 20 ]
}
