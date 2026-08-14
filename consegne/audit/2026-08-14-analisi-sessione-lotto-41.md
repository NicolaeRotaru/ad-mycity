---
data: 2026-08-14 21:55
tipo: analisi di sessione
lotto: 41
pr: NicolaeRotaru/ad-mycity#731
---

# Analisi della sessione — il lotto 41, e cosa ha rivelato sul metro

## In parole semplici

Mi hai chiesto di riparare cinquanta difetti della macchina usando squadre in parallelo. Ne sono stati
lavorati 53 e riparati 52. Ma la cosa che conta di più non è quel numero.

**Quasi tutte le scoperte serie della sessione riguardano gli strumenti che misurano, non il codice
misurato.** Il metro diceva «due» dove ce n'erano diciannove. Il banco delle prove chiamava «verde» un
controllo che non aveva guardato niente. Un guardiano aveva smesso di vedere la porta più usata verso
la pubblicazione. Due casi di prova non potevano fallire nemmeno scrivendoci dentro un errore
volontario. Nove prove non giravano da mesi perché manca uno strumento che nessuno installa.

Il codice della macchina era rotto in 52 punti, ed è stato riparato. Ma **gli strumenti che dovevano
accorgersi di quei punti erano rotti in almeno sei modi diversi**, e ogni volta il sintomo era lo
stesso: dicevano verde.

## Cosa cambia per te

Due comportamenti cambiano davvero, e li vedrai appena unisci:

- Il battito del Pannello rifiuta le chiamate da fuori che non hanno il segreto. Il pulsante
  «Aggiorna ora» continua a funzionare.
- Approvare un'azione con la memoria giù **non la esegue più**. Prima la eseguiva, poi diceva
  «riprova», e riprovare la mandava una seconda volta.

Sul telefono: i campi di scrittura non fanno più ingrandire la pagina su iPhone, i bottoni piccoli
sono abbastanza grandi per il dito, e il link che ti arriva su Telegram porta dritto sulle azioni da
firmare.

⚠️ **La richiesta di unione tocca il Pannello: unirla vuol dire pubblicarla.**

## Cosa devi fare

Guardare la PR #731 e decidere. Io non unisco.

Se hai tempo per una cosa sola: leggi il capitolo «Il vero risultato» qui sotto. È lì che c'è la
scoperta che vale più dei 52 difetti.

## Cosa non ho verificato

- **Il VPS.** La macchina passa i segreti a git in un modo nuovo, fuori dalla riga di comando. Ho
  provato che il segreto non compare più fra gli argomenti, e la pubblicazione di questo ramo è
  passata da qui — ma un invio dal VPS si vede solo da lassù.
- **Il vetro dell'iPhone.** Il browser guidato prova la regola (misura del carattere, dimensione del
  bersaglio, dichiarazione della safe-area). Che il telefono si comporti davvero così serve un
  telefono.
- **Un controllo automatico su GitHub resta rosso, e non è mio.** La prova `mappa-in-bacheca`
  fallisce anche sul commit di partenza, in un albero separato che non ha mai visto questo lavoro:
  è rossa su `main` da prima. Verificata nei due punti, non dedotta.
- **Le nove prove in bash restano rosse** dove `bats` è installato, e non le ho toccate: sono debito
  ereditato, registrato come difetto AR-693. Dove `bats` manca — cioè sui controlli automatici — ora
  sono dichiarate ⚪ una per una invece di sparire in un conteggio.

---

# Il vero risultato

## La malattia della sessione: il metro che dice verde

Sei scoperte, tutte con la stessa forma. Le metto in ordine di quanto costano.

### 1. La scheda diceva due, il codice ne aveva diciannove

La scheda del difetto AR-327 descriveva **un** punto in cui la macchina esegue git senza dire quanto
testo può tornare indietro. Oltre un megabyte il comando muore.

Contando sul codice vero: **19 istanze in 14 file**.

