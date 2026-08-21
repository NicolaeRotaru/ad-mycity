---
data: 2026-08-21 16:14
tipo: radiografia-marketplace
totale: 199
bloccanti: 12
gravi: 88
minori: 99
agenti: 26
fonte_raw: consegne/audit/2026-08-21-radiografia-marketplace-raw.json
gemello_design: consegne/design/2026-08-21-radiografia-design.md
---

# Il sito ha ancora dodici difetti che fermano qualcuno o costano soldi, e non sono quelli di tre giorni fa

**In due righe.** Ho rimisurato il sito da capo: 199 problemi veri, contro i 245
del 18 agosto. I dodici più gravi sono difetti nuovi, perché quelli di agosto li
avevi già chiusi.

## In parole semplici

Questa è la terza visita completa al sito. La prima è del 29 luglio, la seconda
del 18 agosto. Il 21 agosto alle 3:30 di notte sono stati chiusi gli ultimi
difetti rimasti aperti dalla visita del 18. Oggi ho rimisurato tutto da capo.

Ecco il conto delle tre visite.

| | 29 luglio | 18 agosto | oggi |
|---|---:|---:|---:|
| Bloccanti | 21 | 12 | 12 |
| Gravi | 137 | 114 | 88 |
| Minori | 104 | 119 | 99 |
| **Totale** | **262** | **245** | **199** |

Il totale scende di quarantasei. I gravi scendono di ventisei. I bloccanti no:
sono ancora dodici.

E qui c'è la cosa che conta più del numero. **Non sono gli stessi dodici.**
Quelli del 18 agosto sono stati chiusi tutti. Il referto del 21 agosto alle 3:30
lo scrive: zero bloccanti aperti. Questi dodici sono difetti nuovi, oppure
difetti che le prime due visite non avevano visto.

Detto in un altro modo: la lista si accorcia, ma il fondo non si svuota. Ogni
volta che si guarda con occhi diversi si trova un altro strato. Non è un
fallimento delle riparazioni — è come funziona guardare meglio.

## Cosa cambia per te

Dei dodici bloccanti, **sette toccano direttamente i soldi o l'identità di chi
li muove**. Te li dico nell'ordine in cui costano.

**Chiunque, anche senza avere un account sul sito, può marcare un ordine come
"già rimborsato".** Non serve essere clienti, non serve essere il negozio: basta
saper mandare una richiesta al database. E quel campo non è un'etichetta: è il
numero che il sito sottrae dai guadagni del negozio. Chi lo tocca decide quanto
il negozio incassa.

**Il codice di consegna a sei cifre si aggira mandando un valore vuoto.** Quel
codice è l'unica prova che la spesa è arrivata in mano al cliente. Con il buco
un ordine si segna «consegnato» senza che nessuno l'abbia consegnato. E la
consegna sblocca due cose: il bonifico al negozio e la paga del fattorino.

**Un rimborso con la carta non riaddebita mai la quota del negozio.** Il cliente
riprende i suoi soldi. La parte che il negozio aveva già incassato resta al
negozio. La differenza la mette MyCity. E non è il caso raro: il bonifico al
negozio parte un'ora dopo la consegna, mentre resi e reclami arrivano dopo.
Ogni reso pagato con carta è una perdita nostra.

**Il cliente annulla un ordine già pagato con carta e legge "Niente addebiti",
ma i soldi restano a noi.** Nessun processo li restituisce. Restano finché
qualcuno non se ne accorge a mano.

**Chi riordina la stessa spesa in contanti non ordina niente, e legge "Ordine
effettuato".** Un esempio, ed è il caso più normale che esista per un panificio:
Maria compra due filoni ogni martedì. Stesso carrello, stesso totale, stesso
indirizzo. Il sito riconosce l'ordine come un doppione del martedì prima e lo
scarta — poi le mostra la pagina di conferma. Lei aspetta il pane. Al negozio non
è arrivato niente.

**Il doppio clic sul "paga alla consegna" crea due ordini veri.** Il negozio
prepara due spese, il fattorino ne consegna una, il credito MyCity viene tolto
due volte.

**Il rilascio non applica le modifiche al database.** Quando si pubblica una
versione nuova, il codice nuovo arriva su un database vecchio. Se la modifica
riguardava il percorso del pagamento, il cliente paga e l'ordine non nasce.

Gli altri cinque bloccanti sono sul rispetto delle regole e sui numeri. I dati
di ogni acquisto partono verso gli Stati Uniti anche da chi ha rifiutato i
cookie. Sono due difetti distinti: uno sul conteggio delle visite, uno
sull'ordine. Ogni acquisto viene contato due volte, una dal browser e una dal
server. E il freno che doveva impedire all'AI di sbagliare un prezzo in vetrina
esiste ed è collaudato, ma in produzione non si accende mai.

## Cosa devi fare

Tre cose, in ordine.

**Uno: dimmi se apro il cantiere sui dodici bloccanti.** Sono riparazioni al
codice del sito. Vuol dire ramo separato, anteprima e tua firma prima di
pubblicare: nessuna tocca la produzione da sola. Stima onesta: i primi quattro
valgono più di tutti gli altri messi insieme. Sono i due sull'identità e i due
sui rimborsi.

**Due: guarda il referto gemello del design**, che è nell'altro file. Lì ce ne
sono altri centocinquantadue, tre dei quali fermano qualcuno — fra questi il
pulsante SOS del fattorino, che sul telefono è coperto in pieno da quello
dell'assistenza. È un pulsante di emergenza e oggi non si può premere.

**Tre: decidi tu se i minori li guardiamo.** Sono novantanove, quasi tutti da
mezz'ora l'uno. Il mio consiglio è di lasciarli fermi finché i bloccanti non
sono a zero.

## Cosa non ho verificato

Cinque cose, e sono importanti quanto il resto.

**Non ho aperto il sito nel browser.** Tutto quello che c'è qui dentro è letto
nel codice e nel database, non visto succedere su una pagina vera. Ci sono
difetti che si vedono solo muovendo il mouse: un pulsante che non risponde,
un'animazione che salta. Questa visita non li può trovare.

**Non ho provato a fare nessuno dei buchi che descrivo.** Il difetto numero uno
dice che chiunque può marcare un ordine come rimborsato: l'ho letto nelle regole
del database, non l'ho eseguito. Sarebbe stato scrivere sul sito vero, ed è
rosso.

**Le prove che ho fatto girare sono tre, e sono verdi tutte e tre.** Il controllo
dei tipi non dà nessun errore. I novecentoquarantatré test automatici passano
tutti. Il controllo dello stile passa con novantacinque avvisi. Tutti e
novantacinque sono di accessibilità, cioè di come il sito si comporta con chi
non vede o non usa il mouse. Cinquantadue di quei novantacinque sono etichette
di moduli scollegate dal campo che descrivono.

**Il conto dei dodici bloccanti include un doppione fra i due referti**: il
pulsante SOS del fattorino è stato trovato da due dimensioni diverse del design.
Bloccanti distinti fra i due referti: quindici, non sedici.

**Non ho misurato quanto costa ogni difetto in euro.** Dico «costa soldi» dove
il codice muove denaro, ma la cifra non ce l'ho: senza ordini veri in corso non
c'è niente da moltiplicare.

---

## Dettagli tecnici

Come è stata fatta: workflow `radiografia`, tredici dimensioni in sola lettura
sul repo `NicolaeRotaru/mycity` (commit `6f32b01`). Ogni dimensione ha avuto un
senior che cerca e un collega diverso che ricontrolla ogni problema trovato e
scarta quello che non conferma — ventisei agenti in tutto. Solo ciò che ha
superato la seconda lettura è qui.

Dati grezzi completi (descrizione, impatto e riparazione di tutti e 199, minori
compresi): `consegne/audit/2026-08-21-radiografia-marketplace-raw.json`.

Prove eseguite da me su questa copia del codice: `npx tsc --noEmit` → 0 errori ·
`npx vitest run` → 943 test verdi su 114 file · `npx next lint` → 0 errori, 95
avvisi (52 `jsx-a11y/label-has-associated-control`, 19
`jsx-a11y/click-events-have-key-events`, 12 `no-static-element-interactions`, 8
`no-noninteractive-element-interactions`, 4 `no-autofocus`).

Conteggio per dimensione:

| dimensione | bloccanti | gravi | minori |
|---|---:|---:|---:|
| architettura | 0 | 4 | 11 |
| sicurezza-auth | 1 | 5 | 3 |
| rls-database | 1 | 1 | 12 |
| pagamenti-stripe | 2 | 9 | 6 |
| privacy-legale | 1 | 7 | 7 |
| performance | 0 | 10 | 8 |
| frontend-ux | 0 | 11 | 9 |
| accessibilita | 0 | 4 | 8 |
| qa-flussi | 2 | 9 | 4 |
| api-backend | 1 | 4 | 11 |
| ai-endpoints | 1 | 7 | 9 |
| dati-analytics | 2 | 8 | 5 |
| deploy-sre | 1 | 9 | 6 |

## Bloccanti — 12


### sicurezza-auth


**1. Chiunque, senza account, può marcare come «già rimborsato» qualunque ordine**

- Dove: `migrations/119_radiografia_18_agosto.sql:748-785 e migrations/124_radiografia_21_agosto.sql:48-85 — funzione public.accumula_rimborso(uuid, int)`
- Cosa succede: CONFERMATO sul database vivo, non sul file. La funzione è SECURITY DEFINER (scavalca ogni regola RLS) e non controlla chi la chiama: non guarda auth.uid(), non guarda il ruolo, non verifica che l'ordine sia di chi chiama. Prova diretta sul catalogo di produzione (progetto clmpyfvpvfjgeviworth): proacl = '{=X/postgres,postgres=X/postgres,service_role=X/postgres}' — la voce '=X/' è il permesso di PUBLIC, cioè tutti i ruoli. Prova indipendente e definitiva: has_function_privilege('anon','public.accumula_rimborso(uuid,int)','EXECUTE') restituisce TRUE, e anon ha USAGE sullo schema public (nspacl contiene 'anon=U/pg_database_owner'), quindi la rotta PostgREST è percorribile. Terza conferma indipendente: il linter Supabase la elenca testualmente — «accumula_rimborso(p_order_id uuid, p_delta integer) can be executed by the `anon` role as a SECURITY DEFINER function via /rest/v1/rpc/accumula_rimborso». La chiave anon è pubblica per costruzione (sta nel browser di ogni visitatore). L'unico limite è il tetto interno: la somma non può superare il totale dell'ordine, cioè si può portare esattamente a «rimborsato al 100%». Gli id degli ordini servono, e li regala la vista live_activity_public (difetto separato, anch'esso confermato vivo): la catena è completa e non richiede nessun account. NOTA: non ho eseguito la chiamata HTTP reale — il sandbox ha bloccato curl — ma la prova sul catalogo (privilegio effettivo + USAGE sullo schema + linter) è la stessa cosa che la chiamata dimostrerebbe.
- Impatto: refunded_amount_cents governa soldi veri. È il sottraendo dei guadagni mostrati al negozio (/home/user/mycity/lib/guadagni/negozio.ts:56 — `Math.round(Number(o.total_price)*100) - (o.refunded_amount_cents ?? 0)`, verificato) ed è il «già rimborsato» che decide quanto resta rimborsabile nel motore dei resi (/home/user/mycity/lib/stripe/payout.ts:534-536 — `alreadyRefunded` limita `safeAmountCents`, e se scende a zero la funzione lancia «importo rimborso non valido», verificato). Portandolo al totale su un ordine, un estraneo azzera a video l'incasso del negozio per quell'ordine E blocca il rimborso legittimo del cliente: il reso non riesce più a emettere niente. Fatto in massa: contabilità dei venditori falsata, resi bloccati, nessuna traccia di chi l'ha fatto perché la scrittura non passa da nessuna rotta dell'applicazione. Resta bloccante nonostante oggi ci sia 1 solo ordine a database: è esattamente il difetto che non deve raggiungere il go-live, perché tocca il percorso dei soldi e si apre a chiunque.
- Come si ripara: Nella prossima migrazione: `REVOKE EXECUTE ON FUNCTION public.accumula_rimborso(uuid, int) FROM PUBLIC, anon, authenticated;` seguito da `GRANT EXECUTE ... TO service_role;`. Attenzione: il REVOKE oggi presente in 119:784 e ripetuto in 124:84 cita solo anon e authenticated e per questo non toglie niente (vedi difetto sulla causa radice). Difesa in profondità: controllo esplicito del chiamante in testa alla funzione — `IF coalesce((SELECT auth.jwt() ->> 'role'),'') <> 'service_role' THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='42501'; END IF;`. Verifica di chiusura da fare sul catalogo, non sul file: `SELECT has_function_privilege('anon','public.accumula_rimborso(uuid,int)','EXECUTE')` deve tornare false. Fix a @backend-dev; applicazione in produzione 🔴 firma di Nicola.

### rls-database


**2. Il codice di consegna si aggira mandando «niente» al posto del codice**

- Dove: `migrations/083_notifications_best_effort_in_order_rpc.sql:33 e :73 · migrations/124_radiografia_21_agosto.sql:190 (funzioni vive: verify_pickup_code, verify_delivery_code, confirm_pickup_by_seller)`
- Cosa succede: CONFERMATO in due modi. ① Nel repo, tutte e tre le funzioni confrontano il codice così: `IF stored_code IS NULL OR stored_code != trim(p_code) THEN <rifiuta>` (083 righe 33 e 73, 124 riga 190 con `<>`). ② Sul database vivo ho riletto la definizione delle tre funzioni con `pg_get_functiondef`: il confronto diretto c'è ancora in tutte e tre, e tutte e tre sono eseguibili da `authenticated` (verificato con `has_function_privilege`: authenticated=true, anon=false). La logica: se chi chiama manda `p_code = null`, `trim(null)` è null e `'ABC123' <> null` in SQL non è «falso», è **null**; plpgsql tratta `IF null THEN` come falso, quindi salta il ramo del rifiuto e cade nel ramo del successo. Provato sul database di produzione: `select case when ('ABC123' is null or 'ABC123' <> trim(null::text)) then 'RIFIUTA' else 'ACCETTA' end` restituisce **ACCETTA**. Il blocco a cinque tentativi sta dentro il ramo saltato, quindi non entra in gioco. La strada d'attacco è completa: un fattorino approvato prende un ordine in READY (la policy «Riders can update assigned or claim free orders» glielo consente), poi chiama `verify_pickup_code` e `verify_delivery_code` con `p_code: null` dalla chiave pubblica del sito, senza passare dalla pagina. Nella migrazione 116 la forma giusta esiste già (`IF p_code IS NULL OR trim(p_code) = ''`): non è stata portata qui. Confidenza: 95% — ho provato la logica SQL e la definizione viva delle funzioni, non ho eseguito la chiamata perché scriverebbe dati reali.
- Impatto: Il codice a sei cifre è l'unica prova che la merce è arrivata davvero al cliente. Con questo buco: ① il fattorino assegnato segna «consegnato» un ordine che non ha consegnato, e questo sblocca il pagamento al negozio e la sua paga; ② il venditore, con `confirm_pickup_by_seller`, segna «ritirato» un ordine in contanti e con lo stesso colpo scrive `payment_status = 'PAID'` e `payout_status = 'CASH_IN_STORE'` (verificato nel corpo della funzione viva), cioè dichiara da solo di aver incassato contanti che nessuno gli ha dato. Il cliente che dice «non ho mai ricevuto niente» ha contro un ordine risultato consegnato e pagato. È il primo controllo che salta quando arriva il primo ordine vero.
- Come si ripara: In tutte e tre le funzioni aggiungere il controllo esplicito del null prima del confronto — `IF p_code IS NULL OR trim(p_code) = '' THEN <incrementa attempts e rifiuta>; END IF;` — e poi cambiare il confronto in `IF stored_code IS NULL OR stored_code IS DISTINCT FROM trim(p_code) THEN`, perché `IS DISTINCT FROM` torna vero o falso anche coi null, mai null. Prova che deve diventare rossa: chiamare l'RPC con `p_code: null` su un ordine assegnato e pretendere `ok:false` — oggi la logica del confronto porta al ramo del successo.

### pagamenti-stripe


**3. Il rimborso è registrato nel database PRIMA di chiamare Stripe: se Stripe fallisce, quell'ordine non è più rimborsabile**

- Dove: `lib/stripe/payout.ts:547-556 (rpc accumula_rimborso) e :654-671 (stripe.refunds.create)`
- Cosa succede: Verificato riga per riga. In `refundOrder` la rivendicazione `accumula_rimborso` (:547) è una chiamata RPC a sé stante: la migrazione 124:48-82 la esegue in una transazione propria che committa subito, incrementando `orders.refunded_amount_cents` di `safeAmountCents`. Solo DOPO, a :654, si chiama `stripe.refunds.create`, e attorno a quella chiamata non c'è nessun `try/catch`. Ho cercato in tutto il repo una scrittura di compensazione: `grep -rn "storna_rimborso"` non trova niente, e nessuna migrazione la definisce. Quindi se `refunds.create` lancia (carta già rimborsata su Stripe, timeout di rete, saldo piattaforma insufficiente) il contatore resta gonfiato per sempre. Al tentativo successivo `safeAmountCents = min(importo, grossCents - alreadyRefunded)` (:534-536) vale 0 e la funzione lancia «importo rimborso non valido». Lo stesso vale per il ramo COD: il credito wallet (:620) arriva dopo l'accumulo.
- Impatto: Un rimborso fallito per un motivo tecnico chiude il cliente in un vicolo cieco: risulta rimborsato nei nostri dati, non ha ricevuto niente, e nessuna rotta (reso, reclamo, annullamento admin) può più emettere quel rimborso — l'unico rimedio è una scrittura a mano sul database. È l'innesco tipico della contestazione carta che si perde, perché le nostre prove dicono il contrario di quello che è successo. Colpisce ogni strada di rimborso: reso, reclamo, annullamento.
- Come si ripara: Invertire l'ordine o rendere reversibile la rivendicazione: (a) `accumula_rimborso` scrive una riga di intento (stato PENDING) confermata solo dal ritorno di `refunds.create` o dal webhook `charge.refunded`; oppure (b) tenere l'ordine attuale e avvolgere `refunds.create` in un `catch` che chiama una RPC nuova `storna_rimborso(p_order_id, p_delta)` decrementando lo stesso delta prima di rilanciare. Prova che gira: test di integrazione che stubba `refunds.create` con un throw e verifica che `refunded_amount_cents` sia tornato al valore iniziale.

**4. Rimborso con carta prima del payout: la quota del negozio non viene mai addebitata, la perdita la paga la piattaforma**

- Dove: `lib/stripe/payout.ts:591-606 (blocco dentro il ramo COD, che si chiude a :651) e :676 (ramo carta, senza equivalente)`
- Cosa succede: Confermato contando le parentesi riga per riga. Il ramo COD si apre a :568 (`if (!order.stripe_payment_intent) {`) e si chiude a :651 col `return { refundId: 'wallet:'+ref }`. Il blocco commentato «046 — Se il payout NON è ancora partito, reverseOrderTransfer è un no-op … Ora la quota si accumula lo stesso» sta a :591-606, cioè DENTRO quel ramo, malgrado l'indentazione a due spazi lo faccia sembrare fuori. Il ramo carta comincia a :653 e a :676 chiama `reverseOrderTransfer(order, sellerShare)` e basta. Quella funzione esce a vuoto se `payout_status !== 'TRANSFERRED'` (:347-349), quindi `seller_payout_reversed_cents` resta invariato. Poi il cron chiama `releaseOrderPayout`, che calcola `daVersare = residuoRecuperabile(order) = seller_payout_cents - seller_payout_reversed_cents` (:129, :322-326) e versa il netto PIENO.
- Impatto: Su ogni rimborso con carta emesso PRIMA del pagamento al negozio — cioè il caso normale, visto che il cron paga a consegna +1h (HOLD_HOURS = 1, app/api/cron/release-payouts/route.ts:10) mentre resi e reclami arrivano dopo — il cliente riprende i suoi soldi e il negozio incassa comunque il cento per cento. La differenza esce dalla cassa della piattaforma, in silenzio, ordine dopo ordine. È esattamente il difetto che il commento 046 dichiara risolto, applicato però al solo contrassegno.
- Come si ripara: Estrarre le righe 591-606 in una funzione (`addebitaQuotaVenditoreSenzaTransfer(order, sellerShare)`) e chiamarla in ENTRAMBI i rami subito dopo `reverseOrderTransfer`. Prova che gira: test che crea un ordine carta con `payout_status='HELD'`, chiama `refundOrder` per metà importo e verifica che `seller_payout_reversed_cents` sia pari a `round(metà * seller_payout_cents / gross)`; oggi è 0.

### privacy-legale


**5. Ogni ordine manda i dati dell'acquirente a PostHog negli Stati Uniti anche a chi ha rifiutato i cookie**

- Dove: `lib/analytics/server.ts:51-84 (chiamata da app/api/orders/cod/route.ts:626 e lib/stripe/webhook/ordini.ts:394)`
- Cosa succede: CONFERMATO leggendo il file. `contaAcquisto` fa una POST a `${HOST}/capture/` (HOST vale `https://us.i.posthog.com` per default) con `distinct_id: a.buyerId` — l'UUID della persona — più `order_id`, `total_cents`, `payment_method`, `seller_id`. L'unica condizione all'invio è `if (!CHIAVE) return` (riga 52): nessuna lettura del consenso. Il lato browser invece il consenso lo chiede sul serio (lib/analytics/posthog.tsx:56 `const consented = !!readConsent()?.analytics` con opt_out a runtime; components/ProductViewTracker.tsx:51 `if (!hasConsent('analytics')) return`) e fa `ph.identify(user.id)` (posthog.tsx:155) con lo stesso identificativo, quindi l'evento del server si salda al profilo identificato. I due documenti pubblicati dicono l'opposto: app/privacy/page.tsx:125 («PostHog Inc. … attiva solo con il consenso ai cookie analitici») e app/cookies/page.tsx:87 (riga `ph_* / ph_phc_*`: «Attivi solo con il consenso ai cookie analitici»). Esiste già lo strumento per farlo bene e viene usato altrove: `parseConsentCookie(...)` + `CONSENT_COOKIE` in app/api/track/route.ts:123 e middleware.ts:229.
- Impatto: Su ogni ordine — carta (webhook Stripe) e contanti — parte verso gli Stati Uniti un dato d'acquisto legato all'identificativo della persona, senza la base giuridica che abbiamo dichiarato noi stessi in due pagine pubbliche. È la contraddizione più facile da dimostrare in un accertamento: bastano le nostre pagine e il traffico in uscita. Vale per il 100% degli ordini futuri, a partire dal primo ordine reale.
- Come si ripara: In `contaAcquisto` leggere il consenso della richiesta (`parseConsentCookie(readCookie(...CONSENT_COOKIE))`, già usato in app/api/track/route.ts:123) e uscire se `analytics` è falso. Per il webhook Stripe, dove il cookie non esiste, salvare il consenso al momento del checkout sull'ordine/checkout pendente e leggerlo lì. In alternativa, se la misura deve restare sempre accesa: identificativo pseudonimo per ordine invece dell'id persona, base giuridica legittimo interesse con balancing test documentato, e riscrittura delle due frasi in privacy/cookies. Prova che gira: un test che chiama `contaAcquisto` con cookie di consenso a `000` e fallisce se `fetch` viene invocata.

