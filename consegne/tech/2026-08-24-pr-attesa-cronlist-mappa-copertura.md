# fix: dichiara Agent/TaskCreate/TaskUpdate/CronList in attesa di aggancio

## Cosa cambia
`cervello/mappa-copertura.mjs` (`IN_ATTESA`) era rimasto vuoto: una scrittura di stamattina
(10:40, card #158) doveva dichiarare `Agent`/`TaskCreate`/`TaskUpdate` come strumenti in attesa
di un freno in `.claude/settings.json`, ma quella sessione si è interrotta prima di salvare su
disco. Questa PR rifà quella scrittura e aggiunge un quarto strumento, `CronList`, usato oggi
per cercare la fonte del compito ricorrente "PLAYBOOK Anti-churn negozi" (card #160 in
AZIONI-IN-ATTESA).

Ogni voce ha un motivo scritto per esteso e una scadenza (2026-09-07): passata quella data, se
nessuno ha agganciato il freno vero in `.claude/settings.json`, torna a essere un buco scoperto
(vedi il commento sopra `IN_ATTESA` nel file, regola già in vigore da metà agosto).

## Perché
`node cervello/cancello-stop.mjs --hook` segnala ogni turno gli strumenti usati che nessuna
guardia sorveglia. Senza questa dichiarazione, il cancello continua a bloccare il turno per
strumenti che sono già noti e in attesa di un intervento di Nicola (incollare la riga in
`.claude/settings.json`), non per un buco nuovo.

## Prova
`node --test cervello/test/mappa-copertura.test.mjs` → 24/24 verdi (nessuna modifica alla
logica, solo ai dati dichiarati in `IN_ATTESA`).

## Cosa serve da Nicola
Nessuna azione di codice: quando hai un minuto, aggiungi `Agent`, `TaskCreate`, `TaskUpdate` e
`CronList` alla riga già esistente in `.claude/settings.json` dove stanno Bash e gli altri
strumenti sorvegliati (stesso punto sistemato per `Monitor` il 21/8) — via una futura PR, io non
posso scrivere quel file. Fino ad allora restano "in attesa", non "buco silenzioso".
