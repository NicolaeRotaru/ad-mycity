# Il lotto a pacchetti: chiudere molti difetti in una sessione sola

**In due righe.** Questo foglio serve a chiudere tanti difetti in una sessione sola, senza che la finestra dell'AD si riempia. I difetti non si lavorano uno per uno: si raggruppano in pacchetti, e ogni pacchetto va a una squadra con la sua finestra.

## In parole semplici

Riparare un difetto costa poco. Costa tanto **raggiungerlo**: aprire il file, capirlo, provare che il fix regge.

Sul sito i difetti si ammucchiano negli stessi file. Per esempio la pagina del prodotto ne porta 28 dei 361 aperti, da sola. Chi apre quel file una volta ne ripara 28 al prezzo di uno.

Sulla macchina non funziona così. Lassù i file non si ammucchiano, e i pacchetti si fanno per dimensione.

Il conto di oggi, 2026-08-28. Sul sito ci sono 361 difetti aperti su 615 schede: 4 bloccanti, 124 gravi su 361, 233 minori su 361. Sulla macchina ci sono 111 schede aperte su 854, e 65 su 111 le posso chiudere io.

Chi ripara non sono io. Io divido il lavoro, lo distribuisco, ricucio i pezzi e consegno. Le squadre aprono i file e portano la prova che gira.

## Cosa cambia per te

Ti basta una frase per far partire un lotto. Per esempio: «chiudi i gravi del sito».

Vedi una richiesta di unione sola, non venti. Dentro c'è il lavoro di tutte le squadre, già ricucito.

Resta tua la firma sull'unione. Resta tua, separata e 🔴, ogni migrazione del database: una volta applicata non torna indietro.

Un'ondata non gira più all'infinito. Dopo due giri di correzione si ferma da sola, e ti chiede cosa fare. A ottobre la prima ondata ha fatto sette giri di controllo, prima che te lo chiedessi.

Un difetto serio trovato dal controllo non sparisce più per strada. Se la squadra non lo chiude con la sua prova, quel pezzo si ferma subito e te lo porta.

Sulla macchina restano tuoi anche 46 difetti su 111. Hanno la prova dichiarata umana. Il fix lo faccio io, ma il «sì, è chiuso» lo dici tu.

## Cosa devi fare

Dimmi quale registro e quanto: il sito o la macchina, tutti i gravi oppure metà lista.

C'è uno scambio che conviene conoscere prima di scegliere. Metà del sito sono 184 difetti in 26 pacchetti, ma 111 di quei 184 sono minori. I 128 che pesano davvero, cioè bloccanti e gravi, costano 70 pacchetti: i minori si ammucchiano, i gravi no.

Poi ti arrivano due domande. Unisco? Applico la migrazione?

Una terza domanda arriva solo se il giro non si chiude: semplifico, restringo o faccio un giro ancora? Lì ti consiglierò quasi sempre di semplificare. Il 17 ottobre è stata la scelta che ha chiuso il giro.

## Cosa non ho verificato

Le squadre in parallelo hanno lavorato la prima volta il 2026-08-14, sulla macchina. Erano 6 squadre, hanno riparato 52 difetti su 53, con zero conflitti fra loro.

Quella volta la ricucitura è durata più del lavoro delle squadre. Le 6 squadre hanno lavorato circa 50 minuti, la ricucitura di più, e 8 problemi rossi sono usciti solo dopo.

Sul sito il parallelo l'ha provato la prima ondata, dal 14 al 17 ottobre: ogni squadra in una copia sua del codice, 21 problemi seri riparati. Il lavoro delle squadre ha retto. Non si fermava il controllo: più di 600 subagenti in tre giorni.

Le regole che fermano quel giro sono scritte da oggi, 2026-10-25. Non hanno ancora girato su un'ondata vera: il primo conto vero lo darà il referto della seconda ondata.

Quattro regole che fermano il giro il comando dell'ondata le applica da solo. Le ho rotte apposta una per una, e ogni volta la sua prova è diventata rossa.

Sono il tetto dei due giri, lo stop alla terza bocciatura dello stesso pezzo, i difetti piccoli mandati all'elenco, e due controllori solo dove ci sono soldi o dati.

Altre quattro cose le regole le chiedono, e il comando non le fa ancora.

La prima è un controllo solo che rilegga i difetti piccoli e promuova quelli seri. Questo lo faccio io appena il comando mi restituisce l'elenco, prima di ricucire i pezzi.

La seconda è lo stop quando lo stesso pezzo si rompe due volte di fila. Questo io non lo posso fare a mano. Il comando lancia da solo anche il secondo giro di correzione, e io entro solo alla fine. Nel caso peggiore si paga un giro in più su quel pezzo, poi il tetto dei due giri ferma tutto.

La terza riguarda i difetti piccoli nati riparando: non entrano da soli nell'ondata dopo. Restano nell'elenco generale, e li prende solo un piano fatto anche coi difetti piccoli. Alla prima ondata erano 109 nati su 123, quasi tutti. Perché non si accumulino senza che nessuno lo veda, ogni referto li conterà.

Quel conto si poteva ingannare. Bastava scrivere una voce nell'elenco senza lo stato «aperto», come diceva la mia ricetta di prima: il conto segnava zero mentre i difetti crescevano. Adesso il conto guarda ogni voce dell'elenco, anche i difetti vecchi, e diventa rosso se una è scritta male.

