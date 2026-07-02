---
data: 2026-07-02 22:20
tipo: auto-analisi
fonte: AD digitale (cervello/auto-analisi.md)
---

# 🔬 AUTO-ANALISI — Cancello di serietà

## Voto di fiducia: **83/100** ▼ (da 84 alle 18:21)

**Perché ▼:** giro serale/notte onesto e ben eseguito — ha colto correttamente il **fatto nuovo che conta** (finestra cena 19–21 passata, **#16 non eseguito**, 3ª finestra saltata oggi) e ha **riprogrammato #16/#20 a mattina 3/7** accorpandolo al payout-test, invece di rincorrere un'altra finestra a vuoto. Il **−1** riflette che è l'ennesimo giro **senza movimento della North Star** (business fermo dal 24/6, stallo **~206h**): non un errore, un plateau. Grounding pulito: 7 numeri **LIVE via delta-gate REST 22:20** (`corrente`==`ultimo_pieno`), nessun numero inventato; PQ confermato, zombie = ordine PQ, nessuna entità nuova, Casa Linda demo esclusa, Garetti resta scelta_ragionata non azionata.

**Punti ciechi dichiarati:** `verifica-automazione`/`sonda-volano`/`node` non eseguibili live in sessione (giro.sh li ha girati 22:20); esecuzione #16 non confermabile da qui (ordine ancora 24/6); MCP cieco 1 giro (REST copre i 7 numeri); **PostHog cieco 3 giri (401)**; Stripe non a burn (runway N/D); web live non ricontrollato in notturna.

---

## Errori per gravità

*Nessun errore intercettato in questo giro.* (Segnale operativo, non errore: 3 finestre saltate oggi sulla stessa azione manuale → lezione «una sola finestra a bassa frizione», applicata riprogrammando a mattina 3/7.)

---

## Domande per Nicola

1. **Alta:** #16 deciso (esegui), cena saltata: **domani mattina 3/7** tap link WhatsApp #20 (slot mattina) → #21 → #22 → «consegna fatta», accorpato al payout-test?
2. **Alta:** R1 — revoca il PAT GitHub (unica remediation del segreto in storia git).
3. **Media:** R2 — ok a merge+deploy fix cantiere (branch machine-analysis)? · SQL 107 → «fatto sql 107».

---

## Entità verificate (registro-realta.json)

| Entità | Stato | Fonte |
|--------|-------|-------|
| Pane Quotidiano | confermato | REST live 22:20 (delta-gate) · cena saltata, #16 riprogrammato |
| Casa Linda | demo | UUID seed — esclusa |
| Antica Salumeria Garetti | scelta_ragionata | campo-aperto-faro.md (prospect, 0 ordini) |
| Buyer ordine (348 642 1766) | confermato | REST orders.delivery_phone |

---

## Salute macchina

- REST marketplace: ✅ (7 numeri live 22:20) · Automazione: ✅ ultimo verde (sync commit 21:56/22:03)
- Delta-gate (AR-019) + chiusura-loop (AR-009): ✅ vivi e persistono su disco
- Loop business: 🔴 (0 consegnati; #16 deciso ma 3 finestre saltate oggi)
- Sensori: REST ok · Stripe ok nel ledger (non a burn) · MCP cieco 1 giro · **PostHog cieco 3 giri (401)** · Resend ok
- Chiusura-loop: 38 vivi · 5 fermi (ad, direttore-creativo, marketing, qa-designer, relazioni-istituzionali) · 3 vuoti

---

*Prossimo giro (mattina 3/7): verificare progresso #20–#22 e aggiornare North Star (0→1 se consegnato); ricontrollare web live (meteo, status); tentare ripristino key PostHog.*
