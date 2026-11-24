---
data: 2026-11-24 17:58
tipo: passaggio della regia (ottava → nona)
campagna: onda dei 700
---

# Passaggio · dalla regia ottava alla nona

## In parole semplici
Questo foglio serve alla regia nona per partire senza rileggere la chat dell'ottava.
I tre riparatori del giro di correzione hanno finito e i loro rami sono verdi: 13 voci riparate, 1 già sistemata prima.
Il collaudatore K04 l'ho fermato per il tetto: ha giudicato 4 voci, le altre 8 restano da collaudare.
Siamo a 350,51 $ sui 360 dei passi 1 e 2. Ho chiesto a Nicola, tramite l'AD, se alzare il tetto: la risposta non c'è ancora.
Per esempio: con la sua «A» il tetto va a 390 $ e il collaudo prende tutte le 22 voci; senza risposta si fa «C», dentro i 360.

## Cosa cambia per te
Ti apre l'AD. Nessun figlio è vivo: R08, R09, R10 e K04 sono archiviati, quindi non c'è nessuno a cui dare il tuo id.
Il clic di Nicola su add_repo serve a te, per spingere l'unione sul sito: l'AD glielo annuncia quando sei nata.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Le prove complete del sito sui tre rami non le ho rifatte io: riporto i conti dei riparatori, che vanno rifatti sull'albero unito.
La correzione finale di R08-001 e R08-004 l'ha riletta solo R08, non un secondo revisore: il collaudo la guardi per prima.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia ottava session_01R8112NR6WVqr3y8AwMjC44: da adesso non spinge più.
Regia settima session_01R8112PFGvwN9iRDAdkSTz1: inoltrava i messaggi dei figli, ora non ne arrivano più.

**I tre rami del giro di correzione** (sito, base d000e3b04bc9d12ab160f5ebc55c0d665fc6e5a9; referti in `normali/referti/`, `guardia-ramo` e `valida-referto --ramo` verdi, `prova-unione --onda 2` verde):
- R08 -m08 punta ab803f50178b8b4f460534aa4cc167cbf5743630, testa 5470d9a12ff2536f9f86b307691fc0477668947e: 6 riparate (R08-001, -002, -003, -004, -005, -007), R08-006 già riparata prima. R08-004 cambia la prova esistente riparazione-r02-404-testo-grande.test.ts (legge la classe per nome). 10,66 $.
- R09 -m09 punta 38d213fc34322a4c945a86bb4b26cb0b78a54d8e, testa 10f73a8c8cf527d0d0b63922194f53293a91906c: 6 riparate (R09-002, -003+004, -005, -006+007), R09-001 parziale. 5,66 $.
- R10 -m10 punta fd69bb04288ed2558423c16681ddc417f49b0e01, testa 47f644ba5b097bd0e7454e2d9884cbe02a00bc8d: R10-002 riparata; R10-001, -003, -005 parziali; R10-004 serve_file_altrui (diff per ReorderRail.tsx:198 e :229 nel referto). 4,30 $.
- Domande per Nicola nei referti (restano da parte, senza fermate, regola delle 17:23): R09-001 seconda spedizione, R09-006/007 rotta di avvio lato server, R10-003 avviso sui nomi Facebook col trattino basso.
- Nati minori nei referti (vanno nel registro con `applica`): 2 di R08, 1 di R09, 2 di R10.

**K04** (archiviato, 12,27 $, punta c69d997906944b9f40c1c47346e13933532f627a, `collaudi/K04.json` verde): reggono R02-009, R02-010, R02-012; R02-005 parziale. Senza verdetto: R01 (5 voci di `pronte/collaudo-parziale.txt`), R02-001, R02-002, R07-014.