La quarta: il controllo cerca solo i difetti che la modifica ha creato. Un difetto vecchio che la modifica rende raggiungibile finisce nell'elenco come vecchio, e in quell'ondata non si corregge.

Cosa conti il tuo limite settimanale non lo so. Per questo ogni referto porterà due conti dei gettoni, e non uno.

Le prove del sito non le ho fatte girare da qui. Ho letto quali comandi esistono, non li ho eseguiti.

Di tutto questo foglio, due pezzi soli hanno un guardiano. Il primo è il conto dell'elenco: una prova lo copia dal foglio e lo fa girare su un elenco finto, con una voce scritta bene e tre scritte male. Il secondo è la ricetta per lanciare un'ondata: la stessa prova la passa al comando vero. Il resto del testo no: se un giorno dirà una bugia, nessun controllo se ne accorgerà.

La frase sullo stop dello stesso pezzo, per esempio, una prova non ce l'ha.

Se un giorno qualcuno riscrive «lo faccio io a mano», nessun controllo diventa rosso. Quella frase la controlla un occhio umano, e la dichiaro così: non è chiusa da una macchina.

## Dettagli tecnici

> Le voci qui sotto sono state lette il 2026-08-28 sui file veri, da sei lettori in parallelo, e poi bocciate e riscritte da tre collaudatori. Dove c'è un file, quella parte è stata aperta.
>
> ⚠️ **I numeri di questo foglio sono una fotografia, e invecchiano ogni giorno.** Fra la prima e la seconda ora di lavoro di oggi il cantiere della macchina è cambiato sotto le mani, perché un altro lavoro è rientrato su `main`. Il conto vivo lo stampa il comando: le cifre scritte qui servono a capire la forma del problema, non a decidere un lotto.
>
> 📌 I riferimenti sono per **titolo di sezione**, non per numero di riga. Il collaudo del 28/8 ha trovato due citazioni già scadute: le aveva spostate di sei righe la modifica gemella di questa stessa consegna.

### ⓪ Prima dei pacchetti, la pre-diagnosi: la ricetta si scrive prima di riparare

Nicola, 24/10/2026: «Dobbiamo risolverli nel minor tempo possibile, riesci a trovare un modo, magari capendo in anticipo come risolverli». Il tempo delle ondate passate non se n'è andato nel riparare. Se n'è andato nello scoprire a lavoro iniziato chi altro chiamava il codice toccato, e nei difetti **nati** riparando: la prima ondata (16-17/10) ha avuto sette riesami, con 15-27 difetti nati ognuno, quasi tutti nel rimborso dei contanti. Si è chiusa semplificando, non con l'ottavo giro.

La pre-diagnosi sposta quella scoperta **prima** del lotto, una volta sola, in sola lettura. Per ogni difetto aperto un senior scrive la ricetta e due revisori provano a smontarla:

| campo della ricetta | a cosa serve alla squadra |
|---|---|
| `ancora_vero` con l'evidenza file:riga di oggi | non riparare quello che un lotto precedente ha già chiuso |
| `causa_radice` e le `cause_comuni` del territorio | una riparazione sola per più difetti |
| `ricetta`, `file_toccati`, `dipende_da` | la modifica esatta, il territorio vero, l'ordine |
| `prova_rossa` | si parte dalla prova che oggi è rossa, non la si inventa alla fine |
| `raggio` e la lente B (`nascite_previste`) | la lista di quello che la riparazione può rompere: è la lista del collaudatore |
| `alternativa_semplice` e `semplificare_invece` | dove togliere o spegnere costa meno che riparare: si chiede **prima** |
| `decisione_per_nicola` | la domanda già scritta, con la raccomandazione: le firme partono il primo giorno, non a metà |

Il giro, in sette passi. La cartella di lavoro sta fuori dai repository, per esempio nello scratchpad della sessione: ci finiscono le falle riservate.

```
node cervello/prediagnosi.mjs prepara --cartella <cartella FUORI dai repository>
# workflow .claude/workflows/prediagnosi.js, una volta per modo: seri · minori · privata
node cervello/prediagnosi.mjs raccogli --cartella <stessa> <journal.jsonl dei workflow>
node cervello/prediagnosi.mjs riservato --cartella <stessa>
# workflow .claude/workflows/prediagnosi.js con args {cartella, modo: "riservatezza"}
node cervello/prediagnosi.mjs raccogli --cartella <stessa> <journal…> --scrivi --riservato <journal della riservatezza> [--riservato <elenco di prima>]
node cervello/prediagnosi.mjs ondate --ricettario <consegne/audit/…-ricettario-sito.json> --repo ../mycity --scrivi
```

Il primo `raccogli` scrive solo il ricettario completo, nella cartella di lavoro. `riservato` ne tira fuori i materiali per i due revisori della riservatezza: tutte le falle, compresi i verificatori e le falle mancate, l'impronta del testo, e i campi che il comando pretenderà giudicati. Il secondo `raccogli` pubblica, oscurando i campi che i revisori hanno segnato. `--riservato` si ripete: il journal dei revisori nuovi più gli elenchi delle riletture di prima, che si sommano. Dagli elenchi di prima valgono solo le oscurature, mai i giudizi «già pubblico». La corsia privata che manca fra i journal, tutta o in parte, il comando la riprende dal ricettario completo della cartella. Il modo «privata» vuole le aree scritte a mano, una per gruppo di falle: `{area, db, schede, cosa}`, con `db: true` dove serve leggere la struttura del database in sola lettura, le schede da ritrovare in `territori.json → privati`, e in `cosa` dove guardare.

