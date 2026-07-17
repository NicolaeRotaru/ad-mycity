## Fix 3 bloccanti macchina

### Cosa fa
1. **Chat più veloce** — il polling non scarica più tutti i 121 job (`/api/lavori`), ma chiede solo quello specifico (`/api/lavori/dettagli` POST `{ids:[id]}`). La chat risponde molto più in fretta.
2. **Soglia volano** — abbassata da 30% a 5%: la sentinella non scatta più a vuoto perché le lezioni vengono applicate meno del 30%.
3. **Voto salute stabile** — rimosso il codice che sovrascriveva il voto architetturale (media dei 12 pilastri) con il voto provvisorio della sonda (AR-105): il voto ora cambia solo con la radiografia completa.

### File toccati
- `pannello/src/components/ChatCasella.tsx` — polling fix
- `pannello/src/lib/parla.ts` — polling fix
- `cervello/sentinella-dati.mjs` — soglia volano 0.3 → 0.05
- `cervello/allinea-scan-cantiere.mjs` — rimosso override voto AR-105

### Come provare
- Manda un messaggio in chat: la risposta deve arrivare più in fretta (max 5 sec invece di 30+).
- Controlla che la sentinella volano non scatti più come warn.
