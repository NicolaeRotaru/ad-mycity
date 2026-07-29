---
data: 2026-07-29 13:05
tipo: auto-radiografia COMPLETA (su comando di Nicola — "radiografia completa e profonda del worker/pannello/AD/senior/guardiani")
aree: 8 dense (AD e senior · memoria e volano · sensori e cadenza · guardiani e guardrail · worker · Pannello ×2 · strategia-costo-rischio)
difetti: 90 registrati — 89 dalla radiografia + 1 nato dal lavoro, 14 bloccanti (fonte: auto-coscienza/auto-radiografia.json)
voto_salute_architettura: 0 (fonte: auto-coscienza/storico-salute.json)
costo: 18 agenti, 3,47M token, 108 minuti (fonte: esito del workflow)
---

# 🩻 Radiografia della macchina — 2026-07-29 13:05

Perimetro: **worker + Pannello + AD + senior + guardiani**. Otto aree, ognuna affidata a un senior che
doveva coprirla tutta, ognuna seguita da un **verificatore avversariale** con l'ordine di smontare i
difetti e di **scartare tutto ciò che era già aperto nel cantiere** — così quello che resta è nuovo, non
un doppione. Nel dubbio si scarta: 89 sopravvissuti.

Archivio: `auto-coscienza/auto-radiografia.json` · nuovi difetti `AR-347`→`AR-436` in `cantiere-difetti.json`
(i numeri `AR-344`, `AR-345` e `AR-346` erano già stati presi su `main` dalle PR #608 e #609 mentre questa
radiografia girava: i tre miei sono diventati `AR-434`, `AR-435` e `AR-436`).

---

## ⚡ Il verdetto in una riga

La macchina è **piena di controlli che non controllano**. Non mancano i guardiani — ce ne sono una
sessantina. Il problema è che quasi tutti certificano che una cosa **esiste** invece di provare che
**funziona**, e vivono **dentro** il sistema che dovrebbero sorvegliare. Per questo, quando serviva
davvero — il worker morto per 36 ore — non si è mosso nessuno, e l'hai scoperto tu.

---

## 🧬 La malattia comune

Tre forme dello stesso vizio. Riconoscerle vale più che leggere 89 titoli.

### ① Il controllore abita dentro la cosa che controlla

