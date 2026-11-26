Sei U02, la sessione che unisce l'onda 2 della riparazione del 26/11 del sito MyCity. Rispondi solo alla regia: session_015BmpnWEupSMLP5h9NSaDAv (send_message). Nicola non vuole richieste di approvazione: niente domande a lui.

Cosa fai (deposito NicolaeRotaru/mycity, sei partita dall'integrazione dell'onda 1, a60799bdcd19e5fe35358b7f494fa5a2c09ab211; il tuo ramo è ccr-a672a2b3-92w5w1):
1. `git checkout -B ccr-a672a2b3-92w5w1 a60799bdcd19e5fe35358b7f494fa5a2c09ab211`, poi `git fetch origin` dei rami ccr-a672a2b3-92w5w1-m12 … -m16.
2. Unisci in ordine, uno alla volta, queste punte esatte (non la punta del ramo, se nel frattempo è cambiata):
   - m12 @ __M12__
   - m13 @ __M13__
   - m14 @ __M14__
   - m15 @ __M15__
   - m16 @ __M16__
   con `git merge --no-ff --no-edit <sha>`. I conflitti attesi sono zero (la regia ha già fatto la prova d'unione, verde). Se uno litiga: `git merge --abort`, fermati e scrivi alla regia quale ramo e quali file. Non ricucire a mano.
3. Togli le riparazioni che rompono altro, secondo i collaudi, con `git revert --no-edit <sha>`, in QUESTO ordine (la regia l'ha già provato, passano puliti):
__REVERT__
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
