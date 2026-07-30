---
data: 2026-07-30 01:20
tipo: radiografia profonda del marketplace
repo: NicolaeRotaru/mycity
metodo: 13 revisori senior in parallelo, sola lettura + verifica mia sul database di produzione
obiettivo: pronto per settembre, zero errori
---

# Radiografia completa del marketplace MyCity — 30 luglio 2026

## Il verdetto

**Il marketplace oggi non funziona. Non è "da rifinire": è fermo.**

Tre guasti, tutti verificati da me sul database di produzione, si sommano:

1. **Nessun cliente può comprare.** Ogni scheda prodotto mostra «Prodotto non disponibile» a chiunque non sia admin.
2. **Nessun ordine può avanzare.** Un venditore non riesce ad accettare un ordine; un rider non riesce a consegnarlo. Errore di database.
3. **Il codice non si compila**, quindi da 10 giorni nessuna modifica arriva in produzione — e la CI era rossa senza che nessuno lo sapesse.

Questo spiega il dato che avevo davanti dall'inizio e che all'inizio avevo letto come "siamo agli inizi": **1 negozio, 5 prodotti, 1 ordine, 0 ordini pagati.** Non è un marketplace giovane. È un marketplace che non ha mai potuto vendere.

**La buona notizia, ed è grossa:** il codice è di ottima qualità. Non ho trovato sciatteria — un solo `console.log`, due `TODO`, zero link rotti su 70, i pagamenti con carta non toccano mai il nostro server, la RLS copre il 100% delle tabelle, il consenso cookie è migliore della media del mercato italiano. **I guasti non vengono da codice scritto male: vengono da tre migrazioni del database applicate a metà**, senza aggiornare il codice che dipendeva da esse, e senza un test che se ne accorgesse.

Per settembre serve lavoro serio, ma è lavoro **chirurgico e ben localizzato**, non una riscrittura.

---

## 1. La causa radice: tre migrazioni lasciate a metà

Quasi tutti i guasti gravi discendono da qui. Vale la pena capirlo una volta, perché è la lezione che evita il prossimo.

### Migrazioni 110 e 112 → hanno spento il catalogo

Le due migrazioni hanno fatto una cosa **giusta**: hanno rimosso da `profiles` le policy che esponevano l'intera riga (IBAN, codice fiscale, documenti KYC, `stripe_account_id`) a chiunque. Il rimedio previsto era leggere i dati pubblici dei negozi da una vista dedicata, `seller_public_profiles`.

**Ma il codice è stato convertito solo in parte.** Verificato da me sul database di produzione: le uniche policy di lettura rimaste su `profiles` sono *il proprio profilo*, *admin*, *il rider sul cliente di un ordine assegnato*. Nessuna per i visitatori.

E **50 file** leggono ancora `profiles!...` in join. Il peggiore:

```
app/product/[id]/page.tsx:87   profiles!products_seller_id_fkey ( id, store_name, is_approved, … )
app/product/[id]/page.tsx:238  if (!product.profiles?.is_approved) → "Prodotto non disponibile"
```

Il join torna `null` → la condizione è vera → **ogni prodotto risulta non disponibile, per tutti tranne l'admin.** Il negozio è chiuso mentre l'insegna è accesa.

Lo stesso join spento manda in bianco: il rider (non vede nome, indirizzo né telefono del negozio da cui ritirare), la chat col negozio (404), i preferiti, i "visti di recente", i prodotti simili, gli acquistati insieme, **il carosello degli sponsorizzati** (i venditori pagherebbero €4,99 a settimana per uno spazio che non si mostra), la ricerca, i nomi dei negozi negli ordini e nei messaggi. E rende `noindex` tutto il catalogo per Google.

### Migrazione 105 → ha spento il ciclo di vita degli ordini

La 105 ha eliminato la colonna `orders.invoice_number`. Ma il guardiano degli ordini, `enforce_order_update_rules()` (scritto nella 061 e **mai** riscritto dopo), la elenca ancora fra i campi protetti.

Verificato da me sul database vivo, in quattro passaggi:

| Controllo | Esito |
|---|---|
| `orders.invoice_number` esiste? | **NO** |
| La funzione la cita ancora? | **SÌ** |
| Il trigger è attivo? | **SÌ** |
| Il ramo privilegiato esce prima? | **SÌ** — quindi admin e servizi non se ne accorgono |

In PL/pgSQL il riferimento a un campo inesistente di `NEW` viene risolto **alla preparazione dell'espressione**: l'errore `record "new" has no field "invoice_number"` scatta a prescindere dallo short-circuit. E il venditore accetta l'ordine dal browser (`app/seller/orders/[id]/page.tsx:205`, client `authenticated`), quindi passa proprio da lì.

