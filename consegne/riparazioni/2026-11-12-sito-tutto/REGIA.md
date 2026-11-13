---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2, dalle 13:45 del 13/11: la sesta, id in sessioni.json)
stima_usd: 435
---

# La regia della campagna «sito, tutto»

## In parole semplici
Questo foglio lo legge la regista. È la sessione che apre i riparatori, li sorveglia e unisce il loro lavoro.
Qui trova solo cosa è già fatto e cosa resta; le regole stanno nella skill `riparazione`.
Esempio: l'onda 2 ha 12 riparatori, da R13 a R24, e la voce del bonifico del lunedì (R11-004) è R17-002.

## Cosa cambia per te
Nicola parla con l'AD, nella quinta chat (`session_015BmpnYWmNDPKAztZMPww6M`). Fermate ed esito vanno lì, con send_message.

## Cosa devi fare
Guidare l'onda 2 fino alla fermata 3, poi l'onda 3, la cucitura e il controllore finale.

## Cosa non ho verificato
Che le figlie nascano con ultracode: si controlla con get_session sulla prima, prima di aprire le altre.

---

## Dettagli tecnici

**Le scelte di Nicola.**
- 12/11: casa `sito`, profilo `tutto`, riparatori da 25 voci, tre onde, fermate prima dell'onda 1 e dopo le onde 1 e 2.
- 12/11: un controllore dopo ogni onda e uno finale; niente lavoro inutile.
- 13/11: nessuna sessione fa solo da cartella. Le figlie stanno dentro la regista, col ruolo in testa al titolo
  («Riparatore · R13 · onda 2»). Ogni figlia che scrive codice nasce con ultracode ed effort xhigh.
- 13/11, card 239 «a» e «Allarga la a»: per la sola onda 1 vale l'eccezione firmata su quattro regole
  (`eccezioni_firmate` in piano.json, commit `ed65fbf`). Dall'onda 2 tutto stretto.
- Le migrazioni sul database vero solo con la sua firma, una per una. L'unione e la pubblicazione sono sue.

**Onda 1 (chiusa).**
- Unita nel sito con la mycity#288 il 13/11 alle 04:33 (`a19ff89`). Prima l'AD ha tolto la migrazione 350 (`b868e37`).
- `applica --git` a vuoto, con l'eccezione: verde. 300 voci: 115 si chiudono, 7 già riparate, 178 aperte, 62 nati.
  63 rossi sospesi dall'eccezione, elencati in `decisioni.json`.
- Nessuna delle 115 dipende dalla 350: i 127 file di prova esistono su `a19ff89`.
- Database vero: applicate 250, 260, 270-272, 300, 320-323, 360, 361, 363, 364 e 365. La 350 non esiste più.
- Costo misurato: 583 $ di listino per le figlie, più 164 $ della regista di prima.

**Onda 2 (aperta il 13/11).**
- BASE `a19ff8923106fb5fbe7c2e74cc02979ea9dc2067`. Integrazione sito: `claude/magical-hamilton-xouwr8`.
- Candidate: le 362 rimandate dall'onda 1, più 52 chiavi in `chiavi-onda2.txt`. Sono le 25 di R05, le 14
  `serve_file_altrui`, le 3 `non_fatto`, le 8 tolte con revert, R10-019 (rompe altro, latente su main) e R11-004.
- `dividi`: 12 sessioni R13-R24, 259 voci (1 bloccante, 19 gravi, 239 minori), migrazioni 370-489.
  Passano all'onda 3 155 voci, fra cui R03-008, R05-010, R11-015 e R10-023.
- Stima: circa 376 $ (259 voci per 1,45 $); il tetto detto a Nicola è 435 $, il massimo 550 $.
- Tetti per figlia: riparatore 35 $, collaudatore 30 $, controllore 20 $, regia 60 $.
- Il tasto «Bonifico fatto» del pannello admin dà errore finché R17-002 non è riparata e la sua migrazione applicata.

