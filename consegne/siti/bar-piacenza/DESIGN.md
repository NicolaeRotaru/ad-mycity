# Bar Piacenza — piano di design

> Scritto prima del codice (fase 0). Ogni scelta presa dove la specifica era ambigua è annotata
> in fondo, nella sezione **Scelte e assunzioni**.

---

## 1. Soggetto

**Il bar della città.** Il nome non è un nome di fantasia: è il nome della città. Chi lo legge
pensa «il bar di Piacenza», quello in centro, quello dove ci si dà appuntamento. Il sito deve
reggere questo peso senza diventare folklore.

Il vocabolario che usiamo, preso dal bar italiano vero:

- **l'insegna**: la fascia smaltata sopra la vetrina, con le lettere in ottone, e il cassonetto
  luminoso con la scritta BAR che si accende al mattino;
- **il cartello sulla porta**, «aperto / chiuso», appeso con il cordino;
- **il bancone in marmo**, la macchina dell'espresso cromata, le tazzine sopra lo scaldatazze,
  il bicchiere d'acqua accanto al caffè;
- **il listino prezzi** appeso dietro al banco, obbligatorio in ogni bar italiano;
- **la graniglia** del pavimento, le viti in ottone che tengono le targhe smaltate.

E il vocabolario di Piacenza, usato con misura:

- il **Palazzo Gotico**: marmo bianco sotto, mattone sopra, i merli a coda di rondine;
- i **tre salumi DOP piacentini** (coppa, salame, pancetta): sono il tagliere dell'aperitivo;
- il **Gutturnio** e l'**Ortrugo** dei Colli Piacentini al calice;
- **Bodoni**, che lavorò a Parma, a sessanta chilometri: il suo carattere per i titoli è un
  legame vero con il territorio, non un vezzo.

## 2. Pubblico e lavoro principale della pagina

Chi apre il sito, quasi sempre dal telefono:

| Chi | Da dove arriva | Cosa vuole in 5 secondi |
|---|---|---|
| Il cliente di passaggio | Google: «bar Piacenza», «colazione Piacenza» | È aperto adesso? Dov'è? |
| Il cliente abituale | Link in bio di Instagram | C'è una serata? Posso prenotare un tavolo? |
| Chi è già seduto | QR del menu al tavolo | Il menu, leggibile con poca luce |
| Il titolare del bar | Link mandato su WhatsApp dall'agenzia | «È il mio bar, ed è bello» |

**Il lavoro principale della home**: dire subito se il bar è aperto, dove si trova e come
contattarlo. Tutto il resto viene dopo. Per questo lo stato live sta dentro l'insegna,
nel primo schermo, e la barra in basso dà sempre Chiama, Indicazioni e WhatsApp.

## 3. Concept: «L'insegna della città»

Il coraggio si spende in un posto solo: **l'insegna nel primo schermo**.

- Una fascia verde smaltata con le viti d'ottone agli angoli. Dentro, «Piacenza» in Bodoni
  con le lettere color ottone. Accanto, il **cassonetto luminoso BAR**, crema con le lettere
  rosso bitter.
- Al caricamento il cassonetto **si accende**: è l'unico momento animato del sito. Insieme si
  accende il **cartello sulla porta** con lo stato vero: «Aperto ora, chiude alle 20:00».
- **Quando il bar è chiuso il cassonetto resta spento**: l'insegna dice la verità. Lo stato si
  capisce comunque dal testo e dall'icona; la luce è solo un rinforzo.

Tutto il resto della pagina è quieto: marmo chiaro, testo verde bottiglia, filetti d'ottone
usati di rado, nessuna animazione allo scroll.

## 4. Piano dei token

### 4.1 Palette (contrasti misurati con la formula WCAG 2.x)

