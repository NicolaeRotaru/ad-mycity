## Summary
- Radiografia macchina: voto **live** dalla sonda (75) invece dello scan fermo al 7/7 (51); banner che spiega che la lista problemi è una foto dell'audit mentre il **cantiere** si aggiorna coi fix
- Radiografia marketplace: banner di staleness quando l'audit ha >48h
- Poll auto-coscienza / radiografie: 60s → **30s**

## Perché
Nicola ha mergiato molti fix ma vedeva ancora decine di problemi: il Pannello rileggeva GitHub ma mostrava lo scan statico del 7 luglio, non il cantiere (42 chiusi, 1 in-corso).

## Come provare
1. Merge e attendi deploy Vercel
2. Apri Cervello → Radiografia di sé: voto ~75 con etichetta «live», banner giallo che rimanda al cantiere
3. Tab Cantiere: 1 in-corso (AR-006), 42 chiusi
4. Marketplace: banner se audit >48h
