## Cosa cambia
- `pannello/vercel.json`: `deploymentEnabled.main` da `false` a `true` — ogni push su `main` ora tenta un deploy.
- `ignoreCommand`: il filtro passa da `-- .` (qualsiasi file) a `-- pannello/` — la build parte SOLO se il commit tocca la cartella `pannello/`. I commit di sola memoria (decine al giorno) continuano a essere ignorati, zero build sprecate.

## Perché
Oggi il Pannello online si aggiorna SOLO con un Redeploy manuale su Vercel — ed è facile cliccare per sbaglio un deployment vecchio dalla lista, facendo "tornare indietro" il sito (successo il 23/7: un redeploy manuale ha rimesso online una build di giorni prima, con diverse funzioni sparite). Con l'auto-deploy filtrato, chi mergia una PR di codice non deve più ricordarsi di premere nulla su Vercel: la build parte da sola, sempre sull'ultimo commit reale.

## Come provare
1. Merge di questa PR → controlla su Vercel che parta un deployment "Production" per questo commit.
2. Verifica in `pannello/src/app/api/diagnosi` che il Pannello sia raggiungibile e mostri i dati aggiornati.
3. Nei giorni successivi: i commit di sola memoria (`MyCity-Vault/`, `cervello/*.json`) NON devono generare un nuovo deployment Vercel — solo i commit che toccano `pannello/` lo fanno.
