---
name: riparazione
description: >-
  Aprila PRIMA di leggere il manuale, di contare i difetti o di aprire un registro: è il manuale della
  regista per RIPARARE i difetti in sessioni parallele, sullo stampo della radiografia in 12 sessioni —
  una regista che divide, sorveglia e unisce, fino a 12 sessioni che riparano e fino a 4 che collaudano,
  con i controlli fatti da un programma. Vale per il marketplace e per la macchina, e cambia misura
  secondo la richiesta. Vale ogni volta che Nicola — in qualunque forma, anche detta male o a voce —
  chiede di riparare, risolvere, sistemare o chiudere i difetti del sito o del marketplace; di riparare
  «in N sessioni», «in parallelo» o con una campagna; di chiudere «tutti i difetti» del sito o della
  macchina; di riparare «subito» o «prima possibile» quello che tiene spento il sito o la macchina; di
  sistemare i difetti nati da una funzione nuova, da un ramo o da una PR. NON è la frase generica
  «risolvi i difetti», né un codice AR, né un lotto della macchina (quelli aprono `cantiere`, che smista
  qui il sito, le sessioni parallele e più di 60 voci), non è la radiografia (quella TROVA i difetti),
  non è il collaudo di un pezzo solo, e non è la diagnosi di un guasto in corso (il sito è giù, il
  worker è fermo: prima `salute` e `worker`).
---

# La riparazione in sessioni — il manuale della regista

> Se sei l'AD e in questa sessione non hai ancora letto `cervello/MANUALE-AD.md`, leggilo adesso: questa
> skill non lo sostituisce, lo usa.

> Nata il 7/11/2026 da Nicola: *«crea una strategia per risolvere i difetti usando come esempio la
> strategia per fare la radiografia, perché funziona molto bene questo metodo»*. E poi: *«deve essere
> capace di risolvere sia quelli del marketplace sia quelli della macchina, poi deve adattarsi anche in
> base alle mie esigenze»*.
> Il conto che l'ha chiesta: tre campagne in parallelo in otto giorni (31/10, 1/11, 5/11), tre volte le
> regole riscritte, tre volte più riparazioni dichiarate che vere. Il 5/11: 844 dichiarate, circa 690
> reggono; il replay dei suoi dieci rami trova 89 file toccati fuori territorio e 6 file temporanei, che
> quel giorno aveva visto a mano un sorvegliante ogni tre minuti.

## Le tre regole che la radiografia ha insegnato

1. **La regista non ripara.** Divide, sorveglia, unisce. Se apre il codice del sito per riparare, smette
   di vedere le sessioni.
2. **Prima i programmi, poi gli agenti.** Tutto quello che un comando può controllare — chi tocca quale
   file, il formato di un referto, se una prova torna rossa togliendo la correzione — lo controlla
   `cervello/riparazione-sessioni.mjs`. Agli agenti restano le domande di giudizio.
3. **Chi ripara non collauda.** Una riparazione conta solo se regge alla prova di una sessione che non
   l'ha fatta. Nel dubbio, la voce resta aperta.

E una regola nuova, che le campagne passate non avevano: **nella stessa onda un file ha un padrone solo.**
Le zone fisse non reggono: sul sito il 37% delle voci aperte cita file di zone diverse. Quindi il padrone
lo decide `dividi`, onda per onda; chi si scontra passa all'onda dopo, che parte dal lavoro già unito.

---

## Passo 0 — Capire la richiesta (30 secondi, zero agenti)

Dalla frase si ricavano tre cose. Se una manca e non si deduce, si fa **una** domanda.

**La casa.** `sito` (codice in `NicolaeRotaru/mycity`), `macchina` (codice in `ad-mycity`), o `entrambe`
(una regista sola, riparatori e PR separati per deposito).

**Il profilo:**

