# 🔧 Come riparo un difetto

> Nato da una frase di Nicola, 28/7: *«mi rendo conto che tu puoi risolvere e migliorare questi
> difetti in modo molto migliore e più efficiente, ma non so cosa dirti per fartelo fare.»*
>
> **Non deve saperlo.** Se la qualità del lavoro dipende dal fatto che lui trovi la frase giusta, è
> fragile — ed è la stessa malattia che questo cantiere cura da dieci lotti: una regola che funziona
> solo se qualcuno si ricorda di invocarla. Quindi lo standard sta scritto qui, e i cancelli lo
> impongono da soli.

Questo file è il mansionario di un lotto di riparazione. Vale **sempre**, senza che nessuno lo chieda.

---

## La regola che sta sotto a tutto

**Un difetto non è chiuso quando quel punto guarisce: è chiuso quando la malattia smette di potersi
ripresentare.**

Tutto il resto discende da qui.

---

## ① Il lotto si fa per MALATTIA, non per conteggio

Dieci difetti scollegati sono dieci mini-lotti impilati: stesso lavoro, una PR illeggibile, e se uno
è sbagliato si blocca tutto. Dieci difetti con **una** malattia si riparano con **un** modulo
condiviso, e la PR si legge in cinque minuti.

Prima di aprire un lotto: misura quanti difetti aperti condividono la radice
(`node cervello/spazzata-fratelli.mjs`, `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json`).
Il lotto è grande quanto la malattia, non quanto la voglia.

> Misurato il 28/7: 35 difetti aperti su 160 avevano la stessa malattia («un buco si traveste da
> buona notizia»). Due lotti l'hanno curata in undici punti.

## ② La scheda del difetto è un indizio, non una specifica

Le schede del cantiere le ha scritte una radiografia passata. Vanno lette, **e poi verificate sul
codice vero**. Nella pratica sono risultate quasi sempre imprecise, in entrambe le direzioni:

- **più larghe**: AR-171 diceva «cerca un nome che non esiste»; il guasto vero era che la ricerca era
  un confronto esatto su un campo di testo libero, quindi 41 voci su 42 sbagliavano ramo.
- **più strette**: AR-196 descriveva un buco; ce n'erano tre nello stesso blocco.
- **soddisfatte a metà**: AR-178 chiedeva due guardiani e la sua prova era un OR, quindi si è chiusa
  con uno solo riparato.

Se la scheda e il codice non concordano, **comanda il codice**, e la differenza si scrive nella nota
del difetto.

## ③ La logica che decide deve stare dove un test la può ESEGUIRE

Non dentro un componente React, non dentro `route.ts` insieme a `next/server`, non dentro uno script
di shell. Funzione pura, senza dipendenze, in un file suo. Altrimenti la prova finisce per controllare
la **forma** del codice invece dell'**effetto** — ed è così che questi difetti sono sopravvissuti:
la loro prova era un pattern cercato in un file.

Case in casa: `cervello/fonte-numero.mjs`, `cervello/gate-pubblicazione.sh`,
`pannello/src/lib/esito-lettura.ts`, `pannello/src/lib/risposta-snella.ts`.

## ④ La prova è comportamentale, e non basta che sia verde

Nel cantiere: `"verifica": {"comando": "node cervello/test/<nome>.test.mjs"}` — mai
`{file, pattern, presente}`. Un pattern non frena, non legge, non decide.

Poi i tre livelli, in quest'ordine:

1. **Il test esegue** la logica sui dati veri, non su un finto comodo.
2. **La prova di non-vacuità**: rompi il fix apposta, riga per riga, e il test DEVE diventare rosso.
   Se resta verde, la prova non prova niente. *Questo passo ha trovato un difetto nel metro stesso
   quattro volte in due giorni.*
3. **La spazzata dei fratelli** (`node cervello/spazzata-fratelli.mjs`): la stessa malattia cercata
   dappertutto. Il tetto in `cervello/malattie.json` **scende quando curi e non si alza mai**.

Una prova non può contenere un **OR** fra pezzi diversi del fix: chiuderebbe il difetto quando uno
qualsiasi dei pezzi è a posto. È successo, ed è costato una chiusura falsa (AR-178).

## ⑤ Dopo il merge, rileggi le chiusure invece di fidarti del numero

`auto-fix verifica --applica` stampa «Chiusi N». **N non è una verifica.** Apri i difetti chiusi uno
per uno e controlla che il fix chieda esattamente quello che è stato fatto.

> È il passo che il 28/7 ha scoperto AR-178 falso, trenta secondi dopo la sua chiusura. Nessuno
> strumento lo fa al posto mio.

