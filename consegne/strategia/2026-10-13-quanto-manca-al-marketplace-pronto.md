---
data: 2026-10-13 08:54
tipo: analisi-tempi-lancio
richiesta: «Fammi capire quanto tempo ci vuole per avere il marketplace pronto, tutti i problemi risolti e com'è fatto il marketplace una volta finito»
precisazione: «Finito= pronto per operare» (Nicola, stessa conversazione)
fonti: radiografia del sito dell'11/10 · registro dei difetti del sito · database del sito letto in sola lettura il 13/10 alle 08:44 · coda delle azioni in attesa · CONTESTO_BUSINESS.md
---

# Il marketplace può vendere verso il 10 novembre, se le tue firme arrivano in tempo

**In due righe.** Il codice lo riparo io in circa una settimana; il resto aspetta firme e scelte che spettano a te. Con un'ora al giorno da parte tua, il sito vende verso il 10 novembre.

## In parole semplici

Il codice del sito lo riparo in fretta: il 3 settembre ho chiuso 97 problemi seri su 110 in un giorno solo. Quello che allunga i tempi sono le firme e le scelte che spettano a te. Se ci dedichi circa un'ora al giorno, il sito può vendere davvero in tre o quattro settimane. Vuol dire verso il 10 novembre.

## Cosa cambia per te

- **Il traguardo giusto non è «zero problemi».** Ogni radiografia profonda ne trova di nuovi. In dodici giorni, fra agosto e settembre, ne ho chiusi 529. Poi la radiografia di ottobre ne ha trovati altri 307. Il traguardo è un altro: vendere senza fare danni.
- **Il tempo dipende più da te che da me.** Nella coda delle cose da firmare ci sono 37 azioni rosse, cioè quelle che toccano soldi, legge, clienti o produzione. Metà aspetta da più di 51 giorni.
- **Il marketplace finito è un mercato online dei negozi di Piacenza.** Il cittadino compra da più botteghe con un carrello solo. Paga con la carta o in contanti, e riceve la spesa a casa all'ora che ha scelto.

## Cosa devi fare

Oggi una cosa sola: chiudere le due porte aperte del database. Cambi le chiavi su Supabase e la password dell'amministratore, con i passi che ti ho dato in chat il 12 ottobre. È circa mezz'ora. Quando hai fatto, scrivimi «ok 205» e parto con la riparazione del codice.

## Cosa non ho verificato

- **Stripe non lo vedo.** Non so se il conto di MyCity è pronto a incassare con la carta.
- **Le date sono una mia stima, non una promessa.** Reggono solo se le tue firme arrivano nella settimana scritta qui sotto.
- **I tempi della partita IVA e dei permessi per il fresco li ho stimati.** Non li ho controllati con un commercialista né con l'ASL.
- **Il sito vero non l'ho aperto in un browser.** I numeri di oggi li ho letti dal database, senza scrivere niente.

---

## 1) Quanto tempo ci vuole per averlo pronto

**Cosa vuol dire «pronto».** Pronto vuol dire che un cliente vero compra, paga e riceve la spesa. E che il fornaio incassa i suoi soldi. Oggi non succede. Il database del sito, letto stamattina alle 08:44, dice questo:

| Cosa | Oggi |
|---|---:|
| Negozi approvati | 2, ma uno è un negozio di prova |
| Prodotti in vetrina | 9: 5 di Pane Quotidiano, 4 del negozio di prova |
| Fattorini approvati | 0 su 1 iscritto |
| Ordini in tutta la storia | 1, del 24 giugno, annullato |
| Problemi aperti sul sito | 470: 11 bloccanti, 109 gravi, 350 minori |

**Il lavoro corre su tre strade, in parallelo.**