Se avessi seguito la scheda avrei messo una toppa su una porta, lasciandone aperte diciotto, e la
prova sarebbe stata verde. Non è teorico: il file del cantiere pesa **1,79 MB**, quindi un lettore
senza tetto che lo legga da git muore oggi, non un giorno.

*Perché conta:* la regola del cantiere dice «la scheda è un indizio, comanda il codice». Questa
sessione le ha dato un numero: la scheda era **nove volte e mezzo più stretta del vero**.

### 2. Nove prove non giravano da mesi, e nessuno poteva accorgersene

Le prove scritte in bash girano solo se è installato uno strumento chiamato `bats`. Non lo installa
nessuno: né i controlli automatici, né il server, né l'avvio di una sessione. In tutto il repo l'unica
traccia è un permesso che nessuno usa.

Senza di lui il banco dichiara «⚪ la prova esiste e nessuno l'ha fatta girare», e il conteggio finale
dice **1 rosso su 243**. L'ho installato e, **sullo stesso identico commit**, i rossi sono diventati
**11**.

Dieci fallimenti veri erano invisibili. Non perché qualcuno mentisse: perché la macchina che misura
non aveva lo strumento per guardare.

### 3. Il banco chiamava «verde» una prova che non aveva guardato

Le prove in bash sapevano già dire «non ho potuto vedere». Quelle in Node no: una prova che dichiarava
di non aver girato usciva **✅**.

L'ho misurato con un file finto che diceva soltanto «non ho girato»: il banco stampava «✅ 1 passati».

È la stessa bugia che il cantiere cura da trenta lotti, con l'aggravante di stare dentro lo strumento
che dovrebbe scoprirla. Riparato: adesso esiste il terzo esito anche per Node, contato a parte e mai
come verde.

### 4. Il guardiano delle porte aveva smesso di vedere la porta più usata

Il lotto ha cambiato il modo in cui il worker chiama git — da `git push` a una forma con le opzioni in
mezzo. Il guardiano che conta le porte verso la pubblicazione cercava le due parole attaccate, quindi
ha smesso di contare **la porta da cui la memoria esce a ogni lavoro, circa ogni dodici minuti**.

Il freno davanti a quella porta c'era ancora: il pericolo era la cecità, non l'apertura. Verificato
ricostruendo il repo com'era prima: otto porte allora, otto adesso, tutte protette.

### 5. Due casi di prova non potevano fallire

In un banco, due casi su diciannove erano scritti in forma asincrona ma venivano lanciati senza che
nessuno li aspettasse: l'asserzione girava dopo che il conteggio era già stato stampato.

Prova: ci è stato messo dentro `1 = 2`. Il risultato restava **«# pass 19 · # fail 0»**.

Altri cinque casi con la stessa forma vivono in tre file che questa sessione non ha toccato.
Registrati come AR-694.

### 6. Una prova a runtime saltava in silenzio anche dove poteva girare

Mentre riparavo la prova che guida il browser, l'ho vista dichiarare «1 asserzione passata». Sei
asserzioni erano attese. Stava saltando — e prima della sessione lo faceva senza dirlo, perché il
percorso a cui cercava il browser era scritto a mano e valeva su una macchina sola.

Adesso ne girano **sei contro il Pannello vero**. I tre difetti di schermo erano stati dichiarati
provati sulla base di una prova che non guardava.

---

# I numeri, con la loro fonte

| misura | prima | dopo | fonte |
|---|---|---|---|
| difetti lavorati | — | 53 | frammenti delle sei corsie |
| difetti riparati | — | **52** | 1 dichiarato aperto (AR-286) |
| prove nuove che eseguono | — | **34 file** | `cervello/test/c[1-6]-*.test.mjs` |
| moduli puri nuovi | — | **10** | 6 condivisi + 4 di supporto |
| mutazioni verificate a mano | — | **52 su 52** | `non-vacuita.mjs --lotto 41` |
| prove deboli (una parola in un file) | 109 | **39** | `tetti-lotto.json` |
| prove con un'alternativa dentro | 11 | **9** | idem |
| difetti riparati senza mutazione | 0 | **0** | idem |
| si dichiara «fatto» senza conferma | 22 | **8** | `malattie.json` |
| un errore ingoiato → schermata verde | 65 | **56** | idem |
| importare un modulo lo esegue | 68 | **66** | idem |
| lettore di git senza tetto | — | **18** censite | malattia nuova |
| righe cambiate | — | +11.604 / −823 | `git diff 46043a1 HEAD` |

