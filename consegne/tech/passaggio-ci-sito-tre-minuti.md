---
tipo: passaggio
data: 2026-11-13 06:15
da: session_015BmpnWjSJvwxssvANzndUF («CI della macchina in 3 minuti», oltre il 40% del contesto)
richiesta: NicolaeRotaru/mycity#289 (bozza), ramo claude/ci-tre-minuti
---

# Passaggio: la CI delle richieste del sito sotto i 3 minuti

## 1. La richiesta, con le parole di Nicola
- 13/11 04:27: «riesci a portare anche le pr di mycity sotto i 3 minuti?»
- 13/11 ~05:20: «riesci a metterne 8?» (detto dopo «6 fette per il browser»: le fette del browser sono diventate 8; per il collaudo uso 8 revisori).
- 13/11 05:31, risposta a una domanda: «Sì, togli quella del ramo» → la CI parte solo su `pull_request` e su `push` a main (registrato in BACHECA-SESSIONI e DECISIONI, commit ad-mycity `claude/ci-tre-minuti`).
- 13/11 ~06:10: «non hai seguito la regola di aprire una nuova sessione una volta superato il 40% del contesto» → questo passaggio.

## 2. I fatti misurati
- **Prima:** corsa 43359816356 su main 7 min 33 s; le richieste fra 5 min 39 s e 6 min 52 s. Il passo «Test» delle unitarie da solo 6 min 06 s; le prove nel browser 3 min 08 s dopo 2 min di build.
- **Cosa c'è nel ramo** (testa `da33425`, 7 commit sopra `a19ff89`):
  - unitarie in 6 fette (`vitest --shard`, indice e totale da `strategy.job-index/job-total`); browser in 8 fette (`playwright --shard`);
  - ogni fetta carica un referto (fetta.json, universo.json, esito.json); `unit-tests-insieme` ed `e2e-senza-chiavi-insieme` lanciano `scripts/ricuci-fette-ci.mjs` (logica in `scripts/ricuci-fette-ci.lib.mjs`), rosso se una prova manca, è doppia o è rossa;
  - cache di Next una per tipo (lint, browser, axe), solo webpack, swc, `.tsbuildinfo`, `.rscinfo`, `.previewinfo`, chiave v3; Chromium in cache e installato mentre gira la build;
  - prova `tests/unit/le-fette-della-ci-non-perdono-prove.test.ts` (34 casi).
- **Tempi** (tutte verdi):

  | Versione | Cache fredda | Cache calda |
  |---|---|---|
  | 6+4 fette, corsa del ramo | 4 min 32 s | 3 min 57 s |
  | Corse ramo e richiesta insieme | 4 min 44 s e 6 min 09 s (coda fino a 40 s) | — |
  | Corsa sola, 6 fette browser | — | 4 min 06 s |
  | 8 fette, cache per tipo | 3 min 49 s | 3 min 27 s (2 fette in coda 32 s; senza coda circa 2 min 55 s) |
  | Cache ristretta, senza le due chiavi | 4 min 11 s | 4 min 28 s: lint 137 s, browser 107-172 s, cache inutile |
  | Con le due chiavi (`da33425`) | corsa 43370022521 in corso alle 05:11 | da rilanciare |

- **Le due chiavi:** in locale, una build con la cache senza `.rscinfo` e `.previewinfo` compila in 68 s; con le due chiavi in 23,6 s. In tutto: 143 s contro 97 s.
- **Collaudo 1:** 4 revisori più verificatori, 15 agenti. Difetti confermati e già corretti in `f33acc7`:
  - la cache portava `fetch-cache`, e una home rotta restava verde;
  - il reporter github-actions di vitest era sparito;
  - la guardia del punto d'ingresso usciva 0 se lanciata da un collegamento simbolico;
  - 6 casi di prova mancavano;
  - la corsa doppia faceva superare le 20 macchine.

  Non corretto: con la stessa chiave le 8 fette provano tutte a salvare la cache. Costa pochi secondi; il commento lo dice.
