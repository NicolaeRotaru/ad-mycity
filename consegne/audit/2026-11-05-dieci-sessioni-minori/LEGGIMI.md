# Le dieci sessioni sui difetti minori — regole comuni (5/11/2026)

Nicola ha chiesto: «apri 10 sessioni e risolvi almeno 600 difetti minori del marketplace».
Questa cartella sta nel deposito dell'AD (`NicolaeRotaru/ad-mycity`, ramo `claude/youthful-gates-blkxmk`,
cartella `consegne/audit/2026-11-05-dieci-sessioni-minori/`). Il lavoro si fa nel deposito del sito
(`NicolaeRotaru/mycity`), ognuna sul suo ramo.

- `piano.json` → `sessioni.SNN.schede`: le tue schede (id, titolo, file, file di altre sessioni citati).
- La scheda intera (descrizione, impatto, fix proposto, prova proposta) sta nel registro dell'AD:
  `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json` → `problemi[id]` (l'id è l'indice).
  Leggila così, una scheda alla volta o a gruppi:
  `node -e 'const r=require("./MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");for(const i of process.argv.slice(1))console.log(i,JSON.stringify(r.problemi[i],null,1))' 123 456`
- `territori.json`: il territorio di file di ogni sessione e i numeri di migrazione che può usare.
Un'undicesima sessione, l'AD, alla fine controlla tutto, unisce i dieci rami e apre la richiesta di unione.
Nessuno risponde alle tue domande mentre lavori: decidi tu dentro queste regole, e scrivi i dubbi nel referto.

## Lo scopo

Ripara **almeno 60** delle tue schede, e poi continua finché ne restano di riparabili.
Il numero vale solo se è vero: una scheda conta come «riparato» solo se in questo ramo hai cambiato il codice
e il difetto, così com'è scritto nel titolo, non c'è più.

## Il metodo, scheda per scheda

1. Leggi la scheda. Apri il file alle righe citate (letture mirate, mai il file intero se è grande).
2. Controlla che il difetto ci sia ancora sul codice di oggi. Le schede possono essere vecchie.
   - Se non c'è più: esito `gia_riparato`, e nel campo `prova` la riga di codice che lo dimostra.
