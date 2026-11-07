---
data: 2026-11-07 02:57
autore: qa-designer
oggetto: Controllo tecnico finale del materiale social di benvenuto di Pane Quotidiano, prima della coda
colore: verde per il controllo e le correzioni piccole (reversibili) · accodare e pubblicare restano rossi, con la firma di Nicola
verdetto: FIX PRIMA, non si accoda ancora
---

# Pane Quotidiano: il controllo tecnico del post di benvenuto

**Di cosa parla:** l'ultimo controllo tecnico sul post di benvenuto di Pane Quotidiano, prima di metterlo in coda per la tua firma. **Verdetto: non si accoda ancora.**

## In parole semplici

Il mio lavoro guarda solo cose oggettive: colori e firma del marchio, segnaposti dimenticati, promesse non vere, permessi per le foto, link e codice QR.

I testi passano. Ho ricontrollato ogni numero sul sito vero: i 5 prezzi, la consegna da 3 euro (4 sotto i 10 euro di spesa), il raggio di 5 km. Tornano tutti.

Il pacchetto invece non è pronto, per tre motivi. Primo: le immagini del carosello e delle storie non esistono ancora. C'è solo la descrizione per il grafico. Secondo: il negoziante non ha ancora detto sì a nome e foto.

Il terzo motivo è il più insidioso. Un esempio: incolli il link del negozio su WhatsApp. Sotto il messaggio compare da solo un riquadro con scritto «tra cui pane, miele biologico». Il post evita la parola pane apposta, e il riquadro la rimette.

## Cosa cambia per te

- Il testo del post, delle tre storie e del messaggio WhatsApp è a posto. Non serve riscriverlo.
- Ho aggiunto quattro condizioni alla lista «prima di pubblicare» del post. Adesso sono nove in tutto, non più cinque.
- Ho corretto le istruzioni del grafico in sei punti, tra cui la firma su fondo rosso mattone e un volantino da togliere dalla foto. Così il primo disegno nasce già giusto.
- La cosa importante, detta con altre parole: il post è pronto come testo, non come pubblicazione. A bloccarlo è quello che ci sta intorno.

## Cosa devi fare

- Dirmi qual è il profilo Instagram vero. Il marchio dice @mycity.piacenza, col punto. Il sito porta a mycitypiacenza, senza punto.
- Alla visita dal negoziante, chiedere tre cose insieme: il sì a nome e foto, chi ha scattato la foto del negozio, la firma dei Termini col permesso a incassare i contanti.
- Confermare la data del 15 novembre. Il registro dei fatti dice che senza la carta accesa l'apertura slitta.
- Poi far disegnare le 7 immagini: 4 del carosello e 3 storie. Quando ci sono, il mio secondo controllo dura pochi minuti.

## Cosa non ho verificato

- Nessuna immagine del post esiste ancora. Colori, firma e margini delle storie li ho controllati solo sulle istruzioni scritte.
- Non so se i due profili Instagram esistono: non ho aperto Instagram.
- La provenienza della foto di copertina: nessun file del progetto la registra.
- Prezzi e consegna li ho letti sulle pagine pubbliche e nel codice del sito. Non li ho visti in una cassa vera: niente carrello, come da regole.
- Non ho provato l'anteprima dentro WhatsApp o Facebook. Ho letto i dati che il sito manda a quelle app, che sono quelli che le app mostrano.
- L'adesivo Sondaggio con 4 risposte e l'adesivo Domande ci sono su Instagram. Su Facebook non l'ho controllato.

## Dettagli tecnici

### Le voci della lista, una per una

**Marchio (`CHECKLIST-BRAND.md`).**