**Il numero che guarderei per primo è 109 → 39.** Una prova debole cerca una parola dentro un file:
non frena, non legge, non decide. Era il difetto che teneva in piedi tutti gli altri, perché rendeva
possibile chiudere una scheda senza aver riparato niente.

---

# Come è stato lavorato, e se il metodo ha funzionato

## Sei corsie, territori disgiunti

| corsia | come si rompeva | modulo che cura | difetti |
|---|---|---|---|
| 1 | «fatto» detto senza guardare l'esito | `cancello-atto.ts` | 7 |
| 2 | la pagina non sa dove sei | `pagina-stato.ts` | 6 |
| 3 | la decisione vive dentro il JSX | `tocco-bersaglio` + 2 | 9 |
| 4 | il cancello è un cartello | `c4-cancelli.mjs` | 11 |
| 5 | il metro guarda la finestra sbagliata | `finestra-misura.mjs` | 11 |
| 6 | un referto vecchio passa per verde | `eta-referto.mjs` | 9 |

Poi due corsie in più sugli otto rossi emersi dal cancello.

## Cosa ha funzionato

**Il raggruppamento per malattia.** Sei moduli invece di 52 toppe. Ogni modulo è una decisione tolta
da dove nessuno la poteva eseguire e messa dove un test la esegue davvero. È la ragione per cui i
tetti sono scesi: una toppa ripara un punto, un modulo chiude una forma.

**I territori disgiunti.** Zero conflitti fra corsie in tutta la sessione. L'unica collisione è stata
un falso allarme — la corsia 1 ha letto due file mentre la corsia 3 li stava riscrivendo, e ha
riportato errori che non esistevano più. È esattamente la trappola che il mansionario segnala, e la
regola «nessuna corsia misura l'albero» l'ha contenuta.

**La prova di non-vacuità.** 52 mutazioni su 52 rendono rossa la loro prova. Senza questo passo,
alcune di quelle prove sarebbero state decorative e non l'avrebbe saputo nessuno.

## Cosa NON ha funzionato come previsto

**Il collo di bottiglia non erano le corsie: era la ricucitura.** Le sei corsie hanno lavorato in
parallelo per circa cinquanta minuti. La ricucitura — registri condivisi, tetti, cancello, otto rossi
emersi dopo — è durata di più. Il mansionario lo dice già («dieci lotti pronti e non mergiati valgono
meno di tre mergiati»), e questa sessione lo conferma con i tempi.

**Cinquanta difetti sono oltre la misura consigliata.** Il mansionario dice di spezzare sopra i
quindici. Ne ho fatti 53 perché era la richiesta esplicita, e la PR è di 137 file: nessuno la rilegge
davvero riga per riga. Il rischio è dichiarato, non risolto: **una PR che nessuno rilegge si mergia
per fiducia, e la fiducia non è una prova.**

---

# I miei errori in questa sessione

Li elenco perché una sessione senza errori dichiarati è una sessione mal raccontata.

1. **Ho riscritto due registri per intero cambiando il rientro** (uno spazio → due). Ha prodotto un
   diff fantasma di circa 7.000 righe e avrebbe garantito un conflitto con ogni altro lavoro su quei
   file — cioè esattamente la malattia che il lotto cura. **L'hai trovato tu, non io**, chiedendo
   perché i numeri fossero così alti. Corretto: da +3.712/−3.244 a +469/−1 sui mutanti.

2. **Ho registrato tre difetti nuovi col nome di campo sbagliato** (`nascita` invece di `nato_come`),
   copiandolo da schede vecchie senza verificarlo sul guardiano. Il cancello li ha rifiutati.

