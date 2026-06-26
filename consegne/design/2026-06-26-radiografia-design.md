# 🎨 Radiografia del design — MyCity marketplace

**Data:** 26 giugno 2026  ·  **Tipo:** audit UX/UI profondo (sola lettura), ogni problema verificato in modo avversariale
**Cosa ho analizzato:** repo `NicolaeRotaru/mycity` · branch `claude/marketplace-design-ux-audit-cq69fr` · commit `97dffe8` (345 file `.tsx`, ~57 pagine, design-system)
**Come:** 11 dimensioni che coprono i 24 punti visivi/UX. Per ogni dimensione un designer/UX senior ha trovato i problemi, poi un *verificatore* ne ha tenuti solo quelli reali (file:riga). I falsi positivi sono già stati scartati.

---

## ⚡ Verdetto in breve (per Nicola)

Ho trovato **92 problemi reali**, già ripuliti dai falsi allarmi:

- 🔴 **Bloccanti: 0** — niente rompe l'acquisto o l'esperienza. Buona notizia: il sito *funziona*.
- 🟠 **Gravi: 36** — cose brutte e diffuse che si notano e abbassano la qualità percepita (e a volte la conversione).
- 🟡 **Minori: 56** — rifiniture e incoerenze da sistemare per un risultato "pulito".

**Tutti e 92 si risolvono nel codice** (componenti/CSS): nessuno è una semplice modifica di testo/colore da pannello. Vuol dire che vanno fatti dalla squadra tech in branch, con anteprima e tuo ok 🟡 — **mai deploy senza la tua firma 🔴**.

La maggior parte dei problemi non sono "bug" isolati ma **5-6 cause-radice ripetute** in tante pagine. Sistemando quelle, ne cadono decine in colpo solo. Le trovi qui sotto in *"I temi da cui partire"*.

---

## 📊 Quadro per dimensione

| Dimensione | 🔴 Bloc | 🟠 Gravi | 🟡 Minori | Totale |
|---|:--:|:--:|:--:|:--:|
| 🎨 Colori & contrasto | 0 | 3 | 3 | 6 |
| 🔠 Tipografia & gerarchia | 0 | 3 | 5 | 8 |
| 📐 Spazi, allineamento & layout | 0 | 2 | 8 | 10 |
| 📱 Responsive & mobile | 0 | 1 | 3 | 4 |
| 🖼️ Immagini & media | 0 | 2 | 5 | 7 |
| 🧩 Coerenza & design system | 0 | 6 | 3 | 9 |
| 🔄 Stati & feedback | 0 | 3 | 9 | 12 |
| 🧭 Navigazione & menu | 0 | 3 | 4 | 7 |
| 🛒 Flussi, CTA & conversione | 0 | 5 | 7 | 12 |
| ✍️ Microcopy | 0 | 3 | 4 | 7 |
| ♿ Accessibilità & velocità percepita | 0 | 5 | 5 | 10 |
| **TOTALE** | **0** | **36** | **56** | **92** |

---

## 🎯 I temi da cui partire (cause-radice ad alto ritorno)

Invece di rincorrere 92 fix sparsi, parti da questi nodi: ognuno sistema molte righe insieme.

1. **Colori fuori-palette nel funnel d'acquisto** — `rose` e `amber` di Tailwind usati al posto dei token di brand (vino `secondary`, `--danger`, `--status-canceled`) in checkout, carrello, ordini, cuore preferiti, timeline. Causa-radice: una *safelist* Tailwind troppo larga (`tailwind.config.ts:24-29`) che rende "legali" i colori freddi. → Stringi la safelist + sostituisci `rose/amber` con i token. Sistema ~6 punti.
2. **Offset degli elementi "sticky" sbagliato** — tante sidebar/indici usano `top-24` o `scroll-mt-24` (96px) mentre l'header è alto 144px (`--header-height`): si infilano ~48px sotto la barra (area account, pagine legali, "lavora con noi"). → Usa ovunque `var(--header-height)`. Sistema ~4 punti, alcuni gravi.
3. **Skeleton di caricamento che non combaciano col contenuto reale** → saltello di layout (CLS): la card scheletro ha forma/numero diversi da quella vera (ProductCard, StoreShowcase). → Allinea forma e conteggio degli skeleton. Migliora la *velocità percepita* su tutte le griglie.
4. **Gerarchia del prezzo e delle CTA nel punto di acquisto** — sulla scheda prodotto il prezzo attaccato ai bottoni è più piccolo di quello decorativo, e due CTA full-width ("Aggiungi" vs "Compra ora") competono; sticky mobile col prezzo a 18px. → Una sola CTA dominante + prezzo grande accanto ai bottoni. Tocca direttamente la conversione.
5. **Contrasto di `olive-500` sotto WCAG AA** (3.69:1) con testo bianco su badge/filtri/checkout, mentre esiste già `olive-600` che passa. → Sostituzione 1-a-1. Accessibilità + coerenza.
6. **Design system "orfano"** — token semantici dichiarati ma non esposti come utility (`--font-display`), `container` Tailwind non configurato (padding di bordo affidato a ogni pagina a mano), scala titoli decisa caso per caso. → Chiudere il sistema evita che il problema si ripresenti.

---

## 🟠 I 36 problemi GRAVI (dettaglio)

### 🎨 Colori & contrasto

**Cuore preferiti nella pagina prodotto usa rose Tailwind invece del token di brand (secondary/vino)**

- 📍 **Dove:** app/product/[id]/page.tsx:555-558 (focus-visible:ring-rose-400; bg-rose-500 border-rose-500; hover:text-rose-400 hover:border-rose-200; inattivo text-ink-300)
- 🎯 **Punto:** Colori — colori hardcoded/fuori-palette invece dei token; combinazioni che stonano
- 👁️ **Cosa si vede:** VERIFICATO nel codice. Lo stesso gesto (mettere/togliere dai preferiti) mostra due rossi diversi: in components/ProductCard.tsx:135 il cuore attivo è 'fill-secondary-500 text-secondary-500' = vino #D63E3B (token di brand, confermato in tailwind.config.ts:114), mentre in app/product/[id]/page.tsx:557 è 'bg-rose-500 border-rose-500' = rosa Tailwind freddo; al :558 il focus ring è 'ring-rose-400', l'inattivo 'text-ink-300' con hover 'text-rose-400 hover:border-rose-200'. Il rosa Tailwind stona con la palette 'Mediterranean Modern' (terracotta/vino) e crea incoerenza visiva tra griglia e dettaglio sullo stesso elemento.
- 🔧 **Fix:** Sostituire rose-500/rose-400/rose-200 con la scala secondary (vino): bg-secondary-500 border-secondary-500, focus-visible:ring-secondary-400, hover:text-secondary-500 hover:border-secondary-200, allineandosi a ProductCard.tsx:135. Così il cuore è identico ovunque e on-brand.

**Blocchi di errore/avviso del checkout in rose/amber Tailwind invece dei token --danger/--warning/secondary**

- 📍 **Dove:** app/checkout/page.tsx:734 (bg-rose-50 border-rose-200 text-rose-800), :746 (bg-rose-600 hover:bg-rose-700), :754 e :761 (bg-amber-50 border-amber-200 text-amber-900), :771 (bg-rose-50 border-rose-200 text-rose-800)
- 🎯 **Punto:** Colori — colori hardcoded fuori-palette invece dei token nel funnel d'acquisto
- 👁️ **Cosa si vede:** VERIFICATO nel codice. Nella pagina più importante per la conversione, gli alert 'prodotto non disponibile' (734), bottone 'rimuovi dal carrello' (746), 'disponibilità insufficiente' (754), 'scegli le opzioni' (761) ed 'errore di caricamento' (771) usano rose (rosa freddo) e amber (giallo squillante) di Tailwind. Il design system ha token espliciti (confermati in app/globals.css:71-72,77 e design-system/tokens/colors.css:111-124): --danger #DC2626, --warning = accent-500, --status-canceled #BE123C, e la scala secondary/vino come 'rosso di brand'. Il contrasto regge (rose-800 su rose-50 ~7.3:1, amber-900 su amber-50 ~8.75:1 — verificato per calcolo): il problema è la coerenza di palette, non la leggibilità.
- 🔧 **Fix:** Per gli errori usare la scala secondary (bg-secondary-50, border-secondary-200, text-secondary-800, bottone bg-secondary-600 hover:bg-secondary-700) o il token --danger; per gli avvisi 'recuperabili' usare accent/cream caldi (es. bg-accent-50, border-accent-300, text-accent-800/ink-800). Idealmente estrarre un componente Alert con varianti danger/warning che leggano i token, eliminando rose/amber sparsi.

**Badge/bottoni con testo bianco su olive-500: contrasto 3.69:1, sotto WCAG AA per testo normale**

- 📍 **Dove:** app/stores/page.tsx:173 (filtro 'Aperti ora', text-sm white su bg-olive-500); components/checkout/PaymentMethodSelector.tsx:130 (badge sconto −€ text-xs white su bg-olive-500); components/store-sections/HeroSection.tsx:129 (pill 'Aperto ora', text-sm white su bg-olive-500)
- 🎯 **Punto:** Contrasto — testo/sfondo sotto WCAG AA
- 👁️ **Cosa si vede:** VERIFICATO nel codice e per calcolo. olive-500 = #7C8B5A (tailwind.config.ts:67): testo bianco sopra dà 3.69:1, sotto la soglia AA di 4.5:1 per testo normale (ok solo per ≥18pt/24px o elementi UI 3:1). Tutti i casi citati sono text-sm o text-xs (testo normale/piccolo): il filtro 'Aperti ora' (stores/page.tsx:173), il badge sconto in checkout (PaymentMethodSelector.tsx:130, text-xs) e la pill 'Aperto ora' (HeroSection.tsx:129, text-sm). È anche un'incoerenza: il componente Badge variant 'new' usa correttamente olive-600 = #5A7C42 = 4.78:1 (passa AA). NOTA: la citazione originale 'HomeEvents.tsx:69' era un FALSO POSITIVO (lì c'è bg-accent-500 text-ink-900, contrasto ampio) ed è stata rimossa dal 'dove'.
- 🔧 **Fix:** Usare bg-olive-600 (4.78:1, passa AA) al posto di bg-olive-500 in tutti i casi con testo bianco di dimensione normale/piccola, oppure tenere bg-olive-500 con text-olive-900/ink-900 scuro sopra. Più pulito: bg-olive-600 text-white, allineato a Badge variant 'new'.

### 🔠 Tipografia & gerarchia

**Sulla scheda prodotto il prezzo ACCANTO ai bottoni d'acquisto (text-2xl) è più piccolo del prezzo decorativo in colonna info (text-4xl)**

- 📍 **Dove:** app/product/[id]/page.tsx:590 (text-4xl) vs app/product/[id]/page.tsx:729 (text-2xl)
- 🎯 **Punto:** 9 - Gerarchia visiva: il prezzo deve dominare nel punto di decisione
- 👁️ **Cosa si vede:** VERIFICATO. Riga 590, nella colonna INFO: 'text-4xl font-extrabold font-serif text-ink-900' (36px). Riga 729, nella card STICKY a destra — quella che contiene davvero i bottoni 'Aggiungi al carrello' (767-776) e 'Compra ora' (778-785), dove l'occhio decide l'acquisto — lo stesso prezzo è 'text-2xl font-extrabold font-serif text-ink-900' (24px), un terzo più piccolo. Il prezzo grande sta lontano dai bottoni; quello attaccato ai CTA è il più piccolo. Gerarchia invertita rispetto a dove serve.
- 🔧 **Fix:** Portare il prezzo della card d'acquisto (riga 729) ad almeno 'text-3xl' (meglio 'text-4xl'), così il prezzo attaccato ai CTA è il più dominante. In alternativa tenerne uno solo, grande, dentro la card CTA.

**Prezzo totale nella barra sticky mobile a text-lg (18px) nel momento dell'acquisto**

