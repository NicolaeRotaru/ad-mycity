#!/usr/bin/env bats
# AR-390 — «Se la rete fa i capricci, la pausa di Nicola non ferma le cadenze del mattino e della sera».
#
# Il kill-switch del Pannello (`impostazioni.pausa = on`) veniva letto in quattro posti, ognuno con la
# sua copia della `curl`. Due la chiudevano con `|| true`: l'errore di rete spariva, la risposta vuota
# non conteneva `"valore":"on"`, e la cadenza PARTIVA mentre Nicola credeva di aver messo in pausa.
# Il fail-closed era stato installato dove il rischio si vedeva — il worker, che tocca il mondo, e il
# giro, che è il più frequente — e non era mai arrivato nelle copie accanto.
#
# Questa prova esegue la funzione VERA di `cervello/kill-switch.sh` con una `curl` VERA che fallisce
# davvero (un indirizzo che rifiuta la connessione): è la riproduzione esatta della rete che non
# risponde, non uno stub che ne imita l'idea.
#
# ⚠️ Cosa questa prova NON copre, detto chiaro: che `giro.sh`, `ritmo.sh`, `monitora.sh` e `worker.sh`
# chiamino la funzione. Quei quattro non sono sorgibili (in fondo lanciano il lavoro vero) e prima
# del kill-switch passano da `ai_check`, che senza motore AI installato ferma tutto: da qui non
# arrivano mai alla riga da provare. L'aggancio resta verificato solo dal `bash -n` e dalla lettura.

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
KILL="$ROOT/cervello/kill-switch.sh"

# Un indirizzo su cui nessuno ascolta: la curl fallisce sul serio (rc 7, connection refused).
RETE_MORTA="http://127.0.0.1:1"

@test "AR-390 · IL CASO CHE HA ROTTO: la rete non risponde → NON si parte" {
  run bash -c ". '$KILL'; SUPABASE_URL='$RETE_MORTA' SUPABASE_SERVICE_KEY=finta pausa_consenti_partenza 'ritmo mattino'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"PAUSA_FAIL_CLOSED"* ]]
  # Il messaggio deve dire il PERCHÉ, non solo che si è fermato: chi legge il log alle 6 del mattino
  # deve capire in una riga se il guasto è la pausa o la rete.
  [[ "$output" == *"non verificabile"* ]]
}

@test "AR-390: pausa accesa → non si parte, e si dice che è la pausa (non un guasto)" {
  run bash -c ". '$KILL'; pausa_stato() { printf '[{\"valore\":\"on\"}]'; }; SUPABASE_URL=x SUPABASE_SERVICE_KEY=y pausa_consenti_partenza 'giro'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"PAUSA"* ]]
  [[ "$output" != *"FAIL_CLOSED"* ]]
}

@test "AR-390: pausa spenta e letta davvero → si parte" {
  run bash -c ". '$KILL'; pausa_stato() { printf '[{\"valore\":\"off\"}]'; }; SUPABASE_URL=x SUPABASE_SERVICE_KEY=y pausa_consenti_partenza 'giro'"
  [ "$status" -eq 0 ]
}

@test "AR-390: senza chiavi il kill-switch non è collegato → si parte (clone locale, CI)" {
  # Il difetto è la rete che fallisce CON le chiavi, non l'assenza di chiavi: se fermassimo anche
  # qui, nessuno potrebbe più far girare nulla in locale. La difesa deve restare proporzionata.
  run bash -c ". '$KILL'; unset SUPABASE_URL SUPABASE_SERVICE_KEY; pausa_consenti_partenza 'giro'"
  [ "$status" -eq 0 ]
}

# ── il contratto a tre stati, eseguito ───────────────────────────────────────
# 0 = via libera · 1 = in pausa · 2 = non verificabile. Il 2 è la ragione per cui la funzione esiste:
# prima esistevano due sole risposte e «non ho potuto leggere» finiva dentro «via libera».

@test "AR-390: verdetto 2 quando la curl è fallita, anche se il corpo sembra innocuo" {
  run bash -c ". '$KILL'; pausa_verdetto 7 ''"
  [ "$status" -eq 2 ]
}

@test "AR-390: verdetto 2 anche se l'rc non è nemmeno un numero" {
  run bash -c ". '$KILL'; pausa_verdetto 'boh' '[{\"valore\":\"off\"}]'"
  [ "$status" -eq 2 ]
}

@test "AR-390: verdetto 1 su pausa accesa, 0 su pausa spenta" {
  run bash -c ". '$KILL'; pausa_verdetto 0 '[{\"valore\":\"on\"}]'"
  [ "$status" -eq 1 ]
  run bash -c ". '$KILL'; pausa_verdetto 0 '[{\"valore\":\"off\"}]'"
  [ "$status" -eq 0 ]
}
