---
data: 2026-08-18 10:12
tipo: radiografia-marketplace
totale: 245
bloccanti: 12
gravi: 114
minori: 119
---

# Radiografia del marketplace, 18 agosto

## In parole semplici

Questa e la seconda visita completa al sito. La prima e del 29 luglio.
In mezzo sono state riparate cento voci di quel referto. Stamattina sono
state applicate al database vero le quattro modifiche che mancavano.

Ecco i due conti a confronto.

| | 29 luglio | 18 agosto | differenza |
|---|---:|---:|---:|
| Bloccanti | 21 | 12 | **-9** |
| Gravi | 137 | 114 | -23 |
| Minori | 104 | 119 | +15 |
| **Totale** | **262** | **245** | **-17** |

I bloccanti sono quasi dimezzati. Il totale invece scende poco.

## Cosa cambia per te

La cosa buona e la prima riga. I bloccanti sono i difetti che fermano
qualcuno o costano soldi. Erano ventuno, ora sono dodici.

La cosa da capire e la riga in fondo. Il totale scende di diciassette su
duecentosessantadue, e sembra poco per cento riparazioni. Il motivo e che
questo non e un conto fatto sottraendo dalla lista di luglio. E una misura
nuova, dall inizio, sullo stesso sito ma cambiato. Mentre si chiudevano i
difetti vecchi se ne sono trovati di nuovi. I minori sono perfino saliti,
da centoquattro a centodiciannove.

Detto in un altro modo: chi guarda meglio trova di piu. Il numero grande
non e il voto del lavoro fatto. Il voto e la prima riga.

## Cosa devi fare

Tre dei dodici bloccanti nascono dal lavoro di questi due giorni. Sono
miei, e te li dico per primi.

**Uno: la disiscrizione con un clic non disiscrive.** L ho scritta io ieri.
Cerca la persona per indirizzo email dentro la tabella dei profili. Quella
tabella una colonna email non ce l ha. L operazione fallisce e nessuno se ne
accorge, perche il codice non controlla l esito. In piu l indirizzo di
ritorno resta vuoto e la pagina risponde errore. Verificato interrogando il
database vero: la colonna non esiste davvero. Lo riparo io.

Un esempio di cosa succede davvero. Una cliente riceve la newsletter del
sabato mattina. In fondo trova «Cancellami» e ci clicca. Il sito le risponde
con una pagina di errore. Lei riprova lunedi, stessa pagina. La settimana
dopo le arriva un altra newsletter, perche sul suo profilo non e cambiato
niente. A quel punto non clicca piu: segna il messaggio come spam. Da li in
avanti anche le conferme d ordine di quel negozio rischiano di finire nella
posta indesiderata, per tutti.

**Due: la partita IVA finta in fondo alle pagine.** Questa non e riparabile
da me: servono i tuoi dati veri. Denominazione, sede, partita IVA. E se un
responsabile della protezione dati esista oppure no.

**Tre: la bonifica applicata il 18 agosto alle 9 del mattino.** Un revisore avvisa che poteva togliere
l approvazione ai negozi. Nel codice il rischio c e. Nella realta l ho
misurato prima di applicarla, ed e stato un solo profilo: il fattorino di
prova. La strada con cui approvi dal pannello scrive tutti e due i campi
giusti, quindi Pane Quotidiano non era esposto. Ricontrollato adesso:
risulta approvato.

Sugli altri nove bloccanti aspetto che tu mi dica se partire.

## Cosa non ho verificato

Non ho aperto il sito in un browser. Non ho fatto un ordine, non ho pagato
con una carta di prova, non ho cliccato un link di disiscrizione vero. La
radiografia legge il codice e interroga il database in sola lettura.

Non so quanti di questi duecentoquarantacinque fossero gia nella lista di
luglio con parole diverse. Le due liste non sono confrontabili riga per
riga: solo i totali lo sono, ed e per questo che non ti dico quanti ne ho
chiusi.

---

### Dettagli tecnici

Metodo: 13 dimensioni, un senior per ognuna in sola lettura, poi ogni
problema passato a un secondo revisore col compito di smontarlo. Resta solo
cio che ha retto. 26 revisori in tutto, gli stessi del referto di luglio.

