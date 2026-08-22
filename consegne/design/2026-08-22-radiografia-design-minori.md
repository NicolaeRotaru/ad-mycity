---
data: 2026-08-22 16:30
tipo: radiografia-design-minori
referto_principale: consegne/design/2026-08-22-radiografia-design.md
problemi: 120
---

# Radiografia del design: i 120 problemi minori

**In due righe.** Questi sono i problemi minori trovati dalla radiografia del 22
agosto: imperfezioni che si vedono, ma che non fermano nessuno e non costano
vendite. I 2 bloccanti e le 86 gravi stanno nel referto principale.

**Cosa devi fare:** niente. Questa e' una lista di lavoro, non una richiesta.
Serve quando c'e' tempo per la rifinitura, dopo che i bloccanti e le gravi sono
chiusi.

## Dettagli tecnici

Da qui in giu' e' l'elenco per chi ripara: ogni voce col file, la riga, cosa c'e'
che non va e come si sistema. Quello che serve a te l'hai gia' letto sopra.

## I 120 minori

### Il menu laterale dell'area cliente si incolla troppo in alto e finisce sotto la barra del sito

**Dove:** `components/account/AccountShell.tsx:108 e components/ui/LegalLayout.tsx:78 (entrambi lg:sticky lg:top-24)` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO come incoerenza interna, non come stima di pixel. Le due colonne si fermano a 96px dal bordo (`lg:top-24`), mentre l'intestazione del sito e' `md:sticky md:top-0` (Navbar.tsx:89) e il progetto stesso dichiara la sua altezza in --header-height = 9rem = 144px (app/globals.css:107), valore usato da tutte le altre colonne sticky (search:304, category:337, cart:358, checkout:1020, product:851, profile/settings:310). Con 96 contro 144, scorrendo, i primi ~48px del menu account — angolo arrotondato, bordo e prima voce — passano sotto l'intestazione e non sono piu' cliccabili. Identico sull'indice laterale delle pagine legali. Severita' abbassata da grave a minore: e' un'occlusione parziale su desktop, non un blocco del percorso d'acquisto.

**Come si ripara:** Sostituire `lg:top-24` con `lg:top-[var(--header-height)]` in entrambi i file, cosi' l'altezza dell'intestazione ha una casa sola.

### Nel costruttore della vetrina l'anteprima scorre sotto la barra del pannello venditore

**Dove:** `components/seller/site/SitePreview.tsx:51, usata da components/seller/site/PageEditor.tsx:117 dentro components/seller/SellerShell.tsx:333` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO nel rapporto fra i due valori (l'altezza esatta della barra non l'ho misurata a schermo). L'anteprima e' `lg:sticky lg:top-4`, cioe' si ferma a 16px dal bordo, mentre la barra dell'area venditore e' `sticky top-0 z-sticky` (SellerShell.tsx:333) con `px-4 py-3` e dentro un campo di ricerca: 24px di padding piu' l'altezza dell'input, quindi ben oltre 16px in qualunque conto. L'anteprima non ha z-index proprio, la barra ha z-sticky: scorrendo, la barra le passa sopra e copre il bordo superiore dell'anteprima. Severita' abbassata da grave a minore: strumento interno, contenuto solo parzialmente coperto.

**Come si ripara:** Introdurre una variabile --seller-topbar-height scritta da SellerShell (come si fa gia' con --header-height sul sito pubblico) e usarla qui al posto di `lg:top-4`.

### Sulla dashboard del negoziante l'incasso esce dal suo riquadro sopra i cento euro

**Dove:** `app/seller/dashboard/page.tsx:249 (grid grid-cols-3) e :324-331 (HeroStat)` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO con una correzione. I tre riquadri sono `grid grid-cols-3 gap-2.5 sm:gap-3` senza alcuna variante responsive, dentro un hero `p-6 sm:p-8` dentro un main `px-4` (SellerShell.tsx:401). A 360px: 360 - 32 - 48 = 280px, meno 20px di spazi diviso 3 = ~87px per riquadro; tolto il px-3 di HeroStat restano ~63px. Il valore e' `text-lg font-bold` (18px) e formatPrice (lib/format.ts:1) produce «€234.56», una parola sola senza punti di rottura: con Inter misura ~70px, «€1234.56» ~81px. Il numero esce quindi dal riquadro semitrasparente e va a sovrapporsi al bordo del riquadro accanto (il gap e' 10px). Correggo il collega su un punto: il testo NON viene tagliato dall'overflow-hidden dell'hero (riga 201), perche' fra l'ultimo riquadro e il bordo restano i 24px del p-6; il difetto e' lo sbordo, non il taglio. Per questo scendo da grave a minore.

**Come si ripara:** Rendere responsive la griglia (`grid-cols-1 sm:grid-cols-3`, oppure `grid-cols-2 sm:grid-cols-3` col terzo a tutta larghezza) e ridurre il corpo sul telefono (`text-base sm:text-2xl`); in aggiunta far usare a formatPrice il formato italiano. Verificare a 360px con un valore a quattro cifre.

### Le schede finte del caricamento non hanno la forma di quelle vere: la griglia si riassesta due volte

**Dove:** `components/SkeletonCard.tsx:3 e :17 contro components/ProductCard.tsx:153 e components/ProductGrid.tsx:496-499` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO, due scarti leggibili nei file. Altezza: la scheda finta ha la foto `w-full h-48` (192px fissi), la card vera usa `aspect-square` (ProductCard.tsx:153), quindi la foto e' alta quanto la card e' larga — 156px in griglia a due colonne su 360px, 160px nelle rail w-40. A prodotti caricati ogni riga si accorcia di circa 34px. Colonne: SkeletonGrid si ferma a `md:grid-cols-4` mentre la griglia vera (ProductGrid.tsx:499, ramo default) arriva a `lg:grid-cols-5 xl:grid-cols-6`: su un monitor largo si passa da 4 colonne di segnaposti a 6 di prodotti.

**Come si ripara:** Allineare i due componenti: `aspect-square` al posto di `h-48` nella scheda finta, e in SkeletonGrid le stesse classi di colonna della griglia vera (lg e xl compresi), meglio estraendo la stringa delle colonne in una costante condivisa.

### La barra dei tre passi del checkout va a capo su tutti i telefoni

**Dove:** `components/checkout/StepIndicator.tsx:19-33 e :56-68, usata in app/checkout/page.tsx:833 e app/cart/page.tsx:192` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. Il contenitore e' `flex items-center justify-center gap-4 sm:gap-8 mb-8 flex-wrap` e ogni passo e' avvolto in un `flex items-center gap-4 sm:gap-8` che tiene insieme il passo e il trattino `w-8`. Ogni passo e' pallino w-7 h-7 + gap-2 + etichetta text-sm. A 14px con Inter i tre blocchi misurano circa 142 + 150 + 94 px, piu' 32px di spazi esterni: oltre 400px contro i 328 disponibili a 360px di schermo e i 358 a 390px. Il terzo blocco va a capo e in fondo alla prima riga resta un trattino sospeso. Succede sia nel carrello (currentStep 1) sia nel checkout (currentStep 2).

**Come si ripara:** Nascondere i trattini sul telefono (`hidden sm:block` sul div di riga 67) e stringere gli spazi (`gap-2 sm:gap-8`), oppure sostituire l'indicatore con la forma compatta «Passo 2 di 3» sotto i 640px.

### Toccando «N recensioni» sul telefono il titolo si ferma con 144px di vuoto sopra

**Dove:** `app/product/[id]/page.tsx:950 (scroll-mt-[var(--header-height)]) e :699 (il link) contro components/Navbar.tsx:89` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO, ma solo per meta' del rilievo del collega. La parte che tengo: la sezione recensioni ha `scroll-mt-[var(--header-height)]` (riga 950), cioe' 144px di margine di scorrimento a tutti i breakpoint, e il link `<a href="#recensioni">` di riga 699 e' visibile anche su telefono; ma l'intestazione e' `relative md:sticky md:top-0` (Navbar.tsx:89), quindi sotto md NON e' fissa e quel margine diventa vuoto inutile (con scroll-behavior: smooth attivo, globals.css:130). La parte che SCARTO: che --header-height (9rem) sia piu' bassa dell'intestazione vera di 5-9px non l'ho potuto confermare leggendo il codice — dipende dal rendering reale dei font e va misurata a schermo, non dedotta.

**Come si ripara:** Usare uno scroll-margin che valga zero dove l'intestazione non e' fissa: `scroll-mt-4 md:scroll-mt-[var(--header-height)]` sulla sezione di riga 950.

### In fondo a ogni pagina mobile restano ~14px di vuoto: l'altezza della barra a schede e' dichiarata piu' alta di quella vera

**Dove:** `app/globals.css:117 e :207-209 (--tabbar-height: 72px) contro components/MobileTabBar.tsx:139-142 e :169` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. La variabile vale 72px e regola il padding inferiore del body sotto i 768px (globals.css:207-209), l'offset di StickyAddToCart (riga 57) e quello del banner cookie. La barra vera: `tabClass` (MobileTabBar.tsx:140) e' `flex flex-col items-center justify-center gap-0.5 py-2`, dentro icona 22px e etichetta text-[11px] con interlinea ereditata 1.5, piu' il bordo superiore della nav (riga 169) — circa 58px in tutto. Ne segue una striscia vuota di ~14px in fondo a tutte le pagine mobile e una barra d'acquisto che galleggia sopra la barra a schede invece di appoggiarcisi.

**Come si ripara:** Portare --tabbar-height a 3.5rem, oppure farla scrivere da MobileTabBar misurando la propria altezza reale, come gia' fatto per --altezza-banner-cookie.

### Su iPhone lo spazio della barra di sistema viene contato due volte sotto le barre d'acquisto

**Dove:** `components/StickyAddToCart.tsx:54 e :57; app/checkout/page.tsx:1071-1073` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO in entrambi i punti. In StickyAddToCart il contenitore ha la classe `pb-safe` (che in globals.css:198 applica padding-bottom: env(safe-area-inset-bottom)) e insieme lo stile inline `bottom: calc(env(safe-area-inset-bottom, 0px) + var(--tabbar-height) + var(--altezza-banner-cookie, 0px))`. La barra di conferma del checkout ha sia `pb-[calc(0.75rem+env(safe-area-inset-bottom))]` sia `bottom: calc(env(safe-area-inset-bottom, 0px) + var(--altezza-banner-cookie, 0px))`. Su un iPhone con 34px di safe area la barra viene sollevata di 34px e ne aggiunge altri 34 di padding interno: sotto la card resta circa il doppio del vuoto previsto.

**Come si ripara:** Contare la safe area una volta sola: togliere `pb-safe` da StickyAddToCart (riga 54) lasciando il calcolo nell'offset, e nella barra del checkout togliere env(safe-area-inset-bottom) dal padding lasciando il py-3.

### La vetrina del negozio sborda di 8px per lato e fa comparire lo scorrimento orizzontale sui tablet

**Dove:** `components/store-sections/CollectionSection.tsx:70 dentro app/store/[id]/page.tsx:109 e app/store/[id]/[slug]/page.tsx:69` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. La riga scorrevole della collezione usa `-mx-4 px-4 sm:-mx-6 sm:px-6`, schema corretto solo se il contenitore ha `px-4 sm:px-6` (come ProductGrid.tsx:477). Le due pagine vetrina usano invece `container mx-auto px-4 py-6 max-w-5xl`, con px-4 a tutti i breakpoint. Da 640px in su la riga si allarga di 24px per lato mentre il contenitore ne ha 16: 8px di sbordo per lato. Il progetto non personalizza `container` in tailwind.config.ts, quindi a 640, 768 e 1024px il container coincide col viewport e non c'e' margine che assorba lo sbordo; ne' html ne' body hanno overflow-x hidden, quindi lo scorrimento e' reale.

**Come si ripara:** Allineare le due classi: `px-4 sm:px-6` sul contenitore delle due pagine store, oppure togliere la variante sm dalla riga scorrevole lasciando `-mx-4 px-4`.

### Le schede della vetrina («Prodotti · N», «Info & orari», «Recensioni · N») si spezzano su due righe

**Dove:** `components/store-sections/SectionRenderer.tsx:163 (tablist) e :180 (bottoni)` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. Il tablist e' `flex gap-1 border-b border-cream-300`, senza flex-wrap e senza overflow-x-auto, e ogni scheda e' `-mb-px border-b-2 px-4 py-2.5 text-sm` senza whitespace-nowrap. Le etichette portano i conteggi (tabLabel, righe 115-119: «Recensioni · N», «Prodotti · N»). Con tre schede attive la larghezza naturale supera i 380px, contro i 328 disponibili a 360px di schermo e i 358 a 390px: i bottoni si comprimono e l'etichetta va a capo dentro la scheda, lasciando una barra a due righe disallineata. Sopra i ~400px il problema sparisce.

**Come si ripara:** Rendere la barra scorrevole come le altre del sito: `overflow-x-auto scrollbar-hide` sul tablist e `whitespace-nowrap shrink-0` sui bottoni — lo stesso schema di components/store-sections/StoreNav.tsx:15.

### Nella ricerca su telefono i pulsanti Ordina e Filtri compaiono sopra il titolo della pagina

**Dove:** `app/search/page.tsx:301-325 contro app/category/[slug]/page.tsx:314-318` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. La ricerca e' una griglia `grid-cols-1 md:grid-cols-4` (riga 301): il primo figlio e' l'aside dei filtri, `hidden` sotto md (riga 304); il secondo e' il blocco `md:hidden` coi due pulsanti allineati a destra (riga 324); solo il terzo (riga 432) contiene briciole di pane, titolo e conteggio. Su telefono si vedono quindi due pulsanti sospesi prima di sapere su che pagina si e'. La pagina categoria fa il contrario: `<div className="md:col-span-4">{header}</div>` a riga 318, prima dell'aside e dei pulsanti. Due pagine gemelle che si comportano in modo diverso.

**Come si ripara:** Spostare il blocco dei pulsanti dopo il blocco risultati, o dargli `order-2` con `order-1` sul blocco risultati, allineando la ricerca al comportamento gia' corretto della categoria.

### Il piede di pagina non e' allineato col resto del sito sul telefono

**Dove:** `components/Footer.tsx:99 (px-6) contro le pagine pubbliche (px-4 sm:px-6)` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. Il contenitore del piede e' `container mx-auto px-6 py-12 grid ...` (riga 99): 24px di margine laterale a tutti i breakpoint. Le pagine pubbliche usano `px-4 sm:px-6` (search:301, category:314, cart:189, checkout, store, home): 16px sul telefono. Sotto i 640px il testo del piede e' quindi rientrato di 8px rispetto a tutto quello che sta sopra, e il bordo sinistro dei contenuti si sposta a fine pagina.

**Come si ripara:** Sostituire `px-6` con `px-4 sm:px-6` alla riga 99.

### La barra «modifica in blocco» del venditore finisce sotto la barra di sistema dell'iPhone

**Dove:** `app/seller/products/page.tsx:453` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. La barra e' `fixed inset-x-0 bottom-0 z-sticky flex items-center justify-between gap-3 border-t border-cream-300 bg-surface-0 px-5 py-3 shadow-warm-xl` e non prevede alcuna safe area, ne' con pb-safe ne' con env(safe-area-inset-bottom) nell'offset. Su un iPhone con barra gestuale i pulsanti «Annulla» e «Salva modifiche» cadono negli ultimi ~34px riservati dal sistema. Tutte le altre barre in fondo del progetto la gestiscono (MobileTabBar.tsx:169, StickyAddToCart.tsx:54-57, checkout:1072). Lo spazio in pagina c'e' gia' (`pb-24` alla riga 170): manca solo il padding dentro la barra.

**Come si ripara:** Sostituire il py-3 in basso con `pb-[calc(0.75rem+env(safe-area-inset-bottom))]`, oppure aggiungere la classe `pb-safe` gia' definita in app/globals.css:198.

### Checkout: riquadri interni con angoli più tondi del contenitore che li contiene

**Dove:** `app/checkout/page.tsx:863, 880, 908 (dentro gli StepCard alle righe 861 e 894)` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO, con una correzione all'etichetta del collega. Gli StepCard sono rounded-lg (12px, da Card.tsx:43). Dentro: 863 = conferma ritiro in negozio 'rounded-xl border border-olive-200'; 880 = riquadro consegna a domicilio 'rounded-xl border border-cream-300'; 908 NON è la scelta del pagamento (quella è il componente PaymentMethodSelector) ma il riquadro del credito MyCity, 'rounded-xl border-2 border-cream-300'. Tutti e tre 16px dentro un contenitore da 12px: il raggio cresce andando verso l'interno.

**Come si ripara:** Portare i tre riquadri interni a rounded-lg (12px); se si adotta il punto precedente e le card del funnel passano a rounded-xl (16px), tenerli comunque un gradino sotto. Regola: il raggio diminuisce verso l'interno, mai il contrario.

### Il bordo grigio freddo di Tailwind al posto del bordo sabbia del brand

**Dove:** `app/stores/page.tsx:249, 263 (contro la riga 242) · app/shipping/page.tsx:63-88 · app/profile/settings/page.tsx · app/orders/[id]/review/page.tsx` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO nel meccanismo e nei punti campione, ma il conteggio del collega non l'ho potuto riprodurre. Meccanismo: Tailwind 3.4.19 (node_modules/tailwindcss/package.json) e preflight.css applica border-color: theme('borderColor.DEFAULT', currentColor); in tailwind.config.ts non c'è nessun borderColor, quindi 'border' senza colore vale gray-200 #E5E7EB, un grigio freddo, mentre il token è --border: var(--cream-300) = #EEDFBA. Caso verificato su /stores: la scheda filtri alla riga 242 è 'bg-white border border-cream-300' e dentro di essa il campo di ricerca (249) e il menu a tendina (263) hanno 'border' nudo, cioè grigio. Stessa cosa nella tabella di app/shipping/page.tsx (celle 'border p-2'). Sul numero: il collega dice 94 occorrenze su 30 file, io con due conteggi diversi ho ottenuto valori molto più alti perché il grep prende anche i 'border' seguiti dal colore — quindi il difetto è vero, il numero preciso resta da misurare. Ho abbassato la gravità da grave a minore: è un filetto di 1px a basso contrasto, si nota solo mettendo i due bordi vicini come nel caso /stores.