**Risultato: nessun ordine può passare da NEW. Nessuna consegna, nessun incasso.**

### Perché nessuno se ne è accorto

- La **CI non ha un gate**: la PR #218 è stata mergiata con i suoi check **rossi**, e su `main` il 27% delle run recenti è rosso — il rosso è la normalità.
- Due job su quattro sono **verdi per costruzione**: i test RLS e gli E2E si auto-saltano se mancano i secret, e riportano `success` in 25 secondi senza eseguire nulla.
- Il **logger in produzione non scrive su stdout** (`lib/logger.ts:66`): i log di Render sono vuoti per progetto.
- L'unico test SQL sulla RLS **non può girare** (inserisce ordini come `authenticated`, cosa che la 058 ha vietato).
- La suite verifica la logica pura, non che **un ospite riesca ad aprire una scheda prodotto**.

> È il difetto di sistema più importante di tutta la radiografia: **le difese ci sono tutte — heartbeat, claim atomici, alert con cooldown, KYC fail-closed — ma nessun guardiano sa dichiararsi cieco.** Un controllo che non può fallire non è un controllo.

---

## 2. Le prove dure (i gate, eseguiti davvero)

| Gate | Prima | Dopo i miei fix | Prova |
|---|---|---|---|
| `tsc --noEmit` | ❌ **4 errori** | ✅ 0 | `TSC_EXIT=2` → `0` |
| `next lint` | ❌ fallito | ✅ 0 | parse error → nessun warning |
| `next build` | ❌ fallito | ✅ **169 pagine** | `Unterminated block comment` → `BUILD_EXIT=0` |
| `vitest run` | ❌ 717/718 | ✅ **718/718** (83 file) | 1 fallimento → `TEST_EXIT=0` |
| CI su `main` | ❌ **rossa dal 20/07** | — | run dei merge #218 e #219 = `failure` |

La catena che bloccava il build, tutta figlia della PR #218:

1. **`components/ui/VerifiedBadge.tsx:4`** — commento `/**` **mai chiuso**: si mangiava `type Props`. Catena di import: `VerifiedBadge` ← `HeroStoreCard` = la home.
2. **`components/home/HeroStoreCard.tsx:75`** — `store` può essere `null` e veniva dereferenziato subito dopo, senza la guardia che esiste 7 righe sopra. Erano i 3 errori **nascosti dietro** il primo (il build si ferma al primo).
3. **Migrazione `108` duplicata** → ordine di applicazione ambiguo; la guardia del repo lo segnalava e nessuno l'ha raccolta.

E il difetto correlato, **provato a runtime** contro il database di produzione:

```
select stripe_charges_enabled from public.seller_public_profiles
→ ERROR: 42703: column "stripe_charges_enabled" does not exist
```

La vista in produzione ha 17 colonne e non ha i due flag Stripe: la 108 che li aggiungeva **non è mai entrata**, la 112 ha vinto. Ma **quattro pagine pubbliche li selezionano** (`app/stores`, `app/near`, la pagina negozio, la hero della home). Nota tecnica che conta: `CREATE OR REPLACE VIEW` non può riordinare né rinominare colonne — solo aggiungerne in coda. La vecchia 108 le inseriva *prima* di `role`/`created_at`: applicata sopra la 112 sarebbe **fallita**. Le due erano reciprocamente inapplicabili.

---

## 3. Lo stato reale della produzione

| | |
|---|---|
| Negozi approvati | **1** |
| Prodotti | **5** |
| Ordini | **1** · **pagati: 0** |
| Tabelle | 71 · **0 senza RLS** ✅ |
| Advisor Supabase | **3 ERROR** (viste `SECURITY DEFINER`) — a giugno erano 0 |
| Foreign key senza indice | 5 (minori) |

---

## 4. I 13 BLOCCANTI

### 🔴 Il marketplace non funziona (3)

**B1 · Ogni prodotto risulta «non disponibile»** — `app/product/[id]/page.tsx:87,238` · policy `profiles` assenti. *Verificato da me sul DB.* Nessuno può comprare niente.

**B2 · Nessun ordine può avanzare** — `enforce_order_update_rules()` cita `orders.invoice_number`, cancellata dalla 105. *Verificato da me sul DB in 4 passaggi.* Venditori e rider bloccati.

**B3 · Il codice non compila, quindi la produzione è congelata da 10 giorni** — `VerifiedBadge.tsx:4`. Render tiene l'ultima versione buona (`d6a0d7b` del 19 luglio): due merge non sono mai arrivati ai clienti, **e nessuno lo sapeva**. ✅ *risolto da me.*