Le regole che il comando fa rispettare da sé, provate da `cervello/test/prediagnosi.test.mjs`:

- **Una chiusura vuole due voci d'accordo.** «Già risolto» lo devono dire chi scrive la ricetta e il revisore che aveva il mandato di smentirlo. Una voce sola, o due voci in disaccordo, mandano il difetto «da rivedere». Se una lente è tornata due volte (il modo «lenti» la rilancia), contano tutte e due, in qualunque ordine.
- **Il riservato non esce.** Le falle di sicurezza aperte si lavorano nel modo «privata»: i risultati restano nella cartella di lavoro, che non può stare dentro un repository, nemmeno passando da un collegamento. Nel ricettario pubblico resta il titolo, mai il testo.
- **Si pubblica solo dopo la riservatezza, e solo su quel testo.** `--scrivi` vuole il journal dei due revisori della riservatezza, tornati tutti e due, con qualcosa di riletto e l'impronta del testo di oggi. Se dopo la rilettura cambia un territorio, l'impronta non torna e si rilegge. `--riservato nessuno` vale solo dove non ci sono falle. Il 24/10 tre ricette pubbliche nominavano di passaggio una falla riservata, e la rilettura del pomeriggio ne ha trovate altre.
- **Ogni allarme ha un giudizio scritto.** Un campo che ripete una frase di otto parole di una falla, o un nome che sta solo nelle falle, va oscurato o dichiarato «già pubblico» dal revisore, col perché. Le frasi che stanno già nel registro o nel contesto dato a tutti non suonano. Un'oscuratura che non trova il suo campo ferma tutto.
- **Quello che era nascosto resta nascosto.** Un campo oscurato in un ricettario pubblico di prima si rioscura da solo, riconosciuto per la chiave del difetto, in tutte le voci dello stesso tipo. Per liberarlo serve un «già pubblico» scritto dalla rilettura di oggi, sul percorso esatto. Una voce di un elenco su un difetto chiuso nel frattempo si conta e non ferma niente. Ogni controllo che ferma viene prima di qualunque scrittura.
- **È uno strumento da lanciare a mano.** Tre giri di collaudo, il terzo ancora bocciato: per la regola d'arresto della skill `collaudo` non si aggancia al giro né al cancello. I buchi che restano sono scritti in `consegne/audit/2026-10-24-prediagnosi-sito.md`.
- **Il piano non perde nessuno.** `ondate` conta ogni difetto in un posto solo: squadre, corsie, già risolti, riservati, senza ricetta, da rivedere. Se il conto non torna, o se un difetto serio resta senza ricetta, si ferma. Con `--parziale` va avanti sapendolo, e i difetti fuori dal piano restano scritti nel piano.
- **Il territorio è quello della ricetta.** `ondate --repo ../mycity` mette in un pacchetto i difetti che hanno lo stesso file «caldo», cioè il file che più ricette toccano. Due pacchetti che condividono anche un solo file, esistente o da creare, non stanno nella stessa ondata. Le prove e le migrazioni non contano come conflitto: i numeri delle migrazioni si ricuciono a parte. Una ricetta che cita una cartella intera o un modello con l'asterisco va da sola, in un'ondata sua. La prima versione univa a catena ogni file in comune, e il 24/10 ha fuso 356 difetti in un blocco solo da 315 ore.
- **Le ore in fila sono la squadra più lenta di ogni ondata, sommate.** È il numero che dice quanto dura il lotto, e lo accorciano due cose sole: spezzare il pacchetto più lungo, o semplificarlo. Le ore di squadra contano tutto, anche i difetti senza un file da contare.

Due cose che si imparano solo facendolo:

- **Il motore tiene due agenti per volta per workflow** su una macchina da 4 processori. Il 24/10 la pre-diagnosi è partita come sette workflow insieme, ognuno con una parte dei territori.
- **I territori per mestiere battono quelli per dimensione.** `prepara` li fa per dimensione, che è il punto di partenza. Il 24/10 i seri sono stati riscritti a mano in 13 mestieri: resi e rimborsi, contestazioni, contanti, iscrizioni, rilascio, promesse… Così il senior vede insieme i difetti che si toccano.

### ① I pacchetti si calcolano, non si scelgono a occhio

```
node cervello/pacchetti-lotto.mjs --sito           # metà dei difetti aperti del sito
node cervello/pacchetti-lotto.mjs --sito --gravi   # solo bloccanti e gravi
node cervello/pacchetti-lotto.mjs --macchina       # la macchina, per dimensione
```

Aggiungi `--scrivi` per salvare il piano in `consegne/audit/`, col nome che porta l'ora e la variante, così due piani dello stesso giorno non si cancellano a vicenda; `--quota N` per il numero di difetti, `--max N` per il tetto di un pacchetto. Uscita `0` se il piano è fatto, `2` se non ha potuto misurare: un argomento storto o un registro che ha cambiato forma non producono mai un piano vuoto verde.

Le due chiavi sono diverse, ed è una misura:

| registro | chiave del pacchetto | perché |
|---|---|---|
| sito | il **file** | i difetti si ammucchiano: 208 dei 361 aperti finiscono in pacchetti da almeno tre, misurato il 2026-08-28. Il file è il territorio disgiunto che la skill `cantiere` chiede alle corsie. |
| macchina | la **dimensione** | i file non si ammucchiano (20 difetti su 121 aperti) e nemmeno la causa radice (63 gruppi da uno su 64, misurato sui 72 lavorabili di quel giorno). Per file uscirebbero pacchetti da un difetto. |

