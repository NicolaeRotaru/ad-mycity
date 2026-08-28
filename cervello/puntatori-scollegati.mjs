#!/usr/bin/env node
// 🧭 IL CODICE SI SPOSTA, I PUNTATORI RESTANO INDIETRO — le prove che non nominano più il difetto
// che dimostrano. 🟢 Sola lettura: non scrive niente, non tocca git, non legge la storia.
//
// IL DIFETTO CHE CHIUDE (AR-798). Misurato il 23/8/2026 sul cantiere vero: 787 schede, 592 con una
// prova a comando. 540 puntatori su 592 (91%) sono ANCORATI — il file che il comando esegue nomina
// l'AR della scheda. Cinquantadue no. E di quei cinquantadue il cancello del lotto oggi ne prende
// ZERO.
//
// IL CASO VERO, uno per tutti: AR-689. La sua prova è
// `node cervello/test/segreto-in-un-nome-con-l-accento.test.mjs`, e quel file non contiene la
// stringa «AR-689» da nessuna parte: cavalca il caso di un'altra scheda. Il giorno in cui quel caso
// viene spostato in un file suo, la prova di AR-689 gira ancora, esce ancora 0, e non guarda più
// niente — e in questa casa non si muove un solo numero.
//
// PERCHÉ È UN VERDE E NON UN ROSSO — eseguito, non dedotto (node v22.22.2):
//     node cervello/sparito.mjs                  → exit 1   (il file che sparisce è rumoroso)
//     node --test <file che esiste, ZERO casi>   → exit 0   ← QUI
//     node --test "<glob che non prende niente>" → exit 0   ← E QUI
// Se il file SPARISCE la macchina se ne accorge — così credevo, e la riga qui sotto racconta come
// ho scoperto che è vero solo per una scheda su cinquanta. Ma se il file RESTA e il caso dentro se
// ne va — che è precisamente cosa succede quando si estrae una funzione in un modulo nuovo e ci si
// portano dietro i suoi test — il comando gira, esce 0, e non ha guardato niente.
//
// Uso:
//   node cervello/puntatori-scollegati.mjs
//   node cervello/puntatori-scollegati.mjs --json
//
// Uscita (contratto guardiani, AR-322) — e sta QUI in alto per forza, non per gusto: `eGuardiano`
// in `guardia-viva.mjs` cerca il contratto nelle prime 80 righe (RIGHE_INTESTAZIONE), e un
// guardiano che lo scrive più in basso smette di essere riconosciuto come guardiano, in silenzio.
// Misurato mentre riparavo questo file: allungando l'intestazione il contratto è finito a riga 117
// e `node cervello/guardia-viva-check.mjs` è passato a EXIT=1 («voci del registro che parlano di
// strumenti che non esistono più»). Chi allunga queste righe rilanci quel comando.
//   0 = puntatori scollegati sotto o pari al tetto: debito dichiarato, non allargato
//   1 = il debito si è allargato, e adesso il debito è DUE numeri: gli scollegati sopra il loro
//       tetto, oppure i ⚪ della sorveglianza sopra il loro (`puntatori_ciechi`, AR-878)
//   2 = non ho potuto misurare. Cioè: registro assente/illeggibile/vuoto · un file di prova che non
//       si legge · un file di prova che NON ESISTE · un comando che non nomina nessun file · il
//       tetto illeggibile · zero file controllati in tutto. Nessuno di questi è «zero scollegati»:
//       ⚪ non è verde. Da AR-878 i ⚪ della sorveglianza hanno anche un TETTO: restano ⚪ finché
//       stanno sotto, e diventano 1 quando salgono. Il ⚪ del tetto illeggibile no — un tetto che
//       non ho potuto leggere non può giudicare se stesso.
//
// ⚠️ AR-878 — I ⚪ AVEVANO UN NUMERO E NON AVEVANO UN LIMITE, E GLI SCOLLEGATI SÌ.
// Il buco è nella forma del verdetto, non in un caso particolare: un file di prova rinominato o
// cancellato — cioè PROPRIO l'evento che questo guardiano sorveglia — sposta una scheda dalla
// colonna «so dire di no» alla colonna «non ho potuto misurare», e da lì in poi quel numero
// poteva salire quanto voleva senza che niente diventasse rosso: uscita 2 con uno, uscita 2 con
// cinquanta. È la stessa malattia che questo file cura sugli scollegati (il `git mv` che faceva
// scendere il conto da 52 a 42), rifatta sull'altra colonna. Adesso i ⚪ hanno il loro tetto in
// `cervello/tetti-lotto.json` → "puntatori_ciechi", e la decisione sta in una funzione pura che
// un test esegue: `tettoDeiCiechi`.
//
// LA PORTA CHIUSA, ED È LA RAGIONE DEL DEFAULT: se la chiave NON c'è, il tetto vale **0**, non
// «nessun tetto». Toglierla — o scriverci dentro qualcosa che non è un intero ≥ 0 — rende il
// freno più severo, mai più mite. È la voce 9 del catalogo delle scorciatoie («il tetto che
// risale», variante: togli la chiave e il minimo riparte da zero) presa dal verso giusto: qui
// toglierla costa un rosso, non lo compra. Misurato il 28/8: con la chiave assente e 0 ⚪ il
// verdetto resta 0; con la chiave assente e un solo file di prova cancellato diventa 1.
//
// ════════════════════════════════════════════════════════════════════════════════════════════════
// LE TRE RIPARAZIONI DOPO LA BOCCIATURA (verifica avversariale del 23/8/2026, due lenti, entrambe
// ROTTO). Le prime due hanno una radice sola: DUE PORTE PER LO STESSO STATO DI IGNORANZA, MANDATE
// IN DIREZIONI OPPOSTE.
//
// ① UN FILE CHE MANCA VALEVA «ZERO SCOLLEGATI» INVECE DI «NON HO MISURATO». Un file di prova
//    ILLEGGIBILE finiva fra i `ciechi` (uscita 2); un file ASSENTE finiva fra i «saltati», e i
//    saltati non entravano in nessun verdetto — `verdettoPuntatori` riceveva solo `quanti` e
//    `ciechi`. Conseguenza MISURATA sul repo vero, non temuta: rinominando UN file di prova
//    condiviso da 23 schede (`git mv` di un test, il refactor più comune che ci sia) il conto
//    scendeva da 52 a 42, l'uscita restava 0 e il freno stampava «abbassa il tetto». Premiava
//    esattamente la mossa che deve punire: abbassato il tetto in buona fede, dieci puntatori rotti
//    veri sparivano dal conto per sempre e 23 schede restavano a puntare un file che non c'è.
//    Adesso un puntatore che non arrivo a leggere è un ⚪, mai uno zero: uscita 2.
//
//    LA DIFESA CHE AVEVO SCRITTO ERA FALSA, e l'ho verificata falsa a runtime invece di crederci.
//    Scrivevo «il file che non esiste lo prende già `proveOrfane`»; `cancello-lotto.mjs` alla riga
//    674 chiama `proveOrfane(aperti, esiste)` — solo le schede APERTE — e delle 592 prove a comando
//    578 stanno su schede CHIUSE:
//        prove a comando: 592 | su schede NON aperte: 578 (98%)   ← misurato sul cantiere vero
//    Cioè il 98% della popolazione che dichiaravo sorvegliata non aveva NESSUN guardiano
//    sull'esistenza del file puntato. È lo stesso ragionamento che uso per giustificare questo
//    freno — «la scheda CHIUSA è la più esposta, perché auto-fix non rilegge mai un difetto
//    chiuso» — che avevo applicato al contrario nel punto in cui mi faceva comodo. Il rimando è
//    morto: quel caso adesso è mio, e lo dichiaro ⚪.
//
// ② IL VERDE MUTO. Con zero file controllati il freno non taceva, PARLAVA: «ogni prova nomina
//    ancora il difetto che dimostra», e «scesi da 52 a 0: abbassa il tetto». Il denominatore
//    c'era nel JSON (AR-660, ed è il motivo per cui l'avevo messo) ma non toccava l'uscita.
//    Adesso `controllati === 0` è cieco, e il parametro `controllati` di `verdettoPuntatori` ha
//    il default 0 APPOSTA: chi si dimentica di passarlo ottiene ⚪, mai un verde.
//
// ③ IL TETTO NON PUÒ NASCERE GIÀ SUPERATO. La prima consegna portava 52, misurato sull'albero che
//    avevo sotto le dita — un albero che NON conteneva la scheda del lotto in cui questo freno
//    nasce: montato il lotto il conto saliva, il cancello usciva 1 e si bloccava per tutti. È la
//    malattia AR-506/511/514/526/534 — un freno che nasce rosso per sempre — rifatta mentre la si
//    curava. Il tetto è la misura sull'albero CHE IL CANCELLO VEDRÀ, non su quello di prima del
//    montaggio, e a tenerlo onesto c'è un caso di prova che monta la scheda in arrivo e pretende
//    `quanti <= tetto`: se domani qualcuno riabbassa il tetto sotto quella misura diventa rosso quel
//    caso — con scritto cosa fare — invece del cancello di tutti, senza spiegazioni.
//    (La seconda consegna montava anche le schede delle ALTRE corsie del lotto, leggendole da
//    `mutanti.json`, e ci tarava sopra il tetto: così il proprio numero dipendeva dal lavoro di
//    qualcun altro e si rompeva se quella corsia cambiava file o spariva. Adesso monto solo la mia —
//    vedi «IL TETTO, e COME SI RICALCOLA» più sotto.)
// ════════════════════════════════════════════════════════════════════════════════════════════════
// LE TRE RIPARAZIONI DELLA TERZA VERIFICA (23/8/2026). Le prime due riparazioni reggevano — sono
// state rigiocate una per una da chi verificava e sono vere — ma il NUMERO non era la quantità che
// diceva di essere: gli mancava una forma del difetto e gli avanzavano sei accuse false.
//
// ④ IL FRENO NON VEDEVA LA MOSSA CHE GLI DÀ IL NOME. L'estrazione ha due forme. Nella prima il caso
//    emigra E l'intestazione se ne va con lui: il file smette di nominare il difetto, e lì il freno
//    è rosso — è la forma che il caso di prova metteva in scena. Nella seconda il caso emigra e
//    L'INTESTAZIONE RESTA — ed è la forma normale in questa casa, perché il mandato con cui si
//    consegna un lotto dice «in cima al file il commento che racconta il difetto vero che chiude».
//    Lì il file nomina ancora il difetto, il freno esce 0 e stampa «✅ ogni prova a comando nomina
//    ancora il difetto che dimostra» sopra il difetto in funzione: la frase esatta che questo freno
//    esiste per rendere impossibile. Misurato su due schede e due file da chi verificava: EXIT=0
//    mentre `node --test uno.test.mjs` usciva 0 senza guardare più niente.
//    NON È UN ANGOLO: dei 540 ancoraggi verdi di allora, 219 (il 41%) poggiavano SOLO su righe di
//    commento — per quelli il caso può emigrare tutto e io resto verde.
//    COSA HO FATTO, ed è la cura minima onesta e non la cura completa: i due numeri adesso sono
//    SEPARATI e stanno accanto al verde, e il limite è un CASO DI PROVA che mette in scena proprio
//    quella variante e asserisce che NON la vedo — invece di una frase mite in fondo a un commento.
//    PERCHÉ NON L'HO RESA ROSSA, con il numero che ha deciso: pretendere l'ancoraggio nel codice
//    vorrebbe dire far salire il conto da 46 a 267 e, soprattutto, bocciare ogni scheda nuova che
//    nomina il suo difetto solo nell'intestazione — che è il 42% delle ultime 60 schede ancorate
//    (25 su 60, misurato). Sarebbe un freno che nasce verde e diventa rosso al lotto dopo per il
//    lavoro di qualcun altro: la malattia AR-506/511/514/526/534 con la miccia lunga. Quindi resta
//    un BUCO DICHIARATO, con il suo numero in chiaro a ogni corsa.
//    ⚠️ E IL NUMERO CHE AVEVO SCRITTO QUI ERA SBAGLIATO DALLA PARTE COMODA: lo corregge ⑦.
//
// ⑤ SEI ACCUSE ERANO FALSE, e chi verificava le ha smontate ESEGUENDOLE. AR-550…AR-555 portano il
//    proprio id DENTRO il comando: `node --test cervello/test/sorvegliante.test.mjs && node
//    cervello/non-vacuita.mjs --difetti AR-550`. Quella seconda metà nomina AR-550 e va a rompergli
//    il fix apposta — eseguita: EXIT=0, «tutte e 2 le mutazioni rendono rosso il loro test». Dire di
//    quel comando «non guarda più niente» era il contrario di quello che fa. Adesso l'ancoraggio si
//    cerca anche nel COMANDO, e il conto scende da 52 a 46 (tetto 46).
//    Restano 18 accusati che hanno in `mutanti.json` una mutazione che lega quella scheda a quel
//    file — fra loro AR-689, il testimone principale di questo freno. Per loro la riga onesta non è
//    «non guarda niente» ma «ancorato in mutanti.json, ma non lo esegue nessuno finché il lotto non
//    tocca quel difetto», e adesso è quella che stampo. La lettura di `mutanti.json` è SOLO
//    didascalia: non tocca il conto, né il tetto, né l'uscita — se non si legge lo dico e vado
//    avanti. (È anche ciò che mi tiene indipendente da chi scrive in quel file nello stesso lotto.)
//
// ⑥ LA PORTA DEL «NIENTE COMANDO», detta dove si legge il numero. Convertire le schede accusate a
//    `verifica:{tipo:"umano"}` faceva scendere il conto in silenzio e il freno rispondeva «abbassa
//    il tetto»: misurato, 53 → 0 con EXIT=0, e sei guardiani fratelli non se ne accorgevano. È la
//    stessa forma del `mv` della prima bocciatura, da un'altra porta. Adesso la popolazione ha un
//    riferimento dichiarato (`puntatori_popolazione` in `tetti-lotto.json`): se cala, l'invito ad
//    abbassare il tetto NON si dà e il motivo dice quante schede hanno smesso di avere una prova a
//    comando. Non blocca — le conversioni a verifica umana sono legittime, e un rosso qui sarebbe
//    falso — ma il tetto non si abbassa più al buio.
//
// ════════════════════════════════════════════════════════════════════════════════════════════════
// LE TRE RIPARAZIONI DELLA QUARTA VERIFICA (23/8/2026). Il motore non è stato toccato: due lenti
// l'hanno montato in un clone superficiale e nel cancello intero, e il suo passo è verde. Quello che
// era rotto è IL NUMERO che stampavo accanto al verde, e le due porte da cui il verde si comprava.
//
// ⑦ IL NUMERO DELLA CECITÀ ERA SBAGLIATO DALLA PARTE COMODA — ed è la riparazione principale.
//    Stampavo «221 SOLO da una riga di commento (40%): su queste ultime il caso può emigrare tutto e
//    io resto verde». Quel «su queste ultime» prometteva che sulle altre 325 l'estrazione si vedeva.
//    NON ERA VERO, e la misura è di chi verificava: dei 319 contati «dal codice del file», 303
//    portano il nome ANCHE nell'intestazione — e l'intestazione all'estrazione NON si muove, perché
//    il mandato di casa vuole il commento in cima. Contando solo gli ancoraggi che sopravvivono
//    davvero, i ciechi erano 445 su 546 — l'81%, non il 40%.
//    LA CURA: la copertura non si stima più da «dov'è la stringa» ma da «l'estrazione porta via
//    questo ancoraggio o no?», e la risposta ha TRE valori invece di due (`doveAncora`):
//      · CIECO CERTO   — il nome sta nell'INTESTAZIONE (o l'ancoraggio è dal comando): resta lì
//                        qualunque cosa emigri, quindi resto verde e non ho guardato niente;
//      · GRIGIO        — il nome sta fuori dall'intestazione ma non solo sulle righe dei casi: può
//                        emigrare col caso o restare, e NON LO SO;
//      · VISTO         — il nome sta SOLO sulle righe che aprono i casi (`test(`/`it(`/`describe(`/
//                        `prova(`): se il caso emigra, il file smette di nominarlo → divento rosso.
//    MISURATO sul cantiere vero il 23/8 con le funzioni di questo file (546 ancorate):
//        cieche certe 436 (80%) · grigie 101 (18%) · VISTE 9 (2%)
//    Il 436 e il 445 di chi verificava sono lo stesso numero contato con due righelli: lui chiamava
//    intestazione le prime 40 righe, io il blocco di commento CONTIGUO in cima — che su un file di
//    prova finisce spesso alla riga 11, dove cominciano gli import. Le nove schede di differenza
//    hanno il nome dopo gli import: io le metto fra le GRIGIE, non fra le cieche, perché lì
//    onestamente non so. È il verso giusto: il pavimento certo lo tengo basso e lo dichiaro.
//    Cioè: l'estrazione la vedo con certezza su 9 schede su 546, e al massimo su 110 (20%). Il 40%
//    che stampavo era il doppio buono della verità. Adesso il verde porta addosso QUESTI numeri.
//    Il caso «LA VARIANTE SCOMODA» nella prova mette in scena la forma che questa casa produce
//    davvero — il caso emigra, l'intestazione resta — e pretende che il freno la dichiari ⚪ invece
//    di stampare copertura: se domani qualcuno rimette il numero comodo, quel caso diventa rosso.
//
// ⑧ DUE SCORCIATOIE COMPRAVANO IL VERDE SENZA TOCCARE UNA RIGA DI CODICE VERO. Tutte e due eseguite
//    da chi verificava, tutte e due rigiocate da me prima di curarle (comando e uscita nella prova).
//    · IL CAMPO COMANDO. Appendere ` --ar-319` al `verifica.comando` della scheda AR-319 — forma che
//      la casa dichiara valida — faceva scendere il conto da 46 a 45 con la popolazione ferma, e il
//      freno rispondeva «abbassa il tetto a 45». Stesa su tutte, il debito andava a zero.
//      LA CURA: `ancoraggioDalComando` non guarda più se la stringa c'è, guarda se quel comando
//      ESEGUE qualcosa che riguarda quel difetto. Servono DUE cose insieme: ① il nome sta in un
//      SEGMENTO che esegue un file DIVERSO da quello puntato (cioè è un secondo comando, non una
//      bandierina appesa a quello che gira il test), ② il nome è un'opzione o il valore di
//      un'opzione, non un token nudo. Le sei vere passano (`… && node cervello/non-vacuita.mjs
//      --difetti AR-550`), ` --ar-319` no, `&& echo AR-319` no (non esegue nessun file).
//      QUEL CHE RESTA, detto col numero: `&& node cervello/non-vacuita.mjs --difetti AR-319` è un
//      secondo comando vero e passerebbe — solo che eseguito su un difetto senza mutazione ESCE 2
//      (misurato), quindi rende rossa la prova stessa della scheda: non è un verde gratis.
//    · LA RIGA DI COMMENTO. Scrivere `// AR-319` in un punto qualunque del file faceva scendere il
//      conto da 46 a 45. QUESTA NON LA SO DISTINGUERE, e lo dico invece di far finta: ho misurato
//      cosa costerebbe rifiutare i commenti fuori dall'intestazione e lontani dai casi — 38 schede
//      vere perderebbero l'ancoraggio, e sono commenti di sezione legittimi
//      (`// ── AR-509: il giudizio sulla riparazione ──`). Un freno che accusa 38 volte a vuoto lo si
//      aggira al secondo giro. Quindi l'ancoraggio da commento resta valido per il CONTO, ma è
//      USCITO DALLA COPERTURA DICHIARATA (⑦): non lo chiamo più «coperto», lo chiamo cieco. È un
//      buco col suo numero, non una spunta verde sopra una malattia viva.
//
// ⑨ IL ROSSO INSEGNAVA LA MOSSA SBAGLIATA. Il consiglio stampato era «o scrivi `// AR-nnn` accanto
//    al caso che è emigrato»: letto alla lettera non funziona (il file dove il caso È emigrato
//    nominava AR-131 sette volte e il freno restava rosso), e l'unica lettura che toglie il rosso è
//    scrivere il nome nel file dove il caso NON c'è più — cioè lavarsi. Un rosso che insegna a
//    lavarsi è peggio di un rosso muto. Adesso restano le due mosse oneste — riportare il caso, o
//    spostare il puntatore della scheda sul file nuovo — e la terza è scritta come ciò che è: la
//    mossa che mi zittisce senza riparare niente.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// IL TETTO, e COME SI RICALCOLA (la domanda della terza verifica: «oggi è un pareggio esatto senza
// margine»). Si lancia questo freno sul cantiere di oggi PIÙ la sola scheda del PROPRIO lotto e si
// prende `quanti`: 46. Le schede delle ALTRE corsie non si montano — la seconda consegna lo faceva
// (tetto 53, che teneva dentro AR-797 → `cervello/test/due-case.test.mjs`, di un'altra corsia) e
// così il proprio tetto dipendeva dal lavoro di qualcun altro. Margine ZERO è la scelta giusta e non
// una svista: un margine sarebbe debito regalato in anticipo. Se una corsia consegna un puntatore
// non agganciato il conto sale di uno e questo freno lo dice col nome giusto — è il comportamento
// voluto, con un fix da una riga, non un difetto del tetto.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// COSA C'ERA GIÀ, perché quasi tutto c'era e dirlo è metà del lavoro. La regola dell'ancoraggio non
// l'ho inventata io: è del lotto 11 e vive in `cancello-lotto.mjs` (`proveCondiviseCieche`). Ma ha
// due restrizioni scritte nero su bianco: gira solo sulle schede APERTE, e solo se DUE O PIÙ difetti
// condividono lo stesso comando. Le 52 stanno tutte fuori da lì — 51 sono chiuse, 1 (AR-780) è
// aperta ma il suo comando non lo condivide con nessuno. E la scheda CHIUSA è la più esposta di
// tutte, perché `auto-fix.mjs` non rilegge mai un difetto chiuso: un puntatore che si scollega dopo
// la chiusura non lo rilegge nessuno, mai. Il conto lo dice — 51 su 52 vivono lì.
//
// I DUE FRATELLI, e cosa NON faccio io:
//   · AR-669 — l'altro puntatore, quello di `mutanti.json`. Già coperto DUE volte
//     (`mutazioni-orfane.mjs`, e la regola `prova-accecata` del sorvegliante), e la scheda lo
//     dichiara da sé nel campo `malattia_perche`. Misurato: 718 mutazioni, 0 orfane. Quel lato è
//     pulito e sorvegliato: io sono il FRATELLO sull'altro puntatore, non il sostituto.
//   · AR-680 — la sua prova è ANCORATA, e la sua malattia era un'altra: la FORMA della guardia
//     dell'entrypoint. Da lì non porto via un caso da fermare, porto via un VINCOLO — la guardia in
//     fondo a questo file è scritta nella forma canonica `pathToFileURL(...).href` e non in
//     `file://` + argv[1], che sotto una cartella accentata non combacia e spegne il guardiano in
//     silenzio. In questo vault ci sono 26 file col nome accentato.
//
// PERCHÉ SENZA GIT, ed è una scelta, non una dimenticanza. Distinguere «nato in questo lotto» da
// «ereditato» vuol dire leggere la storia, e in CI il clone è superficiale (--depth): sarebbe un
// controllo che in CI non può essere verde per costruzione — cioè la malattia stessa che stiamo
// curando. Questo freno legge SOLO il registro e i file sull'albero di lavoro, che su un clone
// superficiale ci sono tutti: misura in CI esattamente come sul VPS. (Verificato da un'altra lente
// su un `git clone --depth 1` vero: stessi identici numeri, stessa uscita.) Il prezzo, detto prima
// e non dopo: chi lascia indietro un puntatore MENTRE ne riaggancia un altro tiene il conto fermo e
// passa. Il tetto vede il saldo, non le singole partite. Lo accetto perché l'alternativa è un freno
// cieco in CI.
//
// IL CONFRONTO NON È SENSIBILE AL CASO, apposta. Le prove migrate a
// `node cervello/prove-difetti.mjs --ar-158` scrivono la bandierina minuscola: col confronto
// sensibile al caso risulterebbero scollegate 5 schede ancorate benissimo (AR-158, AR-206, AR-392,
// AR-730, AR-737). Misurato, non temuto — ed è un rosso falso in agguato anche in
// `proveCondiviseCieche`, che confronta col caso. (Nota girata all'AD: non tocco cancello-lotto.mjs.)
//
// ════════════════════════════════════════════════════════════════════════════════════════════════
// I BUCHI, DETTI PRIMA. Quello che segue non lo prendo: è scritto qui perché un buco dichiarato vale
// più di una copertura finta, e perché ognuno di questi è stato MISURATO, non immaginato.
//
// ① L'ESTRAZIONE CON L'INTESTAZIONE LASCIATA AL POSTO SUO — ed è la più grave, perché è la mossa che
//    dà il nome a questo freno. Il caso emigra in un file nuovo, l'intestazione `// AR-nnn — …` resta
//    dov'era: il file nomina ancora il difetto, io esco 0, e la prova non guarda più niente.
//    IL NUMERO VERO, e per due consegne l'ho scritto grande la metà di quello che è: non vale su 221
//    ancoraggi su 546 (il 40%) ma su ALMENO 436 su 546 — l'80% — e al massimo su 537 (98%).
//    Misurato il 23/8 sul cantiere vero con `doveAncora` di questo file:
//        cieche certe 436 (intestazione 430 + comando 6) · grigie 101 · VISTE 9
//    Cioè l'estrazione la vedo con certezza su NOVE schede su 546, e al massimo su 110. Il vecchio
//    40% contava «l'ancoraggio è solo in un commento», che è un'altra domanda: dei 319 che contavo
//    «dal codice», 303 portavano il nome anche nell'intestazione — e l'intestazione non emigra.
//    Perché non l'ho chiuso: chiuderlo vuol dire non chiamare più «ancoraggio» un commento, e
//    boccerebbe il 42% delle schede nuove di questa casa (25 delle ultime 60). Chi lo chiude deve
//    prima cambiare l'abitudine, non il tetto.
// ①bis LA RIGA DI COMMENTO COMPRA IL VERDE, e non la so distinguere. Scrivere `// AR-319` in un punto
//    qualunque di `cervello/test/freni-senza-fonte.test.mjs` porta il conto da 46 a 45 e fa dire al
//    freno «abbassa il tetto» — eseguito, non temuto. Rifiutare i commenti fuori dall'intestazione e
//    lontani da ogni caso toglierebbe l'ancoraggio a 38 schede vere, che usano commenti di sezione
//    legittimi (`// ── AR-509: il giudizio sulla riparazione ──`): un freno che accusa 38 volte a
//    vuoto lo si aggira al secondo giro. Quindi il commento resta valido PER IL CONTO ed è USCITO
//    DALLA COPERTURA DICHIARATA: non lo chiamo più copertura, lo chiamo cecità, col numero di sopra.
// ② IL CASO SVUOTATO. Chi lascia `// AR-nnn` e cancella il corpo del caso non lo prendo: io guardo
//    se il nome c'è, non se sotto c'è qualcosa. Quella difesa è la mutazione in `mutanti.json`.
// ③ IL SALDO, NON LE PARTITE. Chi scollega un puntatore MENTRE ne riaggancia un altro tiene il conto
//    fermo e passa. Il tetto vede il totale. Il prezzo di non leggere git, ed è dichiarato sopra.
// ④ LA CONVERSIONE A VERIFICA UMANA NON LA BLOCCO. La segnalo — l'invito ad abbassare il tetto
//    sparisce e il motivo dice quante schede sono uscite dalla popolazione — ma esco 0 lo stesso,
//    perché ci sono conversioni legittime e un rosso lì sarebbe falso. Chi converte in massa e poi
//    abbassa il tetto a mano riesce ancora a lavare il debito: contro quello c'è il numero scritto,
//    non un freno.
// ⑤ QUESTA È UNA SENTINELLA DI SPOSTAMENTO, NON UNA PROVA CHE IL FIX ESISTA. La domanda è una sola —
//    «questo file nomina ancora questo difetto?» — ed è una ricerca di parole, la forma debole che
//    questa casa condanna. Va benissimo per dire che un puntatore si è scollegato; non dice niente
//    su quanto la prova sia buona. Quella resta il comando che gira, più la sua mutazione.
// ⑥ `parteDiCodice` è un'euristica, e sbaglia per DIFETTO apposta: un id dentro una stringa con `//`
//    o `#` finisce classificato «solo commento», cioè mi attribuisco meno copertura di quella che ho.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//

