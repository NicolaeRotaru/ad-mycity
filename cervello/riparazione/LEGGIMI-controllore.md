---
tipo: istruzioni
per: le sessioni controllore della riparazione in sessioni (C01, C02, … e CF)
data: 2026-11-12 15:20
---

# Il controllore — cosa fai e come lo consegni

> Nato il 12/11/2026 da Nicola: «ci deve essere un controllore messo da qualche parte, perché stai per fare un
> lavoro gigantesco e di solito lasci sempre qualcosa indietro o fai errori, e non voglio che con la prossima
> radiografia trovo errori che c'erano già». E poi: «non deve essere fatto lavoro inutile che consuma token».

## Chi sei
Sei una sessione nuova. Non hai riparato niente e non hai collaudato niente: per questo il tuo giudizio conta.
Il collaudatore guarda ogni riparazione **sul ramo del riparatore**. Tu guardi il ramo **già unito**: lì le
riparazioni di sessioni diverse si incontrano per la prima volta, ed è lì che nascono i difetti nuovi.
Sei `CNN` dopo l'onda NN, oppure `CF`, il controllore finale, su tutta la campagna.

Non ripari niente, non tocchi il database vero (nemmeno in lettura, nemmeno da un subagente: scrivilo nel mandato di
ognuno), non mandi messaggi a persone.

## Cosa ti dà la regista, nel prompt
La cartella della campagna `<C>`. Il commit di `ad-mycity` da leggere (`SHA_REGISTA`). Il ramo di integrazione
del sito e il suo SHA. La base dell'onda (per `CF`: la base della campagna). Il tuo ramo `<ramo>-cNN`.

## I passi: prima i programmi, poi gli occhi
**Prima di tutto, il lucchetto sul database vero.** Nella tua copia di `ad-mycity` scrivi `.claude/settings.local.json`
con `{"permissions": {"deny": ["mcp__Supabase", "mcp__Vercel", "mcp__Stripe"]}}`. Il permesso generale di `ad-mycity`
lascia passare lo strumento SQL senza chiedere, e nell'onda 1 un subagente ha letto il database di produzione. Il
divieto vince sul permesso, e vale anche per i subagenti che lanci.

1. **Prepara.** Clona `ad-mycity` al commit `SHA_REGISTA`, in sola lettura. Clona il sito allo SHA di
   integrazione, poi `npm ci` una volta sola.
2. **Le prove sull'albero unito, una volta sola:** `npm run verify`, poi `tests/sql/harness/apply.sh` e
   `tests/sql/harness/run.sh`. Per ogni file di prova rosso, cerca in `<C>/referti/RNN.json` la voce che lo
   cita in `prova_file`. Quella voce va in `voci_rosse`, col file e la riga che cade.
3. **Gli occhi, solo sui file toccati.** La lista è `git diff --name-only <base>..<SHA integrazione>`.
   Raggruppa i file per dimensione: la dimensione la trovi nella voce del perimetro che li cita. Dai a ogni
   gruppo un subagente del senior di quella dimensione, al massimo 12. Ogni subagente legge solo i pezzi
   cambiati e le voci che li toccano, non i file interi. Ha tre domande chiuse:
   - la riparazione chiude davvero tutta la voce, o ne lascia un pezzo?
   - le righe nuove rompono qualcos'altro, per esempio soldi, permessi, dati o un flusso vicino?
   - nello stesso file c'è un altro punto con lo stesso difetto, rimasto com'era?
   Quello che trova va in `voci_rosse` se riguarda una voce della campagna. Altrimenti va in `nuovi_difetti_visti`.
4. **Solo `CF`, se la palestra è accesa:** un giro dei flussi che incassano sull'anteprima e sul database di
   prova. Ordine in contanti fino alla consegna, un rimborso, la pagina dei bonifici. Mai la produzione.

## Il lavoro che non fai, perché consuma senza servire
- Non rifai il collaudo voce per voce: lo ha già fatto il collaudatore. Tu guardi solo l'unione.
- Non rileggi un file intero se è cambiata una riga. Non rileggi due volte lo stesso pezzo.
- Non controlli il controllo: un secondo subagente solo per un difetto nuovo **grave, o che ferma il sito**, e parte
  dalla riga citata dal primo (regole ⑯ e ⑲ di `cervello/MANUALE-AD.md`).
- Non tieni in storia le uscite lunghe: le prove si lanciano col reporter corto e il log va in un file in `/tmp`. I
  subagenti si lanciano tutti insieme in primo piano, nello stesso messaggio.
- Non cerchi difetti minori fuori dai file toccati: con più di 100 minori aperti nel registro non se ne
  cercano di nuovi (regola ⑳).
- Preventivo: da 80 a 150 mila token per subagente. Oltre 12 subagenti, o oltre 2 milioni di token, ti fermi
  e lo dici alla regista prima di partire.

## Il referto `<C>/controlli/CNN.json` (o `CF.json`)
```json
{
  "controllore": "C01", "onda": 1, "finita": true, "testa": "<SHA di integrazione guardato>",
  "verify": { "comando": "npm run verify && tests/sql/harness/run.sh", "esito": "verde" },
  "voci_rosse": [ { "chiave": "<la chiave della voce, uguale al registro>", "perche": "file e riga che cade, in una frase" } ],
  "nuovi_difetti_visti": [ { "titolo": "come lo diresti a voce", "dimensione": "…", "severita": "grave",
                             "file": "percorso:riga", "descrizione": "…" } ],
  "file_toccati": 0, "file_guardati": 0,
  "conto": { "subagenti": 0, "token_stimati": 0 }
}
```
- `voci_rosse` vuota vuol dire «ho guardato e reggono tutte». Non la ometti mai.
- `testa` è lo SHA del ramo unito che hai guardato davvero. Se `verify` è rosso, almeno una voce va in
  `voci_rosse`. Se non sai a chi dare il rosso, lo scrivi alla regista: `applica` non chiude niente su un
  albero rosso senza un responsabile.
- Una falla di sicurezza nuova segue le regole del deposito pubblico di `LEGGIMI-riparatore.md`: `"riservato":
  true`, il titolo fisso, il file `(nel referto privato)`. I dettagli vanno solo nel messaggio alla regista.
- `file_guardati` minore di `file_toccati` va detto, con il perché. Un buco detto non è un errore, uno nascosto sì.

## Come consegni
Sul tuo ramo committi **solo** `<C>/controlli/CNN.json`, poi spingi. Alla regista mandi con `send_message`
una riga sola, per esempio «C01: verify verde, 2 voci rosse, 1 difetto nuovo grave, 214 file guardati su 214».
La regista controlla il referto con `node cervello/riparazione-sessioni.mjs applica --cartella <C>` a vuoto.
Il programma ferma le voci rosse e mette i difetti nuovi nel registro come nati.
