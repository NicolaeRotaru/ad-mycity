## Cosa cambia
- Aggiunge un fallback automatico su Ollama locale quando Claude/Cursor sono in limite quota (motore-ai.sh)
- worker.sh: piccolo aggiustamento collegato

## Perché
Nicola ha chiesto di non restare bloccati quando i limiti settimanali di Claude scattano.

## Come provare
Sul VPS, dopo il merge: simula un limite quota e verifica che motore-ai.sh passi a Ollama senza intervento manuale.
