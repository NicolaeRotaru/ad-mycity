---
tipo: istruzioni
per: le sessioni che riparano in una campagna della skill `riparazione` (R01…R12)
data: 2026-11-07 09:10
---

# Le regole di chi ripara

## In parole semplici

Questo è il foglio che ogni sessione riparatrice legge prima di cominciare. Dice cosa riparare, quali file
può toccare, come provare ogni riparazione e cosa non fare mai.

Un esempio: una riparazione conta solo se la sua prova diventa rossa quando la correzione si toglie. Un
altro: un file che appartiene a un'altra sessione non si tocca, si scrive cosa servirebbe e lo fa la
regista dopo.

## Cosa cambia per te

Niente da fare: il foglio lo leggono le sessioni. Serve perché le regole siano le stesse a ogni campagna,
invece di riscriverle ogni volta.

## Cosa devi fare

Niente. Le scelte le hai già fatte alla prima fermata della campagna.

## Cosa non ho verificato

Questo foglio nasce il 7/11 e nessuna sessione l'ha ancora usato in una campagna vera: la prima campagna
dirà dove è poco chiaro.

---

## Dettagli tecnici

### Chi sei e dove lavori

Sei il riparatore `RNN` di una campagna. La tua scheda è `<cartella>/schede/RNN.md` nel deposito
`ad-mycity`: dice la casa, il deposito, la base, il tuo ramo, le tue voci, i tuoi file, la tua fascia di
migrazioni e l'id della regista. **Nessuno risponde alle tue domande mentre lavori**: decidi dentro queste
regole, e scrivi i dubbi nel referto (`domande_per_nicola`).

- **Sito:** sei nel deposito `NicolaeRotaru/mycity` alla base della scheda. Le regole e la scheda stanno
  in `ad-mycity`, che cloni accanto, in sola lettura, al commit che ti ha dato la regista:
  `git clone --filter=blob:none https://github.com/NicolaeRotaru/ad-mycity ../ad-mycity && git -C ../ad-mycity checkout <SHA_REGISTA>`.
  Poi, una volta: `npm ci`.
- **Macchina:** sei già in `ad-mycity`. Leggi la skill `cantiere`, che dice come si ripara bene una scheda
  della macchina. Valgono le sue regole sulle prove, più queste.
- Spingi **solo** sul tuo ramo. Mai una PR, mai un'unione, mai `--force`, mai un altro ramo.

### Prima il piano

Prima di toccare il codice scrivi il piano: per ogni voce, il file e la riga da cambiare, la prova che
diventerà rossa, l'ordine (i gravi prima). Mandalo alla regista con `send_message` e **chiudi il turno**.
Riparti quando la regista risponde «approvato», o correggi come ti dice.

### Il metodo, voce per voce

1. Leggi la voce nella scheda. Il testo intero sta nel registro di `ad-mycity`: cercalo con grep nel
   registro compatto `<cartella>/registro-compatto.txt` (una riga per voce: chiave, gravità, stato, file,
   titolo), **mai** aprendo il registro intero. Le voci si trovano per **chiave**, mai per posizione.
2. Controlla che il difetto ci sia ancora sulla base. Se non c'è più: esito `gia_riparato_prima`, e nel
   campo `prova` la riga di codice o il comando che lo dimostra.
