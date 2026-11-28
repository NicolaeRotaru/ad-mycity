# Magia e incanto: le tecniche della magia rituale e naturale (numero, geometria, tempo, colore, immagine) e come diventano uno strato nascosto nei siti dei negozi di Piacenza

> data: 2026-11-28 11:40 (Piacenza) · filone di ricerca per «Armonia nascosta nei siti».
> **Limiti di accesso di questa sessione:** `www.esotericarchives.com` (edizione Peterson di Agrippa) e
> `en.wikipedia.org` non si raggiungono con WebFetch (DNS bloccato dalla rete della sessione). Vanno
> aggiunti agli host consentiti per verificare i testi primari. Tutto il resto viene da WebSearch (sintesi di
> pagine, non lette per intero) e da **calcoli locali in Python** fatti in questa sessione, che verificano ogni
> somma, quadrato e algoritmo citato. Dove una cosa viene dalla memoria e non da una fonte letta, è nei *Gaps*.
>
> **Legenda di affidabilità usata sotto:** [STORIA] = fatto storico documentato · [TRADIZIONE] = pratica
> interna alla tradizione magica (quello che i maghi dicono di fare, non che funzioni) · [MODERNO] = invenzione
> moderna, anche nostra · [CALCOLO] = verificato con codice in questa sessione.

---

## 1. Agrippa, De occulta philosophia, Libro II: i sette quadrati planetari (kamea), le somme, i sigilli e come si tracciano; il quadrato di Dürer

### Takeaway
I sette quadrati planetari sono oggetti aritmetici esatti e deterministici: ogni riga, colonna e diagonale dà la stessa somma (15, 34, 65, 111, 175, 260, 369). Sono quindi l'ingrediente perfetto per il codice. I «sigilli» si ottengono trasformando un nome in numeri e unendo le celle corrispondenti con una linea. Il metodo è calcolabile, ma va applicato a nomi di negozi, **mai** ai nomi di intelligenze, spiriti o nomi divini, che sono esclusi.

