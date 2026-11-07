---
data: 2026-11-07 03:40
autore: qa
oggetto: Pane Quotidiano, prova generale del primo ordine in contanti sulla copia di prova del sito
stato: fatto, nessun dato vero toccato
---

# Pane Quotidiano: la prova generale prima del primo cliente vero

**In breve:** il primo ordine in contanti di Pane Quotidiano, fatto per finta, è arrivato fino in fondo con i conti giusti.
Prima del cliente vero mancano i dati del fornaio: allergeni di 4 prodotti, IBAN e dati della ditta.

## In parole semplici

Questa pagina dice se il primo ordine vero di Pane Quotidiano può andare liscio. Per saperlo l'ho fatto per finta, dall'inizio alla fine.

La prova si è svolta nella palestra. La palestra è una copia del sito fatta solo per le prove. Ha clienti finti e soldi finti, e non manda email vere.

Nella palestra ho rifatto Pane Quotidiano com'è oggi sul sito vero. Stesso nome, stessi orari, stesse foto, stessi 5 prodotti agli stessi prezzi.

Un esempio concreto di come è andata. Sabato alle 03:14 un cliente nuovo ha ordinato il kefir da 400 grammi, cioè il latte fermentato. Ha scelto la consegna di oggi tra le 9 e le 11, in Via Calzolai 20, pagando in contanti.

**L'ordine è arrivato fino in fondo, e i soldi tornano al centesimo.** Il cliente ha pagato 6,05 €. Al negozio vanno 1,84 €, al fattorino 3,00 €, a MyCity 1,21 €.

L'ho rifatto una seconda volta, con lo stesso fattorino. È andata uguale.

Si sono viste tre cose che non vanno. Nessuna blocca l'ordine:

- **4 alimenti su 5 si comprano senza allergeni.** Sul budino alla vaniglia il cliente non trova nessuna riga sugli allergeni. E il fornaio non può cambiarne nemmeno il prezzo, finché non li scrive.
- **Il quaderno dei contanti resta indietro di una consegna.** Per un'ora ha detto «0 € incassati, già versati». Intanto il fattorino aveva in tasca 3,05 €. I soldi non si perdono: la pagina dove confermi il versamento conta giusto.
- **Il bonifico al negozio resta «in sospeso».** Manca il codice del conto in banca del negozio, l'IBAN. E il sito non ha un posto dove lui possa scriverlo.

Detto in un altro modo: la strada dell'ordine regge. Prima del primo cliente mancano i dati del fornaio, non il sito.

## Cosa cambia per te

- **Il primo ordine in contanti può partire.** Carrello, cassa, negozio, fattorino, codici e versamento hanno funzionato tutti, due volte.
- **Il rischio vero sono gli allergeni.** La legge sugli alimenti venduti a distanza vuole che il cliente li legga prima di pagare. Oggi non succede su 4 prodotti su 5.
- **Il primo bonifico del lunedì non parte senza IBAN.** Nella tua pagina dei bonifici, Pane Quotidiano compare con la scritta «IBAN non impostato».
- **La sera stessa non fidarti del quaderno dei contanti.** Fidati della pagina «Rimesse contanti». Quella legge gli ordini uno per uno e dà la cifra giusta.

## Cosa devi fare

- **Alla visita dal fornaio fatti confermare allergeni e ingredienti dei 4 prodotti.** Le bozze lette dalle etichette sono già pronte nella pagina 03 di questa cartella. È la mia raccomandazione.
- **Se un cliente vero arriva prima della visita, metti in bozza quei 4 prodotti.** Basta un clic su «Disattiva» per prodotto. Resta in vendita il kefir da 400 g, che è già in regola.
- **Alla stessa visita prendi IBAN e dati della ditta.** IBAN e partita IVA li scrivi tu nel database. Le regole del sito le accetta lui al primo accesso, con una spunta.

## Cosa non ho verificato

