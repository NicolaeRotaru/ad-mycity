---
data: 2026-11-06 19:15
tipo: radiografia-marketplace
codice: NicolaeRotaru/mycity @ db5164c (main, quello pubblicato)
fonte_raw: consegne/audit/2026-11-06-radiografia-marketplace-raw.json
richiesta: radiografia in 12 sessioni (prompt versione 5), lanciata da Nicola il 6/11
---

# La chiave esposta è chiusa; restano 11 difetti gravi, e i rimborsi in contanti non si chiudono da soli

**In due righe.** Il problema più grave trovato oggi era una chiave del database leggibile da chiunque, e l'hai già spenta. Dei difetti nuovi nessuno è bloccante, ma il rimborso di un ordine in contanti va ancora fatto a mano, fuori dal sito.

> **Aggiornamento del 7/11.** Con la tua firma, un quarto giro ha rifatto gli 8 difetti rimasti senza verificatore. Sono veri tutti e 8. Entrano nel registro come una falla riservata grave, la R310, e 7 minori. Le voci aperte passano da 688 a 696, e le falle riservate aperte da 67 a 68.

## In parole semplici

La radiografia è il controllo completo del sito. Questa volta l'hanno fatta dodici sessioni, ognuna su un tema: i soldi, la carta, il database, il cliente, il negozio, l'aspetto e gli altri. Poi ogni difetto l'ha rifatto da capo un verificatore che non l'aveva trovato, con il compito di smentirlo.

Il risultato, in numeri:
- **175 difetti nuovi** entrano nel registro: nessuno bloccante, 11 gravi e 164 minori.
- **28 difetti vecchi si chiudono:** erano già riparati nel codice, e un verificatore l'ha confermato.
- **7 difetti dati per chiusi sono tornati:** si riaprono.

Un esempio vero, il più importante per il lancio. Il 15/11 la carta è spenta, quindi ogni rimborso sarà in contanti. Una cliente paga 24 € in contanti e il pane arriva rovinato. Tu vuoi rimborsarla dal pannello, e il sito ti risponde «apri un reclamo». Ma il reclamo lo possono aprire solo la cliente o il negozio, non tu. E il lunedì il bonifico di quei soldi al negozio parte lo stesso.

Detto in altre parole: il sito oggi non sa restituire i contanti da solo. Lo fai tu a mano, e devi ricordarti di fermare il bonifico del negozio.

Il caso più grave della giornata era un altro. Una chiave del database, quella che apre tutto, stava negli script pubblici del sito dal 3 settembre. Alle 12:01 l'hai disattivata. Nei registri dell'ultima settimana non ho trovato nessuno che l'abbia usata per scrivere o per entrare nelle pagine dell'amministratore.

## Cosa cambia per te

- **I difetti aperti passano da 534 a 688.** Erano 5 bloccanti, 69 gravi e 460 minori. Dopo sono 5 bloccanti, 75 gravi e 608 minori: i 175 nuovi, più i 7 tornati, meno i 28 chiusi.
- **Le falle di sicurezza riservate aperte passano da 52 a 67.** Le 15 nuove hanno il loro numero e un titolo generico: i dettagli te li do solo in chat.
- **Prima del lancio conviene sistemare quattro gravi in chiaro.** Toccano i contanti, la legge o i dati personali:
  - Il rimborso di un ordine in contanti già incassato: è l'esempio qui sopra.
  - La pagina Guadagni del ritiro in negozio dice al negozio «ti arrivano 18 €». In realtà il negozio deve 2 € di commissione.
  - Il negozio può togliere il diritto di ripensamento a qualunque prodotto, anche a un maglione. Poi il sito dice al cliente che è la legge.
  - La città che il cliente scrive nell'ordine compare a tutti nel riquadro «dal vivo» della home.
- **Uno dei cinque bloccanti vecchi forse non c'è più.** È «al sito manca la chiave di servizio del database». La chiave su Vercel c'è da stanotte alle 00:45, e il sito la usa dall'01:01. Per chiuderlo serve la prova sul sito vero, che io non posso lanciare.

## Cosa devi fare

