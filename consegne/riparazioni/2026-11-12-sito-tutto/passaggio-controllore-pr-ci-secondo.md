---
tipo: passaggio
data: 2026-11-14 09:22
da: PR e CI secondo (session_015BmpnVy26PKmTJ66EZtQG6)
a: PR e CI terzo
---

# Il passaggio del controllore PR e CI, dal secondo al terzo

Questo foglio serve alla sessione che prende il posto del controllore PR e CI. Il controllore segue le richieste di
unione della campagna del sito e ripara la CI rossa e i conflitti.

## In parole semplici
Il controllore segue la richiesta di unione del sito per l'onda 2, la mycity#290. La richiesta è in bozza.
La CI è rossa su una prova sola, quella della voce R15-005. Due scelte aspettano Nicola. La prima è se correggere
R15-005 o toglierla. La seconda è se togliere R18-019. Su ad-mycity non c'è nessuna richiesta aperta.

## Cosa cambia per te
Un esempio vero: alle 09:12 del 14/11 Nicola ha collegato il repository del sito alla chat del secondo. Da quel momento la
#290 è passata dalla regista al controllore. La sessione nuova non eredita quell'accesso, e deve chiederlo di nuovo.

## Cosa devi fare
- **Collega il sito.** Chiama `add_repo` per NicolaeRotaru/mycity con accesso push: Nicola approva il permesso. Poi
  clona e prendi il ramo della richiesta (i comandi sono nei dettagli).
- **Ascolta la richiesta.** `subscribe_pr_activity` su NicolaeRotaru/mycity#290. Prima il secondo si toglie
  dall'ascolto e cancella il suo ricontrollo automatico: così gli avvisi arrivano a una sessione sola.
- **Al sì di Nicola, una spinta per correzione.**
  - R18-019 si toglie con il suo revert, cioè un commit che annulla esattamente il suo. Nessun commit dopo tocca i suoi 4 file, e la regista l'ha provato in locale.
  - R15-005, se Nicola la toglie, va via con il revert dei suoi due commit. Se la corregge, il commit lo manda la regista.
  - Prima di spingere fai girare le prove veloci sui file toccati e guarda il risultato.
- **Dopo la spinta.** Se la CI è rossa per una voce sola, scrivi il nome della voce alla regista.
- **Mai.** Niente unione e niente uscita dalla bozza. Niente rebase né force-push sul ramo condiviso: riscrivere la storia del ramo cancellerebbe il lavoro della regista. Niente
  strumenti del database vero, di Vercel o di Stripe. Una prova non si spegne per avere verde.
- **Lo storico del sorvegliante.** Si salva da solo, in un commit «Lo storico del sorvegliante col suo ultimo scatto».
  In un conflitto tieni le voci dei due lati, in ordine di `quando`, poi le ultime 200.

## Cosa non ho verificato
- Il codice di R15-005: la causa del rosso la so dal registro della CI e dal commento della regista sulla richiesta.
- Se l'AD ha già aperto la regista ottava.

---

## Dettagli tecnici
- **#290:** testa `4a3d9b8a`, base `a19ff892` (main, verde con la stessa CI). Lavoro rosso `e2e-senza-chiavi`, prova
  «404 page is custom» in `tests/e2e/03-cart-and-search.spec.ts:60`: `getByText('Pagina non trovata')` trova l'`<h1>` e
  il `<title>` che R15-005 aggiunge in `app/not-found.tsx`. «Main» è il controllo che riassume gli altri.
- **Clone:** `git clone --depth 1 https://github.com/NicolaeRotaru/mycity /home/user/mycity`, poi
  `git -C /home/user/mycity fetch --depth=50 origin claude/magical-hamilton-xouwr8`. Spinta:
  `git -C /home/user/mycity -c push.negotiate=true push origin HEAD:claude/magical-hamilton-xouwr8`.
- **Revert:** R18-019 `git revert --no-commit 6eefff31`, commit «Tolgo la voce R18-019: rossa al controllo
  dell'onda 2». R15-005 `git revert --no-commit b66f29dd f880877f`, commit «Tolgo la voce R15-005: rossa nella CI
  dopo l'unione».
- **Ricontrollo automatico del secondo:** `trig_019GefgqAx5Z2pJVLZesgKZR`, alle 10:07 del 14/11.
- **Sessioni:** regista settima `session_015BmpnVKqiFCVbsAjWm364m`, a 483 mila token: ha chiesto all'AD l'ottava.
  AD `session_015BmpnYWmNDPKAztZMPww6M`.
- **Regole nuove del 14/11:** la 10 dice che il primo messaggio di una sessione nuova è solo `/effort ultracode`. La
  12 dice che il ruolo sta in testa al titolo e l'onda nell'etichetta `onda-2-controllori`. Dice anche che chi apre
  una sessione la archivia quando ha passato il lavoro.
- **Conto del secondo:** 11,07 $ sul tetto di 12 $, alzato dall'AD alle 09:03. Storia: 350 mila token.
