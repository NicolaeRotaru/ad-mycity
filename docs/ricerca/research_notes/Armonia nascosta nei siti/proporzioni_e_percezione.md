# Proporzioni sacre, canoni classici e scienza della percezione per i siti web («armonia nascosta»)

> **Come leggere queste note.** Ogni affermazione porta un'etichetta:
> - Storia e tradizione: **[DOCUMENTATO]** (fonte primaria o consenso degli storici) · **[CONTESTATO]** (fonti serie in disaccordo) · **[MITO]** (smentito o senza alcuna prova).
> - Percezione: **[PROVA SOLIDA]** (più studi, replicati) · **[PROVA MODERATA]** (replicata ma con effetti piccoli o dipendenti dal contesto) · **[PROVA DEBOLE / EMERGENTE]** (pochi studi, un solo gruppo di ricerca, o solo laboratorio) · **[AFFERMAZIONE POP]** (circola nel design ma senza studi).
> - Le fonti segnate con **†** le cito dalla conoscenza bibliografica (DOI o URL stabile) e **non le ho aperte in questa sessione**: sono opere note, ma i dettagli vanno ricontrollati prima di citarli all'esterno. In questa sessione `cambridge.org` ed `en.wikipedia.org` erano bloccati dalla rete: le voci Wikipedia sono †.
> - Le «Regole codificabili» alla fine di ogni sezione sono **mie inferenze** dai fatti citati, non risultati di studi.

---

## 1. Sezione aurea (φ ≈ 1,618): cosa è documentato, cosa è mito, cosa dicono gli esperimenti, se migliora usabilità o conversioni

### Takeaway
φ è un oggetto matematico antico e ben documentato (Euclide, ~300 a.C.), ma il suo legame con la bellezza è soprattutto un'invenzione dell'Ottocento (Zeising, 1854). Gli esperimenti trovano al massimo una preferenza **piccola, fragile e dipendente dal metodo**, spesso battuta dalla simmetria (1:1). Non ho trovato nessuna prova seria che un layout aureo migliori usabilità o conversioni; l'unico test controllato su pagine web non ha trovato vantaggi.

### Cited Findings

