# 💌 Lettera a Nicola — 2026-07-30 05:09

Nicola, mi hai chiesto la radiografia più profonda che avessi mai fatto, e poi mi hai detto la cosa vera:
**«la macchina deve finalmente essere pronta»**. Ho capito. Ti rispondo in ordine.

## Non è pronta. Ma il motivo non è quello che sembra.

Non è che ha tanti difetti. È che ne ha **tre di natura**, e sono il motivo per cui il numero non scende mai.

**Uno.** Non sa distinguere «ho controllato e va bene» da «non ho potuto controllare». Ho contato: **14 guardiani
su 27** non hanno nessun modo di dichiararsi ciechi. Il guardiano della verità unica stampa «✅ Memoria coerente»
ed esce verde **dopo aver letto zero file**, e tre cancelli si fidano di quel verde per pubblicare la memoria.

**Due.** Non sa guardarsi senza toccarsi. Ho lanciato un comando di sola diagnosi e mi ha **riscritto la verità
dei sensori**: da «acceso» a «spento» sette fonti, perché questa sessione non ha le chiavi. In un'ora è successo
quattro volte, tre delle quali da agenti a cui avevo scritto «SOLA LETTURA». Non esiste una modalità di sola
lettura: c'è solo una frase in un prompt.

**Tre.** Non ha un traguardo. In tutta la repo **non esiste una definizione di «pronta»**. L'unico obiettivo è
«cantiere a zero» — e il cantiere si riempie proprio quando la macchina si guarda. Il **14 luglio era a zero**.
Poi: +31, +16, **+176**, **+103**. Non è che non so chiudere i difetti: ne ho chiusi 234, 46 in un giorno solo.
È che guardarmi riempie più in fretta di quanto ripari.

## Cosa ti propongo al posto dello zero impossibile

Cinque comportamenti. «Pronta» non è «zero difetti»: è **questi cinque verdi**, ognuno con il comando che lo prova.

**1. Il cuore batte, e se si ferma lo sai**
❌ l'ultimo giro pubblicato è del 29/7 16:21; il ponte VPS non ha mai pubblicato un referto; AR-365 (allerta su canale spento) e AR-366 (battito che mente) aperti

**2. Un verde è una misura, non una rassicurazione**
❌ 14 guardiani su 27 non hanno uscita cieca; coerenza-fatti esce 0 dopo aver letto 0 file

**3. Guardarsi non cambia ciò che si guarda**
❌ tre scritture non volute in un'ora (verifica-sensori dall'AD, due da sotto-agenti in sola lettura); nessun deny sul vault in .claude/settings.json

**4. Un'azione approvata arriva al mondo una volta sola**
❌ AR-412 aperto; il bottone «Sblocca coda» rimette in coda anche le azioni reali; consenso-azione non ha guardia di consumo

**5. Un ordine vero si può fare, pagare e consegnare**
❌ audit del 29/7: il trigger di protezione ordini cita una colonna cancellata a giugno → negoziante e rider non riescono a far avanzare un ordine dal browser. northstar.consegnati = 0

E i 131 difetti di oggi li ho divisi in due liste invece di versarteli tutti addosso:
**21 bloccano** uno di quei cinque (questa lista deve andare a zero) e **110 sono debito**
(34 a priorità alta): veri, registrati, visibili, ma non tengono in ostaggio il traguardo.

## Una cosa che mi ha fermato, e aveva ragione

Ho provato a mettere tutti e 131 i difetti nel cantiere e **il tuo stesso cancello mi ha bloccato il commit**:
il cantiere è al tetto delle prove deboli (127 su 127) e quel tetto scende e non sale mai. È esattamente ciò
che questo referto sostiene, applicato a me. Quindi i difetti restano nel referto, e nel cantiere entrano un
lotto alla volta, quando il lavoro parte e con una prova che diventa rossa se quel difetto non è riparato.
La macchina, su questo, è già più disciplinata di me.

## Cosa regge davvero

Non è tutto nero, e finora non avevo modo di dirtelo — lo strumento aveva un solo canale, i difetti.
- La suite del cervello — `node cervello/test-cervello.mjs → 113 file, 999 asserzioni, tutte verdi`
- L'organigramma — `node cervello/agent-registry-check.mjs → 120 reali = 120 dichiarati, drift 0`
- Nessun segreto nel repo — `node cervello/scan-segreti.mjs → 0 segreti in 2.157 file versionati`
- I gate delle lezioni — `node cervello/gate-veri.mjs → ogni gate dichiarato può davvero fallire`
- Le mani verso il mondo — `cervello/esegui-azione.mjs → dry-run di default; LIVE solo con firma + allowlist + pausa spenta (AR-103)`
- La CI aggancia il momento giusto — `.github/workflows/test-cervello.yml gira su push del codice e su PR, non solo dentro il giro`
- La macchina sa chiudere i difetti — `234 difetti chiusi su 387; −46 in un solo giorno (28/7)`

## Dove sbaglio io

Ho sbagliato due volte oggi, e voglio che tu lo sappia da me.
- Ho eseguito una diagnosi che ha **sporcato la memoria condivisa**, e me ne sono accorto solo perché ho
  controllato `git status`. Ho ripristinato tutto: l'albero è pulito.
- Ti ho detto che il workflow della radiografia era rotto. **Non era vero**: ho fatto l'esperimento e il guasto
  era passeggero, fuori dalla macchina. Il difetto vero è un altro — quando succede, bruciamo un milione di
  token, non produciamo niente e **nessuno se ne accorge**.

## Cosa mi serve da te

1. **La prima firma non va qui.** Con `consegnati = 0` e il flusso ordini rotto in produzione (audit del 29/7:
   il controllo di sicurezza cerca una colonna cancellata a giugno, negoziante e rider non riescono a far
   avanzare un ordine), lucidare il cervello mentre il corpo non incassa è la scelta sbagliata.
2. **Il prezzo vero.** Il contratto che firmerebbe la prossima bottega dice **12% e nessun abbonamento**; il
   registro dice **10% + 50 €/mese**; il contratto di Pane Quotidiano cita la tua approvazione del 1/7 sul 12%.
   Dimmi qual è quello buono: riscrivo il contratto e apro la caccia nel registro, così una terza copia non
   può più nascere.
3. **Il permesso jolly.** In `.claude/settings.json` una riga sola pre-approva tutti gli script di `cervello/`.
   È la ragione per cui oggi una diagnosi ha potuto riscrivere la verità. Toglierlo è la difesa più economica
   che abbiamo.

Se mi guardassi adesso: non saresti fiero di una macchina pronta, perché non lo è. Ma per la prima volta so
**dirti quando lo sarà**, e come lo verifichiamo senza fidarci della mia parola.
