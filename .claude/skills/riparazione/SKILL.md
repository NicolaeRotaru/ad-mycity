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
| tutto | «ripara i difetti del sito / della macchina» | `--profilo tutto` | fino a 12 riparatori, ceil(K/3) collaudatori (max 4) | 2 onde + cucitura · 2 fermate |
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
   - la stima: costo (circa 50 dollari a riparatore, misurato il 5/11; i collaudatori si misurano alla
     prima campagna), tempo e numero di agenti;
   - le domande che sbloccano voci (`domanda_per_nicola`), raggruppate;
   - per la macchina: se includere le voci a prova umana.
   Si parte solo con il suo «via».

## F1 — I riparatori

**Aprire le sessioni.** Una `create_session` per riparatore dell'onda:
- `source_url` = il deposito bersaglio; `source_revision` = `BASE` (dall'onda 2: lo SHA dell'integrazione);
- `outcome_branch` = `<ramo della regista>-mNN` (NN = il numero del riparatore);
- **nessun `permission_mode: "plan"`**: si blocca in attesa di un clic che nessuno fa, e il 6/11 si
  approvava da solo. La sessione nasce nella modalità della regista;
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
blocco, si ferma tutto e si avvisa Nicola. Poi, per ogni sessione dell'onda:
- `get_session` (stato, modello) e `git fetch` del deposito bersaglio;
- `guardia-ramo <ramo> RNN --cartella <C> --git <deposito>`: la **storia** del ramo, commit per commit;
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
  i riparatori R… (ramo …, testa …) e R… (ramo …, testa …) della cartella <C>. BASE è ….»*: rami e teste li
  prende dai referti finiti;
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
4. **FERMATA 2** (dopo l'onda 1), nei quattro blocchi: i numeri veri da `conti --cartella <C>` e da
   `applica --cartella <C>` a vuoto (quante reggono, quante no, quante passano all'onda 2), il costo misurato
   (`node cervello/conto-token.mjs` per i workflow della regista; per le sessioni figlie il loro `conto` nei
   referti) e la quota da `get_session`. Si va avanti solo con «via la seconda».
5. **L'onda 2:** `dividi --cartella <C> --base <SHA dell'integrazione> --ultima` (più
   `--file-chiavi` con le voci `serve_file_altrui` e `non_fatto` da rifare), `schede`, `copertura-prima`,
   e di nuovo F1-F3.
6. **La cucitura**, dopo l'ultima onda: le voci di `piano.cucitura` (al massimo 40) si fanno sul ramo di
   integrazione con `.claude/workflows/ondata-snella.js` (`tech` costruisce, `qa` collauda, tetto 12).
   `piano.eccedenza` resta nel registro per la campagna dopo: si dice, non si nasconde.
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
| `guardia-ramo` | la storia del ramo: file propri, prove, migrazioni, temporanei, id nei commit | 0 · 1 · 3 |
| `valida-referto` | formato, chiavi, asticella, prova rimessa, una voce per commit, riservate | 0 · 1 · 3 |
| `valida-collaudo` | verdetti, lenti, prova rimessa, regola del campione ricalcolata | 0 · 1 · 3 |
| `prova-unione` | nessun file in due rami, l'unione di prova non litiga | 0 · 1 · 3 |
| `applica` | chi si chiude e chi no; con `--scrivi` frammenti e registro | 0 · 1 · 3 |
| `conti` | prima e dopo, per chiave | 0 · 1 |

L'uscita 2 vuol dire «non ho potuto misurare»: non è mai un verde. Le prove del programma:
`node --test cervello/test/riparazione-sessioni.test.mjs`, con le mutazioni di AR-1163 in
`cervello/mutanti.json`.
