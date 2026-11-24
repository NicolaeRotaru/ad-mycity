---
data: 2026-11-24 05:40
chi: AD (sessione «Ora del Gusto») → sessione nuova «Servizi SDG: vetrina, modalità preventivo, dati n8n»
---
# Quaderno: servizi di MyCity con SDG — tre lavori

## Chi sei e le regole
Lavori sul repo `NicolaeRotaru/mycity` (marketplace MyCity, Next.js + Supabase + Stripe). Leggi `CLAUDE.md` del repo `ad-mycity` se ce l'hai: italiano semplice con Nicola, colori 🟢🟡🔴, mai scritture sul database di produzione (non hai le chiavi), i dati del sito cambiano solo con migrazioni che Nicola applica col pulsante «Migrazioni a mano». Chi costruisce non collauda: un collaudo indipendente (agente `qa`) per ondata, due lenti se tocca soldi o permessi. Prove che girano (vitest), non ricerche di parole. Ogni modifica finisce in una richiesta di unione. Al massimo 4 subagenti e circa 2 milioni di token in tutto: oltre, ti fermi e chiedi a Nicola.

## Punto di partenza
Ramo `claude/stoic-goldberg-7abf66`, PR mycity#309 (non ancora unita). Contiene:
- `lib/agenzia/preventivo.ts`: le tre fasce `FASCE` (Base 30000, Business 50000, Premium 99900 centesimi/mese), `CONDIZIONI` (primo mese a metà, 30 giorni di preavviso), `pareggio`, `cosaCiGuadagni`, `FRASE_PARTNER` («I servizi li realizza SDG Agenzia, il partner di MyCity…»), `REALIZZATI_DA`.
- `app/seller/preventivo/page.tsx` e `[servizio]/page.tsx`: il preventivo nella dashboard del negozio, coi servizi foto-video, social, sito, scheda Google; `components/seller/AnteprimaServizio.tsx` mostra già una **bozza del sito** e un **piano editoriale di 12 post** (da `lib/agenzia/contenuti-servizi.ts`), oggi fatti solo con nome e tipo di attività.
- Pagamento: `app/api/seller/preventivo/paga/route.ts` (Stripe Checkout in abbonamento, cliente Stripe dei servizi per negozio, buono -50% una volta), webhook `lib/stripe/webhook/servizi.ts`, tabella `abbonamenti_servizi` (migrazione 706).
- Tipi di attività: `lib/agenzia/tipi-attivita.ts` (negozio, bar, ristorante, artigiano, servizi, altro + dettaglio).
Crea il tuo ramo da `claude/stoic-goldberg-7abf66` e apri la PR contro quel ramo (o contro main se #309 è già unita).

## Le decisioni di Nicola (24/11/2026, parole sue)
- «sono servizi che offre mycity, ma tramite SDG»; «specifica che SDG agenzia è il partner di questi servizi».
- «Ora del Gusto deve già poter selezionare il servizio e effettuare il pagamento».
- «metti i tre abbonamenti come prodotti nella vetrina di SDG».
- «Devi far iscrivere ora del gusto adesso, perché è solo in modalità preventivo, quando il cliente accetta, si recupereranno tutti i dati del cliente che si ha recuperato con n8n e compila tutto quello che bisogna compilare, e dentro la sezione sito, gestione social ci devono essere dentro il sito e piano editoriale».
- Iscrizione: «no crealo tu, per adesso» (niente pulsante admin per ora). Dati: «n8n li manda al sito». Lavoro: in questa sessione nuova.

## Lavoro 1 — SDG Agenzia nel marketplace, coi tre abbonamenti come prodotti
- SDG è un venditore di sistema, come il negozio «MyCity» (`lib/products/mycitySeller.ts` + `seeds/007_mycity_seller.sql`): UUID fisso in una costante, utente auth fittizio che non entra mai, email `.local`, profilo approvato, `business_type = 'altro'`, dettaglio «Agenzia: web, marketing, foto e video».
- Tre prodotti: «Abbonamento Base — 300 € al mese» ecc., descrizione dalle `FASCE`, prezzo coerente col listino.
- **Non si comprano col carrello**: un abbonamento non è un ordine con consegna. Pagina prodotto: al posto di «Aggiungi al carrello» un pulsante che porta a `/seller/preventivo` (per un negozio) o a `/sell` (per chi non lo è). Il server (carrello, cassa carta, cassa contanti) rifiuta i prodotti di SDG. Prova che diventa rossa se un prodotto SDG entra in un ordine.
- Avvisa la sessione n8n (sotto) PRIMA di creare SDG: non deve finire nel foglio Clienti come cliente di sé stessa. Se SDG nasce da migrazione e non da /sell, il flusso 16 non parte; diglielo comunque.

## Lavoro 2 — Ora del Gusto in «modalità preventivo», coi dati di n8n
- Ora del Gusto: bar e pasticceria a Piacenza. Non sappiamo email, indirizzo, titolare: li raccoglie n8n.
- Creala tu con una migrazione (Nicola la applica): profilo venditore in uno stato «preventivo» (non approvato, nessun prodotto in vendita), `business_type = 'bar'`.
- Proposta da validare con Nicola prima di costruire: siccome l'email del titolare non c'è, il preventivo si apre da un **link con un codice** (pagina pubblica, solo quel preventivo, niente dati personali dentro). Quando il titolare accetta o paga: il sito chiede l'email, crea l'accesso (invito Supabase), compila il profilo coi dati di n8n e il negozio passa in revisione. Chiedi a Nicola sì/no su questa forma prima di scriverla.
- Dati da n8n → sito: un indirizzo protetto (segreto in intestazione, solo https, come `N8N_PREVENTIVO_SEGRETO`) dove n8n manda la scheda del cliente (nome, indirizzo, telefono, orari, social, sito, descrizione, foto). Il sito la tiene pronta e la usa all'accettazione. Nessun dato inventato: un campo che n8n non manda resta vuoto e lo conferma il titolare (prezzi e allergeni sempre dal negoziante).
- Coordina col la sessione «n8n workflow per MyCity» (`session_01R8112LTnRkPxboA6MyC4yC`, PR mycity#308, flussi 16 e 18, file `lib/agenzia/nuovo-cliente-n8n.ts`): concordate il formato della scheda. Non toccare i suoi file né il blocco `N8N_NUOVO_CLIENTE_*` di `.env.example`. Attenzione alla regola `ad.uso-e-crediti` («non si paga mai un'API di IA»): la decisione sul credito dell'API la porta lei a Nicola.

## Lavoro 3 — sito e piano editoriale veri dentro i servizi
- Nelle pagine «Sito web» e «Gestione social» del preventivo ci sono già la bozza del sito e il piano dei 12 post (`AnteprimaServizio`). Con la scheda di n8n diventano quelli di quel locale: descrizione vera, orari, contatti, prodotti tipici, temi dei post presi dai dati. Dove un dato manca, resta il testo generico di oggi. Solo frasi vere.

## Fatto quando
Per ogni lavoro: prove vitest verdi (rosse sul codice di prima), `npx tsc --noEmit` pulito, collaudo indipendente chiuso, PR aperta. Migrazioni nuove con RLS e GRANT scritti (regola della 425) e voce in «scarica i miei dati» se toccano dati di persone.

## Cosa consegni all'AD (sessione `session_01R8112LZXxKxP66eMCZRgmr`)
Un messaggio breve per lavoro: ✅ fatto (PR) · ⏳ accodato · 🙋 cosa serve da Nicola (le migrazioni da applicare, le chiavi, le scelte). Le domande a Nicola le fai tu, nella tua chat, in italiano semplice.