**Da fare, in ordine.**
1. F1: aprire R13-R24 (sessioni.json), approvare i piani, controllo a 10 minuti, catena di sorveglianza a 30 minuti.
2. F2: collaudatori K05-K08, in catena. F3: unione, prove sull'albero unito, C02, PR in bozza sul sito, fermata 3.
3. ✅ Registro onda 1, 13/11 06:06: `applica --git --scrivi` e `chiudi-sito` con la #288. Sono 115 chiusure, e `conti` è verde.
   Tre prove rilanciate verdi su `a19ff89`: R03-006, R01-010 e R12-014. L'eccezione regge al secondo collaudo (`643ab2a`).
4. Onda 3: `dividi --base <SHA integrazione onda 2> --ultima`, con le voci da rifare dell'onda 2.

**I controllori.** Le regole stanno in `cervello/riparazione/LEGGIMI-controllore.md`. I referti vanno in
`<C>/controlli/`, e `applica` li legge da solo.

**Passaggio alla sesta regista dell'onda 2 (13/11 13:45, dalla quinta `…VzbMLH` a 330 mila token).**
- Sito: clone con `git clone --filter=blob:none`, ogni comando con `MARKETPLACE_REPO=<clone>`. Il push sul sito c'è: add_repo push, senza clic.
- Nicola, 12:58: onda al 100%. Tetti in tutto: R13 90 $, R17 85, R14 80, R16 66, R19 71, R18 70, R24 70, R23 61, R15 60, R21 55.
- Nicola, 13:20: collaudi e controlli subito sul già riparato, e unione man mano. Dalle 13:40 valgono le regole 7 e 11 nuove di `cervello/sessioni-insieme.md`.
- Finite e verdi: R20 (punta `2851b087`), R22 (`35ee9faa`), R21 (`1c8a82ca`, testa `30c48c54`, 56 $ sul tetto di 55). Le collauda K05 (`…ZdFpSJ`, ramo `-k05`), fermo finché Nicola non gli accende ultracode.
  Hanno finito anche R19 (punta `1d939a19`, testa `5a81802f`, 70,2 $ su 71) e R23 (punta `3795e191`, testa `0d499c53`, circa 52 $). Al programma, poi a K06.
- Unione anticipata: R20 e R22 uniti solo nel clone della quinta (`0cfe25e6`, `2d5f0313`), non spinti. Il verify era caduto per memoria: va lanciato con `NODE_OPTIONS=--max-old-space-size=8192`.
  L'harness SQL vuole un Postgres locale: `pg_ctlcluster 16 main start`, poi `createuser -s root` e `PGUSER=root` sul socket.
- Al lavoro: R13, R15, R16, R17, R18 e R24, con la regola della 2.0 a 400 mila token. R14 continua nella sua 2.0 (`…WjBBk7`, da `8582fee7`), ferma finché Nicola non le accende ultracode. Poi K06-K08, tre riparatori ciascuno, appena finiscono.
- Dopo: unione, verify e harness, cucitura dell'onda 2 (le serve_file_altrui e le parziali in file altrui), C02 e fermata 3. Poi i 10 minori della macchina (passaggio della quarta, commit `2a71b48`).
- Falle riservate: 5 (R14 pagamenti, R16 e R19 permessi, R21 accessi, R24 auth), più due nate in R21 (008, 014). I dettagli solo in chat, dalla quinta.
- Per la fermata 3: carta #242 (R13-001 e i gravi 004-006), R13-003, R17-002 e le altre 4 di R17, R20-010, R23-016, R24-003 e R24-010. Poi il CAPTCHA di R24 e l'eccezione di R16.
  Si aggiungono le voci tolte per le prove comuni, le domande dei referti (circa 25, più le 5 di R21) e le falle riservate.
- PR e CI: il controllore `…WroKtz` (`pr_ci` in `sessioni.json`) segue la #952, verde, che Nicola unisce alle 13:40. Mentre corre la CI non si spinge su ad-mycity: avvisa lui.
- Costi alle 13:30 da `cost_usd`: figlie dell'onda 2 circa 586 $, il 20% della settimana. Regia quinta 5,1 $. Quota in avviso fino al 19/11 alle 10, senza extra.
  La sesta cancella la catena di sorveglianza della quinta (`trig_019djWt83zUDMzvAH7mbmYbG`) e ne fa una sua ogni 30 minuti.