### 🔐 Buchi che creano o bloccano denaro (5)

**B4 · Un utente qualsiasi si accredita credito MyCity da solo** — `wallet_balance_cents` non è congelato dal trigger (nato con la 087, dopo il trigger) ed è nel `GRANT UPDATE` per colonna. *Verificato da me sul DB.* Una `PATCH` sul proprio profilo crea €5.000 di credito spendibili. La quota venditore è calcolata sul lordo → **MyCity paga il negozio di tasca propria per merce mai pagata.** Ripetibile all'infinito.

**B5 · Chiunque può congelare i payout di qualsiasi negozio** — la policy di INSERT su `returns` controlla solo `auth.uid() = buyer_id`, **non** che l'ordine sia suo. *Verificato da me sul DB.* Un reso finto su un ordine altrui mette quell'ordine in `OPEN_RETURN_STATUSES` e il cron salta il pagamento. Ripetibile su ogni ordine consegnato.

**B6 · Rimborso parziale non riduce il payout** — `lib/stripe/payout.ts:397,435`. Ordine da €100, reso parziale di €50, il venditore incassa comunque €90: **la piattaforma perde €40**. Deterministico. E un rimborso fatto dal Dashboard Stripe non tocca nemmeno l'ordine.

**B7 · Checkout scaduto lato nostro, pagabile per altre 22 ore** — il nostro `pending_checkout` scade a 2 ore, la sessione Stripe vive 24, e il webhook non blocca gli scaduti. Il cliente paga per merce che nel frattempo è stata rivenduta.

**B8 · La rimessa contanti COD è un flag senza importo** — `confirm_cod_remittance(rider, data)` sblocca **tutti** gli ordini del rider di quel giorno, senza ricevere un importo e senza controllare le conferme. Con un rider disonesto la perdita è illimitata e ripetibile ogni giorno.

### 🧾 Fiducia e legge (3)

**B9 · La commissione pubblicata è 8%, quella incassata è 10%** — `app/terms/page.tsx:206` vs `lib/constants.ts:24`. *Verificato da me.* Ogni venditore può pretendere la restituzione del 2% su tutto lo storico (Reg. UE 2019/1150). **Su un lancio che si gioca sulla fiducia dei negozianti piacentini, è il danno peggiore della lista.**

**B10 · Identità legale interamente inventata** — `P.IVA IT00000000000` (formalmente impossibile), `REA PC-000000`, `PEC mycity@pec.it`, telefono `0523 000000`. *Verificato da me.* E tutte le email per i diritti puntano a `@mycity.it`, mentre il dominio reale è `mycity-marketplace.com`: **le caselle non esistono**, l'interessato non ha un canale.

**B11 · Il "Drop del giorno" pubblicizza un prezzo che non viene applicato** — la home mostra prezzo scontato, barrato e countdown; `product_active_discount` legge solo `seller_promotions` e **non** `daily_drops`. Al checkout si paga il prezzo pieno. Pratica commerciale scorretta, non solo bug.

### 🔒 Dati personali (2)

**B12 · Documenti d'identità e selfie non vengono MAI cancellati** — le 6 colonne col percorso del documento non sono in nessuna lista di anonimizzazione e **non esiste una sola `storage.remove()` in tutto il repo**. Aggravante: il commento nel codice dice «i dati KYC vanno sempre cancellati» — l'inadempimento è documentalmente consapevole.

**B13 · Foto recensioni: bucket pubblico, GPS di casa intatto, user-ID nell'URL** — lettura ed elencazione aperte, path `{userId}/...` (si ricostruiscono tutti gli acquisti di una persona), e **nessuno strip EXIF** benché il ricodificatore esista nel repo per le foto prodotto. Le foto scattate in casa arrivano con le coordinate del domicilio.

---

## 5. I GRAVI (circa 75), per area

