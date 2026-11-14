# Bar Piacenza — il sito

Il sito del Bar Piacenza in versione bozza: è finito e pronto da pubblicare. Dentro ci sono
dati segnaposto, da sostituire con quelli veri del bar prima di andare online.

**In parole semplici.** Sono quattro pagine (home, menu, privacy, pagina «non trovata») fatte
solo di HTML, CSS e JavaScript, senza framework e senza installare niente. Si aprono con un
doppio clic e si pubblicano su qualsiasi hosting statico, per esempio Vercel o Netlify.

**Cosa cambia per te.** Tutti i contenuti che cambiano stanno in un file solo:
`assets/js/site-data.js`. Indirizzo, orari, menu, eventi, galleria e social si toccano lì.

**Cosa devi fare.** Raccogliere i dati veri del bar (l'elenco è in `CONTENUTI-DA-SOSTITUIRE.md`)
e fare le foto (il brief è in `SHOTLIST.md`). Poi sostituire, lanciare i due controlli descritti
qui sotto e pubblicare.

**Cosa non ho verificato.** Il sito non è stato provato su iPhone e Android veri: le prove sono
fatte in Chromium, simulando i telefoni. Firefox e Safari non sono stati provati da qui. Le foto
sono illustrazioni provvisorie. Gli allergeni del menu d'esempio vanno controllati dal titolare.

---

## 1. Aprire il sito

- **Doppio clic su `index.html`**: il sito funziona tutto. Solo Chrome, da file, non carica i due
  caratteri del sito e usa quelli di sistema, con le misure regolate perché nulla si sposti.
  Online i caratteri si vedono normalmente.
- **Come sarà online**: avvia un piccolo server nella cartella del sito, con uno di questi comandi.

```bash
npx serve .                # poi apri http://localhost:3000
python3 -m http.server     # poi apri http://localhost:8000
```

Per vedere come appaiono le serate quando ci sono eventi, apri `index.html?anteprima=eventi`.
Mostra tre serate d'esempio, segnate come tali. Senza il parametro non compaiono mai.

## 2. I file

```
index.html  menu.html  privacy.html  404.html
assets/css/styles.css      un solo foglio di stile, a livelli (@layer)
assets/js/site-data.js     L'UNICA FONTE DEI CONTENUTI
assets/js/app.js           la logica (stato aperto/chiuso, menu, eventi, galleria, modulo)
assets/fonts/              Bodoni Moda e Atkinson Hyperlegible Next, licenza in OFL.txt
assets/img/                immagini in AVIF, WebP e JPG a 480, 960 e 1600 px
assets/video/              (vuota) qui va il video dell'hero, se c'è
tools/                     strumenti per chi mantiene il sito: non servono per farlo funzionare
materiale/                 (da creare) qui vanno le foto vere da convertire
```

## 3. Cambiare i contenuti

Apri `assets/js/site-data.js` con un editor di testo. Ogni valore segnaposto ha accanto il
commento `DA CONFERMARE`.

| Cosa | Dove, in `site-data.js` | Note |
|---|---|---|
| Nome, indirizzo, telefono, WhatsApp, email, social | `locale` | Il telefono va scritto due volte: `e164` per i link (`+390523…`), `testo` per come si legge. WhatsApp: solo cifre con il prefisso (`39…`); `null` se il bar non lo usa, e il modulo ripiega sull'email. |
| Orari | `orari.settimana` | Fasce `'HH:MM'`. Orario spezzato: `[['07:00','14:30'], ['17:00','22:00']]`. Dopo mezzanotte: `['18:00','02:00']`. Giorno chiuso: `[]`. Il giorno 0 è la domenica. |
| Festività e giorni speciali | `orari.eccezioni` | `{ data: '2026-12-24', fasce: [['07:00','15:00']], nota: 'Vigilia di Natale' }`; `fasce: []` vuol dire chiuso. |
| Ferie | `orari.ferie` | `{ dal: '2027-08-09', al: '2027-08-22', nota: 'Ferie estive' }` |
| Prenotazioni | `prenotazioni` | `false` nasconde il modulo; restano telefono, WhatsApp ed email. |
| La giornata, i prodotti da provare | `giornata`, `prodottiFirma` | |
| Menu | `menu` | Per ogni voce: `prezzo` in euro, `tag` tra `veg`, `vegan` e `sg`, `all` = numeri degli allergeni (1–14, legenda nel menu). |
| Eventi | `eventi` | `{ titolo, inizio: '2026-12-05T21:00', fine: '2026-12-05T23:30', testo }`. Quelli finiti spariscono da soli. |
| Galleria | `galleria` | `img` = nome del file senza larghezza e formato, più `alt` e le misure. |
| Recensioni | `recensioni` | `showReviews: true` **solo** con recensioni vere, copiate dalla scheda Google con nome e stelle. |
| Video dell'hero | `video` | Vedi il punto 4. |

**Dopo ogni modifica** lancia i due comandi qui sotto (serve Node 18 o più recente).

```bash
node tools/sincronizza.mjs   # riscrive le parti statiche (per chi non ha JavaScript, Google e i social)
node tools/controlla.mjs     # controlla che sia tutto a posto: deve finire con «Tutto in ordine»
```

Perché serve il primo comando: con JavaScript attivo il sito legge `site-data.js` da solo.
Ma una copia dei dati sta anche nell'HTML, perché il sito funzioni senza JavaScript e perché
Google e WhatsApp leggano subito le informazioni. Il comando tiene allineata quella copia.
Se ti dimentichi di lanciarlo, `controlla.mjs` lo segnala.

I testi che non cambiano spesso (la frase dell'hero, il paragrafo «Il bar della città», le
introduzioni delle sezioni) stanno direttamente in `index.html`. Titoli e descrizioni per Google
stanno nell'intestazione di ogni pagina.

## 4. Mettere le foto e il video veri

1. Installa gli strumenti, una volta sola: `cd tools && npm install`.
2. Metti le foto nella cartella `materiale/`, con il nome dello spazio che occupano: per esempio
   `materiale/bancone-mattino.jpg` (vanno bene JPG, PNG, WebP e TIFF). I nomi e i rapporti di ogni
   spazio sono in `SHOTLIST.md`.
3. Lancia `node tools/immagini.mjs`. Lo strumento taglia ogni foto al rapporto giusto, centrandola
   sul soggetto, e crea le 9 versioni (3 larghezze per 3 formati) in `assets/img/`. Solo alcune:
   `node tools/immagini.mjs sala tazzine`.
4. Aggiorna gli `alt` (la descrizione per chi non vede l'immagine):
   - in `site-data.js` per prodotti e galleria, togliendo anche `provvisoria: true`;
   - in `index.html` per l'hero e le due foto di «Il bar».
5. Rifai l'anteprima per WhatsApp e Facebook con le foto nuove: `node tools/icone.mjs`.

**Video dell'hero (facoltativo).** Metti in `assets/video/` tre file: `hero.mp4`, `hero.webm` e
`hero-poster.jpg`. Poi in `site-data.js` imposta `video.attivo: true`. Il video parte muto e in
loop, con il pulsante di pausa sempre visibile. Chi ha chiesto meno animazioni o il risparmio dati
vede solo la foto. Per stare sotto i 3 MB:

```bash
ffmpeg -i girato.mov -t 8 -vf "crop=ih*4/5:ih,scale=1080:-2" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart assets/video/hero.mp4
ffmpeg -i girato.mov -t 8 -vf "crop=ih*4/5:ih,scale=1080:-2" -an -c:v libvpx-vp9 -crf 36 -b:v 0 assets/video/hero.webm
ffmpeg -i assets/video/hero.mp4 -frames:v 1 -q:v 3 assets/video/hero-poster.jpg
```

## 5. Pubblicare

Il sito è statico: non c'è nessun «build» da fare.

- **Netlify**: trascina la cartella del sito su app.netlify.com/drop, oppure collega il repository
  e imposta come cartella da pubblicare `consegne/siti/bar-piacenza`. La pagina `404.html` viene
  usata in automatico.
- **Vercel**: nuovo progetto dal repository, «Root Directory» `consegne/siti/bar-piacenza`,
  «Framework Preset» Other, nessun comando di build. Anche qui `404.html` è automatica.

La cartella `tools/` e i file `.md` vengono pubblicati insieme al sito. Non danno problemi:
se preferisci non pubblicarli, copia il sito in una cartella senza quei file prima di caricarlo.

## 6. Collegare il dominio

1. Compra il dominio (per esempio `barpiacenza.it`) e aggiungilo al progetto su Netlify o Vercel.
   Il pannello mostra i record DNS da inserire presso chi ti ha venduto il dominio.
2. In `site-data.js` cambia `dominio` (senza barra finale, per esempio `'https://barpiacenza.it'`).
3. Lancia `node tools/sincronizza.mjs`: aggiorna da solo l'indirizzo principale delle pagine,
   le anteprime social, `sitemap.xml` e `robots.txt`.
4. Ripubblica, poi registra il sito su Google Search Console e invia `sitemap.xml`.

## 7. Il QR del menu per i tavoli

1. Usa l'indirizzo definitivo del menu: `https://<dominio>/menu.html`.
2. Genera il QR con un generatore qualsiasi che non usi link di reindirizzamento a pagamento
   (il QR deve puntare direttamente al tuo dominio, così non scade mai). Livello di correzione «M».
3. Stampalo grande almeno 3 × 3 cm, con la scritta «Il menu» e l'indirizzo breve sotto.
4. Per un tavolo dell'aperitivo puoi puntare direttamente a una categoria:
   `menu.html#aperitivo`, `#cocktail`, `#vini-birre`.
5. Prova il QR con almeno un iPhone e un Android, con la luce del locale, prima di stamparne tanti.

## 8. Controlli prima di andare online

```bash
node tools/controlla.mjs     # dati allineati, file, immagini, titoli, parole vietate, pesi, validatore, prove
node tools/test-orari.mjs    # 53 prove dello stato aperto/chiuso con date simulate
node tools/schermate.mjs     # schermate in tools/out/schermate + errori in console e scroll orizzontale
```

Poi una corsa di Lighthouse (in Chrome: Strumenti per sviluppatori › Lighthouse › Mobile) sulla home
e sul menu, già pubblicati.

## 9. Privacy: cosa cambia se aggiungete servizi

Oggi il sito non usa cookie, non fa statistiche e non carica servizi esterni da solo. La mappa
di Google si carica solo dopo un clic esplicito. Per questo non serve il banner dei cookie.
**Se in futuro aggiungete statistiche (es. Google Analytics), una mappa sempre visibile, video
di YouTube o post di Instagram incorporati, serve il consenso preventivo**: un banner che blocca
quei servizi finché il visitatore non dice di sì. Va aggiornata anche `privacy.html`, che oggi
è una bozza da far validare a un consulente.

## 10. Gli strumenti in `tools/`

| File | A cosa serve |
|---|---|
| `sincronizza.mjs` | Riscrive le parti statiche delle pagine partendo da `site-data.js` (`--controlla` per controllare senza scrivere). |
| `controlla.mjs` | Il controllo completo prima di consegnare. |
| `test-orari.mjs` | Le prove della logica degli orari. |
| `schermate.mjs` | Schermate e controlli nel browser vero. |
| `immagini.mjs` | Converte foto vere o tavole in AVIF, WebP e JPG; genera la trama del marmo. |
| `icone.mjs` | Favicon, icone per il telefono, anteprima `og-image.jpg`. |
| `illustrazioni.mjs` | Disegna le tavole illustrate provvisorie. |
| `insegna.mjs` | Ridisegna il marchio (l'insegna) dai contorni di Bodoni Moda. |
| `parti/` | Pezzi comuni a tutte le pagine: piè di pagina, barra azioni, icone, marchio. |
