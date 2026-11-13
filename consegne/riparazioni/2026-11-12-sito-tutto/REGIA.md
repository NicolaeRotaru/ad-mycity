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

**Passaggio alla regista dell'onda 2 · 4.0 (13/11 17:15, dalla 3.0 `…Z4kEDh` a 335 mila token, 5,8 $).**
- Sito: rifare la copia con la storia intera (`git clone --filter=blob:none --no-checkout`), poi ogni comando con `MARKETPLACE_REPO=<clone>`. Push: `add_repo` push, poi `git -c push.negotiate=true push`. Integrazione sito a `583624d1`: dentro R15, R16, R18-R24; fuori R13, R14, R17.
- Tolte col revert (K06, rompe_altro): R23-003 e R19-007. **Ancora dentro** R19-009, R19-012 e R19-015: il revert litiga con R19-008, che regge (Navbar, cookies), e R19 è senza tetto (71 su 71) e archiviata. Vanno tolte prima che la PR esca di bozza: la cucitura (tech + qa) o una scelta di Nicola.
- K06 finito: 52,70 $ su 30, oltre il tetto e detto all'AD. `collaudi/K06.json` copiato e verde. Campione non accettato su R19, R23 e R24. R19-011 e R24-011 vanno rietichettate da «già riparato» a «riparato».
- K07 (`…V296Wz`): finisce R13 entro 30 $ (lo stop a 20 è tolto), poi consegna. R18 collaudato: 2 non reggono (014, 021), campione non accettato; giro annullato per tetto (68,55 su 70), e le due voci vanno all'onda 3. R17 fuori da K07.
- K08 (`…Xv72iT`): gravi fatti, 24,65 $ e 7 subagenti, collaudo a `31607338`, finita false. La 2.0 `…Wyxgs5` è senza ultracode e aspetta la scelta sui 28 minori. R14: rompe_altro 001, 002, 004 e 005, con giro di correzione a R14 · 2.0 (`…WjBBk7`) dopo la scelta sui minori (guardare prima il suo tetto). R15-001 e R15-002 parziali.
- Scelte chieste all'AD, ancora senza risposta: ultracode qui, in C02 · 2.0 e, con la (a), in K08 · 2.0 e K09; R17 a un K09 nuovo (consigliata, circa 25-30 $); i minori di K08 (+15 $, consigliata) o all'onda 3; K06 lasciato finire; R18 all'onda 3 salvo «alza R18 di 10 $».
- Archiviate dalla 3.0: la 2.0 (11,42 $), K06, R18, R19, R23 e R24. A collaudo chiuso: R13, R14 e la sua 2.0, R15, R16, R17, K07, K08. Mai: la chat dell'AD, `…YkmzPU`, `…W2CbV7`, l'onda 1 e le registe vecchie fino alla fine dell'onda.
- Falle riservate: 7, più il caso di K08 su R14-002, che è la stessa falla dei pagamenti di R14. I dettagli solo in chat: la 3.0 li manda alla 4.0.
- Costi: K07 19,46 $ (in corso), R17 101,9, R18 70,76, R19 71,07, R23 52,14, R24 62,79.
- Dopo: K07 su R13, poi unione di R13 (deroga per `10708bcf`), R14 dopo la correzione, R17 dopo il collaudo; cucitura; C02 · 2.0 sull'albero finale; fermata 3. Nella lista: i revert `10708bcf` e `bb53b6be`, R17 con 15 subagenti, K06 oltre il tetto, le falle, le migrazioni di R13 (371, 373, 377) e di R17 (411-412).
- Il controllore PR e CI dice che la #952 è unita e che su ad-mycity non c'è una PR aperta: aspetta il numero della prossima.
- Sorveglianza: la catena della 3.0 (`trig_017e9EB3p8LUoDwEKjMW99bG`) si cancella al passaggio, e la 4.0 ne fa una sua.
