---
data: 2026-11-05 12:05
tipo: radiografia-marketplace
codice: NicolaeRotaru/mycity @ 21212f9 (main, quello pubblicato)
fonte_raw: consegne/audit/2026-11-05-radiografia-marketplace-raw.json
richiesta: radiografia al 100% del marketplace (4/11), ripresa il 5/11 come la più profonda e completa possibile
---

# Il sito non può ancora aprire: tre chiavi mancano, e il giro dei soldi dei contanti non si chiude

**In due righe.** Oggi il sito vero non apre, per tre passi che solo tu puoi fare. E il primo lunedì dopo il lancio i conti dei contanti non tornerebbero, né col negozio né col cliente.

## In parole semplici

Ho radiografato tutto il marketplace senza toccare niente: il codice, il database vero e gli errori veri del sito pubblicato. Il lavoro è stato diviso in modo che **ogni file del sito fosse letto per intero da qualcuno**: 25 revisori, uno per zona, sui 998 file del codice. Altri 21 revisori hanno seguito una cosa sola attraverso tutto il sito. Per esempio un euro dal prezzo al bonifico, un attaccante, un orario che passa la mezzanotte, un avviso che deve partire.

Ogni difetto trovato è passato da un secondo agente che aveva il compito di smentirlo. I gravi sono passati anche da un terzo, che ne ha giudicato il peso. Ho cercato solo il **nuovo**: i 996 difetti già aperti nel registro li ho lasciati fuori.

Il risultato è **372 difetti nuovi**: 1 bloccante, 34 gravi e 337 minori. Fra questi, 24 erano dati per riparati e sono tornati.

| | Quanti |
|---|---:|
| Difetti nuovi, verificati e senza doppioni | 372 |
| … bloccanti | 1 |
| … gravi | 34 |
| … minori | 337 |
| … difetti dati per riparati che sono tornati | 24 |
| … falle di sicurezza tenute fuori da questo file pubblico | 33, di cui 7 gravi |
| Difetti scartati dai verificatori (falsi o già nel registro) | 54 |
| Doppioni uniti (lo stesso difetto visto da più revisori) | 76 |
| Gravità abbassate dalla terza lente | 8 su 43 |
| Gravi e bloccanti con una prova lanciata davvero | 33 su 35 |

Facciamo un esempio di come si legge un grave. Lunedì sera un cliente nuovo sceglie «Domani 9-11» dal forno, si registra e conferma la sua email martedì alle 8:15. La cassa rimette «Domani» così com'era, e il pane arriva mercoledì. Nessuno glielo dice. Un revisore l'ha trovato leggendo il codice, un altro ha lanciato la prova con quelle date e ha visto la data sbagliata uscire davvero.

## Cosa cambia per te

**Primo: oggi il sito vero non prende ordini.** Lo sapevi già dal 3/11, e oggi è ancora così. Mancano tre cose, che solo tu puoi fare:
- La chiave di servizio del database su Vercel. Senza, il tasto «Ordina» fallisce sempre.
- La chiave e il mittente della posta. Senza, il negozio non riceve l'email del nuovo ordine.
- I 15 aggiornamenti del database, dal 164 al 195.

Sui 15 aggiornamenti ho una notizia buona. Un revisore li ha applicati su una copia del database ferma dove è ferma la produzione, e passano tutti. Si fermerebbero solo se nel database ci fosse un ordine chiuso con la posizione del fattorino rimasta e senza fattorino. Sul database vero ho contato: oggi sono **0**. Quindi oggi il pulsante passerebbe.

**Secondo: il giro dei soldi dei contanti non si chiude.** Al lancio si paga in contanti, e tu bonifichi i negozi il lunedì. Ma oggi:
- La pagina dei bonifici non ti dice quanto versare a ogni negozio.
- Dopo il bonifico non puoi segnarlo come fatto. Così i soldi restano «in attesa» per sempre.
- Il negozio, nella sua pagina Guadagni, legge commissione zero e soldi mai arrivati.
- Un rimborso arrivato dopo il lunedì non viene mai ripreso al negozio.
- Il bonifico di rimborso al cliente non si può segnare come fatto. E nessuno conta i 14 giorni che la legge concede.

È il primo lunedì dopo il lancio che si rompe, non il primo ordine.

