---
tipo: regole per le sessioni figlie
data: 2026-11-06 08:40
radiografia: in 12 sessioni, prompt v5 (`consegne/audit/PROMPT-radiografia-12-sessioni.md`)
base_sito: db5164c52e856c0e3eab1c02197ae755fca76eb3
sessione_ad: session_015BmpnX3prh5pipxFGzQEeK
ramo_ad: claude/serene-wright-7l023n
---

# Le regole per le 12 sessioni della radiografia

**In due righe.** Questo file lo legge ogni sessione figlia prima di fare il piano. Dentro ci sono le regole di tutto il lavoro (§1), le regole di ogni sessione (§5) e le 24 lenti con la sessione che possiede ognuna.

- Il commit del sito da analizzare: `db5164c52e856c0e3eab1c02197ae755fca76eb3`, e nessun altro.
- La cartella di lavoro: `consegne/audit/2026-11-06-radiografia-12-sessioni/`. La tua scheda: `schede/SNN.md`. Il tuo referto: `referti/SNN.json`.
- La sessione dell'AD: `session_015BmpnX3prh5pipxFGzQEeK`. Il tuo ramo: `claude/serene-wright-7l023n-rNN`, con NN il numero della tua sessione.
- Il registro compatto: `registro-compatto.txt`, solo con `grep`, mai con Read. La mappa dei file: `mappa-file.txt`.
- I controlli di macchina: `node consegne/audit/2026-11-06-radiografia-12-sessioni/controlli.mjs valida-referto consegne/audit/2026-11-06-radiografia-12-sessioni/referti/SNN.json` (0 verde, 1 rosso, 3 in attesa). Lancialo prima di ogni push.

## 1. Le regole che valgono per tutto il lavoro

**Il mondo vero si legge e basta.** Il sito, il database vero, Stripe, Vercel e le automazioni GitHub del sito si leggono e basta. Mai:
- un deploy;
- una scrittura sul database vero;
- un ordine vero, un modulo inviato, un accesso con un account vero;
- un messaggio a una persona;
- una variabile cambiata su Vercel;
- un'automazione GitHub lanciata (`actions_run_trigger` mai: `migrazioni-a-mano` scrive sul database vero);
- una chiamata a un indirizzo interno del sito vero (`/api/…`, compresi i lavori a orario, con o senza `?a_mano=1`): se è aperto a chiunque, il lavoro parte davvero.

Le prove girano su copie: Postgres locale, server locale, cartelle temporanee nello scratchpad.

**Il Postgres locale.** Prima accendilo e controlla che risponda:
```bash
pg_ctlcluster 16 main start && (su postgres -c "createuser -s root" 2>/dev/null || true) && psql -d postgres -Atc 'select 1'
```
Qui si gira come `root`, e Postgres accetta solo l'utente del sistema. Il ruolo `root` serve perché `apply.sh` e `run.sh`, che chiamano `psql` senza utente, possano entrare.
- Ogni subagente che lo usa gli dà un nome di database **suo**, tutto minuscolo. Per esempio `marketplace/tests/sql/harness/apply.sh mycity_s05_2`, e poi `run.sh` con lo stesso nome.
- Senza nome tutti usano `mycity_test`, e `apply.sh` lo cancella con `DROP … WITH (FORCE)`: due prove in parallelo si distruggono a vicenda.
- Con il Postgres spento, le prove sul database di `npm run verify` si saltano da sole e il verde è falso.
- Le prove pesanti (database, `npm run verify`, browser) girano al massimo due alla volta: la macchina ha 4 processori.

**I fatti vivi stanno in `MyCity-Vault/90-Memoria-AI/registro-fatti.json`.** Prezzi, commissione, paletti, promesse, date: si leggono lì. Non si prendono dal §4 di `CONTESTO_BUSINESS.md` né dal riquadro dei paletti di `CLAUDE.md`, che riportano ancora quelli di agosto. Se due testi non tornano, vince il registro. Due esempi:
- la commissione del 10% vale su **tutti** gli ordini, anche dei clienti che il negozio aveva già (`pricing.commissione`);
- il negozio approva le anteprime **sul sito**, non su WhatsApp (`prodotto.paletti`, riscritti da Nicola il 1/11).

