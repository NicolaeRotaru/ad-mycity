---
data: 2026-07-04 04:47
tipo: radiografia-marketplace
repo: NicolaeRotaru/mycity @ f84fc70 (2026-07-02)
metodo: 13 dimensioni in sola lettura · 26 agenti senior · ogni problema verificato avversarialmente · advisor Supabase su DB live
totali: 6 bloccanti · 43 gravi · 53 minori
---

# 🩻 Radiografia profonda del marketplace MyCity

> **Come è stata fatta.** 13 revisori senior in parallelo (uno per dimensione) hanno letto il codice reale del marketplace (`app/`, `lib/`, `migrations/`, `render.yaml`, CI) in **sola lettura**; ogni problema è poi passato da un **verificatore avversariale** che ha ricontrollato nel codice e scartato i falsi positivi. In più ho interrogato gli **advisor Supabase sul database live** (progetto `Mycity`) e **ri-confermato di persona i 2 bloccanti più gravi** (wallet e migrazione 107) leggendo policy e trigger riga per riga. Ogni finding è ancorato a `file:riga`.

---

## 1. Verdetto in una riga

Le fondamenta ingegneristiche restano **solide** (Stripe Connect, webhook firmato con idempotenza, ~107 migrazioni, KYC fail-closed, CSP nonce). **Ma oggi il marketplace NON può andare in produzione con soldi e utenti reali**: ci sono **6 bloccanti**, di cui **tre indipendentemente confermati** che sono catastrofici — un furto di denaro banale, il catalogo rotto per gli acquirenti, e il deploy che non parte. Vanno chiusi **prima di qualsiasi go-live**.

## 2. I 6 bloccanti (🔴 — soldi/legale/sito rotto)

| # | Bloccante | Dimensione | Effetto in una riga |
|---|-----------|-----------|---------------------|
| **B1** | Auto-accredito wallet illimitato | RLS & DB | Qualsiasi utente si ricarica il credito e ordina gratis → **furto diretto** |
| **B2** | Migrazione 107 rompe le schede prodotto | RLS & DB | Ogni prodotto risulta "non acquistabile" per shopper anonimi/buyer → **sito inutilizzabile** |
| **B3** | Build produzione Render fallisce | Deploy / SRE | `NODE_ENV=production` toglie le devDeps a `npm ci` → **nessun deploy va live** |
| **B4** | Venditore approvato all'istante senza KYC | Architettura | Chi si registra "Venditore" pubblica e incassa COD senza verifica → **frode/AML** |
| **B5** | Documenti KYC mai cancellati | Privacy / GDPR | Carte d'identità/selfie restano nello storage dopo la chiusura account → **violazione art. 17** |
| **B6** | Ordini "Ritiro in negozio" senza stato finale | QA & Flussi | Non raggiungono mai "Consegnato" → **payout venditore congelato per sempre** |

### 🔴 B1 — Auto-accredito illimitato del wallet *(ri-confermato a mano)*
**File:** `migrations/001_create_tables.sql:70` · `migrations/061_...:31-84` · `migrations/087_wallet_and_redemption.sql:20`
La policy `"Users can update their own profile"` su `profiles` è `FOR UPDATE USING (auth.uid()=id)` **senza `WITH CHECK`**. Il trigger `enforce_profile_update_rules` (061) congela `role`, `is_approved`, Stripe e KYC **ma non `wallet_balance_cents`**, e non c'è nessun `REVOKE` di colonna. Un utente autenticato può quindi fare `PATCH /rest/v1/profiles?id=eq.<suo_id>` impostando il proprio saldo a qualsiasi cifra (il `CHECK` blocca solo i negativi) e spenderlo al checkout. Contraddice la garanzia esplicita scritta in 087 ("il client non può MAI accreditarsi credito da solo").
**Impatto:** furto diretto — credito MyCity illimitato e spendibile, ordini gratis a spese di piattaforma e venditori.
**Fix:** `REVOKE UPDATE (wallet_balance_cents) ON public.profiles FROM authenticated, anon;` + aggiungere nel trigger il congelamento di `wallet_balance_cents`; lasciare le sole scritture via RPC `SECURITY DEFINER` (`_wallet_apply`).

