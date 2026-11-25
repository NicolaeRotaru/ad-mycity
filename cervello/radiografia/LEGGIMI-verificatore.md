---
tipo: regole per chi verifica nella radiografia in sessioni
data: 2026-11-12 23:58
per: il subagente che verifica un difetto (parte A) e la sessione del controllo finale, CF (parte B)
---

# Le regole di chi verifica

**In due righe.** Due mandati corti: quello del subagente che prova a smentire un difetto grave, e quello della sessione che alla fine rifà i conti. Sono scritti per gli agenti.

## In parole semplici
Chi trova un difetto non lo conferma. Un agente nuovo prende la prova citata, la rilancia, e dice se regge. Alla fine una sessione nuova controlla che nessun difetto trovato sia sparito per strada. Un esempio: S02 trova che la cassa conta due volte un reso; un verificatore rilancia lo stesso comando sulla copia, lo vede rosso, e solo allora il difetto entra.

## Cosa cambia per te
Niente da fare: il file serve agli agenti.

## Cosa devi fare
Niente su questo file.

## Cosa non ho verificato
L'ha usato il ricontrollo del 21/11: il controllore finale ha confermato tre chiusure gravi e ha trovato dettagli di falle nei referti pubblici. Le aggiunte del 24/11 (le voci `non_verificabile` da verificare, le falle scoperte, il costo) non le ha ancora provate nessuno.

---

## Dettagli tecnici

### Parte A — il verificatore di un difetto (un subagente nuovo, uno per difetto)

Lo lancia il capo della sessione per ogni **bloccante, grave o riservata**, e per ogni chiusura `non_piu_vero` di un grave o bloccante in S01. Mai per un minore: un minore entra visto una volta (regola ⑲).

1. **Non l'hai trovato tu.** Il tuo compito è smentirlo. Nel dubbio il difetto si scarta; per una chiusura di S01, nel dubbio la voce resta aperta.
2. **Parti dalla prova** (regola ⑯). Ricevi il difetto (o, per una riservata, i suoi dettagli in chat): rilancia il comando citato, o rileggi le righe citate, sulla copia del sito al commit della scheda. Non rifai la ricerca da capo e non leggi altro che quello che serve alla prova.
3. **Le copie, sempre.** Il Postgres locale con un database tuo (`mycity_<sessione>_v<n>`), un server locale, lo scratchpad. Mai uno strumento del database vero, di Vercel o di Stripe (LEGGIMI del cercatore, §1). Le prove con date e orari usano un orologio finto.
4. **Il peso.** Per un grave o un bloccante dici anche se la gravità regge. Se il difetto è vero ma è un minore, e la radiografia non ammette minori nuovi, il capo lo mette fra gli scartati col perché «vero, ma minore: regola ⑳».
5. **Già riparato dopo?** Se la copia del sito ha anche l'ultimo `main` (`git -C marketplace fetch --depth 1 origin main`), guarda se lì il difetto c'è ancora: se no, dillo («già riparato dopo la base»).
6. **Se ti fermi**, per un limite o per i controlli di sicurezza del modello, dillo in una riga: «fermato senza verdetto». La voce resta `non_verificabile` e la verifica passa al controllore finale. Il 21/11 due verificatori si sono fermati così dopo due passi; inventare un verdetto sarebbe peggio.
7. **La risposta: tre righe, non di più.** `confermato` · `smentito` · `non riproducibile`; la prova rilanciata e cosa è uscito; il peso. Il resto va in un file dello scratchpad. Per una riservata la risposta va solo al capo, in chat, e nel referto si scrive `verificato_da: "(nel referto privato)"`.

### Parte B — il controllore finale (CF, una sessione nuova a fine radiografia)

La apre la regista quando tutte le sessioni sono finite e verdi, dopo `doppioni` e `grezzo`. Lavora su `ad-mycity`, al commit che la regista le dà, e spinge un solo file: `<cartella>/controllo-finale.json`. Vale il divieto del §1 del LEGGIMI del cercatore, per lei e per ogni suo subagente.

Il controllore non rifà la ricerca e non riverifica uno per uno: guarda solo quello che gli altri non potevano vedere.

1. **I conti, col programma.**
   ```bash
   node cervello/radiografia-sessioni.mjs conti --cartella <cartella>
   node cervello/radiografia-sessioni.mjs copertura-dopo --cartella <cartella>
   ```
   `conti` deve essere verde: ogni difetto trovato sta nel grezzo, oppure fra doppioni e regressioni, e nessun id manca fra difetti e scartati. Un rosso si scrive nel referto col suo id, e si dice alla regista.
2. **La riservatezza.** Due subagenti `security` nuovi, che non hanno trovato né verificato nessuna falla, leggono tutto quello che sta per diventare pubblico: il grezzo, i referti delle sessioni, `trovati.txt`, il diario, il corpo della PR che la regista prepara. Segnano ogni campo che ripete otto parole di fila di una falla, o che nomina una rotta, una tabella o una riga che compare solo in una falla. I dettagli delle falle li chiedono alla regista in chat. Guardano anche i ricontrolli con `falla: false`: il 21/11 i segni erano tutti su voci pubbliche del registro, dove i referti aggiungevano il come. Una voce così si segna, e va in `da_riservare` del referto (sotto).
3. **Il controllo a sorpresa.** Tre gravi o bloccanti scelti a caso dal grezzo, con la loro prova rilanciata sulla copia: l'uscita copiata nel referto.
4. **I simili.** `doppioni.json` porta due elenchi che nessun programma decide: `simili` (due difetti di sessioni diverse, stesso file a meno di 10 righe, titoli vicini) e `simili_registro` (un difetto vicino a una voce del registro). Per ognuno guardi i due testi e dici se è lo stesso difetto. Nel dubbio restano tutti e due: un doppione costa una riga, un difetto perso costa un lancio. Scrivi gli id da togliere in `togli`, con l'id o la chiave a cui sono uguali.
4b. **Le verifiche rimaste.** Le chiusure di gravi e bloccanti che le sessioni hanno lasciato `non_verificabile` perché il verificatore si è fermato: le verifichi tu, una per voce, con un subagente nuovo (parte A) che parte dalla prova. L'esito va in `verifiche`, e la regista lo copia nel referto della sessione prima di `applica`.
5. **I buchi.** Dall'uscita di `copertura-dopo` e dai `non_guardato` delle sessioni, l'elenco di cosa nessuno ha guardato. Non lo copri tu: lo scrivi, e la regista lo porta a Nicola.
6. **Il referto**, `controllo-finale.json`:
   ```json
   { "aggiornato": "2026-11-20 18:10", "conti": "verde", "rossi_conti": [], "riservatezza": [{ "dove": "grezzo.json", "campo": "…", "cosa": "…" }],
     "sorpresa": [{ "id": "S02-001", "comando": "…", "esito": "rosso come scritto" }], "togli": [{ "id": "S06-003", "uguale_a": "S02-004" }],
     "verifiche": [{ "chiave": "…", "esito": "chiusura confermata", "verificato_da": "…" }], "da_riservare": ["chiave pubblica"], "buchi": ["…"], "agenti": 3, "usd": 0 }
   ```
   Per una riservatezza violata, `cosa` dice solo il campo e il tipo di segno, mai la frase della falla. `usd` è il costo della tua sessione (`usage.cost_usd` di `get_session` senza id): la regista lo passa a `misura --usd-cf`.
7. **Il messaggio alla regista** con `send_message`: i conti, i segni di riservatezza, la sorpresa, i simili da togliere, i buchi, in dieci righe al massimo.
