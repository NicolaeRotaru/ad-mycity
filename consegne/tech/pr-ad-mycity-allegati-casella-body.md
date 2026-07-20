## Summary
Fix allegati nelle chat casella: il percorso file ora arriva al worker e l'AD può leggere foto/screenshot.

## Problema
Quando Nicola allegava un file parlando da una casella (thread `💬 …` nell'Assistente o box «Parla con questa casella»), il Pannello caricava il file su Storage ma **non** includeva le righe `@ALLEGATO` nella richiesta al worker → `prepara_allegati_chat` restava cieco.

## Fix
- `buildRichiestaCasella()` accetta e appende `bloccoAllegati`
- Chat Assistente su thread casella passa gli allegati già caricati
- `ParlaCasella`: pulsanti Allega/Foto + upload prima del lavoro
- Helper condiviso `pannello/src/lib/allegati-chat.ts` (DRY con chat principale e ChatCasella)

## Come provare
1. Mergia la PR → attendi deploy Vercel
2. Apri una casella (es. bollino) → «Parla con questa casella»
3. Allega uno screenshot **senza testo** → invia
4. L'AD deve descrivere il contenuto dell'immagine (non chiedere «cosa c'è nello screenshot»)
5. Ripeti dalla chat grande Worker su un thread casella `💬 …`