| Nome | Hex | Ruolo | Contrasti verificati |
|---|---|---|---|
| Verde bottiglia | `#12372A` | Colore scuro al posto del nero: testo, insegna, piè di pagina | su Marmo **11,48:1** |
| Verde notte | `#0C2A1F` | Fondo del piè di pagina e della barra azioni | su Marmo **13,49:1** |
| Marmo | `#EEF1EC` | Fondo della pagina, freddo e chiaro | — |
| Marmo venato | `#DDE3DC` | Superfici secondarie (righe alternate, facciata mappa) | Verde su questo **10,4:1** circa |
| Ottone | `#B5894B` | Solo filetti, cornici, viti, icone grandi. **Mai testo su fondo chiaro** (2,77:1) | su Verde **4,14:1** (solo elementi grafici e testo grande) |
| Ottone chiaro | `#D9B77A` | Testo e dettagli su fondo verde | su Verde **6,85:1** |
| Rosso bitter | `#B3152B` | Pochissimi accenti: il BAR acceso, lo stato «aperto», il focus | su Marmo **6,02:1**; bianco su Rosso **6,87:1** |
| Grigio graniglia | `#5E665F` | Testi secondari, descrizioni del menu | su Marmo **5,20:1**; su bianco **5,93:1** |

Regole: il rosso compare al massimo in tre punti per schermo; l'ottone non porta mai testo su
fondo chiaro; il colore non porta mai da solo un'informazione.

### 4.2 Tipografia

| Famiglia | Ruolo | File |
|---|---|---|
| **Bodoni Moda** (variabile: peso e dimensione ottica) | Wordmark, titoli h1–h3, i numeri grandi degli orari e della data degli eventi. **Solo da 24 px in su.** | 1 file woff2, subset latin, 46 KB |
| **Atkinson Hyperlegible Next** (variabile: peso) | Testo, menu, prezzi, moduli, pulsanti, interfaccia | 1 file woff2, subset latin |

Due file in tutto (il limite era quattro). Il corsivo non si carica: non serve.

Scala tipografica classica (16 · 18 · 21 · 24 · 36 · 48 · 60 · 72), resa fluida con `clamp()`:

| Token | Mobile → desktop | Uso | Peso | Interlinea · spaziatura |
|---|---|---|---|---|
| `--t-piccolo` | 15 px | note legali, didascalie | 400 | 1,5 |
| `--t-testo` | 18 px | testo, voci del menu | 400 | 1,55 |
| `--t-lead` | 18 → 21 px | frase d'apertura delle sezioni | 400 | 1,5 |
| `--t-h3` | 24 → 28 px | titoli di prodotto, categorie del menu | Bodoni 600 | 1,15 |
| `--t-h2` | 36 → 60 px | titoli di sezione | Bodoni 500 | 1,05 · −0,01 em |
| `--t-h1` | 48 → 72 px | titolo delle pagine interne | Bodoni 500 | 1,0 · −0,015 em |
| `--t-orario` | 36 → 48 px | gli orari della giornata | Bodoni 500, cifre tabellari | 1,0 |

I titoli in Bodoni usano la dimensione ottica automatica (`font-optical-sizing: auto`): in
grande i filetti si assottigliano come nei caratteri da manifesto.

Font di riserva con metriche regolate (`size-adjust`, `ascent-override`) su Georgia e Arial,
così il cambio di carattere non sposta l'impaginato.

### 4.3 Spazi, forme, ombre