**Terzo: non sapresti di un ordine in tempo.** Quando arriva un ordine non parte nessun avviso per te. Il primo allarme parte dopo un'ora, non dopo i 5 minuti che hai deciso. Dentro il tuo pannello non c'è la campanella. Se l'email al negozio fallisce, nessuno se ne accorge. E un ordine fermo su «accettato» non fa suonare niente.

**Quarto: sette falle di sicurezza gravi.** I dettagli te li ho dati in chat, perché questo deposito è pubblico. Qui compaiono solo col numero, da R262 a R268.

**Quinto: alcune porte per le persone sono strette.** Un fattorino in bici non si può approvare senza patente e polizza dell'auto. Un cliente con un ordine non riesce a cancellarsi. Il reclamo del cliente non arriva a nessuno e intanto blocca il bonifico al negozio.

## Cosa devi fare

- **Su Vercel, metti le tre chiavi che mancano**, poi **premi il pulsante degli aggiornamenti del database**. È rosso, è tuo. Senza questi tre passi il sito non apre, qualunque cosa ripari io.
- **Scegli come funziona il bonifico di rimborso al cliente.** Il registro dei fatti, dal 29/10, dice che tocchi «fatto» su un avviso. Il codice invece segue la semplificazione del 17/10, senza nessun «fatto». Dimmi quale vale, e lo costruisco.
- **Leggi in chat le sette falle gravi** e dimmi se partire subito con quelle.
- **Porta al commercialista una domanda nuova.** La consegna la incassa MyCity, ma per quei soldi oggi non nasce nessun documento fiscale. I Termini dicono al cliente di chiedere la fattura al negozio.
- **Guarda la richiesta di unione di questo referto** e firmala, se va bene.

Il passo dopo, se mi dai il via, è la prima ondata di riparazioni: i soldi dei contanti e gli avvisi, prima del primo lunedì.

## Cosa non ho verificato

- **Il sito vero nel browser non l'ho potuto aprire.** Le regole di rete di questa sessione bloccano il dominio del sito. Il revisore ha fatto girare lo stesso codice in una copia locale, con dati di prova: 116 visite su 41 pagine, da computer e da telefono.
- **Le prove degli attaccanti sono girate su copie del database rifatte da zero**, non sul database vero. Sul database vero ho fatto solo letture e conteggi, senza leggere dati personali.
- **Stripe non l'ho letto.** Il pagamento con carta è spento nel sito pubblicato, quindi i difetti della carta sono quasi tutti minori. Vanno ripresi prima di accenderla.
- **L'aspetto del sito non è in questa radiografia**: colori, impaginazione, telefono. Per quello c'è la radiografia del design, che è a parte.
- **I 996 difetti già aperti non li ho ricontrollati uno per uno.** Ho solo evitato di ritrovarli.
- **Un buco l'ho lasciato aperto apposta**: la consegna veloce non confermata. Ha già 28 difetti aperti, e il critico ha consigliato di rileggerla dopo averli chiusi.
- **Un errore mio, già rimediato.** La prima divisione in zone lasciava fuori 13 file. Fra questi c'erano i dati di prova del database e il programma che lavora in sottofondo nel telefono. Il critico se n'è accorto, e il terzo giro li ha letti.

---

## Dettagli tecnici

**Come è stata fatta.** Workflow `radiografia-100-marketplace` in 13 fette parallele, su 4 processori, quindi 2 agenti alla volta per fetta. Tre giri.

- **Giro 1 — 25 zone e 9 mandati trasversali.**
  - Zone: `stripe`, `ordini-cassa`, `resi-kyc-seller-api`, `checkout-carrello`, `admin-api`, `admin-pagine`, `seller-pagine`, `seller-componenti`, `cliente-account`, `pagine-pubbliche`, `ui-home-vetrine`, `componenti-radice-1/2`, `lib-radice-1/2`, `catalogo-query`, `api-varie-lib-piccole`, `migrazioni-1/2`, `auth-supabase-storage`, `ai-vision`, `cron-email-push`, `privacy-analytics-legale`, `rider-consegna`, `config-deploy`.
  - Mandati trasversali: `X-soldi`, `X-permessi-db-live`, `X-produzione-dal-vivo`, `X-sito-dal-vero`, `X-regole-business`, `X-prove-automatiche`, `X-flussi-utente`, `X-concorrenza`, `X-privacy-ciclo`.
