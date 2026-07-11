# PIANO DI CRESCITA 12 MESI — MyCity Piacenza
**Luglio 2026 → Giugno 2027**
**Scenario: ottimistico approvato | Target: GMV 1,3M€ | Ricavi ~387K€ | Margine ~169K€**

> Documento operativo. Ogni azione ha un owner e una scadenza. Zero budget ads al lancio.
> Aggiornato da: AD digitale MyCity | Data: 2026-07-11

---

## DASHBOARD DEL PIANO

| Mese | Negozi | Ordini | GMV | Reparto critico | Rischio principale |
|------|--------|--------|-----|-----------------|-------------------|
| Lug 2026 | 1 | 80 | 2.500€ | onboarding-negozi + customer-success | Bici rotta: se il lancio slitta, slitta tutto |
| Ago 2026 | 3 | 280 | 9.000€ | vendite + referral crm | Primo negozio non genera ordini: volano non parte |
| Set 2026 | 7 | 700 | 22.000€ | operations + rider-fleet | Rider insufficienti per i picchi del venerdì |
| Ott 2026 | 12 | 1.400 | 45.000€ | vendite + pr-stampa | Concorrente locale si sveglia, copia il modello |
| Nov 2026 | 18 | 2.500 | 80.000€ | operations + dispatch | Rottura del servizio in settimana pre-Natale |
| Dic 2026 | 22 | 3.500 | 112.000€ | finanza + devops-sre | Picchi natalizi schiacciano la piattaforma |
| Gen 2027 | 25 | 2.800 | 90.000€ | account-negozi + crm | Calo post-festività: negozi demotivati, clienti dormienti |
| Feb 2027 | 30 | 3.500 | 112.000€ | growth-monetizzazione | San Valentino non sfruttato: occasione persa |
| Mar 2027 | 36 | 4.500 | 144.000€ | seo + marketing | Traffico organico non decolla, dipendenza dal referral |
| Apr 2027 | 42 | 5.500 | 176.000€ | category-manager | Buchi di catalogo: mancano categorie che i clienti cercano |
| Mag 2027 | 50 | 7.000 | 224.000€ | rider-fleet + capacity-planning | Flotta non scala, tempi consegna peggiorano |
| Giu 2027 | 58 | 8.500 | 272.000€ | finanza + analista | Stagione estiva + Salone del Gusto: picco non pianificato |

---

## I 5 MOLTIPLICATORI
*(Le leve che se fatte bene moltiplicano tutto il resto)*

### M1 — Referral 5€+5€ (già nel codice, va solo acceso)
Ogni cliente soddisfatto porta un amico. Con ordine medio ~31€ e CAC zero, è il canale di acquisizione più potente. Regola: si accende DOPO il primo negozio evadibile, NON prima. Owner: **crm-lifecycle**.
> Impatto stimato: ogni 10 clienti attivi generano 3-4 nuovi. A 50 clienti attivi → +15-20/mese organici.

### M2 — Densità geografica (il loop domanda-offerta)
Più negozi in zona → più clienti che ordinano → più ordini per negozio → più negozi vogliono entrare. La densità risolve anche la logistica: un rider serve 3 negozi nello stesso quartiere. Regola: i negozi non vanno presi a caso — vanno presi per zona, partendo dal quartiere dove già abbiamo un cliente attivo. Owner: **vendite + city-manager**.
> Impatto: da 5 negozi in zona, il costo di consegna scende del 30-40%.

### M3 — PR locale (earned media zero-budget)
Un articolo su Libertà vale 50 post organici. L'angolo notiziabile c'è sempre: "il marketplace dei negozi di Piacenza fatto da un piacentino", "ordini il pane fresco e arriva in 45 minuti", "i negozianti di via X ora vendono online". Owner: **pr-stampa**.
> Target: 1 uscita stampa/mese da agosto. Ogni uscita = +150-300 nuove sessioni sito.

### M4 — Negozio-porta-negozio
Il venditore più soddisfatto è il miglior commerciale. Ogni negozio onboarded conosce altri 5-10 negozianti. Regola: dopo ogni onboarding, l'account-manager chiede esplicitamente 3 nomi di colleghi commercianti. Owner: **account-negozi**.
> Impatto: il 40% dei nuovi negozi (benchmark delivery locale) arriva via referral commerciante.

### M5 — Recensioni post-consegna (già nel codice)
Le recensioni aumentano la fiducia dei nuovi clienti e spingono il SEO locale. Il trigger è già nel codice. Va solo attivato e monitorato. Owner: **customer-success + seo**.
> Target: 4+ stelle di media su Google entro ottobre 2026.

---

## I 5 BLOCCHI
*(Le cose che possono far deragliare il piano)*

