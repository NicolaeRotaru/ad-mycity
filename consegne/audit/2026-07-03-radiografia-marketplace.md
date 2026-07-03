---
tipo: radiografia-marketplace
data: 2026-07-03 11:57
stato: PARZIALE (workflow interrotto per limiti Max — 3/13 dimensioni completate)
repo: NicolaeRotaru/mycity @ f84fc70
autore: AD MyCity (workflow radiografia)
---

# 🩻 Radiografia del marketplace — 2026-07-03 (PARZIALE)

> ⚠️ **Report parziale.** Il workflow `radiografia` (13 dimensioni × revisore + verifica avversariale)
> è stato **fermato a metà per risparmiare i limiti Max**. Sono completate e qui riportate **3 dimensioni
> su 13** — e sono le tre a più alto impatto per un marketplace: **Architettura, Sicurezza/Auth, Pagamenti/Stripe**.
> Le altre 10 (RLS-database, privacy-legale, performance, frontend-UX, accessibilità, QA-flussi, API-backend,
> AI-endpoints, dati-analytics, deploy-SRE) sono da riprendere dalla cache (`resumeFromRunId: wf_89382248-8ca`).
>
> Verifica: le dimensioni qui sono in **fase-revisione** (la verifica avversariale automatica non ha fatto in
> tempo a girare), **tranne il bloccante** che ho **verificato io a mano nel codice** — vedi nota "✅ verificato".

## 📊 Sintesi
| Gravità | N. | Dove |
|---|---|---|
| 🔴 Bloccante | 1 | Pagamenti |
| 🟠 Grave | 8 | Sicurezza (2) · Pagamenti (2) · Architettura (4) |
| 🟡 Minore | 8 | Pagamenti (3) · Sicurezza (2) · Architettura (3) |

---

## 🔴 BLOCCANTI (fermano soldi o rompono un flusso critico)

### 1. Sessione Stripe valida 24h ma il pending scade a 2h → oversell + incasso senza magazzino
**File:** `lib/stripe/client.ts:168-193` (`createMultiSellerCheckoutSession`, nessun `expires_at`) + `app/api/stripe/webhook/route.ts:204-213` (`handleCheckoutCompleted`)
**✅ Verificato a mano.** La Checkout Session viene creata **senza `expires_at`** → resta pagabile per il default Stripe di **24h**. Ma `pending_checkouts.expires_at = now() + interval '2 hours'` (`migrations/042`) e il cron `expire-checkouts` dopo 2h marca il pending `EXPIRED` e chiama `restore_stock` (rilascia lo stock riservato). Il webhook controlla **solo** `pending.status === 'COMPLETED'` (riga 210): **non gestisce lo stato `EXPIRED`**. Se il buyer paga nella finestra **2h–24h**, gli ordini vengono creati comunque, ma lo stock era già stato restituito e non viene ri-riservato.
**Impatto:** overselling reale su prodotti a bassa disponibilità + denaro incassato senza magazzino → cancellazioni/rimborsi manuali, venditori scontenti, inventario disallineato. Colpisce ogni checkout carta lasciato in sospeso >2h e poi pagato.
**Fix:** passare `expires_at` alla session pari alla scadenza del pending (`now + 2h`, min. Stripe 30 min) così Stripe stesso rifiuta il pagamento tardivo. In più, nel webhook gestire `pending.status !== 'PENDING'`: ri-riservare lo stock con `reserve_stock` **prima** di creare gli ordini e, se non disponibile, alzare un alert admin invece di creare ciecamente l'ordine.

---

## 🟠 GRAVI

### Sicurezza & autorizzazione

**2. RLS chat: un partecipante può RISCRIVERE il messaggio dell'altro**
`migrations/026_chat_messaging.sql:83-91` — la policy `messages_update_read` è `FOR UPDATE USING (partecipante)` **senza `WITH CHECK` e senza restrizione di colonna**. In Postgres, `WITH CHECK` omesso riusa `USING`: controlla solo che chi scrive sia buyer/seller della conversazione, **non** quali colonne cambia. Usando il client Supabase browser con la anon key + JWT utente, un partecipante può chiamare `supabase.from('messages').update({ body: '...' }).eq('id', <msg dell'altro>)` e passa.
**Impatto:** manomissione/ripudio delle conversazioni — un compratore altera a posteriori ciò che ha scritto il venditore (o viceversa), distruggendo il valore probatorio della chat in dispute, resi, contestazioni Stripe. Mina la fiducia, pilastro del marketplace.
**Fix:** `REVOKE UPDATE ON messages FROM authenticated;` poi `GRANT UPDATE(read_at) ...`; e/o trigger BEFORE UPDATE che rifiuti se `NEW.body`/`NEW.sender_id` cambiano; aggiungere `WITH CHECK` esplicito. Verificare lo stesso pattern su `rider_reviews`/`store_reviews`.

