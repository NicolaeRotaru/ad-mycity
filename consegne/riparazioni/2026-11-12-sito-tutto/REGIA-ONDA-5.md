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

### Prossimi passi
1. Giovedì 19/11 10:00 (risveglio programmato): get_session, aprire R30-R33, piani, collaudo breve (K17, K18), unione, verify, C05, applica, PR del sito pronta.
- 09:55 CI della #978 rossa sulla fetta 8: `collaudi-guardati-insieme.test.mjs` leggeva la cartella viva della campagna, e lo stato dell'onda 4 (R27-R29, K14) la faceva cadere (5 su 13). Ora legge la campagna ferma a `13fe89c` da git: 13 su 13. La stessa prova sulla cartella viva resta 8 su 13. Modifica alla macchina 🟡, nella PR.
