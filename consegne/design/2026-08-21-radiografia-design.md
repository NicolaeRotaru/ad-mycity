---
data: 2026-08-21 16:14
tipo: radiografia-design-marketplace
totale: 152
bloccanti: 4
gravi: 67
minori: 81
bloccanti_distinti: 3
agenti: 22
fonte_raw: consegne/design/2026-08-21-radiografia-design-raw.json
gemello_codice: consegne/audit/2026-08-21-radiografia.md
---

# Il pulsante di emergenza del fattorino è coperto da un altro pulsante, e sul telefono non si può premere

**In due righe.** Ho guardato il sito da fuori, in undici modi diversi, e ho
trovato 152 problemi veri, di cui 70 seri. Tre di quei 70 fermano qualcuno: il pulsante SOS del fattorino,
il tour che si apre sopra il pagamento, e la home che promette un'ora di
consegna mentre il resto del sito ne promette quarantotto.

## In parole semplici

Questa è la visita alla parte che si vede: come è fatto il sito, non come
funziona sotto. Undici modi diversi di guardarlo — l'impaginazione, i colori, i
caratteri, le immagini, il telefono, il percorso per comprare, le parole scritte
sui pulsanti, cosa succede mentre una pagina carica.

Ho trovato **centocinquantadue** problemi veri. Veri vuol dire che un secondo
collega è andato a ricontrollarli uno per uno nel codice. Chi li aveva trovati
ne aveva segnalati di più: quelli che il secondo non ha confermato sono stati
buttati via.

| | quanti |
|---|---:|
| Fermano qualcuno | 3 |
| Gravi (fanno danno ma si aggira) | 67 |
| Minori | 81 |
| **Totale** | **152** |

Un chiarimento sul primo numero, perché nel file dei dati grezzi ne conti
quattro. Il pulsante SOS l'hanno trovato in due, guardando da due parti diverse:
è lo stesso difetto contato due volte. **I difetti che fermano qualcuno sono
tre.**

Nove problemi su centocinquantadue si aggiustano **senza pubblicare niente**,
cambiando un'impostazione. Gli altri centoquarantatré vogliono una modifica al
codice, quindi anteprima e tua firma.

## Cosa cambia per te

**I tre che fermano qualcuno.**

**Il pulsante SOS del fattorino è coperto in pieno da quello dell'assistenza.**
I due pulsanti stanno nello stesso punto dello schermo. Stessa misura, stesso
livello. Quando due cose sono allo stesso livello vince quella disegnata dopo,
che è l'assistenza. Sul telefono il SOS non si può premere, e il telefono è
l'unico posto dove un fattorino lavora. È il pulsante che si usa quando qualcuno
è in difficoltà per strada.

**Il tour di benvenuto si apre sopra la pagina del pagamento.** Il suo ultimo
pulsante porta via dall'ordine. Il tour parte per chi si è appena registrato, un
secondo e mezzo dopo l'apertura della pagina. Nessuna pagina è esclusa. E il
sito chiede l'account proprio all'ultimo clic: quindi quasi tutti si registrano
mentre stanno comprando. Il tour gli compare davanti mentre pagano, e il
pulsante finale li manda alla ricerca.

**La home promette la consegna in 30-60 minuti.** Ogni altra pagina del sito
promette 24-48 ore. La frase sbagliata è nel riquadro grosso in cima, quello
salvato nelle impostazioni. Chi arriva legge un'ora, chi ordina scopre due
giorni. Questo si cambia senza pubblicare niente: è una frase in un campo.

**Sotto ai tre viene il gruppo che costa di più: i soldi promessi e non
mantenuti.** Il carrello e la cassa non dicono lo stesso totale quando i negozi
sono più di uno. La scheda prodotto scrive «Spedizione gratuita» mentre nel
carrello compaiono 3 € di consegna per ogni negozio. Al checkout c'è scritto
«Hai la spedizione gratis» e nel riquadro sotto la spedizione viene addebitata. I
«5 € di benvenuto» sono promessi in tre punti del sito e alla cassa non si
applicano da nessuna parte. E il prezzo scontato che vedi nella vetrina non è
quello che ti mostra la cassa.

Un esempio di cosa vuol dire per una persona vera. Giulia vede una scatola di
biscotti a 7 €, «spedizione gratuita». La mette nel carrello: compaiono 3 € di
consegna. Va a pagare: il prezzo torna a 10 € e un riquadro giallo le dice che
«il prezzo è cambiato». Paga 7 € davvero, ma a quel punto ha già smesso di
fidarsi.

**Poi c'è il telefono**, che è dove sta il tuo cliente. Toccare la barra di
ricerca fa zoomare la pagina su iPhone. Nel carrello «Rimuovi» è un bersaglio da
venti pixel attaccato al «+», e cancella senza chiedere conferma. La tendina
«dove ti consegniamo» esce dallo schermo. Sulle schede dei prodotti in
promozione il pulsante «+» resta tagliato fuori dal bordo.

## Cosa devi fare

**Uno: il SOS lo ripariamo subito o no.** È una modifica piccola, cioè spostare
un pulsante. Ma è codice, quindi serve la tua firma. Te lo chiedo separato dal
resto perché è la sicurezza di una persona per strada.

**Due: la frase della home la sistemo io?** Dei tre che fermano qualcuno è
l'unico che non richiede un rilascio del sito. Dimmi quale promessa è quella
vera, 30-60 minuti oppure 24-48 ore. La allineo ovunque.

**Tre: dei sessantasette gravi, dimmi se parto dai nove sui soldi promessi.**
Sono quelli dove il sito dice un numero e ne fa un altro. Non è grafica: è
fiducia, ed è il motivo per cui uno non torna.

## Cosa non ho verificato

**Non ho guardato una sola pagina con gli occhi.** Nessuno screenshot, nessun
browser aperto. Tutto è letto nel codice, nei fogli di stile e nelle
impostazioni salvate. I conti sulle larghezze sono aritmetica sulle misure
scritte nel codice, non una foto dello schermo. Un esempio è «a 360 pixel di
schermo il pulsante esce di venti». Su questi la mia confidenza è alta, ma non
è una prova.

**Non ho provato il sito su un telefono vero**, né iPhone né Android, né la
versione installabile. Quello che dico dell'iPhone viene da come sono scritte le
misure dei caratteri nei campi, che è la causa nota di quel comportamento.

**Non ho misurato la velocità reale delle pagine.** Dove dico «arriva vuota»
sto leggendo come è costruita la pagina, non un tempo cronometrato.

**Non ho toccato niente.** Nemmeno i nove che si cambiano da un'impostazione:
sono proposte, non fatti.

---

## Dettagli tecnici

Come è stata fatta: workflow `audit-design`, undici dimensioni in sola lettura
sul repo `NicolaeRotaru/mycity` (commit `6f32b01`) più la lettura di
`site_settings` dal database. Ogni dimensione ha avuto un senior che cerca e il
cancello tecnico `qa-designer` che ricontrolla e scarta ciò che non conferma —
ventidue agenti in tutto.

Dati grezzi completi di tutti e 152: `consegne/design/2026-08-21-radiografia-design-raw.json`.

Corsie: 9 in `config` (site_settings — 1 bloccante, 1 grave, 7 minori), 143 in
`codice`.

Conteggio per dimensione:

| dimensione | bloccanti | gravi | minori |
|---|---:|---:|---:|
| layout-responsive | 1 | 4 | 9 |
| coerenza-brand | 0 | 5 | 6 |
| tipografia | 0 | 5 | 5 |
| accessibilita-visiva | 0 | 6 | 7 |
| stati-ui | 0 | 9 | 9 |
| immagini-media | 0 | 7 | 6 |
| mobile-pwa | 1 | 6 | 13 |
| flussi-conversione | 1 | 9 | 4 |
| microcopy | 1 | 5 | 12 |
| navigazione-gerarchia | 0 | 6 | 6 |
| performance-percepita | 0 | 5 | 4 |

## Bloccanti — 4


### layout-responsive


**1. Il pulsante SOS del fattorino è coperto in pieno dal pulsante Assistenza sul telefono**

- Dove: `components/rider/SOSButton.tsx:84 + components/SupportChatButton.tsx:45 (montato in app/layout.tsx:130) — pagine /rider*`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO nel codice. I due pulsanti flottanti hanno la stessa identica scatola: `fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full`. Su /rider il SOS c'è sempre (app/rider/layout.tsx:38 passa showSOS={isRider}, RiderShell.tsx:64 lo monta) e SupportChatButton non si nasconde per il fattorino: le righe 27-35 lo tolgono solo ad admin, compratori e anonimi. Stesso livello di sovrapposizione (z 40, il token 'overlay' che tailwind.config.ts:129 commenta proprio come «SOS button, FAB»): a parità di livello vince chi viene dopo nell'ordine della pagina, e SupportChatButton è fratello successivo di <main>, mentre il SOS sta dentro. Nessuno dei due crea un contesto di sovrapposizione proprio (il genitore in RiderShell.tsx:57 è relative ma senza z-index), quindi il confronto è diretto: l'Assistenza copre il SOS al 100%. Sotto i 768px il SOS è cliccabile zero volte. Sopra i 768px non succede perché l'Assistenza scende a bottom-6, ma il fattorino lavora dal telefono. È il pulsante di emergenza: per questo resta bloccante.
- Come si ripara: Dare al SOS un livello e un angolo suoi: alzarlo a un token dedicato sopra 'overlay' (es. z-45/z-toast) e spostarlo (bottom-40, oppure a sinistra) — oppure nascondere SupportChatButton dentro /rider, dove l'assistenza è già dentro il flusso SOS. In più separare i due token di z-index: oggi SOS e FAB condividono lo stesso layer per progetto.

### mobile-pwa


**2. Il pulsante SOS del fattorino è coperto da quello dell'assistenza**

- Dove: `components/rider/SOSButton.tsx:84 + components/SupportChatButton.tsx:44 (montato in app/layout.tsx:130)`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO riga per riga. SOSButton: `fixed bottom-24 right-4 z-40 ... rounded-full w-14 h-14`. SupportChatButton: `fixed bottom-24 md:bottom-6 right-4 z-40 ... rounded-full w-14 h-14` — sotto i 768px le coordinate sono identiche. Il fattorino vero vede il SOS (app/rider/layout.tsx passa `showSOS={isRider}`, RiderShell.tsx:41 default true) e vede ANCHE l'assistenza: la guardia `hidden` di SupportChatButton nasconde solo non-autenticati, admin, buyer, le pagine di accesso e i thread chat — le rotte /rider non sono escluse, e il commento del file dice esplicitamente «disponibile a seller e rider loggati». Stesso z-index 40 e SupportChatButton è più in basso nel DOM (layout.tsx riga 130, dopo il `<main>` che contiene RiderShell), quindi vince e copre. Confermato anche che non c'è nessun contesto di impilamento intermedio: l'antenato di SOSButton è un `div.relative` senza z-index, quindi entrambi vivono nella pila della radice. Risultato: il fattorino in strada preme il cerchio in basso a destra e apre la chat di assistenza; il pulsante rosso di emergenza non è raggiungibile in nessun modo.
- Come si ripara: In components/SupportChatButton.tsx aggiungere `pathname.startsWith('/rider')` alla condizione `hidden` — per il fattorino l'assistenza vive già nella tab Profilo. Prova che gira: test Playwright su /rider come utente rider che verifica che nel viewport ci sia un solo elemento fisso a `right-4 bottom-24` e che il suo aria-label sia «SOS emergenza».

### flussi-conversione


**3. Il tour di benvenuto si apre SOPRA il checkout e il suo ultimo pulsante porta via dall'ordine**

- Dove: `components/BuyerOnboardingTour.tsx (STEPS[2].href = '/search') montato in app/layout.tsx:133`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO nel codice. Il tour e montato nel layout radice (app/layout.tsx, riga 133) senza nessuna esclusione di pagina: l'unica condizione e isAuthenticated && isBuyer && !onboarded, con un ritardo di 1,5 secondi. E' esattamente la condizione di chi si e appena registrato per ordinare e torna su /checkout con il returnTo: si trova un velo nero a tutto schermo (fixed inset-0 z-50) sopra il modulo gia compilato. I tre passi si chiudono con un pulsante grande «Inizia a esplorare» che e un Link verso /search (STEPS[2].href): il percorso piu naturale — premere il pulsante colorato grosso — porta fuori dal checkout, a un passo dall'ordine. L'unica via per restare e la X piccola in alto a destra. Verificato anche che handle_new_user crea il profilo con role='buyer' per chi si registra come acquirente, quindi isBuyer e vero fin dal primo accesso.
- Come si ripara: Non montare il tour sulle pagine d'acquisto: in BuyerOnboardingTour leggere il percorso corrente (usePathname) e uscire subito se e /checkout, /cart o /orders. E togliere l'href dall'ultimo passo quando il tour parte da una di quelle pagine: l'ultimo pulsante deve chiudere il velo e lasciare la persona dov'era, non spostarla su /search.

### microcopy


**4. La home promette la consegna in 30-60 minuti, tutto il resto del sito promette 24-48 ore**

- Dove: `site_settings.home_site → sezione hero, campo subhead (resa da components/home-sections/HomeSectionRenderer.tsx:85) · contraddice app/page.tsx:29, app/shipping/page.tsx:47, app/faq/page.tsx:39, app/layout.tsx:44, app/cart/page.tsx:181`
- Corsia: config (si cambia senza rilascio)
- Cosa succede: CONFERMATO leggendo il record vero (query di sola lettura su site_settings id=1, progetto Mycity): il sottotitolo dell'hero salvato in home_site dice «…ordini dai commercianti del tuo quartiere in pochi tap, arriva a casa in 30-60 min e paghi alla consegna.» Il renderer dà la precedenza alla configurazione (HomeSectionRenderer.tsx riga 85: `c.subhead ? c.subhead : heroDefaults.subhead`) e la home legge davvero quella colonna (app/page.tsx:69), quindi in pagina vince il database sul testo scritto nel codice, che dice «A casa in 24-48h» (app/page.tsx:29). Tutto il resto del marketplace promette 24-48 ore: pagina Spedizioni («La maggior parte degli ordini viene consegnata in 24-48 ore», app/shipping/page.tsx:47), FAQ («Le consegne avvengono in 24-48h», app/faq/page.tsx:39), descrizione su Google (app/layout.tsx:44), carrello (app/cart/page.tsx:181). Il cliente che ordina alle 18 aspettandosi le 19 e riceve il giorno dopo si sente preso in giro, e quel reclamo arriva al negoziante.
- Come si ripara: Da /admin/home riscrivere il sottotitolo dell'hero allineandolo alla promessa unica del sito: «…ordini dai commercianti del tuo quartiere, paghi alla consegna e ricevi a casa in 24-48h». Se un giorno si vuole davvero promettere 30-60 minuti, si cambia in un colpo solo dappertutto, non solo in home.

## Gravi — 67


### layout-responsive


**1. Sulla scheda prodotto in griglia mobile il pulsante «+» resta tagliato su ogni prodotto scontato**

- Dove: `components/ProductCard.tsx:207-227 (riga prezzo) — visibile in ProductGrid.tsx:444 (grid-cols-2) e nelle rail ProductGrid.tsx:415 (w-40)`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO, e ho controllato il punto che poteva farlo cadere: il formato del prezzo. lib/format.ts:1 scrive `€${n.toFixed(2)}` — «€129.90», tutto attaccato, nessuno spazio. Quindi il testo non ha nessun punto dove andare a capo e in flexbox non può restringersi sotto la sua larghezza piena: la riga ha una larghezza minima incomprimibile. La riga è `flex items-center gap-1.5` con prezzo (text-base, font-extrabold),…
- Come si ripara: Nella riga prezzo mettere il blocco dei prezzi in un `<div className="min-w-0 flex-1">` con il barrato che può troncare, oppure impilare barrato sopra e prezzo sotto sulle card strette (sm:flex-row), oppure ridurre il bottone a h-10 w-10 e il prezzo a text-sm sotto i 640px. Va verificato a 360px…

**2. Sul tablet il riquadro d'acquisto della scheda prodotto scivola sotto la galleria, con mezza colonna vuota accanto**

