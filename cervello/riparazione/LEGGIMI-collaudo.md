---
tipo: istruzioni
per: le sessioni che collaudano in una campagna della skill `riparazione` (K01…K04)
data: 2026-11-07 09:20
---

# Le regole di chi collauda

## In parole semplici

Questo è il foglio che ogni sessione collaudatrice legge prima di cominciare. Il suo compito è provare a
dimostrare che le riparazioni di altre sessioni **non** reggono. Se non ci riesce, la riparazione conta.

Un esempio: per ogni riparazione un programma rimette il difetto e guarda se la prova diventa rossa. Poi,
su tutti i gravi e su un campione dei minori, un agente guarda se la voce è chiusa davvero tutta e se la
correzione ha rotto qualcosa accanto.

## Cosa cambia per te

Niente da fare: il foglio lo leggono le sessioni. Serve perché la verifica non stia più tutta sulla regista,
due agenti alla volta: il 6/11 quella strada è costata circa 6 ore.

## Cosa devi fare

Niente. Le scelte le hai già fatte alla prima fermata della campagna.

## Cosa non ho verificato

Le sessioni di collaudo nascono il 7/11: il loro costo e il loro tempo li misura la prima campagna vera.

---

## Dettagli tecnici

### Chi sei e dove lavori

Sei il collaudatore `KNN`. La regista ti ha detto quali riparatori guardi (`R…`) e la cartella della
campagna (`<cartella>`). Sei nel deposito `ad-mycity` al commit della regista: è la copia **fissata** di
`cervello/prova-rimessa.mjs`, che nessun riparatore ha potuto toccare. **Non hai mai riparato niente di
quello che guardi**, e non lo ripari adesso: tu giudichi.

- I referti dei riparatori te li copi in una cartella tua, letti alla **punta** del ramo del riparatore, che la
  regista ti dà insieme alla testa. La testa è l'ultimo commit di **codice**: il referto finito sta sempre
  **dopo** di lei, quindi alla testa troveresti un referto vecchio o nessun referto.
  `git -C ../marketplace fetch origin <ramo del riparatore> && mkdir -p ../referti && git -C ../marketplace show <punta>:.riparazione/referto-RNN.json > ../referti/RNN.json`
  (macchina: lo stesso, senza `-C ../marketplace`). Il programma li legge con `--referti ../referti`, e dà rosso se
  un referto non è finito: si collauda solo il referto finito.
- **Sito:** cloni il sito accanto e lo fermi sui due commit che servono, mai sul nome di un ramo:
  `git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity ../marketplace && git -C ../marketplace fetch origin <BASE> <punta del riparatore>`,
  poi una volta `cd ../marketplace && npm ci`.
- **Macchina:** il bersaglio è `ad-mycity` stesso: `git fetch origin <ramo del riparatore>`, e lavori in
  una copia separata (worktree), mai nella tua.
- **Una copia di lavoro per ogni esecutore in parallelo**, mai la stessa (lezione del 1/11: due collaudatori
  nella stessa cartella si sovrascrivono): `git -C ../marketplace worktree add ../wt-RNN --detach <testa> && ln -s "$(cd ../marketplace && pwd)/node_modules" ../wt-RNN/node_modules`.
- Spingi **solo** il tuo referto, `<cartella>/collaudi/KNN.json`, sul tuo ramo. Nient'altro.

### Le regole delle sessioni (regola 11 di `cervello/sessioni-insieme.md`, Nicola 13/11 alle 13:30)

- Lo stop, la quota, la sicurezza e i soldi li mandi alla regista con `send_message` e `priority: "now"`. A un
  messaggio urgente rispondi subito, con una riga.
- Una decisione di Nicola che ti arriva la giri alla regista nello stesso turno. Se aspetti un suo clic, lo dici
  subito alla regista.
- Se `get_session` senza id mostra uso extra o un blocco della quota, lo scrivi subito alla regista.
- A 400 mila token di storia apri da te la tua sessione 2.0 (come nel punto 2 di «Giri brevi» qui sotto).
- Lavori solo con ultracode acceso: se `get_session` non dice `is_ultracode_active: true`, non cominci e lo dici
  alla regista.
- Il costo lo leggi da `usage.cost_usd` di `get_session`, mai a stima.

### Giri brevi, codice giusto (regola del 12/11 notte)

