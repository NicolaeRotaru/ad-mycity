# Il catalogo delle scorciatoie — i modi veri in cui un pezzo «passa» senza funzionare

> Nato il 23/8/2026, dai quattro giri di collaudo sui tre freni anti-regressione.
> **Leggilo PRIMA di costruire un guardiano o un controllo.** Ogni voce qui è stata MISURATA da un
> collaudatore: comando lanciato, uscita copiata. Nessuna è un'ipotesi.
> Quando un collaudatore ne trova una nuova, si aggiunge qui. È il file che fa risparmiare i giri.

## A. Il pezzo legge una dichiarazione invece di misurare

1. **La carta scritta a mano.** Il controllo chiede a chi aggiunge una cosa di dichiarare cosa fa
   quella cosa. Diventa rosso solo se chi la aggiunge si autodenuncia — e chi si autodenuncia non
   aveva il difetto. *Cura: misura, non chiedere.*
2. **Il rimedio stampato È la scappatoia.** Il controllo stampa «incolla questa voce» e la voce
   arriva precompilata con il valore innocuo e l'impronta già calcolata: chi la incolla salta
   proprio il pezzo che avrebbe misurato. *Cura: il rimedio non deve contenere la risposta.*
3. **Il comando che scrive la dichiarazione al posto tuo.** Un `--aggiorna` che genera la carta che
   il controllo poi legge. Un freno che firma da solo la dichiarazione che deve controllare non è
   un freno.
4. **Il campo alternativo.** Sposti il valore da `legge` a `legge_se_c_e` e l'accusa si spegne, con
   zero byte cambiati nel codice malato.

## B. La prova non prova

5. **La mutazione puntata sul guardiano invece che sulla cosa sorvegliata.** Si pretende «rompi
   qualcosa e dimostra che la prova diventa rossa»: basta rompere il guardiano stesso — o perfino
   scrivere un errore di sintassi in una riga di `import`, così il programma esce 1 — e il verde è
   comprato. *Cura: la mutazione non può toccare lo script sorvegliato né i suoi import.*
6. **La variante comoda in scena.** Il caso di prova mette in scena la versione del difetto che al
   pezzo conviene. Esempio vero: il freno vedeva l'estrazione solo se il commento emigrava col
   codice — ma in questa casa il commento in cima **non si sposta mai**, quindi era verde proprio
   nel caso che succede sempre. *Cura: il collaudatore ricrea la variante SCOMODA.*
7. **L'ancoraggio che non ancora.** Appendere ` --ar-131` a un campo comando, o scrivere `// AR-131`
   in un file dove quel caso non c'è più: forma valida, ancoraggio finto.

## C. Il numero mente

8. **Il numero dichiarato dalla parte comoda.** Il pezzo dichiara «sono cieco sul 40%»: ricontato,
   era l'81%. Un buco dichiarato a meno della metà del suo valore è una spunta verde sopra una
   malattia viva. *Cura: il collaudatore ricalcola sempre, in modo indipendente.*
9. **Il tetto che risale.** Il limite «scende e non risale» si alza con un comando, perché manca il
   `Math.min`. Variante peggiore: togli la chiave dal file e il minimo riparte da zero, così lo
   stesso comando lo alza — e stampa pure la riga rassicurante. *Cura: senza limite leggibile, il
   comando si rifiuta di scrivere.*
10. **Il verde muto.** Zero cose esaminate, uscita 0. *Cura: zero esaminate = ⚪, mai ✅.*

## D. Il metro non misura quello che crede

11. **Il censimento senza controprova.** Il pezzo riconosce solo una forma scritta (una espressione
    regolare) e quello che non sa leggere lo dà per assente: dice «22 censiti» mentre ce ne sono 24,
    ed esce verde. Il grilletto non è malafede — basta il refactor più banale, un aiutante che
    accorcia una riga ripetuta. *Cura: conta anche quelli che NON sai leggere e, se il conto non
    torna, esci ⚪.*
12. **La parola invece della chiamata.** Il pezzo crede che un file «passi dalla guardia» perché la
    parola è scritta lì dentro. Un messaggio d'errore che nomina la funzione, o un import rimasto
    dopo un refactoring, spengono l'accusa. *Cura: guarda le chiamate vere, non il testo.*
13. **La finta CI che non somiglia a quella vera.** Il pezzo si costruisce un ambiente di prova che
    imita il server, ma con la storia del progetto troncata — mentre il server vero la scarica
    intera. Risultato misurato: quattro guardiani ONESTI accusati di nascere rotti, e una riga di
    commento in uno di quei file bastava a bloccare il cancello a tutti. *Cura: leggi come è
    configurato il server vero, non immaginarlo.*
14. **Basta committare.** Il perimetro «nato in questo lotto» si calcola sul confronto con il ramo
    pubblicato: dove la storia è troncata il perimetro collassa e il pezzo non vede più niente,
    restando verde.

## E. Il pezzo rompe la macchina degli altri

15. **Nasce rosso.** Il limite è calibrato su un albero che non contiene il pezzo stesso: appena lo
    monti il conto sale di uno e il cancello si blocca per tutti. Tre volte su tre giri.
16. **La voce fantasma.** La nota «questo strumento non è ancora collegato, lo lancia solo la sua
    prova» diventa una bugia nel momento esatto in cui lo colleghi — e la macchina la marca come
    tale. È un rosso a scoppio ritardato, innescato dall'istruzione di montaggio stessa.
    *Cura: la voce si toglie nello stesso commit che aggancia.*
17. **Il pezzo accusa i fratelli dello stesso lotto.** Metà dei rossi di un giro intero venivano da
    lì. *Cura: nessuna dipendenza fra i pezzi nuovi dello stesso lotto.*
18. **Il pezzo rilancia se stesso.** Cintura anti-ricorsione che confronta stringhe: `./x.mjs` non
    è riconosciuto come «io». Prima versione: 992 processi annidati.
19. **Il pezzo avvelena il proprio banco.** La variabile che evita la ricorsione passa ai figli e fa
    fallire 7 dei 24 casi della sua stessa prova; il pezzo vede la suite rossa, grida «nasce rotto»
    e blocca il cancello — con un'accusa falsa e sette minuti e mezzo di attesa.

## F. Il costo

20. **Il caso peggiore non è quello medio.** Un controllo che costa due decimi di secondo di solito
    può costarne quattrocento quando il lotto tocca il file sbagliato. *Cura: il collaudatore misura
    il caso peggiore, non quello di tutti i giorni.*
