## Cosa

`sync_vault()` in `cervello/worker.sh`, dopo aver committato la memoria in locale, ora controlla se
l'ultimo commit "Merge pull request" raggiungibile da HEAD è più recente di `VERCEL_DEPLOY_COOLDOWN`
secondi (default 180 = 3 minuti). Se sì, salta il `git push` di questo giro (il commit resta locale,
niente lavoro perso) e riprova al prossimo `sync_vault` — quando il cooldown sarà scaduto.

## Perché

Nicola: "vercel non riesce a fare il deploy delle merge, ho provato il deploy manuale, è partito, poi
è sparito". Causa trovata guardando i timestamp reali dei commit (non un'ipotesi): dopo ogni merge di
una PR, il worker scrive quasi subito un commit di log in memoria e lo pusha su `main` — e quel push
fa ripartire il deploy su Vercel, che quindi **cancella** il build vero (ancora in corso) partito dal
merge:

- PR #520 (schermo/voce): merge 23:48:43 → commit di log 23:48:44 — **1 secondo dopo**.
- PR #518 (fix pausa): merge 22:55:57 → commit di log 22:56:44 — 47 secondi dopo.
- PR #517 (chat doppia): merge ~20:47 → commit di log 20:52:10.

In tutti i casi il push del worker arriva mentre Vercel sta ancora costruendo dal merge, e lo
interrompe. Non è statistica: è un riflesso automatico del flusso (mergi → il worker registra subito
in memoria e pusha) che oggi succede quasi sempre a poca distanza da ogni merge.

## Come provare

1. `bash -n cervello/worker.sh` (verifica sintassi — **non eseguito in questa sessione**: il comando
   `bash -n` è risultato bloccato dai permessi headless del VPS, stesso tipo di blocco già visto su
   altri comandi in questa chat. Ho riletto a mano il diff — if/fi ed apici sono bilanciati e lo stile
   ricalca il resto della funzione — ma va confermato con un vero `bash -n` prima o dopo il merge.
2. Simulare: fare un merge di prova (o guardare i log del prossimo merge reale) e controllare nei log
   del worker la riga `sync_vault: merge recente (...) — push rimandato...` nei minuti subito dopo.
3. Su Vercel, verificare che dopo il prossimo merge il deploy arrivi in fondo senza essere cancellato
   da un push di memoria nei primi 3 minuti.

## Rischio

Basso: se `git log --grep` non trova nessun "Merge pull request" (repo senza merge recenti), il
comportamento resta identico a oggi (push immediato). Il ritardo massimo introdotto è il valore del
cooldown (180s di default), e solo per il PUSH — il commit locale è comunque immediato, nessuna
scrittura viene persa.
