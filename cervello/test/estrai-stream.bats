#!/usr/bin/env bats
# estrai-stream.bats — _estrai_stream (worker.sh) ricompone la risposta chat dallo stream-json.
#
# Bug riprodotto (chat del Pannello, 2026-07-10): quando l'AD legge un dato a metà risposta
# (Read/Grep), la CLI spezza la risposta in PIÙ messaggi assistant; l'evento finale "result"
# contiene SOLO l'ultimo. Il vecchio parser preferiva "result" → a fine generazione la risposta
# COLLASSAVA nella sola coda («Vuoi che parta da una di queste 5?» senza la lista delle 5).
# Secondo bug: i delta dello streaming venivano stampati con jq -r (un a-capo per frammento)
# → parole spezzate a video mentre l'AD scrive.

setup() {
  WORKER="$BATS_TEST_DIRNAME/../worker.sh"
  FN="$BATS_TEST_TMPDIR/estrai-stream.sh"
  sed -n '/^_estrai_stream() {/,/^}/p' "$WORKER" > "$FN"
  # la funzione deve esistere nel worker (se il marker cambia, il test deve fallire rumorosamente)
  grep -q '_estrai_stream()' "$FN"
  source "$FN"
}

# ── 1. IL BUG DELLA CHAT: risposta spezzata da un uso-strumento → serve TUTTO il testo ──────────
@test "multi-messaggio con tool-use: la risposta NON collassa nella sola coda" {
  f="$BATS_TEST_TMPDIR/multi.jsonl"
  cat > "$f" <<'EOF'
{"type":"system","subtype":"init"}
{"type":"assistant","message":{"content":[{"type":"text","text":"Ecco le 5 cose non fatte:\n1) A\n2) B\n3) C\n4) D\n5) E"}]}}
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Read","input":{"file_path":"x"}}]}}
{"type":"user","message":{"content":[{"type":"tool_result","content":"..."}]}}
{"type":"assistant","message":{"content":[{"type":"text","text":"Vuoi che parta da una di queste 5 non fatte?"}]}}
{"type":"result","result":"Vuoi che parta da una di queste 5 non fatte?"}
EOF
  run _estrai_stream "$f"
  [ "$status" -eq 0 ]
  # c'è la LISTA (il pezzo che prima spariva)…
  [[ "$output" == *"1) A"* ]]
  [[ "$output" == *"5) E"* ]]
  # …e c'è anche la coda
  [[ "$output" == *"Vuoi che parta da una di queste 5 non fatte?"* ]]
  # in ordine: prima la lista, poi la domanda
  [[ "$output" == "Ecco le 5 cose non fatte:"* ]]
}

# ── 2. Risposta semplice (un solo messaggio): identica a prima, nessuna regressione ─────────────
@test "messaggio singolo: testo integrale invariato" {
  f="$BATS_TEST_TMPDIR/single.jsonl"
  cat > "$f" <<'EOF'
{"type":"assistant","message":{"content":[{"type":"text","text":"Ciao Nicola, tutto ok."}]}}
{"type":"result","result":"Ciao Nicola, tutto ok."}
EOF
  run _estrai_stream "$f"
  [ "$output" = "Ciao Nicola, tutto ok." ]
}

# ── 3. Streaming in corso (solo delta): frammenti INCOLLATI, niente a-capo dentro le parole ─────
@test "delta streaming: le parole non si spezzano su piu' righe" {
  f="$BATS_TEST_TMPDIR/delta.jsonl"
  cat > "$f" <<'EOF'
{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":"Ciao Ni"}}}
{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":"cola, co"}}}
{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":"me va?"}}}
EOF
  run _estrai_stream "$f"
  [ "$output" = "Ciao Nicola, come va?" ]
}

# ── 4. Fallback estremo: solo l'evento result (run senza streaming) ─────────────────────────────
@test "solo result: il fallback lo restituisce" {
  f="$BATS_TEST_TMPDIR/result.jsonl"
  printf '%s\n' '{"type":"result","result":"Risposta dal fallback."}' > "$f"
  run _estrai_stream "$f"
  [ "$output" = "Risposta dal fallback." ]
}

# ── 5. File vuoto: output vuoto (il worker deve poter ripiegare sul run non-stream) ─────────────
@test "file vuoto: nessun output, nessun errore" {
  f="$BATS_TEST_TMPDIR/vuoto.jsonl"
  : > "$f"
  run _estrai_stream "$f"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

# ── 6. Markdown: le righe vuote DENTRO un messaggio (paragrafi) sopravvivono ────────────────────
@test "paragrafi markdown dentro un messaggio: preservati" {
  f="$BATS_TEST_TMPDIR/md.jsonl"
  printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"text","text":"Primo paragrafo.\n\nSecondo paragrafo."}]}}' > "$f"
  run _estrai_stream "$f"
  [[ "$output" == *"Primo paragrafo."* ]]
  [[ "$output" == *"Secondo paragrafo."* ]]
  # il doppio a-capo tra i paragrafi c'è ancora (run normalizza i trailing, quindi conta le righe)
  [ "$(printf '%s' "$output" | wc -l)" -ge 2 ]
}

