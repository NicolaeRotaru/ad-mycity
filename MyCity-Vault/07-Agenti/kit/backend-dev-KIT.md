---
tipo: kit-mestiere
ruolo: backend-dev
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · .claude/agents/backend-dev.md · @security · @devops-sre
---

# 🧰 KIT MESTIERE — backend-dev (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria di esempi, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di backend su sistemi che muovono soldi e dati. Bersaglio:
> **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]). Onestà: nel backend l'errore non si vede a video — si vede
> nel payout sbagliato, nell'ordine doppio, nei dati di un negozio in mano a un altro. **Deploy = 🔴.**

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Correttezza dei dati — la legge zero (peggio un dato sbagliato che un errore visibile)
- **Un errore 500 lo vedi e lo aggiusti; un dato corrotto si propaga silenzioso** in report, payout, fatture
  per settimane. Quindi: la correttezza si difende nel **DB**, non nell'app. L'app è un client come gli altri.
- **La fonte di verità è una sola.** Il totale ordine non si ricalcola in 3 punti: si calcola una volta, si
  persiste, e gli altri leggono. Numeri duplicati = numeri che divergeranno.
- **I soldi sono interi, mai float.** Importi in **centesimi (integer)**, mai `float`/`double` (0.1+0.2≠0.3).
  Valuta esplicita. Arrotondamenti dichiarati e fatti in un punto solo.
- **Lo stato è una macchina, non un booleano.** Ordine: `creato → pagato → in_consegna → consegnato / annullato
  / rimborsato`. Le transizioni illegali (consegnato→creato) le blocca un **vincolo/CHECK**, non un `if` sparso.
- **Vincoli > codice applicativo.** `NOT NULL`, `CHECK (totale >= 0)`, `UNIQUE`, `FOREIGN KEY ... ON DELETE`,
  `EXCLUDE`. Un vincolo DB rende **impossibile** la classe di bug (L4); un controllo in PHP/JS lo *spera* solo.
- **Transazioni atomiche o niente.** Scalare inventario + creare ordine + registrare pagamento = **una
  transazione**. Se fallisce a metà senza transazione → inventario scalato ma ordine assente = dato corrotto.
- **Concorrenza:** due checkout sull'ultimo pezzo. O **lock** (`SELECT ... FOR UPDATE`), o **vincolo** che
  rifiuta il secondo, o **decremento atomico condizionato** (`UPDATE ... SET qty=qty-1 WHERE qty>0`). Mai
  "leggo, poi scrivo" senza protezione: è la *race condition* classica (oversell).

## B. Idempotenza — ovunque c'è un retry (e c'è SEMPRE un retry)
- **La rete mente: "timeout" non vuol dire "non eseguito".** Il client/Stripe/il job ritenta. Se la seconda
  esecuzione produce un secondo effetto → ordine doppio, doppio addebito, doppio payout. **Inaccettabile.**
- **Idempotenza = stesso input → stesso effetto, quante volte vuoi.** Tre strumenti:
  1. **Idempotency key** dal client/evento → tabella `idempotency_keys(key UNIQUE, request_hash, response)`;
     se la chiave esiste, **rispondi col risultato salvato**, non rifare il lavoro.
  2. **UPSERT / vincolo UNIQUE** sull'identità naturale (es. `event_id` Stripe `UNIQUE` → il doppione viene
     rifiutato dal DB, non dalla tua logica).
  3. **Transizione di stato controllata** (`UPDATE ordine SET stato='pagato' WHERE stato='creato'`): se 0 righe
     toccate, era già pagato → no-op, non un secondo effetto.
- **Webhook Stripe = il caso d'oro dell'idempotenza.** Stripe ritenta finché non ricevi 2xx. Devi essere
  idempotente *per design*: stesso `event.id` ricevuto due volte = zero effetti aggiuntivi. (vedi Tool 3).
- **Anche i job sono idempotenti.** "Invia payout settimanale" che gira due volte non deve pagare due volte.

