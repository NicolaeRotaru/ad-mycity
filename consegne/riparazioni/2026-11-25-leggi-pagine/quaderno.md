---
tipo: quaderno di bordo
data: 2026-11-26 12:53
fonte: sessione «Dati mancanti», poi la sessione che la continua; via di Nicola «Ripara» verso le 20:50
---

# Le pagine dei clienti nuovi le legge n8n: lo stato di adesso

**In due righe:** la riparazione è in uso su n8n, e la prova su Ora del Gusto ha funzionato (2 pagine lette).
L'ultimo collaudo regge: le due richieste di modifica sono pronte da unire.

## In parole semplici
Quando entra un cliente nuovo, l'AD cerca sul web le sue pagine. Fino a stasera non poteva aprirle, perché la sua rete è chiusa.
Per esempio, alle 20:30 la scheda di Ora del Gusto era tutta «non trovato»: indirizzo, telefono, orari.
Adesso l'AD scrive l'elenco delle pagine da leggere, e le scarica n8n. Il testo delle pagine torna all'AD, che compila la scheda.

## Cosa cambia per te
La riparazione è in uso sui due flussi del cliente nuovo: quello del modulo e quello che arriva dal sito.
La prova vera su Ora del Gusto ha funzionato. L'elenco aveva una pagina, e n8n ne ha lette due.
La scheda le ha scartate perché potevano essere di un locale con lo stesso nome. È la scelta giusta.

## Cosa devi fare
Niente. Le due richieste di modifica le unisce la sessione che se ne occupa, col tuo via.

## Cosa non ho verificato
Non ho ancora visto la lettura riuscita su un locale con un sito vero.
Quando il flusso del sito verrà ripubblicato con le modifiche del flusso 16, va riletto. Serve a vedere che i nove passi nuovi ci sono ancora.

## I collaudi
Il primo collaudo della sicurezza ha bocciato per 4 difetti. Il secondo, sulla catena dei dati, ha retto con 3 difetti.
Il terzo, di nuovo sulla sicurezza, ha bocciato per 4 difetti. Sono stati corretti tutti e 11, ognuno con la sua prova.
Il quarto era il terzo sulla sicurezza. Ha bocciato per un difetto solo: su un sito vecchio la pulizia cancellava il testo.
Era il terzo rosso. Nicola ha scelto «Ripara solo questo» (26/11 mattina).
Il quinto ha controllato solo la riparazione, e regge. I referti sono `collaudo-3-sicurezza.md` e `collaudo-4-pulizia.md`.

## Prossimi passi
1. Dopo l'unione, rileggere il flusso del sito quando verrà ripubblicato.
2. Restano 14 difetti minori dei due ultimi collaudi, scritti nei referti. Nicola ha chiesto di non toccarli adesso.
3. Resta un limite noto, da firmare a parte. Un indirizzo pubblico che punta a una macchina interna non si riconosce dal nome.

---
**Dettagli tecnici**

- In uso su n8n: flusso 12 «11 · Nuovo cliente» `DnPXJXZOGasj09uw`, versione `765b6b0e` (prima della riparazione: `5a437a1d`).
  Flusso 26 «Nuovo cliente da MyCity» `xu0RPgoSNsDaP7xn`, versione `242dc419` (prima: `36041275`). Pubblicati il 26/11 verso le 12:50.
- Il 26 si rigenera dal 12 vivo con `flussi/16-nuovo-cliente-da-mycity/genera.mjs`. Il generatore tiene i nodi del 12.
  N8N#19 e #20 lo hanno cambiato e sono unite, ma alle 23:30 non erano pubblicate.
  Dopo la loro pubblicazione: `node flussi/chiedi-all-ad/leggi-pagine.mjs --file <export del 26>` deve dire «uguale».
- I 9 nodi nuovi:
  - Primi tre: «Chiedi gli indirizzi delle pagine», «Pagine da leggere», «Ci sono pagine da leggere?».
  - Poi: «Scarica le pagine», «Sottopagine da leggere», «Ci sono sottopagine?».
  - Infine: «Scarica le sottopagine», «Metti le pagine nella risposta», «Ritocca l'anteprima».
- Codice: NicolaeRotaru/N8N#18, ramo `ccr-d58987f6-fnlly3`, testa `bbd4cc6`. Sopra il main di n8n delle 23:30 (con #19 e #20):
  unione senza conflitti, 277 prove verdi e 2 saltate.
- Memoria: NicolaeRotaru/ad-mycity#1027, stesso ramo. La sessione che unisce ci ha portato dentro main (testa `4c599c9`).
- La prova vera, esecuzione per esecuzione:
  - 2563 è la ricerca, con 1 candidato.
  - 2564 è la scheda, che ha letto `sluurpy.it/piacenza/coppetta-con-coperchio` e `sluurpy.it/chi-siamo`.
  - 2565 è l'analisi del business, ancora vuota: la sistema N8N#20.
- Le correzioni dei collaudi stanno nei commit b3a67f0, 88f3ea5, eae5946 e bbd4cc6, in quest'ordine.
- Limite aperto: `N8N_SSRF_PROTECTION_ENABLED=true` su Sliplane, con `officina.internal` fra i permessi. Prima verificare la versione di n8n.
- Su n8n si lavora solo con gli strumenti MCP: bozza, poi verifica con `leggi-pagine.mjs --file`, poi pubblicazione.
  In questa macchina non c'è la chiave API di n8n. Non chiedere ad altre sessioni di pubblicare con le loro chiavi.