- **Giro 2 — 8 angoli.** `Y-attaccante-anonimo`, `Y-attaccante-cliente`, `Y-attaccante-negozio-rider`, `Y-errori-silenziosi`, `Y-tempo-e-date`, `Y-promesse-vs-codice`, `Y-avvisi-e-notifiche`, `Y-dati-veri-incoerenti`.
- **Giro 3 — critico di completezza e 4 buchi.** I buchi: `Z-account-di-prova`, `Z-database-a-163`, `Z-rimborso-contanti`, `Z-documenti-fiscali`. Il quinto buco, la consegna veloce, è rinviato.

Catena per ogni revisore: chi cerca → verificatore avversariale (`qa`) → terza lente sui gravi (`qa`). In chiusura, un agente unisce i doppioni a parole diverse: 30 gruppi, 39 voci.

**Run.**
- Giro 1: `wf_b1104a48-3cb`, `wf_14c39273-7e2`, `wf_f7b539a5-8fa`, `wf_887c5ad4-ae1`, `wf_06985bbf-559`, `wf_eba38dbe-149`, `wf_c186769e-8fe`. Partiti il 4/11, fermati alle 19:25 per i limiti settimanali, ripresi il 5/11 alle 10:20 con i 19 revisori finiti presi dalla memoria.
- Giro 2: `wf_fc6ecaf1-fb0`, `wf_2208a977-c15`, `wf_1682094e-b7e`, `wf_477e1f32-703`.
- Chiusura: `wf_79044312-d4d`.
- Giro 3: `wf_a3f27daa-3a2`, `wf_53502b4f-d4b`.

**Il conto.** 107 agenti. Circa 17,1 milioni di token dei subagenti, come somma di quelli dichiarati dai workflow, con 16,73 milioni per le 13 fette. Non so se la somma conta anche i 19 revisori di ieri sera presi dalla memoria. `node cervello/conto-token.mjs` non è stato lanciato.

**Copertura.**
- 998 file su 998 nelle zone, con 0 file non letti dichiarati dalle zone.
- 13 file erano fuori dalle zone (`seeds/`, `public/`, `supabase/config.toml`) e sono stati coperti dal giro 3.
- I mandati trasversali dichiarano 149 letture parziali, elencate in `copertura.json` nello scratchpad della sessione.

**Prove eseguite.** 236 su 372, e 33 su 35 fra gravi e bloccanti. Le prove sul database girano su Postgres locale ricostruito con `tests/sql/harness/apply.sh`, fino alla 163 o fino alla 195. Le prove nel browser girano su un server locale.

**Controllo dal vero del 5/11 alle 11:50.** `orders` chiusi con la posizione del fattorino rimasta: 0, di cui 0 senza fattorino. Quindi oggi la 191 non ferma il pulsante.

**Falle riservate.** Da R262 a R294: 33 voci, 7 gravi e 26 minori. Dettagli solo nel referto privato consegnato in chat.

**Regressioni** (voci del registro date per chiuse e ritrovate): 427, 426, 254, 107, 113, 772, 1014, 52, 1285, 2157 e altre 14. Il numero della voce sta nel campo `gia_noto` di ogni scheda del grezzo.

### Bloccante — elenco completo

| # | Area | Difetto | Dove |
|---|---|---|---|
| 1 | rilascio | Oggi nessun cliente può ordinare: al sito vero manca la chiave di servizio del database | `lib/api/middleware.ts:249` |

### Grave — elenco completo

