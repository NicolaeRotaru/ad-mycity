# Bar Piacenza — contenuti da sostituire

**In parole semplici.** Il brief non conteneva i dati veri del bar. Al loro posto ci sono
segnaposto realistici, mai lorem ipsum. Questo file li elenca tutti, con il punto esatto in cui
cambiarli.

**Cosa cambia per te.** Quasi tutto si cambia in un file solo, `assets/js/site-data.js`: ogni
segnaposto lì ha il commento `DA CONFERMARE`. Pochi testi fissi stanno nell'HTML e sono elencati
in fondo, con la frase da cercare.

**Cosa devi fare.** Fai al titolare le domande dell'ultima sezione. Poi sostituisci, lancia
`node tools/sincronizza.mjs` e infine `node tools/controlla.mjs`, che deve finire con «Tutto in ordine».

**Cosa non ho verificato.** Nessun dato è stato controllato con il bar: indirizzo, coordinate,
orari, prezzi e allergeni sono tutti d'esempio. **Gli allergeni vanno confermati per legge**
prima di pubblicare il menu.

---

## 1. Dati del locale — `site-data.js` › `locale`

| Dato | Chiave | Segnaposto attuale | Note |
|---|---|---|---|
| Indirizzo | `locale.indirizzo.via`, `cap`, `citta`, `provincia` | Via XX Settembre 1, 29121 Piacenza PC | Scelto perché unisce Piazza Cavalli al Duomo, coerente con «il bar della città». |
| Zona, in una frase | `locale.indirizzo.zona` | a due passi da Piazza Cavalli | Compare nell'hero, in «Il bar» e in «Dove siamo». |
| Coordinate | `locale.geo.lat`, `lng` | 45.0521, 9.6937 | Indicative: prendile da Google Maps (clic destro sul punto). Servono ad Apple Maps e a Google. |
| Telefono | `locale.telefono.e164` e `testo` | +390523000000 · 0523 000000 | Numero che non suona a nessuno. Nel `testo` lo spazio è ` `, così il numero non va a capo. |
| WhatsApp | `locale.whatsapp` | 393330000000 | Solo cifre con il prefisso 39. `null` se il bar non lo usa: modulo e barra passano all'email. |
| Email | `locale.email` | ciao@barpiacenza.it | |
| Instagram, Facebook, TikTok | `locale.social` | @barpiacenza, facebook.com/barpiacenza, nessun TikTok | `null` toglie il social da tutto il sito. |
| Ragione sociale | `locale.ragioneSociale` | Bar Piacenza s.n.c. | Obbligatoria nel piè di pagina. |
| Partita IVA | `locale.partitaIva` | 01823450330 | **D'esempio, con la cifra di controllo sbagliata apposta**: non può appartenere a nessuno. |
| Dominio | `locale.dominio` | https://DOMINIO-DA-DEFINIRE.it | Dopo il cambio, `sincronizza.mjs` aggiorna canonical, anteprime social, sitemap e robots. |
| Tipo di locale per Google | `locale.tipo` | BarOrPub | Oppure CafeOrCoffeeShop, se è più caffetteria. |
| Fascia di prezzo | `locale.prezzi` | € | |
| Nome dell'agenzia | `locale.agenzia.nome` | Studio Gotico | Compare nel credito «Sito di …» del piè di pagina. |
| Parcheggio | `locale.parcheggio` | ZTL; parcheggio in Piazza Cittadella a 5 minuti | Da verificare sul posto. |
| Mezzi pubblici | `locale.mezzi` | 15 minuti dalla stazione; linee urbane in centro | Da verificare sul posto. |

## 2. Orari — `site-data.js` › `orari`

