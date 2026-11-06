---
tipo: prompt
data: 2026-11-06 01:40
per: la sessione che dirige la radiografia del marketplace in 12 sessioni
come si usa: Nicola sceglie la riga D0 del blocco «Le decisioni» (e, se vuole, cambia le altre), poi incolla tutto il testo sotto la riga in una sessione nuova sul repo NicolaeRotaru/ad-mycity
versione: 2 — corretta con le 74 critiche confermate da cinque revisori e cinque verificatori (run wf_b1588ce9-06c)
---

# Prompt — la radiografia del marketplace in 12 sessioni, più la sintesi

Copia da qui in giù.

---

Sei l'AD digitale di MyCity. Leggi `cervello/MANUALE-AD.md` prima di agire, comprese le regole del lavoro snello (①-⑫) e del lavoro veloce (⑬-⑰).

Il lavoro è la **radiografia del marketplace più completa e profonda possibile**, divisa in **12 sessioni cloud figlie**. Ognuna analizza una cosa diversa. Tu sei la **sessione 13**: prepari il lavoro, apri le sessioni, le sorvegli, fai controllare da verificatori indipendenti tutto quello che hanno trovato e lo unisci in **una sola PR**. Tu non cerchi difetti: dirigi, controlli e unisci. L'unica eccezione è un piccolo terzo giro sui buchi, alla fine (7.4).

Lo scopo è doppio. Trovare il **nuovo** che la radiografia del 5/11 non ha visto, e **chiudere** i difetti del registro che non sono più veri. Una radiografia che allunga la lista senza ripulirla vale la metà.

## 0. Le decisioni

Le ha prese Nicola scrivendo questo messaggio. Valgono così come sono scritte. Se una riga dice «DA DECIDERE», chiedila a Nicola **prima di aprire qualunque sessione**, con una sola domanda che raccoglie tutte quelle aperte.

- **D0 · Quando.** DA DECIDERE. Due fatti da mettere sul piatto:
  - il 5/11 alle 14:27 l'AD aveva scritto «niente radiografie larghe fino all'apertura», cioè fino al 15/11 (`consegne/ad/2026-11-05-pronto-prima-possibile.md`);
  - il limite settimanale dell'account era in allarme (`allowed_warning`) il 6/11 alle 01:30, e si azzera il 12/11 alle 10:00.

  Tre strade:
  - (a) la prima ondata subito;
  - (b) la prima ondata dal 12/11 alle 10:00, la seconda dopo l'apertura;
  - (c) tutto dopo l'apertura.
- **D1 · Ondate.** Due. Prima ondata S01, S03, S06, S10, S11. Seconda ondata S02, S04, S05, S07, S08, S09, S12. La seconda parte solo dopo che Nicola ha letto il riassunto della prima e ti ha scritto «via la seconda».
- **D2 · Piani.** Ogni sessione parte in **modalità piano**. Tu leggi ogni piano per primo e dici a Nicola se approvarlo o cosa correggere. L'approvazione la dà Nicola nella sessione, scegliendo l'opzione che mette la sessione in modalità **automatica**, non «accetta le modifiche».
- **D3 · Il sito vero.** Sì. Prima di creare la prima ondata, proponi di aprire alla rete di questa sessione `mycity-marketplace.com` e `www.mycity-marketplace.com` (passo 3.7). Nella stessa richiesta chiedi se aprire anche l'indirizzo del Supabase delle foto, `js.stripe.com` e `challenges.cloudflare.com`, così la pagina si vede intera.
- **D4 · Stripe.** S03 controlla da sola se il collegamento Stripe c'è. Se non c'è, legge solo il codice e lo dichiara.
- **D5 · Rami.** Ogni sessione figlia spinge solo sul suo ramo, `<il tuo ramo>-r01` … `-r12`. I rami figli non si uniscono. Alla fine porti i loro referti sul tuo ramo (7.1) e costruisci lì i file finali. Una sola PR, dal tuo ramo verso `main`. L'unione è di Nicola, e anche la cancellazione dei rami figli.
- **D6 · Workflow.** Nicola autorizza l'uso del Workflow, in questa sessione e in ogni sessione figlia, per questo lavoro.
- **D7 · Le falle riservate già aperte.** DA DECIDERE. Nicola ti incolla in chat i referti privati delle falle riservate ancora aperte (le riconosci al 3.1; quelle del 5/11 sono R262-R294)? Li tieni solo nello scratchpad. Le falle per cui il referto non c'è restano non ricontrollate, e lo scrivi col numero esatto.

## 1. Le regole che valgono per tutto il lavoro

**Il mondo vero si legge e basta.** Il sito, il database vero, Stripe, Vercel e le automazioni GitHub del sito si leggono e basta. Mai:
- un deploy;
- una scrittura sul database vero;
- un ordine vero, un modulo inviato, un accesso con un account vero;
- un messaggio a una persona;
- una variabile cambiata su Vercel;
- un'automazione GitHub lanciata (`actions_run_trigger` mai: `migrazioni-a-mano` scrive sul database vero).

Le prove girano su copie: Postgres locale, server locale, cartelle temporanee nello scratchpad.

**Il Postgres locale.** Prima accendilo e controlla che risponda:
```bash
pg_ctlcluster 16 main start && psql -U postgres -d postgres -Atc 'select 1'
```
- Ogni subagente che lo usa gli dà un nome di database **suo**, tutto minuscolo. Per esempio `marketplace/tests/sql/harness/apply.sh mycity_s05_2`, e poi `run.sh` con lo stesso nome.
- Senza nome tutti usano `mycity_test`, e `apply.sh` lo cancella con `DROP … WITH (FORCE)`: due prove in parallelo si distruggono a vicenda.
- Con il Postgres spento, le prove sul database di `npm run verify` si saltano da sole e il verde è falso.
- Le prove pesanti (database, `npm run verify`, browser) girano al massimo due alla volta: la macchina ha 4 processori.

**I fatti vivi stanno in `MyCity-Vault/90-Memoria-AI/registro-fatti.json`.** Prezzi, commissione, paletti, promesse, date: si leggono lì. Non si prendono dal §4 di `CONTESTO_BUSINESS.md` né dal riquadro dei paletti di `CLAUDE.md`, che riportano ancora quelli di agosto. Se due testi non tornano, vince il registro. Due esempi:
- la commissione del 10% vale su **tutti** gli ordini, anche dei clienti che il negozio aveva già (`pricing.commissione`);
- il negozio approva le anteprime **sul sito**, non su WhatsApp (`prodotto.paletti`, riscritti da Nicola il 1/11).

**Il deposito è pubblico.** `NicolaeRotaru/ad-mycity` è pubblico, e ogni ramo spinto è già una pubblicazione.
- Una **falla di sicurezza** è un difetto che lascia a qualcuno vedere, cambiare o pagare quello che non dovrebbe: permessi e regole di accesso, dati esposti, accessi, pagamenti aggirabili, segreti, lavori a orario lanciabili da chiunque. Vale per **ogni** sessione: il 5/11 le 33 falle riservate stavano in 8 lenti diverse.
- Una falla aperta non si descrive in nessun file, commit, titolo di sessione, diario o messaggio `send_message`.
- I dettagli viaggiano solo nelle chat delle sessioni. La loro fonte è la trascrizione della sessione che li ha trovati, non il tuo scratchpad, che si perde se la macchina viene rifatta.
- Le regole esatte per i referti sono al 5.9. La rilettura prima di pubblicare è al 7.5.

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

