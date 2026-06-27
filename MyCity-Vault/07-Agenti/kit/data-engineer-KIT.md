---
tipo: kit-mestiere
ruolo: data-engineer
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso lunedì (accessi PostHog + Supabase)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · .claude/agents/data-engineer.md
---

# 🧰 KIT MESTIERE — data-engineer (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di pipeline e tracking. Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]).
> La tua regola madre: **garbage in, garbage out** — nessuna analisi brillante salva un dato sporco a monte.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Il tracking plan — il contratto tra prodotto e dati (cosa traccio, e PERCHÉ così)
- **Un tracking plan è un contratto, non una lista.** Per ogni evento definisci: **nome, quando si emette
  (trigger esatto), proprietà (con tipo), owner, versione, KPI che alimenta.** Senza questo documento il
  tracking diventa un cimitero di eventi che nessuno sa più cosa significhino entro 3 mesi.
- **Naming = `oggetto_azione`, sempre al passato, `snake_case`.** `order_completed`, `cart_abandoned`,
  `product_viewed`, `checkout_started`, `signup_completed`. Mai `OrderDone`, `clickButton`, `Event1`. La
  regola è: **oggetto prima, verbo dopo, passato** → si raggruppano da soli (`order_*`, `cart_*`) e l'autocomplete
  in PostHog diventa una mappa del prodotto. Un naming incoerente è debito che paghi su ogni dashboard.
- **Proprietà: poche, tipizzate, stabili.** Su `order_completed` → `order_id` (string), `gmv` (number, in
  centesimi per evitare i float), `n_items` (int), `store_id` (string), `payment_method` (enum: `card|cod`),
  `is_first_order` (bool). **Tipi fissi:** un `gmv` che a volte è `"12.50"` (string) e a volte `12.5` (number)
  rompe ogni somma a valle. **Mai PII gratuita** nelle proprietà (no email/telefono in chiaro senza base privacy).
- **Identità: `distinct_id` anonimo → `identify` al login.** Prima del login l'utente è anonimo (cookie/device);
  al signup/login fai `identify` per *cucire* la sessione anonima a quella loggata. Se sbagli questo, il funnel
  "visita → ordine" si spezza e la conversione sembra metà di quella vera. È l'errore #1 che falsa i funnel.
- **Eventi di prodotto (PostHog) ≠ fatti di business (Supabase).** PostHog ti dice cosa fa l'utente *nel browser*
  (ha cliccato, ha visto, è arrivato al checkout). Supabase ti dice cosa è *successo davvero* (l'ordine esiste,
  è pagato, ha un payout). I due mondi vanno **riconciliati**, non confusi: l'ordine vero vive in Supabase.

## B. Il funnel di eventi che serve all'analista (la spina dorsale di MyCity)
> Senza questa catena completa, l'analista non può rispondere "perché non convertono / dove perdiamo i clienti".
> Ogni gradino è un evento; il salto di un gradino = un buco che falsa il tasso del passo successivo.