**Quella misura non fidarti di leggerla qui: la stampa il comando** a ogni giro, con la riga «Si ammucchiano: N difetti su M». Il 28/8 la stessa cifra scritta a mano in tre posti diversi ne dava tre versioni, e nessuna delle tre si riproduceva.

Il conto vero, il 2026-08-28:

| lotto | difetti | pacchetti | ondate | com'è fatto |
|---|---:|---:|---:|---|
| sito, metà | 184 | 26 | 8 | 3 bloccanti, 70 gravi, 111 minori |
| sito, solo gravi | 128 | 70 | 14 | 4 bloccanti, 124 gravi |
| macchina, tutti i miei | 65 | 18 | 4 | 4 bloccanti, 24 gravi, il resto sotto |

**Il risparmio è quasi tutto nei minori, e va detto.** Metà lista sono 7 difetti per pacchetto, i soli gravi meno di 2. I minori si ammucchiano nello stesso file, per esempio contrasti e testi alternativi della stessa pagina. I gravi stanno sparsi. Un lotto grosso fatto di minori abbassa il conteggio senza cambiare un comportamento, ed è quello che l'asticella vieta di chiamare «fatto».

**La quota è un budget, non il criterio.** `cervello/come-riparo.md`, sezione ①, dice che il lotto si fa per malattia e non per conteggio. Vale anche qui: il criterio resta il territorio, e la quota dice solo dove ci si ferma. Il comando sceglie i pacchetti dal più affollato al meno, quindi la coda che resta fuori può contenere un bloccante che abita in un file poco frequentato. La riga «Fuori dal lotto» stampa anche le gravità: si legge, non si salta.

**Le ondate le calcola il comando.** La skill `cantiere` misura che «tre-cinque corsie è la misura giusta», e il comando usa cinque. Due pacchetti che condividono anche un solo file non finiscono mai nella stessa ondata, e le coppie che si toccano vengono stampate col file in comune. Sul lotto dei gravi sono 58 coppie su 70 pacchetti: senza le ondate, sarebbero state 58 occasioni di riscrivere il lavoro di un altro.

### ② Le regole del lavoro non stanno qui (owner unico)

Questo foglio è la **casistica del sito** e l'aritmetica dei pacchetti. Lo standard del lavoro in parallelo sta altrove, e in caso di divergenza **comanda la skill**:

- `.claude/skills/cantiere/SKILL.md`, sezione sulle corsie parallele — territori disgiunti, la dose delle corsie, nessuna corsia committa, nessuna corsia scrive nei registri condivisi, nessuna corsia misura il cancello, come si ricuce contro `main`.
- `.claude/skills/cantiere/SKILL.md`, sezione «Il giro che converge» — le otto regole che fermano il giro riesame → correzione: chi verifica cosa, i minori nati al registro, il riesame sul delta, due giri di correzione e poi Nicola, il peso di ogni agente, la misura nel referto. Qui sotto c'è solo come si applicano al sito.
- `cervello/brief-corsie.md` — il mansionario da consegnare alla squadra, con lo schema del frammento JSON. Non va riscritto qui: due copie di uno standard non sono uno standard.
- `.claude/skills/collaudo/SKILL.md` — chi ha costruito non collauda, due lenti diverse, difetto ricreato nella variante scomoda, e il dosaggio: due collaudatori solo dove il pacchetto tocca soldi, dati o permessi. Questo foglio e il suo comando ci sono passati il 28/8, e ne sono usciti bocciati con due difetti bloccanti.
- `cervello/scorciatoie-note.md` — le scorciatoie già misurate, da leggere **prima** di costruire. Per esempio il verde muto con zero cose esaminate, l'ancoraggio finto, la parola scritta al posto della chiamata.
- `cervello/cancello-lotto.mjs` — le regole sulle prove che il cancello applica da sé, fra cui la prova con un OR dentro e la prova debole oltre il tetto.

### ③ Il cancello del sito non è quello della macchina

`node cervello/cancello-lotto.mjs` è ancorato alla radice dell'AD e legge `cantiere-difetti.json`. Un'uscita 0 lì **non dice niente** sul repo `NicolaeRotaru/mycity`.

Sul sito oggi il cancello è questo, e sono due comandi:

```
npm run verify                                           # typecheck + lint + test, nel repo del sito
node cervello/radiografia-in-corsa.mjs --repo ../mycity   # il perimetro toccato è stato riguardato?
```

**Quel cancello lo lancia solo l'AD**, una volta per ondata, dopo la ricucitura e ad albero fermo. Le squadre non lanciano mai `npm run verify`: dentro una squadra la suite intera entra nel contesto e si rilegge a ogni turno dopo. Le prove della squadra, nel suo worktree, sono una sola chiamata:

```
node cervello/prova-sito.mjs --repo <worktree della squadra> --file app/a.ts,lib/b.tsx
```

Fa le stesse tre domande di `verify` — il tipo sul progetto intero, il lint sui file dati, le prove collegate a quei file con `vitest related` — e stampa al massimo 30 righe; il resto va in un log, di cui stampa il percorso. Esce `0` verde, `1` rosso, `2` se non ha potuto girare: un repo senza `node_modules` o un comando che manca non danno mai un verde. Un file senza prove collegate dà un verde vuoto, e lo dice. ⚠️ `vitest related` sulla versione del sito non si è potuto provare: in questa macchina il sito non ha `node_modules`.

