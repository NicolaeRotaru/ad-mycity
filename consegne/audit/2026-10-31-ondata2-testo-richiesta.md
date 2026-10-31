**In breve:** la seconda ondata del piano per aprire, quella del binario B. Ripara la posizione del negozio, il pannello admin, la home e i nomi dei clienti.
**Per te:** uniscila dopo NicolaeRotaru/mycity#267, poi premi il pulsante delle migrazioni per la 181.

## In parole semplici

Questa è l'ondata del binario B: tocca file diversi da quelli dell'ondata 1, e niente soldi né cassa. Dentro ci sono quattro gruppi di lavoro. Un quinto, quello del fattorino, è rimasto fuori perché non regge.

- **La posizione del negozio:** un negozio che scrive l'indirizzo senza premere «Cerca» non finisce più a Roma. Oggi da Piacenza nessuno potrebbe ordinargli una consegna.
- **La testata e due pagine:** il logo e «Accedi» tornano visibili. La pagina Promozioni non va più in errore quando non c'è nessuna promozione. La ricerca dice «non riesco a cercare» quando cade la rete, invece di «nessun risultato».
- **Il pannello admin:** nasce la pagina del dettaglio di un ordine, a cui portano già tutti gli allarmi. Nasce la pagina delle segnalazioni di contenuti illeciti, con la decisione motivata. Le tabelle admin dicono «non riesco a leggere» quando la lettura cade, invece di «zero ordini».
- **La home:** una sezione rotta non cancella più tutta la home composta dal pannello. Il riquadro «Trending ora» non dà medaglie senza vendite vere.
- **I nomi dei clienti:** con la migrazione 181 il negoziante rivede il nome dei suoi clienti in chat e nella pagina clienti. La pagina recensioni del negozio smette di andare sempre in errore.

Un esempio. Mercoledì il fornaio apre il suo profilo e scrive «Via Roma 12, Piacenza» senza premere «Cerca». Oggi il sito lo salverebbe alle coordinate di Roma, e un cliente di Piacenza leggerebbe che abita troppo lontano. Con questa ondata il sito non salva una posizione che il negozio non ha confermato.

## Cosa cambia per te

- **Il negoziante rivede i nomi dei clienti** solo dopo che premi il pulsante delle migrazioni per la 181. Prima di allora la chat regge e scrive «Cliente».
- **Le segnalazioni hanno una pagina:** ci arrivi dall'avviso o da `/admin/segnalazioni`. La voce nel menu admin manca ancora.
- **Il pulsante SOS del fattorino resta com'è oggi.** La correzione rompeva un'altra cosa: l'avviso arrivava senza la posizione. Al lancio il fattorino sei tu.

## Cosa devi fare

- **Unire questa richiesta dopo la NicolaeRotaru/mycity#267.**
- **Premere il pulsante delle migrazioni,** che applica la 181 insieme alle altre che mancano.
- **Darmi una scelta sul pulsante SOS del fattorino.** Il mio consiglio: rifarlo in un'ondata dei nati, con una migrazione nuova che lascia al fattorino aggiungere la posizione dopo l'avviso.

## Cosa non ho verificato

- **Le migrazioni non le ho provate sul database vero.** Le ho provate su un Postgres locale, con le stesse quattro prove della verifica automatica, insieme all'ondata 1. Lì ho fatto anche le prove nel browser: 70 verdi.
- **Sette correzioni sono parziali.** Esempi: i negozi già salvati a Roma restano lì finché non riaprono il profilo, e rimetterli a posto è una scrittura sul database che decidi tu. Le categorie vuote spariscono dalla mappa per Google, ma non ancora dalla home e dal piè di pagina.
- **La regola della 181 non ha una prova SQL che la esegua.** È nel registro, come difetto minore.
- **Il collaudo ha visto tre difetti gravi vecchi qui vicino.** Li ho messi nel registro. Nella testata le pillole «Ordini», «Consegne» e «Admin» non si vedono ancora, e nemmeno cuore, messaggi e campanella. Chi segnala un contenuto non riceve ancora l'esito che il modulo gli promette.

---

## Dettagli tecnici

- Pacchetti uniti: VE `ebeaeffb`, AD `98807b96`, HP `a81fc255`, P161b `f4c70dab`, sopra `origin/main` `0fc4ec7d`. Fuori: RI (`fix/ondata-2-components-rider-sosbutton-tsx`, `04d0e811`), «non regge» dopo un giro di correzione.
- Collaudo: lente A e lente B su tutta l'ondata, run `wf_765f4faf-23a`, 9 agenti.
- `npm run verify` sulle due ondate insieme (ramo di prova `prova-ondate-1-e-2`): verde, 762 file e 6.749 prove su 6.749.
- Prove nel browser in locale, sul sito costruito come nella CI con le ondate 1 e 2 insieme: 70 passate, 6 saltate (le stesse 6 della CI), 0 rosse.
- Prove SQL su Postgres 16 locale, ondate 1 e 2 insieme: `tests/sql/harness/apply.sh`, `run.sh`, `migrazione-su-database-pieno.sh` verdi; `scripts/applica-migrazioni-mancanti.sh` due volte, al secondo giro «applicate 0».
- Migrazione: `181_i_nomi_dei_clienti_che_il_negozio_vede.sql`.
- Referto: `consegne/audit/2026-10-31-ondata2-binario-b.json` nel deposito della memoria.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_015BmpnVBvU3DW8deEpppLgx