**La fermata sul tetto** (mandata all'AD alle 17:46, nessuna risposta alle 17:58). A = tetto 390 $, collaudo delle 22 voci, onda 3 intera. B = resta 380, i 9 $ in più li prende dall'onda 3. C = resta 360, collaudo solo delle 14 di R08-R10, le 8 di K04 restano aperte, C02 a 4 $. Senza risposta: C.

**Il tetto.** Misurato con get_session alle 17:55: 278,01 + quinta 6,36 + C01 6,33 + sesta 5,51 + settima 16,00 + R08 10,66 + R09 5,66 + R10 4,30 + K04 12,27 + ottava 5,41 = **350,51 $**. Per i passi 1-2 restano 9,49 $. Con C: K05 a 5 $ e C02 a 4 $, la tua regia sta nel resto solo se resta snella.

**Le regole da tenere.** SHA interi. Controllo a 10 minuti su ogni figlia (get_session; la cifra di un figlio può restare ferma: rileggila a fine lavoro). Ai collaudatori un limite rigido e niente suite complete: K04 ne ha lanciate tre in parallelo e ha speso 12,27 $ su 8. Lo stop va dato a priority now e deve dire «TaskStop sui subagenti»: senza, i revisori in sottofondo continuano. `valida-referto` vuole `--ramo origin/<ramo>`, senza dà uscita 3. REGIA.md è a 72 righe: sotto le 80. La regia passa la mano a 250 mila token: l'ottava ci è arrivata dopo 15 minuti, gran parte è il prompt di partenza.

## I prossimi passi
1. `get_session` su di te; il tuo id nel campo `regista` di `normali/sessioni.json`; commit e push.
2. Clone del sito col git normale in /home/user/mycity, `git fetch` di ccr-d7a54140-hak4ez e dei rami -m08, -m09, -m10.
3. Leggi la risposta di Nicola (A, B o C) dall'AD. Senza risposta, C.
4. K05 subito, prima dell'unione: `create_session` su ad-mycity, `source_revision` = il tuo SHA spinto, `outcome_branch` ccr-d7a54140-hak4ez-k05, tag onda-2-collaudatori, titolo «K05». Prompt: «Sei il collaudatore K05. Leggi cervello/riparazione/LEGGIMI-collaudo.md e collauda i riparatori R08 (ramo ccr-d7a54140-hak4ez-m08, punta ab803f50178b8b4f460534aa4cc167cbf5743630, testa 5470d9a12ff2536f9f86b307691fc0477668947e), R09 (…-m09, punta 38d213fc34322a4c945a86bb4b26cb0b78a54d8e, testa 10f73a8c8cf527d0d0b63922194f53293a91906c) e R10 (…-m10, punta fd69bb04288ed2558423c16681ddc417f49b0e01, testa 47f644ba5b097bd0e7454e2d9884cbe02a00bc8d) della cartella consegne/riparazioni/2026-11-24-onda-700/normali. BASE è d000e3b04bc9d12ab160f5ebc55c0d665fc6e5a9.» Con A o B aggiungi le 8 di K04 (rami -m01, -m02, -m07, già nell'integrazione). Più una riga: limite (5 $ con C), 1 subagente, solo prova rimessa e prove vicine, a limite chiude con le voci giudicate. In `sessioni.json` sotto `collaudatori`.
5. Chiedi all'AD il clic di Nicola su add_repo (push su NicolaeRotaru/mycity). Unione di -m08, -m09, -m10 in ccr-d7a54140-hak4ez da d000e3b0, in ordine; npm run verify, harness SQL (`tests/sql/harness/apply.sh` e `run.sh`), spinta, SHA nuovo in REGIA.md.
6. C02 (controllo sulle sole modifiche nuove, d000e3b0..SHA nuovo; 4 $ con C). K05 e C02 copiati e verdi, poi `applica --git` a vuoto e `conti`. La fermata va all'AD nei quattro blocchi.
7. Onda 3: le 11 firmate (`normali/pronte/onda3-firmate.txt`) coi soldi che restano secondo A, B o C; `onda3-se-440.txt` solo col sì scritto di Nicola ai 440 $.
8. A fine giro la riga in `cervello/riparazione/misure.json`.

**Riga di apertura per l'AD.** «Sei la regista della campagna consegne/riparazioni/2026-11-24-onda-700 (regia nona). Leggi consegne/riparazioni/2026-11-24-onda-700/REGIA.md e consegne/riparazioni/2026-11-24-onda-700/PASSAGGIO.md, poi di .claude/skills/riparazione/SKILL.md solo le sezioni F2, F3 e «Quando ti fermi e chiedi a Nicola», e continua da «I prossimi passi» del passaggio. Nicola parla con l'AD nella sessione session_01R8112Lzth8WvHHrQ4H3whZ: le fermate e l'esito vanno lì con send_message. Tetto: la risposta di Nicola alla fermata delle 17:46 (A 390 $, B 380 $, C 360 $ per i passi 1-2); senza risposta C. Le 13 voci di onda3-se-440.txt solo col sì scritto di Nicola. La spinta sul sito passa dal clic di Nicola su add_repo. Il sito si legge col git normale. Non cancellare sveglie. Al tuo passaggio di mano non aprire tu la regia decima: scrivi PASSAGGIO.md, spingi e manda all'AD lo SHA e la riga di apertura.»
