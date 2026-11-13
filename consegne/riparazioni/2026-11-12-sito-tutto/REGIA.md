---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2: dalle 15:00 del 13/11 la 2.0 della sesta, id in sessioni.json)
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

**Passaggio alla regista dell'onda 2 · 2.0 (13/11 ~15:00, dalla sesta `…YKDqA5` a circa 390 mila token).**
- Sito: clone in `/home/user/mycity` (o `git clone --filter=blob:none`), ogni comando con `MARKETPLACE_REPO=<clone>`. Push: `add_repo` push (nessun clic), poi `git -c push.negotiate=true push`.
- Nicola 12:58: onda al 100%, tetti in tutto R13 90 $, R17 85, R14 80, R16 66, R19 71, R18 70, R24 70, R23 61, R15 60, R21 55. 13:20: collaudi e controlli subito sul già riparato, unione man mano.
- Integrazione del sito a `990dd7fa` (spinta alle 14:59): uniti R15, R16, R18, R19, R20, R21, R22, R23, R24. Tolte col revert dopo K05: R20-011, R20-012, R22-013, R21-004 (rompono altro), R21-008 (rompe altro) e R21-014 (non regge, costruita sopra la 008). Verify verde (1559 file, 10302 prove), harness verde (204 migrazioni, 70 file).
- Collaudi: K05 finito, `collaudi/K05.json` verde (49 voci: 31 reggono, 12 parziali, 5 rompono altro, 1 non regge; 47,02 $ su 30, detto all'AD). K06 (R19, R23, R24), K07 (R18, poi R13 e R17) e K08 (R15, R16, R14) fermi su ultracode: clic chiesto all'AD alle 14:36-14:38. K07 e K08 hanno lo stop a 20 $.
- C02, primo giro su `2d5f0313`: 0 rosse, 13 minori nuovi (`controlli/C02.json`). È a 393 mila token: il secondo giro su `990dd7fa` lo fa «Controllore · C02 · onda 2 · 2.0», da chiedere alla cartella Controllori (tetto 20 $).
- R14 finita (punta `2048b33c`, testa `004218b6`, 75,6 $ su 80): da unire dopo il collaudo di K08. Per la cucitura: R14-021 (`git revert 004218b` e rigenerare `lib/database.types.ts`) e R14-018 (rimettere `930e4f9` con `AI_NEGOZI_ACCESA` finto nella prova e nelle 14 rotte ai/*).
- Al lavoro: R13 (rosso R13-013 `prova_tipo` «leggera», detto alle 14:26) e R17 (prova col nome r17, verify non sulla testa). Quando sono verdi: K07, poi unione.
- Dopo: unione di R13, R14, R17; cucitura dell'onda 2 (serve_file_altrui e parziali in file altrui); C02 2.0; fermata 3. Poi i 10 minori della macchina (commit `2a71b48`).
- Falle riservate: 6 (R14 pagamenti, R16 due di permessi, R19 permessi, R21 accessi, R24 auth) più R21-008 e R21-014. I dettagli solo in chat: la sesta li manda alla 2.0.
- Fermata 3: carta #242 (R13-001, gravi 004-006), R13-003, R17-002 e altre 4 di R17, R20-010, R23-016, R24-003, R24-010, CAPTCHA di R24, eccezione di R16, voci tolte per le prove comuni e per «rompe altro», domande dei referti, falle riservate, revert `10708bcf` di R13, i tetti sforati (K05 47 $ su 30, R21 56 su 55).
- PR e CI: controllore `…WroKtz`. #952 unita da Nicola alle 14:28. Nessuna richiesta aperta su ad-mycity: la creazione si è fermata al permesso, si apre solo con l'ok di Nicola.
- Costi: regia sesta circa 12 $; K05 47,02, C02 14,30, controllore PR 18,1, K06-K08 circa 5 da fermi. Quota in avviso fino al 19/11 alle 10, senza extra.
- Sorveglianza: la 2.0 cancella la catena della sesta («Sorveglianza onda 2 · sesta regista», `list_triggers`) e ne fa una sua ogni 30 minuti.
