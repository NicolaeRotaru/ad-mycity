## Summary
- **Radiografia PostHog:** invece del generico «non collegato», la riga «Traffico (PostHog)» dice **cosa manca o è sbagliato** nelle env Vercel (host, project ID, chiave phx vs phc, EU vs US).
- Se le env ci sono ma l’API PostHog fallisce, mostra un messaggio d’errore troncato (senza segreti).

## Perché
Nicola ha configurato Vercel + redeploy ma Radiografia resta gialla — serviva capire **quale** delle 3 variabili è il problema senza andare a tentoni (L-414).

## Come provare
1. Mergia la PR → attendi deploy Vercel (~2 min).
2. Apri **Radiografia macchina** → riga «Traffico (PostHog)».
3. Se giallo, leggi il **dettaglio** sotto la riga (es. «manca POSTHOG_PROJECT_ID»).
4. Correggi su Vercel Production → Redeploy → ricarica: verde se tutto ok.
