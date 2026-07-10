#!/usr/bin/env bats
# Titolo umano nel commit del worker (PR #238): la richiesta del lavoro, non il solo UUID.
# Esegue il blocco VERO estratto da worker.sh in un repo git temporaneo (mai sul repo reale).

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
WORKER="$ROOT/cervello/worker.sh"

setup() {
  TMP="$(mktemp -d)"
  cd "$TMP"
  git init -q .
  git config user.email test@test.local
  git config user.name Test
  echo x > file.txt
  git add file.txt
}

teardown() { rm -rf "$TMP"; }

# Esegue le righe vere di worker.sh (dal marcatore al commit) con gli stub del contesto worker.
esegui_blocco() {
  local richiesta="$1" id="$2"
  ts() { echo "12:00:00"; }
  GIT_ID=()
  eval "$(awk '/# Titolo umano nel commit/,/commit -q -m "worker: /' "$WORKER")"
}

@test "richiesta multilinea con accenti → titolo su una riga, UUID in coda" {
  esegui_blocco $'Controlla perché il negozio\nnon riceve ordini' "abc-123"
  titolo="$(git log -1 --format=%s)"
  [[ "$titolo" == "worker: Controlla perché il negozio non riceve ordini (abc-123 · 12:00:00)" ]]
}

@test "lettera accentata a cavallo del limite: mai UTF-8 spezzato (il difetto di cut -c)" {
  # 59 byte di 'a' + 'è' (2 byte): il taglio a 60 byte cade in MEZZO alla 'è'.
  local lunga
  lunga="$(printf 'a%.0s' $(seq 1 59))è e poi altra coda del messaggio"
  esegui_blocco "$lunga" "xyz-9"
  titolo="$(git log -1 --format=%s)"
  # deve restare UTF-8 valido (iconv strict non deve fallire) e senza byte orfani
  printf '%s' "$titolo" | iconv -f UTF-8 -t UTF-8 >/dev/null
  [[ "$titolo" == "worker: $(printf 'a%.0s' $(seq 1 59)) (xyz-9 · 12:00:00)" ]]
}

@test "richiesta vuota → fallback sul vecchio formato 'lavoro <id>' (nessuna regressione)" {
  esegui_blocco "" "def-456"
  titolo="$(git log -1 --format=%s)"
  [[ "$titolo" == "worker: lavoro def-456 (def-456 · 12:00:00)" ]]
}

@test "spazi ai bordi ripuliti dal titolo" {
  esegui_blocco $'   ciao Nicola   ' "id-1"
  titolo="$(git log -1 --format=%s)"
  [[ "$titolo" == "worker: ciao Nicola (id-1 · 12:00:00)" ]]
}

@test "guardia anti-drift: worker.sh contiene taglio a 60 byte + scrub iconv + nuovo formato -m" {
  grep -q 'head -c 60' "$WORKER"
  grep -q 'iconv -f UTF-8 -t UTF-8 -c' "$WORKER"
  grep -q 'commit -q -m "worker: ${titolo_breve} (${id:-?} · $(ts))"' "$WORKER"
}

@test "worker.sh ha sintassi valida (bash -n)" {
  bash -n "$WORKER"
}
