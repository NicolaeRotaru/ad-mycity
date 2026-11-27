---
data: 2026-11-27 03:15
tipo: promemoria della regia per l'unione dell'onda 1
---

# Le modifiche che la regia applica sull'integrazione

## In parole semplici
Alcuni riparatori hanno dovuto cambiare prove automatiche che usano anche file di altri riparatori. Per regola quelle prove le tocca solo la regia: i riparatori le hanno rimesse com'erano e hanno scritto la modifica nel loro rapporto.
Qui c'è l'elenco, così all'unione non se ne perde nessuna. Per esempio: R02 ha cambiato cosa mostra la chat del catalogo, e una prova comune si aspetta ancora la frase vecchia.

## Cosa cambia per te
Niente: è un promemoria di lavoro della regia.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Che ogni modifica scritta nei rapporti si applichi pulita sull'integrazione: si vede solo all'unione, con `npm run verify`.

## Dettagli tecnici
Dopo l'unione dei rami, prima di `npm run verify`, un commit della regia per riparatore, testo preso dalla nota indicata:
- R02 · nota di R02-001: `tests/unit/la-chat-mostra-la-proposta-che-il-server-applica.test.ts` (riga 131, attesa con «Tag tolti dal prodotto: forno»). Nota di R02-004: `tests/unit/riparazione-r13-avvio-durante-applicazione` (due casi it.each). R02 dice 17 su 17 verdi con le due note applicate.
- R04 · commit 3ac8fd84 le ha riportate alla base; diff nel referto (serve_file_altrui): r07-reso-pane sotto R04-001; r16-foto-sette-tipi e r10-foto-sette-tipi-media sotto R04-002; r02-social-link-incollati sotto R04-010.
- R09 · nota di R09-003: solo il titolo a riga 18 della prova r19 della bozza. R09-006: la correzione d7e3261 NON si applica così (passo indietro in `nellaFila` dentro `after()`): va al giro di correzione.
- R07 · R07-005: `git cherry-pick ddefb86` solo DOPO R02-011 (la prova comune la-porta-del-catalogo usa l'aiutante di R02-011).
- R12 · R12-009: patch intera nella nota (accende il ritiro; 10 prove in 7 file altrui). Da decidere all'unione se entra o va al giro di correzione.
- R11 · R11-001: due prove comuni fissano il difetto (r09-avviso-recensioni, i-nomi-dei-clienti-che-il-negozio-vede). R11 chiede la firma di Nicola: va nella lista per Nicola, non si applica senza.