| Profilo | Frasi tipo | Perimetro (`perimetro`) | Sessioni | Onde · fermate |
|---|---|---|---|---|
| urgente | «ripara subito», «prima possibile quello che tiene spento X» | `--profilo urgente` (i bloccanti) o `--chiavi`/`--file-chiavi` | 1-3 riparatori + 1 collaudatore | 1 onda · 1 fermata (piano in 5 righe) · PR di emergenza da sola |
| funzione | «i difetti della funzione X», «del PR N», «nati dal…» | `--profilo funzione --diff <base>..<testa>`, e per i difetti NATI dalla funzione anche `--nati-dal <giorno dell'unione>` (il solo diff prende anche i difetti vecchi di quei file: sulla PR #287 erano 544) | in base al numero | 1 onda · 1 fermata |
| tutto | «ripara i difetti del sito / della macchina» | `--profilo tutto` | riparatori da 25 voci al massimo, fino a 12 per onda; ceil(K/3) collaudatori (max 4); un controllore per onda più uno finale; la regia in una sessione sua | 3 onde + cucitura · 3 fermate |
| scelta | chiavi, codici AR, area, gravità | `--profilo scelta` con i filtri | in base al numero | in base al numero |

**La misura.** Il profilo urgente usa sempre le sessioni (da 1 a 3), anche con poche voci: serve la
velocità e un collaudatore separato. Negli altri profili, con **15 voci lavorabili o meno** le sessioni non convengono: sul sito il
motore è `.claude/workflows/ondata-snella.js` (comando «lancia l'ondata N del sito» in `COMANDI.md`),
sulla macchina la skill `cantiere`. Sulla macchina anche **fino a 60** voci vanno in corsie dentro una
sessione sola (skill `cantiere`): è il metodo misurato. Oltre, sessioni divise per **dimensione**.

Un guasto in corso («il sito è giù», «il worker non risponde») **non** si ripara da qui: prima la diagnosi
(skill `salute`, `worker`, i log). Se la causa è una voce registrata, si torna qui col profilo urgente.
Un rollback o un deploy sono 🔴: si propongono a Nicola.

---

## Le regole del 12/11 (Nicola: riparatori più piccoli, la regia a parte, un controllore, niente lavoro inutile)

**I riparatori da 25.** `PER_SESSIONE` vale 25: un riparatore finisce in circa metà tempo. Sul profilo
«tutto» le onde diventano tre (sul sito, nella simulazione del 12/11: 12 + 12 + 6 sessioni, poi la cucitura; i file in comune spezzano le sessioni, quindi il conto vero esce da `dividi` onda per onda).

**La regia in una sessione sua.** Quando la campagna dura ore (il profilo «tutto», o più di un'onda), la
sessione che parla con Nicola non fa la regista: resta leggera e legge solo gli esiti (regola ㉔ del manuale).
- La sessione dell'AD deve essere in modalità **Auto**: una figlia nasce nella modalità di chi la apre, e in
  «plan» si blocca. Se `get_session` dice `plan`, lo si chiede a Nicola prima del «via».
- La preparazione (perimetro e divisione) la fa l'AD. Poi scrive `<C>/REGIA.md`: il quaderno di bordo, al
  massimo 80 righe, con le scelte di Nicola e cosa resta. Commit e push.
- `create_session` con `source_url` = `ad-mycity`, `outcome_branch` = il ramo della campagna. Il prompt è una
  riga: *«Sei la regista della campagna <C>. Leggi .claude/skills/riparazione/SKILL.md e <C>/REGIA.md, poi
  continua da lì. Nicola parla con l'AD nella sessione <id>: le fermate e l'esito vanno lì con send_message.»*
- La regista aggiunge il sito con `add_repo` (accesso `push`) e scrive le schede col suo id e il suo ramo.
- Le fermate vanno all'AD con `send_message`, nei quattro blocchi. L'AD le mostra a Nicola e riporta la
  risposta. Dopo il passaggio l'AD non spinge più sul ramo della campagna.

**Il controllore.** Oltre ai collaudatori, che guardano ogni riparazione sul suo ramo, dopo l'unione di ogni
onda una sessione nuova (`CNN`) guarda il ramo **unito**. Dopo la cucitura ne arriva una finale (`CF`) su tutta
la campagna. Le sue regole stanno in `cervello/riparazione/LEGGIMI-controllore.md`. `applica` legge
`<C>/controlli/`: una voce rossa al controllo non si chiude, e i difetti nuovi che il controllore vede entrano
nel registro come nati. Così la radiografia dopo non trova come nuovo un difetto che la campagna ha toccato.

**Il preventivo, detto giusto.** Il costo è il consumo di ogni sessione al prezzo di listino, cioè il campo
`usage.cost_usd` di `get_session`. Con l'abbonamento scala dal **limite settimanale** e non va in bolletta,
salvo l'«uso extra» a pagamento. A Nicola si dice così, con il rischio vero: a limite finito si ferma tutto
fino al giorno del rinnovo. Il conto misurato si legge da `cost_usd` di ogni figlia e si dice a ogni fermata.

**Il lavoro che non si fa** (Nicola: «non deve essere fatto lavoro inutile che consuma token»):
- la regista non rilegge le trascrizioni delle figlie: giudica dal ramo, dal referto e da `sorveglia.sh`;
- un giro di sorveglianza è **un** comando (`bash cervello/riparazione/sorveglia.sh <C> <onda>`), che stampa
  solo i rossi; un giro senza rossi non scrive a nessuno (regola ㉓);
- il collaudatore non rifà la riparazione e il controllore non rifà il collaudo: ognuno guarda solo quello
  che l'altro non può vedere;
- un secondo agente solo per gravi, bloccanti e sicurezza, e parte dalla prova del primo (regole ⑯ e ⑲);
- le voci «già riparate prima» si provano con un comando o una riga, non con un agente;
- oltre 12 subagenti per sessione, o oltre 2 milioni di token, ci si ferma e si chiede (regola ⑱).

---

## Le regole del 12/11 sera (Nicola: «R05 non è partita ma io non ho visto nessuna richiesta: che non ricada»)

Il conto: il 12/11 R05 è rimasta ferma dalle 15:38 alle 19:45 senza fare niente. La sua sessione non leggeva
`ad-mycity` («codice da fuori») e aspettava il via di una persona, dentro la sessione figlia, dove Nicola non guarda
mai. La regista l'ha vista ferma solo dopo 35 minuti, le ha mandato il testo dopo 70 e non l'ha mai detto a Nicola mentre
succedeva. Lo stesso giorno K01 è rimasto 70 minuti fermo su un permesso che nessuno poteva dare. R03 e R04 non hanno
potuto lanciare i controlli del programma.

1. **La figlia non deve leggere `ad-mycity` per partire.** Il primo messaggio porta dentro le regole e la scheda per
   intero (sono circa 20 mila caratteri, il messaggio ne regge 64 mila). Il clone di `ad-mycity` serve solo per i
   comandi del programma; se la sessione lo rifiuta, i controlli li lancia la regista sul ramo.
2. **A 10 minuti dall'apertura, un controllo solo:** `list_sessions` (limit 20) mostra in una chiamata il
   `status_bucket` di tutte le figlie. Ogni figlia `BLOCKED`, o senza piano arrivato, si sblocca subito, in quel turno.
3. **A ogni giro di sorveglianza**, la stessa `list_sessions`. Una figlia `BLOCKED` su un permesso si interrompe
   (`interrupt_session`) e si rimette in moto per un'altra strada nello stesso giro, mai al giro dopo.
4. **Quello che solo una persona può sbloccare** (un clic dentro la sessione figlia) va detto all'AD alla prima volta
   che si vede, con il nome della sessione e cosa deve cliccare Nicola. Non si aspetta la fermata: una figlia che
   aspetta un clic non è una notizia da fine onda.
5. Nel conto della fermata, una figlia ferma si chiama col suo nome: «R05 non è partita perché la sua sessione
   aspettava un tuo clic che non hai mai visto», non «aspettava il clic di una persona».

*Freno: `cervello/riparazione/sorveglia.sh` chiude ogni giro ricordando il controllo delle figlie ferme. Un programma
che conti da solo le figlie BLOCKED non esiste ancora, perché lo stato delle sessioni da bash non si vede: è debito dichiarato.*

## Le regole del 12/11 notte (Nicola: «devi essere iper efficiente», e i controlli ci sono sempre)

**Il conto che le ha decise.** L'onda 1 del sito è costata 610 $ di listino, circa il 20% del limite settimanale:
riparatori 399 $, collaudo e controllo 152 $, regia 58 $. Il 61% (circa 373 $) è stato **rilettura**: a ogni passo
una sessione rilegge tutta la sua storia, e le storie arrivavano a 440-775 mila token. Tre quarti del costo di un
riparatore stavano nel suo primo turno lungo. Misura di 5 agenti, con uno scettico che ha tolto le stime gonfiate:
gli otto rimedi qui sotto valgono circa 175 $ a onda (dal 20% al 14% del limite), e nessuno toglie un controllo.

1. **I riparatori lavorano a lotti, con la storia piccola** (circa 100 $). Il riparatore fa il capo squadra: divide le
   voci in lotti da 5-8 e dà ogni lotto a un subagente nuovo, che ripara e restituisce solo le righe del referto. I
   giri di correzione partono da un subagente nuovo. Le regole stanno in `LEGGIMI-riparatore.md`, sezione «A lotti».
2. **I collaudatori lavorano in giri brevi** (circa 35 $): subagenti nuovi per ogni giro, verdetto di prima letto da
   file, copia del codice allo SHA esatto, database di prova proprio (`LEGGIMI-collaudo.md`, «Giri brevi»).
3. **Un turno, un esito** (circa 15 $). I comandi lunghi si aspettano nello stesso turno; i subagenti si lanciano tutti
   insieme in primo piano; lo SHA si prende con `git rev-parse` nello stesso comando che spedisce. Il riparatore scrive
   `verifica.testa`, e **il programma lo controlla**: `valida-referto` è rosso se il verify è girato su un commit che
   non è la testa (va bene anche un commit dopo la testa che tocca solo il referto). Se non lo dice, `valida-referto`
   resta in attesa, e dall'onda 2 `applica` ferma il referto.
4. **La regia riparte da un registro** (circa 15 $). A ogni fermata la regista aggiorna `REGIA.md` (al massimo 80 righe),
   lancia `applica` a vuoto (che scrive `decisioni.json`, voce per voce) e tiene il diario. Sono questi tre file il
   registro: l'onda dopo la guida una **regista nuova**, aperta dall'AD, che riparte da lì invece di portarsi dietro
   775 mila token. Il controllo finale lancia `conti`: una voce data a una sessione senza decisione in `decisioni.json`,
   o lasciata aperta senza il perché, è rossa.
5. **Le storie si guardano prima dei giri.** Prima di mandare a una figlia un giro di correzione o di ricollaudo, la
   regista guarda `get_session` di quella figlia. Se `used_tokens` supera 300 mila, il giro lo fa una sessione nuova
   che riparte dal referto. Non si chiama `get_session` di tutte a ogni giro: costerebbe più di quello che salva.
6. **I controlli del programma girano davvero** (circa 8 $). Nel sito `.claude/settings.json` dà il permesso a
   `valida-referto`, `guardia-ramo` e `prova-rimessa`. Nell'onda 1 R03 e R04 non li hanno potuti lanciare.
7. **Il verify completo sta in due punti fissi** (circa 4 $): alla consegna al collaudo, legato allo SHA, e dopo
   l'unione. Nei passaggi in mezzo bastano le prove dei file toccati e di quelli che li importano. La verifica lunga
   della regia gira in sottofondo e stampa solo l'esito.
8. **Partenza controllata e permessi mai in sospeso** (circa 3 $): valgono le regole del 12/11 sera. L'ok di Nicola su
   un lotto di migrazioni si chiede prima di lanciarlo, mentre lui c'è, e non si approva mai in anticipo.

**Ultra Code Extra** (Nicola, 12/11 notte: «Ultra Code Extra, non Max»). Ogni figlia nasce con `effort: "xhigh"` in
`create_session`, e con ultracode acceso. Subito dopo, `get_session` deve dire `effort_level` xhigh e
`is_ultracode_active` true. Se `create_session` rifiuta `effort`, o se ultracode resta spento, non si aprono le altre:
si dice all'AD quali sessioni sono, perché Nicola le accenda dall'app. Ultracode fa lanciare più agenti: per questo
il tetto di spesa resta quello della fermata, e i rimedi 1-5 valgono anche in ultracode.

**I buchi dell'onda 1, chiusi.**
- Un subagente di R07 ha letto il database di produzione. Ora nel sito gli strumenti del database vero, della messa
  online e di Stripe sono bloccati da `.claude/settings.json`. Nei LEGGIMI c'è la regola scritta, da mettere nel
  mandato di ogni subagente. I collaudatori e i controllori lavorano in `ad-mycity`, dove `.claude/settings.json`
  permette lo strumento SQL senza chiedere: per questo il loro primo passo è scrivere nella propria copia un
  `.claude/settings.local.json` che lo vieta (il divieto vince sul permesso). È un lucchetto che la sessione mette a
  sé stessa. Quello vero, togliere il permesso in `ad-mycity`, è una scelta di Nicola: toccherebbe anche le sessioni
  dell'AD.
- R07 ha spinto 8 commit con un verify mai aspettato: ora c'è `verifica.testa`, controllata dal programma.
- In R03 e R04 il controllo del referto era negato: ora ha il permesso.
- In K02 un qa ha rischiato di provare codice spostato: ora c'è una copia allo SHA esatto, controllata con
  `rev-parse` prima di ogni prova.
- R05 non è mai partito: regole del 12/11 sera.

## F0 — Preparazione (programmi, 20-30 minuti)

Tutti i comandi dalla radice di `ad-mycity`, con `--cartella consegne/riparazioni/AAAA-MM-GG-<nome>`.

1. **La quota.** `get_session` (claude-code-remote): ci si ferma solo con `isUsingOverage` o con un
   blocco. L'«avviso» si mostra a Nicola ma non ferma (regola D0 della radiografia del 6/11).
2. **I depositi.** `git fetch` di tutti e due. `BASE` = lo SHA di `main` del deposito bersaglio. Per il
   sito la copia è `$MARKETPLACE_REPO` o `../mycity` (`node cervello/collega-marketplace.mjs` se manca).
3. **Il perimetro:**
   `node cervello/riparazione-sessioni.mjs perimetro --casa <sito|macchina> --profilo <…> [filtri] --cartella <C> --base <BASE>`
   Le voci «fuori» non si indovinano: riservate, con domanda per Nicola, senza percorso, con prova umana
   (macchina), rimandate da Nicola (macchina, le «Approfondisci»). Vanno nella lista della fermata 1.
   Con `--risposte <file>` entrano le voci a cui Nicola ha già risposto; `--anche-umani` e
   `--anche-rimandati` solo se lo dice lui.
4. **La divisione:** `dividi --cartella <C> --base <BASE>` (aggiungi `--ultima` se ci sarà un'onda sola).
5. **Le schede:** `schede --cartella <C> --ramo <ramo della regista> --regista <id della sessione regista>`.
6. **I controlli, tutti verdi:** `copertura-prima --cartella <C>` e `segnaposti --cartella <C>`.
7. Commit e push della cartella sul ramo della regista: lo SHA di quel commit è `SHA_REGISTA`. Si apre
   subito la PR in bozza su `ad-mycity` (regola «PR sempre»).
8. **FERMATA 1.** A Nicola, nei quattro blocchi di `cervello/scrittura-umana.md`:
   - il perimetro in numeri («541 lavorabili: 4 bloccanti, 59 gravi, 478 minori») e cosa resta fuori;
   - le sessioni e le onde, con i temi;
   - la stima: consumo in dollari di listino (circa 50 $ per un riparatore da 45 voci, stimati il 5/11;
     da 25 voci in proporzione), più collaudatori, controllori e regia; il tempo e il numero di agenti.
     Detto come nella sezione «Il preventivo, detto giusto», e rimisurato con `cost_usd` alla fermata 2;
   - le domande che sbloccano voci (`domanda_per_nicola`), raggruppate;
   - per la macchina: se includere le voci a prova umana.
   Si parte solo con il suo «via».

## F1 — I riparatori

**Aprire le sessioni.** Una `create_session` per riparatore dell'onda:
- `source_url` = il deposito bersaglio; `source_revision` = `BASE` (dall'onda 2: lo SHA dell'integrazione);
- `outcome_branch` = `<ramo della regista>-mNN` (NN = il numero del riparatore);
- **nessun `permission_mode: "plan"`**: si blocca in attesa di un clic che nessuno fa, e il 6/11 si
  approvava da solo. La sessione nasce nella modalità della regista;
- `effort: "xhigh"`, poi il controllo di «Ultra Code Extra» qui sopra;
- tag `riparazione-<nome>`;
- il prompt, una riga: *«Sei il riparatore RNN. Clona in sola lettura https://github.com/NicolaeRotaru/ad-mycity
  al commit SHA_REGISTA e leggi cervello/riparazione/LEGGIMI-riparatore.md e <C>/schede/RNN.md. Poi
  scrivi il piano e mandamelo con send_message alla sessione <id regista>.»*

Gli id, i rami e le partenze vanno in `<C>/sessioni.json`:
`{"regista": "<id>", "sessioni": {"R01": {"id": "…", "ramo": "…-m01", "onda": 1}}, "collaudatori": {"K01": {"id": "…", "ramo": "…-k01", "partenza": "<SHA_REGISTA>", "riparatori": ["R01", "R02"]}}}`.

**Il protocollo del piano.** La figlia manda il piano e chiude il turno. La regista lo legge contro la
scheda: perimetro giusto, gravi prima, una voce per commit, prove dove servono. Poi risponde «approvato»,
oppure corregge, con `send_message`. Nicola il 6/11 ha delegato alla regista l'approvazione dei piani.

**L'onda 1 prende i temi a rischio più alto** (soldi, cassa, pagamenti, accessi). Le regole del riparatore
stanno tutte in `cervello/riparazione/LEGGIMI-riparatore.md`: non si ripetono nel prompt.

## La sorveglianza (ogni 30 minuti, dall'apertura dell'onda alla sua unione)

**Quando parte:** subito dopo aver aperto l'ultima sessione dell'onda, la regista manda il primo `send_later`
a 30 minuti col testo «sorveglianza riparazione <C>, onda N». **Ogni giro**, finiti i controlli, manda il
successivo. Una catena sola (mai `sleep`, mai due catene). **Quando smette:** quando tutti i riparatori e i
collaudatori dell'onda hanno `finita: true` e i loro controlli sono verdi, oppure a una fermata. All'onda
dopo riparte da capo. A ogni giro, prima di tutto, `get_session` della regista: se `isUsingOverage` o un
blocco, si ferma tutto e si avvisa Nicola. Poi **un comando solo**, `bash cervello/riparazione/sorveglia.sh
<C> <onda>`, che per ogni sessione dell'onda fa quello che segue e stampa solo i rossi:
- lo stato di tutte le figlie con una `list_sessions` (regole del 12/11 sera) e `git fetch` del deposito bersaglio;
- `guardia-ramo <ramo> RNN --cartella <C> --git <deposito>`: il **risultato** del ramo (diff netto), e gli id nei commit uno per uno;
- `valida-referto <referto> --cartella <C> --git <deposito> --ramo <ramo>` sul referto parziale
  (`git show origin/<ramo>:.riparazione/referto-RNN.json > /tmp/referto-RNN.json`: il nome del file deve
  essere quello della sessione);
- `prova-unione --cartella <C> --git <deposito> --onda N`: ogni file toccato da due rami è rosso, e
  l'unione di prova dice dove litiga, senza toccare l'albero di lavoro;
- una riga in `<C>/diario-della-sorveglianza.txt`, sempre in questa forma:
  `AAAA-MM-GG HH:MM · RNN · stato · guardia ✅/🔴 · referto N voci di M · unione ✅/🔴 · azione fatta`.

Un rosso si corregge con `send_message` alla sessione (cosa, quale file, cosa fare). Una scrittura nel
mondo vero (database vero, deploy, messaggi a persone) si ferma con `interrupt_session`, poi si avvisa
Nicola. **Il lavoro si giudica dal ramo e dal referto, non dalla trascrizione.**

## F2 — I collaudatori (in catena, senza aspettarsi)

Appena un riparatore ha `finita: true` con `guardia-ramo` e `valida-referto` verdi, lo si dà a un
collaudatore libero (fino a 3 riparatori ciascuno; i collaudatori sono ceil(K/3), al massimo 4).
- `create_session` con `source_url` = `ad-mycity`, `source_revision` = `SHA_REGISTA` (così
  `prova-rimessa.mjs` è una copia fissata, non quella che un riparatore può aver toccato),
  `outcome_branch` = `<ramo della regista>-kNN`;
- il prompt, una riga: *«Sei il collaudatore KNN. Leggi cervello/riparazione/LEGGIMI-collaudo.md e collauda
  i riparatori R… (ramo …, punta …, testa …) e R… (ramo …, punta …, testa …) della cartella <C>. BASE è ….»*.
  La **punta** è l'ultimo commit del ramo (`git rev-parse origin/<ramo>`), dove sta il referto finito; la
  **testa** è quella scritta nel referto, l'ultimo commit di codice. Il collaudatore legge il referto alla punta;
- la guardia sul suo ramo: `guardia-ramo <ramo> KNN --cartella <C>` (solo il file `collaudi/KNN.json`);
- il referto: `valida-collaudo <C>/collaudi/KNN.json --cartella <C> --git <deposito bersaglio>` (i referti dei
  riparatori li legge dai rami scritti in `sessioni.json`; il collaudatore usa `--referti <cartella sua>`). La
  regola del campione la **ricalcola il programma**: la parola «accettato» del collaudatore non conta.

Le voci bocciate tornano allo **stesso** riparatore per **un** giro di correzione, poi allo stesso
collaudatore. Se cadono di nuovo, restano aperte con la nota. Il terzo giro sulla stessa voce non esiste
senza Nicola.

## F3 — L'unione (a ogni onda)

1. I referti e i collaudi si copiano nella cartella, uno per sessione:
   `for R in R01 R02 …; do git -C <deposito> show origin/<ramo>-m${R#R}:.riparazione/referto-$R.json > <C>/referti/$R.json; done`
   e `git show origin/<ramo>-kNN:<C>/collaudi/KNN.json > <C>/collaudi/KNN.json`. Poi, tutti verdi: `guardia-ramo`,
   `valida-referto`, `valida-collaudo`. `applica` li rilancia comunque da sé: un file rosso o non finito la ferma.
2. I rami si uniscono nel ramo di integrazione `<ramo della regista>` del deposito bersaglio, in ordine di
   numero. Dentro un'onda i conflitti attesi sono **zero**: un conflitto vuol dire che un guardiano ha
   fallito. Ci si ferma e si capisce perché, prima di ricucire.
3. **Le prove sull'albero unito**, una volta:
   - sito: `npm run verify`, poi `tests/sql/harness/apply.sh` e `tests/sql/harness/run.sh` (Postgres
     locale), poi la CI al push su `claude/**`;
   - macchina: `node cervello/cancello-lotto.mjs` e `node cervello/radiografia-in-corsa.mjs`.
   Sono le prove che il 5/11 diventavano rosse solo dopo l'unione (8). Una voce `rompe_altro`, o rossa
   dopo l'unione, si toglie da sola col suo commit (`git revert`): per questo una voce per commit.
   **Il controllore d'onda** (`CNN`, sessione nuova su `ad-mycity`, dove ci sono i senior, ramo `<ramo della regista>-cNN`) parte appena il ramo
   unito è spinto. Il prompt è una riga: *«Sei il controllore CNN. Leggi cervello/riparazione/LEGGIMI-controllore.md
   e controlla l'onda N della cartella <C>: integrazione <ramo> @ <sha>, base <sha>.»* Il suo referto si
   copia in `<C>/controlli/CNN.json`. Sul suo ramo deve esserci solo quel file (`git diff --name-only`).
4. **FERMATA 2** (dopo l'onda 1) e **FERMATA 3** (dopo l'onda 2), nei quattro blocchi: i numeri veri da `conti --cartella <C>` e da
   `applica --cartella <C>` a vuoto (quante reggono, quante no, quante passano all'onda 2), il costo misurato
   (`node cervello/conto-token.mjs` per i workflow della regista; per le sessioni figlie il loro `conto` nei
   referti) e la quota da `get_session`. Si va avanti solo con «via la seconda».
5. **Le onde dopo:** `dividi --cartella <C> --base <SHA dell'integrazione>` (più `--file-chiavi` con le voci
   `serve_file_altrui` e `non_fatto` da rifare), con `--ultima` sull'ultima onda; poi `schede`,
   `copertura-prima`, e di nuovo F1-F3.
6. **La cucitura**, dopo l'ultima onda: le voci di `piano.cucitura` (al massimo 40) si fanno sul ramo di
   integrazione con `.claude/workflows/ondata-snella.js` (`tech` costruisce, `qa` collauda, tetto 12).
   `piano.eccedenza` resta nel registro per la campagna dopo: si dice, non si nasconde.
   Poi **il controllore finale** (`CF`) su tutto il diff della campagna, con il giro dei flussi che incassano
   in palestra se è accesa. Le PR escono di bozza solo con `CF` letto da `applica`.
7. Si toglie `.riparazione/` dall'integrazione. **Una PR per deposito**, in bozza finché tutto non è verde,
   col titolo che descrive il comportamento. Le migrazioni nuove del sito sono 🔴 a parte: si
   applicano solo con «ok migrazioni» di Nicola.
8. **Il registro:** `applica --cartella <C>` (a vuoto: scrive `decisioni.json`), poi `applica --scrivi`.
   Contano solo le voci che **reggono**. Prima dell'unione vanno nel registro solo le note
   (`riparazione_GG_MM`), i «già riparati» confermati e i difetti nati. Le chiusure dopo che Nicola ha unito:
   - sito: `node cervello/chiudi-sito.mjs <C>/frammenti --applica --pr <N> --commit <sha>`;
   - macchina: `node cervello/auto-fix.mjs verifica --applica`. `applica` ha già tolto la vecchia prova a
     pattern dalle voci che non reggono (AR-444: altrimenti `auto-fix` le richiuderebbe da sole).
   I nati della macchina (`<C>/nati-macchina.json`) prendono l'id da `node cervello/prossimo-ar.mjs`.
9. `conti --cartella <C>`: prima e dopo, incrociando le chiavi. «N chiusi» si dice solo dopo questo.
10. **Il messaggio finale**, nei quattro blocchi, più tre riparazioni scelte a caso fra le `si_chiude` di
    `<C>/decisioni.json`, con il loro `verifica_comando` rilanciato sul ramo di integrazione e l'uscita copiata,
    più il conto da `node cervello/conto-token.mjs`. La memoria: `STATO.md`,
    `LAVORO-APERTO.md`, `DECISIONI.md`, l'ESITO con `node cervello/chiusura-loop.mjs registra …`, il
    voto in `memoria-squadra/ad.md`.

## Le falle riservate

Hanno un binario a parte: una sessione privata, che riceve i dettagli solo in chat (`send_message`), con
messaggi di commit generici e, nel deposito pubblico, solo il numero R. Se il filtro di sicurezza blocca
il passaggio dei dettagli, la voce resta aperta e va nella lista per Nicola. Mai un dettaglio nel deposito.

## Quando ti fermi e chiedi a Nicola

A ogni fermata di questa lista mostri, nei quattro blocchi, cosa è successo, cosa proponi e cosa resta fermo
intanto. Riparti solo con la sua risposta, scritta: «via», «togli RNN», «continua senza», o quello che dice.

- extra a pagamento (`isUsingOverage`) o un blocco della quota;
- la terza bocciatura sulla stessa voce;
- un guardiano rosso due volte sulla stessa sessione dopo la correzione;
- un conflitto all'unione dentro un'onda;
- un controllore che trova rosse più di 1 voce su 10 dell'onda;
- agenti o costo oltre la stima della fermata 1;
- qualunque azione 🔴 (deploy, migrazioni sul database vero, prezzi, messaggi a persone vere).

## I comandi del programma, in una tabella

| Comando | Cosa controlla | Uscita |
|---|---|---|
| `perimetro` | sceglie le voci e mette da parte quelle «fuori» | 0 · 3 se non c'è niente |
| `dividi` | un padrone per file nell'onda, gravi prima, fasce di migrazione | 0 · 1 |
| `schede` | scrive le schede e il registro compatto | 0 |
| `copertura-prima` | ogni voce in un posto solo, ogni file un padrone, schede uguali al piano | 0 · 1 · 3 |
| `segnaposti` | nessun segnaposto nelle schede | 0 · 1 · 3 |
| `guardia-ramo` | il risultato del ramo: file propri, prove (importate o lette per nome), migrazioni, temporanei, id nei commit | 0 · 1 · 3 |
| `valida-referto` | formato, chiavi, asticella, prova rimessa, una voce per commit, riservate | 0 · 1 · 3 |
| `valida-collaudo` | verdetti, lenti, prova rimessa, regola del campione ricalcolata | 0 · 1 · 3 |
| `prova-unione` | nessun file in due rami, l'unione di prova non litiga | 0 · 1 · 3 |
| `applica` | chi si chiude e chi no, coi controllori di `controlli/`; con `--scrivi` frammenti e registro | 0 · 1 · 3 |
| `conti` | prima e dopo, per chiave | 0 · 1 |

L'uscita 2 vuol dire «non ho potuto misurare»: non è mai un verde. Le prove del programma:
`node --test cervello/test/riparazione-sessioni.test.mjs`, con le mutazioni di AR-1163 in
`cervello/mutanti.json`.
