---
data: 2026-10-11 23:10
tipo: radiografia-totale-sito
codice: NicolaeRotaru/mycity @ 70a9299 (main, uguale alla produzione dpl_gWWyPEoS2hkNGY85cKpx5i3hKA4P)
fonte_raw: consegne/audit/2026-10-11-radiografia-marketplace-raw.json · consegne/design/2026-10-11-radiografia-design-raw.json
richiesta: «Fai un analisi completa e profonda del marketplace, l'obbiettivo è che adesso il marketplace sia pronto, che non ci siano errori di nessun tipo»
---

# Il marketplace non è pronto: due chiavi aperte, l'iscrizione dei negozi rotta, e un sito che promette cose che non fa

**In due righe.** Oggi il sito ha due porte del database aperte a chiunque, e un negozio nuovo non riesce a iscriversi. In più promette prezzi, sconti e tempi che non mantiene: prima del lancio vanno chiusi 9 bloccanti e 80 gravi.

## In parole semplici

Ho radiografato il marketplace intero: il codice, il design, il database vero e il sito di produzione, senza toccare niente. Hanno lavorato 195 revisori, divisi in 23 corsie: una per ogni mestiere, dai soldi al design. Poi sei critici hanno cercato quello che era rimasto fuori. Ogni difetto è passato da due verifiche indipendenti che dovevano smontarlo. Il risultato: **470 difetti aperti**. Di questi, **307 su 470 sono nuovi**. Gli altri **163 su 470 erano già noti** e oggi li ho ritrovati ancora nel codice. Altri **38 difetti noti** li ho chiusi, perché oggi non ci sono più.

Il codice in sé regge le prove di base. Il controllo dei tipi dà 0 errori, la build riesce, e le 4.258 prove automatiche passano tutte. Il problema è un altro: quelle prove guardano poco i soldi. Un revisore ha tolto quattro controlli sui soldi e 4.257 prove su 4.258 sono rimaste verdi.

| | Quanti |
|---|---:|
| Difetti nuovi, verificati e senza doppioni | 307 |
| … di cui bloccanti | 9 |
| … di cui gravi | 80 |
| … di cui minori | 218 |
| … difetti che erano stati chiusi e sono tornati | 25 |
| … difetti collegati a uno già noto, di cui mostrano una conseguenza nuova | 18 |
| Difetti già noti ancora presenti oggi (del tutto o in parte) | 163 |
| … di cui gravi o bloccanti | 20 |
| Difetti già noti chiusi oggi, perché verificati risolti | 38 |
| Falsi allarmi scartati dalle verifiche | 15 |
| Gravità corrette dalle verifiche (quasi sempre abbassate) | 67 su 335 |

## Cosa cambia per te

**Primo: due porte del database sono aperte a chiunque.** Una è nuova. La chiave del database che scavalca tutte le regole è finita nella casella pubblica di Vercel: ogni visitatore la scarica insieme al sito. L'altra è la password dell'amministratore, già nella card #202, accodata oggi alle 10:40. Stasera ho verificato che è ancora quella vecchia. I dettagli di entrambe te li ho dati in chat e nel referto privato, perché questo deposito è pubblico. Nella stessa situazione ci sono altre 21 falle, tutte meno gravi: qui compaiono solo col numero.

Facciamo un caso vero. Un curioso apre la pagina di accesso del sito, e il suo browser scarica i file del sito. Dentro uno di quei file c'è la chiave del database. Con quella può leggere i 9 profili con email e indirizzo, cambiare un prezzo, farsi amministratore. Non serve essere un esperto: esistono programmi che cercano proprio queste chiavi nei siti.

**Secondo: oggi un negozio nuovo non riesce a entrare.** Chi si iscrive da «Diventa venditore» trova scritto «richiesta in valutazione», ma non ha mai potuto compilare la richiesta. Chi era già cliente e chiede di diventare negozio compila tutto il modulo, e alla fine il database lo respinge. Il fattorino nuovo, invece, non arriva mai alla pagina dei documenti. Sono tre porte d'ingresso rotte proprio sul lato che deve crescere.

**Terzo: la riparazione del database che hai in coda rompe il negozio, se la applichi così.** La migrazione 161 chiude, giustamente, la lettura dei profili. Però la scheda prodotto, le vetrine, la ricerca e le pagine dell'ordine prendono i dati del negozio proprio da lì. Applicata oggi, il cliente vedrebbe «Prodotto non disponibile» su ogni prodotto di Pane Quotidiano. Il fattorino non vedrebbe più dove ritirare. Va riparato il codice prima, poi si applica la migrazione. Quella migrazione inoltre non chiude due falle del database tornate il 9 settembre: serve una migrazione in più.

**Quarto: il sito promette cose che non fa.** È il gruppo più numeroso fra i gravi, 23 schede:
- La pagina Spedizioni scrive prezzi più bassi della cassa. Scrive anche «gratis» dove si pagano 3 euro.
- Ai negozi diciamo «nessun costo mensile» in sei punti. Poi chiediamo 50 euro al mese.
- Promettiamo 5 euro di benvenuto. La cassa non li toglie mai.
- Scriviamo «consegna in 30-60 minuti» su ogni pagina. In produzione non c'è un solo fattorino approvato.
- Scriviamo «ti rimborsiamo senza domande» anche sul pane fresco. Per legge il fresco si può escludere.
- In Contatti c'è un numero di telefono finto. Lo stesso numero è l'emergenza dei fattorini.
- La classifica degli inviti promette premi fino a 100 euro. Nessuno li paga.

Ognuna di queste è una frase che un cliente può fotografare e mostrarti.

**Quinto: legge e conti.** Il sito non dice chi c'è dietro: manca ragione sociale, sede, partita IVA, PEC. Il codice sconto di MyCity oggi lo paga il negozio: su 20 euro di pane con 5 euro di sconto, il fornaio incassa 13,50 invece di 18. Chi paga in contanti e rende un prodotto riceve credito MyCity invece dei soldi, senza che nessuno gli chieda se lo vuole. E il database di produzione non ha nessuna copia di sicurezza: la copia notturna è fallita 60 volte su 60.

## Cosa devi fare

Non valgono tutti uguale. Questo è l'ordine che ti propongo: prima quello che espone dati oggi, poi quello che ferma il lancio, poi il resto.

**Oggi, solo tu (🔴).** Cambia le chiavi del database: è la card #203. Cambia la password dell'amministratore: è la card #202. Non serve codice: bastano il pannello di Supabase e quello di Vercel.

**Poi le decisioni che spettano a te (card #204).** Sono cinque. Per ognuna c'è la mia raccomandazione, e la quinta è lo sconto pagato dal fornaio di cui sopra:
- la partita IVA e i dati del titolare da scrivere sul sito;
- il piano Pro di Supabase: senza, le foto dei prodotti rischiano di uscire rotte, e i database si addormentano;
- i 50 euro al mese ai negozi: sì o no;
- i 5 euro di benvenuto: sì o no;
- chi paga lo sconto.

**Il codice lo riparo io (🟡).** Tutto in una richiesta di unione: è la card #205. Prima le tre cose che servono prima delle migrazioni: le letture del negozio, la guardia del rilascio su GitHub, e la migrazione che completa la 161. Poi le porte d'ingresso di negozi e fattorini. Poi le promesse false e i soldi. L'unione e l'applicazione in produzione restano a te.

## Cosa non ho verificato

- **Il sito vero non l'ho aperto in un browser.** La rete di questa sessione blocca il dominio. Le pagine di produzione le ho lette come testo, attraverso Vercel. Il design l'ho fotografato sul sito acceso in locale, con un database finto e vuoto.
- **Non ho potuto far girare un ordine vero dall'inizio alla fine.** Il database locale completo non è partito: il registro delle immagini ha rifiutato lo scaricamento. I flussi di ordine li ho seguiti nel codice, riga per riga.
- **Stripe non lo vedo.** Non ci sono chiavi, e il collegamento va autorizzato da te. Tutto quello che riguarda bonifici e conti dei negozi è letto dal codice, non dal conto vero.
- **Il piano Supabase l'ho dedotto.** Due indizi: la memoria del 10/10 e la pausa dei due progetti. Non l'ho visto oggi nel pannello.
- **I registri di accesso al database coprono solo le ultime 24 ore.** Di cosa è successo con la chiave esposta nei 38 giorni prima non so niente.
- **I revisori hanno dichiarato 411 zone che non hanno potuto guardare.** Le trovi in fondo, raggruppate. Non sono un verde.

---

## Dettagli tecnici

- Prove dure eseguite oggi su `NicolaeRotaru/mycity@70a9299`: `tsc --noEmit` 0 errori · `npm run lint` 0 errori e 78 avvisi (tutti di accessibilità) · `vitest run` 540 file, 4.258 prove verdi · `next build` riuscita, 216 rotte. Senza `--legacy-peer-deps`, `npm ci` fallisce: il file delle versioni non è allineato.
- Metodo: 4 workflow da 5-6 corsie, ognuna in due giri (ampiezza, poi angolo avversario). Ogni difetto è passato dalla verifica tecnica e, se grave o bloccante, dalla seconda opinione di `internal-audit`. Poi 6 critici di completezza, fra cui «il giorno del lancio», con le stesse due verifiche. Poi l'unione dei doppioni: 335 schede diventate 283, più 24 dei critici. In parallelo, 12 revisori hanno ricontrollato i 201 difetti aperti del registro. In tutto 195 agenti.
- Doppio conteggio possibile: 18 dei 307 nuovi citano un difetto noto ancora aperto (per esempio R11, R12 e R55 sono conseguenze concrete di K42, la produzione indietro di 26 migrazioni). Non li ho fusi, perché hanno un rimedio proprio. Il totale di 470 può quindi contare due volte al massimo 18 difetti.
- Registro: `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json` rifatto con `cervello/radiografia-marketplace-digest.mjs`. Dopo la fusione: 470 aperti (11 bloccanti, 109 gravi, 350 minori). Il 12/10 ho riaperto 7 difetti segnati «riparati»: il ricontrollo li aveva trovati ancora presenti.
- 23 falle di sicurezza ancora aperte compaiono qui e nel grezzo solo con un titolo generico e il loro numero (R1, R2, R7, R9…). Il referto completo è consegnato a Nicola in chat, fuori da GitHub.
- La macchina: ho riparato un difetto del digest che questa radiografia ha fatto emergere. Le aree con solo schede vecchie perdevano il nome nel Pannello. La correzione è in `cervello/referti-sito.mjs`, `dimensioniDegliOrfani`, con la prova ⑥-bis in `cervello/test/il-referto-che-nessuno-legge.test.mjs`: senza la correzione la prova diventa rossa.


> Gli elenchi lunghi — i 218 minori, i 163 noti ancora aperti, i 38 chiusi oggi, le zone non viste e i falsi allarmi — stanno in `consegne/audit/2026-10-11-radiografia-elenchi.md`. La prova eseguita di ogni grave sta nel grezzo `consegne/audit/2026-10-11-radiografia-marketplace-raw.json`.

## L'ordine delle riparazioni, per tema

Gli 89 bloccanti e gravi raggruppati per tema. Il numero R serve a ritrovarli negli elenchi qui sotto.

- **accessi al database** (6): R1 🔴 · R2 🔴 · R3 🔴 · R10 · R11 · R12
- **produzione** (7): R7 🔴 · R8 🔴 · R53 · R54 · R55 · R56 · R57
- **iscrizione negozi e fattorini** (3): R4 🔴 · R5 🔴 · R44
- **obblighi di legge** (3): R6 🔴 · R46 · R47
- **sicurezza** (2): R9 🔴 · R75
- **promesse false** (11): R58 · R59 · R60 · R61 · R62 · R63 · R64 · R65 · R66 · R67 · R68
- **soldi** (10): R76 · R77 · R78 · R79 · R80 · R81 · R82 · R83 · R84 · R85
- **fattorini** (7): R28 · R29 · R30 · R31 · R32 · R33 · R34
- **intelligenza artificiale** (7): R36 · R37 · R38 · R39 · R40 · R41 · R42
- **accesso e iscrizione** (3): R13 · R14 · R15
- **area negozio** (3): R18 · R19 · R20
- **email** (3): R23 · R24 · R25
- **pannello admin** (3): R50 · R51 · R52
- **dati personali** (2): R21 · R22
- **errori** (2): R26 · R27
- **ordini** (2): R48 · R49
- **prove automatiche** (2): R69 · R70
- **resi e rimborsi** (2): R71 · R72
- **testi legali** (2): R86 · R87
- **vetrina** (2): R88 · R89
- **allarmi** (1): R16
- **app sul telefono** (1): R17
- **grafica** (1): R35
- **interfaccia** (1): R43
- **messaggi** (1): R45
- **schede prodotto** (1): R73
- **sconti e credito** (1): R74

## I 9 bloccanti


### R1 · Falla di sicurezza R1 da chiudere (regole d'accesso al database): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** bloccante · **Area:** Permessi sul database · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** S

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R2 · Falla di sicurezza R2 da chiudere (regole d'accesso al database): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** bloccante · **Area:** Permessi sul database · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** S

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R3 · Quando si chiude la lettura dei profili (riparazione in attesa di firma), le schede prodotto non si aprono più, le vetrine si svuotano e Google le scarta

**Gravità:** bloccante · **Area:** Permessi sul database · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Il collega del primo giro ha visto solo il lato Google: con la tabella dei profili chiusa, la scheda prodotto prende «noindex». Il danno vero è più grande e tocca chi compra. La scheda prodotto chiede il negozio dentro la stessa lettura del prodotto, agganciandolo alla tabella `profiles` (lib/queries/catalogo.ts:69). Poi, alla riga 372 di app/product/[id]/page.tsx, se `product.profiles?.is_approved` è vuoto mostra «Prodotto non disponibile — il negozio non è operativo» e si ferma. La migrazione 161, scritta e in attesa della firma di Nicola, cancella l'ultima regola che lasciava leggere i negozi approvati da `profiles` (riga 353). La 110 e la 112 l'avevano già tolta: il ripasso del 9 settembre l'aveva ricreata. Dopo la 161 `profiles` si legge solo per la propria riga o da amministratore: lo scrive la 152 alle righe 22-27, e la prova SQL 19 controlla che resti chiusa. Per il cliente, anonimo o con account, l'aggancio torna vuoto. Lo stesso test «is_approved» svuota anche la ricerca suggerita (SearchBar, con `!inner`), le fasce «di tendenza», «simili», «sponsorizzati», i suggerimenti nel carrello e i visti di recente. Anche l'anteprima WhatsApp del negozio legge `profiles` (store/[id]/opengraph-image.tsx:12-17): mostrerebbe la scritta generica «Negozio su MyCity» invece del nome e del logo.
- **Un esempio.** 1) Nicola firma la scheda della migrazione 161 (#191/#202), che serve a richiudere le 27 regole riaperte il 9 settembre: è un passo del lancio. 2) Una cliente apre dal gruppo WhatsApp il link a un prodotto di Pane Quotidiano. 3) La lettura del prodotto torna con `profiles: null`, perché la riga del negozio in `profiles` non è più leggibile da lei. 4) La pagina mostra «Prodotto non disponibile. Questo prodotto non è al momento acquistabile perché il negozio non è operativo». Non c'è nessun bottone per comprare. 5) In home le fasce prodotto sono vuote e la ricerca suggerita non propone niente. 6) Il negoziante e l'amministratore aprono la stessa pagina e la vedono perfetta: la regola «propria riga» e quella da amministratore li lasciano leggere. Dentro casa nessuno se ne accorge, finché non chiama un cliente. Cosa dovrebbe succedere: i dati pubblici del negozio arrivano dalla vista `seller_public_profiles`, che è fatta apposta per questo e funziona anche con `profiles` chiusa.
- **Quanto costa.** Appena si applica la 161, nessun prodotto si può più comprare dal sito. Vale per ogni cliente, anonimo o con account, e per ognuno dei 9 prodotti in produzione. In più Google toglie le schede (noindex: la parte già vista dal primo giro) e le anteprime dei negozi su WhatsApp perdono nome e logo. Il guasto non si vede da chi controlla, cioè il negoziante e l'amministratore.
- **Dove.** `app/product/[id]/page.tsx:372-383 · lib/queries/catalogo.ts:61,65-70 (COLONNE_SCHEDA_PRODOTTO con profiles!products_seller_id_fkey) · lib/queries/precarico.ts:63 · components/SearchBar.tsx:84-86 · components/home/TrendingNow.tsx:45,55,71,81 · components/SimilarProducts.tsx:51-58,68-77 · components/SponsoredCarousel.tsx:53,64-65 · components/cart/CartUpsell.tsx:57,77 · components/RecentlyViewed.tsx:50 · app/store/[id]/opengraph-image.tsx:12-17 · migrations/161_quello_che_il_ripasso_del_9_settembre_aveva_riportato_indietro.sql:353-354 · migrations/110_public_profile_view.sql:47 · migrations/112_`
- **La prova** (lettura-codice). Lettura del codice, catena completa: lib/queries/catalogo.ts:65-70 → la scheda chiede `profiles!products_seller_id_fkey ( id, store_name, is_approved, offers_express, store_hours )`. lib/queries/precarico.ts:63 → il precarico del server usa la stessa domanda. app/product/[id]/page.tsx:372 → `if (!product.profiles?.is_approved) return … «Prodotto non disponibile»`. migrations/161…sql:353 → `DROP POLICY IF EXISTS "Anyone can view approved seller profiles" ON public.profiles;` (e :354 "Public profile read"). In tutto `migrations/` l'unica CREATE POLICY di lettura su profiles per gli estranei è quella della 006/018, tolta dalla 110:47 e dalla 112:10 (grep "CREATE POLICY" -A2 | grep "ON public.profiles"). migrations/152:22 → «`profiles` si legge solo se è il proprio profilo o se si è amministratori». tests/sql/rls/19:177-181 → la prova pretende 0 righe di profiles lette da anon. Stesso filtro
- **Cosa si è visto.** Ho letto ogni riga citata: la catena c'è tutta nel codice di oggi (main @ 70a9299). Ho cercato una regola di lettura alternativa su profiles nelle migrazioni dopo la 112 e non ne esiste nessuna. Non ho potuto eseguire la lettura come anon su un Postgres con le 161 migrazioni. Docker qui non c'è e la cartella pgdata dell'altra corsia non è accessibile (Permission denied). Quindi non ho visto la riga null coi miei occhi. Non ho nemmeno visto quali regole su profiles sono attive oggi in produzione: per questo il difetto lo descrivo come innescato dalla 161, non come già attivo.
- **Verifica tecnica.** Ho provato a smontarlo e regge. Lo schema che nasce dalle migrazioni del repo, 161 compresa, lascia su `profiles` due sole regole di lettura: «la propria riga» e «amministratore». La scheda prodotto (lib/queries/catalogo.ts:69, app/product/[id]/layout.tsx:26) e i componenti elencati agganciano il negozio con `profiles!products_seller_id_fkey`. Per un visitatore o un cliente quell'aggancio torna vuoto, e app/product/[id]/page.tsx:372 mostra «Prodotto non disponibile». Ho cercato una protezione che lo copra e non c'è. Esiste una strada giusta, `fetchSellerPublicMap` + `attachSellerProfiles` su `seller_public_profiles` (lib/queries/seller-public-profiles.ts:65). La usa solo la griglia (lib/quer
- **Seconda opinione.** Lo scenario regge, e da avvocato del diavolo non sono riuscito a smontarlo. È anche più vicino di quanto dica il collega. La card 'Aggiornamento AD 2026-10-11 10:40' in AZIONI-IN-ATTESA.md (righe 188-198) chiede a Nicola di 'unire la #256, poi lanciare i passi 2 e 3 nello stesso giro'. La #256 è già unita: main è @ 70a9299, che è proprio il merge della #256. Quindi l'unico freno rimasto è Nicola che lancia applica-migrazioni-mancanti.sh, e la card non dice nulla sul catalogo. Le '33 prove di sicurezza verdi' citate lì controllano che le porte siano chiuse, non che la vetrina funzioni ancora. L
- **Rimedio.** Prima di applicare la 161, staccare dal catalogo tutte le letture del negozio da `profiles`. ① In COLONNE_SCHEDA_PRODOTTO e nei componenti elencati, togliere l'aggancio a `profiles` e leggere il negozio con una seconda domanda su `seller_public_profiles` per `seller_id` (in blocco per le liste), poi unire i risultati. Per la ricerca suggerita: filtrare i `seller_id` contro la lista dei negozi approvati della vista, invece di usare `!inner` su profiles. ② In app/store/[id]/opengraph-image.tsx leggere da `seller_public_profiles` e togliere `city`, che nella vista non c'è: resta il ripiego «Piacenza». ③ Aggiungere una prova SQL che, come anon e come cliente autenticato, esegua ESATTAMENTE la select di COLONNE_SCHEDA_PRODOTTO e pretenda il negozio non vuoto. Va affiancata alla prova 19 che pretende profiles chiusa: oggi le due esigenze non si guardano. ④ Nella scheda della 161 per Nicola scrivere che la migrazione va applicata solo dopo che questo codice è online.
- *Visto anche da altre corsie (seo): schede unite.*

### R4 · Chi si iscrive come negozio trova scritto «richiesta in valutazione» senza aver mai potuto compilare la richiesta

**Gravità:** bloccante · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La funzione che crea il profilo all'iscrizione (versione 114, che la migrazione 161 riporta in produzione) fa nascere OGNI profilo con approval_status='pending'. Chi si iscrive da «Diventa venditore» (/sign-up?role=seller) nasce quindi negozio «in attesa». La pagina /sell, però, decide che la richiesta è già stata inviata guardando solo approval_status==='pending' e role==='seller'. Non controlla approval_requested_at, che resta vuoto finché il modulo non parte. Risultato: il modulo non compare mai. Il pulsante «Modifica richiesta» dell'area venditore rimanda a /sell, cioè alla stessa schermata: un giro chiuso.
- **Un esempio.** 1) La titolare di una merceria preme «Diventa venditore» nel riquadro di accesso e si registra scegliendo «Venditore». 2) Conferma l'email: il profilo nasce role='seller', approval_status='pending', approval_requested_at vuoto. 3) Apre /sell e legge «Richiesta in valutazione — Abbiamo ricevuto la tua candidatura… Ti contatteremo entro 48 ore lavorative», senza alcun modulo. 4) Apre /seller: «Negozio in attesa di approvazione — Stiamo verificando i dati della tua attività» e preme «Modifica richiesta». 5) Torna alla schermata del punto 3. Nome del negozio, indirizzo, dati del titolare, IBAN e consensi non vengono mai raccolti. All'amministratore arriva in coda un profilo «in attesa» completamente vuoto. Dovrebbe succedere: finché approval_requested_at è vuoto, /sell mostra il modulo.
- **Quanto costa.** Anche la seconda porta d'ingresso per i negozi è chiusa. Insieme al difetto precedente, nessun negozio nuovo riesce a completare l'iscrizione da solo. In più il sito gli dice una cosa falsa («abbiamo ricevuto la tua candidatura») e lo lascia ad aspettare una risposta che non arriverà, perché non c'è niente da valutare.
- **Dove.** `app/sell/page.tsx:139-146 · app/seller/layout.tsx:130-149 · migrations/114_hardening_radiografia.sql:198-222 · migrations/161_quello_che_il_ripasso_del_9_settembre_aveva_riportato_indietro.sql:97-120 · components/ui/AuthShell.tsx:205`
- **La prova** (lettura-codice). migrations/114_hardening_radiografia.sql:208-218 e 161:107-117: INSERT INTO profiles (… approval_status …) VALUES (…, false, 'pending', …) per qualunque ruolo. app/sell/page.tsx:140: `if (profile?.approval_status === 'pending' && profile?.role === 'seller') return <PendingNotice/>`, senza controllare approval_requested_at, che viene scritto solo a riga 110 dall'invio del modulo. app/seller/layout.tsx:130-147: «Negozio in attesa di approvazione» con <Button href="/sell">Modifica richiesta</Button>. components/ui/AuthShell.tsx:205: href="/sign-up?role=seller".
- **Cosa si è visto.** Ho letto le righe: la condizione di /sell non distingue fra «nato in attesa» e «richiesta inviata». Il ramo che mostra il modulo è irraggiungibile per un profilo nato venditore. Non ho potuto leggere quale versione della funzione di iscrizione gira oggi in produzione, perché lo strumento del database non era disponibile in questa sessione. Secondo la 161, quella di oggi è rotta in un altro modo (già noto); dopo la 161 diventa questa.
- **Verifica tecnica.** Vero nel codice di oggi. handle_new_user nella versione finale (161, uguale alla 114) fa nascere ogni profilo con approval_status='pending' e approval_requested_at vuoto. /sell:140 mostra PendingNotice a qualunque profilo con role seller e stato pending, senza guardare approval_requested_at, quindi chi si iscrive da «Diventa venditore» non vede mai il modulo. Come per il #1, in produzione oggi non si vede: lì l'iscrizione da negozio fallisce già prima, per il difetto noto che la 161 ripara. La 161 sostituisce quel blocco con questo. Con il #1 forma la coppia per cui, dopo il fix in coda, non si apre un negozio né da cliente né da iscritto negozio. Correzione dello scenario: il passo 4 non è 
- **Seconda opinione.** È reale e non coincide con la 161: la 161 ripara l'iscrizione che oggi fallisce del tutto, e proprio riparandola apre questo giro chiuso. Con la handle_new_user della 161 (e della 114) ogni profilo nasce con is_approved=false e approval_status='pending', venditori compresi. /sell mostra «Richiesta in valutazione» guardando solo role='seller' e approval_status='pending'. Il layout venditore dice «Modifica richiesta» e rimanda a /sell, che mostra di nuovo lo stesso avviso. Nessun altro punto del codice scrive approval_requested_at. Chi usa il pulsante più visibile, «Diventa venditore» nel riquad
- **Rimedio.** Nel codice: in app/sell/page.tsx mostrare PendingNotice solo se approval_requested_at è valorizzato, altrimenti mostrare il modulo. Lo stesso criterio va in app/seller/layout.tsx: senza approval_requested_at, testo «Completa la tua richiesta» con il pulsante verso /sell. Serve una prova unitaria con il profilo {role:'seller', approval_status:'pending', approval_requested_at:null} che si aspetti il modulo.

### R5 · Un cliente che chiede di diventare negozio viene respinto dal database dopo aver compilato tutto il modulo

**Gravità:** bloccante · **Area:** Permessi sul database · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** S

- **Cosa succede.** La pagina «Vendi su MyCity» invia la richiesta con un aggiornamento fatto dal browser sul proprio profilo che contiene role:'seller'. La guardia del database sui profili (migrazione 119, l'ultima versione nel repository) lascia cambiare solo le colonne di un elenco, e 'role' non c'è: se il ruolo cambia, rifiuta con 'campo riservato non modificabile' (codice 42501). Quindi chiunque abbia un account da cliente — sia chi era già cliente, sia chi arriva su /sell, preme «Accedi o registrati» e si registra dal link del modulo di accesso (che passa solo returnTo, non il ruolo, e quindi crea un cliente) — non può diventare negozio. Non esiste un'altra strada lato server: è l'unico punto del codice che scrive role:'seller'.
- **Un esempio.** 1) Il titolare del forno apre /sell dal telefono, non ha account, preme «Accedi o registrati». 2) Dalla pagina di accesso va su «Registrati»: il link è /sign-up?returnTo=/sell, senza ruolo, quindi il ruolo preselezionato è «cliente» e lui non lo cambia. 3) Conferma l'email, torna su /sell e compila tutto: codice fiscale, residenza, logo, indirizzo sulla mappa, IBAN, quattro consensi. 4) Preme «Invia richiesta»: il database rifiuta il cambio di ruolo e compare il messaggio «Non hai i permessi per questa azione.». 5) Riprova e ottiene lo stesso errore. Dovrebbe succedere: la richiesta parte e il profilo passa a «negozio in attesa di approvazione».
- **Quanto costa.** Il primo passo per aprire un negozio si ferma per chi entra dalla porta più naturale: la pagina pubblica «Vendi su MyCity», linkata da footer, FAQ, Chi siamo e Come funziona. Il negoziante ha speso 10 minuti a compilare e riceve un errore che non gli dice cosa fare: è il primo contatto con MyCity.
- **Dove.** `app/sell/page.tsx:82-116 (riga 107 role:'seller') · migrations/119_radiografia_18_agosto.sql:66-101 (lista 'consentiti' senza 'role', RAISE a riga ~101) · app/sign-in/page.tsx:201 · app/sign-up/page.tsx:76 · lib/errors.ts:18`
- **La prova** (lettura-codice). Lettura del codice: app/sell/page.tsx:107 scrive role:'seller' nello stesso update dei dati. migrations/119_radiografia_18_agosto.sql:80-95 elenca le colonne modificabili (c'è approval_status, non c'è role) e a riga ~100 fa RAISE EXCEPTION 'profiles: campo riservato non modificabile' se cambia qualcosa fuori elenco. app/sign-in/page.tsx:201 manda a /sign-up?returnTo=… senza role; app/sign-up/page.tsx:76 parte da 'buyer' se manca ?role. lib/errors.ts:18 traduce 42501 in «Non hai i permessi per questa azione.». grep di role:'seller' su app/lib/components: unica scrittura in app/sell/page.tsx:107.
- **Cosa si è visto.** Ho letto le righe: role non è nell'elenco 'consentiti' della 119. La 161 dice che la procedura «riapplica la 119» e quindi riporta in produzione proprio questa guardia. Ho tentato di ricrearla su un Postgres locale usa e getta, ma non sono riuscito ad avviarlo per i permessi delle cartelle. Prova quindi solo da lettura del codice.
- **Verifica tecnica.** Il difetto è vero nel codice di oggi (main 70a9299). La guardia dei profili, nella versione finale del repository (migrazione 119, che parte dalla 107 «qualsiasi cambio di ruolo è riservato allo staff»), non mette 'role' fra le colonne modificabili. Quindi un cliente che invia /sell con role:'seller' viene respinto con 42501, e la pagina mostra «Non hai i permessi per questa azione.». Non c'è un'altra porta: la sola scrittura di role:'seller' è in app/sell/page.tsx:107, non esiste nessuna rotta server e la regola RLS di update non cambia niente. Una precisazione che il collega non aveva potuto vedere: IN PRODUZIONE OGGI il difetto non si manifesta. La guardia live è la versione vecchia torna
- **Seconda opinione.** Lo scenario sta in piedi ed è dimostrato. La guardia del database sui profili, nella versione finale del repository (migrazione 119), non lascia cambiare il ruolo. Il modulo /sell invece scrive role:'seller' nello stesso aggiornamento, quindi chi ha un account da cliente non può più diventare negozio. Il blocco esiste dalla migrazione 107 («qualsiasi cambio di ruolo è riservato allo staff»). Precisazione sui tempi: secondo l'intestazione della 161, il ripasso del 9 settembre ha riportato in produzione una guardia vecchia (la 061), che blocca solo il passaggio ad amministratore. Oggi quindi que
- **Rimedio.** Consentire nel database un solo passaggio di ruolo: da 'buyer' a 'seller', e solo se nello stesso aggiornamento approval_status diventa 'pending' e is_approved resta false. Va aggiunta una condizione esplicita in enforce_profile_update_rules, con una prova SQL in tests/sql/rls che faccia l'update da utente autenticato. In alternativa serve una rotta server /api/seller/apply che scriva con la chiave di servizio, che però oggi in produzione manca. Da aggiungere anche una prova end-to-end dell'invio del modulo.