**Come si ripara:** Due mosse. Chiudere il rubinetto: in tailwind.config.ts aggiungere theme.extend.borderColor = { DEFAULT: '#EEDFBA' }, così ogni 'border' futuro nasce sabbia. Poi, dove serve il neutro del funnel d'acquisto, scrivere esplicitamente 'border-surface-200'.

### La scala tipografica è aggirata 330 volte con misure a mano

**Dove:** `330 occorrenze text-[Npx] in app/ e components/ — components/seller/SellerShell.tsx, app/rider/earnings/page.tsx, app/search/page.tsx, components/admin/AdminSidebar.tsx fra i primi` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO, conteggio rifatto e coincidente: 330 occorrenze totali di text-[Npx]. Distribuzione verificata: 13px 115 volte, 11px 70, 10px 50, 15px 22, 17px 16, 32px 8, 26px 8, 34px 7, 14px 7, 22px 6, 13.5px 4, 12px 4, 12.5px 2. La scala del design system (docs/mockup/tokens/typography.css) è 10/12/14/16/18/20/24/30/36/48/60. Ci sono quindi misure fuori scala (13, 11, 15, 17, 22, 34), misure che duplicano un token esistente (12px = text-xs, 14px = text-sm, 10px = text-2xs) e perfino mezzi pixel (13.5px, 12.5px). Effetto pratico: la stessa etichetta secondaria è 13px in una pagina e 14px in un'altra.

**Come si ripara:** Non serve riscrivere tutto. Prima le sostituzioni identiche (text-[10px]→text-2xs, [12px]→text-xs, [14px]→text-sm, [16px]→text-base, [18px]→text-lg, [24px]→text-2xl), poi arrotondare le vicine al gradino più prossimo (13→14, 15→16, 17→18, 22→24, 34→36) ed eliminare i mezzi pixel.

### Le etichette maiuscole respirano in quattro modi diversi, e il nome del token inganna

**Dove:** `components/ui/Badge.tsx:26-29 e 38 · tracking-* in app/ e components/` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. Il design system ha un token solo per le maiuscole: --tracking-wide 0.04em (docs/mockup/tokens/typography.css:47), esposto in tailwind.config.ts come 'tracking-label'. Conteggio mio: tracking-label 9 volte, tracking-wide 47, tracking-wider 49, tracking-widest 3 (il collega diceva 9/43/46/3). Il tranello è reale e verificato: tailwind.config.ts estende letterSpacing solo con display/editorial/label, quindi l'utility 'tracking-wide' resta il default Tailwind 0.025em e NON vale 0.04em come la variabile CSS omonima — chi la scrive crede di usare il token. Badge.tsx:26-29 usa tracking-wide su tutte e quattro le varianti maiuscole, quindi i badge del sito sono già fuori token; alla riga 38 la taglia sm è 'text-[10px]' invece di 'text-2xs', che vale esattamente 10px.

**Come si ripara:** Sostituire tracking-wide/wider/widest con tracking-label su tutto ciò che è maiuscolo, a partire da Badge.tsx:26-29, e portare la riga 38 a 'text-2xs'. Per togliere il tranello alla radice, ridefinire letterSpacing.wide = '0.04em' in tailwind.config.ts così i due nomi coincidono.

### Il prezzo grande della home è in Inter, quello del prodotto in Fraunces

**Dove:** `components/home/DropOfDay.tsx:117 vs app/product/[id]/page.tsx:711, app/cart/page.tsx:409, app/checkout/page.tsx:1077` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. Il prodotto rispetta la regola dei prezzi editoriali in Fraunces: page.tsx:711 'text-4xl font-extrabold font-serif', totale carrello cart/page.tsx:409 'font-serif text-2xl font-extrabold', totale checkout page.tsx:1077 'font-serif text-xl font-extrabold'. Il «Drop del giorno» no: DropOfDay.tsx:117 è 'text-4xl md:text-5xl font-extrabold text-accent-300', senza font-serif, quindi Inter. È il numero più grosso del banner e sta otto righe sotto un titolo (108) che è invece 'font-serif': due caratteri diversi dentro lo stesso riquadro.

**Come si ripara:** Aggiungere 'font-serif' alla riga 117 di components/home/DropOfDay.tsx. Il prezzo barrato della riga 120 può restare in Inter, come sulla card prodotto.

### Il marchio «MyCity» è disegnato in quattro modi diversi, e l'anteprima nel pannello ne mostra un quinto

**Dove:** `components/Navbar.tsx:99,174 · components/Footer.tsx:103 · components/admin/AdminSidebar.tsx:73-75 · app/admin/branding/page.tsx:153` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO in tutti e quattro i punti più l'anteprima. Il marchio ufficiale (docs/mockup/assets/wordmark-*.svg) è Fraunces 800, «My» in mostarda. Navbar 99 e 174: 'font-serif font-bold' + text-accent-300 — colore giusto, peso 700 invece di 800. Footer 103: 'font-serif font-bold' + text-accent-700 (#9D621C), che non è il colore ufficiale (la scelta si spiega col contrasto su crema, ma allora al design system manca la variante «su crema»). AdminSidebar 73-75: 'font-serif font-extrabold' + text-accent-300, peso giusto, MA le parole «My» e «City» sono scritte a mano mentre Navbar e Footer leggono branding.wordmark — verificato: se dal pannello si rinomina il marketplace, la sidebar admin continua a dire MyCity. app/admin/branding/page.tsx:153: l'anteprima mostrata a chi rinomina usa 'text-primary-700', terracotta, un colore che il logo non ha in nessuna delle quattro rese reali.

**Come si ripara:** Un solo componente <Wordmark surface="dark|light|cream" /> in components/ui/, che legga branding.wordmark, usi sempre font-serif + font-extrabold e mappi il colore: dark → accent-300, light → accent-500, cream → accent-700. Sostituirlo nei quattro punti, anteprima del pannello compresa. Se il caso «su crema» resta accent-700, aggiungere wordmark-oncream.svg e documentarlo.

### La lista di sicurezza di Tailwind tiene in vita 72 classi fuori brand che non usa nessuno

**Dove:** `tailwind.config.ts:24-29` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. Il safelist forza (bg|text|border) × (sky, violet, emerald, amber, indigo, rose, slate, pink, blue) × (100,200,600,700) = 108 classi. Ho contato le occorrenze reali in app/, components/, lib/ e stories/: sky 0, violet 0, indigo 0, slate 0, pink 0, blue 0 — sei famiglie su nove non le usa nessuno, cioè 72 classi generate a vuoto (amber 25, emerald 14, rose 118 sono invece usate). Il commento alle righe 21-23 le giustifica dicendo che le dashboard admin compongono classi dinamiche 'text-${color}-600': motivazione decaduta, verificata sui due file citati — app/admin/activity/page.tsx e app/admin/funnel/page.tsx ora usano mappe statiche e lo dichiarano nei commenti («Classi STATICHE per tono», «Mappa STATICA dei toni»). Il danno non è il peso ma il fatto che il safelist legittimi classi blu/indaco/ardesia in un sistema che quei colori li ha esclusi.

**Come si ripara:** Eliminare le righe 24-29 di tailwind.config.ts. Le famiglie ancora usate (amber, emerald, rose) sono scritte in chiaro nel codice, quindi il JIT le genera comunque. Verifica: dopo il build, '.bg-sky-600' non deve più comparire nel CSS compilato.

### Ombre nere fredde accanto alle ombre calde del brand; il token creato apposta non è usato mai

**Dove:** `app/orders/[id]/page.tsx:435 · components/ProductCard.tsx:168 · e le altre occorrenze di shadow/shadow-sm/md/lg/2xl` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO nella sostanza, con i numeri corretti al ribasso. tailwind.config.ts definisce 'sm-neutral' rgba(28,26,24,0.06) e 'card' esattamente per le superfici bianche: ho cercato shadow-sm-neutral in app/, components/ e lib/ — ZERO occorrenze, il token è nato inerte. Le ombre calde (shadow-warm*/shadow-card) sono ~185. Accanto ci sono le ombre nere della scala Tailwind: i miei conteggi danno una trentina di occorrenze fra shadow nudo, shadow-sm, shadow-md, shadow-lg e shadow-2xl, non 52 come diceva il collega. Il caso più visibile è confermato: app/orders/[id]/page.tsx:435, il riquadro verde del codice di consegna ha 'shadow-lg' (nera) mentre le card intorno hanno ombre terracotta.

**Come si ripara:** Mappare le occorrenze sui token: shadow/shadow-sm → shadow-sm-neutral (su bianco) o shadow-warm-sm (su crema); shadow-md/lg → shadow-warm o shadow-card; shadow-xl/2xl → shadow-warm-lg. In alternativa ridefinire boxShadow.sm/DEFAULT/md/lg in tailwind.config.ts con le versioni inchiostro, così anche le classi generiche cadono dentro il sistema.

### Il codice di consegna usa un terzo carattere che il design system non prevede

**Dove:** `app/orders/[id]/page.tsx:439 · app/profile/referral/page.tsx:87 · tailwind.config.ts (fontFamily)` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO nel fatto, ridimensionato nell'effetto. Il design system ammette due caratteri, Inter e Fraunces (docs/mockup/_adherence.oxlintrc.json li elenca come gli unici disponibili). Il codice di consegna — l'elemento più grande della pagina ordine — è 'font-mono text-4xl … sm:text-5xl' (riga 439), e lo stesso vale per il codice invito (referral:87). Verificato che tailwind.config.ts estende fontFamily solo con 'sans' e 'serif': 'mono' non è mappato, quindi font-mono non legge il token --font-mono di app/globals.css:17. CORREZIONE al collega: la pila predefinita di Tailwind (ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas…) e il token (ui-monospace, 'SF Mono', Menlo, Consolas) sono praticamente identiche, quindi la resa non cambia in modo apprezzabile — il difetto vero non è «un carattere diverso su ogni telefono», è un terzo carattere usato in due punti prominenti senza che il design system lo dichiari.

**Come si ripara:** Se il monospaziato serve (per un codice a cifre è una scelta difendibile), formalizzarlo: aggiungere mono: ['var(--font-mono)', 'ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'] in tailwind.config.ts e citarlo nel design system come terzo carattere ammesso, con uso circoscritto ai codici. Altrimenti 'font-sans tabular-nums tracking-[0.3em]', che allinea le cifre restando in Inter.

### Gli sfondi dei badge di stato ordine sono otto colori Tailwind scritti a mano, malgrado il commento dica il contrario

**Dove:** `lib/order-status.ts:52-59 · commento in components/ui/OrderStatusBadge.tsx:70-72` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. Il commento sopra ORDER_STATUS_COLOR e quello in OrderStatusBadge dichiarano «Niente classi off-palette: i colori vivono nei token del design system». È vero a metà: il campo 'color' usa davvero var(--status-new), var(--status-accepted)… (definiti in app/globals.css:76 e in docs/mockup/tokens/colors.css), ma il campo 'bg' è otto hex a mano — #FFFBEB, #EFF6FF, #F5F3FF, #EEF2FF, #ECFEFF, #FAF5FF, #ECFDF5, #FFF1F2, cioè i gradini 50 di amber, blue, violet, indigo, cyan, purple, emerald e rose. Verificato: nessuno degli otto esiste come token in app/globals.css, tailwind.config.ts o docs/mockup/tokens/colors.css. Metà del sistema degli stati vive fuori dai token.

**Come si ripara:** Aggiungere in app/globals.css e in docs/mockup/tokens/colors.css gli otto token --status-*-bg con quei valori e sostituire gli hex di lib/order-status.ts:52-59 con var(--status-*-bg). Aggiornare anche docs/mockup/guidelines/cards/color-status.html, che li ripete a mano.

### La variabile del colore della vetrina viene impostata su entrambe le pagine negozio e non la legge nessuno

**Dove:** `app/store/[id]/page.tsx:108 · app/store/[id]/[slug]/page.tsx:68 · commento in app/globals.css:295` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. Le due pagine impostano style={{ ['--store-accent']: accent }} sul contenitore e il commento a globals.css:295 la presenta come il meccanismo con cui l'accento del negozio sopravvive ai temi. Ho cercato --store-accent in tutto app/, components/ e lib/ (css compresi): gli unici tre riscontri sono le due dichiarazioni inline e il commento — nessun consumatore. Le sezioni prendono il colore dalla prop ctx.accent (BannerSection.tsx:20, HeroSection.tsx:86, ContactSection.tsx:26 e 37). È codice morto che documenta un meccanismo inesistente: chi scriverà una sezione nuova fidandosi del commento userà var(--store-accent) e otterrà un colore vuoto.

**Come si ripara:** O rimuovere le due dichiarazioni inline e il commento a globals.css:295, o — strada più pulita — far leggere alle sezioni var(--store-accent) invece della prop, così il colore si propaga per cascata e le sezioni nuove funzionano senza passarsi ctx.

### Il design system di riferimento è incompleto: mancano Button, Badge e Card e un file importa un componente che non esiste

**Dove:** `docs/mockup/components/ (manca core/) · docs/mockup/components/commerce/ProductCard.jsx:2 · docs/mockup/_ds_manifest.json` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. docs/mockup/components/ contiene solo commerce/, feedback/ e forms/: la cartella core/ non c'è. Il manifesto _ds_manifest.json però elenca Badge (components/core/Badge.jsx), Button (components/core/Button.jsx), Card (components/core/Card.jsx) e la scheda «Core · Button · Badge · Card» con previewPath components/core/core.card.html. Di conseguenza docs/mockup/components/commerce/ProductCard.jsx alla riga 2 fa import { Badge } from '../core/Badge.jsx' su un file assente. Il deck si apre perché le versioni compilate stanno in _ds_bundle.js, ma la fonte consultabile non c'è: chi deve fare un pulsante non ha una specifica da guardare — il che spiega bene la deriva misurata negli altri punti.

**Come si ripara:** Ricostruire docs/mockup/components/core/ (Button.jsx, Badge.jsx, Card.jsx, core.card.html) estraendoli da _ds_bundle.js che li contiene già compilati, verificare che l'import a ProductCard.jsx:2 si risolva, e tenere le varianti allineate a components/ui/Button.tsx e components/ui/Card.tsx del prodotto.

### Sulla pagina spedizioni due classi tipografiche non fanno niente e un verde è fuori palette

**Dove:** `app/shipping/page.tsx:44 e 29` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO su entrambi i punti. Riga 44: la sezione è 'prose prose-gray max-w-none space-y-6 …', ma il plugin @tailwindcss/typography non è installato — package.json elenca solo tailwind-scrollbar-hide e tailwind.config.ts carica solo quello. Le classi prose sono quindi inerti: la spaziatura interna di titoli, paragrafi ed elenchi che ci si aspetterebbe non viene applicata (regge solo space-y-6, che spazia i blocchi ma non il loro interno). Riga 29: «Spedizione GRATIS» è 'text-green-900', il verde Tailwind, dentro un riquadro che per il resto usa correttamente olive-50, olive-200, olive-600 e olive-700.

**Come si ripara:** Riga 44: togliere 'prose prose-gray' e definire esplicitamente la spaziatura di titoli ed elenchi, oppure installare @tailwindcss/typography e configurarne i colori sui token ink/cream. Riga 29: 'text-green-900' → 'text-olive-900'.

### Il foglio di stile globale scrive a mano i valori dei token che dichiara poche righe sopra

**Dove:** `app/globals.css:161 (contro 105) · 184-189 · 228 (contro 103) · 305` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO tutte e quattro. Riga 161: ':focus-visible { outline: 2px solid #C0492C }' mentre alla riga 105 esiste --focus-outline: 2px solid var(--primary-600); verificato che né --focus-outline né --focus-ring (riga 104) sono usati da nessuna parte in app/ e components/ (zero occorrenze di var(--focus-outline)/var(--focus-ring)). Righe 184-189: il gradiente dello scheletro di caricamento usa #F5EDD9 e #FBF7F0 invece di var(--cream-200) e var(--cream-100). Riga 228: '.card-hover:hover' ripete 'box-shadow: 0 12px 32px -8px rgba(192,73,44,0.18)', che è già --shadow-hover alla riga 103. Riga 305: il tema «caldo» della vetrina usa background-color #FBF7F0 invece di var(--cream-100). Nessuna produce oggi un errore visibile — i valori coincidono — ma sono quattro copie che divergeranno alla prima modifica di palette.

**Come si ripara:** Sostituire con le rispettive var(): riga 161 → 'outline: var(--focus-outline)'; 184-189 → var(--cream-200)/var(--cream-100); 228 → 'box-shadow: var(--shadow-hover)'; 305 → var(--cream-100).

### La primitiva Card è usata in 10 file, mentre 141 card sono ridisegnate a mano con quattro raggi diversi

**Dove:** `components/ui/Card.tsx:43 · riquadri 'bg-white border border-cream-300|surface-200 rounded-*' in app/ e components/` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO, conteggi rifatti e coincidenti. Solo 10 file importano components/ui/Card. Le card scritte a mano con lo stesso schema (bg-white + border cream-300/surface-200) si distribuiscono così: rounded-2xl (20px) 71 volte, rounded-xl (16px) 56, rounded-lg (12px) 14, più i pochi rounded-full. La primitiva usa rounded-lg, cioè il raggio meno frequente: i 10 posti che passano di lì hanno 12px, 56 ne hanno 16 e 71 ne hanno 20. Nessuno è illegale preso da solo (il design system ammette 12-20px per le card), ma non esiste una regola che dica quale raggio in quale contesto — ed è la causa radice del difetto del checkout qui sopra.