Il dettaglio completo dei 245 problemi, con file e riga, sta in
`MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`.

#### I dodici bloccanti

1. **Il premio invito lo decide il browser: credito creato dal nulla e spendibile** — *Sicurezza e accessi*
   `migrations/015_competitive_moats.sql:119 (colonna reward_amount) · migrations/092_referral_no_self_referral.sql:31-32 (policy INSERT) · migrations/089`
2. **Il cliente può scriversi da solo il credito MyCity (profiles.wallet_balance_cents)** — *Permessi e database*
   `migrations/001_create_tables.sql:70-72 · migrations/107_fix_profile_role_self_assignment.sql:20-48 · migrations/061_p0_security_rls_state_machine_revi`
3. **La bonifica della 114 toglie l'approvazione a TUTTI i negozi e i fattorini mai passati dal pannello admin** — *Permessi e database*
   `migrations/114_hardening_radiografia.sql:226-230 · migrations/021_seller_kyc_and_approval.sql:59,72-75 · migrations/004_no_admin_approval.sql:12-17 · `
4. **Rimborso parziale prima del payout: il venditore incassa comunque il 100% del netto** — *Pagamenti*
   `/home/user/mycity/lib/stripe/payout.ts:294-296 (no-op) + 544-576 (update parziale) · /home/user/mycity/app/api/cron/release-payouts/route.ts:57-65 · /`
5. **La somma dei transfer (venditore + rider) supera l'incasso su ogni ordine con spedizione gratis: il fattorino non viene mai pagato** — *Pagamenti*
   `/home/user/mycity/lib/stripe/client.ts:306-318 (computeOrderSplit) · /home/user/mycity/lib/shipping.ts:28-33 e 53-65 · /home/user/mycity/lib/constants`
6. **La disiscrizione con un clic non funziona su nessuna email: aggiorna profiles filtrando su una colonna che non esiste** — *Privacy e legale*
   `/home/user/ad-mycity/marketplace/app/api/unsubscribe/route.ts:32-37 (e lib/email/client.ts:57, 68-73, 94-105)`
7. **In fondo a ogni pagina, nei Termini e nei Contatti c'e' una partita IVA finta, e su /cookies un DPO mai nominato** — *Privacy e legale*
   `/home/user/ad-mycity/marketplace/components/Footer.tsx:241,244 · app/terms/page.tsx:56-57 · app/contact/page.tsx:155-157 · app/cookies/page.tsx:117`
8. **Un prodotto a «Disponibilità illimitata» non si può comprare: solo il checkout lo dichiara esaurito** — *Schermate e uso*
   `app/checkout/page.tsx:84 e :157-158 (il blocco) · app/checkout/page.tsx:817 e :835 (i due pulsanti disabilitati) · lib/products/schema.ts:122 e compon`
9. **Checkout: con un indirizzo salvato il tasto «Conferma ordine» non fa nulla e non dice perché** — *Accessibilita*
   `components/checkout/ShippingAddressForm.tsx:132 · app/checkout/page.tsx:538-560 · components/checkout/OrderSummary.tsx:89-95`
10. **I prodotti a scorte illimitate non si possono comprare: il checkout li dichiara esauriti e spegne il bottone** — *Flussi critici*
   `/home/user/mycity/app/checkout/page.tsx:78 (select senza price/con stock), :84 `stockMap.set(p.id, p.stock ?? 0)`, :157-161 availableFor/stockIssues, `
11. **Il ritiro in negozio non arriva mai a «consegnato»: l'ordine resta fermo e il negoziante non viene pagato** — *Flussi critici*
   `/home/user/mycity/migrations/061_p0_security_rls_state_machine_reviews.sql:149-166 (transizioni ammesse ai client) · /home/user/mycity/migrations/083_`
12. **Il bottone «Applica a tutti» dell'AI Studio può riscrivere prezzo, disponibilità e stato di 200 prodotti senza mostrare cosa cambia** — *Funzioni con AI*
   `/home/user/ad-mycity/marketplace/lib/ai/catalogBatch.ts:61-65 · /home/user/ad-mycity/marketplace/app/seller/products/ai-batch/page.tsx:366,446,453 · /`

#### I gravi, per reparto

**Architettura (4)**

