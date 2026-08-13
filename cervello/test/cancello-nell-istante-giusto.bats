#!/usr/bin/env bats
# AR-395 + AR-394 — il cancello di pubblicazione, provato NELL'ISTANTE in cui gira.
#
# Malattia comune alle due schede: «il cancello montato nel punto sbagliato del tempo». Un controllo
# che gira quando non serve più è indistinguibile da un controllo assente, e stampa verde uguale.
#
#   AR-395 — in `giro.sh` il cancello veniva chiamato DOPO il `git commit`. Il commit svuota lo
#            stage, quindi il controllo del perimetro leggeva un insieme vuoto e rispondeva «nessun
#            file di codice, si passa». Zero voleva dire due cose diverse: «ho guardato e va bene» e
#            «non c'era niente da guardare».
#   AR-394 — il quarto posto del verdetto (`rc_one`, l'onestà) riceveva una variabile inizializzata
#            a 0 e mai più toccata. Quattro controlli promessi, tre fatti — e la firma della
#            funzione continuava a prometterne quattro.
#
# Qui non si cerca nessuna stringa nel sorgente: si costruisce un repo git VERO, si esegue il
# cancello vero nei due istanti, e si guarda cosa risponde.

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
GATE="$ROOT/cervello/gate-pubblicazione.sh"
GIRO="$ROOT/cervello/giro.sh"

setup() {
  TMP="$(mktemp -d)"
  REPO="$TMP/repo"
  GUARD="$TMP/guardiani"
  mkdir -p "$REPO" "$GUARD"
  git init -q -b main "$REPO"
  git -C "$REPO" config user.email prova@mycity
  git -C "$REPO" config user.name prova
  mkdir -p "$REPO/MyCity-Vault/90-Memoria-AI" "$REPO/cervello"
  echo "primo" > "$REPO/MyCity-Vault/90-Memoria-AI/STATO.md"
  git -C "$REPO" add -A
  git -C "$REPO" commit -q -m primo
  # I tre guardiani di verità, finti e verdi. `istante-cancello.mjs` è quello VERO: è la testa che
  # decide, e sostituirla vorrebbe dire provare qualcos'altro.
  guardiani_verdi
  cp "$ROOT/cervello/istante-cancello.mjs" "$GUARD/"
}

teardown() { [ -n "${TMP:-}" ] && rm -rf "$TMP"; }

guardiani_verdi() {
  local g
  for g in scan-segreti.mjs coerenza-fatti.mjs vault-sanita.mjs onesta-check.mjs; do
    printf 'process.exit(0)\n' > "$GUARD/$g"
  done
}

# Scrive un onesta-check finto che boccia sempre — come farebbe su un testo con un segnaposto.
onesta_rossa() { printf 'process.exit(1)\n' > "$GUARD/onesta-check.mjs"; }

# Mette della memoria nello stage: è lo stato in cui il cancello DEVE trovarsi quando lo chiami.
stage_memoria() {
  echo "aggiornato $(date)" >> "$REPO/MyCity-Vault/90-Memoria-AI/STATO.md"
  git -C "$REPO" add -A
}

cancello() { bash -c "cd '$REPO'; . '$GATE'; gate_pubblicazione '$GUARD' '$REPO' main ${1:-1}"; }

# ── AR-395: i due istanti ────────────────────────────────────────────────────

@test "AR-395: chiamato PRIMA del commit (memoria nello stage) → passa e ha davvero guardato" {
  stage_memoria
  run cancello 1
  [ "$status" -eq 0 ]
}

@test "AR-395 · IL CASO CHE HA ROTTO: chiamato DOPO il commit → non passa più in silenzio" {
  # Sequenza identica a quella che `giro.sh` faceva ogni due ore: add, commit, e SOLO POI il
  # cancello. Prima qui usciva 0 — il perimetro «passava» su uno stage che il commit aveva appena
  # svuotato. Adesso dice che non ha misurato niente, che è la verità.
  stage_memoria
  git -C "$REPO" commit -q -m "giro AD: aggiorna memoria"
  run cancello 1
  [ "$status" -eq 1 ]
  [[ "$output" == *"AR-395"* ]]
  [[ "$output" == *"VUOTO"* ]]
}

@test "AR-395: niente da pubblicare e nessuno che lo pretende → lo stage vuoto resta legittimo" {
  # La difesa non deve diventare un blocco: chi non dichiara lavoro in attesa ha il comportamento
  # di sempre (è il caso del `.githooks/pre-commit` e degli usi occasionali).
  run cancello 0
  [ "$status" -eq 0 ]
}

@test "AR-395: il perimetro continua a fermare il codice nello stage (nessuna regressione)" {
  echo "codice" > "$REPO/cervello/finto.sh"
  git -C "$REPO" add -A
  run cancello 1
  [ "$status" -eq 1 ]
  [[ "$output" == *"CODICE"* ]]
}

# ── AR-395: l'ORDINE VERO dentro giro.sh ─────────────────────────────────────
#
# Le prove qui sopra dimostrano che il cancello sa dire «non ho misurato». Questa dimostra l'altra
# metà, quella che il difetto chiedeva davvero: che in `giro.sh` il cancello venga chiamato PRIMA del
# commit. Non si cerca il testo — si eseguono le righe VERE di giro.sh (estratte dal file, non
# ricopiate) con il cancello e git sostituiti da due spie che scrivono in un registro. Poi si guarda
# l'ordine in cui i due atti sono avvenuti.

