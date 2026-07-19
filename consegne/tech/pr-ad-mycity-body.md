## Summary
- Fix #482 era su main ma insufficiente: il primo scroll avveniva prima che Markdown/sync DB finissero di allungare la chat.
- Ora: retry fino a ~3s + ResizeObserver quando apri dal menu Worker → resti sull'ultimo messaggio.

## Test plan
- [ ] Worker → Conversazioni → chat lunga (10+ messaggi) → ultimo messaggio visibile
- [ ] Attendi 2s senza scrollare → non salta in cima
- [ ] Chiudi menu con X senza cambiare chat → posizione invariata
