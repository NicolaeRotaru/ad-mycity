---
tipo: quaderno-di-bordo
data: 2026-11-13 05:50
per: la regista della campagna «sito, tutto» (onda 2: dalle 17:15 del 13/11 la 4.0 della sesta, id in sessioni.json)
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

**Stato alla fermata dei soldi (4.0 `…ZaZMi8`, 13/11 18:55; regista a 346 mila token, 7,18 $).**
- Fermata: l'onda 2 è a 1.160,62 $ di listino su 33 sessioni (circa 39% della settimana) contro 435 $ detti. AD avvisato alle 17:25; alle 17:15 ha detto «niente che spende finché Nicola non dice via», e chiede il via solo per K09 su R17. Catena di sorveglianza ferma alla fermata (skill): riparte al via.
- Sito: copia con la storia intera in `/home/user/mycity` (`--filter=blob:none --no-checkout`), comandi con `MARKETPLACE_REPO=/home/user/mycity`. Integrazione a `583624d1`: dentro R15, R16, R18-R24; fuori R13, R14, R17. Push sul sito: `add_repo` push, poi `git -c push.negotiate=true push`.
- K07 finito e archiviato (773fddd9, valida-collaudo verde, 33,71 $ su 30). R18: 8 su 14 reggono, 014 e 021 all'onda 3. R13: 1 su 8 regge (025), 001 e 004 rompe_altro. R13 non si unisce: il revert di 5fb08582 (R13-001) litiga su lib/geocodifica.ts, app/api/geocode/route.ts e la sua prova anche togliendo prima 4a1f76a4 (R13-010). Proposta all'AD: R13 tutto all'onda 3 (o la cucitura con ultracode, 10-15 $).
- Ancora dentro l'integrazione e da togliere prima che la PR esca di bozza: R19-009, R19-012, R19-015 (il revert litiga con R19-008), e una falla di sicurezza da chiudere (permessi) nata in R16.
- R14 · 2.0 (`…WjBBk7`) finita (2048b33, testa 004218b): R14 a 75,6 $ su 80, restano 4,4 $ e 2 subagenti per il giro di correzione su 001, 002, 004, 005 (rompe_altro, K08). R15 (f6150e4b) e R16 (8a00cbaf) finite e verdi.
- K08 · 2.0 (`…Wyxgs5`) e C02 · 2.0 (`…YHnGoQ`) ferme, senza ultracode, ferme dalle 17:08. Proposte all'AD: R17 a K09 (25-30 $), i 28 minori di K08 all'onda 3, R18 all'onda 3.
- Clic che aspettano Nicola: ultracode qui (manca in get_session); il controllore PR e CI (`…WroKtz`, 420 mila token) aspetta l'approvazione per aprire la sua 2.0.
- Falle riservate: 7 più la variante di K08 su R14-002, solo in chat: la 4.0 le passa alla 5.0 con send_message. Archiviate dalla 4.0: K07 e la 3.0. Mai: la chat dell'AD, `…YkmzPU`, `…W2CbV7`, l'onda 1, le cinque registe vecchie fino alla fine dell'onda.
- Dopo il via: K09 su R17 (cartella Collaudatori, «apri:», regole 1, 2, 4, 5, 7, 10 per intero), poi R14 dopo la correzione, cucitura (anche R13 se scelto), C02 · 2.0 sull'albero finale, fermata 3 con: deroghe 10708bcf e bb53b6be, R17 con 15 subagenti, K05-K07 oltre il tetto, le falle, le migrazioni di R17 (411-412). A ogni giro: spesa dei collaudatori da get_session, stop appena passano il tetto (AD, 17:05).
