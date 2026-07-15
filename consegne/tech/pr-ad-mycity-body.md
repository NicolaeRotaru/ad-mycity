## Summary
- Deduplica le risposte chat duplicate nel worker: segmenti identici dopo tool-use e testo intero ripetuto due volte (bug «riassunto su riassunto»).
- Aggiunge regola nel prompt chat: non riscrivere in fondo una risposta già breve.

## Perché
Nicola vedeva lo stesso testo due volte nella stessa bolla (recidiva da giorni). Il parser `_estrai_stream` incollava segmenti uguali; l'AD a volte ripeteva il blocco intero.

## Come provare
1. `bash -c 'source <(sed -n "/^_estrai_stream() {/,/^}/p" cervello/worker.sh; sed -n "/^_dedup_risposta_chat() {/,/^}/p" cervello/worker.sh); f=/tmp/dup.jsonl; printf "%s\n" "{\"type\":\"assistant\",\"message\":{\"content\":[{\"type\":\"text\",\"text\":\"A\"}]}}" "{\"type\":\"assistant\",\"message\":{\"content\":[{\"type\":\"tool_use\",\"name\":\"Read\",\"input\":{}}]}}" "{\"type\":\"assistant\",\"message\":{\"content\":[{\"type\":\"text\",\"text\":\"A\"}]}}" > "$f"; _estrai_stream "$f"'` → deve stampare `A` una sola volta.
2. Dopo merge: invia un messaggio in chat ParlaCasella e verifica che la risposta non si ripeta.