**Soldi (16):** claw-back a compounding che sotto-recupera il venditore sui rimborsi multipli · **dispute vinta dopo il payout = soldi del negozio confiscati per sempre**, nessun percorso in-app per ripagarlo · **il rider non viene pagato su nessuna consegna sopra €30** (`rider_fee_cents` esiste in DB e **non è scritto da nessuna parte**) né su **alcun** ordine in contrassegno (il cron filtra `payment_method='card'`) · la migrazione 096 calcola la commissione COD sul lordo → 11,3% invece di 10%, a carico del negozio, su importi **già liquidati** · due formule di payout incoerenti fra carta (094) e COD (096) · il coupon si consuma anche se il pagamento non avviene e **non esiste alcuna funzione di rilascio** · ordine con **carta** accettato a negozio chiuso (il controllo esiste solo sul COD) · payout bloccato in `PROCESSING` **senza nessun percorso di recupero**, e la finestra si apre a ogni deploy · payout rider fallito → `HELD`, **mai più ritentato né allertato** · doppio abbonamento venditore da €50/mese a tempo indeterminato · sconti di marketing della piattaforma addebitati **integralmente al negozio** · gift card rimborsata o contestata resta spendibile (nessuna colonna la lega alla charge) · il rimborso ignora il credito già speso (il cliente perde la gift card) · `transfer.reversed` marca REVERSED anche su storno parziale · doppio rimborso per race fra reso e dispute · annullo admin senza claim atomico → doppio accredito wallet e stock gonfiato.

**Robustezza (10):** ordine COD **senza idempotenza** → rete che cade e il cliente ordina due volte · il rider può "confermare l'incasso" **prima della consegna** (la guardia è nel docstring, non nel codice) · rider che non conferma mai: **l'ammanco è invisibile** perché l'alert cerca `MISMATCH` e una riga *assente* non è un mismatch · premio referral da €5 **senza soglia né claw-back** (10 account satellite = €50 contro €10 di merce) · il webhook **ingoia gli errori** di gift card, sponsorizzazioni e abbonamenti e marca l'evento come processato → Stripe non ritenta mai, incasso senza controprestazione · **`getClientIp` legge l'XFF più a sinistra** → tutti i rate limit per-IP sono aggirabili, la protezione anti-brute-force sul login è nulla · la macchina a stati dei resi è **troncata** (`SHIPPED_BACK`/`RECEIVED` non hanno endpoint) → un reso approvato congela il venditore per sempre · `formData()` senza try/catch → 500 sull'upload KYC · 90 MB bufferizzati in RAM su `vision/extract-products` prima di ogni validazione · la chiave service-role usata come segreto di header HTTP (finisce nei log dei proxy).

**AI (5):** il job **"Migliora tutto" può riscrivere i prezzi di 200 prodotti con un click** — lo schema del tool espone `price`/`stock`/`status` mentre il prompt parla solo di testi, e l'anteprima mostra **solo una frase in prosa**: i valori non compaiono mai a schermo, nessuno snapshot, nessun undo · il tetto di spesa AI legge `AI_GLOBAL_DAILY_BUDGET_EUR`, **assente da `.env.example` e da `render.yaml`** → il freno è **spento in produzione**, e comunque vive nella RAM del processo · prompt injection: recensioni di **acquirenti** e **pagine web esterne** concatenate senza delimitatori (il modello corretto esiste già in `lib/ai/moderation.ts`) · `catalog-apply` scrive nome e descrizione **senza limite di lunghezza** e il DB non ha vincoli · il gate Trust & Safety della creazione multipla è **solo lato browser**: con DevTools si pubblicano prodotti vietati.

**Frontend/UX (13):** **loop di redirect infinito su tutto il sito** per ogni venditore non approvato, sospeso o rifiutato — e le schermate di stato corrette **esistono già** nel layout, sono codice morto perché il middleware non arriva a renderizzarle · **chi ha pagato con carta legge «Paghi in contanti al rider»** (`payment_method` non è nemmeno nella query) · "Ritiro in negozio" bloccato dal browser su campi che l'app dichiara opzionali · indirizzo salvato + validazione fallita = **bottone "Conferma ordine" morto, zero feedback** · **flash di "carrello vuoto"** su `/cart` e `/checkout` · ID prodotto inesistente mostra "problema di connessione" invece di "non trovato" · **il rider vede «Compenso €4,90» su consegne che gli pagano €0** · "Ripeti ordine" **svuota il carrello senza chiedere** e produce un ordine non concludibile · **"Contatta il rider" chiama il numero del negozio** · un URL immagine incollato dall'admin **abbatte la homepage** · filtri di ricerca non nell'URL · **link admin verso `/admin/orders/[id]` che non esiste** (3 pagine, tutti 404) · **l'export GDPR del cliente non contiene nessun ordine** (filtra su `buyer_id`, la colonna si chiama `user_id`) e la route corretta esiste ma non è chiamata da nessuno.

