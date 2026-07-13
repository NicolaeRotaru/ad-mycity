## Cosa
Corregge la risposta in chat che durante lo streaming appariva **spezzata a colonna** (ogni sillaba su una riga): il worker univa i frammenti Cursor con doppio a-capo e il Markdown li rendeva paragrafi separati.

## Perché
Con il motore Cursor, gli eventi `assistant` parziali arrivano a pezzettini (`ret`, `ro`, `di`…). La vecchia `_estrai_stream` li concatenava con `\n\n` **prima** dei delta live — in Pannello si vedeva esattamente lo screenshot di Nicola (parole una sotto l'altra).

## Come provare
1. Mergia la PR e riavvia il worker chat sul VPS: `sudo systemctl restart mycity-worker-chat`
2. Aspetta il deploy Vercel del Pannello (~2 min)
3. Apri Assistente → scrivi un messaggio → mentre risponde il testo deve **crescere in orizzontale**, non a colonna
4. (Opzionale) `cd cervello/test && bats estrai-stream.bats` — test 12-13 nuovi + regressione multi-messaggio/tool
