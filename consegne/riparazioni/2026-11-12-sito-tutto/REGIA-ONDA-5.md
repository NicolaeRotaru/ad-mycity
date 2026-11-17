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
- Riparatori: 4 da 25 voci, ultracode spento, effort xhigh, consegna a 40 $, tetto duro 45 $: atteso 160 $.
- Controllore C05: 10 $. Regia: tetto 25 $ (questa chat).
- Minimo circa 150 $ · atteso circa 230 $ con 25-30 chiuse (minori al 28%, gravi al 15%) · massimo 250 $, poi stop e consegna di quello che regge.
- Fino a giovedì 10:00 la spesa resta dentro i 350 $ firmati: solo programmi.

### Fuori, senza chiedere (va elencato nella PR)
Lista D (voci per Nicola) · R27 e R25-001 (carta 258) · migrazione 501 · domande di R28 (3) e R29 (2) · eccezione e2e di R29-001 · gravi sui soldi senza prova rossa già scritta · voci al terzo giro.

### Stato
- 09:01 decisione in bacheca e in DECISIONI. Onda 4: C04 finito (14 reggono, 2 minori); la regista O4 due prepara la PR del sito (`d1eaba80` toglie i referti). Nessuna PR aperta sui due depositi.

### Prossimi passi
1. Aspettare la riga della regista O4 due con le teste finali di `claude/sito-onda-4` (ad-mycity e sito).
2. Unire `origin/claude/sito-onda-4` nel ramo di ad-mycity. F0: `pronte --git`, `dividi --base <testa onda 4> --file-chiavi <onda5> --sessioni 4 --per-sessione 25`, `schede --ramo ccr-99009024-qgfisx --regista <id>`, `copertura-prima`, `segnaposti`. Commit, push, PR in bozza su ad-mycity.
3. Giovedì 19/11 10:00 (risveglio programmato): get_session, aprire R30-R33, piani, collaudo breve (K17, K18), unione, verify, C05, applica, PR del sito pronta.