**Il database vero non si tocca, nemmeno per leggerlo.** Mai gli strumenti di Supabase, Vercel o Stripe: né tu né
i subagenti che lanci. Nell'onda 1 un subagente ha letto il database di produzione. Scrivi la regola nel mandato di
ogni subagente, con queste parole: «mai interrogare il database di produzione, né gli strumenti di Supabase, Vercel
e Stripe». Un lucchetto che si mette da sola non c'è: `ad-mycity` vieta di scrivere `.claude/settings.local.json`
(radiografia del 12/11 notte). Non provare a scriverlo, nemmeno da Bash. La regista controlla a ogni giro che nella
tua sessione non ci siano chiamate a quegli strumenti: alla prima ti interrompe.

Il conto dell'onda 1: i collaudatori sono costati da 28 a 41 $. Gran parte era la loro storia (440-480 mila token)
riletta a ogni passo e riscritta dopo ogni attesa. Inoltre in K02 un qa ha rischiato di provare codice spostato nel
frattempo da altri. Quindi:

1. **Tu resti leggero.** Il lavoro sulle voci lo fanno subagenti `qa` nuovi, al massimo 6 voci ciascuno e un grave
   da solo, con un rapporto corto: il verdetto, più ogni difetto con file e riga. Le uscite lunghe stanno in un file
   in `/tmp`. **I revisori si lanciano tutti insieme in primo piano**, nello stesso messaggio: così non ti svegliano
   uno alla volta. Ognuno nella sua copia (punto 3) e col suo database (punto 4): insieme, mai nella stessa cartella.
2. **Un giro di ricollaudo** (dopo una correzione del riparatore) lo fanno subagenti nuovi. Ricevono solo il referto
   alla punta, le voci rimandate e il tuo verdetto di prima, letto da `collaudi/KNN.json`. A 400 mila token di
   storia (lo leggi da te con `get_session`) salvi e spingi il collaudo, e apri tu il collaudatore 2.0 sullo stesso
   ramo, che riparte da quel file: come il punto 6 del foglio del riparatore (Nicola, 13/11 alle 13:30).
3. **Il codice è quello dichiarato.** Ogni esecutore ha la sua copia allo SHA esatto (`worktree add --detach`). Prima
   di lanciare una prova controlla `git -C ../wt-RNN rev-parse HEAD`: deve essere il commit che stai provando. Se no,
   fermati e rifai la copia.
4. **Il database di prova è tuo.** Ogni esecutore usa un database locale con un nome suo (per esempio
   `mycity_k01_r03`), creato da zero dalle migrazioni o copiato da un modello pulito. Mai un database che un altro
   sta usando: dà prove false.
5. **Al massimo 12 subagenti in tutto** (regola del 13/11), anche in ultracode. Le due lenti su soldi, dati e
   permessi restano, perché sono il controllo. Oltre il tetto ti fermi e lo scrivi alla regista.
6. **Il verify completo** lo rilancia chi consegna, legato allo SHA (`verifica.testa` nel referto). Tu rilanci le
   prove delle voci e la prova rimessa. Il verify completo lo rifai solo se `verifica.testa` manca, o non è la testa:
   `applica` non lascia chiudere un referto così, ma se ti arriva il paracadute sei tu.

### Passo 1 — Su ogni voce, il programma

Per ogni voce `riparato` o `parziale` del referto, con C = il suo commit:

