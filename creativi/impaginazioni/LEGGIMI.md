---
tipo: leggimi
data: 2026-11-26 14:25
autore: AD digitale, chat «Canva e reel»
---

# Impaginazioni per post, storie e reel

## In parole semplici
Questa cartella serve a fare i contenuti dei social: grafiche e reel, cioè i video verticali brevi di Instagram.
Li fa da programma, senza Canva e senza CapCut, i due programmi con cui di solito si fanno a mano.
Ogni grafica è una pagina web con i colori e i caratteri del marchio. Un programma la fotografa e ne fa un'immagine.
Per il reel la fotografa 450 volte, una per fotogramma, e la monta con una musica scritta da programma.
Esempio: il 26/11 è nata la prova di Pane Quotidiano, con il reel da 15 secondi, il post e la copertina della storia.
Dentro il telefono scorrono le pagine vere del negozio sul sito. Nicola l'ha vista e alle 14:19 ha scritto «Ok salva».
Un solo comando rifà i tre file da capo in circa 40 secondi.

## Cosa cambia per te
- La prova di Pane Quotidiano non si perde più insieme al contenitore della sessione. I tre file stanno nella cartella del negozio, accanto a questa.
- Per un contenuto nuovo si cambiano i testi, le schermate e i tempi, poi si rilancia il comando. Non costa niente: nessun abbonamento e nessuna API a pagamento.

## Cosa devi fare
Niente. Questa cartella non pubblica niente: ogni post vero esce solo col tuo ok, come sempre.

## Cosa non ho verificato
- **La musica non l'ho ascoltata.** Da qui non sento l'audio. Ho misurato solo il volume: −14,4 LUFS, nella norma di Instagram.
- **Le schermate sono del 7/11, fatte di sera.** Nella scheda del kefir si legge «Il negozio è chiuso ora, riapre alle 09:00». I prezzi (pesto 5,00 €, kefir 2,05 €) vanno ricontrollati sul sito il giorno dell'uscita.
- **Nel telefono le schermate sono un po' morbide.** Sono larghe 390 punti e lo schermo del telefono ne mostra 600: le ingrandisco di una volta e mezza. Schermate nuove ad alta risoluzione le renderebbero nitide.
- **Fuori dai contenitori cloud non l'ho provata.** Serve Playwright col suo Chromium, ffmpeg e Python con numpy: qui c'erano già.

---

## Dettagli tecnici
**Il comando.** `bash creativi/impaginazioni/crea.sh`. Installa i due caratteri al primo giro, poi scrive in `output/`
(ignorata da git): `post-1080x1350.png`, `reel-15s.mp4`, `storia-copertina-1080x1920.jpg`.
Prova del 26/11 alle 14:20: lanciato da questa cartella, ha rifatto i tre file della prova identici byte per byte
a quelli in `creativi/pane-quotidiano/2026-11-26-prova/` (controllo con `cmp`).

**I file.**
| File | Cosa fa |
|---|---|
| `common.css` | palette di `creativi/brand.mjs`, Fraunces e Inter da `@fontsource`, il telefono disegnato in CSS, la firma del marchio |
| `post.html` | il post 1080×1350: titolo, tre passi, prezzo della consegna, telefono, firma |
| `reel.html` | il reel 1080×1920: cinque scene e la funzione `window.render(t)`, che mette ogni pezzo al suo posto al secondo `t` |
| `render.mjs` | apre le pagine con Playwright e salva l'immagine del post o i 450 fotogrammi del reel |
| `musica.py` | la base originale: 96 battiti al minuto, piano elettrico, basso, cassa, shaker, fruscii sui cambi scena. Il seme fisso la rende uguale a ogni giro |
| `crea.sh` | fotogrammi + musica → MP4 H.264 a 30 fps con audio a −14 LUFS, poi la copertina presa a 2,2 s |
| `assets/` | le schermate di `consegne/accoglienza-negozi/2026-11-07-pane-quotidiano/foto/` con la barra in basso tolta (righe 787-843), e la barra stessa in `nav.png`, rimessa fissa sotto lo schermo |

**Per un contenuto nuovo.**
- I testi stanno nell'HTML. I tempi stanno in `window.render(t)`, in secondi: ogni pezzo ha il suo intervallo di entrata e di uscita.
- Lo scorrimento delle schermate usa i pixel dello screenshot largo 390. `K = 600/390` li porta sullo schermo del telefono.
- Il reel resta di 15 secondi finché non si cambia `T` in `render.mjs` e la durata in `musica.py`.
- Prima di consegnare: `CHECKLIST-BRAND.md` (colori, caratteri, una idea sola, firma) e `ONESTA-RULES.md` (nessun numero senza fonte, nessuna foto inventata).
- Nel reel il testo resta fra 260 e 1580 pixel dall'alto: sopra e sotto lo coprono i pulsanti di Instagram e TikTok.

**Perché Playwright non è in `package.json`.** I contenitori cloud hanno già Playwright col suo Chromium in
`/opt/pw-browsers`. Una seconda copia installata qui non lo troverebbe. Su un'altra macchina: `npm i playwright` e
`npx playwright install chromium`.
