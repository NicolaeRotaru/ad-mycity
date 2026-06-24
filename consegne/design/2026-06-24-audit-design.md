---
tipo: audit-design
data: 2026-06-24
fonte: workflow audit-design (18 agenti, ogni problema verificato)
---

# 🩻 Radiografia del design — report

**Totale problemi verificati: 87** — 🔴 2 bloccanti · 🟠 36 gravi · 🟡 49 minori

## 🔴 BLOCCANTE (2)

### [layout-responsive] Barra conferma ordine mobile sovrapposta alla MobileTabBar al checkout
- **Dove:** app/checkout/page.tsx:822 + components/MobileTabBar.tsx:43-51,153 (MobileTabBar non esclude /checkout) + app/layout.tsx:123
- **Corsia:** codice
- **Fix:** Nascondere la MobileTabBar su /checkout (aggiungere pathname.startsWith('/checkout') alla lista di early-return in MobileTabBar.tsx:43-51) OPPURE dare alla barra conferma un offset 'bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))]' e uno z-index superiore (z-banner/z-overlay). Coerente con StickyAddToCart che già si stacca dal fondo.

### [mobile-pwa] La bottom tab bar copre la CTA sticky di conferma ordine in checkout (mobile)
- **Dove:** components/MobileTabBar.tsx (righe 43-51 lista hide; riga 153 z-30) + app/checkout/page.tsx (righe 822-838 sticky bar z-sticky) + app/globals.css (riga 197 body padding; righe 117-119 token z-index)
- **Corsia:** codice
- **Fix:** Nascondere la MobileTabBar su /checkout (aggiungere pathname.startsWith('/checkout') alla guardia righe 43-51), idealmente anche su /cart per evitare doppia chrome; in alternativa portare la barra checkout sopra la tab bar (z-mobile-nav o superiore) e aggiungere padding-bottom alla pagina pari all'altezza della tab bar quando coesistono.

## 🟠 GRAVE (36)

### [layout-responsive] Card 'Acquista' del prodotto in posizione errata su tablet (md)
- **Dove:** app/product/[id]/page.tsx:360 (outer grid), :704 (div CTA, nessun guard md), :1000 (StickyAddToCart md:hidden)
- **Corsia:** codice
- **Fix:** Far occupare alla card CTA l'intera larghezza su md (es. 'md:col-span-2 lg:col-span-1') oppure passare a un layout a 2 colonne dedicato per md (galleria a sinistra, info+CTA impilati a destra). In alternativa abilitare StickyAddToCart anche su md.

### [layout-responsive] Offset sticky (top-32 = 128px) inferiore all'altezza reale dell'header sticky (~144px)
- **Dove:** components/Navbar.tsx:84 vs top-32 in app/cart:189, app/product/[id]:704, app/checkout:779, app/category/[slug]:316, app/search:283, app/profile/settings:290
- **Corsia:** codice
- **Fix:** Allineare l'offset all'altezza reale dell'header: usare un valore sticky maggiore (es. top-36/top-40) o, meglio, una CSS var unica '--header-height' applicata sia all'header sia agli offset sticky così restano sincronizzati. Verificare il valore effettivo a runtime.