### R6 · Il sito non dice chi c'è dietro: niente nome, sede, partita IVA né PEC, il titolare risulta solo «MyCity»

**Gravità:** bloccante · **Area:** Privacy e legale · **Si ripara:** decisione tua (🔴) · **Sforzo:** M · **Tornato dopo essere stato chiuso**

- **Cosa succede.** In produzione mancano tutte le 14 variabili NEXT_PUBLIC_TITOLARE_*. Per scelta, il codice non stampa niente al loro posto. Risultato sul sito: i Termini dicono «gestita da MyCity». L'Informativa dice «Il titolare del trattamento è MyCity.», con il contatto «il modulo dei contatti». Il piè di pagina mostra solo «info@mycity-marketplace.com · Piacenza, IT». Il modulo di recesso tipo dice «Destinatario: MyCity», senza indirizzo. «MyCity» è un'insegna, non un soggetto giuridico. Il cliente paga 3 € di quota consegna a MyCity e non sa con chi stipula quel contratto. Il negozio paga il 10% senza sapere a chi. Un commento nel codice riporta la scelta di Nicola del 20/8: aprire la partita IVA «quando raggiungeremo i 5000€». Quella soglia vale per il lavoro autonomo occasionale ai fini INPS, non per un'attività commerciale abituale. Un marketplace che incassa commissioni e quote di consegna deve aprire la partita IVA dall'inizio dell'attività (art. 35 DPR 633/72) e mostrarla sul sito. Norme toccate: art. 13.1.a GDPR (identità e contatti del titolare); art. 7 D.Lgs. 70/2003 (nome, sede, contatti, REA e P.IVA del prestatore, testo da riconfermare); art. 49 c.1 lett. b-c del Codice del Consumo (identità e indirizzo geografico del professionista); allegato I-B del Codice del Consumo (destinatario del modulo di recesso con indirizzo). La regressione riguarda un difetto chiuso: «L'informativa privacy può uscire senza titolare identificabile…». La riparazione ha tolto i dati finti, ma oggi in produzione l'informativa esce proprio senza un titolare identificabile.
- **Un esempio.** 1) Una cliente apre la pagina Privacy per farsi cancellare i dati. Legge «Il titolare è MyCity»: nessun indirizzo, nessun nome di persona o di società. 2) Vuole mandare il recesso per raccomandata, ma il modulo dice «Destinatario: MyCity» senza indirizzo. 3) In un'ispezione il Garante o l'AGCM chiede chi è il titolare: sul sito non c'è. Cosa dovrebbe esserci: nome legale, sede, P.IVA o codice fiscale, REA (se società), PEC e una email privacy che qualcuno legge.
- **Quanto costa.** Ogni dato raccolto (oggi 9 profili) è trattato da un titolare non identificato, e il Garante sanziona proprio questo punto dell'informativa. Ogni commissione del 10% e ogni quota di consegna da 3 € incassata senza partita IVA è un problema fiscale, non solo di pagina. Quando arriveranno le chiavi, Stripe Connect chiederà comunque un soggetto con dati fiscali per il conto della piattaforma.
- **Dove.** `lib/legal/titolare.ts:110-128 (titolare(): denominazione ripiega su 'MyCity', tutti gli altri campi null) · lib/legal/titolare.ts:131-149 (rigaIdentita vuota; commento «la attivo quando raggiungeremo i 5000€») · app/privacy/page.tsx:57-62 · app/terms/page.tsx:59-62 e 214-215 (modulo di recesso) · components/Footer.tsx:136 · Vercel produzione: nessuna delle 14 NEXT_PUBLIC_TITOLARE_*`
- **La prova** (comando). Ho letto il testo delle pagine dal server locale: curl http://localhost:3100/privacy e /terms, stesso commit della produzione (70a9299). Da /proc/<pid>/environ ho verificato che il server gira senza nessuna NEXT_PUBLIC_TITOLARE_*, come la produzione. L'elenco delle chiavi di produzione nella BASELINE conferma che tutte le TITOLARE_* mancano.
- **Cosa si è visto.** Testo visibile: «1. Titolare del trattamento — Il titolare del trattamento è MyCity . Contatti del Titolare: il modulo dei contatti». Termini: «gestita da MyCity (di seguito "MyCity", "noi")». Modulo di recesso: «Destinatario: MyCity», senza indirizzo. Piè di pagina: «info@mycity-marketplace.com Lun-Ven 9-18 Piacenza, IT», nessuna riga con i dati dell'impresa.
- **Verifica tecnica.** Il fatto regge ed è visibile oggi in produzione. L'informativa dice «Il titolare del trattamento è MyCity.», i Termini dicono «gestita da MyCity» e il modulo di recesso dice «Destinatario: MyCity», senza indirizzo. Nel piè di pagina non c'è nessuna riga con i dati dell'impresa. Su un sito pubblico che raccoglie già iscrizioni (9 profili), mancano l'identità del titolare (art. 13.1.a GDPR) e l'indirizzo geografico di chi offre il servizio di consegna a pagamento (art. 49 Codice del Consumo). È «illegale ora», quindi la gravità bloccante regge. Va però corretto un punto: la BASELINE dice che nessuna card copre le chiavi TITOLARE, ma una c'è. È la card #165, «Scrivi i dati veri del titolare: l'
- **Seconda opinione.** Il difetto è reale e la severità regge: sul sito vero oggi chi tratta i dati risulta solo «MyCity», che è un'insegna, senza sede, partita IVA, REA né PEC. L'obbligo vale già adesso, non solo dal lancio. L'informativa privacy (art. 13 GDPR) si applica dalla prima iscrizione, e in produzione ci sono già 9 profili. L'art. 7 del D.Lgs. 70/2003 vale per qualunque sito che offre un servizio online. Per vendere, MyCity incasserebbe 3 € di consegna più il 10% di commissione su ogni ordine: è un'attività commerciale abituale. Per questo la partita IVA va aperta all'inizio dell'attività (art. 35 DPR 633
- **Rimedio.** Decisione di Nicola, da prendere con il commercialista: aprire subito la posizione fiscale (ditta individuale o società) con cui MyCity incassa. Poi impostare su Vercel produzione almeno NEXT_PUBLIC_TITOLARE_NOME (nome e cognome o ragione sociale), _INDIRIZZO, _PIVA, _PEC, _EMAIL_PRIVACY (più _REA e _CAPITALE se è una società) e ricompilare. Nel codice: far fallire il deploy di produzione se la denominazione resta «MyCity» e la P.IVA manca, invece del semaforo «unknown» di lib/health/titolare-check.ts. Il riquadro va fatto validare da un legale abilitato.
- *Visto anche da altre corsie (privacy-legale, produzione-live): schede unite.*

### R7 · Falla di sicurezza R7 da chiudere (sicurezza degli accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** bloccante · **Area:** Sicurezza e accessi · **Si ripara:** impostazioni di Vercel (🔴, tu) · **Sforzo:** M

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R8 · Le foto di prodotti e negozi rischiano di uscire tutte rotte, perché il sito usa un servizio di Supabase che è solo a pagamento

**Gravità:** bloccante · **Area:** Immagini e media · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** Ogni foto caricata dai negozi passa dalla «trasformazione immagini» di Supabase. Questo servizio rimpicciolisce la foto al volo, all'indirizzo /storage/v1/render/image/public/…?width=… . Secondo la documentazione di Supabase c'è solo dal piano Pro in su («Image Resizing is currently enabled for Pro Plan and above»). Ho letto il codice del server di Supabase Storage (supabase/storage, src/http/routes/render/index.ts e src/http/plugins/tenant-feature.ts). Le rotte render sono protette da requireTenantFeature('imageTransformation'). Se la funzione è spenta per il progetto, il server risponde 403 con «FeatureNotEnabled · feature not enabled for this tenant». La memoria dell'AD registra che l'organizzazione Supabase di MyCity è sul piano GRATUITO. Lo dicono registro-realta.json:55 (lettura dello strumento Supabase il 2026-10-10 alle 08:56) e Archivio/AZIONI-archivio.md:1199 («alle 11:58 l'organizzazione risultava ancora sul piano gratuito»). Le pagine vere di produzione scaricate oggi dalla corsia produzione-live usano già solo indirizzi render per le foto vere di Pane Quotidiano: la scheda «Pesto Genovese Bio», il «Kefir di latte di capra biologico» e la copertina del negozio. Se il piano è ancora quello gratuito, nessuna di quelle foto si vede. La scheda prodotto non ha un ripiego quando la foto non arriva: non c'è nessun onError sull'immagine.
- **Un esempio.** 1) Un cliente apre il volantino col QR e arriva su www.mycity-marketplace.com/search o sulla vetrina di Pane Quotidiano. 2) Il telefono chiede la foto a https://clmpyfvpvfjgeviworth.supabase.co/storage/v1/render/image/public/products/c0b240c0-…/1781623587957-av1sz6-1000062975.jpg?width=640… 3) Sul piano gratuito Supabase risponde 403 «feature not enabled for this tenant». 4) Il cliente vede schede bianche con l'icona dell'immagine rotta, al posto del pane e del pesto. 5) Il negoziante carica una foto nuova dal pannello e anche l'anteprima (ImageUpload, che usa lo stesso caricatore) esce rotta: pensa che il caricamento sia fallito e riprova. 6) Chi condivide il link su WhatsApp ottiene l'anteprima senza foto, perché anche l'immagine di anteprima chiede la versione render. Cosa dovrebbe succedere: la foto si vede sempre, con qualunque piano.
- **Quanto costa.** Su un marketplace di cibo, una vetrina senza foto non vende: è il primo colpo d'occhio del lancio. Tocca tutte le foto di prodotti, copertine, gallerie e anteprime social, cioè 42 punti col caricatore più 10 che passano da Vercel. La stessa causa, il piano gratuito, è quella che il 10/10 ha messo in pausa i due database (card #199): la decisione da prendere è una sola e chiude tutte e due.
- **Dove.** `lib/image-url.ts:92-110 (buildSupabaseStorageUrl: /object/public/ diventa /render/image/public/) · lib/image-loader.ts:43-64 (caricatore usato da 42 <Image>, fra cui components/ProductCard.tsx:168-182, app/product/[id]/page.tsx:575-580, :638, :680, components/store-sections/HeroSection.tsx:97, components/seller/site/ImageUpload.tsx:72) · app/product/[id]/layout.tsx (precarico della prima foto) · app/product/[id]/opengraph-image.tsx:41 (sizedImage(raw, 460)) · altre 10 <Image> senza caricatore che passano la stessa URL render all'ottimizzatore di Vercel`
- **La prova** (comando). (a) node --experimental-strip-types su una copia di lib/image-url.ts: sizedImage('https://clmpyfvpvfjgeviworth.supabase.co/storage/v1/object/public/products/…/pane.jpg','card') restituisce …/storage/v1/render/image/public/products/…/pane.jpg?width=400&height=400&quality=75&resize=cover, e lo stesso vale per thumb, detail, hero, 1600 e logoNegozio. (b) Pagina vera di produzione scratchpad/verifica-produzione-live/product.json (Pesto Genovese Bio): link preload, srcSet e <img> hanno solo candidati /render/image/public/ (384w…3840w). Stesso risultato in kefir.json e store-pq.json. (c) WebFetch di raw.githubusercontent.com/supabase/storage/master/src/http/plugins/tenant-feature.ts: con la funzione spenta fa reply.status(403) con error 'FeatureNotEnabled', «feature not enabled for this tenant». (d) Playwright, telefono 390×844, /search con 8 prodotti finti le cui foto stanno su supabase.co (s
- **Cosa si è visto.** Visto adesso: il codice manda tutte le foto a /render/image/. La produzione di oggi usa solo quegli indirizzi per i prodotti veri di Pane Quotidiano. Il server Supabase risponde 403 quando la funzione è spenta, e la memoria registra il piano gratuito al 10/10 ore 11:58. Nella simulazione col 403, 8 foto su 8 escono rotte senza nessun ripiego. NON visto: la risposta vera di Supabase oggi, perché il proxy blocca supabase.co (CONNECT 403), né il piano dell'organizzazione oggi.
- **Verifica tecnica.** Ho provato a smontarlo e regge. Oggi l'organizzazione Supabase di MyCity è sul piano gratuito, e la produzione si vede rifiutare dal server proprio gli indirizzi «render». Tutto il codice manda le foto lì (sizedImage → /render/image/public/, usato dal caricatore delle 42 <Image> e dall'immagine di anteprima). Le pagine vere di produzione usano solo quegli indirizzi per le foto di Pane Quotidiano: 83 nella scheda del pesto, 137 nel kefir, 17 nella vetrina. Sulle <Image> del catalogo non c'è nessun onError di ripiego: gli onError in ProductCard.tsx:112 e product/[id]/page.tsx:261/726 sono gestori delle mutazioni, non delle foto. Il cliente vede schede senza foto sull'unico negozio vero: è bloc
- **Seconda opinione.** Lo scenario regge ed è realistico con i dati di oggi. Le foto vere di Pane Quotidiano (Pesto, Kefir, copertina) le chiede il browser del cliente a /render/image/public/, e quella funzione Supabase la dà solo dal piano Pro in su. La documentazione Supabase lo conferma ancora oggi: «Image Resizing is currently enabled for Pro Plan and above». Che l'organizzazione sia sul piano gratuito non lo dice solo una riga di memoria: il 10/10 Supabase aveva messo in pausa i due progetti, e la pausa per inattività esiste solo sul piano gratuito. Il piano Pro non risulta mai fatto: intenzioni-nicola.json lo 
- **Rimedio.** Raccomandazione: Nicola passa l'organizzazione Supabase al piano Pro. È la spesa già messa in conto il 20/7 in intenzioni-nicola.json. Così le trasformazioni si accendono e i database smettono di addormentarsi, cioè sparisce anche la causa della card #199. Va controllato che in Storage → Settings «Enable Image Transformations» sia acceso. Rete di sicurezza nel codice, da fare comunque: (1) un interruttore d'ambiente, per esempio NEXT_PUBLIC_TRASFORMAZIONI_FOTO=off, che fa restituire a sizedImage l'indirizzo /object/public/ originale. Le foto caricate sono già ridotte a 1600 px JPEG 0,85 da lib/image-resize.ts: più pesanti, ma visibili. (2) Un onError sulle foto di ProductCard e della galleria che mostri /foto-mancante.svg invece dell'icona rotta. (3) Un controllo in /api/health che chiede l'indirizzo render di una foto vera e diventa rosso con un 403.

