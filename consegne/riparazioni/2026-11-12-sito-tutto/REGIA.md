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

**Passaggio dalla «regista O2 settima» (`…VKqiFC`, 14/11 09:20, verso i 400 mila token) alla «regista O2 ottava», che apre l'AD.**
- Sito: integrazione `4a3d9b8a` (R15, R16, R17 senza 003, R18-R24, cucitura; R13 e R14 all'onda 3). Verify verde, harness 205/205. PR in bozza **mycity#290**, CI rossa su R15-005 (la scritta «Pagina non trovata» due volte). La PR la segue «PR e CI terzo» (`…ZQGy36`). Il revert di R18-019 è già sulla #290 (58e23838). R15-005 si corregge (Nicola 10:20): l'ha fatto R15 secondo.
- C02 terzo (`…Wwg1yF`): 3 rosse (R15-005, R18-019, R17-017), 17 nati, 90 file su 170 non guardati (scelta per Nicola: controllo a parte o CF). `applica` a vuoto: rosso solo per la guardia di R17 (`bb53b6be`, deroga da firmare) e K08 non finito; su copia l'onda 2 chiude 57, 3 già riparate, 199 aperte.
- **Giro di correzione** (Nicola 08:56 «la strada a»): i 7 riparatori «RNN secondo» hanno finito, ognuno sul suo ramo `-mNN`; esiti e punte in `sessioni.json` (`giro_correzione_onda2`). Riparate: R20-011, R22-002, R23-015, R23-018, R17-017. R17-015 e R17-016: correzioni tolte da R17 (revert 3acd324, Nicola 10:20 «2)A»). R18-014 parziale con la migrazione 426. Tutte le altre: serve_file_altrui o parziale, con le diff dei file altrui nei referti. R19-007/012/015 all'onda 3. R23 non ha potuto lanciare guardia-ramo e valida-referto: li lancia la regista prima di unire. R20-011 non si unisce: K05 secondo l'ha trovata rompe_altro, quindi il codice 30b7f9ed resta fuori e la voce resta aperta (terzo giro solo con Nicola).
- K08 terzo (`…ZdoJsh`) ha finito: R15 7 reggono e 10 parziali, R16 13 e 6, campioni non accettati (80% e 75%); R14 in `rimandati_onda_3`. Bocciate rifatte da «Riparatore · R15 · secondo» (`…UwjSH7`, finito: R15-004 riparato, R15-005 corretto, e2e verde in locale, punta c244f89a) e «Riparatore · R16 · secondo» (`…YFtuec`, finito alle 11:30: R16-020 e R16-021 riparate, R16-019 parziale, punta e388903c). «Collaudatore · K05 · secondo» (`…XBtXmn`) ha finito alle 12:05: R22-002 regge, R20-011 rompe_altro. Da aprire, col clic di Nicola: i ricollaudi K07 (R18), K06 (R19, R23, R24), K09 (R17), K08 (R15, R16): le sessioni di prima sono oltre i 300 mila token.
- Nicola 09:14 e 10:20: il giro allargato (42 a metà + 26 serve_file_altrui, più i serve_file_altrui nati in questo giro) parte dopo i ricollaudi e l'unione dei rami; tetto dell'onda 2 alzato a 1.650 $. Regola scritta nella skill (F2). R18-019 tolta dalla #290 (58e23838); R15-005 si corregge (fatto da R15 secondo). Richiesta di unione della macchina: ad-mycity#954, non più in bozza, la segue la settima; unirla è di Nicola.
- Fermata 3, lista: deroghe 10708bcf (R13) e bb53b6be (R17); R17 con 15 subagenti su 12; K05-K07 oltre il tetto; R15-005; le falle riservate (9 + la variante di K08), dettagli SOLO in chat; la migrazione 412 da firmare; i 90 file; il freno mancante sullo strumento Workflow (da incollare in `.claude/settings.json`, solo Nicola); costo e quota; R20-011 rompe_altro (terzo giro solo con Nicola); la guardia di K09 rossa (57 file in più); la migrazione 426 di R18 da firmare.
- Costo: riparatori del giro 68,22 $ + R15 secondo 14,23 $ + R16 secondo 11,34 $ + K08 terzo 11,39 $ + K05 secondo 11,47 $; quasi tutti oltre il tetto perché usage.cost_usd compare solo a lavoro chiuso (da dire in fermata). Catena di sorveglianza allungata a 60 minuti alle 12:32 (`trig_01H5c9X5HQPiVhVbwXH9pzav`), perché nessuna figlia è viva: torna a 30 quando partono i ricollaudi. PR e CI terzo: `…ZQGy36` (#290 rossa solo su «404 page is custom», sparisce con l'unione di m15). Da non archiviare: la 4.0 e la cucitura. Copia del sito `blob:none`: scaricare in blocco i contenuti prima di sorveglia.sh e applica.
