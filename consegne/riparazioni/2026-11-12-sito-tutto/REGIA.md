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
- Sito: integrazione `4a3d9b8a` (R15, R16, R17 senza 003, R18-R24, cucitura; R13 e R14 all'onda 3). Verify verde, harness 205/205. PR in bozza **mycity#290**, CI rossa su R15-005 (la scritta «Pagina non trovata» due volte). La PR la segue «PR e CI secondo» (`…Vy26PK`, tetto 12 $): aspetta che Nicola le scriva «aggiungi mycity con push». Da spingere: revert di R18-019 (`git revert 6eefff31`, pulito). R15-005: proposto a Nicola di correggerla invece di toglierla (la prova guardi solo l'h1); nessuna risposta alle 09:20.
- C02 terzo (`…Wwg1yF`): 3 rosse (R15-005, R18-019, R17-017), 17 nati, 90 file su 170 non guardati (scelta per Nicola: controllo a parte o CF). `applica` a vuoto: rosso solo per la guardia di R17 (`bb53b6be`, deroga da firmare) e K08 non finito; su copia l'onda 2 chiude 57, 3 già riparate, 199 aperte.
- **Giro di correzione** (Nicola 08:56 «la strada a»; tetto 130 $): 20 voci delle 23 bocciate. R19-007/012/015 all'onda 3 (cassa, R19-007 al terzo giro); R20-011 rifatta sopra il revert `01547939`. Sessioni «RNN secondo», figlie della settima, ultracode acceso, ramo `-mNN` dalla punta, piano prima: R17 `…W2TiiG` (approvato), R18 `…WAPU36` (approvato; R18-002 e 011 in serve_file_altrui, R18-014 con la 426), R19 `…Vd7HVS` (piano atteso), R20 `…X7d3on` (approvato), R22 `…WWTwzD` (approvato), R23 e R24 (R24 ferma sul permesso «Create Session», clic di Nicola). Schede in scratchpad, rifatte da `schede-giro.mjs` + `diagnosi23.json` (collaudi K05-K07, K09). Dopo: ricollaudo K09 (R17), K07 (R18), K06 (R19, R23, R24), K05 (R20, R22); poi riunione dei rami `-mNN` nell'integrazione; poi controllo sulle sole modifiche nuove; poi fermata 3.
- K08 terzo (`…ZdoJsh`, tetto 25,71 $): finisce R15 e R16; R14 va nel campo `rimandati_onda_3` di K08.json.
- Nicola 09:14: le 42 voci a metà e le 26 serve_file_altrui entrano SEMPRE nel giro di correzione. Proposta all'AD: dopo l'unione dei 7, `dividi` sull'integrazione con quelle 68 chiavi, circa 140 $; tetto da alzare a 1.650 $ (sì di Nicola atteso). La regola va nella skill (AD).
- Fermata 3, lista: deroghe 10708bcf (R13) e bb53b6be (R17); R17 con 15 subagenti su 12; K05-K07 oltre il tetto; R15-005; le falle riservate (9 + la variante di K08), dettagli SOLO in chat; la migrazione 412 da firmare; i 90 file; il freno mancante sullo strumento Workflow (da incollare in `.claude/settings.json`, solo Nicola); costo e quota.
- Costo onda 2 circa 1.306 $ su 1.500 alle 08:56 (stima di «analisi O2»). Catena di sorveglianza `trig_01GAND4PMa1ZL28Jc4hUkZ94` (09:40): l'ottava la riarma da sé. Da non archiviare: la 4.0 (dentro K09) e la cucitura (dettagli di una falla). Copia del sito `blob:none`: prima di sorveglia.sh e applica, scaricare in blocco i contenuti (`rev-list --objects --missing=print --no-walk <rami>`, poi `fetch --stdin`).