⚠️ **È un passo indietro dichiarato.** `cervello/come-riparo.md`, sezione sul cancello di uscita, dice che cinque comandi da ricordare erano cinque occasioni di dimenticarne uno, e li ha ridotti a uno. Sul sito quel comando unico non esiste ancora. Finché non esiste, questo è debito, non una scelta.

Cosa fa davvero la CI del sito (`.github/workflows/ci.yml`): parte su push a `main` e a `claude/**`, **e su ogni richiesta di unione verso `main`**. Gira `lint` e `build` (tetto 15 minuti), i test unitari (tetto 10), l'integrazione con un Supabase locale, i controlli sul database, e `npm run db:types` seguito da `git diff --exit-code lib/database.types.ts`. La CI **non lancia mai** `npm run verify`. Gli `e2e` si auto-saltano senza i segreti di prova: non sono un cancello, quindi non possono essere l'unica prova di un grave chiuso.

### ④ Quale prova vale, per gravità

- **lib/ordini, lib/stripe, lib/cart, lib/api** → test unitario in `tests/unit/*.test.ts` (vitest). È il cancello vero.
- **permessi e privacy del database** → `tests/sql/rls/*.test.sql`, con `bash tests/sql/harness/apply.sh` e `run.sh`.
- **pagine (`app/product`, `app/checkout`, `app/cart`)** → nessun test unitario le importa come modulo. Nel repo del sito ci sono però almeno 12 prove che leggono il sorgente della pagina e verificano un invariante di comportamento, per esempio che la vetrina non offra ciò che la cassa rifiuta. Quella è una prova. Cercare una parola per dire «riparato» non lo è: è il grep che l'asticella vieta.
- **minori** → il grep resta ammesso, come dice il manuale.

⚠️ **Un buco dichiarato.** Sul registro del sito il campo `verifica` non esiste nello schema: lo portano 4 schede su 615 e nessuno lo legge. Quindi sul sito **non si può dichiarare** una prova umana come si fa sulla macchina. Finché quel campo non entra nello schema e in un guardiano, un grave su una pagina o ha una prova che gira o resta aperto.

### ⑤ La chiusura si scrive dopo l'unione, e ha una chiave fragile

Le schede del sito **non hanno un id**: la chiave è `dimensione|titolo` normalizzati, e la fa la funzione `chiaveProblema` di `cervello/referti-sito.mjs`. Non va imitata a mano: il primo collaudo del comando ha trovato 356 chiavi su 361 che non combaciavano, perché copiavo il formato invece di chiamare la funzione. Una squadra che ritocca il titolo mentre ripara scollega la chiusura, e al referto successivo il difetto risulta di nuovo aperto.

Gli stati chiusi ammessi sono `chiuso`, `riparato`, `gia_riparato_prima` (`cervello/radiografia-marketplace-conti.mjs`). `gia_riparato_prima` è la casella per i difetti trovati già a posto: il 20/8 erano 8 su 141, il 22/8 15 su 100. Vanno aperti nel codice uno per uno, non ricontati come lavoro nuovo.

Il formato da scrivere è `chiuso_il` come `AAAA-MM-GG HH:MM` più `chiuso_da` con la PR e il commit. Il registro non è uniforme: delle 254 schede chiuse, 35 non hanno affatto `chiuso_il` e altre portano la data secca senza l'ora. È il formato da usare, non lo stato in cui si trova il file.

Sulla macchina gli stati **non si toccano dentro il lotto**: restano `aperto`, e le chiusure le applica `node cervello/auto-fix.mjs verifica --applica` dopo l'unione.

**Sul sito il comando adesso c'è:** `node cervello/chiudi-sito.mjs <cartella dei frammenti> --pr <n> --commit <sha>`, a vuoto finché non gli dai `--applica`. Chiama `chiaveProblema` invece di imitarla, e chiude solo un difetto che porta una prova che gira: un `riparato` senza `verifica_comando` e senza `non_vacuita` non chiude niente. Esce `1` se una chiave non aggancia niente, `2` se non ha potuto leggere. Fino al 28/8 era una modifica a mano su un file di ottomila righe: era il terzo pezzo della card 186.

### ⑥ Cosa questo lotto non muove

`cervello/tasso-chiusura.mjs` legge **solo** `cantiere-difetti.json`. Chiudere 180 difetti del sito non alza di un centesimo il voto mensile della macchina. Prometterlo sarebbe un numero falso.

### ⑦ Dove si rompe davvero

Il collo di bottiglia non sono le squadre: è la **ricucitura**. Nel lotto del 2026-08-14 il parallelo è durato circa 50 minuti, la ricucitura di più, e 8 rossi sono usciti solo alla fine.

Il secondo collo di bottiglia l'ha mostrato la prima ondata del sito, dal 14 al 17 ottobre: **il giro riesame → correzione che non si ferma**. Sette riesami, con 15, 18, 16, 21, 20, 6 e 27 difetti nati: 123 in tutto, 109 minori. Le regole che lo fermano stanno nella skill `cantiere`, sezione «Il giro che converge».