**Design/visivo (11):** le **stelle di rating** sono a 2,16:1 e 2,52:1 — la vuota ha *più* contrasto della piena, la differenza fra 2 e 5 stelle è portata **solo dal colore** (è il segnale di fiducia n.1) · il **cookie banner copre i pulsanti** delle finestre di conferma · i **titoli dei modali sono 30px serif e troncano** perché manca la classe `text-*` · **la griglia salta al caricamento**: skeleton a 4 colonne, contenuto a 6 · ogni **pulsante disabilitato** è illeggibile (~2,3:1) · testo bianco su foto **senza velo** nello StoryViewer (fino a 1,00:1) · focus ring cancellato senza sostituto nei form del venditore · nome prodotto nell'ordine **troncato a una riga** · e la regola che vietava i px a mano **esiste ma non viene mai eseguita** (oxlint non è installato): **310 valori fuori scala misurati**, incluso `text-[10px]` e `text-2xs` per la stessa misura **nello stesso file a 13 righe di distanza**.

**Accessibilità (12):** nel dialogo di conferma **Invio confermava sempre** — da tastiera premere Invio su "Annulla" **eseguiva** l'azione distruttiva, su 21 chiamanti ✅ *risolto da me* · nessun focus trap in **tutti e 5** i modali fatti a mano, mentre il codebase contiene **tre primitive corrette** che il percorso critico non usa (il fix non è costruire, è **adottare**) · `VerifyCodeDialog` (la conferma di consegna) ha input **senza label** ed errore **mai annunciato** · il campo coupon non è etichettato e l'errore non è annunciato → **si paga il prezzo pieno credendo di avere lo sconto** · `aria-label="Carrello"` **sovrascrive** il contatore articoli · e la **Dichiarazione di Accessibilità non è veritiera**: dichiara audit con `axe-core` e `pa11y`, **nessuno dei due è nel progetto**.

**Privacy/legale (14):** PostHog e Sentry **non dichiarati** fra i responsabili, con session replay mai menzionato e PostHog su region **US** · il "Provider KYC (Onfido/Jumio/Veriff)" dichiarato **non esiste**: in produzione è revisione interna, l'opposto di quanto scritto, **senza alcun log di accesso ai documenti** · **nessuna informativa pre-contrattuale nel checkout** → art. 53 Cod. Cons.: il recesso passa da 14 giorni a **12 mesi** e le spese di restituzione diventano inopponibili · manca il **modulo tipo di recesso** · **il fee di €3 "Consegna MyCity" non è dichiarato da nessuna parte** e sopravvive alla "spedizione gratis sopra €30" · la cancellazione account lascia **nome, telefono, indirizzo, note al citofono e GPS** negli ordini per 10 anni · **GPS del rider conservato per sempre** (è il capo d'accusa dei provvedimenti Foodinho 2,6 M€ e Deliveroo 2,5 M€) · newsletter **senza doppio opt-in, senza prova del consenso e senza disiscrizione**, con RLS `WITH CHECK (true)` = chiunque iscrive l'indirizzo di chiunque · **modificare Termini, Privacy e FAQ dall'admin non cambia il sito** (solo `/about` legge il CMS) · e in fondo a ciascuna delle tre pagine legali c'è un **avviso pubblicato ai consumatori** che ammette che il documento «DEVE essere validato da un avvocato»: è una confessione documentale.

**Database/RLS (9):** la policy anti-recensione-falsa contiene una **tautologia** (`store_id = store_id`, perché `orders` non ha `store_id`) → **si può bombardare di recensioni negative qualsiasi negozio** · chi partecipa a una conversazione può **riscrivere i messaggi dell'altro** (nessun `WITH CHECK`) · `get_referral_leaderboard()` espone i **nomi reali dei compratori** a utenti anonimi · `event_rsvps` e `shop_of_month_votes` hanno `USING (true)`: la policy vuole un conteggio ed espone le righe · 3 viste `SECURITY DEFINER` che scavalcano la RLS, di cui una espone **venditori non approvati** e una il `referral_code` · la migrazione 110 **non è riapplicabile** (cita 8 colonne inesistenti, dentro `BEGIN…COMMIT`): su un ambiente nuovo va in rollback e **si perde anche la sua correzione di sicurezza** — terza occorrenza dello stesso errore · `app/seller/reviews/page.tsx:40` cita un vincolo che non esiste → la pagina recensioni del venditore non carica · il rilevatore di drift confronta i **nomi dei file** (61 tracciati contro 113) e ha due skip a exit 0, uno dei quali per un pacchetto **non installato**: guardiano morto due volte.

