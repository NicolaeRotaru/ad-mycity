## Summary
Chiude tutti i problemi della dimensione radiografia **«Come pensa l'AD»** (vettori-installati):

- **120 quaderni** memoria-squadra (bootstrap 78 stub mancanti)
- **Scorecard 6 assi** nel RITUALE DI FINE di tutti i 120 agenti + template STAMPO aggiornato
- **Hook [[RUBRICA-LIVELLI]]** sui 5 senior customer che mancavano
- **Numeri rollout** aggiornati da 42/42 a 120/120 (STAMPO + chiusura-loop)
- **10 kit banche/legal** espansi (sezione E, procedure, galleria)
- **Nuovo guardiano** `stampo-check.mjs` cablato in `giro.sh` (120/120 verde)

## Test plan
- [ ] `node cervello/stampo-check.mjs` → exit 0, `120/120 senior completi`
- [ ] `node cervello/chiusura-loop.mjs --sonda` → `0 mancanti`, totale 120
- [ ] Pannello → Radiografia macchina → casella «Come pensa l'AD» → voto/stato aggiornati dopo merge
