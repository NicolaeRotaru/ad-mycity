#!/usr/bin/env bats
# AR-026 — un'azione reale (esegui-azione|proposta) interrotta a metà NON deve mai essere
# ri-eseguita da sola dal worker: deve andare in dead-letter con "riapprova", mai tornare in_attesa.
# Il test estrae le funzioni REALI da cervello/worker.sh (così se qualcuno rompe la regola, fallisce),
# stubba curl e cattura le PATCH che il worker manderebbe al DB.

setup() {
  REPO="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  WORKER="$REPO/cervello/worker.sh"
  CAP="$BATS_TEST_TMPDIR/patch.log"; : > "$CAP"

  # Stub di curl: GET lista in_corso → un orfano; PATCH → cattura url+body nel log.
  cat > "$BATS_TEST_TMPDIR/curl" <<STUB
#!/usr/bin/env bash
args="\$*"
if [[ "\$args" == *"-X PATCH"* ]]; then
  # l'ultimo argomento dopo -d è il body
  body=""; prev=""
  for a in "\$@"; do [ "\$prev" = "-d" ] && body="\$a"; prev="\$a"; done
  url=""; for a in "\$@"; do case "\$a" in http*) url="\$a";; esac; done
  # compatta il body su una riga sola per rendere il match robusto
  echo "PATCH \$url \$(printf '%s' "\$body" | tr -d '\n' | tr -s ' ')" >> "$CAP"
  exit 0
fi
# GET lista orfani in_corso
if [[ "\$args" == *"stato=eq.in_corso"* ]]; then
  echo '[{"id":"job-real-1","tipo":"esegui-azione","updated_at":"'"\$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","risultato":""},{"id":"job-giro-1","tipo":"giro","updated_at":"'"\$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","risultato":""}]'
  exit 0
fi
echo '[]'
STUB
  chmod +x "$BATS_TEST_TMPDIR/curl"
  PATH="$BATS_TEST_TMPDIR:$PATH"

  # Ambiente minimo che le funzioni si aspettano.
  export SUPABASE_URL="http://stub"; AUTH=(-H "x: y")
  SOGLIA_ORFANO_MIN=60
  ts() { echo "TS"; }
  _eta_min() { echo 1; }   # orfano "fresco" → senza il fix AR-026 avrebbe avuto la 2ª chance

  # Estrai le funzioni reali dal worker (dalla riga della def alla prima } a colonna 0).
  eval "$(awk '/^_dead_letter\(\) \{/,/^\}/' "$WORKER")"
  eval "$(awk '/^recupera_lavori_orfani\(\) \{/,/^\}/' "$WORKER")"
}

@test "un orfano esegui-azione va in errore+riapprova, MAI in_attesa (AR-026)" {
  recupera_lavori_orfani
  run cat "$BATS_TEST_TMPDIR/patch.log"
  # la PATCH su job-real-1 deve marcare stato errore e contenere 'riapprova'
  echo "$output" | grep -q 'job-real-1' || { echo "nessuna PATCH sull'azione reale"; false; }
  echo "$output" | grep 'job-real-1' | grep -q '"stato": *"errore"' || { echo "azione reale NON messa in errore: $output"; false; }
  echo "$output" | grep 'job-real-1' | grep -qi 'riapprova' || { echo "manca la nota riapprova: $output"; false; }
  # e NON deve MAI averla rimessa in_attesa (= ripartenza automatica vietata)
  if echo "$output" | grep 'job-real-1' | grep -q '"stato": *"in_attesa"'; then
    echo "REGRESSIONE AR-026: azione reale rimessa in coda da sola → rischio doppio invio"; false
  fi
}

@test "un orfano giro fresco mantiene la 2a chance (torna in_attesa)" {
  recupera_lavori_orfani
  run cat "$BATS_TEST_TMPDIR/patch.log"
  echo "$output" | grep 'job-giro-1' | grep -q '"stato": *"in_attesa"' || { echo "il giro fresco doveva avere la 2a chance: $output"; false; }
}