### R9 · Falla di sicurezza R9 da chiudere (sicurezza degli accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** bloccante · **Area:** Sicurezza e accessi · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


## Gli 80 gravi


### R10 · Falla di sicurezza R10 da chiudere (regole d'accesso al database): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** grave · **Area:** Permessi sul database · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** S

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R11 · Falla di sicurezza R11 da chiudere (regole d'accesso al database): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** grave · **Area:** Permessi sul database · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R12 · Falla di sicurezza R12 da chiudere (regole d'accesso al database): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** grave · **Area:** Permessi sul database · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R13 · Chi chiede la nuova password dal computer e apre l'email dal telefono non riesce a cambiarla, e la pagina non dice perché

**Gravità:** grave · **Area:** Sicurezza e accessi · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Il client Supabase del browser usa il flusso PKCE (cioè «a prova di furto del link»): è il valore predefinito di createBrowserClient, riga 37 della libreria. Con questo flusso il link dell'email funziona solo nello STESSO browser che ha fatto la richiesta. Quel browser ha in un cookie la metà segreta, detta «code verifier». Aperto da un altro dispositivo, o dal browser interno dell'app di posta, la libreria non prova nemmeno lo scambio. La pagina /reset-password, dopo 800 millisecondi, ripiega in silenzio sulla vista «Reimposta la password»: chiede di nuovo l'email, senza un messaggio. La conferma dell'iscrizione ha lo stesso problema su /auth/callback: lo scambio fallisce e manda a /sign-in
- **Dove.** `lib/supabase/client.ts:17 · node_modules/@supabase/ssr/dist/main/createBrowserClient.js:37 · app/reset-password/page.tsx:93-100 · app/reset-password/page.tsx:154-157 · app/auth/callback/route.ts:52-54 · app/sign-in/page.tsx:72`
- **Rimedio.** Passare i due template email di Supabase, «Reset password» e «Confirm signup», al formato con token_hash: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery|signup. Aggiungere una rotta server /auth/confirm che chiama supabase.auth.verifyOtp({ token_hash, type }), imposta i cookie e porta a /reset-password o a next. Il token_hash funziona su qualunque dispositivo. Nel frattempo, due ritocchi: /reset-password con ?code= che non va mostra un messaggio chiaro, e /sign-in legge error=callback_failed e dice «email confermata, ora accedi». Collaudo: chiedere il reset da un browser

### R14 · Falla di sicurezza R14 da chiudere (sicurezza degli accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** grave · **Area:** Sicurezza e accessi · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R15 · Falla di sicurezza R15 da chiudere (sicurezza degli accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** grave · **Area:** Sicurezza e accessi · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R16 · Se l'email d'allarme non parte, il sorvegliante la dà per spedita, dice «tutto bene» e tace per sei ore

**Gravità:** grave · **Area:** API · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo)

- **Cosa succede.** Il sorvegliante (ogni 15 minuti) manda l'email degli allarmi dentro un try/catch. Il commento dice: «se l'invio fallisce mentre ci sono anomalie fresche, il giro NON è riuscito». Ma `sendEmail` non lancia mai un'eccezione: quando la chiave Resend manca, quando manca il mittente o quando Resend rifiuta, restituisce {ok:false}. Il risultato non viene letto, quindi il ramo «allarmi non recapitati» non scatta mai. Il codice scrive lo stesso l'attesa di 6 ore (COOLDOWN_HOURS = 6, riga 47) per quegli allarmi e risponde 200 ok:true.
- **Dove.** `app/api/cron/operational-alerts/route.ts:641-676 (try/catch che non scatta mai) · app/api/cron/operational-alerts/route.ts:677-683 (attesa di sei ore scritta comunque) · app/api/cron/operational-alerts/route.ts:685-691 (ok:true) · lib/email/client.ts:58-63, 86, 170 (sendEmail restituisce l'errore, non lo lancia)`
- **Rimedio.** `const inviata = await sendEmail(...); if (!inviata.ok) return 500 {errore:'allarmi non recapitati', motivo}` prima dell'upsert su operational_alert_log. L'attesa va scritta solo per gli allarmi recapitati davvero. Cercare lo stesso schema (await sendEmail senza leggere il risultato) nelle altre rotte.
- *Visto anche da altre corsie (api-backend, email-notifiche): schede unite.*

### R17 · Chrome non trova il file che rende MyCity installabile: su Android l'app non si può mettere in Home

**Gravità:** grave · **Area:** Mobile e app · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il collegamento al manifest (il file che dice al telefono nome, icona, colore e modalità app di MyCity) esce dal server dentro il <body> invece che dentro il <head>. Succede perché Next 15.5 «manda in streaming» i metadata delle pagine dinamiche (il layout è force-dynamic) e li scrive nel corpo. Chrome cerca il manifest solo fra i figli diretti del <head>: nel corpo non lo considera. Risultato misurato: Chrome dice «no-manifest». Lo stesso vale per apple-touch-icon e <title>, anch'essi finiti nel body.
- **Dove.** `app/layout.tsx:93 (dynamic = 'force-dynamic') · app/layout.tsx:100 (manifest dichiarato nei metadata) · app/layout.tsx:183-188 (il <head> scritto a mano, dove il link non c'è) · next.config.js:26-81 (nessun htmlLimitedBots) · components/PWAInstallBanner.tsx:79-89 · lib/installabile.ts:48-55`
- **Rimedio.** Nel <head> scritto a mano di app/layout.tsx (righe 183-188) aggiungere <link rel="manifest" href="/manifest.json" /> e <link rel="apple-touch-icon" href="/apple-touch-icon.png" />, togliendo manifest e icons.apple dai metadata per non avere doppioni. In alternativa si può mettere htmlLimitedBots: /.*/ in next.config.js: spegne lo streaming dei metadata per tutti e riporta nel head anche il <title>, ma la pagina aspetta i metadata prima di partire. Come freno, una prova Playwright che chiama Page.getInstallabilityErrors su / e diventa rossa se la lista non è vuota.

### R18 · Chi corregge la descrizione di un prodotto rimette in magazzino la merce venduta nel frattempo

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** La pagina «Modifica prodotto» legge la scorta una volta sola, all'apertura. Il modulo non si ricarica mentre resta aperto. Al salvataggio, buildProductPayload mette sempre `stock` nel pacchetto (schema.ts:122), anche se il negoziante non l'ha toccata. La porta di scrittura salvaProdottoTracciato scrive tutto il pacchetto così com'è (riga 13: «stock» è fra le colonne ammesse; righe 276-282: update). Nel frattempo ogni ordine toglie pezzi dalla scorta con reserve_stock (`stock = stock - qty`). Il salvataggio quindi riporta la scorta al numero letto all'apertura e cancella le vendite avvenute in mezzo. Con le varianti succede lo stesso: saveProductVariants riscrive lo stock di ogni taglia o col
- **Dove.** `app/seller/products/[id]/edit/page.tsx:98-121 · components/seller/ProductForm.tsx:676-691 · lib/products/schema.ts:122 · lib/products/salvataggio-tracciato.ts:13,264-282 · lib/products/persistVariantsServer.ts (update di ogni variante con il suo stock) · migrations/161_quello_che_il_ripasso_del_9_settembre_aveva_riportato_indietro.sql:236-268 (reserve_stock)`
- **Rimedio.** Nel modulo di modifica, mandare `stock` solo se il negoziante l'ha cambiata (confronto col valore iniziale; react-hook-form ha già dirtyFields). Per le varianti, mandare solo le righe con lo stock cambiato. Meglio ancora, nella porta salvaProdottoTracciato: se `stock` nel pacchetto è uguale al valore iniziale mandato dal client e diverso da quello riletto, non scriverlo. Oppure scrivere con `.eq('stock', valoreIniziale)` e rispondere «la scorta è cambiata mentre modificavi: ricarica». Va aggiunta una prova che fallisce oggi, con lo scenario 5 → 3 → salvataggio.

### R19 · Il caricamento dei prodotti da file non legge i file salvati con Excel in italiano

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La pagina «Importa prodotti» (CSV) legge i file separando le colonne solo con la virgola. Excel con le impostazioni italiane, quello dei negozi di Piacenza, salva i CSV con il punto e virgola, perché la virgola è il separatore dei decimali. Il negoziante che scarica il modello, lo apre in Excel, lo riempie e lo salva si vede rispondere che mancano TUTTE le colonne, anche se ci sono. Il messaggio non dice cosa fare. Lo stesso modello scaricato, aperto in Excel italiano, finisce tutto nella colonna A.
- **Dove.** `app/seller/products/import/page.tsx:28-50 (parseCsv divide solo sulla virgola) · :98-103 (errore «Colonne mancanti»)`
- **Rimedio.** In parseCsv riconoscere il separatore dalla prima riga: se contiene più ';' che ',', usare ';'. È la convenzione di Excel in italiano, e la virgola decimale nel prezzo è già gestita a riga 110. Il modello andrebbe offerto già con ';'. Nell'errore va detto «il file sembra salvato con un separatore diverso». Serve una prova unitaria con un file ';' e BOM. Già che ci si è, gestire le descrizioni su più righe dentro le virgolette: oggi il file viene spezzato a ogni a capo prima di leggere le virgolette.

### R20 · Il negozio che scrive l'indirizzo senza premere «Cerca» viene messo a Roma, e da Piacenza nessuno può più ordinargli una consegna

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il selettore della posizione del negozio parte dalle coordinate di Roma (41.9028, 12.4964: DEFAULT_MAP_CENTER, riga 9). Quando il negozio non ha ancora una posizione salvata, il selettore manda subito queste coordinate al modulo che lo contiene (effetto al montaggio, righe 53-56). Così sovrascrive il punto di partenza su Piacenza che il modulo di iscrizione aveva previsto (45.0532, 9.6914, SellerApplicationForm righe 144-148). Scrivere l'indirizzo nella casella cambia solo il testo e lascia le coordinate dov'erano (righe 201-205). La posizione si aggiorna solo se il negoziante preme «Cerca» o Invio, usa «la mia posizione» o tocca la mappa. Al salvataggio, sia l'iscrizione (SellerApplicationF
- **Dove.** `components/StoreLocationPicker.tsx:9,31-34,53-56,201-205 · components/SellerApplicationForm.tsx:144-148,200-213,346-350 · components/VendorForm.tsx:95-99,161-170 · app/sell/page.tsx:102-103 · lib/ordini/zona-di-consegna.ts:40-45 · lib/constants.ts:57 · app/api/orders/cod/route.ts:520-532 · app/api/stripe/checkout/route.ts:516`
- **Rimedio.** Tre righe, tutte nel codice. (1) Portare DEFAULT_MAP_CENTER su Piacenza (45.0526, 9.6930). (2) Togliere l'onChange al montaggio quando non c'erano coordinate salvate, oppure mandare lat/lng vuoti finché l'indirizzo non è stato cercato. (3) In SellerApplicationForm e VendorForm, rifiutare il salvataggio se l'indirizzo è cambiato dopo l'ultima ricerca, con il messaggio «Premi Cerca per mettere il negozio sulla mappa». Si può anche cercare l'indirizzo in automatico all'invio. Sui 2 negozi già in produzione serve una SELECT su store_lat/store_lng per vedere se sono finiti a Roma.

### R21 · Le etichette di spedizione con nome, indirizzo e telefono del cliente restano salvate sul dispositivo del negozio anche dopo l'uscita dall'account

**Gravità:** grave · **Area:** Mobile e app · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** Il service worker mette in cache ogni navigazione che risponde 200, tranne quelle che iniziano con /orders, /profile, /seller, /rider, /admin, /checkout e /cart. Il pulsante «Stampa etichetta» apre /api/seller/orders/<id>/label in una scheda nuova, quindi è una navigazione. Quell'indirizzo inizia con /api/seller e non con /seller, perciò non risulta privato. Il PDF dell'etichetta, con nome, indirizzo, CAP e telefono del cliente, finisce nella cache mycity-html-v2. La Cache API non rispetta il Cache-Control del server, quindi anche il «private, no-cache» non lo ferma. Il commento in sw.js:139-149 dichiara proprio lo scopo opposto: «una fuga verso la persona seduta dopo di te».
- **Dove.** `public/sw.js:150-154 (PERCORSI_PRIVATI senza /api) · public/sw.js:157-166 (networkFirstHtml mette in cache ogni navigazione andata a buon fine) · app/seller/orders/[id]/page.tsx:430-433 (link «Stampa etichetta», target=_blank) · app/api/seller/orders/[id]/label/route.ts:24-25,39-43,53-55 (PDF con delivery_full_name, address, phone; Cache-Control private, no-cache)`
- **Rimedio.** In public/sw.js, dentro networkFirstHtml, aggiungere '/api' a PERCORSI_PRIVATI. Mettere in cache solo le risposte con content-type text/html. Non si può filtrare su Cache-Control: tutte le pagine del sito escono già con «private, no-cache, no-store», per cui quel filtro spegnerebbe la cache offline intera. Poi portare CACHE_VERSION a 'v3', così all'attivazione il service worker cancella le cache html che oggi contengono già etichette sui dispositivi dei negozi. Come freno, una prova (anche in Playwright come giro5) che una navigazione su /api/... non lasci voci in mycity-html-*.

### R22 · Quando PostHog verrà acceso, un clic sul telefono del cliente nelle pagine del negozio manderà quel numero negli Stati Uniti

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Le pagine con dati di altre persone (/seller, /rider, /admin, /orders…) sono state riconosciute come pericolose, ma la riparazione spegne solo la registrazione dello schermo. La raccolta automatica dei clic (autocapture) resta accesa: per ogni clic PostHog porta il testo dell'elemento ($el_text) e i suoi attributi (attr__href). Il cancello before_send ripulisce solo gli indirizzi web con «/» o «?», quindi «tel:+39…», nomi e indirizzi passano interi. È il canale concreto del difetto aperto K170, che finora era descritto in astratto e classificato minore.
- **Dove.** `lib/analytics/posthog.tsx:79-117 (PAGINE_CON_DATI_DI_TERZI, applicaRegistrazioneSchermo spegne solo la telecamera) · lib/analytics/posthog.tsx:311-318 (autocapture acceso ovunque) · lib/analytics/filmato-senza-dati-personali.ts (testoSenzaIndirizzi ripulisce solo testi con «/») · app/seller/orders/[id]/page.tsx:520 · app/rider/orders/[id]/page.tsx:394 · app/admin/sos/page.tsx:157`
- **Rimedio.** Nelle pagine di PAGINE_CON_DATI_DI_TERZI spegnere anche l'autocapture (posthog.set_config({ autocapture: false }) dentro applicaRegistrazioneSchermo, e riaccenderlo altrove). In alternativa, mettere mask_all_text e mask_all_element_attributes a true nell'init. In before_send scartare gli $autocapture la cui $pathname sta fra quelle pagine e togliere i valori tel:/mailto:. Aggiungere la prova Playwright qui sopra come test che diventa rosso se il numero esce.

### R23 · Chi paga alla consegna non riceve nessuna email se il negozio rifiuta o lascia scadere l'ordine

**Gravità:** grave · **Area:** API · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Quando un ordine viene annullato dal negozio (reject), dall'amministratore o dal giro expire-stale-orders, l'unica email che parte è «Rimborso emesso», e solo per gli ordini pagati con carta (refundOrder con notifyBuyer: true). Per il contrassegno non c'è niente da rimborsare, quindi niente email: il cliente riceve solo una riga nella campanella del sito e una push. La push arriva solo se l'ha attivata, e l'interruttore sta soltanto in Profilo > Impostazioni. Anche i passaggi «accettato» e «in consegna» esistono solo come avviso nel sito (trigger della migrazione 122), mai via email. Eppure la conferma d'ordine promette «Riceverai aggiornamenti quando il negozio prepara e il rider ritira l'o
- **Dove.** `app/api/cron/expire-stale-orders/route.ts:142-150,229-237 · app/api/seller/orders/[id]/reject/route.ts:69-73,107-127 · lib/ordini/annulla.ts:223-238 · app/api/admin/orders/[id]/cancel/route.ts:76 · migrations/122_radiografia_20_agosto.sql:95-138 · lib/email/templates.ts:137 · components/PushNotificationOptIn.tsx (usato solo in app/profile/settings/page.tsx)`
- **Rimedio.** Aggiungere un template «ordine annullato» (motivo, «non devi pagare niente», link ai negozi alternativi) e spedirlo con tipo 'transazionale' da annullaERimborsa e da expire-stale-orders per TUTTI i metodi di pagamento. Per la carta può sostituire il «Rimborso emesso» o accompagnarlo. Valutare la stessa email anche per «in consegna».

### R24 · Conferme d'ordine, avvisi al negozio, rimborsi e buoni regalo partono come email pubblicitarie, con «annulla l'iscrizione» in fondo

**Gravità:** grave · **Area:** API · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** sendEmail tratta come «marketing» ogni email per cui chi chiama non dichiara il tipo (client.ts:106: input.tipo ?? 'marketing'). Le uniche chiamate che dichiarano 'transazionale' sono la coda del ciclo di vita, gli allarmi interni e il modulo contatti. Tutte le email legate ai soldi e agli ordini non lo dichiarano: conferma d'ordine al cliente (carta e contanti), avviso «nuovo ordine» al negozio, i due percorsi del rimborso, buono regalo al destinatario e a chi lo compra. Ognuna esce quindi con la riga «Non vuoi più ricevere queste email? Annulla l'iscrizione con un clic» e con le intestazioni List-Unsubscribe e List-Unsubscribe-Post, che in Gmail accendono il pulsante «Annulla iscrizione» a
- **Dove.** `lib/email/client.ts:106,132-148 · app/api/orders/cod/route.ts:937,954 · lib/stripe/webhook/ordini.ts:533,549 · lib/stripe/webhook/rimborsi.ts:274 · lib/stripe/payout.ts:676 · lib/stripe/webhook/giftcard.ts:109,115`
- **Rimedio.** Passare tipo: 'transazionale' nelle 8 chiamate citate. Meglio ancora: rendere 'tipo' obbligatorio in SendEmailInput, così il compilatore segnala ogni chiamata che non lo dichiara. Aggiungere una prova che importi le rotte o le funzioni chiamanti, e non solo sendEmail, e fallisca se la conferma d'ordine contiene /api/unsubscribe.

### R25 · L'email di rimborso promette i soldi sul metodo di pagamento entro 5-10 giorni anche a chi ha pagato in contanti e ha ricevuto credito MyCity

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Su un ordine in contanti, `refundOrder` non restituisce contanti. Accredita l'importo sul portafoglio MyCity (wallet_credit, motivo cod_refund) e poi chiama `notifyRefundBuyer`; il commento alla riga 662 lo dice: «riusata dal path carta e da quello COD». Il modello però è uno solo, quello della carta: «Il rimborso arriverà sul tuo metodo di pagamento entro 5-10 giorni lavorativi». Il credito non viene mai nominato. Il motivo arriva nell'email così com'è: se il negozio approva il reso senza scrivere una nota, le rotte dei resi passano `'requested_by_customer'`, e il cliente legge «Motivo: requested_by_customer». Oggi i contanti sono l'unico modo di pagare, quindi ogni rimborso da reso o da co
- **Dove.** `lib/email/templates.ts:241-256 · lib/stripe/payout.ts:662-679 · lib/stripe/payout.ts:859-932 · app/api/returns/[id]/avanza/route.ts:177 · app/api/returns/[id]/decide/route.ts:189-196 · app/api/admin/disputes/[id]/resolve/route.ts:120-128`
- **Rimedio.** Passare a refundIssuedTemplate il modo del rimborso, che notifyRefundBuyer conosce già (ramo COD o ramo carta). Per il credito scrivere l'importo, «credito MyCity già disponibile» e dove vederlo. Non stampare codici tecnici come motivo: trasformare requested_by_customer in «Reso richiesto da te», oppure ometterlo. La formula sul consenso al credito va fatta validare da legale-privacy.
- *Visto anche da altre corsie (email-notifiche, i18n-microcopy): schede unite.*

### R26 · Dopo le migrazioni il fattorino non vede più dove ritirare, e il cliente non vede più da quale negozio ha comprato

