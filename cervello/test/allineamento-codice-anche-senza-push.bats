#!/usr/bin/env bats
# Il codice deve arrivare da main ANCHE quando i commit del server non si riescono a pubblicare.
#
# Il 20/8 il server è rimasto dodici giorni senza ricevere codice: aveva 19 commit di memoria che il
# rebase non riusciva a rimettere in fila, e `aggiorna-cervello.sh` usciva su quell'errore PRIMA di
# allineare il codice. Risultato: la riparazione del lucchetto, già mergiata su main, non è mai
# arrivata lassù — e la macchina non era più riparabile da remoto proprio mentre serviva ripararla.
#
# La finta riproduce il guasto VERO: server e main hanno scritto tutti e due sullo stesso file di
# memoria, quindi il rebase va in conflitto e il codice non arriva da sé. Una finta col solo push
# rotto NON basta: lì il rebase riesce e porta il codice comunque, e il test resta verde col difetto.

setup() {
  REPO_VERO="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  cd "$BATS_TEST_TMPDIR"

  git init -q --bare origin.git
  git init -q semina && cd semina
  git config user.email t@t && git config user.name t
  mkdir -p cervello/vps MyCity-Vault/90-Memoria-AI
  echo vecchio > cervello/worker.sh
  echo base > MyCity-Vault/90-Memoria-AI/STATO.md
  git add -A && git commit -q -m base
  git push -q ../origin.git HEAD:main
  echo RIPARATO > cervello/worker.sh
  echo 'memoria scritta su main' > MyCity-Vault/90-Memoria-AI/STATO.md
  git commit -qam "fix del lucchetto + memoria"
  git push -q ../origin.git HEAD:main
  cd ..

  # il server: fermo al commit base, con memoria sua non pubblicata sullo STESSO file
  git clone -q --branch main origin.git server
  cd server
  git config user.email t@t && git config user.name t
  git reset -q --hard HEAD~1
  echo 'memoria scritta dal server' > MyCity-Vault/90-Memoria-AI/STATO.md
  git commit -qam "giro AD: aggiorna memoria"
  mkdir -p cervello/vps
  cp "$REPO_VERO/cervello/vps/aggiorna-cervello.sh" cervello/vps/
  cp "$REPO_VERO/cervello/allineamento-esito.sh" cervello/
  cp "$REPO_VERO/cervello/scritture-a-rischio.mjs" cervello/ 2>/dev/null || true
  git add -A && git commit -q -m copioni

  # Da root il copione si ri-lancia via sudo come utente del server: qui quell'utente non esiste, e
  # a noi interessa il ramo che fa il lavoro. Ci presentiamo non-root.
  mkdir -p "$BATS_TEST_TMPDIR/bin"
  cat > "$BATS_TEST_TMPDIR/bin/id" <<'STUB'
#!/usr/bin/env bash
[ "$1" = -un ] && { echo tester; exit 0; }
exec /usr/bin/id "$@"
STUB
  chmod +x "$BATS_TEST_TMPDIR/bin/id"
}

@test "la memoria che non si pubblica NON impedisce al codice di arrivare da main" {
  cd "$BATS_TEST_TMPDIR/server"
  run env PATH="$BATS_TEST_TMPDIR/bin:$PATH" \
      REPO="$BATS_TEST_TMPDIR/server" GIT_BRANCH=main \
      GIT_REMOTE_URL="$BATS_TEST_TMPDIR/origin.git" \
      GIT_PUSH_TOKEN=finto GIT_REPO=finto/finto \
      bash cervello/vps/aggiorna-cervello.sh

  # esce 5: «commit del server non pubblicati» — il segnale resta quello giusto
  [ "$status" -eq 5 ]
  # ...ma la riparazione è arrivata lo stesso: è questa la riga che diventa rossa col difetto
  [ "$(cat cervello/worker.sh)" = RIPARATO ]
  # ...e il commit del server è ancora qui, non buttato
  git log --oneline | grep -q "giro AD: aggiorna memoria"
}
