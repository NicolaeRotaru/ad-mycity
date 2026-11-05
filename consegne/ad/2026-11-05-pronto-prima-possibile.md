---
data: 2026-11-05 15:10
tipo: analisi
fonte: AD digitale, su richiesta di Nicola in chat il 5/11
dati: registro dei difetti del sito (2.673 schede, letto il 5/11 alle 14:21) · Vercel e database letti dal vivo il 5/11 alle 14:40
---

# Il sito può essere pronto il 15/11: il passo lento non è il codice, sono le chiavi e la carta

> **In due righe.** Prima di aprire vanno riparati nel codice 33 difetti: 32 dei 74 seri, più uno salito dai minori. Bastano due ondate.
> Il passo che oggi ferma tutto è un'ora di lavoro tuo, ferma dal 31/10, più la verifica di Stripe per la carta.

## In parole semplici

Mi hai chiesto due cose: come avere il sito pronto prima possibile, e perché la lista dei difetti cresce anche se ne chiudo tanti.

Per rispondere ho fatto tre cose. Ho contato tutte le 2.673 schede del registro del sito, una per una, guardando da dove è nata ciascuna. Ho guardato dal vivo le chiavi del sito su Vercel e il database. Poi ho preso i 74 difetti seri e li ho messi contro le regole del lancio che hai firmato.

La regola del lancio, firmata da te il 31/10, dice questo: si apre quando sono a zero i bloccanti e i gravi **che al lancio si possono incontrare**. I minori si riparano dopo. Al lancio c'è un negozio solo, il forno, e consegni tu in bici. Si paga in contanti e con la carta.

Con questa regola, i 74 difetti seri si dividono in cinque gruppi:

| Gruppo | Quanti, su 74 | Chi li chiude |
|---|---:|---|
| Non sono codice: chiavi, dati, scelte | 11 su 74 | tu, in circa un'ora |
| Falle di sicurezza | 9 su 74 | io, prima di aprire |
| Sulla strada del primo ordine e del primo lunedì | 23 su 74 | io, prima di aprire |
| Si incontrano di rado al lancio | 14 su 74 | io, nella settimana dopo |
| Fuori dal lancio: funzioni spente, più negozi, fattorini esterni | 17 su 74 | si spengono, non si riparano ora |

Quindi il lavoro di codice prima di aprire è **32 difetti su 74**, meno della metà. Il 1/11, in un giorno solo, le cinque sessioni ne hanno chiusi 46 seri su 84. Il codice ci sta nei dieci giorni.

## Cosa cambia per te

**Primo: oggi il sito non apre per motivi che non sono nel codice.** L'ho controllato dal vivo alle 14:40.
- Su Vercel ci sono 11 chiavi, tutte messe il 10/10 o prima. Manca la chiave di servizio del database: senza, il tasto «Ordina» fallisce sempre. Manca la chiave della posta: senza, il forno non riceve l'email dell'ordine. Mancano tutte le chiavi di Stripe.
- Il database è fermo all'aggiornamento 163. Ne mancano 15, dal 164 al 195.

Queste due cose aspettano dal 31/10, cioè da cinque giorni. Qualunque cosa ripari io, finché mancano il sito non prende ordini.

**Secondo: la carta può spostare la data più del codice.** La tua regola dice che si apre solo con la carta accesa. La carta si accende quando Stripe ha verificato il conto di MyCity e quello del forno. Da qui non vedo Stripe, e non so se la partita IVA è aperta. Se una delle due cose manca il 12/11, il 15/11 non regge, anche col codice pronto.

**Terzo: un difetto blocca te in persona.** Oggi un fattorino in bici non si può approvare senza patente e polizza dell'auto. Tu consegni in bici. Senza un fattorino approvato, nessuno può prendere un ordine. Lo metto nella prima ondata.

**Quarto: il numero da guardare cambia.** Il quadro oggi dice 1.368 difetti aperti. Ma 1.294 su 1.368 sono minori, che la tua regola lascia a dopo il lancio. Il numero che conta per aprire è un altro: 32 seri di codice, più le tue 11 cose. Da domani il quadro te lo mostro così.

## Cosa devi fare

