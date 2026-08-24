# ROTTO

## prova
Tutto eseguito, node v22.22.2. Repo vero MAI scritto: `git status` identico a inizio e fine, md5 di puntatori-scollegati.mjs / tetti-lotto.json / test invariati. Banco di prova: copia del repo in scratchpad/copia (cervello/ + cantiere + il .mts del Pannello), baseline identica al vero.

① BASELINE (repo vero)
   node cervello/puntatori-scollegati.mjs --json → EXIT=0
   esito ok · quanti 46 · tetto 46 · controllati 592 · ciechi 0
   ancorate 546 = 319 in_codice + 6 dal_comando + 221 solo_commento
   copertura: «…221 SOLO da una riga di commento (40%): su queste ultime il caso può emigrare tutto e io resto verde»

② LE ACCUSE DEI DUE REFERTI, RIGIOCATE — chiuse, e non gliel'ho creduto
   · ⑤ (sei accuse false): accusati fra AR-550…555 = [] · ancorate_dal_comando 6 · AR-689 ancora accusato con la riga nuova. CHIUSA.
   · ⑥ (porta del «niente comando»): convertite le 46 accusate a verifica umana → EXIT=0 e motivo «scesi da 46 a 0 — MA … 46 schede hanno smesso di avere una prova a comando (popolazione 592 → 546). NON abbassare il tetto». L'invito è sparito. CHIUSA.
   · tetto col LOTTO MONTATO (montato da me: AR-797→due-case.test.mjs, AR-798→puntatori-scollegati.test.mjs; AR-796 è verifica umana): esito ok, quanti 46, tetto 46, controllati 594 → EXIT=0. NON nasce rosso. CHIUSA.
   · suite: env -i … node --test cervello/test/puntatori-scollegati.test.mjs → # tests 30 # pass 30 # fail 0, EXIT=0.

③ IL DIFETTO VERO NELLA VARIANTE SCOMODA, SU UN FILE VERO DI QUESTA CASA (non sintetico)
   Scelto AR-131 → cervello/test/due-numeri-per-la-stessa-domanda.test.mjs, che il freno conta fra i 319 «dal CODICE del file» (intestazione riga 7 + 5 casi `test("AR-131 · …")`).
   Rifatto l'estrazione ordinaria: i 5 casi emigrano in la-barra-della-confidenza.test.mjs, l'intestazione resta (regola di casa: «in cima al file il commento che racconta il difetto»), tolti gli import rimasti senza padrone.
     node --test cervello/test/due-numeri-per-la-stessa-domanda.test.mjs → # tests 3 # pass 3 # fail 0, EXIT=0 (tre casi che con AR-131 non c'entrano)
     node cervello/puntatori-scollegati.mjs → EXIT=0, ✅ «46 su 592, pari al tetto»
     l'unica cosa che si muove: ancorate_solo_commento 221→222, in_codice 319→318, 40%→41%.
   Cioè: la mossa che dà il nome al freno, su un file che il freno dichiara COPERTO, e il verdetto non si muove di un millimetro.

④ QUANTO È GRANDE DAVVERO IL BUCO — misurato, non dedotto (script che importa ancorata/parteDiCodice/ancoraSoloCommento veri)
   dei 319 «in codice», quelli che hanno ANCHE una riga di solo-commento col loro AR: 303. Senza: 16.
   Raffinato ai soli commenti che SOPRAVVIVONO all'estrazione (intestazione nelle prime 40 righe):
     ciechi per intestazione 439 · ciechi per commento più in basso 85 · ciechi perché il COMANDO nomina l'AR 6 · DAVVERO ROSSE se il caso emigra: 16 su 546 = 3%
   Il freno dichiara ciechi 221 su 546 = 40%. Il pavimento vero è 445 su 546 = 81%; il soffitto 530 su 546 = 97%.
   Campione verificato a mano: AR-130 → mansionario-percorsi-e-canali.test.mjs, AR-130 alle righe 1 e 9 (intestazione) e 102, 110 (casi). Contato «dal codice»; se i due casi emigrano restano le righe 1 e 9 → verde.