- Due variabili d'ambiente per lo stesso indirizzo del sito: disiscrizione e conferma newsletter rispondono errore 500
- La cancellazione account fatta dall'admin lascia carte d'identità e selfie nel database e nello storage
- Il conto della spedizione mostrato al cliente è riscritto dentro la pagina invece di usare la fonte unica, e due costanti sono duplicate
- L'ordine in contanti è una copia di quello con carta rimasta indietro: arrotondamento vecchio, nessun tetto allo sconto, codice sconto bruciato per sempre

**Sicurezza e accessi (4)**

- Il controllo "negozio chiuso" non scatta mai e la consegna e' sempre a tariffa fissa: il server non riesce piu' a leggere il profilo del negozio
- Un fattorino approvato puo' pubblicare e vendere prodotti: il flag di approvazione e' uno solo per tre ruoli
- Ogni fattorino approvato legge nome, indirizzo e telefono di TUTTI gli ordini liberi della citta'
- Il link "disiscriviti" dice "fatto" ma non disiscrive: la colonna su cui scrive non esiste

**Permessi e database (8)**

- Il pannello dei codici sconto non riesce più a leggere né a modificare i codici (revoca della 114)
- Chi partecipa a una chat può spostarla nella posta di un'altra persona
- Ogni fattorino approvato può scaricare nome, telefono e indirizzo di tutti gli ordini in attesa
- Gli interruttori delle notifiche continuano a non avere effetto: nessuno scrive la colonna `category`
- Il secchio `stories` accetta caricamenti nella cartella di un altro (stesso difetto già chiuso su `products`)
- I contatori delle campagne sponsorizzate sono gonfiabili da un visitatore anonimo
- La vista `public_profiles` espone nome e indirizzo anche dei venditori non approvati
- product_views non ha nessuna policy di lettura: le statistiche del negoziante sono ferme a zero

**Pagamenti (9)**

- Claw-back fallito su charge.refunded: l'ordine viene marcato REFUNDED e la perdita sparisce dai conti
- rider_payout_status='REVERSED' viola il vincolo del database: lo storno del compenso rider non viene mai registrato
- La risoluzione di un reclamo interno tocca il flag del chargeback Stripe: paga un ordine contestato in banca, o blocca per sempre il pagamento al negozio
- Doppio rimborso reale possibile: refunded_amount_cents letto-e-riscritto senza atomicita' e chiavi di idempotenza diverse per percorso
- stripe_charge_id best-effort: se il retrieve del PaymentIntent fallisce i payout partono senza source_transaction e si bloccano per sempre
- Annullo admin di un ordine gia' parzialmente rimborsato: il residuo non viene mai restituito
- charge.refunded non recupera il compenso del rider e cancella ordini gia' consegnati
- COD: la base dello split e' il lordo pre-credito mentre total_price e' il netto post-credito
- Il fattorino puo' marcare un ordine come PAGATO senza averlo consegnato: il controllo dichiarato nel commento non esiste

**Privacy e legale (7)**