- Dove: `app/product/[id]/page.tsx:458 (griglia), :460 :608 :808 (i tre figli); components/StickyAddToCart.tsx:54`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO contando i figli veri della griglia. La griglia è `grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_320px]` e si chiude alla riga 888. Dentro ci sono tre figli in flusso: galleria (:460), colonna info (:608) e riquadro d'acquisto (:808). Il visore a schermo intero (:546) è `fixed inset-0`, quindi non è un elemento della griglia e non conta — l'ho controllato apposta perché sarebbe stato il modo di…
- Come si ripara: O far scattare le tre colonne già da md (`md:grid-cols-[1fr_1fr_300px]`), o tenere due colonne fino a lg dando al riquadro d'acquisto `md:col-span-2` (a piena larghezza sotto), o estendere StickyAddToCart fino a lg (`lg:hidden` invece di `md:hidden`). Verificare a 768, 820 e 1024px.

**3. Al checkout il banner dei cookie copre la barra «Conferma ordine» sul telefono**

- Dove: `components/CookieBanner.tsx:92 contro app/checkout/page.tsx:968`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO, catena completa. La barra di conferma del checkout è `lg:hidden fixed inset-x-0 bottom-0 z-sticky`, cioè livello 20. Il banner cookie è `fixed inset-x-0 bottom-[var(--tabbar-height)] md:bottom-0 z-[100]`. Su /checkout la barra a schede si nasconde (MobileTabBar.tsx:53) e nel farlo mette la classe `senza-tabbar` sul body (riga 62-65), che in globals.css:209 azzera `--tabbar-height`: il banner si appoggia…
- Come si ripara: Aggiungere alla barra di conferma lo stesso scostamento dello sticky prodotto: `style={{ bottom: 'calc(env(safe-area-inset-bottom,0px) + var(--altezza-banner-cookie, 0px))' }}` (e togliere bottom-0). Meglio ancora: farne una regola sola, perché la stessa dimenticanza si ripete ovunque nasca una…

**4. Nell'area venditore il tasto Copilot e il tasto Assistenza si sovrappongono su desktop**

- Dove: `components/seller/SellerShell.tsx:412 contro components/SupportChatButton.tsx:45 — tutte le pagine /seller*`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO. Il Copilot è `fixed bottom-6 right-6 z-overlay` (livello 40), una pillola di circa 109x48px: occupa da 24 a 133px dal bordo destro e da 24 a 72px dal basso. L'Assistenza è `fixed bottom-24 md:bottom-6 right-4 z-40`, un cerchio di 56px: da 16 a 72px dal bordo destro, da 24 a 80px dal basso. Da 768px in su le due scatole si accavallano per circa 48px in orizzontale e 48 in verticale, e a parità di livello…
- Come si ripara: Scegliere un solo tasto flottante per area: o togliere il FAB Copilot (resta quello in barra laterale), o nascondere l'Assistenza dentro /seller. Se devono convivere, impilarli in una colonna sola con lo stesso `right` e passi verticali distinti (es. right-6 con bottom-6 e bottom-24), non due…

### coerenza-brand


**5. La stessa stella di rating è gialla in cinque modi diversi, e il giallo bocciato per leggibilità è tornato in otto punti**

