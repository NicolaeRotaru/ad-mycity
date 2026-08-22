---
data: 2026-08-22 16:00
tipo: radiografia-design
ramo_analizzato: main del marketplace (commit 3913204, con le 99 riparazioni gia' dentro)
dimensioni: 11
problemi_confermati: 208
bloccanti: 2
gravi: 86
minori: 120
---

# Radiografia del design: 208 problemi veri, e due bloccano il caricamento delle foto

**In due righe.** Undici esperti hanno guardato il design del sito, ognuno la sua
parte, e un dodicesimo ha smontato quello che dicevano di aver trovato. Restano
208 problemi confermati col file davanti. Due impediscono di caricare le
immagini, e hanno la stessa causa.

## In parole semplici

| Gravita | Quanti | Cosa vuol dire |
|---|---:|---|
| **Bloccanti** | **2** | Qualcosa non funziona proprio |
| **Gravi** | **86** | Costa vendite, o fa perdere fiducia |
| **Minori** | **120** | Imperfezione che si vede |
| **Totale** | **208** | |

Di questi, **205 richiedono di toccare il codice** e **3 si risolvono dai
contenuti configurabili**, senza ripubblicare il sito.

## Cosa cambia per te

Un negoziante che vuole mettere la foto di copertina alla sua vetrina, oggi, non
ci riesce: il caricamento viene rifiutato e la pagina resta sul colore di
ripiego. Tu, dall'amministrazione, non riesci a caricare le copertine degli
Eventi ne' quella del Negozio del mese.

Sul resto il sito funziona, ma dice cose che poi non fa: nel carrello scrive
«Gratis*» sulla spedizione e intanto la mette nel totale.

## Cosa devi fare

Niente, adesso. Questa e' una radiografia: trova, non ripara.

Dimmi tu da dove parto. Il mio consiglio sono i due bloccanti: sono la stessa
riparazione fatta in tre punti. Subito dopo il carrello, che dice una cifra e
ne fa pagare un'altra.

## I due bloccanti hanno la stessa radice

Il magazzino delle immagini ha una regola: accetta un file solo se la **prima
cartella del percorso** e' l'identificativo di chi carica. Per gli
amministratori c'e' una sola eccezione, la cartella `home`.

Tre punti del sito non rispettano quella regola, e caricano in cartelle che si
chiamano `store-media`, `events` e `shop`. Il magazzino li rifiuta.

Un esempio concreto. Il negoziante di Pane Quotidiano sceglie la foto del
bancone e la carica. Il file parte verso una cartella che si chiama
`store-media`. Il magazzino guarda la prima cartella, non ci trova
l'identificativo del negoziante, e rifiuta. Al negoziante non arriva nessun
errore utile: la foto semplicemente non compare.

La riparazione e' la stessa per tutti e tre: mettere l'identificativo (o la
cartella `home`, per l'admin) come prima cartella del percorso. Nello stesso
progetto ci sono gia' due file che lo fanno giusto e lo spiegano nel commento.

## Le cose piu' care fra le 86 gravi

Le ho raggruppate per quello che costano, non per area.

**Il carrello dice una cifra e ne fa pagare un'altra.** Con due negozi diversi
il riepilogo scrive «Gratis*» sulla spedizione e intanto mette 9,80 € nel
totale. Sulle vetrine c'e' scritto «spedizione gratuita», ma su ogni consegna a
domicilio si pagano 3 € di «Consegna MyCity».

**Promesse che il sito non mantiene.** La scheda prodotto dice «carta o contanti
alla consegna, decidi tu»: la carta alla consegna non esiste. Dice «reso
gratuito entro 14 giorni», mentre la pagina dei resi dice che il ripensamento lo
paga il cliente. Le domande frequenti promettono il ritiro in negozio col 10% di
sconto: al momento di pagare quell'opzione non c'e'.

**Si puo' ordinare due volte.** Dopo un ordine riuscito il pulsante di conferma
torna attivo.

**Il carrello dice «sei vuoto» quando e' pieno.** Al primo disegno della pagina,
prima che parta il programma, carrello e cassa scrivono «Il tuo carrello e'
vuoto».

**Dopo le 20:00 l'ordine parte con una fascia di consegna gia' passata.**

**Chi si accorge di dover entrare perde tutto.** Al muro dell'accesso si
perdono codice sconto, metodo di pagamento e fascia oraria: al ritorno il totale
e' piu' alto di prima.

**Sul telefono, nella scheda prodotto, nome e prezzo arrivano dopo** il riquadro
del negozio, il link «Segnala» e la partita IVA.

**Una home con un negozio inventato.** Mentre carica, il riquadro grande mostra
«Salumeria del Borgo, Via Calzolai» con prezzi finti, senza dire che e' un
esempio.

**La chat di assistenza esiste, ma il cliente non ha nessun modo di aprirla.**

## Cosa non ho verificato

**Non ho aperto nessuna pagina in un browser.** Questa radiografia legge il
codice. Certi difetti si vedono solo a schermo: un bottone che si sovrappone a
una certa larghezza, per esempio. Quelli li ho dedotti dai valori scritti nel
codice, non li ho visti.

**I conti sui pixel sono calcoli, non misure.** Dove ho scritto «a 360 pixel la
riga sborda di 24», quel numero viene da una somma fatta leggendo il codice. La
larghezza del carattere e' stimata. La direzione e' giusta; la cifra esatta va
confermata aprendo la pagina.

**Non ho toccato niente.** L'audit e' in sola lettura, come deve essere: trova,
non ripara.

**Le tre voci «config» non le ho provate sul pannello vero.** Ho letto che quel
contenuto e' configurabile, non ho verificato che il pannello lo esponga
davvero.

## Come e' stato fatto

Undici dimensioni, un senior ciascuna, tutte in sola lettura sul ramo principale
del sito aggiornato: layout e adattamento · coerenza col marchio · tipografia ·
accessibilita' visiva · stati dell'interfaccia · immagini e media · esperienza da
telefono · flussi di acquisto · testi dell'interfaccia · navigazione e gerarchia
visiva · velocita' percepita.

Chi trova non conferma: ogni elenco e' passato da un secondo esperto, che ha
riaperto i file citati e ha tenuto solo quello che ha visto coi propri occhi. La
regola era «nel dubbio, scarta»: un problema falso fa perdere piu' tempo di uno
mancato.

Ventidue esperti in tutto, nessuno fallito.

---

Sotto ci sono i **2 bloccanti** e le **86 gravi**, ognuno col file, la riga e
come si ripara.

I **120 minori** stanno in un file a parte, che si chiama
`2026-08-22-radiografia-design-minori.md`. Sono divisi per due motivi. Un file
solo da 208 voci non lo legge nessuno. E sopra una certa lunghezza il controllo
che tiene leggibili i testi smette di riuscire a leggerli.

## Dettagli tecnici

Da qui in giu' e' l'elenco per chi ripara: ogni voce col file, la riga, cosa c'e'
che non va e come si sistema. Quello che serve a te l'hai gia' letto sopra.

## Bloccanti (2)

### La copertina del negozio non si carica: lo storage rifiuta il percorso

**Dove:** `components/StoreMediaManager.tsx:54 (path `store-media/${user.id}/…`) contro migrations/114_hardening_radiografia.sql:479-488` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. L'unica regola di scrittura sul secchio `products` (policy «Authenticated users can upload product images», riscritta dalla migrazione 114 con lo stesso nome della vecchia 002, quindi la vecchia permissiva non esiste più) accetta solo percorsi la cui PRIMA cartella è l'identificativo dell'utente, oppure `home` se sei admin. Qui la prima cartella è la parola fissa `store-media`: ogni caricamento della copertina viene respinto, per qualunque negoziante. Senza copertina la pagina negozio resta sul gradiente di ripiego (components/store-sections/HeroSection.tsx:88-105). Due file vicini hanno il percorso giusto e lo spiegano nel commento — components/VendorForm.tsx:121 e components/seller/site/ImageUpload.tsx:25 — segno che la correzione non è arrivata fin qui. Confermata anche la seconda metà: la schermata promette «fino a 3 immagini e 1 video» (righe 17-18 e 95) ma migrations/070_storage_and_rls_hardening.sql:36-42 ammette sul secchio solo tipi immagine, quindi il video è rifiutato anche col percorso corretto.

**Come si ripara:** Cambiare il percorso in `${user.id}/store-media/${Date.now()}…`. Per il video: toglierlo dalla schermata oppure creare un secchio dedicato con i tipi video ammessi.

### Dall'admin non si caricano le copertine di Eventi e Negozio del mese

**Dove:** `components/ImageUrlField.tsx:44 (`path = ${pathPrefix}/${Date.now()}.${ext}`), con pathPrefix="events" in app/admin/events/page.tsx:290 e pathPrefix="shop" in app/admin/shop-of-month/page.tsx:166` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Stessa regola del punto precedente (migrations/114_hardening_radiografia.sql:483-487): passa solo la cartella con l'identificativo utente o la cartella `home` per gli amministratori. I prefissi `events` e `shop` non rientrano in nessuno dei due casi, quindi il caricamento fallisce anche per l'admin. La prova del contrario è nello stesso componente usato con pathPrefix="home" (components/admin/home/HomeSectionConfigForm.tsx:246 e :279), che rientra nell'unica eccezione scritta nella regola. All'admin resta la strada di incollare un indirizzo esterno, che però si rompe (difetto successivo).

**Come si ripara:** Usare `home/events/…` e `home/shop/…` (l'eccezione già esistente per gli admin), oppure `${user.id}/events/…`.

## Gravi (86)

### In home la fila dei prodotti popolari carica come griglia e poi diventa una riga: la pagina salta di oltre un metro

**Dove:** `components/ProductGrid.tsx:357 e 380-396 + components/home-sections/HomeSectionRenderer.tsx:219` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO col file davanti. HomeSectionRenderer riga 219 chiama <ProductGrid limit={c.limit ?? 12} rail /> senza title; in ProductGrid riga 357 isSection = !!rail && !!title, quindi false. Il ramo di caricamento a riga 382 (if (isSection)) viene saltato e si finisce alla riga 396: return <SkeletonGrid count={limit ?? 8} />. SkeletonGrid (components/SkeletonCard.tsx:16) e' grid-cols-2 sm:grid-cols-3 md:grid-cols-4: su telefono 12 schede finte su 6 righe. A dati arrivati (riga 476) si passa a una riga orizzontale sola di card w-40. ProductGrid e' un client component con useQuery (riga 130), quindi lo scheletro si vede sempre al primo render. La sezione popularProducts e' nella home di default (lib/home-site.ts:239, config limit 12), quindi il salto avviene su ogni visita alla pagina piu' vista del sito.

**Come si ripara:** Nel ramo isLoading di ProductGrid usare la forma rail quando rail e' true, non solo quando c'e' anche il titolo: alla riga 382 sostituire `if (isSection)` con `if (rail)`, tenendo l'intestazione di sezione condizionata a isSection ({isSection && sectionHeader}).

### Sul tablet il riquadro «Aggiungi al carrello» finisce sotto la foto, con mezza pagina vuota accanto

**Dove:** `app/product/[id]/page.tsx:485 (griglia) e :851 (terzo figlio)` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. La griglia a riga 485 e' `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_320px]` e ha tre figli in flusso: galleria (487-570), colonna informazioni (634-848) e riquadro d'acquisto (851, `lg:sticky lg:top-[var(--header-height)] h-fit`). Il quarto elemento (lightbox, riga 573) e' `fixed`, quindi non occupa celle. Fra 768px e 1023px le colonne sono due e i figli tre: il riquadro con prezzo, quantita' e i due pulsanti d'acquisto scende in riga 2 colonna 1, dopo tutta l'altezza della colonna informazioni, e la seconda cella resta vuota. In quella fascia non c'e' rete di sicurezza: StickyAddToCart e' `md:hidden` (components/StickyAddToCart.tsx:54) e la card diventa sticky solo da lg.

**Come si ripara:** Aggiungere `md:col-span-2 lg:col-span-1` al div di riga 851, cosi' sotto lg il riquadro d'acquisto occupa l'intera larghezza invece di finire in una cella spaiata. In alternativa alzare la soglia della barra sticky da `md:hidden` a `lg:hidden`.

### Sui prodotti scontati il pulsante «+» della card viene tagliato sul telefono

**Dove:** `components/ProductCard.tsx:125 (overflow-hidden), :179 (p-2.5) e :207-227 (riga prezzo)` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. La riga prezzo (207) e' `flex items-center gap-1.5`; con sconto contiene prezzo text-base extrabold, prezzo barrato text-[11px] e il pulsante h-11 w-11 shrink-0 (ml-auto, ultimo elemento). Nessuno dei due prezzi ha min-w-0 o truncate, e formatPrice (lib/format.ts:1) produce «€129.90», una parola sola senza punti di rottura: gli span non possono scendere sotto la loro larghezza minima. Nella griglia catalogo (ProductGrid.tsx:525, `grid ${gridCols} gap-4` con grid-cols-2, dentro container px-4) a 360px la card e' 156px e, tolto il p-2.5 della riga 179, restano 136px. Con Inter, «€129.90» a 16px extrabold misura ~62px, il barrato a 11px ~42px, piu' 44px di pulsante e 12px di spazi: 160px. La riga sborda di ~24px e la card, `overflow-hidden` alla riga 125, taglia il pulsante. Il conto resta in negativo anche con prezzi a due cifre (~144px contro 136). I prodotti senza sconto stanno dentro.

**Come si ripara:** Mettere prezzo e barrato in un contenitore `min-w-0 flex-1` (con truncate sul barrato) o mandare a capo la coppia prezzi sotto una certa soglia, lasciando il pulsante shrink-0. In parallelo far usare a formatPrice Intl.NumberFormat('it-IT'), piu' compatto. Verificare a 360px con un prodotto scontato a tre cifre.

### La barra d'acquisto in fondo alla scheda prodotto e' troppo stretta: la scritta del pulsante va a capo e il prezzo tocca lo stepper

**Dove:** `components/StickyAddToCart.tsx:60-106, montata sempre con lo stepper da app/product/[id]/page.tsx:1160-1170` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. La barra e' `container mx-auto px-3` (riga 60) con dentro una card `p-3 flex items-center gap-3` (61) e tre elementi: blocco prezzo con min-w-0 e nessun truncate (62), stepper `shrink-0` (73: due bottoni w-9, numero min-w-[1.5rem], bordi = ~98px) e il pulsante `px-5 py-3 text-sm` con icona 18 (99-106, ~206px alla larghezza naturale). La scheda prodotto passa sempre qty/onDec/onInc (page.tsx:1166-1168), quindi hasStepper e' sempre vero. A 360px lo spazio dentro la card e' 312px contro 98+206+24 = 328px richiesti dal solo stepper piu' pulsante, prima del prezzo: il pulsante (senza whitespace-nowrap) si comprime e manda «Aggiungi al carrello» su due righe, mentre il blocco prezzo con min-w-0 si stringe sotto la larghezza della cifra e il testo esce dal proprio riquadro. Il conto resta negativo anche a 375 e 390px.

**Come si ripara:** Ridurre l'ingombro sotto i 400px: etichetta corta sul telefono («Aggiungi») con aria-label completo, `whitespace-nowrap` sul pulsante e `truncate` sul blocco prezzo, oppure stepper su una seconda riga. Provare a 360px con prezzo a tre cifre e quantita' 2.

### La tendina «dove consegniamo» esce dallo schermo e fa scorrere la pagina di lato

**Dove:** `components/LocationPill.tsx:105 (pannello) e :81 (suggerimento) + components/Navbar.tsx:176-178` · **Area:** Layout e adattamento agli schermi · **Corsia:** codice

CONFERMATO. Su telefono la pill sta dentro `min-w-0 flex-1 flex justify-center` (Navbar.tsx:176-178), cioe' centrata fra logo e icona carrello, dentro `container mx-auto px-3`. Il pannello che si apre e' `absolute left-0 top-full mt-2 w-72` (LocationPill.tsx:105), 288px ancorati al bordo sinistro della pill, che su uno schermo da 360px parte intorno a 150px: il pannello arriva quindi ben oltre il bordo destro. Stesso schema per il suggerimento `w-64` a riga 81. Ne' html ne' body ne' l'header hanno overflow-x hidden (verificato: nessun overflow-x in app/globals.css), quindi lo scorrimento orizzontale e' reale e meta' del campo CAP resta fuori. Succede su tutti i telefoni sotto i ~440px.

**Come si ripara:** Ancorare il pannello in modo sicuro: `left-1/2 -translate-x-1/2` con `w-[min(18rem,calc(100vw-1.5rem))]` sotto sm, oppure trasformarlo in un pannello a scomparsa dal basso come MobileAccountSheet. Verificare che a 360px non compaia piu' scorrimento orizzontale.

### Checkout: tre sistemi di colore diversi per gli avvisi, nella stessa colonna

**Dove:** `app/checkout/page.tsx:945, 954, 980, 991, 1002, 1012` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO riga per riga. 945 = token di brand (bg-accent-50/border-accent-200/text-accent-800). 980, 991, 1002 = giallo Tailwind (bg-amber-50/border-amber-200/text-amber-900). 954 e 1012 = rosa Tailwind (bg-rose-50/border-rose-200/text-rose-800), e dentro il riquadro 954 c'è anche un pulsante bg-rose-600. Verificato che amber e rose NON sono famiglie di brand: tailwind.config.ts definisce primary/accent/olive/cream/surface/ink/secondary e nient'altro, e i token dichiarano --warning: var(--accent-500) e --danger: #DC2626. Precisazione onesta rispetto al collega: la differenza fra accent-50 (#FEF8EC) e amber-50 (#FFFBEB) a schermo è quasi impercettibile; il salto che si vede davvero è il rosso rosa (rose) usato come colore d'errore al posto del vino di brand, proprio nel momento in cui il cliente decide se pagare.

**Come si ripara:** Portare i sei riquadri a due sole varianti di brand: avviso = bg-accent-50/border-accent-200/text-accent-800; errore = bg-secondary-50/border-secondary-200/text-secondary-800 (e il pulsante di riga 963 a bg-secondary-600). Meglio ancora: un componente Alert in components/ui/ con variant 'warning'|'error'|'success', così il colore non si riscrive più a mano.

### Checkout: le card di sinistra e il riepilogo di destra hanno raggio e bordo diversi, affiancati

**Dove:** `components/checkout/StepCard.tsx:22 + components/ui/Card.tsx:17,43 vs app/checkout/page.tsx:1021` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. StepCard.tsx:22 rende <Card variant="bordered" padding="lg">; Card.tsx:17 definisce bordered = 'bg-white border border-cream-300' (sabbia #EEDFBA) e Card.tsx:43 applica 'rounded-lg' (12px), senza ombra. Il riepilogo di destra a page.tsx:1021 è scritto a mano: 'bg-white border border-surface-200 rounded-xl shadow-card' = bordo grigio neutro #EAE8E4, 16px e ombra. Le due colonne stanno nella stessa griglia (la destra è lg:sticky), quindi su desktop si vedono insieme: angoli diversi, bordi di due tinte diverse, ombra su una sola.

**Come si ripara:** Una sola card per il funnel d'acquisto. Estendere components/ui/Card.tsx con una variante 'funnel' ('bg-white border border-surface-200 rounded-xl shadow-card') e farci passare sia StepCard sia il riepilogo, togliendo le classi a mano alla riga 1021.

### Il cuore dei preferiti è vino sulla card e rosa sulla scheda prodotto

**Dove:** `components/ProductCard.tsx:173 vs app/product/[id]/page.tsx:676-679` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. ProductCard.tsx:173: cuore attivo 'fill-secondary-500 text-secondary-500' = #D63E3B (vino), esattamente come prescrive docs/mockup/components/commerce/ProductCard.jsx:58 (fill 'var(--secondary-500)'). app/product/[id]/page.tsx:676-679: lo stesso gesto è 'bg-rose-500 border-rose-500' = #F43F5E (fucsia), con 'focus-visible:ring-rose-400' e 'hover:text-rose-400 hover:border-rose-200'. Il cliente vede il cuore vino sulla griglia e lo trova rosa un clic dopo. tailwind.config.ts scrive per iscritto il contrario nel commento della rampa secondary: «burgundy/vino … NON la rose Tailwind default (era anti-pattern Mediterranean)».

**Come si ripara:** In app/product/[id]/page.tsx:676-679 sostituire rose-500/400/200 con secondary-500/400/200 e 'focus-visible:ring-rose-400' con 'focus-visible:ring-primary-700', che è l'anello di fuoco usato ovunque altrove.

### Tre rossi diversi per lo stesso ruolo «pericolo» in tutto il sito

**Dove:** `components/ui/Button.tsx:29 · app/orders/[id]/page.tsx:392,420 · components/ConfirmDialog.tsx:107,172` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. Button.tsx:29 danger = 'bg-red-600' (#DC2626, che coincide col token --danger). app/orders/[id]/page.tsx:420 «Annulla ordine» = 'bg-rose-600' (#E11D48) e 392 «Apri reclamo» = border-rose-300/text-rose-700. Il vino di brand (secondary-*) è invece il rosso di badge sconto, errori di campo e preferiti. Tre rossi per lo stesso ruolo. In ConfirmDialog.tsx:107 c'è il caso peggiore, un gradiente che mescola i due mondi: 'from-rose-100 to-accent-100' (rosa Tailwind sfumato nella mostarda di brand); riga 172 il pulsante di conferma distruttiva è di nuovo bg-rose-600. Censimento rifatto da me: 126 occorrenze rose-* e 28 red-* in app/ e components/ (il collega diceva 125 e 28).

**Come si ripara:** Una regola sola: pericolo/distruttivo = secondary (vino) OPPURE --danger #DC2626, mai entrambi e mai rose. Poi sostituzione in blocco rose-* → secondary-* (le rampe hanno gli stessi passi) e allineamento di Button.tsx:29 alla scelta fatta. Il gradiente di ConfirmDialog:107 va a 'from-secondary-100 to-accent-100'.

### La vetrina del negozio può diventare verde-acqua, blu, prugna o marrone: quattro colori fuori palette

**Dove:** `lib/store-customization.ts:25-28 (ACCENT_PRESETS)` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. I primi quattro preset sono token veri (#C0492C primary-600, #B82A28 secondary-600, #C4801F accent-600, #5A7C42 olive-600). Gli altri quattro no: #2F6F6A (salvia), #3B4A7A (notte), #6B3A5B (prugna), #5C4033 (cacao). Ho cercato i quattro hex in tailwind.config.ts, app/globals.css e docs/mockup/tokens/colors.css: zero occorrenze. Il colore non è decorativo, viene applicato inline: BannerSection.tsx:20 come sfondo del pulsante ('backgroundColor: ctx.accent'), HeroSection.tsx:86 come striscia della vetrina, ContactSection.tsx:26 e 37 come colore delle icone. Un negozio su «Notte» ha pulsanti indaco dentro una pagina con navbar terracotta e footer crema.

**Come si ripara:** Ridurre ACCENT_PRESETS ai quattro colori di brand e, se servono più opzioni, ricavarle dalle rampe esistenti (olive-700 #456236, primary-800 #7F2F1F, secondary-800 #7A1F1D, accent-700 #9D621C). Nessuna migrazione dati per i negozi già sui primi quattro; per gli altri, rimappare al preset più vicino.

### Due terracotte diverse per lo stesso pulsante principale

**Dove:** `components/ui/Button.tsx:24 vs app/search/page.tsx:387 e app/category/[slug]/page.tsx:412` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO, con una correzione all'etichetta. Button.tsx:24 definisce primary = 'bg-primary-700 hover:bg-primary-800' (#A03B25), lo stesso valore del token semantico --color-cta. Ma in app/search/page.tsx:387 e app/category/[slug]/page.tsx:412 il pulsante pieno è scritto a mano 'bg-primary-600 hover:bg-primary-700 … rounded-xl' (#C0492C, e 16px invece degli 8px di Button). Non è «Applica filtri» come scriveva il collega: è il pulsante «Mostra risultati» in fondo al pannello filtri. Conteggio rifatto: 92 usi di bg-primary-700 contro 61 di bg-primary-600 in app/ e components/. Nella stessa pagina di ricerca convivono primary-700 (anelli di fuoco, prezzi, riga 316/343) e primary-600 (pulsanti e chip, righe 245, 342, 387).

**Come si ripara:** Sostituire i pulsanti scritti a mano con <Button variant="primary">. Dove non è possibile, allineare almeno a 'bg-primary-700 hover:bg-primary-800 rounded'. Lasciare bg-primary-600 solo dove non è un pulsante (pallini, badge di conteggio, indicatori).

### L'anteprima del link su WhatsApp e Facebook mostra il logo in un carattere che non è quello del brand

**Dove:** `app/opengraph-image.tsx:25 e 29` · **Area:** Coerenza col marchio · **Corsia:** codice

CONFERMATO. Riga 25: fontFamily 'system-ui, sans-serif'. Riga 29: «MyCity» a fontSize 128 e fontWeight 900. A ImageResponse non viene passata nessuna opzione fonts (l'unico secondo argomento è { ...size }), quindi next/og non ha Fraunces e ripiega sul carattere di sistema. Il marchio ufficiale è Fraunces 800: docs/mockup/assets/wordmark-light.svg dichiara font-family="Fraunces, Georgia, serif" e font-weight="800". Il peso 900 non esiste nemmeno nel prodotto: app/layout.tsx carica Fraunces con i pesi 400-800 e la scala arriva a --weight-extrabold 800. Ogni link incollato in chat mostra quindi il logo in un carattere che non è del brand.

**Come si ripara:** Passare il file di Fraunces a ImageResponse: caricare il .ttf e aggiungere { fonts: [{ name: 'Fraunces', data, weight: 800, style: 'normal' }] }, poi fontFamily 'Fraunces' e fontWeight 800 alla riga 29. Il colore #F4BC53 della «My» è invece corretto: coincide con wordmark-ondark.svg.

### Il corsivo del sito è finto: nessun font in corsivo viene caricato

**Dove:** `app/layout.tsx:28-34 (caricamento Inter e Fraunces) · usato in app/page.tsx:21 e :39, components/ui/AuthShell.tsx:82, app/come-funziona/page.tsx:47 — 17 punti in tutto` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO col file davanti. In app/layout.tsx Inter è caricato senza opzione di stile e Fraunces solo con i pesi 400-800: nessuno dei due chiede il corsivo. Nel CSS già compilato (.next/static/css/18d4e9bd2e28f2d9.css) ho contato 24 dichiarazioni @font-face e tutte e 24 dicono font-style:normal — zero italic. Ho contato 17 punti nel codice che scrivono la classe `italic`. Il browser, non trovando un corsivo vero, inclina le lettere dritte (corsivo sintetico). Il punto più visibile è il titolone della home (app/page.tsx:21): la parola «veri» è l'unica in corsivo del claim, sta in Fraunces a 36px su telefono e 60px su schermo grande, e Fraunces ha un corsivo vero e disegnato che qui non arriva mai. Stessa cosa nella colonna a fianco del modulo di accesso (AuthShell.tsx:82).

**Come si ripara:** In app/layout.tsx aggiungere `style: ['normal','italic']` alla chiamata di Fraunces e di Inter. Poi ricompilare e verificare che nel CSS generato compaia almeno un @font-face con font-style:italic (oggi sono 24 su 24 normal).

### I titoli senza dimensione dichiarata escono a 30px, anche dove serve una scritta piccola

**Dove:** `app/globals.css:156-157 (regola di partenza) · effetti verificati: components/ui/Modal.tsx:143, app/search/page.tsx:305 e :362, app/category/[slug]/page.tsx:339 e :387, components/store-sections/PromotionsSection.tsx:14` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO. In app/globals.css le righe 156-157 dicono h2 = --text-3xl (30px) e h3 = --text-xl (20px), in Fraunces, ed è CSS normale fuori dai layer: vale ovunque non ci sia una classe di dimensione. Tre effetti aperti uno per uno: ① components/ui/Modal.tsx:143 — il titolo di OGNI finestra di dialogo è `font-bold text-ink-900 truncate` senza dimensione, quindi esce a 30px, mentre la sua descrizione appena sotto è text-xs (12px): due volte e mezza di scarto dentro la stessa intestazione, e per giunta il titolo a 30px è pure troncato. ② app/search/page.tsx:305 (e il gemello nel pannello a scomparsa alla riga 362, più le due copie in category/[slug] alle righe 339 e 387) — la parola «Filtri» è un h2 `font-serif font-bold` senza dimensione, quindi 30px, con accanto il contatore a text-[10px]. ③ components/store-sections/PromotionsSection.tsx:14 — «Promozioni attive» è un h2 senza dimensione (30px), mentre tutte le altre intestazioni della stessa vetrina passano da SectionHeading.tsx, che è text-xl sm:text-2xl (20/24px): due titoli di pari grado sulla stessa pagina con due dimensioni diverse.

**Come si ripara:** Due mosse. Prima: abbassare i valori di partenza in globals.css (h2 → 1.5rem, h3 → 1.125rem); i titoli grandi hanno già la loro classe esplicita e non cambiano, come dice il commento sopra la regola. Seconda: dare la classe mancante ai punti verificati (Modal.tsx:143 → text-base, le intestazioni dei filtri → text-sm, PromotionsSection → riusare SectionHeading come le altre sezioni della vetrina).

### Sette caselle di testo a 14px: su iPhone la pagina si ingrandisce da sola al tocco

**Dove:** `components/SearchBar.tsx:174 · components/checkout/CouponInput.tsx:63 · components/NewsletterForm.tsx:78 · components/ProductQA.tsx:162 e :243 · app/product/[id]/page.tsx:1029 · app/stores/page.tsx:249` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO riga per riga: tutte e sette hanno `text-sm` (14px) sull'elemento di input. E la pagina permette lo zoom — app/layout.tsx:72 dichiara maximumScale: 5 — quindi la regola di Safari su iPhone scatta: toccando una casella con caratteri sotto i 16px ingrandisce tutta la pagina e non la rimpicciolisce più da sola. Il sito questa cosa la sa già: components/ui/Field.tsx, la casella condivisa da cui passano accesso, registrazione, indirizzi e dati del checkout, ha il commento «mobile: text-base (≥16px) per non innescare lo zoom automatico su iOS» alla riga 22 e usa davvero `text-base` nella classe base del controllo. Le sette qui sopra sono quelle scritte a mano che non passano dalla primitiva. La più pesante è SearchBar, perché la barra di ricerca sta in cima a ogni pagina.

**Come si ripara:** Portare le sette righe da text-sm a text-base; dove il campo diventa troppo alto, ridurre il riempimento verticale (py) invece del carattere. Meglio ancora: far passare CouponInput, ProductQA e NewsletterForm dalla primitiva components/ui/Field.tsx, che il difetto non ce l'ha.

### Scritte bianche sul verde oliva chiaro: 3,69 contro il 4,5 richiesto

**Dove:** `components/store-sections/HeroSection.tsx:130 · components/checkout/PaymentMethodSelector.tsx:153 · components/checkout/StepIndicator.tsx:24 · app/stores/page.tsx:254 · app/profile/referral/page.tsx:115 · components/OrderTimeline.tsx:67 · components/Navbar.tsx:331 e :357 · components/MobileAccountSheet.tsx:71 · app/seller/dashboard/page.tsx:211` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO. olive-500 è #7C8B5A (tailwind.config.ts:66); rifatto io il conto del contrasto col bianco viene 3,69 a 1, mentre per un testo normale la soglia è 4,5. Ho aperto tutti e dieci i punti: sono tutti `bg-olive-500 text-white` su testo piccolo, quindi nessuno rientra nell'eccezione del testo grande (che parte da 18,66px in grassetto). Due stanno sul percorso d'acquisto: la pastiglia «Aperto ora» in copertina alla vetrina del negozio (HeroSection.tsx:130, text-sm grassetto — è il segnale che dice al cliente se può ordinare adesso) e la pastiglia dello sconto per il ritiro in negozio in cassa (PaymentMethodSelector.tsx:153, text-xs grassetto). Nella stessa riga di codice, il badge alternativo «Sconto 10%» usa un verde più scuro: olive-600 (#5A7C42) misura 4,78 e passa. Due verdi affiancati, uno buono e uno no.

**Come si ripara:** Sostituire bg-olive-500 con bg-olive-600 (#5A7C42, 4,78 a 1) nei dieci punti; dove il testo è a 11-12px, olive-700 (#456236) è più sicuro. Il colore è già nella tavolozza, non serve inventare nulla.

### Nella copertina della vetrina il nome del negozio viene tagliato invece di andare a capo

**Dove:** `components/store-sections/HeroSection.tsx:163-165` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO nel file. Il nome del negozio è l'h1 della sua pagina: `font-serif text-[28px] font-extrabold ... sm:text-[34px]` alla riga 163, e alla riga 165 lo span che lo contiene ha la classe `truncate` — una riga sola, il resto tagliato con tre puntini, mai a capo. Il conto dello spazio su un telefono da 375px: 375 meno 40 di riempimento della barra (px-5), meno 72 del riquadro del logo, meno 16 di distanza = circa 247px, da dividere anche col bollino «negozio verificato» che sta nello stesso h1. A 28px in Fraunces extrabold ci stanno all'incirca quattordici-diciassette lettere. «Salumeria del Borgo» — negozio vero, l'ho trovato in seeds/001_piacenza_stores.sql — ne ha diciannove: viene tagliato. La misura in pixel è una stima mia, ma il taglio è certo per i nomi lunghi, perché truncate taglia sempre appena il testo eccede.

**Come si ripara:** Togliere `truncate` dallo span alla riga 165 (il contenitore è già flex-wrap, quindi il resto della copertina si adatta) o al massimo sostituirlo con line-clamp-2. E far partire la dimensione da text-[24px] su telefono con sm:text-[34px].

### Nella dashboard del negozio le righe sotto i numeri sono bianco trasparente e non si leggono

**Dove:** `app/seller/dashboard/page.tsx:327 e :329 (funzione HeroStat) · stessa pagina riga 209` · **Area:** Tipografia e leggibilita · **Corsia:** codice

CONFERMATO, e i numeri sono anche peggio di quelli segnalati. Il riquadro in cima alla dashboard del negoziante è una sfumatura terracotta (riga 201: from-primary-700 via-primary-600 to-secondary-700) e le targhette dentro hanno sfondo bg-white/10, quindi il fondo reale sotto il testo è più chiaro del solo primary-600. Rifatti i conti sul punto medio con la targhetta: riga 329 `text-[11px] text-white/60` misura 2,50 a 1 (il collega diceva 2,75); riga 327 `text-[11px] text-white/70` misura 2,87; riga 209 `text-white/75 text-sm` misura 3,35. La soglia è 4,5: sono tutte e tre sotto, e le prime due sono a 11px, il carattere più piccolo del sito. È lo schermo che il negoziante apre ogni mattina, e la riga che non si legge è proprio quella che spiega il numero.

**Come si ripara:** Togliere la trasparenza: colore pieno (text-cream-200) al posto di text-white/60 e text-white/70, e text-white pieno alla riga 209. Portare gli 11px a 12px (text-xs), che è il gradino minimo dichiarato dal sistema.

### L'anello di fuoco della tastiera è invisibile su tutta la barra in alto (1,34:1)

**Dove:** `app/globals.css:160-163 (`:focus-visible { outline: 2px solid #C0492C; outline-offset: 2px }`) + components/Navbar.tsx:98 (logo), :180 e :193 (carrello mobile), :230 (IconButton Preferiti/Messaggi/Notifiche), :248 (CartButton desktop), :319 (pulsante Menu account)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO col file davanti. Il fuoco globale è terracotta #C0492C (globals.css:161, non 164 come indicato). L'header è `bg-primary-700` #A03B25 (Navbar.tsx:93 e :214). Rapporto ricalcolato da me: 1,34:1; sul CartButton (bg-accent-500 #E8A33D, riga 248) resta 2,30:1. Confermata anche la disparità interna: `focus-visible:outline-white` c'è su Accedi/Registrati (Navbar.tsx:112-113, :136, :142, :148, :201), CategoryBar.tsx:97 e :116, LocationPill.tsx:65 — le sei righe elencate no. Chi naviga con Tab perde il segno su carrello, notifiche e menu account. WCAG 2.4.11 Focus Appearance (AA, soglia 3:1 contro il colore adiacente).

**Come si ripara:** Aggiungere `focus-visible:outline-white` alle sei classi elencate. Fix durevole: una regola unica in globals.css che dia l'anello bianco a ogni `:focus-visible` dentro l'header su fondo primary-700, così i controlli nuovi lo ereditano.

### Il selettore delle stelle nella pagina recensione non dice quale voto è scelto

**Dove:** `app/orders/[id]/review/page.tsx:17-30 (componente `StarRating`)` · **Area:** Accessibilita visiva · **Corsia:** codice

CONFERMATO. I cinque pulsanti hanno solo `aria-label` («3 stelle»), nessun `aria-pressed`/`aria-checked` e nessun contenitore con ruolo: uno screen reader annuncia la stessa cosa prima e dopo il tocco, e il form parte con 5 preselezionato senza dirlo. Il gemello in app/product/[id]/page.tsx:1010-1021 ha già `role="group" aria-label="Il tuo voto"` + `aria-pressed`, con il commento #142 che spiega perché: la correzione non è stata portata qui. Confermato anche il colore: stelle non scelte `text-ink-300` (#A8A29E su bianco = 2,52:1, ricalcolato). WCAG 4.1.2 Name-Role-Value (A).

**Come si ripara:** In `StarRating` (riga 17): avvolgere i pulsanti in `<div role="group" aria-label="Il tuo voto">`, aggiungere `aria-pressed={n <= value}` a ogni `<button>`, cambiare `text-ink-300` in `text-ink-400`. Tre righe, copiate da app/product/[id]/page.tsx:1010-1021.

### Il carrello dice «sei vuoto» al primo disegno, anche quando è pieno

**Dove:** `/home/user/mycity/app/cart/page.tsx:24 e :120-131 · /home/user/mycity/app/checkout/page.tsx:46 e :809-816` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO col file davanti. In tutte e due le pagine lo stato parte vuoto — `const [items, setItems] = useState<CartItem[]>([])` (cart:24), `const [cart, setCart] = useState<CartItem[]>([])` (checkout:46) — e il carrello vero si legge dentro `useEffect` (cart:35-41, checkout:47-66), che React esegue dopo il primo disegno. Il ritorno anticipato arriva prima: `if (items.length === 0)` mostra l'EmptyState «Il tuo carrello è vuoto — Esplora i prodotti» (cart:120-131), e `if (cart.length === 0)` mostra «Il tuo carrello è vuoto. Torna al negozio» (checkout:809-816). Su /checkout il difetto è peggiore perché il vero stato di attesa esiste ma sta DOPO (`if (loadingGroups) return <LoadingState />`, riga 818): il vuoto vince sempre sul caricamento. Nessuno stato intermedio fra «vuoto» e «pieno».

**Come si ripara:** Aggiungere una bandierina di montaggio (`const [letto, setLetto] = useState(false)`, messa a true nello stesso `useEffect` che chiama `getCart()`) e finché è false mostrare uno scheletro del carrello, non l'empty state — su /checkout spostando il controllo prima del blocco a riga 809. In alternativa leggere il carrello con `useSyncExternalStore`, così il primo render ha già il valore vero.

### Dopo l'ordine riuscito il pulsante di conferma torna attivo: si può ordinare due volte

**Dove:** `/home/user/mycity/app/checkout/page.tsx:749 (`isCheckingOut`), :646-664 (onSuccess contanti), :739-742 (onSuccess carta), :764-808 (handleSubmit) · barra mobile :1079-1092 · /home/user/mycity/components/checkout/OrderSummary.tsx:98-104` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO, catena completa. ① Il blocco è solo `const isCheckingOut = placeOrders.isPending || payWithStripe.isPending` (riga 749). ② In React Query 5 lo stato «in corso» si spegne DOPO `onSuccess`: in node_modules/@tanstack/query-core/build/modern/mutation.js il `this.#dispatch({ type: "success", data })` (riga 143) sta a valle di `await this.options.onSuccess?.(…)` (riga 123). ③ Ramo contanti: `onSuccess` chiama `chiudiIlTentativo()` (riga 650 — butta la chiave anti-doppione, confermato l'import da `@/lib/ordini/tentativo` a riga 12 e l'uso come header `idempotency-key` a riga 593), poi `clearCart()` e `router.push`; la pagina NON ascolta `cart:updated` (grep: zero occorrenze in checkout/page.tsx), quindi lo stato `cart` resta pieno, `groups.length > 0` e il pulsante si riaccende durante il cambio pagina. ④ `handleSubmit` (764-808) non ha nessuna guardia tipo `if (isCheckingOut) return`. ⑤ Ramo carta: dopo `window.location.assign(url)` (riga 741) il dispatch success riabilita il pulsante mentre il browser naviga. ⑥ Vale sia per OrderSummary (`disabled={isCheckingOut}`, riga 102, con `type` che torna 'submit' appena `disabled` è falso) sia per la barra fissa mobile (riga 1082). Un secondo tocco crea un secondo ordine vero, con chiave nuova.

**Come si ripara:** Aggiungere uno stato che non si spegne: `const [inPartenza, setInPartenza] = useState(false)`, messo a true come PRIMA riga di entrambi gli `onSuccess` e mai rimesso a false, e includerlo in `isCheckingOut` insieme a `placeOrders.isSuccess || payWithStripe.isSuccess`. In più una guardia `if (isCheckingOut) return;` in cima a `handleSubmit`.

### Il riquadro grande della home, mentre carica, mostra un negozio finto con prezzi finti

**Dove:** `/home/user/mycity/components/home/HeroStoreCard.tsx:63-65 e :72 · HeroStorePlaceholder :191-256` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO parola per parola. `if (!data?.store) return <HeroStorePlaceholder />` (riga 72) usa come stato di caricamento un negozio inventato e credibile: `Salumeria del Borgo` (riga 217), `Via Calzolai` (riga 222), pallino verde `animate-pulse-soft` con «Aperto ora» (riga 211-213), etichette «Negozio locale» e «Consegna oggi» (225-230), sei prodotti con prezzi scritti a mano nell'array `demo` (192-199: Coppa DOP €9,50, Prosciutto crudo €15,00, Bresaola €18,00) e «Consegna stimata — oggi, entro 18:00» (riga 249-250). Nessun `aria-hidden` sul blocco, nessuno scintillio, nessuna parola «esempio». E la funzione della query restituisce `null` anche in errore (righe 63-65, col commento «Il riquadro non è mai vuoto»): se la RPC `vetrina_home` fallisce, quel negozio inventato con quei prezzi inventati resta sulla home a tempo indeterminato. È un problema di onestà, non solo di stato di caricamento.

**Come si ripara:** Distinguere i due casi con `isLoading`/`isError` (e togliere il `return null` sull'errore, così `isError` esiste davvero). Mentre carica: scheletro neutro della stessa forma e altezza (classe `.skeleton` già in globals.css:183), senza nomi né prezzi. Senza negozio o in errore: un riquadro onesto («Stiamo scegliendo il negozio in vetrina») o la CTA generica. Mai nomi e prezzi inventati.

### Home, sezione categorie: il titolo resta con il vuoto sotto mentre carica, e per sempre se la lettura fallisce

**Dove:** `/home/user/mycity/components/home-sections/HomeSectionRenderer.tsx:174-188 · /home/user/mycity/components/CategoryShowcase.tsx:75-96` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO. Il renderer disegna sempre il titolo «Cosa cerchi oggi?» e il sottotitolo «Tutte le categorie del mercato locale» e poi mette dentro `<CategoryShowcase />` (righe 176-186). Il componente fa `const { data: categories = [] } = useQuery({…})` (riga 75) senza leggere né `isLoading` né `isError`, e restituisce comunque `<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">` con `categories.slice(0, 6).map(...)` (righe 94-96): finché la risposta non arriva il contenitore è alto zero, poi arrivano sei tessere `aspect-[4/3]` che spingono giù la pagina — scostamento di impaginazione sulla pagina più vista. In errore (`if (error) throw error`, riga 85) il risultato a schermo è identico e permanente. Verificato anche l'ultimo pezzo: `MaybeSection` è importato a riga 20 ma usato solo nel `case 'dropOfDay'` (righe 194-196), non nel `case 'categories'`, quindi il titolo non può nemmeno sparire.

**Come si ripara:** In CategoryShowcase prendere `isLoading` e `isError`: mentre carica disegnare sei tessere-scheletro con la stessa `aspect-[4/3]`, in errore restituire `null`. E avvolgere il `case 'categories'` in `MaybeSection` come già fa dropOfDay.

### Notifiche: qualunque errore di rete butta la persona fuori, sulla pagina di accesso

**Dove:** `/home/user/mycity/app/notifications/page.tsx:62-76 e :101-104` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO. La funzione della query lancia in due casi che a valle non si distinguono: `throw new Error('Non autenticato')` se manca l'utente (riga 66) e `throw error` se la lettura di `notifications` fallisce (riga 73). Il render li tratta uguali: `if (error) { if (typeof window !== 'undefined') router.push('/sign-in'); return null; }` (righe 101-104). A un cliente regolarmente collegato basta un errore RLS, un timeout o una rete storta perché la pagina lo scarichi sulla schermata di accesso, senza messaggio e senza «Riprova» — e chi lo vive pensa di aver perso l'account. Nessun `ErrorState` da nessuna parte in questo file. In più il `router.push` è chiamato dentro il render, non in un effetto.

**Come si ripara:** Nella query lanciare un marcatore riconoscibile per il non-autenticato (`throw new Error('AUTH_REQUIRED')`) e nel render fare il redirect dentro un `useEffect` SOLO su quello; per tutto il resto mostrare `<ErrorState title="Non riusciamo a caricare le notifiche" onRetry={() => refetch()} />`, come già fa /stores.

### «Vicino a te»: se la lettura fallisce la pagina dice che a Piacenza non c'è nessun negozio

**Dove:** `/home/user/mycity/app/near/page.tsx:36-45 (errore ingoiato), :124-131, :204-207, :260-266` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO il difetto, ma la causa è più a monte di quanto scritto dal collega. In `fetchNearData` la lettura dei negozi è `const { data: storesRaw } = await conRipiegoSchema(...)` (riga 36): il campo `error` non viene mai letto, e `conRipiegoSchema` (lib/db/migrazione-124.ts:71-84) non lancia — restituisce il risultato così com'è. Quindi una lettura fallita non diventa mai un errore: la query va a buon fine con `stores: []` (riga 45-47). A schermo si vede «0 negozi a Piacenza» (righe 204-207) e il riquadro «Nessun negozio entro 5 km. Aumenta il raggio per vederne di più» (righe 260-266), senza nessun pulsante per riprovare: un guasto presentato come un fatto commerciale, su una delle porte d'ingresso alla scoperta dei negozi. Il caso del permesso di posizione negato invece è gestito bene (`permError`, righe 209-215).

**Come si ripara:** Il solo `isError` nella pagina NON basta, perché la query non fallisce mai: prima far emergere l'errore in `fetchNearData` (leggere `error` dal risultato e lanciarlo), poi prendere `isError`/`refetch` a riga 124 e mostrare `<ErrorState title="Non riusciamo a caricare i negozi" onRetry={() => refetch()} />` prima del blocco «Nessun negozio» — lo stesso trattamento di app/stores/page.tsx:219-227.

### Il cuore dei preferiti non ha attesa, non ha errore e non si aggiorna subito

**Dove:** `/home/user/mycity/components/hooks/useFavorites.ts:28-41 · /home/user/mycity/components/ProductCard.tsx:95-107 · /home/user/mycity/app/product/[id]/page.tsx:116` · **Area:** Stati dell interfaccia · **Corsia:** codice

CONFERMATO su tutti e tre i punti. ① Nessun aggiornamento ottimista: la mutazione ha solo `onSuccess: () => qc.invalidateQueries(...)` (riga 39), quindi il cuore si riempie dopo `auth.getUser()` → insert → invalidazione → nuova lettura. Nel frattempo l'unico segnale è l'animazione `heartBeat` di 600 ms (ProductCard 98-100), che finisce prima. ② Gli errori sono ingoiati: `await supabase.from('favorites').delete()...` e `.insert(...)` (righe 33-36) non controllano il campo `error`, quindi anche a scrittura fallita la mutazione riesce, parte `onSuccess`, il cuore torna vuoto e nessun messaggio compare — salvataggio perso in silenzio. La chiave primaria è `(user_id, product_id)` (migrations/014_mvp_sprint.sql:38-42), quindi un doppio tocco produce davvero un errore di duplicato che nessuno vede. ③ `toggle.isPending` non è usato da nessuna parte: `grep isPending` su ProductCard.tsx non dà risultati e su app/product/[id]/page.tsx trova solo `submitReview.isPending` (riga 1039). A due file di distanza il modello giusto c'è già: useFollowStore.ts:70-100 ha `if (error) throw error`, `onMutate` ottimista e rollback in `onError`.

**Come si ripara:** Copiare useFollowStore: `if (error) throw error` dopo insert e delete, un `onMutate` che ribalta subito l'insieme in cache, un `onError` che lo rimette a posto e mostra il messaggio, e `disabled={toggle.isPending}` sul pulsante del cuore in ProductCard e nella scheda prodotto.

### Se incolli l'indirizzo di un'immagine esterna, la pagina mostra un buco senza dire perché

**Dove:** `components/ImageUrlField.tsx:99-106 (campo «oppure incolla un URL https://…»), reso poi da app/events/page.tsx:161-168, app/shop-of-month/page.tsx:165-174, components/home/HomeEvents.tsx:65-67` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Il campo invita a incollare un indirizzo qualsiasi, ma il sito accetta immagini solo da quattro domini: `*.supabase.co`, `placehold.co`, `api.iconify.design`, `images.pexels.com` (next.config.js:33-49). Ogni altro indirizzo fa rispondere 400 all'ottimizzatore di Next, e sarebbe comunque fermato dal browser perché la politica di sicurezza elenca gli stessi domini (middleware.ts:196). Nessun avviso all'admin: salva, e la copertina resta vuota sulla home e sulla pagina eventi. Il precedente citato è vero ed è scritto nel codice: i QR presi da api.qrserver.com venivano bloccati dalla stessa politica (components/SimpleQR.tsx:11-17).

**Come si ripara:** Validare il dominio dentro il campo e mostrare l'errore subito («questo indirizzo non è ammesso, carica il file»); oppure scaricare l'immagine lato server e riversarla nello Storage.

### Il logo del negozio viene ritagliato a quadrato: i marchi con la scritta diventano illeggibili

**Dove:** `lib/image-url.ts:44-51 e :63-67 (ritaglio quadrato per thumb/card con height=width e resize=cover) + i punti che lo usano: components/products/SellerCard.tsx:144, components/home/StoriesCarousel.tsx:73, components/StoryViewer.tsx:203, components/home/ShopOfMonthHero.tsx:117, app/shop-of-month/page.tsx:208, app/orders/page.tsx:301, app/orders/[id]/page.tsx:612` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO, con una correzione al collega. Il taglio vero è UNO e lo fa il CDN: per le misure `thumb` e `card` l'indirizzo viene riscritto con width=height e `resize=cover`, cioè il server tiene solo il quadrato centrale. Su un marchio 1000×300 tipo «Panificio Garetti» restano i 300 pixel centrali: si legge un pezzo di parola. Il successivo `object-cover` nel cerchio non toglie altro, perché l'immagine arriva già quadrata — quindi non è un doppio taglio. Nei punti che passano l'indirizzo grezzo (components/StoreAvatar.tsx:33-39, components/Navbar.tsx:326 e :352, components/MobileAccountSheet.tsx:66, components/account/AccountSidebar.tsx:116-120) il taglio lo fa solo il CSS, ma il risultato per un logo largo è lo stesso. Confermato anche che al caricamento non c'è né quadratura né ritaglio guidato (components/VendorForm.tsx:110-130): il negoziante carica il marchio così com'è e lo ritrova mozzato ovunque.

**Come si ripara:** Per i loghi usare `object-contain` su fondo bianco con un po' di margine (il cerchio resta) e chiedere al CDN `resize=contain`. In alternativa, ritaglio guidato al caricamento con anteprima di come verrà.

### Le foto di «Ultimi visti», «Completa con» e degli sponsorizzati sono ingrandite da 100 pixel

**Dove:** `components/RecentlyViewed.tsx:78-88 · components/cart/CartUpsell.tsx:99-108 · components/SponsoredCarousel.tsx:146-147 · app/cart/page.tsx:229-237 · app/seller/promote/page.tsx:139-140` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO in ogni punto. Queste immagini mettono insieme due cose incompatibili: la misura `thumb`, che chiede al CDN una foto larga 100 pixel (lib/image-url.ts:16), e l'attributo `unoptimized`. Il secondo azzera sia l'elenco delle varianti sia l'attributo `sizes` — controllato nel codice installato, node_modules/next/dist/shared/lib/get-img-props.js:96-104 — quindi resta quell'unico indirizzo da 100 pixel. I riquadri sono più grandi: 144 e 160 pixel in «Ultimi visti», 144 in «Completa con», 128-144 negli sponsorizzati, 96 nel carrello. La foto viene ingrandita già su uno schermo normale e di due o tre volte su un telefono moderno — e lo spazio sponsorizzato per giunta si fa pagare.

**Come si ripara:** Togliere `unoptimized` e passare `loader={caricatoreFotoRemote}`, come già fa components/ProductCard.tsx:161. Next chiede la larghezza giusta e il ridimensionamento resta sul CDN di Supabase, senza costi in più.

### Sulla home le schede negozio scaricano la foto grande e la marcano urgente, sei volte

**Dove:** `components/StoreMediaCarousel.tsx:67-73 (`sizedImage(m.url,'hero')`, `sizes="…1024px"`, `priority={i === 0}`) usato in scheda piccola da components/StorePreviewCard.tsx:58-62 con altezza h-24/h-28, per i 6 negozi di components/StoreShowcase.tsx:20 e :106` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Lo stesso componente serve due usi diversi: la copertina a tutta pagina del negozio e la miniatura dentro la scheda della vetrina. Ma la misura è scritta fissa nel componente: chiede sempre la versione da 1200 pixel e dichiara al browser 1024 pixel di occupazione, mentre nella scheda la copertina è alta 112 pixel e larga circa 270. In più `priority` è fisso sulla prima foto di ogni carosello: con sei negozi in vetrina sono sei immagini grandi marcate «urgenti» e precaricate nell'intestazione, pur stando sotto la piega.

**Come si ripara:** Aggiungere due proprietà al componente: la misura richiesta (`hero` o `card`) e `priority`, decise da chi lo usa. Nella scheda: `card`, `sizes="(max-width:640px) 50vw, 280px"`, niente priority.

### Le copertine degli eventi in home vengono tagliate e restano una fascia centrale

**Dove:** `components/home/HomeEvents.tsx:65-67 (riquadro `aspect-[16/9]` con `sizedImage(e.cover_image_url,'card')`), da confrontare con app/events/page.tsx:161-168 che usa 'detail'` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. La misura `card` fa impostare al CDN altezza uguale a larghezza con `resize=cover` (lib/image-url.ts:48-50): su una copertina 16:9 il server butta via le due fasce laterali, poi il riquadro 16:9 con `object-cover` butta via sopra e sotto. Di una locandina 1600×900 resta circa la metà centrale. Titoli, date e loghi messi ai lati spariscono. Che sia un errore e non una scelta lo dimostra la pagina Eventi, che sulla stessa copertina usa 'detail' e non ritaglia: la stessa immagine appare in due modi diversi nelle due pagine. E il pannello admin chiede proprio il 16:9 (app/admin/events/page.tsx:291). Nota tecnica: il caricatore su misura presente qui non salva la situazione, perché l'altezza è già scritta nell'indirizzo e lib/image-loader.ts:60 la riallinea alla larghezza.

**Come si ripara:** In HomeEvents usare `sizedImage(e.cover_image_url, 'detail')`, come fa già la pagina Eventi.

### Il banner della home chiede un'immagine 16:9 e poi la mostra in una fascia da 3,5:1

**Dove:** `components/admin/home/HomeSectionConfigForm.tsx:246 («Consigliato 16:9») contro components/home-sections/HomeSectionRenderer.tsx:409-410 e components/cms/CmsBlockRenderer.tsx:38-39 (riquadro `h-56 sm:h-72`)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO. Il riquadro del banner ha altezza fissa — 224 pixel su telefono, 288 sul computer — e larghezza piena del contenitore (circa 1024-1150 pixel sul desktop). Fa un rapporto vicino a tre volte e mezzo a uno. Chi carica il 16:9 che il pannello gli ha chiesto (1600×900) si vede tagliare più della metà dell'altezza: sparisce quello che sta in alto e in basso. L'istruzione data all'admin e il riquadro vero non vanno d'accordo, e chi carica non ha modo di accorgersene prima di pubblicare.

**Come si ripara:** O si allinea il riquadro all'immagine (`aspect-[16/9]` con un tetto di altezza), o si cambia il consiglio in «3:1, per esempio 1600×540». Meglio ancora: anteprima ritagliata dentro il pannello.

### Le tessere delle categorie in home sono foto d'archivio scritte a mano nel codice

**Dove:** `components/CategoryShowcase.tsx:43-58 (undici indirizzi Pexels fissi) e :118 (`onError` che nasconde l'immagine)` · **Area:** Immagini e media · **Corsia:** codice

VERIFICATO parola per parola. La griglia illustrata delle categorie mostra undici foto stock Pexels incollate nel codice, e il commento sopra l'elenco lo ammette: «Scelte “a stima” e NON verificabili dalla sandbox». Sono immagini che potrebbe avere qualunque sito, e non sono modificabili dal pannello: la tabella `categories` non ha nessuna colonna immagine (migrations/002_categories_and_extras.sql:4-11, e la 076 aggiunge solo `sort_order` e `featured`), quindi per cambiarne una serve pubblicare di nuovo il sito. Se una foto sparisce da Pexels la tessera resta un gradiente e nessuno se ne accorge, perché l'errore viene nascosto mettendo l'immagine a display:none.

**Come si ripara:** Spostare le foto in una colonna `image_url` della tabella categorie (o in site_settings) così si cambiano dal pannello, e sostituirle con foto vere fatte nei negozi di Piacenza. Nel frattempo tenere il gradiente di categoria, che almeno è del brand.

### Sulla scheda prodotto, da telefono, nome e prezzo arrivano dopo negozio, «Segnala» e partita IVA

**Dove:** `app/product/[id]/page.tsx:485 (griglia `grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_320px]`), 634-660 (colonna INFO), 662 (h1), 712 (prezzo)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato col file davanti. La griglia è `grid-cols-1` su telefono, quindi i figli si impilano nell'ordine del codice. Dentro la colonna INFO l'ordine scritto è: `<SellerCard>` (riga 638) → `<Segnala tipo="prodotto">` (riga 651) → `<VendutoDa>` (ragione sociale, sede, P.IVA — riga 655) → SOLO ORA l'`<h1>` col nome del prodotto (riga 662) e il prezzo (riga 712). Sopra la colonna INFO c'è già la galleria quadrata (`aspect-square`, riga 488) più le miniature, la barra in alto e le briciole di pane. Chi apre il prodotto da telefono vede quindi foto, negozio, un link per segnalare abusi e una partita IVA prima di leggere COSA sta guardando e QUANTO costa. (Non ho misurato i pixel su un dispositivo vero: la distanza esatta è una stima, l'ordine dei blocchi no.)

**Come si ripara:** Riordinare i figli della colonna INFO: h1 + prezzo + badge sconto subito sotto la galleria, poi SellerCard, e spostare «Venduto da» e «Segnala» in fondo alla colonna (o dentro la fisarmonica delle informazioni legali). Nessuna logica cambia: è solo l'ordine dei blocchi JSX dentro il div `space-y-4`.

### Tra 768 e 1023px il riquadro d'acquisto scivola da solo su una seconda riga, e la barra fissa è già sparita

**Dove:** `app/product/[id]/page.tsx:485 (griglia) e 850-851 (terzo figlio, «CTA STICKY»); components/StickyAddToCart.tsx:53 (`md:hidden`)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. La griglia ha tre figli in flusso — galleria (488), INFO (634), riquadro d'acquisto (851) — ma alla misura `md` è a DUE colonne: prima riga galleria|INFO, e il riquadro col prezzo, la quantità e «Aggiungi al carrello» finisce da solo in seconda riga, sotto la colonna INFO che è altissima. Nella stessa fascia di larghezza `StickyAddToCart` è `md:hidden` (riga 53), quindi la barra d'acquisto in fondo non c'è. Su un iPad in verticale (768px) e su un telefono grande girato in orizzontale non resta nessun pulsante d'acquisto visibile senza scorrere sotto tutta la colonna INFO.

**Come si ripara:** Alla misura `md` far occupare al riquadro d'acquisto la seconda colonna della prima riga (`md:row-span-2 md:col-start-2`), oppure passare da 1 colonna direttamente a 3 (`lg`) tenendo `md` a colonna singola. In alternativa nascondere StickyAddToCart solo da `lg` in su, dove la colonna appiccicata a destra esiste davvero.

### Nel carrello, da telefono, «Procedi al checkout» sta in fondo a tutto e non c'è nessuna barra fissa

**Dove:** `app/cart/page.tsx:194 (`grid-cols-1 lg:grid-cols-3`), 357 (colonna riepilogo, secondo figlio), 411-419 (link al checkout)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. La colonna del riepilogo è il secondo figlio della griglia e ha `lg:sticky` — cioè si incolla SOLO da 1024px in su. Su telefono la griglia è a una colonna e il riepilogo si impila dopo tutti i prodotti e dopo i blocchi della colonna sinistra. Il grep `fixed bottom-` / `sticky bottom-` / `fixed left-0 right-0` su app/cart non trova nulla: a differenza della scheda prodotto (StickyAddToCart) e del checkout (barra fissa a app/checkout/page.tsx:1072), il carrello è l'unico dei tre passaggi del funnel senza CTA sempre visibile.

**Come si ripara:** Aggiungere una barra fissa `lg:hidden` in fondo al carrello con totale + «Procedi al checkout», copiando il pattern già collaudato di StickyAddToCart (stesso `bottom: calc(env(safe-area-inset-bottom) + var(--tabbar-height) + var(--altezza-banner-cookie))`, così non finisce sotto la barra a schede né sotto il banner cookie).

### Il pannello per cambiare il CAP esce dal bordo destro dello schermo

**Dove:** `components/LocationPill.tsx:105 (`absolute left-0 top-full mt-2 w-72`) e 82 (riquadro suggerimento `w-64`); components/Navbar.tsx:176 (la pillola è centrata su mobile)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. Nella riga mobile della barra in alto la pillola sta dentro `<div className="min-w-0 flex-1 flex justify-center">` (Navbar.tsx:176), quindi è centrata fra logo e icona carrello: su uno schermo da 360px il suo bordo sinistro cade oltre metà larghezza. Il pannello che si apre è ancorato `left-0` alla pillola ed è largo `w-72` (288px), quindi sfora il bordo destro. In app/globals.css non c'è nessun `overflow-x: hidden` (né su html né su body, verificato col grep): la pagina guadagna scorrimento laterale e la parte destra del campo CAP e del pulsante di conferma resta fuori schermo. Stessa costruzione per il riquadro suggerimento `w-64` alla riga 82.

**Come si ripara:** Su mobile ancorare il pannello allo schermo invece che alla pillola: `fixed inset-x-3 top-[var(--header-height)] w-auto sm:absolute sm:left-0 sm:w-72`, oppure `w-[min(18rem,calc(100vw-1.5rem))]` con `left-1/2 -translate-x-1/2`. Stesso trattamento al riquadro `w-64`.

### I campi di ricerca sono a 14px: iPhone ingrandisce la pagina da solo appena li tocchi

**Dove:** `components/SearchBar.tsx:174 (`text-sm`, campo presente in tutte le pagine); components/checkout/CouponInput.tsx:63; components/StoreProductExplorer.tsx:75; app/stores/page.tsx:249; components/ProductQA.tsx:162; components/NewsletterForm.tsx:78; components/LocationPill.tsx:121` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato uno per uno: tutti e sette gli `<input>` citati hanno `text-sm` (14px). Safari su iPhone ingrandisce la pagina quando si mette a fuoco un campo sotto i 16px e non torna indietro da solo. Il progetto conosce già la regola: components/ui/Field.tsx:22 dichiara in commento «mobile: `text-base` (≥16px) per non innescare lo zoom automatico su iOS» e la riga 30 usa `text-base` — ma questi campi non passano dalla primitiva. Il più esposto è quello di SearchBar, montato nella barra in alto di ogni pagina (Navbar.tsx:207); il secondo è il campo coupon dentro il checkout.

**Come si ripara:** Portare questi campi a `text-base` (o `text-base sm:text-sm` per tenere il compatto sul desktop). Meglio: farli passare dalla primitiva `Input` di components/ui/Field.tsx, e aggiungere una regola di lint che vieti `text-sm`/`text-xs` su `<input>`, `<select>`, `<textarea>`.

### Il banner dei cookie in modalità «Personalizza» torna a coprire il pulsante «Aggiungi al carrello»

**Dove:** `components/CookieBanner.tsx:65-80 (effetto che misura l'altezza, dipendenze `[show]`), 106-128 (il pannello `mode === 'custom'` con quattro righe di consenso)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. L'effetto misura `contenitoreRef.current?.offsetHeight` e lo pubblica in `--altezza-banner-cookie` (riga 75), ma le sue dipendenze sono `[show]` (riga 80), non `[show, mode]`. Quando la persona tocca «Personalizza», il blocco `mode === 'custom'` aggiunge quattro righe dentro un riquadro `mt-4 … p-3` (righe 106-128) e il banner cresce, mentre la variabile resta ferma al valore compatto. Il banner è `z-[100]` (riga 93), StickyAddToCart è `z-30` e calcola il proprio `bottom` proprio da quella variabile (StickyAddToCart.tsx:53-57): la barra d'acquisto finisce sotto al banner e il pulsante che fa incassare torna non premibile — è il rientro dalla finestra della correzione #124, citata nei commenti di entrambi i file.

**Come si ripara:** Aggiungere `mode` alle dipendenze dell'effetto e ri-misurare a ogni cambio di dimensione del contenitore (ResizeObserver), così `--altezza-banner-cookie` segue l'altezza reale.

### «Vicino a te» chiede la posizione a freddo, blocca la pagina con un caricamento e mostra l'errore del browser in inglese

**Dove:** `app/near/page.tsx:112-123 (getCurrentPosition dentro useEffect al montaggio), 172-179 (schermata «Calcolo distanze…»), 119 e 209 (messaggio d'errore)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato, tre difetti nello stesso punto. ① `navigator.geolocation.getCurrentPosition` parte dentro un `useEffect(..., [])` al montaggio (riga 117): il popup di sistema arriva prima di qualsiasi contenuto e senza una riga che spieghi perché — un permesso chiesto a freddo viene negato molto più spesso, e una volta negato il browser non lo richiede più. ② La guardia `if (isLoading || (!pos && !permError))` (riga 172) mostra SOLO «Calcolo distanze…» finché la persona non risponde al popup, fino ai 10 secondi di `timeout` dichiarati alla riga 121, anche se l'elenco dei negozi sarebbe già disponibile senza posizione (il codice alla riga 156 prevede già il caso «senza posizione mostriamo tutti»). ③ Il messaggio concatena `err.message` (riga 119), che il browser scrive in inglese: «Impossibile ottenere la posizione: User denied Geolocation».

**Come si ripara:** ① Mostrare prima l'elenco e chiamare getCurrentPosition solo al tocco di un pulsante «Usa la mia posizione» che spiega a cosa serve. ② Togliere `!pos && !permError` dalla condizione di caricamento: la lista si mostra subito, la distanza si aggiunge quando arriva. ③ Tradurre l'errore per `err.code` (1 permesso negato, 2 posizione non disponibile, 3 tempo scaduto) invece di stampare `err.message`.

### Su iPhone non esiste nessun modo per installare l'app: il banner non compare mai

**Dove:** `components/PWAInstallBanner.tsx:48-59 (ascolto di `beforeinstallprompt`), 70-72 (`setShow(!!promptEvent && …)`), 87 (`if (!show) return null`)` · **Area:** Esperienza da telefono · **Corsia:** codice

Verificato. Il banner si mostra solo se `promptEvent` è valorizzato, e `promptEvent` si valorizza solo dentro il gestore di `beforeinstallprompt` (righe 52-57), evento che Safari su iOS non emette: su iPhone il banner non compare mai e nel file non c'è nessun ramo alternativo. Il grep su app/ e components/ per `apple-mobile-web-app`, `standalone` e per istruzioni d'installazione non trova nessuna spiegazione tipo «tocca Condividi → Aggiungi alla schermata Home» da nessuna parte (gli unici `standalone` sono i due controlli dentro questo stesso file e due commenti). Con la strategia «PWA invece di app native», su iOS l'installazione non è proprio offerta.

**Come si ripara:** Aggiungere un ramo iOS: riconoscere Safari su iPhone/iPad fuori da `display-mode: standalone` e mostrare lo stesso banner con le istruzioni Condividi → Aggiungi alla schermata Home, con la stessa regola delle 3 visite e lo stesso «Più tardi». Contare separatamente le due strade.

### Il «+» delle vetrine aggiunge prodotti con varianti senza variante, e le istruzioni del checkout per sbloccarsi non funzionano

**Dove:** `components/ProductGrid.tsx:469 (unico punto che passa hasVariants); mancante in components/store-sections/CollectionSection.tsx:52-66, components/home/PromoDeals.tsx:56-66, app/promozioni/page.tsx:100-110, components/StoreFeaturedStrip.tsx:65-76, app/favorites/page.tsx:91-102; app/checkout/page.tsx:249-251 + 1055 + 1082; lib/cart.ts:17` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO col file davanti. `grep hasVariants=` restituisce UNA sola occorrenza in tutto il progetto: ProductGrid.tsx:469. Nelle altre cinque vetrine ProductCard riceve hasVariants=undefined, quindi handleAdd (ProductCard.tsx:76-79) non porta alla scheda e aggiunge la riga senza variante. Al checkout `variantIssues` spegne sia il pulsante desktop (prop disabled di OrderSummary) sia quello della barra mobile, e il riquadro dice «Apri il prodotto, seleziona la variante e aggiungilo di nuovo al carrello». Ma `sameLine` in lib/cart.ts:17 confronta prodotto E variante: la riga nuova si aggiunge, quella rotta resta, e il blocco non si scioglie. Nel riquadro variantIssues non c'è nessun pulsante di rimozione (gli orfani ce l'hanno, righe 959-969). Correzione alla severità del collega: NON è bloccante per sempre — dal carrello la riga si può cancellare col cestino — ma chi segue le istruzioni scritte non ne esce.

**Come si ripara:** ① Passare `hasVariants` (e `stock`) alla ProductCard nei cinque punti elencati. ② Aggiungere nel riquadro variantIssues i pulsanti «Apri il prodotto» e «Togli dal carrello» (stesso removeFromCart della riga 962). ③ Stesso pulsante nel riquadro stockIssues.

### Con due negozi il riepilogo del carrello scrive «Gratis*» e intanto mette 9,80 € di spedizione nel Totale

**Dove:** `app/cart/page.tsx:118 (freeShipping globale), 172-185 (shippingCost per negozio + finalTotal), 382-384 (etichetta); lib/shipping.ts:29; app/checkout/page.tsx:1031 (FreeShippingProgress con grandSubtotal)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. `freeShipping = total >= FREE_SHIPPING_THRESHOLD` è calcolato sul totale globale, mentre `shippingCost` somma `shippingForEuro` per gruppo-negozio, e shippingForEuro azzera solo se il subtotale DEL GRUPPO supera la soglia. Con 20 € da un negozio e 15 € da un altro (35 € totali) l'etichetta stampa «Gratis*» e `finalTotal` (riga 185) contiene comunque 4,90+4,90 = 9,80 €, senza una riga che li spieghi. Il codice mitiga solo a metà: scrive «Spedizione stimata», «Gratis*» e «stima · potrebbe variare al checkout», ma l'asterisco non ha legenda e il numero resta nel totale. Stesso difetto al checkout: FreeShippingProgress riceve `grandSubtotal` globale e scrive «Hai la spedizione gratis» mentre OrderSummary poco sotto addebita la spedizione.

**Come si ripara:** Calcolare `freeShipping` per gruppo come già fa `shippingCost`: «Gratis» solo se OGNI gruppo supera la soglia, altrimenti stampare formatPrice(shippingCost). Al checkout passare a FreeShippingProgress il subtotale del gruppo che non ha ancora raggiunto la soglia, o nasconderla nel multi-negozio.

### «Spedizione gratuita» in vetrina, ma 3 € di «Consegna MyCity» si pagano su ogni ordine a domicilio

**Dove:** `lib/constants.ts:64 (PLATFORM_DELIVERY_FEE_CENTS=300); components/ProductCard.tsx:119 e 200-204; app/product/[id]/page.tsx:363 e 854-856; components/ui/FreeShippingProgress.tsx:34-38; app/checkout/page.tsx:470; components/checkout/OrderSummary.tsx:60-65 e 146` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. `platformDeliveryFee = groups.length * 3 €` è sempre addebitato quando non c'è ritiro in negozio, anche sopra i 30 €. Intanto ProductCard mostra il badge «Sped. gratis» quando `price >= 30`, la scheda prodotto mostra «Spedizione gratuita» e FreeShippingProgress scrive «Hai la spedizione gratis». Nella scheda prodotto — l'ultimo schermo prima dell'aggiunta al carrello — i 3 € non compaiono da nessuna parte: il primo posto dove si vedono è il carrello. Al checkout il riepilogo scrive «Spedizione: Gratis» e subito sotto «Consegna MyCity 3,00 €», con la rassicurazione «Pagamento sicuro con Stripe. Niente costi nascosti» (OrderSummary:146) appoggiata sopra il costo mai annunciato prima. Per il cliente «spedizione» e «consegna» sono la stessa cosa.

**Come si ripara:** Una strada sola: (a) chiamare il costo col suo nome già su card e scheda prodotto («Spedizione gratis sopra 30 € · 3 € di consegna»), oppure (b) far rientrare i 3 € nella soglia e tenere il claim. In ogni caso mostrare la riga «Consegna MyCity 3,00 €» nel riquadro rassicurazione della scheda prodotto (page.tsx:734-745).

### «Carta o contanti alla consegna, decidi tu»: la carta alla consegna non esiste

**Dove:** `app/product/[id]/page.tsx:739; app/cart/page.tsx:428; components/checkout/PaymentMethodSelector.tsx:81-83 e 114-117` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO parola per parola. Scheda prodotto: «Puoi pagare alla consegna — carta o contanti, decidi tu». Carrello: «Carta o contanti alla consegna, decidi tu». Al checkout le opzioni reali sono due e diverse: «Carta di credito / debito — pagamento sicuro su Stripe» (anticipato, si esce dal sito) e «Contanti alla consegna — paghi al rider quando ricevi il pacco». Chi si è fidato proprio perché non voleva anticipare i soldi scopre alla cassa che con la carta deve pagare subito. Anche lib/constants.ts:79 (VALUE_PROPS) dice la cosa giusta — «in contanti» — quindi le due righe sono le uniche fuori riga.

**Come si ripara:** Uniformare il claim al vero: «Paghi in contanti alla consegna, oppure con carta adesso». Correggere app/product/[id]/page.tsx:739 e app/cart/page.tsx:428.

### Nel checkout convivono tre promesse di consegna diverse, e una resta scritta anche se scegli «Domani»

**Dove:** `app/checkout/page.tsx:883; components/checkout/DeliverySlotPicker.tsx:44 (NOW_LABEL «~30–45 min»), 103 (subtitle «~30–45 min»), 33-36 (fasce di oggi); lib/delivery.ts:13 (EXPRESS_ETA_LABEL «30-60 min»)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Dentro l'unico riquadro «Quando vuoi riceverlo»: la mattonella «Adesso» dice «~30–45 min», la riga «Consegna a domicilio» sotto dice «In 30-60 minuti dalla conferma del negozio», la fascia preselezionata è «In giornata · 15:00–18:00» (slotDay parte da 'today', page.tsx:409). La riga dei 30-60 minuti è un testo FISSO: se la persona sceglie «Domani · 9:00–12:00» continua a dire «In 30-60 minuti». Tre risposte diverse alla stessa domanda nel momento della decisione, e una è falsa. Il commento del file stesso dichiara che la promessa deve essere una sola.

**Come si ripara:** Fonte unica: usare EXPRESS_ETA_LABEL (lib/delivery.ts:13) anche in DeliverySlotPicker righe 44 e 103, e rendere la riga «Consegna a domicilio» dipendente dalla fascia scelta («Consegna {deliverySlot}») invece del testo fisso.

### Dopo le 20:00 l'ordine parte con una fascia di consegna già passata

**Dove:** `components/checkout/DeliverySlotPicker.tsx:47-50, 87-92, 225-231, 236-239 (SLOT_DEFAULTS); app/checkout/page.tsx:409-413 e 612` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO riga per riga. `todayTimesAvailable()` tiene solo le fasce con endHour > ora corrente: le due fasce di oggi finiscono alle 18 e alle 20, quindi dalle 20:00 in poi la lista è vuota. L'effetto che riallinea la selezione esce subito (`if (todayTimes.length === 0) return`), il giorno resta 'today' (default), e `slotTodayTime` era stato inizializzato da `defaultTodayTime()` che, senza fasce future, ripiega su TODAY_SLOTS[0] = «In giornata · 15:00–18:00». `resolveSlotLabel` restituisce quella stringa, che finisce nel corpo della richiesta (page.tsx:612) e su orders.delivery_slot. La mattonella «Oggi» non è disabilitata (lo è solo «Adesso», fuori dalla finestra 8-21) e nulla blocca la conferma: l'ordine nasce con un appuntamento nel passato.

**Come si ripara:** Quando todayTimes.length === 0: chiamare onDayChange('tomorrow') nell'effetto oppure disabilitare la mattonella «Oggi» come si fa con «Adesso», e bloccare la conferma finché non c'è una fascia valida.

### Carrello e checkout scrivono «Il tuo carrello è vuoto» prima che parta il JavaScript

**Dove:** `app/cart/page.tsx:24 e 36-42 e 120-134; app/checkout/page.tsx:46-49 e 808-816` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Entrambe le pagine partono da `useState<CartItem[]>([])` e leggono il carrello solo dentro useEffect; lib/cart.ts legge localStorage e sul server ritorna sempre []. Il ramo «vuoto» è il PRIMO controllo del render (nel checkout precede perfino `if (loadingGroups) return <LoadingState/>`), quindi l'HTML pre-renderizzato di /cart contiene l'EmptyState «Il tuo carrello è vuoto» col pulsante «Esplora i prodotti», e quello di /checkout contiene «Il tuo carrello è vuoto. Torna al negozio». Su rete lenta la persona legge, alla cassa, che il suo carrello non esiste — e il pulsante offerto la porta via dal checkout.

**Come si ripara:** Terzo stato: `const [carrelloLetto, setCarrelloLetto] = useState(false)` messo a true nell'effetto; finché è false mostrare scheletro/LoadingState. Il ramo «vuoto» solo con carrelloLetto === true && items.length === 0.

### Al muro dell'accesso si perdono codice sconto, metodo di pagamento e fascia: al ritorno il totale è più alto

**Dove:** `app/checkout/page.tsx:797-800 (salva solo `form`), 369-384 (ripristino), 424 (paymentMethod torna al default), 492-512 (ri-verifica del coupon già esistente)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Alla riga 798 la bozza salvata è `JSON.stringify(form)` e basta: nome, indirizzo, città, CAP, telefono, note. `couponCode`/`appliedCoupon`, `paymentMethod` e slotDay/slotTodayTime/slotTomorrowTime non vengono salvati né ripristinati (l'effetto di ripristino fa solo `setForm`). Chi accede o si registra proprio nel momento di confermare torna con lo sconto sparito e il metodo riportato a 'card'. Un totale che sale dopo il login è la definizione del carrello abbandonato.

**Come si ripara:** Salvare nella stessa bozza couponCode, paymentMethod e le tre variabili della fascia; al ripristino ri-verificare il codice con validateCouponFromBrowser (la ri-verifica esiste già alle righe 492-512, basta agganciarla).

### «Reso gratuito entro 14 giorni» sulla scheda prodotto, ma la politica dice che il ripensamento lo paga il cliente

**Dove:** `app/product/[id]/page.tsx:742-744; app/returns/page.tsx:69-70 e 87` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Il riquadro rassicurazione della scheda prodotto promette «Reso gratuito entro 14 giorni» su ogni prodotto. La pagina resi dice l'opposto in due punti: «Cambio idea: le spese di restituzione sono a tuo carico» e «Non si applica a: prodotti deperibili (alimentari freschi)…» — cioè la categoria centrale di un marketplace di negozi di quartiere. Carrello («Reso facile entro 14 giorni») e checkout («Reso entro 14 giorni») sono già corretti: la scheda prodotto è l'unica che promette la gratuità.

**Come si ripara:** Allineare app/product/[id]/page.tsx:743 agli altri due passi: «Reso entro 14 giorni» con link a /returns. Per tenere «gratuito» va prima cambiata la politica, e i freschi restano comunque fuori.

### «Ordina entro 02:14:31 e arriva oggi in 30-60 min» anche con il negozio chiuso — poi il server rifiuta l'ordine all'ultimo clic

**Dove:** `lib/products/express.ts:27-34 (isExpressEligible); app/product/[id]/page.tsx:410-414 e 736; app/api/orders/cod/route.ts:278-284 e app/api/stripe/checkout/route.ts:181-186 (rifiuto «negozio chiuso»); components/store-sections/HeroSection.tsx:54 (isOpenNow esiste già)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO, con una correzione al collega: dopo le 18:00 il countdown non parte (deliveryWindow passa a «Arriva domani»), quindi l'esempio delle 22:30 è sbagliato. Il difetto vero resta: `isExpressEligible` guarda solo products.express_enabled e profiles.offers_express, mai store_hours. Un negozio chiuso di mattina (giorno di chiusura, prima dell'apertura, domenica) mostra sulla scheda prodotto «Ordina entro …:… e arriva oggi in 30-60 min» mentre la pagina dello stesso negozio dice «Chiuso ora». Il funnel prosegue fino in fondo — nemmeno il checkout controlla gli orari — e il rifiuto arriva dal server al clic finale: «Il negozio è chiuso in questo momento» (409). Percorso completo per un muro all'ultimo passo.

**Come si ripara:** Portare store_hours nel funnel: passare a DeliveryCutoff un `available` che includa isOpenNow(hours[oggi]) e, a negozio chiuso, scrivere «Il negozio riapre alle {orario}» invece del countdown; stesso controllo sulle mattonelle del checkout, così il muro arriva prima e non dopo l'indirizzo.

### L'upsell del carrello propone prodotti finiti e il «+» li aggiunge, bloccando il checkout

**Dove:** `components/cart/CartUpsell.tsx:51-68 (select senza `stock`) e 73-83; components/products/FrequentlyBoughtTogether.tsx:54 e 122-125 (fa la cosa giusta)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO, con una precisazione: CartUpsell ESCLUDE già i prodotti con varianti (`!p.has_variants`), quindi il problema è solo la giacenza. La select è `id, name, price, images, seller_id, has_variants` con filtro `status = 'available'`, e lo stock è una colonna a parte: nessun trigger porta lo status a 'out_of_stock' quando lo stock arriva a zero (in migrations c'è solo l'auto-ripubblicazione al rientro, 071:55-80, e in tutto app/ nessuno scrive 'out_of_stock'). Un prodotto disponibile-ma-finito compare senza badge, col pulsante attivo, si aggiunge al carrello e al checkout il riquadro «Disponibilità insufficiente» spegne la conferma. Nello stesso repo «Spesso comprati insieme» legge stock, scrive «Esaurito» e disabilita.

**Come si ripara:** Aggiungere `stock` alla select di CartUpsell e filtrare (`p.stock === null || p.stock > 0`), oppure disabilitare il pulsante e scrivere «Esaurito» come FrequentlyBoughtTogether.

### Le vetrine delle promozioni non sanno se un prodotto è finito né se ha varianti: manca alla fonte SQL

**Dove:** `migrations/056_active_promo_products.sql:12-20 e 27-34 (RETURNS TABLE e SELECT senza stock e has_variants); components/home/PromoDeals.tsx:56-66; app/promozioni/page.tsx:100-110` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. La RPC `active_promo_products` ritorna product_id, name, price, images, seller_id, store_name, discount_percent: né `stock` né `has_variants`. La sezione «Sconti attivi» in home e la pagina /promozioni — il traffico più caldo, quello attirato dallo sconto — costruiscono quindi card senza stock: `isOutOfStock` resta falso, il badge «Esaurito» non compare mai, il «+» è sempre premibile, e per i prodotti con varianti aggiunge la riga rotta del primo difetto. Il muro arriva al checkout. Le altre griglie (ProductGrid.tsx:459) il dato lo passano: qui manca alla sorgente.

**Come si ripara:** Nuova migrazione che aggiunge `p.stock` e `p.has_variants` alla RETURNS TABLE e alla SELECT di active_promo_products, e passarli alla ProductCard in PromoDeals.tsx e app/promozioni/page.tsx.

### Sull'ordine confermato i conti non tornano: mancano le righe «Consegna MyCity», sconto e credito

**Dove:** `app/orders/[id]/page.tsx:233 e 595-598; app/api/orders/cod/route.ts:543 e 567; lib/ordini/prezzi.ts:118-130` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Il riepilogo della pagina ordine ha tre righe: Subtotale (somma di quantity × unit_price), Spedizione (shipping_cost) e Totale (total_price). Ma `total_price` nasce da `totalCents` di prezzi.ts, che somma subtotale + spedizione + `deliveryFeeCents` (3 €) e sottrae coupon e sconto ritiro; e sull'ordine sono scritte anche `discount_amount` (cod/route.ts:567) e `wallet_applied_cents`. Nessuna di queste voci ha una riga. Tipico: 20,00 + 4,90 in colonna e 27,90 come Totale — tre euro comparsi dal nulla nella schermata che serve a fidarsi, e in un ordine in contanti è anche la cifra che il cliente conta in mano al rider.

**Come si ripara:** Aggiungere al riepilogo le voci già presenti sulla riga d'ordine: «Consegna MyCity» (delivery_fee_cents), «Sconto codice» (discount_amount), «Credito MyCity» (wallet_applied_cents) — le stesse che mostra OrderSummary al checkout.

### Anche su un ordine già pagato con carta la pagina dice «Paghi X in contanti al rider»

**Dove:** `app/orders/[id]/page.tsx:599-604 (riquadro senza condizione) e 89 (la query legge payment_status ma non lo usa, e non legge il metodo)` · **Area:** Flussi di acquisto · **Corsia:** codice

CONFERMATO. Il riquadro verde «Paghi {totale} in contanti al rider alla consegna» è renderizzato per ogni ordine, senza nessun controllo. `payment_status` compare nella select della riga 89 e nel tipo (riga 48) ma non è usato da nessuna parte nella pagina; il metodo di pagamento non è nemmeno selezionato. Gli ordini con carta esistono e arrivano qui: Stripe rimanda su /orders?stripe=success (api/stripe/checkout/route.ts:466) e da quella lista si apre /orders/{id} (app/orders/page.tsx:295). Chi ha appena pagato legge che dovrà pagare di nuovo in contanti.

**Come si ripara:** Selezionare metodo e stato del pagamento e mostrare il riquadro solo per gli ordini in contanti non ancora pagati; per la carta scrivere «Già pagato con carta · {totale}».

### Nel carrello la spedizione dice «Gratis*» mentre il totale te la fa pagare

**Dove:** `/home/user/mycity/app/cart/page.tsx righe 118, 172-185, 383 (barra per negozio a riga 224)` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO col file davanti. Riga 118: `freeShipping = total >= FREE_SHIPPING_THRESHOLD` (30 €) usa il totale di TUTTO il carrello. Riga 172: `shippingCost` somma `shippingForEuro` chiamata per ogni gruppo-negozio, e `shippingForEuro` azzera solo se il subtotale DEL NEGOZIO ≥ 30. Riga 185: `finalTotal = total + shippingCost + platformDeliveryFee`. Caso reale: 20 € dal fornaio + 15 € dal macellaio → freeShipping=true, multiStore=true → riga 383 stampa «Gratis*», mentre shippingCost = 4,90+4,90 = 9,80 € già dentro il Totale. Il conto a schermo non torna di 9,80 €. Venti pixel sopra, la barra FreeShippingProgress di ogni negozio dice «Ti mancano X alla spedizione gratis» (components/ui/FreeShippingProgress.tsx righe 44-45): due frasi opposte nella stessa schermata. Ho cercato l'asterisco in tutta la pagina: nessuna nota lo spiega.

**Come si ripara:** Calcolare la parola sulla stessa base del numero: `shippingCost > 0` → mostrare l'importo, mai «Gratis»; «Gratis» solo se `shippingCost === 0`. Togliere l'asterisco orfano; se serve la nota, per esteso: «Gratis sopra i 30 € di spesa nello stesso negozio».

### FAQ e pagina Spedizioni promettono il ritiro in negozio col 10% di sconto, ma al checkout l'opzione non c'è

**Dove:** `/home/user/mycity/app/faq/page.tsx riga 43 · /home/user/mycity/app/shipping/page.tsx righe 37-40 e 95-98 · /home/user/mycity/lib/constants.ts riga 39 (RITIRO_IN_NEGOZIO_ATTIVO = false) · /home/user/mycity/components/checkout/PaymentMethodSelector.tsx riga 134` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. FAQ: «Sì, e ottieni il 10% di sconto. Seleziona "Ritiro in negozio" al checkout: ti avviseremo appena l'ordine sarà pronto.» Pagina Spedizioni: riquadro «Ritiro in negozio — 10% di sconto sull'ordine» (righe 37-40) e paragrafo «Scegliendo il ritiro in negozio ottieni il 10% di sconto sull'intero ordine e non paghi spese di spedizione» (righe 95-98). Nel checkout il blocco è dentro `{RITIRO_IN_NEGOZIO_ATTIVO && (` con la costante a false, e i commenti in constants.ts e PaymentMethodSelector spiegano il perché (sconto mai concordato coi negozi, e un ritiro non arriva mai a «consegnato»). Il cliente legge un'istruzione che non può eseguire e uno sconto che non esiste.

**Come si ripara:** Togliere il riquadro e il paragrafo da shipping/page.tsx e la domanda dalla FAQ finché la costante è false. Meglio: far leggere quei tre punti dalla stessa costante, così il testo si spegne insieme alla funzione.

### «Se il negozio è chiuso l'ordine parte alla riapertura»: in realtà il checkout lo rifiuta

**Dove:** `/home/user/mycity/app/shipping/page.tsx riga 52 e /home/user/mycity/app/faq/page.tsx riga 39, contro /home/user/mycity/app/api/orders/cod/route.ts righe 278-284 e /home/user/mycity/app/api/stripe/checkout/route.ts righe 181-187` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Le due pagine pubbliche promettono: «Se il negozio è chiuso, l'ordine parte alla riapertura e te lo diciamo prima che tu paghi». Le due rotte che creano l'ordine fanno l'opposto: entrambe, se `!body.pickupInStore` e `isStoreClosedForOrder(s.store_hours)`, restituiscono `ApiErrors.conflict('<negozio> è chiuso in questo momento. Riprova durante gli orari di apertura indicati sulla pagina del negozio.')`. Nessun ordine viene messo in coda. Verificato anche il secondo pezzo: in app/cart/page.tsx e app/checkout/page.tsx non c'è nessun riferimento a isOpenNow né alla parola «chiuso» né a store_hours — il rifiuto arriva solo dopo che il cliente ha compilato indirizzo e telefono e premuto paga.

**Come si ripara:** ① Riscrivere le due frasi con quello che succede: «Se il negozio è chiuso non puoi ordinare adesso: torna negli orari di apertura». ② Spostare l'avviso a monte: banner sul carrello e sulla scheda prodotto quando il negozio è chiuso.

### La newsletter dice «Iscritto!» ma l'iscrizione non è ancora avvenuta: manca la conferma via email

**Dove:** `/home/user/mycity/messages/it.json righe 161-162 (newsletter.subscribed e subscribedBox; stesse righe in en.json) · /home/user/mycity/components/NewsletterForm.tsx riga 41 · /home/user/mycity/app/api/newsletter/route.ts righe 67-99` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. La rotta inserisce la riga con `active: false` e `confirm_token`, poi manda l'email «Confermi l'iscrizione…» col link e la frase «senza conferma non ti scriveremo»: finché il link non viene cliccato l'indirizzo resta non confermato. Il modulo però fa `setSubscribed(true)` + `toast.success(t('subscribed'))` → «Iscritto! Riceverai la newsletter ogni venerdì.», e il riquadro verde mostra «Sei iscritto. Riceverai presto le ricette di Piacenza nella tua mail.» Nessuna delle due frasi nomina l'email di conferma: chi si iscrive pensa di aver finito e non conferma mai.

**Come si ripara:** Cambiare le due stringhe in it.json e en.json: «Ti abbiamo scritto: apri l'email e clicca il link per confermare l'iscrizione» e «Controlla la posta — l'iscrizione si attiva col link che ti abbiamo mandato». Aggiungere «non trovi l'email? guarda nello spam».

### Gli errori di registrazione e di cambio password escono in inglese

**Dove:** `/home/user/mycity/app/sign-up/page.tsx riga 152 · /home/user/mycity/app/profile/settings/page.tsx righe 150 e 167 · /home/user/mycity/lib/errors.ts righe 30-88 · translateAuthError non esportata in /home/user/mycity/app/sign-in/page.tsx righe 21-36` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO leggendo lib/errors.ts per intero. `translateAuthError` è dichiarata dentro sign-in/page.tsx e non esportata: la usa solo quella pagina. Registrazione, cambio password e cambio email chiamano `friendlyError`, che ha mappe per i codici Postgres (23505, 42501…) e per duplicate key / foreign key / permission / network / rate-limit / jwt, ma nessuna regola per gli errori di Supabase Auth. Il messaggio grezzo supera i filtri finali (lunghezza < 200, nessun a-capo, inizia con lettera) e viene restituito tale e quale: l'errore più comune della registrazione, «User already registered», arriva così al cliente piacentino.

**Come si ripara:** Spostare translateAuthError in lib/errors.ts, esportarla e chiamarla dentro friendlyError per gli errori di supabase.auth. Coprire almeno: user already registered, password should be at least N characters, unable to validate email address, email rate limit exceeded.

### Chi scrive all'assistenza può vedersi rispondere «[object Object]»

**Dove:** `/home/user/mycity/components/SupportChatModal.tsx righe 70 e 77 · /home/user/mycity/app/api/support/conversation/route.ts (ApiErrors alle righe 29, 34, 47, 48, 65, 74) · /home/user/mycity/lib/api/responses.ts riga 14` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Il tipo ApiError in responses.ts è `{ ok:false; error:{ code; message; details? } }`: `error` è un OGGETTO. Il modale fa `throw new Error(j.error ?? j.message ?? 'Impossibile aprire la chat')`: `j.error` è pieno e vince, e la conversione a stringa produce «[object Object]». La riga 77 fa `toast.error(e instanceof Error ? e.message : 'Errore')` senza passare da friendlyError, quindi quella scritta arriva a schermo. Succede sul limite di richieste (riga 29) e su ogni errore interno della rotta (righe 65 e 74). La funzione giusta, `apiErrorMessage`, esiste già in lib/errors.ts con un commento che avverte esattamente di questo caso, e qui non è usata.

**Come si ripara:** Riga 70: `throw new Error(apiErrorMessage(j, 'Impossibile aprire la chat'))`; riga 77: `toast.error(friendlyError(e))`.

### Quando non puoi annullare un ordine, il motivo vero non ti arriva mai

**Dove:** `/home/user/mycity/app/orders/[id]/page.tsx righe 193-194 · /home/user/mycity/app/api/orders/[id]/cancel/route.ts righe 40, 50, 61 · stesso schema in /home/user/mycity/components/seller/ReturnRequestCard.tsx riga 78` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Il server scrive messaggi precisi via ApiErrors: «Il negozio ha già accettato l ordine, non puoi più annullarlo.» (riga 50) e «Ordine già incassato in contanti: scrivi all assistenza per la restituzione.» (riga 61). Il client legge il corpo come `{ error?: string }` e fa `throw new Error(corpo.error || 'Impossibile annullare')`: `corpo.error` è l'oggetto `{code,message}`, truthy, quindi il messaggio diventa «[object Object]». Poi `onError` chiama friendlyError, che scarta quella stringa perché il filtro `/^[a-zA-ZÀ-ſ]/` di lib/errors.ts respinge la parentesi quadra, e restituisce il generico «Qualcosa non ha funzionato. Riprova fra un momento.» Il cliente riprova all'infinito una cosa che non funzionerà mai, e chi ha pagato in contanti non viene mai indirizzato all'assistenza. ReturnRequestCard riga 78 ha lo stesso `j.error ?? j.message`.

**Come si ripara:** Riga 194: `throw new Error(apiErrorMessage(corpo, 'Impossibile annullare'))` importando apiErrorMessage da @/lib/errors. Stesso fix in components/seller/ReturnRequestCard.tsx riga 78.

### Il campo «Password attuale» viene chiesto ma non viene mai controllato

**Dove:** `/home/user/mycity/app/profile/settings/page.tsx righe 396-401 (il campo), riga 147 (l'invio), riga 419 (il disabled); `currentPassword` compare solo alle righe 61 e 398` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO con grep: `currentPassword` compare in tutto il file solo due volte — la dichiarazione dello stato (riga 61) e il binding del campo (riga 398). `handleChangePassword` controlla lunghezza e coincidenza della nuova password, poi chiama `supabase.auth.updateUser({ password: newPassword })` e basta: il valore della password attuale non viene mai letto. Il pulsante è `disabled={!newPassword || !confirmPassword}`, quindi il campo si può lasciare vuoto e la password cambia lo stesso. È un'etichetta che promette un controllo inesistente su una schermata di sicurezza dell'account.

**Come si ripara:** O si toglie il campo, o si fa quello che dice: prima di updateUser verificare con `signInWithPassword({ email, password: currentPassword })` e, se fallisce, «Password attuale non corretta». Va reso obbligatorio anche nel disabled del pulsante.

### Il SOS del fattorino dice «Stiamo chiamando il 112», ma l'app apre solo il tastierino

**Dove:** `/home/user/mycity/components/rider/SOSButton.tsx righe 71-79, contro il dialogo di conferma a riga 135` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. L'azione vera è `window.location.href = 'tel:112'` (riga 71): apre il compositore del telefono col numero scritto, la chiamata parte solo se il fattorino preme il tasto verde. Subito dopo, riga 76: `toast.success('SOS inviato. Stiamo chiamando il 112 e abbiamo allertato MyCity.')` — al presente, come se la chiamata fosse in corso. Il ramo di ripiego (riga 79) dice «Chiamata al 112 in corso. Se non parte, chiama subito il 112 dal telefono.», stesso difetto. Venti righe più in basso il dialogo di conferma è scritto giusto: «Verrà avviata la chiamata al 112». Il fattorino può restare ad aspettare una chiamata che nessuno ha fatto partire, nel momento peggiore.

**Come si ripara:** «SOS registrato, MyCity è stata avvisata. Ora premi CHIAMA sul telefono per parlare col 112». Stessa correzione al ramo di ripiego a riga 79.

### Il carrello dice «Niente intermediari, niente commissioni nascoste» venti righe sotto la riga «Consegna MyCity»

**Dove:** `/home/user/mycity/app/cart/page.tsx riga 440, contro le righe 389-398 dello stesso riquadro · commissione dichiarata in /home/user/mycity/app/seller/layout.tsx riga 56 e /home/user/mycity/components/SellerApplicationForm.tsx riga 220` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Riquadro «Lo sapevi?»: «Acquistando qui sostieni direttamente i commercianti della tua città. Niente intermediari, niente commissioni nascoste.» Nello stesso riepilogo, poche righe sopra, la voce «Consegna MyCity» con `platformDeliveryFee` = 3 € per negozio. E nella parte venditori il sito scrive «Abbonamento €50/mese e commissione del 10% sulle vendite» (seller/layout.tsx riga 56, SellerApplicationForm riga 220). MyCity È l'intermediario e trattiene una commissione: la contraddizione si vede senza uscire dalla schermata, nel punto in cui la fiducia decide se si paga.

**Come si ripara:** «Ogni euro di questo carrello va ai commercianti di Piacenza. La nostra parte è solo la consegna, ed è scritta qui sopra: nessun costo a sorpresa.» Toglie la bugia e tiene la promessa.

### La home mostra un negozio inventato — «Salumeria del Borgo, Via Calzolai» — senza dire che è un esempio

**Dove:** `/home/user/mycity/components/home/HeroStoreCard.tsx righe 191-258 (HeroStorePlaceholder), innesco a riga 72 (`if (!data?.store) return <HeroStorePlaceholder />`)` · **Area:** Testi dell interfaccia · **Corsia:** codice

CONFERMATO. Quando la RPC `vetrina_home` va in errore o non torna un negozio, la funzione ritorna null e l'hero mostra HeroStorePlaceholder: nome «Salumeria del Borgo», indirizzo «Via Calzolai», pill verde lampeggiante «Aperto ora», bollini «Negozio locale» e «Consegna oggi», sei prodotti con prezzi inventati (Coppa DOP €9,50, Prosciutto crudo €15,00, Bresaola €18,00…), riga «Consegna stimata — oggi, entro 18:00» e il bollino «100% locale». In tutta la scheda non c'è una parola che dica «esempio». È la prima cosa che si vede aprendo il sito (visibile da md in su) e con pochi negozi a catalogo il ripiego scatta spesso.

**Come si ripara:** Scritta inequivocabile dentro la scheda — «Esempio di vetrina» al posto del bollino «100% locale» — e via «Aperto ora» e «Consegna stimata oggi». Meglio ancora: quando non c'è nessun negozio mostrare un invito vero («Stiamo aprendo le prime vetrine di Piacenza — sei un negoziante?»).

### Sulla scheda prodotto «Segnala questo contenuto» e il riquadro «Venduto da» stanno sopra il nome e il prezzo

**Dove:** `app/product/[id]/page.tsx:635 (colonna INFO) → SellerCard :639 → Segnala :651 → VendutoDa :655 → <h1> :662; components/products/VendutoDa.tsx:56 (<h2> «Venduto da»)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO col file davanti. Nella colonna informazioni l'ordine dei figli è esattamente: SellerCard (639), link Segnala (651), riquadro VendutoDa (655), e solo alla riga 662 l'<h1> col nome prodotto. Su telefono la griglia è a una colonna (grid-cols-1 alla riga 485), quindi dopo la foto si legge prima l'invito a segnalare e la partita IVA, poi cosa si sta comprando. Confermata anche la gerarchia dei titoli invertita: VendutoDa apre con un <h2> (riga 56 del suo file) renderizzato prima dell'<h1> della pagina.

**Come si ripara:** Spostare <h1> + prezzo come primo blocco della colonna informazioni; SellerCard subito sotto il titolo; VendutoDa e Segnala in fondo alla colonna, dopo descrizione e caratteristiche.

### Tra 768 e 1023 px la scheda d'acquisto finisce sotto la galleria e non c'è nessuna barra fissa

**Dove:** `app/product/[id]/page.tsx:485 (grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_320px]) con i 3 figli a :487, :635, :851 (lg:sticky) · components/StickyAddToCart.tsx:53 (md:hidden)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. La griglia alla riga 485 ha esattamente tre figli diretti: galleria (487), informazioni (635), scheda acquisto (851). A md la griglia è a 2 colonne, quindi il terzo figlio va a capo in riga 2 sotto la galleria, cioè dopo tutta la colonna informazioni. La scheda diventa appiccicosa solo da lg (riga 851: lg:sticky lg:top-[var(--header-height)]) e la barra d'acquisto mobile è md:hidden (StickyAddToCart riga 53): nella fascia 768-1023 px non c'è né la scheda in vista né la barra fissa.

**Come si ripara:** Portare la scheda acquisto a colonna dedicata già da md (md:grid-cols-[1fr_320px] con galleria e informazioni impilate), oppure alzare la soglia di StickyAddToCart da md:hidden a lg:hidden.

### Nel carrello «Procedi al checkout» arriva dopo gli articoli, l'upsell e «Continua lo shopping»

**Dove:** `app/cart/page.tsx:194 (grid-cols-1 lg:grid-cols-3), :347 CartUpsell, :353 «← Continua lo shopping», :358 (lg:sticky riepilogo), :418 «Procedi al checkout»; grep di 'fixed' su tutto il file: zero occorrenze` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. La griglia è impilata fino a lg (riga 194), la colonna sinistra contiene articoli → CartUpsell (347) → «Continua lo shopping» (353), e solo dopo arriva la colonna riepilogo (358) col pulsante alla riga 418. Sotto i 1024 px l'utente incontra quindi due inviti a NON concludere prima del pulsante d'ordine. Verificato anche il confronto: app/cart/page.tsx non contiene nessun elemento 'fixed', mentre app/checkout/page.tsx:1072 ha la barra 'lg:hidden fixed inset-x-0 bottom-0' e la scheda prodotto ha StickyAddToCart. Il carrello è l'unica delle tre pagine del funnel senza barra fissa.

**Come si ripara:** Aggiungere al carrello la stessa barra fissa del checkout (totale + «Procedi al checkout», lg:hidden, con lo stesso calcolo di bottom su tabbar e banner cookie) e spostare «Continua lo shopping» sotto il riepilogo.

### Il banner «Installa MyCity» copre la barra «Aggiungi al carrello» sul telefono

**Dove:** `components/PWAInstallBanner.tsx:92 (fixed bottom-20 … z-30) · components/StickyAddToCart.tsx:53-57 (z-30, bottom = safe-area + var(--tabbar-height) + banner cookie) · app/globals.css:116 (--tabbar-height: 72px) · tailwind.config.ts:129 ('banner': '35' con commento «PWAInstallBanner») · app/layout.tsx:127 <main> e :134 <PWAInstallBanner />` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO su tutti e quattro i file. La barra d'acquisto parte da 72 px dal fondo (--tabbar-height dichiarato a 72px in globals.css riga 116) con z-30; il banner parte da bottom-20 (80 px) con z-30 ed è alto circa 120 px: le due fasce si sovrappongono proprio dove sta il pulsante d'acquisto. A parità di z-index vince chi viene dopo nel documento, e in app/layout.tsx il banner (riga 134) è dopo <main> (riga 127). Confermato anche il dettaglio della scala: tailwind.config.ts riga 129 dichiara 'banner': '35' citando esplicitamente PWAInstallBanner, ma il componente usa il valore grezzo z-30, lo stesso della barra.

**Come si ripara:** Ancorare il banner sopra le barre fisse come già fa StickyAddToCart (bottom = calc(env(safe-area-inset-bottom) + var(--tabbar-height) + altezza barra acquisto)), oppure non mostrarlo su /product, /cart e /checkout.

### La tendina dell'indirizzo di consegna esce dallo schermo sul telefono

**Dove:** `components/LocationPill.tsx:105 (absolute left-0 top-full mt-2 w-72) · components/Navbar.tsx:176-178 (<div className="min-w-0 flex-1 flex justify-center"><LocationPill compact /></div>)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO. Il pannello è 'absolute left-0 top-full mt-2 w-72' (riga 105): larghezza fissa 288 px ancorata al bordo sinistro della pillola. In Navbar la pillola mobile è dentro un contenitore centrato fra logo e carrello (righe 176-178), quindi su uno schermo da 360 px il pannello parte da circa metà larghezza e sfora il bordo destro. Dentro ci sono il campo CAP e il pulsante Salva a larghezza piena, quindi tagliati. Nessun overflow-x nascosto sugli antenati (grep su globals.css: nessuna regola).

**Come si ripara:** Su mobile ancorare il pannello a destra o centrarlo rispetto alla finestra, e limitarne la larghezza a min(288px, calc(100vw - 24px)).

### Sulla barra categorie mobile si vede solo la prima voce e niente dice che la riga scorre

**Dove:** `components/CategoryBar.tsx:90 (flex items-center gap-1 overflow-x-auto scrollbar-hide) e :21-29 (sette DESTINATIONS) · components/Navbar.tsx:86 e :213-216 (barra mostrata su tutti i formati)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO, con una correzione di riga: la riga scorrevole è alla riga 90, non 101. Contiene il pulsante «Tutte le categorie» più sette destinazioni (Tutti i negozi, Promozioni, Novità, Regali, Vicino a te, Più venduti, Piccoli prezzi, righe 21-29), tutte con shrink-0 e whitespace-nowrap. La classe scrollbar-hide toglie la barra di scorrimento e nel file non esiste nessuna affordance sostitutiva: grep di 'gradient', 'fade', 'ChevronLeft/Right' sul componente non trova nulla. La barra è renderizzata su tutti i formati (Navbar riga 214, nessun hidden md:block).

**Come si ripara:** Aggiungere l'affordance: sfumatura sui bordi quando c'è altro da scorrere, o lasciare visibile una barra sottile, o mandare a capo le voci in due righe compatte sotto sm.

### La chat di assistenza esiste ma il cliente non ha nessun modo per aprirla

**Dove:** `components/MobileTabBar.tsx:95-102 (schede del compratore) e :245 (SupportChatModal con supportOpen) · components/SupportChatButton.tsx:27-36 (hidden se isBuyer) · lib/account-menu.ts:82-85 (solo Impostazioni e FAQ)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO, ed è peggio di come descritto. Il flag isSupport compare nel tipo Tab (riga 17) e nel render (righe 176, 191, 194), ma NESSUN array di schede lo imposta — né quello del compratore autenticato (95-102: Home, Cerca, Carrello, Ordini, Io), né quello dell'ospite (104-111), né quelli di venditore/rider. Quindi setSupportOpen (unica chiamata alla riga 194) non viene mai eseguito e il SupportChatModal della riga 245 non si apre mai. In parallelo SupportChatButton è nascosto esplicitamente ai compratori (riga 31: isBuyer nella condizione hidden) e il menu account offre solo FAQ (account-menu.ts riga 84). Risultato: canale di assistenza caricato nel pacchetto e irraggiungibile.

**Come si ripara:** Decidere una porta sola e aprirla: rimettere la scheda «Assistenza» fra quelle del compratore, o togliere isBuyer dalla condizione di SupportChatButton, o aggiungere la voce nel menu account. Se la chat non deve esistere per i clienti, rimuovere il modale morto dalla barra.

### Nel piè di pagina l'icona WhatsApp porta a un numero segnaposto

**Dove:** `components/Footer.tsx:74 (href 'https://wa.me/393000000000' scritto a mano) · Footer.tsx:164 (stesso canale via NEXT_PUBLIC_WHATSAPP_NUMBER) · .env.example:127 (variabile presente ma vuota)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** codice

CONFERMATO, con una correzione al ragionamento del collega. Alla riga 74 il link WhatsApp della fila social è scritto a mano con 393000000000, un numero finto: chi tocca l'icona verde apre WhatsApp su un contatto inesistente, e la fila social sta su ogni pagina. Il secondo punto va corretto: il link della colonna Aiuto non è alla riga 196 ma alla 164, e NON è «costruito correttamente» — ha come fallback lo stesso segnaposto (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '393000000000'), e in .env.example:127 la variabile è dichiarata vuota. Quindi finché la variabile non è configurata sono rotti entrambi i punti di contatto, non uno solo.

**Come si ripara:** Usare la variabile d'ambiente in tutti e due i punti e non mostrare né l'icona né la voce quando la variabile non è configurata, come già si fa per i dati legali del titolare (Footer, blocco dati legali).

### Sulla home il primo prodotto acquistabile arriva dopo tre sezioni intere

**Dove:** `lib/home-site.ts:238-241 (DEFAULT_ORDER) · components/home-sections/ReorderRail.tsx:61 (ospite → self-hide) · components/home-sections/HomeSectionRenderer.tsx:88-165 (hero), :174-188 (categorie), :192-197 (dropOfDay)` · **Area:** Navigazione e gerarchia visiva · **Corsia:** config

CONFERMATO nella struttura. DEFAULT_ORDER (lib/home-site.ts righe 238-241) è: hero, reorder, howItWorks, categories, dropOfDay, popularProducts, … Per un visitatore nuovo la sezione reorder si auto-nasconde davvero (ReorderRail.tsx riga 61: 'if (!user) return null; // ospite → self-hide'), quindi l'ordine reale è hero → come funziona → categorie → primo prodotto. Sono tre sezioni piene prima di qualsiasi articolo con foto e prezzo, su una home di marketplace. Nota onesta: i pixel citati dal collega (~1000 px di hero, ~2000 px al primo prodotto) sono stime che NON ho misurato in un browser — ho confermato solo l'ordine delle sezioni e il contenuto dell'hero (occhiello, titolo, sottotitolo, due pulsanti, chip categorie, banner orario, tre rassicurazioni, card negozio: righe 88-165).

**Come si ripara:** Dal Home builder (/admin/home) spostare «Prodotti popolari» subito dopo l'hero e portare «Come funziona» sotto i prodotti: è un riordino salvato in site_settings.home_site, non richiede una nuova pubblicazione del sito.

### Sentry finisce nel pacchetto di tutte e 245 le pagine anche senza DSN configurato

**Dove:** `instrumentation-client.ts:13 e :20 — chunk .next/static/chunks/8359-fc97602f615bd966.js, presente in 245/245 voci di .next/app-build-manifest.json (incluso /layout)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato col file davanti. La riga 13 è `import * as Sentry from '@sentry/nextjs'` (import statico) e la riga 20 riesporta `Sentry.captureRouterTransitionStart`: entrambe finiscono nel pacchetto a prescindere dalla condizione `if (SENTRY_DSN)` di riga 16. Il commento del file («senza il DSN configurato questo file non fa niente e non costa niente») è smentito dal build presente nella cartella: nel repo non esiste nessun .env con il DSN (c'è solo .env.example), eppure il chunk 8359 contiene codice dell'SDK browser di Sentry (stringhe `browserTracingIntegration`, `sentry-trace`, `sentry.sdk.version`) ed è elencato in tutte e 245 le voci del manifest, /layout compreso — quindi lo scarica anche chi apre solo la home o il checkout. CORREZIONE al collega: il chunk pesa 426 KB non compressi e 137.904 byte compressi (134 KB), ma è un chunk CONDIVISO — contiene anche moduli interni di Next (il primo modulo è `createRenderParamsFromClient`) — quindi quei 134 KB non sono tutti Sentry: la parte di Sentry è consistente ma non l'ho isolata. Resta vero e verificato il difetto: codice inerte spedito a ogni pagina.

**Come si ripara:** Togliere l'import statico e accendere Sentry solo col DSN presente, via import dinamico: `if (SENTRY_DSN) { import('@sentry/nextjs').then((S) => S.init(opzioniSentry())); }`. Per `onRouterTransitionStart` esportare una funzione che inoltra al modulo caricato a runtime invece di riesportare il simbolo. NON seguire il consiglio di «escludere l'integrazione Replay»: nel chunk `replayIntegration` non compare (Sentry la carica a parte), quindi non è lì che sta il peso. Misurare il prima/dopo con `ANALYZE=true npm run build` sul chunk condiviso del layout.

### La foto grande della scheda prodotto viene scaricata due volte: il preload chiede 800 pixel, una misura che Next non chiederà mai

**Dove:** `app/product/[id]/layout.tsx:138-147 (preload) contro app/product/[id]/page.tsx:500-508 (immagine con `loader`) e lib/image-loader.ts:47-63, lib/image-url.ts:18` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. Il guscio server calcola `sizedImage(product.images[0], 'detail')` e lo mette in `<link rel="preload" as="image" … fetchPriority="high">`; `detail` vale 800 (SIZE_PX in lib/image-url.ts), quindi l'URL preloadato porta `width=800` (o `w=800&h=800` su Pexels). Nella pagina la stessa immagine ha `loader={caricatoreFotoRemote}` e un attributo `sizes`, e il caricatore riscrive `width`/`w`/`height`/`h` con la larghezza che sceglie Next (image-loader.ts:57-61). In next.config.js non c'è nessun `images.deviceSizes`, quindi valgono i valori predefiniti (640, 750, 828, 1080, 1200, 1920, 2048, 3840 più gli imageSizes): 800 non è in quella lista e non verrà mai richiesto. Il telefono scarica il file da 800 pixel del preload E poi il candidato del srcSet (750 o 828): due foto di prodotto invece di una, proprio nel momento che decide se la pagina sembra veloce. Il commento a layout.tsx:135 («l'indirizzo è lo STESSO che chiederà la pagina») non è più vero da quando esiste il caricatore.

**Come si ripara:** Far combaciare le due richieste, una strada sola: (a) nel preload usare la stessa larghezza che Next chiederà e aggiungere `imageSrcSet`/`imageSizes` identici a quelli dell'immagine; oppure (b) fissare in next.config.js `images.deviceSizes` includendo 800. Poi un controllo automatico Playwright sulla scheda prodotto che fallisca se partono due richieste immagine per la stessa foto.

### Scheda prodotto, negozio e checkout sono pagine client: l'HTML che parte è vuoto, i dati arrivano dopo il JavaScript

**Dove:** `app/product/[id]/page.tsx:1 e :128, app/store/[id]/page.tsx:1 e :35-41, app/checkout/page.tsx:1 e :69` · **Area:** Velocita percepita · **Corsia:** codice

Confermato riga per riga. Tutte e tre le pagine aprono con `'use client'` e prendono i dati con `useQuery` dal browser (`supabase.from('products')…` a page.tsx:128, la query del negozio in store/[id]/page.tsx, `queryKeys.checkout.groups` a checkout/page.tsx:69). Ho cercato `HydrationBoundary`, `prefetchQuery` e `dehydrate` in tutto `app/` e `components/`: zero risultati, quindi nessun prefetch server con idratazione da nessuna parte. Durante il rendering server `isLoading` è vero e l'HTML contiene solo lo scheletro: nome, prezzo, disponibilità e foto non ci sono. La catena diventa HTML → JavaScript → idratazione → Supabase → disegno → solo ORA parte la foto. Il `priority` su page.tsx:504 non produce nessun preload nel documento — è esattamente la ragione per cui il preload è stato scritto a mano nel guscio (lo dice il commento a layout.tsx:120-131).

**Come si ripara:** Prefetch sul server con idratazione: nel `layout.tsx` della rotta (che già interroga il prodotto per lo schema) fare `queryClient.prefetchQuery` con la stessa `queryKey` della pagina e avvolgere in `<HydrationBoundary state={dehydrate(queryClient)}>`. La pagina resta client ma nasce coi dati dentro, e il preload torna a essere quello automatico di Next. Cominciare dalla scheda prodotto e misurare LCP prima/dopo con Lighthouse in throttling.

### Lo scheletro della griglia non ha la forma delle schede vere: al caricamento la pagina salta

**Dove:** `components/SkeletonCard.tsx:3 (`w-full h-48`) e :17 (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`) contro components/ProductCard.tsx:153 (`aspect-square w-full`), components/ProductGrid.tsx:496-499 (colonne vere) e :386-391 vs :477-481 (rail)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato, tre disallineamenti misurabili. ① Altezza foto: lo scheletro fissa `h-48` (192 px sempre), la scheda vera usa `aspect-square` (altezza = larghezza). Su un telefono da 360 px a due colonne la scheda è larga ~156 px, quindi la foto vera è alta ~156 e non 192: ogni riga si accorcia di ~36 px quando i prodotti arrivano. ② Rail: lo stato di caricamento (ProductGrid.tsx:386-391) mette SkeletonCard dentro un contenitore `w-40 sm:w-44`, e il rail vero (righe 477-481) usa lo stesso `w-40 sm:w-44` con ProductCard aspect-square: 160 px di foto vera contro 192 di scheletro, 32 px di salto. ③ Colonne: `SkeletonGrid` si ferma a `md:grid-cols-4`, mentre `gridCols` in ProductGrid.tsx:496-499 arriva a `lg:grid-cols-5 xl:grid-cols-6`: su desktop lo scheletro mostra 4 colonne larghe e i prodotti ne mostrano 6 strette, e la pagina si ridisegna tutta. È CLS, quello che Google misura e che fa cadere il dito sul bottone sbagliato.

**Come si ripara:** Far riusare allo scheletro le stesse classi della scheda vera: sostituire `w-full h-48` con `aspect-square w-full`, e in `SkeletonGrid` usare la stessa stringa di colonne di `gridCols`, estratta in una costante condivisa in un file solo così non possono più divergere. Aggiungere un test che confronti l'altezza della griglia in caricamento e a caricamento finito e fallisca oltre pochi pixel di differenza.

### Le miniature del carrello, dell'upsell e dei caroselli sono a 100 pixel dentro riquadri da 128-160: escono sfocate

**Dove:** `app/cart/page.tsx:229-237 (riquadro 96px), components/cart/CartUpsell.tsx:99-107 (w-36 = 144px), components/RecentlyViewed.tsx:78-87 (w-36/w-40, aspect-square), components/SponsoredCarousel.tsx:146-147 (w-32/w-36, aspect-square); marginali: components/checkout/CartGroupsList.tsx:32-40 (40px) e components/products/SellerCard.tsx:142-149 (48px)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato in tutti e sei i punti: ognuno scrive `sizedImage(img, 'thumb')` insieme a `unoptimized`. `thumb` vale 100 px (lib/image-url.ts:16) e `unoptimized` azzera sia `srcSet` sia `sizes` — è lo stesso difetto già documentato e corretto altrove, sta scritto nel commento di lib/image-loader.ts:14-22 — quindi gli attributi `sizes="144px"`/`sizes="160px"` accanto a queste immagini non fanno più niente. Nell'upsell del carrello il riquadro è largo 144 px e la sorgente resta 100: sfocata già a 1×. In RecentlyViewed il riquadro è 144-160 px quadrato, nel carosello sponsorizzato 128-144: idem. Nel carrello il riquadro è 96 px, quindi su un telefono a 3× servirebbero 288 px e ne arrivano 100. CORREZIONE al collega: i due casi da 40 px (CartGroupsList) e 48 px (SellerCard) sono marginali — a 1× e 2× i 100 px bastano, mancano solo a 3× — vanno sistemati con gli altri ma non sono il problema visibile. Sono le foto che il cliente guarda mentre decide se confermare l'ordine.

**Come si ripara:** Ovunque ci sia `unoptimized` su una foto di prodotto o logo negozio: toglierlo e mettere `loader={caricatoreFotoRemote}` (import da '@/lib/image-loader'), lasciando `sizes` con la misura reale del riquadro — così il caricatore torna a chiedere a Supabase la larghezza giusta e `sizes` ricomincia a funzionare. Poi una regola di lint (o un test grep sul repo) che vieti `unoptimized` insieme a `sizedImage`: è la combinazione che si contraddice.

### Sulla scheda prodotto partono subito dieci richieste, quattro delle quali servono solo a fondo pagina

**Dove:** `app/product/[id]/page.tsx:128, :166, :186 (3 query) più SimilarProducts.tsx:36, RecentlyViewed.tsx:39, ProductQA.tsx:59, products/FrequentlyBoughtTogether.tsx:48, products/SellerCard.tsx:57, products/VendutoDa.tsx:20, ActivePromoBadge.tsx:29` · **Area:** Velocita percepita · **Corsia:** codice

Confermato contando le `useQuery` nei file. Dalla pagina partono in blocco dieci interrogazioni a Supabase (tre nella pagina: prodotto, varianti, recensioni; sette dai componenti), più quelle del guscio. Le quattro più grosse — «prodotti simili», «visti di recente», «domande e risposte», «spesso comprati insieme» — riguardano sezioni che stanno sotto la piega, e nessuna è condizionata alla visibilità: le uniche `enabled` che ho trovato sono `!!productId`, `!!userId`, `!!sellerId`, cioè l'esistenza dell'id. In tutto il progetto `IntersectionObserver` compare in un file solo (components/SponsoredCarousel.tsx). Su rete mobile queste richieste occupano le connessioni nello stesso istante in cui devono arrivare prezzo e foto grande. CORREZIONE al collega: le richieste sono dieci, non undici, e AddToListButton NON va nell'elenco — le sue due query hanno già `enabled: open` (righe 33 e 48), cioè partono solo all'apertura del menu.

**Come si ripara:** Rimandare le sezioni sotto la piega: avvolgere SimilarProducts, RecentlyViewed, ProductQA e FrequentlyBoughtTogether in un componente che monta il figlio solo quando entra nel viewport (IntersectionObserver con `rootMargin: '200px'`), oppure passare `enabled: visibile` alle loro `useQuery`. Regola da scrivere una volta e riusare: sopra la piega si carica subito, sotto la piega quando ci si arriva. Misurare con Lighthouse in throttling 4G il tempo fino al prezzo visibile, prima e dopo.

### Le tessere delle categorie in home compaiono dal nulla: nessuno stato di caricamento, la pagina si allunga di colpo

**Dove:** `components/CategoryShowcase.tsx:75 (`const { data: categories = [] } = useQuery`) e :95-96, richiamato da components/home-sections/HomeSectionRenderer.tsx:174-188` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. Il componente destruttura `data: categories = []` e non legge mai `isLoading`: non esiste nessun ramo di caricamento. Finché la richiesta non torna, la `div` con `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6` esiste ma è vuota, quindi altezza zero; poi arrivano sei tessere `aspect-[4/3]` tutte insieme e la sezione si apre. Il titolo «Cosa cerchi oggi?» e il sottotitolo sono scritti nel renderer (HomeSectionRenderer.tsx:178-185), che non è un componente client: arrivano nell'HTML dal server. Quindi il cliente legge una domanda sopra il vuoto e tutto ciò che sta sotto scende. È la sezione subito dopo l'hero, cioè nella parte alta della home. Nello stesso repo StoreShowcase.tsx:69-83 fa già la cosa giusta.

**Come si ripara:** Aggiungere il ramo `isLoading` come in StoreShowcase.tsx:69-83: sei riquadri `aspect-[4/3]` con la classe `.skeleton` di globals.css, nella stessa griglia `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`, così lo spazio è occupato prima. Ancora meglio: le categorie cambiano di rado, leggerle nel componente server della home e passarle come props, togliendo del tutto la richiesta dal browser.

### Pagina negozio: prima uno scheletro a schede, poi un cerchietto che gira, poi il negozio — tre impaginazioni in fila

**Dove:** `app/store/[id]/loading.tsx:4-10 contro app/store/[id]/page.tsx:35-41 (`<LoadingState />`, variante predefinita 'spinner') e components/store-sections/HeroSection.tsx:89 (`h-60`)` · **Area:** Velocita percepita · **Corsia:** codice

Confermato aprendo i tre file. ① `loading.tsx` disegna una banda `h-48` (192 px) più una griglia di otto quadrati `aspect-square`. ② Appena il componente client monta, `data.isLoading` è vero e la pagina diventa `container … py-16` con dentro `<LoadingState />` senza prop: il default di `variant` è `'spinner'` (components/ui/LoadingState.tsx:29 e :44-49), cioè una `div` `py-12 text-center` con un cerchietto e la scritta di attesa — la pagina si accorcia da schermo pieno a poche righe. ③ Poi arriva il negozio vero, la cui copertina è `h-60` (240 px), non 192. Tre impaginazioni in sequenza sono peggio di una lenta: comunicano che il sito non sa cosa sta facendo.

**Come si ripara:** Uno stato di caricamento solo, e che assomigli alla pagina finita. Alla riga 36 di page.tsx sostituire `<LoadingState />` con lo stesso scheletro di `loading.tsx`, e in `loading.tsx` portare la banda da `h-48` a `h-60` per combaciare con l'hero vero. Col prefetch server del negozio (vedi la voce sulle pagine client) lo stato ② sparisce del tutto.

### Nel checkout, mentre arrivano i gruppi del carrello, la pagina diventa un cerchietto in mezzo al bianco

**Dove:** `app/checkout/page.tsx:818-820 (`if (loadingGroups) return <LoadingState />;`) con components/ui/LoadingState.tsx:29 e :43-49` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. `LoadingState` senza prop usa `variant = 'spinner'` (valore di default nella firma, riga 29): una `div` `py-12 text-center` con `Loader2` e la scritta di attesa. Nel checkout quel `return` sostituisce l'INTERA pagina — titolo, indicatore dei passi, riepilogo, bottone di pagamento — con poche righe al centro: la pagina collassa e poi si riapre, e chi sta pagando vede il contenuto sparire nel punto in cui è più teso. È anche l'unica pagina del percorso d'acquisto senza scheletro, mentre home, ricerca, prodotto e negozio ne hanno uno.

**Come si ripara:** Sostituire con uno scheletro che ricalchi la struttura vera: barra dei passi (è statica, si può disegnare subito), due o tre blocchi `.skeleton` per indirizzo/consegna/pagamento e il riquadro riepilogo a destra. In più `StepIndicator` e il titolo non dipendono dai dati, quindi possono restare a schermo sempre: solo la parte centrale mostra lo scheletro.

### Il cuore dei preferiti non si riempie subito: tre giri di rete prima che l'utente veda un effetto

**Dove:** `components/hooks/useFavorites.ts:28-40, usato da components/ProductCard.tsx:64, :68 e :96-108` · **Area:** Velocita percepita · **Corsia:** codice

Confermato. La `mutationFn` (riga 30) fa `await supabase.auth.getUser()`, che è una chiamata di rete, poi l'insert o la delete (seconda chiamata), e solo `onSuccess` (riga 40) invalida la cache — che scatena la terza richiesta per rileggere l'elenco. Non c'è nessun `onMutate`, cioè nessun aggiornamento ottimistico: `isFav` (ProductCard.tsx:68) legge il Set della cache, quindi il cuore resta grigio per tutto il giro. L'unica cosa immediata è l'animazione `heartBeat` (righe 99-101), che pulsa su un cuore che non è cambiato. Su rete lenta il cliente tocca due o tre volte convinto di aver sbagliato mira. Effetto collaterale: l'invalidazione fa ridisegnare insieme tutte le schede della griglia (fino a 96 per pagina, ProductGrid.tsx:132 e :189). Nota: la query di lettura (riga 17) usa già `idUtenteInMemoria()`, che non chiama la rete — la `getUser()` nel percorso critico della scrittura è un'incoerenza interna al file.

**Come si ripara:** Aggiornamento ottimistico standard di React Query: `onMutate` che annulla le richieste in volo, salva il Set precedente e lo aggiorna subito, `onError` che rimette indietro, `onSettled` che invalida. E togliere `supabase.auth.getUser()` dal percorso critico usando `idUtenteInMemoria()`, già importato alla riga 7 dello stesso file.
