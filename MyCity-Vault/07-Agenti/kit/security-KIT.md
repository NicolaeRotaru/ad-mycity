---
tipo: kit-mestiere
ruolo: security
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (advisor + codice webhook + schema)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · 05-Soldi-Rischi/Rischi & Compliance.md
---

# 🛡️ KIT MESTIERE — security (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria, e il carburante che serve.
> Il ruolo è GIÀ forte → questo kit **aggiunge i framework e le checklist**, non ri-spiega l'ovvio.
> Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]). Onestà: non certifichi ciò che non hai visto.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Threat modeling — pensa come l'attaccante (il riflesso #1)
- **Per ogni tabella/endpoint, parti dall'abuso, non dalla feature.** Quattro attori avversari da impersonare
  sempre: (1) *negozio malevolo* — "posso leggere/scrivere gli ordini, i payout, i prodotti di un ALTRO
  negozio?"; (2) *cliente curioso/malevolo* — "posso vedere ordini/indirizzi/email di altri clienti cambiando
  un id nell'URL?" (IDOR); (3) *anonimo* — "cosa raggiungo senza login? quali endpoint/`anon` role espongono?";
  (4) *insider* — "un ruolo basso può scalare a admin?". La difesa nasce dall'abuso che immagini, non dalla spec.
- **STRIDE come griglia rapida** (non religione): *Spoofing* (chi finge un'identità → webhook falso, JWT),
  *Tampering* (chi altera dati/prezzo/total lato client), *Repudiation* (manca l'audit-trail), *Information
  disclosure* (leak cross-tenant, errori verbosi, log con PII), *Denial of service* (query senza limit, rate),
  *Elevation of privilege* (`role` scalabile, RLS bypassata). Per ogni superficie nuova: passa i 6, tieni i reali.
- **Confused deputy.** Il pericolo classico Supabase: il **client** parla col DB con la propria identità (RLS
  protegge), MA un endpoint server che usa la **service-role** *agisce per conto dell'utente senza ri-controllare
  chi è* → bypassa la RLS. Ogni route che usa la service-role deve ri-derivare l'utente e autorizzare a mano.
- **Trust boundary.** Disegna mentalmente dove un dato attraversa un confine di fiducia (client→API, API→DB,
  webhook esterno→noi, terze parti→noi). **Su ogni confine: valida, autentica, autorizza.** Dentro il confine
  ti fidi; sul confine mai.

## B. Deny-by-default & minimo privilegio (la postura, non il tappo)
- **Tutto negato finché non c'è una ragione esplicita per concederlo.** Una `GRANT` larga, una policy `USING
  (true)`, un `anon` che può `SELECT` su una tabella con PII: tutti default-permit travestiti. Il fuoriclasse
  cerca i **default impliciti**, non solo le regole scritte.
- **Su Supabase il default giusto è: RLS ON + zero policy = zero accesso.** Abilitare RLS senza policy *nega
  tutto* (tranne service-role) — è la base sana. Il rischio è la tabella con **RLS dimenticata OFF**: lì la
  `anon`/`authenticated` key legge tutto. (Questo è ciò che `get_advisors` segnala per primo.)
- **Minimo privilegio sui ruoli DB:** `anon` solo ciò che è davvero pubblico (vetrina, prodotti pubblicati);
  `authenticated` solo i propri dati via policy; la **service-role mai vicino al browser**. Le `GRANT` larghe a
  `anon`/`authenticated` sono un odore: il privilegio reale lo dà la policy, non la grant, ma una grant assente
  è una difesa in profondità in più.

## C. La difesa vive nel DB — RLS multi-tenant (il cuore di un marketplace)
- **Il controllo lato app si bypassa; la policy a livello dati no.** Un attaccante può chiamare l'API Supabase
  direttamente con la sua `anon` key (è pubblica per design): se la barriera fosse solo nel frontend o in un
  `if` di una route, è già caduta. **La RLS è l'unica barriera che vale.** Ogni tabella con dati di tenant
  nasce con la sua RLS.
- **Le 4 operazioni vanno coperte separatamente.** Una policy `FOR SELECT` non protegge `INSERT/UPDATE/DELETE`.
  Errore classico: SELECT blindata, ma `UPDATE` con `WITH CHECK` assente → un negozio scrive sui dati di un altro.
  Per ogni tabella: SELECT *e* INSERT *e* UPDATE (USING + WITH CHECK) *e* DELETE, ciascuna col predicato tenant.
- **USING vs WITH CHECK** (la trappola più diffusa): `USING` filtra le righe **lette/toccabili**; `WITH CHECK`
  vincola le righe **scritte**. Un `UPDATE` senza `WITH CHECK` permette di spostare una riga ad **un altro
  tenant** (cambiare `negozio_id`) pur passando lo `USING`. Regola: ogni INSERT/UPDATE ha sempre il `WITH CHECK`.
- **Il predicato tenant deve derivare dall'identità del DB, non da un input.** Bene: `negozio_id = (SELECT
  negozio_id FROM membri WHERE user_id = auth.uid())` o un claim verificato nel JWT. Male: fidarsi di un
  `negozio_id` passato nel body. **`auth.uid()` è la fonte di verità**, non i parametri della richiesta.
- **Performance ≠ scusa per spegnerla.** Le policy con subquery vanno indicizzate (`negozio_id`, `user_id`) e
  la subquery messa in `(SELECT auth.uid())` per farla valutare una volta. Una RLS lenta si ottimizza, non si toglie.
- **`SECURITY DEFINER` è una porta sul retro.** Funzioni/viste `SECURITY DEFINER` girano coi privilegi del
  creatore e **scavalcano la RLS**: ognuna è una micro-service-role. Vanno contate, giustificate, e `search_path`
  fissato (`SET search_path = ''`) per evitare hijacking. Le **viste** di default girano security-definer: una
  vista su una tabella protetta può esporla a `anon`.

## D. Mai fidarsi dell'esterno — webhook firmati e idempotenti
- **Il webhook è un endpoint pubblico che dichiara "ho ricevuto soldi".** Senza verifica della firma,
  *chiunque* fa un POST e finge un pagamento → ordine sbloccato gratis. La verifica della firma Stripe
  (`stripe.webhooks.constructEvent` con `STRIPE_WEBHOOK_SECRET` + l'header `Stripe-Signature`) **non è
  opzionale ed è il primo controllo**, prima di leggere il body.
- **La firma va verificata sul RAW body.** Se un middleware fa il `JSON.parse` prima, la firma non torna più →
  o si rompe (falso negativo) o si è tentati di disattivarla (catastrofe). La route webhook legge il corpo grezzo.
- **Idempotenza obbligatoria** (Stripe ritenta lo stesso evento più volte, e un attaccante può rigiocarlo —
  *replay*): registra l'`event.id` già processato (tabella `webhook_events` con unique constraint) e **scarta i
  duplicati** prima di agire. Senza idempotenza: doppio payout, doppio ordine, doppio storno. La firma blocca i
  falsi; l'idempotenza blocca i replay e i retry.
- **Tre proprietà di un webhook sano:** *autentico* (firma verificata), *idempotente* (event.id de-dup),
  *atomico/ordinato* (non assumere l'ordine d'arrivo degli eventi; lo stato si deriva dall'oggetto, non dalla
  sequenza). Risponde 200 solo dopo aver persistito; errori → 4xx/5xx così Stripe ritenta.

## E. Sicurezza dei pagamenti — SAQ-A (il livello PCI di MyCity)
- **L'obiettivo è restare in SAQ-A: i dati carta NON toccano mai i nostri server.** Si ottiene delegando
  *interamente* la raccolta carta a Stripe (Checkout ospitato o Elements/Payment Element in iframe). Il PAN
  vive nel dominio di Stripe; noi maneggiamo solo token/`payment_intent`. Se un campo carta arrivasse al nostro
  backend o lo loggassimo, **si cade in SAQ-D** (decine di requisiti): è un evento da bloccare a vista.
- **Cosa fa decadere SAQ-A** (red flag): un `<input>` carta servito dal nostro frontend non-iframe, un proxy
  che inoltra il PAN, un log/Sentry che cattura il numero carta, uno script di terze parti non integro nella
  pagina di pagamento. → la pagina di checkout vuole **integrità degli script** e niente raccolta diretta.
- **Importi e valuta sul server, mai dal client.** Il `total`/`amount` dell'ordine si ricalcola server-side dal
  carrello reale; il prezzo non si fida del client (altrimenti si compra a 0,01 €). Il webhook conferma l'importo
  effettivamente incassato vs l'ordine.

## F. Gestione segreti — un solo posto: l'ambiente
- **I segreti vivono SOLO nelle env var lato server.** Mai nel codice, mai committati, mai nel bundle client,
  mai nei log, mai in un messaggio o in un file del vault. La rotazione è prevista (chiave compromessa → ruota,
  non "speriamo").
- **La linea di sangue del frontend:** ciò che è prefissato `NEXT_PUBLIC_`/`VITE_`/`PUBLIC_` **finisce nel
  browser** — lì può stare SOLO la `anon`/publishable key (è progettata per essere pubblica, la RLS la regge).
  La **service-role key** e la **Stripe secret key** (`sk_...`) **non hanno mai** quel prefisso e non escono dal
  server. Una `sk_` o una service-role nel bundle = incidente critico, rotazione immediata.
- **Segreti in chiaro nel repo = già compromessi.** Anche se rimossi dopo, restano nella storia git → vanno
  ruotati, non solo cancellati. Il secret scanning (gitleaks / GitHub secret scanning) è una sentinella, non un lusso.
- **Service-role = chiave maestra che ignora la RLS.** Ogni suo uso è una rinuncia esplicita alla difesa nel DB:
  va limitato a poche route server, ognuna con autorizzazione manuale ricostruita, e mai passata a un browser.

## G. GDPR tecnico (la compliance che vive nel codice, non nel PDF)
- **Minimizzazione & retention.** Raccogli solo i dati personali che servono; ogni campo PII ha una ragione e una
  scadenza. Indirizzi/telefoni degli ordini vecchi non restano per sempre "perché può servire".
- **I diritti dell'interessato devono essere eseguibili tecnicamente:** *accesso/portabilità* (esportare i dati
  di un utente), *cancellazione* (cancellare/anonimizzare — attenzione ai backup e alle FK), *rettifica*. Se non
  esiste una via tecnica per cancellare un utente, il diritto è solo sulla carta.
- **PII mai in chiaro nei log/analytics.** Email, telefono, indirizzo, IP non vanno in Sentry/PostHog/console.
  I log si scrubbano. Un leak via log è un leak vero.
- **Consenso e base giuridica tracciati** (consenso marketing ≠ dato per esecuzione del contratto): il consenso
  ha timestamp, versione dell'informativa, e revocabilità. Registro dei trattamenti aggiornato.
- **Data residency & sub-responsabili:** dove gira il DB (regione Supabase), chi sono i processor (Stripe,
  Resend, Render, PostHog) → DPA in ordine. È compliance tecnica, non solo legale.

## H. Privilege escalation — la classe di bug che ti rovina la giornata
- **`profiles.role` (o equivalente) è l'obiettivo numero uno.** Se un utente può **scrivere il proprio ruolo**
  (UPDATE su `profiles` senza escludere la colonna `role`/`is_admin`), si auto-promuove ad admin → game over.
  Regola: la colonna di ruolo è **immutabile dall'utente**; si cambia solo via funzione privilegiata controllata,
  e la policy `UPDATE` su `profiles` non deve permettere di toccare `role` (colonna fuori dal `WITH CHECK`, o
  trigger che blocca la modifica di `role` da parte di non-admin).
- **Autorizzazione fatta lato app = scalabile.** Un check `if (user.role === 'admin')` nel frontend è
  decorativo; l'attaccante chiama l'API direttamente. L'autorizzazione vera è nella RLS / in una funzione DB.
- **Mass assignment.** Un `UPDATE ... SET (tutti i campi dal body)` lascia passare `role`, `negozio_id`,
  `verified`, `balance`. Whitelist dei campi scrivibili, mai blacklist.
- **Dove la RLS NON arriva, arriva l'attaccante:** Storage buckets (i file/foto sono pubblici di default?),
  Realtime (i canali rispettano la RLS?), Edge Functions con service-role, `SECURITY DEFINER`. Estendi il
  threat model a tutte le superfici Supabase, non solo alle tabelle.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — CHECKLIST RLS per tabella (passa OGNI riga, o non è coperta)
Per ogni tabella con dati di tenant/utente:
- [ ] **RLS ENABLED?** (`rowsecurity = true`). Se no → STOP, è un leak aperto. (lo conferma `get_advisors`)
- [ ] **Esiste almeno una policy?** RLS ON senza policy nega tutto (può rompere feature legittime, ma non è un leak).
- [ ] **SELECT** ha un predicato tenant che deriva da `auth.uid()` (non da un input del client)?
- [ ] **INSERT** ha `WITH CHECK` che lega la riga al tenant dell'utente?
- [ ] **UPDATE** ha **sia** `USING` (quali righe) **sia** `WITH CHECK` (verso quale tenant) → no spostamento cross-tenant?
- [ ] **DELETE** ha `USING` col predicato tenant?
- [ ] Nessuna policy con `USING (true)` / `WITH CHECK (true)` su dati sensibili (= permit travestito)?
- [ ] Nessuna colonna critica scrivibile dall'utente (`role`, `negozio_id`, `verified`, `balance`, `price`)?
- [ ] Il ruolo `anon` può leggere SOLO ciò che è davvero pubblico (vetrina), non PII/ordini?
- [ ] Esiste una **vista/funzione `SECURITY DEFINER`** che espone questa tabella scavalcando la RLS? Giustificata?
- [ ] Index su `auth.uid()`/`negozio_id` per non pagare la RLS in performance?
> Verifica avversariale: simula mentalmente (o con una query come due ruoli diversi) "negozio A legge righe di B?".

## TOOL 2 — CHECKLIST WEBHOOK (firma + idempotenza)
- [ ] **Firma verificata** sul **raw body** con il segreto giusto (`STRIPE_WEBHOOK_SECRET`) **come primo passo**?
- [ ] Il body **non viene parsato** prima della verifica (niente middleware JSON sulla route)?
- [ ] Il segreto del webhook è in **env**, non hardcoded?
- [ ] **Idempotenza:** `event.id` registrato (unique constraint) e i duplicati scartati prima di agire?
- [ ] Gestiti i **retry** di Stripe (stesso evento più volte) senza effetti doppi (no doppio payout/ordine)?
- [ ] Lo stato si **deriva dall'oggetto** dell'evento, non dall'ordine d'arrivo?
- [ ] **Importo/valuta** confrontati con l'ordine atteso (no fiducia cieca)?
- [ ] Risponde **200 solo dopo** aver persistito; errori → 4xx/5xx per far ritentare Stripe?
- [ ] Nessun **dato carta/PII** loggato nella gestione dell'evento?
- [ ] L'endpoint **non fa altro** di sensibile senza ulteriore autorizzazione (non è un bypass mascherato)?

## TOOL 3 — CHECKLIST SEGRETI (la linea di sangue server↔client)
- [ ] **Service-role key** e **Stripe secret (`sk_`)** mai prefissate `NEXT_PUBLIC_`/`PUBLIC_`/`VITE_`?
- [ ] Grep del **bundle/frontend** per `sk_`, `service_role`, pattern di chiave → zero risultati?
- [ ] Nessun segreto **committato** (storia git inclusa): se trovato → **ruotare**, non solo cancellare?
- [ ] Solo la **anon/publishable** key è nel client (e la RLS la regge)?
- [ ] Service-role usata **solo** in poche route server identificate, ognuna con autorizzazione ricostruita?
- [ ] Segreti **fuori dai log** (Sentry/PostHog/console) e fuori dai messaggi/vault?
- [ ] Secret scanning attivo (gitleaks / GitHub) come sentinella in CI?
- [ ] Piano di **rotazione** noto (cosa ruotare, dove, in quanto tempo) se una chiave trapela?

## TOOL 4 — AUDIT-TRAIL / COMPLIANCE (audit-ready in ogni momento)
- [ ] Ogni azione su **soldi/dati sensibili** (payout, rimborso, cambio ruolo, cancellazione) lascia una traccia
      (chi, cosa, quando, valore) — log applicativo o tabella di audit?
- [ ] **Segregazione dei compiti** codificata: security = sola lettura DB, niente deploy, fix al tech?
- [ ] **Registro dei trattamenti** GDPR aggiornato (quali PII, perché, quanto a lungo, quali processor + DPA)?
- [ ] I **diritti GDPR** sono eseguibili tecnicamente (export, cancellazione/anonimizzazione, rettifica)?
- [ ] **Retention** definita e applicata (i dati vecchi non restano all'infinito)?
- [ ] **Registro rischi vivo:** ogni vulnerabilità ha gravità, evidenza (file:riga), stato (aperto/in fix/chiuso)?
- [ ] In caso di incidente: c'è un **post-mortem senza colpa** + lezione in `memoria-squadra/security.md`?

## TOOL 5 — TRIAGE per impatto reale (vero rischio vs falso allarme) — NON gonfiare
Per ogni finding, decidi la gravità con questa griglia (gravità = **impatto × probabilità × evidenza**):
- 🔴 **CRITICO / blocca-live:** leak cross-tenant **provato**, webhook non verificato, service-role/`sk_` esposta al
  client, `role` auto-modificabile, PII di clienti accessibile da `anon`. → riga 🔴 in DECISIONI, fix al tech, blocca il live.
- 🟠 **ALTO:** RLS assente su tabella sensibile (anche se l'app oggi "non la chiama" — la `anon` key sì), `WITH
  CHECK` mancante su UPDATE, `SECURITY DEFINER` ingiustificato, PII nei log.
- 🟡 **MEDIO:** difesa in profondità mancante (grant larga ma RLS regge), rate limiting assente, errori verbosi.
- ⚪ **BASSO / informativo:** hardening teorico senza percorso d'abuso reale, best practice cosmetica.
- ❌ **FALSO ALLARME (scartalo e dillo):** "warning" dell'advisor già mitigato altrove, rischio che richiede un
  prerequisito impossibile (es. "serve già la service-role"), CVE in una dipendenza non sul percorso esposto.
> Domanda-ghigliottina: **«Se un negozio o un cliente malevolo lo provasse OGGI, ci riuscirebbe — e ho la prova
> nel codice/schema, non solo il sospetto?»** Se non hai la prova → declassa a "da verificare", non lo certifichi.
> Regola d'oro del triage: **un leak reale di un campo > dieci warning teorici.** Non annegare il critico nel rumore.

## TOOL 6 — TEMPLATE di SECURITY REVIEW (il deliverable, ordinato per gravità)
```
# Security Review — <oggetto> — AAAA-MM-GG HH:MM
Scope: <cosa ho guardato> · Fuori scope: <cosa NON ho guardato>
Confidenza: <alta/media> · Metodo: <Read/Grep su X · get_advisors · query come ruolo Y>

## Sintesi (1 riga)
<verdetto: si va live? quanti 🔴 aperti?>

## Findings (ordinati per gravità)
### 🔴 [C1] <titolo> — CRITICO
- Dove: <file:riga / tabella / policy>   (EVIDENZA, non sospetto)
- Abuso: <come un attaccante lo sfrutta, passo-passo>
- Impatto: <quali dati/quanti soldi, quale persona reale colpita>
- Fix consigliato (→ @tech/@backend-dev): <correzione concreta, azionabile>
- Stato: aperto

### 🟠 [H1] ... / 🟡 [M1] ... / ⚪ [L1] ...

## Falsi allarmi scartati (e perché)
- <warning advisor X: già mitigato da ...>

## Hardening 10x non richiesto (L7, pronto da firmare)
<la mossa di sistema che chiude un'intera classe — es. policy template deny-by-default per ogni nuova tabella>

## Cosa NON ho potuto verificare (carburante che serve)
<advisor non disponibile / codice webhook non letto / schema non accessibile>
```
> Regola: ogni 🔴/🟠 ha **evidenza** (file:riga o output advisor) + **fix** + **chi lo raccoglie**. Senza evidenza è "da verificare", non un finding.

---
# 🖼️ STRATO 5 — GALLERIA (audit gold vs spazzatura, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Il discrimine è sempre lo stesso:
> **rischio reale provato** (gold) vs **warning gonfiato o "ok" non verificato** (spazzatura).

## RLS / multi-tenant
- ✅ **GOLD — "ho provato il cross-tenant e l'ho dimostrato".** Finding: "Tabella `ordini`: policy `UPDATE` con
  `USING (negozio_id = mio)` ma **senza `WITH CHECK`** → ho verificato che il negozio A può fare `UPDATE ordini
  SET negozio_id = B` (file:riga della migration). Un negozio può cedere/spostare ordini ad un altro." *Perché è
  gold:* abuso concreto + evidenza nel codice + impatto chiaro + fix preciso (aggiungere `WITH CHECK`).
- ❌ **SPAZZATURA — "le tabelle sembrano a posto".** Report che dichiara "RLS ok" **senza aver guardato le
  policy né girato `get_advisors`**, mentre una tabella nuova ha RLS OFF. *Perché muore:* il falso "sicuro" è il
  leak peggiore — nessuno lo cerca più. Un "ok" non verificato vale meno di zero.
- ❌ **SPAZZATURA — il warning gonfiato.** "🔴 CRITICO: la tabella `categorie` non ha RLS!" — ma `categorie` è il
  catalogo pubblico, nessun PII, deve essere leggibile da tutti. *Perché muore:* gravità sbagliata, brucia
  credibilità e annega i veri 🔴. (Giusto: ⚪ informativo, "RLS non necessaria, dato pubblico".)

## Webhook / pagamenti
- ✅ **GOLD.** "Webhook Stripe (`app/api/webhook/route.ts:N`): `constructEvent` con `STRIPE_WEBHOOK_SECRET`
  sul raw body ✔ · MA **nessuna de-dup su `event.id`** → ho verificato che un replay dello stesso `checkout.
  session.completed` rieseguirebbe la conferma ordine (no unique constraint su `webhook_events`). Fix: tabella
  idempotenza." *Perché è gold:* firma verificata *e* ho cercato il secondo livello (idempotenza), con evidenza.
- ❌ **SPAZZATURA.** "Il webhook usa Stripe, quindi è sicuro." *Perché muore:* non ha letto se la firma è
  verificata né su quale body; "usa Stripe" non è una prova. Assunzione spacciata per fatto.

## Segreti
- ✅ **GOLD.** "Grep del bundle prod: trovata `service_role` in una env `NEXT_PUBLIC_SUPABASE_*` (file:riga). La
  chiave maestra che ignora la RLS è nel browser → **rotazione immediata** + spostare server-side. Non ho
  incollato la chiave." *Perché è gold:* impatto massimo, evidenza, e **non ha stampato il segreto** (regola d'oro).
- ❌ **SPAZZATURA.** Un report che, per "provare" il leak, **incolla la chiave** nel file. *Perché muore:* ha
  appena propagato il segreto in un altro posto — peggiora l'incidente. Mai stampare/incollare segreti.

## Privilege escalation
- ✅ **GOLD.** "`profiles`: policy `UPDATE FOR authenticated USING (id = auth.uid())` **senza escludere `role`**
  → un utente fa `UPDATE profiles SET role='admin' WHERE id = mio` e si auto-promuove (provato). Fix: trigger che
  blocca modifica di `role` da non-admin." *Perché è gold:* la classe di bug più grave, abuso a 1 query, fix di sistema.

## Triage / proporzioni (la firma del fuoriclasse)
- ✅ **GOLD.** Un report dove i 2 🔴 reali sono in cima con evidenza, i 9 warning advisor cosmetici sono
  raggruppati sotto "difesa in profondità", e 3 falsi allarmi sono **dichiarati e scartati col perché**.
  *Perché è gold:* senso delle proporzioni — fa agire sul rischio vero, non sul rumore.
- ❌ **SPAZZATURA.** 47 finding tutti "alti", advisor copia-incollato senza giudizio. *Perché muore:* l'AD non
  sa da dove iniziare, i 🔴 affogano, l'audit diventa ignorabile.

## 🏆 Pattern vincenti distillati
Difesa nel DB (RLS) > controllo nell'app · deny-by-default > tappo sul buco · evidenza (file:riga/advisor) >
sospetto · abuso concreto > teoria · `WITH CHECK` su ogni scrittura · firma+idempotenza sul webhook · service-role
solo server · `role` immutabile dall'utente · proporzioni (1 leak reale > 10 warning) · mai incollare segreti.
## 🚩 Red flag (uccidi a vista)
"sembra sicuro" senza guardare · RLS OFF su tabella PII · `USING (true)` su dati sensibili · UPDATE senza `WITH
CHECK` · webhook non verificato / parsato prima della firma · no idempotenza · `sk_`/service-role nel bundle ·
`role` auto-modificabile · PII nei log · campo carta sui nostri server · advisor incollato senza triage · segreto incollato in un report.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, e dove si innesta)
> Senza questo, il fuoriclasse ragiona giusto ma certifica al buio — e un falso "sicuro" è il fallimento massimo.
> Ecco ESATTAMENTE cosa serve, in sola lettura, e dove si aggancia nel kit:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Supabase `get_advisors`** (security, sola lettura) | tabelle senza RLS, `SECURITY DEFINER` rischiosi, search_path, segreti esposti | Tool 1 (RLS), Tool 5, triage |
| **Schema reale** (`list_tables` + `migrations/`) | leggere le policy vere (USING/WITH CHECK), i ruoli, le grant | Tool 1, Sapere C/H |
| **Codice del webhook** (`app/api/webhook/route.ts`) | verificare firma sul raw body + idempotenza | Tool 2, Sapere D |
| **Dove vive la service-role key** (env del server, route che la usano) | confermare che non esce dal server, audit degli usi | Tool 3, Sapere F |
| **Bundle/frontend** (grep `sk_`, `service_role`, `NEXT_PUBLIC_`) | provare che nessun segreto è nel client | Tool 3, Galleria segreti |
| **Pagina di checkout** (come si raccoglie la carta) | confermare SAQ-A (carta solo in iframe Stripe) | Sapere E |
| **Storia git / secret scanning** | segreti committati (anche rimossi → ruotare) | Tool 3 |
| **Lista endpoint esposti** (`app/api/*`, Edge Functions) | superficie d'attacco completa, route con service-role | Sapere A/H, Tool 6 |
| **Registro trattamenti + lista processor/DPA** | GDPR tecnico audit-ready | Sapere G, Tool 4 |

Finché manca un pezzo: **non certificare "sicuro" su quella superficie.** Dichiaralo in "Cosa NON ho potuto
verificare" (Tool 6) e chiedi il carburante a Nicola come leva che alza il livello dell'audit — è la regola
del professionista onesto: meglio "non verificato" che un sì non provato.

---
*Manutenzione: questo kit è vivo. Dopo ogni audit, aggiorna la Galleria (nuovo gold/spazzatura col perché) e
la riga ESITO in `memoria-squadra/security.md`. Quando un fix è chiuso, scrivi l'esito (loop chiuso). Quando
emerge un nuovo abuso o una nuova superficie Supabase (Storage/Realtime/Edge), aggiungi il pattern al Sapere.
RIASSUMI/POTA mensile: resta denso e affilato.*
