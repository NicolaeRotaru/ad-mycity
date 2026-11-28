# Armonia nascosta nei siti: applicazione web, accessibilità, SEO, prestazioni, rischi legali ed etici

*Note di ricerca, 2026-11-28 (fuso di Piacenza). Metodo: in questa sessione il recupero diretto delle pagine (WebFetch) era bloccato dalla rete per developers.google.com, w3.org, nextjs.org e artificialintelligenceact.eu. Ho quindi lavorato con le ricerche web (riassunti con fonte). Dove riporto il testo di una norma che conosco ma che NON ho potuto riscaricare qui, lo segno con **[testo noto, non riscaricato]**: va riletto sulla fonte prima di citarlo come verbatim. I limiti numerici proposti come «budget» sono scelte ingegneristiche mie, segnate come inferenze.*

---

## 1. Accessibilità: quali criteri WCAG 2.2 valgono, quali leggi obbligano (EAA, Legge Stanca, AgID), effetto dei motivi di sfondo su dislessici e ipovedenti

### Takeaway
Uno strato decorativo «nascosto» è accessibile solo se (a) è invisibile alle tecnologie assistive, (b) non abbassa il contrasto del testo sotto 4,5:1 nel punto peggiore del motivo, (c) qualsiasi movimento automatico oltre 5 secondi si può fermare, e (d) sparisce con `prefers-reduced-motion`. Per legge, l'EAA esonera le microimprese che forniscono servizi (quindi quasi tutti i negozi di Piacenza e probabilmente MyCity oggi) e la Legge Stanca sui privati vale solo sopra 500 milioni di fatturato: l'obbligo legale è debole, ma WCAG 2.2 AA resta la base giusta, anche perché le linee guida per la dislessia dicono esplicitamente «niente motivi dietro al testo».

