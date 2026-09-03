---
data: 2026-09-03 11:10
tipo: radiografia-totale-sito
codice: NicolaeRotaru/mycity @ 4f446aa (allineato a main, 2/9/2026 21:35)
fonte_raw: consegne/audit/2026-09-03-radiografia-marketplace-raw.json · consegne/design/2026-09-03-radiografia-design-raw.json
---

# Il sito che i clienti dovrebbero usare non esiste: il dominio porta a un server spento e il database vero non ha mai ricevuto le ultime migrazioni

**In due righe.** Ho radiografato il sito con il metodo più grande che so fare: lettura del codice su 24 lenti, prove eseguite davvero su una copia del sito e del database, e uno sguardo in sola lettura dentro la produzione vera. Le due cose più gravi non sono nel codice: sono fra il codice e il mondo.

## In parole semplici

Questa volta non ho solo letto il codice. Ho installato il sito in una macchina di prova, ho ricostruito il suo database da zero con le 145 istruzioni salvate nel progetto, e ho fatto girare le prove: 2.411 prove automatiche verdi, e 16 prove nel browser rosse. Poi ho aperto le pagine in un browser senza schermo, come farebbe un cliente. E poi ho guardato dentro la produzione vera, quella dove stanno i dati dei clienti, senza toccare niente: solo leggere.

Tredici esperti di codice e undici esperti di design dovevano rileggere tutto in tre giri, ognuno con un angolo diverso. Il limite delle cinque ore ci ha fermato due volte, come avevi chiesto tu. Il contenitore che mi ospita si è riavviato tre volte, e ogni volta ha ucciso le squadre in corso. Quello che è arrivato in fondo è misurato; quello che manca lo trovi scritto sotto, non nascosto.

Ecco il conto.

| | Quanti |
|---|---:|
| Problemi nuovi trovati oggi | 182 |
| Di cui bloccanti | 3 |
| Di cui gravi | 50 |
| Di cui minori | 129 |
| Problemi già noti riverificati e chiusi perché riparati | 174 |
| Riparati secondo il ricontrollo, ma contestati da un cercatore: restano aperti | 8 |
| Problemi già noti ancora aperti dopo oggi | 187 |

## Cosa cambia per te

**Primo: il dominio del marketplace porta a un server spento da più di un mese.** Il nome che sta sui QR e sui post, mycity-marketplace.com, punta ancora all'indirizzo di Render. Render l'abbiamo dismesso ad agosto. Il sensore della macchina che controlla se il sito risponde legge «errore 503» da 219 controlli di fila: l'ultima risposta buona è del 30 luglio. Il sito vero gira su Vercel, ma su Vercel il dominio non è mai stato collegato. E la protezione standard di Vercel chiude tutti gli indirizzi non personalizzati dietro il suo login. Quindi oggi un cliente che digita il dominio trova un errore. Chi arriva sull'indirizzo tecnico, secondo quell'impostazione, dovrebbe trovare una schermata di accesso che non è la sua: questa seconda metà è una deduzione dall'impostazione, non una cosa che ho visto. Il registro dei fatti lo aveva scritto il 22 agosto: «il dominio va aggiunto su Vercel e ripuntato». Dodici giorni dopo è ancora così. Non ho potuto aprire il sito da un browser esterno, perché la rete di questa sessione lo rifiuta: questo punto ha bisogno dei tuoi occhi, e ci vuole un minuto.

**Secondo: il database vero non ha mai ricevuto le ultime migrazioni.** Il codice pubblicato è quello del 2 settembre. Il registro delle migrazioni del database di produzione, invece, si ferma al 28 agosto: gli mancano ventuno righe. Attenzione al numero, perché sono due misure diverse. Ventuno è quante righe mancano nel registro. Le cose che mancano davvero le ho contate una per una con una lettura diretta, e sono sedici, più quattro indici: la tabella e le due funzioni del tetto di spesa AI, il nome del prodotto sulle righe d'ordine coi suoi due grilletti, le due funzioni dei conti del venditore, una funzione delle foto di consegna, la colonna che segna un carrello come recuperato, e il grilletto che accoda le email «ordine pronto» e «ordine consegnato». Tre migrazioni invece ci sono, applicate a mano: le trovi con un «sì» nella tabella in fondo. Il motivo è semplice: Vercel pubblica il codice a ogni unione, ma il passo che applica le migrazioni non può girare perché i quattro segreti che gli servono non sono mai stati configurati. È la scheda 161, ferma dal 22 agosto. La scheda «il rilascio non applica le migrazioni» era stata chiusa sul codice, non sul comportamento: va riaperta.

Facciamo un caso vero. Pane Quotidiano riceve un ordine e lo segna «pronto». Nel codice di oggi quel cambio di stato accoda un'email al cliente. In produzione il grilletto non esiste: l'email non parte. Il negoziante apre la pagina Analisi per vedere come va: la pagina mostra un errore, perché chiama una funzione che nel database vero non c'è. Il cliente che ha appena comprato lascia un carrello vuoto: il sito prova a segnarlo «recuperato» con una colonna che non esiste, l'errore viene inghiottito, e il giro orario dei carrelli abbandonati può scrivergli «hai lasciato qualcosa nel carrello». Tutto questo senza un solo allarme, perché anche la chiave di servizio manca in produzione e il controllo di salute risponde «malato» da almeno dodici giorni, cioè da sempre: un allarme sempre acceso è un allarme che nessuno guarda.

