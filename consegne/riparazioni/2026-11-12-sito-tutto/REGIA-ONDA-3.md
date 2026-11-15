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