### B1 — Il primo negozio non evade gli ordini
**Rischio:** Pane Quotidiano riceve ordini ma consegna in ritardo, sbaglia prodotti, o chiude inaspettatamente. Il primo cliente deluso non torna mai.
**Prevenzione:** customer-success fa una chiamata di briefing prima del lancio, un order-test in bianco il giorno prima, e una chiamata di feedback dopo i primi 5 ordini. operations controlla ogni consegna manualmente per le prime 2 settimane.

### B2 — Nessun rider disponibile al momento del bisogno
**Rischio:** L'ordine entra, ma nessun rider risponde. Il cliente aspetta 2 ore. Il negozio si innervosisce.
**Prevenzione:** courier-acquisition recluta almeno 3 rider freelance prima del lancio, con un accordo informale di disponibilità (non costo fisso). rider-fleet definisce turni minimi (pranzo + cena, venerdì-sabato). Soglia: mai meno di 2 rider disponibili nelle fasce di punta.

### B3 — La piattaforma cade nei momenti peggiori
**Rischio:** downtime durante il pranzo del venerdì, o il weekend di Natale. Un'ora giù = ordini persi, negozi arrabbiati, clienti che non tornano.
**Prevenzione:** devops-sre monitora uptime con alert a Nicola su Telegram. qa esegue test di carico prima di ogni picco previsto. Piano B scritto: cosa fare se il sito cade durante un ordine.

### B4 — I negozi non vengono a patti (tasso di conversione vendite basso)
**Rischio:** vendite contatta 20 negozi, ne firma 2. Il ritmo di crescita è troppo lento.
**Prevenzione:** onboarding done-for-you reale (non "mandami le foto tu", ma "vengo io con il tablet e lo facciamo insieme in 20 min"). Caso studio del primo negozio con numeri veri, usato come pitch deck. account-negozi costruisce il primo success story da mostrare.

### B5 — Il calo post-festività (gennaio 2027)
**Rischio:** dicembre esplode, gennaio crolla. I negozi vedono -60% di ordini e mollano.
**Prevenzione:** crm-lifecycle prepara la campagna "rientro gennaio" già a novembre. growth-monetizzazione propone un bundle invernale (comfort food, prodotti caldo). Il calo è atteso: va comunicato ai negozi come "normale stagionalità", con dati comparativi.

---

## FASE 0 — Preparazione (questa settimana, prima del lancio)
**Obiettivo: arrivare al lancio con tutto pronto. Zero improvvisazione.**

### onboarding-negozi
- [ ] Fare l'onboarding completo di Pane Quotidiano: vetrina aggiornata, catalogo con almeno 10 prodotti, payout configurato e testato con un ordine in bianco di 1€
- [ ] Scrivere la checklist di onboarding standard (20 passi) che si userà per ogni negozio futuro
- [ ] Definire i campi obbligatori minimi: nome, foto, orari, indirizzo, almeno 5 prodotti con foto e prezzo

### customer-success
- [ ] Chiamata con il titolare di Pane Quotidiano: spiega come riceve gli ordini, come li evade, cosa fare se non può consegnare (piano B)
- [ ] Prepara il messaggio di benvenuto automatico che il cliente riceve dopo il primo ordine
- [ ] Prepara il template della chiamata di feedback post-consegna (5 domande, 3 minuti)

### operations + rider-fleet
- [ ] Reclutare e briefare almeno 3 rider freelance: accordo informale, tariffa per consegna (~3,50-4€ a giro), disponibilità minima richiesta (pranzo + cena, lunedì-sabato)
- [ ] Definire la zona di consegna del lancio: raggio 2,5km da Pane Quotidiano
- [ ] Creare la chat WhatsApp operativa: Nicola + rider + owner PQ per comunicazioni rapide

### crm-lifecycle
- [ ] Attivare il trigger referral 5€+5€ (è già nel codice): verificare che funzioni end-to-end con un test
- [ ] Scrivere l'email di benvenuto serie (3 email): benvenuto, come funziona, prima spesa
- [ ] Attivare il trigger recensione post-consegna (è già nel codice): verifica che arrivi a 2h dalla consegna

### marketing
- [ ] Lista di 30 potenziali negozi a Piacenza (food + botteghe vicinato) da contattare ad agosto: nomi, indirizzi, Instagram/Facebook se presente, nome del titolare se trovabile
- [ ] Definire i 3 quartieri prioritari per la densità (dove abitano i primi clienti test)
- [ ] Scrivere il "brief del lancio" da dare a pr-stampa e content-social

### pr-stampa
- [ ] Scrivere il comunicato stampa di lancio (angolo: "MyCity, il marketplace dei negozi di Piacenza, parte questa settimana")
- [ ] Identificare 5 giornalisti/redattori di Libertà, Telelibertà, Piacenza24 con email diretta
- [ ] Non inviare ancora: pronto da inviare il giorno del lancio (o il giorno dopo il primo ordine evaso)

