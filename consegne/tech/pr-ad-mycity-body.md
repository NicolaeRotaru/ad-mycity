## Summary
- Ogni avviso in Azioni › Avvisi mostra una **descrizione in italiano semplice** sopra al testo tecnico.
- «Parla con questa casella» su un avviso include sempre la sezione **Descrizione dell'avviso** nel contesto mandato all'AD (richiesta Nicola 14/7).

## Test plan
- [ ] Azioni › Avvisi: sotto l'icona compare prima la spiegazione umana, poi il testo tecnico giallo.
- [ ] Apri «Parla con questa casella» su un avviso «memoria incoerente»: l'AD riceve descrizione + testo tecnico + data.
- [ ] `npx tsc --noEmit` in `pannello/` passa.
