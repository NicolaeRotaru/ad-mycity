---
tipo: documentazione strumento
strumento: Content Factory (fabbrica di contenuti grafici)
reparto: builder-automazioni
data: 2026-06-24
stato: FUNZIONANTE — produce PNG veri + reel .webm in locale, a costo €0
colore: 🟢 (generazione locale) · le chiavi AI per i contenuti pro = 🟡/🔴 (firma Nicola)
---

# 🏭 Content Factory — la mano che genera CONTENUTI GRAFICI veri

La Content Factory trasforma le voci del calendario editoriale in **immagini PNG
pronte da postare** e **reel video (.webm)** — non solo testi. Tutto **in locale**,
**a costo €0**, senza dipendere da servizi esterni.

## Cosa produce OGGI (senza nessuna chiave, €0)
- **Post PNG brandizzati**, un template per pilastro editoriale, nei formati:
  - `feed` 1080×1080 (quadrato)
  - `portrait` 1080×1350 (4:5, IG feed verticale)
  - `story` 1080×1920 (9:16, storie / cover reel)
- **Reel .webm** animato 9:16 (~16s): sequenza di "schede" con testo che entra/esce,
  brand fisso in basso. Registrato da Chromium via Playwright.
- Tutto brandizzato coi **colori reali** di `creativi/brand.mjs` (terracotta, panna,
  senape/bronzo, oliva, bordeaux, inchiostro) e col timbro civico 🐎. Niente
  giallo-Glovo / arancio-Amazon / blu-tech.

> ⚠️ **Nota tecnica onesta:** sull'ambiente **non c'è ffmpeg né imagemagick**. Il
> formato video reale producibile oggi è **.webm** (codec VP8/VP9, registrato da
> Chromium). Va benissimo per anteprime e per il web; per pubblicare su IG/TikTok
> (che vogliono MP4 H.264) serve una conversione esterna o un provider video AI
> (vedi sotto). Il .webm è comunque un **video vero e valido**.

## I 4 template (un pilastro = un template)
| Pilastro | Quando | Template | Stile |
|---|---|---|---|
| `storia-bottega` | LUN | `templates/storia-bottega.html` | banda terracotta + titolo bordeaux su panna |
| `consiglio-mercoledi` | MER | `templates/consiglio-mercoledi.html` | scheda-ricetta, cornice oliva, badge |
| `ordina-weekend` | VEN | `templates/ordina-weekend.html` | fondo terracotta pieno, alto impatto (storie) |
| `prova-sociale` | DOM | `templates/prova-sociale.html` | manifesto civico su fondo inchiostro + accento bronzo |

Segnaposto in ogni template: `{{kicker}}` `{{titolo}}` `{{testo}}` `{{cta}}` `{{handle}}`.
I colori vengono iniettati dal motore da `brand.mjs` (un solo punto di verità).

## I file dello strumento
```
cervello/content-factory/
├── render.mjs              # motore: voce -> PNG (sceglie template, inietta brand)
├── reel.mjs               # genera reel .webm 9:16 (fallback storyboard PNG)
├── index.mjs             # orchestratore: legge il calendario, genera tutta la settimana
├── calendario-grafico.json  # mappa i testi reali del calendario in "voci grafiche"
├── templates/            # 4 template HTML/CSS brandizzati
└── ai/                   # connettori AI in DRY-RUN (skeleton, per i contenuti pro)
    ├── gemini-image.mjs   # immagini fotorealistiche  (serve GEMINI_API_KEY)
    ├── canva.mjs          # design da Brand Template   (serve CANVA_TOKEN)
    └── ai-video.mjs       # video pro MP4              (serve RUNWAY_API_KEY / KLING_API_KEY / PIKA_API_KEY)
```

## Come si usa (comandi)
```bash
# genera TUTTI i contenuti grafici della Settimana 1 (4 PNG + 1 reel)
node cervello/content-factory/index.mjs --settimana 1

# solo i PNG, niente reel
node cervello/content-factory/index.mjs --settimana 1 --no-reel

# solo il reel
node cervello/content-factory/index.mjs --settimana 1 --solo-reel

# render di una singola grafica di prova
node cervello/content-factory/render.mjs storia-bottega portrait /tmp/test.png

# reel di prova
node cervello/content-factory/reel.mjs creativi/output/social
```
Output in **`creativi/output/social/`**.