**Come si ripara:** Fissare la regola per contesto e scriverla nel design system: card di contenuto = rounded-xl (16px), card prodotto/negozio = rounded-2xl (20px), riquadri interni = rounded-lg (12px). Allineare components/ui/Card.tsx:43 a rounded-xl con una prop 'radius' per il caso prodotto, e migrare a <Card> almeno le pagine del funnel d'acquisto.

### Le stelle da cliccare per votare sono sotto la soglia di contrasto (2,52 contro 3 richiesto)

**Dove:** `app/product/[id]/page.tsx:1020 · app/orders/[id]/review/page.tsx:27` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO nel codice, con una correzione alla soglia. Nei due moduli di recensione le stelle non ancora scelte usano `text-ink-300`, cioè #A8A29E (tailwind.config.ts:98): sul bianco ho rimisurato 2,52 a 1, lo stesso numero del collega. La soglia però non è 4,5 come scritto nella segnalazione: le stelle sono a text-3xl (30px) e text-4xl (36px), quindi contano come testo grande — e come comando da toccare — e la soglia giusta è 3 a 1. Anche con la soglia più permissiva il valore non passa. Prima del clic sono grigie tutte e cinque, quindi l'unico comando di quella schermata è nel grigio più chiaro della tavolozza. Difetto reale, ma meno drammatico di come era raccontato: a 30-36px le stelle si vedono, sono sbiadite, non invisibili — per questo scendo da grave a minore.

**Come si ripara:** Portare le stelle spente da text-ink-300 a text-ink-400 (#78716C, 4,80 a 1 sul bianco), o disegnare il contorno della stella invece del pieno. Le stelle accese (text-accent-700) vanno bene così.

### I titoli delle file di prodotti vengono tagliati invece di andare su due righe

**Dove:** `components/ProductGrid.tsx:362 e :367 · si vede in app/category/[slug]/page.tsx e app/search/page.tsx` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO. Tutte e due le varianti dell'intestazione di sezione (con link e senza) hanno `truncate` insieme a `font-serif text-xl font-bold ... md:text-2xl`: una riga sola, il resto mozzato. Il titolo divide la riga con il collegamento «Vedi tutto», che è `shrink-0` e quindi non cede spazio. Su uno schermo da 320px restano circa 180px per il titolo, cioè undici-dodici lettere a 20px in Fraunces grassetto: nomi di sottocategoria come «Abbigliamento sportivo» o «Latticini & Formaggi» non ci stanno. Su 375px il caso è al limite. La misura in pixel è una stima; il comportamento (taglio a una riga, mai a capo) è certo dal codice.

**Come si ripara:** Sostituire `truncate` con `line-clamp-2` in tutte e due le righe e far partire la dimensione da text-lg su telefono (text-lg sm:text-xl md:text-2xl).

### La scala delle dimensioni del testo viene scavalcata circa trecentotrenta volte

**Dove:** `app/globals.css:22-32 (la scala dichiarata) · scavalcata in tutto il sito, in particolare components/ProductCard.tsx:182/185/188/211` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO, conteggio rifatto da me. La scala dichiarata in globals.css righe 22-32 ha undici gradini (10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60px). Contando le dimensioni scritte a mano nel codice: text-[13px] 115 volte, text-[11px] 70, text-[10px] 50, text-[15px] 22, text-[17px] 16, poi 32, 26, 34, 14, 22, 13.5, 12, 9, 28, 12.5, 8, 54, 46, 30, 24, 18, 16px — circa 330 punti in tutto, di cui ~280 su gradini che nella scala non esistono (13, 11, 15, 17px). Non ho verificato l'affermazione del collega sulle 227 righe senza altezza di riga: quella la lascio fuori. L'effetto concreto l'ho aperto su components/ProductCard.tsx: nome del prodotto a 13px (riga 188), nome del negozio a 11px (riga 185), prezzo barrato a 11px (riga 211), prezzo pieno text-base (16px) — quattro dimensioni in una scheda alta pochi centimetri, e due su quattro fuori scala.

**Come si ripara:** Aggiungere in tailwind.config.ts i due gradini realmente usati — '2sm': 0.8125rem (13px) e 'xxs': 0.6875rem (11px), ciascuno con la sua altezza di riga — poi sostituire text-[13px] e text-[11px] con le nuove classi e ricondurre i residui (15, 17, 22, 26, 28, 32, 34) al gradino più vicino.

### Nel carrello le righe che spiegano il prezzo sono a 10px

**Dove:** `app/cart/page.tsx:380, :392 e :410` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO. Riga 380: «stima · potrebbe variare al checkout» in `text-2xs` (10px, il gradino più piccolo del sistema) — ed è proprio l'avviso che dice al cliente che la spedizione può cambiare. Riga 392: il conto dei negozi e del costo per ciascuno, sempre text-2xs. Riga 410: «IVA inclusa» in `text-[10px] text-ink-400 uppercase`, cioè maiuscolo a 10px senza nessuna spaziatura fra le lettere, che a quella misura si impastano. (L'affermazione del collega che sia «l'unico maiuscolo del sito senza spaziatura» non l'ho verificata e la lascio fuori: resta vero che qui la spaziatura manca.)

**Come si ripara:** Portare le tre righe a text-xs (12px) e aggiungere alla riga 410 `tracking-label`, la spaziatura che il sistema definisce apposta per le etichette maiuscole (tailwind.config.ts:151).

### Le iniziali del negozio sulla scheda prodotto sono a 8px

**Dove:** `components/ProductCard.tsx:182` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO: `h-4 w-4` (un cerchio da 16 pixel) con dentro le due iniziali in `text-[8px] font-bold text-white`. Otto pixel è il carattere più piccolo di tutto il sito — l'ho cercato, c'è una volta sola, ed è questa — cioè metà del testo di lettura, con due maiuscole dentro 16 pixel e quasi nessuna aria. A quella misura non si legge una sigla, si vede una macchia. E l'informazione non manca: il nome del negozio per esteso sta già subito a destra, alla riga 185.

**Come si ripara:** O si toglie il pallino con le iniziali, visto che il nome è già lì accanto, o si porta il cerchio a 20px (h-5 w-5) con le lettere a 10px (text-2xs), che è il minimo dichiarato dal sistema.

### Sulla scheda prodotto due titoli di pari grado escono a 14px e a 20px

**Dove:** `app/product/[id]/page.tsx:802 e :817 · confronto con :662, :952 e :994` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO aprendo le cinque righe. Il nome del prodotto è un h1 (riga 662). Subito dopo arrivano «Descrizione» (riga 802) e «Caratteristiche» (riga 817), che sono h3 con classe `font-bold text-sm uppercase tracking-wide text-ink-500`: 14px grigi, mentre il paragrafo che intestano (riga 803) è a 16px in ink-700, quindi più grande e più scuro. L'h2 compare solo dopo, alla riga 952 («Recensioni»), quindi la scaletta salta un gradino: h1 → h3 → h2. E alla riga 994 c'è un altro h3, «Lascia la tua recensione», senza classe di dimensione: quello esce a 20px in Fraunces per via della regola di globals.css. Risultato: due titoli dello stesso grado, 14px e 20px, sulla stessa schermata. Il piccolo maiuscolo in sé è uno stile legittimo; il difetto oggettivo sono il salto di livello e le due dimensioni per lo stesso grado.

**Come si ripara:** Rinumerare «Descrizione» e «Caratteristiche» come h2 (scaletta h1 → h2 → h3 senza salti) e dare a tutti i titoli di sezione della pagina la stessa classe, incluso quello della riga 994.

### Otto spaziature diverse per la stessa etichetta maiuscola

**Dove:** `Tutto il sito · il valore dichiarato è tracking-label (0.04em) in tailwind.config.ts:151` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO, conteggio rifatto: tracking-wide 47 volte (99 meno le 49 di tracking-wider e le 3 di tracking-widest, che contengono la stessa stringa), tracking-wider 49, tracking-[0.03em] 17, tracking-[0.05em] 8, tracking-[0.08em] 5, tracking-[0.04em] 4, tracking-[0.06em] 3, tracking-widest 3. Otto valori diversi, che tradotti in em vanno da 0,025 a 0,1. Il sistema dichiara un valore solo per questo scopo, `tracking-label` = 0.04em (tailwind.config.ts:151), e viene usato appena 9 volte. Ho verificato anche la copia-incolla segnalata: il blocco `text-xs font-bold uppercase tracking-[0.05em] text-primary-700` è identico in otto file (app/orders, app/profile, app/profile/addresses, app/notifications, app/returns, app/messages, app/favorites e components/CollectionHeader.tsx:94). La stessa etichetta respira in modo diverso da una pagina all'altra.

**Come si ripara:** Usare tracking-label su tutto il testo maiuscolo e tenere tracking-wide/wider per il testo normale. Meglio ancora: estrarre un componente Eyebrow unico dal blocco già ripetuto in otto file e usare quello.

### Nel profilo l'email può uscire dal bordo della scheda: manca break-words

**Dove:** `app/profile/page.tsx:133` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO nel file, con la portata ridotta rispetto alla segnalazione. Alla riga 133 l'email dell'utente è stampata in `font-mono` dentro una scheda con `p-6` (24px per lato) e nessuna classe che permetta di spezzare la parola. In tutto il sito ho trovato 7 usi di break-words/break-all, tutti in zone interne (admin, messaggi). I browser non spezzano né sulla chiocciola né sul punto, quindi un'email lunga esce dal bordo bianco della scheda: su un telefono da 375px restano circa 295px, cioè una trentina di caratteri a spaziatura fissa. Ho scartato invece la parte della segnalazione che presentava questo come «regola del design non copiata»: il file citato (docs/mockup/ui_kits/_mobile.css) è un foglio di correzione dei mockup con selettori #root/#mc-app e !important, non una fonte di token del sito.

**Come si ripara:** Aggiungere `break-words` alla riga 133 e agli altri punti dove si stampa un'email o un codice ordine per intero.

### Il tema «editoriale» della vetrina scende sotto i 16px del testo base

**Dove:** `app/globals.css:309` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO: è l'ultima riga del file — `[data-theme='editoriale'] .store-richtext { font-size: 0.95rem; line-height: 1.75; }` — cioè 15,2 pixel. Il sistema fissa il testo di lettura a 16px (--text-base alla riga 26) e questo tema lo porta sotto. Il blocco .store-richtext (definito alle righe 279-288) è il testo libero che il negoziante scrive nella sua vetrina: presentazione, storia, avvisi — cioè proprio il testo lungo, quello che si legge davvero. Chi sceglie un tema chiamato «editoriale» si aspetta di leggere meglio e ottiene caratteri più piccoli del resto del sito. L'altezza di riga 1.75 invece è giusta.

**Come si ripara:** Portare font-size a 1rem e tenere line-height: 1.75. L'effetto «rivista» si ottiene con l'interlinea e la larghezza della colonna (max-w-[65ch]), non rimpicciolendo le lettere.

### Verde oliva-500 con testo bianco: 3,69:1 sul badge «Aperto ora» e sul filtro «Aperti ora»

**Dove:** `components/store-sections/HeroSection.tsx:130 (badge «Aperto ora») e app/stores/page.tsx:254 (filtro «Aperti ora» attivo)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO SOLO IN PARTE, e per questo ridimensionato. `bg-olive-500` (#7C8B5A) con `text-white` misura 3,69:1 (ricalcolato): sotto 4,5:1 per testo piccolo in grassetto. Vero nei due punti qui sopra, dove sull'oliva c'è TESTO. Gli altri quattro punti segnalati dal collega sono FALSI POSITIVI: StepIndicator.tsx:24 e OrderTimeline.tsx:67 nello stato «fatto» rendono un'icona `<Check>`, non testo, e Navbar.tsx:331/:357 col ramo oliva rendono l'icona `<Bike>` (il testo del nome utente sta fuori dalla pastiglia) — sono elementi grafici, soglia 3:1, e 3,69:1 la passa. Cade quindi anche l'aggravante del «ripetuto sei volte nel percorso d'acquisto». WCAG 1.4.3 (AA).

**Come si ripara:** Sostituire `bg-olive-500` con `bg-olive-600` (#5A7C42, 4,78:1, già definito come «success brand» nel design system) nelle due righe con testo: HeroSection.tsx:130 e app/stores/page.tsx:254. Nessun cambio di layout.

### Il pulsante «pulisci» della barra di ricerca è un bersaglio da 16×16 pixel

**Dove:** `components/SearchBar.tsx:177-184 (className a riga 181)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO (righe 177-184, non 175-182). Il pulsante che svuota la ricerca ha `className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"` e dentro una `<X size={16} />`: nessun padding, area premibile 16×16 CSS px. WCAG 2.2 SC 2.5.8 Target Size Minimum (AA) chiede 24×24, e l'eccezione di spaziatura non regge perché il cerchio da 24px intersecherebbe il campo di ricerca stesso. La barra è in cima a ogni pagina. Nello stesso repo la soglia è già riconosciuta: components/StoreMediaCarousel.tsx:96 porta i pallini a `w-6 h-6` con la nota «la soglia riconosciuta è 24».

**Come si ripara:** Portare la classe a `absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-ink-400 hover:text-ink-700 hover:bg-cream-100`. Il campo ha già `pr-11` (44px) a destra: l'icona resta di 16px, cresce solo l'area premibile.

### Il cuore «non nei preferiti» della scheda prodotto è a 2,52:1

