---
tipo: quaderno
data: 2026-11-16 00:10
per: la prossima chat dell'AD, e Nicola se vuole guardare
da: AD chat 4 «Ondata 3», session_015BmpnV65jCuJATqykK8GtB (passa la mano a 399 mila token, 17,41 $)
---

# Il quaderno dell'AD: il primo pezzo dell'onda 3 è partito, col freno

I tre riparatori dell'onda 3 lavorano, col freno sugli agenti attivo e senza ultracode.

## In parole semplici
L'onda 3 è il terzo giro di riparazione dei difetti del sito. Nicola ha scelto un primo pezzo fino a giovedì: 66 voci, tre riparatori, due collaudatori e un controllore, con tetto duro di 215 $. Una regista in una sessione sua lo guida e manda le fermate all'AD.
Esempio: R27 ripara 22 voci degli endpoint dell'assistente, si ferma al settimo agente, e verso i 25 $ consegna quello che ha.

## Cosa cambia per te
Le fermate della regista e i rapporti della costruttrice arrivano adesso a questa chat.

## Cosa devi fare
Aspettare in silenzio la fermata della regista. Nel frattempo, i passi qui sotto quando arrivano i loro avvisi.

## Cosa non ho verificato
Le spese sono quelle dette dalle sessioni. Il freno l'ho provato a mano, non su una sessione vera.

---

## Dettagli tecnici

### Le scelte di Nicola (15/11)
- 11:13 «Parti con l'ondata 3». 23:35, carta #256: «1 = 12%, 2 fatto, 3a, 4a, 5a». 23:4x «incolla i freni». 00:07 «passa».
- 12% del limite usato: smentisce 30,5 $ a punto (sarebbero ~366 $ contro ~2.500 $ dichiarati dal 12/11). In `cervello/riparazione/misure.json`, `letture_app`. Il tetto che frena è quello firmato: 350 $ fino a giovedì 19/11 alle 10:00.
- Ultracode spento su tutti i riparatori dell'onda 3, anche coi gravi (R25, R26).

