# Numeri e cielo: numerologia, astrologia e calendari calcolabili per la "firma nascosta" di un'attività di Piacenza

Legenda delle etichette usate in tutto il file (vincolo del mandato: distinguere i tre livelli):
**[Storia]** = fatto storico documentato · **[Regola interna]** = regola interna a una tradizione (vera *dentro* quella tradizione, non un fatto sul mondo) · **[Invenzione moderna]** = convenzione nata nel XIX–XX secolo o più tardi · **[Calcolato qui]** = numero calcolato in questa sessione con script Python che implementano gli algoritmi di Meeus (copie in `/tmp/claude-0/-home-user/a23f2eec-5f33-5f45-a765-db04ca30e599/scratchpad/calc/cielo.py` e `/tmp/claude-0/-home-user/a23f2eec-5f33-5f45-a765-db04ca30e599/scratchpad/calc/ore_numeri.py`; la cartella scratchpad può essere svuotata) · **[Dominio]** = conoscenza di dominio corrente che NON ho potuto verificare su una fonte in questa sessione (da ricontrollare prima di farne un fatto).
Nota di rete: in questa sessione `en.wikipedia.org`, `www.adl.org` ed `eclipse.gsfc.nasa.gov` erano irraggiungibili per WebFetch; le affermazioni da queste fonti arrivano dagli estratti del motore di ricerca, non dalla pagina letta per intero. Treccani non è comparsa nei risultati.

## 1. Numerologia occidentale: pitagorica contro caldea, numeri maestri, numero del cammino di vita

### Takeaway
Entrambe le tabelle lettera→numero sono **moderne**: quella detta "pitagorica" è una costruzione americana di inizio Novecento (scuola di Mrs. L. Dow Balliett, Atlantic City), quella "caldea" è stata resa popolare da Cheiro nel primo Novecento; nessuna delle due discende in modo documentato da Pitagora o da Babilonia. Le regole di riduzione non sono univoche: su 29.585 date tra il 1950 e il 2030, due metodi comuni danno un numero diverso in 3.559 casi (12,0%, circa una data su otto) [Calcolato qui] — quindi il codice deve **dichiarare** il metodo.