### Cited Findings
**Contrasto e immagini di sfondo (1.4.3, F83)**
- WCAG 1.4.3 (AA) chiede contrasto almeno 4,5:1 per il testo normale e 3:1 per il testo grande (18pt, o 14pt grassetto); testo che fa parte di un logo e testo puramente decorativo sono esenti — [W3C Understanding 1.4.3 (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- La tecnica di fallimento F83 riguarda proprio il testo sopra un'immagine di sfondo: si misura il contrasto contro la zona dell'immagine più simile al testo e dietro al testo; prova rapida contro l'area più scura (testo scuro) o più chiara (testo chiaro), e se fallisce si controlla dietro ogni lettera — [W3C F83](https://www.w3.org/WAI/WCAG22/Techniques/failures/F83)

**Movimento (2.2.2, 2.3.3)**
- 2.2.2 Pause, Stop, Hide (livello **A**): serve un meccanismo per mettere in pausa, fermare o nascondere informazioni in movimento, lampeggianti o scorrevoli che partono da sole, durano più di 5 secondi e sono presentate insieme ad altro contenuto, salvo che il movimento sia essenziale. I 5 secondi sono scelti perché bastano ad attirare l'attenzione ma si possono aspettare — [W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)
- Per i contenuti che si aggiornano da soli non c'è l'eccezione dei 5 secondi; con più elementi in movimento il W3C raccomanda **un solo comando** per tutta la pagina invece di uno per elemento — [W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)
- F112: fallimento per contenuto che inizia a lampeggiare da solo per 5 secondi o più, insieme ad altro contenuto, senza modo di fermarlo — [W3C F112](https://www.w3.org/WAI/WCAG22/Techniques/failures/F112)
- 2.3.3 Animation from Interactions è livello **AAA**: «Motion animation triggered by interaction can be disabled, unless the animation is essential…»; la tecnica sufficiente C39 è la media query `prefers-reduced-motion` **[testo noto, non riscaricato; confermato solo come «da memoria» anche dal riassunto di ricerca]** — [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

**Immagini decorative (1.1.1) e contrasto non testuale (1.4.11)**
- 1.1.1 (A): le immagini puramente decorative devono essere implementate in modo che la tecnologia assistiva possa ignorarle; F38 è il fallimento per immagini decorative non marcate così **[testo noto, non riscaricato: la ricerca non ha restituito la pagina F38]** — [W3C Understanding 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)
- 1.4.11 (AA) vale per la grafica necessaria a capire il contenuto e per i componenti dell'interfaccia; la grafica puramente decorativa ne è fuori **[da memoria, non verificato in sessione]** — [W3C Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

**European Accessibility Act e Italia**
- L'Italia ha recepito l'EAA (Direttiva (UE) 2019/882) con il D.Lgs. 82/2022, in vigore dal 16 luglio 2022; gli obblighi sostanziali per le imprese valgono dal 28 giugno 2025; i siti e le app di **e-commerce** sono tra i servizi coperti; **le microimprese che forniscono servizi sono esenti** — [Portolano Cavallo](https://portolano.it/newsletter/portolano-cavallo-inform-digital-ip/italy-transposes-european-accessibility-act-directive-ue-2019882); [Level Access](https://www.levelaccess.com/blog/italian-accessibility-requirements/)
- Sanzioni riportate per violazione: da 5.000 a 40.000 euro — [Level Access (PDF)](https://www.levelaccess.com/wp-content/uploads/2025/02/Italy-Digital-Accessibility-Laws.pdf)
- AgID ha pubblicato le Linee guida sull'accessibilità dei servizi ai sensi del D.Lgs. 82/2022 (versione 1.0 del 4 marzo 2026; notizia AgID dell'11/03/2026) e gestisce una piattaforma per le segnalazioni — [AgID, notizia](https://www.agid.gov.it/index.php/it/notizie/european-accessibility-act-eaa-pubblicate-le-linee-guida-agid-sullaccessibilita-dei-servizi); [Agenda Digitale](https://www.agendadigitale.eu/?p=266695)
- Definizione di microimpresa nell'EAA: meno di 10 persone e fatturato annuo o totale di bilancio non oltre 2 milioni di euro (art. 3, punto 23) **[testo noto, non riscaricato]** — [EUR-Lex, Direttiva 2019/882](https://eur-lex.europa.eu/eli/dir/2019/882/oj)
- Legge Stanca (L. 4/2004), art. 3 comma 1-bis, introdotto dal DL 76/2020: l'obbligo per i privati riguarda solo chi offre servizi al pubblico via sito o app con **fatturato medio degli ultimi tre anni superiore a 500 milioni di euro**; AgID ha adottato linee guida per questi soggetti (determinazione 26 aprile 2022) e la circolare 3/2022 del 20 dicembre 2022; sanzione fino al 5% del fatturato — [AgID, linee guida privati](https://www.agid.gov.it/it/design-servizi/accessibilita/linee-guida-accessibilita-privati); [Hogan Lovells](https://www.engage.hoganlovells.com/knowledgeservices/news/digital-accessibility-in-italy-agid-sheds-light-on-the-stanca-law); [AgID, circolare 2023](https://www.agid.gov.it/index.php/it/agenzia/stampa-e-comunicazione/notizie/2023/01/13/accessibilita-siti-web-app-online-circolare-agid-i-chiarimenti-interpretativi)

**Dislessia e ipovisione**
- Lo Style Guide della British Dyslexia Association, citato da più università: «Use single colour backgrounds. Avoid background patterns or pictures and distracting surrounds» — [Ulster University](https://www.ulster.ac.uk/accessibility-standards/creating-and-improving-accessible-content)
- Gli studenti dislessici e quelli con disabilità visiva trovano «molto difficile» leggere testo scritto sopra motivi o immagini — [University of Exeter](https://sites.exeter.ac.uk/aict/writing-accessible-teaching-material/)
- I motivi o le foto di sfondo rendono il testo più difficile anche per chi non è dislessico — [Ulster University](https://www.ulster.ac.uk/accessibility-standards/creating-and-improving-accessible-content)
- La BDA consiglia testo scuro su fondo chiaro non bianco puro (abbagliamento); ma chi ha «stress visivo» (spesso associato alla dislessia, ma diverso) tende a preferire contrasti più bassi: le due esigenze tirano in direzioni opposte — [Cardiff University](https://blogs.cardiff.ac.uk/LTAcademy/not-just-pretty-colours-using-colour-and-contrast-inclusively); [Dyslexia Scotland](https://dyslexiascotland.org.uk/contrasting-advice-what-colours-are-best-for-accessibility/)

### Inferences
- L'esonero EAA delle microimprese probabilmente copre sia i negozi clienti sia MyCity oggi; ma un negozio che supera 10 addetti o 2 milioni, o MyCity che cresce, entra nell'obbligo da un giorno all'altro. Costruire subito a WCAG 2.2 AA costa meno che rifare dopo.
- Il conflitto tra «armonia nascosta» e accessibilità è quasi tutto in due punti: il motivo dietro al testo (1.4.3/F83 e la regola BDA) e il movimento (2.2.2, 2.3.3). Tutto il resto (proporzioni auree, ordine delle animazioni, valori numerologici dentro spaziature) è neutro per l'accessibilità, perché non si vede come contenuto.

### Regole operative (fai / non fare)
1. **FAI** `aria-hidden="true"` e `focusable="false"` su ogni `<svg>` decorativo inline; per `<img>` decorative `alt=""`. **NON** mettere `<title>`, `<desc>` o `role="img"` in uno strato decorativo. *Perché:* 1.1.1 chiede che il decorativo sia ignorabile; un `<title>` dentro un SVG viene letto dai lettori di schermo. *Fonte:* W3C 1.1.1 / F38 (sopra).
2. **FAI** lo strato con `pointer-events: none`, posizione dietro (`z-index` negativo dentro un contesto `isolation: isolate`) e fuori dall'ordine di tabulazione. *Perché:* non deve mai rubare clic o focus. *Fonte:* inferenza da 1.1.1 e 2.4.3.
3. **NON** mettere mai un motivo dietro al **corpo del testo** (paragrafi, prezzi, schede prodotto, moduli). Ammesso solo nei margini, negli spazi vuoti dell'hero o dietro titoli grandi. *Perché:* regola BDA esplicita e Exeter. *Fonte:* Ulster, Exeter (sopra).
4. **FAI** contrasto ≥ 4,5:1 (≥ 3:1 per testo grande) misurato contro il **pixel peggiore** del motivo dietro al testo, non contro il colore medio dello sfondo. In pratica: opacità del motivo così bassa che anche la linea più scura del motivo lascia il rapporto sopra soglia. *Fonte:* F83.
5. **FAI** movimento solo con `@media (prefers-reduced-motion: no-preference)` (approccio «niente movimento di default»). *Fonte:* C39 / 2.3.3.
6. **NON** far muovere da solo uno sfondo per più di 5 secondi senza un comando unico di pausa per la pagina; meglio: lo sfondo non si muove mai da solo, al massimo un'unica transizione all'apertura sotto i 5 secondi. *Fonte:* 2.2.2.
7. **NON** usare lampeggi, sfarfallii o pulsazioni rapide (anche il «puntino della luna» non deve pulsare). *Fonte:* F112 e 2.3.1 (tre lampi, livello A).
8. **FAI** nascondere tutto lo strato con `@media (forced-colors: active)` e `@media (prefers-contrast: more)`. *Perché:* in contrasto forzato il motivo diventa rumore ad alto contrasto. *Fonte:* inferenza (non verificata in sessione su MDN).
9. **FAI** verificare che a 320 px di larghezza e con zoom 400% e spaziatura del testo aumentata (1.4.10, 1.4.12) lo strato non finisca sopra al testo. *Fonte:* inferenza dai criteri WCAG 2.2 AA.

### Gaps
- Non ho potuto riscaricare i testi verbatim delle pagine W3C (2.3.3, 1.1.1, F38, 1.4.11, C39): rete bloccata.
- Non ho verificato quale versione di EN 301 549 sia oggi la norma armonizzata per l'EAA (la v3.2.1 rimanda a WCAG 2.1 AA; una versione allineata a WCAG 2.2 era attesa) né il testo esatto dell'esonero microimprese nel D.Lgs. 82/2022.
- Non ho trovato studi quantitativi su quanto un motivo **molto tenue** (sotto il 5% di opacità) riduca la velocità di lettura nei dislessici: le linee guida dicono «evitare», senza soglie.

---

## 2. SEO: testo nascosto e cloaking secondo Google; rischi di SVG decorativi inline e commenti nel codice

### Takeaway
Uno SVG decorativo **senza parole dentro** non è «testo nascosto»: le norme di Google colpiscono testo e link nascosti a chi legge ma visibili ai motori, e il cloaking (contenuti diversi a utenti e motori) con intento di manipolare. Il rischio nasce solo se nello strato si mettono parole, numeri-messaggio o link (per esempio parole chiave con opacità 0, o testo in `<text>` invisibile).

### Cited Findings
- Le norme antispam di Google: il testo o i link nascosti si possono creare con CSS o HTML, o con modifiche più complesse come il cloaking; esempi: testo bianco su fondo bianco, testo dietro un'immagine, testo posizionato fuori schermo con CSS, dimensione del carattere o **opacità a 0** — [Google Search Central, Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- Il cloaking è presentare contenuti diversi agli utenti e ai motori con l'intento di manipolare il posizionamento e ingannare gli utenti — [Google Search Central, Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- Tra gli elementi che **non** violano la norma la pagina inglese elenca fisarmoniche, slider, tooltip e il testo accessibile solo ai lettori di schermo pensato per migliorare la loro esperienza; il riassunto segnala che la traduzione tedesca sembra mettere questa voce nella lista sbagliata, quindi va controllata la pagina inglese — [Google Search Central, Spam policies](https://developers.google.com/search/docs/essentials/spam-policies); [versione cinese](https://developers.google.com/search/docs/essentials/spam-policies?hl=zh-cn)

### Inferences
- Un motivo geometrico fatto solo di `<path>`, `<circle>`, `<line>` non contiene testo: non c'è niente che Google possa considerare testo nascosto. Lo stesso vale per valori numerologici usati come spaziature, durate o angoli dentro CSS/JS.
- I commenti HTML (`<!-- ... -->`) non sono contenuto visibile né indicizzato come testo di pagina; un commento «segreto» non è spam, ma finisce nell'HTML pubblico e chiunque lo può leggere con «Visualizza sorgente». Il rischio è reputazionale (un cliente o un giornalista che trova «sigillo di Saturno» nel codice del panificio), non SEO. I commenti JSX/TS spariscono nella build; i commenti HTML veri no.
- Il cloaking non c'entra finché server e utente ricevono la stessa pagina. Diventerebbe un problema solo se si servisse un HTML diverso ai bot (per esempio togliendo lo strato ai crawler per «pulire» la pagina): non farlo mai.

### Regole operative (fai / non fare)
1. **NON** mettere mai parole, frasi, nomi, numeri-messaggio o link dentro lo strato nascosto (niente `<text>`, niente `<a>`, niente testo con `opacity:0`, `font-size:0`, colore uguale allo sfondo). *Perché:* sono gli esempi testuali di testo nascosto. *Fonte:* Google Spam policies.
2. **NON** servire versioni diverse a bot e persone (niente user-agent sniffing per lo strato). *Fonte:* definizione di cloaking, Google.
3. **FAI** i commenti di progetto nel sorgente (JSX/TS, che il build rimuove), **NON** nei commenti HTML spediti al browser; nel sorgente usa nomi tecnici neutri (`proporzioni`, `ritmo`) e la spiegazione completa in un documento interno. *Fonte:* inferenza.
4. **FAI** il testo «solo per lettori di schermo» (classe `sr-only`) solo quando serve a loro, mai per inserire parole chiave. *Fonte:* Google Spam policies (eccezione per accessibilità).

### Gaps
- Pagina Google non riscaricata direttamente (rete bloccata): ho i contenuti tramite riassunto di ricerca; il raggruppamento esatto della lista «non è violazione» va riletto.
- Non ho trovato una dichiarazione ufficiale e recente di Google sul trattamento dei commenti HTML: l'affermazione che sono ignorati per il ranking è un'inferenza diffusa, non verificata.

---

## 3. Prestazioni: peso dell'HTML, Core Web Vitals (LCP, CLS, INP), SVG inline vs immagine di sfondo CSS vs file esterno, budget, costo di molti tracciati, animazioni

### Takeaway
Ogni forma di uno SVG inline diventa un nodo del DOM e pesa sull'HTML critico; un motivo ripetuto come piccola tessera in `background-image` costa zero nodi. Le animazioni vanno solo su `transform` e `opacity` (le uniche gestite dal compositor, escluse dal CLS), con `will-change` usato con parsimonia. Lighthouse avvisa sopra circa 800 nodi nel body e segnala errore sopra circa 1.400: lo strato decorativo deve stare in una piccola frazione di quel budget.

### Cited Findings
- Lighthouse: avviso quando il `body` ha più di ~800 nodi, errore oltre ~1.400; da Lighthouse 13 l'audit è confluito nell'insight «Optimize DOM size» — [Chrome for Developers, Avoid an excessive DOM size](https://developer.chrome.com/docs/lighthouse/performance/dom-size)
- Un DOM grande peggiora l'interattività (base per INP) — [web.dev, DOM size and interactivity](https://web.dev/articles/dom-size-and-interactivity)
- Ogni SVG inline aggiunge nodi al DOM e può incidere sulle prestazioni; `<img>` o sfondo CSS tengono le forme fuori dal documento; gli sprite `<symbol>` riducono il DOM e permettono l'istanziazione — [Andrea Verlicchi](https://www.andreaverlicchi.eu/blog/loading_svg_images_icons_performance_considerations)
- Nel test di Cloud Four sulle icone, inline e sprite hanno reso **peggio** di `<img>` e `<img>` con data URI — [Cloud Four, SVG icon stress test](https://cloudfour.com/thinks/svg-icon-stress-test)
- Il base64 aumenta la dimensione del ~33%; dentro un data URI non si possono stilare le parti interne con CSS esterno — [DebugBear](https://www.debugbear.com/blog/base64-data-urls-html-css)
- Le animazioni non composte possono **aumentare il CLS** perché spostano elementi; quelle composte ne sono escluse — [Chrome for Developers, non-composited animations](https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations)
- Solo `transform` e `opacity` sono gestite dal solo compositor; non abusare di `will-change` (spreca risorse) e toglierlo quando il cambiamento è finito — [web.dev, compositor-only properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count); [web.dev, animations guide](https://web.dev/articles/animations-guide)

### Inferences
- Per un motivo geometrico **ripetuto** (fiore della vita, griglia aurea, stelle), la scelta migliore è una tessera SVG piccola messa come `background-image: url("data:image/svg+xml,…")` codificata in URL (non base64, per evitare il +33%) oppure come file `.svg` esterno in cache: zero nodi DOM, nessun costo di idratazione React.
- SVG inline solo quando serve davvero (forma unica, poche decine di elementi, colore da variabile CSS). Un componente React che genera centinaia di `<path>` aumenta HTML, DOM e il payload RSC/idratazione.
- Uno strato decorativo non dovrebbe mai diventare l'elemento LCP né ritardarlo: niente immagini di sfondo grandi e uniche caricate prima del contenuto. (I dettagli su quali immagini di sfondo Chrome esclude dai candidati LCP non li ho verificati.)

### Regole operative (fai / non fare) — i budget numerici sono proposte mie
1. **FAI** i motivi ripetuti come tessera in `background-image` (data URI codificato in URL, o file esterno). **NON** generarli come centinaia di nodi inline. *Perché:* zero nodi DOM. *Fonte:* Verlicchi, Cloud Four, DebugBear.
2. **Budget proposto:** strato decorativo inline ≤ 60 elementi SVG per pagina (circa il 5% della soglia di avviso di 800 nodi), tessera di sfondo ≤ 1–2 KB, totale decorativo ≤ 4 KB compressi. *Fonte del riferimento:* soglie Lighthouse; i numeri sono un'inferenza.
3. **FAI** animare solo `transform` e `opacity`; **NON** animare `top/left/width/height`, `stroke-dashoffset` su tracciati grandi, filtri SVG (`feTurbulence`, `feGaussianBlur`) a tutto schermo. *Fonte:* web.dev compositor-only (il costo dei filtri è un'inferenza).
4. **FAI** `will-change` solo durante l'animazione e su pochi elementi; mai su tutto lo strato in modo permanente. *Fonte:* web.dev.
5. **FAI** riservare lo spazio (posizione assoluta/fissa dentro un contenitore con dimensioni note) così lo strato non sposta mai il layout. *Fonte:* CLS, Chrome docs.
6. **NON** caricare librerie (GSAP, three.js, ecc.) solo per lo strato decorativo: CSS basta. *Fonte:* inferenza (peso JS → INP).
7. **FAI** calcoli geometrici al build o sul server, non nel browser a ogni render. *Fonte:* inferenza.

### Gaps
- Non ho verificato il limite di byte HTML che Googlebot scarica oggi (la cifra storica di 15 MB potrebbe essere stata rivista): da rileggere su Google Search Central.
- Nessun benchmark recente (2024-2026) trovato sul costo di rendering di molti `<path>` in Chrome/Safari mobile; i test Cloud Four sono vecchi e piccoli.
- Non verificato quali immagini di sfondo a basso contenuto Chrome escluda dal calcolo LCP.

---

## 4. Idratazione e interfaccia che dipende dall'ora in Next.js (fase lunare, valori legati alla data) e implicazioni di cache/ISR

### Takeaway
Un valore calcolato da «adesso» (fase lunare, ora astrologica, numero del giorno) cambia tra server e browser e rompe l'idratazione. Le strade corrette sono: calcolarlo una volta sul server con fuso esplicito `Europe/Rome` e passarlo come dato; oppure mostrarlo solo dopo il montaggio (`useEffect`); `suppressHydrationWarning` è solo un cerotto di un livello. Con pagine in cache (statiche/ISR) il valore resta congelato fino alla rivalidazione.

### Cited Findings
- Next.js: alcuni contenuti differiscono inevitabilmente tra server e client, come un timestamp; si può silenziare l'avviso con `suppressHydrationWarning={true}` sull'elemento — sopprime l'avviso, non la differenza — [Next.js, react-hydration-error](https://nextjs.org/docs/messages/react-hydration-error)
- Alternativa documentata: calcolare il valore in `useEffect`, che non gira durante il render sul server; render identico al primo passaggio e aggiornamento voluto dopo il montaggio — [Next.js, react-hydration-error](https://nextjs.org/docs/messages/react-hydration-error); [LogRocket](https://blog.logrocket.com/how-fix-rsc-hydration-mismatches-next-js/)
- Il server spesso gira in UTC e gli utenti no: le date formattate divergono — [OneUptime, 2026](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view)
- La guida Next.js «preventing flash before hydration» usa `suppressHydrationWarning` più uno script inline che riscrive il testo nel browser prima dell'idratazione — [Next.js guide](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration)
- Nelle versioni recenti di Next.js chiamare `Date.now()`, `Date()` o `new Date()` durante il render di un Client Component senza un `<Suspense>` sopra è segnalato come errore (funzione «Instant Navigations», indicata dal riassunto come introdotta in Next.js 16.3), perché Next non può fissare «adesso» nell'HTML prerenderizzato — [Next.js, next-prerender-current-time-client](https://nextjs.org/docs/messages/next-prerender-current-time-client); [blocking-prerender-current-time-client](https://nextjs.org/docs/messages/blocking-prerender-current-time-client)

### Inferences
- La fase lunare cambia lentamente (giorni): calcolarla sul server per **giorno civile a Piacenza** (`Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome' })`) e passarla come prop a un componente che non la ricalcola elimina ogni mismatch. Il client non deve mai fare `new Date()` per lo stesso valore nel render.
- Con ISR il valore è quello del momento della generazione: con `revalidate = 3600` (un'ora) il puntino può essere in ritardo al massimo di un'ora, accettabile per la luna; per valori al minuto meglio il calcolo solo-client dopo il montaggio.
- Tutto ciò che non deve dipendere dall'ora (ordine delle animazioni da quadrato magico, palette numerologica del negozio) va derivato da un **seme stabile** (per esempio lo slug del negozio) con un generatore pseudo-casuale deterministico: stesso output su server e client, perfettamente cacheabile. `Math.random()` nel render rompe l'idratazione esattamente come `Date`.

### Regole operative (fai / non fare)
1. **FAI** i valori astrali calcolati sul server (Server Component o funzione pura) con fuso esplicito `Europe/Rome`, passati come prop serializzata. **NON** chiamare `new Date()`/`Date.now()` nel render di un Client Component. *Fonte:* Next.js docs.
2. **FAI** i valori deterministici (ordine, colori, ritmi) da un seme stabile; **NON** usare `Math.random()` durante il render. *Fonte:* inferenza dallo stesso meccanismo.
3. **FAI** il dettaglio «vivo» (al minuto) solo dopo il montaggio in `useEffect`, con primo render identico al server (per esempio puntino neutro o assente). *Fonte:* Next.js docs.
4. **NON** usare `suppressHydrationWarning` come soluzione generale: vale solo su un livello e nasconde la differenza. *Fonte:* Next.js docs.
5. **FAI** scegliere la rivalidazione in base alla granularità del valore (luna: `revalidate` 1–6 ore; nessun valore al secondo in pagine cache). *Fonte:* inferenza.
6. **NON** usare `dynamic(..., { ssr: false })` per tutto lo strato se si può evitare: aggiunge JS e un salto visivo; usarlo solo per un piccolo componente vivo. *Fonte:* inferenza.

### Gaps
- Non ho potuto leggere direttamente le pagine Next.js (rete bloccata): la versione esatta (16.3) dell'errore sul tempo corrente viene dal riassunto di ricerca.
- Non verificato come la nuova cache di Next 16 («Cache Components» / `use cache`, `cacheLife`) interagisca con valori legati alla data: da controllare sulla versione installata nel marketplace.

---

## 5. Legale ed etico: un'armonia nascosta è «subliminale» per il diritto UE e italiano? Trasparenza col cliente, proprietà del design, sensibilità religiosa

### Takeaway
Quasi certamente no, se lo strato resta puramente estetico e percepibile. Le tre norme sul «subliminale» hanno ambiti precisi: l'AVMSD vale per le comunicazioni commerciali audiovisive (TV, on demand, piattaforme video come i reel), non per un sito vetrina; l'AI Act art. 5 vale per **sistemi di IA** e richiede distorsione rilevante del comportamento e danno significativo; la direttiva sulle pratiche commerciali sleali (Codice del Consumo) richiede che la pratica falsi in misura apprezzabile la decisione del consumatore medio. Il rischio vero è altrove: promettere al negoziante che «la geometria fa vendere» senza prove, usare l'«astrologia» per false urgenze, inserire immagini o parole nascoste pensate per influenzare l'acquisto, e offendere un cliente religioso senza averlo informato.

### Cited Findings
**AVMSD (Direttiva 2010/13/UE, modificata dalla 2018/1808)**
- Art. 9(1): le comunicazioni commerciali audiovisive devono essere riconoscibili, quelle occulte sono vietate, e (lett. b) non devono usare tecniche subliminali — [Ofcom, estratti AVMSD](https://www.ofcom.org.uk/tv-radio-and-on-demand/broadcast-standards/appendix-2); [legislation.gov.uk, art. 9](https://www.legislation.gov.uk/eudr/2010/13/article/9/data.htm?view=plain)
- La definizione di comunicazione commerciale audiovisiva comprende «inter alia» pubblicità televisiva, sponsorizzazione, televendita e inserimento di prodotti — [Commissione UE, pagina archiviata](https://ec.europa.eu/avpolicy/reg/tvwf/advertising/index_en.htm)
- Anche le piattaforme per la condivisione di video devono rispettare l'art. 9(1), via art. 28b(2) — [Osservatorio europeo dell'audiovisivo](https://www.obs.coe.int/en/web/observatoire/audiovisual-commercial-communications)
- Non ho trovato una definizione vincolante di «tecniche subliminali» nell'AVMSD; l'Osservatorio, commentando le linee guida UE sull'IA, le descrive come stimoli audio, visivi o tattili troppo brevi o sottili per essere notati, tradizionalmente vietati nella pubblicità — [IRIS Merlin, Osservatorio](https://merlin.obs.coe.int/article/10246)

**AI Act (Regolamento (UE) 2024/1689)**
- Art. 5(1)(a) vieta l'immissione sul mercato, la messa in servizio o l'uso di un sistema di IA che impiega tecniche subliminali che agiscono senza che una persona ne sia consapevole, o tecniche volutamente manipolative o ingannevoli, con l'obiettivo o l'effetto di distorcere materialmente il comportamento, compromettendo in modo apprezzabile la capacità di decidere in modo informato, causando o potendo causare un danno significativo; si applica dal 2 febbraio 2025 **[testo noto, non riscaricato]** — [EUR-Lex, Reg. 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- L'AI Act non definisce «tecniche subliminali»; secondo le linee guida della Commissione sulle pratiche vietate (febbraio 2025), art. 5(1)(a) e considerando 29 indicano tecniche intrinsecamente occulte, che operano oltre la soglia della consapevolezza; il considerando 29 copre anche chi sa della tecnica ma non riesce a resisterle — [FPF](https://fpf.org/blog/red-lines-under-the-eu-ai-act-understanding-manipulative-techniques-and-the-exploitation-of-vulnerabilities/); [AI Act Service Desk, considerando 29](https://ai-act-service-desk.ec.europa.eu/en/ai-act/recital-29)
- Il testo dell'Atto parla di stimoli che la persona non può percepire, come audio, immagini o video oltre la percezione umana; il divieto di manipolazione si applica anche senza intenzione; la pubblicità personalizzata ordinaria «non è di per sé manipolativa» — [FPF](https://fpf.org/blog/red-lines-under-the-eu-ai-act-understanding-manipulative-techniques-and-the-exploitation-of-vulnerabilities/); [Lewis Silkin](https://www.lewissilkin.com/insights/2025/02/17/understanding-the-eu-ai-acts-prohibited-practices-key-workplace-and-advertising-102k011); [Covington, Inside Privacy](https://www.insideprivacy.com/artificial-intelligence/european-commission-guidelines-on-prohibited-ai-practices-under-the-eu-artificial-intelligence-act/)
- Definizione di «sistema di IA» (art. 3(1)): un sistema automatizzato che, per obiettivi espliciti o impliciti, **deduce** dall'input come generare output; il considerando 12 esclude i sistemi basati su regole definite unicamente da persone fisiche per eseguire operazioni in automatico **[testo noto, non riscaricato]** — [EUR-Lex, Reg. 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

**Pratiche commerciali sleali (Direttiva 2005/29/CE) e Codice del Consumo**
- Codice del Consumo art. 20: è scorretta la pratica contraria alla diligenza professionale e falsa o idonea a falsare **in misura apprezzabile** il comportamento economico del consumatore medio; categorie: ingannevoli (artt. 21–23) e aggressive (artt. 24–26); la definizione originaria (art. 18, lett. e) parla di alterare sensibilmente la capacità di prendere una decisione consapevole — [Mimit](https://www.mimit.gov.it/index.php/it/mercato-e-consumatori/tutela-del-consumatore/diritti-del-consumatore/equita-e-trasparenza); [Brocardi, art. 20](https://brocardi.it/codice-del-consumo/parte-ii/titolo-iii/capo-ii/art20.html); [Normattiva, Codice del Consumo](https://www.normattiva.it/eli/id/2007/09/06//007G0161/CONSOLIDATED)
- L'art. 21 è stato modificato dal D.Lgs. 26/2023; un'ulteriore modifica (D.Lgs. 30/2026) si applica dal 27 settembre 2026 — [Brocardi, art. 21](https://brocardi.it/codice-del-consumo/parte-ii/titolo-iii/capo-ii/sezione-i/art21.html)
- La tutela contro le pratiche commerciali scorrette in Italia copre anche le **microimprese**, non solo i consumatori (il negoziante a cui MyCity vende il servizio) — [Università di Firenze, studio](https://flore.unifi.it/retrieve/2cd2e55b-5298-4168-9a9c-420b5c922df5/Pratiche%20commerciali%20scorrette%20e%20mercato%20virtuale.%20La%20tutela%20del%20consumatore%20e%20delle%20microimprese%20tra%20public%20and%20private%20enforcement.pdf)

**Sensibilità culturale e religiosa (Italia)**
- In Italia il numero sfortunato è il **17** (XVII anagramma di «VIXI», «ho vissuto»); ITA Airways toglie la fila 17; il venerdì 17 è la data da evitare; il 13 è invece visto come fortunato — [Grunge](https://www.grunge.com/1310090/unlucky-number-13-italy-17); [The Local Italy](https://www.thelocal.it/20220513/why-friday-13th-isnt-an-unlucky-date-in-italy); [Money.it](https://www.money.it/Venerdi-17-perche-porta-sfortuna-in-Italia-origini-significato)
- Il Catechismo della Chiesa Cattolica (§2116) respinge ogni forma di divinazione, inclusi oroscopi e astrologia **[testo noto, non riscaricato]** — [Vaticano, Catechismo](https://www.vatican.va/archive/catechism_it/index_it.htm)

### Inferences
- **AI Act:** una funzione deterministica scritta da noi (sezione aurea, quadrato magico, calcolo della fase lunare) non «deduce» nulla: è un sistema a regole definite da persone, quindi con ogni probabilità non è nemmeno un «sistema di IA». Anche se un'IA generasse il motivo, mancherebbero gli altri requisiti cumulativi dell'art. 5(1)(a): distorsione materiale della decisione e danno significativo.
- **Percepibilità:** una geometria tenue ma visibile, o una proporzione aurea nel layout, non è uno stimolo «oltre la percezione»: è percepibile, solo non etichettata. Il punto delicato è la formula delle linee guida «troppo sottili per essere notati»: un'immagine o una parola nascosta *apposta* dentro uno sfondo (un logo, un «COMPRA», un sigillo) per influenzare l'acquisto si avvicina alla categoria delle «immagini incorporate». Quindi la linea è: **proporzioni e motivi astratti sì, messaggi nascosti no**.
- **AVMSD:** un sito vetrina non è un servizio di media audiovisivo. Ma i **reel e i video pubblicitari** dei clienti sui social (piattaforme video, art. 28b) sono comunicazioni commerciali audiovisive: lì niente fotogrammi nascosti, simboli lampo o messaggi incorporati. In Italia la norma di recepimento è il TUSMA (D.Lgs. 208/2021); l'articolo preciso non l'ho verificato.
- **Codice del Consumo verso i clienti finali:** una proporzione nel layout non falsa la decisione del consumatore. Lo farebbero invece: timer o «finestre astrali» false («solo con la luna piena −20%» se non è vero), urgenza inventata, ordine delle offerte manipolato per nascondere il prezzo. L'astrologia può decidere *quando* parte un'animazione, **mai** una scarsità o un prezzo.
- **Codice del Consumo verso il negoziante (microimpresa):** promettere «più vendite grazie alla geometria sacra» senza prove è il rischio legale più concreto di tutto il progetto. Le prove scientifiche che la sezione aurea migliori le vendite non ci sono (vedi sezione 6).
- **DSA (per il marketplace):** l'art. 25 vieta alle piattaforme online interfacce che ingannano o manipolano, ma l'art. 19 esonera micro e piccole imprese dalla sezione 3 **[testo noto, non riscaricato]**; il Codice del Consumo resta comunque applicabile.
- **GDPR:** se la numerologia o l'astrologia usassero la data di nascita o il nome dei clienti finali, sarebbe un trattamento di dati personali con finalità difficile da giustificare: usare solo dati pubblici del negozio (nome dell'insegna, anno di apertura) e col consenso del titolare.
- **Proprietà e trasparenza:** il sito è del cliente (regola di casa: «nulla è davvero nostro»). Uno strato con significato esoterico che il titolare non conosce è una sorpresa potenziale per lui, e la sua reputazione. Il diritto d'autore italiano (L. 633/1941) e il contratto decidono chi possiede il codice: lo strato va dichiarato nel contratto o nella proposta, con possibilità di spegnerlo (interruttore) e senza costi di rimozione.
- **Religione:** a Piacenza, città a maggioranza cattolica e con comunità di altre fedi, la parte «astrologia/magia» può offendere un titolare credente (Catechismo §2116), mentre «proporzioni armoniche» e «geometria» sono neutre. Quindi due livelli: base laica sempre (proporzioni, ritmo, geometria astratta), livello simbolico solo su consenso informato.

### Regole operative (fai / non fare)
1. **FAI** solo proporzioni, ritmi e motivi astratti; **NON** inserire mai immagini, parole, loghi, numeri o sigilli nascosti pensati per influenzare chi guarda. *Perché:* è la linea che separa il design dalla «tecnica subliminale» (stimoli troppo sottili per essere notati). *Fonte:* AI Act art. 5(1)(a), considerando 29, linee guida Commissione (FPF, IRIS).
2. **NON** mettere fotogrammi o simboli lampo nei video e nei reel dei clienti. *Perché:* lì l'AVMSD art. 9(1)(b) si applica davvero (piattaforme video, art. 28b). *Fonte:* AVMSD.
3. **NON** usare l'astrologia o la numerologia per creare urgenza, scarsità o prezzi («offerta della luna piena») se non corrispondono a un'offerta vera e verificabile. *Perché:* pratica ingannevole. *Fonte:* Codice del Consumo artt. 20–21.
4. **NON** promettere al negoziante effetti sulle vendite dell'armonia nascosta; presentarla come scelta estetica e di cura, non come leva commerciale. *Perché:* tutela delle microimprese contro le pratiche scorrette, assenza di prove. *Fonte:* Codice del Consumo, studio UniFi; sezione 6.
5. **FAI** dichiarare lo strato al titolare per iscritto (una riga nella proposta: «il sito usa proporzioni armoniche e, se lo desidera, un livello simbolico»), con opzione per spegnere il livello simbolico. *Fonte:* inferenza; regola di casa «non è nostro».
6. **FAI** livello laico come impostazione predefinita; livello astrologico/esoterico solo su consenso esplicito. *Fonte:* Catechismo §2116 e inferenza.
7. **NON** usare dati personali dei clienti finali (data di nascita, nome) per calcoli numerologici o astrologici. *Fonte:* inferenza GDPR.
8. **FAI** una lista di numeri e forme vietati: 17 (e venerdì 17) in tutto ciò che si vede o si conta; simboli religiosi o politici riconoscibili (croce, mezzaluna, stella di David, pentagramma rovesciato, svastica anche «accidentale» da griglie rotanti, codici 88/14/1488). *Fonte:* 17 — Grunge, The Local; gli altri sono inferenze da verificare.

### Gaps
- Testo verbatim di AI Act art. 3(1), art. 5(1)(a), considerando 12 e 29, AVMSD art. 9, DSA artt. 19 e 25, EAA art. 3: non riscaricati (rete bloccata). Le linee guida della Commissione sulle pratiche vietate le ho viste solo tramite commenti (FPF, Covington, Lewis Silkin); i riassunti si basano sulla versione di febbraio 2025.
- Non ho trovato casi giurisprudenziali o decisioni AGCM su design «subliminale» nei siti web.
- Non verificato l'articolo esatto del TUSMA (D.Lgs. 208/2021) che recepisce l'AVMSD art. 9.
- Non ho una fonte sulle sensibilità specifiche di altre comunità religiose presenti a Piacenza (per esempio musulmana, ortodossa, sikh) verso astrologia e simboli: da approfondire se un cliente ne fa parte.
- La lista di simboli vietati oltre al 17 è una mia proposta, non una fonte.

---

## 6. Precedenti: marchi e designer che usano geometria nascosta, scale tipografiche modulari, identità generative, e prove del loro effetto

### Takeaway
I precedenti veri esistono, ma molti sono più mito che fatto: l'uccello di Twitter è davvero fatto di cerchi, la «sezione aurea» del logo Apple è smentita, il documento Arnell per Pepsi (2008) è diventato l'esempio di come la geometria sacra usata come giustificazione venga ridicolizzata. La freccia FedEx è un simbolo nascosto riuscito ma dichiarato. Le identità generative (MIT Media Lab, Casa da Música) sono riconosciute come buon design. Non ho trovato prove che la geometria nascosta in sé aumenti vendite o fiducia.

### Cited Findings
**Geometria nei loghi**
- Twitter (2012): il designer Martin Grasser ha costruito l'uccello sovrapponendo 15 cerchi per avere curve uniformi; il team amava costruire i disegni da cerchi per neutralità e semplicità — [Fast Company](https://www.fastcompany.com/90310504/4-things-you-didnt-know-about-twitters-logo); [Daily Beast](https://www.thedailybeast.com/twitter-logo-designer-pays-tribute-to-icon-before-x-rebrand)
- Che i cerchi siano in rapporto aureo lo dicono solo siti secondari, non Grasser — [logo.com](https://logo.com/blog/twitter-logo)
- Apple: il logo soddisfa la sezione aurea solo allargando la definizione fino a renderla inutile (David Cole); Rob Janoff lavorò su mele vere tagliate, non su cerchi — [Fast Company](https://www.fastcompany.com/1672682/debunking-the-myth-of-apple-s-golden-ratio); [Core77](https://www.core77.com/posts/24920/quoras-david-cole-settles-the-apple-logo-golden-ratio-issue-once-and-for-all-24920); [Creative Bloq](https://www.creativebloq.com/news/apple-logo-circles)
- Gizmodo ha titolato un articolo «The golden ratio is a lie» — [Gizmodo](https://gizmodo.com/the-golden-ratio-is-a-lie-1697712767)
- Pepsi, documento Arnell «Breathtaking» (27 pagine, datato 4 agosto 2008): sosteneva che il nuovo globo fosse costruito da due cerchi in rapporto aureo, citava Partenone e Monna Lisa; trapelato nel 2009, alcuni lo ritengono una bufala o una trovata virale; ampiamente ridicolizzato — [Creative Bloq](https://www.creativebloq.com/news/never-forget-that-utterly-ridiculous-pepsi-logo-design-document); [CBS News](https://www.cbsnews.com/news/pepsis-nonsensical-logo-redesign-document-1-million-for-this); [Fortune, 2024](https://fortune.com/2024/05/19/logo-redesign-million-dollars-pepsi/); [Brand New](https://www.underconsideration.com/brandnew_v1/archives/in_brief_the_wrong_kind_of_bre.php); [PDF su archive.org](https://ia902800.us.archive.org/15/items/pepsi-arnell-021109/pepsi-arnell-021109.pdf)
- FedEx: logo di Landor del 1994, freccia nello spazio negativo tra «E» e «X»; Lindon Leader: comunicare il passaggio da A a B con velocità e precisione; una fonte stima che meno di una persona su cinque la trovi da sola — [Creative Bloq](https://www.creativebloq.com/news/fedex-logo-secret); [CNN](https://amp.cnn.com/cnn/style/article/hidden-designs-famous-logos)

**Scale tipografiche modulari**
- Tim Brown, «More Meaningful Typography», A List Apart n. 327, 21 aprile 2011: la scala modulare è una sequenza di numeri legati in modo significativo; esempi con 1:1,618; scale «a doppio filo»; rapporti tratti da geometria, musica, natura e storia; radice in Bringhurst — [A List Apart](https://alistapart.com/article/more-meaningful-typography/)
- Lo strumento Modular Scale di Brown, presentato a Build 2010 — [Product Hunt](https://www.producthunt.com/products/modularscale/launches); strumento simile: [type-scale.com](https://type-scale.com)

**Identità generative**
- MIT Media Lab (Pentagram, Michael Bierut e Aron Fay, 2014): partiti dalla griglia 7×7 del logo di Richard The del 2011; monogramma «ML» e un glifo per ciascuno dei 23 gruppi di ricerca, più icone e un carattere, tutto dalla stessa griglia; le fonti descrivono un sistema a griglia applicato a mano, non un algoritmo — [Dezeen](https://www.dezeen.com/2014/10/29/pentagram-mit-media-lab-rebrand-visual-identity/); [Pentagram](https://www.pentagram.com/work/mit-media-lab)
- Casa da Música, Porto (Sagmeister, 2007; designer Matthias Ernstberger): identità con un'applicazione che sceglie i colori del logo da un'immagine — [Sagmeister](https://sagmeister.com/work/casa-da-musica/); [Cooper Hewitt](https://collection.cooperhewitt.org/objects/18794271/people); [arXiv](https://arxiv.org/pdf/2209.03420v1.pdf)
- Fugue (Sagmeister & Walsh, 2015): logo che si rigenera e si muove con la musica — [It's Nice That](https://www.itsnicethat.com/articles/sagmeister-walsh-fugue); [Dezeen](https://www.dezeen.com/2015/03/22/sagmeister-walsh-animated-visual-identity-logo-fugue-computing-cloud-software/)
- Philharmonie Luxembourg (NB Studio, 2023): identità generativa — [Design Week](https://www.designweek.co.uk/issues/15-may-19-may-2023/nb-studio-philharmonie-luxembourg-identity/)

### Inferences
- La lezione Pepsi/Arnell per MyCity: la geometria sacra funziona come **metodo interno** del designer, ma diventa un boomerang quando la si vende al cliente come causa del successo. Coerente con la regola 4 della sezione 5.
- La lezione FedEx: un simbolo nascosto «riuscito» è dichiarato dall'autore e ha un significato coerente col marchio; non è segreto verso il cliente.
- La lezione MIT/Casa da Música: un'identità derivata dai dati del cliente (nome, anno, colori dalla vetrina) è un precedente nobile e difendibile per «ogni negozio ha il suo motivo unico», purché si spieghi da dove viene.
- Per la tipografia sul web: il rapporto 1,618 cresce troppo in fretta (titolo di livello 4 ≈ 6,85 volte il testo base) e sul telefono genera titoli enormi; meglio φ per proporzioni di layout e una scala più dolce (o fluida con `clamp()` in `rem`) per i caratteri.

### Gaps
- Toyota (tre ellissi, 1989) e Mozilla: non verificati in questa sessione.
- La prima identità del MIT Media Lab (2011, TheGreenEyl / Richard The), quella con un algoritmo che generava varianti uniche per persona: la ricordo ma non l'ho verificata.
- **Prove di efficacia:** non ho trovato studi controllati che mostrino un effetto di proporzioni auree o geometria nascosta su conversioni, fiducia o vendite. Esistono solo smentite (Apple, Gizmodo) e testimonianze di designer.
- Non verificato il testo ufficiale del post Twitter del 2012 sulla costruzione a cerchi.

---

## 7. Test automatici: come provare che lo strato sta dietro al testo, è nascosto alle tecnologie assistive, rispetta il movimento ridotto e non produce numeri o simboli vietati

### Takeaway
Ogni regola sopra si può trasformare in una prova che diventa rossa se il difetto c'è: Playwright con `emulateMedia({ reducedMotion: 'reduce' })`, scansione axe-core con `@axe-core/playwright`, controlli DOM sul nascondimento e sull'ordine di sovrapposizione, misura del contrasto sul pixel peggiore, test delle funzioni generatrici su migliaia di semi per i numeri vietati, e verifica degli errori di idratazione con fusi orari diversi tra server e browser.

### Cited Findings
- `@axe-core/playwright` integra axe nei test Playwright; `AxeBuilder.include()` limita la scansione a una parte della pagina — [Playwright, Accessibility testing](https://playwright.dev/docs/accessibility-testing)
- Playwright emula il movimento ridotto con `await page.emulateMedia({ reducedMotion: 'reduce' })` — [HelpMeTest](https://helpmetest.com/blog/playwright-accessibility-audit-advanced/)
- Il test manuale F83 (pixel più scuro/chiaro dietro al testo, poi lettera per lettera) è la base per misurare il contrasto sopra uno sfondo — [W3C F83](https://www.w3.org/WAI/WCAG22/Techniques/failures/F83)
- Lighthouse riporta i nodi DOM con animazioni non composte e il motivo — [Chrome for Developers](https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations)

### Inferences — prove proposte (ognuna fallisce se il difetto c'è)
1. **Nascosto alle tecnologie assistive:** per ogni elemento `[data-armonia]`, assert `aria-hidden="true"`, nessun `<title>/<desc>/<text>/<a>` dentro, nessun discendente focalizzabile; e lo snapshot dell'albero di accessibilità (in Playwright `toMatchAriaSnapshot`, da verificare sulla versione installata) non contiene lo strato. Più scansione axe senza violazioni.
2. **Dietro al testo:** per ogni blocco di testo visibile, `document.elementFromPoint()` al centro del suo riquadro restituisce il testo o un suo antenato, mai lo strato; lo strato ha `pointer-events: none` calcolato.
3. **Contrasto col motivo:** screenshot della zona dietro a ogni testo prima con lo strato e poi senza; si prende il pixel peggiore sotto il riquadro del testo e si calcola il rapporto WCAG; fallisce sotto 4,5:1 (3:1 per testo grande). Serve perché axe, con immagini di sfondo, tende a non poter calcolare il contrasto (da verificare sul comportamento attuale della regola `color-contrast`).
4. **Movimento ridotto:** con `reducedMotion: 'reduce'`, `document.getAnimations()` filtrate sugli elementi dello strato restituisce zero animazioni in corso; senza emulazione, nessuna animazione infinita dura oltre 5 secondi senza il comando di pausa.
5. **Contrasto forzato:** con `emulateMedia({ forcedColors: 'active' })` lo strato ha `display: none` calcolato.
6. **Numeri e simboli vietati:** test di proprietà (per esempio con fast-check) sulle funzioni pure del generatore: per 10.000 semi (slug di negozi inventati più quelli veri) nessun output contiene 17 come conteggio visibile, ripetizioni, data mostrata o etichetta; nessuna rotazione/griglia produce le forme in lista nera (confronto su forme canoniche dopo normalizzazione).
7. **SEO:** l'HTML servito non contiene testo dentro lo strato; nessun elemento con `opacity: 0` o `font-size: 0` che contenga testo; stesso HTML con user-agent Googlebot e browser.
8. **Prestazioni:** conteggio dei nodi dello strato ≤ budget (sezione 3); peso della tessera ≤ budget; Lighthouse senza «non-composited animations» sullo strato.
9. **Idratazione:** build di produzione, Playwright raccoglie gli errori della console e fallisce su ogni «Hydration failed» / «did not match»; ripetuto con `timezoneId` diversi nel browser (`Europe/Rome`, `America/New_York`, `Asia/Tokyo`) e server con `TZ=UTC`, anche a cavallo della mezzanotte.

### Gaps
- Non ho verificato in sessione la documentazione axe-core sul comportamento della regola `color-contrast` con immagini di sfondo (risultato «incomplete» invece di violazione).
- Non ho verificato la disponibilità di `toMatchAriaSnapshot` e di `forcedColors` in `emulateMedia` sulla versione di Playwright installata nel repo: da controllare prima di scrivere le prove.
- Il riconoscimento automatico di forme vietate «accidentali» (per esempio una svastica che emerge da un motivo a girandola) non ha strumenti pronti trovati: va costruito sul generatore, non sull'immagine.
