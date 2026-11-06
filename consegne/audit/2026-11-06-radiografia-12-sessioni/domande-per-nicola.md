---
data: 2026-11-06 18:46
---

# Le domande per Nicola della radiografia del 6/11

## In parole semplici

Le dodici sessioni hanno scritto 35 domande per te. Tolti i doppioni ne restano 33. La più ripetuta è il freno sulla modalità piano: la chiedono 2 sessioni, ed è una domanda sola.

## Cosa cambia per te

Le domande sono raccolte qui, una volta sola, con la sessione che le ha fatte. Quelle che chiedono una tua decisione sono anche nella coda «Da approvare».

## Cosa devi fare

Rispondere quando vuoi, una alla volta. Nessuna ferma il lavoro di oggi.

## Cosa non ho verificato

I doppioni li ha uniti un programma, sulle parole: due domande simili scritte in modo molto diverso possono essere rimaste separate.

## Dettagli tecnici

1. Il controllo di fine turno della macchina segnala che l'entrata e l'uscita dalla modalità piano non hanno un freno che le sorvegli. Va aggiunto un freno in .claude/settings.json (lo puoi fare solo tu) oppure una riga nelle esenzioni, col motivo. *(da S01, S04)*
2. Il codice sconto che torna disponibile due volte (voce 1570): la protezione c'è nel codice, ma la migrazione 200 va applicata a mano sul database vero. È stata applicata? Da qui non si vede. *(da S01)*
3. Un sospetto non verificato, perché i verificatori erano finiti: dal pannello admin «modifica utente» si cambia il ruolo in negozio senza passare dal controllo della partita IVA (app/admin/users/page.tsx:384-386 e 960-966). Riguarda solo chi è amministratore: da far guardare a S07 o S08. *(da S01)*
4. La voce 715 (fattorino minorenne) è chiusa a metà: il database ferma una data di nascita da minorenne, ma un fattorino che svuota la data dopo aver caricato i documenti si approva lo stesso. L'ho segnata «cambiato» con la prova rossa: la riparazione va completata sulla rotta di approvazione. *(da S01)*
5. Il ritiro in negozio: il registro dei fatti lo dà acceso dal lancio, il codice lo tiene spento (lib/ritiro-in-negozio.ts:22). Si accende davvero al lancio del 15/11? Il difetto S02-005 sulle cifre dei Guadagni pesa grave solo se si accende. *(da S02)*
6. Il rimborso di un ordine in contanti già incassato: il 29/10 hai deciso che il sito apre da solo il reclamo con la cifra. Oggi non lo fa (S02-007). Finché non è riparato, vuoi che l’amministratore guidi il cliente ad aprirlo dalla sua pagina dell’ordine? *(da S02)*
7. Per accendere la carta servono, nel codice: CARTA_ACCESA da false a true in lib/funzioni-al-lancio.ts con una richiesta di unione firmata; prima, la correzione del difetto S03-001 (l'ordine che nasce pagato dopo un rimborso), che è l'unico grave acceso dal primo giorno. Nelle variabili di produzione: STRIPE_SECRET_KEY vera (sk_live_ o rk_live_: una di prova viene rifiutata dal codice), NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY vera (si fissa quando il sito viene costruito, quindi serve un nuovo rilascio dopo averla messa), STRIPE_WEBHOOK_SECRET dell'indirizzo /api/stripe/webhook e STRIPE_CONNECT_WEBHOOK_SECRET del secondo indirizzo per gli avvisi dei conti collegati. Su Stripe: i due indirizzi iscritti almeno a checkout.session.completed, async_payment_succeeded/failed, expired, charge.refunded, charge.refund.updated, charge.dispute.created/closed, payment_intent.succeeded/payment_failed, account.updated, payout.failed, transfer.reversed. STRIPE_CONNECT_CLIENT_ID non serve: il codice la legge ma non la usa. Confermi questo elenco come lista di controllo del giorno dell'accensione? *(da S03)*
8. Il conto Stripe che questa sessione vede è un conto di prova vuoto (nome «boh»: nessun indirizzo webhook, nessun conto collegato, nessun pagamento). Il «pagamento vero provato fino al bonifico del negozio» richiesto per accendere la carta non risulta fatto su questo conto: è stato fatto su un altro conto di prova, o è ancora da fare? *(da S03)*
9. Abbonamento: cosa vuol dire «primo incasso portato da MyCity» (il primo ordine pagato, il primo ordine consegnato, o il primo bonifico partito)? Serve per correggere S03-003 prima di riaccendere l'abbonamento. *(da S03)*
10. Per una falla riservata grave di questo referto serve un controllo fuori dal codice: quale, te lo dico in chat. *(da S04, S12)*
11. La voce 2126 del registro è segnata «già riparata prima», ma il database lascia ancora a un negozio sospeso togliersi la sospensione: va riaperta. *(da S04)*
12. La voce 687 del registro (accetta-condizioni senza controllo di provenienza) è aperta, ma nel codice a db5164c il controllo c'è (app/api/account/accetta-condizioni/route.ts:25-30): va ricollaudata e chiusa. *(da S04)*
13. In produzione esistono 5 tabelle del Pannello (telegram_chats, uptime_checks, kpi_snapshots, merchants_leads, outreach_events) e una funzione che non nascono da nessuna migrazione del sito: un database ricostruito dal deposito non le ha. Vanno portate in una migrazione, o spostate nel database del Pannello? *(da S05)*
14. Nel database vero restano 2 account creati dai dati di esempio (un cliente e un fattorino sospeso), più 2 email da prova su 8 account in tutto: si cancellano prima dell'apertura? *(da S05)*
15. Festivi: i negozi devono poter dire «chiuso il 25/12, l'1/1, il 15/8, il 4/7» senza toccare l'orario settimanale? Serve prima di Natale? *(da S06)*
16. Veloce con un solo fattorino: quante consegne veloci in contemporanea accettiamo prima di smettere di offrirla (proposta: 2)? *(da S06)*
17. Il termine del recesso va contato come dice la legge (fino alle 23:59 del 14esimo giorno dopo la consegna) o volete un margine piu' largo? Oggi il sito lo chiude all'ora esatta della consegna. *(da S06)*
18. Il prezzo «1.500» letto come 1,50 euro: lo segno grave perché un ordine nasce al prezzo sbagliato e parte l'avviso ai preferiti, ma la seconda lente lo pesa minore perché oggi nessun prodotto supera i 189 euro. Lo vuoi davanti agli altri gravi o in coda? *(da S07)*
19. Il fattorino in bici deve avere per forza patente e polizza RC? Il codice le chiede sempre (voce già aperta nel registro, la 131): se è una regola voluta, la voce si chiude; se no, resta da riparare. *(da S07)*
20. Quando il fattorino segna «cliente assente», la merce va rimessa in vendita subito o solo dopo che il negozio conferma di averla ripresa? *(da S07)*
21. Vuoi che la notifica del nuovo ordine parta nel momento in cui nasce l'ordine, invece di aspettare il lavoro delle notifiche? Oggi, con i lavori fermi, nessun telefono suona; il negozio ha comunque l'email. *(da S08)*
22. Quando il negozio accetta un ordine, al cliente arriva solo la campanella, non l'email: le email partono alla conferma, a «pronto» e a «consegnato». Va bene così, o «il cliente riceve gli avvisi per email» vuol dire ogni passaggio? *(da S08)*
23. Il giorno della riaccensione la notifica sul telefono ha bisogno di tre cose insieme: LAVORI_A_ORARIO=accesi, la chiave di servizio del database e le chiavi delle notifiche (VAPID). Le mettiamo nella lista di controllo della riaccensione? *(da S08)*
24. IVA sulla commissione: finché il commercialista non conferma il regime, che parola scriviamo ai negozi e nei Termini al posto di «IVA inclusa»? Quando arriva la risposta cambia anche la versione dei Termini. *(da S09)*
25. Consegna veloce: oggi si può ordinare fino alle 20:59 e, con un negozio aperto la sera, arriva verso le 22. Vuoi fermare l'ultima vendita della veloce alle 20, così l'arrivo resta dentro l'ultima fascia che finisce alle 21? *(da S09)*
26. Per l'avvocato, recesso: l'elenco «salumi, latticini» senza «freschi» nella regola del 31/10 va oltre l'art. 59 lettera d? Va scritto «salumi e formaggi freschi»? (si cambia prima il fatto, poi i Termini) *(da S09)*
27. Per l'avvocato, tempi di consegna: la fascia scelta in cassa è un termine pattuito, e la clausola «tempi stimati e non vincolanti» regge verso il consumatore? *(da S09)*
28. Per l'avvocato, esclusione dal recesso decisa dal negozio: la seconda lente la pesa grave oggi e bloccante al primo negozio non alimentare. Vuoi chiudere il fix prima di far entrare negozi non alimentari? *(da S09)*
29. Il paletto riscritto il 1/11 dice che il negozio approva le anteprime sul sito, dopo un avviso via app ed email. Oggi nel pannello del negozio non c'è nessuna pagina «Da approvare», e nessuna funzione del sito prepara anteprime da approvare. Non l'ho scritto come difetto della radiografia perché non c'è niente di rotto, manca una funzione: vuoi che diventi un lavoro aperto di prodotto? *(da S10)*
30. Il difetto del nome lungo che allarga la pagina sul telefono l'ho tenuto minore perché oggi l'unico negozio vero si chiama «Pane Quotidiano». Diventa grave il giorno in cui si iscrive un negozio con un nome di 35 caratteri o più: conviene correggerlo prima di aprire le iscrizioni ad altri negozi? *(da S10)*
31. La chiave della posta messa stanotte su Vercel è di «solo invio» o completa? La pagina Stato servizi dice che la posta non risponde (S11-011): se la chiave è sbagliata, il fornaio non riceve l email del nuovo ordine. Basta guardarla nel pannello di Resend o mandare un email di prova. *(da S11)*
32. Il giorno che riaccendi i lavori a orario, va bene questo ordine per il primo giro a mano? Prima expire-stale-orders, poi veloce-non-confermata (S11-002), e il segreto incollato senza «a capo» (S11-007). *(da S11)*
33. Il controllo delle migrazioni mancanti in produzione è rosso dal 31/10 al 5/11 (mancano fra le altre la 186, la 191 e la 195, letto dall AD); dopo c è stato il giro a mano del 5/11 alle 22:59 ma il controllo non è più girato. Il database vero ora è allineato? Lo verifica S05. *(da S11)*
