---
tipo: archivio-azioni
aggiornato: 2026-08-29 01:22
fonte: cervello/housekeeping-azioni.mjs
---

# 🗄️ Archivio — le card già chiuse

> Le card approvate o annullate finiscono qui, per tenere la coda viva sotto il tetto di lettura
> del cancello (200.000 caratteri). La coda viva è in [[AZIONI-IN-ATTESA]].
> Ultima pulizia: 2026-08-29 01:22 · 27 card totali.
> Le card non si buttano: si spostano. Chi cerca una card chiusa la cerca QUI.

# 🗄️ Archivio — le card già chiuse

> Le card approvate o annullate finiscono qui, per tenere la coda viva sotto il tetto di lettura
> del cancello (200.000 caratteri). La coda viva è in [[AZIONI-IN-ATTESA]].
> Ultima pulizia: 2026-08-26 17:51 · 25 card totali.
> Le card non si buttano: si spostano. Chi cerca una card chiusa la cerca QUI.

# 🗄️ Archivio — le card già chiuse

> Le card approvate o annullate finiscono qui, per tenere la coda viva sotto il tetto di lettura
> del cancello (200.000 caratteri). La coda viva è in [[AZIONI-IN-ATTESA]].
> Ultima pulizia: 2026-08-24 20:49 · 24 card totali.
> Le card non si buttano: si spostano. Chi cerca una card chiusa la cerca QUI.

# 🗄️ Archivio — le card già chiuse

> Le card approvate o annullate finiscono qui, per tenere la coda viva sotto il tetto di lettura
> del cancello (200.000 caratteri). La coda viva è in [[AZIONI-IN-ATTESA]].
> Ultima pulizia: 2026-08-24 17:02 · 23 card totali.
> Le card non si buttano: si spostano. Chi cerca una card chiusa la cerca QUI.

### ✅ #152 — Applica al database vero le riparazioni dei due buchi piu' grossi · ⏳ accodata 2026-08-21 20:11 · fatta 2026-08-21 21:20

**Stato:** ✅ FATTO 2026-08-21 21:20 — col tuo «fai la 151 e la 152» in chat. Applicata al database
di produzione in tre blocchi, controllando dopo ognuno, come avevo promesso qui sotto.

Prima di toccare niente ho misurato, e i due buchi erano vivi davvero. Sei funzioni potenti erano
chiamabili senza account, `accumula_rimborso` compresa. E tutte e tre le funzioni del codice di
consegna usavano il confronto che con un valore vuoto non sa dire di no.

Adesso: sei funzioni su sei chiuse a chi non ha l'accesso, il server continua a poterle usare, e la
pagina dei numeri di vendita resta aperta a chi ha fatto l'accesso — com'era previsto. Tutte e tre le
funzioni del codice fermano il valore vuoto per nome e usano il confronto che risponde sempre. E c'è
la funzione nuova che disfa un rimborso se la banca lo rifiuta, usabile solo dal server.

**Il conto finale: dieci controlli su dieci verdi**, misurati sul database vero dopo l'ultimo blocco.

**In parole semplici:** ho riparato i quindici difetti che fermano qualcuno, e due di quelli
vivono dentro il database, non nel codice del sito. Le riparazioni sono scritte in un file di
modifiche, la 125, ma un file non fa niente finché non lo si applica. Finché non lo applichi,
quei due buchi sul sito vero restano aperti.

Il primo. Certe funzioni potenti del database erano chiamabili **senza avere un account**. Una di
quelle decide quanto risulta già rimborsato di un ordine, cioè il numero che il sito sottrae dai
guadagni del negozio.

Il secondo, e l'ho provato dal vivo su una copia del database. Il codice di consegna a sei cifre
si aggirava mandando un valore vuoto: la funzione rispondeva «va bene» e l'ordine risultava
consegnato. La consegna sblocca due cose che sono soldi, il bonifico al negozio e la paga del
fattorino.

**Cosa cambia:** se applichi, quei due buchi si chiudono e nient'altro cambia per chi usa il sito.
Se non applichi, restano aperti: il codice nuovo che ho scritto li chiude solo nella parte che sta
nel sito, non nella parte che sta nel database.

**Se va bene:** scrivi «ok 152» e applico il file `migrations/125_radiografia_21_agosto_bloccanti.sql`
al database di produzione, un blocco per volta, controllando dopo ognuno. Poi ti dico quanti pezzi
trovo applicati sui pezzi attesi. L'ho già fatto girare su un database ricostruito da zero: 126
modifiche su 126 applicate, e tredici controlli verdi che senza la 125 erano nove rossi.

---

### ✅ #151 — Dimmi se accendo la consegna veloce sul negozio, ora che la promessa è una sola · ⏳ accodata 2026-08-21 20:11 · fatta 2026-08-21 21:22

**Stato:** ✅ FATTO 2026-08-21 21:22 — hai scelto di accenderlo, non di togliere l'interruttore.
`offers_express` su Pane Quotidiano è passato da spento ad acceso: una riga sola, e ho controllato
che i negozi con la consegna veloce accesa siano uno su uno. La vetrina pubblica lo vede.

**Come si torna indietro:** il valore di prima era **spento**. Basta rimetterlo, ed è la stessa
riga al contrario.

Adesso quello che il sito promette e quello che il database registra dicono la stessa cosa.

**In parole semplici:** hai deciso che la promessa di consegna è una sola, 30-60 minuti, e ho
allineato tutto il sito. C'è però un interruttore nel database, per ogni negozio, che dice se quel
negozio la consegna veloce la fa davvero. Su Pane Quotidiano — l'unico negozio esistente — è
**spento**.

Adesso quell'interruttore non cambia più nessuna scritta: il sito promette 30-60 minuti a tutti,
perché così hai deciso. Resta però l'unico posto in cui è registrato se il negozio quella velocità
la fa o no.

**Cosa cambia:** accenderlo non modifica niente di quello che il cliente legge. Serve a far
combaciare quello che promettiamo con quello che risulta scritto: oggi il sito dice un'ora e il
database dice che quel negozio la consegna veloce non la offre.

**Se va bene:** scrivi «ok 151» e accendo `offers_express` su Pane Quotidiano. È una riga sola sul
database vero, reversibile: si spegne allo stesso modo.

Se preferisci il contrario — cioè che l'interruttore sparisca del tutto, perché con una promessa
sola non serve più — dimmelo e ti preparo quel lavoro invece: è più grande, tocca anche la pagina
del negoziante dove quell'interruttore si vede ancora.

---

### ✅ #148 — Dimmi se apro il cantiere sui quindici difetti che fermano qualcuno · ⏳ accodata 2026-08-21 16:20 · fatta 2026-08-21 20:25