**3. Bypass del rate-limit via spoofing di `X-Forwarded-For`**
`lib/rate-limit.ts:153-159` — `getClientIp` prende **sempre il primo elemento** di XFF (`split(',')[0]`). Dietro proxy (Render/Cloudflare) il primo valore è dichiarato dal client: ruotandolo a ogni richiesta si azzera ogni finestra (`signin:<ip>`, `signup`, `contact`, `geocode`, `track`). **Aggravante:** su `/api/auth/signin` l'altra barriera è Turnstile, che se `TURNSTILE_SECRET_KEY` manca in produzione **non blocca** (`lib/captcha.ts:18-27` ritorna `{ok:true,skipped:true}`) → anti brute-force azzerabile.
**Impatto:** brute-force credenziali / password-spraying senza tetto pratico; spam registrazioni, messaggi di contatto, flood `activity_events`. Rischio account-takeover.
**Fix:** non fidarsi del valore più a sinistra dell'XFF — con proxy noti (Render) derivare l'IP da posizione fissa da destra o usare `x-real-ip`; rendere Turnstile **fail-closed** in produzione; rate-limit anche per-account/email sul login.

### Pagamenti / Stripe

**4. `refundOrder` limita il rimborso al totale ordine per-chiamata, non al residuo → over-refund cumulativo su COD**
`lib/stripe/payout.ts:330-392` — il clamp è `min(amountCents, orderTotalCents)`, **non** `orderTotalCents - refunded_amount_cents`. Sul path carta Stripe rifiuta l'eccesso (backstop). Sul path **COD** si chiama `wallet_credit` **senza tetto**: due risoluzioni sullo stesso ordine COD con `ref` diversi (es. reso `return_<id>` + dispute `dispute_<id>`) accreditano entrambe fino al totale → credito > valore ordine. L'indice unico protegge solo dal **doppio stesso ref**.
**Impatto:** perdita economica diretta — credito wallet emesso superiore all'incasso. Sfruttabile aprendo sia reso sia reclamo sullo stesso ordine.
**Fix:** clampare `safeAmountCents` al **residuo** `orderTotalCents - (refunded_amount_cents ?? 0)`; in più CHECK a livello DB che rifiuti `refunded_amount_cents > total`.

**5. Errore transitorio in lettura del pending → evento marcato `processed`, Stripe non ritenta → "pagato ma nessun ordine"**
`app/api/stripe/webhook/route.ts:204-207` — se `pendErr` (timeout/errore DB transitorio) o `pending` null, la funzione fa `return` (non `throw`). Il POST prosegue, marca `stripe_event_log.processed = true` e risponde 200 → Stripe **non riconsegna** l'evento. Un errore transitorio trasforma un checkout **pagato** in un ordine **mai creato**, senza retry né recupero.
**Impatto:** buyer addebitato, nessun ordine, nessuna email, nessuna traccia recuperabile → contestazione/chargeback e perdita di fiducia.
**Fix:** su `pendErr` (errore infrastrutturale) fare `throw` → 500 → forza il retry Stripe. Solo per `!pending` genuinamente inesistente loggare e uscire.

### Architettura

**6. `database.types.ts` (2348 righe) generato ma mai collegato ai client Supabase**
Nessun client passa il generico `<Database>` (`lib/supabase/server.ts`, `client.ts`, `lib/api/middleware.ts`): ogni `.from()` ritorna dati **non tipizzati** e il codice è pieno di cast manuali (`data as Profile`, `as unknown as DisputeOrderRow[]` nel webhook).
**Impatto:** zero sicurezza a compile-time — un rename/rimozione colonna nelle migration non viene intercettato dal typecheck su dati soldi (ordini, payout). 2348 righe che danno **falsa** impressione di sicurezza.
**Fix:** `createServerClient<Database>(...)` ecc., poi rimuovere i cast; oppure eliminare il file se la generazione non è affidabile.

**7. Gate di moderazione Trust&Safety implementato ma mai cablato (dead code su un controllo di sicurezza)**
`lib/ai/moderation.ts` — gate di safety (armi, droga, contraffazione, adulto, PII, odio) **non importato da nessuna route**. Le route AI di creazione prodotto/vision/chat/recensioni non ci passano.
**Impatto:** contenuti vietati non filtrati nonostante esista il codice che sembra farlo → rischio legale e reputazionale. Chi legge il codice crede che la moderazione sia attiva.
**Fix:** cablare il gate nelle route di ingresso contenuti prima della persistenza, o rimuoverlo e tracciare la feature come non implementata.