**Una seduta di un'ora con me, domani venerdì 6/11.** In quest'ordine:
- Su GitHub metti i segreti di Vercel e accendi la regola sul ramo principale.
- Premi il pulsante degli aggiornamenti del database: applica dal 164 al 195.
- Su Vercel metti la chiave di servizio del database.
- Chiudi la falla di sicurezza del 31/10: i passi sono nella chat di quel giorno.
- Dammi indirizzo e telefono del titolare, da scrivere sul sito.
- **Per ultima**, su Vercel, la chiave e il mittente della posta.

**Perché la posta per ultima** (corretto il 5/11 alle 17:30, dopo la verifica dei minori). Nella coda ci sono email ferme da mesi. L'aggiornamento 165 le fa scadere. Se la chiave della posta arriva prima degli aggiornamenti, partono tutte insieme ai clienti.

**Tre risposte, anche brevi:**
- La partita IVA è aperta? Cosa ha detto il commercialista il 2/11?
- Su Stripe, i due conti hanno già l'ok? Quello di MyCity e quello del forno.
- Il bonifico di rimborso al cliente: vale il tasto «fatto» sull'avviso, come dice il registro dal 29/10? Il mio consiglio è sì. Mi serve per partire con la prima ondata.

**Col fornaio:** allergeni e ingredienti dei 7 alimenti su 9 che non li hanno. La legge li chiede. Nella stessa visita, va spuntato «non si può rendere» sui prodotti freschi.

**Poi il via alla prima ondata**, che parte appena mi rispondi sul rimborso.

## Cosa non ho verificato

- **Stripe non l'ho visto.** Da qui serve un'autorizzazione che non c'è. Lo stato dei due conti lo sai solo tu.
- **La partita IVA e l'esito del commercialista** non sono scritti in nessun file.
- **Lo smistamento dei 74 l'ho fatto io**, leggendo titolo, file e note di ogni scheda. Non ho rilanciato le prove. Su 4 schede il confine fra «sulla strada» e «di rado» è una mia scelta: le trovi segnate nei dettagli.
- **Il conto di dove nasce un difetto** viene da come le schede sono state marcate. Le marcature le ho scritte io. Se ho chiamato «vecchio» un difetto che avevo creato io, i difetti nati riparando sono di più.
- **I giorni del piano** sono una stima. Ogni ondata, finora, ha fatto nascere qualche difetto nuovo. Per questo c'è un giorno di riserva.

---

## Da dove vengono i difetti nuovi

È la domanda giusta. Ecco i numeri, dalle 2.673 schede del registro del sito, che parte ad agosto.

**Quanti ne ho chiusi davvero.** 1.165 schede su 2.673 sono chiuse o riparate, cioè 44 su 100. Altre 140 erano doppioni o già a posto. Ne restano aperte 1.368.

**Quasi tutti gli aperti sono piccoli.** Dei 1.368 aperti, 1.294 sono minori: 95 su 100. I seri sono 74.

**I seri, giorno per giorno.** Il 1/11 erano 84. Con le cinque sessioni ne ho chiusi 46, e il 4/11 erano 39. La radiografia del 5/11 ne ha trovati 35 nuovi. Oggi sono 74.

Le cause sono tre. Pesano in modo molto diverso.

**Prima causa, la più grande: la lente è più forte.** La radiografia del 5/11 è la più profonda mai fatta: 107 agenti, tutti i 998 file del sito letti per intero, ogni difetto smentito da un secondo agente. Ha trovato 372 difetti nuovi. Di questi, 348 nessuno li aveva mai visti: c'erano già, in stanze mai illuminate così. Il sito non è peggiorato il 5/11. Lo vediamo meglio.

Facciamo un esempio. Il difetto dell'ordine della sera spostato di un giorno c'era già a ottobre. L'ha trovato un revisore messo apposta a seguire gli orari che passano la mezzanotte. Prima nessuno guardava da quell'angolo.

**Seconda causa: le regole sono cambiate negli ultimi dieci giorni.** Fra il 28/10 e il 1/11 hai deciso cose nuove: consegni tu in bici, si apre coi contanti, bonifichi il forno il lunedì, rimborsi in contanti con un avviso, allarme dopo 5 minuti. Il codice queste regole non le aveva ancora. La radiografia le ha contate come difetti: **almeno 7 dei 35 gravi nuovi** sono regole decise e non ancora costruite. Non sono guasti: sono lavori da fare, scritti come difetti.

**Terza causa: riparando ne creo, ma quasi sempre piccoli.** In tutto, 463 schede sono nate dal mio riparare. Di queste, solo 29 erano serie, cioè 6 su 100. Oggi una sola è aperta. In più, 24 dei 372 nuovi erano difetti che avevo dato per chiusi e sono tornati: 6 su 100. Questo è un difetto mio vero. Vuol dire che la prova che li chiudeva non bastava.

