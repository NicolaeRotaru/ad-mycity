## 7 miglioramenti all'Assistente chat

### Cosa è cambiato
1. **Streaming senza flash** — la bolla durante la risposta usa ora `<Markdown>` (come quella finale), quindi quando Claude finisce di scrivere il DOM non si smonta/rimonta → niente più lampeggio.
2. **Chat fullscreen** — la sezione Assistente non è più una card fissa con `max-h-[60vh]`: ora si espande per tutta l'altezza disponibile dello schermo, come Claude.ai.
3. **Caselle duplicate eliminate** — la chat fluttuante si nasconde automaticamente quando sei nell'area Assistente.
4. **Ordinamento per ultima attività** — le conversazioni si riordinano per `updated_at`: mandare un messaggio in una chat vecchia la porta in cima.
5. **Ricerca nelle conversazioni** — campo di ricerca nel cassetto che filtra in tempo reale per titolo e contenuto dei messaggi (funziona sia nell'Assistente che nel FAB).
6. **Motore di ricerca nella nav bar** — `RicercaGlobale` spostata come seconda riga dell'header (prop `inHeader` con stile integrato), rimossa dal corpo della pagina.
7. **Anteprima foto sopra i pulsanti** — `AnteprimaAllegatiChat` spostata sopra i bottoni ⚡📎🎤 in `BarraScritturaChat`.

### Come provare
- Apri l'Assistente: deve riempire tutto lo schermo verticale.
- Manda un messaggio e guarda lo streaming: deve crescere fluido, senza flash.
- Vai in un'altra vista (es. Plancia): deve comparire il FAB "Parla con l'AD", non la doppia chat.
- Manda un messaggio in una chat vecchia: deve salire in cima alla lista.
- Digita nel campo ricerca del cassetto: le conversazioni si filtrano.
- Cerca nella barra in alto nell'header: deve funzionare senza aprire il menu.
- Allega una foto: l'anteprima appare sopra i pulsanti, non sotto.
