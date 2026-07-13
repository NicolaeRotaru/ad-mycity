#!/usr/bin/env bats
# sessione-chat.bats — memoria di sessione della chat (worker.sh): la conversazione del Pannello
# riprende la STESSA sessione Claude (--resume) invece di ripartire da zero a ogni turno.
#
# Perché esiste: il worker lanciava una CLI nuova per OGNI messaggio — l'AD perdeva la memoria di
# lavoro (letture, comandi, tentativi) e girava in tondo ripetendo gli stessi errori. Questi test
# proteggono i pezzi puri della catena: estrazione del session_id dallo stream, normalizzazione
# della chiave gruppo, e la presenza del cablaggio --resume/fallback nel worker.

setup() {
  WORKER="$BATS_TEST_DIRNAME/../worker.sh"
  FN="$BATS_TEST_TMPDIR/sessione-chat.sh"
  sed -n '/^_estrai_session_id() {/,/^}/p' "$WORKER" > "$FN"
  sed -n '/^_chiave_gruppo() {/,/^}/p' "$WORKER" >> "$FN"
  grep -q '_estrai_session_id()' "$FN"
  grep -q '_chiave_gruppo()' "$FN"
  source "$FN"
}

# ── 1. session_id: si prende l'ULTIMO (ogni --resume genera un id nuovo; vale quello finale) ────
@test "session_id: estratto l'ultimo dello stream (init + result)" {
  f="$BATS_TEST_TMPDIR/sid.jsonl"
  cat > "$f" <<'EOF'
{"type":"system","subtype":"init","session_id":"sid-vecchio"}
{"type":"assistant","message":{"content":[{"type":"text","text":"Ciao."}]}}
{"type":"result","result":"Ciao.","session_id":"sid-nuovo"}
EOF
  run _estrai_session_id "$f"
  [ "$output" = "sid-nuovo" ]
}

# ── 2. Stream senza session_id (formati vecchi/parziali): vuoto, nessun errore ──────────────────
@test "session_id assente: output vuoto, exit 0" {
  f="$BATS_TEST_TMPDIR/nosid.jsonl"
  printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"text","text":"Ciao."}]}}' > "$f"
  run _estrai_session_id "$f"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

# ── 3. Riga JSON troncata (file ancora in scrittura): il parser non crasha ──────────────────────
@test "session_id con riga troncata in coda: robusto" {
  f="$BATS_TEST_TMPDIR/tronco.jsonl"
  cat > "$f" <<'EOF'
{"type":"system","subtype":"init","session_id":"sid-buono"}
{"type":"result","resu
EOF
  run _estrai_session_id "$f"
  [ "$status" -eq 0 ]
  [ "$output" = "sid-buono" ]
}

# ── 4. Chiave gruppo: UUID e id locali passano intatti ──────────────────────────────────────────
@test "chiave gruppo: uuid e loc_ id restano leggibili" {
  run _chiave_gruppo "3f2a1b0c-9d8e-7f60-a1b2-c3d4e5f60718"
  [ "$output" = "3f2a1b0c-9d8e-7f60-a1b2-c3d4e5f60718" ]
  run _chiave_gruppo "loc_m3x9ab12cd"
  [ "$output" = "loc_m3x9ab12cd" ]
}

# ── 5. Chiave gruppo: caratteri ostili (URL/injection) vengono spogliati ────────────────────────
@test "chiave gruppo: niente caratteri pericolosi verso URL/chiave" {
  run _chiave_gruppo 'abc&chiave=eq.pausa/../"x" y'
  [ "$output" = "abcchiaveeqpausaxy" ]
  run _chiave_gruppo '///&&&'
  [ -z "$output" ]
}

# ── 6. Cablaggio nel worker: resume, fallback e salvataggio esistono davvero ────────────────────
@test "worker: --resume, fallback senza sessione e salva_sessione_chat cablati" {
  grep -q -- '--resume "\$sid"' "$WORKER"                      # il run di stream sa riprendere
  grep -q 'CHAT_RESUME_SID=""' "$WORKER"                       # fallback: si azzera e si riparte
  grep -q 'salva_sessione_chat "\$gruppo_id"' "$WORKER"        # la mappa si aggiorna a ogni turno
  grep -q 'leggi_sessione_chat "\$gruppo_id"' "$WORKER"        # e si legge prima del turno
}

# ── 7. Regola «parti da zero» diventata dinamica: entrambe le varianti nel prompt ───────────────
@test "worker: regola memoria dinamica (sessione ripresa vs da zero)" {
  grep -q 'RIPRENDE una tua sessione precedente' "$WORKER"
  grep -q 'parte da ZERO' "$WORKER"
}

# ── 8. Anche la chat NON-stream ha la memoria di sessione (via --output-format json) ────────────
@test "worker: percorso chat non-stream cablato su rispondi_chat_json (memoria anche lì)" {
  grep -q 'rispondi_chat_json "\$to"' "$WORKER"
  grep -q -- '--output-format json' "$WORKER"
}

# ── 9. Igiene: le sessioni vecchie si puliscono all'avvio (il disco non cresce per sempre) ──────
@test "worker: pulizia sessioni con WORKER_SESSIONI_GIORNI" {
  grep -q 'WORKER_SESSIONI_GIORNI' "$WORKER"
}

# ── 10. Ragionamento esteso: il motore esporta il budget di thinking ────────────────────────────
@test "motore-ai: MAX_THINKING_TOKENS esportato (override CERVELLO_THINKING_TOKENS)" {
  M="$BATS_TEST_DIRNAME/../motore-ai.sh"
  grep -q 'MAX_THINKING_TOKENS' "$M"
  grep -q 'CERVELLO_THINKING_TOKENS' "$M"
}

# ── 11. Il contesto macchina arriva anche ai LAVORI (esegui-azione + generico), non solo chat ───
@test "worker: contesto_macchina_chat iniettato nelle corsie di lavoro" {
  [ "$(grep -c 'contesto_macchina_chat 2>/dev/null' "$WORKER")" -ge 3 ]
}

# ── 12. diagnosi_errore: quota → silenzio (ci pensa la retry-policy); errore vero → spiegazione ─
@test "diagnosi_errore: quota non chiama l'AI, errore vero produce la seconda passata" {
  FN2="$BATS_TEST_TMPDIR/diagnosi.sh"
  sed -n '/^diagnosi_errore() {/,/^}/p' "$WORKER" > "$FN2"
  grep -q 'diagnosi_errore()' "$FN2"
  source "$FN2"
  ai_build_cmd() { AI_CMD=(echo DIAGNOSI:); }
  run diagnosi_errore "Error: usage limit reached (429 rate_limit)"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
  run diagnosi_errore "TypeError: cannot read properties of undefined (reading foo)"
  [ "$status" -eq 0 ]
  [[ "$output" == DIAGNOSI:* ]]
}

# ── 13. Pannello mai al buio col thinking: placeholder «sto ragionando» nello stream ────────────
@test "worker: placeholder 💭 mentre il modello pensa (prima del primo testo)" {
  grep -q 'Sto ragionando' "$WORKER"
}