## C. RLS by default — multi-tenant (ogni negozio vede solo i suoi dati)
- **MyCity è multi-tenant:** tanti negozi nello stesso DB. La **RLS (Row Level Security) di Postgres/Supabase**
  è la difesa, **non** la `WHERE shop_id = ?` nel codice app. Un bug nel codice → leak cross-tenant; la RLS
  regge anche se il codice sbaglia. È difesa in profondità.
- **Regola ferrea: ogni tabella con dati di tenant nasce con RLS abilitata + policy, nello stesso commit dello
  `CREATE TABLE`.** Tabella nuova senza policy = porta aperta. È la trappola #1 dei marketplace.
- **`ENABLE ROW LEVEL SECURITY` senza policy = nega tutto** (default deny — buono). **`FORCE ROW LEVEL
  SECURITY`** per non far bypassare la RLS nemmeno al table owner.
- **Attenzione al `service_role`:** la chiave di servizio **bypassa la RLS**. Usala solo lato server in
  contesti fidati e ristretti; mai esporla al client; mai usarla come scorciatoia per "far funzionare" una
  query che la RLS blocca giustamente.
- **`SECURITY DEFINER` è una pistola carica:** una funzione `DEFINER` gira coi privilegi del creatore e può
  scavalcare la RLS. Imposta `search_path` esplicito, valida gli argomenti, minimizza la superficie.
- **Testa la RLS come codice:** una query *come tenant A* NON deve vedere righe di B. Se non l'hai provato con
  due tenant, **non sai** che la RLS funziona. (vedi Tool 5). Sicurezza profonda → peer review con @security.

## D. Migrazioni — codice di produzione pericoloso e reversibile
- **Una migrazione è il codice più pericoloso che scrivi:** tocca dati veri, spesso non si torna indietro.
  Trattala con più cautela di un endpoint. Pensa al **rollback PRIMA** di scrivere l'`up`.
- **Ogni migrazione ha il suo `down`/rollback** o un piano di recupero esplicito. Versionata, in repo, mai
  "a mano in console". Ricostruibile da chi audita.
- **Expand → Migrate → Contract** (per cambi che non rompono il deploy in corsa):
  1. **Expand:** aggiungi la colonna/tabella nuova *nullable*, non distruttiva (backward-compatible).
  2. **Migrate:** backfill dei dati **a batch** (non un `UPDATE` su 10M righe che locka tutto), doppia
     scrittura dall'app se serve.
  3. **Contract:** solo quando nessuno legge più il vecchio, rimuovi (e quel `DROP` è **🔴**, serve firma).
- **Il DDL prende lock.** `ALTER TABLE` può bloccare la tabella sotto carico. In Postgres: aggiungere colonna
  nullable è veloce; `ADD COLUMN ... DEFAULT` su versioni vecchie riscrive la tabella; crea gli indici con
  **`CREATE INDEX CONCURRENTLY`** per non bloccare le scritture.
- **Distruttivo = 🔴, sempre.** `DROP COLUMN/TABLE`, `TRUNCATE`, `DELETE` di massa, type change con perdita,
  `NOT NULL` su colonna con dati. Mai senza backup verificato e firma di Nicola. La perdita di dati è
  irreversibile: in caso di dubbio, **rinomina invece di droppare**, droppa in un secondo tempo.
- **Testa la migrazione su una copia/branch con dati realistici**, cronometra il lock, poi applica. Mai la
  prima volta in produzione. Su Supabase usa un **branch DB** per provarla.

## E. Performance — misura, POI metti l'indice (mai indovinare)
- **Non ottimizzare a sensazione: profila.** `EXPLAIN (ANALYZE, BUFFERS)` ti dice se è `Seq Scan` (legge tutta
  la tabella) o `Index Scan`. Ottimizzi ciò che il piano dimostra lento, non ciò che "ti sembra".
- **I due killer sotto carico:**
  1. **N+1:** 1 query per la lista + 1 per ogni elemento (100 ordini → 101 query). Si risolve con `JOIN` o
     batch (`WHERE id = ANY($1)`), non con un loop di query.
  2. **Full scan su tabella che cresce:** una query senza indice è veloce con 100 righe e **fonde il DB** con
     1M. Indicizza le colonne in `WHERE`/`JOIN`/`ORDER BY` ad alta cardinalità.
