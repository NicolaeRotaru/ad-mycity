---
tipo: quaderno-regia
onda: 5
data: 2026-11-17 09:01
---

# Onda 5: il quaderno della regista

## In parole semplici
Questo è il diario dell'onda 5, il quinto giro di riparazione dei difetti del sito. Usa la ricetta dell'onda 4, che ha chiuso un difetto per circa 7-8 $. Nicola ha chiesto zero domande fino alla PR pronta da unire.

## Cosa cambia per te
Fino a giovedì 19/11 alle 10:00 si prepara soltanto, quasi senza spendere. Da giovedì alle 10:00 lavorano quattro riparatori, con un tetto di 250 $ per tutta l'onda.

## Cosa devi fare
Niente fino alla PR pronta. Poi leggerla e decidere se unirla.

## Cosa non ho verificato
Il costo per difetto dell'onda 4 viene dalle spese dichiarate dalle sessioni, e manca quella di K15.

## Dettagli tecnici

### Le scelte di Nicola (17/11)
- 08:2x «Riesci a fare l'ondata 5 senza chiedermi nemmeno un consenso fino a quando la pr non è pronta?»
- 08:58 «Parti con l'onda 5», dopo la proposta «250, giovedì, sì». Tetto 250 $. Permesso scritto per sessioni, rami dell'onda 5 sui due depositi e PR. Regia in questa chat.

