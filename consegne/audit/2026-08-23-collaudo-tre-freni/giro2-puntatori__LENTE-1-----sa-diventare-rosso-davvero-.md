# ROTTO

## prova
Tutto eseguito sul repo vero, node v22.22.2. Albero restituito identico (`diff -q` su motore, tetti-lotto.json e sorvegliante.test.mjs → identici; `git status` uguale a come l'ho trovato).

① LE ACCUSE DEL VECCHIO REFERTO, RIGIOCATE UNA PER UNA — TUTTE E CINQUE CHIUSE, e non gliel'ho creduto: le ho rifatte.
· accusa ② (il `mv` che fa SCENDERE il conto restando verde):
  $ mv cervello/test/sorvegliante.test.mjs cervello/test/sorvegliante-nuovo.test.mjs
  $ node cervello/puntatori-scollegati.mjs --json → EXIT=2 (prima 0)
    {"esito":"cieco","quanti":42,"controllati":569,"saltati":23,"tetto":53}
    ciechi[0]: "cervello/test/sorvegliante.test.mjs: non esiste (è il puntatore di AR-452)…"
    e NIENTE «abbassa il tetto» nel motivo. Ripristinato, git pulito.
· accusa ④ (verde muto): PUNTATORI_RADICE=<cartella vuota> col cantiere vero → EXIT=2,
  {"esito":"cieco","quanti":0,"controllati":0,"saltati":592,"motivo":"non ho letto nemmeno un file di prova (0 controllati)…"}
· accusa ⑤ (la riga che asseriva il buco): ora 22 casi, # pass 22 # fail 0, e la riga è rovesciata.
· lente 2 ⑥ (tetto illeggibile → EXIT 0): TETTI_FILE=<cartella> → EXIT=2, «⚪ tetti-lotto.json illeggibile».
· lente 2 nota (la prova si sterzava da fuori): CANTIERE_FILE + TETTI_FILE + PUNTATORI_RADICE ostili nell'ambiente → # pass 22 # fail 0. `ambiente()` li spoglia davvero.

② I CASI NUOVI PORTANO PESO — cinque mutazioni MIE sul motore di adesso, non lo swap che propone lui:
  ancorata → `return true`              → not ok 3,4,5,6,13,22 (# fail 6)
  file assente → torna un «saltato» muto → not ok 7 (IL RINOMINO), 14 (# fail 2)
  `if (!controllati)` → `if (false)`     → not ok 8 (VERDE MUTO), 16 (# fail 2)
  tolto il push del tetto illeggibile    → not ok 9 (# fail 1)
  tetto riabbassato a 52                 → not ok 19 (IL TETTO NON PUÒ NASCERE GIÀ SUPERATO) (# fail 1)
  contratto d'uscita spinto a riga 89    → not ok 17, e `node cervello/guardia-viva-check.mjs` EXIT=1 (con l'originale: EXIT=0)

③ IL TETTO 53 REGGE, E HO TROVATO UNA CORSIA CHE LUI NON HA MAI NOMINATO. Le corsie sono TRE, non due: `mutanti.json` porta anche AR-796 (porte-gemelle → `cervello/test/altra-porta-lasciata-aperta.test.mjs`). Montate tutte e tre sul cantiere vero:
  {"esito":"ok","quanti":53,"controllati":595,"tetto":53,"ciechi":0} EXIT=0 — del lotto resta scollegato solo AR-797.
  (AR-796 è GIÀ nel cantiere e il suo file lo nomina 2 volte: il 53 tiene lo stesso.)
  Clone superficiale vero (`git clone --depth 1 --no-local`, shallow? true, 1 commit, coi 10 file del lotto portati dentro): stessi numeri, EXIT=0, prova 22/22.
  Ambiente spogliato da cwd estranea (`cd / && env -i …`) → EXIT=0. Import → nessuna esecuzione. `node cervello/test-cervello.mjs` → EXIT=0, ✅ 374/406, riga 290: la sua prova è scoperta da sola (22 passati). Tutti i 592 file puntati sono tracciati da git: in CI nessun ⚪.

④ QUI CADE — HO RICREATO IL DIFETTO VERO SU UN ALBERO MIO, NELLA FORMA IN CUI QUESTA CASA SCRIVE I FILE.
Due schede, ognuna col suo caso nel suo file, tetto 0 → verde («2 controllate»). Poi la mossa che il freno dice di esistere per prendere: il caso di AR-900 emigra in `tre.test.mjs` e il puntatore resta su `uno.test.mjs`.
· VARIANTE A (la sua, l'intestazione se ne va col caso):
    ⛔ puntatori scollegati saliti da 0 a 1 … EXIT=1  ✅
· VARIANTE B (l'intestazione resta, ed è la regola di questa casa: «In cima al file il commento che racconta il difetto vero che chiude»):
    🧭 PUNTATORI DI PROVA SCOLLEGATI — 0 su 2 controllati (tetto 0)
    ✅ ogni prova a comando nomina ancora il difetto che dimostra (2 controllate)   EXIT=0
    $ node --test uno.test.mjs → # pass 1 # fail 0
  Il comando gira, esce 0, non guarda più niente — e il freno stampa il verde con la frase esatta che doveva rendere impossibile.
  Non è un caso di laboratorio: sul repo di oggi 219 dei 540 ancoraggi verdi (41%) stanno SOLO su righe di commento. Esempio vero: AR-112 → `cervello/test/porte-pannello.test.mjs`, riga `// AR-207 · AR-112 · AR-234 — le porte del Pannello…`.

⑤ E IL CONTO SBAGLIA ANCHE DALL'ALTRA PARTE: 24 DEI 52 ACCUSATI SONO ANCORATI ALTROVE, sei in modo che ho eseguito.
  AR-550…AR-555 hanno il proprio id DENTRO il comando: `node --test cervello/test/sorvegliante.test.mjs && node cervello/non-vacuita.mjs --difetti AR-550`.
  $ node cervello/non-vacuita.mjs --difetti AR-550 → EXIT=0, «✅ tutte e 2 le mutazioni rendono rosso il loro test».
  E il testimone principale del freno: $ node cervello/non-vacuita.mjs --difetti AR-689 → EXIT=0, «✅ tutte e 1 le mutazioni rendono rosso il loro test» (`mutanti.json` lega AR-689 a `segreto-in-un-nome-con-l-accento.test.mjs`, che è proprio il file che il freno accusa).
  In tutto: 24 su 52 (46%) hanno una mutazione dichiarata che lega QUELLA scheda a QUEL file.

⑥ LA PORTA DEL «NIENTE COMANDO», misurata: convertite le 52 schede accusate a `verifica:{tipo:"umano"}` →
  {"esito":"debito","quanti":0,"controllati":540,"saltati":0,"ciechi":[]} EXIT=0, «scesi da 53 a 0: abbassa il tetto».
  Nessun fratello se ne accorge: cantiere-prove 0, contratto-prova 0, prova-ammissibile 0, forma-prova 0, cantiere-integrita 1 e prove-oneste 2 IDENTICI alla misura di base.

## dettaglio
REGGE tutto quello che gli era stato contestato, e va detto per primo perché è vero e l'ho misurato io: le tre riparazioni chieste dalla lente 1 e le due della lente 2 sono fatte, non raccontate. Il `mv` che faceva scendere il conto adesso è ⚪ con l'invito ad abbassare il tetto sparito; zero controllati è ⚪; il tetto illeggibile è ⚪; il tetto 53 è la misura dell'albero montato e regge anche con la TERZA corsia che lui non ha mai nominato (AR-796, che ho montato io: 53 su 595 controllati, EXIT=0). Le cinque mutazioni che ho applicato io al motore di adesso fanno diventare rossi i casi giusti, uno per uno: la prova porta peso, non è decorazione. E la cicatrice che si è fatto da solo — il contratto d'uscita scivolato oltre le 80 righe che spegneva `guardia-viva` in silenzio — è chiusa e sotto un caso che ho visto mordere.

Ma il mestiere di questa lente è una domanda sola: RICREA IL DIFETTO VERO E GUARDA SE DIVENTA ROSSO. L'ho ricreato su un albero mio, e il difetto vero di questa casa non è quello che la prova mette in scena.

La prova mette in scena un'estrazione in cui il caso emigra E l'intestazione se ne va con lui. Lì il freno è rosso, giustamente. Ma questa casa scrive i file di prova in un modo solo, ed è scritto perfino nel mandato con cui si consegna un lotto: «in cima al file il commento che racconta il difetto vero che chiude». Quindi l'estrazione vera è l'altra — il caso se ne va, l'intestazione resta dov'era — e su quella, misurata da me con due schede e due file: **EXIT=0, «✅ ogni prova a comando nomina ancora il difetto che dimostra»**, mentre `node --test uno.test.mjs` esce 0 senza guardare più niente. È la frase esatta che il freno esiste per rendere impossibile, stampata sopra il difetto in funzione. Non è una scorciatoia che bisogna cercare: è quello che succede da solo quando fai il refactor per cui il freno è nato.

E non è un angolo: dei 540 ancoraggi verdi di oggi, 219 (41%) poggiano SOLO su righe di commento. Per quei 219 il caso può emigrare tutto e il freno resta verde. Il file lo dichiara, sì — ma lo dichiara nella forma mite e sbagliata: «chi svuota il corpo di un caso lasciando il commento non lo prendo», che suona come un vandalo raro. La cosa da scrivere è un'altra: *la mossa che dà il nome a questo freno resta invisibile ogni volta che l'intestazione nomina l'AR, cioè in quattro casi verdi su dieci*. Il caso di prova esercita solo la variante che gli conviene; la variante scomoda della stessa mossa non c'è, e quello che non è sotto un caso, in questa casa, non è dichiarato: è sperato.

Poi il numero sbaglia anche dall'altro verso, e questo non lo dichiara nessuno. Ventiquattro dei 52 accusati (46%) hanno in `mutanti.json` una mutazione che lega quella scheda a quel file. Sei di loro portano il proprio id dentro il comando — `node --test cervello/test/sorvegliante.test.mjs && node cervello/non-vacuita.mjs --difetti AR-550` — e la seconda metà di quel comando l'ho eseguita: verde, «tutte e 2 le mutazioni rendono rosso il loro test». Per quelle sei il freno stampa «questo file non nomina più AR-550: il comando gira, esce 0, e non guarda più niente», ed è una frase falsa: il comando nomina AR-550 e va a rompergli il fix apposta. Peggio, il testimone principale del freno — AR-689, ripetuto tre volte fra motore, prova e `tetti-lotto.json` come «il caso vero, uno per tutti» — ha la sua mutazione su quel medesimo file, e `non-vacuita --difetti AR-689` esce verde: quella prova guarda AR-689, provato. Vero che nessuno la lancia da sola su una scheda chiusa (`non-vacuita` gira solo sui difetti che il lotto tocca, cancello-lotto.mjs:1078) — ma allora la frase da stampare è «nessuno la esegue», non «non guarda niente». E il `_perche_` del tetto manda il prossimo a cominciare proprio da `sorvegliante.test.mjs`, cioè dieci commenti decorativi su un file che è già coperto.

Messe insieme le due misure, il 52/53 su cui poggia tutta la consegna non è la quantità che dice di essere: gli mancano le emigrazioni con l'intestazione al posto suo, e gli avanzano sei accuse che ho smontato eseguendo.

COSA SERVE PERCHÉ REGGA — tre cose, tutte dentro il suo file, nessuna tocca il cancello:
① L'ancoraggio non può valere se sta solo in un commento, o va contato a parte e dichiarato. Anche solo separare i due numeri («540 ancorate, di cui 219 solo da un commento — su quelle non vedo l'estrazione») rimette in chiaro cosa il verde copre. Se resta com'è, il caso che manca è questo, e va scritto: *il caso emigra e l'intestazione resta → il freno NON lo vede*, asserito come limite provato invece che come frase.
② Chi porta il proprio id nel comando non si accusa: `ancorata(comando, id)` oltre a `ancorata(testo, id)`. Sono sei, e con loro il tetto scende (46 oggi, 47 montato) invece di portarsi dietro il rumore. Sui 18 con la sola mutazione, la riga onesta è «ancorato in `mutanti.json`, ma non lo esegue nessuno finché il lotto non lo tocca» — non «non guarda niente».
③ La porta del «niente comando» va detta dove si legge il numero, non solo nel commento: convertire una scheda a `verifica:{tipo:"umano"}` fa scendere il conto in silenzio e il freno risponde «abbassa il tetto» (misurato: 53 → 0, EXIT=0, e sei fratelli non se ne accorgono). È la stessa forma dell'accusa ② che l'ha bocciato la prima volta, da un'altra porta. Basta che il motivo lo dica: «scesi anche perché N schede hanno smesso di avere una prova a comando».

NON HO VERIFICATO: `node cervello/cancello-lotto.mjs` intero non l'ho lanciato (il passo non è agganciato e il mandato vieta di toccarlo) — ho letto però come tratta le uscite: `esegui` marca `cieco` il 2 e non `fallito`, e alla riga 1170 il cancello esce 2 se c'è anche un solo cieco, quindi il ⚪ blocca davvero. Non ho guardato le 52 schede una per una: le ho contate a macchina. Il verdetto non poggia su nessuna di queste due: poggia sull'albero finto che ho costruito io (variante B, EXIT=0 col difetto in funzione) e su `non-vacuita --difetti AR-550` e `--difetti AR-689` eseguiti.