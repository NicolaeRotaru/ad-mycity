---
data: 2026-11-25 17:50
da: AD, chat «Iscrizione ragazzetta Piacenza» (session_01R8112KB64njhGrB6y3vwCU)
per: la sessione «Analisi subito, scheda e pagella dopo l'abbonamento»
---
# Brief: analisi subito, scheda e pagella dopo l'abbonamento

## In parole semplici
Nicola ha cambiato l'ordine in cui nascono tre cose per ogni attività che si iscrive.
L'analisi parte subito e serve a cucire i servizi su misura. La scheda del cliente e la pagella sul marketplace arrivano solo dopo l'abbonamento.
Per esempio: La Ragazzetta, iscritta il 25/11, deve ricevere subito una proposta con una parte generale e una parte sua, ma non la pagella «0 prodotti, vetrina vuota».

## Cosa cambia per te
Questa sessione possiede il lavoro dall'inizio alla fine, su due repository: `mycity` (sito) e `N8N` (flussi).

## Cosa devi fare
Prima le scelte, poi il codice: leggi le «Scelte dell'AD», e se una non regge chiedi a Nicola prima di costruire.

## Cosa non ho verificato
Non ho letto per intero `offerta-su-misura.ts`, il webhook Stripe degli abbonamenti e il codice del flusso 16. Le righe sotto sono una mappa, non una diagnosi.

---

## Dettagli tecnici

### La regola (fatto `agenzia.analisi-e-scheda` in `MyCity-Vault/90-Memoria-AI/registro-fatti.json`)
Nicola, 25/11 verso le 17:40 e le 17:45:
1. **Subito, all'iscrizione:** l'analisi dell'attività con tutte le analisi a disposizione: fonti pubbliche (ricerca via «Chiedi all'AD»), social, scheda Google, sito (PageSpeed). Scopo: personalizzare i servizi. Ogni proposta ha una **parte generale** (cosa comprende la fascia, `FASCE`) e una **parte specifica** per le esigenze di quell'attività.
2. **Solo dopo l'abbonamento:** la scheda del cliente (i campi: indirizzo, telefono, orari, menu, link; quella che riempie la vetrina).
3. **Solo dopo l'abbonamento:** la pagella sul marketplace (flusso 18 e `lib/agenzia/pagella.ts`). Va **tolta dalla demo e dal preventivo**.

### Com'è oggi (mappa)
- Sito, `mycity`:
  - `lib/agenzia/scheda-cliente.ts` e `app/api/agenzia/scheda-cliente/route.ts`: la scheda arriva dal flusso 16 subito, coi `campi` e con la sezione `analisi` dentro.
  - `lib/agenzia/analisi.ts`: tre parti. L'attività la legge da `scheda.analisi`; i canali da `/api/agenzia/analisi-canali`; il sito da PageSpeed. Tutto in `analisi_negozi` (migrazione 711).
  - `components/seller/AnalisiDelBusiness.tsx`, riga ~102: il blocco «La tua pagella su MyCity», mostrato in `app/seller/servizi/[servizio]/page.tsx` (servizio `analisi`), anche in demo. La rotta è `app/api/seller/pagella/route.ts`.
  - `lib/agenzia/offerta-su-misura.ts`: la parte su misura del preventivo. Oggi usa la vetrina, la scheda, i canali e il sito. Pagina pubblica: `app/preventivo/[codice]/page.tsx`; calcolo comune: `lib/agenzia/leggi-preventivo.ts`.
  - Demo: migrazione 709 (`public.negozio_in_vetrina`), fatto `negozi.modalita-demo`. Abbonamento: mycity#309, `app/api/seller/preventivo/paga/route.ts` e il webhook Stripe.
- n8n (`N8N/flussi/LEGGIMI.md`):
  - Da /sell: 16 → manda la scheda al sito → 18 (pagella a Nicola) → 19 (bozze dei 3 abbonamenti).
  - Dal modulo 12 (`DnPXJXZOGasj09uw`, vive solo in n8n): scheda Clienti e Drive → flusso 20 «Iscrivi il cliente in MyCity» (`s5vKU6Ml8PUjwn29`). Niente 18, niente 19, niente scheda al sito.
  - «Chiedi all'AD» (`fRtCLoVmjbbWo9uB`, MODALITA vero) fa il lavoro con l'IA col piano Max. Mai API a pagamento.

### Come deve diventare
- **All'iscrizione, da tutte e due le porte** (16 e 20): ricerca, canali e sito → «analisi dell'attività» salvata sul sito separata dalla scheda (per esempio in `analisi_negozi`) → preventivo con l'offerta su misura e flusso 19, tutti e due con la parte generale e quella specifica. **Niente 18, niente scheda.**
- **Al primo pagamento dell'abbonamento:** il sito avvisa n8n (webhook nuovo; la variabile su Vercel la mette Nicola) → nasce la scheda del cliente → parte il 18 → la pagella compare nella pagina del negozio.
- **Demo e preventivo:** nessuna pagella e nessuna frase sull'analisi del negozio sul marketplace, né in dashboard né in `/preventivo/<codice>`.

### Scelte dell'AD (da confermare con Nicola se dubiti)
1. «Abbonamento fatto» = primo pagamento riuscito: lo stesso momento in cui finisce la demo, prima dell'approvazione dell'admin.
2. Fuori dalla demo (Pane Quotidiano, negozi di sistema) la pagella resta com'è.
3. Le schede già salvate (per esempio Ora del Gusto) restano nel database, ma non si usano finché l'attività non si abbona.
4. Le domande per il titolare e le idee per i post stanno nell'analisi (subito), non nella scheda.

### Casi da provare (dato → atteso)
- Attività in demo apre «Analisi del business» → nessun blocco pagella; `/api/seller/pagella` non dà la pagella.
- Attività in demo, `/preventivo/<codice>` → parte generale + parte specifica, nessuna voce sul marketplace.
- Il flusso 16 su un'iscrizione nuova → analisi salvata, scheda NON salvata, 18 non parte, 19 parte.
- Il flusso 20 dal modulo 12 → stessa cosa del 16.
- Primo pagamento → avviso a n8n → scheda salvata, 18 parte, pagella visibile.
- Pane Quotidiano → pagella come oggi.

### Coordinamento (prima di toccare n8n)
- La sessione «Flusso n8n analisi azienda» (`session_01R8112KVwPBkdsE7GjzW4uF`) stava modificando il flusso 18 il 25/11 alle 17:30. Parla con lei prima.
- La regia «n8n workflow per MyCity» (`session_01R8112LTnRkPxboA6MyC4yC`) tiene il piano n8n. La PR #7 della regia sul repository N8N («Chiedi all'AD» dentro i flussi) aspetta l'unione: parti da lì.
- «Ora del Gusto 2.0» (`session_01R8112NVRDBVue92iwywY7m`) ha toccato il preventivo e PageSpeed (mycity#322).

### Regole
`CLAUDE.md` e le cinque domande di `CONTESTO_BUSINESS.md`. Skill `collaudo` (chi costruisce non collauda). `npm run verify` più `node cervello/radiografia-in-corsa.mjs --repo ../mycity`. PR sempre, mai un deploy. Le migrazioni e la pubblicazione dei flussi vivi su n8n si fanno solo con l'ok di Nicola. Dopo il via, rilanciare l'analisi per La Ragazzetta (`b8d328ab-1955-4820-9c64-c6626d449b4a`) e Ora del Gusto.

### Preventivo
Una sessione, al massimo 2 subagenti di collaudo, circa 1-1,5 milioni di token. Oltre i 2 milioni ci si ferma e si chiede.