### Cited Findings
- [Storia] Sarah Joanna Dennis Balliett, che firmava "Mrs. L. Dow Balliett", nacque nel 1847 e morì nel 1929 ad Atlantic City, New Jersey — [Mrs. L. Dow Balliett, copia di Wikipedia](https://ww-article-cache-1.s3.amazonaws.com/en/Mrs._L._Dow_Balliett)
- [Storia] La voce su Julia Seton la descrive come amica di Sarah Balliett «che creò lo stile moderno di numerologia» — [Julia Seton, Wikipedia](https://wikipedia.com/wiki/Julia_Seton)
- [Storia, fonte commerciale] Un sito di numerologia colloca l'attività di Balliett ad Atlantic City dal 1908 e la chiama «la donna che ha costruito la numerologia moderna» — [numerologist.com](https://numerologist.com/numerology/balliett)
- [Storia, fonte debole] Un testo di Paul Minar riporta che «il Dr. Jordan» le attribuisce di aver dato alla parola "Numerology" ampia accettazione popolare (non è chiaro se si tratti di Juno Jordan) — [Scribd, Paul Minar](https://es.scribd.com/document/356133409/Paul-Minar-Numbers-Energy-Forces-in-Your-Name)
- [Invenzione moderna] Una sinossi editoriale di "The Philosophy of Numbers" di Balliett le attribuisce il sistema che tiene 11 e 22 non ridotti (numeri maestri); l'attribuzione viene da una sinossi commerciale, non da uno storico — [Blackwell's](https://blackwells.co.uk/bookshop/product/The-Philosophy-of-Numbers-Volume-1-by-L-Dow-Balliett/9781561842520)
- [Storia della ricezione] Pitagora (c. 569–470 a.C. secondo la voce) viene chiamato popolarmente «padre della numerologia occidentale», ma le fonti trovate non mostrano alcuna linea diretta da Pitagora al metodo lettera→numero di Balliett — [Numerology, Wikipedia](https://wikipedia.com/wiki/Numerology)
- [Regola interna] Il metodo "caldeo" assegna a ogni lettera un valore da 1 a 8 (il 9 non è assegnato) — [Numerology, copia IPFS di Wikipedia](https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Numerology)
- [Storia, fonte accademica] Il libro di Underwood Dudley *Numerology: Or What Pythagoras Wrought* (Mathematical Association of America, 1997) «esamina e smaschera le fallacie» di un ampio spettro di credenze sui numeri, incluse Stonehenge, piramidi, bioritmi e sezione aurea — [Recensione MAA](https://old.maa.org/node/108433)
- [Storia] Una recensione del libro di Dudley osserva che la numerologia che assegna numeri, e quindi caratteri, agli individui è «un'invenzione più recente» — [NZ Skeptics](https://articles.skeptics.nz/2000/05/01/numerology-or-what-pythagoras-wrought); altra recensione: [Mathematical Gazette, Cambridge](https://www.cambridge.org/core/journals/mathematical-gazette/article/numerology-or-what-pythagoras-wrought-by-underwood-dudley-pp-316-1995-1998-isbn-0-88385-524-0-mathematical-association-of-america/2F68B96D63C6661AFC58FC46DC5D5F6D)

### Inferences
- **Tabella "pitagorica" (moderna, ciclo A=1…I=9, J=1…)** [Dominio; usata e verificata per coerenza nel calcolo di questa sessione]:

  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
  |---|---|---|---|---|---|---|---|---|
  | A J S | B K T | C L U | D M V | E N W | F O X | G P Y | H Q Z | I R |

  Formula: `valore(lettera) = ((posizione_alfabetica − 1) mod 9) + 1` sull'alfabeto latino di 26 lettere.
- **Tabella "caldea" (Cheiro)** [Dominio; esistono varianti su poche lettere, da dichiarare]:

  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
  |---|---|---|---|---|---|---|---|
  | A I J Q Y | B K R | C G L S | D M T | E H N X | U V W | O Z | F P |

  Regola interna di Cheiro: il 9 non si assegna alle lettere (considerato "sacro"), e si guarda anche il numero composto prima della riduzione (es. 31, 56) [Dominio].
- **Esempi [Calcolato qui]** (normalizzazione: maiuscole, scomposizione Unicode NFD, tolti accenti e tutto ciò che non è A–Z): «PIACENZA» → pitagorico 39 → 3; caldeo 31 → 4. «Caffè Città» → 38 → 11 in entrambi. «Pane Quotidiano» (il negozio faro) → pitagorico 71 → 8; caldeo 56 → 11. Lo stesso nome dà numeri diversi nei due sistemi: la scelta del sistema **è** la firma.
- **Numero del cammino di vita: tre metodi in uso** [Invenzione moderna; regola interna]:
  - A = somma di tutte le cifre di GGMMAAAA, poi riduzione tenendo 11/22/33;
  - B = riduci separatamente mese, giorno e anno (tenendo i maestri), poi somma e riduci;
  - C = somma mese + giorno + anno come numeri interi, poi riduci.
  [Calcolato qui] su tutte le 29.585 date 1950–2030: A≠B nel 12,0%, A≠C nel 15,9%, B≠C nell'11,5%. I numeri maestri escono nel 15,6% dei casi col metodo A e nel 10,3% col B. Esempio concreto: **oggi, 28/11/2026**, dà 22 col metodo A (2+0+2+6+1+1+2+8 = 22) ma 4 col metodo B (11 + 1 + 1 = 13 → 4). Altro esempio: 4/1/1950 → A = 2, B = 11, C = 2.
- **Errori comuni nelle implementazioni pop**: (1) presentare la tabella "pitagorica" come antica; (2) chiamare "babilonese" la caldea; (3) non normalizzare gli accenti italiani («è», «à» spariscono o rompono il calcolo); (4) non decidere che fare di J, K, W, X, Y, che non appartengono all'alfabeto italiano tradizionale di 21 lettere ma compaiono in nomi di attività; (5) non dichiarare se Y è vocale (pesa nei numeri "anima" e "personalità", cioè vocali e consonanti); (6) cifre nel nome («Bar 2000»), apostrofi, «&»; (7) mescolare metodi di riduzione tra nome e data.
- **Traduzione in design nascosto (proposta)**: il numero del nome (1–9, più 11/22/33) come *conteggio* (numero di moduli di una griglia, di passi in una scala di spaziature, di elementi in un ritmo di comparsa), oppure come *angolo* (360/n per una rotazione decorativa impercettibile). I maestri possono attivare una variante "rara" della scala (es. 11 → rapporto 1,1 tra due passi). Il cammino di vita della data di apertura come ritmo temporale (es. stagger delle animazioni in multipli di n, sempre rispettando `prefers-reduced-motion`). Il numero non si mostra mai.

### Gaps
- Non ho trovato una fonte accademica che dati con precisione la nascita dei numeri maestri (attribuiti in giro a Balliett, a Juno Jordan o a Florence Campbell): resta [Dominio].
- Non ho trovato fonti su Cheiro (William John Warner, 1866–1936, *Cheiro's Book of Numbers*, 1926 circa) né sulla prova che la tabella caldea non abbia alcuna radice babilonese documentata: [Dominio]. Il libro di Dudley è la fonte da leggere per chiudere il punto.
- Varianti della tabella caldea (posizione di W, X, U/V) non verificate su più fonti.

## 2. Gematria ebraica e isopsefia greca: le tradizioni antiche autentiche

### Takeaway
A differenza della numerologia moderna, sommare i valori numerici delle lettere è una pratica **antica e documentata**: in greco si chiama isopsefia, in ebraico gematria, e ne abbiamo prove dirette (graffiti di Pompei, Svetonio, l'Apocalisse con 666/616). Funziona perché in quegli alfabeti le lettere *erano* le cifre; in latino e in italiano no, quindi applicarla a un nome italiano è un trasferimento moderno.

### Cited Findings
- [Storia] L'isopsefia è la pratica di sommare i valori numerici delle lettere di una parola; è affine alla gematria, la stessa pratica con l'alfabeto ebraico — [Isopsephy, Wikipedia](https://en.wikipedia.org/wiki/Isopsephy)
- [Storia] A Pompei un graffito greco dice che l'autore ama una donna «il cui numero è 545» (CIL IV Suppl. 1, n. 4861); un altro parla di una Harmonia il cui nome vale 45 (CIL IV Suppl. 1, n. 4839) — [Isopsephy, Wikipedia](https://en.wikipedia.org/wiki/Isopsephy); elenco delle fonti antiche: [Letter to Theodore, checklist](https://lettertotheodore.blogspot.com/2024/07/checklist-of-sources-for-ancient.html)
- [Storia] Svetonio (*Vita di Nerone* 39.2) riporta una scritta murale che calcola il nome greco Νέρων = 1005, collegandolo all'uccisione della madre — [Isopsephy, Wikipedia](https://en.wikipedia.org/wiki/Isopsephy)
- [Storia, interpretazione maggioritaria] Il 666 dell'Apocalisse è identificato dalla maggior parte degli studiosi con Nerone: «Nerōn Kaisar» traslitterato in ebraico vale 666; Ireneo (II secolo) conosceva la variante 616 e proponeva invece *Lateinos* — [Number of the beast, Wikipedia](https://en.wikipedia.org/wiki/Number_of_the_beast); [Bible Odyssey, Gematria](https://www.bibleodyssey.org/articles/gematria-2/)

### Inferences
- **Valori ebraici standard (mispar hechrechi)** [Dominio]: א1 ב2 ג3 ד4 ה5 ו6 ז7 ח8 ט9 · י10 כ20 ל30 מ40 נ50 ס60 ע70 פ80 צ90 · ק100 ר200 ש300 ת400. In alcuni sistemi le forme finali valgono 500–900 (ך500 ם600 ן700 ף800 ץ900): è una scelta da dichiarare.
- **Valori greci "milesi"** [Dominio]: α1 β2 γ3 δ4 ε5 ϛ(stigma/digamma)6 ζ7 η8 θ9 · ι10 κ20 λ30 μ40 ν50 ξ60 ο70 π80 ϙ(koppa)90 · ρ100 σ200 τ300 υ400 φ500 χ600 ψ700 ω800 ϡ(sampi)900.
- [Calcolato qui, controllo di coerenza] Con queste tabelle Νέρων = ν50+ε5+ρ100+ω800+ν50 = 1005 (coincide con Svetonio); נרון קסר = 306+360 = 666 e senza la nun finale (נרו קסר) = 616 (coincide con le due varianti). Le tabelle sopra sono quindi coerenti con le fonti storiche.
- Il latino non ha un sistema lettera-numero completo: solo I, V, X, L, C, D, M valgono come numerali; la tradizione latina "nativa" è il **cronogramma** (le lettere-numerali evidenziate dentro una frase sommano a un anno) [Dominio].
- **Traduzione in design nascosto**: l'isopsefia del nome traslitterato in greco è un'invenzione moderna — lecito come *seme* deterministico (es. per scegliere un'inclinazione o un ordine), da non spacciare per tradizione. Un uso più "autentico" per un'attività italiana: un cronogramma, cioè l'anno di apertura nascosto nelle lettere-numerali di un motto, ma è testo visibile, quindi fuori dal perimetro "non si vede".

### Gaps
- Non ho verificato su un'edizione critica le sigle CIL né la data esatta dei graffiti (una fonte dice circa 79 d.C.).
- Nessuna fonte consultata sulla gematria araba (abjad), che segue lo stesso schema.

## 3. Credenze sui numeri per cultura (Italia, Cina, Giappone) e numeri da evitare perché usati come codici d'odio

### Takeaway
In Italia il numero sfortunato è il **17** (venerdì 17), non il 13; la spiegazione più citata, l'anagramma XVII → VIXI («ho vissuto», formula funeraria), è un'ipotesi popolare e non un fatto provato. In Asia orientale il 4 suona come "morte" (cinese, giapponese, coreano) e in giapponese il 9 come "sofferenza"; l'8 è fortunato in Cina. Alcuni numeri sono codici neonazisti censiti dall'ADL (14, 18, 88, 1488): vanno filtrati da ogni numero visibile generato dal sistema, tenendo conto che l'ADL stessa chiede di giudicare il contesto.

### Cited Findings
- [Storia, ipotesi] È stato suggerito che i Romani trovassero inquietante il 17 perché XVII è l'anagramma di VIXI — [Heptadecaphobia, Wikipedia](https://en.wikipedia.org/wiki/Heptadecaphobia); stessa spiegazione in [AGI](https://www.agi.it/cronaca/news/2020-01-17/perche_venerdi_17_porta_sfortuna-6899165/) e [Money.it](https://www.money.it/Venerdi-17-perche-porta-sfortuna-in-Italia-origini-significato)
- [Regola interna / tradizione] Altre spiegazioni proposte: nella Genesi il Diluvio inizia il 17 del secondo mese; una fonte collega il 17 alla disfatta di Teutoburgo; in Italia la sfortuna è associata al venerdì 17 mentre nei Paesi anglosassoni al venerdì 13; la Smorfia napoletana assegna al 17 il significato di «disgrazia» (sintesi di articoli divulgativi italiani) — [AGI](https://www.agi.it/cronaca/news/2020-01-17/perche_venerdi_17_porta_sfortuna-6899165/); [Libreriamo](https://libreriamo.it/storie/venerdi-17-storie-leggende-superstizione/); [Studenti.it](https://www.studenti.it/perche-venerdi-17-porta-sfortuna-origini-storiche-eptacaidecafobia-e-curiosita-su-questa-superstizione.html)
- [Tradizione] In cantonese «quattro» (sei3 四) suona simile a «morte» (sei2 死); alcuni ospedali in Cina evitano 4 e 14 nei piani; il 4 non è però vietato in assoluto — [Tetraphobia, Wikipedia](https://en.wikipedia.org/wiki/Tetraphobia)
- [Tradizione] In Giappone il 4 si evita in alcuni condomini e ospedali; il 9 («ku», associato a «soffrire») si salta soprattutto negli ospedali; il 49 è particolarmente sfortunato («dolore fino alla morte») — [Tetraphobia, copia](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Tetraphobia.html); [Tofugu, il 4 in Giappone](https://www.tofugu.com/japan/number-four-superstition/)
- [Tradizione] La fortuna dell'8 in Cina è la ragione citata per l'orario d'apertura delle Olimpiadi di Pechino 2008 — [Tetraphobia, Wikipedia](https://en.wikipedia.org/wiki/Tetraphobia)
- [Fatto] ADL: **14** è l'abbreviazione dello slogan suprematista bianco delle "14 Words" — [ADL Hate Symbols](https://www.adl.org/education/references/hate-symbols/1488)
- [Fatto] ADL: **88** = HH = "Heil Hitler" (H è l'ottava lettera), uno dei simboli suprematisti più diffusi; l'ADL nota che i radioamatori usano 88 per "hugs and kisses" — [ADL, 88](https://www.adl.org/education/references/hate-symbols/88)
- [Fatto] ADL: **1488** combina i due codici; scritto anche 14/88, 14-88 o 8814 — [ADL, 1488](https://notoleranceforantisemitism.adl.org/resources/hate-symbol/1488)
- [Fatto] ADL: **18** = Adolf Hitler (1 = A, 8 = H), associato soprattutto al gruppo britannico Combat 18 — [Lista ADL, Wikipedia](https://wikipedia.com/wiki/List_of_symbols_designated_by_the_Anti-Defamation_League_as_hate_symbols)
- [Metodo] L'ADL avverte che ogni simbolo del database va valutato nel contesto in cui compare — [ADL, Hate on Display](https://www.adl.org/sites/default/files/about.html)

### Inferences
- **Regola pratica per il codice**: tenere una *denylist* applicata a ogni numero **visibile** che il sistema genera (conteggi mostrati, codici, prezzi suggeriti, numerazioni, numero civico "di firma"): almeno {14, 18, 88, 1488, 8814} e le scritture 14/88, 14-88. Non ha senso filtrare valori invisibili (un grigio #888888 nel CSS non è un messaggio): l'ADL stessa dice che conta il contesto.
- Per il pubblico italiano, evitare il **17** come conteggio visibile "di firma" (es. 17 prodotti in vetrina) è una cortesia culturale, non un obbligo; per un'attività gestita da una famiglia cinese (a Piacenza ce ne sono nella ristorazione e nel commercio) vale lo stesso per il **4** e, se giapponese, per il **4** e il **9** [Inferenza dalle fonti sopra].
- [Dominio] Nella Smorfia: 13 = Sant'Antonio, 17 = 'a disgrazia, 33 = ll'anne 'e Cristo, 47 = 'o muorto, 48 = 'o muorto che parla, 90 = 'a paura. In Cina l'8 (bā) richiama 發 (fā, prosperare) e il 9 (jiǔ) 久 (lungo tempo).
- **Traduzione in design nascosto**: la denylist è un vincolo, non una sorgente di firma; va applicata *dopo* che numerologia o astrologia hanno proposto un conteggio. Se il conteggio cade su un numero vietato, si prende il vicino più "armonico" secondo la regola dichiarata (es. +1).

### Gaps
- **13 portafortuna in Italia** (es. «fare 13» al Totocalcio, dove 13 risultati esatti erano la vincita massima): conoscenza diffusa ma non verificata su una fonte in questa sessione; Treccani non è comparsa nei risultati.
- Esempi spesso citati (la Renault 17 venduta in Italia come «R177», file 17 assenti su alcuni aerei e hotel): non verificati qui.
- Altri codici numerici del database ADL che ricordo ma non ho potuto verificare (host adl.org irraggiungibile): 23/16 o 2316 (W/P = White Power), 28 (B/H = Blood & Honour), 311 (KKK), 83 (H/C = "Heil Christ"), 109, 13/52 e 13/90 (statistiche razziste). Da confermare sul database prima di metterli nella denylist del codice.
- La fonte sul 9 negli ospedali giapponesi è una copia di Wikipedia, non un testo accademico.

## 4. Astrologia occidentale: zodiaco tropicale e siderale, confini esatti dei segni, governi, elementi, modalità, decani

### Takeaway
Il segno solare **non** è una tabella di date fisse: è la longitudine eclittica apparente del Sole divisa in settori di 30°, e il momento d'ingresso cambia di ore ogni anno (Ariete 2026: 20/03 alle 15:36 di Roma; Toro: 19/04 nel 2024 e nel 2028 ma 20/04 dal 2025 al 2027) [Calcolato qui]. Lo zodiaco siderale (vedico) è spostato di circa 24° rispetto al tropicale e il valore dipende dall'ayanamsa scelta: due tabelle della stessa fonte differiscono di 5,5′ per il 2025. Governi moderni/tradizionali e sistemi di decani sono scelte di scuola da dichiarare.

### Cited Findings
- [Regola interna] Per passare dal tropicale al siderale si sottrae l'ayanamsa dalla longitudine tropicale — [Jagannatha Hora, Lahiri ayanamsa](https://jagannathhora.com/lahiri-ayanamsa-value/); [Kerykeion, ayanamsa](https://kerykeion.net/content/learn-astrology/branches-ayanamsas)
- [Fatto/regola interna] Valori di Lahiri per il 1° gennaio 2025: 24°06′53″ (calcolato con Swiss Ephemeris) in una pagina, 24°12′23″ in un'altra tabella della stessa fonte; Kerykeion dice «circa 24°12′»; l'ayanamsa cresce di circa 50″ all'anno — [Jagannatha Hora, tabelle storiche](https://jagannathhora.com/historical-lahiri-ayanamsa-values-tables/); [Kerykeion](https://kerykeion.net/content/learn-astrology/branches-ayanamsas)
- [Fatto] Esistono molti modi di fissare l'inizio dello zodiaco siderale e non coincidono tra loro — [DEV Community, «11 ways to measure where the zodiac starts»](https://dev.to/krazykrackpot/11-ways-to-measure-where-the-zodiac-starts-and-why-none-of-them-agree-1908); [pysweph, offset siderali](https://sailorfe.github.io/pysweph/concepts/sidereal_offsets.html)
- [Fatto] La routine "a bassa precisione" di Meeus per la longitudine apparente del Sole ha precisione di circa 0,01° — [PyMeeus, modulo Sun](https://pymeeus.readthedocs.io/en/latest/_modules/pymeeus/Sun.html); un'implementazione Fortran dichiara ~0,0033° rispetto a VSOP87 tra 1900 e 2100 — [libTheSky](https://libthesky.sourceforge.net/doxygen/sun_8f90_source.html)
- [Fatto] Esistono algoritmi più precisi (NREL Solar Position Algorithm, validità dal 2000 a.C. al 6000 d.C.) — [NREL](https://docs.nrel.gov/docs/fy10osti/47681.pdf)

### Inferences
- **Algoritmo consigliato per il segno solare** (Meeus, *Astronomical Algorithms*, cap. 25, bassa precisione) [Dominio, implementato e controllato qui]:
  ```
  T  = (JDE − 2451545.0) / 36525
  L0 = 280.46646 + 36000.76983·T + 0.0003032·T²          (longitudine media)
  M  = 357.52911 + 35999.05029·T − 0.0001537·T²          (anomalia media)
  C  = (1.914602 − 0.004817·T − 0.000014·T²)·sin M + (0.019993 − 0.000101·T)·sin 2M + 0.000289·sin 3M
  Ω  = 125.04 − 1934.136·T
  λ  = L0 + C − 0.00569 − 0.00478·sin Ω                  (longitudine apparente, gradi)
  segno = floor(λ / 30)   (0 = Ariete … 11 = Pesci); grado nel segno = λ mod 30
  ```
  JDE è in Tempo Terrestre: JDE ≈ JD(UT) + ΔT, con ΔT ≈ 69 s negli anni 2020 [Dominio]. Il Sole avanza di circa 1° al giorno, quindi 0,01° ≈ 15 minuti: chi apre a meno di ~15 minuti da un ingresso è in zona d'incertezza.
- [Calcolato qui] Controllo: Lichun 2024 calcolato alle 16:20 ora di Pechino contro 16:26 riportato da una fonte BaZi (scarto 6 minuti, coerente con la precisione dichiarata); equinozio di marzo 2024 alle 04:03 ora italiana.
- **Ingressi del Sole, ora di Roma [Calcolato qui]** (gli ingressi in Acquario e Pesci sono di gennaio e febbraio dello stesso anno):

  | Anno | Ariete | Toro | Gemelli | Cancro | Leone | Vergine | Bilancia | Scorpione | Sagittario | Capricorno | Acquario | Pesci |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | 2024 | 20/03 04:03 | 19/04 15:56 | 20/05 14:56 | 20/06 22:48 | 22/07 09:41 | 22/08 16:49 | 22/09 14:36 | 23/10 00:06 | 21/11 20:48 | 21/12 10:13 | 20/01 15:05 | 19/02 05:10 |
  | 2025 | 20/03 09:49 | 19/04 21:42 | 20/05 20:42 | 21/06 04:33 | 22/07 15:26 | 22/08 22:35 | 22/09 20:22 | 23/10 05:52 | 22/11 02:35 | 21/12 16:00 | 19/01 20:53 | 18/02 10:57 |
  | 2026 | 20/03 15:36 | 20/04 03:28 | 21/05 02:28 | 21/06 10:19 | 22/07 21:12 | 23/08 04:21 | 23/09 02:08 | 23/10 11:39 | 22/11 08:22 | 21/12 21:48 | 20/01 02:40 | 18/02 16:44 |
  | 2027 | 20/03 21:23 | 20/04 09:15 | 21/05 08:14 | 21/06 16:05 | 23/07 02:58 | 23/08 10:07 | 23/09 07:55 | 23/10 17:26 | 22/11 14:10 | 22/12 03:36 | 20/01 08:27 | 18/02 22:32 |
  | 2028 | 20/03 03:11 | 19/04 15:02 | 20/05 14:01 | 20/06 21:52 | 22/07 08:45 | 22/08 15:54 | 22/09 13:42 | 22/10 23:14 | 21/11 19:58 | 21/12 09:24 | 20/01 14:15 | 19/02 04:20 |

  Errore pop n. 1: una tabella fissa del tipo «Toro dal 20 aprile» sbaglia chi è nato il 19/04/2024 dopo le 15:56. Senza ora di apertura, circa 12 giorni l'anno (uno per ingresso, ~3%) restano ambigui [Calcolato qui, aritmetica]: serve una convenzione dichiarata (consiglio: mezzogiorno ora di Roma).
- **Elementi e modalità** [Regola interna, stabile dall'astrologia ellenistica — Dominio]: Fuoco = Ariete, Leone, Sagittario · Terra = Toro, Vergine, Capricorno · Aria = Gemelli, Bilancia, Acquario · Acqua = Cancro, Scorpione, Pesci. Cardinali = Ariete, Cancro, Bilancia, Capricorno · Fissi = Toro, Leone, Scorpione, Acquario · Mobili = Gemelli, Vergine, Sagittario, Pesci. Formule: `elemento = segno mod 4` (0 Fuoco, 1 Terra, 2 Aria, 3 Acqua); `modalità = segno mod 3` (0 cardinale, 1 fisso, 2 mobile).
- **Governi** [Regola interna — Dominio]: tradizionali (7 pianeti) Ariete Marte, Toro Venere, Gemelli Mercurio, Cancro Luna, Leone Sole, Vergine Mercurio, Bilancia Venere, Scorpione Marte, Sagittario Giove, Capricorno Saturno, Acquario Saturno, Pesci Giove. [Invenzione moderna] Dopo la scoperta dei pianeti esterni: Scorpione → Plutone, Acquario → Urano, Pesci → Nettuno. Consiglio: usare i **tradizionali**, perché sono gli unici coerenti con giorni della settimana, ore planetarie e metalli (tutti a 7).
- **Decani** [Regola interna — Dominio]: due scuole. (a) "Facce" caldee (ellenistiche): 36 settori di 10° governati in ordine caldeo a partire da Marte nel 1° decano dell'Ariete; formula `faccia = floor(λ/10)`, `governatore = ORDINE_CALDEO[(faccia + 2) mod 7]` con ORDINE_CALDEO = [Saturno, Giove, Marte, Sole, Venere, Mercurio, Luna] (controllo: faccia 0 → Marte, faccia 35 = 3° decano dei Pesci → Marte, come da tradizione). (b) Decani "per triplicità" (diffusi nell'astrologia moderna, simili ai drekkana indiani): 1° decano = governatore del segno, 2° = governatore del segno successivo dello stesso elemento, 3° = del terzo. Danno risultati diversi: va dichiarata la scuola.
- **Storia, da fonti non consultate qui** [Dominio]: lo zodiaco babilonese era siderale; quello tropicale si impone nell'astrologia ellenistica con Tolomeo (II secolo d.C.); la differenza di ~24° di oggi è l'effetto accumulato della precessione degli equinozi (~1° ogni 72 anni).
- **Traduzione in design nascosto (proposta)**: elemento → temperatura della palette (Fuoco caldi, Terra caldi desaturati, Aria chiari ad alto valore, Acqua freddi); modalità → ritmo dell'impaginato (cardinale = apertura forte e asimmetrica; fisso = griglia simmetrica e stabile; mobile = larghezze variabili, flusso); decano (1–3) → spostamento fine di tinta di ±10° dentro il settore di 30° del segno (lo stesso rapporto 10/30 del cielo); grado nel segno (0–29) → micro-variazione continua (es. lettura di una curva di easing).

### Gaps
- Non ho consultato direttamente Brennan (*Hellenistic Astrology*, 2017) né Campion (*A History of Western Astrology*): le affermazioni storiche su tropicale/siderale e sui decani restano [Dominio].
- Non ho potuto confrontare gli ingressi calcolati con le effemeridi ufficiali (host NASA bloccato); lo scarto verificato su Lichun 2024 è di 6 minuti.

## 5. Pianeti, giorni, metalli, colori; etimologia dei giorni italiani; ore planetarie calcolate per Piacenza

### Takeaway
I nomi italiani dei giorni conservano i pianeti latini (lunedì = Luna … venerdì = Venere); sabato (dall'ebraico shabbat) e domenica (*dies Dominica*, che sostituì *dies Solis*) sono le eccezioni cristianizzate. L'ordine dei giorni nasce dalle **ore planetarie**: 24 ore per giorno, ciascuna governata da un pianeta in ordine caldeo, e il pianeta della prima ora dà il nome al giorno. Le ore sono **disuguali** (dall'alba al tramonto diviso 12): a Piacenza un'ora diurna dura 43,8 minuti il 21/12/2026 e 78,1 minuti il 21/06/2026 [Calcolato qui].

### Cited Findings
- [Storia] Lunedì = *Lunae dies*, martedì = *Martis dies*, mercoledì = Mercurio, giovedì = *Iovis dies*, venerdì = *Veneris dies*; gli astrologi antichi pensavano che i corpi celesti governassero a turno la prima ora di ogni giorno — [Focus, nomi dei giorni](https://www.focus.it/cultura/storia/come-sono-nati-i-nomi-dei-giorni-della-settimana)
- [Storia] Il sabato era *Saturni dies*; il cristianesimo introdusse l'ebraico *shabbat*; domenica viene da *Dominica* (giorno del Signore), che sostituì il *Solis dies*, cambiamento attribuito a Costantino — [Focus](https://www.focus.it/cultura/storia/come-sono-nati-i-nomi-dei-giorni-della-settimana); [Geopop](https://www.geopop.it/da-dove-vengono-i-nomi-dei-giorni-della-settimana-ecco-lorigine-in-italiano-e-in-inglese/)
- [Regola interna] Il giorno (alba→tramonto) e la notte (tramonto→alba) si dividono ciascuno in 12 parti, quindi le ore variano con stagione e latitudine; William Lilly le chiamava «ore disuguali» — [Planetary hours, Wikipedia](https://en.wikipedia.org/wiki/Planetary_hours); [Renaissance Astrology](https://renaissanceastrology.com/planetaryhoursarticle.html)
- [Regola interna] Ordine caldeo, dal più lento al più veloce come visto dalla Terra: Saturno, Giove, Marte, Sole, Venere, Mercurio, Luna; secondo una delle fonti l'etichetta "ordine caldeo" è moderna — [Planetary hours, Wikipedia](https://en.wikipedia.org/wiki/Planetary_hours)
- [Regola interna] La prima ora di ogni giorno è governata dal pianeta del giorno (sabato, prima ora dall'alba = Saturno); contando ogni 24ª ora si ottiene la sequenza Sole, Luna, Marte, Mercurio, Giove, Venere, Saturno, cioè l'ordine della settimana — [Planetary hours, Wikipedia](https://en.wikipedia.org/wiki/Planetary_hours); [Vanderbilt, Planetary Origins of the Names and Sequences of Days (PDF)](https://as.vanderbilt.edu/clas-resources/media/Planetary%20Origins%20of%20the%20Names%20and%20Sequences%20of%20Days.pdf)
- [Metodo] La durata di un'ora planetaria diurna si ottiene dividendo per 12 i minuti di luce, e lo stesso per la notte — [Kerykeion, calcolo tradizionale delle ore planetarie](https://kerykeion.net/content/learn-astrology/traditional-planetary-hours-calculation)
- [Regola interna, Jyotish] Esiste un equivalente indiano, la *hora* — [Dekho Panchang, Hora](https://www.dekhopanchang.com/en/learn/hora)

### Inferences
- **Algoritmo delle ore planetarie per Piacenza** (lat 45,05° N, lon 9,69° E, fuso IANA `Europe/Rome`) [Dominio, implementato qui]:
  1. alba e tramonto = istante in cui il **centro** del Sole è a −0,833° di altezza (34′ di rifrazione + 16′ di semidiametro: convenzione USNO/NOAA — [Dominio]); posizione del Sole con Meeus cap. 25 e tempo siderale di Greenwich `GMST = 280.46061837 + 360.98564736629·(JD − 2451545) + 0.000387933·T²`;
  2. `ora_diurna = (tramonto − alba)/12`, `ora_notturna = (alba_del_giorno_dopo − tramonto)/12`;
  3. `pianeta(h) = ORDINE_CALDEO[(indice(pianeta_del_giorno) + h − 1) mod 7]`, h = 1…24 contato dall'alba.
  Il "giorno planetario" va da alba ad alba: tra mezzanotte e l'alba si è ancora nelle ore notturne del giorno *precedente*.
- **Risultati [Calcolato qui]**:

  | Data | Alba | Tramonto | Ora diurna | Ora notturna | Prime ore |
  |---|---|---|---|---|---|
  | lun 21/12/2026 | 07:56 | 16:42 | 43,8 min | 76,2 min | 07:56 Luna · 08:40 Saturno · 09:24 Giove · 10:07 Marte · 10:51 Sole · 11:35 Venere · 12:19 Mercurio |
  | dom 21/06/2026 | 05:34 | 21:11 | 78,1 min | 41,9 min | 05:34 Sole · 06:52 Venere · 08:10 Mercurio · 09:28 Luna · 10:46 Saturno · 12:04 Giove · 13:23 Marte |
  | ven 20/03/2026 | 06:24 | 18:33 | 60,7 min | 59,1 min | 06:24 Venere · 07:25 Mercurio · 08:26 Luna · 09:26 Saturno · 10:27 Giove · 11:28 Marte · 12:29 Sole |

- **Errori pop frequenti**: ore di 60 minuti fisse (sbagliato tranne vicino agli equinozi); ore che partono da mezzanotte o dalle 6:00; giorno della settimana calcolato in UTC invece che in ora locale; fuso a offset fisso +1 che ignora l'ora legale (in UE dall'ultima domenica di marzo all'ultima di ottobre — [Dominio]).
- **Metalli** [Regola interna — Dominio]: Sole oro, Luna argento, Mercurio mercurio (argento vivo), Venere rame, Marte ferro, Giove stagno, Saturno piombo. Abbastanza stabile tra le fonti alchemiche.
- **Colori dei pianeti** [Regola interna, molto variabile — Dominio]: le liste (Agrippa, tradizioni cabalistiche, astrologia moderna) non concordano; esempio diffuso: Sole oro/giallo, Luna argento/bianco, Marte rosso, Venere verde o rosa, Mercurio colori misti/arancio, Giove blu o porpora, Saturno nero/grigio scuro. Va dichiarata una tabella propria.
- **Traduzione in design nascosto (proposta)**: pianeta governatore del segno (tradizionale) → **giorno della settimana** in cui l'attività pubblica newsletter o post (un fiorista sotto Venere pubblica di venerdì) e **ora planetaria** di quel pianeta come finestra d'invio, ricalcolata ogni giorno per Piacenza; metallo → tono di un accento cromatico (oro, argento, rame) appena percepibile; durata delle ore del giorno di apertura → rapporto tra due misure (es. 43,8/76,2 ≈ 0,575 in inverno). Niente di questo si mostra.

### Gaps
- Non ho trovato una fonte primaria (Vettio Valente, Cassio Dione 37.18–19) consultata direttamente sull'origine delle ore planetarie: le fonti sopra sono secondarie.
- I colori planetari non hanno una fonte canonica unica trovata in questa sessione.

## 6. Astrologia elettiva (scegliere il momento di un lancio) e Luna vuota di corso

### Takeaway
La "Luna vuota di corso" non ha una definizione unica: la più usata oggi (dall'ultimo aspetto maggiore nel segno fino all'ingresso nel segno successivo) differisce da quella attribuita a Lilly (1647) e da quella ellenistica (nessun aspetto esatto nei 30° successivi, a prescindere dal segno). Calcolarla richiede un'effemeride completa dei pianeti: è il punto meno adatto a un codice deterministico semplice.

### Cited Findings
- [Regola interna] La definizione di Lilly in *Christian Astrology* (1647) è quella che i più citano; Sue Ward sostiene che Lilly considerasse vuota la Luna che non applica ad alcun aspetto tolemaico entro l'orbita mentre è in un segno; altri leggono Lilly legandola ai confini di segno — [Goodreads blog, la definizione di Lilly](https://www.goodreads.com/author_blog_posts/21017999-lilly-s-definition-of-the-void-of-course-moon); [Ward 1992 (PDF)](https://theastrologypodcast.com/articles/ward-the-void-of-course-moon-1992.pdf)
- [Regola interna, moderna] Definizione moderna più comune: la Luna è vuota dall'ultimo aspetto maggiore che si perfeziona prima di cambiare segno, fino all'ingresso nel segno nuovo — [The Astrology Podcast, ep. 292](https://theastrologypodcast.com/transcripts/tap-ep-292-transcript-defining-the-void-of-course-moon/)
- [Regola interna, ellenistica/medievale] Versione più antica: la Luna che non completa alcun aspetto esatto nei 30° successivi, ignorando i confini di segno — [Medieval Astrology Guide, The Pathless Moon](https://medievalastrologyguide.com/void-moon)
- [Regola interna] Alcuni tradizionalisti non considerano vuota la Luna che applica entro 13°, e molti escludono i pianeti esterni — [Kerykeion, Luna vuota di corso](https://kerykeion.net/content/learn-astrology/foundation-moon-void-of-course-moon)

### Inferences
- **Regole elettive tradizionali da prendere in prestito** [Regola interna — Dominio]: iniziare con Luna crescente; evitare la Luna vuota di corso e la Luna "combusta" (entro ~8°–12° dal Sole, cioè attorno al novilunio stretto); favorire il pianeta che "significa" l'attività (Venere per bellezza e moda, Mercurio per commercio e comunicazione, Giove per abbondanza). Sono regole di scuola, non fatti.
- **Senza ora d'apertura la Luna è ambigua** [Calcolato qui, aritmetica]: la Luna cambia segno ogni 27,32/12 ≈ 2,28 giorni, quindi in circa il 44% dei giorni (1/2,28) il segno lunare cambia nel corso della giornata. Il segno lunare di una data senza ora richiede una convenzione dichiarata (mezzogiorno di Roma o alba di Piacenza).
- **Implementazione**: per gli aspetti lunari servono le longitudini di Luna e pianeti con precisione di qualche primo d'arco; consiglio una libreria di effemeridi collaudata (es. Astronomy Engine di Don Cross, open source, o Swiss Ephemeris) invece di riscrivere Meeus cap. 47 — [Dominio].
- **Traduzione in design nascosto (proposta)**: l'astrologia elettiva serve alla **pianificazione**, non alla grafica: scegliere la finestra di pubblicazione del sito o di un lancio (Luna crescente, non vuota, nell'ora planetaria del pianeta dell'attività) e proporla come orario suggerito, mai come motivazione visibile.

### Gaps
- Non ho trovato una fonte accademica (Brennan, Campion) consultata direttamente sulle regole elettive ellenistiche e medievali.

## 7. Luna: calcolo accurato delle fasi

### Takeaway
Il mese sinodico **medio** (29,530588 giorni) è una media: i mesi reali variano tra circa 29,26 e 29,80 giorni (NASA). Usare il metodo medio sposta noviluni e pleniluni fino a **14,1 ore** tra il 2000 e il 2050 (fino a 13,5 ore nel solo 2026) rispetto all'algoritmo di Meeus cap. 49 [Calcolato qui]: abbastanza per sbagliare il giorno della fase.

### Cited Findings
- [Fatto] Mese sinodico medio per l'anno 2000: 29,530588 giorni (= 29 g 12 h 44 m 03 s); la durata di un singolo mese varia da 29,26 a 29,80 giorni per le perturbazioni del Sole sull'orbita eccentrica della Luna — [NASA, Phases of the Moon 1901–2000](https://eclipse.gsfc.nasa.gov/phase/phases1901.html)
- [Fatto] Wikipedia indica una variazione da circa 29,18 a 29,93 giorni (in contrasto con la forchetta NASA) e una variazione fino a sette ore della media nell'arco di un anno — [Lunar month, Wikipedia](https://en.wikipedia.org/wiki/Lunar_month); Britannica conferma che tutte le lunghezze dei mesi astronomici variano — [Britannica, synodic month](https://britannica.com/EBchecked/topic/578490/synodic-month)
- [Fatto] Il capitolo 49 di *Astronomical Algorithms* (2ª ed., 1998) tratta le fasi della Luna; è implementato in pacchetti come meeusjs — [meeusjs, npm](https://www.npmjs.com/package/meeusjs)
- [Fatto, dichiarazione di un autore di libreria] Un'implementazione basata su Meeus dichiara tempi delle fasi «entro pochi minuti» — [solunatus, moon.rs](https://docs.rs/crate/solunatus/latest/source/src/astro/moon.rs)

### Inferences
- **Algoritmo Meeus cap. 49 (riassunto)** [Dominio, implementato qui]: `k ≈ (anno − 2000)·12,3685`, intero per il novilunio, +0,25 primo quarto, +0,5 plenilunio, +0,75 ultimo quarto; `T = k/1236,85`; `JDE = 2451550,09766 + 29,530588861·k + 0,00015437·T² − 0,000000150·T³ + 0,00000000073·T⁴`; poi si sommano le correzioni periodiche funzione di M (anomalia del Sole), M′ (anomalia della Luna), F (argomento di latitudine), Ω, con E = 1 − 0,002516·T − 0,0000074·T² (termine principale del novilunio: −0,40720·sin M′ + 0,17241·E·sin M …) e 14 piccoli termini planetari A1…A14. Il risultato è in TT: sottrarre ΔT (~69 s) per avere l'ora civile.
- **Fasi 2026, ora di Roma [Calcolato qui]** (tra parentesi: di quanto sbaglia il metodo medio):

  | Novilunio | Errore medio | Plenilunio | Errore medio |
  |---|---|---|---|
  | 18/01 20:52 | −9,2 h | 03/01 11:02 | +6,3 h |
  | 17/02 13:01 | −12,6 h | 01/02 23:09 | +6,9 h |
  | 19/03 02:23 | −13,2 h | 03/03 12:37 | +6,2 h |
  | 17/04 13:51 | −10,9 h | 02/04 04:12 | +4,4 h |
  | 16/05 22:01 | −6,4 h | 01/05 19:23 | +1,9 h |
  | 15/06 04:54 | −0,5 h | 31/05 10:45 | −0,7 h |
  | 14/07 11:43 | +5,4 h | 30/06 01:56 | −3,2 h |
  | 12/08 19:36 | +10,2 h | 29/07 16:35 | −5,1 h |
  | 11/09 05:26 | +13,1 h | 28/08 06:18 | −6,1 h |
  | 10/10 17:50 | +13,5 h | 26/09 18:49 | −5,9 h |
  | 09/11 08:02 | +11,0 h | 26/10 05:11 | −4,5 h |
  | 09/12 01:51 | +5,9 h | 24/11 15:53 | −2,5 h |
  | — | — | 24/12 02:28 | −0,3 h |

  Errore massimo del metodo medio 2000–2050: 14,1 ore (novilunio del 06/04/2027). Il segno dell'errore oscilla con l'anomalia della Luna, quindi non si corregge con una costante.
- **Errori pop frequenti**: fase = `((JD − 2451550,1)/29,530588853) mod 1` e poi nomi delle fasi assegnati per "età" in giorni a soglie fisse (errore fino a ~14 ore, più l'errore di soglia perché la Luna non si muove a velocità costante); calcolare in UTC e mostrare la data locale; confondere "età della Luna" e frazione illuminata.
- **Emisferi** [Dominio]: la fase (elongazione Luna–Sole) e i suoi istanti sono identici in tutto il mondo; cambia solo l'**aspetto**: nell'emisfero nord la Luna crescente è illuminata a destra, in quello sud a sinistra. Per Piacenza vale la regola nord. Frazione illuminata: `k = (1 + cos i)/2`, con i angolo di fase (~180° − elongazione).
- **Usi tradizionali** [Regola interna — Dominio]: nella tradizione elettiva e nel calendario agricolo italiano la Luna crescente (dal novilunio al plenilunio) è il tempo degli inizi e della crescita; il plenilunio il culmine.
- **Traduzione in design nascosto (proposta)**: fase alla data di apertura (0–1) → parametro continuo, es. luminosità di base dello sfondo spostata di ±2% o posizione di un punto focale lungo un arco; pianificazione: proporre il lancio del sito nel primo giorno di Luna crescente dopo la consegna (novilunio calcolato col metodo vero, mai col medio).

### Gaps
- Non ho potuto confrontare riga per riga i valori calcolati con la tabella NASA 2001–2100 (host bloccato); la precisione dichiarata da Meeus per il cap. 49 non è stata letta alla fonte.

## 8. Cina: ciclo sessagenario, inizio dell'anno (lichun contro Capodanno), cinque fasi (wu xing), quadrato Lo Shu e stelle volanti

### Takeaway
L'anno cinese ha **due inizi** a seconda dell'uso: il Capodanno lunare (calendario civile e animale "popolare") e il **lichun**, il momento in cui il Sole raggiunge 315° di longitudine (3–5 febbraio), che apre l'anno nel BaZi. Tronco e ramo si calcolano con aritmetica modulare esatta; il lichun cade il 3 febbraio a Roma e il 4 a Pechino nel 2026 (stesso istante, giorno diverso) [Calcolato qui]. Il Lo Shu è l'unico quadrato magico 3×3 (somma 15) a meno di rotazioni e riflessioni: perfetto per il codice.

### Cited Findings
- [Fatto astronomico / regola interna] Il lichun è l'istante in cui il Sole raggiunge la longitudine celeste di 315°, di solito il 4 o 5 febbraio — [Lichun, Wikipedia](https://wikipedia.com/wiki/Lichun)
- [Regola interna] Nel BaZi l'anno cambia al lichun, non al Capodanno lunare; chi nasce prima del lichun tiene il pilastro dell'anno precedente — [Wikibooks, Ba Zi/Chinese New Year](https://en.wikibooks.org/wiki/Ba_Zi/Chinese_New_Year); [Master Sean Chan, BaZi birth years](https://www.masterseanchan.com/bazi-birth-years/)
- [Fatto] Esempio 2024: l'anno solare BaZi è iniziato il 04/02/2024 alle 16:26 ora cinese, il Capodanno lunare è caduto il 10/02/2024 — [Master Sean Chan, BaZi 2024](https://www.masterseanchan.com/bazi-2024/)
- [Fatto] Nel calendario tradizionale il conteggio sessagenario dell'anno cambia al Capodanno lunare, non al 1° gennaio — [Sexagenary cycle, Wikipedia](https://www.wikipedia.org/wiki/Ganzhi)
- [Avvertenza pratica] Chi nasce tra lichun e Capodanno deve verificare quale convenzione usa un calendario o un calcolatore — [The China Journey, calendario lunare](https://www.thechinajourney.com/chinese-lunar-calendar/)
- [Fatto matematico] Il Lo Shu è l'unico quadrato magico di ordine 3 a meno di rotazioni e riflessioni; usa 1–9 una volta sola, costante magica 15 — [MathWorld, Lo Shu](https://mathworld.wolfram.com/LoShu.html)
- [Invenzione moderna / feng shui popolare] Mappatura numeri → direzione → elemento → colore: 1 Nord Acqua blu scuro/nero; 2 Sud-Ovest Terra; 3 Est Legno verde; 4 Sud-Est Legno; 5 Centro Terra giallo; 6 Nord-Ovest Metallo; 7 Ovest Metallo bianco; 8 Nord-Est Terra; 9 Sud Fuoco rosso — [Gaia, Lo Shu](https://gaia.com/article/how-to-use-the-chinese-magic-square)
- [Storia] Studio accademico sul quadrato di tre nella filosofia e religione cinese antica: Cammann, *History of Religions* — [University of Chicago Press Journals](https://www.journals.uchicago.edu/doi/pdfplus/10.1086/462439)

### Inferences
- **Formule dell'anno** [Dominio, verificate qui su ancore note]: `tronco = (A − 4) mod 10` (0 Jia, 1 Yi, 2 Bing, 3 Ding, 4 Wu, 5 Ji, 6 Geng, 7 Xin, 8 Ren, 9 Gui); `ramo = (A − 4) mod 12` (0 Zi Topo, 1 Chou Bue, 2 Yin Tigre, 3 Mao Coniglio, 4 Chen Drago, 5 Si Serpente, 6 Wu Cavallo, 7 Wei Capra, 8 Shen Scimmia, 9 You Gallo, 10 Xu Cane, 11 Hai Maiale); posizione nel ciclo 1–60 = `((A − 4) mod 60) + 1`; yang se il tronco è pari. A = anno gregoriano **corretto per il confine** (se la data è prima del lichun, o del Capodanno, si usa A − 1).
  [Calcolato qui] 1984 = Jia-Zi (1° del ciclo, Legno, Topo) · 2024 = Jia-Chen (41°, Legno yang, Drago — coerente con la fonte 2024 sopra) · 2025 = Yi-Si (Legno yin, Serpente) · **2026 = Bing-Wu (43°, Fuoco yang, Cavallo)** · 2027 = Ding-Wei (Fuoco yin, Capra).
- **Elemento del tronco** [Regola interna]: Jia/Yi Legno, Bing/Ding Fuoco, Wu/Ji Terra, Geng/Xin Metallo, Ren/Gui Acqua (`elemento = floor(tronco/2)`). Attenzione, fonte di ambiguità: esiste anche l'elemento *nayin* della coppia tronco-ramo, diverso (2024 Jia-Chen è "Legno" per tronco ma "fuoco della lampada" nel nayin; 2026 Bing-Wu è "Fuoco" per tronco ma "acqua del fiume celeste" nel nayin) [Dominio]. I siti pop dicono "anno del Cavallo di Fuoco" = elemento del tronco.
- **Lichun calcolato (Sole a 315°) [Calcolato qui]**: 2024 → Roma 04/02 09:20, Pechino 04/02 16:20 · 2025 → Roma 03/02 15:07, Pechino 03/02 22:07 · **2026 → Roma 03/02 20:54, Pechino 04/02 03:54** · 2027 → Roma 04/02 02:42, Pechino 04/02 09:42. Il confine è un **istante**: un'attività aperta a Piacenza il 03/02/2026 alle 22:00 è già nell'anno Bing-Wu per il BaZi, anche se la data cinese del lichun è il 4.
- **Pilastro del giorno** [Dominio, controllato su due ancore]: `indice = (JDN + 49) mod 60` (0 = Jia-Zi), dove JDN è il numero del giorno giuliano a mezzogiorno. Controlli: 01/10/1949 → Jia-Zi; 01/01/2000 → Wu-Wu; oggi 28/11/2026 → Bing-Wu. Il cambio di giorno nel BaZi tradizionale avviene alle 23:00 (ora Zi) in alcune scuole e a mezzanotte in altre: scelta da dichiarare.
- **Cinque fasi (wu xing)** [Regola interna — Dominio]:

  | Fase | Direzione | Stagione | Colore | Pianeta |
  |---|---|---|---|---|
  | Legno | Est | primavera | verde/blu-verde (qing) | Giove |
  | Fuoco | Sud | estate | rosso | Marte |
  | Terra | Centro | fine estate/intercalare | giallo | Saturno |
  | Metallo | Ovest | autunno | bianco | Venere |
  | Acqua | Nord | inverno | nero/blu scuro | Mercurio |

  Ciclo generativo (sheng): Legno → Fuoco → Terra → Metallo → Acqua → Legno, formula `genera(i) = (i + 1) mod 5` con ordine [Legno, Fuoco, Terra, Metallo, Acqua]. Ciclo di controllo (ke): Legno → Terra → Acqua → Fuoco → Metallo → Legno, formula `controlla(i) = (i + 2) mod 5`. Le direzioni e i colori di Nord/Sud/Est/Ovest coincidono con la mappatura del Lo Shu della fonte Gaia sopra.
- **Disposizione del Lo Shu** (convenzione cinese, Sud in alto) [Dominio, coerente con la mappatura Gaia]:
  ```
  4 9 2      SE  S  SO
  3 5 7      E   C  O
  8 1 6      NE  N  NO
  ```
  Righe, colonne e diagonali sommano 15; i pari stanno negli angoli, i dispari al centro dei lati.
- **Stelle volanti (Xuan Kong Fei Xing)** [Regola interna — Dominio, da verificare]: le nove "stelle" si muovono tra i nove settori seguendo il percorso del Lo Shu: Centro → NO → O → NE → S → N → SO → E → SE (le posizioni di 5, 6, 7, 8, 9, 1, 2, 3, 4 nel quadrato). La stella annuale al centro scende di 1 ogni anno, con cambio al lichun: 2024 = 3, 2025 = 2, **2026 = 1**, 2027 = 9; formula `centro(A) = ((2 − (A − 2024)) mod 9) + 1`. Il "Periodo 9" dei cicli di 20 anni va dal 2024 al 2043.
- **Traduzione in design nascosto (proposta)**: elemento del tronco dell'anno di apertura → colore dominante "di fondo" (anche solo come tinta dei neutri); elemento che lo **genera** → colore di sostegno; mai l'elemento che lo **controlla** come dominante. Percorso del Lo Shu → ordine di comparsa delle 9 tessere di una galleria 3×3 (prima il centro, poi NO, O, NE…); costante 15 → unità di base (es. 15 px o multipli) per la griglia di quella sezione; stella annuale → quale tessera riceve l'accento nell'anno in corso.

### Gaps
- Non ho trovato una fonte che formalizzi l'algoritmo del confine d'anno BaZi oltre a "Sole a 315°".
- Le correlazioni wu xing (colori, pianeti, stagioni) e le regole delle stelle volanti non sono state verificate su una fonte accademica in questa sessione; il libro di Frank Swetz *The Legacy of the Luoshu* è la fonte da consultare.
- Il calcolo del Capodanno lunare (secondo novilunio dopo il solstizio d'inverno, ora di Pechino UTC+8, con le regole dei mesi intercalari) non è stato implementato qui.

## 9. Jyotish (astrologia vedica): nakshatra, muhurta, base siderale — cosa si può prendere in prestito

### Takeaway
I 27 nakshatra sono settori lunari di 13°20′ (360/27) dello zodiaco **siderale**: la definizione è semplice e deterministica, ma il risultato dipende dall'ayanamsa (Lahiri ≈ 24°06′–24°12′ nel 2025, secondo la tabella). Da prendere in prestito con sicurezza: tithi e nakshatra come conteggi e la *hora* (equivalente delle ore planetarie). Da lasciare: contenuti rituali e religiosi.

### Cited Findings
- [Regola interna] Longitudine siderale = longitudine tropicale − ayanamsa; il nakshatra si trova dividendo la longitudine siderale per 13°20′ — [Jagannatha Hora](https://jagannathhora.com/lahiri-ayanamsa-value/); [Dekho Panchang, ayanamsha](https://dekhopanchang.com/en/learn/ayanamsha)
- [Fatto] Esistono più ayanamsa (Lahiri, Raman, Krishnamurti…) con valori diversi — [RoxyAPI, Lahiri vs Raman vs KP](https://roxyapi.com/blogs/ayanamsa-lahiri-raman-kp-developers); [Dekho Panchang, confronto](https://dekhopanchang.com/en/learn/ayanamsha-comparison)
- [Regola interna] Il sistema della *hora* indiana è parallelo a quello delle ore planetarie — [Dekho Panchang, Hora](https://www.dekhopanchang.com/en/learn/hora)

### Inferences
- **I 27 nakshatra** [Regola interna — Dominio], ciascuno di 13°20′ a partire da 0° Ariete siderale: Ashvini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishta, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, Revati. Governatori nel sistema Vimshottari, in ciclo di 9: Ketu, Venere, Sole, Luna, Marte, Rahu, Giove, Saturno, Mercurio. Formula: `nakshatra = floor(λ_sid_Luna / (40/3))`, `pada = floor((λ_sid_Luna mod (40/3)) / (10/3))` (4 quarti di 3°20′).
- **Tithi** [Regola interna — Dominio]: `tithi = floor(((λ_Luna − λ_Sole) mod 360) / 12) + 1` (1–30). Non dipende dall'ayanamsa (è una differenza di longitudini), quindi è l'elemento vedico più robusto da mettere nel codice.
- **Convenzione dell'alba** [Dominio]: nel panchanga (calendario indiano a cinque membri: tithi, vara = giorno della settimana, nakshatra, yoga, karana) il tithi e il nakshatra che vigono **all'alba** danno il nome al giorno. È una convenzione utile anche per noi: la Luna percorre un nakshatra in circa 27,32/27 ≈ 1,01 giorni [Calcolato qui, aritmetica], quindi quasi ogni giorno ne contiene un cambio, e senza un'ora di riferimento il nakshatra di una data è indefinito. Consiglio: calcolare all'alba di Piacenza.
- **Muhurta** [Regola interna — Dominio]: scelta del momento propizio combinando tithi, nakshatra, giorno e intervalli da evitare (es. Rahu kalam, un ottavo della durata del giorno diverso per ogni giorno della settimana). È l'analogo indiano dell'astrologia elettiva.
- **Cosa prendere in prestito con sicurezza**: la divisione in 27 (passo di tinta di 13°20′ su una ruota di 360°, cioè una ruota di colore a 27 passi), il tithi (30 passi del mese lunare), la hora. **Cosa evitare**: nomi e immagini delle divinità, rituali, qualunque riferimento religioso o di casta; nel contesto di Piacenza non aggiunge armonia leggibile e rischia di risultare appropriazione.
- **Traduzione in design nascosto (proposta)**: nakshatra della Luna all'alba del giorno d'apertura → indice su una ruota cromatica di 27 passi da 13°20′; pada (1–4) → variante di saturazione; tithi → ritmo a 30 passi (es. offset di un pattern).

### Gaps
- Le due cifre di Lahiri per il 2025 della stessa fonte (24°06′53″ e 24°12′23″) non sono state riconciliate: serve Swiss Ephemeris o il valore ufficiale dell'Indian Astronomical Ephemeris.
- Nessuna fonte consultata sul muhurta e sul Rahu kalam: [Dominio].

## 10. Sintesi per il codice: cosa è robusto, cosa richiede una scelta dichiarata, come diventa design nascosto

### Takeaway
Tutto ciò che è **astronomia** (posizione del Sole, fasi lunari vere, alba e tramonto, lichun, tithi) è robusto e va calcolato con algoritmi veri (Meeus, non medie né tabelle fisse) nel fuso `Europe/Rome`. Tutto ciò che è **convenzione di scuola** (riduzioni numerologiche, maestri, tabella caldea, governi moderni, decani, colori planetari, ayanamsa, confine d'anno cinese, Luna vuota) va **dichiarato** in una configurazione versionata, perché scuole diverse danno numeri diversi sulla stessa attività. Il punto più fragile per un'attività è che di solito si conosce la **data** d'apertura ma non l'**ora**.

### Cited Findings
- [Fatto] La routine solare di Meeus a bassa precisione vale ~0,01° — [PyMeeus](https://pymeeus.readthedocs.io/en/latest/_modules/pymeeus/Sun.html)
- [Fatto] Il mese sinodico reale varia tra 29,26 e 29,80 giorni — [NASA](https://eclipse.gsfc.nasa.gov/phase/phases1901.html)
- [Regola interna] Il confine dell'anno BaZi è il lichun, non il Capodanno — [Wikibooks](https://en.wikibooks.org/wiki/Ba_Zi/Chinese_New_Year)
- [Fatto] Le ayanamsa non concordano tra loro — [DEV Community](https://dev.to/krazykrackpot/11-ways-to-measure-where-the-zodiac-starts-and-why-none-of-them-agree-1908)
- [Metodo] I codici d'odio vanno valutati nel contesto — [ADL](https://www.adl.org/sites/default/files/about.html)

### Inferences
- **Tabella robusto / da dichiarare, con default consigliato** [Inferenza dalle sezioni 1–9]:

  | Elemento | Robusto? | Cosa va dichiarato | Default consigliato |
  |---|---|---|---|
  | Lettera → numero "pitagorico" | sì (convenzione moderna stabile) | accenti, J K W X Y, cifre, apostrofi, Y vocale/consonante | NFD + rimozione diacritici; solo A–Z; cifre ignorate; Y consonante |
  | Lettera → numero caldeo | quasi (varianti su poche lettere) | tabella esatta; uso del composto | tabella Cheiro della sez. 1; solo come seme secondario |
  | Riduzione e numeri maestri | **no** (12% delle date cambia) | metodo A/B/C; maestri sì/no; 33 sì/no | nome: somma totale; data: metodo B; maestri 11/22/33 |
  | Segno solare | sì, con ora; ~3% dei giorni ambiguo senza ora | ora di riferimento se manca | longitudine Meeus alle 12:00 Europe/Rome |
  | Tropicale / siderale | scelta | sistema | tropicale per l'astrologia occidentale |
  | Ayanamsa | scelta | quale | Lahiri (standard indiano) |
  | Governi | scelta | tradizionali/moderni | tradizionali (7, coerenti con giorni, ore, metalli) |
  | Decani | scelta | facce caldee / triplicità | facce caldee |
  | Colori dei pianeti | **molto ambiguo** | tabella propria | dichiararla come scelta di design |
  | Metalli | quasi stabile | — | tabella della sez. 5 |
  | Giorno della settimana e pianeta | sì | ora locale | Europe/Rome |
  | Ore planetarie | sì, dato il criterio di alba | definizione di alba | centro del Sole a −0,833° |
  | Fase lunare | sì (astronomia) | — | Meeus cap. 49 o libreria; **mai** il mese medio |
  | Segno lunare / nakshatra | sì con ora; ~44% / ~99% dei giorni ambigui senza ora | ora di riferimento | alba di Piacenza |
  | Luna vuota di corso | **no** | definizione | evitarla nel codice o usare la moderna |
  | Anno cinese | scelta | lichun / Capodanno / 1° gennaio | lichun (BaZi) |
  | Elemento dell'anno | scelta | tronco / nayin | tronco |
  | Lo Shu | sì (unico) | orientamento | Sud in alto (convenzione cinese) |
  | Stelle volanti | regola interna | da verificare | solo come ordine/accento, non come "fortuna" |
  | Tithi | sì | — | all'alba |
  | Numeri da evitare | sì come lista | contenuto della lista, contesto | filtro sui soli numeri visibili |

- **Le dieci trappole più comuni da cercare nel codice esistente** [Inferenza]: (1) segni zodiacali con tabelle di date fisse; (2) anno cinese = anno gregoriano senza confine; (3) fase lunare dal mese medio; (4) ore planetarie di 60 minuti o da mezzanotte; (5) calcoli in UTC o con offset fisso +1 senza ora legale; (6) metodo di riduzione numerologica non dichiarato o diverso tra nome e data; (7) accenti non normalizzati; (8) governi moderni mescolati a correlazioni a 7 (giorni, metalli); (9) ayanamsa implicita; (10) nessun filtro dei numeri d'odio sui valori visibili.
- **Mappa design nascosto** [Proposta]:

  | Sorgente | Tipo di decisione nascosta | Esempio |
  |---|---|---|
  | Numero del nome (1–9, 11/22/33) | conteggio | moduli della griglia, passi della scala di spaziature, elementi in un ritmo |
  | Cammino di vita della data | tempo | stagger delle animazioni (con `prefers-reduced-motion`) |
  | Elemento del segno solare | colore | temperatura della palette |
  | Modalità del segno | impaginato | asimmetrico / simmetrico / fluido |
  | Decano, grado nel segno | colore fine | ±10° di tinta; micro-curva di easing |
  | Pianeta governatore (tradizionale) | pianificazione + materia | giorno di pubblicazione; accento oro/argento/rame |
  | Ora planetaria (Piacenza) | pianificazione | finestra d'invio di newsletter o post |
  | Fase lunare | parametro continuo + pianificazione | luminosità ±2%; lancio in Luna crescente |
  | Elemento cinese (tronco, cicli) | colore | dominante + sostegno (ciclo generativo), mai il controllante |
  | Lo Shu | ordine e unità | ordine di comparsa 3×3; unità 15 |
  | Nakshatra / tithi | colore / ritmo | ruota a 27 passi da 13°20′; ritmo a 30 |
  | Denylist (ADL, 17, 4) | vincolo | correzione al vicino ammesso, solo sui numeri visibili |

- **Principio di implementazione** [Proposta]: seme deterministico = nome normalizzato + data d'apertura (+ ora se nota); una configurazione versionata che nomina ogni scelta di scuola (`numerologia.riduzione = "B"`, `zodiaco = "tropicale"`, `cina.confine = "lichun"`…); calcoli astronomici con un solo modulo testato contro valori noti (gli ingressi e le fasi della sezione 4 e 7 si possono usare come casi di prova, con tolleranza di 15 minuti per il Sole a bassa precisione). Niente si mostra come simbolo; il seme e le scelte si possono registrare in un commento HTML o in un file di metadati non pubblico.

### Gaps
- Nessuna fonte accademica consultata direttamente (Campion, Brennan, Dudley per intero, Meeus per intero, Treccani): molte tabelle tradizionali sono marcate [Dominio] e vanno ricontrollate prima di essere scritte come "fatto" nel rapporto.
- I valori calcolati non sono stati confrontati con effemeridi ufficiali (NASA/USNO irraggiungibili da questa sessione); gli unici controlli esterni sono il lichun 2024 (scarto 6 minuti) e la coerenza con fonti BaZi per il 2024.
- Gli host `en.wikipedia.org`, `www.adl.org` ed `eclipse.gsfc.nasa.gov` vanno abilitati nella rete della sessione per leggere le pagine intere invece degli estratti di ricerca.
