---
tipo: passaggio
data: 2026-11-13 06:15
da: session_015BmpnWjSJvwxssvANzndUF («CI della macchina in 3 minuti», oltre il 40% del contesto)
a: session_015BmpnUqVt6v4HuqvPF3X7B («CI del sito in 3 minuti · seguito»)
richiesta: NicolaeRotaru/mycity#289 (bozza), ramo claude/ci-tre-minuti
---

# Passaggio: la CI delle richieste del sito sotto i 3 minuti

## In parole semplici
Questo foglio passa un lavoro da una sessione all'altra. Il lavoro è far durare meno di 3 minuti i controlli automatici delle richieste del sito. Per esempio: il 13/11 alle 04:34 la CI di main ci ha messo 7 minuti e mezzo a dare il verde, adesso ne aspetta circa 3 e mezzo. La sessione vecchia ha superato il 40% del contesto, quindi il lavoro continua in una sessione nuova. Qui c'è tutto quello che serve per ripartire senza perdere niente.

## Cosa cambia per te
Niente nel sito. Le prove sono le stesse; cambia solo dove girano, divise su più macchine insieme.

## Cosa devi fare
Niente adesso. Quando la sessione nuova ti dice che la richiesta 289 è pronta, l'unione è tua.

## Cosa non ho verificato
- Una corsa sotto i 3 minuti sulla CI non c'è ancora: l'ultima misurata ha fatto 3 min 27 s.
- Il guasto finto sulla richiesta 289 non è ancora stato fatto.
- L'esito del secondo collaudo, con 8 revisori, non è ancora arrivato.

---

## Dettagli tecnici

### 1. La richiesta, con le parole di Nicola
- 13/11 04:27: «riesci a portare anche le pr di mycity sotto i 3 minuti?»
- 13/11 verso le 05:20: «riesci a metterne 8?». L'ha detto dopo «6 fette per il browser». Le fette del browser sono diventate 8, e il secondo collaudo usa 8 revisori.
- 13/11 05:31, alla domanda sulla corsa doppia: «Sì, togli quella del ramo». La CI adesso parte solo sulle richieste (`pull_request`) e sulle unioni in main. È scritto in BACHECA-SESSIONI e in DECISIONI.
- 13/11 verso le 06:10: «non hai seguito la regola di aprire una nuova sessione una volta superato il 40% del contesto». Da qui nasce questo passaggio.

### 2. I fatti misurati
**Prima.** La corsa 43359816356 su main durava 7 min 33 s. Le richieste stavano fra 5 min 39 s e 6 min 52 s. Il passo «Test» delle unitarie da solo durava 6 min 06 s. Le prove nel browser duravano 3 min 08 s, dopo 2 minuti di build.

**Cosa c'è nel ramo.** La testa è `da33425`, 7 commit sopra `a19ff89`.
- Le unitarie girano in 6 fette (`vitest --shard`). Indice e totale vengono da `strategy.job-index` e `job-total`.
- Le prove nel browser girano in 8 fette (`playwright --shard`).
- Ogni fetta carica un referto con tre file: fetta.json, universo.json, esito.json.
- `unit-tests-insieme` ed `e2e-senza-chiavi-insieme` lanciano `scripts/ricuci-fette-ci.mjs`. La logica sta in `scripts/ricuci-fette-ci.lib.mjs`. Diventano rossi se una prova manca, è doppia o è rossa.
- La cache di Next è una per tipo di costruzione: lint, browser, axe. Tiene solo webpack, swc, `.tsbuildinfo`, `.rscinfo` e `.previewinfo`. La chiave è v3.
- Chromium sta in cache e si installa mentre gira la build.
- La prova è `tests/unit/le-fette-della-ci-non-perdono-prove.test.ts`, con 34 casi.

**I tempi.** Tutte le corse sono verdi.

| Versione | Cache fredda | Cache calda |
|---|---|---|
| 6+4 fette, corsa del ramo | 4 min 32 s | 3 min 57 s |
| Corse del ramo e della richiesta insieme | 4 min 44 s e 6 min 09 s | — |
| Corsa sola, 6 fette nel browser | — | 4 min 06 s |
| 8 fette, cache per tipo | 3 min 49 s | 3 min 27 s |
| Cache ristretta, senza le due chiavi | 4 min 11 s | 4 min 28 s |
| Con le due chiavi (`da33425`) | corsa 43370022521, in corso alle 05:11 | da rilanciare |

Note sulla tabella:
- Con le due corse insieme, alcuni lavori hanno aspettato in coda fino a 40 secondi.
- Nella corsa da 3 min 27 s, due fette su 8 hanno aspettato 32 secondi. Senza quella coda sarebbe durata circa 2 min 55 s.
- Senza le due chiavi la cache non serviva: il lint ci metteva 137 secondi, le fette del browser fra 107 e 172.

**Le due chiavi.** In locale, una build con la cache ma senza `.rscinfo` e `.previewinfo` compila in 68 secondi. Con le due chiavi compila in 23,6 secondi. La build intera passa da 143 a 97 secondi.

