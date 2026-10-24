---
data: 2026-10-24 14:10
tipo: prediagnosi-sito
richiesta: «A che punto siamo con la risoluzione dei problemi del markeplace? Dobbiamo risolverli nel minor tempo possibile, riesci a trovare un modo, magari capendo in anticipo come risolverli o qualcosa del genere» (Nicola, 24/10)
codice: NicolaeRotaru/mycity, main a 3ee0d53 (dopo la #258, la #259, la #260 e le 48 migrazioni del 24/10 alle 01:30)
fonti: registro dei difetti del sito · 77 revisori della pre-diagnosi · variabili di produzione su Vercel, lette per nome il 24/10 alle 13:40 · cataloghi del database di produzione, letti dalla corsia riservata
---

# Il modo più veloce: scrivere prima come si ripara ogni difetto, e firmare tutto in una volta

**In due righe.** Oggi ho scritto in anticipo la ricetta di riparazione di ognuno dei 551 difetti non riservati del sito, e l'ho fatta verificare. Se lunedì firmi le 14 scelte in un messaggio solo, i problemi seri del codice si chiudono verso il 31 ottobre: è una stima.

## In parole semplici

**Dove siamo.** Restano aperti 562 difetti: 9 bloccanti, 112 gravi, 441 minori. L'11 ottobre erano 470. In mezzo ne ho riparati e chiusi una trentina, ma i riesami ne hanno trovati più di cento che c'erano già. Dal 18 ottobre sono in produzione la prima ondata e il lotto dei profili, da stanotte anche le 48 migrazioni.

**La cosa più grave non è un difetto del codice.** Su Vercel manca la chiave di servizio del database. Ogni rotta che chiede l'accesso legge il profilo con quella chiave. Quindi oggi un cliente non può fare un ordine in contanti, il fornaio non può salvare un prodotto e tu non puoi approvare un negozio. L'ho controllato io, oggi alle 13:40: in produzione ci sono 12 variabili, e quella non c'è.

**Dove andava il tempo, finora.** Non nel riparare. Nella prima ondata, a metà ottobre, le squadre scoprivano a lavoro iniziato chi altro usava il codice che toccavano. Ogni riparazione faceva nascere difetti nuovi: sette riesami di fila. E le tue firme arrivavano una alla volta, a giorni di distanza, mentre le squadre aspettavano.

**Cosa ho fatto oggi: la pre-diagnosi.** Prima di toccare una riga, per ogni difetto un revisore ha scritto la ricetta: se è ancora vero, la causa, la modifica esatta, la prova che deve diventare rossa, cosa rischia di rompere. Per i 118 problemi seri, due revisori diversi hanno provato a smontarla. Un esempio: la ricetta per spegnere l'intelligenza artificiale avrebbe acceso un allarme falso nel semaforo del sito. Il revisore l'ha visto prima che qualcuno la scrivesse.

**Cosa ha trovato.**
- **12 difetti erano già risolti.** Li ho chiusi senza lavoro, ognuno con due voci d'accordo.
- **62 ricette su 118 andavano corrette.** La correzione è scritta accanto a ogni ricetta, prima che una squadra la esegua, non dopo un riesame.
- **17 problemi seri rischiano di far nascere difetti nuovi.** Sono quasi tutti nei soldi dei resi e nel controllo all'ingresso. Lì il collaudo sarà pesante, oppure si semplifica.
- **Molti difetti hanno la stessa causa.** Per esempio, una cinquantina di pagine prendono «la lettura è caduta» per «non c'è niente». Una regola scritta una volta li chiude insieme.
- **La chiave di servizio sveglia tutto in un giorno.** Il giorno che la metti, partono insieme dieci lavori notturni: email arretrate, carrelli vecchi, cancellazioni di account. Si accendono anche alcune falle di sicurezza che oggi dormono. Quel giorno va preparato.

## Cosa cambia per te

- **Le firme diventano una sola volta.** Al posto di carte che arrivano a giorni di distanza, ti preparo 14 scelte in una carta sola, ognuna con la mia raccomandazione. Rispondi «ok a tutte» oppure cambi solo quelle che vuoi.
- **Le tue mani lavorano in una sessione, in un ordine preciso.** Chiavi, impostazioni e prove sono una ventina di passi, in un'altra carta. Ognuno dice cosa deve venire prima.
- **Al lancio partono meno funzioni.** Le stesse che proponevi già nella scelta di ottobre, più qualcuna. Così almeno 9 problemi seri e circa 40 minori escono dal percorso del lancio.
- **Le squadre ricevono la ricetta, non il problema.** Partono dalla prova che oggi è rossa, sanno quali file toccano e cosa rischiano di rompere.

**Il calendario, se le firme arrivano lunedì.** È una stima, fatta con le taglie che i revisori hanno dato a ogni ricetta, non una misura.

| Quando | Tocca a te | Tocca a me |
|---|---|---|
| Oggi, sabato 24 | Le due porte del database: la chiave esposta e la password dell'amministratore. Circa 40 minuti. | Il ricettario e il piano, in questa richiesta di unione. |
| Lunedì 26 | Le 14 scelte, in un messaggio. Dirmi come è messo Stripe: 10 minuti. | Le fondamenta comuni: gli interruttori delle funzioni spente, le prove, la posta. In parallelo, le falle riservate che la chiave sveglierebbe. |
| Martedì 27 - mercoledì 28 | Il giorno della chiave, con i passi della carta. Poi compri del pane da Pane Quotidiano in contanti, per prova. | Controllo che tutto parta come deve, e riparo quello che solo un ordine vero mostra. |
| Mercoledì 28 - sabato 31 | Le due firme sulle migrazioni: prima quelle che aggiungono, poi quelle che stringono. | Tre ondate di riparazioni dei problemi seri, ognuna collaudata da chi non l'ha scritta. |
| Novembre, prime due settimane | La partita IVA, quando il commercialista è pronto. | I 429 minori, per file, insieme alle stesse squadre. Non fermano la vendita. |

Il pezzo più lento resta la partita IVA: senza, le pagine legali non dicono chi c'è dietro, e quel difetto è bloccante.

## Cosa devi fare

- **Oggi:** cambia la password dell'amministratore e le chiavi del database, con i passi che ti ho dato in chat il 12 ottobre. La chiave esposta è aperta dall'11 ottobre: è l'urgenza vera.
- **Fino al mio via, non mettere la chiave di servizio su Vercel.** Il motivo è nel punto «la chiave sveglia tutto»: prima chiudo quello che si accenderebbe.
- **Lunedì:** leggi la carta delle 14 scelte e rispondimi. Se vanno tutte bene, scrivi «ok 209».
- **Lunedì:** dimmi com'è messo Stripe: chiavi vere o di prova, e se Pane Quotidiano ha collegato il suo conto.
- **Quando hai firmato:** scrivimi «parti», e faccio partire le fondamenta.

## Cosa non ho verificato

- **Non ho fatto girare nessuna prova.** Le ricette vengono dalla lettura del codice di oggi. Le ore sono stime dei revisori, non misure.
- **Le ricette dei minori le ha verificate un revisore solo**, e solo dove dicevano «già risolto». Due voci le hanno avute solo i problemi seri.
- **Il sito vero non l'ho aperto**, né su un telefono né in un browser. Stripe non lo vedo.
- **La corsia riservata non è in questo testo.** Le falle di sicurezza aperte le ho ritrovate oggi, ma questo deposito è pubblico: il resoconto è in chat. Le 23 schede riservate restano aperte finché non le chiudo davvero.
- **Il calendario regge solo se le firme arrivano lunedì.** Se arrivano a rate, ogni giorno di attesa è un giorno in più.

---

## Dettagli tecnici

### Il registro, prima e dopo oggi

`MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`: 1.396 schede. Prima: 574 aperte (9 bloccanti, 120 gravi, 445 minori). Dopo le 12 chiusure di oggi: 562 aperte (9 bloccanti, 112 gravi, 441 minori), conto rifatto con `contoMarketplace` di `cervello/radiografia-marketplace-conti.mjs`. Le 12 chiuse portano `stato: gia_riparato_prima`, `prova_tipo: verifica-del-codice-a-due-voci`, e la riga di codice di oggi: 51, 312, 1138, 1237, 1244, 1299, 1300, 1319 (gravi) · 28, 187, 188, 1256 (minori).

### Come è stata fatta la pre-diagnosi

- Comando `node cervello/prediagnosi.mjs prepara` → fascicoli e territori; workflow `.claude/workflows/prediagnosi.js` nei modi `seri`, `minori`, `privata`; `raccogli` → ricettario; `ondate --repo ../mycity` → pacchetti e ondate. Metodo nel passo ⓪ di `cervello/lotto-a-pacchetti.md`.
- I 118 seri non riservati in 13 territori per mestiere: resi e rimborsi, contestazioni, bonifici e sconti, contanti e cassa, iscrizioni, rilascio, promesse di consegna, promesse ai negozi, IA e alimenti, privacy, pannello, negozio e fattorino, vetrina e accesso. Per ognuno: ricetta, lente A («è giusta, la prova sa diventare rossa?»), lente B («cosa farebbe nascere?»).
- I 433 minori non riservati in 20 gruppi per dimensione: ricetta, e un revisore sui «già risolti».
- La corsia riservata: 4 aree, ognuna con un revisore e un verificatore. Lettura dei cataloghi del database di produzione, solo SELECT.
- 77 revisori conclusi su 81 partiti: 2 doppioni fermati apposta, 2 della riservatezza ancora al lavoro mentre scrivevo. Il motore tiene due agenti per volta per giro su questa macchina da 4 processori: per questo i giri erano sette in parallelo. Ricette e verifiche: circa due ore, dalle 11:26 alle 13:20.

### Cosa dicono le ricette

| | seri (118) | minori (433) |
|---|---:|---:|
| già risolti, chiusi oggi | 8 | 4 |
| da riparare | 110 | 429 |
| di cui codice | 66 | 367 |
| di cui migrazione | 11 | 24 |
| di cui tua scelta | 19 | 26 |
| di cui impostazioni (GitHub, Vercel, Supabase, Stripe) | 7 | 5 |
| di cui da spegnere | 4 | 6 |
| di cui nel mondo reale | 3 | 1 |
| ricette corrette dalla lente A | 62 | — |
| a rischio alto di nascite (lente B) | 17 | — |
| dove la lente B consiglia di semplificare | 33 | — |

**Le ore, dalle taglie dei revisori** (S mezz'ora, M un'ora e mezza, L quattro ore): i seri di codice e migrazione sono 77, in 44 pacchetti e 9 ondate. Valgono 97 ore di squadra, 27 in fila. I file più caldi sono `app/api/orders/cod/route.ts`, `app/api/cron/operational-alerts/route.ts`, `lib/products/prontoPerLaVendita.ts`, `middleware.ts` e la rotta di moderazione. Con le semplificazioni il pianificatore stima 18-20 ore in fila, in tre ondate. Tutti i difetti di codice, minori compresi, sono 468 in 189 pacchetti: 376 ore di squadra.

**I bloccanti non riservati aperti:** 3 e 18, la porta del negozio rotta dalle migrazioni · 46, il titolare che manca · 432 e 1076, il rilascio che pubblica senza aspettare la CI e senza applicare le migrazioni.

### Le cause comuni, trovate dal pianificatore

1. La chiave di servizio che manca: 31 schede di nove territori. Si prepara un giorno solo, in ordine fisso.
2. «Lettura caduta» presa per «vuoto», «invio caduto» per «fatto»: 47 schede. Una regola e un freno.
3. Le promesse scritte a mano invece che dalla costante che decide: 45 schede. Una squadra sola per i testi.
4. Funzioni pubblicate senza interruttore: 20 schede. Un file solo di interruttori, spento come la produzione anche nelle prove.
5. Nove territori vogliono la migrazione 164, e lo script salta il secondo in silenzio. I numeri si danno alla ricucitura, e serve una prova sui numeri doppi.
6. Una regola che si stringe rompe chi contava su quella larga: «prima allarga, poi stringi», una stretta alla volta.
7. Lo stato di chi aspetta l'approvazione si decide in cinque posti. Un modulo solo, e la richiesta si riconosce dalla data, non dal ruolo.
8. I banchi di prova sono più gentili del database vero: una squadra sola li sistema per prima.

### Le correzioni del critico, già dentro il piano

- Le due porte del database vanno oggi, non il giorno della chiave.
- I punti fedeltà sono accesi: 100 punti all'iscrizione, che diventano credito. Si spengono nel primo pacchetto di migrazioni, prima della chiave.
- Con «solo contanti» va deciso come si paga il negozio: i contanti non entrano nel saldo Stripe.
- La porta del negozio riconosce una richiesta dalla data della richiesta.
- La pagina dell'ordine e la scheda prodotto hanno una squadra sola per tutte le ondate.
- Il «Panificio Demo» si toglie prima della chiave, e l'ordine di prova si fa vero su Pane Quotidiano.
- Togliere la chat cliente-negozio tocca il paletto «i clienti restano suoi»: il negozio deve vedere nome e telefono di chi ordina.
- Le scelte tecniche le prendo io e le scrivo in DECISIONI: la prova a mutazioni notturna, «Require up to date», l'architettura delle pagine. Il numero dell'SOS aspetta il primo fattorino esterno.

### Dove stanno i materiali

- Ricettario pubblico: `consegne/audit/2026-10-24-ricettario-sito.json`. I passaggi che toccavano una falla riservata sono oscurati, segnati da due revisori della riservatezza.
- Piano e critica: `consegne/audit/2026-10-24-piano-riparazione-sito.json`.
- Carte: #209 (le 14 scelte) e #210 (i tuoi passi in ordine) in `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md`.
- La prova del comando: `cervello/test/prediagnosi.test.mjs`. Verde, con quattro mutazioni che la fanno diventare rossa.
