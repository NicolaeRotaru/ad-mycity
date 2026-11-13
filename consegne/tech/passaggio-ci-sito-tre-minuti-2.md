---
tipo: passaggio
data: 2026-11-13 13:50
da: session_015BmpnUqVt6v4HuqvPF3X7B («CI del sito in 3 minuti · seguito», a circa 360 mila token, regola 7)
richiesta: NicolaeRotaru/mycity#289 (bozza), ramo claude/ci-tre-minuti, testa 52c9ba6
precedente: consegne/tech/passaggio-ci-sito-tre-minuti.md (vale ancora per tutto quello che qui non cambia)
---

# Passaggio 2: la CI delle richieste del sito sotto i 3 minuti

## 1. La richiesta, con le parole di Nicola
- 13/11 04:27: «riesci a portare anche le pr di mycity sotto i 3 minuti?».
- 13/11 05:31: «Sì, togli quella del ramo»: la CI parte solo su `pull_request` e su `push` a main.
- 13/11 06:47: «ok 1 e 2». Nelle 9 costruzioni del sito per le prove (8 fette del browser e axe) Next non ricontrolla più stile e tipi. Il controllo resta una volta nel lavoro «Lint + Typecheck + Build», che Main aspetta. È scritta in BACHECA-SESSIONI e in DECISIONI.
- 13/11 ~06:40: Nicola ha fermato la sessione vecchia, e il suo collaudo con 8 revisori (`wf_e7afddd3-f22`) non è mai finito.

## 2. I fatti misurati
- **Corsa 43370022521 su `da33425`, prima dei miei commit:**
  - cache fredda: 5 min 14 s, di cui fino a 78 s di coda;
  - cache calda: 4 min 09 s, di cui fino a 108 s di coda. Senza coda circa 3 min 35 s.
- **Dove andava il tempo** (fetta 2 del browser, cache calda). Costruzione 95 s:
  - compilazione 26 s;
  - «Linting and checking validity of types» 46-49 s;
  - raccolta delle pagine 11 s;
  - pagine statiche 8 s.
  
  In locale, a freddo: tsc 65 s, lint 14 s.
- **I miei tre commit su mycity:**
  - `25803fa`: `next.config.js` spegne eslint e typescript in costruzione. Il lavoro imposta `MYCITY_COSTRUZIONE_PER_LE_PROVE: "1"` (ci.yml, nei passi di costruzione di `e2e-senza-chiavi` e `a11y`).
  - `20bca73`: correzione dal collaudo. La condizione vale solo con `GITHUB_ACTIONS=true`, `GITHUB_JOB` uguale a `e2e-senza-chiavi` o `a11y`, `VERCEL` non impostata, e la variabile a `"1"`. Il rilascio (`deploy-dopo-ci.yml`) costruisce dentro GitHub Actions con `vercel build`, che imposta VERCEL=1. La prova `tests/unit/stile-e-tipi-si-controllano-una-volta-nella-ci.test.ts` ha 15 casi, provati rossi con ciascuna condizione tolta.
  - `52c9ba6`: la chiave della cache di Next porta il commit anche sulle richieste. Prima era una per ramo e non si rinnovava mai: dopo il cambio di next.config.js ogni corsa ricompilava da zero (fetta 7 della corsa 43375560588, tentativo 2: costruzione 102 s). Prova: `tests/unit/la-cache-di-next-si-rinnova-a-ogni-commit.test.ts`.
- **In locale** la costruzione con la variabile scrive «Skipping validation of types» e «Skipping linting», e il sito si costruisce per intero (97 pagine).
- **Corsa 43375560588 su `20bca73`:** verde. Code pesanti: l'account aveva altro lavoro, e giravano 4-5 lavori alla volta. Non è una misura valida.
- **Collaudo** (1 revisore indipendente, sonnet):
  - 1 difetto confermato, il rilascio Vercel dentro Actions: corretto in `20bca73`;
  - 2 buchi nella prova (`npm run build || true` ed `echo "run: npm run lint"` passavano): corretti in `20bca73`.
  - Non confermato: che il controllo dei tipi di `next build` copra gli stessi file di `tsc`. La configurazione è la stessa.
