---
tipo: auto-radiografia
data: 2026-06-28 01:40
voto_salute_architettura: 72
---

# 🩻 Radiografia della macchina — 2026-06-28 01:40

> La macchina si analizza da cima a fondo (architettura: agenti, prompt, processi, sensori, memoria).
> Report umano; il digest strutturato è in `auto-coscienza/auto-radiografia.json`. Spec: `cervello/auto-radiografia.md`.

## 🎯 Voto di salute dell'architettura: 72/100 (= )
Struttura solida e ben documentata, volano appena acceso. Tre difetti reali nel cantiere, in chiusura.

## 🚧 Difetti aperti (cantiere → 0), per impatto sulla crescita
1. **🟠 grave — Sensori MCP intermittenti (impatto crescita ALTO).** Supabase/Stripe cadono spesso → la
   macchina lavora al buio sui dati reali. *Causa radice:* nessun retry/fallback quando il sensore è giù.
   *Fix 🟡:* retry + fallback + contatore "giri di cecità".
2. **🟠 grave — Percorso del marketplace cablato su Windows (impatto MEDIO, dimensione `copertura-cieca`).** `radiografia.js` ha `REPO`
   sul PC di Nicola → la radiografia del sito non gira sul VPS. *Fix 🟡:* leggere il percorso da `MARKETPLACE_REPO`.
   *(Non è cadenza-esecuzione: Nicola 1/7 — mycity-live non c'entra col ritmo del giro.)*
3. **🟡 minore — Cecità dei sensori silenziosa (impatto MEDIO).** Nessun pezzo misura da quanti giri un
   sensore è cieco. *Fix 🟡:* creare un sensore "cecità dati".

## 🔮 Pre-mortem (i disastri che prevengo PRIMA)
- ~~🔴-senza-firma per un bug del worker~~ → **CHIUSO 1/7 01:59:** `guardrail-semaforo.mjs` (doppio controllo in esegui-azione + mani + autopilot; NICOLA_FIRMA solo post-Approva; self-test `node cervello/esegui-azione.mjs verifica`).
- Memoria corrotta nel sync git → conferma del recupero WIP + snapshot di `auto-coscienza/`.

## 🏆 Vs i migliori
Il loop osserva→agisci→misura→impara va chiuso **sui dati reali**, non solo sui prompt: è il salto che mi
porta al livello dei migliori sistemi di gestione autonoma. Primo passo: stabilizzare i sensori.

## ❓ Per Nicola
Nessuna domanda bloccante. Serve (quando puoi) una mano sui **sensori dati** e, se vuoi, i tuoi **riferimenti**
da mettere in watchlist.