**Dove:** `app/product/[id]/page.tsx:679` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO alla riga esatta. Nello stato non-preferito il cuore è `text-ink-300` (#A8A29E) su `bg-white`: 2,52:1 ricalcolato, sotto la soglia 3:1 per gli elementi grafici. È l'unico indicatore visivo dello stato (l'`aria-pressed` c'è a riga 675 e copre chi ascolta, non chi vede male). La card di listino ha già la versione giusta: components/ProductCard.tsx:173 usa `text-ink-400` (4,87:1) per lo stesso cuore. WCAG 1.4.11 (AA).

**Come si ripara:** In app/product/[id]/page.tsx:679 sostituire `text-ink-300` con `text-ink-400`, allineandosi a ProductCard.tsx:173.

### Nella cronologia dell'ordine i numeri dei passi futuri sono a 4,11:1

**Dove:** `components/OrderTimeline.tsx:70 (`bg-cream-200 text-ink-400`)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO per OrderTimeline: il numero del passo futuro è ink-400 (#78716C) su cream-200 (#F5EDD9) = 4,11:1 ricalcolato, sotto 4,5:1 per un testo di 11px in grassetto (WCAG 1.4.3, che non ammette eccezioni di ridondanza perché è testo). SCARTATA invece la seconda metà della segnalazione: app/orders/[id]/page.tsx:483 è dentro un contenitore `aria-hidden` (riga 476) e lo stato è veicolato anche a parole nel blocco accanto (commento a riga 492), quindi l'icona non è «richiesta per capire il contenuto» e l'eccezione di 1.4.11 si applica.

**Come si ripara:** OrderTimeline.tsx:70 → `bg-cream-200 text-ink-600`. Solo il numero della tonalità, nessun cambio di forma.

### Il pulsante «Utile» votato nella vetrina scende fino a 2,88:1 (e il commento sui preset dichiara più di quello che i colori fanno)

**Dove:** `components/store-sections/ReviewsSection.tsx:162-175 (stile a riga 171); commento in lib/store-customization.ts:10-12 e preset a :19-29` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO, numeri ricalcolati uno per uno. A riga 171, quando la recensione è votata, il pulsante diventa `color: accent` su `color-mix(in srgb, accent 12%, white)`: terracotta #C0492C 4,20:1, oliva #5A7C42 4,10:1, senape #C4801F 2,88:1 — tutti sotto 4,5:1 per un testo di 12px in grassetto (WCAG 1.4.3). Confermata anche la nota collegata: il docblock a lib/store-customization.ts:10-12 dichiara i preset «tutti a livello ~-600 per garantire contrasto su testo bianco», ma «Senape» #C4801F misura 3,25:1 su bianco (gli altri sette reggono: bordeaux 6,18, terracotta 4,96, oliva 4,78). L'affermazione nel codice è più forte dei colori.

**Come si ripara:** In ReviewsSection.tsx:171 scurire il testo invece di usare l'accent puro: `color: color-mix(in srgb, ${accent} 70%, #1C1A18)` sullo stesso velo al 12% (porta tutti i preset sopra 6:1), lasciando `borderColor: accent` per l'identità del negozio. In parallelo correggere il commento di lib/store-customization.ts:10-12 oppure sostituire «Senape» #C4801F con accent-700 #9D621C (5,00:1 su bianco).

### L'`aria-label` della barra d'acquisto sticky sta su un `<div>` senza ruolo: viene ignorato

**Dove:** `components/StickyAddToCart.tsx:58 (`aria-label="Aggiungi al carrello (sticky)"`) e :75 (`aria-label="Quantità"`)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO (righe 58 e 75, non 57 e 74). Sono due `<div>` generici senza `role`: un `aria-label` lì non viene esposto dagli screen reader, quindi le due etichette non arrivano a nessuno. Il gemello desktop è già a posto — app/product/[id]/page.tsx:879 ha `<div role="group" aria-label="Quantità">` col commento #142 che spiega perché — la copia mobile è rimasta indietro. Impatto reale limitato, come dichiarava già il collega (i pulsanti +/− hanno il loro `aria-label`), ma oggi è ARIA morta che dà falsa sicurezza.

**Come si ripara:** Riga 75: `<div role="group" aria-label="Quantità" …>`. Riga 58: togliere l'`aria-label` dal contenitore oppure trasformarlo in `<div role="region" aria-label="Acquisto rapido">`.

### La striscia che scorre in cima non si può fermare da telefono né da tastiera

**Dove:** `components/PromoTicker.tsx:84-90 + app/globals.css:251-261 (`.animate-marquee { animation: marquee 24s linear infinite }`)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO. La striscia è renderizzata sempre (components/Navbar.tsx:90, quindi in cima a ogni pagina) e scorre in loop infinito da 24s. L'unica pausa è `:hover`, `:focus-within`, `:active` (globals.css:258-261): su telefono l'hover non esiste, e il focus-within serve solo se dentro c'è un link, cioè solo con una promozione attiva (`showPromo`, riga 40). Testo in movimento automatico per più di 5 secondi, in parallelo ad altro contenuto, deve avere un modo per essere fermato: WCAG 2.2.2 Pause, Stop, Hide (A). Attenuante confermata nel file: `prefers-reduced-motion` è gestito a globals.css:213-220 e di fatto ferma l'animazione per chi ha quell'impostazione — per tutti gli altri no.

**Come si ripara:** Aggiungere nella striscia un pulsante «‖ / ▶» (con `aria-label="Metti in pausa gli annunci"`, minimo 24×24) che alterna una classe con `animation-play-state: paused`. Alternativa più economica: far scorrere solo con almeno 3 annunci e fermarsi dopo due giri.

### Il banner della home non ha un campo per il testo alternativo dell'immagine

**Dove:** `components/home-sections/HomeSectionRenderer.tsx:410 (`alt={c.heading ?? ''}`); schema `bannerConfig` in lib/home-site.ts:159-165 senza `alt`; nessun campo alt nel form banner di components/admin/home/HomeSectionConfigForm.tsx` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO alla riga esatta. L'immagine del banner (larghezza piena, h-56/h-72) prende come testo alternativo il titolo, che è già scritto a video subito sotto a riga 412: uno screen reader legge la stessa frase due volte. Se il titolo è vuoto l'alt diventa `""`. Confermata anche l'asimmetria: `galleryConfig` ha il campo `alt` (lib/home-site.ts:167-173) e l'editor lo espone (HomeSectionConfigForm.tsx:280), il banner è l'unico blocco immagine rimasto senza. WCAG 1.1.1 (A).

**Come si ripara:** Aggiungere `alt` a `bannerConfig` in lib/home-site.ts:159, un `<Input label="Testo alternativo">` nel form del banner, e usare `alt={c.alt ?? ''}` a HomeSectionRenderer.tsx:410 — alt vuoto quando l'immagine è solo sfondo, così non si duplica il titolo.

### Le stelle del voto medio della vetrina negozio sono a 1,17:1 (vuote) e 2,16:1 (piene)

**Dove:** `components/store-sections/ReviewsSection.tsx:16-28 (funzione `AverageStars`, usata a riga 196)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO nel codice, ma la severità va abbassata. Vero: le stelle vuote sono `fill-cream-200 text-cream-200` (#F5EDD9 su bianco = 1,17:1 ricalcolato) e le piene `accent-500` (#E8A33D = 2,16:1), sotto la soglia 3:1 di WCAG 1.4.11. Vero anche il doppione: `RatingStars` è importato a riga 10 dello stesso file, usato a riga 119 per le singole recensioni, e porta il commento #149 che risolveva esattamente questo («accent-500 misurava 2,16:1… accent-700 misura 5,00:1»). Attenuante che il collega non aveva pesato: a riga 197-199, accanto alle stelle, c'è il voto in chiaro («4,5 (12)») in ink-600, quindi il dato non è veicolato dal solo colore — per questo è minore e non grave.

**Come si ripara:** Cancellare `AverageStars` (righe 16-28) e sostituire l'uso a riga 196 con `<RatingStars rating={avgRating} size={16} />`, già importato e già a norma (accent-700 5,00:1, vuote ink-400 4,87:1). Meno codice, una sola casa per la regola.

### Al checkout il modulo indirizzo si apre vuoto e poi sparisce sotto le dita

**Dove:** `/home/user/mycity/app/checkout/page.tsx:309-322 (query indirizzi) e :845-853 · /home/user/mycity/components/checkout/ShippingAddressForm.tsx:76 e :154` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO in parte, con severità corretta. Il pezzo che regge: la query `savedAddresses` ha `enabled: !!authUser?.id` (riga 311), quindi parte per forza DOPO che è tornata `authUser`, cioè più tardi della query dei gruppi che sblocca il render. Quando il modulo si disegna, `savedAddresses` è ancora `[]`, e in ShippingAddressForm `const editing = manualOpen || conErrori || savedAddresses.length === 0` (riga 76) vale true: si vede il modulo vuoto. All'arrivo degli indirizzi `editing` diventa false e il `<form>` riceve la classe `hidden` (riga 154), mentre l'effetto di checkout:356-365 riempie i campi. Il passo 1 si riorganizza davanti alla persona. NON confermo invece la seconda metà della segnalazione: il riquadro ospite `{!authUser && …}` sta a riga 845, cioè dopo `if (loadingGroups) return <LoadingState />` (riga 818), e `supabase.auth.getUser()` parte al montaggio prima della query dei gruppi — quindi il lampo del riquadro verde a un cliente già collegato non è dimostrabile. Resta un difetto di stato mancante, ma di impatto minore.

**Come si ripara:** Passare a ShippingAddressForm una prop `caricamento` presa da `isLoading` della query `savedAddresses`, e finché è vera mostrare due mattonelle-scheletro invece del modulo, senza calcolare `editing`.

### Cambiando un filtro, la griglia prodotti resta identica senza dare nessun segno che sta lavorando

**Dove:** `/home/user/mycity/components/ProductGrid.tsx:130-132, :522, :535-538` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO nei fatti, severità abbassata. La query ha `placeholderData: keepPreviousData` (riga 131) e la `queryKey` (riga 132) contiene prezzo, disponibilità, negozio aperto, voto minimo, ordinamento e testo cercato: al cambio filtro parte una lettura nuova ma `isLoading` resta falso e a schermo restano i prodotti di prima. `isFetching` è preso a riga 130 e usato in un punto solo, il pulsante «Carica altri prodotti» (righe 535-538); il contenitore della griglia (riga 522, `<div className={\`grid ${gridCols} gap-4\`}>`) non ha né opacità ridotta né `aria-busy`. Confermato anche che nel progetto non esiste un indicatore globale: `grep useIsFetching` su app/ e components/ non trova nulla. Abbasso a minore perché un segnale c'è comunque — il chip/filtro cambia stato subito al tocco — quindi non è il «pulsante muto» descritto.

**Come si ripara:** Sul contenitore della griglia: `className={\`grid ${gridCols} gap-4 transition-opacity ${isFetching ? 'opacity-50 pointer-events-none' : ''}\`}` con `aria-busy={isFetching}`, più una riga `role="status"` («Aggiorno i risultati…») per chi non vede. Stesso trattamento alla variante rail.

### Messaggi: un errore di lettura viene mostrato come «Nessuna conversazione»

**Dove:** `/home/user/mycity/app/messages/page.tsx:54, :69, :107-109, :121-129` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO, ma solo per l'errore — non per il caricamento. La destrutturazione è `const { data: conversations = [], isLoading, refetch } = useQuery(...)` (riga 54) e non prende `isError`, mentre la funzione lancia su errore (`if (error) throw error`, riga 69). Il caricamento è coperto (`if (!userId || isLoading) return <LoadingState />`, righe 107-109), quindi nessun lampo all'apertura; ma se la lettura FALLISCE `isLoading` è falso e l'elenco è vuoto, e la pagina mostra «Nessuna conversazione — Scrivi a un negozio dalla scheda prodotto…» (righe 121-129). Chi ha conversazioni aperte legge che non ne ha nessuna, senza pulsante per riprovare.

**Come si ripara:** Prendere `isError` e mostrare `<ErrorState title="Non riusciamo a caricare i messaggi" onRetry={() => refetch()} />` prima del controllo su `conversations.length === 0`.

### «Non hai ancora liste» lampeggia a chi le liste ce le ha

**Dove:** `/home/user/mycity/app/lists/page.tsx:45, :62, :79, :178-185 · /home/user/mycity/components/AddToListButton.tsx:31, :143-145, :148-153` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO. Le tre query della pagina — `featuredLists` (riga 45), `publicLists` (62), `myLists` (79) — ricadono tutte su `= []` e nessuna legge `isLoading` o `isError`; non c'è nessun ritorno anticipato di caricamento nel file. Finché le risposte non arrivano `myLists.length === 0` è vero e compare il riquadro «Non hai ancora liste. Inizia a crearne una» col pulsante «Crea la prima lista» (righe 178-185), che poi sparisce. Stessa cosa nel pannello «Aggiungi alle tue liste»: la query ha `enabled: open` (riga 33), quindi all'apertura `lists` è `[]` e si legge «Non hai ancora liste. Creane una qui sotto» (righe 143-145) prima dell'elenco vero. In più i pulsanti delle liste (righe 148-153) chiamano `toggle.mutate(l.id)` senza nessun `disabled`, quindi si possono premere due volte.

**Come si ripara:** Prendere `isLoading` dalle query e mostrare riquadri-scheletro finché è vera, tenendo l'empty state solo per il vuoto verificato. In AddToListButton passare `disabled={toggle.isPending}` alle righe dell'elenco.

### Il carrello dice «toglilo per continuare» ma lascia continuare lo stesso

**Dove:** `/home/user/mycity/app/cart/page.tsx:254-262 e :414-419 · confronto con /home/user/mycity/components/checkout/OrderSummary.tsx:98-112` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO. Quando la disponibilità letta è zero la riga mostra in rosso «Non più disponibile · toglilo per continuare» (righe 256-262). Ma il «Procedi al checkout» è un `<Link href="/checkout">` sempre attivo (righe 414-419): non si spegne, non avvisa, non porta l'attenzione sulla riga da sistemare. Al checkout il muro c'è davvero (handleSubmit blocca con `stockIssues.length > 0` e OrderSummary mette `aria-disabled`), quindi non è un vicolo cieco: è un'istruzione che si contraddice da sola e costa un passaggio in più a fine percorso.

**Come si ripara:** Calcolare gli articoli bloccanti (`massimo(i.id, i.variantId) === 0`) e, se ce ne sono, sostituire il Link con un pulsante `aria-disabled` che porta sulla prima riga da correggere — come già fa OrderSummary.tsx:104-112 — oppure offrire lì un «Rimuovi gli articoli esauriti».

### Lo scheletro della griglia non ha la forma delle schede vere: al caricamento i prodotti saltano

**Dove:** `/home/user/mycity/components/SkeletonCard.tsx:1-20 · /home/user/mycity/components/ProductCard.tsx:153 e :179 · /home/user/mycity/components/ProductGrid.tsx:396 e :496-499` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO, due scarti misurabili. ① Altezza: SkeletonCard fissa la foto a `w-full h-48` (riga 3, 192 px sempre) mentre ProductCard usa `relative aspect-square w-full` (riga 153), cioè quanto è larga la scheda — su un telefono stretto la foto vera è molto più bassa dei 192 px dello scheletro; e il corpo è `p-3` nello scheletro (riga 4) contro `p-2.5` nella scheda vera (riga 179). Quando i prodotti arrivano la pagina si accorcia. ② Colonne: `SkeletonGrid` è fissata a `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` (riga 16) mentre la griglia dei risultati arriva a `lg:grid-cols-5 xl:grid-cols-6` (ProductGrid 499) ed è proprio SkeletonGrid a essere usata come stato di attesa (ProductGrid 396): su schermo grande quattro colonne di scheletri diventano sei colonne di prodotti.

**Come si ripara:** In SkeletonCard sostituire `w-full h-48` con `aspect-square` e portare il corpo a `p-2.5`; far accettare a `SkeletonGrid` le classi di colonne che ProductGrid calcola in `gridCols` e passargliele dalla riga 396, invece di riscriverle a mano.

### Gli scheletri di rotta non dicono niente a chi non vede lo schermo, e usano un'animazione diversa dal resto

**Dove:** `/home/user/mycity/app/product/[id]/loading.tsx:8 · /home/user/mycity/app/orders/[id]/loading.tsx:3 · /home/user/mycity/app/store/[id]/loading.tsx:3 · confronto con /home/user/mycity/components/ui/LoadingState.tsx:34-80 e /home/user/mycity/app/globals.css:182-192` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO su tutti e tre i file. ① Nessuno dei tre `loading.tsx` ha `role="status"`, `aria-busy` o un testo nascosto: chi usa un lettore di schermo apre una scheda prodotto, un ordine o un negozio e non sente nulla finché la pagina non è pronta. Il componente condiviso lo fa bene — `role="status" aria-live="polite"` in tutte e quattro le varianti di LoadingState (righe 34, 43, 53, 72) — ma i tre file di rotta non lo usano. ② Sono scritti con `animate-pulse` e sfondi `bg-cream-200`, mentre LoadingState e app/loading.tsx usano la classe `.skeleton` con lo scintillio orizzontale definito in globals.css:183-192: nella stessa navigazione si vedono in fila due scheletri con due animazioni diverse.

**Come si ripara:** Aggiungere `role="status" aria-live="polite" aria-label="Caricamento in corso"` ai tre `loading.tsx` e sostituire `animate-pulse bg-cream-200` con la classe `.skeleton` già esistente.

### Con «riduci le animazioni» attivo tutte le rotelline di caricamento si congelano

**Dove:** `/home/user/mycity/app/globals.css:213-220 · effetto su /home/user/mycity/components/ui/Button.tsx:77 e /home/user/mycity/components/ui/LoadingState.tsx:35, :44, :54` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO. Il blocco `@media (prefers-reduced-motion: reduce)` azzera tutto senza eccezioni: `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; … }` (globals.css:214-219). Colpisce anche `animate-spin`, cioè l'icona `Loader2` usata da ogni stato di attesa — Button.tsx:77 (`{loading && <Loader2 … className="animate-spin" />}`) e LoadingState righe 35, 44, 54 — e la classe `.skeleton`, che è `animation: shimmer 2s linear infinite` (globals.css:192). Per chi ha quell'impostazione, un pulsante che sta lavorando appare come un pulsante grigio con un cerchietto immobile. Su LoadingState resta almeno il testo; sui pulsanti senza cambio di etichetta il segnale sparisce del tutto.

**Come si ripara:** Dentro il blocco `@media (prefers-reduced-motion: reduce)` aggiungere `.animate-spin, .skeleton { animation-duration: 1.5s !important; animation-iteration-count: infinite !important; }` — lenti, non fermi — e comunque accompagnare sempre lo stato di attesa con un cambio di testo, come fa già il codice sconto («Verifico…»).

### Quattro foto sotto la piega vengono chieste come «urgenti» su ogni home

**Dove:** `components/ProductGrid.tsx:470 (`priority={i < 4}`), stesso schema in components/home/PromoDeals.tsx:65, components/store-sections/CollectionSection.tsx:64 e app/promozioni/page.tsx:109 (sei)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO, con una correzione di dettaglio: l'ordine di serie della home sta in lib/home-site.ts:238-241 (non 42-43) e «Prodotti popolari» è la sesta sezione, non la quinta — quindi il punto regge, è sempre sotto la piega. Le sue prime quattro foto vengono marcate a priorità alta e precaricate (components/ProductCard.tsx:159-160 gira `priority` a next/image), in gara con quello che l'utente sta davvero guardando. Sulla pagina di un negozio si moltiplica: ogni collezione è una sezione e ognuna marca quattro foto. È lo stesso schema del punto sulle schede negozio: `priority` è deciso dal componente invece che da chi lo mette in pagina.

**Come si ripara:** Aggiungere una proprietà tipo `primaSezione` a ProductGrid e a PromoDeals: solo la prima griglia della pagina passa `priority` alle prime foto, le altre restano a caricamento pigro.

### Il segnaposto «foto mancante» arriva da un sito esterno e ha tre stili diversi

**Dove:** `components/ProductCard.tsx:61 · app/cart/page.tsx:231 · components/checkout/CartGroupsList.tsx:34 · app/product/[id]/page.tsx:343 · components/home/DropOfDay.tsx:90 · app/seller/products/page.tsx:266 e :363 · components/seller/FeaturedProductsPicker.tsx:71` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO: otto punti, carrello e cassa compresi, chiedono l'immagine di ripiego a placehold.co, e lib/image-url.ts:79-80 li lascia passare intatti. Due conseguenze. Nel momento del pagamento c'è una chiamata a un sito che non controlliamo: se è lento o bloccato, il cliente vede un riquadro rotto proprio lì. E i colori chiesti sono tre diversi — `FBF7F0/C0492C` sulla scheda prodotto, `F5EDD9/78716C` in carrello e cassa, `eee/aaa` cioè grigio fuori palette nelle pagine del venditore. Lo stesso stato «manca la foto» ha tre facce.

**Come si ripara:** Un solo file SVG locale in public/ (per esempio `/foto-mancante.svg`) nei colori del brand, usato in tutti e otto i punti. Zero chiamate esterne, zero attese.

### Nella lista dei desideri il riquadro senza foto si accartoccia attorno all'icona

**Dove:** `app/lists/[id]/page.tsx:279 e :281 (classi `w-18 h-18`)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO, compreso il controllo che rendeva il difetto dubbio: il progetto usa Tailwind 3.4.19 (package.json:58, node_modules/tailwindcss/package.json), dove la scala di serie passa da 16 a 20 e la misura 18 non esiste; in Tailwind 4 sarebbe stata valida. E tailwind.config.ts non ha nessuna voce `spacing` fra le estensioni. Sull'immagine non si nota, perché restano gli attributi width e height a 72 pixel. Sul ramo «prodotto senza foto», invece, il riquadro grigio non ha nessuna misura e si stringe attorno all'icona da 24 pixel: la riga risulta disallineata rispetto a tutte le altre.

**Come si ripara:** Mettere `h-[72px] w-[72px]` (o `h-20 w-20`) su entrambi i rami, immagine e segnaposto.

### «Ingrandisci foto» non mostra un pixel in più di quelli che si vedevano già

**Dove:** `app/product/[id]/page.tsx:601-606 (lightbox con `sizedImage(images[activeImg],'hero')`), tetto definito in lib/image-url.ts:19` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. La finestra a schermo intero apre l'immagine a 90% dell'altezza e 95% della larghezza, ma chiede al CDN la versione da 1200 pixel, e lo fa con un `<img>` semplice, senza caricatore che possa alzare la larghezza. Su un portatile con schermo fine ne servirebbero fra 1600 e 2500. Chi clicca su «Ingrandisci» per guardare l'etichetta di un salume vede la stessa immagine di prima, solo più grande e più morbida. L'originale a piena risoluzione è già nello Storage e non lo stiamo usando.

**Come si ripara:** Nel lightbox usare l'indirizzo originale, oppure `width=2000`, aggiungendo una misura 'zoom' a SIZE_PX in lib/image-url.ts.

### Le foto in galleria e le anteprime restano al loro tetto anche sugli schermi fini

**Dove:** `lib/image-url.ts:15-20 (thumb=100, card=400) · components/home-sections/HomeSectionRenderer.tsx:438 · components/cms/CmsBlockRenderer.tsx:63 · components/seller/site/ImageUpload.tsx:59 · components/seller/site/GalleryFields.tsx:60 · components/store-sections/HeroSection.tsx:91-95` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO, incluso il pezzo di Next citato: node_modules/next/dist/server/image-optimizer.js:826 usa `withoutEnlargement: true`, cioè Next non ingrandisce mai. Dove non c'è il caricatore su misura, l'indirizzo che arriva a Next è già ridotto e il tetto della sorgente diventa il tetto della qualità. Casi concreti confermati: la galleria della home dichiara di occupare il 33% della larghezza partendo da una sorgente di 400 pixel; l'anteprima del venditore dichiara 480 partendo da 400; la galleria del negozio dichiara 160 partendo da 100; la copertina del negozio dichiara 1024 partendo da 1200, che su schermo fine ne vorrebbe il doppio. Il risultato è una morbidezza diffusa.

**Come si ripara:** Aggiungere `loader={caricatoreFotoRemote}` anche a queste immagini — è il caricatore che già esiste in lib/image-loader.ts e che fa decidere la larghezza a Next lasciando il lavoro al CDN di Supabase.

### Nell'anteprima di condivisione del negozio il logo viene tagliato a quadrato

**Dove:** `app/store/[id]/opengraph-image.tsx:69 (`objectFit: 'cover'` in un riquadro 220×220), da confrontare con app/product/[id]/opengraph-image.tsx:70 che usa 'contain'` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Quando qualcuno manda su WhatsApp il link di un negozio, l'anteprima mostra il logo dentro un riquadro di 220 per 220 pixel con ritaglio a riempimento: un marchio largo perde i lati. La scheda prodotto, generata dallo stesso meccanismo e dallo stesso tipo di file, usa il ritaglio a contenimento. Due file gemelli, due comportamenti — e quello che esce peggio è proprio il momento in cui il negoziante mostra ai suoi clienti che è online.

**Come si ripara:** Cambiare in `objectFit: 'contain'`, uguale alla scheda prodotto.

### L'anteprima social del prodotto scarica la foto a piena risoluzione per un riquadro da 460 pixel

**Dove:** `app/product/[id]/opengraph-image.tsx:40 (`photo` grezzo, non passa da sizedImage) usato a :63-71, con `export const runtime = 'edge'` a riga 4` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. L'immagine di anteprima viene generata su runtime edge, che ha un tempo massimo stretto, e prende la foto originale del prodotto — quella caricata dal telefono del negoziante, fino a 5 MB dopo la ricompressione lato client — per disegnarla in un riquadro di 460 pixel. Su una foto pesante la generazione rallenta o scade, e chi incolla il link su WhatsApp vede l'anteprima senza foto. Basterebbe chiedere la versione ridotta, come fa tutto il resto del sito.

**Come si ripara:** Sostituire con `sizedImage(photo, 'detail')`.

### Le foto caricate scadono dalla cache dopo un'ora anche se l'indirizzo non cambia mai

**Dove:** `lib/products/uploadImages.ts:42 · components/VendorForm.tsx:123 · components/SellerApplicationForm.tsx:166 · components/seller/site/ImageUpload.tsx:27 · components/PhotoReviewUpload.tsx:47 · lib/products/rehostImages.ts:153 · components/ImageUrlField.tsx:44-48 (non lo imposta affatto)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO, con una precisazione al collega: il valore da un anno in next.config.js:64 NON è una promessa contraddetta, perché il commento sopra (righe 50-62) dichiara già che quelle due righe valgono solo per l'ottimizzatore di Next e non per queste foto. Il difetto vero resta e sta altrove: ogni caricamento scrive `cacheControl: '3600'`, un'ora, su un indirizzo che è unico per upload e quindi non cambia mai contenuto. Le stiamo facendo riscaricare ogni ora senza motivo, e ogni riscaricamento è un lampeggio in più su una connessione lenta. I punti sono sette, non cinque.

**Come si ripara:** Portare `cacheControl` a '31536000' in tutti i punti di caricamento, e impostarlo anche in ImageUrlField che oggi lo lascia al valore di serie.

### Nessun controllo sulla risoluzione minima delle foto prodotto

**Dove:** `components/seller/ProductImagesField.tsx:91-107 (controlla solo tipo e tetto di 30 MB) e lib/products/uploadImages.ts:33-37 (ricomprime solo quelle troppo grandi)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Il controllo esiste solo verso l'alto: si rifiutano i file oltre i 30 MB e si ricomprimono quelli sopra i 5. Verso il basso non c'è niente. Un negoziante che salva dal suo sito vecchio una foto da 300 pixel la carica senza un avviso, e quella foto finisce sulla scheda prodotto in un riquadro che sul computer arriva a 220 pixel e su telefono occupa quasi mezza larghezza: sgranata nel punto che deve far comprare. Il venditore non ha modo di accorgersene finché non guarda la sua pagina da cliente.

**Come si ripara:** Al caricamento leggere le dimensioni con `createImageBitmap` e mostrare un avviso — non un blocco — se il lato lungo è sotto gli 800 pixel: «questa foto è piccola, sulla scheda si vedrà sgranata».

### Sulle foto Pexels il ritaglio quadrato viene forzato anche nelle viste grandi

**Dove:** `lib/image-url.ts:24-32 (buildPexelsUrl) contro lib/image-url.ts:34-52 (buildSupabaseStorageUrl, che rispetta il flag `square`)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Il commento della funzione (righe 44-47) dice che per le viste grandi l'altezza non si imposta «per mostrare l'intero prodotto nel dettaglio», ma la regola è applicata solo al ramo Supabase: il ramo Pexels imposta sempre `w` e `h` uguali con `fit=crop`, ignorando il parametro. Il catalogo dimostrativo usa proprio foto Pexels (seeds/003_pexels_images.sql), quindi su quei prodotti la finestra di ingrandimento — che il commento a app/product/[id]/page.tsx:572 descrive come «vede la foto intera» — mostra un quadrato ritagliato. Effetto limitato ai contenuti dimostrativi, ma l'incoerenza è nel codice.

**Come si ripara:** Passare il flag `square` anche a buildPexelsUrl e impostare l'altezza solo quando è vero.

### L'icona del sito è testo disegnato col font di sistema, e manca il favicon classico

**Dove:** `public/icon-192.svg e public/icon-512.svg (byte per byte identici, entrambi con viewBox 512) · dichiarati in app/layout.tsx:46-52 · stesso difetto negli originali docs/mockup/assets/logo-icon.svg, logo-icon-512.svg, wordmark-light.svg, wordmark-ondark.svg` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO, compreso il confronto byte a byte (i due SVG sono identici, quindi la variante «192» non esiste davvero) e la ricerca del favicon (nessun favicon.ico né in public/ né in app/: i lettori più vecchi e diversi aggregatori chiedono quell'indirizzo e prendono un 404). Le due icone disegnano la sigla «My» con un elemento di testo e `font-family="system-ui, -apple-system, Helvetica, Arial"`: il marchio prende la forma del font di sistema di chi guarda — Segoe UI su Windows, San Francisco su macOS, DejaVu su Linux — e nessuno dei tre è il font del brand (Fraunces, caricato in app/layout.tsx:29). Un logo non deve dipendere da cosa è installato sul computer di chi lo vede. Nota: le versioni PNG (icon-192.png 192×192, icon-512.png 512×512) sono corrette e diverse fra loro; il problema è sugli SVG, che sono i primi dichiarati.

**Come si ripara:** Convertire il testo in tracciati dentro l'SVG, così il disegno è sempre lo stesso ovunque, e aggiungere app/icon.ico. Vale anche per gli originali in docs/mockup/assets/.

### Lo scheletro di caricamento ha una forma diversa dalla scheda vera e la pagina salta

**Dove:** `components/SimilarProducts.tsx:87 (scheletro `aspect-[3/4]` senza righe di testo) contro la scheda vera a :108-124 (`aspect-square` più tre righe) · components/StoreShowcase.tsx:75 (quattro scheletri `aspect-[4/3]`) contro components/StorePreviewCard.tsx:58-61 (copertina `h-28` fissa, logo sporgente, tre miniature) con sei negozi caricati (StoreShowcase.tsx:20)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Lo scheletro serve a tenere ferma la pagina mentre i dati arrivano, e il commento in StoreShowcase.tsx:69 lo dice («evita il CLS»). Ma le due forme non coincidono: lo scheletro disegna una copertina in rapporto 4:3 (su una colonna da 270 pixel fanno circa 200 di altezza) mentre la scheda vera ha la copertina fissa a 112 pixel e sotto molto più contenuto; in più gli scheletri sono quattro e le schede sei. Al momento del caricamento la sezione cambia altezza e quello che sta sotto si sposta sotto il dito. Stessa cosa, più contenuta, in «Potrebbe piacerti».

**Come si ripara:** Allineare lo scheletro alla scheda: copertina `h-28`, stesso numero di elementi e stesse righe di contenuto. Per «Potrebbe piacerti» basta `aspect-square` più due righe di testo.

### Le mappe si mangiano lo scorrimento del dito: sopra la mappa la pagina non scorre

**Dove:** `components/DeliveryMap.tsx:61 (`L.map(divRef.current)` senza opzioni); components/NearbyStoresMap.tsx:63 (idem) e 33 (`h-[70vh]`); usi reali: app/orders/[id]/page.tsx:528 (`h-44`), app/near/page.tsx:243` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato: entrambe le mappe sono create con `L.map(div).setView(...)` senza passare nessuna opzione, quindi restano i valori predefiniti di Leaflet (trascinamento col dito attivo, nessun `gestureHandling`, `scrollWheelZoom` attivo). Sul telefono uno scorrimento verticale iniziato sopra la mappa muove la mappa, non la pagina. Il caso che dà fastidio davvero è la pagina di stato ordine (app/orders/[id]/page.tsx:528), dove la mappa è `h-44 w-full` in mezzo alla cronologia della consegna, con contenuto sopra e sotto. Abbasso la severità rispetto alla segnalazione: è attrito recuperabile (si può iniziare lo scorrimento fuori dalla mappa), non un blocco; e su /near la mappa si vede solo se la persona sceglie la vista Mappa, dove trascinare è ciò che vuole fare.

**Come si ripara:** Passare le opzioni a Leaflet: su touch `dragging: false` con un tocco esplicito «attiva la mappa», oppure il plugin gestureHandling; in ogni caso `scrollWheelZoom: false`. Priorità alla mappa dentro la pagina di stato ordine, che sta in mezzo al contenuto.

### Il codice per la «zona sicura» dell'iPhone c'è dappertutto ma non funziona: manca viewport-fit

**Dove:** `app/layout.tsx:69-74 (export `viewport`, senza `viewportFit`); dipendono da lui app/globals.css:199 e 208, components/StickyAddToCart.tsx:53-57, app/checkout/page.tsx:1072-1073, app/rider/orders/[id]/page.tsx:269, components/ConfirmDialog.tsx:123, components/orders/ContactSheet.tsx:87` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. L'export `viewport` di app/layout.tsx dichiara solo `width`, `initialScale`, `maximumScale` e `themeColor`: nessun `viewportFit`. Il grep su app/, components/, next.config.js e public/ per `viewportFit`/`viewport-fit` non trova nulla in tutto il progetto. Senza `viewport-fit=cover` le `env(safe-area-inset-*)` valgono zero, quindi la classe `.pb-safe` e tutti i `calc(...)` elencati oggi non fanno niente. Da correggere insieme al doppione, perché due punti conterebbero l'inset DUE volte appena lo si accende: la barra del checkout ha sia `pb-[calc(0.75rem+env(safe-area-inset-bottom))]` (riga 1072) sia `style={{bottom:'calc(env(safe-area-inset-bottom,0px) + …)'}}` (riga 1073), e StickyAddToCart ha `pb-safe` nella classe (riga 53) più lo stesso inset dentro il `bottom` (riga 57).

**Come si ripara:** Aggiungere `viewportFit: 'cover'` all'export `viewport` di app/layout.tsx e, nello stesso lavoro, togliere il doppione: nella barra del checkout tenere solo il padding e mettere `bottom: var(--altezza-banner-cookie)`; in StickyAddToCart togliere `pb-safe` OPPURE l'inset dentro il `calc`, non tutti e due.

### Le notifiche push usano un'icona SVG che Chrome su Android non disegna

**Dove:** `public/sw.js:171-172 (`icon: data.icon || '/icon-192.svg'`, `badge: '/icon-192.svg'`)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. Il service worker punta a `/icon-192.svg` sia per `icon` sia per `badge` della notifica; Chrome su Android non renderizza SVG nelle notifiche e mostra l'icona generica del browser al posto del marchio. Il file giusto esiste già: `public/icon-192.png` (6 KB, presente nella cartella) ed è già dichiarato nel manifest. Il `badge`, che è la sagoma nella barra di stato, andrebbe inoltre monocromatico su trasparente.

**Come si ripara:** Usare `/icon-192.png` nel campo `icon` e preparare un `badge-96.png` monocromatico da 96×96 per il campo `badge`.

### Il manifest blocca l'app in verticale e non ha le schermate per la finestra d'installazione

**Dove:** `public/manifest.json:9 (`"orientation": "portrait"`); assenti nel file: `screenshots`, `id`, `display_override`` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato leggendo tutto il manifest. ① `"orientation": "portrait"` impone il verticale all'app installata: chi tiene il telefono fissato in orizzontale non può girare la vetrina, e WCAG 1.3.4 chiede di non vincolare il contenuto a un solo verso quando non è essenziale — per un catalogo di negozi non lo è. ② Non esistono i campi `screenshots` (quindi Chrome su Android mostra la finestra d'installazione ridotta invece di quella ricca), né `id`, né `display_override`.

**Come si ripara:** Togliere `orientation` (o metterlo su `any`) e aggiungere `screenshots` con 2-3 immagini `form_factor: "narrow"` più una `"wide"`, oltre a un `id` stabile (es. `"/?pwa"`) perché aggiornamenti futuri del manifest non creino una seconda installazione.

### «Rimuovi» nel carrello è alto quanto una riga di testo: si sbaglia mira col pollice

**Dove:** `app/cart/page.tsx:328-334 (`className="text-ink-500 hover:text-secondary-600 text-sm ml-2 flex items-center gap-1"`)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato: la classe è esattamente quella citata, senza nessun padding verticale. L'area toccabile è quindi l'altezza della riga a `text-sm` (circa 20px), sotto il minimo di 24×24 di WCAG 2.5.8 e molto sotto i 44px consigliati sul telefono. Sta inoltre a `ml-2` (8px) dal pulsante «−» dello stepper, che è invece `w-10 h-10` (40px, riga 295): bersaglio piccolo accanto a un bersaglio grande, con conseguenze diverse (togliere il prodotto invece di scalare la quantità).

**Come si ripara:** Aggiungere padding al pulsante (es. `px-2 py-2 -mx-2` per non spostare l'allineamento visivo) e portare la distanza dallo stepper ad almeno 12px.

### Nella barra d'acquisto della scheda prodotto i tasti «+» e «−» sono 36px, nel carrello 40px

**Dove:** `components/StickyAddToCart.tsx:82 e 92 (`w-9 h-9`); confronto: app/cart/page.tsx:295 e 315 (`w-10 h-10`)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. I due tasti della quantità dentro la barra fissa in fondo sono `w-9 h-9` (36×36px), attaccati l'uno all'altro dentro la stessa pillola bordata, sotto i 44px indicati da Apple e Google come minimo per il dito. Lo stesso identico comando nella pagina carrello è `w-10 h-10` (40px): due misure diverse per lo stesso gesto nello stesso funnel.

**Come si ripara:** Portarli a `w-11 h-11` (44px) qui e nel carrello, così la misura è una sola in tutto il funnel.

### I menù a tendina si chiudono solo con `mousedown`, e il mega-menu delle categorie non ha nessuna X su mobile

**Dove:** `components/CategoryBar.tsx:74 (mega-menu) e 131-188 (il pannello, senza pulsante di chiusura e senza velo); components/Navbar.tsx:283 (menù account); components/SearchBar.tsx:140 (suggerimenti)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato in parte col file, in parte per comportamento noto di Safari iOS. Fatti dal codice: tutti e tre i pannelli si chiudono solo con `document.addEventListener('mousedown', …)` — nessun `touchstart` né `pointerdown` in nessuno dei tre file (grep). Il pannello del mega-menu (CategoryBar.tsx:131-188) non ha nessun pulsante di chiusura e il suo contenitore è `pointer-events-none` senza velo dietro: le uniche vie d'uscita sono toccare una categoria o ritoccare il pulsante «Tutte le categorie», e la CategoryBar è montata anche su mobile (Navbar.tsx:213-216). Su Safari iOS gli eventi del mouse vengono sintetizzati solo per elementi considerati cliccabili, quindi un tocco su un `<div>` qualunque può non chiudere il pannello — questa parte non l'ho potuta provare su un iPhone vero.

**Come si ripara:** Passare da `mousedown` a `pointerdown` (o affiancare `touchstart`) nei tre file e aggiungere al pannello del mega-menu una X di chiusura visibile su mobile, come già fanno il pannello filtri e quello account.

### Ogni pagina corta scorre a vuoto: il contenuto principale è forzato a un'intera schermata

**Dove:** `app/layout.tsx:127 (`<main id="main-content" className="min-h-screen">`); app/globals.css:207-209 (padding di `--tabbar-height` in fondo al body su mobile)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. Il `<main>` ha `min-h-screen` (almeno 100vh) ma sopra di lui, nello stesso flusso, ci sono `<Navbar>` con dentro PromoTicker, riga logo+ricerca e CategoryBar (la variabile `--header-height` in globals.css:106 dichiara ~144px), e sotto ci sono `<Footer>` più il `padding-bottom: calc(var(--tabbar-height) + …)` del body (globals.css:208, `--tabbar-height: 72px`). Il documento supera quindi SEMPRE l'altezza dello schermo, anche su pagine con due righe di contenuto (carrello vuoto, pagina non trovata, conferma d'ordine): resta un blocco di sfondo vuoto prima del piè di pagina.

**Come si ripara:** Sostituire `min-h-screen` con `min-h-[calc(100vh-var(--header-height)-var(--tabbar-height))]`, oppure rendere il body un flex a colonna con `flex-1` sul main.

### In cima a ogni pagina scorre una striscia con dentro un link in movimento

**Dove:** `components/PromoTicker.tsx:72-79 (il link «Promozioni attive · Scopri» dentro la traccia animata) e 84-90; app/globals.css:250-261 (`animation: marquee 24s linear infinite` e le sole pause `:hover`, `:focus-within`, `:active`)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. La striscia è montata dentro la Navbar (Navbar.tsx:90), quindi in cima a tutte le pagine, e la traccia ha `animate-marquee` = `marquee 24s linear infinite`. Quando ci sono promozioni attive (`showPromo`) la traccia contiene un vero `<Link href="/promozioni">` che si sposta insieme al testo: su telefono è un bersaglio in movimento. Le uniche pause dichiarate in globals.css sono `:hover`, `:focus-within` e `:active`: sul touch non c'è hover, e non esiste nessun comando di pausa visibile, che è quello che chiede WCAG 2.2.2 per un movimento automatico più lungo di cinque secondi. (Resta attiva la scorciatoia `prefers-reduced-motion` a globals.css:213, che però copre solo chi ha impostato quella preferenza.)

**Come si ripara:** Fermare la marquee sotto la misura `md` (annunci fissi, eventualmente a rotazione lenta con dissolvenza) oppure aggiungere un pulsante pausa/riprendi sempre visibile. In ogni caso il link «Promozioni attive» non dovrebbe stare dentro la parte che si muove.

### Il banner d'installazione promette le «notifiche ordini», ma installare non attiva nessuna notifica

**Dove:** `components/PWAInstallBanner.tsx:100-102 («Accesso veloce + notifiche ordini. Niente app store.»); components/PushNotificationOptIn.tsx, richiamato solo da app/profile/settings/page.tsx:9 e 484` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. Il testo del banner è esattamente quello citato, e il grep su app/ e components/ mostra che `PushNotificationOptIn` è importato e usato in un solo punto di tutto il sito: la pagina /profile/settings (riga 484). L'iscrizione alle notifiche non viene mai proposta dopo l'installazione né nel momento in cui servirebbe (ordine appena confermato, rider che parte). Chi installa credendo di aver attivato le notifiche non riceverà niente.

**Come si ripara:** Due cose piccole e separate: correggere il testo del banner («accesso veloce dall'icona, funziona anche con rete debole») e proporre l'attivazione delle notifiche nel momento giusto — nella pagina di conferma ordine, dicendo a cosa servono («ti avvisiamo quando il rider parte») — riusando il componente che esiste già.

### «Compra ora · paghi alla consegna» atterra su un checkout con la carta già selezionata

**Dove:** `app/product/[id]/page.tsx:914-921 (handleBuyNow → /checkout); app/checkout/page.tsx:424 (useState(stripeAvailable ? 'card' : 'cod'))` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Il pulsante ad alta intenzione della scheda prodotto dichiara il metodo nel suo testo, ma il checkout inizializza `paymentMethod` a 'card' ogni volta che NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY è configurata. Chi ha cliccato proprio per non pagare online trova preselezionato il pagamento anticipato. Abbasso la severità rispetto al collega: la scelta è visibile e cambiabile nello step 3, non è un blocco né una cifra sbagliata — resta una promessa disattesa nel testo del pulsante.

**Come si ripara:** handleBuyNow salva l'intenzione (es. sessionStorage 'mc_metodo_scelto' = 'cod') e il checkout inizializza paymentMethod da lì; in alternativa il pulsante diventa «Compra ora» e la scelta resta al checkout.

### Su telefono il pulsante «Procedi al checkout» sta in fondo, dopo tutti i prodotti e il carosello di upsell

**Dove:** `app/cart/page.tsx:194 (grid-cols-1 lg:grid-cols-3), 196-355 (colonna prodotti + CartUpsell), 414-419 (CTA nella colonna destra); components/MobileTabBar.tsx:48-56` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO come struttura: su mobile la griglia collassa a una colonna e il riepilogo con «Procedi al checkout» viene dopo l'elenco articoli, l'upsell «Completa con» e il resto. Il checkout una barra fissa in basso ce l'ha (page.tsx:1071-1094) e la scheda prodotto pure (StickyAddToCart), il carrello no; la MobileTabBar resta visibile su /cart (nasconde solo /checkout, /seller, /rider, auth). Tengo la severità a minore: è una perdita di conversione per posizionamento, non un dato falso né un blocco.

**Come si ripara:** Aggiungere al carrello la stessa barra fissa del checkout («Totale {finalTotal}» + «Procedi al checkout», lg:hidden fixed inset-x-0 bottom-0) con l'offset di StickyAddToCart (env(safe-area-inset-bottom) + var(--tabbar-height) + var(--altezza-banner-cookie)) e pb-28 lg:pb-8 sul contenitore.

### Su telefono il pulsante di conferma si spegne senza dire perché (sul desktop è già stato corretto)

**Dove:** `app/checkout/page.tsx:1082 (disabled vero sulla barra mobile); components/checkout/OrderSummary.tsx:98-113 (aria-disabled + scroll sul primo [role="alert"])` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Il pulsante desktop usa `type={disabled ? 'button' : 'submit'}`, `disabled={isCheckingOut}`, `aria-disabled` e un onClick che porta sul primo riquadro che spiega il blocco. La barra fissa mobile — l'unico pulsante visibile su telefono — usa il `disabled` vero: esce dal giro del Tab, non risponde al tocco e non spiega niente. Abbasso a minore perché i riquadri esplicativi sono comunque nella pagina, sopra: la persona che scorre li trova.

**Come si ripara:** Riportare sulla barra mobile lo schema di OrderSummary: disabled={isCheckingOut}, aria-disabled={bloccato || isCheckingOut}, type={bloccato ? 'button' : 'submit'} e onClick che scorre e mette il fuoco sul primo [role="alert"].

### Per registrarsi e finire l'ordine bisogna prima dichiarare se si è Acquirente, Venditore o Rider

**Dove:** `app/sign-up/page.tsx:175-196 (il fieldset non guarda returnTo), 262-264 (testo del pulsante), 53 (returnTo già letto)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Il modulo di registrazione è identico per tutti e apre con «Come vuoi usare MyCity?» e tre mattonelle; il pulsante finale dice «Registrati come acquirente». Chi ci arriva dal checkout — uno che vuole solo pagare il pane — si trova una scelta di ruolo che non lo riguarda, dentro il funnel d'acquisto. Il ruolo di default è già 'buyer', quindi non nasce nessun dato sbagliato: è attrito, per questo minore e non grave. L'informazione per toglierlo c'è già: `returnTo` è letto alla riga 53.

**Come si ripara:** Se returnTo inizia con /checkout (o /cart): forzare role='buyer', nascondere il fieldset dei ruoli e cambiare il testo del pulsante in «Crea l'account e continua l'ordine».

### Nel riepilogo del checkout due varianti dello stesso prodotto sono due righe identiche

**Dove:** `components/checkout/CartGroupsList.tsx:31 (key={item.id}) e 43-46 (nessun variantLabel); confronto app/cart/page.tsx:246` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. La lista di destra del checkout stampa foto, nome, «×quantità» e prezzo: `item.variantLabel` non compare mai, mentre il carrello lo mostra. Un carrello con «Maglietta (M)» e «Maglietta (L)» mostra due righe indistinguibili. In più la key è `item.id`, che per due varianti dello stesso prodotto è duplicata (nel carrello la chiave giusta è `${id}::${variantId}`). Minore e non grave: nessun importo sbagliato e la variante è visibile un passo prima, nel carrello.

**Come si ripara:** Stampare item.variantLabel sotto il nome, come fa il carrello, e usare key={`${item.id}::${item.variantId ?? ''}`}.

### Due numerazioni degli step nella stessa schermata, e lo step «Conferma» non si accende mai

**Dove:** `components/checkout/StepIndicator.tsx:38-42 (CHECKOUT_STEPS) e 55-72; app/checkout/page.tsx:833 (currentStep={2}), app/cart/page.tsx:192 (currentStep={1}); StepCard n={1}/n={2}/n={3} alle righe 849, 861, 894` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO (il collega cita StepIndicator.tsx:207-211, ma il file è lungo 72 righe: il contenuto però è quello). In cima al checkout la barra dice «1 Carrello · 2 Indirizzo · 3 Conferma» con il 2 acceso; subito sotto partono le schede numerate «1 Indirizzo di consegna», «2 Quando vuoi riceverlo», «3 Come paghi». Due numerazioni sovrapposte in cui il «3» in alto e il «3» in basso significano cose diverse. E `grep currentStep=` dà solo due chiamate in tutto il progetto (cart=1, checkout=2): lo step 3 non è mai attivo, la barra resta per sempre a «2 di 3» e fa credere che dopo il pagamento ci sia un altro passo.

**Come si ripara:** Togliere la numerazione dalle StepCard (icona + titolo bastano) oppure togliere la barra dal checkout; e rendere «Conferma» attivo quando indirizzo e metodo sono a posto.

### La barra fissa in basso conta due volte la safe-area dell'iPhone

**Dove:** `app/checkout/page.tsx:1072-1073; components/StickyAddToCart.tsx:54 e 57; app/globals.css:199 (.pb-safe)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO in entrambi i punti. La barra di conferma del checkout ha insieme la classe `pb-[calc(0.75rem+env(safe-area-inset-bottom))]` e lo stile `bottom: calc(env(safe-area-inset-bottom, 0px) + var(--altezza-banner-cookie, 0px))`. StickyAddToCart ha la classe `pb-safe` (che in globals.css:199 è padding-bottom: env(safe-area-inset-bottom)) e lo stesso `bottom: calc(env(safe-area-inset-bottom, 0px) + …)`. Su un iPhone con la barra gestuale l'elemento è sollevato di 34px e ne ha altri 34 di vuoto dentro: la CTA si alza e ruba spazio nella parte più preziosa dello schermo.

**Come si ripara:** Tenere una sola compensazione: se l'elemento è già spostato con bottom: calc(env(safe-area-inset-bottom) + …), togliere pb-safe / il pb-[calc(...+env(safe-area-inset-bottom))] e lasciare un padding fisso.

### Sulla scheda prodotto la barra «ti mancano X alla spedizione gratis» ignora il carrello, e il badge accanto la contraddice

**Dove:** `app/product/[id]/page.tsx:748 (subtotal={price * qty}), 363 (freeShipping = price >= soglia) e 854-856 (badge)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. FreeShippingProgress riceve `price * qty`, cioè solo il prodotto aperto: con 25 € già nel carrello e un articolo da 6 € scrive «Ti mancano 24,00 € alla spedizione gratis» quando in realtà la soglia è superata. Nella stessa colonna il badge «Spedizione gratuita» usa `freeShipping = price >= FREE_SHIPPING_THRESHOLD`, cioè il prezzo UNITARIO: con due pezzi da 18 € la barra dice «Hai la spedizione gratis» e il badge non compare. Due indicatori sulla stessa cosa che dicono il contrario.

**Come si ripara:** Passare alla barra cartTotal(getCart()) + price * qty e usare la stessa grandezza per il badge, così i due segnali dicono sempre la stessa cosa.

### «Niente intermediari, niente commissioni nascoste» scritto sotto la riga «Consegna MyCity 3,00 €»

**Dove:** `app/cart/page.tsx:435-442 (riquadro «Lo sapevi?»); lib/constants.ts:64 (fee 3 €) e 74 (MARKETPLACE_FEE_BPS = 1000, cioè 10%)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Il riquadro sta nella colonna del riepilogo, poche righe sotto quella che addebita 3 € di «Consegna MyCity», su una piattaforma che trattiene anche il 10% al negozio. La frase non regge il confronto con i numeri che le stanno sopra, e in questo carrello la fiducia è l'unica leva.

**Come si ripara:** Riscrivere su un vantaggio vero e verificabile («Ogni ordine va direttamente al negozio della tua città: preparano loro, consegna un rider di Piacenza») togliendo «niente commissioni nascoste», oppure dichiarare le due voci in una nota trasparente.

### Il claim «Carta o contanti, decidi tu» in home si corregge subito dal Home builder, senza pubblicare

**Dove:** `app/page.tsx:42-46 (sottotitolo di ripiego, variante hero B) e 89 (heroDefaults); components/home-sections/HomeSectionRenderer.tsx:85 (c.subhead vince sul default); components/admin/home/HomeSectionConfigForm.tsx:129 (campo «Sottotitolo»)` · **Area:** Flussi di acquisto · **Corsia:** config

CONFERMATO, corsia config compresa. Il sottotitolo della variante B promette «Carta o contanti, decidi tu: … puoi pagare alla consegna», che non corrisponde ai metodi reali del checkout. A differenza di scheda prodotto e carrello, qui è solo un ripiego: HomeSectionRenderer usa `c.subhead ? c.subhead : heroDefaults.subhead`, quindi un sottotitolo scritto nella sezione hero del Home builder vince e la home cambia senza toccare il codice.

**Come si ripara:** Da /admin/home, sezione hero, campo «Sottotitolo»: «Ordini dai negozi della tua città e paghi in contanti alla consegna — oppure con carta, subito. A casa in 30-60 minuti.» Poi allineare anche il ripiego in app/page.tsx alla prossima modifica di codice.

### La pagina di reset password mostra il messaggio tecnico inglese preceduto da «Errore:»

**Dove:** `/home/user/mycity/app/reset-password/page.tsx righe 31-47` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO, ma severità abbassata da grave a minore. `translateError` copre sei casi (same as/should be different, weak/at least, expired/jwt, invalid+token, rate/too many, not authenticated/no session); il ripiego finale è `return msg ? \`Errore: ${msg}\` : 'Errore durante l'aggiornamento della password'`, col commento «Niente match: mostra il messaggio originale per debug» rimasto in produzione. Chi ci cade legge il testo grezzo di Supabase in inglese preceduto da «Errore:». Abbasso la severità perché i sei casi coprono gli errori frequenti del reset: il ramo grezzo è residuale, non la strada principale.

**Come si ripara:** Sostituire il ripiego con «Non siamo riusciti ad aggiornare la password. Richiedi un nuovo link qui sotto», mandando il messaggio originale a Sentry (captureError) invece che a schermo.

### L'ordinamento «Più recensiti» ordina in realtà per voto medio

**Dove:** `/home/user/mycity/messages/it.json riga 121 (search.sort.rating = «Più recensiti») e en.json riga 121 («Most reviewed») · usato in /home/user/mycity/app/search/page.tsx riga 186 · ordinamento in /home/user/mycity/components/ProductGrid.tsx righe 314-320` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO, severità abbassata da grave a minore (etichetta fuorviante su un ordinamento, nessun effetto su soldi o fiducia). ProductGrid: `if (sort === 'rating') arr.sort((a,b) => (ratings[b.id]?.avg ?? 0) - (ratings[a.id]?.avg ?? 0))` — ordina per MEDIA dei voti, non per numero di recensioni. Un prodotto con una sola recensione a 5 stelle scavalca uno con quaranta recensioni a 4,8. La prova che l'etichetta è sbagliata è dentro il sito: lo stesso ordinamento nella scheda prodotto si chiama «Voto più alto» (app/product/[id]/page.tsx riga 1056).

**Come si ripara:** it.json → «Voto più alto», en.json → «Highest rated». Se invece si vuole davvero l'ordinamento per numero di recensioni, ordinare per `count` e tenere la parola attuale.

### Refusi nei messaggi d'errore sulla strada dei soldi: «l ordine», «gia», «all assistenza»

**Dove:** `/home/user/mycity/app/api/orders/cod/route.ts righe 157, 202, 207 · /home/user/mycity/app/api/orders/[id]/cancel/route.ts righe 40, 50, 61` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO con grep sui due file. Sei messaggi che arrivano davvero al browser: «Impossibile registrare l ordine, riprova.» (cod 157), «Ordine gia in corso, attendi qualche secondo.» (cod 202 e 207), «Impossibile leggere l ordine» (cancel 40), «Il negozio ha già accettato l ordine, non puoi più annullarlo.» (cancel 50), «Ordine già incassato in contanti: scrivi all assistenza per la restituzione.» (cancel 61). Apostrofi e accenti mancanti proprio dove si crea o si annulla un ordine.

**Come si ripara:** «l'ordine», «già in corso», «all'assistenza», con apostrofo tipografico o escape, come già fa app/seller/orders/[id]/page.tsx.

### Due refusi visibili: «e scaduto: e stato» all'accesso e «piu tardi» nelle impostazioni

**Dove:** `/home/user/mycity/app/sign-in/page.tsx riga 27 · /home/user/mycity/app/profile/settings/page.tsx righe 221 e 233 · /home/user/mycity/components/Segnala.tsx riga 58` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO riga per riga. sign-in riga 27: «Il controllo anti-bot e scaduto: e stato rigenerato, premi di nuovo Accedi.» — due accenti mancanti in una riga sola, sulla schermata di accesso, e la legge chi ha appena sbagliato la password. settings righe 221 e 233: «Esportazione non riuscita. Riprova piu tardi.» ripetuto due volte. Segnala riga 58: «Segnalazione ricevuta. La guardiamo e ti diciamo com è andata.» — «com'è».

**Come si ripara:** «è scaduto: è stato», «più tardi», «com'è andata».

### Il carrello scrive «1 articoli»

**Dove:** `/home/user/mycity/app/cart/page.tsx righe 198 (titolo) e 362 (riepilogo), contro riga 403` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Riga 198: `({count} articoli)` nel titolo «Il tuo carrello»; riga 362: `{count} articoli` nel riepilogo. Nessuna delle due distingue il singolare, quindi col caso più frequente — un solo prodotto — si legge «Il tuo carrello (1 articoli)». La forma giusta esiste già nella stessa pagina ma solo nel testo per i lettori di schermo (riga 403: `{count === 1 ? 'articolo' : 'articoli'}`).

**Come si ripara:** Usare l'espressione della riga 403 anche alle righe 198 e 362.

### Un avviso d'errore che dice soltanto «Errore»

**Dove:** `/home/user/mycity/components/ProductCard.tsx riga 104 · stesso ripiego in /home/user/mycity/app/orders/[id]/return/page.tsx riga 88, /home/user/mycity/components/PushNotificationOptIn.tsx riga 119, /home/user/mycity/components/rider/CashConfirmDialog.tsx riga 89, /home/user/mycity/app/rider/onboarding/page.tsx riga 126 e altri` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO, con una precisazione sul conteggio. In ProductCard riga 104 è il ripiego pieno: `if (err.message === 'AUTH_REQUIRED') … else toast.error('Errore')` — qualunque altro errore diventa la parola «Errore», senza dire cosa è successo né cosa fare, mentre il cuoricino ha già fatto l'animazione come se avesse funzionato. Negli altri punti la stringa è il ramo `e instanceof Error ? e.message : 'Errore'`, quindi scatta solo quando viene lanciato qualcosa che non è un Error: reale ma più raro dei «altri 19 punti» dichiarati. In tutto la stringa 'Errore' compare 23 volte fra app/ e components/. Il messaggio buono esiste già in lib/errors.ts («Qualcosa non ha funzionato. Riprova fra un momento.»).

**Come si ripara:** Sostituire ogni `'Errore'` secco con `friendlyError(err)`, già importato in quasi tutti quei file.

### La regola della password è scritta nel testo grigio che sparisce appena scrivi

**Dove:** `/home/user/mycity/app/sign-up/page.tsx riga 226 · proprietà `hint` disponibile in /home/user/mycity/components/ui/Field.tsx (tipo Common, righe 88-95)` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Il PasswordInput della registrazione ha `placeholder="Almeno 8 caratteri"`: il segnaposto sparisce al primo carattere digitato, cioè proprio quando la regola servirebbe. Il tipo Common di Field.tsx espone `hint`, che resta sempre visibile sotto il campo, e qui non viene usato. Se poi la password è corta, l'errore torna da Supabase in inglese (vedi il difetto sulle traduzioni degli errori di autenticazione).

**Come si ripara:** `hint="Almeno 8 caratteri"` e segnaposto vuoto.

### Il tempo di risposta dell'assistenza è promesso in due modi diversi

**Dove:** `/home/user/mycity/app/contact/page.tsx righe 91, 69 e 53 · /home/user/mycity/app/help/page.tsx riga 117 · /home/user/mycity/app/faq/page.tsx riga 190 · /home/user/mycity/app/seller/help/page.tsx riga 83 · /home/user/mycity/app/rider/help/page.tsx riga 165 · /home/user/mycity/app/seller/layout.tsx righe 55 e 137` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO con grep. Quattro schede di contatto dicono «Risposta entro 24h» secco (contact 91, help 117, seller/help 83, rider/help 165); la conferma dopo l'invio dice «entro 24h lavorative» (contact 69) e la FAQ «entro 24 ore lavorative» (faq 190). Sono due promesse diverse: chi scrive venerdì sera legge 24 ore e ne aspetta 72. Stessa doppia versione per i venditori dentro lo stesso file: «Approvazione entro 48h» (seller/layout riga 55) contro «entro 48 ore lavorative» (riga 137).

**Come si ripara:** Una sola formula ovunque, quella vera: «Risposta entro 24 ore lavorative» e «Approvazione entro 48 ore lavorative».

### Tre puntini normali dove tutto il resto del sito usa il carattere puntini di sospensione

**Dove:** `/home/user/mycity/components/SearchBar.tsx riga 34 · /home/user/mycity/components/Navbar.tsx riga 207 · /home/user/mycity/app/sign-in/page.tsx riga 254 · /home/user/mycity/app/sign-up/page.tsx riga 263 · /home/user/mycity/app/profile/settings/page.tsx righe 586 e 619 · /home/user/mycity/app/messages/[id]/page.tsx riga 297 · /home/user/mycity/app/shared-cart/page.tsx riga 92 · /home/user/mycity/components/StoreLocationPicker.tsx riga 234` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO riga per riga (esclusi gli spread operator del codice). I punti fuori riga sono fra i più visti del sito: «Cerca prodotti, negozi, categorie...» (SearchBar 34), «Cerca a Piacenza...» (Navbar 207), «Accesso in corso...» (sign-in 254), «Registrazione in corso...» (sign-up 263), «Annullamento...» e «Invio richiesta...» (settings 586 e 619), «Scrivi un messaggio...» (messages 297), «Carico la lista...» (shared-cart 92), «Ricerca posizione...» (StoreLocationPicker 234). Nel resto del sito il carattere «…» compare 118 volte nei .tsx: la convenzione c'è, questi la rompono e la differenza di spaziatura si vede.

**Come si ripara:** Sostituire «...» con «…» in questi punti.

### Al venditore si parla di «buyer» e di «Upload»

**Dove:** `/home/user/mycity/app/seller/promotions/page.tsx riga 98 · /home/user/mycity/app/seller/stories/page.tsx righe 189 e 219` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. promotions riga 98: `toast.success('Promozione creata! È già attiva e visibile ai buyer.')`. stories riga 189: il pulsante durante il caricamento mostra `{uploading ? 'Upload…' : 'Pubblica (24h)'}`. stories riga 219: `label="Link prodotto/categoria (opz.)"`. Il resto della sezione venditore è in italiano piano, quindi queste tre stonano davanti a negozianti che non hanno chiesto di imparare l'inglese.

**Come si ripara:** «…visibile ai clienti», «Carico…», «(facoltativo)».

### Due conferme di cancellazione senza dire cosa si perde

**Dove:** `/home/user/mycity/app/lists/[id]/page.tsx riga 246 · /home/user/mycity/app/seller/stories/page.tsx riga 167` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Le due chiamate sono `confirmDialog({ title: 'Eliminare la lista?', danger: true })` e `confirmDialog({ title: 'Rimuovere storia?', danger: true })`: solo il titolo, pulsante rosso, nessun campo `message`. Le altre conferme del sito la conseguenza la spiegano — per esempio in app/admin/users/page.tsx il message dice cosa viene cancellato e che l'azione è irreversibile. Su un'azione che non si può annullare il titolo da solo non basta a decidere.

**Come si ripara:** Aggiungere il campo message: «La lista e i prodotti salvati dentro andranno persi. Non si può annullare.» e «La storia sparirà subito dalla tua vetrina.»

### Testi tecnici che escono dal database e finiscono davanti a una persona

**Dove:** `/home/user/mycity/app/admin/users/page.tsx righe 519 e 619 · /home/user/mycity/app/api/returns/[id]/decide/route.ts righe 47 e 148` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. admin/users righe 519 e 619: il message della conferma dice «<nome> verrà rimosso da auth.users e il profilo anonimizzato…» — «auth.users» è il nome di una tabella, non una frase (chi legge è però lo staff, non il cliente: per questo resta minore). Rotta resi riga 47: `ApiErrors.conflict(\`Reso gia' in stato ${ret.status}\`)` → il venditore che decide due volte legge «Reso gia' in stato APPROVED», con lo stato grezzo in inglese maiuscolo e l'apostrofo battuto a macchina. Riga 148: `ApiErrors.badGateway('Rimborso fallito: ' + err.message)` → il testo d'errore di Stripe, in inglese, arriva a schermo.

**Come si ripara:** «L'account verrà cancellato e i dati personali anonimizzati»; «Questo reso è già stato deciso» senza lo stato grezzo; «Il rimborso non è partito: riprova o scrivi all'assistenza», mandando il testo di Stripe ai log.

### Il mega-menu «Tutte le categorie» è un pannello lunghissimo senza altezza massima

**Dove:** `components/CategoryBar.tsx:133-190 (pannello absolute z-50, max-w-[900px], grid-cols-2 su mobile); grep di 'max-h' e 'overflow-y' sul file: zero occorrenze` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO nella sostanza, severità corretta al ribasso. Il pannello (righe 133-190) non ha né max-height né overflow-y: elenca tutte le categorie principali (8 nel seed di migrations/002, riga 98-106, più quelle aggiunte dopo) con fino a sei sottocategorie ciascuna, in griglia a 2 colonne su telefono: molto più alto di uno schermo. Correggo però la gravità: essendo il pannello 'absolute' e l'intestazione 'relative' su mobile (Navbar:89), il contenuto in fondo È raggiungibile scorrendo la pagina — è scomodo e si sovrappone ai contenuti sotto, non è irraggiungibile. Difetto reale ma non bloccante.

**Come si ripara:** Dare al pannello max-h-[70vh] overflow-y-auto con overscroll-contain, oppure su mobile aprirlo come foglio a scomparsa dal basso.

### Le stesse quattro promesse sono ripetute tre volte sulla home e una quarta nel piè di pagina

**Dove:** `components/home-sections/HomeSectionRenderer.tsx:54-60 (DEFAULT_TRUST_BULLETS), usato a :230 (liveActivity) e a :261 (trustRow), entrambi in lib/home-site.ts:239-240 · hero :146-158 · components/Footer.tsx:213-222` · **Area:** Navigazione e gerarchia visiva · **Corsia:** config

CONFERMATO. L'array DEFAULT_TRUST_BULLETS (righe 54-60: pagamento alla consegna, 100% commercianti locali, consegna in 30-60 min, reso entro 14 giorni) è mappato due volte: nella card «Perché scegliere MyCity» dentro liveActivity (riga 230) e nella banda trustRow (riga 261). Entrambe le sezioni sono nell'ordine di default (lib/home-site.ts righe 239-240). Le stesse promesse in forma abbreviata sono nell'hero (righe 146-158: «Paghi alla consegna», «In 30-60 minuti…», «Account solo per confermare») e una quarta volta nel piè di pagina — dove la riga esatta è 213-222, non 229-241 come indicato.

**Come si ripara:** Tenere una sola occorrenza: togliere la banda trustRow dall'ordine di default nel Home builder (la card dentro Attività live la copre già), o viceversa.

### Due pulsanti primari identici «Inizia a esplorare» sulla stessa home, e portano a un indice senza foto

**Dove:** `components/home-sections/HomeSectionRenderer.tsx:105-113 (hero, href /categorie, testo = heroDefaults.ctaPrimary) · app/page.tsx:32 (ctaPrimary: 'Inizia a esplorare') · components/home/HowItWorks.tsx:86-95 (stesso testo scritto a mano, stesso href, stesse classi) · app/categorie/page.tsx` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO, con un caveat. Il pulsante di HowItWorks (righe 86-95) ha testo «Inizia a esplorare» scritto a mano, href /categorie e le stesse identiche classi del primario dell'hero ('bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-full font-semibold shadow-warm'). Il testo dell'hero viene da heroDefaults.ctaPrimary, che in app/page.tsx riga 32 vale esattamente 'Inizia a esplorare' — quindi i due pulsanti sono gemelli. Caveat verificato: esiste una seconda variante dell'hero (app/page.tsx riga 48, 'Scopri cosa c'è oggi'), quindi la sovrapposizione perfetta riguarda la variante di default, non il 100% delle visite. Confermata anche la destinazione povera: app/categorie/page.tsx non contiene nessun <Image>/img (grep a vuoto), è un elenco testuale, mentre due sezioni più giù CategoryShowcase mostra le stesse categorie con le foto.

**Come si ripara:** Lasciare una sola chiamata primaria (nell'hero) e mandarla dove ci sono i prodotti (/search o la categoria più venduta); in «Come funziona» sostituirla con un link testuale secondario.

### La sezione «Cosa cerchi oggi? — Tutte le categorie» ne mostra sei e non ha il link per vedere le altre

**Dove:** `components/CategoryShowcase.tsx:97 (categories.slice(0, 6)) dentro il blocco 'categories' di components/home-sections/HomeSectionRenderer.tsx:174-188 (sottotitolo 'Tutte le categorie del mercato locale' alla riga 183) · migrations/002_categories_and_extras.sql:98-106` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. CategoryShowcase taglia a sei (riga 97: categories.slice(0, 6)) mentre il sottotitolo di default della sezione promette «Tutte le categorie del mercato locale» (renderer riga 183). Il seed di migrations/002 inserisce otto categorie principali (righe 98-106: alimentari, abbigliamento, casa, elettronica, libri, giardino, bellezza, sport) — la ICON_MAP di CategoryBar ne cita anche giocattoli — quindi almeno due o tre restano tagliate. Confermato anche che manca la via d'uscita: grep di 'Vedi tutt' su CategoryShowcase.tsx non trova nulla, mentre «Prodotti popolari» ha il suo HomeCtaLink 'Vedi tutto' (renderer riga 215).

**Come si ripara:** Aggiungere l'intestazione con «Vedi tutte le categorie →» verso /categorie, come nelle altre due sezioni. Nel frattempo correggere il sottotitolo dal Home builder in «Le categorie più cercate».

### La barra dei tre passi va a capo sui telefoni stretti e il terzo passo non si accende mai

**Dove:** `components/checkout/StepIndicator.tsx:57-72 (flex … gap-4 sm:gap-8 flex-wrap, trattini w-8 sm:w-16, cerchi w-7 h-7) · app/cart/page.tsx:192 (currentStep 1) · app/checkout/page.tsx:833 (currentStep 2)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO, con distinzione fra la parte provata e la parte calcolata. Parte provata: grep di 'StepIndicator' su tutto app/ e components/ restituisce solo due usi, currentStep 1 (cart:192) e currentStep 2 (checkout:833). Nessuna pagina passa currentStep 3, quindi il pallino «Conferma» (CHECKOUT_STEPS riga 40) resta grigio per tutto il percorso e la barra non si completa mai. Parte calcolata (non misurata in browser ma coerente col file): tre passi da cerchio 28 px + gap 8 px + etichetta text-sm, più due trattini w-8 e i gap-4 del contenitore, superano i ~343-358 px utili di un iPhone SE/12, e il contenitore ha flex-wrap alla riga 58, quindi il terzo passo va a capo.

**Come si ripara:** Sotto sm mostrare la forma compatta («Passo 2 di 3 · Indirizzo») o accorciare etichette e trattini; montare l'indicatore con currentStep 3 sulla pagina dell'ordine confermato.

### La colonna del menu account si infila sotto l'intestazione fissa

**Dove:** `components/account/AccountShell.tsx:108 (lg:sticky lg:top-24) contro app/globals.css:106 (--header-height: 9rem) · confronto: app/product/[id]/page.tsx:851 e app/cart/page.tsx:358 usano top-[var(--header-height)]` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. L'aside dell'area account si blocca a top-24 (96 px, riga 108) mentre il token --header-height dichiara 9rem ≈ 144 px (globals.css riga 106) proprio per l'intestazione sticky di desktop (Navbar riga 89: md:sticky md:top-0 z-sticky). Sono 48 px di scarto, quindi la parte alta della card identità finisce dietro la barra terracotta, che avendo z-sticky sta sopra. Confermato che tutte le altre colonne appiccicose usano il token: scheda acquisto prodotto (riga 851) e riepilogo carrello (riga 358).

**Come si ripara:** Sostituire lg:top-24 con lg:top-[var(--header-height)] più un piccolo margine, così l'offset resta scritto in un posto solo.

### Nella pagina dei risultati il carosello sponsorizzato sta sopra il briciolo di pane e sopra il titolo

**Dove:** `app/search/page.tsx:433 (<SponsoredCarousel placement="search_top" />), :435-446 (nav Breadcrumb), :450 (<h1>) · components/SponsoredCarousel.tsx:119 (if (items.length === 0) return null)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. Nella colonna risultati il primo figlio è il carosello a pagamento (riga 433); solo dopo arrivano la nav Breadcrumb «Home › Ricerca» (435-446), l'<h1> «Risultati per …» (450) e la riga conteggio. Chi ha appena cercato non trova subito la conferma di cosa sta guardando. Confermata anche l'attenuante indicata dal collega: con zero campagne il componente si nasconde da solo (SponsoredCarousel riga 119), quindi il difetto si manifesta solo a retail media acceso.

**Come si ripara:** Invertire l'ordine: briciolo di pane, titolo e riga conteggio prima, carosello sponsorizzato subito sotto (resta sopra la griglia, quindi la visibilità venduta non cala).

### La pagina «Tutti i negozi» è l'unica vetrina senza briciolo di pane, e il contatore non segue i filtri

**Dove:** `app/stores/page.tsx:230-239 (intestazione scritta a mano, riga 237 stampa stores.length) · :185 (const filtered) e :295-302 (la griglia usa filtered) · confronto: components/CollectionHeader.tsx usato da /categorie, /category/[slug], /novita, /piu-venduti, /piccoli-prezzi, /promozioni, /regali` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO su entrambi i punti. Primo: l'intestazione è scritta a mano (righe 230-239) — solo <h1> e una riga, nessun CollectionHeader, quindi niente «Home › Negozi», niente occhiello, niente riquadro icona; è la prima voce della barra categorie e non offre nessuna scala per risalire. Secondo: la riga sotto il titolo stampa stores.length (riga 237), cioè il totale non filtrato, mentre i filtri di ricerca/settore alimentano 'filtered' (riga 185) che è quello davvero renderizzato (righe 295 e 302). Con un filtro attivo la pagina continua a dichiarare il totale mentre a schermo restano pochi negozi. Confermato anche il passo orizzontale fuori scala: riga 230 usa 'px-4' senza sm:px-6.

**Come si ripara:** Usare CollectionHeader con breadcrumb [Home, Negozi] come le altre vetrine, e stampare filtered.length nella riga di conteggio tenendo il totale come testo secondario.

### La larghezza del contenuto cambia tre volte lungo il percorso d'acquisto

**Dove:** `app/categorie/page.tsx:35 (max-w-5xl, px-4) · app/store/[id]/page.tsx:109 (max-w-5xl, px-4) · app/checkout/page.tsx:823 (max-w-6xl, px-4 sm:px-6) · app/cart/page.tsx:190 e app/product/[id]/page.tsx:476 (container pieno, px-4 sm:px-6) · app/stores/page.tsx:230 (max-w-7xl, px-4)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO riga per riga. Su un monitor largo il blocco di contenuto passa da 1280 px (home, prodotto, carrello, container di default) a 1024 px (max-w-5xl su /categorie riga 35 e sulla pagina negozio riga 109) a 1152 px (max-w-6xl sul checkout riga 823): il bordo sinistro si sposta a ogni passaggio mentre intestazione e piè di pagina restano larghi. Confermato anche il passo orizzontale disallineato: /categorie, /store/[id] e /stores usano 'px-4' fisso, mentre prodotto, carrello e checkout usano 'px-4 sm:px-6'.

**Come si ripara:** Fissare due larghezze sole e documentarle: piena (container) per catalogo e scoperta, ristretta per i percorsi a modulo; e usare ovunque lo stesso px-4 sm:px-6.

### Nella scheda prodotto il prezzo è quasi grande quanto il titolo e pesa meno del pulsante «+»

**Dove:** `components/ProductCard.tsx:188 (titolo text-[13px]), :208 e :215 (prezzo text-base font-extrabold), :217-222 (pulsante h-11 w-11 bg-primary-600)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. Il prezzo è 'text-base font-extrabold' (16 px, righe 208 e 215) contro un titolo 'text-[13px] font-semibold' (riga 188): tre pixel di differenza. Accanto, il pulsante di aggiunta rapida è un quadrato pieno 'h-11 w-11 rounded-lg bg-primary-600 text-white' (44×44 px, righe 217-222). In una fila di card l'occhio cade sui quadrati colorati e non sui prezzi. Confermato anche il cambio di colore in caso di sconto: il prezzo scontato è text-secondary-600 (riga 208) contro text-ink-900 (riga 215), quindi la colonna dei prezzi non è omogenea.

**Come si ripara:** Portare il prezzo a text-lg/text-xl e tenere il pulsante «+» come contorno o tono più tenue, così il colore pieno resta al prezzo.

### La lente nella barra di ricerca non si può toccare e non c'è nessun pulsante «Cerca»

**Dove:** `components/SearchBar.tsx:164 (icona Search con pointer-events-none) · :163-185 (il <form> non contiene nessun elemento type="submit") · :176-183 (crocetta Pulisci, icona 16 px senza padding)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. L'icona della lente alla riga 164 ha esplicitamente 'pointer-events-none': toccarla non fa nulla. Dentro il <form role="search"> (righe 163-185) gli unici elementi sono l'input e, quando c'è testo, un <button type="button"> di pulizia: nessun submit visibile, quindi l'unico modo di cercare è premere Invio o toccare un suggerimento. La crocetta «Pulisci» (righe 176-183) è un bottone con la sola icona X da 16 px e nessuna classe di padding o dimensione minima, quindi con area di tocco molto sotto i 44 px.

**Come si ripara:** Trasformare la lente in un <button type="submit"> con area minima 44×44, e dare alla crocetta lo stesso ingombro minimo.

### Dopo l'accesso la voce «Negozi» sparisce dalla barra in basso

**Dove:** `components/MobileTabBar.tsx:95-102 (autenticato: Home, Cerca, Carrello, Ordini, Io) contro :104-111 (ospite: Home, Cerca, Negozi, Carrello, Accedi)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO col file davanti. L'array dell'ospite (righe 104-111) contiene '/stores' con etichetta t('stores'); quello dell'utente autenticato (righe 95-102) la sostituisce con '/orders' e '/profile'. Il cliente che ha imparato dove stavano i negozi, dopo il login non li trova più nello stesso posto e deve passare dalla barra categorie in cima — che però soffre già del difetto di scorrimento senza affordance — o dal piè di pagina.

**Come si ripara:** Tenere le stesse cinque destinazioni per ospite e utente registrato (Home, Cerca, Negozi, Carrello, Io) e spostare «Ordini» dentro il foglio «Io», dove c'è già.

### La striscia in cima scorre di continuo ed è l'elemento più in movimento sopra logo e ricerca

**Dove:** `components/PromoTicker.tsx:85-89 (animate-marquee, nessun return null nel file) montata sempre da components/Navbar.tsx:90 · app/globals.css:254-261 (animazione 24s infinita, pausa solo su hover/focus-within/active) · mitigazione a globals.css:213-219` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. Il ticker è la prima riga di ogni pagina (Navbar riga 90) e non ha nessun 'return null' nel componente, quindi è sempre montato; il contenuto scorre con 'animate-marquee' (riga 86) definito in globals.css righe 254-256 come animazione lineare infinita di 24 secondi, con pausa dichiarata solo per hover, focus-within e active (righe 258-261) — nessuna di queste esiste su un telefono. Onestà: esiste una mitigazione che il collega non cita, il blocco prefers-reduced-motion di globals.css righe 213-219 azzera durata e iterazioni, quindi chi ha attivato l'impostazione di sistema è coperto; tutti gli altri no.

**Come si ripara:** Fermare lo scorrimento quando gli annunci ci stanno in una riga, oppure ruotarli a scatti con dissolvenza, oppure aggiungere un pulsante pausa.

### Nell'intestazione per l'ospite il carrello e «Registrati» sono due pillole gialle identiche affiancate

**Dove:** `components/Navbar.tsx:113-115 (Registrati: bg-accent-500 hover:bg-accent-600 text-ink-900 px-4 py-2 rounded-full) e :248 (CartButton: bg-accent-500 hover:bg-accent-600 text-ink-900 px-3 py-2 rounded-full)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. Nel ramo dell'ospite il carrello (CartButton, riga 248) e il pulsante «Registrati» (righe 113-115) sono resi uno accanto all'altro con esattamente lo stesso riempimento 'bg-accent-500', lo stesso testo scuro 'text-ink-900' e la stessa forma 'rounded-full'; cambia solo il padding orizzontale (px-3 contro px-4). Due azioni di valore molto diverso hanno lo stesso peso visivo nell'angolo in alto a destra.

**Come si ripara:** Tenere il pieno giallo al carrello e rendere «Registrati» un contorno bianco su terracotta, così nella stessa riga c'è un solo pieno.

### Due componenti diversi disegnano lo stesso briciolo di pane, con separatore e misure diverse

**Dove:** `components/ui/Breadcrumb.tsx:38-60 (text-sm, chevron PRIMA della voce alla riga 45, JSON-LD BreadcrumbList alle righe 24-27 e 62) contro components/CollectionHeader.tsx:64-83 (text-[13px], chevron DOPO la voce alla riga 79, nessun dato strutturato) e app/search/page.tsx:435-446 (terza copia a mano, text-[13px], chevron dopo)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO, tre implementazioni distinte. Il componente condiviso Breadcrumb usa text-sm, disegna il ChevronRight prima di ogni voce successiva (riga 45, dentro il blocco idx > 0) ed emette lo schema BreadcrumbList per Google (costruito alle righe 24-27, stampato in un <script type="application/ld+json"> alla riga 62). CollectionHeader lo riscrive a mano con text-[13px] e il chevron dopo la voce (riga 79), senza dati strutturati; app/search/page.tsx righe 435-446 è una terza copia identica alla seconda. Passando da una categoria a un prodotto lo stesso elemento di orientamento cambia dimensione e ritmo.

**Come si ripara:** Usare ovunque components/ui/Breadcrumb, dandogli una proprietà per l'uso dentro CollectionHeader; cancellare le due copie a mano.

### Le spaziature verticali fra i blocchi della home non seguono nessuna scala, e il «Drop del giorno» non ha aria sopra

**Dove:** `components/home-sections/HomeSectionRenderer.tsx: hero py-6 md:py-10 (:92), categorie py-6 (:177), dropOfDay pb-2 senza padding superiore (:194), prodotti py-6 (:203), attività live py-6 (:232), banda fiducia py-6 (:260), newsletter py-6 md:py-8 (:313), venditori py-5 (:343), blocchi editoriali py-4 (:369-377), blocchi di contenuto py-5 (:386, :408, :433, :454)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO, con i numeri di riga corretti (il collega li aveva spostati di qualche riga). Le sezioni della home usano cinque passi verticali diversi — py-4, py-5, py-6, py-6 md:py-8/md:py-10, pb-2 — senza una regola. Il caso peggiore è «Drop del giorno» alla riga 194: 'container mx-auto px-4 sm:px-6 pb-2', cioè padding solo in basso, quindi la sezione si incolla alla precedente mentre tutte le altre hanno respiro simmetrico.

**Come si ripara:** Definire due soli passi (sezione normale py-8, sezione a piena larghezza con fondo py-10) e applicarli dal renderer invece di scriverli caso per caso.

### La vetrina negozi in home mostra 4 scheletri per 6 negozi, e il riquadro foto ha proporzioni sbagliate

**Dove:** `components/StoreShowcase.tsx:69-83 (scheletro) contro :20 e :29 (`.limit(6)`) e components/StorePreviewCard.tsx:59-63 (copertina `h-28`)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. Lo scheletro cicla `Array.from({ length: 4 })`, mentre entrambe le query della vetrina chiedono `.limit(6)`: su due colonne da telefono sono due righe che diventano tre, quindi nasce una riga intera e tutto ciò che sta sotto scende. In più il riquadro-foto dello scheletro è `aspect-[4/3]`, mentre la copertina vera passa da `StoreMediaCarousel` con `heightClass={compact ? 'h-24' : 'h-28'}` (StorePreviewCard.tsx:61), cioè 112 px fissi: su desktop a quattro colonne larghe ~280 px lo scheletro è alto ~210 px contro i 112 veri. Il commento alla riga 68 dice che lo scheletro serve «a evitare il CLS»: lo riduce, non lo evita.

**Come si ripara:** Portare il conteggio degli scheletri a 6 — meglio: leggerlo dalla stessa costante che alimenta il `limit`, così non possono divergere — e sostituire `aspect-[4/3]` con `h-28`, la stessa classe della copertina vera.

### Il riquadro «cosa sta succedendo» non esiste finché non arrivano i dati, poi si apre e spinge giù la colonna

**Dove:** `components/LiveActivityFeed.tsx:84 (`if (activities.length === 0) return null;`), inserito da components/home-sections/HomeSectionRenderer.tsx:226-229` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. Il componente torna `null` sia quando è davvero vuoto sia mentre sta caricando: `activities` parte da `[]` e `isLoading` non viene mai letto, quindi i due casi non sono distinti. Il riquadro sta in una griglia a due colonne insieme al blocco fiducia: finché è `null` la colonna è vuota, poi nasce una scheda `bg-white border rounded-2xl p-5` con intestazione e righe di attività, e la riga della griglia si alza. Da telefono, dove le due colonne diventano una sotto l'altra, tutto quello che sta sotto scende di colpo.

**Come si ripara:** Distinguere i due casi: leggere `isLoading` dalla `useQuery` e, durante il caricamento, disegnare la scheda con la sua intestazione e cinque righe `.skeleton` dell'altezza giusta. Restituire `null` solo quando la risposta è arrivata ed è davvero vuota.

### Mentre l'hero carica, la home mostra un negozio inventato con prezzi inventati

**Dove:** `components/home/HeroStoreCard.tsx:72 (`if (!data?.store) return <HeroStorePlaceholder />`) e :191-258 (il segnaposto)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato aprendo il file. Finché la richiesta è in volo — e anche quando la RPC fallisce, perché la queryFn torna `null` in caso di errore (righe 61-64) — la home disegna `HeroStorePlaceholder`: un negozio che non esiste, «Salumeria del Borgo» in Via Calzolai (riga 217), con sei prodotti e prezzi finti (Coppa DOP €9,50, Salame €12,00, Prosciutto crudo €15,00 — righe 193-199) e la riga «Consegna stimata · oggi, entro 18:00». Se la rete è lenta il cliente li legge come veri, ed è un problema di credibilità prima che di grafica. CORREZIONI al collega, verificate: ① la copertina del segnaposto è `h-44` esattamente come quella della card vera (righe 205 e 100), quindi il salto NON è lì — la differenza di altezza può nascere solo dal corpo, dove la card vera ha una riga meta condizionata (`{(reviews || zone) && …}`, righe 122-139) e un numero variabile di prodotti; ② l'assenza di `priority` sulla copertina non è un difetto sfruttabile, perché la card è un componente client che nasce dopo il JavaScript: `priority` lì non produrrebbe comunque nessun preload.

**Come si ripara:** Sostituire il segnaposto con uno scheletro neutro — stessa scatola, stessa copertina `h-44`, blocchi `.skeleton` al posto di nome, indirizzo e prodotti, nessun nome e nessun prezzo inventato — e fissare un'altezza minima pari a quella della card piena, così l'hero non si muove quando arriva il negozio vero.

### Il banner «Ordina entro…» nasce a una riga e ne diventa due dopo l'idratazione

**Dove:** `components/ui/DeliveryCutoff.tsx:83-96 (i rami del testo) e :100-110 (il banner), usato nell'hero della home da components/home-sections/HomeSectionRenderer.tsx:143` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. Prima dell'idratazione l'hook torna `{ hydrated: false, day: 'oggi' }` (riga 51), quindi la condizione `day === 'oggi' && hydrated` è falsa e il testo cade sul ramo finale: «Arriva oggi», undici caratteri. Dopo l'idratazione, con `day === 'oggi'`, diventa «Ordina entro 02:14:31 e arriva oggi in 30-60 min», circa quarantotto. Il banner è `flex items-center gap-2 … px-3 py-2 text-sm` con `max-w-sm` (384 px) passato dal renderer, meno icona da 18 px e padding: a quella misura il testo lungo non ci sta su una riga, va a capo e la scatola cresce, spingendo giù le tre righe di rassicurazione sotto (Paghi alla consegna / In 30-60 minuti / …). Il commento alla riga 82 dichiara «no layout shift»: vale per il carattere a larghezza fissa del contatore, non per la lunghezza della frase, che quadruplica.

**Come si ripara:** Riservare lo spazio dall'inizio: dare al banner un'altezza minima pari a quella del testo lungo, oppure — meglio — usare pre-idratazione una frase della stessa lunghezza («Ordina entro le 18:00 e arriva oggi in 30-60 min», senza contatore), così l'unica cosa che cambia sono le cifre dentro uno spazio già occupato.

### Il service worker riscarica ogni foto già vista a ogni visita, e tiene in cache solo 60 immagini

**Dove:** `public/sw.js:28 (`MAX_IMAGE_ENTRIES = 60`), :49-56 (`trimCache`), :58-82 (`staleWhileRevalidate`), :138-142 (la regola sulle immagini Supabase)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato, tre cose misurabili. ① `staleWhileRevalidate` chiama `fetch(req)` sempre, anche quando `cached` c'è (righe 61-63): ogni foto già in cache viene comunque riscaricata in sottofondo a ogni apertura di pagina. Su una griglia di ricerca sono decine di richieste che occupano la banda mentre stanno ancora arrivando le immagini nuove. ② Il limite è 60 voci mentre una pagina di ricerca arriva a 96 prodotti (il tetto `limit ?? 96` in ProductGrid.tsx:132 e :189): la cache si riempie e si svuota dentro la stessa schermata, quindi non serve quasi mai. ③ `trimCache` fa `requests.slice(0, requests.length - maxEntries)`, cioè cancella le chiavi restituite per prime da `cache.keys()` — ordine di inserimento, FIFO — mentre il commento alla riga 48 la chiama «LRU».

**Come si ripara:** Per le foto di prodotto, che hanno indirizzo versionato e cache lunga, usare cache-first con scadenza invece di stale-while-revalidate: se la copia c'è ed è recente, nessuna richiesta. Alzare `MAX_IMAGE_ENTRIES` almeno a 200 (una griglia piena più due navigazioni). E o si riscrive `trimCache` aggiornando l'ordine a ogni lettura, o si corregge il commento: oggi dice una cosa che il codice non fa.

### Ogni prodotto senza foto fa una richiesta a placehold.co, dominio esterno non preconnesso

**Dove:** `components/ProductCard.tsx:61, app/cart/page.tsx:231 e components/checkout/CartGroupsList.tsx:35; app/layout.tsx:105-108 (l'elenco dei preconnect)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. Quando `images[0]` manca, ProductCard ripiega su `'https://placehold.co/400x400/FBF7F0/C0492C?text=Foto'`; l'indirizzo attraversa `sizedImage` senza essere toccato (lib/image-url.ts:78-80 lascia placehold.co com'è, e il caricatore non trova parametri `width`/`w` da riscrivere), quindi parte una richiesta vera a un dominio terzo per ogni scheda senza foto. Nel `<head>` (app/layout.tsx:105-108) sono preconnessi solo l'host Supabase e js.stripe.com, con dns-prefetch per api.stripe.com e challenges.cloudflare.com: placehold.co non c'è. La prima richiesta paga DNS più handshake TLS, e se il servizio è lento o giù la griglia resta coi buchi. Gli stessi segnaposto compaiono nel carrello e nel riepilogo del checkout, cioè sul percorso d'acquisto.

**Come si ripara:** Sostituire l'indirizzo remoto con un segnaposto locale servito dal nostro dominio (un SVG in `public/`, che il service worker già mette in cache-first alla regola 3 di sw.js): zero richieste esterne, non può cadere, e si disegna on-brand. Il `preconnect` a placehold.co è solo una toppa.
