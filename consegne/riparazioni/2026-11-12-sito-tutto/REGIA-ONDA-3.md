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
