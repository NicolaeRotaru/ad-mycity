---
tipo: quaderno-memoria
reparto: builder-automazioni
---

# 🧠 Quaderno di builder-automazioni
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- (ancora vuoto: il primo lavoro lascerà qui la prima lezione)

2026-06-24 · Costruita Marketing Autopilot · scheduler+5 publisher modulari in dry-run, 2 workflow n8n, doc AUTOPILOT.md · 6 voci calendario di esempio · lezione: riusare il pattern AZIONI_LIVE/dry-run di esegui-azione.mjs e far rispettare il colore 🔴 (accoda, non pubblica) anche in LIVE rende la macchina sicura by-design · #autopilot #n8n #publishers
2026-06-24 · Costruita Content Factory (grafiche VERE) · render.mjs+reel.mjs+index.mjs+4 template HTML brandizzati+3 connettori AI dry-run · generati 4 PNG (1080x1350/1920) + 1 reel .webm 16s per S1, verificati con `file` · lezione: Playwright è CommonJS (import pkg from .../index.js; const {chromium}=pkg) e va lanciato con /opt/node22/bin/node; il video reale possibile a €0 è .webm (no ffmpeg/imagemagick) → dichiararlo; riusare un solo browser per la batch PNG è molto più veloce; iniettare i colori brand nel :root via replace tiene un solo punto di verità (brand.mjs) · #content-factory #playwright #png #webm #brand