**Il costo, misurato il 2026-10-25** sui transcript veri. Il 28/8 qui c'era una stima mai misurata: circa 50.000 gettoni per l'AD su una finestra da 200.000, «il resto lo bruciano le squadre». Sbagliava la forma del conto. Il consumo è una moltiplicazione: **contesto fisso × turni × agenti**.

| cosa | gettoni | fonte |
|---|---:|---|
| un agente `general-purpose`, primo turno | 91.078 | sonda `wf_604836fb-b6a`, 25/10 |
| un senior con gli strumenti ristretti, come `tech`, primo turno | 53.210 | stessa sonda |
| un agente `Explore`, primo turno | 45.394 | stessa sonda |
| gli analisti di quel giorno, primo turno | 94.086 | stessa misura |
| il ciclo principale, l'AD, a ogni turno | 162.343 | 25/10, prima del taglio del CLAUDE.md; l'elenco dei 120 senior pesava 107 KB. Dopo il taglio non rimisurato |
| un analista da 29 turni, entrata | 3.632.127 | 102.191 scritti in cache, 3.529.878 letti dalla cache |
| lo stesso analista, uscita | 10.156 | meno dell'1% del suo conto |

Circa **tre quarti** dell'entrata di quell'analista è il contesto fisso, riletto a ogni turno. Dentro un agente di workflow, quel contesto fisso è fatto così: gli strumenti dell'ambiente circa 42.500 gettoni (lo strumento Artifact da solo ha 59 KB di definizione), il CLAUDE.md di quel giorno circa 37.500 (73 KB, a circa 1,95 caratteri per gettone, misurato per differenza; lo stesso lavoro lo porta a circa 35 KB, e il conto dopo il taglio non è stato rifatto), l'elenco delle skill circa 6.000. I sei strumenti di lavoro — Read, Grep, Glob, Bash, Edit, Write — pesano 14.851 byte in tutto.

Quindi accorciare le risposte non sposta quasi niente. Sposta il conto togliere **un agente** o **un turno**, e leggere meno righe: ogni riga letta resta nel contesto e si rilegge a ogni turno dopo.

La prima ondata, con quel metro: più di 600 subagenti in tre giorni; dal quarto riesame in poi 342 subagenti e 64 milioni di gettoni. Il modello ricostruito dà circa 762 subagenti, di cui 513 verificatori: il 67%. Il «64 milioni» è il numero che il motore dei workflow chiama `subagent_tokens`, e non coincide con nessuno dei due contatori di `conto-token.mjs`. Sul run `wf_3e744be2` del 25/10 il motore dava 695.274, il contatore senza le letture dalla cache 800.222, quello con le letture 24.450.213. **Cosa conti il limite settimanale di Nicola non è noto**, e si dice così.

Il conto vero di un'ondata si legge a fine giro:

```
node cervello/conto-token.mjs --workflow <runId>      # basta l'inizio dell'id; --json per i numeri in chiaro
```

Stampa gli agenti per fase e i gettoni con e senza le letture dalla cache. La stima del contesto fisso che stampa è una stima, e lo dichiara: sbaglia un po' se un agente compatta il contesto a metà strada.

Due regole tengono basso il conto dell'AD: l'AD non apre i file del sito, e ogni squadra torna con al massimo 10 righe. Chi legge il codice al posto suo sono i collaudatori, sul diff, come prescrive la skill del collaudo. L'AD non è cieco sul lavoro: è cieco sul **sorgente**, non sul diff.

### ⑧ Il ripiego, se il repo del sito è chiuso

Il 19/8 la richiesta di unione non è stata aperta: il proxy negava le credenziali per `NicolaeRotaru/mycity`. Il ripiego si decide **prima** di partire: se il repo non è raggiungibile, il lotto si consegna come patch da applicare a mano, e lo si dice in cima alla lettera.

### ⑨ La forma della consegna

Ramo `claude/<slug>`, base `main`, titolo del commit in italiano che descrive il comportamento cambiato. Nel corpo: causa radice, numero di casi di prova e di mutazioni verificate rosse, cosa non è stato fatto, riga `Colore: 🟡`. Le migrazioni del database restano 🔴 e si chiedono a parte, ogni volta.

Il referto dell'ondata porta **la riga del conto**, letta e non stimata: gli agenti per fase (squadre, collaudatori, riesame, verificatori, correzioni) e i gettoni veri da `node cervello/conto-token.mjs --workflow <runId>`, **con e senza** le letture dalla cache. Due numeri e non uno, perché cosa conti il limite settimanale non lo sappiamo. Accanto va **quanti minori nati aspettano nel registro**: oggi non entrano da soli nell'ondata dopo (skill `cantiere`, R-B), e un numero scritto a ogni referto è l'unico modo di vederli crescere. Si contano così, dalla radice dell'AD:

```
node -e 'const p=JSON.parse(require("fs").readFileSync("MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json","utf8")).problemi; const pieno=(v)=>typeof v==="string"&&v.trim()!==""; const manca=(d)=>[["titolo",pieno(d.titolo)],["severita",["bloccante","grave","minore"].includes(d.severita)],["file",pieno(d.file)],["stato",["aperto","chiuso","riparato","gia_riparato_prima"].includes(d.stato)],["dimensione",pieno(d.dimensione)],["fonte",d.stato!=="aperto"||pieno(d.fonte)]].filter((c)=>!c[1]).map((c)=>c[0]); const male=p.map((d)=>[d,manca(d)]).filter((x)=>x[1].length); const nati=p.filter((d)=>d.stato==="aperto"&&/^nato dal lotto/.test(d.fonte||"")).length; console.log("voci: "+p.length+" · nati dal lotto in attesa: "+nati+" · scritti male: "+male.length); for (const [d,m] of male) console.log("  scritto male: "+(pieno(d.titolo)?d.titolo:"(senza titolo)")+" — manca o non vale: "+m.join(", ")); process.exit(male.length?1:0)'
```

