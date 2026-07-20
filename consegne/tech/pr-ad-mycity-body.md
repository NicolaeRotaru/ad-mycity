## Cosa
Separa i due modi di aprire il Worker e mette l'elenco conversazioni in un cassetto sopra la chat.

## Perché
Nicola (20/7): il bottone in basso a destra e la voce «Worker» nel menu **non** devono aprire la stessa finestra; la lista chat deve aprirsi/chiudersi **sopra** i messaggi, non come colonna fissa.

## Cambiamenti
- **Menu laterale «Worker»** → chat a schermo intero (`workerFull`)
- **Bottone FAB in basso a destra** → finestra piccola flottante (popup)
- **Icona ☰** → cassetto conversazioni overlay (mobile e desktop), chiuso di default
- Deep-link / vista salvata `assistente` → fullscreen

## Come provare
1. Merge PR e attendi deploy Vercel (o build locale)
2. Ctrl+F5 sul Pannello
3. **FAB «Worker»** in basso → finestra piccola; **ingrandisci** → grande; **X** chiude
4. **Voce «Worker»** nel menu sinistro → direttamente grande
5. Dentro la chat: **☰** apre lista sopra i messaggi; tap fuori o scelta chat la chiude