- **Leggere il referto privato** delle falle riservate, che ti mando in chat.
- **Decidere la verifica esterna delle falle riservate.** Il quarto giro del 7/11 ha già rifatto gli 8 difetti trovati alla fine; per le falle riservate serve una sessione nuova.
- **Rispondere alle domande delle sessioni:** sono 33, raccolte in un file solo. Quelle che chiedono una decisione sono nella coda «Da approvare».
- **Firmare, se vuoi, il piano della palestra**, la copia del sito per le prove, con i suoi costi. Anche questo è nella coda.
- **Firmare l'unione** della richiesta con questo lavoro, quando l'hai guardata.

## Cosa non ho verificato

- **Le 16 falle riservate nuove e i 37 ricontrolli delle falle vecchie.** Le ha verificate solo un agente dentro la sessione che le ha trovate. Il filtro di sicurezza del modello ha fermato l'agente che doveva passarle ai verificatori esterni.
- **Le 14 falle riservate dell'11 ottobre.** I loro dettagli non si trovano più, quindi oggi nessuno sa se sono ancora vere.
- **Due bloccanti vecchi che una sessione vorrebbe riaprire,** sui rimborsi della carta. Non li ho riaperti: manca la verifica esterna. La carta però è spenta al lancio.
- **2 sospetti di sicurezza del terzo giro sono rimasti solo contati.** Nessuno li ha descritti né rifatti. Gli altri 8 difetti del terzo giro li ha verificati il quarto giro, il 7/11.
- **482 file di codice su 1.088, quasi la metà, non li ha dichiarati letti nessuno.** Di questi, 146 sono aggiornamenti del database: le sessioni li hanno applicati tutti a una copia, ma non li hanno letti uno per uno.
- **Le 533 prove della palestra sono scritte, ma nessuna è stata eseguita.** Nessuno ha fatto un ordine da capo a fondo da utente collegato.
- **Le impostazioni vere di Supabase, Vercel, della posta e il conto Stripe vero.** Le ho guardate solo per i nomi, mai per i valori.
- **Che nessuno abbia usato la chiave esposta prima del 30 ottobre.** I registri di Supabase arrivano solo fino a lì. E il controllo guarda come si presenta ogni programma: non è una prova assoluta.

## Dettagli tecnici

