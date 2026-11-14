# Bar Piacenza — crediti e licenze

**In parole semplici.** Nel sito non c'è niente preso da altri senza licenza. I due caratteri
sono gratuiti anche per uso commerciale, le illustrazioni e il marchio sono fatti per questo
progetto, e non ci sono foto di archivio.

## Caratteri

| Carattere | Uso | Autori | Licenza | File |
|---|---|---|---|---|
| **Bodoni Moda** (variabile: peso e dimensione ottica) | Marchio, titoli | The Bodoni Moda Project Authors (indestructible-type) | SIL Open Font License 1.1: uso commerciale e incorporazione nel sito consentiti | `assets/fonts/bodoni-moda-latin-var.woff2` |
| **Atkinson Hyperlegible Next** (variabile: peso) | Testi, menu, interfaccia | The Atkinson Hyperlegible Next Project Authors (Braille Institute of America) | SIL Open Font License 1.1 | `assets/fonts/atkinson-hyperlegible-next-latin-var.woff2` |

I file vengono dai pacchetti `@fontsource-variable/bodoni-moda` e
`@fontsource-variable/atkinson-hyperlegible-next` (versione 5.3.0), subset latin. Il testo completo
della licenza è in `assets/fonts/OFL.txt` e va pubblicato insieme ai font.

## Marchio

Il wordmark «BAR Piacenza» (l'insegna smaltata con il cassonetto luminoso) è stato disegnato per
questo progetto. Le lettere sono i contorni di Bodoni Moda, che la licenza OFL permette di usare
in un logo. Il generatore è `tools/insegna.mjs`. Se il bar ha già un logo registrato, quello
vince: va sostituito qui e nell'insegna.

## Icone

Icone SVG disegnate per il sito, con tratto e proporzioni presi dal set open source
**Lucide** (lucide.dev). Alcuni tracciati sono derivati da Lucide, per esempio il telefono, la
mappa e il segnaposto. Lucide è distribuito con licenza ISC:

> ISC License — Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of
> Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
> Permission to use, copy, modify, and/or distribute this software for any purpose with or
> without fee is hereby granted, provided that the above copyright notice and this permission
> notice appear in all copies.

## Immagini

- **Tavole illustrate**: le 14 illustrazioni in `assets/img/` sono **segnaposto originali**,
  disegnate per questo progetto (`tools/illustrazioni.mjs`) e marcate `provvisoria: true` in
  `site-data.js`. Vanno sostituite con le foto della `SHOTLIST.md`. Il Palazzo Gotico è un
  disegno evocativo, non un rilievo fedele.
- **Trama del marmo** dello sfondo: generata dal codice (`tools/immagini.mjs`).
- **Mappa**: la facciata della mappa è un disegno schematico, non una cartina. La mappa vera è
  quella di Google e si carica solo dopo un clic.
- **Foto di archivio**: nessuna. I siti di foto gratuite non erano raggiungibili dall'ambiente
  di lavoro, quindi non è stata scaricata nessuna foto di terzi.

## Codice e dati

- Nessuna libreria o codice di terzi nel sito: HTML, CSS e JavaScript scritti per il progetto.
- Gli strumenti in `tools/` usano, solo sul computer di chi mantiene il sito: `sharp` (Apache-2.0),
  `fontkit` (MIT), `html-validate` (MIT), `playwright` (Apache-2.0).
- L'elenco dei 14 allergeni segue l'allegato II del Regolamento UE 1169/2011.
- Le metriche dei caratteri di riserva vengono da Capsize (`@capsizecss/metrics`, MIT).
