---
data: 2026-11-24 18:45
tipo: passaggio della regia (nona → decima)
campagna: onda dei 700
---

# Passaggio · dalla regia nona alla decima

## In parole semplici
Questo foglio serve alla regia decima per partire senza rileggere la chat della nona.
Il giro di correzione è unito sul sito, collaudato e spinto.
Su 18 voci collaudate ne reggono 8, 8 sono a metà, e 2 rompevano altro: tolte con un revert.
Siamo fermi su una domanda a Nicola: il controllo C02 non ci sta più nel tetto di 360 $.
Per esempio: con la sua «B» C02 parte subito e l'onda 3 fa circa 8 voci delle 11 firmate, invece di tutte e 11.

## Cosa cambia per te
Ti apre l'AD, dopo la risposta di Nicola alla fermata delle 18:42. Nessun figlio è al lavoro: K05 ha finito ed è fermo.
Il clic di Nicola su add_repo vale per la sessione che lo chiede. Nella tua lo chiedi di nuovo prima di spingere sul sito.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Le prove complete del sito le ho girate prima del revert: dopo, solo tipi, lint e 10 file di prova vicini.
La mia spesa vera: get_session restava fermo a 2,48 $ (cifra delle 18:34). Rileggila sulla mia sessione.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia nona session_01R8112JxCuigmCaUkgBjJNs: da adesso non spinge più.
K05 session_01R8112NFfioktgK2UyUJotU (finito, non archiviato).

**Il sito.** ccr-d7a54140-hak4ez @ **e173796f6a402d02c9c1ebe748db615ce5ba8dbd**. Su d000e3b0 ci sono l'unione di -m08, -m09 e -m10 (07b23714, nessun conflitto) e il revert di R09-006/007 (10f73a8c e d695062a).
Su 07b23714: npm run verify verde (2103 file, 12.727 prove, lint 0 errori), harness SQL verde (226 migrazioni). Dopo il revert: tsc 0, eslint 0, 10 file di prova vicini (81 prove).

**K05** (6,19 $ sul limite di 5, punta 20569c3fec514422be31fca125b75297b2b31909, `collaudi/K05.json`, guardia-ramo e valida-collaudo verdi).
- Reggono: R08-003, -004, -005, -007, R09-002, -003, -005, R10-002.
- A metà: R08-001, -002, -006, R09-001, -004, R10-001, -003, -005. R08-006 il riparatore la dava già riparata. K05 dice di no: manca il tetto nella risalita SQL di migrations/363.
- Rompe altro, revertite: R09-006 e R09-007. Il divieto di ripartire non scadeva mai e nessuno lo poteva togliere.
- `applica --git /home/user/mycity` a vuoto: 32 si chiudono, 15 già riparate, 75 aperte, 36 nati (`decisioni.json`). `conti` verde: 103 aperte nel registro.

