## Fix: chat sync cross-device (smartphone ↔ desktop)

### Problema risolto
1. **Smartphone non vede le risposte del desktop**: aprendo il Pannello su smartphone, la chat appariva vuota anche se sul desktop c'era una conversazione attiva. Bisognava aprire manualmente il cassetto e cliccare sulla conversazione.
2. **Messaggio da smartphone non nella lista conversazioni**: inviando un messaggio da smartphone, il lavoro appariva nella coda e nell'archivio, ma la conversazione non era immediatamente visibile nella lista — perché `convId` era null e la conversazione era disconnessa.

### Come funziona il fix
Aggiunto un `useEffect` che scatta **una sola volta per sessione** all'apertura:
- Se la chat è vuota (`convId = null`, nessun messaggio)
- E c'è una conversazione aggiornata nelle ultime 2 ore
- → la apre automaticamente (`continuaConversazione`)

Questo sincronizza desktop e smartphone senza richiedere azioni manuali.

### Cosa NON cambia
- "Nuova chat" esplicita: dopo aver cliccato "Nuova chat", il flag `autoApriEseguito` è già `true` → nessuna riapertura automatica
- Conversazioni vecchie (> 2 ore): non vengono auto-aperte
- Prima sessione (0 conversazioni): nessun effetto

### File modificato
- `pannello/src/app/page.tsx`: +23 righe (ref + useEffect)

### Come testare
1. Avvia una conversazione sul desktop
2. Apri il Pannello su smartphone (o nuovo tab)
3. La chat mostra automaticamente l'ultima conversazione recente ✓
