---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2: dalle 08:30 del 14/11 la «regista O2 settima», id in sessioni.json)
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
- 14/11 08:11 (regola 12, sostituisce le sottocartelle del 13/11): nessuna sessione fa più da cartella. Chi apre una
  sessione la apre da sé, col tag `cartella:<lavoro>-<ruolo>` e il ruolo all'inizio del titolo; le cartelle già aperte
  restano dove sono. L'albero ha 8 livelli al massimo: la regista 6.0 sta al 6. Titoli corti (Nicola, 14/11 08:02).
  Chi scrive codice nasce con effort xhigh e ultracode acceso: prompt esatto «/effort ultracode» (regola 10, 14/11).
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

**Passaggio alla «regista O2 sesta · 2.0» (14/11 08:28, dalla 6.0 `…WFiSCa` a 406 mila token, 11 $).**
- Via di Nicola 14/11 06:06: «via ai 4 lavori e l'ondata sui soldi portala a 1500$». Fatti: K09 su R17 (14 su 20 reggono, 5 parziali, R17-003 tolta, `29a34376`) e la cucitura (`9bf9c914`, toglie R19-009/012/015). Resta: C02 e la fermata 3.
- Sito: integrazione `4a3d9b8a` (R15, R16, R17 senza 003, R18-R24, cucitura; R13 e R14 all'onda 3, referti fuori da `referti/`). Verify verde (1571 file, 10336 prove, `NODE_OPTIONS=--max-old-space-size=6144`), harness 205/205 e 72 file.
- PR in bozza **mycity#290** (07:57). CI rossa solo su e2e «404 page is custom» (R15-005: la scritta due volte, h1 e `<title>`). Il sì di Nicola («togli R15-005») chiesto alle 08:10. La #290 la segue la regista, ma l'iscrizione e la spinta vogliono `add_repo` col push, cioè un clic di Nicola.
- C02 · 3.0 (`…Wwg1yF`) ha finito alle 08:26 (18,23 $ su 20): 3 voci rosse (R15-005, R18-019, R17-017), 17 nati, 80 file guardati su 170, scettico non partito. Referto in `controlli/C02.json`; alle 08:40 la 2.0 ha messo il riservato nella forma del programma (categoria «permessi», senza descrizione).
- Costo onda 2 alle 08:01: 1.277,38 $ su 1.500 (40 sessioni; `costo_onda2` in sessioni.json). Quota in avviso fino al 19/11 10:00, niente extra.
- `applica` a vuoto delle 08:38: rosso solo per la guardia di R17 (`bb53b6be`) e per K08 non finito. Su copia senza K08 e senza la guardia di R17: onda 2 con 259 voci, 57 si chiudono, 3 già riparate, 199 aperte; `conti` verde. Per Nicola: K08 · 2.0 finisce il campione, oppure R15 e R16 le ricollauda l'onda 3.
- Fermata 3 (dopo C02): deroghe 10708bcf (R13) e bb53b6be (R17); R17 con 15 subagenti su 12; K05-K07 oltre il tetto; K08; R15-005; le falle riservate (9 + la variante di K08) per il binario privato, dettagli SOLO in chat; da firmare la migrazione 412 di R17; costo e quota.
- **La settima (08:40).** Revert pronti in locale, non spinti: R15-005 (`47751109`) e R18-019 (`88cff70f`, nessun commit dopo tocca i suoi file) in `/home/user/mycity-revert`. R17-017 resta nel codice e aperta: il revert rimetterebbe il doppio bonifico dopo 24 ore, e il ripiego sbaglia solo senza la 126. Catena `trig_015FammtzzZarEf2a3cGFwwf`. Alle 08:35 il riavvio del processo (`worker_epoch` 2) ha spento ultracode e il titolo è diventato «regista O2 settima».
- «analisi O3» (`…VsbfzoaD`, aperta 08:25 per Nicola, tag `cartella:onda-3-analisi`, tetto 15 $): la prima (`…Z6zAYT`) non è partita per uno SHA corto. «wave 3 setup» (`…XBC7maw`) è di Nicola e prepara l'onda 3.
- Da non archiviare: la 4.0 (dentro K09; Nicola 13/11 15:23) e la cucitura (tiene i dettagli di una falla).
- Copia del sito `blob:none`: prima di sorveglia.sh e applica, scaricare in blocco i contenuti (`rev-list --objects --missing=print --no-walk <rami>`, poi `fetch --stdin`). Albero sessioni: la 6.0 sta al livello 6 di 8; la sua 2.0 al 7; dopo, la regista nuova la apre l'AD.