- Spaziatura su base 4 px: `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 ·
  `--s-6` 32 · `--s-7` 48 · `--s-8` 64 · `--s-9` 96.
- Raggi: **2 px** per immagini e campi, **pillola** solo per i filtri del menu, **14 px**
  solo per l'insegna smaltata (come le targhe vere). Niente card arrotondate tutte uguali.
- Ombre: una sola, calda e corta, per gli elementi che galleggiano davvero (header compatto,
  barra azioni, lightbox). Le sezioni non hanno ombre.

## 5. Concept di layout

### 5.1 Mobile (375 px)

```
┌───────────────────────────────┐
│ [≡]                 [☎ Chiama]│  header: al caricamento niente wordmark (c'è l'insegna)
├───────────────────────────────┤
│ ╔═══════════════════════════╗ │
│ ║ ┌─────┐                   ║ │  L'INSEGNA (h1)
│ ║ │ BAR │  Piacenza         ║ │  cassonetto BAR + lettere in ottone
│ ║ └─────┘                   ║ │
│ ╚═══════════════════════════╝ │
│      ╲ ╱                      │  il cordino
│   ┌──────────────────────┐    │  IL CARTELLO SULLA PORTA (stato live)
│   │ ● Aperto ora         │    │
│   │   chiude alle 20:00  │    │
│   └──────────────────────┘    │
│ Caffè al banco, pranzo veloce │  frase
│ e aperitivo in centro.        │
│ Via XX Settembre 1, Piacenza  │  dove
│ [ Apri il menu             ]  │  primario
│ [ Indicazioni stradali     ]  │  secondario
│ ┌───────────────────────────┐ │
│ │      il bancone 4:5       │ │  immagine LCP
│ └───────────────────────────┘ │
│ ...                           │
├───────────────────────────────┤
│ [Chiama] [Indicazioni] [WhatsApp] │  barra azioni fissa (il corpo ha il suo spazio sotto)
└───────────────────────────────┘
```

### 5.2 Desktop (1280 px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [BAR Piacenza]*     Menu   Eventi   Dove siamo   Contatti  [Chiama il bar] │  *compare allo scroll
├──────────────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════╗   ┌──────────────────────────┐ │
│  ║ ┌─────┐                          ║   │                          │ │
│  ║ │ BAR │   Piacenza               ║   │                          │ │
│  ║ └─────┘                          ║   │      il bancone 4:5      │ │
│  ╚══════════════════════════════════╝   │                          │ │
│        ╲ ╱                              │                          │ │
│   ┌────────────────────────┐            │                          │ │
│   │ ● Aperto ora, chiude…  │            │                          │ │
│   └────────────────────────┘            │                          │ │
│  Frase. Indirizzo.                      │                          │ │
│  [Apri il menu] [Indicazioni stradali]  └──────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ IL BAR          testo su 6 colonne  │ foto 3:2 grande                │
│                 foto 4:5 sfalsata   │                                │
├──────────────────────────────────────────────────────────────────────┤
│ LA GIORNATA     6:30 ─ Colazione │ 12:00 ─ Pranzo │ 18:00 ─ Aperitivo │ Sabato sera │
├──────────────────────────────────────────────────────────────────────┤
│ DA PROVARE      [prodotto grande 4:5] │ [2×2 prodotti piccoli]         │
│ ...                                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

Griglia: 12 colonne da 960 px in su, margini laterali `clamp(16px, 5vw, 64px)`, contenuto
massimo 1200 px; il testo corrente non supera mai 65 caratteri per riga.

### 5.3 Regole di allineamento

1. Tutto è allineato a sinistra su un unico filo verticale. Nessun testo centrato, tranne
   le lettere dell'insegna e la pagina 404.
2. I titoli di sezione stanno sulla stessa colonna in tutte le sezioni (colonne 1–4 su
   desktop) e il contenuto parte dalla colonna 5: si legge come un listino.
3. I prezzi sono allineati a destra con cifre tabellari, e uniti al nome da una puntinatura
   d'ottone, come sul listino vero dietro al banco.
4. Le immagini rompono la griglia solo in un punto per sezione, mai a caso.

## 6. Principi (cosa rende unica questa pagina)

1. **L'insegna dice la verità.** Il BAR acceso vuol dire aperto, spento vuol dire chiuso.
   Il sito si comporta come il negozio.
2. **Un solo gesto di coraggio.** Fascia smaltata, ottone e luce stanno nel primo schermo.
   Sotto, il sito è disciplinato come un listino.
3. **Materiali veri, non decorazioni.** Marmo, ottone, smalto, graniglia: ogni texture viene
   da un oggetto che sta dentro il bar.
4. **Al tavolo si legge.** Il menu ha il corpo a 18 px, il contrasto alto e i prezzi allineati:
   si legge alle sette di sera con le luci basse.
5. **Le cose pratiche vincono.** Orari, indirizzo, telefono e menu sono sempre a un tocco;
   nessun effetto li copre o li ritarda.

## 7. Controllo anti-cliché

Il piano di partenza è stato confrontato con i default dei siti generati dall'AI. Ecco cosa
somigliava e cosa è cambiato.

| Cliché | Rischio nel piano | Cosa ho cambiato e perché |
|---|---|---|
| Crema + serif ad alto contrasto + terracotta | Bodoni è un serif ad alto contrasto; il mattone del Palazzo Gotico spinge verso il terracotta | **Niente terracotta, niente crema come fondo.** Il fondo è un marmo freddo verde-grigio (`#EEF1EC`); il rosso è il bitter dell'insegna accesa, usato in tre punti al massimo. Il mattone compare solo dentro un'illustrazione del Palazzo Gotico, mai come colore d'interfaccia. Bodoni resta, ma solo sopra i 24 px e per un motivo territoriale. |
| Fondo quasi nero + un solo accento acceso | Fascia verde scura + rosso bitter può sembrarlo | Il verde scuro è **solo l'insegna e il piè di pagina**, non il fondo della pagina. Il rosso nell'insegna è una luce che si accende e si spegne con lo stato vero, non un accento decorativo. |
| Impaginazione da quotidiano, filetti sottili, angoli a zero | Il listino con le puntinature poteva scivolarci | Filetti d'ottone **solo** nel menu (puntinatura dei prezzi) e nella cornice dell'insegna. L'insegna ha angoli da 14 px come le targhe smaltate. Niente colonne di giornale, niente righe sopra ogni sezione. |
| Kit di card SaaS | «Da provare» ed «Eventi» sono tipicamente griglie di card | «Da provare» è una **vetrina**: un prodotto grande e quattro piccoli, testo direttamente sul marmo, senza riquadri né ombre. L'evento ha un **blocco data come un calendario a strappo**, non una card con ombra grigia. |
| Etichette in maiuscolo spaziato sopra i titoli, puntini mediani, «PAROLA — frammento», #111, monospace, «→» nei pulsanti | Il riflesso di mettere «COLAZIONE · PRANZO · APERITIVO» sotto l'insegna | **Nessuna** sopratitolo, nessun elenco unito da puntini, nessuna freccia nei pulsanti, nessun monospace. Il nero non esiste: c'è il verde bottiglia. Il maiuscolo esiste in un punto solo: la parola BAR del cassonetto, perché sulle insegne vere è così. |
| Una parola del titolo in corsivo o colorata | Tentazione su «Piacenza» | I titoli sono di un colore solo. La differenza di colore esiste solo nel wordmark (BAR acceso / Piacenza in ottone), che è un logo. |
| Numerazioni 01/02/03 | La giornata e i prodotti | Niente numeri finti. La giornata usa **orari veri** (6:30, 12:00, 18:00) perché è una sequenza nel tempo. I prodotti non sono numerati. |
| Comparsa dal basso su ogni sezione, hover animato su ogni card | Il riflesso di animare tutto | **Un solo momento orchestrato** (l'insegna che si accende). Per il resto, movimento solo in risposta a un gesto: aprire la navigazione, la lightbox, i filtri. Tutto spento con `prefers-reduced-motion`. |

Revisione dopo il confronto: ho tolto anche la sfumatura che avevo pensato dietro l'insegna
(era una «sfumatura decorativa») e la sostituisco con la grana del marmo, che è un materiale.

## 8. Componenti

| Componente | Come è fatto |
|---|---|
| Pulsante primario | Verde bottiglia pieno, testo marmo, 48 px d'altezza, raggio 2 px. Al passaggio si scurisce. |
| Pulsante secondario | Bordo verde 2 px, testo verde, fondo trasparente. |
| Cartello stato | Rettangolo crema con cordino, icona diversa per ogni stato (aperto: lampadina accesa; chiuso: lucchetto; apre presto: orologio), testo sempre presente. |
| Tabella orari | `<table>` vera, giorni come intestazioni di riga, oggi evidenziato con fondo marmo venato, la parola «oggi» e `aria-current="date"`. |
| Riga del menu | Nome e prezzo sulla stessa linea con puntinatura d'ottone; sotto descrizione in grigio graniglia, etichette (testo + icona) e numeri degli allergeni. |
| Evento | Blocco data a strappo (giorno grande in Bodoni, mese e giorno della settimana), titolo, orario, descrizione, «Aggiungi al calendario». |
| Galleria | Griglia 2 colonne su mobile, 3 su desktop, un elemento doppio; lightbox su `<dialog>`. |
| Facciata mappa | Illustrazione statica del centro con il segnaposto; un pulsante carica la mappa Google solo dopo il clic, con l'avviso sul servizio esterno. |
| Modulo WhatsApp | Cinque campi, errori specifici sotto ogni campo, invio che compone il messaggio e apre WhatsApp. |
| Barra azioni mobile | Verde notte, tre azioni con icona e testo, rispetta la zona sicura degli iPhone. |
| Piè di pagina | Verde notte, testo marmo, ottone chiaro per i link, P.IVA e credito dell'agenzia. |

Icone: SVG in linea disegnate per il sito, tratto 1,75 px, angoli arrotondati, nello stile
del set open source Lucide ma ridisegnate qui (nessuna dipendenza esterna). Niente emoji.

## 9. Scelte e assunzioni

Dove la specifica era ambigua ho scelto l'opzione più professionale:

1. **Dove vive il progetto.** Il sito è autonomo: sta in `consegne/siti/bar-piacenza/` del
   repository dell'AD, e si pubblica puntando l'hosting a questa cartella.
2. **Immagini.** I siti di foto gratuite (Unsplash, Pexels, Wikimedia) sono bloccati dalla
   rete di questo ambiente: nessuna foto si poteva scaricare e verificare. Ho seguito la
   priorità 3 del §13: **tavole illustrate in SVG**, disegnate nel sistema di design
   (vista frontale o dall'alto, colori della palette, grana del marmo), poi convertite in
   AVIF, WebP e JPG a 480, 960 e 1600 px. Il codice è già quello definitivo: per mettere le
   foto vere basta sostituire i file con lo stesso nome, oppure lanciare `tools/immagini.mjs`.
   Ogni tavola ha la sua voce in `SHOTLIST.md`. Le illustrazioni non fingono di essere il
   locale: sono disegni, e non ingannano chi visita il sito prima delle foto vere.
3. **Video hero.** Non c'è materiale: il sito parte con l'immagine. Il codice del video è
   pronto (pausa sempre visibile, niente video con riduzione del movimento o risparmio dati):
   basta mettere `hero.mp4`, `hero.webm` e `hero-poster.jpg` in `assets/video/` e accenderlo in
   `site-data.js`.
4. **Servizi.** Non confermati: bar «tutto il giorno» (colazione, pranzo, aperitivo) con il
   sabato sera lungo, come nell'esempio di orario della specifica.
5. **Eventi.** Non confermati: l'elenco è vuoto e si vede lo stato vuoto previsto. Per
   mostrare al titolare come appaiono gli eventi, l'indirizzo `index.html?anteprima=eventi`
   carica tre serate d'esempio (marcate come tali, mai visibili senza il parametro).
6. **Recensioni.** Nessuna recensione reale nel brief: `showReviews: false`, resta solo il
   link «Leggi le recensioni su Google».
7. **Segnaposto innocui.** Telefono `0523 000000` e WhatsApp `333 000 0000`: formato vero,
   numeri che non suonano a casa di nessuno. La partita IVA d'esempio ha la cifra di
   controllo sbagliata apposta, così non può appartenere a un'azienda reale.
8. **Indirizzo segnaposto.** Via XX Settembre, la strada che unisce Piazza Cavalli al Duomo:
   coerente con «il bar della città». Le coordinate sono indicative.
9. **Allergeni.** Le voci del menu d'esempio hanno allergeni plausibili, ma **vanno
   verificati dal titolare** prima di andare online: è un obbligo di legge, non un dettaglio.
10. **`<noscript>`.** Senza JavaScript il sito mostra indirizzo, telefono, orari e il link al
    menu. Questi dati sono l'unica copia fuori da `site-data.js`; `tools/sincronizza.mjs`
    li riscrive da lì e `tools/controlla.mjs` fallisce se non coincidono.
11. **404 su hosting.** La pagina 404 può essere servita a qualsiasi profondità di percorso;
    un piccolo script la riporta alla radice del sito solo quando gira su http(s), così i
    percorsi restano relativi e funziona anche da file.
