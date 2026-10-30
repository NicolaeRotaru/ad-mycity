# Analisi «esperienza del cliente» del marketplace MyCity contro i migliori (29/10/2026)

## La domanda di Nicola (parole sue)
«Guarda all'aspetto e l'estetica del marketplace e dimmi se hai tutti i requisiti per essere efficace come
marketplace. Per il cliente è importante ciò che vede, siccome il resto non lo può vedere (quindi per adesso
tralasciamo le performance). Voglio che abbiamo delle performance a livello di Amazon, eBay, Deliveroo, Glovo.
Che il cliente riesca a muoversi veloce per il marketplace, è tutto intuitivo, è attraente, fa venire voglia
di comprare.»

Tradotto in domanda d'analisi: **dal punto di vista del cittadino che apre il sito, MyCity ha tutti i
requisiti che hanno i migliori marketplace del mondo per (1) capire subito, (2) muoversi veloce,
(3) fidarsi, (4) avere voglia di comprare, (5) comprare senza fatica, (6) tornare?** Per ogni requisito:
c'è, c'è ma sotto livello, manca, o c'è ma fa danno.

FUORI PERIMETRO: la velocità tecnica (tempi di caricamento, peso pagine, server). DENTRO il perimetro:
tutto ciò che fa SEMBRARE veloce e facile l'uso (numero di tocchi, scheletri di caricamento, aggiunta al
carrello senza cambiare pagina, ricerca istantanea).

## Dove guardare
- **Codice del sito** (sola lettura, ramo main aggiornato al 29/10, nessuna PR aperta): `/home/user/mycity`
  (Next.js 15 app router: `app/`, `components/`, `components/home-sections/`, `components/store-sections/`,
  `tailwind.config.ts`, `app/globals.css`, `messages/`). ⛔ NON modificare nulla.
