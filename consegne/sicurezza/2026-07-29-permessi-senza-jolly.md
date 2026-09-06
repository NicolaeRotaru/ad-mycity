# 🔐 L'elenco dei programmi che la macchina può lanciare

> ⚙️ **Questo file è GENERATO. Non correggerlo a mano.** Si rifà con
> `node cervello/permessi-elenco.mjs --consegna`, e una prova diventa rossa il giorno che qualcuno
> aggiunge uno script al giro senza rigenerarlo.

## In due righe

Oggi due righe del foglio dei permessi dicono «puoi lanciare qualunque programma finisca in quella
cartella», e quella cartella la scrive la macchina stessa.
Qui sotto c'è l'elenco esplicito che le sostituisce: **111 programmi e 17 script di avvio.**

## In parole semplici

Un permesso è una lista di cose che si possono fare. Queste due righe non lo sono:

    "Bash(node cervello/*.mjs:*)"

L'asterisco vuol dire «qualunque nome». Ce n'è una identica per gli script di avvio. Quindi il permesso non è su un elenco di programmi, è su
*qualunque programma finisca lì dentro* — e lì dentro ci scrive la macchina.

**Per esempio.** I freni veri non stanno nel foglio dei permessi: stanno dentro ai singoli
programmi. Quello che manda un messaggio a un cliente controlla di avere la tua firma. Quello che
spende controlla il tetto. Ma se io posso scrivere un programma nuovo in quella cartella e lanciarlo,
arrivo allo stesso risultato senza passare da nessuno dei due.

Non sto dicendo che sia successo. Sto dicendo che oggi nessuno lo impedirebbe.

## Cosa cambia per te

Nel foglio `.claude/settings.json`, sostituisci la riga `"Bash(node cervello/*.mjs:*)"` con queste
111:

