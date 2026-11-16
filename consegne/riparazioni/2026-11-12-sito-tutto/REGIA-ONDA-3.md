---
tipo: quaderno-di-bordo
data: 2026-11-15 23:50
per: la regista dell'onda 3, «regista O3 uno». La apre l'AD chat 4, session_015BmpnV65jCuJATqykK8GtB
stima_usd: 195
tetto_usd: 215
---

# Onda 3, primo pezzo: il quaderno della regista

## In parole semplici
Questo foglio serve alla regista dell'onda 3: dice cosa ha scelto Nicola e cosa resta da fare.
È un pezzo piccolo: tre riparatori da 22 voci, due collaudatori e un controllore, con un tetto di spesa per ognuno.
Esempio: R27 ripara 22 voci degli endpoint dell'assistente, senza ultracode, e arrivato a circa 25 $ consegna quello che ha.

## Cosa cambia per te
Le fermate vanno all'AD chat 4 con send_message. Se l'AD non risponde, la bacheca delle sessioni dice chi è l'AD adesso.

## Cosa devi fare
Partire dal blocco «Prima di aprire», nei dettagli. I riparatori si aprono solo quando il freno sugli agenti c'è, oppure se Nicola dice di partire senza.

## Cosa non ho verificato
Che il freno legga davvero la riga del ruolo in una sessione vera: le prove lo fanno girare a mano.

---

## Dettagli tecnici

**Le scelte di Nicola, 15/11 verso le 23:35** (carta #256): «1 = 12%, 2 fatto, 3a, 4a, 5a».
- 1: il 12% del limite settimanale è usato. Il tetto firmato fino a giovedì 19/11 alle 10:00 resta 350 $; questo pezzo ha 195 $ di stima e 215 $ di tetto duro (regola 2 del 15/11: non si alza a metà onda).
- 2: «fatto», ma alle 23:37 il freno non c'è su nessun ramo, né in `ad-mycity/.claude/settings.json` né in `mycity/.claude/settings.json`. L'AD lo ha chiesto a Nicola: prima di aprire i riparatori, `git fetch` e `grep freno-subagenti` sui due `main`.
- 3a: ultracode SPENTO su tutti, anche R25 e R26 che hanno un grave. Nel primo messaggio scrivi che la riga 59 di `LEGGIMI-riparatore.md` («con un grave solo con ultracode») per questo pezzo non vale, per firma di Nicola. Effort `xhigh`, prompt mai «/effort ultracode».
- 4a: questo pezzo. Il resto dell'onda 3 (126 voci rimandate, la lista C, i gravi di B) parte dopo giovedì alle 10:00, col preventivo fatto sui costi misurati qui.
- 5a: la regola «niente campione sotto le 40 voci» diventa un campo del piano letto da tre programmi (AR-1184). La costruisce una sessione a parte, aperta dall'AD: serve prima di `applica`, non prima dei riparatori.

**L'onda 3 sulla cartella vera** (`dividi`, 23:38, verde). Base del sito `67666b3f` (main con l'onda 2). `chiavi-onda3.txt` = 38 voci minori di `pronte/B`.
- R25 pagamenti-stripe, 22 voci, 1 grave, migrazioni 490-499 · R26 privacy-legale, 22 voci, 1 grave, 500-509 · R27 ai-endpoints, 22 voci, 0 gravi, 510-519. 18 voci sono di B (la cucitura di prova).
- 126 voci restano rimandate. `conti --preventivo`: 513,79 $ col tasso dell'onda 2. È il massimo se i tetti non reggono: lo si dice a ogni fermata.

**Rami.** Regista in ad-mycity: `claude/sito-onda-3`. Integrazione del sito: `claude/sito-onda-3`, da `67666b3f`. Riparatori: `claude/sito-onda-3-m25`, `-m26`, `-m27`. Collaudatori: `-k11`, `-k12`. Controllore: `-c03`.

