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
- Regista O3 due `session_015BmpnUwZWwGrsy5a7qyDwZ` (dal 16/11 00:35, tetto 14 $), dopo la O3 uno `session_015BmpnWmv8ffGh6315mcUd6` (ferma a 399 mila token, 10,63 $). Ramo `claude/sito-onda-3` (ad-mycity e sito), stato al passaggio commit `97d51c1`. Quaderno: `consegne/riparazioni/2026-11-12-sito-tutto/REGIA-ONDA-3.md`. Spesa del pezzo alle 00:30: 54,7 $ su 215 (R25 9,36 · R26 8,10 · R27 8,70 · K11 17,89 · regia uno 10,63). Il grave R25-001 è già nel ramo, guardia verde.
- R25 pagamenti-stripe, R26 privacy-legale, R27 ai-endpoints: piani approvati, ad-mycity clonata accanto, freno attivo. Base dell'onda spostata a `76d4c4d` (il commit del freno, ora antenato del main del sito `b6ef4afa`). Id in `sessioni.json` sul ramo della regista. Tetto 35 $ l'uno.
- K11 `session_015BmpnYqdgPHMTawQWLA8LL`: FINITO (16/11 00:10, detto dalla regista). 17,89 $ su 15, sotto il massimo di 18. Su 16 voci: 8 reggono, 8 a metà, 0 bocciate; programma del collaudo verde. All'unione la regista porta dentro le 5 voci di R14 che reggono (ramo `-m14`, mai unito) e sistema 3 voci dove due collaudi vecchi dicevano «a metà» (applica sceglie il giudizio peggiore).
- K12: NON aperto. Strada «b» scelta dall'AD il 16/11 00:55 (DECISIONI): giudizio pieno, parte a 30 $ e sale coi dollari lasciati dai riparatori sotto i 35 $, massimo 60 $; sopra 50 voci la regista chiede. Si apre quando il primo riparatore ha finito.
- Costruttrice AR-1184 `session_015BmpnWDZD8FG6b9VMuascM`: FINITA. PR ad-mycity#973, testa `22483fc` (dopo `0459edd`: solo a capo e radiografia), 14 controlli verdi su 14 anche il typecheck del Pannello, nessun conflitto con main, 0 subagenti. Col campo a 2 R16-014/015/016 restano aperte; applica a vuoto 200 → 197. Deviazione: mutazioni senza campo «lezione».
- Collaudo corto della #973 `session_015BmpnVa1Fw7Z3tTyJdN5ge` (aperto 16/11 00:39 dalla chat 5): tetto 6 $ solo testo, 0 subagenti, collauda `22483fc`, 5 domande chiuse (la quinta, sul typecheck, tolta alle 00:41 perché GitHub l'ha già misurata verde), consegna con send_message all'AD. ESITO 16/11 00:42: REGGE. Senza campo le 559 decisioni sono uguali a main voce per voce; campo a 2 → 197 (R16-014/015/016), a 1 → 193; correzione tolta → 4 rossi su 13; gate-veri uscita 0. Due buchi minori, registrati: AR-1188 (onda 99 spegne la regola in silenzio) e AR-1189 (campo nel posto sbagliato ignorato). Spesa non letta da get_session. Poi Nicola unisce, e la regista scrive il valore per l'onda 3 in `piano.json` prima di applica.
- AD chat 5 `session_015BmpnZ11jw7Gf6mFdaUGo9`: riceve le fermate e i rapporti.
- AD chat 3 `session_015BmpnUti7NiAJcN27m2Q67`: ferma a 386 mila token, non tiene più niente (K10 è su main con la #970).

### Richieste di unione
- ad-mycity#968, in bozza, ramo `ccr-546d3724-qilkcw`: fermata, divisione dell'onda 3, carta #256, misure. CI verde su `01f78fc`. Da far uscire di bozza: la regista lavora su un ramo che parte da lì.
- mycity#291: il freno nel sito, UNITA alle 00:05.

### Per Nicola, aperto
- Il freno in `ad-mycity/.claude/settings.json`: lo può incollare solo lui (deny per le sessioni). Vale per collaudatori, controllori e regia. Blocco: `{ "matcher": "Agent|Task|Workflow", "hooks": [ { "type": "command", "command": "node cervello/riparazione/freno-subagenti.mjs", "timeout": 10 } ] }`.

### Prossimi passi, in ordine
1. La fermata della regista: K12, poi i numeri veri a fine pezzo (`conti`, costo di ogni figlia, cancello della cucitura sulle 18 voci B: 7 o più si allarga, sotto 5 si ferma).
2. FATTO 16/11 01:00: #973 collaudata (regge), unita da Nicola alle 00:51 (`2a59e77`), AR-1184 chiusa nel cantiere. Resta alla regista: scrivere il campo per l'onda 3 in `piano.json` e vedere le chiusure cambiare.
3. Una scheda nel cantiere (`node cervello/prossimo-ar.mjs`): il freno non vede le sessioni nate con «/effort ultracode», perché legge il ruolo dal primo messaggio. Con ultracode spento oggi non scatta. SCRITTA il 16/11 00:45 come AR-1190 (grave, verifica umana dichiarata).
4. Dopo giovedì 10:00: il resto dell'onda 3 (126 rimandate, lista C 41, gravi di B 4) col preventivo dai costi misurati qui. Prima chiedere a Nicola una seconda lettura della percentuale.

### Regole per chi prende il posto
- Il freno frena solo se la copia di ad-mycity è accanto al deposito prima del primo Agent, e se la riga `ruolo-freno:` è la prima del primo messaggio.
- Le altre regole del quaderno di prima valgono: `consegne/ad/2026-11-15-passaggio-chat-ad-2.md`, sezione «Regole per chi prende il posto».