- **Collaudo 2:** 8 revisori, workflow `wf_e7afddd3-f22`, lanciato su `f33acc7`. Alle 06:15 è ancora in corso; la sessione vecchia ti manda l'esito con `send_message` appena arriva.
- **Macchine:** l'account ne ha circa 20 insieme. Una corsa usa 19 lavori: lint 1, unità 6, integrazione 1, rls 1, smoke 1, browser 8, axe 1. Altro lavoro dell'account, per esempio la CI di ad-mycity, mette in coda qualche fetta.
- **Dove va il tempo nelle fette del browser:**
  - preparazione circa 35 s;
  - build da 62 a 107 s, perché le macchine non sono tutte uguali;
  - controllo che il server sia pronto, circa 9 s, perché la home aspetta le chiamate al Supabase finto;
  - prove da 14 a 63 s;
  - costo fisso dopo l'ultima fetta, circa 15 s: ricucitura più Main.

## 3. Cosa non si tocca, e cosa leggere prima
- **Vincolo sacro:**
  - nessun controllo si toglie, si salta o si indebolisce;
  - stesse prove, stessi esiti;
  - timeout non abbassati alla cieca;
  - il controllo «Main» resta il nome che la regola pretende.
- **Lavori che non possono avere condizioni:** nei lavori `e2e-senza-chiavi` e `a11y` nessun passo può avere `if:` né leggere segreti. Li sorvegliano `tests/unit/le-prove-nel-browser-non-si-possono-piu-spegnere.test.ts` e `il-cancello-dell-accessibilita-gira-sempre.test.ts`.
- **Il riassunto per fetta resta:** il riassunto delle prove nel browser, con `hannoGuardato === 0` e le saltate senza motivo, deve restare nel lavoro che lancia Playwright.
- **Il cancello Main:** `cancello-main` aspetta tutti i lavori, compresi gli aggregatori. Lo sorveglia `la-regola-main-aspetta-un-controllo-che-esiste.test.ts`.
- **Già scartato, con il motivo:**
  - la modalità `--experimental-build-mode` di Next, perché il sito costruito potrebbe essere diverso;
  - `typescript.ignoreBuildErrors` in next.config, perché toccherebbe un file del prodotto;
  - la cache di `node_modules`, perché il salvataggio a fine lavoro porterebbe dati scritti durante la corsa: è lo stesso difetto di `fetch-cache`.
- `.claude/settings.json` non si scrive. Non si fa merge da soli: l'unione è di Nicola.

## 4. La prova che dice «fatto»
1. Rilanciare la corsa calda su `da33425` (o sulla testa nuova) e misurare dal primo lavoro all'ultimo: sotto i 3 minuti, senza code. Se resta sopra, la leva più grande rimasta è la build delle 8 fette del browser più axe: decidere con l'AD prima di toccarla.
2. Integrare l'esito del collaudo 2: correggere i difetti confermati, ogni correzione con la sua prova che diventa rossa senza.
3. **Guasto finto sulla CI della richiesta:** nel passo «Test» di `unit-tests` sostituire `--shard="$((FETTA_INDICE + 1))/$FETTE_TOTALI"` con `--shard="1/$FETTE_TOTALI"`. Atteso: rosso, con «ha girato due volte» / «non hanno girato» in `unit-tests-insieme` o la prova dei fili rossa, e Main rosso. Poi togliere il guasto e riavere il verde.
4. `node cervello/radiografia-in-corsa.mjs --repo ../mycity` (da ad-mycity) e registrare la dimensione `deploy-sre` sui 3 file toccati, con i difetti trovati dai due collaudi.
5. Aggiornare la descrizione della #289 (ancora quella provvisoria) con i tempi finali, la decisione di Nicola, cosa non è verificato. Lasciarla in bozza.
6. Riga ESITO: `node cervello/chiusura-loop.mjs registra tech ...`.

## 5. Il tetto di spesa
La sessione vecchia è arrivata a 40,28 $, sopra i 30 $ del primo lavoro. Per il seguito: **12 $**. Se non bastano, fermarsi e chiedere all'AD prima di continuare.

## 6. A chi riferire
All'AD, quinta chat `session_015BmpnYWmNDPKAztZMPww6M`, con `send_message`. Il messaggio apre con «Il punto adesso» (✅ fatto · ⏳ in corso · 👉 tocca a Nicola · 💸 costo), poi «Cosa non ho verificato». Segui la richiesta con `subscribe_pr_activity` su NicolaeRotaru/mycity#289: la sessione vecchia si è già tolta.