| Voce | Esito | Dove | Cosa fare |
|---|---|---|---|
| Solo colori della tavolozza | Passa, sulle istruzioni | Brief: terracotta, senape, panna, inchiostro, bianco. Il colore del negozio `#C4801F` è escluso | Ricontrollare sui file disegnati |
| Font Fraunces e Inter | Passa, sulle istruzioni | Brief, riga «Font» | Ricontrollare sui file disegnati |
| Una idea, circa 30 parole | Passa con una riserva | Immagine 1 circa 11 parole più la firma · 2 circa 27 · 3 circa 35 · 4 circa 10 | L'immagine 3 è un elenco: si tiene, ma va provata a 320 pixel di larghezza |
| Margini sicuri delle storie | Passa, sulle istruzioni | Brief: 80% centrale, niente testo negli ultimi 250 pixel | Aggiunto nel brief: anche firma e adesivi dentro i margini |
| Firma del marchio | Non passa sul fondo terracotta | Immagine 4 e storia 3 | «My» senape su `#C0492C` fa 2,30 a 1, sotto il minimo di 3 a 1 per una grafica. Corretto nel brief: firma su banda panna |
| Segnaposti visibili | Passa | Testo pubblico di post, storie e WhatsApp: cercati `[`, `{{`, `___`, zero trovati | Niente |
| Frase del marchio identica | Passa | «La spesa che tiene viva la città.» uguale a `creativi/brand.mjs` riga 23 e alla locandina | Niente |
| Profilo social identico | Non passa fuori dal post | Il post usa `@mycity.piacenza` come `BRIEF-CREATIVO.md` riga 15. Il piè di pagina del sito porta a `instagram.com/mycitypiacenza` (`components/Footer.tsx` riga 37) | Nicola sceglie quello vero. Difetto già aperto nel cantiere (radiografia del marketplace, «minore») |

Contrasti calcolati con la formula standard: bianco su terracotta 4,96 a 1 (storia 3, passa) · panna su terracotta 4,65 a 1 (immagine 4, passa) · inchiostro su panna 13,39 a 1 (passa) · senape su terracotta 2,30 a 1 (non passa) · la variante del marchio per fondi scuri, `#F4BC53`, su terracotta 2,88 a 1 (non passa neanche lei).

**Onestà (`ONESTA-RULES.md`).**

| Voce | Esito | Prova |
|---|---|---|
| Ogni numero ha una fonte | Passa | Vedi «Fatti ricontrollati» sotto |
| Nessuna testimonianza finta | Passa | Nessuna citazione. Il volto manca ed è dichiarato |
| Segnaposti evidenti | Passa | Nessun segnaposto riempito a caso |
| Immagini AI dichiarate | Passa | Nessuna immagine generata: solo la foto vera del negozio e grafica a testo |
| Frasi legali | Passa con condizione | «Paghi in contanti alla consegna» è vera: la scheda prodotto la scrive. Il nodo legale è il permesso a incassare per conto del negozio (file 02, voce O5): ora è una condizione. La rilettura dell'avvocato dopo il lancio è un rischio scelto da Nicola il 1/11 (`rischi.scelti-al-lancio`) |
| Consensi per le persone e le foto | Non passa | Il negoziante non ha detto sì. L'autore della foto di copertina non risulta da nessuna parte |
| Data nel testo | Da confermare | «Dal 15 novembre»: `lancio.data` dice che si apre solo con carta accesa, `pagamenti.al-lancio` dice carta spenta all'inizio. Il database del 7/11 dice `stripe_incassi_attivi = false` |

**Link e codice QR.**

- Nel post non c'è un codice QR, ed è giusto: dal telefono non lo si inquadra. Il link va nella bio di Instagram, nel primo commento di Facebook e nel messaggio WhatsApp.
- Pagina del negozio: risposta 200 alla richiesta pubblica del 7/11, verso le 02:50.
- Il QR della locandina l'ho decodificato da capo, con jsQR sul PNG 1749x2481. Porta esattamente all'indirizzo del post: `https://www.mycity-marketplace.com/store/c0b240c0-2a86-4218-9d0f-5154f08ff929`. Una campagna, un indirizzo.
- **L'anteprima del link (il difetto grave).** I campi `og:description` e `twitter:description` della pagina sono la descrizione del negozio: «specializzata nella vendita di prodotti alimentari, tra cui pane, miele biologico (acacia, tiglio, castagno, propoli) e altri generi.». Anche l'immagine dell'anteprima (1200x630, `app/store/[id]/opengraph-image.tsx` righe 23 e 75) la stampa, tagliata a 117 caratteri. Copia dell'immagine vista: `/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/qa05c/og.png`.
- La cura è la stessa della condizione 2 del post (riscrivere la descrizione). In più: il sito tiene l'immagine 5 minuti (`s-maxage=300`), ma può servirla vecchia fino a un giorno (`stale-while-revalidate=86400`). Facebook e WhatsApp ne tengono una copia loro. Dopo la correzione si forza il ricaricamento e si guarda di nuovo.