1. **Il codice, che faccio io.** Dei 120 problemi seri, cioè bloccanti e gravi, circa 90 si riparano nel codice. Il 3 settembre ne ho chiusi 97 su 110 in un giorno. Poi servono il collaudo, fatto da chi non ha costruito, e il controllo dei file toccati. Conta una settimana.
2. **Le firme, che spettano a te.** Gli altri, circa 30, si chiudono solo con la tua mano. Sono decisioni, modifiche al database da applicare e impostazioni su Vercel e GitHub. In tutto sono poche ore. Però vanno fatte in un ordine preciso. Un esempio: se applichi la modifica al database prima della riparazione del codice, ogni prodotto di Pane Quotidiano diventa «non disponibile».
3. **Il mondo reale, fuori dal sito.** Servono i dati veri del titolare sul sito, quindi la partita IVA. Serve Stripe attivo: incassa per MyCity e paga il fornaio. Serve qualcuno che consegna, perché oggi nessun fattorino è approvato. Per il fresco servono contenitori termici, l'attestato HACCP di chi consegna e la comunicazione all'ASL: lo dice il cancello per i prodotti freschi che la macchina tiene da luglio. E serve Supabase a pagamento, circa 35 dollari al mese: senza, le foto dei prodotti rischiano di non vedersi e il database si riaddormenta.

**Il calendario, se ci dedichi circa un'ora al giorno:**

| Settimana | Tocca a te | Tocca a me |
|---|---|---|
| 13-19 ottobre | Chiavi e password, oggi. Entro mercoledì 14 sera, decidere col responsabile della privacy se avvisare il Garante. Le sei scelte che ti ho preparato. Supabase a pagamento. Togliere il negozio di prova. Chiamare il commercialista per la partita IVA. | Riparo i circa 90 problemi seri del codice, con il collaudo. |
| 20-26 ottobre | Unisci la riparazione. Applichi le modifiche al database, una volta sola: secondo me circa un'ora. Copi su Vercel le altre 8 chiavi che mancano. Cambi su GitHub il segreto delle copie di sicurezza del database. | Controllo la produzione pezzo per pezzo. Chiudo le promesse false che restano. |
| 27 ottobre - 9 novembre | Partita IVA e Stripe attivi. Il fornaio completa il suo fascicolo pagamenti. Prepari le consegne del fresco: contenitori termici, attestato HACCP, avviso all'ASL. | Primo ordine vero dall'inizio alla fine, uno con la carta e uno in contanti. Riparo quello che solo un ordine vero fa vedere. |

**Risultato: pronto a vendere intorno al 10 novembre.** Il pezzo più lento è probabilmente la partita IVA. Le pagine legali ne hanno bisogno, e secondo la radiografia anche Stripe. Se scegli di aprirla più avanti, il problema bloccante sulla legge resta aperto, e da qui non lo posso chiudere io.

**Due date che non si spostano.** Mercoledì 14 ottobre in serata finiscono le 72 ore per decidere se avvisare il Garante della chiave esposta. Il 30 novembre si spegne il modello di intelligenza artificiale che legge le foto e scrive le schede prodotto: la riparazione è piccola, ma va fatta prima.

**Una scorciatoia che ti propongo.** Al lancio teniamo accesa solo la strada essenziale: vetrina, carrello, pagamento, consegna, incasso del negozio. Restano spente l'intelligenza artificiale per i negozi, i buoni regalo, la classifica degli inviti e la newsletter. Restano spenti anche il Drop del giorno, l'app da installare e le statistiche di PostHog. Così 14 dei 120 problemi seri escono dal percorso del lancio. Le riaccendiamo una alla volta, quando servono. È anche la regola del tuo documento sul business: mai dodici funzioni insieme. Te l'ho messa fra le cose da approvare.

**Se invece le firme vanno al ritmo di queste settimane,** ci vogliono mesi, non settimane. Intanto il sito non sta fermo ad aspettare: si rompe da solo. Il 10 ottobre, per esempio, il database era in pausa e nessuno poteva comprare.

## 2) Quando sono risolti tutti i problemi

**La risposta onesta: zero problemi non arriva mai, per nessun sito.** Più occhi ci metti sopra, più cose trovi: l'11 ottobre i revisori erano 195. Il conto del registro del sito lo mostra:

| Data | Problemi aperti | Cosa è successo |
|---|---:|---|
| 22 agosto | 167 | |
| 27 agosto | 361 | una radiografia ne trova 194 nuovi |
| 9 settembre | 166 | 529 chiusi in dodici giorni, intanto ne nascono altri |
| 11 ottobre | 470 | una radiografia ne trova 307 nuovi; 25 di questi erano già chiusi e sono tornati |

C'è anche un altro conto. Su 1.256 schede scritte finora, 150 sono saltate fuori riguardando i file appena riparati.

**Il traguardo che ti propongo sono quattro cose verificabili:**