**Il primo collaudo.** Hanno lavorato 4 revisori più i verificatori, 15 agenti in tutto. I difetti confermati, già corretti nel commit `f33acc7`:
- La cache portava anche `fetch-cache`, cioè la home calcolata dal sito acceso. Con quella, una home rotta poteva restare verde.
- Il reporter github-actions di vitest era sparito.
- Il punto d'ingresso dello script, lanciato da un collegamento simbolico, usciva 0 senza controllare niente.
- Mancavano 6 casi di prova.
- Le due corse insieme superavano le 20 macchine dell'account.

Una cosa non è corretta: con la stessa chiave, le 8 fette provano tutte a salvare la cache. Costa pochi secondi, e il commento nel file lo dice.

**Il secondo collaudo.** Lavorano 8 revisori, workflow `wf_e7afddd3-f22`, partito su `f33acc7`. Alle 06:15 è ancora in corso. La sessione vecchia manda l'esito alla nuova con `send_message`.

**Le macchine.** L'account ne ha circa 20 insieme. Una corsa ne usa 19:
- lint 1;
- unitarie 6;
- integrazione 1;
- rls 1;
- smoke 1;
- browser 8;
- axe 1.

Se intanto gira altro, per esempio la CI di ad-mycity, qualche fetta aspetta in coda.

**Dove va il tempo in una fetta del browser.**
- La preparazione dura circa 35 secondi.
- La build dura da 62 a 107 secondi. Cambia con la macchina che capita.
- Il controllo che il server sia pronto dura circa 9 secondi. La home aspetta le chiamate al Supabase finto.
- Le prove durano da 14 a 63 secondi.
- Dopo l'ultima fetta restano circa 15 secondi fissi: la ricucitura e Main.

### 3. Cosa non si tocca, e cosa leggere prima
**Il vincolo sacro.** Nessun controllo si toglie, si salta o si indebolisce. Le prove restano le stesse, e così gli esiti. I timeout non si abbassano alla cieca. Il controllo «Main» tiene il nome che la regola di GitHub pretende.

**Le regole dei lavori.**
- Nei lavori `e2e-senza-chiavi` e `a11y` nessun passo può avere `if:` o leggere segreti. Li sorvegliano `tests/unit/le-prove-nel-browser-non-si-possono-piu-spegnere.test.ts` e `il-cancello-dell-accessibilita-gira-sempre.test.ts`.
- Il riassunto delle prove nel browser resta nel lavoro che lancia Playwright. Dentro ci sono i controlli `hannoGuardato === 0` e quello sulle saltate senza motivo.
- `cancello-main` aspetta tutti i lavori, compresi i due che ricuciono. Lo sorveglia `la-regola-main-aspetta-un-controllo-che-esiste.test.ts`.

**Strade già scartate, col motivo.**
- La modalità `--experimental-build-mode` di Next: il sito costruito potrebbe essere diverso da quello vero.
- `typescript.ignoreBuildErrors` in next.config: toccherebbe un file del prodotto.
- La cache di `node_modules`: si salva a fine lavoro, quindi porterebbe dentro i file scritti durante la corsa. È lo stesso difetto di `fetch-cache`.

**Divieti.** `.claude/settings.json` non si scrive. Le unioni non si fanno da soli: sono di Nicola.

### 4. La prova che dice «fatto»
1. Rilancia la corsa calda su `da33425`, o sulla testa nuova. Misura dal primo lavoro all'ultimo. Deve stare sotto i 3 minuti, senza code. Se resta sopra, la leva più grande rimasta è la build delle 8 fette del browser e di axe: decidi con l'AD prima di toccarla.
2. Integra l'esito del secondo collaudo. Correggi i difetti confermati. Ogni correzione ha la sua prova, che senza la correzione diventa rossa.
3. Fai il guasto finto sulla CI della richiesta. Nel passo «Test» di `unit-tests` metti `--shard="1/$FETTE_TOTALI"` al posto dell'indice vero. Ti aspetti rosso: «ha girato due volte» o «non hanno girato» in `unit-tests-insieme`, oppure la prova dei fili rossa. Main deve essere rosso. Poi togli il guasto e riporta il verde.
4. Da ad-mycity lancia `node cervello/radiografia-in-corsa.mjs --repo ../mycity`. Registra la dimensione `deploy-sre` sui 3 file toccati, con i difetti trovati dai due collaudi.
5. Aggiorna la descrizione della #289, che è ancora quella provvisoria. Mettici i tempi finali, la decisione di Nicola e cosa non è verificato. Lasciala in bozza.
6. Scrivi la riga ESITO con `node cervello/chiusura-loop.mjs registra tech ...`.

### 5. Il tetto di spesa
La sessione vecchia è arrivata a 40,28 $, sopra i 30 $ del primo lavoro. Per il seguito il tetto è **12 $**. Se non bastano, fermati e chiedi all'AD prima di continuare.

### 6. A chi riferire
All'AD, quinta chat `session_015BmpnYWmNDPKAztZMPww6M`, con `send_message`. Il messaggio apre con «Il punto adesso»: ✅ fatto, ⏳ in corso, 👉 tocca a Nicola, 💸 costo. Poi viene «Cosa non ho verificato».

Segui la richiesta con `subscribe_pr_activity` su NicolaeRotaru/mycity#289. La sessione vecchia si è già tolta.