- 📍 **Dove:** components/StickyAddToCart.tsx:64
- 🎯 **Punto:** 9 - Gerarchia visiva: il prezzo deve dominare
- 👁️ **Cosa si vede:** VERIFICATO. La barra CTA sticky in fondo allo schermo su mobile (md:hidden, il componente di chiusura acquisto su smartphone) mostra il totale a 'text-lg font-bold text-primary-700' (riga 64) = 18px. Accanto, il bottone CTA è 'text-sm' (riga 100). Il numero che dovrebbe saltare all'occhio è solo 18px, più piccolo di molti titoli di sezione della home (text-2xl/3xl = 24-30px). Gerarchia debole proprio sul componente di conversione mobile.
- 🔧 **Fix:** Alzare il totale ad almeno 'text-xl'/'text-2xl' e usare un colore ad alta visibilità (ink-900 invece di primary-700). Nella sticky bar il prezzo deve essere l'elemento tipografico più forte dopo il testo del bottone.

**Due CTA d'acquisto full-width con peso quasi uguale: 'Aggiungi al carrello' e 'Compra ora' competono**

- 📍 **Dove:** app/product/[id]/page.tsx:767-785
- 🎯 **Punto:** 9 - Gerarchia visiva: la CTA d'acquisto deve dominare, non duplicarsi
- 👁️ **Cosa si vede:** VERIFICATO. Nella card d'acquisto ci sono due bottoni a tutta larghezza uno sopra l'altro: 'Aggiungi al carrello' (Button variant='accent' size='lg' fullWidth, righe 767-776) e subito sotto 'Compra ora · paghi alla consegna' (bg-ink-900 nero su testo bianco, font-bold, py-3, w-full, righe 778-785). Entrambi full-width, alta evidenza, peso bold: due azioni primarie che si contendono lo sguardo. L'utente non capisce qual è LA mossa.
- 🔧 **Fix:** Stabilire una sola CTA dominante: rendere uno il bottone pieno principale e degradare l'altro a stile secondario (outline/ghost, peso medium). Una sola azione deve avere il massimo contrasto e peso; l'altra deve essere chiaramente subordinata.

### 📐 Spazi, allineamento & layout

**Sidebar account sticky con offset sbagliato: si infila sotto l'header**

- 📍 **Dove:** components/account/AccountShell.tsx:108
- 🎯 **Punto:** Allineamento / Layout
- 👁️ **Cosa si vede:** L'aside dell'area account usa `lg:sticky lg:top-24` (96px). Verificato: l'header globale (components/Navbar.tsx:84) e' `md:sticky md:top-0` ed e' presente su /profile/* (Navbar montata in app/layout.tsx:122; /profile NON e' una 'area mestiere' secondo isProArea in Navbar.tsx, che esclude solo /seller /rider /admin). Il token --header-height vale 9rem=144px (app/globals.css:106, commento 'header sticky reale ~144px'). Con offset 96px su header 144px, scrollando la parte alta della sidebar finisce ~48px sotto la barra. Tutte le altre sidebar sticky del sito usano `top-[var(--header-height)]`: cart/page.tsx:190, checkout/page.tsx:779, product/[id]/page.tsx:727, category/[slug]/page.tsx:316, search/page.tsx:283, profile/settings/page.tsx:290. Qui l'offset e' l'unico incoerente.
- 🔧 **Fix:** Sostituire `lg:top-24` con `lg:top-[var(--header-height)]` (come tutte le altre sidebar sticky), oppure `lg:top-[calc(var(--header-height)+0.5rem)]` per un piccolo respiro.

**Pagine legali: TOC sticky e ancore di sezione vanno sotto l'header (offset 96px su header 144px)**

- 📍 **Dove:** components/ui/LegalLayout.tsx:78 (TOC `lg:top-24`) e :115 (`scroll-mt-24`)
- 🎯 **Punto:** Allineamento / Spazi
- 👁️ **Cosa si vede:** Verificato: LegalLayout/LegalSection sono usati da /terms, /privacy, /cookies, /accessibility (app/{terms,privacy,cookies,accessibility}/page.tsx). Il TOC usa `lg:sticky lg:top-24` (96px, riga 78) e ogni LegalSection usa `scroll-mt-24` (96px, riga 115). L'header globale e' sticky ~144px (--header-height, globals.css:106). Doppio difetto: (1) l'indice sticky si tucka ~48px sotto la barra; (2) cliccando una voce, il titolo della sezione si ferma ~48px sotto l'header. La stessa app usa gia' `scroll-mt-[var(--header-height)]` su product/[id]/page.tsx:814, quindi il pattern corretto esiste ma qui non e' applicato.
- 🔧 **Fix:** Usare `lg:top-[var(--header-height)]` per il TOC (riga 78) e `scroll-mt-[var(--header-height)]` per le sezioni (riga 115), coerente con product/[id]/page.tsx:814.

### 📱 Responsive & mobile

**Sulla scheda prodotto l'ultima parte di contenuto resta coperta dalla barra sticky 'Aggiungi al carrello' su mobile**