**Il deposito è pubblico.** `NicolaeRotaru/ad-mycity` è pubblico, e ogni ramo spinto è già una pubblicazione.
- Una **falla di sicurezza** è un difetto che lascia a qualcuno vedere, cambiare o pagare quello che non dovrebbe: permessi e regole di accesso, dati esposti, accessi, pagamenti aggirabili, segreti, lavori a orario lanciabili da chiunque. Vale per **ogni** sessione: il 5/11 le 33 falle riservate stavano in 8 lenti diverse.
- Una falla aperta non si descrive in nessun file, commit, titolo di sessione, diario o messaggio `send_message`. Una sola eccezione: l'AD manda a S04 i referti privati della D7 con `send_message`, dopo l'approvazione del suo piano, mai nella scheda né nel prompt di `create_session`.
- I dettagli viaggiano solo nelle chat delle sessioni. La loro fonte è la trascrizione della sessione che li ha trovati, non il tuo scratchpad, che si perde se la macchina viene rifatta.
- Le regole esatte per i referti sono al 5.9. La rilettura prima di pubblicare è al 7.5.

**Le prove da cliente vero si scrivono, non si fanno.** Una prova che chiede di usare il sito come un cliente, un negozio, un fattorino o un amministratore veri (un ordine, un modulo, un accesso, un pagamento) va nella batteria della palestra (`prove_per_la_palestra`, 5.6), con passi, dati di prova e risultato atteso. Sul sito vero si guarda solo da visitatore.

**L'asticella.** Un grave o un bloccante vale solo in due casi:
- ha `prova_tipo: "comando"`, con `prova_eseguita: true` ed `esito_prova` non vuoto, e la prova diventa rossa se il difetto c'è;
- oppure ha `prova_tipo: "umano"`, con il perché in `perche_umano`.

`lettura-codice` basta solo per i minori.

**Niente numeri senza fonte.** Ogni numero del referto finale esce da un comando o da un file, citato nei dettagli tecnici.

**Gli orari.** Sempre con l'ora, nel fuso di Piacenza:
```bash
node -e 'import("./cervello/ora-piacenza.mjs").then(m=>console.log(m.timbroOra()))'
```
Il file lanciato da solo non stampa niente. Le date dei nomi dei file vengono da `m.giornoPiacenza()`, mai da `date`: il container è in UTC, e fra mezzanotte e l'una sbaglierebbe giorno.

**Chi ha costruito non collauda.** Chi ha trovato un difetto non lo conferma mai. I controlli che scrivi nella fase 0 sono guardiani: li collauda un subagente `qa` che non li ha scritti, con la skill `collaudo` (3.5).


**Il conto dei token.** Va nel referto, misurato con `node cervello/conto-token.mjs`. Senza argomenti esce 2, e da un container non si vedono i transcript di un altro:
- ogni sessione misura i suoi, con percorsi interi: `--sessione ~/.claude/projects/<progetto>/<id-della-trascrizione>.jsonl --json` per il ciclo principale, `--dir ~/.claude/projects/<progetto>/<id-della-trascrizione>/subagents --json` per i subagenti, `--workflow <runId> --json` per ogni workflow. `<progetto>` e `<id-della-trascrizione>` li trovi con `ls -t ~/.claude/projects/*/*.jsonl | head -1`;
- tu fai lo stesso sui tuoi e sommi.

**Scrittura umana.** Vale per tutto ciò che legge Nicola: chat, referto, PR (`cervello/scrittura-umana.md`). Si misura con `node cervello/si-capisce.mjs`.

## 5. Le regole per ogni sessione figlia


