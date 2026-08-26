#!/usr/bin/env bats
# Titolo umano nel commit del worker (PR #238): la richiesta del lavoro, non il solo UUID.
# Esegue la funzione VERA (cervello/titolo-commit.sh) in un repo git temporaneo, mai sul repo reale.
#
# ⚠️ COME ERA SCRITTA PRIMA, e perché è stata riscritta — AR-693/AR-798.
# Questa prova RITAGLIAVA il tratto di worker.sh fra due marcatori di testo (`awk '/# Titolo umano
# nel commit/,/commit -q -m "worker: /'`) e lo eseguiva con `eval`. Ha funzionato finché nessuno ha
# scritto dentro quel tratto. Poi AR-314 ci ha messo `. "$SCRIPT_DIR/gate-pubblicazione.sh"`: il
# ritaglio si portava dietro una `source` di un percorso qui inesistente, l'`eval` moriva prima del
# commit, e SEI casi su otto erano rossi. Invisibili per mesi, perché `bats` non lo installava
# nessuno. Adesso la decisione sta in un file suo e la prova la chiama: un tratto di codice nuovo in
# worker.sh non può più far cadere questi casi, e se la decisione si rompe cadono davvero.

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

# Costruisce il titolo con la funzione vera e fa il commit come lo fa il worker.
esegui_blocco() {
  local richiesta="$1" id="$2" titolo_breve
  ts() { echo "12:00:00"; }
  GIT_ID=()
  . "$ROOT/cervello/titolo-commit.sh"
  titolo_breve="$(titolo_commit "$richiesta" "$id")"
  git "${GIT_ID[@]}" commit -q -m "worker: ${titolo_breve} (${id:-?} · $(ts))"
}

# 🔗 IL PONTE: la prova esegue la funzione, ma il worker deve CHIAMARLA — altrimenti questi otto
# casi resterebbero verdi con la logica scollegata dalla porta che la usa, che è il modo in cui una
# prova smette di guardare senza diventare rossa (AR-798).
@test "worker.sh chiama titolo_commit invece di costruirsi il titolo da sé" {
  grep -q 'titolo-commit.sh' "$WORKER"
  grep -q 'titolo_commit "' "$WORKER"
  # e non deve essere rimasta la vecchia costruzione a mano dentro worker.sh
  ! grep -q 'scrub_utf8' "$WORKER"
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

@test "busta chat con storia: il titolo è l'ULTIMO messaggio di Nicola, non l'intestazione" {
  esegui_blocco $'## Conversazione finora\nNicola: aggiungimi le skill dentro la chat\nAD: fatto, ci penso io\nNicola: non le vedo ancora' "id-2"
  titolo="$(git log -1 --format=%s)"
  [[ "$titolo" == "worker: non le vedo ancora (id-2 · 12:00:00)" ]]
}

@test "busta chat primo messaggio ('## Nuovo messaggio di Nicola'): via l'intestazione tecnica" {
  esegui_blocco $'## Nuovo messaggio di Nicola\nmi dà molto fastidio che ogni volta la chat scatta in giù' "id-3"
  titolo="$(git log -1 --format=%s)"
  [[ "$titolo" == "worker: mi dà molto fastidio che ogni volta la chat scatta in giù (id-3 · 12:00:00)" ]]
}

# La vecchia «guardia anti-drift» cercava tre stringhe dentro worker.sh — `head -c 60`,
# `iconv … -c`, il formato del `-m`. Rimetterla puntata al file nuovo sarebbe cambiare nome al tubo
# e non al vizio (AR-375): il taglio a 60 byte e lo scrub sono GIÀ provati per comportamento dal
# caso della lettera accentata a cavallo del limite, e una parola cercata in un file non frena.
# Quello che il grep copriva davvero e nessun altro caso copre è il FORMATO del messaggio di commit
# — e quello si prova guardando il commit, non il sorgente.
@test "guardia anti-drift: il formato del messaggio è «worker: <titolo> (<id> · <ora>)»" {
  esegui_blocco "una richiesta qualunque" "id-fmt"
  titolo="$(git log -1 --format=%s)"
  [[ "$titolo" == "worker: una richiesta qualunque (id-fmt · 12:00:00)" ]]
}

@test "guardia anti-drift: il taglio è a 60 BYTE, non a 60 caratteri" {
  esegui_blocco "$(printf 'a%.0s' $(seq 1 70))" "id-cut"
  titolo="$(git log -1 --format=%s)"
  [[ "$titolo" == "worker: $(printf 'a%.0s' $(seq 1 60)) (id-cut · 12:00:00)" ]]
}

@test "worker.sh ha sintassi valida (bash -n)" {
  bash -n "$WORKER"
}
