## Summary
- **Storico → Decisioni:** ogni decisione è un pannello apri/chiudi (la più recente aperta, le altre mostrano anteprima); titoli e testi ripuliti in italiano semplice.
- **Storico → Stato & numeri:** due tab **Stato** | **OKR** (piani sotto OKR).
- **Memoria viva:** due tab **Memoria** | **Scoperte**; briefing e Sala Operativa restano aperti di default.

## Test plan
- [ ] Memoria → Storico → Decisioni: pannelli si aprono/chiudono, testo leggibile senza sigle in testa
- [ ] Memoria → Storico → Stato & numeri: tab Stato e OKR separati
- [ ] Memoria → Memoria viva: tab Memoria (briefing + sala aperti) e Scoperte
- [ ] `npx tsc --noEmit` in `pannello/` passa