**Le conferme.** Il freno della casa (`cervello/pre-scrittura.mjs`, nell'hook PreToolUse) chiede un clic a Nicola per gli strumenti MCP con un verbo di scrittura nel nome. Esempi: `create_session`, `add_repo`, `update_environment`, `create_pull_request`, `update_pull_request`. `git commit` e `git push` da Bash, `send_message` e `send_later` passano senza clic. Avvisa Nicola **prima** di ogni gruppo di clic.

**Il conto dei token.** Va nel referto, misurato con `node cervello/conto-token.mjs`. Senza argomenti esce 2, e da un container non si vedono i transcript di un altro:
- ogni sessione misura i suoi: `--sessione <id>.jsonl --json` per il ciclo principale, `--dir <id>/subagents --json` per i subagenti, `--workflow <runId> --json` per ogni workflow;
- tu fai lo stesso sui tuoi e sommi.

**Scrittura umana.** Vale per tutto ciò che legge Nicola: chat, referto, PR (`cervello/scrittura-umana.md`). Si misura con `node cervello/si-capisce.mjs`.

Prima di costruire i controlli della fase 0 leggi `cervello/scorciatoie-note.md`.

## 2. Gli errori già successi, e il controllo che li ferma

| Errore già successo | Il controllo |
|---|---|
| La divisione in zone del 5/11 lasciava fuori 13 file su 1.011. | `copertura-prima` (3.5): ogni file del commit e ogni lente hanno un proprietario prima di partire. |
| Tre sessioni su dieci hanno messo file temporanei nel ramo, due hanno toccato file di altre. | `guardia-ramo`: un ramo figlio può cambiare un solo file, il suo referto. |
| 76 difetti su circa 500 erano doppioni. | La seconda ondata vede i trovati della prima. I doppioni si tolgono **prima** della verifica. |
| Il limite settimanale ha fermato il lavoro il 4/11 alle 19:25. | 3.0: si guarda il limite prima di ogni ondata e della verifica. Ogni sessione salva il referto a pezzi. |
| Una prova legata all'ora vera è diventata rossa da sola. | Le prove con date e orari usano un orologio finto. |
| Il 24/10 tre testi pubblici nominavano di passaggio una falla riservata. | Due revisori della riservatezza rileggono tutto prima di pubblicare (7.5). |
| Una lista ordinata cambia posizione e un numero di riga punta a un'altra voce. | Nel registro le voci si trovano per **chiave**, mai per posizione (3.4). |

## 3. Fase 0 — la preparazione (tu, prima di aprire qualunque sessione)

**3.0 Il limite settimanale.** Chiama `get_session` senza argomenti e leggi `external_metadata.rate_limit_info`. Se `status` non è `allowed`, o se `isUsingOverage` è vero, non aprire nessuna sessione. Scrivi a Nicola lo stato e l'ora di `resetsAt` in ora di Piacenza, e aspetta il suo via. Rifai lo stesso controllo prima della seconda ondata e prima della verifica (7.3).

**3.1 Lo stato di partenza.** Conta il registro `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json` (campo `problemi`): voci totali, voci per `stato`, aperte per gravità, falle riservate aperte.
- Una voce è **riservata** se il titolo comincia con «Falla di sicurezza». Il registro non ha un campo `riservato`, e il digest non lo fa entrare.
- Il 6/11 alle 01:30 erano 2.724 voci e 534 aperte (5 bloccanti, 69 gravi, 460 minori). Le riservate aperte erano 52: 49 con `file` «(nel referto privato)» e 3 con «(dettagli nella sessione dell'AD del 5/11)».
- Se i tuoi numeri sono diversi valgono i tuoi: scrivi da dove vengono.

**3.2 Il codice.**
- Lancia `node cervello/collega-marketplace.mjs`. Scarica solo l'ultimo commit di `main`, con profondità 1.
- Scrivi lo SHA intero, 40 caratteri, con `git -C marketplace rev-parse HEAD`: è la **BASE_SITO**. Un hash corto non si può scaricare. Tutte le sessioni analizzano quel commit e nessun altro.
- Ogni volta che serve il codice a BASE_SITO su una macchina che non ce l'ha, per te o per una sessione, si fa così, e non si rilancia `collega-marketplace.mjs` dopo:
```bash
git -C marketplace fetch --depth 1 origin <BASE_SITO> && git -C marketplace checkout -q --detach FETCH_HEAD && test "$(git -C marketplace rev-parse HEAD)" = "<BASE_SITO>"
```

**3.3 Le date.** Le date sono due:
- `<data di oggi>` è il giorno della fase 0 (`giornoPiacenza()`) e serve solo al nome della cartella di lavoro;
- `<data>` è il giorno in cui scrivi il referto finale (7.5), nella forma AAAA-MM-GG.

Il controllo si fa al 7.5. Se `consegne/audit/<data>-radiografia.md` o `consegne/audit/<data>-radiografia-marketplace-raw.json` esistono già, fermati e chiedi a Nicola.

**3.4 La cartella di lavoro.** Prima di scriverla:
- chiama `get_session` senza argomenti per il tuo id;
- prendi il tuo ramo con `git branch --show-current`.

La cartella è `consegne/audit/<data di oggi>-radiografia-12-sessioni/`. In ogni file che scrivi lì sostituisci ogni segnaposto (`<BASE_SITO>`, `<cartella>`, `<il tuo ramo>`, l'id della sessione dell'AD) con il valore vero. Dentro ci va:

- **`LEGGIMI.md`.** Le regole per le sessioni figlie: tutto il passo 5, per intero, con la stessa numerazione da 5.1 a 5.10, più le regole del §1 sul Postgres e sul deposito pubblico.
- **`schede/S01.md` … `schede/S12.md`.** Per ogni sessione:
  - cosa guarda;
  - le lenti, elencate per nome;
  - le domande guida;
  - `cosa NON guarda`, con le righe di «Chi possiede cosa» del passo 4;
  - `eredita_dal_5_11`, con gli angoli del 5/11 che le spettano;
  - il tetto dei subagenti;
  - la mappa dei file di partenza.
- **`registro-compatto.txt`.** Una riga per voce del registro, con:
  - `indice`, cioè la posizione in `problemi` contata da 0 al commit della fase 0;
  - `chiave`, cioè `dimensione|titolo` normalizzati con `chiaveProblema`, **importata** da `cervello/referti-sito.mjs` e non imitata;
  - stato, gravità, dimensione, il campo `file` intero e il titolo.

  Le riservate portano solo chiave, stato, gravità e titolo. Pesa circa 790 KB: si interroga con `grep -i -- '<percorso o parola>' registro-compatto.txt | cut -c1-400`, **mai con Read**.
- **`da-ricontrollare.txt`.** Le voci aperte **non** riservate, per S01, con indice, chiave, gravità, file e titolo.
- **`mappa-file.txt`.** Ogni file di `git -C marketplace ls-tree -r --name-only <BASE_SITO>`, con la sessione o le sessioni che devono coprirlo. Le regole:
  - Ogni file va alla sessione del suo tema.
  - `tests/` e `docs/mockup/`: proprietario S12 con il segno `strumento`. S12 li fa girare e legge solo quelli che servono per dire quali prove non possono fallire. Le sessioni del tema leggono i test dei loro flussi.
  - Immagini e caratteri: segno `binario`, contati a parte.
  - `seeds/` a S04 e S05. `supabase/` a S05. `public/` e `.github/` a S11. `middleware.ts` a S04. `messages/` e `i18n.ts` a S10. `vercel.json` a S08 e S11. `next.config.js` a S11 e S12. `sentry.*.config.ts` e `instrumentation*.ts` a S08.
  - A S12 da solo vanno solo `stories/`, `.storybook/` e i file di configurazione della radice (package*.json, tsconfig, tailwind, postcss, vitest, playwright, i `.md` di prompt e README).
  - Scrivi in testa quanti file conta la mappa, per segno. Il 6/11, a `db5164c5`, `git ls-files` ne dava 2.587, di cui 1.310 test; il 5/11 la base era di 1.011 file, senza test né documenti.
- **`sessioni.json`.** Per ogni sessione: id, ramo, ondata, stato, `partenza` (lo SHA del tuo ramo da cui è partita) e `commit_finale`.
- **`diario-della-sorveglianza.txt`.** Una riga per controllo, con l'ora. Le falle si **contano**, non si descrivono. Per i dettagli riservati scrivi solo dove stanno (sessione e uuid dell'evento).
- **`controlli.mjs`.** I controlli del passo 3.5.

**3.5 I controlli di macchina.** Scrivili prima di aprire le sessioni.

- **`copertura-prima`.** Tre condizioni:
  - (a) ognuna delle 24 lenti della casa `marketplace` di `cervello/dimensioni-radiografia.json` compare **per nome** nella scheda di almeno una sessione fra S02 e S12 (S01 non conta: non cerca difetti nuovi);
  - (b) ogni file di `ls-tree` a BASE_SITO compare in `mappa-file.txt` con almeno un proprietario, e la mappa non ha file inesistenti; un file di `app/`, `lib/`, `components/`, `migrations/`, `supabase/`, `seeds/`, `public/`, `messages/` o `.github/` che ha come unico proprietario S12, e che la scheda di S12 non nomina, è rosso;
  - (c) ognuno dei 21 angoli del 5/11 compare nel campo `eredita_dal_5_11` di almeno una scheda. Gli angoli sono `X-soldi`, `X-permessi-db-live`, `X-produzione-dal-vivo`, `X-sito-dal-vero`, `X-regole-business`, `X-prove-automatiche`, `X-flussi-utente`, `X-concorrenza`, `X-privacy-ciclo`, `Y-attaccante-anonimo`, `Y-attaccante-cliente`, `Y-attaccante-negozio-rider`, `Y-errori-silenziosi`, `Y-tempo-e-date`, `Y-promesse-vs-codice`, `Y-avvisi-e-notifiche`, `Y-dati-veri-incoerenti`, `Z-account-di-prova`, `Z-database-a-163`, `Z-rimborso-contanti`, `Z-documenti-fiscali`.
- **`guardia-ramo <ramo> <SNN>`.** Se `origin/<ramo>` non esiste ancora, l'esito è «in attesa», non rosso. Altrimenti `git diff --name-only <partenza della SNN>...origin/<ramo>` (tre punti) contiene solo `consegne/audit/<cartella>/referti/SNN.json`.
- **`valida-referto <file>`.** Il formato del 5.6. In particolare:
  - ogni `dimensione` è una delle 24 lenti, ogni `severita` è bloccante, grave o minore;
  - ogni posto in `file` ha una forma ammessa (5.6), e ogni `percorso:riga` o `percorso:inizio-fine` esiste a BASE_SITO, con le righe dentro il file;
  - `live:` e `vercel:` solo in S11, `produzione:` solo in S05 e S11, e sempre con `prova_tipo: "comando"` ed `esito_prova` non vuoto;
  - ogni grave o bloccante rispetta l'asticella del §1;
  - ogni scheda con `riservato: true` ha i valori fissi del 5.9 in **ogni** campo, e `(nel referto privato)` compare solo con `riservato: true`;
  - nessun segnaposto `<…>` rimasto.
- **`copertura-dopo`.** L'unione di `file_letti_interi`, `file_letti_in_parte` e `file_eseguiti` dei referti, confrontata con la mappa. Dà i tre conti separati, conta a parte i file `strumento` e `binario`, e restituisce l'elenco dei file di codice che non ha coperto nessuno.
- **`segnaposti`.** In `LEGGIMI.md` e nelle schede non resta nessun `<…>`.

**Il collaudo.** Un subagente `qa` che non li ha scritti li collauda con la skill `collaudo`, con il mandato di farli passare con un caso sbagliato. Ogni caso qui sotto deve essere rosso:
- una lente tolta da una sola sessione fra S02 e S12;
- una riga tolta dalla mappa;
- un file di `app/` assegnato solo a S12 e non nominato;
- `Y-errori-silenziosi` tolto da tutte le schede;
- un ramo finto con un file in più;
- una riga oltre la fine del file;
- un grave con `lettura-codice`;
- un `live:` in una sessione diversa da S11;
- una riservata con un percorso in `verificato_da`;
- un `<BASE_SITO>` rimasto nel LEGGIMI.

E questi devono restare verdi:
- un ramo partito da un commit dell'AD successivo, che cambia solo il referto;
- un referto con due file e un intervallo di righe.

Apri la prima sessione solo quando il collaudo è passato.

**3.6 Pubblica la fase 0.** Fai commit e push sul tuo ramo. Apri la PR come **bozza** verso `main`, con un titolo detto a voce e i quattro blocchi (la creazione chiede un clic). Ogni push sulla bozza fa ripartire la CI. Se diventa rossa su file che non hai toccato, scrivilo nel diario e nella PR e non ripararlo: è fuori mandato. A `subscribe_pr_activity` ti iscrivi al 7.6.

**3.7 La rete.** Le sessioni figlie ereditano la rete di questa sessione nel momento in cui le crei, quindi questo passo va fatto prima della prima ondata.
- Chiama `get_environment` e segui le sue regole per proporre gli indirizzi della D3. La proposta chiede un clic a Nicola.
- Se dice no, S11 lavora su un server locale e sui registri di Vercel, e lo dichiara.
- Annota la scelta in `DECISIONI.md` (7.5).

## 4. Le 12 sessioni

Ogni sessione segue **una cosa** attraverso tutto il sito, non una cartella di file. La radiografia del 5/11 era divisa per file, e così ogni file è stato letto. Questa è divisa per cosa può rompersi, così trova quello che la prima non ha visto.

| Sessione | Ondata | Cosa guarda | Lenti | Tetto |
|---|---|---|---|---|
| S01 · Ricontrollo dei difetti aperti | 1 | Le voci di `da-ricontrollare.txt`: sono ancora vere a BASE_SITO? | nessuna nuova | 30 |
| S02 · I soldi senza carta | 2 | Un euro dal prezzo al bonifico del lunedì, sconti, credito, il compenso del fattorino | `pagamenti-stripe`, `qa-flussi` | 12 |
| S03 · La carta e Stripe | 1 | Tutto quello che si accende col pagamento con carta | `pagamenti-stripe` | 12 |
| S04 · L'attaccante | 2 | Chi prova a vedere o cambiare cose non sue, interruttori, account di prova | `sicurezza-auth`, `ai-endpoints` | 12 |
| S05 · Il database | 2 | Regole di accesso, aggiornamenti in attesa, dati veri che non tornano | `rls-database` | 12 |
| S06 · Il viaggio del cliente | 1 | Dalla ricerca alla porta di casa e dopo, con le date e la consegna veloce | `qa-flussi`, `api-backend`, `frontend-ux` | 20 |
| S07 · Chi lavora: negozio e fattorino | 2 | Dall'iscrizione al lavoro di ogni giorno, e le regole di MyCity verso di loro | `frontend-ux`, `qa-flussi` | 12 |
| S08 · La cabina di Nicola, gli avvisi, gli errori silenziosi | 2 | Pagine admin, avvisi, email, notifiche, lavori a orario, errori inghiottiti | `api-backend`, `dati-analytics` | 12 |
| S09 · Privacy, leggi e promesse | 2 | Dati personali, consumatore, marketplace, documenti fiscali, promesse scritte contro il codice | `privacy-legale` | 12 |
| S10 · L'aspetto | 1 | Tutto quello che si vede, su telefono e computer, e i testi | `layout-responsive`, `coerenza-brand`, `tipografia`, `accessibilita-visiva`, `stati-ui`, `immagini-media`, `mobile-pwa`, `flussi-conversione`, `microcopy`, `navigazione-gerarchia`, `performance-percepita`, `accessibilita` | 12 (24 con `audit-design.js`) |
| S11 · Il sito vero, dal vivo | 1 | Il sito pubblicato, Vercel, le automazioni GitHub del sito | `performance`, `deploy-sre`, `mobile-pwa`, `performance-percepita` | 12 |
| S12 · Il codice dentro | 2 | Struttura, prove automatiche, librerie, intelligenza artificiale | `architettura`, `ai-endpoints` | 12 |

Il tetto conta **tutti** gli agenti della sessione: cercatori, verificatori e agenti dei workflow.

**Gli angoli del 5/11, per scheda** (`eredita_dal_5_11`):
- S02: `X-soldi`, `X-regole-business`, `Z-rimborso-contanti`, `X-concorrenza` (doppio clic, due schede).
- S04: `Y-attaccante-anonimo`, `Y-attaccante-cliente`, `Y-attaccante-negozio-rider`, `Z-account-di-prova`.
- S05: `X-permessi-db-live`, `Y-dati-veri-incoerenti`, `Z-database-a-163`, `Z-account-di-prova` (solo conteggi).
- S06: `X-flussi-utente`, `Y-tempo-e-date`, `X-concorrenza` (l'ultimo pezzo).
- S07: `X-regole-business` (paletti).
- S08: `Y-errori-silenziosi`, `Y-avvisi-e-notifiche`.
- S09: `X-privacy-ciclo`, `Y-promesse-vs-codice`, `Z-documenti-fiscali`.
- S10: `X-sito-dal-vero` (foto dal server locale).
- S11: `X-produzione-dal-vivo`, `X-sito-dal-vero`.
- S12: `X-prove-automatiche`.

**Chi possiede cosa, dove due schede si toccano.** Il proprietario guarda a fondo. L'altra sessione guarda solo il suo pezzo, e quello che vede fuori lo scrive con `perimetro_altrui`. Copia ogni riga nelle due schede interessate, nel campo `cosa NON guarda`.
- La pagina Guadagni del negozio (`app/seller/earnings/*`, `lib/guadagni/negozio.ts`): le cifre sono di S02; S07 guarda solo come il negoziante la legge e la usa.
- I lavori a orario: S08 guarda per tutti l'orario, chi può lanciarlo, il doppio giro e il fallimento. Il contenuto lo guarda la sessione del tema:
  - `release-payouts` e `riquadra-casse` a S02;
  - `veloce-non-confermata`, `expire-stale-orders` ed `expire-checkouts` a S06;
  - `process-deletions` a S09;
  - `send-emails`, `send-push`, `operational-alerts`, `abandoned-carts` ed `external-price-alerts` a S08.
- L'intelligenza artificiale: tetti di spesa, modelli ritirati e fornitore che non risponde a S12; abuso, prompt injection e chiavi esposte a S04; cosa fanno gli strumenti per il negozio a S07.
- Le regole di accesso: policy, funzioni con permessi alti e permessi delle tabelle a S05; le rotte API che usano il client admin e scavalcano le regole a S04.
- `mobile-pwa` e `performance-percepita`: S10 sul codice e sulle foto del server locale; S11 solo sul sito pubblicato (misure, manifest e service worker serviti).
- Le prove con carta: il collegamento e i trasferimenti a S03; i soldi in contanti e il compenso a S02.

**Le domande guida**, da scrivere per intero nelle schede:

- **S01.** Per ogni voce: il difetto, così com'è scritto nel titolo, c'è ancora a BASE_SITO? Gli esiti:
  - `ancora_vero`;
  - `non_piu_vero`, con la prova che lo dimostra. Per gravi e bloccanti la prova è un comando che oggi è verde e che sarebbe rosso col difetto;
  - `cambiato`: c'è ancora in un'altra forma, e scrivi cosa è cambiato;
  - `non_verificabile`, con il perché.

  Le riservate non sono nella lista: le conta l'AD. I verificatori di S01 prendono al massimo 6 voci dello stesso file o flusso. S01 non cerca difetti nuovi: quelli che vede strada facendo vanno in `difetti` con `perimetro_altrui`.
- **S02.** Segui un euro: prezzo a catalogo, carrello, totale, ordine in contanti, incasso del fattorino, riquadro della cassa, commissione, bonifico del lunedì, «segnato come fatto», pagina Guadagni del negozio.
  - **I casi storti:** rimborso dopo il lunedì, reso parziale, ordine annullato a metà, centesimi e arrotondamenti, doppio clic, due schede aperte, i 14 giorni per il rimborso, le ricevute.
  - **Quello che cambia il totale o paga al posto dell'euro:** codici sconto (`lib/coupons.ts`, `claim_coupon` e `release_coupon` in `app/api/orders/cod/route.ts`, spenti in cassa), il credito MyCity (`useCredit`: buoni riscattati e punti convertiti, acceso), punti e inviti (`lib/loyalty.ts`, `app/profile/loyalty`, `app/profile/referral`), promozioni (`lib/promotions.ts`), lo sconto del ritiro in negozio. Per ognuno: chi paga, il negozio o MyCity, e se riquadro, bonifico e Guadagni lo contano giusto.
  - **Il compenso del fattorino:** `lib/guadagni/fattorino.ts`, `app/rider/earnings`, i contanti dichiarati (`app/api/rider/incassi-da-dichiarare`, `app/api/rider/cash-confirm`), il compenso pagato col bonifico.
  - **La commissione** si misura contro `pricing.commissione` di `registro-fatti.json`. Il 10% su tutto **non** è un difetto: è la regola firmata da Nicola il 1/11.
- **S03.** Collegamento a Stripe dei negozi e dei fattorini (`app/api/stripe/connect/onboarding`, `app/api/stripe/connect/rider-onboarding`, `components/rider/RiderConnectButton.tsx`).
  - Addebiti e trasferimenti, commissione della piattaforma, firma e ordine dei messaggi di Stripe, idempotenza.
  - Rimborsi parziali, contestazioni, bonifici automatici, autenticazione forte del cliente, chiavi di prova e chiavi vere.
  - L'interruttore che accende la carta, e cosa succede il primo giorno dopo.
  - **I tre pagamenti con carta che non sono un ordine:**
    - i buoni regalo (`app/api/gift-cards/checkout`, `lib/stripe/webhook/giftcard.ts`, `lib/stripe/recupero-pagamento-buoni.ts`);
    - le sponsorizzate (`app/api/sponsored/checkout`, `lib/stripe/webhook/sponsorizzati.ts`);
    - l'abbonamento dei negozi (`app/api/seller/subscription/*`, `lib/stripe/webhook/abbonamenti.ts`), e se rispetta i paletti di `registro-fatti.json`.

  Stripe solo in lettura, se c'è: mai creare, rimborsare o cambiare niente.
- **S04.** Quattro persone: un estraneo, un cliente, un negozio, un fattorino, più chi finge di essere admin.
  - **Le rotte:** per ogni rotta dell'API, chi può chiamarla e con quali dati altrui. `middleware.ts`. Le rotte che usano il client admin e scavalcano le regole del database.
  - **I contenuti e i segreti:** segreti nel codice che arriva al browser; contenuti scritti dagli utenti (descrizioni, recensioni, messaggi); indirizzi web scaricati dal server; caricamento file; limiti di frequenza.
  - **L'intelligenza artificiale:** abuso, prompt injection, chiavi esposte.
  - **Gli interruttori del lancio** (`lib/funzioni-al-lancio.ts`, tutti spenti). Per ognuno: la rotta del server rifiuta la funzione anche se la chiami a mano, su una copia? Elenca cosa resta acceso dietro ogni interruttore spento, come il riscatto dei buoni, il credito e i punti scritti dal database.
  - **Gli account e i negozi di prova:** chi li crea (`seeds/005_admin_and_rider.sql`, `seeds/006_admin_swap.sql`, `seeds/007_mycity_seller.sql`, `scripts/`), se possono entrare nel sito vero, se si vedono al pubblico. Nel referto non va nessuna credenziale.
  - **Le falle riservate già aperte:** se Nicola ha dato i referti privati (D7), ricontrollale una per una, solo nello scratchpad, con gli esiti di S01.

  Le prove solo su copie. Tutto ciò che è una falla aperta è riservato.
- **S05.**
  - Le regole di accesso di ogni tabella, e le funzioni che girano con permessi alti.
  - Le migrazioni in ordine e coerenti, e gli script delle migrazioni con le loro protezioni (`scripts/applica-migrazioni-mancanti.sh`, `scripts/conta-migrazioni-mancanti.sh`, `scripts/check-migration-drift.mjs`).
  - **La copia ferma dove è ferma la produzione.** `apply.sh` applica sempre tutte le migrazioni. Per la copia ferma applica `tests/sql/harness/00_shim_supabase.sql` e poi solo le migrazioni fino all'ultima che la produzione ha (leggila in sola lettura), nello stesso ordine `LC_ALL=C sort`. Per le migrazioni su tabelle piene usa `tests/sql/harness/migrazione-su-database-pieno.sh`.
  - Vincoli, integrità, indici, avvisi di Supabase.
  - Sul database vero solo letture e conteggi, mai dati personali. Per esempio: quanti account, negozi e prodotti di prova esistono, e quanti si vedono al pubblico.
- **S06.** Il cliente, dall'inizio alla fine.
  - **Prima del carrello:** ricerca e suggerimenti (`app/search`, `lib/ricerca`, `lib/queries/suggerimenti-ricerca.ts`), «vicino a me» (`app/near`), categorie, novità, più venduti, piccoli prezzi, promozioni, negozio del mese, vetrine (`app/store`, `app/stores`), profili pubblici (`app/u`). La scheda prodotto, con varianti e prezzo in promozione. Preferiti, liste, carrello condiviso. Gli eventi e l'iscrizione (`app/events`).
  - **Il viaggio:** carrello, cassa, fascia oraria, stati dell'ordine e chi li cambia, accettazione del negozio, fattorino, consegna, chiusura. La consegna veloce, rimasta fuori il 5/11. Annullamenti in ogni stato. Due clienti sull'ultimo pezzo.
  - **Le date:** mezzanotte, cambio dell'ora (ultimo 25/10, prossimo 28/3), festivi, orari del negozio.
  - **Dopo la consegna:** la recensione (`app/orders/[id]/review`), il reclamo (`app/orders/[id]/dispute`), il reso visto dal cliente, la pagina dei miei ordini.
  - **L'account:** profilo, indirizzi, impostazioni, cambio password.

  La lente `frontend-ux` vale per tutte le pagine del cliente.
- **S07.** Chi lavora sul sito.
  - **Il negozio:** candidatura, verifica, vetrina, catalogo (anche gli strumenti di intelligenza artificiale e l'importazione), ordini lato negozio, Guadagni (solo come si legge), aiuto, la risposta alle recensioni (`app/api/seller/reviews/[id]/reply`).
  - **I messaggi fra cliente e negozio** (`app/messages`, `app/api/chat/*`, `lib/queries/controparte-della-chat.ts`): chi vede cosa, letto e non letto, l'avviso al negozio.
  - **Il fattorino, dalla sua parte:** candidatura e controllo dei 18 anni (`app/rider/onboarding`, `lib/maggiore-eta.ts`), l'approvazione dello staff, disponibilità e online o offline, profilo, storico, recensioni, aiuto (`app/rider/*`), la bacheca con più consegne insieme.
  - **Le regole di MyCity verso di loro**, come sono oggi in `prodotto.paletti` di `registro-fatti.json`: i clienti sono del negozio, con i contatti visibili ed esportabili; il negozio vede tutto sul sito e lì approva le anteprime, dopo un avviso via email; il primo risultato si vede in cassa in 2-4 settimane. L'app del negozio arriva dopo il 15/11 e non sta nel codice del sito: che manchi **non** è un difetto (voce `avvisi.negozio`).

  Su `frontend-ux`, S07 guarda solo le pagine del negozio e del fattorino.
- **S08.**
  - Le pagine admin.
  - **L'avviso del nuovo ordine**, misurato contro `registro-fatti.json`, voci `avvisi.negozio` e `controllo.tre-livelli`: al lancio email al negozio e telefonata di Nicola; il sito fa suonare i telefoni in pochi secondi; i 5 minuti sono il tempo dopo cui, con l'app che arriva dopo il 15/11, suona il telefono di Nicola.
  - **Ognuno dei lavori a orario di `vercel.json`** (il 6/11 erano 11): orario, chi può lanciarlo, cosa succede se gira due volte o se fallisce. Il contenuto è della sessione del tema.
  - Le email (testi, mittente, dominio), le notifiche, i numeri delle pagine contro quelli del database, gli eventi di PostHog.
  - **Gli errori silenziosi, in tutto il sito:** dove un errore si inghiotte e la pagina mostra zero, vuoto o «tutto a posto». Per esempio un catch che restituisce un valore normale, o una scrittura di cui non si legge l'`error` (vedi `lib/esito-scrittura.ts`).
  - **Chi se ne accorge:** `lib/logger.ts`, Sentry (`sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`, attivo solo con `SENTRY_DSN`: S11 ti dice se la variabile esiste), il lavoro `operational-alerts`.
- **S09.**
  - Cosa raccoglie davvero il codice, contro cosa dicono informativa e cookie. Il banner prima del tracciamento, conservazione e cancellazione, esportazione dei dati.
  - Codice del Consumo (informazioni prima dell'acquisto, recesso, prezzi). Obblighi del regolamento europeo sui marketplace (tracciabilità dei venditori, segnalazioni, punto di contatto). Dichiarazione di accessibilità. Documenti fiscali.
  - Il fattorino: età minima, condizioni, dati raccolti nell'iscrizione.
  - **Le promesse scritte, contro il codice che le deve mantenere:** Termini, FAQ, Come funziona, Spedizioni, Resi, Chi siamo, Lavora con noi, l'aiuto del negozio (`app/seller/help/domande.ts`), l'aiuto del fattorino (`app/rider/help`), le email (`lib/email/templates.ts`) e le frasi costruite da `lib/promesse-pubbliche.ts`. Per ogni promessa (tempi, cifre, diritti): il codice la mantiene?
- **S10.**
  - Le lenti della tabella, con foto vere da un server locale, su telefono e computer, più i testi di `messages/`. Il metro sono `CHECKLIST-BRAND.md` e `BRIEF-CREATIVO.md`.
  - Cerca il nuovo rispetto al registro e all'ultima radiografia del design, dell'11/10 (`consegne/design/2026-10-11-radiografia-design.md`).
  - **Il browser.** Playwright è installato nel sistema, versione 1.63, col browser in `/opt/pw-browsers`. Non usare `npx playwright` dentro il sito dopo `npm ci`: il sito blocca la 1.60.0, che cerca un altro Chromium e non lo trova. Scrivi lo script delle foto nello scratchpad e lancialo con la Playwright di sistema, oppure passa `executablePath: '/opt/pw-browsers/chromium'`.
  - **Il workflow `.claude/workflows/audit-design.js`** lancia 22 agenti e guarda solo il codice, senza foto, in un formato diverso dal 5.6. Usalo solo se lo dichiari nel piano, col tetto di 24. I suoi risultati entrano nel referto solo riscritti nel formato 5.6, con la riga esatta a BASE_SITO e la foto che li mostra.
- **S11.**
  - **Il sito pubblicato nel browser**, se la rete lo permette: ogni pagina pubblica, gli errori della console, i link rotti, le intestazioni di sicurezza, robots e sitemap, l'app installabile (manifest e service worker serviti). Per il browser vale la stessa regola di S10.
  - **La velocità** misurata dal container va scritta come «dal container, via proxy», mai come quella dei clienti. La velocità dei clienti veri la danno i dati di Vercel (Speed Insights, Web Analytics), se il progetto li ha.
  - **Il proxy** lascia passare solo gli indirizzi aperti. Una richiesta del browser rifiutata dal proxy non è un difetto del sito: va in `non_guardato` con l'indirizzo, e si toglie dal conto degli errori e della velocità.
  - **Da Vercel, solo in lettura:**
    - gli errori degli ultimi 7 giorni (`get_runtime_errors` con `since: "7d"`, il massimo che lo strumento dà);
    - i registri per la finestra che il piano conserva (scrivi quale);
    - i rilasci;
    - i **nomi** delle variabili confrontati con quelle che il codice pretende, mai i valori (anche `SENTRY_DSN` per S08);
    - l'esito dei lavori a orario.
  - **Le cinque automazioni GitHub del sito** (`.github/workflows/`: `ci.yml`, `deploy-dopo-ci.yml`, `backup-db.yml`, `deriva-migrazioni-produzione.yml`, `migrazioni-a-mano.yml`): cosa fanno e gli esiti veri. Si leggono solo con `mcp__github__actions_list` (`list_workflows`, `list_workflow_runs`, `list_workflow_jobs`, `list_workflow_run_artifacts`), `mcp__github__actions_get` (`get_workflow_run`) e `mcp__github__get_job_logs`. Il backup di ogni notte c'è? La prova di ripristino del primo del mese è verde? Un rilascio può partire con la CI rossa?
  - **Mai** un ordine, un modulo inviato, un accesso con un account vero, un'automazione lanciata.
- **S12.**
  - Struttura del codice, pezzi doppi, codice mai usato, dipendenze circolari.
  - **Le prove automatiche:** `npm run verify` a BASE_SITO, col Postgres acceso (§1). Quali prove non possono fallire. Quali percorsi dei soldi non hanno prove. Se `tests/unit/ogni-interruttore-del-lancio-lo-legge-qualcuno.test.ts` può fallire davvero: provalo togliendo la lettura di un interruttore, in una copia.
  - **Le librerie:** vulnerabilità note, versioni vecchie, licenze.
  - **TypeScript:** `any` e controlli spenti.
  - **L'intelligenza artificiale:** modelli ritirati, tetti di spesa, cosa succede quando il fornitore non risponde.

## 5. Le regole per ogni sessione figlia

Vanno in `LEGGIMI.md` per intero, con i valori veri al posto dei segnaposti. Ogni sessione le legge prima di fare il piano.

**5.1 Chi sei.**
- Sei la sessione SNN della radiografia in 12 sessioni. Non sei l'AD: non leggere `cervello/MANUALE-AD.md`. Valgono `CLAUDE.md`, le regole del §1 copiate in questo file e queste.
- Nel riquadro dei paletti di `CLAUDE.md` e nel §4 di `CONTESTO_BUSINESS.md` i paletti sono quelli di agosto: valgono quelli di `registro-fatti.json`.
- La sessione dell'AD è `<id>`. Il commit del sito è `<BASE_SITO>`. La cartella è `consegne/audit/<cartella>/`.
- Nessuno risponde alle tue domande mentre lavori: decidi dentro queste regole, e scrivi i dubbi in `domande_per_nicola`.

**5.2 Il piano.** Parti in modalità piano: puoi solo leggere. Il codice del sito lo scarichi **dopo** l'approvazione, come primo passo. Il piano si basa sulla tua scheda e sulla mappa dei file. Se un comando ti viene negato, non insistere. Il piano dice:
- il perimetro: i flussi e i file che leggerai, presi dalla tua scheda;
- le prove che lancerai, e su quale copia;
- quanti agenti userai in tutto, dentro il tetto della tua scheda, e il motivo se ne chiedi di più;
- cosa NON coprirai, e perché;
- ogni quanto salvi il referto.

**5.3 Il codice.** Dopo l'approvazione:
1. Lancia per primo `node cervello/collega-marketplace.mjs`: il sito è pubblico, basta git. Solo se fallisce chiama `add_repo` per `NicolaeRotaru/mycity` in lettura. `add_repo` chiede un clic a Nicola e ti lascia ferma finché non risponde: scrivilo in chat.
2. Porta la copia su BASE_SITO col comando del 3.2 (fetch del commit, checkout, controllo), e non rilanciare `collega-marketplace.mjs` dopo.
3. Se il commit non si scarica, fermati. Scrivilo in `domande_per_nicola` e avvisa l'AD con `send_message`. Mai analizzare un altro commit.

Sul repo del sito: mai un commit, un ramo o un push.

**5.4 Un solo file.**
- Nel tuo ramo cambi un solo file: `consegne/audit/<cartella>/referti/SNN.json`.
- I file di prova, le copie, le foto e gli appunti stanno nel tuo scratchpad.
- Salva e spingi il referto ogni 10 difetti o ogni ora, quello che arriva prima, con `"finita": false`. Così uno stop per i limiti non fa perdere niente.
- Il tuo ramo è pubblico appena lo spingi. Prima di ogni push rileggi i campi dei difetti **non** riservati. Se uno ripete una frase di una tua falla riservata, o nomina una rotta, una tabella, una funzione o una riga che compare solo in quella falla, togli quel pezzo oppure segna riservato anche quel difetto.

**5.5 Solo il nuovo.** Prima di scrivere un difetto cercalo in `registro-compatto.txt`, con grep e mai con Read: prima per ogni percorso che citi, poi per due o tre parole del titolo. Se sei nella seconda ondata cercalo anche in `trovati-ondata-1.txt`.
- Se c'è ed è aperto, non è nuovo. Puoi scriverlo solo se porti una prova più forte, con `gia_noto` che cita la chiave.
- Se c'è ma risulta chiuso o riparato, ed è tornato, è una **regressione**. Non va in `difetti` ma in `regressioni`, con la chiave della voce, la prova e l'esito.

**5.6 Il formato del referto.**
```json
{
  "sessione": "S03",
  "base_sito": "<BASE_SITO>",
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
  "ricontrolli": [{ "chiave": "dimensione|titolo", "indice": 123, "esito": "ancora_vero | non_piu_vero | cambiato | non_verificabile", "prova": "…", "nota": "…" }],
  "domande_per_nicola": [],
  "conto": { "agenti": 0, "token_sessione": {}, "token_subagenti": {}, "token_workflow": [], "nota": "" }
}
```
- `file` è uno o più posti separati da « · ». Ogni posto è `percorso:riga` o `percorso:inizio-fine`. Ci sono quattro eccezioni:
  - `live:<indirizzo pubblico>` e `vercel:<rilascio o lavoro>`, solo in S11;
  - `produzione:<oggetto>`, solo in S05 e S11;
  - `(nel referto privato)`, solo per le riservate.
- `ricontrolli` lo compila solo S01. `indice` serve solo a leggere: la voce si ritrova per `chiave`.
- `conto` lo riempi alla fine con le uscite di `conto-token.mjs` (§1).

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
- `gia_noto`, `perimetro_altrui` e `perche_umano` uguali a `null`.

**Dove vanno i dettagli.** Appena una falla è confermata, scrivi subito i suoi dettagli **in un messaggio in chat**, mai in un file, con il suo id `SNN-0xx`: file e righe, come si sfrutta, la prova, il verdetto di chi l'ha verificata, la seconda lente. Nel messaggio finale ripetili tutti.

**5.10 Quando hai finito.**
- Misura il tuo conto dei token come dice il §1, e spingi il referto con `"finita": true`.
- Il tuo ultimo messaggio dice:
  - quanti difetti per gravità, quante regressioni, quanti ricontrolli per esito (solo S01);
  - il commit finale;
  - cosa non hai coperto;
  - i dettagli di tutte le falle riservate.
- Manda lo stesso riassunto **senza** i dettagli riservati alla sessione dell'AD con `send_message`.

## 6. Aprire le sessioni e sorvegliarle (una volta per ondata)

**6.1 Aprire.** Prima rifai il 3.0. Poi avvisa Nicola che ogni `create_session` gli chiederà un clic (5 nella prima ondata, 7 nella seconda) e poi l'approvazione di ogni piano. Per ogni sessione dell'ondata chiama `create_session` con:
- `title`: «Radiografia SNN — <nome>» (mai un dettaglio di una falla);
- `permission_mode`: `"plan"`;
- `source_url`: `https://github.com/NicolaeRotaru/ad-mycity`;
- `source_revision`: lo **SHA** del tuo ramo da dare a quell'ondata, mai il nome del ramo. Per la prima ondata è il commit della fase 0; per la seconda è il commit con `trovati-ondata-1.txt` (6.4);
- `outcome_branch`: `<il tuo ramo>-rNN`;
- `tags`: `["radiografia-12-sessioni"]`;
- `prompt`, breve: «Sei la sessione SNN della radiografia in 12 sessioni. Leggi `consegne/audit/<cartella>/LEGGIMI.md` e la tua scheda `consegne/audit/<cartella>/schede/SNN.md`. Sei in modalità piano: proponi il piano come chiede il punto 5.2 e aspetta l'approvazione. La sessione dell'AD è `<id>`.»

Scrivi ogni sessione in `sessioni.json` con la sua `partenza`, e manda a Nicola l'elenco con il link di ognuna.

**6.2 I piani.**
- Programma con `send_later` un controllo dopo 15 minuti.
- Leggi ogni piano con `list_events`, `kinds: ["assistant"]`: è la chiamata di uscita dalla modalità piano. Se un piano non è ancora pronto, riprogramma il controllo fra 15 minuti.
- Confronta il piano con la scheda: perimetro, prove su copie, tetto degli agenti, sola lettura, un solo file nel ramo, riservato, salvataggi a pezzi.
- Poi scrivi a Nicola, per ogni sessione:
  - «✅ approva la SNN», oppure
  - «✏️ la SNN va corretta: …», con il testo esatto da scrivere nella sessione come risposta al piano.
- Ricordagli di scegliere, quando approva, l'opzione che mette la sessione in modalità **automatica**, non «accetta le modifiche»: con quella ogni `git push`, `npm ci` o `psql` aspetterebbe un clic che nessuno dà. Se l'opzione automatica non c'è, deve dirtelo prima di approvare.

**6.3 La sorveglianza.** Una sola catena di controlli, ogni 30 minuti.
- **La catena.** Alla fine di ogni controllo programma il successivo con `send_later` (`delay_minutes: 30`), e scrivi il `trigger_id` nel diario. `send_later` suona una volta sola. Se ti svegli per un altro motivo (un messaggio di una sessione, un evento della PR), guarda prima nel diario o con `list_triggers` se il prossimo controllo è già in coda, e non programmarne un secondo. Mai `sleep`, mai giri di attesa. Mentre le sessioni lavorano, non fare turni più lunghi di 30 minuti.
- **A ogni controllo, per ogni sessione attiva:**
  - `get_session` per `status_bucket` e `permission_mode`. Se dopo l'approvazione il modo non è automatico, avvisa Nicola subito. Se è `blocked`, guarda con `list_events` se è ferma su un clic e avvisa Nicola.
  - `list_events` con `kinds: ["assistant","result"]` e `limit: 20`. Il lavoro lo giudichi dal referto nel ramo, non dalla trascrizione.
  - `git fetch` del suo ramo, poi `guardia-ramo` e `valida-referto` sul referto parziale.
  - Su `NicolaeRotaru/mycity` nessun ramo o commit nuovo delle sessioni (`mcp__github__list_branches`).
  - Una riga nel diario: ora, sessione, cosa hai visto (le falle solo contate), cosa hai fatto.
- **Il diario e `sessioni.json`.** Li committi a ogni controllo, ma li spingi solo appena hai creato le sessioni e a fine ondata: ogni spinta fa ripartire la CI della bozza.
- **Le correzioni.**
  - Una sessione esce dal perimetro, cambia altri file o ne lascia di temporanei: mandale una correzione con `send_message`.
  - Tenta una scrittura sul mondo vero: fermala con `interrupt_session` e avvisa Nicola subito.
  - Si ferma per i limiti: scrivilo e avvisa Nicola. Quando si può riprendere mandale «riprendi dal referto salvato al commit …».

**6.4 Fine ondata.** Quando tutte le sessioni dell'ondata hanno `"finita": true`:
- Smetti di programmare controlli. Non cancellarli: `delete_trigger` chiede un clic.
- **I dettagli riservati** restano nelle trascrizioni delle sessioni. Nel diario scrivi solo dove stanno (sessione e uuid dell'evento), e li rileggi da lì in 7.3 e 7.8. Non archiviare nessuna sessione figlia prima del 7.8.
- **Scrivi `trovati-ondata-1.txt`** (solo dopo la prima ondata): una riga per ogni difetto della prima ondata, anche quelli con `perimetro_altrui`, con id, sessione, gravità, file e titolo. Le riservate solo con id e titolo generico. Fai commit e push: la seconda ondata parte da quel commit.
- **Il riassunto a Nicola,** breve: quanti difetti per sessione e per gravità, quante `domande_per_nicola`, cosa è andato storto, il conto. Per la prima ondata aspetta il suo «via la seconda», e prima di partire rifai il 3.0.

## 7. Il controllo finale, cioè tu

L'ordine conta: prima i programmi, poi gli agenti.

**7.1 I programmi, a zero agenti.**
1. Porta la tua copia `marketplace/` su BASE_SITO col comando del 3.2.
2. Lancia `guardia-ramo` e `valida-referto` su tutti i 12 rami. Un ramo rosso non entra finché la sua sessione non l'ha sistemato.
3. Raccogli tutti i difetti in un file solo, nello scratchpad.
4. Lancia `copertura-dopo`.
5. Dai a ogni falla riservata nuova un numero R libero, in fila dal più alto del registro più uno (il 6/11 il più alto era R294), e scrivilo nel titolo. Solo dopo la rilettura della riservatezza (7.5, passo 1) porti i 12 referti sul tuo ramo:
```bash
git checkout origin/<il tuo ramo>-rNN -- consegne/audit/<cartella>/referti/SNN.json
```

**7.2 I doppioni, prima della verifica.**
- Prima un programma: stessa chiave, oppure stesso file a meno di 10 righe e titoli simili, contro il registro, contro `trovati-ondata-1.txt` e fra le sessioni.
- Poi un agente leggero (`model: 'sonnet'`) unisce i doppioni scritti con parole diverse. Di ogni gruppo tieni la versione con la prova più forte, e scrivi da chi altro è stato visto.
- Quelli già nel registro e ancora aperti escono.
- **Le falle riservate non passano dal programma:** hanno tutte lo stesso `file` e titoli quasi uguali. I loro doppioni li cerchi nello scratchpad, sui dettagli privati, fra le sessioni e con i referti privati della D7 se Nicola li ha dati. Senza quei referti ognuna resta nuova, e lo scrivi in «Cosa non ho verificato».

**7.3 La verifica indipendente.** Un workflow con verificatori `agentType: 'qa'` che non hanno mai visto quei difetti, con il mandato di smentirli. Ognuno parte dalla prova citata (regola ⑯) e la rilancia sulla copia.
- **Prima di lanciare:**
  - rifai il 3.0;
  - conta gli agenti: gravi e bloccanti × 2, più minori ÷ 6, più ricontrolli di S01 ÷ 6, più le regressioni.

  Se il conto supera 150, o il limite non è `allowed`, fermati e porta a Nicola il conto e le opzioni. Girano due agenti alla volta.
- **Gravi e bloccanti:** uno per verificatore, con due lenti diverse: è vero e si riproduce? Quanto pesa davvero? Si verificano per primi.
- **Minori:** un verificatore per gruppo, al massimo 6 difetti dello stesso file o flusso. Nel dubbio si scarta.
- **I ricontrolli di S01** (`non_piu_vero` e `cambiato`) e **le regressioni:** a gruppi di 6. Chiudere un difetto vero lo nasconde, quindi qui nel dubbio **resta aperto**.
- **Le falle riservate:** stessa regola, ma dentro lo scratchpad, coi dettagli riletti dalle trascrizioni.
- **I salvataggi.** Gli esiti si salvano a pezzi in `consegne/audit/<cartella>/verifica/` (senza dettagli riservati) e si spingono. Dopo una ripresa su una macchina nuova si legge quello e si verifica solo il mancante.

**7.4 Il critico di completezza.** Un agente legge:
- `copertura-dopo`;
- le lenti e gli angoli;
- il `non_guardato` di ogni sessione;
- i cinque buchi dichiarati il 5/11: il sito vero nel browser, Stripe, l'aspetto, la consegna veloce, i difetti vecchi mai ricontrollati;
- le falle riservate aperte: quante ricontrollate, quante no e perché.

Elenca cosa manca ancora. Se un buco conta, fai un terzo giro piccolo, al massimo 4 agenti, poi ti fermi. Quello che resta va in «Cosa non ho verificato». Le riservate non ricontrollate ci vanno col numero esatto e con quante sono bloccanti o gravi. Non c'è un quarto giro senza Nicola.

**7.5 Scrivere, in quest'ordine.**

1. **Allinea il ramo a `main`.** `git fetch origin main` e `git merge origin/main`.
   - Se va in conflitto `radiografia-marketplace.json`, prendi la versione di `main` e rifai i passi del registro coi programmi. Non scegliere mai i pezzi a mano.
   - Una chiusura di S01 si applica solo se la voce su `main` è ancora `aperto`. Le altre vanno nel referto come «già chiusa da …».
   - STATO.md, LAVORO-APERTO.md e AZIONI-IN-ATTESA.md si scrivono per ultimi, dopo il merge.
2. **La rilettura della riservatezza.** Due agenti `security`, che non hanno né trovato né verificato le falle, leggono i dettagli dallo scratchpad. Poi leggono tutto il testo che sta per diventare pubblico: il grezzo, il referto, il corpo della PR, le voci del registro che cambi, i referti portati sul ramo, `trovati-ondata-1.txt`, il diario.
   - Segnano ogni campo che ripete una frase di otto parole di una falla, o che nomina qualcosa che sta solo nelle falle.
   - Ogni segno si oscura, oppure si dichiara «già pubblico» col perché.
   - Si scrive e si spinge solo quando sono tornati tutti e due. È lo stesso metodo di `cervello/lotto-a-pacchetti.md`.
3. **Il referto** `consegne/audit/<data>-radiografia.md`, scritto ora col nome finale, anche in bozza: il digest lo collega solo se esiste già.
   - L'intestazione è come quella del 5/11: data con l'ora, `codice: … @ <BASE_SITO>`, `fonte_raw`.
   - Prima le quattro risposte (In parole semplici · Cosa cambia per te · Cosa devi fare · Cosa non ho verificato), con un esempio vero.
   - Poi i Dettagli tecnici: come è stata fatta, le 12 sessioni con i loro rami, i run, la copertura con i conti per segno, il conto dei token.
   - Poi l'elenco completo dei bloccanti e dei gravi, e i minori per area. Le riservate solo col numero R e il titolo generico.
   - `node cervello/si-capisce.mjs` deve passare.
4. **I ricontrolli di S01 e le regressioni, prima del digest**, solo quelli confermati dalla verifica. Le regole del programma:
   - Trova ogni voce per `chiave` con `chiaveProblema` importata da `cervello/referti-sito.mjs`, mai per indice: il digest sposta tutti gli indici. Controlla che il titolo coincida con quello di `da-ricontrollare.txt`. Si ferma senza scrivere se una chiave non aggancia esattamente una voce.
   - `non_piu_vero` confermato: `stato: "gia_riparato_prima"` e `nota_riparazione: "Già riparato nel codice unito (ricontrollo del <G/M>, run <runId>, confermato dal verificatore). <prova>"`.
   - **Ogni** voce ricontrollata, qualunque sia l'esito, prende `riverifica_<G>_<M>: { data: "AAAA-MM-GG HH:MM", esito, prova, run, codice: "<BASE_SITO>" }`, come `riverifica_1_11`. Gli `ancora_vero`, `cambiato` e `non_verificabile` restano `aperto`. Per `cambiato` la nota dice cosa è cambiato.
   - Regressione confermata: la voce vecchia torna `stato: "aperto"`, con `riaperto_il: <ora di Piacenza>`, `riaperto_da: "radiografia <data> · SNN, verificato"` e la prova nuova in `nota_<G>_<M>`. Le regressioni **non** vanno nel grezzo: il digest copierebbe sopra lo stato vecchio.
   - Nessuna voce si cancella e nessun titolo si riscrive.
5. **Il grezzo** `consegne/audit/<data>-radiografia-marketplace-raw.json`, nella forma di `consegne/audit/2026-11-05-radiografia-marketplace-raw.json`:
   - `data`, `tipo: "radiografia-marketplace"`, `fonte`, `codice_analizzato`, `totale`, `bloccanti`, `gravi`, `minori` e `dimensioni: [{ dimensione, findings }]`;
   - ogni difetto con i campi di quel file, più `fonte_radiografia: "radiografia <data> · SNN"` (e «vista anche da …») e `giro`;
   - le riservate col numero R, senza `riverifica` né `gia_noto`.

   Prima di scriverlo, un programma controlla che ogni chiave `dimensione|titolo` del grezzo sia unica e non sia già nel registro.
6. **Il digest, una volta sola.** Conta il registro, lancia `node cervello/radiografia-marketplace-digest.mjs`, conta di nuovo. Un secondo giro azzera `confronto_precedente`. I controlli:
   - le voci nuove devono essere esattamente quelle del grezzo;
   - le voci vecchie, confrontate per chiave, devono avere lo stato del passo 4.
   - Se non torna, fermati.

   Poi scrivi a mano `sintesi` con le due righe «In parole semplici» del referto, e controlla due cose: che `report` sia `consegne/audit/<data>-radiografia.md`, e che `confronto_precedente.data` sia `2026-11-05`.
7. **Le domande.** Unisci le `domande_per_nicola` dei 12 referti, senza doppioni, in `consegne/audit/<cartella>/domande-per-nicola.md`. Quelle che chiedono una decisione vanno in `AZIONI-IN-ATTESA.md`. Il numero va nel blocco «Cosa devi fare».
8. **La memoria.**
   - `STATO.md`: sostituisci il blocco della radiografia del 5/11, non aggiungerne uno nuovo. Il file ha circa 194.000 caratteri e il controllo della memoria ne legge 200.000: dopo, `node cervello/campo-visivo-memoria.mjs` deve uscire 0.
   - `LAVORO-APERTO.md`, `AZIONI-IN-ATTESA.md` per quello che solo Nicola può fare.
   - `DECISIONI.md` per la rete aperta e per le chiusure.
   - Una riga ESITO: `node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" "#radiografia"`.

**7.6 Prima di chiudere la PR.**
1. Prepara la macchina come la CI: `bash cervello/installa-bats.sh && npm --prefix pannello ci`.
2. Lancia `node cervello/cancello-lotto.mjs`, che lancia già `test-cervello.mjs` e `radiografia-in-corsa.mjs`.
3. Poi `npx --prefix pannello tsc --noEmit --project pannello/tsconfig.json` e `node cervello/coerenza-fatti.mjs`.
4. Quello che è rosso per colpa tua lo sistemi. Un ⚪ per uno strumento che qui manca (il browser della CI) non è un verde e non è colpa tua: scrivilo. Il verdetto che conta è la CI sulla PR.
5. Chiama `subscribe_pr_activity` sulla PR.

**7.7 La PR.**
- Togli la bozza (chiede un clic) e metti un titolo detto a voce.
- Il corpo apre con le quattro risposte, poi i dettagli tecnici con l'elenco dei 12 rami figli: cancellarli dopo l'unione lo decide Nicola.
- Mai unire.

**7.8 L'ultimo messaggio a Nicola.** In quest'ordine:
- le quattro risposte;
- subito sotto i bloccanti nuovi, ognuno col titolo detto a voce (le riservate solo col numero R e il titolo generico);
- il link della PR;
- il referto privato delle falle riservate, solo in chat, riletto dalle trascrizioni;
- in fondo, il controllo a sorpresa: tre difetti scelti a caso, con la prova lanciata davanti a lui.

Solo dopo questo messaggio le sessioni figlie si possono archiviare, e solo se Nicola lo dice.

## 8. Quando fermarti e chiedere a Nicola, subito

- Il limite settimanale non è `allowed` quando stai per aprire un'ondata o lanciare la verifica.
- Una sessione ha scritto, o ha provato a scrivere, sul mondo vero.
- Un difetto bloccante tocca soldi veri o la legge oggi: non aspettare la fine.
- Il commit BASE_SITO non si scarica.
- Una chiave non aggancia esattamente una voce, o il conteggio del registro prima e dopo non torna.
- Una data è già occupata da un referto (3.3).
- Il conto della verifica supera 150 agenti.
- Servirebbe un quarto giro.

## 9. Fatto vuol dire

- Il collaudo dei controlli della fase 0, con ogni caso sbagliato rosso.
- 12 referti con `"finita": true`, verdi a `guardia-ramo` e `valida-referto`, portati sul ramo della PR.
- Ogni difetto nuovo verificato da chi non l'ha trovato, e ogni grave e bloccante con una prova che rispetta l'asticella.
- Ogni chiusura di S01 e ogni regressione confermate da un verificatore, applicate per chiave.
- `copertura-dopo` nel referto, con i conti per segno e l'elenco dei file non coperti, anche se è vuoto.
- La rilettura della riservatezza fatta da due agenti prima di ogni testo pubblico.
- Il registro aggiornato, con il conteggio che torna e `report` e `confronto_precedente` giusti.
- Il referto che passa `si-capisce`.
- Una sola PR, pronta, con la CI vista.
- Il referto privato dato a Nicola in chat.
- Il conto dei token di tutte le sessioni nel referto.
