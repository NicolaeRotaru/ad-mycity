---
data: 2026-07-29 11:30
tipo: radiografia
perimetro: i 66 guardiani del giro
metodo: misura + verifica avversariale (ogni difetto provato rompendo qualcosa)
---

# 🩻 Radiografia dei guardiani

**Perimetro:** i 66 controlli che `cervello/giro.sh` esegue a ogni giro, più il cancello di
pubblicazione condiviso. **Metodo:** niente lettura a occhio. Ogni difetto qui sotto è stato
riprodotto su una **copia pulita del repo**, una per guardiano, osservando il codice d'uscita vero.
Quelli che non si sono riprodotti sono stati scartati, e ne dichiaro uno qui sotto.

**Verdetto in una riga:** la macchina sa difendersi da un file **corrotto**. Non sa difendersi da un
file **assente** — e in quel caso, invece di fermarsi, dice di sì.

**Fonte dei numeri.** Tutti i conteggi (guardiani, cancelli, test mancanti, battiti, istanze
dell'idioma, vincoli) sono **misurati** da `cervello/giro.sh` e `cervello/gate-pubblicazione.sh`
tramite `cervello/censimento-guardiani.mjs`. Nessuno è ricordato o stimato: si riproducono con
`node cervello/guardiani-check.mjs --json`. Le misure di dettaglio (i verdi-finti, la catena, la
spazzata) sono state prese sul commit `f4f8f31`; i totali sono riallineati a `8f791ad`.

> **Mentre scrivevo questo documento il difetto n.4 è cresciuto.** Il lotto 30 (`#605`) ha aggiunto
> un guardiano nuovo, `percorsi-git`, con un vincolo che **non è stato messo nell'elenco contato**:
> gli allarmi scritti-e-non-contati sono passati da **5 a 6** in poche ore. Non è un aneddoto: è la
> prova che questo non è debito storico da smaltire, ma una forma che **si riproduce a ogni lotto**
> finché la regola non diventa un cancello. I guardiani sono così passati da 66 a **67**.

> **Nota su `onesta-check`:** passato su questo file, esce `rc=1` con due segnalazioni — entrambe
> **falsi positivi su codice citato** (le parentesi quadre del `pattern` di `malattie.json` lette come
> segnaposto, e le cifre della data nel frontmatter lette come numeri orfani). È lo stesso motivo per
> cui nel giro quel guardiano è informativo e non bloccante. Lo scrivo invece di toglierlo: il
> documento non passa un cancello, e chi legge deve saperlo.

---

## ✅ Quello che regge (misurato, non presunto)

Prima i difetti, perché sono più utili. Ma tre cose vanno dette, o il resto sembra peggiore di com'è.

1. **Il troncamento è gestito bene, da tutti.** Ho troncato a metà `registro-fatti.json`,
   `cantiere-difetti.json` e `auto-miglioramento.json` — lo scenario del processo ucciso a metà
   scrittura (AR-296). Cinque lettori su cinque hanno reagito correttamente: `coerenza-fatti` accusa,
   `prove-oneste` si dichiara cieco, `vault-sanita` trova il problema, `cantiere-prove` e
   `sonda-volano` bocciano. **Nessun verde finto su un file corrotto.**
2. **`vault-sanita` e `valida-contratti` sono fail-closed** su cartella mancante (rc=1), come
   dichiarano di essere.
3. **Il contratto 0/1/2 funziona dove è stato messo:** `prove-oneste`, `peso-contesto`,
   `north-star-check`, `scan-segreti` e `guardiani-check` si dichiarano **ciechi** invece di
   inventare un verdetto.

---

## 🔴 1. Un guardiano ricrea il vault e disarma il cancello di pubblicazione

**Il difetto.** `vault-sanita` è l'ultima difesa prima che la memoria finisca online, ed è scritto
fail-closed: cartella assente → rc=1 → non si pubblica. Corretto. Ma **non è il primo a girare.**
`coerenza-fatti` gira 600 righe prima (`giro.sh:493` contro `giro.sh:1115`) e, se il vault non c'è,
**se lo crea** per scriverci il proprio report.

**La prova, su copia pulita:**

| Passo | Esito |
| --- | --- |
| ① vault assente → `vault-sanita` da solo | `rc=1` — non pubblica ✅ |
| ② `coerenza-fatti` prima, come fa il giro | `rc=0`, crea `MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-fatti.json` |
| ③ `vault-sanita` sullo stesso vault | `✅ 1 file OK` → **`rc=0`, si pubblica** |

**Perché è il più grave.** Non è un guardiano debole: è un guardiano **forte disattivato dall'effetto
collaterale di un altro**. La difesa esiste, è scritta bene, ed è già stata spenta prima di essere
interrogata. E l'unico stato in cui scatta — vault mancante — è esattamente quello in cui pubblicare
è più pericoloso. Stessa forma in `sonda-volano`, che pure ricrea la cartella.

**Radice:** un guardiano dichiarato «sola lettura» che scrive il proprio report usa `mkdirSync`
ricorsivo. Creare la propria casa è ragionevole da solo; è velenoso in fila con altri.

---

## 🔴 2. Sei cancelli passano verdi quando il loro input non esiste

Ogni caso riprodotto su una **copia nuova**, con gli argomenti esatti che usa il giro:

| Cancello | Senza il suo file | Riga |
| --- | --- | --- |
| `apprendimento-guardiano --gate` | `rc=0` «niente da controllare» | `apprendimento-guardiano.mjs:170` |
| `verifica-avversariale --gate` | `rc=0`, output vuoto | `verifica-avversariale.mjs:47` |
| `esperimenti-check` | `rc=0` «nulla da controllare» | `esperimenti-check.mjs:62` |
| `chiusura-loop --gate` | `rc=0` «SALA-OPERATIVA assente» | `chiusura-loop.mjs:49` |
| `coerenza-fatti` | `rc=0` «fatti: 0 · cacce aperte: 0» | `coerenza-fatti.mjs:80` |
| `sonda-volano --json` | `rc=0` | `sonda-volano.mjs:26` |

**La riga che spiega tutto**, in `coerenza-fatti.mjs:80-82`:

```js
if (!existsSync(REGISTRO)) return { versione: 1, aggiornato: null, fatti: [] };
const raw = readFileSync(REGISTRO, "utf8");
const dati = JSON.parse(raw); // se è corrotto DEVE esplodere (fail-closed, mai passare in silenzio)
```

Due righe consecutive, due filosofie opposte: **corrotto = esplodi, assente = passa**. E in
`apprendimento-guardiano.mjs:170` la scelta è perfino esplicita:
`process.exit(0); // fail-safe: mai rompere un giro per un file mancante`.

Non è distrazione: è una decisione presa un file alla volta, ognuna difendibile da sola, che insieme
lascia sei cancelli aperti nello stesso momento — quando il vault non c'è, **tutti i loro file
mancano insieme**.

---

## 🔴 3. La malattia è già censita, dichiarata estinta, e lo scanner non può vederla dove vive

Questo è il difetto nello **strumento di misura**, ed è il motivo per cui i due sopra sono
sopravvissuti.

In `cervello/malattie.json` esiste la malattia **`buco-letto-come-zero`**, e la sua descrizione è
esatta:

> «Un buco non è uno zero: dove si decide qualcosa, l'assenza deve chiamarsi assenza.
> **La stessa forma in JavaScript è `|| 0` e `?? 0`.**»

Chi l'ha scritta sapeva che vale anche per JavaScript. Ma la scheda dice:

```json
"pattern": "jq -r '[^'\\n]*// 0'",
"estensioni": [".sh"],
"baseline": 0,
"nota_baseline": "0 dal 2026-07-28 (AR-334) … l'unica istanza viva … è dichiarata esente"
```

**Cerca solo espressioni `jq` dentro file `.sh`.** Nei `.mjs` non guarda.

**La prova.** Su copia pulita ho piantato la malattia nelle due forme:

| Dove ho piantato | `spazzata-fratelli` la vede? |
| --- | --- |
| forma JS (`// 0` e `?? 0`) in due `.mjs` | **no** — conteggio invariato |
| forma shell (`jq -r '.oggi.token // 0'`) in un `.sh` | **sì** — +1 punto nuovo |

Intanto l'idioma equivalente — `if (!existsSync(path)) return fallback` — vive in **20 guardiani su
66**, di cui **7 sono cancelli**: `allocazione-check`, `calibrazione`, `chiusura-loop`,
`coerenza-fatti`, `registro-scelte-check`, `sonda-volano`, `tasso-lezioni`.

La macchina crede che questa malattia sia curata (`baseline: 0`, «curata») mentre ha venti istanze
vive proprio nei file che decidono se il giro può chiudersi. **Un tetto a zero su una malattia che
non stai cercando dove abita è una rassicurazione, non una misura.**

**Conferma indipendente, dalla squadra stessa.** Il lotto 30, chiuso poche ore fa, descrive il bug di
`scan-segreti` con queste parole: *«un guardiano che non distingue "l'ho letto ed è pulito" da "non
sono riuscito ad aprirlo" non è una difesa, è una rassicurazione»*. È **la stessa malattia**, trovata
per un'altra strada (i nomi con l'accento) e curata in un punto solo. Chi l'ha scritta l'ha
riconosciuta perfettamente e non poteva vederne la famiglia: lo scanner che avrebbe dovuto mostrargliela
guardava altrove.