| Dato | Chiave | Segnaposto attuale |
|---|---|---|
| Settimana tipo | `orari.settimana` | lun–ven 6:30–20:00; sab 7:00–23:00; dom chiuso (l'esempio della specifica) |
| Giorni speciali | `orari.eccezioni` | 24/12 7–15 · 25/12 chiuso · 26/12 chiuso · 31/12 7–15 · 1/1 chiuso |
| Ferie | `orari.ferie` | 9–22 agosto 2027 |

Il testo della giornata «Il sabato restiamo aperti fino alle 23:00» (`giornata`, quarta voce)
ripete l'orario del sabato: se cambia l'orario, cambialo anche lì.

## 3. Servizi e contenuti — `site-data.js`

| Contenuto | Chiave | Stato |
|---|---|---|
| Prenotazioni via WhatsApp | `prenotazioni` | `true` (assunto). Con `false` il modulo sparisce. |
| La giornata al bar | `giornata` | 4 fasce d'esempio: colazione 6:30, pranzo 12:00, aperitivo 18:00, sabato sera 21:00. |
| Da provare | `prodottiFirma` | 5 prodotti d'esempio con prezzo e illustrazione provvisoria: cappuccino e brioche, bortellina, tagliere dei tre DOP, spritz al bitter, Gutturnio al calice. |
| Menu | `menu` | 44 voci d'esempio in 7 categorie, con prezzi tipici di un bar di Piacenza. **Voci, prezzi, etichette e allergeni tutti da confermare.** |
| Eventi | `eventi` | Vuoto: si vede lo stato «Nessuna serata in calendario». `eventiAnteprima` serve solo per `?anteprima=eventi`. |
| Galleria | `galleria` | 6 illustrazioni provvisorie (`provvisoria: true`). |
| Recensioni | `recensioni` | `showReviews: false`, nessuna recensione: resta il link «Leggi le recensioni su Google». |
| Video | `video` | `attivo: false`, nessun file video. |

## 4. Immagini

| Cosa | Dove | Stato |
|---|---|---|
| 14 foto del sito | `assets/img/` (sorgenti in `tools/segnaposto/`) | Tavole illustrate provvisorie: sostituirle con le foto della `SHOTLIST.md` tramite `materiale/` e `node tools/immagini.mjs`. |
| Testi alternativi di hero e «Il bar» | `index.html`, attributi `alt` delle tre immagini nelle sezioni hero e «Il bar della città» | Descrivono le illustrazioni attuali: riscriverli sulle foto vere. |
| Testi alternativi di prodotti e galleria | `site-data.js`, campi `alt` | Come sopra. |
| Anteprima social | `og-image.jpg` | Contiene l'insegna e l'illustrazione dell'hero. Con le foto vere: `node tools/icone.mjs`. |
| Logo | marchio in `tools/insegna.mjs` | Wordmark creato da noi. Se il bar ha un logo, sostituirlo. |
| Facciata della mappa | `index.html`, SVG `mappa__disegno` nella sezione «Dove siamo» | Disegno schematico generico, non dipende dall'indirizzo. |

## 5. Testi fissi nell'HTML

Per trovarli, cerca la frase indicata nel file.

| File | Sezione | Frase da cercare | Note |
|---|---|---|---|
| `index.html` | `<title>` e `description` | «colazioni, pranzi e aperitivi in centro a Piacenza» | Adattare alla zona vera e ai servizi veri. |
| `index.html` | Anteprime social (`og:` e `twitter:`) | «il bar della città» | |
| `index.html` | Hero | «Caffè al banco, pranzo veloce e aperitivo in centro a Piacenza.» | La stessa frase sta anche in `locale.frase`. |
| `index.html` | Il bar della città | «Bar Piacenza è il bar del centro» e i due paragrafi seguenti | Raccontano un bar d'esempio: riscriverli con la storia vera, **senza inventare** anni, premi o articoli di giornale. |
| `index.html` | Introduzioni delle sezioni | «Dal primo caffè», «Le cose che chi viene qui», «Musica, degustazioni», «Il bancone, i bicchieri» | Da adattare se i servizi veri sono diversi (per esempio niente serate). |
| `index.html` | Contatti | «Per un tavolo, una festa o una domanda» | |
| `menu.html` | `<title>`, `description`, introduzione | «Menu e prezzi», «Prezzi in euro, IVA inclusa» | |
| `privacy.html` | Tutta la pagina | «Bozza da validare con un consulente» | Da far validare a un consulente. Inserire il nome del fornitore di hosting e la data vera in «Ultimo aggiornamento». I dati del titolare arrivano da `site-data.js`. |

Il blocco `<noscript>`, i link di telefono, WhatsApp, email e mappe e gli orari nel piè di
pagina sono copie scritte da `tools/sincronizza.mjs`: non vanno toccati a mano.

## 6. Le domande da fare al titolare

1. Indirizzo esatto, citofono o insegna, e come lo descrivereste in una frase («davanti al Duomo», «sotto i portici di…»).
2. Numero di telefono del bar, numero WhatsApp (se lo usate per lavoro) ed email.
3. Ragione sociale e partita IVA, come sono in visura.
4. Orari di ogni giorno, eventuale pausa, chiusura settimanale, ferie e festività dell'anno.
5. Servizi veri: colazione, pranzo, aperitivo, serate, dehors? Accettate prenotazioni, e come?
6. Il menu completo con i prezzi attuali e, **per ogni voce, gli allergeni** (anche quelli in tracce, se li dichiarate).
7. I 4–6 prodotti di cui andate fieri e che volete far provare.
8. Eventi in programma (data, ora, titolo, una riga di descrizione).
9. Profili social attivi (Instagram, Facebook, TikTok) e chi li gestisce oggi.
10. Logo o colori aziendali, se esistono; altrimenti va bene il marchio proposto?
11. Due o tre righe su cosa rende diverso il bar e sulla sua clientela.
12. Recensioni Google: possiamo citarne alcune vere, con nome e stelle come appaiono sulla scheda?
13. Parcheggi e mezzi pubblici consigliati ai clienti.
14. Il dominio: ne avete già uno? Chi deve intestarselo?
15. Il nome dello studio per il credito nel piè di pagina.
