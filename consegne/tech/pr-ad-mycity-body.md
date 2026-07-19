## Summary
- Caselle di Auto-coscienza (scelte ragionate, benchmark, esperimenti, peer review, proposte) ora sono **piegevoli**: titolo + 2 righe di anteprima, clic per espandere.
- Nuovo componente `CasellaAnteprima` riusabile — stesso pattern delle decisioni in Governo AD.
- In chiusura occupano ~metà spazio; il contenuto completo resta disponibile espandendo.

## Test plan
- [ ] Mergia la PR e attendi deploy Pannello (~2 min)
- [ ] Vai in Auto-coscienza → tab Analisi → «Scelte ragionate»: Ex Scuderie deve essere una riga compatta
- [ ] Clic sulla casella → si espande con evidenze, perché, note e «Parla con questa casella»
- [ ] Tab Miglioramento: stesso comportamento su benchmark, esperimenti, peer review, proposte