- **Un rosso non mio:** nella corsa annullata 43375207241, axe è fallito per un errore di `next/font` mentre scaricava i caratteri da Google (`Cannot read properties of null (reading '1')`). È successo prima della parte che ho toccato, e non si è ripetuto nella corsa dopo. Se torna, va indagato: con le corse più veloci ci sono più scaricamenti da Google insieme.

## 3. Cosa non si tocca
Vale tutta la parte 3 del passaggio precedente:
- nessun controllo tolto, saltato o indebolito;
- niente `if:` né segreti in `e2e-senza-chiavi` e `a11y`;
- il riassunto per fetta resta;
- Main aspetta tutti i lavori;
- `.claude/settings.json` non si scrive;
- non si fa merge.

In più: non allargare la condizione in `next.config.js`, e non mettere la variabile in altri lavori o file. La prova lo blocca, ma il motivo è la produzione.

## 4. La prova che dice «fatto» (cosa resta)
1. La corsa su `52c9ba6` parte da sola col push. È la prima con la chiave nuova: ricompila e salva. Quando è verde, rilanciala una volta (`rerun_workflow_run`) e misura dal primo lavoro all'ultimo. Atteso: costruzione nelle fette circa 45-60 s, corsa senza coda sotto i 3 minuti. Se l'account ha altro lavoro e ci sono code, conta la corsa al netto delle code e dillo. Oppure rilancia quando l'account è libero.
2. **Guasto finto** sulla CI della richiesta. Nel passo «Test» di `unit-tests` sostituisci `--shard="$((FETTA_INDICE + 1))/$FETTE_TOTALI"` con `--shard="1/$FETTE_TOTALI"`. Atteso: rosso in `unit-tests-insieme` («ha girato due volte» / «non hanno girato») e Main rosso. Poi togli il guasto (revert) e riottieni il verde.
3. Da ad-mycity: `node cervello/radiografia-in-corsa.mjs --repo ../mycity`. Registra la dimensione `deploy-sre` sui file toccati: `.github/workflows/ci.yml`, `next.config.js`, le due prove nuove, e `scripts/ricuci-fette-ci*.mjs` della sessione vecchia. Mettici i difetti dei collaudi.
4. Aggiorna la descrizione della #289, che è ancora quella provvisoria: tempi finali, le due decisioni di Nicola (05:31 e 06:47), cosa non è verificato. Lasciala in bozza.
5. Riga ESITO: `node cervello/chiusura-loop.mjs registra tech "CI sito sotto 3 minuti" ...`.
6. Resoconto all'AD, poi chiudi.

## 5. Il tetto di spesa
Il tetto del seguito era 12 $. Questa sessione è arrivata a circa 7,5 $. **Per la 2.0 restano circa 4,5 $.** Se non bastano, fermati e chiedi all'AD.

## 6. A chi riferire
All'AD, quinta chat `session_015BmpnYWmNDPKAztZMPww6M` («AD — continua dal 13/11 (quinta chat)»), con `send_message`. Il messaggio apre con «Il punto adesso» (✅ fatto · ⏳ in corso · 👉 tocca a Nicola · 💸 costo), poi «Cosa non ho verificato».
- Iscriviti alla #289 con `subscribe_pr_activity`. Questa sessione si toglie.
- Da dire all'AD, in sospeso: lo strumento Agent non è sorvegliato da nessuna guardia. Lo segnala il cancello di fine turno: serve un freno in `.claude/settings.json` o un'esenzione, e lo decide Nicola.
- La quota settimanale è in avviso (`allowed_warning`), e si rinnova il 19/11.
