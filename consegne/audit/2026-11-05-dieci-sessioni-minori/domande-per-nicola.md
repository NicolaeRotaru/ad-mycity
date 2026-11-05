---
data: 2026-11-05 17:50
tipo: domande per Nicola
fonte: referti delle dieci sessioni sui difetti minori del sito (5/11)
---

# Le domande che le dieci sessioni lasciano a te

Ogni sessione, quando una scheda chiedeva una decisione tua (un prezzo, una regola, un testo legale, un dato che non c'è nel codice), non ha deciso: ha scritto la domanda. Qui sono tutte, per gruppo. Ogni domanda ha il numero della scheda in fondo, per chi poi esegue.

## Soldi, carta e guadagni (14)

- Domanda: con un reclamo interno aperto (tabella disputes) il compenso del fattorino con carta deve restare fermo come prima della 184, o si paga perché la consegna è fatta (commento attuale «niente blocco su resi»)? *(scheda 2567)*
- Su un rimborso pieno con la carta prima del bonifico, il compenso del fattorino (consegna fatta) si paga sempre, oppure si segna REFUNDED e il giro non lo versa? Oggi dipende dall'ora del rimborso. *(scheda 62)*
- Il credito MyCity (buoni regalo) va reso spendibile anche pagando con la carta? È una funzione nuova del percorso carta (scalare il credito prima di Stripe e restituirlo alla scadenza), con la carta spenta al lancio. *(scheda 705)*
- Col codice e il tetto, la piattaforma deve coprire di tasca sua la parte di bonifici che supera l'addebito dopo un annullo (80 cent sulla frutta), o il tetto va cambiato? *(scheda 2220)*
- Col codice «Spedizione gratuita» sotto 30 € per negozio la piattaforma resta a zero e paga la commissione Stripe: si mette una spesa minima al codice o si accetta la perdita? *(scheda 1950)*
- Il codice «Spedizione gratuita» sotto 30 € per negozio lascia al cliente 1 € di consegna: si paga la differenza col saldo MyCity, si cambia nome al codice o si mette una soglia? *(scheda 1948)*
- Su un rimborso parziale con la carta prima dei bonifici, negozio + fattorino possono superare il residuo dell'addebito: la differenza la copre MyCity col suo saldo (bonifico senza source_transaction) o si riduce il compenso/il netto? *(scheda 2066)*
- Aprire altri metodi di pagamento oltre alla carta (togliere payment_method_types: ['card'] e lasciarli al cruscotto Stripe)? La scheda stessa dice «proposta con dati, non implementata di sl…». *(scheda 712)*
- Passare billing_address_collection da 'required' a 'auto' nella pagina di pagamento Stripe (meno campi per il cliente, effetto da misurare)? *(scheda 627)*
- Al negozio basta la capacità transfers (Separate Charges & Transfers): togliere card_payments dal collegamento Stripe? Da confermare con la documentazione Stripe Connect; il codice oggi lo tiene apposta per non rifare la verifica a chi ha già un conto. *(scheda 2184)*
- Stessa regola del 635: la quota ripresa al negozio su un rimborso parziale va calcolata sulla merce (e zero se si rimborsa solo la consegna)? È una regola di soldi da firmare. *(scheda 63)*
- Chi paga la consegna quando un ordine consegnato viene rimborsato: mai il fattorino (consegna fatta), il negozio se il problema è il prodotto, MyCity negli altri casi? *(scheda 636)*
- Nei resi parziali la quota del negozio si calcola sul subtotale prodotti (e consegna/spedizione rimborsate restano a MyCity) invece che sul lordo dell'ordine? *(scheda 635)*
- Se la banca respinge il rimborso di un reso già tornato al negozio, il bonifico al negozio si riapre (oggi) o resta stornato con l'ordine segnato «rimborso da rifare»? *(scheda 637)*

## Ordini e fattorino (11)

- Domanda per Nicola: vuoi che il sito rifiuti gli ordini a domicilio con fascia oraria quando non esiste nessun fattorino approvato (anche offline), come già fa la veloce con il fattorino online? *(scheda 2177)*
- La prima metà è la scelta di Nicola del 31/10 (nessuna traccia dei tentativi di telefonata): domanda per Nicola, vuoi che «Cliente assente» registri almeno l'ora della chiamata o un numero di tentativi? La seconda metà (la UPDATE in lib/ordini/annulla.ts con neq CANCELED invece di eq sullo stato letto) è in un file di S01. Con la 173 il caso «contanti già dichiarati e poi cliente assente» non si presenta più da PICKED_UP. *(scheda 2510)*
- Domanda per Nicola: quando il cliente non ha il codice di consegna, vuoi un'uscita per l'amministratore («segna consegnato» con motivo e traccia) e/o il codice mandato anche per SMS/email al recapito di consegna? (Il sorvegliante sui «ritirato» fermi è del cron, S03.) Intanto il codice che non si riesce a leggere ora si dice, con Riprova (scheda 431). *(scheda 475)*
- Domanda per Nicola: per il fattorino in bici la polizza RC propria resta obbligatoria all'iscrizione (app/rider/onboarding, rider_insurance required), oppure basta la copertura INAIL / una polizza di MyCity? *(scheda 2443)*
- Domanda per Nicola: dopo quante ore l'interruttore «online» del fattorino deve spegnersi da solo (o a che ora la sera), perché la veloce non si venda la mattina dopo con nessuno in servizio? Serve anche una colonna con l'ora dell'accensione (migrazione) e un giro a orario (S03). *(scheda 166)*
- Stessa corsa della 2342 sul credito MyCity (l'euro torna sul credito prima della scrittura della fascia; se il negozio accetta in quell'istante e poi l'ordine si annulla, al cliente torna 1 € in più). Domanda per Nicola: accetti questo euro di rischio per corsa, o vuoi che il credito torni solo dopo la scrittura (con il rischio opposto, l'euro non reso se la scrittura riesce e l'accredito cade)? *(scheda 2334)*
- È una scelta dichiarata nel codice, con l'avviso agli amministratori «Veloce confermata dopo il rimborso dell'euro». Domanda per Nicola: va bene che, nella corsa di millisecondi fra il rimborso e la conferma del negozio, MyCity perda l'euro della veloce? *(scheda 2342)*
- Domanda per Nicola: un ordine con l'indirizzo (o il negozio) senza coordinate deve passare come oggi (scelta documentata in lib/ordini/zona-di-consegna.ts), o essere rifiutato finché l'indirizzo non si geolocalizza? Intanto: verificare che Pane Quotidiano abbia lat/lng. *(scheda 1939)*
- Stessa domanda della 1939 per la veloce: senza coordinate il confine dei 5 km non si controlla e la veloce 30-60 min si vende a qualunque distanza. Rifiutare la veloce (solo lei) senza coordinate? *(scheda 2470)*
- Domanda per Nicola: il raggio di consegna in bici è in linea d'aria (oggi, haversine) o in chilometri di strada? *(scheda 1886)*
- Domanda per Nicola: fra «il negozio ha accettato» e «consegnato» vuoi un «annulla col consenso del negozio» (il cliente chiede, il negozio conferma con un tocco) o una finestra di ripensamento di 2 minuti dopo l'accettazione? Intanto il no dell'annullo dice il motivo vero e la strada (scheda 2370). *(scheda 763)*

## Lavori automatici, email e messa online (8)

- Domanda per Nicola: vuoi che copia notturna e controllo della deriva partano da un calendario esterno affidabile (VPS o un lavoro Vercel che chiama workflow_dispatch) invece che dal calendario di GitHub, che li fa partire con 5-8 ore di ritardo? *(scheda 14)*
- Domanda per Nicola: aggiungiamo GitHub (e il fornitore dello storico foto, se acceso) fra i responsabili nell'informativa, con «le copie durano 30 giorni»? *(scheda 110)*
- Domanda per Nicola: vuoi la regola «ogni migrazione nuova ha il suo gemello di ritorno in migrations/giu/ oppure la riga -- RITORNO: non necessario»? Oggi farebbe rosse 151-154. *(scheda 1513)*
- Domanda per Nicola: vuoi che /api/health diventi giallo finché manca SENTRY_DSN? Oggi la chiave in produzione non c'è, quindi il semaforo cambierebbe colore subito. *(scheda 808)*
- Domanda per Nicola: per quanto tempo teniamo il registro delle email spedite o annullate (proposta 90 giorni, da scrivere anche nell'informativa)? La potatura poi è una riga in lib/privacy/potature-ritenzione.ts. *(scheda 723)*
- Domanda per Nicola: che testo di recesso/garanzia e quali dati del venditore vuoi nella conferma d'ordine (lo approva il legale)? *(scheda 518)*
- Domanda per Nicola: nell'email «Nuovo ordine» al negozio vuoi «La tua vendita: 15,00 € · consegna MyCity 4,00 € · il cliente paga 19,00 € · ti versiamo 13,50 €»? Il netto dipende dalla commissione e va passato dalle due strade d'ordine. *(scheda 64)*
- Domanda per Nicola: per quanto teniamo lo storico delle foto cancellate nella copia (proposta 30 giorni, come gli artefatti del database, da scrivere nell'informativa)? *(scheda 119)*

## Database, prove e pagine secondarie (4)

- Dopo quanti giorni dalla consegna il negozio smette di vedere telefono, note e posizione del cliente (al fattorino oggi sono 7)? Poi è una potatura in SQL. *(scheda 111)*
- Per quanto teniamo la posizione dell'SOS del fattorino (e cosa scriviamo nell'informativa)? Poi è una potatura in SQL più una riga in app/privacy. *(scheda 126)*
- Quando un ordine viene rimborsato, togliamo i punti fedeltà e il premio invito anche se il credito è già stato speso (saldo che può andare sotto zero)? Oggi punti e inviti sono spenti al lancio. *(scheda 461)*
- Chi chiede la cancellazione con credito MyCity sopra zero: blocchiamo la cancellazione finché non lo spende/rimborsiamo, o gli facciamo il bonifico del saldo? *(scheda 511)*

## Amministrazione e segnalazioni (2)

- Domanda: i prodotti che carichi tu dal pannello per un negozio vero devono nascere in bozza finché il negoziante non conferma prezzo e allergeni (come dice il fatto negozi.prima-ondata), anche al lancio per Pane Quotidiano? *(scheda 161)*
- Domanda: un negozio storico sospeso senza «approvato da» e senza partita IVA lo lasciamo riattivare senza partita IVA, o resta fermo finché non esiste una pagina dove inserirla? *(scheda 2652)*

## Pannello del negozio e catalogo (7)

- Domanda a Nicola: /sell deve diventare una pagina aperta a tutti con prezzo, vantaggi e un «Ti richiamiamo», al posto del muro «Accedi o registrati»? *(scheda 436)*
- Domanda a Nicola: quando sospendi un negozio, gli ordini non ancora partiti si annullano e rimborsano da soli, oppure il negozio sospeso deve poterli ancora vedere e rifiutare? *(scheda 187)*
- Domanda a Nicola: passato il tempo per accettare, il negozio può ancora accettare l'ordine finché il controllo automatico (ogni 30 minuti) non lo annulla? Se sì, la frase in lib/ordini/scadenza-accettazione.ts va cambiata in «puoi ancora accettarlo per poco»; se no, la rotta di accettazione deve rifiutarlo. *(scheda 2346)*
- Domanda a Nicola: le promozioni in percentuale dei negozi restano accese al lancio senza il prezzo più basso dei 30 giorni (art. 17-bis Cod. Consumo), o le spegniamo dietro un interruttore come il Drop finché non c'è lo storico dei prezzi (serve una migrazione)? *(scheda 117)*
- Domanda a Nicola: approvi il testo della seconda spunta «artt. 1341-1342 c.c.: §13, §14, §15, §17» dopo il parere di un legale? Serve anche dove salvarla (una categoria nuova in consent_log richiede una migrazione sul vincolo). *(scheda 515)*
- Domanda a Nicola: il campo «Prezzo pieno (barrato)» resta finché non c'è lo storico dei prezzi (migrazione + trigger), o lo nascondiamo al lancio come il Drop? Va deciso insieme alla 117. *(scheda 504)*
- Domanda a Nicola: al lancio nascondiamo dal menu del negozio Sponsorizza, Storie e Analisi (AI Studio è già spento), lasciando Ordini, Prodotti, Guadagni, Clienti, Profilo e Aiuto? *(scheda 438)*

## Carrello, cassa e consegna (6)

- Domanda: dopo il primo ordine la cassa deve salvare l'indirizzo nella rubrica del cliente da sola, o chiedere con una casella «salva questo indirizzo»? (dati personali: serve dirlo nell'informativa). *(scheda 338)*
- Domanda: chi sceglie il ritiro in negozio deve dire a che ora passa (fasce come la consegna) o basta «entro l'orario di chiusura di oggi/domani»? Oggi il ritiro è spento in codice (RITIRO_IN_NEGOZIO_ATTIVO = false). *(scheda 965)*
- Domanda: al confine dei 5 km in linea d'aria la strada è 6-7 km e in bici, con l'andata al negozio, sono circa 61 minuti: la veloce «30-60 minuti» va offerta fino a 5 km, solo fino a 4 km, o la promessa diventa 30-70? *(scheda 2474)*
- Domanda: da che giorno le rotte smettono di accettare le sei fasce di prima (FASCE_DI_PRIMA)? Servono solo alle schede della cassa aperte prima del 30/10: una data di fine (es. 15/11, giorno del lancio) e si tolgono. *(scheda 2392)*
- Domanda: un ordine che il negozio deve accettare nello stesso minuto in cui nasce (lunedì 19:15, fascia 19:30–21:00) va ancora accettato? Il tuo caso 7 dice di sì; serve un margine (es. 5 minuti) prima dell'ultimo ritiro? *(scheda 2394)*
- Domanda: la merce ritirata oggi e tenuta da parte la notte può servire una fascia di domani mattina (lunedì 17:00 → «Domani · 7:30–9:00»)? Il codice oggi dice di no, per prudenza. *(scheda 2393)*

## Legale, privacy e account (9)

- Domanda per Nicola: dopo quanti mesi dal bonifico pagato si cancella l avviso «Bonifico di rimborso da fare» con l email del cliente? Con la risposta: una potatura in lib/privacy/potature-ritenzione.ts e la durata nell informativa. *(scheda 1707)*
- Domanda per Nicola: approvi la frase «ti rispondiamo entro un mese» (art. 12.3 GDPR)? Se no, si toglie. *(scheda 2627)*
- Domanda per Nicola (col fiscalista): MyCity è «gestore di piattaforma» DAC7 (D.Lgs. 32/2023)? Se sì, servono una riga nella tabella delle finalità, l Agenzia delle Entrate fra i destinatari e due righe nel contratto del negozio. *(scheda 718)*
- Riguarda solo i codici sconto, spenti al lancio. Domanda per Nicola, prima di riaccenderli: col codice e il tetto la consegna dei rimasti può restare più bassa della regola; nei Termini scriviamo «come se avessi ordinato solo da loro, o meno se avevi un codice sconto»? *(scheda 2219)*
- Domanda per Nicola (col commercialista): chi emette ogni mese la fattura elettronica di commissioni (e, quando si accende, dell abbonamento) al negozio, e con quale strumento? *(scheda 512)*
- Domanda per Nicola (col legale): costruiamo l email «I Termini cambiano dal …» con l entrata in vigore 30 giorni dopo l invio, oppure riscriviamo il §15 com è oggi (riaccettazione al primo accesso)? Per i negozi il P2B fa preferire la prima. *(scheda 100)*
- Domanda per Nicola: quali dei sei profili social (Facebook, Instagram, TikTok, X, LinkedIn, YouTube) esistono davvero, e il nome è «mycitypiacenza» o «mycity.piacenza»? Con la risposta il piede li legge da una costante e mostra solo quelli veri. *(scheda 306)*
- Domanda per Nicola (col commercialista): per quanto teniamo i dati fiscali di un negozio che ha venduto e cancella l account (10 anni?), e in un archivio separato leggibile solo dall admin? Serve una tabella nuova (migrazione 235-239) e la copia di ragione sociale e P.IVA sull ordine. *(scheda 82)*
- Domanda per Nicola (col legale): con la carta i 2 € di consegna in più si tolgono dal rimborso del pane dopo l accettazione: si tiene questa regola (rischio di clausola vessatoria, art. 33 c.2 lett. o Cod. Cons.) o la consegna dei rimasti non sale? *(scheda 2239)*

## Vetrina, prodotto e home (1)

- Domanda a Nicola: «Quando sospendi un negozio con ordini in viaggio, va bene che cliente e fattorino non ne vedano più nome e indirizzo, e che sia l'assistenza ad avvisare i fattorini?» (la scheda stessa propone di chiuderla così). *(scheda 1743)*

## Accessi, AI e parti comuni (5)

- Le due funzioni AI senza pagina (bozza di risposta alle domande, riassunto delle recensioni): si collegano alle pagine del negozio o si tolgono le rotte? *(scheda 609)*
- La descrizione per Google diventa «I negozi di Piacenza a casa tua: ordina dal forno sotto casa e paga alla consegna.» (la scheda propone anche «Consegna in 30-60 minuti», ma la veloce dipende dal fattorino in servizio)? *(scheda 402)*
- Il sito in inglese si riaccende (traduzioni da completare) oppure /api/locale risponde 404 finché resta solo l'italiano? *(scheda 983)*
- Le funzioni AI per i clienti (riassunto recensioni, risposta alle domande, ordine da foto) devono restare spente insieme all'AI per i negozi, o avere un interruttore loro? *(scheda 2554)*
- Quanto può spendere al giorno in AI un singolo negozio (la scheda propone 2 € al giorno, sul tetto di sito di 20 €)? Con la cifra si aggiunge un secondo conto per (giorno, negozio), con una migrazione. *(scheda 776)*

## Cose da fare con le mani, fuori dal codice (20)

- Nicola deve aggiungere in GitHub → Settings → Secrets and variables → Actions il segreto SUPABASE_SERVICE_ROLE_KEY (e la variabile SUPABASE_URL), poi avviare a mano backup-db.yml e controllare «esito-file-foto: copiati N file». *(scheda 6, S03)*
- Nicola deve applicare la migrazione 166 (mark_abandoned_cart_email_sent che risponde vero/falso) sul database vero. *(scheda 19, S03)*
- Nicola: creare il progetto Sentry (regione UE), mettere SENTRY_DSN/NEXT_PUBLIC_SENTRY_DSN (e SENTRY_AUTH_TOKEN per le mappe) su Vercel e ricompilare; accendere un monitor esterno su /api/health/ready; mettere SUPPORT_EMAIL. Poi decidere la 808 (SENTRY_DSN nel semaforo). *(scheda 596, S03)*
- È una misura, non un difetto: Nicola (o chi ha accesso al database vero) fa EXPLAIN ANALYZE sulle sette viste della 152 col catalogo reale e decide se tenere security_barrier. *(scheda 1516, S04)*
- La pulizia esiste già nella 183, che in produzione manca: Nicola deve applicare la 183 (le righe vecchie di activity_events si ripuliscono lì). *(scheda 90, S04)*
- La correzione di check_coupon è la 185, non applicata in produzione: Nicola la applica col rilascio. Oggi i codici sono spenti. *(scheda 207, S04)*
- La 191 va applicata insieme al rilascio della pagina nuova del fattorino: è un ordine di operazioni di Nicola, non codice. *(scheda 2618, S04)*
- Una migrazione esistente non si modifica e la 215 arriva dopo la 191, quindi non può prepararle il terreno. Prima di applicare la 191, Nicola esegue a mano: BEGIN; SET LOCAL mycity.allow_order_write = '1'; UPDATE public.orders SET rider_lat = NULL, rider_lng = NULL, rider_position_updated_at = NULL WHERE delivery_status IN ('DELIVERED','CANCELED') AND rider_id IS NULL AND (rider_lat IS NOT NULL OR rider_lng IS NOT NULL); COMMIT; poi la 191 passa. *(scheda 3, S04)*
- Il rischio è il piano di Supabase (la trasformazione delle foto c'è solo col Pro): Nicola deve tenere il pagamento attivo. Il controllo in /api/health (app/api/health, non nel mio territorio) e il segnaposto onError sulle foto di ProductCard/galleria sono di altre sessioni. *(scheda 1747, S06)*
- Nicola (o l'AD) esegue in sola lettura su Supabase: select id, store_name from profiles where store_hours ?& array['sun','mon','tue','wed','thu','fri','sat'] and not jsonb_path_exists(store_hours,'$.*[*]'); deve tornare vuoto o solo negozi davvero in ferie. *(scheda 2512, S07)*
- Abbassare la soglia di 4 giorni renderebbe «chiuso sempre» un negozio con uno o due giorni vuoti per sbaglio. Prima va guardato nel database se esistono negozi con 1-3 giorni scritti e tutti vuoti (select id, store_name, store_hours from profiles where store_hours is not null): se non ce ne sono, il caso non esiste. *(scheda 2515, S07)*
- Nicola: impostare SUPABASE_SERVICE_ROLE_KEY su Vercel (carta #154, dopo la rotazione #203). Da oggi, senza chiave, la pagina mostra un errore e lo scrive nei registri invece di dire «non trovato» (scheda 1723). *(scheda 1746, S08)*
- Nicola: eseguire select slug from categories where slug='abbigliamento' and parent_id is null; se c è, disattivarla nel database (al lancio non c è). Fra la lettura delle categorie e quella delle «piene» può comparire per un attimo. *(scheda 2248, S08)*
- Nicola: creare la casella privacy (sul dominio mycity-marketplace.com) e impostare NEXT_PUBLIC_TITOLARE_EMAIL_PRIVACY su Vercel. *(scheda 2021, S08)*
- Nicola: applicare la migrazione 171 nel database vero insieme alla chiave di servizio (carta #154). *(scheda 122, S08)*
- Nicola: applicare in produzione le migrazioni 164 e 181; il sito le usa già e ripiega su profiles finché mancano. *(scheda 319, S09)*
- Nicola: togliere approvazione o profilo pubblico al profilo 44444444-4444-4444-4444-aaaaaaaa0001 (o cancellarlo); sitemap e conteggio di Chi siamo lo seguono da soli. *(scheda 597, S09)*
- Nicola: mettere SUPABASE_SERVICE_ROLE_KEY su Vercel (Production, Sensitive) e ripubblicare. Dopo, il callback può mandare a /accetta-condizioni chi non si verifica. *(scheda 501, S10)*
- Nicola: accendere CAPTCHA (Turnstile) in Supabase → Authentication → Attack Protection. Poi si porta l'iscrizione sulla rotta /api/auth/signup (con options.data e il freno per rete). *(scheda 214, S10)*
- Nicola: creare un database Upstash Redis (va bene il gratuito) e mettere UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN in Vercel → Production (Sensitive), poi ripubblicare. *(scheda 223, S10)*