```json
      "Bash(node cervello/adozione-medicine.mjs:*)",
      "Bash(node cervello/agent-registry-check.mjs:*)",
      "Bash(node cervello/allinea-scan-cantiere.mjs:*)",
      "Bash(node cervello/allocazione-check.mjs:*)",
      "Bash(node cervello/apprendimento-guardiano.mjs:*)",
      "Bash(node cervello/auto-fix.mjs:*)",
      "Bash(node cervello/avviso-telegram.mjs:*)",
      "Bash(node cervello/banco-ai.mjs:*)",
      "Bash(node cervello/battito-esterno.mjs:*)",
      "Bash(node cervello/c4-cancelli.mjs:*)",
      "Bash(node cervello/calibrazione.mjs:*)",
      "Bash(node cervello/cancello-lotto.mjs:*)",
      "Bash(node cervello/cantiere-prove.mjs:*)",
      "Bash(node cervello/capacita.mjs:*)",
      "Bash(node cervello/chiusura-loop.mjs:*)",
      "Bash(node cervello/ci-stato.mjs:*)",
      "Bash(node cervello/coerenza-fatti.mjs:*)",
      "Bash(node cervello/coerenza-rischi.mjs:*)",
      "Bash(node cervello/collega-marketplace.mjs:*)",
      "Bash(node cervello/conflitti-memoria.mjs:*)",
      "Bash(node cervello/contesto-lezioni.mjs:*)",
      "Bash(node cervello/correzione-nicola-gate.mjs:*)",
      "Bash(node cervello/costo-ai.mjs:*)",
      "Bash(node cervello/cristallizza-apprendimento.mjs:*)",
      "Bash(node cervello/cronicita-allarmi.mjs:*)",
      "Bash(node cervello/deferral-agenti.mjs:*)",
      "Bash(node cervello/delta-gate.mjs:*)",
      "Bash(node cervello/due-case.mjs:*)",
      "Bash(node cervello/entrate-senza-cancello.mjs:*)",
      "Bash(node cervello/errore-motore.mjs:*)",
      "Bash(node cervello/esegui-azione.mjs:*)",
      "Bash(node cervello/esito-cadenza.mjs:*)",
      "Bash(node cervello/esito-claim.mjs:*)",
      "Bash(node cervello/esperimenti-check.mjs:*)",
      "Bash(node cervello/firma-check.mjs:*)",
      "Bash(node cervello/freno-costi.mjs:*)",
      "Bash(node cervello/freschezza-cadenze.mjs:*)",
      "Bash(node cervello/freschezza-checklist.mjs:*)",
      "Bash(node cervello/freschezza-intelligence.mjs:*)",
      "Bash(node cervello/freschezza-okr.mjs:*)",
      "Bash(node cervello/freschezza-rischi.mjs:*)",
      "Bash(node cervello/freschezza-segnali.mjs:*)",
      "Bash(node cervello/gate-veri.mjs:*)",
      "Bash(node cervello/git-merge.mjs:*)",
      "Bash(node cervello/git-pr.mjs:*)",
      "Bash(node cervello/guardiani-check.mjs:*)",
      "Bash(node cervello/guardiano-capacita.mjs:*)",
      "Bash(node cervello/housekeeping-azioni.mjs:*)",
      "Bash(node cervello/housekeeping-stato.mjs:*)",
      "Bash(node cervello/intelligence-agenda.mjs:*)",
      "Bash(node cervello/keyword-owner-check.mjs:*)",
      "Bash(node cervello/letargo.mjs:*)",
      "Bash(node cervello/lezione-nuova.mjs:*)",
      "Bash(node cervello/macchina-del-tempo.mjs:*)",
      "Bash(node cervello/mappa-macchina.mjs:*)",
      "Bash(node cervello/marketplace.mjs:*)",
      "Bash(node cervello/no-path-cablati-check.mjs:*)",
      "Bash(node cervello/non-vacuita.mjs:*)",
      "Bash(node cervello/north-star-check.mjs:*)",
      "Bash(node cervello/notifica-approvazioni.mjs:*)",
      "Bash(node cervello/onesta-check.mjs:*)",
      "Bash(node cervello/pacchetti-lotto.mjs:*)",
      "Bash(node cervello/pagella-intelligenza.mjs:*)",
      "Bash(node cervello/pausa-check.mjs:*)",
      "Bash(node cervello/percorsi-git.mjs:*)",
      "Bash(node cervello/peso-contesto.mjs:*)",
      "Bash(node cervello/peso-file-cabina.mjs:*)",
      "Bash(node cervello/piani-data.mjs:*)",
      "Bash(node cervello/piani-verita.mjs:*)",
      "Bash(node cervello/porte-check.mjs:*)",
      "Bash(node cervello/pota-apprendimento.mjs:*)",
      "Bash(node cervello/pota-memoria.mjs:*)",
      "Bash(node cervello/prova-trigger.mjs:*)",
      "Bash(node cervello/prove-oneste.mjs:*)",
      "Bash(node cervello/radiografia-in-corsa.mjs:*)",
      "Bash(node cervello/registro-scelte-check.mjs:*)",
      "Bash(node cervello/retry-policy.mjs:*)",
      "Bash(node cervello/riconcilia-perimetro.mjs:*)",
      "Bash(node cervello/rotte-scriventi-check.mjs:*)",
      "Bash(node cervello/salute.mjs:*)",
      "Bash(node cervello/sblocco-capacita.mjs:*)",
      "Bash(node cervello/scadenzario-check.mjs:*)",
      "Bash(node cervello/scan-segreti.mjs:*)",
      "Bash(node cervello/scritture-a-rischio.mjs:*)",
      "Bash(node cervello/senior-sola-lettura.mjs:*)",
      "Bash(node cervello/sensore-cassa.mjs:*)",
      "Bash(node cervello/sensori-spenti-check.mjs:*)",
      "Bash(node cervello/sentinella-budget.mjs:*)",
      "Bash(node cervello/si-capisce.mjs:*)",
      "Bash(node cervello/sincronizza-proposte.mjs:*)",
      "Bash(node cervello/sistema-immunitario.mjs:*)",
      "Bash(node cervello/sonda-volano.mjs:*)",
      "Bash(node cervello/spazza-temporanei.mjs:*)",
      "Bash(node cervello/spazzata-fratelli.mjs:*)",
      "Bash(node cervello/stampo-check.mjs:*)",
      "Bash(node cervello/stash-dimenticate.mjs:*)",
      "Bash(node cervello/supervisione-negozi.mjs:*)",
      "Bash(node cervello/sync-worker-plugins.mjs:*)",
      "Bash(node cervello/tasso-chiusura.mjs:*)",
      "Bash(node cervello/tasso-lezioni.mjs:*)",
      "Bash(node cervello/taste-file.mjs:*)",
      "Bash(node cervello/test-cervello.mjs:*)",
      "Bash(node cervello/test-pannello.mjs:*)",
      "Bash(node cervello/test/battito-esterno.test.mjs:*)",
      "Bash(node cervello/test/lucchetto-per-corsia.test.mjs:*)",
      "Bash(node cervello/test/pw-driver.mjs:*)",
      "Bash(node cervello/uscite-check.mjs:*)",
      "Bash(node cervello/utilizzo-senior.mjs:*)",
      "Bash(node cervello/valida-contratti.mjs:*)",
      "Bash(node cervello/vault-sanita.mjs:*)",
      "Bash(node cervello/verifica-avversariale.mjs:*)",
      "Bash(node cervello/verifica-sensori.mjs:*)",
```

