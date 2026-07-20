## Cosa cambia
Fix chat Pannello: allegato senza testo non genera più messaggi doppi, risposte AD duplicate né ordine invertito (il tuo messaggio sotto la mia risposta).

## Perché
Il Pannello trattava «(nessun testo — vedi allegati)» e «📎 nomefile.jpg» come due messaggi utente diversi, e univa male le copie salvate con quelle ricostruite dai lavori in background.

## Come provare
1. Mergia la PR dal Pannello
2. Aspetta deploy Vercel (1–2 min)
3. Invia **solo** uno screenshot senza testo nella chat
4. Verifica: una bolla tua (con 📎 e nome file), una sola risposta AD, ordine corretto (prima tu, poi io)

## Verifiche automatiche
- `node --test pannello/src/lib/chat-thread-merge.test.mts` — 4/4 ok
- `npm run build` in `pannello/` — ok
