## Cosa
Isola la casella di testo della chat (Assistente + fluttuante) in `BarraScritturaChat`: la bozza non vive più nello state di `page.tsx`, quindi ogni lettera non ri-renderizza tutta la Home.

## Perché
Nicola segnala digitazione lenta nella chat: ogni keystroke aggiornava `input` in Home (~3000 righe) e ricalcolava l’intero Pannello anche con Markdown già memoizzato.

## Come provare
1. Approva e mergia la PR, poi Ctrl+Shift+R sul Pannello.
2. Apri Assistente (o chat fluttuante «Parla con l'AD»).
3. Scrivi una frase lunga velocemente: i caratteri devono comparire subito, senza ritardo visibile.
4. Invia un messaggio, annulla invio, comandi rapidi, dettatura e allegati: comportamento invariato.