E la riga `"Bash(bash cervello/*.sh:*)"` con queste 17:

```json
      "Bash(bash cervello/giro.sh:*)",
      "Bash(bash cervello/installa-bats.sh:*)",
      "Bash(bash cervello/installa-hooks.sh:*)",
      "Bash(bash cervello/ritmo.sh:*)",
      "Bash(bash cervello/vps/aggiorna-cervello.sh:*)",
      "Bash(bash cervello/vps/collega-claude.sh:*)",
      "Bash(bash cervello/vps/collega-cursor.sh:*)",
      "Bash(bash cervello/vps/diagnostica-completa.sh:*)",
      "Bash(bash cervello/vps/giro-ora.sh:*)",
      "Bash(bash cervello/vps/install-ritmo-timers.sh:*)",
      "Bash(bash cervello/vps/recupera-lavori-orfani.sh:*)",
      "Bash(bash cervello/vps/riconcilia-memoria.sh:*)",
      "Bash(bash cervello/vps/ritmo-ora.sh:*)",
      "Bash(bash cervello/vps/setup.sh:*)",
      "Bash(bash cervello/vps/test-agent.sh:*)",
      "Bash(bash cervello/vps/test-giro-prompt.sh:*)",
      "Bash(bash cervello/vps/watch-main.sh:*)",
```

Poi lancia `node cervello/permessi-check.mjs`: quella segnalazione sparisce.

Da lì in avanti, se serve un programma nuovo il permesso si aggiunge a mano. **Aggiungere una riga
si vede. L'asterisco no.**

## Le altre tre cose, nello stesso foglio

Già che lo apri, ci sono altre tre righe che il guardiano segnala. Con queste si chiude anche
**AR-142**, l'altro bloccante sui permessi: una gesto sola per tutt'e due.

### ① Manca il divieto di spingere sul ramo principale

Nel blocco `"deny"` non c'è nessuna riga che vieti `git push`. La regola di casa dice che da qui si
lavora su un ramo e si apre una richiesta — mai spingere dritto sul ramo principale.

Aggiungi al `"deny"` queste due righe:

```json
      "Bash(git push origin main:*)",
      "Bash(git push --force:*)",
```

Ho scelto il divieto **mirato** e non `git push` intero: la macchina deve poter spingere sul suo
ramo, altrimenti non può più aprirti una richiesta. Vietare tutto avrebbe chiuso anche quella strada.

### ② Uno strumento che scrive, concesso senza chiedere

Nel blocco `"allow"` c'è `mcp__Supabase__execute_sql`. È lo strumento che esegue SQL: **modifica** lo
stato del database, e sta fra quelli concessi senza chiedere.

