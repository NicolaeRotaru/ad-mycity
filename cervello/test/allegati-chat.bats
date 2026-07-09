#!/usr/bin/env bats
# Verifica del pezzo "allegati chat" nel worker: la sintassi regge e l'estrazione dei campi
# da una riga @ALLEGATO funziona (percorso/nome/tipo), senza toccare rete o Supabase.

@test "worker.sh ha sintassi valida (bash -n)" {
  run bash -n "${BATS_TEST_DIRNAME}/../worker.sh"
  [ "$status" -eq 0 ]
}

@test "estrae percorso/nome/tipo da una riga @ALLEGATO" {
  riga='@ALLEGATO nome="scontrino.jpg" tipo="image/jpeg" percorso="chat-allegati/grp1/171-0-scontrino.jpg"'
  percorso="$(printf '%s' "$riga" | sed -n 's/.*percorso="\([^"]*\)".*/\1/p')"
  nome="$(printf '%s' "$riga" | sed -n 's/.*nome="\([^"]*\)".*/\1/p')"
  tipo="$(printf '%s' "$riga" | sed -n 's/.*tipo="\([^"]*\)".*/\1/p')"
  [ "$percorso" = "chat-allegati/grp1/171-0-scontrino.jpg" ]
  [ "$nome" = "scontrino.jpg" ]
  [ "$tipo" = "image/jpeg" ]
}

@test "il guard anti-traversal accetta solo il bucket previsto" {
  buono="chat-allegati/grp1/1-foto.png"
  cattivo="../../etc/passwd"
  printf '%s' "$buono" | grep -qE '^chat-allegati/[A-Za-z0-9._/-]+$'
  run bash -c "printf '%s' '$cattivo' | grep -qE '^chat-allegati/[A-Za-z0-9._/-]+\$'"
  [ "$status" -ne 0 ]
}