**Performance (10, quasi tutte latenti — mordono a volume):** `useProfile()` chiamato **in ogni ProductCard** → fino a **104 chiamate serializzate** a `/auth/v1/user` per pagina (5-10 secondi di traffico auth per un utente loggato) · due sottoscrizioni Realtime **senza filtro** su `orders` e `conversations`, montate su ogni pagina → l'amplificazione delle query **cresce col numero di visitatori contemporanei** · dashboard admin con **tre scansioni full-table ogni 30 secondi** (a 50k ordini: ~8,6 GB/giorno per una sola tab aperta) · tre liste ordini **senza paginazione**, due con polling a 30s · **indice mancante su `profiles(role, is_approved)`**: la home fa seq scan della tabella che cresce coi *clienti* · `select('*')` sulla pagina prodotto → il **tsvector** viaggia fino al browser (3-8 KB inutili per vista) · i filtri della griglia girano **client-side su una finestra di 96 righe** → risultati e contatori sbagliati a volume · `.in()` con **2000 UUID** nella sitemap → oltre il limite dell'URI, **la sitemap si rompe in silenzio** · `activity_events` con 8 indici, trigger per-riga su 12 tabelle e **nessuna retention** · middleware con **2 round-trip in più per navigazione** su tutto il catalogo (per utenti loggati).

**Test (misurato):** **79 route API, 33 con almeno un test, 46 con zero.** Senza test: `orders/cod` (468 righe, **il** flusso di incasso), la funzione che trasforma un pagamento in ordini, annullo admin, payout, i 4 punti di incasso laterali, la guardia anti-overselling. `tests/unit/cart.test.ts` testa **solo** `cartTotal` e `cartCount`. L'E2E promette "flusso buyer/seller/rider end-to-end": la realtà è **solo smoke anonimo** — zero login, zero acquisto, zero COD, zero carta.

**Deploy/SRE (13):** nessun gate blocca il merge · il passo `Build` è stato **saltato** (il lint fallisce prima) e **`typecheck` non è in CI** nonostante il nome del job · due job **verdi per costruzione** · **il logger non scrive su stdout in produzione** · **le chiavi push VAPID non sono in `render.yaml`** → notifiche morte con cinque semafori verdi (e la push è come il negoziante scopre di avere un ordine) · `RESEND_FROM` ricade su `no-reply@example.com` → **tutte le email fallirebbero** · l'health check accoppia la vita del servizio a Supabase (un blip del DB **blocca ogni deploy**) e **ignora Stripe** · **nessuna procedura di rollback**: il runbook insegna a fixare in produzione · **nessun cron è programmato dentro il progetto** (girano esternamente, da configurare a mano: se nessuno li accende, **nessun venditore viene pagato**) · le anteprime PR non hanno override → puntano alla produzione · Sentry mostrerà stack trace minificati · il service worker serve HTML vecchio dopo un deploy → **schermata bianca** · **22 variabili d'ambiente usate e assenti da `render.yaml`**, di cui 5 critiche.

---

## 6. Cosa ho già sistemato

**Nel branch `claude/amazing-lovelace-nqa9o1`, con i gate verdi a dimostrarlo:**

| Fix | File | Perché |
|---|---|---|
| Commento JSDoc chiuso | `components/ui/VerifiedBadge.tsx` | Senza questo **nulla** era verificabile |
| Guardia `if (!store) return null` | `components/home/HeroStoreCard.tsx` | Crash della hero della home |
| Migrazione rinumerata, colonne in coda | `migrations/113_…stripe_trust.sql` | Toglie il prefisso duplicato e la rende **applicabile** (prima era impossibile) |
| Rimossa la scorciatoia Invio + focus su "Annulla" se distruttiva | `components/ConfirmDialog.tsx` | Cancellava dati a chi naviga da tastiera, su 21 chiamanti |

**Gate: typecheck 0 · lint 0 · build 0 (169 pagine) · test 718/718.**

**Migrazioni preparate e NON applicate** (🔴 la firma è tua — sono modifiche allo schema di produzione):

- **`114`** — ripara il ciclo di vita degli ordini (rimuove il riferimento a `invoice_number`). Volutamente **minima**: è la riparazione di un fermo, va approvata in trenta secondi. Include la prova comportamentale da fare dopo.
- **`115`** — congela `wallet_balance_cents` (chiude la creazione di denaro dal nulla) e i campi-denaro dell'ordine. Include la query di riconciliazione da lanciare subito dopo, per sapere se il buco è già stato sfruttato.
- **`116`** — il reso pretende che l'ordine sia davvero tuo, consegnato, di quel venditore; più il vincolo unico che impedisce due resi aperti sullo stesso ordine.

---

## 7. Il piano per settembre

