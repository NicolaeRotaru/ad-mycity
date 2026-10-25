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

## G. La cura che lascia in piedi il debito accanto

21. **Il tetto gemello.** Curi una porta e abbassi il suo tetto, ma lo stesso atto ha un secondo
    tetto rimasto alla misura di prima: la stessa uscita sbagliata passa dall'altra parte. Misurato
    l'11/10/2026 dal decimo collaudo della CI: in `atti-con-porte.json` i tetti delle porte e delle
    esenzioni «per sempre» erano fermi a 1 e 2 dal 25/8, con le misure vere a 0 e 1. Abbassato il
    primo, un'esenzione a scadenza si poteva ancora rietichettare «per sempre» e passava tutto
    verde. *Cura: quando curi un tetto, guarda gli altri tetti dello stesso atto — chi cura un
    debito di solito ne cura due.*
22. **Il legame per nome.** Due registri si riconoscono da un prefisso dell'id o da una frase della
    fonte. Una voce del mondo con quel prefisso fa rosso, un doppione con un altro nome passa, una
    fonte che cita il file di un'altra voce dà un falso rosso. Misurato l'11/10/2026 dall'ottavo
    collaudo della CI, fra lo scadenzario e i registri del cancello. *Cura: il legame è un campo
    apposta, confrontato per uguaglianza; chi non ha il campo non c'entra.*

## H. La riservatezza che si spegne da sola

Misurate il 24/10/2026 da due giri di collaudo e da un montaggio sui dati veri della pre-diagnosi
del sito (`cervello/prediagnosi.mjs`), dove un testo pubblicato per sbaglio non si ritira più.

23. **L'ingresso facoltativo che spegne la rete.** Il confronto con le falle riservate girava solo se
    il journal della corsia privata stava fra gli ingressi. Ma chi pubblica tiene il materiale
    privato lontano dal comando che pubblica: è il gesto naturale. Risultato: rete spenta, una riga
    «⚪ non fatto» e uscita 0. *Cura: l'ingresso che tiene in piedi una difesa si pretende, o si
    ricostruisce da dove era già: mai facoltativo.*
24. **Il revisore a metà.** Su due revisori ne torna uno, e il comando prende quello che c'è. Il giro
    vero era «a 1 su 2» mentre lo si poteva già usare. *Cura: si pretende ogni lente, e che abbia
    riletto qualcosa su QUESTO testo (un'impronta ricopiata dai suoi materiali).*
25. **La seconda passata che cancella la prima.** Un argomento ripetuto vince l'ultimo, e un elenco
    nuovo sostituisce quello vecchio: con i passi naturali le 34 oscurature del mattino sparivano,
    uscita 0. *Cura: gli elenchi si uniscono, e quello che era nascosto nell'uscita di prima resta
    nascosto finché qualcuno non scrive che si può mostrare.*
26. **Il giudizio largo.** «Coprire in più» è giusto quando si nasconde, sbagliato quando si libera:
    un «già pubblico» dato a un nome di territorio che si ripete liberava anche la copia mai letta.
    *Cura: largo quando si chiude, esatto quando si apre.*
27. **La legatura per posizione senza il foglio.** Le ricette si attaccano ai difetti per posizione,
    con il fascicolo a dire di chi parlavano. Senza il fascicolo l'aggancio restava per posizione,
    e un difetto grave usciva «già risolto» con le voci di un altro. *Cura: manca il foglio che
    lega, ci si ferma.*
28. **Il segno che tutti hanno.** Un collaudatore propone un terzo segno per riconoscere le falle
    («id R<n>» nella fonte); il banco lo prova verde. Sul registro vero lo portavano 265 schede
    pubbliche su 539: la radiografia dà quel numero a ogni difetto. *Cura: il banco scrive i
    record normali come li scrive il registro vero, e il montaggio sui dati veri viene prima della
    consegna.*
29. **L'allarme che suona sempre.** La rete delle frasi copiate suonava su otto campi su otto per
    frasi già pubbliche o di contesto dato a tutti («la chiave di servizio che manca»). Un allarme
    che suona a ogni giro insegna a zittirlo alla cieca. *Cura: si toglie quello che è già
    pubblico, e ogni allarme che resta diventa un giudizio scritto, campo per campo.*
30. **L'impronta che non vede l'ordine, e i bersagli scritti per posizione.** L'impronta del testo
    riletto non dipendeva dall'ordine delle voci doppie, ma le oscurature e la memoria le
    indirizzavano per posizione («la seconda lente A»). Cambiato l'ordine dei journal, l'impronta
    tornava uguale e l'oscuratura cadeva sulla voce sbagliata. Sui dati veri un campo oscurato al
    mattino tornava in chiaro, e il comando stampava «nessuna oscuratura tornata in chiaro».
    *Cura: un ordine fisso per le voci, e la memoria cerca il campo in tutte le voci di quel tipo.*
31. **Il giudizio che sopravvive al suo testo.** Un «già pubblico» scritto da una rilettura vecchia
    valeva anche dopo che quel campo era stato riscritto, e zittiva l'allarme sul testo nuovo.
    *Cura: un giudizio che apre vale solo dalla rilettura di QUESTO testo, e solo sul percorso esatto
    che nomina; un giudizio che chiude vale sempre.*
32. **L'elenco di prima che invecchia.** Fra due pubblicazioni il lotto chiude dei difetti: un
    elenco del mattino che ne nominava uno faceva fermare ogni ripubblicazione, e l'unica via era
    ritoccarlo a mano. Il banco provava la seconda pubblicazione sullo stesso registro, mai dopo una
    chiusura. *Cura: la voce su un difetto chiuso si conta e si dice, e quello che era nascosto si
    rinasconde da solo, per chiave, senza dipendere dagli elenchi di ieri.*

## I. La cura che arriva agli scrittori automatici e non a chi scrive davvero

*(Collaudo del 25/10 sul numero delle card che ignorava l'archivio.)*

33. **La regola data a chi scrive a mano come una frase.** Archiviata la card più alta, il numero
    nuovo tornava a essere uno già speso. La prima cura ha corretto i tre scrittori automatici e,
    per l'AD, ha aggiunto una riga alla regola scritta. Ma 23 card su 24, a settembre e ottobre, le
    aveva scritte l'AD a mano, guardando una coda che finiva a #210. *Cura: prima si conta CHI scrive
    davvero; poi a chi scrive a mano si dà il dato pronto (un comando, e la riga nel suo contesto),
    non una frase da ricordare.*
34. **La risposta attesa calcolata con la funzione che si controlla.** La prova sul file vero
    chiedeva a `numeriUsati` quali numeri erano spesi e a `prossimoNumero` (che usa `numeriUsati`)
    quale proporre: se la funzione tornava a ignorare l'archivio, sbagliavano insieme e la prova
    restava verde. Era rossa solo per caso, per un conteggio. *Cura: la risposta attesa si calcola
    in un altro modo (qui, sul testo grezzo), mai con il codice sotto esame.*
35. **La prova che, sotto mutazione, scrive nei file veri.** Una prova faceva girare la pulizia della
    coda puntandola su una coda finta. La pulizia ricava il vault dalla cartella del suo file: con la
    mutazione «l'archivio fisso nel vault» ha scritto la carta finta nell'archivio VERO. La prova è
    diventata rossa, ma il danno era fatto, e il cancello fa girare le mutazioni anche in CI e sul
    VPS. *Cura: un programma che ricava i suoi percorsi da dove sta si prova da una COPIA in una
    cartella temporanea; e chi lancia le mutazioni controlla, dopo ognuna, che i file veri siano
    intatti.*
