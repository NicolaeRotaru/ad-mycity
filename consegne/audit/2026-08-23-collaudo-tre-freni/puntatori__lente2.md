# ROTTO

## prova eseguita
TUTTO ESEGUITO DAVVERO, node v22.22.2, niente dedotto.

① CLONE SUPERFICIALE VERO — la cosa che il collega dichiarava di aver solo ragionato:
$ git clone --depth 1 --no-local file:///home/user/ad-mycity /tmp/.../shallow/repo
  shallow? true · commits: 1
$ (dentro il clone, coi 5 file portati dentro come farebbe l'AD)
  node cervello/puntatori-scollegati.mjs --json
  → {"esito":"ok","quanti":52,"controllati":592,"su":787,"saltati":0,"tetto":52,"ciechi":0}  EXIT=0
  IDENTICO al repo pieno. Il freno non chiama git.
$ node cervello/test/puntatori-scollegati.test.mjs  (nel clone) → # pass 15 # fail 0  EXIT=0, 1.3s
NB: l'albero di lavoro qui è GIÀ superficiale (git rev-parse --is-shallow-repository → true).

② DIPENDENZE ASSENTI SUL RUNNER:
$ cd / && env -i PATH=/usr/bin:/bin HOME=/tmp node <abs>/puntatori-scollegati.mjs → EXIT=0
  Nessuna chiave, nessuna rete, nessun cwd, nessun Pannello. AD_ROOT viene dal path del file
  (git-github.mjs:15 `resolve(dirname(fileURLToPath(import.meta.url)),"..")`), non da git.
$ import del modulo → [import ok 25ms, export ancorata=function], zero stampa. Importare
  cancello-lotto.mjs non esegue e non exec-a git.
$ node cervello/guardia-viva-check.mjs → "83/99 … ogni guardiano è eseguito da qualcuno" EXIT=0

③ DURATA: 0,135s da solo (`time`), 1,3s la prova. Trascurabile sul cancello.

④ CHI LO LANCIA: solo la sua prova, che test-cervello.mjs scopre da sola e che CI esegue
  (.github/workflows/test-cervello.yml:101 `node cervello/test-cervello.mjs`). La voce "cablato"
  in guardiani-motivi.json rispetta la definizione di casa ("_motivi_ammessi.cablato") perché il
  test spawna il motore vero. Onesta. NB: cancello-lotto.yml fa `fetch-depth: 0`, non --depth.

⑤ LA PROVA CHE LO SPACCA — montaggio del lotto simulato sul cantiere vero:
$ (cantiere + sola scheda AR-798)          → ✅ 52, EXIT=0
$ (cantiere + AR-798 + AR-797, le 2 corsie) → esito "violazione", quanti 53, tetto 52, EXIT=1
   scollegato: {"id":"AR-797","file":"cervello/test/due-case.test.mjs","stato":"chiuso"}
$ stesso cantiere, la SUA prova → not ok 14 - CALIBRAZIONE … # pass 14 # fail 1  (suite rossa)
Perché: `cervello/mutanti.json` dichiara già AR-797 → test `node cervello/test/due-case.test.mjs`,
e `grep -c AR-797 cervello/test/due-case.test.mjs` → 0.

⑥ Tetto illeggibile: TETTI_FILE=<cartella> → EXIT=0 su ENTRAMBI (puntatori-scollegati e il
fratello prove-runtime-senza-mutazione). Pattern di casa preesistente, non un peggioramento.

## dettaglio
LA MALATTIA DELLA LENTE 2 NON C'È — e va detto prima, perché il collega su questo è stato onesto e io l'ho verificato invece di crederci. Il punto ② del suo "cosa non ho verificato" ("il clone superficiale l'ho ragionato, non eseguito") l'ho eseguito io: clone --depth 1 a un commit solo, stessi identici numeri, EXIT=0. Il freno non chiama git, non legge la storia, non tocca la rete, gira da una cwd estranea con l'ambiente spogliato, costa 0,135s, e qualcuno lo lancia davvero (la sua prova, che CI esegue a ogni push). Su 1-2-3-4 della lente, tutto verde e tutto misurato.

MA IL FRENO NASCE ROSSO PER UN'ALTRA STRADA, e blocca il cancello per tutti esattamente come le schede AR-506/511/514/526/534.

Il tetto 52 è la fotografia di un albero che NON contiene la seconda scheda del lotto in cui questo freno nasce. Il collega ha scoperto lui stesso la corsia parallela (ci ha scritto un paragrafo: «AR-797 è GIÀ PRESO da cervello/due-case.mjs + il suo test, con la loro voce in mutanti.json») e ha verificato che la SUA scheda nasca ancorata — «il conto resta 52». Vero per la sua. Non è andato a guardare quella del vicino: `cervello/test/due-case.test.mjs` non contiene la stringa «AR-797» da nessuna parte. Quando l'AD monta il lotto e crea le due schede, il conto va a 53, il freno esce 1 e la sua stessa prova cade sul caso CALIBRAZIONE — cioè suite rossa, cancello rosso, per tutti.

E non c'è la via d'uscita comoda: la regola di casa è «tetto che scende e non risale», quindi l'AD non può alzarlo a 53 per farsi passare il lotto. O si ancora due-case.test.mjs ad AR-797 (una riga: basta che il file nomini il suo difetto), o il lotto non si consegna. È una riparazione da trenta secondi, ma finché non la si fa il freno è un blocco, non una rete — ed è precisamente la definizione di «nasce rotto» di questa lente.

Nota di merito, perché conta per l'AD: il difetto non è nella logica del freno, che qui sta facendo il suo mestiere (quel puntatore È scollegato per davvero). È nella CALIBRAZIONE consegnata: 52 è un numero misurato su un albero incompleto. Chi consegna un tetto deve misurarlo sull'albero che il cancello vedrà, non su quello che ha sotto le dita.

DUE COSE MINORI, dichiarate e non gonfiate:
· Tetto illeggibile → ⚪ stampato ma EXIT=0. Il contratto scritto in cima al file dice «2 = non ho potuto misurare» e la casa dice «⚪ non è verde», quindi è un'incoerenza vera; NON la conto contro di lui perché il fratello prove-runtime-senza-mutazione.mjs fa la stessa identica cosa (provato: EXIT=0 su entrambi) e il nuovo freno è anzi più severo dei fratelli sui ciechi veri (file di prova illeggibile → EXIT=2). Debito di casa, da chiudere su tutti insieme.
· La CALIBRAZIONE lancia il motore con `env: process.env`: eredita CANTIERE_FILE/TETTI_FILE/PUNTATORI_RADICE se per caso sono nell'ambiente. È come sono riuscito a pilotarla io. In CI l'ambiente è pulito, quindi non morde oggi — ma un caso che si può sterzare dall'esterno è un caso che un giorno misura un albero che non è il repo.

COSA NON HO VERIFICATO IO: non ho girato `node cervello/cancello-lotto.mjs` intero (mandato: non toccarlo, e la riga non è agganciata) — quindi il litigio del passo nuovo DENTRO il cancello resta non provato, esattamente come diceva lui. Non ho rilanciato le 406 prove della suite: ho verificato il suo file, guardia-viva-check e i due fratelli sul tetto. Non ho controllato le 52 una per una.