L'unico controllo che i battiti girino davvero interroga i timer di systemd — che stanno sul VPS. Se il
VPS si ferma, si ferma anche il controllore (`verifica-automazione.mjs:165-167`: fuori dal VPS si riduce a
due avvisi che non alzano il codice d'uscita). In `.github/workflows/` c'è **un solo file**, il deploy del
Pannello: nessun controllo esterno programmato.

Il riflesso «worker morto → avvisa Nicola» esiste davvero, a `midollo-spinale.mjs:31`. Ma è invocato in
**un solo punto di tutto il repo: `giro.sh:664`**, cioè dentro il giro. Il giro è la cosa che si era
fermata. → **AR-371, AR-430, AR-377**

### ② Il guardiano guarda solo dove è comodo guardare

Cinque guardiani leggono la cartella `cervello/` **in modo piatto e solo i file `.mjs`**. Fuori campo
finisce tutto il lato shell e ogni sottocartella:

- **`firma-check`** non vede i dieci `curl -X POST` di `worker.sh` sulla tabella dove vive la tua firma:
  riconosce una scrittura solo nella forma JavaScript. Metà macchina è invisibile. (AR-380)
- **`uscite-check`** non ha mai contato **le otto mani che pubblicano davvero** — Facebook, Instagram,
  Google Business Profile — perché stanno in `cervello/publishers/`, una sottocartella. (AR-381)
- **`porte-check`** stampa «✅ ogni porta passa dal cancello» senza entrare in `cervello/vps/`, dove tre
  punti pubblicano su `main` e uno fa partire il deploy da solo. (AR-382)

Non è che questi guardiani sbagliano il verdetto: **non hanno mai visto metà della macchina**. Il loro
verde è vero solo sulla metà che guardano, e nessuno lo dice.

### ③ La prova di chiusura si accontenta della parola

Un difetto si chiude quando un pattern compare nel codice. Ma il pattern può essere soddisfatto dal testo
che **descrive** il problema invece che dal codice che lo **ripara**.

Il caso provato riga per riga: **AR-211 è segnato chiuso ed è vivo.** `coerenza-fatti.mjs:243` dice a
chiare lettere che `non_verificato` *«non è un verde — è l'assenza di una misura»*, e ventiquattro righe
dopo (`:267`) stampa **«✅ Memoria coerente»** e a `:272` **esce 0**. Girato oggi: copertura 0, esito
`non_verificato`, exit 0. Il guardiano che il manuale descrive come «FALLISCE se una copia vecchia resta»
**non può fallire quando non legge niente**.

Non è isolato: due difetti del worker sono chiusi da una riga di commento, e quattro prove puntano a file
che non esistono. → **AR-353, AR-354, AR-355, AR-356**

---

## 🔴 I 14 bloccanti

### Perché non ti sei accorto che la macchina era morta

**AR-365 — L'allarme «sono morto» esce da un canale spento, e la macchina scrive di averlo mandato.**
Le due sole regole rosse che sorvegliano la macchina stessa — worker morto, sensori ciechi — sono
`soloAllerta`. Il ramo che le gestisce (`sentinella-dati.mjs:634-641`) fa due cose: prova a mandare un
Telegram e **arma il cooldown comunque**. Se il Telegram non parte — e `pingTelegram` esce in silenzio
quando manca il token (`:575`) — la regola risulta «già avvisata» e non riprova. Non accoda un lavoro, non
scrive in coda, non tocca le azioni in attesa: **se il canale è spento l'allarme svanisce, e resta scritto
che è partito.**

**AR-366 — Il battito dice «sono vivo» anche a motore esaurito.**
`worker.sh:390-401` scrive il battito in cima al ciclo principale, ogni 5 secondi, **prima** di sapere se
c'è lavoro e senza mai guardare lo stato del motore AI. La regola che dovrebbe accorgersi del worker morto
(`sentinella-dati.mjs:301`) chiede «battito vecchio **e** zero lavori in corso». Un worker con la quota AI
esaurita batte regolarmente e non ha lavori: **è invisibile per costruzione.** È esattamente quello che è
successo dal 27/7.

**AR-371 / AR-430 — Tutti i controlli girano dentro la macchina.** (vedi malattia ①)

**AR-377 — Con il worker fermo, un test rosso non ferma più niente.**
La suite è lanciata da un unico punto operativo: `giro.sh:347`. Lì il cancello funziona bene (l'esito è
preso col codice d'uscita, non col testo). Ma non c'è CI su GitHub e il gancio pre-commit usa una
scorciatoia. Oggi **`guardiani-in-bacheca.test.mjs` è rosso** — 4 asserzioni, una recita *«un guardiano
nuovo senza descrizione fa uscire 1»* — e infatti `censimento-guardiani.mjs` esce **0** con un guardiano
senza descrizione. Il test che prova il buco è rosso, e non ha fermato nulla.

### Sui guardrail

**AR-379 — Sei allarmi si scrivono e nessuno li conta.** In `giro.sh` sono assegnate **31** variabili di
vincolo; l'elenco che le conta (`:753`) ne enumera **25**, scritte a mano. Le sei fuori sono **la firma**
(il confine «chi esegue non firma sé stesso»), **le porte di pubblicazione**, il percorso git, i sensori
spenti, lo stampo e le pause.

**AR-387 — Sei controlli possono dire no e il giro si chiude lo stesso come pulito.** È la stessa riga 753
vista dal lato del worker: quei sei rossi non entrano nel conteggio che decide se il giro è pulito, e quel
conteggio governa tre punti, fra cui la riserva anti-salto del motore.

**AR-380 · AR-381 · AR-382** — i tre guardiani mezzi ciechi (vedi malattia ②).

**AR-373 — Il controllore dei controllori aspetta un battito che nessuno gli manda.**
`freschezza-segnali.mjs:17` pretende otto segnali. `coerenza-fatti` è nell'elenco degli attesi e **non lo
manda mai**: cercando tutte le chiamate nel cervello escono 24 nomi e quello non c'è. Suona da sempre — e
siccome suona sempre, non lo ascolta più nessuno.

### Quelli che possono far perdere lavoro, o mandare due volte una cosa vera

**AR-388 — Se il cancello della memoria dice no, il server butta via il lavoro.**
In `vps/aggiorna-cervello.sh:97` il cancello rifiuta, il messaggio dice «le scritture restano sul server»,
l'esecuzione **prosegue** — e alla riga 162 arriva `git checkout -f -B "$branch" FETCH_HEAD`, che scarta
esattamente quelle modifiche. Il file promette di tenere il lavoro e sessanta righe dopo lo cancella.

**AR-409 — La serratura lascia passare tutto ciò che arriva col verbo «leggi».**
`serratura.ts:77` apre con «se il metodo è GET/HEAD/OPTIONS → ammessa», **prima** di guardare origine e
token. Ma nel Pannello GET non significa sola lettura: `/api/report?genera=` accoda un lavoro vero al
cervello, `/api/heartbeat` in GET accoda un giro e accende l'autopilota. **Tre porte che scrivono si aprono
proprio così.**

**AR-412 — Due dita sullo stesso pulsante mandano due volte la cosa vera.**
La guardia contro il doppio invio è «leggi lo stato, se è vuoto procedi» seguito, secondi dopo, da «scrivi
lo stato». In mezzo c'è la chiamata che manda l'email o chiude la pratica
(`azioni-pronte/route.ts:132-141` poi `:177-178`). Due richieste ravvicinate leggono entrambe vuoto e
partono entrambe. Stesso schema nell'autopilota.

---

## 📊 Le otto aree

| Area | Voto | Stato | Difetti |
|---|---:|---|---|
| ad-e-senior | 38 | attenzione | 9 (5 gravi) |
| memoria-e-volano | 7 | attenzione | 10 (9 gravi) |
| sensori-e-cadenza | 0 | **critico** | 10 (3 bloccanti) |
| guardiani-e-guardrail | 0 | **critico** | 14 (6 bloccanti) |
| worker | 0 | **critico** | 13 (2 bloccanti) |
| pannello-comportamento | 24 | attenzione | 9 (7 gravi) |
| pannello-robustezza-sicurezza | 0 | **critico** | 10 (2 bloccanti) |
| strategia-costo-rischio | 0 | **critico** | 14 (1 bloccante) |

---

## 👥 Quello che ho trovato sui senior (e che fa male)

I 120 mansionari **esistono e sono completi**: scheda mestiere, rubrica, trappole, carburante, galleria —
misurato 120 su 120 per ognuno dei sei ingredienti, più 121 kit.

**Ma i due workflow che li mettono al lavoro non li aprono mai.** In `giro-operativo.js:41-60` il prompt è
scritto a mano dentro il file: *«Sei il senior @vendite… Focus: …»* — venti parole al posto della scheda.
Nessun `readFileSync`, nessun `agentType`, **zero occorrenze in tutta la cartella `.claude/workflows/`**.

Vuol dire che sulla strada automatica — il giro operativo quotidiano — **2,5 MB di mansionari sono capitale
immobilizzato**: le mosse che arrivano nella tua coda da firmare le propone un modello generico con una
riga di contesto. E spiega perché il metro può dire 120 su 120 mentre l'output non cambia. (AR-434)

Il metro, del resto, conta **quattro titoli che il template garantisce**: 120 su 120 passano, nessuno può
essere bocciato. (AR-436)

E tre workflow dicono ai senior di leggere la memoria a `/home/user/ad-mycity` — che **sul VPS non
esiste**: lì la cartella è `/opt/mycity/ad-mycity`. Il senior riceve l'ordine di leggere un posto vuoto.
(AR-435)

> **Una nota di onestà.** La radiografia del 27/7 — la riga in cima al file che ho appena sostituito —
> diceva «24 senior, ognuno col proprio `agentType`». Quella frase descriveva una sessione in chat, non il
> workflow che gira da solo. Nel workflow gli `agentType` non ci sono mai stati.

---

## 📱 I tre sintomi che avevi segnalato sul Pannello

Sono localizzati, con file e riga:

- **Il dito indietro** con la fotocamera aperta cambia la pagina sotto invece di chiudere la fotocamera —
  ed era **dichiarato chiuso** (AR-243). (AR-402)
- **La chat è agganciata al titolo della casella**: se il testo del titolo cambia, la conversazione non si
  trova più. (AR-405)
- **L'Assistente cancella i messaggi sotto** mentre la casella sta ancora aspettando la risposta. (AR-404)

E una che non avevi segnalato ma è peggio: **se la rete cade, la home scrive «Nessun allarme. Tutto ok.»**
(AR-401). Quattro degli otto organi della macchina sono verdi per costante, anche a macchina spenta
(AR-406).

---

## 🔮 Pre-mortem — i sette disastri più plausibili

1. **Probabilità alta** — Il worker muore e non lo sai mai: l'allarme si autodichiara inviato anche quando
   non parte. *Non è un'ipotesi: è già successo, dal 27/7.*
2. **Probabilità alta** — Il guardiano delle uscite dà verde per costruzione, perché certifica i **file** e
   non i punti di scrittura: ogni prossima uscita scoperta dentro un file già dichiarato **nascerà
   invisibile**.
3. **Probabilità media** — Il pulsante «annulla» del marketplace scrive sul sito vero senza pausa, senza
   firma e senza allowlist: un rollback può riportare prezzi vecchi su prodotti live.
4. **Probabilità media** — Una PR qualsiasi finisce in produzione con la firma data per un'altra: la firma
   autorizza **il canale** GitHub, non il numero della PR — e GitHub è l'unico canale già sbloccato.
5. **Probabilità media** — La stessa azione parte due, dieci, cinquanta volte: la firma non si consuma mai
   dal lato che esegue davvero.
6. **Probabilità media** — Firmi un testo e ne parte un altro: la firma autorizza **un ID**, non il
   contenuto.
7. **Probabilità bassa** — Una firma sblocca la casella sbagliata per omonimia di codice: nella coda di
   oggi ci sono già due card diverse che il Pannello mostra entrambe come **#F81**.

---

## 🏆 Benchmark — dove siamo lontani dai migliori

Fatto tenendo conto della verità, non ignorandola: **1 negozio live, 0 ordini pagati, 78% dello sforzo
degli ultimi sette giorni dentro la macchina.**

| Ambito | Divario | L'obiettivo |
|---|---|---|
| ① Onboarding negozi | **alto** | Definire l'attivazione come **primo ordine pagato**, non «negozio live» |
| ④ Funnel / checkout | **alto** | ≤12 campi visibili di default (la media del settore è 23,48) |
| ⑤ Email / CRM | **alto** | Due flussi vivi: conferma d'ordine e carrello abbandonato (1h / 24h / 72h) |
| ⑥ SEO locale | **alto** | Scheda Google di Pane Quotidiano al 100% — a cassa zero batte il sito |
| ⑨ Gestire l'azienda con agenti AI | **alto** | Asimmetrico: su alcune cose siamo davanti al 95% del mercato |
| ② Contenuti | medio | Un solo format ricorrente, stesso giorno ogni settimana |
| ③ Prezzi | medio | Una commissione unica **scritta e firmata**, entro 14 giorni |
| ⑦ Consegne | basso | **Restare indietro apposta** finché non ci sono ordini |
| ⑧ Cura clienti | basso | Sui primi 10 ordini: 100% contatto personale, non automazione |

Le due righe più oneste sono le ultime: su consegne e cura clienti il divario è basso **perché è giusto
così**. Costruire dispatch e batching con zero ordini sarebbe la stessa malattia del 78%.

---

## 🙋 Cosa serve da te

1. **Accendo un guardiano fuori dalla macchina che ti scrive se il worker muore?** Un workflow GitHub
   schedulato, una trentina di righe, fuori dal VPS. Senza, il prossimo blackout lo scopri di nuovo a mano.
2. **Congelo i 73 senior che non hanno mai prodotto un esito**, tenendo un nucleo di 30-40? Congelare non
   è cancellare: la riattivazione richiede un mandato reale. Oggi 72 quaderni su 120 sono vuoti.
3. **Il cancello di allocazione resta spento fino al 24/8?** La deroga è tua e motivata (fase tecnica), ma
   senza una data che qualcuno controlla si fossilizza.

E restano i due bloccanti di sempre, che solo tu puoi chiudere: il **permesso jolly**
`Bash(node cervello/*.mjs:*)` in `.claude/settings.json:23` — che copre anche lo script che manda le email
vere — e il click su **Vercel Authentication**. Il `middleware.ts` è onesto nel dichiarare cosa chiude e
cosa no: ferma `curl` e le richieste cross-site, **non** «chiunque abbia l'indirizzo apre il Pannello».

---

## Il voto

**0 su 100**, come la volta scorsa. Ma è un numero che dice poco: parte da 100 e scende di 25 per ogni
bloccante — con 14 bloccanti tocca il fondo e ci resta, e resterebbe 0 anche con la metà dei difetti.

**Il numero che conta è un altro: 188 difetti aperti, e nessuno di loro ha un proprietario né una data**
(AR-432). Il cantiere della macchina è l'unico elenco dell'azienda senza padrone.

> Nessuna riga di codice è stata toccata da questa radiografia: è stata in **sola lettura**, come deve
> essere. **Ogni fix resta 🟡, da firmare.**
