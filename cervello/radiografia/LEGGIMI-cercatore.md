---
tipo: regole per le sessioni della radiografia in sessioni
data: 2026-11-12 23:55
aggiornato: 2026-11-24 21:31 — le lezioni delle onde della riparazione e del ricontrollo del 21/11
per: ogni sessione che cerca difetti nel sito (S01…S12), prima del suo primo passo
---

# Le regole della sessione che cerca

**In due righe.** Questo file lo legge ogni sessione della radiografia prima di partire, insieme alla sua scheda. È scritto per le sessioni, con i nomi dei file e dei comandi.

## In parole semplici
Sono le regole di chi cerca i difetti del sito: cosa può toccare, come divide il lavoro, come scrive un difetto, come tiene segreta una falla. Un esempio: la sessione S02 non legge il codice da sola; dà ogni lotto di file a un aiutante nuovo, che torna con poche righe, e spinge un solo file, il suo referto.

## Cosa cambia per te
Niente da fare: il file serve alle sessioni.

## Cosa devi fare
Niente su questo file.

## Cosa non ho verificato
L'ha usato una radiografia sola, il ricontrollo del 21/11. Le regole aggiunte il 24/11 (la falla scoperta, il costo in dollari, il primo push, Agent invece di Workflow) non le ha ancora provate nessuna sessione.

---

## Dettagli tecnici

La tua scheda (`<cartella>/schede/SNN.md`) dà i valori veri: il commit del sito (`base_sito`), la cartella, il tuo ramo, l'id della regista, i lotti. Qui ci sono le regole che valgono per tutte.

### 1. Chi sei, e i lucchetti