---

## 🟠 4. Sei allarmi si scrivono e non si contano (erano cinque stamattina)

`firma-check`, `pausa-check`, `porte-check`, `sensori-spenti-check`, `stampo-check` e — da oggi —
`percorsi-git` mettono il loro «no» davanti al motore ma non entrano in `GATE_ROSSI` (`giro.sh:742`):
il giro può uscire **pulito** con quei sei rossi. Le variabili di vincolo sono più di quante il ciclo
ne conti, e il commento sopra il ciclo ne dichiara meno ancora: tre numeri diversi nello stesso file.

Il sesto è arrivato **durante questa radiografia**, col lotto 30. Chi l'ha scritto ha fatto tutto il
resto per bene — l'helper `guardiano()`, il contratto 0/1/2, il vincolo con parole sue — e ha saltato
l'unica riga che non è accanto alle altre. **Non è distrazione di una persona: è che aggiungere un
guardiano richiede di toccare due punti lontani, e il secondo nessuno lo verifica.**

Fix: due righe, più il tetto già messo in `cervello/test/guardiani-in-bacheca.test.mjs` che va rosso
se il numero sale e scende quando se ne ripara uno.

---

## 🟠 5. Dodici cancelli su ventisette non hanno un test

Possono fermare la macchina, e nessuno verifica che lo facciano per il motivo giusto:

