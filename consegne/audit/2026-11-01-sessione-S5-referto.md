---
data: 2026-11-01 15:25
sessione: S5 · rilascio, copie ed email
pr: https://github.com/NicolaeRotaru/mycity/pull/279
---

# Sessione S5 — referto delle ondate 9 e 10

## In parole semplici
Il piano mi dava due ondate: la 9 con 7 difetti, la 10 con 6. Le ho fatte tutte e due.
Dopo la 9 mi ero fermata, perché il tetto settimanale dei gettoni era in avviso. Alle 14:20 circa Nicola, tramite la sesta, ha detto «riparti adesso».

Dei 7 difetti dell'ondata 9:
- 4 si chiudono con il codice nuovo e una prova che gira;
- 3 restano fermi, perché si chiudono solo con impostazioni di GitHub e di Vercel che può fare solo Nicola.

L'ondata 10 ha 6 difetti più 5 lavori arrivati da fuori. In tutto, 8 sono chiusi e 3 chiusi solo in parte, fermi per una scelta di Nicola. Il dettaglio è nella sezione «Ondata 10» in fondo.

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

## Ondata 10

Ripartita su ordine di Nicola, passato dalla sesta alle 14:20 circa. Hanno lavorato 5 squadre e 2 collaudatori, con un solo giro di correzione.
- Verifica completa su 9be4667: 7260 prove su 7260 verdi.
- La richiesta è sempre la #279.

**Moderazione degli utenti** (squadra D, commit 8e5609c e 9bacee3), stato **chiuso**:
- *Il rifiuto fa partire i 90 giorni.* Era già corretto alla base; ora ha una prova che fallisce se si toglie `approved_at` dal rifiuto.
- *La partita IVA.* «Approva» e «riattiva» da rifiutato o in attesa pretendono una partita IVA valida: 11 cifre più la cifra di controllo, e mai «00000000000».
  - Riattivare un negozio sospeso non la pretende. La sospensione non è una nuova approvazione, e senza questa eccezione un negozio storico restava bloccato per sempre.
- *I documenti controllati dal server.* Al fattorino si chiedono quattro documenti: fronte del documento, selfie, patente e polizza.
- Prove: `npx vitest run tests/unit/si-approva-solo-con-partita-iva-e-documenti.test.ts tests/unit/riattivare-un-sospeso-non-e-una-nuova-approvazione.test.ts`. prova-rimessa: regge.
- *Fermo per una scelta:* ai negozi oggi non si chiede nessun documento, perché non esiste una pagina dove caricarli.

**Le prove vuote dell'acquisto vero** (squadra E, commit 7350940 e b9e48d6), stato **chiuso** per il verde finto:
- Le tre prove nascono saltate, con il motivo scritto.
- Un freno legge le prove come codice e diventa rosso se una prova nel browser non apre niente. Il collaudo aveva trovato quattro modi di aggirarlo: ora sono chiusi.
- Prova: `npx vitest run tests/unit/nessuna-prova-nel-browser-e-un-guscio-vuoto.test.ts`. prova-rimessa: regge.
- *Fermo per una scelta:* i corpi veri delle tre prove.
  - Il contrassegno chiede un lavoro nuovo della CI col Supabase locale: costo 0 €, circa 10 minuti di CI in più a giro.
  - Il rimborso e il bonifico chiedono le chiavi di prova di Stripe, che sono gratis.

**Le foto nella copia e la prova mensile** (squadra F, commit f2eff8c e e635ec3), stato **chiuso**:
- Se la prova mensile di ripristino fallisce, suona l'allarme.
- Le foto dei secchi pubblici (products, stories, reviews) entrano nella copia notturna, cifrate, in un caricamento a parte.
  - Il database si conserva prima delle foto.
  - Il passo delle foto ha un tempo massimo di 15 minuti, e ogni richiesta un tempo massimo di 60 secondi.
  - Il secchio kyc-docs non si copia mai.
- Se cadono solo le foto, l'allarme lo dice in una segnalazione a parte, e il database risulta salvato.
- Prove:
  - `tests/unit/la-prova-di-ripristino-fallita-suona-l-allarme.test.ts`
  - `tests/unit/le-foto-sono-nella-copia-di-sicurezza.test.ts`
  - `tests/unit/l-allarme-delle-foto-non-dice-che-manca-il-database.test.ts`
- prova-rimessa dà «rosso strutturale», perché lo script delle foto è nuovo. Il collaudo ha rimesso a mano 4 difetti su 5: tutti presi.
- *Serve a Nicola:* il segreto `SUPABASE_SERVICE_ROLE_KEY`. Lo spazio occupato è da guardare la prima notte: il pacco delle foto resta 30 giorni.

**Le email** (squadra G, commit 98a1d35 e 2b55684):
- *«Ordine pronto» e «ordine consegnato», fermo per una scelta.* La riparazione vera è applicare la migrazione 150 in produzione: è dentro il riallineamento del punto 2.
  - Intanto il giro della posta scrive un errore se ci sono ordini consegnati e nessuna email in coda. Lo stesso se le email in coda sono di meno, per esempio 5 ordini consegnati e una sola email.
- *L'avviso al negozio per un messaggio in chat, chiuso nel codice.*
  - Parte un'email per conversazione, senza il testo del messaggio e senza dati del cliente.
  - La funzione è `avvisaNegozioMessaggioNuovo`. **Va agganciata dalla S4** in `app/api/chat/messages/route.ts`, con `senderId: user.id`.