import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT } from "./git-github.mjs";
// La regola «quale file esegue questo comando» sta in UNA casa sola. Riscriverla qui vorrebbe dire
// due copie che divergono: quella funzione porta già dentro il caso `--import ./cervello/test/
// hook-ts.mjs` (il caricatore scambiato per il test, lotto 33), e la seconda copia non lo saprebbe.
// Verificato che importarla non esegue niente: 26 ms, nessuna stampa.
import { fileDelComando } from "./cancello-lotto.mjs";

const JSON_MODE = process.argv.includes("--json");
const RADICE = process.env.PUNTATORI_RADICE || AD_ROOT;
const CANTIERE = process.env.CANTIERE_FILE || join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const TETTI = process.env.TETTI_FILE || join(RADICE, "cervello/tetti-lotto.json");
const MUTANTI = process.env.MUTANTI_FILE || join(RADICE, "cervello/mutanti.json");

/**
 * Il file di prova NOMINA ancora il difetto che dimostra?
 *
 * Senza sensibilità al caso, e non è un dettaglio: `--ar-158` è la stessa cosa di `AR-158`, e
 * confrontare col caso accuserebbe 5 schede ancorate benissimo. Un guardiano che accusa il giusto
 * si impara ad aggirarlo, ed è finito.
 *
 * Pura, ed è la riga che la mutazione rompe: se torna sempre `true`, tutto risulta ancorato, il
 * conto crolla a zero e il caso rosso della prova diventa verde.
 */