`agent-registry-check` · `apprendimento-guardiano` · `esperimenti-check` · `freschezza-checklist` ·
`freschezza-okr` · `freschezza-segnali` · `keyword-owner-check` · `registro-scelte-check` ·
`scan-segreti` · `tasso-lezioni` · `vault-sanita` · `verifica-avversariale`

Nota su `scan-segreti`: ha una modalità `--prova` che il giro usa come autotest, quindi è meno
scoperto degli altri undici. **Quattro dei sei verdi-finti del punto 2 sono in questa lista** — non è
una coincidenza, è la stessa assenza vista da due angoli.

---

## 🟡 6. Solo otto guardiani su sessantasei lasciano un battito

`freschezza-segnali` è il meta-guardiano che scopre chi è morto in silenzio, e sorveglia
**otto** nomi (`freschezza-segnali.mjs:13`). Degli altri **cinquantotto** nessuno sa dire se in questo
giro hanno girato davvero o se sono crashati: 41 non chiamano mai `stampSegnale`, e fra i 27 con
potere di bloccare ne mancano 16.

Non è grave come i primi tre — un guardiano che crasha di solito fa rumore altrove — ma è la ragione
per cui un difetto come il n.1 può vivere a lungo senza che nulla protesti.

---

## 🧪 Un errore mio, nel metodo

La prima tornata di misure l'ho fatta **eseguendo tutti i guardiani nella stessa copia senza vault**.
Ne è uscito che `vault-sanita` e `valida-contratti` davano un verde finto — e l'ho quasi scritto.

Era falso: i guardiani girati prima avevano **ricreato il vault**, e quelli dopo lo trovavano. Ho
rifatto tutto con una copia nuova per ciascuno, e quei due si sono rivelati corretti.

Vale la pena tenerlo, per due motivi. Il primo: il difetto n.1 **è nato da questo sbaglio** — la
contaminazione che rovinava la mia misura è la stessa che in produzione disarma il cancello di
pubblicazione. Il secondo: se avessi «verificato» rileggendo il codice invece di rifare
l'esperimento, avrei confermato la conclusione sbagliata con una prova che non poteva smentirla.

---

## Cosa farei, in quest'ordine

1. **Il cancello di pubblicazione ricontrolla il terreno, non solo i file.** `vault-sanita` deve
   distinguere «cartella che esiste perché contiene la memoria» da «cartella che esiste perché
   qualcuno ci ha scritto un report»: se dentro non ci sono i file-cardine (STATO, DECISIONI,
   registro-fatti), è cieco, non verde. Chiude il n.1 senza toccare gli altri guardiani.
2. **Allargare `buco-letto-come-zero` ai `.mjs`** con il pattern dell'idioma vero, tetto alla
   quota attuale (20) che scende e non sale. Chiude il n.3 e mette il n.2 sotto misura invece che
   sotto opinione.
3. **I sei verdi-finti diventano ciechi** (`exit 2`) quando manca il file su cui devono giudicare —
   uno per uno, non con una sostituzione di massa: in almeno un caso l'assenza è legittima.
4. **Contare i cinque vincoli** in `GATE_ROSSI`.
5. **Un test per ognuno dei dodici cancelli scoperti**, a partire dai quattro che sono anche
   verdi-finti.

I punti 1-4 sono **🟡 (firma di Nicola)**: toccano il cervello, e la macchina non si modifica da sola.
