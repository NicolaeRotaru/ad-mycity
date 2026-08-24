# ROTTO

## prova eseguita
Tutto eseguito sul repo vero, node v22.22.2. Albero ripristinato identico a fine prova (`diff -q` → OK).

① IL DIFETTO VERO DIVENTA ROSSO — questo REGGE (albero finto, 1 scheda, tetto 0)
$ node cervello/puntatori-scollegati.mjs --json   # caso emigrato in un file nuovo, puntatore indietro
  "esito": "violazione", "quanti": 1, "controllati": 1, "saltati": 0   EXIT=1
$ node --test .../caso-vero.test.mjs → EXIT=0   (il comando della scheda gira ancora e non guarda niente: difetto riprodotto)
Stato sano prima: "esito":"ok", quanti 0, controllati 1, EXIT=0.

② IL BYPASS — SUL REPO VERO, SENZA ENV, CON UN REFACTOR NORMALE (`git mv` di un file di prova)
$ mv cervello/test/sorvegliante.test.mjs cervello/test/sorvegliante-nuovo.test.mjs
$ node cervello/puntatori-scollegati.mjs --json
  "ok": true, "esito": "debito",
  "motivo": "puntatori scollegati scesi da 52 a 42: abbassa il tetto in cervello/tetti-lotto.json",
  "quanti": 42, "controllati": 569, "saltati": 23, "tetto": 52          EXIT=0
23 schede hanno perso il file puntato, il conto del debito è SCESO di 10, e il freno invita ad abbassare il tetto.
Nessun altro freno se ne accorge, misurato nello stesso stato:
  mutazioni-orfane --tutte EXIT=0 · contratto-prova EXIT=0 · prova-ammissibile EXIT=0 · puntatori-scollegati EXIT=0
$ mv (ripristino) → "quanti": 52, "saltati": 0, EXIT=0

③ IL DEFERRAL SU CUI POGGIA IL BYPASS È FALSO — provato a runtime sul cantiere VERO
(il modulo scrive alla riga 114: «il file che non esiste → idem, `proveOrfane`»; il suo test lo ripete alla riga 139)
$ node scratchpad/prova-orfane.mjs   (importa proveOrfane dal cancello e scollegati dal modulo)
  scheda AR-319 stato: chiuso
  proveOrfane(aperti) la vede?   false      ← cancello-lotto.mjs riga 674: proveOrfane(aperti, esiste)
  proveOrfane(TUTTI) la vedrebbe? true
  puntatori-scollegati la conta?  false | saltati: 8
$ node -e '…' → prove a comando: 592 | di cui su schede CHIUSE: 578 (98%)
Cioè: il 98% della popolazione che questo freno dichiara di sorvegliare non ha NESSUN guardiano sull'esistenza del file.

④ VERDE MUTO — cantiere vero (787 schede), nessun file di prova sull'albero
$ PUNTATORI_RADICE=<vuoto> node cervello/puntatori-scollegati.mjs --json
  "ok": true, "esito": "debito", "quanti": 0, "controllati": 0, "su": 787, "saltati": 592, "ciechi": []   EXIT=0
A video: «🧭 PUNTATORI DI PROVA SCOLLEGATI — 0 su 0 controllati (tetto 52) / ⚠️ scesi da 52 a 0: abbassa il tetto».
Zero file letti, zero ciechi dichiarati, uscita verde, e l'invito ad azzerare il tetto.

⑤ Il suo test gira davvero: $ node cervello/test/puntatori-scollegati.test.mjs → # pass 15 # fail 0, EXIT=0.
Ma la riga 248 asserisce `r.saltati === 2` come comportamento VOLUTO: il buco è scritto dentro la prova.

## dettaglio
REGGE il punto 1: ricreato il difetto vero (il caso emigra, il puntatore resta indietro) il freno diventa rosso, exit 1, e il messaggio nomina il caso. Anche il test da 15 casi esegue davvero. Su questo il collega non ha mentito.

