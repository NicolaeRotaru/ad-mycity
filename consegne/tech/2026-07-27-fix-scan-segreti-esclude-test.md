---
data: 2026-07-27 14:45
autore: tech (AD)
---

# Fix: scan-segreti.mjs esclude cervello/test/ dalla scansione segreti

## Il problema (in parole semplici)
Dal 25/7 alle 20:15 il giro automatico **non riesce più a pubblicare la memoria** con un commit
normale. Lo scanner che protegge la repo da segreti reali (`cervello/scan-segreti.mjs`) trova ogni
volta "un segreto" e blocca il commit — ma non è un segreto vero: è una chiave GitHub **finta**,
scritta apposta in `cervello/test/segreti-pattern.test.mjs` per testare che lo scanner stesso
funzioni (`const fakePat = \`github_pat_11${"X".repeat(25)}\`;`). Un'altra fixture simile — un valore Resend finto della stessa forma, in
`cervello/test/autopilot-colore.test.mjs` — avrebbe fatto scattare anche la regola "Resend API key".

Da allora ogni giro lavora ma **non pubblica in modo pulito**: la traccia sono i commit ripetuti
"recupero: scritture pendenti da un giro interrotto" ogni ~2 ore (bypass, non fix). Card già in
coda da stamattina: `#radiografia-sblocca-pubblicazione` (accodata 2026-07-27 09:40).

## Causa radice
`scan-segreti.mjs` scansiona **tutti** i file versionabili della repo (tracciati + non-ignorati),
inclusa `cervello/test/`, che per design contiene fixture sintetiche a forma di segreto per testare
lo scanner e il redattore. Nessuna esclusione della cartella test esisteva.

## Fix
Una riga di filtro (`ESCLUSI = /^cervello\/test\//`) applicata alla lista file sia in modalità
`--staged` sia in modalità completa (quella che usa `giro.sh`). `cervello/test/` è una cartella
dedicata solo a test/fixture (non contiene mai segreti reali per convenzione già in uso — vedi
anche il valore Resend finto in `autopilot-colore.test.mjs` citato sopra), quindi l'esclusione a livello di
cartella è sicura e non riduce la protezione sul resto della repo.

## Cosa cambia per Nicola
Il giro torna a pubblicare la memoria con un commit normale invece che con lo scorciatoia
"recupero: scritture pendenti" ogni 2 ore. Nessun impatto sul resto della sicurezza: tutti gli altri
file (incluso il codice reale, `.env`, i consegne/audit) restano scansionati come prima.

## Verifica
⚠️ **Non verificato dal vivo in questa sessione**: `node cervello/scan-segreti.mjs` non è
nell'allowlist Bash di questa chat (`.claude/settings.local.json`) e ogni tentativo di eseguirlo è
stato bloccato senza che comparisse un box di approvazione (stessa causa nota di
[[chat-pannello-non-mostra-box-permessi]]). Comando da far girare per confermare (Nicola o il
prossimo `giro.sh` sul VPS, ambiente con permessi pieni):
```
node cervello/scan-segreti.mjs
```
Atteso: `exit 0`, "nessun segreto in N file versionabili" (prima: exit 1, 1 segreto in
`cervello/test/segreti-pattern.test.mjs`).

Ho controllato a mano (grep) che nessun altro file fuori da `cervello/test/` contiene pattern che
combaciano con le regole dello scanner (Stripe, AWS, PEM, GitHub PAT) — quindi l'esclusione non
nasconde un segreto vero altrove.

## Nota a margine (secondo difetto, non toccato qui)
Il fatto che `node cervello/scan-segreti.mjs` — che è dichiarato 🟢 "sola lettura" nel suo stesso
commento — non sia nell'allowlist Bash di questa sessione è un secondo attrito minore: mi ha
impedito di verificare dal vivo un fix altrimenti pronto in 2 minuti. Vale la pena aggiungerlo
all'allowlist accanto a `pulisci-coda.mjs`/`git-pr.mjs` in un prossimo giro (impatto: verifica
diretta possibile invece di fix "a occhio" + attesa review).
