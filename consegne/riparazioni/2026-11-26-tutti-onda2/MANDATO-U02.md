## In parole semplici
Questo file è il mandato che la regia ha dato alla sessione U02 il 26/11/2026.
U02 doveva unire in un ramo solo i lavori dell'onda 2 della riparazione del sito.
Per esempio: ha unito i 5 rami dei riparatori, dal m12 al m16, uno alla volta.
Poi il mandato le chiedeva di togliere 3 riparazioni, perché il collaudo le aveva trovate dannose per altre parti del sito.
Una delle tre portava la migrazione 930, che avrebbe cancellato la correzione di un'altra sessione.
Si tolgono con un revert di git: un commit nuovo che annulla quello vecchio, senza cancellare la storia.

## Cosa cambia per te
Niente: è la traccia di come è stata fatta l'unione dell'onda 2.
Le 31 voci dell'onda 2 si chiudono solo quando unisci la richiesta del sito.

## Cosa devi fare
Niente su questo file.

## Cosa non ho verificato
Il testo sotto la riga dei dettagli è quello dato alla sessione, parola per parola.
Non l'ho riscritto, perché è la storia di cosa le è stato chiesto.

## Dettagli tecnici

Sei U02, la sessione che unisce l'onda 2 della riparazione del 26/11 del sito MyCity. Rispondi solo alla regia: session_015BmpnWEupSMLP5h9NSaDAv (send_message). Nicola non vuole richieste di approvazione: niente domande a lui.

Cosa fai (deposito NicolaeRotaru/mycity, sei partita dall'integrazione dell'onda 1, a60799bdcd19e5fe35358b7f494fa5a2c09ab211; il tuo ramo è ccr-a672a2b3-92w5w1):
1. `git checkout -B ccr-a672a2b3-92w5w1 a60799bdcd19e5fe35358b7f494fa5a2c09ab211`, poi `git fetch origin` dei rami ccr-a672a2b3-92w5w1-m12 … -m16.
2. Unisci in ordine, uno alla volta, queste punte esatte (non la punta del ramo, se nel frattempo è cambiata):
   - m12 @ d29a7978a65735a070251cef5f75a99f82668642
   - m13 @ 72753febe012c165cbc8059ee9a0b53fc78b17b6
   - m14 @ ccc8c31f164438ec61e165854477365615d64357
   - m15 @ e24d158d6715d3cce72ab9ed9247f97055122a2c
   - m16 @ 34c38f70fd2e5139c8ae112df03ea8d194e3fdb4
   con `git merge --no-ff --no-edit <sha>`. I conflitti attesi sono zero (la regia ha già fatto la prova d'unione, verde). Se uno litiga: `git merge --abort`, fermati e scrivi alla regia quale ramo e quali file. Non ricucire a mano.
3. Togli le riparazioni che rompono altro, secondo i collaudi, con `git revert --no-edit <sha>`, in QUESTO ordine (la regia l'ha già provato, passano puliti):
   1) 20b107a4 (R14-012: la 930 cancellerebbe la correzione R13-012)
   2) e586e7df (R12-001)
   3) 384c46be (R12-001)
   4) f2b9a86e (R15-006)
4. Prove sull'albero unito, una volta: `npm ci`, poi `npm run verify`. Poi la palestra SQL: `pg_ctlcluster 16 main start; su postgres -c "createuser -s root"`, poi `tests/sql/harness/apply.sh` e `tests/sql/harness/run.sh`.
5. Se una prova è rossa, trova la voce che la rompe. Ogni commit porta una voce sola, e il suo messaggio comincia col codice della voce (RNN-NNN). Togli la voce con `git revert` di tutti i suoi commit, poi rilancia la prova. Non correggere il codice. Non toccare nessuna prova: sono comuni, e cambiarle chiede la firma di Nicola. Se resta rosso dopo due voci tolte, fermati e scrivi alla regia.
6. Spingi: `git push -u origin ccr-a672a2b3-92w5w1` (ritenta fino a 4 volte se la rete cade). Non aprire richieste di unione (PR): la apre la regia dopo il controllore.
7. Scrivi alla regia, una riga per cosa:
   - lo SHA intero che hai spinto;
   - i revert fatti, ognuno con la sua voce;
   - le voci tolte in più al punto 5, col perché;
   - quante prove e quante rosse, da `npm run verify` e da `run.sh`;
   - il tuo costo, se lo vedi.

Limiti: al massimo 12 $ di spesa, nessun subagente (il lavoro è meccanico), niente Workflow, senza ultracode (REGIA.md regola 3). Messaggi di commit: quelli di git (merge e revert), nessun codice di altre voci. Non toccare `.riparazione/`: si toglie alla fine della campagna.