**Da dove vengono i 1.368 aperti:**

| Come è nato | Aperti | Di cui seri |
|---|---:|---:|
| Trovato da una radiografia | 650 | 57 |
| Vecchio, visto mentre riparavo lì accanto | 407 | 16 |
| Nato dal mio riparare | 309 | 1 |
| Altro | 2 | 0 |

Quindi la parte che cresce sono i minori. I seri nascono quasi tutti dalle radiografie, e le radiografie trovano cose vecchie.

**Cosa cambio, da subito:**
- **Niente radiografie larghe fino all'apertura.** Solo la rilettura dei file che tocco, mentre li riparo. Una radiografia larga allunga la lista e non avvicina la data.
- **I minori aspettano il lancio**, come dice la tua regola. Si riparano dopo, a gruppi.
- **Ogni regola nuova che decidi diventa subito una riga del lavoro**, non un difetto trovato giorni dopo.
- **Un difetto serio si chiude solo con una prova che diventa rossa se il difetto torna.** È la tua asticella del 10/8. I 24 tornati dicono che non sempre l'ho rispettata.

## I 74 seri, smistati

**Non sono codice: 11 su 74.** La chiave di servizio del database. La chiave della posta. Gli aggiornamenti del database che il rilascio non applica. Le unioni che vanno online senza aspettare le prove. La regola del ramo principale spenta. Chi c'è dietro il sito. La falla del 31/10. Gli allergeni dei 7 alimenti. I vecchi reclami rimasti aperti nel database. Il documento fiscale per la consegna, da chiedere al commercialista. Le email «ordine pronto» e «consegnato»: l'aggiornamento c'è già nel database vero, va solo controllato dopo la chiave della posta.

**Falle di sicurezza: 9 su 74.** Le sette gravi della radiografia del 5/11, una più vecchia, e i prodotti scrivibili dal browser. Si chiudono tutte prima di aprire: chi attacca non guarda quali funzioni sono spente.

**Da riparare prima di aprire: 23 su 74.**

- **I soldi dei contanti (8).** Quanto versare il lunedì. Il «fatto» sul bonifico al negozio e su quello di rimborso. La pagina Guadagni del forno. Il rimborso arrivato dopo il lunedì. Il reclamo chiuso che blocca il bonifico. Il reclamo che non arriva a nessuno. L'ordine in contanti che non si chiude se il fattorino non dichiara l'incasso.
- **Gli avvisi (4).** Allarme a 5 minuti. La campanella nel pannello. L'email d'ordine fallita senza che nessuno lo sappia. L'ordine fermo su «accettato».
- **L'ordine (5).** La data che slitta se confermi l'email il giorno dopo. La quantità vecchia in cassa. L'orario scelto che nessuno vede. La merce riservata che resta bloccata. La sessione che cade dopo tre secondi.
- **Tu come fattorino (2).** L'approvazione in bici. Il primo passo dell'iscrizione da fattorino.
- **Il resto (4).** Le categorie vuote in home: 8 su 9. «Contatta il negozio», che deve diventare WhatsApp o telefono. La cancellazione dell'account di chi ha già ordinato. La nuova password chiesta dal computer e aperta dal telefono.

**Di rado al lancio: 14 su 74.** I resi: il pane non si rende, quindi saranno rari. Due casi rari della carta. L'area del forno che va in errore passando da Prodotti alla vetrina. Le prove automatiche dell'acquisto, che oggi sono vuote. Le porte per i negozi nuovi: posizione, partita IVA, accesso di chi aspetta l'approvazione. Le foto dell'iPhone. Le segnalazioni di contenuti illeciti, che con un negozio solo gestisci a mano.

**Fuori dal lancio: 17 su 74.** Le funzioni già spente: intelligenza artificiale, codici sconto, app installabile, statistiche. Gli sconti sugli eventi e le promo per categoria: si spengono con una modifica piccola, invece di ripararli. I casi con più negozi nel carrello. I fattorini esterni: allarme di emergenza, documenti scaduti, età, profilo. La chat, che diventa WhatsApp. Le foto d'archivio delle categorie.


## Gli altri 1.294: cosa sono

Hai chiesto: se i seri sono 74, cosa sono gli altri? Li ho fatti leggere tutti, uno per uno, e smistare contro le regole del lancio.

