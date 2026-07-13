## Summary
- **Streaming:** se manca la bolla «sto pensando» (refresh/race), la ricrea dai parziali nel DB; forza `loading` per poll 1s.
- **Pallini:** il badge usa solo risposte **finite** — i parziali `in_corso` non fanno tornare il pallino dopo che hai letto.

## Perché
Verificato sul server: il worker scrive i parziali in Supabase (rev `1081be71`), ma il Pannello non li mostrava; i pallini tornavano perché ogni parziale aggiornava `ultimoAt` del gruppo.

## Come provare
1. Mergia anche #341 se ancora in coda, poi questa PR.
2. Attendi deploy Vercel (~2 min), Ctrl+F5.
3. Scrivi in chat → testo cresce in orizzontale; chiudi chat letta → pallino resta spento anche mentre l'AD risponde altrove.
