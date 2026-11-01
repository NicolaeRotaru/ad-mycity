---
data: 2026-11-01 14:20
sessione: S5 · rilascio, copie ed email
pr: https://github.com/NicolaeRotaru/mycity/pull/279
---

# Sessione S5 — referto dell'ondata 9 (l'ondata 10 non è partita)

## In parole semplici
Il piano mi dava due ondate: la 9 con 7 difetti, la 10 con 6. Ho fatto la 9 e mi sono fermata prima della 10.
Il motivo è il freno sul tetto settimanale: prima della seconda ondata lo stato doveva essere «allowed», ed era «allowed_warning».

Dei 7 difetti dell'ondata 9:
- 4 si chiudono con il codice nuovo e una prova che gira;
- 3 restano fermi, perché si chiudono solo con impostazioni di GitHub e di Vercel che può fare solo Nicola.

Tutto il lavoro è in una richiesta di unione sul sito, la #279. La sua base è il ramo della sesta, non main.

## Cosa cambia per te
- **Il ritorno indietro dopo un rilascio rotto.** Non può più rimettere online un rilascio già scartato. Esempio:
  - martedì il rilascio X è rotto e si torna al rilascio W;
  - mercoledì esce Y, e anche Y è rotto;
  - prima, a volte, si tornava a X; adesso si torna a W, oppure il lavoro finisce rosso e chiede di farlo a mano.
- **Il controllo che confronta il database vero col codice.** Adesso dice quale dei due guasti è successo:
  - «non mi collego» esce con 1;
  - «mancano migrazioni» esce con 2.
  - Prima uscivano tutti e due con 1, e un rosso di rete sembrava uguale a un database rimasto indietro.
- **L'esportazione CSV di ordini e utenti.** Ora passa da un modulo solo invece che da due copie.
  - Il file del commercialista è uguale a prima, byte per byte, su dati normali: il collaudo l'ha provato su 400 casi inventati, e 400 su 400 sono usciti uguali.
  - Cambia solo il nome del file quando il filtro ha accenti o simboli. Esempio: «Città» dava `...-citt-.csv`, ora dà `...-citta.csv`.
- **I documenti d'identità orfani.** C'è una potatura nuova per le copie nel secchio `kyc-docs` che nessun profilo usa più.
  - **Oggi però non gira:** va agganciata alla notte in un file che appartiene a un'altra sessione.

## Cosa devi fare
Le tre impostazioni sotto vanno fatte **in questo ordine**. Al contrario, il sito smette di aggiornarsi.
1. **I segreti di Vercel su GitHub.** Si mettono in GitHub → Settings → Secrets and variables → Actions. Sono quattro:
   - `VERCEL_TOKEN`, da Vercel → Account Settings → Tokens;
   - `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`, da Vercel → progetto → Settings → General, in fondo;
   - `VERCEL_AUTOMATION_BYPASS_SECRET`, consigliato.
   - Serve anche `SUPABASE_DB_URL` con la riga del «Session pooler»: c'è già, il controllo notturno si collega dal 24/10.
2. **Il riallineamento del database, una volta sola, a mano.** Il 31/10 il controllo diceva «4 migrazioni non applicate». Si fa con `docs/migrazioni-baseline-produzione.md` del sito.
3. **Spegnere il rilascio automatico.** Solo dopo i punti 1 e 2: in `vercel.json` del sito, `"main": true` diventa `"main": false`. Te lo preparo io in una richiesta a parte, quando mi dici che 1 e 2 sono fatti.
4. **La regola «Main».** È a parte e si fa quando vuoi. In GitHub → Settings → Rules → Rulesets → «Main»:
   - aggiungi il bersaglio «Include default branch»;
   - lascia il controllo obbligatorio «Main»;
   - metti «Active».
   - Poi controlla con `gh api repos/NicolaeRotaru/mycity/rulesets/16879481 | node scripts/controlla-regola-main.mjs`: deve dire ✅.

La mia raccomandazione: fai 1 e 4 subito, perché costano pochi minuti; 2 e 3 subito dopo.
Finché il punto 3 non è fatto, ogni unione su main va in produzione senza aspettare i controlli. È già successo il 1/9.

## Cosa non ho verificato
- Le risposte vere dell'API di Vercel: il ritorno indietro l'ho provato con strumenti finti.
- Il database vero: non l'ho toccato, quindi non so quanti documenti orfani ci sono davvero nel secchio.
- La pagina «Esporta CSV» non l'ho cliccata nel browser. Le prove e i tipi passano.
- Il controllo «radiografia mentre riparo» resta rosso. Vuole che io registri le schede dei difetti visti nel registro del sito, ma quel registro non è mio. Le schede sono qui sotto, e le registra la sesta.

---
**Dettagli tecnici**

**Il rilascio — `.github/workflows/deploy-dopo-ci.yml`, commit 91f15fd**
- *Ritorno indietro al rilascio scartato* — **chiuso**.
  - In `scripts/prova-di-fumo.mjs`, `rilascioDaTornare`: col dominio già sul commit che esce e 2 o più altri commit, la risposta è null.
  - Prova: `npx vitest run tests/unit/il-ritorno-indietro-torna-a-quello-che-usano-i-clienti.test.ts`. Con il difetto rimesso (`candidati[0]`), 3 prove su 9 diventano rosse.
- *Il controllo di deriva non si è mai collegato* — **chiuso**.
  - La causa (il segreto IPv6) l'aveva già riparata Nicola.
  - La prova nuova esegue lo script vero con un `pg` finto: ENETUNREACH esce 1, due migrazioni mancanti escono 2, tutto applicato esce 0.
  - Prova: `npx vitest run tests/unit/la-deriva-distingue-non-mi-collego-da-mancano-migrazioni.test.ts`.
  - Tutti e 4 i chiamanti trattano qualsiasi uscita diversa da 0 come rosso.