| Cosa sono i 1.294 minori | Quanti, su 1.294 |
|---|---:|
| **Al lancio non cambiano niente** | **540** |
| … nessuno li vede usando il sito: codice, prove, pulizia | 209 |
| … stanno in funzioni spente al lancio | 145 |
| … contano solo quando l'azienda cresce | 109 |
| … altri casi senza conseguenze | 77 |
| **Danno fastidio, ma non fermano un ordine, non sbagliano soldi, non violano la legge, non espongono dati** | **626** |
| **Sospetti: potevano pesare più di «minore»** | **128** |

Facciamo un esempio di fastidio. Lo stesso negozio è «dal 1987» nella vetrina e «dal 2026» sulla scheda di ogni prodotto. È brutto, ma il pane si vende lo stesso.

**I 128 sospetti li ho fatti controllare sul codice vero.**
- **39 sono falle di sicurezza riservate.** Da qui non ne vedo i dettagli. La radiografia le ha già giudicate minori; entrano nell'ondata della sicurezza quando toccano gli stessi file.
- **89 sono passati da due verificatori.** Il primo, sul modello piccolo, ne ha proposti 8 da promuovere. Il secondo, sul modello grande, doveva smentirli: ne ha smentiti 7.
- **Ne sale uno solo: il ritiro in negozio.** Hai deciso il 1/11 che è acceso dal lancio. Il codice lo tiene spento. E acceso, oggi, un ritiro non si chiude: il forno vede un codice, il database ne controlla un altro, e il cliente non vede il suo.
- **12 erano già fra i 74 seri**, scritti con altre parole.
- **10 sembrano già riparati nel codice.** Li chiudo nel registro solo dopo averli riprovati.
- **Il controllo all'incontrario**: 30 «fastidi» presi a regola fissa, per vedere se il modello piccolo ne avesse sottovalutato qualcuno. Su 30, nessuno era più grave.

**Nove sono regole tue che il codice non ha ancora.** Non sono guasti: sono lavori decisi e non costruiti. I tre che pesano al lancio:
- Il ritiro in negozio acceso. Va costruito insieme al difetto qui sopra.
- Il tetto di 5 ordini per fascia, perché consegni da solo.
- «Finito per oggi» e «chiuso fino al…» per il forno.

Gli altri sei possono aspettare, e sono nei dettagli.

## Il piano, giorno per giorno

| Giorno | Cosa | Chi |
|---|---|---|
| ven 6/11 | La seduta di un'ora: chiavi, aggiornamenti del database, falla del 31/10, indirizzo | tu, con me |
| ven 6/11 | Allergeni e «non si può rendere» dei prodotti del forno | tu, col fornaio |
| 6-8/11 | Prima ondata: i soldi dei contanti, gli avvisi, tu come fattorino, e lo spegnimento di eventi e promo | io |
| 9-10/11 | Seconda ondata: le 9 falle e il resto della strada del primo ordine | io |
| 11/11 | Un collaudo solo, con due lenti, perché tocca soldi e permessi. Poi la richiesta di unione | io, poi tu firmi |
| 12/11 | Unione, pulsante degli aggiornamenti del database, controllo dal vivo del sito | tu e io |
| 12/11 | Punto sulla carta: se Stripe non ha verificato i due conti, la data è a rischio | tu decidi |
| 13-14/11 | Giorno di riserva. Sistemo anche le due date della macchina che scadono il 15/11 all'01:00 | io |
| dom 15/11 | Pronto | |

Due ondate in tutto, come dice la regola del lavoro snello. Se alla seconda resta qualcosa di serio, mi fermo e te lo dico, invece di aprirne una terza.

**L'unica leva per andare prima del 15/11.** Aprire coi soli contanti, e accendere la carta quando Stripe è pronto. Il 1/11 hai scelto di aspettare la carta, quindi non lo propongo. Te lo scrivo solo perché è l'unica strada più corta, se Stripe tarda.

---

## Dettagli tecnici

