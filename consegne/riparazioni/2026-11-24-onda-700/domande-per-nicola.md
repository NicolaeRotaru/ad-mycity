---
data: 2026-11-24 11:30
tipo: domande per Nicola
---

# Le 65 domande che sbloccano altrettanti difetti del sito

## In parole semplici
Ogni riga è un difetto che nessuno può riparare finché non scegli tu. Una risposta corta basta: «sì», «no», «la prima».

## Cosa cambia per te
Ogni risposta sblocca un difetto: la prossima ondata lo può riparare senza fermarsi a chiederti.

## Cosa devi fare
Rispondi quando vuoi, anche a poche domande per volta. Scrivi il numero e la scelta, per esempio «52: in linea d'aria».

## Cosa non ho verificato
Le domande vengono dalle schede dei difetti, raccolte il 24/11 dal programma della campagna. Non ho ricontrollato una per una se il codice del sito è ancora com'era quel giorno.

## privacy-legale (18)

1. **Quando un negozio che ha venduto cancella l'account, partita IVA, codice fiscale, ragione sociale e IBAN si cancellano subito, anche se servono ai conti per die**. Domanda per Nicola, insieme al commercialista: per quanto teniamo i dati fiscali di un negozio che ha venduto e cancella l account (10 anni?), e in un archivio separato leggibile solo dall admin? Serve una tabella nuova (migrazione 235-239) e la copia di ragione sociale e P.IVA sull ordine.
2. **I Termini promettono 30 giorni di preavviso via email prima di ogni modifica, ma la versione nuova è entrata in vigore il giorno stesso e nessuna email esiste**. Domanda per Nicola, insieme al legale: costruiamo l email «I Termini cambiano dal …» con l entrata in vigore 30 giorni dopo l invio, oppure riscriviamo il §15 com è oggi (riaccettazione al primo accesso)? Per i negozi il P2B fa preferire la prima.
3. **Le copie notturne del database passano da GitHub, che l'informativa non nomina, e non si dice quanto restano**. Domanda per Nicola: aggiungiamo GitHub (e il fornitore dello storico foto, se acceso) fra i responsabili nell'informativa, con «le copie durano 30 giorni»?
4. **Il negozio continua a leggere telefono, indirizzo e note di casa dei clienti di tutti gli ordini passati, per dieci anni**. Dopo quanti giorni dalla consegna il negozio smette di vedere telefono, note e posizione del cliente (al fattorino oggi sono 7)? Poi è una potatura in SQL.
5. **Le promozioni del negozio mostrano il prezzo barrato senza il prezzo più basso dei trenta giorni prima**. Domanda a Nicola: le promozioni in percentuale dei negozi restano accese al lancio senza il prezzo più basso dei 30 giorni (art. 17-bis Cod. Consumo), o le spegniamo dietro un interruttore come il Drop finché non c'è lo storico dei prezzi (serve una migrazione)?
6. **La copia di sicurezza delle foto tiene per sempre anche quelle che la persona ha fatto cancellare**. Domanda per Nicola: per quanto teniamo lo storico delle foto cancellate nella copia (proposta 30 giorni, come gli artefatti del database, da scrivere nell'informativa)?
7. **La posizione del fattorino quando preme SOS resta salvata per sempre, e l'informativa non ne parla**. Per quanto teniamo la posizione dell'SOS del fattorino (e cosa scriviamo nell'informativa)? Poi è una potatura in SQL più una riga in app/privacy.
8. **Il negozio può mettere qualunque «prezzo pieno» barrato e il sito scrive «Risparmi X €», senza guardare il prezzo più basso degli ultimi 30 giorni**. Domanda a Nicola: il campo «Prezzo pieno, barrato» resta finché non c'è lo storico dei prezzi, che chiede una migrazione e un trigger? Oppure lo nascondiamo al lancio come il Drop? Va deciso insieme alla 117.
9. **Chi cancella l'account perde il credito MyCity senza avviso, anche quando quel credito è il rimborso di un reso o un buono regalo pagato**. Chi chiede la cancellazione con credito MyCity sopra zero: blocchiamo la cancellazione finché non lo spende/rimborsiamo, o gli facciamo il bonifico del saldo?
10. **Sulla commissione i Termini dicono «10% IVA esclusa», il codice trattiene il 10% del prezzo lordo, e né commissione né abbonamento vengono mai fatturati al nego**. Da chiarire col commercialista: chi emette ogni mese la fattura elettronica di commissioni (e, quando si accende, dell abbonamento) al negozio, e con quale strumento?
11. **Il negozio accetta i Termini con una sola spunta: foro di Piacenza, limiti di responsabilità e sospensione non sono approvati per iscritto, quindi contro di lui**. Domanda a Nicola: approvi il testo della seconda spunta «artt. 1341-1342 c.c.: §13, §14, §15, §17» dopo il parere di un legale? Serve anche dove salvarla (una categoria nuova in consent_log richiede una migrazione sul vincolo).
12. **L'email di conferma d'ordine non è una conferma di contratto: niente prodotti, niente venditore, niente diritto di recesso**. Domanda per Nicola: che testo di recesso/garanzia e quali dati del venditore vuoi nella conferma d'ordine (lo approva il legale)?
13. **L'informativa non dice ai venditori che dati fiscali e incassi vanno comunicati all'Agenzia delle Entrate (DAC7)**. Domanda per Nicola (col fiscalista): MyCity è «gestore di piattaforma» DAC7 (D.Lgs. 32/2023)? Se sì, servono una riga nella tabella delle finalità, l Agenzia delle Entrate fra i destinatari e due righe nel contratto del negozio.
14. **La coda delle email non si svuota mai**. Domanda per Nicola: per quanto tempo teniamo il registro delle email spedite o annullate (proposta 90 giorni, da scrivere anche nell'informativa)? Il codice da cambiare poi è una riga sola, in lib/privacy/potature-ritenzione.ts.
15. **L'avviso del bonifico da fare, con dentro l'email del cliente, resta fra le notifiche degli amministratori anche a bonifico pagato, e dal sito non si può cancel**. Domanda per Nicola: dopo quanti mesi dal bonifico pagato si cancella l avviso «Bonifico di rimborso da fare» con l email del cliente? Con la risposta: una potatura in lib/privacy/potature-ritenzione.ts e la durata nell informativa.
16. **Il §4 dei Termini dice che la consegna si rifà «come se avessi ordinato solo dai rimasti», ma col codice e il tetto non è così**. Riguarda solo i codici sconto, spenti al lancio. Domanda per Nicola, prima di riaccenderli. Col codice e il tetto la consegna dei rimasti può restare più bassa della regola. Nei Termini scriviamo «come se avessi ordinato solo da loro, o meno se avevi un codice sconto»?
17. **Con più negozi, l'ordine rimasto costa di più dopo l'accettazione (frutta da 13 a 15 euro) e il cliente non può tirarsi indietro**. Da chiarire col legale: con la carta i 2 € di consegna in più si tolgono dal rimborso del pane dopo l accettazione: si tiene questa regola (rischio di clausola vessatoria, art. 33 c.2 lett. o Cod. Cons.) o la consegna dei rimasti non sale?
18. **L'informativa privacy promette «ti rispondiamo entro un mese»: frase nuova che Nicola deve approvare**. Domanda per Nicola: approvi la frase «ti rispondiamo entro un mese» (art. 12.3 GDPR)? Se no, si toglie.

## pagamenti-stripe (16)

19. **Con la carta il fattorino viene pagato o no su un ordine rimborsato a seconda dell'orario del rimborso**. Su un rimborso pieno con la carta prima del bonifico, il compenso del fattorino (consegna fatta) si paga sempre, oppure si segna REFUNDED e il giro non lo versa? Oggi dipende dall'ora del rimborso.
20. **Su un rimborso parziale al negozio si toglie una quota sbagliata, anche quando si rimborsa solo la consegna**. Stessa regola del 635: la quota ripresa al negozio su un rimborso parziale va calcolata sulla merce (e zero se si rimborsa solo la consegna)? È una regola di soldi da firmare.
21. **L'email «Nuovo ordine» dice al negozio 19 euro, cioè la sua merce più la consegna di MyCity, invece dei 15 della sua vendita**. Domanda per Nicola: nell'email «Nuovo ordine» al negozio vuoi «La tua vendita: 15,00 € · consegna MyCity 4,00 € · il cliente paga 19,00 € · ti versiamo 13,50 €»? Il netto dipende dalla commissione e va passato dalle due strade d'ordine.
22. **La pagina di pagamento Stripe obbliga il cliente a riscrivere tutto l'indirizzo di fatturazione**. Passare billing_address_collection da 'required' a 'auto' nella pagina di pagamento Stripe (meno campi per il cliente, effetto da misurare)?
23. **Nei resi parziali il negozio restituisce meno di quanto ha incassato su quel prodotto: la differenza la paga MyCity**. Nei resi parziali la quota del negozio si calcola sul subtotale prodotti (e consegna/spedizione rimborsate restano a MyCity) invece che sul lordo dell'ordine?
24. **Se il cliente viene rimborsato dopo la consegna, al fattorino si riprendono i 3 euro senza dirglielo, e la sua pagina Guadagni li mostra ancora «in arrivo»**. Chi paga la consegna quando un ordine consegnato viene rimborsato: mai il fattorino (consegna fatta), il negozio se il problema è il prodotto, MyCity negli altri casi?
25. **Se la banca rifiuta un rimborso, il negozio viene pagato di nuovo anche se la merce gli è già tornata**. Se la banca respinge il rimborso di un reso già tornato al negozio, il bonifico al negozio si riapre (oggi) o resta stornato con l'ordine segnato «rimborso da rifare»?
26. **Il credito MyCity si spende solo pagando in contanti: chi paga con carta non può usare il buono regalo**. Il credito MyCity (buoni regalo) va reso spendibile anche pagando con la carta? È una funzione nuova del percorso carta (scalare il credito prima di Stripe e restituirlo alla scadenza), con la carta spenta al lancio.
27. **Un solo metodo di pagamento elettronico: la carta, per scelta scritta nel codice**. Aprire altri metodi di pagamento oltre alla carta (togliere payment_method_types: ['card'] e lasciarli al cruscotto Stripe)? La scheda stessa dice «proposta con dati, non implementata di sl…».
28. **Rimborso parziale con la carta prima dei bonifici: a negozio e fattorino va più di quanto resta del pagamento, su ogni spesa fino a 30 € col codice «Spedizione**. Su un rimborso parziale con la carta prima dei bonifici, negozio + fattorino possono superare il residuo dell'addebito: la differenza la copre MyCity col suo saldo (bonifico senza source_transaction) o si riduce il compenso/il netto?
29. **Al negozio che si collega a Stripe il sito chiede anche il permesso di incassare carte, che con questo schema non gli serve**. Al negozio basta la capacità transfers (Separate Charges & Transfers): togliere card_payments dal collegamento Stripe? Da confermare con la documentazione Stripe Connect; il codice oggi lo tiene apposta per non rifare la verifica a chi ha già un conto.
30. **Col codice e il tetto la piattaforma paga di tasca sua una parte dei bonifici, e nessuna prova guarda i bonifici dopo un annullo**. Col codice e il tetto, dopo un annullo i bonifici possono superare l'addebito: sulla frutta di 80 centesimi. La piattaforma copre di tasca sua quella parte, o il tetto va cambiato?
31. **L'euro torna sul credito prima della scrittura della fascia: se il negozio accetta in quell'istante, un annullo dopo rende 1 € in più**. È la stessa corsa della 2342, sul credito MyCity. L'euro torna sul credito prima che la fascia sia scritta. Se il negozio accetta in quell'istante e poi l'ordine si annulla, al cliente torna 1 € in più. Domanda per Nicola: accetti questo euro di rischio per corsa? Oppure vuoi che il credito torni solo dopo la scrittura? Lì il rischio è l'opposto: se la scrittura riesce e l'accredito cade, l'euro non torna.
32. **Se il negozio conferma mentre parte il rimborso, MyCity perde 1 € a ogni corsa (scelta dichiarata, avviso agli admin)**. È una scelta dichiarata nel codice, con l'avviso agli amministratori «Veloce confermata dopo il rimborso dell'euro». Domanda per Nicola: va bene che, nella corsa di millisecondi fra il rimborso e la conferma del negozio, MyCity perda l'euro della veloce?
33. **Le due rotte accettano ancora le sei fasce di prima che Nicola ha tolto**. Domanda: da che giorno le rotte smettono di accettare le sei fasce di prima (FASCE_DI_PRIMA)? Servono solo alle schede della cassa aperte prima del 30/10: una data di fine (es. 15/11, giorno del lancio) e si tolgono.
34. **«Cliente assente» annulla e rimborsa con un tocco, senza traccia delle telefonate; il controllo dello stato vive solo nella rotta**. La prima metà è la scelta di Nicola del 31/10 (nessuna traccia dei tentativi di telefonata): domanda per Nicola, vuoi che «Cliente assente» registri almeno l'ora della chiamata o un numero di tentativi? La seconda metà (la UPDATE in lib/ordini/annulla.ts con neq CANCELED invece di eq sullo stato letto) è in un file di S01. Con la 173 il caso «contanti già dichiarati e poi cliente assente» non si p

## architettura (8)

35. **Se manca la posizione del negozio o dell'indirizzo, il confine dei 10 km non scatta: l'ordine passa a qualunque distanza**. Domanda per Nicola: un ordine con l'indirizzo o il negozio senza coordinate deve passare come oggi? È la scelta scritta in lib/ordini/zona-di-consegna.ts. Oppure va rifiutato finché l'indirizzo non si geolocalizza? Intanto: verificare che Pane Quotidiano abbia lat/lng.
36. **Il codice «Spedizione gratuita» sotto 30 € a negozio fa pagare parte della consegna (1 € su 20 €): il nome promette gratis**. Il codice «Spedizione gratuita» sotto 30 € per negozio lascia al cliente 1 € di consegna. Le strade sono tre: quell'euro lo copre il saldo MyCity, il codice cambia nome, oppure si mette una soglia. Quale scegli?
37. **Col codice, sotto 30 € a negozio la piattaforma resta a zero e paga di tasca la commissione Stripe di ogni addebito**. Col codice «Spedizione gratuita» sotto 30 € per negozio la piattaforma resta a zero e paga la commissione Stripe: si mette una spesa minima al codice o si accetta la perdita?
38. **Per le fasce di domani non conta il ritiro di oggi: lunedì alle 17 «Domani · 7:30–9:00» non si offre**. Domanda: la merce ritirata oggi e tenuta da parte la notte può servire una fascia di domani mattina (lunedì 17:00 → «Domani · 7:30–9:00»)? Il codice oggi dice di no, per prudenza.
39. **La cassa accetta un ordine che il negozio deve accettare entro lo stesso minuto**. Domanda: un ordine che il negozio deve accettare nello stesso minuto in cui nasce (lunedì 19:15, fascia 19:30–21:00) va ancora accettato? Il tuo caso 7 dice di sì. Serve un margine prima dell'ultimo ritiro, per esempio 5 minuti?
40. **Con un indirizzo senza coordinate il confine dei 5 km non si controlla, e la veloce 30-60 min si vende a qualunque distanza**. Stessa domanda della 1939 per la veloce: senza coordinate il confine dei 5 km non si controlla e la veloce 30-60 min si vende a qualunque distanza. Rifiutare la veloce (solo lei) senza coordinate?
41. **Veloce al confine dei 5 km: i 55 minuti contano la linea d'aria, sulla strada (6-7 km, lo dice constants.ts) sono circa 61**. Domanda: al confine dei 5 km in linea d'aria la strada è 6-7 km e in bici, con l'andata al negozio, sono circa 61 minuti: la veloce «30-60 minuti» va offerta fino a 5 km, solo fino a 4 km, o la promessa diventa 30-70?
42. **«AI per i negozi» spenta ferma anche l'AI dei clienti (riassunto recensioni, risposte, ordine da foto)**. Le funzioni AI per i clienti (riassunto recensioni, risposta alle domande, ordine da foto) devono restare spente insieme all'AI per i negozi, o avere un interruttore loro?

## qa-flussi (7)

43. **Un prodotto caricato da Nicola per un negozio va in vendita subito, senza che il negoziante confermi prezzo e allergeni**. Domanda: i prodotti che carichi tu dal pannello per un negozio vero devono nascere in bozza? Restano lì finché il negoziante non conferma prezzo e allergeni, come dice il fatto negozi.prima-ondata. Vale anche al lancio per Pane Quotidiano?
44. **Il fattorino resta «online» per sempre: la mattina dopo il sito vende la consegna veloce anche se nessuno è in servizio**. Domanda per Nicola: dopo quante ore l'interruttore «online» del fattorino deve spegnersi da solo (o a che ora la sera), perché la veloce non si venda la mattina dopo con nessuno in servizio? Servono anche una colonna con l'ora dell'accensione, che è una migrazione, e un giro a orario della S03.
45. **Il negozio sospeso non vede più gli ordini aperti e non li può né preparare né rifiutare**. Domanda a Nicola: quando sospendi un negozio, gli ordini non ancora partiti si annullano e rimborsano da soli, oppure il negozio sospeso deve poterli ancora vedere e rifiutare?
46. **Se il cliente non ha il codice di consegna sotto mano, l'ordine non si chiude più: nessuna alternativa e nessun allarme**. Domanda per Nicola: quando il cliente non ha il codice di consegna, vuoi un'uscita per l'amministratore («segna consegnato» con motivo e traccia) e/o il codice mandato anche per SMS/email al recapito di consegna? Il sorvegliante sui «ritirato» fermi tocca al cron, nella S03. Intanto, quando il codice non si riesce a leggere, ora il sito lo dice e offre Riprova: è la scheda 431.
47. **Fra «il negozio ha accettato» e «consegnato» il cliente non ha nessuna via d'uscita**. Domanda per Nicola: fra «il negozio ha accettato» e «consegnato» quale uscita vuoi? Un «annulla col consenso del negozio»: il cliente chiede, il negozio conferma con un tocco. Oppure una finestra di ripensamento di 2 minuti dopo l'accettazione? Intanto il no dell'annullo dice il motivo vero e la strada (scheda 2370).
48. **Un negozio sospeso con il profilo pubblico acceso: cliente e fattorino non ne vedono più nome e indirizzo**. Domanda a Nicola: quando sospendi un negozio con ordini in viaggio, va bene che cliente e fattorino non ne vedano più nome e indirizzo? E va bene che sia l'assistenza ad avvisare i fattorini? La scheda stessa propone di chiuderla così.
49. **Con una fascia oraria l ordine passa anche senza nessun fattorino approvato: il controllo del fattorino vale solo per la veloce**. Domanda per Nicola: vuoi che il sito rifiuti gli ordini a domicilio con fascia oraria quando non esiste nessun fattorino approvato (anche offline), come già fa la veloce con il fattorino online?

## flussi-conversione (3)

50. **«Vendi su MyCity» è solo un muro di accesso: niente prezzo, niente vantaggi, nessuna persona da contattare**. Domanda a Nicola: /sell deve diventare una pagina aperta a tutti con prezzo, vantaggi e un «Ti richiamiamo», al posto del muro «Accedi o registrati»?
51. **Chi sceglie il ritiro in negozio non dice mai a che ora passa**. Domanda: chi sceglie il ritiro in negozio deve dire a che ora passa (fasce come la consegna) o basta «entro l'orario di chiusura di oggi/domani»? Oggi il ritiro è spento in codice (RITIRO_IN_NEGOZIO_ATTIVO = false).
52. **Il confine dei 10 km è in linea d'aria, ma la bici va per strada: 10 km in linea d'aria possono essere 12-14 km da pedalare**. Domanda per Nicola: il raggio di consegna in bici è in linea d'aria (oggi, haversine) o in chilometri di strada?

## frontend-ux (3)

53. **Il piè di pagina porta a sei profili social che nessuno ha confermato, e il nome non è quello usato dal marchio**. Domanda per Nicola: quali dei sei profili social (Facebook, Instagram, TikTok, X, LinkedIn, YouTube) esistono davvero, e il nome è «mycitypiacenza» o «mycity.piacenza»? Con la risposta il piede li legge da una costante e mostra solo quelli veri.
54. **La cassa non salva l'indirizzo: al secondo ordine il cliente riscrive tutto da capo**. Domanda: dopo il primo ordine la cassa deve salvare l'indirizzo nella rubrica del cliente da sola, o chiedere con una casella «salva questo indirizzo»? (dati personali: serve dirlo nell'informativa).
55. **L'iscrizione obbliga il fattorino a caricare una sua polizza RC anche se va in bici**. Domanda per Nicola: per il fattorino in bici la polizza RC propria resta obbligatoria all'iscrizione (app/rider/onboarding, rider_insurance required), oppure basta la copertura INAIL / una polizza di MyCity?

## deploy-sre (2)

56. **La copia «notturna» e il controllo «del mattino» partono con sette-otto ore di ritardo**. Domanda per Nicola: vuoi che copia notturna e controllo della deriva partano da un calendario esterno affidabile? Può essere il VPS, o un lavoro Vercel che chiama workflow_dispatch. Oggi li fa partire il calendario di GitHub, con 5-8 ore di ritardo.
57. **Il ritorno indietro del rilascio riporta il codice ma non il database**. Domanda per Nicola: vuoi la regola «ogni migrazione nuova ha il suo gemello di ritorno in migrations/giu/ oppure la riga -- RITORNO: non necessario»? Oggi farebbe rosse 151-154.

## ai-endpoints (2)

58. **Due funzioni AI sono pubblicate ma nessuna pagina le usa: la bozza di risposta ai clienti e il riassunto delle recensioni**. Le due funzioni AI senza pagina (bozza di risposta alle domande, riassunto delle recensioni): si collegano alle pagine del negozio o si tolgono le rotte?
59. **Un solo venditore può bruciare da solo il budget AI giornaliero di tutto il sito e lasciare gli altri negozi a «riprova domani»**. Quanto può spendere al giorno in AI un singolo negozio (la scheda propone 2 € al giorno, sul tetto di sito di 20 €)? Con la cifra si aggiunge un secondo conto per (giorno, negozio), con una migrazione.

## microcopy (2)

60. **Il cambio di lingua è un interruttore finto: il sito accetta la scelta, la salva e poi la ignora**. Il sito in inglese si riaccende (traduzioni da completare) oppure /api/locale risponde 404 finché resta solo l'italiano?
61. **La riga dice «Il tempo per accettarlo è finito, si sta annullando» mentre l'ordine si può ancora accettare**. Domanda a Nicola: passato il tempo per accettare, il negozio può ancora accettare l'ordine finché il controllo automatico (ogni 30 minuti) non lo annulla? Se sì, la frase in lib/ordini/scadenza-accettazione.ts va cambiata in «puoi ancora accettarlo per poco»; se no, la rotta di accettazione deve rifiutarlo.

## api-backend (2)

62. **Dopo la 184 il compenso del fattorino parte anche con un reclamo interno aperto: è un cambio non dichiarato nella migrazione**. Domanda: c'è un reclamo interno aperto, nella tabella disputes. Il compenso del fattorino con carta deve restare fermo come prima della 184? Oppure va versato lo stesso, visto che il fattorino ha consegnato? Il commento attuale dice «niente blocco su resi».
63. **Un negozio storico sospeso senza partita IVA non si può più riattivare, se nel profilo non è scritto chi l'aveva approvato**. Domanda: un negozio storico sospeso senza «approvato da» e senza partita IVA lo lasciamo riattivare senza partita IVA, o resta fermo finché non esiste una pagina dove inserirla?

## navigazione-gerarchia (1)

64. **Il menu del negoziante ha quattordici voci, fra cui sponsorizzate a pagamento e storie, per un fornaio solo**. Domanda a Nicola: al lancio nascondiamo dal menu del negozio Sponsorizza, Storie e Analisi (AI Studio è già spento), lasciando Ordini, Prodotti, Guadagni, Clienti, Profilo e Aiuto?

## rls-database (1)

65. **Punti fedeltà e premio invito restano al cliente anche quando l'ordine viene rimborsato**. Quando un ordine viene rimborsato, togliamo i punti fedeltà e il premio invito anche se il credito è già stato speso (saldo che può andare sotto zero)? Oggi punti e inviti sono spenti al lancio.

