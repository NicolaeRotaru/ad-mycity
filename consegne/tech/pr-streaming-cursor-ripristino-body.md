## Cosa
Ripristina lo streaming parola-per-parola in chat con motore Cursor, rotto dal merge della #335 che aveva reintrodotto i flag Claude (`--include-partial-messages`) incompatibili con `agent`.

## Perché
Dopo il merge della #335 la risposta in chat arriva tutta insieme a fine lavoro. Il commit buono (`db0552a0`) era stato sovrascritto da `68c15aa4` nel merge. In più la chat Cursor non passava più da `rispondi_chat_stream` perché il ramo era limitato a `ai_engine=claude`.

## Come provare
1. Mergia la PR e sul VPS: `sudo systemctl restart mycity-worker-chat`
2. Scrivi un messaggio nella chat del Pannello
3. La risposta deve crescere parola per parola (~ogni 2s) mentre il lavoro è `in_corso`, non comparire tutta alla fine

## Extra (stesso branch)
Fix pallini: `segnaLetta` include sempre il timestamp «adesso» per evitare la race con `persistConversazione` (il pallino tornava ~5s dopo aver aperto la chat).
