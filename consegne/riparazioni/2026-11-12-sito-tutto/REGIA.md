---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2, dalle 07:40 del 13/11: la quarta, session_015BmpnVkmAAN92z8w4HLVGB)
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

**Passaggio alla quarta regista dell'onda 2 (13/11 07:35, dalla terza `…YzJKvQ` a 442 mila token, oltre la soglia della regola 7).**
- Figlie R13-R24 aperte, ultracode acceso, id e rami in `sessioni.json`. Sito: `add_repo` NicolaeRotaru/mycity (push), clone in `/home/user/mycity`; ogni comando del programma con `MARKETPLACE_REPO=/home/user/mycity`.
- Finite e verdi (guardia ✅, referto ✅): R13 (codice `6f56a10d`: 0 riparati, 2 parziali, 1 scelta, 22 non_fatto per tetto) e R17 (codice `28a4f5a7`: 0 riparati, 2 parziali, R17-002 tolta col revert e serve_file_altrui, 22 non_fatto). **Subito K05 per R13 e R17**, con `source_revision` = la testa di questo ramo ad-mycity e NON `125b2db`: lì `lib/database.types.ts` non ha padrone e la guardia di R17 risulta rossa per sbaglio. Prima get_session della regista (ultracode) e messaggio d'attesa.
- R20: finita ma con la guardia rossa su 2 prove comuni; approvata la strada sicura (R20-005 resta senza toccare la prova, R20-015 tolta e serve_file_altrui). Aspettare il suo «finita» nuovo.
- Rossi del giro 07:30, già detti alle figlie: R14 (3 prove comuni, titolo riservato col segnaposto), R15 (1 prova comune), R16 (prova_tipo «leggera», titolo riservato col segnaposto), R22 (un commit con due voci: insieme_a), R24 (4 prove comuni: revert di R24-020, R24-017 e R24-010 dopo il lotto 2; R24-010 diventa scelta_di_nicola).
- La regola data a tutti dall'onda 2: la prova comune torna com'era; la voce che la contraddice si toglie intera con git revert (codice, migrazione, tipi) e va serve_file_altrui, con gli SHA da riprendere e la modifica esatta della prova. Si riprende in cucitura, o all'unione dell'onda 2 se Nicola firma l'eccezione alla fermata 3.
- R14: a 33 $ chiude il lotto e spinge «finita»: false; il resto lo riprende una sessione nuova dalla testa del suo ramo. Prima i revisori dei gravi. R18: revert di `1509d2f1` tenuto, i tipi si rigenerano all'unione.
- #952: verde 14 su 14 su `e1a33475` (07:23) e di nuovo su `e581fb26` (07:30); si unisce senza conflitti; in bozza. Riparata con `c07ebb4` (la prova del battito) più la radiografia del perimetro registrata. Il collaudo della correzione ha riprodotto la prova rossa; il verdetto completo arriva alla terza, che lo inoltra. Ogni push fa ripartire la CI.
- 10 minori della macchina (9 dal collaudo di `7d9500f`, `wf_135d9675-e15`, più 1 dal collaudo di `c07ebb4`: se il battito c'è ma è vuoto o rotto, la prova non lo rifà), da fare dopo il verde e solo con ultracode acceso: prova da capo a fondo di applica --scrivi con mutazione (il più importante); areaDelNato senza maiuscole e spazi; Array.isArray su dimensioni; doppione al rilancio; la cookie policy doppione della scheda 115; meta.aggiornato; `cervello/test/il-freno-non-era-sulla-strada.test.mjs:276` che scrive nel registro vero (da registrare come nato); l'ordine dei file di R17.md.
- Per la fermata 3: carta #242 (tetto di R13: bloccante R13-001 della cassa del centro, gravi 004-006), R13-003 chi paga gli sconti, R17-002 ordine fermo pagato più le altre 4 domande di R17, R20-010, R23-016, R24-003, R24-010 (dominio di SUPPORT_EMAIL), il CAPTCHA di R24, l'eccezione di R16 e le voci tolte per le prove comuni.
- Costi: regia prima 40,52 $, seconda ~23 $, terza 14,98 $ alle 07:31, cioè ~78,5 $ contro il tetto di 60 $. Figlie: R13 29,9 $, R17 ~35 $, R14 26,2 $ (07:30). Quota in avviso fino al 19/11 alle 10.
- Sorveglianza: la catena della terza finisce col giro delle 07:30; la quarta ne fa una sua a 30 minuti. Due volte una guardia ha fermato un agente di collaudo che scriveva il battito: si sblocca con TaskStop, senza clic.

**Quarta regista (`…VkmAAN`, dal 13/11 07:40).** Ultracode spento qui (niente codice della macchina). Sito letto senza add_repo: `git clone` via proxy in `/home/user/mycity`; il push serve solo all'unione (clic di Nicola).
- Giro 08:01: finite e verdi R13, R17, R20, R22; rosse R18 (1 prova comune) e R21 (2 prove comuni, referto); prova-unione verde. Figlie a 428,8 $, regia ~81 $: l'onda è a ~510 $, oltre la stima di 435 $ (massimo 550 $).
- 08:06, fermata urgente all'AD per il costo. 12:58, Nicola in questa chat: «finiamo al 100% l'ondata», anche le parziali. Ripartiti R13-R19, R21, R23, R24 con tetti nuovi (R13 90 $, R17 85, R14 80, R18 70, R24 70, R15 60, R19 60, R16 55, R21 55, R23 55) e fino a 10 subagenti in più. Dopo: chiusure, K05-K08, unione, cucitura dell'onda 2 (le serve_file_altrui sul ramo unito), C02, domande a Nicola. Stima in più circa 430 $ (massimo circa 540 $).