3. Se non è codice (una chiave su Vercel, un dato nel database vero, un'impostazione di Supabase o Stripe):
   `non_codice`, con cosa deve fare Nicola nella `nota`.
4. Se serve una scelta di Nicola (un prezzo, una soglia, una regola di business): `scelta_di_nicola`, con la
   domanda in una riga.
5. Se la cura sta in un file che non è tuo: `serve_file_altrui`, con l'elenco `{file, modifica}` esatto. Non
   toccare quel file. **È la regola che il 5/11 non c'era**: 89 file toccati fuori territorio, 16 ricuciti a mano.
6. Altrimenti ripara con **la modifica più piccola che chiude tutta la voce** così com'è scritta. Non
   riscrivere, non abbellire, non cambiare comportamenti che la voce non nomina. Se chiudi solo un pezzo,
   l'esito è `parziale` con `cosa_resta`.
7. **La prova.** Se cambia un comportamento (logica, date, soldi, dati, permessi, stati dell'ordine) scrivi
   una prova che fallisce senza la correzione e passa con la correzione. Per un testo, un'etichetta o uno
   stile basta una prova leggera. Un **grave** o un **bloccante** si chiude solo con una prova `comando`
   eseguita (l'asticella). Le date usano un orologio finto: una prova scritta per il «2 novembre» e
   controllata con l'orologio vero è diventata rossa da sola, il 5/11.
8. **La prova rimessa**, su ogni `riparato`, dopo il commit della voce (C):
   `timeout 540 node ../ad-mycity/cervello/prova-rimessa.mjs --repo . --base C^ --file <i file corretti> --prove <i file di prova> --json`
   (sulla macchina: `node cervello/prova-rimessa.mjs … --comando "node --test {prove}"`). Più file vanno separati
   da una **virgola**, senza spazi: `--file lib/a.ts,lib/b.ts`. L'albero deve essere **pulito**, a parte
   `node_modules`: per questo il referto non si tiene dentro l'albero mentre lavori (vedi «I commit»). Uscita 0 = regge. 1 = la prova non torna rossa togliendo la correzione: non
   è una riparazione. 3 = la prova è rossa per la struttura (un nome che manca), non per il comportamento:
   rimetti il difetto com'è scritto nella voce e guarda. 2 o 4 = condizione sbagliata: sistemala e riprova.
   **Se la correzione ha file nuovi** (una migrazione, un aiutante) mettili in `--file` insieme agli altri: la
   prova toglie tutti i file nuovi insieme, lascia corretti gli altri, e deve cadere sul comportamento. Una
   prova che nomina o importa il file nuovo dà 3: guarda il file, non quello che fa. **Una
   migrazione si prova con le prove SQL:** `--sql mycity_rimessa` al posto di `--comando` (ricostruisce il
   database dalle migrazioni sul disco, con e senza la tua). Così anche una voce chiusa solo con una migrazione
   può essere `riparato`, non più `parziale` per forza (regola del 12/11 sera).
9. Scrivi la voce nel referto **appena finita**, non alla fine: nel file di lavoro `../referto-RNN.json`, fuori
   dall'albero.

### I tuoi file

- Tocchi solo **i tuoi file** (sezione «I miei file» della scheda). Un file nuovo lo puoi creare: se un
  altro ramo crea lo stesso file, la regista lo vede subito.
- **Le prove nuove** portano il tuo nome: `tests/unit/riparazione-rNN-<tema>.test.ts` (sito),
  `tests/sql/rls/riparazione-rNN-<tema>.sql` (prove SQL: è l'unica cartella che leggono `run.sh` e la CI),
  `cervello/test/riparazione-rNN-<tema>.test.mjs` (macchina).
- **Una prova esistente** la modifichi solo se importa **o legge per nome** uno dei tuoi file (per esempio
  `readFileSync(join(ROOT, "app", "x", "page.tsx"))`), e lo dichiari. Un percorso scritto solo in un commento
  non conta. Se la prova usa anche file di altre sessioni dell'onda è comune: non la tocchi, scrivi
  `serve_file_altrui`. Mai spegnerla, saltarla (`.skip`) o indebolirla per farla passare.
- La guardia guarda **il risultato del ramo**: un file toccato per sbaglio e rimesso com'era non ti fa rosso,
  te lo elenca e basta. Un file altrui cambiato davvero resta rosso.
- **Le migrazioni:** mai modificare una migrazione esistente. Se serve, una nuova nella tua fascia
  (`migrations/<numero>_<nome>.sql`). Non si applicano: lo decide Nicola.
- **Macchina:** mai scrivere nei registri condivisi (`cantiere-difetti.json`, `mutanti.json`,
  `malattie.json`, `tetti-lotto.json`) né in `MANUALE-AD.md`, `COMANDI.md`, `CLAUDE.md`. Quello che ci
  andrebbe lo scrivi nel referto: lo riporta la regista.
- **Niente file temporanei** nel ramo: cartelle col punto (`.montati/`, `.prova-…/`), `*.tmp`, `*.bak`.
  Il 5/11 tre sessioni li hanno lasciati.

### I commit

- **Una voce per commit**, e il messaggio comincia con il suo id: `R03-007 il payout aspetta il giorno giusto`.
  Così ogni voce si prova da sola e, se rompe qualcosa, si toglie da sola. Due voci che vivono nella stessa
  riga vanno insieme solo dichiarandolo: `insieme_a` su tutte e due.
- I commit che non sono di una voce (formattazione, lint) portano `RNN-varie`.
- **Il referto.** Mentre lavori lo tieni in `../referto-RNN.json`, **fuori** dall'albero: la prova rimessa vuole
  l'albero pulito. Ogni 10 voci o ogni ora, quello che arriva prima, lo copi in `.riparazione/referto-RNN.json`,
  fai un commit con **solo** il referto (il messaggio è libero) e spingi, con `"finita": false`.

### Il controllo prima di dire «finito»

1. Un subagente diverso, del tipo `qa`, prova a smentire ogni gruppo di riparazioni (al massimo 6 voci per
   subagente, un grave da solo): rilancia la prova, cerca la variante scomoda, guarda se la correzione
   rompe qualcosa accanto. Nel dubbio la voce torna `parziale` o `non_fatto`. Scrivi chi l'ha guardata in
   `verificato_da`.
2. **Sito:** `npm run verify` verde. **Macchina:** `node cervello/cancello-lotto.mjs` verde.
3. Nel referto metti `"finita": true` e `testa` = il tuo **ultimo commit di codice** (quello dopo il quale ci sono
   solo commit del referto). Copialo in `.riparazione/`, fai il commit del solo referto, spingi.
4. Il controllo del programma sul tuo referto, dalla copia di `ad-mycity`:
   `node ../ad-mycity/cervello/riparazione-sessioni.mjs valida-referto .riparazione/referto-RNN.json --cartella ../ad-mycity/<cartella> --git . --ramo HEAD`
   (sulla macchina, senza `../ad-mycity/`). Deve essere **verde** (uscita 0). Finché il referto non è finito il
   controllo esce ⚪ «in attesa» (uscita 3): è normale, ma non basta per dire «finito».
5. Manda alla regista con `send_message` una riga per esito («31 riparati, 4 parziali, 2 serve_file_altrui,
   1 scelta di Nicola»).

### Il referto `.riparazione/referto-RNN.json`

```json
{
  "sessione": "R03",
  "aggiornato": "2026-11-08 10:30",
  "finita": false,
  "testa": "<l'ultimo commit del ramo>",
  "verifica": { "comando": "npm run verify", "esito": "verde", "nota": "" },
  "voci": [
    { "id": "R03-001", "chiave": "<la chiave della scheda, uguale>", "esito": "riparato",
      "commit": "<sha>", "file_toccati": ["lib/…"], "prova_file": ["tests/unit/riparazione-r03-….test.ts"],
      "prova_comando": "npx vitest run tests/unit/riparazione-r03-….test.ts", "prova_tipo": "comando", "prova_eseguita": true,
      "rimessa": { "esito": "regge", "uscita": 0, "comando": "node …/prova-rimessa.mjs --repo . --base <sha>^ …" },
      "copre_tutta_la_voce": true, "cosa_ho_fatto": "una o due frasi", "verificato_da": "qa: cosa ha provato" },
    { "id": "R03-002", "chiave": "…", "esito": "serve_file_altrui",
      "serve_file_altrui": [{ "file": "app/…", "modifica": "cosa cambiare, esatto" }] },
    { "id": "R03-003", "chiave": "…", "esito": "parziale", "cosa_resta": "…" },
    { "id": "R03-004", "chiave": "…", "esito": "gia_riparato_prima", "prova": "lib/…:42 controlla già …" },
    { "id": "R03-005", "chiave": "…", "esito": "scelta_di_nicola", "domanda": "…" },
    { "id": "R03-006", "chiave": "…", "esito": "non_codice", "nota": "cosa deve fare Nicola" },
    { "id": "R03-007", "chiave": "…", "esito": "non_fatto", "nota": "perché" }
  ],
  "nuovi_difetti_visti": [
    { "titolo": "come lo diresti a voce", "dimensione": "una delle dimensioni del registro", "severita": "minore",
      "file": "percorso:riga", "descrizione": "…" }
  ],
  "domande_per_nicola": [],
  "conto": { "agenti": 0, "nota": "" }
}
```

A referto finito ogni voce della scheda deve comparire, anche quelle non fatte. Un difetto nuovo trovato
strada facendo non si ripara se è fuori dai tuoi file: va in `nuovi_difetti_visti`.

### Il deposito è pubblico

Una falla di sicurezza NUOVA (permessi, dati esposti, accessi, pagamenti aggirabili) non si descrive nel
referto né nei commit. Nel referto: `"riservato": true`, titolo generico «Falla di sicurezza da chiudere
(<area>): i dettagli restano fuori dal deposito pubblico finché non è chiusa», `"file": "(nel referto
privato)"`, nessuna descrizione. I dettagli li scrivi solo nel messaggio finale alla regista.

### Se qualcosa ti blocca

Se un permesso, un controllo della sessione o un accesso negato ti ferma (un comando rifiutato, `ad-mycity` che non
si legge, una richiesta di approvazione), non aspettare: nessuno la vede. Manda subito alla regista con `send_message`
l'errore esatto, e intanto vai avanti per un'altra strada. Un comando che non puoi lanciare lo lancia la regista. Il
12/11 una sessione è rimasta ferma quattro ore in attesa di un clic che nessuno poteva dare.

### Cosa non fai mai

Mettere il sito online, scrivere sul database vero, applicare migrazioni, cambiare prezzi o commissioni,
scrivere a clienti o negozi veri, leggere o stampare chiavi. Se una voce lo richiede, l'esito è
`non_codice` o `scelta_di_nicola`.