**Gravità:** grave · **Area:** Rilascio e affidabilità · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** È lo stesso meccanismo della scheda prodotto (N190), ma colpisce le pagine dell'ordine, che N190 non elenca. Queste pagine leggono i dati del negozio agganciandoli alla tabella dei profili (`seller:profiles!orders_seller_id_fkey(...)`), dal browser e con l'accesso dell'utente. Oggi in produzione funzionano solo grazie alla regola «Anyone can view approved seller profiles». È la stessa regola che oggi lascia leggere IBAN e codice fiscale (N39). Le 48 migrazioni la tolgono: la 110, la 112 e la 161, riga 353. Tolgono anche «Public profile read» (riga 354) e «Riders can view buyer of assigned orders» (riga 345). Dopo, sui profili restano solo due regole di lettura: il proprio profilo (001) e l'a
- **Dove.** `migrations/161_quello_che_il_ripasso_del_9_settembre_aveva_riportato_indietro.sql:345,353-354 (insieme a 110:14,47 · 112:10 · 115:30, anche loro fra le 48 da applicare) · app/rider/orders/[id]/page.tsx:93,292-299,366-377 · app/rider/page.tsx:125,396 · app/orders/[id]/page.tsx:107,246,372,625-632,723,748-757 · app/orders/page.tsx:56,205,314 · app/orders/[id]/review/page.tsx:75 · app/orders/[id]/dispute/page.tsx:42 · app/messages/page.tsx:73-74 · app/messages/[id]/page.tsx:81-82 · app/shared-cart/page.tsx:101`
- **Rimedio.** Prima del passo 3 (migrazioni): far leggere i dati del negozio a queste pagine dalla vista `seller_public_profiles`, con una seconda lettura per `seller_id`. La vista ha già store_name, store_address, store_phone, store_lat, store_lng e store_logo, e resta leggibile da tutti. Togliere l'aggancio `profiles!orders_seller_id_fkey` da rider/orders/[id], rider, orders, orders/[id], la recensione, il reclamo, i messaggi e shared-cart. Aggiungere una prova che, sul database costruito dal codice, apra da fattorino un ordine assegnato e controlli che nome e indirizzo del negozio non siano vuoti. Il fix

### R27 · La pagina Recensioni del negozio va sempre in errore: il negoziante non vede né può rispondere alle recensioni

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La lettura delle recensioni del negozio chiede a PostgREST `reviewer:profiles!store_reviews_reviewer_id_fkey ( full_name )`. Su store_reviews quel collegamento non esiste. La tabella (migrazione 014) ha la colonna user_id e la collega ad auth.users, non a profiles. Nessuna migrazione aggiunge una colonna reviewer_id o un vincolo con quel nome, e lib/database.types.ts riporta Relationships: [] per store_reviews. PostgREST risponde quindi con un errore di relazione, la query lancia l'errore e la pagina mostra sempre «Non sono riuscito a leggere le recensioni». Lo stesso identico difetto era nella pagina del fattorino ed è stato riparato lì. Il commento in app/rider/reviews/page.tsx:44-48 dice 
- **Dove.** `app/seller/reviews/page.tsx:38-46 · migrations/014_mvp_sprint.sql:56-65 · app/rider/reviews/page.tsx:44-52`
- **Rimedio.** Fare come nella pagina del fattorino: leggere `id, rating, comment, created_at, order_id, seller_reply, seller_reply_at, user_id`. Poi prendere i nomi in un secondo passaggio (come useStorePageData) oppure da una vista che esponga solo il nome di battesimo. Aggiungere una prova che fallisca se un embed nomina un vincolo che non esiste in database.types.ts.

### R28 · Il pulsante SOS apre il 112 solo dopo aver aspettato GPS e rete: con poco segnale il tastierino può non aprirsi mai

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Quando il fattorino conferma l'SOS, il codice fa tre attese in fila prima di aprire il 112. Prima chiede la posizione GPS ad alta precisione (fino a 8 secondi). Poi fa una chiamata di rete per sapere chi è l'utente. Poi scrive l'evento nel database. Solo alla riga 81 apre il tastierino col 112. Le due chiamate di rete non hanno un tempo massimo: con segnale debole restano appese finché il browser non si arrende, e in quel tempo il 112 non si apre. Chiamare il 112 non ha bisogno di internet: è la prima cosa da fare, non l'ultima.
- **Dove.** `components/rider/SOSButton.tsx:44-50 (attesa GPS fino a 8 secondi) · :56 (auth.getUser, chiamata di rete) · :58-66 (insert, chiamata di rete) · :81 (window.location.href = 'tel:112')`
- **Rimedio.** Aprire 'tel:112' come prima istruzione del click, in modo sincrono. Subito dopo, senza aspettare, mandare l'avviso con un tempo massimo (ad esempio 5 secondi). Usare una posizione già nota con maximumAge invece di aspettarne una nuova ad alta precisione. Il messaggio finale resta quello di oggi.

### R29 · L'SOS del fattorino non arriva davvero a nessuno: solo una notifica nel pannello, mentre a lui diciamo «alert immediato»

**Gravità:** grave · **Area:** API · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Quando parte un SOS, il database scrive una notifica dentro il sito per ogni amministratore. Basta. Nessuna email, nessun SMS, nessuna chiamata. Il push al telefono parte solo dal lavoro automatico send-push, che gira ogni 5 minuti: nel caso migliore l'avviso arriva fino a 5 minuti dopo. Oggi in produzione quel lavoro risponde 503 per la chiave Supabase mancante (BASELINE), quindi il push non parte affatto. Il sorvegliante operational-alerts non controlla gli SOS aperti. In più l'SOS è montato senza orderId, quindi l'amministratore non sa quale consegna, quale cliente e quale indirizzo erano in corso. Se il GPS è negato, non ha nemmeno la posizione.
- **Dove.** `migrations/037_rider_sos_admin_dashboard.sql:41-62 (il trigger scrive solo righe in notifications) · vercel.json:21 (send-push ogni 5 minuti) · components/rider/SOSButton.tsx:153 (testo «riceveranno un alert immediato») · components/rider/RiderShell.tsx:67 (SOSButton senza orderId) · app/admin/sos/page.tsx:140-149`
- **Rimedio.** Una rotta server per l'SOS che manda subito email e push agli amministratori (e un SMS o una chiamata quando ci sarà un canale), senza aspettare il cron. Passare l'ordine in corso al pulsante SOS e mostrarlo nella pagina /admin/sos con indirizzo e telefono del cliente. Aggiungere gli SOS aperti da più di 2 minuti al sorvegliante operational-alerts. Fino ad allora, correggere il testo «alert immediato».

### R30 · La pagina d'aiuto dei fattorini promette polizza pagata da noi, compenso a chilometri e bonifici a date fisse che il sito non fa, con un numero d'emergenza finto

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** I testi rivolti ai fattorini fanno cinque promesse che il codice smentisce. ① «MyCity stipula una polizza RC obbligatoria per ogni rider attivo», ma l'iscrizione obbliga il fattorino a caricare la SUA «Polizza RC», con la scadenza. ② «Come è calcolato il compenso? Base fissa + km percorsi», ma il compenso è fisso a 3 €: lib/constants.ts lo dice in chiaro, «è fisso e non cresce coi chilometri». ③ «Lavora con noi» dice «vieni pagato ogni settimana». ④ L'aiuto dice «Bonifico mensile il giorno 5». ⑤ Il codice invece paga ordine per ordine, con il giro dei bonifici ogni quindici minuti. In più l'aiuto promette «un riepilogo PDF dei guadagni alla fine di ogni mese», e nel codice quel PDF non esist
- **Dove.** `app/rider/help/page.tsx:51,53,55,62-63 · app/lavora-con-noi/page.tsx:30-35 · app/rider/onboarding/page.tsx:22,280 · lib/constants.ts:55-57,100 · lib/shipping.ts:73-77 · app/api/cron/release-payouts/route.ts:404-406`
- **Rimedio.** Sistemare i testi perché nascano dai numeri veri: compenso = COMPENSO_RIDER_CENTS, tempi = quelli del giro dei bonifici. Togliere il PDF mensile, o dire che non c'è. Sulla polizza va presa una decisione: se la copertura la deve avere il fattorino, la FAQ deve dirlo; se la fa MyCity, l'iscrizione non deve chiederla. La copertura INAIL dei fattorini va verificata con il consulente del lavoro. Da PM, visto che la decisione è consegne in proprio fino a circa 30 ordini al giorno: finché non servono fattorini per i picchi, toglierei «Diventa rider» da «Lavora con noi».
- *Visto anche da altre corsie (frontend-rider-admin, prodotto-completezza): schede unite.*

### R31 · Lo Storico consegne dice al fattorino che ha guadagnato zero sulle spese sopra i 30 euro

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Lo Storico somma shipping_cost, cioè quanto ha pagato il CLIENTE per la spedizione, non il compenso del fattorino. Sopra i 30 € di spesa la spedizione è gratis, quindi quelle consegne compaiono a «+0,00 €». Sotto i 30 € compare la tariffa a distanza pagata dal cliente invece dei 3 € fissi. È lo stesso errore già corretto nella pagina Guadagni (#163) e nella scheda ordine, rimasto nella pagina sorella.
- **Dove.** `app/rider/history/page.tsx:53 (non legge rider_fee_cents), :61 (totale = somma di shipping_cost), :71 (totale del giorno), :118 («+» per consegna = shipping_cost) · lib/shipping.ts:97-102 (compensoConsegnaEuro, la regola giusta) · lib/guadagni/fattorino.ts:9-15 (lo stesso errore, già corretto in Guadagni) · migrations/127_minori_22_agosto.sql:740-741 (la vista porta già rider_fee_cents)`
- **Rimedio.** Aggiungere rider_fee_cents alla select della vista (la colonna c'è già) e usare compensoConsegnaEuro(o) in :61, :71 e :118. Aggiungere una prova unitaria con un ordine sopra soglia (shipping_cost 0, rider_fee_cents 300 → 3 €).

### R32 · Se il GPS del fattorino perde il segnale, la pagina dice «posizione spenta» ma continua a mandarla, anche dopo la consegna

**Gravità:** grave · **Area:** Mobile e app · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Quando il GPS dà un errore (galleria, tromba delle scale, segnale perso), la pagina del fattorino mostra un avviso e torna a dire «Attiva il GPS per il cliente». Ma la sorveglianza della posizione non viene chiusa: appena il segnale torna, il browser riprende a consegnare posizioni e la pagina le scrive sull'ordine. Se il fattorino tocca di nuovo «Attiva», nasce una seconda sorveglianza e la prima resta orfana. A fine consegna «Ferma» chiude solo la seconda. Quella orfana continua a scrivere la posizione del fattorino sull'ordine appena consegnato ogni 30 secondi, finché l'app resta aperta, cioè per tutto il turno. Il guardiano del database che cancella la posizione a ordine chiuso scatta so
- **Dove.** `app/rider/orders/[id]/page.tsx:219-246 (startSharing: crea una nuova sorveglianza e sovrascrive watchIdRef senza chiudere la precedente) · app/rider/orders/[id]/page.tsx:239-242 (errore: toast 'Errore GPS: ' + err.message e setSharing(false), senza clearWatch) · app/rider/orders/[id]/page.tsx:249-255 (stopSharing chiude solo l'ultima) · app/rider/orders/[id]/page.tsx:229-237 (scrive rider_lat/rider_lng sull'ordine `id` catturato) · migrations/126_radiografia_22_agosto.sql:335-336 (il guardiano che cancella la posizione scatta solo su UPDATE OF delivery_status) · migrations/011_orders_delivery.`
- **Rimedio.** Nel codice: ① nell'errore, se il codice è PERMISSION_DENIED chiamare clearWatch e mettere sharing=false; per gli errori passeggeri (2 e 3) lasciare la condivisione accesa e mostrare in italiano «Segnale GPS debole, riprovo da solo». ② In startSharing chiudere la sorveglianza esistente prima di crearne una nuova. ③ Nel callback non scrivere più se l'ordine è DELIVERED o CANCELED. Nel database: applicare la 161 (già accodata) e far scattare il guardiano su ogni UPDATE (togliere «OF delivery_status»), così una posizione scritta su un ordine chiuso viene comunque cancellata.

### R33 · Se il fattorino conferma la consegna prima dei contanti, l'incasso resta in sospeso e il negozio non viene pagato

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Negli ordini pagati in contanti ci sono due conferme separate: il codice di consegna e l'incasso. Il database accetta la consegna senza l'incasso. Appena il codice è giusto, la pagina torna da sola alla bacheca dopo un secondo, e la bacheca non mostra nessun «incasso da confermare». Senza incasso confermato la rimessa serale salta quell'ordine e il negozio non viene pagato. Dopo 7 giorni il fattorino non può più rimediare, e nel pannello non esiste un'azione per registrare l'incasso al suo posto.
- **Dove.** `app/rider/orders/[id]/page.tsx:189-207 (verifyDelivery: dopo il codice giusto setTimeout(() => router.push('/rider'), 1000) a :206) · app/rider/orders/[id]/page.tsx:485-508 (riquadro «Conferma incasso» dentro il contenuto, sotto mappa, scheda e GPS) · app/rider/orders/[id]/page.tsx:557-591 (barra fissa con «Conferma consegna») · migrations/127_minori_22_agosto.sql verify_delivery_code (porta a DELIVERED senza guardare cash_confirmed_at) e confirm_cod_remittance (~657-672: salta gli ordini con cash_confirmed_at nullo) · app/rider/page.tsx:232 (myActive esclude DELIVERED: nessun promemoria) · mi`
- **Rimedio.** In app/rider/orders/[id]/page.tsx, per payment_method='cod' senza cash_confirmed_at: «Conferma consegna» apre prima il dialogo dell'incasso, oppure il dialogo si apre subito dopo il codice giusto al posto del redirect. Aggiungere in bacheca la sezione «Incassi da confermare» (consegnati, cod, cash_confirmed_at nullo). Come rete di sicurezza: una migrazione che fa rifiutare a verify_delivery_code la chiusura dei 'cod' senza incasso, e un'azione admin «registra incasso dichiarato» con traccia.

### R34 · Un fattorino con patente o assicurazione scaduta continua a prendere consegne, e il profilo gli dice solo «In scadenza»

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** M

- **Cosa succede.** L'onboarding chiede patente e polizza RC con la data di scadenza, ma nessuno legge quelle date dopo l'approvazione. Nessun controllo nella presa dell'ordine, nessun lavoro automatico, nessun avviso all'admin. Il profilo mostra un documento già scaduto come «Scade 31/10/2026 · In scadenza» in giallo, non «Scaduto». Il fattorino può anche cambiare da solo la data di scadenza dal modulo di onboarding, senza caricare una polizza nuova, perché le colonne sono fra quelle che può modificare.
- **Dove.** `app/rider/profile/page.tsx:119 (soon = scadenza a meno di 60 giorni, comprese quelle già passate), :121-131 («Scade <data>»), :134 («Verificato» appena caricato il documento), :145 (etichetta «In scadenza») · migrations/119_radiografia_18_agosto.sql:93 (il fattorino può riscrivere da solo le date di scadenza) · migrations/127_minori_22_agosto.sql enforce_order_update_rules (la presa in carico guarda solo is_rider_approvato())`
- **Rimedio.** Migrazione: is_rider_approvato() (usata dalla presa in carico) restituisce falso se rider_license_expires_on o rider_insurance_expires_on sono passate. Togliere le due date dalla lista dei campi modificabili dopo l'approvazione: un aggiornamento passa da un nuovo caricamento e da un nuovo esame. Nel profilo aggiungere lo stato «Scaduto» rosso e il blocco esplicito. Avviso automatico all'admin 15 giorni prima della scadenza.

### R35 · Metà del logo e il pulsante «Accedi» nella testata hanno lo stesso colore dello sfondo e non si vedono

**Gravità:** grave · **Area:** Accessibilità visiva · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La regola globale `a { color: var(--primary-700) }` (globals.css:194) colora ogni link di #A03B25. La testata ha proprio quello sfondo (`bg-primary-700 text-white`, Navbar.tsx:121). Il logo e «Accedi» sono link senza una classe di colore propria. Il bianco del contenitore quindi non arriva fino a loro: vince la regola dei link. Risultato: «City» del logo (il pezzo non avvolto nello span color senape) e la scritta «Accedi» escono terracotta su terracotta, contrasto 1,00:1, cioè invisibili. Succede su tutte le 21 pagine provate e a tutte e tre le larghezze. Il logo si legge «My». Su computer, dove la barra in basso non c'è, l'unico «Accedi» visibile per un ospite è questo, e non si vede. Nel p
- **Dove.** `app/globals.css:194 · components/Navbar.tsx:127-129 · components/Navbar.tsx:144 · components/Navbar.tsx:217-219 · components/Navbar.tsx:245`
- **Rimedio.** In Navbar.tsx aggiungere `text-white` ai due Link del logo (righe 127 e 217) e ai due Link «Accedi» (righe 144 e 245). In alternativa avvolgere `{branding.wordmark.rest}` in `<span className="text-white">` come fa già AdminSidebar.tsx:87. A lato: aggiungere un test visivo o di contrasto sulla testata, così la regola globale dei link non può più spegnerla in silenzio.

### R36 · Dalla chat Assistenza un alimento creato dalle foto si pubblica scrivendo «pubblica», senza mostrare gli allergeni e senza i controlli del modulo

**Gravità:** grave · **Area:** Endpoint AI · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Il modulo prodotto, prima di pubblicare, blocca se mancano i campi obbligatori della categoria: per gli alimenti Allergeni e Ingredienti (Reg. UE 1169/2011). La chat Assistenza ha una strada sua: legge le foto, crea una bozza con gli attributi che il modello ha dedotto (allergeni compresi), e poi suggerisce lei stessa di scrivere «pubblica». Il comando diventa una modifica status=available che resolveAiPatch accetta senza guardare i campi obbligatori. Nella scheda della bozza il negoziante vede nome, prezzo, categoria, descrizione e tag, ma non vede mai gli allergeni. Due esiti, entrambi sbagliati. Se il modello ha messo almeno un allergene, il prodotto va in vendita con allergeni non contro
- **Dove.** `components/SupportProductAssistant.tsx:247-295 e 322-327 (la chat crea la bozza e invita a scrivere «pubblica») · components/SupportProductAssistant.tsx:455-490 (la scheda bozza mostra nome, prezzo, categoria, descrizione e tag, non gli attributi) · app/api/vision/extract-product/route.ts:91-96 (il modello compila gli attributi, allergeni compresi) · lib/products/draftFromVision.ts (buildDraftProductInsert copia gli attributi nella bozza) · lib/products/aiPatch.ts:274-277 (status available accettato senza nessun controllo) · app/api/ai/catalog-apply/route.ts:124-135 · components/seller/Product`
- **Rimedio.** 1) In catalog-apply e catalog-apply-bulk, quando la modifica porta lo stato ad available, rifare lo stesso controllo dei campi obbligatori del modulo (getAttributesForCategory + required) e rispondere con l'elenco dei campi mancanti. 2) Nella scheda bozza della chat mostrare gli attributi, allergeni e ingredienti in evidenza, da confermare. 3) In catalog-apply tradurre l'errore 23514 del database nel suo messaggio invece di «Riprova». 4) Il prompt della chat non deve proporre «pubblica» per un alimento finché allergeni e ingredienti non sono confermati dal negoziante.

### R37 · Il modello AI che legge le foto e scrive le schede si spegne il 30 novembre: dodici funzioni smetteranno di rispondere

**Gravità:** grave · **Area:** Endpoint AI · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il sito usa due modelli Anthropic. Quello «grande» ('claude-sonnet-4-5', cioè claude-sonnet-4-5-20250929) serve a tutte le funzioni che guardano le foto o ragionano: foto→prodotto, creazione multipla da foto, ordine delle foto, «Migliora tutto», codice a barre, diagnosi, varianti, le due chat e il Copilot, più il controllo prezzi esterni. Anthropic lo ha dichiarato deprecato il 30/9/2026 e lo spegne il 30/11/2026. Dopo quella data ogni richiesta a quell'id fallisce. Il codice non ha un modello di riserva, e la mappa degli errori traduce il rifiuto in un generico «Errore nel servizio AI. Riprova.», quindi il negoziante riprova all'infinito. Anche il modello piccolo (Haiku 4.5, usato dal filtr
- **Dove.** `lib/ai/client.ts:18-22 (MODELS.vision e MODELS.smart = 'claude-sonnet-4-5') · lib/ai/client.ts:34-37 (tabella prezzi legata a quei due id) · lib/ai/run.ts:287-313 (un 404 del fornitore diventa «Errore nel servizio AI. Riprova.») · chiamanti: app/api/vision/extract-product/route.ts:295,374 · app/api/vision/extract-products/route.ts:225 · app/api/vision/photo-order/route.ts:90 · app/api/ai/improve-product/route.ts:319 · app/api/ai/barcode-lookup/route.ts:109 · app/api/ai/diagnose/route.ts:129 · app/api/ai/variants/route.ts:130 · app/api/ai/product-chat/route.ts · app/api/ai/catalog-chat/route.ts`
- **Rimedio.** Cambiare MODELS.vision e MODELS.smart nel modello attivo indicato da Anthropic, aggiungendo la sua riga in PRICE_PER_MTOK con il prezzo letto dalla pagina prezzi ufficiale, senza stimarlo. Poi fare una prova vera di foto→prodotto. Aggiungere a mapAiError un ramo 404/not_found con un messaggio onesto («funzione AI momentaneamente non disponibile») e un log d'allarme. Mettere in calendario il controllo del 15/10 su Haiku 4.5. Nessun parametro deprecato (temperature/top_p) è usato oggi, quindi il cambio non rompe le chiamate.

### R38 · Il negoziante chiede in chat di cambiare un prezzo, la chat risponde «Modifiche salvate» e il prezzo resta quello vecchio

**Gravità:** grave · **Area:** Endpoint AI · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La chat «Modifica un prodotto con l'AI» (dentro Assistenza) e il Copilot del catalogo passano il prezzo da un freno: se il nuovo prezzo si scosta più del 30% da quello attuale, il server non lo scrive. Il motivo («prezzo NON applicato… va deciso a mano») finisce però solo nell'elenco changed, che nessuna delle due schermate legge. Se insieme al prezzo cambia anche un'altra cosa, la scheda della chat mostra «Prezzo: 8,00 → 12,00» con la spunta «Modifiche salvate», e il Copilot scrive «Applicato a N prodotti su N». Il prezzo invece non è cambiato. Se cambia solo il prezzo, arriva un generico «Nessuna modifica valida da applicare», senza il perché. Il modulo prodotto invece il motivo lo mostra 
- **Dove.** `lib/products/aiPatch.ts:170-181 · app/api/ai/catalog-apply/route.ts:89-91 e 153-157 · components/SupportProductAssistant.tsx:86-88, 211-233, 423-426 · app/api/ai/catalog-apply-bulk/route.ts:100-116 e 177 · components/seller/CatalogCopilot.tsx:128-131 · app/api/ai/catalog-chat/route.ts:48-72`
- **Rimedio.** 1) catalog-apply: quando update è vuoto, rispondere con il motivo contenuto in changed. 2) Restituire a parte i campi rifiutati (es. rifiutati: [...]) anche da catalog-apply-bulk, per prodotto. 3) SupportProductAssistant e CatalogCopilot: mostrare i rifiuti nella scheda, mettere la spunta solo sui campi scritti, e nel Copilot contare come parziale una modifica col prezzo scartato. 4) Nel prompt di catalog-chat e copilot dire al modello che oltre il 30% il prezzo va cambiato dal modulo, così lo dice prima.