**Come si rilegge, in concreto:** metti il `fix_proposto` accanto al diff, clausola per clausola. Le
clausole sono spesso tre o quattro dentro un paragrafo unico, e quella che salta è quasi sempre
**l'ultima** — perché arriva quando il lavoro sembra già finito.

> Sempre il 28/7, su AR-172: avevo sistemato `prevedi` (il comando a mano) e non `autoprevedi` (il
> generatore automatico), che continuava ad aprire `atteso: 1` senza sapere quanti ordini ci fossero.
> La prova passava — perché la prova la conoscevo io e copriva quello che avevo fatto io. **Riparare
> la porta a mano e lasciare aperta quella automatica è il modo più sicuro di far tornare il difetto
> da solo.**

### La domanda da fare a ogni canale nuovo che scrive in un registro

Quando nasce un secondo modo di scrivere nello stesso posto — un ponte, un comando di recupero, un
importatore — la domanda obbligatoria è: **«quali cancelli del canale principale eredita?»**

Quasi sempre la risposta è «nessuno», perché i cancelli stanno dentro il comando invece che sul dato.
Su `calibrazione.json` è costato 42 voci con zero cause: `esito` la causa la chiedeva da mesi, ma il
ponte `da-loop` e una passata di recupero scrivevano diretto. La cura non è aggiungere il cancello
anche lì — è **spostarlo sul dato**, dove vale per chiunque scriva (AR-169, AR-272).

## ⑥ Il colore e la firma

Ogni auto-modifica è 🟡: si prepara, si apre la PR, **non si mergia**. Il merge è di Nicola. Per il
Pannello, mergiare **è** pubblicare (il Deploy Hook parte su `main`): quando una PR tocca
`pannello/**` va detto nel corpo della PR.

La PR porta **codice + test + il campo `verifica`**. Le chiusure nel cantiere le applica `auto-fix`
dopo il merge (AR-331), così due lotti aperti insieme non litigano sullo stesso file.

---

## Il cancello di uscita — tutti verdi, o non si consegna

```
npx tsc --noEmit                    (in pannello/)          → 0 errori
node cervello/test-cervello.mjs                             → solo i rossi già noti
node cervello/prove-oneste.mjs                              → 0
node cervello/spazzata-fratelli.mjs                         → 0
node cervello/auto-fix.mjs verifica    ← SOLA LETTURA prima di --applica
git status --short                                          → pulito prima di ogni push
```

---

## Cosa alzerebbe davvero il tetto (e non sono parole di Nicola)

Non serve una frase migliore. Servono tre cose, e due sono già in moto:

1. **Merge veloci.** Ogni lotto costruisce sul precedente; una PR ferma blocca la catena.
   *(Il 28/7: due merge in pochi minuti, e sono usciti due lotti in una notte.)*
2. **Le due azioni che solo lui può fare**: Vercel Authentication e `"Bash(git push:*)"` nel `deny`.
   La seconda è l'unico test rosso della suite.
3. **Le correzioni quando sbaglio.** Sono il segnale più prezioso che ricevo — vanno a finire in
   `LEZIONI-CHAT.md` come casi-studio prioritari, e da lì nei cancelli.

Quello che NON serve: dirmi di lavorare meglio. Se una volta ho lavorato meglio, quel «meglio» va
scritto qui e trasformato in un cancello — altrimenti è un buon giorno, non uno standard.

---

## Appendice — le due debolezze della prova, trovate sul campo il 28/7

Il passo ⑤ ha pescato **due chiusure false in un giorno**, e hanno la stessa forma: *una prova che si
accontenta di una parte del fix.*

**① La prova con un OR dentro.** AR-178 chiedeva due guardiani; la sua prova era
`"pattern": "VOLANO_VINCOLO|_tasso_rc|_sonda_rc"`. Ne ho cablato uno, la prova ha fatto centro sulla
metà riparata, il difetto si è chiuso con l'altra metà ancora rotta e viva.

**② La prova condivisa fra più difetti.** Il lotto 11 ha dato lo stesso
`{"comando": "node cervello/test/errore-ingoiato.test.mjs"}` a cinque difetti. Il test passava — ma
AR-254 non era riparato: il suo fix (risposta più snella) gira **dopo** la lettura, e la lettura era
già fallita. Cinque difetti, una prova: si chiudono tutti e cinque anche se uno non è stato toccato.

> **Regola:** ogni difetto ha bisogno di una prova che diventi rossa **se quel difetto** non è
> riparato. Un test condiviso va benissimo come *file*; ma dentro deve esserci almeno un caso che
> parla solo di quel difetto — altrimenti è un OR travestito.

E il corollario che vale per tutti e due: **il conteggio di `auto-fix` non è una verifica.** «Chiusi 5»
è un numero, non un controllo. Le chiusure si rileggono una per una, confrontando il `fix_proposto`
con quello che è stato fatto davvero.