**La base cambiata per il freno (15/11 alle 23:55, via dell'AD chat 4 alle 23:52).** La base dell'onda 3 sul sito non è più `67666b3f` ma `76d4c4d7` (`76d4c4d79254284a0330eb865ff029db5261e26e`), il commit della PR mycity#291 (ramo `claude/freno-agenti`). Quel commit ha `67666b3f` come unico genitore e tocca solo `.claude/settings.json`: aggiunge l'hook PreToolUse `Agent|Task|Workflow` che chiama `node ../ad-mycity/cervello/riparazione/freno-subagenti.mjs`.
- Perché: i riparatori devono partire con il freno nella loro copia. Ho provato `guardia-ramo R27` su un ramo finto che parte da `76d4c4d` con la base vecchia, ed era rossa per due motivi: `.claude/settings.json` era un file senza padrone, e il commit del freno non portava l'id di una voce. Con la base spostata la stessa prova dice «in attesa» (nessun commit suo). Voci, file e migrazioni non cambiano: in `piano.json` cambia solo `onde[2].base`, e quella vecchia resta scritta in `onde[2].base_prima`.
- Partire dal commit, senza aspettare che Nicola unisca, è la sua richiesta di stanotte («incolla i freni»). Si torna indietro facilmente, e il testo è identico a quello della #291.
- **La #291 va unita prima della PR dell'onda 3, o insieme.** Se la #291 cambia prima dell'unione, il cambio di settings.json arriva due volte: lo stesso testo non dà scontro, un testo diverso sì.
- Nel primo messaggio di ogni riparatore: la prima riga è `ruolo-freno:` della scheda, subito dopo «clona ad-mycity in ../ad-mycity prima di qualunque Agent». Senza la copia accanto il freno resta spento e non lo dice.
- L'integrazione del sito `claude/sito-onda-3` nasce da `76d4c4d`, non da `67666b3f`.

**Prima di aprire, in ordine.**
1. `get_session` su di te: con `isUsingOverage` non si apre niente.
2. `add_repo` mycity con accesso `push`. `schede --cartella <C> --ramo claude/sito-onda-3 --regista <tuo id>`, poi `copertura-prima` e `segnaposti` verdi. Commit e push.
3. Il freno sui due `main`. Se manca, apri solo K11 e scrivi all'AD.
4. K11 subito, perché non ripara niente: collauda le 16 voci di `pronte/A-da-ricollaudare.txt`, come ha fatto K10 (`session_015BmpnVoKwLXx38QpasjKQ7`, ramo `claude/f1-k10`, `collaudi/K10.json`). Prima riga del prompt `ruolo-freno: collaudatore`. Tetto 15 $, 4 subagenti, mai Workflow.
5. R25, R26, R27 da te, senza cartelle (regola 12 del 14/11): tag `cartella:sito-onda-3-riparatori`, titolo «Riparatore · R25 · O3». Prima riga del primo messaggio: la riga `ruolo-freno:` della scheda. Poi il LEGGIMI e la scheda per intero.
6. K12 quando un riparatore ha `finita: true` con guardia e referto verdi: giudica tutte le voci, senza campione. Tetto 30 $. C03 dopo l'unione, tetto 20 $.

**Tetti per sessione.** R25-R27 35 $ l'uno, e consegnano al 70% (circa 25 $). K11 15 $ · K12 30 $ · C03 20 $ · regia 25 $. Totale 195 $. Oltre i 215 $ ci si ferma e lo si dice all'AD (regola 2).

**Sorveglianza.** `bash cervello/riparazione/sorveglia.sh <C> 3 --attendi` in sottofondo: ti sveglia solo quando cambia qualcosa (regola 4). Niente catene di send_later. A ogni risveglio leggi `get_session` su di te e sulle figlie vive. Passi la mano a 250 mila token.

**Il cancello della cucitura.** Sulle 18 voci di B: 7 o più che reggono, la cucitura si allarga dopo giovedì; meno di 5, si ferma. Lo si conta da `decisioni.json` per chiave.

**A fine pezzo.** Unione, `npm run verify` e l'harness SQL, C03, PR in bozza sul sito, `applica` a vuoto (con AR-1184 se è unita), poi la fermata all'AD coi numeri di `conti` e il costo di ogni figlia. Le migrazioni 490-519 sul database vero solo con la firma di Nicola, una per una.

## Stato al passaggio (16/11 alle 00:30, regista O3 uno → regista O3 due)

La regista O3 uno passa la mano perché la sua storia è a 399 mila token, sopra i 250 mila (regola 4 del 15/11). Spesa della regia uno: 10,63 $ su 25.

**Fatto.**
- Schede R25-R27 scritte e verdi. Base dell'onda 3 spostata a `76d4c4d` (il freno, vedi il blocco qui sopra). La PR mycity#291 è unita dalle 00:05: main del sito `b6ef4afa`, che contiene `76d4c4d` così com'è. All'unione non arriva due volte.
- K11 finito (`session_015BmpnYqdgPHMTawQWLA8LL`, ramo `claude/sito-onda-3-k11`, punta `68fb127e`), 17,89 $ con il limite duro di 18 $ dato dall'AD. 8 reggono (R04-021, R07-021, R07-022, R14-008, R14-014, R14-015, R14-017, R14-020), 8 parziali, 0 bocciate. R14-006 e R14-023 provate e non giudicate (b). La regia ha rifatto `guardia-ramo` e `valida-collaudo`: verdi (3 rossi sospesi dall'eccezione firmata `rimessa_a_mano` dell'onda 1).
- R25, R26 e R27 aperti, piani approvati alle 00:05-00:10, freno attivo in tutti e tre (clone di ad-mycity a `33fbcdb`). Le correzioni ai piani: revisore dopo ogni lotto; voce riparata ma non rivista al tetto = «parziale, non rivista: tetto»; voci bloccate da file altrui scritte subito come serve_file_altrui; R26-004 si ferma se più di 10 delle 34 prove sono comuni; R27-005 e R27-020 con la cura più piccola, niente coda nuova.

**Spesa alle 00:30** (da `get_session`, `usage.cost_usd`): R25 9,36 $ (L1 committato: `f7590d7b R25-001`, guardia verde; revisore V1 in corso) · R26 8,10 $ (L1, il grave, in subagente) · R27 8,70 $ (L1 avviato, 7 voci di soldi) · K11 17,89 $ · regia uno 10,63 $. **Totale 54,7 $ sui 215.**

**Aperto, in ordine.**
1. **Sorveglianza:** rilancia `MARKETPLACE_REPO=<clone del sito> bash cervello/riparazione/sorveglia.sh --attendi consegne/riparazioni/2026-11-12-sito-tutto 3` in sottofondo. Il segnale «ramo R25» è già in `rossi-noti.txt`. A ogni risveglio leggi `get_session` su di te e sulle tre figlie: i riparatori non sempre vedono il proprio `cost_usd`, quindi se te lo chiedono gliela dai tu. Consegna verso i 25 $, tetto 35 $.
2. **K12 non si apre** finché l'AD non ha avuto due strade coi numeri, dentro i 215 $ che non si alzano (AD chat 4, 00:06). K11 è costato circa 1,1 $ a voce giudicata a fondo: 66 voci a fondo non stanno nei 30 $. Strade da presentare: (a) giudizio pieno su gravi, voci di B e voci di soldi/dati/permessi, campione esplicito sul resto, con la deroga di Nicola alla regola «niente campione sotto le 40 voci»; (b) i dollari che i riparatori non spendono sotto i 35 $ vanno a K12. Si apre quando il primo riparatore ha `finita: true` con guardia e referto verdi.
3. **All'unione:** (a) R04-021, R07-021, R07-022: K02 e K10 avevano «parziale» con giudizio pieno, e `applica` fa vincere il peggiore. Va guardato come `applica` sceglie fra due collaudi prima di decidere, e senza scrivere a mano nei registri. (b) Le 5 voci di R14 che reggono sono sul ramo `claude/magical-hamilton-xouwr8-m14` (punta `2048b33`), mai unito: vanno portati dentro solo i loro commit (uno per voce), controllando che non tocchino file di R25-R27. (c) Due difetti nuovi visti da K11, da mettere nel registro: `policy_ok` letto senza controllo di tipo in extract-product:412 ed extract-products:304 (con `"false"` stringa un prodotto vietato passa); il nuovo allarme di R14-012 non si chiude mai.
4. **Le fermate e i clic per Nicola** vanno alla quinta chat dell'AD, `session_015BmpnZ11jw7Gf6mFdaUGo9`.

## Regia O3 due (session_015BmpnUwZWwGrsy5a7qyDwZ, dal 16/11 alle 00:39)

- **00:40** Mano presa, piano in 3 righe all'AD chat 5. Clone del sito in `/home/user/mycity` (main `b6ef4af`). Spesa da `get_session`: R25 15,48 · R26 15,96 · R27 13,99 $. A ognuno mandata la sua spesa e il promemoria «consegna verso 25 $, tetto 35 $».
- **00:49** Sorveglianza: R25 e R26 con guardia verde, R27 senza ramo spinto. `ramo R26` aggiunto a `rossi-noti.txt`. `--attendi` rilanciata.
- **00:50** Le due strade per K12 mandate all'AD chat 5 (consiglio la b: i dollari non spesi dai riparatori fra 25 e 35 $ vanno a K12, fino a 60 $; totale circa 198 $). K12 resta chiuso fino alla risposta.
- **00:55 — punto 3a, come `applica` sceglie fra due collaudi** (`decidi` in `cervello/riparazione-sessioni.mjs` ~1592): un giudizio pieno batte uno senza; **fra due pieni vince il più severo, senza guardare la data né il commit**. Quindi R04-021, R07-021 e R07-022 restano aperte col «parziale» pieno di K02/K10 anche col «regge» pieno di K11. Non si scrive a mano nei registri. Per chiuderle serve una regola nuova nel programma (per esempio: un pieno dato su un commit più recente della stessa voce batte quello vecchio). È una modifica alla macchina, 🟡: va all'AD con la fermata finale, non la fa la regia.
- **00:55 — messaggi delle figlie** (e due girati dalla regia uno). R25: R25-001 «parziale» per il revisore V1 (variante grave: carrello di due negozi, A già nato e rimborso parziale dal cruscotto, B nasce PAID/HELD col netto pieno; media: carrello EXPIRED con carta rimborsata dà 500 per sempre; la contestazione prima dell'ordine chiede `dispute.ts`, non suo). Risposto: prima la correzione di R25-001, la parte su `dispute.ts` come serve_file_altrui, il 500 solo se piccolo, poi le B 019 e 020 sotto i 25 $. R26: R26-001 parziale (`da2d9cbc`), R26-004 e 006 serve_file_altrui, lotto 2 ristretto, lotti 3 e 4 (14 voci) non_fatto per il tetto. Risposto: dopo 021, le B 002/003/011 se non fatte al posto di 009/015. R27: lotto 1 (7 voci di soldi) in corso; mandate le sue B.
- **Le voci della cucitura (B) per sessione** (da `chiavi-onda3.txt` sul piano): R25 003 013 015 019 020 · R26 002 003 004 006 011 · R27 001 003 004 006 008 011 013 015 (18).
- **Per Nicola, alla fermata finale:** applicare la migrazione 500 (secchio privato «returns») e decidere sulle foto dei resi già caricate in `products/<cliente>/returns/` (R26-001). Il passaggio del modulo del reso al secchio privato aspetta `lib/storage/regole-secchi.ts` (serve_file_altrui).
- **00:52 — l'AD sceglie «b» per K12, con tre paletti.** ① K12 parte da 30 $ e sale solo coi dollari che i riparatori lasciano davvero sotto i 35 $ (da `get_session` a consegna chiusa), fino a 60 $; il pezzo resta sotto i 215 $. ② Se le voci riparate da giudicare superano 50, ci si ferma e si scrive all'AD prima di aprire K12. ③ La #973 (il campo «niente campione sotto le 40 voci» nel piano) aspetta l'unione di Nicola: il campo per l'onda 3 in `piano.json` si scrive dopo, al livello giusto (un numero d'onda che non esiste, o il campo dentro un'onda, spegne la regola senza avvisare: AR-1188, AR-1189), e si controlla che le chiusure di `applica` cambino rispetto a senza campo. Confermato all'AD.
- **00:52** R27 cambia l'ordine: dopo il lotto 1 (5 commit su 7) e la sua revisione, il lotto 2 sono le 8 voci della cucitura; le altre 7 escono «non_fatto: tetto» se non resta spesa.
- **00:53** R26, lotto 2: 020, 021, 019, 009 riparati (prova rimessa verde); 015 serve_file_altrui (manca la conferma della carta in `lib/stripe/webhook/ordini.ts`, di R25); 005 non_fatto. Lotto in più col modello piccolo su 003, 002, 011 (B): 003 tocca una prova comune con `lib/api/middleware` di R25, 002 e 011 quasi certo parziali (`CashConfirmDialog`, `cart/page` non suoi). I commit `ba36f97a` e `c81987f0` dell'onda 2 non si trovano: rifà dalla descrizione.
- **00:53** R25, ricontrollo V1b di R25-001: parziale. C1 ha chiuso le due varianti ma ha creato una **regressione** (rimborso parziale a mano su carrello pagato a metà resta PENDING per sempre). R25 lancia C2 (16,51 $, 5 agenti). Risposto: C2 sì, ma è l'ultimo giro (regola 8); se resta una regressione si toglie la parte che la crea e la voce va «parziale» coi residui. Niente regressioni nel ramo.
- **01:01** R27, lotto 1 chiuso: 5 riparati (016, 017, 018+019 in un commit dichiarato, 009), 2 parziali (002: usa le funzioni di `annulla.ts` ma non `annullaERimborsa` intero; 005: email con `after()` e avviso agli admin, niente riprova da sola, il piano con `email_queue` è file altrui). tsc, eslint e 10.420 prove unitarie verdi. 3 difetti nuovi minori sui pagamenti. Referto a `485b02d1`. Ora revisore del lotto 1, poi la cucitura col modello piccolo. 2 agenti su 6.

## Stato al passaggio (16/11 alle 01:05, regista O3 due → regista O3 tre)

La regista O3 due passa la mano perché è vicina ai 250 mila token (regola 4). Tutto quello che ha fatto è nel blocco «Regia O3 due» qui sopra.

**R26 ha finito** (01:04, `session_015BmpnYAcQyeLz2AB2gFogr`, ora completed). Ramo `claude/sito-onda-3-m26` in testa `8cbf7c73`, referto `.riparazione/referto-R26.json`, ultimo commit di codice `8c6a3b8a`, `npm run verify` verde (10.420 prove). **Spesa finale 21,39 $** da `get_session` → lascia **13,61 $** sotto i 35 $, che vanno a K12 (paletto ① dell'AD). Esiti: 4 riparati (020, 019 con migrazione 501, 009, 003), 3 parziali (001 grave, 021 smentita in parte dal revisore a `route.ts:342`, 002), 4 serve_file_altrui (004, 006, 015, 011: per 011 la modifica scritta in scheda su `ProductCard` va tolta, il difetto lì non si raggiunge), 11 non_fatto per il tetto. Nuovo difetto minore: confermare una rimessa segna chiusa tutta la giornata del fattorino (`remitted_at`, migrazione 127). Nessuna falla riservata.

**Spesa del pezzo all'01:05:** R26 21,39 (finale) · R25 ~16,5 (00:53, dal suo messaggio, in C2) · R27 ~15,5 (prima della revisione del lotto 1) · K11 17,89 · regia uno 10,63 · regia due da leggere con `get_session` su `session_015BmpnUwZWwGrsy5a7qyDwZ` a turno chiuso. Circa 82 $ + regia due, sui 215.

**Aperto, in ordine.**
1. **Rifai i controlli su R26:** `MARKETPLACE_REPO=<clone del sito> bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-12-sito-tutto 3` (guardia-ramo e valida-referto). Exit code letto dal comando, non da un filtro dopo.
2. **Apri K12** se R26 è verde: è il primo riparatore con `finita: true`. Strada «b» firmata dall'AD con tre paletti (blocco delle 00:52): parte da 30 $, sale coi dollari lasciati sotto i 35 $ (oggi +13,61 da R26), massimo 60 $; **sopra le 50 voci da giudicare ci si ferma e si scrive all'AD**; giudizio pieno su tutto, niente campione. K12 giudica R26 subito e poi R25 e R27 quando finiscono (in catena). Modello del prompt: K11 (`session_015BmpnYqdgPHMTawQWLA8LL`) e K10; prima riga `ruolo-freno: collaudatore`, 4 subagenti, mai Workflow, effort xhigh, niente ultracode (scelta 3a di Nicola). Ramo `claude/sito-onda-3-k12`. Non c'è una scheda K12 in `schede/`: va scritta o il prompt la sostituisce.
3. **Sorveglianza:** rilancia `--attendi` (i segnali gestiti sono in `rossi-noti.txt`: rami R25, R26, R27). R25 è al secondo e ultimo giro su R25-001 (regola 8): se resta una regressione toglie la parte che la crea e consegna parziale. R27 fa il revisore del lotto 1, poi le 8 voci della cucitura col modello piccolo.
4. **All'unione:** i punti 3a-3c del passaggio di prima restano (3a è risolto in lettura: `decidi` fa vincere il più severo fra due pieni, serve una regola nuova, 🟡 all'AD). La #973 è unita (Nicola, 00:51, main `2a59e77`; AR-1184 chiusa): il campo «40 voci» per l'onda 3 si scrive al livello alto di `piano.json` (non dentro un'onda) prima di `applica`, e si controlla che le chiusure cambino (AR-1188, AR-1189).
5. **Per Nicola, alla fermata finale:** migrazioni 500 e 501 (una per una), decisione sulle foto dei resi già caricate in `products/<cliente>/returns/`, la regola nuova di `decidi`, la #973.

## Regia O3 tre (session_015BmpnYkGxyJiyNSKtpHjGD, dal 16/11 alle 01:05)

- **01:06** Mano presa, piano in 3 righe all'AD chat 5. Spesa della regia due da `get_session`: 3,31 $ (turno ancora aperto) → tetto della regia tre circa 10,7 $. Clone del sito in `/home/user/mycity` (main `b6ef4af`). La #973 è unita su main di ad-mycity (`2a59e77`, 00:51): il campo «40 voci» dell'onda 3 si può scrivere all'unione (paletto ③), ma questo ramo non la contiene ancora.
- **01:07** Sorveglianza a mano: R26 finito, guardia ✅, referto ✅ (22 voci), unione ✅, exit 0.
- **01:10** K11 a turno chiuso costa **19,00 $**, non 17,89 (limite duro dell'AD 18 $: superato di 1 $).
- **01:10** R27: il revisore del lotto 1 smentisce tre riparazioni di soldi (018/019 non reggono: il rimborso sulla carta va sempre a 0 e il `refundOrder` vero lo rifiuta, la prova era verde con un finto; 016 e 009 peggiorano un caso ciascuna). 017 e 005 reggono, 002 resta parziale. Spesa 19,67 $. Scelta della regia: **un solo giro** di correzione sul modello grande (regola 8), con una condizione nuova (prova col `refundOrder` vero o un finto che rifiuta 0) e un revisore nuovo sui tre casi. **Limite 30 $ per tutta R27**: a 30 $ ogni commit non verde va tolto con `git revert`, la voce esce parziale o non_fatto. Prima la cucitura sul modello piccolo.
- **01:17** **K12 aperto** (`session_015BmpnYkT8tPNJhEYhBJmhx`, ramo `claude/sito-onda-3-k12`, da `aa0be11`). Collauda R26 (punta `8cbf7c73`, testa `8c6a3b8a`), giudizio pieno senza campione, tetto 43,61 $ (30 + 13,61 lasciati da R26), 4 subagenti, mai Workflow, effort xhigh, niente ultracode. R25 e R27 gli arrivano in catena da me. Il freno sugli agenti non c'è nelle sessioni dei collaudatori: il loro progetto è ad-mycity e l'hook sta solo nel `settings.json` del sito. Per K12 il tetto di 4 è solo testo.
- **Voci da giudicare stimate per il paletto ②:** R26 7 (4 riparati e 3 parziali); R27 al massimo 15; R25 da vedere a consegna. Siamo sotto le 50.
- **01:19** Sorveglianza: R25 finito. Controlli 01:21: R25 guardia ✅, referto ✅, unione ✅. **R25: 22,92 $ per 1 voce su 22** (R25-001, grave, parziale dopo due giri; 21 non_fatto). Domanda per Nicola nel referto: la finestra di pochi secondi a `ordini.ts:462` si chiude con un controllo nel database (migrazione 490-499) in un'onda dopo, o basta l'avviso agli amministratori? Va alla fermata. R25 resta in attesa su quella domanda: non lo sveglio, il suo lavoro è chiuso.
- **01:22** K12 riceve R25 in catena (una voce da giudicare). **Tetto K12 a 55,69 $** (30 + 13,61 + 12,08).
- **01:21** **R27 con la guardia rossa:** i messaggi di `7606bca8` (R27-001) e `957d753a` (R27-013) citano anche R21-001 e R24-006, i codici dell'onda 2 (`riparazione-sessioni.mjs:1173` cerca la forma `[A-Z]\d{2}-\d{3}` in tutto il messaggio). È un falso allarme: il titolo cita la voce giusta. La storia del ramo di R27 non si riscrive (il permesso per il push forzato è stato negato, ed è giusto così): **lo gestisce la regia all'unione.**
- **01:23** R27, cucitura chiusa 8 su 8: 013 riparato, 001 e 011 parziali, 015 già riparato prima (R24), 003, 004, 006 e 008 serve_file_altrui. Spesa 21,76 $. Domanda di R27 su `tests/unit/minori-s10-catalogo-chat.test.ts`: il file finge `lib/api/middleware` (di R25) con `vi.mock`, quindi per `guardia-ramo` è una **prova comune** e la tocca solo la regista (`importaDaSuoi` → «condivisa»). Risposta: R27 non lo tocca e non fa il revert di `7606bca8`, R27-001 resta parziale. **All'unione la regia applica `cc0c5e70` sul test** (tetto dei token > 2048 e <= 3200), se no `npm run verify` resta rosso.
- **01:25** Situazione mandata all'AD chat 5, con la domanda di R25 e il costo di K11 (19,00 $).
- **01:24** Notifiche lette. Consegna di R25: `npm run verify` verde su `97b6d3b5` (10.423 prove), V1c dice «regge» senza regressioni. Restano: la finestra a `ordini.ts:462` (serve un controllo nel database), la contestazione fra rilettura e nascita (serve_file_altrui su `lib/stripe/webhook/dispute.ts`, che in onda 3 non è di nessuno), l'avviso della banca solo più chiaro, l'avviso «da dividere» doppio. Due difetti nuovi minori: `fascia-al-pagamento.ts:73` (rimborso automatico di un carrello scaduto con la carta già tornata) e la contestazione senza ordini silenziosa in `dispute.ts`. **Cucitura: R25 porta 0 B che reggono.**
- **01:24** L'AD: per K12 l'atteso è 20-25 $ (circa 1,2 $ a voce); oltre 1,5 $ a voce K12 scrive prima. Passato a K12. Per la fermata l'AD chiede: una riga sul perché R25 ha reso 1 voce per 22,92 $ (il grave si è mangiato tutto? le voci Stripe costano di più?); la domanda di R25-001; K11 a 19 $ contro 18 $ nei conti; il campo dei 40 voci con le chiusure prima e dopo (dopo aver portato la #973 nel ramo della regia).
- **01:39** **K12 su R26** (commit `da607a4`): 4 reggono (002, 003, 009, 020; la 002 regge anche se il riparatore la dava parziale), 3 parziali (001 grave, 019, 021), 0 non reggono, 0 rompono altro. 9 prove rimesse con uscita 0 (due con `--sql`). `valida-collaudo` senza rossi (con `"finita": false` esce 3 «in attesa»).
  - **La migrazione 501 NON si applica così com'è:** segna la giornata del fattorino come versata anche quando lascia ordini in attesa (il controllo della cancellazione del fattorino a `cancellazione.ts:~709` legge solo quello). Va corretta prima, in un giro dopo. Inoltre `page.tsx:141` rilascia un ordine mostrato «senza incasso» anche se l'incasso è stato dichiarato dopo l'apertura della pagina.
  - In R26-001 ci sono 4 buchi non dichiarati: le storie, il negozio che cancella l'account, la potatura delle foto orfane, l'informativa. Le foto caricate dal 24/5 al 17/8 in `products/returns/<ordine>/` non le pulisce nessuno. In R26-021, oltre a `:342`, le scorte insufficienti (`:671`) arrivano sempre dopo la pulizia: riprodotto, chiude una cassa buona.
  - Voce nuova: `CashConfirmDialog.tsx:319` (il fuoco della tastiera non si vede, criterio 2.4.7).
  - Nota di K12 per Nicola: SendMessage (lo strumento con cui una sessione riprende un suo revisore) non ha guardia in `.claude/settings.json`.
- **01:42** **K12 a 16,31 $ per 7 voci (circa 2,33 $ a voce), sopra la soglia di 1,5 $ dell'AD.** Il motivo: due revisori per lente e una storia a 261 mila token. Regole nuove: R25-001 si chiude col revisore già in corso. Su R27 un revisore per lente, doppio solo sulle riparazioni di soldi. **Limite duro di K12: 39 $** (il 70% di 55,69). Detto all'AD.
- **01:43** L'AD approva il limite di 39 $ e cambia il piano: K12 chiude R25-001 e consegna (`finita: true`, riparatori R26 e R25). **R27 lo giudica un collaudatore nuovo e corto, K13**: un revisore per lente, il doppio solo sulle riparazioni di soldi. **Tetto K13 = 39 $ meno la spesa finale di K12.** Detto a K12.
- ⛔ **MIGRAZIONE 501 (R26-019): NON APPLICARE, VA CORRETTA.** K12, 01:39: segna la giornata del fattorino come versata anche quando lascia ordini in attesa, e `cancellazione.ts:~709` legge solo quello. Nessuna sessione la porta sul database, nemmeno con la firma della 500.
- **All'unione, nel registro del sito:** i difetti nuovi di K12 (`CashConfirmDialog.tsx:319`, i quattro buchi di R26-001, le foto dei resi dal 24/5 al 17/8, R26-021 a `:671`, `page.tsx:141`) e i 2 di K11 (`policy_ok` senza controllo di tipo a extract-product:412 ed extract-products:304; l'allarme di R14-012 che non si chiude). Il buco del freno su SendMessage lo ha scritto l'AD nel cantiere della macchina (AR-1191).
- **01:45** **K12 consegna** (`ce4b0f8`, `finita: true`, riparatori R26 e R25). Ricontrollo della regia alle 01:46: guardia ✅, collaudo ✅. **R25-001: rompe altro** (peso medio, nato in `97b6d3b5`). Il caso: carrello pagato a metà, A da 20 € nato e B da 30 € mai nato. Se l'admin rimborsa a mano i 30 € di B, il bonifico di A si ferma e il pannello rifiuta ogni divisione (`rimborsi.ts:58`, `rimborsi-da-fuori.ts:386` e `:588`, `divisione-del-rimborso.ts:74` e `:91`): il negozio che ha consegnato resta senza soldi, alla base veniva pagato. Non dichiarati: la finestra di B col rimborso pieno, e il negozio solo con rimborso parziale arrivato prima (`ordini.ts:462` interviene solo con più negozi).
  - **All'unione il ramo di R25 NON entra** (ha solo i tre commit di R25-001 e il referto). R25-001 va a Nicola come decisione (regola 8: due giri falliti). R25 ha speso 22,92 $ per 0 voci chiuse.
  - Spesa di K12: 20,90 $ per 8 voci (circa 2,6 $ a voce). **Tetto K13 ≈ 18 $** (39 meno K12).
- **01:47** **R27 consegna** (punta `f0f97bdb`, testa `16bfc1bb`), spesa **28,64 $** (limite 30). 6 riparati (009, 013, 016, 017, 018, 019), 4 parziali (001, 002, 005, 011), 1 già riparato prima (015), 4 serve_file_altrui (003, 004, 006, 008), 7 non_fatto. Riparazioni di soldi: il revisore della correzione dà verdi i tre casi, col `refundOrder` che rifiuta 0; nessun revert. Rossi già noti: valida-referto solo sulla verifica (la prova comune di 001) e guardia solo sui due messaggi. 5 difetti nuovi minori nel referto. Il più utile: negli scaduti, un ordine con la carta pagato tutto a credito e senza carrello rifatto va ancora a `refundOrder(0)`; succede già sulla base e oggi non scatta.
- **01:49** **K13 aperto** (`session_015BmpnYaDV1ugJ5RP8GQ3ur`, ramo `claude/sito-onda-3-k13`, da `e9de628`) su R27: 11 voci, giudizio pieno, tetto 18 $, consegna a 15 $.

## Stato al passaggio (16/11 alle 01:55, regista O3 tre → regista O3 quattro)

La regista O3 tre passa la mano perché la sua storia è a 281 mila token (regola 4). Spesa della regia tre: 4,57 $ alle 01:52, poco di più a turno chiuso: leggila con `get_session` su `session_015BmpnYkGxyJiyNSKtpHjGD`. **Tetto della regia quattro: 10,69 $ meno la spesa della regia tre** (circa 5,5 $). Resta leggera: i messaggi delle figlie e le notifiche fanno crescere la storia di circa 100 mila token l'ora.

**Spesa del pezzo all'01:55** (da `get_session`): R25 22,92 · R26 21,39 · R27 28,64 · K11 19,00 · K12 20,90 · K13 in corso (tetto 18) · regia uno 10,63 · due 3,31 · tre circa 5. **Circa 132 $ più K13, sui 215.**

**Figlie.** Viva: **K13** (`session_015BmpnYaDV1ugJ5RP8GQ3ur`), che collauda le 11 voci di R27. Tetto 18 $, consegna a 15 $, un revisore per lente, doppio solo su 016, 018/019 e 009. Finite: R25, R26, R27, K11, K12. R25 resta in attesa sulla sua domanda per Nicola: non svegliarlo.

**Aperto, in ordine.**
1. **Sorveglianza:** rilancia `MARKETPLACE_REPO=<clone del sito> bash cervello/riparazione/sorveglia.sh --attendi consegne/riparazioni/2026-11-12-sito-tutto 3; echo EXIT=$?` in sottofondo. Senza `| tail`, che nasconde il codice di uscita. I segnali gestiti sono in `rossi-noti.txt`. Quando K13 consegna: un giro di `sorveglia.sh` senza `--attendi`, guardia di K13 e `valida-collaudo` letti dal diario.
2. **Blocco per l'unione: la guardia di R27 è rossa per un falso allarme**, che nessuna eccezione firmata può sospendere. I messaggi di `7606bca8` (R27-001) e `957d753a` (R27-013) citano anche R21-001 e R24-006, i codici dell'onda 2 delle stesse voci. `riparazione-sessioni.mjs:1173` cerca `[A-Z]\d{2}-\d{3}` in tutto il messaggio, senza `ctx.deroga`. Il manuale (F3 punto 1) dice che un ramo con la guardia rossa non si unisce, e `applica --git` rifà la guardia. Strade per Nicola:
   - **(a), consigliata:** una modifica piccola alla macchina (🟡, la firma Nicola). Il controllo smette di contare i codici di sessioni che non sono dell'onda in corso, oppure diventa derogabile per commit (`REGOLE_PER_COMMIT`). Poi una deroga firmata sui due commit, se serve;
   - **(b):** R27 riscrive i due messaggi sul suo ramo con un push forzato. Il classificatore dei permessi ha bloccato la regia quando l'ha chiesto. Cambierebbero gli sha che K13 sta giudicando, quindi costa di più.
3. **L'unione, intanto, senza R27:** porta la #973 nel ramo della regia (`git fetch origin main` e merge: main `2a59e77`). Integrazione del sito `claude/sito-onda-3` da `76d4c4d`, che main `b6ef4afa` contiene. Dentro: **R26** (punta `8cbf7c73`) e i 5 commit di R14 che reggono per K11 (R14-008, 014, 015, 017, 020, ramo `claude/magical-hamilton-xouwr8-m14` @ `2048b33`, un commit per voce, controllando che non tocchino file di R25-R27). **R25 NON entra** (R25-001 rompe altro, K12). R27 entra solo dopo la scelta di Nicola, e con lui il fix della prova comune `tests/unit/minori-s10-catalogo-chat.test.ts` (tetto dei token > 2048 e <= 3200, come `cc0c5e70`). Poi `npm run verify`, l'harness SQL, C03 (tetto 20 $), PR in bozza, `applica` a vuoto.
4. **Il campo dei 40 voci** si scrive al livello alto di `piano.json` (non dentro un'onda) prima di `applica`. Poi si controlla che le chiusure cambino rispetto a senza campo. **L'AD vuole le due cifre.**
5. **Nel registro all'unione:** i difetti nuovi di K12 (`CashConfirmDialog.tsx:319`, i quattro buchi di R26-001, le foto dei resi dal 24/5 al 17/8, R26-021 a `:671`, `page.tsx:141`), i 2 di K11, i 2 di R25 e i 5 di R27 (nei loro referti).
6. **Cancello della cucitura** (18 voci di B): R25 0 reggono; R26 003 regge (K12), 002 regge (K12), 011 serve_file_altrui, 004 e 006 serve_file_altrui; R27 da K13 (013 riparata, 001 e 011 parziali, 015 già riparata prima). Soglie: 7 o più reggono → si allarga dopo giovedì; meno di 5 → si ferma.
7. **Fermata per Nicola, nella quinta chat dell'AD** (`session_015BmpnZ11jw7Gf6mFdaUGo9`):
   - ⛔ **la migrazione 501 NON si applica**: va corretta prima;
   - la 500 da firmare a parte, e le foto dei resi già caricate;
   - R25-001 come decisione (regola 8), con la sua domanda: controllo nel database o solo avviso;
   - il blocco di R27 (punto 2);
   - la regola nuova di `decidi` per R04-021, R07-021, R07-022;
   - i conti: K11 a 19 $ contro 18; K12 a circa 2,6 $ a voce; perché R25 ha reso 0 voci chiuse con 22,92 $ (il grave con tre giri si è mangiato tutto);
   - il campo dei 40 voci con le due cifre.

## Regia O3 quattro (session_015BmpnWR7z5mBLVTMSz1yFz, dal 16/11 alle 01:56)

- **01:56** Mano presa, piano in 3 righe all'AD chat 5. Spesa della regia tre da `get_session`: 4,57 $ (turno aperto) → tetto della regia quattro circa 6 $. Poi il worker di questa sessione è ripartito: si riprende alle **06:20**.
- **06:22** Clone del sito in `/home/user/mycity` (main `b6ef4af`). `sorveglia.sh --attendi` rilanciato in sottofondo su K13.
- **06:24** La #973 entra nel ramo della regia (merge di main `2a59e77` → `e7b7f14`, spinto). Unico conflitto: `sorvegliante-storico.json`, file scritto dagli hook, preso da main.
- **06:26** **Integrazione del sito `claude/sito-onda-3`** da `76d4c4d`: R26 per intero (`--no-ff`, `470668b4`), poi i commit di R14 con `cherry-pick -x`: R14-008 (`8d43f44f`), R14-007+015 (`e1088bd6`, un commit solo per due voci: la 007 è parziale per K11, non rompe niente), R14-017 (`f45fb244`), R14-020 (`cb8effaa`).
  - `214adc53` (R14-015) tocca `lib/account/cancellazione.ts`, che è anche di R26 (R26-001): righe diverse (R26 fra 90 e 345, le foto; R14 da 756, Stripe e cancellazioni doppie), nessun conflitto. Va detto a C03: nessun collaudo ha giudicato le due insieme.
  - **R14-014 NON entra.** Il suo commit `fdd02e1b` poggia su R14-012 e R14-013 (parziali per K11, e il 012 porta l'allarme che non si chiude, difetto nuovo di K11): da solo va in conflitto sulla prova `riparazione-r14-giro-cancellazioni.test.ts`. `applica` lo darebbe «si chiude» perché K11 dice regge: **C03 deve scriverlo fra le voci rosse** («non è sul ramo unito»), come le tolte dell'onda 1.
- **06:34** Collaudi copiati: `collaudi/K11.json` e `K12.json` (dai rami `-k11` e `-k12` di ad-mycity). Referti copiati: R14 (ramo `-m14` @ `2048b33`), R25, R26, R27.
- **06:34** **Il campo dei 40 voci** (`campione_fino_a_40_dall_onda: 2`) scritto al livello alto di `piano.json`. `applica` a vuoto, senza il referto di R27 (la sua verifica è rossa e ferma tutto): **senza campo 208 si chiudono, con il campo 205.** Le tre di differenza sono R16-014, -015 e -016 (lotto di 21 voci, campione di K08). Uguale all'atteso del builder (AR-1184). Con il campo: 205 si chiudono, 10 già riparate, 410 restano aperte, 185 nati. Nei 205 c'è anche R14-014, che C03 deve togliere: **le chiusure vere sono 204**, R27 escluso.
- R26-002: K12 dice regge ma il riparatore la dà parziale (la label di `PhotoSlot` in `CashConfirmDialog.tsx`, non di R26): `applica` la lascia aperta.
- **07:00** Sul ramo unito del sito: `npm run verify` **verde** (1.587 file e 10.445 prove; serve `NODE_OPTIONS=--max-old-space-size=8192`, se no `tsc` finisce la memoria). Harness SQL **verde** (206 migrazioni, 0 fallite, tutti i controlli; ci sono anche le due prove SQL di R26). Ramo `claude/sito-onda-3` spinto su mycity @ `cb8effaa`.
- **07:05** K13 avvisa: **23,15 $ contro un tetto di 18** (4 revisori qa, 0,92 M token), visti solo a giudizi finiti. Detto di fermarsi senza agenti nuovi.
- **06:59** **K13 consegna** (`d418e80`, `finita: true`): R27 3 reggono (013, 015, 017), 4 parziali (001, 002, 009, 011), **4 rompono altro (005, 016, 018, 019)**, 0 non reggono. `valida-collaudo` e `guardia-ramo` (`--partenza e9de6285`) verdi. Rompono altro: 005, le email del giro partono tutte insieme e oltre 10 al secondo se ne perdono 2 su 12; 016, sul carrello spostato dal freno la carta rende 16 € e il messaggio dice 17 €, e la chiusura senza rimborso lascia l'ordine PAID col bonifico HELD; 018 e 019, col `refundOrder` vero l'ordine che ha ricevuto il credito resta NEW e PARTIALLY_REFUNDED col fattorino a 0 (`payout.ts:2224-2228`). Se R27 entra, questi 4 commit si tolgono con `git revert`.
- **08:30** Giro di `sorveglia.sh` senza `--attendi`: R25 ✅, R26 ✅, R27 rosso solo sui due rossi noti (i due messaggi; la verifica del referto). Collaudo copiato in `collaudi/K13.json`.
- **08:38** **C03 aperto** (`session_015BmpnZ6W8vS4PRFxag5mHg`, ramo `claude/sito-onda-3-c03`) sul ramo unito @ `cb8effaa`, tetto 20 $, consegna a 15 $. La prima richiesta delle 07:10 era stata interrotta prima del permesso. Gli ho chiesto di segnare rossa R14-014 e di guardare `cancellazione.ts`.
- **08:40** **Fermata mandata all'AD chat 5**, con sei decisioni: R27 (con i 4 da togliere), R25-001, le migrazioni 501 e 500, la regola di `decidi`, il campo dei 40 voci, i conti. **Cucitura: si ferma** (3 di B reggono: R26-002, R26-003, R27-013; la soglia è 5).
- **Aperto per chi viene dopo:** C03 consegna → `controlli/C03.json` → `applica` a vuoto (R27 escluso finché Nicola non sceglie) → tolto `.riparazione/` dall'integrazione → PR in bozza sul sito. Spesa del pezzo alle 08:40: circa 155 $ più la regia quattro, e C03 al massimo 20 $.
- **08:47** **C03 consegna** (`27a0bd2`, sul suo ramo solo `controlli/C03.json`): verify verde a `cb8effaa`, 1 voce rossa (R14-014, non sul ramo unito), 0 difetti nuovi, `cancellazione.ts` regge con R26-001 e R14-015 insieme. Spesa 5,21 $.
- **08:48** `applica` a vuoto con C03, R27 escluso: **204 si chiudono** in tutta la campagna, 10 già riparate, 411 restano aperte, 185 nati. Dall'onda 3: R14-008, R14-015, R14-017, R14-020, R26-003, R26-009, R26-020 (7).
- **08:50** Dal ramo del sito tolto solo `.riparazione/referto-R26.json`. I referti R15-R24 dell'onda 2 sono già su main e restano com'erano: un primo commit li toglieva tutti, il secondo li rimette. Il ramo ha 27 file rispetto alla base, punta `23a4139a`. **PR in bozza: mycity#292.**
- **08:52** **Regia quattro chiude.** Spesa 7,52 $ contro un tetto di 6,12 $: lo sforamento è dovuto ai due riavvii del worker e alle verifiche sull'albero unito. Storia a 269 mila token. Spesa del pezzo: circa 167 $ sui 215 (R25 22,92 · R26 21,39 · R27 28,64 · K11 19,00 · K12 20,90 · K13 23,15 · C03 5,21 · regie 10,63 + 3,31 + 4,57 + 7,52).
- **Resta all'AD:** le decisioni della carta #258. Se R27 entra: `git revert` dei commit di 005, 016, 018 e 019, il fix della prova comune `minori-s10-catalogo-chat` e un secondo giro di C03 sul delta. Dopo che Nicola unisce: `applica --git --scrivi` e `chiudi-sito.mjs --pr 292`. La #292 non è più seguita da questa sessione.
