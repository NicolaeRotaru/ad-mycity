#!/usr/bin/env bats
# Il blocco CONTESTO MACCHINA iniettato in ogni turno di chat: qui gira la funzione VERA di
# worker.sh dentro un repo temporaneo. Senza Supabase configurato deve degradare con grazia
# (niente coda/segnali) e dire comunque la verità su branch, ultimo commit e file sporchi.
# È la contromisura alle cavolate del 10/7: sessioni che partivano cieche e lavoravano
# sul branch sbagliato dicendo «già fatto».

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
WORKER="$ROOT/cervello/worker.sh"

setup() {
  TMP="$(mktemp -d)"
  cd "$TMP"
  git init -q -b lavoro-di-prova .
  git config user.email t@t.local
  git config user.name T
  echo x > base.txt
  git add base.txt
  git commit -q -m "commit di partenza"
  unset SUPABASE_URL SUPABASE_SERVICE_KEY 2>/dev/null || true
}

teardown() { rm -rf "$TMP"; }

carica_funzione() {
  eval "$(awk '/^contesto_macchina_chat\(\)/,/^}/' "$WORKER")"
}

@test "dice branch e ultimo commit veri" {
  carica_funzione
  out="$(contesto_macchina_chat)"
  [[ "$out" == *"CONTESTO MACCHINA"* ]]
  [[ "$out" == *'`lavoro-di-prova`'* ]]
  [[ "$out" == *"commit di partenza"* ]]
}

@test "conta i file modificati non committati (con i nomi)" {
  carica_funzione
  echo y > sporco.txt
  out="$(contesto_macchina_chat)"
  [[ "$out" == *"File modificati non committati: 1 (sporco.txt)"* ]]
}

@test "senza Supabase degrada con grazia: niente coda/segnali, ma ora e repo escono comunque" {
  carica_funzione
  out="$(contesto_macchina_chat)"
  [[ "$out" != *"Coda lavori"* ]]
  [[ "$out" == *"- Ora: 20"* ]]
}

@test "legge le lezioni se LEZIONI-CHAT.md esiste" {
  carica_funzione
  mkdir -p MyCity-Vault/90-Memoria-AI
  printf -- '- [2026-07-10] lezione di prova uno\n- [2026-07-10] lezione due\n' > MyCity-Vault/90-Memoria-AI/LEZIONI-CHAT.md
  out="$(contesto_macchina_chat)"
  [[ "$out" == *"lezione di prova uno"* ]]
}

@test "guardia anti-drift: la chat riceve contesto + cassetta degli attrezzi + lezioni" {
  grep -q 'CASSETTA DEGLI ATTREZZI' "$WORKER"
  grep -q '_ctx_block="$(contesto_macchina_chat' "$WORKER"
  grep -q 'LEZIONI-CHAT.md' "$WORKER"
}
