---
name: cantiere
description: >-
  Aprila PRIMA di contare i difetti, aprire il cantiere o cercare la scheda di un AR-xxx: è il
  mansionario per RIPARARE i difetti del cantiere di auto-coscienza della macchina
  (MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json) — si sceglie per malattia e non
  per conteggio, e si consegna solo col cancello verde. Vale ogni volta che Nicola — in qualunque
  forma, anche detta male o a voce — chiede di risolvere, sistemare o chiudere i difetti o i
  bloccanti della macchina, di fare o continuare un lotto, di abbatterne il numero, di sistemare ciò
  che una radiografia ha già trovato, o nomina un codice AR-\d+; anche se la richiesta è vaga
  («sistema i difetti principali»), è una domanda («quanti ne restano», «come ne chiudi di più») o
  parte dallo stato («sono ancora aperti», «da dove eri rimasta»). Lo stato si guarda DOPO. NON è
  per i bug del marketplace o del Pannello, non è il giro, e non è la radiografia: quella TROVA i
  difetti, questa li RIPARA.
---

# Un lotto di riparazione — il mansionario

> Nato il 28/7 da Nicola: *«puoi risolvere questi difetti molto meglio, ma non so cosa dirti per
> fartelo fare.»* **Non deve saperlo.** Una qualità che dipende dalla frase giusta è la malattia che
> il cantiere cura da ventinove lotti. Perciò lo standard non sta in un file da aprire: sta qui, si
> carica da solo, e il testo lungo resta in `cervello/come-riparo.md`.

---

## La regola che sta sotto a tutto

**Un difetto non è chiuso quando quel punto guarisce: è chiuso quando la malattia smette di potersi
ripresentare.**

Se stai per scrivere un fix che ripara un punto e lascia in piedi il modo in cui quel punto si è
rotto, fermati: stai facendo un lavoro che dovrà essere rifatto.

---

## ① Scegli per MALATTIA, non per conteggio

Dieci difetti scollegati sono dieci mini-lotti impilati: stesso lavoro, PR illeggibile, e se uno è
sbagliato si blocca tutto. Dieci difetti con **una** malattia si riparano con **un** modulo
condiviso, e la PR si legge in cinque minuti.

```bash
node cervello/cantiere-prove.mjs      # quanti aperti · quali NON possono chiudersi da soli
node cervello/spazzata-fratelli.mjs   # le malattie censite e i loro tetti
node -e "const d=require('./MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json').difetti.filter(x=>x.stato==='aperto');
const g={};d.forEach(x=>g[x.dimensione]=(g[x.dimensione]||0)+1);console.table(g)"   # per dimensione
```

Poi leggi i candidati per intero — `causa_radice` e `fix_proposto`, non solo il titolo — e raggruppa
per **come si è rotto**, non per dove.

**Fra due malattie va prima quella che costa di più alla crescita**, non quella con più difetti: ciò
che blocca un incasso o un negozio → ciò che fa mentire il Pannello a Nicola → ciò che fa sbagliare
la macchina da sola → il resto.

**Il lotto è grande quanto la malattia**, con un limite: se i moduli condivisi passano tre o i
difetti quindici, spezzalo per modulo e consegna il primo pezzo — una PR che nessuno rilegge si
mergia per fiducia, e la fiducia non è una prova.

## ② La scheda del difetto è un indizio, non una specifica