- *prova-rimessa sul pacchetto:* regge, esce 0.
- *Ogni unione su main pubblica senza CI · il rilascio non applica le migrazioni · la regola spenta* — **fermi per una scelta di Nicola** (vedi sopra).
- *Il giro di correzione annullato.* Il secondo giro sul ritorno indietro (122aa6c) toglieva il ripiego sull'elenco anche quando il dominio non si sa. Rompeva `tests/unit/il-ritorno-indietro-dice-a-quale-rilascio-tornare.test.ts` (campo «precedente» vuoto), quindi l'ho annullato con c62953b.
  - Restano due **riserve minori** del collaudo:
    - (A) con un solo altro commit fra i 20 rilasci letti, e W uscito dalla finestra, si torna al rotto;
    - (E) un dominio che risponde senza sha restituisce il rilascio che esce.
  - Le chiude il punto 3 per Nicola, oppure salvare l'ultimo rilascio che ha passato la prova di fumo.

**L'esportazione CSV — `lib/admin/esporta-utenti.ts` + `lib/ordini/esporta-ordini.ts`, commit 78e30b6 e 55bc70e** — **chiuso**.
- Il modulo comune è `lib/admin/esporta-csv.ts`: `raccogliAFinestre<T>`, `nomeFileCsv`.
- Le righe senza id restano fuori dal file, ma si contano: il file si dichiara PARZIALE con un avviso nella prima riga.
- Prova: `npx vitest run tests/unit/le-due-esportazioni-csv-sono-una-sola.test.ts`. Sul codice di base 5 prove su 8 erano rosse.
- prova-rimessa: regge, esce 0.
- Il collaudo ha rimesso 7 difetti a mano: tutti presi.

**Le copie orfane dei documenti — `lib/privacy/potature-ritenzione.ts`, commit 0b5457b e 3d56e43** — **chiuso nel codice, non agganciato**.
- Il modulo è `lib/privacy/orfani-kyc.ts`. Cosa fa:
  - elenca il secchio a pagine e legge i riferimenti nelle 6 colonne di `profiles`, a pagine «a chiave»;
  - prima di togliere un file rilegge il profilo della sua cartella;
  - toglie solo file più vecchi di 7 giorni, al massimo 200 a notte;
  - si ferma se una lettura fallisce o torna vuota.
- Prove:
  - `tests/unit/le-copie-orfane-dei-documenti-d-identita-non-restano-per-sempre.test.ts`;
  - `tests/unit/un-documento-vivo-non-sparisce-se-un-altro-profilo-esce-dalla-lista.test.ts`, la prova del collaudatore, rossa su 0b5457b.
- prova-rimessa dà «rosso_strutturale» (uscita 3): alla base il modulo non esisteva. Il collaudo ha rimesso 7 difetti di comportamento: 6 rossi, e il settimo è fermato da un secondo controllo.

**Difetto nato nell'ondata e già chiuso nello stesso giro** (grave):
- `orfani-kyc.ts`, `leggiRiferimenti`: la paginazione con offset su un insieme filtrato poteva saltare un profilo e cancellarne i documenti vivi.
- Il secchio `kyc-docs` non è nel backup, quindi la perdita non si riparerebbe. Chiuso in 3d56e43.

**Fuori territorio**
- `app/api/cron/process-deletions/route.ts`, circa alla riga 123: usare `eseguiPotature(admin as unknown as ClientePotature, logger, adesso, potatureNotturne(adesso))`, con `const adesso = Date.now()`. Il ramo «conta senza cancellare» resta com'è. **Senza questa riga la potatura non gira.**
- `lib/account/cancellazione.ts` (~213-233): l'elenco del secchio usa `limit: 1000` senza pagine, e l'errore sulle sottocartelle viene ignorato.

**Difetti vecchi visti** (per il registro)
1. minore — `scripts/check-migration-drift.mjs`: un ECONNREFUSED sul pooler finisce nel messaggio «utente o tenant». Una SELECT che fallisce dopo il collegamento esce 1 con la traccia nuda, e il workflow dice «non mi sono collegata».
2. minore — `deriva-migrazioni-produzione.yml`: senza `SALTO_E_ERRORE=1`, se manca il pacchetto `pg` il controllo è verde.
3. minore — `lib/admin/esporta-utenti.ts` (vecchio `pezzo()`): trasformava gli accenti in trattini. Sistemato strada facendo.
4. grave come rete di sicurezza — finché `vercel.json` ha `"main": true`, il ritorno indietro automatico non scatta quasi mai (riserve A ed E sopra).

**Verifiche**
- `npm run verify` sul ramo finale (c62953b): esce 0, 7159 prove su 7159.
- Un primo giro aveva un rosso per tempo scaduto sotto carico (`l-elenco-utenti-non-spaccia...`): da sola la prova passa 31 su 31.
- Il secondo giro aveva il rosso vero che ha portato all'annullamento di 122aa6c.

**Ondata 10, non partita** (6 difetti):
- moderazione degli utenti (2);
- le prove vuote dell'acquisto vero in `ci.yml` (1);
- le email «ordine pronto» e «ordine consegnato» (1): la migrazione 150 non è applicata in produzione;
- le copie delle foto (1);
- la prova mensile di ripristino (1).

**Conto dei gettoni**
- 8 consegne di subagenti, circa 746.000 gettoni: 3 costruttori × 2 giri, più 2 collaudatori.
- Sessione AD: 17,4 milioni di gettoni riletti dalla cache, 136.000 scritti, circa 11,8 $ (letto da `get_session`).
- Il workflow non è stato usato, quindi `conto-token.mjs --workflow` non ha un runId da misurare.