**Consiglio di toglierlo.** Ho controllato: nessuno script della macchina lo usa. Per leggere ci sono
gli altri strumenti, e la fonte di verità dei numeri è comunque l'altro canale. Un cambio di
struttura del database è 🔴 in ogni caso, quindi passerebbe da te.

### ③ Cinque righe che non fanno niente

Cinque righe usano la forma `Write(...)` su file che vanno protetti. Quella forma il programma non
la applica più: sono le righe che stampano l'avviso a ogni avvio. Riscrivile con `Edit(...)`. La protezione vera è già lì
accanto: queste sono solo il doppione morto.

```
Write(./cervello/vps/.env)        →  Edit(./cervello/vps/.env)
Write(**/.env)                    →  Edit(**/.env)
Write(**/.env.*)                  →  Edit(**/.env.*)
Write(./.claude/settings.json)    →  Edit(./.claude/settings.json)
Write(./.claude/settings.local.json) → Edit(./.claude/settings.local.json)
```

## Cosa devi fare

Aprire quel foglio e incollare. È l'unica cosa che serve, e la può fare solo tu: quel file è negato
in scrittura alla macchina *apposta*, perché non deve poter toccare i propri permessi né per
allargarli né per restringerli.

Quando hai finito, `node cervello/permessi-check.mjs` deve dire zero violazioni.

## Cosa non ho verificato

**Non ho provato ad applicarlo.** Non posso, ed è giusto così. L'elenco l'ho ricavato leggendo chi
lancia davvero, e una prova conferma che copre tutto quello che si lancia oggi. Ma che il giro
continui a girare dopo la sostituzione si vede solo dopo.

**Restano fuori due parti**, per un lotto a sé. La prima è il controllo di provenienza su ogni
script: se il file su disco non corrisponde alla versione pubblicata, non parte. La seconda sono le
chiavi, che vanno tenute fuori dall'ambiente del worker.

**Sul divieto di spinta non ho potuto provare l'effetto.** So che il divieto mirato lascia passare la
spinta sul ramo, perché è una forma diversa. Ma il programma applica quelle righe fuori da qui, e da
una sessione non posso vederlo. Se dopo la modifica non riesco più ad aprirti una richiesta, è quella
riga: toglila e dimmelo.

---

### Dettagli tecnici

**Perché generato.** La versione precedente era curata a mano, ed era già stata ritoccata una volta
il 13/8 per cinque script nati dopo. Misurata il 23/8 era indietro di **51**. Non è manutenzione: il
giorno che la si applica, quei 51 programmi smettono di partire. La cura rompe il giro, e la volta
dopo nessuno la applica più. Un elenco che invecchia in silenzio è peggio di nessun elenco, perché
sembra pronto.

**Come si ricava.** `cervello/permessi-elenco.mjs` cerca la forma dell'ESECUZIONE — `node x.mjs`,
`bash x.sh`, nelle cinque varianti che il repo usa davvero, percorso assoluto del server compreso —
e non il nome nudo: un file citato in una frase è una citazione, non un lancio. Le fonti sono chi
lancia: il giro, il worker, il cancello del lotto, la suite, la CI, i timer del server, le skill,
CLAUDE.md e COMANDI.md.

**Due scelte prudenti.** Uno script nominato ma non presente sul disco resta fuori: un permesso per
un file che non esiste è un permesso che aspetta qualcuno che lo crei, cioè l'asterisco scritto una
riga alla volta. E una fonte illeggibile lascia l'elenco più stretto, mai più largo — un errore di
lettura non deve poter allargare il perimetro.

**Difetto:** AR-206, parte (a). La parte (b) — la regola `no-jolly-su-cartella-scrivibile` in
`permessi-check.mjs` — esiste dal lotto 33 e funziona.

**Prova:** `node --test cervello/test/l-elenco-dei-permessi-che-invecchia.test.mjs` — 11 casi, di cui
uno sul repo vero che diventa rosso quando questa consegna resta indietro.