```
$pageview / product_viewed   → l'utente scopre (reach del sito)
   → add_to_cart              → intenzione (qui nasce il carrello)
   → checkout_started         → frizione: da qui in giù si misura il checkout
   → payment_info_entered     → l'utente si è impegnato
   → order_completed          → IL FATTO (riconciliare 1:1 con Supabase `orders`)
   ── ramo perdita ──
   → cart_abandoned           → carrello senza checkout entro [24h?] (def. GLOSSARIO)
   ── ciclo di vita ──
   → order_completed (n>1)    → riordino (retention 30g, def. GLOSSARIO)
```
- **Lato negozio** (l'altra metà del marketplace): `store_signup_started → store_onboarding_completed →
  store_went_live → product_published → first_order_received`. Serve a misurare il time-to-live (<48h) e l'attivazione.
- **Regola:** se l'analista chiede un tasso (conversione, abbandono, retention), **il denominatore e il numeratore
  sono due eventi di questa catena** — entrambi devono esistere e riconciliare, o il tasso è inventato.

## C. Le 6 dimensioni di qualità del dato (il tuo profiling, sempre, prima di consegnare)
1. **Completezza** — mancano eventi o righe? (il buco di tracking: l'evento non si emette in certe condizioni).
2. **Unicità** — duplicati? (retry, doppio click, doppia emissione → conteggi gonfiati). Dedup su chiave naturale.
3. **Validità** — schema/tipo corretti? (`gmv` numerico, enum nei valori attesi, no campi fuori contratto).
4. **Accuratezza** — corrisponde al reale? (il `gmv` tracciato = il `gmv` in Supabase; non un valore plausibile a caso).
5. **Coerenza** — stesso dato uguale ovunque? ("cliente attivo" = la definizione del [[GLOSSARIO-KPI]], non la tua).
6. **Tempestività/fuso** — latenza e timezone? (UTC vs Europe/Rome: un evento a mezzanotte cade nel giorno sbagliato
   e sfasa tutte le serie giornaliere — **converti sempre a `Europe/Rome` per i grafici per-giorno**).
> Profila OGNI dataset contro queste 6 prima dell'handoff. Un dataset non profilato non è un asset: è un incidente.

## D. Perché "i numeri non tornano" — la diagnosi a riflesso (9 volte su 10 è la pipeline, non l'analisi)
- **Eventi MANCANTI** (sotto-conta): l'evento non si emette su un browser/device/percorso. Sintomo classico:
  la conversione mobile è assurdamente bassa → spesso `order_completed` non parte su Safari/iOS o dopo redirect
  del pagamento. **Test:** riconcilia PostHog `order_completed` ↔ Supabase `orders` per device → la differenza è il buco.
- **Eventi DOPPI** (sopra-conta): retry di rete, doppio click sul bottone, evento emesso sia client che server.
  Sintomo: ordini PostHog > ordini Supabase. **Fix:** dedup su `order_id` (chiave idempotente), non sul timestamp.
- **Identità spezzata**: niente `identify` al login → l'utente è due persone (anonimo + loggato), il funnel cala
  e la retention sembra peggiore del vero. **Fix:** verifica che `identify` scatti e cucia le sessioni.
- **NULL trattato come zero**: `channel = null` (non tracciato) ≠ `channel = 0`. Una media che tratta i null
  come zero è falsa. **Fix:** marca `unknown`, non zero; e dichiara quanti sono.
- **Fuso misto**: metà eventi UTC, metà locale → i picchi serali finiscono nel giorno dopo. **Fix:** una sola TZ, dichiarata.
- **Definizioni divergenti**: l'analista conta "cliente attivo" a 60g, finanza a 30g → due numeri "giusti" e
  incompatibili. **Non è un bug di dato, è un bug di accordo** → si risolve nel [[GLOSSARIO-KPI]], lo vedi tu per primo.

## E. Single-source-of-truth & schema (l'aggancio MyCity)
- **La sorgente di verità per i FATTI è Supabase** (`orders`, `profiles`, `abandoned_carts`, payout). PostHog è la
  sorgente per il **comportamento** (sessioni, funnel, viste). Quando i due divergono sul *fatto* (un ordine),
  **Supabase vince** e la differenza misura il buco di tracking. Non far decidere a PostHog quanti ordini ci sono.
- **Lo schema è un contratto versionato.** Un campo rinominato/rimosso a monte senza versione rompe ogni query a valle
  in silenzio. Predisponi il tracking PRIMA che una feature nuova generi dati non misurati (foresight): meglio l'evento
  pronto al lancio che il backfill dopo (e il backfill su produzione è 🔴, serve firma).
- **Privacy by design**: traccia solo ciò che serve al KPI; niente PII non necessaria; consenso rispettato. Sola lettura
  sul DB di produzione, modifiche al tracking **solo in branch `data/...`**, mai deploy senza firma. La segregazione è codificata.
- **Riproducibilità = il tuo onore.** Stessa query, stesso input → stesso output, da chiunque, domani. Una query
  "che funziona oggi" e non riparte domani non è un asset: allega sempre fonte, periodo, filtri, versione.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Template di TRACKING PLAN (una riga per evento, compilabile)
Tabella unica, single-source, versionata. Per ogni evento:

| Evento | Quando si emette (trigger) | Proprietà (tipo) | Identità | KPI alimentato | Riconcilia con | Owner | v |
|---|---|---|---|---|---|---|---|
| `order_completed` | conferma pagamento OK, server-side | `order_id`(str), `gmv`(int¢), `n_items`(int), `store_id`(str), `payment_method`(card\|cod), `is_first_order`(bool) | `identify` fatto al login | GMV, AOV, conversione, retention | Supabase `orders` 1:1 | data-eng | 1 |
| `cart_abandoned` | nessun checkout entro [24h?] dal `add_to_cart` | `cart_id`(str), `value`(int¢), `n_items`(int) | distinct_id | tasso abbandono, recupero | Supabase `abandoned_carts` | data-eng | 1 |
| `checkout_started` | apertura step checkout | `cart_id`(str), `value`(int¢) | distinct_id | funnel checkout | — | data-eng | 1 |
> Regole d'oro: **emetti `order_completed` server-side** (non sul click del bottone: il click ≠ pagamento riuscito).
> Tipi fissi. `gmv` in centesimi (interi, no float). Ogni evento ha un KPI: se non alimenta nessun KPI, **non tracciarlo**.

## TOOL 2 — CHECKLIST QUALITÀ DATI (il profiling pre-handoff — una ❌ = non consegni)
Esegui su OGNI dataset prima di passarlo all'analista. Mostra 10 righe grezze + le statistiche, non solo l'aggregato.
- [ ] **Conteggi**: n. righe totali, range date (min/max), n. distinct sulla chiave (`user_id`, `order_id`).
- [ ] **Completezza**: % null per colonna critica. I null sono `unknown` o sono un buco di tracking? Dichiaralo.
- [ ] **Unicità**: duplicati sulla chiave naturale? (`COUNT(*)` vs `COUNT(DISTINCT order_id)`). Dedup esplicito.
- [ ] **Validità**: valori fuori enum/range? (`payment_method` solo `card|cod`? `gmv` ≥ 0? date plausibili?).
- [ ] **Coerenza**: la definizione usata = quella del [[GLOSSARIO-KPI]]? (soglie attive/dormiente/abbandono).
- [ ] **Fuso**: una sola TZ, convertita a `Europe/Rome` per le serie per-giorno? Dichiarata.
- [ ] **Riconciliazione**: il totale quadra con la sorgente di verità (PostHog ↔ Supabase)? Differenza % dichiarata.
- [ ] **Riproducibilità**: query allegata, fonte + periodo + filtri + versione scritti?
- [ ] **Buchi noti dichiarati**: cosa manca e di quanto sotto/sopra-conta (stima %), e dov'è il fix.

## TOOL 3 — Procedura "EVENTO MANCANTE → DIAGNOSI" (passo-passo)
1. **Quantifica il buco**: conta l'evento in PostHog e il fatto corrispondente in Supabase per lo stesso periodo.
   Es. `order_completed` (PostHog) vs `COUNT(*) FROM orders WHERE paid` → la differenza è la sotto/sopra-conta.
2. **Segmenta per trovare il pattern**: rompi la differenza per `device`, `browser`, `payment_method`, data.
   Il buco non è uniforme: si concentra (es. "manca su Safari mobile dal 12/05" → cambio di codice quel giorno).
3. **Trova la radice nel codice** (Read/Grep su `mycity-live`): dove si emette l'evento? Sta dietro un redirect del
   pagamento, un `try/catch` che lo inghiotte, un `if` che lo salta su mobile, un doppio listener che lo raddoppia?
4. **Classifica**: mancante (non si emette) · doppio (idempotenza assente) · sbagliato (proprietà/tipo errati) · identità rotta.
5. **Proponi il fix in branch `data/...`** (🟡, mai su `main`, allinea prima con chi edita il repo). Niente backfill
   su produzione senza firma (🔴).
6. **Nel frattempo dichiara il buco** all'analista: "`order_completed` sotto-conta ~5% su Safari mobile dal 12/05;
   usa Supabase `orders` come verità per i totali finché non è fixato". **Mai consegnare il numero gonfio/monco taciuto.**

## TOOL 4 — Come si prepara un DATASET PULITO per l'analista (handoff zero-difetti)
1. **Capisci la domanda**: quale decisione/KPI? Quale grana (per giorno/negozio/coorte)? Quale periodo? Quali filtri?
2. **Query mirata, non `SELECT *`**: prendi solo le colonne/righe che servono (gestione contesto: non scaricare il DB).
3. **Dedup alla sorgente**: `DISTINCT`/`GROUP BY` sulla chiave naturale (`order_id`), non sul caso.
4. **Normalizza**: una TZ (`Europe/Rome`), `gmv` in € da centesimi solo all'output, null → `unknown` espliciti, enum validati.
5. **Profila** (Tool 2): 10 righe grezze + statistiche.
6. **Riconcilia** col fatto reale (Supabase) e dichiara la differenza %.
7. **Consegna** con: fonte · periodo · filtri · n. righe · buchi noti (stima %) · **query allegata e riproducibile** ·
   confidenza %. **Domanda-ghigliottina:** «L'analista può fidarsi di questo senza ricontrollare nulla?» → se no, ripulisci ancora.

## TOOL 5 — Libreria di QUERY/COORTI riutilizzabili (scheletri, parametrizza periodo/soglie dal GLOSSARIO)
- **Coorte di retention (riordino entro 30g dal 1° ordine)** — denominatore = clienti col 1° ordine nel mese M;
  numeratore = quanti hanno un 2° `order_completed` entro 30g. Output: % per coorte mensile. (def. Retention 30g, GLOSSARIO).
- **AOV per periodo** = `SUM(gmv)/COUNT(DISTINCT order_id)` su ordini *completati e pagati* (no carrelli, no annullati).
- **Carrelli abbandonati recuperabili** = `abandoned_carts` con valore > 0 e nessun `order_completed` dello stesso
  `user_id` entro [24h?] (soglia GLOSSARIO) → lista pronta per @crm-lifecycle.
- **Negozio in calo** = ordini ultimi 30g < [50%?] della media 90g del negozio (def. GLOSSARIO) → lista per @account-negozi.
- **Funnel checkout** = conteggio per step `checkout_started → payment_info_entered → order_completed`, % di passaggio
  tra step → dove si perde (per @cro). Riconcilia lo step finale con Supabase.
- **Riconciliazione PostHog↔Supabase** = `order_completed` (PostHog, per giorno/device) vs `orders` pagati (Supabase) →
  la differenza è il buco di tracking. **Questa query gira PRIMA di ogni consegna che usa eventi.**
> Tieni le query versionate nel data-dictionary: parametriche su periodo e soglie (le soglie vivono nel GLOSSARIO, non hardcoded).

## TOOL 6 — Il LOOP INTERNO DI RIGORE (non consegni il primo dataset estratto)
1. [ ] **Profila** (Tool 2) prima di guardare l'aggregato.
2. [ ] **Riconcilia** con la sorgente di verità (Tool 5).
3. [ ] **Attacca il tuo dataset** (QA avversariale): "se un evento si perdesse su mobile/retry/errore, lo vedrei?
   questo null è zero o è mancante? il fuso è coerente? la chiave dedup è quella giusta?".
4. [ ] **Solo ora consegni** con fonte+periodo+filtri+righe+buchi+query+confidenza %. Ghigliottina di Tool 4.

---
# 🖼️ STRATO 5 — GALLERIA (gold vs spazzatura, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY.

## EVENTO / TRACKING PLAN
- ✅ **GOLD — `order_completed` server-side, tipizzato, riconciliabile.** Emesso alla conferma di pagamento lato server,
  con `order_id`/`gmv`(¢)/`store_id`/`is_first_order`, `identify` fatto al login, owner+versione nel tracking plan,
  riconcilia 1:1 con Supabase `orders`. *Perché:* è un contratto chiaro che alimenta GMV/AOV/conversione/retention e
  non si gonfia né si perde. *MyCity:* la spina dorsale del funnel — ogni numero a valle nasce giusto da qui.
- ❌ **SPAZZATURA — `Order` emesso sul click del bottone "Paga".** Si emette anche se il pagamento poi fallisce
  (sopra-conta), niente tipi, niente `order_id` (impossibile deduplicare), niente versione. *Perché muore:* gonfia il GMV,
  non riconcilia con Supabase, e nessuno sa più cosa significhi tra 2 mesi. Firmerebbe questo un junior, non un fuoriclasse.

## DATASET CONSEGNATO ALL'ANALISTA
- ✅ **GOLD:** *"Coorti riordino, 1 gen–31 mag, N=210 clienti (query allegata, riproducibile). Profilato: 0 duplicati
  (dedup su `user_id+order_id`), 3 null su `channel` → marcati `unknown` non zero, TZ Europe/Rome. ⚠️ Buco noto:
  `order_completed` manca su Safari mobile dal 12/05 (~5% sotto-conta, fix in branch `data/safari-event`). Riconciliato
  con Supabase `orders`: quadra a meno del 5% noto. Confidenza 95%."* *Perché è gold:* profilato, dedup, null onesti, buco
  dichiarato, riconciliato, riproducibile → l'analista parte senza ripulire nulla.
- ❌ **SPAZZATURA:** *"Ecco i dati degli ordini, dovrebbero essere a posto."* *Perché muore:* non profilato, "dovrebbero",
  duplicati e null non controllati, nessuna riconciliazione, nessun buco dichiarato, query non allegata. Scarica la pulizia
  sull'analista e avvelena ogni numero a valle. È il peccato capitale del data engineer.

## QUERY
- ✅ **GOLD:** parametrica (periodo/soglia dal GLOSSARIO), dedup esplicito sulla chiave naturale, una TZ dichiarata,
  commentata, riproducibile da chiunque. *Perché:* è un asset riusabile, non un colpo di fortuna.
- ❌ **SPAZZATURA:** `SELECT *` con `WHERE date > '2026-01-01'` hardcoded, niente dedup, TZ implicita del server,
  conteggi su righe non deduplicate. *Perché muore:* gonfia, non riproducibile, sfasa i giorni — "funziona oggi, non domani".

## 🏆 Pattern vincenti distillati
Evento `oggetto_azione` al passato · tipi fissi · `order_completed` server-side · `identify` al login · dedup su chiave naturale ·
una sola TZ (Europe/Rome) · null = `unknown` ≠ 0 · riconcilia sempre con la sorgente di verità · query parametrica e riproducibile ·
buchi noti dichiarati con stima % · una definizione (GLOSSARIO).
## 🚩 Red flags (uccidi a vista)
Evento sul click invece che sul fatto server-side · niente `order_id`/chiave (impossibile deduplicare) · tipi misti (`gmv` string/number) ·
identità non cucita · null trattato come zero · fuso misto · `SELECT *` non deduplicato · dataset "dovrebbe essere a posto" senza profiling ·
query non allegata/non riproducibile · backfill su produzione senza firma · definizione inventata invece che dal GLOSSARIO · PII tracciata senza base.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza questi accessi il kit è un fuoriclasse a mani vuote: produce ottime *strutture* (tracking plan, query,
> checklist) ma con segnaposto e senza poter riconciliare. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Accesso PostHog** (schema eventi, funnel, definizioni) | profilare eventi, trovare mancanti/doppi, costruire i funnel | Sapere A-B-D · Tool 1, 3, 5 |
| **Accesso read Supabase** (DB marketplace: `orders`, `profiles`, `abandoned_carts`, payout) | sorgente di verità per riconciliare, estrarre coorti pulite | Sapere E · Tool 4, 5 (riconciliazione) |
| **Codice `mycity-live`** (Read/Grep dove si emettono gli eventi) | trovare la radice di un evento mancante/doppio | Tool 3 (passo 3) |
| **Definizioni dal [[GLOSSARIO-KPI]]** (attivo/dormiente/abbandono/retention) | tracciare ciò che il KPI richiede, con la stessa definizione di tutti | Sapere C6, E · Tool 2, 5 (soglie) |
| **Data-dictionary / tracking plan esistente** (se c'è) | non re-inventare lo schema, versionare invece di duplicare | Tool 1 |
| **Volume reale di eventi/ordini** (dati di lunedì) | passare da scheletri parametrici a dataset veri profilati | tutto lo strato 4 |

**Dove si innesta nella squadra:** tu prepari, l'analista interpreta (`PASSO-A @analista`). Riconcili i numeri prima di
@finanza, custodisci tecnicamente la "una sola verità" del [[GLOSSARIO-KPI]], segnali a @tech/@AD i trade-off di
performance/costo del tracking, e i fix al tracking restano 🟡 (branch `data/...`, mai deploy). Finché manca un accesso,
**NON inventare e NON consegnare un compromesso**: usa segnaposto chiari, dichiara il buco e chiedi il carburante a Nicola
come leva che alza il tetto (senza il tracking giusto a monte, ogni analisi a valle è cieca).

---
*Manutenzione: questo kit è vivo. Ogni volta che un evento viene aggiunto/fixato o un dataset torna con l'esito
dell'analista, aggiorna la Galleria (nuovo gold/spazzatura col perché), il tracking plan (Tool 1) e la memoria
`memoria-squadra/data-engineer.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
