---
data: 2026-11-19 12:15
tipo: passaggio di regia
da: «Ondata 9 · 4.0» (session_015BmpnXTF1dKwFmtRWd5L1s), a 470 mila token
a: «Ondata 9 · 5.0»
---

# Onda 9: il passaggio alla regia 5.0

## In parole semplici
Il giro di giovedì 19/11 ha finito riparatori e collaudi. Mancano l'unione dei rami, la verifica, il controllore e la PR del sito. Un esempio di cosa entra: «Modifica prodotto» dell'amministrazione adesso scrive nel registro anche quando cambiano solo le taglie. La 4.0 passa la mano qui perché la sua storia ha superato i 400 mila token e nessuna figlia aperta da lei sta più lavorando.

## Cosa cambia per te
Niente: Nicola scrive alla 5.0 come scriveva alla 4.0.

## Cosa devi fare
L'unione, con la ricetta qui sotto, poi verify, controllore e PR nuova del sito da `main`.

## Cosa non ho verificato
- L'unione di prova di questi 8 rami: non l'ho fatta.
- La prova del caso grave della scorta (R04-007 del giro 2): l'ha rilanciata K02, non io.

---

## Dettagli tecnici

### I rami (sito NicolaeRotaru/mycity)
| sessione | cartella | ramo | base | testa codice | esito collaudo |
|---|---|---|---|---|---|
| R04 | onda9 | claude/adoring-bohr-kixq35-o9-m04 | f93d246a | cdcb621a | K03: 3 reggono su 6 giudicate; R04-001 rompe_altro |
| R05 | onda9 | …-o9-m05 | f93d246a | dbbb9793 | K03: R05-019 rompe_altro; R05-015 parziale (iconv-lite serve a pdfkit) |
| R08 | onda9 | …-o9-m08 | f93d246a | a431ee63 | K04: 6 su 7 |
| R09 | onda9 | …-o9-m09 | f93d246a | e6672c3d | K04: 11 su 11 |
| R01 | giro2 | …-o9g2-m01 | 336f2fbd | 8aa18de2 | K01 g2: R01-002 rompe_altro |
| R02 | giro2 | …-o9g2-m02 | 336f2fbd | d0def26c | K01 g2: R02-003 rompe_altro |
| R03 | giro2 | …-o9g2-m03 | 336f2fbd | 17e99ba7 | K02 g2: R03-006 rompe_altro |
| R04 | giro2 | …-o9g2-m04 | 336f2fbd | be90b6d3 | K02 g2: R04-007 rompe_altro GRAVE |
Collaudi in `onda9/collaudi/K03.json`, `K04.json`, `onda9/giro2/collaudi/K01.json`, `K02.json`, e `collaudi/K19.json` (gruppo A, 4 su 5).

### La ricetta dell'unione
1. Ramo nuovo da `origin/main` del sito (`336f2fbd`), per esempio `claude/adoring-bohr-kixq35-o9b`.
2. Merge in quest'ordine: o9g2-m01, m02, m03, m04, poi o9-m04, m05, m08, m09. Conflitti attesi: zero (file controllati senza incroci). Se litigano, ci si ferma.
3. Revert delle riparazioni che rompono altro, col loro commit:
   - onda9 R04-001 `d9c91355`; R05-019 `1894c2f3`;
   - giro2 R01-002 `9a60bc75` e `c8a1e2bf`; R02-003 `cc60dfa9`; R03-006 `12fb1796` e `17e99ba7`; R04-007 `169132cb` e `fe6b3b05`.
   - R04-005 del giro 2 (`3b5afcae`, `c9bf7172`, `be90b6d3`): la sua prova vuole Chromium e la CI non ce l'ha; si toglie, oppure si aggiunge il passo a `ci.yml` (modifica nel referto). Raccomandazione: toglierla e rifarla nel giro dopo.
   - R05-015: rimettere `iconv-lite` in package.json (la usa pdfkit).
4. R05-016: `git cherry-pick eddf0534` più `node scripts/gen-db-types.mjs` (18 righe da string a string[]), poi verify.
5. `npm run verify` (NODE_OPTIONS=--max-old-space-size=8192), poi controllore C02 sul codice unito, poi `add_repo` push sul sito (approva Nicola) e PR nuova da `main`.

### Le firme ancora aperte (Nicola)
- **La regola dei commit** (`cervello/riparazione-sessioni.mjs` riga 1187, «il messaggio cita RNN-NNN…», senza `ctx.deroga`): oggi 11 commit (i 6 di R02, R03, R06 del 18/11; R08 f6d4f4c1, a431ee63; R03 g2 3bba8949; R01 g2 9a60bc75, 8aa18de2). Se firma: una riga che passa da `ctx.deroga("id_nel_commit", …, c.commit)`, con prova, mutazione e collaudatore diverso.
- **Le prove esistenti ritoccate**: 22 (12 di R03 g2, 5 di R02 g2, 3 di R05, 2 di R08 + 1 di R09 dentro l'eccezione del 18/11). Tutte giudicate non indebolite da K01 g2, K02 g2, K03, K04. L'eccezione `prove_comuni` del 18/11 vale per tutta l'onda 9 e non solo per R02: difetto del programma, da dire a Nicola.
- **R04-007 del giro 2** (la scorta in Modifica e Duplica): secondo giro fallito, regola 8: va a Nicola con le strade.

### Il giro dopo (dentro il tetto di oggi: spesi circa 214 $ su 650)
Le voci decise dalle 12 scelte (DECISIONI 19/11 11:50): recesso nei festivi, 12 px, tasti nel menu account (R01-005 = R02-002 g2), una veloce per fattorino, notifiche subito, notte rossa (R07-009), migrazione e registrazione insieme, ritorno indietro a mano, codice di Sentry e del controllo foto. Più le rompe_altro tolte, le parziali e le serve_file_altrui dei referti di oggi, e il difetto nuovo che conta: un ordine con carta senza coordinate passa senza controllo della zona. Togliere `onda9/giro2/registro-compatto.txt` dal ramo (il guardiano dei fatti).

### Le spese (19/11 12:15)
Regia 4.0 circa 22 $. Riparatori: R04 12,63, R05 6,01, R08 10,37, R09 25,81, R01 g2 25,37, R02 g2 9,66, R03 g2 22,56, R04 g2 19,35. Collaudatori: K19 7,02, K03 11,70, K04 13,15, K01 g2 10,75, K02 g2 17,11. Totale circa 214 $. Limite «allowed», senza uso extra.

### Le falle riservate
Riparate da R01 g2 nelle sue pagine e giudicate «regge» da K01 g2. Restano due pezzi in un file comune: i dettagli arrivano alla 5.0 solo nel primo messaggio. Nel deposito c'è solo questo titolo.