1. zero problemi bloccanti e zero gravi aperti;
2. un ordine vero pagato con la carta e uno in contanti, consegnati, con il fornaio pagato;
3. una copia di sicurezza del database che riesce: finora ne sono fallite 60 su 60;
4. ogni promessa del sito uguale a quello che fa la cassa: prezzi, sconti, tempi di consegna.

**I 350 problemi minori.** Sono soprattutto testi, grafica, accessibilità e casi rari, e non fermano la vendita. Servono due giri di riparazione, circa due settimane, e possono correre insieme al resto. Se le firme arrivano, la lista di oggi si svuota verso fine novembre.

**Poi ne arriveranno altri, ed è normale.** I revisori dell'11 ottobre hanno elencato 411 punti che da qui non potevano vedere. Molti chiedono ordini veri, Stripe acceso o il sito aperto in un browser vero. Li vedremo solo quando il sito lavora. Per questo propongo una radiografia nuova dopo il primo mese di ordini veri.

## 3) Com'è fatto il marketplace pronto per operare

Hai precisato che «finito» vuol dire pronto per operare. Quindi la risposta è il marketplace del 10 novembre, se il calendario regge. È quello che ha superato le quattro prove del punto 2.

**Chi c'è dentro.** All'inizio c'è un negozio vero: Pane Quotidiano, con i suoi 5 prodotti. Il negozio di prova sparisce. Gli altri negozi entrano quando li porti tu: il sito li regge, ma nel database oggi non ce n'è un altro.

**Come gira un ordine:**

1. **La cliente.** Apre il sito dal telefono, magari dal codice QR sulla vetrina del forno. Trova il pesto di Pane Quotidiano e lo mette nel carrello. Ci può aggiungere prodotti di altri negozi: il carrello è uno solo. Sceglie una fascia oraria e paga con la carta, oppure in contanti alla consegna. Per la consegna paga 3 euro.
2. **Il negoziante.** Riceve l'ordine nel suo pannello e lo accetta. Prepara la borsa e preme «pronto». Circa un'ora dopo la consegna, il sito gli gira sul conto Stripe il prezzo meno il 10% di MyCity.
3. **Chi consegna.** All'inizio sei tu: avevi deciso di consegnare in proprio fino a circa 30 ordini al giorno, con fattorini a 3-5 euro solo per i picchi. Si ritira col codice del negozio e si consegna col codice della cliente. Se lei paga in contanti, si scatta una foto e si fa firmare.
4. **Tu, dal pannello.** Approvi negozi e fattorini, segui ordini, resi e reclami. Registri i contanti incassati, e così parte il pagamento al negozio.

**I soldi di un ordine, con un esempio.** Una spesa da 35 euro da Pane Quotidiano: la cliente paga 38 euro, cioè 35 di spesa e 3 di consegna. Il fornaio riceve 31,50 euro, cioè 35 meno il 10%. MyCity tiene 3,50 euro, più i 3 della consegna, con cui paga chi consegna. Sotto i 30 euro per negozio la cliente paga in più la spedizione: 2,50 euro più 1,20 per ogni chilometro, e resta a MyCity.

**Cosa è acceso e cosa è spento.**

| Acceso | Spento al lancio, se approvi la scorciatoia |
|---|---|
| Vetrina, ricerca, pagine dei negozi | Intelligenza artificiale per i negozi |
| Carrello con più negozi, fasce orarie | Buoni regalo |
| Pagamento con la carta e in contanti | Classifica degli inviti, newsletter |
| Consegna seguita sulla mappa | Drop del giorno |
| Resi entro 14 giorni, recensioni, chat col negozio | App da installare sul telefono |
| Pannello del negozio, del fattorino e tuo | Statistiche di PostHog |
| Incassi del negozio su Stripe | Ritiro in negozio, già spento oggi |

**Le scelte che lo definiscono, ancora aperte.** Fin dove consegni: oggi il confine è a 25 chilometri dal negozio. Se il negozio paga 50 euro al mese: io partirei senza canone finché non incassa. Chi paga lo sconto di MyCity: io direi MyCity, non il fornaio. Sono tutte nella coda delle cose da firmare.

**Dopo, la tua visione.** Il tuo documento sul business va oltre: Carta Piacenza, lista della spesa su WhatsApp, welfare aziendale, box anti-spreco, il Worker per i negozi. Nel codice oggi ci sono solo dei pezzi, come il catalogo dalle foto e i punti che si spendono solo su MyCity. Il resto va costruito dopo il lancio, una fase alla volta, come dice il tuo documento.