**Fatti ricontrollati sul sito vero (richieste pubbliche del 7/11, da visitatore).**

- 5 schede prodotto, tutte con risposta 200. Prezzi 2,05 · 2,05 · 2,95 · 2,95 · 5,00 euro: uguali allo scontrino dell'immagine 3.
- Nomi: il sito dice «Pudding alla vaniglia bio». Il testo pubblico dice pudding: giusto.
- La scheda prodotto scrive: «Consegna MyCity 3,00 € una volta sola per tutto il carrello … 1,00 € in più per ogni negozio dove spendi meno di 10,00 €». È la stessa regola del post.
- La scheda scrive anche «Consegna a casa, all'ora che scegli» e «Paghi in contanti alla consegna»: sono i tre passi dell'immagine 2.
- Codice del sito, copia locale al commit `b4cac796` del 7/11: `PLATFORM_DELIVERY_FEE_CENTS = 300`, `SUPPLEMENTO_CONSEGNA_CENTS = 100`, `SPESA_SENZA_SUPPLEMENTO_CENTS = 1000`, `RAGGIO_CONSEGNA_KM = 5` (`lib/constants.ts` righe 130, 142, 144, 71). Non ho verificato che sia la stessa versione in produzione.
- Il 15/11/2026 è domenica (comando `date`). Nel database la domenica il negozio non ha orari, cioè è chiuso.

**La foto di copertina** (`store-media/…/1781520459342-nypsbc.jpg`, 1080x1316).

- Nessun volto: nessun consenso da chiedere a clienti o commessi.
- In basso al centro, sul bancone, c'è un volantino «VENDE» di una persona privata con un numero di telefono. A grandezza piena il numero si legge solo in parte. Tagliarlo o sfocarlo costa un minuto: scritto nel brief.
- Per il carosello 1080x1350 basta un taglio minimo. Per una storia 1080x1920 a tutto schermo andrebbe ingrandita di circa 1,46 volte, e la foto è già poco nitida. Scritto nel brief: foto in alto, banda di colore sotto.

**La pagina d'arrivo e i bollini.** Il negozio ha 5 bollini: consegna rapida, prodotti locali, bio, ritiro in negozio, sostenibile. La condizione 3 del post ne toglie due, quelli falsi. «Consegna rapida» non smentisce il post: il sito offre davvero la consegna veloce (`offers_express = true`). «Bio» resta da chiarire, come già scritto nel file 05. Non lo metto come condizione, perché il post non dice bio.

### Cosa ho corretto io (cose piccole)

