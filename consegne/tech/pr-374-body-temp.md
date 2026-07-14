## Summary
- Ogni opportunità in Scoperte & proposte mostra una **descrizione in italiano semplice** (come già fatto per gli avvisi).
- «Parla con questa casella» su un'opportunità include sempre la sezione **Descrizione dell'opportunità** nel contesto mandato all'AD (richiesta Nicola 14/7 — casella «494 campi catalogo»).

## Test plan
- [ ] Scoperte & proposte › Opportunità: sotto il titolo compare la spiegazione umana (es. 494 campi = 252 condizione + 242 unità).
- [ ] Apri «Parla con questa casella» su quell'opportunità: l'AD riceve descrizione + dettaglio tecnico.
- [ ] `npx tsc --noEmit` in `pannello/` passa.