### Sessioni vive
- Regista O3 quattro `session_015BmpnWR7z5mBLVTMSz1yFz` (dal 16/11 01:55, tetto circa 5,5 $). Stato al passaggio: quaderno della regia, blocco «Stato al passaggio (16/11 alle 01:55)», commit `07dc8e4`. Regie uno-tre: 10,63 + 3,31 + 4,57 $. Prima: O3 tre `session_015BmpnYkGxyJiyNSKtpHjGD` (01:05-01:55). Prima: O3 due `session_015BmpnUwZWwGrsy5a7qyDwZ` (00:35-01:05, tetto 14 $, a 250 mila token in mezz'ora), O3 uno `session_015BmpnWmv8ffGh6315mcUd6` (ferma a 399 mila token, 10,63 $). Ramo `claude/sito-onda-3` (ad-mycity e sito), stato al passaggio commit `97d51c1`. Quaderno: `consegne/riparazioni/2026-11-12-sito-tutto/REGIA-ONDA-3.md`. Spesa del pezzo alle 00:30: 54,7 $ su 215 (R25 9,36 · R26 8,10 · R27 8,70 · K11 17,89 · regia uno 10,63). Il grave R25-001 è già nel ramo, guardia verde.
- R26 FINITO (16/11 01:05): 21,39 $, lascia 13,61 $ a K12. Su 22 voci: 4 riparate e riviste, 3 a metà (fra cui il grave delle foto dei resi), 4 aspettano file di altri, 11 non fatte per il tetto. Per Nicola alla fermata: migrazioni 500 e 501, foto dei resi già caricate, regola su come scegliere fra due collaudi (quaderno della regia, blocco «Stato al passaggio (16/11 alle 01:05)»).
- R25 pagamenti-stripe, R26 privacy-legale, R27 ai-endpoints: piani approvati, ad-mycity clonata accanto, freno attivo. Base dell'onda spostata a `76d4c4d` (il commit del freno, ora antenato del main del sito `b6ef4afa`). Id in `sessioni.json` sul ramo della regista. Tetto 35 $ l'uno.
- K11 `session_015BmpnYqdgPHMTawQWLA8LL`: FINITO (16/11 00:10, detto dalla regista). 17,89 $ su 15, sotto il massimo di 18. Su 16 voci: 8 reggono, 8 a metà, 0 bocciate; programma del collaudo verde. All'unione la regista porta dentro le 5 voci di R14 che reggono (ramo `-m14`, mai unito) e sistema 3 voci dove due collaudi vecchi dicevano «a metà» (applica sceglie il giudizio peggiore).
- K12 `session_015BmpnYkT8tPNJhEYhBJmhx` (aperto 01:17, strada «b»): su R26 4 reggono, 3 a metà, 0 bocciate, 16,31 $ per 7 voci (2,33 $ a voce: due revisori per lente, storia a 261 mila token). Limite duro 39 $ in tutto. L'AD ha chiesto: K12 chiude R25-001 e consegna, R27 a un collaudatore nuovo e corto. R25 FINITO: 22,92 $, 1 voce su 22 (R25-001 a metà). R27: un giro di correzione, 30 $ in tutto. Pezzo previsto sotto i 130 $ su 215.
- R25 FUORI dall'unione (K12: R25-001 «rompe altro», il bonifico del negozio A si ferma se l'admin rimborsa B). K12 finito: 20,90 $ per 8 voci. R27 consegnato a 28,64 $: 6 riparate, 4 parziali, 1 già riparata; lo giudica K13 `session_015BmpnYaDV1ugJ5RP8GQ3ur` (tetto 18 $, consegna a 15). Guardia di R27 rossa per falso allarme (riparazione-sessioni.mjs:1187, codici dell'onda 2 nei messaggi): carta #257 a Nicola, consiglio «a». Intanto la regia unisce R26 e 5 voci di R14 senza R27. Pezzo circa 132 $ + K13.
- Unione locale senza R27 (06:37, regia O3 quattro): R26 + 4 voci di R14 (008, 015, 017, 020); R14-014 fuori (poggia su 012 e 013 a metà). Campo dei 40 voci scritto: 208 chiusure senza, 205 con. Poi verify, prove SQL, C03, PR in bozza.
- FERMATA della regia O3 quattro (16/11 08:40): tutti hanno consegnato. Sito `claude/sito-onda-3` @ `cb8effaa`: R26 intero + R14 008/015/017/020, prove 10.445/10.445, 206 migrazioni in locale. C03 `session_015BmpnZ6W8vS4PRFxag5mHg` (tetto 20 $) ricontrolla, poi PR in bozza sul sito. K13 su R27: 3 reggono (013, 017 + una già riparata), 4 a metà, 4 «rompono altro» (005, 016, 018, 019: soldi), 23,15 $ su 18. Cucitura ferma (3 su 18, soglia 5). Pezzo circa 155 $ + regia + C03 ≤ 20. Carta #258 a Nicola (assorbe la #257): 1 = guardia derogabile + giudizio più recente vince (+5 chiusure, ~15 $), 2 = R25-001.
- FINE PEZZO (08:52): C03 verde (0 difetti nuovi, 5,21 $). 204 voci chiuse nella campagna, 7 dall'onda 3. PR sito mycity#292 in bozza (27 file), NON seguita da qui (repo fuori sessione). Regia quattro 7,52 $ su 6,12, ferma. Pezzo circa 167 $ su 215. Se R27 entra: 4 revert, fix della prova comune, secondo giro di C03 (REGIA-ONDA-3.md, commit 7ea6b67).
- ⚠️ Migrazione 501 di R26: NON applicare (K12: segna versata la giornata del fattorino anche con ordini in attesa). Va corretta in un giro dopo. La 500 si firma a parte.
- Costruttrice AR-1184 `session_015BmpnWDZD8FG6b9VMuascM`: FINITA. PR ad-mycity#973, testa `22483fc` (dopo `0459edd`: solo a capo e radiografia), 14 controlli verdi su 14 anche il typecheck del Pannello, nessun conflitto con main, 0 subagenti. Col campo a 2 R16-014/015/016 restano aperte; applica a vuoto 200 → 197. Deviazione: mutazioni senza campo «lezione».
- Collaudo corto della #973 `session_015BmpnVa1Fw7Z3tTyJdN5ge` (aperto 16/11 00:39 dalla chat 5): tetto 6 $ solo testo, 0 subagenti, collauda `22483fc`, 5 domande chiuse (la quinta, sul typecheck, tolta alle 00:41 perché GitHub l'ha già misurata verde), consegna con send_message all'AD. ESITO 16/11 00:42: REGGE. Senza campo le 559 decisioni sono uguali a main voce per voce; campo a 2 → 197 (R16-014/015/016), a 1 → 193; correzione tolta → 4 rossi su 13; gate-veri uscita 0. Due buchi minori, registrati: AR-1188 (onda 99 spegne la regola in silenzio) e AR-1189 (campo nel posto sbagliato ignorato). Spesa non letta da get_session. Poi Nicola unisce, e la regista scrive il valore per l'onda 3 in `piano.json` prima di applica.
- AD chat 5 `session_015BmpnZ11jw7Gf6mFdaUGo9`: riceve le fermate e i rapporti.
- AD chat 3 `session_015BmpnUti7NiAJcN27m2Q67`: ferma a 386 mila token, non tiene più niente (K10 è su main con la #970).

### Richieste di unione
- ad-mycity#968, ramo `ccr-546d3724-qilkcw`: PRONTA (fuori bozza dal 16/11 01:15, titolo e descrizione rifatti sullo stato vero). CI 14/14 su `41305c8`, nessun commento, nessun conflitto. Seguita da questa chat (subscribe_pr_activity). La unisce Nicola.
- mycity#291: il freno nel sito, UNITA alle 00:05.

### Per Nicola, aperto
- Il freno in `ad-mycity/.claude/settings.json`: lo può incollare solo lui (deny per le sessioni). Vale per collaudatori, controllori e regia. Blocco: `{ "matcher": "Agent|Task|Workflow", "hooks": [ { "type": "command", "command": "node cervello/riparazione/freno-subagenti.mjs", "timeout": 10 } ] }`.

### Prossimi passi, in ordine
1. La fermata della regista: K12, poi i numeri veri a fine pezzo (`conti`, costo di ogni figlia, cancello della cucitura sulle 18 voci B: 7 o più si allarga, sotto 5 si ferma).
2. FATTO 16/11 01:00: #973 collaudata (regge), unita da Nicola alle 00:51 (`2a59e77`), AR-1184 chiusa nel cantiere. Resta alla regista: scrivere il campo per l'onda 3 in `piano.json` e vedere le chiusure cambiare.
3. Una scheda nel cantiere (`node cervello/prossimo-ar.mjs`): il freno non vede le sessioni nate con «/effort ultracode», perché legge il ruolo dal primo messaggio. Con ultracode spento oggi non scatta. SCRITTA il 16/11 00:45 come AR-1190 (grave, verifica umana dichiarata).
4. Nicola, 16/11 09:50: «su 900 ne hai risolti meno di 200, come mai? come risolvi tutti entro il limite che parte giovedì?». Misure: registro sito 779 aperti (696 minori, 77 gravi, 6 bloccanti); campagna 12/11: 662 lavorabili, 204 chiuse. $ a voce chiusa: onda 1 6,34 · onda 2 27 · onda 3 ~24. Proposta data: setaccio «ancora vero?», divisione per file, ricetta dell'onda 1 (senza ultracode, collaudo leggero, piccolo modello sui minori), gravi a parte, prova di giovedì mattina su 50 minori + 5 gravi (~150 $) prima del resto. Serve la percentuale letta in app per sapere quanto vale un punto (30 $ o 200 $).
5. Dopo giovedì 10:00: il resto dell'onda 3 (126 rimandate, lista C 41, gravi di B 4) col preventivo dai costi misurati qui. Prima chiedere a Nicola una seconda lettura della percentuale.

### Regole per chi prende il posto
- Il freno frena solo se la copia di ad-mycity è accanto al deposito prima del primo Agent, e se la riga `ruolo-freno:` è la prima del primo messaggio.
- Le altre regole del quaderno di prima valgono: `consegne/ad/2026-11-15-passaggio-chat-ad-2.md`, sezione «Regole per chi prende il posto».

---

## Passaggio alla chat 6 (16/11 10:45, dalla chat 5 a 467 mila token)

**Chi sei:** AD chat 6 `session_015BmpnXzJ4RxUcjYFTgfqUG`. La chat 5 `session_015BmpnZ11jw7Gf6mFdaUGo9` non tocca più niente.

**Le ultime parole di Nicola (16/11 verso le 10:30):** «fai in modo che vada come l'ondata 1» e «fai partire l'ondata 4».

**Fatto dalla chat 5:**
- #968 unita da Nicola alle 09:25 (`13fe89c`), #973 unita alle 00:51.
- Il ramo `ccr-546d3724-qilkcw` riparte da main. Ha il brief dell'onda 4 e questo blocco: aprici una PR quando hai qualcosa di tuo da aggiungere, oppure subito.
- Brief della regia dell'onda 4: `consegne/ad/2026-11-16-brief-regia-onda-4.md` (ricetta dell'onda 1, tetto di 170 $ fino a giovedì 10:00, elenco A subito, riparatori solo dopo la percentuale).
- La regista O4 `session_015BmpnVW3sawgGZzKKZHfbp` (ramo `claude/sito-onda-4`, parte da `claude/sito-onda-3` su ad-mycity) l'ha aperta la chat 5 e scrive a te.

**Aperto per Nicola:**
1. Le due lettere della carta 258 (`AZIONI-IN-ATTESA.md`). La chat 5 consiglia «1a, 2a»: guardia derogabile più giudizio più recente (+5 chiusure, circa 25 $), e avviso subito più controllo nel database dopo giovedì per R25-001.
2. La percentuale del limite letta adesso nell'app (regola ㉗). Serve a sapere quanto vale un punto, 30 $ o 200 $, prima di aprire i riparatori dell'onda 4.
3. L'unione di mycity#292 (R26 e 4 voci di R14). Il deposito del sito non è in questa sessione: chiedere a Nicola se aggiungerlo per seguirla. La migrazione 501 NON si applica.

**I numeri che servono:**
- Registro del sito: 779 aperti (696 minori, 77 gravi, 6 bloccanti).
- Campagna: 662 lavorabili, 204 chiuse, circa 192 pronte.
- Costo per voce chiusa: onda 1 6,34 $, onda 2 27 $, onda 3 circa 24 $.
- Quota: 12% il 15/11 alle 23:35 (`misure.json`, `letture_app`).

**Prossimi passi:**
1. La fermata 1 della regista O4: girala a Nicola con la domanda della percentuale.
2. Il suo «via» e la percentuale vanno alla regista.
3. Dopo giovedì 10:00: la parte 2, col preventivo dalle misure della parte 1.
4. Se Nicola dice «1a»: la costruttrice delle due modifiche alla guardia, poi un collaudo corto.
