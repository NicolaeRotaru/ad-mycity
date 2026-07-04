---
tipo: auto-radiografia (archivio)
data: 2026-07-03 14:30
voto_salute: 57
tipo_run: completa (12/12 dimensioni + pre-mortem + benchmark)
workflow: .claude/workflows/auto-radiografia.js — 26/26 agenti done (ripreso dopo il limite di sessione del primo run)
colore: 🟢 analisi · 🟡 fix (firma Nicola)
---

# 🩻 Auto-radiografia della macchina — archivio 3/7/2026 (completa)

Report umano completo: `MyCity-Vault/90-Memoria-AI/RADIOGRAFIA-MACCHINA.md`.
Dati machine-readable: `auto-coscienza/auto-radiografia.json` + `cantiere-difetti.json`.

## Sintesi
Radiografia profonda su comando di Nicola, **12/12 dimensioni** verificate avversarialmente + pre-mortem (6) + benchmark (10). **74 difetti confermati** (1 bloccante, 39 gravi, 34 minori). Voto 57 = media dei 12 pilastri (era 72 il 28/6, che però trovò solo 3 difetti). Cantiere: 69 aperti / 9 chiusi.

## Voti per dimensione
coerenza-agenti 71 · vettori-installati 75 · salute-sensori-dati 62 · integrità-memoria 62 · chiusura-volano 57 · cadenza-esecuzione 57 · calibrazione-onesta 61 · copertura-cieca 50 · **guardrail-semaforo 36 (CRITICO)** · allineamento-northstar 67 · efficienza-costo 44 · rischio-sicurezza-se 41.

## 🔴 Bloccante
**AR-072 — L'autopilot pubblica da solo i 🟡 (post pubblici sul brand) in LIVE** (`autopilot.mjs:120`, gate blocca solo `rosso`). Contro «pubblicare = 🔴». Fix: gate fail-closed (solo `verde` passa).

## Gravi ad impatto ALTO (estratto)
- Sicurezza: scanner-segreti non riconosce `sbp_` (AR-096); MCP memoria R+W senza `--read-only` → DROP memoria (AR-098); merge `--theirs` cieco → doppio invio (AR-099).
- Sensori: nessun uptime del sito (AR-084); funnel/conversione senza sensore (AR-087); puntualità consegne senza sensore (AR-088); sensore-cassa sordo (AR-035); cecità dati muta (AR-037).
- Volano/calibrazione: autonomia guadagnata coi sensori ciechi (AR-061); esito senza fonte auto-alimenta il punteggio (AR-062); strato 7 che non impara (AR-029).
- Allineamento: silo allocazione 13 asset su Garetti vs 1-2 confermati, exit scartato da giro.sh (AR-081); North Star solo prosa (AR-082); faro contraddittorio (AR-044).
- Costo: router economico codice morto (AR-089); budget token cieco (AR-090); metabolizzazione raddoppia il costo (AR-091).

## Pre-mortem (6): memoria corrotta pubblicata · destinatario/importo sbagliato · doppia esecuzione · pubblicazione automatica non voluta · kill-switch fail-open · loop che brucia budget.

## Benchmark — divari ALTI: contenuti (0 asset pubblicati) · onboarding (0 negozi a incasso) · funnel (1 ordine fermo) · CRM (0 flow attivi) · consegne (0 consegne reali). Il gap coi migliori non è di sofisticazione, è di FARE la prima cosa vera.

## Domande per Nicola (4): faro (Casa Linda vs Pane Quotidiano, AR-044) · STAMPO non validato (AR-032) · PostHog instrumentato? (AR-040) · token `sbp_` unico super-privilegiato (AR-097).

## Pannello
`consegne/design/2026-07-03-radiografia-pannello.md` — 30 bug, **1 bloccante** («Annulla» → doppia esecuzione azione reale), 11 gravi.