**5.1 Chi sei.**
- Sei la sessione SNN della radiografia in 12 sessioni. Non sei l'AD: non leggere `cervello/MANUALE-AD.md`. Valgono `CLAUDE.md`, le regole del §1 copiate in questo file e queste.
- Nel riquadro dei paletti di `CLAUDE.md` e nel §4 di `CONTESTO_BUSINESS.md` i paletti sono quelli di agosto: valgono quelli di `registro-fatti.json`.
- La sessione dell'AD è `session_015BmpnX3prh5pipxFGzQEeK`. Il commit del sito è `db5164c52e856c0e3eab1c02197ae755fca76eb3`. La cartella è `consegne/audit/2026-11-06-radiografia-12-sessioni/`.
- Nessuno risponde alle tue domande mentre lavori: decidi dentro queste regole, e scrivi i dubbi in `domande_per_nicola`.

**5.2 Il piano.** Parti in modalità piano: puoi solo leggere. Il codice del sito lo scarichi **dopo** l'approvazione, come primo passo. Il piano si basa sulla tua scheda e sulla mappa dei file. Se un comando ti viene negato, non insistere. Il piano dice:
- il perimetro: i flussi e i file che leggerai, presi dalla tua scheda;
- le prove che lancerai, e su quale copia;
- quanti agenti userai in tutto, dentro il tetto della tua scheda, e il motivo se ne chiedi di più. Il tetto conta tutti gli agenti della sessione: cercatori, verificatori e agenti dei workflow;
- quante prove da palestra scriverai, e per quali pagine e indirizzi (5.6);
- cosa NON coprirai, e perché;
- ogni quanto salvi il referto.

**5.3 Il codice.** Dopo l'approvazione:
1. Lancia per primo `node cervello/collega-marketplace.mjs`: il sito è pubblico, basta git. Solo se fallisce chiama `add_repo` per `NicolaeRotaru/mycity` in lettura. `add_repo` chiede un clic a Nicola e ti lascia ferma finché non risponde: scrivilo in chat.
2. Porta la copia su BASE_SITO, e dopo non rilanciare `collega-marketplace.mjs`:
```bash
git -C marketplace fetch --depth 1 origin db5164c52e856c0e3eab1c02197ae755fca76eb3 && git -C marketplace checkout -q --detach FETCH_HEAD && test "$(git -C marketplace rev-parse HEAD)" = "db5164c52e856c0e3eab1c02197ae755fca76eb3"
```
3. Se il commit non si scarica, fermati. Scrivilo in `domande_per_nicola` e avvisa l'AD con `send_message`. Mai analizzare un altro commit.

Sul repo del sito: mai un commit, un ramo o un push.

**5.4 Un solo file.**
- Nel tuo ramo cambi un solo file: `consegne/audit/2026-11-06-radiografia-12-sessioni/referti/SNN.json`.
- I file di prova, le copie, le foto e gli appunti stanno nel tuo scratchpad.
- Salva e spingi il referto ogni 10 difetti o ogni ora, quello che arriva prima, con `"finita": false`. Così uno stop per i limiti non fa perdere niente.
- Il tuo ramo è pubblico appena lo spingi. Prima di ogni push rileggi tutto il referto tranne le schede riservate: i difetti non riservati, `regressioni`, `ricontrolli`, `copertura.non_guardato`, `copertura.file_eseguiti` (anche `comando` ed `esito`), `copertura.file_letti_in_parte`, `domande_per_nicola`, `prove_per_la_palestra` e `conto.nota`. Una prova lanciata per una falla riservata non va in `file_eseguiti` con il suo comando: lì va solo il file, con `comando` ed `esito` uguali a `"nel referto privato"`, e il comando vero va in chat come al 5.9. Se uno ripete una frase di una tua falla riservata, o nomina una rotta, una tabella, una funzione o una riga che compare solo in quella falla, togli quel pezzo oppure segna riservato anche quel difetto.