- *Il testo dell'annullo, chiuso.* L'email della consegna veloce dice che l'annullo è gratis solo finché il negozio non conferma la fascia nuova.
  - La frase gemella in `lib/ordini/veloce-non-confermata.ts:131` è della S1.
- Prove: `il-negozio-sa-che-un-cliente-gli-ha-scritto`, `la-posta-d-ordine-muta-si-fa-sentire`, `la-sentinella-della-posta-non-ferma-il-giro`, `l-email-della-veloce-non-promette-l-annullo-dopo-che-il-negozio-accetta`.

**Cancellazione e potatura notturna** (squadra H, commit fada228 e 9a3e67a), stato **chiuso**:
- La notte vera chiama `potatureNotturne(adesso)`.
- Il conto fatto a mano dice quanti documenti orfani toglierebbe la prima notte, senza toglierne nessuno: campo `fileDaTogliere`.
- Se la rilettura del profilo salva un documento che la lettura generale aveva mancato, il registro scrive un avviso.
- La cancellazione dell'account legge l'elenco dei file a pagine, fino a 50.000 file per cartella, e dichiara gli errori delle sottocartelle.
- Prove:
  - `la-notte-vera-toglie-le-copie-orfane-dei-documenti`
  - `la-cancellazione-toglie-tutti-i-file-anche-oltre-mille`
  - `la-rilettura-che-salva-un-documento-suona-il-campanello`
- prova-rimessa: regge.

**Scelte nuove per Nicola (ondata 10)**
1. Il segreto `SUPABASE_SERVICE_ROLE_KEY` per la copia delle foto. È gratis e lo raccomando.
2. Ai negozi chiediamo i documenti d'identità prima di approvarli? Se sì, prima serve una pagina dove caricarli.
3. Se i file personali non si tolgono tutti, la cancellazione dell'account va fermata e riprovata la notte dopo? Lo raccomando.
4. Gli avvisi della chat: lasciare ai negozi la scelta di spegnerli? Serve una migrazione. E va bene la finestra di 15 minuti?
5. L'ambiente delle prove d'acquisto: prima il contrassegno col Supabase locale (0 €), poi le chiavi di prova di Stripe.
6. Prima di accendere le cancellazioni a orario: guarda il numero di documenti orfani nel conto a mano.

**Difetti vecchi visti (ondata 10)**
- `partitaIvaValida` è copiata in `app/api/seller/apply/route.ts`.
- `lib/kyc/providers.ts` controlla le partite IVA solo nel formato.
- L'approvazione del fattorino non guarda le scadenze di patente e polizza.
- `cancellaAccount` cancella l'utente anche se restano file nei secchi `reviews` e `cod-proof`.
- La variabile `E2E_DATI_DI_PROVA` non è impostata da nessuna parte.
- Il seed dell'ordine vero non ha prodotti.
- Il secchio pubblico `products` contiene foto dei contanti e dei resi.
- La prova mensile usa Postgres 16, la produzione la 17.
- `backup-db.sh:221` non pulisce i pacchi delle foto.
- Il primo del mese il lavoro della copia gira due volte.
- Se cade la copia delle foto via rclone dentro `backup-db.sh`, l'allarme dice che è caduto il database (oggi rclone è spento).
- La lettura dei profili può fermarsi presto se il database taglia le righe (max-rows): la rilettura salva i documenti, ma è l'unica barriera.

**Fuori territorio ancora aperto**
- L'aggancio dell'avviso della chat: è della S4.
- La frase della campanella in `lib/ordini/veloce-non-confermata.ts:131`: è della S1.
- Una pagina per inserire la partita IVA di un negozio già approvato.

**Conto dei gettoni**
- Ondata 9: 8 consegne di subagenti, circa 746.000 gettoni. Ondata 10: 12 consegne (5 costruttori, 2 collaudatori, 5 correzioni), circa 1.347.000 gettoni. In tutto circa 2,09 milioni su 2 ondate.
- Sessione AD: 17,4 milioni di gettoni riletti dalla cache, 136.000 scritti, circa 11,8 $ (letto da `get_session`).
- Il workflow non è stato usato, quindi `conto-token.mjs --workflow` non ha un runId da misurare.

## Correzione dopo il collaudo finale

La sesta ha bocciato un pacchetto: la moderazione si poteva aggirare. Bastava sospendere un profilo ancora **in attesa** e poi riattivarlo. Un fattorino senza documenti o un negozio senza partita IVA risultavano così approvati.
- **La correzione.** La rotta sospende solo chi è approvato. Per chi è in attesa o respinto risponde con un errore.
- **Cosa resta uguale.** Un negozio approvato e poi sospeso torna attivo come prima.
- **Dove sta.** Richiesta [#284](https://github.com/NicolaeRotaru/mycity/pull/284), commit cbb6e0f, base `claude/hopeful-dirac-jneoam`.
- **Le prove.**
  - Prova: `npx vitest run tests/unit/sospendere-e-riattivare-non-scavalca-l-approvazione.test.ts`. Era rossa in 2 casi su 2, ora è verde.
  - prova-rimessa: regge, uscita 0.
  - `npm run verify`: 7456 prove passate e 1 saltata, su 7457.
- **Cosa non ho verificato.** I profili già sospesi direttamente dall'attesa, prima di questa correzione, salterebbero ancora il controllo alla riattivazione. Contarli è una lettura sul database, che non ho fatto.