### R39 · In produzione tutti i pulsanti di intelligenza artificiale del negozio rispondono «servizio non configurato», a partire dal primo prodotto

**Gravità:** grave · **Area:** Endpoint AI · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** La pagina «Nuovo prodotto» si presenta con «Compila la scheda — o lascia che l'AI la prepari per te da foto, voce o link». Mette in cima la creazione da foto (BulkPhotoCreate) e l'importazione da link, e nel modulo ci sono altri pulsanti AI: voce, assistente, riempi da foto, migliora tutto, copilota del catalogo. In produzione però la chiave ANTHROPIC_API_KEY non c'è. Ogni rotta AI lancia AiConfigError e risponde 503 «Servizio AI non configurato.». L'interfaccia mostra comunque tutti i pulsanti: non sa che il servizio è spento. La mancanza di questa chiave non fa parte delle 9 chiavi già segnalate (Supabase/Stripe/Resend/Upstash) e non risulta in nessuna card.
- **Dove.** `app/seller/products/new/page.tsx:207-226 (sottotitolo «lascia che l'AI la prepari per te da foto, voce o link» + BulkPhotoCreate e ImportFromUrlBox in testa) · lib/ai/client.ts:108-130 (AiConfigError) · app/api/ai/description/route.ts:117 · app/api/ai/catalog-create/route.ts:112`
- **Rimedio.** Raccomandazione: decide Nicola, perché è una spesa. Se l'AI fa parte del lancio, aggiungere ANTHROPIC_API_KEY su Vercel (Production), con il budget già previsto in AI_GLOBAL_DAILY_BUDGET_EUR. Se non ne fa parte, esporre al client un segnale «AI disponibile» (es. NEXT_PUBLIC_AI_ATTIVA o una rotta /api/ai/stato). Con quel segnale si nascondono BulkPhotoCreate, ImportFromUrlBox, i pulsanti voce/foto/assistente e il sottotitolo che promette l'AI.

### R40 · L'AI può mettere un «prezzo pieno» barrato preso dal mercato, e la pagina mostra uno sconto che il negozio non ha mai fatto

**Gravità:** grave · **Area:** Endpoint AI · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il prezzo proposto dall'AI passa da una banda del 30%. Il «prezzo pieno barrato» (compare_at_price) no: qualunque valore positivo proposto dal modello entra nel modulo o nel database. «Migliora tutto» ha la ricerca web accesa e la regola «compare_at_price SOLO se esiste uno sconto reale (prezzo pieno > prezzo)». Ma il modello non conosce lo storico prezzi del negozio: per lui un prezzo di listino trovato online è «reale». La pagina prodotto e la card trasformano poi quel numero in un badge «-X%» e in «Risparmi €…». Per l'art. 17-bis del Codice del Consumo (Omnibus), il prezzo precedente di uno sconto annunciato deve essere il più basso praticato dal venditore nei 30 giorni prima. Nel codice 
- **Dove.** `app/api/ai/improve-product/route.ts:55 (il modello, con la ricerca web accesa, può proporre compare_at_price) · lib/ai/patchSchema.ts:13-16 (compare_at_price in tutti gli schemi AI: chat, copilot, SEO, diagnosi) · lib/products/aiPatch.ts:182-189 (accettato se > 0, senza banda né storico) e :139-149 (patchAiPerIlForm frena solo `price`) · components/seller/ProductForm.tsx:454-459 · app/product/[id]/page.tsx:413-416, 600, 781-784 (badge «-X%» e «Risparmi …») · components/ProductCard.tsx:58-64`
- **Rimedio.** Togliere compare_at_price dagli schemi delle rotte AI (PROPRIETA_EDITORIALI e patchSchema), come già fatto per stock e stato, e scartarlo in resolveAiPatch/patchAiPerIlForm quando arriva dall'AI. Lo sconto barrato resta una scelta manuale del negoziante. A parte, per @legale-privacy e @backend-dev: uno storico prezzi a 30 giorni da cui derivare il prezzo barrato.

### R41 · «Migliora tutto il catalogo» può scrivere allergeni e ingredienti indovinati dal nome sopra quelli del negoziante, che li applica senza vederli

**Gravità:** grave · **Area:** Endpoint AI · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Per gli alimentari, «Allergeni» e «Ingredienti» sono campi obbligatori. Esistono apposta perché il Reg. UE 1169/2011 vuole quella dichiarazione, fatta dal produttore, prima dell'acquisto. Il lavoro massivo «Migliora tutto» manda al modello solo il testo della scheda (nessuna foto e nessuna etichetta), più l'elenco degli attributi della categoria, e gli chiede di compilare gli attributi mancanti. Il risolutore delle modifiche AI non ha nessuna lista di campi protetti. Può scrivere un elenco allergeni dedotto dal nome, sovrascrivere quello che il negoziante aveva dichiarato, e mettere a «vero» caselle come «Senza lattosio» o «Senza glutine». L'anteprima del lavoro mostra per ogni prodotto solo
- **Dove.** `lib/ai/catalogBatch.ts:128 (prompt «Migliora la scheda… attributi mancanti») · lib/ai/catalogBatch.ts:189-205 (al modello si passa l'elenco attributi della categoria, allergeni e ingredienti compresi, senza foto) · lib/products/aiPatch.ts:240-258 (qualunque attributo di testo o casella viene scritto, anche sopra il valore esistente) · app/seller/products/ai-batch/page.tsx:447-454 (anteprima: solo «summary» o «Modifiche proposte», nessun valore) e :378 («Applica a tutti») · app/api/ai/catalog-batch/apply/route.ts:176-205 · migrations/126_radiografia_22_agosto.sql:528-531 (il guardiano del datab`
- **Rimedio.** In lib/products/aiPatch.ts, una lista CAMPI_DICHIARATIVI (allergeni, ingredienti, valori_nutrizionali, senza_glutine, senza_lattosio, vegano, bio, origine, scadenza) che resolveAiPatch scarta sempre, sia in scrittura sia in attributes_remove, e che senzaCampiEconomici estende. Nel modulo, quei campi dall'AI si mostrano come proposta da confermare a mano. L'unica eccezione ammessa è la lettura dell'etichetta in foto (vision). Prompt del lotto: «non compilare allergeni/ingredienti». Una prova vitest che fallisca se il patch li scrive.

### R42 · «Traduci» sostituisce l'italiano invece di aggiungere una lingua, e sul catalogo intero lo cancella per tutti i clienti

**Gravità:** grave · **Area:** Endpoint AI · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Il prodotto ha un solo nome e una sola descrizione: non esiste una tabella delle traduzioni né campi per lingua (il grep di product_translations/name_en non trova niente, e il cambio lingua del sito è finto, K82). La funzione «Traduci» chiede al modello la versione inglese, francese, tedesca… e la scrive al posto dell'italiano. Nel modulo lo fa nei campi. Nel lotto «Traduci» con «Applica a tutti» lo fa direttamente nel database su tutti i prodotti. I tag diventano parole straniere. Nessun avviso dice che l'italiano verrà sostituito, e non c'è un «annulla»: il valore precedente resta solo nel registro audit, che il negoziante non vede.
- **Dove.** `components/seller/QuickAiTools.tsx:96-108 (la traduzione viene scritta nei campi nome/descrizione/tag del modulo) · app/api/ai/translate/route.ts:105-124 (restituisce un patch su name/description/tags) · lib/ai/catalogBatch.ts:153-160 (operazione 'translate' del lotto) · app/seller/products/ai-batch/page.tsx:56 («Traduce nome, descrizione e tag in un'altra lingua»), :410-421 (scelta lingua) e :378 («Applica a tutti») · app/api/ai/catalog-batch/apply/route.ts:176-205 (scrive il patch sul prodotto)`
- **Rimedio.** Subito: nascondere «Traduci» (pulsante del modulo e operazione del lotto) finché il sito è solo in italiano, decisione da prendere con Nicola. Se la funzione serve: colonne o tabella `product_translations(product_id, lang, name, description, tags)`, con la traduzione scritta lì e mai sui campi base. In ogni caso un avviso esplicito e un «ripristina» basato sul campo `prima` già salvato nell'audit.

### R43 · Chi si iscrive e non trova l'email di conferma resta chiuso fuori: «Reinvia» è sempre spento e l'accesso gli dice «password sbagliata»

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** In produzione la conferma dell'email è accesa: la corsia email l'ha misurato oggi (N223), 6 utenti su 9 hanno confermato in un momento diverso dall'iscrizione. Con la conferma accesa, subito dopo l'iscrizione Supabase non apre nessuna sessione. Il sito però manda il cliente su /auth/verify-email, e quella pagina ricava l'email solo dalla sessione con supabase.auth.getUser(). Il risultato: email = null, il testo dice «Ti abbiamo inviato un link di conferma a la tua email» e il pulsante «Reinvia email di verifica» è disabilitato (disabled={resending || !email}). Sotto c'è anche un «Esci» per una persona che non è mai entrata. La seconda porta è chiusa allo stesso modo. Se la persona prova ad a
- **Dove.** `app/auth/verify-email/page.tsx:24-30,32-39,67-73 · app/sign-up/page.tsx:178 · app/api/auth/signin/route.ts:53-56 · app/sign-in/page.tsx:143-147`
- **Rimedio.** (1) Dalla registrazione passare l'email alla pagina di verifica (sessionStorage, oppure ?email= solo come precompilazione). Se manca, mostrare un campo email: così «Reinvia» funziona sempre. (2) In /api/auth/signin riconoscere error.code === 'email_not_confirmed' e rispondere EMAIL_NOT_VERIFIED. Lato pagina, portare a /auth/verify-email con l'email già scritta. (3) Togliere «Esci» quando non c'è sessione. Effetto atteso: il ripescaggio di chi non ha confermato passa da zero a quasi tutti quelli che ci riprovano.

### R44 · Il controllo all'ingresso chiude fuori chi aspetta l'approvazione: il negozio nuovo gira in tondo e il fattorino non arriva mai alla pagina dei documenti

**Gravità:** grave · **Area:** Sicurezza e accessi · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il middleware (il «portiere» che decide chi entra nelle pagine) sulle aree /seller e /rider pretende is_approved = true, e chi non è approvato viene rimandato altrove. Per un negozio non approvato la destinazione è /seller/dashboard. Ma anche quella pagina sta sotto /seller, quindi la regola scatta di nuovo: il browser gira in tondo finché si arrende con «troppi reindirizzamenti». Lo stesso succede alla home e a ogni pagina del catalogo, perché il negozio senza «modalità acquisto» viene mandato lì. Per un fattorino non approvato la destinazione è la home. Però l'unico modulo dove manda patente, assicurazione e data di nascita per farsi approvare è /rider/onboarding, che sta sotto /rider. Le 
- **Dove.** `middleware.ts:581-587 · middleware.ts:570-577 · app/seller/layout.tsx:130-145 · app/rider/layout.tsx:9-20 · app/rider/onboarding/page.tsx:61-75 · app/rider/profile/page.tsx:27`
- **Rimedio.** In middleware.ts, separare «ruolo sbagliato» da «ruolo giusto ma non ancora approvato». Ruolo sbagliato: si resta come oggi. Non approvato: si lascia passare su /seller/dashboard, dove il layout mostra la schermata di attesa o di rifiuto, e su /rider/onboarding e /rider/profile. Ai negozi non approvati che vanno sul catalogo si toglie il rimando a /seller/dashboard. Le API restano protette: withSellerAuth controlla già is_approved. Aggiungere due prove in tests/unit, una per l'anello e una per il rider in attesa su /rider/onboarding.
- *Visto anche da altre corsie (frontend-rider-admin, sicurezza-auth): schede unite.*

### R45 · Il cliente può scrivere al negozio, ma il negozio non viene mai avvisato e dal suo pannello non vede i messaggi

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La scheda prodotto ha il pulsante «Contatta il negozio». Apre una chat e il messaggio si salva nel database. La rotta che salva il messaggio non manda niente: nessuna email, nessuna notifica push, nessuna voce nella campanella. Il trigger del database aggiorna solo il contatore dei non letti. Quel contatore compare solo nella barra in alto e nella barra a schede del sito pubblico. Tutte e due si spengono dentro l'area negozio. Il menu del negoziante ha quattordici voci, e nessuna è «Messaggi». La pagina dei reclami spinge il cliente a «scrivere al venditore» proprio su questo canale.
- **Dove.** `app/product/[id]/page.tsx:1053 · components/ContactSellerButton.tsx:24,43-50 · app/api/chat/messages/route.ts:29-52 · migrations/026_chat_messaging.sql:96-128 · components/seller/SellerShell.tsx:30-53 · components/Navbar.tsx:93 · components/MobileTabBar.tsx:61 · app/orders/[id]/dispute/page.tsx:101`
- **Rimedio.** Per il lancio la scelta da PM è nascondere: togliere «Contatta il negozio» dalla scheda prodotto e il rimando nella pagina reclami. Al loro posto un pulsante WhatsApp o telefono verso il numero del negozio, che il fornaio usa già. Costa un'ora e rispetta il paletto WhatsApp. Se la chat deve restare: una voce «Messaggi» con contatore nel menu del negozio, più un avviso per ogni nuovo messaggio nella campanella. Avviso via email o push quando le chiavi ci saranno.