**8. Logica di creazione ordini duplicata su due percorsi critici (webhook Stripe vs COD)**
`app/api/stripe/webhook/route.ts` (~191-412) e `app/api/orders/cod/route.ts` (~260-430) — insert `orders`/`order_items`, notifiche, email, `increment_coupon_usage`, split via `computeOrderSplit` duplicati e **già divergenti** (il webhook non wrappa le email in try/catch; usa `payout_status HELD` vs COD `AWAITING_REMITTANCE`).
**Impatto:** ogni evoluzione va replicata a mano in due punti sul percorso soldi → alto rischio che carta e COD divergano in silenzio (importi, notifiche, stock).
**Fix:** estrarre `createOrdersForGroups(admin, {...})` condivisa, lasciando ai chiamanti solo le differenze.

**9. Creazione ordini COD multi-gruppo non atomica (nessuna transazione DB)**
`app/api/orders/cod/route.ts` (~245-430) — sequenza di `reserve_stock` + `wallet_debit` + insert ordini/items **senza transazione**, con rollback manuale a compensazione. Se il processo muore/va in timeout (serverless) tra debit e rollback, lo **stock resta riservato** e il **wallet resta addebitato** senza ordine.
**Impatto:** stock "fantasma" bloccati e credito cliente bruciato senza ordine su crash/timeout — difficili da riconciliare.
**Fix:** spostare l'intera creazione in una singola RPC/funzione Postgres transazionale, oppure job di riconciliazione per riserve/crediti orfani oltre soglia temporale.

---

## 🟡 MINORI

**Pagamenti**
- **10. Idempotenza webhook con TOCTOU** (`webhook/route.ts:61-76, 359-362`): consegne concorrenti dello stesso `event.id` leggono entrambe `processed=false` → email/notifiche duplicate e **doppio `increment_coupon_usage`** (non idempotente). Fix: claim atomico `UPDATE ... WHERE processed=false RETURNING`.
- **11. Drift di arrotondamento** (`checkout/route.ts:282-315`): quote coupon/pickup pro-rata arrotondate per gruppo ≠ `totalDiscountCents` reale addebitato da Stripe → Σ `orders.total_price` non coincide con la charge. Fix: distribuzione largest-remainder + stessa base incl. `delivery_fee`.
- **12. Refund emesso prima del guard di stato atomico** (`returns/[id]/decide/route.ts:65-101`, `admin/disputes/[id]/resolve/route.ts:53-97`): `refundOrder` chiamato **prima** dell'UPDATE condizionale. Mitigato da `idempotencyKey` Stripe / indice unico wallet, ma email di rimborso potenzialmente doppie. Fix: prima il claim atomico dello stato, poi il refund.

**Sicurezza**
- **13. KYC upload: estensione da `file.name` non sanitizzata** (`app/api/kyc/upload-document/route.ts:43-44`): `ext` concatenata nella storage key senza allow-list. Rischio pratico basso (MIME validato, prefisso `user.id/`), ma key parzialmente controllata dall'utente. Fix: derivare l'estensione dal `media_type` validato o imporre `/^[a-z0-9]{1,5}$/`.
- **14. `rider/cash-confirm` non verifica `delivery_status`** (`app/api/rider/cash-confirm/route.ts:50-65`): il docstring dice PICKED_UP/OUT_FOR_DELIVERY/DELIVERED ma il codice controlla solo ownership + metodo COD → un rider può registrare l'incasso su ordine ancora NEW/ACCEPTED. Fix: aggiungere il check esplicito sullo stato.

**Architettura**
- **15. `persistVariants` duplicato client/server** (`lib/products/persistVariants.ts` vs `persistVariantsServer.ts`): stesso algoritmo di diff insert/update/delete, unica differenza il client. Fix: tenere solo la versione server, passarle il client browser.
- **16. `normalizeLabel` duplicata identica** (`lib/products/visionShared.ts` vs `externalSyncShared.ts`): copiata carattere per carattere. Fix: estrarre in `lib/text/normalize.ts`.
- **17. `PaymentStatus` incompleto e mai usato** (`lib/order-status.ts:11`): manca `'REFUNDED'` (che il codice reale scrive) ed è dead/decorativo. Fix: allineare l'unione e usarla, o rimuoverla.
- **18. Accesso `/admin` accoppiato al flag `is_approved`** (`middleware.ts` ~240-250): il role-check nega con `!approved` anche su `/admin`, riusando un flag nato per i **venditori**. Un admin creato senza `is_approved=true` (non via seed) resterebbe bloccato. Fix: richiedere l'approvazione solo per `seller`/`rider`.

---

## ⏭️ Da completare (10 dimensioni residue)
RLS-database · privacy-legale · performance · frontend-UX · accessibilità · QA-flussi · API-backend · AI-endpoints · dati-analytics · deploy-SRE.
Riprendere con: `Workflow({scriptPath: ".../radiografia-run.js", resumeFromRunId: "wf_89382248-8ca"})` — le 3 dimensioni fatte tornano dalla cache, girano solo le 10 mancanti + la verifica avversariale di tutte.