1. File 05: «budino» diventa «pudding» in 3 punti (In parole semplici, indirizzi delle foto, metro dei numeri). Il sito dice pudding.
2. File 05: la condizione 1 chiede anche chi ha scattato la foto di copertina.
3. File 05: un blocco di 4 condizioni in più, sotto le cinque del collega: Termini e permesso per i contanti, data, anteprima del link, profilo Instagram. Le cinque originali non le ho toccate, così il file 05b del direttore creativo resta coerente.
4. Brief del grafico: un blocco di 6 regole (firma su terracotta, file del marchio, firma sulle storie, misura della foto, volantino, parole dell'immagine 3).

Copie dei due file prima delle mie modifiche: `/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/qa05c/`.

### Cose grandi che non posso correggere io

| Cosa manca | Chi la fa | Dove è già scritta |
|---|---|---|
| Le 7 immagini (4 del carosello, 3 storie) | Il grafico della squadra | Brief in `creativi/pane-quotidiano/2026-11-07-benvenuto-brief-grafico.md` |
| Descrizione del negozio senza pane e miele, bollini falsi tolti | Lo staff dal pannello, o il negoziante | File 03, bozze dei dati |
| Sì del negoziante, autore della foto, Termini, permesso per i contanti | Nicola alla visita | File 02 (voci O4, O5) e file 04 |
| Profilo Instagram vero | Nicola | Difetto del piè di pagina già nel cantiere |
| Data di apertura | Nicola | Contraddizione già segnalata nei file 02 e 05b |

### Sistema: due cose che valgono oltre questo post

- **Il marchio punta a file che non ci sono.** `creativi/brand.mjs` indica `marketplace/design-system/assets/wordmark-light.svg`, `wordmark-ondark.svg` e `logo-icon.svg`. Su questa macchina mancano tutti e 3. Un generatore che usa quei percorsi resta senza logo. La locandina ha aggirato il problema scrivendo il marchio in Fraunces. Sistemare il percorso è una modifica alla macchina, quindi gialla: la propongo, non la faccio.
- **Una voce nuova per la lista di controllo.** Proposta: «Ogni post con un link: leggere l'anteprima che il link genera (titolo, descrizione, immagine) prima di accodare». Oggi la lista guarda solo il testo e la grafica. Il difetto più grave di questo pacchetto stava nell'anteprima. Non ho modificato `CHECKLIST-BRAND.md`: il compito mi chiede di scrivere solo qui.

### Scorecard 1-5 sui 6 assi

| Asse | Voto | Perché |
|---|---|---|
| Altitudine | 4 | Voce nuova per la lista e percorso del marchio rotto, oltre al singolo post |
| Verità e dati | 5 | Ogni numero rifatto su pagina vera, codice e database |
| Craft e gusto | 3 | Nessuna immagine vera da controllare: il controllo visivo è sulle istruzioni |
| Cliente e impatto | 4 | Fermata l'anteprima che smentiva il post davanti al cliente |
| Sistema e coerenza | 4 | QR, link e frase uguali tra locandina e post. Profilo social ancora doppio |
| Anima | 4 | Bloccato un pacchetto bello per un riquadro automatico |

I due assi più bassi: il craft, perché le immagini non ci sono, e il cliente, perché l'anteprima non l'ho provata dentro le app.

### Effetto sul mio numero

Il mio numero sono i difetti che arrivano in pubblicazione, e il bersaglio è zero. Qui: 1 difetto grave fermato prima della coda (l'anteprima), 4 condizioni mancanti aggiunte, 6 regole date al grafico prima che disegni. Stima onesta, non misurata.

### Riga per il quaderno (da copiare: il compito mi chiede di scrivere solo questo file)

`2026-11-07 02:57 · controllo tecnico post benvenuto Pane Quotidiano · testi puliti (5 prezzi, regola consegna e 5 km ritrovati sul sito vero), ma l'anteprima del link su WhatsApp e Facebook dice «pane, miele biologico» e smentisce il post; immagini non ancora disegnate · 1 grave fermato, 4 condizioni aggiunte, 6 regole al grafico · un post con link si controlla anche nell'anteprima che il link genera, perché viene dalla descrizione del negozio e non dal post · #qa #anteprima-link #consensi`

### Chiusura

- FATTO: controllo tecnico in questo file. Correzioni piccole nel file 05 e nel brief del grafico.
- KPI: difetti arrivati in pubblicazione resta a 0; 1 grave fermato prima della coda.
- IMPARATO: la riga qui sopra, da copiare in `memoria-squadra/qa-designer.md`.
- ACCODATO: nessuna azione. Il verdetto è «non si accoda ancora».
- SERVE DA NICOLA: il profilo Instagram vero, la data del 15/11, e alla visita il sì del negoziante con autore della foto, Termini e permesso per i contanti.