Il conto guarda **tutte** le voci del registro, non solo i nati: il passo 5 di ⑩ scrive anche i preesistenti, e fra loro ci sono i gravi. Esce `1` su ogni voce a cui manca, o non vale, uno dei campi che il passo 5 scrive, e stampa il titolo coi campi che mancano. Sono i campi che leggono gli altri comandi:

- `titolo` e `dimensione` fanno la chiave: senza, la chiusura non aggancia la voce.
- `severita` deve valere `bloccante`, `grave` o `minore`. È il campo su cui filtra `--gravi`: una voce che tiene `gravita`, come la chiama il workflow, esce dal piano dei gravi.
- `file`: senza, la voce cade nel pacchetto «(nessun file citato)». Un `dove` al suo posto non conta.
- `stato` deve essere uno di quelli del registro: `aperto`, `chiuso`, `riparato`, `gia_riparato_prima` (⑤). Senza, la voce non la vede nessun comando.
- `fonte` si pretende sulle voci aperte, perché è da lì che il conto riconosce un nato. Il 25/10 le voci senza fonte erano 11 su 1396, tutte chiuse.

Resta fuori solo `descrizione`, che il passo 5 scrive quando c'è una prova: senza, nessun comando perde la voce. La prova del conto è `node cervello/test/lotto-a-pacchetti-conto.test.mjs`: copia questa riga dal foglio e la fa girare su un registro finto. *Perché:* la ricetta della correzione 1 scriveva voci senza `stato` e con `dove` al posto di `file`, e il conto stampava 0 mentre crescevano. Il conto di prima guardava solo i nati, e solo tre campi: un grave preesistente scritto male usciva dal piano `--gravi` col conto a zero. Uno zero che non può fallire è un verde muto (`cervello/scorciatoie-note.md`).

Il workflow stampa il comando già pronto nell'ultima voce di `poi`, col suo `runId` quando il motore glielo dà; altrimenti al suo posto c'è `<runId>`, da riempire a mano. Un referto senza quella riga torna alla stima del 28/8, che sbagliava la forma del conto.

La lettera a Nicola passa da `node cervello/si-capisce.mjs <file.md>` e dichiara la copertura vera. Il 19/8 erano 81 riparazioni su 104 senza una prova automatica propria: si scrive, non si arrotonda. Ogni lavoro 🟡 lascia la riga ESITO con `node cervello/chiusura-loop.mjs registra …`.

### ⑩ Come si lancia un'ondata

**Un'ondata non si orchestra a mano.** L'ondata 1 l'ha fatto: ogni passo era un turno del ciclo principale, e ogni turno dell'AD partiva da 162.343 gettoni (misura del 25/10, prima del taglio del CLAUDE.md). La fa girare `.claude/workflows/ondata-sito.js`; l'AD entra all'inizio e alla fine.

```
# 1. il piano dei pacchetti, salvato UNA volta. Con --gravi porta solo bloccanti e gravi:
#    i minori nati dopo non ci entrano mai (skill cantiere, R-B)
node cervello/pacchetti-lotto.mjs --sito --gravi --scrivi
# 2. le schede di UN'ondata, già tagliate e senza storia (esce 2 se una scheda non si ritrova)
node cervello/schede-pacchetto.mjs --piano consegne/audit/<piano>.json --ondata <N> --json
# 3. il workflow ondata-sito, con questi args:
#    { schede: <l'uscita del passo 2, così com'è>, repo: <radice della copia del sito>,
#      radice_ad: <radice dell'AD>, base: <git -C <repo> rev-parse HEAD> }
#    i due tipi hanno già il valore giusto, tech e qa: non si passano
# 4. a fine giro, il conto (il comando pronto è nell'ultima voce di «poi»)
node cervello/conto-token.mjs --workflow <runId>
```