Le schede le ha scritte una radiografia passata: vanno lette **e poi verificate sul codice vero**,
perché sono quasi sempre imprecise. Più **larghe** (AR-171 diceva «cerca un nome che non esiste»; era
un confronto esatto su un campo libero, 41 voci su 42 sbagliavano ramo) o più **strette** (AR-196
descriveva un buco, ce n'erano tre). Se scheda e codice non concordano **comanda il codice**, e la
differenza si scrive nella nota. Anche i numeri di riga sono vecchi: cercali con `grep`.

**I difetti NUOVI che trovi mentre ripari** si registrano subito nel cantiere (id, causa radice, dove
l'hai visto) ma NON entrano nel lotto in corso: allargarlo a metà è il modo classico di non finirlo.
Stessa malattia → il tuo modulo di solito li cura già e lo verifichi alla spazzata; malattia diversa
→ sono il lotto dopo. Quello che non si fa è tenerli in testa: lì muoiono a fine sessione.

## ③ La logica che decide deve stare dove un test la può ESEGUIRE

Non dentro un componente React, non dentro `route.ts` insieme a `next/server`, non dentro uno script
di shell. **Funzione pura, senza dipendenze, in un file suo**; il punto malato la chiama. Altrimenti
la prova controlla la **forma** invece dell'**effetto** — ed è così che questi difetti sono
sopravvissuti: la loro prova era un pattern cercato in un file.

Case in casa: `cervello/fonte-numero.mjs` · `pannello/src/lib/atto-unico.ts` ·
`pannello/src/lib/stato-vivo.ts`. I test dei moduli del Pannello stanno in `cervello/test/*.test.mjs`
e importano il `.ts` diretto: `await import(join(REPO, "pannello/src/lib/x.ts"))` (Node 22).

## ④ La prova è comportamentale, e non basta che sia verde

Nel cantiere: `"verifica": {"comando": "node cervello/test/<nome>.test.mjs"}` — **mai**
`{file, pattern, presente}`. Un pattern non frena, non legge, non decide.

Poi i tre livelli, in quest'ordine:

1. **Il test esegue** la logica sui dati veri, non su un finto comodo.
2. **La prova di non-vacuità** — rompi il fix apposta, e il test DEVE diventare rosso. Se resta
   verde, la prova non prova niente. *Questo passo ha trovato un difetto nel metro stesso quattro
   volte in due giorni.* **Ogni difetto che il lotto tocca vuole la sua voce in
   `cervello/mutanti.json`** — il pezzo esatto che rende vero il fix, e come sarebbe senza; altrimenti
   il cancello non ti fa consegnare (`mutazione-mancante`). Si rilancia con
   `node cervello/non-vacuita.mjs --lotto <n>`. Pesca `cerca` sul **cuore** del fix: se prendi una
   riga qualsiasi misuri la compilazione, non la difesa. Se la mutazione non trova più il suo pezzo,
   lo strumento dice «cieco» — non «verde».
3. **La spazzata dei fratelli** (`node cervello/spazzata-fratelli.mjs`) — la stessa malattia cercata
   dappertutto; il tetto in `cervello/malattie.json` **scende quando curi e non si alza mai**. Se la
   malattia del lotto non è censita, **aggiungila**: è il pezzo che trasforma «ho riparato dieci
   punti» in «questa forma di difetto non si allarga più».

## ⑤ Quando serve la prova a RUNTIME

> **Se il fix tocca `pannello/src/**` o uno script `cervello/*.sh` e la decisione che hai cambiato
> non è finita in una funzione pura con la sua prova in `cervello/test/`, la prova con la skill
> `verify` (Playwright per il Pannello, bats per gli script) è OBBLIGATORIA: se non la fai, quel
> difetto resta APERTO e lo dichiari nella PR.**

Non c'è la terza strada «sembra a posto». Il 29/7 AR-257 (un `useEffect` che
rimandava la pagina sulla stessa scheda ogni trenta secondi) è rimasto aperto per giudizio, non per
regola: un'altra sessione con lo stesso lavoro l'avrebbe chiuso. Il giudizio non si ripete, la riga sì. Il modo giusto di soddisfarla resta ③ — estrai la decisione in un modulo puro, e
il runtime serve solo a mostrare che il punto malato lo chiama davvero.

## ⑥ Rileggi le clausole invece di fidarti del verde

Metti il `fix_proposto` accanto al diff, **clausola per clausola**: sono spesso tre o quattro dentro
un paragrafo unico, e quella che salta è quasi sempre **l'ultima**, perché arriva quando il lavoro
sembra finito.

> 28/7, AR-172: avevo sistemato `prevedi` (il comando a mano) e non `autoprevedi` (il generatore
> automatico). La prova passava, perché la conoscevo io e copriva quello che avevo fatto io.
> **Riparare la porta a mano e lasciare aperta quella automatica è il modo più sicuro di far tornare
> il difetto da solo.**

**A ogni canale nuovo che scrive nello stesso posto** (un ponte, un recupero, un importatore) la
domanda obbligatoria è: *«quali cancelli del canale principale eredita?»* Quasi sempre nessuno,
perché i cancelli stanno dentro il comando invece che sul dato. La cura non è aggiungerlo anche lì —
è **spostarlo sul dato**, dove vale per chiunque scriva.

## ⑦ Il cancello di uscita — o è verde, o non si consegna

```bash
node cervello/cancello-lotto.mjs          # tutto: prove + guardiani + typecheck
node cervello/cancello-lotto.mjs --veloce # senza typecheck, mentre lavori
```

Exit `0` = si consegna · `1` = violazione · `2` = non ho potuto misurare (cieco, **non** verde).
Dentro, oltre ai guardiani già esistenti, i quattro controlli nati dagli errori più costosi:

| controllo | cosa impedisce |
|---|---|
| `prova-con-or` | una prova con un'alternativa dentro: chiude il difetto con metà fix fatto (AR-178) |
| `prova-condivisa-cieca` | un test dato a N difetti che non li nomina tutti: ne chiude uno mai toccato (AR-254) |
| `prova-orfana` | un comando che punta a un file inesistente: «non fatto» indistinguibile da «puntatore rotto» |
| `mutazione-mancante` | un difetto riparato la cui prova non è mai stata rotta apposta — o la cui mutazione punta a un pezzo che non esiste più |

**Partono da soli**: il `pre-commit` lancia `--solo-prove` su ogni commit che tocca
`cantiere-difetti.json` — è il punto. (Ma i hook sono configurazione locale: in una sessione nuova
verifica `git config core.hooksPath` — AR-343.)

Sul debito ereditato il cancello non blocca ma **misura**: i tetti in `cervello/tetti-lotto.json`
scendono (`--aggiorna-tetti`) e non si alzano mai. Ciò che il lotto tocca **adesso** passa dal blocco
duro, anche sotto il tetto — un cancello sempre rosso viene aggirato al secondo giro.

## ⑦bis Il SECONDO GIRO — il cancello verde non è la fine

> Nato il 30/7 da Nicola, dopo che una rilettura su sua richiesta ha trovato due buchi in un lotto
> già consegnato col cancello a exit 0: *«devi ricontrollare tantissime volte il lavoro che hai
> fatto.»*

**Un metro che non misura una strada non la dichiara scoperta: dice verde.** Quella notte il cancello
era verde mentre la porta a mano (`auto-fix chiudi --id=`) chiudeva difetti che la porta automatica
rifiutava. Nessun guardiano copriva quella strada, quindi nessuno mentiva — semplicemente lì non
guardava nessuno. **Il verde è l'inizio del secondo giro, non la fine del lavoro.**

Il secondo giro si fa **ad albero fermo**, sul **diff intero** (`git diff origin/main...HEAD`), non
sui file che ti ricordi di aver toccato — la memoria del lotto è la cosa meno affidabile che hai. E
si fa con queste cinque domande, in quest'ordine. Sono le cinque che hanno trovato qualcosa.

1. **Ogni strada che arriva all'atto passa dal freno?** Non quella che hai riparato: *tutte*. Cerca
   l'atto, non il tuo fix — `grep -n 'stato = "chiuso"'`, e per ogni occorrenza chiediti se il freno
   c'è. È AR-172, ed è tornato il 30/7 nello stesso lotto che lo citava.
2. **Ciò che ho AFFERMATO nel commit e nella PR è vero?** Riga per riga, ognuna con un comando. Il
   30/7 la PR diceva «lettore unico condiviso con auto-fix» e auto-fix aveva ancora la sua copia
   della decisione: la frase era falsa quando l'ho scritta. Un'affermazione non verificata è un
   numero senza fonte.
3. **La guardia che ho scritto FRENA davvero?** **Forzala a fallire** — abbassa il tetto, sporca il
   dato, togli il campo — e pretendi il rosso. Un tetto mai superato è indistinguibile da un tetto
   scollegato, ed entrambi stampano verde.
4. **Il codice che ho aggiunto è USATO?** `grep -c` del simbolo importato: se compare una volta sola
   è l'import, e il resto è morto. Un modulo importato e mai chiamato somiglia moltissimo a una
   difesa attiva.
5. **I difetti nuovi che ho trovato sono REGISTRATI?** Nel cantiere — non in chat, non nel rapporto
   di una corsia, non nella mia testa. Il 30/7 uno è rimasto fuori per un giorno intero ed è tornato
   a mordere in un altro modulo. Chiedilo al file, non al ricordo:
   `node -e "…difetti.filter(d => /parola/.test(d.titolo))"`.

**Quando fermarsi:** quando un giro intero non trova **niente da guardare**. Se un giro trova
qualcosa, il giro dopo non è facoltativo — chi ha appena sbagliato ha appena dimostrato di poter
sbagliare ancora. Il 30/7: il secondo giro ha trovato tre cose vere, il terzo ne ha trovate due da
investigare che si sono rivelate innocue (uno script one-shot mai lanciato, e un modulo che scrive su
una lista diversa). **«Innocuo» è un esito del giro, non un motivo per non farlo** — e la ragione per
cui era innocuo va scritta nella nota del difetto, o il giro dopo qualcuno la ri-deriva da capo.

**E la parte scomoda:** questa sezione è una regola *scritta*, cioè la forma più debole che esiste —
vale solo se qualcuno la legge. Ogni volta che una di queste cinque domande trova qualcosa **due
volte**, quella domanda ha smesso di essere una domanda e va promossa a guardiano con un tetto: è la
differenza fra ricordarsi di controllare e non poter più sbagliare.

## ⑧ Come si consegna

- Ogni auto-modifica è **🟡**: si prepara, si committa, **non si mergia**. Il merge è di Nicola.
- Per il Pannello, mergiare **è** pubblicare (il Deploy Hook parte su `main`): se la PR tocca
  `pannello/**`, va detto nel corpo.
- Nel cantiere si aggiornano **`verifica`** (→ `comando`) e **`nota_fix`**; lo `stato` NO: le chiusure
  le applica `auto-fix.mjs verifica --applica` **dopo il merge**, così due lotti aperti insieme non
  litigano sullo stesso file (AR-331).
- ESITO nel quaderno del reparto: `node cervello/chiusura-loop.mjs registra …` (AR-009).
- Il conteggio di `auto-fix` **non è una verifica**: «Chiusi 5» è un numero. Le chiusure si rileggono
  una per una.

---

## Cosa NON fare — gli errori già pagati

- **Non** mettere la guardia sul punto d'ingresso: il bug torna da un'altra strada. Il freno va al
  **confine dell'atto**.
- **Non** scambiare un `await` per una conferma: guarda il valore che torna, non il fatto che sia passato.
- **Non** consegnare con un guardiano «cieco» spacciandolo per verde: exit 2 non è exit 0.
- **Non** inventare un'esenzione in `malattie.json` senza il perché scritto: un'esenzione senza
  motivo è un silenzio, ed è la cosa che stiamo curando.
- **Non** fermarti a chiedere conferma a metà lotto: 🟡 è «fallo e avvisa», la firma è sul merge.

## Il giro completo, in ordine

```
misura le malattie → scegli il gruppo (impatto sulla crescita) → verifica sul codice vero → estrai
la logica in un modulo puro → applica nei punti → test per difetto → mutazione + ROMPI il fix →
runtime con `verify` se tocca lo schermo → spazzata + tetto → rileggi le clausole → cancello-lotto →
aggiorna verifica/nota_fix + DECISIONI + memoria → commit → ESITO nel quaderno
```

## Se il lotto non entra in una sessione sola

Non è un problema: il lavoro è già a pezzi che stanno in piedi da soli. Committa i fix con la loro
prova (mai un fix senza) e riparti dalla misura delle malattie, che rilegge lo stato dal cantiere e
non dalla memoria della sessione. Quello che NON si spezza a metà è il singolo difetto: fix + prova +
mutazione vanno insieme, o resta aperto.

## Molti difetti insieme: le CORSIE parallele

> Nato il 29/7 da Nicola: *«è essenziale che tu riesca a risolvere il maggior numero di difetti
> insieme.»* Il lotto 35 ha curato quattro malattie in parallelo. Funziona, e queste sono le regole
> che l'hanno fatto funzionare — ognuna pagata sul campo quella notte.

**L'unità parallela è la MALATTIA, non il difetto.** N agenti su N difetti si pestano sugli stessi
file e producono una PR illeggibile. N agenti su N *malattie* con **territori di file disgiunti**
lavorano senza toccarsi. Tre-cinque corsie è la misura giusta: sopra, si perde più nella ricucitura
di quanto si guadagni. A ogni corsia si dà il territorio **e il divieto di uscirne**: se il fix
richiede un file altrui, la corsia si ferma su quel difetto e lo segnala invece di editarlo.

**I registri condivisi NON si danno alle corsie.** `mutanti.json` · `cantiere-difetti.json` ·
`malattie.json` · `tetti-lotto.json`: quattro corsie che ci scrivono insieme è AR-331 moltiplicato
per quattro. Ogni corsia consegna un **frammento JSON** in una cartella di lavoro
(`{difetti:[{id, verifica_comando, nota_fix, mutante:{file,cerca,sostituisci}, non_vacuita}], …}`) e
l'AD ricuce. Stessa cosa per git: **nessuna corsia committa**. Un commit per corsia, li fa l'AD.

**Una corsia non può misurare il cancello.** È la trappola meno ovvia e la più costosa: una corsia
che lancia `cancello-lotto.mjs` mentre le altre scrivono legge rossi che non sono suoi, e te li
riporta come «debito preesistente». **Il cancello si lancia solo ad albero fermo**, dall'AD, quando
tutte le corsie sono rientrate. Se un rosso ti viene riferito come preesistente, **verificalo**: un
worktree sul commit di partenza (`git worktree add <dir> HEAD`) dice in trenta secondi se quel test
era verde prima. Il 29/7 erano verdi tutti e tre.

**Prima di consegnare, `main` si è mosso.** Un lotto lungo finisce contro un ramo che nel frattempo
ha chiuso altri difetti negli stessi registri. Il conflitto va risolto prendendo **`main` come base**
e riapplicando sopra solo le proprie colonne — `verifica` e `nota_fix`, **mai lo `stato`**. La
risoluzione comoda (tenere il proprio lato) **annulla in silenzio le chiusure altrui**: il 29/7
sarebbero state trenta. Su `mutanti.json`: **unione**, non scelta. E controlla la sovrapposizione fra
i tuoi difetti e quelli chiusi da `main` — due dei candidati del lotto 35 erano già chiusi lì, e solo
la regola ② (verifica sul codice vero) ha evitato di ripararli due volte.

**Dopo il merge, le chiusure si rileggono UNA PER UNA.** `auto-fix.mjs verifica --applica` guarda la
prova presente sulla scheda, non la volontà di chi ha lavorato il difetto: un difetto che hai
dichiarato **aperto** si richiude da solo se sulla scheda è rimasta la vecchia prova a pattern (il
codice ora la contiene, quindi il pattern si trova). Il 29/7 il conteggio diceva «✅ Chiusi 20» ed
era verde: uno dei venti non doveva esserci. **Quindi: a ogni difetto che dichiari aperto, TOGLI la
`verifica` a pattern** — o si richiuderà da solo, smentendo ciò su cui Nicola ha messo la firma.
(Causa di sistema: AR-444.)

**Il collo di bottiglia non sono le corsie, sono i merge.** Aggiungere corsie non accorcia il lotto
oltre un certo punto; quello che lo accorcia è consegnare presto e in pezzi che stanno in piedi da
soli. Dieci lotti pronti e non mergiati valgono meno di tre mergiati.

## La porta d'ingresso è misurata

Vale solo se si accende quando serve: le frasi vere di Nicola — e le trappole che NON devono
accenderla — stanno in `evals/frasi-di-nicola.json`, l'ultimo esito in `evals/ultima-misura.json`
(che registra anche su QUALE banco: un verde parziale non può più passare per verde). Se tocchi la
`description` **o il banco**, rimisura prima di consegnare con `node cervello/prova-trigger.mjs`
(`--descrizione file.txt` prova una candidata senza installarla).

Misurato il 29/7 su cinque varianti, 28 frasi × 3 giri l'una: **aggiungere ancore peggiora** (184
parole → 2 mancati), l'imperativo spostato in APERTURA le batte tutte (162 parole → 0 mancati, 0
falsi). Il modo di sbagliare è sempre lo stesso — parte a contare invece di aprire. Quindi se non
torna, **sposta invece di aggiungere**: quelle parole si pagano in ogni sessione.