export function ancorata(testo, id) {
  return String(testo).toLowerCase().includes(String(id).toLowerCase());
}

/**
 * La riga tolta la parte che è commento. Serve a una domanda sola, ed è la domanda che ha bocciato
 * la seconda consegna: l'ancoraggio sta nel CODICE, o solo nella prosa dell'intestazione?
 *
 * L'euristica è dichiarata perché è un'euristica: si taglia dal primo `//` o `#`, e una riga che
 * apre o continua un blocco (`*`, `/*`, `<!--`) è commento per intero. Sbaglia per DIFETTO, che è il
 * verso giusto: `const u = "https://x/AR-158"` viene tagliato a `const u = "https:` e la scheda
 * risulta ancorata solo da un commento — cioè mi attribuisco MENO copertura di quella che ho, mai
 * di più. Un'euristica che sbaglia verso il «non so» si può dichiarare; una che sbaglia verso il
 * «ho guardato» è una bugia con l'aria di un dettaglio.
 */
export function parteDiCodice(riga) {
  if (/^\s*(\*|\/\*|<!--)/.test(riga)) return "";
  const tagli = [String(riga).indexOf("//"), String(riga).indexOf("#")].filter((i) => i >= 0);
  return tagli.length ? String(riga).slice(0, Math.min(...tagli)) : String(riga);
}