- **Il pagamento con carta.** Al lancio è spento, quindi non l'ho provato.
- **Le email e le notifiche sul telefono.** La palestra non manda email. Le notifiche sul telefono non le ho provate: ho visto solo la campanella dentro al sito.
- **Il bonifico vero al negozio.** Al lancio lo fai tu a mano, quindi nessuna prova può farlo.
- **La posizione esatta del negozio sulla mappa.** La copia usa quella di Via Calzolai 12, perché il file dei dati non la riportava. Conta per la regola dei 5 km.
- **Se nel sito vero i lavori notturni sono spenti come in palestra.** Lo deduco dalla lista del lavoro aperto. Le impostazioni del sito vero non le ho lette.
- **Se esiste un fattorino vero libero tra le 9 e le 11.** In palestra il fattorino l'ho creato io.

Di quanto fidarsi: del percorso dell'ordine e dei conti molto, perché li ho fatti due volte e controllati nel database. Sulle sei cose qui sopra non posso dire niente.

## Dettagli tecnici

### Chi e cosa, in palestra

| Cosa | Valore |
|---|---|
| Negozio copia | `d8c52f94-fc12-484f-8460-6ba1cfa520a8` · `pane-quotidiano-seller-z4zqmx@palestra-demo.local` |
| Cliente nuovo | `cliente-pq-buyer-he23fo@palestra-demo.local` |
| Fattorino nuovo | `7156d5d0-09a2-423b-88c9-c75afb75149f` · `rider-pq-rider-scz73g@palestra-demo.local` |
| Ordine 1 | `0ee28a86-9b1b-5493-8a86-008ab7e8b0bd` (#0EE28A) |
| Ordine 2 (seconda prova) | `ac79d2d2-025a-54c4-aae7-65f9b2ffb16a` |
| Amministratore | `admin@piacenza-demo.local` |
| Script e fotografie del database | `/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/palestra/prove/pane-quotidiano/` (cartella `db/` = un JSON per passo) |

Prodotti della copia (id palestra → id sito vero):

| Prodotto | Prezzo | Scorta | Categoria | Allergeni | Ingredienti | Id palestra | Id vero |
|---|---|---|---|---|---|---|---|
| Berchtesgadener Land kefir biologico 400g parzialmente scremato | 2,05 € | 20 → 18 | alimentari | sì | sì | `230f37a2-3cfd-48c0-8ebf-88a05738182b` | `418b20af-…` |
| Pudding alla vaniglia bio | 2,05 € | 20 | alimentari | no | no | `ed4a26a9-1188-4652-8409-0c8f6f443391` | `e6ba0473-…` |
| Hummus di ceci senza aglio biologico | 2,95 € | 20 | alimentari | no | no | `8bae8c89-6821-41a8-8496-cc9631cfaeb0` | `faa5f3ac-…` |
| Kefir di latte di capra biologico | 2,95 € | 20 | alimentari-latticini | no | sì | `eff75523-09fc-4b93-8b76-1dba9382bd3e` | `90386a8f-…` |
| Pesto Genovese Bio | 5,00 € | 20 | alimentari | no | no | `7233c4c9-4a50-4907-b473-de29efdb4f0b` | `034d599d-…` |

### Passo 1 · la copia

- `nuovoUtente('seller','pane quotidiano')`, poi `sql()` con i campi del file `pane-quotidiano-dati.json`. Orari veri: lunedì-sabato 9-13, pomeriggio 16:30-19:30 (venerdì fino alle 19), giovedì pomeriggio e domenica chiusi. Descrizione, 5 distintivi, `offers_express = true`.
- **Foto.** Le URL del sito vero in palestra restano bianche: la regola di sicurezza delle immagini (`img-src` in `middleware.ts:292`) ammette solo l'archivio della palestra. Ho ricaricato le 13 foto dei prodotti nell'archivio della palestra col login del negozio copia. La foto di copertina l'ho scaricata una volta dalla sua URL pubblica (solo lettura).
- `store_media` vuole oggetti `{type:'image', url}`: con una stringa sola la copertina usciva come un video nero (`HeroSection.tsx`, `cover = media.find(m => m.type === 'image')`).
- **I 4 alimenti senza allergeni, inseriti «disponibili» come sono: rifiutati tutti e 4.** Messaggio del database: «Un prodotto alimentare non si puo pubblicare senza dichiarare gli allergeni. Se non ne contiene nessuno, scrivi «Nessuno dei 14 allergeni».» Il guardiano è `zz_prodotti_alimentari_dichiarazioni` (migrazione 195), presente anche in produzione. Il kefir da 400 g è passato al primo colpo.
- Per copiarli com'erano sul sito vero li ho inseriti con `set session_replication_role = replica`, solo dentro quella chiamata. Ogni chiamata a `sql()` apre una connessione nuova: ho ricontrollato su 4 chiamate che il valore fosse tornato `origin`.

### Passo 1b · e se il negozio modifica quei prodotti?

Il negozio copia apre `/seller/products/<id>/edit` e cambia solo il prezzo, da 2,05 a 2,10. Risultato:

- Budino (e così hummus e pesto): avviso rosso «Prima di pubblicare devi compilare: Allergeni, Ingredienti.», niente salvato. Foto `palestra-negozio-modifica-pudding.png`.
- Kefir di capra: «Prima di pubblicare devi compilare «Allergeni».», niente salvato. Foto `palestra-negozio-modifica-kefircapra.png`.
- Nel database i prezzi sono rimasti quelli. Il database da solo un cambio di prezzo lo lascerebbe passare: è il modulo (`ProductForm.tsx:707-718`) che pretende i campi obbligatori su ogni prodotto non in bozza.
- Nell'elenco prodotti i 4 risultano «In vendita» senza nessun avviso. Il fornaio lo scopre solo quando prova a salvare.

### Passo 2 · la vetrina vista da un cliente

Telefono 390×844 e computer 1280×900, cliente non collegato, alle 03:11 di sabato:

- `palestra-prima-vetrina-telefono.png`, `palestra-prima-vetrina-telefono-intera.png`
- `palestra-prima-vetrina-computer.png`, `palestra-prima-vetrina-computer-intera.png`
- `palestra-prima-kefir-telefono.png`, `palestra-prima-kefir-computer.png`
- `palestra-prima-allergeni-pudding.png`, `palestra-prima-allergeni-kefircapra.png`, `palestra-prima-allergeni-kefir.png`

La vetrina dice «Chiuso ora · Consegna oggi · Apre alle 09:00». Le 6 foto si caricano tutte.

### Passo 3 · il primo ordine, minuto per minuto

Ore di Piacenza. Le ore nelle pagine del sito escono giuste con un browser sul fuso di Roma: l'ho controllato apposta.

| Ora | Chi | Cosa | Nel database |
|---|---|---|---|
| 03:13 | cliente | Prima entrata: pagina «Ancora una cosa» (Termini), spunta. Kefir nel carrello. | — |
| 03:13 | cliente | Cassa a negozio chiuso. Dice: «Veloce · Adesso · Non disponibile», «La consegna veloce si fa dalle 8 alle 21», «Domani · dom 8/11 · Negozio chiuso». Propone 6 fasce di oggi, dalla 9:00–11:00 alla 19:30–21:00. | — |
| 03:14 | cliente | Ordina, contanti, Via Calzolai 20, fascia «Oggi · 9:00–11:00». | `NEW`, `PENDING`, `AWAITING_REMITTANCE`; scorta 20→19; codice ritiro e codice consegna creati; coordinate 45,05278 · 9,69171 |
| 03:16 | negozio | Vede «Accettalo o rifiutalo entro le 10:00 di oggi». Accetta, poi «Pronto per il rider». Il pannello mostra il codice ritiro 687362. | `accepted_at`, `ready_at`, stato `READY` |
| 03:17 | fattorino | Va online, vede «#0EE28A · Pane Quotidiano · Compenso 3,00 €», accetta, ritira col codice, «Sto andando dal cliente». | `prendi_ordine` ok, `verify_pickup_code` ok, `picked_up_at` |
| 03:18 | fattorino | «Conferma incasso contanti»: il modulo propone 3,05 € da versare. Carica la foto dei contanti, poi chiude col codice 833096 che il cliente legge nel suo ordine. | `cash_collected_cents 305`, foto nel secchio privato `cod-proof`, `DELIVERED`, `PAID` |
| 03:20 | amministratore | «Rimesse contanti»: «Prova rider-pq · 1 ordini COD · 3,05 €». Conferma 3,05 €. | `payout_status HELD`, cioè pronto per il bonifico a mano |

**Non è servito aprire gli orari della copia.** La cassa accetta un ordine per una fascia di oggi anche alle 3 di notte, se il negozio apre prima. Il negozio ha accettato alle 03:16 e il fattorino ha ritirato alle 03:17, a negozio chiuso. Il sito non lo impedisce: nella vita vera succede alle 9.

Le fasce 13:00–16:30 e 19:30–21:00 compaiono anche se il forno in quelle ore è chiuso. È voluto: il negozio prepara prima di chiudere e la merce aspetta la fascia (`lib/quando-arriva.ts`, regola del ritiro con 15 minuti di negozio aperto).

### I soldi

| Voce | Cifra | Campo |
|---|---|---|
| Pagato dal cliente | 6,05 € | `gross_total_cents 605` |
| Kefir | 2,05 € | riga d'ordine |
| Consegna | 4,00 € (3,00 di base + 1,00 perché la spesa è sotto i 10 €) | `delivery_fee_cents 400` |
| Al fattorino, trattenuti dai contanti | 3,00 € | `rider_fee_cents 300`, `rider_payout_status CASH_WITHHELD` |
| Versati dal fattorino | 3,05 € | `cash_collected_cents 305` |
| Al negozio | 1,84 € | `seller_payout_cents 184` |
| Commissione MyCity, 10% | 0,21 € | `application_fee_cents 21` |
| A MyCity sulla consegna | 1,00 € | 400 − 300 |

Il conto torna: 184 + 21 + 400 = 605. Il 10% di 2,05 € è 0,205 €, arrotondato a 0,21 €: mezzo centesimo a favore di MyCity.

Nota commerciale: per un kefir da 2,05 € il cliente paga 6,05 €. Il carrello lo dice bene: «Ti mancano 7,95 € per arrivare a 10,00 €».

### Problemi, dal più grave

**1. GRAVE · 4 alimenti su 5 si comprano senza allergeni.** È lo stesso stato del sito vero.
- Passi: da cliente non collegato apri `/product/ed4a26a9-1188-4652-8409-0c8f6f443391` (budino). Cerca «Ingredienti e allergeni».
- Atteso: gli allergeni si leggono prima di pagare (Reg. UE 1169/2011, art. 14), oppure il prodotto non si compra.
- Reale: sul budino la sezione non c'è e «Aggiungi al carrello» è attivo. Sul kefir di capra ci sono gli ingredienti, nessun allergene, e la frase «Verifica sempre l'etichetta sul prodotto»: a distanza, prima di pagare, non si può.
- Impatto: un cliente allergico al latte compra un budino fatto col latte senza leggerlo da nessuna parte.
- Rimedio: completare i 4 prodotti con le bozze della pagina 03, oppure metterli in bozza. Il modulo poi costringe comunque il fornaio a completarli (passo 1b).

**2. MEDIO · il quaderno dei contanti resta indietro di una consegna.** Conferma del difetto 7 della palestra.
- Passi: il fattorino conferma l'incasso e poi chiude la consegna. Leggi `cod_reconciliations` del fattorino.
- Atteso: 305 previsti, 305 raccolti.
- Reale: alle 03:18 la riga nasce con 0 previsti e 0 raccolti, stato `OK`. Alle 03:20 la conferma dell'amministratore la segna «versata» così.
- Secondo giro: dopo la seconda consegna (03:31) la riga diceva 305, versata alle 03:20, con altri 3,05 € in tasca al fattorino. La conferma del secondo versamento (03:33) ha funzionato, ma la riga è rimasta a 305 invece di 610.
- Il giro notturno `riquadra-casse` la rimette a posto: lanciato a mano (`?a_mano=1`) ha portato la riga a 305/305. Lanciato normale ha risposto «LAVORI_A_ORARIO non è «accesi»»: in palestra i lavori notturni sono fermi.
- Impatto: nessun euro perso, perché la pagina «Rimesse» e la conferma leggono gli ordini. Ma il quaderno dei contanti dice il falso finché non gira il lavoro notturno.
- Causa probabile: la quadratura si rifà alla conferma dell'incasso, quando la consegna non è ancora chiusa (`lib/cassa/quadratura.ts`). E c'è una riga sola per fattorino e giorno, con un solo `remitted_at`.

**3. MEDIO, aggirabile · il bonifico al negozio non ha dove andare.**
- Passi: amministratore, `/admin/payouts`.
- Reale: «Pane Quotidiano · IBAN non impostato · DA LIQUIDARE 1,84 € · In sospeso» (dopo il secondo giro: 2 ordini).
- La lista «Completa il tuo negozio» del fornaio dice «Dati per ricevere i pagamenti (IBAN o Stripe)» e porta a `/seller/earnings`. Lì c'è solo «Collega conto per ricevere pagamenti», cioè Stripe. Nessun campo IBAN, né lì né nel profilo (`billing_iban` non compare in `app/seller`).
- Aggiramento: Nicola scrive l'IBAN nel database.

**4. MINORE · la pagina Guadagni del negozio confonde.**
- A consegna fatta dice «1,84 € in arrivo dopo la consegna».
- Dà due tempi diversi per il bonifico: «parte dopo la verifica della sua cassa» e, più sotto, «ogni lunedì, per le consegne della settimana prima».
- Rimanda alla «dashboard Stripe», mentre al lancio i contanti si pagano con un bonifico a mano.

**5. MINORE · il negozio non vede mai la sua quota nell'ordine.** La campanella dice «Ordine #0EE28A · 6,05 €». La pagina dell'ordine dice «Il rider incassa 6,05 €», anche a ordine consegnato, e lascia la scritta «Da preparare». Gli 1,84 € si vedono solo in Guadagni.

**6. MINORE · «un rider passa a prenderlo a breve» alle 03:16, per una consegna tra le 9 e le 11.** Difetto 10 della palestra, riprodotto.

**7. MINORE · errore React 418 su vetrina e pagina prodotto.** Difetto 9 della palestra, riprodotto.

**8. MINORE, da verificare · la cassa non riempie nome, indirizzo e telefono.** Il cliente nuovo li aveva nel profilo, ma la cassa ha riempito solo città e CAP.

Controllo fatto e passato: il negozio copia, col suo accesso, vede 1 ordine su 30 (il suo). Non vede nessun codice di consegna. Provando a cambiare il prezzo di un prodotto di un altro negozio, non cambia niente.

### Passo 4 · cosa manca a Pane Quotidiano vero

Dal file dei dati (letto in sola lettura alle 02:30) e da quello che la prova ha mostrato:

| Cosa | Oggi | Cosa succede senza |
|---|---|---|
| Accettazione di Termini e privacy | no | Al primo accesso il fornaio trova la pagina «Ancora una cosa»: una spunta. **Ma gli ordini dei clienti arrivano lo stesso**: la cassa controlla solo che il negozio sia approvato (`app/api/orders/cod/route.ts:858-860`). Il fornaio può ricevere un ordine vero senza aver accettato il 10% e il bonifico del lunedì. |
| IBAN | no | Bonifico «In sospeso». Nessuna pagina per scriverlo. |
| Ragione sociale, partita IVA, sede, PEC o codice SDI, titolare, codice fiscale | tutti no | La vetrina dice «VENDUTO DA Pane Quotidiano, Via Calzolai 25, Tel.», senza partita IVA. Non si può fatturare il 10%. Dettaglio in `02-obblighi.md`. |
| Allergeni e ingredienti di 4 prodotti | no | Problema 1. Bozze in `03-bozze-dei-dati.md`. |
| Conto Stripe | creato, incassi e bonifici spenti | Al lancio non serve (carta spenta). La pagina Guadagni gli chiederà comunque di collegarlo. |
| Posizione del negozio sulla mappa | non verificata | Serve giusta per la regola dei 5 km. |
| Telefono a portata di mano tra le 9 e le 10 | — | L'ordine della fascia 9–11 va accettato entro le 10:00, come dice il pannello. |

Dalla parte di MyCity servono: il conto da cui partono i bonifici del lunedì, qualcuno che ogni giorno riceva i contanti del fattorino e li confermi nella pagina «Rimesse», e un fattorino vero libero nella fascia scelta. Nessuna di queste tre cose si può provare in palestra.

### Da passare a tech

- Il quaderno dei contanti (problema 2): rifare la quadratura anche alla chiusura della consegna, oppure accendere il lavoro notturno prima del primo ordine.
- Un campo IBAN e partita IVA per il negozio già approvato (problema 3).
- I testi di Guadagni e della pagina ordine del negozio (problemi 4 e 5).
- Il messaggio del modulo: «Prima di pubblicare» su un prodotto già pubblicato (passo 1b).

### Fotografie della prova

Tutte in `foto/`, nome `palestra-*.png`. Il cliente: `palestra-ordine-1…4`, `palestra-cliente-codice-consegna.png`. Il negozio: `palestra-negozio-condizioni.png`, `palestra-negozio-1…6`, `palestra-negozio-modifica-*.png`. Il fattorino: `palestra-fattorino-1…6`. L'amministratore: `palestra-admin-1…3`. Il secondo giro: `palestra-giro2-*`.

Il negozio copia resta in palestra, con le condizioni accettate (il vero non le ha accettate) e il kefir a 18 pezzi: si può riusare per le prossime prove.

## La vetrina dopo le correzioni

**In parole semplici.** Ho applicato alla copia in palestra le bozze di testo approvabili (file `03-bozze-dei-dati.json`) e ho rifotografato la vetrina. Sul sito vero non ho toccato niente: serve prima il via di Nicola e poi lo carica il negozio.

**Cosa è cambiato.** Ho cambiato solo dove la bozza dice «foto dell'etichetta» con confidenza alta, più la descrizione consigliata B.
- Negozio: descrizione B, senza pane e miele. Tolti i distintivi «Prodotti locali» e «Sostenibile» (restano consegna rapida, biologico, ritiro in negozio).
- Kefir da 400 g: via «Demeter», «biodinamica», «flora intestinale», «ecosostenibile». Ingredienti «fermenti lattici», conservazione e categoria Latticini.
- Kefir di capra: nome con marca e peso, ingredienti con i fermenti, allergene latte (prima mancava).
- Pesto: marca corretta in «Artigiana Amadori», ingredienti, allergeni, 120 g, senza glutine. Via «carta sostenibile».
- Hummus: nome con la marca, descrizione e conservazione dall'etichetta. Pudding: nome, marca, categoria Dolci.

**Ricerca adesso** (palestra, telefono):
- «kefir»: 2 prodotti, i due kefir di Pane Quotidiano.
- «hummus»: 1 prodotto. «pesto»: 1 prodotto.
- «pane»: 4 risultati, ma nessuno è pane. Tre sono prodotti di prova di un altro negozio finto e il quarto è l'hummus, che dice «pane tostato» nella descrizione. Il nome «Pane Quotidiano» da solo non fa uscire i prodotti.

**Cosa resta vuoto, per mancanza di etichetta leggibile.** Ingredienti e allergeni di hummus e pudding, peso di hummus e pudding, descrizione del pudding (dice ancora «latte bio e vaniglia naturale», non verificato). Il kefir da 400 g mostra «Origine: Germania» ma non c'è il produttore: il sito non ha un campo per lui. Hummus e pesto restano in «alimentari» generico perché la bozza li dava come scelta a confidenza media. Il pane e il miele restano da chiedere al negozio.

**Cosa non ho verificato.** Il testo B dice «passi a ritirare in negozio», ma il negozio non l'ha confermato. Per salvare hummus e pudding senza allergeni ho dovuto saltare il controllo del sito, come nella copia fatta prima: sul sito vero quel controllo blocca il salvataggio. Le foto non sono state confrontate coi prodotti veri.

**Foto.** `foto/palestra-dopo-vetrina-{telefono,computer}[-intera].png`, `palestra-dopo-kefir-{telefono,computer}.png`, `palestra-dopo-allergeni-{kefir,kefircapra,pudding}.png`, con le stesse inquadrature delle `palestra-prima-*`.

## Dettagli tecnici

Script in `scratchpad/palestra/prove/pane-quotidiano/`: `dopo1_applica.mjs`, `dopo2c_allergeni.mjs`, `dopo3_ricerca.mjs`; foto con `PREF=palestra-dopo s2_vetrina.mjs`.