**Storia documentata**
- **[DOCUMENTATO]** Euclide, *Elementi*, Libro VI, Definizione 3: una retta è divisa «in estrema e media ragione» quando l'intera sta alla parte maggiore come la maggiore sta alla minore. La costruzione è in VI.30 e, in forma di aree, in II.11. Non c'è nessuna estetica in Euclide: è geometria (serve per pentagono e solidi regolari). — [Euclide VI Def. 3, ed. D. Joyce, Clark University †](https://mathcs.clarku.edu/~djoyce/java/elements/bookVI/defVI3.html); [Prop. VI.30 †](https://mathcs.clarku.edu/~djoyce/java/elements/bookVI/propVI30.html); [Prop. II.11 †](https://mathcs.clarku.edu/~djoyce/java/elements/bookII/propII11.html)
- **[DOCUMENTATO]** Luca Pacioli, *De divina proportione*, stampato a **Venezia nel 1509**, con disegni di poliedri di Leonardo. Il libro prende il nome dal rapporto ma, secondo Devlin, **non propone una teoria estetica basata su φ** né la applica ad arte e architettura: per le proporzioni architettoniche Pacioli segue le proporzioni razionali di Vitruvio. L'idea di un Pacioli «profeta dell'aureo» risalirebbe a un'attribuzione sbagliata del 1799. — [Fast Company, «The Golden Ratio: Design's Biggest Myth», 2015](https://www.fastcompany.com/3044877/the-golden-ratio-designs-biggest-myth)
- **[CONTESTATO]** Il punto su Pacioli non è chiuso: un critico fa notare che lo stesso Mario Livio scrive (pp. 132-133 di *The Golden Ratio*) che «Pacioli raves ceaselessly about the properties of the Golden Ratio» — entusiasta della proprietà matematica, non necessariamente un canone per l'arte. — [plus.maths.org, commento su Livio/Devlin](https://plus.maths.org/content/comment/reply/node/7262/comment_node_article/11403); [Fast Company 2015](https://www.fastcompany.com/3044877/the-golden-ratio-designs-biggest-myth)
- **[DOCUMENTATO]** Adolf Zeising (1854, *Neue Lehre von den Proportionen des menschlichen Körpers*) trasforma φ in «legge universale» della bellezza e del corpo umano; Keith Devlin lo chiama «l'equivalente ottocentesco dell'effetto Mozart» e dice che Zeising «vedeva schemi dove non ce n'erano». — [Fast Company 2015](https://www.fastcompany.com/3044877/the-golden-ratio-designs-biggest-myth)
- **[DOCUMENTATO]** Il nome «sezione aurea» (*goldener Schnitt*) compare in Martin Ohm (1835); la lettera φ è introdotta da Mark Barr all'inizio del Novecento. — [Wikipedia, Golden ratio †](https://en.wikipedia.org/wiki/Golden_ratio)
- **[DOCUMENTATO]** φ è irrazionale (1,6180339887…): nel mondo fisico esistono solo approssimazioni, quindi ogni «trovato φ» in un oggetto reale è una misura con tolleranza. — [Fast Company 2015 (Devlin)](https://www.fastcompany.com/3044877/the-golden-ratio-designs-biggest-myth)
- **[DOCUMENTATO]** Uso **dichiarato** di φ nel Novecento: Le Corbusier costruisce il Modulor su serie auree (vedi sezione 3). — [Wikipedia, Modulor](https://en.wikipedia.org/wiki/Modulor)

**Miti**
- **[MITO]** *Grande Piramide*: Markowsky (1992) mostra che il legame si regge su un passo di Erodoto scritto circa 2.000 anni dopo la costruzione, ambiguo e impreciso; le misure sono «solo approssimativamente» auree (anche i sostenitori ammettono che la vicinanza a φ, circa 0,09%, non prova un'intenzione). — [Markowsky, «Misconceptions about the Golden Ratio», *College Mathematics Journal* 23(1):2-19, 1992 (PDF)](https://webarchive.lib.cuhk.edu.hk/20210329125916mp_/http://www.math.cuhk.edu.hk/~pschan/uged1533/markowsky.pdf); [recensione critica di goldennumber.net](https://www.goldennumber.net/golden-ratio-misconceptions-by-george-markowsky-reviewed/?amp)
- **[MITO / CONTESTATO]** *Partenone* (447-432 a.C., prima di Euclide): nessun documento antico parla di φ; per ottenere il rettangolo aureo bisogna scegliere che cosa misurare (con o senza lo stilobate). I sostenitori ribattono che Markowsky «sottrae comodamente lo stilobate». Conclusione onesta: non dimostrato. — [Markowsky 1992](https://webarchive.lib.cuhk.edu.hk/20210329125916mp_/http://www.math.cuhk.edu.hk/~pschan/uged1533/markowsky.pdf); [goldennumber.net](https://www.goldennumber.net/golden-ratio-misconceptions-by-george-markowsky-reviewed/?amp)
- **[MITO]** *Monna Lisa*: il dipinto ha pochissimi elementi lineari da cui misurare con certezza un rapporto; i rettangoli aurei sovrapposti ai disegni di Leonardo sono tracciati «a mano libera». — [goldennumber.net (che pure difende φ)](https://www.goldennumber.net/golden-ratio-misconceptions-by-george-markowsky-reviewed/?amp); [Markowsky 1992](https://webarchive.lib.cuhk.edu.hk/20210329125916mp_/http://www.math.cuhk.edu.hk/~pschan/uged1533/markowsky.pdf)
- **[MITO]** *Conchiglia del nautilo*: è una spirale logaritmica, ma **non** la spirale aurea; lo ammettono anche i siti favorevoli a φ («the spiral of the Nautilus shell does not match this golden spiral»). — [goldennumber.net](https://www.goldennumber.net/golden-ratio-misconceptions-by-george-markowsky-reviewed/?amp)
- **[MITO]** *Logo Apple*: le griglie di cerchi aurei sono sovrapposte a posteriori; qualsiasi forma curva si può «adattare» a cerchi e triangoli. — [Fast Company, «Debunking the Myth of Apple's Golden Ratio»](https://www.fastcompany.com/1672682/debunking-the-myth-of-apple-s-golden-ratio)

**Esperimenti di preferenza estetica**
- **[DOCUMENTATO come storia]** Fechner (1876, *Vorschule der Ästhetik*) è l'origine della tesi «la gente preferisce il rettangolo aureo»; il suo metodo è stato criticato. — [Livio, «The golden ratio and aesthetics», *Plus Magazine*](https://plus.maths.org/golden-ratio-and-aesthetics)
- **[PROVA DEBOLE]** Godkewitsch (1974): la preferenza per il rettangolo aureo era un **artefatto della posizione** del rettangolo al centro della gamma di rettangoli mostrati. Altri lavori attribuiscono l'effetto alla gamma di stimoli e alle «aspettative» indotte dalla procedura. — [riassunto in «The Golden Ratio», academia.edu](https://www.academia.edu/3704076/The_Golden_Ratio); [ResearchGate, «The Golden Section: The "True" Ratio?»](https://researchgate.net/publication/22467947_The_golden_section_the_true_ratio)
- **[PROVA MODERATA, contro φ]** Russell (2000), tre esperimenti sulle divisioni interne di figure: forte preferenza per la divisione **1:1 (simmetria)**, nessuna preferenza per rapporti vicini a φ. — [Russell, «The Aesthetics of Rectangle Proportion: Effects of Judgment Scale and Context» (ResearchGate)](https://www.researchgate.net/publication/12573160_The_Aesthetics_of_Rectangle_Proportion_Effects_of_Judgment_Scale_and_Context) *(ho letto solo il riassunto del motore di ricerca)*
- **[PROVA DEBOLE]** McManus (1980): preferenza di gruppo modesta per rettangoli nella zona 1,5-1,8, con **grandi differenze individuali**. — [McManus, *British Journal of Psychology* 71:505-524 †](https://doi.org/10.1111/j.2044-8295.1980.tb01763.x)
- **[RASSEGNA]** Green (1995), «All that glitters», rassegna di oltre un secolo di studi: l'effetto, se esiste, è piccolo e molto sensibile al metodo. — [Green, *Perception* 24(8):937-968 †](https://doi.org/10.1068/p240937)
- **[PROVA MODERATA, contro φ]** Stieger & Swami (2015), misure implicite (non dichiarate): **nessuna preferenza automatica** per φ in immagini artistiche. — [*Psychology of Aesthetics, Creativity, and the Arts* 9(1):91-100 †](https://doi.org/10.1037/a0038506)
- **[PROVA DEBOLE, a favore]** De Bartolo et al. (2022): preferenza complessiva per φ **lieve, 53%** (p < 0,001), più alta per stimoli che rappresentano esseri umani, sculture antropomorfe e dipinti. 53% contro un 50% di caso è un effetto piccolo. — [*PsyCh Journal*, PMC9787369](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9787369/)
- **[PROVA DEBOLE, dipende dalla cultura]** Replica coreana in product design: preferito il rettangolo **7:10** (1,43), non il 5:8 di Fechner. — [AODR, «Golden Ratio and Korean's Preference Proportion»](https://aodr.org/_common/do.php?a=full&bidx=902&aidx=12027)
- **[PROVA DEBOLE, doppio picco]** Uno studio sul disegno di rettangoli trova due picchi: **1:1 (quadrato)** e una zona larga vicino a φ, e solo dentro una cornice rettangolare. — [riassunto in WebSearch su Plus/academia; vedi Livio, Plus](https://plus.maths.org/golden-ratio-and-aesthetics)
- **[CONTESTATO] Collegamento italiano:** Di Dio, Macaluso & Rizzolatti (Università di Parma, 2007): sculture classiche e rinascimentali con proporzioni «canoniche» (descritte dagli autori come auree) contro versioni deformate; le canoniche attivano l'insula e piacciono di più in giudizio oggettivo. Lo studio però manipola tutto il corpo, non isola φ. — [*PLoS ONE* 2(11):e1201 †](https://doi.org/10.1371/journal.pone.0001201)

**Usabilità e conversioni**
- **[PROVA MODERATA, contro]** Tractinsky, David & Krupnik (AMCIS 2013), esperimento con **91 partecipanti**: ipotesi aurea **confermata per i dispositivi mobili, non per le pagine web**. Misurava preferenza, non conversioni. — [AIS eLibrary, AMCIS 2013](https://aisel.aisnet.org/amcis2013/HumanComputerInteraction/GeneralPresentations/12)
- **[PROVA DEBOLE, contro]** Paul van Schaik: in un test, gli studenti con pagine a proporzione aurea erano **in media alcuni secondi più lenti** e visitavano più pagine per trovare le risposte (riferito di seconda mano, articolo originale non verificato). — [cs4fn, Queen Mary University of London](https://www.cs4fn.org/usability/goldenweb.php)
- **[AFFERMAZIONE POP]** Le promesse di aumenti di conversione «fino al 200%» con φ circolano senza fonte; il blog partner di Shopify presenta φ come leva di conversione senza dati. — [Shopify Partners blog](https://www.shopify.com/partners/blog/5-psychological-concepts-web-designers-should-use-to-maximize-conversions)
- **[AFFERMAZIONE POP]** Una scala tipografica che moltiplica 16px per φ a ogni livello di titolo è «matematicamente pura ma un problema di usabilità»; un'analisi non revisionata di 22 siti trova che i siti migliori **non** usano φ per i titoli ma rapporti più stretti. — [riassunti in WebSearch: blog tionosulis](https://tionosulis.github.io/posts/golden-ratio-web-design/)

### Inferences
- φ si può usare **onestamente** come una delle proporzioni del sistema, per coerenza e per il valore simbolico-culturale (Pacioli e Leonardo sono italiani), ma **non** si può promettere al negoziante che «vende di più» o «piace di più».
- Gli esperimenti dicono che la **simmetria (1:1)** è la proporzione con l'effetto più robusto; un sistema «armonioso» onesto dovrebbe usare il quadrato e la simmetria almeno quanto φ.
- Il vantaggio reale di un sistema di proporzioni non sta nel numero scelto ma nella **coerenza** (vedi sezione 4, fluenza percettiva).

#### Regole codificabili — φ
- Costanti: `--phi: 1.6180339887; --phi-inv: 0.6180339887; --phi-inv2: 0.3819660113;`
- Divisione aurea a due colonne (solo desktop, ≥ 900px circa): `grid-template-columns: 1.618fr 1fr;` → 61,8% / 38,2% dello spazio libero. Su mobile una colonna.
- Formato immagini «auree»: `aspect-ratio: 1.618 / 1;` sta tra 3:2 (1,5, foto) e 16:9 (1,778, video): utilizzabile per hero e card senza ritagli brutali.
- **Non** usare φ come rapporto della scala tipografica su più di 2-3 livelli: da 16px dà 25,9 → 41,9 → 67,8 → 109,7px, troppo grande su un telefono. Alternativa con φ «nascosto»: **√φ ≈ 1,272** come passo, così ogni due gradini si ha esattamente φ (16 → 20,35 → 25,89 → 32,93 → 41,89). È quasi la «terza maggiore» 1,25.
- Testo da dire al cliente (onesto): «proporzioni ispirate alla tradizione italiana di Pacioli e Leonardo», mai «la proporzione che fa comprare».

### Gaps
- Non ho trovato nessun A/B test pubblico e revisionato su φ e conversioni: l'assenza è un dato (nessuna prova), non un «forse funziona».
- Non ho potuto aprire lo studio MDPI *Symmetry* 2024 «Implicit and Explicit Preferences for Golden Ratio» ([link](https://www.mdpi.com/2073-8994/16/3/333)): risultato da verificare.
- Le percentuali esatte di Fechner (spesso riportate: circa 35% di scelte per il rettangolo aureo) e la misura del nautilo di Falbo (rapporto medio circa 1,33) non le ho verificate in questa sessione.
- Twitter/X: la storia del logo «aureo» circola, ma non ho trovato una dichiarazione verificabile dei designer.
- Höge (1997), «The golden section hypothesis — its last funeral» (*Empirical Studies of the Arts*), non verificato in questa sessione.

---

## 2. Fibonacci: il *Liber Abaci* (Pisa, 1202) e dove la successione appare davvero in natura

### Takeaway
La successione 1, 1, 2, 3, 5, 8, 13… è documentata nel *Liber Abaci* di Leonardo Pisano (1202) come esercizio di aritmetica mercantile (il problema dei conigli); il rapporto tra termini vicini tende a φ. In natura la si trova davvero nella **fillotassi** (spirali di semi e foglie), ma non sempre: nel girasole circa 1 testa su 5 non segue Fibonacci.

### Cited Findings
- **[DOCUMENTATO]** Leonardo Pisano detto Fibonacci, *Liber Abaci*, **Pisa 1202** (seconda versione 1228): introduce in Europa le cifre indo-arabe per il commercio e contiene il problema dei conigli da cui nasce la successione. — [Wikipedia, Liber Abaci †](https://en.wikipedia.org/wiki/Liber_Abaci)
- **[DOCUMENTATO]** La successione era già nota in India (Pingala, Virahanka, Hemachandra) secoli prima; il nome «successione di Fibonacci» è ottocentesco (Édouard Lucas). — [Wikipedia, Fibonacci sequence †](https://en.wikipedia.org/wiki/Fibonacci_sequence)
- **[PROVA SOLIDA]** Swinton & Ochu (2016), esperimento di scienza dei cittadini sui girasoli (progetto «Turing's Sunflowers», Manchester): nel sottoinsieme più affidabile, **565 numeri di spirali su 768 (73,6%) sono di Fibonacci**, altri 67 hanno struttura di tipo Fibonacci (in tutto 632 su 768, **82,3%**); è il primo rapporto sistematico di teste **senza** struttura Fibonacci; i numeri «uno sotto» un Fibonacci compaiono più spesso di quelli «uno sopra». — [Royal Society Open Science 3(5), PMC4892450](https://pmc.ncbi.nlm.nih.gov/articles/PMC4892450); [Università di Manchester](https://www.manchester.ac.uk/discover/news/turings-sunflowers-growing-alan-turings-legacy)
- **[DOCUMENTATO]** Il conteggio dipende anche da come si contano le spirali: alcune teste sono troppo disordinate per un conteggio chiaro. — [Plus Magazine, sunflowers](https://plus.maths.org/sunflowers)
- **[DOCUMENTATO]** Lo studio prosegue il lavoro incompiuto di Alan Turing sulla fillotassi di Fibonacci. — [Università di Manchester](https://www.manchester.ac.uk/discover/news/turings-sunflowers-growing-alan-turings-legacy)

### Inferences
- **Collegamento italiano forte e vero:** Pisa, 1202, un mercante-matematico che scrive per i commercianti. Per un sistema pensato per negozi locali è una storia autentica: Fibonacci serviva a far di conto in bottega.
- In natura la regola è «spesso, non sempre» (circa 4 su 5 nel girasole): dire «la natura è tutta Fibonacci» è falso.
- L'angolo aureo (circa 137,5°) è il meccanismo noto della fillotassi; generare motivi decorativi con questo angolo è una citazione della natura **documentata**.

#### Regole codificabili — Fibonacci
- Scala di spaziature: `--s-1: 2px; --s0: 3px; --s1: 5px; --s2: 8px; --s3: 13px; --s4: 21px; --s5: 34px; --s6: 55px; --s7: 89px; --s8: 144px;` (in rem: 0,125 · 0,1875 · 0,3125 · 0,5 · 0,8125 · 1,3125 · 2,125 · 3,4375 · 5,5625 · 9). Compromesso: 13, 21 e 55 non sono multipli di 4 o 8, quindi si rompe la griglia a 8px tipica dei design system; scegliere una delle due logiche, non mescolarle.
- Motivo decorativo «girasole» (fillotassi, modello di Vogel, da mia conoscenza di base †): punto n-esimo a raggio `r = c·√n` e angolo `θ = n × 137.508°`; in SVG o canvas, poche centinaia di punti, opacità bassa (es. 0,06-0,1) dietro il contenuto.
- Numero di elementi in griglie e galleria: 3, 5, 8 (es. 5 foto in evidenza, 8 prodotti) è una scelta simbolica a costo zero; nessuno studio dice che funzioni meglio di 4 o 6.

### Gaps
- Non ho verificato le fonti su monumenti e targhe a Fibonacci a Pisa (statua ottocentesca nel Camposanto): da controllare se si vuole citarle.
- La formula di Vogel (1979) è da mia conoscenza di base, non aperta in questa sessione.

---

## 3. Canoni classici e rinascimentali: Vitruvio, Alberti, Palladio, rapporti musicali pitagorici, *ad quadratum* e *ad triangulum*, vesica piscis, Modulor, canone di Tschichold/Van de Graaf, scale tipografiche modulari

### Takeaway
I canoni storici documentati usano soprattutto **rapporti tra numeri interi piccoli** (1:1, 1:2, 2:3, 3:4, 3:5), presi dalla musica, e la **commensurabilità da un modulo**; φ è quasi assente prima dell'Ottocento (eccezione dichiarata: Le Corbusier, 1948). Il Piacentino ha due legami veri: **Gabriele Stornaloco, matematico di Piacenza**, che nel 1391 propose lo schema *ad triangulum* per il Duomo di Milano, e **Vignola**, autore del Palazzo Farnese di Piacenza e della *Regola* (1562) basata su un modulo.

### Cited Findings

**Vitruvio**
- **[DOCUMENTATO]** Vitruvio, *De architectura* (I sec. a.C.), Libro I, cap. 2: l'architettura dipende da *ordinatio*, *dispositio*, *eurythmia*, *symmetria*, *decor*, *distributio*. In Vitruvio *symmetria* vuol dire **commensurabilità delle parti con un modulo comune**, non simmetria a specchio; *eurythmia* è l'aspetto gradevole che ne risulta. — [Vitruvio, trad. Morgan, Project Gutenberg †](https://www.gutenberg.org/ebooks/20239); [LacusCurtius, Libro I †](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/1*.html)
- **[DOCUMENTATO]** Libro III, cap. 1: il corpo ben proporzionato ha il viso pari a **1/10** dell'altezza, la testa **1/8**, il piede **1/6**, l'avambraccio e il petto **1/4**; con l'ombelico al centro, il corpo a braccia e gambe aperte si inscrive in cerchio e in quadrato. **Nessuna sezione aurea**: sono frazioni intere. — [LacusCurtius, Libro III †](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/3*.html)
- **[DOCUMENTATO]** L'*Uomo vitruviano* di Leonardo (circa 1490) è conservato alle Gallerie dell'Accademia di **Venezia**. — [Wikipedia, Vitruvian Man †](https://en.wikipedia.org/wiki/Vitruvian_Man)

**Alberti**
- **[DOCUMENTATO]** Leon Battista Alberti, *De re aedificatoria* (Firenze, metà Quattrocento): la teoria musicale delle proporzioni è nel **Libro IX, capitoli 5 e 6**; la base comune è l'aritmetica pitagorica, ripresa soprattutto da Nicomaco. — [Gomis Corell, *Ars Longa* (Università di Valencia)](https://ojs.uv.es/index.php/arslonga/article/download/11845/11152); [Cambridge, ARQ, «Renaissance mathematics and architectural proportion in Alberti's De re aedificatoria»](https://www.cambridge.org/core/journals/arq-architectural-research-quarterly/article/renaissance-mathematics-and-architectural-proportion-in-albertis-de-re-aedificatoria/51CB02B4E43D8125DB08C7B714167C7E)
- **[DOCUMENTATO]** Regola albertiana: **non mescolare rapporti** nello stesso edificio (se la lunghezza è doppia della larghezza, l'altezza non va presa da altri rapporti come il triplo). — [Perlego, *The Painter's Secret Geometry*, cap. «The musical consonances»](https://perlego.com/book/112982/the-painters-secret-geometry-a-study-of-composition-in-art-pdf)
- **[DOCUMENTATO]** Alberti usa anche approssimazioni razionali di √2 e √3 (grandezze derivate dal cubo). — [Cambridge ARQ](https://www.cambridge.org/core/journals/arq-architectural-research-quarterly/article/renaissance-mathematics-and-architectural-proportion-in-albertis-de-re-aedificatoria/51CB02B4E43D8125DB08C7B714167C7E)
- **[DOCUMENTATO]** Nel Sepolcro Rucellai (Firenze) Alberti combina il numero degli elementi dei prospetti per richiamare i rapporti musicali armonici. — [Pintore, *Nexus Network Journal*](https://emis.univie.ac.at/journals/NNJ/Pintore.html)

**Rapporti musicali pitagorici**
- **[DOCUMENTATO]** Ottava 2:1, quinta 3:2, quarta 4:3, tono 9:8; la tradizione rinascimentale li trasferisce dall'orecchio all'occhio. — [Gomis Corell, *Ars Longa*](https://ojs.uv.es/index.php/arslonga/article/download/11845/11152)

**Palladio**
- **[DOCUMENTATO]** Palladio, *I quattro libri dell'architettura* (Venezia, 1570), Libro I: sette forme di stanza «più belle e proporzionate»: **cerchio, quadrato, √2:1 (lunghezza = diagonale del quadrato), 4:3, 3:2, 5:3, 2:1**. — [Springer, *Nexus Network Journal*, s00004-022-00632-w](https://link.springer.com/article/10.1007/s00004-022-00632-w); [PDF Cardiff ORCA](https://orca.cardiff.ac.uk/157877/7/s00004-022-00632-w.pdf)
- **[DOCUMENTATO]** Howard & Longair (1982), analisi delle 44 piante del Libro II: circa **2/3 (65-70%) delle misure sono armoniche**, il resto no; √2:1 compare solo **4 volte su oltre 100** casi. Lo spessore dei muri è incluso nei rapporti. — [Howard & Longair, *JSAH* 41(2):116-143, scheda Structurae](https://structurae.net/en/literature/journal-article/harmonic-proportion-and-palladio-s-quattro-libri); [Springer 2022, che riassume i dati](https://link.springer.com/article/10.1007/s00004-022-00632-w)
- **[DOCUMENTATO]** Per le altezze delle stanze Palladio usa le tre medie: aritmetica, geometrica e armonica (Libro I, cap. XXIII). — [Mediateca Palladio Museum, fonte](https://mediateca.palladiomuseum.org/palladio/fonte.php?id=1205) *(pagina vista solo nell'elenco dei risultati)*

***Ad quadratum* e *ad triangulum* (Duomo di Milano, collegamento piacentino)**
- **[DOCUMENTATO]** **Gabriele Stornaloco, matematico di Piacenza**, presentò tra il 24 settembre e il 13 ottobre 1391, con una lettera e un disegno, lo schema per l'alzato del Duomo di Milano basato su **triangoli equilateri** (*ad triangulum*); nel 1392 fu abbandonato per uno basato su **triangoli isosceli** (più bassi). — [Ceriani Sebregondi & Schofield, *Architectural History* 2016, «First Principles: Gabriele Stornaloco and Milan Cathedral» (scheda Structurae)](https://structurae.net/en/literature/journal-article/first-principles-gabriele-stornaloco-and-milan-cathedral); [Cambridge Core reader](https://www.cambridge.org/core/product/A3B34E788582FF50D47EC204A009E017/core-reader) *(non aperto: dominio bloccato; dati dai riassunti)*
- **[CONTESTATO nei dettagli]** Il tedesco Heinrich Parler sosteneva lo schema *ad quadratum*, tipico delle cattedrali d'oltralpe; una fonte divulgativa dice che l'assemblea del 1° maggio 1392 scelse l'*ad triangulum*, mentre l'articolo accademico parla di passaggio ai triangoli isosceli. — [Milanofree, origini del cantiere](https://www.milanofree.it/tradizioni/storia/duomo-di-milano-origini-del-cantiere-1386-veneranda-fabbrica-e-marmo-di-candoglia.html); [Structurae](https://structurae.net/en/literature/journal-article/first-principles-gabriele-stornaloco-and-milan-cathedral)
- **[DOCUMENTATO]** Stornaloco lavorò con Giovannino de Grassi a disegni dell'alzato basati su rapporti geometrici. — [Italian Art Society](https://www.italianartsociety.org/2017/05/painter-architect-and-illuminator-giovannino-de-grassi-is-first-documented-on-5-may-1389-when-the-duomo-of-milan-bought-a-paintbrush-for-him/)
- **[DOCUMENTATO]** Nel 1400 ci fu un secondo dibattito sull'alzato («Ars sine scientia» o «Ars sine geometria»?). — [Ceriani Sebregondi, Zenodo (PDF)](https://zenodo.org/records/7038117/files/10%20-%20(Ars%20sine%20scientia)%20or%20rather%20(Ars%20sine%20geometria)%20The%20debate%20of%201400%20on%20the%20elevation%20of%20Milan%20cathedral.pdf); [indice del libro *Ad triangulum*, Il Poligrafo](https://www.poligrafo.it/sites/default/files/Ad%20triangulum_indice.pdf)

**Vesica piscis**
- **[DOCUMENTATO]** La costruzione di base è la Proposizione I.1 di Euclide: due cerchi di ugual raggio, ciascuno passante per il centro dell'altro, danno il triangolo equilatero; la «mandorla» al centro ha altezza/larghezza = **√3 ≈ 1,732**. — [Euclide I.1, ed. Joyce †](https://mathcs.clarku.edu/~djoyce/java/elements/bookI/propI1.html)
- **[CONTESTATO]** Che le piante delle cattedrali derivino sistematicamente dalla vesica come simbolo sacro è una tesi esoterica moderna; la mandorla come cornice di Cristo nell'arte romanica è invece documentata. — [Wikipedia, Vesica piscis †](https://en.wikipedia.org/wiki/Vesica_piscis)

**Vignola e Piacenza**
- **[DOCUMENTATO]** Jacopo Barozzi da Vignola progettò il **Palazzo Farnese di Piacenza**; il figlio Giacinto offrì a Margherita d'Austria («Madama») otto disegni del palazzo nel maggio 1561; la *Regola delli cinque ordini d'architettura* uscì nel **1562**. — [Frommel, «Vignola e il Palazzo Farnese a Piacenza» (2003), PDF Heidelberg](https://archiv.ub.uni-heidelberg.de/artdok/8279/1/Frommel_Vignola_e_il_Palazzo_Farnese_a_Piacenza_2003.pdf); [Wikipedia, The Five Orders of Architecture](https://en.wikipedia.org/wiki/The_Five_Orders_of_Architecture)
- **[DOCUMENTATO]** Il metodo della *Regola*: il **modulo è il raggio del fusto** della colonna alla base, diviso in **12 parti** per tuscanico e dorico e **18 parti** per gli altri ordini; tutto l'ordine si ricava da questo modulo. — [FrancoAngeli Open Access (saggio su Caprarola)](https://series.francoangeli.it/index.php/oa/catalog/download/1180/1103/6618?inline=1)

**Le Corbusier, Modulor (1948)**
- **[DOCUMENTATO]** Serie rossa (cm) **27, 43, 70, 113, 183**; serie blu **86, 140, 226** (il doppio della rossa). Versione rivista basata su un uomo di 6 piedi (182,88 ≈ 183 cm): ombelico a 113, mano alzata a 226; la prima versione usava 175 cm (ombelico 108, mano alzata 216). Tra termini vicini il rapporto è φ. — [Wikipedia, Modulor](https://en.wikipedia.org/wiki/Modulor); [commento matematico al Modulor, Scribd (non revisionato)](https://www.scribd.com/document/707597880/Modulor-oct19final)

**Canone della pagina (Van de Graaf, Tschichold)**
- **[DOCUMENTATO come ricostruzione]** Il canone di Van de Graaf (1946), reso popolare da Tschichold (*The Form of the Book*), su pagina **2:3** dà margini di **1/9** (interno e alto) e **2/9** (esterno e basso); il blocco di testo ha le stesse proporzioni della pagina. Rosarivo arriva allo stesso risultato con la divisione in noni; una griglia 9×9 dà lo stesso esito. — [Wikipedia, Canons of page construction](https://en.wikipedia.org/wiki/Canons_of_page_construction)
- **[CONTESTATO]** Che il canone sia stato davvero usato nei manoscritti medievali si basa su fonti secondarie; gli stessi autori Wikipedia citano l'originale del 1946 «come riportato da Tschichold». Per la pagina 2:3 i margini interno:alto:esterno:basso stanno come **2:3:4:6**. — [Wikipedia, Canons of page construction](https://en.wikipedia.org/wiki/Canons_of_page_construction)

**Scale tipografiche modulari**
- **[DOCUMENTATO come pratica]** Tim Brown (*A List Apart*, 2011) propone scale tipografiche costruite moltiplicando una dimensione base per un rapporto fisso, anche con due basi intrecciate. — [Tim Brown, «More Meaningful Typography», A List Apart †](https://alistapart.com/article/more-meaningful-typography/)
- **[DOCUMENTATO come pratica]** Rapporti con nome musicale usati nel web: seconda minore 1,067 · seconda maggiore 1,125 · terza minore 1,2 · **terza maggiore 1,25** · **quarta giusta 1,333** · quarta aumentata 1,414 · **quinta giusta 1,5** · aureo 1,618. — [Type Scale (typescale.com) †](https://typescale.com/)

### Inferences
- **Correzione importante per il sistema:** la «simmetria» di Vitruvio non è lo specchio ma il **modulo comune**. In CSS vuol dire una variabile radice da cui derivano tutte le misure: è la traduzione più fedele e anche la più utile.
- I rapporti di Alberti e Palladio **coincidono con i formati media standard**: 1:1 (post quadrato), 3:4 / 4:3 (foto e tablet), 2:3 / 3:2 (foto 35mm), 9:16 / 16:9 (video e storie), √2 (carta A4, ISO 216 †). L'armonia rinascimentale si può nascondere nei formati senza costo tecnico.
- Da mia conoscenza di base (Wittkower 1949 †, **da verificare sul testo**): Alberti, Libro IX cap. 6, elenca rapporti di superficie «brevi» 1:1, 2:3, 3:4; «medi» 1:2, 4:9, 9:16; «lunghi» 1:3, 3:8, 1:4. Le ricerche di questa sessione confermano il quadro (cap. 5-6, aritmetica pitagorica) ma non l'elenco esatto.
- La griglia a 12 colonne del web ha la stessa logica del modulo di Vignola diviso in 12 parti: 12 si divide per 2, 3, 4 e 6.
- Palladio è un buon promemoria di onestà: anche il maestro dei rapporti armonici ne usa solo circa 2 su 3. Un sistema che pretende il 100% di rapporti «sacri» è più rigido di Palladio.

#### Regole codificabili — canoni
- **Modulo vitruviano:** `--u: 0.5rem;` (8px) e ogni misura come multiplo intero o frazione semplice: `calc(var(--u) * 3)`. Una sola radice per sito.
- **Formati albertiani-palladiani** (decimali): 1:1 = 1 · 4:3 = 1,333 · 3:2 = 1,5 · 5:3 = 1,667 · √2 = 1,414 · 16:9 = 1,778 · 9:4 = 2,25 · 2:1 = 2. In CSS: `aspect-ratio: 3 / 2;` e così via.
- **Regola di Alberti:** un **rapporto principale per pagina** (es. tutta la pagina in 2:3/3:2), non cinque rapporti diversi.
- **Medie di Palladio** per le dimensioni intermedie tra due misure scelte. Esempio corpo 16px e titolo principale 40px: media aritmetica 28px, **geometrica √(16×40) = 25,3px**, armonica 2·16·40/56 = 22,9px. In CSS moderno: `font-size: calc(sqrt(16 * 40) * 1px);` (le funzioni `sqrt()`/`pow()` del CSS Values Level 4 sono supportate dai browser recenti, dal 2023 circa †).
- **Ad quadratum** = progressione per √2 (1,414: è la «quarta aumentata» delle scale tipografiche): 16 → 22,6 → 32 → 45,3 → 64px. Ogni quadrato inscritto ruotato di 45° ha lato `s/√2`.
- **Ad triangulum (omaggio a Stornaloco):** altezza = base × **0,8660** (√3/2). Es. sezione hero larga 1200px con altezza ideale 1039px; su mobile `min-height` limitata. Forma triangolare: `clip-path: polygon(50% 0, 100% 86.6%, 0 86.6%);`
- **Vesica / arco equilatero:** rapporto altezza/larghezza **1,732**; arco a sesto acuto equilatero con centri sulle imposte e raggio uguale alla luce. In CSS una cornice «a mandorla» si ottiene come intersezione di due cerchi in SVG (`<clipPath>`).
- **Modulor a due fili** (alla Tim Brown): due serie φ, la seconda a base doppia. Esempio in px: rossa 10, 16, 26, 42, 68; blu 20, 32, 52, 84. Insieme danno gradini più fitti (10, 16, 20, 26, 32, 42…).
- **Canone di Van de Graaf in CSS** (contenitore 2:3, percentuali della larghezza perché nel CSS il padding in % si calcola sempre sulla larghezza †): `aspect-ratio: 2/3; padding: 16.667% 22.222% 33.333% 11.111%;` (alto, esterno, basso, interno su pagina destra). Il blocco di testo risulta largo 2/3 della pagina e alto quanto la larghezza della pagina. Adatto a PDF stampabili (menù, listino) e a «schede» decorative, non alla colonna di lettura sul telefono.
- **Scala tipografica musicale:** `--ratio: 1.25;` (terza maggiore) per siti con molto testo, 1,333 (quarta) per desktop, 1,5 (quinta) solo per pagine con pochi livelli; `--step-n: calc(1rem * pow(var(--ratio), n));`. Suggerito anche il rapporto fluido tra mobile e desktop (es. 1,2 → 1,25 con `clamp()`, approccio Utopia †).

### Gaps
- Numeri esatti del Duomo di Milano (larghezza 96 braccia, modulo di 16, altezza proposta da Stornaloco circa 84 braccia): li ricordo dalla letteratura (Ackerman 1949 †) ma non li ho verificati; l'articolo di Cambridge era bloccato.
- Le misure del Palazzo Farnese di Piacenza in moduli vignoleschi: non trovate (esiste un saggio di L. Giannelli, 2007, «La Regola di Vignola 1562 e la fabbrica del palazzo Farnese di Piacenza», non letto).
- Nessuna analisi proporzionale affidabile trovata per il Duomo romanico di Piacenza o per Sant'Antonino.
- Elenco esatto dei rapporti di Alberti (vedi Inferences): da verificare sul testo o su Wittkower.

---

## 4. Scienza della percezione: fluenza, simmetria, frattali, prototipicità e complessità, primi 50 ms, Gestalt, spazi bianchi e leggibilità, armonia dei colori, design biofilico

### Takeaway
Le prove più solide per un sito non riguardano i numeri «sacri» ma la **facilità di elaborazione**: il giudizio estetico si forma in 17-50 ms; piacciono i siti **poco complessi e prototipici** (come ci si aspetta che sia un sito di quel tipo); la coerenza, il contrasto, la simmetria e il raggruppamento chiaro aumentano la fluenza e il gradimento; la leggibilità ha soglie misurabili (WCAG). I frattali con dimensione 1,3-1,5 hanno risultati promettenti ma vengono quasi tutti da un solo gruppo di ricerca.

### Cited Findings

**Fluenza percettiva**
- **[PROVA SOLIDA]** Reber, Schwarz & Winkielman (2004): la bellezza dipende in parte dalla **facilità con cui il cervello elabora** lo stimolo; simmetria, contrasto, chiarezza, «buona forma», prototipicità e ripetizione aumentano la fluenza, e la fluenza viene vissuta come piacevole. — [*Personality and Social Psychology Review* 8(4):364-382 †](https://doi.org/10.1207/s15327957pspr0804_3)
- **[PROVA SOLIDA]** Reber, Winkielman & Schwarz (1998): aumentare la fluenza percettiva (es. con contrasto o breve esposizione preliminare) aumenta il gradimento. — [*Psychological Science* 9(1):45-48 †](https://doi.org/10.1111/1467-9280.00008)

**Primo impatto, complessità, prototipicità**
- **[PROVA SOLIDA]** Lindgaard et al. (2006): il giudizio di gradimento visivo di una pagina si forma in **50 ms** ed è molto coerente con quello dato dopo 500 ms. — [*Behaviour & Information Technology* 25(2):115-126 †](https://doi.org/10.1080/01449290500330448)
- **[PROVA SOLIDA]** Tuch et al. (2012, Google): **119 screenshot** di siti reali, complessità visiva (bassa/media/alta) × prototipicità (bassa/alta), esposizioni di 50/500/1000 ms e poi **17/33/50 ms**. I siti con **bassa complessità e alta prototipicità** sono i più belli; a 17 ms pesa più la complessità, con il tempo la prototipicità diventa altrettanto importante. — [Google Research, pubblicazione](https://research.google/pubs/the-role-of-visual-complexity-and-prototypicality-regarding-first-impression-of-websites-working-towards-understanding-aesthetic-judgments/); [Google Research blog 2012](https://research.google/blog/users-love-simple-and-familiar-designs-why-websites-need-to-make-a-great-first-impression/)
- **[PROVA MODERATA]** Replica (tesi Università di Twente, 2018): effetto negativo della complessità alta e positivo della prototipicità alta confermato sia a 500 ms sia a 50 ms. — [Twente, essay 74417](https://essay.utwente.nl/74417)
- **[PROVA SOLIDA]** Tuch et al. (2009): la complessità visiva alta di un sito riduce il piacere e aumenta l'attivazione fisiologica. — [*International Journal of Human-Computer Studies* 67(9):703-715 †](https://doi.org/10.1016/j.ijhcs.2009.04.002)
- **[PROVA SOLIDA]** Reinecke & Gajos (CHI 2014): **2,4 milioni di valutazioni** da quasi **40.000 partecipanti** su **430 siti**. Il livello ideale di colore e complessità **varia molto** tra gruppi: chi ha più istruzione preferisce siti meno colorati e meno complessi; finlandesi e russi sono tra i più penalizzati dalla complessità; i macedoni preferiscono i siti più colorati; le donne gradiscono di più i colori saturi. — [Harvard, Gajos, pagina del paper](https://eecs.harvard.edu/~kgajos/papers/2014/reinecke14visual.shtml); [PDF](https://kgajos.seas.harvard.edu/papers/reinecke14visual.pdf)
- **[PROVA SOLIDA]** Reinecke et al. (CHI 2013): complessità percepita e colore, misurati da un algoritmo, prevedono il primo impatto estetico di un sito. — [PDF CHI 2013](https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf)
- **[PROVA MODERATA]** Effetto «bello quindi usabile»: le interfacce più belle vengono giudicate più facili da usare (Tractinsky et al. 2000), con effetti sulla tolleranza ai piccoli problemi. — [*Interacting with Computers* 13(2):127-145 †](https://doi.org/10.1016/S0953-5438(00)00031-X); [Nielsen Norman Group, Aesthetic-Usability Effect †](https://www.nngroup.com/articles/aesthetic-usability-effect/)

**Simmetria e curve**
- **[PROVA MODERATA]** Nelle divisioni di figure la simmetria (1:1) è un determinante principale della preferenza, più di φ (Russell 2000). — [ResearchGate](https://www.researchgate.net/publication/12573160_The_Aesthetics_of_Rectangle_Proportion_Effects_of_Judgment_Scale_and_Context)
- **[PROVA MODERATA]** Bar & Neta (2006): gli oggetti con **contorni curvi** sono preferiti a quelli con angoli acuti. — [*Psychological Science* 17(8):645-648 †](https://doi.org/10.1111/j.1467-9280.2006.01759.x)

**Frattali (Richard Taylor, Università dell'Oregon)**
- **[PROVA DEBOLE / EMERGENTE]** Taylor (2006): recupero dallo stress **migliore del 60%** (misurato con la conduttanza cutanea) guardando immagini con dimensione frattale **D tra 1,3 e 1,5**. È una misura relativa di laboratorio, non un esito clinico; è l'unico studio in cui i frattali erano stampati in grande (circa 1 × 2 m) su una parete. — [Taylor, *Leonardo* 39(3), 2006 (PDF)](https://is.muni.cz/el/phil/podzim2015/DU2727/Taylor_Reduction_Stress_Using_Fractal_Art_and_Architecture_2006.pdf?lang=en); [Smithsonian / The Conversation](https://www.smithsonianmag.com/innovation/fractal-patterns-nature-and-art-are-aesthetically-pleasing-and-stress-reducing-180962738/)
- **[PROVA MODERATA]** La preferenza per frattali di complessità media (D 1,3-1,5) è stata trovata più volte, anche in uno studio con circa 5.000 partecipanti. — [Abboushi et al., CUNY Manifold](https://cuny.manifoldapp.org/read/investigating-the-visual-interest-and-mood-response); [Spehar et al. 2003, «Universal aesthetic of fractals», *Computers & Graphics* 27(5) †](https://doi.org/10.1016/S0097-8493(03)00154-7)
- **[CONTESTATO]** Il modello della «fluenza frattale» (Taylor & Spehar 2016): il sistema visivo sarebbe adattato a elaborare facilmente i frattali naturali di complessità media. Taylor stesso ammette che non c'è ancora una prova diretta che guardare frattali faccia guarire: si arriva al legame «sommando» studi diversi. — [Smithsonian / The Conversation](https://www.smithsonianmag.com/innovation/fractal-patterns-nature-and-art-are-aesthetically-pleasing-and-stress-reducing-180962738/); [Taylor, capitolo 2024 (PDF, blog UO)](https://blogs.uoregon.edu/richardtaylor/files/2024/04/978-3-031-47606-8_45-930c4fed1c89f1c2.pdf)
- **[RASSEGNA]** Taylor (2021), rassegna sui frattali biofilici e salute/prestazioni. — [*Sustainability* 13(2):823 †](https://www.mdpi.com/2071-1050/13/2/823)

**Gestalt, spazi bianchi, leggibilità**
- **[PROVA SOLIDA]** Un secolo di ricerca sulla Gestalt conferma i principi di raggruppamento (vicinanza, somiglianza, continuità, chiusura) e di figura-sfondo. — [Wagemans et al. 2012, *Psychological Bulletin* 138(6):1172-1217 †](https://doi.org/10.1037/a0029333); [NN/g, Proximity †](https://www.nngroup.com/articles/gestalt-proximity/)
- **[PROVA SOLIDA, norma]** WCAG 2.1, criterio 1.4.8 (AAA): righe **non più larghe di 80 caratteri**; interlinea **almeno 1,5** nei paragrafi; spazio tra paragrafi almeno **1,5 volte** l'interlinea. — [W3C, Understanding 1.4.8 †](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)
- **[PROVA SOLIDA, norma]** WCAG 2.1, criterio 1.4.12 (AA): il sito non deve rompersi se l'utente imposta interlinea **1,5**, spazio paragrafi **2×** il corpo, spaziatura lettere **0,12em**, parole **0,16em**. — [W3C, Understanding 1.4.12 †](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)
- **[PROVA MODERATA]** Lunghezza della riga: in stampa 45-75 caratteri, 66 ideale; su schermo si legge **più veloce con righe lunghe** (velocità massima a circa 95 caratteri, minima a 35) ma la gente **preferisce** righe corte o medie (45-72); la comprensione sembra massima con righe medie, anche se alcuni studi non trovano effetti. — [Wikipedia, Line length](https://en.wikipedia.org/wiki/Line_length); [Weinschenk, *100 Things Every Designer Needs to Know*, cap. 18 (O'Reilly)](https://oreilly.com/library/view/100-things-every/9780132658638/ch18.html); [Nanavati & Bias, «Optimal Line Length in Reading — A Literature Review», *Visible Language*](https://journals.uc.edu/index.php/vl/article/view/5765); [Dyson & Haselgrove 2001, *IJHCS* 54(4) †](https://doi.org/10.1006/ijhc.2001.0458)
- **[AFFERMAZIONE POP]** «Lo spazio bianco aumenta la comprensione del 20%»: circola nei blog di design; non ho trovato lo studio originale verificabile.

**Armonia dei colori**
- **[PROVA SOLIDA]** Palmer & Schloss (2010), teoria della valenza ecologica: un colore piace quanto piacciono gli oggetti a cui è associato (blu = cielo e acqua pulita, piacciono; marroni e gialli scuri = cibo marcio ed escrementi, non piacciono). Il modello spiega **l'80% della varianza** delle preferenze medie e batte i modelli basati su coni, aspetto e emozione del colore. — [PNAS 107(19):8877-8882, PMC2889342](https://pmc.ncbi.nlm.nih.gov/articles/PMC2889342); [PubMed](https://pubmed.ncbi.nlm.nih.gov/20421475/)
- **[PROVA MODERATA]** Schloss & Palmer (2011): l'armonia percepita di una coppia sale con la **somiglianza di tinta**; la preferenza per una coppia dipende anche dal contrasto di luminosità. — [*Attention, Perception & Psychophysics* 73:551-571 †](https://doi.org/10.3758/s13414-010-0027-0)
- **[PROVA MODERATA]** Ou & Luo (2006): modello quantitativo dell'armonia di coppie di colori basato su tre componenti (effetto cromatico, effetto della luminosità, effetto della tinta). — [*Color Research & Application* 31(3):191-204 †](https://doi.org/10.1002/col.20208); citato come lavoro sulle emozioni del colore in [Palmer & Schloss 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2889342)

**Design biofilico**
- **[DOCUMENTATO come quadro, PROVA VARIABILE]** Terrapin Bright Green (2014), «14 Patterns of Biophilic Design»: tra i modelli, connessione visiva con la natura, forme biomorfe, **complessità e ordine** (frattali). Per l'architettura; non specifico per lo schermo. — [Terrapin Bright Green, 14 Patterns †](https://www.terrapinbrightgreen.com/reports/14-patterns/)

### Inferences
- Il **meccanismo scientifico** con cui un'«armonia nascosta» può funzionare davvero è la fluenza: un solo modulo, un solo rapporto, ritmi ripetuti e allineamenti coerenti rendono la pagina più facile da elaborare. Il numero specifico (φ, 3:2, √2) conta molto meno della coerenza.
- **Rischio serio:** un'armonia che rompe la prototipicità (navigazione circolare, telefono nascosto, impaginazioni «mistiche») abbassa il gradimento nei primi 50 ms. La geometria deve restare **sotto** una struttura prevedibile: logo e nome in alto a sinistra, menu in alto, telefono, indirizzo, orari, foto e prodotti dove ci si aspetta.
- La valenza ecologica suggerisce (mia inferenza, non testata) che i marroni caldi di un forno o di una gastronomia piacciano **nel contesto** del pane e della crosta; vanno usati come accenti legati a un oggetto riconoscibile, non come grandi campiture neutre.
- Per Piacenza: le preferenze cambiano per età, istruzione e paese (Reinecke & Gajos); un pubblico locale con molti adulti e anziani suggerisce complessità bassa e colori moderati, ma l'Italia non compare nei risultati che ho visto.

#### Regole codificabili — percezione
- **Colonna di lettura:** `max-width: 65ch;` (fascia 45-75; mai oltre 80 caratteri, WCAG 1.4.8). L'unità `ch` è la larghezza della cifra «0» †: con caratteri proporzionali 65ch mostrano in media un po' più di 65 lettere, quindi meglio 60-65ch.
- **Interlinea:** corpo `line-height: 1.5` - `1.6`; titoli 1,1-1,25. Spazio tra paragrafi `margin-block: 1em` o più (WCAG: ≥ 1,5× l'interlinea per l'AAA). Verificare che il layout regga `letter-spacing: 0.12em; word-spacing: 0.16em; line-height: 1.5;` (test 1.4.12).
- **Complessità bassa nel primo schermo:** un messaggio, una foto, una chiamata all'azione (es. «Chiama» / «Ordina»), al massimo 5-7 elementi distinti sopra la piega. Nessun motivo decorativo deve competere col contenuto.
- **Prototipicità:** struttura standard per negozio locale (intestazione con nome e telefono, orari, mappa/indirizzo, foto, prodotti o menù, contatti nel piè di pagina). L'armonia agisce su misure e ritmi, **non** sulla posizione degli elementi.
- **Gestalt:** spazio tra gruppi almeno 2× lo spazio dentro il gruppo (es. 8px dentro una card, 16-24px tra le card, 48-96px tra le sezioni), sempre dalla stessa scala.
- **Simmetria:** composizioni centrate per hero e pagine «firma»; allineamento a sinistra per il testo lungo (si legge meglio).
- **Curve:** `border-radius` moderato e coerente (es. 8-16px, oppure il 50% per elementi circolari), un solo raggio per sito o due al massimo.
- **Colore:** palette da una famiglia di tinte vicine (in OKLCH tinta fissa ±30°) con passi di luminosità ampi; contrasto testo/sfondo ≥ **4,5:1** (WCAG 1.4.3 †). Evitare grandi superfici giallo-oliva scuro.
- **Frattali (uso prudente):** texture o illustrazioni naturali (foglie, nuvole, colline piacentine) con complessità media, stimata D 1,3-1,5 col metodo del box-counting; a bassa opacità e mai dietro al testo. Promessa consentita: «immagini naturali di complessità media, gradite negli studi»; promessa vietata: «riduce lo stress del 60%».

### Gaps
- Nessuno studio trovato che misuri l'effetto dei frattali o del design biofilico **sullo schermo di un sito** (gli studi sono su stampe, ambienti, laboratorio).
- Dati specifici per l'Italia nel dataset di Reinecke & Gajos: non verificati (il dataset è pubblico, si potrebbe interrogare).
- La fonte originale della cifra «20% di comprensione in più con lo spazio bianco» non è stata trovata.
- Bar & Neta 2006, Tuch 2009, Ou & Luo 2006, Schloss & Palmer 2011, Lindgaard 2006, Reber 2004 sono † (non aperti in questa sessione): i numeri citati sono quelli noti dagli abstract.

---

## 5. Quali di questi sistemi danno un beneficio reale e misurabile al visitatore di un sito di un piccolo negozio, e quali sono solo simbolici

### Takeaway
Il beneficio misurabile viene da **leggibilità, bassa complessità, prototipicità, contrasto e coerenza** (prove solide, in parte norme WCAG). Simmetria, curve e armonia dei colori hanno prove moderate. I frattali sono promettenti ma ancora emergenti. La sezione aurea, Fibonacci, la vesica, *ad quadratum*/*ad triangulum* e i rapporti musicali sono **simbolici**: utili come sistema coerente e come storia italiana autentica, non come leva di vendita dimostrata.

### Cited Findings
- **[PROVA SOLIDA]** Primo impatto in 17-50 ms guidato da complessità e prototipicità. — [Google Research, Tuch et al. 2012](https://research.google/pubs/the-role-of-visual-complexity-and-prototypicality-regarding-first-impression-of-websites-working-towards-understanding-aesthetic-judgments/); [Lindgaard et al. 2006 †](https://doi.org/10.1080/01449290500330448)
- **[PROVA SOLIDA]** Le preferenze di colore e complessità cambiano tra gruppi demografici. — [Reinecke & Gajos 2014](https://eecs.harvard.edu/~kgajos/papers/2014/reinecke14visual.shtml)
- **[PROVA SOLIDA, norma]** Soglie di leggibilità e spaziatura. — [W3C 1.4.8 †](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html); [W3C 1.4.12 †](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)
- **[PROVA SOLIDA]** La fluenza (simmetria, contrasto, chiarezza, prototipicità, ripetizione) produce gradimento. — [Reber et al. 2004 †](https://doi.org/10.1207/s15327957pspr0804_3)
- **[PROVA DEBOLE / NESSUNA]** φ nelle pagine web: nessun vantaggio estetico (Tractinsky et al. 2013), forse più lento nei compiti (van Schaik, di seconda mano), nessun dato sulle conversioni. — [AMCIS 2013](https://aisel.aisnet.org/amcis2013/HumanComputerInteraction/GeneralPresentations/12); [cs4fn](https://www.cs4fn.org/usability/goldenweb.php)
- **[PROVA DEBOLE / EMERGENTE]** Frattali D 1,3-1,5: preferenza replicata, riduzione dello stress da pochi studi di un gruppo. — [Taylor 2006 (PDF)](https://is.muni.cz/el/phil/podzim2015/DU2727/Taylor_Reduction_Stress_Using_Fractal_Art_and_Architecture_2006.pdf?lang=en)

### Inferences

**Tabella di sintesi (mia classificazione dalle fonti sopra)**

| Sistema | Beneficio misurabile per il visitatore | Etichetta | Uso nel sistema «armonia nascosta» |
|---|---|---|---|
| Colonna 45-75 caratteri, interlinea 1,5, spaziature WCAG | Lettura più comoda, accessibilità | PROVA SOLIDA | Obbligatorio |
| Bassa complessità + struttura prototipica | Primo impatto migliore in 50 ms | PROVA SOLIDA | Obbligatorio; la geometria non deve spostare gli elementi attesi |
| Coerenza da un modulo unico (Vitruvio, Vignola) | Fluenza → gradimento | PROVA SOLIDA (meccanismo) | Il cuore tecnico dell'armonia |
| Gestalt (vicinanza, gruppi) | Comprensione della pagina | PROVA SOLIDA | Spazi dalla scala unica |
| Contrasto testo/sfondo | Leggibilità, accessibilità | PROVA SOLIDA, norma | Obbligatorio (≥ 4,5:1) |
| Simmetria nelle composizioni | Gradimento | PROVA MODERATA | Hero e pagine firma |
| Curve morbide | Gradimento | PROVA MODERATA | Raggio unico |
| Tinte vicine + contrasto di luminosità; valenza ecologica | Armonia percepita | PROVA MODERATA | Palette |
| Frattali D 1,3-1,5, immagini naturali | Gradimento; stress (da confermare) | EMERGENTE | Texture leggere, mai promesse di salute |
| Rapporti di Alberti/Palladio (1:1, 3:4, 2:3, 1:2, 9:16, √2) | Nessuno dimostrato in sé; coincidono coi formati media | SIMBOLICO, utile | Formati di immagini e sezioni |
| Scale tipografiche musicali (1,25 / 1,333 / 1,5) | Gerarchia chiara (dalla coerenza, non dal nome) | SIMBOLICO + pratica di settore | Scala dei titoli |
| φ (1,618) e Fibonacci | Nessuno dimostrato; preferenza lieve e instabile | SIMBOLICO | Una proporzione tra le altre, con storia italiana vera |
| *Ad quadratum* (√2), *ad triangulum* (0,866), vesica (1,732) | Nessuno dimostrato | SIMBOLICO | Omaggi decorativi (Stornaloco piacentino) |
| Numerologia, significati «sacri» dei numeri | Nessuno | SIMBOLICO / non verificabile | Solo racconto, mai dichiarato come fatto |

- **Mappa dei collegamenti italiani autentici** da raccontare: Pisa (Fibonacci, 1202) · Firenze (Alberti) · Venezia (Pacioli 1509; *Uomo vitruviano* all'Accademia; *Quattro libri* di Palladio, 1570) · Vicenza (Palladio) · **Milano e Piacenza (Stornaloco, 1391)** · **Piacenza (Vignola, Palazzo Farnese; *Regola* 1562)** · Parma (Rizzolatti 2007, neuroscienze della bellezza classica).
- **Formula onesta per i clienti:** «Il sito è costruito su un sistema di proporzioni coerente, ispirato alla tradizione italiana (Fibonacci, Alberti, Palladio, Vignola) e alle regole di leggibilità verificate dalla ricerca». Non dire: «la sezione aurea fa vendere di più», «riduce lo stress del 60%», «il Partenone/la Gioconda usano φ».
- **Priorità per chi costruisce:** prima le regole con prova solida (leggibilità, complessità, prototipicità, contrasto, modulo unico), poi le proporzioni simboliche dentro quei vincoli. Se una proporzione «sacra» peggiora la leggibilità su telefono (es. scala φ sui titoli), vince la leggibilità.

#### Regole codificabili — sintesi in un blocco di token (esempio, mia proposta)
```css
:root{
  /* modulo vitruviano / vignolesco: una sola radice */
  --u: 0.5rem;                 /* 8px */
  /* proporzioni simboliche disponibili */
  --phi: 1.6180339887;         /* Pacioli */
  --sqrt-phi: 1.2720196495;    /* due gradini = phi */
  --sqrt2: 1.4142135624;       /* ad quadratum, carta A4 */
  --tri: 0.8660254038;         /* ad triangulum (Stornaloco) */
  --vesica: 1.7320508076;      /* Euclide I.1 */
  /* scala tipografica: un solo rapporto per sito (Alberti) */
  --ratio: 1.25;               /* terza maggiore; 1.333 su desktop */
  --step-0: 1rem;
  --step-1: calc(var(--step-0) * var(--ratio));
  --step-2: calc(var(--step-1) * var(--ratio));
  --step-3: calc(var(--step-2) * var(--ratio));
  /* leggibilità (prove solide / WCAG) */
  --measure: 65ch;
  --leading: 1.55;
  --leading-tight: 1.15;
  --radius: 12px;              /* curve: un solo raggio */
}
.prosa{max-width:var(--measure);line-height:var(--leading)}
.split-aureo{display:grid;grid-template-columns:1fr}
@media (min-width:56rem){.split-aureo{grid-template-columns:1.618fr 1fr}}
.foto{aspect-ratio:3/2}       /* Palladio 3:2 = formato foto */
.storia{aspect-ratio:9/16}    /* Alberti 9:16 = formato storie */
```

### Gaps
- Nessuna prova trovata, in nessuna direzione, sull'effetto delle proporzioni simboliche sulle **vendite** di piccoli negozi: un test A/B vero sui siti MyCity sarebbe il primo dato.
- Non verificato se i token proposti reggono a 320px di larghezza con i testi italiani reali (parole lunghe): va provato sul sito.
- Domini bloccati in questa sessione: `cambridge.org` (articolo su Stornaloco, articolo ARQ su Alberti) ed `en.wikipedia.org`; vanno abilitati nelle impostazioni di rete della sessione per verificare i dettagli †.
