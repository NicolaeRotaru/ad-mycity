---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2, dalle 06:55 del 13/11: la terza, session_015BmpnYzJKvQoMML3LmU8aJ)
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

**Passaggio alla terza regista dell'onda 2 (13/11 06:55, dalla seconda `…WRS6Tm` a 472 mila token: regola 7 rotta di nuovo, detto all'AD).**
- R13-R24 aperti, piani approvati, ultracode acceso su tutti (controllato 06:16). Id e rami in `sessioni.json`. SHA_REGISTA onda 2 = `125b2db` (la base dei cloni ad-mycity delle figlie): usarlo come source_revision di K05-K08 e C02.
- Sito: `add_repo` NicolaeRotaru/mycity e clone in `/home/user/mycity`; ogni comando del programma con `MARKETPLACE_REPO=/home/user/mycity`.
- Sorveglianza: catena `send_later` a 30 minuti (prossimo giro 07:19, trig_01TsUDPKVkyuR2nnS4ptbkLf): alla presa del posto cancellarlo e rifarlo dalla regista nuova. Giro 1 (06:48) nel diario.
- Aperti: R16 e R23 guardia rossa per una prova comune toccata (detto a tutte e due: rimetterla, prova nuova col proprio nome). R16-001: aspetta la firma di Nicola su un'eccezione per `tests/unit/il-testo-dice-quello-che-succede-davvero.test.ts`; senza firma va in cucitura. R17: `lib/database.types.ts` assegnato dalla regia (piano + scheda, copertura-prima verde); R17 si ferma a 35 $ e lascia il resto all'onda 3.
- Decisioni sui piani: R22-015 → onda 3 (dipende da R17-002); R20-016 e le dipendenze di R23 → cucitura; R23-016 (festivi) e R24-003 (modificare la recensione) → scelta_di_nicola alla fermata 3.
- ad-mycity#952: unica causa del rosso = `il-conto-del-sito-che-dice-zero` (applica non alzava `meta.findings`). Riparato in `7d9500f`, 27 mutazioni AR-1172 rosse. Collaudo indipendente `wf_135d9675-e15` in corso alla partenza: l'esito lo inoltra la seconda regista. Seguire la CI con `subscribe_pr_activity`. Le 115 chiusure dell'onda 1 valgono solo con la #952 verde.
- Costi alle 06:51: seconda regista 12,61 $; figlie 38,06 $ alle 06:16. Prima regista 40,52 $. Tetto regia 60 $ a onda.
- Dall'analisi della prima regista (`wf_f8b37da0-d37`), da fare: messaggio d'attesa e get_session prima di dare il lavoro a K05-K08 e C02; controllo di used_tokens a ogni giro; registrazione onesta della radiografia in corsa («trovati 3, riparati nello stesso lotto, 643ab2a»); riga in bacheca per R13-R24.

**La terza regista (13/11 06:55, `…YzJKvQ`).** Ultracode acceso dalle 07:04. Catena sua `trig_01Lx5efLQ27HHa6Zq4gLXXYe` (quella della seconda non esisteva più). Sito clonato in `/home/user/mycity`. #952: rossa su `d453f7b` per la radiografia del perimetro toccato (registrata, trovati 0) e per `la-penna-che-si-poteva-scegliere` (senza battito su una copia nuova): riparata in `c07ebb4`, collaudo separato in corso. Regola: niente push sul ramo mentre la CI gira, ogni push la annulla (7d9500f non ha mai avuto una corsa completa per questo).
- Collaudo di 7d9500f (wf_135d9675-e15, dalla seconda regista): 2 «regge», nessun grave, 9 minori della macchina. Il primo pesa: nessuna prova controlla che applica chiami scriviNatiSito (serve una prova da capo a fondo di applica --scrivi più una mutazione). Gli altri: areaDelNato senza maiuscole e spazi, guardia Array.isArray su dimensioni, doppione al rilancio su un registro vecchio, voce cookie policy doppione della scheda 115, meta.aggiornato fermo, la prova il-freno-non-era-sulla-strada.test.mjs:276 che scrive nel registro vero (da registrare come nato), ordine dei file di R17.md. Da fare dopo il verde della #952, non sopra (ogni push annulla la CI).
- Per la fermata 3: tetto di R13 (carta #242: bloccante R13-001 e gravi 004-006 fuori), R13-003 chi paga gli sconti, R17-002 ordine fermo pagato, R20-010, R23-016, R24-003, il CAPTCHA di R24 (gettone consumato due volte), l'eccezione di R16 e le voci tolte da R17 e R24 per le prove comuni (cucitura, o unione dell'onda 2 con la firma).
