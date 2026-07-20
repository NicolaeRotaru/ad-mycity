## Summary
- Fix chat: invio solo allegato non crea più due messaggi utente + due risposte AD identiche.
- Unifica la bolla salvata con quella ricostruita dai Lavori (📎 nome file invece del placeholder).
- Merge thread più intelligente: stesso turno allegato, ordine cronologico, dedup risposte duplicate.

## Perché
Nicola segnalava: risposta doppia, due frasi all’invio allegato, messaggio utente che finiva sotto la risposta. Causa: placeholder `(nessun testo — vedi allegati)` trattato come messaggio diverso da `📎 filename`, e merge che appendeva copie in fondo.

## Come provare
1. Apri Assistente nel Pannello (dopo merge + deploy Vercel).
2. Invia **solo** uno screenshot (senza testo) e attendi la risposta.
3. Verifica: **una** bolla tua con 📎 nome file, **una** risposta AD, ordine corretto (tu → AD).
4. Ricarica la pagina o riapri la conversazione: niente duplicati.
5. Test automatici: `cd pannello && node --test src/lib/chat-thread-merge.test.mts`