### R46 · Chi vuole scaricare i propri dati o cancellarsi non ha nessuna strada che funzioni in produzione

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** impostazioni di Vercel (🔴, tu) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** L'informativa manda i diritti GDPR a due posti: «Impostazioni → Privacy» (pulsanti Scarica i miei dati e Cancella account) e «il modulo dei contatti». In produzione manca SUPABASE_SERVICE_ROLE_KEY: /api/contact chiama getAdminSupabase() fuori da ogni try, e requireSupabaseService lancia, quindi il modulo risponde errore 500; /api/account/export e /api/account/delete rispondono 503 «Servizio non configurato». Il pulsante «Contatta il responsabile privacy» nelle impostazioni e la cookie policy mostrano privacy@mycity-marketplace.com, che è il ripiego scritto nel codice: la stessa pagina privacy si rifiuta di mostrarlo perché, dice il commento R053, non è detto che riceva. Nel database contact_
- **Dove.** `app/privacy/page.tsx:41-44 (rimanda al modulo contatti) · app/api/contact/route.ts:53-55 · lib/env.ts:238-243 · app/api/account/export/route.ts:42-45 · app/api/account/delete/route.ts:29-32 · app/profile/settings/page.tsx:552-566 · app/cookies/page.tsx:139 · lib/legal/titolare.ts:117`
- **Rimedio.** Configurare SUPABASE_SERVICE_ROLE_KEY (card #154) e NEXT_PUBLIC_TITOLARE_EMAIL_PRIVACY con una casella vera. Nel codice: impostazioni e cookie policy devono usare recapitoPrivacy() come la pagina privacy, e /api/contact deve rispondere 503 leggibile invece di lanciare.

### R47 · Le segnalazioni di contenuti illeciti finiscono in un archivio che nessuno può aprire: la pagina admin a cui porta l'avviso non esiste

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Il regolamento europeo sui servizi digitali (DSA) obbliga chiunque ospiti contenuti altrui a fare tre cose con le segnalazioni. Deve esaminarle con tempestività e diligenza (art. 16.6). Deve comunicare l'esito a chi ha segnalato (art. 16.5). Deve dare una motivazione scritta al venditore colpito (art. 17). Questi articoli valgono anche per le microimprese. Il pulsante «Segnala questo contenuto» esiste e scrive nella tabella «segnalazioni». Nessuna pagina e nessuna rotta del sito però legge quella tabella, né scrive stato, esito o decisione. Le parole esito_motivato, deciso_da e in_esame non compaiono in nessun file di app, lib o components. L'avviso agli amministratori porta a /admin/segnala
- **Dove.** `app/api/segnalazioni/route.ts:63-75 (scrive nella tabella) e :104-110 (avviso con link '/admin/segnalazioni') · components/Segnala.tsx:58 (al cliente: «La guardiamo e ti diciamo com'è andata») e :113-120 (solo l'email, facoltativa) · app/terms/page.tsx:434-437 e :450-455 (promessa di esito motivato e di comunicazione scritta al venditore) · migrations/126_radiografia_22_agosto.sql:426-442 (colonne stato, esito_motivato, deciso_da) · .next/app-path-routes-manifest.json (nessuna rotta /admin/segnalazioni)`
- **Rimedio.** Creare /admin/segnalazioni: elenco delle segnalazioni ricevute e in esame, decisione accolta o respinta con motivazione obbligatoria. Al salvataggio scrivere stato, esito_motivato, deciso_da e deciso_at. Mandare l'email con l'esito a chi ha segnalato, se ha lasciato un recapito, e la motivazione al venditore. Nel modulo aggiungere il nome (facoltativo per chi segnala abusi su minori) e la casella «dichiaro in buona fede che le informazioni sono esatte».
- *Visto anche da altre corsie (frontend-rider-admin, privacy-legale): schede unite.*

### R48 · Nessuno vede l'orario di consegna scelto dal cliente: né il negozio, né il fattorino, né il cliente stesso

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** In cassa il cliente deve scegliere quando ricevere la spesa («Domani · 9:00–12:00», «Stasera · 18:00–20:00»…). La scelta viene salvata sull'ordine, ma la usano solo due controlli automatici: quello «negozio chiuso» e il lavoro notturno che annulla gli ordini non accettati. Nessuna schermata la mostra alle persone che devono rispettarla. La pagina ordine del negozio non la legge e l'avviso «Nuovo ordine!» non la scrive. La bacheca del fattorino la scarica ma non la mostra. Non la nominano nemmeno la pagina ordine del cliente, il pannello amministratore e le email. In più l'etichetta salvata è relativa («Domani»): letta il giorno dopo indicherebbe il giorno sbagliato.
- **Dove.** `app/api/orders/cod/route.ts:738 (salvato in orders.delivery_slot) · app/api/orders/cod/route.ts:859-862 (avviso «Nuovo ordine!» senza fascia) · lib/stripe/webhook/ordini.ts:317 (salvato, ramo carta) · app/seller/orders/[id]/page.tsx:142 (la pagina del negozio non la legge) · app/rider/page.tsx:41,118 (letta ma mai mostrata) · app/rider/orders/[id]/page.tsx:88 (non letta) · app/orders/[id]/page.tsx (mai usata) · lib/quando-arriva.ts:47-57 (etichette relative «Domani · 9:00–12:00»)`
- **Rimedio.** Mostrare la fascia in tre posti: pagina e lista ordini del negozio, scheda e bacheca del fattorino, pagina ordine del cliente. Aggiungerla anche alla notifica e all'email «Nuovo ordine». Quando l'ordine nasce, salvare la fascia come data assoluta (es. «mar 13/10 · 9:00–12:00») o in due colonne inizio e fine. Aggiungere una prova che apre la pagina del negozio con un ordine che ha la fascia e ne controlla il testo.

### R49 · Se il negoziante segna chiusi tutti i giorni, per esempio per ferie, il sito lo considera sempre aperto e accetta ordini a qualsiasi ora

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il sito non ha un pulsante «pausa ordini» o «ferie». Per dire «sono chiuso», il negoziante può solo premere «Chiudi» sui giorni dell'editor degli orari. Il banner degli annunci suggerisce proprio «Chiusi per ferie». Il codice però non distingue «orari mai inseriti» da «tutti i giorni chiusi». Con sette giorni vuoti il codice conclude che gli orari non sono mai stati inseriti (`configured` falso). Allora il negozio «può servire» sempre, a qualsiasi ora e su qualsiasi fascia. Intanto la vetrina scrive «Chiuso oggi».
- **Dove.** `lib/store-hours.ts (negozioPuoServire: `if (!configured) return true`; isStoreClosedForOrder: `if (!configured) return false`) · components/seller/StoreHoursEditor.tsx:89-95 («Chiudi» mette il giorno a lista vuota) · components/seller/AnnouncementEditor.tsx:38 (suggerisce «Chiusi per ferie dal 10 al 20 agosto») · app/api/orders/cod/route.ts:418-422 · app/api/stripe/checkout/route.ts (stesso controllo) · components/seller/SellerOnboardingChecklist.tsx:92`
- **Rimedio.** Distinguere «orari mai inseriti» (vuoto o senza chiavi) da «inseriti e tutti vuoti», che vuol dire chiuso. Aggiungere al profilo del negozio un interruttore «Sospendi gli ordini fino al…», letto dalle due rotte d'ordine e dalla vetrina. Nell'editor avvisare quando tutti i giorni sono chiusi. Aggiungere una prova unitaria: sette giorni vuoti, risposta attesa false.

### R50 · Il dettaglio di un ordine nel pannello admin non esiste: ogni link «ordine» e ogni allarme portano a una pagina non trovata

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Nel sito non esiste la pagina di dettaglio di un ordine per l'amministratore (/admin/orders/<id>). Eppure la linkano quattro schermate (elenco ordini, «Oggi», bonifici) e tutti gli allarmi automatici: ordine fermo in «nuovo», fattorino fermo, pronto senza fattorino, consegna stallata, reso fermo da 7 giorni. Il link «[apri]» nella mail degli allarmi porta allo stesso indirizzo. Risultato: chi gestisce l'assistenza non vede mai articoli, indirizzo, telefono del cliente, stato del pagamento né codice di consegna. L'unica azione possibile su un ordine è «Annulla», dall'elenco.
- **Dove.** `app/admin/orders/page.tsx:233 · app/admin/today/page.tsx:198 · app/admin/payouts/page.tsx:221 · app/api/cron/operational-alerts/route.ts:86,108,132,172,201,244,424 e :636 (link «[apri]» nella mail agli amministratori) · app/admin/orders/page.tsx:246-257 (unica azione: Annulla) · .next/server/app/admin/orders/ (c'è solo page.js, nessun [id])`
- **Rimedio.** Creare app/admin/orders/[id]/page.tsx. Deve mostrare: articoli, indirizzo e telefono di consegna, fascia scelta, pagamento e rimborsi, fattorino, codice di consegna (la regola d'accesso «Admin reads delivery codes» c'è già) e il reso collegato. Azioni minime: annulla, riassegna/libera il fattorino, segna consegnato con motivo scritto. Una prova automatica deve fallire se un link interno punta a una rotta che il build non contiene.
- *Visto anche da altre corsie (frontend-rider-admin, ordini-ciclo-vita): schede unite.*

### R51 · L'amministratore approva i fattorini alla cieca: il pannello non mostra patente, polizza, documento né età

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** In produzione non c'è un servizio di verifica automatica: il codice usa ManualReviewKycProvider, che lascia tutto PENDING. Quindi l'unico controllo vero è l'occhio dell'amministratore. Ma il pannello «Esamina» è lo stesso dei negozi: titolo «Richiesta venditore», righe Vetrina, Azienda, P.IVA, PEC. Per un fattorino sono tutte «—». Non c'è nessun collegamento ai file caricati (documento fronte/retro, selfie, patente, polizza RC), né data di nascita, veicolo, targa, scadenza di patente e polizza. Ho cercato quelle colonne in app/admin, components/admin, app/api/admin e lib/admin: l'unica lettura è legal_birth_date dentro la rotta di moderazione, per il controllo dei 18 anni.
- **Dove.** `app/admin/users/page.tsx:1031-1085 (DetailPanel: titolo «Richiesta venditore», solo campi di negozio e azienda) · app/admin/users/page.tsx:383-393 (i rider sono moderabili) · lib/kyc/providers.ts:140-143 (in produzione verifica solo manuale, stato PENDING) · app/api/kyc/start-check/route.ts:69-72`
- **Rimedio.** Un pannello di esame per i rider: link ai documenti tramite URL firmati a scadenza breve (generati da una rotta admin), età calcolata, veicolo e targa, scadenze di patente e polizza evidenziate. Approva disabilitato se mancano i documenti obbligatori o se sono scaduti. La parte server (URL firmati) va fatta con @backend-dev.

### R52 · Nel pannello admin rimesse, bonifici, reclami, assistenza e prodotti dicono «non c'è niente» quando in realtà non sono riusciti a leggere

**Gravità:** grave · **Area:** Stati dell'interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** In cinque pagine admin un errore di lettura viene mostrato come un elenco vuoto. Rimesse, reclami e assistenza fanno «const { data } = await …» senza guardare l'errore. Payout e prodotti lanciano l'errore, ma la pagina non ha un ramo d'errore e usa il valore di default []. Il risultato è «Nessuna rimessa COD in attesa», «Nessun payout da riconciliare» con 0,00 € in tutti i riquadri, «Nessun reclamo in questo stato», «Nessun messaggio» oppure «0 di 0» prodotti. È lo stesso difetto già chiuso su coupon e sponsorizzati (K127) e aperto sulla lista ordini (K175), ma in pagine diverse da quelle: qui ci sono due pagine di soldi.
- **Dove.** `app/admin/cod-remittance/page.tsx:69 e :152 · app/admin/payouts/page.tsx:89-105 e :172-175 (nessun ramo isError) · app/admin/disputes/page.tsx:68 e :213 · app/admin/support/page.tsx:48 e :107 · app/admin/products/page.tsx:41-53 (errore lanciato ma mai mostrato, nessuna paginazione)`
- **Rimedio.** In ogni pagina: leggere l'errore, lanciarlo e mostrare components/admin/LoadError con Riprova, come in /admin/sos e /admin/today. Per payout e prodotti, dire quando l'elenco è tagliato (limite 1000 o tetto PostgREST) e paginare i prodotti come la lista ordini.

### R53 · Il controllo che confronta il database vero col codice non si è mai collegato, e il rilascio controllato cadrà sullo stesso indirizzo

**Gravità:** grave · **Area:** Rilascio e affidabilità · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** Il lavoro quotidiano «Deriva migrazioni (produzione)», nato per accorgersi da solo quando il database vero resta indietro rispetto al codice, è rosso 52 volte su 52 dal 21/8: non ha mai confrontato niente. Usa lo stesso segreto SUPABASE_DB_URL della copia notturna e muore con ENETUNREACH sull'indirizzo IPv6. Per questo la produzione indietro di molte migrazioni (K42, e la 161 non applicata) è stata scoperta solo a mano. Lo stesso segreto è usato anche dal rilascio controllato (deploy-dopo-ci.yml:287-320 applica le migrazioni con psql, :335 rilancia il controllo di deriva): il giorno in cui si accendono i segreti Vercel per chiudere K45, il passo delle migrazioni fallirà con lo stesso errore 
- **Dove.** `.github/workflows/deriva-migrazioni-produzione.yml:57-66 · .github/workflows/deploy-dopo-ci.yml:287-320 · .github/workflows/deploy-dopo-ci.yml:335 · scripts/check-migration-drift.mjs`
- **Rimedio.** Stessa riparazione della copia notturna: SUPABASE_DB_URL su GitHub con la stringa «Session pooler» (IPv4). Poi avviare a mano «Deriva migrazioni (produzione)» e verificare che sia verde o rosso SOLO per migrazioni mancanti. Nel messaggio d'errore di deriva-migrazioni-produzione.yml:60 indicare «Session pooler». Prima di accendere i segreti Vercel, fare una prova del rilascio controllato.

### R54 · Il database di produzione non ha nessuna copia di sicurezza: la copia notturna è fallita 60 volte su 60

**Gravità:** grave · **Area:** Rilascio e affidabilità · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** La copia notturna di GitHub (unica rete di sicurezza del database) non è mai riuscita: 60 esecuzioni su 60 rosse, dalla prima del 19/8 all'ultima di stamattina. Dal 7/9 la causa è sempre la stessa: il segreto SUPABASE_DB_URL punta alla «Direct connection» db.clmpyfvpvfjgeviworth.supabase.co, che risponde solo in IPv6, e le macchine di GitHub non hanno IPv6 («Network is unreachable»). Il lavoro stesso, alla riga 120, dice di incollare proprio la «Direct connection», e docs/backup-restore.md:117 dice lo stesso: le istruzioni portano alla porta che non funziona. In più l'organizzazione Supabase è sul piano FREE, che non ha copie giornaliere gestite dal fornitore (le danno solo Pro/Team/Enterpri
- **Dove.** `.github/workflows/backup-db.yml:120 · .github/workflows/backup-db.yml:197-200 · docs/backup-restore.md:34-38 · docs/backup-restore.md:63-66 · docs/backup-restore.md:116-117 · scripts/backup-db.sh (pg_dump)`
- **Rimedio.** 1) Nicola sostituisce il segreto GitHub SUPABASE_DB_URL con la stringa «Session pooler» di Supabase (host aws-0-eu-west-3.pooler.supabase.com, porta 5432, utente postgres.clmpyfvpvfjgeviworth), che risponde in IPv4; in alternativa compra l'add-on IPv4. 2) Avvia a mano «Backup database» e controlla che il pacchetto pesi più di 170 byte. 3) Nel codice: riga 120 del lavoro e docs/backup-restore.md:117 devono indicare «Session pooler», non «Direct»; correggere le righe 34-38 e la tabella 63-66 finché la prima copia non è verde (unire o chiudere #255/#257). 4) Valutare il passaggio a Supabase Pro (

### R55 · Il riquadro «Venduto da» non compare in produzione: la migrazione che aggiunge i dati dell'impresa alla vista pubblica dei negozi non è stata applicata

**Gravità:** grave · **Area:** Rilascio e affidabilità · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** M · **Tornato dopo essere stato chiuso**

- **Cosa succede.** VendutoDa chiede alla vista seller_public_profiles business_legal_name, business_form, business_vat_number, business_address, business_city, business_zip. In produzione la vista ha solo id, store_name, store_address, store_lat, store_lng, store_phone, store_logo, store_hours, store_media, store_description, store_customization, store_site, offers_express, founded_year, is_approved, stripe_charges_enabled, stripe_payouts_enabled, role, created_at: la migrazione 126 che aggiunge i dati d'impresa non è registrata in produzione. La domanda fallisce, data resta vuoto e il riquadro non si disegna. In più i due negozi hanno ragione sociale e P.IVA vuote nel database. Novità rispetto a K42: K42 parl
- **Dove.** `components/products/VendutoDa.tsx:21-28,44-50 · migrations/126_radiografia_22_agosto.sql:364-403 · produzione: vista public.seller_public_profiles`
- **Rimedio.** Applicare in produzione la migrazione 126 insieme al recupero delle altre mancanti (firma di Nicola, migrazione rossa), poi far compilare a Pane Quotidiano ragione sociale, sede e P.IVA. Nel codice: se la lettura della vista fallisce, lasciare traccia nei log invece di sparire in silenzio.

### R56 · In produzione l'iscrizione alla newsletter va in errore, mentre la home continua a promettere 5 euro a chi si iscrive

**Gravità:** grave · **Area:** Rilascio e affidabilità · **Si ripara:** impostazioni di Vercel (🔴, tu) · **Sforzo:** S

- **Cosa succede.** La home mostra «€5 in regalo — Iscriviti e prendi €5 di sconto al primo ordine» e il piede di ogni pagina ha il modulo Iscriviti. /api/newsletter chiama getAdminSupabase() alla riga 71 fuori da ogni try: senza SUPABASE_SERVICE_ROLE_KEY lancia e la risposta è 500. Anche se l'iscrizione entrasse, la conferma parte per email e Resend non è configurato. In produzione newsletter_subscribers ha 0 righe. La causa (chiavi mancanti, card #154) è nota; la promessa pubblica che resta accesa no.
- **Dove.** `app/api/newsletter/route.ts:71 · lib/env.ts:238-243 · components/NewsletterForm.tsx:47 · produzione: site_settings.home_site sezione newsletter`
- **Rimedio.** Configurare le chiavi (card #154). Nel codice: rispondere 503 leggibile invece di lanciare, e spegnere la sezione newsletter quando il servizio non è configurato.

### R57 · La regola che dovrebbe fermare il codice rosso esiste su GitHub ma è spenta, non guarda nessun ramo e aspetta un controllo che non esiste

**Gravità:** grave · **Area:** Rilascio e affidabilità · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** K45 è ancora aperto (vercel.json ha ancora "main": true e il ramo main non è protetto). Due cose nuove. ① È già successo davvero: il 1/9 la CI su main è finita ROSSA (run 33542096803, commit 2185736, PR #245) e Vercel ha pubblicato quel commit in PRODUZIONE nello stesso secondo (dpl_76fMZSaTxjyhhVrkK3uxckZ66ueP, READY, target production). ② La «via A» scritta in deploy-dopo-ci.yml:52-58 («la protezione del ramo main … si accende in mezzo minuto») è una trappola: su GitHub esiste già un ruleset chiamato «Main», creato il 26/5, con enforcement «disabled», che non punta a nessun ramo (include vuoto) e pretende un controllo di nome «Main» che nessun lavoro della CI produce (i lavori si chiamano 
- **Dove.** `GitHub → Settings → Rules → ruleset «Main» (id 16879481) · vercel.json:6-10 · .github/workflows/deploy-dopo-ci.yml:52-58`
- **Rimedio.** In GitHub → Rules: modificare il ruleset «Main» (bersaglio: Default branch / main), sostituire il controllo «Main» con i nomi veri dei lavori CI (almeno «Lint + Typecheck + Build», «Unit tests», «Controlli database (Postgres locale, senza chiavi)») e metterlo Active. Poi fare una PR di prova con un test rosso e verificare che il pulsante Merge sia bloccato. Aggiornare il commento di deploy-dopo-ci.yml:52-58 dicendo che il ruleset esiste e va corretto, non creato.

### R58 · Ai negozi diciamo «apri gratis, nessun costo mensile» in sei punti del sito, e poi chiediamo 50 euro al mese

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il prezzo deciso per i negozi è un abbonamento di 50 euro al mese più il 10% sul venduto. Lo dice il registro dei fatti (pricing.abbonamento = «50€/mese», Nicola 11/8). Il codice lo applica davvero: il modulo d'iscrizione lo dichiara e la rotta Stripe crea un abbonamento mensile da 5000 centesimi. Però sei punti del sito dicono il contrario. La FAQ pubblica: «Quanto costa vendere? Zero commissioni mensili. Si paga solo una piccola commissione». La pagina Chi siamo: «0€ commissioni mensili per i negozi». L'anteprima di /sell su Google e WhatsApp: «Apri gratis il tuo negozio online… Nessuna commissione mensile». L'aiuto venditore: «Nessun costo mensile o di iscrizione». La pagina Guadagni: «Ne
- **Dove.** `app/faq/page.tsx:118 · app/about/page.tsx:28 · app/sell/layout.tsx:6, :10, :19 · app/seller/help/domande.ts:62 · app/seller/earnings/commissione.ts:91 · contro components/SellerApplicationForm.tsx:225, :238, :378, :403 · components/seller/SubscriptionBanner.tsx:56-62 · app/seller/layout.tsx:59, :163 · app/api/seller/subscription/checkout/route.ts:23, :97 · app/terms/page.tsx:254-258`
- **Rimedio.** Mettere il prezzo in un posto solo, accanto alla commissione in lib/constants (ABBONAMENTO_MENSILE_EUR = 50). Riscrivere le sei frasi leggendo quella costante, per esempio «50 € al mese più il 10% sul venduto che ti porta MyCity». Aggiungere l'abbonamento all'articolo commissioni dei Termini; la frase la verifica @legale-privacy. Se invece Nicola decide che l'abbonamento non parte al lancio, va spento il bottone «Attiva €50/mese» e va tolto dal modulo.
- *Visto anche da altre corsie (frontend-venditore, i18n-microcopy, pagamenti-stripe, produzione-live): schede unite.*

### R59 · Il numero di telefono +39 0523 000000 è finto: sta nella pagina Contatti e come numero d'emergenza dei fattorini

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La pagina pubblica Contatti ha la carta «Telefono +39 0523 000000 · Lun-Ven 9–18», con un link tel: cliccabile. Il commento nello stesso file, tre righe sopra, racconta che un numero finto («+39 300 000 0000») era già stato tolto e che «la carta compare solo se il numero c'è davvero». Per il telefono però non è stato fatto: lo stesso segnaposto è rimasto scritto a mano. Nella pagina d'aiuto dei fattorini quel numero è il pulsante «Emergenza · 24/7». La risposta «Sono assicurato?» dice: «per gli infortuni gravi attiva subito il supporto al 0523 000000». In produzione manca la variabile del numero WhatsApp, quindi la carta WhatsApp sparisce: il numero finto resta l'unico canale a voce.
- **Dove.** `app/contact/page.tsx:96-113 · app/rider/help/page.tsx:62-63,130-142`
- **Rimedio.** Sistemare come già fatto per WhatsApp: il numero viene da una variabile d'ambiente, e se manca la carta non compare. Nell'aiuto dei fattorini il pulsante «Emergenza» si toglie finché non c'è un numero presidiato davvero, e al suo posto si scrive «in caso di infortunio chiama il 112». Va corretta anche la frase sugli infortuni. Il numero vero lo decide Nicola.
- *Visto anche da altre corsie (design-visivo, prodotto-completezza, produzione-live): schede unite.*

### R60 · Il sito promette «Reso entro 14 giorni» e «Ti rimborsiamo senza domande» anche su pane e freschi, che sono esclusi, e non c'è modo di segnarli come esclusi

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** L'art. 59 lett. d del Codice del Consumo esclude il recesso per i beni che si deteriorano in fretta. L'art. 49 c.1 lett. m obbliga però a dirlo prima dell'acquisto. Il sito fa il contrario. Su ogni scheda prodotto e nel riepilogo della cassa scrive «Reso entro 14 giorni», senza eccezioni. In home e in «Come funziona» aggiunge «Cambi idea? Ti rimborsiamo senza domande». Questa frase è falsa anche per i prodotti non freschi: la pagina Resi dice che il ripensamento lo paga il cliente. Nel database non esiste un modo per dire «questo prodotto non è recedibile». La rotta dei resi accetta il motivo «Cambio idea» su qualunque riga d'ordine. L'unico negozio vero è un forno. Il 6/9 il carrello è stat
- **Dove.** `app/product/[id]/page.tsx:824-829 (FRASE_RESO su ogni scheda) · lib/promesse-pubbliche.ts:199 · components/checkout/OrderSummary.tsx:204-207 · components/home-sections/HomeSectionRenderer.tsx:77 · app/come-funziona/page.tsx:9 e 30 · components/Footer.tsx:327 · components/ui/AuthShell.tsx:47 · app/api/returns/create/route.ts (nessuna esclusione) · app/cart/page.tsx:768-776 (il commento che ammette «resta da fare»)`
- **Rimedio.** Migrazione e codice: aggiungere un campo «escluso dal recesso» sul prodotto, o sulla categoria alimentare fresca. Rendere condizionale la frase su scheda e cassa. Bloccare il motivo CHANGED_MIND in /api/returns/create per quei prodotti. Togliere «senza domande» da home e Come funziona. Decisione di Nicola: quali categorie sono escluse.
- *Visto anche da altre corsie (i18n-microcopy, privacy-legale): schede unite.*

### R61 · Il «Drop del giorno» in home annuncia un prezzo scontato che la cassa non applica, e il codice del «Negozio del mese» può non esistere

**Gravità:** grave · **Area:** Flussi di conversione · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Il «Drop del giorno» è solo grafica. L'admin sceglie prodotto e percentuale, e la home mostra a tutti prezzo scontato, prezzo barrato, «-20%», «Risparmi …» e il conto alla rovescia. Nessun pezzo del percorso d'acquisto (scheda prodotto, carrello, creazione ordine) legge daily_drops: il cliente paga il prezzo pieno. Il server non controlla nemmeno che il prezzo barrato sia quello vero, né che il negozio sia d'accordo. Problema simile sul «Negozio del mese»: l'admin scrive un codice e una percentuale a testo libero, home e pagina li mostrano, ma il codice non è legato alla tabella dei coupon.
- **Dove.** `components/home/DropOfDay.tsx:57-66 (legge daily_drops), :84 (risparmio arrotondato all'euro), :108-121 (prezzo scontato, prezzo barrato, -%), :139-141 (porta alla scheda prodotto) · app/admin/daily-drops/page.tsx:27 e :79-94 (drop_price calcolato nel browser) · app/api/admin/daily-drops/route.ts (salva original_price e drop_price così come arrivano) · lib/home-site.ts:43 e :212 (la sezione è nella home predefinita) · app/admin/shop-of-month/page.tsx:92-101 (codice sconto a testo libero) · components/home/ShopOfMonthHero.tsx:94-99 · app/shop-of-month/page.tsx:158-164`
- **Rimedio.** Finché il prezzo non è applicato davvero, togliere «dropOfDay» dalla home predefinita e nascondere la sezione «Sconto del mese» se il codice non corrisponde a un coupon attivo. Soluzione vera: il drop diventa uno sconto prodotto con data (letto dal calcolo prezzi lato server, quindi da scheda, carrello e ordine), con prezzo barrato calcolato dal server sul minimo dei 30 giorni e consenso del negozio. Nel «Negozio del mese» il codice si sceglie da un elenco dei coupon esistenti. Usare la data di Piacenza al posto di toISOString.

### R62 · La home promette «arriva oggi in 30-60 minuti» anche di domenica, senza guardare se un negozio è aperto

**Gravità:** grave · **Area:** Interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** In alto nella home c'è un conto alla rovescia: «Ordina entro HH:MM:SS e arriva oggi in 30-60 min». La home lo mostra senza passare gli orari di nessun negozio (storeHours), quindi la funzione promessaDiConsegna non può mai rispondere «chiuso». Il calcolo (deliveryWindow) non conosce i giorni della settimana: prima delle 18 dice «oggi» tutti i giorni, domeniche e feste comprese. La scheda prodotto invece passa gli orari e dice «chiuso, riapre…»: le due pagine si contraddicono. Il contesto: la promessa dei 30-60 minuti l'ha decisa Nicola il 21/8. Però il registro dice che non è mai stata mantenuta, con 0 consegne, e la bici è «non operativa» dal 14/7. Intanto la fascia di fiducia promette «Rid
- **Dove.** `components/home-sections/HomeSectionRenderer.tsx:167 · components/ui/DeliveryCutoff.tsx:66-118 · lib/delivery.ts:8,30-45 · components/home-sections/HomeSectionRenderer.tsx:76 · app/page.tsx:33`
- **Rimedio.** Nella home calcolare la promessa sugli orari dei negozi approvati, con la stessa funzione della scheda prodotto. Se nessuno è aperto, scrivere «Ordina ora, arriva [giorno di riapertura]». In parallelo a Nicola: confermare «Rider del territorio» e i 30-60 minuti solo quando la prima consegna vera è partita.

### R63 · La pagina Spedizioni mostra prezzi più bassi di quelli che fa pagare la cassa e scrive «gratis» dove si pagano sempre 3 euro di consegna

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** La pagina pubblica «Spedizioni e consegne» mostra una tabella di costi per fascia di distanza che non corrisponde al calcolo vero della cassa. La cassa fa 2,50 € più 1,20 € per ogni chilometro, e aggiunge 3,00 € di «costo di consegna» per negozio su ogni ordine portato a casa, anche sopra i 30 euro. La pagina invece scrive 2,50/3,50/4,50 € e «GRATIS» sopra i 30 euro, senza mai nominare i 3 euro. Dice anche «Oltre 10 km: a preventivo» e «entro 15 km», mentre il codice consegna fino a 25 km a tariffa piena, senza preventivo. La stessa forbice falsa «in media 2,50–4,50 €» sta anche nella risposta delle FAQ.
- **Dove.** `app/shipping/page.tsx:34-35 (riquadro «Spedizione GRATIS · Per ordini ≥ €30»), app/shipping/page.tsx:72-96 (tabella 0-2 km € 2,50 · 2-5 km € 3,50 · 5-10 km € 4,50 · Sopra €30 GRATIS · Oltre 10 km A preventivo) · lib/constants.ts:17-18 (SPEDIZIONE_BASE_EUR 2,5 + SPEDIZIONE_PER_KM_EUR 1,2) · lib/constants.ts:57 (RAGGIO_CONSEGNA_KM 25) · lib/constants.ts:~103 (PLATFORM_DELIVERY_FEE_CENTS 300) · lib/geo.ts:34-37 · lib/stripe/client.ts:184-196 (riga «Costo di consegna — negozio» addebitata al cliente) · lib/promesse-pubbliche.ts:157 (FAQ: «in media €2,50–4,50»)`
- **Rimedio.** Non scrivere più le cifre a mano. La tabella va generata dalle costanti, cioè SPEDIZIONE_BASE_EUR, SPEDIZIONE_PER_KM_EUR, PLATFORM_DELIVERY_FEE_CENTS e RAGGIO_CONSEGNA_KM, attraverso prezzoSpedizioneEuro e formatPrice. Il testo diventa per esempio: «2,50 € + 1,20 € al km; gratis sopra 30 € per negozio; resta sempre la consegna, 3,00 € per negozio; consegniamo entro 25 km». Il riquadro verde va riscritto con promessaSpedizione() di lib/promesse-pubbliche, e va corretta la forbice falsa in lib/promesse-pubbliche.ts:157. Infine serve una prova vitest che confronti la pagina con prezziDelCarrello.
- *Visto anche da altre corsie (design-visivo, i18n-microcopy, privacy-legale, prodotto-completezza, produzione-live): schede unite.*

### R64 · La pagina dell'unico negozio vero e l'errore di cassa offrono il «Ritiro in negozio», ma il servizio è spento

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il ritiro in negozio è spento: RITIRO_IN_NEGOZIO_ATTIVO = false e alla cassa l'opzione non c'è. I due difetti chiusi su questo tema hanno legato all'interruttore la FAQ, la pagina Spedizioni e la descrizione del negozio. Restano fuori due punti. Primo, il bollino che il negoziante sceglie da un elenco fisso: in produzione la pagina di Pane Quotidiano mostra oggi «Ritiro in negozio». Lo stesso elenco fa anche da categoria del negozio, per cui l'intestazione dice «Consegna rapida · Via Calzolai». Secondo, il messaggio che la cassa (carta e contanti) dà quando il negozio è chiuso nella fascia scelta: «Scegli un altro orario, oppure ritira in negozio».
- **Dove.** `lib/store-customization.ts:104-113 (BADGE_CATALOG con 'ritiro_in_negozio') · components/store-sections/HeroSection.tsx:83, :244 · lib/store-hours.ts:239, :245 (motivoNegozioChiuso) · app/api/stripe/checkout/route.ts:405 · app/api/orders/cod/route.ts:421 · lib/constants.ts:81 (RITIRO_IN_NEGOZIO_ATTIVO = false)`
- **Rimedio.** In HeroSection e badgeLabel non mostrare 'ritiro_in_negozio' quando RITIRO_IN_NEGOZIO_ATTIVO è falso, e toglierlo dall'elenco scegliibile nel pannello negozio. In motivoNegozioChiuso aggiungere «oppure ritira in negozio» solo se l'interruttore è acceso, come fa già lib/ordini/zona-di-consegna.ts:58. Per la categoria in intestazione non usare il primo bollino.

### R65 · Nel carrello diciamo che ogni euro va ai negozi e che la nostra parte è solo la consegna, ma teniamo anche il 10% della merce

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** Il riquadro «Lo sapevi?» del carrello dice a ogni cliente: «Ogni euro di questo carrello va ai commercianti di Piacenza. La nostra parte è la consegna, ed è la riga qui sopra: nessun costo a sorpresa.» Non è vero: oltre ai 3 € di consegna, MyCity trattiene il 10% del valore della merce al negozio, e la spedizione va al fattorino, non al commerciante. Questa frase è nata per correggere un difetto chiuso («Niente intermediari, niente commissioni nascoste»), e dice di nuovo la stessa cosa falsa con parole diverse. La prova automatica controlla solo che le parole vecchie non ci siano più, e il suo stesso commento ammette che «MyCity trattiene una percentuale».
- **Dove.** `lib/promesse-pubbliche.ts:214-215 · app/cart/page.tsx:799-805 · lib/constants.ts:116 · lib/stripe/client.ts (computeOrderSplit) · tests/unit/le-promesse-che-il-sito-non-mantiene.test.ts:188-197`
- **Rimedio.** Una frase che regga i numeri, per esempio: «Il prezzo dei prodotti è quello del negozio. Al negozio va il 90%, a noi il 10% e la consegna che vedi qui sopra.» Oppure togliere il riquadro. La prova automatica deve controllare che la frase non neghi una commissione maggiore di zero, non che manchino due parole. Implementa @frontend-dev; testo con @legale-privacy.

### R66 · Ogni pagina promette la consegna in 30-60 minuti, ma in produzione non c'è nessun fattorino approvato

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** decisione tua (🔴) · **Sforzo:** M

- **Cosa succede.** La striscia in cima a ogni pagina, la home, le pagine negozio e le schede prodotto dicono «Consegna in 30-60 min» e «Disponibile · pronto per la consegna». Nel database di produzione c'è un solo rider, in stato pending, con zone vuote, e zero rider approvati od online. Nessun punto del flusso d'ordine verifica che ci sia qualcuno che consegna; il pagamento al negozio richiede un rider assegnato (payout.ts:310 «Nessun rider assegnato»).
- **Dove.** `produzione: tabella profiles (role rider) · lib/stripe/payout.ts:310 · components (striscia «Consegna in 30-60 min» in testata, home, negozio, scheda prodotto)`
- **Rimedio.** Decisione di Nicola: approvare almeno un rider (o dichiarare che consegna il negozio stesso) prima di aprire; nel codice, quando non c'è nessun rider attivo, mostrare un tempo onesto o offrire solo il ritiro.

### R67 · Promettiamo 5 euro di benvenuto (e 5 euro con la newsletter) che si tolgono da soli in cassa, ma in cassa non compaiono mai

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Ci sono due promesse di 5 euro e nessuna delle due è vera. ① Chi si registra riceve 100 punti dal trigger della migrazione 029. Tre testi gli dicono che i 5 euro «si applicano automaticamente al checkout»: la notifica del trigger, il tour di benvenuto e l'email del quinto giorno, che dice «lo sconto si applica da solo alla cassa». La cassa però legge solo il credito (wallet_balance_cents), non i punti. Il server scala soltanto un codice sconto scritto a mano (couponCode) o il credito, e il credito c'è solo se l'utente va in Profilo → Punti e converte 100 punti. In più vale solo pagando in contanti. ② La fascia newsletter della home dice «€5 IN REGALO – Iscriviti e prendi €5 di sconto al prim
- **Dove.** `components/BuyerOnboardingTour.tsx:32 · migrations/029_welcome_credit_search_fts_price_alert.sql:28-40 · lib/email/templates.ts:405-414 · components/home-sections/HomeSectionRenderer.tsx:353-357 · app/checkout/page.tsx:410-416,534,654-657 · app/api/orders/cod/route.ts:70-72,668-672 · app/profile/loyalty/page.tsx:174-181 · app/api/newsletter/route.ts:118-127 · app/api/newsletter/confirm/route.ts:44-52`
- **Rimedio.** La mia raccomandazione è una sola promessa, ma vera. Subito: togliere «€5 in regalo» dalla fascia newsletter, che non ha nessun meccanismo dietro. Per il benvenuto ci sono due strade. La prima è trasformare i 100 punti in credito già all'iscrizione, così la cassa li applica davvero. La seconda è riscrivere tour, notifica ed email così: «hai 100 punti: convertili in 5 € da Profilo → Punti, valgono sugli ordini pagati alla consegna». Il costo dei 5 euro va deciso con la finanza.
- *Visto anche da altre corsie (email-notifiche, i18n-microcopy, pagamenti-stripe, prodotto-completezza): schede unite.*

### R68 · Su ogni scheda prodotto c'è scritto «oppure con carta adesso», ma in produzione la carta non si può usare

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La frase sui metodi di pagamento nasce da METODI_AL_CHECKOUT, un elenco fisso che contiene sempre 'carta-adesso'. La cassa invece abilita la carta solo se esiste NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, che in produzione manca. Il commento dice «la promessa dice quello che offre il checkout», ma l'elenco non legge la stessa condizione: la scheda promette la carta, la cassa offre solo i contanti.
- **Dove.** `lib/promesse-pubbliche.ts:175-185 · app/checkout/page.tsx:539-543,558 · app/product/[id]/page.tsx (riga di rassicurazione)`
- **Rimedio.** Derivare METODI_AL_CHECKOUT dalla stessa condizione della cassa (presenza di NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY), in un solo punto condiviso, e aggiungere la prova che con la chiave assente la frase dice «Paghi in contanti alla consegna».

### R69 · Le tre prove automatiche dell'acquisto vero sono vuote: passano in tre millesimi senza aprire niente

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M · **Tornato dopo essere stato chiuso**

- **Cosa succede.** Nella suite del browser, la sezione «l'ordine che nasce davvero» ha tre prove dai nomi rassicuranti: «contrassegno: l'ordine nasce e il negozio lo vede», «rifiuto del negozio su un ordine pagato: il rimborso esiste», «consegna completata: il bonifico al negozio parte». Il loro corpo intero è `expect(SENZA_AMBIENTE_DI_PROVA).toBe(false)`. Oggi vengono saltate perché nessun job della CI imposta E2E_DATI_DI_PROVA. Il giorno in cui qualcuno imposta la variabile, diventano verdi senza aver creato un ordine né toccato Stripe: controllano solo che la variabile esista. Risultato: in tutta la suite non esiste una prova automatica che attraversi la cassa fino all'ordine. Il difetto chiuso «Nessuna pro
- **Dove.** `tests/e2e/12-la-cassa-dal-carrello-al-pagamento.spec.ts:186-213 · .github/workflows/ci.yml (nessun job imposta E2E_DATI_DI_PROVA)`
- **Rimedio.** Riscrivere le tre prove perché facciano il percorso vero sull'ambiente di prova. Contrassegno: dal carrello seminato a POST /api/orders/cod, poi SELECT dell'ordine (stato NEW, totale giusto) e campanella del negozio. Carta: Stripe in modalità test con webhook firmato e ordine PAID. Rifiuto: rimborso registrato. Consegna: giro release-payouts con transfer in test-mode. Finché l'ambiente non c'è, devono restare saltate con il motivo, ma con un corpo vero: mai un'asserzione sulla variabile stessa. Aggiungere una prova unitaria che vieti `expect(SENZA_AMBIENTE_DI_PROVA)` come unica asserzione.

### R70 · Si possono togliere quattro controlli sui soldi e 4.257 prove automatiche su 4.258 restano verdi

**Gravità:** grave · **Area:** Flussi critici · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Ho tolto, in una copia del codice, quattro controlli che proteggono i soldi. ① Il webhook crea l'ordine PAGATO solo se Stripe dice che la sessione è pagata. ② Se l'incasso è diverso dal preventivo l'ordine non nasce e il cliente viene rimborsato. ③ Il negozio riceve il bonifico solo a ordine consegnato. ④ Il turno del bonifico si prende in modo atomico, così due giri paralleli non pagano due volte. Senza nessuno dei quattro, l'intera suite unitaria (540 file) dà 4.257 prove verdi su 4.258. L'unica rossa non c'entra: è una prova che usa `git grep` e fallisce fuori da un clone git. Due di questi controlli sono la riparazione di difetti già chiusi: «Incasso diverso dal preventivo: il cliente pa
- **Dove.** `lib/stripe/webhook/ordini.ts:88 (sessione davvero pagata) · lib/stripe/webhook/ordini.ts:188-226 (incasso uguale al preventivo, con rimborso automatico) · lib/stripe/payout.ts:88 (bonifico al negozio solo a ordine consegnato) · lib/stripe/payout.ts:132 (turno atomico del bonifico: .in('payout_status', ['HELD','PENDING_SELLER_ONBOARDING']))`
- **Rimedio.** Quattro prove unitarie sul comportamento, ognuna vista fallire con la sua mutazione. ① handleCheckoutCompleted con payment_status 'unpaid' → nessun insert su orders. ② amount_total diverso da total_cents → nessun ordine, refunds.create chiamato con la chiave refund_quadratura_<id>, pending in stato MISMATCH. ③ releaseOrderPayout su un ordine con delivery_status 'SHIPPED' → NOT_DELIVERED e transfers.create mai chiamato. ④ il turno restituisce zero righe (ordine già PROCESSING) → BAD_STATE e nessun transfer. In più, ogni notte un giro di test di mutazione (Stryker) su lib/stripe/** e lib/ordini/

### R71 · Chi paga in contanti e restituisce un prodotto riceve d'ufficio credito MyCity invece dei soldi, senza che nessuno gli chieda se lo vuole

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** L'art. 56 c.1 del Codice del Consumo chiede di rimborsare il recesso con lo stesso mezzo usato dal consumatore. L'eccezione vale solo se il consumatore ha «espressamente convenuto altrimenti». Quando il negozio approva un reso su un ordine in contanti, refundOrder accredita il portafoglio MyCity e basta. Il modulo di reso non chiede niente. La pagina Resi dice «se preferisci il bonifico, scrivici»: il credito è la scelta di partenza e il bonifico si ottiene solo chiedendolo, quindi non c'è un consenso espresso. I Termini §7 promettono invece «lo stesso mezzo di pagamento»: due testi legali si contraddicono. K12 lo aggrava, perché quel credito si spende solo pagando di nuovo in contanti. Oggi
- **Dove.** `lib/stripe/payout.ts:859-900 (ramo contanti → rpc wallet_credit, reason 'cod_refund') · app/api/returns/[id]/decide/route.ts:174-197 · app/returns/page.tsx (testo «il rimborso arriva come credito MyCity… se preferisci il bonifico, scrivici») · app/terms/page.tsx §7 («con lo stesso mezzo di pagamento») · app/orders/[id]/return/page.tsx (nessuna scelta del metodo)`
- **Rimedio.** Nel modulo di reso chiedere «Come vuoi il rimborso?», con il bonifico come prima scelta (campo IBAN) e il credito come opzione. Salvare la scelta sul reso. refundOrder accredita il portafoglio solo se il cliente l'ha scelto, altrimenti registra un rimborso da pagare con bonifico. Allineare la pagina Resi ai Termini.
- *Visto anche da altre corsie (privacy-legale, produzione-live): schede unite.*

### R72 · Il negozio può chiudere un reso senza rimborsare il cliente, anche se il cliente ha esercitato il recesso e la merce è già tornata

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** La legge dice che il recesso entro 14 giorni non si può rifiutare (artt. 52, 56 e 57 del Codice del Consumo). Il codice lo protegge in un punto solo: la rotta «decide» blocca il rifiuto, ma solo se il motivo è «Ho cambiato idea». La seconda rotta, «avanza», permette al negozio di portare qualunque reso a «chiuso senza rimborso». Vale per qualunque motivo, entro i 14 giorni, e anche quando la merce è già rientrata. Quella rotta non legge proprio il motivo del reso. La chiusura sblocca il bonifico al negozio. Il modulo del cliente parte già con «Prodotto danneggiato» selezionato. Così un cliente che esercita il recesso senza toccare il menù finisce in un reso che il negozio può anche rifiutare
- **Dove.** `app/api/returns/[id]/avanza/route.ts:51-56 (CANCELED ammesso da REQUESTED, APPROVED, SHIPPED_BACK e RECEIVED) · app/api/returns/[id]/avanza/route.ts:79 (la rotta non legge nemmeno il motivo del reso) · components/seller/ReturnRequestCard.tsx:60-73 (pulsante «Chiudi senza rimborso» anche dopo «Ho ricevuto la merce») · app/api/returns/[id]/decide/route.ts:66-74 (il divieto di rifiuto vale solo per CHANGED_MIND) · app/orders/[id]/return/page.tsx:30 (motivo già selezionato: DAMAGED) · app/returns/page.tsx:54, 68 e la sezione «Tempi e modalità di rimborso» · app/terms/page.tsx:199-200 · app/api/cro`
- **Rimedio.** 1) In «avanza» leggere reason e delivered_at dell'ordine. Se il reso è stato aperto entro 14 giorni dalla consegna, vietare CANCELED dopo APPROVED, SHIPPED_BACK o RECEIVED. Ammetterlo solo con la rinuncia del cliente registrata, o se il prodotto è escluso per legge (art. 59). 2) In «decide» trattare ogni richiesta entro 14 giorni come recesso non rifiutabile. Tenere separato il reclamo in garanzia, che il negozio può valutare. 3) Nel modulo del cliente: nessun motivo preselezionato e motivo facoltativo. 4) Riscrivere la pagina Resi e il §7 dei Termini: niente motivo obbligatorio, «confezione o

### R73 · Nelle schede prodotto vere compaiono «Vegano false», «Biologico true» e «Alt text», e il negozio vede spuntate caselle sbagliate

**Gravità:** grave · **Area:** Microcopy · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** I prodotti creati dalla foto con l'intelligenza artificiale salvano le caselle sì/no come testo, cioè "true" o "false" fra virgolette. Salvano anche la descrizione per i non vedenti dentro le caratteristiche, alla voce alt_text. La griglia «Caratteristiche» della scheda prodotto traduce in Sì/No solo i veri valori sì/no, mentre il testo lo mostra così com'è. Per le chiavi che non conosce scrive il nome tecnico. Risultato: sulla scheda del kefir di Pane Quotidiano, in produzione, il cliente legge «Biologico true», «Vegano false», «Senza lattosio false» e «Alt text: Bottiglia di kefir di latte di capra…». Lato negozio c'è l'errore speculare: la casella si accende con Boolean(valore), e Boolean
- **Dove.** `lib/category-attributes.ts:188-212 (findLabelForKey, formatAttributeValue) · app/product/[id]/page.tsx:913-940 · lib/products/draftFromVision.ts:97-119 · components/seller/AttributesFields.tsx:217`
- **Rimedio.** In formatAttributeValue trattare "true" e "false" (anche come testo) come Sì e No. Escludere alt_text dalla griglia: è già usato come testo alternativo della foto. In AttributesFields accendere la casella solo con valore === true o === 'true'. In draftFromVision salvare i campi checkbox come veri sì/no e non come testo. Per i prodotti già salvati basta la correzione della visualizzazione, nessuna migrazione.
- *Visto anche da altre corsie (i18n-microcopy, produzione-live): schede unite.*

### R74 · Il carrello rifiuta il codice di benvenuto a chi ha solo un ordine annullato: la riparazione è arrivata alla cassa ma non al database

**Gravità:** grave · **Area:** Permessi sul database · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** Il difetto «Chi annulla il primo ordine perde il buono di benvenuto» risulta chiuso. È stato riparato solo nel controllo della cassa (lib/coupons.ts), che non conta più gli ordini annullati o falliti. Il carrello però non usa quel controllo: chiede alla funzione del database check_coupon. check_coupon esiste solo nella 114 e conta ancora tutti gli ordini, annullati compresi. Il commento in lib/coupons.ts:104-107 dice che le due copie «vanno cambiate insieme», ma la migrazione gemella non c'è: check_coupon compare in un solo file. Il cliente vede «Codice valido solo al primo ordine», il codice non entra nel carrello e quindi non arriva mai alla cassa che lo accetterebbe.
- **Dove.** `migrations/114_hardening_radiografia.sql:349-350 (check_coupon conta TUTTI gli ordini) · lib/coupons.ts:100-113 (la cassa esclude annullati e falliti, e il commento parla di una «migrazione gemella» che non esiste) · lib/coupons.ts:147-160 (validateCouponFromBrowser chiama check_coupon) · app/checkout/page.tsx:604-608 (se il controllo dice no, il codice non si applica)`
- **Rimedio.** Migrazione nuova che ridefinisce check_coupon con la stessa regola della cassa: dentro IF c.first_order_only THEN, la riga diventa «SELECT count(*) INTO ordini FROM public.orders WHERE user_id = uid AND delivery_status <> 'CANCELED' AND payment_status <> 'FAILED';». Il resto resta identico, con REVOKE ALL ... FROM PUBLIC, anon; GRANT EXECUTE ... TO authenticated;. Aggiungere una prova in tests/sql/rls con un cliente che ha solo un ordine annullato.

### R75 · Falla di sicurezza R75 da chiudere (rilascio): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** grave · **Area:** Rilascio e affidabilità · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R76 · Chiudere un reclamo rimborsando solo i contanti blocca per sempre il resto del bonifico al negozio

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** Due pezzi di codice decidono se un rimborso copre tutto l'ordine, e usano basi diverse. refundOrder misura sul lordo (gross_total_cents, prima del credito MyCity). La rotta che chiude i reclami misura su total_price, cioè i contanti dopo lo scomputo del credito. Su un ordine pagato in parte col credito, un rimborso fra i due valori diventa «parziale» per i soldi e «integrale» per il reclamo. La rotta scrive allora internal_dispute_status='LOST', e il giro dei bonifici esclude per sempre quell'ordine. È lo stesso errore delle «due basi» già riparato in refundOrder (055), rimasto in questa rotta.
- **Dove.** `app/api/admin/disputes/[id]/resolve/route.ts:170-174 (integrale calcolato su total_price) · lib/stripe/payout.ts:821,853 (refundOrder calcola il pieno sul lordo gross_total_cents) · app/api/cron/release-payouts/route.ts:204 e :364 (paga solo internal_dispute_status vuoto o RESOLVED)`
- **Rimedio.** Non ricalcolare «integrale» nella rotta. Far restituire a refundOrder il suo verdetto (isFull / payment_status === 'REFUNDED') e usare quello per scegliere fra LOST e RESOLVED. In alternativa, leggere gross_total_cents e refunded_amount_cents dopo il rimborso. Aggiungere la prova sopra ai test unitari.

### R77 · Gli avvisi di Stripe sui conti dei negozi vengono respinti: se la banca rifiuta un bonifico al negozio non lo sa nessuno

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Il sito verifica la firma di OGNI avviso Stripe con un solo segreto, STRIPE_WEBHOOK_SECRET. Ma due degli eventi che il codice gestisce arrivano dai conti Connect dei negozi: «payout.failed» (la banca del negozio rifiuta il bonifico) e «account.updated» (Stripe abilita o blocca i versamenti del negozio). Stripe li manda solo a un indirizzo registrato come «Eventi sui conti collegati», che ha un suo segreto diverso. Con un segreto solo, quegli avvisi o non arrivano mai (se si registra un solo indirizzo, come dicono le istruzioni date a Nicola) o vengono respinti con 400 (se si registra anche il secondo). Il gestore scritto apposta per avvisare il negoziante del bonifico rimbalzato non può quin
- **Dove.** `app/api/stripe/webhook/route.ts:43,52 · lib/env.ts:41 · app/api/stripe/webhook/route.ts:182-185,207-211 · lib/stripe/webhook/trasferimenti.ts:69-137 · lib/stripe/payout.ts:39-49 · (istruzioni date a Nicola) /home/user/ad-mycity/consegne/salute/2026-10-10-chiavi-vercel.md:59-62`
- **Rimedio.** Accettare due segreti: provare STRIPE_WEBHOOK_SECRET e, se fallisce, STRIPE_CONNECT_WEBHOOK_SECRET (nuova variabile, 503 solo se mancano entrambi). Aggiornare la card delle chiavi: secondo indirizzo uguale con «Eventi sui conti collegati» iscritto ad account.updated e payout.failed, e per il primo indirizzo l'elenco esplicito dei 14 eventi gestiti (checkout.session.completed/expired/async_*, charge.refunded, charge.refund.updated, charge.dispute.created/closed, transfer.reversed, payment_intent.succeeded/payment_failed, customer.subscription.updated/deleted, invoice.payment_failed). Implementa

### R78 · I buoni regalo sono in vendita senza nessuna regola nelle condizioni, e i soldi finiscono sul conto di MyCity

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** Nel menu account di ogni cliente c'è «Gift card», e la scheda che si apre per prima è «Regala»: importi da 10, 25, 50 o 100 €, pagati con carta. Il pagamento Stripe è in modalità 'payment' senza transfer_data, quindi i soldi arrivano sul conto della piattaforma e non a un negozio. Il codice diventa credito spendibile in qualunque negozio per 2 anni. Le Condizioni d'uso non contengono una sola riga sui buoni: chi li emette, se sono rimborsabili, cosa succede alla scadenza o se un negozio esce, che IVA hanno. Il paletto 7 di CONTESTO (§4 e §10) chiede che i buoni validi in più negozi passino da un legale prima di partire, e che la piattaforma non tenga i fondi. La decisione dell'AD del 6/7 li 
- **Dove.** `app/profile/gift-cards/page.tsx:37,43,106-132,268-270 · app/api/gift-cards/checkout/route.ts:49-68 · migrations/030_achievements_giftcards_subscriptions_sponsored.sql:96 · app/terms/page.tsx (nessuna sezione buoni) · components/account/AccountShell.tsx:37`
- **Rimedio.** Subito: nascondere la scheda «Regala» e la voce «Gift card» dal menu account, finché non arriva il parere legale e fiscale. Dopo il parere: una sezione «Buoni regalo» nelle Condizioni (emittente, validità, rimborso, negozi aderenti) e la decisione se l'incasso passa da Stripe Connect.

### R79 · Il codice sconto di MyCity lo paga il negozio: su 20 euro di pane con 5 euro di sconto incassa 13,50 invece di 18

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** decisione tua (🔴) · **Sforzo:** S

- **Cosa succede.** I codici sconto sono solo di MyCity: la tabella coupons non ha nessun campo negozio e li crea solo l'amministratore. Il netto del negozio però si calcola sul totale già scontato. Sia la carta (webhook) sia i contanti passano a computeOrderSplit il totale del gruppo dopo lo sconto. Così il subtotale da cui si toglie il 10% è «subtotale meno sconto», e il negozio assorbe il 90% di ogni codice sconto. Al negozio scriviamo il contrario. Pagina Guadagni: «paghi solo il 10% del venduto». Aiuto venditore: «il 10% sul venduto». Termini: commissione «pari al 10% del subtotale dei prodotti».
- **Dove.** `lib/stripe/client.ts:415-425 · lib/stripe/webhook/ordini.ts:290-294 · app/api/orders/cod/route.ts:644,691-695 · lib/ordini/prezzi.ts:121-124 · app/seller/earnings/commissione.ts:90 · app/seller/help/domande.ts:61-62 · app/terms/page.tsx:255-257 · migrations/014_mvp_sprint.sql:130-143`
- **Rimedio.** Prima serve una decisione di Nicola: chi paga i codici sconto di MyCity. Raccomandazione: li paga MyCity, perché sono una spesa per trovare clienti, non un costo del negozio. Poi il codice: in computeOrderSplit la base del netto e della commissione diventa il totale più couponPortionCents (e pickupPortionCents, se lo sconto ritiro resta di MyCity). Lo stesso conto vale nel webhook e nella rotta contanti, che usano la stessa funzione. Va aggiunta una prova con codice sconto. Se invece si decide che lo paga il negozio, bisogna scriverlo nei termini, nell'aiuto e nella pagina Guadagni prima del l

### R80 · Il cruscotto del negoziante mostra meno soldi di quelli che riceve quando il cliente paga anche col credito MyCity

**Gravità:** grave · **Area:** Dati e analitica · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** In un ordine in contanti dove il cliente usa il credito MyCity, la colonna total_price viene scritta DOPO aver tolto il credito (è il contante che il fattorino incassa), mentre commissione e quota del negozio (seller_payout_cents) sono calcolate sul lordo. La definizione unica del fatturato del venditore (metricheVenditore) riparte da total_price e ci toglie commissione, spedizione e quota di consegna: il risultato è più basso del bonifico vero esattamente dell'importo del credito usato. Lo stesso numero alimenta «Il tuo netto», i riquadri oggi/7/30 giorni del cruscotto, la pagina Andamento e il suo grafico a barre. La pagina Guadagni invece usa seller_payout_cents: lo stesso negozio vede du
- **Dove.** `lib/metriche-venditore.ts:78-80 e 116-127 · app/api/orders/cod/route.ts:681-684, 692, 705, 713, 728-729 · app/seller/dashboard/page.tsx:153 e 228 · app/seller/analytics/page.tsx:94, 153, 214 · lib/guadagni/negozio.ts:51-53`
- **Rimedio.** Far leggere al cruscotto e ad Andamento anche gross_total_cents, seller_payout_cents e seller_payout_reversed_cents, e calcolare il netto come seller_payout_cents meno gli storni (la stessa regola di lib/guadagni/negozio.ts), con l'incassato sul lordo (gross_total_cents, ripiego su total_price per gli ordini vecchi) meno i rimborsi. Aggiungere una prova che fallisce se netto del cruscotto e netto di Guadagni divergono su un ordine col credito. La stessa correzione va portata nella funzione numeri_del_negozio quando verrà riscritta.

### R81 · Se il database sbaglia una scrittura durante un pagamento, il sito risponde a Stripe «tutto a posto» e Stripe non riprova più

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Il webhook di Stripe è la porta da cui Stripe ci avvisa di quello che succede a un pagamento. Il suo gestore si regge su un patto: se va in errore, la rotta risponde 500 e Stripe riprova più tardi. Ma la libreria di Supabase NON lancia un errore quando una scrittura fallisce. Lo mette dentro `{ error }`, e qualcuno deve leggerlo. Nei gestori di Stripe ci sono 15 scritture il cui risultato nessuno legge, più 2 nella rotta stessa. Se il database rifiuta o va in timeout proprio in quel momento, il gestore finisce «bene». La rotta segna l'evento come lavorato e risponde 200. Stripe considera il messaggio consegnato e non lo rimanda più. Su tutti i percorsi dei soldi la scansione ne trova 50. Le 
- **Dove.** `lib/stripe/webhook/dispute.ts:109-112 · lib/stripe/webhook/dispute.ts:140 · lib/stripe/webhook/trasferimenti.ts:46-47 · lib/stripe/webhook/abbonamenti.ts:63,93 · lib/stripe/payout.ts:1027 · app/api/stripe/webhook/route.ts:233-237 · app/api/cron/release-payouts/route.ts:89,200`
- **Rimedio.** Nei gestori di Stripe ogni scrittura che conta deve far fallire il gestore. Si usa `.throwOnError()`, già presente in supabase-js 2.106, oppure si legge `{ error }` e si lancia. Così la rotta va nel suo catch, libera il turno e risponde 500. Prima di accenderlo va verificato che ogni gestore regga una seconda esecuzione. Esempio: dispute.created rifà reverseOrderTransfer, quindi la sua chiave anti-doppione deve restituire lo stesso storno. Per chiudere l'intera classe servono due cose: la prova qui sopra portata in tests/unit, e una regola di lint (no-restricted-syntax) che in lib/stripe/webho

### R82 · Se un rimborso in contanti si inceppa a metà, il cliente non riceve niente e il reso non si può più rifare

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S · **Tornato dopo essere stato chiuso**

- **Cosa succede.** La funzione dei rimborsi prima «prenota» l'importo sull'ordine: la colonna refunded_amount_cents sale subito. Solo dopo muove i soldi. Il ramo della carta, se qualcosa cade dopo la prenotazione, la restituisce con storna_rimborso. Il ramo dei contanti non lo fa. Se cade lo storno della quota al negozio (riga 879, fuori da ogni try) o l'accredito sul portafoglio (riga 906), la prenotazione resta. L'ordine risulta rimborsato per intero, ma il cliente non ha ricevuto un centesimo. È la stessa logica scritta due volte nella stessa funzione: le due riparazioni del ramo carta (21/8 e R043) non sono mai arrivate al ramo contanti.
- **Dove.** `lib/stripe/payout.ts:841 (prenotazione del rimborso) · lib/stripe/payout.ts:865-906 (ramo contanti: storno a 879 senza protezione, accredito che lancia a 906) · lib/stripe/payout.ts:966-978 (solo il ramo carta restituisce la prenotazione con storna_rimborso) · app/api/returns/[id]/avanza/route.ts:140 · app/api/returns/[id]/decide/route.ts:116`
- **Rimedio.** Nel ramo contanti di refundOrder: mettere lo storno al negozio dentro try/catch come nel ramo carta (R043: registrare REVERSAL_FAILED e andare avanti). Se wallet_credit fallisce con un codice diverso da 23505, chiamare storna_rimborso con safeAmountCents prima di lanciare l'errore, e annullare anche l'addebito della quota del negozio. Rendere permanente la prova in tests/unit, sul modello di lo-storno-al-negozio-non-blocca-il-rimborso.test.ts ma con payment_method 'cod'. Meglio ancora: un solo blocco «se dopo la prenotazione qualcosa cade, restituisci», condiviso dai due rami, così la classe d

### R83 · Falla di sicurezza R83 da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** migrazione del database (la scrivo io 🟡, l'applichi tu 🔴) · **Sforzo:** M

I dettagli (dove sta, come si sfrutta, come si chiude) sono nel referto privato consegnato a Nicola in chat: questo deposito è pubblico e la falla è ancora aperta.


### R84 · Un reclamo chiuso a favore del cliente su un ordine in contanti mai pagato gli regala credito MyCity

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Nel ramo contanti, refundOrder accredita sul portafoglio del cliente l'importo chiesto, fino al lordo dell'ordine. Non controlla che i contanti siano stati incassati: tra le colonne che legge non ci sono né cash_confirmed_at né payment_status, e non guarda se l'ordine è annullato. Il cliente può aprire un reclamo su qualunque suo ordine: la pagina non filtra per stato. Il pannello dei reclami non mostra all'amministratore né il metodo di pagamento né se i contanti sono arrivati: c'è solo un campo libero «Rimborso (€)». Altrove il codice sa che serve quel controllo: il compenso del fattorino lo fa (payout.ts:340, `if (inContanti && !order.cash_confirmed_at)`).
- **Dove.** `lib/stripe/payout.ts:791 (colonne lette) · lib/stripe/payout.ts:865-933 (ramo contanti di refundOrder) · app/api/admin/disputes/[id]/resolve/route.ts:111-133 · app/admin/disputes/page.tsx:296-321 · app/orders/[id]/dispute/page.tsx:64-70`
- **Rimedio.** In refundOrder, nel ramo contanti, leggere cash_confirmed_at e payment_status. Se i contanti non sono stati incassati e il portafoglio non è stato usato (wallet_applied_cents = 0), alzare RimborsoNonRitentabile('nessun incasso da restituire'). Se il portafoglio è stato usato, restituire solo wallet_applied_cents. Nel pannello reclami mostrare metodo di pagamento, stato dell'incasso e importo massimo rimborsabile.

### R85 · Un rimborso parziale fatto dal cruscotto Stripe viene ignorato: il negozio prende il bonifico intero e l'annullo dopo non funziona più

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Quando arriva charge.refunded con un rimborso non totale, il gestore scrive un logger.warn «riconciliare a mano» ed esce. Non distingue i rimborsi partiti da refundOrder, che hanno metadata.order_id, da quelli fatti a mano sul cruscotto. Lo fa anche quando la charge appartiene a un ordine solo, dove non c'è nessuna ambiguità. Sull'ordine refunded_amount_cents resta 0, payment_status resta PAID e la quota del negozio non scende. Due conseguenze. Il giro dei bonifici paga al negozio il netto intero. E ogni rimborso successivo dal flusso interno chiede a Stripe il totale pieno, che Stripe rifiuta perché supera il rimborsabile.
- **Dove.** `lib/stripe/webhook/rimborsi.ts:44-64 · lib/stripe/payout.ts:161 (residuoRecuperabile) · lib/ordini/annulla.ts (ramo isPaidCard: residuoCent = total_price − refunded_amount_cents) · lib/stripe/payout.ts:827-830,939-978`
- **Rimedio.** In handleChargeRefunded, per i rimborsi della charge senza metadata.order_id cioè partiti da fuori: se gli ordini trovati sono uno, chiamare la stessa contabilità di refundOrder senza un nuovo rimborso su Stripe. Cioè accumula_rimborso, quota del negozio storna/addebitata, stato PARTIALLY_REFUNDED. Se gli ordini sono più di uno, mettere in pausa i bonifici di quel carrello e chiamare notifyAdmins. Va aggiunta una prova con un rimborso parziale da cruscotto su un ordine singolo.

### R86 · La classifica degli inviti promette 100, 50 e 25 euro ai primi tre del mese, ma nessuno li paga ed è un concorso a premi mai comunicato al Ministero

**Gravità:** grave · **Area:** Privacy e legale · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** Ogni cliente collegato vede, dalla pagina «Invita un amico», una classifica mensile con tre premi in euro e la promessa di pagarli entro 7 giorni dalla fine del mese. Ci sono due problemi. ① Nel codice nessuno assegna questi premi: non c'è un lavoro automatico, una pagina admin o una funzione del database che li paghi; l'unico premio vero degli inviti è il credito di 5 €. Ma una promessa fatta al pubblico vincola appena è pubblicata (art. 1989 del codice civile). ② Un premio a chi arriva primo in una classifica è un «concorso a premi» (DPR 430/2001). Va comunicato al Ministero (MIMIT) almeno 15 giorni prima dell'inizio, con il regolamento e una cauzione pari al 100% del valore dei premi. Qui
- **Dove.** `app/profile/referral/leaderboard/page.tsx:48 («I primi 3 vincono buoni speciali a fine mese!») · :52-63 (riquadri €100 / €50 / €25) · :105 («I primi 3 ricevono il premio entro 7 giorni dalla fine del mese») · app/profile/referral/page.tsx:89 (link «Classifica inviti» per ogni cliente collegato)`
- **Rimedio.** Subito: togliere dalla pagina i riquadri dei premi e la frase «I primi 3 ricevono il premio», e lasciare la classifica senza premi (oppure toglierla). Se Nicola vuole davvero il concorso: regolamento, comunicazione PREMA al MIMIT 15 giorni prima, cauzione e verbale di chiusura, con @legale-privacy e @contabilita. Da far validare a un legale abilitato.

### R87 · Nessuna pagina chiede al negozio la partita IVA: lo approviamo senza, e «Venduto da» resta vuoto

**Gravità:** grave · **Area:** Pagamenti · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M · **Tornato dopo essere stato chiuso**

- **Cosa succede.** In parole semplici: chiediamo al negozio i dati fiscali «più avanti», ma il più avanti non esiste. Il modulo d'iscrizione dei venditori dice che ragione sociale, partita IVA, sede legale, PEC e SDI sono «temporaneamente disattivati: verranno raccolti più avanti nel percorso del venditore». In tutto il codice però nessun modulo li scrive, né per il negoziante né per l'amministratore. business_vat_number, business_legal_name, business_address, business_pec e business_sdi si leggono soltanto: nel pannello admin, nel riquadro «Venduto da» e nel controllo VIES (la banca dati europea delle partite IVA), che parte solo «se la partita IVA c'è». Le conseguenze sono tre. Primo: i Termini definiscono i
- **Dove.** `components/SellerApplicationForm.tsx:29-31, 53-54 · app/sell/page.tsx:93 · components/products/VendutoDa.tsx:25, 52, 60 · app/api/kyc/start-check/route.ts:78 · app/terms/page.tsx:67 · app/admin/users/page.tsx:1077-1083`
- **Rimedio.** Rimettere nel modulo /sell, o in /seller/profile, ragione sociale, forma giuridica, partita IVA, sede legale, PEC o codice SDI. Renderli obbligatori per l'approvazione, con un blocco sul pulsante Approva e nella funzione del database che approva, e con il controllo VIES. Per Pane Quotidiano inserirli prima del lancio. Una prova che approvi un negozio senza partita IVA e si aspetti il rifiuto.

### R88 · Home, piè di pagina e mappa per Google mettono in mostra categorie vuote: otto su nove non hanno prodotti

**Gravità:** grave · **Area:** Navigazione · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** M

- **Cosa succede.** Delle 9 categorie principali solo Alimentari ha prodotti (9, di cui 4 del negozio demo). La home mostra «Le categorie più cercate»: Abbigliamento, Alimentari, Bellezza, Casa & Cucina, Elettronica, Giardino, cioè 5 tessere vuote su 6. Il piede ne elenca 9, 8 vuote. Il titolo per Google promette «alimentari, abbigliamento, casa, elettronica, libri». La mappa del sito manda a Google 72 indirizzi di categoria indicizzabili e solo 3 hanno prodotti.
- **Dove.** `components/CategoryShowcase.tsx (nessun filtro sui prodotti) · components/Footer.tsx:151-165 · app/sitemap.ts:105-111 · app/category/[slug]/layout.tsx:26-30`
- **Rimedio.** Nel codice: mostrare in home, piede e menu solo le categorie con almeno un prodotto disponibile, togliere dalla sitemap le categorie vuote e metterle in noindex. Nei testi: promettere solo ciò che c'è.
- *Visto anche da altre corsie (prodotto-completezza, produzione-live): schede unite.*

### R89 · La pagina Promozioni va in errore quando non c'è nessuna promozione attiva

**Gravità:** grave · **Area:** Stati dell'interfaccia · **Si ripara:** codice del sito (🟡, lo riparo io in un ramo) · **Sforzo:** S

- **Cosa succede.** La pagina Promozioni e la griglia prodotti salvano i dati nella stessa memoria del browser (chiave ['promotions','active']), ma con due forme diverse. La pagina ci mette una lista di righe, la griglia si aspetta un insieme di id e ci chiama sopra .has(). Quando la pagina trova zero promozioni, disegna proprio quella griglia in modalità «solo promo». La griglia legge la lista lasciata dalla pagina e, al primo prodotto del catalogo, chiama .has() su una lista: errore e pagina intera sostituita da «Qualcosa è andato storto». È la stessa famiglia di un difetto già chiuso («Due pagine gemelle leggono la consegna veloce con la stessa chiave e due funzioni diverse»), ma su un'altra chiave.
- **Dove.** `app/promozioni/page.tsx:47-54 · app/promozioni/page.tsx:99-106 · components/ProductGrid.tsx:296-305 · components/ProductGrid.tsx:362-367 · lib/queries/keys.ts:174`
- **Rimedio.** Dare alla griglia una chiave sua, per esempio queryKeys.promotions.activeIds = ['promotions','active-ids'] in lib/queries/keys.ts, e usarla in components/ProductGrid.tsx:297. Oppure far disegnare a app/promozioni/page.tsx il suo stato vuoto senza montare ProductGrid onlyPromo. Aggiungere una prova unitaria che monta le due query con un QueryClient condiviso.