- Sei la sessione SNN della radiografia. Non sei l'AD: non leggere `cervello/MANUALE-AD.md`. Valgono `CLAUDE.md`, la tua scheda e queste regole. Il tuo prompt d'apertura comincia con `ruolo-freno: cercatore`: dove il freno sugli agenti è acceso, conta i tuoi lanci.
- Nessuno risponde mentre lavori: decidi dentro queste regole, e i dubbi vanno in `domande_per_nicola`.
- **Il lucchetto non si scrive.** `ad-mycity` vieta di scrivere `.claude/settings.local.json` (anche per chiudere permessi): non provarci. Il lucchetto vero è una scelta di Nicola (card #236); finché non c'è, vale il divieto scritto qui sotto.
- **Il divieto, per te e per ogni subagente** (mettilo nel mandato di ognuno): mai uno strumento del database vero, di Vercel o di Stripe, qualunque sia il nome del server che lo porta (`mcp__Supabase…`, `mcp__supabase-marketplace__…`, `mcp__supabase-memoria__…`, `mcp__claude_ai_Vercel…`, un server con un nome a lettere e numeri che espone `execute_sql`, `list_deployments`, `stripe_api_read` e simili). Il 12/11 un subagente di un'altra campagna ha letto il database di produzione: per questo il divieto è assoluto, anche per le letture.

### 2. Il mondo vero si legge da visitatore, e basta

Mai un deploy, una scrittura su un database vero, un ordine, un modulo inviato, un accesso con un account vero, un messaggio a una persona, un'automazione GitHub lanciata, una chiamata a un indirizzo interno del sito vero (`/api/…`, compresi i lavori a orario). Il controllo anti-robot si rispetta. Le prove girano su copie: Postgres locale, server locale, cartelle nello scratchpad.

**Il Postgres locale.**
```bash
pg_ctlcluster 16 main start && (su postgres -c "createuser -s root" 2>/dev/null || true) && psql -d postgres -Atc 'select 1'
```
Ogni subagente usa un database **suo**, tutto minuscolo (`marketplace/tests/sql/harness/apply.sh mycity_s05_l03`, poi `run.sh` con lo stesso nome): senza nome tutti usano `mycity_test`, e `apply.sh` lo cancella. Con il Postgres spento le prove sul database si saltano da sole e il verde è falso. Al massimo due prove pesanti alla volta (database, `npm run verify`, browser).

**I fatti vivi** (prezzi, commissione, paletti, promesse, date) stanno in `MyCity-Vault/90-Memoria-AI/registro-fatti.json`. Se un altro testo non torna, vince il registro. Una regola firmata da Nicola non è un difetto.

**Gli orari** sempre con l'ora di Piacenza: `node -e 'import("./cervello/ora-piacenza.mjs").then(m=>console.log(m.timbroOra()))'`.

### 3. Come lavori: tu sei il capo squadra, i lotti li fanno subagenti nuovi

Il 6/11 ogni sessione ha letto il codice da sola: le storie sono arrivate a 277-422 mila token, e il 97% del consumo era rileggere quella storia a ogni passo. Ora la storia la tieni piccola tu, e la tengono piccola i tuoi aiutanti.

1. **Il codice.** Prima `node cervello/collega-marketplace.mjs` (il sito è pubblico), poi la copia sul commit esatto, e dopo non rilanciarlo:
   ```bash
   B=<base_sito della scheda>; git -C marketplace fetch --depth 1 origin $B && git -C marketplace checkout -q --detach FETCH_HEAD && test "$(git -C marketplace rev-parse HEAD)" = "$B"
   ```
   Se il commit non si scarica, fermati e avvisa la regista con `send_message`. Sul deposito del sito mai un commit, un ramo o un push.
2. **Un lotto, un subagente nuovo.** Per ogni lotto della scheda lanci un subagente (tipo `qa`; `security` per S04), mai `general-purpose`, sempre con lo strumento **Agent**. Mai Workflow: un lancio solo apre molti agenti e il freno non li può contare (il 21/11 le quattro sessioni del ricontrollo hanno lanciato i lotti così). Il mandato è chiuso:
   - i file del lotto: `grep -P '^L03\t' <cartella>/lotti/SNN.txt | cut -f2-`;
   - le lenti, gli angoli e le domande guida della scheda;
   - le gravità che il profilo cerca, e la regola dei minori (§4);
   - il divieto del §1 e le copie del §2;
   - cosa restituire: **solo** le righe dei difetti nel formato del §5 (al massimo 15), più i tre elenchi di copertura; il ragionamento lungo va in un file dello scratchpad (`log/L03.md`), mai nella risposta.
3. **Tutti insieme, in primo piano.** I subagenti dei lotti si lanciano nello stesso messaggio e si aspettano nello stesso turno. Un comando lungo si aspetta nel turno in cui parte. Un turno, un esito: niente turni per dire «aspetto», niente controlli che svegliano più volte.
4. **La storia sotto i 150-300 mila token.** Tu non leggi i file dei lotti: leggi solo le righe che tornano. Se un subagente dice che il lotto è troppo grosso, lo dividi in due subagenti nuovi. Un giro di correzione parte sempre da un subagente nuovo, che legge la riga da correggere, non la storia di prima.
5. **Il tetto.** I subagenti della sessione, cercatori e verificatori insieme, sono al massimo quelli della scheda (12). Oltre, chiedi alla regista con `send_message` prima di lanciarli, e scrivi il suo sì in `conto.permesso_regista`.
6. **S01, il ricontrollo.** I lotti sono voci del registro, non file. Le voci gravi e le minori stanno in sessioni diverse: la scheda dice quali sono le tue, e se hai ultracode. Ogni voce: `ancora_vero`, `non_piu_vero` (con la prova; per gravi e bloccanti un comando oggi verde che sarebbe rosso col difetto), `cambiato` (cosa è cambiato), `non_verificabile` (il perché). Una voce chiusa per sbaglio sparisce: nel dubbio resta aperta.
   - **La falla scoperta.** Ogni voce che resta aperta (`ancora_vero`, `cambiato`, `non_verificabile`) porta `falla: true` o `false`. Falla vuol dire che qualcuno può vedere, cambiare o pagare quello che non dovrebbe, anche se il registro la tiene pubblica. Con `falla: true`, `prova`, `esito_prova`, `nota` e `verificato_da` valgono `"(nel referto privato)"` (o null), e i dettagli vanno solo in chat. Il 21/11 i dettagli di dodici voci aperte sono finiti nei rami pubblici, e li ha visti il controllore finale solo dopo il push. Il programma lo controlla anche sul referto parziale.
   - **Il grave visto di passaggio.** Se la scheda lo dice, un bloccante o un grave che vedi mentre ricontrolli si scrive in `difetti`, con l'asticella e il verificatore di sempre. Un minore no (§4).

### 4. Il valore prima del volume, e la verifica proporzionata

- **I minori.** Se la scheda dice che i minori nuovi non si scrivono, un minore non entra nel referto, nemmeno con `perimetro_altrui` (una falla riservata sì, anche se minore): con più di 100 minori aperti nel registro un minore in più allunga la lista e non avvicina il lancio (regola ⑳). Il programma lo rifiuta.
- **Solo il nuovo.** Prima di scrivere un difetto lo cerchi nel registro, con grep e mai con Read: `grep -i -- '<percorso>' <cartella>/registro-compatto.txt | cut -c1-300`, poi due o tre parole del titolo. Nella seconda onda anche in `<cartella>/trovati.txt`. Se c'è ed è aperto, non è nuovo (o porti una prova più forte, con `gia_noto` uguale alla chiave). Se c'è ma è chiuso ed è tornato, va in `regressioni`.
- **I doppioni li toglie un programma, prima della verifica.** Quando i lotti sono tornati e il referto è scritto:
  ```bash
  node cervello/radiografia-sessioni.mjs doppioni --cartella <cartella> --uscita <il tuo scratchpad>
  ```
  Legge il tuo referto, lo confronta col registro e dentro la sessione, e scrive `doppioni.json` nello scratchpad. Da solo segna solo i difetti con la **stessa chiave**: quelli già aperti nel registro escono, quelli uguali a una voce chiusa passano in `regressioni`. Le coppie solo **simili** (stesso file a meno di 10 righe, titoli vicini) le guardi tu: se sono davvero lo stesso difetto ne tieni uno, e l'altro va in `scartati` col perché («doppione di S02-004»); se no restano tutti e due. I simili fra sessioni diverse li decide il controllore finale.
- **Chi verifica.** Un secondo agente solo per **bloccanti, gravi e riservate**, e per la chiusura (`non_piu_vero`) di un grave o bloccante in S01. Uno per difetto, un subagente `qa` nuovo (`security` se la voce riguarda accessi, permessi o dati), col mandato di `cervello/radiografia/LEGGIMI-verificatore.md` (parte A). Parte dalla prova citata, non rifà la ricerca. Se il verificatore si ferma senza verdetto (il 21/11 due si sono fermati sui controlli di sicurezza del modello dopo due passi), la voce resta `non_verificabile` e lo dici alla regista: la verifica la fa il controllore finale.
  - confermato: `verificato: true` e in `verificato_da` chi l'ha visto e cosa ha detto, in una riga (per le riservate `"(nel referto privato)"`);
  - smentito: il difetto esce da `difetti` e va in `scartati`, con l'id e il perché in una riga. Un id non sparisce mai: il programma controlla che ogni numero da 1 al più alto sia un difetto o uno scartato.
- **Un minore** (quando è ammesso) entra visto una volta, con `verificato: false`. Mai un verificatore su un minore, e mai il controllo di un controllo.

### 5. Il referto

Il tuo ramo cambia **un solo file**: `<cartella>/referti/SNN.json`. Prove, copie, foto, log e appunti stanno nello scratchpad.

```json
{
  "sessione": "S02",
  "base_sito": "<base_sito della scheda>",
  "aggiornato": "2026-11-20 10:40",
  "finita": false,
  "lotti": [{ "id": "L01", "esito": "fatto", "perche": null }],
  "copertura": {
    "file_letti_interi": ["lib/cassa/riquadro.ts"],
    "file_letti_in_parte": [{ "file": "app/api/orders/cod/route.ts", "righe": "120-180" }],
    "file_eseguiti": [{ "file": "tests/unit/cassa.test.ts", "comando": "npx vitest run tests/unit/cassa.test.ts", "esito": "12 verdi" }],
    "non_guardato": [{ "cosa": "il bonifico vero", "perche": "Stripe è chiuso a chiave" }]
  },
  "difetti": [{
    "id": "S02-001", "trovato_da": "L01", "dimensione": "pagamenti-stripe",
    "titolo": "Il riquadro della cassa conta due volte il reso parziale",
    "severita": "grave", "file": "lib/cassa/riquadro.ts:88-104",
    "descrizione": "cosa succede, con le righe", "impatto": "un esempio con giorno, negozio, cifra",
    "fix": "la correzione consigliata", "causa_radice": "perché esiste",
    "prova": "il comando", "prova_tipo": "comando", "prova_eseguita": true, "esito_prova": "cosa è uscito",
    "perche_umano": null, "verificato": true, "verificato_da": "qa nuovo: rilanciata la prova, rossa come scritto",
    "gia_noto": null, "perimetro_altrui": null, "riservato": false
  }],
  "scartati": [{ "id": "S02-002", "perche": "il verificatore l'ha smentito: il reso si sottrae in riquadro.ts:120" }],
  "regressioni": [{ "chiave": "dimensione|titolo", "prova": "…", "esito_prova": "…" }],
  "ricontrolli": [{ "chiave": "dimensione|titolo", "esito": "non_piu_vero", "prova": "…", "prova_tipo": "comando", "prova_eseguita": true, "esito_prova": "…", "verificato": true, "verificato_da": "…", "nota": null },
                  { "chiave": "dimensione|titolo", "esito": "ancora_vero", "prova": "…", "prova_tipo": "comando", "prova_eseguita": true, "esito_prova": "…", "verificato": false, "verificato_da": null, "nota": null, "falla": false }],
  "prove_per_la_palestra": [{ "id": "S02-P001", "funzione": "…", "chi": "cliente", "file": "app/checkout/page.tsx", "dati_di_prova": "…", "passi": "…", "atteso": "…", "limite": "…" }],
  "domande_per_nicola": [],
  "conto": { "agenti": 0, "permesso_regista": null, "usd": null, "usd_perche": null, "token_sessione": {}, "token_subagenti": {}, "nota": "" }
}
```

- `lotti`: a referto finito ci sono tutti i lotti della scheda, `fatto` o `non_fatto` col perché. `trovato_da` è il lotto del difetto (o `capo`).
- `file` di un difetto: uno o più posti separati da « · », ognuno `percorso:riga` o `percorso:inizio-fine`, che esistono al commit della scheda. I prefissi ammessi li dice la scheda, sempre con prova a comando ed esito.
- **L'asticella.** Un grave o un bloccante vale solo con `prova_tipo: "comando"`, `prova_eseguita: true` ed `esito_prova` (la prova diventa rossa se il difetto c'è), oppure con `prova_tipo: "umano"` e il perché in `perche_umano`. `lettura-codice` basta solo per i minori.
- `ricontrolli` lo compila solo S01; la voce si ritrova per `chiave`, mai per posizione. I campi sono quelli dell'esempio e nessun altro.
- `prove_per_la_palestra`: le prove che chiedono di usare il sito come una persona vera si scrivono, non si fanno; `file` sono percorsi senza riga.
- `conto`: alla fine, con `node cervello/conto-token.mjs --sessione <trascrizione>.jsonl --json` e `--dir <trascrizione>/subagents --json` (`ls -t ~/.claude/projects/*/*.jsonl | head -1`). `agenti` è il numero dei subagenti lanciati. `usd` è il costo della tua sessione in dollari, più di zero: `usage.cost_usd` di `get_session` senza id. Se lo strumento non lo dà, `usd` resta null e `usd_perche` lo dice in una frase. Uno zero vale come costo che manca. Senza questo numero la riga delle misure resta vuota, e il preventivo dopo si fa a memoria: il 21/11 nessuno dei quattro referti l'aveva.

