---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2: dalle 08:10 del 14/11 la 6.0 della sesta, id in sessioni.json)
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

**Passaggio alla regista dell'onda 2 · 6.0 (14/11 08:10, dalla 5.0 `…WW9rUE` a 390 mila token, 7,4 $).**
- Via di Nicola, 14/11 06:06: «via ai 4 lavori e l'ondata sui soldi portala a 1500$». Fatti i primi due. K09 ha collaudato R17: reggono 14 voci su 20, 5 sono parziali, e R17-003 è una falla, tolta col suo commit. La cucitura (`9bf9c914`, 11,57 $) ha tolto R19-009, 012 e 015 e chiuso la falla dei permessi di R16.
- Sito: l'integrazione è a `4a3d9b8a`, spinta alle 07:46. Contiene 583624d1, R17 (`c282562e`), il revert di R17-003 (`29a34376`, conflitto sciolto tenendo solo R17-004, verificato col diff) e la cucitura. Verify verde: 1571 file e 10336 prove, 406 s, con `NODE_OPTIONS=--max-old-space-size=6144`. Harness: 205 migrazioni su 205, 72 file verdi.
- Resta il terzo lavoro: C02 · 2.0 (`…YHnGoQ`) sull'albero finale. Ha ultracode spento: il clic è chiesto all'AD alle 06:47 e alle 07:35. Il prompt è di una riga: «Sei il controllore C02 · 2.0. Leggi cervello/riparazione/LEGGIMI-controllore.md e controlla l'onda 2 della cartella consegne/riparazioni/2026-11-12-sito-tutto: integrazione claude/magical-hamilton-xouwr8 @ 4a3d9b8a, base a19ff892.» Tetto 20 $ (ne ha già spesi 3,50). Il referto va in `controlli/C02.json`.
- Poi il quarto: PR in bozza sul sito (alle 07:50 non ce n'era nessuna), il numero al controllore PR e CI · 2.0, `applica` a vuoto, `conti`, fermata 3.
- `applica` a vuoto delle 07:55 è rosso su due punti. Il primo è la guardia di R17 (`bb53b6be`, deroga per Nicola). Il secondo è K08 non finito: non si può chiudere, perché il programma vuole un verdetto per ogni voce riparata e i 28 minori sono all'onda 3 (con finita=true, valida-collaudo dà 32 rossi). Su una copia senza K08: onda 2 = 259 voci, 58 si chiudono, 3 già riparate, 198 aperte; i 20 gravi restano tutti aperti. Le strade per Nicola sono due: K08 · 2.0 finisce il campione (serve ultracode), oppure R15 e R16 le ricollauda l'onda 3.
- R13 e R14 non sono unite: i loro referti stanno fuori da `referti/`, altrimenti `applica` chiuderebbe voci non unite. Il motivo che stampa, «non scritta nel referto», vuol dire «all'onda 3».
- Fermata 3: le deroghe 10708bcf (R13) e bb53b6be (R17); R17 con 15 subagenti su 12; K05-K07 oltre il tetto; K08 che non si chiude; le falle riservate (9, più la variante di K08), per il binario privato; da firmare solo la migrazione 412 di R17 (la 411 è uscita con R17-003); il costo, da risommare con get_session.
- La copia del sito con `blob:none`: prima di sorveglia.sh e di applica si scaricano in blocco i contenuti mancanti (`rev-list --missing=print`, poi `fetch --stdin`). Senza, il giro supera i 15 minuti: è successo alle 06:45. Postgres locale: `service postgresql start`, poi l'harness con `su postgres`.
- Da non archiviare: la 4.0 (dentro c'è K09, e Nicola il 13/11 alle 15:23 ha detto di non archiviare le registe vecchie) e la cucitura, che tiene in chat i dettagli di una falla per il binario privato.