- **Il sito vero in produzione** (https://mycity-phi.vercel.app), letto il 29/10 alle 20:15 attraverso Vercel
  (la rete di questa sessione blocca il dominio: niente curl, niente WebFetch sul sito):
  - testo visibile di 11 pagine: `/tmp/claude-0/-home-user/da22efc2-e453-56b3-a33c-883c7eac400f/scratchpad/prod/*.txt`
    (home, negozio-pane-quotidiano, prodotto-kefir, ricerca-kefir, negozi, categoria-alimentari,
    categoria-elettronica, categorie, piu-venduti, carrello, checkout). Gli HTML interi sono accanto (`*.html`).
  - **FOTOGRAFIE delle stesse 11 pagine**: `/tmp/claude-0/-home-user/da22efc2-e453-56b3-a33c-883c7eac400f/scratchpad/screens/`
    nomi `<pagina>--mobile.png` (telefono 390×844, solo la prima schermata, alta definizione),
    `<pagina>--mobile-intera.png` (pagina intera), `<pagina>--desktop.png` (1440×900 prima schermata),
    `<pagina>--desktop-intera.png`. Aprile con lo strumento Read: sono immagini.
  - ⚠️ LIMITI DELLE FOTO (dichiarali se li usi): ① le foto dei prodotti non si scaricano da qui, al loro posto
    c'è un riquadro grigio «FOTO (non caricabile da qui)»; ② il JavaScript dell'app è spento: si vede la pagina
    come la manda il server; le parti che il browser carica dopo (es. «Prodotti che vanno forte» in home,
    il pulsante «aggiungi» che resta attaccato in basso quando scorri, il conteggio del carrello) compaiono
    come riquadri di caricamento o non compaiono. Per sapere cosa c'è DAVVERO dopo il caricamento, guarda il codice.
    ③ I font sono quelli veri (Inter e Fraunces), presi dal pacchetto pubblico.

## Il catalogo vero (letto dal database il 29/10/2026 alle 20:13, sola lettura)
- **9 prodotti in tutto**, di **2 negozi**: «Pane Quotidiano» (via Calzolai 25, l'unico negozio vero:
  5 prodotti, tutti con foto, da 2,05 a 5,00 €: kefir di capra, hummus, pesto, kefir 400 g, pudding) e
  «Panificio Demo» (account DIMOSTRATIVO per test interni, descrizione pubblica «Account DIMOSTRATIVO per test
  interni», telefono 0523000000: 4 prodotti senza foto — pane, focaccia, grissini, miele).
- Categorie: 9 principali e 72 in tutto; prodotti presenti in **3** (tutte alimentari). 0 recensioni prodotto,
  0 recensioni negozio, 0 storie dei negozi, 1 ordine in tutta la storia. Nessun negozio ha il logo.
- Pagamento con carta spento (stripe non attivo sui negozi): si paga in contanti alla consegna.
- Id utili: prodotto kefir `90386a8f-f342-479b-8588-7583a4c2ef27`, negozio Pane Quotidiano
  `c0b240c0-2a86-4218-9d0f-5154f08ff929`.

## Due strati da tenere SEMPRE separati
- **GUSCIO** = come è costruito il sito (modelli di pagina, componenti, navigazione): è ciò che vedrà il
  cliente quando ci saranno 50 negozi e 2.000 prodotti. Si giudica dal codice e dalle foto.
- **CONTENUTO** = cosa vede il cliente OGGI con 9 prodotti (vuoti, foto, testi, numeri). Si giudica dalle
  pagine vere e dai numeri sopra.
Un requisito può mancare in uno, nell'altro o in tutti e due: dillo.

## Il perché di MyCity (da `/home/user/ad-mycity/CONTESTO_BUSINESS.md`, leggi §2.2, §3, §4, §7)
- Il cittadino ha l'abitudine di Amazon: **se comprare in città è anche solo un po' più difficile di un
  clic su Amazon, l'abitudine non si sposta.** Niente app da scaricare, niente login inutili, WhatsApp è il
  canale naturale.
- Categorie dove si può vincere: fresco e spesa quotidiana, cura persona, farmacia, regali e ricorrenze,
  abbigliamento indipendente. Categorie perse: elettronica, assortimento infinito, guerra di prezzo.
- MyCity vince per densità locale e volti veri, non per ampiezza: «nicchia poi espandi».
- MAI costruire: moneta alternativa all'euro, prezzi che ballano (dynamic pricing aggressivo), dirette di
  vendita h24, usato, notifiche a chi passa davanti al negozio, dodici funzioni insieme.
- Ogni proposta deve passare le 5 domande: quale abitudine cambia · a chi serve e cosa incassa il primo mese ·
  rompe un paletto? · aggiunge fatica? · si vede in cassa in 2-4 settimane?
- Novembre-dicembre: è la stagione dei regali (gift card, enoteche, fiorai): pesa nel giudizio di «voglia di comprare».

## Cosa è già stato trovato prima (non ripeterlo come scoperta nuova, ma controlla se è ancora vero)
`/home/user/ad-mycity/consegne/design/2026-10-11-radiografia-design.md` (72 difetti di ciò che si vede,
fra cui: metà del logo e il pulsante «Accedi» invisibili nella testata, promesse false su 30-60 minuti, carta,
ritiro in negozio, 5 € di benvenuto, categorie vuote in vetrina). Dall'11/10 molte cose sono state riparate
nelle «ondate» del sito: controlla sempre nel codice di oggi. Questa analisi NON è una caccia ai bug: è il
confronto con i migliori, requisito per requisito.

## Regole per chi analizza
- Sola lettura. Nessuna scrittura su database, codice o file fuori dalla tua risposta.
- Ogni affermazione con una prova: `file:riga` nel codice, oppure la pagina/foto di produzione con il testo
  citato. «Manca» si dice solo dopo aver cercato davvero (Grep su più nomi possibili): nel codice ci sono
  già molti componenti (StickyAddToCart, RecentlyViewed, SimilarProducts, ProductQA, OrderTimeline,
  DeliveryMap, ShareCartButton, AddToListButton, BuyerOnboardingTour, SearchBar, CategoryBar, MobileTabBar…).
- Il confronto con i migliori deve essere concreto: «Glovo mette il pulsante + su ogni card e il carrello
  resta in basso col totale», non «i migliori hanno una buona UX».
- Scrivi in italiano semplice: Nicola sta imparando, le parole tecniche vanno spiegate nella riga stessa.
