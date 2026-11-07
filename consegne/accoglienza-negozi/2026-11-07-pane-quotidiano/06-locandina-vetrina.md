# Locandina A5 per la vetrina e la cassa di Pane Quotidiano

## In parole semplici
Ho preparato un foglio A5 (mezzo A4) da attaccare in vetrina e alla cassa. Dice che dal 15 novembre i prodotti del negozio sono anche online. C'è un codice QR: chi lo inquadra col telefono arriva alla pagina di Pane Quotidiano su MyCity.

## Cosa cambia per te
Il negozio ha un modo gratuito per far sapere ai clienti già presenti in negozio che esiste la pagina online. Nessuno ha ancora stampato nulla: i file sono pronti, la stampa la decidi tu.

## Cosa devi fare
1. Guarda l'anteprima: `creativi/pane-quotidiano/locandina-A5.png`.
2. Approva il testo qui sotto (o dimmi cosa cambiare), soprattutto la data «Dal 15 novembre».
3. Se va bene, stampa 2 copie a colori su carta normale 120-170 g (una per la vetrina, una per la cassa). Tipografia o stampante di casa: costa pochi euro. L'ordine in tipografia lo decidi tu, io non lo faccio.

## Cosa non ho verificato
- Ho decodificato il QR con un programma (jsQR) sul PNG: porta esattamente a `https://www.mycity-marketplace.com/store/c0b240c0-2a86-4218-9d0f-5154f08ff929`. Letto bene anche in bianco e nero ridotto al 25% (simula fotocopia). Non l'ho provato con un telefono vero né da stampa su carta.
- La pagina risponde (codice 200, controllato con una richiesta pubblica), ma non ho guardato come appare: la pagina ha solo 5 prodotti (kefir, budino, hummus, pesto) e nessun logo. Se il QR porta lì prima di aver sistemato la vetrina online, il cliente vede poco.
- La data del 15 novembre me l'hai data tu; non ho riletto il registro dei fatti. Il testo non parla di consegna né di pagamento, perché non li ho verificati per questo negozio.
- Colori da schermo (RGB): sulla stampa possono venire un po' diversi. Il font Fraunces dei titoli non è installato qui: ho usato Inter anche per i titoli. Il logo ufficiale non è usato, c'è solo la scritta «MyCity» in terracotta.

## Cosa ho fatto
Layout scelto: un solo messaggio, titolo grande sulla banda terracotta, QR grande al centro. Ho scartato due alternative: una con l'elenco dei prodotti (troppo testo, e i prodotti sono pochi) e una con orari e telefono (distrae dalla scansione; orari e telefono sono già sulla pagina).

Testo della locandina:
- Riga in alto: PANE QUOTIDIANO · VIA CALZOLAI 25
- Titolo: «La nostra spesa ora anche online»
- Sotto: «Dal 15 novembre. Inquadra con il telefono e guarda i nostri prodotti.»
- Piede: «MyCity · La spesa che tiene viva la città.»

QR: correzione errori livello Q, margine bianco (zona di quiete) di 4 moduli, 230 pt (circa 8 cm) di lato, scuro `#2C2A28` su bianco, cornice senape.

File:
- `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5.pdf` (da stampare, 419,5 x 595,3 pt = A5, font incorporati)
- `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5.png` (300 dpi, per anteprima o WhatsApp)

Come stamparla: PDF, formato A5 o «adatta alla pagina» su A4 con 2 copie affiancate non è consigliato (il QR rimpicciolisce). Scala 100%, a colori, senza margini aggiunti dalla stampante. Il testo è lontano dal bordo, quindi nessun rischio di taglio. In vetrina: a metà altezza, lato interno del vetro, dove il QR sta all'altezza degli occhi.

## Dettagli tecnici
Script usato: pdfkit + qrcode, fuori dalla cartella `creativi` (lì mancano le dipendenze installate, e `genera-locandina.mjs` ha layout generico e testo da iscrizione alla lista d'attesa, non adatto). Font: Inter Bold/Medium. Decodifica: jsQR su PNG 300 dpi e su versione grigia ridotta al 25%, soglia 50%.
