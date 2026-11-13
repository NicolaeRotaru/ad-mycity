---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2, dalle 13:15 del 13/11: la quinta, id in sessioni.json)
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

**Passaggio alla quinta regista dell'onda 2 (13/11 13:15, dalla quarta `…VkmAAN` a 423 mila token).**
- Sito: `git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity` via proxy, senza add_repo; ogni comando con `MARKETPLACE_REPO=<clone>`. Il push sul sito serve all'unione: add_repo push chiede un clic di Nicola.
- Ultracode spento nella quarta: le sessioni aperte da lei nascono spente; Nicola le accende dall'app. Controllare con get_session prima di aprire collaudatori.
- **12:58, Nicola: «finiamo al 100% l'ondata»**, poi «oltre a questi 99 fai anche quelli che mancano». Ripartiti 10 riparatori con tetti in tutto: R13 90 $, R17 85, R14 80, R16 66, R19 71, R18 70, R24 70, R23 61, R15 60, R21 55. Fino a 10 subagenti in più. A loro: lotti, sonnet sui minori, prove comuni intoccabili (revert + serve_file_altrui), chiusura con verify (8192), finita:true, guardia e referto verdi; oltre 350 mila token si fermano e lo dicono.
- Finite e verdi, da collaudare: R20 (punta `2851b087`, testa `a23283e8`, 13 riparati), R22 (punta `35ee9faa`, testa `edacdd69`, 12). Le altre mandano lo SHA a fine lavoro.
- Poi: K05-K08 (3 riparatori ciascuno, `source_revision` = testa di questo ramo), unione nel ramo di integrazione del sito, verify e harness SQL, **cucitura dell'onda 2** sul ramo unito (tutte le serve_file_altrui e le parziali in file altrui: è nella decisione di Nicola), C02, fermata 3.
- Domande per Nicola: nei `domande_per_nicola` dei referti, circa 25. Falle riservate nuove: 4 (R14 pagamenti, R16 permessi, R19 permessi, R21 accessi); i dettagli solo in chat, dalla quarta.
- La regola data a tutti dall'onda 2: la prova comune torna com'era; la voce che la contraddice si toglie intera con git revert (codice, migrazione, tipi) e va serve_file_altrui, con gli SHA da riprendere e la modifica esatta della prova. Si riprende in cucitura, o all'unione dell'onda 2 se Nicola firma l'eccezione alla fermata 3.
- 10 minori della macchina (9 dal collaudo di `7d9500f`, `wf_135d9675-e15`, più 1 dal collaudo di `c07ebb4`: se il battito c'è ma è vuoto o rotto, la prova non lo rifà), da fare dopo il verde e solo con ultracode acceso: prova da capo a fondo di applica --scrivi con mutazione (il più importante); areaDelNato senza maiuscole e spazi; Array.isArray su dimensioni; doppione al rilancio; la cookie policy doppione della scheda 115; meta.aggiornato; `cervello/test/il-freno-non-era-sulla-strada.test.mjs:276` che scrive nel registro vero (da registrare come nato); l'ordine dei file di R17.md.
- Per la fermata 3: carta #242 (tetto di R13: bloccante R13-001 della cassa del centro, gravi 004-006), R13-003 chi paga gli sconti, R17-002 ordine fermo pagato più le altre 4 domande di R17, R20-010, R23-016, R24-003, R24-010 (dominio di SUPPORT_EMAIL), il CAPTCHA di R24, l'eccezione di R16 e le voci tolte per le prove comuni.
- PR e CI: dal 13/11 13:15 le segue il «Controllore · PR e CI · onda 2» (id in `sessioni.json`, chiave `pr_ci`): ad-mycity#952 ora, la PR del sito dopo l'unione. La regista non ripara la CI.
- Costi alle 13:05: regia quarta 13,5 $ (regia in tutto circa 94 $, tetto 60 $). Figlie: R24 49,9 $, R19 50,8, R16 47,9, R23 41,3, R14 39,8, R21 ~39, R18 ~36, R15 34,3, R17 ~33, R22 ~32, R13 30,5, R20 25,2. Stima in più per finire circa 430 $ (massimo circa 540 $). Quota in avviso fino al 19/11 alle 10.
- Sorveglianza: la catena della quarta è cancellata; la quinta ne fa una sua a 30 minuti.
