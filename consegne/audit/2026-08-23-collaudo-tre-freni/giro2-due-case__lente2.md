# ROTTO

## prova
Tutto su copie usa-e-getta in scratchpad; il repo vero /home/user/ad-mycity non è stato toccato (git status identico a inizio verifica, nessun commit, nessun push).

A) BASE, repo vero (clone superficiale):
$ node cervello/due-case.mjs → exit=0 · 0,157 s · «nati 0 · riscritti 0 · rilanciati 0»

B) MONTATO DA SOLO, ambiente fedele alla CI (repo a storia INTERA costruito a mano, origin/main = stato pre-lotto, ramo lotto51, HOME vuota, CI=1, GITHUB_ACTIONS=true):
$ env -i PATH=$PATH HOME=$(mktemp -d) CI=1 GITHUB_ACTIONS=true node cervello/due-case.mjs → exit=0 · 0,16 s

C) MONTATI TUTTI E TRE I FRENI DEL LOTTO (due-case + porte-gemelle + puntatori-scollegati), stesso ambiente CI-fedele, merge-base con origin/main risolto (8cd96b36):
$ node cervello/due-case.mjs → EXIT REALE = 1 · 4,3 s
   ❌ l altra porta lasciata aperta — NASCE SENZA MORSO (cervello/porte-gemelle.mjs)
   ❌ puntatori scollegati — NASCE SENZA MORSO (cervello/puntatori-scollegati.mjs)
   ⛔ 2 cose da sistemare prima di consegnare.
Ripetuto anche su copia con .git superficiale (base=HEAD): stesso exit=1.

D) CONVENZIONE DI CASA sul campo `test` di mutanti.json (è ciò che la domanda ⓑ pretende):
719 mutazioni su 727 puntano a un `cervello/test/*.test.mjs`; solo 8 puntano a un file non-test, e nessuna delle 8 è del lotto. Le 6 mutazioni nuove di due-case puntano anch'esse a `cervello/test/due-case.test.mjs`.

E) LOTTO CHE TOCCA `cervello/test-cervello.mjs` (passo del cancello, argomenti statici → `maiProvabile = {provabile:true}`), misurato SUL REPO VERO con le funzioni esportate dal freno stesso (costruisciCasaSpoglia + ambienteSpoglio):
   casa spoglia costruita in 2,4 s · DUE_CASE_DENTRO=1 · HOME vuota · CI=1
   $ node cervello/test-cervello.mjs --json NELLA CASA SPOGLIA → exit=1 (186 s) · file rotto: cervello/test/due-case.test.mjs
   $ node cervello/test-cervello.mjs --json IN CASA → exit=0 (210 s)
   $ verdettoDueCase({casa:0, spoglia:1}) → {"esito":"nasce-rotto", …"questo passo nasce rosso a ogni corsa, per costruzione."}
   Causa isolata: $ DUE_CASE_DENTRO=1 node cervello/test/due-case.test.mjs → exit=1, # pass 17 · # fail 7
     not ok 3 AR-514 rigiocato · not ok 4 AR-506 rigiocato · not ok 5 un passo SANO passa ·
     not ok 6 nessun comando del freno spegne l'accusa · not ok 8 incollare la mutazione non compra il verde ·
     not ok 9 AR-511 rigiocato · not ok 10 una mutazione scollegata è ⚪
   (senza la variabile: exit=0, # fail 0)

F) DURATA end-to-end su un lotto che tocca test-cervello.mjs, repo a storia intera:
$ time node cervello/due-case.mjs → real 7m35s (copia + suite due volte). Su lotto che non tocca nessun passo: 0,16 s.

G) CLONE SUPERFICIALE VERO: `git clone --depth 1 file://…` di una copia col lotto committato, HOME vuota, CI=1 → exit=0, 0,15 s, con la riga esplicita «ho misurato la FORMA del cancello contro il tetto, non un passo nuovo». La CI reale però usa `fetch-depth: 0` (.github/workflows/cancello-lotto.yml:58), quindi il percorso vero è quello di C/E.

## dettaglio
NASCE ROSSO. Due modi, tutti e due misurati, non ragionati.

