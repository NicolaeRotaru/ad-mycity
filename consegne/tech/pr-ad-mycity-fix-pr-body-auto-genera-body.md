## Cosa cambia
- `git-pr.mjs` non cerca più `pr-ad-mycity-body.md` come candidato automatico
- Se nessun body è fornito esplicitamente, lo genera dai commit del branch (formato standard `## Cosa cambia / ## Come provare`)
- `requireBody` ora restituisce il body invece di bloccare con process.exit

## Perché
Il file condiviso andava in conflitto durante il rebase e veniva risolto con `--theirs` (versione main = descrizione della PR precedente). Ogni nuova PR prendeva la descrizione sbagliata — il bug segnalato da Nicola il 18/7.

## Come provare
1. Apri una nuova PR senza passare `--body`: la descrizione su GitHub deve mostrare i commit del branch, non la PR precedente
2. Apri una PR con `--body "..."`: deve usare quello
3. Con `--body-file`: deve leggere quel file (funziona già, invariato)