**Terzo: le variabili che mancano in produzione.** Quattro cose che si sistemano in un pomeriggio dal pannello di Vercel: la chiave di servizio di Supabase (senza, l'attività dei clienti non si scrive e il controllo di salute è sempre rosso), la chiave del CAPTCHA (senza, il login è aperto ai robot), l'indirizzo pubblico del sito (senza, le pagine dicono a Google di stare su localhost) e, su Supabase, la protezione contro le password già rubate.

**Quarto: i difetti nuovi nel codice.** Sono 182 in tutto, di cui 50 gravi. 66 portano il timbro di un collega che ha provato a smontarli senza riuscirci. Altri 5 sono stati scartati proprio da quella prova. I più cari sono sui soldi. Un ordine annullato dalla porta del database non restituisce i soldi della carta. Un codice sconto torna utilizzabile due volte quando il negozio rifiuta. Il codice di benvenuto muore se il primo ordine viene rifiutato. Li trovi uno per uno in fondo, con la prova che li fa diventare rossi.

**Quinto: la macchina che ti parla legge alla cieca.** La Cabina interroga il sito con due colonne che non esistono: quasi duemila letture al giorno muoiono nei log di produzione, e i numeri di carrelli e ritardi che vedi sono zeri, non misure. È un difetto mio, non del sito, ed è entrato nel cantiere con la sua prova.

## In che ordine li riparerei

Non valgono tutti uguale. In cima metto quello che ferma un euro dall'uscire, o che fa entrare il primo. Non quello che è più facile.

- **L'indirizzo del sito, per primo.** Finché il dominio porta a un server spento, tutto il resto è teoria. Nessun cliente arriva. Costa un pomeriggio e non tocca una riga di codice.
- **Poi il database vero al passo del codice.** Le venti cose che mancano non sono astratte. Sono le email che il cliente non riceve. È la pagina Analisi che il negoziante trova rotta. Anche qui non serve codice nuovo: quattro segreti da configurare e un comando già provato.
- **Terzo, il reso che si approva da solo.** Un cliente scrive nel database che il reso è arrivato e si fa rimborsare un ordine consegnato. È l'unico problema di oggi in cui i soldi escono davvero. A deciderlo è chi li incassa.
- **Quarto, il freno sui soldi che non frena.** Il database ha delle regole che impediscono a un compenso di superare l'incasso. Un pezzo di codice le zittisce proprio quando scattano.
- **Quinto, le tre porte sull'identità del cliente.** Un carattere invisibile nel link di accesso porta su un altro sito dopo la password. Un interruttore di sessione spegne le protezioni sull'ordine. I dati legali di ogni negozio si leggono senza account. Sono i tre che, se succedono, non si spiegano.

Sotto questi cinque restano una quarantina di problemi che toccano la conversione e la fiducia. I prezzi scritti all'inglese in cassa. I cinque euro promessi a chi non li riceve. Il pulsante dell'assistenza che copre il tasto per comprare. Valgono ordini, non incidenti: si riparano a pacchetti, non uno alla volta.

## Cosa ha trovato chi ha criticato me

Prima di consegnarti questo referto l'ho fatto smontare da un revisore che non aveva partecipato alla radiografia. Il suo compito non era trovare difetti nel sito: era trovare i buchi del mio lavoro. Ne ha trovati, e li ho corretti dentro questo testo. Tre meritano di essere detti qui.

**Copertura dichiarata non vuol dire copertura vera.** Tutte e 24 le lenti hanno prodotto un referto, e il conto interno leggeva questo come «nessuna zona scoperta». Non è vero, e l'ho ricontato io: 29 delle 93 porte del sito non le nomina nessun referto, e nemmeno le dichiara come non guardate. Lo stesso vale per 11 delle 20 rotte dell'intelligenza artificiale, per tutte e 8 le porte di amministrazione, e per 102 delle 145 migrazioni. La più cara di queste è il lavoro notturno che rifà il conto dei contanti incassati dai fattorini: se sbaglia, sbaglia in euro veri verso una persona vera, e oggi non l'ha guardato nessuno.

**8 volte il ricontrollo dice «riparato» e un cercatore dice «c'è ancora».** Li ho fatti decidere da un arbitro, che è andato a leggere il codice uno per uno. Sette volte ha ragione il ricontrollo, e quei sette li ho chiusi. L'ottavo era riparato a metà: il controllo sulla risposta tagliata dell'intelligenza artificiale c'è sul lavoro massivo del catalogo, ma nessuna delle quindici rotte che chiamano il modello una volta sola lo fa. Quello resta aperto, riscritto per quello che è davvero.

La causa dello scontro è di metodo, e la scrivo perché si ripeterà: il canale che dice «c'è ancora» non ha l'obbligo della prova, quindi una frase senza prova può contraddire un verdetto con prova, e il riepilogo li contava zero. Adesso li incrocia e li stampa, e un «riparato» contestato non si chiude finché qualcuno non decide.

**I gravi usciti col solo autore sono passati da un secondo lettore.** Il revisore ne aveva contati tredici. Li ho fatti rileggere a un collega col compito di rifiutarli: due sono caduti, uno perché era lo stesso difetto scritto due volte, quattro sono scesi da gravi a minori. Oggi nessun grave e nessun bloccante esce con la firma del solo autore.

**Due prove su tre che ha aperto guardavano dalla parte sbagliata.** Una non poteva diventare rossa, perché il limite che doveva dimostrare mancante era scritto nello stesso file. L'altra chiedeva a un visitatore anonimo di leggere una vista che all'anonimo è già negata: la domanda giusta era cosa vede un utente registrato che non è un fattorino. Le due schede restano, ma con la prova da riscrivere.

## Cosa non ho verificato

Il sito pubblicato da un browser esterno: la rete della sessione rifiuta sia il dominio sia l'indirizzo Vercel. Stripe: nessuna chiave, nessun incasso guardato. Tutte e 24 le lenti hanno avuto il loro cercatore, ma «lente coperta» non vuol dire «sito coperto»: 29 delle 93 porte del sito, 11 delle 20 rotte dell'intelligenza artificiale, 8 delle 8 porte di amministrazione e 102 delle 145 migrazioni non le nomina nessun referto. Non sono state guardate, e finora nessuno lo diceva. 103 dei 182 problemi nuovi non hanno la contro-verifica di un collega. Quasi tutti sono minori, che per regola non la richiedono. 0 invece sono gravi, trovati da flotte morte prima del collaudo. Altri 13 li ho misurati io sulla produzione, e nessun collega li ha rifatti. La riverifica dei problemi noti è arrivata a 361 schede su 361, cioè a tutte. Il secondo giro, quello con l'angolo avversario, l'hanno avuto 12 lenti su 24. Le altre 12 hanno avuto un solo passaggio, e fra queste ci sono due che avrebbero meritato il secondo: l'architettura, che è la lente che ha trovato il freno sui soldi che non frena, e le rotte dell'intelligenza artificiale, dove undici porte su venti non le ha aperte nessuno. Il terzo giro, il residuo, non è partito su nessuna lente: il limite delle cinque ore e tre riavvii del contenitore hanno mangiato il tempo. Le migrazioni che non creano oggetti con nome (vincoli, revoche, dati) le ho date per mancanti in produzione dalla storia delle migrazioni, non provate una per una.

Cinque modi di guardare non li ho usati nemmeno una volta, e li scrivo perché è lì che sta il prossimo giro. Nessuno ha visto una pagina piena di dati veri: il materiale per riempirla c'è già nel progetto e nessuno l'ha aperto. Nessuno ha fatto un percorso d'acquisto intero, dalla registrazione al rimborso, con una persona sola. Nessuno ha guardato il sito con l'occhio di chi attacca avendo un account vero: tutte le prove di sicurezza partono da visitatore anonimo, mentre in produzione sono trentuno le funzioni con permessi elevati che può chiamare chi ha fatto l'accesso. Nessuno ha seguito lo stesso euro dall'incasso al rimborso passando per il compenso al negozio. E nessuno ha rotto il codice apposta per vedere se le prove del sito se ne accorgono: duemilaquattrocento prove verdi dicono che passano, non che coprono.

## Cosa devi fare

1. **Apri in finestra anonima https://mycity-phi.vercel.app e dimmi cosa vedi.** Se compare la pagina di accesso di Vercel, il sito è chiuso al pubblico. Un minuto.
2. **Collega il dominio su Vercel e cambia il DNS.** Progetto mycity, sezione Domains: aggiungi mycity-marketplace.com e imposta i record che Vercel ti mostra. Finché non è fatto, il marketplace non ha un indirizzo.
3. **Configura i quattro segreti su GitHub e applica le migrazioni mancanti.** È la scheda 161 in coda dal 22 agosto. Poi un comando solo, idempotente e provato in CI, porta il database vero al passo del codice. Da lì il controllo notturno diventa rosso da solo alla prossima deriva.
4. **Sistema le quattro cose del punto Terzo** dal pannello di Vercel e da Supabase.
5. **Firma la richiesta di unione di questo referto**: porta i 182 problemi nuovi nel registro del sito con la loro prova, chiude i 174 già riparati, e mette nel cantiere il difetto della Cabina.
6. **Dimmi se vuoi il terzo giro, e con quale dei cinque modi.** Il residuo non l'ho fatto su nessuna lente. Se devo scegliere io, comincerei dal sito pieno di dati veri: costa mezza giornata e il materiale c'è già. Non è finito: è rimandato.

---

## Dettagli tecnici

### Metodo

- Codice: `NicolaeRotaru/mycity` al commit `4f446aa`, allineato a `main` del 2/9/2026 21:35 (0 avanti, 0 indietro).
- Banco di prova nel contenitore: `npm ci` · `npm run typecheck` 0 errori (40 s) · `npm run lint` 0 · `npm run test` 326 file, 2.411 prove verdi (46 s) · Postgres 16 locale ricostruito con `tests/sql/harness/apply.sh` (145 migrazioni, 0 fallite) · `tests/sql/harness/run.sh` 26 file di controlli RLS verdi · migrazione 150 su database pieno ok · `scripts/applica-migrazioni-mancanti.sh` due volte → 0 riapplicate · `npm run db:check-drift` ok · `npm run build` con variabili finte (3m35s) e sito su `localhost:3000`.
- Prove nel browser: `tests/e2e/11-a11y-percorso-acquisto.spec.ts` (axe) 8 su 8 verdi; suite senza database (01, 06, 07, 10) su chromium + mobile-safari: 40 verdi, 16 rosse, 2 saltate.
- Produzione in sola lettura: Supabase MCP (`get_advisors` sicurezza 64 avvisi, performance 206; `execute_sql` solo su cataloghi e conteggi; `query_logs` 24 ore), Vercel MCP (`get_runtime_errors` 7 giorni, `list_deployments`, `get_project`, `get_project_deployment_protection`), `getent hosts` per il DNS.
- Le flotte: workflow `radiografia-sito-giro` (un senior per lente, prove che girano nel banco, i gravi passati a blocchi di quattro a un collega col compito di rifiutarli) e `riverifica-registro-sito` (un collaudatore per dimensione sui 361 noti). Le prove scritte dagli agenti stanno in una cartella fuori dal repo e girano con `vitest --config` puntato al codice vero.
- Il secondo lettore, in numeri: Dei 53 fra gravi e bloccanti, 40 li ha riletti un collega diverso col compito di rifiutarli, e nessuno e uscito col solo autore. I minori per regola non passano dal secondo lettore.
- La riverifica dei noti è stata scritta due volte, dal giornale di bordo e dal ritorno della flotta: 361 schede su 361 hanno due scritture, e i due verdetti coincidono su tutte. Zero discordanze.
- Un revisore indipendente (`internal-audit`), che non ha partecipato alla radiografia, l'ha criticata prima della consegna: referto in `consegne/audit/2026-09-03-critica-di-completezza.md`. Le sue correzioni sono già dentro questo testo.
- Freni di casa: `node cervello/tasso-chiusura.mjs` → settembre ⚪ (0 nati), agosto 1,28: ricerca ammessa. Referti importati con `node cervello/radiografia-marketplace-digest.mjs`; i campi della prova ora attraversano la porta della casa (`cervello/referti-sito.mjs`, `CAMPI_EXTRA_DEL_REFERTO`, prova `cervello/test/la-prova-attraversa-la-porta-della-casa.test.mjs`).

### Cosa è successo alle flotte

- Giro 1 lanciato alle 00:50 di Piacenza su 24 lenti in quattro flotte, più la riverifica in una quinta. Alle 01:2x il limite di sessione delle cinque ore ha fermato 45 agenti su 56; i finiti sono restati nei giornali di bordo.
- Ripartenza alle 02:41 come richiesto. Il contenitore si è riavviato alle 02:41 e alle 02:45, uccidendo le cinque flotte rilanciate insieme. Dalle 02:46 una flotta sola per volta.
- Alle 07:20 hai cambiato il modello e il lavoro è ripreso: le tre lenti rimaste senza cercatore (accessibilità visiva, stati dell'interfaccia, immagini e media) sono state coperte, la riverifica dei noti è arrivata a tutte e 24 le dimensioni, e sono partiti i due giri con l'angolo avversario.
- Alle 08:00 sono ripartite le ultime due flotte: il giro con l'angolo avversario sulle sette lenti dei soldi, dei permessi e dei dati, e quello sulle cinque lenti della conversione e della fiducia. Nessun agente perso.

### I nuovi problemi per lente

| Lente | Bloccanti | Gravi | Minori | Verificati da un collega | Alto impatto |
|---|---:|---:|---:|---:|---:|
| Accessibilità | 0 | 1 | 4 | 2 | 0 |
| Accessibilità visiva | 0 | 2 | 7 | 4 | 2 |
| API | 0 | 3 | 4 | 3 | 1 |
| Architettura | 0 | 2 | 1 | 2 | 1 |
| Coerenza del marchio | 0 | 1 | 7 | 2 | 1 |
| Dati e analitica | 0 | 5 | 6 | 4 | 1 |
| Endpoint AI | 0 | 1 | 6 | 1 | 0 |
| Flussi critici | 0 | 5 | 5 | 3 | 5 |
| Flussi di conversione | 0 | 2 | 6 | 5 | 5 |
| Immagini e media | 0 | 0 | 5 | 4 | 3 |
| Interfaccia | 0 | 2 | 2 | 1 | 2 |
| Layout e schermi | 0 | 2 | 1 | 2 | 1 |
| Microcopy | 0 | 3 | 10 | 6 | 3 |
| Mobile e app | 0 | 3 | 6 | 3 | 0 |
| Navigazione | 0 | 1 | 5 | 2 | 0 |
| Pagamenti | 0 | 2 | 7 | 3 | 3 |
| Permessi sul database | 1 | 2 | 5 | 3 | 3 |
| Privacy e legale | 0 | 3 | 7 | 4 | 1 |
| Rilascio e affidabilità | 2 | 4 | 6 | 1 | 3 |
| Sicurezza e accessi | 0 | 3 | 5 | 3 | 2 |
| Stati dell'interfaccia | 0 | 3 | 3 | 5 | 4 |
| Tipografia | 0 | 0 | 11 | 2 | 2 |
| Velocità | 0 | 0 | 4 | 1 | 0 |
| Velocità percepita | 0 | 0 | 6 | 0 | 0 |
| **Totale** | **3** | **50** | **129** | **66** | **43** |

### I bloccanti e i gravi, uno per uno

1. **[bloccante · alto impatto] Un cliente si rimborsa da solo un ordine consegnato: scrive il reso gia' «ricevuto» e lo fa passare per il negozio**  
   Lente: Permessi sul database · dove: `migrations/024_blockers_money_kyc_returns_cash.sql:108-110 (policy returns_buyer_insert: l'unico controllo e' buyer_id = auth.uid()) · app/a`  
   Prova (comando, eseguita e rossa) · verifica: collega
2. **[bloccante · alto impatto] La produzione è indietro di ventuno migrazioni: il codice pubblicato chiama tabelle, colonne e funzioni che nel database vero non esistono**  
   Lente: Rilascio e affidabilità · dove: `produzione Supabase (progetto Mycity) vs migrations/130-150; .github/workflows/deploy-dopo-ci.yml:166-205 (segreti SUPABASE_DB_URL, VERCEL_*`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
3. **[bloccante · alto impatto] Il dominio pubblico del marketplace punta da più di un mese a un server spento, e l'indirizzo vero su Vercel è chiuso dietro il login di Vercel**  
   Lente: Rilascio e affidabilità · dove: `DNS: mycity-marketplace.com → 216.24.57.1 (Render, dismesso ad agosto), www → test-my-city-con-claude.onrender.com; Vercel progetto mycity: `  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
4. **[grave · alto impatto] Il ripiego scritto per la migrazione 124 inghiotte i paletti sui soldi: un compenso al negozio più alto dell'incasso entra lo stesso, senza il lordo**  
   Lente: Architettura · dove: `lib/db/migrazione-124.ts:50-53 (il codice 23514 nell'insieme SCHEMA_INDIETRO), :71-83 (conRipiegoSchema riprova senza i campi) · app/api/ord`  
   Prova (comando, eseguita e rossa) · verifica: collega
5. **[grave · alto impatto] Il captcha si spegne da solo in produzione se manca la chiave segreta: login, registrazione e modulo contatti restano aperti ai bot senza che nessuno se ne accorga**  
   Lente: Sicurezza e accessi · dove: `lib/captcha.ts:14-26 (il ramo che lascia passare: 21-26) · chiamanti app/api/auth/signin/route.ts:47 · app/api/auth/signup/route.ts:40 · app`  
   Prova (comando, eseguita e rossa) · verifica: collega
6. **[grave · alto impatto] Un carattere invisibile nel link di accesso porta il cliente su un sito esterno dopo che ha messo la password**  
   Lente: Sicurezza e accessi · dove: `lib/safe-redirect.ts:19 · app/auth/callback/route.ts:29,36,145 · app/sign-in/page.tsx:72,158,169`  
   Prova (comando, eseguita e rossa) · verifica: collega
7. **[grave · alto impatto] Chi partecipa a una chat puo' intestarla a un'altra persona, che legge tutto lo storico**  
   Lente: Permessi sul database · dove: `migrations/026_chat_messaging.sql:41-44 (policy conversations_update_participants: USING «sono buyer o seller», nessun WITH CHECK e nessun l`  
   Prova (comando, eseguita e rossa) · verifica: collega
8. **[grave · alto impatto] Correggere il telefono in cassa non serve: il pagamento riparte con la sessione vecchia e l'ordine nasce col numero sbagliato**  
   Lente: Pagamenti · dove: `app/api/stripe/checkout/route.ts:174-189 · app/api/stripe/checkout/route.ts:217-244 · lib/stripe/webhook/ordini.ts:328-333`  
   Prova (comando, eseguita e rossa) · verifica: collega
9. **[grave · alto impatto] Chi annulla il primo ordine perde il buono di benvenuto: il controllo «solo primo ordine» conta anche gli ordini annullati**  
   Lente: Pagamenti · dove: `lib/coupons.ts:83-92 · funzione SQL public.check_coupon (stessa logica, usata dal browser) · lib/ordini/annulla.ts:101-124`  
   Prova (comando, eseguita e rossa) · verifica: collega
10. **[grave · alto impatto] Manca l'esito «cliente assente»: i termini promettono tre telefonate e un rimborso al netto della consegna, il codice non sa registrarlo**  
   Lente: Privacy e legale · dove: `lib/order-status.ts:1-9 e 111-116 · app/terms/page.tsx:162-170 · lib/ordini/annulla.ts:68-157 · app/api/rider/ (nessuna rotta) · database: 0`  
   Prova (comando, eseguita e rossa) · verifica: collega
11. **[grave · alto impatto] In cassa, quando il server risponde con una pagina di errore, il cliente legge «la sessione è scaduta, accedi di nuovo»**  
   Lente: Interfaccia · dove: `lib/errors.ts:133-136 (ramo /jwt|token|expired|unauthor/) · app/checkout/page.tsx:864 (await res.json() senza guardia) e :894 (toast con fri`  
   Prova (comando, eseguita e rossa) · verifica: collega
12. **[grave · alto impatto] La pagina Analisi del venditore e la colonna Venduti vanno in errore in produzione**  
   Lente: Interfaccia · dove: `app/seller/analytics/page.tsx:84-98 (rpc andamento_del_negozio, l'errore risale); app/seller/products/page.tsx:96 (rpc venduti_per_prodotto)`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
13. **[grave · alto impatto] Il codice di benvenuto muore se il primo ordine viene rifiutato o annullato**  
   Lente: Flussi critici · dove: `lib/coupons.ts:83-91 (conta TUTTI gli ordini dell'utente, anche CANCELED) · funzione DB public.check_coupon(text,numeric), blocco first_orde`  
   Prova (comando, eseguita e rossa) · verifica: collega
14. **[grave · alto impatto] Chi chiede di cancellare l'account resta col profilo svuotato e l'account ancora vivo**  
   Lente: Flussi critici · dove: `lib/account/cancellazione.ts:265-301 (anonimizza prima, cancella dopo) · lib/account/cancellazione.ts:20-35 (i campi azzerati) · app/api/cro`  
   Prova (comando, eseguita e rossa) · verifica: collega
15. **[grave · alto impatto] Dopo l'ordine il carrello non viene segnato come recuperato in produzione, e il cliente rischia la mail del carrello abbandonato**  
   Lente: Flussi critici · dove: `lib/cart-sync.ts:58-63 e lib/carrelli-abbandonati.ts:44 (scrivono recovered_at); produzione: colonna abandoned_carts.recovered_at assente (m`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
16. **[grave · alto impatto] Le email «ordine pronto» e «ordine consegnato» in produzione non partono mai: il grilletto che le accoda non c'è**  
   Lente: Flussi critici · dove: `migrations/150_l_ordine_pronto_e_consegnato_arrivano_per_email.sql (trigger trg_enqueue_order_status_email); app/api/cron/send-emails/route.`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
17. **[grave · alto impatto] La segnalazione di un prodotto pericoloso non avvisa nessuno**  
   Lente: API · dove: `app/api/segnalazioni/route.ts:83-95 (categoria 'moderation'); vincolo notifications_category_check sulla tabella notifications (letto dal da`  
   Prova (comando, eseguita e rossa) · verifica: collega
18. **[grave · alto impatto] Il rimborso al cliente non toglie un euro dai guadagni che il negozio vede**  
   Lente: Dati e analitica · dove: `lib/metriche-venditore.ts:26-34,37-41,73-90 · app/seller/dashboard/page.tsx:132 · app/seller/analytics/page.tsx:123,187 · app/seller/earning`  
   Prova (comando, eseguita e rossa) · verifica: collega
19. **[grave · alto impatto] Il semaforo resta verde mentre nessuno riesce più ad accedere o a pagare con la carta**  
   Lente: Rilascio e affidabilità · dove: `app/api/health/route.ts:84-107 · lib/captcha.ts:17-28 · app/sign-in/page.tsx:18 · app/sign-up/page.tsx:33,93 · app/checkout/page.tsx:497-499`  
   Prova (comando, eseguita e rossa) · verifica: collega
20. **[grave · alto impatto] Le email di ordine, rimborso e gift card arrivano al cliente nei colori della vecchia palette indigo, non in terracotta**  
   Lente: Coerenza del marchio · dove: `lib/email/templates.ts:25 (BRAND_COLOR = '#4f46e5') · :39-49 (guscio: sfondo #f8fafc, testo #1e293b, piede #f1f5f9/#64748b) · :62 (pulsante)`  
   Prova (comando, eseguita e rossa) · verifica: collega
21. **[grave · alto impatto] Dopo le 20 il checkout propone «Domani», ma l'ordine viene rifiutato perché il negozio è chiuso adesso**  
   Lente: Flussi di conversione · dove: `app/api/stripe/checkout/route.ts:285-289; app/api/orders/cod/route.ts:336-337; lib/store-hours.ts:47-56 (isStoreClosedForOrder guarda solo l`  
   Prova (comando, eseguita e rossa) · verifica: collega
22. **[grave · alto impatto] Chi torna indietro dalla pagina di pagamento trova l'ultimo pezzo «esaurito» per due ore, e lo aveva riservato lui**  
   Lente: Flussi di conversione · dove: `app/api/stripe/checkout/route.ts:521-543 (reserve_stock prima di aprire la sessione), 174-189 (l'impronta del carrello include fascia, indir`  
   Prova (comando, eseguita e rossa) · verifica: collega
23. **[grave · alto impatto] Sulla scheda prodotto, per chi ha fatto l'accesso, il pulsante rotondo dell'assistenza copre il lato destro di «Aggiungi al carrello»**  
   Lente: Layout e schermi · dove: `components/SupportChatButton.tsx:39 (fixed bottom-24 right-4 z-40 w-14 h-14) · components/StickyAddToCart.tsx:60-64 (fixed z-30, bottom = va`  
   Prova (comando, eseguita e rossa) · verifica: collega
24. **[grave · alto impatto] Promettiamo 5 euro anche all'amico invitato, ma il credito va solo a chi invita**  
   Lente: Microcopy · dove: `app/profile/referral/page.tsx:56,73-74,149 · lib/email/templates.ts:295 · lib/account-menu.ts:33 · migrations/089_referral_reward_on_deliver`  
   Prova (comando, eseguita e rossa) · verifica: collega
25. **[grave · alto impatto] La pagina Resi promette un bonifico sull'IBAN per chi ha pagato in contanti, ma nessuno chiede l'IBAN e il rimborso arriva come credito**  
   Lente: Microcopy · dove: `app/returns/page.tsx:78 · app/faq/page.tsx:78 · app/api/returns/create/route.ts:14-25 · lib/stripe/payout.ts:746-793 · app/checkout/page.tsx`  
   Prova (comando, eseguita e rossa) · verifica: collega
26. **[grave · alto impatto] I bordi dei campi da compilare non si vedono: staccano una volta e un quarto dalla pagina**  
   Lente: Accessibilità visiva · dove: `components/ui/Field.tsx:30, components/ui/Field.tsx:32, app/globals.css:73`  
   Prova (comando, eseguita e rossa) · verifica: collega
27. **[grave · alto impatto] Due tocchi su «Ripeti ordine» mettono nel carrello il doppio della roba**  
   Lente: Stati dell'interfaccia · dove: `lib/riordino.ts:58-100 · app/orders/[id]/page.tsx:338-351, :405, :692 · components/home-sections/ReorderRail.tsx:120, :134`  
   Prova (comando, eseguita e rossa) · verifica: collega
28. **[grave · alto impatto] Il negozio torna da Stripe e legge «pagamenti aggiornati» anche quando Stripe non ha attivato niente**  
   Lente: Stati dell'interfaccia · dove: `app/seller/dashboard/page.tsx:11-36 · app/api/stripe/connect/refresh-status/route.ts:43-53 · confronto con components/rider/RiderConnectButt`  
   Prova (comando, eseguita e rossa) · verifica: collega
29. **[grave] Quando il negozio rifiuta un ordine con codice sconto, il coupon torna utilizzabile due volte**  
   Lente: Architettura · dove: `app/api/seller/orders/[id]/reject/route.ts:62-66 (chiama annullaERimborsa) e :89-91 (richiama release_coupon per conto suo) · lib/ordini/ann`  
   Prova (comando, eseguita e rossa) · verifica: collega
30. **[grave] Quattordici funzioni con permessi elevati sono chiamabili da chi non ha fatto l'accesso, e due di queste scrivono**  
   Lente: Sicurezza e accessi · dove: `produzione (advisor anon_security_definer_function_executable) e schema locale: track_sponsored_click, track_sponsored_impression, negozio_a`  
   Prova (comando, non eseguita) · verifica: AD (misurato, non contro-verificato)
31. **[grave] Sei viste del database girano con i permessi di chi le ha create, non di chi le legge**  
   Lente: Permessi sul database · dove: `produzione e migrazioni: viste shop_of_month_leaderboard, sponsored_active_public, live_activity_public, rider_reviews_ricevute, ordini_disp`  
   Prova (comando, non eseguita) · verifica: AD (misurato, non contro-verificato)
32. **[grave] Un quindicenne può iscriversi come rider: la data di nascita si salva ma nessuno la confronta con i 18 anni, nemmeno chi approva**  
   Lente: Privacy e legale · dove: `app/rider/onboarding/page.tsx:43, 111-112, 158 · app/api/kyc/start-check/route.ts:92-100 · migrations/021_seller_kyc_and_approval.sql:21 · m`  
   Prova (comando, eseguita e rossa) · verifica: collega
33. **[grave] Il buono regalo tiene per sempre l'email di chi non è nostro cliente**  
   Lente: Privacy e legale · dove: `lib/stripe/webhook/giftcard.ts:65-113, app/api/gift-cards/checkout/route.ts:28-33,73-80, app/privacy/page.tsx:95-132, lib/account/cancellazi`  
   Prova (comando, eseguita e rossa) · verifica: collega
34. **[grave] Il campo per confermare la cancellazione dell'account non ha nome: si sente solo «campo di testo»**  
   Lente: Accessibilità · dove: `app/profile/settings/page.tsx:620-628`  
   Prova (umano, non eseguita) · verifica: collega
35. **[grave] Le prove nel browser non girano mai in CI e, quando girano, otto su ventinove sono rosse per testi cambiati**  
   Lente: Flussi critici · dove: `.github/workflows/ci.yml (job e2e-tests: salta senza SUPABASE_TEST_URL/ANON); tests/e2e/01-home-renders.spec.ts:9-35, 06-seo-and-a11y.spec.t`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
36. **[grave] Il rifiuto del negozio restituisce il codice sconto due volte: il buono guadagna usi oltre il tetto**  
   Lente: API · dove: `app/api/seller/orders/[id]/reject/route.ts:89-92 · lib/ordini/annulla.ts:115-121, 156, 197 · migrations/116_soldi_radiografia.sql (release_c`  
   Prova (comando, eseguita e rossa) · verifica: collega
37. **[grave] Cancellare l'account di un fattorino cancella anche la sua cassa contanti: i soldi da versare spariscono dal registro**  
   Lente: API · dove: `migrations/024_blockers_money_kyc_returns_cash.sql:122 (cod_reconciliations.rider_id → auth.users ON DELETE CASCADE, vincolo cod_reconciliat`  
   Prova (comando, eseguita e rossa) · verifica: collega
38. **[grave] Il tetto giornaliero di spesa AI in produzione non è condiviso: ogni copia del sito conta per sé**  
   Lente: Endpoint AI · dove: `lib/ai/tettoSpesa.ts:138-165 (ripiego in memoria quando spesa_ai_di_oggi/registra_spesa_ai falliscono); produzione: funzioni e tabella ai_sp`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
39. **[grave] L'acquisto pagato alla consegna non arriva mai a Google Analytics: il checkout cerca gli ordini nel posto sbagliato della risposta**  
   Lente: Dati e analitica · dove: `app/checkout/page.tsx:759 · app/checkout/page.tsx:753-758 · app/api/orders/cod/route.ts:938 · app/api/orders/cod/route.ts:182-183 · lib/api/`  
   Prova (comando, eseguita e rossa) · verifica: collega
40. **[grave] Il registro attività copia in chiaro nome e cognome legali di negozianti e fattorini a ogni modifica del profilo**  
   Lente: Dati e analitica · dove: `migrations/115_privacy_radiografia.sql:64-69 · migrations/073_activity_tracking.sql:47-110 · app/api/cron/process-deletions/route.ts:182-186`  
   Prova (comando, eseguita e rossa) · verifica: collega
41. **[grave] L'accesso con Google non lascia nessuna riga nel registro degli accessi**  
   Lente: Dati e analitica · dove: `components/ActivityTracker.tsx:121-133 · app/auth/callback/route.ts:16 · app/api/track/route.ts:41-45 · app/api/track/route.ts:183 · lib/act`  
   Prova (umano, non eseguita) · verifica: collega
42. **[grave] Il Pannello dell'AD interroga colonne che nel sito non esistono: quasi duemila query al giorno falliscono in produzione**  
   Lente: Dati e analitica · dove: `ad-mycity: pannello/src/lib/marketplace-db.ts:136 e pannello/src/app/api/metriche/funnel/route.ts:23 (abandoned_carts.created_at), cervello/`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
43. **[grave] In produzione manca la chiave di servizio Supabase: la registrazione dell'attività fallisce dieci volte su dieci**  
   Lente: Rilascio e affidabilità · dove: `app/api/track/route.ts (lib activity: «Service role Supabase non configurato»); Vercel → errori runtime 7 giorni`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
44. **[grave] Il sito pubblicato si presenta ai motori di ricerca come se stesse su localhost**  
   Lente: Rilascio e affidabilità · dove: `app/layout.tsx (metadataBase/canonical/og:url da NEXT_PUBLIC_APP_URL); produzione: NEXT_PUBLIC_APP_URL assente → canonical e og:url = http:/`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
45. **[grave] Il controllo di salute del sito risponde «malato» perché non riesce a leggere i battiti dei lavori periodici**  
   Lente: Rilascio e affidabilità · dove: `app/api/health/route.ts + lib/cron-health (legge cron_heartbeats); produzione: GET /api/health → 503 {status: unhealthy, cron: {ok:false, es`  
   Prova (comando, eseguita e rossa) · verifica: AD (misurato, non contro-verificato)
46. **[grave] Dopo l'uscita dall'account le notifiche push restano legate al telefono: chi entra dopo riceve gli avvisi degli ordini del primo e non può prendersele**  
   Lente: Mobile e app · dove: `components/PushNotificationOptIn.tsx:47-50 (stato «Notifiche attive» deciso solo dal browser), :85-93 (upsert onConflict endpoint), :107-115`  
   Prova (comando, eseguita e rossa) · verifica: collega
47. **[grave] Il cliente legge «arriva tra ~3 min» calcolato su una posizione del fattorino ferma anche da mezz'ora**  
   Lente: Mobile e app · dove: `app/orders/[id]/page.tsx:268-279 (riderEtaMin da rider_lat/lng senza guardare rider_position_updated_at), :248-249 (pin «Rider» sulla mappa `  
   Prova (umano, non eseguita) · verifica: collega
48. **[grave] Sul telefono un cerchio grigio copre i prodotti e apre un menu con «Esci» a chi non ha un account**  
   Lente: Mobile e app · dove: `components/MobileTabBar.tsx:195-208 (posizione a :203); lib/ui/schede-in-fondo.ts:97-103 e :111-113; lib/account-menu.ts:20-23 e :82-85; com`  
   Prova (comando, eseguita e rossa) · verifica: collega
49. **[grave] Nel pannello del negoziante il pulsante «Copilot» galleggia sopra «Salva modifiche» della modifica in blocco: il tocco apre il Copilot e le modifiche si perdono**  
   Lente: Layout e schermi · dove: `components/seller/SellerShell.tsx:419-428 (Link fixed bottom-6 right-6 z-overlay, mostrato su ogni pagina venditore tranne il Copilot) · app`  
   Prova (comando, eseguita e rossa) · verifica: collega
50. **[grave] Il sito dà quasi tutti gli indirizzi email su un dominio che il codice stesso tratta come ripiego**  
   Lente: Microcopy · dove: `components/Footer.tsx:237-238 · app/contact/page.tsx:89-92 (info@mycity.it) e 176 (info@mycity-marketplace.com) · app/help/page.tsx:101-105 `  
   Prova (umano, non eseguita) · verifica: collega
51. **[grave] Nella ricerca, scegliere una categoria madre nasconde i prodotti delle sue sottocategorie**  
   Lente: Navigazione · dove: `lib/queries/griglia-prodotti.ts:139-140 · app/search/page.tsx:96-106, 191-200, 503 · app/category/[slug]/page.tsx:328, 503`  
   Prova (comando, eseguita e rossa) · verifica: collega
52. **[grave] I titoli sui riquadri scuri restano color inchiostro invece di diventare bianchi**  
   Lente: Accessibilità visiva · dove: `app/globals.css:148-152, app/about/page.tsx:89 e :94, components/home-sections/HomeSectionRenderer.tsx:414-415, components/store-sections/Ba`  
   Prova (comando, eseguita e rossa) · verifica: collega
53. **[grave] La consolle delle emergenze dice «tutto tranquillo» anche quando non ha letto niente**  
   Lente: Stati dell'interfaccia · dove: `app/admin/sos/page.tsx:36-49, :72, :86-89 · sorgente degli eventi: components/rider/SOSButton.tsx:55-66`  
   Prova (comando, eseguita e rossa) · verifica: collega

### I minori, solo il titolo

- Le due strade che creano un ordine, contanti e carta, rifanno a mano la stessa verifica di prodotti, varianti e scorte: 58 righe identiche su 86, pronte a divergere *(Architettura)*
- Chiunque sia loggato puo' leggere se un altro utente vuole o no le notifiche, passando il suo id *(Sicurezza e accessi)*
- L'accettazione delle condizioni e' l'unica rotta con sessione che non passa dal cancello comune: il controllo di provenienza aggiunto il 30 agosto qui non c'e' *(Sicurezza e accessi)*
- Chi vuole falsare le statistiche di un negozio che ha pagato la vetrina in evidenza puo' farlo senza account *(Sicurezza e accessi)*
- Il freno contro chi bussa mille volte si azzera cambiando l'ultima parola dell'indirizzo *(Sicurezza e accessi)*
- La protezione contro le password già rubate è spenta su Supabase Auth *(Sicurezza e accessi)*
- Credito applicato e costo di consegna possono diventare negativi, e portafoglio e spesa sponsorizzata non hanno paletti *(Permessi sul database)*
- La tabella degli abbonamenti e' aperta in scrittura ai clienti, prezzo compreso, ma nessun pezzo del sito la legge *(Permessi sul database)*
- Un interruttore di sessione spegne tutte le protezioni sull'ordine, e chi è dentro se lo accende da solo *(Permessi sul database)*
- La revoca delle scritture di fine agosto ne ha lasciate indietro quarantuno, ordini e prodotti compresi *(Permessi sul database)*
- In produzione la tabella dei prodotti ha due regole in più che nel codice, e un indice degli ordini è doppio *(Permessi sul database)*
- Il codice sconto torna in circolo più volte di quanto è stato usato: due rilasci al rifiuto del negozio, rilascio intero su un carrello a due negozi *(Pagamenti)*
- Il credito MyCity si spende solo pagando in contanti: chi paga con carta non può usare il buono regalo *(Pagamenti)*
- Un rimborso fatto dal cruscotto Stripe non restituisce il codice sconto al cliente *(Pagamenti)*
- Il bonifico che torna indietro dalla banca lo scopre solo l'amministratore, e senza sapere di chi era *(Pagamenti)*
- La cassa puo' restare aperta venti minuti dopo che la merce e' gia' tornata in vendita *(Pagamenti)*
- Quando il pagamento scade, il webhook rimette in vendita anche la merce che intanto e' stata venduta *(Pagamenti)*
- La vetrina in primo piano comprata di sera parte con la data del giorno prima *(Pagamenti)*
- «Scarica i miei dati» salta 25 tabelle dove ci sono dati della persona: portafoglio, punti, buoni regalo, domande sui prodotti, SOS del rider *(Privacy e legale)*
- Il negozio e il rider ricevono nome, telefono e indirizzo del cliente senza nessun impegno scritto a usarli solo per quell'ordine *(Privacy e legale)*
- L'informativa non dice ai venditori che dati fiscali e incassi vanno comunicati all'Agenzia delle Entrate (DAC7) *(Privacy e legale)*
- Chi cancella l'account resta cliente su Stripe, e nessuno sa più quale *(Privacy e legale)*
- Le notifiche push non sono scritte da nessuna parte nell'informativa *(Privacy e legale)*
- Chi fa una segnalazione lascia la sua email lì per sempre *(Privacy e legale)*
- La coda delle email non si svuota mai *(Privacy e legale)*
- Il cruscotto del venditore scarica ogni riga mai venduta per fare i conti di oggi, e sopra le mille righe i numeri sbagliano in silenzio *(Velocità)*
- Quasi tutte le pagine del sito nascono vuote e le riempie il browser con chiamate al database, non solo la home e la scheda prodotto *(Velocità)*
- L'invio di ogni notifica push aspetta senza limite di tempo, e un solo telefono che non risponde può fermare il giro delle notifiche *(Velocità)*
- Dodici regole di accesso richiamano auth.uid() per ogni riga invece che una volta sola *(Velocità)*
- Il negoziante e il fattorino leggono «Stato aggiornato» anche quando il database non ha cambiato nessuna riga *(Interfaccia)*
- Nella creazione prodotti da più foto, cancellare una riga sposta quello che si sta scrivendo sulla riga sbagliata *(Interfaccia)*
- Il caricamento foto del negoziante e altri campi dei suoi moduli non hanno nessun nome per chi usa un lettore di schermo *(Accessibilità)*
- In cassa due scritte piccole e il codice referral hanno un contrasto sotto la soglia di legge *(Accessibilità)*
- Tredici campi del negoziante, del rider e del piè di pagina hanno come unico nome il segnaposto, che sparisce appena si scrive *(Accessibilità)*
- Il pannello notifiche del negoziante si dichiara finestra di dialogo ma non si chiude con Esc e non gestisce il fuoco *(Accessibilità)*
- Tornare indietro dalla pagina di pagamento tiene bloccati merce e codice sconto per due ore *(Flussi critici)*
- Chi paga con la carta vede sparire il proprio credito MyCity senza una spiegazione *(Flussi critici)*
- Il giro notturno prende in carico la cancellazione di un negozio che ha ancora un ordine aperto e soldi da incassare *(Flussi critici)*
- L'unico avviso su un carrello pagato a meta' puo' sparire senza che nessuno lo sappia *(Flussi critici)*
- Se l'email dell'ordine pronto non entra in coda, non resta traccia da nessuna parte *(Flussi critici)*
- Le notifiche push partono due volte se due giri del cron si sovrappongono: la presa in carico non è atomica *(API)*
- Due clic sul pulsante che mette un prodotto in vetrina aprono due pagamenti *(API)*
- Un ordine che non si riesce a rimborsare rimbalza per sempre fra annullato e nuovo *(API)*
- Chi manda un file troppo grande legge «dati non validi» invece del vero motivo *(API)*
- L'estrazione prodotto da foto accetta foto da qualunque sito e le fa leggere al modello col nostro conto *(Endpoint AI)*
- Quando il fornitore AI è giù per due minuti diciamo al negoziante che il budget del giorno è finito e di riprovare domani *(Endpoint AI)*
- Il testo alternativo della foto entra nella bozza del prodotto senza nessun tetto di lunghezza *(Endpoint AI)*
- L'estrazione da una foto singola promette le GIF e poi le rifiuta con un messaggio che parla d'altro *(Endpoint AI)*
- Le due letture di pagine web che decidono un prezzo non dicono al modello che quelle pagine sono dati, non ordini *(Endpoint AI)*
- Un solo venditore può bruciare da solo il budget AI giornaliero di tutto il sito e lasciare gli altri negozi a «riprova domani» *(Endpoint AI)*
- Le visite al prodotto si contano con due regole diverse: PostHog conta ogni nuova scheda, il database una per persona all'ora *(Dati e analitica)*
- Togliere dal carrello un prodotto con più varianti manda a Google il prezzo della prima riga per tutte *(Dati e analitica)*
- La visita che arriva da una campagna risulta arrivata dal nulla *(Dati e analitica)*
- Un prodotto rimborsato resta contato tra i venduti *(Dati e analitica)*
- Il carrello risulta recuperato anche quando l'email non e' mai partita *(Dati e analitica)*
- Le statistiche di visita di Vercel non sono attive, e quindi nessuno sa quanta gente entra *(Dati e analitica)*
- Senza il mittente configurato le email partono da un dominio finto e falliscono una per una *(Rilascio e affidabilità)*
- Il pulsante manuale del rilascio pubblica qualunque ramo senza aspettare i controlli *(Rilascio e affidabilità)*
- Se il sito nuovo non risponde si torna indietro col codice ma il database resta avanti *(Rilascio e affidabilità)*
- Il cancello delle migrazioni promette di confrontare il contenuto ma confronta solo i nomi, e registra in un passo separato *(Rilascio e affidabilità)*
- La copia degli utenti salva solo la tabella base: accesso con Google e secondo fattore restano fuori *(Rilascio e affidabilità)*
- Tre librerie di produzione hanno vulnerabilità note, quattro giorni dopo averle azzerate *(Rilascio e affidabilità)*
- L'email del carrello abbandonato parte nuda, senza testata né piede MyCity, mentre lo stesso messaggio esiste già col guscio comune *(Coerenza del marchio)*
- Il pannello «Migliora tutto» del venditore usa un semaforo verde-smeraldo, ambra e rosa fuori palette *(Coerenza del marchio)*
- L'icona dell'app e la favicon scrivono «My» col carattere di sistema, quindi il marchio cambia faccia su ogni dispositivo *(Coerenza del marchio)*
- Lo schermo di avvio dell'app installata è bianco mentre la pagina è color panna *(Coerenza del marchio)*
- Lo stesso errore di campo è bordeaux, rosa o rosso a seconda della pagina, anche dentro il checkout *(Coerenza del marchio)*
- Gli avvisi a comparsa usano i verdi, rossi e blu di fabbrica della libreria, non i colori del brand *(Coerenza del marchio)*
- L'etichetta di spedizione in contrassegno stampa quattro segni spuri al posto dell'emoji del sacchetto di soldi *(Coerenza del marchio)*
- Voti, distanze e percentuali cambiano segno decimale da pagina a pagina: «4,5» in vetrina, «4.5» sulla scheda prodotto *(Tipografia)*
- Al negoziante che paga una campagna le date escono in formato macchina, «2026-09-02 → 2026-09-09» *(Tipografia)*
- Sulla pagina dell'ordine l'ora della posizione del rider esce coi secondi, «agg. 14:05:33» *(Tipografia)*
- Nella barra fissa «Aggiungi al carrello» il prezzo è a 11px in grigio, e in cassa l'etichetta «Totale» è a 10px *(Tipografia)*
- Con un solo elemento il sito scrive «1 negozi», «1 articoli», «1 ordini», «1 giorni fa»: il plurale è fisso *(Tipografia)*
- Le pagine negozi, ricerca, carrello e checkout arrivano dal server senza titolo principale *(Tipografia)*
- Il grigio delle note sul fondo panna resta a 4,49 di contrasto: un pelo sotto la soglia *(Tipografia)*
- La data in lettere porta lo zero davanti al giorno: «03 settembre 2026» invece di «3 settembre 2026» *(Tipografia)*
- Il voto medio esce con il punto («4.5 ★») mentre nella pagina del rider lo stesso numero è scritto con la virgola *(Tipografia)*
- I prezzi escono scritti all'inglese, «€12.50», in cassa e nelle email di ordine, rimborso e gift card *(Tipografia)*
- Nella pagina dell'ordine il nome del prodotto viene tagliato a una riga, e il negoziante non vede la fine del nome *(Tipografia)*
- Le notifiche push partono senza scadenza: un avviso «in consegna» può arrivare giorni dopo la consegna, e gli aggiornamenti dello stesso ordine si accumulano *(Mobile e app)*
- Su iPhone la pagina impostazioni dice che il browser non supporta le notifiche, invece di spiegare che vanno attivate dall'app in schermata Home *(Mobile e app)*
- Nessuno misura quante persone usano MyCity installata in Home: il numero che decide se e quando fare l'app nativa non esiste *(Mobile e app)*
- Nel banner d'installazione «Più tardi» e la X sono alti 24-28 px: si sbaglia mira col pollice *(Mobile e app)*
- Senza rete, se il telefono ha svuotato la memoria del sito, arriva la pagina d'errore del browser invece del «Sei offline» *(Mobile e app)*
- Sulla pagina «Sei offline» il pulsante «Riprova» non fa niente *(Mobile e app)*
- Il carrello conta i pezzi, il checkout conta le righe: lo stesso carrello dice «5 articoli» e un passo dopo «2 articoli» *(Flussi di conversione)*
- Sotto «Procedi al checkout» si promette il reso entro 14 giorni anche per pane, torte e gastronomia *(Flussi di conversione)*
- La spedizione scritta nel carrello non è quella che si paga alla cassa *(Flussi di conversione)*
- Il carrello mostra il prezzo del giorno in cui hai messo dentro il prodotto *(Flussi di conversione)*
- Il sito accetta una consegna a Milano e non chiede un centesimo di spedizione *(Flussi di conversione)*
- Chi sceglie il ritiro in negozio non dice mai a che ora passa *(Flussi di conversione)*
- Due tabelle dell'amministrazione (funnel e «oggi») non hanno il contenitore che scorre di lato: sul telefono allargano la pagina *(Layout e schermi)*
- Al negoziante che carica una foto troppo grande arriva un errore in inglese *(Microcopy)*
- La descrizione che Google mostra per la categoria Alimentari promette il ritiro in negozio, che è spento *(Microcopy)*
- L'email del secondo giorno dice «spedizione gratis sopra 30 euro» senza dire che vale per negozio *(Microcopy)*
- La pagina Vendi su MyCity promette la risposta in due tempi diversi *(Microcopy)*
- L'email che conferma l'ordine saluta con una virgola vuota quando manca il nome *(Microcopy)*
- Il messaggio d'errore del database esce in inglese davanti al negoziante *(Microcopy)*
- Chi spegne le promozioni continua a vederle nella campanella del sito *(Microcopy)*
- Al cliente che aspetta a casa il sito scrive «Pronto per il ritiro» *(Microcopy)*
- Nella campanella metà degli avvisi comincia con una faccina e metà no *(Microcopy)*
- Il cambio di lingua è un interruttore finto: il sito accetta la scelta, la salva e poi la ignora *(Microcopy)*
- Quando la ricerca non trova niente, «Forse cercavi» propone sei voci di abbigliamento invece delle nove categorie principali *(Navigazione)*
- Sulla pagina di una sottocategoria il briciolo di pane salta la categoria madre *(Navigazione)*
- La lista delle pagine-vetrina sorvegliate per il venditore non combacia con le pagine vere del sito *(Navigazione)*
- Il piè di pagina elenca cinque categorie su nove e non porta all'indice delle categorie *(Navigazione)*
- Il filtro «Categoria» della ricerca è una lista piatta di 72 voci con due «Bambini» identiche *(Navigazione)*
- La home fa due letture al database una dopo l'altra prima di mostrare qualcosa: la seconda parte solo quando la prima è tornata *(Velocità percepita)*
- La copertina del negozio e altre foto grandi passano dall'ottimizzatore di Vercel invece che dal CDN Supabase: doppio ridimensionamento e primo caricamento lento *(Velocità percepita)*
- La home e la scheda prodotto partono senza il preload dei caratteri: il testo cambia faccia a metà caricamento *(Velocità percepita)*
- Le prime foto della home — copertina del negozio in vetrina e tessere delle categorie — sono tutte «pigre»: il browser le mette in coda dietro al resto *(Velocità percepita)*
- Ogni pagina che si sta caricando mostra prima una griglia di prodotti finti, anche «Chi siamo» e la home: poi il contenuto vero la sostituisce di colpo *(Velocità percepita)*
- Il traduttore degli errori dei moduli (Zod) viaggia in ogni pagina, anche dove non c'è nessun modulo *(Velocità percepita)*
- Nel checkout il pulsante che toglie l'articolo finito è bianco su arancione: si legge male *(Accessibilità visiva)*
- Nel pannello del negoziante il pulsante senape dei consigli si legge a fatica *(Accessibilità visiva)*
- L'interruttore spento delle impostazioni è quasi invisibile sul bianco *(Accessibilità visiva)*
- Il campo email in fondo a ogni pagina non ha un nome: chi non vede sente solo «modifica testo» *(Accessibilità visiva)*
- Il piede delle email dell'ordine è grigio su grigio e in fotocopia sparisce *(Accessibilità visiva)*
- Il verde chiaro con scritte bianche non è solo nel badge del negozio: è anche nei passi del checkout *(Accessibilità visiva)*
- Sulla home lo stesso modulo compare due volte e i due campi nascosti anti-robot hanno lo stesso identificativo *(Accessibilità visiva)*
- Se cade la rete il negozio legge «Ordine non trovato» sull ordine che ha appena incassato *(Stati dell'interfaccia)*
- La consegna espressa sparisce dal modulo prodotto senza dire niente *(Stati dell'interfaccia)*
- Il credito del cliente si legge zero euro quando la lettura non riesce *(Stati dell'interfaccia)*
- Il negoziante non riesce a mettere il video alla vetrina, ma il sito glielo chiede *(Immagini e media)*
- Quando una foto viene rifiutata, il negoziante legge una frase in inglese che non dice cosa fare *(Immagini e media)*
- La foto principale del prodotto viene tagliata ai bordi proprio dove il cliente decide se comprare *(Immagini e media)*
- Il campo del logo offre al negoziante formati che il deposito rifiuta e non mette un tetto al peso *(Immagini e media)*
- Nel pannello del negoziante le foto della vetrina si scaricano intere per stare in un francobollo *(Immagini e media)*

### La riverifica dei problemi già noti

| Esito | Quanti |
|---|---:|
| Aperti nel registro prima | 361 |
| Riparati (chiusi oggi) | 175 |
| Ancora presenti (riverificati) | 184 |
| Ancora presenti (visti dai cercatori) | 0 |
| Non verificabili | 2 |
| Non riverificati (flotta interrotta) | 0 |
| Aperti nel registro dopo | 187 |

Lenti coperte dal giro: 24 su 24 (Accessibilità, Accessibilità visiva, Endpoint AI, API, Architettura, Coerenza del marchio, Dati e analitica, Rilascio e affidabilità, Flussi di conversione, Interfaccia, Immagini e media, Layout e schermi, Microcopy, Mobile e app, Navigazione, Pagamenti, Velocità, Velocità percepita, Privacy e legale, Flussi critici, Permessi sul database, Sicurezza e accessi, Stati dell'interfaccia, Tipografia).


### Produzione: cosa manca delle migrazioni 130-150 (verificato oggetto per oggetto)

| Migrazione | Oggetto | In produzione |
|---|---|---|
| 131 | tabella `ai_spend_daily`, funzioni `registra_spesa_ai`, `spesa_ai_di_oggi` | no |
| 135 | `foto_consegna_da_cancellare` (le altre due funzioni ci sono) | no |
| 140 | colonna `order_items.product_name`, funzioni e trigger `scatta_nome_prodotto`, `prodotto_venduto_non_si_cancella` | no |
| 141 | `andamento_del_negozio`, `venduti_per_prodotto` | no |
| 142 | vista `live_activity_public` | sì |
| 143 | `_wallet_apply`, `wallet_credit`, `wallet_debit` | sì (indice `wallet_ledger_chiave_idx` no) |
| 144 | policy `product_variants_select` | sì |
| 147 | indici `products_status_price_idx`, `products_category_price_idx` | no |
| 148 | colonna `abandoned_carts.recovered_at`, indice `abandoned_recuperati_idx` | no |
| 150 | `enqueue_order_status_email` + trigger (la `claim_pending_emails` c'è) | no |

Storia in `supabase_migrations.schema_migrations` di produzione: 89 voci, ultima `20260828230000_129p_ponte_produzione_catalogo_visibile`. Confronto policy per tabella: `products` 8 nel repo, 10 in produzione; tabelle solo in produzione: `kpi_snapshots`, `merchants_leads`, `outreach_events`, `telegram_chats`, `uptime_checks` (della macchina dell'AD); solo nel repo: `ai_spend_daily`, `catalog_ai_jobs`, `segnalazioni`.

### Produzione: numeri di base (sola lettura, 3/9 01:2x)

| Cosa | Quanti |
|---|---:|
| Prodotti (tutti disponibili) | 5 |
| Venditori approvati | 1 |
| Rider | 1 |
| Profili | 8 |
| Ordini totali | 1 (24/6, mai pagato) |
| Ordini negli ultimi 30 giorni | 0 |

### Errori runtime su Vercel (7 giorni)

- `/api/track`: «Service role Supabase non configurato (SUPABASE_SERVICE_ROLE_KEY)» — 10 volte, 3 utenti, 18/8 → 2/9.
- `/api/auth/signin`: «TURNSTILE_SECRET_KEY mancante in produzione: CAPTCHA disabilitato» — 2/9 19:00.
- `GET /api/health` → 503 `{"status":"unhealthy","cron":{"ok":false,"esaminati":0,"attesi":10,"error":"battiti non leggibili"}}`.
- HTML servito: `<link rel="canonical" href="http://localhost:3000">` e `og:url` uguale.
- Web Analytics non abilitato. Dominio del progetto: solo `mycity-phi.vercel.app` e alias; Deployment Protection: Vercel Authentication su tutto tranne i domini personalizzati (che non ci sono).

### Log Postgres di produzione (24 ore)

| Errore | Volte |
|---|---:|
| `column abandoned_carts.created_at does not exist` | 1.792 |
| `column orders.expected_delivery does not exist` | 109 |
| `column abandoned_carts.id does not exist` | 109 |

Origine: `pannello/src/lib/marketplace-db.ts:136`, `pannello/src/app/api/metriche/funnel/route.ts:23`, `cervello/ordini-in-ritardo.mjs`, `cervello/sentinella-dati.mjs` (repo dell'AD) → scheda AR-893 nel cantiere.

### Dipendenze

`npm audit --omit=dev`: 3 vulnerabilità (browserslist HIGH GHSA-c83g-rgw3-j3cx, qs moderate, postcss-selector-parser low), tutte con fix. Con le dipendenze di sviluppo: 13 (6 high). Il 1/9 erano state portate a zero.

### File toccati da questa consegna

- `consegne/audit/2026-09-03-radiografia-totale-sito.md` (questo referto) · `consegne/audit/2026-09-03-critica-di-completezza.md` (chi ha criticato me) · `consegne/audit/2026-09-03-scontri-arbitrati.md` (chi ha deciso gli otto scontri) · `consegne/audit/2026-09-03-radiografia-marketplace-raw.json` · `consegne/design/2026-09-03-radiografia-design-raw.json`
- `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json` (digest) · `cantiere-difetti.json` (AR-893, nota su AR-640)
- `cervello/referti-sito.mjs` + `cervello/test/la-prova-attraversa-la-porta-della-casa.test.mjs` + `cervello/mutanti.json` (scheda AR-894: la prova entra in memoria disarmata)
- `MyCity-Vault/90-Memoria-AI/STATO.md`, `DECISIONI.md`