### Cancello 0 — far tornare vivo il marketplace (senza questo, tutto il resto è decorazione)
1. Applicare **114** → gli ordini si muovono. *(Poi provare davvero: venditore accetta → pronto → rider prende → ritira → consegna.)*
2. **Completare la conversione a `seller_public_profiles`** nei punti pubblici rimasti — si parte da `app/product/[id]/page.tsx`, poi rider, chat, checkout COD e carta. Il modello è già scritto in `lib/queries/seller-public-profiles.ts`: va **applicato**, non inventato.
3. Applicare **113** → tornano `/stores`, `/near`, la pagina negozio e la hero.
4. Deployare il build riparato (è fermo dal 19 luglio).
5. Applicare **115** e **116** → i due buchi sui soldi si chiudono.
6. Loop di redirect dei venditori + avviso COD sugli ordini a carta.
7. **Collegare i 9 cron** e verificare che `release-payouts` paghi davvero.

### Cancello 1 — i soldi, prima del primo cliente reale
B6, B7, B8 + `rider_fee_cents`, il pagamento rider sul COD, la migrazione 096, il rilascio dei coupon, negozio chiuso su carta, idempotenza COD, gli errori ingoiati dal webhook.
**Tre su quattro dei bloccanti sui soldi sono silenziosi**: non lasciano traccia che permetta di accorgersene senza il reclamo di un cliente. Per questo vanno chiusi *prima*, non *dopo*.

### Cancello 2 — le tre cose che devi decidere tu
1. **La commissione è 8% o 10%?** È l'unica domanda a cui non posso rispondere io: sta nei contratti dei venditori.
2. **Dati camerali veri** — P.IVA, REA, sede, PEC, e quali caselle email esistono davvero. È il tappo anche del modulo di recesso.
3. **Il fee di €3 sopra i €30**: lo assorbiamo (promessa "gratis" salva) o lo dichiariamo? **Raccomando di assorbirlo**: la promessa pulita vale più di €3.

Più, sul codice: cancellazione KYC, foto recensioni, informativa nel checkout, purge del GPS rider. La **validazione legale** dei tre documenti resta 🔴 umana.

### Cancello 3 — spegnere ciò che promette e non mantiene
**Daily drops** (prezzo pubblicizzato ≠ praticato), **sponsorizzazioni** (non si incassa €4,99/settimana per uno spazio invisibile), **abbonamento venditore €50/mese** (con 1-5 negozi è la barriera sbagliata: la commissione basta), **notifiche push** (finché non ci sono le chiavi), **profili pubblici**, **CMS su Termini/Privacy/FAQ**, e riscrivere la promessa **"€5 di benvenuto"** su ciò che il codice fa davvero.

### Cancello 4 — i freni, perché non si riformi
Il difetto n.1 è stato mergiato con CI rossa e ci è rimasto 10 giorni: **il problema non è il commento non chiuso, è che nulla lo ha fermato.**
- **Branch protection su `main`** con `Build` + `Unit tests` obbligatori, e `typecheck` come passo autonomo. **5 minuti.**
- **Notifica Render sui deploy falliti.** Un deploy fallito deve svegliare qualcuno.
- **Progetto Supabase di test gratuito** + i 3 secret → due job CI da decorativi a veri. **È l'investimento da 0 € col ritorno più alto della lista.**
- **Sezione ROLLBACK nel runbook, e provarla una volta** in orario diurno. MTTR da "supporto Render" a 90 secondi.
- **`axe-core` in CI** + regola che vieti `role="dialog"` fuori dalla primitiva · **oxlint attivato** (il file di configurazione esiste già) · **vincoli nel DB** al posto dei controlli applicativi.
- **Il test che oggi manca più di tutti**: un E2E che simuli un ospite — home → ricerca → **scheda prodotto** → carrello → checkout COD → ordine visibile. Se quel percorso è verde, si può aprire. Oggi sarebbe rosso al terzo passo, e nessun test lo dice.

---

## 8. Le prove a runtime (il sito acceso e guidato in un browser)

La prima stesura di questo referto dichiarava «il browser non l'ho potuto vedere» come limite. Non era un limite: era una cosa da fare. L'ho fatta — build di produzione, server acceso, Chromium headless, credenziali **segnaposto** (mai il database vero, zero rischio di scrivere su dati reali).

**Tutte le 44 rotte pubbliche interrogate una per una:** nessun crash. 200 su ogni pagina pubblica, 307 sulle aree riservate (`/profile`, `/admin`, `/seller`, `/rider` — il guardiano funziona), 404 corretto sulle pagine inesistenti, `robots.txt` e `sitemap.xml` serviti. `/api/health` risponde **503** col database irraggiungibile: si comporta come deve.

**Difetti provati, non più dedotti:**

