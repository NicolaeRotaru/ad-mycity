## Summary
- Unifica la chat «Parla con questa casella» con Assistente e chat fluttuante: stesso thread visibile ovunque si apra.
- Nuovo bus leggero `chat-unificata.ts`: ParlaCasella e page.tsx si sincronizzano senza loop.

## Test plan
- [ ] Apri una casella → «Parla con questa casella» → scrivi un messaggio
- [ ] Apri la chat fluttuante (bottone in basso a destra): devi vedere lo stesso filo
- [ ] Vai in Assistente → Conversazioni: la chat casella c’è con lo stesso titolo `💬 …`
- [ ] Apri la stessa casella da un’altra area: i messaggi precedenti ci sono
