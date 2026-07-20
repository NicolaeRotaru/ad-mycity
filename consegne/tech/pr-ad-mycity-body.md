## Summary
- **Chat grande (menu Worker):** icona ☰ lista conversazioni accanto a **+ Nuova** nella barra in basso; tolte le icone ingrandisci/chiudi dall’alto.
- **Popup fluttuante (bottone basso-destra):** ripristinata **barra alta** con menu conversazioni, ingrandisci e chiudi (estetica + chiusura chiara).
- **Fix menu:** in chat grande il toggle elenco conversazioni era scollegato — ora `onConversazioni` apre/chiude il cassetto.

## Test plan
1. Merge + deploy, poi **Ctrl+F5** sul Pannello.
2. **Popup piccolo** (bottone basso-destra): barra alta visibile con ☰ · ingrandisci · chiudi; ☰ apre elenco conv sopra la chat.
3. **Chat grande** (voce Worker nel menu): nessuna icona in alto a destra; in basso ☰ accanto a **+**; tap ☰ apre/chiude elenco conversazioni.
4. Da popup, ingrandisci → passa a chat grande con menu solo in basso.