/**
 * L'ancoraggio poggia SOLO su righe di commento?
 *
 * QUESTO È IL BUCO CHE HA BOCCIATO LA SECONDA CONSEGNA, e da qui in poi è un numero invece che una
 * frase. L'estrazione ha due forme e la differenza non è un cavillo:
 *   · il caso emigra E l'intestazione se ne va con lui → il file smette di nominare il difetto → ROSSO;
 *   · il caso emigra e l'INTESTAZIONE RESTA        → il file nomina ancora il difetto → VERDE, e la
 *     prova non guarda più niente.
 * La seconda è la forma normale in questa casa, perché il mandato con cui si consegna un lotto dice
 * «in cima al file il commento che racconta il difetto vero che chiude»: l'intestazione col nome del
 * difetto è la regola, non l'eccezione. Misurato il 23/8 sul cantiere vero: dei 540 ancoraggi verdi
 * 219 (il 41%) poggiano SOLO su righe di commento, e su quei 219 l'estrazione mi è invisibile.
 * `ancorateSoloCommento` porta quel numero in chiaro accanto al verde, e il caso di prova
 * «IL LIMITE DICHIARATO» lo esercita: non è una frase mite in fondo a un commento, è un'asserzione.
 */
export function ancoraSoloCommento(testo, id) {
  const righe = String(testo).split("\n").filter((r) => ancorata(r, id));
  if (!righe.length) return false; // non è ancorata affatto: è un'altra domanda, e la fa `scollegati`
  return !righe.some((r) => ancorata(parteDiCodice(r), id));
}

/**
 * DOVE FINISCE L'INTESTAZIONE — cioè il blocco di commento in cima al file, quello che il mandato di
 * casa pretende: «in cima al file il commento che racconta il difetto vero che chiude».
 *
 * SERVE A UNA DOMANDA SOLA, ed è quella che ha bocciato la terza consegna: se il caso emigra, questo
 * ancoraggio se ne va con lui o resta? L'intestazione RESTA — sempre, per regola di casa. Quindi un
 * nome scritto lì non è copertura contro l'estrazione: è il posto esatto in cui il freno resta verde
 * mentre la prova ha smesso di guardare.
 *
 * Torna l'indice della PRIMA riga che non è intestazione: shebang, righe vuote e righe di commento
 * contigue in cima; ci si ferma alla prima riga di codice. Un file fatto solo di commenti risulta
 * tutto intestazione — ed è il verso giusto: lì dentro non c'è nessun caso che possa emigrare.
 */
