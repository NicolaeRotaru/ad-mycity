## Summary

Ripristina l'ordine **stabile** delle conversazioni nel cassetto Assistente: aprire o cliccare una chat **non la sposta più in cima** (comportamento già corretto il 12/7 con PR #303, reintrodotto per errore da PR #371).

Mantiene il header pulito di #371 (icona History, titolo solo quando c'è una chat aperta).

## Perché

Nicola ha mergiato per sbaglio #371 che riportava `convVistaAt` / `segnaVista`: ogni click spostava la chat in cima alla lista.

## Come provare

1. Apri Assistente → cassetto Conversazioni
2. Nota l'ordine (pinnate in cima, poi per data creazione)
3. Clicca una chat a metà lista → **resta al suo posto**, si apre il contenuto
4. Header: icona orologio/storico, niente «Parla con l'assistente»