> Su questo ambiente l'eseguibile node giusto è `/opt/node22/bin/node` (Playwright è
> installato lì). In locale su Windows/Mac basta `node` se Playwright è nel PATH.

## File di esempio già generati (Settimana 1, testi reali dal calendario)
Generati e verificati con `file` il 2026-06-24:
- `creativi/output/social/S1-storia-bottega-portrait.png` (1080×1350) — LUN
- `creativi/output/social/S1-consiglio-mercoledi-portrait.png` (1080×1350) — MER
- `creativi/output/social/S1-ordina-weekend-story.png` (1080×1920) — VEN
- `creativi/output/social/S1-prova-sociale-portrait.png` (1080×1350) — DOM
- `creativi/output/social/S1-reel-lancio.webm` (9:16, ~16s) — reel di lancio

I testi sono le versioni-grafica (brevi) dei post reali di
`consegne/content/CALENDARIO-4-SETTIMANE.md`. La **caption integrale** + hashtag
resta nel `.md`: la grafica accompagna, non sostituisce, la caption.

## Per aggiungere settimane / cambiare testi
Modifica `cervello/content-factory/calendario-grafico.json` (è un file dati): aggiungi
una chiave `"2"`, `"3"`, `"4"` in `settimane` e in `reel`, coi testi sintetizzati per
la grafica. Poi `--settimana 2`, ecc.

## Cosa serve per i contenuti AI / Canva / video PRO (🟡/🔴 — firma Nicola)
I connettori in `ai/` sono **scheletri in DRY-RUN**: oggi stampano cosa
genererebbero, non chiamano nulla e non costano nulla. Per attivarli serve da Nicola:

| Connettore | Cosa sblocca | Chiave da fornire | Note |
|---|---|---|---|
| `ai/gemini-image.mjs` | foto-prodotto / scene di bottega fotorealistiche (come sfondo dietro i template) | `GEMINI_API_KEY` (Google AI Studio) | costo per immagine; modello Imagen/Gemini |
| `ai/canva.mjs` | design "pro" da Brand Template Canva con autofill | `CANVA_TOKEN` (OAuth Canva Connect) + id del Brand Template MyCity | layout più ricchi delle nostre HTML |
| `ai/ai-video.mjs` | reel MP4 cinematic (mani che affettano, alba sul Duomo) | `RUNWAY_API_KEY` **o** `KLING_API_KEY` **o** `PIKA_API_KEY` | scegliere 1 provider; costo per clip; risolve anche il limite MP4 |

**Regole di sicurezza:** le chiavi vanno SOLO in variabili d'ambiente (mai nel codice,
mai nei messaggi, mai committate). I connettori leggono la chiave da `process.env` e
restano in DRY-RUN finché non la trovano. L'implementazione reale dentro i connettori
è una **bozza** da rifinire/testare col senior **tech** quando la chiave è collegata.

## Effetto atteso sui KPI
- Azzera il collo di bottiglia "grafiche" del calendario editoriale: 4 post + 1 reel
  a settimana generati in <1 minuto, a €0, invece di attesa designer/Canva manuale.
- Abilita la pubblicazione costante (cadenza LUN/MER/VEN/DOM) → più reach organica.

## Limiti dichiarati
- Niente foto reali: i template sono tipografici (testo su colore-brand). Per foto vere
  servono scatti del negozio o il connettore `gemini-image` (con chiave).
- Il video è `.webm`: per IG/TikTok serve conversione MP4 (ffmpeg esterno) o `ai-video`.
- I segnaposto `[Garetti: __]` / `[MyCity: __]` vanno riempiti coi dati VERI prima di
  pubblicare, e la pubblicazione resta **🔴** (ok Nicola + ok del negoziante per nome/foto).

> PASSO-A @content-social (testi/caption) · @designer (rifinitura visiva se serve) ·
> @AD (pubblicazione = 🔴, da accodare) · RIVEDI @finanza (sostenibilità promo "primi 50 gratis").
