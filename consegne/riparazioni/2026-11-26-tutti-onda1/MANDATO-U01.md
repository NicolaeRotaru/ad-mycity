Sei U01, la sessione che unisce l'onda 1 della riparazione del 26/11 del sito MyCity. Rispondi solo alla regia: session_015BmpnYqBePM7qU3AUDAXBJ (send_message). Nicola non vuole richieste di approvazione: niente domande a lui.

Cosa fai (deposito NicolaeRotaru/mycity, sei partita dalla base ed12ed8ec8190e1132b690f6e034c30f0a5d55ba, il tuo ramo è ccr-a672a2b3-92w5w1):
1. `git checkout -B ccr-a672a2b3-92w5w1 ed12ed8ec8190e1132b690f6e034c30f0a5d55ba`, poi `git fetch origin` dei rami ccr-a672a2b3-92w5w1-m01 … -m11.
2. Unisci in ordine, uno alla volta: `git merge --no-ff --no-edit origin/ccr-a672a2b3-92w5w1-mNN` per NN = 01, 02, … 11. I conflitti attesi sono zero (la regia ha già fatto la prova d'unione, verde). Se uno litiga: `git merge --abort`, fermati e scrivi alla regia quale ramo e quali file. Non ricucire a mano.
3. Togli queste riparazioni, che i collaudi dicono che rompono altro, con `git revert --no-edit <sha>` in QUESTO ordine (la regia l'ha provato: tutti passano puliti):
   {{REVERT}}
4. Prove sull'albero unito, una volta: `npm ci`, poi `npm run verify`. Poi la palestra SQL: `pg_ctlcluster 16 main start; su postgres -c "createuser -s root"`, poi `tests/sql/harness/apply.sh` e `tests/sql/harness/run.sh`.
5. Se una prova è rossa: trova la voce che la rompe (il messaggio di commit comincia con il suo codice RNN-NNN; una voce per commit) e toglila con `git revert` di tutti i suoi commit. Rilancia la prova. Non correggere il codice, non toccare nessuna prova (sono comuni: cambiarle chiede la firma di Nicola). Se dopo due voci tolte resta rosso, fermati e scrivi alla regia.
6. Spingi: `git push -u origin ccr-a672a2b3-92w5w1` (ritenta fino a 4 volte se la rete cade). Non aprire richieste di unione (PR): la apre la regia dopo il controllore.
7. Scrivi alla regia, in poche righe: lo SHA intero spinto; i revert fatti (sha → voce); le voci tolte in più al punto 5 col perché; le ultime righe di `npm run verify` e di `run.sh` (quante prove, quante rosse); il tuo costo se lo vedi.

Limiti: 12 $, nessun subagente (il lavoro è meccanico), niente Workflow. Messaggi di commit: quelli di git (merge e revert), nessun codice di altre voci. Non toccare `.riparazione/`: si toglie alla fine della campagna.