### content-social
- [ ] Scrivere 7 post (una settimana di contenuti) per il lancio: storia di PQ, come funziona MyCity, prima consegna, behind the scenes
- [ ] Post-launch reel: "il primo ordine di MyCity" (girato da Nicola con il telefono, stile autentico)
- [ ] Calendario editoriale luglio: 3 post/settimana, temi già assegnati

### seo
- [ ] Ottimizzare la scheda Google Business Profile di MyCity: descrizione aggiornata, categorie, orari, foto, URL sito
- [ ] Scrivere la scheda Google per Pane Quotidiano (collegata al profilo negozio su MyCity)
- [ ] Aggiornare meta tag e description delle pagine principali del sito

### designer
- [ ] QR code da stampare e appendere in cassa da Pane Quotidiano: "Ordina online su MyCity"
- [ ] Locandina A4 da mettere in vetrina: "Ora disponibile anche su MyCity.it"
- [ ] 3 template social riutilizzabili (sfondo neutro + logo + slot testo) da dare a content-social

### finanza
- [ ] Calcolo unit economics del lancio: costo per consegna (rider ~3,5€ + packaging), commissione incassata (%), break-even per ordine
- [ ] Definire il margine minimo per negozio per essere redditizio a regime
- [ ] Aprire il foglio di monitoraggio cassa: entrate (commissioni), uscite (rider), saldo settimanale

### qa + devops-sre
- [ ] Test completo del flusso: ordine → pagamento → notifica negozio → preparazione → consegna → recensione
- [ ] Test di carico leggero (50 ordini simultanei simulati): il sito regge?
- [ ] Alert Telegram attivo per downtime: Nicola riceve ping entro 60 secondi da una caduta