⑤ COMPRARE IL VERDE — due scorciatoie, entrambe eseguite
   Punto di partenza: variante A su AR-131 (via anche l'intestazione) → ⛔ «saliti da 46 a 47», EXIT=1. Il rosso esiste.
   · SCORCIATOIA 1 — una riga: aggiunto `// AR-131` nel file DOVE IL CASO NON C'È PIÙ → EXIT=0, ✅ 46/46. Il comando gira 3 casi che con AR-131 non c'entrano.
     E il consiglio stampato dal rosso è «o scrivi `// AR-131` accanto al caso che è emigrato»: il file dove il caso È emigrato nomina AR-131 sette volte e il freno era ROSSO lo stesso. Il consiglio, letto alla lettera, non toglie il rosso; l'unica lettura che lo toglie è scrivere il nome dove il caso non c'è.
   · SCORCIATOIA 2 — un campo: appeso ` --ar-131` al `verifica.comando` della scheda, zero righe di codice.
       comandoAmmesso("node --test …due-numeri… --ar-131") = true  (forma-prova.mjs: è la forma di casa, come `--ar-158`)
       node --test …due-numeri… --ar-131 → # tests 3 # pass 3 # fail 0, EXIT=0 (gira identico)
       freno → EXIT=0, ✅ 46/46, e la scheda finisce contata fra le ANCORATE.
     Steso su tutte e 46 (41 restano ammesse dalla forma di casa): «⚠️ scesi da 46 a 0 CON LA POPOLAZIONE INTATTA (592): abbassa il tetto a 0 … e aggiorna puntatori_popolazione a 592 nello stesso gesto», EXIT=0, copertura «52 dal comando stesso».

NON HO VERIFICATO: `node cervello/cancello-lotto.mjs` intero (il passo non è agganciato, e il mandato vieta di toccare quel file). Non ho guardato le 46 schede una per una: contate a macchina, aperte a mano AR-131, AR-130, AR-689, AR-550.

## dettaglio
Va detto per primo, perché è vero e l'ho rimisurato io: le tre riparazioni della prima bocciatura reggono, e delle tre di questo giro due sono fatte davvero. Le sei accuse false sono cadute (AR-550…555 non compaiono più fra gli accusati, ancorate_dal_comando è 6). La porta della verifica umana è chiusa nella forma che il referto aveva chiesto: converti le 46 e il freno non ti invita più ad abbassare, ti dice che la popolazione è scesa da 592 a 546. Il tetto col lotto montato tiene, 46 contro 46, EXIT=0: non nasce rosso, e questa volta l'ho montato io. La suite fa 30 su 30 in ambiente spogliato. Nessuna di queste è una promessa: le ho rifatte una per una.

Ma il mestiere di questa lente è una domanda sola — ricrea il difetto vero nella variante che capita da sola, e guarda se diventa rosso. L'ho ricreato su un file vero di questa casa, non su un albero finto, e la risposta è no.

AR-131 vive in `cervello/test/due-numeri-per-la-stessa-domanda.test.mjs`: il nome del difetto sta nell'intestazione a riga 7 e dentro cinque casi. Per il freno è uno dei 319 «ancorate dal CODICE del file» — cioè, a leggere la riga di copertura, uno dei coperti. Ho fatto il refactor più banale che ci sia: quel file teneva due difetti, i cinque casi di AR-131 se ne vanno in un file loro, l'intestazione resta dov'è perché il mandato di questa casa dice che ci deve stare. Da quel momento `node --test due-numeri-per-la-stessa-domanda.test.mjs` esce 0 avendo eseguito tre casi che con AR-131 non c'entrano niente. Il freno: EXIT=0, ✅ «46 puntatori scollegati su 592, pari al tetto». Si muove un numero solo, `ancorate_solo_commento` da 221 a 222, in una riga su cui non c'è nessun cancello.

Qui non sto contando come difetto un buco dichiarato — quello lo lascio stare, come da regola. Sto dicendo che il buco è dichiarato con il numero sbagliato, e sbagliato dalla parte che fa comodo al freno. La riga che il freno stampa accanto al verde è «221 SOLO da una riga di commento (40%): su queste ultime il caso può emigrare tutto e io resto verde». Quel «su queste ultime» promette che sulle altre 325 l'estrazione si vede. Misurato: dei 319 contati «dal codice», 303 portano anche il nome nell'intestazione, e l'intestazione all'estrazione non si muove. Restringendo ai soli commenti che sopravvivono davvero — quelli nelle prime quaranta righe — i ciechi sono 439, più 6 ancorati dal comando: 445 su 546, l'81%. Contando qualunque riga di commento, 530 su 546, il 97%. Le schede che possono diventare rosse per un'estrazione sono al massimo 101 e come pavimento 16: fra il 3% e il 18%. Il freno dice 40% cieco, cioè 60% coperto, e stampa quel numero due volte sotto il segno di spunta. Un buco dichiarato al 40% quando è all'81% non è un buco dichiarato: è una spunta verde messa sopra una malattia viva, che è la cosa che il mandato di questo giro vieta per iscritto. E il caso di prova 17 non lo salva, lo consacra: asserisce `ancorate_in_codice: 2` su un albero finto dove quei due file hanno intestazione e caso esattamente come AR-131 — cioè sarebbero invisibili anche loro. Il caso mette in scena la variante che conviene, di nuovo, solo un piano più su.

Poi c'è la parte che mi ha convinto del tutto, e non è una deduzione. Ho fatto diventare rosso il freno per davvero (tolta anche l'intestazione: ⛔ «saliti da 46 a 47», EXIT=1). Poi ho comprato il verde due volte. La prima con una riga: `// AR-131` scritta nel file dove il caso non c'è più. Verde. E il consiglio che il rosso stampa è proprio quello — «o scrivi `// AR-131` accanto al caso che è emigrato» — solo che il file dove il caso è emigrato nomina AR-131 sette volte e il freno restava rosso: il consiglio letto come è scritto non funziona, e l'unica lettura che funziona è quella che mette il nome dove il caso non c'è. Un rosso che insegna a lavarsi.

