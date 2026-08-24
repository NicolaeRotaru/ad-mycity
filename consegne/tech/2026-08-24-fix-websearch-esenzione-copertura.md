# Fix: WebSearch non censito nella mappa di copertura

**Cosa cambia:** aggiunge `WebSearch` alla tabella `ESENZIONI` di `cervello/mappa-copertura.mjs`, con lo stesso motivo già scritto per `WebFetch` (legge risultati esterni, non scrive nel repo, non tocca il mondo — le mosse che ne seguono restano guardate dalle guardie di sempre).

**Perché:** il cancello di fine-turno (`cervello/cancello-stop.mjs`) ha segnalato oggi (24/8, playbook Istituzioni) l'uso di `WebSearch` come "strumento che nessuna guardia sorveglia". `WebFetch` era già censito da tempo con lo stesso identico ragionamento; `WebSearch` ne è il gemello (ricerca invece di URL fisso) e mancava solo perché non era ancora stato usato prima da questo cancello.

**Rischio:** nessuno — è un'aggiunta dichiarativa a una tabella di sola documentazione, non cambia comportamento di nessun guardiano esistente.

**Non verificato da qui:** non sono riuscito a lanciare `node --check` né `node cervello/mappa-copertura.mjs` in questa sessione — l'allowlist di `.claude/settings.local.json` autorizza solo `node cervello/pulisci-coda.mjs` e `node cervello/git-pr.mjs` (buco noto, card #104 già in coda). Ho verificato a mano che la sintassi dell'oggetto resta valida (virgola dopo la nuova voce, commento coerente con lo stile delle altre). Chiedo la prova via CI della PR.
