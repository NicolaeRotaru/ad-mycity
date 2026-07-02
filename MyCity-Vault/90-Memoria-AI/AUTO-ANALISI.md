---
data: 2026-07-02 10:19
tipo: auto-analisi
fonte: AD digitale (cervello/auto-analisi.md)
---

# 🔬 AUTO-ANALISI — Cancello di serietà

## Voto di fiducia: **88/100** ▼ (da 89 alle 08:36)

**Perché ▼:** KPI live REST coerenti (+1,8h stallo prevedibile); automazione VPS tutto verde 10:19; meteo verificato live; nessun errore grounding entità/numeri. Malus -1: **ok 16 approvato ma DB invariato** — firma ≠ esecuzione (L-0702-45).

**Punti ciechi dichiarati:** Stripe API cieco; MCP Cursor non verificato; smoke #19 browser non eseguito qui.

---

## Errori per gravità

*Nessun errore intercettato in questo giro.*

---

## Domande per Nicola

1. **Alta:** WhatsApp #20 inviato? Buyer risponde? (finestra pranzo ~90 min)
2. **Alta:** SQL 107 → «fatto sql 107»

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