**Come è stata fatta.** Prompt `consegne/audit/PROMPT-radiografia-12-sessioni.md` (versione 5, NicolaeRotaru/ad-mycity#935). Fase 0, collaudo dei controlli in quattro giri, poi due ondate di sessioni figlie dal ramo `claude/serene-wright-7l023n`. Ogni sessione ha cambiato un solo file, il suo referto, controllato da `controlli.mjs guardia-ramo` e `valida-referto` (verdi su 12 rami su 12).

| Sessione | Tema | Ondata | Ramo | Commit finale | Voci nel grezzo |
|---|---|---|---|---|---|
| S01 | Ricontrollo dei difetti aperti | 1 | `claude/serene-wright-7l023n-r01` | `8973b5d` | 1 |
| S02 | I soldi senza carta | 2 | `claude/serene-wright-7l023n-r02` | `a825a54` | 10 |
| S03 | La carta e Stripe | 1 | `claude/serene-wright-7l023n-r03` | `7120bc3` | 14 |
| S04 | L'attaccante | 2 | `claude/serene-wright-7l023n-r04` | `d7e7fe6` | 7 |
| S05 | Il database | 2 | `claude/serene-wright-7l023n-r05` | `90b5fca` | 13 |
| S06 | Il viaggio del cliente | 1 | `claude/serene-wright-7l023n-r06` | `9cd6727` | 23 |
| S07 | Chi lavora: negozio e fattorino | 2 | `claude/serene-wright-7l023n-r07` | `55c24ae` | 31 |
| S08 | La cabina di Nicola, gli avvisi, gli errori silenziosi | 2 | `claude/serene-wright-7l023n-r08` | `36ae695` | 18 |
| S09 | Privacy, leggi e promesse | 2 | `claude/serene-wright-7l023n-r09` | `b347ac6` | 16 |
| S10 | L'aspetto | 1 | `claude/serene-wright-7l023n-r10` | `9dfe182` | 14 |
| S11 | Il sito vero, dal vivo | 1 | `claude/serene-wright-7l023n-r11` | `c811a3d` | 9 |
| S12 | Il codice dentro | 2 | `claude/serene-wright-7l023n-r12` | `6ad9b03` | 18 |
| terzo giro | Dati personali; cifre dello schermo e del server | — | — | — | 1 |
| quarto giro (7/11) | Verifica degli 8 difetti del terzo giro | — | — | — | 8 |

**Il controllo finale (§7 del prompt).**
- **Doppioni (7.2):** un programma su chiave e su file a meno di 10 righe, poi due giudici leggeri indipendenti (`wf_33f226ee-541`). 5 difetti escono dal grezzo perché uguali a voci aperte, con la prova più forte scritta nella nota della voce (59, 2384, 2525, 15, 394). Nessuna coppia uguale fra sessioni.
- **Verifica indipendente (7.3):** `wf_cb60977a-9e3`, 109 verificatori `qa` su 109, due alla volta, circa 6 ore. Gravi in chiaro: 8 su 8 riprodotti con una prova che diventa rossa; il verificatore del peso ne ha lasciati 4 gravi e 4 minori. Minori: 156 confermati, 3 smentiti, 2 dubbi scartati. Esiti in `consegne/audit/2026-11-06-radiografia-12-sessioni/verifica/esiti-in-chiaro.json`.
- **Ricontrolli di S01:** 482 voci, ognuna con `riverifica_6_11`. Chiuse per chiave 28 (5 gravi, 23 minori), come `gia_riparato_prima`. Restano aperte le 9 che il verificatore ha smentito o non ha potuto confermare. Le altre: 305 ancora vere, 108 cambiate, 32 non verificabili.
- **Critico e terzo giro (7.4):** `wf_4a6d98fc-b38`, 5 agenti. 23 buchi elencati, 5 non fattibili su una copia. Due giri: i dati personali (4 difetti) e se lo schermo e il server dicono la stessa cifra (5 difetti), più 2 sospetti di sicurezza solo contati. Verificato e confermato solo il primo grave; gli altri 8 restano fuori dal grezzo.
- **Quarto giro (7/11, carta 231 firmata da Nicola):** `wf_f680fe06-680`, 4 verificatori `qa`. Gli 8 difetti del terzo giro sono confermati tutti, con prove che diventano rosse. Il grave sulla privacy entra come falla riservata R310; l'altro grave scende a minore secondo il verificatore del peso, perché al lancio la carta è spenta. Le voci si aggiungono in coda al grezzo e al registro: digest rifatto su una copia, 0 voci vecchie cambiate, confronto col 5/11 rimesso com'era.
- **Main unita** prima di scrivere il registro (`03eba78`, porta NicolaeRotaru/ad-mycity#937).

**Copertura** (`controlli.mjs copertura-dopo`, mappa di 2.587 file):
- codice: 1.088 file. Coperti dalle sessioni 520, dal terzo giro altri 86: 606 coperti, 482 scoperti (146 migrazioni applicate a una copia ma non lette). Le sessioni ne avevano dichiarati 521: uno è uscito con l'oscuratura delle righe legate alle falle riservate.
- documento: 32 file, 28 non letti. Strumento: 1.432 file, 173 letti o eseguiti. Binario: 35 file, a parte.

**Palestra** (`controlli.mjs copertura-palestra`): 118 pagine e 110 indirizzi interni (107 in `app/api`), 0 senza prova. Prove scritte 542, dopo i doppioni 533: `batteria-palestra.json` e `batteria-palestra.md`. Eseguite: 0.

**Il conto.**
- Sessioni figlie: 154 agenti; circa 793 milioni di token in entrata e 3,5 milioni in uscita (dai `conto` dei 12 referti, misurati con `cervello/conto-token.mjs`).
- Controllo finale: 116 agenti nei tre workflow; circa 12 milioni di token dei subagenti, dalla somma dichiarata dai workflow.

**Falle riservate.** Nuove: da R295 a R309, 15 voci (6 gravi, 9 minori), verificate solo dentro le sessioni; il 7/11 la R310 (grave, privacy), verificata dal quarto giro. Quella bloccante del sito dal vivo è chiusa e non entra. Le 37 ricontrollate da S04 restano come sono nel registro: 31 ancora vere, 1 non più vera, 2 cambiate, 3 non verificabili da una copia; nessuna chiusura applicata senza verifica esterna.

**Voci non toccate di proposito.** La 0 (chiave di servizio del database) ha una nota col fatto del 6/11, ma resta aperta. Le 1144 e 1386 (rimborsi della carta) restano chiuse finché la riapertura proposta da S05 non è verificata.

### Bloccante — elenco completo

Nessun bloccante nuovo entra nel registro. L'unico trovato, una falla riservata vista dalla sessione del sito dal vivo, è stato chiuso il 6/11 alle 12:01, quando Nicola ha disattivato le chiavi vecchie del database.

### Grave — elenco completo

| # | Area | Difetto | Dove | Sessione |
|---|---|---|---|---|
| 1 | flussi | Un ordine in contanti già incassato non si rimborsa dall’amministrazione: il sito non apre da solo il reclamo come deciso il 29/10, e il pannello dice di aprirlo a chi non può | `lib/ordini/annulla.ts:258-266` | S02 |
| 2 | pagamenti | Sul ritiro in negozio pagato in contanti al banco, la pagina Guadagni dice al negozio che gli arriveranno i 18 euro che ha già in cassa, e che li ha raccolti un fattorino | `lib/guadagni/negozio.ts:114-122` | S02 |
| 3 | pagamenti | Se il cliente viene rimborsato prima che il suo ordine nasca, l'ordine nasce lo stesso come pagato e il negozio viene pagato | `lib/stripe/webhook/ordini.ts:121-180` | S03 |
| 4 | privacy | Il negozio può togliere il diritto di ripensamento a qualunque prodotto, anche a un maglione, e il sito rifiuta il reso dicendo al cliente che è la legge | `components/seller/ProductForm.tsx:989-995` | S09 |
| 5 | privacy | Quello che il cliente scrive nel campo «Città» compare a tutti nel riquadro dal vivo della home, accanto al nome del negozio | `components/LiveActivityFeed.tsx:17-24` | terzo giro |
| 6 | accessi | Falla di sicurezza R296 da chiudere (sicurezza degli accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` | S04 |
| 7 | accessi | Falla di sicurezza R309 da chiudere (accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` | S12 |
| 8 | regole del database | Falla di sicurezza R297 da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` | S05 |
| 9 | regole del database | Falla di sicurezza R298 da chiudere (regole del database): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` | S05 |
| 10 | API | Falla di sicurezza R304 da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` | S06 |
| 11 | API | Falla di sicurezza R305 da chiudere (flussi): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` | S06 |
| 12 | privacy | Falla di sicurezza R310 da chiudere (privacy): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` | quarto giro, 7/11 |

### Minori per area

| Area | Minori in chiaro | Falle riservate minori |
|---|---|---|
| flussi | 39 | 1 |
| interfaccia | 23 | 0 |
| API | 20 | 1 |
| pagamenti | 16 | 0 |
| privacy | 16 | 0 |
| architettura | 11 | 1 |
| rilascio | 10 | 0 |
| AI | 8 | 0 |
| regole del database | 3 | 5 |
| dati | 4 | 0 |
| accessibilità | 4 | 0 |
| testi | 4 | 0 |
| accessi | 2 | 1 |
| telefono | 1 | 0 |
| velocità | 1 | 0 |

### Regressioni confermate

Voci date per chiuse che la radiografia ha ritrovato vere, e che un verificatore indipendente ha confermato. Tornano aperte; non stanno nel grezzo.

| Voce | Gravità | Chiave della voce riaperta | Vista da |
|---|---|---|---|
| 1692 | minore | `sicurezza-auth\|annullando un ordine già pagato in contanti, chi amministra legge una frase mozzata e un'istruzione che non si può eseguire` | S02 |
| 2126 | minore | `rls-database\|un negozio sospeso può rimettersi da solo in coda per l'approvazione rimandando il modulo da /sell` | S04 e S05 |
| 713 | minore | `pagamenti-stripe\|tre tempi diversi per lo stesso bonifico nel codice — e un quarto nelle faq del venditore` | S07 |
| 1799 | minore | `frontend-ux\|le rimesse contanti hanno ancora un tetto di 1000 righe senza avviso, mentre bonifici e prodotti adesso lo dicono` | S08 |
| 1802 | minore | `frontend-ux\|payout: i riquadri «da pagare / già pagato» mostrano un totale parziale come cifra esatta, e l'avviso sta sotto` | S08 |
| 1191 | minore | `dati-analytics\|quando un cruscotto legge un campione invece del totale, lo dice solo alla console` | S08 |
| 1031 | minore | `performance-percepita\|la home e la scheda prodotto partono senza il preload dei caratteri: il testo cambia faccia a metà caricamento` | S11 |
