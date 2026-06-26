---
tipo: briefing
data: 2026-06-24
giro: piano editoriale + esecuzione marketing + autopilot
fonte: AD digitale (squadra al completo)
---

# 🗞️ Briefing — Piano editoriale & macchina di marketing autonoma

## Situazione (richiesta di Nicola)
"Crea il piano editoriale, esegui TUTTO (contenuti veri, copy, pubblicazione su ogni piattaforma),
e usa il **Costruttore** per costruirti le funzionalità che ti servono per fare da solo il marketing."

Contesto reale: prodotto ~90% pronto, **~1 negozio (Garetti), 0 ordini, 0 clienti** → il collo di
bottiglia è la **domanda/distribuzione**, non il prodotto. Strategia: organico-first, supply-first,
cluster Calzolai–Duomo–Chiapponi, lancio concierge.

## Cosa è stato fatto (🟢, tutto in repo)
**1. Piano + contenuti + copy (consegne/):**
- `marketing/PIANO-EDITORIALE.md` — piano 4 settimane (dal 30/06), 8 canali, 5 pilastri, KPI, calendario LUN/MER/VEN/DOM.
- `content/CALENDARIO-4-SETTIMANE.md` — 16 post pronti + bio IG/FB + 10 idee storia-bottega.
- `crm/FLUSSI-LIFECYCLE.md` — 7 flussi email/messaggi (welcome, concierge, win-back, referral, gift, carrello, riordino).
- `pr/KIT-STAMPA-LANCIO.md` — comunicato + pitch + 5 giornalisti reali + 6 momenti notiziabili.
- `video/SCRIPT-REEL.md` — 8 reel 9:16 (hook, voiceover, sottotitoli).
- `seo/PACCHETTO-SEO-LOCALE.md` — keyword, GBP, schema.org (campo aperto: nessuno copre "botteghe a domicilio").
- `design/PACCHETTO-VISIVO-LANCIO.md` — template social + materiali fisici; QR+locandina Garetti generati.

**2. La macchina che pubblica da sola (cervello/, dry-run):**
- `cervello/autopilot.mjs` — scheduler che legge il calendario, sceglie il publisher, rispetta 🟢🟡🔴.
- `cervello/publishers/` — FB, IG, Google Business, Email (Resend), Telegram.
- `consegne/automazioni/AUTOPILOT.md` + 2 workflow n8n.

**3. La fabbrica di contenuti VERI (cervello/content-factory/):**
- `render.mjs` (HTML→PNG via Playwright/Chromium) + 4 template brand + `reel.mjs` (.webm) + connettori AI (Gemini/Canva/video, dry-run).
- **Eseguita**: 4 post PNG + 1 reel S1 generati in `creativi/output/social/` (artefatti rigenerabili, fuori git).
- `consegne/automazioni/CONTENT-FACTORY.md`.

**4. Costruttore → DNA v1.1:** capacità "Marketing Autopilot + Content Factory" innestata nel genoma
(opt-in, additiva) → riusabile da ogni Organismo futuro. Generatore verde.

## Cosa serve da Nicola (🔴/collegamento mani) — perché niente è ancora pubblicato
Tutto è in **DRY-RUN**: nessun contenuto parte finché non si collegano le chiavi (in env, mai in chat).
Ordine consigliato (starter pack gratis): **Telegram → n8n → Gemini → Resend → Google Business → Meta (FB/IG)**.
Per i contenuti AI/Canva/video PRO: `GEMINI_API_KEY`, `CANVA_TOKEN`, `RUNWAY_API_KEY`/`KLING_API_KEY`.
Restano 🔴 con firma: email a clienti reali, invii stampa, spese (tipografia/ads), incentivi in denaro.
Validazioni: dialetto piacentino (madrelingua), consenso GDPR email (legale-privacy), ok di Garetti su volto/nome/foto.

## Azioni proposte (prossimo passo a maggior ritorno)
1. Collegare lo **starter pack gratis** (Telegram + n8n + Gemini + Resend) → l'autopilot passa da dry-run a reale sui canali a costo ~0.
2. Dare l'ok a Garetti (volto/nome) → sblocca i contenuti "storia di bottega" coi dati veri.
3. Firmare l'invio del **comunicato a Libertà** (esclusiva) → accende la PR, priorità #1 di reach.
