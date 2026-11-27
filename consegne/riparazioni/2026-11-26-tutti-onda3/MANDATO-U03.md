## In parole semplici
Questo file è il mandato che la regia ha dato alla sessione U03 il 26/11/2026.
U03 doveva unire in un ramo solo i lavori dell'onda 3 della riparazione del sito.
Per esempio: ha unito i 12 rami dei riparatori, dal m17 al m28, uno alla volta.
Poi il mandato le chiedeva di togliere 3 riparazioni, perché il collaudo le aveva trovate dannose per altre parti del sito.
Fra le tre c'erano l'AI a pagamento e il bottone «Finito per oggi» del negozio.
Si tolgono con un revert di git: un commit nuovo che annulla quello vecchio, senza cancellare la storia.

## Cosa cambia per te
Niente: è la traccia di come è stata fatta l'unione dell'onda 3.
Le 39 voci dell'onda 3 si chiudono solo quando unisci la richiesta del sito.

## Cosa devi fare
Niente su questo file.

## Cosa non ho verificato
Il testo sotto la riga dei dettagli è quello dato alla sessione, parola per parola.
Non l'ho riscritto, perché è la storia di cosa le è stato chiesto.

## Dettagli tecnici

Sei U03, la sessione che unisce l'onda 3 della riparazione del 26/11 del sito MyCity. Rispondi solo alla regia: session_015BmpnWreePW2cQU4FxGk5Q (send_message). Nicola non vuole richieste di approvazione: niente domande a lui.

Cosa fai (deposito NicolaeRotaru/mycity, sei partita dall'integrazione delle onde 1 e 2, aac2350b09db195d6d2286f15f75a7d02ae590a1; il tuo ramo è ccr-a672a2b3-92w5w1):
1. `git checkout -B ccr-a672a2b3-92w5w1 aac2350b09db195d6d2286f15f75a7d02ae590a1`, poi `git fetch origin` dei rami ccr-a672a2b3-92w5w1-m17 … -m28 e -m26b.
2. Unisci in ordine, uno alla volta, queste punte esatte (non la punta del ramo, se nel frattempo è cambiata):
   - m17 @ 21ad24d59d227a937f7f93b29ba1c2eb283be6ab
   - m18 @ eb6eb4a2301f6387c73fd3588a031063e3ecf657
   - m19 @ c0bebde628f66a2a0c39bdc0e9c77d23313f3603
   - m20 @ e201a4f943b91d03352a289ba7d11e273de47449
   - m21 @ f2f0347882d268662f0ce6df48395ab257079baa
   - m22 @ 2182ae5309fc0646691d1141f5656766132da1c9
   - m23 @ 7082bc6579ac1781389c9b0ee86537b590f4cc9c
   - m24 @ d9dabfcf9de5bf6bf651e0f4027dd4bfe3977d6b
   - m25 @ 33840626d8c6aecbdbbb1a582f77f8b75a3f1160
   - m26b @ 84e1709af6b5fca192da9d2fb71067ead6f60a1a (la copia lineare di -m26 fatta dalla regia: stesso codice, senza l'unione interna)
   - m27 @ b8b196db392edd66a3af560ffe36afe61b053add
   - m28 @ 3913106147c9ebbe21cc6b56bfb25572c0fd07bc
   con `git merge --no-ff --no-edit <sha>`. I conflitti attesi sono zero (la regia ha già fatto la prova d'unione, verde). Se uno litiga: `git merge --abort`, fermati e scrivi alla regia quale ramo e quali file. Non ricucire a mano.
3. Togli le riparazioni che rompono altro, secondo i collaudi, con `git revert --no-edit <sha>`, in QUESTO ordine (la regia l'ha già provato, passano puliti):
   1) 52b0a1638434c9783ae7ef4ce7ae8f14e9dab702 (R20-002)
   2) be3ee840e67661bedead7c511ee5506223b3e090 (R19-004)
   3) 2f5433635cf9ae9d7e391432e176e3485ae5668d (R26-012)
   4) 54b4d62e1198d18baf6cfd7fad84e90322ab4503 (R26-012)
   5) 17675c0ddcd0a0f671c7d92518d2d7102d21fe00 (R26-012)
   6) 5fdb2ed87ca34ca688502a80ccd582c926a0aae4 (R26-012)
   7) 7d1fe7c69f1b3253e2474d0de2a2a0a465253420 (R26-012)
   8) 6a1676714ddc1d942afdc868483e0856d52c5716 (R26-012)
4. Prove sull'albero unito, una volta: `npm ci`, poi `npm run verify`. Poi la palestra SQL: `pg_ctlcluster 16 main start; su postgres -c "createuser -s root"`, poi `tests/sql/harness/apply.sh` e `tests/sql/harness/run.sh`.
5. Se una prova è rossa, trova la voce che la rompe. Ogni commit porta una voce sola, e il suo messaggio comincia col codice della voce (RNN-NNN). Togli la voce con `git revert` di tutti i suoi commit, poi rilancia la prova. Non correggere il codice. Non toccare nessuna prova: sono comuni, e cambiarle chiede la firma di Nicola. Se resta rosso dopo due voci tolte, fermati e scrivi alla regia. Eccezione: se a diventare rossa è solo la prova di velocità di R21-003 (tests/sql, riparazione-r21-prezzo-pagato-veloce), rilanciala una volta; se resta rossa, scrivi alla regia prima di togliere.
6. Spingi: `git push -u origin ccr-a672a2b3-92w5w1` (ritenta fino a 4 volte se la rete cade). Non aprire richieste di unione (PR): la apre la regia dopo il controllore.
7. Scrivi alla regia, una riga per cosa:
   - lo SHA intero che hai spinto;
   - i revert fatti, ognuno con la sua voce;
   - le voci tolte in più al punto 5, col perché;
   - quante prove e quante rosse, da `npm run verify` e da `run.sh`;
   - il tuo costo, se lo vedi.

Limiti: al massimo 12 $ di spesa, nessun subagente (il lavoro è meccanico), niente Workflow, senza ultracode (REGIA.md regola 3). Messaggi di commit: quelli di git (merge e revert), nessun codice di altre voci. Non toccare `.riparazione/`: si toglie alla fine della campagna.
