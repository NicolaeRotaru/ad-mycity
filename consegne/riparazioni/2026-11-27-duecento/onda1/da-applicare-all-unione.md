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
- R02 · nota di R02-012 (giro della regia terza, commit 22467a30): `tests/unit/minori-s05-reclami-pagina.test.tsx`, una riga («1823»). Nota di R02-001: `tests/unit/la-chat-mostra-la-proposta-che-il-server-applica.test.ts` (riga 131, attesa con «Tag tolti dal prodotto: forno»). Nota di R02-004: `tests/unit/riparazione-r13-avvio-durante-applicazione` (due casi it.each). R02 dice 17 su 17 verdi con le due note applicate.
- R04 · commit 3ac8fd84 le ha riportate alla base; diff nel referto (serve_file_altrui): r07-reso-pane sotto R04-001; r16-foto-sette-tipi e r10-foto-sette-tipi-media sotto R04-002; r02-social-link-incollati sotto R04-010.
- R09 · nota di R09-003: solo il titolo a riga 18 della prova r19 della bozza. R09-006: la correzione d7e3261 NON si applica così (passo indietro in `nellaFila` dentro `after()`): va al giro di correzione.
- R07 · R07-005: `git cherry-pick ddefb86` solo DOPO R02-011 (la prova comune la-porta-del-catalogo usa l'aiutante di R02-011).
- R12 · R12-009: patch intera nella nota (accende il ritiro; 10 prove in 7 file altrui). Da decidere all'unione se entra o va al giro di correzione.
- R11 · R11-001: due prove comuni fissano il difetto (r09-avviso-recensioni, i-nomi-dei-clienti-che-il-negozio-vede). R11 chiede la firma di Nicola: va nella lista per Nicola, non si applica senza.
- R01 · commit 7877cd55 le ha riportate alla base, diff nelle note: R01-004 → `tests/unit/la-foto-rifiutata-lo-dice-in-italiano.test.ts` (riga 100); R01-005 → `tests/unit/riparazione-r02-pagine-testo-grande.test.tsx` (riga 78); R01-007 → `tests/unit/riparazione-r02-segnalazione-esito-solo-se-tolto.test.ts` (riga 77). Restano due cose per l'unione: la deroga di Nicola su 7877cd5594001b75529d1f848d5856932b03969f («id_nel_commit», errore della regia terza nell'istruzione); e le 4 etichette «leggera» (R01-016, 011, 005, 003) più la verifica «rossa solo nelle prove comuni», da decidere dopo il collaudo.
- R06 · nota di R06-007: `tests/unit/riparazione-r13-indirizzi-servizio-giu-rotta.test.ts` (in arrivo). R06-011: toppa su `lib/ordini/annulla.ts` più due prove altrui, arrivata in chat: va al giro di correzione (la V6 cambia le cifre attese, da far guardare a chi decide).