### 🔴 B2 — La migrazione 107 rompe le schede prodotto per gli acquirenti *(ri-confermato a mano)*
**File:** `migrations/107_seller_public_profiles.sql:10` vs `app/product/[id]/page.tsx:88,237` · `app/orders/*` · `app/rider/orders/[id]/page.tsx:91` · `app/favorites/page.tsx` · `app/shared-cart/page.tsx` · `components/SearchBar.tsx` · `components/home/TrendingNow.tsx` · `SimilarProducts.tsx`
La 107 (ultima migrazione, **già applicata sul DB live** — l'advisor conferma la vista `seller_public_profiles`) droppa la policy `"Anyone can view approved seller profiles"`. L'unica policy di lettura rimasta è `"Public profile read"` (mig 033) che richiede `public_profile_enabled = true`, ma quel flag è `DEFAULT false` e **nessun punto del codice lo attiva per i venditori** (è solo l'opt-in del profilo pubblico *acquirente*). Molte pagine però embeddano ancora il profilo dalla **tabella** `profiles` (`profiles!products_seller_id_fkey`), non dalla vista → l'embed torna NULL per shopper anonimi/buyer → `if (!product.profiles?.is_approved)` scatta e la scheda mostra **"negozio non approvato / prodotto non acquistabile"**.
**Impatto:** catalogo e checkout inutilizzabili per anonimi e buyer; pagine ordini del buyer senza dati negozio; il **rider non vede indirizzo/telefono di ritiro** → consegne bloccate.
**Fix:** migrare TUTTE le query client dal raw embed `profiles!...fkey` all'helper su `seller_public_profiles` (come già fa `ProductGrid`), oppure esporre le colonne vetrina via una policy/relationship dedicata.

### 🔴 B3 — Il build di produzione su Render fallisce
**File:** `render.yaml:26` (buildCommand) + `:33-34` (`NODE_ENV=production`)
`NODE_ENV=production` è impostato anche in fase di build, quindi `npm ci` **omette le devDependencies** necessarie a `next build` (autoprefixer/postcss/@types…) → il build si interrompe.
**Impatto:** ogni deploy fallisce in build; nessuna nuova release raggiunge gli utenti.
**Fix:** non forzare `NODE_ENV=production` in build — `buildCommand: npm ci --include=dev --legacy-peer-deps && npm run build` **oppure** `NPM_CONFIG_PRODUCTION=false`. Verificare con un deploy reale.

### 🔴 B4 — Venditore auto-approvato senza KYC *(doppia conferma: Architettura + RLS)*
**File:** `migrations/015_competitive_moats.sql:143-151` · `app/sign-up/page.tsx:21,75` · `migrations/082_products_insert_seller_bind.sql` · `app/sell/page.tsx:73-74`
`handle_new_user` (ultima ridefinizione del corpo, 015) fa `is_approved = CASE WHEN role IN ('seller','rider') THEN true`. La pagina `/sign-up` espone "Venditore" e passa il ruolo dal client. Tutte le guardie leggono `is_approved` (non `approval_status`), quindi il venditore auto-registrato è **LIVE** e riceve ordini COD (fuori Stripe) con **zero review/KYC**. Il flusso curato `/sell` invece imposta `is_approved=false`: due fonti di verità incoerenti.
**Impatto:** marketplace aperto a venditori non identificati che incassano denaro reale — frode, prodotti illeciti, responsabilità legale/AML, aggiramento totale della fiducia su cui si regge il progetto.
**Fix:** allineare `handle_new_user` a `/sell` (nuovi seller `is_approved=false`, `approval_status='pending'`); assegnazione ruolo/approvazione solo da staff/server; rimuovere "Venditore" dal signup diretto; unificare su UNA fonte di verità.

### 🔴 B5 — I documenti KYC non vengono mai cancellati
**File:** `app/api/cron/process-deletions/route.ts` (KYC_FIELDS 48-66, loop 105-144) · `app/api/admin/users/[id]/delete/route.ts` · `app/api/kyc/upload-document/route.ts:44-49` (bucket `kyc-docs`, path `{userId}/…`)
Alla chiusura account si anonimizza il profilo ma **non si toccano gli oggetti nello storage `kyc-docs`**: carta d'identità, selfie, patente, assicurazione, HACCP restano lì.
**Impatto:** violazione diretta **art. 17** (oblio) e **art. 5.1.e** GDPR sulla categoria di dati più sensibile; in caso di breach dello storage si espongono documenti d'identità di utenti che si credevano cancellati. Sanzione Garante + responsabilità civile.
**Fix:** in entrambi i flussi di delete, dopo `deleteUser` elencare `storage.from('kyc-docs').list(userId)` e `.remove(paths)`, idempotente e con audit; aggiungere le colonne `kyc_*_url` all'anonimizzazione; job di reconciliation per gli orfani.

### 🔴 B6 — Ordini "Ritiro in negozio" senza stato finale → payout congelato
**File:** `app/seller/orders/[id]/page.tsx` (nessuna azione pickup) · `migrations/061_...:230`
Non esiste una transizione che porti un ordine "ritiro in negozio" a `Consegnato`: quel percorso non ha azione dedicata e finisce in limbo → il `payout_status` non avanza mai.
**Impatto:** denaro del venditore trattenuto a tempo indefinito, ordini permanentemente in limbo, esperienza cliente rotta; lo sconto 10% del ritiro diventa una trappola. Rompe un intero metodo di consegna.
**Fix:** aggiungere una transizione dedicata (azione venditore/buyer "Consegnato al cliente" via RPC `SECURITY DEFINER` con codice di ritiro che setta `delivered_at`/`payout_status`); escludere i pickup dalla dashboard rider; copy di stato dedicati per il buyer.

---

## 3. 🟠 Gravi (43) — da chiudere prima del go-live con soldi/utenti reali

### 🏗️ Architettura — 3 gravi
- **La guardia "negozio chiuso" esiste solo sul COD, assente sul checkout con carta**
  - `app/api/stripe/checkout/route.ts; app/api/orders/cod/route.ts:132,145`
  - **Impatto:** Ordini carta verso negozi chiusi → rider inviato a saracinesca abbassata, consegne fallite, rimborsi, esperienza cliente e rider pessima; incoerenza di regole di business tra metodi di pagamento.
  - **Fix:** Estrarre il controllo orari in una funzione condivisa e applicarlo identico in entrambe le route (caricare store_hours anche nella query sellers del checkout Stripe e ripetere isStoreClosedForOrder prima di creare la session).
- **Matematica di creazione ordine duplicata (~200 righe) tra checkout Stripe e COD**
  - `app/api/stripe/checkout/route.ts:282-283; app/api/orders/cod/route.ts`
  - **Impatto:** Divergenze già presenti (clamp sconto mancante nel COD, orari) e alto rischio che patch monetarie vengano applicate solo a un percorso; superficie di regressione doppia su codice che maneggia denaro.
  - **Fix:** Estrarre un modulo condiviso (es. lib/orders/priceOrder.ts) che, dato groups+delivery+coupon, restituisce i gruppi persistiti con subtotali/spedizione/fee/sconti/split già calcolati. Entrambe le route lo consumano; le differenze legittime (metodo pagamento, wallet, orari) restano parametri. In particolare portare il clamp totalDiscountCents anche nel COD.
- **Middleware applica il gate is_approved anche a /admin e /rider, incoerente con l'auth delle API**
  - `middleware.ts:222,257; lib/api/middleware.ts:171-177; migrations/012_admin_role.sql; migrations/001_create_tables.sql:6`
  - **Impatto:** Blocco totale delle pagine /admin per un admin appena promosso (accesso solo via API), difficile da diagnosticare in produzione; incoerenza di autorizzazione tra due livelli.
  - **Fix:** Nel middleware richiedere `approved` solo per il ramo seller (o basarsi su approval_status per i seller), non per admin/rider. In alternativa garantire per contratto is_approved=true alla promozione admin (aggiornare migrations/012). Allineare la regola tra middleware e withAdminAuth.

### 🛡️ RLS & Database — 4 gravi
- **Policy RLS ordini 'rider' senza controllo di ruolo: qualsiasi utente autenticato legge la PII di consegna dei clienti**
  - `migrations/019_rider_visibility.sql:15-21 (SELECT) e migrations/011_orders_delivery.sql:128-134 (UPDATE)`
  - **Impatto:** Data breach della PII di TUTTI i clienti (nome, telefono, indirizzo di casa, geolocalizzazione) verso qualunque account registrato -> blocco GDPR per il go-live; possibile disturbo operativo tramite claim abusivi.
  - **Fix:** Aggiungere il gate di ruolo al primo disgiunto: ... AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role='rider' AND is_approved) (o una funzione is_rider() STABLE SECURITY DEFINER) sia sulla SELECT sia sulla UPDATE.
- **Over-grant colonne sensibili al ruolo authenticated: KYC/IBAN/codice fiscale/Stripe leggibili tramite 'Public profile read'**
  - `grant di colonna su public.profiles per authenticated (mai revocato in migrazioni) + migrations/033_buyer_public_profile_zone_codes.sql:29-31 (policy 'Public profile read') + components/PublicProfileToggle.tsx`
  - **Impatto:** Esposizione di dati finanziari e d'identita (IBAN, codice fiscale, data di nascita, URL documenti KYC, Stripe ID, indirizzo, telefono) a qualunque utente registrato -> violazione GDPR/AML.
  - **Fix:** REVOKE SELECT sulle colonne sensibili di profiles da authenticated e servire i profili pubblici SOLO tramite view a colonne whitelisted. In alternativa spostare KYC/finanza in una tabella separata accessibile solo a service_role. Aggiungere anche il congelamento coerente di public_profile_enabled nel trigger.
- **Auto-approvazione al signup: role e is_approved presi da raw_user_meta_data controllato dal client**
  - `migrations/015_competitive_moats.sql:137-157 (handle_new_user, ultima ridefinizione del corpo) + app/sign-up/page.tsx:71-79 + migrations/061 (enforce_profile_update_rules)`
  - **Impatto:** Escalation di privilegio e aggiramento KYC; abilita l'exploit di lettura PII degli ordini rider; incoerenza con l'intento di approvazione di 021.
  - **Fix:** In handle_new_user forzare sempre is_approved=false e role='buyer'; assegnazione seller/rider e approvazione solo da staff/server (service_role). Nel trigger bloccare anche i passaggi role->'seller'/'rider' per utenti non privilegiati.
- **returns_buyer_insert non validato: il client puo forgiare richieste di reso bypassando /api/returns/create**
  - `migrations/024_blockers_money_kyc_returns_cash.sql:108-109`
  - **Impatto:** Inquinamento dei dati resi, attribuzione di resi a venditori estranei, blocco dei payout (il cron sospende gli ordini con reso aperto), aggiramento dei vincoli legali sul recesso. Nessun furto diretto (il rimborso richiede comunque la decisione seller/admin).
  - **Fix:** Rimuovere returns_buyer_insert e creare i resi solo server-side via service role (coerente con 058), oppure rafforzare il WITH CHECK: EXISTS(ordine del buyer, DELIVERED) + status='REQUESTED' + refund_amount_cents IS NULL + seller_id = seller reale dell'ordine.

### 💳 Pagamenti / Stripe — 4 gravi
- **Over-refund: refundOrder clampa al TOTALE ordine, non al residuo (+ reversal single-shot per ordine)**
  - `lib/stripe/payout.ts:330-336 (clamp), 344-393 (accredito wallet COD), 248-250 (guard reversal)`
  - **Impatto:** Perdita economica diretta: buyer COD accreditato oltre il dovuto sul wallet; su carta la quota venditore del 2o rimborso parziale non viene recuperata. Corrompe refunded_amount_cents e la riconciliazione.
  - **Fix:** Clampare al residuo: safeAmount = min(opts.amountCents, orderTotalCents - (order.refunded_amount_cents ?? 0)) e rifiutare se <=0. Rendere il claw-back cumulativo: tracciare reversed_amount_cents e permettere reversal multipli (idempotencyKey per operazione, non per ordine), vincolando che la somma dei reversal non superi seller_payout_cents.
- **Finestra di overselling: sessione Stripe (24h) piu' longeva del pending_checkout (2h)**
  - `lib/stripe/client.ts:168-193 (create session senza expires_at); app/api/cron/expire-checkouts/route.ts:27-56; app/api/stripe/webhook/route.ts:209-213`
  - **Impatto:** Overselling: ordine pagato senza inventario, stock DB gonfiato, obbligo di evasione/rimborso e disservizio. Colpisce ogni checkout carta lasciato in sospeso oltre 2h.
  - **Fix:** Impostare expires_at sulla Checkout Session allineato al pending (~2h). In handleCheckoutCompleted gestire i pending EXPIRED/CANCELED: ri-riservare lo stock (reserve_stock) prima di creare gli ordini e, se non disponibile, bloccare + alert per gestione manuale invece di creare ordini alla cieca.
- **Admin cancel di ordine COD/non pagato: nessun ripristino stock ne' storno del credito wallet**
  - `app/api/admin/orders/[id]/cancel/route.ts:63-73`
  - **Impatto:** Perdita di inventario (stock fantasma non piu' vendibile) su ogni annullo COD; il buyer che aveva usato gift card/credito perde i soldi. Divergenza contabile.
  - **Fix:** Nel ramo non-carta: chiamare restore_stock_for_order(order.id) e, se wallet_applied_cents>0, wallet_credit(user_id, wallet_applied_cents, 'order_admin_canceled', order.id) con ref idempotente. Gestire a parte i COD gia' DELIVERED (contante incassato).
- **Coupon senza riserva atomica: max_uses e first_order_only aggirabili in concorrenza (TOCTOU)**
  - `lib/coupons.ts:57-75; app/api/stripe/webhook/route.ts:359-362; app/api/orders/cod/route.ts:458-461; migrations/058_marketplace_security_hardening.sql:24-33`
  - **Impatto:** Abuso sconti: un coupon 'max 1 uso' o 'solo primo ordine' usabile N volte con richieste concorrenti; su COD e' banale (nessun attrito di pagamento). Perdita proporzionale al valore del coupon.
  - **Fix:** Claim atomico: UPDATE coupons SET uses_count=uses_count+1 WHERE code=... AND (max_uses IS NULL OR uses_count<max_uses) RETURNING, procedere solo se ha aggiornato 1 riga (con storno su checkout fallito). Per first_order_only, vincolo unico (coupon,user) su tabella di redemption.

### ⚖️ Privacy / GDPR — 4 gravi
- **Sentry (session replay + performance tracing) si carica SENZA gate di consenso, in contraddizione con la policy di consenso**
  - `lib/analytics/sentry.tsx (initSentry righe 24-61, SentryProvider 84-92); app/layout.tsx riga 148 (`<SentryProvider />` montato incondizionatamente); lib/consent.ts riga 8 ('Sentry performance' sotto 'analytics'); app/privacy/page.tsx §4 (Sentry assente dai destinatari)`
  - **Impatto:** Trattamento (session replay/tracing) attivato a prescindere dal consenso: violazione art. 122 Codice Privacy / Linee guida cookie Garante 2021 e artt. 6/7 GDPR. Incoerenza interna che smonta la difesa 'privacy by design'. Sub-responsabile non dichiarato = difetto di trasparenza (artt. 13-14, 30).
  - **Fix:** Inizializzare Sentry (o almeno replay+tracing) solo se `readConsent()?.analytics === true`, reagendo a `mc:consent-change` per attivare/spegnere a runtime; in assenza di consenso limitarsi al più a error-capturing necessario senza replay. Aggiungere Sentry Inc. ai sub-responsabili in /privacy e i suoi storage in /cookies.
- **Elenco destinatari/sub-responsabili incompleto: mancano Google (GA4), PostHog e Sentry; la cookie policy non cita PostHog né il cookie mc_vid**
  - `app/privacy/page.tsx §4 righe 96-114 (destinatari); app/cookies/page.tsx righe 65-77 (solo `_ga`); lib/analytics/posthog.tsx (session_recording, identify); components/hooks/useProfile.ts righe 35 e 43 (`identify(uid, { email })`)`
  - **Impatto:** Difetto di trasparenza sui destinatari e sulle tecnologie (artt. 13.1.e, 14, 30 GDPR; art. 122 Codice Privacy). L'interessato non può sapere che i suoi dati (email + registrazione sessione) vanno a Google/PostHog/Sentry. Registro dei trattamenti incoerente con l'implementazione.
  - **Fix:** Allineare informativa e cookie policy: aggiungere Google LLC, PostHog Inc. e Sentry Inc. (ruolo, sede USA, SCC) tra i sub-responsabili; nella cookie policy elencare i cookie PostHog (`ph_*`), il cookie `mc_vid`, e descrivere il session replay e la condivisione dell'email; oppure smettere di inviare l'email a PostHog.
- **L'informativa dichiara che ad Anthropic non arriva alcun dato personale dell'acquirente, ma le recensioni dei clienti gli vengono inviate**
  - `app/privacy/page.tsx riga 106 (claim su Anthropic); app/api/ai/reviews-summary/route.ts righe 78-95 (testo recensioni acquirenti → Anthropic); altre route in app/api/ai/*`
  - **Impatto:** Informativa inesatta/ingannevole sul perimetro del trattamento e sui trasferimenti extra-UE (artt. 13-14 GDPR; art. 44). Rischio di trattamento senza corretta base informativa e di contestazione dell'interessato/Garante.
  - **Fix:** Correggere l'informativa: dichiarare che Anthropic tratta anche contenuti generati dagli utenti (recensioni, Q&A), con base giuridica e garanzie SCC; verificare il DPA e attivare zero-retention/no-training; in alternativa pseudonimizzare/rimuovere PII dal testo prima dell'invio e restringere davvero l'invio ai soli dati non personali.
- **Beacon /api/track: gli eventi 'auth' impostano il cookie di tracciamento persistente mc_vid e loggano l'IP pieno senza gate di consenso lato server; mc_vid non è documentato**
  - `app/api/track/route.ts (gate solo per 'visitor' righe 84-90; generazione mc_vid 104-109; set cookie 1 anno 141-151; salvataggio IP/UA/geo); lib/rate-limit.ts getClientIp righe 152-159 (IP pieno, nessuna anonimizzazione); lib/activity.ts righe 47-72 (persiste ip+user_agent); app/cookies/page.tsx riga 65 ('IP anonimizzato')`
  - **Impatto:** Impostazione di un cookie di tracciamento e logging comportamentale (con IP pieno) senza consenso valido per gli eventi auth (art. 122 Codice Privacy; artt. 6/7 GDPR); cookie non dichiarato = difetto di trasparenza; claim 'IP anonimizzato' non veritiero. Espone a contestazione del Garante.
  - **Fix:** Non impostare `mc_vid` né registrare eventi comportamentali senza consenso analytics anche per gli eventi auth (o limitare mc_vid a finalità funzionale documentata); troncare/anonimizzare l'IP (ultimo ottetto); documentare `mc_vid` (finalità, durata, categoria) nella cookie policy e allineare il claim 'IP anonimizzato'.

### ✅ QA & Flussi critici — 2 gravi
- **Pagamento carta completato DOPO la scadenza del pending_checkout -> overselling e stock corrotto**
  - `/home/user/ad-mycity/marketplace/app/api/stripe/webhook/route.ts:210`
  - **Impatto:** Overselling reale: il cliente paga merce che potrebbe non esistere piu; il contatore stock resta incoerente per gli acquisti successivi; rimborsi e reclami.
  - **Fix:** (a) Impostare expires_at sulla Stripe Session ~= scadenza DB cosi Stripe rifiuta il pagamento tardivo (checkout.session.expired); (b) in handleCheckoutCompleted, se pending.status !== 'PENDING' ri-eseguire reserve_stock prima di creare gli ordini e, se fallisce, emettere refund automatico invece di creare l'ordine.
- **COD multi-negozio: se la riserva stock di un gruppo fallisce, gli ordini dei gruppi precedenti restano creati (orfani) + credito wallet gia addebitato**
  - `/home/user/ad-mycity/marketplace/app/api/orders/cod/route.ts:285`
  - **Impatto:** Ordini fantasma addebitati ai primi negozi mentre il cliente crede che l'ordine sia fallito; al retry duplica gli ordini dei primi venditori e raddoppia l'addebito del credito wallet; incoerenza tra cio che il buyer vede e lo stato reale.
  - **Fix:** Chiamare 'await rollbackCreatedCodOrders();' prima del return 409 sulla riserva fallita; meglio ancora, riservare TUTTO lo stock di tutti i gruppi in un'unica chiamata reserve_stock atomica prima di creare qualunque ordine (come gia fa il path Stripe).

### 🚢 Deploy / SRE — 5 gravi
- **Comando di install del deploy divergente dalla CI: `--legacy-peer-deps` è dichiarato obbligatorio in CI ma manca in render.yaml**
  - `render.yaml:26 vs .github/workflows/ci.yml:27-28`
  - **Impatto:** Build Render non riproducibile rispetto alla CI e falsa sicurezza dalla pipeline. Ogni tentativo di correggere il build può reintrodurre un fallimento non visto in CI.
  - **Fix:** Allineare i comandi: aggiungere un file .npmrc con `legacy-peer-deps=true` (unica fonte di verità per CI e Render) oppure usare esattamente gli stessi flag in render.yaml e ci.yml. Meglio ancora, risolvere i peer di Storybook per rimuovere la necessità del flag.
- **In produzione i log server spariscono: `logger.warn` non emette nulla né va su Sentry, e `logger.error` dipende al 100% da un Sentry opzionale**
  - `lib/logger.ts:66-90 (info/warn/error) + :53-58 (captureServerError)`
  - **Impatto:** Fallimenti su percorsi-soldi invisibili in produzione se Sentry non è impostato (e comunque i warn sono persi sempre): payout in errore, handler webhook Stripe in eccezione, rimborsi parziali da riconciliare, email non inviate, push fallite. Rende impossibile 'accorgersene alle 3 di notte'.
  - **Fix:** In produzione loggare sempre su stdout/stderr come baseline (Render li conserva) per info/warn/error, indipendentemente dal DSN; inviare anche i warn a Sentry (captureMessage/breadcrumb). Correggere i tre commenti che affermano una visibilità Sentry oggi inesistente.
- **Nessuno step di applicazione migrazioni nel deploy e drift schema non controllato in CI → codice live su schema inesistente**
  - `render.yaml:25-27 (autoDeploy/build/start) + scripts/check-migration-drift.mjs + .github/workflows/ci.yml`
  - **Impatto:** Errori 500 su checkout/webhook/ordini in produzione dopo un deploy 'riuscito', con perdita di ordini pagati o payout, finché qualcuno applica manualmente la migrazione.
  - **Fix:** Aggiungere uno step di migrazione al deploy (pre-deploy hook) oppure eseguire check-migration-drift in CI con un secret di sola-lettura e bloccare il deploy sul drift. In alternativa, deployare il codice solo dopo conferma schema applicato.
- **Mittente email di default su dominio non verificato (`no-reply@example.com`): le email transazionali falliscono in prod se RESEND_FROM non è impostato — e non è in render.yaml**
  - `lib/env.ts:44 (resendFrom default) + render.yaml (RESEND_FROM assente)`
  - **Impatto:** Conferme d'ordine al cliente, notifiche nuovo-ordine al venditore, rimborsi, gift card e alert operativi non vengono consegnati in produzione, silenziosamente. Danno diretto a fiducia/operatività del marketplace.
  - **Fix:** Aggiungere RESEND_FROM (con dominio verificato DKIM/SPF/DMARC) e RESEND_REPLY_TO a render.yaml (sync:false); validare all'avvio in produzione che il from-domain non sia example.com; far fallire il boot o un health check se il mittente è il placeholder.
- **Cron critici (payout/email/expiry) su scheduler esterno non-IaC, watchdog auto-referenziale e payout che risponde 200 anche in fallimento**
  - `render.yaml:73-92 (cron esterni) + app/api/cron/release-payouts/route.ts:181-190 + lib/cron-health.ts:20-28`
  - **Impatto:** Venditori/rider non pagati, email non spedite, checkout mai scaduti senza alcun allarme se lo scheduler esterno cade o non è configurato; i fallimenti parziali di payout restano invisibili anche coi monitor HTTP.
  - **Fix:** Gestire i cron come infrastruttura osservabile (Render Cron o monitor esterno per-job); esporre in /api/health un check 'cron freschi' (heartbeat) così l'uptime monitor intercetta lo scheduler morto; far ritornare ai cron uno stato non-200 (o alert) quando failed>0; aggiungere external-price-alerts alle soglie di staleness.

### 🔒 Sicurezza & Auth — 1 gravi
- **XSS/HTML-injection via JSON-LD: dati venditore serializzati in <script> senza escape**
  - `—`
  - **Impatto:** Stored HTML-injection persistente attivabile da un venditore (o account compromesso/venduto) contro TUTTI i clienti che aprono scheda prodotto o vetrina — le pagine piu' viste del marketplace: redirect a siti di phishing, pagine-sosia per furto credenziali, defacement, danno reputazionale.
  - **Fix:** Difesa in profondita', non affidarsi alla sola CSP. Fare escape del JSON prima di inserirlo nel tag: JSON.stringify(schema).replace(/</g,'\\u003c').replace(/ /g,'\\u2028').replace(/ /g,'\\u2029'). Centralizzare in un helper jsonLdSafe() e usarlo in tutti e 6 i sink ld+json (product, store, category x2, layout, Breadcrumb).

### 🔌 API / Backend — 2 gravi
- **Le route auth (signin/signup) usano il client Supabase 'browser' come singleton condiviso lato server → race sulla sessione e signOut('global') che revoca sessioni altrui**
  - `app/api/auth/signin/route.ts:2,43-51 · app/api/auth/signup/route.ts:2,46-51 · lib/supabase/client.ts:6-51`
  - **Impatto:** Utenti legittimi sloggati/invalidati in modo casuale sotto carico concorrente; ogni login di email non confermata sovrapposto a un altro login può revocare la sessione altrui su tutti i device. Difetto di affidabilità e sicurezza dell'auth, intermittente e difficile da diagnosticare.
  - **Fix:** Non usare il client browser 'use client' in una route server. Creare un client per-richiesta (`createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })`, nuova istanza per request) per signInWithPassword/signUp. Per email-non-confermata NON chiamare signOut() sul singleton: basta non restituire i token (nessuna sessione è persistita lato server). Se serve revocare, usare signOut mirato via service role sulla sessione specifica.
- **reverseOrderTransfer supporta un solo claw-back per ordine: il secondo rimborso/chargeback non recupera la quota venditore**
  - `lib/stripe/payout.ts:248-249 (early-return su stripe_reversal_id), 260-271 (colonna singola + idempotencyKey fisso `reversal_<orderId>`) · refundOrder:316-...`
  - **Impatto:** Perdita monetaria diretta per la piattaforma: su due rimborsi parziali, o rimborso parziale seguito da chargeback dopo il payout, il venditore trattiene la quota del secondo rimborso e MyCity la assorbe. Divergenza silenziosa saldo Stripe vs ledger DB.
  - **Fix:** Tracciare l'importo cumulativo già stornato (`reversed_amount_cents` o transfers.listReversals) invece del solo id; rimuovere l'early-return single-shot e consentire N reversal fino a seller_payout_cents; usare idempotencyKey unico per evento (es. `reversal_<orderId>_<refundId>`) invece del fisso `reversal_<orderId>`.

### 🤖 Endpoint AI — 2 gravi
- **Gate di moderazione Trust & Safety costruito ma mai collegato: creazione prodotti AI senza alcun filtro contenuti**
  - `lib/ai/moderation.ts:63 (assertSafeText/classifyProductPolicy mai importati) · app/api/ai/catalog-create/route.ts:74 · app/api/ai/catalog-create-bulk/route.ts:77`
  - **Impatto:** Esposizione legale/Trust&Safety per un marketplace: schede di prodotti vietati create senza screening e testi AI relativi; rischio reputazionale e sanzionatorio. I prodotti nascono 'draft' ma nulla nel percorso di scrittura AI filtra il contenuto e il gate esistente e' bypassabile.
  - **Fix:** Collegare classifyProductPolicy()/assertSafeText() server-side dentro catalog-create e catalog-create-bulk (bloccare l'insert se allowed=false) e nelle route di generazione testo; non affidarsi al policy_ok del passo vision (client-side). Idealmente far valere la policy anche alla pubblicazione draft->available.
- **Rate limiter non durevole (in-memory) proprio sugli endpoint AI piu' costosi (Sonnet + web_search)**
  - `app/api/ai/improve-product/route.ts:225 · diagnose/route.ts:90 · barcode-lookup/route.ts:62 · variants/route.ts:63 · copilot/route.ts:75 · catalog-batch/start/route.ts:35 (tutti rateLimit sync) vs lib/rate-limit.ts:131 (rateLimitAsync)`
  - **Impatto:** Abuso di budget AI (costo dichiarato come preoccupazione #1 nel codice): i cap orari sui reparti Sonnet+web_search possono resettarsi al restart e non reggono lo scale-out, con spesa AI non controllata.
  - **Fix:** Usare rateLimitAsync() su tutte le route AI (in particolare Sonnet+web_search) e configurare UPSTASH_REDIS_REST_URL/TOKEN; senza Upstash anche rateLimitAsync ricade in-memory, quindi servono sia lo switch delle chiamate sia l'abilitazione di Upstash. Valutare un budget-cap giornaliero per-seller in EUR basato sulla telemetria di runMessage.

### 🖥️ Frontend / UX — 3 gravi
- **Numero WhatsApp assistenza è un segnaposto morto (393000000000) hardcoded in 5 CTA**
  - `app/help/page.tsx:106 · app/contact/page.tsx:68 · app/seller/help/page.tsx:90 · app/rider/help/page.tsx:143 · components/Footer.tsx:73`
  - **Impatto:** Il canale di assistenza principale (buyer, venditori e rider) porta a un contatto WhatsApp inesistente: richieste di supporto perse, sfiducia, casi urgenti (ordine in consegna, problema pagamento) senza sbocco. Danno diretto a retention e reputazione.
  - **Fix:** Usare in tutti i punti `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER` come fa Footer:160, e nascondere/disabilitare il link quando la env non è impostata (niente numero finto). Centralizzare in un helper unico per evitare futuri disallineamenti.
- **«Contatta il rider» compone il numero del NEGOZIO, non del rider**
  - `app/orders/[id]/page.tsx:523-538 (phone: order.seller?.store_phone) · components/orders/ContactSheet.tsx:107-113`
  - **Impatto:** Il cliente con l'ordine in arrivo che prova a chiamare il rider chiama il negozio (numero sbagliato mostrato come 'rider'): confusione nel momento più critico della consegna e sfiducia. Se il negozio non ha numero, contatto rider del tutto assente.
  - **Fix:** Recuperare il telefono del rider (o un numero-proxy mascherato per privacy) e passarlo alla sheet; oppure rietichettare onestamente il bottone. Gation sul campo corretto e stato di fallback esplicito ('rider non raggiungibile via telefono, usa la chat').
- **Bottone «Invia un messaggio» nella ContactSheet non fa nulla (azione morta)**
  - `components/orders/ContactSheet.tsx:120-128`
  - **Impatto:** Nel flusso di tracking ordine (post-acquisto), l'utente che vuole scrivere al rider/negozio clicca 'Invia un messaggio' e crede di aver aperto/inviato qualcosa: la sheet sparisce, nessun messaggio parte. Contatto fallito silenziosamente; sommato al bug telefono rider, il contatto rider è doppiamente rotto.
  - **Fix:** Collegare il bottone alla chat esistente (creare/aprire la conversazione col seller o rider e router.push a /messages/{id}), oppure rimuoverlo finché non è cablato. Mai lasciare un'azione che promette e non fa.

### ⚡ Performance — 4 gravi
- **Catalogo/ricerca senza limite né paginazione: si scarica l'intero catalogo lato client**
  - `components/ProductGrid.tsx:101 (limit condizionale), :74-112 (query), :398-402 (render) — chiamato SENZA limit da app/search/page.tsx:474, app/novita/page.tsx:48, app/category/[slug]/page.tsx:432, components/StoreProductExplorer.tsx:202`
  - **Impatto:** Con la crescita del catalogo ogni ricerca/categoria trasferisce centinaia di KB–MB e crea centinaia di nodi DOM (ProductCard con next/image e più hook ciascuno) → LCP/TBT/memoria pessimi su mobile; oltre le ~1000 righe la lista è anche incompleta. Bomba di scalabilità.
  - **Fix:** Impostare un `limit` di default (24-48) e aggiungere paginazione keyset/`.range()` o infinite-scroll; virtualizzare la griglia (react-window); non selezionare `description` per le card.
- **Ordinamento e filtri (rating, sconto, stock, promo, aperti) calcolati in JS su un set troncato → ranking e conteggi sbagliati**
  - `components/ProductGrid.tsx:85-90 (switch order DB), :200-234 (filtered/sort client), :238-241 (onCount)`
  - **Impatto:** L'utente non vede i prodotti realmente migliori/pertinenti (ranking errato) e il conteggio 'N prodotti' non corrisponde al catalogo; si spreca CPU client per sort/filtri che il DB farebbe con gli indici già presenti (es. RPC `product_rating_stats` già usata per il rating).
  - **Fix:** Spingere ordinamento e filtri nel DB (join/RPC su rating server-side, filtro stock/promo in query) con LIMIT/paginazione. Il client deve solo renderizzare, non ricomporre il ranking.
- **Scheda prodotto: `select('*')` scarica colonne pesanti mai usate (search_tsv, external_data) ad ogni apertura**
  - `app/product/[id]/page.tsx:87-89`
  - **Impatto:** Payload della scheda gonfiato ad ogni view, tanto più su prodotti con descrizioni lunghe o importati (external_data) → più banda e render percepito peggiore su mobile, su pagina ad alto traffico.
  - **Fix:** Selezionare esplicitamente solo le colonne servite dalla UI (name, description, price, compare_at_price, images, stock, has_variants, category_id, seller_id, external_source_url, offers_express…). Mai `select('*')` sulla scheda; escludere sempre search_tsv/external_data.
- **Esperienza di shopping interamente client-rendered: il contenuto non è in SSR (LCP/SEO)**
  - `app/product/[id]/page.tsx:1 ('use client') + :84-93 (fetch client), app/search/page.tsx:1, components/ProductGrid.tsx:1 + :74-112`
  - **Impatto:** LCP e INP peggiori soprattutto su mobile/rete lenta, e SEO più debole sulle pagine prodotto (il contenuto non è nel markup). Impatta conversione e ranking Google.
  - **Fix:** Portare scheda prodotto e SRP a Server Component con fetch server-side (o prefetch react-query + HydrationBoundary) così il contenuto above-the-fold è già nell'HTML; mantenere client solo le parti interattive.

### 📊 Dati & Analytics — 5 gravi
- **Metà del catalogo eventi è definito ma non viene MAI emesso (funnel morti)**
  - `lib/analytics/events.ts (righe 42-169)`
  - **Impatto:** I funnel discovery (store/category), engagement (preferiti/recensioni/referral/share) e seller/rider NON sono misurabili su PostHog né GA4. Ogni analisi di conversione/retention su questi step è vuota o fuorviante: si crede che manchi il comportamento, mentre manca l'istrumentazione.
  - **Fix:** Cablare le funzioni mancanti nei punti UI reali (bottone preferiti, submit recensione, pagina store/categoria, accettazione ordine seller/rider, onboarding), oppure rimuovere dal catalogo gli eventi non tracciati così il file torna una vera single-source-of-truth.
- **Acquisti con carta (Stripe) tracciati SOLO al ritorno client su /orders → undercount di revenue**
  - `app/orders/page.tsx:67-91 (StripeReturnHandler) + app/checkout/page.tsx:516-529`
  - **Impatto:** Sotto-conteggio sistematico degli acquisti carta e del fatturato in GA4/PostHog, proprio sul canale a scontrino più alto. Il mix metodi risulta sbilanciato verso il COD (tracciato in modo affidabile client-side, checkout riga 434). ROAS/CPA calcolati su GA4 sono strutturalmente sottostimati.
  - **Fix:** Emettere purchase/order_placed lato server dal webhook Stripe (posthog-node + GA4 Measurement Protocol) usando l'order_id come transaction_id per la deduplica; tenere il tracking client solo come conferma UX.
- **Conversion rate e 'Ordini 30gg' del seller includono ordini annullati/pending**
  - `app/seller/analytics/page.tsx:84 (orders30 = orders.length), :91 (conversionRate), :212 (soglie 'media')`
  - **Impatto:** Il seller vede numero ordini e conversion rate gonfiati dagli ordini annullati/non completati, e riceve consigli automatici basati su un numero sbagliato.
  - **Fix:** Policy unica: contare come 'ordine' solo gli stati validi (escludere CANCELED ed eventuali FAILED) sia per orders30/orders7 sia per il conversion rate, coerentemente con revenue. Documentare la definizione nel GLOSSARIO-KPI.
- **Le dashboard traffico admin misurano solo i visitatori che hanno accettato i cookie analytics**
  - `components/ActivityTracker.tsx:56 + app/api/track/route.ts:87-90 → app/admin/activity/page.tsx`
  - **Impatto:** Sottostima grave e non dichiarata del traffico reale. L'admin decide su una frazione dei visitatori credendola il totale; qualsiasi tasso calcolato su questa base (es. visite→signup) è distorto.
  - **Fix:** Affiancare un conteggio aggregato cookieless/anonimo per i volumi di traffico e/o etichettare esplicitamente le metriche come 'solo utenti con consenso analytics'. Non spacciare il campione consenziente per traffico totale.
- **Doppia verità sulle 'visite': product_views scritto senza consenso, product_viewed (PostHog) gated**
  - `components/ProductViewTracker.tsx:24-49 vs lib/analytics/posthog.tsx:40-52`
  - **Impatto:** Tre numeri di 'visite/viste' che non torneranno mai — viola il principio 'una sola verità'. Inoltre profilo di rischio privacy: recently_viewed con user_id e product_views scritti prima del consenso.
  - **Fix:** Definizione unica di 'view' e base di consenso coerente: se product_views resta la fonte seller, renderla anonima/aggregata e gate coerente; oppure allineare PostHog e product_views alla stessa condizione. Documentare quale sorgente è autoritativa.

### ♿ Accessibilità — 4 gravi
- **Lightbox foto prodotto: dialog senza Esc, senza focus trap e senza navigazione da tastiera**
  - `/home/user/ad-mycity/marketplace/app/product/[id]/page.tsx:483-540`
  - **Impatto:** Un utente da tastiera o screen reader apre lo zoom ma non può chiuderlo con Esc, non può scorrere le altre foto e perde il focus dietro l'overlay: la galleria immagini della scheda prodotto (pagina ad altissimo traffico del funnel) diventa parzialmente inutilizzabile senza mouse. Viola WCAG 2.1.1 (Keyboard), 2.4.3 (Focus Order) e 1.4.13.
  - **Fix:** Riusare il primitivo Modal (che già implementa Esc + focus trap + return focus) oppure aggiungere un useEffect attivo solo quando lightbox===true che: (a) su 'Escape' fa setLightbox(false), (b) su 'ArrowLeft'/'ArrowRight' cambia activeImg, (c) sposta il focus sul bottone «Chiudi» all'apertura e lo ripristina alla chiusura, (d) intrappola il Tab tra i controlli del lightbox.
- **SearchBar (ricerca principale): autocomplete senza semantica combobox e senza navigazione con le frecce**
  - `/home/user/ad-mycity/marketplace/components/SearchBar.tsx:156-262`
  - **Impatto:** Lo strumento di scoperta più importante del marketplace è degradato per le tecnologie assistive: uno screen reader non annuncia che sono apparsi dei suggerimenti né quanti sono, e l'utente da tastiera non può usare Freccia giù/su per selezionarli (deve tabbare uno per uno). Viola WCAG 4.1.2 (Name, Role, Value) e 1.3.1.
  - **Fix:** Trasformare in combobox: sull'input aggiungere role="combobox", aria-expanded={open}, aria-controls="search-listbox", aria-autocomplete="list" e aria-activedescendant che punta all'opzione evidenziata; sul contenitore risultati role="listbox" id="search-listbox" e su ogni voce role="option" con id univoco; gestire onKeyDown per ArrowDown/ArrowUp (evidenziazione), Enter (naviga all'opzione attiva) ed Escape (chiude).
- **ProductCard: bottoni interattivi annidati dentro un <a> (nesting interattivo non valido) — su tutta la griglia prodotti**
  - `/home/user/ad-mycity/marketplace/components/ProductCard.tsx:111-200`
  - **Impatto:** Comportamento imprevedibile per gli screen reader (VoiceOver/NVDA possono annunciare l'intera card come un unico link e non esporre correttamente, o duplicare, i bottoni interni) e per il controllo vocale che non riesce a mirare i controlli annidati. Essendo ubiquo, l'impatto sull'esperienza AT è diffuso su tutto il catalogo. Viola la specifica di parsing HTML e WCAG 4.1.2.
  - **Fix:** Sciogliere l'annidamento con il pattern «linked card»: rendere la card un <article>/<div>, mettere il link prodotto solo sul titolo/immagine e stenderlo su tutta la card con un overlay (es. un <Link> con ::after inset-0), mantenendo cuore e «+» come fratelli del link (con z-index superiore) — così nessun <button> vive dentro un <a>.
- **ConfirmDialog globale: focus automatico sul pulsante di conferma + Enter conferma, e messaggio-conseguenza non annunciato**
  - `/home/user/ad-mycity/marketplace/components/ConfirmDialog.tsx:70-167`
  - **Impatto:** Rischio di conferma accidentale di azioni irreversibili: un utente da tastiera che preme d'istinto Invio conferma la cancellazione/annullamento con l'azione distruttiva già preselezionata. E lo screen reader, all'apertura, legge solo il titolo e l'etichetta del pulsante ma NON la frase «L'azione è irreversibile» (non essendo in aria-describedby): l'utente non vedente perde l'avviso critico. Attinente a WCAG 3.3.4 e 1.3.1/4.1.2.
  - **Fix:** Nei dialog danger spostare l'autoFocus sul pulsante ANNULLA e non far confermare col semplice Enter globale per le azioni distruttive; dare al messaggio un id (es. id="confirm-message") e aggiungere aria-describedby={state.message ? 'confirm-message' : undefined} al contenitore role="dialog"; aggiungere un focus trap sul Tab.

## 3b. 🟡 Minori (53) — debito tecnico e rifiniture

### 🏗️ Architettura — 5 minori
- **Route di auth /api/auth/signin e /api/auth/signup sono dead code e usano il client browser lato server** — `app/api/auth/signin/route.ts; app/api/auth/signup/route.ts; lib/supabase/client.ts:1-18`
- **Il checkout client duplica costanti e logica di spedizione/sconto invece di usare la "fonte unica"** — `app/checkout/page.tsx:43,45,331,334-342; lib/shipping.ts; lib/constants.ts:6,8`
- **lib/order-status.ts (modulo di dominio) importa icone lucide-react, accoppiando UI e logica** — `lib/order-status.ts:15-20`
- **deliveryWindow usa il fuso locale del runtime (setHours), incoerente con romeNow() di store-hours** — `lib/delivery.ts:31-33; lib/store-hours.ts:35-36`
- **Race TOCTOU sull'uso dei coupon: validazione e incremento sono separati nel tempo** — `lib/coupons.ts:57,66; migrations/058_marketplace_security_hardening.sql:24-33`

### 🛡️ RLS & Database — 3 minori
- **messages_update_read consente al destinatario di riscrivere il body dei messaggi altrui** — `migrations/026_chat_messaging.sql:84-91`
- **subscription_orders: policy FOR ALL permette al seller di modificare le righe del buyer (cross-tenant write)** — `migrations/030_achievements_giftcards_subscriptions_sponsored.sql:133-135`
- **coupons: lettura pubblica dell'intera tabella -> enumerazione dei codici sconto** — `migrations/014_mvp_sprint.sql:148-151`

### 💳 Pagamenti / Stripe — 4 minori
- **Effetti collaterali non idempotenti su retry/doppia consegna del webhook (coupon, email, notifiche)** — `app/api/stripe/webhook/route.ts:57-76 (event-log non atomico), 359-408`
- **Race charge.refunded vs payout in-flight (PROCESSING): venditore pagato senza claw-back** — `app/api/stripe/webhook/route.ts:691-700; lib/stripe/payout.ts:126-129`
- **Compenso rider non recuperato su rimborso pieno / chargeback** — `app/api/stripe/webhook/route.ts:639-744 (handleChargeRefunded), 789-853 (dispute created/closed)`
- **Il webhook non verifica payment_status='paid' ne' amount_total della sessione** — `app/api/stripe/webhook/route.ts:188-244 (handleCheckoutCompleted), 432-486 (gift card), 492-540 (spo`

### ⚖️ Privacy / GDPR — 3 minori
- **Il cookie di consenso mc_consent è impostato senza il flag Secure** — `lib/consent.ts riga 72 (`document.cookie = ...; path=/; max-age=...; SameSite=Lax`)`
- **L'export 'Scarica i miei dati' omette i log comportamentali (activity_events), gli audit log e i documenti KYC** — `app/api/account/export/route.ts righe 38-73 (elenco tabelle esportate)`
- **Identità del Titolare con dati segnaposto (P.IVA IT00000000000, indirizzo fittizio) nell'informativa** — `app/privacy/page.tsx righe 50-56 (MyCity S.r.l., Via Roma 1, P.IVA IT00000000000, email privacy@/dpo`

### ✅ QA & Flussi critici — 2 minori
- **Enforcement del limite d'uso coupon non atomico (over-redemption)** — `/home/user/ad-mycity/marketplace/lib/coupons.ts:57`
- **Il venditore puo acquistare i propri prodotti: volumi di vendita e ranking falsabili** — `/home/user/ad-mycity/marketplace/app/api/orders/cod/route.ts:72`

### 🚢 Deploy / SRE — 3 minori
- **Health check dà falsa fiducia: verifica solo 3 env e ignora le variabili critiche dei pagamenti** — `app/api/health/route.ts:38-48`
- **render.yaml è un manifest env incompleto: mancano variabili usate da funzioni e cron già dichiarati** — `render.yaml (envVars) vs codice`
- **Source map Sentry non caricate: mancano SENTRY_AUTH_TOKEN/ORG/PROJECT nel deploy → stack trace minificati** — `next.config.js:89-104 + render.yaml (SENTRY_AUTH_TOKEN assente)`

### 🔒 Sicurezza & Auth — 2 minori
- **RLS su messages: un partecipante puo' RISCRIVERE il testo dei messaggi (anche della controparte)** — `—`
- **Rate-limit per-IP aggirabile via header X-Forwarded-For falsificato + Turnstile fail-open** — `—`

### 🔌 API / Backend — 4 minori
- **validateCoupon: convalida non atomica (TOCTOU) → over-redenzione max_uses e bypass 'solo primo ordine'** — `lib/coupons.ts:57-74 · increment via increment_coupon_usage eseguito dopo la creazione ordine (check`
- **gift-cards/checkout: idempotencyKey Stripe include Date.now(), quindi non è idempotente** — `app/api/gift-cards/checkout/route.ts:81`
- **Nessun timeout esplicito sul client Anthropic né maxDuration sulle route AI con web_search** — `lib/ai/client.ts:99 (new Anthropic({ apiKey }) senza timeout/maxRetries) · route: app/api/marketplac`
- **Webhook Stripe: consegna duplicata concorrente può incrementare due volte l'uso del coupon** — `app/api/stripe/webhook/route.ts:56-76, 209-213, 359-373`

### 🤖 Endpoint AI — 3 minori
- **URL immagine arbitrari accettati e persistiti (catalog-create/bulk) senza vincolo di host allo storage del marketplace** — `app/api/ai/catalog-create/route.ts:60 · app/api/ai/catalog-create-bulk/route.ts:75 · lib/products/dr`
- **Nessun limite di dimensione del body prima di req.json() sulle route AI (pressione memoria)** — `app/api/ai/product-chat/route.ts:170 · catalog-chat/route.ts:168 · reviews-summary/route.ts:62 · cop`
- **Chat AI open-ended (product-chat/catalog-chat) usabili come proxy di web search sul budget aziendale** — `app/api/ai/product-chat/route.ts:33 (SYSTEM: 'Sei come un assistente Claude generale, ma specializza`

### 🖥️ Frontend / UX — 7 minori
- **useSearchParams senza boundary Suspense sulla pagina custom del negozio** — `app/store/[id]/[slug]/page.tsx:20`
- **Checkout con carta non geocodifica l'indirizzo: ordini con coordinate consegna nulle** — `app/checkout/page.tsx:493-502 (vs COD 381-397) · app/api/stripe/checkout/route.ts:262,349`
- **«Ripeti ordine» perde la variante scelta (taglia/colore)** — `app/orders/[id]/page.tsx:279-297,93 · app/orders/page.tsx:112-125`
- **returnTo perso nel percorso registrazione: l'ospite non torna al checkout** — `app/sign-up/page.tsx:34-37,206,70 · app/auth/callback/route.ts:20-21`
- **window.confirm/prompt nativi in flussi rider/venditore/admin nonostante esista ConfirmDialog** — `app/rider/orders/[id]/page.tsx:445 · components/seller/site/PageListEditor.tsx:46 · components/selle`
- **Form checkout nascosto + submit esterno: indirizzo salvato con campo obbligatorio vuoto blocca l'invio in silenzio** — `components/checkout/ShippingAddressForm.tsx:132,140-183 · app/checkout/page.tsx:829-839`
- **Filtro «spedizione gratis» ignorato quando si imposta un prezzo minimo, ma il chip resta attivo** — `app/search/page.tsx:478 (minPrice ternario) · 139 (chip freeShipping)`

### ⚡ Performance — 7 minori
- **Pagina 'Vicino a te': scarica tutte le recensioni negozio e le aggrega in JavaScript** — `app/near/page.tsx:41-45 (query) + :52-61 (aggregazione JS)`
- **ProductGrid: waterfall sequenziale prodotti → profili venditore su ogni superficie catalogo** — `components/ProductGrid.tsx:102-110`
- **next/image `unoptimized` in tutto il sito: niente srcset/DPR, l'attributo `sizes` è inefficace** — `components/ProductCard.tsx:132 (+ ~24 file, es. components/home/HeroStoreCard.tsx:119 hero LCP)`
- **Scheda prodotto: query recensioni senza LIMIT** — `app/product/[id]/page.tsx:116-126`
- **Cron carrelli abbandonati: N+1 (una query profilo per ogni candidato, in serie)** — `app/api/cron/abandoned-carts/route.ts:37-46`
- **Cron invio email: getUserById + update per riga, tutto in serie** — `app/api/cron/send-emails/route.ts:100-140`
- **Pagina risultati ricerca: `ilike '%term%'` solo su name invece dell'FTS già presente** — `components/ProductGrid.tsx:95-98`

### 📊 Dati & Analytics — 7 minori
- **'Visitatori 24h' calcolato su un fetch troncato a .limit(3000): si rompe silenziosamente con la crescita** — `app/admin/activity/page.tsx:114-124 (recent, .limit(3000))`
- **'Visitatori unici' conta tutte le categorie di evento con fallback su r.id → inflazione** — `app/admin/activity/page.tsx:138-141`
- **Cookie A/B 'mc_exp_home_hero' impostato per tutti i visitatori senza consenso** — `middleware.ts:122-144 + lib/experiments.ts:45 (maxAge 90 giorni)`
- **PostHog $pageview inviato con $current_url = solo path (senza origin)** — `lib/analytics/posthog.tsx:118-121 vs components/GoogleAnalytics.tsx:46-49`
- **Valore del funnel checkout incoerente: begin_checkout usa il subtotale, purchase il totale finale** — `app/checkout/page.tsx:53-55 vs :434-440 e app/orders/page.tsx:83`
- **search_performed.result_count riflette solo il match sul nome, pre-filtri client** — `components/ProductGrid.tsx:95-98 e :246-253`
- **Route /api/track: handler per 'session_start' e 'signup' mai inviati dal client (config morta/fuorviante)** — `app/api/track/route.ts:26-40 vs components/ActivityTracker.tsx:89-118`

### ♿ Accessibilità — 3 minori
- **Menu account Navbar: aria-haspopup="menu" senza role menu/menuitem e senza chiusura con Esc** — `/home/user/ad-mycity/marketplace/components/Navbar.tsx:241-342`
- **Indicatore di focus da tastiera azzerato su alcuni input (focus:outline-none vince sul :focus-visible globale)** — `/home/user/ad-mycity/marketplace/components/products/ImportFromUrlBox.tsx:149 (+ components/seller/S`
- **Selettore stelle interattivo (form recensione): manca il gruppo radio e lo stato selezionato non è esposto** — `/home/user/ad-mycity/marketplace/app/orders/[id]/review/page.tsx:17-31`

## 4. Advisor Supabase sul DB live (progetto `Mycity`)

Interrogati direttamente sul database di produzione — non solo sul codice:

**Sicurezza**
- 🔴 **2 ERROR** — viste `SECURITY DEFINER`: `seller_storefronts`, `seller_public_profiles` (eseguono con i permessi del creatore, bypassando la RLS del chiamante).
- 🟠 **9 tabelle con RLS attiva ma zero policy**: `email_queue`, `stripe_event_log`, `kpi_snapshots`, `merchants_leads`, `outreach_events`, `operational_alert_log`, `telegram_chats`, `uptime_checks`, `cron_heartbeats`.
- 🟠 **~20 funzioni `SECURITY DEFINER` eseguibili da `anon`/`authenticated`**: `is_admin`, `cancel_order`, `redeem_gift_card`, `convert_loyalty_to_credit`, `verify_delivery_code`, `verify_pickup_code`, `seller_reject_order`, `rider_release_order`, `confirm_cod_remittance`, `admin_list_user_emails`…
- 🟡 protezione password compromesse (HaveIBeenPwned) **disattivata**; estensione `pg_trgm` nello schema `public`.

**Performance — 236 lint**
- **155** policy permissive multiple (la RLS rivaluta più policy per riga → query lente su scala)
- **64** indici inutilizzati (peso su INSERT/UPDATE e storage)
- **11** `auth_rls_initplan` (RLS che rivaluta `auth.uid()` per ogni riga)
- **5** foreign key senza indice di copertura (`order_items.variant_id`, `cms_pages.updated_by`, `cod_reconciliations.remitted_by`, `review_helpful.user_id`, `site_settings.updated_by`)

> Molti di questi si sovrappongono ai finding di codice (es. le viste `SECURITY DEFINER` = i 2 ERROR; le funzioni pubbliche = superficie della dimensione RLS). La convergenza codice↔DB live **alza la fiducia** su questi punti.

---

## 5. Lettura d'insieme (dove sta il rischio)

- **Il denaro** è l'area più fragile: wallet auto-accreditabile (B1), over-refund, overselling da sessione Stripe più lunga del pending, coupon senza claim atomico (TOCTOU), admin-cancel COD che non ripristina stock né storna il credito. La base è buona ma i **bordi concorrenti/eccezionali** perdono soldi.
- **La RLS** ha buchi da data-breach: PII di consegna dei clienti leggibile da qualsiasi utente loggato (policy rider senza gate di ruolo), colonne KYC/IBAN/Stripe over-granted, auto-approvazione dal metadata del client.
- **La produzione** non è pronta a *funzionare*: build che non parte (B3), migrazioni non applicate nel deploy, log server che spariscono, mittente email placeholder, cron critici fuori-IaC senza allarme reale.
- **La compliance** ha diverse falle IT-EU concrete: KYC non cancellato (B5), Sentry/PostHog/mc_vid senza consenso, informativa che dichiara il falso su Anthropic, Titolare con dati segnaposto (`P.IVA IT00000000000`).
- **Frontend/UX**: contatti di assistenza morti (WhatsApp `393000000000`), "contatta il rider" che chiama il negozio, "invia messaggio" che non fa nulla — piccoli ma toccano fiducia nel momento della consegna.

---

## 6. Ordine di lavoro consigliato (per impatto sulla crescita)

**Sprint 0 — sbloccare (fai partire il sito e stagna le perdite):**
1. **B3** build Render (senza deploy funzionante nulla va live) — 🟡 branch, poi 🔴 deploy con Nicola.
2. **B2** ripristinare le schede prodotto per gli shopper (il sito oggi non vende) — 🟡.
3. **B1** chiudere l'auto-accredito wallet — 🟡 (una migrazione: REVOKE + trigger).
4. **B4** venditore approvato senza KYC — 🟡.

**Sprint 1 — sicurezza dati & compliance (prima di utenti reali):**
5. **B5** cancellazione KYC allo storage; policy RLS rider con gate di ruolo; over-grant colonne sensibili; Sentry/tracking sotto consenso; informativa Anthropic corretta; dati Titolare veri.

**Sprint 2 — soldi robusti & operatività:**
6. **B6** stato finale ritiro in negozio; over-refund/overselling/coupon atomici; log server sempre su stdout; RESEND_FROM verificato; migrazioni nel deploy; cron osservabili.

---

## 7. Cosa serve da Nicola (🔴 — richiedono la tua firma)

Tutti i fix di codice sono 🟡 (in branch, con anteprima). Restano **🔴 da firmare**:
- **Applicare la migrazione dei fix RLS/wallet sul DB live** (tocca lo schema di produzione).
- **Fare il deploy** della build corretta su Render.
- **Dati reali del Titolare** per l'informativa (ragione sociale, P.IVA, sede, DPO) — oggi sono segnaposto.
- **Dominio email verificato** (DKIM/SPF/DMARC) per `RESEND_FROM`.
- Decidere il **modello di approvazione venditori** (tutti via `/sell` con review manuale? auto per categorie a basso rischio?).

> Nota metodo: dei 102 problemi, **6 bloccanti + 43 gravi sono verificati avversarialmente** e ancorati a `file:riga`; i 2 più critici (B1, B2) li ho anche riletti io a mano nel codice/DB. I **53 minori** sono debito tecnico elencato in fondo per completezza.

---