1. `git -C ../wt-RNN checkout --quiet --detach C` (l'albero deve essere pulito, a parte `node_modules`);
2. `timeout 540 node cervello/prova-rimessa.mjs --repo ../wt-RNN --base C^ --file <i file della voce> --prove <le sue prove> --json`
   (più file separati da una virgola, senza spazi)
   (macchina: aggiungi `--comando "node --test {prove}"`; voci SQL: `--sql <il tuo database>`, per esempio
   `--sql k01_r03_rimessa`, su un Postgres locale: ricostruisce il database con e senza la migrazione. `apply.sh` e
   `run.sh` da soli non tolgono la correzione e sono verdi qualunque cosa faccia: il programma rifiuta un «regge»
   che non viene da `prova-rimessa.mjs`, e se il riparatore ha usato `--sql` lo pretende anche da te);
3. l'uscita va nel collaudo, col comando esatto:
   - 0 → si passa al giudizio;
   - 1 → `non_regge`: togliendo la correzione la prova non diventa rossa;
   - 2 → sistema la condizione (albero sporco, commit che manca) e riprova **una** volta, poi `non_regge` col perché;
   - 3 → la prova è rossa per la struttura: rimetti il difetto com'è scritto nella voce e guarda. Se non diventa
     rossa, `non_regge`;
   - 4 → fermati, `git checkout HEAD -- <file>`, scrivi cosa è successo.

### Passo 2 — Il giudizio

Il giudizio lo danno subagenti del tipo `qa`, con il mandato di **smentire**. Le due lenti della skill
`collaudo`:
- **chiude_tutta** — la voce, così com'è scritta nel registro, è chiusa tutta? O solo un pezzo?
- **nata_rotta** — la correzione rompe qualcosa accanto? Gira davvero sul sito, o solo nella prova?

Chi ha un giudizio pieno:
- **tutti** i gravi e i bloccanti, uno per uno. Dove ci sono soldi, dati o permessi, due subagenti diversi,
  uno per lente;
- **tutti** i `gia_riparato_prima`: chiudono una voce senza cambiare codice, quindi la riga citata deve
  mostrare il difetto assente **alla base**;
- un **campione** dei minori di ogni riparatore: tutti quelli sui file che legano molte voci, più almeno il
  30% degli altri (minimo 5; tutti se sono 5 o meno). I minori a gruppi di 6 al massimo per subagente.

Quanti ne mancano te lo dice il programma: lancia
`node cervello/riparazione-sessioni.mjs valida-collaudo <cartella>/collaudi/KNN.json --cartella <cartella> --referti ../referti --json`
sulla tua bozza. Nella riga `campioni` trovi per ogni riparatore quanti ne servono, quanti ne hai guardati e quali
minori sui file che legano non hai ancora guardato (`hub_mancanti`). **La regola del campione la ricalcola il
programma**: la tua parola «accettato» non conta, e se scrivi accettato quando non lo è il controllo è rosso.

**Nel dubbio la voce non regge.** Chiudere un difetto vero lo nasconde; lasciarne aperto uno riparato costa
solo un altro sguardo.

### Il collaudo `<cartella>/collaudi/KNN.json`

```json
{
  "collaudatore": "K01",
  "riparatori": ["R01", "R02", "R03"],
  "aggiornato": "2026-11-08 12:00",
  "finita": false,
  "voci": [
    { "id": "R01-001", "chiave": "<la chiave della scheda>", "verdetto": "regge", "giudizio": "pieno",
      "lenti": ["chiude_tutta", "nata_rotta"], "rimessa": { "uscita": 0, "comando": "timeout 540 node cervello/prova-rimessa.mjs …" },
      "nota": "cosa ho provato a rompere" },
    { "id": "R01-014", "chiave": "…", "verdetto": "regge", "giudizio": "nessuno",
      "rimessa": { "uscita": 0, "comando": "…" } },
    { "id": "R01-020", "chiave": "…", "verdetto": "non_regge", "giudizio": "pieno",
      "lenti": ["chiude_tutta", "nata_rotta"], "rimessa": { "uscita": 0, "comando": "…" },
      "nota": "chiude il caso del contante ma non quello della carta, che la voce nomina" }
  ],
  "campione": { "R01": { "accettato": true } }
}
```

I verdetti: `regge | parziale | non_regge | rompe_altro`. Ogni voce `riparato`, `parziale` o
`gia_riparato_prima` dei tuoi riparatori deve comparire. Salva e spingi ogni 20 voci, con `"finita": false`.

### Prima di dire «finito»

1. `valida-collaudo … --referti ../referti` verde (uscita 0) sulla versione finale, con `"finita": true`.
2. `"finita": true`, spingi, e manda alla regista con `send_message` una riga per riparatore («R01: 28
   reggono, 3 non reggono, campione accettato»), più le voci `rompe_altro` con il perché.
3. Spegni quello che hai acceso (un server di prova, un Postgres) e togli le copie di lavoro
   (`git worktree remove`).

### Se qualcosa ti blocca

Se un permesso, un controllo della sessione o un accesso negato ti ferma (un comando rifiutato, `ad-mycity` che non
si legge, una richiesta di approvazione), non aspettare: nessuno la vede. Manda subito alla regista con `send_message`
l'errore esatto, e intanto vai avanti per un'altra strada. Un comando che non puoi lanciare lo lancia la regista. Il
12/11 una sessione è rimasta ferma quattro ore in attesa di un clic che nessuno poteva dare.

### Cosa non fai mai

Riparare tu una voce, toccare i rami dei riparatori, mettere il sito online, scrivere sul database vero.
**Interrogare il database vero, anche solo in lettura** (gli strumenti Supabase, `psql` verso l'indirizzo vero):
nell'onda 1 un subagente l'ha fatto. Le prove girano sul Postgres locale, e questa riga va nel mandato di ogni
subagente che lanci.
I dettagli di una falla riservata non vanno nel collaudo: solo nel messaggio alla regista.