- **Chi lavora: due tipi, scelti dai permessi del mestiere e non dal nome del passo.** `tipo_costruisce` (`tech` se non lo dai) scrive o muta: squadre, rifacimenti, correzioni, la lente A del collaudo, la lente unica dei pacchetti senza rischio (che porta anche la A), e il verificatore dei gravi nati, che deve far diventare rossa una prova. `tipo_controlla` (`qa` se non lo dai) legge e basta: la lente B dei pacchetti a rischio e i revisori del riesame, che leggono un diff. *Perché:* il mansionario di `qa` tiene il codice del sito in sola lettura e git fuori dalle sue mani, quindi un `qa` non può ricreare un difetto con una mutazione. I vecchi `tipo` e `tipo_controllo` fermano il workflow con un errore che dice i nomi nuovi. Mai `general-purpose`: 91.078 gettoni al primo turno contro i 53.210 di `tech` (⑦). La prova è «il tipo segue i permessi» in `cervello/test/ondata-sito.test.mjs`; che la ricetta qui sopra lanci davvero quei tipi lo prova `cervello/test/lotto-a-pacchetti-conto.test.mjs`, che legge gli args dal foglio e li passa al workflow vero.
- **Il tipo snello `squadra-sito` è una proposta, non ancora firmata da Nicola.** Un agente coi soli sei strumenti di lavoro partirebbe da circa 35.000 gettoni invece dei 53.210 di `tech`. È una stima fatta con le parti misurate in ⑦, non una misura. Non si è potuta provare: l'elenco dei tipi si carica solo all'avvio della sessione, quindi un tipo nuovo non gira nella sessione che lo crea. Con la firma, si passa `tipo_costruisce: "squadra-sito"`.
- **I freni** che si danno da fuori sono `max_agenti` (45 se non lo dai) e `riserva`. Dentro il codice ce ne sono altri due: al massimo due giri di correzione (`MAX_GIRI`), e al massimo due rifacimenti per pacchetto (`MAX_RIFACIMENTI`), cioè alla terza bocciatura il pacchetto si ferma. Una parte del tetto resta al riesame, perché è la rete dell'ondata intera. L'autore del workflow stima 24-41 subagenti per ondata: è una stima, la misura la dà il passo 4.
- **Un grave nato nel collaudo non sparisce.** Prende la sua chiave, `nato|file|titolo`, e arriva al rifacimento in JSON, con la regola: fra i `chiusi` solo con la prova rossa-poi-verde, altrimenti nei `parziali` col perché. Dopo il rifacimento il workflow cerca la chiave fra i chiusi di quel frammento. Se manca — parziale, taciuta o scritta diversa — il pacchetto si ferma subito, senza spendere un ricollaudo. Un grave dichiarato chiuso esce dal conto solo quando un collaudo dopo regge: il ricollaudo riceve i motivi della bocciatura e i gravi da rilanciare. Lo stesso vale per il collaudo della correzione dopo il riesame. Il grave fermo esce in `gravi_aperti` col perché della squadra, una volta sola anche dopo tre bocciature, e accende `chiedi_a_nicola`. *Perché:* prima arrivava al rifacimento come testo senza chiave, e il ramo dei soldi usciva «regge» col grave sparito.
- **Il risultato** porta `pacchetti` (chiusi e parziali di ognuno), `fermi`, `gravi_aperti` (anche quelli nati nel collaudo, col loro perché), `registro` (minori nati e preesistenti), `smontati`, `agenti`, `chiedi_a_nicola` col `motivo`, e `poi`.

Cosa fa l'AD col risultato, in quest'ordine:
1. **Se `chiedi_a_nicola` è vero, si ferma.** Porta a Nicola il `motivo` con le tre strade — semplifica, restringi, un giro ancora — e la sua raccomandazione. Non rilancia da solo. Se due `gravi_aperti` stanno nello stesso file, la raccomandazione è semplifica.
2. **Fa il triage dei minori**, finché il workflow non ha il suo agente: legge il `registro` e promuove a grave il minore nato che lo è. Il pacchetto di quel minore non si ricuce, e il grave va nella domanda a Nicola come un grave aperto.
3. **Ricuce** i rami dei pacchetti che reggono e lancia il cancello di ③, una volta, ad albero fermo.
4. **Apre la richiesta di unione** (⑨). Il suo numero serve al passo dopo.
5. **Scrive il `registro`** nel registro del sito, cioè in `problemi[]` di `radiografia-marketplace.json`. Il workflow e il registro chiamano gli stessi campi con nomi diversi, e un campo sbagliato non dà errore: la voce sparisce. Ogni voce prende questi campi, tutti:
   - `titolo` ← `titolo`, uguale: con `dimensione` fa la chiave (`chiaveProblema` è `dimensione|titolo`).
   - `severita` ← `gravita`.
   - `file` ← `dove`, così com'è, anche con la riga. Il registro non ha un campo `dove`: `pacchetti-lotto.mjs` prende il file da `file`, e tutte le 1396 schede del 25/10 ce l'hanno.
   - `stato: "aperto"`. Il workflow non lo manda; senza, la voce non la vedono né `pacchetti-lotto.mjs` né il conto di ⑨, che filtrano su `stato`.
   - `dimensione`, che il workflow non manda: da `lenti_per_file` delle schede del passo 2, col file di `dove` senza la riga; se il file non c'è, dalla `lente` del pacchetto nominato in `pacchetto`.
   - `fonte`: per i nati «nato dal lotto #<numero della richiesta di unione appena aperta>», o «nato dal lotto <ramo>» se non si è potuta aprire (⑧); per i preesistenti, la fonte del riesame.
   - `descrizione` ← `prova`, quando c'è.

   Prima di aggiungere una voce si cerca la sua chiave nel registro: un preesistente spesso c'è già, e non si duplica. Poi si lancia il conto di ⑨: se dice «scritti male» più di zero, si corregge prima del referto.
6. **Scrive la riga del conto** nel referto (⑨), e le chiusure dopo l'unione (⑤).

⚠️ **Quello che l'AD non può fare:** il freno «stesso modulo due volte di fila». Quando rientra, il workflow ha già lanciato da solo la correzione 2, e `gravi_aperti` non dice in quale giro è nato ogni grave. È debito del workflow (skill `cantiere`, R-D), non un compito dell'AD.

⚠️ **Un ponte che manca.** `chiudi-sito.mjs` legge i frammenti delle corsie, uno per difetto con la sua prova; il workflow restituisce le chiavi chiuse per pacchetto. Il passaggio dall'uno all'altro non l'ha scritto nessuno, e non l'ho provato: va risolto prima della prima chiusura di un'ondata lanciata così.
