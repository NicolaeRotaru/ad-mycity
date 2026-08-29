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

Sulla macchina restano tuoi anche 46 difetti su 111. Hanno la prova dichiarata umana. Il fix lo faccio io, ma il «sì, è chiuso» lo dici tu.

## Cosa devi fare

Dimmi quale registro e quanto: il sito o la macchina, tutti i gravi oppure metà lista.

C'è uno scambio che conviene conoscere prima di scegliere. Metà del sito sono 184 difetti in 26 pacchetti, ma 111 di quei 184 sono minori. I 128 che pesano davvero, cioè bloccanti e gravi, costano 70 pacchetti: i minori si ammucchiano, i gravi no.

Poi ti arrivano due domande sole. Unisco? Applico la migrazione?

## Cosa non ho verificato

Le squadre in parallelo hanno lavorato una volta sola, il 2026-08-14, e sulla macchina. Erano 6 squadre, hanno riparato 52 difetti su 53, con zero conflitti fra loro.

I cinque referti di riparazione del sito di agosto non nominano mai corsie o lavoro in parallelo. Quindi il parallelo **sul sito** non l'ha ancora provato nessuno, e questo foglio lo dà per buono senza prova.

La ricucitura è durata più del lavoro delle squadre. Le 6 squadre hanno lavorato circa 50 minuti, la ricucitura di più, e 8 problemi rossi sono usciti solo dopo.

Le prove del sito non le ho fatte girare da qui. Ho letto quali comandi esistono, non li ho eseguiti.

Questo foglio non ha un guardiano che lo faccia fallire. Il comando dei pacchetti ce l'ha, il testo no: se un giorno dirà una bugia, nessun controllo se ne accorgerà.

## Dettagli tecnici

> Le voci qui sotto sono state lette il 2026-08-28 sui file veri, da sei lettori in parallelo, e poi bocciate e riscritte da tre collaudatori. Dove c'è un file, quella parte è stata aperta.
>
> ⚠️ **I numeri di questo foglio sono una fotografia, e invecchiano ogni giorno.** Fra la prima e la seconda ora di lavoro di oggi il cantiere della macchina è cambiato sotto le mani, perché un altro lavoro è rientrato su `main`. Il conto vivo lo stampa il comando: le cifre scritte qui servono a capire la forma del problema, non a decidere un lotto.
>
> 📌 I riferimenti sono per **titolo di sezione**, non per numero di riga. Il collaudo del 28/8 ha trovato due citazioni già scadute: le aveva spostate di sei righe la modifica gemella di questa stessa consegna.

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
- `cervello/brief-corsie.md` — il mansionario da consegnare alla squadra, con lo schema del frammento JSON. Non va riscritto qui: due copie di uno standard non sono uno standard.
- `.claude/skills/collaudo/SKILL.md` — chi ha costruito non collauda, due lenti diverse, difetto ricreato nella variante scomoda. Questo foglio e il suo comando ci sono passati il 28/8, e ne sono usciti bocciati con due difetti bloccanti.
- `cervello/scorciatoie-note.md` — le scorciatoie già misurate, da leggere **prima** di costruire. Per esempio il verde muto con zero cose esaminate, l'ancoraggio finto, la parola scritta al posto della chiamata.
- `cervello/cancello-lotto.mjs` — le regole sulle prove che il cancello applica da sé, fra cui la prova con un OR dentro e la prova debole oltre il tetto.

### ③ Il cancello del sito non è quello della macchina

`node cervello/cancello-lotto.mjs` è ancorato alla radice dell'AD e legge `cantiere-difetti.json`. Un'uscita 0 lì **non dice niente** sul repo `NicolaeRotaru/mycity`.

Sul sito oggi il cancello è questo, e sono due comandi:

```
npm run verify                                           # typecheck + lint + test, nel repo del sito
node cervello/radiografia-in-corsa.mjs --repo ../mycity   # il perimetro toccato è stato riguardato?
```

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

⚠️ **Sul sito quel comando non esiste.** Nessuno script scrive `stato` o `chiuso_il` dentro il registro del sito: oggi è una modifica a mano su un file di ottomila righe, con una chiave che si rompe se una squadra ritocca un titolo. Se il passo salta, il lotto successivo ripianifica gli stessi difetti già riparati e nessun rosso lo segnala. È il terzo pezzo della card 185.

### ⑥ Cosa questo lotto non muove

`cervello/tasso-chiusura.mjs` legge **solo** `cantiere-difetti.json`. Chiudere 180 difetti del sito non alza di un centesimo il voto mensile della macchina. Prometterlo sarebbe un numero falso.

### ⑦ Dove si rompe davvero

Il collo di bottiglia non sono le squadre: è la **ricucitura**. Nel lotto del 2026-08-14 il parallelo è durato circa 50 minuti, la ricucitura di più, e 8 rossi sono usciti solo alla fine.

Il costo in contesto per l'AD, **stimato e mai misurato**: circa 6.000 gettoni per l'elenco corto, 16.000 per far partire i pacchetti, 8.000 per le risposte, 20.000 per cancelli, commit e richiesta di unione. Circa 50.000 su una finestra da 200.000. Il resto lo bruciano le squadre, ognuna nella sua.

Due regole tengono basso quel conto: l'AD non apre i file del sito, e ogni squadra torna con al massimo 10 righe. Chi legge il codice al posto suo sono i collaudatori, sul diff, come prescrive la skill del collaudo. L'AD non è cieco sul lavoro: è cieco sul **sorgente**, non sul diff.

### ⑧ Il ripiego, se il repo del sito è chiuso

Il 19/8 la richiesta di unione non è stata aperta: il proxy negava le credenziali per `NicolaeRotaru/mycity`. Il ripiego si decide **prima** di partire: se il repo non è raggiungibile, il lotto si consegna come patch da applicare a mano, e lo si dice in cima alla lettera.

### ⑨ La forma della consegna

Ramo `claude/<slug>`, base `main`, titolo del commit in italiano che descrive il comportamento cambiato. Nel corpo: causa radice, numero di casi di prova e di mutazioni verificate rosse, cosa non è stato fatto, riga `Colore: 🟡`. Le migrazioni del database restano 🔴 e si chiedono a parte, ogni volta.

La lettera a Nicola passa da `node cervello/si-capisce.mjs <file.md>` e dichiara la copertura vera. Il 19/8 erano 81 riparazioni su 104 senza una prova automatica propria: si scrive, non si arrotonda. Ogni lavoro 🟡 lascia la riga ESITO con `node cervello/chiusura-loop.mjs registra …`.
