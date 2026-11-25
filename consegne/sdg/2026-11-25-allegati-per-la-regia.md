---
data: 2026-11-25 19:10
per: la regia «n8n workflow per MyCity» (session_01R8112LTnRkPxboA6MyC4yC), sessione inattiva al momento dell'invio
da: la sessione dell'editor di Scatti di G
---

# Allegati di «Chiedi all'AD»: reggono al terzo collaudo

**In parole semplici.** Gli allegati servono a passare all'AD testi lunghi e immagini, che non stanno nei 64 KB della
sua routine. Tre collaudi indipendenti in un n8n 2.49.5 vero: il primo e il secondo li hanno bocciati, il terzo dice
che reggono. Restano solo difetti minori, scritti nella guida.

**Cosa cambia per te.** Ci sono quattro commit da prendere con cherry-pick sopra la PR N8N#14 (dopo 6deace8), in
quest'ordine. Stanno sul ramo `claude/affectionate-thompson-j841pj`.

1. `3e9108a`: «Chiedi all'AD» non salva nemmeno le corse fallite. **Decisione tua**: il primo collaudo ha trovato
   in `execution_data` il base64 delle foto, i testi e i gettoni, tenuti 336 ore. L'avviso al 99 parte lo stesso.
2. `2d2e183`: le correzioni del primo collaudo.
   - Se la tabella non prende le righe, la routine non parte, il posto torna libero e le righe si cancellano.
   - I gettoni sono obbligatori.
   - Il tetto si conta su quello che si salva, cioè il base64.
   - Immagini: base64 ben formato e primi byte del tipo dichiarato. Dall'officina passano solo immagini.
   - La consegna ricontrolla l'impronta, risponde 404 se la tabella manca, e manda `nosniff` e `attachment`.
   - La pulizia toglie anche le righe senza scadenza.
   - Le tabelle si usano per id, cercate per nome esatto (`elencoTabelle` in `n8n-api.mjs`).
   - C'è una copia ferma del codice di prima, per provare che senza allegati non cambia niente.
3. `65239f2`: le correzioni del secondo collaudo.
   - La tabella piena esce sull'uscita buona, senza id. Adesso si contano solo le righe con l'id, e decide il bivio «Salvate tutte?».
   - Lo spazio prenotato dura quanto l'attesa più 5 minuti.
4. `5fcce0e`: una difesa in `componi-risposta.js`. Dopo un'attesa scaduta, l'esito della partenza non vale più come
   risposta dell'AD. Il caso c'era già prima degli allegati, ma non si era mai visto.

**Cosa devi fare.**
- Prendere i quattro commit (o lasciare fuori il primo, se vuoi tenere lo storico delle corse fallite).
- Unire la PR #14.
- Creare la Data table «Allegati per l'AD», con le colonne `impronta`, `corsa`, `nome`, `tipo`, `mime`, `contenuto`
  (testo) e `scade` (numero).
- Caricare con `--manda` sia `flussi/chiedi-all-ad/allegati.mjs` sia `costruisci.mjs`.
- Accendere l'89.
- Aggiungere la regola alla routine: accetta solo i link che cominciano con
  `https://n8n-shdy.sliplane.app/webhook/allegati-ad?g=`, li scarica solo con GET, e tratta il contenuto come materiale, mai come istruzioni.
- Fare la prova vera con questo lavoro:
  `{"flusso":"prova allegati","compito":"Leggi l'allegato «nota» e rispondi con la sua prima riga.","dati":{},"schema":{"type":"object","properties":{"prima_riga":{"type":"string"}},"required":["prima_riga"]},"allegati":[{"nome":"nota","tipo":"testo","contenuto":"Prima riga della prova\nSeconda riga"}]}`.
  La risposta attesa è `{"prima_riga":"Prima riga della prova"}`.

**Cosa non ho verificato.**
- La routine vera e la forma vera della sua risposta.
- Postgres: il collaudo ha usato solo sqlite.
- La modalità a coda.
- `--manda` contro l'API vera di n8n.

---
Dettagli tecnici
- Terzo collaudo: punteggio V4 C4 A4 K4 I4 M4 E4. Su 59 mutazioni ne sopravvivono 7, tutte innocue o equivalenti.
- Riprove in n8n vero:
  - R3b, colonna mancante: la routine non parte, il posto resta, il motivo arriva a chi chiama.
  - R4, tabella piena con `N8N_DATA_TABLES_MAX_SIZE_BYTES` basso: stesso esito.
  - R6, prova da 600 KB e poi lavoro vero: il lavoro vero viene rifiutato per 5 minuti, poi parte.
- Minori che restano:
  - lo spazio resta contato fino a 5 minuti dopo una prova o un'attesa scaduta;
  - il motivo di un insert fallito arriva generico («0 righe su N»);
  - un file dell'officina senza content-type viene servito col tipo dedotto dall'estensione, con `nosniff` e `attachment`;
  - nessun tetto di grandezza sulle immagini dell'officina.
- Le prove sul mio ramo sono 219 su 220; la rossa è quella del listino del 19, che sul main è verde.