3. Se non è codice (una chiave su Vercel, un dato nel database vero, un'impostazione di Supabase o Stripe):
   esito `non_codice`, con cosa deve fare Nicola.
4. Se serve una scelta di Nicola (un prezzo, una commissione, una soglia, una regola di business non scritta):
   esito `scelta_di_nicola`, con la domanda da fargli in una riga.
5. Altrimenti ripara con la **modifica più piccola che chiude tutto il difetto**. Non riscrivere, non abbellire
   il resto del file, non cambiare comportamenti che la scheda non nomina.
6. **La prova.** Se cambia un comportamento (logica, date e orari, soldi, dati, permessi, stati dell'ordine),
   scrivi una prova che fallisce senza la correzione e passa con la correzione. Provalo davvero: togli la
   correzione, la prova diventa rossa; rimettila, torna verde. Le prove nuove vanno in file nuovi:
   `tests/unit/minori-sNN-<tema>.test.ts` (sNN = la tua sessione, minuscolo). Per un testo, un'etichetta,
   un attributo di accessibilità o uno stile basta una prova leggera (render del componente, o lettura del
   sorgente che controlla la cosa giusta), ma se puoi fare una prova di comportamento, falla.
7. Segna l'esito nel referto (vedi sotto) appena hai finito la scheda, non alla fine.

Lavora in ordine di file (le schede in `piano.json` sono già ordinate così): più schede sullo stesso file si riparano insieme.

## Il territorio

- Tocca i file dei tuoi prefissi in `territori.json` (vince il prefisso più lungo).
- Un file di un'altra sessione lo tocchi solo se il difetto non si chiude senza, con la modifica minima, e lo
  scrivi in `file_altrui_toccati`. L'AD ricuce i conflitti all'unione.
- **Le prove esistenti** (`tests/...`): se la tua correzione cambia un comportamento che una prova vecchia
  controlla, aggiorni quella prova e lo dichiari. Mai spegnere, saltare (`.skip`) o indebolire una prova per
  far tornare il verde.
- **Migrazioni:** mai modificare una migrazione esistente. Una nuova solo se indispensabile, solo coi numeri
  del tuo intervallo (`migrazioni_nuove` in `territori.json`), e la dichiari nel referto: Nicola le applica a mano.
- **`messages/it.json` e `messages/en.json`:** solo se indispensabile, solo aggiunte.
- La cartella `.minori/` del sito contiene solo il tuo referto: non metterci altro.

## Cosa non si fa mai (sono azioni rosse, firma di Nicola)

- Nessun deploy, nessuna scrittura su database, Supabase, Vercel, Stripe o servizi veri.
- Nessun cambio a prezzi, commissioni, costi di consegna, soglie e regole decise da Nicola.
- Nessuna richiesta di unione (PR), nessun merge su `main`, nessun force-push, nessuna riscrittura della storia.
- Nessun segreto, chiave o dato personale nel codice o nei messaggi.

## Le regole del lancio (contesto, da `registro-fatti.json` dell'AD)

- Il sito dev'essere pronto entro domenica 15/11/2026. Al lancio c'è un negozio solo, Pane Quotidiano (il forno).
- Si paga in contanti alla consegna e con la carta; la carta resta spenta (interruttore `CARTA_ACCESA`) finché
  Stripe non ha verificato il conto del negozio.
- Consegna Nicola in bici, fino a 5 km dal negozio, 7 fasce al giorno, al massimo 5 ordini per fascia.
- Il ritiro in negozio è acceso dal lancio, gratis per il cliente.
- Commissione MyCity: 10% sul venduto, su tutti gli ordini. Non si tocca.
- Rimborso di un ordine in contanti già pagato: passa dal reclamo, Nicola fa il bonifico a mano.
- Restano spente al lancio: AI per i negozi, codici sconto, newsletter, inviti e punti, e altre funzioni in
  `lib/funzioni-al-lancio.ts`. Un difetto in una funzione spenta si ripara lo stesso, se è codice.

## I commit

- A gruppi di 5-10 schede. Titolo in italiano, come lo diresti a voce, che dice cosa cambia per chi usa il sito
  («Il carrello non perde più la nota per il fattorino»). Niente codici, numeri di scheda o percorsi nel titolo:
  gli id delle schede vanno nel corpo del commit, una riga «Schede: 123, 456, …».
- Chiudi ogni messaggio di commit con le righe di attribuzione che il tuo ambiente ti indica.
- Dopo ogni commit: `git push -u origin <il tuo ramo>`. Se la rete cade, riprova fino a 4 volte (2s, 4s, 8s, 16s).

## Prima di finire

1. `npm run verify` (typecheck + lint + test) deve essere verde. Se una prova era già rossa su `main` prima di te,
   scrivilo nel referto con il nome della prova e non toccarla.
2. **Un controllo che non sia tuo:** lancia UN agente revisore (subagent) sul tuo diff
   (`git diff origin/main...HEAD`), col mandato di distruggere: trovare correzioni incomplete, regressioni,
   prove che passerebbero anche senza la correzione. Ripara quello che trova e che regge, poi riesegui `verify`.
3. Scrivi `.minori/referto-SNN.json` nel deposito del sito, sul tuo ramo, fai commit e push.
   L'AD lo legge da lì e toglie la cartella `.minori/` all'unione.

## Il referto `.minori/referto-SNN.json`

```json
{
  "sessione": "S01",
  "ramo": "claude/youthful-gates-blkxmk-m01",
  "commit_finale": "<sha>",
  "verify": { "typecheck": "verde|rosso", "lint": "verde|rosso", "test": "verde|rosso", "note": "..." },
  "revisore": "cosa ha trovato il revisore e cosa hai corretto",
  "riepilogo": { "riparato": 0, "parziale": 0, "gia_riparato": 0, "non_codice": 0, "scelta_di_nicola": 0, "non_fatto": 0 },
  "migrazioni_nuove": ["migrations/2NN_....sql"],
  "schede": [
    { "id": 123, "esito": "riparato|parziale|gia_riparato|non_codice|scelta_di_nicola|non_fatto",
      "cosa_ho_fatto": "una o due frasi", "prova": "tests/unit/minori-s01-x.test.ts › nome della prova, oppure la riga che lo dimostra",
      "rossa_senza_correzione": true, "file_toccati": ["..."], "file_altrui_toccati": [], "nota": "" }
  ],
  "nuovi_difetti_visti": [ { "titolo": "...", "file": "...:riga", "gravita": "bloccante|grave|minore", "descrizione": "..." } ]
}
```

Ogni tua scheda di `piano.json` deve comparire nel referto, anche quelle non fatte (`non_fatto`, con il perché).
`parziale` = hai chiuso solo un pezzo: scrivi in `nota` cosa manca. Un difetto nuovo trovato strada facendo
non si ripara se è fuori dal tuo territorio: va in `nuovi_difetti_visti`.

**Il deposito è pubblico.** Una falla di sicurezza NUOVA (permessi, dati esposti, accessi, pagamenti aggirabili)
non si descrive nel referto né nei commit: nel referto scrivi solo l'area e la gravità («falla di sicurezza
nelle rotte admin, grave»). I dettagli (file, righe, come si sfrutta) li scrivi solo nel messaggio finale della
tua sessione, che l'AD legge dalla trascrizione, e non nel deposito.

## Quando hai finito

Il tuo ultimo messaggio nella sessione dice: quante schede per esito, il commit finale, l'esito di `verify`,
e gli eventuali dettagli delle falle nuove. Se hai lo strumento `send_message`, manda lo stesso riassunto
alla sessione dell'AD `session_015BmpnYc6Lwwvbi6eTWT4qm`.
