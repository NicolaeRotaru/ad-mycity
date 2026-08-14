#!/usr/bin/env bats
# AR-396 — «Il controllo del ramo prima di pubblicare sta prima del riallineamento, non prima
# dell'invio». La prova che DISTINGUE le due posizioni.
#
# Perché questo file esiste. Il difetto era già stato riparato nel codice — `ramo_ammesso` è stato
# spostato dentro il ciclo di `pubblica_memoria`, subito prima del `git push` — ma NON era mai stato
# chiuso, e la nota della scheda dice il perché con precisione:
#
#     «la prova NON discrimina: disattivando il controllo spostato il test resta verde 10/10, perché
#      il controllo pre-ciclo cattura già lo scenario. È lo stesso vizio che questa scheda denuncia —
#      la prova cerca la PRESENZA del controllo, non la sua POSIZIONE.»
#
# Il banco esistente (`push-albero-sporco.test.mjs`) usa un `git` finto che risponde SEMPRE lo stesso
# ramo: in quello scenario il primo controllo, quello prima del ciclo, ferma tutto da solo, e il
# secondo non ha niente da dimostrare. Serviva uno scenario in cui HEAD si stacca **dopo** che il
# primo controllo è già passato — l'unico in cui la posizione fa la differenza fra fermarsi e
# pubblicare metà lavoro su main.
#
# Qui il `git` finto risponde `main` alla PRIMA domanda sul ramo (quella pre-ciclo, che quindi passa)
# e `HEAD` alla SECONDA (quella dentro il ciclo, dopo fetch e rebase). Se il controllo sta nel posto
# giusto, il push non parte. Se sta solo fuori dal ciclo, il push parte — e il file `push.log` lo
# registra. La prova non guarda il sorgente: guarda se il push è successo.

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
GATE="$ROOT/cervello/gate-pubblicazione.sh"

# banco <ramo-prima> <ramo-dopo>
# Prepara un `git` finto che cambia risposta fra la prima e la seconda domanda sul ramo.
banco() {
  local prima="$1" dopo="$2"
  TMP="$(mktemp -d)"
  mkdir -p "$TMP/bin"
  CONT="$TMP/quante-volte"
  PUSH="$TMP/push.log"
  cat > "$TMP/bin/git" <<EOF
#!/usr/bin/env bash
case "\$*" in
  *"rev-parse --abbrev-ref HEAD"*)
    n=\$(cat "$CONT" 2>/dev/null || echo 0); n=\$((n + 1)); echo "\$n" > "$CONT"
    if [ "\$n" -le 1 ]; then echo "$prima"; else echo "$dopo"; fi
    exit 0 ;;
  *"rev-parse --git-path"*) echo "$TMP/niente"; exit 0 ;;
  *fetch*)  exit 0 ;;
  *rebase*) exit 0 ;;
  *push*)   echo "\$*" >> "$PUSH"; exit 0 ;;
esac
exit 0
EOF
  chmod +x "$TMP/bin/git"
  PATH="$TMP/bin:$PATH"
}

teardown() { [ -n "${TMP:-}" ] && rm -rf "$TMP"; }

@test "AR-396: HEAD si stacca DOPO il controllo pre-ciclo → zero push" {
  # È IL CASO CHE HA ROTTO. Il primo controllo dice «siamo su main» e lascia entrare nel ciclo; poi
  # fetch e rebase spostano HEAD su un avanzamento parziale. Solo il controllo AL CONFINE DELL'ATTO
  # può vederlo. Se il push parte, su main finisce meno lavoro di quello che c'è — e dal remoto
  # risulta fast-forward, quindi nessuno se ne accorge: verde da tutte le parti.
  banco main HEAD
  run bash -c ". '$GATE'; pubblica_memoria 'https://finto/repo.git' main 1 5"
  [ "$status" -eq 1 ]
  [ ! -f "$PUSH" ]
  [[ "$output" == *"AR-396"* ]]
}

@test "AR-396: il ramo giusto anche dopo il rebase → il push parte (la prova non è vacua)" {
  # Il caso di controllo: se il test rifiutasse sempre non proverebbe niente. Qui HEAD resta su main
  # in entrambe le domande e la pubblicazione deve andare fino in fondo.
  banco main main
  run bash -c ". '$GATE'; pubblica_memoria 'https://finto/repo.git' main 1 5"
  [ "$status" -eq 0 ]
  [ -f "$PUSH" ]
}

@test "AR-396: ramo sbagliato già in partenza → fermato dal controllo pre-ciclo, zero push" {
  # Il vecchio scenario (quello che il banco precedente copriva già): serve che continui a valere,
  # ma da solo NON distingue le due posizioni — è la ragione per cui il difetto era rimasto aperto.
  banco fix/lotto fix/lotto
  run bash -c ". '$GATE'; pubblica_memoria 'https://finto/repo.git' main 1 5"
  [ "$status" -eq 1 ]
  [ ! -f "$PUSH" ]
}