- Il registro dei consensi cookie e' sempre vuoto: ogni POST /api/consent viene respinto con 400
- Le notifiche promozionali nascono accese: notif_promos ha default true
- Chi cancella l'account lascia il proprio indirizzo email in newsletter_subscribers, orfano e per sempre
- I video Vimeo installano cookie di terze parti senza consenso (YouTube e' protetto, Vimeo no)
- La cookie policy non corrisponde ai cookie reali: uno dichiarato non esiste, quattro esistono e non sono dichiarati
- La geolocalizzazione continua dei rider non ha una base giuridica dichiarata ne' un'informativa da lavoratori
- Due fornitori che ricevono le foto caricate dai negozianti non sono dichiarati tra i responsabili, e nemmeno il CDN unpkg

**Prestazioni (9)**

- Nessuna pagina viene servita già scritta: il contenuto parte dopo ~300 KB di JavaScript, e la causa è una riga sola
- Il checkout legge due volte le stesse identiche righe di products e profiles, solo per due colonne in più
- Gli sconti al momento di pagare: una chiamata al database per ogni articolo del carrello
- La scorciatoia scritta nel middleware per non rallentare il catalogo non scatta mai, e chi ha fatto l'accesso paga due attese di rete a ogni pagina
- Una scheda prodotto fa partire 7-8 domande separate al server di autenticazione, tutte per la stessa risposta
- Le pagine /stores e /near mostrano "0 prodotti" ai negozi meno recenti, e non è vero
- Pannelli e cruscotti scaricano tabelle intere senza limite — e il pannello ordini lo rifà ogni 30 secondi
- La griglia del catalogo scarica 96 descrizioni che nessuno mostra, e applica i filtri dopo il taglio: gli elenchi filtrati escono corti e sbagliati
- Nelle pagine ordini le foto dei prodotti si scaricano a piena risoluzione per mostrarle grandi 48 pixel

**Schermate e uso (15)**

- Il `loading` del pulsante non lo disabilita davvero: doppio clic possibile, e l'import duplica tutto il catalogo
- «Ritiro in negozio» non arriva alla conferma: il browser pretende comunque l'indirizzo di consegna
- Il carrello non si svuota al logout: sul computer condiviso passa all'utente successivo
- Il totale scritto nel carrello è più basso di quello che si paga: mancano i 3 euro di «Consegna MyCity»
- Il tasto «+» sulle card dei prodotti con varianti non fa assolutamente niente
- La card mostra il prezzo scontato ma nel carrello entra il prezzo pieno
- Un errore di rete diventa «Ordine non trovato» e «Negozio non trovato»
- Chi si registra partendo dal checkout non torna al checkout
- «Riordina» svuota il carrello senza chiedere niente, e ci rimette dentro i prezzi vecchi
- Il totale mostrato al checkout è calcolato sui prezzi salvati nel carrello, il server ne addebita altri
- Se lo script anti-bot non carica, registrazione e accesso restano bloccati per sempre
- Dopo aver pagato con carta si può leggere «Non hai ancora ordini»
- Il filtro «Spedizione gratis» della ricerca è finto e si annulla da solo in silenzio
- I filtri della ricerca non finiscono nell'indirizzo: si perdono con il tasto Indietro
- Nel carrello la quantità sale senza limite, poi il checkout blocca tutto

**Accessibilita (13)**

- Ricerca: il combobox è dichiarato ma non esiste — aria-expanded sempre vero, aria-controls che punta al nulla, listbox senza opzioni
- La Dichiarazione di Accessibilità pubblica descrive un audit che nel repo non esiste
- Nessun cancello automatico di accessibilità: axe/pa11y assenti, eslint-plugin-jsx-a11y non attivo, lo strato _a11y.css non arriva all'app
- Errori di form mai annunciati: nessun role=alert nella primitiva Field, né nei banner del checkout
- Focus ring del design system sotto la soglia: primary-400 misura 2,90:1 (serve 3:1) su 73 punti del sito
- Filtri di categoria: dialogo aria-modal con il fuoco fuori e senza uscita da tastiera — mentre la correzione esiste già a un file di distanza
- Lightbox foto prodotto: nessun Esc, nessun focus trap, il fuoco resta dietro l'overlay nero
- Storie negozi: si avanzano da sole ogni 5 secondi senza pausa, e l'immagine — che è il contenuto — ha alt vuoto
- Carrello: pulsanti quantità e «Rimuovi» identici per ogni prodotto, e nessun annuncio dei cambi
- Il numero di articoli nel carrello non viene mai annunciato: aria-label copre il badge
- ProductCard: «Esaurito», «-30%» e «Nuovo» sono nascosti allo screen reader da aria-hidden
- Il toggle «mostra password» è escluso dalla tastiera con tabIndex={-1}
- Coupon e codice di verifica: campi senza etichetta, solo placeholder — e il dialogo di verifica non è un dialogo

**Flussi critici (9)**

- Il fattorino non viene pagato per nessuna consegna in contanti
- Il bonifico al fattorino non sta dentro l'incasso quando la spedizione è gratis, e riparte a vuoto a ogni giro
- Rimborso parziale prima del pagamento: il negozio incassa comunque il 100% e la perdita resta alla piattaforma
- Contestazione vinta: al negozio i soldi tornano, al fattorino no
- Ordine in contanti da due negozi: se il secondo fallisce, il primo negozio ha già ricevuto mail e campanella di un ordine cancellato
- Il prezzo mostrato in checkout non viene mai riletto dal database: in contanti il cliente può pagare al fattorino una cifra diversa da quella vista
- Se modifichi l'indirizzo suggerito restano attaccate le coordinate vecchie: il fattorino viene mandato all'indirizzo sbagliato
- Il cron che scade le riserve rimette in vendita merce già venduta quando il webhook Stripe crea gli ordini a metà
- La pagina guadagni del fattorino mostra un numero che non è quello che gli viene versato

**Interfacce e backend (11)**

- La variabile NEXT_PUBLIC_SITE_URL non esiste: disiscrizione e conferma newsletter rispondono 500, e il link nelle email punta a un dominio che non e' l'applicazione
- Il codice sconto viene «consumato» e mai restituito su cinque uscite di errore del checkout
- Gli ordini in contanti non hanno nessuna protezione contro il doppio invio: doppio clic = ordine doppio, merce riservata due volte, credito addebitato due volte
- Il fattorino puo' dichiarare incassati i contanti di un ordine mai consegnato: il controllo documentato non esiste nel codice
- Risolvere un reclamo interno azzera anche il blocco del chargeback bancario: il venditore viene pagato mentre la banca ha gia' ripreso i soldi
- La scadenza del carrello non e' atomica nel webhook: la merce puo' tornare in magazzino due volte
- Il webhook Stripe fa troppo lavoro sincrono prima di rispondere: rischio di superare il tempo di attesa e farsi disattivare l'endpoint
- Il controllo di salute usato da Render risponde 503 anche per guasti non fatali: un rallentamento del database puo' spegnere il sito
- Due implementazioni divergenti della cancellazione account: quella dell'amministratore lascia nello storage documenti d'identita' e selfie
- La cancellazione di un utente distrugge fisicamente i resi: l'anonimizzazione scritta nel codice viene vanificata dallo schema
- Il tetto sulla dimensione del corpo delle richieste si aggira omettendo un'intestazione: un solo utente puo' far cadere l'istanza

**Funzioni con AI (3)**

- Il freno di spesa AI non è mai acceso in produzione: la variabile che lo attiva non esiste in nessun file di configurazione
- La spesa AI in produzione non si vede da nessuna parte: la riga di telemetria è spenta, i job massivi non la scrivono e le ricerche web non sono contate
- Nessuna traccia di chi ha scritto cosa: le modifiche fatte dall'AI sui prodotti non lasciano audit né valore precedente

**Dati e misure (12)**

- L'acquisto viene contato solo se il cliente torna sulla pagina ordini
- Il totale spedito nell'evento e' la stima del browser, non l'importo davvero incassato
- Il voto per il negozio del mese non viene mai contato: browser e database scrivono due mesi diversi
- Meta' del catalogo eventi non arriva da nessuna parte: Google Analytics non e' dichiarato nel file di deploy
- Un carrello con due negozi crea due ordini ma un solo evento, e il venditore diventa la parola "multi"
- Chi si iscrive con email viene contato due volte, e non si vede mai da quale porta e' entrato
- Il test A/B non si puo' misurare: la variante non e' attaccata agli eventi che contano
- Il messaggio d'errore grezzo del database finisce dentro PostHog, con dentro i dati dei clienti
- Le pagine dei numeri scaricano le righe senza limite e senza controllare gli errori: sopra le mille righe mentono in silenzio
- Lo stesso negozio vede tre "fatturato" diversi su tre pagine, piu' un quarto dentro la stessa pagina
- Visualizzazioni e clic degli sponsorizzati: contatori pubblici che chiunque puo' gonfiare, e che contano anche cio' che nessuno ha visto
- L'email del cliente viene spedita a PostHog, che di norma sta negli Stati Uniti

**Pubblicazione e affidabilita (10)**

- Il link per disiscriversi dalle email risponde con una pagina di errore
- Il rilascio in produzione parte senza aspettare l'esito dei test
- Non c'è scritto da nessuna parte come si torna indietro dopo un rilascio andato male
- Quando un rimborso fallisce, nel log resta la frase e sparisce l'errore vero
- Il controllo che deve accorgersi delle migrazioni dimenticate non può diventare rosso
- La copia notturna del database non basta a rimettere in piedi il sito, e viaggia in chiaro
- Se manca la chiave delle email, Render considera morto tutto il sito
- Il registratore degli errori non si accende in tempo per il guasto peggiore
- Il freno anti-abuso consuma memoria invece di proteggere
- I documenti di ripristino e lo script di backup si contraddicono sulla rete di sicurezza

#### I minori, per reparto

**Architettura (10):** I tipi del database non sono collegati a nessun client, e il file generato ha già dei buchi proprio sulle colonne dei soldi · Il filtro anti-contenuti-vietati è scritto per intero e non è collegato a nessuna rotta (ma la copertura non è zero come dichiarato) · Due «ErrorState» diversi e incompatibili usati insieme, più una cartella design-system che nessuno compila · La procedura multilingua è ferma a metà: 29 file su 347, selettore nascosto, un test che pretende il contrario e la pagina marcata inglese · Le varianti di prodotto si salvano con la stessa funzione scritta due volte, riga per riga · La forma delle risposte d'errore è dichiarata «mai inconsistente» e in una quindicina di punti non lo è, anche sulle due rotte dei soldi · Due colonne per dire la stessa cosa sull'approvazione del negozio, senza nessun vincolo che le tenga d'accordo · Il file lib/shipping.ts e la cartella lib/shipping/ hanno lo stesso nome, e un parametro morto nella pagina del fattorino verrebbe rifiutato dal database · Il gestore dei pagamenti Stripe è un file solo da 1002 righe con dentro otto mestieri diversi · Quattro componenti scritti e mai collegati a nessuna pagina

**Sicurezza e accessi (8):** Il controllo del ritorno dopo il login lascia passare la barra rovesciata e porta su un sito esterno · La chiave che scavalca tutti i controlli fa anche da password di una rotta interna · /api/health dice a chiunque quali segreti mancano e riporta l'errore grezzo del database · Nel secchio delle storie chiunque abbia un account puo' caricare file, anche nella cartella di un altro negozio · Chi partecipa a un evento e chi vota il negozio del mese e' un elenco pubblico · La rotta pubblica external-refresh legge i prodotti con la chiave che scavalca le regole · Il beacon /api/track accetta dati liberi e crede alle intestazioni di geolocalizzazione del chiamante · L'esportazione dei dati personali non ha nessun freno ed e' molto pesante

**Permessi e database (9):** La chiusura dei privilegi di default della 114 dimentica il ruolo `authenticated` · subscription_orders: il venditore può creare un abbonamento a nome di un cliente e il cliente può scriversi il prezzo · Adesioni agli eventi e voti al negozio del mese sono leggibili da chiunque, con l'identità di chi ha votato · La vetrina «attività dal vivo» lascia contare a un concorrente gli ordini di ogni negozio · Il tetto anti-gonfiaggio della 117 si può usare al contrario, per azzerare le visite vere di un rivale · Il mittente può riscrivere un proprio messaggio già letto, senza lasciare traccia · lib/notifications.ts non può funzionare: la RLS non ha nessuna policy di INSERT su notifications · group_participants porta due policy di lettura identiche (109 e 114) · Il controllo di deriva delle migrazioni confronta solo il nome, non il contenuto né il numero

**Pagamenti (10):** Il webhook non verifica session.payment_status: mina innescata sul primo metodo di pagamento nuovo · COD: ripartizione dello sconto con arrotondamento ingenuo e nessun tetto complessivo · Codice gift card derivato dal webhook secret: una rotazione della chiave emette una seconda carta sullo stesso pagamento · I guadagni mostrati al negoziante ignorano gli storni parziali e lo stato PROCESSING · reverseRiderTransfer: chiave di idempotenza senza il totale accumulato e nessun contatore degli storni · Idempotenza del webhook senza claim: due consegne concorrenti dello stesso evento vengono processate entrambe · Rimborso che fallisce dopo l'emissione: charge.refund.updated non e' gestito · Doppio rilascio di stock e coupon: la scadenza del checkout non e' atomica nel webhook · Nessun confronto fra l'importo incassato da Stripe e il totale preventivato · Nessuna misura dell'esito dei pagamenti: i motivi di rifiuto della carta vengono buttati via

**Privacy e legale (7):** I consensi dei visitatori non registrati non sono attribuibili a nessuno: ne' user_id ne' anon_id · Il registro dei consensi accumula indirizzi IP senza scadenza: e' l'unica tabella con PII che il cron di conservazione non pota · L'accettazione di Termini e Informativa alla registrazione non viene registrata da nessuna parte · I documenti d'identita' di chi viene respinto non vengono mai cancellati automaticamente · Il pannello admin carica in blocco i codici fiscali di tutti gli utenti, e le letture non lasciano traccia · Il segreto che firma i link di disiscrizione ripiega sulla chiave di servizio Supabase, o su una stringa scritta nel codice · Il banner cookie promette una chiusura che nel codice non esiste

**Prestazioni (11):** Filtrare con elenchi lunghi di identificativi: l'indirizzo della richiesta sfonda il limite e la pagina si svuota in silenzio · Ogni visitatore della home apre un collegamento permanente in ascolto sulla tabella ordini · Mancano gli indici su tre interrogazioni che il sito esegue di continuo · La pagina categoria aspetta due giri prima di partire, poi ripete due richieste per ogni fascia di prodotti · La scheda prodotto scarica al browser anche l'indice di ricerca del prodotto · Due indici identici sulla tabella che riceve più scritture di tutte · La tabella delle visite ai prodotti cresce senza fine, mentre quella accanto ha già la sua pulizia · Metà delle immagini salta l'ottimizzatore di Next: niente adattamento agli schermi densi, e due impostazioni del next.config restano lettera morta · La chat di assistenza viene scaricata da tutti, anche da chi non vedrà mai il pulsante · Chi ha fatto l'accesso tiene aperti due collegamenti in tempo reale identici, uno per la barra in alto e uno per quella in basso · Un timer che scatta ogni secondo sulla home e sulla scheda prodotto, anche a scheda in secondo piano

**Schermate e uso (8):** Il visore a tutto schermo delle foto non si chiude con Esc, non blocca lo scorrimento e non gestisce il fuoco · La barra di ricerca annuncia un elenco di suggerimenti che da tastiera non esiste · Il form dell'indirizzo resta sempre aperto anche per chi ha già indirizzi salvati · Lo sconto da prezzo barrato non compare mai nella griglia, ma l'ordinamento «Sconto maggiore» lo usa · Il banner dei cookie copre la barra «Aggiungi al carrello» sulla scheda prodotto (telefono) · Il fondo pagina riserva 72px di vuoto anche dove la barra a schede non c'è · La trappola del fuoco del Modal è disattivata insieme alla chiusura con Esc (difetto latente) · La ricerca si ferma a 96 prodotti e applica metà dei filtri dopo il taglio

**Accessibilita (12):** Scheda prodotto: la quantità cambia in silenzio e la sua etichetta non è collegata a niente · Barra di navigazione mobile senza aria-current: la scheda attiva è segnalata solo dal colore · Menu account: role=menu senza il pattern tastiera che quel ruolo obbliga, e senza Esc · Ricerca e filtri: il numero di risultati cambia senza che nessuno lo annunci · Modal condiviso: il focus trap si spegne se si disattiva la chiusura con Esc · Banner cookie: appare in fondo al DOM, non riceve il fuoco e copre gli elementi focalizzati · «Conferma ordine» non annuncia l'importo: aria-label sovrascrive il testo visibile col totale · Due landmark <main> annidati su ricerca e categoria · Contrasto sotto soglia: ink-400 su sfondo cream misura 4,49:1 e le stelle di valutazione 2,16:1 · Selettore fascia di consegna: la giornata scelta non è esposta (manca aria-pressed) · Overlay artigianali senza semantica di dialogo: AddToListButton, SupportChatModal, MobileAccountSheet, ConfirmDialog · Area venditore: indicatore di fuoco azzerato e campo senza etichetta nel form attributi prodotto

**Flussi critici (5):** Se il webhook Stripe fallisce a metà, al secondo tentativo cliente e negozio ricevono di nuovo email e campanella dello stesso ordine · Sull'ordine in contanti a più negozi lo sconto si spezza con un arrotondamento diverso da quello della carta · La percentuale dello sconto ritiro è scritta due volte: una nella pagina e una nelle costanti condivise · Nessun avviso per gli ordini fermi su «Pronto» e per i pagamenti fermi in attesa di rimessa o di attivazione del negozio · Il flusso che incassa non ha nessun test che lo percorra fino in fondo: la prova end-to-end del checkout è un carrello vuoto

**Interfacce e backend (12):** Nessun timeout sulle chiamate al servizio AI: una richiesta puo' restare appesa fino a mezz'ora · Onboarding Stripe Connect: a ogni errore di rete resta un conto Connect orfano · La coda delle email ritenta all'infinito: nessun contatore di tentativi, nessuna lettera morta · Recupero carrelli: l'email parte prima di marcare il carrello e l'esito della marcatura non viene mai controllato · Tre schermate che portano soldi mostrano «Qualcosa non ha funzionato» al posto del motivo vero · Trova-o-crea conversazione: il doppio clic produce un errore 500 invece di riaprire la chat esistente · Richiesta di reso: l'articolo indicato non viene verificato e il controllo anti-doppione non e' atomico · La chiave di idempotenza dell'acquisto gift card contiene l'orologio, quindi non protegge da niente · La chat autenticata limita per indirizzo di rete invece che per utente: chi sta su rete mobile viene bloccato per colpa di altri · La riconciliazione dei contanti del fattorino usa il giorno UTC e perde l'ultimo secondo · Il formato delle risposte d'errore cambia dentro lo stesso file · Lavoro AI massivo pagato e poi perso se non riesce a scrivere la riga di tracciamento

**Funzioni con AI (12):** Il blocco dei prodotti vietati c'è sull'endpoint che non scrive e manca su quelli che scrivono · Il filtro Trust & Safety è codice mai usato, e la sua funzione principale lascia passare in caso di dubbio · Cinque endpoint fanno leggere al modello pagine web e nello stesso turno gli fanno proporre un prezzo, senza nessun controllo di sanità sul valore · Il testo di terzi entra nel prompt senza recinto né escape in due endpoint (oggi scollegati) · Due endpoint serializzano nel prompt un oggetto senza limite di dimensione, e l'oggetto arriva dal client · Due endpoint AI a pagamento sono aperti a tutti i venditori senza nessuna schermata che li usi · Due endpoint vision usano il limitatore vecchio, quello che vive solo dentro una macchina · Nessuno controlla se la risposta del modello è stata tagliata a metà, e un prezzo mancante diventa silenziosamente 1 euro · Gli URL delle foto mandate al modello possono puntare a qualunque sito, e finiscono anche nella vetrina · Nel copilot la conversazione passata viene messa DOPO l'istruzione, e un turno «assistente» inviato dal client viene accettato così com'è · Il controllo sul formato delle immagini guarda solo i primi 4096 caratteri · Una pagina pubblica può innescare chiamate AI a pagamento senza che il visitatore sia autenticato

**Dati e misure (8):** Le giornate del venditore sono calcolate in UTC: fra mezzanotte e le due i numeri slittano di un giorno · Chi accetta i cookie mentre e' gia' entrato resta anonimo fino al ricaricamento della pagina · Il "doppio cancello" sul consenso descritto nel codice non esiste: gtag viene definito anche senza consenso · Tre eventi sono nel catalogo ma nessuno li emette, e le funzioni che dovrebbero emetterli esistono · L'avvio del checkout si conta a ogni ingresso nella pagina, mentre l'acquisto ha l'anti-doppione · La rimozione dal carrello viaggia senza quantita' ne' valore, e il cambio di quantita' non si vede affatto · Il file di esempio manda PostHog su un indirizzo europeo che non e' nemmeno quello giusto per ricevere gli eventi · Le visite ai prodotti si registrano senza chiedere il consenso, mentre gli altri due sistemi lo chiedono

**Pubblicazione e affidabilita (7):** L'indirizzo di controllo dice a chiunque quali chiavi mancano · I test automatici puntano ai segreti col nome della produzione · Se Stripe rallenta, la richiesta resta appesa fino a 80 secondi · Due lavori automatici su nove non hanno nessuno che si accorga se si fermano · Un file con le chiavi di produzione può finire nel repository senza che nulla lo fermi · I lavori automatici della pipeline girano con più poteri di quanti ne servano · Il collegamento amministrativo al database viene ricreato a ogni richiesta