**5.5 Solo il nuovo.** Prima di scrivere un difetto cercalo in `registro-compatto.txt`, con grep e mai con Read: prima per ogni percorso che citi, poi per due o tre parole del titolo. Se sei nella seconda ondata cercalo anche in `trovati-ondata-1.txt`.
- Se c'è ed è aperto, non è nuovo. Puoi scriverlo solo se porti una prova più forte, con `gia_noto` che cita la chiave.
- Se c'è ma risulta chiuso o riparato, ed è tornato, è una **regressione**. Non va in `difetti` ma in `regressioni`, con la chiave della voce, la prova e l'esito.
- Se la voce è riservata (titolo «Falla di sicurezza…»), la regressione ha `prova` ed `esito_prova` uguali a `"nel referto privato"`, e i dettagli vanno in chat come al 5.9.

**5.6 Il formato del referto.**
```json
{
  "sessione": "S03",
  "base_sito": "db5164c52e856c0e3eab1c02197ae755fca76eb3",
  "aggiornato": "AAAA-MM-GG HH:MM",
  "finita": false,
  "copertura": {
    "file_letti_interi": ["…"],
    "file_letti_in_parte": [{ "file": "…", "righe": "120-180" }],
    "file_eseguiti": [{ "file": "tests/…", "comando": "…", "esito": "…" }],
    "non_guardato": [{ "cosa": "…", "perche": "…" }]
  },
  "difetti": [{
    "id": "S03-001",
    "dimensione": "una delle 24 lenti",
    "titolo": "come lo diresti a voce",
    "severita": "bloccante | grave | minore",
    "file": "percorso:riga · percorso:inizio-fine",
    "descrizione": "cosa succede, con le righe di codice",
    "impatto": "un esempio con giorno, negozio, cifra",
    "fix": "la correzione consigliata",
    "causa_radice": "perché esiste",
    "prova": "il comando o i passi",
    "prova_tipo": "comando | lettura-codice | umano",
    "prova_eseguita": true,
    "esito_prova": "cosa è uscito",
    "perche_umano": null,
    "verificato": true,
    "verificato_da": "chi ha provato a smentirlo e cosa ha detto",
    "gia_noto": null,
    "perimetro_altrui": null,
    "riservato": false
  }],
  "regressioni": [{ "chiave": "dimensione|titolo", "indice": 123, "prova": "…", "esito_prova": "…" }],
  "ricontrolli": [{ "chiave": "dimensione|titolo", "indice": 123, "esito": "ancora_vero | non_piu_vero | cambiato | non_verificabile", "prova": "…", "prova_tipo": "comando | lettura-codice", "prova_eseguita": true, "esito_prova": "…", "nota": "…" }],
  "prove_per_la_palestra": [{ "id": "S03-P001", "funzione": "…", "chi": "cliente | negozio | fattorino | admin | estraneo", "file": "app/…/page.tsx · app/api/…/route.ts", "dati_di_prova": "…", "passi": "…", "atteso": "…", "limite": "…" }],
  "domande_per_nicola": [],
  "conto": { "agenti": 0, "token_sessione": {}, "token_subagenti": {}, "token_workflow": [], "nota": "" }
}
```
- `file` di un **difetto** è uno o più posti separati da « · ». Ogni posto è `percorso:riga` o `percorso:inizio-fine`. Ci sono cinque eccezioni:
  - `live:<indirizzo pubblico>` e `vercel:<rilascio o lavoro>`, solo in S11;
  - `produzione:<oggetto>`, solo in S05 e S11;
  - `stripe:<oggetto>`, solo in S03;
  - `(nel referto privato)`, solo per le riservate.
- `ricontrolli` lo compila solo S01. `indice` serve solo a leggere: la voce si ritrova per `chiave`.
- `conto` lo riempi alla fine con le uscite di `conto-token.mjs` (§1).
- `prove_per_la_palestra`: per ogni pagina e ogni indirizzo interno del tuo perimetro, almeno una prova da fare nella palestra, come un cliente, un negozio, un fattorino, un amministratore o un estraneo. `file` è la pagina o l'indirizzo. `limite` dice dove la prova spinge: tanti utenti insieme, quantità, date, doppio clic, rete lenta, un fornitore che non risponde. Non la fai: la scrivi. In `prove_per_la_palestra`, `file` è uno o più percorsi senza riga, separati da « · », che esistono a BASE_SITO.

