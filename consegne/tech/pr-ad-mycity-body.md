## Cosa

Nuovo pulsante "Schermo" nella chat del worker (barra scrittura, sia versione fluttuante che a schermo intero), accanto a quello già esistente "Video live" (telecamera).

## Perché

Nicola ha chiesto di poter mostrare in tempo reale gli errori che vede nel Pannello, mentre mi scrive, invece di dover fare uno screenshot manuale e allegarlo. Il video live con la telecamera esisteva già ma inquadra l'ambiente (o lui stesso), non lo schermo — per mostrare un errore del Pannello serve condividere lo SCHERMO/tab, non la telecamera.

## Come funziona

- Stesso componente `BottoneFotoChat`, nuova opzione `schermo` (oltre a `videoLive`): usa `navigator.mediaDevices.getDisplayMedia()` invece di `getUserMedia()`.
- Overlay identico al video live: schermo condiviso a sinistra, chat con testo/microfono a destra, nella stessa finestra.
- Ogni "Scatta" cattura il fotogramma corrente dello schermo condiviso e lo allega al prossimo messaggio (stesso flusso allegati già in uso per le foto).
- Se Nicola preme "Interrompi condivisione" dal browser, la finestra si chiude da sola.
- Nascosto il pulsante "cambia fotocamera" (non pertinente per lo schermo); "riavvia" ricondivide lo schermo.

## Limite onesto (da dire a Nicola)

Non è un canale sempre-acceso: richiede che lui apra la chat e scelga "Schermo" ogni volta (permesso del browser, non bypassabile per sicurezza). Non è "l'AD vede sempre lo schermo in automatico" — è "condividi quando serve, dura finché la chat resta aperta".

## Come provare

1. `npx tsc --noEmit` da dentro `pannello/` → pulito (verificato).
2. In locale/anteprima: aprire la chat worker (fluttuante o a schermo intero), premere "Schermo" (icona ScreenShare accanto al video), scegliere una tab da condividere, premere "Scatta" → il fotogramma appare come allegato pronto da inviare.
