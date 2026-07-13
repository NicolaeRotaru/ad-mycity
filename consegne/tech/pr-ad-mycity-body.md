## Cosa fa
Chiude i pallini rossi su due bug confermati da Nicola (scenario 1 + 4):
- **1:** apri chat, leggi, esci → pallino torna rosso dopo ~8s senza nuova risposta
- **4:** tutte le chat rosse anche se già viste

## Perché
Il «letto» confrontava l'orario generico della conversazione (`updated_at`), che il database aggiorna anche su salvataggi/merge senza nuovo testo. La baseline v2 marcava solo messaggi nel DB conversazioni, non le risposte che vivono nei Lavori.

## Fix
- Impronta dell'ultima risposta AD: se il testo è lo stesso, pallino spento (indipendente da `updated_at`)
- Timestamp pallino solo da lavori **finiti**, non da `c.updated_at` generico
- Baseline v3: marca come lette tutte le chat storiche includendo thread dai Lavori

## Come provare
1. Dopo merge + deploy Vercel (~2 min): Ctrl+Shift+R sul Pannello
2. Elenco Conversazioni: le chat già viste **non** devono essere tutte rosse
3. Apri una chat con pallino, leggi, vai in Plancia → resta **15+ secondi** senza pallino
4. Scrivi in chat, vai in Plancia → quando rispondo, pallino compare; apri → sparisce e non torna
