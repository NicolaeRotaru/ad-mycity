## In parole semplici
Il worker è il programma che gira giorno e notte sul computer di MyCity ed esegue i lavori
in coda. Ogni tanto scrive su `main` un commit con scritto sopra "Sentinella macchina —
SENSORI FERMI". Ma dentro quel commit non c'è nessun allarme vero. Tocca solo file di sincronizzazione di
routine. È un'etichetta sbagliata, non un allarme che si ripete ogni minuto. Il vero allarme
è successo solo 2 volte in 7 minuti, come doveva.

## Cosa cambia per te
Da oggi cambia un'etichetta nei commit del worker su `main`. Ogni 60 secondi, se non è
arrivato nessun lavoro nuovo, il worker fa comunque un controllo di routine. Prima quel
controllo riciclava il titolo dell'ultimo lavoro vero già chiuso. Sembrava quindi un allarme
ripetuto. Ora quel commit si chiama semplicemente "worker: lavoro ?". Nella cronologia
troverai meno falsi allarmi da controllare.

## Cosa devi fare
Niente subito: è un fix di etichetta nel codice del worker, non tocca la logica di
pubblicazione/push. Da rivedere quando fai il merge di questa PR (`ops/worker-titolo-fantasma`
→ `main`): il vero comportamento a runtime si vedrà solo quando il worker aggiornato girerà
di nuovo sul VPS.

## Cosa non ho verificato
Non ho potuto far girare il worker vero end-to-end (claim di un lavoro reale + ripescaggio
successivo) da questa sessione: ho verificato con `bash -n` (via il test bats dedicato) che
la sintassi resta valida, e ho confermato che il blocco toccato non cambia il comportamento
sul lavoro appena eseguito. Il comportamento del ripescaggio si vede solo a runtime sul VPS
dopo il deploy — serve un controllo umano lì: guarda i prossimi commit "worker: ..." su
`main` nell'arco di ~10-15 minuti senza lavori nuovi in coda e verifica che dicano
"worker: lavoro ? (…)" e non più il titolo di un lavoro precedente.

---

## Dettagli tecnici

### Il bug (con le prove)
Sei commit reali del 2026-08-14 tra le 18:30 e le 18:36 hanno tutti il messaggio
`worker: Sentinella macchina 🧠 — SENSORI FERMI: il registro dei ... (? · HH:MM:SS)`:

```
78ae972de, d7f2df493, 15a9fb9e3, 708abe8a4, 49ece40d4, 1f6d8a17f
```

Verificato con `git show --stat` su ciascuno: il diff reale tocca
`MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-fatti.json` e `stampo-check.json` —
file scollegati dal lavoro "SENSORI FERMI". Il vero lavoro di quel nome è stato eseguito
solo 2 volte, a distanza di ~7 minuti (commit `fc07f3280` alle 18:29:41 e `da7ea26dd` alle
18:36:45, entrambi toccano `MyCity-Vault/90-Memoria-AI/auto-coscienza/sentinella-dati.json`),
coerente col cooldown della sentinella (`dedupPersistente:true` in
`cervello/sentinella-dati.mjs`, che funziona correttamente). I 6 commit di mezzo sono
etichette false, non allarmi veri.

### Causa radice
In `cervello/worker.sh`:
- riga 1240: `richiesta="$(... jq -r '.[0].richiesta // ""')"` — variabile GLOBALE, impostata
  solo quando il worker preleva un lavoro NUOVO dalla coda.
- righe 1201-1209: il blocco di ripescaggio periodico (`WORKER_RICOVERO_SEC`, default 60s —
  combacia con la cadenza dei commit-fantasma osservati) chiama `sync_vault` (riga 1206)
  SENZA che `richiesta`/`id` siano stati appena impostati per un lavoro nuovo: eredita quindi
  il valore lasciato dall'ULTIMO lavoro vero elaborato in un ciclo precedente.
- righe 259-274 (dentro `sync_vault`): `titolo_breve` si costruisce da `${richiesta:-}`
  (riga 265); il fallback corretto `"lavoro ${id:-?}"` (riga 274) scatta solo quando
  `titolo_breve` è vuoto — ma non lo era, perché portava ancora il testo del lavoro precedente.
  Riga 284: `git commit -q -m "worker: ${titolo_breve} (${id:-?} · $(ts))"`.

In sintesi: `richiesta` e `id` non venivano mai svuotate dopo la chiusura di un lavoro, quindi
ogni ripescaggio successivo — finché non arrivava un lavoro NUOVO vero — riciclava il titolo
del lavoro già concluso.

### Il fix
Una riga (più commento), alla fine del ciclo principale, subito prima di `done` (dopo che
l'esito del lavoro è già stato scritto sul database con `scrivi_esito_lavoro`, righe
1670-1679, e dopo `stamp_worker_info`):

```bash
richiesta=""; id=""
```

Posizione scelta con attenzione: NON subito dopo la `sync_vault` di riga 1594, perché il
blocco di metabolizzazione (righe 1610-1628, sezione "3c") usa ancora `$richiesta` più avanti
nello stesso ciclo (per accodare il lavoro di metabolizzazione con `--arg richiesta
"$richiesta"`). Svuotarla lì avrebbe rotto quella funzione. Il posto sicuro è a fine ciclo,
dopo che tutti gli usi di `$richiesta`/`$id` in questo giro sono conclusi — così il prossimo
ripescaggio (che gira all'inizio del giro successivo, righe 1201-1209) trova le variabili
vuote e produce `"worker: lavoro ?"` invece di riciclare.

Nessun'altra riga toccata: niente cambia nella logica di sync/push/commit, nella guardia di
ramo, nel gate-pubblicazione o nella pausa post-merge.

### Prova
`bash -n cervello/worker.sh` — sintassi pulita. Non eseguibile direttamente da questa sessione
(permesso Bash negato sul comando esatto), verificato invece tramite il test bats esistente
dedicato a questo blocco: `cervello/test/worker-titolo-commit.bats`, test 8
("worker.sh ha sintassi valida (bash -n)") → **passa**, sia prima che dopo il fix.

Ho anche fatto girare l'intera suite `worker-titolo-commit.bats` +
`worker-doppio-invio.bats` + `worker-orfani.bats` + `due-worker.bats` +
`worker-claim-pausa.bats` (46 test totali) **prima e dopo** il fix (con `git stash`/`git stash
pop` per confrontare): stesso numero di successi e stesso numero di fallimenti in entrambi i
casi. I fallimenti pre-esistenti (test 1-6 di `worker-titolo-commit.bats`: harness di test che
non imposta `SCRIPT_DIR` prima di sourcing `gate-pubblicazione.sh`; test 2/4 di
`worker-doppio-invio.bats` e test 38 di `worker-claim-pausa.bats`: guardie anti-drift già
disallineate dal codice attuale) esistono identici sul commit base `54f2fb4af`, quindi non
sono stati introdotti da questo fix. `verifica:{tipo:"umano"}` dichiarata per il comportamento
runtime del ripescaggio (si vede solo quando il worker gira di nuovo sul VPS dopo il deploy).
