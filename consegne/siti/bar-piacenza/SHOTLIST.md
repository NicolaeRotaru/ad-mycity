# Bar Piacenza — shotlist per foto e video

**In parole semplici.** Questo è il brief per il fotografo e il videomaker. Il sito ha 14 spazi per
le immagini e uno per il video. Oggi li occupano illustrazioni provvisorie, disegnate nello stile
del sito. Ogni riga qui sotto dice cosa fotografare, come e a che ora.

**Cosa cambia per te.** Con le foto vere il sito smette di essere una bozza e diventa il ritratto
del bar. È la parte che mostra di più il lavoro dello studio.

**Cosa devi fare.** Una mezza giornata di riprese, meglio in due momenti: mattina (7:30–9:30)
e aperitivo (18:00–19:30). Salva i file con il nome della prima colonna dentro `materiale/` e
lancia `node tools/immagini.mjs`.

**Cosa non ho verificato.** Non conosco il locale vero: soggetti e inquadrature vanno adattati a
quello che c'è davvero (dehors, macchina del caffè, bancone, insegna).

---

## Regole per tutte le foto

- **Stile**: taglio editoriale, luce calda ma naturale, dettagli veri: mani, tazzine, bicchieri,
  bancone. Niente stock patinato, niente persone in posa.
- **Luce**: quella del locale più la finestra. Niente flash diretto. Bilanciamento del bianco caldo
  ma non giallo, intorno a 4.000–4.500 K.
- **Colori del sito**: verde bottiglia, marmo chiaro, ottone e un tocco di rosso bitter. Se il bar
  ha questi materiali, mettili in scena; non vanno aggiunti oggetti finti.
- **Persone**: nessun volto riconoscibile senza liberatoria firmata. Mani e figure di spalle vanno
  bene. Niente minori.
- **Formato di consegna**: JPG o TIFF alla risoluzione piena, profilo sRGB, senza filtri pesanti.
  Lo strumento taglia al rapporto giusto, centrando il soggetto: lascia un po' di aria intorno.
- **Orientamento**: verticale per i rapporti 4:5, quadrato per 1:1, orizzontale per 3:2.

## Gli spazi del sito

| File (in `materiale/`) | Dove sul sito | Soggetto | Inquadratura | Rapporto | Risoluzione minima | Momento e luce |
|---|---|---|---|---|---|---|
| `bancone-mattino` | Hero, primo schermo: **è la foto più importante** | Il bancone in marmo con l'espresso appena servito, il bicchiere d'acqua, una brioche; dietro, sfocata, la macchina del caffè | Frontale, ad altezza del bancone, teleobiettivo corto (85 mm), sfondo sfocato | 4:5 verticale | 1600 × 2000 | Mattina 7:30–9:00, luce dalla vetrina laterale |
| `sala` | «Il bar della città», foto grande | Il locale intero: bancone, mensole con le bottiglie, sgabelli, pavimento | Frontale e simmetrica, grandangolo moderato (28–35 mm), linee dritte | 3:2 orizzontale | 1600 × 1067 | Mattina presto, locale vuoto e luci accese |
| `tazzine` | «Il bar della città», foto piccola | Le tazzine impilate sullo scaldatazze della macchina | Frontale, ravvicinata | 4:5 verticale | 1600 × 2000 | Qualsiasi ora, luce calda |
| `cappuccino-brioche` | «Da provare», prodotto principale | Cappuccino con il cuore di latte e brioche sul marmo | Dall'alto (flat lay), a piombo | 1:1 | 1600 × 1600 | Mattina, luce di finestra morbida |
| `bortellina` | «Da provare» | Bortellina con coppa e salame nel piatto | Dall'alto | 1:1 | 1600 × 1600 | Mezzogiorno |
| `tagliere` | «Da provare» | Il tagliere dei tre salumi DOP piacentini con pane e chisolini | Dall'alto, il tagliere un po' ruotato | 1:1 | 1600 × 1600 | Aperitivo 18:00–19:00 |
| `spritz` | «Da provare» | Spritz al bitter con ghiaccio e arancia, olive e patatine accanto | Dall'alto | 1:1 | 1600 × 1600 | Aperitivo, luce calda della sala |
| `gutturnio` | «Da provare» | Calice di Gutturnio con la bottiglia | Dall'alto oppure 45°, bottiglia distesa o in piedi | 1:1 | 1600 × 1600 | Aperitivo |
| `insegna-sera` | Galleria | L'insegna esterna accesa con la vetrina illuminata | Frontale dalla strada, cavalletto | 4:5 verticale | 1600 × 2000 | **Ora blu**, 15–25 minuti dopo il tramonto |
| `bicchieri-aperitivo` | Galleria | Tre bicchieri dell'aperitivo su un vassoio | Dall'alto | 1:1 | 1600 × 1600 | Aperitivo |
| `palazzo-gotico` | Galleria | Il Palazzo Gotico o un dettaglio di Piazza Cavalli (i cavalli farnesiani) | Frontale, piazza vuota | 1:1 | 1600 × 1600 | Mattina presto, luce radente |
| `caffe-zucchero` | Galleria | Due espressi e le bustine di zucchero | Dall'alto | 1:1 | 1600 × 1600 | Mattina |
| `macchina-espresso` | Galleria | Il caffè che scende dal gruppo nella tazzina | Laterale e ravvicinata, tempo veloce (1/500 s) | 4:5 verticale | 1600 × 2000 | Qualsiasi ora, luce controllata |
| `listino` | Galleria | Il listino prezzi o la lavagna del giorno dietro il banco | Frontale, dritto | 4:5 verticale | 1600 × 2000 | Qualsiasi ora, niente riflessi |

Se il bar ha un dettaglio più forte di uno di questi (una vetrina storica, un dehors, una
lavagna disegnata a mano), usalo e cambia il nome del file in `site-data.js`.

## Il video dell'hero

- **Durata**: 6–10 secondi, che si ripetono senza stacco visibile: il primo e l'ultimo
  fotogramma devono essere quasi uguali.
- **Soggetto**: il rito del banco. Il caffè che scende, la tazzina posata sul piattino, una mano
  che gira il cucchiaino, il vapore. Un gesto solo, ripetuto.
- **Ripresa**: stabile, su cavalletto o gimbal, senza zoom. 50 fotogrammi al secondo, per poterla
  rallentare se serve.
- **Inquadratura**: lo spazio è **4:5 verticale**. Gira in 4K orizzontale tenendo il soggetto al
  centro, così da poter ritagliare un 4:5. Lavorato, il video sarà 1080 × 1350.
- **Persone**: nessun volto riconoscibile senza liberatoria.
- **Peso**: al massimo 3 MB per file (`hero.mp4` H.264 e `hero.webm` VP9), senza audio. I comandi
  sono nel README, al punto 4.
- **Poster**: un fotogramma fermo e nitido, `hero-poster.jpg`. Lo vede chi ha chiesto meno
  animazioni o il risparmio dati.

## Scatti utili anche per i social

Nella stessa sessione conviene raccogliere materiale per Instagram, che l'agenzia gestirà:
- verticali 9:16 dei gesti del banco (per le storie e i reel);
- il titolare o il personale al lavoro, se firmano la liberatoria;
- i piatti del giorno e il tagliere, da più angolazioni;
- la vetrina e l'insegna di giorno e di sera.
