## Summary
- Le chat aperte da **Lavori** («Chat con questa casella») non comparivano nel menu **Conversazioni** del Worker: vivevano solo nei lavori, non nella tabella condivisa.
- Ora la lista Worker integra i gruppi-lavoro di tipo chat mancanti nel DB.
- Quando scrivi da Lavori, la chat viene anche salvata in memoria condivisa (come le altre).

## Test plan
- [ ] Apri una chat da Lavori («Chat con questa casella»), scrivi un messaggio
- [ ] Apri il Worker → nel menu a sinistra deve comparire quella conversazione (titolo = primo messaggio)
- [ ] Cliccala: deve riaprire lo stesso thread
- [ ] Hard refresh (Ctrl+F5) → la chat resta in lista