ROTTO sui punti 2 e 3, con la stessa causa radice: **un file che manca vale «zero scollegati» invece di «non ho misurato»**. Il modulo ha due porte per lo stesso stato di ignoranza e le manda in direzioni opposte — un file ILLEGGIBILE finisce nei `ciechi` (exit 2, riga 136), un file ASSENTE finisce nei `saltati` (riga 130), che non entrano in nessun verdetto. `verdettoPuntatori` (riga 156) riceve solo `quanti` e `ciechi`: `saltati` e `controllati` non arrivano mai al giudizio, e `controllati === 0` non è mai un cieco.

Conseguenza misurata, non temuta: il refactor più comune di tutti — spostare i test in un file nuovo con `git mv` invece di lasciare indietro il guscio — non solo passa sotto il naso del freno, ma **gli fa scendere il conto**. Rinominando un solo file condiviso da 23 schede, il debito è passato da 52 a 42 e il freno ha stampato «abbassa il tetto in cervello/tetti-lotto.json». Il tetto che «scende e non risale» diventa così un lavandino: l'AD abbassa a 42 in buona fede, 10 puntatori scollegati veri spariscono per sempre dal conto e 23 schede restano a puntare un file che non esiste. Il freno premia esattamente la mossa che dovrebbe punire.

La difesa scritta nel modulo («il file che non esiste lo prende già `proveOrfane`») è falsa e l'ho provata falsa a runtime: `cancello-lotto.mjs` riga 674 chiama `proveOrfane(aperti, esiste)`, e 578 delle 592 prove a comando (98%) stanno su schede CHIUSE. È lo stesso ragionamento che il modulo usa per giustificare la propria esistenza — «la scheda CHIUSA è la più esposta, perché auto-fix non rilegge mai un difetto chiuso» — applicato al contrario nel punto in cui gli faceva comodo. Nessun altro freno copre il buco: nello stato rinominato mutazioni-orfane, contratto-prova e prova-ammissibile escono tutti 0.

E il verde muto è del tipo peggiore: con 592 file saltati e ZERO controllati il freno non tace, **parla** — dice «ogni prova nomina ancora il suo difetto» / «scesi da 52 a 0: abbassa il tetto». Il denominatore `controllati` c'è nel JSON (il modulo cita AR-660 alla riga 238 proprio per questo) ma non è nel testo a video e non tocca l'uscita. La lezione era stata capita per il registro vuoto (exit 2, riga 204) e non applicata al caso gemello.

COSA SERVE PERCHÉ REGGA (tre righe, tutte dentro il suo file — non serve toccare il cancello):
① `saltati` deve entrare nel verdetto: un file puntato che non c'è è un cieco, non uno zero. Passare `saltati` a `verdettoPuntatori` e trattarlo come i `ciechi` (exit 2), oppure — meglio — come violazione quando `saltati` SALE, perché lì il puntatore non è ignoto: è rotto.
② `controllati === 0` (o `controllati` sceso mentre `quanti` scende) non può mai essere «ok» né «debito»: è cieco. Senza questa riga il tetto è abbassabile guardando niente.
③ Il caso di prova che oggi manca: «il file di prova viene RINOMINATO → il freno deve diventare rosso o cieco, mai verde con conto in calo». La riga 248 del test va rovesciata, non conservata.

DA GIRARE ALL'AD COME DIFETTO A SÉ (l'ho trovato verificando, non è colpa di questo lotto): `proveOrfane` gira solo sugli aperti mentre il 98% delle prove a comando è su schede chiuse — un puntatore rotto su una scheda chiusa oggi non lo vede nessuno, mai. È il difetto che rende sfruttabile il buco ①.

NON HO VERIFICATO: il cancello intero (`node cervello/cancello-lotto.mjs`) non l'ho eseguito, come il collega; il clone superficiale non l'ho ricreato; e non ho guardato le 52 schede una per una. Il verdetto ROTTO non dipende da nessuna di queste tre: poggia sul rinomino eseguito sul repo vero e sul confronto proveOrfane(aperti) vs proveOrfane(tutti) eseguito sul cantiere vero.