### [coerenza-brand] Le OG image social usano palette esplicitamente RIFIUTATE dal design system (indigo/viola e rosa/arancio) + emoji
- **Dove:** app/product/[id]/opengraph-image.tsx (background riga ~53, 'My' riga ~95, prezzo riga ~107, emoji 🛍️ riga ~73 + 📦 riga ~114); app/store/[id]/opengraph-image.tsx (background riga ~48, 'My' riga ~55, emoji 🏪 riga ~71 + 📍)
- **Corsia:** codice
- **Fix:** Riallineare entrambe le OG image ai token: sfondo su gradient brand (primary-500 #D55F3F -> primary-700 #A03B25, come public/icon-192.svg), 'My' in mostarda accent (#E8A33D o #F4BC53 su sfondo scuro), rimuovere le emoji sostituendole con wordmark/iniziali o placeholder neutro coerente.

### [coerenza-brand] CTA mostarda (accent) con convenzioni di tonalita/hover divergenti tra schermate
- **Dove:** components/Navbar.tsx (righe 105, 223); components/StickyAddToCart.tsx (riga 100); components/ProductQA.tsx (riga 255); app/seller/layout.tsx (riga 90); app/admin/support/page.tsx (riga 196); HomeSectionRenderer.tsx (riga 357, hover invertito); components/home/DropOfDay.tsx (riga 147, hover invertito)
- **Corsia:** codice
- **Fix:** Sostituire tutte le CTA mustard ad-hoc con il componente Button variant='accent' (oppure normalizzare a 'bg-accent-400 hover:bg-accent-500'). Correggere la sellerCta e DropOfDay perche l'hover vada piu scuro, non piu chiaro.

### [coerenza-brand] Badge sconto '-X%' renderizzato in 3 colori diversi nelle varie superfici
- **Dove:** components/ProductCard.tsx (riga ~113, corretto, Badge variant='discount'); components/store-sections/PromotionsSection.tsx (riga 23); app/events/page.tsx (righe ~161-163)
- **Corsia:** codice
- **Fix:** Usare ovunque il Badge primitive variant='discount' (vino secondary-600) per i badge '-X%'. Eliminare il bg-rose-600 in PromotionsSection e il bg-accent-500 del badge sconto in events.

### [coerenza-brand] Blocco 'Promozioni attive' nei negozi costruito interamente su rosa fuori-palette
- **Dove:** components/store-sections/PromotionsSection.tsx (righe 12, 14, 21, 23)
- **Corsia:** codice
- **Fix:** Ricolorare il blocco con i token: contenitore su secondary-50/secondary-200 (o accent per 'promo'), icona su secondary-600, e usare il Badge primitive variant='discount' per la percentuale.

### [coerenza-brand] Stelle di rating con due sistemi di icone (Lucide vs glyph unicode ★/☆)
- **Dove:** app/product/[id]/page.tsx; components/store-sections/ReviewsSection.tsx (righe 119-120 unicode vs 22-24/194 Lucide); app/seller/dashboard/page.tsx; app/seller/analytics/page.tsx; app/seller/reviews/page.tsx; app/rider/reviews/page.tsx; app/orders/[id]/review/page.tsx
- **Corsia:** codice
- **Fix:** Sostituire tutte le stelle unicode con il componente Lucide Star/StarHalf (size/strokeWidth standard, fill-accent-500). Idealmente estrarre un componente RatingStars condiviso per evitare nuove divergenze.

### [coerenza-brand] Token --danger non allineato all'implementazione (commento 'rose-600' errato, red-600 nel token, rose-600 nel codice) e assenza di scala 'danger' nei token Tailwind
- **Dove:** design-system/tokens/colors.css (riga 112, commento errato); app/globals.css (riga 72); components/ui/Button.tsx (riga 29); + uso pervasivo di rose-* in components/ConfirmDialog.tsx, components/rider/SOSButton.tsx, app/checkout, app/orders/[id], ecc.
- **Corsia:** codice
- **Fix:** Definire una scala 'danger' in tailwind.config.ts (allineata al rose-600 #E11D48 effettivamente usato, oppure migrare tutto a red-600 #DC2626 e correggere --danger). Aggiornare il commento errato 'rose-600' -> 'red-600' in colors.css e far convergere Button.tsx + tutte le superfici sull'unico token danger.

### [tipografia] Plugin @tailwindcss/typography assente: le classi prose nelle pagine legali sono morte (paragrafi senza spaziatura)
- **Dove:** tailwind.config.ts (plugins) + components/ui/LegalLayout.tsx (riga 71, classe prose morta; impatto su /terms /privacy /cookies /accessibility). NON impattati: shipping (paragrafi gia' separati), DropOfDay/ShopOfMonthHero (max-w-prose), ImportFromUrlBox (nessun prose).
- **Corsia:** codice
- **Fix:** Installare @tailwindcss/typography e aggiungerlo: plugins: [require('tailwind-scrollbar-hide'), require('@tailwindcss/typography')]. In alternativa senza plugin: in LegalSection avvolgere i children con space-y-4 (o dare mb-4 ai <p>), cosi' i paragrafi della stessa sezione si distanziano. La pagina shipping non richiede interventi.

### [tipografia] Stelle di rating illeggibili: glifo testuale ★ in text-accent-500/400 su sfondo bianco = contrasto 2.0-2.2:1
- **Dove:** app/product/[id]/page.tsx (~797, 808, 858, 939), app/seller/reviews/page.tsx (25-28), components/store-sections/ReviewsSection.tsx (118), app/orders/[id]/review/page.tsx (27)
- **Corsia:** codice
- **Fix:** Usare accent-700 (#9D621C = 5.0:1 su bianco, passa AA testo grande) per il glifo pieno su sfondo chiaro, o sostituire i ★ testuali con icona lucide Star con fill + stroke scuro. Per le stelle vuote usare almeno ink-400.

### [tipografia] Wordmark del footer: parte accent in text-accent-500 su footer bg-cream-200 = 1.85:1
- **Dove:** components/Footer.tsx riga 99 (text-accent-500 su footer bg-cream-200 riga 94)
- **Corsia:** codice
- **Fix:** Nel footer usare per la parte accent un tono con contrasto adeguato su cream-200, es. text-primary-700 (5.72:1 verificato) o text-accent-700.

### [tipografia] Testo bianco su bg-accent-500 in 3 CTA (incoerenza col pattern ink-900) = 2.16:1
- **Dove:** components/rider/RiderConnectButton.tsx (121), components/rider/CashConfirmDialog.tsx (86, 140), app/seller/layout.tsx (90)
- **Corsia:** codice
- **Fix:** Sostituire text-white con text-ink-900 su questi bg-accent-500.

### [accessibilita-visiva] Focus visibile assente/invisibile su navbar e barra categorie (contrasto 1,34:1)
- **Dove:** app/globals.css (:focus-visible, righe 154-157); components/Navbar.tsx; components/CategoryBar.tsx; components/LocationPill.tsx (bottone pill)
- **Corsia:** codice
- **Fix:** Aggiungere su navbar/CategoryBar un focus-visible chiaro su sfondo scuro: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700`. In alternativa applicare globalmente il token --focus-ring gia' presente (doppio anello bianco+primary-400) invece dell'outline tinta unita.

### [accessibilita-visiva] Tab attiva CategoryBar: testo accent-300 su terracotta sotto soglia AA (3,87:1)
- **Dove:** components/CategoryBar.tsx (riga 90 text-sm; riga 99 trigger attivo; riga 118 link attivo)
- **Corsia:** codice
- **Fix:** Per il testo attivo usare un giallo piu' chiaro/contrastato: `text-accent-200` (#FBD891, verificato 4,87:1, passa AA) oppure mantenere l'underline accent-400 sul bordo ma testo `text-white` font-semibold (verificato 6,67:1). Lasciare l'accent solo sul border-b, non sul testo.

### [accessibilita-visiva] Pulsanti CTA con testo bianco su accent-500 (contrasto 2,16:1)
- **Dove:** components/rider/RiderConnectButton.tsx:121; components/rider/CashConfirmDialog.tsx:86 e :140; app/seller/layout.tsx:90
- **Corsia:** codice
- **Fix:** Sostituire `text-white` con `text-ink-900` su questi bg-accent-500 (come ui/Button variante accent), oppure passare a `bg-accent-600`+text-white (verificato 3,25:1, basta solo per large text → preferire ink-900). Meglio: usare la primitiva Button variant='accent'.

### [accessibilita-visiva] Wordmark nel footer: testo accent-500 su crema con contrasto 1,85:1
- **Dove:** components/Footer.tsx:99 (span text-accent-500) su bg-cream-200 (riga 94)
- **Corsia:** codice
- **Fix:** Per la sillaba accent del wordmark usare un colore con contrasto sufficiente sul crema: `text-accent-700` (#9D621C, verificato 4,29:1, passa sia large che normal) o `text-primary-700`. Controllare altri usi del wordmark su sfondo chiaro.

### [stati-ui] ProductGrid: nessuno stato di errore — i fallimenti di rete vengono mostrati come "Nessun prodotto trovato"
- **Dove:** components/ProductGrid.tsx (useQuery riga 72; ramo empty righe 293-332)
- **Corsia:** codice
- **Fix:** Estrarre `isError, refetch` dalla useQuery e aggiungere un ramo `if (isError) return <...stato errore con bottone Riprova=refetch...>` PRIMA del check `filtered.length === 0`. NB: nel repo NON esiste un componente `ErrorState` né `app/not-found.tsx` (contrariamente a quanto suggeriva la segnalazione originale): va creato un blocco errore riusando lo stile di EmptyState esistente, oppure introdurre un nuovo componente condiviso.

### [stati-ui] Pagina ordini: errore di caricamento mostrato come "Non hai ancora ordini"
- **Dove:** app/orders/page.tsx (riga 103; ramo empty righe 139-154)
- **Corsia:** codice
- **Fix:** Aggiungere `isError, refetch` alla useQuery e un ramo errore (Riprova=refetch) prima del check `orders.length === 0`. Distinguere il caso "non autenticato" (redirect a sign-in) dall'errore generico. Nessun `ErrorState` esistente: riusare lo stile di EmptyState/LoadingState già importati.

### [stati-ui] Pagina preferiti: errore di caricamento mostrato come "Nessun preferito ancora" + errore DB ignorato nel queryFn
- **Dove:** app/favorites/page.tsx (useQuery riga 13; queryFn righe 18-28; ramo empty righe 49-63)
- **Corsia:** codice
- **Fix:** Nel queryFn destrutturare `{ data, error }` e `if (error) throw error`. Nel componente estrarre `isError, refetch` e aggiungere un ramo errore (Riprova=refetch) prima del check vuoto. Nessun `ErrorState` preesistente da riusare.

### [stati-ui] Pagina negozi: nessuno stato di errore (e il queryFn non controlla l'errore Supabase)
- **Dove:** app/stores/page.tsx (useQuery riga 85; fetchStoresData righe 24-30; render righe 132-217)
- **Corsia:** codice
- **Fix:** Controllare l'errore in fetchStoresData (`const { data, error } = ...; if (error) throw error`) ed estrarre `isError, refetch` nel componente con un ramo errore dedicato (Riprova=refetch) prima del render principale. Nessun `ErrorState` esistente da riusare.

### [stati-ui] StoreShowcase (home): nessuno skeleton di caricamento e nessuno stato di errore
- **Dove:** components/StoreShowcase.tsx (useQuery riga 48; fetchShowcase righe 11-21; empty riga 58-60)
- **Corsia:** codice
- **Fix:** Aggiungere `isLoading` e renderizzare uno skeleton (riusare SkeletonGrid/SkeletonCard) durante il caricamento per evitare CLS; controllare l'errore in fetchShowcase (`if (error) throw`) ed esporre uno stato d'errore distinto dal vuoto reale.

### [stati-ui] Scheda prodotto: stato errore/not-found ridotto a testo grezzo "Prodotto non trovato."
- **Dove:** app/product/[id]/page.tsx (riga 206; queryFn riga 79-88)
- **Corsia:** codice
- **Fix:** Estrarre `isError, refetch` dalla query. Su errore mostrare un blocco errore con bottone Riprova; su prodotto realmente assente usare un blocco coerente col design (icona Package + CTA "Torna al marketplace"), come già fatto per il negozio non approvato. NB: la segnalazione originale cita `ErrorState`/`app/not-found.tsx` come riferimenti esistenti: in realtà NON esistono nel repo — usare lo stile del blocco "Prodotto non disponibile" già presente nello stesso file.

### [immagini-media] OG image social con gradiente OFF-BRAND e incoerenti tra prodotto e negozio
- **Dove:** app/product/[id]/opengraph-image.tsx (righe 49, 86, 99) e app/store/[id]/opengraph-image.tsx (righe 44, 51)
- **Corsia:** codice
- **Fix:** Allineare entrambe le opengraph-image alla palette del brand: gradiente terracotta (es. #D55F3F→#A03B25 come icon-192.svg, oppure primary-700/secondary-900 di tailwind.config.ts) e accento on-brand identico tra le due route. Sostituire #fbbf24 e #fef9c3 con l'accent mustard del design system.

### [immagini-media] Apple touch icon in SVG: iOS ignora l'icona su 'Aggiungi a Home'; manifest senza PNG né maskable
- **Dove:** app/layout.tsx (righe 44-47), public/manifest.json (righe 10-23), public/ (solo icon-192.svg, icon-512.svg)
- **Corsia:** codice
- **Fix:** Generare PNG raster 180x180 (apple-touch-icon), 192x192 e 512x512 più una variante 'maskable' con safe-zone; aggiungerle in public/ e referenziarle in layout.tsx (icons.apple = PNG 180) e in manifest.json (entry PNG + purpose 'maskable'). Mantenere l'SVG come icona moderna aggiuntiva. Derivare i PNG dall'icona terracotta esistente per restare on-brand.

### [immagini-media] Nessuna OG image per home e pagine statiche → anteprima social 'nuda' + twitter card 'summary'
- **Dove:** app/layout.tsx (metadata, righe 49-61); assente app/opengraph-image.*
- **Corsia:** codice
- **Fix:** Aggiungere un app/opengraph-image.tsx (o file statico 1200x630 on-brand) di root come default per tutte le pagine prive di OG dedicata; impostare twitter.card = 'summary_large_image' e referenziare la stessa immagine in twitter.images / openGraph.images.

### [immagini-media] Catalogo quasi interamente popolato da foto stock Pexels (non foto reali dei negozi)
- **Dove:** Dati Supabase: products.images (240/258 prima img Pexels), profiles.store_logo (15/17 Pexels), profiles.store_media (solo 2/17)
- **Corsia:** config
- **Fix:** Attività di contenuto/seeding (nessun deploy): sostituire le immagini demo Pexels con foto reali. Priorità a logo negozi (store_logo), cover/galleria (store_media) e prime immagini prodotto above-the-fold. Il pipeline sizedImage va bene così com'è.

### [mobile-pwa] Icone PWA solo in formato SVG: home-screen iOS vuota e niente icona maskable Android
- **Dove:** public/manifest.json (righe 10-23 icons), app/layout.tsx (righe 44-47 icons.icon/apple), public/icon-192.svg, public/icon-512.svg
- **Corsia:** codice
- **Fix:** Generare icone PNG 192x192 e 512x512 + apple-touch-icon 180x180 PNG, aggiungere una variante 'purpose: maskable' con padding ~20%. Aggiornare manifest.json con le voci PNG e in app/layout.tsx puntare icons.apple a un PNG 180x180. Mantenere lo SVG eventualmente solo come favicon.

### [mobile-pwa] Pulsante di chiusura (X) dell'onboarding ancorato allo schermo, non alla card
- **Dove:** components/BuyerOnboardingTour.tsx (riga 75 overlay fixed inset-0 z-50; riga 76 card senza 'relative'; righe 77-81 X 'absolute top-3 right-3')
- **Corsia:** codice
- **Fix:** Aggiungere 'relative' alla card (riga 76) cosi' la X si ancora all'angolo del pannello; in alternativa riusare il primitive Modal (components/ui/Modal.tsx) che gestisce gia' header con X, focus-trap ed Esc.

### [flussi-conversione] Carrello irraggiungibile dalla navbar desktop per gli ospiti (non loggati)
- **Dove:** components/Navbar.tsx (righe 111-126: blocco desktop dentro `isAuthenticated`, CartButton sotto `role === 'buyer'`); MobileTabBar.tsx md:hidden (riga 153); Footer.tsx (nessun link /cart)
- **Corsia:** codice
- **Fix:** Mostrare CartButton nella navbar desktop anche agli ospiti: spostarlo fuori dal ramo `isAuthenticated`/`role === 'buyer'`, come gia' fa la MobileTabBar. Il badge usa useCartCount() (gia' importato in Navbar) che funziona indipendentemente dal ruolo.

### [flussi-conversione] Soglia 'spedizione gratis' calcolata sul totale globale nel carrello ma per-negozio al checkout: il costo puo' cambiare tra le due pagine
- **Dove:** app/cart/page.tsx (righe 41-45, 116, 204-210) vs app/checkout/page.tsx (righe 334-343, 358-360); FREE_SHIPPING_THRESHOLD=30 in lib/constants.ts
- **Corsia:** codice
- **Fix:** Allineare il modello: nel carrello calcolare la spedizione con la stessa logica per-negozio del checkout (sommare shippingFor per gruppo), oppure rendere la soglia globale anche al checkout. In ogni caso 'Gratis' non va mostrato se non e' garantito per ogni negozio; finche' non allineato, applicare l'etichetta 'stima' anche al caso gratis multi-negozio.

### [flussi-conversione] L'upsell del carrello aggiunge prodotti con varianti senza opzioni, generando un articolo bloccato al checkout
- **Dove:** components/cart/CartUpsell.tsx (righe 50-79); effetto a valle in app/checkout/page.tsx (righe 165-167, 760-768, 812, 830)
- **Corsia:** codice
- **Fix:** Nell'upsell aggiungere has_variants alla select e filtrare i prodotti con has_variants=true (escluderli dai suggerimenti), oppure per quei prodotti far navigare il '+' alla scheda prodotto invece di addToCart diretto.

### [flussi-conversione] Promessa di consegna nell'hero ('30-60 min') in contrasto col resto del sito ('24-48h')
- **Dove:** DB: site_settings.home_site → sections[hero].config.subhead. Reso da components/home-sections/HomeSectionRenderer.tsx (riga 85, 102). Default coerente '24-48h' in app/page.tsx
- **Corsia:** config
- **Fix:** Da Home builder (/admin/home) correggere il subhead dell'hero a '24-48h' (o '30-60 min solo con Express disponibile'). Risolvibile senza deploy modificando il campo nel DB/builder.

### [flussi-conversione] Fascia di consegna sempre 'Al completo' e disabilitata: scarsita' finta hardcoded
- **Dove:** components/checkout/DeliverySlotPicker.tsx (righe 39-56 SLOT_CAP/CAP_META; righe 117-138 stato 'full' disabilitato; righe 212-215 SLOT_DEFAULTS)
- **Corsia:** codice
- **Fix:** Rimuovere i badge di capacita' finti o alimentarli con disponibilita' rider/slot reale lato server. Non disabilitare staticamente uno slot. Filtrare le fasce gia' trascorse rispetto all'ora corrente e scegliere come default la prima fascia futura realmente disponibile.

### [microcopy] Promessa "paghi alla consegna / niente carta" contraddice il checkout (carta come prima opzione)
- **Dove:** app/page.tsx (HERO_VARIANTS a/b, righe 28,39,44), app/sign-up/page.tsx:108, components/BuyerOnboardingTour.tsx:40, components/ui/AuthShell.tsx:39, app/come-funziona/page.tsx:24, app/product/[id]/page.tsx:595, components/home-sections/HomeSectionRenderer.tsx:55, app/cart/page.tsx:236, vs components/checkout/PaymentMethodSelector.tsx
- **Corsia:** codice
- **Fix:** Allineare il messaggio: usare "puoi pagare alla consegna" / "contanti alla consegna disponibile" invece di "paghi sempre/solo alla consegna" e "niente carta". Rimuovere/riformulare "Niente carta" nell'hero B e negli altri punti ("Carta o contanti, decidi tu"). Coerenza tra hero, sign-up, onboarding, AuthShell, come-funziona, scheda prodotto, cart e checkout.

### [microcopy] Newsletter etichettata "Iscriviti · €5" ma l'iscrizione è gratuita (nessun pagamento)
- **Dove:** messages/it.json:160 e messages/en.json:160 (chiave newsletter.subscribe), reso in components/NewsletterForm.tsx:88 (usato sia in home che in Footer.tsx:199)
- **Corsia:** codice
- **Fix:** Rimuovere "· €5" dalla label: "Iscriviti" / "Subscribe". Se l'intento è l'incentivo, esplicitarlo come value proposition ("Iscriviti e ottieni €5 di sconto") invece di un prezzo accanto a un'azione gratuita.

### [microcopy] Tempo di consegna nella home live (30-60 min) contraddice il 24-48h di tutto il resto
- **Dove:** site_settings.home_site → sezione hero, config.subhead (Supabase, id=1); contraddice app/checkout/page.tsx:663,638, app/cart/page.tsx:141, app/shipping/page.tsx:34, app/faq/page.tsx:39, app/layout.tsx:42 e il claim 24-48h nella stessa hero (HomeSectionRenderer.tsx:153)
- **Corsia:** config
- **Fix:** Da /admin/home correggere la subhead hero in "...arriva a casa in 24-48h e puoi pagare alla consegna" (o citare l'express come extra "fino a 30-60 min dove disponibile"). Nessun deploy.

## 🟡 MINORE (49)

### [layout-responsive] Banner cookie ancorato a bottom-0 copre la MobileTabBar su mobile
- **Dove:** components/CookieBanner.tsx:63 + app/layout.tsx:132
- **Corsia:** codice
- **Fix:** Aggiungere un offset inferiore su mobile pari all'altezza della tab bar (es. 'pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))]' o 'bottom-[var(--tabbar-height)] md:bottom-0') così il pannello resta sopra la MobileTabBar senza coprirla.

### [layout-responsive] StickyAddToCart usa offset magico 56px non allineato al token tabbar (72px)
- **Dove:** components/StickyAddToCart.tsx:55 vs app/globals.css:115,196-198 + MobileTabBar.tsx:153
- **Corsia:** codice
- **Fix:** Sostituire 56px con il token: bottom 'calc(env(safe-area-inset-bottom) + var(--tabbar-height))' (72px), così la barra resta sempre sopra la tab bar indipendentemente da future modifiche.

### [layout-responsive] Sezioni home placeholder vuote abilitate + doppio blocco popularProducts
- **Dove:** site_settings.home_site (Supabase project clmpyfvpvfjgeviworth, id=1) — sezioni video/banner/gallery placeholder + due 'popularProducts'; renderer HomeSectionRenderer.tsx:399,430,447
- **Corsia:** config
- **Fix:** Da /admin/home disabilitare o rimuovere le tre sezioni placeholder vuote (o popolarle correggendo il refuso 'gallerai'→'galleria') e tenere un solo blocco 'popularProducts' per evitare la doppia griglia. Nessun deploy necessario.

### [layout-responsive] FAB 'Tu' del venditore (bottom-44) fluttua orfano sul marketplace pubblico
- **Dove:** components/MobileTabBar.tsx:197-210
- **Corsia:** codice
- **Fix:** Valutare di non mostrare il FAB 'Tu' sulle pagine pubbliche (la tab account è comunque raggiungibile via sheet) o riposizionarlo ancorato appena sopra la tab bar con un offset basato sul token tabbar, evitando il valore arbitrario bottom-44.

### [layout-responsive] Riga prezzo+CTA della ProductCard a rischio compressione nelle rail w-40
- **Dove:** components/ProductCard.tsx:141,169-187 in contesto rail (components/ProductGrid.tsx:356, w-40 sm:w-44)
- **Corsia:** codice
- **Fix:** Su prezzi lunghi prevedere truncate/min-w-0 sul blocco prezzo, ridurre il bottone a h-9/w-9 nelle rail, o aumentare la larghezza minima della card rail (es. w-44 anche su mobile) per dare respiro alla riga prezzo+CTA.

### [coerenza-brand] Stelle rating con tonalita accent incoerente (accent-400 vs accent-500)
- **Dove:** app/product/[id]/page.tsx (righe 552/797/808/858/939); components/store-sections/ReviewsSection.tsx (riga 194); + altri file con text-accent-400
- **Corsia:** codice
- **Fix:** Standardizzare le stelle su un'unica tonalita (es. accent-500 piena per piene, ink-300/cream-200 per vuote) tramite il componente RatingStars condiviso.

### [coerenza-brand] Grigi freddi (gray-*) mischiati con la scala calda ink-*
- **Dove:** app/profile/referral/page.tsx (riga 116); components/CategoriesDropdown.tsx (riga 64); components/NewsletterForm.tsx (riga 76)
- **Corsia:** codice
- **Fix:** Sostituire gray-700 con ink-700/ink-800 per restare nella scala calda del DS.

### [coerenza-brand] Stati 'warning' in amber-* invece del token --warning (accent/mostarda)
- **Dove:** app/checkout/page.tsx (righe 754, 761); pattern amber-* presente anche in pagine admin/seller
- **Corsia:** config
- **Fix:** Allineare i warning al token: usare accent-50/accent-200/accent-800 (o classi semantiche warning) al posto di amber-*.

### [coerenza-brand] Home (site_settings): sezioni placeholder abilitate + refuso 'gallerai'
- **Dove:** site_settings.home_site (sezioni type=video, type=banner, type=gallery, tutte enabled=true); render in components/home-sections/HomeSectionRenderer.tsx (righe 399, 430, 447)
- **Corsia:** config
- **Fix:** Da pannello/config: disabilitare o eliminare le sezioni placeholder finche non hanno contenuto reale, e correggere il refuso 'gallerai' -> 'Galleria'. Nessun deploy necessario (edit su site_settings).

### [coerenza-brand] Raggi di bordo fuori scala token (rounded-3xl)
- **Dove:** app/profile/loyalty/page.tsx; app/seller/dashboard/page.tsx; app/shop-of-month/page.tsx; app/u/[handle]/page.tsx; components/home/ShopOfMonthHero.tsx
- **Corsia:** codice
- **Fix:** Sostituire rounded-3xl con rounded-2xl (token) oppure aggiungere esplicitamente '3xl' alla scala borderRadius in tailwind.config.ts se voluto come token ufficiale.

### [coerenza-brand] Wordmark 'My' in tonalita mostarda diversa tra Navbar e Footer; app-icon 'My' in bianco anziche mostarda
- **Dove:** components/Navbar.tsx (righe 94, 166); components/Footer.tsx (riga 99); public/icon-192.svg
- **Corsia:** codice
- **Fix:** Verificare se la doppia tonalita mostarda e voluta; in caso, documentarla come regola contrasto-su-sfondo. Valutare se l'app icon debba avere 'My' in mostarda per piena coerenza col wordmark.

### [tipografia] text-ink-400 (#78716C) come testo secondario/empty-state su sfondo pagina cream-100 = 4.49:1 (appena sotto AA)
- **Dove:** diffuso: app/admin/audit/page.tsx (104), components/NewsletterForm.tsx (63), app/cart/page.tsx (205), e numerosi altri usi text-ink-400
- **Corsia:** codice
- **Fix:** Adottare ink-500 (7.63:1) come default per il testo secondario su sfondi chiari; riservare ink-400 a microcopy decorativa su bianco puro.

### [tipografia] Colore success olive-600 come testo 'Gratis' su sfondo pagina cream-100 = 4.47:1 (borderline sotto AA)
- **Dove:** app/cart/page.tsx (208, text-olive-600 'Gratis'). NON problematici: StoreListRow.tsx (89, olive-700), Badge free variant (olive-700)
- **Corsia:** codice
- **Fix:** Per il TESTO success su superfici cream usare olive-700 (#456236 = 6.88:1 verificato). Mantenere olive-600 per i riempimenti pieni.

### [tipografia] Eyebrow/label accent-300 su primary-700 e link hover accent-300 = 3.87:1 (sotto AA per testo piccolo)
- **Dove:** app/about/page.tsx (91 eyebrow), components/Navbar.tsx (104, 180 hover:text-accent-300)
- **Corsia:** codice
- **Fix:** Usare accent-200 (#FBD891 = 4.87:1 su primary-700 verificato) o bianco per eyebrow/label e stati hover su primary-700.

### [tipografia] Banner home: con overlay='none' testo bianco senza velo, con overlay='light' testo scuro su velo bianco 30% = contrasto imprevedibile
- **Dove:** components/home-sections/HomeSectionRenderer.tsx (case 'banner', ~400-413)
- **Corsia:** codice
- **Fix:** Imporre nel codice un velo minimo anche con overlay='none' (gradiente dal basso) e/o forzare il colore testo coerente con l'overlay.

### [tipografia] Etichette MobileTabBar a 10px con tracking-tight: dimensione al limite minimo
- **Dove:** components/MobileTabBar.tsx (140)
- **Corsia:** codice
- **Fix:** Portare le label a text-[11px] e rimuovere tracking-tight (tracking normale).

### [tipografia] Incoerenza promessa di consegna: hero config 'in 30-60 min' vs trust list/footer '24-48h'
- **Dove:** Config live: site_settings.home_site -> sezione id 'hero' -> config.subhead ('30-60 min'). Confronto: HomeSectionRenderer.tsx (~153 '24-48h'), Footer.tsx (~212 '24-48h')
- **Corsia:** config
- **Fix:** Allineare in /admin/home il subhead hero alla promessa standard (es. 'in giornata se disponibile, altrimenti in 24-48h') o uniformare un'unica formulazione anche nei testi hardcoded.

### [tipografia] Sezioni placeholder/test enabled nella home con refuso 'gallerai'
- **Dove:** Config live: site_settings.home_site -> sezioni id '3de9d502...' (gallery 'gallerai'), '16278dfe...' (banner placeholder), '39fc7cf6...' (video 'video promo')
- **Corsia:** config
- **Fix:** In /admin/home rimuovere/disabilitare le sezioni di test o correggere i testi ('gallerai' -> 'Galleria', copy reale al posto di 'banner'/'video promo'/'testo link').

### [accessibilita-visiva] OrderStatusBadge icon-only: aria-label su <svg> senza role=img
- **Dove:** components/ui/OrderStatusBadge.tsx:41-50 (ramo variant === 'icon-only')
- **Corsia:** codice
- **Fix:** Aggiungere `role="img"` all'icona quando icon-only, oppure avvolgerla in uno `<span role="img" aria-label={label}>` con l'icona `aria-hidden`.

### [accessibilita-visiva] Target tappabili sotto i 44px su controlli icona/stepper
- **Dove:** components/SearchBar.tsx:169-178 (clear X); components/StickyAddToCart.tsx:75-93 (stepper w-9 h-9); components/ui/Modal.tsx:128-135 (close p-1.5); components/ui/Field.tsx:139-148 (toggle password p-1.5)
- **Corsia:** codice
- **Fix:** Portare gli hit-target ad almeno 40-44px (clear `p-2`/min-w-[40px] min-h-[40px]; stepper `w-11 h-11`; close modal `p-2`). L'icona puo' restare piccola: e' l'area cliccabile che deve crescere.

### [accessibilita-visiva] Input CAP nel LocationPill privo di label/aria-label
- **Dove:** components/LocationPill.tsx:101-110 (input CAP del popover)
- **Corsia:** codice
- **Fix:** Aggiungere `aria-label="Codice di avviamento postale (CAP)"` all'input, oppure una `<label>` (anche sr-only) collegata via id.

### [accessibilita-visiva] Sezioni home in site_settings con contenuti placeholder/vuoti pubblicati
- **Dove:** site_settings.home_site (sezioni banner 16278dfe…, video 39fc7cf6…, gallery 3de9d502…); render verificato in components/home-sections/HomeSectionRenderer.tsx:397-467
- **Corsia:** config
- **Fix:** Da pannello admin Home: disabilitare/eliminare le sezioni banner/video/gallery di test finche' non hanno contenuto reale; correggere il refuso 'gallerai' e i testi placeholder ('banner','testo link','video promo','banner pubblicitario'); impostare un href valido sulla CTA del banner prima di riabilitarlo.

### [stati-ui] Pagina carrello: flash dello stato vuoto al primo render (FOUC)
- **Dove:** app/cart/page.tsx (righe 22-61)
- **Corsia:** codice
- **Fix:** Aggiungere uno stato `hydrated` (false finché l'useEffect non ha letto getCart) e mostrare skeleton/null finché non idratato, poi decidere tra empty e lista. In alternativa lazy initializer guardato da `typeof window`.

### [stati-ui] CouponInput: il pulsante "Applica" non ha stato di loading/disabled durante la validazione
- **Dove:** components/checkout/CouponInput.tsx (riga 55); handler app/checkout/page.tsx (righe 345-356)
- **Corsia:** codice
- **Fix:** Tracciare lo stato pending dell'applicazione coupon (useState o useMutation per validateCoupon) e passarlo a CouponInput come prop `applying`; impostare `loading`/`disabled` sul Button "Applica" finché la validazione è in corso.

### [stati-ui] useFavorites: toggle senza aggiornamento ottimistico né rollback su errore
- **Dove:** components/hooks/useFavorites.ts (mutation righe 24-36)
- **Corsia:** codice
- **Fix:** Implementare optimistic update con `onMutate` (aggiorna subito il Set in cache), `onError` (rollback dello snapshot + toast errore) e `onSettled` (invalidate).

### [stati-ui] AddToListButton: i toggle delle liste non hanno stato pending/disabled (azione senza feedback, doppio click possibile)
- **Dove:** components/AddToListButton.tsx (righe 138-147; query lists righe 27-40)
- **Corsia:** codice
- **Fix:** Disabilitare il bottone della riga in mutazione e mostrare un mini-spinner sull'item interessato (tracciare l'id nel toggle). Gestire l'errore della query `lists` con un messaggio dedicato anziché lo stato "nessuna lista".

### [stati-ui] Carrello: lo stepper "−" rimuove l'articolo a quantità 1 senza stato disabled né conferma
- **Dove:** app/cart/page.tsx (righe 146-158); lib/cart.ts (riga 81)
- **Corsia:** codice
- **Fix:** Disabilitare il pulsante "−" quando `item.quantity <= 1` (stile disabled coerente) e gestire la rimozione tramite il pulsante "Rimuovi" esplicito, oppure mostrare conferma/undo (toast con "Annulla") quando lo stepper svuota una riga.

### [stati-ui] Home: sezioni video/banner/gallery abilitate ma con contenuto placeholder → non producono output visibile
- **Dove:** site_settings.home_site (id=1) sezioni 39fc7cf6 video, 16278dfe banner, 3de9d502 gallery; render in components/home-sections/HomeSectionRenderer.tsx (righe 397-467)
- **Corsia:** config
- **Fix:** Dall'editor Home (admin): disabilitarle finché non hanno contenuto, oppure compilare videoId/imageUrl+cta/items reali. Correggere il refuso "gallerai" e sostituire i testi placeholder ("banner", "testo link", "video promo", "banner pubblicitario").

### [immagini-media] Sezioni home 'abilitate' ma vuote (video/banner/gallery) + heading con refuso 'gallerai'
- **Dove:** site_settings.home_site.sections (video 39fc7cf6, banner 16278dfe, gallery 3de9d502)
- **Corsia:** config
- **Fix:** Da admin (config home), nessun deploy: disabilitare/rimuovere le tre sezioni vuote finché non hanno contenuto, oppure popolarle (videoId YouTube, imageUrl banner on-brand, item gallery). Correggere il heading 'gallerai' → 'galleria'.

### [immagini-media] branding vuoto in site_settings: nessun logo/colori centralizzati, identità solo da default hardcoded
- **Dove:** site_settings.branding ({} vuoto); components/Navbar.tsx (righe 93-95, 165-167)
- **Corsia:** config
- **Fix:** Se si vuole un logo immagine o colori brand gestibili senza deploy, popolare site_settings.branding (wordmark/colori) da admin; altrimenti documentare che il brand è solo wordmark e va bene così.

### [immagini-media] CategoryShowcase: crop quadrato forzato su tessere 4:3 (doppio ritaglio)
- **Dove:** components/CategoryShowcase.tsx (righe 105, 113); lib/image-url.ts (square per 'card' riga 67; height forzata righe 27-30 e 48)
- **Corsia:** codice
- **Fix:** Per le tessere 4:3 usare una size che NON forzi il quadrato: aggiungere una variante (es. 'wide' con width 600 e nessuna height) in lib/image-url.ts, oppure usare sizedImage(..., 'detail'), così il CDN restituisce il rapporto giusto e object-cover ritaglia una sola volta.

### [immagini-media] Host immagine whitelisted ma inutilizzato (api.dicebear.com) — config morta
- **Dove:** next.config.js (riga 48 dicebear, riga 49 iconify); middleware.ts (riga 70); seeds/002_logos_and_images.sql (righe 67-71, usa iconify)
- **Corsia:** codice
- **Fix:** Rimuovere SOLO api.dicebear.com da next.config.js (riga 48) e dalla CSP img-src del middleware (riga 70), eliminando anche il relativo unit test. NON rimuovere api.iconify.design senza prima verificare che i seed/dati non lo usino più (è referenziato in seeds/002_logos_and_images.sql).

### [mobile-pwa] Stepper quantità del carrello sotto il touch target minimo (32px)
- **Dove:** app/cart/page.tsx (righe 146-158 stepper '-'/'+' w-8 h-8) e components/StickyAddToCart.tsx (righe 75-93 stepper w-9 h-9)
- **Corsia:** codice
- **Fix:** Portare i tap target a min 44px: usare 'h-11 w-11' (o aumentare il padding mantenendo l'icona ~16px) per i pulsanti +/- nel carrello e nella sticky bar, coerentemente col Button primitive (min-h 44px su size md).

### [mobile-pwa] StickyAddToCart con offset bottom hard-coded (56px) incoerente con l'altezza tab bar (token 72px)
- **Dove:** components/StickyAddToCart.tsx (righe 53-55 bottom: calc(... + 56px)) vs token '--tabbar-height: 72px' in app/globals.css (riga 115)
- **Corsia:** codice
- **Fix:** Sostituire il 56px con il token: bottom: calc(env(safe-area-inset-bottom,0px) + var(--tabbar-height)) (eventualmente + piccolo gap), cosi' l'offset segue una sola fonte di verita'.

### [mobile-pwa] Ticker promo (marquee) non mettibile in pausa su touch
- **Dove:** components/PromoTicker.tsx (righe 71-78 animate-marquee) + app/globals.css (righe 242-247 pausa solo :hover)
- **Corsia:** codice
- **Fix:** Aggiungere la pausa anche su interazione touch/focus (animation-play-state in pausa su :active/:focus-within o tap-to-pause via JS), oppure ridurre la velocita' e/o disattivare lo scroll sotto una certa larghezza mostrando gli annunci statici/ciclati.

### [mobile-pwa] Pulsante preferiti della ProductCard sotto i 44px
- **Dove:** components/ProductCard.tsx (righe 126-137 bottone preferiti h-9 w-9; riga 183 bottone '+' h-11 w-11)
- **Corsia:** codice
- **Fix:** Portare il bottone preferiti ad almeno 44px (h-11 w-11) mantenendo l'icona a 16-18px, allineandolo al bottone '+'.

### [mobile-pwa] Bottom sheet (Modal/Onboarding) senza safe-area inferiore
- **Dove:** components/ui/Modal.tsx (righe 118-145 sheet/footer senza pb-safe) e components/BuyerOnboardingTour.tsx (riga 103 footer azioni)
- **Corsia:** codice
- **Fix:** Aggiungere 'pb-safe' (o padding-bottom env(safe-area-inset-bottom)) al contenitore/footer del Modal e dell'onboarding, coerentemente con MobileAccountSheet/ContactSheet/ConfirmDialog.

### [flussi-conversione] Due sezioni 'Prodotti popolari' attive in home: contenuto duplicato
- **Dove:** DB: site_settings.home_site → due voci type='popularProducts' enabled; reso da components/home-sections/HomeSectionRenderer.tsx (righe 200-223)
- **Corsia:** config
- **Fix:** Da Home builder disabilitare o rimuovere una delle due, oppure differenziarle realmente. Risolvibile senza deploy.

### [flussi-conversione] Sezioni home di test/placeholder lasciate abilitate (video vuoto, banner segnaposto, gallery 'gallerai')
- **Dove:** DB: site_settings.home_site → sections id '39fc7cf6...' (video), '16278dfe...' (banner), '3de9d502...' (gallery); guardie di rendering in components/home-sections/HomeSectionRenderer.tsx (righe 397-467)
- **Corsia:** config
- **Fix:** Da Home builder rimuovere o disabilitare video/banner/gallery placeholder finche' non hanno contenuti reali; correggere 'gallerai' → 'galleria'. Risolvibile senza deploy.

### [flussi-conversione] Scheda prodotto: '{N} recensioni' sembra un link cliccabile ma non fa nulla
- **Dove:** app/product/[id]/page.tsx (righe 549-563)
- **Corsia:** codice
- **Fix:** Trasformarlo in un anchor/bottone che fa scroll alla sezione Recensioni, oppure rimuovere underline+cursor-pointer se non deve essere cliccabile.

### [flussi-conversione] Scheda prodotto desktop: prezzo mostrato due volte in colonne adiacenti
- **Dove:** app/product/[id]/page.tsx (righe 565-578 blocco prezzo principale; righe 705-706 prezzo nella sticky CTA)
- **Corsia:** codice
- **Fix:** Nella sticky non ripetere il prezzo grande (o mostrarlo solo quando il blocco principale e' uscito dal viewport), oppure unificare la presentazione includendo barrato/risparmio. Una sola fonte di verita' visiva del prezzo above-the-fold.

### [flussi-conversione] StepIndicator a 3 step ('Carrello/Indirizzo/Conferma') non riflette i 3 sotto-step reali del checkout
- **Dove:** components/checkout/StepIndicator.tsx (CHECKOUT_STEPS, righe 39-43) + app/checkout/page.tsx (riga 606 currentStep=2; StepCard n=1/2/3 righe 622, 634, 674)
- **Corsia:** codice
- **Fix:** Allineare la narrazione: la barra rispecchia i tre sotto-step reali (Indirizzo/Consegna/Pagamento), oppure rinumerare le StepCard per non ripartire da 1 dentro lo step 2. Evitare due sistemi di numerazione contemporanei.

### [flussi-conversione] Bottone 'Applica' coupon senza stato di caricamento
- **Dove:** components/checkout/CouponInput.tsx (righe 47-55); handler in app/checkout/page.tsx (righe 345-356); Button con prop loading in components/ui/Button.tsx
- **Corsia:** codice
- **Fix:** Passare uno stato isApplying al CouponInput (es. tramite useMutation o un flag) e inoltrarlo come `loading`/`disabled` al Button 'Applica' durante validateCoupon.

### [microcopy] Refuso "e'" al posto di "è" nell'errore di checkout
- **Dove:** app/checkout/error.tsx:23
- **Corsia:** codice
- **Fix:** Sostituire "e'" con "è": "Il tuo carrello è salvato...".

### [microcopy] Stesso percorso rider con etichette diverse: "Turni" vs "Disponibilità e zone" (e "Online" in dead-code)
- **Dove:** components/rider/RiderShell.tsx:26 ("Turni", live), app/rider/profile/page.tsx:25 ("Disponibilità e zone", live); messages/it.json:61 + components/MobileTabBar.tsx:75 ("Online", dead-code non renderizzato)
- **Corsia:** codice
- **Fix:** Scegliere un termine unico (consigliato "Turni" o "Disponibilità") e usarlo in RiderShell.tsx:26 e app/rider/profile/page.tsx:25. Opzionale: allineare/rimuovere la voce dead-code del ramo rider in MobileTabBar (nav.availability).

### [microcopy] Etichetta admin "Sorveglianza" dal tono ostile per un feed attività
- **Dove:** messages/it.json:63, messages/en.json:63, uso in components/MobileTabBar.tsx:61
- **Corsia:** codice
- **Fix:** Rinominare la chiave nav.surveillance in "Attività" (o "Monitoraggio") in it.json e en.json.

### [microcopy] Trattino incoerente nei tempi di consegna ("24-48" ASCII vs "24–48" en-dash)
- **Dove:** ASCII (23x): app/about, app/faq, app/shipping, app/cart/page.tsx:141, app/layout.tsx:42, components/Footer.tsx:212, components/home/HowItWorks.tsx:45, HomeSectionRenderer.tsx:57,153; en-dash (4x): app/checkout/page.tsx:638,663, components/store-sections/ContactSection.tsx:64, components/ui/AuthShell.tsx:40
- **Corsia:** codice
- **Fix:** Uniformare su un solo carattere (preferibile l'en-dash "–" per intervalli numerici, oppure ovunque il trattino semplice) in tutte le occorrenze di 24-48h e 30-60 min.

### [microcopy] Incoerenza "Inizia a esplorare" vs "Inizia ad esplorare"
- **Dove:** app/orders/page.tsx:147, app/api/cron/send-emails/route.ts:32 (codice); site_settings.home_site → sezione hero, config.ctaLabel (config)
- **Corsia:** codice
- **Fix:** Uniformare su "Inizia a esplorare". Correggere app/orders/page.tsx:147, l'email cron e la ctaLabel dell'hero in site_settings (quest'ultima da /admin/home, corsia config).

### [microcopy] Cart: badge fiducia suggerisce solo "contanti alla consegna" e "IVA inclusa" presente nel carrello ma non nel riepilogo checkout
- **Dove:** app/cart/page.tsx:236 e :218 vs components/checkout/OrderSummary.tsx (sezione totale/rassicurazioni, nessuna riga IVA)
- **Corsia:** codice
- **Fix:** In cart affiancare/sostituire il badge con "Carta o contanti alla consegna" per coerenza col checkout. Allineare la dicitura IVA: mostrarla in entrambe le viste o in nessuna, evitando che compaia solo nel carrello.