**La fermata delle 18:42** (all'AD, nessuna risposta al passaggio).
- A = tetto 390: C02 (4 $), onda 3 intera (circa 20 $), ricollaudo delle 8 di K04 (circa 5 $).
- B = resta 380: C02 prende i 4 $ dall'onda 3, che fa circa 8 delle 11.
- C = resta 360 per i passi 1-2: niente C02, onda 3 coi suoi 20 $.
- La raccomandazione è B. Senza risposta si resta fermi.

**Il tetto.** 350,51 (fino all'ottava) + K05 6,19 + regia nona ≥ 2,48 = **≥ 359,18 $**. Il tetto totale è 380 = 360 per i passi 1-2 + 20 per l'onda 3.

**Le regole da tenere.** Quelle del passaggio dell'ottava valgono tutte (git, 9aa4e3fb: PASSAGGIO.md).
- SHA interi.
- Controllo a 10 minuti su ogni figlia.
- Ai figli un limite rigido, 1 subagente, niente suite complete: K05 ha sforato lo stesso di 1,19 $. Tieni 1 $ di margine sotto il tetto.
- `valida-referto` vuole `--ramo origin/<ramo>`.
- `MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json` risulta modificato nel disco da un hook, non da me: non l'ho messo nei commit.
- Postgres per l'harness: `pg_ctlcluster 16 main start`, ruolo `root` superutente, `PGHOST=/var/run/postgresql PGUSER=root`.

## I prossimi passi
1. `get_session` su di te; il tuo id nel campo `regista` di `normali/sessioni.json`; commit e push.
2. Clone del sito col git normale in /home/user/mycity, `git fetch` di ccr-d7a54140-hak4ez (deve dare e173796f6a402d02c9c1ebe748db615ce5ba8dbd).
3. Leggi la risposta di Nicola (A, B o C) dall'AD. Senza risposta resti ferma.
4. Con A o B, C02 subito. `create_session` su ad-mycity, `source_revision` = il tuo SHA spinto, `outcome_branch` ccr-d7a54140-hak4ez-c02, tag onda-2-controllori, titolo «C02». Prompt: «Sei il controllore C02. Leggi cervello/riparazione/LEGGIMI-controllore.md e controlla l'onda 2 della cartella consegne/riparazioni/2026-11-24-onda-700/normali: integrazione ccr-d7a54140-hak4ez @ e173796f6a402d02c9c1ebe748db615ce5ba8dbd, base d000e3b04bc9d12ab160f5ebc55c0d665fc6e5a9.» Più una riga: limite 4 $, 1 subagente, solo le modifiche nuove, a limite chiude con quello che ha. In `sessioni.json` sotto `controllori`. Copialo in `controlli/C02.json`, verifica che sul suo ramo ci sia solo quel file, poi `applica --git` a vuoto e `conti`.
5. Con A, anche K06 sulle 8 voci di K04 (`pronte/collaudo-parziale.txt` + R02-001, R02-002, R07-014; rami -m01, -m02, -m07, già nell'integrazione), limite 5 $.
6. Onda 3: le voci di `normali/pronte/onda3-firmate.txt` coi soldi che restano (11 con A o C, circa 8 con B). `eccezioni_firmate` nel piano: il testo esatto è in REGIA.md, alla scelta delle 17:20. Poi `dividi --base e173796f… --file-chiavi`, `schede`, `copertura-prima`, riparatori dall'integrazione, collaudo, controllo, unione. `onda3-se-440.txt` solo col sì scritto di Nicola ai 440 $.
7. Esito all'AD nei quattro blocchi; riga in `cervello/riparazione/misure.json`; i 36 nati e le chiusure col `applica --scrivi` a fine campagna.

**Riga di apertura per l'AD.** «Sei la regista della campagna consegne/riparazioni/2026-11-24-onda-700 (regia decima). Leggi consegne/riparazioni/2026-11-24-onda-700/REGIA.md e consegne/riparazioni/2026-11-24-onda-700/PASSAGGIO.md, poi di .claude/skills/riparazione/SKILL.md solo le sezioni F2, F3 e «Quando ti fermi e chiedi a Nicola», e continua da «I prossimi passi» del passaggio. Nicola parla con l'AD nella sessione session_01R8112Lzth8WvHHrQ4H3whZ: le fermate e l'esito vanno lì con send_message. Tetto: la risposta di Nicola alla fermata delle 18:42 (A 390 $, B 380 $ con C02 preso dall'onda 3, C 360 $ senza C02), che è [A/B/C]; senza risposta resti ferma. Le 13 voci di onda3-se-440.txt solo col sì scritto di Nicola. La spinta sul sito passa dal clic di Nicola su add_repo nella tua sessione. Il sito si legge col git normale. Non cancellare sveglie. Al tuo passaggio di mano non aprire tu la regia undicesima: scrivi PASSAGGIO.md, spingi e manda all'AD lo SHA e la riga di apertura.»