① IL FRENO SI AVVELENA DA SOLO SULLA SUITE — è il difetto grave.
La cintura anti-ricorsione (`DUE_CASE_DENTRO=1` messo su ogni figlio dentro la casa spoglia) fa fallire 7 dei 24 casi del banco DEL FRENO STESSO. `cervello/test/due-case.test.mjs` lancia il motore con `env: {...process.env, …}` (riga 69): la variabile passa al figlio, il figlio non esegue nessuno ed esce 2, e i 7 casi che si aspettano un verdetto vero diventano rossi.
Conseguenza esatta, misurata sul repo vero con le funzioni del freno: `cervello/test-cervello.mjs` è un passo del cancello con argomenti statici (`maiProvabile: provabile=true`). Un lotto qualsiasi che lo tocca lo rende «riscritto» → il freno lo rilancia nella casa spoglia → la suite lì esce 1 (rotta da due-case.test.mjs) mentre in casa esce 0 → `verdettoDueCase({casa:0, spoglia:1})` = **nasce-rotto** → ❌ → cancello ROSSO. E l'accusa è FALSA: non è la suite a nascere rotta, è il freno che rompe il proprio banco dentro la casa che si costruisce da sé. È la malattia AR-506/511/514/526/534 riprodotta dal medico.
La prima versione moriva con 992 processi annidati; questa non si appende più, ma la cintura che le evita l'appeso le costa un rosso falso su un file che il lotto tocca spesso (è il runner delle 406 prove).

② MONTATO COL SUO LOTTO, IL CANCELLO È ROSSO AL PRIMO GIRO.
In un repo a storia intera con origin/main = stato pre-lotto — cioè esattamente la CI, che ha `fetch-depth: 0` — montando i tre freni nuovi del lotto il freno esce **1**: accusa `porte-gemelle.mjs` e `puntatori-scollegati.mjs` di NASCERE SENZA MORSO. Da solo esce 0; è il lotto intero che non passa.
E la richiesta che fa per assolverli va contro la casa: la domanda ⓑ pretende una mutazione col campo `test` uguale allo SCRIPT del passo, mentre 719 mutazioni su 727 puntano a un `cervello/test/*.test.mjs` — comprese le 6 che il riparatore ha scritto per sé. Chi aggiunge un passo al cancello seguendo la convenzione dominante trova un rosso, non un verde: non è un caso isolato del lotto 51, è la forma normale di ogni passo nuovo.
Il riparatore lo dichiara in «cosa resta scoperto ②» e passa la riparazione a un altro senior. Una dichiarazione non toglie il rosso: il cancello si blocca lo stesso, per tutti.

③ COSTO. 0,16 s quando il lotto non tocca passi del cancello — corretto. Ma quando tocca `test-cervello.mjs` il freno rilancia la suite DUE volte (186 s nella casa spoglia + 210 s in casa) e la corsa completa misurata è **7m35s** su un lotto che ha cambiato una riga di commento. Il cancello concede 600 s a quel passo; questo ne aggiunge quasi 400 fuori budget, per arrivare a un rosso falso. Il riparatore scrive «non ho misurato il costo reale quando il passo toccato è test-cervello.mjs»: adesso è misurato, ed è il caso peggiore che si verifica da solo.

COSA REGGE (per onestà, non sposta il verdetto):
· Clone superficiale: exit 0 in 0,15 s, e dichiara di aver misurato solo la forma del cancello contro il tetto. Non è un verde muto pieno (censisce 22-23 passi, misura il tetto, stampa cosa NON ha guardato), ma va detto che su storia troncata il perimetro «nato/riscritto» collassa e il freno non può mai vedere un passo nuovo.
· Ricorsione su se stesso: chiusa davvero. Montato nel cancello stampa «⚪ NON MI PROVO DA SOLA», torna in meno di un secondo, zero processi appesi (`ps -eo pid,etimes,args | grep '[d]ue-case'` → 0).
· Dipendenze d'ambiente: non serve rete né chiavi né Pannello; `node_modules` non esiste su questa macchina e viene collegato solo se c'è; la corsa «in casa» eredita l'env di chi chiama, quella spoglia lo ripulisce. Nessun blocco da lì.
· Non tocca il repo di chi lo lancia: la casa spoglia è una copia in `mkdtemp`, rimossa nel `finally`.

COSA SERVIREBBE PERCHÉ REGGA:
① `cervello/test/due-case.test.mjs` deve restare verde con `DUE_CASE_DENTRO=1` addosso (togliere la variabile dall'env dei figli che il banco lancia, oppure far sì che il caso salti dichiarandosi ⚪ invece di rosso) — finché non lo è, ogni lotto che tocca il runner delle prove è un cancello rosso;
② oppure `cervello/test-cervello.mjs` va messo fra i passi non rilanciabili (sotto il tetto, con il motivo scritto) — costa un debito dichiarato invece di un rosso falso;
③ la domanda ⓑ va riconciliata con la convenzione di `mutanti.json` (719 su 727 puntano al test): o accetta la mutazione che rende rosso il TEST del guardiano, o il lotto 51 non si consegna finché qualcun altro non riscrive due voci di codice non suo.