### Cited Findings
- [STORIA] Il Libro II, capitolo XXII, descrive sette «tavole» planetarie, le loro proprietà numeriche, i nomi divini collegati e le intelligenze e gli spiriti che le governano — [Aeternum, *Magic Squares and Planetary Powers*](https://aeternum.fr/en/blogs/les-carnets-d-aeternum/carres-magiques-et-pouvoirs-planetaires)
- [STORIA] Agrippa abbina ogni pianeta a un quadrato di ordine fisso, da 3 a 9 celle per lato, con tutto un apparato: nomi divini, angeli (Intelligenze), demoni (Spiriti), sigilli e caratteri mistici. Le Intelligenze sono figure angeliche e protettive, gli Spiriti sono demoni planetari — [Aeternum](https://aeternum.fr/en/blogs/les-carnets-d-aeternum/carres-magiques-et-pouvoirs-planetaires)
- [STORIA] Per Saturno, Agrippa assegna l'angelo Agiel e lo spirito Zazel, entrambi legati al numero 45, il totale del quadrato di Saturno — [Aeternum](https://aeternum.fr/en/blogs/les-carnets-d-aeternum/carres-magiques-et-pouvoirs-planetaires)
- [TRADIZIONE] Come si traccia un sigillo: il nome ebraico viene trascritto sul quadrato. Il sigillo nasce tracciando una linea che unisce, in ordine, le celle che corrispondono al valore numerico di ciascuna lettera. La stessa fonte nota che **Agrippa non sempre rispetta questo principio** nei sigilli delle Intelligenze e degli Spiriti — [Aeternum](https://aeternum.fr/en/blogs/les-carnets-d-aeternum/carres-magiques-et-pouvoirs-planetaires)
- [STORIA] Gli errori della stampa si sono propagati: l'edizione annotata di Donald Tyson dichiara di aver corretto quadrati, sigilli e sigilli degli spiriti. L'uso di questi sigilli è «virtualmente universale» nell'occultismo moderno, ma gli errori sono stati sempre copiati — [Tyson ed., *Three Books of Occult Philosophy*, PDF su archive.org](https://ia801800.us.archive.org/33/items/three-books-of-occult-philosophy-henry-cornelius-agrippa-donald-tyson-edition/Three%20Books%20of%20Occult%20Philosophy%20-%20Henry%20Cornelius%20Agrippa%20(Donald%20Tyson%20Edition).pdf)
- [STORIA] Le date variano secondo la fonte: una dà il 1531 come uscita del trattato, un'altra il 1533 per la forma completa (il Libro I esce nel 1531, i tre libri insieme nel 1533) — [Aeternum](https://aeternum.fr/en/blogs/les-carnets-d-aeternum/carres-magiques-et-pouvoirs-planetaires); [Wikipedia, *Three Books of Occult Philosophy*](https://en.wikipedia.org/wiki/Three_Books_of_Occult_Philosophy)
- [TRADIZIONE] La «Qabalah delle nove camere» (Aiq Bekar) è un metodo ebraico di sostituzione: le 22 lettere sono distribuite in una griglia 3×3 a forma di tris. La decima lettera torna nella prima camera insieme alla prima; la diciannovesima (valore 100) va anch'essa nella prima camera. **Ogni camera contiene una lettera delle unità, una delle decine e una delle centinaia** (1-10-100, 2-20-200, …) — [Collegium, *Qabalah of nine chambers*](https://collegium.fandom.com/wiki/Qabalah_of_nine_chambers); [Frater Achad, *Q.B.L.*, cap. 7, Hermetic Library](https://hermetic.com/achad/qbl/qbl-chapter-7)
- [TRADIZIONE] Achad la presenta come cifrario: un punto in una camera indica la lettera delle unità, due o tre punti le decine o le centinaia — [Hermetic Library](https://hermetic.com/achad/qbl/qbl-chapter-7)
- [TRADIZIONE] Esiste anche un uso dell'Aiq Bekar per costruire sigilli direttamente sulla griglia delle nove camere: la posizione di ciascuna lettera disegna una figura caratteristica — [Asterion, *Sigils of the Aiq Bekar*](https://idoc.pub/documents/sigils-of-the-aiq-bekar-5143gvw9egnj)

**Le sette tavole, cella per cella** — [CALCOLO] le disposizioni sotto sono quelle della tradizione di Agrippa
(Libro II, cap. 22) come riprodotte nelle edizioni moderne. Non le ho confrontate con un facsimile del 1533,
perché Esoteric Archives è bloccato (vedi *Gaps*). Le **somme le ho verificate tutte con un programma**: ogni
quadrato contiene i numeri da 1 a n² una volta sola, e righe, colonne e le due diagonali danno la costante attesa
n(n²+1)/2.

| Pianeta | Lato | Celle | Somma di ogni linea | Totale | Metallo (tradizione) |
|---|---|---|---|---|---|
| Saturno | 3 | 9 | **15** | **45** | piombo |
| Giove | 4 | 16 | **34** | **136** | stagno |
| Marte | 5 | 25 | **65** | **325** | ferro |
| Sole | 6 | 36 | **111** | **666** | oro |
| Venere | 7 | 49 | **175** | **1225** | rame |
| Mercurio | 8 | 64 | **260** | **2080** | argento vivo (mercurio) |
| Luna | 9 | 81 | **369** | **3321** | argento |

*(La colonna dei metalli è la tradizione planetaria classica, ricordata a memoria e non letta in una fonte in questa
sessione: vedi Gaps. Per il Sole, l'oro è confermato da Ficino più sotto.)*

```
SATURNO 3×3 (somma 15)      GIOVE 4×4 (somma 34)
 4  9  2                     4 14 15  1
 3  5  7                     9  7  6 12
 8  1  6                     5 11 10  8
                            16  2  3 13

MARTE 5×5 (somma 65)        SOLE 6×6 (somma 111, totale 666)
11 24  7 20  3               6 32  3 34 35  1
 4 12 25  8 16               7 11 27 28  8 30
17  5 13 21  9              19 14 16 15 23 24
10 18  1 14 22              18 20 22 21 17 13
23  6 19  2 15              25 29 10  9 26 12
                            36  5 33  4  2 31

VENERE 7×7 (somma 175)
22 47 16 41 10 35  4
 5 23 48 17 42 11 29
30  6 24 49 18 36 12
13 31  7 25 43 19 37
38 14 32  1 26 44 20
21 39  8 33  2 27 45
46 15 40  9 34  3 28

MERCURIO 8×8 (somma 260)
 8 58 59  5  4 62 63  1
49 15 14 52 53 11 10 56
41 23 22 44 45 19 18 48
32 34 35 29 28 38 39 25
40 26 27 37 36 30 31 33
17 47 46 20 21 43 42 24
 9 55 54 12 13 51 50 16
64  2  3 61 60  6  7 57

LUNA 9×9 (somma 369)
37 78 29 70 21 62 13 54  5
 6 38 79 30 71 22 63 14 46
47  7 39 80 31 72 23 55 15
16 48  8 40 81 32 64 24 56
57 17 49  9 41 73 33 65 25
26 58 18 50  1 42 74 34 66
67 27 59 10 51  2 43 75 35
36 68 19 60 11 52  3 44 76
77 28 69 20 61 12 53  4 45
```

- [CALCOLO] Esito della verifica: Saturno 15/45, Giove 34/136, Marte 65/325, Sole 111/666, Venere 175/1225, Mercurio 260/2080, Luna 369/3321. Tutte le righe, colonne e diagonali tornano. Nessuno dei sette è *pandiagonale* (le diagonali «spezzate» non danno la costante): chi scrive codice non deve contarci — verifica: calcolo locale in Python, questa sessione.
- [CALCOLO] Il quadrato della *Melencolia I* di Dürer è `16 3 2 13 / 5 10 11 8 / 9 6 7 12 / 4 15 14 1`. Somma 34 su righe, colonne e diagonali. Danno 34 anche i quattro quadranti 2×2, il quadrato centrale 2×2 e i quattro angoli. Nella riga in basso, al centro, si legge **15 14**, cioè 1514 — verifica: calcolo locale in Python, questa sessione.
- [CALCOLO] Il Giove di Agrippa e il quadrato di Dürer sono lo stesso quadrato trasformato: si capovolge il quadrato di Dürer dall'alto in basso e si scambiano le due colonne centrali, e si ottiene esattamente la tavola di Giove di Agrippa — verifica: calcolo locale in Python, questa sessione.
- [CALCOLO] La «riduzione teosofica» (sommare le cifre fino a una cifra sola) dà 666 → 9, 111 → 3, 2080 → 1. È l'operazione che il metodo delle nove camere rende sistematica: 1, 10 e 100 stanno nella stessa camera — verifica: calcolo locale in Python, questa sessione.

### Inferences
- I quadrati sono il pezzo **più sicuro e più forte** di tutta la tradizione per il codice. Sono matematica pura, si verificano con un test che diventa rosso se una cella è sbagliata, e prima di Agrippa erano già oggetti aritmetici nelle tradizioni cinese e araba (sezioni 2 e 5). Usarli non vuol dire evocare niente.
- **Per un negozio si usano i quadrati «benefici» di Ficino** (Giove 4×4, Sole 6×6, Venere 7×7, sezione 4), non Saturno (malinconia) né Marte (conflitto). Il Giove 4×4 è anche il quadrato di Dürer, quindi ha una storia artistica oltre che magica.
- **Il totale 666 del quadrato del Sole non deve affiorare mai**: niente 666 ms, 666 px, 666 elementi. La costante di linea 111 è innocua e si può usare. Nella tradizione, 666 è anche il numero dello «spirito» del Sole, materiale demonico escluso.
- Il metodo di tracciamento è calcolabile se si fissano tre regole: ① come una lettera diventa un numero; ② come un numero troppo grande «entra» nel quadrato (riduzione delle nove camere: si tolgono gli zeri, 200 → 2); ③ come si segnano lettere ripetute e doppie. Sui quadrati piccoli (Saturno ha solo 1–9) la riduzione è obbligatoria; sul Giove (1–16) serve meno.
- Nella tradizione il sigillo ha un cerchietto all'inizio e una barretta alla fine: è proprio quel segno a renderlo **riconoscibile come sigillo**. Per restare invisibili, nel sito la linea si disegna senza quei marcatori, smussata, dentro un altro oggetto (bordo, separatore, percorso di animazione).
- **Escluso esplicitamente** (il mandato vieta il demonico e l'offesa religiosa): i nomi e i sigilli degli Spiriti (demoni planetari); i nomi e i sigilli delle Intelligenze (angeli); i nomi divini ebraici associati a ogni tavola; ogni scongiuro, invocazione o consacrazione. Si tiene **solo la griglia di numeri**. Il sigillo si ricava dal nome del negozio o da una frase d'intenti, con un alfabeto latino moderno.

### Gaps
- Non ho potuto leggere il testo primario (Peterson, Esoteric Archives) né un facsimile del 1533. Restano da confermare: la disposizione esatta stampata da Agrippa per ogni tavola (le edizioni moderne potrebbero averle orientate in modo diverso); gli effetti che il testo attribuisce a ciascuna tavola incisa su metallo, con pianeta fortunato o sfortunato; i metalli, che ho dato a memoria (piombo, stagno, ferro, oro, rame, argento vivo, argento).
- La regola esatta con cui Agrippa ricava i «sigilli dei pianeti» (non quelli degli spiriti) dalla geometria del quadrato non è descritta nelle fonti trovate.
- Il collegamento esplicito tra la riduzione Aiq Bekar e il tracciamento sulle kamea è pratica della Golden Dawn e di autori del Novecento. Non ho trovato una fonte che lo documenti in Agrippa stesso.
- Dürer: la data 1514 e il titolo vengono dal mandato e dai numeri nel quadrato. Non ho una fonte letta su quale delle due direzioni di influenza tra Dürer e il manoscritto di Agrippa del 1510 sia accettata dagli storici (Panofsky e altri).
- Luca Pacioli: il *De viribus quantitatis* (1496–1508, manoscritto mai stampato in vita) è un grande compendio rinascimentale di giochi matematici e prestigio — [facsimiles.com](https://facsimiles.com/facsimiles/de-viribus-quantitatis); [HNN, *Magic compendium by Leonardo's best friend translated*](https://www.historynewsnetwork.org/article/37492). Le fonti sono in **conflitto** su dove sia il manoscritto: Biblioteca Universitaria di Bologna secondo il venditore di facsimili, Ambrosiana e Ginevra secondo Wikipedia (forse confuso con la *Divina proportione*) — [Wikipedia, Pacioli](https://www.Wikipedia.org/wiki/Pacioli). **Non ho potuto confermare** che contenga quadrati magici planetari. Se sì, sarebbe il precedente italiano (e vicino all'Emilia) più forte: va verificato.

---

## 2. Il quadrato Lo Shu (Cina) e il suo rapporto con il quadrato di Saturno

### Takeaway
Il Lo Shu e la tavola di Saturno di Agrippa sono **lo stesso quadrato**, perché esiste un solo quadrato magico 3×3, a meno di rotazioni e riflessioni. In Cina è un emblema cosmologico di buon augurio. Nell'Europa di Agrippa è il quadrato del pianeta della malinconia. È un caso raro in cui due culture caricano lo stesso oggetto matematico di significati opposti.

### Cited Findings
- [STORIA] Testimonianze: i testi datati intorno al 650 a.C. sono ambigui e parlano di una «mappa del fiume». Un quadrato magico è citato chiaramente entro l'80 d.C., e un esempio esplicito è dato dal 570 d.C. — [Wikipedia, *Luoshu Square*](https://en.wikipedia.org/wiki/Luoshu_Square)
- [TRADIZIONE] Secondo la leggenda, una tartaruga emerse dal fiume Luo con il disegno sul guscio. Il racconto risale almeno al V secolo a.C. ed è legato ai miti sull'invenzione della scrittura (Cangjie) — [Wikipedia, *Luoshu Square*](https://en.wikipedia.org/wiki/Luoshu_Square); [ProofWiki, nota storica sull'ordine 3](https://proofwiki.org/wiki/Magic_Square/Examples/Order_3/Historical_Note)
- [STORIA, debole] Una nota su arXiv data il quadrato intorno al 2800 a.C., ma con riserve, e le fonti enciclopediche non la sostengono. Suggerisce anche un passaggio Cina → India → paesi arabi, senza documentarlo — [arXiv 1011.0451](https://arxiv.org/pdf/1011.0451)
- [CALCOLO] Contando tutte le permutazioni di 1–9 escono esattamente **8** quadrati magici 3×3. Sono le 8 rotazioni e riflessioni di `4 9 2 / 3 5 7 / 8 1 6`, che è sia la forma classica del Lo Shu sia la tavola di Saturno di Agrippa — verifica: calcolo locale in Python, questa sessione.

### Inferences
- In una griglia di 9 elementi (9 categorie, 9 foto, 9 voci del menù) si può usare l'ordine Lo Shu: i valori 1→9 seguono il percorso del quadrato, e ogni riga, colonna e diagonale «pesa» 15. L'effetto è un equilibrio visivo che nessuno riconosce come quadrato magico.
- Per la doppia lettura (Cina: buon augurio; Agrippa: Saturno e malinconia), sul sito il 3×3 si usa per la sua matematica di equilibrio. Ficino suggerirebbe di bilanciarlo con colori di Giove, Sole o Venere (sezione 4).

### Gaps
- Non ho una fonte letta su *quando* e *come* il 3×3 sia entrato nella magia araba e poi europea come «quadrato di Saturno». Le opere da consultare sono Schuyler Cammann, «The Magic Square of Three in Old Chinese Philosophy and Religion» (*History of Religions*, 1961), e Frank Swetz, *Legacy of the Luoshu*: citate nei risultati, non lette.
- Non ho verificato quale orientamento (Sud in alto) usino le fonti cinesi più antiche.

---

## 3. Il metodo dei sigilli di Austin Osman Spare (XX secolo) e la chaos magic

### Takeaway
Spare ha creato il sigillo «laico» e moderno: si scrive una frase d'intenti, si tolgono le lettere ripetute e si fondono le lettere rimaste in un glifo. Il passo di riduzione è deterministico e si fa in codice. La composizione grafica e la «carica» sono arte e rito. È la tecnica che si adatta meglio a un negozio, perché parte dall'intenzione del titolare e non da nomi sacri.

### Cited Findings
- [STORIA] Spare scrisse *The Book of Pleasure (Self-Love): The Psychology of Ecstasy* fra il 1909 e il 1913 e lo pubblicò a sue spese nel 1913. Il libro conta per la chaos magic perché introduce le idee moderne sui sigilli. Alcuni capitoli citati nel testo mancano, a quanto pare distrutti nella Seconda guerra mondiale — [Wikipedia, *The Book of Pleasure*](https://en.wikipedia.org/wiki/The_Book_of_Pleasure)
- [TRADIZIONE] Il passo di riduzione: si scrive la frase del desiderio, si eliminano le lettere ripetute e con quelle rimaste si costruisce il sigillo. Un esempio riportato dalle fonti secondarie: «I desire the things of my pleasure» → IDESRTHNGOFMY — [Chumbley, *Sigil Magic*, archive.org](https://archive.org/download/andrew.chumbleyazoetia/Sigil%20Magic.pdf); [Wikipedia, *The Book of Pleasure*](https://en.wikipedia.org/wiki/The_Book_of_Pleasure)
- [MODERNO] Le guide successive propongono due varianti: dedup della frase intera (metodo 1), oppure frase spezzata in parti con dedup di ognuna (metodo 2). Poi le lettere diventano un sigillo grafico o un «mantra» — [Frater U.D., *Practical Sigil Magic*, archive.org](https://archive.org/download/LeftHandPath666/Practical-Sigil-Magic-Frater-UD_text.pdf)
- [CALCOLO] Applicando la regola alla frase intera esce **IDESRTHNGOFMYPLAU**, non IDESRTHNGOFMY: la parola «pleasure» aggiunge P, L, A, U. O la citazione è tagliata, o l'esempio originale usa un'altra frase. Esempio italiano: «Pane buono ogni giorno» → **PANEBUOGIR** — verifica: calcolo locale in Python, questa sessione.

### Inferences
- La sequenza di Spare si traduce bene in codice: frase d'intenti del negozio → lettere senza ripetizioni → seme deterministico per un segno generato (percorso su una kamea, sezione 1, o composizione di tratti). La frase non compare mai nel sito.
- Il «dimenticare il sigillo», centrale nel rito, ha un equivalente tecnico pulito: il segno esiste, ma non è etichettato né spiegato da nessuna parte. È ciò che il mandato chiede («mai mostrato come magia»).
- Va distinto: il dedup è una procedura; la fusione delle lettere in un glifo è gusto grafico; la «carica» è rito puro. Solo il primo passo è [CALCOLO]; il secondo, reso deterministico da noi, diventa [MODERNO].

### Gaps
- Non ho potuto leggere il testo del 1913. Mancano la formulazione esatta di Spare e il suo esempio originale; dalla memoria, di solito si cita una frase sulla «forza di una tigre», ma non è verificato.
- La chaos magic (Peter Carroll e Ray Sherwin dagli anni Settanta, poi la diffusione negli anni Ottanta e Novanta) non è coperta da una fonte letta in questa sessione: date e nomi sono da verificare. Le pratiche dei «servitori» e delle evocazioni della chaos magic sono **escluse** in ogni caso.

---

## 4. Magia naturale del Rinascimento italiano: Ficino, Pico, Bruno, Della Porta — e le corrispondenze esatte di Ficino

### Takeaway
Ficino (Firenze, *De vita libri tres*, 1489) è la fonte più adatta a un sito: una magia «naturale» di colori, materiali, musica e tempi per contrastare la malinconia di Saturno con le tre «Grazie», cioè **Giove, Venere e Sole**. Indica anche una terna di colori precisa: **verde, oro, zaffiro**. Della Porta (Napoli, *Magia naturalis*, 1558) aggiunge l'altro filo utile, quello dei cifrari e della scrittura nascosta.

### Cited Findings
- [STORIA] *De vita libri tres* (1489) ha tre libri: la salute fisica degli studiosi, il prolungamento della vita, le influenze astrali. Il terzo s'intitola *De vita coelitus comparanda*, titolo ripreso dal commento di Ficino a una sezione delle *Enneadi* di Plotino — [Wikipedia, *De vita libri tres*](https://en.wikipedia.org/wiki/De_vita_libri_tres)
- [STORIA] Ficino tratta gli studiosi come soggetti inclini agli eccessi della malinconia. L'influenza ambivalente di Saturno si compensa con i pianeti benefici: Sole, Giove, Venere (e Mercurio, secondo una sintesi) — [Wikipedia, *De vita libri tres*](https://en.wikipedia.org/wiki/De_vita_libri_tres)
- [STORIA] I tre pianeti benefici del Libro III sono Giove, Venere e Sole, le tre «Grazie». Ficino consiglia di usare la magia celeste per «accrescere l'influsso del Sole, di Giove o di Venere» (Libro III, cap. XIII) — [Wikipedia, *De vita libri tres*](https://en.wikipedia.org/wiki/De_vita_libri_tres)
- [STORIA] Gran parte del Libro III riguarda la fabbricazione di talismani figurati. Vanno fatti in un'ora stabilita dalle stelle e con il materiale del pianeta: per esempio **l'oro per il Sole** — [Ficino, *Three Books on Life*, ed. Kaske & Clark, 1989 (PDF)](https://dl1.cuni.cz/pluginfile.php/844588/mod_resource/content/0/Marsilio%20Ficino,%20Carol%20V.%20Kaske,%20John%20R.%20Clark%20-%20Three%20Books%20on%20Life%20(Medieval%20and%20Renaissance%20Texts%20and%20Studies)%20(1989).pdf)
- [STORIA] **I colori:** per un'immagine dell'universo Ficino consiglia verde, oro e zaffiro, per attirare l'influsso di Venere, Giove e Sole (le tre Grazie). Riferisce che gli antichi colorivano questa immagine con «i colori universali e singolari del mondo: verde, oro e zaffiro» — [*Ficino and Fantasy* (Brill), su dokumen.pub](https://dokumen.pub/ficino-and-fantasy-imagination-in-renaissance-art-and-theory-from-botticelli-to-michelangelo-9004459677-9789004459670.html); [Eye of the Psychic, *Ficino*](https://www.eyeofthepsychic.com/ficino_mag/)
- [STORIA] **Colore per pianeta**, nella citazione attribuita a Ficino: verde a Venere e alla Luna; oro al Sole («e non estraneo a Giove e Venere»); zaffiro dedicato soprattutto a Giove, a cui la pietra stessa sarebbe consacrata — [Eye of the Psychic](https://www.eyeofthepsychic.com/ficino_mag/); [*Ficino and Fantasy*](https://dokumen.pub/ficino-and-fantasy-imagination-in-renaissance-art-and-theory-from-botticelli-to-michelangelo-9004459677-9789004459670.html)
- [STORIA] **Il verde e la vista** (*De vita* II, xiv): il verde tempera il nero col bianco e quindi, insieme, «diletta e conserva la vista» — citazione riportata nei risultati di ricerca sul *De vita*; testo primario non letto (vedi Gaps)
- [STORIA] Gli studiosi sono divisi sulla natura del Libro III. Un articolo lo legge come neoplatonico e contesta la lettura «ermetica» di Frances Yates — [*Journal of the History of Ideas*/UChicago, doi 10.1086/691830](https://www.journals.uchicago.edu/doi/10.1086/691830). Un capitolo Springer lo tratta come trattato medico-magico, con Ficino convinto che l'anima si possa deificare con mezzi teurgici — [Springer, cap. 10.1007/978-3-030-67906-4_2](https://link.springer.com/chapter/10.1007%2F978-3-030-67906-4_2)
- [STORIA] Esiste una tesi della City University di Londra sulla musicoterapia astrologica di Ficino e sulla magia simpatica del *De vita coelitus comparanda*. Il contenuto non era nei risultati — [City, University of London, tesi open access](https://openaccess.city.ac.uk/id/eprint/7977/1/Magic,_astrology_and_music_-_the_background_to_Marsilio_Ficino's_astrological_music_therapy_and_his_role_as_a_Renaissance_magus.pdf)
- [STORIA] Giambattista Della Porta pubblica i *Magiae naturalis libri IIII* nel 1558, con una seconda edizione molto ampliata nel 1587. Scrive anche un trattato di **cifrari** (*De furtivis literarum notis vulgo de ziferis libri IV*, 1563) e uno di arte della memoria (*L'arte del ricordare*, 1566; versione latina 1602) — [Stanford Encyclopedia of Philosophy, *Giambattista della Porta*](https://plato.stanford.edu/archives/fall2025/entries/della-porta/)
- [STORIA] Giordano Bruno (1548–1600) compare nella voce su Della Porta solo per legami di cerchia napoletana — [SEP, *Giambattista della Porta*](https://plato.stanford.edu/archives/fall2025/entries/della-porta/)

### Inferences
- **Palette «delle tre Grazie»**: verde (Venere: riposo, «diletta e conserva la vista», adatto agli sfondi e alle grandi superfici), oro (Sole: accento, bottoni d'azione, prezzi), zaffiro (Giove: fiducia, link, contatti). È la traduzione più fedele e meno riconoscibile di tutto il filone: sembra solo una palette calda e ordinata.
- **Ficino è anche il criterio di scelta**: tra i sette quadrati si usano quelli delle tre Grazie (Giove 4×4, Sole 6×6, Venere 7×7). È coerente con la tradizione, non una scelta arbitraria nostra.
- **L'ora conta** nella sua magia (talismani «fatti in un'ora»): questo autorizza a legare piccole variazioni del sito ai giorni e alle ore planetarie (sezione 5), sempre senza toccare prezzi o contenuti commerciali.
- **Della Porta collega magia naturale e scrittura nascosta.** Il suo libro sui cifrari del 1563 è il precedente storico perfetto per uno strato «che c'è ma non si legge»: frase d'intenti nascosta nei metadati, nei nomi delle classi o come filigrana invisibile in un'immagine (steganografia). Il collegamento con la magia è nostro [MODERNO]; il fatto che lo stesso autore abbia scritto di magia naturale, memoria e cifrari è [STORIA].
- **Collegamento emiliano**: Pico era signore di Mirandola, oggi in provincia di Modena, in Emilia. È il nome del Rinascimento magico più vicino a Piacenza. (La biografia di Pico non è coperta da una fonte letta: vedi Gaps.)

### Gaps
- **Musica di Ficino**: non ho trovato in una fonte letta le «tre regole» per adattare il canto a un pianeta (*De vita* III, 21), né i modi o le corrispondenze musicali per Giove, Venere e Sole. Il suonare gli inni orfici sulla lira resta un ricordo non verificato. Per un sito interessa poco, perché l'audio automatico è comunque da evitare.
- **Profumi e materiali di Ficino** oltre l'oro per il Sole (incensi, piante, gemme per pianeta): non verificati.
- **Testo primario** del verde in *De vita* II, xiv e della terna verde/oro/zaffiro (capitolo esatto del Libro III, di solito indicato come III, 18): citati da fonti secondarie, non letti in Kaske & Clark.
- **Pico della Mirandola** (*Conclusiones* del 1486, *Oratio*, magia naturale e cabala cristiana) e **Bruno** (ruote della memoria lulliane, *De umbris idearum*, 1582): nessuna fonte letta in questa sessione. Restano da consultare Frances Yates (*Giordano Bruno and the Hermetic Tradition*, 1964; *The Art of Memory*, 1966) e D.P. Walker (*Spiritual and Demonic Magic from Ficino to Campanella*, 1958). Avvertenza: la cabala cristiana di Pico usa nomi divini, quindi va **esclusa** dalla traduzione, come i nomi divini di Agrippa.

---

## 5. Il Picatrix, il tempo elettivo e le ore planetarie

### Takeaway
Il Picatrix mette il **tempo** al centro: un talismano si fa nell'ora del suo pianeta, con il pianeta in buona posizione, e le 28 mansioni lunari organizzano il calendario. Le ore planetarie sono un **algoritmo esatto**: ordine caldeo più alba e tramonto del luogo. Per Piacenza si calcolano nel browser senza dati esterni.

### Cited Findings
- [STORIA] Il Picatrix (*Ghāyat al-Ḥakīm*) è un testo arabo composito di magia e astrologia, di solito datato all'XI secolo (c'è chi propone il X). Nel XIII secolo fu tradotto in spagnolo e poi in latino. Le mansioni lunari sono uno dei suoi principi organizzativi, alla base dell'astrologia elettiva e dei talismani — [Wikipedia, *Picatrix*](https://en.wikipedia.org/wiki/Picatrix)
- [TRADIZIONE] Il testo ripete che i talismani vanno fatti nell'ora del pianeta relativo; il pianeta dovrebbe anche essere in ascesa e nel proprio segno o in esaltazione — [Warnock (ed.), *The Picatrix – Selected Translations*](https://static1.squarespace.com/static/5f6e1fb02827913871797e3b/t/65986aa1e91b3e386dda4f99/1704487590772/Picatrix+-+Warnock.pdf)
- [TRADIZIONE] Alcune ricette chiedono un'ora planetaria precisa, altre no; alcune operazioni si affidano al solo giorno planetario — [Idola Stellarum, *Evaluating Magical Elections*](https://www.idolastellarum.com/blog/evaluation-elections-the-significator/)
- [TRADIZIONE] Ogni giorno della settimana appartiene a un pianeta, ogni pianeta ha le sue ore, e metalli e pietre sono assegnati ai pianeti — [Crazy Alchemist, *The Picatrix*](https://www.crazyalchemist.com/mysteries-esoterica/picatrix-astral-magic-history/)
- [STORIA] Le ore planetarie nascono nell'astrologia ellenistica, forse con radici babilonesi, e da loro vengono i nomi dei giorni della settimana — [Wikipedia, *Planetary hours*](https://en.wikipedia.org/wiki/Planetary_hours). L'etichetta «ordine caldeo» è moderna; Macrobio (V secolo d.C.) parlava di «sistema dei Caldei» — [The Astrology Podcast, *The Origin of the Chaldean Order*](https://theastrologypodcast.com/2026/08/16/the-origin-of-the-chaldean-order-and-planetary-days-of-the-week/). Un sito di divulgazione colloca l'ordine fra l'VIII e il VI secolo a.C. a Babilonia, ma la datazione **non è verificata** — [Astronoo](https://astronoo.com/en/articles/order-of-days-of-the-week.html)
- [STORIA] L'ordine, dal pianeta più lontano al più vicino: **Saturno, Giove, Marte, Sole, Venere, Mercurio, Luna**. Ogni ora è governata dal pianeta successivo nella sequenza — [Celestron, *The planetary week*](https://www.celestron.com/blogs/knowledgebase/the-planetary-week-how-astronomy-gave-us-the-days-of-the-week); [Sacred Astronomy](https://pug-chameleon-86bx.squarespace.com/sacred-astronomy)
- [STORIA] 24 ore = 3 giri completi di 7 + 3 ore di avanzo. Per questo la prima ora di ogni giorno cade tre posti più avanti nella sequenza, e ne esce l'ordine dei giorni della settimana — [Wikipedia, *Planetary hours*](https://en.wikipedia.org/wiki/Planetary_hours)
- [STORIA] La durata delle ore cambia con la stagione e la latitudine (ore «ineguali») — [Sacred Astronomy](https://pug-chameleon-86bx.squarespace.com/sacred-astronomy). Le lingue romanze conservano la Luna e i pianeti nei nomi dei giorni; sabato e domenica hanno preso altre strade — [Celestron](https://www.celestron.com/blogs/knowledgebase/the-planetary-week-how-astronomy-gave-us-the-days-of-the-week)
- [CALCOLO] Partendo da Saturno e avanzando di 24 ore ogni giorno, i signori dei giorni sono: Saturno (sabato), Sole (domenica), Luna (lunedì), Marte (martedì), Mercurio (mercoledì), Giove (giovedì), Venere (venerdì). Le 12 ore diurne del giovedì: Giove, Marte, Sole, Venere, Mercurio, Luna, Saturno, Giove, Marte, Sole, Venere, Mercurio — verifica: calcolo locale in Python, questa sessione.

### Inferences
- **Algoritmo per il sito** [CALCOLO della tradizione, MODERNO nell'uso]: ① si calcolano alba e tramonto di Piacenza per la data (formula astronomica standard, latitudine circa 45° N); ② durata dell'ora diurna = (tramonto − alba) / 12, poi lo stesso per la notte (tramonto → alba successiva); ③ la prima ora del giorno appartiene al signore del giorno, le altre seguono l'ordine caldeo. Tutto deterministico, senza rete e senza dati personali.
- **In italiano il giorno planetario è già nel nome** (lunedì, martedì, mercoledì, giovedì, venerdì): un piccolo accento di colore che cambia col giorno sembra solo «varietà», non astrologia. Giovedì (Giove) zaffiro, venerdì (Venere) verde, domenica (Sole) oro.
- **Paletto commerciale tassativo**: il tempo può cambiare *come appare* il sito (un accento, una sfumatura, l'ordine di un'animazione), **mai prezzi, offerte o contenuti di vendita**. Le regole di MyCity vietano i «prezzi che ballano» (CONTESTO_BUSINESS) e la normativa sulle pratiche scorrette lo renderebbe rischioso (sezione 8).
- **Uso «elettivo» invisibile**: a parità di altre condizioni, uscite programmate (pubblicazione di un sito, newsletter, post) si possono mettere in un'ora di Giove, Venere o Sole. Lo spareggio non si vede e non costa niente, ma non deve mai vincere sull'orario che conviene davvero al negozio.
- **Mansioni lunari**: anche le 28 mansioni del Picatrix sono calcolabili dalla posizione della Luna. Offrono un ciclo di circa 27–28 giorni per micro-variazioni che non si ripetono ogni settimana (vedi l'effetto «decadimento della sorpresa», sezione 8).

### Gaps
- Non ho la tabella delle 28 mansioni del Picatrix con i loro nomi e gradi, né le regole elettive dettagliate per pianeta.
- Le coordinate di Piacenza (circa 45,05° N, 9,69° E) e la formula alba/tramonto sono conoscenza generale, non verificate su una fonte in questa sessione; per il codice va scelta una formula di riferimento (per esempio quella NOAA) con test.

---

## 6. Il quadrato del Sator (Pompei, Dura-Europos): testo, palindromia, uso apotropaico in Italia

### Takeaway
SATOR · AREPO · TENET · OPERA · ROTAS si legge uguale in quattro direzioni, ha TENET a croce al centro, e le sue 25 lettere si ridispongono esattamente in due PATERNOSTER incrociati più A, O, A, O. È attestato a Pompei prima del 62 d.C. ed è stato usato come formula protettiva per secoli. Per un sito ne vale la **struttura palindromica**, non il testo: il testo ha letture religiose e va lasciato fuori.

### Cited Findings
- [STORIA] I quadrati più antichi conosciuti sono nella forma ROTAS (ROTAS OPERA TENET AREPO SATOR). Il più antico viene da Pompei ed è anteriore al terremoto del 62 d.C. Secondo Wikipedia, l'esemplare su una colonna della Palestra Grande fu trovato nel 1936; una data del 1868 per un ritrovamento a Pompei (fonte Substack) **non è verificata** — [Wikipedia, *Sator Square*](https://en.wikipedia.org/wiki/Sator_Square); [Substack, *The Sator Square*](https://worldpolitics.substack.com/p/sator-square-ancient-rome)
- [STORIA] A Dura-Europos gli scavi del 1931–32 trovarono tre iscrizioni, tutte nella forma ROTAS, sulle pareti interne di un ufficio militare romano; la Yale University Art Gallery data l'esemplare al 165–256 d.C. circa — [Wikipedia, *Sator Square*](https://en.wikipedia.org/wiki/Sator_Square)
- [TRADIZIONE] Al quadrato sono stati attribuiti a lungo poteri magici, tra cui spegnere gli incendi, soprattutto in Germania. Le proprietà palindromiche gli avrebbero dato potere apotropaico (cioè protettivo) nelle tradizioni magiche pagane — [Wikipedia, *Sator Square*](https://en.wikipedia.org/wiki/Sator_Square)
- [STORIA] Il dibattito: alcuni studiosi lo legano ai primi cristiani; i ritrovamenti di Pompei hanno spinto molti a vederlo come un gioco di parole romano. Altri lavori propongono strutture nascoste ebraiche o pitagoriche (Vinel, 2006). Un articolo su arXiv del 2024 lo considera un semplice palindromo o gioco di parole — [Wikipedia, *Sator Square*](https://en.wikipedia.org/wiki/Sator_Square); [Vinel, *Revue de l'histoire des religions*](https://shs.cairn.info/article/E_RHR_2232_0003/pdf?lang=en); [arXiv 2404.01048](https://arxiv.org/abs/2404.01048v1)
- [CALCOLO] Letto come stringa di 25 lettere, il quadrato è identico al contrario, e le colonne sono identiche alle righe. Le 25 lettere coincidono esattamente con PATERNOSTER + PATERNOSTER (con la N in comune) + A, O, A, O. Il conteggio verifica l'anagramma, non la sua intenzione storica — verifica: calcolo locale in Python, questa sessione.

### Inferences
- **Struttura, non testo**: dal Sator si prende la palindromia. La sequenza delle sezioni di una pagina può essere speculare (A B C B A); un'animazione può percorrere una griglia 5×5 «a bustrofedo» (andata e ritorno, come si legge il quadrato); una griglia di link nel piè di pagina può essere simmetrica rispetto al centro. Nessuno lo riconosce.
- **Il testo SATOR va evitato** come elemento visibile o anche nascosto ma leggibile. Ha letture cristiane (PATERNOSTER, Alfa-Omega) e ipotesi ebraiche: mostrarlo in un sito commerciale rischia di sembrare un uso di simboli religiosi per vendere.
- È un **collegamento italiano autentico**: tra i reperti più antichi c'è Pompei. Va bene come racconto nella documentazione interna, non nel sito.

### Gaps
- Non ho una fonte letta sugli esemplari italiani medievali (Siena, Duomo; Pieve di San Giovanni a Campiglia Marittima; Valvisciolo; Capestrano; altri), né su eventuali esemplari in Emilia o nel Piacentino. Sarebbe un ottimo aggancio locale da cercare.
- Chi propose la teoria del PATERNOSTER (di solito si cita Felix Grosser, 1926) e il significato di AREPO non sono verificati in questa sessione.
- Usi popolari specifici (contro il morso dei cani, la febbre, per il parto) citati nella letteratura: non verificati.

---

## 7. Tradizioni apotropaiche e porta-fortuna in Italia e in Emilia (cornicello, ferro di cavallo, malocchio): cosa si può astrarre, cosa evitare

### Takeaway
Cornicello, ferro di cavallo e riti contro il malocchio sono **folclore vivo, riconoscibile e spesso basato sulla paura**. Sono quindi l'opposto di uno strato nascosto ed elegante. Per un sito si evitano. Si può tenere, al massimo, un'idea astratta e innocua: la forma a U aperta in alto come «contenitore che accoglie», che resta comunque rischiosa.

### Cited Findings
- [TRADIZIONE] Il malocchio è un danno portato dagli sguardi invidiosi. Il cornicello (cornetto napoletano) è un amuleto apotropaico che nella credenza popolare italiana allontana il malocchio e la sfortuna. Nel Sud Italia si appendono anche peperoncini secchi contro il malocchio — [Wikipedia, *Cornicello*](https://en.wikipedia.org/wiki/Cornicello); [Geopop, *Perché il cornetto napoletano porta fortuna*](https://www.geopop.it/perche-il-cornetto-napoletano-porta-fortuna-ed-e-a-forma-di-peperoncino-il-significato-del-simbolo-storia/)
- [TRADIZIONE] Ferro di cavallo: la leggenda più citata è quella di San Dunstano, fabbro, che inchiodò il ferro allo zoccolo del diavolo e lo liberò solo in cambio della promessa di non entrare nelle case con un ferro appeso. Le origini storiche sono incerte; altri collegano la forma alla luna crescente o a un uso magico già romano — [Cavallo Magazine, *Per la fortuna tocca ferro*](https://cavallomagazine.it/cultura-equestre/per-la-fortuna-tocca-ferro); [Focus, *Perché tocchiamo ferro e facciamo le corna*](https://www.focus.it/cultura/mistero/superstizioni-perche-tocchiamo-ferro-e-facciamo-le-corna)
- [TRADIZIONE] Appeso con le punte in alto (a U) terrebbe lontano il male e porterebbe fortuna alla casa — [Focus](https://www.focus.it/cultura/mistero/superstizioni-perche-tocchiamo-ferro-e-facciamo-le-corna)
- [TRADIZIONE] Il ferro era considerato un metallo magico, capace di scacciare gli spiriti maligni: da qui l'uso italiano di «toccare ferro» invece che legno — [Focus](https://www.focus.it/cultura/mistero/superstizioni-perche-tocchiamo-ferro-e-facciamo-le-corna)
- [STORIA] La superstizione resta diffusa e ambivalente nell'Italia moderna («non è vero, ma ci credo») — [Daily Sabah, *Superstition in modern Italy*](https://www.dailysabah.com/arts/its-not-true-yet-believe-it-superstition-in-modern-italy/news/amp); [Meer, *Occhio, malocchio: la tradizione degli scongiuri*](https://www.meer.com/it/80333-occhio-malocchio-la-tradizione-degli-scongiuri)

### Inferences
- **Da evitare**: il cornicello, perché è un'icona riconoscibile, legata a Napoli e kitsch in un negozio piacentino; il malocchio e i suoi riti (olio nell'acqua, preghiere, formule tramandate), perché sono pratiche religioso-popolari, fanno leva sulla paura e potrebbero offendere chi li vive come fede o come superstizione da combattere; corna, mano fica e gesti, perché sono volgari o ambigui.
- **Astrazione possibile ma da usare con cautela**: la curva a U aperta in alto (il «ferro» come contenitore) come forma di un elemento grafico, per esempio la base di un logo generato o un separatore. Va bene solo se non diventa un ferro di cavallo riconoscibile.
- **Principio generale**: lo strato nascosto deve essere *apotropaico solo nella struttura* (ordine, equilibrio, simmetria), mai nel simbolo. Un simbolo popolare riconosciuto è l'esatto contrario di «mai mostrato come magia».

### Gaps
- Non ho trovato fonti specifiche sull'Emilia o su Piacenza (nomi dialettali, riti, segni portafortuna locali, la «segnatura» delle guaritrici, se presente nel Piacentino). Servirebbe una ricerca mirata su raccolte di folklore emiliano.

---

## 8. Il design moderno: «Enchanted Objects», la delizia nella UX (Kano, micro-interazioni), la terza legge di Clarke, e il confine etico tra incanto e manipolazione

### Takeaway
Per il design contemporaneo un oggetto è «incantato» quando dà informazioni o piacere senza chiedere attenzione (Rose, 2014). La delizia, nel modello di Kano, si consuma col tempo: ciò che sorprende oggi è normale domani. Il confine etico è netto: lo strato nascosto può cambiare **come ci si sente** nel sito, mai **cosa si decide** contro il proprio interesse. Le tecniche «subliminali» o ingannevoli sono vietate o regolate in UE (DSA art. 25, AI Act art. 5).

### Cited Findings
- [STORIA] David Rose, *Enchanted Objects: Design, Human Desire, and the Internet of Things*, Scribner, New York 2014. Gli oggetti quotidiani con tecnologia incorporata intuiscono i bisogni delle persone e soluzioni efficienti vanno insieme a una tecnologia che delizia i sensi — [Simon & Schuster](https://www.simonandschuster.com/books/Enchanted-Objects/David-Rose/9781476725642); [Internet Archive, scheda del libro](https://archive.org/details/enchantedobjects0000rose)
- [STORIA] Rose viene dal MIT Media Lab ed è autore di *Enchanted Objects* (2014) e *SuperSight* (2021) — [Wikipedia, *David L. Rose*](https://en.wikipedia.org/wiki/David_L._Rose)
- [STORIA] Il suo esempio chiave è l'Ambient Orb: mostra un'informazione in modo discreto sfruttando l'elaborazione pre-attentiva (si capisce «con la coda dell'occhio», senza leggere) — [Stephenson Strategies, recensione](http://www.stephensonstrategies.com/enchanted-objects-adding-delight-to-the-iot-formula/)
- [STORIA] Modello di Kano: le funzioni che deliziano oggi diventano prima prestazioni attese e poi requisiti di base, man mano che i clienti si abituano e i concorrenti copiano. Si consiglia di rifare l'analisi periodicamente — [Agile Brand Guide, *Kano Model*](https://agilebrandguide.com/wiki/models/kano-model/). Togliere una «delizia» non abbassa la soddisfazione: il decadimento dipende da aspettative che crescono, non da una perdita — [Blogboard, *Kano Model Examples*](https://blogboard.io/blog/kano-model-how-to-build-great-products-with-a-simple-mental-model/). Avvertenza: sono fonti divulgative, e non ho trovato uno studio empirico che misuri la velocità del decadimento.
- [STORIA] «Dark patterns»: il termine risale a Harry Brignull (2010) e indica pratiche di design manipolative e ingannevoli nei servizi online — [Policy Review, 2025](https://policyreview.info/pdf/policyreview-2025-4-2047.pdf)
- [STORIA] Il Digital Services Act (art. 25, definizione al considerando 67) è il primo testo UE vincolante che vieta esplicitamente i dark pattern. L'art. 25(3) permette alla Commissione linee guida su pratiche specifiche ed esclude ciò che è già coperto dalla direttiva sulle pratiche commerciali sleali o dal GDPR — [EPRS, *Regulating dark patterns in the EU*](https://epthinktank.eu/2025/01/14/regulating-dark-patterns-in-the-eu-towards-digital-fairness/); [Maastricht Working Paper 2025-4](https://www.maastrichtuniversity.nl/sites/default/files/2025-06/MWP%202025-4.pdf)
- [STORIA] L'AI Act, art. 5(1)(a), vieta i sistemi di IA che usano tecniche subliminali; l'art. 5(1)(b) vieta tecniche volutamente manipolative o ingannevoli che sfruttano vulnerabilità. Termini come «tecnica subliminale» richiedono un'interpretazione caso per caso, e i critici ritengono che l'accento sul subliminale sia eccessivo e ambiguo — [Cambridge, *Fairness by design*](https://www.cambridge.org/core/product/9F32AFC1AD43FAA7F2F271DADB2F09FF/core-reader); [arXiv 2407.10340, rassegna sistematica](https://arxiv.org/pdf/2407.10340)
- [STORIA] È in preparazione un Digital Fairness Act che riguarda anche i dark pattern — [Osborne Clarke, *Digital Fairness Act Unpacked: Dark Patterns*](https://www.osborneclarke.com/insights/digital-fairness-act-unpacked-dark-patterns)

### Inferences
- **Dove passa il confine**: lo strato «magico» è legittimo finché è *non riconoscibile* ma *percepibile come qualità*: proporzioni, equilibrio, palette, ritmo. Diventa illegittimo se è *non percepibile* e mirato a spingere una decisione (subliminale), o se altera scelte economiche (urgenza falsa, prezzi che cambiano con l'ora, nascondere informazioni). Regola pratica: **lo strato nascosto non può mai toccare prezzi, offerte, consenso, pagamenti, testi di vendita.**
- **Contro il decadimento di Kano**: le variazioni legate a giorni planetari (ciclo di 7), mansioni lunari (circa 28) e ore ineguali (stagionali) producono micro-sorprese che ruotano da sole e non diventano mai «la solita animazione». È l'argomento di design più forte per usare il tempo della tradizione.
- **Lezione di Rose per un negozio**: l'incanto più utile è un segnale ambientale vero, per esempio il segno che respira piano quando il negozio è aperto in quel momento. Usa informazioni reali (orari), si capisce con la coda dell'occhio e non mente.
- **Trasparenza interna**: tutto lo strato va documentato nel codice e nella documentazione del progetto, così che nessuno scambi un meccanismo estetico per una tecnica di persuasione nascosta. Il segreto è verso il visitatore (non lo mostriamo come magia), non verso il negoziante o un controllore.

### Gaps
- **Dan Saffer, *Microinteractions* (O'Reilly, 2013)**: la struttura in quattro parti (*trigger* → *rules* → *feedback* → *loops & modes*) la ricordo a memoria; nessuna fonte letta in questa sessione la conferma.
- **Disney**: i «principi della magia» (Imagineering: storia, dettagli nascosti come gli *Hidden Mickeys*, «plussing»; i 12 principi dell'animazione di Thomas e Johnston, *The Illusion of Life*, 1981) non sono coperti da una fonte letta. Da verificare prima di citarli.
- **Terza legge di Clarke** («Ogni tecnologia sufficientemente avanzata è indistinguibile dalla magia», di solito datata all'edizione 1973 di *Profiles of the Future*): citazione nota ma non verificata qui.
- **NN/g sulla delizia** (per esempio la «piramide» dei bisogni UX o gli articoli sulle soglie di risposta di 0,1, 1 e 10 secondi): non trovati in questa sessione.
- **Recepimento italiano** della direttiva sulle pratiche commerciali sleali (Codice del Consumo, artt. 20–27) e il suo uso contro il design ingannevole su siti piccoli: non verificato. È la norma che conta davvero per il sito di un negozio, perché il DSA art. 25 riguarda le piattaforme online.

---

## 9. Quali tecniche sono calcolabili e deterministiche (buone per il codice) e quali solo intenzione e rito — con la traduzione di ognuna in un meccanismo del sito

### Takeaway
Quasi tutto ciò che nella tradizione è **numero, ordine e tempo** si calcola in modo esatto: quadrati magici, tracciamento dei sigilli, riduzioni numeriche, dedup di Spare, ore e giorni planetari, mansioni lunari, palindromi. Ciò che è **carica, consacrazione, invocazione, fede** non si traduce e non va tradotto. Le corrispondenze (colore ↔ pianeta) sono tabelle fisse: deterministiche nel codice, «vere» solo dentro la tradizione.

### Cited Findings
- [CALCOLO] Quadrati magici: deterministici e verificabili con un test. Sette tavole, costanti 15/34/65/111/175/260/369 — verifica locale, sezione 1.
- [TRADIZIONE→CALCOLO] Tracciamento di un nome sulla kamea: lettere → numeri → celle in sequenza → linea — [Aeternum](https://aeternum.fr/en/blogs/les-carnets-d-aeternum/carres-magiques-et-pouvoirs-planetaires). Riduzione per far entrare i numeri nella griglia: le nove camere, unità/decine/centinaia nella stessa camera — [Collegium](https://collegium.fandom.com/wiki/Qabalah_of_nine_chambers)
- [CALCOLO] Esempio con regola moderna (lettere latine ridotte «alla pitagorica», A=1…I=9, J=1…, invenzione [MODERNO]) sul quadrato di Saturno: PIACENZA → 7, 9, 1, 3, 5, 5, 8, 1 → celle (riga, colonna) (1,2) (0,1) (2,1) (1,0) (1,1) (1,1) (2,0) (2,1). La doppia E-N cade due volte sulla stessa cella: serve una regola grafica per le ripetizioni (un piccolo anello o un nodo) — verifica: calcolo locale in Python, questa sessione.
- [TRADIZIONE→CALCOLO] Dedup delle lettere di Spare — [Frater U.D.](https://archive.org/download/LeftHandPath666/Practical-Sigil-Magic-Frater-UD_text.pdf); verifica locale, sezione 3.
- [STORIA→CALCOLO] Ore e giorni planetari: ordine caldeo e scarto di 3 al giorno — [Wikipedia, *Planetary hours*](https://en.wikipedia.org/wiki/Planetary_hours); verifica locale, sezione 5.
- [TRADIZIONE] Talismani da fare nell'ora del pianeta, con il pianeta in buona posizione (elezione: regole calcolabili se si conosce il cielo) — [Warnock, Picatrix](https://static1.squarespace.com/static/5f6e1fb02827913871797e3b/t/65986aa1e91b3e386dda4f99/1704487590772/Picatrix+-+Warnock.pdf)
- [STORIA] Tabella fissa dei colori: verde Venere (e Luna), oro Sole, zaffiro Giove — [*Ficino and Fantasy*](https://dokumen.pub/ficino-and-fantasy-imagination-in-renaissance-art-and-theory-from-botticelli-to-michelangelo-9004459677-9789004459670.html); [Eye of the Psychic](https://www.eyeofthepsychic.com/ficino_mag/)
- [STORIA] Cifrari e scrittura nascosta nel Rinascimento napoletano (Della Porta, 1563) — [SEP](https://plato.stanford.edu/archives/fall2025/entries/della-porta/)

### Inferences

**Classificazione** (tutte le righe sono inferenze ricavate dai fatti sopra):

| Tecnica | Natura | Per il codice |
|---|---|---|
| Quadrati magici (kamea, Lo Shu, Dürer) | aritmetica pura | **sì**, con test sulle somme |
| Tracciamento sigillo su kamea | procedura (con regole da fissare) | **sì**, se la regola lettere→numeri è fissata (scelta nostra) |
| Riduzione nove camere / somma delle cifre | aritmetica | **sì** |
| Dedup di Spare | procedura | **sì** |
| Fusione grafica delle lettere (Spare) | gusto, arte | solo se resa deterministica da noi [MODERNO] |
| Ore e giorni planetari, mansioni lunari | astronomia più convenzione | **sì**, calcolo locale con alba e tramonto |
| Elezione del momento (Picatrix) | regole astrologiche | in parte (solo giorno e ora; il resto richiede effemeridi) |
| Palindromia del Sator, bustrofedo | combinatoria | **sì** |
| Corrispondenze Ficino (colori, metalli) | tabella fissa | **sì**, come costanti |
| Musica planetaria di Ficino | prassi poco documentata | no (e niente audio automatico) |
| Arte della memoria (Della Porta, Bruno) | tecnica mentale | indiretta: «luoghi» fissi e coerenti nella navigazione |
| Carica, consacrazione, «dimenticare», invocazione, preghiere contro il malocchio | rito e intenzione | **no**, fuori dal codice e fuori dal progetto |

**Traduzione in meccanismi del sito** (tutte [MODERNO]; il riferimento tra parentesi dice da dove viene):

1. **Griglie a peso costante** (kamea Giove/Sole/Venere; Lo Shu per 9 elementi): in una griglia 4×4 o 3×3, l'ordine di comparsa o la «priorità visiva» delle schede segue il numero della cella. Ogni riga e colonna somma uguale, quindi nessuna zona della griglia è più «pesante» delle altre. Invisibile.
2. **Ritmo di rivelazione** (kamea): il ritardo di comparsa di ogni scheda = valore della cella × un'unità base (per esempio 30 ms). L'animazione percorre il quadrato nel suo ordine 1 → n² invece che da sinistra a destra. Invisibile come schema, percepito come «movimento curato».
3. **Segno generato del negozio** (tracciamento su kamea più dedup di Spare): frase d'intenti del titolare → dedup → numeri → percorso sul Giove 4×4 o sul Venere 7×7 → linea SVG smussata, senza cerchietto iniziale né barretta finale. Usi: percorso dell'icona di caricamento, linea di un separatore, filigrana a bassissima opacità, cornice del QR del negozio. Unico per ogni negozio e riproducibile con lo stesso input.
4. **Palette delle tre Grazie** (Ficino): verde per le superfici di riposo, oro per l'accento d'azione, zaffiro per i link e la fiducia, nei toni del marchio del negozio. Da verificare sempre il contrasto per l'accessibilità.
5. **Accento del giorno planetario** (ordine caldeo): giovedì zaffiro, venerdì verde, domenica oro; gli altri giorni restano sul colore base. Calcolato nel browser con l'ora di Piacenza. Mai su prezzi o offerte.
6. **Respiro delle ore ineguali** (ore planetarie): la durata di un'animazione lenta (il respiro del segno «aperto ora») si allunga d'estate e si accorcia d'inverno, seguendo la lunghezza dell'ora del giorno. Quasi impercettibile, sempre vero.
7. **Pagina palindroma** (Sator): ordine delle sezioni speculare (racconto – prodotti – contatti – prodotti – racconto, o simile), griglie di piè di pagina simmetriche, animazione a bustrofedo su griglie 5×5. Senza mai il testo SATOR.
8. **Intento nascosto «alla Della Porta»** (cifrari): la frase d'intenti del negozio vive in un attributo dati o in un commento del codice, o come filigrana steganografica nell'immagine principale. Si può leggere in un controllo tecnico, ma non è mostrata.
9. **Luoghi della memoria** (ars memoriae): ogni tipo di contenuto sta sempre nello stesso «luogo» e con lo stesso colore in tutte le pagine del sito e in tutti i siti MyCity. Il visitatore impara il sito al primo giro.
10. **Spareggio elettivo** (Picatrix): le pubblicazioni programmate scelgono, a parità di condizioni, un'ora di Giove, Venere o Sole. Lavoro dietro le quinte, nessun effetto visibile.

**Escluso, con il motivo:**
- Nomi e sigilli degli Spiriti planetari (demoni in Agrippa) e il numero 666 come elemento visibile o parametro: demonico.
- Nomi e sigilli delle Intelligenze (angeli), nomi divini ebraici, cabala cristiana di Pico: uso di nomi sacri in un contesto commerciale, potenzialmente offensivo.
- Testo del Sator: letture cristiane ed ebraiche.
- Riti contro il malocchio, cornicello, corna: folclore religioso-popolare, basato sulla paura, riconoscibile.
- Ogni tecnica che agisca sotto la soglia di percezione per spingere una decisione (subliminale) o che cambi prezzi o offerte con l'ora: vietata dall'etica (e, nei casi previsti, dalla normativa UE) e dalle regole di MyCity.

### Gaps
- Le regole tecniche sono scelte nostre e vanno fissate e testate: lettere→numeri (alfabeto latino ridotto, scelta [MODERNO]), ripetizioni, formula di alba e tramonto. Nessuna fonte tradizionale prescrive un alfabeto latino per le kamea.
- Non ho misure (studi o test A/B) che dimostrino che griglie «a peso costante» o palette ficiniane migliorino la percezione o le conversioni. Il beneficio atteso è estetico e di coerenza, non dimostrato.
- Accessibilità: le animazioni (punti 2 e 6) devono rispettare la preferenza di sistema «riduci movimento»; i colori (punti 4 e 5) vanno verificati sul contrasto. Non ho verificato le soglie qui.
