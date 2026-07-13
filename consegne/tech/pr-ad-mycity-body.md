## Summary
- Prima di ogni PR: rebase automatico su main, risoluzione conflitti sul file body condiviso, verifica mergeable su GitHub.
- Il file body condiviso non viene più committato sui branch feature (causa conflitti ricorrenti).
- Lezione: l'AD deve sempre controllare conflitti PRIMA di consegnare una PR a Nicola.

## Perché
PR #351 consegnata con conflitto su `pr-ad-mycity-body.md` mentre il fix codice era già su main via #350. Nicola ha dovuto chiedere due volte.

## Come provare
1. Apri un branch feature, modifica solo codice, `node cervello/git-pr.mjs --repo ad-mycity --base main --dry-run` → log rebase
2. Branch già in main → messaggio «già dentro main, chiudi PR»
3. PR #351 su GitHub → deve risultare senza conflitti o chiudibile (branch = main)
