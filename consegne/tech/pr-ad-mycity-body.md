## Summary

Redesign Pannello home e menu salute come concordato con Nicola (grilling 13/7):

- **Menu:** tre voci separate — Radiografia macchina, Salute sito, Auto-coscienza (niente tab incastrate sotto «Controllo»)
- **Home:** ordine Da firmare → Ritmo → Lettera AD → KPI → card «La macchina» (8 pallini + link salute)
- **Radiografia macchina:** cartolina in cima, tab Lettera rimossa (lettera in home), archivio audit etichettato «foto storica»
- **Salute sito:** cartolina bloccanti/gravi, filtro minori dietro toggle
- **Auto-coscienza:** cartolina per scheda, lezioni ultimi 7 giorni + archivio

## Test plan

- [ ] Home: in cima «Da firmare», poi ritmo, lettera (anteprima + modale), KPI, card macchina con 8 pallini
- [ ] Menu: Radiografia macchina mostra cuore + organi + report senza tab
- [ ] Menu: Salute sito e Auto-coscienza aprono pagine dedicate
- [ ] Radiografia macchina: cartolina + «Da fare ora» prima dell’archivio
- [ ] Salute sito: solo bloccanti/gravi di default; «Mostra minori» espande
- [ ] Auto-coscienza: cartolina cambia per tab; apprendimento mostra ultime lezioni 7gg
- [ ] `npx tsc --noEmit` in `pannello/` passa
