#!/usr/bin/env bats
# AR-028 — l'allineamento di ritmo.sh non deve più buttare via i commit di memoria non pushati.
# Prima: `git checkout -f -B branch FETCH_HEAD` resettava il ramo al remoto, orfanando il commit di
# recupero (e ogni commit locale non pushato). Ora: rebase → i commit locali restano in HEAD.
# Test 1 = invariante comportamentale su fixture git reale. Test 2/3 = guardie anti-regressione sul sorgente.

# Copia fedele dell'allineamento non-distruttivo (mirror del blocco AR-028 di ritmo.sh).
allinea_non_distruttivo() {
  local url="$1" branch="$2"
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    git add -A 2>/dev/null || true
    git commit -q -m "recupero: scritture pendenti" 2>/dev/null || true
  fi
  if git fetch "$url" "$branch" 2>/dev/null; then
    if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)" = "$branch" ]; then
      if ! git rebase FETCH_HEAD 2>/dev/null; then
        git rebase --abort 2>/dev/null || true
        git merge --no-edit FETCH_HEAD 2>/dev/null || git merge --abort 2>/dev/null || true
      fi
    fi
  fi
}

setup() {
  export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
  REMOTE="$BATS_TEST_TMPDIR/remote.git"
  git init -q -b main --bare "$REMOTE"
  git clone -q "$REMOTE" "$BATS_TEST_TMPDIR/a"
  cd "$BATS_TEST_TMPDIR/a"
  git checkout -q -B main
  mkdir -p MyCity-Vault/90-Memoria-AI
  echo base > MyCity-Vault/90-Memoria-AI/STATO.md
  git add -A && git commit -q -m base && git push -q origin main
  # un ALTRO clone fa avanzare il remoto (tocca un file diverso → nessun conflitto)
  git clone -q "$REMOTE" "$BATS_TEST_TMPDIR/b"
  cd "$BATS_TEST_TMPDIR/b"
  mkdir -p MyCity-Vault/90-Memoria-AI
  echo remoto > MyCity-Vault/90-Memoria-AI/DECISIONI.md
  git add -A && git commit -q -m "avanza remoto" && git push -q origin main
  cd "$BATS_TEST_TMPDIR/a"
}

@test "un commit locale non pushato sopravvive all'allineamento (AR-028)" {
  # simula: memoria di un giro il cui push era fallito → commit locale non pushato
  echo "riga-preziosa-FATTO" > MyCity-Vault/90-Memoria-AI/AZIONI.md
  git add -A && git commit -q -m "memoria non pushata"
  allinea_non_distruttivo "$BATS_TEST_TMPDIR/remote.git" main
  # la riga preziosa deve esistere ancora nel working tree E in git log
  [ -f MyCity-Vault/90-Memoria-AI/AZIONI.md ]
  run git log --oneline
  echo "$output" | grep -q "memoria non pushata" || { echo "COMMIT PERSO: $output"; false; }
  # e deve aver preso anche l'avanzamento remoto (il rebase l'ha applicato sotto)
  [ -f MyCity-Vault/90-Memoria-AI/DECISIONI.md ]
}

@test "ritmo.sh non contiene più il checkout -f distruttivo (guardia AR-028)" {
  run grep -E 'checkout -f -B' "$BATS_TEST_DIRNAME/../ritmo.sh"
  # deve comparire solo dentro un commento (spiegazione), mai come comando eseguito
  echo "$output" | grep -vqE '^\s*#|^\s*[0-9]+:\s*#' && { echo "checkout -f ANCORA eseguito: $output"; false; } || true
  # più diretto: nessuna riga NON-commento con quel comando
  run bash -c "grep -nE 'checkout -f -B' '$BATS_TEST_DIRNAME/../ritmo.sh' | grep -vE ':[[:space:]]*#'"
  [ -z "$output" ]
}

@test "ritmo.sh usa il rebase non-distruttivo (guardia AR-028)" {
  run grep -E 'rebase FETCH_HEAD' "$BATS_TEST_DIRNAME/../ritmo.sh"
  [ "$status" -eq 0 ]
}
