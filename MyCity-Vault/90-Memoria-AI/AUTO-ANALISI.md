---
data: 2026-07-02 17:01
tipo: auto-analisi
fonte: AD digitale (cervello/auto-analisi.md)
---

# 🔬 AUTO-ANALISI — Cancello di serietà

## Voto di fiducia: **83/100** ▼ (da 84 alle 16:53)

**Perché ▼:** passaggio **delta a rendimento nullo** — il giro è ripartito a soli 8 min dal precedente (16:53) senza nulla di materiale cambiato, con dati live ancora gated (MCP + `node`). Ho fatto un passaggio minimo e onesto (timestamp + snapshot, zero numeri nuovi, stallo ~198,6h dall'ancora 24/6). Malus −1 per la **dispersione**: è esattamente ciò che il delta-gate **AR-019** (in-corso) dovrebbe assorbire. Nessun errore di grounding (PQ confermato; nessuna entità nuova).

**Punti ciechi dichiarati:** 7 numeri live non ri-pullati (MCP + node gated); Stripe/PostHog/Resend non configurati; automazione non ri-verificata live in sessione; esecuzione #16 non confermabile via DB da qui.

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