**5.7 La verifica dentro la sessione.**
- Chi trova un difetto non lo conferma. Ogni difetto passa da un subagente diverso, del tipo `qa`, che ha il compito di smentirlo e rilancia la prova. Nel dubbio il difetto si scarta.
- Un verificatore prende al massimo 6 minori dello stesso file o flusso. Gravi e bloccanti hanno un verificatore ciascuno, più una seconda lente che ne giudica il peso.
- Le prove con date e orari usano un orologio finto.
- Il Postgres e le prove pesanti seguono le regole del §1: un database per subagente, al massimo due prove pesanti alla volta.

**5.8 Fuori dal tuo perimetro.** Se vedi un difetto che appartiene a un'altra sessione, scrivilo lo stesso con `perimetro_altrui: "SNN"`. Non lo approfondisci.

**5.9 Le falle riservate.** Cos'è una falla lo dice il §1, e vale per ogni sessione. Una falla aperta va nel referto così:
- `riservato: true`;
- `titolo: "Falla di sicurezza da chiudere (<area>): i dettagli restano fuori dal deposito pubblico finché non è chiusa"`, senza numero: il numero R lo dà l'AD;
- `file: "(nel referto privato)"`;
- `dimensione` e `severita` veri;
- `descrizione`, `impatto`, `fix`, `causa_radice`, `prova`, `esito_prova`, `verificato_da` uguali a `"nel referto privato"`;
- `prova_tipo` e `prova_eseguita` veri. Se `prova_tipo` è `umano`, `perche_umano` è `"nel referto privato"`, altrimenti `null`;
- `gia_noto` e `perimetro_altrui` uguali a `null`.

**Dove vanno i dettagli.** Appena una falla è confermata, scrivi subito i suoi dettagli **in un messaggio in chat**, mai in un file, con il suo id `SNN-0xx`: file e righe, come si sfrutta, la prova, il verdetto di chi l'ha verificata, la seconda lente. Nel messaggio finale ripetili tutti.

**5.10 Quando hai finito.**
- Misura il tuo conto dei token come dice il §1, e spingi il referto con `"finita": true`.
- Il tuo ultimo messaggio dice:
  - quanti difetti per gravità, quante regressioni, quanti ricontrolli per esito (solo S01), quante prove da palestra;
  - il commit finale;
  - cosa non hai coperto;
  - i dettagli di tutte le falle riservate.
- Manda lo stesso riassunto **senza** i dettagli riservati alla sessione dell'AD con `send_message`.

## Le 24 lenti della casa `marketplace` e chi le possiede

| Lente | Sessione |
|---|---|
| `architettura` | S12 |
| `sicurezza-auth` | S04 |
| `rls-database` | S05 |
| `pagamenti-stripe` | S02, S03 |
| `privacy-legale` | S09 |
| `performance` | S11 |
| `frontend-ux` | S06, S07 |
| `accessibilita` | S10 |
| `qa-flussi` | S02, S06, S07 |
| `api-backend` | S06, S08 |
| `ai-endpoints` | S04, S12 |
| `dati-analytics` | S08 |
| `deploy-sre` | S11 |
| `layout-responsive` | S10 |
| `coerenza-brand` | S10 |
| `tipografia` | S10 |
| `accessibilita-visiva` | S10 |
| `stati-ui` | S10 |
| `immagini-media` | S10 |
| `mobile-pwa` | S10, S11 |
| `flussi-conversione` | S10 |
| `microcopy` | S10 |
| `navigazione-gerarchia` | S10 |
| `performance-percepita` | S10, S11 |

S01 non ha lenti: ricontrolla le voci aperte del registro.
