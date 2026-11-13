---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2: dalle 15:52 del 13/11 la 3.0 della sesta, id in sessioni.json)
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
- 13/11 13:35: ogni sessione nasce dentro la sottocartella del suo ruolo, aperta dentro la regista (Regia, Collaudatori,
  Controllori, AD: id in `sessioni.json`, chiave `cartelle`). L'albero ha 8 livelli al massimo: le cartelle stanno al 5.
  Chi scrive codice nasce con effort xhigh e lavora solo con ultracode acceso, che Nicola accende dall'app.
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

**Passaggio alla regista dell'onda 2 · 3.0 (13/11 15:52, dalla 2.0 `…Wf1uAK` a 440 mila token, 8,9 $).**
- Sito: serve una copia con la storia intera (`git clone --filter=blob:none`). Con la copia superficiale il giro delle 15:48 è stato cieco: «commit non nella storia», «non parte dalla base» e «l'unione litiga» su tutti, senza valore. Ogni comando con `MARKETPLACE_REPO=<clone>`. Push sul sito: `add_repo` push, poi `git -c push.negotiate=true push`.
- Nicola, 15:10 e 15:12: si archiviano solo le sessioni finite dell'onda 2. 15:23: R17 sceglie la (a), tetto 105 $; le cinque registe vecchie aspettano la fine dell'onda.
- Archiviate: K05, C02, R20, R21, R22 e la sesta (niente di non unito, verificato su git). A collaudo chiuso: R13, R14 e la sua 2.0, R15, R16, R18, R19, R23, R24, poi R17. Mai: la chat dell'AD, `…YkmzPU` (#947), `…W2CbV7` (mycity#289), l'onda 1.
- Ultracode: acceso qui dalle 15:25; spento in K06, K07, K08 e C02 · 2.0 (`…YHnGoQ`), chiesto all'AD. A ogni giro `get_session` di ognuno: chi ha `is_ultracode_active` riceve il via (K06: R19, R23, R24; K07: R18, R13, poi R17; K08: R15, R16, R14 punta `2048b33c` testa `004218b6`; C02 · 2.0: il delta `2d5f0313..990dd7fa`).
- R13 finita: punta `48b9f178`, testa `a28ea36d`, 76,4 $ su 90; migrazioni 371, 373 e 377 da far decidere a Nicola. Guardia rossa solo per il revert `10708bcf`.
- R17 al lavoro, tetto 105 $: revisori fatti (16 riparati che reggono, 3 parziali, 4 serve_file_altrui, 1 già riparato, 1 non_fatto). Guardia rossa solo per `bb53b6be`, il revert di R17-005 col messaggio senza id: deroga di Nicola alla fermata 3, come `10708bcf`. Aspetto «finita» con punta, testa e costo, poi va a K07.
- Falle riservate: 7, i dettagli solo in chat (li manda la 2.0 alla 3.0). Una è già nell'integrazione `990dd7fa` (R16, migrazione 405): va chiusa prima che la PR esca di bozza.
- Costi: regia 2.0 8,9 $; K05 48,71; C02 16,77; sesta 17,21; K06 3,42, K07 1,17, K08 1,16 da fermi; R17 89,5 su 105.
- Dopo: collaudi K06-K08, unione di R13, R14 e R17, cucitura, C02 · 2.0 sull'albero finale, fermata 3 (lista nel passaggio di prima, più `bb53b6be`).
- Sorveglianza: la catena della 2.0 non c'è più (ultimo giro 15:48, nessun seguito). La 3.0 ne fa una sua ogni 30 minuti.