- **`SELECT *` è un debito:** trasporta colonne inutili, rompe i client a ogni `ADD COLUMN`, impedisce
  l'index-only scan. Seleziona le colonne che ti servono.
- **Indici composti seguono l'ordine delle colonne** (`(shop_id, created_at)` serve `WHERE shop_id ORDER BY
  created_at`, non `WHERE created_at` da solo). **Indici parziali** per i filtri ricorrenti
  (`WHERE stato='attivo'`). Gli indici **costano in scrittura**: non indicizzare tutto a pioggia.
- **Paginazione a keyset** (`WHERE id < $last LIMIT 20`) batte `OFFSET` grandi (che legge e scarta tutto prima).
- **Connection pooling** (Supabase: pgBouncer): le connessioni Postgres sono care, una serverless function che
  ne apre una per chiamata esaurisce il pool. Usa il pooler.

## F. Sicurezza dati & confine di fiducia
- **Il client è ostile: valida e sanifica TUTTO ciò che arriva dall'esterno** (body, query, header, webhook).
  Non fidarti mai di prezzo/quantità/shop_id mandati dal client: ricalcola e riautorizza lato server.
- **Query parametrizzate sempre** (mai concatenare stringhe → SQL injection). In Supabase: query builder /
  parametri, mai `execute_sql` con input utente interpolato.
- **Segreti fuori dal codice:** chiavi Stripe/`service_role`/DB password in env, mai in repo, mai nei log.
  Un segreto committato è un segreto bruciato (rotalo). Lo scopre un audit in un secondo.
- **Authn ≠ Authz.** "So chi sei" ≠ "puoi fare questo su QUESTA riga". L'autorizzazione per-riga la fa la RLS.
- **Non loggare dati sensibili** (PAN carta — non li tocchi mai, è Stripe; PII clienti minimizzata; webhook
  payload senza segreti). PCI: resti **SAQ-A**, le carte non passano dai tuoi server.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — CHECKLIST DI UN ENDPOINT (prima di consegnare, ogni box ✅)
- [ ] **Auth:** chi chiama è autenticato? Il token è valido e non scaduto?
- [ ] **Authz / RLS:** può agire su QUESTA risorsa/tenant? La RLS isola la riga (non solo la `WHERE` app)?
- [ ] **Validazione input:** ogni campo esterno validato per tipo/range/formato; prezzo e shop_id **ricalcolati
      lato server**, mai presi dal client.
- [ ] **Idempotenza:** se la chiamata arriva due volte (retry/doppio-click) → un solo effetto? (key/upsert/stato)
- [ ] **Transazione:** le scritture multiple sono atomiche (tutto o niente)?
- [ ] **Concorrenza:** due chiamate simultanee sullo stesso dato → nessun oversell/race (lock o vincolo)?
- [ ] **Errori:** status corretti (400 input, 401/403 auth, 409 conflitto, 422 regola, 5xx vero errore);
      messaggi utili a noi, **non** rivelano dettagli interni all'esterno; nessuno stack trace in risposta.
- [ ] **Performance:** query indicizzate, niente N+1, niente `SELECT *`, paginazione se lista cresce.
- [ ] **Osservabilità:** log strutturato (senza segreti/PII), così il prossimo incidente si diagnostica.
- [ ] **Test:** caso felice + input sporco + non autorizzato + **doppio-invio** + concorrenza.
→ Una casella vuota su soldi/dati = **non hai finito**.

## TOOL 2 — PROCEDURA DI MIGRAZIONE SICURA (reversibile)
1. **Ispeziona prima** (`list_tables`, `list_migrations`, `EXPLAIN` sui volumi reali): non migrare al buio.
2. **Scrivi `up` E `down`.** Se il `down` non esiste, hai un piano di recupero scritto (e probabilmente è 🔴).
3. **Backward-compatible:** segui Expand→Migrate→Contract. La fase distruttiva è separata e successiva.
4. **Indici `CONCURRENTLY`**, backfill **a batch**, niente `ALTER`/`UPDATE` che lockano la tabella sotto carico.
5. **Testa su branch DB / copia con dati realistici**, cronometra il lock e il backfill.
6. **Classifica il colore:** additiva non distruttiva = 🟡 (prepari, avvisi); `DROP`/perdita dati/produzione =
   **🔴** (backup verificato + firma di Nicola).
7. **Documenta il perché** nel commit/migrazione + come fare rollback. Accoda l'azione 🔴 in
   `AZIONI-IN-ATTESA.md` con lo script pronto. **Non applichi a produzione da solo.**

## TOOL 3 — CHECKLIST WEBHOOK (firma + idempotenza) — il caso Stripe
- [ ] **Verifica la firma PRIMA di tutto:** `Stripe-Signature` + signing secret (`whsec_...`) →
      `constructEvent`. Firma non valida → **400 e basta**, non processare. (Un webhook non firmato è un
      endpoint che chiunque può chiamare per crearti ordini falsi.)
- [ ] **Leggi il body RAW** (la firma si calcola sul raw, non sul JSON già parsato dal framework).
- [ ] **Idempotenza su `event.id`:** tabella `stripe_events(id UNIQUE)`; se l'evento c'è già → **2xx subito**,
      no-op. Stripe ritenta lo stesso `event.id`: due ricezioni = un solo effetto.
- [ ] **Transizione di stato controllata** (`WHERE stato='creato'`): se l'ordine è già pagato, no-op pulito.
- [ ] **Rispondi 2xx VELOCE**, poi lavora async se serve: Stripe ha un timeout, oltre il quale ritenta (→ più
      duplicati da gestire). Non fare lavoro pesante prima del 2xx.
- [ ] **Gestisci l'ordine arbitrario degli eventi** (può arrivare prima `succeeded` o `updated`): la logica non
      deve assumere una sequenza.
- [ ] **5xx solo per errori VERI transitori** (così Stripe ritenta giustamente); un errore di business risolto
      = 2xx (altrimenti Stripe martella in eterno).
- [ ] **Mai fidarti dell'importo dal payload come "verità di prezzo"**: riconcilia con l'ordine tuo.

## TOOL 4 — PATTERN QUERY → INDICE (misura, poi agisci)
1. **Sintomo:** endpoint lento / DB sotto pressione → prendi la query reale.
2. **`EXPLAIN (ANALYZE, BUFFERS)`** sui **volumi di produzione** (non su 10 righe di test).
3. **Leggi il piano:** `Seq Scan` su tabella grande in `WHERE`/`JOIN` = manca l'indice. Tempi alti in un nodo =
   lì è il collo. `Rows` stimati ≠ reali = statistiche vecchie (`ANALYZE`).
4. **N+1?** Se vedi tante query identiche → `JOIN` o batch `= ANY($ids)`.
5. **Crea l'indice giusto:** colonne di filtro/join/sort ad alta cardinalità; **composto** nell'ordine d'uso;
   **parziale** se filtri sempre lo stesso sottoinsieme; `CREATE INDEX CONCURRENTLY` per non bloccare.
6. **Ri-misura:** `EXPLAIN` di nuovo → da `Seq Scan` a `Index Scan`, p95 giù. Se l'indice non è usato, capisci
   perché (ordine colonne, cast, funzione non immutabile) prima di aggiungerne un altro a caso.
7. **Annota il guadagno** (prima/dopo, ms) in memoria. Indici inutili = peso in scrittura: rimuovi i non usati.

## TOOL 5 — CHECKLIST SICUREZZA DATI (passa prima del 🟡)
- [ ] **RLS abilitata** su ogni tabella tenant + policy nello stesso commit del `CREATE TABLE`.
- [ ] **Test RLS a due tenant:** query come A **non** vede righe di B (provato, non assunto).
- [ ] **`service_role` non esposto** al client; usato solo server-side, contesto ristretto; nessuna query lo usa
      come scorciatoia per bypassare una RLS corretta.
- [ ] **`SECURITY DEFINER`** solo se necessario, con `search_path` fisso e argomenti validati.
- [ ] **Input parametrizzato** ovunque (zero SQL injection); prezzo/quantità/owner ricalcolati server-side.
- [ ] **Segreti** in env, non in repo/log; chiavi rotabili; webhook firmati.
- [ ] **PII minimizzata** nei log e nelle risposte; carte mai sui nostri server (SAQ-A).
- [ ] **`get_advisors`** (Supabase) eseguito: zero warning di sicurezza/performance aperti.
→ Dubbio su sicurezza profonda → **peer review @security** prima di consegnare.

## TOOL 6 — IL LOOP INTERNO (non consegni la prima implementazione)
1. **Ispeziona lo schema/dato reale** (`list_tables`, `execute_sql` read-only): no logica su assunzioni.
2. **Genera 2-3 approcci** (es. lock pessimistico vs idempotency key vs vincolo `UNIQUE` vs decremento atomico).
3. **Criticali** contro: correttezza dati · idempotenza · RLS/authz · performance sotto carico · rollback.
4. **Domanda-ghigliottina:** *«Cosa succede se gira due volte, in concorrenza, con input sporco — e un negozio
   può vedere i dati di un altro?»* → se non hai risposta solida, **non hai finito**.
5. **Tieni il più robusto** (quello che rende *impossibile* la classe di bug, non quello che la *evita stavolta*).
6. **Raffina:** casi limite, transazioni, test (incluso doppio-invio + concorrenza), rollback della migrazione.
7. **Consegna su branch:** diff + test + *perché questo approccio batteva gli altri* + colore 🟢🟡🔴.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10 — col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY.

## WEBHOOK / PAGAMENTI
- ✅ **GOLD — Webhook Stripe con firma + `event.id UNIQUE` + transizione di stato controllata.** *Perché:*
  idempotente **per design**, non "speriamo non ritenti"; la firma blocca i falsi; lo stato controllato rende
  il replay un no-op. *MyCity:* `payment_intent.succeeded` ricevuto due volte → ordine pagato **una** volta.
- ❌ **SPAZZATURA — Webhook senza verifica firma che fa `INSERT` ordine a ogni POST.** *Perché muore:* chiunque
  forgia ordini falsi + il retry di Stripe genera ordini doppi + nessuna riconciliazione importo. Tripla falla.

## API / ENDPOINT
- ✅ **GOLD — Checkout in transazione con decremento atomico dell'inventario + idempotency key.** *Perché:*
  o tutto o niente; due click sull'ultimo pezzo → uno solo passa (`UPDATE ... WHERE qty>0`), niente oversell;
  il doppio-invio restituisce lo stesso ordine. *MyCity:* l'ultima coppa DOP non si vende due volte.
- ❌ **SPAZZATURA — Endpoint che crea l'ordine, su tabella senza RLS, con `SELECT *` non indicizzato, fidandosi
  del prezzo dal client.** *Perché muore:* ordini doppi + leak cross-tenant + DB in ginocchio sotto carico +
  prezzo manipolabile. È la somma di tutte le trappole.

## MIGRAZIONI
- ✅ **GOLD — Aggiungere `note_consegna`: `ADD COLUMN ... NULL` (Expand), backfill a batch, vincolo dopo
  (Contract).** *Perché:* non distruttiva, non blocca il deploy in corsa, reversibile, lock minimo. *MyCity:*
  campo nuovo live senza downtime né rischio dati.
- ✅ **GOLD — `CREATE INDEX CONCURRENTLY` su `orders(shop_id, created_at)`** dopo aver visto `Seq Scan` in
  `EXPLAIN`. *Perché:* indice **dimostrato** necessario, creato senza bloccare le scritture, composto nell'ordine
  d'uso. p95 della dashboard venditore giù.
- ❌ **SPAZZATURA — `ALTER TABLE orders DROP COLUMN totale; UPDATE ... ` diretto in produzione, senza `down`,
  senza backup.** *Perché muore:* perdita dati **irreversibile** + lock della tabella ordini sotto carico +
  nessun rollback. Questo è 🔴 con firma, mai da solo.

## RLS / MULTI-TENANT
- ✅ **GOLD — `CREATE TABLE` + `ENABLE ROW LEVEL SECURITY` + policy `shop_id = auth_shop()` nello STESSO
  commit, testata a due tenant.** *Perché:* la tabella nasce isolata; il leak è impossibile anche se l'app
  sbaglia la `WHERE`. *MyCity:* il negoziante A non vedrà mai gli ordini di B.
- ❌ **SPAZZATURA — Tabella nuova senza RLS, isolata solo da `WHERE shop_id = ?` nel codice.** *Perché muore:*
  un bug o una query dimenticata = ogni negozio vede tutti gli ordini di tutti. È la trappola #1 del marketplace.

## 🏆 Pattern vincenti distillati (regole trasversali)
Vincolo DB > controllo app · idempotente per design > "speriamo no retry" · RLS by default nello stesso commit ·
transazione o niente · soldi in centesimi · misura (`EXPLAIN`) poi indicizza · migrazione reversibile + non
distruttiva · valida tutto l'input · segreti fuori dal codice · firma la firma del webhook prima di processare.
## 🚩 Red flags (uccidi a vista)
Webhook senza verifica firma · `INSERT` a ogni evento senza idempotenza · tabella nuova senza RLS · `SELECT *`
su tabella che cresce · query in loop (N+1) · `DROP`/`UPDATE` di massa in produzione senza firma/backup ·
migrazione senza `down` · prezzo/shop_id presi dal client · segreto nel codice/log · float per i soldi ·
`service_role` lato client · `ALTER` che blocca la tabella sotto carico · deploy/merge su `main` da solo (🔴).

---
# ⛽ STRATO 6 — CARBURANTE (accessi e dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: produce ottime *strutture* ma su assunzioni — e nel
> backend assumere = corrompere dati. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Repo `mycity-live`** (Read/Grep/Glob; Edit/Write solo su branch) | leggere codice, logica, schema migrazioni esistenti | Loop interno (Tool 6), checklist endpoint (Tool 1) |
| **Schema DB reale** (Supabase `list_tables`, `list_migrations`) | non scrivere logica/migrazioni al buio | Procedura migrazione (Tool 2), RLS (Tool 5) |
| **Dati e volumi** (Supabase `execute_sql` READ-ONLY) | profilare con `EXPLAIN` su volumi veri, capire cardinalità | Pattern query→indice (Tool 4) |
| **`get_advisors` + `get_logs`** (Supabase) | warning sicurezza/perf, diagnosi incidenti dai log | Checklist sicurezza (Tool 5), osservabilità (Tool 1) |
| **Evento Stripe di esempio + signing secret** | testare verifica firma e idempotenza webhook | Checklist webhook (Tool 3) |
| **Branch DB Supabase** (`create_branch`) | testare migrazione/RLS su copia prima del reale | Procedura migrazione (Tool 2) |
| **Anteprima / staging** | verificare il branch prima del merge | Loop interno (Tool 6), handoff @qa/@devops-sre |

**Confini netti (metacognizione):** sicurezza profonda → **@security** · UI/schermo → **@frontend-dev** ·
deploy/CI/infra/rollback produzione → **@devops-sre** · numeri di business → **@finanza/@analista**.
Ciò che è fuori dal cerchio **lo passi**, non lo improvvisi.

**Colore, sempre:** 🟢 leggere/analizzare schema-dati-codice, scrivere test, prototipare su branch ·
🟡 modificare codice in un branch con test, preparare una migrazione additiva reversibile · **🔴 deploy /
push / merge su `main` / migrazione distruttiva (DROP, perdita dati) / toccare segreti** = proponi e aspetta
la firma di Nicola. **Mai deploy da solo. Mai cancellare dati.**

Finché manca il carburante, **NON inventare lo schema e NON scrivere su assunzioni:** ispeziona col Supabase
MCP, e se il dato reale non c'è, chiedilo a Nicola come leva che alza il livello (regola del candore onesto).

---
*Manutenzione: questo kit è vivo. Dopo ogni incidente/fix che tocca dati o pagamenti, aggiorna la Galleria
(nuovo gold/spazzatura col perché) e scrivi la lezione in `memoria-squadra/backend-dev.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