- 📍 **Dove:** app/product/[id]/page.tsx:374 (container 'container mx-auto px-4 sm:px-6 py-6', nessun padding-bottom) + components/StickyAddToCart.tsx:54-55 (fixed, bottom = env(safe-area-inset-bottom) + var(--tabbar-height)) + app/globals.css:197-199 (body padding-bottom solo 72px su mobile)
- 🎯 **Punto:** Mobile / Responsive
- 👁️ **Cosa si vede:** Confermato nel codice. Su mobile, scrollando oltre il 50% del primo schermo (StickyAddToCart.tsx:39-40) compare la barra sticky 'Aggiungi al carrello' che è 'md:hidden fixed left-0 right-0' posizionata a bottom = calc(env(safe-area-inset-bottom) + var(--tabbar-height)) (riga 55), quindi SOPRA la MobileTabBar (anch'essa fixed bottom-0, 72px). La barra CTA occupa la propria altezza (card p-3 con prezzo + CTA, ~64-72px). Il body riserva in fondo solo 'calc(72px + safe-area)' (globals.css:198), cioè la sola tab bar, e il container della pagina prodotto (page.tsx:374) ha solo 'py-6' senza padding-bottom extra. Risultato: gli ultimi elementi in fondo (sezioni 'Ultimi visti' a riga 1006 e 'Prodotti simili'/Correlati a riga 1011, che sono link reali) finiscono coperti dalla barra sticky CTA mentre è visibile.
- 🔧 **Fix:** Aggiungere al container della pagina prodotto un padding-bottom che tenga conto della doppia barra quando la sticky CTA è visibile, es. 'pb-[calc(var(--tabbar-height)+72px+env(safe-area-inset-bottom))] md:pb-6'; oppure (più robusto) far misurare a StickyAddToCart la propria altezza e riservare lo spazio sul body tramite una CSS var dedicata.

### 🖼️ Immagini & media

**SkeletonCard ha forma immagine diversa dalla ProductCard reale (salto di layout/CLS)**

- 📍 **Dove:** components/SkeletonCard.tsx:3 (riquadro 'w-full h-48') vs components/ProductCard.tsx:115 (riquadro 'relative aspect-square w-full')
- 🎯 **Punto:** 5 - Immagini e media (dimensioni incoerenti / CLS)
- 👁️ **Cosa si vede:** VERIFICATO. SkeletonCard.tsx riga 3 usa '<div className="w-full h-48 bg-cream-200 rounded-t-2xl" />' (altezza fissa 192px), mentre ProductCard.tsx riga 115 usa '<div className="relative aspect-square w-full overflow-hidden bg-white">'. In griglia a 2 colonne su mobile e nelle rail strette la foto reale e quadrata (es. ~160x160), lo scheletro e un rettangolo 160x192: all'arrivo dei dati la card si accorcia e cambia forma. Anche il corpo non combacia: scheletro p-3 (riga 4) vs corpo compatto p-2.5 della ProductCard (riga 141). SkeletonGrid usa questo scheletro (SkeletonCard.tsx:16-20).
- 🔧 **Fix:** Allineare lo scheletro alla card reale: sostituire '<div className="w-full h-48 bg-cream-200 rounded-t-2xl" />' con '<div className="relative aspect-square w-full bg-cream-200" />', e replicare la struttura del corpo compatto (negozio + titolo 2 righe + prezzo/+ con p-2.5). In alternativa far riusare a SkeletonCard lo stesso wrapper aspect-square di ProductCard.

**Miniature ordine e logo negozio caricate a piena risoluzione in slot 40-48px (<img> grezzo senza sizedImage)**

- 📍 **Dove:** app/orders/page.tsx:216 (logo negozio, slot w-12 h-12) e app/orders/page.tsx:246 (thumb prodotto, slot h-12 w-12); app/orders/[id]/page.tsx:554 (thumb prodotto, slot h-11 w-11) e app/orders/[id]/page.tsx:584 (logo negozio, slot h-10 w-10)
- 🎯 **Punto:** 5 - Immagini e media (immagini sovradimensionate)
- 👁️ **Cosa si vede:** VERIFICATO. orders/page.tsx riga 216 usa '<img src={order.seller.store_logo} ...>' e riga 246 '<img src={img} ...>' con URL grezzo; orders/[id]/page.tsx riga 554 '<img src={img} ...>' e riga 584 '<img src={order.seller.store_logo} ...>'. Nessuna delle due pagine importa sizedImage (grep 'sizedImage' = nessun risultato in entrambe). Le foto/loghi su Supabase Storage sono spesso 1000px+ e vengono scaricati a piena risoluzione in riquadri da 40-48px. Liste ordini lunghe = pagine pesanti su mobile. Tutto il resto dell'app passa da sized() (es. ProductCard.tsx:58, CartGroupsList.tsx:34): qui l'incoerenza di peso/dimensione e reale.
- 🔧 **Fix:** Importare sizedImage da '@/lib/image-url' nelle due pagine ordini e avvolgere ogni src con sizedImage(..., 'thumb'): es. 'src={sizedImage(order.seller.store_logo, "thumb")}' e 'src={sizedImage(img, "thumb")}'. I riquadri hanno gia dimensioni fisse e overflow-hidden, nessuna deformazione.

### 🧩 Coerenza & design system

**CTA "Aggiungi al carrello" resa in due colori di brand diversi (terracotta primary-600 sul '+' della card vs mostarda accent sulla scheda/sticky)**

- 📍 **Dove:** components/ProductCard.tsx:183 (bg-primary-600) vs app/product/[id]/page.tsx:767-776 (<Button variant="accent">) vs components/StickyAddToCart.tsx:100 (bg-accent-500)
- 🎯 **Punto:** 7 - Coerenza visiva / Design System (azione primaria d'acquisto)
- 👁️ **Cosa si vede:** VERIFICATO. La stessa azione 'aggiungi al carrello' usa due colori di brand diversi: il '+' della ProductCard (ripetuto decine di volte in home e catalogo, riga 183) e' TERRACOTTA (bg-primary-600 hover:bg-primary-700 text-white), mentre la CTA della scheda prodotto (riga 767, Button variant='accent') e la sticky mobile (StickyAddToCart riga 100, bg-accent-500 hover:bg-accent-600 text-ink-900) sono MOSTARDA. Il Button primitive definisce la CTA d'acquisto come 'accent' (mostarda). L'utente vede due colori per la stessa azione. Nota: la sticky usa bg-accent-500 mentre il primitive accent e' bg-accent-400 (Button.tsx:26), quindi anche la sticky devia di un gradino dal primitive.
- 🔧 **Fix:** Uniformare il '+' della ProductCard al colore accent della CTA d'acquisto: sostituire bg-primary-600 hover:bg-primary-700 text-white con la variante accent del Button primitive (bg-accent-400 hover:bg-accent-500 text-ink-900), idealmente usando <Button variant='accent'>. Allineare anche la sticky (accent-500) al token accent-400 del primitive cosi' la tonalita' vive in un punto solo.

**Il colore della CTA primaria (terracotta) e' spaccato tra due tonalita': primary-700 (Button primitive) e primary-600 (decine di bottoni hardcoded)**

- 📍 **Dove:** Canonico: components/ui/Button.tsx:24 (bg-primary-700 hover:bg-primary-800). Deviazioni primary-600 verificate: components/ProductCard.tsx:183, components/cart/CartUpsell.tsx:124, components/SupportProductAssistant.tsx:433,500,600, components/NewsletterForm.tsx:85, components/LocationPill.tsx:82,115, components/VendorForm.tsx:333, app/admin/products/page.tsx:89, components/seller/site/SiteEditor.tsx:142 (e molte altre: ~50 occorrenze totali)
- 🎯 **Punto:** 7 - Coerenza visiva / Design System (tonalita' CTA)
- 👁️ **Cosa si vede:** VERIFICATO. Il Button primitive ufficiale usa bg-primary-700/hover-800 (Button.tsx:24), ma moltissimi bottoni/elementi hardcoded usano bg-primary-600 (hover 700), un gradino piu' chiaro. Tutte le occorrenze citate sono confermate a quelle righe. La tonalita' della CTA terracotta non e' unica nel codice; affiancando un Button primitive a un bottone hardcoded il rosso appare incoerente.
- 🔧 **Fix:** Fissare la CTA primaria SEMPRE su primary-700/hover-800 (come il Button primitive) e migrare i <button> hardcoded a <Button variant='primary'>, oppure rimappare le occorrenze primary-600 verso primary-700, cosi' la tonalita' resta in un solo punto.

**Badge sconto "-X%" reso in colori diversi tra home (mostarda/bianco) e Badge primitive (vino)**

- 📍 **Dove:** Canonico: components/ui/Badge.tsx:26 (discount = bg-secondary-600). Deviazioni: components/home/HomeEvents.tsx:69 (bg-accent-500 text-ink-900), app/shop-of-month/page.tsx:160 e components/home/ShopOfMonthHero.tsx:98 (bg-accent-400 text-ink-900), components/home/DropOfDay.tsx:122 (bg-white text-primary-700)
- 🎯 **Punto:** 7 - Coerenza visiva / Design System (badge)
- 👁️ **Cosa si vede:** VERIFICATO. Esiste il Badge primitive con variant 'discount' (vino, bg-secondary-600) usato correttamente in ProductCard.tsx:108, app/product/[id]/page.tsx:422 e components/store-sections/PromotionsSection.tsx:24. Diverse sezioni della home rendono pero' lo stesso '-X%' come pillola hardcoded in MOSTARDA (HomeEvents:69 bg-accent-500; ShopOfMonthHero:98 e shop-of-month:160 bg-accent-400) o BIANCA (DropOfDay:122 bg-white text-primary-700). Nella home l'utente vede il badge sconto in vino, mostarda e bianco. PRECISAZIONE rispetto al testo originale: il badge HomeEvents:69 e' sovrapposto alla cover-image dell'evento (sfondo immagine/gradiente, non card bianca), e quelli di ShopOfMonth/DropOfDay sono su hero scuro/colorato, non su card bianca; quindi parte della giustificazione 'contrasto' regge. Resta vero che lo stesso significato (sconto) ha rese cromatiche diverse senza una fonte unica.
- 🔧 **Fix:** Dove la pillola sta su superficie chiara/card usare sempre <Badge variant='discount'>. Per i banner su sfondo scuro/colorato (DropOfDay hero, ShopOfMonth hero) introdurre una variante badge dedicata nel primitive invece di stili ad-hoc, cosi' resta una sola fonte di verita'.

**Cuore "preferito" attivo: vino (secondary-500) sulla card, rosa off-brand (rose-500) sulla scheda prodotto**

- 📍 **Dove:** components/ProductCard.tsx:135 (fill-secondary-500 text-secondary-500) vs app/product/[id]/page.tsx:555-558 (bg-rose-500 border-rose-500 / focus-visible:ring-rose-400 / hover:text-rose-400 hover:border-rose-200)
- 🎯 **Punto:** 7 - Coerenza visiva / Design System (stato attivo, colore di brand)
- 👁️ **Cosa si vede:** VERIFICATO. Lo stato 'preferito attivo' usa il vino di brand (fill-secondary-500 text-secondary-500) sulla ProductCard (riga 135), ma sulla scheda prodotto usa la rose-* di Tailwind (riga 555-558: ring-rose-400, bg-rose-500 border-rose-500, hover:text-rose-400 hover:border-rose-200), esplicitamente fuori-palette per il design system 'Mediterranean Modern' (vedi nota in Badge.tsx:8 che corregge proprio la rose verso secondary). Lo stesso cuore appare di due rossi diversi a seconda della pagina.
- 🔧 **Fix:** Sulla scheda prodotto sostituire le classi rose-* del cuore con secondary-* (bg-secondary-500 border-secondary-500, hover:text-secondary-400 hover:border-secondary-200, focus-visible:ring-secondary-400) per allinearle alla ProductCard e alla palette di brand.

**Due componenti ErrorState coesistenti con look diverso (cerchio icona, tonalita', stile bottone retry)**

- 📍 **Dove:** components/ErrorState.tsx (default export, importato in app/favorites/page.tsx:9, app/stores/page.tsx:10, app/orders/page.tsx:11, app/product/[id]/page.tsx:16, components/StoreShowcase.tsx, components/ProductGrid.tsx) vs components/ui/ErrorState.tsx (named export, importato in app/error.tsx, app/checkout/error.tsx, app/store/[id]/error.tsx, app/product/[id]/error.tsx, app/orders/[id]/error.tsx, ecc.)
- 🎯 **Punto:** 7 - Coerenza visiva / Design System (componente duplicato)
- 👁️ **Cosa si vede:** VERIFICATO. Esistono DUE ErrorState diversi. Quello root (components/ErrorState.tsx:36-50) ha cerchio icona w-16/h-16, testo secondary-700, bottone 'Riprova' Button variant='secondary' size='sm' shape='pill'. Quello ui (components/ui/ErrorState.tsx:42-49) ha cerchio w-24/h-24, testo secondary-600, 'Riprova' Button variant='primary' rettangolare + CTA back/supporto. Le pagine importano l'uno o l'altro (default in favorites/stores/orders/product e StoreShowcase/ProductGrid; named in tutte le error boundary), quindi lo stato d'errore appare diverso da pagina a pagina (dimensione cerchio, tonalita', stile bottone).
- 🔧 **Fix:** Consolidare su un solo ErrorState (preferire components/ui/ErrorState.tsx come canonico), allineare dimensione cerchio/tonalita'/stile bottone, migrare i 6 import del default verso quello canonico e poi rimuovere il duplicato.

**Card contenitore con raggio e bordo incoerenti tra ProductCard, StorePreviewCard, StoreListRow, StoreCard, carrello e Card primitive**

- 📍 **Dove:** components/ProductCard.tsx:104 (rounded-2xl border-surface-200) · components/StoreListRow.tsx:35 (rounded-2xl border-surface-200) · components/StorePreviewCard.tsx:52 (rounded-2xl border-cream-200) · components/StoreCard.tsx:15 (rounded-xl border-cream-300) · app/cart/page.tsx:119,191 (rounded-xl border-cream-300) · components/ui/Card.tsx:43,17 (rounded-lg border-cream-300)
- 🎯 **Punto:** 7 - Coerenza visiva / Design System (card / superfici)
- 👁️ **Cosa si vede:** VERIFICATO. Il contenitore 'card' non ha una ricetta unica: il raggio varia tra rounded-lg (Card primitive, Card.tsx:43), rounded-xl (StoreCard:15, cart:119,191) e rounded-2xl (ProductCard:104, StoreListRow:35, StorePreviewCard:52); il colore del bordo varia tra border-cream-300 (Card primitive, StoreCard, cart), border-cream-200 (StorePreviewCard:52) e border-surface-200 (ProductCard:104, StoreListRow:35). Card simili affiancate (es. StorePreviewCard con cream-200 e ProductCard con surface-200 nelle rail home) hanno bordi di colore/raggio leggermente diversi.
- 🔧 **Fix:** Definire una sola ricetta-card nel design system (es. rounded-2xl + border-surface-200 per le card prodotto/negozio del funnel) e applicarla a ProductCard/StorePreviewCard/StoreListRow; allineare StoreCard e le card del carrello. Idealmente derivare tutte dal Card primitive o esporre raggio/bordo come token.

### 🔄 Stati & feedback

**L'autocomplete della SearchBar mostra «Nessun risultato» mentre sta ancora cercando (loading travestito da empty)**

- 📍 **Dove:** components/SearchBar.tsx:48 (useQuery: solo `data: suggestions = []`, niente isLoading/isFetching) + righe 181-189 (dropdown: ramo `suggestions.length === 0`)
- 🎯 **Punto:** 15 — Stati di caricamento (loading vs empty); skeleton vs spinner
- 👁️ **Cosa si vede:** Verificato nel file: lo useQuery (riga 48) destruttura solo `data: suggestions = []`, non espone né usa `isLoading`/`isFetching`/`isError`. Appena `debounced.length >= 2` (riga 181) il dropdown si apre e valuta `suggestions.length === 0` (riga 183): per TUTTA la durata del fetch mostra «Nessun risultato per «termine». Cerca comunque →» (righe 184-188). L'utente che digita vede un falso «nessun risultato» che lampeggia prima dell'arrivo dei veri suggerimenti. È esattamente l'anti-pattern (loading scambiato per vuoto) contro cui mette in guardia la docstring di components/ErrorState.tsx:10-13.
- 🔧 **Fix:** Estrarre `isLoading`/`isFetching`/`isError` dallo useQuery (riga 48). Mostrare uno stato intermedio (3-4 righe skeleton o spinner inline 'Cerco…') quando `isFetching && suggestions.length === 0`; mostrare «Nessun risultato» solo a query conclusa (`!isFetching && suggestions.length === 0`); su `isError` un micro-errore con 'Riprova'.

**Pagine cliente con griglie (preferiti, negozi, categorie, vetrina negozio) caricano con uno spinner nudo invece dello skeleton-griglia: CLS e rottura della continuità visiva**

- 📍 **Dove:** app/favorites/page.tsx:49 · app/stores/page.tsx:135 · app/category/[slug]/page.tsx:85,89 · app/categorie/page.tsx:29 · app/store/[id]/page.tsx:32 — tutti `return <LoadingState />` (variant di default = 'spinner', components/ui/LoadingState.tsx:29,41-48)
- 🎯 **Punto:** 15 — skeleton vs spinner; coerenza degli stati di caricamento
- 👁️ **Cosa si vede:** Verificato: `<LoadingState />` senza prop usa la variante di default 'spinner' (LoadingState.tsx:29 `variant = 'spinner'`, render 41-48 = Loader2 32px centrato + testo, py-12). Le 5 pagine citate poi mostrano una GRIGLIA di prodotti/negozi. Al passaggio loading→contenuto si salta dal piccolo spinner centrato alla griglia piena (CLS) e si perde la continuità visiva. Il resto dell'app fa la cosa giusta: app/loading.tsx usa `variant='cards'` (skeleton grid branded, righe 11-16) e ProductGrid/SkeletonCard usano SkeletonGrid. Qui no: trattamento incoerente su pagine d'acquisto chiave.
- 🔧 **Fix:** Su queste pagine usare `<LoadingState variant='cards' />` (o `<SkeletonGrid />` di components/SkeletonCard.tsx) così la forma del caricamento rispecchia la griglia finale ed evita il salto. Dove esiste già un loading.tsx con skeleton (es. store/[id]), evitare il secondo spinner nel client component.

**Il submit principale del checkout non ha spinner durante l'elaborazione: solo testo che cambia**

- 📍 **Dove:** components/checkout/OrderSummary.tsx:81-100 (ramo `isCheckingOut` → solo testo 'Apertura pagamento sicuro…'/'Elaborazione…') e duplicato nella barra mobile app/checkout/page.tsx:827-837
- 🎯 **Punto:** 16 — feedback/conferma dopo l'azione (invio form/pagamento)
- 👁️ **Cosa si vede:** Verificato: sull'azione più critica del funnel, mentre `isCheckingOut` è true, il bottone primario (OrderSummary.tsx:88-89) cambia solo il testo in 'Apertura pagamento sicuro…'/'Elaborazione…' senza alcuno spinner, e manca `aria-busy` (il <button> a riga 81-87 non lo ha). Stesso difetto nella barra mobile (checkout/page.tsx:834-836: solo testo 'Apertura…'/'Elaborazione…', nessun spinner né aria-busy). Il pattern del design system è invece spinner+aria-busy (components/ui/Button.tsx:77 Loader2 animate-spin, :98 aria-busy). Senza spinner, su rete lenta l'utente non percepisce il progresso e tende a ri-cliccare.
- 🔧 **Fix:** Mostrare un Loader2 `animate-spin` accanto al testo quando `isCheckingOut` e aggiungere `aria-busy={isCheckingOut}` ai due bottoni submit (OrderSummary e barra mobile). Idealmente riusare il componente Button (prop `loading`) invece del <button> grezzo.

### 🧭 Navigazione & menu

**Su mobile la CategoryBar (navigazione per categoria) sparisce allo scroll: header non sticky e nessun equivalente nella tab bar**

- 📍 **Dove:** components/Navbar.tsx:84 (header 'relative md:sticky md:top-0') + Navbar.tsx:193-197 (CategoryBar dentro l'header non-sticky su mobile) + components/MobileTabBar.tsx:83-89 (tab buyer: Home/Cerca/Carrello/Ordini/Tu) e :91-97 (tab guest: Home/Cerca/Negozi/Carrello/Accedi) — nessuna 'Categorie'
- 🎯 **Punto:** 11 - Navigazione e Menu / coerenza desktop-mobile
- 👁️ **Cosa si vede:** VERIFICATO. L'header è 'relative md:sticky md:top-0' (Navbar.tsx:84): su desktop resta in cima allo scroll e la CategoryBar è sempre visibile (commento :30 'no auto-hide, l'utente la deve sempre vedere'); su mobile è solo 'relative', quindi appena si scrolla header + CategoryBar escono dallo schermo e non tornano. La MobileTabBar (l'unica chrome persistente su mobile, fixed bottom-0) non ha alcuna voce 'Categorie'/'Sfoglia': né per buyer (Navbar... MobileTabBar.tsx:83-89 Home/Cerca/Carrello/Ordini/Tu) né per guest (:91-97 Home/Cerca/Negozi/Carrello/Accedi). Dopo lo scroll, su mobile non c'è modo di sfogliare per reparto senza risalire in cima alla pagina: funzione centrale presente su desktop e assente su mobile, forte incoerenza.
- 🔧 **Fix:** Dare accesso costante alle categorie su mobile: rendere sticky la riga CategoryBar anche su mobile, oppure aggiungere alla MobileTabBar (buyer e guest) una tab 'Categorie' verso /categorie, oppure mostrare la CategoryBar come barra sticky secondaria sotto l'header mobile. Allineare il comportamento a quello desktop.

**Sottocategorie del mega-menu troncate a 6 senza 'Vedi tutto': quelle oltre la sesta sono irraggiungibili dal menu**

- 📍 **Dove:** components/CategoryBar.tsx:166 ('kids.slice(0, 6).map(...)') — il link 'Vedi tutto →' verso /category/{top.slug} esiste SOLO nel ramo else (:174-178) quando kids.length === 0
- 🎯 **Punto:** 11 - Navigazione e Menu / categorie chiare
- 👁️ **Cosa si vede:** VERIFICATO e concreto. Nel mega-menu 'Tutte le categorie' ogni reparto con figli mostra al massimo 6 sottocategorie ('kids.slice(0, 6)', CategoryBar.tsx:166). Se un reparto ne ha 7+, dalla settima in poi spariscono e NON c'è alcun 'Vedi tutto' nel ramo con figli (il 'Vedi tutto →' a :175 è presente solo quando il reparto NON ha figli). Il troncamento colpisce dati reali: 'Libri' ha 4 sottocategorie in 057_subcategories.sql + 8 in 078_more_subcategories.sql (12 totali), 'Abbigliamento' ne ha 8 in 078, 'Casa' 5 in 057. Quindi diverse sottocategorie restano nascoste e non raggiungibili dal menu.
- 🔧 **Fix:** Quando 'kids.length > 6', aggiungere come ultima voce della lista un link 'Vedi tutte (N) →' verso '/category/{top.slug}' (oppure /categorie). In alternativa rendere il limite coerente coi dati reali. Così nessuna sottocategoria resta nascosta.

**Breadcrumb JSON-LD con URL relativi: i rich results BreadcrumbList di Google non vengono generati**

- 📍 **Dove:** components/ui/Breadcrumb.tsx:32 ('item: item.href' relativo) e app/category/[slug]/page.tsx:99-101 ('item: "/"', 'item: "/categorie"', 'item: `/category/${slug}`')
- 🎯 **Punto:** 11 - Navigazione e Menu / breadcrumb
- 👁️ **Cosa si vede:** VERIFICATO. Lo Schema.org BreadcrumbList usa percorsi RELATIVI nel campo 'item': in Breadcrumb.tsx:32 'item: item.href' (es. '/', '/categorie'), e nel breadcrumbSchema della pagina categoria a app/category/[slug]/page.tsx:99-101 ('/', '/categorie', `/category/${slug}`). Google richiede URL assoluti completi (https://dominio/...) per validare e mostrare la breadcrumb nei risultati; con path relativi il rich result non viene riconosciuto. Lo scopo dichiarato nel commento del componente (Breadcrumb.tsx:12 'Schema BreadcrumbList obbligatorio per rich results Google') non si realizza. Riguarda tutte le pagine categoria e tutte quelle che usano la primitive Breadcrumb.
- 🔧 **Fix:** Anteporre il dominio assoluto (process.env.NEXT_PUBLIC_APP_URL, già usato come APP_URL in app/layout.tsx:36) al campo 'item' nello JSON-LD, sia in Breadcrumb.tsx:32 sia nel breadcrumbSchema della pagina categoria (:99-101). La breadcrumb VISIBILE può restare con href relativi: il problema è solo nello structured data.

### 🛒 Flussi, CTA & conversione

**Spedizione nel carrello (€4,90 fissi) calcolata diversamente da quella reale del checkout (per distanza)**

- 📍 **Dove:** app/cart/page.tsx:44 (shippingCost = freeShipping ? 0 : 4.9) + :45 (finalTotal = total + shippingCost) vs app/checkout/page.tsx:334-343 (shippingFor → riderFee(haversineKm))
- 🎯 **Punto:** Carrello / Checkout / Costi a sorpresa (17-21)
- 👁️ **Cosa si vede:** Il carrello calcola la spedizione come flat €4,90 globale (cart/page.tsx:44) e la somma nel 'Totale' (:45). Il checkout invece la calcola PER NEGOZIO e in base alla distanza: app/checkout/page.tsx:338-340 usa haversineKm + riderFee quando ci sono le coordinate dell'indirizzo, con fallback a €4,90 solo se le coords mancano. Quindi il totale mostrato nel carrello può cambiare al checkout. NOTA: la frase del report secondo cui 'nel caso single-store mostra €4,90 come certo' è imprecisa — la nota 'stima · potrebbe variare al checkout' (cart/page.tsx:209-211) si attiva con (!freeShipping || multiStore), quindi appare ANCHE nel single-store non-gratis; resta però vero che il NUMERO mostrato (€4,90) è un modello diverso da quello del checkout, e nel multistore l'etichetta 'Gratis' del carrello non è garantita (la soglia al checkout è per-negozio).
- 🔧 **Fix:** Allineare i due modelli: o il carrello stima la spedizione con la stessa logica del checkout (per-negozio/per-distanza), oppure etichettare sempre la voce come 'Spedizione stimata da €4,90'. Estrarre un'unica funzione condivisa (lib/geo / lib/shipping) per evitare il doppio numero hardcoded (4.9 sia in cart/page.tsx:44 sia in checkout SHIPPING_PER_ORDER:43).

**Tre colori diversi per il pulsante d'acquisto lungo lo stesso funnel**

- 📍 **Dove:** Prodotto 'Aggiungi al carrello' Button variant=accent (mustard) app/product/[id]/page.tsx:767-776 · Prodotto 'Compra ora' bg-ink-900 (nero) :778-785 · Carrello 'Procedi al checkout' bg-primary-700 (terracotta) app/cart/page.tsx:229-232 · Checkout submit bg-primary-700 components/checkout/OrderSummary.tsx:86
- 🎯 **Punto:** CTA poco chiare / gerarchia visiva (12-13)
- 👁️ **Cosa si vede:** Il pulsante che fa avanzare l'acquisto cambia colore a ogni step: mostarda sulla scheda prodotto (Aggiungi al carrello, Button variant accent), nero subito sotto (Compra ora, bg-ink-900), terracotta nel carrello (Procedi al checkout, bg-primary-700) e di nuovo terracotta nel checkout (OrderSummary submit, bg-primary-700). Manca un colore-azione unico riconoscibile lungo il funnel; in più sulla scheda prodotto i due bottoni (mostarda + nero) competono per l'attenzione senza una gerarchia chiara tra primario e secondario.
- 🔧 **Fix:** Definire UN colore per la CTA d'acquisto primaria in tutto il funnel e usarlo per Aggiungi al carrello, Procedi al checkout e Conferma ordine. Rendere 'Compra ora' chiaramente secondario (ghost/outline) per non gareggiare con 'Aggiungi al carrello'.

**La variante 'accent' del Button usa accent-400/500, mentre tutte le altre CTA mostarda del sito usano accent-500/600**

- 📍 **Dove:** components/ui/Button.tsx:26 (accent: 'bg-accent-400 hover:bg-accent-500') vs uso canonico bg-accent-500 hover:bg-accent-600 in components/StickyAddToCart.tsx:100, components/Navbar.tsx:108/226, components/home/DropOfDay.tsx:147, components/home-sections/HomeSectionRenderer.tsx:357, components/ProductQA.tsx:255, components/rider/RiderConnectButton.tsx:121
- 🎯 **Punto:** Colori / coerenza CTA (12)
- 👁️ **Cosa si vede:** Il Button accent (usato dal CTA principale 'Aggiungi al carrello' della scheda prodotto, page.tsx:767-776) parte da accent-400 con hover accent-500. Ovunque nel sito le CTA mostarda usano invece bg-accent-500 → hover bg-accent-600 (verificato in StickyAddToCart, Navbar, DropOfDay, HomeSectionRenderer, ProductQA, RiderConnectButton). Quindi il pulsante d'acquisto desktop è di una tonalità più chiara e con hover diverso rispetto allo StickyAddToCart mobile (stesso testo 'Aggiungi al carrello') e a tutte le altre CTA mostarda. Incoerenza visibile a colpo d'occhio confrontando Button accent desktop e StickyAddToCart mobile sulla stessa pagina prodotto.
- 🔧 **Fix:** Allineare la variante accent del Button a bg-accent-500 hover:bg-accent-600 (il brand accent + hover canonico), così la CTA d'acquisto desktop combacia con StickyAddToCart e con tutte le altre CTA mostarda.

**Slot 'Adesso · Express ~30–45 min' sempre selezionabile, anche quando nessun negozio del carrello è express**

- 📍 **Dove:** components/checkout/DeliverySlotPicker.tsx:91-97 (DayTile 'Adesso' sempre renderizzato) — il componente NON riceve expressStores; in app/checkout/page.tsx:650-657 viene montato senza passare l'eleggibilità, mentre il banner Express è condizionato a expressStores.length>0 (:635)
- 🎯 **Punto:** Checkout / aspettative consegna / costi-tempi a sorpresa (17-21)
- 👁️ **Cosa si vede:** Il picker fascia di consegna mostra SEMPRE la tile 'Adesso' con badge 'Express' e sottotitolo '~30–45 min' (DeliverySlotPicker.tsx:91-97), indipendentemente dal fatto che i negozi nel carrello offrano l'Express. Il componente non riceve expressStores tra le sue Props (:52-62) e il checkout lo monta senza passare alcuna eleggibilità (:650-657). Il checkout calcola expressStores e mostra il banner solo se >0 (:635), ma la tile 'Adesso' resta sempre cliccabile: l'utente può selezionare 'Adesso' su un ordine in realtà standard 24-48h. Lo slot scelto viene solo persistito come stringa (resolveSlotLabel → NOW_LABEL 'Adesso · arrivo in ~30–45 min') senza validazione → falsa promessa di consegna rapida.
- 🔧 **Fix:** Passare expressStores/eligibilità al DeliverySlotPicker e nascondere o disabilitare la tile 'Adesso/Express' quando nessun negozio del carrello è express-eligibile (mostrando solo Oggi/Domani). In alternativa, mostrarla disabilitata con tooltip 'Express non disponibile per questi negozi'.

**Il filtro 'Spedizione gratis' in ricerca filtra in realtà i prodotti con prezzo ≥ €30 (semantica sbagliata)**

- 📍 **Dove:** app/search/page.tsx:478 (minPrice={minPrice > 0 ? minPrice : (freeShipping ? 30 : undefined)}); stato freeShipping a :71, chip a :139, label a :244
- 🎯 **Punto:** Ricerca/filtri (16)
- 👁️ **Cosa si vede:** Quando l'utente spunta 'Spedizione gratis' (checkbox a search/page.tsx:239-244), il codice imposta minPrice=30 (:478), cioè mostra solo i prodotti che COSTANO almeno €30 — non i prodotti con spedizione gratuita. La soglia di spedizione gratis (FREE_SHIPPING_THRESHOLD=30) è per-ORDINE (subtotale carrello), non per singolo prodotto: un prodotto da €12 può comunque avere spedizione gratis se l'ordine supera €30. Attivando il filtro l'utente NASCONDE tutti i prodotti economici sotto €30, l'opposto dell'intento, e taglia risultati validi.
- 🔧 **Fix:** Rivedere la semantica: o rimuovere il filtro 'Spedizione gratis' a livello prodotto (non ha senso per soglia d'ordine), oppure rietichettarlo come 'Prezzo da €30 / Idoneo a spedizione gratis da solo'. Non riusare minPrice per simulare un concetto diverso.

### ✍️ Microcopy

**Errori tecnici grezzi (err.message) mostrati al cliente al posto di un messaggio in italiano**

- 📍 **Dove:** components/PushNotificationOptIn.tsx:98 e :119; components/VerifyCodeDialog.tsx:57; components/PhotoReviewUpload.tsx:69; components/seller/PhotoFillButton.tsx:86; components/seller/BackgroundRemovalPreview.tsx:76
- 🎯 **Punto:** Microcopy / messaggi d'errore criptici
- 👁️ **Cosa si vede:** Verificato nel codice: in tutti i 6 punti l'errore viene reso con `err instanceof Error ? err.message : '<fallback>'`. Il fallback è già in italiano, ma se l'API/browser restituisce un messaggio, l'utente vede stringhe tecniche o in inglese (es. 'Failed to fetch', 'Subscription failed', 'Registration failed'). Esiste l'helper friendlyError() in lib/errors.ts costruito proprio per filtrare questi dettagli, e BackgroundRemovalPreview.tsx lo importa già (lo usa a :107) ma alla riga :76 mostra ancora err.message grezzo — incoerenza interna nello stesso file. In VerifyCodeDialog il catch a :57 leakka err.message su errori imprevisti/di rete (il path normale del codice errato è gestito da ERROR_LABELS); nell'opt-in notifiche del buyer (PushNotificationOptIn :98 e :119) rompe la fiducia.
- 🔧 **Fix:** Avvolgere ogni `err.message` con friendlyError(err): es. `toast.error(friendlyError(err))`. In BackgroundRemovalPreview.tsx friendlyError è già importato, va solo applicato anche a :76. Per VerifyCodeDialog usare un fallback parlante tipo 'Codice non valido o scaduto. Richiedine uno nuovo.'

**Errori di geolocalizzazione in italiano+inglese misti ('Impossibile ottenere la posizione: User denied Geolocation')**

- 📍 **Dove:** app/near/page.tsx:79; components/StoreLocationPicker.tsx:172; app/rider/orders/[id]/page.tsx:202 ('Errore GPS: ' + err.message)
- 🎯 **Punto:** Microcopy / italiano-inglese misti
- 👁️ **Cosa si vede:** Verificato: il prefisso è in italiano ma viene concatenato `err.message` del GeolocationPositionError, che il browser restituisce SEMPRE in inglese ('User denied Geolocation', 'Timeout expired', 'Position unavailable'). Sulla pagina 'Negozi vicino a te' (app/near :79 -> setPermError('Impossibile ottenere la posizione: ' + err.message)) il cliente che nega/non ottiene la posizione legge una frase mezza italiana mezza inglese. Stesso pattern nel picker posizione negozio (StoreLocationPicker :172, onboarding venditore) e nella condivisione GPS del rider (:202, 'Errore GPS: ' + err.message).
- 🔧 **Fix:** Mappare err.code (1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT) su messaggi italiani: es. 1->'Hai bloccato la posizione. Attivala dalle impostazioni del browser per vedere i negozi vicini.', 3->'Non riusciamo a rilevare la tua posizione. Riprova o inserisci l'indirizzo a mano.' Non concatenare mai err.message.

**Conteggi non pluralizzati: '1 articoli', '1 recensioni', '1 negozi' (grammatica sbagliata)**

- 📍 **Dove:** app/cart/page.tsx:89 e :194 ('{count} articoli'); app/product/[id]/page.tsx:579 ('{reviews.length} recensioni', dentro il ramo reviews.length>0 quindi attivo anche con 1); app/checkout/page.tsx:783 ('{cart.length} articoli'); app/stores/page.tsx:156 ('{stores.length} negozi locali pronti a consegnarti'); app/shared-cart/page.tsx:128 ('{count} articoli aggiunti al carrello')
- 🎯 **Punto:** Microcopy / refusi grammaticali diffusi
- 👁️ **Cosa si vede:** Verificato in tutti i 6 punti: il numero è concatenato a un sostantivo plurale fisso, quindi con valore 1 produce 'Il tuo carrello (1 articoli)', '1 recensioni', '1 negozi locali pronti a consegnarti', '1 articoli aggiunti al carrello'. Confermata l'incoerenza interna: esiste pluralize(n,singolare,plurale) in lib/format.ts, e app/orders/page.tsx:190 ('1 ordine' : 'N ordini') e app/favorites/page.tsx:86 ('1 prodotto salvato' : 'N prodotti salvati') gestiscono correttamente il singolare col ternario. La pagina prodotto con esattamente 1 recensione e il carrello con 1 articolo sono casi frequentissimi.
- 🔧 **Fix:** Usare pluralize() o il ternario come già fatto altrove: `{count === 1 ? '1 articolo' : `${count} articoli`}`, `{reviews.length === 1 ? '1 recensione' : `${reviews.length} recensioni`}`, idem per negozi. La logica corretta è già nel repo, va solo applicata in modo uniforme.

### ♿ Accessibilità & velocità percepita

**next/image gira in modalità unoptimized ovunque: niente AVIF/WebP, formats ignorati**

- 📍 **Dove:** components/ProductCard.tsx:123; e altri 28 file confermati (grep: 29 occorrenze di `unoptimized`), tra cui components/SearchBar.tsx:203, components/home/HeroStoreCard.tsx:180, components/SimilarProducts.tsx, components/SponsoredCarousel.tsx, app/product/[id]/page.tsx; config formats in next.config.js:51
- 🎯 **Punto:** 24 - Velocità percepita / peso immagini
- 👁️ **Cosa si vede:** Verificato: ProductCard.tsx:123 ha `unoptimized` su <Image fill> e in totale 29 occorrenze di `unoptimized` in components/ e app/ (grep confermato su SearchBar:203, HeroStoreCard:180, e gli altri file citati). Con `unoptimized`, l'ottimizzatore Next viene bypassato e `formats: ['image/avif','image/webp']` in next.config.js:51 è codice morto: il browser riceve il formato originale servito dal CDN. In lib/image-url.ts le trasformazioni Supabase (buildSupabaseStorageUrl) impostano solo width/height/quality/resize e Pexels (buildPexelsUrl) imposta `auto=compress` ma NESSUNA delle due chiede WebP/AVIF: confermato che il CDN serve il formato originale a quality=75, mai AVIF/WebP. Su griglie da 12-24 foto = decine di KB extra per immagine e LCP più lento su mobile.
- 🔧 **Fix:** Togliere `unoptimized` (i remotePatterns Supabase render/object + Pexels + placehold sono già in next.config.js:33-50, quindi next/image può ottimizzare) oppure, restando su CDN diretto, aggiungere `format=webp`/`auto=format` in buildSupabaseStorageUrl e buildPexelsUrl in lib/image-url.ts. Misurare LCP prima/dopo su una pagina categoria.

**Immagine banner della home (LCP) senza priority: lazy-load di default**

- 📍 **Dove:** components/home-sections/HomeSectionRenderer.tsx:410 (banner); 438 (gallery, loading='lazy')
- 🎯 **Punto:** 24 - Velocità percepita / LCP
- 👁️ **Cosa si vede:** Verificato: il blocco `banner` (riga 410) renderizza <Image fill> in un contenitore h-56 sm:h-72 (224-288px) senza `priority` né `loading='eager'`. Per next/image le immagini fill sono lazy di default, quindi quando l'admin mette un banner in cima (tipico elemento LCP) il browser la scarica tardi e l'LCP peggiora. Stesso problema per il blocco `gallery` (riga 438) che ha esplicitamente `loading='lazy'` anche se messo above-the-fold. Da notare che ProductCard.tsx:121-122 gestisce invece correttamente priority/eager: l'incoerenza è proprio nel banner/gallery della home componibile.
- 🔧 **Fix:** Passare `priority` (o `fetchPriority='high'` + `loading='eager'`) all'<Image> del banner quando è la prima sezione. Soluzione robusta: passare al renderer l'indice di sezione e impostare priority solo sulla prima sezione visiva (banner/hero/gallery in posizione 0).

**Card prodotto: due <button> annidati dentro un <Link> (HTML non valido, ambiguità tastiera/screen reader)**

- 📍 **Dove:** components/ProductCard.tsx:102 (Link che avvolge l'intera card), 126 (button preferiti), 178 (button aggiungi al carrello)
- 🎯 **Punto:** 23 - Accessibilità / ordine di tabulazione e semantica
- 👁️ **Cosa si vede:** Verificato: l'intera card è un `<Link href={/product/${id}}>` (riga 102) e al suo interno ci sono due `<button>` interattivi, il cuore preferiti (riga 126) e l'aggiungi-al-carrello (riga 178). Annidare elementi interattivi dentro un anchor è HTML non valido: screen reader annunciano in modo ambiguo un controllo dentro un link e con tastiera l'ordine di focus è confuso (il link riceve focus su tutta l'area, poi i button interni). Col mouse funziona grazie a e.preventDefault()/e.stopPropagation() (righe 67-68, 74-75), ma resta fragile per tastiera e assistive tech.
- 🔧 **Fix:** Ristrutturare con il pattern 'card with stretched link': contenitore non interattivo + un Link 'esteso' (pseudo-overlay ::after o Link assoluto a copertura) solo su foto/titolo, tenendo i due button come fratelli del link (non discendenti) con z-index sopra l'overlay. Un solo elemento navigabile + azioni separate, niente annidamento interattivo.

**SearchBar: combobox senza semantica ARIA né navigazione da tastiera**

- 📍 **Dove:** components/SearchBar.tsx:158-168 (input con solo aria-label='Cerca'), 191-261 (dropdown <ul>/<li> senza ruoli); commento esplicito riga 32 'keyboard nav … MVP: clic'
- 🎯 **Punto:** 23 - Accessibilità / tastiera, aria/label
- 👁️ **Cosa si vede:** Verificato: l'input (righe 158-168) ha solo `aria-label='Cerca'`, manca `role='combobox'`, `aria-expanded`, `aria-controls`, `aria-autocomplete`. La lista suggerimenti è un `<ul>` semplice (riga 191) con `<li>` (es. 195) senza `role='listbox'`/`role='option'` né `aria-activedescendant`. Non c'è gestione di ArrowUp/ArrowDown per scorrere/selezionare: i suggerimenti reagiscono solo a onClick (es. 198) e il commento al codice (riga 32) ammette 'MVP: clic'. Chi usa solo tastiera o screen reader può solo premere Invio per andare a /search, perdendo del tutto l'autocomplete. È il componente più usato del sito (in ogni navbar).
- 🔧 **Fix:** Implementare il pattern WAI-ARIA combobox: input con `role='combobox' aria-expanded={open} aria-controls='search-listbox' aria-autocomplete='list'`; dropdown `<ul role='listbox' id='search-listbox'>` con `<li role='option' id=...>`; stato `activeIndex` da ArrowUp/Down, `aria-activedescendant` sull'input, Enter seleziona l'opzione attiva, Esc chiude, scroll-into-view dell'opzione attiva.

**Storie a tutto schermo: auto-avanzamento ogni 5s senza pausa/stop (WCAG 2.2.2)**

- 📍 **Dove:** components/StoryViewer.tsx:49-66 (setTimeout 5000 + progress bar 'width 5s linear'); nessun controllo pausa nei button righe 97-123
- 🎯 **Punto:** 23 - Accessibilità / contenuto in movimento e tempo
- 👁️ **Cosa si vede:** Verificato: il viewer avanza ogni 5s con `setTimeout(..., 5000)` (righe 49-52) e una progress bar animata `transition: 'width 5s linear'` (righe 57-61). Gli unici controlli sono chiudi (riga 97), precedente (riga 106) e successivo (riga 116): NON esiste alcun pulsante pausa/play. Viola WCAG 2.2.2 'Pause, Stop, Hide' (contenuto auto-aggiornato >5s deve poter essere messo in pausa). Inoltre l'auto-advance non rispetta `prefers-reduced-motion`: la transizione width parte comunque.
- 🔧 **Fix:** Aggiungere un pulsante pausa/play che fermi il setTimeout e la progress bar; mettere in pausa anche su hover/focus e a tab nascosto (visibilitychange). Se `prefers-reduced-motion: reduce`, disabilitare l'auto-advance (solo navigazione manuale).

---

## 🟡 I 56 problemi MINORI (sintesi)

Formato: **titolo** — *dove* → fix.

### 🎨 Colori & contrasto

- **Spunta verde 'step completato' del checkout su olive-500 a basso contrasto** — *components/checkout/StepIndicator.tsx:24 (done ? 'bg-olive-500 text-white')* → Portare lo stato done a bg-olive-600 text-white per uniformità con Badge 'new' e margine di contrasto, senza cambiare la semantica verde=fatto.
- **Rossi rose Tailwind sparsi in OrderTimeline, CouponInput e dettaglio ordine (stato annullato / errori)** — *components/OrderTimeline.tsx:26 (border-rose-200 bg-rose-50), :27 (bg-rose-500), :29 (text-rose-800), :30 (text-rose-600); components/checkout/CouponInput.tsx:40 e :57 (text-rose-600); app/orders/[id]/page.tsx:315 (bg-rose-50 text-rose-600), :362 (border-rose-300 text-rose-700 hover:bg-rose-50), :390 (bg-rose-600 hover:bg-rose-700), :398 (border-rose-200 bg-rose-50 text-rose-800), :433 (text-rose-700)* → Unificare tutti i rossi di errore/annullamento sulla scala secondary o sui token --danger/--status-canceled (es. bg-secondary-50, text-secondary-800, bg-secondary-600). Definire una regola: rose Tailwind vietato nel codice buyer-facing, usare secondary/danger.
- **Safelist Tailwind di scope troppo ampio abilita anche rose/pink/amber/sky/slate/indigo fuori-brand** — *tailwind.config.ts:24-29 (safelist pattern (bg|text|border)-(sky|violet|emerald|amber|indigo|rose|slate|pink|blue)-(100|200|600|700))* → Restringere la safelist alle sole classi davvero generate dinamicamente nelle dashboard admin (idealmente mappare gli stati a token primary/accent/olive/secondary), oppure isolare quei colori a un set documentato di badge di stato. Vietare rose/pink/sky/slate nel codice buyer-facing.

### 🔠 Tipografia & gerarchia

- **Prezzi del funnel resi con font display serif (Fraunces) extrabold, senza varianti tabellari** — *app/product/[id]/page.tsx:590, app/product/[id]/page.tsx:729, components/checkout/OrderSummary.tsx:77, app/cart/page.tsx:222, app/cart/page.tsx:169* → Usare il sans (Inter) con 'font-variant-numeric: tabular-nums' per i numeri-prezzo del funnel, per allineamento e leggibilità. Riservare Fraunces a titoli/eyebrow; se si vuole il tono editoriale sul prezzo hero, limitarlo a quel singolo punto e tenere sans tabellare in carrello/checkout/sticky.
- **Prezzo barrato sulla card prodotto a 11px: il segnale di risparmio è troppo piccolo** — *components/ProductCard.tsx:173* → Portare il barrato ad almeno 'text-xs' (12px), oppure aggiungere un badge di risparmio in euro/percentuale ben visibile. L'importante è che lo sconto si legga.
- **Scala dei titoli incoerente: l'H1 del prodotto (text-3xl/4xl) si sovrappone agli H2 di sezione della home (text-2xl/3xl)** — *app/product/[id]/page.tsx:541 vs components/home-sections/HomeSectionRenderer.tsx:179,211,287 e components/CollectionHeader.tsx:95 e app/globals.css:150-152* → Definire utility/classi semantiche di scala (es. .h-page, .h-section, .h-card) basate sui token --text-* esistenti e applicarle ovunque, invece di ridichiarare text-2xl/3xl/4xl a mano in ogni file. Allineare almeno: H1 pagina = una sola taglia; H2 sezione = la taglia sotto.
- **Le etichette 'Descrizione' e 'Caratteristiche' sono <h3> ma stilizzate come micro-label grigia, in conflitto con gli altri h3** — *app/product/[id]/page.tsx:678 e app/product/[id]/page.tsx:693* → Decidere un solo trattamento per i sotto-titoli di scheda (eyebrow uppercase via utility/elemento 'label' dedicato, oppure titolo serif) e mantenere h3 sempre con lo stesso aspetto. Evitare di usare h3 come decorazione minuscola in alcuni punti e come titolo in altri.
- **Il token semantico --font-display (Fraunces per h1-h3) è dichiarato ma non esposto come utility Tailwind** — *design-system/tokens/typography.css:14 (e app/globals.css:18) vs tailwind.config.ts:137-142* → Aggiungere 'display: [var(--font-serif), ...]' a fontFamily in tailwind.config.ts e usare 'font-display' sui titoli, oppure rimuovere il token --font-display se non lo si vuole usare. Allineare token semantici e utility realmente disponibili.

### 📐 Spazi, allineamento & layout

- **Ancora #posizioni con offset 96px sotto header da 144px** — *app/lavora-con-noi/page.tsx:173* → Cambiare `scroll-mt-24` in `scroll-mt-[var(--header-height)]`.
- **Offset sticky incoerenti dentro la STESSA area account** — *components/account/AccountShell.tsx:108 (`lg:top-24`) vs app/profile/settings/page.tsx:290 (`md:top-[var(--header-height)]`)* → Uniformare entrambe a `var(--header-height)`. Idealmente estrarre l'offset sticky in una utility/classe condivisa cosi' non si riallineano a mano.
- **Griglia negozi della home (StoreShowcase): ultima riga 'monca' (4 colonne, 6 negozi)** — *components/StoreShowcase.tsx:18 (.limit(6)) e :93 (grid lg:grid-cols-4)* → Allineare il limit al passo della griglia: caricare 4 (o 8) negozi per la rail home a 4 colonne, oppure cambiare la griglia a `lg:grid-cols-3` (6 = 2 righe da 3). In alternativa rendere la sezione una rail orizzontale scrollabile come i prodotti.
- **Skeleton StoreShowcase (4 card) non combacia col contenuto reale (fino a 6)** — *components/StoreShowcase.tsx:60 (skeleton length:4) vs :18+:94 (fino a 6 negozi)* → Allineare il numero di skeleton al limit reale (6) e al conteggio colonne, cosi' l'ingombro pre/post-fetch coincide.
- **CTA 'Vedi negozio' non ancorata al fondo: si disallinea tra card con e senza anteprime prodotto** — *components/StorePreviewCard.tsx:123-129 (Link CTA con `mt-4`)* → Mettere `mt-auto` sul Link CTA (riga 125) al posto di `mt-4`, cosi' il bottone e' sempre ancorato al fondo della card (gia' flex-col stretch) e i CTA si allineano su tutta la riga indipendentemente dalle anteprime.
- **Ritmo verticale incoerente tra sezioni adiacenti della home (py-6 / py-5 / py-4 / pb-2)** — *components/home-sections/HomeSectionRenderer.tsx (es. :177 py-6, :194 pb-2, :343 py-5, :369-377 py-4, :386 py-5)* → Standardizzare lo spazio inter-sezione con un valore unico (es. tutte `py-8` o gestire i gap con uno `space-y` sul contenitore in HomeSectionRenderer invece del padding per-sezione), cosi' il ritmo verticale e' costante a prescindere dall'ordine scelto dall'admin.
- **Empty-state del carrello/ordini senza padding orizzontale dal container** — *app/cart/page.tsx:51; app/orders/[id]/page.tsx:187; app/orders/[id]/review/page.tsx:102; app/lists/[id]/page.tsx:180* → Aggiungere `px-4 sm:px-6` a questi wrapper `container mx-auto`, oppure (meglio, sistemico) configurare `container: { center: true, padding: '1rem' }` in tailwind.config.ts cosi' OGNI `.container` ha un padding laterale di default.
- **Manca la configurazione `container` in Tailwind: padding laterale affidato a ogni pagina** — *tailwind.config.ts (theme.extend, nessuna chiave `container`)* → Definire in tailwind.config.ts `theme.container = { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem' } }`. Cosi' `container` centra e padda da solo, si possono rimuovere i `px-4 sm:px-6` ridondanti e nessuna pagina puo' piu' finire a filo bordo.

### 📱 Responsive & mobile

- **Padding di sicurezza in fondo al body con valore 72px hardcoded invece del token --tabbar-height** — *app/globals.css:197-199 ('@media (max-width:767px){ body{ padding-bottom: calc(72px + env(safe-area-inset-bottom,0)) } }') vs token --tabbar-height:72px (app/globals.css:116)* → Sostituire il 72px hardcoded con la variabile: 'body{ padding-bottom: calc(var(--tabbar-height) + env(safe-area-inset-bottom,0)) }'.
- **Pallini indicatore dei caroselli negozio con area toccabile di soli 8px** — *components/StoreMediaCarousel.tsx:92-102 (button dots con classe 'w-2 h-2', cioè 8x8px; attivo 'w-6')* → Mantenere il pallino visivo piccolo ma allargare l'area toccabile: avvolgere il dot in un button con padding (es. 'p-2 -m-1') o aggiungere un pseudo-elemento invisibile ('before:absolute before:-inset-2') così il bersaglio raggiunge ~24-32px senza cambiare l'estetica.
- **Chip e CTA dell'hero con altezza inferiore ai 44px (touch target) e CTA primaria/secondaria disallineate** — *components/home-sections/HomeSectionRenderer.tsx:127-141 (chip categoria 'px-3 py-1.5 text-sm') e CTA primaria righe 105-114 ('px-6 py-3' senza min-h) vs CTA secondaria righe 115-124 (con 'min-h-[48px]')* → Portare le chip ad almeno ~40-44px (es. 'py-2'/'min-h-[40px]') e aggiungere alla CTA primaria lo stesso 'min-h-[48px]' della secondaria per allinearle.

### 🖼️ Immagini & media

- **Colore dei placeholder foto incoerente tra le pagine (3 stili: 2 beige diversi + grigio fuori brand)** — *components/ProductCard.tsx:57 e components/home/DropOfDay.tsx:89 (FBF7F0/C0492C) · app/cart/page.tsx:122, components/checkout/CartGroupsList.tsx:34, app/product/[id]/page.tsx:249 (F5EDD9/78716C) · app/seller/products/page.tsx:266 e :363 (eee/aaa grigio neutro)* → Definire un unico placeholder di brand (uno solo sfondo+testo+label, es. FBF7F0/C0492C 'Foto') e centralizzarlo in una costante condivisa (es. PLACEHOLDER_IMG in lib/constants o helper placeholderImage(w,h) in lib/image-url). Sostituire tutte le 6 occorrenze, in particolare i due placehold.co eee/aaa lato venditore.
- **Colore del terracotta di brand incoerente tra manifest, icone PWA e Open Graph** — *public/manifest.json:8 (theme_color '#C0492C') e app/layout.tsx:71 (themeColor '#C0492C') vs public/icon-192.svg:4-5 / public/icon-512.svg:4-5 (gradiente '#D55F3F' -> '#A03B25') vs app/store/[id]/opengraph-image.tsx:44 (background '#D55F3F'->'#A03B25'), :51 (accent '#F4BC53') e :71 ('#A03B25')* → Fissare un'unica coppia di valori brand (primary #C0492C + accent giallo) come fonte di verita e allinearvi tutti i touchpoint: o aggiornare gli stop del gradiente nelle SVG icona (e i PNG generati) e dell'OG verso #C0492C, o riportare theme_color/themeColor allo stesso terracotta del gradiente.
- **Immagini sotto-dimensionate nelle rail prodotti: thumb 100px in slot 128-160px (foto morbide/sgranate)** — *components/SponsoredCarousel.tsx:99 (slot w-32 sm:w-36 ~128-144px, sizedImage 'thumb'=100px) · components/SimilarProducts.tsx:110 (griglia fino a ~160px, 'thumb') · components/RecentlyViewed.tsx:84 (card w-36 sm:w-40 ~144-160px, 'thumb')* → Usare sizedImage(img, 'card') (400px) invece di 'thumb' in SponsoredCarousel.tsx:99, SimilarProducts.tsx:110 e RecentlyViewed.tsx:84, dove il riquadro renderizzato e >= ~128px. Riservare 'thumb' (100px) ai veri micro-slot (44-48px: SearchBar, righe ordine, anteprime venditore).
- **Scheletro StoreShowcase con proporzione diversa dalla cover reale della card negozio (mini-CLS)** — *components/StoreShowcase.tsx:62 (skeleton 'aspect-[4/3]') vs components/StorePreviewCard.tsx:57 (StoreMediaCarousel heightClass 'h-28' = 112px)* → Allineare lo scheletro all'altezza reale della cover: usare 'h-28' (o aspect coerente con 112px) al posto di 'aspect-[4/3]' nel placeholder di StoreShowcase.tsx:62, cosi lo scheletro occupa esattamente lo spazio della cover reale.
- **Anteprime backoffice caricano la foto a piena risoluzione (<img> grezzo senza sizedImage)** — *components/seller/ProductForm.tsx:897 (anteprima 'come la vede il cliente', riquadro max-w-[16rem] aspect-square ~256px) · app/admin/products/page.tsx:120 (slot w-10 h-10 = 40px) · components/seller/site/SitePreview.tsx:254 (celle grid-cols-3 aspect-square)* → Avvolgere gli src con sizedImage(): 'card' per l'anteprima ProductForm (256px) e 'thumb' per admin/products (40px) e per le celle SitePreview, importando sizedImage da '@/lib/image-url'. I riquadri sono gia aspect-square/overflow-hidden, nessuna deformazione. Nota: per i blob/data URI in upload sizedImage li restituisce invariati, quindi nessuna regressione.

### 🧩 Coerenza & design system

- **CTA scure off-system in charcoal (bg-ink-900) non previste dal Button primitive** — *components/StorePreviewCard.tsx:125 ("Vedi negozio", rounded-xl bg-ink-900 hover:bg-ink-800) · app/product/[id]/page.tsx:782 ("Compra ora", rounded-lg bg-ink-900 hover:bg-ink-800)* → Decidere se la CTA scura e' un pattern ufficiale: in tal caso aggiungere una variante (es. 'dark') al Button primitive e usarla; altrimenti rimappare queste CTA su una variante esistente. Uniformare anche il raggio.
- **Stella di rating come glifo unicode ★ in accent-700 invece del componente RatingStars (Lucide, accent-500)** — *app/product/[id]/page.tsx:820 (<span className="text-accent-700">★</span>) vs componente canonico components/ui/RatingStars.tsx:32-35 (Star Lucide, fill-accent-500 text-accent-500)* → Sostituire il ★ unicode di riga 820 con <RatingStars rating={avgRating} /> o almeno con un'icona Star Lucide in fill-accent-500, allineando colore e forma alle altre stelle.
- **Stato danger reso in rose-* invece del token danger (red-600) del design system** — *Token: design-system/tokens/colors.css:112 (--danger: #DC2626 red-600) e components/ui/Button.tsx:29 (danger = bg-red-600 hover:bg-red-700). Deviazioni rose VERIFICATE: app/checkout/page.tsx:734,746,771 · components/OrderTimeline.tsx:26,27,29,30 · components/VerifyCodeDialog.tsx:94 · components/ConfirmDialog.tsx:96,100,158 · components/checkout/CouponInput.tsx:40,57* → Centralizzare il danger su red-600 come da token: sostituire le classi rose-* dei messaggi/bottoni distruttivi con red-* (red-600/red-700 forte, red-50/red-200 tenui), allineandole al Button variant='danger' e al token --danger.

### 🔄 Stati & feedback

- **La vetrina negozio mostra DUE stati di caricamento diversi in sequenza (skeleton del loading.tsx poi spinner nudo del client)** — *app/store/[id]/loading.tsx:1-13 (skeleton hero+griglia, animate-pulse) seguito da app/store/[id]/page.tsx:29-34 `<LoadingState />` (spinner)* → Allineare il loading interno del client component allo stesso skeleton (variant='cards'/SkeletonGrid) usato da loading.tsx, oppure non rimostrare un loader full-screen se la pagina è già stata 'disegnata' dallo skeleton.
- **Stato 'carrello vuoto' del checkout reso come testo grezzo, non con il componente EmptyState brandizzato** — *app/checkout/page.tsx:582-589 (`<p>Il tuo carrello è vuoto.</p>` + <Button href="/">)* → Usare il componente EmptyState (icona ShoppingCart, titolo, descrizione, CTA 'Esplora i prodotti') anche nel checkout, riallineandolo alla pagina carrello.
- **Il bottone di submit di NewsletterForm mostra un '…' invece di uno spinner e senza aria-busy** — *components/NewsletterForm.tsx:79-89 (`{loading ? '…' : t('subscribe')}` a riga 88, nessun aria-busy sul <button>)* → Sostituire '…' con un Loader2 `animate-spin` (o usare il componente Button con prop `loading`) e aggiungere `aria-busy={loading}`.
- **Il pulsante 'Crea' nuova lista non dà feedback di caricamento mentre la mutation è in corso; i toggle lista non hanno stato pending** — *components/AddToListButton.tsx:164-171 ('Crea': disabled su `createAndAdd.isPending` ma nessun spinner/testo) ; bottoni toggle lista righe 138-147 (nessuno stato pending/disabled)* → Aggiungere uno spinner/`aria-busy` al bottone 'Crea' durante `createAndAdd.isPending` e disabilitare il singolo bottone lista durante `toggle.isPending` (piccolo Loader2 sulla riga interessata).
- **Due componenti ErrorState diversi con API incoerenti (onRetry vs retry): rischio regressione e doppio standard** — *components/ErrorState.tsx (default export, prop `onRetry`, niente i18n) vs components/ui/ErrorState.tsx (named export `ErrorState`, prop `retry`, i18n + backHref/supportHref). Consumatori 'onRetry': ProductGrid.tsx:302, app/product/[id]/page.tsx:215, app/favorites/page.tsx:56, app/orders/page.tsx:157, app/stores/page.tsx:143, StoreShowcase.tsx:79. Consumatori 'retry': i route error.tsx (app/error.tsx:34, app/checkout/error.tsx:24, app/store/[id]/error.tsx:23, ecc.)* → Consolidare in un unico ErrorState (o far reesportare quello in components/ root come wrapper di quello ui/) con un'unica API di retry. Allineare impronta visiva e i18n.
- **Coesistenza di classi di animazione duplicate (animate-slideUp legacy vs animate-slide-up Tailwind / animate-popIn vs animate-pop-in)** — *app/globals.css:173-175 definisce .animate-fadeIn/.animate-popIn/.animate-slideUp; tailwind.config.ts:178-181 definisce animate-slide-up/pop-in/fade-in. Uso misto: ConfirmDialog.tsx:105,112 e app/seller/orders/[id]/page.tsx:80,87 usano i nomi legacy (animate-slideUp/popIn/fadeIn); StickyAddToCart.tsx:54, ui/Modal.tsx:109,119, components/orders/ContactSheet.tsx:79,87, PWAInstallBanner.tsx:73, BuyerOnboardingTour.tsx:76 usano i nomi Tailwind (animate-slide-up/fade-in)* → Unificare su un'unica sorgente (preferire i token Tailwind animate-slide-up/pop-in/fade-in) e migrare ConfirmDialog.tsx e app/seller/orders/[id]/page.tsx ai nomi kebab-case; poi rimuovere le classi legacy da globals.css.
- **ConfirmDialog: autoFocus sul bottone di conferma anche nei dialog distruttivi + Enter conferma di default** — *components/ConfirmDialog.tsx:75 (Enter → closeWith(true)) e :152-163 (bottone conferma con `autoFocus` a riga 155, anche quando `danger` è true)* → Quando `danger`, spostare l'autoFocus sul bottone 'Annulla' (riga 145-151) e/o non mappare Enter sulla conferma distruttiva (richiedere il click esplicito). Mantenere il comportamento attuale solo per i dialog non distruttivi.
- **Il loading root promette 'prodotti vicino a te' anche fuori dalla home, creando un messaggio fuori contesto** — *app/loading.tsx:11-16 (LoadingState variant='cards' con message 'Stiamo caricando…' + description 'Prepariamo i prodotti dei negozi vicino a te.')* → Rendere il messaggio del loading root neutro (solo 'Stiamo caricando…', senza la description orientata ai prodotti), oppure aggiungere loading.tsx dedicati alle sezioni non-catalogo così non ereditano la griglia di card.
- **Stato vuoto di /stores reso con markup ad-hoc invece del componente EmptyState (no CTA per azzerare i filtri)** — *app/stores/page.tsx:214-218 (div 'Nessun negozio trovato con questi filtri.' con icona Search ma SENZA azione) — confronta con lo stato vuoto azionabile di ProductGrid.tsx:314-337 ('Azzera filtri')* → Usare EmptyState (o lo stesso blocco di ProductGrid) con un pulsante 'Azzera filtri' che resetti search/onlyOpen/sort/categoryId, per dare una via d'uscita coerente con il resto dell'app.

### 🧭 Navigazione & menu

- **Nessun ingresso diretto a /categorie dalla navigazione principale (header e footer): pagina raggiungibile solo da breadcrumb e contenuti editoriali** — *app/categorie/page.tsx esiste; linkata solo da app/category/[slug]/page.tsx:130 (breadcrumb), components/home-sections/HomeSectionRenderer.tsx:106, components/home/HowItWorks.tsx:88, app/come-funziona/page.tsx:79. CategoryBar.tsx:92-106 (il bottone 'Tutte le categorie' apre solo la tendina, non linka /categorie) e Footer.tsx:138-149 (sezione 'Categorie' = 5 reparti hard-coded, nessun link a /categorie)* → Aggiungere un link esplicito a /categorie: nel mega-menu della CategoryBar (voce 'Tutte le categorie →' accanto a 'Tutti i negozi'/'Tutti i prodotti', CategoryBar.tsx:139-146) e nel footer (sezione Categorie). Su mobile usarlo come destinazione della (eventuale) tab/voce Categorie.
- **Componente di navigazione duplicato e morto: CategoriesDropdown (stile scuro Amazon) mai usato, fuori dalla design system attuale** — *components/CategoriesDropdown.tsx (nessun import in tutto il repo tranne il file stesso) — usa 'bg-ink-800 hover:bg-ink-700' (:64), fuori dalla palette terracotta della navbar reale (CategoryBar usa primary-700/accent)* → Rimuovere components/CategoriesDropdown.tsx (dead code) oppure, se serve un dropdown leggero alternativo, riallinearlo ai token della navbar (primary-700/accent) e centralizzarlo come variante di CategoryBar. Evitare due fonti di verità per il menu categorie.
- **Carrello incoerente nell'header tra desktop e mobile per gli ospiti (guest)** — *components/Navbar.tsx:106 (desktop guest: <CartButton /> mostrato) vs Navbar.tsx:182-184 (mobile guest: solo link 'Accedi', nessuna icona carrello); il badge mobile per il buyer (:172-181) usa uno stile diverso dal CartButton desktop (:221-236)* → Mostrare l'icona carrello nell'header mobile anche per l'ospite (stesso criterio del desktop, dato che il conteggio è locale), oppure uniformare la scelta affidando il carrello solo alla MobileTabBar in modo coerente tra guest e buyer. Allineare lo stile del badge a quello desktop.
- **Testi della navigazione hardcoded in italiano in Navbar/CategoryBar/Footer mentre la MobileTabBar è già tradotta (i18n): stessa barra divergente desktop vs mobile in locale EN** — *components/Navbar.tsx:107-109 ('Accedi'/'Registrati'), :131-146 ('Ordini'/'Consegne'/'Admin'); components/CategoryBar.tsx:22-29 (DESTINATIONS: 'Tutti i negozi','Promozioni','Novità'...) e :104 ('Tutte le categorie'); Footer.tsx (etichette IT fisse) — contro components/MobileTabBar.tsx:35,84-97 che usa useTranslations('nav') con chiavi presenti in messages/it.json e en.json (namespace 'nav')* → Far passare anche Navbar, CategoryBar (etichette DESTINATIONS e 'Tutte le categorie') e Footer da useTranslations con le chiavi già presenti nel namespace 'nav' (aggiungendo le mancanti). In alternativa, finché la migrazione è congelata, documentare che la navigazione è IT-only per evitare il drift. L'importante è che le voci della stessa funzione non siano per metà tradotte e per metà no.

### 🛒 Flussi, CTA & conversione

- **Badge 'Sped. gratis' su card e scheda prodotto basato sul prezzo del singolo articolo, non sull'ordine** — *components/ProductCard.tsx:97 (freeShipping = price >= FREE_SHIPPING_THRESHOLD) + badge :162-166; stessa logica in app/product/[id]/page.tsx:268 e :730-732* → Mostrare il badge solo come 'Spedizione gratis sopra €30' (informativo, non come stato del prodotto), oppure usare la barra FreeShippingProgress già esistente al posto del badge binario sulla card. Allineare a un'unica fonte di verità sulla soglia.
- **Riepilogo del checkout senza la dicitura 'IVA inclusa' presente invece nel carrello** — *components/checkout/OrderSummary.tsx:75-78 (riga Totale senza nota IVA) vs app/cart/page.tsx:223 ('IVA inclusa')* → Aggiungere 'IVA inclusa' sotto/accanto al Totale in OrderSummary.tsx, identico al carrello, per coerenza e trasparenza nel momento del pagamento.
- **Doppia numerazione di step sul checkout: StepIndicator '2/3' + tre StepCard numerate 1-2-3** — *app/checkout/page.tsx:606 (StepIndicator currentStep=2: Carrello/Indirizzo/Conferma) + StepCard n=1/2/3 alle righe 622, 634, 674 (Indirizzo / Quando vuoi riceverlo / Come paghi)* → Disambiguare: togliere i numeri dalle StepCard (solo icona+titolo) oppure rinominare il StepIndicator per non collidere con la numerazione interna. Una sola gerarchia di step visibile per volta.
- **'Compra ora' salta la revisione del carrello e va dritto al checkout (rischio di pagare anche articoli già nel carrello)** — *app/product/[id]/page.tsx:330-347 (handleBuyNow → addToCart + router.push('/checkout'))* → O 'Compra ora' crea un checkout solo-per-questo-prodotto (express buy isolato), oppure mostra un breve riepilogo del carrello completo prima della conferma. Almeno chiarire nel checkout che si sta acquistando l'intero carrello.
- **Città e CAP del checkout pre-compilati e fissi su 'Piacenza'/'29121' senza segnalazione di modificabilità** — *app/checkout/page.tsx:258 (city: 'Piacenza', zip: '29121') + components/checkout/ShippingAddressForm.tsx:153-172 (campi city/zip)* → Mantenere il default ma renderlo evidentemente modificabile (placeholder/hint 'Consegniamo a Piacenza e dintorni — modifica se serve'), oppure validare che CAP e città siano coerenti con l'area servita prima di accettare l'ordine.
- **Scheda prodotto desktop: il prezzo è ripetuto in due punti vicini, con la versione nella card CTA meno completa (senza prezzo barrato/sconto)** — *app/product/[id]/page.tsx:590-599 (prezzo 4xl nel blocco info, con compare-at + 'IVA inclusa') e :729 (stesso prezzo 2xl in cima alla card CTA sticky, senza compare-at)* → Nella card CTA sticky togliere la riga prezzo duplicata, oppure renderla coerente con compare-at/sconto del blocco principale. In alternativa, mostrare il prezzo nella card CTA solo quando il blocco principale è scrollato fuori vista.
- **StickyAddToCart e MobileTabBar condividono lo stesso z-index (z-30 grezzo), affidandosi solo all'offset bottom** — *components/StickyAddToCart.tsx:54 (z-30) + :55 (bottom = env(safe-area)+var(--tabbar-height)) vs components/MobileTabBar.tsx:156 (z-30); token zIndex 'mobile-nav':30 e 'overlay':40 in tailwind.config.ts:129-131* → Assegnare a StickyAddToCart un z-index esplicitamente sopra la tab bar usando i token (es. z-overlay/40) mantenendo l'offset bottom. Usare i token zIndex del design system invece dei valori numerici grezzi.

### ✍️ Microcopy

- **Puntini di sospensione incoerenti: '...' (tre punti ASCII) sui bottoni auth invece di '…' usato ovunque** — *app/sign-in/page.tsx:176 ('Accesso in corso...'); app/sign-up/page.tsx:198 ('Registrazione in corso...'); app/contact/page.tsx:139 ('Invio in corso...'); app/profile/settings/page.tsx:590 ('Invio richiesta...')* → Sostituire i tre punti ASCII con il carattere ellissi: 'Accesso in corso…', 'Registrazione in corso…', 'Invio in corso…', 'Invio richiesta…'. Allinea alla convenzione di messages/it.json.
- **Anglicismo evitabile: 'Continua lo shopping' nel carrello (e 'Upload fallito')** — *app/cart/page.tsx:185 ('← Continua lo shopping'); components/PhotoReviewUpload.tsx:69 ('Upload fallito')* → '← Continua lo shopping' → '← Continua a fare acquisti' oppure '← Torna a esplorare'. 'Upload fallito' → 'Caricamento non riuscito. Riprova.'
- **Codice migration tecnico mostrato all'admin nel messaggio d'errore** — *app/admin/users/page.tsx:283 (error.message grezzo) e :286 (nome file migration '021_seller_kyc_and_approval.sql' nel testo UI)* → Passare error in friendlyError() e spostare il riferimento alla migration in un log/console o nota tecnica nascosta. Mostrare all'admin un'azione concreta ('Riprova' / 'Contatta lo sviluppatore') senza nomi di file SQL.
- **Email placeholder incoerenti tra le form ('la-tua@email.it' vs 'mario@example.com')** — *messages/it.json:159 newsletter.placeholder ('la-tua@email.it') [config/testi]; app/profile/settings/page.tsx:324 ('nuova-email@example.com'); app/profile/gift-cards/page.tsx:207 ('mario@example.com'); components/SellerApplicationForm.tsx:236 ('negozio@example.com') [hardcoded in TSX]* → Scegliere una convenzione unica. Coerente col brand locale: 'la-tua@email.it' / 'mario.rossi@email.it' ovunque, oppure standardizzare su 'nome@example.com'. Evitare il mix .it personalizzato + example.com nella stessa esperienza.

### ♿ Accessibilità & velocità percepita

- **Skeleton card non combacia con la card reale: layout shift (CLS) al caricamento** — *components/SkeletonCard.tsx:3 (immagine h-48 fissa) vs components/ProductCard.tsx:115 (immagine aspect-square) e 150 (titolo 2 righe min-h-[2.6em]); ProductGrid.tsx:11,284,291 usa SkeletonCard/SkeletonGrid* → Allineare SkeletonCard a ProductCard: `aspect-square` per l'area foto (al posto di h-48) e replicare il corpo (riga negozio mini, titolo 2 righe, riga prezzo+bottone), facendolo convergere sulla forma già usata in LoadingState 'cards'.
- **MobileTabBar: tab attivo solo visivo, manca aria-current per screen reader** — *components/MobileTabBar.tsx:189 (Link senza aria-current); stato attivo solo via classe colore + barretta riga 146* → Aggiungere `aria-current={pathActive ? 'page' : undefined}` sul Link delle tab (riga 189).
- **Stepper quantità sticky add-to-cart sotto la soglia 44px** — *components/StickyAddToCart.tsx:80 e 90 (button w-9 h-9 = 36px)* → Portare i due button dello stepper ad almeno `h-11 w-11` (44px) o aumentare il padding dell'area cliccabile mantenendo l'icona piccola, allineandoli alla soglia 44px già usata in ProductCard.
- **Immagini informative con alt vuoto nella lista ordini (logo negozio e foto prodotto)** — *app/orders/page.tsx:216 (logo negozio alt='') e 246 (foto prodotto alt=''); dati disponibili a portata: order.seller.store_name (riga 221) e it.products?.name (riga 241)* → Nella lista ordini dare alt parlante: logo `alt={order.seller?.store_name}` (riga 216), miniatura `alt={it.products?.name}` (riga 246). Lasciare alt='' solo dove il nome è sempre presente come testo adiacente nello stesso blocco.
- **Miniature con <img> grezzo senza width/height: rischio CLS nei contenitori non vincolati** — *app/orders/[id]/page.tsx:554,584; components/StoreMediaManager.tsx:107; components/rider/CashConfirmDialog.tsx:166 (wrapper h-24 con larghezza percentuale); components/seller/ProductImagesField.tsx:169 (wrapper aspect-square); anche app/orders/page.tsx:216,246* → Dove si resta su <img> nativo aggiungere sempre `width`/`height` espliciti coerenti col box (es. width={48} height={48}) oltre a `loading='lazy' decoding='async'`. Meglio ancora migrare a next/image con dimensioni note.

---

## ✅ Prossimi passi consigliati

1. **Approva un primo "sprint pulizia"** sui 6 temi qui sopra (corsia codice 🟡): la squadra tech/frontend li fa in un branch, con anteprima Vercel, e tu approvi prima del merge.
2. Ordine consigliato per ritorno: **tema 1 (colori funnel)** e **tema 4 (prezzo/CTA acquisto)** prima — toccano fiducia e conversione; poi **2-3-5** (sticky, skeleton, contrasto); infine **6** (chiusura design system).
3. Per sistemare un singolo punto, dimmi: *"sistema [il punto]"* (es. *"sistema i colori del checkout"*) e parto solo su quello.

> Nota di metodo: i `0 bloccanti` non significano "niente da fare", ma che **nessun difetto impedisce di comprare**. I 36 gravi sono il vero lavoro di qualità. Tutto verificato su `file:riga` reali del commit `97dffe8`.