### trust-safety
- [ ] Definire le regole minime di moderazione: cosa succede se un cliente lascia una recensione falsa, se un negozio non evade un ordine, se c'è una disputa
- [ ] Scrivere il playbook di escalation (chi fa cosa se c'è un problema): 1 pagina, in italiano semplice

### legale-privacy
- [ ] Verificare che i termini e condizioni per i venditori siano aggiornati e firmati da Pane Quotidiano prima del lancio
- [ ] Verificare che i clienti accettino la privacy policy al momento della registrazione

---

## FASE 1 — Accensione (Luglio–Settembre 2026): 1→7 negozi

### LUGLIO 2026 — Il lancio
**Obiettivo: 1 negozio live, 80 ordini, GMV 2.500€ (~31€ scontrino medio)**

#### Chi fa cosa

**onboarding-negozi**
- Pane Quotidiano live entro martedì 15 luglio (dopo riparazione bici)
- Primo ordine di test evaso con successo: screenshot → primo asset di credibilità
- Scheda negozio completa: foto, orari, 15+ prodotti con descrizione e prezzo reale

**customer-success**
- Chiama ogni cliente dopo le prime 5 consegne: raccoglie feedback, ringrazia, chiede di condividere il codice referral
- Gestisce ogni problema in tempo reale (chat WhatsApp operativa con PQ e rider)
- Obiettivo: 0 consegne disastrose nelle prime 2 settimane

**operations + rider-fleet**
- Presidia ogni ordine manualmente per le prime 2 settimane: Nicola o rider confermano ogni giro
- Turni rider attivi: lunedì-sabato, 12:00-14:00 e 18:30-21:00
- Tempistica target: ordine → consegna in 45 minuti

**crm-lifecycle**
- Referral 5€+5€ attivo: ogni cliente riceve il link dopo la prima consegna
- Email di benvenuto inviata entro 30 minuti dall'iscrizione
- Trigger recensione Google attivato 2h dopo ogni consegna completata

**pr-stampa**
- Invia il comunicato stampa il giorno del primo ordine evaso (non prima)
- Segue up con i 5 giornalisti identificati: propone una visita a Pane Quotidiano con Nicola
- Obiettivo: 1 articolo su Libertà entro fine luglio

**content-social**
- 3 post/settimana su Instagram/Facebook MyCity: racconto del lancio, primi clienti, dietro le quinte
- Il reel "primo ordine" pubblicato entro 48h dalla prima consegna
- Risposta a ogni commento entro 4h

**seo**
- Pubblica il post sul blog "MyCity, dove ordinare online a Piacenza" (targeting keyword locale)
- Completa l'ottimizzazione on-page delle 5 pagine principali

**analista**
- Dashboard attiva: ordini/giorno, scontrino medio, tasso di ritorno clienti, referral convertiti
- Report settimanale per Nicola (venerdì, 10 righe max): cosa funziona, cosa no

#### Gate per passare ad agosto
- Almeno 80 ordini completati con successo ✓
- Nessun problema di consegna irrisolto ✓
- Almeno 3 clienti che hanno usato il referral ✓
- Pane Quotidiano soddisfatto e confermato per agosto ✓

---

### AGOSTO 2026 — I primi tre
**Obiettivo: 3 negozi, 280 ordini, GMV 9.000€ (~32€ scontrino medio)**

#### Chi fa cosa

**vendite**
- Contatta 15 negozi food/botteghe dalla lista preparata in fase 0
- Pitch di 20 minuti, in negozio, con tablet: mostra i numeri reali di Pane Quotidiano (ordini, incassi, ore lavorate)
- Obiettivo: 2 contratti firmati entro il 31 agosto (totale: 3 negozi incluso PQ)
- Priorità: negozi nello stesso quartiere o nei quartieri contigui a PQ (densità!)
- Il pitch deck usa i dati reali di luglio: "a luglio PQ ha fatto X€ in più con 0 costi fissi"

**onboarding-negozi**
- Onboarding dei 2 nuovi negozi in <48h ciascuno: vieni tu, porti il tablet, fai la foto ai prodotti, configuri il payout
- Ogni negozio parte con almeno 10 prodotti e un catalogo fotografato professionalmente (telefono + luce naturale = ok)

**account-negozi**
- Check-in settimanale con Pane Quotidiano: come va, cosa manca, cosa non funziona
- Chiedi esplicitamente 3 nomi di altri negozi che potrebbero entrare (negozio-porta-negozio)
- Costruisce il primo "caso studio" scritto di PQ da usare nel pitch: numeri reali, citazione del titolare

**crm-lifecycle**
- Campagna "porta un amico di agosto": push del referral 5€+5€ con email dedicata
- Win-back dei clienti che hanno ordinato una volta a luglio e non sono tornati: email "ti è mancato qualcosa?"
- Target: tasso di ritorno ≥30% dei clienti di luglio

**influencer-partnership**
- Identifica 5 micro-influencer di Piacenza (food, lifestyle, quartiere): account Instagram con 1.000-10.000 follower locali
- Proposta barter: ti consegniamo 2 ordini gratis, tu fai una story autentica
- Obiettivo: almeno 2 collaborazioni attive entro fine agosto

**content-social**
- Calendario editoriale agosto: "la settimana della bottega" (storia di ogni negozio onboarded)
- Reel "il giro del rider" (girato con il telefono, stile documentario autentico)
- UGC: reshare di ogni foto/post dei clienti che taggano MyCity

**pr-stampa**
- Seguito dell'articolo di luglio: "MyCity cresce, ora tre negozi" — angolo notiziabile = la velocità di espansione
- Propone un servizio a Telelibertà: video in negozio con il titolare

**relazioni-istituzionali**
- Prepara la bozza di mail per Hub Urbano (Comune di Piacenza): NON inviare ancora (gate: primo negozio live e attivo)
- Monitora la scadenza del bando ER (21 luglio): se la prima bottega è live, valuta l'invio entro il 20 luglio
- Identifica 2 associazioni di categoria (Confcommercio/Confesercenti) da contattare a settembre

**finanza**
- Report mensile agosto: margine per ordine per ciascun negozio, costo rider/mese, saldo cassa
- Analizza se la commissione copre il costo rider: se no, propone aggiustamento

**devops-sre + qa**
- Test di carico per 3 negozi simultanei: il sito regge 50 ordini/giorno?
- Monitora i tempi di risposta: la pagina negozio deve caricarsi in <2 secondi

#### Gate per passare a settembre
- 3 negozi attivi con almeno 2 ordini/giorno ciascuno ✓
- Almeno 10 clienti con 2+ ordini (coorte fedele formata) ✓
- 1 uscita stampa confermata ✓
- Margine per ordine positivo o breakeven ✓

---

### SETTEMBRE 2026 — Il decollo
**Obiettivo: 7 negozi, 700 ordini, GMV 22.000€ (~31€ scontrino medio)**

*Settembre è il mese chiave: la gente torna dalle vacanze, riprende le abitudini, è aperta a nuovi servizi. Finestra di 6 settimane per costruire l'abitudine.*

#### Chi fa cosa

**vendite**
- Contatta altri 20 negozi: ora ha il caso studio di agosto con i numeri reali
- Obiettivo: 4 nuovi contratti in settembre (totale: 7 negozi)
- Priorità categorie: 1 panifico/bar, 1 gastronomia, 1 fruttivendolo/verduriere, 1 bottega alimentare
- Usa referral commerciante: ogni negozio già dentro dà 3 nomi → lista calda di 9 prospect

**onboarding-negozi**
- 4 onboarding in settembre: 1 a settimana, mai più di 1 per volta per garantire qualità
- Ogni onboarding include: sessione foto prodotti (30 min), configurazione payout (10 min), test ordine in bianco (5 min), briefing sull'app (15 min)
- Crea il "kit di avvio negozio": sacchetti con QR MyCity, locandina vetrina, istruzioni app

**account-negozi**
- Check-in settimanale con tutti i negozi (10 min/negozio × 7 = 70 min/settimana)
- Health score semplice per ciascuno: ordini/settimana, tasso di evasione (%), rating clienti
- Se un negozio scende sotto 5 ordini/settimana: call di emergenza entro 24h

**operations + rider-fleet**
- Ricruita altri 3 rider: ora ne servono almeno 5 attivi per coprire 7 negozi
- Ottimizza i giri: 1 rider può fare 2-3 consegne in fila se i negozi sono vicini (dispatch semplice)
- Turni estesi: aggiungi la fascia 16:00-18:00 (merenda, prodotti di fine giornata in sconto)

**marketing**
- Campagna "settembre a Piacenza, la tua bottega online": landing page + post serie "ti presento il negoziante"
- Attiva il codice sconto primo ordine (-5€) per i nuovi iscritti referral (già nel codice)
- Coordinate con pr-stampa per coincidere con articoli/uscite stampa

**crm-lifecycle**
- Segmenta i clienti: fedeli (3+ ordini) vs occasionali (1-2 ordini) vs dormienti (0 ordini da 2 settimane)
- Email personalizzata per ogni segmento: fedeli → upgrade (ordina di più), occasionali → reminder, dormienti → win-back
- Lancia il programma "spesa del lunedì": reminder automatico ogni lunedì mattina per chi ordina tipicamente a inizio settimana

**influencer-partnership**
- Attiva 3-5 collaborazioni barter: creator cucinano con i prodotti dei negozi MyCity e taggano
- Obiettivo: 5.000+ impression organiche da UGC in settembre

**pr-stampa**
- 2 uscite stampa in settembre: articolo di apertura settembre + approfondimento su Telelibertà
- Angolo: "la bottega di quartiere rinasce online" — storia umana del negoziante, non tecnologia

**seo**
- Pubblica 4 articoli blog: "migliore [categoria] a Piacenza", "consegna a domicilio [zona]"
- Ottimizza le schede negozio con keyword locali (es. "pane fresco a Piacenza nord")
- Target: entrare in top 10 Google per "consegna a domicilio Piacenza" entro fine settembre

**relazioni-istituzionali**
- Invia la mail all'Hub Urbano (Comune) se il primo negozio è ancora attivo e funzionante
- Prima riunione con un'associazione di categoria: brief su MyCity, proposta di partnership
- Esplora il bando ER per startup digitali: requisiti, scadenze, importi

**growth-monetizzazione**
- Analizza lo scontrino medio per categoria: qual è il prodotto/negozio con ordine medio più alto?
- Propone il primo bundle: "colazione completa" (pane + pasticceria + caffè da diversi negozi)
- Test: soglia spedizione gratis a 25€ vs 35€ — quale porta più ordini? (analista misura)

**analista + data-engineer**
- Coorte analysis: dei clienti di luglio, quanti hanno ordinato 2+ volte? 3+ volte?
- Mappa della domanda geografica: dove abitano i clienti? Quali zone sono scoperte di negozi?
- Report mensile per Nicola: KPI core + 3 insight azionabili

#### Gate per passare a ottobre
- 7 negozi attivi, tutti con almeno 3 ordini/settimana ✓
- 100+ ordini completati in almeno 1 settimana ✓
- SEO: prima posizione Google per almeno 1 keyword locale ✓
- Margine cumulativo: siamo in pareggio o positivi? ✓
- Pipeline vendite settembre/ottobre: almeno 5 prospect caldi ✓

---

## FASE 2 — Accelerazione (Ottobre–Dicembre 2026): 7→22 negozi

### OTTOBRE 2026 — La densità
**Obiettivo: 12 negozi, 1.400 ordini, GMV 45.000€**

**Cambio di marcia:** da "esploriamo" a "sistematizziamo". Il processo di onboarding deve girare in autonomia. Nicola supervisiona, i senior eseguono.

**vendite**
- Pipeline strutturata: 30 prospect → 15 contatti → 8 pitch → 5 trattative → 3 firme
- Script di vendita codificato: i 3 obiezioni più comuni e le risposte con i dati reali
- Referral commerciante sistematizzato: ogni negozio onboarded riceve il kit "porta un collega" (include un coupon per il negoziante che porta un nuovo negozio)
- Obiettivo ottobre: +5 negozi (totale 12)

**onboarding-negozi**
- Tempo di onboarding portato a <3h per negozio (dall'accordo alla vetrina live)
- Crea il video-tutorial per i negozianti: 10 minuti, come usare l'app, come eludere gli ordini
- Identifica i 3 errori più comuni dei negozi nei primi 7 giorni e li previene con una checklist

**account-negozi**
- Health score settimanale per tutti i 12 negozi
- Identifica i top performer: li mette in vetrina sulla home di MyCity
- Identifica i negozi a rischio (sotto 5 ordini/settimana): piano di rilancio personalizzato

**marketing + content-social**
- Campagna Halloween (25-31 ottobre): prodotti a tema, bundle da paura
- "I negozi della settimana": rotazione in home page e post dedicati (aumenta il traffico ai negozi con meno visibilità)
- Obiettivo: 500+ follower Instagram MyCity entro fine ottobre

**pr-stampa**
- Angolo: "MyCity raggiunge i 12 negozi: la rete dei commercianti di Piacenza cresce"
- Propone un'intervista a Nicola su Libertà: storia personale + visione del marketplace
- Target: 2 uscite su testate locali in ottobre

**relazioni-istituzionali**
- Riunione con Comune di Piacenza (assessore allo sviluppo economico): presenta i dati, propone partnership
- Contatta Confcommercio Piacenza: propone accordo preferenziale per i soci (onboarding gratuito, 3 mesi commissione ridotta)

**operations + rider-fleet + dispatch**
- 8 rider attivi (target: 1 rider per negozio nelle fasce di punta)
- Introduce il sistema di prenotazione slot consegna: il cliente sceglie "ora" o "tra 30-45 min"
- Ottimizza i percorsi: dispatch raggruppa gli ordini per zona, riduce il costo per consegna

**growth-monetizzazione**
- Lancia il primo bundle ufficiale: "Colazione della Domenica" (3 prodotti da 3 negozi diversi)
- Test prezzo: +1€ alla fee di consegna con nota "supporti i negozi locali" — impatto sul tasso di conversione?

**finanza**
- P&L mensile: ricavi (commissioni + fee consegna), costi (rider), margine lordo
- Punto di break-even operativo: a quanti ordini/mese siamo in pareggio?

---

### NOVEMBRE 2026 — La spinta pre-natalizia
**Obiettivo: 18 negozi, 2.500 ordini, GMV 80.000€**

**vendite**
- +6 negozi in novembre: focus su gift e prodotti natalizi (pasticcerie, salumerie, vino, prodotti tipici)
- Pitch speciale: "arriva Natale: i tuoi clienti ordinano già da casa" — senso di urgenza reale
- Obiettivo: avere almeno 2 negozi di pasticceria/confetteria online per le festività

**marketing + content-social + influencer-partnership**
- Campagna "il regalo piacentino": kit regalo con prodotti di più negozi, da ordinare su MyCity
- "Calendario dell'avvento MyCity": 1 prodotto/giorno dal 1° al 24 dicembre (già preparato a novembre)
- Collaborazione con 3 influencer: "regala Piacenza" — prodotti locali, consegna a domicilio

**pr-stampa**
- Grande articolo di novembre: "il Natale a Piacenza si fa online con MyCity" — angolo economia locale, non tecnologia
- Propone il pezzo a Libertà: vuole essere in edicola la settimana prima dell'Avvento (fine novembre)

**relazioni-istituzionali**
- Partecipi all'evento natalizio del centro: stand o materiali MyCity (QR, volantini, sacchetti)
- Propone partnership con Vita in Centro per il Natale: "fai il tuo acquisto natalizio nella bottega di quartiere, consegnato a casa"

**operations + rider-fleet + capacity-planning**
- Piano capacità natalizio: quanti rider servono nelle settimane 14-24 dicembre?
- Predispone lista di rider "di riserva" per i picchi: accordi verbali con 5 rider aggiuntivi
- Definisce il protocollo gestione picchi: cosa succede se ci sono 200 ordini in un giorno?

**growth-monetizzazione**
- Bundle regalo: cofanetti MyCity (prodotti tipici piacentini, valore 30-50-80€)
- Gift card MyCity: da 20-50-100€, comprabili online e regalabili
- Upsell in cart: "aggiungi il fiocco e la carta regalo (+2€)"

**crm-lifecycle**
- Email di novembre: "prepara la lista dei regali natalizì su MyCity"
- Segmenta i clienti "regalo vs uso quotidiano": campagne diverse per ognuno
- Win-back di tutti i dormienti: "è quasi Natale, ordina qualcosa di speciale"

**finanza**
- Budget rider per dicembre: stima il costo e assicurati che la cassa regga il picco
- Calcola l'anticipo che i negozi potrebbero chiedere: se un negozio chiede un anticipo sui payout, quando possiamo darglielo?

---

### DICEMBRE 2026 — Il primo Natale
**Obiettivo: 22 negozi, 3.500 ordini, GMV 112.000€**

**Il mese più importante dell'anno. Ogni sistema deve reggere.**

**operations + rider-fleet + dispatch**
- Flotta completa attiva: 12 rider (8 fissi + 4 riserva)
- Sala operativa live durante le giornate critiche (20-24 dicembre): Nicola supervisiona in tempo reale
- Piano contingenza scritto: cosa succede se un rider si ammala, se un negozio chiude, se il sito va giù

**devops-sre + qa**
- Test di carico a 200 ordini/giorno (già il 1° dicembre, non il 24)
- Monitoraggio h24 dal 20 al 26 dicembre: alert Telegram per ogni anomalia
- Piano rollback documentato: se qualcosa si rompe, cosa si fa nei prossimi 15 minuti

**content-social + marketing**
- "Calendario dell'avvento MyCity" in esecuzione: 1 post/giorno dal 1° al 24
- Racconto dei "regali ritirati dai negozi locali": storie vere dei clienti (con permesso)
- Christmas reel: "la consegna del 24 dicembre" — il rider porta i dolci, il negoziante saluta, la famiglia apre la porta

**crm-lifecycle**
- Email serie natalizia: 24 novembre → 24 dicembre, frequenza 2/settimana
- Ultima email il 23 dicembre ore 18: "ordina entro mezzanotte, consegniamo domani mattina"
- Campagna "regalo dell'ultimo minuto": 22-24 dicembre, focus su prodotti food consegnabili in 45 min

**pr-stampa**
- Follow-up natalizio: articolo post-Natale (26-27 dicembre) "MyCity ha consegnato X ordini nel giorno di Natale"
- Dati reali: numero ordini, negozi coinvolti, quartieri serviti → notiziabile

**finanza**
- Monitoraggio cassa settimanale in dicembre: il picco di ordini genera anche un picco di costi rider
- Assicurati che il margine per ordine non crolli per il mix di prodotti natalizi (regalo vs quotidiano)

**growth-monetizzazione**
- Last-minute bundle: "panettone + vino + salumi" → consegna entro 2h
- Promemoria post-capodanno: già scritto il 26 dicembre, programmato per il 2 gennaio

---

## FASE 3 — Scala (Gennaio–Giugno 2027): 22→58 negozi

*In questa fase il sistema gira. Nicola supervisiona, i senior eseguono. La struttura è in parallelo: ogni reparto ha il suo ritmo.*

### Q1 2027 (Gennaio–Marzo): 22→36 negozi

**Sfida principale:** gennaio è sempre il mese del calo. Va gestito proattivamente, non reattivamente.

**vendite**
- Continuare a firmare 4-6 nuovi negozi/mese
- Obiettivi: 25 negozi (gen), 30 (feb), 36 (mar)
- Nuove categorie da aprire: fioraio, tabacchino/edicola, farmacia, prodotti per la casa
- Incentivo negozianti di gennaio: "commissione ridotta nei primi 3 mesi" per chi si iscrive in gennaio (costo certo per MyCity, aumenta il tasso di conversione delle trattative)

**account-negozi**
- Calo previsto: comunicalo ai negozi a dicembre come "normale stagionalità, succede a tutti"
- Piano di rilancio gennaio: "saldi di gennaio" — prodotti in sconto, bundle invernali
- Health score: monitoraggio settimanale, intervento entro 48h se un negozio è sotto soglia

**crm-lifecycle + growth-monetizzazione**
- Campagna "rientro gennaio": email 2 gennaio + push notification "bentornato, ecco cosa ti sei perso"
- San Valentino (campagna attiva dal 1° febbraio): bundle romantici, fiori + cioccolata + vino
- Bundle "giorno della marmotta" (febbraio): il cibo di conforto per il freddo invernale

**marketing + seo**
- L'obiettivo SEO di Q1: top 5 su Google per "consegna a domicilio Piacenza" e "spesa online Piacenza"
- Blog: 8 articoli/mese con keyword locali (es. "migliore gastronomia Piacenza consegna")
- Link building locale: partnership con siti di news piacentini, blog food locali

**pr-stampa**
- Bilancio di fine anno: comunicato "MyCity nel 2026: X ordini, X negozi, X euro di GMV per i commercianti locali"
- Angolo economia locale: "quanto hanno guadagnato in più i negozi di Piacenza grazie al digitale"
- Target: 1 uscita/mese su Libertà, 1 su Telelibertà

**relazioni-istituzionali**
- Proponi un accordo con Confcommercio Piacenza: onboarding agevolato per i soci
- Partecipi alla Fiera di Sant'Antonino (gennaio): stand MyCity, QR per iscrizione immediata
- Esplora bandi Emilia-Romagna per il digitale e l'e-commerce: scadenze, importi, requisiti

**operations + rider-fleet + capacity-planning**
- Pianifica la flotta per Q2 (picchi primaverili): quanti rider servono a maggio con 7.000 ordini/mese?
- Introduce i turni strutturati: rider con accordo fisso (3 giorni/settimana) vs rider di punta (weekend)
- Costo consegna: ottimizza i giri per ridurre il costo medio sotto i 3€ con la densità

**finanza + analista**
- Budget Q1: quanto generiamo vs quanto spendiamo? Runway attuale?
- Unit economics mature: costo acquisizione cliente (CAC), LTV a 6 mesi, margine per negozio
- Se il margine lo permette: valuta l'attivazione delle prime campagne ads Meta a basso budget (100€/mese → test)

---

### Q2 2027 (Aprile–Giugno): 36→58 negozi

**Sfida principale:** la crescita deve accelerare ulteriormente per raggiungere 58 negozi. Serve il sistema, non Nicola che fa tutto da solo.

**vendite**
- Obiettivi: 42 negozi (apr), 50 (mag), 58 (giu)
- +6 negozi/mese: serve un ritmo consolidato di 2 pitch a settimana, 1 firma ogni 5 giorni
- Nuovi canali: associazioni di categoria portano i loro soci (accordo Confcommercio valutato in Q1)
- Evento speciale (aprile/maggio): "MyCity Open Day" — i potenziali negozianti vengono a vedere come funziona dal vivo

**onboarding-negozi**
- Processo completamente scalabile: il negoziante può fare l'onboarding autonomamente con video-guida
- Nicola o un rider "di fiducia" fa solo la prima visita in negozio per i nuovi
- Tempo medio onboarding: <2h dall'accordo alla vetrina live

**account-negozi**
- Sistema di health score automatizzato: alert automatico se un negozio non riceve ordini per 3 giorni
- Top performer: programma "Negozio del Mese" — visibilità speciale, comunicato stampa, post dedicato
- Introduce il primo "upsell catalogo": suggerisce ai negozi di aggiungere prodotti nelle categorie dove c'è domanda ma niente offerta

**marketing + content-social**
- Calendario editoriale Q2: la primavera, la Fiera del Po (maggio), il Salone del Gusto (giugno)
- Campagna "Piacenza in tavola": racconto dei prodotti tipici, abbinamenti, ricette con i prodotti dei negozi
- Meta ads: se il margine lo permette, attiva campagne retargeting (chi ha visitato il sito ma non ha ordinato)

**pr-stampa + relazioni-istituzionali**
- Salone del Gusto (giugno): partnership con gli organizzatori per la consegna a domicilio dei prodotti
- Articolo "MyCity a un anno dal lancio": bilancio, numeri, storie di negozianti
- Comune: proponi di essere il marketplace ufficiale dei negozi del centro storico di Piacenza

**seo**
- Target: 1.500+ sessioni organiche/mese dal sito
- Schema.org completato per tutti i negozi: product, review, local business
- Google Business Profile di ogni negozio con almeno 10 recensioni

**growth-monetizzazione + crm-lifecycle**
- Lancia "MyCity Summer": abbonamento mensile (10€/mese → 5 consegne gratis)
- Estate: bundle aperitivo, picnic, cena sul Po
- Campagna riattivazione: chi non ordina da 30 giorni riceve offerta personalizzata

**finanza + analista**
- A giugno 2027: GMV 272.000€ mensili → analizza il trajectory verso il milione mensile (Q4 2027 stimato)
- LTV per coorte: quanto vale un cliente acquisito a luglio 2026 a giugno 2027?
- Proposta per Nicola: è il momento di valutare un investimento in campagne ads strutturato (budget mensile, obiettivi, ROAS atteso)

**devops-sre + qa**
- Test di carico trimestrale: la piattaforma regge 8.500 ordini/mese?
- Monitoring dashboard evoluta: metriche real-time, alert per anomalie, uptime ≥99,5%

**trust-safety**
- A 58 negozi e 8.500 ordini/mese il rischio frode aumenta: implementa il sistema di scoring automatico
- Regole di moderazione: aggiornate con i casi reali emersi in 12 mesi

---

## NOTE FINALI — Come si usa questo piano

1. **Non è un piano fisso, è una bussola.** I numeri cambieranno. Quello che conta è il ritmo e la direzione.

2. **Il gate tra le fasi è reale.** Se a fine luglio non ci sono 80 ordini, non si passa ad agosto come se niente fosse: si capisce perché e si aggiusta.

3. **I senior ricevono questo piano e sanno cosa tocca a loro.** Ogni reparto ha il suo pezzo. Il chief-of-staff tiene il percorso critico aggiornato.

4. **Nicola approva, non esegue.** A partire da settembre 2026, Nicola supervisiona e firma le decisioni importanti. I senior (AD digitale + agenti) eseguono il lavoro operativo.

5. **La cassa comanda.** Se il margine non regge, si rallenta. Se il margine cresce più del previsto, si accelera. La finanza fa il report mensile entro il 3 di ogni mese.

---

*Piano creato da: AD digitale MyCity | 2026-07-11 | Revisione prevista: ogni primo lunedì del mese*