| # | Area | Difetto | Dove |
|---|---|---|---|
| 1 | rilascio | Falla di sicurezza R262 da chiudere (rilascio): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` |
| 2 | rilascio | Sul sito vero manca la chiave della posta: il negozio non riceverà l'email del nuovo ordine e il cliente nessuna conferma | `lib/email/client.ts:69-75 e 93-98 · app/api/orders/cod/route.ts:1469-1509 (sendEmail alle righe 1488 e 1506) · app/api/health/route.ts:94-150 (ENV_IMPORTANTI) · Vercel → variabili Production` |
| 3 | API | Se l'email «Nuovo ordine» al negozio non parte, nessuno se ne accorge e nessuno la rimanda | `lib/email/client.ts:164-184 · lib/stripe/webhook/comune.ts:250-263 · app/api/orders/cod/route.ts:1488 e :1506 · lib/stripe/webhook/ordini.ts:541-542 e :576 · lib/stripe/payout.ts:853 · lib/stripe/webhook/rimborsi.ts:330 · lib/stripe/webhook/fascia-al-pagamento.ts:146 · lib/stripe/webhook/giftcard.ts:172 e :178` |
| 4 | pagamenti | Il bonifico di rimborso al cliente non si può segnare come fatto, e nessuno controlla la scadenza dei 14 giorni | `lib/rimborsi/bonifici-da-fare.ts:124` |
| 5 | pagamenti | Il pannello dei bonifici non dice a Nicola quanto versare a ogni negozio il lunedì | `app/admin/payouts/page.tsx:50-66, 105, 129-132, 143-149, 196-201, 82-87` |
| 6 | pagamenti | Falla di sicurezza R264 da chiudere (pagamenti): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` |
| 7 | pagamenti | La pagina Guadagni, con i soli contanti, dice al negozio commissione zero e soldi mai versati | `app/seller/earnings/page.tsx:144-157, :179, :222-232, :283-300, :316-317 · lib/guadagni/negozio.ts:74-93 · lib/stripe/payout.ts:181-195 · app/api/cron/release-payouts/route.ts:369-375` |
| 8 | pagamenti | Un rimborso arrivato dopo il bonifico del lunedì non viene mai ripreso al negozio | `lib/stripe/payout.ts:921-927, 1662, 1672, 1869-1889` |
| 9 | pagamenti | Il bonifico del lunedì al negozio non si può segnare: i soldi dei contanti restano «in attesa» per sempre, sia per il negozio sia per Nicola | `lib/guadagni/negozio.ts:72-92` |
| 10 | pagamenti | Un reclamo chiuso a favore del negozio gli blocca ancora per sempre il bonifico di quell'ordine | `app/api/cron/release-payouts/route.ts:93` |
| 11 | privacy | La consegna è un incasso di MyCity, ma per quei soldi non nasce nessun documento fiscale e i Termini mandano il cliente a chiedere la fattura al negozio | `app/terms/page.tsx:184-188` |
| 12 | privacy | Le foto dei resi restano pubbliche su internet per sempre, anche dopo che il cliente cancella l'account | `app/orders/[id]/return/page.tsx:109-114 · lib/storage/carica-immagine.ts:131 · lib/storage/percorso-caricamento.ts:33 · lib/account/cancellazione.ts:85, :167-177 e :304-316 · migrations/002_categories_and_extras.sql:125 · components/seller/ReturnRequestCard.tsx:192-194` |
| 13 | privacy | Il negozio può chiudere un recesso senza rimborso dopo 14 giorni anche se il cliente ha riportato o spedito la merce, perché il cliente non ha modo di dirlo | `app/api/returns/[id]/avanza/route.ts:76-81,107,150-163,172-175 · lib/rimborsi/regole-del-rimborso.ts:377-386 · components/seller/ReturnRequestCard.tsx:64-68,159 · app/api/cron/release-payouts/route.ts:83,227,465 · migrations/153_il_reso_lo_apre_il_server_non_il_cliente.sql:85` |
| 14 | privacy | Lo sconto scritto su un evento appare ai clienti come «-20%», ma la cassa non lo applica mai | `app/admin/events/page.tsx:306` |
| 15 | privacy | Accogliere una segnalazione non toglie il prodotto: resta online, e a chi ha segnalato si scrive che è stato rimosso | `app/admin/segnalazioni/page.tsx:157` |
| 16 | flussi | Il reclamo del cliente non arriva a nessuno, e intanto ferma il bonifico al negozio senza dirglielo | `app/orders/[id]/dispute/page.tsx:72-81` |
| 17 | flussi | Se il fattorino sparisce senza dichiarare i contanti, l'ordine resta in consegna per sempre e l'amministratore non può chiuderlo | `lib/cassa/registra-incasso.ts:76-79` |
| 18 | flussi | Il fattorino in bici non può essere approvato senza patente di guida e polizza RC | `lib/admin/regole-approvazione.ts:34-40` |
| 19 | flussi | Dentro il pannello dell'amministratore non c'è la campanella: gli avvisi sui soldi da sistemare a mano si vedono solo uscendo dal pannello | `components/admin/AdminSidebar.tsx:30-64` |
| 20 | flussi | La posizione del negozio può finire lontano da Piacenza, o restare quella vecchia, e il modulo la salva lo stesso | `components/StoreLocationPicker.tsx:161-183 e :228-231 · app/api/geocode/route.ts:36 · app/api/seller/apply/route.ts:87-88 · app/seller/profile/page.tsx:56-60` |
| 21 | flussi | Passare dalla pagina Prodotti alla vetrina, o dalla vetrina ai Prodotti, manda in errore l'area del negozio | `components/seller/FeaturedProductsPicker.tsx:26-39 e :69 · app/seller/products/page.tsx:68-89 · lib/queries/keys.ts:156 · components/providers/QueryProvider.tsx:14-16 · components/VendorForm.tsx:338-345 · components/seller/CustomizationSection.tsx:17 · components/seller/site/CollectionFields.tsx:44-48 · app/seller/products/new/page.tsx:217-221` |
| 22 | flussi | La cassa può ordinare la quantità o la taglia vecchia se torni al carrello, la cambi e rientri entro mezzo minuto | `app/checkout/page.tsx:123` |
| 23 | flussi | Nicola non viene avvisato quando arriva un ordine: il primo allarme per un ordine non accettato parte dopo un'ora, non dopo 5 minuti | `app/api/cron/operational-alerts/route.ts:70-90` |
| 24 | flussi | Un fattorino nuovo non riesce a salvare i dati del primo passo se non ha già scritto le scadenze di patente e polizza | `app/rider/onboarding/page.tsx:142` |
| 25 | flussi | Chi ordina la sera per domani e conferma l'email la mattina dopo si ritrova la consegna spostata di un giorno | `lib/bozza-checkout.ts:61-79 (bozzaDaSalvare: nessuna data nella bozza) · lib/bozza-checkout.ts:139-163 (fasciaDaRimettere, giornoDaRimettere) · app/checkout/page.tsx:1248-1255 (salvataggio prima dell'accesso) · app/checkout/page.tsx:478-503 (ripristino al ritorno)` |
| 26 | flussi | La promo su una categoria non sconta niente, ma al negozio e ai clienti diciamo che è attiva | `app/seller/promotions/page.tsx:64, :93-106, :174, :245-257, :275 · migrations/122_radiografia_20_agosto.sql:268-291 (riga 285) · migrations/129_il_catalogo_si_vede_senza_account.sql:211-213 · migrations/031_seller_promotions.sql:4-18 · components/store-sections/PromotionsSection.tsx:9-29 · lib/store-site.ts:309 · lib/queries/promo-attive.ts:13-22` |
| 27 | flussi | Se il fattorino cambia solo il nome nel profilo, il suo telefono si cancella (e viceversa) | `app/rider/profile/page.tsx:73-84` |
| 28 | flussi | Un ordine fermo su «accettato» o «ritirato dal fattorino» non fa suonare nessun allarme e non scade mai | `app/api/cron/operational-alerts/route.ts:70-258 (interroga solo NEW, OUT_FOR_DELIVERY, DELIVERED, READY, ASSIGNED); app/api/cron/expire-stale-orders/route.ts:95 e :169 (solo NEW)` |
| 29 | regole del database | Chi ha fatto anche un solo ordine non riesce a cancellare il proprio account | `migrations/179_l_interruttore_sull_ordine_non_si_accende_da_fuori.sql:60-65 (chi è fidato) e :82-85 (il rifiuto); stessa costruzione già in migrations/127_minori_22_agosto.sql:321-324 e :341-344; prova finta in tests/sql/rls/31-la-cancellazione-non-lascia-l-indirizzo-di-casa.test.sql:83 (token service_role scritto a mano) e :109 (DELETE); chiamata reale in lib/account/cancellazione.ts:878; il difetto è descritto e lasciato aperto in tests/unit/chi-cancella-l-account-non-resta-col-profilo-svuotato.test.ts:19-27 e lib/account/cancellazione.ts:552` |
| 30 | regole del database | Falla di sicurezza R265 da chiudere (regole del database): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` |
| 31 | regole del database | Falla di sicurezza R266 da chiudere (regole del database): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` |
| 32 | regole del database | Falla di sicurezza R267 da chiudere (regole del database): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` |
| 33 | regole del database | Falla di sicurezza R268 da chiudere (regole del database): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` |
| 34 | accessi | Falla di sicurezza R263 da chiudere (accessi): i dettagli restano fuori dal deposito pubblico finché non è chiusa | `(nel referto privato)` |

### Minori per area

| Area | Minori |
|---|---|
| rilascio | 18 |
| API | 28 |
| pagamenti | 20 |
| privacy | 47 |
| flussi | 50 |
| regole del database | 11 |
| accessi | 18 |
| accessibilità | 17 |
| AI | 10 |
| dati | 19 |
| interfaccia | 95 |
| velocità | 4 |