**Stato:** ✅ FATTO 2026-08-21 20:25 — col tuo «ok 148» in chat. Tredici dei quindici sono riparati,
ognuno con una prova che ho visto diventare rossa prima e verde dopo. Il quattordicesimo sono i due
buchi del database: il codice della riparazione è scritto, ma sul sito vero si chiudono solo quando
applichi il file di modifiche — è la card **#152** qui sopra. Il quindicesimo, quello del rilascio
automatico prima dei controlli, era già in coda da prima: è la card **#141**, e lì l'ordine dei passi
conta (prima i segreti, poi si spegne l'automatismo), quindi non l'ho toccato.

Il lavoro sta nel ramo `claude/marketplace-radiografia-design-9kj69c` del sito, richiesta di unione
**#236**. Niente è andato in produzione.

**In parole semplici:** oggi ho rifatto la visita completa al sito, codice e grafica insieme.
Ho trovato 351 problemi veri. Veri vuol dire che un secondo collega è andato a ricontrollarli
uno per uno nel codice, e quelli che non ha confermato sono stati buttati via.

Di quei 351, **quindici fermano qualcuno o costano soldi**. Gli altri 336 fanno danno ma si
aggirano. Questa card chiede il via solo sui quindici.

I quattro che pesano di più. **Uno:** chiunque, anche senza un account sul sito, può marcare un
ordine come «già rimborsato», e quel numero è quello che il sito sottrae dai guadagni del negozio.
**Due:** il codice di consegna a sei cifre si aggira mandando un valore vuoto, e la consegna
sblocca il bonifico al negozio. **Tre:** un rimborso con carta non riaddebita mai la quota del
negozio, quindi la differenza la mette MyCity. **Quattro:** il pulsante SOS del fattorino è
coperto in pieno da quello dell'assistenza, e sul telefono non si può premere.

Un esempio di cosa vuol dire il primo. Maria ordina 30 euro da Pane Quotidiano. Qualcuno scrive
nel database che quell'ordine è già stato rimborsato per 30 euro. Il negozio apre la sua pagina
guadagni e vede zero. Nessuno ha toccato i soldi, ma il conto che il negozio legge è falso.

**Cosa cambia:** se dici di sì, i quindici li riparo in un ramo separato del sito, con le prove
che diventano rosse se il difetto torna. Non tocco la produzione: alla fine ti arriva una
richiesta di unione da guardare. Se dici di no, restano lì: nessuno di questi si chiude da solo,
e tre di essi riguardano soldi che escono o non rientrano.

**Se va bene:** scrivi «ok 148» e parto dai primi quattro, che sono la mezza giornata che vale
di più. Ti riporto il conto dopo ogni blocco, non alla fine.

Referti. Il codice, 199 problemi: `consegne/audit/2026-08-21-radiografia.md`.
La grafica e i percorsi, 152 problemi: `consegne/design/2026-08-21-radiografia-design.md`.

---

### ✅ #147 — Dimmi quanto ci mettiamo davvero a consegnare, perché il sito dice due cose diverse · ⏳ accodata 2026-08-21 16:20 · fatta 2026-08-21 18:40

**Stato:** ✅ FATTO 2026-08-21 18:40 — hai risposto «30-60 min», e hai scelto **una promessa sola**.
Ho riscritto 36 frasi in 28 file del sito, tolto il riquadro che al momento di pagare mostrava due
tempi diversi, e riscritto le pagine spedizioni e domande frequenti dicendo la verità: l'ora parte
da quando il negozio conferma, dentro l'orario di apertura, e a negozio chiuso parte il giorno dopo.
Un controllo automatico adesso diventa rosso se «24-48» ricompare da qualche parte.

**In parole semplici:** il riquadro grosso in cima alla home promette la consegna in **30-60
minuti**. Ogni altra pagina del sito promette **24-48 ore**. Sono la stessa promessa fatta due
volte, con due numeri che non stanno insieme.

La frase della home non è scritta nel codice: sta in un campo delle impostazioni del sito. Vuol
dire che si cambia subito, senza pubblicare nulla e senza aspettare un rilascio.

Non la cambio da sola perché non so quale delle due sia vera. È una promessa al cliente, e a
sceglierla sei tu.

**Cosa cambia:** oggi chi arriva sulla home legge un'ora e chi ordina scopre due giorni. È la
prima cosa che una persona legge e l'ultima che verifica: la scopre quando ha già pagato. Finché
restano due numeri diversi, uno dei due è una bugia, qualunque sia quello giusto.

**Se va bene:** scrivi «ok 147» insieme al numero che vale. Per esempio: «ok 147, 24-48 ore».
Allineo la home a quella promessa. È una modifica di configurazione, reversibile, e la vedi subito.

---

### ✅ #139 — Le prove sui permessi girano, e non costano niente · ⏳ accodata 2026-08-21 03:20 · fatta 2026-08-21 15:45

**Stato:** ✅ FATTO 2026-08-21 15:45 — senza comprare niente.

**Cosa cambia:** questa carta diceva «crea un progetto Supabase di prova». Ho chiesto il prezzo
prima di crearlo: 10 dollari al mese, per sempre, più tre chiavi da custodire su GitHub — fra cui
quella che apre tutto. Il prezzo la carta non lo diceva.

Strada scelta: i controlli si avviano un Supabase loro, dentro la macchina che li esegue. Ci
applicano le 125 migrazioni. Ci mettono dentro un negozio e un ordine veri. Poi provano contro
quello. Vive quanto il giro e poi sparisce: zero euro, nessuna chiave da custodire, e nasce vuoto
ogni volta.

**Cosa fa adesso:** venti prove che non giravano da sempre adesso girano a ogni controllo. Sono
quelle che verificano che un estraneo non legga i dati dei clienti e non possa chiamare le funzioni
riservate. Prima si saltavano in silenzio, e il verde diceva «provato» quando non era vero.

**Cosa ho trovato accendendole:** due difetti che c'erano già e che nessuno vedeva, perché una prova
che si salta non può diventare rossa. Le prove giravano su una versione di Node che non ha un pezzo
che il client Supabase pretende, quindi sarebbero fallite anche col progetto a pagamento. E i
controlli provavano su Node 20 mentre il sito in produzione gira su Node 24: quattro numeri di
distanza fra quello che si prova e quello che serve i clienti.

**Cosa non ho verificato:** i controlli adesso girano su Node 22, la produzione su 24. Meglio di
prima, non uguale. Chiudere anche quel pezzo va provato, e qui non avevo un Node 24 con cui farlo.

---

### ✅ #138 — Il server lavora ma non pubblica più niente da tre giorni. FATTO 2026-08-21 16:30, col tuo ok in chat · ⏳ accodata 2026-08-20 18:10

**Com'è andata a finire.** Le due storie si erano separate: il server aveva 101 scritture sue che
GitHub non aveva mai ricevuto, e gli mancavano 28 aggiornamenti che GitHub aveva. Nessuno dei due
poteva copiarsi sopra l'altro, e fra i 28 che gli mancavano c'era proprio la riparazione scritta per
questo caso. Un cane che si mordeva la coda.

Nicola ha messo le 101 scritture al sicuro su un ramo, ha riallineato il server, e alle 14:26 il
server ha pubblicato per la prima volta dal 18 agosto. Da lì pubblica ogni pochi minuti.

I tre giorni di memoria sono tornati dentro con la richiesta 800. Il disco è sceso dal 100% all'86%.

**Cosa resta, e non è più questa carta:** sei file grossi del ramo di salvataggio vanno letti e non
fusi a occhi chiusi — Stato, coda azioni, Bacheca, Checklist, Ritmo e i piani.

---

### ✅ #108 — Sblocca il server: è fermo da mezzogiorno e da solo non ne esce. FATTO 2026-08-21 16:30 · ⏳ accodata 2026-08-16 19:05

**Chiusa insieme alla 138, ed è la stessa cosa.** Questa carta, scritta il 16 agosto, descriveva già l'incastro nei termini esatti: il server non riesce a pubblicare, quindi si rifiuta di allinearsi al codice nuovo, quindi non può ricevere la correzione. È rimasta qui cinque giorni. Il 18 agosto la macchina si è fermata per quel motivo, e ci è rimasta tre giorni.

**La lezione, e non è tecnica.** La diagnosi giusta era già scritta e in coda. Non è mancata l'analisi: è mancato che qualcuno la leggesse mentre serviva. Una carta rossa che invecchia in una coda da 67 voci non è una segnalazione, è un archivio.

<details><summary>Il testo originale del 16 agosto</summary>


**Cosa cambia:** da oggi alle 12:10 la macchina non pubblica più niente. Non è morta: il worker batte ancora, l'ho visto alle 18:47. Sono due cose incastrate. La prima: alle 13:36 una cadenza ha preso il lucchetto del giro e non l'ha più mollato, e da lì nessuna cadenza parte. La seconda: il server ha dei commit di memoria che non è riuscito a pubblicare, e giustamente si rifiuta di allinearsi al codice nuovo, perché allinearsi li cancellerebbe. Il risultato è che il server è fermo **e** non può ricevere nessuna correzione, nemmeno quella che ho appena scritto.

**Se va bene:** i giri ripartono da soli, la memoria torna a pubblicarsi e il Pannello smette di mostrarti i numeri di stamattina. E il server riceve la cura che ho scritto oggi: da quel momento un lucchetto rimasto appeso oltre due ore la macchina se lo toglie da sola, senza di te.

**Cosa devi fare.** Sul server, in quest'ordine.

Prima guarda cosa è rimasto fermo, senza toccare niente:
```
cd /opt/mycity/ad-mycity
sudo -u mycity git log --oneline origin/main..HEAD
```

Poi porta a casa quel lavoro unendolo a quello che c'è già su GitHub:
```
sudo -u mycity git fetch origin main
sudo -u mycity git merge origin/main
sudo -u mycity git push origin HEAD:main
```

Se il merge si lamenta di conflitti, non insistere: metti il lavoro al sicuro su un ramo suo e basta, lo recupero io dopo.
```
sudo -u mycity git merge --abort
sudo -u mycity git push origin HEAD:refs/heads/vps/salvataggio-16-8
```

Infine togli il lucchetto rimasto appeso, una volta sola:
```
rm -f /opt/mycity/ad-mycity/.git/MYCITY_RUN_LOCK-giro
```

**Cosa non ho verificato:** non ho provato nessuno di questi comandi, perché scrivo da una sessione in cloud e nel server non posso entrare. Li ho scritti leggendo gli script che li useranno. Non so nemmeno **quale** processo tenga il lucchetto da stamattina: da qui vedo che è preso e da quanto, non chi lo tiene. E non so se i commit fermi sul server siano solo memoria o anche altro: lo dice la prima riga qui sopra, guardala prima di unire.

🔧 Dettagli tecnici — segnali letti dal vivo sulla tabella `impostazioni`, 16/8 fra le 18:24 e le 18:47:

- `automazione:cadenza-giro` dice che il lucchetto è orfano da 300 minuti. Nessuna cadenza parte.
- `automazione:watch-main` dice che l'allineamento è fermo da 72 giri, circa 360 minuti. Il commit `d9fe8a7` non è mai stato applicato.
- `automazione:giro` dice «non-pubblicato», uscita 2.
- `worker:ultimo` segna le 18:47. Il worker è vivo.

La cura permanente del lucchetto sta in `cervello/lib-cadenza.sh`, funzione `cadenza_lock_rompi`. La prova è `node cervello/test/lucchetto-che-non-si-libera.test.mjs`. Reparto: devops-sre (sintesi AD).

**Aggiornamento 18/8 06:10 — quell'episodio del 16/8 è chiuso.** La memoria tornò a pubblicarsi la sera stessa. Ma la STESSA cosa è successa di nuovo stanotte. Stavolta scrivo da dentro il server, non da una sessione cloud.

Il lucchetto `.git/MYCITY_RUN_LOCK-giro` è preso dalle 22:20 di ieri sera. Lo tiene un processo (PID 352205) che non esiste più. Verificato ora con `kill -0`: non risponde. Sono passate più di 7 ore.

La cura automatica scritta dopo l'episodio del 16/8 (`cadenza_lock_rompi`) esiste nel codice. Sposterebbe da sola il lucchetto vecchio, appena qualcuno riprovasse a prenderlo. Ma **nessuna cadenza ha riprovato**: l'ultima riga di `automazione:giro` nella tabella `impostazioni` è ferma alle 22:33 di ieri sera, la stessa ora del blocco.

Il resto della macchina sta bene. Sensori, sincronizzazione con GitHub, coerenza dei fatti ed esperimenti sono tutti scritti stamattina alle 06:01-06:02. È **solo** il giro completo che non riparte da 8 ore. Per questo la memoria di oggi — questo stesso Piano del mattino compreso — non si sta pubblicando da sola.

**Ho provato a togliere io il lucchetto vecchio.** È la stessa identica riparazione che il codice farebbe da solo. Il sistema di permessi lo ha bloccato: chiede la tua approvazione perché è un file dentro `.git` classificato "sensibile", anche se tecnicamente sono già dentro il server. Non ho insistito.

**Se va bene:** dammi il via a togliere quel file. Oppure fallo tu con `rm .git/MYCITY_RUN_LOCK-giro` dal terminale del server. La cadenza riparte da sola nello stesso minuto.

**La domanda vera per un tecnico:** perché nessuna cadenza ha ritentato il lucchetto per 8 ore? La cura automatica presuppone che qualcuno ritenti. Vale la pena guardare se lo scheduler che lancia `giro.sh` è ancora vivo sul server. Alle 04:34 di stamattina, `worker:reload-rifiutato` segnalava che `worker.sh` su disco era diverso dalla versione approvata: il worker si è rifiutato di ricaricarlo. Potrebbe essere collegato. Non l'ho verificato.

- **Colore:** 🟡 — è la stessa riparazione a basso rischio già scritta nel codice per fare da sola; chiedo perché il file è protetto e non tocco un permesso che non è mio.
- **Reparto:** devops-sre
- **Origine:** `{origine:sessione-vps-2026-08-18-mattino, lucchetto:22:20-17-8, pid-morto:352205, ultima-riga-giro:22:33-17-8}`

---

### ✅ #140 — La migrazione è applicata al database vero · ⏳ accodata 2026-08-21 03:20 · fatta 2026-08-21 14:55

**Stato:** ✅ FATTO 2026-08-21 14:55 — me l'hai chiesto tu in chat («fallo tu»), l'ho applicata io.

**Com'è andata.** Al primo colpo si è fermata, con questo errore: «orders: modifica di un campo
protetto non consentita». Era dentro una transazione, quindi non si è scritto niente e il database
è rimasto com'era. Il difetto era mio: la migrazione riempiva un campo nuovo sugli ordini già
presenti, e quel campo è protetto dalla scrittura, che è esattamente ciò che lo difende dal
browser. Riparata con la chiave che il progetto usa per il lavoro di servizio, e riapplicata.

**Cosa è acceso adesso.** Nove controlli su nove verdi sul database vero: il lordo di vendita
scritto sull'ordine, il ritiro in negozio che arriva a «consegnato», i ritiri tolti dalla bacheca
dei fattorini, gli esiti dei pagamenti registrati, la vetrina dei negozi, il riquadro della home,
i contatori dei bonifici. L'ordine che c'era è intatto e gli otto profili sono tutti lì.

**Una cosa che ti avevo detto male.** In questa carta avevo scritto che la vetrina dei negozi
«risponde con zero negozi». Sul database vero non era così: le due colonne c'erano già, e la
vetrina rispondeva col suo negozio anche prima. Quel guasto lo vedevo ricostruendo il database da
zero, dove la catena delle migrazioni le perdeva per strada. Vero come difetto del progetto, falso
come descrizione del sito online.

**Cosa non ho verificato:** non ho aperto il sito online con gli occhi, da qui non ci arrivo. Ho
controllato il database, non le pagine.

---

### ✅ #37 — CHIUSA 2026-08-21 14:30 (verificata risolta sul DB vero) — Chiudi le quattro porte che lasciano entrare chiunque nei dati dei negozi e dei clienti · accodata 2026-07-29 13:30

**Esito:** ho controllato le quattro falle una per una sul database di produzione reale, dopo il grosso lotto di riparazioni del 20-21/8, e sono **tutte e quattro chiuse**. ① La vista `public_profiles` scrivibile non esiste più (rimane solo `seller_public_profiles`, di sola lettura e filtrata su negozi approvati); su `profiles`/`orders` non c'è nessun permesso di scrittura per un visitatore senza account. ② La regola che faceva vedere ai rider gli ordini disponibili con tutti i dati del cliente ora limita la lettura al solo rider assegnato (`rider_id = chi ha fatto login`) — gli ordini disponibili passano da una vista separata senza dati sensibili. ③ Chi si registra oggi nasce **non approvato** (`is_approved=false`, `approval_status='pending'`): l'ho letto nel codice della funzione che crea il profilo alla registrazione. ④ Nessun permesso di scrittura sui dati di consegna per chi non ha fatto login. Nessuna azione resta da firmare: il fix è già nel database vero, non in un branch in attesa.

**Cosa cambiava (per storico):** quattro falle di sicurezza aperte sul sito vero, tutte confermate. ① Tre elenchi pubblici dei negozi erano scrivibili da un visitatore senza account. ② Nome, telefono e indirizzo di casa dei clienti con una consegna in corso si leggevano senza login. ③ Chi si registrava diventava venditore o rider già approvato. ④ Si potevano modificare senza login i dati di consegna degli ordini pronti.

**Nota tecnica:** ① viste `public_profiles`/`seller_public_profiles`/`seller_storefronts` senza `security_invoker` e con GRANT UPDATE/DELETE ad `anon` (migrations 108/110/112; `seller_storefronts` è drift: non esiste in nessun file del repo). ② policy «Riders can view available and own orders», `migrations/019_rider_visibility.sql:14-21`. ③ `public.handle_new_user`, `migrations/015_competitive_moats.sql:137-156`. ④ policy «Riders can update assigned or claim free orders», `migrations/011_orders_delivery.sql:128-134`. Nota collegata: l'hardening RLS delle migration 020 e 109 non ha mai avuto effetto — è scritto per nomi di policy che sul DB non esistono.
- **Colore:** 🔴 (migration sul database di produzione, dati personali)
- **Reparto:** security + backend-dev + dpo
- **Origine:** `{origine:radiografia-marketplace-2026-07-29, dimensioni:sicurezza-auth+rls-database+privacy-legale+architettura}`

<!-- radiografia-2026-07-29-ordini-bloccati -->

---

### ✅ #36 — CHIUSA 2026-08-21 14:30 (verificata risolta sul DB vero) — Ripara il pulsante che venditore e rider usano per far avanzare un ordine · accodata 2026-07-29 13:30

**Esito:** ho riletto sul database di produzione la funzione che protegge gli ordini (`enforce_order_update_rules`): non cita più `invoice_number`. È stata riscritta con una lista bianca di campi che negozio/rider possono cambiare (stato consegna, rider assegnato, orari, posizione) — il vecchio controllo che cercava una colonna cancellata a giugno non c'è più. Il pulsante che fa avanzare un ordine funziona: nessuna azione resta da firmare, il fix è già nel database vero (probabilmente dentro il lotto di migrazioni 107-124 del 20-21/8), non in un branch locale come al 17/8.

**Cosa cambiava (per storico):** sul sito vero, quando un negoziante accettava un ordine o un rider lo prendeva in carico, il database rifiutava la modifica per colpa di un controllo che cercava ancora il campo "numero fattura", cancellato a giugno.

**Nota tecnica:** `migrations/061_p0_security_rls_state_machine_reviews.sql:129` (funzione `enforce_order_update_rules`, tuttora viva sul DB) cita `NEW.invoice_number`, colonna droppata da `migrations/105_remove_invoicing.sql:27`. Nessuna migration successiva ridefinisce la funzione (063/064/094/096 la citano solo nei commenti). Verifica diretta sul progetto `clmpyfvpvfjgeviworth`: `colonna_esiste=false`, `trigger_la_cita=true`. Punti d'impatto: `app/seller/orders/[id]/page.tsx:205`, `app/rider/orders/[id]/page.tsx:108`. Uscita anticipata per admin/service_role alle righe 96-98 → route server salve. Migration pronta: `marketplace/migrations/107_fix_enforce_order_update_invoice_number.sql`. Test pronto: `marketplace/tests/unit/migrations-integrity.test.ts`.
- **Colore:** 🔴 (migration sul database di produzione)
- **Reparto:** backend-dev + security
- **Origine:** `{origine:radiografia-marketplace-2026-07-29, dimensioni:rls-database}`

<!-- radiografia-prova-non-vera-alla-nascita -->

---

### ✅ #135 — Applica la 123: il fattorino vede l'ordine e non riesce a prenderlo. FATTO 2026-08-20 14:40, col tuo ok in chat · ⏳ accodata 2026-08-20 13:30

**Cosa cambia:** e' un errore mio, nato dalla 122 di stamattina. La 122 ha chiuso la falla dei
recapiti stringendo la lettura degli ordini a «solo quelli che sono miei». Ma il database, per
aggiornare una riga, prima deve leggerla. Su un ordine ancora libero il fattorino non c'e', quindi
la riga risulta non sua, quindi invisibile. Risultato: preme «Accetta» e si sente rispondere
«ordine gia' preso da un altro». Non e' vero, e nessuno puo' prenderlo.

Oggi non fa danno: in produzione ci sono zero fattorini approvati e un solo ordine, annullato a
giugno. Diventa un problema col primo fattorino vero.

Il rimedio non riapre la lettura, perche' quella era la falla. La presa passa da una funzione
fidata che gira coi permessi del database. La richiesta di unione e' `mycity#228`.

**Se va bene:** dimmi «applica la 123» e la eseguo io, con la verifica dopo. Il file e'
`migrations/123_presa_ordine_dal_fattorino.sql`. Va fatto dopo aver unito la richiesta.

---

### ✅ #133 — Applica al database la migrazione 122. FATTO 2026-08-20 13:10, col tuo ok in chat · ⏳ accodata 2026-08-20 11:30

**Cosa cambia:** sette riparazioni che vivono nel database e non nel codice. Due pesano piu'
delle altre. La prima riguarda i fattorini. Oggi uno di loro puo' scaricare nome, telefono e
indirizzo dei clienti di tutta la citta'. Anche degli ordini che non sono suoi. Dopo la
migrazione vede solo i propri. La seconda riguarda le campagne sponsorizzate. Oggi chiunque puo'
gonfiarne i contatori con un ciclo di richieste dal browser. Dopo c'e' un tetto: sessanta
visualizzazioni e dieci clic al minuto.

**Una cosa che non ti avevo detto.** Hai unito la richiesta del sito alle 12:27, e il sito si
pubblica da solo a ogni unione. Quindi adesso il codice nuovo e' online e la migrazione no. Il
codice chiede al database una vetrina degli ordini liberi che ancora non esiste. Effetto: la
bacheca del fattorino resta vuota, e lui vede solo gli ordini che ha gia' preso. Non si rompe
niente d'altro: le altre riparazioni hanno un ripiego e si comportano come prima. Oggi non fa
danno, perche' non c'e' nessun ordine da prendere. Diventa un problema il giorno del primo
ordine vero.

**Se va bene:** dimmi «applica la migrazione 122» e la eseguo io a blocchi. Ogni blocco in una
transazione sua, leggendo dal database vero il risultato di ogni pezzo. Il file e'
`migrations/122_radiografia_20_agosto.sql` nel repo del marketplace. La richiesta e' gia' unita:
questo e' l'ultimo passo.

---

### ✅ #132 — Cento riparazioni sul sito: la richiesta di unione e' pronta. FATTO 2026-08-20 12:27, l'hai unita tu · ⏳ accodata 2026-08-20 11:30

**Cosa cambia:** i difetti aperti del sito scendono da centoquarantuno a trentadue. Fra le cose
riparate: il doppio clic che faceva due ordini in contanti, il «Non hai ancora ordini» dopo aver
pagato con la carta, il registro dei consensi cookie che era vuoto da sempre, il controllo
«negozio chiuso» che non scattava mai, e il catalogo che si fermava a novantasei prodotti senza
dirlo.

**Se va bene:** apri la richiesta di unione sul repo del marketplace, guarda il referto in
`consegne/audit/2026-08-20-marketplace-100-riparazioni.md` e unisci. Le prove sono verdi:
ottocentosessanta controlli automatici, piu' lo schema del database ricostruito da zero. Dopo il
merge serve la firma separata sulla migrazione (card #133).

---

### ✅ #127 — Applicate al database del sito le riparazioni del 19 agosto. FATTO 2026-08-19 20:25, col tuo ok in chat · ⏳ accodata 2026-08-19 13:25

**Cosa cambia:** oggi il cliente puo' alzarsi da solo il credito MyCity dal browser e poi
spenderlo in un ordine in contanti. Il premio invito lo decide la pagina di registrazione,
non il server. Il negoziante vede zero visite sui suoi prodotti anche quando le visite ci
sono. Il pannello dei codici sconto e' una pagina vuota da quando e' passata la bonifica del
14. Questo file ripara tutte e trentotto queste cose insieme, e non tocca nessun dato dei
clienti.

**Se va bene:** il credito si scrive solo dal server, le statistiche del negoziante tornano a
contare, e il pannello dei codici sconto torna a funzionare. Poi resta da unire la richiesta
sul ramo `claude/marketplace-100-difetti-ehne44`, che e' un'altra firma: unire il codice non
e' applicare il database.

**Contenuto:** il file `migrations/119_radiografia_18_agosto.sql` nel repo del marketplace,
copia applicabile in `consegne/tech/2026-08-19-marketplace-104-difetti.patch`. E' scritto per
essere rilanciabile: se qualcosa va storto a meta', si rilancia e riprende.

**Cosa non ho verificato (al momento in cui l'ho accodata):** non l'ho eseguito su nessun
database, nemmeno di prova. Le riparazioni che contiene non sono attive finche' non la applichi.

**Esito 2026-08-19 20:25:** applicata al database vero in sette blocchi, col tuo ok in chat.
Verificata rileggendo il database: trentotto controlli, tutti col valore atteso. Un blocco si e'
fermato e ha scoperto un cassetto mancante in produzione: da li' e' nata la carta #129. Restano
fuori le riparazioni della vista che alimenta il riquadro in home, che vanno dopo la
pubblicazione del codice.

---

### ✅ #126 — Aperta la richiesta di unione sul repo del sito. FATTO 2026-08-19 19:10, col tuo ok in chat · ⏳ accodata 2026-08-19 13:25

**Cosa cambia:** le centoquattro riparazioni di oggi sono su un ramo del repo del
marketplace, e da questa sessione non posso aprirti la richiesta di unione: il proxy nega le
credenziali per quel repository, perche' e' fuori dall'elenco autorizzato. Finche' resta
cosi', il lavoro c'e' ma tu non lo vedi in una pagina dove poterlo approvare.

**Se va bene:** apro la richiesta di unione con il referto dentro, e tu decidi guardando il
diff. In alternativa, se preferisci non allargare i permessi, applichi tu la patch a mano:
`git am < consegne/tech/2026-08-19-marketplace-104-difetti.patch`.

**Cosa non ho verificato (al momento in cui l'ho accodata):** non so quale delle due strade tu
preferisca, e non ho provato la seconda: la patch e' generata dai commit veri, ma non l'ho
applicata a una copia pulita.

**Esito 2026-08-19 19:10:** col tuo ok in chat ho aperto la richiesta #225 sul repo del sito.
Tutti i controlli verdi. Resta da unire: quella firma e' tua.

---

### ✅ #75 — La visita del server era viva: il guasto vero era il push dei referti · ⏳ accodata 2026-08-13 00:15 · ✅ chiusa 2026-08-13 20:45 (verificata coi 4 screenshot di Nicola)

**Cosa è successo.** Questa card ti chiedeva di riaccendere la visita del server. La diagnosi era sbagliata. L'hanno dimostrato i tuoi 4 screenshot del 13/8 alle 17:57. Il timer è acceso dal 31 luglio. La visita gira due volte al giorno, alle 6:45 e alle 20:45. L'ultima è delle 6:46 di stamattina. La prossima è stasera alle 20:45. I due comandi `sudo` proposti non servivano.

**Il guasto vero era un altro.** I referti scritti dal server non salivano su GitHub: token e allineamento git rotti dal 10/8 sera. La Cabina quindi mostrava semafori vecchi di giorni. Da oggi pomeriggio la pubblicazione è ripartita. I referti del 12/8 sera e del 13/8 mattina sono su GitHub. Quelli in mezzo (dal 10/8 sera al 12/8 mattina) restano solo sul server.

**Cosa resta da guardare.** La visita di stasera alle 20:45. Se in Cabina la data della visita diventa quella di stasera, il ciclo è tornato sano. Se il controllo del push git resta rosso anche domani, quello è un guasto nuovo e me lo prendo io.
- **Colore:** ✅ chiusa — nessun comando da eseguire
- **Reparto:** devops-sre
- **Origine:** `{origine:salute-2026-08-12, controllo:worker.ponte}` — chiusa dopo la verifica sul terminale di Nicola, 2026-08-13 17:57

<!-- sensori-cancellati -->

---

### ✅ #73 — Chiusa la falla che cancellava lo stato dei sensori. FATTO 2026-08-11 17:05, col tuo ok in chat · ⏳ accodata 2026-08-11 16:54

**Cosa ho fatto.** Due mosse, come promesso. La prima: il voto che decide se si può scrivere ora conta solo i controlli che dipendono davvero dalle chiavi. Il guardiano esterno legge un file nel repo, non una chiave, e da solo faceva passare tutti gli altri. La seconda: il permesso vale per un sensore alla volta. Anche quando si scrive, un occhio che quell'esecuzione non ha potuto misurare tiene il valore di chi l'aveva guardato davvero.

**Come si vede che funziona.** Ho rilanciato il controllo da qui, a chiavi spente, sul file vero: adesso risponde «non aggiorno, preservo lo stato reale del server» e il file non cambia di un byte. Prima riscriveva dieci sensori su dodici.

**Il freno.** `cervello/test/sensori-non-calpestati.test.mjs`, cinque controlli. Due eseguono il comando davvero su una copia e pretendono che non cambi. Uno prova che il metro sa anche dire di sì: con una chiave presente il file si aggiorna, altrimenti avrei murato la porta invece di ripararla. Rimettendo il difetto, tre dei cinque diventano rossi — provato, e registrato in `cervello/mutanti.json`.

<details><summary>La richiesta originale</summary>

**Cosa cambia:** in Cabina i sensori possono passare da «a posto» a «non collegato» senza che si sia rotto niente. Basta che io lanci il controllo da un posto dove le chiavi non ci sono. È successo stanotte alle due e mezza, mentre preparavo la radiografia. Il file si è riscritto da solo. Sette occhi che sul server funzionano sono diventati «non configurato»: Stripe, il database del marketplace, il sito, la memoria, la Cabina. E con la data fresca, come se qualcuno li avesse appena controllati. Me ne sono accorto e ho rimesso a posto. Ma il giro dopo legge quel file per decidere se fidarsi dei numeri. Trovandolo così si mette il freno «niente numeri nuovi» per un guasto che non esiste. Il file poi finisce nel salvataggio, quindi la bugia arriva anche al server. La protezione contro tutto questo **è già scritta nel codice**, con un commento che la spiega. Solo che non si chiude mai. Basta che un controllo qualsiasi si dichiari a posto e la porta si apre per tutti. E uno di quei controlli risponde sempre di sì, perché guarda se esiste un file su disco invece di guardare se c'è una chiave.
**Se va bene:** rispondi «ok sensori». Faccio due cose. La prima: la porta si chiude sul singolo sensore invece che sull'intero file. Così chi non ha la chiave di Stripe non può riscrivere lo stato di Stripe, e lascia in pace gli altri. La seconda: aggiungo un freno che fallisce se qualcuno riapre la porta. Lancia il controllo a chiavi spente su una copia e pretende che il file non cambi. Ci vuole un giro. Se invece lo vuoi lasciare com'è, va bene: lo segno come tua decisione e non te lo ripropongo più. Sappi però che finché resta così, ogni volta che guardo da fuori dal server ti sporco la Cabina.
**Nota tecnica:** unico bloccante della radiografia dell'11/8. Sta nella foto `auto-coscienza/auto-radiografia.json`, sotto `macchina/sensori-cecita`. Prende un numero di cantiere quando si apre il lotto che lo ripara. Il punto esatto: `cervello/verifica-sensori.mjs` righe 594-602 calcola `ambienteConfigurato` con un `some`, cioè basta un solo controllo a posto. Il controllo del guardiano esterno alle righe 346-359 si dichiara sempre configurato, in tutti e quattro i rami. Lo fa perché verifica se esiste il file `.github/workflows/battito-esterno.yml`, non se c'è una chiave. La porta di scrittura è `cervello/stato-sensori.mjs` righe 41-48. Il file riscritto è `auto-coscienza/sensori-cecita.json`. Misurato stanotte: 10 sensori su 12 a posto prima, 3 dopo.
- **Colore:** 🟡 — tocca il codice della macchina, non il marketplace, e nessuno riceve messaggi.
- **Reparto:** AD + tech
- **Origine:** `{origine:radiografia-totale, rapporto:consegne/audit/2026-08-11-radiografia-totale.md}`

</details>

<!-- quanto-chiudo-e-il-mio-voto -->

---

### ✅ #72 — Smetto di cercare quando riparo poco. FATTO 2026-08-11 00:20, col tuo ok in chat · ⏳ accodata 2026-08-11 01:32

**Cosa cambia:** a luglio ho chiuso 244 difetti sui 455 che avevo trovato. Ad agosto, in dieci giorni, ne ho chiusi 14 su 90. Trovo circa tre volte più in fretta di quanto riparo, e il divario si allarga. Tu me l'hai detto con parole tue: «so già che dopo questo upgrade ti chiederò di rianalizzare e troverai un sacco di errori». **Hai ragione, e il motivo è questo numero, non la mia bravura.** Finché apro più di quanto chiudo, ogni radiografia che mi chiedi ti allunga la lista invece di accorciarla. Se dici sì, il mio voto su me stessa diventa uno solo: i difetti che chiudo nel mese diviso quelli che apro, obiettivo almeno 1. Sotto 1, il giro smette di aprire ricerche nuove e spende il turno a chiudere.
**Se va bene:** rispondi «ok tasso di chiusura». Io lo scrivo negli obiettivi della squadra come numero mio e lo faccio calcolare a ogni giro. Poi cablo il freno che ferma le ricerche nuove quando scende sotto 1. Da lì in avanti la lista che ti riporto dopo una radiografia si accorcia, invece di allungarsi. Se preferisci che continui a cercare comunque, dimmelo: è una scelta legittima, ma allora la lista cresce e va accettato.
**Nota tecnica:** difetto AR-566. Numeri contati sui 552 difetti del cantiere per mese di nascita e di chiusura. La dimensione con più difetti aperti è «guardiani-e-guardrail» (21 su 168): i controlli sono la prima fonte di lavoro dei controlli. Oggi girano 79 guardiani a ogni giro, 38 possono fermare il lavoro.
- **Colore:** 🔴 — è una regola di governo. Limita quanto lavoro la macchina genera da sola, quindi la decisione è tua.
- **Reparto:** AD
- **Fatto:** motore `cervello/tasso-chiusura.mjs` · freno nel giro (`CHIUSURA_VINCOLO`) · numero in `OKR-Squadra.md` · prova `cervello/test/tasso-di-chiusura.test.mjs` (13 controlli, cade 3 volte se rompo il fix) · AR-566 chiuso. Misura di oggi: **0,18** — il freno è acceso.
- **Origine:** `{origine:radiografia-catena-di-lavoro, difetto:AR-566, pr:697}`

<!-- cosa-vuol-dire-fatto -->

---

### ✅ #71 — Alzata l'asticella di cosa vuol dire «riparato». FATTO 2026-08-11 00:20, col tuo ok in chat · ⏳ accodata 2026-08-11 01:32

**Cosa cambia:** oggi un difetto su tre si chiude perché una parola compare in un file. Ti faccio l'esempio vero: il difetto AR-128 diceva «non esiste nessun sensore per le contestazioni carta». La sua prova era che la parola «chargeback» comparisse in un documento. Scrivere quella parola bastava a chiudere il difetto — e il sensore non c'era comunque. Sono 193 difetti su 552 messi così. **Questa è la ragione per cui gli errori li trovi tu e non io:** una ricerca di parole non può fallire nel modo in cui fallisce la realtà. Se dici sì cambiano due cose. Da domani un difetto grave o bloccante nasce con un comando che gira davvero, o non nasce. E i 193 vecchi li converto a lotti, partendo dai bloccanti.
**Se va bene:** rispondi «ok asticella». Io scrivo la regola nel mansionario e la aggancio al cancello che ferma i lotti. Poi ti porto il primo lotto di conversione entro il giro seguente. Se preferisci di no, dimmelo lo stesso: chiudo il difetto come scelta tua e smetto di riproportelo. Se non decidiamo niente resta com'è, e continuerai a trovare tu quello che io ho dichiarato risolto.
**Nota tecnica:** difetto AR-564, nato dalla radiografia della catena di lavoro del 10/8. Le due forme di prova stanno in `cervello/auto-fix.mjs:154-179`; la forma ammessa per i comandi in `cervello/forma-prova.mjs`. Conteggio: 193/552 forma testuale, 243/552 comportamentale, 28 umane, 30 senza prova. Fra i chiusi la testuale è 67/332 (20%).
- **Colore:** 🟡 — cambia una regola di lavoro della macchina. Non tocca il marketplace e non manda niente a nessuno.
- **Reparto:** AD + prompt-engineer
- **Fatto:** regola in `CLAUDE.md` · cancello `asticella` in `cervello/cancello-lotto.mjs` · freno `cervello/test/asticella-prova-che-gira.test.mjs` (11 controlli, cade 3 volte se rompo il fix) · AR-564 chiuso.
- **Origine:** `{origine:radiografia-catena-di-lavoro, difetto:AR-564, pr:697}`

<!-- accendi-i-quattro-controlli-nuovi -->

---

### ✅ #68 — ~~Incolla il blocco che accende i quattro controlli nuovi della macchina~~ → FATTO 2026-08-04 05:20 · ⏳ accodata 2026-08-10 12:16

**Esito:** Nicola ha incollato il blocco e l'ha committato su main. L'aggancio è MISURATO, non dichiarato: `node cervello/hooks-check.mjs --senza-attese` esce 0 con tutti e quattro fra i comandi attaccati, e lo stesso comando usciva 1 finché non c'erano. I quattro difetti sono chiusi (AR-522, AR-525, AR-527, AR-528) e le quattro attese sono state tolte dal registro, non aggiornate.

**Cosa cambia:** ho costruito quattro controlli che oggi non esistono. Senza il tuo incollaggio restano spenti.
Il primo guarda i miei senior quando finiscono di lavorare. Oggi consegnano e nessuno controlla cosa lasciano indietro. Sono il gruppo che produce più lavoro di tutti.
Il secondo ti chiede il permesso quando sto per scrivere un file fuori da questa copia. Oggi quelle scritture saltano ogni controllo. Salta anche quello che ferma una chiave vera prima che finisca su GitHub.
Il terzo dice al controllo di fine turno dove comincia il tuo messaggio. Senza, il 3 agosto mi ha contestato 8 cose. Di quelle 8, ben 7 erano file del 31 luglio che non avevo aperto.
Il quarto fa sopravvivere quello che i controlli trovano. Oggi muore insieme alla sessione.

**Se va bene:** apri `.claude/settings.json`, sostituisci tutta la parte `"hooks"` col blocco pronto in `consegne/macchina/2026-08-04-hooks-mancanti.md`, e lancia `node cervello/hooks-check.mjs`. Il blocco l'ho già provato su un file candidato. Risultato: 10 comandi su 8 momenti, tutti validi, nessuno staccato.
Il blocco che avevi incollato il 1 agosto aveva due errori. Uno era una parentesi mancante, l'altro una lettera minuscola. Qui non ci sono.
Se non lo incolli entro l'11 agosto il guardiano diventa rosso da solo. È voluto: un'attesa senza scadenza è un permesso travestito.

**Il blocco da incollare** (è tutto qui: non devi aprire nessun altro file)

```json
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash cervello/installa-hooks.sh >/dev/null 2>&1; node cervello/contesto-lezioni.mjs --hook"
          },
          {
            "type": "command",
            "command": "node cervello/memoria-guardia.mjs --apri --hook",
            "timeout": 15
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/intento-turno.mjs --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash|Task|mcp__.*",
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/pre-scrittura.mjs --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/sorvegliante.mjs --hook",
            "timeout": 15
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/misura-cieca.mjs --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/cancello-senior.mjs --hook",
            "timeout": 20
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/memoria-guardia.mjs --consegna --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/cancello-stop.mjs --hook",
            "timeout": 20
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/memoria-guardia.mjs --chiudi --hook",
            "timeout": 15
          }
        ]
      }
    ]
  }
```

**Nota tecnica:** difetti AR-525, AR-527, AR-528, AR-522 (i quattro controlli) + AR-526 (la terza strada del guardiano degli hook, che evita la CI rossa mentre aspetto il tuo incollaggio). Il file dei permessi è negato in scrittura alla macchina apposta, e deve restarci: è quello che può staccare tutti i freni insieme, divieto sui `.env` compreso. Perciò questa card esiste invece del fix diretto.

- **Colore:** 🟡 (cambia la configurazione dei controlli, non manda niente a nessuno; reversibile rimettendo il blocco di prima)
- **Reparto:** builder-automazioni + devops-sre
- **Origine:** `{origine:lotto-hooks-mancanti, difetti:[AR-525,AR-526,AR-527,AR-528,AR-522]}`

---

### ✅ #67 — ~~Accendi gli ultimi due freni: le lezioni giuste all'inizio del lavoro e la mano fermata sull'errore già noto~~ → FATTO 2026-08-04 17:26 · ⏳ accodata 2026-08-10 12:16

**Esito:** Nicola ha incollato il blocco in `.claude/settings.json`. Due tentativi falliti prima del verde, entrambi diagnosticati e corretti nella stessa conversazione: ① comando di verifica lanciato dalla home (`~`) invece che da `/opt/mycity/ad-mycity` → "Cannot find module"; ② il JSON incollato a mano aveva il blocco `mano-fermata` annidato dentro l'array sbagliato + due virgole mancanti → `JSON.parse` falliva e `cablaggioPresente()` tornava tutto `false`. Alla terza prova, con il blocco `"hooks": {...}` sostituito per intero, `node cervello/mano-fermata.mjs --cablaggio` è uscito verde: «i due freni della prevenzione a monte sono cablati: mano-fermata (PreToolUse) e scheda su misura (UserPromptSubmit)». Prova indipendente nello stesso turno: l'hook `contesto-lezioni.mjs --richiesta` ha davvero iniettato 8 lezioni a tema in cima al prompt successivo di Nicola — non solo il comando di collaudo dice verde, il freno si è visto girare dal vivo. Difetto macchina AR-533 chiuso.

- **Colore:** 🟡 (auto-modifica della macchina, firmata da Nicola)
- **Reparto:** qa + prompt-engineer
- **Origine:** `{origine:richiesta-nicola-2026-08-04, difetto-macchina AR-533}`

<!-- macchina-ferma-da-quattro-giorni -->

---

### ✅ #51 — Il server è tornato a pubblicare: guasto dei quattro giorni chiuso · ⏳ accodata 2026-08-04 03:10 · ✅ chiusa 2026-08-04 12:20

**La prova:** alle 12:09 su `main` è arrivato il commit di un giro vero («giro 4/8 11:30 + collaudo»), alle 12:10 il recupero delle scritture rimaste in sospeso, alle 12:11 il riconcilia. E il giro delle 12:20 è già il secondo consecutivo pubblicato. La memoria scorre di nuovo dal server a GitHub e il Pannello legge dati di oggi — non serviva più niente da te su questa card.
**Resta aperto, già a cantiere (non è un compito tuo):** il push del giro delle 11:30 in sé risultava fallito (`esito-giro` delle 11:42 con `push_ok: false`): quelle scritture sono uscite dalla corsia di recupero, non dal push diretto. La «via di fuga» perché la pubblicazione non dipenda dal rebase è la scheda AR-518/AR-521. Intanto il freno nuovo veglia: memoria ferma oltre 12 ore = banner rosso in home da solo (AR-544).
- **Colore:** ✅ chiusa (era 🔴)
- **Reparto:** devops-sre
- **Origine:** `{origine:visita-salute-2026-08-04, difetti:[AR-518, AR-530, AR-544]}`

<!-- ordine-test-dentro-o-fuori-dalla-pausa -->

---

### ✅ #35 — Risposto: resta dentro la pausa, collaudo a settembre · ⏳ accodata 2026-07-28 08:45 · ✅ chiusa 2026-08-13 10:22 (risposta già data il 28/7)

**Cosa è successo.** Questa card chiedeva a Nicola se l'ordine di prova su Pane Quotidiano dovesse restare **dentro o fuori** dalla pausa negozi — cioè se il collaudo (una pausa di validazione) dovesse seguire la stessa pausa di business decisa per le altre undici card. Era marcata `{congelamento-da-confermare: ordine-test-pq}` in [[AZIONI-IN-ATTESA]]. **Nicola aveva già risposto il 28/7 alle 15:56** («Si l'ho rimandato a settembre») — registrato in [[DECISIONI]] alla stessa data/ora. La card però non è mai stata chiusa nel file, e per 16 giorni ogni giro l'ha ripresentata come "mossa n.1 ferma senza risposta", quando la risposta esisteva già. Errore riconosciuto: [[feedback-domanda-gia-decisa-ricontrollare]] — prima di riproporre una domanda-decisione, controllare `DECISIONI.md`.

**Esito:** l'ordine di prova resta congelato fino al 24 agosto-1 settembre 2026 insieme al resto dei negozi ([[ripresa.lavoro-operativo|registro-fatti.json]]), nessuna eccezione. Il primo giorno di lavoro operativo sarà un giorno di collaudo (verifica pagamento→fornaio→consegna), non di vendita.
- **Colore:** ✅ chiusa, nessuna azione da eseguire
- **Reparto:** chief-of-staff + analista
- **Origine:** `{origine:auto-radiografia-2026-07-27, difetto:AR-157}` — chiusa da giro AD 2026-08-13 10:22
| 83 | 2026-08-14 06:39 | @tech | Finisci di riparare i test rossi: il primo tentativo ne ha lasciato un altro aperto sullo stesso ramo | 🟡 | https://github.com/NicolaeRotaru/ad-mycity/pull/722 — 2 controlli CI falliti (test del cervello, verdetti senza lettore), nessun esito lasciato nel quaderno di reparto (AR-009). Da riparare sullo stesso ramo `fix/recupero-sensori-mappa-macchina-13-8`, non un altro. | github | in attesa | Finché resta rossa, sale a 5 il numero di PR aperte e rosse, e le altre due PR sullo stesso tema (probabile duplicato) non si possono chiudere con sicurezza. | Dopo il fix la CI torna verde, e posso rileggere le PR duplicate per capire se vanno chiuse. |
| 84 | 2026-08-14 11:17 | @tech | Salva in un ramo il lavoro sul cantiere rimasto solo sul disco | 🟡 | 34 file (20 modificati + 14 nuovi: `cervello/misura-o-cieco.mjs`, 7 test collegati, `pannello/src/lib/badge-coerenza.ts`) sono sul disco dalle 06:30 di oggi e mai committati — sembra un fix reale del cantiere (tema "misura vs cieco" + "badge di coerenza") interrotto prima di salvare. Segnalato per la prima volta alle 08:41, ancora invariato alle 11:17: nessuno lo ha ancora messo al sicuro. | manuale | ✅ CHIUSA 2026-08-14 20:05 — verificato: `cervello/misura-o-cieco.mjs` e `pannello/src/lib/badge-coerenza.ts` sono ora su `main`, puliti (`git status` non li mostra più), portati dalla PR #721 (commit `c583d5bbb`, "Quarantaquattro difetti riparati"), confermata ancestor di HEAD. Nessuna perdita. | Finché resta solo sul disco, un `git clean`/checkout accidentale lo cancella per sempre — 3-4 ore di lavoro di cantiere perse senza motivo. | Apro io la PR una volta che confermi cosa sono questi file (o li apro direttamente se il contenuto si spiega da solo). |
| 85 | 2026-08-14 20:05 | @tech | Completa la mappa della macchina: sono arrivate 65 skill nuove senza la loro riga di descrizione | 🟡 | Il pacchetto di skill marketing/ingegneria arrivato l'11-13/8 ha portato altre 65 skill (`ab-testing`, `ads`, `copywriting`, `seo-audit`, `social`, …) oltre alle 67 già censite dalla PR #714. `cervello/censimento-macchina.mjs` (oggetto `DESCRIZIONI.skill`) non ha ancora la loro riga: `node --test cervello/test/mappa-in-bacheca.test.mjs` è rosso su questo esatto elenco (verificato dal vivo in questo giro, non dedotto). È uno dei 3 test rossi del cervello, diagnosticato ora con la causa esatta invece del generico "stesso debito noto". | github | in attesa | Finché mancano le righe, la bacheca "di cosa è fatta la macchina" che leggi tu mostra un pezzo su tre incompleto — e il test del cervello resta rosso su questo. | Dopo il fix (righe aggiunte, una frase per skill) il test torna verde e la mappa torna vera. |
| 86 | 2026-08-14 22:39 | @tech | Rigenera il registro delle prove del cantiere: due difetti ancora aperti hanno perso il comando che li verifica | 🟡 | Il sorvegliante segnala da decine di giri che `cantiere-prove.json` ha perso righe che chiamavano `cervello/sentinella-dati.mjs` e `pannello/src/app/page.tsx`, fra le altre. Controllato riga per riga contro la fonte vera (`cantiere-difetti.json`, non il grep del sorvegliante): su 13 difetti coinvolti, **11 sono davvero chiusi** — la sparizione della loro prova è corretta, il file traccia solo i difetti aperti, falso allarme già confermato più volte oggi. Ma **2 sono ancora "aperto"** (AR-225 — tabella dei numeri fuori schermo su mobile; AR-346 — cancello condiviso rosso su main per una riga di censimento mancante): per questi due la sparizione della prova è un buco vero, non un falso allarme. Il file dirty predata questa sessione (già modificato all'apertura, prima di qualunque mio comando) e il suo generatore, `cervello/cantiere-prove.mjs`, è bloccato dall'allowlist di questa sessione headless — non l'ho potuto rilanciare per riparalo, né modificarlo a mano senza rischiare di introdurre un errore mio in un file auto-generato. | github | in attesa | Finché resta così, AR-225 e AR-346 restano difetti aperti ma invisibili al conteggio delle prove — la macchina non sa più come verificarli quando arriva il turno di ripararli. | Rilancia `node cervello/cantiere-prove.mjs` da un canale con permessi più larghi (VPS): rigenera il file dalla fonte vera e le due righe tornano. |
| 87 | 2026-08-15 00:26 | @tech | Merge PR #732 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/732 (aggiornata: aggiunto esempio concreto + corretto il conto CI stale) | github | ✅ CHIUSA 2026-08-17 01:38 — trovata già mergiata: il commit vive dentro `origin/main` (verificato `git log`), e `ci-stato.mjs` dal vivo conta solo 3 PR aperte oggi (#749/#741/#735), non questa. La riga era rimasta "in attesa" per errore di aggiornamento della coda, non perché mancasse davvero un merge. | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Nessuna azione: già online. |
| 88 | 2026-08-15 09:14 | @tech | Merge PR #733 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/733 | github | ✅ CHIUSA 2026-08-17 01:38 — trovata già mergiata: il commit vive dentro `origin/main` (verificato `git log`), e `ci-stato.mjs` dal vivo conta solo 3 PR aperte oggi (#749/#741/#735), non questa. La riga era rimasta "in attesa" per errore di aggiornamento della coda, non perché mancasse davvero un merge. | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Nessuna azione: già online. |
| 89 | 2026-08-15 11:47 | @tech | Merge PR #735 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/735 — ⚠️ AGGIORNAMENTO 2026-08-16 11:08: da quando questa riga è stata scritta sono arrivati nuovi commit sullo stesso ramo e la CI è tornata rossa (2 controlli falliti su 2, colpa del ramo stesso: il gate delle lezioni non supera i propri test). NON approvare questa riga finché la card #100 non conferma il verde: un merge ora porterebbe codice rotto su `main`. | github | in attesa (CI rossa — non mergiare) | Il codice in anteprima va online su Vercel (Pannello) dopo il merge — ma solo se la CI è verde: oggi non lo è. | Aspetta il verde riportato dalla card #100, poi Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 90 | 2026-08-16 07:07 | @tech | Merge PR #740 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/740 | github | ✅ CHIUSA 2026-08-17 01:38 — trovata già mergiata (o comunque non più aperta): `ci-stato.mjs` dal vivo conta solo 3 PR aperte oggi (#749/#741/#735), non questa. Non riverificato con `git log` riga per riga come le altre tre (nessun commit col numero trovato in log), quindi se risultasse ancora aperta va riaperta — ma non è tra le 3 che il canale live vede oggi. | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Nessuna azione nota: non risulta più aperta. |
| 92 | 2026-08-16 08:41 | @ad | Fai la radiografia completa: la sonda dice che serve, non solo il check leggero | 🟡 | La sonda di `auto-radiografia.json` (aggiornata alle 08:20 di oggi dal worker) segna `serve_radiografia_completa: true` — l'ultima radiografia completa è vecchia (115 ore, quasi 5 giorni). Nessuna card in coda la chiedeva ancora: trovato leggendo il file durante il collaudo di questo giro. Va lanciata con il workflow `auto-radiografia` (comando: «radiografia di te stessa» / `.claude/workflows/auto-radiografia.js`), 12 dimensioni sull'architettura della macchina. | manuale | in attesa | Finché resta ferma, eventuali difetti strutturali nuovi (agenti, prompt, sensori) non vengono cercati attivamente — solo la sonda leggera li sfiora. | Al via: lancio il workflow completo e porto qui il report per gravità. |
| 91 | 2026-08-16 07:17 | @tech | Merge PR #740 ad-mycity → main | 🔴 | Duplicato esatto della card #90. Stesso PR, scritta 10 minuti dopo. Probabile doppia scrittura del pre-step automatico. Trovato e chiuso da @ad nel giro del 2026-08-16 07:40. Niente da eseguire su questa riga: firma solo #90. | github | ✅ chiusa (duplicato di #90) | — | — |
| 93 | 2026-08-16 10:26 | @ad | Trasforma cinque lezioni che si ripetono in regole vere, non in altre righe di diario | 🟡 | `apprendimento-guardiano.mjs` dice no da 3 giri di fila: 5 aree si ripetono senza mai diventare un principio o un freno automatico — correzione-nicola (27 lezioni, 19 ripetute), guardiani (23, 3 ripetute), plugin (11, 17 ripetute), auto-revisione (16, 0 ripetute), misura (15, 0 ripetute). Da questa sessione (cloud) non posso rilanciare lo script: non è nell'elenco esatto dei comandi consentiti in chat, stesso limite già descritto nella card #42 qui sotto. | manuale | in attesa | Finché restano lezioni sparse, la macchina continua a scrivere la stessa lezione invece di smettere di sbagliare — l'apprendimento resta un archivio, non un freno. | Applicando la card #42 (permessi senza jolly) questo script torna eseguibile in chat; da lì scelgo 2-3 lezioni mature e le trasformo in principio/gate nello stesso giro. |
| 94 | 2026-08-16 10:26 | @devops-sre | Le cadenze del ritmo sono ferme da 2-9 giorni, non solo da oggi | 🟡 | `freschezza-cadenze.mjs` segna 4 cadenze scadute: piano-mattino e report-sera fermi da quasi 3 giorni (70h e 64h, tetto 30h), la review settimanale ferma da 9 giorni (211h, tetto 192h), il monitoraggio fermo da oltre 2 giorni (52h, tetto 30h). È lo stesso tema già in coda dalla card #77 (13/8): questa riga serve solo a confermare che il guasto è ancora vivo tre giri dopo, con i numeri di oggi. | manuale | in attesa | Senza battito, il Pannello mostra numeri e proposte vecchie di giorni come se fossero di oggi. | Vedi card #77: serve una mano sul VPS che riavvii il servizio del worker (`visita il worker` da una sessione lì), oppure conferma se è già stato fatto e il sensore è solo in ritardo. |
| 95 | 2026-08-16 10:26 | @ad | 246 correzioni tue su 311 non hanno ancora un freno che scatta da solo | 🟡 | `correzione-nicola-gate.mjs`: 311 lezioni taggate come "correzione di Nicola", solo 65 hanno un `gate:` verificabile — 246 restano parole senza un comando che le riscontri. La soglia sana è 20. Non peggiorato dal giro scorso, ma ancora malato. Da questa sessione (cloud) `node cervello/gate-veri.mjs` è bloccato dallo stesso limite di permessi della card #42. | manuale | in attesa | Una tua correzione senza freno rischia di doverti essere ripetuta: è il pattern già visto 19 volte solo nell'area "correzione-nicola". | Applicando #42 sblocco `gate-veri.mjs` in chat e in questo stesso giro aggancio 1-2 lezioni mature a un gate vero, come chiesto dal vincolo di oggi. |
| 96 | 2026-08-16 10:26 | @intelligence | Due schede di mercato sono scadute (buchi-mercato, leve in uscita) ma questo giro non le tocco apposta | 🟡 | `intelligence-freschezza.json` (aggiornato dal vivo alle 10:24): "Buchi di mercato" e "Leve in uscita" sono ferme da 6 giorni (soglia 2). Non le ho rinfrescate: il vincolo North Star di oggi impone di fare *solo* lavoro che avvicina il primo ordine pagato o ripara la macchina — una ricerca di mercato generica non lo è, e in pausa concordata (fino al 24/8-1/9) non è comunque azionabile. | manuale | in attesa | Le due schede restano visibili nel Pannello ma con un'informazione vecchia quasi una settimana. | Al termine della pausa concordata, il primo giro pieno le rinfresca come parte del lavoro ordinario — non serve una tua decisione ora. |
| 97 | 2026-08-16 10:26 | @ad | Il guardiano del primo ordine non sa che siamo in pausa concordata | 🟡 | `north-star-check.mjs --gate` dà sempre rosso quando 0 ordini pagati da ≥3 giorni — oggi sono 53, ma è dentro la pausa che hai deciso tu fino al 24/8-1/9 (`ripresa.lavoro-operativo`). Lo script (letto, non eseguibile da qui) non ha nessuna eccezione per una pausa concordata: tratta "in pausa" e "abbandonato" allo stesso modo. È un'automodifica di codice-macchina: prima di scriverla voglio il tuo ok, non la scrivo di mia iniziativa. | manuale | in attesa | Finché resta così, ogni giro (anche dentro la pausa che hai voluto) si autoflagella con lo stesso allarme rosso, e rischia di spingere lavoro business quando tu hai chiesto il contrario. | Se dici sì, aggiungo una condizione: se la data di oggi è dentro la finestra di pausa registrata in `registro-fatti.json`, il gate segnala "in pausa concordata" invece di "stallo" — branch + PR, mai un merge automatico. |
| 98 | 2026-08-16 10:26 | @ad | Riparato oggi: il voto della squadra leggeva una data vecchia come se fosse una scadenza scaduta | ✅ | `freschezza-okr.mjs` segnalava «1 target scaduto» sulla riga «Guardrail permanente ≥ 1» — non è mai stata una scadenza, il guardiano stava leggendo "al 15/8" (un riferimento a un dato storico dentro la stessa cella) come se fosse una data-limite passata. Corretto scrivendo quella data per esteso (2026-08-15) così non assomiglia più a una scadenza, e aggiornato il campo `aggiornato:` in cima al file. Nessun altro target nella tabella ha una data passata (l'unica coppia rimasta, 24/8-1/9, è nel futuro). | interno | ✅ chiusa in questo giro | La squadra torna a vedere un OKR "verde" quando lo è davvero, invece di un falso allarme che si ripete ogni pochi giri. | Nessuna, è già fatto — verificherò al prossimo giro (quando lo script tornerà eseguibile) che il verde regga. |
| 99 | 2026-08-16 10:26 | @ad | Non riesco a dire quali lezioni imparate abbiamo davvero usato | 🟡 | `tasso-lezioni.mjs` (AR-178) misura quante lezioni scritte sono state poi applicate per davvero — bloccato dallo stesso limite di permessi della card #42 in questa sessione. Senza rilanciarlo non so dire un numero vero: dichiaro il buco invece di stimarlo a caso. | manuale | in attesa | Se le lezioni non vengono mai segnate come "applicata", la macchina sembra imparare meno di quanto sta facendo davvero (o viceversa): il numero che vedi in Cabina non è affidabile. | Applicando #42 rilancio lo script in chat e marco con `tasso-lezioni.mjs applica` le lezioni che uso davvero da questo giro in poi. |
| 100 | 2026-08-16 10:26 | @tech | Due richieste di unione restano rosse da giorni: una si è già riparata da sola | 🟡 | AGGIORNATO 2026-08-16 11:08 (`ci-stato.mjs` rilanciato dal vivo): **PR #739 è tornata verde** (2/2 controlli passati) — pronta per la tua firma, vedi la sua riga di merge dedicata. **PR #735 resta rossa** (2/2 falliti), causa ora precisa: il gate delle lezioni non supera i propri test sullo stesso ramo che l'ha introdotto — non un guasto ereditato da `main`. Riparazione in corso sullo stesso ramo, senza toccarlo `main`. | github | in attesa | Finché #735 resta rossa, non si può mergiare in sicurezza (vedi ⚠️ sulla card #89) e il tetto delle PR aperte-e-rosse resta a 1. | Appena il gate delle lezioni torna verde su #735, te lo segnalo qui pronto da firmare. |
| 101 | 2026-08-16 10:26 | @ad | Il loop "impara poi correggi" non si chiude, e lo dice lo stesso sensore da 3 giri | 🟡 | `sonda-volano.mjs --json` (AR-165) verifica che ogni lezione imparata generi davvero una correzione a valle — bloccato dallo stesso limite di permessi della card #42 in questa sessione, quindi non ho un verdetto fresco da riportare oggi. | manuale | in attesa | Senza questo controllo non sappiamo se l'apprendimento sta davvero cambiando comportamento o solo accumulando file. | Applicando #42 rilancio la sonda in chat; se resta rosso, lo porto come difetto nel cantiere con causa radice invece di richiuderlo con una frase. |
| 102 | 2026-08-16 11:08 | @tech | Merge PR #739 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/739 — Centoquattro difetti curati per malattia (radiografia), CI verde (2/2), pronta per la firma. | github | ✅ CHIUSA 2026-08-16 21:20 — la PR #739 è mergiata per davvero. Il commit `1562b89` sta nella storia di `main`: l'ho letto riga per riga. | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 103 | 2026-08-16 11:08 | @tech | Merge PR #738 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/738 — 50 difetti in parallelo, CI verde (2/2), pronta per la firma. | github | ✅ CHIUSA 2026-08-16 22:29 — confermato con `git log origin/main`: il commit `ceb988da1` ("Tre difetti riparati… (#738)") è nella storia di `main`. Nessuna firma manuale mancante: la PR è già dentro. | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Già fatto, nessuna azione. |
| 105 | 2026-08-16 11:29 | @tech | Il test del cervello è rosso per davvero: un commit di stamattina ha cambiato cosa significa "margine" senza aggiornare il test che lo controlla | 🟡 | `cervello/test/burn-down-che-migliora-da-solo.test.mjs` fallisce su `salute-onesta.mjs --json`: il test si aspetta che `burn_down_margine` sia uguale a `cantiere_aperti_settimana_fa_ignoti` (il margine del confronto con una settimana fa — è il comportamento descritto nel commento in cima al test stesso, scritto quando è nato AR-671). Il commit di stamattina delle 08:37 (`78bcfcc39`, "burn_down_margine conta ADESSO, non a settimana fa") ha cambiato `cervello/salute-onesta.mjs:119` per scrivere lì il margine di ADESSO (`margineOra`) invece di quello di una settimana fa. Non ho capito da solo quale dei due comportamenti sia quello giusto oggi: il nome del commit dice "conta ADESSO" di proposito, ma il test (mai toccato da quel commit) dice ancora l'opposto. Verificato dal vivo lanciando l'intera suite (`node --test cervello/test/**/*.test.mjs`, non solo un grep): su oltre 700 test passati in questo giro, questo è l'unico rosso vero. | manuale | in attesa | Finché resta così, il test del cervello segna rosso davvero (non il solito debito noto) e il vincolo HARD blocca ogni "fatto"/PR finché non si sceglie quale dei due numeri è quello giusto. | Dimmi tu quale margine è quello giusto (adesso o una settimana fa): o si aggiorna il test per riflettere la nuova scelta, o si torna indietro sul commit di stamattina. Poi @tech lo sistema in un ramo, verifica col test e apre la PR. |
| 106 | 2026-08-16 12:01 | @tech | Merge PR #741 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/741 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 109 | 2026-08-16 16:28 | @tech | Due richieste di unione sono rosse da tre giri di fila. Nessuno le sta riparando | 🟡 | Ho rilanciato `ci-stato.mjs` in diretta alle 16:27. La PR #741 e la PR #735 restano rosse. Hanno esattamente lo stesso guasto trovato stamattina, ai passaggi delle 10:26, delle 11:08 e delle 12:55. Nessuna riparazione le ha ancora toccate. Sono le stesse due già descritte nelle card #89, #100 e #106. La #735 fallisce il gate delle lezioni sul proprio ramo. La #741 fallisce due controlli: "verdetti senza lettore" e un commit di lavoro senza esito nel quaderno. Il vincolo di oggi (AR-687) segnala che il controllo CI è appena diventato "cronico": tre giri di fila senza soluzione. Si aggiunge agli altri 8 controlli già in coda dalle card #93-#101. Scrivo questa card perché il vincolo lo chiede. Non è una scoperta nuova sul merito tecnico, che resta invariato. **Novità vera di questo passaggio:** la PR #739, che era in questa stessa lista alle 12:55 (card #100/#102), non risulta più tra le PR aperte. Probabile merge o chiusura avvenuta altrove, nelle ultime tre ore e mezza. Non posso verificarlo da qui: in questa sessione `gh pr view` e `gh pr list` sono stati negati.  **Nota del recupero (16/8 21:20):** sul server questa card portava il numero #107. Qui è diventata #109, perché nel frattempo il #107 era stato dato alla card dei fornelli.| manuale | in attesa | Le due PR restano rosse da mezza giornata. Non toccano il marketplace live: nessun rischio per il business. Ma è debito che si accumula invece di chiudersi. | Dimmi quale delle due strade preferisci. ① Dedico una sessione a chiudere per davvero questi 2 rossi. Lavorerei sullo stesso ramo di ciascuna richiesta di unione: cambiare ramo è l'errore già fatto una volta, ed è scritto nella card #83. ② Li congelo fino a dopo la pausa negozi del 24/8-1/9, insieme al resto del lavoro sulla macchina che non è urgente. Nel frattempo, verifica se la PR #739 è già stata mergiata: se sì, chiudo io la card #102. |
| 110 | 2026-08-16 16:52 | @ad | Trovata la causa vera per cui non si pubblica da 5 ore — e la card #102 si può chiudere | 🟡 | **Risposta alla card #109.** Sì, la PR #739 è mergiata per davvero. L'ho verificato con `git log origin/main`. Il commit `1562b89f9`, in cima a `origin/main`, è proprio quel merge. Per questo `ci-stato.mjs --pr 739` non la trova più tra le aperte: non è sparita, è finita. La card #102 ("Merge PR #739") si può chiudere. È già fatta. **La scoperta vera è un'altra.** Ho confrontato `main` locale con `origin/main`. Sono divergenti: 97 commit scritti solo qui, contro 1 solo su GitHub (proprio il merge della #739). Il punto in cui si sono divisi è il commit delle 12:10 del 16 agosto. Da lì, ogni giro ha continuato a scrivere memoria solo in locale. Niente è arrivato su GitHub. Sono circa 4 ore e 40 minuti: combaciano con il "lucchetto orfano da 300 minuti" segnalato stamattina. Non è un lucchetto bloccato. È la pubblicazione che fallisce da 5 ore di fila. Ho provato io stessa a ripararlo. L'ho fatto su un ramo usa-e-getta, mai su `main`. Si rompe subito: al secondo commit su 97. Il motivo sono conflitti veri, non un errore mio. Il giro e la PR #739 hanno modificato nello stesso momento gli stessi file di stato: `calibrazione.json`, `cantiere-prove.json`, `chiusura-loop.json`, `sorvegliante-storico.json`. Ho annullato la prova in sicurezza. `main` è tornato esattamente com'era prima. Non ho insistito oltre: con ogni probabilità c'è un conflitto ogni 2-3 commit, per tutti e 97. Va risolto con calma, non a strappi. **Nota a parte, trovata per caso, non toccata:** il repo ha accumulato 2008 `git stash` nel tempo. Non solo di oggi. È fuori tema per questa card, ma è peso morto da valutare un giorno.  **Nota del recupero (16/8 21:20):** questa card era la #109 sul server.| manuale | ✅ CHIUSA 2026-08-16 21:20 — fatto, ed è proprio questa richiesta di unione. I 646 commit rimasti sul server sono ora su GitHub, nel ramo `vps/salvataggio-16-8`. Da lì è stato ripreso il lavoro vero. Le fotografie di stato ormai superate sono state lasciate fuori. La diagnosi scritta qui era giusta quasi su tutto. Sbagliava su un punto solo: il canale verso GitHub funziona, e il push col token è passato al primo colpo. | Finché `main` resta diviso, ogni giro lavora alla cieca: scrive memoria che il Pannello non vedrà mai, perché il Pannello legge solo GitHub. La card #104, sui permessi, da sola non basta a far ripartire la pubblicazione: il permesso di girare non basta se poi lo script si scontra con GitHub. | Serve una sessione dedicata, con tempo, che risolva i conflitti uno per uno. C'è anche una scorciatoia: tenere solo l'ultima fotografia di ogni file di auto-coscienza, invece di far quadrare tutti i 97 passaggi intermedi. Sono solo fotografie ripetute nel tempo, non storia che serve davvero. Nel frattempo chiudo la card #102: è fatta. |
| 111 | 2026-08-16 21:02 | @tech | Merge PR #749 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/749  **Nota (16/8 21:25):** il server aveva numerato questa card #107, ma quel numero era già della card dei fornelli. Rinumerata qui a #111 mentre si risolveva la sovrapposizione con il recupero. **⚠️ AGGIORNAMENTO 2026-08-16 22:29 (`ci-stato.mjs` rilanciato dal vivo): questa PR è ROSSA — 2 controlli falliti su 2** (`errore-ingoiato.test.mjs`, `esenzione-con-un-motivo-vero.test.mjs`, `freni-senza-fonte.test.mjs`). Non era rossa quando la card è stata scritta alle 21:02: nuovi commit sullo stesso ramo l'hanno rotta nel frattempo, stesso schema già visto su #735/#741. **NON approvare finché non torna verde.**| github | in attesa (CI rossa — non mergiare) | Il codice in anteprima va online su Vercel (Pannello) dopo il merge — ma solo se la CI è verde: oggi non lo è. | Aspetta il verde su `ci-stato.mjs --pr 749`, poi Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 112 | 2026-08-16 22:29 | @ad | Zero richieste di unione pronte per la tua firma in questo momento | 🟡 | `ci-stato.mjs` rilanciato dal vivo: le 3 PR ancora aperte (#749, #741, #735) sono **tutte e tre rosse**, nessuna pronta al merge. Novità del passaggio: PR #738 (card #103) risultava verde e in attesa — confermato con `git log origin/main` che è già mergiata (commit `ceb988da1`), quindi la card #103 si chiude senza bisogno di un Approva. Non è un peggioramento del business (nessuna di queste PR tocca il marketplace live), ma per la prima volta oggi la coda "pronta da firmare" sul fronte codice è vuota — solo debito da riparare. | manuale | in attesa (nessuna azione richiesta, solo lettura) | Nessuna. Non c'è nulla da approvare su questo fronte finché una delle tre non torna verde. | Nessuna azione da te. Se vuoi, la card #109 resta la domanda aperta su come/quando riparare le PR croniche. |
| 113 | 2026-08-16 23:58 | @ad | La macchina è entrata in modalità risparmio da tre giri di fila, e nessuno te l'aveva ancora detto | 🟡 | Il controllo `letargo.mjs` misura tre cose: quanta quota AI ho consumato, la salute della macchina, e la cassa disponibile. Segna livello **RISPARMIO** da 3 giri consecutivi. La quota AI è al 55% della finestra rolling di 6 ore. Il voto di salute della macchina è 4 su 100. La cassa Stripe disponibile è 0€. A livello RISPARMIO la macchina spegne da sola le cose pesanti: contenuti, reel, esperimenti non essenziali. Riduce anche i giri a uno al giorno. Tiene invece acceso tutto ciò che conta davvero: ordini, consegne, firme, sicurezza, sensori, memoria. Non è un guasto nuovo. È coerente con la pausa concordata sui negozi, fino al 24/8-1/9, e con quanto è stata usata la sessione oggi. Ma il vincolo di sistema (AR-687) impone di scriverlo in coda la prima volta che un controllo resta acceso per 3 giri di fila. Così non resta un segnale visto solo dalla macchina. | manuale | in attesa (solo informativa, nessuna firma richiesta) | Se resta in RISPARMIO a lungo, la macchina produce meno: niente contenuti pesanti, giri più radi. Il business intanto è comunque fermo per la pausa concordata. Probabilmente va bene così, fino al 24/8-1/9. | Conferma se va bene restare in RISPARMIO fino alla ripresa del lavoro operativo. Oppure dimmi se preferisci che la macchina torni a girare a pieno regime prima di allora. |
| 114 | 2026-08-16 23:58 | @tech | Un fix nel motore del giro (`cervello/giro.sh`) ha curato un solo caso di un difetto che ne ha altri 45 uguali | 🟡 | Il sorvegliante che controlla il lavoro (`cervello/sorvegliante.mjs`) ha trovato una "riparazione parziale". Prima della riga 53 di `cervello/giro.sh`, qualcuno ha corretto un caso del difetto chiamato `esito-in-una-pipe`: uno script che nasconde il proprio errore dentro una pipe di shell, così un fallimento vero sembra un successo. Nello stesso file restano altri 45 casi identici, mai toccati. Non l'ho scritto io in questo passaggio: `cervello/giro.sh` non è tra i file che ho modificato oggi. È un fix già arrivato prima, probabilmente dal worker sul VPS. | manuale | in attesa | `cervello/giro.sh` è lo script che avvia ogni giro: se nasconde un errore in una pipe, il giro può dirsi "riuscito" anche quando qualcosa dentro è fallito davvero. Più casi restano, più a lungo il giro può mentire a sé stesso su un fallimento. | Questo va risolto da chi tocca il codice (@tech o @devops-sre), con un branch dedicato e i test dello script che passano — non con una modifica al volo dentro un giro di memoria come questo. Conferma se vuoi che dedichi una sessione a bonificare tutti i 45 casi in un colpo solo, o se preferisci farli a piccoli gruppi. |
| 121 | 2026-08-17 06:31 | @ad | Non riesco più ad aprire un esperimento vero senza ripetere lo stesso fallimento tre volte | 🟡 | `esperimenti-check.mjs` chiede da 3 giri di fila di aprirne uno nuovo (AR-041: "nessun esperimento aperto, il ciclo osserva→impara non misura mai nulla"). Ma l'unico ambito che conta oggi — il primo ordine pagato — è già stato provato tre volte di fila (EXP-013, EXP-014, EXP-015) e tutte e tre sono finite "mancata" per lo stesso identico motivo: siamo dentro la pausa concordata con te fino al 24/8-1/9, quindi nessun contatto nuovo può partire e l'esito è scontato prima ancora di aprire l'esperimento. Aprirne un 4° sullo stesso KPI produrrebbe solo una 4ª misura fallita, non un imparare vero. | manuale | in attesa | Finché resta così, il controllo continuerà a segnare rosso ogni giro fino al 24/8, anche se la macchina si sta comportando bene (rispettando la pausa che hai chiesto tu). | Dimmi se preferisci: ① lascio il controllo rosso fino alla ripresa (24/8-1/9), sapendo perché; ② mi indichi un ambito diverso da quello del primo ordine — non bloccato dalla pausa — su cui aprire un esperimento vero questa settimana (es. leggibilità dei testi, tempo di risposta della coda). |
| 117 | 2026-08-17 10:22 | @ad | Oggi ho fatto lo stesso giro circa 26 volte, e voglio sapere se va bene così | 🟡 | Dalla mezzanotte a adesso ho eseguito circa 26 passaggi di giro completo in chat. Tutti finiscono sullo stesso risultato. Il business è fermo dal 24 giugno. Siamo dentro la pausa che mi hai chiesto tu, fino al 24/8-1/9. Ogni passaggio controlla comunque i sensori dal vivo: non è un dato vecchio ripetuto a pappagallo. Ma non trova niente di nuovo da fare, perché la pausa è fatta apposta così. Nel frattempo la quota AI di questa sessione è salita all'83%. La macchina è già passata in modalità risparmio, vedi la card #113. | manuale | in attesa (solo informativa, nessuna firma richiesta) | Ogni nuova richiesta di giro consuma quota AI per confermare una cosa già confermata poco prima. Non cambia il business. Accelera solo l'arrivo del limite della sessione. | Dimmi quale preferisci. Primo: continuo a rispondere a ogni richiesta di giro con una verifica lampo, come sto facendo ora — sensori e coerenza dati, niente riscritture pesanti. Secondo: se l'ultimo passaggio ha meno di un'ora ed è tutto invariato, rispondo con un richiamo breve al briefing di prima, invece di aprirne uno nuovo. |
| 122 | 2026-08-17 13:10 | @tech | Merge PR #753 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/753 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 123 | 2026-08-17 16:33 | @tech | I test del cervello dicono no da tre giri di fila, e da qui in chat non riesco più a rilanciarli | 🟡 | `test-cervello.mjs` è entrato nell'elenco dei controlli "cronici" (AR-687: rosso da ≥3 giri senza mai essere riparato). Non riesco a verificarlo dal vivo in questa sessione: il comando resta fuori dall'elenco esatto dei programmi ammessi (stesso buco della card #104/#42), quindi ogni tentativo viene respinto prima ancora di girare. Quello che vedo indirettamente da `ci-stato.mjs` è coerente: le 5 PR aperte oggi (#754, #753, #749, #741, #735) falliscono tutte anche su "test-del-cervello", ognuna per colpa propria (non ereditata da `main`) — cinque rami diversi che rompono lo stesso controllo è il segnale che il problema non è un caso isolato. | manuale | in attesa | Finché resta rosso e non verificabile da qui, nessuna delle 5 PR di codice-macchina può dirsi davvero pronta al merge, anche quando sembra a posto: il cancello di serietà (CLAUDE.md) vieta di dichiarare "fatto" con i test rossi. | Applicando la card #104 (le 5 righe di permesso mancanti) sblocco `test-cervello.mjs` da qui e lo rilancio nello stesso giro in cui la card viene approvata; altrimenti serve una sessione dal VPS che lo rilanci e riporti l'esito. |
| 124 | 2026-08-18 06:41 | @ad | Controlla perché il monitoraggio automatico scrive testi difficili da leggere | 🟡 | Il cancello di fine turno ha trovato frasi difficili in 5 file. Sono `Intelligence/buchi-mercato.md`, `Intelligence/eventi-picchi.md`, `Intelligence/reputazione.md`, `RITMO.md`, `AZIONI-IN-ATTESA.md`. Non li ho scritti io in questo giro. Le date sui file dicono 06:07-06:39 di oggi. Io in questo giro ho toccato solo altri quattro file, tra le 06:40 e le 06:45 — verificato con `stat` e `git status --short`. La causa più probabile è il monitoraggio che gira da solo, `cervello/monitora.md` ("Ondata 3"). Scrive dentro questi file senza passare da `si-capisce.mjs`. Quel controllo misura quanto un testo è difficile da leggere. Il problema tipico sono frasi lunghe con un'idea dentro l'altra. Un esempio vero, da `eventi-picchi.md`: "Media/bassa per MyCity — fuori Piacenza città (Val Tidone)". Il lettore deve tenere in sospeso "Media/bassa" fino alla fine della frase per capire di cosa parla. | manuale | in attesa | Se questi testi restano così, ogni volta che apri Intelligence o Ritmo fai più fatica del necessario per capirli. Il problema si accumula da solo, un giro dopo l'altro, perché nessuno lo controlla prima di scrivere. | Dimmi tu quale preferisci. Primo: aggiungo `si-capisce.mjs` come controllo dentro `cervello/monitora.md`, prima che scriva — così il problema si ferma alla radice. Secondo: lascio così per ora e lo correggo io a mano una volta a settimana. |
| 125 | 2026-08-18 08:04 | @backend-dev | Il sito appena pubblicato chiede al database dieci cose che lì non ci sono, e i rimborsi non partono più | 🔴 | Hai unito la richiesta 223 del marketplace alle 07:33. Vercel ha subito messo online il codice nuovo, e la pubblicazione risulta pronta. Quel lavoro però era fatto di due metà. Una metà è il codice del sito. L'altra metà sono quattro modifiche al database, i file numerati da 114 a 117. Il codice è andato online da solo. Le quattro modifiche no, perché toccare il database vero è una firma tua. Ho letto il database di produzione senza scriverci niente. L'ultima modifica applicata è la 113. Il codice nuovo cerca dieci cose nel database, e non ne trova nessuna delle dieci. **Cosa è rotto adesso.** Primo, e più grave: i rimborsi. Il sito cerca l'ordine da rimborsare e chiede anche un dato che nel database non c'è ancora. Riceve un errore e si ferma dicendo «ordine non trovato». Sono ferme tutte e quattro le strade che restituiscono soldi a un cliente. La prima è annullare un ordine dal pannello. La seconda è decidere su un reso. La terza è risolvere una contestazione della banca. La quarta è rimborsare un ordine scaduto. Ieri funzionavano tutte e quattro. È un peggioramento nato stamattina con la pubblicazione. Secondo: i rimborsi pieni che arrivano da Stripe non trovano più l'ordine, e vengono ignorati in silenzio. Terzo: i codici sconto. Chi scrive un codice buono si sente rispondere «Codice non valido». Comprare funziona ancora, perché il conto vero lo rifà il server per un'altra strada. Quarto: il salvataggio dei consensi sui cookie risponde errore. Quinto: non caricano i numeri del pannello di amministrazione e la pagina recensioni del fattorino. Due cose invece reggono senza rompersi. Sono la vetrina «dal vivo» in home e il carosello degli sponsorizzati, che restano solo vuoti. **E la parte che pesa di più.** Le prime due modifiche, la 114 e la 115, sono quelle che chiudono i buchi di sicurezza. Finché non le applichi, quei buchi restano aperti sul database vero. Sono tre. Indirizzi e telefoni dei clienti si leggono senza avere un account. Chi si registra come venditore si approva da solo. Gli ordini si modificano dal browser. L'elenco preciso dei dieci pezzi mancanti sta nella richiesta di unione 763 della macchina. | supabase | ✅ CHIUSA 2026-08-18 09:20 — applicate tutte e quattro al database di produzione dopo il tuo via. Verificati 13 oggetti su 13. Il controllo degli ordini non cita piu il campo cancellato a giugno. Nessuna vetrina piu scrivibile senza account, codici sconto non piu scaricabili in blocco, ordini non piu modificabili dal browser, il fattorino non vede piu la riga intera del cliente. Pane Quotidiano resta approvato: e tornato in attesa un solo profilo, il fattorino demo. Correzione mia successiva: avevo scritto EUR dove il file diceva €, rimesso a posto e ricontrollate tutte e 12 le frasi che legge il cliente, ora identiche al repo. | I rimborsi ai clienti non partono più da nessuna delle quattro strade del sito. Se oggi qualcuno chiede indietro dei soldi, l'operazione fallisce con un errore. I soldi restano fermi. In più il database resta senza le tre protezioni che la richiesta appena unita doveva portargli. | Al tuo via applico i quattro file al database di produzione, nell'ordine da 114 a 117. Poi ricontrollo i dieci pezzi uno per uno e ti dico quanti ne trovo. I file sono già dentro il ramo principale del marketplace, nella cartella delle migrazioni. Girano puliti su un database vuoto: 118 file su 118, nessun errore. Se preferisci farlo tu, incollali in quell'ordine nell'editor di Supabase. |
| 145 | 2026-08-21 16:35 | @tech | Merge PR #804 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/804 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 146 | 2026-08-21 05:35 | @devops-sre | Il sito è giù da 22 giorni, non da adesso: 3 controlli di 5 minuti sul tuo Vercel, poi ti dico il fix esatto | 🔴 | Riprende la card #79 del 13/8, mai risposta. C'è già un runbook pronto: `consegne/devops/2026-07-31-sito-503.md`. `mycity-marketplace.com` risponde HTTP 503 dal 2026-07-30 08:20. L'ho confermato ora in diretta con WebFetch. Anche il sensore automatico lo conferma: 202 controlli ciechi di fila. Causa probabile: la migrazione Render→Vercel approvata il 20/7 non risulta completata. Nel repo del marketplace non c'è `vercel.json`. In `DECISIONI.md` non c'è nessuna riga che confermi «Render spento, DNS ripuntato». Da qui non ho accesso alle dashboard. Mi servono tre risposte tue, 5 minuti in tutto. Primo: apri Render, progetto `mycity-marketplace`. È sospeso, eliminato, o ha un deploy fallito? Secondo: apri Vercel. Esiste un progetto per il marketplace, non per il Pannello? L'ultimo deploy è «Ready» o «Error»? Se è «Error», quali variabili mancano? Terzo: controlla il DNS di `mycity-marketplace.com`. Punta ancora a Render, o è già su Vercel? Appena rispondi preparo il fix esatto in un branch, pronto da firmare. **Nota del recupero (21/8 17:55).** Questa card l'aveva scritta il server alle 05:35 e non era mai arrivata su GitHub: era rimasta sul ramo di sicurezza, e per di più col numero 127, che una card del 19 agosto aveva già. L'ho rimessa in coda col primo numero libero. Il controllo del sito non ho potuto rifarlo da questa sessione: la chiamata verso l'esterno viene bloccata. Quello che ho potuto vedere è il DNS, e punta ancora a Render (216.24.57.1), coerente con quanto scritto qui. | manuale | in attesa | Ogni giorno che passa, chi cerca MyCity trova un sito morto. Può essere un cliente, un negoziante, o un giornalista. È un danno di credibilità che cresce col tempo. Oggi non c'è ancora un ordine vero da perdere: i negozi sono in pausa concordata fino al 24/8-1/9. | Appena rispondi ai 3 punti preparo il fix pronto. Può essere riattivare Render. Oppure completare Vercel con le variabili mancanti e poi ripuntare il DNS, solo a deploy verificato verde. La firma finale resta comunque tua: tocca produzione. |
| 169 | 2026-08-24 12:35 | @tech | Merge PR #840 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/840 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 170 | 2026-08-24 13:37 | @tech | Merge PR #841 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/841 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 171 | 2026-08-24 13:57 | @tech | Merge PR #842 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/842 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |

---

### ✅ #173 — La coda era troppo lunga e il guardiano non riusciva a leggerla · ⏳ accodata 2026-08-24 12:50 · fatta 2026-08-24 15:10

**In parole semplici.** La coda delle cose da approvare aveva superato i **264.000 caratteri**, e il
controllo che verifica «ogni allarme scritto è arrivato a Nicola?» si ferma a 200.000. Si dichiarava
cieco, e sul server quel «non lo so» faceva fallire ogni consegna. **Adesso è verde.**

**Cosa ho fatto.** Le card già chiuse sono uscite dalla coda e vivono in un file loro:
`MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md`. La coda viva è scesa a **173.000
caratteri**, sotto il tetto, e il guardiano la legge di nuovo tutta.

**Perché non ho alzato il tetto, che sarebbe stato più semplice.** Perché era già stato provato il
22 agosto e rimesso indietro, con questa frase scritta dentro il guardiano: *una soglia che sale è
la mossa che nasconde i problemi, e un lettore fra sei mesi non può distinguere la tua buona ragione
da una scusa.* La cura vera non era il tetto: era il file.

**Cosa cambia per te.** Niente in quello che vedi: la Cabina mostra solo le card in attesa e scarta
già quelle chiuse. Se cerchi una card vecchia, adesso sta nell'archivio — non è buttata, è spostata.

**Cosa ho verificato.** Ho fatto girare tutta la suite dopo lo spostamento: **un solo lettore su 406
file si è rotto**, il controllo sulle azioni congelate, che cercava una domanda finita in archivio.
L'ho riparato perché legga coda e archivio insieme, e ho provato al contrario che diventi ancora
rosso se quella domanda sparisce davvero. Il motore della pulizia adesso rilegge l'archivio vecchio
prima di riscriverlo: due corse di fila non perdono niente. Cancello intero: il controllo che era
cieco esce 0.

**Cosa non ho verificato.** Gli script del server che leggono la coda (`giro.sh`,
`riconcilia-memoria.sh`) li ho letti, non eseguiti: qui non c'è `bats`, quindi le prove in shell non
girano. Li nominano solo nei commenti, ma la prova vera la darà il primo giro del worker.

---

### ✅ #174 — Due comandi per il database, e l'ordine conta · ⏳ accodata 2026-08-24 16:10 · ✔️ FATTA 2026-08-26 17:41

> **Fatta tutta, e verificata.** Il primo comando era già dato il 25/8. Il secondo l'avevo **fermato
> apposta**: la condizione che avevo scritto io nominava un posto solo (il Pannello), mentre nella coda
> scrivono in quattro punti, e tre stanno sul server. Darlo in quel momento avrebbe fatto fallire ogni
> ri-accodamento — il danno che questa card diceva di voler evitare, causato dalla card stessa.
>
> **Cosa ha sbloccato l'attesa.** Non una supposizione: una misura. La macchina scrive nella coda una
> volta al giorno verso le 11 (ora di Piacenza). Stamattina ha scritto **cinque righe alle 11:01**, e
> **tutte e cinque portano il campo nuovo**. Cioè il server sta girando col codice giusto — provato dai
> dati, non dedotto.
>
> **Com'è adesso.** 3.281 righe, nessuna senza il negozio, e il campo è diventato **obbligatorio**.
> Provato in tutti e due i versi: una riga scritta senza il negozio viene **respinta**, una scritta con
> il negozio **passa**. La riga di prova l'ho tolta subito, il conto è tornato identico.
>
> **Ritorno indietro con una riga sola**, se mai servisse:
> `alter table public.lavori alter column negozio_id drop not null;`

**In parole semplici.** La macchina delle botteghe deve servire tanti negozi con un programma solo.
Perché funzioni, ogni lavoro nella coda deve dire a quale negozio appartiene. Oggi non lo dice: la
tabella dei lavori quel campo non ce l'ha proprio. Sono 3.255 righe, nessuna con un negozio.

Il codice il muro ce l'aveva già. La tabella no. E finché la tabella non ce l'ha, il muro tiene solo
per chi passa dalla porta giusta: chi scrive nella coda in un altro modo lo scavalca senza
accorgersene, e nessuno se ne accorge nemmeno dopo.

**Cosa ho fatto io.** Il Pannello adesso scrive sempre il negozio. Chi non ne dichiara uno sta
chiedendo un lavoro della macchina per sé. E lo dice con un nome, «centro», invece di lasciare il
campo vuoto. Un campo vuoto si dimentica. Un nome no.

**Cosa cambia per te.** Niente, finché non dai i due comandi qui sotto. Dopo il secondo, la coda dei
lavori non accetta più una riga senza negozio. È il pezzo che mancava per far partire la macchina
delle botteghe.

**Per esempio, una cosa che ho trovato leggendo.** Quando il database rifiuta una riga, il Pannello
riprovava a scriverla togliendo il campo che dava fastidio. Per il raggruppamento della chat va
bene: si perde un dettaglio estetico. Sul negozio sarebbe stato il difetto stesso, automatizzato:
«il database non vuole la riga col negozio? allora scrivila senza». Il lavoro di una bottega
finirebbe nel mucchio comune, in silenzio, e la riga risulterebbe scritta bene. Adesso quel ripiego
vale solo per i lavori della macchina.

**Cosa devi fare.** Due comandi nel database della memoria, e l'ordine conta.

Il primo lo puoi dare adesso, non rompe niente:

`pannello/sql/lavori-negozio-id.sql`

Aggiunge il campo, scrive «centro» sulle 3.255 righe che ci sono già, crea l'indice. Il Pannello di
oggi ignora il campo nuovo e continua a funzionare come sempre.

Il secondo **solo dopo** che questa richiesta di unione è andata online:

`pannello/sql/lavori-negozio-id-obbligatorio.sql`

**Cosa cambia:** è il secondo comando a chiudere il buco. Da lì in poi, chi prova a scrivere un
lavoro senza dire di quale negozio è, non ci riesce. Prima ci riusciva.

**Perché l'ordine conta, e non è pignoleria.** Il Pannello che è online adesso il negozio non lo
scrive. Se dai il secondo comando prima che il Pannello nuovo sia pubblicato, ogni creazione di
lavoro fallisce: chat, giri, report, sentinelle. La macchina si ferma. L'avvertenza è scritta anche
dentro il file, in cima.

**Se va bene:** il muro fra i negozi esiste anche nella tabella. Allora si può costruire il secondo
pezzo: quello che fa rifiutare al database le righe di un altro negozio.

**Cosa non ho verificato.** I due comandi non li ho eseguiti: il database è in sola lettura per me,
e questa è una firma tua. Quindi non ho visto la colonna comparire né l'obbligo mordere. Quello che
ho provato è il lato codice: 9 controlli, e ho rotto il fix in 6 modi diversi per vedere se il
controllo diventava rosso ogni volta. Diventa rosso ogni volta.

---

<!-- unione-pr-244-bloccanti -->
### ✅ #183 — Unisci la riparazione dei quattro bloccanti, e applica la migrazione al database vero · FATTA 2026-08-29 00:40

**Stato: fatta tutta e due le parti.** La (a) l'hai unita tu. La (b) l'ho eseguita io col tuo via, in
una transazione sola sul database di produzione. Misura prima: un visitatore senza account vedeva 0
prodotti su 5. Misura dopo: ne vede 5, e la ricerca «pane» risponde. Quello che era chiuso resta
chiuso: profili 0, visite 0, ordini 0.

**Applicata come ponte, non come 129.** La produzione era indietro di quattro migrazioni e la 128
cambia la firma di una funzione: il file del repo sarebbe fallito a metà. Registrata col nome
`129p_ponte_produzione_catalogo_visibile`, così il rilascio ordinato 126→127→128→129 resta intatto.
Dettagli in [[DECISIONI]].

**In parole semplici.** I quattro problemi bloccanti trovati dalla radiografia del 27 agosto sono
riparati. Il lavoro sta in una richiesta di unione sul sito, la numero 244. Finché non la unisci tu,
non tocca niente: il sito pubblicato è ancora quello di prima, col catalogo invisibile a chi non ha
l'account.

**Per esempio.** Oggi una cliente che apre il sito dal telefono senza account clicca sulla focaccia
di Pane Quotidiano e legge «Prodotto non trovato». Dopo l'unione, e dopo il passo del database qui
sotto, quella cliente la focaccia la vede e la può comprare.

**Cosa cambia per te.** Finché la 244 resta aperta, il sito pubblicato è quello di prima. Chi arriva
senza account continua a leggere «Prodotto non trovato». Dopo l'unione, e dopo il passo (b), quella
persona vede il catalogo e può ordinare. Cambia anche l'avviso al negoziante: gli arriva a ogni
ordine, pure quando la macchina si spegne subito dopo il pagamento.

**Cosa devi fare.** Due cose, in quest'ordine.

**(a) Unisci la richiesta 244** su GitHub. Tutti e sei i controlli sono verdi. Non ci sono
conflitti. Attenzione: unire su `main` fa partire da solo la pubblicazione in produzione. Succede
perché il cancello del rilascio è ancora spento. Quindi qui unire vuol dire pubblicare: fallo quando
puoi guardare il sito nei minuti dopo.

**(b) Applica la migrazione al database vero.** Il file si chiama
`migrations/129_il_catalogo_si_vede_senza_account.sql`. Va eseguito nella finestra dei comandi del database
(l'editor SQL di Supabase), sul progetto di produzione. Senza quel passo il catalogo resta invisibile. La riparazione del primo
bloccante vive lì dentro, non nel codice. Le altre tre funzionano già con la sola unione.

Se preferisci, il passo (b) te lo preparo io con backend-dev. Ti do il testo da incollare.
L'esecuzione sul database dei clienti resta tua.

**Cosa non ho verificato.** La migrazione del passo (b) non ha mai girato sul database dei clienti:
l'ho provata solo su una copia ricostruita qui dentro, dove ha retto anche con degli ordini dentro.
Non ho visto nessuna pubblicazione partire, quindi non so quanto ci mette. Restano aperte le
domande della card #181.

**Cosa cambia:** oggi un negozio che rifiuta un ordine pagato con la carta tiene i soldi di chi ha
comprato, e il cliente legge «niente addebiti». Dopo l'unione il rimborso parte da solo.

**Se va bene:** dopo l'unione controllo che la pubblicazione sia andata a buon fine. Poi ti dico se
il catalogo risponde a un visitatore.

---

<!-- catalogo-invisibile-anon -->
### ✅ #181 — Apri il sito in finestra anonima e dimmi se vedi un prodotto · RISPOSTA TROVATA 2026-08-29 00:30

**Non serve più che lo apri tu.** Applicando la migrazione ho potuto leggere il database di produzione
con gli occhi di un visitatore, ed è la stessa domanda: vedeva **0 prodotti su 5**. Il difetto era vivo,
non era una bomba già disinnescata. Adesso ne vede 5.

**In parole semplici.** La radiografia di stasera ha trovato un difetto che, se è vero anche sul
sito pubblicato, spegne il negozio intero. Chi arriva senza aver fatto l'accesso non vede nessun
prodotto. Non vede recensioni. La ricerca gli torna vuota. I negozi in home invece si vedono, e
questo è l'inganno: la prima pagina si riempie, e sembra che il sito funzioni.

Il collega che l'ha trovato non l'ha dedotto. Ha ricostruito il database da zero, con tutte e 129
le istruzioni salvate nel progetto. Ci ha messo dentro un negozio approvato e un prodotto
disponibile. Poi ha letto le stesse cose che legge il sito, con gli occhi di un visitatore. Ha
contato zero ovunque. Le stesse righe, lette da proprietario, ci sono tutte.

**Cosa cambia per te.** Facciamo un caso vero. Pane Quotidiano mette in vetrina la focaccia. Una
cliente vede il post, apre il sito dal telefono, non ha un account perché è la prima volta. Vede il
negozio, clicca sulla focaccia, legge «Prodotto non trovato» e chiude. Per lei MyCity è un sito
rotto, e non torna. Se il difetto è vivo in produzione, oggi il sito non può incassare un euro.

**Cosa devi fare.** Un minuto, e lo puoi fare adesso dal telefono. Apri il sito in una finestra
anonima del browser, senza fare l'accesso. Clicca un prodotto qualunque. Dimmi cosa vedi.

**Se va bene:** se il prodotto lo vedi, l'incendio non c'è. Resta però una cosa da riparare: vuol
dire che il sito pubblicato e il codice non dicono la stessa cosa. La prossima pubblicazione può
spegnerlo davvero. Se invece leggi «Prodotto non trovato», ti preparo la riparazione stanotte con
il collaudo vero. La firmi tu prima che tocchi il sito.

**Cosa non ho verificato.** Il sito pubblicato, in nessun punto. Da qui non lo raggiungo: tutto
quello che so è misurato sul codice e sul database ricostruito dalle istruzioni del progetto. È
esattamente per questo che la prova la devi fare tu, e vale più di qualsiasi altra cosa scritta
stasera.