export function fineIntestazione(testo) {
  const righe = String(testo).split("\n");
  let i = /^#!/.test(righe[0] || "") ? 1 : 0;
  for (; i < righe.length; i++) {
    const r = righe[i];
    if (/^\s*$/.test(r)) continue;
    if (/^\s*(\/\/|\/\*|\*|<!--|#(?!!))/.test(r)) continue;
    break;
  }
  return i;
}

/**
 * Una riga che APRE un caso di prova. `prova(` è l'involucro di casa (`esito-cadenza.test.mjs` e
 * fratelli), non un'invenzione: senza di lui quelle schede finirebbero fra le «non so».
 *
 * Il confine delle parole è voluto: `submit(` non è `it(`, `approva(` non è `prova(`.
 */
export function apreUnCaso(riga) {
  return /\b(test|it|describe|prova)\s*\(/.test(String(riga));
}

/**
 * DOVE POGGIA L'ANCORAGGIO — e quindi se l'estrazione me lo porta via o me lo lascia lì.
 *
 * QUESTA FUNZIONE ESISTE PERCHÉ IL NUMERO CHE STAMPAVO ERA SBAGLIATO DALLA PARTE COMODA. Prima
 * dividevo gli ancoraggi in «dal codice» e «solo da un commento» e dicevo che i primi erano coperti.
 * Non lo erano: dei 319 «dal codice» misurati sul cantiere vero, 303 portavano il nome ANCHE
 * nell'intestazione — che all'estrazione non si muove. La domanda giusta non è «di che tipo è la
 * riga» ma «questa riga se ne va insieme al caso?», e ha tre risposte, non due:
 *
 *   "intestazione"  → il nome sta nel commento in cima: RESTA. Sono cieco, con certezza.
 *   "presso_i_casi" → il nome sta SOLO sulle righe che aprono i casi: se ne va col caso. LO VEDO.
 *   "sparso"        → il nome sta altrove (commenti di sezione, costanti, prosa in mezzo al file):
 *                     può emigrare o restare, e NON LO SO. Zona grigia dichiarata, non copertura.
 *
 * L'ordine è la parte che conta: l'intestazione VINCE su tutto. Un file che nomina il difetto sia in
 * cima sia nei casi resta verde anche quando i casi se ne vanno — quindi va contato fra i ciechi,
 * non fra i visti. Sbagliare verso il «non so» è l'unico verso che si possa dichiarare.
 *
 * Torna `null` se il testo non nomina affatto l'id: è un'altra domanda, e la fa `scollegati`.
 */
export function doveAncora(testo, id) {
  const righe = String(testo).split("\n");
  const fine = fineIntestazione(testo);
  const dove = [];
  for (let i = 0; i < righe.length; i++) if (ancorata(righe[i], id)) dove.push(i);
  if (!dove.length) return null;
  if (dove.some((i) => i < fine)) return "intestazione";
  if (dove.every((i) => apreUnCaso(righe[i]))) return "presso_i_casi";
  return "sparso";
}

/**
 * L'id compare nel segmento come OPZIONE, o come valore di un'opzione?
 *
 * `--difetti AR-550` sì, `--ar-158` sì, `AR-550` nudo in fondo a un comando no. È metà della
 * differenza fra «il comando esegue una verifica intestata a quel difetto» e «qualcuno ha appeso una
 * stringa»: un token nudo non seleziona niente, e i due programmi di casa che sanno scegliere un
 * difetto (`non-vacuita.mjs`, `prove-difetti.mjs`) lo prendono per bandierina.
 */
export function idComeOpzione(segmento, id) {
  const pezzi = String(segmento).trim().split(/\s+/);
  for (let i = 0; i < pezzi.length; i++) {
    if (!ancorata(pezzi[i], id)) continue;
    if (pezzi[i].startsWith("-")) return true; // `--ar-158`, `--difetti=AR-550`
    if (i > 0 && pezzi[i - 1].startsWith("-")) return true; // `--difetti AR-550`
  }
  return false;
}

/**
 * L'ANCORAGGIO DAL COMANDO, e adesso vale solo se quel comando ESEGUE qualcosa che riguarda quel
 * difetto.
 *
 * LA PORTA CHE CHIUDE, misurata prima di chiuderla: appendere ` --ar-319` al `verifica.comando` di
 * AR-319 — forma che `comandoAmmesso` dichiara valida, e il comando gira identico — faceva scendere
 * il conto da 46 a 45 con la popolazione ferma a 592, e il freno rispondeva «abbassa il tetto a 45».
 * Zero righe di codice toccate. Stesa su tutte e 46, il debito andava a zero e il freno invitava a
 * mettere il tetto a 0. Era la porta più economica che avessi.
 *
 * Le due condizioni, e servono INSIEME:
 *   ① il nome sta in un SEGMENTO (`&&`, `||`, `;`, `|`) che esegue un file DIVERSO da quello puntato
 *      dalla scheda. Cioè è un SECONDO comando, non una bandierina appesa a quello che gira il test:
 *      `node --test X.test.mjs && node cervello/non-vacuita.mjs --difetti AR-550` sì,
 *      `node X.test.mjs --ar-319` no (stesso file), `&& echo AR-319` no (non esegue nessun file);
 *   ② il nome è un'opzione o il valore di un'opzione, non un token nudo appeso in coda.
 *
 * COSA RESTA APERTO, col numero: `&& node cervello/non-vacuita.mjs --difetti AR-319` passerebbe —
 * è un secondo comando vero. Solo che su un difetto senza mutazione quel comando ESCE 2 (misurato:
 * «non-vacuita: nessuna mutazione per AR-319 → non posso misurare», EXIT=2), quindi rende rossa la
 * prova stessa della scheda. Non è un verde gratis: è un rosso spostato di un metro.
 */
export function ancoraggioDalComando(comando, id, filePuntato = null) {
  for (const pezzo of String(comando).split(/&&|\|\||;|\|/)) {
    if (!ancorata(pezzo, id)) continue;
    const f = fileDelComando(pezzo);
    if (!f) continue; // `&& echo AR-131`: non esegue niente, non può guardare niente
    if (filePuntato && f === filePuntato) continue; // è lo STESSO comando, con l'id appeso
    if (!idComeOpzione(pezzo, id)) continue; // token nudo: non seleziona nessun difetto
    return true;
  }
  return false;
}

/**
 * L'indice `difetto → i file che le sue mutazioni in mutanti.json dichiarano di rompere`.
 *
 * SERVE SOLO ALLA RIGA CHE SI STAMPA. Non entra nel conto, non entra nel tetto, non entra
 * nell'uscita: se `mutanti.json` non si legge, il verdetto è identico e lo dico. Sta qui perché la
 * seconda verifica ha smontato sei accuse ESEGUENDOLE, e ne restano 18 su cui la mia riga diceva
 * una cosa falsa: «il comando gira, esce 0, e non guarda più niente». Per quei 18 una mutazione
 * dichiara di rompere QUEL file per QUELLA scheda — solo che nessuno la esegue finché il lotto non
 * tocca quel difetto (`non-vacuita.mjs` gira sui difetti del lotto). «Nessuno la esegue» e «non
 * guarda niente» sono due frasi diverse, e la seconda non era vera.
 */
export function mutazioniPerDifetto(mutanti = []) {
  const per = new Map();
  for (const m of mutanti || []) {
    const id = String(m?.difetto || "");
    if (!id) continue;
    if (!per.has(id)) per.set(id, new Set());
    for (const tok of String(m?.test || "").split(/\s+/)) {
      if (/\.(mjs|js|sh|ts)$/.test(tok)) per.get(id).add(tok.replace(/^\.\//, ""));
    }
  }
  return per;
}

/**
 * I puntatori che hanno smesso di nominare il loro difetto.
 *
 * @param difetti  le schede del cantiere
 * @param leggi    (percorso) => testo, oppure `null` se non si legge
 * @param esiste   (percorso) => booleano
 * @returns {{scollegati:Array, controllati:number, ciechi:string[], saltati:number}}
 *
 * COSA RESTA FUORI DALLA POPOLAZIONE, ed è l'unica cosa che salto per davvero: la scheda SENZA
 * comando — verifica umana, o prova a pattern. Lì non c'è nessun file che debba nominare niente:
 * non è ignoranza, è un'altra domanda, e sono 195 schede su 787 (misurate il 23/8). Se le contassi
 * fra i ciechi questo freno nascerebbe ⚪ per sempre, che è l'altra faccia dello stesso guasto.
 *
 * TUTTO IL RESTO CHE NON ARRIVO A LEGGERE È ⚪ e finisce nei `ciechi` — uscita 2, mai 0:
 *   · il comando che non nomina nessun file → non so QUALE file dovrebbe nominare il difetto;
 *   · il file puntato che NON ESISTE → non so se nomina ancora il suo difetto (e nessun altro
 *     guardiano lo vede: `proveOrfane` gira solo sugli APERTI, e il 98% delle prove a comando sta
 *     su schede chiuse — misurato, non dedotto);
 *   · il file che esiste e non si legge → idem.
 *
 * `saltati` conta i primi due ed è un SOTTOINSIEME dei `ciechi`: sta lì per dire di che TIPO di
 * ignoranza si tratta, non è più una porta d'uscita dal verdetto. Prima lo era, e bastava un
 * `git mv` per far scendere il conto restando verdi.
 */
export function scollegati(difetti = [], leggi = () => null, esiste = () => false, mutazioni = new Map()) {
  const fuori = [];
  const ciechi = [];
  const cache = new Map();
  let controllati = 0;
  let saltati = 0;
  let popolazione = 0;
  let inCodice = 0;
  let soloCommento = 0;
  let dalComando = 0;
  // I TRE NUMERI DELLA COPERTURA VERA (⑦). Non sono un ornamento del vecchio conteggio: sono la
  // risposta alla domanda «l'estrazione porta via questo ancoraggio?». `cieche` è il pavimento
  // certo, `viste` il soffitto certo, `grigie` quello che onestamente non so.
  let cieche = 0;
  let grigie = 0;
  let viste = 0;
  for (const d of difetti || []) {
    const comando = String(d?.verifica?.comando || "").trim();
    if (!comando) continue; // niente prova a comando: fuori popolazione, non ignoranza
    popolazione++;
    const file = fileDelComando(comando);
    if (!file) {
      saltati++;
      ciechi.push(`${d?.id}: il comando \`${comando}\` non nomina nessun file, quindi non so quale file dovrebbe nominarlo`);
      continue;
    }
    if (!esiste(file)) {
      saltati++;
      ciechi.push(`${file}: non esiste (è il puntatore di ${d?.id}), quindi non so se nomina ancora il suo difetto`);
      continue;
    }
    if (!cache.has(file)) cache.set(file, leggi(file));
    const testo = cache.get(file);
    if (testo === null || testo === undefined) {
      ciechi.push(`${file}: non ho potuto leggerlo, quindi non so se nomina ancora ${d?.id}`);
      continue;
    }
    controllati++;
    if (ancorata(testo, d?.id)) {
      // Ancorata: ma DOVE? La domanda vecchia era «codice o commento», e dava un numero comodo e
      // falso — 303 dei 319 «dal codice» portavano il nome anche nell'intestazione, che
      // all'estrazione resta. La domanda vera è `doveAncora`: questo ancoraggio se ne va col caso?
      if (ancoraSoloCommento(testo, d?.id)) soloCommento++;
      else inCodice++;
      const dove = doveAncora(testo, d?.id);
      if (dove === "presso_i_casi") viste++;
      else if (dove === "sparso") grigie++;
      else cieche++; // "intestazione": resta lì qualunque cosa emigri
      continue;
    }
    // IL COMANDO PORTA IL PROPRIO ID: sei accuse su cinquantadue erano false, e la verifica le ha
    // smontate ESEGUENDOLE, non ragionandoci. `node --test cervello/test/sorvegliante.test.mjs &&
    // node cervello/non-vacuita.mjs --difetti AR-550` nomina AR-550 e va a rompergli il fix apposta:
    // eseguito, EXIT=0, «tutte e 2 le mutazioni rendono rosso il loro test». Dire di quel comando
    // «non guarda più niente» era il contrario di quello che fa. Il puntatore è agganciato dal
    // comando invece che dal file: è un ancoraggio, e si conta come tale.
    if (ancoraggioDalComando(comando, d?.id, file)) {
      dalComando++;
      cieche++; // il comando non emigra mai: l'estrazione qui non la vedo per costruzione
      continue;
    }
    fuori.push({
      id: String(d?.id || "(senza id)"),
      file,
      stato: String(d?.stato || "?"),
      comando,
      // Solo per la riga che si stampa: non cambia il conto, non cambia l'uscita.
      ancorata_da_mutazione: Boolean(mutazioni?.get?.(String(d?.id))?.has?.(file)),
    });
  }
  return { scollegati: fuori, controllati, ciechi, saltati, popolazione, inCodice, soloCommento, dalComando, cieche, grigie, viste };
}

/**
 * AR-878 — IL TETTO DEI ⚪. Pura, senza dipendenze, e un test la ESEGUE: è la sola cosa che decide.
 *
 * La domanda che risponde è una sola: **il numero delle cose che non ho potuto misurare è salito?**
 * Fino al 28/8 questo freno sapeva dire di no sugli scollegati (`quanti > tetto` → rosso) e non
 * sapeva dirlo sui ⚪: uno o cinquanta, l'uscita era 2 uguale. E i ⚪ non arrivano dal caso — li
 * genera l'evento esatto che questo guardiano sorveglia, cioè un file di prova rinominato o
 * cancellato. Bastava quello per spostare una scheda dalla colonna «so dire di no» a quella «non ho
 * potuto misurare», e da lì in poi il numero cresceva senza che niente diventasse rosso.
 *
 * ⚠️ IL TETTO CHE NON C'È VALE ZERO, E NON «NESSUN TETTO». È la porta che questa funzione chiude:
 * togliere la riga `"puntatori_ciechi"` da `cervello/tetti-lotto.json` non spegne il controllo, lo
 * porta al massimo della severità. Chi cerca di comprare un verde con un `rm` di una riga compra un
 * rosso. Vale anche per un valore storto (una stringa, un negativo, una virgola): non è un intero
 * ≥ 0 → vale 0. L'unico `null` ammesso è «il file dei tetti non l'ho proprio potuto leggere», e lì
 * non si giudica: un tetto che non ho letto non può giudicare se stesso.
 *
 * @param ciechi quanti ⚪ ha prodotto la SORVEGLIANZA (i file di prova che non ho potuto guardare).
 *   NON ci va il ⚪ del tetto illeggibile: quello è ignoranza sull'infrastruttura, non sull'evento.
 * @param tetto il numero dichiarato, oppure `null` se il file dei tetti non si è potuto leggere
 * @returns {{esito:"salito"|"sceso"|"pari"|"non-giudicabile", motivo:string}}
 */
export function tettoDeiCiechi({ ciechi = 0, tetto = 0 } = {}) {
  if (tetto === null || tetto === undefined) {
    return { esito: "non-giudicabile", motivo: "il file dei tetti non si legge: non ho un numero con cui confrontare i ⚪, e non me lo invento" };
  }
  const n = Number(ciechi);
  const quanti = Number.isInteger(n) && n >= 0 ? n : 0;
  const t = Number(tetto);
  const limite = Number.isInteger(t) && t >= 0 ? t : 0;
  if (quanti > limite) {
    return {
      esito: "salito",
      motivo:
        `${quanti} cose non misurate contro un tetto di ${limite}: il ⚪ di questo freno si è allargato. ` +
        "Un file di prova che sparisce o cambia nome è l'evento che sorveglio, non un incidente dell'ambiente: " +
        'riaggancia il puntatore, oppure — se il ⚪ è vero e resta — alza a mano "puntatori_ciechi" in cervello/tetti-lotto.json e scrivi il perché (AR-878)',
    };
  }
  if (quanti < limite) {
    return { esito: "sceso", motivo: `cose non misurate scese da ${limite} a ${quanti}: abbassa "puntatori_ciechi" a ${quanti} in cervello/tetti-lotto.json` };
  }
  return { esito: "pari", motivo: `${quanti} cose non misurate, esattamente il tetto` };
}

/**
 * Il verdetto col tetto — la stessa grammatica dei fratelli: il debito ereditato si CONTA, la
 * regressione si BLOCCA. Pura, così il caso «il debito si è allargato» si prova senza dover
 * scollegare un puntatore vero nel repo.
 *
 * L'ordine è la parte che conta: una violazione MISURATA batte un cieco (è un rosso vero, e resta
 * rosso), ma un cieco batte qualunque verde. Con un file illeggibile in mezzo l'uscita è 1 o 2, mai
 * 0: ⚪ non è verde, nemmeno sotto il tetto.
 *
 * `controllati` ha il default 0 APPOSTA, e non è pigrizia: chi chiama questa funzione senza passare
 * il denominatore ottiene ⚪, non un verde. Il default sbagliato deve cadere dalla parte del non so.
 */
export function verdettoPuntatori({
  quanti = 0,
  tetto = null,
  ciechi = 0,
  // AR-878 — i ⚪ della SORVEGLIANZA, separati dal totale `ciechi` (che comprende anche il tetto
  // illeggibile). Solo questi hanno un limite: il ⚪ dell'infrastruttura non può giudicare se stesso.
  // Il default 0 su tutti e due sta dalla parte severa, come `controllati`: chi si dimentica di
  // passarli non compra un permesso, ottiene il metro più stretto.
  ciechiSorvegliati = 0,
  tettoCiechi = 0,
  controllati = 0,
  popolazione = null,
  popolazioneDichiarata = null,
  soloCommento = 0,
  cieche = 0,
  grigie = 0,
  viste = 0,
} = {}) {
  if (tetto !== null && tetto !== undefined && quanti > tetto) {
    return {
      esito: "violazione",
      motivo:
        `puntatori scollegati saliti da ${tetto} a ${quanti}: una prova ha smesso di nominare il difetto che dimostra. ` +
        `Il comando gira ancora ed esce ancora 0 — semplicemente non guarda più niente (AR-798)`,
    };
  }
  // Il VERDE MUTO: zero file letti non è «nessun puntatore scollegato», è non aver guardato. Senza
  // questa riga il tetto è abbassabile guardando niente — ed è come è caduta la prima versione.
  if (!controllati) {
    return {
      esito: "cieco",
      motivo:
        "non ho letto nemmeno un file di prova (0 controllati): qualunque numero qui sarebbe comprato non guardando, " +
        "e un tetto abbassato su questo conto butterebbe via i puntatori rotti veri (AR-660)",
    };
  }
  // ⛔ AR-878 — IL ⚪ CHE SI È ALLARGATO È UN ROSSO, NON UN ALTRO ⚪.
  //
  // Sta QUI, e l'ordine è la decisione: dopo `0 controllati` (che è l'ignoranza totale, e va detta
  // per prima) e PRIMA del cieco generico — altrimenti il ramo sotto se lo mangia e il tetto non
  // giudica mai niente. Un ⚪ che cresce è una regressione misurata come quella degli scollegati:
  // il guardiano ha smesso di poter dire di no su un pezzo in più di quello che sorvegliava.
  const ciechiVsTetto = tettoDeiCiechi({ ciechi: ciechiSorvegliati, tetto: tettoCiechi });
  if (ciechiVsTetto.esito === "salito") {
    return { esito: "violazione", motivo: ciechiVsTetto.motivo };
  }
  if (ciechi) {
    // Il conto tiene dentro anche il tetto illeggibile, quindi il motivo NON dice «puntatori»:
    // dire il numero giusto attribuendolo alla cosa sbagliata è un altro modo di mentire.
    return {
      esito: "cieco",
      motivo:
        `${ciechi} cose non le ho potute leggere — un file di prova che non c'è o non si apre, un comando che non nomina nessun file, ` +
        `o il tetto stesso: sono elencate una per una, e non chiamo verde ciò che non ho guardato`,
    };
  }
  // ⛔ UN TETTO CHE NON C'È NON È UN DEBITO ZERO: È UN METRO SENZA ZERO — AR-798, 28/8/2026.
  //
  // Fino a oggi qui usciva `debito`, cioè EXIT 0, con l'invito a dichiarare il tetto. Misurato prima
  // di cambiarlo: tolta la sola riga `"puntatori_scollegati"` da `cervello/tetti-lotto.json`, questo
  // freno usciva 0 avendo contato 46 scollegati veri. Una riga di JSON in meno e il controllo si
  // spegne restando verde — è la voce 9 del catalogo delle scorciatoie («il tetto che risale»,
  // variante peggiore: togli la chiave e il minimo riparte da zero) e finché nessuno lo eseguiva
  // era teoria. Dal momento in cui questo passo entra nel cancello è la porta più economica che
  // esista per comprare un verde: costa una riga, non tocca nessun codice, e il diff mostra solo un
  // tetto «ripulito».
  //
  // Adesso è VIOLAZIONE, ed è la stessa regola che il fratello `cervello/due-case.mjs` applica alla
  // stessa identica domanda (`verdettoTetto` → `senza-tetto`, che lì blocca): due guardiani della
  // stessa casa non possono dare due risposte diverse a «non ho un numero con cui confrontare».
  // Non è un rosso-per-sempre e non è un cieco: il file è leggibile, la chiave è stata tolta da
  // qualcuno, e si rimette con una riga — il motivo dice quale.
  if (tetto === null || tetto === undefined) {
    return {
      esito: "violazione",
      motivo:
        `${quanti} puntatori scollegati e NESSUN TETTO con cui confrontarli: senza un numero di partenza non sto misurando ` +
        `un bel niente, e un verde qui sarebbe comprato togliendo una riga. Dichiaralo in cervello/tetti-lotto.json → "puntatori_scollegati"`,
    };
  }
  if (quanti < tetto) {
    // ═══ LA PORTA DEL «NIENTE COMANDO», detta DOVE SI LEGGE IL NUMERO ═══════════════════════════
    // Il conto può scendere per due motivi opposti, e da fuori si somigliano: o un puntatore è stato
    // RIAGGANCIATO (lavoro fatto, il tetto va abbassato), o una scheda ha smesso di avere una prova
    // a comando (ho smesso di guardarla, e abbassare il tetto butterebbe via il debito vero).
    // MISURATO sul cantiere vero, non temuto: convertite a `verifica:{tipo:"umano"}` le 52 schede
    // accusate, il freno usciva 0 e diceva «scesi da 53 a 0: abbassa il tetto» — e sei guardiani
    // fratelli non se ne accorgevano. È la stessa forma del `mv` che ha bocciato la prima consegna,
    // da un'altra porta: il conto scende perché la popolazione si assottiglia, e il freno PREMIA la
    // mossa che deve punire. La cura è la stessa di allora: l'invito ad abbassare non si dà se non
    // so perché il conto è sceso. Non blocca — le conversioni a verifica umana sono legittime e un
    // rosso qui sarebbe falso — ma il tetto non si abbassa più al buio.
    const persi =
      popolazioneDichiarata !== null && popolazioneDichiarata !== undefined && popolazione !== null && popolazione !== undefined && popolazione < popolazioneDichiarata
        ? popolazioneDichiarata - popolazione
        : 0;
    if (persi) {
      return {
        esito: "debito",
        motivo:
          `puntatori scollegati scesi da ${tetto} a ${quanti} — MA sono scesi anche perché ${persi} schede hanno smesso di avere ` +
          `una prova a comando (popolazione ${popolazioneDichiarata} → ${popolazione}). NON abbassare il tetto finché non sai quale ` +
          `dei due è successo: un puntatore riagganciato è lavoro fatto, una scheda passata a verifica umana è solo una che ho ` +
          `smesso di guardare — e abbassare il tetto su quella butta via il debito vero per sempre`,
      };
    }
    if (popolazioneDichiarata === null || popolazioneDichiarata === undefined) {
      return {
        esito: "debito",
        motivo:
          `puntatori scollegati scesi da ${tetto} a ${quanti}: abbassa il tetto in cervello/tetti-lotto.json — ma misuralo sull'albero ` +
          `col lotto MONTATO (le schede che il lotto sta per creare contano), non su quello di adesso. E dichiara ` +
          `"puntatori_popolazione": ${popolazione ?? "?"} lì accanto: senza quel numero non posso distinguere un puntatore riagganciato ` +
          `da una scheda che ha smesso di avere una prova a comando, e il tetto si abbasserebbe al buio`,
      };
    }
    // L'invito ad abbassare porta con sé COME si misura, ed è la lezione ③: un tetto misurato
    // sull'albero di adesso invece che su quello col lotto montato nasce già superato e blocca il
    // cancello per tutti. Un consiglio che si può seguire sbagliando è mezzo consiglio.
    return {
      esito: "debito",
      motivo:
        `puntatori scollegati scesi da ${tetto} a ${quanti} con la popolazione intatta (${popolazione}): abbassa il tetto in ` +
        `cervello/tetti-lotto.json a ${quanti} — ma misuralo sull'albero col lotto MONTATO (le schede che il lotto sta per creare ` +
        `contano), non su quello di adesso, e aggiorna "puntatori_popolazione" a ${popolazione} nello stesso gesto`,
    };
  }
  // AR-878 — il tetto dei ⚪ SCENDE: se oggi ne ho zero e il tetto dice due, il tetto va abbassato,
  // o fra un mese due ⚪ nuovi passeranno inosservati. Esce 0 (è lavoro fatto, non una violazione)
  // ma lo dice, come fa il fratello sopra per gli scollegati.
  if (ciechiVsTetto.esito === "sceso") {
    return { esito: "debito", motivo: ciechiVsTetto.motivo };
  }
  // LA FRASE CHE LA VERIFICA HA COLTO IN FALLO. La seconda consegna stampava «✅ ogni prova a
  // comando nomina ancora il difetto che dimostra» sopra il difetto IN FUNZIONE: due schede, il caso
  // di una emigrato in un altro file, l'intestazione rimasta al posto suo → EXIT=0 e quella frase.
  // Era la frase esatta che questo freno esiste per rendere impossibile. Non la posso rendere vera
  // — vedere l'estrazione sotto l'intestazione vorrebbe dire non chiamare più «ancoraggio» un
  // commento, e il 41% degli ancoraggi di casa è esattamente quello — ma posso smettere di dirla
  // più larga di quello che ho guardato. Il verde adesso si dichiara il limite addosso.
  // LA RISERVA, COL NUMERO VERO. La versione di prima diceva «di cui N ancorate solo da una riga di
  // commento», e quel numero (221 su 546, il 40%) era la metà buona della verità: contava «dov'è la
  // stringa» invece di «l'estrazione porta via questo ancoraggio». Misurato: 436 su 546 restano
  // verdi qualunque cosa emigri. Adesso il verde si dichiara addosso quel numero, non l'altro.
  const totale = cieche + grigie + viste;
  const riserva = totale
    ? ` — ma l'estrazione la vedo su ${viste} di ${totale} (al massimo ${viste + grigie}): su ${cieche} il nome resta nell'intestazione o nel comando e io resto verde comunque`
    : "";
  return {
    esito: "ok",
    motivo: quanti
      ? `${quanti} puntatori scollegati su ${controllati} controllati, pari al tetto: debito dichiarato, non allargato — sono prove che non nominano più il difetto che dimostrano, e questo freno non le ripara: impedisce che diventino una di più${riserva}`
      : `nessun puntatore ha smesso di nominare il suo difetto (${controllati} controllate${riserva})`,
  };
}

/**
 * LA RIGA CHE DICE COSA COPRE IL VERDE — e per due consegne ha detto un numero sbagliato dalla parte
 * comoda, che è il difetto peggiore che un freno possa avere.
 *
 * Diceva: «546 ancorate — 319 dal codice del file, 6 dal comando, 221 SOLO da una riga di commento
 * (40%): su queste ultime il caso può emigrare tutto e io resto verde». Quel «su queste ultime»
 * prometteva che sulle altre 325 l'estrazione si vedesse. Misurato: dei 319 «dal codice», 303
 * portano il nome anche nell'intestazione — e l'intestazione all'estrazione NON si muove, perché il
 * mandato di casa vuole il commento in cima. La cecità vera non era il 40%: era l'80%.
 *
 * Adesso la riga risponde alla domanda giusta, e la risposta ha tre valori (`doveAncora`):
 *   CIECHE  = il nome sta nell'intestazione o nel comando → resta lì, resto verde, non ho guardato
 *   GRIGIE  = il nome sta altrove nel file → può emigrare col caso o restare, non lo so
 *   VISTE   = il nome sta SOLO sulle righe dei casi → se il caso emigra divento rosso
 * Misurato sul cantiere vero il 23/8: cieche 436 (80%) · grigie 101 (18%) · viste 9 (2%).
 */
export function copertura({ cieche = 0, grigie = 0, viste = 0, dalComando = 0 } = {}) {
  const tot = cieche + grigie + viste;
  if (!tot) return "";
  const pct = (n) => Math.round((n / tot) * 100);
  return (
    `${tot} ancorate, ma contro l'ESTRAZIONE — la mossa che dà il nome a questo freno — la copertura vera è: ` +
    `${viste} VISTE (${pct(viste)}%: il nome sta solo sulle righe dei casi, se emigrano divento rosso) · ` +
    `${grigie} grigie (${pct(grigie)}%: il nome sta altrove nel file, non so se emigra) · ` +
    `${cieche} CIECHE (${pct(cieche)}%: il nome sta nell'intestazione` +
    (dalComando ? ` o nel comando` : "") +
    `, che l'estrazione non muove — resto verde comunque)`
  );
}

/**
 * La mossa da trenta secondi, detta a chi legge il rosso — e la terza che ci scrivevo INSEGNAVA A
 * LAVARSI.
 *
 * Il consiglio era «o scrivi `// AR-nnn` accanto al caso che è emigrato». Letto alla lettera non
 * funziona: chi verificava l'ha provato, il file dove il caso ERA emigrato nominava AR-131 sette
 * volte e il freno restava rosso. L'unica lettura che toglie il rosso è scrivere il nome nel file
 * dove il caso NON c'è più — cioè zittire il freno senza riparare niente. Un rosso che insegna la
 * mossa sbagliata è peggio di un rosso muto: adesso restano le due mosse oneste, e la terza è
 * scritta per quello che è.
 */
function comeSiRiaggancia(s) {
  return (
    `     · o riporti il caso in ${s.file}, o sposti il puntatore della scheda (verifica.comando)\n` +
    `       sul file dove il caso è andato a vivere. NON scrivere \`// ${s.id}\` in ${s.file}:\n` +
    `       rimette il nome dove il caso non c'è più, mi zittisce e non ripara niente (misurato).`
  );
}

function main() {
  if (!existsSync(CANTIERE)) {
    console.error(`puntatori-scollegati: ${CANTIERE} assente → non posso misurare`);
    process.exit(2);
  }
  let difetti;
  try {
    difetti = JSON.parse(readFileSync(CANTIERE, "utf8")).difetti;
  } catch (e) {
    console.error(`puntatori-scollegati: cantiere-difetti.json illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }
  // Un registro senza schede non è «nessun puntatore scollegato»: è un verde comprato non guardando,
  // che è esattamente la lezione di AR-660. Se non c'è niente da contare, lo dico e esco cieco.
  if (!Array.isArray(difetti) || !difetti.length) {
    console.error("puntatori-scollegati: il registro non ha schede da guardare → non posso misurare");
    process.exit(2);
  }

  const risolvi = (f) => (isAbsolute(f) ? f : join(RADICE, f));
  const esiste = (f) => existsSync(risolvi(f));
  const leggi = (f) => {
    try {
      return readFileSync(risolvi(f), "utf8");
    } catch {
      return null; // anche una cartella al posto di un file: non so niente, quindi cieco
    }
  };

  // `mutanti.json` SOLO per annotare le accuse: non entra nel conto, non entra nel tetto, non entra
  // nell'uscita. Se non si legge, il verdetto è identico e lo dico invece di tacerlo — questo non è
  // un canale di misura che può accecarmi, è una didascalia. (Tenerlo fuori dal verdetto è anche
  // quello che mi impedisce di dipendere da chi scrive in quel file nello stesso lotto.)
  let mutazioni = new Map();
  let mutantiLetto = true;
  try {
    mutazioni = mutazioniPerDifetto(JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti);
  } catch {
    mutantiLetto = false;
  }

  const r = scollegati(difetti, leggi, esiste, mutazioni);
  let tetto = null;
  let popolazioneDichiarata = null;
  // AR-878 — `null` vuol dire UNA cosa sola: il file dei tetti non l'ho potuto leggere. La chiave
  // assente NON è `null`: è 0, cioè il metro più stretto. Vedi `tettoDeiCiechi` per il perché.
  let tettoCiechi = null;
  const ciechiTetto = [];
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    tetto = Object.hasOwn(t, "puntatori_scollegati") ? Number(t.puntatori_scollegati) : null;
    popolazioneDichiarata = Object.hasOwn(t, "puntatori_popolazione") ? Number(t.puntatori_popolazione) : null;
    const c = Number(t.puntatori_ciechi);
    tettoCiechi = Object.hasOwn(t, "puntatori_ciechi") && Number.isInteger(c) && c >= 0 ? c : 0;
  } catch {
    ciechiTetto.push("tetti-lotto.json illeggibile: il numero c'è, il confronto col tetto no");
  }
  // I ciechi del TETTO si sommano a quelli dei puntatori, e non è un dettaglio di stile: è la stessa
  // radice della bocciatura. Un tetti-lotto.json illeggibile lasciava `tetto = null` e usciva 0 con
  // scritto «debito» — cioè un altro canale di ignoranza che non arrivava al verdetto. Misurato
  // prima della riparazione: `TETTI_FILE=<una cartella>` → EXIT=0. Adesso è ⚪.
  // (Il fratello `prove-runtime-senza-mutazione.mjs` ha ancora lo stesso buco: girato all'AD come
  // debito di casa, non lo tocco da qui.)
  const v = verdettoPuntatori({
    quanti: r.scollegati.length,
    tetto,
    ciechi: r.ciechi.length + ciechiTetto.length,
    // I ⚪ CHE HANNO UN TETTO sono solo quelli della sorveglianza. `ciechiTetto` resta fuori apposta:
    // quando il file dei tetti non si legge non esiste nemmeno il numero con cui giudicarlo, e un
    // rosso lì sarebbe un freno che accusa l'ambiente invece dell'evento (AR-878).
    ciechiSorvegliati: r.ciechi.length,
    tettoCiechi,
    controllati: r.controllati,
    popolazione: r.popolazione,
    popolazioneDichiarata,
    soloCommento: r.soloCommento,
    cieche: r.cieche,
    grigie: r.grigie,
    viste: r.viste,
  });

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          // Convenzione di casa, uguale in prove-runtime-senza-mutazione / debito-prove-bash /
          // import-che-esegue: `ok` distingue solo il ROSSO. Su un ⚪ resta `true`, ed è una parola
          // che si legge verde: la verità sta in `esito` e nel codice d'uscita (2). Non la cambio
          // solo qui — due convenzioni sarebbero peggio di una scomoda — ma è girata all'AD come
          // debito di casa da chiudere su tutti i fratelli insieme.
          ok: v.esito !== "violazione",
          esito: v.esito,
          motivo: v.motivo,
          quanti: r.scollegati.length,
          // `controllati` è il DENOMINATORE, e non è un ornamento: un elenco vuoto e un elenco non
          // guardato si distinguono solo se il numero di ciò che ho guardato è in chiaro (AR-660).
          // Da questa versione non è più solo in chiaro: entra nel verdetto, 0 controllati = ⚪.
          controllati: r.controllati,
          su: difetti.length,
          // `saltati` è un sottoinsieme di `ciechi`, non un'uscita di servizio: sta qui per dire
          // quanti dei ⚪ sono «il file puntato non c'è / il comando non nomina un file».
          saltati: r.saltati,
          tetto,
          // AR-878 — i due numeri dei ⚪, in chiaro come quelli degli scollegati: senza il tetto
          // accanto al conto non si vede se il ⚪ è sotto controllo o si sta allargando.
          ciechi_sorvegliati: r.ciechi.length,
          tetto_ciechi: tettoCiechi,
          // ═══ COSA COPRE IL VERDE, in chiaro accanto al verde ═══
          // I TRE NUMERI CHE CONTANO (⑦): rispondono a «l'estrazione porta via questo ancoraggio?».
          // `viste` è quello che il freno vede davvero, `cieche` quello su cui resta verde per
          // costruzione, `grigie` quello che onestamente non sa. Misurati sul cantiere vero il 23/8:
          // 9 · 436 · 101 su 546. Il vecchio «40% cieco» era la metà buona della verità.
          ancorate: r.cieche + r.grigie + r.viste,
          viste_all_estrazione: r.viste,
          grigie_all_estrazione: r.grigie,
          cieche_all_estrazione: r.cieche,
          ancorate_dal_comando: r.dalComando,
          // I due grezzi di prima restano, ma NON sono copertura e non vanno letti come tale:
          // «ancorato nel codice» comprende 303 schede che portano il nome anche nell'intestazione.
          ancorate_in_codice: r.inCodice,
          ancorate_solo_commento: r.soloCommento,
          copertura: copertura(r),
          // La popolazione e il suo riferimento: è così che si distingue un puntatore riagganciato
          // da una scheda che ha smesso di avere una prova a comando.
          popolazione: r.popolazione,
          popolazione_dichiarata: popolazioneDichiarata,
          mutanti_letto: mutantiLetto,
          scollegati: r.scollegati,
          ciechi: [...ciechiTetto, ...r.ciechi],
        },
        null,
        2,
      ),
    );
  } else {
    const tuttiCiechi = [...ciechiTetto, ...r.ciechi];
    console.log(
      `🧭 PUNTATORI DI PROVA SCOLLEGATI — ${r.scollegati.length} su ${r.controllati} controllati (tetto ${tetto ?? "—"})` +
        `${tuttiCiechi.length ? ` · ${tuttiCiechi.length} NON misurati` : ""}` +
        ` · ⚪ sorvegliati ${r.ciechi.length}/${tettoCiechi ?? "—"}\n`,
    );
    for (const c of tuttiCiechi.slice(0, 10)) console.log(`  ⚪ ${c}`);
    if (tuttiCiechi.length > 10) console.log(`  ⚪ …e altri ${tuttiCiechi.length - 10} che non ho potuto misurare`);
    for (const s of r.scollegati.slice(0, 15)) {
      console.log(`  ❌ ${s.id} [${s.stato}] → ${s.file}`);
      // LA RIGA CHE DICEVA UNA COSA FALSA. Prima stampava «il comando gira, esce 0, e non guarda più
      // niente» per tutti — e per 18 su 46 non è vero: una mutazione in mutanti.json dichiara di
      // rompere QUEL file per QUESTA scheda. Non la esegue nessuno finché il lotto non tocca quel
      // difetto, ed è una cosa diversa dal non guardare. Adesso ognuno si prende la sua frase.
      if (s.ancorata_da_mutazione) {
        console.log(`     · dentro il file il nome ${s.id} non c'è più. È ancorato in mutanti.json (una mutazione dichiara di`);
        console.log(`       rompere questo file per ${s.id}) — ma nessuno la esegue finché il lotto non tocca ${s.id}`);
      } else {
        console.log(`     · dentro il file il nome ${s.id} non c'è più, e nemmeno nel comando né in mutanti.json:`);
        console.log(`       se il caso è emigrato, il comando gira, esce 0 e non guarda più niente`);
      }
    }
    if (r.scollegati.length > 15) console.log(`  · …e altri ${r.scollegati.length - 15}`);
    console.log("");
    console.log(`${v.esito === "violazione" ? "⛔" : v.esito === "cieco" ? "⚪" : v.esito === "debito" ? "⚠️ " : "✅"} ${v.motivo}`);
    if (v.esito === "violazione") for (const s of r.scollegati.slice(0, 5)) console.log(comeSiRiaggancia(s));
    if (r.controllati) console.log(`   📐 ${copertura(r)}`);
    if (!mutantiLetto) console.log("   ⚠️ mutanti.json non l'ho letto: le accuse restano valide, ma non so dire quali siano coperte da una mutazione.");
    const tot = r.cieche + r.grigie + r.viste;
    console.log(
      `   ⚠️ è una SENTINELLA DI SPOSTAMENTO: chiede se il file nomina ancora il difetto, non se la prova è buona.\n` +
        `      L'estrazione con l'intestazione lasciata al posto suo NON la vedo, ed è il ${tot ? Math.round((r.cieche / tot) * 100) : 0}% dei verdi qui sopra\n` +
        `      (${r.cieche} su ${tot}). Le vedo con certezza ${r.viste}, al massimo ${r.viste + r.grigie}. E una riga \`// AR-nnn\` scritta a mano\n` +
        `      in un punto qualunque del file mi zittisce: è un buco dichiarato, non un controllo.`,
    );
  }

  process.exit(v.esito === "violazione" ? 1 : v.esito === "cieco" ? 2 : 0);
}

// Importare questo modulo non lo esegue (AR-680). Forma canonica: `pathToFileURL(...).href`, non
// `file://` + argv[1] — che sotto una cartella accentata non combacia e spegne la guardia in silenzio.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
