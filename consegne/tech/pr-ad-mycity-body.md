## Cosa cambia
Dopo che mergi una PR, la card «Merge PR #…» sparisce da sola da **Da approvare** (e da **In coda**): il Pannello controlla GitHub e chiude automaticamente le azioni merge già completate.

## Perché
Nicola segnalava che le caselle merge restavano in coda anche dopo il merge — confusione e rischio di ri-approvare.

## Come funziona
- A ogni caricamento della coda, se la PR risulta **mergiata o chiusa** su GitHub → stato `fatta` e card nascosta.
- Se c’è ancora un merge in attesa, refresh ogni **15 secondi** invece di 60.
- Se approvi un’azione la cui PR è già mergiata, si chiude subito senza passare dal worker.

## Come provare
1. Apri **Azioni → Da approvare** con una card «Merge PR #N» (o mergia una PR già in coda).
2. Mergia la PR dal Pannello (Approva e mergia) o da GitHub.
3. Entro ~15 secondi la card deve sparire da Da approvare / In coda.
4. Opzionale: `cd pannello && node --test src/lib/github-pr-merge.test.mts` → 4 test verdi.