- Dove: `components/ui/RatingStars.tsx vs components/store-sections/ReviewsSection.tsx:16-28 e :192, StoreListRow.tsx:51, home/HeroStoreCard.tsx:127, StorePreviewCard.tsx:88, products/SellerCard.tsx:145, store-sections/HeroSection.tsx:182, app/lists/page.tsx:138 e :190, seller/ProductImagesField.tsx:204`
- Corsia: codice (serve un rilascio)
- Cosa succede: Verificato riga per riga. components/ui/RatingStars.tsx si dichiara "unica fonte di verità per la visualizzazione delle stelle" e un fix precedente (il #149, citato nel commento) l'ha portata ad accent-700 perché accent-500 misurava 2,16 contro 1 di contrasto. Ho rifatto il calcolo io: accent-500 è #E8A33D e su bianco misura 2,157:1 — cioè esattamente il numero che quel fix aveva dichiarato inaccettabile. Il…
- Come si ripara: Cancellare AverageStars da ReviewsSection.tsx e sostituire con <RatingStars rating={…} /> anche alla riga 192: la primitiva gestisce già piene/mezze/vuote e l'aria-label. Stessa sostituzione nei sei punti che mostrano un voto (StoreListRow, HeroStoreCard, StorePreviewCard, SellerCard, HeroSection…

**6. Nel sito convivono due scale di caratteri: quella del design system e una seconda scritta a mano 323 volte**

- Dove: `323 occorrenze in app/ e components/ — top file: components/seller/SellerShell.tsx, app/rider/earnings/page.tsx, app/search/page.tsx, app/rider/page.tsx, app/rider/profile/page.tsx, components/admin/AdminSidebar.tsx`
- Corsia: codice (serve un rilascio)
- Cosa succede: Contato io, non ripreso dalla segnalazione. La scala ufficiale è definita in tre posti coerenti (tailwind.config.ts, design-system/tokens/typography.css, app/globals.css:21-31): 10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60 px. Nel codice ci sono 323 misure scritte a mano fra parentesi quadre contro 1966 usi della scala vera: una dichiarazione su sette è fuori sistema. Le cinque più frequenti sono misure che nella…
- Come si ripara: Sostituzione meccanica, senza discussioni di gusto: text-[10px]→text-2xs, text-[12px]→text-xs, text-[14px]→text-sm (le tre che hanno già il loro gradino). Per i quattro orfani veri (11, 13, 15, 17) decidere una volta sola se arrotondare al gradino vicino (11→xs, 13→sm, 15→sm, 17→lg) oppure…

**7. L'errore è rosso in due rossi diversi, e il colore ufficiale dell'errore non è usato nemmeno una volta**

- Dove: `components/ui/Button.tsx:29 (red-600) vs 30 file con rose-* — fra cui components/SellerApplicationForm.tsx:109 e :339, components/checkout/CouponInput.tsx:65, components/seller/ProductImagesField.tsx:144, components/VendorForm.tsx:262 e :326 (red-500); token mai usato in design-system/tokens/colors.css:112 e app/globals.css:72`
- Corsia: codice (serve un rilascio)
- Cosa succede: Il sistema definisce --danger: #DC2626 come colore semantico dell'errore, in design-system/tokens/colors.css:112 e in app/globals.css:72. Ho cercato var(--danger), var(--success) e var(--warning) in tutti i componenti: zero usi. Le uniche occorrenze sono le tre righe di globals.css che ridefiniscono l'alias a se stesso (--color-danger: var(--danger)). Al loro posto convivono due rossi per la stessa cosa: i messaggi…
- Come si ripara: Scegliere UN rosso per l'errore. Raccomando red-600, perché è già il valore di --danger e coincide col bottone danger di Button.tsx: si tocca meno codice. Poi sostituire le occorrenze rose-* di significato "errore" con quel valore e le red-500 con red-600, ed esporre il token come utility…

**8. Quando qualcuno manda un link di MyCity su WhatsApp, il nome appare nel carattere del telefono, non nel nostro**

- Dove: `app/opengraph-image.tsx:25, app/store/[id]/opengraph-image.tsx:46, app/product/[id]/opengraph-image.tsx:51`
- Corsia: codice (serve un rilascio)
- Cosa succede: Le tre immagini di anteprima social — quelle che compaiono quando si incolla un link in una chat o su Facebook — sono generate da app/opengraph-image.tsx, app/store/[id]/opengraph-image.tsx e app/product/[id]/opengraph-image.tsx. Tutte e tre impostano fontFamily: 'system-ui, sans-serif' (righe 25, 46, 51) e nessuna passa l'opzione fonts a ImageResponse: verificato, la parola "fonts:" non compare in nessuno dei tre…
- Come si ripara: Caricare Fraunces e Inter dentro ImageResponse con l'opzione fonts. Attenzione a un dettaglio che la segnalazione dava per scontato: nel repo NON ci sono file di carattere (nessun .ttf o .woff fuori da node_modules), perché i caratteri arrivano da next/font/google. Quindi vanno prima messi in…

**9. 78 pulsanti sono cuciti a mano invece di usare il pulsante di sistema, e alcuni sono troppo piccoli da premere**

- Dove: `almeno 64 occorrenze in 54 file — prova in app/auth/verify-email/page.tsx:66; densità maggiore in app/category/[slug]/page.tsx (282, 324, 433, 468), components/Navbar.tsx (113, 245), components/seller/SellerShell.tsx (269, 361), components/seller/StripeConnectButton.tsx (127, 137)`
- Corsia: codice (serve un rilascio)
- Cosa succede: components/ui/Button.tsx è la primitiva ufficiale, con 6 varianti e 3 misure, e il commento in cima dichiara l'intenzione: "1 component, 4 variant, 3 size. Niente più. La complessità muore qui prima di propagarsi". Fra le misure, md e lg garantiscono min-h-[44px], il bersaglio minimo per un dito, messo lì apposta dalla nota di accessibilità nello stesso file. Ho contato con uno script che legge i tag su più righe:…
- Come si ripara: Non serve convertirli tutti in un colpo. Partire dai bottoni di azione primaria nei percorsi che portano soldi — verify-email (righe 66 e 94), checkout, carrello, scheda prodotto, StripeConnectButton.tsx:127 e :137 — sostituendoli con <Button variant="primary">: sono quelli dove il bersaglio…

### tipografia


**10. Cinquantatré titoli senza misura cadono sul default: 30 pixel per i sottotitoli, 20 per i sotto-sottotitoli**

- Dove: `app/globals.css righe 155-157 (causa radice) · si vede in components/ui/Modal.tsx:143, app/search/page.tsx:281, app/category/[slug]/page.tsx:339, app/admin/branding/page.tsx:96, app/come-funziona/page.tsx:67`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, conteggio riprodotto esatto. In globals.css (righe 150-157) c'è una regola che dà una misura a tutti i titoli dell'HTML: h1 48 pixel (--text-5xl), h2 30 (--text-3xl), h3 20 (--text-xl). Il commento nel codice dice che è voluta e che le classi Tailwind vincono — vero, ma vale solo dove il componente una classe di dimensione la scrive. Ho ricontato i titoli scoperti con uno script: 31 su 161 sottotitoli…
- Come si ripara: Dare a ogni titolo una classe di dimensione presa dalla scala (text-base, text-lg, text-xl…). Sui due componenti condivisi che valgono da soli metà del problema: nel Modal metti al titolo `text-lg` (18 pixel), nelle colonne filtri di Ricerca e Categoria `text-base` (16). Poi passa gli altri 51. Per…

**11. Nella pagina Impostazioni il sotto-paragrafo esce più grande del paragrafo che lo contiene**

- Dove: `app/profile/settings/page.tsx — titolo di pagina riga 280; titoli di sezione alle righe 317, 344, 358, 369, 410, 473, 527; sotto-titoli alle righe 447, 481, 501, 513, 536, 568`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO riga per riga. La gerarchia è rovesciata. Il titolo di pagina (riga 280) è `text-2xl md:text-3xl`, cioè 24 pixel (30 su schermo grande). I sette titoli di sezione hanno tutti `text-lg`, cioè 18 pixel. I sei sotto-titoli dentro quelle sezioni hanno solo `font-bold`, nessuna classe di dimensione, quindi cadono sulla regola h3 di globals.css ed escono a 20 pixel. Risultato: il figlio è 2 pixel più grande del…
- Come si ripara: Mettere `text-base` (16 pixel) ai sei sotto-titoli delle righe 447, 481, 501, 513, 536, 568. Così la scala torna nell'ordine giusto: 24 pagina, 18 sezione, 16 sotto-sezione.

**12. Nella scheda prodotto il nome della cosa che vendi è più piccolo del prezzo**

- Dove: `components/ProductCard.tsx righe 182, 185, 188, 210, 211, 216 — più il censimento su tutto il progetto`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, righe e conteggio riprodotti esatti. La scheda prodotto è l'unità che si ripete più di ogni altra sul sito: home, categoria, ricerca, vetrina negozio. Dentro, le misure sono queste: iniziali del negozio `text-[8px]` (riga 182), nome del negozio `text-[11px]` (185), NOME DEL PRODOTTO `text-[13px]` (188), prezzo pieno barrato `text-[11px]` (211), prezzo `text-base` = 16 pixel (210 e 216). Il nome del…
- Come si ripara: Nella scheda prodotto: nome del prodotto ad almeno `text-sm` (14 pixel), meglio `text-base` (16); nome del negozio a `text-xs` (12); togliere gli 8 pixel delle iniziali facendo il cerchietto più grande (oggi h-4 w-4) e portando la sigla a 10 pixel, oppure sostituendola con la foto del negozio. Poi…

**13. La barra di ricerca e il campo del codice sconto fanno ingrandire la pagina da soli sull'iPhone**

- Dove: `components/SearchBar.tsx:174 · components/checkout/CouponInput.tsx:60 · app/stores/page.tsx:202 e 215 · app/category/[slug]/page.tsx:166 · components/NewsletterForm.tsx:72 · e altri casi lato cliente`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO nella sostanza, CORRETTI due numeri. Safari su iPhone ingrandisce la pagina da solo quando uno tocca una casella di testo con carattere sotto i 16 pixel. La primitiva dei campi del sito lo sa e fa la cosa giusta: components/ui/Field.tsx riga 30 usa `text-base` e alla riga 22 c'è il commento che spiega il perché («per non innescare lo zoom automatico su iOS»). Il problema è chi la scavalca scrivendo il…
- Come si ripara: Far passare quei campi dalla primitiva Input/Select di components/ui/Field.tsx, che è già a posto. Dove non conviene rifare il componente, basta cambiare `text-sm` in `text-base` sulla casella. Partire dai due che contano: barra di ricerca e codice sconto.

**14. Il testo bianco sul banner della home sparisce se la foto caricata è chiara**

- Dove: `components/home-sections/HomeSectionRenderer.tsx righe 397-414 (blocco «banner» della home builder)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, conto del contrasto rifatto e coincide alla seconda cifra. Il banner della home è un blocco che l'admin compone da /admin/home: carica una foto, scrive un titolo e un sottotitolo, e sceglie il velo fra «scuro», «chiaro» e «niente» (riga 401). Il velo scuro è `bg-black/40`, cioè nero al 40 per cento. Su una foto chiara — un muro bianco, un cielo, un piatto su tovaglia chiara — il composto viene grigio…
- Come si ripara: Copiare la soluzione che già gira nella copertina del negozio: al posto del velo piatto, un gradiente `linear-gradient(180deg, rgba(28,26,24,0.12) 0%, rgba(28,26,24,0.78) 100%)` sotto il testo. Per il caso «chiaro» alzare il velo da `bg-white/30` ad almeno `bg-white/70`. E passare da `drop-shadow`…

### accessibilita-visiva


**15. Nel catalogo degli otto colori per le vetrine ce n'è uno che boccia il testo bianco**

- Dove: `lib/store-customization.ts:19-28 (ACCENT_PRESETS, riga 23) · components/store-sections/BannerSection.tsx:20`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, misurato riga per riga. Il file lib/store-customization.ts:19-28 dichiara in un commento che quelli sono «colori brand-safe per l'accent della vetrina (sfondo con testo bianco)» e che sono «tutti a livello ~-600 per garantire contrasto su testo bianco». Ho rifatto io il conto con la formula WCAG sugli otto codici veri: terracotta #C0492C 4,96 · bordeaux #B82A28 6,18 · senape #C4801F 3,25 · oliva #5A7C42…
- Come si ripara: In lib/store-customization.ts:23 cambiare l'esadecimale del preset 'senape' da #C4801F ad #9D621C (è accent-700, già nella palette del progetto): a occhio è la stessa tinta calda, ma il bianco sopra sale a 5,00:1 e passa. Una riga sola, e i negozi che hanno già scelto senape — cioè Pane Quotidiano…

**16. Il bordo dei campi da compilare è quasi invisibile, su tutti i moduli del sito**

- Dove: `components/ui/Field.tsx:33 (costante CONTROL_OK) + 464 usi di border-cream-300 in 181 file di app/ e components/`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. La primitiva dei moduli — quella da cui passano accesso, registrazione, indirizzi e pagamento — disegna il riquadro dei campi con border-cream-300 (#EEDFBA): components/ui/Field.tsx:33, costante CONTROL_OK. Il campo dentro è bianco (bg-white, riga 30), quindi il bordo misura 1,32:1 contro il campo stesso, mentre WCAG 1.4.11 chiede almeno 3:1 al contorno che fa capire dove finisce un controllo. E la…
- Come si ripara: In components/ui/Field.tsx:33 portare CONTROL_OK da 'border-cream-300' ad almeno 'border-ink-400' (#78716C, 4,80:1 sul bianco). Attenzione: border-cream-500 (#D9B36F) fa 1,98:1 e border-ink-300 (#A8A29E) fa 2,52:1 — nessuno dei due arriva a 3:1, quindi non risolvono. Il cream-300 va lasciato ai…

**17. I filtri della vetrina del negozio non dicono come si chiamano**

- Dove: `components/StoreProductExplorer.tsx:71, 108-109, 125-126`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, con una correzione sul conteggio. In components/StoreProductExplorer.tsx le scritte 'Ordina per' (riga 108) e 'Categoria' (riga 125) stanno in un <label> che non è agganciato al menù a tendina sotto: niente htmlFor, niente id, e il label non contiene il select — sono due elementi affiancati. Per un lettore di schermo quei due menù si chiamano solo 'casella combinata'. Il campo di ricerca dei prodotti…
- Come si ripara: In components/StoreProductExplorer.tsx avvolgere i due <select> (righe 109 e 126) dentro il rispettivo <label>, esattamente come in app/search/page.tsx:148 — oppure dare al label un htmlFor e al select l'id corrispondente. Sul campo di ricerca (riga 71) aggiungere aria-label="Cerca nei prodotti del…

**18. Il riquadro che segue il tasto Tab viene tagliato via dalle schede prodotto**

- Dove: `components/ProductCard.tsx:125 e :130`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO nel codice, non a video. La scheda prodotto è un contenitore con overflow-hidden (components/ProductCard.tsx:125). Dentro, il link che copre tutta la scheda è in posizione assoluta con inset-0 — cioè occupa esattamente il riquadro del contenitore — e disegna il suo contorno di fuoco con focus-visible:outline-offset-2 (riga 130), cioè 2 pixel FUORI dal proprio bordo. Quei 2 pixel cadono fuori dall'area che…
- Come si ripara: Due strade, entrambe da una riga. La più pulita: togliere overflow-hidden dal contenitore (riga 125) e lasciarlo solo sul riquadro della foto, che ce l'ha già (riga 152). In alternativa: sul link cambiare focus-visible:outline-offset-2 in focus-visible:outline-offset-[-3px], così il contorno si…

**19. I filtri accesi si riconoscono solo dal colore**

- Dove: `app/search/page.tsx:215 · app/stores/page.tsx:204,225,234 · components/StoreProductExplorer.tsx:175 · app/profile/gift-cards/page.tsx:185`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, con due falsi positivi tolti. I pulsanti-pillola che accendono un filtro cambiano solo fondo e colore del testo quando sono attivi, e non dicono allo strumento di lettura che sono premuti: manca aria-pressed. Un lettore di schermo annuncia '4+ pulsante' identico sia acceso che spento, quindi chi non vede non sa quali filtri sta applicando (WCAG 4.1.2, e 1.4.1 perché lo stato è affidato al solo colore).…
- Come si ripara: Aggiungere aria-pressed={condizioneAttiva} su ognuno dei sei pulsanti-pillola confermati: app/search/page.tsx:215 · app/stores/page.tsx:204, 225, 234 · components/StoreProductExplorer.tsx:175 · app/profile/gift-cards/page.tsx:185. È un attributo per riga, il disegno non cambia.

**20. Il controllo automatico sull'accessibilità è stato messo a bassa voce**

- Dove: `.eslintrc.json:18-22 (regole jsx-a11y declassate a warn)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, e l'ho rieseguito io adesso: i numeri tornano al pezzo. Il progetto ha già installato il controllore di accessibilità del codice (jsx-a11y, in modalità 'recommended', .eslintrc.json:4). Ma nel file cinque delle sue regole sono declassate da 'errore' ad 'avviso' (righe 18-22): label agganciata al campo, click senza equivalente da tastiera, elementi non interattivi resi cliccabili, e l'autofocus. Un avviso…
- Come si ripara: In .eslintrc.json riportare a "error" almeno jsx-a11y/label-has-associated-control, DOPO aver sistemato i 52 casi (altrimenti la pubblicazione si blocca subito). Sulle altre regole i falsi positivi sono molti (i veli dei riquadri modali, che si chiudono già con Esc): lì conviene lasciare l'avviso…

### stati-ui


**21. La dashboard del negozio gira all'infinito se il caricamento va storto**

- Dove: `app/seller/dashboard/page.tsx:153 · app/seller/analytics/page.tsx:180-181 · app/admin/funnel/page.tsx:155 · app/profile/referral/page.tsx:52 · components/seller/site/SiteEditor.tsx:110`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO su tutte e cinque le schermate. Tutte scrivono `if (isLoading || !dati) return <LoadingState />` e nessuna destruttura `isError`. Il provider (components/providers/QueryProvider.tsx, riga 25) è impostato su `retry: 1`: dopo il secondo tentativo la query va in errore, `isLoading` torna falso, i dati restano vuoti, quindi `!dati` è vero e la condizione ricade di nuovo sul caricamento — la rotella gira per…
- Come si ripara: Su ognuna delle cinque destrutturare `isError` e `refetch` dalla useQuery e, PRIMA del controllo sui dati, restituire `<ErrorState onRetry={() => refetch()} />`. Il componente esiste già (components/ui/ErrorState.tsx) e accetta sia `retry` sia `onRetry`, col pulsante Riprova. Regola: non lasciare…

**22. Due tap su «Compra ora» mettono nel carrello il doppio della roba**

- Dove: `app/product/[id]/page.tsx:865-871 (pulsante) e 419-440 (handleBuyNow) · lib/cart.ts:49-58`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Il pulsante «Compra ora · paghi alla consegna» è un `<button>` scritto a mano con `disabled={!canAdd}` e nient'altro: nessuno stato di attesa. `handleBuyNow` chiama `addToCart(...)` e subito `router.push('/checkout')`. Tra il tap e l'apertura del checkout non cambia niente a schermo: il pulsante non si spegne, non compare una rotella e non arriva nemmeno un messaggio — verificato che il `toast.success`…
- Come si ripara: Mettere uno stato `inCorso` nel componente: al primo tap si accende, il pulsante passa a `disabled` con la rotella, e si riaccende solo se la navigazione fallisce. Meglio ancora: sostituire il `<button>` scritto a mano con il Button del design system (components/ui/Button.tsx), che con la sola…

**23. Il carrello dice «è vuoto» ogni volta che si apre, prima di mostrare la roba dentro**

- Dove: `app/cart/page.tsx:23 (useState) · 35-40 (useEffect) · 79-92 (stato vuoto)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. La pagina parte con `useState<CartItem[]>([])` (riga 23) e riempie la lista dentro un `useEffect` (righe 35-40), cioè solo dopo che il browser ha scaricato e avviato il JavaScript. Ma il controllo `if (items.length === 0)` che mostra «Il tuo carrello è vuoto — Scopri i prodotti dei negozi della tua città» sta prima (riga 79) e non distingue «non ho ancora letto» da «non c'è niente». Quindi il primo…
- Come si ripara: Aggiungere una terza possibilità oltre a pieno e vuoto: un `const [letto, setLetto] = useState(false)` che diventa vero alla fine del primo useEffect. Finché `letto` è falso si mostra uno scheletro delle righe (due-tre barre con la classe `.skeleton` e la stessa altezza delle righe vere, così la…

**24. Il cuore dei preferiti non si riempie subito e, se il salvataggio fallisce, non lo dice nessuno**

- Dove: `components/hooks/useFavorites.ts:28-41 · components/ProductCard.tsx:95-107 e 164-170`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, due difetti nello stesso punto. Primo: la mutationFn fa `await supabase.from('favorites').insert(...)` e `.delete(...)` senza mai guardare il campo `error` che Supabase restituisce (righe 35 e 37). Un salvataggio bloccato — permessi, rete, riga duplicata — viene trattato come riuscito: parte `onSuccess`, si invalida la cache, il cuore si ridisegna com'era e nessun messaggio compare. Il gestore `onError`…
- Come si ripara: Nella mutationFn destrutturare `const { error } = await supabase...` e fare `if (error) throw error`, così `onError` (già collegato in ProductCard) mostra il messaggio. Poi aggiungere `onMutate` con l'aggiornamento ottimistico del Set dei preferiti più il rollback in `onError`, e spegnere il cuore…

**25. «Carica altri prodotti» cancella i prodotti già a video e li sostituisce con gli scheletri**

- Dove: `components/ProductGrid.tsx:87-88 (chiave della query) · 316-333 (ramo isLoading) · 447-458 (pulsante)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO (righe diverse da quelle segnalate, sostanza identica). Il tetto di righe è dentro la chiave della query: riga 88, `limit: (limit ?? 96) * pagine`. Quando si preme «Carica altri prodotti» (riga 453, `setPagine((n) => n + 1)`) il numero di pagine cresce, la chiave cambia, e per react-query è una domanda nuova senza risposta in cache: `isLoading` torna vero e il codice alla riga 316 restituisce…
- Come si ripara: Aggiungere `placeholderData: keepPreviousData` alla useQuery della griglia (importando `keepPreviousData` da @tanstack/react-query): i prodotti già visti restano a video mentre arrivano gli altri. Poi legare il pulsante a `isFetching`: `disabled` più testo «Carico…» o la rotella, così una pressione…

**26. Il cursore del prezzo nella ricerca fa lampeggiare la griglia a ogni millimetro**

- Dove: `app/search/page.tsx:185-204 (i due input range) · 479-483 (passaggio a ProductGrid) · components/ProductGrid.tsx:87-88`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. I due cursori del prezzo sono `<input type="range">` con `step={5}` e l'`onChange` che chiama direttamente `setMinPrice` (riga 191) e `setMaxPrice` (riga 201). Nessun ritardo: verificato che in app/search/page.tsx non compaiono né `useDeferredValue`, né un debounce, né un `setTimeout`. I due valori finiscono dritti nelle proprietà di ProductGrid (righe 479 e 483), quindi nella chiave della query…
- Come si ripara: Tenere il valore del cursore in uno stato locale per il movimento e propagarlo ai filtri con un ritardo di circa 300ms, oppure propagarlo solo a fine trascinamento (`onPointerUp`/`onTouchEnd`) invece che a ogni scatto. Insieme a `placeholderData: keepPreviousData` sulla griglia, il trascinamento…

**27. Nel checkout il pulsante «Applica» del codice sconto non dà nessun segno di vita**

- Dove: `components/checkout/CouponInput.tsx:62 · app/checkout/page.tsx:431-442 · lib/coupons.ts:112-117`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, ed è doppio. Primo: `applyCoupon` (app/checkout/page.tsx riga 431) è asincrona e chiama `validateCouponFromBrowser`, che a sua volta fa `supabase.rpc('check_coupon', ...)` — un viaggio di rete vero. Il pulsante è `<Button type="button" onClick={onApply} size="sm">Applica</Button>` (CouponInput riga 62): nessun `loading`, nessun `disabled`. Tra il tap e la risposta non cambia assolutamente nulla a…
- Come si ripara: Portare l'applicazione del coupon dentro una `useMutation` (o un semplice stato `applicoCoupon`) e passare `loading={...}` al Button di CouponInput: essendo il Button del design system si spegne, mostra la rotella e imposta `aria-busy` da solo. In lib/coupons.ts separare i due casi: se `error` è…

**28. Salvataggi che falliscono senza dire niente: liste, coupon, indirizzi, promozioni, notifiche**

- Dove: `app/lists/[id]/page.tsx:126-175 (4 mutazioni su 5) · app/admin/coupons/page.tsx:88-104 · app/profile/addresses/page.tsx:102-110 · app/seller/promotions/page.tsx:105-115 · app/notifications/page.tsx:81-95`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, con due correzioni rispetto alla segnalazione. In app/lists/[id]/page.tsx le mutazioni sono cinque ma una — `updateMeta`, riga 110 — l'`onError` ce l'ha: restano senza quattro (`toggleVisibility` 126, `removeItem` 140, `updateNote` 154, `deleteList` 168). Tutte e quattro però il `if (error) throw error` lo fanno: l'errore viene lanciato e react-query lo prende, ma nessuno lo mostra — la schermata non…
- Come si ripara: Regola unica per ogni mutazione: nella mutationFn destrutturare `const { error } = await supabase...` con `if (error) throw error`, e aggiungere sempre `onError: (e) => toast.error(friendlyError(e))` — `friendlyError` esiste già in lib/errors.ts ed è usato correttamente nelle mutazioni vicine…

**29. Le liste mostrano «non hai ancora liste» e «lista non trovata» a chiunque, mentre stanno caricando**

- Dove: `app/lists/page.tsx:45, 63, 79 (query senza isLoading) e 178, 202 (stati vuoti) · app/lists/[id]/page.tsx:71 e 86 (query) e 179 («Lista non trovata»)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Nessuna delle query di queste due pagine destruttura `isLoading` o `isError`: sono tutte nella forma `const { data: x = [] } = useQuery({...})`. In app/lists/page.tsx il blocco «Non hai ancora liste. Inizia a crearne una.» (riga 178) dipende solo da `myLists.length === 0`, che al primo disegno è vero per tutti: anche chi ha dieci liste legge per un momento che non ne ha nessuna. Stessa cosa per «Nessuna…
- Come si ripara: Destrutturare `isLoading`, `isError` e `refetch` da ogni useQuery; mentre carica mostrare uno scheletro delle schede (esiste components/SkeletonCard.tsx), in errore mostrare `<ErrorState onRetry={() => refetch()} />`, e riservare lo stato vuoto al solo caso «caricato e davvero zero». Nelle queryFn…

### immagini-media


**30. Le copertine degli eventi vengono ritagliate quadrate e poi di nuovo in 16:9**

- Dove: `components/home/HomeEvents.tsx:67 · components/CategoryShowcase.tsx:113 · causa radice lib/image-url.ts:44-53 e lib/image-loader.ts:71`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO riga per riga. lib/image-url.ts:44-53: per le taglie 'thumb' e 'card' la variabile `square` è vera e il codice fa `url.searchParams.set('height', String(sizePx))` con `resize=cover` — la foto torna già QUADRATA dal CDN Supabase. lib/image-loader.ts:71: `if (url.searchParams.has('height')) url.searchParams.set('height', String(width))` — il caricatore riscrive l'altezza uguale alla larghezza a OGNI misura…
- Come si ripara: In components/home/HomeEvents.tsx:67 e components/CategoryShowcase.tsx:113 passare da 'card' a 'detail'. Poi togliere la causa alla radice: in lib/image-loader.ts:71, invece di riscrivere `height`, CANCELLARLO quando la taglia calcolata non è quadrata (`url.searchParams.delete('height')`). Regola…

**31. Le foto delle vetrine in home arrivano a 100 pixel e si vedono sgranate**

- Dove: `components/SponsoredCarousel.tsx:147 · components/RecentlyViewed.tsx:81 · altre 19 occorrenze (grep -rn unoptimized app components → 21 in 17 file)`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO. components/SponsoredCarousel.tsx:147: scheda `w-32 sm:w-36` (128-144 px), immagine `sizedImage(img,'thumb')` = 100 px sorgente, con `unoptimized` e `sizes="144px"` scritti sulla stessa riga. components/RecentlyViewed.tsx:81-87: scheda `w-36 sm:w-40` (144-160 px), identico. Il punto è `unoptimized`, che azzera sia `srcSet` sia `sizes`: l'attributo `sizes` lì accanto non fa niente — è il difetto già…
- Come si ripara: Su components/SponsoredCarousel.tsx:147 e components/RecentlyViewed.tsx:81 togliere `unoptimized` e aggiungere `loader={caricatoreFotoRemote}`, copiando components/ProductCard.tsx:157-165. Poi ripassare le altre 19 occorrenze: la regola è che `unoptimized` e `sizes` non possono stare sulla stessa…

**32. Quando manca la foto il sito va a chiedere il riquadro grigio a un sito esterno**

- Dove: `components/ProductCard.tsx:61 · app/cart/page.tsx:162 · components/checkout/CartGroupsList.tsx:34 · app/product/[id]/page.tsx:329 · components/home/DropOfDay.tsx:90 · app/seller/products/page.tsx:266,363 · components/seller/FeaturedProductsPicker.tsx:71 · next.config.js:47`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO: 8 occorrenze di `https://placehold.co/...` come segnaposto, più il dominio dichiarato in next.config.js:47 fra i `remotePatterns`. I punti: components/ProductCard.tsx:61, app/product/[id]/page.tsx:329, components/home/DropOfDay.tsx:90, app/seller/products/page.tsx:266 e 363, components/seller/FeaturedProductsPicker.tsx:71 e — questo è il punto grave — app/cart/page.tsx:162 e…
- Come si ripara: Fare un segnaposto locale con i colori del brand (fondo panna #FBF7F0, icona terracotta #C0492C) e servirlo da `public/segnaposto-foto.svg`, oppure inline come data-URI — lib/immagini-base64.ts esiste già e fa quel mestiere. Sostituire le 8 occorrenze e togliere `placehold.co` da next.config.js:47,…

**33. L'anteprima che si vede su WhatsApp scarica la foto originale intera**

- Dove: `app/product/[id]/opengraph-image.tsx:65 · app/store/[id]/opengraph-image.tsx:69`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO. app/product/[id]/opengraph-image.tsx:65 usa `<img src={photo}>` con l'indirizzo GREZZO: nel file non c'è nessun import di `sizedImage` (gli import sono solo ImageResponse e createClient), quindi si scarica il file com'è — fino a 5 MB, il limite del bucket — per disegnarlo a 460 px dentro un'immagine da 1200×630. Alla riga 4 c'è `export const runtime = 'edge'`, dove il tempo a disposizione è corto: su una…
- Come si ripara: In entrambi i file importare `sizedImage` e passare l'indirizzo da `sizedImage(photo,'detail')` (800 px, più che sufficiente per un riquadro da 460) prima di darlo a `<img>`. Nel file del negozio cambiare `objectFit:'cover'` in `'contain'`: il fondo del riquadro è già bianco, il logo ci sta dentro…

**34. L'immagine più grande in cima alla home viene caricata per ultima**

- Dove: `components/home/HeroStoreCard.tsx:101 · components/home-sections/HomeSectionRenderer.tsx:409 · components/CategoryShowcase.tsx:116`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO in tutti e tre i punti. (1) components/home/HeroStoreCard.tsx:101 — la copertina del negozio in evidenza dentro l'hero, riquadro `h-44 w-full` in un `max-w-sm` (384×176 su desktop): l'`<Image>` ha src, alt, fill, sizes e loader, ma NON `priority`, quindi vale il comportamento predefinito di next/image, cioè `loading="lazy"`. (2) components/home-sections/HomeSectionRenderer.tsx:409 — il banner a tutta…
- Come si ripara: In HomeSectionRenderer il renderer conosce già l'indice della sezione: passare `priority` all'immagine della PRIMA sezione, qualunque essa sia. Aggiungere `priority` a HeroStoreCard.tsx:101. In CategoryShowcase togliere `loading="lazy"` dai primi tre riquadri (o metterlo solo dal quarto in poi).

**35. Il negoziante vede la sua storia con un taglio, il cliente ne vede un altro**

- Dove: `app/seller/stories/page.tsx:149-151 · components/StoryViewer.tsx:185-196`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO. (1) Elenco del venditore, app/seller/stories/page.tsx:151: `sizedImage(s.image_url,'card')` — foto che torna QUADRATA da Supabase — dentro un riquadro `aspect-[3/4]` (riga 149) con object-cover: doppio taglio, il venditore sta guardando la fascia centrale di un quadrato. (2) Visore del cliente, components/StoryViewer.tsx:188-196: la foto passa da 'hero' (proporzioni originali) dentro un contenitore…
- Come si ripara: Nel visore cambiare il contenitore da altezza fissa a `aspect-[9/16] max-h-[85vh]` e la foto a object-contain su fondo nero (è quello che fanno Instagram e WhatsApp). Nell'anteprima venditore passare da 'card' a 'detail' e mettere il riquadro a `aspect-[9/16]`, così quello che vede lui è quello che…

**36. I loghi dei negozi vengono tagliati ai lati invece che entrare interi**

- Dove: `components/StoreAvatar.tsx:39 · components/account/AccountSidebar.tsx:118 · components/products/SellerCard.tsx:129 · components/home/StoriesCarousel.tsx:77 · components/Navbar.tsx:326,352 · app/store/[id]/opengraph-image.tsx:69`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO in tutti e sei i punti: ovunque compaia il logo di un negozio c'è `object-cover`, che riempie il riquadro tagliando quello che avanza. Va bene per la foto di un prodotto — dove il centro è il soggetto — ma è sbagliato per un marchio, che è quasi sempre orizzontale: dentro un cerchio con `cover` restano le due lettere di mezzo e il nome sparisce. I punti confermati: components/StoreAvatar.tsx:39 (è il…
- Come si ripara: In StoreAvatar cambiare `object-cover` in `object-contain` e tenere `bg-white` (già c'è) più un padding interno di 2-3 px: il logo entra intero e il cerchio resta pieno. Stessa cosa negli altri cinque punti. Le foto di PRODOTTO restano `object-cover`: un prodotto si ritaglia, un marchio no.

### mobile-pwa


**37. La tendina «dove ti consegniamo» esce dallo schermo del telefono**

- Dove: `components/LocationPill.tsx:73 (pannello suggerimento `w-64`) e :96 (pannello CAP `w-72`), usata compatta in components/Navbar.tsx:177`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO. Entrambi i pannelli sono `absolute left-0 top-full`, larghi 256px e 288px. Nella barra mobile (Navbar.tsx:176-178) la pastiglia sta in `min-w-0 flex-1 flex justify-center`, quindi è centrata: su 375px, con il logo a sinistra e il carrello o «Accedi» a destra, il suo bordo sinistro cade intorno ai 155-170px. Il pannello da 288px parte da lì e finisce oltre i 440px, cioè 65-85px fuori dallo schermo. Ho…
- Come si ripara: Sul mobile ancorare il pannello al centro e limitarne la larghezza al viewport: al posto di `absolute left-0 … w-72` usare `absolute left-1/2 -translate-x-1/2 w-[min(18rem,calc(100vw-1.5rem))]`, stesso trattamento per il `w-64`. Meglio ancora: sotto `sm` farne un foglio in fondo come…

**38. Toccare la barra di ricerca fa zoomare la pagina su iPhone**

- Dove: `components/SearchBar.tsx:174 (`text-sm`); stessa cosa in components/LocationPill.tsx:110, app/stores/page.tsx:202 e :216, app/category/[slug]/page.tsx:166`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO in tutti e cinque i punti. La regola la casa ce l'ha già scritta: components/ui/Field.tsx:22 dice «mobile: text-base (≥16px) per non innescare lo zoom automatico su iOS» e la primitiva alla riga 30 usa `text-base`. La SearchBar non passa dalla primitiva e il suo `<input>` (riga 174) ha `text-sm` senza nessun prefisso responsive — 14px. Safari su iPhone, quando un campo sotto i 16px va a fuoco, ingrandisce…
- Come si ripara: Portare l'input della SearchBar a `text-base` (con `sm:text-sm` se si vuole tenere il desktop com'è). Stesso trattamento agli altri quattro, o meglio farli passare dalla primitiva `Input` di components/ui/Field.tsx che la regola ce l'ha già dentro. Prova che gira: un controllo automatico che…

**39. Nel carrello «Rimuovi» è un bersaglio da 20px attaccato al «+», e cancella senza chiedere**

- Dove: `app/cart/page.tsx:211-218 (pulsante Rimuovi) e :195-201 (pulsante +)`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO. Il pulsante è `className="text-ink-500 hover:text-secondary-600 text-sm ml-2 flex items-center gap-1"`: nessun padding verticale, quindi l'area toccabile è alta quanto la riga di testo — circa 20px, meno della metà dei 44px che il progetto stesso impone nella sua primitiva (components/ui/Button.tsx:35, `min-h-[44px]` su size md). E sta a soli 8px (`ml-2`) dal contenitore dello stepper, il cui pulsante…
- Come si ripara: Due cose insieme: (1) dare al pulsante un'area vera — `px-3 py-2.5 min-h-[44px]` — e staccarlo dallo stepper con almeno 16px (`ml-4`, o mandarlo a capo su mobile); (2) rendere reversibile la rimozione, con il ConfirmDialog già montato in app/layout.tsx:137 oppure con un avviso «Rimosso — Annulla»…

**40. Il service worker conserva le pagine private e non le cancella mai all'uscita**

- Dove: `public/sw.js:72-88 (networkFirstHtml) e :92-99 (gestore fetch)`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO, incluse le due ricerche che il collega dichiarava. `networkFirstHtml` mette in cache OGNI navigazione HTML riuscita dello stesso dominio (`cache.put(req, res.clone())`) senza nessuna esclusione di rotta: ci entrano /orders, /profile, /notifications, /admin, cioè pagine con nome, indirizzo e ordini della persona. La cache si chiama `mycity-html-v2` e tiene fino a 30 pagine (MAX_HTML_ENTRIES). Nessuno la…
- Come si ripara: Due mosse: (1) in sw.js non mettere in cache le navigazioni verso rotte private — saltare `/orders`, `/profile`, `/admin`, `/seller`, `/rider`, `/messages`, `/notifications`, `/checkout` (solo rete, con offline.html come ripiego); (2) svuotare `mycity-html-*` al logout, con `caches.keys()` nei due…

**41. Il mega-menù «Tutte le categorie» non ha altezza massima né scorrimento proprio**

- Dove: `components/CategoryBar.tsx:132-137 (pannello) e :148 (griglia)`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO. Il pannello è `pointer-events-none absolute left-0 right-0 top-full z-50` e la scheda dentro è `mt-1 w-full max-w-[900px] rounded-2xl bg-white p-5`: nessun `max-height`, nessun `overflow-y-auto`. La griglia (riga 148) è `grid-cols-2` sotto `sm` e ogni categoria principale elenca fino a 6 sottocategorie (riga 166, `kids.slice(0, 6)`). Con dieci categorie principali su due colonne il pannello supera…
- Come si ripara: Dare alla scheda `max-h-[70dvh] overflow-y-auto overscroll-contain` e, sotto `sm`, farla diventare un foglio a schermo intero come i filtri di /search (app/search/page.tsx:335, che usa già `max-h-[85vh] flex flex-col pb-safe` e funziona). Prova che gira: test Playwright a 375px su /status che apre…

**42. La tabella «Ultimi 10 ordini» del pannello admin viene tagliata sul telefono**

- Dove: `app/admin/today/page.tsx:175-189`
- Corsia: codice (serve un rilascio)
- Cosa succede: VERIFICATO, compreso il confronto con le pagine sorelle. Il contenitore è `overflow-hidden rounded-xl border-2 border-cream-300 bg-white` e basta: nessun `overflow-x-auto`. Dentro c'è una tabella `w-full text-sm` con sei colonne (Ordine, Negozio, Cliente, Stato, Totale, Quando), ognuna con `px-4`. `overflow-hidden` taglia, non fa scorrere: su un telefono da 360-375px le colonne si schiacciano e le ultime — Totale e…
- Come si ripara: Sostituire `overflow-hidden` con `overflow-hidden overflow-x-auto` e dare alla tabella `min-w-[760px]`, come già fanno le pagine sorelle; stessa cosa per la cohort di /admin/funnel. Prova che gira: test Playwright a 375px su /admin/today che fallisce se `scrollWidth` del contenitore è maggiore di…

### flussi-conversione


**43. Per ordinare bisogna registrarsi e confermare l'email: il muro cade all'ultimo clic**

- Dove: `app/checkout/page.tsx:697-702 (handleSubmit) → app/sign-up/page.tsx:132 → app/auth/verify-email · app/api/orders/cod/route.ts (richiede user autenticato)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. L'ospite compila tutto e preme un pulsante che dice «Conferma ordine · 24,50 €» (components/checkout/OrderSummary.tsx). Quel pulsante non conferma niente: in handleSubmit, se !authUser, salva la bozza e fa router.push('/sign-in?returnTo=/checkout'); da li si va a /sign-up, e la registrazione finisce su /auth/verify-email — «vai nella tua casella di posta, clicca il link, torna qui». Il commento #214 nel…
- Come si ripara: Aprire l'ordine in contanti alla consegna anche senza account: /api/orders/cod accetta l'ordine con email+telefono, crea un utente ospite lato server e manda la conferma per email; l'account si propone DOPO, sulla pagina dell'ordine («salva l'indirizzo per la prossima volta»). Se il muro deve…

**44. Il checkout scrive «Hai la spedizione gratis» mentre nel riquadro sotto la spedizione la fa pagare**

- Dove: `app/checkout/page.tsx:935 (FreeShippingProgress subtotal={grandSubtotal}) vs riga 446 (grandShipping = somma di shippingFor(g) gruppo per gruppo) · components/checkout/OrderSummary.tsx:53-58`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO riga per riga. La barra riceve grandSubtotal, cioe il subtotale di TUTTO il carrello (riga 444), ma la spedizione si calcola per singolo negozio: grandShipping somma shippingFor(g) su ogni gruppo, e shippingForEuro (lib/shipping.ts:29) azzera solo se il subtotale DI QUEL GRUPPO supera la soglia di 30 €. Con due negozi da 16 € l'uno: totale 32 €, quindi la barra dichiara «Hai la spedizione gratis» — mentre…
- Come si ripara: Nel checkout mostrare una barra per gruppo, come gia fa il carrello, oppure una barra sola alimentata dal gruppo piu vicino alla soglia, con scritto di quale negozio si parla. Mai passare grandSubtotal a un componente che parla di una soglia applicata per negozio.

**45. Il totale del carrello e piu basso di quello del checkout quando i negozi sono piu di uno**

- Dove: `app/cart/page.tsx:77-78 e :115-116 (shippingCost unico = 4,90 €, soglia sul totale) vs app/checkout/page.tsx:446 (spedizione sommata per gruppo)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Il carrello usa una regola sola per tutto l'ordine: freeShipping = total >= 30, altrimenti shippingCost = 4,90 fisso. Il checkout ne usa un'altra: shippingForEuro per ogni gruppo-negozio, con la soglia applicata al subtotale del gruppo e la distanza quando ci sono le coordinate. Due negozi da 10 €: nel carrello il totale e 30,90 € (20 di merce + 4,90 di spedizione + 6 di Consegna MyCity, riga 115), al…
- Come si ripara: Far calcolare al carrello la stessa cosa che calcola il checkout: raggruppare per venditore (i gruppi ci sono gia, righe 95-108) e chiamare shippingForEuro per ogni gruppo, come fonte unica. Senza coordinate di consegna la funzione ripiega gia sulla tariffa fissa (lib/shipping.ts:33), quindi il…

**46. «Compra ora · paghi alla consegna» atterra su un checkout con la carta gia selezionata**

- Dove: `app/product/[id]/page.tsx:868-875 (pulsante) e :419-439 (handleBuyNow) → app/checkout/page.tsx:407`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Il pulsante nero della scheda prodotto promette in modo esplicito il pagamento alla consegna. handleBuyNow pero mette il prodotto nel carrello e chiude con un semplice router.push('/checkout'), senza portarsi dietro l'intenzione. E il checkout parte con useState<'cod'|'card'>(stripeAvailable ? 'card' : 'cod') alla riga 407, cioe carta ogni volta che la chiave Stripe e configurata; ho verificato che il…
- Come si ripara: handleBuyNow porta l'intenzione: router.push('/checkout?pagamento=cod'); il checkout legge il parametro e ci inizializza paymentMethod. In alternativa, se la promessa del pulsante e quella, il metodo predefinito del checkout deve essere il contrassegno finche il primo ordine non e passato.

**47. «Compri sicuro: paghi solo quando arriva» e scritto sempre, anche a chi sta per pagare con la carta**

- Dove: `app/product/[id]/page.tsx:883 e components/StickyAddToCart.tsx via app/product/[id]/page.tsx:1114 (note="Paghi alla consegna")`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. La riga alla 883 sta in un blocco senza nessuna condizione: la vede chiunque, indipendentemente da come paghera. Ma il percorso predefinito del checkout e la carta (riga 407 del checkout), e con la carta si paga subito su Stripe, prima che arrivi qualunque cosa. La stessa promessa senza condizioni sta anche nella barra mobile appiccicata in fondo allo schermo (StickyAddToCart, prop note="Paghi alla…
- Come si ripara: Riscrivere la promessa come una possibilita, non come un fatto, riusando la formula gia corretta della riga 696. Stessa correzione per la nota della barra mobile.

**48. I «€5 di benvenuto» promessi in tre punti non si applicano da nessuna parte al checkout**

- Dove: `components/BuyerOnboardingTour.tsx:26-31 · migrations/029_welcome_credit_search_fts_price_alert.sql:34-40 · app/api/cron/send-emails/route.ts:41-45 — nessun riscontro sui punti in app/api/orders/cod/route.ts ne in app/api/stripe/checkout/route.ts`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO su tutte e tre le superfici. Il tour dice «Hai €5 di benvenuto… Si applicano in automatico al checkout»; la notifica creata dal trigger handle_new_profile_welcome_bonus dice «Si applicano automaticamente al checkout quando spendi almeno €10»; l'email first_order_promo dice «lo sconto si applica automaticamente». Il regalo vero pero e 100 punti fedelta (PERFORM award_loyalty_points(NEW.id, 100,…
- Come si ripara: Due strade, una sola da scegliere: (a) mantenere la promessa — al momento di calcolare il totale, convertire e scalare in automatico i punti disponibili, su entrambi i percorsi di pagamento; (b) cambiare la promessa in tutti e tre i punti («Hai 100 punti: convertili in 5 € di sconto dal tuo…

**49. Il credito MyCity sparisce dal checkout se si paga con la carta, senza che nulla lo spieghi**

- Dove: `app/checkout/page.tsx:817 (il riquadro e dentro paymentMethod === 'cod' && walletEuro > 0) e :453 (creditApplied, anch'esso vincolato al contrassegno)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Il riquadro «Usa il mio credito MyCity» compare solo se paymentMethod === 'cod' && walletEuro > 0, e creditApplied vale 0 in tutti gli altri casi. Siccome il metodo predefinito e la carta (riga 407), il caso normale e questo: la persona ha 5 € di credito, apre il checkout, e del credito non c'e traccia — ne la casella per usarlo, ne una riga nel riepilogo (OrderSummary mostra «Credito MyCity» solo se…
- Come si ripara: Mostrare sempre il riquadro del credito quando walletEuro > 0. Se il metodo scelto e la carta, tenerlo visibile e disattivato con la spiegazione accanto: «Hai 5,00 € di credito — si usa scegliendo Contanti alla consegna», con il collegamento che cambia metodo in un clic.

**50. Chi si registra dal checkout puo creare per sbaglio un account che non puo comprare, e resta bloccato senza spiegazione**

- Dove: `app/sign-up/page.tsx:25-29 e :158-180 (il riquadro «Come vuoi usare MyCity?») · components/hooks/useShoppingMode.ts:44-48 (useCanPurchase) · app/product/[id]/page.tsx:371 (canAdd) e :857-874 · components/SellerShoppingBanner.tsx:16`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO in ogni passaggio. La registrazione mostra le tre mattonelle Acquirente/Venditore/Rider senza guardare il returnTo, cioe anche quando arriva da /checkout e il ruolo e ovvio. Chi tocca «Venditore» ottiene davvero un account negoziante: il trigger handle_new_user (migrations/114, righe 208-219) scrive role='seller' subito, senza passare da pending_approval. Da li useCanPurchase(isAdmin, isSeller,…
- Come si ripara: Due correzioni, entrambe piccole: (1) nella registrazione, se returnTo punta a /checkout o /cart, forzare il ruolo acquirente e non mostrare affatto il selettore; (2) sulla scheda prodotto, quando mayPurchase e falso, non lasciare un pulsante grigio e muto: mettere al suo posto la spiegazione e il…

**51. La fee «Consegna MyCity» di 3 € a negozio non esiste finche non si apre il carrello, e intanto la scheda prodotto scrive «Spedizione gratuita»**

- Dove: `app/product/[id]/page.tsx:705 (FreeShippingProgress) e :811 (Badge «Spedizione gratuita») · components/ProductCard.tsx:200-203 (badge «Sped. gratis») · lib/constants.ts:54 (PLATFORM_DELIVERY_FEE_CENTS = 300)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Sulla consegna a domicilio si pagano 3 € per ogni negozio, senza soglia: checkout riga 447 e carrello riga 115 calcolano groups.length × 3, azzerati solo col ritiro in negozio. Ho cercato la fee in tutte le pagine: compare in app/cart/page.tsx:273, in components/checkout/OrderSummary.tsx:62 e nel pannello admin — mai sulla scheda prodotto ne sulle card della griglia. Prima del carrello la scheda mostra…
- Come si ripara: Nominare la fee dove si decide di comprare: una riga sotto il prezzo nella scheda prodotto, «+3 € di consegna MyCity per ogni negozio», e cambiare l'etichetta della barra da «spedizione gratis» a «spedizione del negozio gratis», che e quello che e davvero.

### microcopy


**52. Nella pagina degli incassi il negoziante legge etichette in maiuscolo inglese tipo «PROCESSING»**

- Dove: `app/seller/earnings/page.tsx:44-63 (funzione payoutBadge, ramo default riga 61)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. La funzione payoutBadge traduce solo sei valori (TRANSFERRED, HELD, PENDING_SELLER_ONBOARDING, REVERSED, REFUNDED, FAILED); il ramo finale (riga 61) scrive il valore grezzo del database: `label: o.payout_status ?? '—'`. Gli altri valori esistono davvero: 'PENDING' è il default scritto dalla migrazione 024 (riga 23) e lib/stripe/payout.ts:106 scrive 'PROCESSING' su ogni ordine a carta durante il…
- Come si ripara: Aggiungere i due casi mancanti allo switch — 'PENDING' → «In arrivo», 'PROCESSING' → «Bonifico in corso» — e cambiare il ramo default perché non mostri mai il valore grezzo: al posto di `o.payout_status ?? '—'` mettere sempre «In lavorazione» e registrare il valore imprevisto nei log. Nessuna sigla…

**53. In venti punti l'avviso di errore è la parola «Errore» e basta**

- Dove: `components/ProductCard.tsx:104 · components/rider/CashConfirmDialog.tsx:77,82 · app/orders/[id]/return/page.tsx:84,88 · components/seller/CatalogCopilot.tsx:44 · components/seller/QuickAiTools.tsx:78 · components/seller/ImproveAllPanel.tsx:109 · components/AIDescriptionButton.tsx:51 · components/PushNotificationOptIn.tsx:119 · app/admin/categories/page.tsx:36 · app/admin/daily-drops/page.tsx:40 e altri (20 occorrenze)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO con grep: 20 occorrenze della stringa nuda 'Errore' come testo di ricambio, sia come toast diretto sia come fallback di apiErrorMessage. Passa intatta attraverso friendlyError (nessuna regola la intercetta: è corta, senza a capo e comincia per lettera, quindi esce identica, lib/errors.ts:78-84) e diventa un avviso a schermo che dice solo «Errore»: non dice cosa non è andato, se il lavoro è perso, cosa…
- Come si ripara: Sostituire ogni 'Errore' con la frase che dice cosa non è riuscito e cosa fare: in ProductCard «Non siamo riusciti a salvare il preferito. Riprova.», nella conferma contanti «Non siamo riusciti a registrare l'incasso. Riprova: non rischi di registrarlo due volte.» Regola generale: un messaggio…

**54. La parola «onboarding» compare cinque volte proprio nella schermata dei pagamenti del negoziante**

- Dove: `components/seller/StripeConnectButton.tsx:57, 84, 141 · app/seller/earnings/page.tsx:53 · components/rider/RiderConnectButton.tsx:88`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO riga per riga. È la schermata dove il negoziante collega il conto per farsi pagare — e per il negozio faro Pane Quotidiano, che oggi ha incassi e versamenti disattivati, è esattamente la schermata su cui si arena. Lì legge: il cartellino di stato «Completa onboarding» accanto a un incasso (app/seller/earnings/page.tsx:53), l'avviso «Mancano ancora verifiche su Stripe: completa l'onboarding.»…
- Come si ripara: Tradurre in cose: «Completa onboarding» → «Manca la verifica»; «Mancano ancora verifiche su Stripe: completa l'onboarding.» → «Stripe deve ancora verificare i tuoi dati. Tocca “Completa la verifica” qui sopra per finire.»; il suggerimento del pulsante → «Hai già finito su Stripe? Tocca qui per…

**55. Al fattorino l'errore del GPS arriva in inglese, con la frase del browser attaccata**

- Dove: `app/rider/orders/[id]/page.tsx:215`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO: `toast.error('Errore GPS: ' + err.message)` a riga 215. Quel `err.message` è scritto dal browser, non da noi, ed è in inglese: «User denied Geolocation», «Timeout expired», «Position unavailable». Il fattorino, in strada, con l'ordine in mano, legge «Errore GPS: User denied Geolocation» e non sa che deve solo dare il permesso di posizione al browser. È l'unico modo che ha per condividere la posizione col…
- Come si ripara: Tradurre i tre casi che l'interfaccia di geolocalizzazione può dare, distinguendoli sul codice `err.code` invece che sul testo: permesso negato (1) → «Non hai dato il permesso di posizione. Attivalo dalle impostazioni del browser e riprova.»; posizione non disponibile (2) → «Il GPS non prende.…

**56. Il messaggio che blocca un prodotto ha un refuso e ci attacca una frase scritta dall'AI**

- Dove: `app/api/ai/catalog-create/route.ts:80 · app/api/ai/description/route.ts:88 · app/api/ai/catalog-apply/route.ts:90 · app/api/ai/product-chat/route.ts:205 · lib/ai/moderation.ts:97,127,130`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO: quattro rotte compongono il messaggio così: «Questo prodotto non si puo' pubblicare: {motivo}» (catalog-create:80, description:88, catalog-apply:90, product-chat:205). Due difetti nella stessa riga. Primo, il refuso: «puo'» con l'apostrofo al posto di «può» — scrittura da terminale, sotto gli occhi del negoziante. Secondo, `{motivo}` non è testo nostro: è la motivazione libera scritta dal modello AI di…
- Come si ripara: Correggere i quattro «puo'» in «può». Poi non concatenare più la motivazione grezza: tenere un piccolo elenco di motivi nostri (categoria vietata, claim non dimostrabile, dati mancanti) collegato al campo `category` che la moderazione già restituisce, e per i casi senza categoria scrivere «Non…

### navigazione-gerarchia


**57. Chi compra non ha nessun pulsante per aprire l'assistenza**

- Dove: `components/MobileTabBar.tsx:17, :176, :191, :245 (nessun elenco imposta `isSupport: true`, righe 96-113) · components/SupportChatButton.tsx:27 (`isBuyer` fra le condizioni di `hidden`)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, e peggio di come era stato segnalato. La barra a schede prevede una scheda di tipo assistenza — il campo `isSupport` esiste (MobileTabBar.tsx:17), il codice si dirama su di esso in due punti (:176 e :191) e la finestra `SupportChatModal` viene montata per ogni compratore (:245) col commento «Assistenza per il buyer: aperta dalla tab "Assistenza" nella barra» — ma nessuno dei quattro elenchi di schede…
- Come si ripara: Chiudere il buco in una delle due direzioni, senza lasciare la terza situazione di adesso (codice che promette e non fa). ① Aggiungere davvero la scheda al cliente: `{ href: '#', icon: LifeBuoy, label: t('support'), isSupport: true }` al posto di «Ordini», che resta raggiungibile dal pannello «Io».…

**58. Sul tablet il pulsante «Aggiungi al carrello» non si vede senza scorrere**

- Dove: `app/product/[id]/page.tsx:458 (griglia) e :808 (riquadro d'acquisto, terzo figlio) · components/StickyAddToCart.tsx:55 (`md:hidden`) · confronto: app/checkout/page.tsx:749 e :968`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO nella meccanica, con una correzione alla descrizione. La griglia della scheda prodotto è `grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_320px]` (riga 458) e ha esattamente tre figli: galleria (:460), colonna informazioni (:608) e riquadro d'acquisto (:808, quello con prezzo, quantità, «Aggiungi al carrello» a :862 e «Compra ora» a :871). Fra 768 e 1023px le colonne sono due, quindi il terzo figlio…
- Come si ripara: Allineare i due punti di rottura come già fa il checkout: portare `StickyAddToCart` da `md:hidden` a `lg:hidden`, così la barra in fondo copre tutta la fascia in cui la terza colonna non esiste. In più, a `md`, far salire il riquadro d'acquisto in cima alla seconda colonna (`md:col-start-2…

**59. Sul telefono, appena scorri, la navigazione se ne va e non torna più**

- Dove: `components/Navbar.tsx:89 (`relative md:sticky`) e :32 (commento contrario) · :212-217 (CategoryBar renderizzata anche sotto md) · components/MobileTabBar.tsx:95-112`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. L'intestazione è fissa solo da 768px in su: `className="relative md:sticky md:top-0 z-sticky shadow-warm-sm"` (Navbar.tsx:89). Ho verificato che la CategoryBar viene renderizzata anche su telefono — il blocco `showCategoryBar` (righe 212-217) sta fuori dal contenitore `hidden md:block` del desktop — ed è l'unico posto dove vivono le sette destinazioni del marketplace più il pulsante «Tutte le categorie»…
- Come si ripara: Due strade, consiglio la seconda. ① Rendere fissa anche sotto md la sola riga CategoryBar (non tutta l'intestazione, che ruberebbe troppa altezza): estrarre il blocco `showCategoryBar` in un contenitore `sticky top-0`. ② Meglio: sostituire nella barra in fondo una scheda già raggiungibile altrove…

**60. Nel carrello «Procedi al checkout» resta in fondo, senza barra fissa sul telefono**

- Dove: `app/cart/page.tsx:125 e :292 (nessuna occorrenza di `fixed` nel file) · confronto: app/checkout/page.tsx:968`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Il carrello ha due colonne solo da 1024px in su (`grid-cols-1 lg:grid-cols-3`, app/cart/page.tsx:125) e la colonna riepilogo col pulsante «Procedi al checkout» (:292) è il secondo figlio, quindi sotto quella soglia finisce dopo l'elenco completo degli articoli. Ho cercato `fixed` in tutto il file: zero occorrenze; le uniche due di `sticky` sono alla riga 241, per la colonna desktop. Quindi nessuna barra…
- Come si ripara: Copiare nel carrello la barra già scritta nel checkout: `lg:hidden fixed inset-x-0 bottom-0` con «Totale» a sinistra e «Procedi al checkout» a destra, posizionata sopra la barra a schede usando `var(--tabbar-height)` come fa StickyAddToCart (che per il calcolo somma anche…

**61. Sulla scheda prodotto il negozio parla prima del nome del prodotto e del prezzo**

- Dove: `app/product/[id]/page.tsx:612 (SellerCard) prima di :618 (h1) e del blocco prezzo a :665-680`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO. Nella colonna informazioni l'ordine dei blocchi è: `<SellerCard>` (riga 612), poi il titolo `<h1>` del prodotto (:618), il cuoricino preferiti (inline con l'h1), «aggiungi a lista» (:643), i marchi di qualità (:647), stelle e recensioni (:650-664), e solo a quel punto il prezzo (:665-680). Sul computer il danno è contenuto perché il prezzo grande è anche nel riquadro d'acquisto a destra, ma sul telefono…
- Come si ripara: Spostare `<SellerCard>` sotto il blocco prezzo, o accorparlo alla riga «Venduto e consegnato da …» che già esiste nel riquadro d'acquisto (:884), evitando di dire due volte la stessa cosa. Ordine giusto della colonna: titolo → prezzo con IVA e risparmio → riquadro rassicurazione → varianti → chi è…

**62. Nel piè di pagina il contatto WhatsApp è un numero finto**

- Dove: `components/Footer.tsx:74 (`wa.me/393000000000` nell'elenco SOCIALS), :164 (stesso numero come ripiego), :20-80 (i sei profili scritti a mano) · .env.example:113 (chiave vuota)`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO sul pezzo certo, con un limite dichiarato sul resto. Il numero WhatsApp è un segnaposto scritto a mano nell'elenco SOCIALS: `href: 'https://wa.me/393000000000'` (components/Footer.tsx:74 nell'oggetto WhatsApp, elenco righe 20-80) — nove zeri dopo il prefisso. Lo stesso numero finto ricompare come ripiego nella colonna «Aiuto»: `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '393000000000'` (:164), e in…
- Come si ripara: Applicare la regola già usata per i dati legali: un collegamento si stampa solo se esiste davvero. Subito: togliere dal codice il `wa.me/393000000000` scritto a mano e far dipendere entrambe le voci dalla variabile d'ambiente, non renderizzando nulla quando è vuota. Poi: portare social e WhatsApp…

### performance-percepita


**63. Il carrello dice «è vuoto» per un attimo prima di far vedere la spesa vera**

- Dove: `app/cart/page.tsx:23,35,80 · app/checkout/page.tsx:44-47,712 · lib/cart.ts:33 · mancano app/cart/loading.tsx e app/checkout/loading.tsx`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO nel codice, con una correzione di gravità. Su /cart e /checkout la lista della spesa parte vuota e viene letta solo quando il telefono ha già disegnato la pagina. Verificato riga per riga: app/cart/page.tsx riga 23 parte da una lista vuota, la riempie nell'effetto di riga 35, e alla riga 80 mostra il blocco «Il tuo carrello è vuoto — Esplora i prodotti»; app/checkout/page.tsx fa la stessa cosa alle righe…
- Come si ripara: Tenere un interruttore «ho già letto la spesa»: finché è spento si mostra uno scheletro con la forma del carrello, e il messaggio «vuoto» compare solo a lettura finita e lista davvero vuota. Poi dare a /cart e /checkout la loro schermata di attesa, con la forma di quelle pagine. Prova che gira: un…

**64. La home riserva lo spazio di una sezione e poi se lo riprende, facendo saltare quello che c'è sotto**

- Dove: `components/home/DropOfDay.tsx:80,84 · components/home/TrendingNow.tsx:92-102`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, ma con una correzione importante su quale sezione salta davvero. «Il drop del giorno» (components/home/DropOfDay.tsx) riserva un rettangolo alto 288 pixel mentre carica, riga 80, e alla riga 84 restituisce il nulla se non c'è nessun drop: lo spazio collassa e tutto quello che sta sotto risale di colpo. Questo succede oggi sul serio: ho letto la banca dati, i drop con data di oggi sono zero, e la sezione…
- Come si ripara: Una regola sola per tutte le sezioni: o si sa in anticipo che la sezione ha contenuto, oppure non si riserva spazio. La strada pulita è decidere sul server quali sezioni hanno qualcosa dentro e non mandare al browser quelle vuote. Se la sezione deve restare nel browser, lo scheletro va alto quanto…

**65. Quarantasette foto su cinquantasette saltano il caricatore giusto, e nel carrello arrivano da cento pixel**

- Dove: `app/cart/page.tsx:166 · components/checkout/CartGroupsList.tsx:38 · components/RecentlyViewed.tsx:85 · components/SearchBar.tsx:219 · components/products/SellerCard.tsx:129 · components/store-sections/HeroSection.tsx:91 · lib/image-url.ts:16 · lib/image-loader.ts`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO nella sostanza, con i conteggi corretti. Ho ricontato ogni singolo uso di <Image> nel progetto: sono 57 in tutto (non 70 — quel numero contava anche componenti con nomi simili come ImageUpload), e si dividono in 10 col caricatore giusto (lib/image-loader.ts), 21 marcate «non ottimizzare» e 26 senza né l'uno né l'altro. Il totale dei punti sbagliati, 21+26 = 47, è esatto come dichiarato. Il difetto delle…
- Come si ripara: Una strada sola per tutte le foto remote: il caricatore di lib/image-loader.ts, e via ogni «non ottimizzare». Le 26 senza caricatore vanno agganciate allo stesso, così smettono di fare due giri. Prova che gira: un controllo automatico che legge i file del sito e fallisce se trova un <Image> con…

**66. Le pagine che vendono arrivano vuote: nome, prezzo e foto compaiono solo dopo due giri di rete**

- Dove: `app/product/[id]/page.tsx:1,126,478 · app/store/[id]/page.tsx:1 · app/category/[slug]/page.tsx:1 · app/search/page.tsx:1 · app/stores/page.tsx:1 · components/ProductGrid.tsx:87`
- Corsia: codice (serve un rilascio)
- Cosa succede: CONFERMATO, numeri esatti. Ho contato: le pagine del sito sono 112 e 96 di queste sono costruite per girare nel browser. Ho controllato a mano le cinque che portano soldi e sono tutte e cinque nel gruppo sbagliato: scheda prodotto (app/product/[id]/page.tsx riga 1), pagina negozio, categoria, ricerca, elenco negozi. I dati non viaggiano dentro la pagina: la scheda prodotto interroga la banca dati dal browser (riga…
- Come si ripara: Portare sul server almeno la prima schermata delle due pagine che contano: la scheda prodotto (foto, nome, prezzo, bottone) e la testata della pagina negozio, lasciando nel browser solo i pezzi che devono reagire al tocco. In alternativa, chiedere i dati sul server e consegnarli già pronti al…

**67. «Il drop del giorno» è acceso nella home ma oggi non ha niente da mostrare, e fa saltare la pagina**

- Dove: `site_settings.home_site (riga id=1) · pannello /admin/home`
- Corsia: config (si cambia senza rilascio)
- Cosa succede: CONFERMATO leggendo la configurazione viva, ma con tre correzioni. Ho letto site_settings riga 1: la home ha davvero 16 sezioni nell'ordine indicato. Però «attività live» e «invito ai venditori» risultano già spente (enabled=false), quindi non c'entrano nulla. E «di tendenza» non è vuota: come spiegato nel punto sul salto della pagina, ha un ripiego agli ultimi prodotti e con i 5 prodotti di Pane Quotidiano qualcosa…
- Come si ripara: Da /admin/home spegnere «il drop del giorno»: è l'unica sezione accesa che oggi riserva spazio e poi se lo riprende. Già che si è lì, ripulire i tre segnaposto «video promo», «banner» e «gallerai», che non si vedono ma restano titoli di prova salvati sulla home vera. È una modifica dal pannello:…

## Minori — 81


### layout-responsive


**1. Su ogni pagina il piè di pagina parte una schermata intera più in basso del contenuto**

- Dove: `app/layout.tsx:127`
- Corsia: codice (serve un rilascio)
- VERIFICATO, ma abbasso la gravità da grave a minore. Il meccanismo è reale: il contenitore centrale è `<main id="main-content" className="min-h-screen">`, altezza minima 100vh, e sopra c'è…

**2. Il margine laterale cambia da un pezzo all'altro della stessa pagina: intestazione a 16px, contenuto e piè di pagina a 24px**

- Dove: `components/Navbar.tsx:96 (px-4) e :171 (px-3) · components/CategoryBar.tsx:87 (px-3 sm:px-4) · components/Footer.tsx:99 (px-6) · pagine con `container mx-auto px-4 sm:px-6``
- Corsia: codice (serve un rilascio)
- VERIFICATO, con i conteggi rifatti da me (quelli della segnalazione erano un po' bassi). Nel repo `container mx-auto` compare con cinque imbottiture orizzontali diverse: px-3 in 2 punti, px-3 sm:px-4…

**3. Su monitor da 1920px l'intestazione è larga 1536px e il contenuto 1280: si vede lo scalino**

- Dove: `tailwind.config.ts (nessuna chiave `container`) · app/stores/page.tsx:183 e altre 7 pagine con max-w-7xl · 19 pagine con max-w-5xl`
- Corsia: codice (serve un rilascio)
- VERIFICATO. In tailwind.config.ts non c'è nessuna chiave `container`, quindi vale il valore di fabbrica: la larghezza massima segue la soglia di schermo e da 1536px in su diventa 1536px. Le pagine…

**4. Lo spazio riservato in fondo sul telefono (72px) non corrisponde all'altezza vera della barra a schede (circa 57px)**

- Dove: `app/globals.css:116 e :208 · components/MobileTabBar.tsx:139-169 · components/rider/RiderShell.tsx:59`
- Corsia: codice (serve un rilascio)
- VERIFICATO col conto rifatto voce per voce. `--tabbar-height` vale 72px e il body sotto i 768px si riserva quello spazio. La barra vera misura: py-2 (8+8) + icona 22 + gap-0.5 (2) + etichetta…

**5. Nel pannello admin da telefono lo spazio riservato in fondo è contato due volte**

- Dove: `app/admin/layout.tsx:44 (pb-24) + app/globals.css:208 (72px sul body)`
- Corsia: codice (serve un rilascio)
- VERIFICATO, con una correzione al numero. MobileTabBar resta visibile su /admin — l'elenco delle rotte nascoste (MobileTabBar.tsx:48-56) non include /admin, e c'è pure un ramo di schede dedicato…

**6. Sul telefono l'indicatore dei passi del checkout va a capo e lascia un trattino orfano appeso**

- Dove: `components/checkout/StepIndicator.tsx:58-68 (usato in app/cart/page.tsx:123 e nel checkout)`
- Corsia: codice (serve un rilascio)
- VERIFICATO con le misure vere prese dal componente. La riga è `flex items-center justify-center gap-4 sm:gap-8 flex-wrap` e ogni passo è impacchettato col trattino che lo segue in un `div` con lo…

**7. Le sezioni della home hanno tre spaziature verticali diverse, e l'admin può metterle in qualunque ordine**

- Dove: `components/home-sections/HomeSectionRenderer.tsx — py-6 alle righe 177/203/232/260/280/313, py-5 alle 343/386/408/433/454, py-4 alle 369-377`
- Corsia: codice (serve un rilascio)
- VERIFICATO riga per riga: i numeri della segnalazione corrispondono al file. La home è componibile dall'admin (app/page.tsx legge site_settings.home_site), quindi ogni sezione è una casella…

**8. Il salto alle recensioni lascia 144px di vuoto sopra il titolo sul telefono**

- Dove: `app/product/[id]/page.tsx:901 (scroll-mt-[var(--header-height)]) con il link a :656`
- Corsia: codice (serve un rilascio)
- VERIFICATO. La sezione recensioni (riga 901) si riserva `scroll-mt-[var(--header-height)]`, e globals.css:106 dice che quella variabile vale 9rem, cioè 144px: serve a non finire sotto l'intestazione…

**9. Un nome del sito lungo scritto dal pannello sfonda l'intestazione mobile in orizzontale**

- Dove: `components/Navbar.tsx:173 · schema in lib/site-branding.ts:50-54 · valore in site_settings.branding.wordmark`
- Corsia: codice (serve un rilascio)
- VERIFICATO nel meccanismo, e ho corretto la corsia. Il logo testuale a riga 173 è `shrink-0 … whitespace-nowrap text-xl font-serif font-bold`: non si restringe e non va a capo, mentre i suoi vicini…

### coerenza-brand


**10. Il tailwind spedisce a ogni visita 72 classi di colori che il sito non usa più, per un motivo scritto nel commento che non è più vero**

- Dove: `tailwind.config.ts:22-30 (safelist e relativo commento)`
- Corsia: codice (serve un rilascio)
- tailwind.config.ts:22-30 tiene una safelist che forza la generazione di (bg|text|border) per nove famiglie estranee alla palette — sky, violet, emerald, amber, indigo, rose, slate, pink, blue — su…

**11. Il colore che il negoziante sceglie per la sua vetrina viene messo in una variabile che nessuno legge**

- Dove: `app/store/[id]/page.tsx:106, app/store/[id]/[slug]/page.tsx:68, commento in app/globals.css:295`
- Corsia: codice (serve un rilascio)
- Le due pagine della vetrina — app/store/[id]/page.tsx:106 e app/store/[id]/[slug]/page.tsx:68 — mettono sul contenitore la variabile CSS --store-accent col colore scelto dal negozio. Ho cercato…

**12. I tre temi della vetrina sono scritti con valori a mano dentro il file che dovrebbe contenere solo i token**

- Dove: `app/globals.css:299-310`
- Corsia: codice (serve un rilascio)
- In fondo ad app/globals.css i temi della vetrina (righe 299-310) sovrascrivono lo stile agganciandosi alle classi di utilità invece che ai token, e riscrivendo a mano valori che esistono già più…

**13. Il nome del marketplace si può cambiare dal pannello, ma quattro schermate continuerebbero a dire MyCity**

- Dove: `components/admin/AdminSidebar.tsx:72-73, app/opengraph-image.tsx:30-31, app/store/[id]/opengraph-image.tsx:51-52, app/product/[id]/opengraph-image.tsx:74-75, anteprima sbagliata in app/admin/branding/page.tsx:153`
- Corsia: codice (serve un rilascio)
- Il nome è configurabile: vive in site_settings.branding.wordmark e si modifica da /admin/branding, con lib/site-branding.ts a normalizzarlo. La barra in alto (Navbar.tsx:99 e :174) e il piè di pagina…

**14. I sei colori dei coriandoli sono una settima copia della palette, scritta a mano**

- Dove: `components/ConfettiBurst.tsx:5`
- Corsia: codice (serve un rilascio)
- components/ConfettiBurst.tsx:5 tiene una costante COLORS con sei esadecimali copiati dalla palette (#C0492C, #E8A33D, #5A7C42, #EE9F86, #FBD891, #7C8B5A): li ho confrontati uno a uno col…

**15. La cartella del design system non è collegata al sito: i colori vivono in tre copie tenute allineate a mano**

- Dove: `design-system/styles.css e design-system/tokens/*.css (mai importati) vs app/globals.css:5-230 e tailwind.config.ts:31-140; import in app/layout.tsx:1`
- Corsia: codice (serve un rilascio)
- design-system/styles.css si presenta come il punto d'ingresso unico ("consumers link THIS file only") e raccoglie i token in tokens/*.css. Ho cercato chi lo importa: nessuno. app/layout.tsx:1 importa…

### tipografia


**16. L'avviso che la spedizione può cambiare di prezzo è il testo più piccolo del carrello**

- Dove: `app/cart/page.tsx righe 263 e 275 · app/checkout/page.tsx riga 970`
- Corsia: codice (serve un rilascio)
- CONFERMATO nei fatti, SEVERITÀ ABBASSATA da grave a minore. I fatti sono esatti: nel riepilogo del carrello, sotto la voce «Spedizione», la riga «stima · potrebbe variare al checkout» è scritta con…

**17. Il titolone della home non ha un limite di larghezza, e il campo dell'editor accetta 200 caratteri**

- Dove: `components/home-sections/HomeSectionRenderer.tsx riga 99 · components/admin/home/HomeSectionConfigForm.tsx righe 127-129`
- Corsia: codice (serve un rilascio)
- CONFERMATO. Il titolo grosso della home è `text-4xl md:text-5xl lg:text-6xl` in Fraunces, quindi fino a 60 pixel (riga 99), e non ha nessun limite di larghezza della riga. Il sottotitolo subito sotto…

**18. Nella cookie policy i sotto-paragrafi sono grandi uguali ai paragrafi**

- Dove: `app/cookies/page.tsx righe 48, 70, 79, 92 · components/ui/LegalLayout.tsx riga 114`
- Corsia: codice (serve un rilascio)
- CONFERMATO riga per riga. Nel layout dei documenti legali il titolo di sezione è fissato a `text-xl`, cioè 20 pixel (LegalLayout.tsx riga 114, `text-xl font-bold`). Dentro la cookie policy ci sono…

**19. I numeri della classifica prodotti del venditore sono quasi invisibili**

- Dove: `app/seller/analytics/page.tsx riga 275`
- Corsia: codice (serve un rilascio)
- CONFERMATO, ma il numero del contrasto era sbagliato e l'ho corretto. Nella classifica «prodotti più visti» dell'area venditore, il numero di posizione (1, 2, 3…) è scritto `w-4 text-[13px]…

**20. La pagina delle spedizioni usa classi di impaginazione che nel progetto non esistono**

- Dove: `app/shipping/page.tsx riga 44`
- Corsia: codice (serve un rilascio)
- CONFERMATO su tutti e tre i pezzi. La sezione con tutto il testo delle spedizioni è marcata `prose prose-gray max-w-none space-y-6 text-ink-700 leading-relaxed` (riga 44). Le classi `prose` arrivano…

### accessibilita-visiva


**21. Il negozio di Piacenza ha scelto l'unico colore del catalogo che non si legge**

- Dove: `profiles.store_customization, negozio Pane Quotidiano (id c0b240c0-2a86-4218-9d0f-5154f08ff929)`
- Corsia: config (si cambia senza rilascio)
- CONFERMATO nel dato, ma SEVERITÀ CORRETTA da grave a minore, perché oggi non lo subisce nessuno. Il dato è vero e l'ho letto io nel database: Pane Quotidiano — l'unico negozio reale — ha come colore…

**22. In quattro campi il fuoco della tastiera non si vede proprio**

- Dove: `components/seller/StoreHoursEditor.tsx:58 e :66 · components/seller/QuickAiTools.tsx:164 · components/products/ImportFromUrlBox.tsx:149`
- Corsia: codice (serve un rilascio)
- CONFERMATO nel codice; severità corretta a minore perché tocca quattro controlli, tutti nell'area del venditore, non il percorso del compratore. Quattro campi spengono il contorno di fuoco con…

**23. Il banner della vetrina può restare senza velo sotto il testo bianco**

- Dove: `components/store-sections/BannerSection.tsx:14 · components/cms/CmsBlockRenderer.tsx:32`
- Corsia: codice (serve un rilascio)
- CONFERMATO, ed è davvero solo una trappola. Il banner grande scrive titolo e sottotitolo in bianco sopra una foto caricata dal negoziante. Il negoziante sceglie fra tre veli: scuro, chiaro, nessuno.…

**24. Le stelle del venditore sono rimaste del colore vecchio**

- Dove: `components/products/SellerCard.tsx:145`
- Corsia: codice (serve un rilascio)
- CONFERMATO. La stella accanto al voto del negozio, nel riquadro venditore della scheda prodotto, è colorata con accent-400 riempita e accent-500 di contorno (components/products/SellerCard.tsx:145,…

**25. Le stelle vuote del voto quasi non si vedono**

- Dove: `app/product/[id]/page.tsx:971 · app/orders/[id]/review/page.tsx:27 · app/rider/reviews/page.tsx:27`
- Corsia: codice (serve un rilascio)
- CONFERMATO. Quando si dà un voto, le cinque stelle sono tutte lo stesso simbolo ★ e l'unica differenza fra 'scelta' e 'non scelta' è il colore: accent-700 contro ink-300 (#A8A29E), che sul bianco…

**26. Alcuni pulsanti-icona sono più piccoli del polpastrello**

- Dove: `components/seller/site/MenuEditor.tsx:55,56 · components/seller/site/PageListEditor.tsx:59,62 · components/seller/site/PageSectionsEditor.tsx:169,172 · components/admin/home/HomeSectionsEditor.tsx:104,107`
- Corsia: codice (serve un rilascio)
- CONFERMATO sui comandi dell'area venditore; DUE CASI SCARTATI per dubbio. WCAG 2.5.8 chiede che un comando misuri almeno 24x24 pixel. Ho sommato per ognuno la dimensione dell'icona e il margine…

**27. Il grigio del testo secondario è appeso alla soglia**

- Dove: `app/product/[id]/page.tsx:670,674,678 · app/cart/page.tsx:129,245,287 · app/checkout/page.tsx:928`
- Corsia: codice (serve un rilascio)
- CONFERMATO, ed è davvero questione di centesimi: lo dichiaro come tale, non come un blocco. Il grigio ink-400 (#78716C) sul bianco misura 4,80:1 e passa. Ma il fondo di tutto il sito è cream-100…

### stati-ui


**28. Sezioni della home che compaiono a scatti, senza scheletro che tenga il posto**

- Dove: `components/CategoryShowcase.tsx:75-95 · components/home/PromoDeals.tsx:25-36 · components/SponsoredCarousel.tsx:119`
- Corsia: codice (serve un rilascio)
- CONFERMATO. La copertura degli scheletri sulla home è a metà: components/StoreShowcase.tsx (riga 48 destruttura anche isError e refetch, riga 55 disegna lo scheletro) e…

**29. Nel checkout, se i prodotti non si caricano, manca il pulsante per riprovare**

- Dove: `app/checkout/page.tsx:68 (useQuery senza isError) · 722 (LoadingState) · 918 (messaggio d'errore)`
- Corsia: codice (serve un rilascio)
- CONFERMATO. La query che raggruppa il carrello per negozio (riga 68) destruttura solo `isLoading: loadingGroups`; `isError` e `refetch` non compaiono in tutta la pagina. L'avviso «Errore nel…

**30. Quando il fattorino accetta un ordine, girano tutti i pulsanti «Accetta» dell'elenco**

- Dove: `app/rider/page.tsx:443 · app/events/page.tsx:210 · app/admin/orders/page.tsx:189`
- Corsia: codice (serve un rilascio)
- CONFERMATO su tre liste, NON sulle altre due segnalate. Dove il difetto è vero, ogni riga passa al proprio pulsante lo stato di attesa di UNA sola mutazione condivisa: app/rider/page.tsx riga 443 è…

**31. Nella schermata di accesso ci sono due pulsanti morti e sul telefono non lo si scopre**

- Dove: `components/ui/AuthShell.tsx:132-134 (SPID) e 144-152 (accesso via SMS)`
- Corsia: codice (serve un rilascio)
- CONFERMATO parola per parola. Sotto la riga «oppure» ci sono tre alternative all'accesso con la password e due sono spente in modo permanente: SPID (riga 132, `<Button ... disabled title="SPID —…

**32. Sul sito convivono due scheletri di caricamento con due aspetti diversi**

- Dove: `app/globals.css:182-196 (.skeleton, shimmer) usato da components/ui/LoadingState.tsx · components/SkeletonCard.tsx e altri 15 file usano animate-pulse`
- Corsia: codice (serve un rilascio)
- CONFERMATO (con un conto più preciso). Ci sono due modi di dire «sto caricando» e si vedono diversi. Uno è la classe `.skeleton` di app/globals.css: un riflesso chiaro che scorre da sinistra a destra…

**33. Lo scheletro della griglia non ha la forma della griglia vera e il layout salta**

- Dove: `components/SkeletonCard.tsx:17-21 (SkeletonGrid) · components/ProductGrid.tsx:332 e 432-437`
- Corsia: codice (serve un rilascio)
- CONFERMATO. `SkeletonGrid` (components/SkeletonCard.tsx riga 17) è fisso a `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`, mentre la griglia vera calcola `gridCols` in ProductGrid riga 432 e nel caso…

**34. Otto conferme usano ancora la finestra grigia del browser invece del riquadro del sito**

- Dove: `app/admin/orders/page.tsx:185 · app/admin/categories/page.tsx:74 · app/admin/daily-drops/page.tsx:165 · app/rider/orders/[id]/page.tsx:471 · components/admin/home/HomeSectionsEditor.tsx:123 e 136 · components/seller/site/PageSectionsEditor.tsx:182 · components/seller/site/PageListEditor.tsx:46`
- Corsia: codice (serve un rilascio)
- CONFERMATO: otto punti esatti, verificati uno per uno. Esiste già components/ConfirmDialog.tsx, scritto apposta per sostituire `window.confirm` (lo dice il commento alla riga 8): espone…

**35. Tre sezioni della home restano accese ma vuote e il pannello non avvisa che non si vedono**

- Dove: `components/admin/home/HomeSectionsEditor.tsx:101-116 · components/home-sections/HomeSectionRenderer.tsx:399, 430, 449 · site_settings.home_site (sezioni «video», «banner», «gallery»)`
- Corsia: config (si cambia senza rilascio)
- CONFERMATO a metà, e dico quale metà. La parte di codice l'ho verificata: HomeSectionRenderer restituisce `null` per la sezione banner senza `imageUrl` (riga 399), per la galleria con zero immagini…

**36. Il pulsante che conferma l'ordine cambia solo la scritta, senza rotella**

- Dove: `components/checkout/OrderSummary.tsx:89-105 · app/checkout/page.tsx:973-985 (barra fissa del telefono)`
- Corsia: codice (serve un rilascio)
- CONFERMATO. La parte importante è a posto: `disabled={isCheckingOut || disabled}` (OrderSummary riga 92) impedisce il doppio ordine, ed è la cosa che conta di più in tutto il checkout. Manca però il…

### immagini-media


**37. L'icona dell'app di MyCity è testo e cambia forma da telefono a telefono**

- Dove: `public/icon-192.svg · public/icon-512.svg · app/layout.tsx:46-52 · public/manifest.json · favicon.ico mancante · design-system/assets/*.svg (non referenziati)`
- Corsia: codice (serve un rilascio)
- VERIFICATO, con una correzione importante rispetto a come era segnalato. È vero che gli SVG contengono testo e non tracciati: design-system/assets/wordmark-light.svg e wordmark-ondark.svg hanno…

**38. Nessun video mostra un fotogramma prima di partire: si vede un rettangolo nero**

- Dove: `components/StoreMediaCarousel.tsx:76 · components/home-sections/HomeSectionRenderer.tsx:458 · components/StoreMediaManager.tsx:109`
- Corsia: codice (serve un rilascio)
- VERIFICATO: `grep -rn 'poster=' app components` non trova nulla, in tutto il marketplace non c'è un solo attributo `poster` su un tag `<video>`. I punti che si vedono:…

**39. Le foto si riscaricano ogni ora anche se non cambiano mai**

- Dove: `lib/products/uploadImages.ts:42 · components/seller/site/ImageUpload.tsx:27 · +5 punti (grep -rn cacheControl app components lib)`
- Corsia: codice (serve un rilascio)
- VERIFICATO, e il problema è più esteso di come era segnalato: `cacheControl: '3600'` (un'ora) sta in SETTE punti di upload, non due — lib/products/uploadImages.ts:42 (non 41),…

**40. Lo scheletro di caricamento ha una forma diversa dal contenuto che arriva**

- Dove: `components/SimilarProducts.tsx:86 (scheletro) vs :108 (contenuto)`
- Corsia: codice (serve un rilascio)
- VERIFICATO. In components/SimilarProducts.tsx:86 i sei riquadri grigi mostrati durante il caricamento sono `aspect-[3/4] rounded-xl skeleton`, mentre la scheda vera che li sostituisce (riga 108) è…

**41. Il banner della home è schiacciato e non si può scegliere quale parte della foto si vede**

- Dove: `components/home-sections/HomeSectionRenderer.tsx:408 · components/store-sections/BannerSection.tsx:23 · components/seller/site/ImageUpload.tsx:59`
- Corsia: codice (serve un rilascio)
- VERIFICATO. Il banner configurabile dal pannello ha altezza fissa `h-56 sm:h-72` a tutta larghezza, in components/home-sections/HomeSectionRenderer.tsx:408 e nel gemello…

**42. L'avatar del profilo pubblico scarica il file intero per mostrarlo grande come un francobollo**

- Dove: `app/u/[handle]/page.tsx:86`
- Corsia: codice (serve un rilascio)
- VERIFICATO. In app/u/[handle]/page.tsx:86 l'immagine è `<Image src={profile.public_avatar_url} width={96} height={96} unoptimized className="object-cover" />`: l'indirizzo è quello grezzo, senza…

### mobile-pwa


**43. Bersagli da toccare sotto i 44px sui comandi mobili principali**

- Dove: `components/Navbar.tsx:201 («Accedi»), components/LocationPill.tsx:56 (pastiglia CAP), components/CategoryBar.tsx:97 e :116 (schede categorie), components/StickyAddToCart.tsx:82 e :92 (− e +), app/near/page.tsx:209 (cursore del raggio)`
- Corsia: codice (serve un rilascio)
- VERIFICATI tutti e sei, uno per uno. La soglia il progetto se l'è data da solo: components/ui/Button.tsx:35 fissa `min-h-[44px]` su size md. Fuori dalla primitiva salta. «Accedi» nella barra mobile è…

**44. Su iPhone non esiste nessun modo di installare l'app**

- Dove: `components/PWAInstallBanner.tsx:44-53`
- Corsia: codice (serve un rilascio)
- VERIFICATO il fatto, RIDOTTA la severità. Tutto il banner «Installa MyCity» dipende da un solo evento: `window.addEventListener('beforeinstallprompt', handler)`, e `setShow(true)` sta solo dentro…

**45. I fogli in fondo (Modal) finiscono sotto la barra dei gesti dell'iPhone**

- Dove: `components/ui/Modal.tsx:127 e :136-139`
- Corsia: codice (serve un rilascio)
- CONFERMATO A METÀ — tengo la parte vera e butto il racconto sbagliato. Vero: su mobile il Modal è un foglio agganciato in fondo (`flex items-end sm:items-center`, `sm:p-4` cioè nessun margine sotto i…

**46. Il banner «Installa MyCity» non usa le misure del sistema e può finire sotto quello dei cookie**

- Dove: `components/PWAInstallBanner.tsx:77`
- Corsia: codice (serve un rilascio)
- VERIFICATO in tutte e tre le conseguenze. Il banner è `fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-30`: 80px scritti a mano e livello 30. Il progetto ha invece una casa…

**47. Doppio spazio di sicurezza sotto la barra «Aggiungi al carrello»**

- Dove: `components/StickyAddToCart.tsx:54 e :57`
- Corsia: codice (serve un rilascio)
- VERIFICATO. Lo stesso contenitore ha sia la classe `pb-safe` (riga 54) — che in app/globals.css:199 aggiunge `padding-bottom: env(safe-area-inset-bottom, 0)` — sia, nello stile in riga (riga 57),…

**48. Gli stati «hover» restano appiccicati dopo il tocco**

- Dove: `tailwind.config.ts (manca il blocco `future`), app/globals.css:223-229 (`.card-hover:hover`), app/globals.css:254-261 (pausa del ticker)`
- Corsia: codice (serve un rilascio)
- VERIFICATO, versione compresa. La versione installata è Tailwind 3.4.19 (letta da node_modules/tailwindcss/package.json): genera le utility `hover:` senza `@media (hover: hover)` a meno che non si…

**49. Il link promo scorre mentre lo tocchi e sul telefono non si ferma mai**

- Dove: `components/PromoTicker.tsx (link `px-3 py-0.5` e contenitore `.animate-marquee`) + app/globals.css:254-261`
- Corsia: codice (serve un rilascio)
- VERIFICATO, compreso il fatto che sta su ogni pagina: PromoTicker è montato in components/Navbar.tsx:90, dentro l'`<header>`, quindi in cima a tutto il sito. La striscia scorre in continuo…

**50. Il manifest PWA è minimo: niente schermate, niente scope, e la rotazione è bloccata**

- Dove: `public/manifest.json`
- Corsia: codice (serve un rilascio)
- VERIFICATO leggendo il file intero. Ci sono nome, short_name, descrizione, start_url, display standalone, quattro icone (compresa la maskable 512), theme_color, categories e lang: la base c'è.…

**51. La mappa «vicino a te» cattura lo scorrimento del dito**

- Dove: `components/NearbyStoresMap.tsx:34 (className di default) e :63 (`L.map`)`
- Corsia: codice (serve un rilascio)
- VERIFICATO. La mappa viene creata con `L.map(divRef.current).setView(...)`, senza nessuna opzione: quindi valgono i valori di partenza di Leaflet, cioè trascinamento a un dito attivo. Il contenitore…

**52. Il venditore in modalità acquisto ha due ingressi all'account nella stessa schermata**

- Dove: `components/MobileTabBar.tsx:216 (condizione `isSeller || isAdmin`) rispetto al ramo `isAuthenticated` delle schede, righe 95-102`
- Corsia: codice (serve un rilascio)
- VERIFICATO seguendo i due rami. Il pulsante tondo flottante «Tu» compare per ogni `isSeller || isAdmin` (riga 216), senza guardare la modalità acquisto, ed è posizionato a `bottom-44` quando è un…

**53. La barra in fondo del fattorino non è allineata alla sua colonna sopra i 480px**

- Dove: `components/rider/RiderShell.tsx:70`
- Corsia: codice (serve un rilascio)
- VERIFICATO, insieme alla prova che la casa la strada giusta la conosce. La barra è `fixed bottom-0 z-sticky w-full max-w-[480px] border-t …`: nessun `left`, nessun `right`, nessuna traslazione — e su…

**54. L'altezza dichiarata della barra a schede non è quella vera: una quindicina di pixel di vuoto in fondo a ogni pagina**

- Dove: `app/globals.css:116 (`--tabbar-height: 72px`) e :207-210, rispetto a components/MobileTabBar.tsx:139-142 e :156`
- Corsia: config (si cambia senza rilascio)
- VERIFICATO rifacendo il conto sul codice. La variabile dice 72px e il corpo della pagina riserva quello spazio (`body { padding-bottom: calc(var(--tabbar-height) + env(safe-area-inset-bottom, 0))…

**55. La home ha una sezione «video» accesa che non mostra niente, dentro una colonna mobile da quattordici sezioni**

- Dove: `site_settings.home_site (progetto Supabase «Mycity», riga unica) + components/home-sections/HomeSectionRenderer.tsx:445-448`
- Corsia: config (si cambia senza rilascio)
- RILIEVO RISCRITTO: il difetto è vero, i numeri del collega no. Ho interrogato la configurazione vera: le sezioni sono 16 e ne sono accese 14 (spente solo `liveActivity` e `sellerCta`) — non 15 e 13,…

### flussi-conversione


**56. Il riquadro «Live · Cosa sta succedendo a Piacenza» non ha nessun filtro sul tempo e puo mostrare ordini di mesi fa**

- Dove: `components/LiveActivityFeed.tsx:50-61 (query su live_activity_public, order by created_at, limit 8, nessun where sulla data) e :27-35 (timeAgo) · reso in components/home-sections/HomeSectionRenderer.tsx:233, sezione attiva di default (lib/home-site.ts:240)`
- Corsia: codice (serve un rilascio)
- CONFERMATO nella sostanza, ESEMPIO CORRETTO. E vero che la query prende gli ultimi otto record qualunque sia la loro eta e che timeAgo e pronto a scrivere «58g fa» (riga 35), sotto un pallino verde…

**57. L'esperimento A/B sulla home e acceso e non potra dare una risposta con i volumi di oggi**

- Dove: `lib/experiments.ts:30-34 (home_hero, enabled: true, due varianti 50/50) · app/page.tsx:16-49 (HERO_VARIANTS)`
- Corsia: codice (serve un rilascio)
- CONFERMATO come fatto: home_hero ha enabled: true e due varianti, e assignVariant le distribuisce in modo uniforme con Web Crypto; app/page.tsx definisce due titoli d'ingresso diversi. Metа dei…

**58. Due numerazioni di passi diverse sulla stessa schermata di checkout, e il passo 3 «Conferma» non esiste**

- Dove: `app/checkout/page.tsx:736 (StepIndicator currentStep={2}) e i tre StepCard n=1/2/3 alle righe 750, 762 e 803 · components/checkout/StepIndicator.tsx:39-43 (CHECKOUT_STEPS)`
- Corsia: codice (serve un rilascio)
- CONFERMATO. In alto la barra dice 1 Carrello · 2 Indirizzo · 3 Conferma, con il 2 acceso. Subito sotto ci sono tre schede numerate 1 «Indirizzo di consegna», 2 «Quando vuoi riceverlo», 3 «Come…

**59. Tre pulsanti a piena larghezza uno sotto l'altro sulla scheda prodotto: nessuno e chiaramente il principale**

- Dove: `app/product/[id]/page.tsx:857-880 (Aggiungi al carrello · Compra ora · Contatta il venditore) e :1110-1120 (barra mobile con la sola aggiunta al carrello)`
- Corsia: codice (serve un rilascio)
- CONFERMATO. In colonna, tutti con fullWidth o w-full: il Button variant="accent" size="lg" «Aggiungi al carrello», il pulsante nero pieno (bg-ink-900) «Compra ora · paghi alla consegna», poi…

### microcopy


**60. Al fornaio che pubblica una storia il sito può rispondere «Applica la migration 035»**

- Dove: `app/seller/stories/page.tsx:78 (mostrato via toast a riga 100)`
- Corsia: codice (serve un rilascio)
- CONFERMATA la stringa: `throw new Error('Bucket "stories" non configurato. Applica la migration 035.')` a riga 78, e l'errore finisce in un avviso a schermo (riga 100 `onError: (err) =>…

**61. Al cliente che allega una foto alla recensione il sito può dire di «chiedere all'admin di creare il bucket»**

- Dove: `components/PhotoReviewUpload.tsx:54`
- Corsia: codice (serve un rilascio)
- CONFERMATA la stringa a riga 54: «Bucket "reviews" non esiste. Chiedi all'admin di crearlo (public, max 5MB).», mostrata con toast.error diretto. È rivolta a un cliente qualunque che sta scrivendo…

**62. Se una colonna del database non esiste, il sito dice «Nessun risultato» mentre il salvataggio è fallito**

- Dove: `lib/errors.ts:20 (SUPABASE_CODE_MAP)`
- Corsia: codice (serve un rilascio)
- CONFERMATO: nella tabella di traduzione dei codici c'è `'PGRST204': 'Nessun risultato.'` (lib/errors.ts:20). Ma PGRST204 in PostgREST non vuol dire «nessun risultato»: vuol dire che una colonna…

**63. Quando il server va in errore il sito dice «Riproveremo tra poco», ma non riprova nessuno**

- Dove: `lib/errors.ts:96 · configurazione in components/providers/QueryProvider.tsx:27 (`mutations: { retry: 0 }`)`
- Corsia: codice (serve un rilascio)
- CONFERMATO il testo: su errore 5xx friendlyError restituisce «Problema del server. Riproveremo tra poco.» (lib/errors.ts:96), e le mutazioni sono configurate con `retry: 0` (QueryProvider.tsx:27),…

**64. Nel costruttore della vetrina la stessa cosa si chiama «blocco» in un punto e «sezione» in quello accanto**

- Dove: `components/seller/site/PageSectionsEditor.tsx:52, 136, 176, 182, 184 (blocco) · components/seller/site/SectionConfigForm.tsx:75 (sezione)`
- Corsia: codice (serve un rilascio)
- CONFERMATO. È lo schermo con cui il negoziante costruisce la propria vetrina. I pulsanti dicono «Aggiungi blocco» (PageSectionsEditor.tsx:52), «Rimuovi blocco» (:184), «Nascondi blocco»/«Mostra…

**65. Nel costruttore della vetrina le conferme di cancellazione sono finestre grezze del browser**

- Dove: `components/seller/site/PageListEditor.tsx:46 · components/seller/site/PageSectionsEditor.tsx:182 · components/admin/home/HomeSectionsEditor.tsx:123,136 · app/admin/orders/page.tsx:185 · app/admin/categories/page.tsx:74 · app/admin/daily-drops/page.tsx:165 · app/rider/orders/[id]/page.tsx:471`
- Corsia: codice (serve un rilascio)
- CONFERMATO, e sono otto punti, non sei (grep su window.confirm/confirm): i due pulsanti non li scriviamo noi, li scrive il browser, con le sue parole e nella sua lingua — su un dispositivo impostato…

**66. La stessa cosa detta con parole diverse: quattro coppie di messaggi doppi**

- Dove: `app/profile/settings/page.tsx:136,140 · app/reset-password/page.tsx:91,95,257 · app/api/auth/signup/route.ts:35 · app/sign-up/page.tsx:77 · app/sign-in/page.tsx:67 · app/contact/page.tsx:41,37,54 · app/seller/products/import/page.tsx:94 · components/seller/ProductImagesField.tsx:104`
- Corsia: codice (serve un rilascio)
- CONFERMATO, coppia per coppia. Password corta: «La password deve essere di almeno 8 caratteri» (profile/settings:136) contro «La password deve avere almeno 8 caratteri» (reset-password:91 e…

**67. Tre etichette in inglese sui campi che il negoziante deve compilare: «Handle», «Slug», «Seller»**

- Dove: `components/PublicProfileToggle.tsx:30, 65, 87, 129 · components/seller/site/PageEditor.tsx:47,48 · app/admin/sponsored/page.tsx:153`
- Corsia: codice (serve un rilascio)
- CONFERMATO. Il campo del profilo pubblico si chiama «Handle pubblico» (PublicProfileToggle.tsx:129) e gli avvisi collegati dicono «Scegli un handle pubblico» (:65), «Handle già preso, scegline un…

**68. «Devi essere loggato» dove tutto il resto del sito dice «Accedi per…»**

- Dove: `components/PushNotificationOptIn.tsx:81`
- Corsia: codice (serve un rilascio)
- CONFERMATO: attivando le notifiche senza aver fatto l'accesso compare «Devi essere loggato» (PushNotificationOptIn.tsx:81), ed è l'unica occorrenza in tutto il repo di quel verbo storpiato…

**69. Gli avvisi di conferma hanno il punto esclamativo a caso: «Profilo aggiornato» e «Profilo aggiornato!»**

- Dove: `app/profile/page.tsx:66 vs app/rider/profile/page.tsx:89 · components/ProductQA.tsx:113 vs app/seller/reviews/page.tsx:163 · components/ShareCartButton.tsx:47 e app/profile/referral/page.tsx:65 vs app/lists/[id]/page.tsx:189`
- Corsia: codice (serve un rilascio)
- CONFERMATO su tre coppie verificate col grep: «Profilo aggiornato!» (app/profile/page.tsx:66) contro «Profilo aggiornato» (app/rider/profile/page.tsx:89); «Risposta pubblicata!»…

**70. Nella configurazione della home ci sono tre sezioni segnaposto ancora salvate: «gallerai», «video promo», «banner»**

- Dove: `site_settings.home_site → sezioni type="gallery" (id 3de9d502…), type="video" (id 39fc7cf6…), type="banner" (id 16278dfe…)`
- Corsia: config (si cambia senza rilascio)
- CONFERMATO leggendo il record vero (site_settings id=1). La sezione galleria ha come titolo «gallerai» — refuso per «galleria» — la sezione video ha «video promo» tutto minuscolo, e la sezione banner…

**71. Nell'hero due sbavature di lingua: «in pochi tap» e «Inizia ad esplorare»**

- Dove: `site_settings.home_site → sezione hero, campi subhead e ctaLabel · il «in pochi tap» è anche in app/page.tsx:28 (testo di riserva)`
- Corsia: config (si cambia senza rilascio)
- CONFERMATO sul record vero (site_settings.home_site → hero): il sottotitolo dice «ordini dai commercianti del tuo quartiere in pochi tap» e il pulsante dice «Inizia ad esplorare». «Tap» è parola da…

### navigazione-gerarchia


**72. La pagina «Tutti i negozi» è l'unica senza briciole di pane e con il titolo di un altro carattere**

- Dove: `app/stores/page.tsx:184-192 (intestazione fatta a mano, zero `font-serif`, nessun breadcrumb) · confronto: components/CollectionHeader.tsx:57-60`
- Corsia: codice (serve un rilascio)
- CONFERMATO nei fatti, severità abbassata. Dieci pagine di scoperta passano dal componente condiviso `CollectionHeader`, che stampa briciole di pane, occhiello, pastiglia con l'icona e titolo…

**73. La larghezza del contenuto cambia a ogni passo del percorso d'acquisto**

- Dove: `tailwind.config.ts (manca `theme.extend.container`) · app/globals.css:116 · design-system/tokens/spacing.css:30 · app/stores/page.tsx:184 · app/store/[id]/page.tsx:107`
- Corsia: codice (serve un rilascio)
- CONFERMATO. Seguendo il percorso vero di un cliente la colonna di contenuto si restringe due volte: home e scheda prodotto usano `container mx-auto` nudo; `/stores` aggiunge `max-w-7xl`, cioè 1280px…

**74. Le barre che scorrono di lato non dicono che c'è dell'altro**

- Dove: `components/CategoryBar.tsx:89 · components/store-sections/StoreNav.tsx:15 (nessun gradient/mask/::after in entrambi i file)`
- Corsia: codice (serve un rilascio)
- CONFERMATO. La CategoryBar mette in una riga scorrevole otto voci — «Tutte le categorie» più le sette destinazioni — con `overflow-x-auto scrollbar-hide` (components/CategoryBar.tsx:89). La classe…

**75. Il mega-menu delle categorie ripete l'errore già corretto nel menu dell'account**

- Dove: `components/CategoryBar.tsx:136 (`role="menu"`) e :96 (`aria-haspopup="menu"`) · confronto già corretto: components/Navbar.tsx:288 (commento #144) e :321 (`aria-haspopup="true"`)`
- Corsia: codice (serve un rilascio)
- CONFERMATO, con una correzione di riga. Il pannello del mega-menu si dichiara `role="menu"` a components/CategoryBar.tsx:136 (non 148 come segnalato) e il pulsante che lo apre dichiara…

**76. Il salto alle recensioni lascia un buco di 144px sopra il titolo**

- Dove: `app/product/[id]/page.tsx:901 · app/globals.css:106 · components/Navbar.tsx:89`
- Corsia: codice (serve un rilascio)
- CONFERMATO. La sezione recensioni della scheda prodotto usa `scroll-mt-[var(--header-height)]` (app/product/[id]/page.tsx:901) e quel valore è fisso a 9rem, cioè circa 144px (app/globals.css:106, col…

**77. Nella home la striscia delle garanzie arriva al nono blocco su undici**

- Dove: `lib/home-site.ts:238-241 (`DEFAULT_ORDER`, `trustRow` in nona posizione) · valore reale in site_settings.home_site · attenuante: app/page.tsx:30 e :44`
- Corsia: config (si cambia senza rilascio)
- CONFERMATO. L'ordine di serie della home è deciso in lib/home-site.ts:238-241 (`DEFAULT_ORDER`): hero, reorder, howItWorks, categories, dropOfDay, popularProducts, liveActivity, nearbyStores,…

### performance-percepita


**78. Il carattere dei titoli scarica cinque file quando ne basterebbe uno**

- Dove: `app/layout.tsx:29-34`
- Corsia: codice (serve un rilascio)
- CONFERMATO nel meccanismo, corretti i conteggi e abbassata la gravità. In app/layout.tsx righe 29-34 il carattere dei titoli (Fraunces) viene chiesto elencando cinque spessori — 400, 500, 600, 700,…

**79. La schermata di attesa promette prodotti anche a chi sta andando a pagare**

- Dove: `app/loading.tsx · components/ui/LoadingState.tsx · mancano loading.tsx in app/cart, app/checkout, app/search, app/category/[slug], app/stores, app/profile, app/orders`
- Corsia: codice (serve un rilascio)
- CONFERMATO parola per parola. C'è una sola schermata di attesa generale (app/loading.tsx) e dice «Stiamo caricando… Prepariamo i prodotti dei negozi vicino a te» disegnando quattro schede prodotto…

**80. L'effetto luccicante degli scheletri tiene occupato il telefono proprio mentre deve caricare**

- Dove: `app/globals.css:183-196 · components/ui/LoadingState.tsx · components/home/TrendingNow.tsx:95 · components/home/DropOfDay.tsx:80`
- Corsia: codice (serve un rilascio)
- CONFERMATO il meccanismo, corretto il conteggio. L'effetto di attesa è fatto muovendo la posizione dello sfondo (app/globals.css righe 183-196: uno sfondo sfumato largo 1000 pixel e un'animazione che…

**81. Sette richieste alla banca dati partono dalla barra in alto su ogni pagina, quella del pagamento compresa**

- Dove: `components/Navbar.tsx:40-48 · components/hooks/useBranding.ts:16 · components/CategoryBar.tsx:55 · components/PromoTicker.tsx:26 · components/Footer.tsx:1,91`
- Corsia: codice (serve un rilascio)
- CONFERMATO, tutte e sette verificate una per una. La barra in cima (components/Navbar.tsx righe 40-48) accende sette letture che partono dal browser su ogni singola pagina, prima ancora che la pagina…