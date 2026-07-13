## Summary
- Nuovo script che allinea la lista audit al cantiere vivo dopo ogni fix (voto 75, 7 findings chiusi, sync ogni giro)
- Pannello: tab predefinita «Da fare ora» (1 pezzo), archivio audit separato, header mostra «1 da fare»
- Marketplace: etichetta chiara che i numeri sono dello scan del 7/7

## Perché
I fix chiudevano il cantiere (42 chiusi) ma il Pannello mostrava ancora 74 problemi dello scan statico del 7 luglio.

## Come provare
1. Merge e deploy
2. Cervello → Radiografia: tab «Da fare ora» con badge 1, voto 75 live
3. «Archivio audit» mostra il resto con data 7/7
4. Dopo un giro, sync_scan si refresha da solo