### qa-flussi


**6. Chi riordina la stessa spesa in contanti non ordina niente, ma legge «Ordine effettuato»**

- Dove: `app/checkout/page.tsx:461-469 e 507-510 · app/api/orders/cod/route.ts:122-136, 642-646 · migrations/122_radiografia_20_agosto.sql:394-405`
- Cosa succede: CONFERMATO nel codice. La chiave anti-doppione è `cod-${carrelloImpronta}`, e l'impronta è un hash di prodotti+quantità+totale finale+ritiro/consegna (checkout/page.tsx:461-469): nessuna data, nessun identificativo di sessione, niente che cambi nel tempo. La tabella `cod_checkout_attempts` (migrazione 122, righe 394-399) ha solo `chiave` come chiave primaria, un `created_at` mai letto, nessuna colonna di scadenza e nessun cron che la pulisca — verificato con grep: la tabella compare SOLO in questa rotta e in quella migrazione. La rotta esce a riga 130-136 restituendo `orderIds` degli ordini vecchi con `ripetuto: true`, e il browser quel campo non lo guarda: legge solo `orderIds` e `ordini` (page.tsx:534-535), poi in onSuccess svuota il carrello, mostra «Ordine effettuato!» e apre la scheda del vecchio ordine (page.tsx:556-568).
- Impatto: È il caso più normale che esista per un panificio: «il solito», due filoni ogni martedì. Stesso carrello, stesso totale, stessa consegna → stessa impronta, per sempre. Il cliente crede di aver ordinato, il negozio non riceve niente, e la pagina che si apre mostra un ordine già consegnato. Nessun errore da nessuna parte: l'ordine sparisce in silenzio. Con Pane Quotidiano come unico negozio reale, colpisce esattamente il cliente che torna — quello che vale di più.
- Come si ripara: Legare la chiave al tentativo, non al contenuto: `cod-${crypto.randomUUID()}` tenuto in state e rigenerato dopo ogni successo. Se si vuole tenere l'impronta, limitare la lettura a una finestra breve (`.gte('created_at', now-15min)`) più un cron che cancella le righe più vecchie di un'ora. In più: se il server risponde `ripetuto: true`, il browser deve dirlo («questo ordine l'avevi già fatto»), non festeggiare. Prova che gira: due POST identici su /api/orders/cod a distanza di un giorno simulato devono creare due ordini distinti.

**7. Il cliente annulla un ordine già pagato con carta e i soldi restano a noi**

- Dove: `migrations/062_atomic_stock_reservation.sql:87-111 (cancel_order) e 113-134 (seller_reject_order) · app/orders/[id]/page.tsx:177-194, 225, 390 · app/seller/orders/[id]/page.tsx:181-197`
- Cosa succede: CONFERMATO. `cancel_order` e `seller_reject_order` fanno solo tre cose: UPDATE a CANCELED, `restore_stock_for_order`, INSERT in `notifications`. Nessun rimborso — e non possono farlo, sono funzioni di database. Ho controllato tutte le ridefinizioni successive (016, 061, 062, 064, 067, 086): nessuna aggiunge un rimborso. Il pulsante del cliente è acceso su qualunque ordine in NEW (`isCancellable = status === 'NEW'`, riga 225, usato a riga 390), carta compresa: il webhook crea gli ordini carta con `payment_status:'PAID'`, `delivery_status:'NEW'`, `payout_status:'HELD'` (lib/stripe/webhook/ordini.ts:266-275), quindi i soldi sono già incassati. Il messaggio di rifiuto del negozio dice testualmente «Niente addebiti» (062:130). Che l'intenzione fosse un'altra si vede dalla rotta admin, che il rimborso ce l'ha (app/api/admin/orders/[id]/cancel/route.ts:80 con `refundOrder`), e dal cron degli ordini fermi (expire-stale-orders/route.ts:81). Le due strade che usano davvero cliente e negoziante no.
- Impatto: Soldi veri trattenuti senza contropartita. Il cliente paga 24 €, annulla dieci minuti dopo perché ha sbagliato indirizzo, legge «Niente addebiti» — e sull'estratto conto i 24 € ci sono. Nessun processo automatico li restituisce: restano finché qualcuno non se ne accorge a mano. È il tipo di episodio che finisce in contestazione carta e brucia la fiducia sul primo ordine reale.
- Come si ripara: Spostare le due azioni dietro una rotta server, come già fa l'admin: `/api/orders/[id]/cancel` che verifica il permesso, chiama la RPC per lo stato e poi `refundOrder` se `payment_method='card'` e `payment_status` è PAID o PARTIALLY_REFUNDED. In attesa: spegnere il pulsante «Annulla ordine» sugli ordini carta pagati e togliere la frase «Niente addebiti» dal messaggio di rifiuto. Prova che gira: ordine carta PAID in NEW → annullo dal cliente → deve esistere un refund Stripe e `refunded_amount_cents` deve valere il totale.

### api-backend


**8. Il doppio clic sul pagamento alla consegna crea due ordini veri: la chiave anti-doppione si scrive alla fine, non all'inizio**

- Dove: `app/api/orders/cod/route.ts:120-137 (lettura) e :641-648 (scrittura)`
- Cosa succede: Verificato nel codice. La rotta legge `cod_checkout_attempts` per la chiave `Idempotency-Key` alle righe 120-137, PRIMA di creare qualunque ordine, e restituisce gli ordini di prima solo se `order_ids` non è vuoto. Ma la riga con quella chiave viene inserita solo alla riga 643-645, dopo che tutti gli ordini sono stati creati. È un controlla-poi-agisci: due richieste con la stessa chiave partite a un secondo di distanza (doppio tocco sul pulsante, o il ritentativo del telefono su rete lenta) leggono entrambe «nessun tentativo precedente» e creano entrambe l'intero set di ordini. Il vincolo che servirebbe esiste già: `chiave text PRIMARY KEY` in migrations/122_radiografia_20_agosto.sql:395, ma non viene usato per rivendicare. Confermato anche il difetto secondario: la chiave primaria è solo `chiave` (globale), mentre la lettura filtra anche su `user_id` — se la stessa stringa è già stata usata da un altro utente, l'insert finale fallisce con 23505 e la riga 647 logga solo un `warn`: l'idempotenza si spegne in silenzio. Il commento #172 alle righe 106-119 dichiara «Doppio clic, un ordine solo»: la protezione funziona solo per un tentativo che arriva DOPO il completamento del primo, cioè proprio il caso che non è il doppio clic.
- Impatto: Il cliente paga due volte alla consegna. Su ogni gruppo si esegue due volte la riserva di merce (l'ultimo pezzo sparisce dal catalogo senza che nessuno l'abbia comprato) e due volte l'addebito del credito MyCity. Il negozio prepara due spese, il fattorino ne consegna una, la differenza la rimette la piattaforma. Il contrassegno è il metodo di pagamento naturale del cliente di Piacenza: è la strada più battuta del marketplace.
- Come si ripara: Ribaltare l'ordine: inserire subito `cod_checkout_attempts { chiave, user_id, order_ids: [] }` come rivendicazione, prima di toccare stock e ordini. Se l'insert torna 23505 la chiave è già di qualcun altro: rileggere la riga e, se `order_ids` non è vuoto, restituire quegli ordini; se è ancora vuota, rispondere 409 «richiesta già in corso». A fine giro fare l'UPDATE di `order_ids`; in caso di errore cancellare la riga di claim così il cliente può ritentare. Aggiungere `user_id` alla chiave primaria. Prova che gira: due POST concorrenti con la stessa Idempotency-Key devono produrre UN solo set di ordini — oggi ne producono due.

### ai-endpoints


**9. Il freno sul prezzo esiste, è testato, e in produzione non si accende mai**

- Dove: `app/api/ai/catalog-apply/route.ts:61-69 (e app/api/ai/catalog-batch/apply/route.ts:113)`
- Cosa succede: CONFERMATO leggendo il codice. lib/products/aiPatch.ts:104-108 attiva la banda del 30% solo se `current.price` è valorizzato (`const attuale = Number(current.price ?? 0); ... attuale > 0 && ...`). L'unica rotta che scrive davvero un prezzo — catalog-apply — costruisce `current` con soli tre campi: `{ attributes, category_id, has_variants }` (righe 63-67). Il prodotto è già stato letto con PRODUCT_SNAPSHOT_COLS (aiSnapshot.ts:28-29), che include `price`: il valore c'è in memoria e non viene inoltrato. Quindi `attuale` = 0, `scostamentoTroppoGrande` = false, e qualunque prezzo > 0 viene scritto. Stessa omissione in catalog-batch/apply:113 (lì l'effetto è minore perché lo schema del lotto esclude i campi economici, catalogBatch.ts:32-38). Il test tests/unit/ai-lotto-non-tocca-i-soldi.test.ts:60 chiama resolveAiPatch con `base = { attributes: null, category_id: 'c1', price: 20 }`, cioè passa a mano proprio il campo che nessuna rotta passa: resta verde e certifica una protezione morta. Verificato anche che il `patch` arriva dal corpo della richiesta (catalog-apply:41) e che catalog-chat propone `price` nel suo tool (route.ts:93).
- Impatto: Il pulsante «Applica tutte» del Catalog Copilot (components/seller/CatalogCopilot.tsx:101-112) scrive fino a 200 patch in fila, e l'anteprima è una lista scorrevole di una riga per prodotto: uno zero perso dal modello («20 €» → «2 €») entra in vetrina senza che nulla lo fermi. Il negoziante se ne accorge dagli ordini, cioè quando ha già venduto sottocosto. È esattamente lo scenario che il difetto #192 dichiara chiuso.
- Come si ripara: In catalog-apply aggiungere `price: current.price` dentro l'oggetto `current` passato a resolveAiPatch (riga 63), e `price: row.price` in catalog-batch/apply:113. Poi una prova a livello di ROTTA (non di libreria): POST a /api/ai/catalog-apply con patch `{price: 2}` su un prodotto da 20 €, e si pretende che l'update sul DB non contenga `price`. La prova attuale non può fallire nel modo in cui fallisce la realtà.

### dati-analytics


**10. Ogni acquisto viene contato due volte, dal browser e dal server**

- Dove: `lib/analytics/server.ts:51-83 · app/checkout/page.tsx:548-554 · app/orders/page.tsx:124-135 · lib/stripe/webhook/ordini.ts:392-402 · app/api/orders/cod/route.ts:624-635`
- Cosa succede: CONFERMATO leggendo i quattro punti. Contrassegno: il server chiama contaAcquisto in app/api/orders/cod/route.ts:626-634 e il browser richiama trackOrderPlaced in app/checkout/page.tsx:550 appena l'API risponde. Carta: il server manda l'evento dal webhook (lib/stripe/webhook/ordini.ts:394-400) e il browser lo rimanda al rientro su /orders?stripe=success (app/orders/page.tsx:131). Entrambi i percorsi usano lo stesso $insert_id (`order_placed:<orderId>`), ma il corpo della POST del server (lib/analytics/server.ts:57-77) NON contiene il campo `timestamp`: PostHog usa quindi l'ora di arrivo, mentre il browser manda l'ora del proprio orologio al momento della capture. La deduplica di PostHog richiede che coincidano nome evento, distinct_id, $insert_id E timestamp: qui il timestamp non coincide mai. Verificato anche il test citato (tests/unit/acquisto-contato-sul-server.test.ts): controlla solo che il server mandi un evento (`expect(inviato.length).toBe(1)`), nessun test unisce i due percorsi.
- Impatto: Fatturato e numero di acquisti in PostHog raddoppiati rispetto al vero, e nessuno dei due riconcilia con la tabella `orders`. Ogni tasso di conversione, scontrino medio e ritorno di campagna poggia su quel numero: diventa denaro vero il giorno in cui parte la spesa pubblicitaria, perché il budget si deciderebbe su un fatturato gonfiato di due volte.
- Come si ripara: Un solo emittente per `order_placed`, il server (lì il fatto è certo): togliere trackOrderPlaced da app/checkout/page.tsx:550 e da app/orders/page.tsx:131, lasciando nel browser solo il fan-out GA4 finché il purchase lato server non esiste. In alternativa aggiungere `timestamp` al corpo della POST in lib/analytics/server.ts e far restituire dall'API lo stesso identico valore al browser. Prova che deve diventare rossa: un test che percorre i due canali sullo stesso orderId e pretende un solo evento al raccoglitore (o due con timestamp identico).

**11. Il conteggio degli acquisti lato server parte anche per chi ha rifiutato i cookie**

- Dove: `lib/analytics/server.ts:51-77 · app/api/orders/cod/route.ts:626 · lib/stripe/webhook/ordini.ts:394 · confronto lib/analytics/posthog.tsx:48-64 e app/api/track/route.ts:123-124`
- Cosa succede: CONFERMATO. Nel browser il cancello esiste: getPosthog() (lib/analytics/posthog.tsx:56-62) restituisce null se readConsent().analytics è falso. Lato server contaAcquisto controlla solo `if (!CHIAVE) return` e poi manda l'evento con `distinct_id: a.buyerId`, cioè l'id dell'account della persona. Ho verificato con grep che `mc_consent`/`parseConsentCookie` sono letti solo in app/api/track/route.ts:123: né la rotta contrassegno né il webhook Stripe li leggono prima di chiamare contaAcquisto, benché il parser server-side esista già (lib/consent.ts:122-140). La POST non dichiara `$process_person_profile: false` mentre il client è configurato `person_profiles: 'identified_only'` (posthog.tsx:69): l'evento del server crea comunque un profilo persona.
- Impatto: Due danni. Giuridico: si crea un profilo su un sistema americano per una persona che ha detto no all'analitica, cioè esattamente ciò che il banner promette di rispettare. Sui numeri: il denominatore del funnel (visite, carrello, checkout) è filtrato dal consenso e il numeratore no, quindi la conversione esce sistematicamente più alta del vero di una quantità che nessuno conosce.
- Come si ripara: In app/api/orders/cod/route.ts leggere il cookie `mc_consent` con parseConsentCookie e chiamare contaAcquisto solo se `analytics` è vero; per il webhook Stripe, dove i cookie del cliente non arrivano, salvare la scelta accanto all'ordine al momento del checkout e rileggerla lì. In alternativa contare il fatto commerciale senza identità: distinct_id anonimo per ordine + `$process_person_profile: false`. Prova che deve diventare rossa: un test che chiama la rotta con il cookie di rifiuto e verifica che al raccoglitore non arrivi niente.

### deploy-sre


**12. Il rilascio non applica le migrazioni: il codice nuovo arriva su un database vecchio**

- Dove: `render.yaml:43-49 (autoDeploy/buildCommand/startCommand, nessun preDeployCommand); .github/workflows/deploy-dopo-ci.yml; .github/workflows/ci.yml; package.json:7-22 (nessuno script db:migrate); migrations/ (125 file)`
- Cosa succede: CONFERMATO leggendo l'intera catena. render.yaml dichiara solo `buildCommand: npm ci … && npm run build` e `startCommand: npm start`: non esiste nessun `preDeployCommand`. Nei quattro workflow (ci.yml, deploy-dopo-ci.yml, backup-db.yml, deriva-migrazioni-produzione.yml) non c'è un solo passo che applichi le migrazioni al database di produzione: ci.yml le applica soltanto a un Postgres usa-e-getta del runner (`tests/sql/harness/apply.sh mycity_ci`), e deploy-dopo-ci.yml fa un solo POST al gancio di Render. In package.json non esiste nessuno script di migrazione: c'è solo `db:check-drift`, che confronta e non applica. Quindi le 125 migrazioni si applicano a mano, mentre il codice che le presuppone parte da solo a ogni push (`autoDeploy: true`, render.yaml:43). L'unico sensore, `deriva-migrazioni-produzione.yml`, gira `cron: "42 6 * * *"` — fino a 24 ore dopo. Il commento in testa a quel file documenta l'incidente vero del 19 agosto: la migrazione 119 fermata a metà perché la 099 non era mai stata applicata (catalog_ai_jobs inesistente).
- Impatto: Un rilascio che tocca lo schema manda in produzione codice che interroga tabelle o colonne che non esistono: 500 sulle rotte coinvolte, e se tocca checkout→ordine→pagamento il cliente paga e l'ordine non nasce. Il rollback del codice non basta quando una migrazione parziale ha già cambiato lo schema.
- Come si ripara: Aggiungere in render.yaml un `preDeployCommand` che applichi le migrazioni mancanti (Render lo esegue prima di dirottare il traffico e, se fallisce, non promuove il rilascio); oppure spostare il rilascio dentro deploy-dopo-ci.yml nell'ordine CI verde → applica migrazioni → chiama il deploy hook. In entrambi i casi mettere `SALTO_E_ERRORE=1 npm run db:check-drift` come cancello immediatamente prima del rilascio. 🔴 (tocca il rilascio vero): preparare e far firmare a Nicola.

## Gravi — 88


### architettura


**1. Il bottone «scarica i miei dati» chiede una colonna che non esiste, e il file esce senza nessun ordine**

- Dove: `app/profile/settings/page.tsx:188 (funzione handleDownloadData, righe 185-205)`
- Cosa succede: VERIFICATO riga per riga. La riga 188 è `supabase.from('orders').select('*').eq('buyer_id', userId)`. La tabella `orders` non ha `buyer_id`: in lib/database.types.ts il blocco `orders: { Row: {` elenca `id, user_id, total_price, ...` — la colonna si chiama `user_id`. La copia viene da altre tabelle dove `buyer_id` esiste davvero (conversations, returns, gift_cards, pending_checkouts: confermato con grep). PostgREST…
- Come si ripara: Cancellare `handleDownloadData` e collegare il bottone (app/profile/settings/page.tsx:490) a `/api/account/export`: fetch con il Bearer token, blob dalla risposta, download. Un percorso solo, quello già scritto e già coperto da test. Prova che gira: un test d'integrazione che chiama l'export per un…

**2. La cassa esiste in due copie: contanti e carta rifanno lo stesso conto, riga per riga**

- Dove: `app/api/orders/cod/route.ts (651 righe) e app/api/stripe/checkout/route.ts (489 righe)`
- Cosa succede: MISURATO, non stimato: confrontando le sole righe di codice (senza commenti né righe vuote) con difflib, i blocchi identici di almeno 4 righe sommano 140 righe su 328 del percorso carta — il 43%. Le due rotte ripetono la stessa pipeline: kill-switch del ritiro in negozio (blocco identico, cod:97-102 e stripe:100-105), caricamento prodotti e varianti, lettura di `seller_public_profiles`, controllo negozio chiuso,…
- Come si ripara: Estrarre `preparaOrdine(supa, admin, body, userId)` in `lib/ordini/preparazione.ts`, che restituisce i gruppi già prezzati (subtotale, spedizione, fee, quote di sconto, compenso rider) o un errore tipizzato. Le due rotte restano con il solo pezzo davvero diverso: Stripe con line items e sessione,…

**3. C'è un intero sistema di accesso lato server, con i freni contro chi prova mille password — e non lo chiama nessuno**

- Dove: `app/api/auth/signin/route.ts · app/api/auth/signup/route.ts · lib/supabase/auth-server.ts · app/sign-in/page.tsx:72 · app/sign-up/page.tsx:96`
- Cosa succede: VERIFICATO. `/api/auth/signin` ha davvero i due freni: per indirizzo di rete (riga 14, 10 tentativi in 5 minuti) e per indirizzo email (riga 41, col commento che spiega perché serve), più il captcha Turnstile (riga 46) e il blocco di chi non ha confermato l'email (riga 58). `lib/supabase/auth-server.ts` è scritto apposta per queste rotte, con dieci righe di commento sul perché serve un client per richiesta. Cercando…
- Come si ripara: Decidere una strada sola. Raccomandazione: far passare accesso e registrazione dalle rotte server (`fetch('/api/auth/signin')` in app/sign-in/page.tsx, signup analogo, poi `supabase.auth.setSession(data.session)` nel browser), così i freni entrano in funzione. Prova che gira: un test che spara 11…

**4. I tipi del database ci sono, 2894 righe generate — e nessun client li usa**

- Dove: `lib/database.types.ts (2894 righe verificate) · lib/supabase/server.ts:11,44 · lib/supabase/client.ts:17 · lib/api/middleware.ts:35`
- Cosa succede: VERIFICATO. Il file dei tipi è di 2894 righe ed è generato da `npm run db:types` (scripts/gen-db-types.mjs, che li ricava dalle migrazioni). Nessun client Supabase è parametrizzato: cercando `createClient<`, `createServerClient<`, `createBrowserClient<` e `SupabaseClient<` in app, lib e components, l'unico risultato è un commento in app/api/cron/send-emails/route.ts:93 — nessun uso reale. `lib/database.types.ts` è…
- Come si ripara: Non tipizzare tutto in un colpo. Partire dal percorso dei soldi: `type OrdersRow = Database['public']['Tables']['orders']['Row']` e usarlo esplicitamente su `orders`, `order_items`, `products`, `product_variants` e `coupons` nelle rotte di checkout e nei gestori in `lib/stripe/webhook/`. Poi,…

### sicurezza-auth


**5. Causa radice: i divieti scritti nelle migrazioni non tolgono niente, perché dimenticano PUBLIC**

- Dove: `migrations/119_radiografia_18_agosto.sql:628, 658, 784, 925 e migrations/124_radiografia_21_agosto.sql:84`
- Cosa succede: CONFERMATO, con una correzione importante rispetto a come era stato descritto. In PostgreSQL una funzione appena creata dà EXECUTE a PUBLIC, cioè a tutti i ruoli, anon compreso; per chiuderla bisogna revocare a PUBLIC. Le cinque righe indicate (verificate una per una con grep) revocano invece «FROM anon, authenticated»: due destinatari che non avevano un permesso proprio da togliere, mentre il permesso vero — quello…
- Come si ripara: ① Una migrazione di rimedio che revochi a PUBLIC su tutte e quattro le funzioni (accumula_rimborso, pota_consent_log, consolida_visite_prodotto, documenti_da_cancellare_respinti). ② Correggere lo stampo: da oggi ogni REVOKE su funzione si scrive `FROM PUBLIC, anon, authenticated`. ③ Il freno che…

**6. Senza login si scarica l'elenco delle persone respinte e dove stanno i loro documenti d'identità**

- Dove: `migrations/119_radiografia_18_agosto.sql:638-658 — funzione public.documenti_da_cancellare_respinti(int)`
- Cosa succede: CONFERMATA la falla, CORRETTA la gravità da bloccante a grave. La funzione è SECURITY DEFINER, legge direttamente public.profiles e restituisce, per ogni profilo con approval_status='rejected', l'id dell'utente e l'array dei percorsi dei suoi documenti (kyc_id_doc_front_url, kyc_id_doc_back_url, kyc_selfie_url, rider_license_url, rider_insurance_url, rider_haccp_url). Nessun controllo sul chiamante. Verificato sul…
- Come si ripara: `REVOKE EXECUTE ON FUNCTION public.documenti_da_cancellare_respinti(int) FROM PUBLIC, anon, authenticated;` + `GRANT EXECUTE ... TO service_role;`, più il controllo interno `IF NOT public.is_admin() AND coalesce((SELECT auth.jwt() ->> 'role'),'') <> 'service_role' THEN RAISE EXCEPTION 'forbidden'…

**7. Chiunque, senza account, può cancellare lo storico delle visite ai prodotti**

- Dove: `migrations/119_radiografia_18_agosto.sql:895-926 — funzione public.consolida_visite_prodotto(int)`
- Cosa succede: CONFERMATO. La funzione è SECURITY DEFINER, non controlla il chiamante, e finisce con `DELETE FROM public.product_views WHERE viewed_at < limite`, dove `limite := now() - make_interval(days => greatest(p_giorni,1))`. Verificato sul catalogo di produzione: proacl '{=X/postgres,postgres=X/postgres,service_role=X/postgres}' e has_function_privilege('anon', ..., 'EXECUTE') = TRUE; il linter Supabase la elenca come…
- Come si ripara: `REVOKE EXECUTE ON FUNCTION public.consolida_visite_prodotto(int) FROM PUBLIC, anon, authenticated;` + `GRANT EXECUTE ... TO service_role;` e controllo interno del ruolo service_role in testa alla funzione. Verifica di chiusura sul catalogo: has_function_privilege('anon', ...) deve tornare false.…

**8. Chiunque, senza account, può cancellare la prova del consenso privacy**

- Dove: `migrations/119_radiografia_18_agosto.sql:611-628 — funzione public.pota_consent_log(int)`
- Cosa succede: CONFERMATO. La funzione è SECURITY DEFINER, senza alcun controllo sul chiamante, e scrive: mette a NULL la colonna `ip` di consent_log per tutte le righe più vecchie di p_mesi. Verificato sul catalogo di produzione: proacl '{=X/postgres,postgres=X/postgres,service_role=X/postgres}' e has_function_privilege('anon','public.pota_consent_log(int)','EXECUTE') = TRUE; il linter Supabase la elenca come eseguibile da anon…
- Come si ripara: `REVOKE EXECUTE ON FUNCTION public.pota_consent_log(int) FROM PUBLIC, anon, authenticated;` + `GRANT EXECUTE ... TO service_role;`, più il controllo interno del ruolo service_role in testa alla funzione. Da chiudere prima che il marketplace inizi a raccogliere consensi in volume. Fix a…

**9. La vetrina «attività dal vivo» regala a ogni visitatore l'identificativo di ogni ordine recente**

- Dove: `migrations/114_hardening_radiografia.sql:402 (vista viva in produzione) — riparazione già scritta e MAI applicata in migrations/120_vetrina_attivita_senza_id.sql:31`
- Cosa succede: CONFERMATO sul database vivo. La vista `live_activity_public` è SECURITY DEFINER (scavalca la RLS di orders) ed è leggibile da anon: verificato sul catalogo, relacl = '{postgres=arwdDxtm/postgres,anon=rtm/postgres,authenticated=rtm/postgres,service_role=arwdDxtm/postgres}' e has_table_privilege('anon','public.live_activity_public','SELECT') = TRUE; il linter Supabase la segnala come ERROR security_definer_view. La…
- Come si ripara: Applicare la migrazione 120 (🔴 firma di Nicola): il codice che la bloccava è già in produzione, l'ordine dichiarato nel file è rispettato, quindi l'applicazione non rompe la home. Dopo l'applicazione, verificare la forma reale sul database e non sul file: `SELECT…

### rls-database


**10. La riparazione della vetrina «attività dal vivo» è scritta ma non è mai stata applicata**

- Dove: `migrations/120_vetrina_attivita_senza_id.sql (vista viva: public.live_activity_public)`
- Cosa succede: CONFERMATO sul database vivo. Ho letto la definizione reale della vista con `pg_get_viewdef('public.live_activity_public')`: restituisce ancora `o.id` come prima colonna e `o.created_at` al secondo, mentre la migrazione 120 nel repo toglie `id` e arrotonda l'orario con `date_trunc('hour', ...)`. Quindi la 120 non è stata applicata. Il prerequisito che il file stesso dichiara è invece già fatto:…
- Come si ripara: Applicare la migrazione 120 alla produzione: il prerequisito (il codice che non chiede più `id`) è già in `main`, quindi non c'è più niente da aspettare. Resta 🔴, serve la firma di Nicola. Prova dopo l'applicazione: `select * from public.live_activity_public limit 1` non deve avere la colonna…

### pagamenti-stripe


**11. L'anti-doppione del webhook non protegge la prima consegna: due consegne simultanee dello stesso evento passano entrambe**

- Dove: `app/api/stripe/webhook/route.ts:65 (INSERT) e :74-84 (rivendicazione) · migrations/119_radiografia_18_agosto.sql:810`
- Cosa succede: L'INSERT iniziale scrive solo `{ event_id, type }` (:65). La colonna `claimed_at` è aggiunta dalla 119 a riga 810 con `ALTER TABLE … ADD COLUMN IF NOT EXISTS claimed_at timestamptz;` — senza DEFAULT, quindi nasce NULL. Quando arriva la seconda consegna concorrente l'INSERT fallisce con 23505 e si entra nella rivendicazione (:74-84), che accetta la riga se `processed = false` E (`claimed_at IS NULL` OR più vecchio di…
- Come si ripara: Scrivere `claimed_at: new Date().toISOString()` già nell'INSERT di riga 65, oppure dare `DEFAULT now()` alla colonna. Prova che gira: test che chiama POST due volte in parallelo con lo stesso `event.id` su un gestore-contatore e verifica che il gestore sia entrato una volta sola.

**12. Rimborso rifiutato dalla banca: su un carrello multi-negozio non viene registrato mai**

- Dove: `lib/stripe/webhook/rimborsi.ts:209-217`
- Cosa succede: `handleRefundUpdated` cerca l'ordine con `.eq('stripe_payment_intent', paymentIntent).maybeSingle()`. Ma il modello è multi-negozio e l'ho verificato alla fonte: `handleCheckoutCompleted` crea un ordine per gruppo/venditore scrivendo lo STESSO `stripe_payment_intent` su tutti (lib/stripe/webhook/ordini.ts:232-284, campo a :270). Con N≥2 righe `maybeSingle()` restituisce errore PGRST116 e `data` null; il codice…
- Come si ripara: Sostituire `maybeSingle()` con la lettura di tutte le righe e ripartire l'importo rifiutato pro-quota sul `refunded_amount_cents` di ciascun ordine; meglio ancora agganciare il rimborso all'ordine tramite `refund.metadata.order_id`, che `refundOrder` già scrive (:659-660). Prova che gira: test con…

**13. Contrassegno: la chiave anti-doppio-clic è scritta solo alla fine, quindi due invii contemporanei creano due ordini e addebitano il credito due volte**

- Dove: `app/api/orders/cod/route.ts:121-137 (lettura) e :642-647 (scrittura)`
- Cosa succede: La rotta legge `cod_checkout_attempts` in cima (:121-137) e la scrive solo dopo aver creato tutti gli ordini, riservato la merce, addebitato il credito, mandato le email e contato l'acquisto (:642-647). Fra le due cose ci sono centinaia di righe e decine di chiamate al database. Due richieste con la stessa `Idempotency-Key` partite a distanza di un secondo — il secondo tocco sul pulsante, lo scenario descritto nel…
- Come si ripara: Rivendicare la chiave PRIMA di lavorare: INSERT su `cod_checkout_attempts` con `order_ids` vuoto in cima alla rotta; se torna 23505, attendere e rileggere restituendo gli ordini della prima richiesta; a fine lavoro UPDATE con gli `order_ids` veri. In più dare a `wallet_debit` un `p_ref` stabile…

**14. Reso e reclamo: i soldi escono prima della guardia di stato, e due decisioni contemporanee raddoppiano il rimborso nei conti**

- Dove: `app/api/returns/[id]/decide/route.ts:64-101 (refund) vs :103-118 (guardia) · app/api/admin/disputes/[id]/resolve/route.ts:54-79 (refund) vs :82-96 (guardia)`
- Cosa succede: In tutte e due le rotte `refundOrder` viene chiamato PRIMA dell'UPDATE condizionato che rivendica lo stato ('REQUESTED' per il reso, 'open'/'under_review' per il reclamo). Il commento dice «l'eventuale refund è già protetto dall'idempotencyKey lato Stripe»: vero per il denaro (le chiavi `return_<id>` e `dispute_<id>` sono stabili e le ho verificate), falso per la contabilità. Ho letto `accumula_rimborso` nella…
- Come si ripara: Spostare l'UPDATE condizionato di stato PRIMA della chiamata a `refundOrder` in entrambe le rotte (prima rivendica, poi paga), e riportare indietro lo stato se il rimborso fallisce. Prova che gira: test che invia due POST in parallelo sullo stesso reso e verifica che `refunded_amount_cents` sia…

**15. Contestazione persa su un ordine già consegnato: l'ordine viene «annullato» e la merce rimessa a magazzino**

- Dove: `lib/stripe/webhook/dispute.ts:150-162`
- Cosa succede: Nel ramo `lost` si scrive `delivery_status: 'CANCELED'` su TUTTI gli ordini della charge (:151-159) e si chiama `restore_stock_for_order` per ognuno (:160-162), senza guardare se erano DELIVERED — la `select` di riga 77 non legge nemmeno `delivery_status`. È l'opposto della regola 054 applicata ovunque altrove: `refundOrder` (lib/stripe/payout.ts:697-703) e `handleChargeRefunded` (lib/stripe/webhook/rimborsi.ts:126)…
- Come si ripara: Applicare la stessa condizione già usata negli altri due punti: leggere `delivery_status` nella select e scrivere `CANCELED` + `restore_stock_for_order` solo per gli ordini con `delivery_status !== 'DELIVERED'`; per i consegnati toccare solo `payment_status` e `dispute_status`. Prova che gira: test…

**16. Contestazione vinta: azzerando lo storno accumulato, il negozio si fa ripagare un rimborso che aveva già restituito**

- Dove: `lib/stripe/webhook/dispute.ts:96-114 (riga :101 `seller_payout_reversed_cents: 0`)`
- Cosa succede: Nel ramo `won` gli ordini in 'REVERSED' tornano in coda con `seller_payout_reversed_cents: 0` incondizionatamente (:101). Ma quel campo è un totale cumulato che può contenere anche storni legittimi non legati alla contestazione: un reso parziale rimborsato prima lo incrementa (lib/stripe/payout.ts:369-373). Azzerandolo, `residuoRecuperabile` (:322-326) torna al netto pieno e il cron versa tutto.
- Come si ripara: Sottrarre invece di azzerare: rimettere in coda con `seller_payout_reversed_cents = max(0, valore_attuale - importo_stornato_per_la_contestazione)`, tenendo l'importo stornato per il chargeback in una colonna dedicata. Prova che gira: test con un ordine che ha già `seller_payout_reversed_cents > 0`…

**17. Pagina Guadagni: al negozio si mostra come «incassato in contanti» il totale del cliente, con una promessa di accredito che il codice non mantiene**

- Dove: `app/seller/earnings/page.tsx:46 (payoutBadge), :124-129 (codCollected), :212-221 (riquadro) · lib/guadagni/negozio.ts:47`
- Cosa succede: Verificati tutti e quattro i punti. ① Il riquadro «Contanti (COD)» somma `total_price` degli ordini contrassegno consegnati (:124-129): è il contante che il cliente dà al fattorino, quindi comprende la fee di consegna (PLATFORM_DELIVERY_FEE_CENTS = 300, lib/constants.ts:54), la spedizione e la commissione del 10%. Il netto che arriverà davvero sull'IBAN è `seller_payout_cents` (90% del solo subtotale,…
- Come si ripara: Mostrare nel riquadro COD `seller_payout_cents - seller_payout_reversed_cents` (il netto), affiancato dal contante incassato come dato separato; sostituire il testo con lo stato reale («accreditato dopo la verifica della cassa del fattorino»); estendere `payoutBadge` agli stati COD…

**18. Un pagamento del negozio fermo in PROCESSING non riparte da solo: nessun giro lo ripesca, resta solo un avviso**

- Dove: `lib/stripe/payout.ts:104-118 (claim) e :171-176 (catch) · app/api/cron/release-payouts/route.ts:11, :57-69`
- Cosa succede: Correggo un pezzo della segnalazione originale: il `catch` attorno al transfer riporta l'ordine a 'HELD' (:173-175), quindi un errore di Stripe si ripesca. Restano scoperti due casi veri: ① il processo muore fra il claim (:106) e la fine — il cron lavora fino a BATCH_LIMIT = 200 ordini per esecuzione in un unico ciclo sequenziale di chiamate Stripe da 10 secondi di timeout ciascuna, quindi un tetto di durata della…
- Come si ripara: Due cose insieme: (a) recupero dei claim vecchi, come già si fa sugli eventi Stripe — aggiungere `payout_claimed_at` e includere fra i candidati gli ordini in PROCESSING rivendicati da più di N minuti (la chiave di idempotenza `payout_seller_<id>_t<n>` rende sicuro il ritentativo: Stripe…

**19. Incasso diverso dal preventivo: il cliente paga, l'ordine non nasce, e nessun rimborso parte mai**

- Dove: `lib/stripe/webhook/ordini.ts:171-185`
- Cosa succede: Il controllo di quadratura confronta `session.amount_total` con `pending_checkouts.total_cents` e, se lo scarto supera un centesimo, lancia un'eccezione perché Stripe riprovi (:184). Ho ricostruito da dove può nascere lo scarto: `total_cents` è la somma dei totali per gruppo, ognuno passato da un `Math.max(0, subtotal + shipping + fee - quote di sconto)` (app/api/stripe/checkout/route.ts:352-357, :376), mentre…
- Come si ripara: Trattare lo scarto come stato terminale invece che come errore ritentabile: marcare il `pending_checkout` con uno stato dedicato (es. 'MISMATCH'), rimborsare automaticamente con chiave di idempotenza stabile come già si fa per la riserva scaduta (:140-150), notificare una sola volta e rispondere…

### privacy-legale


**20. Il pulsante «Esporta dati» consegna un file senza gli ordini, e la rotta GDPR completa non la chiama nessuno**

- Dove: `app/profile/settings/page.tsx:185-205 e :488-493 (bottone «Esporta dati (JSON)») · app/api/account/export/route.ts (nessun chiamante)`
- Cosa succede: CONFERMATO. `handleDownloadData` riscrive l'esportazione a mano nel browser con tre query e non tocca `/api/account/export`. Una delle tre è `supabase.from('orders').select('*').eq('buyer_id', userId)`, ma la tabella `orders` NON ha la colonna `buyer_id`: nel tipo generato (lib/database.types.ts, blocco `orders: { Row: ... }`) l'acquirente è `user_id`, e la rotta API infatti usa `.eq('user_id', userId)`…
- Come si ripara: Sostituire `handleDownloadData` con una `GET /api/account/export` (già autenticata e limitata a 3 al giorno) e salvare la risposta come file. Correggere comunque `buyer_id` → `user_id` se resta una query diretta. Prova che gira: test che monta la pagina impostazioni e fallisce se compare una query…

**21. La posizione GPS del fattorino resta sull'ordine per sempre, mentre l'informativa promette che si cancella a fine consegna**

- Dove: `app/privacy/page.tsx:105 (tabella conservazioni) vs migrations/083_notifications_best_effort_in_order_rpc.sql:82 · app/rider/orders/[id]/page.tsx:200-215`
- Cosa succede: CONFERMATO. L'informativa dichiara per «Posizione del Rider durante la consegna» → conservazione «Cancellata alla chiusura dell'ordine». Nel codice la posizione si scrive ogni 30 secondi su `orders.rider_lat/rider_lng/rider_position_updated_at` dal `watchPosition` della pagina rider. Ho cercato in tutto il repo chi azzera quelle colonne: l'unico punto è `rider_release_order` in…
- Come si ripara: Nuova migrazione che riscrive la RPC della 083 aggiungendo `rider_lat = NULL, rider_lng = NULL, rider_position_updated_at = NULL` all'UPDATE verso DELIVERED, e lo stesso sul ramo CANCELED; più una passata una tantum sugli ordini già chiusi. Prova che gira: un test SQL in tests/sql che porta un…

**22. Chi entra con Google non accetta mai Termini e Informativa, e non ne resta traccia**

- Dove: `components/ui/AuthShell.tsx:106-127 (AuthAlternatives) · app/auth/callback/route.ts:74-99 · app/sign-up/page.tsx:106-110`
- Cosa succede: CONFERMATO. Il verbale dell'accettazione funziona solo per la registrazione via email: sign-up passa `versione_testi_accettati: VERSIONE_TESTI_LEGALI` nei metadati, e la callback scrive la riga in `consent_log` + `profiles.tos_accepted_at` SOLO dentro `if (versione)`. Il pulsante Google chiama `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })` e basta: nessuna spunta a video sopra il…
- Come si ripara: Mettere la stessa spunta obbligatoria sopra il pulsante Google in `AuthAlternatives` e trasportare la versione dei testi (queryParams dell'OAuth o sessionStorage riletto dalla callback). In app/auth/callback/route.ts, quando `versione` è null e `tos_accepted_at` è vuoto, non proseguire in silenzio:…

**23. Il cliente non sa mai chi è il venditore: nessuna ragione sociale, P.IVA o sede sulle pagine prodotto e negozio**

- Dove: `app/product/[id]/page.tsx:609-615 (SellerCard) · components/products/SellerCard.tsx:14-60 · app/store/[id]/page.tsx`
- Cosa succede: CONFERMATO. I Termini dichiarano che «Il contratto di compravendita si conclude direttamente tra Acquirente e Venditore» (app/terms/page.tsx:83, ripetuto nel sommario alla riga 53). La `SellerCard` legge dalla vista `seller_public_profiles` soltanto `store_logo, created_at, is_approved, stripe_charges_enabled, stripe_payouts_enabled` e mostra nome commerciale, avatar, badge verificato, valutazione, «membro dal»,…
- Come si ripara: Blocco «Venduto da» in fondo alla scheda prodotto e alla pagina negozio con ragione sociale, sede, P.IVA e un recapito, letti dai campi `business_*` tramite estensione della vista `seller_public_profiles` ai soli campi identificativi d'impresa (dati d'impresa, non dati personali da minimizzare).…

**24. Recesso, reclami, privacy e sicurezza puntano a caselle su un dominio che non è quello di produzione**

- Dove: `app/terms/page.tsx:119, 181, 294, 310 · app/profile/settings/page.tsx:520 · lib/legal/titolare.ts:76 · render.yaml:81 e :140-141`
- Cosa succede: CONFERMATO nel codice. I Termini indicano `security@mycity.it` (riga 119) per gli account compromessi, `resi@mycity.it` (181) per il recesso, `reclami@mycity.it` (294) per i reclami, `legal@mycity.it` (310) per i Termini; la pagina impostazioni stampa `privacy@mycity.it` scritto a mano (520) e lo stesso indirizzo è il valore di ripiego in lib/legal/titolare.ts:76. Il dominio di produzione dichiarato in…
- Come si ripara: Portare i recapiti dentro lib/legal/titolare.ts (`emailResi`, `emailReclami`, `emailLegale`, `emailSicurezza`), alimentati da variabili d'ambiente sul dominio vero, e non stampare la riga quando la variabile manca — la regola già applicata a indirizzo e P.IVA. Prova che gira: estendere…

**25. Nessun canale per segnalare un contenuto illecito e nessun punto di contatto dichiarato (obblighi DSA)**

- Dove: `app/terms/page.tsx:229-230 e 248, 269 · app/api/ (nessuna rotta di segnalazione) · nessun componente «Segnala»`
- Cosa succede: CONFERMATO. MyCity ospita contenuti di terzi (schede prodotto, foto, recensioni, storie dei negozi) e permette ai consumatori di concludere contratti a distanza con professionisti. Nel repo non esiste nulla dell'impianto richiesto: `ls app/api` non mostra alcuna rotta di segnalazione, e la ricerca di un pulsante «Segnala» in app/ e components/ non restituisce nessuna occorrenza (le uniche menzioni di DSA sono due…
- Come si ripara: Tre cose: (1) pulsante «Segnala» su scheda prodotto, recensione e negozio che scrive in una tabella `segnalazioni` con motivo, autore, stato, e una risposta motivata al segnalante; (2) punto di contatto pubblicato nei Termini per autorità e utenti; (3) sezione nei Termini con criteri di…

**26. Un prodotto alimentare si può pubblicare e vendere senza dichiarare gli allergeni**

- Dove: `lib/category-attributes.ts:14-27 (tipo AttributeField) e :30-45 (categoria alimentari) · components/products/AllergensAccordion.tsx:42 · app/product/[id]/page.tsx:794-795`
- Cosa succede: CONFERMATO. Nel tipo `AttributeField` non esiste alcun concetto di campo obbligatorio: i membri sono `key, label, type, options?, placeholder?, unit?, helpText?, variantable?` e la ricerca di `required` nel file non dà nessuna occorrenza. Nella categoria `alimentari` gli attributi `allergeni` (text libero), `ingredienti` (textarea) e `valori_nutrizionali` (textarea) sono quindi facoltativi, e la ricerca di…
- Come si ripara: Introdurre il flag `required` in `AttributeField` e marcare `allergeni` (con l'opzione esplicita «nessuno dei 14 allergeni») e `ingredienti` come obbligatori per le categorie alimentari; bloccare pubblicazione e ripubblicazione finché mancano, sia nel modulo venditore sia nelle rotte API di…

### performance


**27. Le pagine che vendono si disegnano solo nel browser, e il preload della prima foto non serve a niente**

- Dove: `app/product/[id]/page.tsx:1 · app/search/page.tsx:1 · app/category/[slug]/page.tsx:2 · app/store/[id]/[slug]/page.tsx:1 · app/stores/page.tsx:1 · app/near/page.tsx:1 · components/ProductGrid.tsx:406`
- Cosa succede: CONFERMATO leggendo le prime righe dei sei file: tutte e sei le pagine commerciali aprono con 'use client'. Il server manda quindi un documento senza contenuto: il prodotto nasce solo dopo che il telefono ha scaricato il JavaScript, l'ha eseguito e ha fatto le sue chiamate a Supabase. A components/ProductGrid.tsx:406 le prime quattro foto hanno `priority={i < 4}`, ma quella marcatura serve a far scrivere a Next un…
- Come si ripara: Non riscrivere tutto: portare sul server SOLO il primo blocco visibile. Sulla scheda prodotto, un componente server che legge prodotto + negozio e li consegna già disegnati; recensioni, varianti e «simili» restano client. Stessa cosa per la prima schermata di ricerca e categoria. Reversibile una…

**28. Manca l'indice che serve al negoziante per aprire i suoi ordini**

- Dove: `migrations/119_radiografia_18_agosto.sql:853 · app/seller/orders/page.tsx:45-51 · app/seller/earnings/page.tsx:87 · app/seller/customers/page.tsx:45`
- Cosa succede: CONFERMATO cercando ogni CREATE INDEX su orders in tutte le migrazioni. Il lato CLIENTE ha il suo indice — `orders_user_created_idx (user_id, created_at DESC)`, migrations/119:853. Il lato NEGOZIANTE no: gli unici indici con seller_id in testa sono `orders_seller_status_idx (seller_id, delivery_status)` (011:100 e 036:67), che non aiuta l'ordinamento per data. Le migrazioni più recenti (124:446 e :449) hanno…
- Come si ripara: Una riga di migrazione: `CREATE INDEX IF NOT EXISTS orders_seller_created_idx ON public.orders (seller_id, created_at DESC);`. Costa pochi millisecondi in più a ogni ordine scritto e toglie l'ordinamento a ogni lettura. Esecuzione a @backend-dev, firma di Nicola perché tocca il database di…

**29. La pagina ordini del negoziante riscarica tutta la sua storia ogni trenta secondi**

- Dove: `app/seller/orders/page.tsx:41-70 · app/seller/orders/page.tsx:74`
- Cosa succede: CONFERMATO riga per riga. La query costruita a riga 45-51 fa `.eq('seller_id', …).order('created_at', desc)` e si porta dietro `order_items ( id, quantity )`, senza nessun `.limit()` né `.range()`. A riga 69 c'è `refetchInterval: 30_000`. Il filtro per stato («Da fare», «In consegna», «Completati») lavora nel browser a riga 74 su tutto l'elenco già scaricato. È lo stesso identico difetto che su /admin/orders è già…
- Come si ripara: Copiare la soluzione già scritta per /admin/orders: filtro di stato dentro la query (`.in('delivery_status', statiDelGruppo)`), `.range()` con 50 righe per pagina più un pulsante «Carica altri», e ricarica automatica da 30 a 60-120 secondi (gli ordini nuovi arrivano comunque con la notifica).…

**30. La dashboard del venditore scarica ogni ordine che ha mai ricevuto, per fare quattro somme**

- Dove: `app/seller/dashboard/page.tsx:78-89 · app/seller/customers/page.tsx:53 · app/seller/earnings/page.tsx:94`
- Cosa succede: CONFERMATO. La query legge sette colonne di TUTTI gli ordini del venditore: `.select('total_price, delivery_status, payment_status, application_fee_cents, shipping_cost, delivery_fee_cents, created_at').eq('seller_id', user.id)` e basta — nessun tetto, nessun filtro di data. Poi a riga 85-89 `metricheVenditore` gira quattro volte sullo stesso elenco (totale storico, oggi, sette giorni, trenta giorni). Le due pagine…
- Come si ripara: Due strade, la seconda è quella giusta. Rattoppo: `.gte('created_at', trentaGiorniFa)` più `.limit(1000)`, e il totale storico da un conteggio separato. Vera: una funzione SQL `seller_metrics(p_seller uuid)` che restituisce i quattro blocchi già sommati — il database somma migliaia di righe in…

**31. Trascinare il cursore del prezzo nella ricerca spara una richiesta a ogni scatto**

- Dove: `app/search/page.tsx:185-204 · app/search/page.tsx:56-71 · components/ProductGrid.tsx:87`
- Cosa succede: CONFERMATO. I due cursori del prezzo (righe 185-204) vanno da 0 a 500 con `step={5}`: cento scatti. Ogni `onChange` chiama `setMinPrice`/`setMaxPrice` senza nessuna attesa. Quei due valori entrano nella chiave della cache a components/ProductGrid.tsx:87 (`queryKeys.products.grid({ …, maxPrice, minPrice, … })`): chiave nuova, cache vuota, richiesta nuova a Supabase, subito. In più l'effetto di riga 56-71 dipende da…
- Come si ripara: Lo schema è già in casa (SearchBar.tsx:42-46): uno stato «in corso» per il cursore, che muove la manopola e il numero a schermo, e uno stato «assestato» che si aggiorna 250-300 millisecondi dopo l'ultimo movimento — solo quest'ultimo entra nella chiave della cache e nell'indirizzo. Poche righe,…

**32. «Carica altri prodotti» riscarica da capo anche quelli già a schermo, e fa sparire la griglia**

- Dove: `components/ProductGrid.tsx:84-89 · components/ProductGrid.tsx:126-129 · components/ProductGrid.tsx:316 · components/ProductGrid.tsx:453`
- Cosa succede: CONFERMATO. Il pulsante aumenta `pagine` (riga 453). Quel contatore entra nel tetto come moltiplicazione — `limit: (limit ?? 96) * pagine` nella chiave (riga 88) e `const tetto = (limit ?? 96) * pagine` con `q.limit(tetto)` (righe 127-128) — non come scostamento (`.range()`). Ho verificato con grep che nel file non compaiono né `placeholderData` né `keepPreviousData` né `useInfiniteQuery`. Quindi alla seconda…
- Come si ripara: Passare a `useInfiniteQuery` con `.range(inizio, fine)`: ogni pressione chiede solo il blocco successivo e i precedenti restano in memoria. Cambiamento minimo se si va di fretta: tenere `useQuery` e aggiungere `placeholderData: (prec) => prec` — non toglie il riscaricamento ma almeno non fa sparire…

**33. Il cron delle notifiche push fa tre viaggi al database per ogni singola notifica**

- Dove: `app/api/cron/send-push/route.ts:33-77 · lib/push/send.ts:51-60 · docs/crons.json`
- Cosa succede: CONFERMATO. Il cron prende fino a 100 notifiche in sospeso (riga 40, `.limit(100)`) e poi, dentro un ciclo `for` con tutti gli await in fila, per OGNI notifica: chiama la funzione `vuole_notifica` (riga 52), poi `sendPushToUser` che a lib/push/send.ts:52 legge le iscrizioni push di quella persona e le invia una per una in un altro ciclo sequenziale (riga 60), poi aggiorna la riga (riga 57 o 71). Almeno tre viaggi di…
- Come si ripara: Tre mosse, tutte dentro il file: ① leggere le preferenze di tutte le persone del lotto con una chiamata sola (una funzione che accetta l'elenco degli id, come già fa `product_rating_stats`); ② leggere le iscrizioni push di tutte con un solo `.in('user_id', elenco)`; ③ mandare le push a gruppi di 10…

**34. Il cron delle email fa quattro viaggi per ogni email spedita**

- Dove: `app/api/cron/send-emails/route.ts:78 · app/api/cron/send-emails/route.ts:98-140 · docs/crons.json`
- Cosa succede: CONFERMATO. Il lotto è di 50 righe (`claim_pending_emails`, riga 78). Poi `processBatch` cicla e per ogni riga, in fila e tutto atteso: lettura del profilo (`.from('profiles').select('id, full_name, email_marketing').eq('id', row.user_id).single()`), lettura dell'utente di autenticazione (`supa.auth.admin.getUserById`), invio a Resend (`sendEmail`), aggiornamento della riga. Quattro viaggi per email, 200 in fila per…
- Come si ripara: Leggere in un colpo solo i profili del lotto (`.in('id', elenco)`) e le email da autenticazione, poi spedire a gruppi di 5-10 in parallelo con `Promise.allSettled`, poi un solo aggiornamento per gli esiti riusciti e uno per i falliti. ATTENZIONE: il claim atomico di riga 78 è quello che protegge…

**35. Chi paga alla consegna aspetta che partano tutte le email prima di vedere la conferma**

- Dove: `app/api/orders/cod/route.ts:562-618 · lib/stripe/webhook/ordini.ts:404-450`
- Cosa succede: CONFERMATO. Dopo aver creato gli ordini, il ciclo `for (const c of comunicazioni)` di riga 563 fa per ogni negozio del carrello, uno dopo l'altro e tutti attesi: `insert` della notifica al negoziante (riga 565), `getUserById` per trovarne l'email (riga 578), `sendEmail` al negoziante (riga 587), `insert` della notifica al cliente (riga 597), lettura del nome negozio (riga 605), `sendEmail` al cliente (riga 616). Sei…
- Come si ripara: Copiare lo schema già scritto per la carta: raccogliere le comunicazioni, lanciarle in una funzione non attesa (`void avvisi.catch(...)`) e rispondere subito. Differenza reale da tenere presente: su Render il processo resta vivo dopo la risposta, quindi il non-atteso arriva a destinazione; in un…

**36. La pagina «negozi vicino a te» scarica ogni recensione di ogni negozio per farne la media**

- Dove: `app/near/page.tsx:44-52 · app/near/page.tsx:66-75 · app/stores/page.tsx:57 · migrations/052_perf_aggregation_rpcs.sql:26`
- Cosa succede: CONFERMATO. /near legge `store_reviews` prendendo `store_id, rating` per tutti i negozi, a blocchi di cento (`leggiInBlocchi`), senza nessun `.limit()`, e poi calcola medie e conteggi nel browser (righe 66-75). La pagina gemella /stores fa la stessa cosa nel modo giusto: `supabase.rpc('store_review_stats', { p_store_ids: storeIds })` a app/stores/page.tsx:57, funzione nata apposta in…
- Come si ripara: Sostituire il blocco `leggiInBlocchi` su `store_reviews` con `supabase.rpc('store_review_stats', { p_store_ids: storeIds })` e adattare il ciclo che riempie `reviewsByStore`, copiandolo pari pari da app/stores/page.tsx. La funzione è già concessa ai ruoli anon e authenticated (052:59): non serve…

### frontend-ux


**37. Sbagliare la password una volta blocca l'accesso: il gettone anti-bot non si rigenera**

- Dove: `components/Turnstile.tsx:38-113 · app/sign-in/page.tsx:66-104, 175-180 · app/sign-up/page.tsx:70-137`
- Cosa succede: Verificato: il componente Turnstile tiene `widgetId` in un ref interno, non espone né `reset()` né un handle (nessun `useImperativeHandle`, nessuna prop di reset), e il `render()` esce subito se il widget esiste già (`if (widgetId.current) return`). Nelle pagine di accesso e registrazione il gettone finisce in `captchaToken` e viene rimesso identico a ogni invio: `auth.signIn(email, password, { captchaToken })`…
- Come si ripara: Esporre il reset dal componente (`forwardRef` + `useImperativeHandle` con `reset()` che chiama `window.turnstile.reset(widgetId.current)`) e invocarlo in ogni ramo `catch` di `handleSubmit` in sign-in, sign-up e contatti, azzerando anche `captchaToken`. Aggiungere a `translateAuthError` il caso…

**38. Sul telefono il banner cookie copre il pulsante «Conferma ordine»**

- Dove: `app/checkout/page.tsx:968 · components/CookieBanner.tsx:75, 92 · components/MobileTabBar.tsx:48-66 · app/globals.css:124, 209`
- Cosa succede: Verificato: la barra di conferma mobile del checkout è `lg:hidden fixed inset-x-0 bottom-0 z-sticky` (checkout:968) e `--z-sticky` vale 20 (globals.css:124). Il banner cookie è `fixed inset-x-0 bottom-[var(--tabbar-height)] md:bottom-0 z-[100]` (CookieBanner:92). Su /checkout la tab bar è nascosta (MobileTabBar:48-56 include `pathname.startsWith('/checkout')`) e mette `body.senza-tabbar`, che azzera…
- Come si ripara: Sulla barra del checkout usare lo stesso schema di StickyAddToCart: `style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--altezza-banner-cookie, 0px))' }}`, e alzare di conseguenza il padding di fondo del contenitore (checkout:726).

**39. Il checkout ignora le promozioni attive: mostra il prezzo pieno e avvisa che «il prezzo è cambiato», poi il server addebita meno**

- Dove: `app/checkout/page.tsx:91-126, 198-215, 894-903 · app/api/orders/cod/route.ts:156, 249 · app/api/stripe/checkout/route.ts:127, 239 · components/ProductCard.tsx:52-56, 91`
- Cosa succede: Verificato: nel `queryFn` del checkout `priceMap` si riempie con `products.price`, cioè il prezzo PIENO (checkout:121-122), e ogni riga di carrello viene riscritta con quel valore (checkout:198-205). In tutto il file non compare nessuna chiamata a `fetchActiveDiscounts` (grep su checkout/page.tsx: solo `appliedCoupon.discount`, nessuna promo). I due server invece scontano davvero: `fetchActiveDiscounts` +…
- Come si ripara: Nel `queryFn` del checkout chiamare `fetchActiveDiscounts(supabase, ids)` e costruire `priceMap` con `discountedUnitCents(p.price, sconto)/100` — la stessa formula del server. Così `prezziCambiati` scatta solo su un rincaro vero e il totale mostrato è quello addebitato.

**40. Prodotto, ordine o negozio inesistente: il sito dice «problema di collegamento» e offre un «Riprova» che non potrà mai funzionare**

- Dove: `app/product/[id]/page.tsx:141-143, 288-311 · app/orders/[id]/page.tsx:104-110, 196-209 · components/store-sections/useStorePageData.ts:20-27 · app/store/[id]/page.tsx:40-65`
- Cosa succede: Verificato in tutti e tre i punti: la query fa `.eq('id', id).single()` seguito da `if (error) throw error` (product:142-143 · orders:104-109, con il commento #110 che dichiara proprio questa scelta · useStorePageData:25-26). In PostgREST `.single()` su zero righe non restituisce `data: null` ma l'errore PGRST116, quindi «non esiste / non è tuo / RLS lo nasconde» finisce nel ramo `isError` e i blocchi scritti sotto…
- Come si ripara: Passare a `.maybeSingle()` nelle tre query e lasciare `data === null` scorrere nei rami «non trovato» già scritti; in alternativa, tenendo `.single()`, intercettare `error.code === 'PGRST116'` e restituire `null` invece di lanciare.

**41. «Carica altri prodotti» svuota la griglia e riporta in cima**

- Dove: `components/ProductGrid.tsx:84-88, 316-333, 449-459`
- Cosa succede: Verificato: il pulsante fa `setPagine((n) => n + 1)` (riga 452) e `pagine` entra nella `queryKey` attraverso `limit: (limit ?? 96) * pagine` (riga 88). Chiave nuova = nessun dato in cache = `isLoading` vero, e la riga 316 sostituisce l'intera griglia con `<SkeletonGrid count={limit ?? 8} />`. Grep su tutto il file: nessun `placeholderData`, nessun `keepPreviousData`. I prodotti già visti spariscono, la pagina si…
- Come si ripara: Aggiungere `placeholderData: (prev) => prev` alla useQuery della griglia e usare `isFetching` per un indicatore sul solo pulsante («Caricamento…»), lasciando a video le card già caricate.

**42. Con i filtri attivi «Carica altri prodotti» non carica niente e non sparisce mai**

- Dove: `components/ProductGrid.tsx:124-128, 149, 440`
- Cosa succede: Verificato: quando è attivo uno dei tre filtri applicati nel browser (`onlyOpenStores || onlyPromo || minRating > 0`) la query chiede `Math.min(tetto * 4, 400)` righe (riga 128), ma la decisione di mostrare il pulsante confronta le righe grezze col solo tetto: `prods.length >= (limit ?? 96) * pagine` (riga 440), dove `prods` sono le righe della query prima del filtro nel browser (riga 149). Con 200 righe tornate e…
- Come si ripara: Estrarre `const chiesti = filtriNelBrowser ? Math.min(tetto * 4, 400) : tetto` e usarlo sia nel `.limit()` sia alla riga 440, nascondendo il pulsante quando `chiesti` ha toccato il tetto di 400. Meglio ancora: portare i tre filtri in SQL, così il cap sparisce.

**43. La ricerca dice «Nessun risultato» mentre i suggerimenti stanno ancora arrivando**

- Dove: `components/SearchBar.tsx:47-50, 76-91, 188-205`
- Cosa succede: Verificato: `const { data: suggestions = [] } = useQuery(...)` (riga 47) non prende `isLoading` né `isFetching`. Il pannello si apre appena `debounced.length >= 2` (riga 197) e finché la risposta non arriva `suggestions.length === 0` fa comparire «Nessun risultato per «pane»» (righe 199-205). Il round-trip può essere lungo: RPC `search_products_smart` + due query in parallelo, e in più un ripiego ILIKE in serie…
- Come si ripara: Prendere `isFetching` dalla useQuery, mostrare tre righe scheletro al posto del vuoto finché è vero, far comparire «Nessun risultato» solo con `!isFetching && suggestions.length === 0` e silenziare l'annuncio aria-live durante il caricamento.

**44. Ogni scheda prodotto apre per conto suo una verifica dell'utente: 96 schede, 96 verifiche in fila**

- Dove: `components/hooks/useProfile.ts:23-51 · components/ProductCard.tsx:65 · components/hooks/useFavorites.ts:15-19`
- Cosa succede: Verificato: `useProfile()` non è condiviso — è un hook con stato locale che in un `useEffect` per istanza chiama `supabase.auth.getUser()`, apre una `onAuthStateChange` e lancia `identify()`/`setSentryUser()` (useProfile:28-50). `ProductCard` lo chiama alla riga 65 solo per sapere `isSeller`/`isAdmin`. Una griglia da 96 card monta 96 volte tutto questo. Controllato nel pacchetto installato (@supabase/supabase-js…
- Come si ripara: Trasformare `useProfile` in una singola `useQuery` condivisa (chiave `queryKeys.profile.*`) che risolve l'utente con `getSession()`/`idUtenteInMemoria()` come fa `useFavorites`, e tenere `onAuthStateChange` + `identify()` in un solo provider montato una volta nel layout. Le card leggerebbero dalla…

**45. Il carrello mostra una spedizione che al checkout può raddoppiare, con la tariffa 4,90 scritta a mano**

- Dove: `app/cart/page.tsx:75-78, 114-116 · lib/constants.ts:6 · lib/shipping.ts:18-34 · app/checkout/page.tsx:408-428, 446`
- Cosa succede: Verificato: il carrello calcola `const freeShipping = total >= FREE_SHIPPING_THRESHOLD; const shippingCost = freeShipping ? 0 : 4.9` (cart:76-78) — numero letterale invece di `SHIPPING_PER_ORDER` (constants.ts:6) — una volta sola per tutto il carrello e con la soglia dei 30 € sul totale complessivo, anche quando i gruppi-negozio sono già costruiti poche righe sotto (cart:98-108, `platformDeliveryFee = groups.length…
- Come si ripara: Nel carrello importare `shippingForEuro` e calcolarla per gruppo-negozio (i gruppi ci sono già), passando le coordinate a null come fa il checkout finché non c'è un indirizzo: stessa funzione, stesso centesimo. Togliere il 4.9 letterale.

**46. Aprendo una conversazione compare «Conversazione non trovata» prima che i messaggi arrivino**

- Dove: `app/messages/[id]/page.tsx:68-84, 172-183`
- Cosa succede: Verificato: la pagina mostra `LoadingState` solo finché `userId` è nullo (riga 172). La query della conversazione parte quando `userId` è risolto (`enabled: !!userId`, riga 70) e finché non risponde `conversation` è `undefined`, quindi la riga 173 `if (!conversation)` rende subito «Conversazione non trovata — Torna ai messaggi». `isLoading` non viene mai preso dalla useQuery (riga 68: solo `data`). Il caricamento e…
- Come si ripara: Prendere `isLoading` e `isError` dalla useQuery, mostrare `LoadingState` finché `isLoading` è vero, riservare il blocco «non trovata» a `!isLoading && !conversation` e usare un `ErrorState` con Riprova per l'errore di rete.

**47. L'indirizzo scritto al checkout viene geolocalizzato e poi buttato: mappa dell'ordine senza destinazione e nessun tempo di arrivo**

- Dove: `app/checkout/page.tsx:479-524 · app/api/orders/cod/route.ts:278-286, 481-482 · lib/shipping-coordinate.ts:38-70 · app/orders/[id]/page.tsx:215-217, 231-244`
- Cosa succede: Verificato in tutta la catena: il browser, quando l'indirizzo non è uno salvato, chiama `/api/geocode` e mette lat/lng nel corpo della richiesta (checkout:481-498, 522-523); lo schema del server le accetta (`lat`/`lng` in `DeliverySchema`, cod/route.ts:47-48) ma non le legge mai. Le coordinate le ricava solo `coordinateDaIndirizziSalvati` (cod/route.ts:282-286), che confronta via/città/CAP con la tabella…
- Come si ripara: Una sola delle due strade: (a) togliere la geocodifica dal browser, se la fonte deve restare il database; (b) tenerla e farla rifare al server — quando non trova corrispondenza fra gli indirizzi salvati, il server chiama lui `/api/geocode` e scrive quelle coordinate su `delivery_lat/lng`, senza…

### accessibilita


**48. Al checkout i cinque riquadri che spiegano il blocco non vengono mai annunciati, e il pulsante di conferma sparisce dalla tastiera**

- Dove: `app/checkout/page.tsx:863,883,894,905,915,958,976 + components/checkout/OrderSummary.tsx:93`
- Cosa succede: VERIFICATO nel codice. I cinque riquadri d'errore di app/checkout/page.tsx stanno esattamente alle righe indicate — 863 (prodotti non più disponibili), 883 (disponibilità insufficiente), 894 (prezzo cambiato), 905 (varianti da scegliere), 915 (errore di caricamento) — e sono `<div>` normali: un grep su tutto il file non trova nessun `role="alert"`, nessun `aria-live`, nessun `role="status"`. Chi usa un lettore di…
- Come si ripara: ① `role="alert"` sui cinque riquadri di app/checkout/page.tsx (863, 883, 894, 905, 915) — stessa correzione già applicata a components/ui/Field.tsx:78 col commento #131. ② Non disabilitare il pulsante: tenerlo focusabile con `aria-disabled="true"` e un `onClick` che porta il fuoco sul primo…

**49. Il tour di benvenuto copre lo schermo al primo accesso senza dire di essere un dialogo e senza via d'uscita da tastiera**

- Dove: `components/BuyerOnboardingTour.tsx:75-99 (montato in app/layout.tsx:133)`
- Cosa succede: VERIFICATO. components/BuyerOnboardingTour.tsx:75 è esattamente `<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm …">`, aperto da un `setTimeout(…, 1500)` (riga 55) al primo accesso di un cliente autenticato non ancora onboardato, ed è montato nel layout radice (app/layout.tsx:133), quindi su qualunque pagina. Un grep su tutto il file trova un solo attributo ARIA: l'`aria-label="Chiudi tour"` del…
- Come si ripara: Al `<div>` di riga 75 aggiungere `role="dialog" aria-modal="true" aria-labelledby` sul titolo di riga 87, e chiamare `useBottomSheetA11y(open, pannelloRef, nessunAvvio, close)` come fanno già MobileAccountSheet.tsx:49 e SupportChatModal.tsx:37 (percorso corretto:…

**50. Nel carrello la quantità cambia in silenzio: si preme «+» e non viene annunciato niente**

- Dove: `app/cart/page.tsx:194,211 (confronto: app/product/[id]/page.tsx:840)`
- Cosa succede: VERIFICATO, riga esatta. app/cart/page.tsx:194 è `<span className="w-8 text-center font-semibold">{item.quantity}</span>`, in mezzo ai due pulsanti «−» e «+» (righe 187-201, entrambi con `aria-label` corretto). Un grep su tutto il file non trova nessun `aria-live`, nessun `role="status"`, nessun `<output>`: dopo il clic il lettore di schermo non ha modo di sapere che il numero è cambiato né che il totale di riga si…
- Come si ripara: Sostituire lo `<span>` di riga 194 con `<output aria-live="polite" aria-atomic="true" className="w-8 text-center font-semibold">{item.quantity}</output>`: è copia-incolla da app/product/[id]/page.tsx:840. Aggiungere un `<p className="sr-only" role="status" aria-live="polite">` accanto al riepilogo…

**51. Il campo dove il fattorino scrive i contanti incassati non ha nome, e il pannello non è dichiarato dialogo**

- Dove: `components/rider/CashConfirmDialog.tsx:101,109-117`
- Cosa succede: VERIFICATO, righe esatte. components/rider/CashConfirmDialog.tsx:109 è `<label className="mt-4 block text-sm font-medium text-ink-700">Importo incassato (€)</label>` e la riga 110 apre un `<input type="number" step="0.01">`: l'etichetta non ha `htmlFor`, l'input non ha `id`, e l'input non è annidato dentro l'etichetta. Non sono collegati: per un lettore di schermo quel campo è un numero senza nome. Anche il…
- Come si ripara: Sostituire le righe 109-117 con la primitiva già esistente `Input` di components/ui/Field.tsx: `<Input label="Importo incassato (€)" type="number" step="0.01" value={amount} onChange={…} hint={`Importo previsto: €${(expectedCents/100).toFixed(2)}`} />` — collega da sola label, `aria-describedby` e…

### qa-flussi


**52. Due invii dello stesso ordine in contanti creano due ordini: la chiave si scrive troppo tardi**

- Dove: `app/api/orders/cod/route.ts:122-136 (lettura) e 642-647 (scrittura)`
- Cosa succede: CONFERMATO. Il controllo legge `cod_checkout_attempts` a riga 122-136, ma la riga viene inserita solo a riga 643-646, dopo la creazione di tutti gli ordini: in mezzo ci sono il caricamento prodotti, la riserva atomica dello stock, il claim del coupon, l'addebito del wallet e le insert degli ordini. Due richieste con la stessa chiave a pochi millisecondi passano entrambe la lettura (la riga non esiste ancora per…
- Come si ripara: Invertire l'ordine: inserire la riga `cod_checkout_attempts` (chiave + user, `order_ids` vuoto) PRIMA di creare gli ordini; se l'insert dà 23505, attendere e restituire gli ordini della riga esistente; aggiornare `order_ids` alla fine. Prova che gira: due chiamate concorrenti con la stessa…

**53. Il prezzo in promozione sparisce alla cassa: il carrello dice 7 €, il checkout dice 10 €**

- Dove: `app/checkout/page.tsx:93-124 (priceMap), 195-207 (sovrascrittura), 209-217 (prezziCambiati) · confronto con app/api/orders/cod/route.ts:156, 249 e app/api/stripe/checkout/route.ts:127, 239`
- Cosa succede: CONFERMATO. La scheda prodotto mette nel carrello il prezzo SCONTATO (`components/ProductCard.tsx:91`, `addToCart({... price: bigPrice ...})`, correzione 109). Il checkout rilegge i prezzi dal database (correzione 114) ma dalla sola colonna `products.price`, cioè il prezzo PIENO (page.tsx:94-95 e 120-121): la RPC `product_active_discounts` non viene mai chiamata — verificato con grep, in tutto il progetto lato…
- Come si ripara: Chiamare `fetchActiveDiscounts` anche nella query del checkout (è già una RPC unica per tutto il carrello) e costruire `priceMap` con `discountedUnitCents(p.price, sconto)/100`. Prova che gira: prodotto con promo attiva −30% → il totale della pagina checkout deve coincidere al centesimo con…

**54. Ogni consegna in contanti fa suonare l'allarme «l'incasso non quadra»**

- Dove: `app/rider/orders/[id]/page.tsx:445 · components/rider/CashConfirmDialog.tsx:29, 117 · app/api/rider/cash-confirm/route.ts:94-95, 180-190, 212-221, 276-283`
- Cosa succede: CONFERMATO. Il dialogo riceve `expectedCents={Math.round(Number(order.total_price) * 100)}` (page.tsx:445), pre-riempie il campo con quel valore (CashConfirmDialog.tsx:29) e scrive sotto «Importo previsto: €35,00» (riga 117). Il server invece si aspetta il contante AL NETTO del compenso trattenuto: `expectedCents = total_price*100 − compensoTrattenuto(order)` (route.ts:94-95), dove `compensoTrattenuto` vale…
- Come si ripara: Una sola definizione. Leggere `rider_fee_cents` nella query di app/rider/orders/[id]/page.tsx:84-93 (oggi non è nemmeno selezionato) e passare `expectedCents = total_price*100 − rider_fee_cents`, con etichetta «Contante da riportare (hai già trattenuto €3,00 di compenso)». Meglio: esportare…

**55. Il credito MyCity non torna indietro quando l'ordine viene annullato**

- Dove: `migrations/062_atomic_stock_reservation.sql:87-111 e 113-134 · confronto con app/api/admin/orders/[id]/cancel/route.ts:106-115 e app/api/cron/expire-stale-orders/route.ts:111-122`
- Cosa succede: CONFERMATO. L'ordine in contanti addebita il credito con `wallet_debit` alla creazione (cod/route.ts:404-411) e scrive quanto ha speso in `wallet_applied_cents` (riga 461). Le due funzioni di annullo — quella del cliente e quella del negoziante — non chiamano mai `wallet_credit`: verificato leggendo il corpo di entrambe e con grep su tutte le migrazioni. Il confronto è impietoso: la rotta admin lo fa…
- Come si ripara: In entrambe le funzioni SQL, dopo l'UPDATE a CANCELED: leggere `wallet_applied_cents` e, se maggiore di zero, `PERFORM public.wallet_credit(v_buyer_id, v_wallet_cents, 'order_canceled', p_order_id::text)`. Prova che gira: ordine COD con 15 € di credito applicato → rifiuto del negozio → il saldo del…

**56. Il fattorino legge tre compensi diversi, e nessuno dei tre è quello che prende davvero**

- Dove: `app/rider/orders/[id]/page.tsx:420 e 464 · app/rider/page.tsx:114, 184-189, 370, 385, 438`
- Cosa succede: CONFERMATO. Il compenso è fisso dal 20/8 — `COMPENSO_RIDER_CENTS = 300` (lib/constants.ts:48) — e vive nella colonna `rider_fee_cents`, staccato da quanto paga il cliente per la spedizione (lib/shipping.ts:40-64). L'app del fattorino continua a mostrare `shipping_cost`: «Il tuo compenso {formatPrice(order.shipping_cost || 0)}» (orders/[id]:420), «Hai guadagnato {formatPrice(order.shipping_cost || 0)}» (riga 464), e…
- Come si ripara: Usare `compensoConsegnaEuro(order)` (già esistente, con ripiego su `shipping_cost` per gli ordini precedenti la migrazione 111) in tutti e quattro i punti, selezionando `rider_fee_cents` anche nelle query che non lo prendono. Prova che gira: ordine da 35 € con spedizione gratuita e…

**57. La pagina delle rimesse chiede al fattorino più contante di quello che deve**

- Dove: `app/admin/cod-remittance/page.tsx:35, 45-51, 63 · confronto con app/api/rider/cash-confirm/route.ts:212-221`
- Cosa succede: CONFERMATO. Riga 63: `const cents = Math.round(Number(o.total_price) * 100) - Math.round(Number(o.shipping_cost ?? 0) * 100)`. Ma quello che il fattorino trattiene davvero è `rider_fee_cents` (300 fissi), non la spedizione pagata dal cliente — e la query di riga 45-51 `rider_fee_cents` non lo seleziona nemmeno. Sopra i 30 € `shipping_cost` è zero, quindi la pagina chiede il totale pieno. Il commento a riga 35…
- Come si ripara: Selezionare `rider_fee_cents` e `pickup_in_store` nella query di riga 45-51 e calcolare `total_price*100 − compensoTrattenuto(o)`, riusando la funzione condivisa. Aggiornare anche il commento di riga 35 e il sottotitolo della pagina. Prova che gira: due ordini consegnati, uno sopra e uno sotto i 30…

**58. La conferma della rimessa paga il negozio anche per il contante che nessuno ha mai registrato**

- Dove: `migrations/097_cod_remittance.sql:66-74 · migrations/083_notifications_best_effort_in_order_rpc.sql:81-82 (verify_delivery_code) · app/api/cron/release-payouts/route.ts:155-162`
- Cosa succede: CONFERMATO. `confirm_cod_remittance` porta a HELD tutti gli ordini del fattorino filtrando su rider, `payment_method='cod'`, `delivery_status='DELIVERED'`, `payout_status='AWAITING_REMITTANCE'` e data: `cash_confirmed_at` non è nella WHERE. E un ordine può arrivare a DELIVERED senza mai passare dal riquadro dell'incasso: `verify_delivery_code` (ultima versione in migrazione 083, righe 81-82) scrive…
- Come si ripara: Aggiungere `AND cash_confirmed_at IS NOT NULL` alla WHERE della UPDATE, e far tornare alla funzione anche il conto degli ordini SALTATI perché senza conferma, così l'admin li vede invece di non saperlo. In parallelo: bloccare `verify_delivery_code` sugli ordini in contanti finché l'incasso non è…

**59. Il giro che scade i carrelli può rimettere in vendita merce già venduta**

- Dove: `app/api/cron/expire-checkouts/route.ts:41-45, 95-107, 113-134 · confronto con lib/stripe/webhook/ordini.ts:465-477`
- Cosa succede: CONFERMATO. Il cron legge i `pending_checkouts` in PENDING scaduti (righe 41-45), poi aggiorna a EXPIRED con `.update({status:'EXPIRED'}).in('id', ids)` e basta (righe 98-101): nessuna condizione sullo stato, nessun `.select()` che dica quali righe ha davvero rivendicato. Poi ripristina la merce e libera il coupon per OGNI candidato letto (righe 113-134). Il gemello nel webhook fa l'opposto, con un commento…
- Come si ripara: Rivendicare come fa il webhook: `.update({status:'EXPIRED'}).in('id', ids).eq('status','PENDING').select('id, groups, coupon_code')` e ripristinare merce e coupon SOLO per le righe effettivamente restituite. Prova che gira: due esecuzioni concorrenti sullo stesso carrello scaduto devono chiamare…

**60. Le due strade che creano gli ordini non hanno nessuna prova che le percorra fino in fondo**

- Dove: `tests/e2e/08-checkout-and-flows.spec.ts:1-27 · tests/unit/ (114 file, nessuno sull'idempotenza contanti)`
- Cosa succede: CONFERMATO. I test end-to-end dichiarano il limite in cima al file: «Smoke test: flow critici buyer (no checkout completo, serve auth+DB)». Le prove verificano che la pagina si carichi col carrello vuoto e che lo step indicator si veda: nessun percorso arriva a un ordine creato, né in contanti né con carta. Sui test unitari: `tests/unit/` ha 114 file, e `orders/cod` è toccato da due soli…
- Come si ripara: Tre prove minime, in ordine di valore: ① idempotenza contanti — due POST con la stessa chiave = un solo ordine; due POST con la stessa chiave a distanza di tempo = due ordini; ② quadratura del totale — con una promozione attiva, il totale calcolato dalla pagina deve coincidere col `totalCents` di…

### api-backend


**61. Il corpo della richiesta si carica tutto in memoria senza tetto sulle rotte che ricevono foto: basta un utente per far cadere l'istanza**

- Dove: `app/api/vision/extract-products/route.ts:177 (e extract-product/route.ts:220, seller/site/route.ts:41, stripe/checkout/route.ts:95, orders/cod/route.ts:92)`
- Cosa succede: Verificato. `lib/api/corpo.ts` esiste apposta (fix #180) e legge il corpo a pezzi fermandosi davvero al limite, ma è usato solo in 3 rotte: image/remove-bg:58, kyc/upload-document e track:108. `vision/extract-products` accetta fino a 12 immagini base64 con `z.string().min(1)` — nessun massimo sulla stringa (riga 136) — e legge con un `await req.json()` nudo alla riga 177. Il controllo di dimensione…
- Come si ripara: Sostituire `await req.json()` con `await jsonConTetto(req, N)` in tutte le rotte che ricevono un corpo, con N dimensionato per rotta (meglio ancora: abbassare MAX_IMAGES o passare al caricamento su storage con URL firmato invece del base64 in linea; 2 MB per le rotte JSON dei soldi, 1 MB per…

**62. Le chiamate al servizio di rimozione sfondo non hanno scadenza: un fornitore che si impianta blocca la rotta per minuti**

- Dove: `lib/bg-removal/index.ts:45 (remove.bg) e :89 (Photoroom)`
- Cosa succede: Verificato con una ricerca su tutto il progetto: queste due `fetch` verso api.remove.bg e image-api.photoroom.com sono le uniche chiamate uscenti senza `AbortSignal.timeout()`. Tutte le altre ce l'hanno e lo dichiarano nel commento: lib/captcha.ts:41, lib/kyc/providers.ts:58/77/109 («timeout obbligatorio — un hang upstream non deve bloccare il worker»), lib/rate-limit.ts:130, lib/analytics/server.ts:76,…
- Come si ripara: Aggiungere `signal: AbortSignal.timeout(30_000)` a entrambe le fetch (30 s è generoso: il fornitore normale risponde in 2-5 s) e trattare l'AbortError come `BgRemovalUpstreamError`, così il venditore riceve un 502 leggibile invece di aspettare. Meglio: estrarre `BG_FETCH_TIMEOUT_MS` accanto a…

**63. Il pannello delle rimesse contanti chiede al fattorino 3 euro in più su ogni ordine sopra i 30 euro**

- Dove: `app/admin/cod-remittance/page.tsx:60-63 (a fronte di app/api/rider/cash-confirm/route.ts:94-95 e :213-222)`
- Cosa succede: Verificate tutte e due le incoerenze, e verificati i numeri che le rendono vere. ① Il pannello calcola l'importo da rimettere come `total_price - shipping_cost` (riga 63). Il compenso che il fattorino trattiene davvero è `compensoTrattenuto` (cash-confirm/route.ts:213-222): `rider_fee_cents` con ripiego su `shipping_cost`. E `rider_fee_cents` è FISSO a 300 centesimi (lib/constants.ts:48 `COMPENSO_RIDER_CENTS = 300`,…
- Come si ripara: Esportare `compensoTrattenuto` e `giornoLocale` da un punto unico (oggi vivono dentro app/api/rider/cash-confirm/route.ts) e usarle anche nel pannello: `cents = total_price*100 - compensoTrattenuto(o)` e `date = giornoLocale(new Date(o.delivered_at))`, aggiungendo `rider_fee_cents` e…

**64. L'email di ciclo di vita può partire due volte: la scrittura che dice «inviata» non viene controllata e la prenotazione scade dopo 15 minuti**

- Dove: `app/api/cron/send-emails/route.ts:132-134 (+ migrations/085_email_queue_real_claim.sql:33)`
- Cosa succede: Verificato. `claim_pending_emails` è una prenotazione a tempo: ripesca le righe con `claimed_at < now() - interval '15 minutes'` (migrations/085:33). La chiusura del lavoro è l'UPDATE di `sent_at` alla riga 134 e il suo esito NON viene letto (`await supa.from('email_queue').update({...})`, senza `const { error }`); stessa cosa per i tre UPDATE di `cancelled_at` alle righe 104, 114, 121. Il lotto è di 50 righe (riga…
- Come si ripara: Leggere l'esito dell'UPDATE di `sent_at` e, se fallisce, registrarlo come errore grave (l'email è uscita e il registro non lo sa) invece di ignorarlo; stessa cosa sui tre `cancelled_at`. Portare la prenotazione a un tempo coerente col lavoro: abbassare il lotto (p_max 10-15), o alzare la…

### ai-endpoints


**65. Il tetto di spesa AI non vede il canale che spende di più in un colpo solo**

- Dove: `lib/ai/batch.ts:51-66 (usato da app/api/ai/catalog-batch/start/route.ts:97)`
- Cosa succede: CONFERMATO. Il circuit breaker vive solo dentro runMessage: `_checkAiBudget` alla riga 161 di lib/ai/run.ts, `_recordAiCost` dopo, e l'unica riga `logger.spesa('ai_usage')` di tutto il progetto è run.ts:210 (verificato con grep: nessun altro uso). submitBatch chiama `client.messages.batches.create` direttamente e non passa da runMessage. Grep su app/api/ai/catalog-batch/status/route.ts e lib/ai/batch.ts: zero…
- Come si ripara: Far passare submitBatch dagli stessi due ganci: `_checkAiBudget` prima della create, e — al recupero dei risultati in catalog-batch/status — stima con estimateCostEur sui token del batch, poi `_recordAiCost` + `logger.spesa`. Servirà esportarli da run.ts. Prova: mock che porta il budget oltre…

**66. Se il modello è giù, applicare una modifica risponde 500 muto invece di un messaggio**

- Dove: `app/api/ai/catalog-apply/route.ts:85-92; app/api/ai/catalog-create/route.ts:74-80; app/api/ai/catalog-create-bulk/route.ts:87-93`
- Cosa succede: CONFERMATO su tutte e tre. Le chiamate a classifyProductPolicy non sono dentro nessun try/catch, e ho verificato che il wrapper non ne ha uno: lib/api/middleware.ts:139-149 (`withSellerAuth`) fa `return handler(...)` nudo. classifyProductPolicy passa da runMessage, che lancia AiConfigError (chiave assente) o AiCallError con lo status estratto — e run.ts:113-116 lancia AiCallError(503) anche quando il budget…
- Come si ripara: Copiare il blocco di description/route.ts:86-96 nelle tre rotte. In catalog-create-bulk gestire l'errore DENTRO il ciclo, aggiungendo il prodotto a `scartati` con motivo «controllo non disponibile» invece di far cadere la richiesta.

**67. Le foto arbitrarie rientrano dalle due chat e da «Migliora tutto»**

- Dove: `app/api/ai/product-chat/route.ts:214-216; app/api/ai/catalog-chat/route.ts:192-194; app/api/ai/improve-product/route.ts:240-242`
- Cosa succede: CONFERMATO. lib/ai/productContext.ts:30-51 definisce `fotoDaHostAmmesso` (solo *.supabase.co, placehold.co, images.pexels.com) e `sanitizeImageUrls`, usati da catalog-create:65, catalog-create-bulk:81 e da tutto ciò che passa da buildProductContext (seo, translate, variants, diagnose, answer-qa). Queste tre rotte invece filtrano gli `imageUrls` che arrivano dal CORPO della richiesta col vecchio controllo…
- Come si ripara: Sostituire il filtro locale con `sanitizeImageUrls(body.imageUrls, MAX_IMAGES)` in tutte e tre, e usarlo anche su `p.images` in catalog-chat:280. Prova: POST a /api/ai/product-chat con un imageUrl su host esterno, e si pretende che nessun blocco immagine finisca nei `messages` passati a runMessage.

**68. Due rotte si riscrivono a mano il costruttore di contesto e perdono tutti i tagli anti-costo**

- Dove: `app/api/ai/improve-product/route.ts:236-283; app/api/ai/product-chat/route.ts:211-243`
- Cosa succede: CONFERMATO. buildProductContext (lib/ai/productContext.ts:58-79) applica tre tagli: `attributeSchema.slice(0, 40)`, `topCategories.slice(0, 30)` (#201) e il JSON del prodotto a 4000 caratteri (🟠-16). Le due rotte non lo usano: rileggono `body.product`, `body.attributeSchema`, `body.topCategories` dal corpo e li serializzano interi — `JSON.stringify(product, null, 2)` (product-chat:226, improve-product:262),…
- Come si ripara: Far passare entrambe da buildProductContext (accetta già `lead` per la parte specifica, come fa diagnose per l'economia del prezzo). Dove la struttura non combacia, applicare almeno gli stessi tre `.slice()`/cap alle stesse soglie (40 / 30 / 4000 caratteri).

**69. Testo libero che arriva al modello senza passare dal filtro, contro quello che dice il filtro stesso**

- Dove: `app/api/ai/catalog-chat/route.ts:186-190; app/api/ai/copilot/route.ts:84-85; app/api/ai/voice-product/route.ts:63-64`
- Cosa succede: CONFERMATO con grep su tutto il progetto: `assertSafeText` compare SOLO in description/route.ts:82 e product-chat/route.ts:202. lib/ai/moderation.ts:21-24 dichiara «Se una rotta nuova accetta testo libero o pubblica una scheda, passa di qui: la prova in tests/unit/il-filtro-e-collegato.test.ts diventa rossa se qualcuno stacca uno di questi collegamenti» — ho letto quel test: costruisce richieste solo verso…
- Come si ripara: Collegare assertSafeText all'ultimo messaggio in catalog-chat, all'`instruction` in copilot e al `transcript` in voice-product, con la stessa gestione errori di description/route.ts:86-96. Poi estendere il test a tutte e cinque le rotte, così staccarne una diventa rosso davvero.

**70. Nessun tetto sul corpo delle richieste AI, e il tetto esiste già nel progetto**

- Dove: `tutte le rotte in app/api/ai/ (es. description/route.ts:51, improve-product/route.ts:232, catalog-batch/start/route.ts:39)`
- Cosa succede: CONFERMATO. lib/api/corpo.ts:1-13 è stato scritto per il difetto #180 proprio perché `req.json()` carica tutto in memoria e il vecchio controllo si fidava di `content-length`. Grep su tutto il progetto: `jsonConTetto` è usato in due sole rotte (app/api/image/remove-bg/route.ts:58 e app/api/track/route.ts:108) — la segnalazione ne citava tre, ma la sostanza tiene: nessuna delle 18 rotte AI che leggono JSON lo usa,…
- Come si ripara: Sostituire `await req.json()` con `await jsonConTetto(req, N)` nelle rotte AI, con N dimensionato al contenuto atteso (64 KB per description/seo/translate/voice, 512 KB per le chat e improve-product che portano storia e schede), rispondendo invalidRequest quando torna `undefined`.

**71. Il copilot prepara 200 modifiche ma l'apply ne accetta 60 all'ora, e le altre spariscono in silenzio**

- Dove: `app/api/ai/copilot/route.ts:71 (MAX_CHANGES=200) · app/api/ai/catalog-apply/route.ts:31 (max 60/ora) · components/seller/CatalogCopilot.tsx:104-112`
- Cosa succede: CONFERMATO leggendo i tre punti. copilot restituisce fino a 200 voci in `changes`. La UI le applica una per una in un ciclo chiamando /api/ai/catalog-apply, con `catch { /* salta il singolo fallito, continua */ }` — un catch vuoto che non distingue il 429 da nient'altro. catalog-apply ha `rateLimitAsync({ key: ai-catalog-apply:<user>, max: 60, windowMs: 60*60_000 })`. Dalla 61ª chiamata in poi tutte tornano 429 e…
- Come si ripara: Nel ciclo della UI distinguere il 429 dagli altri errori, fermarsi al primo e dire quanti e quali prodotti restano. Meglio ancora: una rotta di apply massivo che risolve gli N patch in una sola richiesta, con un solo controllo di rate limit e un solo giro di moderazione sui campi testuali.

### dati-analytics


**72. Google Analytics non ha mai ricevuto la riparazione fatta per PostHog: gli manca il fatturato di chi chiude la scheda**

- Dove: `lib/analytics/events.ts:143-178 (ga('purchase')) · lib/analytics/server.ts:54-77`
- Cosa succede: CONFERMATO. L'evento GA4 `purchase` vive solo dentro trackOrderPlaced (lib/analytics/events.ts:165), che gira nel browser. contaAcquisto in lib/analytics/server.ts manda una sola fetch, all'endpoint PostHog (riga 54), e non tocca GA4. Quindi il buco che il commento #208 in cima a server.ts dichiara chiuso — il cliente che paga con carta e non rientra su /orders — resta aperto per GA4.
- Come si ripara: Mandare l'acquisto a GA4 dal server con il Measurement Protocol, dalla stessa lib/analytics/server.ts, usando `transaction_id: orderId` (GA4 lo usa per non contare due volte lo stesso acquisto). Finché non c'è, dichiararlo nel cruscotto: su GA4 il fatturato è una sotto-stima e la verità sono gli…

**73. Lo stesso carrello prende quattro identificativi diversi a seconda di chi manda l'evento**

- Dove: `app/checkout/page.tsx:548-553 vs app/api/orders/cod/route.ts:634 · app/orders/page.tsx:127-133 vs lib/stripe/webhook/ordini.ts:400`
- Cosa succede: CONFERMATO leggendo i quattro punti. `checkout_id` serve a tenere insieme gli ordini nati dallo stesso carrello (commento in lib/analytics/events.ts:150-153). Contrassegno: il browser passa `carrelloId = createdOrders[0]` (id del primo ordine), il server passa `chiaveTentativo ?? c.orderId` (chiave di idempotenza del tentativo). Carta: il browser passa `righe[0].id`, il server passa `pendingCheckoutId`. Quattro…
- Come si ripara: Decidere UN valore — la chiave del tentativo di checkout, che esiste prima degli ordini — farla scrivere dal server sulla riga dell'ordine e farla leggere da lì a entrambi i percorsi, invece di ricalcolarla in quattro posti. Prova che deve diventare rossa: un test che crea un carrello a due negozi…

**74. Il tasso di conversione mostrato al negoziante divide mele per pere**

- Dove: `app/seller/analytics/page.tsx:95 e 104 · components/ProductViewTracker.tsx:51`
- Cosa succede: CONFERMATO. La conversione è `orders30 / views30 * 100` (riga 104). Il denominatore views30 conta le righe di `product_views`, scritte solo con consenso: components/ProductViewTracker.tsx:51 esce con `if (!hasConsent('analytics')) return`. Il numeratore `orders30 = orders.length` (riga 95) conta le righe della tabella `orders`, dove nessun cancello di consenso esiste — e non filtra nulla, quindi include annullati e…
- Come si ripara: Portare numeratore e denominatore sulla stessa popolazione: contare le visite in forma aggregata e non identificante (nessun cookie, nessun identificativo persistente — un contatore per prodotto e ora), che non richiede consenso. Nel frattempo scrivere sotto il numero quanto vale il campione. E…

**75. Il negozio vede fra i suoi ordini anche quelli annullati e mai pagati**

- Dove: `app/seller/analytics/page.tsx:95-96 e 102-103 · lib/metriche-venditore.ts:36-41`
- Cosa succede: CONFERMATO. Nella stessa pagina convivono due definizioni di «ordine». Il fatturato passa da metricheVenditore, che conta solo pagati e non annullati (lib/metriche-venditore.ts:37-41: payment_status PAID o PARTIALLY_REFUNDED e delivery_status ≠ CANCELED). Le schede «Ordini 30gg» e «Ordini 7gg» invece sono `orders.length` e `orders.filter(created_at >= since7).length`, cioè tutte le righe lette dalla query, filtrata…
- Come si ripara: `const orders30 = orders.filter(ordineContaNelFatturato).length`, idem per orders7. Se serve anche il totale grezzo, va su una riga sua con un nome diverso («ordini ricevuti» vs «ordini validi»). Prova che deve diventare rossa: un test su un insieme che contiene un CANCELED e un non pagato, che…

**76. Il funnel dell'admin conta come primo ordine anche un pagamento mai riuscito**

- Dove: `app/admin/funnel/page.tsx:71-79 e 96-107`
- Cosa succede: CONFERMATO. La query degli ordini seleziona `user_id, created_at, delivery_status` ed esclude solo `.neq('delivery_status', 'CANCELED')`: payment_status non è né selezionato né filtrato. Un ordine con carta rifiutata o rimasto in attesa non è annullato, quindi entra nell'orderMap e fa scattare firstOrderEver e firstOrderWithin7d (righe 104-107). È la terza definizione di «ordine» dentro lo stesso prodotto, dopo…
- Come si ripara: Aggiungere payment_status alla select e riusare `ordineContaNelFatturato` di lib/metriche-venditore.ts anche qui, così la definizione di ordine resta una sola in tutto il prodotto; poi scriverla nel glossario dei KPI e agganciarci un test che fallisce se una delle tre pagine se ne discosta.

**77. L'indirizzo della pagina che finisce in PostHog è monco su ogni singola visita**

- Dove: `lib/analytics/posthog.tsx:158-159 e 167-171`
- Cosa succede: CONFERMATO, e verificato dentro il pacchetto installato, non dedotto. Il codice emette `ph.capture('$pageview', { $current_url: url })` dove url è `pathname + '?' + searchParams`, cioè un percorso relativo senza schema né dominio. In posthog-js 1.393.0 (node_modules/posthog-js, sorgente nella source map) calculateEventProperties fonde così: `properties = extend({}, infoProperties, this.persistence.properties(),…
- Come si ripara: Non passare $current_url a mano: `ph.capture('$pageview')` e basta, la libreria lo compila giusto (vale sia alla riga 159 sia alla 169). Se serve tenere il percorso in un campo proprio, usare un nome non riservato (`percorso`). Prova che deve diventare rossa: un test che monta il provider con una…

**78. Le due letture che alimentano i cruscotti si fermano a mille righe senza dirlo**

- Dove: `app/admin/funnel/page.tsx:58-62 · app/seller/analytics/page.tsx:61-65`
- Cosa succede: CONFERMATO. Nessuna delle due query ha `.range()` o `.limit()`, e PostgREST taglia in silenzio alla soglia del progetto (mille righe di default su Supabase). Funnel: `from('profiles').select('id, created_at').eq('role','buyer').gte('created_at', daQuando)`. Pagina venditore: `from('product_views').select('product_id, viewed_at').in('product_id', productIds).gte('viewed_at', since30)`. Nello stesso file del funnel la…
- Come si ripara: Paginare le due letture (ciclo con `.range(offset, offset+999)` finché tornano righe piene) oppure spostare l'aggregazione nel database con una funzione, come già fa `trending_product_ids_24h` in migrations/052. Se si tiene il tetto, va scritto a schermo («campione, non totale»). Prova che deve…

**79. Dietro Cloudflare il sito legge l'indirizzo sbagliato e butta via le visite**

- Dove: `lib/rate-limit.ts:168-199 (getClientIp) · app/api/track/route.ts:97-102`
- Cosa succede: CONFERMATO nel codice. getClientIp risale la catena x-forwarded-for scartando `TRUSTED_PROXY_HOPS` salti, che vale 1 di default (lib/rate-limit.ts:174). Ho verificato con grep su tutto il repo: quella variabile non compare da nessuna altra parte — non è dichiarata né in render.yaml né altrove, quindi resta 1. Ma README.md:14 dichiara «DNS: Netsons + Cloudflare proxy», cioè almeno due salti davanti a Render: con un…
- Come si ripara: Leggere `cf-connecting-ip` per prima cosa in getClientIp, con x-forwarded-for come ripiego, e dichiarare TRUSTED_PROXY_HOPS=2 in render.yaml. Separatamente contare gli scarti del freno (un contatore, o almeno una riga di log campionata): una misura persa in silenzio non è misurabile. Prova che deve…

### deploy-sre


**80. Il rilascio parte prima che la CI abbia finito: un test rosso finisce in produzione lo stesso**

- Dove: `render.yaml:43 (`autoDeploy: true`); .github/workflows/deploy-dopo-ci.yml:44-55`
- Cosa succede: CONFERMATO. render.yaml:43 ha `autoDeploy: true` e lo stesso commento sopra la riga lo dichiara «DECISIONE APERTA (serve Nicola)». Render pubblica quindi a ogni push su `main` senza guardare la CI: i due corrono in parallelo. Il rilascio controllato esiste ed è scritto bene (deploy-dopo-ci.yml parte solo su `workflow_run.conclusion == 'success'` di CI), ma è inerte: il primo passo verifica…
- Come si ripara: Due cose insieme: `autoDeploy: false` in render.yaml e il segreto RENDER_DEPLOY_HOOK (Render → servizio → Settings → Deploy Hook). Da quel momento l'unica strada per la produzione è la CI verde. 🔴: prepara e firma Nicola.

**81. Un lavoro periodico che non è MAI partito non viene segnalato: il freno anti-silenzio è disinnescato**

- Dove: `app/api/cron/operational-alerts/route.ts:256; lib/cron-health.ts:50-72; tests/unit/cron-health.test.ts:22-25`
- Cosa succede: CONFERMATO riga per riga. Il chiamante è `staleCrons((heartbeats ?? []) as CronHeartbeat[], Date.now())` — due argomenti su quattro, quindi `installatoDaMs` resta `undefined`. Dentro la funzione, per un lavoro senza battito: `const daQuanto = installatoDaMs != null ? … : 0` e poi `if (daQuanto > FINESTRA_PRIMA_ACCENSIONE_MIN)` con la finestra a 1440 minuti: con 0 il confronto è sempre falso, il lavoro viene saltato…
- Come si ripara: Passare il quarto parametro: `staleCrons(heartbeats, Date.now(), CRON_MAX_STALENESS_MIN, installatoDaMs)`, con `installatoDaMs` preso dalla riga più vecchia di `cron_heartbeats` o da una costante di installazione. Aggiungere in tests/unit/cron-health.test.ts un caso con `installatoDaMs` di 48 ore…

**82. Il sorvegliante fallisce in silenzio e si registra come sano**

- Dove: `app/api/cron/operational-alerts/route.ts (14 letture alle righe 46, 68, 89, 112, 131, 160, 177, 198, 219, 237, 255, 268, 291, 341 — nessuna controlla `error`) e 313-338 (invio email); lib/api/middleware.ts:233-236`
- Cosa succede: CONFERMATO. Ho contato le destrutturazioni: 14 letture scritte tutte come `const { data: … } = await admin…` o `const { count: … } = …`; nel file l'identificatore `error` compare solo dentro due `logger.error`, mai come campo catturato da una query. Se una lettura fallisce, `data` è null, `?? []` la trasforma in lista vuota e quella famiglia di allarmi produce zero risultati. A valle: se `SUPPORT_EMAIL` manca si…
- Come si ripara: ① Controllare `error` su ogni query e, se anche una sola fallisce, rispondere 500 con l'elenco dei controlli non eseguiti — così il battito NON viene scritto e il dead-man's switch scatta. ② Se SUPPORT_EMAIL manca o sendEmail fallisce mentre ci sono allarmi freschi, rispondere 500: un allarme non…

**83. Un bonifico al negozio che fallisce sempre torna in HELD, e nessun allarme guarda HELD**

- Dove: `lib/stripe/payout.ts:172-176; app/api/cron/operational-alerts/route.ts:131-140, 160-166, 177-183`
- Cosa succede: CONFERMATO. In payout.ts, nel `catch` del transfer: `await admin.from('orders').update({ payout_status: 'HELD' }).eq('id', order.id)` con il commento «il prossimo cron ritenterà». Nel sorvegliante, la ricerca degli stati di pagamento è `.or('payout_status.in.(PROCESSING,FAILED),rider_payout_status.in.(PROCESSING,FAILED)')` (riga 135), più `.eq('payout_status','PENDING_SELLER_ONBOARDING')` (163) e…
- Come si ripara: Aggiungere un allarme in operational-alerts: ordini DELIVERED, `payment_method='card'`, `payout_status='HELD'`, `delivered_at` più vecchio di 3 ore (o `payout_tentativo > 0`), cioè trattenuti oltre la finestra di attesa di 1 ora del rilascio. In parallelo, in lib/stripe/payout.ts incrementare…

**84. Il rendiconto dei pagamenti esce a un livello di log spento in produzione**

- Dove: `app/api/cron/release-payouts/route.ts:189-193; lib/logger.ts:87-91; render.yaml (LOG_LEVEL non dichiarata)`
- Cosa succede: CONFERMATO. La riga che riassume seller/rider/COD released-skipped-failed è emessa con `logger.info(...)`. In lib/logger.ts:88 la guardia è `if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'info')`. Ho cercato `LOG_LEVEL` in tutto il repository (esclusi i moduli): compare solo in lib/logger.ts, righe 88 e 96 (un commento). In render.yaml `NODE_ENV=production` è dichiarata e LOG_LEVEL no: in…
- Come si ripara: Portare i rendiconti dei lavori periodici, soprattutto quelli sui soldi, al livello `spesa`/`warn`, che escono sempre; in alternativa dichiarare `LOG_LEVEL=info` in render.yaml accettando più rumore. La prima è meglio: il rumore si controlla, la cecità sui soldi no.

**85. Un rallentamento del database fa riavviare un'istanza sana, proprio nel momento peggiore**

- Dove: `app/api/health/route.ts:63-88 (TETTO_MS, `esito.scaduto`, `const fatale = !checks.db.ok || !checks.env.ok`, `httpStatus = fatale ? 503 : 200`); render.yaml:53 (`healthCheckPath: /api/health`)`
- Cosa succede: CONFERMATO. Il tetto è `const TETTO_MS = 3000` e la corsa fra query e timeout produce `checks.db = { ok: false, … error: 'nessuna risposta entro 3000ms' }`; subito sotto `const fatale = !checks.db.ok || !checks.env.ok` e `const httpStatus = fatale ? 503 : 200`. Quindi il solo superamento dei 3 secondi vale 503. render.yaml:53 usa questa rotta come unico segnale di vita per Render. Il commento ② in testa al file…
- Come si ripara: Separare i due significati: la rotta usata da Render (`healthCheckPath`) deve dire solo «questo processo è vivo» — variabili vitali presenti — e rispondere 200 anche con database lento, riportando `status:'degraded'` nel corpo. Lo stato del database resta 503 su una rotta a parte (es.…

**86. Nessuno guarda gli eventi Stripe rimasti non lavorati**

- Dove: `app/api/stripe/webhook/route.ts:65-88 e 168-175; app/api/cron/operational-alerts/route.ts (nessun riferimento a stripe_event_log)`
- Cosa succede: CONFERMATO. Ho cercato `stripe_event_log` in tutto il codice applicativo: compare solo in app/api/stripe/webhook/route.ts (righe 65, 76, 170), in lib/database.types.ts e nelle migrazioni 025/065/119. Nessun allarme, nessun cruscotto, nessun log guarda la colonna `processed`: una riga con `processed=false` significa che Stripe ha comunicato qualcosa (pagamento, rimborso, contestazione) e noi non siamo riusciti a…
- Come si ripara: ① Aggiungere un allarme in operational-alerts: righe di `stripe_event_log` con `processed=false` più vecchie di 30 minuti, chiave di dedup `STRIPE_EVENT_NON_LAVORATO|<event_id>`. ② Nel ramo «rivendicazione non riuscita» rispondere 409 invece di 200 quando la riga risulta ancora `processed=false`,…

**87. Le foto caricate non hanno nessuna copia di sicurezza, e la documentazione dichiara perdita zero**

- Dove: `scripts/backup-db.sh:46 (`--exclude-schema=storage`) e 96-98 (S3/rclone solo come commento); docs/backup-restore.md §1 (riga «Storage (immagini) | replicato S3 | 0 | 0»); .github/workflows/backup-db.yml`
- Cosa succede: CONFERMATO. Il dump notturno esclude esplicitamente lo schema `storage`; l'unico accenno a una copia altrove sono due righe commentate in fondo allo script (`# aws s3 cp …`, `# rclone copy …`). Nel workflow backup-db.yml non c'è nessun passo sui bucket: si esegue lo script e si carica `backup/` come artefatto. Nel repository non esiste nessuno script o configurazione che copi i file caricati. La tabella «1. Cosa è…
- Come si ripara: ① Correggere subito la riga della tabella: Storage = nessuna copia, RPO ∞. ② Aggiungere al workflow notturno un passo che scarichi i bucket (Supabase Storage API o rclone) e li conservi cifrati accanto al dump, oppure dichiarare esplicitamente la scelta di non farlo e il perché.

**88. La copia notturna non è mai stata riprovata, e vive in un posto solo**

- Dove: `.github/workflows/backup-db.yml:73-79 (upload-artifact, retention-days: 30); docs/runbook.md §4 righe 97-127 («Data del controllo: _mai fatto_», «Time SLA ~30 min»); docs/backup-restore.md (Restore drill ogni 3 mesi); scripts/backup-db.sh:26 (RETENTION_DAYS=28)`
- Cosa succede: CONFERMATO dai file stessi. Il backup gira alle 02:17 UTC e l'unica destinazione è `actions/upload-artifact@v4` con `retention-days: 30`, cioè lo stesso account GitHub che ospita il codice: chi perde l'accesso a GitHub perde codice e backup insieme. docs/runbook.md §4 scrive nero su bianco «Data del controllo: _mai fatto_» e più sotto dichiara «Time SLA per disaster reale: ~30 min», un numero mai misurato;…
- Come si ripara: ① Fare una prova di ripristino su un progetto Supabase di prova, cronometrarla e scrivere in docs/runbook.md il tempo vero e la data. ② Aggiungere al workflow un passo mensile che riapplichi il dump su un database vuoto: un ripristino che gira da solo è l'unica prova che regge. ③ Portare una copia…

## Minori — 99


### architettura


**1. Il ripiego della migrazione 124 non copre le tabelle nuove, e il guardiano che dovrebbe accorgersene non guarda in components/**

- Dove: `lib/db/migrazione-124.ts:34-39 · tests/unit/nessuna-colonna-nuova-senza-ripiego.test.ts:25`
- CONFERMATO in parte, con due correzioni al rapporto originale. Vero: `COLONNE_124` copre solo `gross_total_cents`, `payout_tentativo`, `rider_payout_tentativo`, e l'elenco `SCHEMA_INDIETRO` (righe…

**2. Un guasto di configurazione esce come «devi accedere», e nei log non resta niente**

- Dove: `lib/api/middleware.ts:57-63 · lib/supabase/server.ts:70-79`
- L'ESITO è confermato, il MECCANISMO descritto nel rapporto è sbagliato e va corretto. Il catch vuoto alla riga 61 di lib/api/middleware.ts esiste davvero, ma è di fatto irraggiungibile: intercetta…

**3. Cinque fabbriche diverse di client Supabase, con impostazioni che non coincidono**

- Dove: `lib/supabase/server.ts:11,44 · lib/supabase/client.ts:8 · lib/supabase/auth-server.ts:14 · lib/api/middleware.ts:31-38`
- VERIFICATO. Cinque modi di creare un client in quattro file: `getServerSupabase()` con i cookie, `creaClientAmministrativo()` con service role riusato, `getClient()` nel browser dietro un Proxy,…

**4. Sulla rotta dei soldi, il coupon ha come valore di ripiego il client del browser**

- Dove: `lib/coupons.ts:1,40 · usata da app/api/stripe/checkout/route.ts e app/api/orders/cod/route.ts`
- VERIFICATO. La riga 1 di lib/coupons.ts è `import { supabase } from './supabase/client'` — il singleton del browser, definito in un modulo marcato `'use client'` — e alla riga 40 quel singleton è il…

**5. Tre endpoint costruiti e mai collegati a nessun bottone**

- Dove: `app/api/ai/answer-qa/route.ts · app/api/ai/reviews-summary/route.ts · app/api/seller/subscription/portal/route.ts`
- VERIFICATO con ricerca su tutto il repo (esclusi node_modules e .next): i tre percorsi non compaiono in nessun punto fuori dal file della rotta stessa e dai rispettivi test unitari…

**6. Due guardiani identici sulla stessa tabella: la regola dei profili gira due volte a ogni salvataggio**

- Dove: `migrations/061_p0_security_rls_state_machine_reviews.sql:74-77 · migrations/119_radiografia_18_agosto.sql:127-130`
- VERIFICATO sui file delle migrazioni. La 061 crea `trg_enforce_profile_update` BEFORE UPDATE su `public.profiles`, che esegue `public.enforce_profile_update_rules()`. La 119 riscrive quella funzione…

**7. Il contratto delle risposte API è dichiarato in un posto e rispettato a metà**

- Dove: `lib/api/responses.ts:13-19 · app/api/stripe/payout/route.ts:36,38 · app/api/orders/cod/route.ts:131-134 · app/profile/settings/page.tsx:207-213`
- VERIFICATO, con una correzione sui conteggi. lib/api/responses.ts dichiara alle righe 3-10 che «Response shape mai inconsistente» e definisce `{ ok: true, data }` / `{ ok: false, error: { code,…

**8. Una funzione che si chiama «compenso del fattorino» e calcola il prezzo per il cliente, con le tariffe nascoste dentro**

- Dove: `lib/geo.ts:17-34 · lib/constants.ts · app/admin/delivery/page.tsx`
- VERIFICATO. `riderFee(distanceKm)` in lib/geo.ts calcola quanto paga il CLIENTE per la spedizione, non il compenso del fattorino: lo dice il commento sopra la funzione stessa, righe 19-27,…

**9. Il freno anti-abuso ha due versioni e il suo commento parla di 25 usi che non esistono più**

- Dove: `lib/rate-limit.ts:14-17,66 · unico chiamante rimasto: app/api/health/route.ts:54`
- VERIFICATO e contato. Il modulo espone `rateLimit()` sincrona (solo memoria del processo) e `rateLimitAsync()` (Redis Upstash con ripiego in memoria). Il commento alle righe 14-17 dice che la…

**10. Quattro schermate del percorso critico sono file da mille righe**

- Dove: `app/product/[id]/page.tsx (1132 righe) · components/seller/ProductForm.tsx (992) · app/checkout/page.tsx (987) · app/admin/users/page.tsx (890)`
- VERIFICATO con il conteggio righe. Escluso lib/database.types.ts che è generato, i quattro file più grandi del repo sono esattamente questi quattro componenti, e tre su quattro stanno sul percorso…

**11. Una cartella «design-system» da 3 MB con la copia parallela dei componenti veri, fuori dal progetto**

- Dove: `design-system/ (154 file, 3,0 MB verificati) · tsconfig.json:23`
- VERIFICATO. La cartella pesa 3,0 MB su 154 file e contiene copie in `.jsx` dei componenti (design-system/components/core/Button.jsx, Card.jsx e altri), mentre in components/ui/ esistono gli stessi…

### sicurezza-auth


**12. Il caricamento dei documenti si fida del nome e del tipo dichiarati da chi carica**

- Dove: `app/api/kyc/upload-document/route.ts:54-59`
- CONFERMATO leggendo il codice reale. Due controlli si appoggiano a valori scritti dal chiamante. ① `if (!ALLOWED_MIME.has(file.type))` (riga 54) si basa sull'intestazione Content-Type della parte…

**13. Il cookie che porta il ruolo è firmato con la chiave delle disiscrizioni**

- Dove: `middleware.ts:100-102`
- CONFERMATO. `segretoRuolo()` restituisce `process.env.MIDDLEWARE_CACHE_SECRET || process.env.UNSUBSCRIBE_SECRET || null`. Ho verificato che MIDDLEWARE_CACHE_SECRET non compare né in…

**14. Il segreto dei lavori periodici si confronta lettera per lettera invece che a tempo costante**

- Dove: `app/api/health/route.ts:94`
- CONFERMATO. La rotta di stato decide se mostrare il dettaglio (quali variabili d'ambiente mancano, il messaggio grezzo del database, il tempo di risposta, l'uptime) con…

### rls-database


**15. Nove tabelle di servizio lasciano ad «anon» il permesso di svuotarle**

- Dove: `migrations/025_stripe_event_log.sql:19-23 (e uguale per email_queue, merchants_leads, kpi_snapshots, cron_heartbeats, operational_alert_log, outreach_events, telegram_chats, uptime_checks)`
- CONFERMATO sul database vivo. Per tutte e nove le tabelle: regole per riga accese e **zero regole scritte** (`relrowsecurity = true`, `n_policies = 0`), e `relforcerowsecurity = false`. Interrogando…

**16. Sei viste su sette girano coi poteri del proprietario e scavalcano le regole per riga**

- Dove: `migrazioni 110, 112, 108b, 119, 122 (viste vive: live_activity_public, ordini_disponibili_rider, rider_reviews_ricevute, seller_public_profiles, sponsored_active_public, shop_of_month_leaderboard)`
- CONFERMATO sul database vivo. Ho letto `reloptions` di tutte e sette le viste dello schema public: `referral_leaderboard` ha `security_invoker=on` (la riparazione della 048),…

**17. Il venditore può scrivere la posizione GPS del fattorino sulla mappa del cliente**

- Dove: `migrations/114_hardening_radiografia.sql (funzione viva enforce_order_update_rules, lista «consentiti»)`
- CONFERMATO sul database vivo, in tre pezzi. ① Il corpo reale di `enforce_order_update_rules` ha la lista `consentiti` = delivery_status, rider_id, accepted_at, ready_at, rider_lat, rider_lng,…

**18. Il permesso di scavalcare la guardia viene alzato prima di sapere se chi chiede ne ha diritto**

- Dove: `migrations/083_notifications_best_effort_in_order_rpc.sql (verify_pickup_code, verify_delivery_code) · migrations/124_radiografia_21_agosto.sql (confirm_pickup_by_seller)`
- CONFERMATO sul database vivo misurando la posizione delle due istruzioni dentro il corpo reale delle funzioni: `set_config` compare al carattere 343/344/380, il primo controllo di autorizzazione…

**19. Il blocco dopo cinque tentativi non conta nulla se manca la riga del codice**

- Dove: `migrations/083_notifications_best_effort_in_order_rpc.sql:33-38 e :73-78`
- CONFERMATO nel corpo reale delle funzioni. Il ramo del rifiuto conta il tentativo con `UPDATE public.order_delivery_codes SET attempts = attempts + 1 ... WHERE order_id = p_order_id`, ma lo stesso…

**20. Sulla tabella dei profili la stessa guardia è montata due volte**

- Dove: `migrations/061_p0_security_rls_state_machine_reviews.sql:75-76 e migrations/119_radiografia_18_agosto.sql:127-128`
- CONFERMATO sul database vivo. Interrogando `pg_trigger` su `public.profiles` risultano due trigger distinti che chiamano la stessa funzione `enforce_profile_update_rules`:…

**21. Quattro regole di lettura duplicate sui prodotti, pagate a ogni riga letta**

- Dove: `database vivo, tabella public.products (10 regole totali)`
- CONFERMATO sul database vivo. Elencando le policy di `public.products` ne risultano dieci, con due coppie identiche: «Admin sees all products» e «Admins can read all products» sono entrambe SELECT…

**22. Dodici regole chiamano auth.uid() a ogni riga invece che una volta sola**

- Dove: `database vivo — follows (3), review_helpful (3), rider_reviews (2), product_variants, group_orders, referrals, wallet_ledger`
- CONFERMATO sul database vivo con una query su `pg_policies` che toglie dalle espressioni le occorrenze già avvolte (`SELECT auth.uid() AS uid`) e cerca quelle rimaste: restano esattamente dodici…

**23. Sette chiavi esterne senza indice, fra cui quella che lega i tentativi di pagamento all'utente**

- Dove: `database vivo — payment_attempts (user_id, pending_checkout_id), order_items (variant_id), review_helpful (user_id), cod_reconciliations (remitted_by), cms_pages (updated_by), site_settings (updated_by)`
- CONFERMATO sul database vivo con una query che incrocia `pg_constraint` (chiavi esterne su colonna singola) e `pg_index`: restano scoperte esattamente sette, e sono esattamente quelle segnalate —…

**24. Il tetto alla paga del fattorino è stato aggiunto senza controllare le righe già presenti**

- Dove: `database vivo, vincolo orders_rider_fee_cents_ragionevole`
- CONFERMATO sul database vivo. Interrogando `pg_constraint` per i CHECK non validati dello schema public, `orders_rider_fee_cents_ragionevole` risulta `convalidated = false` e la definizione finisce…

**25. Due depositi di file pubblici, senza regole e senza limiti, che nessuna pagina usa**

- Dove: `storage.buckets — «avatars» e «stores»`
- CONFERMATO sul database vivo e nel codice. Interrogando `storage.buckets`: `avatars` e `stores` sono `public = true`, con `file_size_limit` nullo e `allowed_mime_types` nullo, e contengono zero…

**26. Sul totale dell'ordine mancano i vincoli che renderebbero impossibile un rimborso più grande dell'incasso**

- Dove: `database vivo — tabelle orders e order_items`
- CONFERMATO sul database vivo. Elencando tutti i CHECK di `orders` e `order_items` ne risultano otto in tutto, e fra questi non c'è né `refunded_amount_cents <= gross_total_cents` né…

### pagamenti-stripe


**27. Il tasso di autorizzazione è strutturalmente sbagliato: un vincolo unico cancella tutti i rifiuti oltre il primo sullo stesso pagamento**

- Dove: `migrations/124_radiografia_21_agosto.sql:421-422 · lib/stripe/webhook/pagamenti.ts:64-78`
- L'indice `payment_attempts_intent_status_uidx UNIQUE (payment_intent_id, status)` (:421-422) ammette una sola riga 'failed' e una sola 'succeeded' per PaymentIntent. Ma una Checkout Session ha UN…

**28. Il 3D Secure non viene mai registrato: la colonna resta sempre vuota perché la charge non è mai espansa**

- Dove: `lib/stripe/webhook/pagamenti.ts:61-73`
- `registraTentativoPagamento` legge `network_status` e `three_d_secure` solo se `pi.latest_charge` è un oggetto espanso (:61-63). Nei payload dei webhook Stripe `latest_charge` è una stringa (l'id…

**29. Rimessa contanti: la conferma admin lavora sul giorno di Greenwich, la quadratura del fattorino sul giorno di Piacenza**

- Dove: `migrations/097_cod_remittance.sql:73 e :76-79 · app/api/rider/cash-confirm/route.ts:112, :224-228, :289`
- `confirm_cod_remittance` filtra gli ordini con `(delivered_at AT TIME ZONE 'UTC')::date = p_date` (:73) e poi scrive `remitted_at` su `cod_reconciliations (rider_id, for_date = p_date)` (:76-79),…

**30. Il controllo «sessione completata ≠ sessione pagata» copre gli ordini ma non buoni regalo, spazi sponsorizzati e abbonamenti**

- Dove: `app/api/stripe/webhook/route.ts:92-104 · lib/stripe/webhook/ordini.ts:73 · lib/stripe/webhook/comune.ts:75-77`
- `grep -rn sessionePagata lib/stripe/webhook` restituisce due sole occorrenze: la definizione in comune.ts:75 e la chiamata in ordini.ts:73, dentro `handleCheckoutCompleted`. Lo smistatore…

**31. Il giro che fa scadere i carrelli scrive senza rivendicare, al contrario del suo gemello nel webhook**

- Dove: `app/api/cron/expire-checkouts/route.ts:97-101 · confronto con lib/stripe/webhook/ordini.ts:465-470`
- Il cron aggiorna `pending_checkouts` a 'EXPIRED' con `.in('id', ids)` e nessuna condizione sullo stato di partenza (:98-101). Il gemello `handleCheckoutExpired` fa invece la rivendicazione…

**32. Nella misura degli acquisti in contanti l'identificativo del carrello è una stringa vuota**

- Dove: `app/api/orders/cod/route.ts:121 e :632`
- `chiaveTentativo` nasce da `(req.headers.get('idempotency-key') ?? '').trim().slice(0, 100)` (:121): quando l'intestazione manca vale stringa vuota, non null o undefined. A riga 632 si scrive…

### privacy-legale


**33. I Termini mandano i consumatori alla piattaforma ODR europea, che non esiste più**

- Dove: `app/terms/page.tsx:285-295 (sezione 16 · Risoluzione delle controversie)`
- CONFERMATO nel codice: la sezione 16 dice «Per i consumatori è disponibile la piattaforma europea di risoluzione delle controversie online (ODR)» con link a `https://ec.europa.eu/consumers/odr/`. Il…

**34. Il pulsante che conclude l'ordine in contanti dice «Conferma ordine», non che si sta assumendo un obbligo di pagare**

- Dove: `app/checkout/page.tsx:973-983 (barra mobile) · components/checkout/OrderSummary.tsx:105-115`
- CONFERMATO. In entrambi i punti il testo dipende dal metodo: con carta è `Paga con carta` / `Paga con carta · €X`, con pagamento alla consegna è `Conferma ordine` / `Conferma ordine · €X`; anche…

**35. I Termini si riservano di cambiare le condizioni in qualsiasi momento con accettazione tacita**

- Dove: `app/terms/page.tsx:275-283 (sezione 15 · Modifiche ai Termini) · sezione 13 (limitazioni) · sezione 17 (foro)`
- CONFERMATO alla lettera: «Possiamo modificare i presenti Termini in qualsiasi momento. Le modifiche sostanziali saranno comunicate con preavviso di 30 giorni via email e notifica in piattaforma.…

**36. Il cookie mc_ruolo non è nella cookie policy, e mc_vid viaggia senza il flag Secure**

- Dove: `middleware.ts:97-98 e 136-151 · app/api/track/route.ts:24 e 182-191 · app/api/consent/route.ts:100-108 · app/cookies/page.tsx:58-68`
- CONFERMATE entrambe le cose. (1) Il middleware installa `mc_ruolo` (`RUOLO_COOKIE = 'mc_ruolo'`, `maxAge` 10 minuti, httpOnly, sameSite lax), cookie di prima parte firmato che contiene…

**37. Il fattorino continua a vedere nome, telefono e indirizzo dei clienti di tutte le consegne passate, senza limite di tempo**

- Dove: `migrations/122_radiografia_20_agosto.sql:79-86 (policy «Riders can view available and own orders»)`
- CONFERMATO. La policy, già stretta rispetto alle versioni 019 e 114, è `USING (rider_id = (SELECT auth.uid()))`: nessun vincolo di stato né di data. Il fattorino legge quindi la riga intera di…

**38. Il filtro anti-PII dei log confronta i nomi per uguaglianza esatta: telefono di consegna, IBAN di fatturazione e indirizzi passano**

- Dove: `lib/logger.ts:18 (PII_KEYS) e :36 (uso in redact) · confronto con migrations/115_privacy_radiografia.sql:58-64`
- CONFERMATO. `PII_KEYS = /^(email|password|pass|token|authorization|auth|cookie|phone|tel|iban|card|card_number|cvv|secret|api_?key|access_token|refresh_token|ssn|fiscal_?code|vat)$/i` è ancorato con…

**39. Manca il modulo di recesso tipo, e il consenso «funzionale» non finisce nel registro dei consensi**

- Dove: `app/terms/page.tsx:168-188 (sezione recesso) · lib/consent.ts:83-96 (writeConsent) · app/api/consent/route.ts:80-88 · components/CookieBanner.tsx:34 e 113-114`
- CONFERMATE entrambe. (1) La sezione sul recesso spiega come esercitarlo («Richiedi reso» o email) ma la ricerca di «modulo di recesso» / «Allegato I» in tutto app/ non dà nessun risultato: il modulo…

### performance


**40. Le due pagine dei negozi scaricano centinaia di prodotti e poi li buttano via**

- Dove: `app/stores/page.tsx:41-51 · app/stores/page.tsx:73 · app/near/page.tsx:34-57`
- CONFERMATO. Tutte e due le pagine lanciano dentro un `Promise.all` una lettura a blocchi di `products` con tetto 600 (stores:51) o 400 (near:42). Subito dopo, FUORI dal Promise.all, chiamano…

**41. Con tre filtri attivi la griglia scarica quattrocento prodotti per mostrarne novantasei**

- Dove: `components/ProductGrid.tsx:119-129 · components/ProductGrid.tsx:228-248`
- CONFERMATO. Tre filtri lavorano nel browser invece che nel database — «negozio aperto adesso», «valutazione minima» e «in promozione» (righe 228-248) — e il codice compensa allargando il tetto:…

**42. I negozi non approvati vengono scaricati e poi tolti, e accorciano l'elenco**

- Dove: `components/ProductGrid.tsx:127-138 · migrations/112_seller_public_profiles.sql:18-40`
- CONFERMATO. La query prende i prodotti col tetto (riga 128), poi carica le vetrine dei venditori con `fetchSellerPublicMap` (riga 132) e SOLO ALLORA scarta quelli il cui negozio non è approvato:…

**43. «Vicino a te» si porta dietro la galleria fotografica di ogni negozio senza mostrarla mai**

- Dove: `app/near/page.tsx:26 · app/near/page.tsx:227 · components/StoreListRow.tsx`
- CONFERMATO solo per /near, e con una CORREZIONE IMPORTANTE alla segnalazione del collega. /near chiede `store_media` per ogni negozio dell'elenco (riga 26) ma disegna le righe con `StoreListRow`…

**44. Il cron dei carrelli abbandonati chiede il profilo una persona alla volta**

- Dove: `app/api/cron/abandoned-carts/route.ts:32 · app/api/cron/abandoned-carts/route.ts:38-43 · docs/crons.json`
- CONFERMATO. `list_abandoned_carts_to_recover` restituisce i candidati (riga 32), poi dentro il ciclo per ognuno parte una query separata: `.from('profiles').select('email_marketing').eq('id',…

**45. I carrelli scaduti si liberano uno alla volta, senza un tetto per giro**

- Dove: `app/api/cron/expire-checkouts/route.ts:41-46 · app/api/cron/expire-checkouts/route.ts:92 · app/api/cron/expire-checkouts/route.ts:115-134`
- CONFERMATO. La lettura dei candidati (righe 41-46) filtra `.eq('status','PENDING').lt('expires_at', adesso)` e non ha nessun `.limit()`: prende tutto quello che trova. Poi il ciclo di riga 115 chiama…

**46. Ogni persona collegata resta in ascolto su tutta la tabella delle conversazioni**

- Dove: `components/hooks/useMessagesUnread.ts:91 · app/messages/page.tsx:86 · app/orders/[id]/page.tsx:151 · app/messages/[id]/page.tsx:110`
- CONFERMATO. Le due sottoscrizioni in tempo reale a `conversations` sono aperte con `{ event: '*', schema: 'public', table: 'conversations' }` e nessun campo `filter`. Nello stesso progetto lo schema…

**47. Ogni vetrina si porta la libreria di pulizia HTML per ripulire testo già pulito**

- Dove: `components/store-sections/RichTextSection.tsx:1-9 · components/home-sections/HomeSectionRenderer.tsx · components/cms/CmsBlockRenderer.tsx · app/api/seller/site/route.ts:31`
- CONFERMATO, e più esteso di come lo raccontava il collega. `RichTextSection` è un componente client (riga 1) e chiama `sanitizeRichText` (riga 8), che porta dentro `isomorphic-dompurify`; nel browser…

### frontend-ux


**48. Nel carrello ogni riga dichiara «Disponibile» anche quando è esaurita**

- Dove: `app/cart/page.tsx:180-182 (confronta 44-64, 198-209)`
- Verificato: la riga «✓ Disponibile · Spedizione 24-48h» è renderizzata senza nessuna condizione (cart:180-182), mentre lo stesso componente ha già in mano la disponibilità vera — la legge da…

**49. Il tetto di quantità nel carrello ignora le varianti e non si aggiorna quando cambi quantità**

- Dove: `app/cart/page.tsx:44-64, 198 · app/checkout/page.tsx:126-136`
- Verificato: la lettura è `select('id, stock')` su `products`, indicizzata per id prodotto in `mappa[p.id]` (cart:50-55), e `massimo(item.id)` non conosce la variante (cart:60-64, usata a riga 198).…

**50. La pagina «Richiedi un reso» legge stato e data di consegna dell'ordine e non li usa mai**

- Dove: `app/orders/[id]/return/page.tsx:36-46, 96-108, 110-177`
- Verificato: la query seleziona `id, total_price, delivered_at, delivery_status` (riga 40) ma `order` compare solo nel controllo `if (!order)` che mostra «Ordine non trovato» (righe 96-108); nessuno…

**51. Il codice sconto resta applicato con l'importo di prima anche se il carrello cambia, e «Applica» non si spegne mentre lavora**

- Dove: `app/checkout/page.tsx:383, 430-441, 448 · components/checkout/CouponInput.tsx:62 · lib/coupons.ts:105-137`
- Verificato (i riferimenti di riga della segnalazione erano sbagliati: CouponInput.tsx ha 71 righe in tutto, il pulsante è alla 62). `applyCoupon` chiama `validateCouponFromBrowser(couponCode,…

**52. La pillola «Consegna a…» rompe l'idratazione e il salvataggio del CAP fallisce in silenzio**

- Dove: `components/LocationPill.tsx:19, 26-35 · lib/hooks/index.ts:17-26`
- Verificato: `useLocalStorage` inizializza lo stato leggendo `localStorage` dentro l'inizializzatore di `useState` (hooks:18-25). In un componente client prerenderizzato dal server l'HTML del server…

**53. Service worker: un'immagine non in cache con rete assente genera un'eccezione, e le pagine private finiscono in cache**

- Dove: `public/sw.js:49-56, 58-69, 71-88, 98-104`
- Verificato tutti e tre i punti. Primo: in `staleWhileRevalidate` il ramo di errore è `.catch(() => cached)` e il ritorno è `cached || fetchPromise` (righe 61-69): se in cache non c'è niente e la rete…

**54. Il banner «Installa MyCity» si mette in ascolto troppo tardi per intercettare l'evento del browser**

- Dove: `components/PWAInstallBanner.tsx:35-54`
- Verificato: dentro l'unico `useEffect` (deps `[]`) il componente prima incrementa il contatore visite e poi esce con `return` se `nextVisits < MIN_VISITS` (righe 41-43); solo dopo quel controllo…

**55. Sulla scheda di un prodotto con varianti tutte esaurite la barra laterale dice «Disponibile»**

- Dove: `app/product/[id]/page.tsx:366-372, 814-821`
- Verificato: con `hasVariants` vero e nessuna variante ancora scelta, `selectedVariant` è `null` e `stock` resta `undefined` (righe 366-369). Di conseguenza `isOutOfStock = stock === 0` è falso e…

**56. Il carrello si salva senza rete di sicurezza: se lo spazio del browser è pieno, «Aggiungi al carrello» solleva un errore e non fa niente**

- Dove: `lib/cart.ts:29, 32-38, 41-47, 49-56`
- Verificato: `saveCart` chiama `localStorage.setItem(KEY, JSON.stringify(items))` nudo (riga 43), mentre nello stesso file la lettura (`getCart`, righe 33-38) e il timestamp (`bumpUpdatedAt`, riga 29)…

### accessibilita


**57. Quattro campi del venditore cancellano il bordo di fuoco senza rimetterne uno**

- Dove: `components/seller/StoreHoursEditor.tsx:58,66 · components/products/ImportFromUrlBox.tsx:145,149 · components/seller/QuickAiTools.tsx:164`
- VERIFICATO con un grep su tutto il repo. I quattro controlli con `focus:outline-none` e nessun indicatore sostitutivo, né sul controllo né come `focus-within` sul contenitore, sono:…

**58. Il pannello SOS di emergenza del fattorino non è dichiarato dialogo e non si chiude con Esc**

- Dove: `components/rider/SOSButton.tsx:90-137`
- VERIFICATO. components/rider/SOSButton.tsx:90 apre il pannello che chiama il 112, condivide il GPS e allerta gli amministratori come un semplice `<div className="fixed inset-0 z-50 bg-black/60 …">`.…

**59. Nella striscia in cima c'è un link raggiungibile con Tab ma nascosto ai lettori di schermo**

- Dove: `components/PromoTicker.tsx:41,47,60-67,74-75`
- VERIFICATO A METÀ: tengo la prima parte, la seconda è un falso positivo. VERA. components/PromoTicker.tsx rende la stessa traccia due volte (righe 74-75: `<Track />` e `<Track ariaHidden />`) e la…

**60. L'errore delle caselle di consenso è muto, mentre quello di tutti gli altri campi parla**

- Dove: `components/ui/Field.tsx:250 (confronto: stessa cosa corretta a riga 78)`
- VERIFICATO, righe esatte. components/ui/Field.tsx contiene due volte lo stesso paragrafo d'errore: quello del wrapper `Field` (riga 78) ha `role="alert"`, aggiunto dalla correzione #131 col commento…

**61. I metodi di pagamento non sono dichiarati come un gruppo unico di scelte**

- Dove: `components/checkout/PaymentMethodSelector.tsx:48-120`
- VERIFICATO. components/checkout/PaymentMethodSelector.tsx:48-120 mette dentro un `<div className="space-y-3">` due `<label>` che avvolgono altrettanti `<input type="radio" name="paymentMethod">`…

**62. I pallini del carosello del negozio sono 8 pixel: sotto la soglia minima per essere premuti**

- Dove: `components/StoreMediaCarousel.tsx:97 · components/PhotoReviewUpload.tsx:93`
- VERIFICATO sulle classi. components/StoreMediaCarousel.tsx:97 rende i pallini di navigazione delle foto/video del negozio come `<button>` con `w-2 h-2` (8×8 CSS px, quello attivo `w-6`), distanziati…

**63. C'è una traccia sottotitoli vuota che fa sembrare i video sottotitolati quando non lo sono**

- Dove: `components/home-sections/HomeSectionRenderer.tsx:465 · components/StoreMediaManager.tsx`
- VERIFICATO. components/home-sections/HomeSectionRenderer.tsx:465 contiene esattamente `<track kind="captions" />` — senza `src`, senza `srcLang`, senza `label` — dentro il `<video>` della sezione…

**64. Il menu mobile dell'amministratore si dichiara dialogo modale ma non si comporta da tale**

- Dove: `components/admin/AdminSidebar.tsx:245-267`
- VERIFICATO, con una correzione. components/admin/AdminSidebar.tsx:247 apre il cassetto di navigazione mobile con `role="dialog" aria-modal="true" aria-label="Menu admin"` e in effetti non implementa…

### qa-flussi


**65. La cassa del fattorino cambia giorno fra chi la conta e chi la sblocca**

- Dove: `migrations/097_cod_remittance.sql:48, 73 · app/api/rider/cash-confirm/route.ts:112, 223-256 · app/admin/cod-remittance/page.tsx:33, 60`
- CONFERMATO, ma con un impatto diverso da quello segnalato. La funzione della rimessa seleziona con `(delivered_at AT TIME ZONE 'UTC')::date = p_date` (097:73) e il commento a riga 48 dichiara di…

**66. Il codice sconto a uso unico si brucia anche se l'ordine non si fa mai**

- Dove: `migrations/062_atomic_stock_reservation.sql:87-134 · app/api/cron/expire-stale-orders/route.ts:106-135 · migrations/116_soldi_radiografia.sql:46`
- CONFERMATO. Il codice viene consumato con `claim_coupon` prima ancora di creare gli ordini (cod/route.ts:272-276). La funzione `release_coupon` esiste (migrazione 116:46) e viene richiamata in…

**67. L'ultima consegna della giornata può non entrare mai nella quadratura**

- Dove: `app/api/rider/cash-confirm/route.ts:160, 176, 250, 263-271`
- CONFERMATO. La conferma dell'incasso è ammessa su tre stati — la UPDATE ha `.in('delivery_status', ['PICKED_UP','OUT_FOR_DELIVERY','DELIVERED'])` (riga 160) — ma la quadratura che parte subito dopo…

**68. Il carrello non ha un tetto: oltre 99 pezzi il checkout muore con un messaggio che non spiega niente**

- Dove: `lib/cart.ts:49-64 (addToCart), 90-95 (updateQuantity) · app/api/orders/cod/route.ts:29-38, 94 · app/api/stripe/checkout/route.ts:97`
- CONFERMATO. `addToCart` somma le quantità senza nessun limite (`existing.quantity += qty`), e `updateQuantity` accetta qualunque valore ≥1. Le due rotte server rifiutano con Zod tutto ciò che supera…

### api-backend


**69. Il freno anti-doppione del webhook Stripe non scatta mai: la riga nasce senza rivendicazione**

- Dove: `app/api/stripe/webhook/route.ts:65 e :74-84`
- Verificato. L'insert alla riga 65 scrive solo `{ event_id, type }`. La colonna `claimed_at` è stata aggiunta senza valore predefinito (migrations/119_radiografia_18_agosto.sql:810), quindi resta…

**70. Chi si autentica col token nell'intestazione poi interroga il database come se non fosse nessuno**

- Dove: `lib/api/middleware.ts:44-63 + lib/supabase/server.ts:11 + middleware.ts:415-417`
- Il fatto di codice è verificato: `authenticate()` accetta due canali — il token `Authorization: Bearer` (righe 44-59) oppure il cookie di sessione (righe 60-64) — ma `getServerSupabase()` legge SOLO…

**71. Il rimborso parte prima della rivendicazione dello stato del reso: se la corsa si perde, i soldi escono e sul reso non resta traccia**

- Dove: `app/api/returns/[id]/decide/route.ts:64-101 (rimborso) e :105-121 (rivendicazione)`
- Verificato. L'ordine delle operazioni è: si legge lo stato del reso (riga 45, non atomico), si chiama `refundOrder` che manda davvero i soldi (riga 85-92), e SOLO dopo si tenta l'UPDATE condizionato…

**72. Il ripristino dell'ordine quando gli articoli non entrano non viene verificato: può restare un ordine pagato senza righe**

- Dove: `lib/stripe/webhook/ordini.ts:335-341`
- Verificato. Se l'inserimento in `order_items` fallisce (riga 336), si cancella l'ordine appena creato con `await admin.from('orders').delete().eq('id', order.id)` e si lancia: l'esito della…

**73. La strada del rimborso pieno da Stripe fa sei scritture separate, senza transazione né riparazione**

- Dove: `lib/stripe/webhook/rimborsi.ts:113-165`
- Verificato. `handleChargeRefunded` aggiorna gli stessi ordini con istruzioni distinte in sequenza: `payment_status`+`stripe_refund_id` (114-121), `delivery_status='CANCELED'` (126-131), un UPDATE per…

**74. La chat risponde «non hai i permessi» a ogni guasto del database**

- Dove: `app/api/chat/messages/route.ts:44`
- Verificato: `if (error || !data) return ApiErrors.forbidden('Impossibile inviare il messaggio')`. Qualunque errore — database irraggiungibile, vincolo violato, intoppo di rete — esce come 403. Il 403…

**75. Le due rotte dei soldi rispondono in un formato diverso da quello che il progetto dichiara obbligatorio**

- Dove: `app/api/stripe/checkout/route.ts:474 e app/api/orders/cod/route.ts:648`
- Verificato. `lib/api/responses.ts:8-18` dichiara la forma unica `{ ok: true, data }` vs `{ ok: false, error }` e fornisce `apiSuccess`. Gli ERRORI delle due rotte sono stati portati su quella forma,…

**76. La rotta dichiara di accettare le GIF e poi le rifiuta tutte con un messaggio che dice altro**

- Dove: `app/api/vision/extract-products/route.ts:134 (a fronte di lib/immagini-base64.ts:18 e :29-49)`
- Verificato. Lo schema elenca `MEDIA_TYPES = ['image/jpeg','image/png','image/webp','image/gif']` (riga 134), quindi una foto dichiarata `image/gif` passa la validazione. Poi `verificaImmagineBase64`…

**77. La chiave anti-doppione del buono regalo è legata a una finestra di dieci minuti: due regali uguali diventano uno solo**

- Dove: `app/api/gift-cards/checkout/route.ts:86`
- Verificato: `idempotencyKey: giftcard_${user.id}_${amountCents}_${body.recipientEmail}_${Math.floor(Date.now()/600_000)}`. Il fix #187 ha tolto il `Date.now()` puro (che rendeva la chiave sempre…

**78. Il freno anti-abuso scatta dopo l'autenticazione, non prima**

- Dove: `lib/api/middleware.ts:126-133, :153-166, :186-193`
- Verificato. In `withAuthRateLimit`, `withSellerAuthRateLimit` e `withAdminAuthRateLimit` la sequenza è: `authenticate(req)` — che fa due giri di rete verso Supabase, la verifica del token e la…

**79. I controlli di salute verso Supabase Auth e Resend non annullano davvero la chiamata quando scade il tempo**

- Dove: `lib/health/checks.ts:99 e :132`
- Verificato. Le due `fetch` (auth/v1/health e api.resend.com/domains) non hanno `AbortSignal`. Il tetto di tempo è dato da `withTimeout(fn(), TIMEOUT_MS)` (righe 45-50), che è una gara fra promesse…

### ai-endpoints


**80. Il lavoro massivo scrive nome e descrizione senza passare dal filtro di conformità**

- Dove: `app/api/ai/catalog-batch/apply/route.ts:96-137`
- CONFERMATO nel fatto: il file non importa lib/ai/moderation e applica i patch di improve/redescribe/translate scrivendo `name` e `description` su `products` (righe 108-121) senza nessuna chiamata a…

**81. I quattro prompt del lotto sono gli unici senza la regola anti-manipolazione**

- Dove: `lib/ai/catalogBatch.ts:70-118 (i system di improve/redescribe/moderate/translate) e :123-127 (productText)`
- CONFERMATO. Grep 'REGOLA DI SICUREZZA' trova la riga in barcode-lookup:27, improve-product:71, product-chat:53, catalog-chat:68, diagnose:33, e REGOLA_TESTO_DI_TERZI (lib/ai/recinto.ts:18) in…

**82. Il cap sulla descrizione non vale per la chiamata che la manda al filtro**

- Dove: `app/api/ai/description/route.ts:82-85 e 100-103`
- CONFERMATO. Nel blocco utente la descrizione corrente è tagliata: `body.current.slice(0, 500)` (riga 103). Nella chiamata ad assertSafeText (righe 82-85) lo stesso campo entra intero: `[name,…

**83. L'elenco dei campi variante arriva dal client senza limite di lunghezza**

- Dove: `app/api/ai/variants/route.ts:74-91`
- CONFERMATO. `body.variantableFields` è filtrato solo per tipo (`typeof f.key === 'string'`, riga 75) e poi mappato interamente in `fieldLines`, che finisce nel `lead` passato a buildProductContext…

**84. Il copilot che modifica tutto il catalogo è l'unica chat senza la regola anti-manipolazione**

- Dove: `app/api/ai/copilot/route.ts:29-40 e 113`
- CONFERMATO. Grep 'REGOLA DI SICUREZZA' su app/api: product-chat, catalog-chat, diagnose, barcode-lookup e improve-product ce l'hanno; il SYSTEM di copilot (righe 29-40) no. In più l'istruzione del…

**85. «Migliora tutto» duplica lo schema del patch, e le due copie sono già diverse**

- Dove: `app/api/ai/improve-product/route.ts:79-100 (PATCH_PROPERTIES locale)`
- CONFERMATO, e la verifica ha trovato che la divergenza è GIÀ avvenuta: lib/ai/patchSchema.ts esiste come «sorgente unica riusata dai tool delle route AI», e il blocco locale di improve-product non è…

**86. Nella chat prodotto la risposta mostrata è la narrazione della ricerca, non quella curata dal modello**

- Dove: `app/api/ai/product-chat/route.ts:265-270 (confronta con app/api/ai/catalog-chat/route.ts:323-326)`
- CONFERMATO. product-chat: `const reply = text || (typeof toolInput?.reply === 'string' && toolInput.reply.trim() ? toolInput.reply.trim() : 'Fatto.')` — la prosa libera vince sempre. catalog-chat fa…

**87. Nella creazione multipla i dodici controlli di conformità partono uno dopo l'altro**

- Dove: `app/api/ai/catalog-create-bulk/route.ts:81-97`
- CONFERMATO. Il ciclo fa `await classifyProductPolicy(...)` per ognuno dei massimo 12 prodotti (BodySchema `.max(12)`, riga 51), in sequenza. Ogni chiamata è un giro completo verso Anthropic; il…

**88. Quando Anthropic ci limita diciamo al venditore di riprovare tra un minuto, sempre**

- Dove: `lib/ai/run.ts:148`
- CONFERMATO: `if (status === 429) return ApiErrors.rateLimited(60);` — un Retry-After fisso, senza relazione con l'header `retry-after` restituito da Anthropic né con la durata reale della finestra.…

### dati-analytics


**89. Due tipi di evento sono ammessi dal server ma nessuno li manda mai**

- Dove: `app/api/track/route.ts:27-39 · components/ActivityTracker.tsx:28, 85-96, 116-118`
- CONFERMATO. L'allowlist della rotta accetta cinque tipi (page_view, session_start, login, logout, signup) e ha un testo pronto per ognuno. Il client — l'unico che chiama /api/track, verificato con…

**90. Resta in giro una scorciatoia verso Google Analytics che salta il consenso**

- Dove: `components/GoogleAnalytics.tsx:107-117 · confronto lib/analytics/events.ts:34-41`
- CONFERMATO. `trackEvent` controlla solo `if (typeof window === 'undefined' || !window.gtag) return` e poi spara. Ma window.gtag è definito sempre, anche senza consenso, dallo script…

**91. Nel catalogo eventi i prezzi viaggiano metà in euro e metà in centesimi**

- Dove: `lib/analytics/events.ts:69-77 (product_viewed) vs 89-99, 122-125, 143-160 · components/ProductViewTracker.tsx:55 · app/product/[id]/page.tsx:348`
- CONFERMATO. product_viewed porta `price`, numero in euro con la virgola: nasce da `const price = Number(product.price)` in app/product/[id]/page.tsx:348, arriva a ProductViewTracker e viene passato…

**92. Le coorti dell'admin usano il fuso di chi guarda e mostrano zero dove non c'è ancora niente da misurare**

- Dove: `app/admin/funnel/page.tsx:110-142 e 164-171`
- CONFERMATO, tutte e tre le parti. ① I confini di coorte sono `new Date(now.getFullYear(), now.getMonth() - i, 1)`, cioè mezzanotte nel fuso del browser, mentre created_at è in UTC: da Piacenza in…

**93. Quello che le persone scrivono nella ricerca viene spedito così com'è negli Stati Uniti**

- Dove: `lib/analytics/events.ts:82-85 · components/ProductGrid.tsx:288 · lib/analytics/posthog.tsx:25 · confronto lib/analytics/events.ts:242-253`
- CONFERMATO. trackSearchPerformed(term, filtered.length) manda la stringa digitata nella proprietà `query`, senza filtro; l'unico chiamante è components/ProductGrid.tsx:288, che passa il testo…

### deploy-sre


**94. La rotta di salute è protetta da un limite di richieste: un 429 vale come «istanza morta»**

- Dove: `app/api/health/route.ts:54-61; lib/rate-limit.ts:188-200`
- CONFERMATO. `const freno = rateLimit({ key: \`health:${getClientIp(request)}\`, max: 60, windowMs: 60_000 })` e, sopra soglia, `return NextResponse.json({ status: 'rate_limited' … }, { status: 429 ……

**95. Il client Postgres del backup non è agganciato alla versione del server**

- Dove: `.github/workflows/backup-db.yml (passo «Installa il client Postgres»: `sudo apt-get update && sudo apt-get install -y --no-install-recommends postgresql-client`)`
- CONFERMATO: il workflow installa qualunque versione di postgresql-client sia nei pacchetti del runner di turno, senza pin. `pg_dump` rifiuta di lavorare quando il server è più recente del client: al…

**96. Il rilascio controllato non fissa il commit che ha superato la CI**

- Dove: `.github/workflows/deploy-dopo-ci.yml:56-66 (passo «Rilascia»)`
- CONFERMATO: il passo è `curl -sS -o /tmp/risposta.txt -w '%{http_code}' -X POST "$HOOK"` — nessun parametro `ref`, nessun riferimento a `github.event.workflow_run.head_sha`. Il gancio di Render…

**97. Il documento del ripristino si contraddice al suo interno sul punto più importante**

- Dove: `docs/backup-restore.md: avviso #238 in testa (righe 7-30) vs §2 «Free tier → PITR a granularità ~5 min» (righe 58-62)`
- CONFERMATO leggendo il file: l'avviso in cima dice «sul piano gratuito di Supabase il ripristino al minuto non c'è», e venti righe più sotto la sezione «### Free tier» continua a elencare «PITR a…

**98. Il segreto che firma il cookie di ruolo non è dichiarato: in produzione ne ricicla un altro**

- Dove: `middleware.ts:100-102 (`return process.env.MIDDLEWARE_CACHE_SECRET || process.env.UNSUBSCRIBE_SECRET || null`); render.yaml (MIDDLEWARE_CACHE_SECRET assente, UNSUBSCRIBE_SECRET con `generateValue: true`)`
- CONFERMATO. `MIDDLEWARE_CACHE_SECRET` compare una volta sola in tutto il codice, in quel ripiego, e non è dichiarata in render.yaml: in produzione la firma del cookie di ruolo `mc_ruolo` (durata 10…

**99. I dati del titolare non sono dichiarati fra le variabili: in produzione l'informativa esce con un segnaposto**

- Dove: `lib/legal/titolare.ts:70-78 (NEXT_PUBLIC_TITOLARE_NOME/INDIRIZZO/PIVA/REA/PEC/CAPITALE/EMAIL_PRIVACY/REFERENTE_PRIVACY/EMAIL_DPO); render.yaml (nessuna delle nove dichiarata)`
- CONFERMATO: le nove variabili `NEXT_PUBLIC_TITOLARE_*` sono lette in lib/legal/titolare.ts e una ricerca di `TITOLARE` in render.yaml non trova niente. Essendo `NEXT_PUBLIC_`, Next le incorpora nel…