3. **Ho censito una malattia con l'elenco dei file noti vuoto**, e il guardiano ha giustamente
   segnalato sedici punti come «nuovi» quando erano preesistenti.

4. **Ho abbassato un tetto prima di aver finito di curare**, e ho dovuto abbassarlo di nuovo.

5. **Ho rotto la risoluzione locale di Playwright mentre riparavo quella dei controlli automatici.**
   Me ne sono accorto solo perché il conteggio diceva «1 passati» invece di sei.

6. **Il mio filtro di lettura non riconosceva le maiuscole** (`NOT ok`), e per un giro ho creduto che
   otto prove fallissero senza dire perché.

Il filo comune dei primi cinque: **ho misurato dopo aver agito invece che prima**. Il sesto è lo
stesso vizio della sessione intera, in piccolo: uno strumento di lettura che non vede quello che
guarda.

---

# Cosa resta aperto

**Tre difetti nuovi registrati** (non nascosti in un numero):

- **AR-693** — 29 prove in bash non le esegue nessuno. Sullo stesso commit: senza `bats` 1 rosso, con
  `bats` 11.
- **AR-694** — sette casi di prova non possono fallire. Due riparati qui, cinque ancora aperti.
- **AR-695** — tutti e venti i tetti sono a margine zero: una riga malata di chiunque fa rosso a chi
  non c'entra.

**Un difetto dichiarato aperto invece che chiuso male:** AR-286, il timbro che dice da quale computer
è stata scritta una misura. Copre i tre artefatti in territorio; gli altri li scrive codice fuori.

**Quattro controlli del cancello non hanno potuto misurare** da questa sessione, perché la copia del
repo qui è tagliata alla storia recente. ⚪ non è verde, ed è dichiarato nella PR.

**Due prove restano rosse**, ma lo erano anche sul commit di partenza: verificato in un albero
separato prima di cominciare.

---

# Cosa proporrei di fare dopo

In ordine di ritorno, non di comodità.

1. **Installare `bats` dove il banco gira davvero** (avvio sessione, controlli automatici, server).
   Costa una riga e restituisce 29 prove che oggi sono decorative. È il buco di copertura più grande
   che questa sessione abbia trovato.

2. **Chiudere i cinque casi di prova che non possono fallire.** Sono cinque punti in cui la macchina
   crede di essere protetta e non lo è.

3. **Portare i 18 lettori di git restanti all'esecutore unico.** Il tetto li tiene fermi, ma fermi non
   vuol dire curati.

4. **Decidere sui tetti a margine zero.** Oggi ogni lotto rischia un rosso che non gli appartiene, ed
   è il modo più veloce per imparare a ignorare un guardiano.

5. **Non ripetere un lotto da 50.** Tre lotti da quindici, mergiati, valgono più di uno da
   cinquantatré che nessuno rilegge.

---

## Dettagli tecnici

- Ramo: `claude/50-difetti-parallel-grouping-xy4iua` · PR **#731** · base `main` (rebase su `46043a1`)
- Quattro commit: `c8859e3` (il lotto) · `cb20326` (gli otto rossi) · `23018cf` (nascita difetti) ·
  `2df3e27` (la prova a runtime e il terzo esito del banco)
- Cancello del lotto: `node cervello/cancello-lotto.mjs --veloce` → **exit 2**, zero violazioni,
  quattro ⚪ (`prove-oneste`, `cantiere non perde difetti`, `consegne senza esito`, `typecheck`) —
  tutti dovuti al clone superficiale della sessione cloud
- Linea di partenza misurata in `git worktree` separato sul commit `54f2fb4` prima di toccare nulla
- Gli stati dei difetti **non** sono stati modificati: restano `aperto`. Le chiusure le applica
  `auto-fix.mjs verifica --applica` dopo il merge (AR-331)
- Nessuna corsia ha committato, scritto nei registri condivisi o lanciato il cancello
