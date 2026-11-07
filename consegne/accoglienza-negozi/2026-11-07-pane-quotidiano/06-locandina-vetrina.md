# Locandina A5 per la vetrina e la cassa di Pane Quotidiano

> Aggiornata il 2026-11-07 02:50 dal direttore creativo: la prima versione è stata rifatta. Il giudizio completo, con il prima e dopo, è nel file `06b-giudizio-locandina.md` accanto a questo.

## In parole semplici
Questo documento parla del foglio A5 (mezzo A4) da attaccare in vetrina e alla cassa di Pane Quotidiano, e serve a stamparlo bene. Il titolo dice «Non riesci a passare? Passiamo noi.». Sotto c'è un codice QR: chi lo inquadra col telefono arriva alla pagina del negozio su MyCity e ordina la consegna a casa.

Per esempio: una cliente al banco legge il cartello il martedì. Il giovedì pomeriggio il negozio è chiuso e lei ha bisogno di qualcosa: si ricorda del cartello e ordina da casa.

## Cosa cambia per te
Il negozio ha un modo gratuito per dire ai suoi clienti che, quando non possono venire, la spesa arriva da loro. Il cartello non parla di «online», che non dice al cliente cosa ci guadagna: parla del giorno in cui non riesce a passare. Nessuno ha ancora stampato nulla: i file sono pronti, la stampa la decidi tu.

## Cosa devi fare
- Guarda l'anteprima: `creativi/pane-quotidiano/locandina-A5.png`.
- Non stamparla finché la pagina online del negozio non mostra il pane: oggi ha 5 prodotti (kefir, budino, hummus, pesto) e nessun pane.
- Falla vedere al fornaio: il titolo parla con la sua voce.
- Quando è il momento, stampa 2 copie a colori: una A5 per la cassa e una A4 per la vetrina (stesso PDF, scala 141%). Carta normale da 120-170 grammi, tipografia o stampante di casa: costa pochi euro. L'ordine in tipografia lo decidi tu, io non lo faccio.
- Attaccala il giorno in cui il sito apre davvero, non prima.

## Cosa non ho verificato
- Il QR l'ho letto con un programma in quattro condizioni via via peggiori, e porta sempre alla pagina giusta. Non l'ho provato con un telefono vero né su carta stampata.
- Non ho provato carrello, cassa e consegna: consegna a casa e contanti alla consegna vengono dal registro dei fatti.
- Due frasi vanno fatte guardare al legale prima della stampa: «Paghi in contanti alla consegna» e «Passiamo noi» (al lancio consegna Nicola per MyCity, non il negozio).
- Colori da schermo: sulla stampa possono venire un po' diversi. Il marchio MyCity è ricostruito dal file ufficiale del sito, con uno spessore di carattere un po' più leggero dell'originale.

## Dettagli tecnici

### Testo della locandina
- Riga in alto: PANE QUOTIDIANO · VIA CALZOLAI 25
- Domanda: «Non riesci a passare?»
- Titolo grande: «Passiamo noi.»
- Sotto: «Scegli dal telefono i nostri prodotti: te li portiamo a casa.»
- Sopra il QR: «Apri la fotocamera e inquadra il codice ↓»
- Sotto il QR: «Paghi in contanti alla consegna.»
- Piede: marchio MyCity e «La spesa che tiene viva la città.»

Niente data sul foglio: il 15/11 è domenica e il negozio è chiuso, e il registro dice che la data si sposta se Stripe non ha verificato i conti. Niente prezzi della consegna né raggio dei 5 km: sono numeri che sono già cambiati, e sulla carta resterebbero vecchi. Li mostra il sito.

### Scelte scartate
- «La nostra spesa ora anche online» (la prima versione): frase da qualunque negozio, e spinge online chi già compra al banco.
- «Via Calzolai 25, adesso anche a casa tua»: onesta ma senza tensione; al banco l'indirizzo non serve.
- «Saracinesca giù? La bottega resta aperta.»: promessa falsa, a negozio chiuso nessuno prepara né consegna.
- Elenco dei prodotti, orari e telefono sul foglio: troppo testo, e distraggono dalla scansione.

### Grafica
Banda terracotta in alto con domanda e titolo in Fraunces SemiBold (il carattere dei titoli del marchio), testi in Inter. QR: correzione errori livello Q, margine bianco di 4 moduli, 222 punti di lato (circa 7,8 cm su A5, circa 11 cm su A4), scuro `#2C2A28` su bianco, cornice senape `#E8A33D`. Marchio: «My» senape e «City» inchiostro, come `wordmark-light.svg` del sito.

### File
- `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5.pdf` (da stampare, 419,5 x 595,3 punti = A5, caratteri incorporati)
- `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5.png` (300 dpi, per anteprima o WhatsApp)
- `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5-v1-scartata.png` (la prima versione, solo per confronto)

### Come stamparla
PDF a scala 100% per A5, a colori, senza margini aggiunti dalla stampante. Per la vetrina, stesso PDF su A4 a scala 141%: cresce tutto, QR compreso. Non mettere 2 copie affiancate su un A4: il QR rimpicciolisce. Una stampante di casa lascia un bordino bianco intorno alla banda: va bene così. In vetrina: lato interno del vetro, a metà altezza, col QR all'altezza degli occhi.

### Come è fatta
Programma: pdfkit + qrcode, fuori dalla cartella `creativi` (`/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/pq/mk2.mjs`). Il generatore del progetto `genera-locandina.mjs` ha un testo da lista d'attesa, non adatto. Decodifica con jsQR: PNG a 300 dpi; grigio al 25% con soglia al 50%; ridotto a 210 pixel; sfocato e ridotto al 40%. Pagina di arrivo: codice 200, richiesta pubblica del 2026-11-07 02:46.