---

## Dettagli tecnici

- **Database del sito** (progetto `clmpyfvpvfjgeviworth`), letto in sola lettura il 2026-10-13 alle 08:44 di Piacenza: 9 profili; 2 negozi, entrambi approvati; 1 fattorino, non approvato; 1 amministratore; 9 prodotti, tutti disponibili (Pane Quotidiano 5, Panificio Demo 4); 1 ordine, creato il 2026-06-24. Organizzazione Supabase: piano `free`.
- **Registro dei difetti del sito** `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`: 1.256 schede, 470 aperte (11 bloccanti, 109 gravi, 350 minori), 786 chiuse. Storia ricostruita dai commit del file: 2026-08-22 → 167 aperti, 254 chiusi · 2026-08-27 → 361 aperti · 2026-09-03 → 369 aperti, 428 chiusi · 2026-09-09 → 166 aperti, 783 chiusi · 2026-10-11 → 470 aperti, 786 chiusi.
- **Chi ripara i 120 seri**, dal campo «si ripara» delle schede: codice 65 · decisione di Nicola 11 · migrazione del database 10 · configurazione Vercel 3 · senza campo 31 (difetti noti più vecchi). Di questi 31, letti uno per uno dal rimedio scritto: circa 25 di codice, 6 con la mano di Nicola (4 sul database, la serratura di GitHub, la decisione sul «cliente assente»). Totale: circa 90 di codice, circa 30 di Nicola.
- **Velocità misurata del codice:** referto `consegne/audit/2026-09-03-lotto-riparazione-sito.md` (97 chiusi su 110 seri, 25 squadre, pacchetti preparati alle 16:36, referto alle 21:00). Schede trovate rivedendo i file riparati: 41 + 50 + 59 = 150 su 1.256.
- **Pacchetti oggi:** `node cervello/pacchetti-lotto.mjs --sito --gravi` → 120 difetti in 57 pacchetti, 12 ondate da 5 squadre.
- **Firme in attesa:** `AZIONI-IN-ATTESA.md`, 100 card con ⏳, di cui 37 rosse; età mediana delle rosse 51 giorni, la più vecchia 91, 32 oltre i 30 giorni. Le card del percorso: chiavi del database #203 (aggiornata il 12/10 alle 17:55: ancora aperta, scadenza per il Garante mercoledì 14/10 in serata) · password amministratore #202 (ancora vecchia al 12/10 17:55) · cinque decisioni #204 · riparazione del codice #205 · negozio di prova #201 · migrazioni #191 · chiavi Vercel #154 (8 chiavi, la nona nasce con la #203) · dati del titolare #165 · copie di sicurezza #134.
- **Ordine obbligato:** prima la riparazione del codice (#205), poi la migrazione 161 e quella che la completa. Applicata da sola, la 161 spegne schede prodotto e vetrine (R3 della radiografia dell'11/10).
- **Le 14 schede gravi che escono dal lancio** se quelle funzioni restano spente (proposta aggiunta come sesta scelta alla card #204): R17 (app installabile), R22 (PostHog), R36-R42 (sette sull'AI), il tetto di spesa AI, R56 (newsletter), R61 (Drop del giorno e Negozio del mese), R78 (buoni regalo), R86 (classifica inviti).
- **Scadenze esterne:** modello `claude-sonnet-4-5` spento il 2026-11-30 (R37). Piano Supabase gratuito: pausa dopo circa 7 giorni di poca attività (registro dei fatti, `infrastruttura.supabase`).
- **Conto di un ordine** (`lib/constants.ts` e `computeOrderSplit` in `lib/stripe/client.ts` del sito, @ 70a9299): commissione 10% solo sul subtotale prodotti; consegna 3 € a MyCity su ogni ordine a domicilio; spedizione 2,50 € + 1,20 €/km, gratis da 30 € per negozio, resta a MyCity; compenso fisso del fattorino 3 €, pagato da MyCity; confine di consegna 25 km.
- **Cancello per il fresco:** `consegne/audit/GATE-COMPLIANCE-PRELANCIO.md`, dal 2026-07-02.
- **Visione e fasi:** `CONTESTO_BUSINESS.md`, paragrafi 6 e 7; prezzi e soglie dal registro dei fatti.
