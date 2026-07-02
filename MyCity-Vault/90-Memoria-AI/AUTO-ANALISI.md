---
data: 2026-07-02 17:21
tipo: auto-analisi
fonte: AD digitale (cervello/auto-analisi.md)
---

# 🔬 AUTO-ANALISI — Cancello di serietà

## Voto di fiducia: **82/100** ▼ (da 83 alle 17:01)

**Perché ▼:** passaggio **delta a rendimento basso** — il giro è ripartito a 12 min dal precedente (17:01) con UNA sola novità reale (decisione binaria #16 RISOLTA alle 17:09 → Scelta A: esegui, cena 19–21), già catturata in STATO/ultimo-briefing. Dati live ancora gated (MCP + `node`): passaggio onesto (timestamp + snapshot + delta «cosa è cambiato», zero numeri nuovi, stallo ~199h dall'ancora 24/6). Malus −1 per la **dispersione ricorrente**: è il caso che il delta-gate **AR-019** (in-corso) dovrebbe assorbire (3ª occorrenza, vedi L-2026-0702-48). Nessun errore di grounding (PQ confermato; zombie = ordine PQ; nessuna entità nuova; Casa Linda resta demo esclusa).

**Punti ciechi dichiarati:** 7 numeri live non ri-pullati (MCP + node gated); Stripe/PostHog/Resend non configurati; automazione non ri-verificata live in sessione (sync commit 17:00/17:12 indicano VPS attivo); esecuzione #16 non confermabile via DB da qui.

---

## Errori per gravità

*Nessun errore intercettato in questo giro.*

---

## Domande per Nicola

1. **Alta:** #16 deciso (esegui): stasera 19–21 tap link WhatsApp #20 → #21 → #22 → «consegna fatta»?
2. **Alta:** R1 — revoca il PAT GitHub (unica remediation del segreto in storia git)
3. **Media:** SQL 107 → «fatto sql 107»

---

## Entità verificate (registro-realta.json)

| Entità | Stato | Fonte |
|--------|-------|-------|
| Pane Quotidiano | confermato | REST live 10:19 · ok 16 approvato |
| Casa Linda | demo | UUID seed — esclusa |
| Antica Salumeria Garetti | scelta_ragionata | campo-aperto-faro.md |
| Buyer ordine (348 642 1766) | confermato | REST orders.delivery_phone |

---

## Salute macchina

- REST marketplace: ✅ · Automazione: ✅ tutto verde · Volano architettura: ✅ (tasso 0,70)
- Loop business: 🔴 (0 consegnati nonostante ok 16)
- Sensori: REST ok · Stripe cieco · MCP non verificato

---

*Prossimo giro: verificare progresso #20–#22 e aggiornare 7 numeri post-consegna.*