@test "AR-395 · IL CUORE: nelle righe vere di giro.sh il cancello gira PRIMA del commit" {
  ORDINE="$TMP/ordine.log"
  # Il cancello finto: registra di essere stato chiamato e lascia passare.
  printf 'gate_pubblicazione() { echo "CANCELLO" >> "%s"; return 0; }\n' "$ORDINE" > "$TMP/gate-pubblicazione.sh"

  run bash -c "
    set -uo pipefail
    SCRIPT_DIR='$TMP'; REPO='$REPO'; branch=main; GIT_ID=()
    GIRO_PUSH_OK=1; GIRO_PUSH_BLOCCATO=0; GIRO_HAD_CHANGES=0; GIT_PUSH_TOKEN=''; GIT_REPO=''
    ts() { echo '00:00'; }
    git() { case \"\$*\" in *commit*) echo 'COMMIT' >> '$ORDINE' ;; esac; }
    $(awk '/^    GIRO_HAD_CHANGES=1$/,/giro AD: aggiorna memoria/' "$GIRO")
    fi
  "
  [ "$status" -eq 0 ]
  # Due atti, in quest'ordine e non nell'altro. Prima era «COMMIT» e poi «CANCELLO»: il cancello
  # arrivava a stage già svuotato, e per il perimetro non c'era più niente da guardare.
  [ "$(head -1 "$ORDINE")" = "CANCELLO" ]
  [ "$(sed -n 2p "$ORDINE")" = "COMMIT" ]
}

@test "AR-395: se il cancello dice no, in giro.sh il commit NON avviene" {
  ORDINE="$TMP/ordine.log"
  printf 'gate_pubblicazione() { echo "CANCELLO" >> "%s"; return 1; }\n' "$ORDINE" > "$TMP/gate-pubblicazione.sh"

  run bash -c "
    set -uo pipefail
    SCRIPT_DIR='$TMP'; REPO='$REPO'; branch=main; GIT_ID=()
    GIRO_PUSH_OK=1; GIRO_PUSH_BLOCCATO=0; GIRO_HAD_CHANGES=0; GIT_PUSH_TOKEN=''; GIT_REPO=''
    ts() { echo '00:00'; }
    git() { case \"\$*\" in *commit*) echo 'COMMIT' >> '$ORDINE' ;; esac; }
    $(awk '/^    GIRO_HAD_CHANGES=1$/,/giro AD: aggiorna memoria/' "$GIRO")
    fi
  "
  [ "$status" -eq 0 ]
  [ "$(cat "$ORDINE")" = "CANCELLO" ]
  # Un cancello che dice no dopo che il commit è già stato fatto non ferma niente: ferma solo il push.
  # Questo è ciò che rende la posizione una differenza vera e non una preferenza di stile.
}

# ── AR-394: il quarto guardiano ──────────────────────────────────────────────

@test "AR-394 · IL CASO CHE HA ROTTO: onestà rossa in modo BLOCCA → il cancello ferma" {
  # È la prova che il quarto posto non è più morto. Prima di questa riparazione il gate usciva 0
  # qualunque cosa dicesse l'onestà, perché nessuno la eseguiva e `rc_one` restava lo zero della
  # dichiarazione. Con `GATE_ONESTA=blocca` un guardiano rosso deve fermare la pubblicazione
  # esattamente come gli altri tre.
  stage_memoria
  onesta_rossa
  run bash -c "cd '$REPO'; export GATE_ONESTA=blocca; . '$GATE'; gate_pubblicazione '$GUARD' '$REPO' main 1"
  [ "$status" -eq 1 ]
  [[ "$output" == *"AR-394"* ]]
}

@test "AR-394: onestà rossa in modo AVVISA → non blocca, ma NON tace" {
  # Il modo di oggi. La differenza con il difetto di partenza è tutta qui: allora il valore non
  # veniva nemmeno misurato, quindi nessuno poteva sapere che il quarto controllo non c'era.
  stage_memoria
  onesta_rossa
  run bash -c "cd '$REPO'; . '$GATE'; gate_pubblicazione '$GUARD' '$REPO' main 1"
  [ "$status" -eq 0 ]
  [[ "$output" == *"onestà"* ]]
}

@test "AR-394: onestà verde → il cancello passa e lo dice senza rumore" {
  stage_memoria
  run bash -c "cd '$REPO'; export GATE_ONESTA=blocca; . '$GATE'; gate_pubblicazione '$GUARD' '$REPO' main 1"
  [ "$status" -eq 0 ]
  [[ "$output" != *"⛔"* ]]
}

@test "AR-394/AR-633: il metro dell'onestà SPARITO è cieco — lo dice, e in modo BLOCCA ferma" {
  # Un metro che non c'è non compra il via libera: in modo `blocca` vale come rosso (AR-322).
  stage_memoria
  rm -f "$GUARD/onesta-check.mjs"
  run bash -c "cd '$REPO'; export GATE_ONESTA=blocca; . '$GATE'; gate_pubblicazione '$GUARD' '$REPO' main 1"
  [ "$status" -eq 1 ]
  [[ "$output" == *"metro assente"* ]]
}

@test "AR-394: metro assente in modo AVVISA → non spegne gli altri tre, ma NON tace" {
  # La proporzione conta: i tre guardiani storici proteggono la memoria in ogni clone, il quarto è
  # un'aggiunta che un clone parziale può non avere. Un pezzo mancante non deve poter fermare tutto
  # il resto — deve solo smettere di far finta di aver misurato.
  stage_memoria
  rm -f "$GUARD/onesta-check.mjs"
  run cancello 1
  [ "$status" -eq 0 ]
  [[ "$output" == *"metro assente"* ]]
  [[ "$output" == *"CIECO"* ]]
}
