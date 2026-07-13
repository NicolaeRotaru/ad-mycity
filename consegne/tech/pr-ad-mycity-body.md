## Summary
Auto-analisi nel Pannello: sensori, salute macchina e avvisi gap si aggiornano **live** ogni 30s (da `sensori-cecita.json`), non solo al giro. Banner chiarisce che testo/voto restano dell'ultimo giro finché non fai «fai un giro».

## Perché
Nicola voleva tutto l'auto-analisi «in tempo reale». Il poll c'era già ma mostrava dati del giro dell'11/7 (MCP gated, salute stale). Stesso pattern della radiografia (#344): due orologi — analisi testuale vs sensori live.

## Cosa cambia
- API `/api/memoria/auto-coscienza`: legge `sensori-cecita.json`, calcola `live` (salute, gap, timestamp)
- UI Auto-coscienza: chip salute · live, errori da gap freschi, banner giallo se analisi >24h

## Come provare
1. Merge + deploy Vercel
2. Apri Controllo → Auto-coscienza → tab Auto-analisi
3. Verifica chip «Supabase ok · live» e data sensori recente
4. Avviso MCP deve essere testo aggiornato, non copia dell'11/7
5. Banner giallo spiega due date (giro vs sensori)