| Cosa | Misura reale nel browser | Atteso |
|---|---|---|
| **Pulsante disabilitato** (`ui/Button`, `opacity: 0.5`) | contrasto **1,62:1** | ≥ 4,5:1 — il testo «Disabilitato» è di fatto invisibile. *È peggio della stima a codice (~2,3:1).* |
| **Titolo dei modali** (`ui/Modal`) | **30px**, font serif Fraunces, classi `font-bold text-ink-900 truncate` — **nessuna classe di dimensione** | Su un modale `sm` (332px utili) e metriche vere del font: «Condividi la lista della spesa» = 363px e «Scansiona il codice a barre» = 341px → **troncano entrambi** |
| **Errore di hydration su `/cart` a 375px** | `React error #418` | Il disallineamento server/client che il revisore frontend aveva dedotto dal codice: **confermato dal browser** |
| **`global-error.tsx:47`** | dice «se il problema continua, **scrivici**» e non offre **nessun** link, email o ritorno alla home | Vicolo cieco visto con i miei occhi |
| **6 vulnerabilità nelle dipendenze di produzione (5 alte)** | Next.js (SSRF nei rewrites · DoS sull'ottimizzazione immagini via SVG · **esposizione non autenticata degli endpoint delle Server Function**), postcss (path traversal), sharp (CVE libvips) | Fix disponibile con `npm audit fix` |
| **196 rotte dinamiche, 2 statiche, 0 prerenderizzate** | dalla tabella del build | Conferma che le direttive `revalidate` in 5 layout sono **codice morto** e che non esiste cache CDN dell'HTML |

**Tre sospetti frequenti che il browser ha smentito**, e che quindi non vanno messi nella lista di lavoro: **zero overflow orizzontale** su tutte le pagine provate, mobile e desktop · **zero immagini senza `alt`** · **esattamente un `<h1>` per pagina**.

E una correzione a me stesso: guardando la prima schermata avevo pensato che una singola query fallita portasse giù l'intera pagina. **È falso.** Quella era `global-error.tsx`, che scatta solo se cade il layout radice — provocata dalle mie credenziali finte. La copertura reale è **buona**: 9 error boundary, di cui 7 per area (checkout, venditore, rider, prodotto, negozio, ordini, admin). Sopra la media.

---

## 9. Onestà sui limiti, e i falsi positivi che ho scartato

**Cosa resta fuori portata da qui** (e non lo chiamo verde): le pagine **guidate dai dati** — scheda prodotto, negozio, checkout — non le ho potute rendere, perché il database segnaposto non restituisce righe: per vederle serve un **ambiente di prova con dati veri**, ed è la cosa che chiedo come prossimo passo · **Stripe** (quali eventi webhook siano davvero iscritti cambia la severità di alcuni punti; authorization rate e tempi di payout richiedono una chiave in sola lettura — il connettore Stripe di questa sessione **non è autorizzato**, va abilitato dalle impostazioni dei connettori su claude.ai) · **i log di Render** e il **bill Supabase** per voce, che è il numero che dovrebbe governare la priorità delle voci di performance.

**Falsi positivi corretti** — un audit che non scarta nulla non è stato fatto:
- Un revisore ha segnalato come bloccante che l'intera riga `profiles` (IBAN, KYC) fosse leggibile da chiunque. **L'ho verificato sul database: è falso.** La policy permissiva è stata rimossa. La conseguenza reale è l'opposto — le pagine sono rotte, non i dati esposti.
- `params` di Next 15 è **corretto in tutto il repo** (verificato su tutte le route e pagine dinamiche).
- Le **134 chiavi i18n sono complete** in italiano e inglese: nessuna chiave grezza a schermo. *(Il difetto vero è la copertura: solo 29 file su 346 usano le traduzioni, e il funnel d'acquisto è italiano cablato.)*
- **Nessuna tabella senza RLS** (0 su 71).
- **`pdfkit`, `stripe` e `@anthropic-ai/sdk` non finiscono nel bundle client** (verificati uno per uno). Leaflet è in doppio lazy-load. Zero `<Image>` senza `sizes`.
- Il pagamento con carta **non tocca mai il nostro backend** (SAQ-A corretto), il webhook ha firma verificata e tripla idempotenza, il claim atomico è implementato bene in 4 route su 5, il consenso cookie è **migliore della media del mercato italiano**, e il KYC in produzione è **fail-closed**.
- Nessun segreto committato. Un solo `console.log`. Due `TODO`. Zero link interni rotti su 70.

---

*Referto del 2026-07-30 01:20. Fix e migrazioni nel branch `claude/amazing-lovelace-nqa9o1` del repo `mycity`. Nessuna scrittura sul database di produzione, nessun deploy.*