La seconda scorciatoia è peggio, perché non tocca nemmeno un file. Ho appeso ` --ar-131` al campo `comando` della scheda. È una forma che questa casa dichiara valida — `comandoAmmesso` risponde true, è la stessa forma di `--ar-158` che il freno cita come esempio buono — il comando gira identico, tre casi, EXIT=0, e AR-131 esce dagli accusati contato come ANCORATO. Steso su tutte e 46 (41 restano dentro la forma ammessa) il conto va a zero con la popolazione ferma a 592, e il freno risponde: «scesi da 46 a 0 con la popolazione intatta: abbassa il tetto a 0». Cioè la guardia costruita per l'accusa ⑥ — la popolazione dichiarata — non vede niente, perché la popolazione non si muove; e la porta l'ha aperta la riparazione dell'accusa ⑤, che ha insegnato al freno a chiamare ancoraggio un pezzo di stringa dentro un campo di registro. Le due riparazioni, messe insieme, lasciano il freno più comprabile di prima: la porta vecchia costava la conversione di 46 schede a verifica umana e adesso urla; la porta nuova costa 46 append in un JSON, resta muta, e il freno stesso ti invita a chiudere il debito a zero.

Quello che resta, allora. Il freno sa diventare rosso: l'ho visto uscire 1. Sa distinguere il cieco dal verde, e su quello ha ragione. Ma diventa rosso su una forma dell'estrazione che questa casa non produce (l'intestazione che se ne va col caso), non diventa rosso su quella che produce sempre, dichiara quella cecità a meno della metà del suo valore vero proprio nella riga che dovrebbe delimitarla, e il rosso che riesce a dare si compra con una riga di commento o con un campo di registro senza toccare una riga di codice. Nel dubbio ROTTO — ma qui il dubbio non c'è: c'è AR-131 estratto per davvero, il comando che esce 0 guardando altro, e il segno di spunta stampato sopra.

COSA SERVE PERCHÉ REGGA, tutto dentro il suo file, niente che tocchi il cancello né gli altri due freni del lotto:
① Il numero della cecità va misurato come si misura il difetto, non come conviene: ciechi = tutte le schede il cui AR compare in una riga di commento che sopravvive all'estrazione (l'intestazione), più quelle ancorate dal comando. Sono 445 su 546, l'81%, e va scritto lì dove oggi c'è il 40%. Se il numero onesto rende il freno indifendibile, quella è l'informazione: meglio saperlo adesso.
② `ancorata(comando, id)` non può valere per una bandierina qualsiasi. Le sei vere hanno `&& node cervello/non-vacuita.mjs --difetti AR-550`, cioè un secondo comando che va a rompere il fix di QUELLA scheda: quello è un ancoraggio. ` --ar-131` appeso a `node --test` non lo è, e oggi sono la stessa cosa. O si riconosce la forma «un comando che esegue una verifica intestata a quel difetto», o l'ancoraggio dal comando va tolto e le sei si dichiarano a mano come eccezione contata.
③ Il consiglio del rosso va riscritto: «scrivi `// AR-nnn` accanto al caso emigrato» oggi o non funziona (se lo scrivi dove il caso è) o lava il difetto (se lo scrivi dove il caso non è). Le mosse oneste sono due: riporti il caso, o sposti il puntatore sul file nuovo.
④ Se ①-③ non sono scrivibili, allora quello che resta è una sentinella che vede il 3-18% della mossa che le dà il nome: si può consegnare lo stesso, ma il titolo, il tetto e la riga di verdetto devono dirlo con quel numero, e il tetto 46 non va presentato come «il debito misurato» ma come «il debito che questa forma di misura riesce a vedere».