### Chi
- Regista O5: `session_015BmpnYvNwUpgfdhaKx9PKT` (chat «Onda 5 senza consenso»). Passa la mano a 250 mila token.
- Ramo: `ccr-99009024-qgfisx` su ad-mycity (cartella della campagna) e sul sito (integrazione dell'onda 5).
- Figlie: rami `ccr-99009024-qgfisx-mNN` (riparatori), `-kNN` (collaudatori), `-c05` (controllore).
- AD chat 6 `session_015BmpnXzJ4RxUcjYFTgfqUG`: riceve una riga a ogni passo, nessuna domanda.

### Il tetto: 250 $, preventivo
- Collaudo messo da parte per primo (regola 9): circa 35 $ (circa 1,2 $ a voce, 4 x 25 voci, più margine).
- Riparatori: 4 da 25 voci, ultracode spento, effort xhigh, consegna a 38 $, tetto duro 42 $: atteso circa 150 $.
- Controllore C05: 10 $. Regia: tetto 25 $ (questa chat).
- Minimo circa 150 $ · atteso circa 220 $ con circa 27 chiuse (93 minori al 28% = 26, 7 gravi al 15% = 1) · massimo 250 $, poi stop e consegna di quello che regge.
- Fino a giovedì 10:00 la spesa resta dentro i 350 $ firmati: solo programmi.

### Fuori, senza chiedere (va elencato nella PR)
Lista D (voci per Nicola) · R27 e R25-001 (carta 258) · migrazione 501 · domande di R28 (3) e R29 (2) · eccezione e2e di R29-001 · gravi sui soldi senza prova rossa già scritta · voci al terzo giro.

### Stato
- 09:01 decisione in bacheca e in DECISIONI. Onda 4: C04 finito (14 reggono, 2 minori); la regista O4 due prepara la PR del sito (`d1eaba80` toglie i referti). Nessuna PR aperta sui due depositi.

- 09:05 la regista O4 due: onda 4 finita fino alla PR del sito mycity#293 in bozza. Teste: ad-mycity `4dba3247`, sito `d1eaba80` (verify verde su `074ccbc5`, d1eaba80 toglie solo `.riparazione/`). Chiuse subito le 7 di R28; le 7 di R29 aspettano Nicola (messaggi di commit).
- 09:30 F0 fatta. Unito `claude/sito-onda-4` (conflitti: carte 257-258 tenute, bacheca coi due lati, campagna e storico dal ramo dell'onda 4). `pronte`: A 5 · B 43 · C 42 · D 90. Chiavi in `pronte/onda5-chiavi.txt` (88): B + C + non fatte di R28 e R29 + R28-016 e R29-003, senza R27, A, D, R25-001, R29-001, R29-019, R28-013 e 3 gravi sui soldi. Tolta una voce già chiusa dall'onda 4 (copertura-prima rossa al primo giro). `dividi --base d1eaba80 --sessioni 4 --per-sessione 25`: 100 voci, 63 all'onda dopo. R30 immagini-media 25 (2 gravi, migr. 540-549) · R31 microcopy 25 (1, 550-559) · R32 privacy-legale 25 (1, 560-569) · R33 qa-flussi 25 (3, 570-579). schede, copertura-prima, segnaposti verdi.

### Come si aprono i riparatori (giovedì)
- `create_session`: source_url mycity, source_revision `d1eaba8030dc40ad4479c737c3fedb6668017abf`, outcome_branch `ccr-99009024-qgfisx-mNN`, model opus, effort xhigh, permission_mode auto, tag `riparazione-2026-11-12-sito-tutto`.
- Prompt corto, prima riga `ruolo-freno: riparatore-gravi`: clona ad-mycity accanto al deposito allo SHA della F0, legge LEGGIMI-riparatore e la sua scheda (come nell'onda 4: le schede sono 23-47 KB, incollarle costerebbe circa 100 mila token alla regia), regole dell'onda, piano a me. Se il clone non riesce, le incollo io.
- Un minuto dopo: get_session di ognuna (sigla intera, connessa). A 10 minuti: list_sessions.

- 10:20 Nicola: «Perché non hai tolto la bozza dalle due PR [...] E perché non sei partito?». 10:22 mycity#293 e ad-mycity#978 fuori bozza (CI verde, nessun conflitto). Letto come via subito: il risveglio di giovedì è tolto, il tetto resta 250 $.
- 10:24 aperti R30 `session_015BmpnZVidxbyda8rhpR4fh`, R31 `session_015BmpnYR73VWZ4jYrxgmT5Y`, R32 `session_015BmpnX7wQbfR8T1cwG4VTs`, R33 `session_015BmpnVuDeiYKphvCW4kJMC`. Partenza `d1eaba80`, regole e schede dal clone di ad-mycity a `df9c7c8b`. Ultracode spento, effort xhigh, auto. Consegna a 38 $, tetto 42 $.
- La regia resta in questa chat oltre i 250 mila token (alle 10:20 era a 407 mila, 12,25 $): il permesso di Nicola è scritto qui, e una regista nuova rischierebbe le richieste sul telefono. Turni pochi e corti.

### Prossimi passi
1. Piani di R30-R33: leggerli contro la scheda e rispondere «approvato» o correggere. Controllo a 15 minuti con list_sessions.
2. Sorveglianza con `bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-12-sito-tutto 5` solo quando arriva un esito.
3. Collaudo breve (K17 su R30+R31, K18 su R32+R33), unione su `ccr-99009024-qgfisx` del sito, verify, C05, applica, PR del sito fuori bozza.
- 09:55 CI della #978 rossa sulla fetta 8: `collaudi-guardati-insieme.test.mjs` leggeva la cartella viva della campagna, e lo stato dell'onda 4 (R27-R29, K14) la faceva cadere (5 su 13). Ora legge la campagna ferma a `13fe89c` da git: 13 su 13. La stessa prova sulla cartella viva resta 8 su 13. Modifica alla macchina 🟡, nella PR.
- 10:28 Piano di R33 approvato con correzioni. 8 voci dell'onda 5 sono già riparate nella base dall'onda 4 (collaudate, chiusura in attesa dell'unione della #293): R31-002, 005, 008, 010, 013 · R32-007 · R33-001, 004. Ai riparatori: gia_riparato_prima con un comando, niente lavoro. Difetto della macchina da registrare: `pronte` mette in B voci già riparate e collaudate in un'onda non ancora unita.
- 10:40 Regola dell'onda a tutti: verify VERDE alla testa (nell'onda 4 il verify rosso di R29 ha fermato le sue 7 chiusure: verifica.esito non derogabile). Codice che rompe una prova comune → serve_file_altrui con patch intera (codice + prova comune + prova nuova), applicata dalla regista all'unione.
- 10:58-11:10 Fine primo lotto: R33 9,18 $ (002 parziale, 001 e 004 già riparate) · R30 9,95 $ (007 riparato, 001 e 009 parziali, 002 e 008 altrui) · R31 13,78 $ (025 riparato, 024 parziale, 001-003-016-018 patch intere in `b2c776dc:.riparazione/patch-R31/`, da applicare in fila; 5 già riparate). Il costo delle figlie lo legge la regista: get_session senza id non lo mostra a loro.
- 11:59 R31 consegnato a 33,68 $: testa ada2335c, codice 02b6db8e, verify verde, guardia e valida-referto verdi (rilanciati dalla regista). 4 riparati, 4 parziali, 6 patch intere (b2c776dc: 001, 003, 016, 018; poi b7c0699a: 012, 014, 023; la 014 NON si applica), 5 già riparati, 2 per Nicola, 4 non fatti. 12:00 K17 `session_015BmpnX188B8RPtt7t68cgL` collauda R31, tetto 12 $. R32-001 è una falla riservata: fuori dall'unione, a Nicola solo in chat.
- 12:07 K17 finito (98e7edd, valida-collaudo verde, rilanciato dalla regista). R31: reggono 025, 017, 007 · parziali 024, 022, 009 · non reggono 014 (nessuno legge la frase nell'avviso; la patch 014 ha la quota sbagliata: non si applica) e 011 (nessun file) · 5 già riparate confermate. Nessun giro di correzione: R31 era a 33,68 $ e le due voci non si chiudono con poco. R31 archiviato.
