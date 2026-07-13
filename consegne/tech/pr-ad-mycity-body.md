## Summary
Streaming chat partiva tardi: durante lettura dati/comandi Cursor non emette testo utile, quindi i parziali comparivano solo nell'ultima fase.

- Worker: segnale immediato «Sto elaborando…», stato «Sto verificando i dati…» durante tool_use, poll parziali ogni 0.5s (era 1.5s).
- Pannello: bolla pending con testo subito, poll ogni 400ms, refresh lavori appena accodato.

## Test plan
- [ ] Invia messaggio in chat → entro 1s compare «Sto elaborando…» o «Sto verificando i dati…»
- [ ] Durante la risposta il testo cresce dall'inizio (non solo negli ultimi secondi)
- [ ] Merge + deploy Vercel + aggiorna-cervello.sh sul VPS