**Fonti.**
- Registro: `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`, campo `problemi`, 2.673 voci. Stati: aperto 1.368, chiuso 805, riparato 360, doppione 73, gia_riparato_prima 67.
- `node cervello/quadro.mjs --sito` del 5/11 alle 14:21: 5 bloccanti, 69 gravi, 1.294 minori.
- Vercel, progetto `mycity`, team `nicolaerotarus-projects`: `filter_project_envs` alle 14:40. Produzione: 11 chiavi, nessuna fra `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `STRIPE_SECRET_KEY`, `CARTA_ACCESA`. Ultima chiave aggiunta il 10/10 (card #154).
- Supabase, progetto `clmpyfvpvfjgeviworth`: `list_migrations` alle 14:40, ultima numerata `163`. La `150` (email «pronto» e «consegnato») è applicata.
- Fatti: `lancio.criterio`, `lancio.data`, `pagamenti.al-lancio`, `pagamenti.rimborso-contanti`, `consegna.capienza`, `logistica.bici-consegna` in `registro-fatti.json`.

**Come ho classificato l'origine** (campo `fonte`): `marketplace` e `design` = radiografia; testo con «preesistente», «c'era già», «difetto vecchio», «c è su» = vecchio visto riparando (254 aperti); testo con «nato/nati» = nato dal riparare; il resto con «perimetro», «riesame», «collaudo», «ondata», «lotto» = visto riparando, origine non detta (153 aperti, sommati ai 254 nella tabella). Nati dal riparare: 463 in tutto, 29 seri, 1 serio aperto (voce 2353).

**Radiografia del 5/11:** 372 voci con `fonte_radiografia` «radiografia 2026-11-05», 24 con `gia_noto`. Gravi legati alle regole del 28/10-1/11: voci 50, 51, 53, 55, 77, 131, 136.

**Smistamento, per numero di voce nel registro:**
- Non codice (11): 0, 2, 77, 490, 524, 592, 760, 804, 1448, 2559, 2639.
- Sicurezza (9): 1, 52, 193, 194, 195, 196, 208 (R262-R268), 528 (R15), 2491.
- Strada del lancio (23): soldi 50, 51, 53, 54, 55, 56, 129, 130 · avvisi 21, 132, 136, 141 · ordine 135, 138, 467, 1509, 2502 · fattorino 131, 137 · resto 192, 437, 466, 526.
- Di rado (14): 78, 79, 81, 134, 133, 469, 493, 529, 1600, 1639, 1652, 1659, 2461, 2493.
- Fuori dal lancio (17): 80, 139, 140, 376, 465, 540, 603, 620, 715, 777, 923, 1594, 1697, 1708, 2353, 2456, 2662.
- Confini scelti da me: 134 e 469 (di rado, potrebbero stare sulla strada), 81 e 493 (le segnalazioni: obbligo di legge, gestibili a mano con un negozio).

**Prima ondata, perimetro proposto:** voci 50, 51, 53, 54, 55, 56, 129, 130, 21, 132, 136, 141, 131, 137, più lo spegnimento di 80 e 139. Motore: `.claude/workflows/ondata-snella.js`, schede da `node cervello/schede-pacchetto.mjs`. Cancello: `npm run verify` e `node cervello/radiografia-in-corsa.mjs --repo ../mycity`.

**Gli altri 1.294 (5/11, dalle 14:30 alle 17:30).**
- Smistamento: run `wf_ed63893e-be8` (lotti 1-4, modello grande) e `wf_9fae883b-f96` (lotti 5-12, modello piccolo, una lettura). Esiti per voce: `scratchpad/minori/classificati-tutti.json` della sessione. La voce 808 l'ho classificata a mano.
- Verifica: run `wf_80e0dc84-cb0`, 15 gruppi sul modello piccolo e 7 conferme sul grande, 22 agenti, circa 1,36 milioni di token.
- Promosso e confermato: voce 474 (con la 146, il ritiro spento). Smentiti dalla seconda lente: 23, 85, 151, 161, 518, 633, 1738.
- Già fra i 74: 143→2, 20→1448, 291→493, 319→1448, 475→130, 501→0, 520→490, 1746→0, 2057→0, 2455→133, 2513→2502, 2535→490.
- Da riprovare per chiuderli: 499, 597, 634, 739, 1533, 1675, 1690, 1886, 2139, 2462.
- Regole decise e non costruite: 146 e 474 (ritiro), 156 (5 per fascia), 301 («finito per oggi»), 161 (il forno conferma i prodotti caricati da Nicola), 63 (quota del rimborso parziale), 75 (chiavi di prova in produzione), 2031 («prenota per domani» a negozio chiuso), 2413 (PostHog dal server).
- La voce 20 (le email ferme in coda) è coperta dalla 165: per questo la posta si accende dopo gli aggiornamenti.
