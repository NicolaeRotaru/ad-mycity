## Summary
- Aprendo una chat dal menu a sinistra del Worker, la vista va all'**ultimo messaggio** invece che all'inizio.
- Causa: lo scroll scattava a 120ms mentre il cassetto era ancora in animazione (200ms) e il layout si resettava.
- Fix: dopo la scelta dal cassetto, scroll forzato al fondo a fine animazione (+ retry per messaggi lunghi).

## Test plan
- [ ] Apri Worker a schermo intero → menu Conversazioni → scegli chat lunga → deve mostrare l'ultimo messaggio
- [ ] Chiudi il menu con X senza cambiare chat → se eri a metà lettura, resti lì
- [ ] Nuovo messaggio mentre sei in fondo → segue il fondo; se sei risalito → non ti strappa giù
