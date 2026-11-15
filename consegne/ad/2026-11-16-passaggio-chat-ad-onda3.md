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
- Regista O3 uno `session_015BmpnWmv8ffGh6315mcUd6`, ramo `claude/sito-onda-3` (ad-mycity e sito). Quaderno: `consegne/riparazioni/2026-11-12-sito-tutto/REGIA-ONDA-3.md`. Tetto 25 $.
- R25 pagamenti-stripe, R26 privacy-legale, R27 ai-endpoints: piani approvati, ad-mycity clonata accanto, freno attivo. Base dell'onda spostata a `76d4c4d` (il commit del freno, ora antenato del main del sito `b6ef4afa`). Id in `sessioni.json` sul ramo della regista. Tetto 35 $ l'uno.
- K11 `session_015BmpnYqdgPHMTawQWLA8LL`: collauda le 16 riparate mai giudicate (R04 3, R07 2, R14 11). Era a 14,34 $ su 15: massimo assoluto 18 $, poi consegna. R14 non è unito sul sito: se le sue voci reggono, all'unione vanno portate dal suo ramo `-m14`.
- K12: NON aperto. 66 voci a circa 1 $ l'una non stanno in 30 $. La regista porta due strade coi numeri, dentro i 215 $.
- Costruttrice AR-1184 `session_015BmpnWDZD8FG6b9VMuascM`, ramo `claude/ar1184-campione-nel-piano`, tetto 12 $: il campo `campione_fino_a_40_dall_onda` letto da applica e pronte. Quando manda la PR: aprire un collaudo corto in una sessione nuova (tetto ~6 $). Dopo l'unione, la regista scrive il valore per l'onda 3 in `piano.json`.
- AD chat 3 `session_015BmpnUti7NiAJcN27m2Q67`: ferma a 386 mila token, non tiene più niente (K10 è su main con la #970).

### Richieste di unione
- ad-mycity#968, in bozza, ramo `ccr-546d3724-qilkcw`: fermata, divisione dell'onda 3, carta #256, misure. CI verde su `01f78fc`. Da far uscire di bozza: la regista lavora su un ramo che parte da lì.
- mycity#291: il freno nel sito, UNITA alle 00:05.

### Per Nicola, aperto
- Il freno in `ad-mycity/.claude/settings.json`: lo può incollare solo lui (deny per le sessioni). Vale per collaudatori, controllori e regia. Blocco: `{ "matcher": "Agent|Task|Workflow", "hooks": [ { "type": "command", "command": "node cervello/riparazione/freno-subagenti.mjs", "timeout": 10 } ] }`.

### Prossimi passi, in ordine
1. La fermata della regista: K12, poi i numeri veri a fine pezzo (`conti`, costo di ogni figlia, cancello della cucitura sulle 18 voci B: 7 o più si allarga, sotto 5 si ferma).
2. La PR della costruttrice AR-1184 → collaudo corto → Nicola unisce.
3. Una scheda nel cantiere (`node cervello/prossimo-ar.mjs`): il freno non vede le sessioni nate con «/effort ultracode», perché legge il ruolo dal primo messaggio. Con ultracode spento oggi non scatta. Ancora non scritta: debito dichiarato.
4. Dopo giovedì 10:00: il resto dell'onda 3 (126 rimandate, lista C 41, gravi di B 4) col preventivo dai costi misurati qui. Prima chiedere a Nicola una seconda lettura della percentuale.

### Regole per chi prende il posto
- Il freno frena solo se la copia di ad-mycity è accanto al deposito prima del primo Agent, e se la riga `ruolo-freno:` è la prima del primo messaggio.
- Le altre regole del quaderno di prima valgono: `consegne/ad/2026-11-15-passaggio-chat-ad-2.md`, sezione «Regole per chi prende il posto».
