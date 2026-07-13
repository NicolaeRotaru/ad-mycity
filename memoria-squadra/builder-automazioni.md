---
tipo: quaderno-memoria
reparto: builder-automazioni
---

# 🧠 Quaderno di builder-automazioni
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-13 12:24 · Chat Nicola plugin worker — 3 skill confermati (grilling/ponytail/caveman) dopo descrizione AD · atteso: manifest+sync PR 🟡 · reale: identità verificata, caveman OFF chat Nicola, PR in attesa «confermo» · L-2026-0713-111 · #worker #plugin #token
- 2026-07-13 11:38 · PR #315 tick leggero auto-coscienza — Nicola approva aggiornamento ogni ~10 min · atteso: worker ricalcola apprendimento/miglioramento senza AI su tick · reale: script in PR #315 accoppiato a fix UI frontend-dev; benchmark pesante resta settimanale · L-2026-0713-105 · #worker #auto-coscienza #tick-leggero
- 2026-07-13 11:30 · Chat Nicola plugin GitHub worker · gap: nessun manifest/sync plugin; risparmio token già in banco-ai+routing.json · proposta manifest+sync 🟡 PR pendente lista repo · lezione L-2026-0713-104 · #worker #plugin #token
- 2026-07-05 05:09 · Piano chiudi-i-loop: notifica-approvazioni.mjs (PZ-014, richiesta Nicola) — azioni 🟡/🔴 nuove in coda → Telegram, dedup persistente, dry-run senza chiavi · 6 assi: correttezza 5, completezza 5, azionabilita 5, onesta 5, stile 5, riuso 4 · atteso parser trova le azioni in attesa reali → reale 17/17 azioni in attesa estratte dalla coda vera in dry-run · #piano-loop #telegram
- 2026-07-01 01:59 · guardrail 🔴 pre-mortem (Nicola Pannello) · implementato `guardrail-semaforo.mjs` + doppio cancello `esegui-azione.mjs` + `NICOLA_FIRMA=1` solo post-Approva in worker + autopilot solo 🟢 + gate in mani.ts/azioni.ts · self-test `verifica` 7/7 ✅ · deploy main 🟡 · lezione: ogni esecutore (worker/autopilot/n8n) deve importare guardrail centralizzato, mai filtri locali; heuristiche contenuto (payout/email esterna/stripe) forzano 🔴 · #guardrail #esegui-azione #nicola-firma #pre-mortem
- 2026-07-01 · giro web · n8n 2.0 (hardening): paradigma Save vs Publish — Save non tocca produzione, Publish spinge live; task runners abilitati by default per isolare Code node · https://docs.n8n.io/release-notes/ · lezione: automazioni MyCity (n8n + esegui-azione) devono replicare draft→publish come il dry-run 🔴 già in cervello · #n8n #publish #sicurezza
- 2026-06-24 · Costruita Marketing Autopilot · scheduler+5 publisher modulari in dry-run, 2 workflow n8n, doc AUTOPILOT.md · 6 voci calendario di esempio · lezione: riusare il pattern AZIONI_LIVE/dry-run di esegui-azione.mjs e far rispettare il colore 🔴 (accoda, non pubblica) anche in LIVE rende la macchina sicura by-design · #autopilot #n8n #publishers
2026-06-24 · Costruita Content Factory (grafiche VERE) · render.mjs+reel.mjs+index.mjs+4 template HTML brandizzati+3 connettori AI dry-run · generati 4 PNG (1080x1350/1920) + 1 reel .webm 16s per S1, verificati con `file` · lezione: Playwright è CommonJS (import pkg from .../index.js; const {chromium}=pkg) e va lanciato con /opt/node22/bin/node; il video reale possibile a €0 è .webm (no ffmpeg/imagemagick) → dichiararlo; riusare un solo browser per la batch PNG è molto più veloce; iniettare i colori brand nel :root via replace tiene un solo punto di verità (brand.mjs) · #content-factory #playwright #png #webm #brand
2026-06-30 23:32 · Inventario mani post-approvazioni Pannello · worker verificato: Telegram/Resend/n8n/notifiche tutte OFF, AZIONI_LIVE=0 → 0 inviate nonostante ~20 ok · lezione: presentare le mani a Nicola in 3 tier (starter Telegram+Resend+LIVE → social Meta via n8n → marketplace write key); distinguere azioni che richiedono chiavi da passi umani (#1-3, #9) e da prodotto (link lista d'attesa) · #mani #azioni-live #starter-pack #tier