# ── 7. Riga JSON troncata in coda (file ancora in scrittura): non crasha, dà il parseabile ──────
@test "ultima riga troncata (scrittura in corso): parser robusto" {
  f="$BATS_TEST_TMPDIR/troncato.jsonl"
  cat > "$f" <<'EOF'
{"type":"assistant","message":{"content":[{"type":"text","text":"Testo completo."}]}}
{"type":"assistant","message":{"content":[{"type":"te
EOF
  run _estrai_stream "$f"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Testo completo."* ]]
}

# ── 8. Messaggi solo-tool_use (nessun testo): non produce righe vuote fantasma ──────────────────
@test "tool_use senza testo: nessun contenuto fantasma tra i pezzi" {
  f="$BATS_TEST_TMPDIR/soli-tool.jsonl"
  cat > "$f" <<'EOF'
{"type":"assistant","message":{"content":[{"type":"text","text":"Prima."}]}}
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Read","input":{}}]}}
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Grep","input":{}}]}}
{"type":"assistant","message":{"content":[{"type":"text","text":"Dopo."}]}}
EOF
  run _estrai_stream "$f"
  # esattamente: "Prima." + separatore paragrafo + "Dopo." (i tool_use non lasciano buchi extra)
  [ "$output" = "Prima.
Dopo." ] || [ "$output" = "Prima.

Dopo." ]
}

# ── 9. SUBAGENT (Task): i messaggi interni del sotto-agente NON finiscono nella risposta ────────
# (difetto trovato in verifica avversariale: la CLI emette anche gli eventi assistant dei subagent,
# marcati con parent_tool_use_id; senza filtro il loro report interno si cuciva nella risposta.)
@test "delega a subagent: il testo interno del sotto-agente resta fuori" {
  f="$BATS_TEST_TMPDIR/subagent.jsonl"
  cat > "$f" <<'EOF'
{"type":"assistant","message":{"content":[{"type":"text","text":"Chiedo all'analista."}]},"parent_tool_use_id":null}
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Task","input":{}}]},"parent_tool_use_id":null}
{"type":"assistant","message":{"content":[{"type":"text","text":"RAPPORTO INTERNO DEL SUBAGENT: kpi grezzi..."}]},"parent_tool_use_id":"toolu_123"}
{"type":"user","message":{"content":[{"type":"tool_result","content":"..."}]}}
{"type":"assistant","message":{"content":[{"type":"text","text":"Ecco la sintesi per te."}]},"parent_tool_use_id":null}
EOF
  run _estrai_stream "$f"
  [[ "$output" == *"Chiedo all'analista."* ]]
  [[ "$output" == *"Ecco la sintesi per te."* ]]
  [[ "$output" != *"RAPPORTO INTERNO"* ]]
}

# ── 10. Fallback result MULTILINEA: intero, non tagliato all'ultima riga ────────────────────────
@test "result multilinea nel fallback: testo intero (niente tail-riga)" {
  f="$BATS_TEST_TMPDIR/result-multi.jsonl"
  printf '%s\n' '{"type":"result","result":"Riga uno\nRiga due\nRiga tre"}' > "$f"
  run _estrai_stream "$f"
  [[ "$output" == *"Riga uno"* ]]
  [[ "$output" == *"Riga tre"* ]]
}

# ── 12. Cursor/agent: partial assistant spezzati a syllable → incollati, non a-capo ───────────────
@test "partial assistant Cursor: frammenti consecutivi incollati (niente parola per riga)" {
  f="$BATS_TEST_TMPDIR/cursor-partial.jsonl"
  cat > "$f" <<'EOF'
{"type":"assistant","message":{"content":[{"type":"text","text":"ret"}]}}
{"type":"assistant","message":{"content":[{"type":"text","text":"ro"}]}}
{"type":"assistant","message":{"content":[{"type":"text","text":" di circa un minuto."}]}}
EOF
  run _estrai_stream "$f"
  [ "$output" = "retro di circa un minuto." ]
}

# ── 13. Dopo tool-use: segmenti separati da paragrafo (regressione multi-messaggio) ─────────────
@test "assistant + delta + tool + testo: segmenti ordinati e delta live dopo tool" {
  f="$BATS_TEST_TMPDIR/mix-stream.jsonl"
  cat > "$f" <<'EOF'
{"type":"assistant","message":{"content":[{"type":"text","text":"Prima frase."}]}}
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Read","input":{}}]}}
{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":"Dopo"}}}
{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":" tool."}}}
EOF
  run _estrai_stream "$f"
  [[ "$output" == *"Prima frase."* ]]
  [[ "$output" == *"Dopo tool."* ]]
  [[ "$output" != *"Prima frase.Dopo"* ]]
}

# ── 14. Riga JSON valida ma NON-oggetto (es. un numero): non fa abortire il parser ──────────────
@test "riga non-oggetto nello stream: ignorata, il resto sopravvive" {
  f="$BATS_TEST_TMPDIR/non-oggetto.jsonl"
  cat > "$f" <<'EOF'
{"type":"assistant","message":{"content":[{"type":"text","text":"Testo buono."}]}}
42
"solo una stringa"
{"type":"assistant","message":{"content":[{"type":"text","text":"Altro testo buono."}]}}
EOF
  run _estrai_stream "$f"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Testo buono."* ]]
  [[ "$output" == *"Altro testo buono."* ]]
}