**Le falle riservate.** Il deposito è pubblico, e ogni ramo spinto è già una pubblicazione. Una falla (qualcuno può vedere, cambiare o pagare quello che non dovrebbe) si scrive in una forma sola, con questi campi e nessun altro: `id`, `trovato_da`, `riservato: true`, `titolo: "Falla di sicurezza da chiudere (<area>): i dettagli restano fuori dal deposito pubblico finché non è chiusa"` con l'area presa da `pagamenti`, `accessi`, `dati`, `permessi`, `API`, `rilascio`, `privacy`, `altro`, `file: "(nel referto privato)"`, `severita`, `dimensione`, `prova_tipo`, `prova_eseguita`, `verificato`, `verificato_da: "(nel referto privato)"`. I dettagli (file e righe, come si sfrutta, la prova, il verdetto) vanno **solo in chat**, in un tuo messaggio, appena la falla è confermata: mai in un file, un commit, un titolo o un `send_message`. L'id di una riservata non compare in nessun altro campo.

### 6. Salvare, spingere, finire

- **Prima di ogni push:** `node cervello/radiografia-sessioni.mjs valida-referto <cartella>/referti/SNN.json --cartella <cartella>` (0 verde, 1 rosso, 3 in attesa). Poi rileggi tutto quello che non è riservato: nessuna frase di una tua falla deve comparire altrove.
- **Il primo push entro 10 minuti**: il referto con `"finita": false` e gli elenchi vuoti. È il segno che sei partita: dopo 15 minuti senza ramo la regista ti vede «non partita» (nella settimana dei 700 una sessione è rimasta ferma 52 minuti prima che qualcuno se ne accorgesse).
- Poi spingi il referto con `"finita": false` ogni 10 difetti o ogni ora, quello che arriva prima: uno stop per i limiti non fa perdere niente.
- **Fuori dal tuo perimetro:** un difetto di un'altra sessione lo scrivi con `perimetro_altrui: "SNN"`, senza approfondire (e solo se la sua gravità è fra quelle cercate).
- **Alla fine:** il conto, poi `"finita": true`, `valida-referto` verde, push. Il tuo ultimo messaggio dice quanti difetti per gravità, quanti scartati, quante regressioni, quanti ricontrolli per esito, il commit finale, cosa non hai coperto, e i dettagli di tutte le falle riservate. Lo stesso riassunto, **senza** i dettagli riservati, lo mandi alla regista con `send_message`.
